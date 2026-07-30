"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import MouseFollower from "mouse-follower";
import attachInkCursor from "@/lib/cursor";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    /** Live Lenis instance, absent when reduced motion is on. */
    __lenis?: Lenis;
  }
}

export default function Effects() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    lenisRef.current = lenis;
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let cursor: MouseFollower | null = null;
    let detachCursor: (() => void) | null = null;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      MouseFollower.registerGSAP(gsap);
      cursor = new MouseFollower({
        speed: 0.55,
        // labels and media are handled by lib/cursor.ts, not data attributes
        dataAttr: null,
        stateDetection: {
          "-pointer": "a, button",
          "-lg": "[data-cursor-big]",
          "-void": "[data-gravity-well]",
        },
      });
      detachCursor = attachInkCursor(cursor);
    }

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      delete window.__lenis;
      detachCursor?.();
      cursor?.destroy();
    };
  }, []);

  /**
   * Every arrival is composed, never restored: the ink cover hides the swap, so
   * landing mid-page reads as a glitch rather than as "where you left off".
   *
   * Two things restore scroll behind our back on a Back/Forward, and both have
   * to be told to let go — the browser's own restoration, and ScrollTrigger's
   * scroll memory, which re-applies the position it recorded (and resets
   * history.scrollRestoration to whatever it captured on init, so setting that
   * alone is not enough).
   *
   * `scrollRestoration` belongs to the current history entry, not to the page,
   * so every entry has to opt out as it is created — including the one a fresh
   * document lands on. Miss that one and a Back into it is restored natively,
   * a frame or two after we have already settled at the top.
   */
  const settle = useCallback(() => {
    ScrollTrigger.clearScrollMemory("manual");
    const lenis = lenisRef.current;
    const hash = window.location.hash;
    let target: HTMLElement | null = null;
    if (hash) {
      let id = hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {}
      target = document.getElementById(id);
    }
    if (!lenis) {
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
      return;
    }
    lenis.resize();
    lenis.scrollTo(target ?? 0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  }, []);

  // Back/Forward across anchors on one page never changes `pathname`, so the
  // route effect below would miss it entirely.
  useEffect(() => {
    window.addEventListener("popstate", settle);
    return () => window.removeEventListener("popstate", settle);
  }, [settle]);

  // Lenis keeps its own scroll position across client-side navigations, which
  // lands a shorter new page at its bottom. Reposition whenever the route changes.
  useEffect(() => {
    // A fresh document is already where it should be — the browser has honoured
    // the hash, and there is nothing of ours to undo.
    if (firstRun.current) {
      firstRun.current = false;
      ScrollTrigger.clearScrollMemory("manual");
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
      return;
    }
    settle();
  }, [pathname, settle]);

  // The cursor's hover states are pointer-event driven; a route swap replaces
  // the DOM under a stationary pointer, so it must be told to let go.
  useEffect(() => {
    window.dispatchEvent(new Event("vaflet:navigate"));
  }, [pathname]);

  return null;
}
