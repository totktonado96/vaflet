"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Masked single-line reveal matching SplitReveal's motion, for content that
 * must not go through SplitText's innerHTML round-trip (live canvases etc.).
 */
export default function LineReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const wrap = outer.current;
      const el = inner.current;
      if (!wrap || !el) return;
      let cancelled = false;
      document.fonts.ready.then(() => {
        if (cancelled || !el.isConnected) return;
        gsap.set(wrap, { autoAlpha: 1 });
        gsap.from(el, {
          yPercent: 115,
          duration: 1,
          ease: "power4.out",
          delay,
        });
      });
      return () => {
        cancelled = true;
      };
    },
    { scope: outer },
  );

  return (
    <div ref={outer} className={`pre-reveal overflow-clip ${className ?? ""}`}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
