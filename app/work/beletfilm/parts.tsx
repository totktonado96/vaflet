"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";
import { EDGE, INK, PANEL } from "./palette";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** A hairline laid over a screen — painted above the image, not under it. */
function Edge() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ boxShadow: `inset 0 0 0 1px ${EDGE}` }}
    />
  );
}

type Shot = { src: string; alt: string };

/**
 * A phone screen shown as the screen and nothing else — no device, no notch.
 * Shorter screens sit at the top of the app's own ground, the way they would
 * on the phone, instead of being stretched to fill.
 */
function Screen({ src, alt, sizes }: Shot & { sizes: string }) {
  return (
    <div
      className="relative aspect-[720/1600] overflow-hidden rounded-[1.1rem] md:rounded-[1.6rem]"
      style={{ backgroundColor: PANEL }}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-contain object-top" />
      <Edge />
    </div>
  );
}

const timecode = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * The player's scrubber, laid across the case: the page plays like an episode
 * of the runtime on the player screen, and the chapter is the section on screen.
 */
export function Scrubber({ runtime }: { runtime: number }) {
  const bar = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const chapter = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const total = timecode(runtime);
    const set = (p: number) => {
      fill.current!.style.transform = `scaleX(${p})`;
      thumb.current!.style.left = `${p * 100}%`;
      time.current!.textContent = `${timecode(p * runtime)} / ${total}`;
    };
    set(0);
    ScrollTrigger.create({
      trigger: "[data-bf-start]",
      start: "top 70%",
      endTrigger: "[data-bf-end]",
      end: "bottom bottom",
      // it starts above the pins and ends below them; a re-sort by start would
      // measure it before their spacers exist, so it always refreshes last
      refreshPriority: -1,
      onUpdate: (self) => set(self.progress),
      onToggle: (self) => bar.current!.classList.toggle("is-on", self.isActive),
    });
    gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 70%",
        end: "bottom 70%",
        refreshPriority: -1,
        onToggle: (self) => {
          if (self.isActive) chapter.current!.textContent = el.dataset.chapter ?? "";
        },
      });
    });
  });

  return (
    <div
      ref={bar}
      aria-hidden
      className="bf-scrubber pointer-events-none fixed inset-x-0 bottom-0 z-40"
    >
      <div
        className="shell pb-[max(1rem,env(safe-area-inset-bottom))] pt-10"
        style={{ background: `linear-gradient(to top, ${INK}, rgba(10,10,10,0))` }}
      >
        <div className="flex items-baseline justify-between gap-6 text-[12px] font-medium tabular-nums">
          <span ref={time} className="text-white/85" />
          <span ref={chapter} className="truncate text-white/55" />
        </div>
        <div className="relative mt-2.5 h-[3px] rounded-full bg-white/15">
          <div
            ref={fill}
            className="absolute inset-0 origin-left rounded-full bg-white"
            style={{ transform: "scaleX(0)" }}
          />
          <span
            ref={thumb}
            className="absolute top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={{ left: "0%" }}
          />
        </div>
      </div>
    </div>
  );
}

type Move = { kicker: string; line: string; shots: [Shot, Shot] };

