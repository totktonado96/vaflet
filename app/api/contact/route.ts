import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { MAIL_TO } from "@/lib/site";

/**
 * The contact form = one email into our own mailbox, sent from the server
 * through Hostinger SMTP. The visitor's mail app never opens; Reply in the
 * inbox goes straight to them.
 *
 * Env: SMTP_HOST (smtp.hostinger.com), SMTP_PORT (465), SMTP_USER, SMTP_PASS,
 * CONTACT_TO (defaults to the mailbox the site shows).
 *
 * The in-memory rate limit is best-effort dedupe only (serverless instances
 * don't share or keep memory); the honeypot catches the dumb bots.
 */

const seen = new Map<string, number>(); // ip -> last accepted, best-effort
const WINDOW_MS = 30_000;

function line(s: unknown, max: number): string {
  return typeof s === "string" ? s.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";
}

function escape(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
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

  // a field people never see; anything in it is a bot, which gets a polite lie
  if (line(body.company, 200)) return NextResponse.json({ ok: true });

  const name = line(body.name, 120);
  const email = line(body.email, 200);
  const budget = line(body.budget, 40);
  const interests = Array.isArray(body.interests)
    ? body.interests.map((i) => line(i, 40)).filter(Boolean).slice(0, 12)
    : [];
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const to = process.env.CONTACT_TO || MAIL_TO;
  const lead = { name, email, budget, interests };
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("[contact] SMTP env missing; lead only logged:", lead);
    return NextResponse.json({ error: "desk-closed" }, { status: 503 });
  }

  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Email", email],
    ["Interested in", interests.length ? interests.join(", ") : "—"],
    ["Budget (USD)", budget || "—"],
  ];
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", "Project:", message].join("\n");
  const html = `<div style="font:15px/1.5 -apple-system,Helvetica,Arial,sans-serif;color:#000">
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:.15em;vertical-align:top">${k}</td><td style="padding:4px 0">${escape(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="margin:20px 0 6px;font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:.15em">Project</p>
<p style="margin:0;white-space:pre-wrap">${escape(message)}</p>
</div>`;

  const port = Number(SMTP_PORT) || 465;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transport.sendMail({
      from: { name: "Vaflet site", address: SMTP_USER },
      to,
      replyTo: { name, address: email },
      subject: `New project — ${name}${budget ? ` · ${budget}` : ""}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[contact] smtp send failed", (err as Error).message, lead);
    return NextResponse.json({ error: "desk-closed" }, { status: 503 });
  }

  seen.set(ip, now);
  console.log("[contact] delivered", lead);
  return NextResponse.json({ ok: true });
}
