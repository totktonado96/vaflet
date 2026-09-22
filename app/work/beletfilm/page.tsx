import type { Metadata } from "next";
import Link from "next/link";
import ArrowNE from "@/components/ArrowNE";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { Counters, DriftShot, Reveal } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";
import { BLUE_TEXT, EDGE, INK, LINE } from "./palette";
import { PhoneMoves, PlayerStates, ScrollScreens, Scrubber } from "./parts";

/**
 * Belet Film is where a country watches its series, so the case plays like an
 * episode: the player's own scrubber runs along the bottom, the runtime is the
 * one on the player screen, and the chapters are the sections. The screens are
 * shown as screens — no devices, no notches — on the app's own near-black.
 */

const p = PROJECTS.find((x) => x.slug === "beletfilm")!;
const TITLE = "BELET FILM — Vaflet LLC";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/beletfilm" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/beletfilm",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const S = (n: string) => `/photos/beletfilm/${n}.jpg`;

/** 58:43 — the episode on the player screen, and so the length of this case. */
const RUNTIME = 58 * 60 + 43;

const MOVES: { kicker: string; line: string; shots: [{ src: string; alt: string }, { src: string; alt: string }] }[] = [
  {
    kicker: "Get in",
    line: "A welcome, then a phone number with +993 already in",
    shots: [
      { src: S("welcome"), alt: "Welcome screen: thousands of series, in translation and in the original" },
      { src: S("login"), alt: "Sign-in: Turkmenistan selected, the +993 code filled in, a number pad" },
    ],
  },
  {
    kicker: "Find it",
    line: "Genres as chips, the rest of the question in one sheet",
    shots: [
      { src: S("catalog"), alt: "Catalog: search, genre chips and a grid of posters" },
      { src: S("filters"), alt: "Filters: quick filters, genre, country, year, languages, rating, sorting" },
    ],
  },
  {
    kicker: "Pay for it",
    line: "The subscription counts its days; a gift card pays for more",
    shots: [
      { src: S("belet-id"), alt: "Belet ID: subscription active with 13 days left, lists, downloads, settings" },
      { src: S("gift-card"), alt: "Gift card: a code entered digit by digit on a number pad" },
    ],
  },
];

const LONG = [
  {
    src: S("home"),
    alt: "Home, top to bottom: a featured series, what's next, popular, similar, collections",
    w: 720,
    h: 3144,
    label: "Home",
    note: "What's next, what's popular, what's similar",
  },
  {
    src: S("title"),
    alt: "A series page: cast photo, Watch now, seasons, episodes, actors, details",
    w: 720,
    h: 2580,
    label: "A title",
    note: "Seasons, episodes, cast and everything before Play",
  },
  {
    src: S("profile"),
    alt: "Profile: subscription, authorised devices, parental control, playback and traffic settings",
    w: 720,
    h: 3100,
    label: "Profile",
    note: "Subscription, devices, parental control, playback and traffic",
  },
];

const STATES = [
  {
    src: S("player"),
    alt: "Player: an episode playing, settings, speed, series and lock under the scrubber",
    label: "Playing",
    note: "Settings, speed, series and a lock under the scrubber",
  },
  {
    src: S("player-settings"),
    alt: "Player settings: quality, audio and subtitles side by side",
    label: "Settings",
    note: "Quality, audio and subtitles, side by side",
  },
  {
    src: S("player-report"),
    alt: "A complaint menu over the paused episode, and a note that it reached the moderators",
    label: "Report",
    note: "A complaint, and a note that it reached the moderators",
  },
  {
    src: S("player-locked"),
    alt: "Locked player: controls hidden, an Unblock button",
    label: "Locked",
    note: "The lock keeps stray taps off the controls",
  },
  {
    src: S("offline"),
    alt: "No connection: what failed, an error code, Try again and Come back",
    label: "Offline",
    note: "What failed, an error code, and two ways out",
  },
];

/** What holds every screen together. */
const SYSTEM = [
  ["Type", "Inter and nothing else — the screen title, the list row, the timecode."],
  [
    "Icons",
    "Microsoft Fluent System Icons on three grids: 24 px in the player, 20 in the navigation bar, 16 everywhere else.",
  ],
  [
    "Colour",
    "Near-black, so the posters bring the colour, and one blue for whatever can be pressed or is chosen.",
  ],
  ["States", "Locked, reported and offline were drawn with the rest of the app, not improvised after it."],
];

const para = "text-[17px] leading-relaxed text-white/80 md:text-[19px]";

