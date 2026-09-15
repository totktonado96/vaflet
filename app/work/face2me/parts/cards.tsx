"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { reducedMotion } from "@/components/case/kit";
import {
  emitReception,
  onReception,
  type CardTopic,
  type Chip,
  type ConjureItem,
  type MatchTier,
  type NameId,
  type Phase,
  type PopupView,
} from "./reception-events";

/**
 * What Ren puts on the counter. The card layer owns everything DOM about
 * the visit: the chip rail the visitor drives the show with, the conjured
 * glass tags she throws into the void, the interactive pop-ups (the name
 * trick, the staff peek), topic cards for the phone's bottom sheet, the
 * real lead form, the captions and the status pill, and the printout at
 * the end. It reads the reception bus and writes back only UI intent
 * (chip taps, name picks, hangup, lead).
 *
 * Desktop and phone split the vocabulary: the void's sides belong to
 * conjures on desktop, while the phone — which has no empty sides — gets
 * the same facts as cards in its bottom sheet.
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

const SLOTS = [
  "md:left-[6%] md:top-[22%] md:right-auto",
  "md:right-[6%] md:top-[30%] md:left-auto",
] as const;

const MALACHITE = "#0bda51";

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

/* ------------------------------------------------------------ the rail */

/** The six chips the visitor drives the show with. Real buttons, real tab
    order; the quiet one (the honesty chip) is dimmer but never hidden. */
