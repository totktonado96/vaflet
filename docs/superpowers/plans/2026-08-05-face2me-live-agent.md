# Face2me Live Agent (Tavus SDR в 3D-киоске) — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Живой Tavus-агент-сейлз (Ren) в экране 3D-киоска хиро `/work/face2me`: разговор с камерой, tool calls открывают DOM-карточки вокруг киоска, лид уходит в Telegram.

**Architecture:** Три файловых юнита на клиенте — `reception.tsx` (Daily-рантайм и маршрутизация событий), `hero-scene.tsx` (OGL-рендер: хромакей-видео в существующем меше экрана), `cards.tsx` (DOM-слой: карточки/субтитры/форма); связь через window-события `vaflet:f2m-reception`. На сервере — пул Tavus-аккаунтов в `/api/reception`, новый `/api/lead` (Telegram), идемпотентный provisioning-скрипт персоны+тулов.

**Tech Stack:** Next.js 16 (app router), `@daily-co/daily-js@^0.91`, `ogl@^1.0.11`, GSAP, Tailwind v4. Tavus CVI: Tools Registry, `apply_greenscreen`, raven-1.

**Спека:** `docs/superpowers/specs/2026-08-05-face2me-agent-design.md` — прочитай целиком перед стартом. Раздел «Справка: точные факты Tavus API» — источник правды по именам событий/полей.

**Правила для исполнителя:**
- После каждого таска: `npx tsc --noEmit` чисто → коммит. Идентичность: `git -c user.name="tr00x" -c user.email="$(git log -1 --format=%ae)" commit …`. НЕ пушить.
- Живые минуты Tavus НЕ тратить: вся визуалка отлаживается dev-хуком `window.__ren` и фейковым green-видео (Task 12). Живой звонок — только один, в финальном Task 15, по явному согласию пользователя.
- Дизайн-система хиро: чёрная пустота `#060809`, тонкие белые рамки `border-white/20`, display-шрифт (класс `display-2` есть в глобальных стилях), НЕ неоморфизм. Прецеденты стиля: margin notes и кнопки в `parts/hero.tsx`.
- Копирайт карточек — ТОЛЬКО подтверждённые факты из спеки (раздел 1). Ничего не выдумывать.

## Файловая карта

| Файл | Действие | Ответственность |
|---|---|---|
| `lib/reception/accounts.ts` | создать | парсинг пула аккаунтов из env, типы |
| `app/api/reception/route.ts` | переписать | создание разговора: пул, greenscreen, context, Turnstile-флаг |
| `app/api/lead/route.ts` | создать | приём лида → Telegram |
| `scripts/tavus-provision.mjs` | создать | идемпотентный сетап персоны v2 + тулов на каждый аккаунт |
| `app/work/face2me/parts/reception-events.ts` | создать | контракт событий `vaflet:f2m-reception` + helpers + dev-хук `__ren` |
| `app/work/face2me/parts/reception.tsx` | создать | Daily-рантайм: звонок, маршрутизация app-messages, стейт-машина |
| `app/work/face2me/parts/hero-scene.tsx` | изменить | хромакей-видео в SCREEN_FRAG, кнопка звонка, реакции сцены |
| `app/work/face2me/parts/hero.tsx` | изменить | кнопка звонка, self-view виньетка, монтаж Reception+CardLayer |
| `app/work/face2me/parts/cards.tsx` | создать | CardLayer: карточки, lead-форма, квитанция, субтитры |
| `.env.local` | руками (не в git) | `TAVUS_ACCOUNTS`, `TG_BOT_TOKEN`, `TG_CHAT_ID` |

Фазы = чанки ниже. Каждый чанк заканчивается работающим, проверяемым состоянием.

---

## Chunk 1: Сервер и провижининг

### Task 1: Пул аккаунтов — `lib/reception/accounts.ts`

**Files:**
- Create: `lib/reception/accounts.ts`

- [ ] **Step 1: Создать модуль**

```ts
/**
 * The desk may be staffed from several Tavus accounts: free minutes run out,
 * so /api/reception walks this pool in order until one account opens a room.
 * Env: TAVUS_ACCOUNTS = JSON array [{key, personaId, replicaId}, ...];
 * falls back to the legacy single-account triple so an existing .env.local
 * keeps working untouched.
 */

export type TavusAccount = {
  key: string;
  personaId: string;
  replicaId: string;
};

export function tavusAccounts(): TavusAccount[] {
  const raw = process.env.TAVUS_ACCOUNTS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const pool = parsed.filter(
          (a): a is TavusAccount =>
            !!a &&
            typeof (a as TavusAccount).key === "string" &&
            typeof (a as TavusAccount).personaId === "string" &&
            typeof (a as TavusAccount).replicaId === "string",
        );
        if (pool.length) return pool;
      }
    } catch {
      // malformed JSON reads as "no pool configured" — the legacy triple below
    }
  }
  const key = process.env.TAVUS_API_KEY;
  const personaId = process.env.TAVUS_PERSONA_ID;
  const replicaId = process.env.TAVUS_REPLICA_ID;
  return key && personaId && replicaId ? [{ key, personaId, replicaId }] : [];
}
```

- [ ] **Step 2: Проверка типов**

Run: `npx tsc --noEmit`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add lib/reception/accounts.ts
git commit -m "feat: tavus account pool parsing for the reception desk"
```

### Task 2: `/api/reception` v2 — пул + greenscreen + контекст

**Files:**
- Modify: `app/api/reception/route.ts` (полная замена содержимого)

- [ ] **Step 1: Переписать роут**

```ts
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
```

**Замечание про субтитры:** старый роут слал `enable_closed_captions: true` — новый его сознательно не шлёт: наши субтитры читают `conversation.utterance.streaming` из app-messages, а флаг включает только caption-оверлей хостед-UI Tavus. Если в живом смоке (Task 15) utterance-события НЕ придут — первым подозреваемым вернуть этот флаг.

- [ ] **Step 2: Проверка типов**

Run: `npx tsc --noEmit`
Expected: чисто.

- [ ] **Step 3: Смок без траты минут (test_mode)**

Dev-сервер должен бежать на :3001 (`npm run dev` уже запущен у пользователя; если нет — подними).

Run: `curl -s -X POST localhost:3001/api/reception -H 'Content-Type: application/json' -d '{"test":true}'`
Expected: JSON с `url` (daily.co-ссылка) и `id` — разговор создан, PAL не джойнится, минуты не тратятся. При исчерпанном аккаунте — `{"error":"desk-closed"}` (это тоже валидный исход смока: пул перебрался и честно закрылся).

- [ ] **Step 4: Commit**

```bash
git add app/api/reception/route.ts
git commit -m "feat: reception route walks the tavus account pool, greenscreen on"
```

### Task 3: `/api/lead` — лид в Telegram

**Files:**
- Create: `app/api/lead/route.ts`

- [ ] **Step 1: Создать роут**

```ts
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
  return typeof s === "string" ? s.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";
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
  const lead = { name, email, note, conversationId };

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const token = process.env.TG_BOT_TOKEN;
  const chat = process.env.TG_CHAT_ID;
  if (!token || !chat) {
    console.error("[lead] TG env missing; lead only logged:", lead);
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
      console.error("[lead] telegram send failed", res.status, lead);
      return NextResponse.json({ error: "desk-closed" }, { status: 503 });
    }
  } catch {
    console.error("[lead] telegram send failed (network)", lead);
    return NextResponse.json({ error: "desk-closed" }, { status: 503 });
  }

  seen.set(ip, now);
  console.log("[lead] delivered", lead);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Проверка типов**

