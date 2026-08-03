import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { Counters, PhoneMarquee, PhoneWall, Reveal } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";

/**
 * TMCARS is a phone app used by most of a country, so the case is built out of
 * phones: the volume of the prototype is the argument, and the page shows it
 * three ways — drifting, one at a time, and all at once.
 */

const p = PROJECTS.find((x) => x.slug === "tmcars")!;
const TITLE = "TMCARS — Vaflet LLC";
const BLUE = "#2381cb";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/tmcars" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/tmcars",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const S = (n: string) => `/photos/tmcars/${n}.jpg`;

const ALL = [
  "main", "feed", "menu", "search", "results", "cars", "cars-search", "collections",
  "brands", "parts", "other", "listing", "listing-specs", "listing-alt", "bookmarks",
  "mylistings", "business", "premium", "news", "news-article", "notifications",
  "story", "profile", "admin-chat",
].map(S);

const MARQUEE = [
  ["main", "results", "listing", "premium", "news", "collections", "feed", "brands"].map(S),
  ["mylistings", "notifications", "business", "parts", "profile", "story", "bookmarks", "cars"].map(S),
];

const MOVES = [
  {
    kicker: "The feed",
    line: "One screen that holds a whole market",
    src: S("main"),
    note: "Stories, categories and listings in one column — cars, parts and everything else without a mode switch.",
  },
  {
    kicker: "Finding",
    line: "Search that answers before you finish",
    src: S("results"),
    note: "Suggestions and saved words, brand pickers and curated collections, filters sitting on the same screen as the results.",
  },
  {
    kicker: "Selling",
    line: "Your listings, and what they are worth",
    src: S("mylistings"),
    note: "Publication quota, per-listing state, a chat with support, and a paid tier that explains itself in plain language.",
  },
];

export default function TmcarsPage() {
  const next = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "tmcars") + 1) % PROJECTS.length];

  return (
    <main>
      {/* ---- title, then the app drifting past ------------------------- */}
      <section className="pt-32 md:pt-44">
        <div className="shell">
          <Link
            href="/work"
            className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:bg-black hover:text-white hover:no-underline"
          >
            ← All work
          </Link>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
            <SplitReveal
              as="h1"
              onLoad
              className="display-1 font-extrabold uppercase leading-[0.9]"
            >
              TMCARS
            </SplitReveal>
            <div className="max-w-[42ch]">
              <p className="text-[17px] font-light leading-relaxed md:text-[19px]">
                {p.desc}
              </p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: BLUE }}>
                {p.services}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          <PhoneMarquee rows={MARQUEE} seconds={70} />
        </div>
      </section>

      {/* ---- why it is a hard brief ------------------------------------ */}
      <section className="shell py-24 md:py-36">
        <SplitReveal className="display-2 max-w-[20ch] font-extrabold uppercase leading-[1.0]">
          Redesigning the app everyone already has
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-16 md:grid-cols-3">
            <p className="text-[17px] font-light leading-relaxed md:text-[19px]">
              TMCARS is the largest classifieds board in Turkmenistan and one of
              the most used apps in the country. Nobody needs persuading to open
              it.
            </p>
            <p className="text-[17px] font-light leading-relaxed md:text-[19px]">
              Which is what makes the brief hard: every habit is already formed,
              and every screen sits inside somebody&rsquo;s daily routine.
            </p>
            <p className="text-[17px] font-light leading-relaxed md:text-[19px]">
              So it goes in stages, and each one is settled in a working
              prototype — tapped through, not imagined from a deck.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- three moves, phone beside the words ------------------------ */}
      <section className="shell">
        {MOVES.map((m, i) => (
          <div
            key={m.kicker}
            className={`grid items-center gap-10 border-t border-black/15 py-16 md:gap-20 md:py-24 ${
              i % 2 ? "md:grid-cols-[auto_1fr]" : "md:grid-cols-[1fr_auto]"
            }`}
          >
            <div className={i % 2 ? "md:order-2" : undefined}>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: BLUE }}>
                {String(i + 1).padStart(2, "0")} — {m.kicker}
              </p>
              <p className="display-3 mt-6 max-w-[16ch] font-extrabold uppercase leading-[1.02]">
                {m.line}
              </p>
              <p className="mt-6 max-w-[46ch] text-[17px] font-light leading-relaxed md:text-[19px]">
                {m.note}
              </p>
            </div>
            <div
              className={`relative mx-auto aspect-[1728/3748] w-[58vw] max-w-[280px] overflow-hidden rounded-[1.6rem] shadow-[0_30px_70px_rgba(0,0,0,0.18)] md:w-[20vw] md:rounded-[2rem] ${
                i % 2 ? "md:order-1" : ""
              }`}
            >
              <Image
                src={m.src}
                alt={m.line}
                fill
                sizes="(min-width: 768px) 20vw, 58vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </section>

      {/* ---- the whole thing at once ------------------------------------ */}
      <section className="shell border-t-2 border-black py-20 md:py-28">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
            Stage one, all of it
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
            {ALL.length} screens shown · 36 prototyped
          </p>
        </div>
        <div className="mt-12 md:mt-16">
          <PhoneWall shots={ALL} />
        </div>
      </section>

      {/* ---- what it added up to ---------------------------------------- */}
      <section className="shell pb-24 pt-8 md:pb-32 md:pt-16">
        <Counters
          items={p.facts ?? []}
          className="grid gap-px border-y-2 border-black md:grid-cols-3"
          itemClassName="py-10 md:py-16"
          labelClassName="mt-4 max-w-[24ch] text-[11px] font-bold uppercase leading-snug tracking-[0.2em] opacity-60"
        />
        <Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <p className="display-3 max-w-[14ch] font-extrabold uppercase leading-[1.05]">
              Stage one
            </p>
            <div className="flex flex-col gap-4 md:col-span-2">
              {p.outcome.map((line) => (
                <p
                  key={line}
                  className="border-b border-black/15 pb-4 text-[17px] font-light leading-relaxed md:text-[19px]"
                >
                  {line}
                </p>
              ))}
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
                The later stages are under NDA
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out ---------------------------------------------------------- */}
      <section className="shell pb-24 md:pb-32">
        <Link
          href={`/work/${next.slug}`}
          className="group relative isolate block overflow-hidden border-t-2 border-black pb-6 pt-8 md:pb-8"
          data-cursor-text={next.title}
        >
          {/* the ink rises and the reader leaves — same exit on every case */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-black transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
          />
          <span className="block text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[450ms] group-hover:text-white">
            Next project
          </span>
          <span className="display-2 mt-2 flex items-baseline gap-5 font-extrabold uppercase leading-[1.0] transition-colors duration-[450ms] group-hover:text-white">
            <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
              {next.title}
            </span>
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-2"
            >
              →
            </span>
          </span>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