function ChipsRail({ chips }: { chips: Chip[] }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion() || !host.current) return;
    const tw = gsap.fromTo(
      host.current.children,
      { y: 16, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out", stagger: 0.07 },
    );
    return () => void tw.kill();
  }, []);
  return (
    <div
      ref={host}
      className="pointer-events-auto flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap md:justify-center md:overflow-visible md:pb-0"
    >
      {chips.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => emitReception({ type: "chip-pick", id: c.id })}
          className={`group relative isolate shrink-0 snap-start overflow-hidden whitespace-nowrap rounded-full border bg-black/40 px-4 py-2 text-xs font-bold backdrop-blur-sm transition-colors duration-300 hover:border-[#0bda51] hover:text-[#04140a] ${
            c.quiet ? "border-white/15 text-white/55" : "border-white/25 text-white"
          }`}
        >
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[#0bda51] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
          />
          {c.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- conjured glass */

/** One tag flying in from the deep. Mounts, lands, then bobs on its own
    slow clock; leaves by dissolving back a step into the void. */
function ConjureTag({ item, gone, onGone }: { item: ConjureItem; gone: boolean; onGone: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const enter = useRef<gsap.core.Tween | null>(null);
  const bob = useRef<gsap.core.Tween | null>(null);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (reducedMotion()) {
      gsap.set(node, { autoAlpha: 1 });
      return;
    }
    enter.current = gsap.fromTo(
      node,
      { autoAlpha: 0, z: item.z, y: 26, rotateY: item.tilt * 1.8, filter: "blur(10px)" },
      {
        autoAlpha: 1,
        z: 0,
        y: 0,
        rotateY: item.tilt,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        onComplete: () => {
          bob.current = gsap.to(node, {
            y: "-=6",
            duration: 2.6 + Math.abs(item.tilt) * 0.06,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        },
      },
    );
    return () => {
      enter.current?.kill();
      bob.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!gone) return;
    const node = el.current;
    if (!node || reducedMotion()) {
      onGone();
      return;
    }
    // a tag can be dismissed mid-flight — the entrance must not keep
    // fighting the exit for the same properties
    enter.current?.kill();
    bob.current?.kill();
    const tw = gsap.to(node, {
      autoAlpha: 0,
      z: -80,
      filter: "blur(8px)",
      duration: 0.45,
      ease: "power2.in",
      onComplete: onGone,
    });
    return () => void tw.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gone]);
  return (
    <div
      className="absolute"
      style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%, -50%)", perspective: 900 }}
    >
      <div
        ref={el}
        style={{ transformStyle: "preserve-3d", opacity: 0 }}
        className={`rounded-xl border bg-black/50 px-5 py-3 backdrop-blur-sm ${
          item.accent ? "border-[#0bda51]/45" : "border-white/20"
        }`}
      >
        <p
          className={`whitespace-nowrap font-extrabold leading-tight text-[#dfe7ee] ${
            item.size === "lg" ? "text-3xl md:text-4xl" : "text-2xl md:text-[1.7rem]"
          }`}
        >
          {item.text}
        </p>
        {item.sub && (
          <p
            className={`mt-1 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] ${
              item.accent ? "text-[#0bda51]" : "text-white/50"
            }`}
          >
            {item.sub}
          </p>
        )}
      </div>
    </div>
  );
}

/** The genie half of the show — glass tags materialize in the void around
    the kiosk. New keys fly in (staggered by their order), removed keys
    dissolve out; the phone never sees this layer, it gets cards instead. */
function ConjureLayer({ items }: { items: ConjureItem[] | null }) {
  const [tags, setTags] = useState<{ item: ConjureItem; gone: boolean }[]>([]);
  useEffect(() => {
    const next = items ?? [];
    setTags((prev) => {
      const keys = new Set(next.map((i) => i.text));
      // live tags stay (with their item refreshed), missing ones start leaving
      const kept = prev.map((t) =>
        t.gone
          ? t
          : keys.has(t.item.text)
            ? { item: next.find((i) => i.text === t.item.text)!, gone: false }
            : { ...t, gone: true },
      );
      const liveKeys = new Set(kept.filter((t) => !t.gone).map((t) => t.item.text));
      const added = next.filter((i) => !liveKeys.has(i.text)).map((item) => ({ item, gone: false }));
      // a text re-conjured while its old tag is still leaving: drop the old
      // one on the spot, or two components would share a key
      const survivors = kept.filter((t) => !(t.gone && added.some((a) => a.item.text === t.item.text)));
      return [...survivors, ...added];
    });
  }, [items]);
  const drop = useCallback((text: string) => {
    setTags((prev) => prev.filter((t) => !(t.gone && t.item.text === text)));
  }, []);
  if (tags.length === 0) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block" style={{ perspective: 1200 }}>
      {/* keys stay stable across the gone flip — the exit animation runs on
          the same mounted node; a re-added text never coexists with its
          leaving twin (the diff above drops the twin on the spot) */}
      {tags.map((t) => (
        <ConjureTag key={t.item.text} item={t.item} gone={t.gone} onGone={() => drop(t.item.text)} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------- the name trick */

/** The said name morphs into the found one — one continuous move, no
    letter-cycling — and the pass that found it stamps in beside a
    malachite dot. An exact hit skips the morph: instant is the honest
    depiction of instant. */
function TrickLine({ said, found, tier }: { said: string; found: string; tier: MatchTier }) {
  const [settled, setSettled] = useState(tier === "exact" || reducedMotion());
  useEffect(() => {
    if (settled) return;
    const id = window.setTimeout(() => setSettled(true), 60);
    return () => window.clearTimeout(id);
  }, [settled]);
  const TAG = { exact: "MATCHED · EXACT", "sounds-like": "MATCHED · SOUNDS-LIKE", fuzzy: "MATCHED · FUZZY" }[tier];
  const instant = tier === "exact" || reducedMotion();
  return (
    <div className="pointer-events-none flex flex-col items-center gap-1.5 [text-shadow:0_1px_16px_rgba(0,0,0,0.85)]">
      <span className="relative block text-2xl font-extrabold leading-tight text-[#dfe7ee] md:text-3xl">
        {/* two layers crossfade in one continuous move; the grid keeps the
            wider word's footprint so nothing reflows mid-morph */}
        <span
          className="col-start-1 row-start-1 grid transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ display: "grid" }}
        >
          <span
            aria-hidden={settled}
            className="col-start-1 row-start-1 whitespace-nowrap transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={
              instant
                ? { opacity: 0, position: "absolute" }
                : settled
                  ? { opacity: 0, letterSpacing: "0.14em", filter: "blur(5px)" }
                  : { opacity: 1, letterSpacing: "0em", filter: "blur(0px)" }
            }
          >
            {said}
          </span>
          <span
            className="col-start-1 row-start-1 whitespace-nowrap text-center transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={
              instant
                ? { opacity: 1 }
                : settled
                  ? { opacity: 1, letterSpacing: "0em", filter: "blur(0px)" }
                  : { opacity: 0, letterSpacing: "0.14em", filter: "blur(5px)" }
            }
          >
            {found}
          </span>
        </span>
      </span>
      <span
        className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.22em] text-white/60 transition-opacity duration-500"
        style={{ opacity: settled ? 1 : 0, transitionDelay: instant ? "150ms" : "950ms" }}
      >
        <span aria-hidden className="size-1.5 rounded-full" style={{ background: MALACHITE }} />
        {TAG}
      </span>
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
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Say a name</p>
      <p className="mt-2 text-xs leading-relaxed text-white/55">Pretend one of these is yours.</p>
      <div className="mt-4 flex flex-col gap-2">
        {NAMES.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => emitReception({ type: "name-pick", id: n.id })}
            className="group relative isolate w-full overflow-hidden rounded-full border border-white/25 px-4 py-2.5 text-left text-sm font-bold text-white transition-colors duration-300 hover:border-[#0bda51] hover:text-[#04140a]"
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[#0bda51] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
            />
            {n.label}
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
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Staff only</p>
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
                className="h-12 rounded-full border border-[#0bda51]/40 text-white/70 transition-all duration-200 hover:border-[#0bda51] hover:text-[#0bda51] active:scale-95"
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
          <div ref={rowRef} className="flex items-center justify-between gap-3 rounded-lg border border-white/15 px-3 py-2.5">
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
            <div key={name} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2.5">
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
        className="group relative isolate mt-4 w-full overflow-hidden rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-white transition-colors duration-300 hover:border-[#0bda51] hover:text-[#04140a] disabled:opacity-60"
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
  const [cards, setCards] = useState<CardTopic[]>([]);
  const [chips, setChips] = useState<Chip[] | null>(null);
  const [popup, setPopup] = useState<PopupView | null>(null);
  const [conjured, setConjured] = useState<ConjureItem[] | null>(null);
  const [trick, setTrick] = useState<{ said: string; found: string; tier: MatchTier } | null>(null);
  const [stub, setStub] = useState<string[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [caption, setCaption] = useState<{ who: "pal" | "user"; text: string; lang?: "es" | "ru" } | null>(null);
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const captionTimer = useRef(0);

  useEffect(
    () =>
      onReception((d) => {
        if (d.type === "phase") {
          setPhase(d.phase);
          setClosedReason(d.phase === "closed" ? d.reason : undefined);
          if (d.phase !== "live") {
            setCards([]);
            setFormOpen(false);
            setChips(null);
            setPopup(null);
            setConjured(null);
            setTrick(null);
            setSubtitle(null);
            setCaption(null);
            window.clearTimeout(captionTimer.current);
          }
          if (d.phase === "idle" || d.phase === "connecting") {
            setReceipt(null);
            setStub(null);
          }
        } else if (d.type === "card") {
          setFormOpen(false);
          setReceipt(null); // a card takes the receipt's slot — don't stack them
          // a re-shown topic stays in its slot — no silent left/right teleport
          setCards((prev) => (prev.includes(d.card) ? prev : [...prev, d.card].slice(-2)));
        } else if (d.type === "chips") {
          setChips(d.items);
        } else if (d.type === "popup") {
          setPopup(d.view);
        } else if (d.type === "conjure") {
          setConjured(d.items);
        } else if (d.type === "trick") {
          setTrick({ said: d.said, found: d.found, tier: d.tier });
        } else if (d.type === "trick-clear") {
          setTrick(null);
        } else if (d.type === "stub") {
          setStub(d.lines);
        } else if (d.type === "subtitle") {
          setSubtitle(d.text);
        } else if (d.type === "lead-form") {
          setCards((prev) => prev.slice(-1));
          setReceipt(null);
          setFormOpen(true);
        } else if (d.type === "dismiss") {
          setCards([]);
          setFormOpen(false);
          setReceipt(null); // "clear every card" includes the receipt
          setPopup(null);
          setConjured(null);
          setTrick(null);
          setStub(null);
          setSubtitle(null);
        } else if (d.type === "caption") {
          setCaption({ who: d.who, text: d.text, lang: d.lang });
          window.clearTimeout(captionTimer.current);
          captionTimer.current = window.setTimeout(() => setCaption(null), 3500);
        }
      }),
    [],
  );

  useEffect(() => () => window.clearTimeout(captionTimer.current), []);

  const sheetOpen = cards.length > 0 || formOpen || receipt !== null || popup !== null;
  const railUp = chips !== null && phase === "live";

  return (
    <div aria-hidden={phase === "idle" && !sheetOpen} className="pointer-events-none absolute inset-0 z-20">
      {/* the void's sides: conjured glass, desktop only */}
      <ConjureLayer items={conjured} />

      {/* the phone's bottom stack: chip rail as the sheet's fixed header,
          cards below it (max 45vh, captions perch above the whole stack).
          On desktop this wrapper dissolves: chips center above the
          controls, cards float in their slots. */}
      {/* bottom-20, not bottom-3: on the phone the stack must clear the
          kiosk's control buttons, which keep living at bottom-8 */}
      <div className="absolute inset-x-3 bottom-20 flex flex-col gap-3 md:static md:contents">
        {railUp && (
          <div className="md:absolute md:inset-x-0 md:bottom-[6.5rem] md:z-10 md:flex md:justify-center md:px-6">
            <ChipsRail chips={chips!} />
          </div>
        )}
        <div className="flex max-h-[45vh] flex-col-reverse gap-3 overflow-y-auto md:static md:max-h-none md:overflow-visible">
          {/* interactive pop-ups — the right-hand slot is theirs */}
          {popup === "names" && (
            <div className={`md:absolute ${SLOTS[1]}`}>
              <Rise k="popup-names">
                <NamesCard />
              </Rise>
            </div>
          )}
          {popup === "staff" && (
            <div className={`md:absolute ${SLOTS[1]}`}>
              <Rise k="popup-staff">
                <StaffCard />
              </Rise>
            </div>
          )}
          {/* topic cards carry the facts on the phone; the desktop hears
              them as conjures instead */}
          {cards.map((topic) => (
            <div key={topic} className="md:hidden">
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
          {/* the visit ended (she wrapped, gave up quietly, or you walked):
              back to the top of the tape, with the door held open */}
          {phase === "over" && !receipt && (
            <div className={`md:absolute ${SLOTS[0]}`}>
              <Rise k="over">
                <div className={SHELL}>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Back to work</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Recording&apos;s back at the top. Ring again, or leave a note.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => emitReception({ type: "call-request" })}
                      className="group relative isolate w-full overflow-hidden rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-white transition-colors duration-300 hover:border-[#0bda51] hover:text-[#04140a]"
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
      </div>

      {/* captions — the conversation reads as a page. With the chip rail up
          they step above it; on the phone with the sheet open they compress
          to one clamped line above the whole stack. The <p> itself stays
          mounted so the live region is stable — screen readers catch text
          changes far more reliably than element mount. The language ripple
          and the name trick live directly beneath the caption line. */}
      <div
        className={`pointer-events-none absolute inset-x-4 flex flex-col items-center gap-2 text-center md:inset-x-[10%] ${
          sheetOpen && !railUp
            ? "bottom-[calc(45vh+1rem)]"
            : sheetOpen
              ? "bottom-[calc(45vh+4.5rem)] md:bottom-[10.5rem]"
              : railUp
                ? "bottom-[7.5rem] md:bottom-[10.5rem]"
                : "bottom-24"
        }`}
      >
        <p
          aria-live="polite"
          lang={caption?.lang}
          className={`display-2 font-extrabold leading-tight md:text-4xl ${
            sheetOpen ? "w-full truncate text-lg md:overflow-visible md:whitespace-normal md:text-clip" : "text-2xl"
          } ${caption?.who === "user" ? "text-white/45" : "text-[#dfe7ee]"}`}
        >
          {caption?.text ?? ""}
        </p>
        {/* the name trick, told to screen readers: a persistent quiet live
            region — the visual morph itself is decoration to AT */}
        <p aria-live="polite" className="sr-only">
          {trick ? `Matched: ${trick.found} — ${trick.tier} pass` : ""}
        </p>
        {subtitle && (
          <p className="text-sm font-bold tracking-[0.08em] text-white/50 [text-shadow:0_1px_14px_rgba(0,0,0,0.8)] transition-opacity duration-500 md:text-base">
            {subtitle}
          </p>
        )}
        {trick && <TrickLine said={trick.said} found={trick.found} tier={trick.tier} />}
      </div>

      {/* the kiosk's own status: a pill with a dot and a word — no meter,
          nothing here is being charged for */}
      {(phase === "connecting" || phase === "live") && (
        <div className="pointer-events-auto absolute inset-x-0 top-16 bottom-auto z-10 flex items-center justify-center gap-3 md:top-auto md:bottom-8 md:left-auto md:right-8 md:inset-x-auto">
          <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm">
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
              className="rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:border-white/60"
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
