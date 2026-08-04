import { NextResponse } from "next/server";

/**
 * Opens one conversation with the receptionist and hands the room URL back.
 *
 * Tavus bills wall-clock, so every limit that matters is set here, server-side:
 * a parked tab is the expensive failure, not an attacker. The caps below are
 * the ones Tavus enforces itself — the client is free to end sooner, never later.
 */

const MAX_SECONDS = 180;
const SILENCE_SECONDS = 40;
const EMPTY_ROOM_SECONDS = 20;

export async function POST() {
  const key = process.env.TAVUS_API_KEY;
  const persona = process.env.TAVUS_PERSONA_ID;
  const replica = process.env.TAVUS_REPLICA_ID;

  if (!key || !persona) {
    return NextResponse.json({ error: "desk-closed" }, { status: 503 });
  }

  const res = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      persona_id: persona,
      replica_id: replica,
      conversation_name: "vaflet.io front desk",
      properties: {
        max_call_duration: MAX_SECONDS,
        participant_left_timeout: EMPTY_ROOM_SECONDS,
        participant_absent_timeout: SILENCE_SECONDS,
        enable_recording: false,
        enable_closed_captions: true,
        language: "multilingual",
      },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "desk-closed" }, { status: 503 });
  }

  const data = (await res.json()) as {
    conversation_url?: string;
    conversation_id?: string;
  };

  if (!data.conversation_url) {
    return NextResponse.json({ error: "desk-closed" }, { status: 503 });
  }

  return NextResponse.json({
    url: data.conversation_url,
    id: data.conversation_id,
    seconds: MAX_SECONDS,
  });
}
