"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export default function SplitReveal({
  children,
  as: Tag = "h2",
  className,
  onLoad = false,
  delay = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Animate on mount (hero) instead of on scroll */
  onLoad?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = ref.current;
      if (!el) return;
      let split: SplitText | undefined;
      let cancelled = false;
      document.fonts.ready.then(() => {
        if (cancelled || !el.isConnected) return;
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(el, { autoAlpha: 1 });
            return gsap.from(self.lines, {
              yPercent: 115,
              duration: 1,
              stagger: 0.09,
              ease: "power4.out",
              delay,
              scrollTrigger: onLoad
                ? undefined
                : { trigger: el, start: "top 85%", once: true },
            });
          },
        });
      });
      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className ? `pre-reveal ${className}` : "pre-reveal"}>
      {children}
    </Tag>
  );
}
