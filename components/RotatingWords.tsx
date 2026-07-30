"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Typewriter line: the word types itself out glyph by glyph with a slightly
 * human rhythm, sits under a blinking block caret, then gets backspaced and
 * replaced by the next one. The first word is visible without JS; the rest
 * only feed the loop.
 */
export default function RotatingWords({
  words,
  delay = 0,
  hold = 2.2,
  className,
}: {
  words: string[];
  /** Entrance delay, matching the surrounding reveal choreography */
  delay?: number;
  /** Seconds a finished word sits (caret blinking) before the backspace */
  hold?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
      if (!items.length) return;
      const charsOf = (word: HTMLElement) =>
        Array.from(word.querySelectorAll<HTMLElement>("[data-char]"));
      const caretOf = (word: HTMLElement) =>
        word.querySelector<HTMLElement>("[data-caret]");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }

      let cancelled = false;
      let index = 0;
      let tl: gsap.core.Timeline | null = null;
      let blink: gsap.core.Tween | null = null;

      /** Keystrokes land one by one, never out of order: jitter < each. */
      const typeIn = (chars: HTMLElement[]) => {
        const t = gsap.timeline();
        chars.forEach((c, i) =>
          t.set(c, { display: "inline-block" }, i * 0.062 + Math.random() * 0.05),
        );
        return t;
      };

      const backspace = (chars: HTMLElement[]) => {
        const t = gsap.timeline();
        chars.forEach((c, i) =>
          t.set(c, { display: "none" }, (chars.length - 1 - i) * 0.04),
        );
        return t;
      };

      const cycle = () => {
        if (cancelled || items.length < 2) return;
        const current = items[index];
        const caret = caretOf(current);
        index = (index + 1) % items.length;
        const next = items[index];

        // Idle: solid for a beat, then a hard terminal blink.
        blink = gsap.to(caret, {
          autoAlpha: 0,
          duration: 0.45,
          repeat: -1,
          yoyo: true,
          ease: "steps(1)",
          delay: 0.35,
        });

        tl = gsap
          .timeline({ delay: hold, onComplete: cycle })
          .add(() => {
            blink?.kill();
            gsap.set(caret, { autoAlpha: 1 });
          })
          .add(backspace(charsOf(current)))
          .add(() => {
            gsap.set(current, { autoAlpha: 0 });
            gsap.set(charsOf(next), { display: "none" });
            gsap.set(next, { autoAlpha: 1 });
          }, "+=0.22")
          .add(typeIn(charsOf(next)));
      };

      document.fonts.ready.then(() => {
        if (cancelled || !el.isConnected) return;
        const first = charsOf(items[0]);
        gsap.set(first, { display: "none" });
        gsap.set(el, { autoAlpha: 1 });
        tl = gsap
          .timeline({ delay, onComplete: cycle })
          .add(typeIn(first));
      });

      return () => {
        cancelled = true;
        tl?.kill();
        blink?.kill();
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`pre-reveal relative ${className ?? ""}`}>
      {/* keeps one line of height in flow while the words sit absolute */}
      <span aria-hidden className="invisible block">
        {words[0]}
      </span>
      {words.map((word, i) => (
        <span
          key={word}
          data-word
          className="absolute inset-x-0 top-0 block"
          style={i === 0 ? undefined : { visibility: "hidden" }}
        >
          {word.split("").map((ch, j) => (
            <span key={j} data-char className="inline-block">
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
          <span
            data-caret
            aria-hidden
            className="ml-[0.06em] inline-block h-[0.74em] w-[0.09em] bg-current"
          />
        </span>
      ))}
    </div>
  );
}