/** Three errands, two screens each: the pair stays put while its copy scrolls. */
export function PhoneMoves({ moves }: { moves: Move[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const mm = gsap.matchMedia();
      // desktop: the pairs stacked, each wiped in over the last as its copy arrives
      mm.add("(min-width: 768px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-pm-layer]").forEach((layer, i) => {
          if (i === 0) return;
          gsap.fromTo(
            layer,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: {
                trigger: `[data-pm-copy="${i}"]`,
                start: "top 80%",
                end: "top 35%",
                scrub: true,
              },
            },
          );
        });
      });
      // phones: no sticky pair, so each errand rises in with its own screens
      mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-pm-copy]").forEach((blk) => {
          gsap.from(blk.children, {
            y: 26,
            autoAlpha: 0,
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: blk, start: "top 84%", once: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative md:grid md:grid-cols-[38%_62%]">
      <div>
        {moves.map((m, i) => (
          <div
            key={m.kicker}
            data-pm-copy={i}
            className="flex flex-col justify-center py-12 md:min-h-screen md:py-0 md:pr-12"
          >
            <p className="bf-eyebrow">
              {String(i + 1).padStart(2, "0")} — {m.kicker}
            </p>
            <p className="display-3 mt-5 max-w-[16ch] leading-[1.08]">{m.line}</p>
            <div className="mt-8 grid grid-cols-2 gap-3 md:hidden">
              {m.shots.map((s) => (
                <Screen key={s.src} {...s} sizes="45vw" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="sticky top-0 flex h-screen items-center justify-center">
          {/* two 720-wide screens and a 24-wide gap, in the screens' own units */}
          <div className="relative" style={{ height: "min(80vh, 58vw)", aspectRatio: "1464 / 1600" }}>
            {moves.map((m, i) => (
              <div
                key={m.kicker}
                data-pm-layer
                className="absolute inset-0 grid grid-cols-2 gap-[1.64%]"
                style={{ zIndex: i + 1, backgroundColor: INK }}
              >
                {m.shots.map((s) => (
                  <Screen key={s.src} {...s} sizes="24vw" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type Long = Shot & { w: number; h: number; label: string; note: string };

/**
 * Screens taller than a phone, each scrolling inside its own window as the
 * page scrolls — shown whole, the way they are used, instead of cut to fit.
 */
export function ScrollScreens({ screens }: { screens: Long[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const imgs = gsap.utils.toArray<HTMLElement>("[data-ss-img]");
      const travel = (img: HTMLElement) =>
        -(img.offsetHeight - (img.parentElement as HTMLElement).offsetHeight);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=180%",
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        imgs.forEach((img) => tl.to(img, { y: () => travel(img), ease: "none" }, 0));
        // this pin exists only above 768px: a window that widens creates it after
        // the pins below, so re-sort and let them measure against it
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
      mm.add("(max-width: 767px)", () => {
        imgs.forEach((img) =>
          gsap.to(img, {
            y: () => travel(img),
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top 70%",
              end: "bottom 30%",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }),
        );
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="flex flex-col items-center gap-14 py-10 md:h-screen md:flex-row md:items-center md:justify-center md:gap-[4vw] md:py-0"
    >
      {screens.map((s) => (
        <figure key={s.src} className="w-[72vw] md:w-auto">
          <div
            className="relative aspect-[720/1600] overflow-hidden rounded-[1.4rem] md:h-[min(72vh,40vw)] md:rounded-[1.6rem]"
            style={{ backgroundColor: PANEL }}
          >
            <Image
              data-ss-img
              src={s.src}
              alt={s.alt}
              width={s.w}
              height={s.h}
              sizes="(min-width: 768px) 22vw, 72vw"
              className="block h-auto w-full"
            />
            <Edge />
          </div>
          <figcaption className="mt-4 max-w-[17rem]">
            <span className="block text-[14px] font-semibold">{s.label}</span>
            <span className="mt-1 block text-[13px] leading-snug text-white/55">{s.note}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

type State = Shot & { label: string; note: string };

/** One frame of the player; its states take turns in it, the way a session goes. */
export function PlayerStates({ states }: { states: State[] }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = "min(84vw, calc((100vh - 16rem) * 2.2222))";

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-ps-layer]");
        const steps = gsap.utils.toArray<HTMLElement>("[data-ps-step]");
        // each state wipes up over the last: a crossfade would lay one
        // interface's text over another's halfway through
        gsap.set(layers.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(steps.slice(1), { opacity: 0.35 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + window.innerHeight * (states.length - 1) * 0.9,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        layers.forEach((layer, i) => {
          if (i === 0) return;
          tl.to(layer, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "power1.inOut" }, i - 0.25)
            .to(steps[i - 1], { opacity: 0.35, duration: 0.3 }, i - 0.25)
            .to(steps[i], { opacity: 1, duration: 0.3 }, i - 0.25);
        });
        // a beat on the last state before the pin lets go
        tl.to({}, { duration: 0.5 });
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div className="bf-states-stack hidden h-screen flex-col items-center justify-center gap-8 pb-16 md:flex">
        <div
          className="relative aspect-[1600/720] overflow-hidden rounded-[1.5rem]"
          style={{ width: frame, backgroundColor: PANEL }}
        >
          {states.map((s, i) => (
            <div key={s.src} data-ps-layer className="absolute inset-0" style={{ zIndex: i + 1 }}>
              <Image src={s.src} alt={s.alt} fill sizes="84vw" className="object-cover" />
            </div>
          ))}
          <span className="absolute inset-0 z-10 rounded-[inherit]">
            <Edge />
          </span>
        </div>
        <ol className="grid grid-cols-5 gap-6" style={{ width: frame }}>
          {states.map((s, i) => (
            <li key={s.label} data-ps-step>
              <p className="bf-eyebrow">
                {String(i + 1).padStart(2, "0")} · {s.label}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-white/75">{s.note}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="bf-states-list grid gap-10 md:hidden">
        {states.map((s, i) => (
          <figure key={s.src}>
            <div
              className="relative aspect-[1600/720] overflow-hidden rounded-[1rem] md:rounded-[1.5rem]"
              style={{ backgroundColor: PANEL }}
            >
              <Image src={s.src} alt={s.alt} fill sizes="100vw" className="object-cover" />
              <Edge />
            </div>
            <figcaption className="mt-3">
              <span className="bf-eyebrow block">
                {String(i + 1).padStart(2, "0")} · {s.label}
              </span>
              <span className="mt-1 block text-[14px] leading-snug text-white/75">{s.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