Run: `npx tsc --noEmit`
Expected: чисто.

- [ ] **Step 3: Смок валидации (без TG-ключей это тоже проверка)**

Run: `curl -s -X POST localhost:3001/api/lead -H 'Content-Type: application/json' -d '{"name":"Test","email":"not-an-email"}'`
Expected: `{"error":"bad-request"}` (400).

Run: `curl -s -X POST localhost:3001/api/lead -H 'Content-Type: application/json' -d '{"name":"Test","email":"t@example.com"}'`
Expected: без TG env — `{"error":"desk-closed"}` (503) и строка `[lead] TG env missing` в логе dev-сервера. С заполненными `TG_BOT_TOKEN`/`TG_CHAT_ID` — `{"ok":true}` и сообщение в чате.

- [ ] **Step 4: Commit**

```bash
git add app/api/lead/route.ts
git commit -m "feat: lead route — the note you leave at the desk goes to telegram"
```

### Task 4: Провижининг персоны и тулов — `scripts/tavus-provision.mjs`

**Files:**
- Create: `scripts/tavus-provision.mjs`

Запуск: `TAVUS_KEYS=key1,key2 node scripts/tavus-provision.mjs` (ключи через запятую; для каждого создаёт/обновляет персону и тулы, печатает готовый `TAVUS_ACCOUNTS`).

- [ ] **Step 1: Создать скрипт**

```js
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
```

**Оговорка для исполнителя:** формы ответов Tavus (`persona_id` vs `pal_id`, `data[]`-обёртка списков, наличие `GET /tools`) закреплены по докам на 2026-08 и могут отличаться на конкретном аккаунте — скрипт печатает сырые ошибки (`-> status: body`), при расхождении поправь имена полей по фактическому ответу, это ожидаемая правка, не провал плана. Endpoint-алиасы `/personas` ⇄ `/pals` равнозначны — используем legacy `/personas`, т.к. существующая персона создавалась через него.

**Идемпотентность (фаст-фоллоу после ревью):** `GET /tools` больше не глотает ошибку молча (`.catch(() => null)` убран) — тихая деградация читалась бы как «тулов ещё нет» и плодила бы дубликаты. Для существующего тула скрипт синкает контент через `PATCH /v2/tools/{tool_id}` (плоский JSON-объект — не JSON Patch, в отличие от `/personas/{id}`; проверено на живом аккаунте, `PATCH` отработал напрямую, `PUT`-фоллбэк на 404/405 в этом прогоне не понадобился, но код его сохраняет на случай другого аккаунта). Если ни `PATCH`, ни `PUT` не поддерживаются — тул остаётся как есть, лог `tool exists (content not synced)`, скрипт не падает. Персона на `PATCH` реассертит `pipeline_mode: "full"` — лечит дрейф, если кто-то вручную переключил режим. Цикл по аккаунтам обёрнут в try/catch: один упавший аккаунт не валит остальные, в конце всегда печатается `TAVUS_ACCOUNTS` для успешных аккаунтов, а если были фейлы — `process.exit(1)`. Проверено вживую: `POST /personas/{id}/tools` — replace-семантика, не append (`tool_ids` после двух прогонов подряд — те же 3 id, без дублей).

- [ ] **Step 2: Прогнать по основному аккаунту**

Run: `TAVUS_KEYS="$(grep TAVUS_API_KEY .env.local | cut -d= -f2)" node scripts/tavus-provision.mjs`
Expected: в stderr — `persona created:`/`persona updated:` + три тула + `attached 3 tools`; в stdout — строка `TAVUS_ACCOUNTS='[...]'`.

- [ ] **Step 3: Обновить `.env.local` (руками, не в git)**

Добавить напечатанную строку `TAVUS_ACCOUNTS=…` в `.env.local`. Легаси-тройку не удалять (фоллбэк). Перезапустить dev-сервер, чтобы env подхватился.

- [ ] **Step 4: Смок пула через test_mode**

Run: `curl -s -X POST localhost:3001/api/reception -H 'Content-Type: application/json' -d '{"test":true}'`
Expected: JSON c `url` — новая персона отвечает на создание разговора.

- [ ] **Step 5: Commit**

```bash
git add scripts/tavus-provision.mjs
git commit -m "feat: one script staffs every tavus account with the same ren"
```

---

## Chunk 2: Клиентский рантайм (события + Daily)

Архитектура шины: один window-event `vaflet:f2m-reception` (конвенция репо `vaflet:*`, прецеденты — `vaflet:singularity` в `components/Starfield.tsx:322`). Контроллер переводит Daily/Tavus → шину; сцена и карточки слушают ТОЛЬКО шину и не знают про Daily. Dev-хук `__ren` инжектит те же события в шину напрямую — вся визуалка отлаживается без Tavus.

### Task 6: Контракт событий + dev-хук — `reception-events.ts`

**Files:**
- Create: `app/work/face2me/parts/reception-events.ts`

- [ ] **Step 1: Создать модуль**

