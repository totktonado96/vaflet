"use client";

import { useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InkField from "@/components/InkField";
import SplitReveal from "@/components/SplitReveal";

gsap.registerPlugin(ScrollTrigger);

// Enterprise-weight scope, deliberately small timelines — that's the pitch.
const SERVICES = [
  {
    title: "Websites & platforms",
    blurb:
      "From marketing sites to multi-tenant SaaS. Built for real traffic, real payments and real audits — not for a template gallery.",
    points: [
      "Multi-tenant SaaS: roles, billing, SSO/SAML",
      "Payment orchestration and subscriptions",
      "Sub-second Core Web Vitals under load",
      "Localization, A/B and analytics baked in",
    ],
    type: 0 as const,
    timeline: "from 10 days",
  },
  {
    title: "Mobile apps",
    blurb:
      "iOS and Android from first sketch to the App Store — including the hard parts: offline sync, push, payments, release trains.",
    points: [
      "Native or cross-platform, chosen on evidence",
      "Offline-first sync and background jobs",
      "Subscriptions and in-app purchases done right",
      "CI/CD release trains, crash-free above 99.9%",
    ],
    type: 1 as const,
    timeline: "from 3 weeks",
  },
  {
    title: "AI agents",
    blurb:
      "Not a chatbot on a landing page — agents wired into your data, tools and permissions, with evals to prove they behave.",
    points: [
      "RAG over your docs, databases and APIs",
      "Multi-agent workflows, human-in-the-loop",
      "VPC or on-prem deployment, PII redaction",
      "Eval suites, guardrails and cost ceilings",
    ],
    type: 2 as const,
    timeline: "from 2 weeks",
  },
  {
    title: "Automation",
    blurb:
      "CRMs, ERPs and inboxes wired into pipelines that run themselves. The robots don't complain — they escalate.",
    points: [
      "Event-driven pipelines across 100+ tools",
      "CRM/ERP sync without duplicate hell",
      "Slack and Telegram bots with approval flows",
      "Observability: alerts before customers notice",
    ],
    type: 4 as const,
    timeline: "from 5 days",
  },
  {
    title: "Rapid MVP",
    blurb:
      "Idea to product in front of real users in days — with production auth, payments and analytics, so the demo survives the demo.",
    points: [
      "Scoping sprint measured in days, not months",
      "Production auth, billing, analytics on day one",
      "Feature flags and feedback loops built in",
      "Hardened into a platform when it earns it",
    ],
    type: 5 as const,
    timeline: "from 7 days",
  },
  {
    title: "Brand & motion",
    blurb:
      "Identity with a pulse: positioning, visual system, motion language and voice that survive contact with production.",
    points: [
      "Positioning, naming, verbal identity",
      "Design systems, not just logo files",
      "Motion language for product and marketing",
      "Launch kits: decks, ads, socials, docs",
    ],
    type: 3 as const,
    timeline: "from 1 week",
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
                    <div className="grid gap-8 pb-8 md:grid-cols-[1.1fr_0.7fr_1.1fr] md:gap-10 md:pb-10 md:pl-5">
                      <div>
                        <p className="max-w-md font-medium leading-relaxed">
                          {s.blurb}
                        </p>
                        <dl className="mt-6 space-y-1.5 text-xs font-bold uppercase tracking-[0.2em]">
                          <div className="flex gap-3">
                            <dt className="opacity-50">Timeline</dt>
                            <dd>{s.timeline}</dd>
                          </div>
                        </dl>
                        <a
                          href="/contact"
                          tabIndex={open ? 0 : -1}
                          className="mt-7 inline-block text-sm font-bold uppercase tracking-[0.15em] underline underline-offset-4 transition-transform duration-300 ease-out hover:translate-x-1 hover:no-underline"
                        >
                          Start this →
                        </a>
                      </div>
                      {/* live 1-bit ink — a different pattern per service; only
                          mounted while open to keep WebGL contexts scarce */}
                      <div aria-hidden className="hidden md:block">
                        {open && (
                          <InkField
                            type={s.type}
                            scale={2.6}
                            speed={0.5}
                            className="h-full min-h-40 w-full rounded-[1rem]"
                          />
                        )}
                      </div>
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