export default function BeletFilmPage() {
  const next = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "beletfilm") + 1) % PROJECTS.length];

  return (
    <main className="bf-case inv" style={{ backgroundColor: INK, color: "#FFFFFF" }}>
      {/* ---- the name, then the player ---------------------------------- */}
      <section className="pt-32 md:pt-44">
        <div className="shell">
          <Link
            href="/work"
            className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:bg-white hover:text-black hover:no-underline"
          >
            ← All work
          </Link>
          <p className="bf-eyebrow mt-10">Streaming · Turkmenistan</p>
          <SplitReveal as="h1" onLoad className="display-1 bf-title mt-3 leading-[1.05]">
            Belet Film
          </SplitReveal>
          <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <p className="max-w-[46ch] text-[17px] leading-relaxed text-white/80 md:text-[19px]">
              {p.desc}
            </p>
            <p className="bf-eyebrow" style={{ color: BLUE_TEXT }}>
              {p.services}
            </p>
          </div>
        </div>

        <div className="mt-12 px-5 md:mt-16 md:px-10">
          <DriftShot
            src={S("player")}
            alt="Belet Film player: an episode of Peaky Blinders mid-play"
            className="aspect-[1600/720] w-full"
            priority
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ boxShadow: `inset 0 0 0 1px ${EDGE}` }}
            />
          </DriftShot>
        </div>
      </section>

      {/* ---- the brief -------------------------------------------------- */}
      <section className="shell py-24 md:py-36" data-bf-start data-chapter="The brief">
        <p className="bf-eyebrow">The brief</p>
        <SplitReveal className="display-2 mt-6 max-w-[17ch] leading-[1.05]">
          Thousands of series, and a phone to watch them on
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              Belet Film is Turkmenistan’s main streaming service: series from
              all over the world, in translation and in the original language.
            </p>
            <p className={para}>
              We designed its app — the research, the flows between the screens
              and the interface itself, from the first launch to the account.
            </p>
            <p className={para}>
              Including the moments nobody puts in a pitch: a locked player, a
              complaint about quality, a connection that drops mid-episode.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- three errands, two screens each ---------------------------- */}
      <section className="shell pb-10 md:pb-20" data-chapter="Get in · Find it · Pay for it">
        <p className="bf-eyebrow">Three errands</p>
        <SplitReveal className="display-2 mt-6 max-w-[16ch] leading-[1.05]">
          Get in, find it, pay for it
        </SplitReveal>
        <div className="mt-6 md:mt-0">
          <PhoneMoves moves={MOVES} />
        </div>
      </section>

      {/* ---- the long screens, scrolled -------------------------------- */}
      <section style={{ borderTop: `1px solid ${LINE}` }} data-chapter="Long screens">
        <div className="shell pt-20 md:pt-28">
          <p className="bf-eyebrow">Long screens</p>
          <SplitReveal className="display-2 mt-6 max-w-[18ch] leading-[1.05]">
            The feed, a title and the account, all the way down
          </SplitReveal>
        </div>
        <ScrollScreens screens={LONG} />
      </section>

      {/* ---- the player ------------------------------------------------- */}
      <section style={{ borderTop: `1px solid ${LINE}` }} data-chapter="The player">
        <div className="shell pt-20 md:pt-28">
          <p className="bf-eyebrow">The player</p>
          <SplitReveal className="display-2 mt-6 max-w-[16ch] leading-[1.05]">
            Where the watching happens
          </SplitReveal>
        </div>
        <div className="shell mt-12 md:mt-0">
          <PlayerStates states={STATES} />
        </div>
      </section>

      {/* ---- the system ------------------------------------------------- */}
      <section
        className="shell py-20 md:py-32"
        style={{ borderTop: `1px solid ${LINE}` }}
        data-chapter="The system"
      >
        <p className="bf-eyebrow">The system</p>
        <SplitReveal className="display-2 mt-6 max-w-[16ch] leading-[1.05]">
          One language for every screen
        </SplitReveal>
        <Reveal y={18} stagger={0.06}>
          {SYSTEM.map(([title, note], i) => (
            <div
              key={title}
              className={`grid gap-2 py-7 md:grid-cols-[22%_1fr] md:gap-10 ${i === 0 ? "mt-14" : ""}`}
              style={{ borderTop: `1px solid ${LINE}` }}
            >
              <p className="bf-eyebrow text-white">{title}</p>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-white/85 md:text-[19px]">
                {note}
              </p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---- the count, and what came out ------------------------------- */}
      <section className="shell pb-24 pt-6 md:pb-32 md:pt-10" data-bf-end data-chapter="What came out">
        <Counters
          items={p.facts ?? []}
          className="grid gap-px md:grid-cols-3"
          itemClassName="py-10 md:py-16"
          labelClassName="bf-eyebrow mt-4 max-w-[26ch]"
        />
        <Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <p className="display-3 max-w-[14ch] leading-[1.05]">What came out</p>
            <div className="flex flex-col gap-4 md:col-span-2">
              {p.outcome.map((line) => (
                <p
                  key={line}
                  className="pb-4 text-[17px] leading-relaxed md:text-[19px]"
                  style={{ borderBottom: `1px solid ${LINE}` }}
                >
                  {line}
                </p>
              ))}
              <p className="bf-eyebrow mt-2">{p.stack}</p>
              <a
                href="https://belet.tm/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold tracking-[0.02em] text-white transition-transform duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: BLUE_TEXT }}
              >
                belet.tm <ArrowNE />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out -------------------------------------------------------- */}
      <section className="shell pb-24 md:pb-32">
        <Link
          href={`/work/${next.slug}`}
          className="group relative isolate block overflow-hidden border-t-2 border-white pb-6 pt-8 md:pb-8"
          data-cursor-text={next.title}
        >
          {/* the ink rises and the reader leaves — same exit on every case */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-white transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
          />
          <span className="block text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[450ms] group-hover:text-black">
            Next project
          </span>
          <span className="display-2 mt-2 flex items-baseline gap-5 leading-[1.0] transition-colors duration-[450ms] group-hover:text-black">
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
      {/* last on purpose: it measures the page after every pin above is in place */}
      <Scrubber runtime={RUNTIME} />
    </main>
  );
}
