"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** The four gradients, dragged past the eye by the scrollbar. */
export function GradientRail({
  items,
}: {
  items: { src: string; label: string; note: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth + 80;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex min-h-screen items-center overflow-hidden">
      <div ref={track} className="flex w-max gap-6 pl-5 md:gap-10 md:pl-10">
        {items.map((g) => (
          <figure key={g.src} className="w-[80vw] shrink-0 md:w-[52vw]">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1rem] md:rounded-[1.5rem]">
              <Image
                src={g.src}
                alt={g.label}
                fill
                sizes="(min-width: 768px) 52vw, 80vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 flex items-baseline gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em]">
                {g.label}
              </span>
              <span className="text-[11px] font-light opacity-70">{g.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
