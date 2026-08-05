"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STATIONS: { label: string; visitor: string; staff: string }[] = [
  { label: "Greeted", visitor: "In before the door finishes opening.", staff: "someone's at the door" },
  { label: "Verified", visitor: "Found your booking. No spelling contest.", staff: "Alvarez, 2:15 — confirmed" },
  { label: "Payment taken", visitor: "$35, card. No receipt-roll jam.", staff: "copay $35 — card" },
  { label: "Staff pinged", visitor: "Told your room before you sat down.", staff: "Rm 4 ready for Alvarez" },
  { label: "Checked in", visitor: "Off the list. No lingering for thanks.", staff: "checked in — texts clear themselves" },
];

// the reveal owns the first 86% of the scrub; the tear takes the rest
const REVEAL_END = 0.86;
const GLOW = "5px 5px 12px #b8c0cc, -5px -5px 12px #ffffff, 0 26px 52px rgba(11,218,81,0.25)";

const perfV = {
  backgroundImage: "repeating-linear-gradient(180deg, var(--f2m-lo) 0 6px, transparent 6px 12px)",
} as const;
const perfH = {
  backgroundImage: "repeating-linear-gradient(90deg, var(--f2m-lo) 0 6px, transparent 6px 12px)",
} as const;

/**
 * One visit as one object: a receipt printing out of a wall nozzle, split
 * down the middle by a perforation — visitor's copy on the left ply, the
 * front desk's on the right. The tape feeds by scroll (VisitRail's scrub
 * idiom, aimed at a clip-path). At the last station the perforation gives
 * way and the staff ply tears off onto a phone. Static DOM is the end
 * state — already printed, already torn — so reduced motion and the
 * pre-hydration paint need no timeline at all.
 */
