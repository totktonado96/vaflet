"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Seamless navigation: ink floods out of the click point, covers the viewport
 * while the route swaps underneath, then the curtain lifts off the new page.
 * Links stay plain <a href> for crawlers and no-JS — this only intercepts.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const overlayRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const coverTl = useRef<gsap.core.Timeline | null>(null);
  const covering = useRef(false);
  const failsafe = useRef(0);

  const finish = useCallback(() => {
    covering.current = false;
    window.__lenis?.start();
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(curtainRef.current, { autoAlpha: 0, yPercent: 0 });
    gsap.set(circleRef.current, { autoAlpha: 0, scale: 0 });
    gsap.set(markRef.current, { autoAlpha: 0 });
  }, []);

  const reveal = useCallback(() => {
    window.clearTimeout(failsafe.current);
    const overlay = overlayRef.current;
    const curtain = curtainRef.current;
    if (!overlay || !curtain) return;

    const tl = coverTl.current;
    coverTl.current = null;
    // A stale wipe's onComplete must never fire after a newer one starts.
    gsap.killTweensOf([curtain, overlay]);

    // Cancelled mid-flood (Back during the cover): dissolve, don't snap black.
    if (tl && tl.isActive()) {
      tl.kill();
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.25,
        ease: "power1.out",
        onComplete: finish,
      });
      return;
    }
    tl?.kill();

    // Let the new page take clicks as it emerges from under the curtain.
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: "none" });
    gsap.set(circleRef.current, { autoAlpha: 0 });
    gsap.set(curtain, { autoAlpha: 1 });
    gsap.to(curtain, {
      yPercent: -100,
      duration: 0.85,
      ease: "power4.inOut",
      delay: 0.12,
      onComplete: finish,
    });
  }, [finish]);

  // The new route has committed under the curtain — lift it.
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
        // wouldn't change, so the curtain would never lift.
        if (url.search !== location.search) {
          e.preventDefault();
          if (!covering.current) router.push(url.pathname + url.search + url.hash);
          return;
        }

        if (covering.current) {
          e.preventDefault();
          return;
        }
        // Pure "#hash" hrefs belong to Lenis ({ anchors: true }).
        if ((a.getAttribute("href") ?? "").startsWith("#")) return;

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
        if (url.hash) history.pushState(null, "", url.hash);
        return;
      }

      e.preventDefault();
      if (covering.current) return;

      const href = url.pathname + url.search + url.hash;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }

      // Flood from the pointer; from the link's centre on keyboard activation.
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

      covering.current = true;
      window.__lenis?.stop();
      const overlay = overlayRef.current!;
      const circle = circleRef.current!;
      gsap.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(circle, {
        autoAlpha: 1,
        scale: 0,
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
      });

      coverTl.current = gsap
        .timeline()
        .to(circle, { scale: 1, duration: 0.65, ease: "power3.inOut" })
        .set(curtainRef.current, { autoAlpha: 1 })
        .set(circle, { autoAlpha: 0 })
        .add(() => {
          router.push(href);
          // Armed only once the push actually ran (a hidden tab freezes the
          // GSAP ticker, not this wall-clock timer). If the route never
          // resolves, give the page back.
          failsafe.current = window.setTimeout(reveal, 12000);
        })
        .fromTo(
          markRef.current,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
        );
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router, reveal]);

  // Warm up destinations so the swap under the curtain is instant.
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
      <div
        ref={curtainRef}
        className="absolute inset-0 flex items-center justify-center bg-black"
        style={{ visibility: "hidden", opacity: 0 }}
      >
        <span
          ref={markRef}
          className="text-xs font-bold uppercase tracking-[0.3em] text-white"
          style={{ visibility: "hidden", opacity: 0 }}
        >
          Vaflet&nbsp;LLC
        </span>
      </div>
    </div>
  );
}
