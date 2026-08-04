import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import InkField from "@/components/InkField";
import Magnetic from "@/components/Magnetic";
import SplitReveal from "@/components/SplitReveal";
import { Counters, Reveal } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";
import { Door } from "./parts/door";
import { NameMatch } from "./parts/name-match";
import { StaffFeed, VisitRail } from "./parts/visit";
import { FallbackToggle, LanguageDrift, ShiftClock } from "./parts/shift";

/**
 * Face2me gets a site inside the site. The case wears the product's own
 * skin — face2.me's neumorphism: one pale material, light from the top
 * left, everything either extruded from the surface or pressed into it,
 * Jakarta for display, malachite for anything alive. None of the studio's
 * ink survives in here except at the very end, where the exit door drops
 * the reader back into our black — leaving her world is the transition.
 *
 * The content is still a personnel file: the badge, the posting she
 * answered, the interview, one visit from both sides, payroll, the dark
 * chapter, and her question at the end.
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

const PAYROLL = [
  {
    who: "A human front desk",
    price: "$4,000",
    note: "a month, plus benefits and the next hire when they leave",
    fill: 80,
    accent: false,
  },
  {
    who: "An enterprise kiosk",
    price: "$5,000",
    note: "a month, after $50,000–200,000 to put it in the lobby",
    fill: 100,
    accent: false,
  },
  {
    who: "Face2me",
    price: "$599",
    note: "a month, flat, hardware and install included",
    fill: 12,
    accent: true,
  },
];

const NEXT = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "face2me") + 1) % PROJECTS.length];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="f2m-neu-sm inline-block rounded-full! px-4 py-1.5 text-xs font-bold text-[color:var(--f2m-muted)]">
      {children}
    </span>
  );
}

export default function Face2mePage() {
  return (
    <main>
      <div data-f2m>
        {/* THE DOOR — her world opens on her, not on a claim */}
        <section className="shell pb-24 pt-32 md:pb-32 md:pt-44">
          <Link
            href="/work"
            className="f2m-neu-sm inline-block rounded-full! px-4 py-2 text-xs font-bold text-[color:var(--f2m-fg)]"
          >
            ← All work
          </Link>

          <div className="mt-12 grid items-center gap-16 md:mt-16 md:grid-cols-[1.05fr_1fr] md:gap-20">
            <div>
              <Chip>Employee no. 3 · hired 24 June 2026</Chip>
              <SplitReveal
                as="h1"
                onLoad
                className="f2m-display mt-6 text-6xl font-extrabold leading-[0.95] md:text-8xl"
              >
                Face2me
              </SplitReveal>
              <p className="mt-7 max-w-md text-lg font-medium leading-relaxed md:text-xl">
                We built a receptionist and sold it as a kiosk. Then we hired
                one ourselves, and put her on this page instead of a screenshot
                of her.
              </p>
              <div className="mt-10">
                <ShiftClock since={HIRED} />
              </div>
              <div className="mt-9 flex flex-wrap gap-3">
                {p.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
            </div>

            <Door />
          </div>
        </section>

        {/* THE BRIEF */}
        <section className="shell grid gap-x-16 gap-y-12 pb-24 md:grid-cols-2 md:pb-32">
          <Reveal>
            <Chip>The brief</Chip>
            <p className="mt-5 max-w-md text-lg font-medium leading-relaxed">
              {p.brief}
            </p>
            <div className="mt-8">
              <Chip>Stack</Chip>
            </div>
            <p className="mt-3 text-[15px] font-medium text-[color:var(--f2m-muted)]">
              {p.stack}
            </p>
          </Reveal>
          <Reveal>
            <Chip>What we did</Chip>
            <ul className="mt-5 flex flex-col gap-3.5">
              {p.did.map((item) => (
                <li key={item} className="flex items-baseline gap-3 font-medium leading-relaxed">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 translate-y-[-1px] rounded-full bg-[color:var(--f2m-accent)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* THE POSTING — the quietest card on the page, on purpose */}
        <section className="shell pb-24 md:pb-32">
          <SplitReveal className="f2m-display text-4xl font-bold leading-[1.05] md:text-6xl">
            The posting she answered
          </SplitReveal>
          <Reveal>
            <div className="f2m-neu mt-12 max-w-3xl p-7 md:p-10">
              <dl className="flex flex-col gap-7">
                {POSTING.map(([term, value]) => (
                  <div key={term} className="grid gap-2 md:grid-cols-[11rem_1fr] md:gap-8">
                    <dt>
                      <Chip>{term}</Chip>
                    </dt>
                    <dd className="text-lg font-medium leading-snug text-[color:var(--f2m-ink)]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </section>

        {/* THE INTERVIEW */}
        <section className="shell pb-24 md:pb-32">
          <SplitReveal className="f2m-display text-4xl font-bold leading-[1.05] md:text-6xl">
            The interview
          </SplitReveal>
          <Reveal stagger={0.12}>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {INTERVIEW.map((row) => (
                <div key={row.q} className="f2m-neu p-7 md:p-9">
                  <Chip>{row.q}</Chip>
                  <p className="f2m-display mt-5 text-2xl font-bold leading-snug md:text-3xl">
                    {row.a}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* FINDING YOU */}
        <section className="shell pb-24 md:pb-32">
          <SplitReveal className="f2m-display text-4xl font-bold leading-[1.05] md:text-6xl">
            She finds you anyway
          </SplitReveal>
          <Reveal>
            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed">
              People say their name the way they say it at home, and a front
              desk hears it once, over a counter, through a mask. Three passes
              run before she gives up and asks again.
            </p>
          </Reveal>
          <div className="mt-14">
            <NameMatch />
          </div>
        </section>

        {/* ONE VISIT */}
        <section className="shell pb-24 md:pb-32">
          <SplitReveal className="f2m-display text-4xl font-bold leading-[1.05] md:text-6xl">
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
            <SplitReveal className="f2m-display text-4xl font-bold leading-[1.05] md:text-6xl">
              Whatever you walked in speaking
            </SplitReveal>
            <Reveal>
              <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed">
                No menu, no flag to press. She takes the language off your
                first sentence and switches mid-conversation if you do.
              </p>
            </Reveal>
          </div>
          <div className="mt-14">
            <LanguageDrift />
          </div>
        </section>

        {/* PAYROLL */}
        <section className="shell pb-24 md:pb-32">
          <SplitReveal className="f2m-display text-4xl font-bold leading-[1.05] md:text-6xl">
            Payroll
          </SplitReveal>
          <Reveal>
            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed">
              The comparison the buyer actually runs. One bill, month to
              month, with the hardware inside it.
            </p>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {PAYROLL.map((row) => (
                <div key={row.who} className="f2m-neu flex flex-col p-7 md:p-8">
                  <p className="text-sm font-bold text-[color:var(--f2m-muted)]">
                    {row.who}
                  </p>
                  <p className="f2m-display mt-3 text-5xl font-extrabold tabular-nums">
                    {row.price}
                  </p>
                  <p className="mt-3 min-h-[3.5rem] text-sm font-medium leading-relaxed text-[color:var(--f2m-muted)]">
                    {row.note}
                  </p>
                  <div className="f2m-in mt-6 h-4 rounded-full! p-1">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.fill}%`,
                        background: row.accent
                          ? "var(--f2m-accent)"
                          : "var(--f2m-muted)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* WHEN THE LINE DROPS — the kiosk's dark mode */}
        <section data-f2m-dark className="py-24 md:py-32">
          <div className="shell">
            <SplitReveal className="f2m-display text-4xl font-bold leading-[1.05] md:text-6xl">
              When the line drops
            </SplitReveal>
            <Reveal>
              <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed">
                A lobby does not stop because the internet did. The models
                come down onto the machine and she keeps going — slower,
                quieter, still answering.
              </p>
            </Reveal>
            <div className="mt-14 grid items-center gap-12 md:grid-cols-2 md:gap-16">
              <FallbackToggle />
              {/* the switch reaches this screen: cloud is a fine interference,
                  local a rougher crosshatch — the same voice on worse wires.
                  The event name mirrors FALLBACK_MORPH_EVENT in parts/shift;
                  a client module's constant can't cross the server boundary. */}
              <div className="f2m-neu p-4">
                <div className="f2m-in relative aspect-[16/10] overflow-hidden rounded-[1.1rem]!">
                  <InkField
                    type={3}
                    scale={2.4}
                    speed={0.4}
                    morphEvent="vaflet:face2me-fallback"
                    className="h-full w-full opacity-90"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THE NUMBERS */}
        <section className="shell py-24 md:py-32">
          <Counters
            items={p.facts ?? []}
            className="grid gap-8 md:grid-cols-3"
            itemClassName="f2m-neu p-8 text-[color:var(--f2m-ink)]"
            labelClassName="mt-3 text-sm font-medium leading-snug text-[color:var(--f2m-muted)]"
          />
        </section>

        {/* THE OUTCOME */}
        <section className="shell pb-24 md:pb-32">
          <SplitReveal className="f2m-display text-4xl font-bold leading-[1.05] md:text-6xl">
            The outcome
          </SplitReveal>
          <Reveal>
            <ul className="mt-12 flex max-w-3xl flex-col gap-6">
              {p.outcome.map((item) => (
                <li key={item} className="f2m-neu-sm p-6 text-lg font-medium leading-relaxed md:p-7">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* HER TURN */}
        <section className="shell pb-28 md:pb-40">
          <Reveal>
            <Chip>Her turn</Chip>
            <p className="f2m-display mt-7 max-w-4xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
              So — do you want one of me in your lobby?
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Magnetic>
                <Link
                  href="/contact"
                  className="inline-block rounded-full bg-[color:var(--f2m-accent)] px-9 py-4 text-sm font-bold text-white shadow-[6px_6px_16px_var(--f2m-lo)] transition-transform duration-300 hover:scale-[1.03]"
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
                  className="f2m-btn inline-block px-9 py-4 text-sm font-bold text-[color:var(--f2m-ink)]"
                  data-cursor-text="face2.me ↗"
                >
                  Read her file elsewhere
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </section>
      </div>

      {/* the exit is the studio's own ink — leaving her world is the
          transition, and the contrast is the point */}
      <section className="shell bg-white pb-24 pt-16 md:pb-32">
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
