"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Swatch = { name: string; hex: string; rgb: string; cmyk: string; ink: string };

/**
 * The palette takes the room. Hovering a swatch floods the section with it and
 * flips the type to whatever stays legible on top — the same decision the
 * guidelines make on every page.
 */
export function ColorWall({ swatches }: { swatches: Swatch[] }) {
  const [active, setActive] = useState<Swatch | null>(null);
  const room = active ?? { hex: "#0F1E14", ink: "#FFFFF0", name: "", rgb: "", cmyk: "" };

  return (
    <div
      className="relative -mx-5 px-5 py-20 transition-colors duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:-mx-10 md:px-10 md:py-28"
      style={{ backgroundColor: room.hex, color: room.ink }}
      onMouseLeave={() => setActive(null)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">
          03 — Colour
        </p>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] tabular-nums opacity-70">
          {active ? `${active.name} · ${active.hex}` : "Eight, and only two of them lead"}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-4 md:gap-4">
        {swatches.map((s) => (
          <button
            key={s.hex}
            type="button"
            onMouseEnter={() => setActive(s)}
            onFocus={() => setActive(s)}
            className="group/sw flex aspect-[4/5] flex-col rounded-[1rem] p-5 text-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 md:rounded-[1.25rem] md:p-6"
            /* Mirai Black would vanish into the room it is standing in */
            style={{
              backgroundColor: s.hex,
              color: s.ink,
              boxShadow: s.hex === "#0F1E14" ? "inset 0 0 0 1px rgba(255,255,240,0.22)" : undefined,
            }}
          >
            <span className="block text-[13px] font-bold uppercase tracking-[0.14em]">
              {s.name}
            </span>
            <span className="mt-1 block text-[11px] font-bold tabular-nums opacity-70">
              {s.hex}
            </span>
            <span className="mt-auto block text-[10px] leading-relaxed opacity-0 transition-opacity duration-300 group-hover/sw:opacity-70">
              RGB {s.rgb}
              <br />
              CMYK {s.cmyk}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The four gradients, dragged past the eye by the scrollbar. */
export function GradientRail({
  items,
}: {
  items: { src: string; label: string; note: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth + 80;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex min-h-screen items-center overflow-hidden">
      <div ref={track} className="flex w-max gap-6 pl-5 md:gap-10 md:pl-10">
        {items.map((g) => (
          <figure key={g.src} className="w-[80vw] shrink-0 md:w-[52vw]">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1rem] md:rounded-[1.5rem]">
              <Image
                src={g.src}
                alt={g.label}
                fill
                sizes="(min-width: 768px) 52vw, 80vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 flex items-baseline gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em]">
                {g.label}
              </span>
              <span className="text-[11px] font-light opacity-70">{g.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/**
 * The pattern is built from the symbol, so it earns a moment of its own: the
 * tile drifts sideways for as long as the section is on screen.
 */
export function PatternDrift({ src, alt }: { src: string; alt: string }) {
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        frame.current!.querySelector("[data-tile]"),
        { xPercent: 0 },
        {
          xPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: frame.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: frame },
  );

  return (
    <div
      ref={frame}
      className="relative aspect-[21/9] w-full overflow-hidden rounded-[1rem] md:rounded-[1.5rem]"
    >
      {/* wider than the frame, so the drift never runs out of pattern */}
      <div data-tile className="absolute inset-y-0 left-0 w-[125%]">
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
      </div>
    </div>
  );
}

/** Applications, stacked and revealed as each one comes up. */
export function AssetShelf({
  items,
}: {
  items: { src: string; title: string; note: string; wide?: boolean }[];
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-asset]").forEach((el) => {
        gsap.from(el, {
          y: 60,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-6 md:grid-cols-2 md:gap-10">
      {items.map((a) => (
        <figure
          key={a.src}
          data-asset
          className={a.wide ? "md:col-span-2" : undefined}
        >
          <div
            className={`relative w-full overflow-hidden rounded-[1rem] bg-[#FFFFF0] md:rounded-[1.5rem] ${
              a.wide ? "aspect-[16/7]" : "aspect-[4/3]"
            }`}
          >
            <Image
              src={a.src}
              alt={a.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain p-6 md:p-10"
            />
          </div>
          <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em]">
              {a.title}
            </span>
            <span className="text-[11px] font-light opacity-70">{a.note}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