```ts
"use client";

/**
 * The reception bus: one window event, typed payloads. The Daily controller
 * (reception.tsx) is the only writer of call-truth; the scene and the card
 * layer are readers; the card layer and the scene write UI-intent back
 * (hangup-request, lead-submitted, left-stage). In dev, window.__ren writes
 * fake call-truth so every effect can be rehearsed without spending a
 * single Tavus minute.
 *
 * The literal name must stay a literal: client module constants don't cross
 * the server boundary, and the scene chunk loads separately.
 */

export const F2M_EVENT = "vaflet:f2m-reception";

export type Phase = "idle" | "connecting" | "live" | "over" | "closed";
export type CardTopic = "pricing" | "spec" | "languages" | "bundle";

export type ReceptionDetail =
  /* controller -> readers (call truth) */
  | { type: "phase"; phase: Phase; seconds?: number; reason?: "minutes" | "denied" }
  | { type: "video"; el: HTMLVideoElement }
  | { type: "selfview"; stream: MediaStream | null }
  | { type: "speaking"; who: "pal" | "user"; on: boolean; interrupted?: boolean }
  | { type: "caption"; who: "pal" | "user"; text: string }
  | { type: "card"; card: CardTopic }
  | { type: "lead-form" }
  | { type: "dismiss" }
  /* readers -> controller (UI intent) */
  | { type: "hangup-request" }
  | { type: "call-request" } // the "ring again" button on the over panel
  | { type: "left-stage" }
  | { type: "lead-submitted"; name: string; email: string; note?: string };

export function emitReception(detail: ReceptionDetail) {
  window.dispatchEvent(new CustomEvent<ReceptionDetail>(F2M_EVENT, { detail }));
}

export function onReception(fn: (d: ReceptionDetail) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<ReceptionDetail>).detail);
  window.addEventListener(F2M_EVENT, h);
  return () => window.removeEventListener(F2M_EVENT, h);
}

/* ------------------------------------------------------------- dev hook */

interface DevHook {
  card(card: CardTopic): void;
  form(): void;
  dismiss(): void;
  caption(text: string, who?: "pal" | "user"): void;
  speaking(on: boolean, who?: "pal" | "user"): void;
  phase(phase: Phase): void;
  live(): void;
  over(): void;
}

declare global {
  interface Window {
    __ren?: DevHook;
  }
}

/**
 * Rehearsal controls. `__ren.live()` builds a greenscreen stand-in feed from
 * a canvas (Tavus keys the background to rgb(0,255,155)) so the chroma-key
 * shader and the whole card choreography can be exercised offline.
 */
export function installDevHook() {
  if (process.env.NODE_ENV === "production") return;
  let fakeRaf = 0;
  let fakeVideo: HTMLVideoElement | null = null;
  const stopFake = () => {
    cancelAnimationFrame(fakeRaf);
    if (fakeVideo) {
      const stream = fakeVideo.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      fakeVideo.srcObject = null;
      fakeVideo = null;
    }
  };
  window.__ren = {
    card: (card: CardTopic) => emitReception({ type: "card", card }),
    form: () => emitReception({ type: "lead-form" }),
    dismiss: () => emitReception({ type: "dismiss" }),
    caption: (text: string, who: "pal" | "user" = "pal") =>
      emitReception({ type: "caption", who, text }),
    speaking: (on: boolean, who: "pal" | "user" = "pal") =>
      emitReception({ type: "speaking", who, on }),
    phase: (phase: Phase) => emitReception({ type: "phase", phase, seconds: 180 }),
    live: () => {
      stopFake();
      const c = document.createElement("canvas");
      c.width = 480;
      c.height = 854;
      const ctx = c.getContext("2d")!;
      let t = 0;
      const draw = () => {
        fakeRaf = requestAnimationFrame(draw);
        t += 0.02;
        ctx.fillStyle = "rgb(0,255,155)"; // Tavus greenscreen color, exactly
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#8a6a58"; // a face-ish blob to watch the key edges
        ctx.beginPath();
        ctx.ellipse(240 + Math.sin(t) * 18, 340, 130, 175, 0, 0, Math.PI * 2);
        ctx.fill();
      };
      draw();
      const video = document.createElement("video");
      video.muted = true;
      video.srcObject = c.captureStream(24);
      video.play().catch(() => {});
      fakeVideo = video;
      emitReception({ type: "video", el: video });
      emitReception({ type: "phase", phase: "live", seconds: 180 });
    },
    over: () => {
      stopFake();
      emitReception({ type: "phase", phase: "over" });
    },
  };
}
```

- [ ] **Step 2: Проверка типов**

Run: `npx tsc --noEmit`
Expected: чисто.

- [ ] **Step 3: Commit**

```bash
git add app/work/face2me/parts/reception-events.ts
git commit -m "feat: the reception bus — one event, typed truth, rehearsal hook"
```

### Task 7: Daily-контроллер — `reception.tsx`

**Files:**
- Create: `app/work/face2me/parts/reception.tsx`

Headless-компонент: монтируется в `hero.tsx`, получает `callBtnRef`, вешает click, владеет жизненным циклом звонка. Паттерн Daily-подключения — перенос из `parts/door.tsx:335-383` (busy-guard, track-started, cleanup), расширенный камерой, app-message-маршрутизацией и шиной.

- [ ] **Step 1: Создать компонент**

```tsx
"use client";

import { useEffect, type RefObject } from "react";
import {
  emitReception,
  onReception,
  installDevHook,
  type CardTopic,
} from "./reception-events";

/**
 * The call itself. This file is the only place that knows Daily and the
 * Tavus interactions protocol; everything it learns it repeats onto the
 * reception bus, and the only bus messages it acts on are UI intents
 * (hangup-request, left-stage, lead-submitted).
 *
 * Camera goes on with the mic — one permission prompt, like walking up to
 * a kiosk that can see you. Denial is not an error: the call proceeds
 * voice-only and Tavus's perception degrades softly.
 */

type TavusMessage = {
  message_type?: string;
  event_type?: string;
  conversation_id?: string;
  properties?: Record<string, unknown>;
};

type DailyCall = {
  join: (o: { url: string }) => Promise<unknown>;
  leave: () => Promise<unknown>;
  destroy: () => void;
  participants: () => Record<string, { session_id: string; local: boolean }>;
  sendAppMessage: (msg: unknown, to: string) => void;
  on: (ev: string, fn: (e?: any) => void) => void;
};

const CARD_TOPICS: readonly CardTopic[] = ["pricing", "spec", "languages", "bundle"];

export function Reception({ callBtnRef }: { callBtnRef: RefObject<HTMLButtonElement | null> }) {
  useEffect(() => {
    installDevHook();
    const btn = callBtnRef.current;
    let call: DailyCall | null = null;
    let conversationId = "";
    let busy = false;
    let callGen = 0; // bumps on every wake AND every hangup: a stale wake sees it move
    let disposed = false;
    const video = document.createElement("video");
    video.muted = false;
    video.playsInline = true;

    const send = (event_type: string, properties: Record<string, unknown>) => {
      call?.sendAppMessage(
        { message_type: "conversation", event_type, conversation_id: conversationId, properties },
        "*",
      );
    };

    const hangUp = (phase: "over" | "closed" = "over", reason?: "minutes" | "denied") => {
      callGen++;
      const c = call;
      call = null;
      busy = false;
      video.srcObject = null;
      emitReception({ type: "selfview", stream: null });
      emitReception({ type: "dismiss" });
      emitReception({ type: "phase", phase, reason });
      c?.destroy();
    };

    const onMessage = (msg: TavusMessage) => {
      const p = msg.properties ?? {};
      switch (msg.event_type) {
        case "conversation.tool_call": {
          const name = String(p.name ?? "");
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(String(p.arguments ?? "{}"));
          } catch {}
          if (name === "show_card") {
            const topic = args.topic as CardTopic;
            if (CARD_TOPICS.includes(topic)) emitReception({ type: "card", card: topic });
          } else if (name === "open_lead_form") {
            emitReception({ type: "lead-form" });
          } else if (name === "dismiss_cards") {
            emitReception({ type: "dismiss" });
          }
          send("conversation.tool_result", {
            tool_call_id: p.tool_call_id,
            output: "shown",
            status: "success",
          });
          break;
        }
        case "conversation.utterance.streaming":
        case "conversation.utterance": {
          const who = p.role === "user" ? "user" : "pal"; // "pal" | legacy "replica"
          emitReception({ type: "caption", who, text: String(p.speech ?? "") });
          break;
        }
        case "conversation.started_speaking":
        case "conversation.stopped_speaking": {
          const who = p.role === "user" ? "user" : "pal";
          emitReception({
            type: "speaking",
            who,
            on: msg.event_type === "conversation.started_speaking",
            interrupted: p.interrupted === true,
          });
          break;
        }
        case "system.shutdown":
          hangUp("over");
          break;
      }
    };

    const wake = async () => {
      if (busy) return;
      busy = true;
      const gen = ++callGen; // this wake's ticket; any hangup or newer wake voids it
      emitReception({ type: "phase", phase: "connecting" });

      let url = "";
      let cap = 180;
      try {
        const res = await fetch("/api/reception", { method: "POST" });
        if (!res.ok) throw new Error("closed");
        const data = (await res.json()) as { url: string; id?: string; seconds?: number };
        url = data.url;
        conversationId = data.id ?? "";
        cap = data.seconds ?? 180;
      } catch {
        busy = false;
        // the pool is dry: the desk closes honestly, the note still works
        emitReception({ type: "phase", phase: "closed", reason: "minutes" });
        return;
      }
      // cancelled mid-fetch (unmount, a hangup, or a newer call superseding this one)
      if (disposed || gen !== callGen) return;

      try {
        const { default: Daily } = await import("@daily-co/daily-js");
        if (disposed || gen !== callGen) return;
        // camera on by request; if the visitor denies it, Daily falls back
        // to mic-only on its own — denial must not kill the call
        const frame = Daily.createCallObject({
          audioSource: true,
          videoSource: true,
          dailyConfig: { userMediaVideoConstraints: { width: 640, height: 480 } },
        }) as unknown as DailyCall;
        call = frame;

        frame.on("track-started", (ev) => {
          if (!ev?.participant) return;
          if (ev.participant.local) {
            if (ev.track.kind === "video")
              emitReception({ type: "selfview", stream: new MediaStream([ev.track]) });
            return;
          }
          if (ev.track.kind !== "video") return;
          video.srcObject = new MediaStream([ev.track]);
          void video.play();
          emitReception({ type: "video", el: video });
          emitReception({ type: "phase", phase: "live", seconds: cap });
        });
        frame.on("app-message", (ev) => onMessage(ev?.data ?? {}));
        frame.on("left-meeting", () => hangUp("over"));
        // a call that breaks mid-air ends like a call that ended (spec §8):
        // "over", with the form as the standing invitation — not "closed"
        frame.on("error", () => hangUp("over"));

        await frame.join({ url });
        if (disposed || gen !== callGen) {
          frame.destroy();
          if (call === frame) call = null;
          return;
        }
      } catch (err) {
        // denied permissions get their own honest word; anything else is a
        // dropped call. hangUp is safe to skip if a bus hangup already ran
        // (the generation moved on), so no double phase emit.
        if (!disposed && gen === callGen) {
          const denied = /NotAllowed|Permission|denied/i.test(String(err));
          if (denied) hangUp("closed", "denied");
          else hangUp("over");
        }
      }
    };

    const offBus = onReception((d) => {
      if (d.type === "hangup-request") hangUp("over");
      else if (d.type === "call-request") void wake();
      else if (d.type === "left-stage") hangUp("over");
      else if (d.type === "lead-submitted") {
        send("conversation.respond", {
          text:
            `I just submitted the contact form. Name: ${d.name}, email: ${d.email}` +
            (d.note ? `, my place: ${d.note}` : "") +
            `. Please confirm you got it.`,
        });
      }
    });

    const onClick = () => void wake();
    btn?.addEventListener("click", onClick);

    return () => {
      disposed = true;
      btn?.removeEventListener("click", onClick);
      offBus();
      call?.destroy();
    };
    // refs are stable for the life of the hero
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
```

