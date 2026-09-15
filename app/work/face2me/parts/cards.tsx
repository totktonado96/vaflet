"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { reducedMotion } from "@/components/case/kit";
import {
  emitReception,
  onReception,
  type Chip,
  type ChipId,
  type GlassIntent,
  type MatchTier,
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

const MALACHITE = "#0bda51";

/** the one slot beside the machine where physical UI lands on desktop —
    under the playbill on the right, clear of her caption column */
const POP_SLOT = "md:absolute md:right-[5%] md:left-auto md:top-[56%]";

function Rise({ children, k }: { children: React.ReactNode; k: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion() || !el.current) return;
    const tws = [
      gsap.fromTo(
        el.current,
        { y: 22, autoAlpha: 0, filter: "blur(6px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out" },
      ),
    ];
    // the card's own rows deal themselves in a beat behind the shell
    const rows = el.current.querySelectorAll("[data-row]");
    if (rows.length) {
      tws.push(
        gsap.fromTo(
          rows,
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out", stagger: 0.055, delay: 0.16 },
        ),
      );
    }
    return () => tws.forEach((t) => t.kill());
  }, [k]);
  return (
    <div ref={el} className="pointer-events-auto">
      {children}
    </div>
  );
}

/** A spoken line arrives word by word — the same way the site's own
    reveals breathe, not a text swap. The visible words are decoration;
    the live region reads the whole line. */
function Words({ text, from = 18 }: { text: string; from?: number }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (reducedMotion() || !el.current) return;
    const tw = gsap.fromTo(
      el.current.children,
      { y: from, autoAlpha: 0, filter: "blur(5px)" },
      { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out", stagger: 0.05 },
    );
    return () => void tw.kill();
  }, [text, from]);
  return (
    <span ref={el}>
      {/* hyphenated words split into their own segments — an inline-block
          is atomic, and "five-ninety-nine" must still be able to wrap */}
      {text
        .split(" ")
        .flatMap((w, i) => w.split(/(?<=-)/).map((seg, j, arr) => ({ seg: j === arr.length - 1 ? seg + " " : seg, k: `${i}-${j}` })))
        .map(({ seg, k }) => (
          <span key={k} className="inline-block whitespace-pre will-change-transform">
            {seg}
          </span>
        ))}
    </span>
  );
}

/** the physical cards: near-black glass, a malachite hairline along the
    top edge — the kiosk's own material, not a generic dark panel */
const SHELL =
  "w-[19rem] max-w-[86vw] rounded-xl bg-[#0b1114]/90 p-5 text-[#dfe7ee] backdrop-blur-md " +
  "shadow-[inset_0_1px_0_0_rgba(11,218,81,0.4),0_0_0_1px_rgba(255,255,255,0.06),0_24px_70px_rgba(0,0,0,0.65)]";

/* ---------------------------------------------------------- the playbill */

/** The chips: a quiet playbill down the right edge of the void on desktop
    — bare set text, a malachite dot sliding in on the one you're on — and
    a soft horizontal strip above the sheet on the phone. Real buttons,
    real tab order; the honesty chip is dimmer but never hidden. */
