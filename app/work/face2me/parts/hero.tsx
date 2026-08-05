"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";

/**
 * The walk-up. The page opens in the studio's black, and far away in it
 * stands the kiosk with its back turned — the wordmark on the back cover is
 * the only readable thing in the dark. Scrolling is walking: the totem
 * comes to meet you and turns on its heel, and once it faces you the screen
 * wakes the way the door downstairs does — the receptionist's face gathers
 * out of thrown halftone dots. Then it stands still, filling the frame.
 *
 * No words anywhere: the machine is the whole hero. The only text is a
 * screen-reader h1, because the page still needs a name.
 *
 * The scene itself (hero-scene.tsx) arrives as its own chunk and drives
 * these refs. Under prefers-reduced-motion the runway collapses to one
 * viewport in CSS and the scene renders a single frame.
 */

const Scene = dynamic(() => import("./hero-scene"), { ssr: false });

const VOID_BG = "#060809";

const BTN =
  "group pointer-events-none flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/70 opacity-0 transition-[opacity,border-color,color] duration-500 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glHostRef = useRef<HTMLDivElement>(null);
  const rotateRef = useRef<HTMLButtonElement>(null);
  const fsRef = useRef<HTMLButtonElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative h-[420vh] motion-reduce:h-screen"
      style={{ background: VOID_BG }}
    >
      <h1 className="sr-only">Face2me — an AI receptionist in a kiosk</h1>
      <div
        ref={stageRef}
        className="sticky top-0 h-screen overflow-hidden"
        style={{ background: VOID_BG }}
      >
        <div ref={glHostRef} aria-hidden className="absolute inset-0" />
        <Scene
          sectionRef={sectionRef}
          stageRef={stageRef}
          hostRef={glHostRef}
          rotateRef={rotateRef}
          fsRef={fsRef}
        />

        {/* the kiosk's two controls — no words, they appear once it has woken */}
        <div className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-4">
          <button
            ref={rotateRef}
            type="button"
            aria-pressed="false"
            aria-label="Rotate the screen"
            data-hero-rotate
            className={BTN}
          >
            <svg
              viewBox="0 0 32 32"
              className="h-6 w-6 transition-transform duration-700 ease-out group-aria-pressed:rotate-90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="10.5" y="7.5" width="11" height="17" rx="2.5" />
              <path d="M25.5 4.5a12 12 0 0 1 4 6M6.5 27.5a12 12 0 0 1-4-6" />
            </svg>
          </button>
          <button
            ref={fsRef}
            type="button"
            aria-pressed="false"
            aria-label="Toggle fullscreen"
            data-hero-fullscreen
            className={BTN}
          >
            <svg
              viewBox="0 0 32 32"
              className="h-6 w-6 transition-transform duration-500 ease-out group-aria-pressed:scale-90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5H7a2 2 0 0 0-2 2v5M20 5h5a2 2 0 0 1 2 2v5M12 27H7a2 2 0 0 1-2-2v-5M20 27h5a2 2 0 0 0 2-2v-5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
