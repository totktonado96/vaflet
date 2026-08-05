"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reducedMotion } from "@/components/case/kit";

/**
 * The box, exploded. Seven systems as seven physical layers of the kiosk,
 * drawn as an isometric stack of neumorphic plates — interface on top,
 * survival at the bottom. The stack unfolds once when scrolled into view,
 * then a slow autopilot walks the layers; hovering (or tapping) a row
 * pins its layer up out of the stack. The rows and the stack are the same
 * list — the section has one subject, seen twice.
 */

type System = {
  tag: string;
  note: string;
  icon: React.ReactNode;
  /** the engraving on the underside — what's actually machined into the layer */
  back: string[];
};

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* top of the stack first — what a visitor meets, down to what keeps the
   kiosk alive in a real lobby. Facts from the engine itself:
   github.com/tr00x/Kiosk-AI-Agent-Avatar-Tavus */
export const SYSTEMS: System[] = [
  {
    tag: "Face",
    note: "A real face on the screen — it speaks, it lip-syncs, it looks at you. Not a chatbot with a headshot.",
    icon: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <circle cx="12" cy="12" r="7.2" />
        <circle cx="9.6" cy="10.6" r="0.4" fill="currentColor" />
        <circle cx="14.4" cy="10.6" r="0.4" fill="currentColor" />
        <path d="M9.4 14.3c1 1.1 4.2 1.1 5.2 0" />
      </svg>
    ),
    back: ["a live face, not a loop", "answers as fast as you talk", "sees what\u2019s on its own screen"],
  },
  {
    tag: "Hands",
    note: "Voice and touch in the same flow — say it, or tap the card, the time slot, the check-in button.",
    icon: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <circle cx="12" cy="12" r="2.6" />
        <path d="M5.5 5.5a9.2 9.2 0 0 1 13 0M7.9 7.9a5.8 5.8 0 0 1 8.2 0" />
      </svg>
    ),
    back: ["speak or tap — same result", "buttons sized for thumbs", "no menus to learn"],
  },
  {
    tag: "Names",
    note: "Finds you by name — said once, over a counter, through an accent — and asks only when it truly can\u2019t.",
    icon: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <rect x="3.5" y="6" width="17" height="12" rx="2.2" />
        <circle cx="8.6" cy="11" r="1.7" />
        <path d="M6.2 15.4c.5-1.5 4.3-1.5 4.8 0M13.8 10h3.7M13.8 13h2.6" />
      </svg>
    ),
    back: ["hears names through accents", "three tries before it asks again", "no spelling required"],
  },
  {
    tag: "Booking",
    note: "Books the next visit and signs up first-timers by conversation \u2014 service, time, details, done.",
    icon: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <rect x="3.5" y="5.5" width="17" height="14.5" rx="2.2" />
        <path d="M3.5 10h17M8.5 3.5V7M15.5 3.5V7" />
        <path d="M9.3 14.8l1.9 1.9 3.5-3.5" />
      </svg>
    ),
    back: ["pick a service, pick a time", "first-timers sign up by talking", "no clipboard forms"],
  },
  {
    tag: "Records",
    note: "Wired into whatever runs your business. A check-in lands in your schedule while the visitor is still standing there.",
    icon: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <ellipse cx="12" cy="6" rx="7" ry="2.6" />
        <path d="M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6" />
        <path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" />
      </svg>
    ),
    back: ["plugs into your own system", "arrival time, stamped", "the paperwork files itself"],
  },
  {
    tag: "Staff",
    note: "A PIN-locked panel for the team \u2014 search anyone, check them in by hand, watch the live waiting queue.",
    icon: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <rect x="5" y="10.5" width="14" height="9" rx="2.2" />
        <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
        <circle cx="12" cy="15" r="1.3" />
      </svg>
    ),
    back: ["PIN-locked, staff only", "queue sorted by wait time", "override anything, anytime"],
  },
  {
    tag: "Armor",
    note: "Lobby-proof, not demo-proof: it survives bad wifi, nudges the silent, hangs up after goodbye, and logs every move.",
    icon: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <path d="M12 3l7 3v5.3c0 4.6-3 7.9-7 9.7-4-1.8-7-5.1-7-9.7V6l7-3z" />
        <path d="M9.3 12l1.9 1.9 3.5-3.5" />
      </svg>
    ),
    back: ["reconnects on bad wifi", "ends abandoned sessions itself", "every action logged, timestamped"],
  },
];

const LIFT = 58; // px of translateZ per layer while a hand holds it open
const COMPACT = 15; // resting stack — the box stays boxed until touched
const DROP = 420; // how far above its slot a plate starts before assembly
const SPRING = "cubic-bezier(0.34, 1.45, 0.64, 1)"; // lands with a settle