export function VisitReceipt() {
  const root = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    if (!reducedMotion()) setLive(true);
  }, []);

  // print cues are scheduled from measured layout — a width change (not the
  // mobile URL-bar height dance) re-measures by rebuilding the timeline
  useEffect(() => {
    let w = window.innerWidth;
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (window.innerWidth === w) return;
        w = window.innerWidth;
        setRev((n) => n + 1);
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useGSAP(
    (_, contextSafe) => {
      if (!live) return;
      const safe = contextSafe ?? ((fn: () => void) => fn);
      const host = root.current;
      const tape = host?.querySelector<HTMLElement>("[data-tape]");
      if (!host || !tape) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: host,
          start: "top 70%",
          end: "bottom 40%",
          scrub: true,
          onLeave: safe(() => {
            const ring = host.querySelector<HTMLElement>("[data-dock-ring]");
            if (ring)
              gsap.fromTo(
                ring,
                { scale: 0.6, opacity: 0.7 },
                { scale: 1.7, opacity: 0, duration: 0.6, ease: "power2.out" },
              );
          }),
        },
      });

      // paper feeds from under the nozzle — mechanically 1:1 with scroll.
      // sides and top overshoot so the slab's shadow never gets clipped;
      // the bottom overshoots at the end so the torn ply can leave the sheet.
      // both bottom insets stay in % — gsap interpolates each slot's number
      // and keeps the END value's unit, so mixed units would snap the
      // reveal open on the first scrubbed frame
      tl.fromTo(
        tape,
        { clipPath: "inset(-40px -40px 100% -40px)" },
        { clipPath: "inset(-40px -40px -12% -40px)", ease: "none", duration: REVEAL_END },
        0,
      );

      // each ticket prints the moment the paper's edge passes it: thermal
      // head contact (blur -> sharp) with the knock of a stamp, both plies
      // on the same beat — it's one event, copied twice
      const led = host.querySelector<HTMLElement>("[data-led]");
      const tapeBox = tape.getBoundingClientRect();
      tape.querySelectorAll<HTMLElement>("[data-seg]").forEach((seg) => {
        const bottom = seg.getBoundingClientRect().bottom - tapeBox.top;
        const at = Math.max(0, (REVEAL_END * bottom) / tapeBox.height - 0.05);
        tl.fromTo(
          seg,
          { opacity: 0.15, filter: "blur(1.5px)", scale: 0.985 },
          {
            keyframes: [
              { scale: 1.012, duration: 0.03 },
              { scale: 1, duration: 0.02 },
            ],
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.05,
            ease: "none",
          },
          at,
        );
        if (led)
          tl.fromTo(led, { backgroundColor: "#b8c0cc" }, { backgroundColor: "#0bda51", duration: 0.01 }, at)
            .to(led, { backgroundColor: "#b8c0cc", duration: 0.01 }, at + 0.04);
      });

      // the tear — the seam gives way and the staff ply becomes its own
      // scrap of paper, peeling off the sheet and landing on the phone.
      // narrow screens get a shorter throw so the scrap stays on the page;
      // 420px matches the min-[420px] breakpoint the layout flips on
      const wide = window.matchMedia("(min-width: 420px)").matches;
      tl.fromTo(
        "[data-tear-ply]",
        { x: 0, y: 0, rotation: 0, backgroundColor: "rgba(224,229,236,0)", boxShadow: "0 0 0 rgba(0,0,0,0)" },
        {
          x: wide ? 56 : 16,
          y: wide ? 64 : 48,
          rotation: wide ? 9 : 6,
          backgroundColor: "#e0e5ec",
          boxShadow: "5px 5px 12px #b8c0cc, -5px -5px 12px #ffffff",
          transformOrigin: "left center",
          ease: "none",
          duration: 0.12,
        },
        0.88,
      );
      tl.to("[data-tear-seam]", { opacity: 0, duration: 0.04 }, 0.88);
      tl.fromTo(
        "[data-dock]",
        { autoAlpha: 0, scale: 0.8, boxShadow: "5px 5px 12px #b8c0cc, -5px -5px 12px #ffffff" },
        { autoAlpha: 1, scale: 1, boxShadow: GLOW, ease: "none", duration: 0.08 },
        0.9,
      );
    },
    { scope: root, dependencies: [live, rev], revertOnUpdate: true },
  );

  return (
    <div ref={root}>
      <p className="sr-only">
        One receipt, two plies: the left column is what the visitor
        experiences, the right column is what the staff phone receives.
      </p>
      <div className="relative mx-auto mt-4 max-w-[560px] pb-20">
        {/* the nozzle the paper feeds out of */}
        <div className="f2m-neu-sm relative z-10 flex h-16 flex-col justify-between rounded-2xl px-8 pb-3 pt-4">
          <span data-led aria-hidden className="size-2 rounded-full bg-[#b8c0cc]" />
          <div aria-hidden className="f2m-in h-1.5 rounded-full" />
        </div>

        {/* the tape */}
        <div data-tape className="f2m-neu-sm relative -mt-1.5 mx-7 rounded-b-2xl rounded-t-none">
          <div className="flex items-baseline justify-between px-6 pb-4 pt-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--f2m-muted)]">
            <span>Face2me — front desk</span>
            <span className="tabular-nums">No. 0044</span>
          </div>
          <div aria-hidden className="mx-6 h-px" style={perfH} />

          {/* stations 1..4 share one continuous seam */}
          <div className="relative">
            <span aria-hidden className="absolute inset-y-0 left-[58%] hidden w-px min-[420px]:block" style={perfV} />
            {STATIONS.slice(0, -1).map((s, i) => (
              <div key={s.label}>
                {i > 0 && <div aria-hidden className="mx-6 h-px" style={perfH} />}
                <Segment s={s} />
              </div>
            ))}
          </div>
          <div aria-hidden className="mx-6 h-px" style={perfH} />

          {/* the last station — its stretch of seam is the one that tears */}
          <div className="relative">
            <span
              data-tear-seam
              aria-hidden
              className="absolute inset-y-0 left-[58%] hidden w-px min-[420px]:block"
              style={{ ...perfV, opacity: live ? 1 : 0 }}
            />
            <Segment s={STATIONS[STATIONS.length - 1]} tear torn={!live} />
          </div>
        </div>

        {/* where the staff copy lands */}
        <div
          data-dock
          className="f2m-neu-sm absolute -bottom-2 right-0 z-0 flex size-12 items-center justify-center rounded-full"
          style={live ? undefined : { boxShadow: GLOW }}
        >
          <span data-dock-ring aria-hidden className="absolute inset-0 rounded-full shadow-[0_0_0_2px_#0bda51] opacity-0" />
          <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[color:var(--f2m-accent)] motion-safe:animate-pulse" />
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-5 text-[color:var(--f2m-ink)]">
            <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
            <path d="M10.5 18.5h3" />
          </svg>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-[color:var(--f2m-muted)]">
            delivered
          </span>
        </div>
      </div>
    </div>
  );
}

// `torn` is the static end-of-story pose — same throw and pivot the live
// tear tween lands on at each breakpoint
const TORN =
  "origin-left translate-x-[16px] translate-y-[48px] rotate-[6deg] bg-[#e0e5ec] shadow-[5px_5px_12px_#b8c0cc,-5px_-5px_12px_#ffffff] min-[420px]:translate-x-[56px] min-[420px]:translate-y-[64px] min-[420px]:rotate-[9deg]";

function Segment({
  s,
  tear,
  torn,
}: {
  s: (typeof STATIONS)[number];
  tear?: boolean;
  torn?: boolean;
}) {
  return (
    <div data-seg className="grid px-6 py-6 min-[420px]:grid-cols-[58%_42%]">
      <div className="min-[420px]:pr-5">
        <span className="sr-only">Visitor — </span>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--f2m-ink)]">
          {s.label}
        </p>
        <p className="mt-1.5 max-w-[30ch] text-[13px] font-medium leading-relaxed">{s.visitor}</p>
      </div>
      <div className={`relative mt-3 min-[420px]:mt-0 min-[420px]:pl-5 ${tear ? "z-10" : ""}`}>
        <div aria-hidden className="mb-3 h-px min-[420px]:hidden" style={perfH} />
        <div
          data-tear-ply={tear ? "" : undefined}
          className={tear ? `-m-3 rounded-xl p-3 ${torn ? TORN : ""}` : undefined}
        >
          <span className="sr-only">Staff phone — </span>
          <p className="font-mono text-[11px] leading-relaxed text-[color:var(--f2m-muted)]">{s.staff}</p>
        </div>
      </div>
    </div>
  );
}
