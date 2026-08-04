"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STATIONS: { label: string; line: string }[] = [
  { label: "Greeted", line: "In before the door finishes opening." },
  { label: "Verified", line: "Appointment found. No spelling contest." },
  { label: "Copay taken", line: "$35, card. No receipt-roll jam." },
  { label: "Staff pinged", line: "Room notified before the patient sits down." },
  { label: "Checked in", line: "Off the list. No lingering for thanks." },
];

/**
 * One visit, top to bottom. The rail runs exactly from the first station's
 * dot to the last — measured, not guessed, since the line under each label
 * wraps differently at every width. OrderLog's positioning, turned into a
 * scroll-scrubbed draw instead of a once-off reveal, the way Pipeline fills
 * its dots.
 */
export function VisitRail() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = root.current?.querySelector<HTMLElement>("[data-visit-wrap]");
    if (!wrap) return;
    const layout = () => {
      const dots = wrap.querySelectorAll<HTMLElement>("[data-visit-dot]");
      if (dots.length < 2) return;
      const base = wrap.getBoundingClientRect();
      const first = dots[0].getBoundingClientRect();
      const last = dots[dots.length - 1].getBoundingClientRect();
      const top = first.top - base.top + first.height / 2;
      const height = last.top - base.top + last.height / 2 - top;
      wrap.querySelectorAll<HTMLElement>("[data-visit-line]").forEach((el) => {
        el.style.top = `${top}px`;
        el.style.height = `${height}px`;
      });
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    document.fonts?.ready.then(layout);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 75%",
          end: "bottom 45%",
          scrub: true,
        },
      });
      tl.fromTo("[data-visit-rail]", { scaleY: 0 }, { scaleY: 1, ease: "none", duration: 1 }, 0);
      gsap.utils.toArray<HTMLElement>("[data-visit-dot]").forEach((el, i) => {
        const at = i / (STATIONS.length - 1);
        tl.fromTo(
          el,
          { backgroundColor: "rgba(0,0,0,0)" },
          { backgroundColor: "#000", duration: 0.04 },
          Math.max(0, at - 0.02),
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-visit-station]").forEach((el, i) => {
        const at = i / (STATIONS.length - 1);
        tl.fromTo(el, { opacity: 0.32 }, { opacity: 1, duration: 0.08 }, Math.max(0, at - 0.04));
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">
        one visit, start to finish
      </p>
      <div data-visit-wrap className="relative mt-7 pl-7">
        <span data-visit-line aria-hidden className="absolute left-[4px] w-[2px] bg-black/15" />
        <span
          data-visit-line
          data-visit-rail
          aria-hidden
          className="absolute left-[4px] w-[2px] origin-top bg-black"
        />
        <ol className="flex flex-col gap-8">
          {STATIONS.map((s) => (
            <li key={s.label} data-visit-station className="relative">
              <span
                data-visit-dot
                aria-hidden
                className="absolute -left-7 top-[2px] z-[1] size-[10px] rounded-full border-2 border-black bg-black"
              />
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
                {s.label}
              </p>
              <p className="mt-1 max-w-[34ch] text-[13px] font-medium leading-relaxed opacity-70">
                {s.line}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const MESSAGES: string[] = [
  "Rm 4 ready for Mrs Alvarez",
  "copay $35 taken — card",
  "new patient, needs paperwork",
  "Spanish — switched mid-sentence",
  "walk-in added, no wait",
  "no-show — 2:30 opened up",
];

/**
 * The staff side of the same visit: what the front desk's phone sees while
 * the kiosk works the lobby. Handled texts strike through and slide out,
 * forever — InboxFeed's technique, borrowed whole. The queue holds while
 * off-screen; reduced motion never starts it, so the full run of messages
 * just sits there, already read.
 */
export function StaffFeed() {
  const root = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [offset, setOffset] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (reducedMotion()) return;
    setLive(true);
    const host = root.current;
    if (!host) return;
    let alive = true;
    let onScreen = false;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!alive) return;
      if (onScreen) {
        setLeaving(true);
        t1 = setTimeout(() => {
          setOffset((o) => (o + 1) % MESSAGES.length);
          setLeaving(false);
        }, 650);
      }
      t2 = setTimeout(tick, 2600);
    };
    t2 = setTimeout(tick, 1600);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(host);
    return () => {
      alive = false;
      clearTimeout(t1);
      clearTimeout(t2);
      io.disconnect();
    };
  }, []);

  // reduced motion — and the one tick before the effect above ever runs —
  // shows the whole run of messages, already handled: nothing mid-animation
  const rows = live
    ? [0, 1, 2, 3].map((i) => MESSAGES[(offset + i) % MESSAGES.length])
    : MESSAGES;

  return (
    <div ref={root}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">
        texts to the front desk · clears itself
      </p>
      <div className="mt-5">
        {rows.map((text, i) => {
          const gone = live && i === 0 && leaving;
          const handled = gone || !live;
          return (
            <div
              key={text}
              className={`row-in flex items-baseline justify-between gap-4 border-t border-black/15 py-3.5 transition-[opacity,transform] duration-500 ease-out ${
                gone ? "-translate-x-4 opacity-0" : "translate-x-0 opacity-100"
              }`}
            >
              <span
                className={`truncate text-[13px] font-medium ${
                  handled ? "line-through opacity-60" : ""
                }`}
              >
                {text}
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${
                  handled ? "bg-black text-white" : "shadow-[inset_0_0_0_1px_black]"
                }`}
              >
                {handled ? "read" : "unread"}
              </span>
            </div>
          );
        })}
        <div className="border-t border-black/15" />
      </div>
    </div>
  );
}
