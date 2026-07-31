"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A shot that drifts against the scroll. The frame moves, not the picture
 * inside it — oversizing the image to pan it would crop a screenshot, and a
 * screenshot cropped is a screenshot ruined.
 */
export function DriftShot({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        frame.current,
        { y: 34 },
        {
          y: -34,
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
      className={`relative overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem] ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}

/** Three panels held in place while the copy for each one takes its turn. */
export function Moves({
  moves,
}: {
  moves: { kicker: string; line: string; src: string; alt: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced()) return;
      const shots = gsap.utils.toArray<HTMLElement>("[data-move-shot]");
      shots.forEach((shot, i) => {
        if (i === 0) return;
        gsap.fromTo(
          shot,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: `[data-move-copy="${i}"]`,
              start: "top 80%",
              end: "top 30%",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative md:grid md:grid-cols-[42%_58%]">
      {/* the copy scrolls; the stack of shots stays put beside it */}
      <div>
        {moves.map((m, i) => (
          <div
            key={m.kicker}
            data-move-copy={i}
            className="flex min-h-[70vh] flex-col justify-center py-16 pr-0 md:min-h-screen md:py-0 md:pr-16"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
              {String(i + 1).padStart(2, "0")} — {m.kicker}
            </p>
            <p className="display-3 mt-6 max-w-[18ch] font-extrabold uppercase leading-[1.02]">
              {m.line}
            </p>
            {/* on phones the shot belongs with its own paragraph */}
            <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-[1rem] md:hidden">
              <Image src={m.src} alt={m.alt} fill sizes="100vw" className="object-cover" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="sticky top-0 flex h-screen items-center">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.25rem]">
            {moves.map((m, i) => (
              <div
                key={m.src}
                data-move-shot
                className="absolute inset-0"
                style={{ zIndex: i + 1 }}
              >
                <Image
                  src={m.src}
                  alt={m.alt}
                  fill
                  sizes="60vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The archive of screens, dragged sideways by the scrollbar. */
export function Filmstrip({
  shots,
}: {
  shots: { src: string; caption: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced()) return;
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
    <div ref={root} className="flex min-h-screen items-center overflow-hidden py-16">
      <div ref={track} className="flex w-max gap-6 pl-5 md:gap-10 md:pl-10">
        {shots.map((s) => (
          <figure key={s.src} className="w-[78vw] shrink-0 md:w-[56vw]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem] md:rounded-[1.25rem]">
              <Image
                src={s.src}
                alt={s.caption}
                fill
                sizes="(min-width: 768px) 56vw, 78vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 text-[11px] font-bold uppercase leading-snug tracking-[0.2em] opacity-70">
              {s.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/** Figures that count themselves up the first time they are looked at. */
export function Counters({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix ?? "";
        const box = { n: 0 };
        gsap.to(box, {
          n: target,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(box.n).toLocaleString("en-US") + suffix;
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-px border-y-2 border-white/20 md:grid-cols-3">
      {items.map((f) => {
        // "24k" counts to 24 and keeps its suffix; plain numbers count in full
        const m = f.value.match(/^([\d.]+)(\D*)$/);
        return (
          <div key={f.label} className="py-10 md:py-16">
            <p
              data-count={m?.[1] ?? undefined}
              data-suffix={m?.[2] ?? ""}
              className="display-2 font-extrabold leading-none tabular-nums"
            >
              {m ? "0" + (m[2] ?? "") : f.value}
            </p>
            <p className="mt-4 max-w-[22ch] text-[11px] font-bold uppercase leading-snug tracking-[0.2em] opacity-60">
              {f.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Plain wrapper so the page can hand server-rendered copy to a client scope. */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.from(ref.current!.children, {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
      });
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
