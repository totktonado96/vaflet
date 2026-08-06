import { NextResponse } from "next/server";
import { tavusAccounts } from "@/lib/reception/accounts";

/**
 * Opens one conversation with Ren and hands the room URL back.
 *
 * Tavus bills wall-clock, so every limit that matters is set here, server-side.
 * The desk is staffed from a pool of accounts: when one runs out of minutes
 * (or its single concurrent slot is busy) the next one picks up. All accounts
 * are provisioned identically by scripts/tavus-provision.mjs.
 */

const MAX_SECONDS = 180;
const SILENCE_SECONDS = 40;
const EMPTY_ROOM_SECONDS = 20;

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true; // not enabled (dev / pre-launch)
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // network hiccup reads as "can't verify" — fail closed
  }
}

export async function POST(req: Request) {
  const accounts = tavusAccounts();
  if (!accounts.length) {
    return NextResponse.json({ error: "desk-closed" }, { status: 503 });
  }

  let turnstileToken: string | undefined;
  let testMode = false;
  try {
    const body = (await req.json()) as { turnstileToken?: string; test?: boolean };
    turnstileToken = body.turnstileToken;
    testMode = body.test === true && process.env.NODE_ENV !== "production";
  } catch {
    // empty body is fine — Turnstile off, live mode
  }

  if (!(await verifyTurnstile(turnstileToken))) {
    return NextResponse.json({ error: "desk-closed" }, { status: 403 });
  }

  const hour = new Date().toLocaleString("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: "America/New_York",
  });

  for (const account of accounts) {
    try {
      const res = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: { "x-api-key": account.key, "Content-Type": "application/json" },
        body: JSON.stringify({
          persona_id: account.personaId,
          replica_id: account.replicaId,
          conversation_name: "vaflet.io showcase desk",
          conversational_context:
            `The visitor is on the Face2me case study page at vaflet.io. ` +
            `They just scrolled through the walk-up to the kiosk and pressed the call button. ` +
            `It is around ${hour} New York time.`,
          custom_greeting:
            "Hi — Ren, front desk. Well, the demo of one. You caught me on my showcase " +
            "shift, so ask me anything: what I do, what I cost. What kind of place are you running?",
          ...(testMode ? { test_mode: true } : {}),
          properties: {
            max_call_duration: MAX_SECONDS,
            participant_left_timeout: EMPTY_ROOM_SECONDS,
            participant_absent_timeout: SILENCE_SECONDS,
            enable_recording: false,
            apply_greenscreen: true,
            language: "multilingual",
          },
        }),
      });

      if (!res.ok) {
        console.warn("[reception] account skipped", account.key.slice(0, 6), res.status);
        continue; // out of minutes / busy slot — next account
      }

      const data = (await res.json()) as {
        conversation_url?: string;
        conversation_id?: string;
      };
      if (!data.conversation_url) {
        console.warn("[reception] account skipped", account.key.slice(0, 6), "no-url");
        continue;
      }

      return NextResponse.json({
        url: data.conversation_url,
        id: data.conversation_id,
        seconds: MAX_SECONDS,
      });
    } catch {
      console.warn("[reception] account skipped", account.key.slice(0, 6), "network");
      continue; // dropped call to tavus itself — next account
    }
  }

  // one deliberately vague answer for every reason the desk can't open — copy voice, not a shortcut
  return NextResponse.json({ error: "desk-closed" }, { status: 503 });
}
