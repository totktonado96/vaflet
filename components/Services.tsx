"use client";

import { useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitReveal from "@/components/SplitReveal";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    title: "Websites & platforms",
    blurb:
      "Marketing sites, web apps, e-commerce. Fast, scalable, and impossible to confuse with a template.",
    points: [
      "Launch sites you can edit yourself",
      "Web apps and SaaS products",
      "E-commerce that sells",
      "Performance in the green",
    ],
  },
  {
    title: "Mobile apps",
    blurb:
      "iOS and Android from first sketch to the App Store. Research first, cookie-cutters never.",
    points: [
      "Native or cross-platform",
      "Tappable prototype in weeks",
      "Store launch handled",
      "Analytics wired from day one",
    ],
  },
  {
    title: "AI agents",
    blurb:
      "Not a chatbot on a landing page — agents inside your data and tools, doing actual work.",
    points: [
      "Support and sales agents",
      "Internal copilots",
      "Retrieval over your docs",
      "Evals and guardrails included",
    ],
  },
  {
    title: "Automation",
    blurb:
      "We wire your tools together so the busywork happens without humans. The robots don't complain.",
    points: [
      "CRM and ops wiring",
      "n8n, Zapier or custom flows",
      "Bots for Slack and Telegram",
      "Alerts before customers notice",
    ],
  },
  {
    title: "Rapid MVP",
    blurb:
      "Idea to product in front of real users in weeks. Vibecode fast, then engineer what survives.",
    points: [
      "One-week scoping sprint",
      "Working MVP, not a demo",
      "Feedback loops built in",
      "Hardened when it earns it",
    ],
  },
  {
    title: "Brand & motion",
    blurb:
      "Identity with a pulse: positioning, visuals, motion and voice that agree with each other.",
    points: [
      "Positioning and naming",
      "Visual identity systems",
      "Motion language",
      "Launch assets ready to ship",
    ],
  },
];

export default function Services() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="services"
      tabIndex={-1}
      className="shell relative -mt-20 rounded-t-[2.5rem] bg-white pb-28 pt-20 md:-mt-28 md:rounded-t-[4rem] md:pb-40 md:pt-28"
    >
      <div className="mb-6 flex items-end justify-between">
        <SplitReveal className="display-2 font-extrabold uppercase leading-[1.0]">
          What we do
        </SplitReveal>
        <span className="hidden pb-2 text-xs font-bold uppercase tracking-[0.2em] md:block">
          The whole spectrum
        </span>
      </div>
      <p className="mb-12 max-w-md font-medium leading-relaxed md:mb-16">
        Six things, one team, zero handoffs. Click a row — details unfold.
      </p>

      <ul>
        {SERVICES.map((s, i) => {
          const open = openIndex === i;
          return (
            <li
              key={s.title}
              className="group relative border-t-2 border-black last:border-b-2"
            >
              {/* Ink fill: the row floods black on hover and stays black while open */}
              <span
                aria-hidden
                className={`absolute inset-0 origin-bottom bg-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  open ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                }`}
              />
              {/* difference-blend keeps text pure b/w at every frame of the ink fill */}
              <div className="relative z-10 text-white mix-blend-difference">
                <h3 className="contents">
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`service-panel-${i}`}
                    className="grid w-full grid-cols-[1fr_auto] items-center gap-x-6 py-6 text-left md:py-8"
                  >
                    <span
                      className={`display-3 font-extrabold uppercase leading-[1.05] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        open ? "translate-x-3 md:translate-x-5" : "group-hover:translate-x-3 md:group-hover:translate-x-5"
                      }`}
                    >
                      {s.title}
                    </span>
                    <span
                      aria-hidden
                      className={`pr-1 text-2xl font-bold transition-transform duration-300 md:pr-2 md:text-3xl ${
                        open ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={`service-panel-${i}`}
                  onTransitionEnd={(e) => {
                    if (
                      e.target === e.currentTarget &&
                      e.propertyName === "grid-template-rows"
                    ) {
                      ScrollTrigger.refresh();
                    }
                  }}
                  className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-8 pb-8 md:grid-cols-2 md:pb-10 md:pl-5">
                      <p className="max-w-md font-medium leading-relaxed">
                        {s.blurb}
                      </p>
                      <ul className="flex flex-col gap-2">
                        {s.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-baseline gap-3 text-[15px] font-medium"
                          >
                            <span aria-hidden className="text-[9px]">
                              ■
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
