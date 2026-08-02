"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
 * A screenshot behind minimal browser chrome, shown smaller than full bleed:
 * the 1437-px sources stay close to their native size on retina, which is the
 * whole point. Drifts against the scroll like every big shot on the site.
 */
export function WindowShot({
  src,
  alt,
  title,
  caption,
  note,
  className = "",
  dark = false,
}: {
  src: string;
  alt: string;
  /** the mono line in the title bar — where in the product we are */
  title: string;
  caption?: string;
  note?: string;
  className?: string;
  dark?: boolean;
}) {
  const frame = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        frame.current,
        { y: 26 },
        {
          y: -26,
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

  const line = dark ? "rgba(255,255,255,0.2)" : "rgba(10,10,10,0.16)";
  const barBg = dark ? "rgba(255,255,255,0.06)" : "#F4F2EC";

  return (
    <figure ref={frame} className={className}>
      <div
        className="overflow-hidden rounded-[0.9rem] md:rounded-[1.1rem]"
        style={{ boxShadow: `inset 0 0 0 1px ${line}` }}
      >
        <div
          className="flex items-center gap-3 px-4 py-2.5 md:px-5"
          style={{ backgroundColor: barBg, boxShadow: `inset 0 -1px 0 ${line}` }}
        >
          <span className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-[7px] rounded-full bg-current opacity-20"
              />
            ))}
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-55">
            {title}
          </span>
        </div>
        <div className="relative aspect-[1437/855] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 768px) 70vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
      {(caption || note) && (
        <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {caption && (
            <span className="text-[11px] font-bold uppercase tracking-[0.25em]">
              {caption}
            </span>
          )}
          {note && <span className="text-[11px] font-light opacity-70">{note}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * A screen recording in the same drifting frame as every big still — muted,
 * looped, and paused the moment it leaves the viewport. The poster keeps the
 * first paint honest.
 */
export function VideoDrift({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster?: string;
  /** accessible one-liner for what the recording shows */
  label: string;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const video = frame.current!.querySelector<HTMLVideoElement>("video");
      if (!video) return;
      if (!reducedMotion()) {
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
      } else {
        // reduced motion: hold the poster, never roll
        video.removeAttribute("autoplay");
        video.pause();
        return;
      }
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      });
      io.observe(video);
      return () => io.disconnect();
    },
    { scope: frame },
  );

  return (
    <div
      ref={frame}
      className={`relative overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem] ${className}`}
    >
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

/**
 * The radiologist's own gesture, working: moving over the MRI windows it the
 * way a real PACS does — horizontal is window width (contrast), vertical is
 * window centre (brightness) — and the orange ww/wc readout follows. Leaving
 * the frame settles it back to the study's stored values.
 */
export function WindowLevel({ src, alt }: { src: string; alt: string }) {
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const img = frame.current!.querySelector<HTMLElement>("[data-wl-img]");
      const ww = frame.current!.querySelector<HTMLElement>("[data-ww]");
      const wc = frame.current!.querySelector<HTMLElement>("[data-wc]");
      const hint = frame.current!.querySelector<HTMLElement>("[data-wl-hint]");
      if (!img || !ww || !wc) return;

      if (!reducedMotion()) {
        gsap.fromTo(
          frame.current,
          { y: 26 },
          {
            y: -26,
            ease: "none",
            scrollTrigger: {
              trigger: frame.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      let touched = false;
      const onMove = (e: PointerEvent) => {
        const rect = img.getBoundingClientRect();
        const nx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const ny = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
        // narrow window = harder contrast; higher centre = darker image
        const contrast = 2.1 - nx * 1.35;
        const brightness = 1.55 - ny * 0.95;
        img.style.filter = `brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)})`;
        ww.textContent = String(Math.round(150 + nx * 1350));
        wc.textContent = String(Math.round(30 + ny * 800));
        if (!touched && hint) {
          touched = true;
          gsap.to(hint, { autoAlpha: 0, duration: 0.4 });
        }
      };
      const onLeave = () => {
        img.style.filter = "";
        ww.textContent = "596";
        wc.textContent = "343";
      };
      const host = frame.current!;
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      return () => {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: frame },
  );

  return (
    <div ref={frame}>
      <div
        className="overflow-hidden rounded-[0.9rem] md:rounded-[1.1rem]"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-2.5 md:px-5"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <span className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-[7px] rounded-full bg-current opacity-25" />
            ))}
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-55">
            minipacs — viewer
          </span>
        </div>
        <div className="relative aspect-[1437/855] w-full overflow-hidden">
          <div data-wl-img className="absolute inset-0">
            <Image src={src} alt={alt} fill sizes="80vw" className="object-cover" />
          </div>
          <p
            className="absolute right-4 top-3 font-mono text-[10px] font-bold tracking-[0.2em] md:right-6 md:top-5 md:text-[12px]"
            style={{ color: OVERLAY }}
          >
            ww/wc <span data-ww>596</span> / <span data-wc>343</span>
          </p>
          <p
            data-wl-hint
            className="absolute bottom-3 left-4 font-mono text-[10px] font-bold uppercase tracking-[0.25em] md:bottom-5 md:left-6"
            style={{ color: OVERLAY, opacity: 0.8 }}
          >
            move over the image — window / level
          </p>
        </div>
      </div>
    </div>
  );
}

const FINDINGS =
  "No acute infarct, intracranial hemorrhage, mass effect, or abnormal enhancement. The ventricles and sulci are normal in size. Major intracranial flow voids are preserved.";

/**
 * The dictation, happening: the findings type themselves the first time the
 * card is seen, with the level bars running while the voice is "speaking".
 * Reduced motion ships the finished paragraph.
 */
export function Dictation() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const out = root.current!.querySelector<HTMLElement>("[data-dict-out]");
      const caret = root.current!.querySelector<HTMLElement>("[data-dict-caret]");
      const state = root.current!.querySelector<HTMLElement>("[data-dict-state]");
      const bars = gsap.utils.toArray<HTMLElement>("[data-dict-bar]");
      if (!out) return;

      out.textContent = "";
      const blink = gsap.to(caret, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });
      const wave = bars.map((b, i) =>
        gsap.to(b, {
          scaleY: () => 0.25 + Math.random() * 0.75,
          duration: 0.16 + (i % 3) * 0.05,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          paused: true,
        }),
      );

      const box = { i: 0 };
      gsap.to(box, {
        i: FINDINGS.length,
        duration: FINDINGS.length * 0.024,
        ease: "none",
        paused: true,
        scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        onStart: () => wave.forEach((w) => w.play()),
        onUpdate: () => {
          out.textContent = FINDINGS.slice(0, Math.round(box.i));
        },
        onComplete: () => {
          wave.forEach((w) => {
            w.pause();
            gsap.to(w.targets()[0] as HTMLElement, { scaleY: 0.2, duration: 0.3 });
          });
          blink.kill();
          gsap.set(caret, { opacity: 0 });
          if (state) state.textContent = "findings · 170 chars · dictated";
        },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-5 items-end gap-[3px]"
          style={{ color: INK }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              data-dict-bar
              className="w-[3px] origin-bottom rounded-full bg-current"
              style={{ height: `${[10, 16, 20, 14, 8][i]}px`, transform: "scaleY(0.2)" }}
            />
          ))}
        </span>
        <p
          data-dict-state
          className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-60"
        >
          findings · dictating
        </p>
      </div>
      <p className="mt-5 min-h-[7.5rem] max-w-[58ch] font-mono text-[13px] leading-relaxed md:min-h-[6rem] md:text-[14px]">
        <span data-dict-out>{FINDINGS}</span>
        <span data-dict-caret aria-hidden className="ml-[2px] inline-block h-[1em] w-[7px] translate-y-[2px] bg-current" />
      </p>
    </div>
  );
}

