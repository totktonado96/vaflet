"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import ArrowNE from "@/components/ArrowNE";
import Magnetic from "@/components/Magnetic";
import { Director } from "./director";
import { CardLayer } from "./cards";

/**
 * The walk-up. The page opens in the studio's black, and far away in it
 * stands the kiosk with its back turned — the wordmark on the back cover is
 * the only readable thing in the dark. Scrolling is walking: the one floor
 * light narrows from a lost wash to a tight circle as the totem comes to
 * meet you and turns on its heel, and once it faces you the screen wakes
 * the way the door downstairs does — the receptionist's face gathers out
 * of thrown halftone dots while the floor's reflection firms up with it.
 * Then it stands still, filling the frame.
 *
 * Almost no words: a title card over the opening frame, and three deadpan
 * margin notes that keep the walk company from the empty sides of the void
 * — every one dissolved before the screen wakes, so the machine finishes
 * the hero alone. The only other text is a screen-reader h1, because the
 * page still needs a name.
 *
 * The scene itself (hero-scene.tsx) arrives as its own chunk and drives
 * these refs. Under prefers-reduced-motion the runway collapses to one
 * viewport in CSS and the scene renders a single frame.
 */

const Scene = dynamic(() => import("./hero-scene"), { ssr: false });

const VOID_BG = "#060809";

/* the two quiet toys: small, tucked in the corner */
const BTN =
  "group pointer-events-none relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 opacity-0 backdrop-blur-sm transition-[opacity,color,background-color] duration-500 hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60";

/* the bell: a labeled pill, the one thing the idle kiosk asks you to press */
const CALL_BTN =
  "group pointer-events-none relative isolate flex items-center gap-2.5 overflow-hidden rounded-full bg-[#0b1114]/90 px-6 py-3 text-sm font-bold text-white opacity-0 shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-[opacity,color,box-shadow] duration-500 hover:text-[#04140a] hover:shadow-[0_0_0_1px_rgba(11,218,81,0.6),0_12px_32px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glHostRef = useRef<HTMLDivElement>(null);
  const rotateRef = useRef<HTMLButtonElement>(null);
  const fsRef = useRef<HTMLButtonElement>(null);
  const coldRef = useRef<HTMLAnchorElement>(null);
  const walkRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<HTMLButtonElement>(null);

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
          coldRef={coldRef}
          walkRef={walkRef}
          callRef={callRef}
        />

        {/* the door to the real thing, driven from the paint loop: it holds
            over the opening frame and dissolves as the walk starts, and it is
            clickable (and tabbable) only while actually on screen. Its
            letters glide together as it arrives; on hover the studio's ink
            move runs in the product's malachite — a fill rising from the
            pill's floor, text flipping dark */}
        <a
          ref={coldRef}
          href="https://face2.me"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-text="Say hi ↗"
          className="group invisible absolute inset-x-0 top-[21%] z-10 mx-auto w-fit overflow-hidden rounded-full border border-white/25 px-7 py-3.5 text-center text-xs font-bold uppercase tracking-[0.35em] text-[#dfe7ee] opacity-0 transition-colors duration-500 hover:border-[#0bda51] hover:text-[#04140a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 md:text-sm"
        >
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[#0bda51] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
          />
          Visit face2.
          <span className="text-[#0bda51] transition-colors duration-300 group-hover:text-[#04140a]">
            me
          </span>
          <span
            aria-hidden
            className="ml-3 inline-block transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-1"
          >
            <ArrowNE />
          </span>
        </a>

        {/* margin notes on the walk — three deadpan beats in the empty sides
            of the void, each timed to what the machine is doing and each gone
            before the screen wakes. Desktop only: the phone has no empty
            sides to speak from. */}
        <div ref={walkRef} aria-hidden className="hidden md:block">
          <p
            data-from="0.07"
            data-to="0.19"
            className="pointer-events-none absolute left-[9%] top-[42%] z-10 max-w-[24vw] text-left text-lg font-bold uppercase leading-[2.1] tracking-[0.3em] text-white/70 opacity-0"
          >
            An AI receptionist,
            <br />
            in a kiosk.
          </p>
          <p
            data-from="0.21"
            data-to="0.33"
            className="pointer-events-none absolute right-[9%] top-[42%] z-10 max-w-[24vw] text-right text-lg font-bold uppercase leading-[2.1] tracking-[0.3em] text-white/70 opacity-0"
          >
            It doesn&apos;t know
            <br />
            you&apos;re here yet.
          </p>
          <p
            data-from="0.38"
            data-to="0.51"
            className="pointer-events-none absolute left-[9%] top-[42%] z-10 max-w-[24vw] text-left text-lg font-bold uppercase leading-[2.1] tracking-[0.3em] text-white/70 opacity-0"
          >
            Now it does.
          </p>
        </div>

        {/* the kiosk's three controls — no words, they appear once it has
            woken; they lean toward the hand like every other control on the
            site, and the idle bell quietly beckons */}
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            [data-hero-call][data-beckon="1"]::after {
              content: "";
              position: absolute;
              inset: -2px;
              border-radius: 9999px;
              border: 1px solid rgba(11, 218, 81, 0.55);
              animation: f2m-beckon 2.6s ease-out infinite;
            }
          }
          @keyframes f2m-beckon {
            0% { transform: scale(1); opacity: 0.9; }
            70% { transform: scale(1.6); opacity: 0; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
        <div className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center">
          <Magnetic strength={0.3}>
          <button
            ref={callRef}
            type="button"
            aria-label="Start the kiosk demo"
            data-hero-call
            className={CALL_BTN}
          >
            {/* the studio's rising-fill move, in the product's malachite */}
            <span
              aria-hidden
              className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[#0bda51] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
            />
            <svg
              viewBox="0 0 32 32"
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* a headset outline: the desk, not a phone booth */}
              <path d="M6 18v-3a10 10 0 0 1 20 0v3" />
              <rect x="4" y="17" width="5" height="7" rx="2" />
              <rect x="23" y="17" width="5" height="7" rx="2" />
              <path d="M26 24v1.5a3 3 0 0 1-3 3h-4" />
            </svg>
            Say hi
          </button>
          </Magnetic>
        </div>

        {/* secondary toys, off in the corner — the bell is the only star */}
        <div className="absolute bottom-8 left-8 z-10 flex items-center gap-3">
          <Magnetic strength={0.35}>
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
              className="h-4.5 w-4.5 transition-transform duration-700 ease-out group-aria-pressed:rotate-90"
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
          </Magnetic>
          <Magnetic strength={0.35}>
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
              className="h-4.5 w-4.5 transition-transform duration-500 ease-out group-aria-pressed:scale-90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5H7a2 2 0 0 0-2 2v5M20 5h5a2 2 0 0 1 2 2v5M12 27H7a2 2 0 0 1-2-2v-5M20 27h5a2 2 0 0 0 2-2v-5" />
            </svg>
          </button>
          </Magnetic>
        </div>

        <Director callBtnRef={callRef} />
        <CardLayer />
      </div>
    </section>
  );
}
