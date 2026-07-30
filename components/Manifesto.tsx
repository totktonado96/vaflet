"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Words render one by one as you scroll — binary snaps, no fades.
// The last two words carry a permanent marker highlight.
const WORDS = "The whole spectrum. One team. One conversation.".split(" ");
const HIGHLIGHT_FROM = WORDS.length - 2;

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const words = gsap.utils.toArray<HTMLElement>(".manifesto-word");
      gsap.set(words, { autoAlpha: 0 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
          end: "bottom 60%",
          scrub: true,
        },
      });
      // (i + 1): no set at exactly time 0, so scrolling back restores word 1 too
      words.forEach((word, i) => {
        tl.set(word, { autoAlpha: 1 }, (i + 1) * 0.1);
        // the cursor taps along — see lib/cursor.ts
        tl.call(
          () => window.dispatchEvent(new Event("vaflet:manifesto-word")),
          undefined,
          (i + 1) * 0.1,
        );
      });
      tl.set({}, {}, "+=0.2");
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-label="The whole spectrum. One team. One conversation."
      className="shell pb-28 md:pb-40"
    >
      <p
        aria-hidden
        className="display-2 max-w-6xl font-extrabold uppercase leading-[1.15]"
      >
        {WORDS.map((word, i) => (
          <span
            key={i}
            className={`manifesto-word mr-[0.28em] inline-block ${
              i >= HIGHLIGHT_FROM
                ? "bg-black px-[0.18em] leading-[1.05] text-white"
                : ""
            }`}
          >
            {word}
          </span>
        ))}
      </p>
    </section>
  );
}
