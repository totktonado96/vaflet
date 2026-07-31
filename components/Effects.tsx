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
  /** where the reader was on each route they have already visited */
  const seen = useRef(new Map<string, number>());
  const here = useRef("");
  /** set by popstate: Back/Forward is the one navigation that gets its place back */
  const popped = useRef<{ path: string; at: number } | null>(null);
  /** true between leaving a route and claiming the next one */
  const leaving = useRef(false);

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
  const settle = useCallback((restoreTo?: number) => {
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
    const to: HTMLElement | number = restoreTo ?? target ?? 0;

    const apply = () => {
      if (!lenis) {
        if (typeof to === "number") window.scrollTo(0, to);
        else to.scrollIntoView();
        return;
      }
      lenis.resize();
      lenis.scrollTo(to, { immediate: true, force: true });
    };

    apply();
    ScrollTrigger.refresh();

    // A late arrival can still shove us: images and pins settle after us and
    // change the page height, and anything that recorded the old offset gets
    // one more say. Hold the position for a few frames, and let go the instant
    // the reader touches the page — this must never fight a real scroll.
    let frames = 0;
    let held = true;
    const release = () => {
      held = false;
      for (const e of ["wheel", "touchstart", "keydown"]) {
        window.removeEventListener(e, release);
      }
    };
    for (const e of ["wheel", "touchstart", "keydown"]) {
      window.addEventListener(e, release, { once: true, passive: true });
    }
    const hold = () => {
      if (!held || frames++ > 8) return release();
      apply();
      requestAnimationFrame(hold);
    };
    requestAnimationFrame(hold);
  }, []);

  /**
   * Keep a running note of where the reader is, so Back can put them back.
   *
   * The note is frozen from the moment a navigation starts: the router scrolls
   * the incoming page to the top before our route effect gets to claim it, and
   * that zero would otherwise be filed against the page being left.
   */
  useEffect(() => {
    const record = () => seen.current.set(here.current, window.scrollY);

    const onScroll = () => {
      if (!leaving.current && here.current) record();
    };

    // Capture phase: ahead of the transition handler, while the old page is
    // still the one under the pointer.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      record();
      leaving.current = true;
      // a click that never becomes a navigation must not freeze the note
      window.setTimeout(() => (leaving.current = false), 2000);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  // A pop within one page (an anchor) never changes `pathname`, so the route
  // effect below would miss it. A pop that does change it is handed over —
  // the route effect restores the position once the new page has rendered.
  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname === here.current) {
        settle();
        return;
      }
      seen.current.set(here.current, window.scrollY);
      leaving.current = true;
      popped.current = { path: window.location.pathname, at: Date.now() };
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [settle]);

  // Lenis keeps its own scroll position across client-side navigations, which
  // lands a shorter new page at its bottom. Reposition whenever the route changes.
  useEffect(() => {
    // A fresh document is already where it should be — the browser has honoured
    // the hash, and there is nothing of ours to undo.
    if (firstRun.current) {
      firstRun.current = false;
      here.current = pathname;
      ScrollTrigger.clearScrollMemory("manual");
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
      return;
    }

    // Back and Forward hand the reader back to the spot they left; every other
    // arrival is composed from the top. The stamp guards against a stale flag
    // from a pop that never produced this render.
    const pop = popped.current;
    popped.current = null;
    const restored =
      pop && pop.path === pathname && Date.now() - pop.at < 2000
        ? seen.current.get(pathname)
        : undefined;

    // Claim the new route before settling: the scroll that settling causes
    // must be recorded against the page we are arriving at, not the one we
    // just left — otherwise leaving a page overwrites its remembered spot
    // with the zero we scroll it to on the way out.
    here.current = pathname;
    leaving.current = false;
    settle(restored);
  }, [pathname, settle]);

  // The cursor's hover states are pointer-event driven; a route swap replaces
  // the DOM under a stationary pointer, so it must be told to let go.
  useEffect(() => {
    window.dispatchEvent(new Event("vaflet:navigate"));
  }, [pathname]);

  return null;
}
