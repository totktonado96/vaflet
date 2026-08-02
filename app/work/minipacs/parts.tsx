"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The stone the product's own site is cut from */
const PAPER = "#FAF9F6";
const INK = "#0A0A0A";
const LINE = "#E2DED4";
const GREY = "#6B6B6B";
const OVERLAY = "#F5A623";
const RED = "#B42318";

/**
 * The lights. Scrolling into the reading room dims the whole page to
 * obsidian and scrolling out turns it back to stone — the section itself
 * goes transparent so the page behind it can do the dimming. Without
 * JavaScript or with reduced motion the section keeps its own black.
 */
export function CaseFx() {
  useGSAP(() => {
    if (reducedMotion()) return;
    const main = document.querySelector<HTMLElement>("[data-case]");
    const dark = document.querySelector<HTMLElement>("[data-dark]");
    if (!main || !dark) return;
    gsap.set(dark, { backgroundColor: "transparent" });
    gsap.fromTo(
      main,
      { backgroundColor: PAPER },
      {
        backgroundColor: INK,
        ease: "none",
        scrollTrigger: { trigger: dark, start: "top 85%", end: "top 55%", scrub: true },
      },
    );
    gsap.fromTo(
      main,
      { backgroundColor: INK },
      {
        backgroundColor: PAPER,
        ease: "none",
        immediateRender: false,
        scrollTrigger: { trigger: dark, start: "bottom 70%", end: "bottom 30%", scrub: true },
      },
    );
  });
  return null;
}

/**
 * The cine scrubber off the viewer's own edge: page progress as an instance
 * counter, 01 / 22, with a thin fill running the right edge. White under
 * mix-blend-difference, so it reads on stone and in the dark room alike.
 */
export function CineBar({ total = 22 }: { total?: number }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) {
        gsap.set(root.current, { display: "none" });
        return;
      }
      const fill = root.current!.querySelector<HTMLElement>("[data-cine-fill]");
      const num = root.current!.querySelector<HTMLElement>("[data-cine-n]");
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-case]",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              num!.textContent = String(
                1 + Math.round(self.progress * (total - 1)),
              ).padStart(2, "0");
            },
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-y-0 right-0 z-40 hidden md:block"
      style={{ mixBlendMode: "difference" }}
    >
      <div className="absolute inset-y-0 right-0 w-[3px]">
        <div
          data-cine-fill
          className="h-full w-full origin-top bg-white"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
      <p className="absolute bottom-5 right-4 font-mono text-[10px] font-bold tracking-[0.3em] text-white">
        <span data-cine-n>01</span> / {String(total).padStart(2, "0")}
      </p>
    </div>
  );
}

/** A rule that draws itself the first time it is seen. */
export function Rule({ colour = INK, thick = 2 }: { colour?: string; thick?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: "power3.inOut",
          scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="w-full origin-left"
      style={{ height: thick, backgroundColor: colour }}
    />
  );
}

/**
 * The viewer shot with the acquisition line still running: a faint overlay-
 * orange scanline sweeps the frame the whole time the section is on screen,
 * plus the same counter-scroll drift every other big shot on the site has.
 */
export function ViewerShot({ src, alt }: { src: string; alt: string }) {
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
      gsap.fromTo(
        "[data-scan]",
        { top: "-2%" },
        { top: "101%", duration: 9, ease: "none", repeat: -1 },
      );
    },
    { scope: frame },
  );

  return (
    <div
      ref={frame}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem]"
    >
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
      <span
        data-scan
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
        style={{ backgroundColor: OVERLAY, opacity: 0.3, boxShadow: `0 0 14px ${OVERLAY}` }}
      />
    </div>
  );
}

const MODALITIES = "CT · MR · US · XR · DX · MG · NM · PT · RF · XA";

/** Everything the archive accepts, as a tape the scroll drags past. */
export function Tape() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        "[data-tape]",
        { xPercent: 0 },
        {
          xPercent: -26,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="overflow-hidden">
      <p
        data-tape
        className="w-max whitespace-nowrap pl-5 font-mono text-[15px] font-bold uppercase tracking-[0.5em] opacity-60 md:pl-10 md:text-[22px]"
      >
        {MODALITIES} · {MODALITIES} · {MODALITIES}
      </p>
    </div>
  );
}

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

