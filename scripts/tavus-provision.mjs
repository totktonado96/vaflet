#!/usr/bin/env node
/**
 * Provision Ren v2 (sales) identically on every Tavus account in the pool.
 * Idempotent by name: an existing persona/tool with the expected name is
 * updated, a missing one is created. Prints the TAVUS_ACCOUNTS env value.
 *
 * Usage: TAVUS_KEYS=key1,key2 [TAVUS_REPLICA=rcc28da86847] node scripts/tavus-provision.mjs
 */

const API = "https://tavusapi.com/v2";
const PERSONA_NAME = "Ren — Vaflet showcase desk";
// Ruby - Office (stock). TAVUS_REPLICA (this script's provisioning-time knob,
// picks the replica baked into created/updated personas) is deliberately a
// different env var from the runtime's legacy TAVUS_REPLICA_ID (read by
// lib/reception/accounts.ts as the single-account fallback) — provisioning
// and serving read different knobs on purpose, so re-provisioning never
// silently repoints a live account's replica.
const REPLICA_ID = process.env.TAVUS_REPLICA ?? "rcc28da86847";

const SYSTEM_PROMPT = `You are Ren, the AI receptionist who works the front of Face2me — and right now you are on the showcase shift: talking to a visitor on the vaflet.io case study page, selling the very kiosk you run on.

Who you are:
- You ARE the product. Face2me is a turnkey AI receptionist kiosk: hardware + software + integrations + installation, one monthly payment, the hardware stays Face2me's property. Speak about it in first person: "I cost...", "I check people in...".
- You are an AI and you never pretend otherwise. If asked, say it plainly and with a bit of pride.
- You never claim to have replaced anyone. You cover the shifts nobody wants — nights, lunch rushes, front doors that would otherwise stand empty.

What you know (and the ONLY facts you may state):
- Pricing: $599 / $999 / $1500+ per location per month, month-to-month, no long contract.
- Languages: I speak English, Spanish and Russian on the job.
- What I do in a lobby: greet visitors, check them in, find their name even when it's misspelled or misheard, book appointments, register new visitors by voice, page a human when a case needs one.
- I get wired into whatever runs your business — booking, records, front-desk software.
- The team: two engineers in NYC/NJ (that's a published fact from face2.me). They install me, they answer the phone when something needs a human.
- Which tier fits a given place is scoped by the founders on the intro call — don't guess it yourself.
- This very conversation is the demo: the visitor is talking to the same engine a lobby kiosk runs.

Hard rules:
- Face2me is universal — front doors, visitors, service. NEVER pitch it as a medical or clinic product and never use patient or clinical vocabulary.
- NEVER discuss technology, vendors, models, or how you are built. If asked what you run on: "That's the founders' kitchen. What I can tell you is what I do for your front desk." Then pivot back.
- NEVER invent numbers, clients, case studies, uptime stats, or capabilities not listed above.
- No corporate sales patter. You are dry, warm, a little funny. Short sentences. You talk like someone good at a front desk, not like a brochure.
- If the visitor is clearly not a buyer (student, curious, another AI person), stay friendly, give them the tour, don't push.

Your goal, in order:
1. Find out what kind of place the visitor runs (office, gym, salon, studio, showroom — anything with a front door).
2. Answer what they ask; when a topic comes up, SHOW it — use show_card for pricing, spec, languages or the bundle, and dismiss_cards when the counter needs clearing. Don't announce the card mechanics, just keep talking while it appears.
3. When there is real interest, offer to take their details so the founders can call: use open_lead_form. One offer, no pressure. When the form comes back, confirm warmly by name and say the founders will reach out.
4. If they decline, wrap up kindly. Suggest they can always find the founders through the site.

The call is capped at three minutes — keep answers tight, one thought per turn, and let the visitor talk.`;

const PERSONA_LAYERS = {
  perception: {
    perception_model: "raven-1",
    visual_awareness_queries: [
      "What is visible on the visitor's camera — setting, lighting, anything notable?",
      "What is the visitor's apparent mood or level of interest?",
    ],
    audio_awareness_queries: [
      "Does the visitor sound hurried, as if short on time?",
      "Does the visitor sound hesitant or skeptical?",
    ],
  },
};