function ChipsRail({ chips, active }: { chips: Chip[]; active: ChipId | null }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion() || !host.current) return;
    // the playbill slides in from the wing it lives in
    const tw = gsap.fromTo(
      host.current.children,
      { y: 10, x: 26, autoAlpha: 0, filter: "blur(4px)" },
      { y: 0, x: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out", stagger: 0.09 },
    );
    return () => void tw.kill();
  }, []);
  return (
    <div
      ref={host}
      className="pointer-events-auto flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-col md:items-end md:gap-2.5 md:overflow-visible md:pb-0"
    >
      {/* the same button species as the bell on the pedestal: dark pills
          with a ring and a malachite fill rising on hover — everything
          pressable on this stage looks equally pressable */}
      {chips.map((c) => {
        const on = active === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => emitReception({ type: "chip-pick", id: c.id })}
            className={`group relative isolate flex shrink-0 snap-start items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full bg-[#0b1114]/85 px-4 py-2 text-xs font-bold backdrop-blur-sm transition-all duration-300 hover:text-[#04140a] active:scale-[0.97] md:px-5 md:py-2.5 md:text-sm ${
              c.quiet ? "md:mt-3" : ""
            } ${
              on
                ? "text-white shadow-[0_0_0_1px_rgba(11,218,81,0.6)]"
                : c.quiet
                  ? "text-white/45 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] hover:text-[#04140a]"
                  : "text-white/85 shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
            }`}
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[#0bda51] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
            />
            <span
              aria-hidden
              className="size-1.5 rounded-full transition-all duration-300"
              style={{
                background: on ? MALACHITE : "rgba(255,255,255,0.25)",
                transform: on ? "scale(1.25)" : "scale(1)",
              }}
            />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------- the pop-ups */

/** The glass is the interface: invisible buttons laid exactly over the
    dot-matrix menu lines the scene draws. Hovering one tells the scene to
    burn that line hotter; tapping one is tapping the kiosk itself. */
function GlassMenu({
  items,
  geom,
}: {
  items: { line: number; label: string; intent: GlassIntent }[];
  geom: { rect: { x: number; y: number; w: number; h: number }; bands: { a: number; b: number }[] };
}) {
  const hot = (line: number | null) => emitReception({ type: "screen-hot", line });
  const pick = (intent: GlassIntent) => {
    hot(null);
    if (intent.kind === "name") emitReception({ type: "name-pick", id: intent.id });
    else if (intent.kind === "action") emitReception({ type: "action-pick", id: intent.id });
    else emitReception({ type: "slot-pick", slot: intent.slot });
  };
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: geom.rect.x, top: geom.rect.y, width: geom.rect.w, height: geom.rect.h }}
    >
      {items.map((it) => {
        const b = geom.bands[it.line];
        if (!b) return null;
        return (
          <button
            key={it.line}
            type="button"
            aria-label={it.label}
            onMouseEnter={() => hot(it.line)}
            onMouseLeave={() => hot(null)}
            onFocus={() => hot(it.line)}
            onBlur={() => hot(null)}
            onClick={() => pick(it.intent)}
            className="pointer-events-auto absolute inset-x-0 cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0bda51]/70"
            style={{ top: `${b.a * 100}%`, height: `${(b.b - b.a) * 100}%` }}
          />
        );
      })}
    </div>
  );
}

/** The staff panel, peeked at. A PIN pad that admits it's a prop, then the
    queue staff actually see — the top row stamped the second someone
    walks in. */
function StaffCard({ visitor }: { visitor?: string }) {
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
          {/* diegetic machine text — PIN-locked on the shipped desk */}
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] leading-relaxed text-white/45">
            Enter any four digits.
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
          {/* the loop closes: if you checked in two chips ago, the top of
              the queue is you — the demo remembers its own visitor */}
          <div ref={rowRef} className="flex items-center justify-between gap-3 rounded-lg bg-white/8 px-3 py-2.5">
            <p className="whitespace-nowrap text-sm font-bold">
              {visitor ? `${visitor.split(" ")[0][0]}. ${visitor.split(" ").slice(1).join(" ")}` : "R. Delgado"}
            </p>
            <span
              ref={stampRef}
              className="whitespace-nowrap rounded-full border border-[#0bda51]/50 px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.16em] text-[#0bda51]"
            >
              ARRIVED · {time}
            </span>
          </div>
          {/* the rest of the queue steps aside for the real visitor */}
          {(visitor
            ? [
                ["R. Delgado", "waiting 4 min"],
                ["S. Chen", "waiting 11 min"],
              ]
            : [
                ["M. Volkov", "waiting 4 min"],
                ["S. Chen", "waiting 11 min"],
              ]
          ).map(([name, status]) => (
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
      // the class keeps the resting -1.2deg; the tween adds a settle on top
      { yPercent: -104, rotation: -3.5 },
      { yPercent: 0, rotation: 0, duration: 0.9, ease: "power2.out" },
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
  const [chips, setChips] = useState<Chip[] | null>(null);
  const [activeChip, setActiveChip] = useState<ChipId | null>(null);
  const [popup, setPopup] = useState<{ view: PopupView; visitor?: string; checkedIn?: boolean } | null>(null);
  const [talking, setTalking] = useState(false);
  const [trick, setTrick] = useState<{ found: string; tier: MatchTier } | null>(null);
  const [stub, setStub] = useState<string[] | null>(null);
  const [glassMenu, setGlassMenu] = useState<{ line: number; label: string; intent: GlassIntent }[] | null>(null);
  const [glassGeom, setGlassGeom] = useState<{
    rect: { x: number; y: number; w: number; h: number };
    bands: { a: number; b: number }[];
  } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [caption, setCaption] = useState<{ text: string; lang?: "es" | "ru" } | null>(null);
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const captionTimer = useRef(0);

  useEffect(
    () =>
      onReception((d) => {
        if (d.type === "phase") {
          setPhase(d.phase);
          setClosedReason(d.phase === "closed" ? d.reason : undefined);
          if (d.phase !== "live") {
            setFormOpen(false);
            setChips(null);
            setActiveChip(null);
            setPopup(null);
            setTalking(false);
            setTrick(null);
            setSubtitle(null);
            setCaption(null);
            setGlassMenu(null);
            window.clearTimeout(captionTimer.current);
          }
          if (d.phase === "idle" || d.phase === "connecting") {
            setReceipt(null);
            setStub(null);
          }
        } else if (d.type === "chips") {
          setChips(d.items);
          if (d.items === null) setActiveChip(null);
        } else if (d.type === "chip-pick") {
          setActiveChip(d.id);
        } else if (d.type === "popup") {
          setPopup(d.view === null ? null : { view: d.view, visitor: d.visitor, checkedIn: d.checkedIn });
        } else if (d.type === "screen-menu") {
          setGlassMenu(d.items);
        } else if (d.type === "screen-geom") {
          setGlassGeom({ rect: d.rect, bands: d.bands });
        } else if (d.type === "speaking" && d.who === "pal") {
          setTalking(d.on);
        } else if (d.type === "trick") {
          setTrick({ found: d.found, tier: d.tier });
        } else if (d.type === "trick-clear") {
          setTrick(null);
        } else if (d.type === "stub") {
          setStub(d.lines);
        } else if (d.type === "subtitle") {
          setSubtitle(d.text);
        } else if (d.type === "lead-form") {
          setReceipt(null);
          setPopup(null); // the form takes the counter — one thing at a time
          setFormOpen(true);
        } else if (d.type === "dismiss") {
          setFormOpen(false);
          setReceipt(null); // "clear every card" includes the receipt
          setPopup(null);
          setTrick(null);
          setStub(null);
          setSubtitle(null);
        } else if (d.type === "caption") {
          // only her lines render — your own pick already glowed under
          // your finger on the glass, echoing it in type was noise
          if (d.who === "pal") {
            setCaption({ text: d.text, lang: d.lang });
            window.clearTimeout(captionTimer.current);
            captionTimer.current = window.setTimeout(() => setCaption(null), 3500);
          }
        }
      }),
    [],
  );

  useEffect(() => () => window.clearTimeout(captionTimer.current), []);

  const sheetOpen = formOpen || receipt !== null || popup !== null;
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
          <div className="md:absolute md:right-[5%] md:top-[24%] md:z-10">
            <ChipsRail chips={chips!} active={activeChip} />
          </div>
        )}
        <div className="flex max-h-[45vh] flex-col-reverse gap-3 overflow-y-auto md:static md:max-h-none md:overflow-visible">
          {popup?.view === "staff" && (
            <div className={POP_SLOT}>
              <Rise k="popup-staff">
                <StaffCard visitor={popup.visitor} />
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
                    She&apos;s on shift whenever you are. Ring again, or leave a note — the founders call back.
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
        className={`pointer-events-none absolute inset-x-4 flex flex-col items-center gap-2 text-center md:inset-x-auto md:left-[5%] md:top-[30%] md:w-[27vw] md:items-start md:text-left ${
          sheetOpen ? "bottom-[calc(45vh+6rem)]" : railUp ? "bottom-[8.5rem]" : "bottom-24"
        } md:bottom-auto`}
      >
        {/* she's mid-sentence: a small malachite pulse keeps time with her
            voice — pure CSS, gone under reduced motion with everything else */}
        <span
          aria-hidden
          className="flex h-3 items-end gap-[3px] transition-opacity duration-500"
          style={{ opacity: talking ? 1 : 0 }}
        >
          {[0.9, 1.4, 1.1].map((d, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full motion-reduce:animate-none"
              style={{
                height: "100%",
                background: MALACHITE,
                transformOrigin: "bottom",
                animation: `f2m-eq ${d}s ease-in-out ${i * 0.14}s infinite`,
              }}
            />
          ))}
        </span>
        <style>{`@keyframes f2m-eq { 0%, 100% { transform: scaleY(0.25); } 50% { transform: scaleY(1); } }`}</style>
        {/* no display-2 here on purpose: its clamp size fought every size
            utility (the grabli this page keeps hitting) — the look is
            rebuilt from explicit utilities, and the width lives ON the
            paragraph so a flex column can never let it grow past the kiosk */}
        <p
          aria-live="polite"
          lang={caption?.lang}
          className={`w-full max-w-full font-extrabold tracking-[-0.02em] text-[#dfe7ee] md:text-[2.5rem] md:leading-[1.1] ${
            sheetOpen
              ? "truncate text-lg leading-tight md:overflow-visible md:whitespace-normal md:text-clip"
              : "text-[1.6rem] leading-tight"
          }`}
        >
          {/* the animated words are decoration; the live region reads whole lines */}
          <span className="sr-only">{caption?.text ?? ""}</span>
          <span aria-hidden>{caption && <Words key={caption.text} text={caption.text} />}</span>
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

      {/* the kiosk's own touch layer: invisible buttons over the glass
          menu lines the scene draws — hovering burns the line, tapping IS
          the interaction. This is the product's actual surface. */}
      {glassMenu && glassGeom && phase === "live" && (
        <div className="pointer-events-none absolute inset-0">
          <GlassMenu items={glassMenu} geom={glassGeom} />
        </div>
      )}

      {/* the kiosk's own status: a pill with a dot and a word — no meter,
          nothing here is being charged for */}
      {(phase === "connecting" || phase === "live") && (
        <div className="absolute inset-x-0 top-16 bottom-auto z-10 flex items-center justify-center md:top-auto md:bottom-8 md:left-auto md:right-8 md:inset-x-auto">
          <Rise k={`pill-${phase}`}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-full bg-black/55 px-4 py-2 text-xs font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm">
                <span
                  aria-hidden
                  className={`size-2 rounded-full ${phase === "live" ? "bg-[#0bda51]" : "animate-pulse bg-white/50"}`}
                />
                <span>{phase === "live" ? "On shift" : "She heard the bell…"}</span>
              </div>
              {phase === "live" && (
                <button
                  type="button"
                  onClick={() => emitReception({ type: "hangup-request" })}
                  className="rounded-full bg-black/55 px-4 py-2 text-xs font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm transition-all hover:text-[#0bda51] active:scale-95"
                >
                  End the visit
                </button>
              )}
            </div>
          </Rise>
        </div>
      )}

      {/* the printout — a finished visit gets a physical full stop */}
      {stub && <TicketStub lines={stub} />}
    </div>
  );
}
