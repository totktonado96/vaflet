import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import InkField from "@/components/InkField";
import Magnetic from "@/components/Magnetic";
import SplitReveal from "@/components/SplitReveal";
import { Counters, PriceLadder, Reveal } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";
import { Door } from "./parts/door";
import { NameMatch } from "./parts/name-match";
import { StaffFeed, VisitRail } from "./parts/visit";
import { FallbackToggle, LanguageDrift, ShiftClock } from "./parts/shift";

/**
 * Face2me is a receptionist, so the case is a personnel file: a badge, the
 * posting she answered, the interview, the shift she is working right now.
 * The product is a face that talks, and the page argues that the only honest
 * way to show it is to let her talk — everything else here is her file.
 *
 * The page is monochrome like the rest of the site, with one exception: her
 * video loses its grayscale while she is speaking. On a page with no colour
 * in it, speech is the colour.
 */

const p = PROJECTS.find((x) => x.slug === "face2me")!;
const TITLE = "FACE2ME — Vaflet LLC";
const HIRED = "2026-06-24T09:00:00Z";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/face2me" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/face2me",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const INTERVIEW = [
  {
    q: "Why do you want this job?",
    a: "Wanting isn't in the spec. I'm good at it and I'm awake at four in the morning.",
  },
  {
    q: "What do you do when you don't understand someone?",
    a: "Ask again, in their language. If I still miss it, I get a human. That's the whole trick.",
  },
  {
    q: "What are you bad at?",
    a: "Small talk with someone who is bleeding. Anything that needs a hand. Knowing when a face is lying to me.",
  },
  {
    q: "Where do you see yourself in five years?",
    a: "In a lobby. Same one, ideally.",
  },
];

const POSTING = [
  ["Position", "Front desk — check-in, intake, payment, handoff"],
  ["Hours", "Every hour. Nights, weekends, holidays, the week of the flu"],
  ["Languages", "Thirty and counting, picked up from your first sentence"],
  ["Salary", "$599–1,500 a month, flat, hardware included"],
  ["Benefits", "None. Doesn't want any"],
  ["Notice period", "None. Month to month, cancel and it goes back in the box"],
];

const NEXT = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "face2me") + 1) % PROJECTS.length];