**Оговорка про исходящий конверт:** форма исходящих `tool_result`/`respond` (`message_type`+`event_type`+`conversation_id`+`properties`) взята из Справки спеки; что `conversation_id` обязателен на верхнем уровне исходящих — подтверждается только живым звонком (Task 15). Если Ren не реагирует на tool_result/respond — первым делом сверить конверт с логом реальных входящих.

- [ ] **Step 2: Проверка типов**

Run: `npx tsc --noEmit`
Expected: чисто. Замечания: `DailyCall` — локальный узкий тип поверх `@daily-co/daily-js` (их типы для call object есть, но `on`-события описаны широко; если каст вызовет конфликт — используй их типы напрямую, узкий тип — осознанный выбор). ВАЖНО: в tsconfig нет `noUnusedLocals` — «tsc чисто» НЕ ловит мёртвые переменные, ловит только типы; гонки проверяются глазами по чек-листу `disposed`/`busy` выше.

- [ ] **Step 3: Смок шины в консоли (dev, без Tavus)**

Открыть `localhost:3001/work/face2me`, в консоли (сырым событием — `__ren` появится только после монтажа `Reception` в Task 11):

```js
addEventListener("vaflet:f2m-reception", (e) => console.log("bus:", e.detail));
dispatchEvent(new CustomEvent("vaflet:f2m-reception", { detail: { type: "card", card: "pricing" } }));
dispatchEvent(new CustomEvent("vaflet:f2m-reception", { detail: { type: "phase", phase: "closed", reason: "minutes" } }));
```

Expected: два `bus:`-лога с теми же detail — шина ходит. Полный смок `__ren` — после Task 11.

- [ ] **Step 4: Commit**

```bash
git add app/work/face2me/parts/reception.tsx
git commit -m "feat: the call itself — daily runtime translating tavus onto the bus"
```

---

## Chunk 3: Сцена и видео (хромакей в экране киоска)

Правки `hero-scene.tsx` — точечные, по якорям (искать точную строку, не номер). Ключевой факт геометрии: халфтон-точки (`dots`) сидят ПЕРЕД экраном (`z = K_D/2 + 0.012` против `+0.003` у экрана) — во время live их надо гасить юниформой, иначе они лягут поверх лица; их возвращение при `uLiveMix → 0` — это и есть «рассыпание обратно в точки» из спеки.

### Task 10: `hero-scene.tsx` — видеотекстура, хромакей, реакции

**Files:**
- Modify: `app/work/face2me/parts/hero-scene.tsx`

- [ ] **Step 1: Импорт шины**

После строки `import { reducedMotion } from "@/components/case/kit";` добавить:

```ts
import { emitReception, onReception } from "./reception-events";
```

- [ ] **Step 2: Расширить SCREEN_FRAG**

В `SCREEN_FRAG` после строки `uniform vec2 uGaze;` добавить юниформы:

```glsl
  uniform sampler2D uLive;
  uniform float uLiveMix;
  uniform float uSpeak;
  uniform float uLiveAspect;
```

В `main()` найти строку `vec3 col = glass + lit * uGlow + vec3(0.043, 0.855, 0.318) * 0.012 * uWake;` и СРАЗУ ПОСЛЕ неё вставить:

```glsl
    // the live face: greenscreen video keyed on the glass. Cover-fit the
    // frame to the screen rect; where the key removes background the lit
    // glass shows through, so she floats in the backlight, not in a box.
    if (uLiveMix > 0.001) {
      float screenAspect = ${(SCR_W / SCR_H).toFixed(4)};
      vec2 vuv = vUv - 0.5;
      float k = uLiveAspect / screenAspect;
      if (k > 1.0) { vuv.x /= k; } else { vuv.y *= k; }
      vuv += 0.5;
      vec4 live = texture2D(uLive, vec2(vuv.x, 1.0 - vuv.y));
      float dom = live.g - max(live.r, live.b);
      float keep = 1.0 - smoothstep(0.04, 0.16, dom);
      // spill: pull the green bounce off skin and hair near the key
      live.g = mix(min(live.g, max(live.r, live.b) * 1.15), live.g, keep);
      float grey = dot(live.rgb, vec3(0.299, 0.587, 0.114));
      // silence is grayscale; her speech is the only colour on this page
      vec3 face = mix(vec3(grey) * vec3(0.94, 1.0, 0.97), live.rgb, uSpeak);
      col = mix(col, face, uLiveMix * keep * mask);
    }
```