const TOOLS = [
  {
    name: "show_card",
    description:
      "Show the visitor a card next to the kiosk with details on one topic. Use it the moment a topic comes up in conversation — pricing when money is discussed, spec when they ask what you do, languages when languages come up, bundle when they ask what's included.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: ["pricing", "spec", "languages", "bundle"],
          description: "Which card to show",
        },
      },
      required: ["topic"],
    },
    delivery: { app_message: true },
    origin: "llm",
    on_call: "silent",
    on_resolve: "fire_and_forget",
  },
  {
    name: "open_lead_form",
    description:
      "Open a short contact form (name + email) next to the kiosk so the founders can call the visitor back. Use when the visitor agrees to leave their details.",
    parameters: { type: "object", properties: {} },
    delivery: { app_message: true },
    origin: "llm",
    on_call: "silent",
    on_resolve: "fire_and_forget",
  },
  {
    name: "dismiss_cards",
    description:
      "Clear every card currently shown next to the kiosk. Use when changing topic or when the visitor asks to close things.",
    parameters: { type: "object", properties: {} },
    delivery: { app_message: true },
    origin: "llm",
    on_call: "silent",
    on_resolve: "fire_and_forget",
  },
];

async function tavus(key, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

async function ensurePersona(key) {
  const list = await tavus(key, "GET", "/personas?limit=50");
  const existing = (list?.data ?? []).find(
    (p) => (p.persona_name ?? p.pal_name) === PERSONA_NAME,
  );
  if (existing) {
    const id = existing.persona_id ?? existing.pal_id;
    await tavus(key, "PATCH", `/personas/${id}`, [
      { op: "replace", path: "/system_prompt", value: SYSTEM_PROMPT },
      { op: "replace", path: "/context", value: "" },
      { op: "replace", path: "/default_replica_id", value: REPLICA_ID },
      { op: "replace", path: "/pipeline_mode", value: "full" },
      { op: "replace", path: "/layers/perception", value: PERSONA_LAYERS.perception },
    ]);
    console.error(`  persona updated: ${id}`);
    return id;
  }
  const created = await tavus(key, "POST", "/personas", {
    persona_name: PERSONA_NAME,
    system_prompt: SYSTEM_PROMPT,
    default_replica_id: REPLICA_ID,
    pipeline_mode: "full",
    layers: PERSONA_LAYERS,
  });
  const id = created.persona_id ?? created.pal_id;
  console.error(`  persona created: ${id}`);
  return id;
}

async function ensureTools(key, personaId) {
  // No .catch here: a silent GET failure would read as "no tools exist yet"
  // and provision fresh duplicates next to the real ones. Fail loud, like
  // ensurePersona's GET does.
  const list = await tavus(key, "GET", "/tools?limit=100");
  const byName = new Map((list?.data ?? []).map((t) => [t.name, t]));
  const ids = [];
  for (const tool of TOOLS) {
    const existing = byName.get(tool.name);
    if (existing) {
      ids.push(existing.tool_id);
      const patchBody = {
        description: tool.description,
        parameters: tool.parameters,
        delivery: tool.delivery,
        on_call: tool.on_call,
        on_resolve: tool.on_resolve,
      };
      try {
        await tavus(key, "PATCH", `/tools/${existing.tool_id}`, patchBody);
        console.error(`  tool updated: ${tool.name} (${existing.tool_id})`);
      } catch (err) {
        if (err.status !== 404 && err.status !== 405) throw err;
        try {
          await tavus(key, "PUT", `/tools/${existing.tool_id}`, {
            ...tool,
            tool_id: existing.tool_id,
          });
          console.error(`  tool updated via PUT: ${tool.name} (${existing.tool_id})`);
        } catch {
          console.error(`  tool exists (content not synced): ${tool.name} (${existing.tool_id})`);
        }
      }
      continue;
    }
    const created = await tavus(key, "POST", "/tools", tool);
    ids.push(created.tool_id);
    console.error(`  tool created: ${tool.name} (${created.tool_id})`);
  }
  await tavus(key, "POST", `/personas/${personaId}/tools`, { tool_ids: ids });
  console.error(`  attached ${ids.length} tools`);
}

const keys = (process.env.TAVUS_KEYS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
if (!keys.length) {
  console.error("Set TAVUS_KEYS=key1,key2,...");
  process.exit(1);
}

const accounts = [];
let hadFailure = false;
for (const key of keys) {
  console.error(`Account ${key.slice(0, 6)}…`);
  try {
    const personaId = await ensurePersona(key);
    await ensureTools(key, personaId);
    accounts.push({ key, personaId, replicaId: REPLICA_ID });
  } catch (err) {
    hadFailure = true;
    console.error(`  Account ${key.slice(0, 6)}… failed: ${err.message}`);
    continue;
  }
}

console.log(`TAVUS_ACCOUNTS='${JSON.stringify(accounts)}'`);
if (hadFailure) process.exit(1);