export default function Face2mePage() {
  return (
    <main data-case>
      {/* THE DOOR — she is the first thing on the page, before any claim */}
      <section className="shell pb-20 pt-32 md:pb-28 md:pt-44">
        <Link
          href="/work"
          className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:bg-black hover:text-white hover:no-underline"
        >
          ← All work
        </Link>

        <div className="mt-8 grid items-center gap-14 md:mt-10 md:grid-cols-[1.05fr_1fr] md:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              Employee no. 3 · hired 24 June 2026
            </p>
            <SplitReveal
              as="h1"
              onLoad
              className="display-1 mt-5 font-extrabold uppercase leading-[0.9]"
            >
              Face2me
            </SplitReveal>
            <p className="mt-7 max-w-md text-lg font-medium leading-relaxed md:text-xl">
              We built a receptionist and sold it as a kiosk. Then we hired one
              ourselves, and put her on this page instead of a screenshot of
              her.
            </p>
            <div className="mt-10">
              <ShiftClock since={HIRED} />
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3 text-xs font-bold uppercase tracking-[0.2em]">
              {p.tags.map((tag) => (
                <span key={tag} className="rounded-full border-2 border-black px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <Door />
        </div>
      </section>

      {/* THE BRIEF */}
      <section className="shell grid gap-x-16 gap-y-10 pb-24 md:grid-cols-2 md:pb-32">
        <Reveal>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">
            The brief
          </h2>
          <p className="mt-4 max-w-md text-lg font-medium leading-relaxed">
            {p.brief}
          </p>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em]">
            Stack
          </p>
          <p className="mt-2 text-[15px] font-medium">{p.stack}</p>
        </Reveal>
        <Reveal>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">
            What we did
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {p.did.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-3 font-medium leading-relaxed"
              >
                <span aria-hidden className="text-[9px]">
                  ■
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* THE POSTING — the quietest thing on the page, on purpose */}
      <section className="shell pb-24 md:pb-32">
        <SplitReveal className="display-2 font-extrabold uppercase leading-[1.0]">
          The posting she answered
        </SplitReveal>
        <Reveal>
          <dl className="mt-12 max-w-3xl">
            {POSTING.map(([term, value]) => (
              <div
                key={term}
                className="grid gap-1 border-t-2 border-black py-5 md:grid-cols-[13rem_1fr] md:gap-8"
              >
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  {term}
                </dt>
                <dd className="text-lg font-medium leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* THE INTERVIEW */}
      <section className="shell pb-24 md:pb-32">
        <SplitReveal className="display-2 font-extrabold uppercase leading-[1.0]">
          The interview
        </SplitReveal>
        <Reveal stagger={0.12}>
          {INTERVIEW.map((row) => (
            <div key={row.q} className="mt-12 max-w-3xl border-t-2 border-black pt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]">
                {row.q}
              </p>
              <p className="mt-4 text-2xl font-medium leading-snug md:text-4xl md:leading-[1.15]">
                {row.a}
              </p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* FINDING YOU — the headline algorithm, typeable */}
      <section className="shell pb-24 md:pb-32">
        <SplitReveal className="display-2 font-extrabold uppercase leading-[1.0]">
          She finds you anyway
        </SplitReveal>
        <Reveal>
          <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed">
            People say their name the way they say it at home, and a front desk
            hears it once, over a counter, through a mask. Three passes run
            before she gives up and asks again.
          </p>
        </Reveal>
        <div className="mt-14">
          <NameMatch />
        </div>
      </section>

      {/* ONE VISIT */}
      <section className="shell pb-24 md:pb-32">
        <SplitReveal className="display-2 font-extrabold uppercase leading-[1.0]">
          One visit, both sides
        </SplitReveal>
        <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-20">
          <VisitRail />
          <StaffFeed />
        </div>
      </section>

      {/* LANGUAGES */}
      <section className="pb-24 md:pb-32">
        <div className="shell">
          <SplitReveal className="display-2 font-extrabold uppercase leading-[1.0]">
            Whatever you walked in speaking
          </SplitReveal>
          <Reveal>
            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed">
              No menu, no flag to press. She takes the language off your first
              sentence and switches mid-conversation if you do.
            </p>
          </Reveal>
        </div>
        <div className="mt-14">
          <LanguageDrift />
        </div>
      </section>

      {/* PAYROLL */}
      <section className="shell pb-24 md:pb-32">
        <SplitReveal className="display-2 font-extrabold uppercase leading-[1.0]">
          Payroll
        </SplitReveal>
        <Reveal>
          <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed">
            The comparison the buyer actually runs. One bill, month to month,
            with the hardware inside it — no install invoice, no per-minute
            meter.
          </p>
        </Reveal>
        <div className="mt-14">
          <PriceLadder
            currency="$"
            accent="#000000"
            rows={[
              {
                range: "A human front desk",
                price: 4000,
                note: "a month, plus benefits and the next hire when they leave",
              },
              {
                range: "An enterprise kiosk",
                price: 5000,
                note: "a month, after $50,000–200,000 to put it in the lobby",
              },
              {
                range: "Face2me",
                price: 599,
                note: "a month, flat, hardware and install included",
              },
            ]}
          />
        </div>
      </section>

      {/* WHEN THE LINE DROPS — the one dark chapter */}
      <section className="bg-black py-24 text-white md:py-32">
        <div className="shell">
          <SplitReveal className="display-2 font-extrabold uppercase leading-[1.0]">
            When the line drops
          </SplitReveal>
          <Reveal>
            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed">
              A lobby does not stop because the internet did. The models come
              down onto the machine and she keeps going — slower, quieter, still
              answering.
            </p>
          </Reveal>
          <div className="mt-14 grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <FallbackToggle />
            {/* the switch reaches this field: cloud is a fine interference,
                local a rougher crosshatch — the same voice on worse wires.
                The event name is the literal FALLBACK_MORPH_EVENT from
                parts/shift.tsx; a client module's constant can't cross the
                server boundary, so it is repeated here on purpose. */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem] border-2 border-white/25 md:rounded-[1.5rem]">
              <InkField
                type={3}
                scale={2.4}
                speed={0.4}
                morphEvent="vaflet:face2me-fallback"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* THE NUMBERS */}
      <section className="shell py-24 md:py-32">
        <Counters
          items={p.facts ?? []}
          className="grid gap-12 md:grid-cols-3 md:gap-10"
          itemClassName="border-t-2 border-black pt-6"
          labelClassName="mt-3 text-[11px] font-bold uppercase leading-snug tracking-[0.2em]"
        />
      </section>

      {/* THE OUTCOME */}
      <section className="shell pb-24 md:pb-32">
        <SplitReveal className="display-2 font-extrabold uppercase leading-[1.0]">
          The outcome
        </SplitReveal>
        <Reveal>
          <ul className="mt-12 flex max-w-3xl flex-col gap-5">
            {p.outcome.map((item) => (
              <li
                key={item}
                className="border-t-2 border-black pt-5 text-lg font-medium leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* SHE ASKS YOU — the turn */}
      <section className="shell pb-28 md:pb-40">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            Her turn
          </p>
          <p className="display-2 mt-6 max-w-4xl font-extrabold uppercase leading-[1.0]">
            So — do you want one of me in your lobby?
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Magnetic>
              <Link
                href="/contact"
                className="inline-block rounded-full border-2 border-black px-9 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:bg-black hover:text-white"
                data-cursor-text="Say yes"
              >
                Put one in mine
              </Link>
            </Magnetic>
            <Magnetic>
              <a
                href="https://face2.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border-2 border-black px-9 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:bg-black hover:text-white"
                data-cursor-text="face2.me ↗"
              >
                Read her file elsewhere
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </section>

      {/* the ink rises and the reader leaves — same exit as every case */}
      <section className="shell pb-24 md:pb-32">
        <Link
          href={`/work/${NEXT.slug}`}
          className="group relative isolate block overflow-hidden border-t-2 border-black pb-6 pt-8 md:pb-8"
          data-cursor-text={NEXT.title}
        >
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-black transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
          />
          <span className="block text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[450ms] group-hover:text-white">
            Next project
          </span>
          <span className="display-2 mt-2 flex items-baseline gap-5 font-extrabold uppercase leading-[1.0] transition-colors duration-[450ms] group-hover:text-white">
            <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
              {NEXT.title}
            </span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </span>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