(`${(SCR_W / SCR_H).toFixed(4)}` — литеральная интерполяция как в существующих шейдерах файла; `1.0 - vuv.y` потому что видеотекстура грузится без flipY, см. Step 5.)

- [ ] **Step 3: Гашение точек во время live**

В `DOTS_FRAG` (внимание: строка `uniform float uSceneGlow;` есть в пяти шейдерах файла — работать строго внутри константы `DOTS_FRAG`) после `uniform float uSceneGlow;` добавить `uniform float uFade;`, и строку `float a = m * vAlpha;` заменить на:

```glsl
    float a = m * vAlpha * (1.0 - uFade);
```

- [ ] **Step 4: Юниформы программ**

В `screenProgram` в объект `uniforms` (рядом с `uGaze: { value: new Vec2() }`) добавить:

```ts
        uLive: { value: new Texture(gl) },
        uLiveMix: { value: 0 },
        uSpeak: { value: 0 },
        uLiveAspect: { value: 0.75 },
```

В `dotsProgram` uniforms добавить `uFade: { value: 0 },`.

- [ ] **Step 5: Live-состояние и подписка на шину**

После блока `const act2 = { rot: 0, dz: 0, dy: 0 };` / `let rotOn = false;` добавить:

```ts
    /** The call, as the scene sees it. mix fades the keyed video in over the
        halftone; speak colours it; jolt is the flinch when she is cut off. */
    const live = { mix: 0, speak: 0, jolt: 0 };
    let liveVideo: HTMLVideoElement | null = null;
    let liveOn = false;
    let liveish = false; // connecting OR live: parks the rotate act early
    let fed = 0; // ramps only once real frames flow — an unfed texture is black,
    // and black reads as "face" to the keyer (no green to dominate), so mixing
    // before the first frame would flash the glass dark
    let leftStageSent = false;
    const liveTex = new Texture(gl, {
      generateMipmaps: false,
      flipY: false, // video uploads skip the flip; the shader flips vUv instead
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });
    screenProgram.uniforms.uLive.value = liveTex;

    const offBus = onReception((d) => {
      if (d.type === "video") {
        liveVideo = d.el;
      } else if (d.type === "phase") {
        const was = liveOn;
        liveOn = d.phase === "live";
        liveish = d.phase === "live" || d.phase === "connecting";
        leftStageSent = false;
        if (liveOn && !was) {
          fed = 0; // every call re-earns its first frame
          if (rotOn) setRotation(false); // portrait face on a landscape act reads sideways
          gsap.killTweensOf(live);
          if (still) { live.mix = 1; start(); } // the loop must run to feed the texture
          else gsap.to(live, { mix: 1, duration: 1.8, ease: "power2.inOut" });
        } else if (!liveOn && was) {
          gsap.killTweensOf(live);
          if (still) { live.mix = 0; live.speak = 0; stop(); renderOnce(); }
          else gsap.to(live, { mix: 0, speak: 0, duration: 1.4, ease: "power2.inOut" });
        }
      } else if (d.type === "speaking" && d.who === "pal") {
        if (!still) {
          gsap.to(live, { speak: d.on ? 1 : 0, duration: 0.45, ease: "power1.inOut" });
          if (d.interrupted) gsap.fromTo(live, { jolt: 1 }, { jolt: 0, duration: 0.6, ease: "power2.out" });
        } else {
          live.speak = d.on ? 1 : 0;
        }
      }
    });
```

- [ ] **Step 6: Кадровое обновление текстуры и юниформ**

В `paint()` найти строку `screenProgram.uniforms.uGlow.value = state.glow;` и заменить блок до `ledProgram.uniforms.uWake.value = state.wake;` (не включая её) на:

```ts
      if (liveVideo && live.mix > 0.001 && liveVideo.readyState >= 2) {
        if (liveTex.image !== liveVideo) liveTex.image = liveVideo;
        liveTex.needsUpdate = true;
        screenProgram.uniforms.uLiveAspect.value =
          liveVideo.videoWidth / Math.max(1, liveVideo.videoHeight);
        fed = Math.min(1, fed + dt * 2.5);
      }
      const mixNow = live.mix * fed; // the key opens only once frames actually flow
      // her speech warms the backlight and the pool, a breath, not a strobe
      screenProgram.uniforms.uGlow.value = state.glow * (1 + live.speak * 0.22);
      screenProgram.uniforms.uWake.value = state.wake;
      screenProgram.uniforms.uLiveMix.value = mixNow;
      screenProgram.uniforms.uSpeak.value = live.speak;
      // the backlight glances toward the pointer while the face gathers,
      // then provably re-centers so the settled frame stays symmetric —
      // and it kicks sideways for a beat when the visitor cuts her off
      const gaze = sstep(0.55, 0.65, shown) * (1 - sstep(0.75, 0.85, shown));
      screenProgram.uniforms.uGaze.value.set(
        leanNow.x * 0.8 * gaze + live.jolt * 0.06 * Math.sin(now * 0.04),
        leanNow.y * 0.8 * gaze,
      );
```

(Существующие строки `uGaze` из старого места удалить — они переехали сюда.) Ниже, рядом с `dotsProgram.uniforms.uMorph.value = act2.rot;`, добавить:

```ts
      dotsProgram.uniforms.uFade.value = mixNow;
```

В строке `poolProgram.uniforms.uGlow.value = state.glow;` заменить правую часть на `state.glow * (1 + live.speak * 0.18);`.

- [ ] **Step 7: Кнопка звонка + уход со сцены**

В тип `Refs` добавить `callRef: RefObject<HTMLButtonElement | null>;`, в деструктуризацию пропсов — `callRef`, рядом с `const rotateBtn = rotateRef.current;` — `const callBtn = callRef.current;`.

В paint найти цикл `for (const btn of [rotateBtn, fsBtn])` и заменить логику видимости:

```ts
      const ready = shown > 0.965 && faceReady;
      for (const btn of [rotateBtn, fsBtn, callBtn]) {
        if (!btn) continue;
        // during the call (and already while it connects) the rotate act is
        // parked: a portrait face on a landscape display would lie on its side
        const parked = btn === rotateBtn && (liveish || live.mix > 0.5);
        btn.style.opacity = ready ? (parked ? "0.3" : "1") : "0";
        btn.style.pointerEvents = ready && !parked ? "auto" : "none";
      }
      if (rotOn && shown < 0.9) setRotation(false);
      // walking away from the desk hangs up — once per call
      if (liveOn && shown < 0.9 && !leftStageSent) {
        leftStageSent = true;
        emitReception({ type: "left-stage" });
      }
```

- [ ] **Step 8: Cleanup**

В return-cleanup эффекта, СРАЗУ ПОСЛЕ уникальной строки `fadeIn?.kill();` (якорь `gsap.killTweensOf(act2)` не уникален — он есть и в setRotation), добавить:

```ts
      offBus();
      gsap.killTweensOf(live);
```

- [ ] **Step 9: Проверка типов**

Run: `npx tsc --noEmit`
Expected: чисто.

- [ ] **Step 10: Commit**

```bash
git add app/work/face2me/parts/hero-scene.tsx
git commit -m "feat: the screen learns her face — keyed live video in the kiosk glass"
```

### Task 11: `hero.tsx` — кнопка звонка и монтаж рантайма

**Files:**
- Modify: `app/work/face2me/parts/hero.tsx`

- [ ] **Step 1: Реф и монтаж**

Добавить импорт `import { Reception } from "./reception";`, реф `const callRef = useRef<HTMLButtonElement>(null);`, передать `callRef={callRef}` в `<Scene …>` (и в тип Refs — уже сделано в Task 10). Внутри stage-дива, после блока кнопок, смонтировать `<Reception callBtnRef={callRef} />`.

- [ ] **Step 2: Кнопка**

В контейнер кнопок (`div` с `bottom-8`) ПЕРВОЙ добавить кнопку звонка — тот же класс `BTN`, что у соседей, плюс малахитовый акцент по ховеру (единственный цветной элемент до звонка):

```tsx
          <button
            ref={callRef}
            type="button"
            aria-label="Talk to the receptionist"
            data-hero-call
            data-cursor-text="Say hi"
            className={`${BTN} hover:border-[#0bda51]! hover:text-[#0bda51]!`}
          >
            <svg
              viewBox="0 0 32 32"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* a headset outline: the desk, not a phone booth */}
              <path d="M6 18v-3a10 10 0 0 1 20 0v3" />
              <rect x="4" y="17" width="5" height="7" rx="2" />
              <rect x="23" y="17" width="5" height="7" rx="2" />
              <path d="M26 24v1.5a3 3 0 0 1-3 3h-4" />
            </svg>
          </button>