export function KioskAnatomy() {
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0 });
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const [active, setActive] = useState(-1);
  const [pinned, setPinned] = useState(false);
  const [flipped, setFlipped] = useState(-1);
  const [rm, setRm] = useState(false);

  useEffect(() => setRm(reducedMotion()), []);

  // assemble once, the first time the stack is actually looked at
  useEffect(() => {
    if (reducedMotion()) {
      setOpen(true);
      setSettled(true);
      return;
    }
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // once the last plate has landed, entry delays get out of hover's way
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setSettled(true), SYSTEMS.length * 110 + 900);
    return () => clearTimeout(id);
  }, [open]);

  // the whole scene leans toward the cursor — depth you can feel
  const onTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    const box = e.currentTarget.getBoundingClientRect();
    const t = tilt.current;
    t.tx = ((e.clientX - box.left) / box.width - 0.5) * 2;
    t.ty = ((e.clientY - box.top) / box.height - 0.5) * 2;
    if (t.raf) return;
    const run = () => {
      t.x += (t.tx - t.x) * 0.08;
      t.y += (t.ty - t.y) * 0.08;
      const scene = sceneRef.current;
      if (scene) {
        scene.style.transform = `rotateY(${(t.x * 7).toFixed(2)}deg) rotateX(${(-t.y * 5).toFixed(2)}deg)`;
      }
      if (Math.abs(t.tx - t.x) + Math.abs(t.ty - t.y) > 0.004) {
        t.raf = requestAnimationFrame(run);
      } else {
        t.raf = 0;
      }
    };
    t.raf = requestAnimationFrame(run);
  }, []);

  const resetTilt = useCallback(() => {
    const t = tilt.current;
    t.tx = 0;
    t.ty = 0;
    if (!t.raf && sceneRef.current) {
      const run = () => {
        t.x += (t.tx - t.x) * 0.08;
        t.y += (t.ty - t.y) * 0.08;
        const scene = sceneRef.current;
        if (scene) {
          scene.style.transform = `rotateY(${(t.x * 7).toFixed(2)}deg) rotateX(${(-t.y * 5).toFixed(2)}deg)`;
        }
        if (Math.abs(t.x) + Math.abs(t.y) > 0.004) {
          t.raf = requestAnimationFrame(run);
        } else {
          t.raf = 0;
        }
      };
      t.raf = requestAnimationFrame(run);
    }
  }, []);

  useEffect(() => {
    const t = tilt.current;
    return () => cancelAnimationFrame(t.raf);
  }, []);

  const pin = (i: number) => {
    setPinned(true);
    setActive(i);
  };

  // click pulls the layer out of the stack and turns it over — the spec is
  // machined into its underside
  const flip = (i: number) => {
    setPinned(true);
    setActive(i);
    setFlipped((f) => (f === i ? -1 : i));
  };

  // at rest the box stays boxed; a hand (or reduced-motion, which gets the
  // legible spread instead of animation) opens it
  const expanded = pinned || rm;

  return (
    <div
      ref={host}
      className="grid gap-x-12 gap-y-12 md:grid-cols-[5fr_7fr] md:gap-x-16"
      onMouseLeave={() => {
        // the stack folds shut, but a turned-over card stays turned — the
        // reader put it there; only another click puts it back
        setPinned(false);
        setActive(-1);
      }}
    >
      {/* the exploded box — stretches to match the rows column */}
      <div className="flex flex-col">
        <div
          aria-hidden
          className="relative mx-auto min-h-[420px] w-[320px] flex-1 md:w-[380px]"
          style={{ perspective: "1400px" }}
          onMouseMove={onTilt}
          onMouseLeave={resetTilt}
        >
          <div
            ref={sceneRef}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {SYSTEMS.map((s, i) => {
              const depth = SYSTEMS.length - 1 - i; // top plate rides highest
              // closed: a tight stack. held open: layers spread, and the
              // stack splits above the pinned one — everything higher steps
              // up as one block, the layer itself half-rises into the gap
              const spread = depth * (expanded ? LIFT : COMPACT);
              const rise = expanded && i === active ? 8 : 0;
              const z = open ? spread + rise : depth * COMPACT + DROP;
              const isActive = expanded && active === i;
              const isFlipped = flipped === i;
              // the pinned layer slides OUT of the deck along its own plane —
              // toward the reader, from under the layers above it
              const slide = isActive && !isFlipped ? 52 : 0;
              // one shared list of transform functions, so the browser
              // interpolates each component — the plate visibly swings from
              // its slot in the stack to face the reader. translateZ comes
              // BEFORE rotateY: after a 180° turn the local Z axis points
              // away from the viewer, and a late translateZ would sink the
              // plate into the scene instead of bringing it forward.
              const transform = isFlipped
                ? "translate(-50%, -50%) rotateX(0deg) rotateZ(0deg) translateZ(430px) rotateY(180deg) translateX(0px) translateY(-110px)"
                : `translate(-50%, -50%) rotateX(55deg) rotateZ(-42deg) translateZ(${z}px) rotateY(0deg) translateX(${slide}px) translateY(${slide}px)`;
              return (
                <div
                  key={s.tag}
                  onMouseEnter={() => pin(i)}
                  onClick={() => flip(i)}
                  className="absolute left-1/2 top-[71%] size-[170px] cursor-pointer md:size-[200px]"
                  style={{
                    transformStyle: "preserve-3d",
                    transform,
                    // assembly runs bottom-up: survival lands first, the face last
                    transition: `transform 0.9s ${SPRING} ${settled ? 0 : depth * 110}ms, opacity 0.6s ease ${settled ? 0 : depth * 110}ms`,
                    opacity:
                      !open
                        ? 0
                        : pinned && active >= 0 && !isActive && !isFlipped
                          ? 0.8
                          : 1,
                  }}
                >
                  {/* the plate itself breathes on its own clock */}
                  <div
                    className={`${isFlipped ? "" : "f2m-float"} size-full rounded-[1.8rem] bg-[color:var(--f2m-bg)]`}
                    style={{
                      transformStyle: "preserve-3d",
                      animationDelay: `${-i * 0.8}s`,
                      // the long hard shadow is the plate's thickness; the
                      // soft pair stays the neumorphic light
                      boxShadow: isActive
                        ? "7px 7px 0 -1px var(--f2m-lo), 10px 10px 24px var(--f2m-lo), -8px -8px 20px var(--f2m-hi), 0 26px 52px rgba(11, 218, 81, 0.25)"
                        : "7px 7px 0 -1px var(--f2m-lo), 10px 10px 24px var(--f2m-lo), -8px -8px 20px var(--f2m-hi)",
                      transition: "box-shadow 0.5s ease",
                    }}
                  >
                    {/* FRONT — engraved icon well, lying flat on the plate */}
                    <div
                      className="absolute inset-0"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div
                        className={`f2m-in absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full! md:size-24 ${isActive ? "f2m-pop" : ""}`}
                        style={{
                          color: isActive
                            ? "var(--f2m-accent)"
                            : "var(--f2m-muted)",
                          transition: "color 0.4s ease",
                        }}
                      >
                        <div className="size-10 md:size-12">{s.icon}</div>
                      </div>
                    </div>
                    {/* BACK — the spec machined into the underside */}
                    <div
                      className="f2m-in absolute inset-0 flex flex-col justify-center gap-2 rounded-[1.8rem]! px-6 py-5 md:gap-2.5 md:px-7"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--f2m-ink)]">
                        <span className="size-1.5 rounded-full bg-[color:var(--f2m-accent)]" />
                        {s.tag}
                      </p>
                      {s.back.map((line) => (
                        <p
                          key={line}
                          className="font-mono text-[11px] font-medium leading-snug text-[color:var(--f2m-muted)] md:text-xs"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* the same seven, as rows — hover a row, its layer surfaces */}
      <div className="self-center">
        <div>
          {SYSTEMS.map((s, i) => {
            const on = active === i || flipped === i;
            return (
              <div
                key={s.tag}
                role="button"
                tabIndex={0}
                aria-pressed={flipped === i}
                onMouseEnter={() => pin(i)}
                onFocus={() => pin(i)}
                onClick={() => flip(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    flip(i);
                  }
                }}
                className={`flex cursor-pointer items-start gap-3.5 rounded-[1rem] px-4 py-3.5 transition-all duration-300 md:gap-4 md:px-5 md:py-4 ${
                  i === 0 ? "" : "mt-3"
                } ${on ? "f2m-neu-sm md:translate-x-1.5" : "shadow-none"}`}
              >
                <span
                  aria-hidden
                  className="f2m-in mt-0.5 grid size-6 shrink-0 place-items-center rounded-full! md:size-7"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={on ? "var(--f2m-accent)" : "var(--f2m-lo)"}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5 transition-colors duration-300 md:size-4"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-[15px] font-medium leading-relaxed text-[color:var(--f2m-muted)]">
                  <span
                    className={`font-bold transition-colors duration-300 ${
                      on
                        ? "text-[color:var(--f2m-ink)]"
                        : "text-[color:var(--f2m-fg)]"
                    }`}
                  >
                    {s.tag}
                  </span>
                  <span aria-hidden> — </span>
                  {s.note}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
