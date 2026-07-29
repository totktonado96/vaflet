"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; v: number; d: number; p: number };

/**
 * Dust rising from the bottom edge: dense and bright low down, dissolving
 * before it reaches the headline. Sizes and speeds vary to fake depth.
 */
export default function Starfield({
  density = 2600,
  className,
}: {
  /** one star per this many square pixels */
  density?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let stars: Star[] = [];

    const rand = (() => {
      let s = 11;
      return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      };
    })();

    const make = (atBottom: boolean): Star => {
      const d = rand();
      return {
        x: rand() * w,
        y: atBottom ? h + rand() * 40 : rand() * h,
        v: 0.12 + d * 0.5,
        d,
        p: rand() * Math.PI * 2,
      };
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#fff";
      const want = Math.max(200, Math.min(1100, Math.round((w * h) / density)));
      if (stars.length > want) stars.length = want;
      while (stars.length < want) stars.push(make(false));
    };

    const draw = (t: number, step: boolean) => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        if (step) {
          st.y -= st.v;
          st.x += Math.sin(t * 0.25 + st.p) * 0.12;
          if (st.y < -4) Object.assign(st, make(true));
        }
        const p = 1 - st.y / h; // 0 at the bottom edge, 1 at the top
        const fadeIn = Math.min(1, p / 0.05);
        const fadeOut = Math.max(0, 1 - Math.max(0, (p - 0.1) / 0.75));
        const alpha = fadeIn * fadeOut * (0.35 + 0.65 * st.d);
        if (alpha <= 0.02) continue;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(st.x, st.y, 0.35 + st.d * 1.05, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(0, false);
      return;
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      draw(now / 1000, true);
    };
    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none ${className ?? ""}`}
    />
  );
}