```

Видимость и pointer-events этой кнопки водит paint-цикл сцены (Task 10 Step 7) — в JSX она, как соседи, стартует невидимой через класс `BTN` (`opacity-0 pointer-events-none`).

- [ ] **Step 3: Проверка типов + смок шины**

Run: `npx tsc --noEmit` — чисто.
В браузере `localhost:3001/work/face2me`: доскроллить walk-up до конца → рядом с rotate/fullscreen появилась третья кнопка. В консоли: `__ren.live()` → в экране киоска поверх халфтона проявляется фейковое видео: зелёный фон ВЫКЕЕН (виден стеклянный backlight), коричневый эллипс виден, халфтон-точки погасли. `__ren.speaking(true)` → эллипс из серого становится цветным. `__ren.over()` → видео растворяется, точки-лицо возвращаются.
Expected: именно эта хореография, без консольных ошибок. Дополнительно: (а) эллипс-«лицо» фейка должен быть в ВЕРХНЕЙ половине экрана киоска — если он внизу, ориентация видео перевёрнута (пара flipY/`1.0 - vuv.y` рассинхронизирована); (б) ховер кнопки звонка — малахитовый, не белый (`!`-суффикс перебивает hover из BTN — паттерн Tailwind v4 этого репо); (в) чёрной вспышки на экране в момент `__ren.live()` быть не должно (гейт `fed`); (г) отражение живого лица в полу — ОЖИДАЕМО (screenProgram общий для киоска и зеркала, как у всех слоёв сцены). Это ГЛАВНАЯ проверка чанка — не пропускать.

- [ ] **Step 4: Commit**

```bash
git add app/work/face2me/parts/hero.tsx
git commit -m "feat: a third control wakes on the kiosk — the call button"
```

---

## Chunk 4: Карточки, субтитры, форма — DOM-слой + финальный смок

### Task 13: `cards.tsx` — CardLayer

**Files:**
- Create: `app/work/face2me/parts/cards.tsx`

Слой живёт в запиненном stage хиро (кладётся в `hero.tsx` в Task 14): `absolute inset-0 z-20 pointer-events-none`, интерактив — точечно `pointer-events-auto`. Эстетика пустоты, как у margin notes: чёрный фон, `border-white/20`, display-шрифт. Копирайт карточек — дословно из блоков ниже, НЕ дописывать.

- [ ] **Step 1: Создать компонент**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { reducedMotion } from "@/components/case/kit";
import { emitReception, onReception, type CardTopic, type Phase } from "./reception-events";

/**
 * What Ren puts on the counter. The card layer owns everything DOM about the
 * call: topic cards she opens by tool call, the lead form, the receipt, the
 * captions and the status pill. It reads the reception bus and writes back
 * only UI intent (hangup-request, lead-submitted). Two cards at most — a
 * new one shoves the oldest off the counter, Magic-Canvas style.
 */

const CARD_DATA: Record<CardTopic, { title: string; rows: [string, string][]; foot?: string }> = {
  pricing: {
    title: "The bill",
    rows: [
      ["Starter", "$599/mo"],
      ["Standard", "$999/mo"],
      ["Custom", "$1500+/mo"],
    ],
    foot: "Per location, month-to-month. Hardware, software and install included.",
  },
  spec: {
    title: "The spec",
    rows: [
      ["Job", "Front desk, on its feet"],
      ["Hours", "On duty — no breaks so far"],
      ["Languages", "EN · ES · RU"],
      ["Price", "from $599/mo"],
      ["Install", "The founders come to you"],
      ["Contract", "Month-to-month"],
    ],
  },
  languages: {
    title: "Languages",
    rows: [
      ["English", "native shift"],
      ["Español", "switches mid-sentence"],
      ["Русский", "тоже дома"],
    ],
    foot: "It hears which one you speak and follows.",
  },
  bundle: {
    title: "What's in the box",
    rows: [
      ["Hardware", "the kiosk itself"],
      ["Software", "the receptionist on shift"],
      ["Integrations", "wired into what runs your place"],
      ["Install", "one visit, working same day"],
    ],
    foot: "One monthly payment. The hardware stays Face2me's problem.",
  },
};

const SLOTS = [
  "md:left-[6%] md:top-[22%] md:right-auto",
  "md:right-[6%] md:top-[30%] md:left-auto",
] as const;

function Rise({ children, k }: { children: React.ReactNode; k: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion() || !el.current) return;
    const tw = gsap.fromTo(
      el.current,
      { y: 22, autoAlpha: 0, filter: "blur(6px)" },
      { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out" },
    );
    return () => void tw.kill();
  }, [k]);
  return (
    <div ref={el} className="pointer-events-auto">
      {children}
    </div>
  );
}

const SHELL =
  "w-[19rem] max-w-[86vw] rounded-2xl border border-white/20 bg-black/55 p-5 text-[#dfe7ee] backdrop-blur-sm";

function TopicCard({ topic, onClose }: { topic: CardTopic; onClose: () => void }) {
  const d = CARD_DATA[topic];
  return (
    <div className={SHELL}>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">{d.title}</p>
        <button
          type="button"
          aria-label="Close card"
          onClick={onClose}
          className="-mr-1 px-1 text-white/40 transition-colors hover:text-white"
        >
          ×
        </button>
      </div>
      <dl className="mt-4 flex flex-col gap-2.5">
        {d.rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">{k}</dt>
            <dd className="text-right text-sm font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      {d.foot && <p className="mt-4 text-xs leading-relaxed text-white/55">{d.foot}</p>}
    </div>
  );
}

function LeadForm({ onDone }: { onDone: (name: string) => void }) {
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("name") ?? "").trim();
      const email = String(fd.get("email") ?? "").trim();
      const note = String(fd.get("note") ?? "").trim();
      if (!name || !email) return;
      setState("sending");
      try {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, note }),
        });
        if (!res.ok) throw new Error("lead-failed");
        emitReception({ type: "lead-submitted", name, email, note: note || undefined });
        onDone(name);
      } catch {
        setState("error");
      }
    },
    [onDone],
  );
  const FIELD =
    "w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2.5 text-sm font-medium text-white placeholder:text-white/35 focus:border-[#0bda51] focus:outline-none";
  return (
    <form onSubmit={submit} className={SHELL}>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Leave a note</p>
      <div className="mt-4 flex flex-col gap-2.5">
        {/* eslint-disable-next-line jsx-a11y/no-autofocus -- the agent just opened this for the visitor */}
        <input name="name" placeholder="Your name" autoFocus required maxLength={120} className={FIELD} />
        <input name="email" type="email" placeholder="Email" required maxLength={200} className={FIELD} />
        <input name="note" placeholder="What kind of place? (optional)" maxLength={500} className={FIELD} />
      </div>
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-4 w-full rounded-full bg-[#0bda51] px-4 py-2.5 text-sm font-bold text-[#04140a] transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {state === "sending" ? "Passing it on…" : "The founders call back"}
      </button>
      {state === "error" && (
        <p className="mt-3 text-xs leading-relaxed text-white/60">
          The desk dropped the note. Mail it instead:{" "}
          <a href="mailto:cuntact@vaflet.agency" className="font-bold text-white underline underline-offset-2">
            cuntact@vaflet.agency
          </a>
        </p>
      )}
    </form>
  );
}

export function CardLayer() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [closedReason, setClosedReason] = useState<"minutes" | "denied" | undefined>(undefined);
  const [cards, setCards] = useState<CardTopic[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [caption, setCaption] = useState<{ who: "pal" | "user"; text: string } | null>(null);
  const [selfview, setSelfview] = useState<MediaStream | null>(null);
  const [left, setLeft] = useState(0);
  const captionTimer = useRef(0);
  const selfRef = useRef<HTMLVideoElement>(null);

  useEffect(
    () =>
      onReception((d) => {
        if (d.type === "phase") {
          setPhase(d.phase);
          setClosedReason(d.phase === "closed" ? d.reason : undefined);
          if (d.phase === "live") setLeft(d.seconds ?? 180);
          if (d.phase !== "live") {
            setCards([]);
            setFormOpen(false);
            setSelfview(null);
          }
          if (d.phase === "idle" || d.phase === "connecting") setReceipt(null);
        } else if (d.type === "card") {
          setFormOpen(false);
          // a re-shown topic stays in its slot — no silent left/right teleport
          setCards((prev) => (prev.includes(d.card) ? prev : [...prev, d.card].slice(-2)));
        } else if (d.type === "lead-form") {
          setCards((prev) => prev.slice(-1));
          setReceipt(null);
          setFormOpen(true);
        } else if (d.type === "dismiss") {
          setCards([]);
          setFormOpen(false);
          setReceipt(null); // "clear every card" includes the receipt
        } else if (d.type === "caption") {
          setCaption({ who: d.who, text: d.text });
          window.clearTimeout(captionTimer.current);
          captionTimer.current = window.setTimeout(() => setCaption(null), 3500);
        } else if (d.type === "selfview") {
          setSelfview(d.stream);
        }
      }),
    [],
  );

  useEffect(() => () => window.clearTimeout(captionTimer.current), []);

  useEffect(() => {
    if (phase !== "live") return;
    const id = window.setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (selfRef.current && selfview) {
      selfRef.current.srcObject = selfview;
      void selfRef.current.play();
    }
  }, [selfview]);

  const sheetOpen = cards.length > 0 || formOpen || receipt !== null;
  const m = Math.floor(left / 60);
  const s = String(left % 60).padStart(2, "0");

  return (
    <div aria-hidden={phase === "idle" && !sheetOpen} className="pointer-events-none absolute inset-0 z-20">
      {/* cards: floating slots beside the kiosk on desktop, a bottom sheet on
          the phone (max 45vh, captions perch on its top edge — spec rule) */}
      <div className="absolute inset-x-3 bottom-3 flex max-h-[45vh] flex-col-reverse gap-3 overflow-y-auto md:static md:max-h-none md:overflow-visible">
        {cards.map((topic, i) => (
          <div key={topic} className={`md:absolute ${SLOTS[i] ?? SLOTS[1]}`}>
            <Rise k={topic}>
              <TopicCard topic={topic} onClose={() => setCards((p) => p.filter((c) => c !== topic))} />
            </Rise>
          </div>
        ))}
        {formOpen && (
          <div className={`md:absolute ${SLOTS[1]}`}>
            <Rise k="lead-form">
              <LeadForm
                onDone={(name) => {
                  setFormOpen(false);
                  setReceipt(name);
                }}
              />
            </Rise>
          </div>
        )}
        {receipt && (
          <div className={`md:absolute ${SLOTS[1]}`}>
            <Rise k="receipt">
              <div className={SHELL}>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#0bda51]">Note taken</p>
                <p className="mt-3 text-sm leading-relaxed">
                  Left at the desk, {receipt}. The founders call back — a human one, this time.
                </p>
              </div>
            </Rise>
          </div>
        )}
        {/* the call ended (she hung up, time ran out, or the line dropped):
            back to work, with the door held open — spec §8 */}
        {phase === "over" && !receipt && (
          <div className={`md:absolute ${SLOTS[0]}`}>
            <Rise k="over">
              <div className={SHELL}>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Back to work</p>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  She's on the next visitor. Ring again, or just leave a note.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => emitReception({ type: "call-request" })}
                    className="w-full rounded-full bg-[#0bda51] px-4 py-2.5 text-sm font-bold text-[#04140a] transition-transform hover:scale-[1.02]"
                  >
                    Ring again
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormOpen(true)}
                    className="w-full rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-[#0bda51] hover:text-[#0bda51]"
                  >
                    Leave a note
                  </button>
                </div>
              </div>
            </Rise>
          </div>
        )}
        {phase === "closed" && !receipt && (
          <div className={`md:absolute ${SLOTS[0]}`}>
            <Rise k="closed">
              <div className={SHELL}>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                  {closedReason === "denied" ? "No mic, no small talk" : "Shift's over"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {closedReason === "denied"
                    ? "The call needs a microphone. Or skip the talking — leave a note, the founders call back."
                    : "The desk is out of minutes. The note still works — leave one and the founders call back."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setReceipt(null);
                    setFormOpen(true);
                  }}
                  className="mt-4 w-full rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-[#0bda51] hover:text-[#0bda51]"
                >
                  Leave a note
                </button>
              </div>
            </Rise>
          </div>
        )}
      </div>

      {/* captions — the conversation reads as a page, spec section 5. On the
          phone with the sheet open they compress to one clamped line above it */}
      {caption && caption.text && (
        <p
          aria-live="polite"
          className={`display-2 pointer-events-none absolute inset-x-4 text-center font-extrabold leading-tight md:inset-x-[10%] md:bottom-24 md:text-4xl ${
            sheetOpen ? "bottom-[calc(45vh+1rem)] truncate text-lg" : "bottom-24 text-2xl"
          } ${caption.who === "user" ? "text-white/45" : "text-[#dfe7ee]"}`}
        >
          {caption.text}
        </p>
      )}

      {/* the product's own UI: status pill + hang up, over the kiosk's feet */}
      {(phase === "connecting" || phase === "live") && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-24 z-10 flex items-center justify-center gap-3 md:bottom-8 md:left-auto md:right-8 md:inset-x-auto">
          <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm">
            <span
              aria-hidden
              className={`size-2 rounded-full ${phase === "live" ? "bg-[#0bda51]" : "animate-pulse bg-white/50"}`}
            />
            <span>{phase === "live" ? "On the line" : "She heard the bell…"}</span>
            {phase === "live" && <span className="tabular-nums text-white/60">{`${m}:${s}`}</span>}
          </div>
          {phase === "live" && (
            <button
              type="button"
              onClick={() => emitReception({ type: "hangup-request" })}
              className="rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:border-white/60"
            >
              End the visit
            </button>
          )}
        </div>
      )}

      {/* what she sees — honest little window into the visitor's own camera */}
      {phase === "live" && selfview && (
        <div className="pointer-events-none absolute right-4 top-4 hidden w-28 overflow-hidden rounded-xl border border-white/20 md:block">
          <video ref={selfRef} muted playsInline className="aspect-[3/4] w-full object-cover grayscale" />
          <p className="bg-black/70 px-2 py-1 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
            What she sees
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Проверка типов**

Run: `npx tsc --noEmit`
Expected: чисто.

- [ ] **Step 3: Commit**

```bash
git add app/work/face2me/parts/cards.tsx
git commit -m "feat: what ren puts on the counter — cards, captions, the note"
```

### Task 14: Монтаж слоя + мобильная проверка

**Files:**
- Modify: `app/work/face2me/parts/hero.tsx`

- [ ] **Step 1: Смонтировать**

`import { CardLayer } from "./cards";` и добавить `<CardLayer />` внутрь stage-дива, ПОСЛЕ `<Reception …/>` (слой обязан жить внутри sticky-контейнера, чтобы пиниться вместе со сценой).

- [ ] **Step 2: Репетиция всей хореографии (без Tavus)**

`localhost:3001/work/face2me`, доскроллить до конца walk-up, в консоли по очереди:

```js
__ren.live();
__ren.caption("Hi — Ren, front desk. Well, the demo of one.");
__ren.speaking(true);
__ren.card("pricing");
__ren.card("spec");        // два слота: pricing слева, spec справа
__ren.card("languages");   // pricing уходит, languages занимает слот
__ren.card("spec");        // ре-шоу уже видимой темы — no-op, слоты НЕ меняются местами
__ren.form();              // форма справа, карточки ужались до одной
__ren.dismiss();
__ren.over();              // видео растворяется в точки, всплывает панель «Back to work» (Ring again / Leave a note)
// репетиция отказов (сырым событием — __ren.phase не несёт reason):
dispatchEvent(new CustomEvent("vaflet:f2m-reception", { detail: { type: "phase", phase: "closed", reason: "minutes" } })); // «Shift's over»
dispatchEvent(new CustomEvent("vaflet:f2m-reception", { detail: { type: "phase", phase: "closed", reason: "denied" } }));  // «No mic, no small talk»
```

Expected: карточки поднимаются из пустоты со смещением+blur, максимум две, повторный `__ren.card("pricing")` НЕ переставляет слоты, крестики закрывают, субтитры крупные снизу, статус-пилюля с таймером видна, форма фокусируется на имени; после `over` — панель «Back to work» с двумя кнопками (Ring again дёргает call-request на шине); обе closed-панели различаются копирайтом. Сабмит формы с dev-сервером без TG env покажет error-состояние с mailto — это тоже проверить.

- [ ] **Step 3: Мобила 390px**

DevTools, viewport 390×844, та же последовательность.
Expected: карточки — bottom-sheet (max 45vh, скроллится), субтитры одной строкой над кромкой sheet, без x-overflow.

- [ ] **Step 4: Reduced motion**

Эмулировать `prefers-reduced-motion: reduce`: карточки появляются без анимации (Rise не твинит), сцена рендерит кадры live-видео (loop включается на live даже в still-режиме — Task 10 Step 5).

- [ ] **Step 5: Commit**

```bash
git add app/work/face2me/parts/hero.tsx
git commit -m "feat: the card layer joins the stage"
```

### Task 15: Финальная проверка

- [ ] **Step 1: Полный tsc + прогон страницы**

`npx tsc --noEmit` чисто; страница открывается, walk-up не сломан, консоль без ошибок на полном скролле туда-обратно.

- [ ] **Step 2: Живой смок — ОДИН звонок, только с явного согласия пользователя**

Спросить пользователя в чате, готов ли он сжечь ~2 минуты Tavus. После «да»: нажать кнопку звонка на странице, выдать пермишены. Чек-лист:
- [ ] greeting звучит (custom_greeting), видео выкеено чисто (нет зелёного канта — если есть, крутить пороги smoothstep 0.04/0.16 в SCREEN_FRAG);
- [ ] спросить «what do you cost?» → Ren отвечает И появляется карточка pricing (`conversation.tool_call` дошёл);
- [ ] согласиться оставить контакт → форма открылась, сабмит → Ren подтверждает голосом по имени (`conversation.respond` дошёл), лид в Telegram;
- [ ] субтитры бегут во время речи; цвет лица появляется только когда она говорит;
- [ ] «End the visit» вешает трубку: видео рассыпается в точки.

Если что-то из списка не сработало — НЕ жечь второй звонок сразу: локализовать по логам шины (`addEventListener("vaflet:f2m-reception", e => console.log(e.detail))` перед звонком) и чинить через `__ren`-репетицию.

- [ ] **Step 3: Обновить память проекта**

В `~/.claude/projects/-Users-timur-projectos-vaflet/memory/vaflet-project-state.md` — отметить: агент-сейлз построен (файлы, роуты, скрипт), статус живого смока.

- [ ] **Step 4: Финальный коммит**

```bash
git add -A && git status  # убедиться, что .env.local НЕ в индексе
git commit -m "feat: ren takes the showcase shift — live sales agent in the kiosk"
```

---

## Env-переменные (справка, руками в `.env.local`)

| Переменная | Что это |
|---|---|
| `TAVUS_ACCOUNTS` | JSON-пул `[{key, personaId, replicaId}]` — печатает provisioning-скрипт |
| `TAVUS_API_KEY` / `TAVUS_PERSONA_ID` / `TAVUS_REPLICA_ID` | легаси-фоллбэк (пул из одного) |
| `TG_BOT_TOKEN` / `TG_CHAT_ID` | доставка лидов в Telegram |
| `TURNSTILE_SECRET` | включает проверку Turnstile в `/api/reception` (прод) |



