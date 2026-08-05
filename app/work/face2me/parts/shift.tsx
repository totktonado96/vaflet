"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * A live counter reading time on shift, from an ISO date. Server and the
 * first client paint can't agree on "now" — so both render the same unlit
 * placeholder, and the clock only starts once an effect confirms we're
 * actually in the browser, safely past hydration.
 */
export function ShiftClock({ since }: { since: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const host = root.current;
    if (!host) return;

    const tick = () => setNow(Date.now());

    // reduced motion: one accurate read, then it holds — no ticking
    if (reducedMotion()) {
      tick();
      return;
    }

    let id: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (id) return;
      tick();
      id = setInterval(tick, 1000);
    };
    const stop = () => {
      clearInterval(id);
      id = undefined;
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    io.observe(host);

    return () => {
      stop();
      io.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(root.current, {
        y: 20,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  const startMs = new Date(since).getTime();
  const validStart = Number.isNaN(startMs) ? null : startMs;
  const elapsed = now === null || validStart === null ? null : Math.max(0, now - validStart);
  const days = elapsed === null ? null : Math.floor(elapsed / 86_400_000);
  const hh = elapsed === null ? null : pad(Math.floor((elapsed / 3_600_000) % 24));
  const mm = elapsed === null ? null : pad(Math.floor((elapsed / 60_000) % 60));
  const ss = elapsed === null ? null : pad(Math.floor((elapsed / 1_000) % 60));

  return (
    <div ref={root} className="flex items-center gap-3.5">
      <span
        aria-hidden
        className="size-2.5 animate-pulse rounded-full bg-[color:var(--f2m-accent)]"
      />
      <div>
        <p className="text-xs font-medium text-[color:var(--f2m-muted)]">
          On duty — no breaks so far
        </p>
        <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-[color:var(--f2m-ink)] md:text-3xl">
          {days === null ? "—d --:--:--" : `${days}d ${hh}:${mm}:${ss}`}
        </p>
      </div>
    </div>
  );
}
