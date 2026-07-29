"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import MouseFollower from "mouse-follower";

gsap.registerPlugin(ScrollTrigger);

export default function Effects() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let cursor: MouseFollower | null = null;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      MouseFollower.registerGSAP(gsap);
      cursor = new MouseFollower({
        speed: 0.55,
        stateDetection: {
          "-pointer": "a, button",
          "-lg": "[data-cursor-big]",
        },
      });
    }

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      cursor?.destroy();
    };
  }, []);

  // Lenis keeps its own scroll position across client-side navigations, which
  // lands a shorter new page at its bottom. Reposition whenever the route changes.
  useEffect(() => {
    const lenis = lenisRef.current;
    const hash = window.location.hash;

    if (!lenis) {
      if (!hash) window.scrollTo(0, 0);
      return;
    }

    lenis.resize();
    const target = hash ? document.querySelector<HTMLElement>(hash) : null;
    lenis.scrollTo(target ?? 0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
