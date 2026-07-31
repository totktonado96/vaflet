"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Case pages are hand-built; these are the few moves worth sharing. */

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Children rise into place, one after another, the first time they are seen. */
export function Reveal({
  children,
  y = 24,
  stagger = 0.08,
}: {
  children: ReactNode;
  y?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(ref.current!.children, {
        y,
        autoAlpha: 0,
        duration: 0.9,
        stagger,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
      });
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}

/** Figures that count themselves up the first time they are looked at. */
export function Counters({
  items,
  className,
  itemClassName,
  labelClassName,
}: {
  items: { value: string; label: string }[];
  className?: string;
  itemClassName?: string;
  labelClassName?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
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
    <div ref={root} className={className}>
      {items.map((f) => {
        // "24k" counts to 24 and keeps its suffix; plain numbers count in full
        const m = f.value.match(/^([\d.]+)(\D*)$/);
        return (
          <div key={f.label} className={itemClassName}>
            <p
              data-count={m?.[1] ?? undefined}
              data-suffix={m?.[2] ?? ""}
              className="display-2 font-extrabold leading-none tabular-nums"
            >
              {m ? "0" + (m[2] ?? "") : f.value}
            </p>
            <p className={labelClassName}>{f.label}</p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * A hairline over a shot, for pages whose paper is as pale as the interface
 * inside the frame. Sits above the image, since an inset shadow on the frame
 * would be painted under it.
 */
function Edge({ colour }: { colour?: string }) {
  if (!colour) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ boxShadow: `inset 0 0 0 1px ${colour}` }}
    />
  );
}

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
      if (reducedMotion()) return;
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
  edge,
}: {
  moves: { kicker: string; line: string; src: string; alt: string }[];
  /** hairline over each shot, for pale pages where the frame would vanish */
  edge?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
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
              <Edge colour={edge} />
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
            {/* one hairline over the whole stack, above every layer */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                zIndex: moves.length + 1,
                boxShadow: edge ? `inset 0 0 0 1px ${edge}` : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** The archive of screens, dragged sideways by the scrollbar. */
export function Filmstrip({
  shots,
  ratio = "aspect-[16/10]",
  edge,
}: {
  shots: { src: string; caption: string }[];
  /** frame shape — must match the shots, or object-cover will crop them */
  ratio?: string;
  /** hairline over each shot, for pale pages where the frame would vanish */
  edge?: string;
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
    <div ref={root} className="flex min-h-screen items-center overflow-hidden py-16">
      <div ref={track} className="flex w-max gap-6 pl-5 md:gap-10 md:pl-10">
        {shots.map((s) => (
          <figure key={s.src} className="w-[78vw] shrink-0 md:w-[56vw]">
            <div className={`relative ${ratio} overflow-hidden rounded-[1rem] md:rounded-[1.25rem]`}>
              <Image
                src={s.src}
                alt={s.caption}
                fill
                sizes="(min-width: 768px) 56vw, 78vw"
                className="object-cover"
              />
              <Edge colour={edge} />
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
  plain = false,
  ratio,
  edge,
}: {
  items: { src: string; title: string; note: string; wide?: boolean }[];
  /** photographs stand on their own; only flat artwork needs a plate under it */
  plain?: boolean;
  /** frame shape — set it to the shots' own ratio and nothing gets cropped */
  ratio?: string;
  /** hairline over each shot, for pale pages where the frame would vanish */
  edge?: string;
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
            className={`relative w-full overflow-hidden rounded-[0.9rem] md:rounded-[1.25rem] ${
              ratio ?? (a.wide ? "aspect-[16/7]" : "aspect-[4/3]")
            } ${plain ? "" : "bg-[#FFFFF0]"}`}
          >
            <Image
              src={a.src}
              alt={a.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className={plain ? "object-cover" : "object-contain p-6 md:p-10"}
            />
            <Edge colour={edge} />
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

/**
 * The wholesale ladder, drawn. Each rung is the same product at a bigger
 * quantity, so the bar gets shorter as the box gets heavier — the one thing
 * this shop does that a retail store and a B2B portal need two sites for.
 */
export function PriceLadder({
  rows,
  accent,
  currency = "AED",
}: {
  rows: { range: string; price: number; note: string }[];
  accent: string;
  currency?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const max = Math.max(...rows.map((r) => r.price));

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-rung]").forEach((el, i) => {
        const bar = el.querySelector("[data-bar]") as HTMLElement;
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: Number(bar.dataset.scale),
            duration: 1.1,
            ease: "power3.out",
            delay: i * 0.12,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
        gsap.from(el.querySelectorAll("[data-rung-text]"), {
          y: 14,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          delay: i * 0.12,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {rows.map((r, i) => (
        <div
          key={r.range}
          data-rung
          className="grid items-center gap-x-6 gap-y-3 border-t border-current/15 py-6 md:grid-cols-[8rem_1fr_11rem] md:py-8"
        >
          <p data-rung-text className="text-[11px] font-bold uppercase tracking-[0.25em]">
            {r.range}
          </p>

          {/* the bar is the price: shorter every rung down */}
          <div className="order-3 h-[10px] w-full md:order-none md:h-3">
            <div
              data-bar
              data-scale={r.price / max}
              className="h-full origin-left rounded-full"
              style={{
                transform: `scaleX(${r.price / max})`,
                backgroundColor: i === 0 ? "currentColor" : accent,
                opacity: i === 0 ? 0.25 : 1 - i * 0.18,
              }}
            />
          </div>

          {/* proportional figures on purpose — tabular ones give the thousands
              comma a full digit of air and the price falls apart */}
          <div className="md:text-right">
            <p data-rung-text className="text-[19px] font-extrabold md:text-[24px]">
              {currency} {r.price.toLocaleString("en-US")}
            </p>
            <p
              data-rung-text
              className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60"
            >
              {r.note}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Phone screens, dragged sideways — portrait frames need their own rail. */
export function PhoneRail({
  shots,
  edge,
}: {
  shots: { src: string; caption: string }[];
  /** hairline over each screen, so a white UI still has a frame */
  edge?: string;
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
    <div ref={root} className="flex min-h-screen items-center overflow-hidden py-16">
      <div ref={track} className="flex w-max items-end gap-5 pl-5 md:gap-8 md:pl-10">
        {shots.map((s) => (
          <figure key={s.src} className="w-[54vw] shrink-0 md:w-[19vw]">
            <div className="relative aspect-[1728/3748] overflow-hidden rounded-[1.4rem] md:rounded-[2rem]">
              <Image
                src={s.src}
                alt={s.caption}
                fill
                sizes="(min-width: 768px) 19vw, 54vw"
                className="object-cover"
              />
              <Edge colour={edge} />
            </div>
            <figcaption className="mt-4 text-[10px] font-bold uppercase leading-snug tracking-[0.2em] opacity-70">
              {s.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/** Two rows of phones drifting in opposite directions, seamlessly. */
export function PhoneMarquee({
  rows,
  seconds = 60,
}: {
  rows: string[][];
  seconds?: number;
}) {
  return (
    <div className="flex flex-col gap-4 overflow-hidden md:gap-6">
      {rows.map((row, i) => (
        <div key={i} className="relative flex overflow-hidden">
          {/* the row is rendered twice, so the loop never shows a seam */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="phone-marquee flex shrink-0 gap-4 pr-4 md:gap-6 md:pr-6"
              style={{
                animationDuration: `${seconds}s`,
                animationDirection: i % 2 ? "reverse" : "normal",
              }}
            >
              {row.map((src) => (
                <div
                  key={src + copy}
                  className="relative aspect-[1728/3748] w-[34vw] shrink-0 overflow-hidden rounded-[1rem] md:w-[13vw] md:rounded-[1.4rem]"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 13vw, 34vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Every screen at once — the point is the volume, not any single one. */
export function PhoneWall({ shots }: { shots: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(gsap.utils.toArray<HTMLElement>("[data-wall]"), {
        y: 40,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: { each: 0.04, from: "start" },
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 md:gap-5 lg:grid-cols-8"
    >
      {shots.map((src, i) => (
        <div
          key={src}
          data-wall
          /* every other one sits a little lower, so the grid breathes */
          className={`relative aspect-[1728/3748] overflow-hidden rounded-[0.6rem] md:rounded-[0.9rem] ${
            i % 2 ? "md:translate-y-6" : ""
          }`}
        >
          <Image src={src} alt="" fill sizes="(min-width: 768px) 12vw, 30vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