/**
 * The box itself, drawn in the mark's own isometric language — solid cap,
 * outlined shelves — and fed: little 1-bit study tiles stream in from the
 * edges of the section and vanish under the cap, the way studies arrive
 * over C-STORE all day. The strokes draw themselves, the power light blinks.
 */
export function MiniBox() {
  const root = useRef<HTMLDivElement>(null);

  // the stream: canvas under the svg, so arrivals disappear under the cap
  useEffect(() => {
    const host = root.current;
    if (!host || reducedMotion()) return;
    const canvas = host.querySelector<HTMLCanvasElement>("[data-box-stream]");
    const svg = host.querySelector<SVGSVGElement>("[data-box-svg]");
    if (!canvas || !svg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let width = 0;
    let height = 0;
    let tx = 0;
    let ty = 0;
    let last = 0;

    type Tile = {
      x0: number;
      y0: number;
      cx: number;
      cy: number;
      t: number;
      dur: number;
      size: number;
      filled: boolean;
      rot: number;
      spin: number;
    };
    let tiles: Tile[] = [];

    const spawn = (): Tile => {
      const side = Math.random();
      let x, y;
      if (side < 0.4) {
        x = -24;
        y = Math.random() * height * 0.75;
      } else if (side < 0.8) {
        x = width + 24;
        y = Math.random() * height * 0.75;
      } else {
        x = Math.random() * width;
        y = -24;
      }
      return {
        x0: x,
        y0: y,
        cx: (x + tx) / 2 + (Math.random() - 0.5) * 180,
        cy: Math.min(y, ty) - 40 - Math.random() * 130,
        t: -Math.random() * 0.8,
        dur: 2.4 + Math.random() * 2.4,
        size: 5 + Math.random() * 9,
        filled: Math.random() < 0.5,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 1.4,
      };
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = svg.getBoundingClientRect();
      // the cap's centre, in canvas coordinates — where the tiles vanish
      tx = s.left - rect.left + s.width / 2;
      ty = s.top - rect.top + s.height * 0.33;
      if (!tiles.length) tiles = Array.from({ length: 14 }, spawn);
    };

    const step = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = INK;
      ctx.fillStyle = INK;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < tiles.length; i++) {
        const p = tiles[i];
        p.t += dt / p.dur;
        if (p.t >= 1) {
          tiles[i] = spawn();
          continue;
        }
        if (p.t < 0) continue;
        const t = p.t;
        const u = 1 - t;
        const x = u * u * p.x0 + 2 * u * t * p.cx + t * t * tx;
        const y = u * u * p.y0 + 2 * u * t * p.cy + t * t * ty;
        const alpha = t < 0.12 ? t / 0.12 : t > 0.85 ? (1 - t) / 0.15 : 1;
        const size = p.size * (0.55 + 0.45 * u);
        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.translate(x, y);
        ctx.rotate(p.rot + p.spin * t * Math.PI);
        if (p.filled) ctx.fillRect(-size / 2, -size / 2, size, size);
        else ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }
      raf = requestAnimationFrame(step);
    };

    resize();
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(step);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(host);
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const paths = gsap.utils.toArray<SVGPathElement>("[data-box-path]");
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.fromTo(
          p,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.1,
            delay: i * 0.18,
            ease: "power2.inOut",
            scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
          },
        );
      });
      gsap.from("[data-box-cap]", {
        autoAlpha: 0,
        y: 10,
        duration: 0.8,
        delay: 0.5,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });
      gsap.from("[data-box-label]", {
        y: 16,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.12,
        delay: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });
      // the machine is on
      gsap.to("[data-box-led]", {
        opacity: 0.15,
        duration: 0.1,
        repeat: -1,
        repeatDelay: 1.7,
        yoyo: true,
        ease: "steps(1)",
        delay: 1.6,
      });
    },
    { scope: root },
  );

  const label =
    "font-mono text-[11px] font-bold uppercase leading-relaxed tracking-[0.22em]";

  return (
    <div
      ref={root}
      className="relative grid items-center gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-16"
    >
      {/* the stream of arriving studies, under everything */}
      <canvas
        data-box-stream
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="relative hidden text-right md:block">
        <p data-box-label className={label}>
          one mini PC,
          <br />
          on a shelf in the clinic
        </p>
      </div>

      <div className="relative">
        <svg
          data-box-svg
          viewBox="0 0 240 190"
          className="mx-auto w-[240px] md:w-[300px]"
          fill="none"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
          aria-hidden
        >
          {/* the cap — solid, like the mark's own diamond */}
          <path data-box-cap d="M120 22 L204 66 L120 110 L36 66 Z" fill={INK} stroke={INK} />
          {/* the body */}
          <path data-box-path d="M36 66 L36 112 L120 156 L120 110" />
          <path data-box-path d="M204 66 L204 112 L120 156" />
          {/* vents on the right face */}
          <path data-box-path d="M150 122 L186 103" strokeWidth={2.5} opacity={0.55} />
          <path data-box-path d="M150 132 L186 113" strokeWidth={2.5} opacity={0.55} />
          <path data-box-path d="M150 142 L186 123" strokeWidth={2.5} opacity={0.55} />
          {/* the power light — on */}
          <circle data-box-path data-box-led cx="70" cy="112" r="4" strokeWidth={2.5} />
          {/* the shelf line it sits on */}
          <path data-box-path d="M12 168 L228 168" strokeWidth={2} opacity={0.35} />
        </svg>
        <p className="mt-6 text-center font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-50">
          studies arriving over C-STORE, around the clock
        </p>
      </div>

      <div className="relative flex flex-col gap-8 text-left">
        <p data-box-label className={`${label} md:hidden`}>
          one mini PC, on a shelf in the clinic
        </p>
        <p data-box-label className={label}>
          millions of images
          <br />
          in the archive on it
        </p>
        <p data-box-label className={label}>
          AES-256 backups,
          <br />
          nightly, encrypted
        </p>
      </div>
    </div>
  );
}

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

