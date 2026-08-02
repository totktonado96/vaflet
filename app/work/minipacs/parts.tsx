"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The stone the product's own site is cut from */
const INK = "#0A0A0A";
const LINE = "#E2DED4";
const GREY = "#6B6B6B";

/**
 * The pricing argument, drawn. The cloud bill climbs with the scroll the way
 * it climbs with the study count; the flat one has nowhere to go. Markup holds
 * the finished state, so a reduced-motion reader gets the conclusion.
 */
export function Meter() {
  const root = useRef<HTMLDivElement>(null);
  const MAX = 2000;
  const MIN = 150;

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const bar = root.current!.querySelector<HTMLElement>("[data-cloud-bar]");
      const price = root.current!.querySelector<HTMLElement>("[data-cloud-price]");
      const flat = root.current!.querySelector<HTMLElement>("[data-flat-bar]");
      const box = { n: MIN };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 78%",
          end: "top 28%",
          scrub: true,
        },
      });
      tl.fromTo(bar, { scaleX: MIN / MAX }, { scaleX: 1, ease: "none", duration: 1 }, 0);
      tl.to(
        box,
        {
          n: MAX,
          ease: "none",
          duration: 1,
          onUpdate: () => {
            price!.textContent = "$" + Math.round(box.n).toLocaleString("en-US");
          },
        },
        0,
      );
      // the flat bar draws once and is done — that is the whole point of it
      gsap.fromTo(
        flat,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
        },
      );
    },
    { scope: root },
  );

  const row =
    "grid items-center gap-x-6 gap-y-3 py-6 md:grid-cols-[9rem_1fr_16rem] md:py-8";

  return (
    <div ref={root}>
      <div className={row} style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
          Cloud PACS
        </p>
        <div className="order-3 h-[10px] w-full md:order-none md:h-3">
          <div
            data-cloud-bar
            className="h-full origin-left rounded-full"
            style={{ transform: "scaleX(1)", backgroundColor: GREY, opacity: 0.45 }}
          />
        </div>
        <div className="md:text-right">
          <p
            data-cloud-price
            className="text-[19px] font-extrabold tabular-nums md:text-[24px]"
          >
            $2,000
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
            a month — priced by how much you scan
          </p>
        </div>
      </div>

      <div
        className={row}
        style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}
      >
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
          MiniPACS
        </p>
        <div className="order-3 h-[10px] w-full md:order-none md:h-3">
          <div
            data-flat-bar
            className="h-full origin-left rounded-full"
            style={{ width: `${(300 / MAX) * 100}%`, backgroundColor: INK }}
          />
        </div>
        <div className="md:text-right">
          <p className="text-[19px] font-extrabold tabular-nums md:text-[24px]">$300</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
            a month — priced by nothing
          </p>
        </div>
      </div>
    </div>
  );
}

const STEPS = ["Submitted", "In triage", "Scheduled", "Imaging done", "Report sent"];

/**
 * The five states a fax never had, drawn as the rail both sides of a referral
 * watch. The line fills as the page scrolls, the way the real one fills as the
 * order moves. Markup holds the finished rail for reduced-motion readers.
 */
export function Pipeline() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 80%",
          end: "top 35%",
          scrub: true,
        },
      });
      tl.fromTo("[data-rail]", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
      gsap.utils.toArray<HTMLElement>("[data-dot]").forEach((el, i) => {
        const at = i / (STEPS.length - 1);
        tl.fromTo(
          el,
          { backgroundColor: "rgba(10,10,10,0)" },
          { backgroundColor: INK, duration: 0.04 },
          Math.max(0, at - 0.02),
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el, i) => {
        const at = i / (STEPS.length - 1);
        tl.fromTo(el, { opacity: 0.35 }, { opacity: 1, duration: 0.08 }, Math.max(0, at - 0.04));
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div className="relative">
        <div
          className="absolute left-1 right-1 top-[4px] h-[2px]"
          style={{ backgroundColor: LINE }}
        />
        <div
          data-rail
          className="absolute left-1 right-1 top-[4px] h-[2px] origin-left"
          style={{ backgroundColor: INK }}
        />
        <ol className="relative flex justify-between">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`flex max-w-[8rem] flex-col gap-3 md:max-w-none md:gap-4 ${
                i === 0
                  ? "items-start text-left"
                  : i === STEPS.length - 1
                    ? "items-end text-right"
                    : "items-center text-center"
              }`}
            >
              <span
                data-dot
                className="block size-[10px] rounded-full border-2"
                style={{ borderColor: INK, backgroundColor: INK }}
              />
              <span
                data-step
                className="font-mono text-[9px] font-bold uppercase leading-snug tracking-[0.14em] md:text-[11px] md:tracking-[0.22em]"
              >
                {s}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
