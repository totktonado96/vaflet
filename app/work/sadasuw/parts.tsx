"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";
import { EDGE, GOLD, GOLD_HI, INK, LINE } from "./palette";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* The seigaiha tile from the plant's site: five rings and a dot per stack, each
   stack filled with the ground, rows laid in order so the next one laps over
   the last like scales. Drawn once per page — the ids are fixed. */
const ROWS = [-202.8, -101.4, 0, 101.4, 202.8, 304.2, 405.6];
const RING = "rgba(215,180,106,0.55)";

export function Crest({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden
      style={{
        maskImage: "linear-gradient(180deg, #000 10%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(180deg, #000 10%, transparent 100%)",
        opacity: 0.5,
      }}
    >
      <defs>
        <g id="sada-sg-stack" strokeWidth="2.2">
          <circle r="130" fill={INK} stroke={RING} />
          {[104, 78, 52, 26].map((r) => (
            <circle key={r} r={r} fill="none" stroke={RING} />
          ))}
          <circle r="5.8" fill={RING} />
        </g>
        <pattern id="sada-seigaiha" patternUnits="userSpaceOnUse" width="130" height="202.8">
          {ROWS.map((y, row) =>
            (row % 2 ? [-65, 65, 195, 325] : [-130, 0, 130, 260]).map((x) => (
              <use key={`${x}:${y}`} href="#sada-sg-stack" x={x} y={y} />
            )),
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sada-seigaiha)" />
    </svg>
  );
}

type Line = { label: string; note: string; files: number; bytes: number };

/**
 * The packing list. Every dot is a file the browser fetched on one real visit,
 * and every one of them lands on this side of the border. The other side has
 * nothing to show but its count.
 */
export function Manifest({
  lines,
  page,
  elsewhere,
}: {
  lines: Line[];
  /** the page, its styles and scripts — the build's own, not counted as dots */
  page: { label: string; note: string };
  elsewhere: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const files = lines.reduce((n, l) => n + l.files, 0);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const seen = () => ({ trigger: root.current, start: "top 72%", once: true });
      gsap.from("[data-row]", {
        y: 18,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: seen(),
      });
      // the files arrive one at a time, all on this side
      gsap.from("[data-dot]", {
        scale: 0,
        duration: 0.45,
        stagger: 0.05,
        delay: 0.25,
        ease: "back.out(2.4)",
        scrollTrigger: seen(),
      });
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.from("[data-border]", { scaleY: 0, duration: 1.2, ease: "power3.inOut", scrollTrigger: seen() });
      });
      mm.add("(max-width: 767px)", () => {
        gsap.from("[data-border]", { scaleX: 0, duration: 1.2, ease: "power3.inOut", scrollTrigger: seen() });
      });
    },
    { scope: root },
  );

  const row = "grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-6 md:grid-cols-[8rem_minmax(0,1fr)_6rem] md:gap-x-8";

  return (
    <div
      ref={root}
      className="grid md:grid-cols-[minmax(0,1fr)_1px_minmax(15rem,28%)] md:gap-x-12 lg:gap-x-16"
    >
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <p className="sada-mono" style={{ color: GOLD }}>
            Its own address
          </p>
          <p className="sada-mono opacity-60">{files} files</p>
        </div>

        <div className="mt-6">
          {lines.map((l) => (
            <div key={l.label} data-row className={row} style={{ borderTop: `1px solid ${LINE}` }}>
              <p className="sada-mono pt-[3px]">{l.label}</p>
              <div>
                <div className="flex flex-wrap gap-[7px]" aria-hidden>
                  {Array.from({ length: l.files }, (_, i) => (
                    <span
                      key={i}
                      data-dot
                      className="block size-[11px] rounded-full md:size-[13px]"
                      style={{ backgroundColor: GOLD }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[15px] leading-relaxed opacity-75">{l.note}</p>
              </div>
              <p className="col-start-2 text-[15px] tabular-nums md:col-start-auto md:text-right">
                {Math.round(l.bytes / 1000).toLocaleString("en-US")} KB
                <span className="sada-mono mt-1 block opacity-60">
                  {l.files} {l.files === 1 ? "file" : "files"}
                </span>
              </p>
            </div>
          ))}
          <div
            data-row
            className={row}
            style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}
          >
            <p className="sada-mono pt-[3px]">{page.label}</p>
            <p className="text-[15px] leading-relaxed opacity-75">{page.note}</p>
          </div>
        </div>
      </div>

      {/* the border itself */}
      <div
        data-border
        aria-hidden
        className="my-12 h-px origin-left md:my-0 md:h-auto md:origin-top"
        style={{ backgroundColor: GOLD }}
      />

      <div className="flex flex-col">
        <p className="sada-mono" style={{ color: GOLD }}>
          Anywhere else
        </p>
        {/* a full line box: tighter leading lets the glyph climb into the label */}
        <p
          className="sada-serif mt-6 text-[clamp(8rem,17vw,16rem)] leading-none"
          style={{ color: GOLD_HI }}
        >
          0
        </p>
        <p className="mt-4 max-w-[28ch] text-[15px] leading-relaxed opacity-75">{elsewhere}</p>
      </div>
    </div>
  );
}

/**
 * The same first screen in both lights. Scrolling draws the light theme in
 * from the right over the dark one, a gold seam riding the edge between them.
 */
export function LightsWipe({
  dark,
  light,
}: {
  dark: { src: string; alt: string };
  light: { src: string; alt: string };
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 30%", scrub: 0.6 },
        })
        .fromTo(
          "[data-light]",
          { clipPath: "inset(0% 0% 0% 100%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
          0,
        )
        .fromTo("[data-seam]", { left: "100%" }, { left: "0%", ease: "none" }, 0);
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem]">
        <Image src={dark.src} alt={dark.alt} fill sizes="100vw" className="object-cover" />
        {/* without motion the two lights simply meet in the middle */}
        <div data-light className="absolute inset-0" style={{ clipPath: "inset(0% 0% 0% 50%)" }}>
          <Image src={light.src} alt={light.alt} fill sizes="100vw" className="object-cover" />
        </div>
        <span
          data-seam
          aria-hidden
          className="absolute inset-y-0 w-px -translate-x-1/2"
          style={{ left: "50%", backgroundColor: GOLD }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ boxShadow: `inset 0 0 0 1px ${EDGE}` }}
        />
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-4">
        <p className="sada-mono opacity-70">Dark — how the site opens</p>
        <p className="sada-mono opacity-70">Light — one button away</p>
      </div>
    </div>
  );
}
