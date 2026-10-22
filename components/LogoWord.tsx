"use client";

import { useEffect, useId, useRef, useState } from "react";
import { bindLogoLight, LIGHT_REST, logoLight } from "@/lib/logo-light";

// The wordmark: solid letters casting an engraved, hatched block shadow.
// Drawn in white so the header's difference blend inks it either way.
// Units: font-size 100, so the cap height is ~72 and the shadow ~23.
const STEPS = 16;
const LENGTH = 23;

export default function LogoWord({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const topRef = useRef<SVGUseElement>(null);
  const copiesRef = useRef<Array<SVGUseElement | null>>([]);
  const [width, setWidth] = useState(400);

  // fit the viewBox to the real text once the face has loaded
  useEffect(() => {
    let alive = true;
    const measure = () => {
      const w = topRef.current?.getBBox().width;
      if (alive && w) setWidth(Math.ceil(w + LENGTH + 8));
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const place = (a: number) => {
      const dx = Math.cos(a);
      const dy = -Math.sin(a);
      copiesRef.current.forEach((u, i) => {
        if (!u) return;
        const s = ((i + 1) / STEPS) * LENGTH;
        u.setAttribute("x", (dx * s).toFixed(2));
        u.setAttribute("y", (dy * s).toFixed(2));
      });
    };
    place(LIGHT_REST);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const unbind = bindLogoLight(svg.closest("a") ?? svg);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(svg);

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (visible) place(logoLight(now));
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      unbind();
    };
  }, []);

  const word = `w${uid}`;
  return (
    <svg
      ref={svgRef}
      viewBox={`-4 0 ${width} 110`}
      aria-hidden
      className={`block w-auto overflow-visible ${className ?? ""}`}
    >
      <defs>
        <text
          id={word}
          x="0"
          y="80"
          fontFamily="var(--font-schibsted), sans-serif"
          fontWeight="800"
          fontSize="100"
          letterSpacing="-4"
        >
          VAFLET
        </text>
        {/* hatch stays put in the page while the shadow swings under it */}
        <pattern
          id={`h${uid}`}
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="4.5" height="9" fill="#fff" />
        </pattern>
        <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x="-20" y="-20" width={width + 60} height="160">
          {Array.from({ length: STEPS }, (_, i) => (
            <use
              key={i}
              ref={(el) => {
                copiesRef.current[i] = el;
              }}
              href={`#${word}`}
              fill="#fff"
            />
          ))}
          {/* a paper gap between each letter and its own shadow */}
          <use href={`#${word}`} fill="#000" stroke="#000" strokeWidth="9" strokeLinejoin="round" />
        </mask>
      </defs>
      <rect x="-20" y="-20" width={width + 60} height="160" fill={`url(#h${uid})`} mask={`url(#m${uid})`} />
      <use ref={topRef} href={`#${word}`} fill="#fff" />
    </svg>
  );
}
