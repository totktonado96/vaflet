"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { reducedMotion } from "@/components/case/kit";
import {
  emitReception,
  onReception,
  type CardTopic,
  type Chip,
  type ChipId,
  type MatchTier,
  type NameId,
  type Phase,
  type PopupView,
} from "./reception-events";

/**
 * What surrounds the screen. The kiosk's own dot matrix does the showing
 * now (hero-scene renders the director's slides into it) — this layer owns
 * the theatre around the machine: Ren's lines set huge in the left half of
 * the void, the visitor's taps echoed on the right, the chip playbill down
 * the right edge, the interactive pop-ups (name roster, staff peek), the
 * real lead form, the status pill and the printout. It reads the reception
 * bus and writes back only UI intent.
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
      ["Built in", "New York"],
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

const MALACHITE = "#0bda51";

/** the one slot beside the machine where physical UI lands on desktop —
    under the playbill on the right, clear of her caption column */
const POP_SLOT = "md:absolute md:right-[5%] md:left-auto md:top-[57%]";

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

/** the physical cards: near-black glass, a malachite hairline along the
    top edge — the kiosk's own material, not a generic dark panel */
const SHELL =
  "w-[19rem] max-w-[86vw] rounded-xl bg-[#0b1114]/90 p-5 text-[#dfe7ee] backdrop-blur-md " +
  "shadow-[inset_0_1px_0_0_rgba(11,218,81,0.4),0_0_0_1px_rgba(255,255,255,0.06),0_24px_70px_rgba(0,0,0,0.65)]";