/** Smooth 2D value noise (bilinear + smoothstep over a hashed lattice). */
function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash01(xi, yi);
  const b = hash01(xi + 1, yi);
  const c = hash01(xi, yi + 1);
  const d = hash01(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/**
 * The living halftone off minipacs.net: a canvas dot field whose per-dot
 * radius flows over time (layered value noise) and swells toward the pointer.
 * Painted transparent so the page's own dimming shows through; the loop only
 * runs while the section is on screen. Reduced motion gets one static frame.
 */
export function HalftoneField({
  className = "",
  gap = 15,
  speed = 1,
  fade = "none",
  intensity = 0.9,
}: {
  className?: string;
  gap?: number;
  speed?: number;
  /** Dissolve the dots toward this edge so text placed there stays readable. */
  fade?: "none" | "left" | "right" | "top" | "bottom";
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = reducedMotion();

    let raf = 0;
    let running = false;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999, active: false };
    // rectangles the dots must clear out of — the copy, wherever it lands
    let avoid: { x0: number; y0: number; x1: number; y1: number }[] = [];

    const measureAvoid = () => {
      const host = canvas.parentElement;
      if (!host) return;
      const base = canvas.getBoundingClientRect();
      const PAD = 18;
      avoid = Array.from(host.querySelectorAll<HTMLElement>("[data-halftone-avoid]")).map(
        (el) => {
          const r = el.getBoundingClientRect();
          return {
            x0: r.left - base.left - PAD,
            y0: r.top - base.top - PAD,
            x1: r.right - base.left + PAD,
            y1: r.bottom - base.top + PAD,
          };
        },
      );
    };

    /** 0 inside a copy block, ramping to 1 within ~90 px of its edge. */
    const avoidWeight = (x: number, y: number) => {
      let w = 1;
      for (const r of avoid) {
        const dx = Math.max(r.x0 - x, 0, x - r.x1);
        const dy = Math.max(r.y0 - y, 0, y - r.y1);
        w = Math.min(w, Math.min(1, Math.max(dx, dy) / 90));
        if (w === 0) return 0;
      }
      return w;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureAvoid();
    };

    const edgeWeight = (x: number, y: number) => {
      // 1 where dots stay dense, 0 where they dissolve (the text-safe zone)
      switch (fade) {
        case "left":
          return Math.min(1, Math.max(0, (x / width - 0.12) / 0.5));
        case "right":
          return Math.min(1, Math.max(0, (0.88 - x / width) / 0.5));
        case "top":
          return Math.min(1, Math.max(0, (y / height - 0.12) / 0.5));
        case "bottom":
          return Math.min(1, Math.max(0, (0.88 - y / height) / 0.5));
        default:
          return 1;
      }
    };

    const draw = (tMs: number) => {
      const t = (tMs / 1000) * speed;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";

      // dense dots stay just short of merging, so the darkest zone still
      // reads as halftone rather than a flat fill
      const maxR = gap * 0.56;
      const influence = 200;
      const s1 = 1 / 190;
      const s2 = 1 / 80;

      let iy = 0;
      for (let y = gap / 2; y < height; y += gap, iy++) {
        let ix = 0;
        for (let x = gap / 2; x < width; x += gap, ix++) {
          const gx = x / width;
          const gy = y / height;
          // gentle diagonal base for an elegant overall direction
          let n = 0.2 + 0.16 * (1 - (gx * 0.5 + (1 - gy) * 0.5));
          // non-periodic organic flow: two octaves drifting apart
          n += (valueNoise(x * s1 + t * 0.1, y * s1 - t * 0.06) - 0.5) * 1.5;
          n += (valueNoise(x * s2 - t * 0.05, y * s2 + t * 0.08) - 0.5) * 0.7;
          // per-dot twinkle on its own random phase
          const seed = hash01(ix + 1, iy + 1);
          n += 0.13 * Math.sin(t * (0.9 + seed * 1.8) + seed * 6.2831);

          if (pointer.active) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < influence) {
              const k = 1 - dist / influence;
              n += k * k * 0.55;
            }
          }

          n = Math.max(0, Math.min(1, n * intensity * edgeWeight(x, y) * avoidWeight(x, y)));
          n = n * n * (3 - 2 * n);

          const r = n * maxR;
          if (r < 0.3) continue;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (tMs: number) => {
      if (!running) return;
      draw(tMs);
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduce) draw(0);
    // the copy reflows once the webfont lands — measure again when it does
    document.fonts?.ready.then(() => {
      measureAvoid();
      if (reduce) draw(0);
    });

    // the field breathes only while it is actually on screen
    const io = new IntersectionObserver(([entry]) => {
      if (reduce) return;
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    // the canvas ignores the pointer (links live above it); the section feels it
    const host = canvas.parentElement ?? canvas;
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    ro.observe(canvas);
    if (!reduce) {
      host.addEventListener("pointermove", onPointer);
      host.addEventListener("pointerleave", onLeave);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [gap, speed, fade, intensity]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
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

const QUEUE: [string, string][] = [
  ["Devon Ashcroft", "XR · right clavicle"],
  ["Sofia Marchetti", "MRI · cervical spine"],
  ["Beatrice Kowalczyk", "XR · left hip"],
  ["Layla Ibrahim", "ARK · thyroid"],
  ["Marcus Webb", "MRI · brain w/wo"],
  ["Erik Lindqvist", "MRI · right knee"],
  ["Amara Diallo", "CT · right ankle"],
];

/**
 * The inbox, breathing: the front desk works the top referral every few
 * seconds — it books, strikes through, slides out, and the queue moves up.
 * The point of the product is that this pile clears itself in one place.
 */
export function InboxFeed() {
  const root = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (reducedMotion()) return;
    const host = root.current;
    if (!host) return;
    let alive = true;
    let onScreen = false;
    let t1: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!alive) return;
      if (onScreen) {
        setLeaving(true);
        t1 = setTimeout(() => {
          setOffset((o) => (o + 1) % QUEUE.length);
          setLeaving(false);
        }, 650);
      }
      t2 = setTimeout(tick, 2600);
    };
    let t2 = setTimeout(tick, 1600);

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
    });
    io.observe(host);
    return () => {
      alive = false;
      clearTimeout(t1);
      clearTimeout(t2);
      io.disconnect();
    };
  }, []);

  const rows = [0, 1, 2, 3].map((i) => QUEUE[(offset + i) % QUEUE.length]);

  return (
    <div ref={root}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">
        needs action · the queue works itself
      </p>
      <div className="mt-5">
        {rows.map(([name, study], i) => {
          const gone = i === 0 && leaving;
          return (
            <div
              key={name}
              className="row-in flex items-baseline justify-between gap-4 py-3.5"
              style={{
                borderTop: `1px solid ${LINE}`,
                transition: "opacity 0.6s ease, transform 0.6s ease",
                opacity: gone ? 0 : 1,
                transform: gone ? "translateX(-16px)" : "none",
              }}
            >
              <span
                className="truncate text-[13px] font-medium"
                style={{ textDecoration: gone ? "line-through" : "none" }}
              >
                {name}
              </span>
              <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">
                {study}
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${
                  gone ? "bg-black text-white" : ""
                }`}
                style={gone ? undefined : { boxShadow: `inset 0 0 0 1px ${INK}` }}
              >
                {gone ? "scheduled" : i < 2 ? "stuck 8d" : "new"}
              </span>
            </div>
          );
        })}
        <div style={{ borderTop: `1px solid ${LINE}` }} />
      </div>
    </div>
  );
}

const SLOTS = [
  "8:00",
  "8:30",
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "1:00",
  "1:30",
];
const TAKEN = new Set([0, 3, 4, 7, 9]);

/**
 * The booking, playable: real open slots, the taken ones hatched out. Pick
 * one — it books, the confirmation line appears, and a moment later the
 * toy resets for the next reader.
 */
export function SlotPicker() {
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (picked === null) return;
    const t = setTimeout(() => setPicked(null), 2600);
    return () => clearTimeout(t);
  }, [picked]);

  return (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">
        jul 26 — pick a slot
      </p>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {SLOTS.map((t, i) => {
          const taken = TAKEN.has(i);
          const isPicked = picked === i;
          return (
            <button
              key={t}
              type="button"
              disabled={taken}
              onClick={() => setPicked(i)}
              aria-label={taken ? `${t} — taken` : `Book ${t}`}
              className={`rounded-[0.5rem] py-2.5 font-mono text-[10px] font-bold tracking-[0.12em] transition-colors duration-200 ${
                isPicked
                  ? "border-2 border-black bg-black text-white"
                  : taken
                    ? "cursor-not-allowed border opacity-45"
                    : "border-2 border-black hover:bg-black hover:text-white"
              }`}
              style={{
                borderColor: taken && !isPicked ? LINE : undefined,
                backgroundImage:
                  taken && !isPicked
                    ? `repeating-linear-gradient(45deg, ${LINE} 0 3px, transparent 3px 8px)`
                    : undefined,
              }}
            >
              {t}
            </button>
          );
        })}
      </div>
      <p
        className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity duration-300"
        style={{ opacity: picked !== null ? 1 : 0.45 }}
      >
        {picked !== null
          ? `booked — ${SLOTS[picked]} · the referrer sees it too`
          : "hatched = taken · the rest are real"}
      </p>
    </div>
  );
}

const WEEKS = [5, 7, 6, 9, 8, 11, 10, 12, 11, 14, 13, 16];

/** Twelve weeks of referrals, drawing themselves tallest-last. */
export function NumbersSpark() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from("[data-spark-bar]", {
        scaleY: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">
        referrals a week — twelve weeks
      </p>
      <div className="mt-6 flex h-28 items-end gap-[6px] md:h-32">
        {WEEKS.map((v, i) => (
          <div
            key={i}
            data-spark-bar
            className="flex-1 origin-bottom rounded-t-[3px]"
            style={{ height: `${(v / 16) * 100}%`, backgroundColor: INK, opacity: 0.35 + (i / WEEKS.length) * 0.65 }}
          />
        ))}
      </div>
      <div className="mt-3" style={{ borderTop: `1px solid ${LINE}` }} />
      <p className="mt-4 max-w-[36ch] font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.2em] opacity-60">
        lead time, no-shows, referrer movement — flagged weekly, before they stall
      </p>
    </div>
  );
}

const LOG: [string, string][] = [
  ["Submitted", "08:12 · dr e. brooks"],
  ["In triage", "08:31 · front desk"],
  ["Scheduled", "09:02 · jul 26, 12:30"],
  ["Imaging done", "jul 26 · 2 views"],
  ["Report sent", "jul 27 · signed pdf"],
];

/**
 * One order's life as a vertical rail — the sibling of the five-state rail
 * above, drawn station by station the first time it is seen.
 */
export function OrderLog() {
  const root = useRef<HTMLDivElement>(null);

  // the rail runs exactly from the first dot's centre to the last dot's —
  // measured, not guessed, so it never pokes past a station
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const wrap = host.querySelector<HTMLElement>("[data-log-wrap]");
    if (!wrap) return;
    const layout = () => {
      const dots = wrap.querySelectorAll<HTMLElement>("[data-log-dot]");
      if (dots.length < 2) return;
      const base = wrap.getBoundingClientRect();
      const first = dots[0].getBoundingClientRect();
      const last = dots[dots.length - 1].getBoundingClientRect();
      const top = first.top - base.top + first.height / 2;
      const height = last.top - base.top + last.height / 2 - top;
      wrap.querySelectorAll<HTMLElement>("[data-log-line]").forEach((el) => {
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
      gsap.fromTo(
        "[data-log-rail]",
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 2,
          ease: "power2.inOut",
          scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
        },
      );
      gsap.from("[data-log-entry]", {
        x: 14,
        autoAlpha: 0,
        duration: 0.55,
        stagger: 0.38,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">
        one order&rsquo;s life · xray, right clavicle
      </p>
      <div data-log-wrap className="relative mt-7 pl-7">
        {/* the rail and its drawn-in ink */}
        <span
          data-log-line
          aria-hidden
          className="absolute left-[4px] w-[2px]"
          style={{ backgroundColor: LINE }}
        />
        <span
          data-log-line
          data-log-rail
          aria-hidden
          className="absolute left-[4px] w-[2px] origin-top"
          style={{ backgroundColor: INK }}
        />
        <ol className="flex flex-col gap-6">
          {LOG.map(([event, meta], i) => (
            <li key={event} data-log-entry className="relative">
              <span
                data-log-dot
                aria-hidden
                className="absolute -left-7 top-[2px] z-[1] size-[10px] rounded-full"
                style={
                  i === LOG.length - 1
                    ? { border: `2px solid ${INK}`, backgroundColor: PAPER }
                    : { backgroundColor: INK }
                }
              />
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
                {event}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.1em] opacity-50">{meta}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/**
 * The gate, playable: drag the lab value down and watch the wizard refuse.
 * Under 30 the block goes red and the booking cannot proceed — the same
 * hard stop the product enforces, in one slider.
 */
export function EgfrToy() {
  const [v, setV] = useState(58);
  const blocked = v < 30;

  return (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">
        the gate, playable — drag the result
      </p>
      <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
        most recent eGFR (mL/min/1.73m²)
      </p>
      <p
        className="mt-1 text-[56px] font-extrabold leading-none tabular-nums transition-colors duration-200 md:text-[72px]"
        style={{ color: blocked ? RED : INK }}
      >
        {v}
      </p>
      <input
        type="range"
        min={12}
        max={90}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        aria-label="Most recent eGFR"
        className="mt-6 w-full"
        style={{ accentColor: blocked ? RED : INK }}
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] font-bold tracking-[0.14em] opacity-40">
        <span>12</span>
        <span>30 — the line</span>
        <span>90</span>
      </div>
      <div
        className="mt-6 rounded-[0.7rem] px-4 py-3.5 text-[13px] font-medium leading-relaxed transition-colors duration-200"
        style={
          blocked
            ? { color: RED, backgroundColor: "rgba(180,35,24,0.07)", boxShadow: `inset 0 0 0 1px ${RED}55` }
            : { opacity: 0.7, boxShadow: `inset 0 0 0 1px ${LINE}` }
        }
      >
        {blocked
          ? "IV contrast is contraindicated below 30 — order the study without contrast, or call the clinic. Next stays off."
          : "Contrast cleared — the booking may proceed."}
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