/** The guarantee rows, each drawing its own hairline as it arrives. */
export function Deal({ items }: { items: string[][] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-deal-row]").forEach((row) => {
        gsap.fromTo(
          row.querySelector("[data-deal-rule]"),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 86%", once: true },
          },
        );
        gsap.from(row.querySelectorAll("[data-deal-text]"), {
          y: 18,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 86%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {items.map(([title, note]) => (
        <div
          key={title}
          data-deal-row
          className="relative grid gap-2 py-7 md:grid-cols-[22%_1fr] md:gap-10"
        >
          <span
            data-deal-rule
            aria-hidden
            className="absolute inset-x-0 top-0 h-px origin-left"
            style={{ backgroundColor: LINE }}
          />
          <p data-deal-text className="font-mono text-[11px] font-bold uppercase tracking-[0.25em]">
            {title}
          </p>
          <p
            data-deal-text
            className="max-w-[64ch] text-[17px] font-light leading-relaxed opacity-85 md:text-[19px]"
          >
            {note}
          </p>
        </div>
      ))}
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

/** Integer hash -> [0,1). Deterministic pseudo-random per dot. */
function hash01(ix: number, iy: number): number {
  let h = (ix * 374761393 + iy * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * The product's own masthead trick, worn by the case: the title set in
 * halftone, every dot a particle with a home sampled from the glyphs. The
 * pointer blows the letters apart; a damped spring pulls every dot back with
 * a small overshoot. Ported from the minipacs.net wordmark, retyped in this
 * site's own grotesk — obsidian ink on stone instead of white on black.
 * Reduced motion: one static frame, no loop, no pointer tracking.
 */
export function HalftoneWordmark({
  text,
  className = "",
  gap = 4,
  color = INK,
  baseAlpha = 0.46,
  dotScale = 0.34,
}: {
  text: string;
  className?: string;
  gap?: number;
  color?: string;
  baseAlpha?: number;
  dotScale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = reducedMotion();

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let disposed = false;

    // the site's own face, resolved from the body the page is typeset in
    const family = getComputedStyle(document.body).fontFamily || "sans-serif";
    const font = (size: number) => `800 ${size}px ${family}`;

    // particle state: structure-of-arrays for speed
    let n = 0;
    let hx = new Float32Array(0); // home
    let hy = new Float32Array(0);
    let px = new Float32Array(0); // position
    let py = new Float32Array(0);
    let vx = new Float32Array(0); // velocity
    let vy = new Float32Array(0);
    let edge = new Float32Array(0); // glyph-alpha radius factor
    let letter = new Uint8Array(0); // which glyph each dot belongs to
    let letterCount = 0;

    const pointer = { x: -9999, y: -9999, active: false };
    const RADIUS = 72;
    const R2 = RADIUS * RADIUS;
    const FORCE = 2.8;
    const SPRING = 0.045;
    const DAMP = 0.88;
    // idle life: letters light up one after another; dots never move
    const LETTER_STEP = 0.4;

    /** Rasterize the wordmark offscreen, sample it into particles at home. */
    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width < 10 || height < 10) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = Math.ceil(width);
      off.height = Math.ceil(height);
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.font = font(100);
      const w100 = octx.measureText(text).width || 1;
      const fontSize = Math.min((width * 0.985 * 100) / w100, height * 0.9);
      octx.font = font(fontSize);
      octx.textAlign = "left";
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      const anchorX = width * 0.002;
      octx.fillText(text, anchorX, height * 0.54);
      const img = octx.getImageData(0, 0, off.width, off.height).data;

      // glyph x-ranges so each dot knows which letter it belongs to
      const ranges: { x0: number; x1: number }[] = [];
      for (let ci = 0; ci < text.length; ci++) {
        if (text[ci].trim() === "") continue;
        const pre = octx.measureText(text.slice(0, ci)).width;
        const cw = octx.measureText(text[ci]).width;
        ranges.push({ x0: anchorX + pre, x1: anchorX + pre + cw });
      }
      letterCount = ranges.length;
      const letterOf = (x: number): number => {
        for (let r = 0; r < ranges.length; r++) {
          if (x >= ranges[r].x0 && x <= ranges[r].x1) return r;
        }
        let best = 0;
        let bestD = Infinity;
        for (let r = 0; r < ranges.length; r++) {
          const d = Math.min(Math.abs(x - ranges[r].x0), Math.abs(x - ranges[r].x1));
          if (d < bestD) {
            bestD = d;
            best = r;
          }
        }
        return best;
      };

      const homes: number[] = [];
      const edges: number[] = [];
      const letters: number[] = [];
      let iy = 0;
      for (let y = gap / 2; y < height; y += gap, iy++) {
        let ix = 0;
        for (let x = gap / 2; x < width; x += gap, ix++) {
          const a = img[(Math.floor(y) * off.width + Math.floor(x)) * 4 + 3] / 255;
          if (a > 0.14) {
            homes.push(x, y);
            edges.push((0.3 + 0.7 * a) * (0.92 + 0.16 * hash01(ix + 1, iy + 1)));
            letters.push(letterOf(x));
          }
        }
      }
      n = homes.length / 2;
      hx = new Float32Array(n);
      hy = new Float32Array(n);
      px = new Float32Array(n);
      py = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      edge = new Float32Array(edges);
      letter = new Uint8Array(letters);
      for (let i = 0; i < n; i++) {
        hx[i] = px[i] = homes[i * 2];
        hy[i] = py[i] = homes[i * 2 + 1];
      }
    };

    /** One physics + paint step. */
    const step = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      const baseR = gap * dotScale;

      // the chase: one glyph glows at a time, bleeding into the next
      const pos = letterCount > 0 ? (t / LETTER_STEP) % letterCount : 0;
      const half = letterCount / 2;

      for (let i = 0; i < n; i++) {
        let ax = (hx[i] - px[i]) * SPRING;
        let ay = (hy[i] - py[i]) * SPRING;

        if (pointer.active) {
          const dx = px[i] - pointer.x;
          const dy = py[i] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / RADIUS) * FORCE;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
        }

        vx[i] = (vx[i] + ax) * DAMP;
        vy[i] = (vy[i] + ay) * DAMP;
        px[i] += vx[i];
        py[i] += vy[i];

        const speed = Math.abs(vx[i]) + Math.abs(vy[i]);

        let ld = Math.abs(pos - letter[i]);
        if (ld > half) ld = letterCount - ld;
        const glow = Math.max(0, 1 - ld / 1.2);

        ctx.globalAlpha = Math.min(1, baseAlpha + (1 - baseAlpha) * glow + speed * 0.09);
        ctx.beginPath();
        ctx.arc(px[i], py[i], baseR * edge[i], 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (tMs: number) => {
      step(tMs / 1000);
      raf = requestAnimationFrame(loop);
    };

    const staticFrame = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.min(1, baseAlpha + 0.22);
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.arc(hx[i], hy[i], gap * dotScale * 0.94 * edge[i], 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    // the face must be resolved before rasterizing, or we sample the fallback
    const start = async () => {
      try {
        await document.fonts.load(font(100));
        await document.fonts.ready;
      } catch {
        /* draw with whatever is available */
      }
      if (disposed) return;
      build();
      gsap.fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1, ease: "power3.out" });
      if (reduce) {
        staticFrame();
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    const ro = new ResizeObserver(() => {
      build();
      if (reduce) staticFrame();
    });
    ro.observe(canvas);
    if (!reduce) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerdown", onMove);
      canvas.addEventListener("pointerleave", onLeave);
    }
    void start();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [text, gap, color, baseAlpha, dotScale]);

  return <canvas ref={canvasRef} className={"block " + className} aria-hidden="true" />;
}

/**
 * The gate's own headline runs the lab result down as the reader approaches:
 * eGFR 88 at a distance, 22 by the time the section is read — and the moment
 * it crosses 30, the ink goes red. Markup ships the verdict for anyone
 * scrolling without motion.
 */
export function GateHead() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const num = root.current!.querySelector<HTMLElement>("[data-egfr]");
      const kicker = root.current!.querySelector<HTMLElement>("[data-gate-kicker]");
      if (!num || !kicker) return;
      const box = { n: 88 };
      const paint = () => {
        const red = box.n < 30;
        num.textContent = String(Math.round(box.n));
        num.style.color = red ? RED : "inherit";
        kicker.style.color = red ? RED : "inherit";
      };
      paint();
      gsap.to(box, {
        n: 22,
        ease: "none",
        onUpdate: paint,
        scrollTrigger: {
          trigger: root.current,
          start: "top 75%",
          end: "top 30%",
          scrub: true,
        },
      });
      gsap.from(root.current!.children, {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 84%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <p
        data-gate-kicker
        className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]"
        style={{ color: RED }}
      >
        The safety gate
      </p>
      <h2 className="display-2 mt-8 max-w-[18ch] font-extrabold uppercase leading-[1.0]">
        eGFR{" "}
        <span data-egfr className="tabular-nums" style={{ color: RED }}>
          22
        </span>
        . The booking stops here.
      </h2>
    </div>
  );
}
