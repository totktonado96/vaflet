"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * A live counter reading time on shift, from an ISO date. Server and the
 * first client paint can't agree on "now" — so both render the same unlit
 * placeholder, and the clock only starts once an effect confirms we're
 * actually in the browser, safely past hydration.
 */
export function ShiftClock({ since }: { since: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const host = root.current;
    if (!host) return;

    const tick = () => setNow(Date.now());

    // reduced motion: one accurate read, then it holds — no ticking
    if (reducedMotion()) {
      tick();
      return;
    }

    let id: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (id) return;
      tick();
      id = setInterval(tick, 1000);
    };
    const stop = () => {
      clearInterval(id);
      id = undefined;
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    io.observe(host);

    return () => {
      stop();
      io.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(root.current, {
        y: 20,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  const startMs = new Date(since).getTime();
  const validStart = Number.isNaN(startMs) ? null : startMs;
  const elapsed = now === null || validStart === null ? null : Math.max(0, now - validStart);
  const days = elapsed === null ? null : Math.floor(elapsed / 86_400_000);
  const hh = elapsed === null ? null : pad(Math.floor((elapsed / 3_600_000) % 24));
  const mm = elapsed === null ? null : pad(Math.floor((elapsed / 60_000) % 60));
  const ss = elapsed === null ? null : pad(Math.floor((elapsed / 1_000) % 60));

  return (
    <div ref={root}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">
        Time card — no clock out
      </p>
      <p className="display-3 mt-3 font-extrabold uppercase leading-[1.05] tabular-nums">
        On shift for {days === null ? "—" : `${days} day${days === 1 ? "" : "s"}`},{" "}
        {hh === null ? "--:--:--" : `${hh}:${mm}:${ss}`}. No breaks.
      </p>
    </div>
  );
}

/* Roughly thirty, each in its own script — the ones a lobby in this country
   actually needs, not a stock list. */
const ROW_A = [
  "English",
  "Español",
  "中文",
  "Tiếng Việt",
  "한국어",
  "العربية",
  "Русский",
  "Kreyòl Ayisyen",
  "Français",
  "Português",
  "Tagalog",
  "فارسی",
  "हिन्दी",
  "Polski",
  "اردو",
  "ไทย",
];

const ROW_B = [
  "Deutsch",
  "Italiano",
  "Ελληνικά",
  "Українська",
  "עברית",
  "বাংলা",
  "ਪੰਜਾਬੀ",
  "Bahasa Indonesia",
  "Bahasa Melayu",
  "Kiswahili",
  "Nederlands",
  "Türkçe",
  "Română",
  "Čeština",
  "Af-Soomaali",
  "日本語",
];

function DriftRow({
  words,
  reverse,
  seconds,
  paused,
  textClass,
  gapClass,
}: {
  words: string[];
  reverse: boolean;
  seconds: number;
  paused: boolean;
  textClass: string;
  gapClass: string;
}) {
  return (
    <div className="relative flex overflow-hidden">
      {/* rendered twice so the loop never shows a seam, same rig as PhoneMarquee */}
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className="phone-marquee flex shrink-0 items-center"
          style={{
            animationDuration: `${seconds}s`,
            animationDirection: reverse ? "reverse" : "normal",
            // inline: wins over the stylesheet outright, no cascade guessing
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {words.map((w, i) => (
            <span key={`${w}-${i}`} className={`inline-flex shrink-0 items-center whitespace-nowrap ${textClass}`}>
              <span dir="auto">{w}</span>
              <span aria-hidden className={`opacity-30 ${gapClass}`}>
                ·
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Two rows of language names, drifting opposite ways, forever — the
 * PhoneMarquee rig (double-rendered track, CSS keyframes) wearing type
 * instead of screens. Reduced motion freezes both rows in place; the CSS
 * that drives the loop already carries that query, so there is nothing
 * extra to branch on here.
 */
export function LanguageDrift() {
  const [paused, setPaused] = useState(false);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div aria-hidden="true" className="flex flex-col gap-2 md:gap-3">
        <DriftRow
          words={ROW_A}
          reverse={false}
          seconds={46}
          paused={paused}
          textClass="text-[1.8rem] font-extrabold uppercase leading-none sm:text-[2.4rem] md:text-[3.4rem]"
          gapClass="mx-6 md:mx-10"
        />
        <DriftRow
          words={ROW_B}
          reverse
          seconds={34}
          paused={paused}
          textClass="text-[1rem] font-light uppercase leading-none opacity-55 sm:text-[1.2rem] md:text-[1.5rem]"
          gapClass="mx-4 md:mx-6"
        />
      </div>
      <p className="sr-only">
        Speaks roughly thirty languages, native script, no subtitles — English, Español, 中文,
        Tiếng Việt, 한국어, العربية, Русский, हिन्दी, Português and Polski among them.
      </p>
    </div>
  );
}

/** window event name for the InkField morph contract — wire it as
 *  {@code <InkField morphEvent={FALLBACK_MORPH_EVENT} .../>} */
export const FALLBACK_MORPH_EVENT = "vaflet:face2me-fallback";

// InkField pattern types (see components/InkField.tsx): 3 is two interfering
// wave sets — reads as signal, as network. 4 is a crosshatch grid — reads as
// contained, as a board with its own answers.
const CLOUD_PATTERN = 3;
const LOCAL_PATTERN = 4;

/**
 * The physical switch: CLOUD on the left, LOCAL on the right, a knob that
 * actually travels between them. One click moves the knob, swaps the
 * caption, and tells the ink field which way to boil.
 */
export function FallbackToggle() {
  const root = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const [isLocal, setIsLocal] = useState(false);

  // contextSafe: the tween fires from a click handler, outside any mount-time
  // timeline, so it needs its own safe entry into the GSAP context.
  const { contextSafe } = useGSAP({ scope: root });

  const flip = contextSafe(() => {
    const next = !isLocal;
    setIsLocal(next);

    const track = trackRef.current;
    const knob = knobRef.current;
    if (track && knob) {
      // measured, not assumed — the track and knob both grow at md:
      const travel = track.clientWidth - knob.offsetWidth - 8;
      if (reducedMotion()) {
        gsap.set(knob, { x: next ? travel : 0 });
      } else {
        gsap.to(knob, { x: next ? travel : 0, duration: 0.5, ease: "back.out(2.2)" });
      }
    }

    window.dispatchEvent(
      new CustomEvent(FALLBACK_MORPH_EVENT, {
        detail: next ? LOCAL_PATTERN : CLOUD_PATTERN,
      }),
    );
  });

  return (
    <div ref={root}>
      <button
        type="button"
        onClick={flip}
        aria-pressed={isLocal}
        aria-label="Switch the answering model between cloud and local"
        data-cursor-text="Flip"
        className="inline-flex items-center gap-4 rounded-full md:gap-5"
      >
        <span
          className={`font-mono text-[11px] font-bold uppercase tracking-[0.25em] transition-opacity duration-300 ${
            isLocal ? "opacity-35" : "opacity-100"
          }`}
        >
          Cloud
        </span>

        <span
          ref={trackRef}
          className="relative inline-block h-9 w-16 shrink-0 rounded-full border-2 border-black bg-white md:h-10 md:w-[4.5rem]"
        >
          <span
            ref={knobRef}
            aria-hidden
            className="absolute left-1 top-1 size-6 rounded-full bg-black md:size-7"
          />
        </span>

        <span
          className={`font-mono text-[11px] font-bold uppercase tracking-[0.25em] transition-opacity duration-300 ${
            isLocal ? "opacity-100" : "opacity-35"
          }`}
        >
          Local
        </span>
      </button>

      <p className="mt-3 font-mono text-[12px] font-medium tracking-[0.01em] opacity-70">
        {isLocal
          ? "local model — slower, still answering"
          : "cloud model — answering from the internet"}
      </p>
    </div>
  );
}
