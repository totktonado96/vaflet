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
      ["Install", "Included in the monthly bill"],
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
      ["Integrations", "wired into whatever runs your business"],
      ["Install", "part of the same monthly payment"],
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

function LeadForm({ onDone, onClose }: { onDone: (name: string) => void; onClose: () => void }) {
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const nameRef = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );
  useEffect(() => {
    // the scene is pinned — no autoFocus scroll-jump, just a plain ref
    nameRef.current?.focus({ preventScroll: true });
  }, []);
  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (state === "sending") return;
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
        if (!alive.current) return;
        emitReception({ type: "lead-submitted", name, email, note: note || undefined });
        onDone(name);
      } catch {
        if (!alive.current) return;
        setState("error");
      }
    },
    [onDone, state],
  );
  const FIELD =
    "w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2.5 text-sm font-medium text-white placeholder:text-white/35 focus:border-[#0bda51] focus:outline-none";
  return (
    <form onSubmit={submit} className={SHELL}>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Leave a note</p>
        <button
          type="button"
          aria-label="Close form"
          onClick={onClose}
          className="-mr-1 px-1 text-white/40 transition-colors hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        <input ref={nameRef} name="name" placeholder="Your name" required maxLength={120} className={FIELD} />
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
          setReceipt(null); // a card takes the receipt's slot — don't stack them
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
    // selfview can land before "live" mounts the <video> — rerun the wiring
    // once the element exists, not just once when the stream first arrives
  }, [selfview, phase]);

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
                onClose={() => setFormOpen(false)}
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
          phone with the sheet open they compress to one clamped line above it.
          The <p> itself stays mounted so the live region is stable — screen
          readers catch text changes far more reliably than element mount */}
      <p
        aria-live="polite"
        className={`display-2 pointer-events-none absolute inset-x-4 text-center font-extrabold leading-tight md:inset-x-[10%] md:bottom-24 md:text-4xl ${
          sheetOpen
            ? "bottom-[calc(45vh+1rem)] truncate text-lg md:overflow-visible md:whitespace-normal md:text-clip"
            : "bottom-24 text-2xl"
        } ${caption?.who === "user" ? "text-white/45" : "text-[#dfe7ee]"}`}
      >
        {caption?.text ?? ""}
      </p>

      {/* the product's own UI: status pill + hang up, over the kiosk's feet */}
      {(phase === "connecting" || phase === "live") && (
        <div className="pointer-events-auto absolute inset-x-0 top-16 bottom-auto z-10 flex items-center justify-center gap-3 md:top-auto md:bottom-8 md:left-auto md:right-8 md:inset-x-auto">
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
