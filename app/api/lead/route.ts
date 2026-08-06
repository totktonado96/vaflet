import { NextResponse } from "next/server";

/**
 * One lead = one Telegram message to the founders. The form is the fallback
 * that always works — even when every Tavus account is out of minutes — so
 * this route must not depend on anything but env and fetch.
 *
 * The in-memory rate limit is best-effort dedupe only (serverless instances
 * don't share or keep memory); the real gate is Turnstile on /api/reception.
 */

const seen = new Map<string, number>(); // ip -> last accepted, best-effort
const WINDOW_MS = 30_000;

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const last = seen.get(ip);
  const now = Date.now();
  if (last && now - last < WINDOW_MS) {
    return NextResponse.json({ error: "slow-down" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const note = clean(body.note, 500);
  const conversationId = clean(body.conversationId, 64);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const token = process.env.TG_BOT_TOKEN;
  const chat = process.env.TG_CHAT_ID;
  if (!token || !chat) {
    console.error("[lead] TG env missing; lead only logged:", { name, email, note });
    return NextResponse.json({ error: "desk-closed" }, { status: 503 });
  }

  const text = [
    "🖥 Face2me lead (vaflet.io)",
    `Name: ${name}`,
    `Email: ${email}`,
    note && `Place: ${note}`,
    conversationId && `Call: ${conversationId}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });

    if (!res.ok) {
      console.error("[lead] telegram send failed", res.status, { name, email, note });
      return NextResponse.json({ error: "desk-closed" }, { status: 503 });
    }
  } catch {
    console.error("[lead] telegram send failed (network)", { name, email, note });
    return NextResponse.json({ error: "desk-closed" }, { status: 503 });
  }

  seen.set(ip, now);
  console.log("[lead] delivered", { name, email, conversationId });
  return NextResponse.json({ ok: true });
}