function TopicCard({ topic, onClose }: { topic: CardTopic; onClose: () => void }) {
  const d = CARD_DATA[topic];
  return (
    <div className={SHELL}>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">{d.title}</p>
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

/* ---------------------------------------------------------- the playbill */

/** The chips: a quiet playbill down the right edge of the void on desktop
    — bare set text, a malachite dot sliding in on the one you're on — and
    a soft horizontal strip above the sheet on the phone. Real buttons,
    real tab order; the honesty chip is dimmer but never hidden. */
function ChipsRail({ chips, active }: { chips: Chip[]; active: ChipId | null }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion() || !host.current) return;
    const tw = gsap.fromTo(
      host.current.children,
      { y: 14, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out", stagger: 0.08 },
    );
    return () => void tw.kill();
  }, []);
  return (
    <div
      ref={host}
      className="pointer-events-auto flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-col md:items-end md:gap-4 md:overflow-visible md:pb-0"
    >
      {chips.map((c) => {
        const on = active === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => emitReception({ type: "chip-pick", id: c.id })}
            className={`group flex shrink-0 snap-start items-center gap-2.5 whitespace-nowrap rounded-full bg-white/10 px-3.5 py-2 text-xs font-bold backdrop-blur-sm transition-all duration-300 md:justify-end md:rounded-none md:bg-transparent md:px-0 md:py-0 md:text-[13px] md:uppercase md:tracking-[0.18em] md:backdrop-blur-none ${
              c.quiet
                ? on
                  ? "text-white/80"
                  : "text-white/35 hover:text-white/70 md:mt-3"
                : on
                  ? "text-white md:translate-x-[-2px]"
                  : "text-white/60 hover:text-white"
            }`}
          >
            {c.label}
            <span
              aria-hidden
              className="hidden size-1.5 rounded-full transition-all duration-300 md:inline-block"
              style={{
                background: MALACHITE,
                opacity: on ? 1 : 0,
                transform: on ? "scale(1)" : "scale(0)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------- the pop-ups */

function NamesCard() {
  const NAMES: { id: NameId; label: string }[] = [
    { id: "maria", label: "Maria Lopez" },
    { id: "mikhael", label: "Mikhael" },
    { id: "zeynep", label: "Zeynep" },
  ];
  return (
    <div className={SHELL}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Say a name</p>
      <p className="mt-2 text-xs leading-relaxed text-white/55">Pretend one of these is yours.</p>
      <div className="mt-4 flex flex-col gap-2">
        {NAMES.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => emitReception({ type: "name-pick", id: n.id })}
            className="group flex w-full items-center justify-between rounded-lg bg-white/8 px-4 py-2.5 text-left text-sm font-bold text-white transition-colors duration-300 hover:bg-[#0bda51] hover:text-[#04140a]"
          >
            {n.label}
            <span aria-hidden className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The staff panel, peeked at. A PIN pad that admits it's a prop, then the
    queue staff actually see — the top row stamped the second someone
    walks in. */
function StaffCard() {
  const [taps, setTaps] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [time, setTime] = useState("");
  const stampRef = useRef<HTMLSpanElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const unlockTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(unlockTimer.current), []);

  const tap = () => {
    if (unlocked) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 4) {
      const now = new Date();
      setTime(
        `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() < 12 ? "AM" : "PM"}`,
      );
      // tracked and cleared on unmount — a leftover pad timer must not fire
      // into a visit that has already moved on (the director double-checks
      // the active topic too)
      unlockTimer.current = window.setTimeout(() => {
        setUnlocked(true);
        emitReception({ type: "staff-unlocked" });
      }, 350);
    }
  };

  useEffect(() => {
    if (!unlocked || reducedMotion()) return;
    const tws = [
      rowRef.current &&
        gsap.fromTo(
          rowRef.current,
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" },
        ),
      stampRef.current &&
        gsap.fromTo(
          stampRef.current,
          { scale: 1.3, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)", delay: 0.4 },
        ),
    ];
    return () => tws.forEach((t) => t && t.kill());
  }, [unlocked]);

  return (
    <div className={SHELL}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Staff only</p>
      {!unlocked ? (
        <>
          {/* diegetic machine text — the prop says so itself */}
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] leading-relaxed text-white/45">
            Any four digits. This part&apos;s rehearsed too.
          </p>
          <div className="mx-auto mt-4 grid w-40 grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                type="button"
                aria-label="PIN digit"
                onClick={tap}
                className="h-12 rounded-lg bg-white/8 text-[#0bda51] transition-all duration-200 hover:bg-white/15 active:scale-95"
              >
                ·
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                aria-hidden
                className="size-1.5 rounded-full transition-colors duration-300"
                style={{ background: i < taps ? MALACHITE : "rgba(255,255,255,0.2)" }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-col gap-2.5">
          <div ref={rowRef} className="flex items-center justify-between gap-3 rounded-lg bg-white/8 px-3 py-2.5">
            <p className="text-sm font-bold">R. Delgado</p>
            <span
              ref={stampRef}
              className="rounded-full border border-[#0bda51]/50 px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.16em] text-[#0bda51]"
            >
              ARRIVED · {time}
            </span>
          </div>
          {[
            ["M. Volkov", "waiting 4 min"],
            ["S. Chen", "waiting 11 min"],
          ].map(([name, status]) => (
            <div key={name} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2.5">
              <p className="text-sm font-bold text-white/80">{name}</p>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">{status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------- the printout */

/** teeth along the stub's top edge — a machine tore this off for you */
const PERF = (() => {
  const teeth = 18;
  const pts: string[] = ["0% 100%", "0% 3%"];
  for (let i = 0; i < teeth; i++) {
    pts.push(`${((i + 0.5) / teeth) * 100}% 0%`, `${((i + 1) / teeth) * 100}% 3%`);
  }
  pts.push("100% 100%");
  return `polygon(${pts.join(", ")})`;
})();

function TicketStub({ lines }: { lines: string[] }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion() || !el.current) return;
    const tw = gsap.fromTo(
      el.current,
      { yPercent: -104 },
      { yPercent: 0, duration: 0.9, ease: "power2.out" },
    );
    return () => void tw.kill();
  }, []);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[46%] w-64 -translate-x-1/2 overflow-hidden md:top-[44%]"
    >
      <div
        ref={el}
        className="rotate-[-1.2deg] bg-[#eef1f4] px-5 pb-5 pt-6 font-mono text-[10px] font-bold leading-[2] tracking-[0.14em] text-[#10222c]"
        style={{ clipPath: PERF }}
      >
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ lead form */

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
    "w-full rounded-lg bg-white/8 px-3 py-2.5 text-sm font-medium text-white placeholder:text-white/35 outline-none focus:ring-1 focus:ring-[#0bda51]";
  return (
    <form onSubmit={submit} className={SHELL}>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Leave a note</p>
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
        className="group relative isolate mt-4 w-full overflow-hidden rounded-full bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors duration-300 hover:text-[#04140a] disabled:opacity-60"
      >
        <span
          aria-hidden
          className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[#0bda51] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
        />
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

/* ------------------------------------------------------------ the layer */

export function CardLayer() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [closedReason, setClosedReason] = useState<"minutes" | "denied" | undefined>(undefined);
  const [card, setCard] = useState<CardTopic | null>(null);
  const [chips, setChips] = useState<Chip[] | null>(null);
  const [activeChip, setActiveChip] = useState<ChipId | null>(null);
  const [popup, setPopup] = useState<PopupView | null>(null);
  const [trick, setTrick] = useState<{ found: string; tier: MatchTier } | null>(null);
  const [stub, setStub] = useState<string[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [caption, setCaption] = useState<{ text: string; lang?: "es" | "ru" } | null>(null);
  const [echo, setEcho] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const captionTimer = useRef(0);
  const echoTimer = useRef(0);

  useEffect(
    () =>
      onReception((d) => {
        if (d.type === "phase") {
          setPhase(d.phase);
          setClosedReason(d.phase === "closed" ? d.reason : undefined);
          if (d.phase !== "live") {
            setCard(null);
            setFormOpen(false);
            setChips(null);
            setActiveChip(null);
            setPopup(null);
            setTrick(null);
            setSubtitle(null);
            setCaption(null);
            setEcho(null);
            window.clearTimeout(captionTimer.current);
            window.clearTimeout(echoTimer.current);
          }
          if (d.phase === "idle" || d.phase === "connecting") {
            setReceipt(null);
            setStub(null);
          }
        } else if (d.type === "card") {
          setFormOpen(false);
          setReceipt(null); // a card takes the counter's slot — don't stack
          setCard(d.card);
        } else if (d.type === "chips") {
          setChips(d.items);
          if (d.items === null) setActiveChip(null);
        } else if (d.type === "chip-pick") {
          setActiveChip(d.id);
        } else if (d.type === "popup") {
          setPopup(d.view);
        } else if (d.type === "trick") {
          setTrick({ found: d.found, tier: d.tier });
        } else if (d.type === "trick-clear") {
          setTrick(null);
        } else if (d.type === "stub") {
          setStub(d.lines);
        } else if (d.type === "subtitle") {
          setSubtitle(d.text);
        } else if (d.type === "lead-form") {
          setCard(null);
          setReceipt(null);
          setFormOpen(true);
        } else if (d.type === "dismiss") {
          setCard(null);
          setFormOpen(false);
          setReceipt(null); // "clear every card" includes the receipt
          setPopup(null);
          setTrick(null);
          setStub(null);
          setSubtitle(null);
        } else if (d.type === "caption") {
          if (d.who === "pal") {
            setCaption({ text: d.text, lang: d.lang });
            window.clearTimeout(captionTimer.current);
            captionTimer.current = window.setTimeout(() => setCaption(null), 3500);
          } else {
            setEcho(d.text);
            window.clearTimeout(echoTimer.current);
            echoTimer.current = window.setTimeout(() => setEcho(null), 2800);
          }
        }
      }),
    [],
  );

  useEffect(
    () => () => {
      window.clearTimeout(captionTimer.current);
      window.clearTimeout(echoTimer.current);
    },
    [],
  );

  const sheetOpen = card !== null || formOpen || receipt !== null || popup !== null;
  const railUp = chips !== null && phase === "live";

  return (
    <div aria-hidden={phase === "idle" && !sheetOpen} className="pointer-events-none absolute inset-0 z-20">
      {/* the phone's bottom stack: chip strip as the sheet's fixed header,
          cards below it (max 45vh, the caption perches above the whole
          stack), everything clear of the kiosk's control buttons at
          bottom-8. On desktop this wrapper dissolves: the playbill takes
          the right edge, cards the slot under her caption. */}
      <div className="absolute inset-x-3 bottom-20 flex flex-col gap-3 md:static md:contents">
        {railUp && (
          <div className="md:absolute md:right-[5%] md:top-[31%] md:z-10">
            <ChipsRail chips={chips!} active={activeChip} />
          </div>
        )}
        <div className="flex max-h-[45vh] flex-col-reverse gap-3 overflow-y-auto md:static md:max-h-none md:overflow-visible">
          {popup === "names" && (
            <div className={POP_SLOT}>
              <Rise k="popup-names">
                <NamesCard />
              </Rise>
            </div>
          )}
          {popup === "staff" && (
            <div className={POP_SLOT}>
              <Rise k="popup-staff">
                <StaffCard />
              </Rise>
            </div>
          )}
          {/* one fact card at a time — a reference sheet beside the show,
              never a gallery of panels */}
          {card && !popup && (
            <div className={POP_SLOT}>
              <Rise k={card}>
                <TopicCard topic={card} onClose={() => setCard(null)} />
              </Rise>
            </div>
          )}
          {formOpen && (
            <div className={POP_SLOT}>
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
            <div className={POP_SLOT}>
              <Rise k="receipt">
                <div className={SHELL}>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0bda51]">
                    Note taken
                  </p>
                  <p className="mt-3 text-sm leading-relaxed">
                    Left at the desk, {receipt}. The founders call back — a human one, this time.
                  </p>
                </div>
              </Rise>
            </div>
          )}
          {/* the visit ended (she wrapped, gave up quietly, or you walked):
              back to the top of the tape, with the door held open */}
          {phase === "over" && !receipt && !formOpen && (
            <div className={POP_SLOT}>
              <Rise k="over">
                <div className={SHELL}>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Back to work
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Recording&apos;s back at the top. Ring again, or leave a note.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => emitReception({ type: "call-request" })}
                      className="group relative isolate w-full overflow-hidden rounded-full bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors duration-300 hover:text-[#04140a]"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[#0bda51] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
                      />
                      Ring again
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormOpen(true)}
                      className="w-full rounded-full bg-white/8 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:text-[#0bda51]"
                    >
                      Leave a note
                    </button>
                  </div>
                </div>
              </Rise>
            </div>
          )}
          {phase === "closed" && !receipt && (
            <div className={POP_SLOT}>
              <Rise k="closed">
                <div className={SHELL}>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
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
                    className="mt-4 w-full rounded-full bg-white/8 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:text-[#0bda51]"
                  >
                    Leave a note
                  </button>
                </div>
              </Rise>
            </div>
          )}
        </div>
      </div>

      {/* Ren's lines own the LEFT half of the void, set huge and left-flush
          — the machine keeps the frame, the words keep the margin. On the
          phone they drop back to a centered line above the stack. The <p>
          stays mounted so the live region is stable. */}
      <div
        className={`pointer-events-none absolute inset-x-4 flex flex-col items-center gap-2 text-center md:inset-x-auto md:left-[5%] md:top-[30%] md:w-[29vw] md:items-start md:text-left ${
          sheetOpen ? "bottom-[calc(45vh+6rem)]" : railUp ? "bottom-[8.5rem]" : "bottom-24"
        } md:bottom-auto`}
      >
        <p
          aria-live="polite"
          lang={caption?.lang}
          className={`display-2 font-extrabold text-[#dfe7ee] md:text-[2.1rem] md:leading-[1.12] ${
            sheetOpen ? "w-full truncate text-lg leading-tight md:w-auto md:overflow-visible md:whitespace-normal md:text-clip" : "text-2xl leading-tight"
          }`}
        >
          {caption?.text ?? ""}
        </p>
        {subtitle && (
          <p className="text-sm font-bold tracking-[0.08em] text-white/50 [text-shadow:0_1px_14px_rgba(0,0,0,0.8)] md:text-base">
            {subtitle}
          </p>
        )}
        {/* the name trick, told to screen readers — the dots on the glass
            are decoration to AT */}
        <p aria-live="polite" className="sr-only">
          {trick ? `Matched: ${trick.found} — ${trick.tier} pass` : ""}
        </p>
      </div>

      {/* the visitor's tap, echoed on the RIGHT — the other voice of the
          conversation gets the other margin (desktop only; the phone's
          chips already show what was pressed) */}
      <p
        aria-hidden
        className="display-2 pointer-events-none absolute right-[5%] top-[20%] hidden w-[22vw] text-right text-2xl font-extrabold leading-tight text-white/35 md:block"
      >
        {echo ?? ""}
      </p>

      {/* the kiosk's own status: a pill with a dot and a word — no meter,
          nothing here is being charged for */}
      {(phase === "connecting" || phase === "live") && (
        <div className="pointer-events-auto absolute inset-x-0 top-16 bottom-auto z-10 flex items-center justify-center gap-3 md:top-auto md:bottom-8 md:left-auto md:right-8 md:inset-x-auto">
          <div className="flex items-center gap-2.5 rounded-full bg-black/55 px-4 py-2 text-xs font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm">
            <span
              aria-hidden
              className={`size-2 rounded-full ${phase === "live" ? "bg-[#0bda51]" : "animate-pulse bg-white/50"}`}
            />
            <span>{phase === "live" ? "On the record" : "She heard the bell…"}</span>
          </div>
          {phase === "live" && (
            <button
              type="button"
              onClick={() => emitReception({ type: "hangup-request" })}
              className="rounded-full bg-black/55 px-4 py-2 text-xs font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm transition-colors hover:text-[#0bda51]"
            >
              End the visit
            </button>
          )}
        </div>
      )}

      {/* the printout — a finished visit gets a physical full stop */}
      {stub && <TicketStub lines={stub} />}
    </div>
  );
}
