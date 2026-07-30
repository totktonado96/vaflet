"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Seamless navigation: ink floods out of the click point, covers the viewport
 * while the route swaps underneath, then simply dissolves off the new page —
 * no splash screen, no curtain. Links stay plain <a href> for crawlers and
 * no-JS — this only intercepts.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const overlayRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const coverTl = useRef<gsap.core.Timeline | null>(null);
  const covering = useRef(false);
  // Whether router.push already fired for the current cover — the reliable
  // "was this navigation requested" signal (coverTl.isActive() lies while
  // decorative tweens trail behind the push).
  const pushed = useRef(false);
  const failsafe = useRef(0);

  const finish = useCallback(() => {
    covering.current = false;
    window.__lenis?.start();
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(circleRef.current, { autoAlpha: 0, scale: 0 });
  }, []);

  const reveal = useCallback(() => {
    window.clearTimeout(failsafe.current);
    const overlay = overlayRef.current;
    if (!overlay) return;

    const tl = coverTl.current;
    coverTl.current = null;
    // The page is interactive again the moment the dissolve starts — clicks
    // made while it fades must start a fresh transition, not be eaten.
    covering.current = false;
    // A stale dissolve's onComplete must never fire after a newer one starts.
    gsap.killTweensOf(overlay);

    // Cancelled mid-flood (Back during the cover): let go quickly.
    const cancelled = tl ? tl.isActive() && !pushed.current : false;
    tl?.kill();

    gsap.set(overlay, { pointerEvents: "none" });
    gsap.to(overlay, {
      autoAlpha: 0,
      duration: cancelled ? 0.25 : 0.4,
      ease: "power1.out",
      delay: cancelled ? 0 : 0.08,
      onComplete: finish,
    });
  }, [finish]);

  // The new route has committed under the cover — dissolve it.
  useEffect(() => {
    window.clearTimeout(failsafe.current);
    if (covering.current) reveal();
  }, [pathname, reveal]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!(e.target instanceof Element)) return;
      const a = e.target.closest<HTMLAnchorElement>("a[href]");
      if (!a || !(a instanceof HTMLAnchorElement)) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;

      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;

      if (url.pathname === location.pathname) {
        // Same route, different query: swap without theatre — usePathname
        // wouldn't change, so the cover would never dissolve.
        if (url.search !== location.search) {
          e.preventDefault();
          if (!covering.current) router.push(url.pathname + url.search + url.hash);
          return;
        }

        if (covering.current) {
          e.preventDefault();
          return;
        }

        let id = "";
        if (url.hash) {
          try {
            id = decodeURIComponent(url.hash.slice(1));
          } catch {
            id = url.hash.slice(1);
          }
        }
        const target = id ? document.getElementById(id) : null;
        // "#top" scrolls home even without an element carrying the id.
        if (id && !target && id !== "top") return;

        e.preventDefault();
        const lenis = window.__lenis;
        if (lenis) lenis.scrollTo(target ?? 0);
        else if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);
        // deep-linkable sections update the URL; utility scrolls ("#top",
        // bare "/") never leave a hash behind — and clean up a stale one
        if (url.hash && target && id !== "top") {
          history.pushState(null, "", url.hash);
        } else if (location.hash) {
          history.replaceState(null, "", url.pathname + url.search);
        }
        return;
      }

      e.preventDefault();
      if (covering.current) return;

      const href = url.pathname + url.search + url.hash;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }

      covering.current = true;
      pushed.current = false;
      window.__lenis?.stop();
      const overlay = overlayRef.current!;
      const circle = circleRef.current!;
      // A still-dissolving cover from the previous navigation yields the stage.
      gsap.killTweensOf(overlay);
      gsap.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });

      // Armed only once the push actually ran (a hidden tab freezes the
      // GSAP ticker, not this wall-clock timer). If the route never
      // resolves, give the page back.
      const push = () => {
        pushed.current = true;
        router.push(href);
        failsafe.current = window.setTimeout(reveal, 12000);
      };

      if (a.dataset.transition === "expand") {
        // The clicked circle itself becomes the next page. If it is also a
        // gravity well, the starfield first collapses into it (0.7s ramp,
        // kept in sync with Starfield) and the expansion follows.
        const collapse = a.hasAttribute("data-gravity-well");
        if (collapse) window.dispatchEvent(new Event("vaflet:singularity"));
        const wait = collapse ? 0.7 : 0;
        const r = a.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const startR = Math.max(1, r.width / 2);
        const endR =
          Math.hypot(
            Math.max(cx, window.innerWidth - cx),
            Math.max(cy, window.innerHeight - cy),
          ) + 2;
        gsap.set(circle, {
          autoAlpha: 0,
          scale: 1,
          backgroundColor: "#fff",
          left: cx - startR,
          top: cy - startR,
          width: startR * 2,
          height: startR * 2,
        });
        coverTl.current = gsap
          .timeline()
          .to(circle, { autoAlpha: 1, duration: 0.15, ease: "none" }, wait)
          .to(
            circle,
            { scale: endR / startR, duration: 0.8, ease: "power3.inOut" },
            wait,
          )
          .add(push);
        return;
      }

      // Ink flood from the pointer; from the link's centre on keyboard.
      let x = e.clientX;
      let y = e.clientY;
      if (e.detail === 0 || (x === 0 && y === 0)) {
        const r = a.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
      const radius =
        Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        ) + 2;

      gsap.set(circle, {
        autoAlpha: 1,
        scale: 0,
        backgroundColor: "#000",
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
      });

      coverTl.current = gsap
        .timeline()
        .to(circle, { scale: 1, duration: 0.65, ease: "power3.inOut" })
        .add(push);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router, reveal]);

  // Warm up destinations so the swap under the cover is instant.
  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const a = e.target.closest<HTMLAnchorElement>("a[href]");
      if (!a || !(a instanceof HTMLAnchorElement)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return;
      router.prefetch(url.pathname);
    };
    document.addEventListener("mouseover", onOver);
    return () => document.removeEventListener("mouseover", onOver);
  }, [router]);

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80]"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      <div
        ref={circleRef}
        className="absolute rounded-full bg-black"
        style={{ transform: "scale(0)" }}
      />
    </div>
  );
}
