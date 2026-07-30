"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  v: number;
  d: number;
  p: number;
  gx: number;
  gy: number;
  dead?: boolean;
};

type Comet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
};

type Well = { x: number; y: number; r: number; reach: number };

/**
 * Dust rising from the bottom edge: dense and bright low down, dissolving
 * before it reaches the headline. Sizes and speeds vary to fake depth.
 *
 * Optional physics on top:
 * - `attractor`: a CSS selector for a gravity well (the TELL US circle) —
 *   nearby dust spirals in, brightens as it accelerates, and is swallowed;
 * - a "vaflet:singularity" window event collapses the WHOLE field into the
 *   well (fired by PageTransition when the circle is clicked); swallowed
 *   dust stays gone, and the field self-restores if navigation never lands;
 * - the pointer gently bends trajectories around itself;
 * - `comets`: a rare thin streak crossing the field every few seconds.
 */
export default function Starfield({
  density = 2600,
  attractor,
  comets = false,
  className,
}: {
  /** one star per this many square pixels */
  density?: number;
  /** CSS selector of the element dust should gravitate into */
  attractor?: string;
  comets?: boolean;
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
    let well: Well | null = null;
    let trail: Comet[] = [];
    let nextComet = 0;
    let mx: number | null = null;
    let my: number | null = null;
    let collapseAt: number | null = null;

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
        gx: 0,
        gy: 0,
        dead: false,
      };
    };

    const measureWell = () => {
      const el = attractor
        ? document.querySelector<HTMLElement>(attractor)
        : null;
      if (!el) {
        well = null;
        return;
      }
      const a = el.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      well = {
        x: a.left + a.width / 2 - c.left,
        y: a.top + a.height / 2 - c.top,
        r: a.width / 2,
        reach: Math.max(280, Math.min(w, h) * 0.48),
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
      measureWell();
    };

    const draw = (t: number, step: boolean) => {
      ctx.clearRect(0, 0, w, h);

      // Singularity ramp: 0 → 1 over 0.7s (in sync with PageTransition's
      // expand delay). If the page is still here 5s later, the navigation
      // never landed — bring the dust back.
      let ramp = 0;
      if (collapseAt !== null) {
        if (t - collapseAt > 5) {
          collapseAt = null;
          for (const st of stars) {
            if (st.dead) Object.assign(st, make(true));
          }
        } else {
          const k = Math.min(1, (t - collapseAt) / 0.7);
          ramp = k * k;
        }
      }

      ctx.strokeStyle = "#fff";
      ctx.lineCap = "round";

      for (const st of stars) {
        if (st.dead) continue;
        let pull = 0; // proximity to the well, 0..1

        if (step) {
          st.y -= st.v;
          st.x += Math.sin(t * 0.25 + st.p) * 0.12;

          if (well) {
            const dx = well.x - st.x;
            const dy = well.y - st.y;
            const dist = Math.hypot(dx, dy) || 1;
            const reach = ramp > 0 ? w + h : well.reach;
            if (dist < reach) {
              pull = 1 - dist / reach;
              // radial pull plus a tangential kick → slow spiral, not a
              // plunge; the collapse straightens and violently strengthens it
              const f = 0.06 * pull * pull * (1 + ramp * 18);
              const swirl = 0.45 * (1 - 0.6 * ramp);
              st.gx += (dx / dist) * f - (dy / dist) * f * swirl;
              st.gy += (dy / dist) * f + (dx / dist) * f * swirl;
            }
            // swallowed under the disc — reborn below, or gone for good
            // while the singularity is open
            if (dist < well.r * (0.55 + ramp * 0.6)) {
              if (ramp > 0) st.dead = true;
              else Object.assign(st, make(true));
              continue;
            }
          }

          // the pointer is a lesser mass: dust leans away from it
          if (mx !== null && my !== null && ramp === 0) {
            const dx = st.x - mx;
            const dy = st.y - my;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < 140) {
              const f = 0.05 * (1 - dist / 140);
              st.gx += (dx / dist) * f;
              st.gy += (dy / dist) * f;
            }
          }

          const damp = ramp > 0 ? 0.99 : 0.965;
          st.gx *= damp;
          st.gy *= damp;
          st.x += st.gx;
          st.y += st.gy;

          if (st.y < -4 || st.x < -8 || st.x > w + 8 || st.y > h + 60) {
            if (ramp > 0) st.dead = true;
            else Object.assign(st, make(true));
            continue;
          }
        } else if (well) {
          const dist = Math.hypot(well.x - st.x, well.y - st.y);
          if (dist < well.reach) pull = 1 - dist / well.reach;
        }

        const p = 1 - st.y / h; // 0 at the bottom edge, 1 at the top
        const fadeIn = Math.min(1, p / 0.05);
        const fadeOut = Math.max(0, 1 - Math.max(0, (p - 0.1) / 0.75));
        let alpha = fadeIn * fadeOut * (0.35 + 0.65 * st.d);
        const speed = Math.hypot(st.gx, st.gy);
        // dust caught by the well stays lit and heats up as it accelerates
        if (pull > 0) {
          alpha = Math.max(
            alpha,
            fadeIn * pull * (0.25 + 0.55 * st.d) + Math.min(0.3, speed * 0.35),
          );
        }
        if (alpha <= 0.02) continue;
        ctx.globalAlpha = Math.min(1, alpha);
        if (speed > 2.5) {
          // fast infall smears into a streak
          ctx.lineWidth = 0.7 + st.d * 1.4;
          ctx.beginPath();
          ctx.moveTo(st.x - st.gx * 2.4, st.y - st.gy * 2.4);
          ctx.lineTo(st.x, st.y);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(st.x, st.y, 0.35 + st.d * 1.05, 0, 6.2832);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (step && comets) {
        if (t >= nextComet && trail.length < 2 && w > 0) {
          const ltr = Math.random() < 0.5;
          const speed = Math.max(8, w * 0.01);
          const ang = ((10 + Math.random() * 22) * Math.PI) / 180;
          trail.push({
            x: ltr ? -30 : w + 30,
            y: Math.random() * h * 0.65,
            vx: (ltr ? 1 : -1) * Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            age: 0,
            // horizontal progress is speed·cos(ang) — budget for the full crossing
            life: Math.ceil((w + 60) / (Math.cos(ang) * speed)),
          });
          nextComet = t + 6 + Math.random() * 7;
        }

        for (const c of trail) {
          c.x += c.vx;
          c.y += c.vy;
          c.age++;
          const env = Math.sin(Math.PI * Math.min(1, c.age / c.life));
          if (env <= 0.02) continue;
          const tx = c.x - c.vx * 9;
          const ty = c.y - c.vy * 9;
          const g = ctx.createLinearGradient(c.x, c.y, tx, ty);
          g.addColorStop(0, `rgba(255,255,255,${0.85 * env})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.globalAlpha = env;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 1.7, 0, 6.2832);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        trail = trail.filter((c) => c.age < c.life);
      }
    };

    resize();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(0, false);
      // keep the static frame honest across resizes/orientation changes
      const roStatic = new ResizeObserver(() => {
        resize();
        draw(0, false);
      });
      roStatic.observe(canvas);
      return () => roStatic.disconnect();
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      // the well moves with layout shifts and the Magnetic hover of the
      // button itself — track it every frame (two cheap rect reads)
      if (attractor) measureWell();
      draw(now / 1000, true);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const onLeave = (e: PointerEvent) => {
      // only when the pointer actually leaves the window
      if (e.relatedTarget === null) {
        mx = null;
        my = null;
      }
    };
    const onSingularity = () => {
      if (well) collapseAt = performance.now() / 1000;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("vaflet:singularity", onSingularity);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("vaflet:singularity", onSingularity);
      ro.disconnect();
      io.disconnect();
    };
  }, [density, attractor, comets]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none ${className ?? ""}`}
    />
  );
}
