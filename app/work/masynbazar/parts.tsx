"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";
import { LINE_DARK, SIGNAL } from "./palette";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The ten routes the dealer's footer globe tours, laid flat. Every line leaves
 * the same red dot in Dubai and stops at its city, drawn to the length of the
 * trip — so the board says what the business is: nobody on it lives close
 * enough to walk the lot.
 */
export function RouteBoard({ routes }: { routes: { city: string; km: number }[] }) {
  const root = useRef<HTMLDivElement>(null);
  const max = Math.max(...routes.map((r) => r.km));

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-route]").forEach((row, i) => {
        const at = i * 0.08;
        const figure = row.querySelector<HTMLElement>("[data-km]")!;
        const box = { n: 0 };
        tl.from(row.querySelectorAll("[data-route-text]"), { y: 12, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, at)
          .from(row.querySelector("[data-line]"), { scaleX: 0, duration: 1.2, ease: "power3.inOut" }, at)
          .from(row.querySelector("[data-stop]"), { scale: 0, duration: 0.45, ease: "back.out(2.6)" }, at + 1.05)
          // the figure runs with the line, landing on the same 50 km steps the globe prints
          .to(
            box,
            {
              n: Number(figure.dataset.km),
              duration: 1.2,
              ease: "power3.inOut",
              onUpdate: () => {
                figure.textContent = (Math.round(box.n / 50) * 50).toLocaleString("en-US");
              },
            },
            at,
          );
      });
    },
    { scope: root },
  );

  const row = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-4 md:grid-cols-[9rem_minmax(0,1fr)_8.5rem] md:gap-x-10";

  return (
    <div ref={root}>
      <div className={`${row} pb-5 text-[11px] font-bold uppercase tracking-[0.18em] opacity-60`}>
        <p>City</p>
        <p className="hidden md:block">From Dubai, Al Quoz Industrial Area 3</p>
        <p className="text-right">Distance</p>
      </div>

      {routes.map((r) => (
        <div
          key={r.city}
          data-route
          className={`${row} py-5 md:py-6`}
          style={{ borderTop: `1px solid ${LINE_DARK}` }}
        >
          <p data-route-text className="text-[16px] font-semibold md:text-[18px]">
            {r.city}
          </p>

          {/* the rail is the longest trip; the drawn line is this one */}
          <div className="relative order-3 col-span-2 h-3 md:order-none md:col-span-1">
            <span
              aria-hidden
              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
              style={{ backgroundColor: LINE_DARK }}
            />
            <div className="absolute inset-y-0 left-0" style={{ width: `${(r.km / max) * 100}%` }}>
              <span
                data-line
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-[2px] origin-left -translate-y-1/2 bg-white/75"
              />
              <span
                data-stop
                aria-hidden
                className="absolute right-0 top-1/2 size-[9px] -translate-y-1/2 translate-x-1/2 rounded-full bg-white"
              />
            </div>
            <span
              aria-hidden
              className="absolute left-0 top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: SIGNAL }}
            />
          </div>

          <p data-route-text className="mb-display text-right text-[22px] leading-none md:text-[30px]">
            <span data-km={r.km}>{r.km.toLocaleString("en-US")}</span>
            <span className="ml-1.5 align-baseline text-[12px] font-bold tracking-[0.12em] opacity-60 md:text-[13px]">
              KM
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
