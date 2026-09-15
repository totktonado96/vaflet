import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import ArrowNE from "@/components/ArrowNE";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { AssetShelf, Counters, DriftShot, Filmstrip, Moves, PhoneRail, Reveal } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";
import { EDGE_DARK, EDGE_LIGHT, INK, LINE_DARK, LINE_LIGHT, PAPER } from "./palette";
import { RouteBoard } from "./parts";

/**
 * MashynBazar sells cars from a lot in Dubai to people who will not stand on
 * it — the routes on its own footer globe run 850 to 3,700 km. So the case
 * argues one thing: the site has to do the walk-around. It says so in the
 * dealer's skin — night ink with grain, one signal red, Unbounded — and turns
 * the lights on for the catalogue, the way the dealer's site does.
 */

const p = PROJECTS.find((x) => x.slug === "masynbazar")!;
const TITLE = "MASHYNBAZAR — Vaflet LLC";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/masynbazar" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/masynbazar",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const S = (n: string) => `/photos/masynbazar/${n}.jpg`;

/** The globe's ten cities, great-circle from Dubai, rounded to 50 km as the globe prints them. */
const ROUTES = [
  { city: "Riyadh", km: 850 },
  { city: "Ashgabat", km: 1450 },
  { city: "Baku", km: 1750 },
  { city: "Dushanbe", km: 1950 },
  { city: "Tbilisi", km: 2050 },
  { city: "Tashkent", km: 2200 },
  { city: "Bishkek", km: 2650 },
  { city: "Almaty", km: 2800 },
  { city: "Astana", km: 3200 },
  { city: "Moscow", km: 3700 },
];

/** A buyer's path, in the order they take it. */
const MOVES = [
  {
    kicker: "The catalogue",
    line: "Every card is already a spec sheet",
    src: S("catalog"),
    alt: "The catalogue: search, a brand picker, filters, and cards carrying engine, drive, power, 0–100 and price",
  },
  {
    kicker: "The car",
    line: "The gallery and the sheet, side by side",
    src: S("car"),
    alt: "A Toyota Land Cruiser page: the photo gallery beside the spec tiles, the price above them",
  },
  {
    kicker: "The manager",
    line: "One tap from a car to a conversation",
    src: S("manager"),
    alt: "The manager window over a car page: WhatsApp, Telegram, or a short request that names the car",
  },
];

const STRIP = [
  { src: S("hero-en"), caption: "First screen in English — one toggle in the header" },
  { src: S("catalog-home"), caption: "Home — the showroom, straight after the videos" },
  { src: S("filters"), caption: "Filters — price, year and power on sliders, the rest as chips" },
  { src: S("car-ferrari"), caption: "Car page — a Ferrari 296 GTB on the same sheet" },
  { src: S("car-more"), caption: "Below the sheet — the description, a manager, similar cars" },
  { src: S("services"), caption: "Services — nine lines of work, four until asked" },
  { src: S("advantages"), caption: "Why us — over a backdrop of slow contour lines" },
  { src: S("contact"), caption: "Contacts — the request form and its built-in captcha" },
  { src: S("footer"), caption: "Footer — the wordmark, and the globe that tours the routes" },
];

const PHONES = [
  { src: S("m-hero"), caption: "First screen — the film behind the heading" },
  { src: S("m-menu"), caption: "Menu — sections, search and language in one sheet" },
  { src: S("m-youtube"), caption: "Videos — the newest review first" },
  { src: S("m-catalog"), caption: "Catalogue — one car to a card" },
  { src: S("m-filters"), caption: "Filters — the same sheet, full width" },
  { src: S("m-car"), caption: "Car page — the gallery on top" },
  { src: S("m-car-specs"), caption: "The sheet — tile by tile" },
  { src: S("m-manager"), caption: "Manager — WhatsApp, Telegram or a note" },
  { src: S("m-contact"), caption: "Request — name, phone, captcha" },
  { src: S("m-footer"), caption: "Footer — the globe touring the routes above" },
];

/** The decisions that let the dealer run it without us. */
const RUNS = [
  [
    "Stock",
    "Cars are added in an admin: every spec field, photos dropped in and put in order, a status that hides a sold car, a YouTube link per car.",
  ],
  [
    "Two languages",
    "Russian and English down to the car — titles, specs and descriptions each have both fields, and every line of the interface is edited on a translations screen.",
  ],
  [
    "Requests",
    "The contact form and the manager window land in the dealer’s Telegram. The manager’s WhatsApp and Telegram are set in the admin, not in code.",
  ],
  [
    "Spam",
    "Eight layers stand between a bot and that chat: a signed one-time token, a captcha, a hidden field, an origin check, rate limits, a spam score, duplicate suppression and an audit log. Obvious spam never arrives; doubtful requests arrive flagged.",
  ],
  [
    "Videos",
    "The YouTube section reads the channel’s public pages and feed — no API key to expire — and keeps a copy on disk, so a slow YouTube never leaves it empty.",
  ],
  [
    "Second visits",
    "It installs as an app and keeps its shell, fonts and car photos on the device. When a new build ships, the page offers a one-tap refresh.",
  ],
];

const para = "text-[17px] leading-relaxed opacity-80 md:text-[19px]";

export default function MasynbazarPage() {
  const next = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "masynbazar") + 1) % PROJECTS.length];
  const night = { backgroundColor: INK, color: "#FFFFFF" };
  const day = { backgroundColor: PAPER, color: INK };

  return (
    <main className="mb-case" style={night}>
      {/* ---- the name, the lot at night --------------------------------- */}
      <section className="mb-grain inv pt-32 md:pt-44" style={night}>
        <div className="shell">
          <Link
            href="/work"
            className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:bg-white hover:text-[#0B0B12] hover:no-underline"
          >
            ← All work
          </Link>
          <p className="mb-eyebrow mt-10 opacity-80">Cars from the UAE · Dubai</p>
          <SplitReveal as="h1" onLoad className="display-1 mb-title mt-5">
            MashynBazar
          </SplitReveal>
          <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <p className="max-w-[50ch] text-[17px] leading-relaxed opacity-85 md:text-[19px]">{p.desc}</p>
            {/* each service stays whole — a phone would otherwise break E-commerce at its hyphen */}
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-60">
              {p.services.split(" · ").map((s, i) => (
                <Fragment key={s}>
                  {i > 0 && " · "}
                  <span className="whitespace-nowrap">{s}</span>
                </Fragment>
              ))}
            </p>
          </div>
        </div>

        <div className="mt-12 px-5 md:mt-16 md:px-10">
          <DriftShot
            src={S("hero")}
            alt="MashynBazar first screen: “Find your perfect car” over a film of a car lit red in a dark hall"
            className="aspect-[16/10] w-full"
            priority
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ boxShadow: `inset 0 0 0 1px ${EDGE_DARK}` }}
            />
          </DriftShot>
        </div>
      </section>

      {/* ---- the brief --------------------------------------------------- */}
      <section className="inv shell py-24 md:py-36" style={night}>
        <p className="mb-eyebrow">The brief</p>
        <SplitReveal className="display-2 mt-8 max-w-[17ch] leading-[1.06]">
          A showroom for buyers who never walk the lot
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              MashynBazar sells new and used cars from a lot in Al Quoz,
              Dubai’s industrial quarter, and ships them on to Almaty, Tashkent,
              Baku, Moscow and Riyadh.
            </p>
            <p className={para}>
              A buyer there cannot kick the tyres. What they have is the
              dealer’s reviews on YouTube, a stack of photos, a manager on
              WhatsApp — and a few thousand kilometres between them and the car.
            </p>
            <p className={para}>
              So the site does the walk-around. The film makes the car wanted,
              the catalogue answers what the lot would, and a manager is one tap
              from any car.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- the routes -------------------------------------------------- */}
      <section className="inv shell pb-24 md:pb-36" style={night}>
        <p className="mb-eyebrow">From Dubai to your city</p>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] leading-[1.06]">
          The short trip is 850&nbsp;km
        </SplitReveal>
        <p className="mt-8 max-w-[44ch] text-[15px] leading-relaxed opacity-70 md:text-[17px]">
          The ten cities the globe in the site’s footer tours, measured from the
          lot the way the globe measures them: great-circle distance, rounded to
          50&nbsp;km.
        </p>
        <div
          className="mt-14 rounded-[1.25rem] px-6 py-8 md:mt-20 md:rounded-[2rem] md:px-14 md:py-12"
          style={{ boxShadow: `inset 0 0 0 1px ${LINE_DARK}` }}
        >
          <RouteBoard routes={ROUTES} />
        </div>
      </section>

      {/* ---- the lights come on ------------------------------------------ */}
      <section className="shell pt-24 md:pt-36" style={day}>
        <p className="mb-eyebrow">The lights come on</p>
        <SplitReveal className="display-2 mt-8 max-w-[17ch] leading-[1.06]">
          The catalogue answers what the lot would
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              The first screen is a film: one car under red light in a dark
              hall. Everything after it is daylight — white cards, grey chips,
              and red only where something matters.
            </p>
            <p className={para}>
              Each card carries what a buyer would ask on the lot: engine,
              drive, power, 0–100 and the price in dollars, before anything is
              opened.
            </p>
            <p className={para}>
              Open a car and the gallery stands beside its spec tiles, the price
              above them and a manager one tap below — so nothing needs asking
              twice.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="shell pb-20 md:pb-32" style={day}>
        <Moves moves={MOVES} edge={EDGE_LIGHT} />
      </section>

      {/* ---- the audience it already had --------------------------------- */}
      <section className="shell pb-24 pt-16 md:pb-36 md:pt-24" style={{ ...day, borderTop: `1px solid ${LINE_LIGHT}` }}>
        <p className="mb-eyebrow">Before the catalogue</p>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] leading-[1.06]">
          The dealer already had an audience
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              MashynBazar films the market from its own lot — reviews, prices,
              test drives — for a Russian-speaking channel of 84 thousand
              subscribers.
            </p>
            <p className={para}>
              So the home page does not link away to it. The newest review, the
              long videos and the Shorts sit right under the first screen, and
              play without leaving the site.
            </p>
            <p className={para}>
              People who came for a video stay for the cars: the catalogue
              starts where the Shorts end.
            </p>
          </div>
        </Reveal>
        <div className="mt-14 md:mt-20">
          <AssetShelf
            plain
            ratio="aspect-[16/10]"
            edge={EDGE_LIGHT}
            items={[
              { src: S("youtube"), title: "Latest", note: "The newest review up front, the channel beside it" },
              { src: S("youtube-more"), title: "Shorts", note: "Long videos in a row, Shorts in a row under them" },
            ]}
          />
        </div>
      </section>

      {/* ---- the site, dragged past -------------------------------------- */}
      <section style={{ ...day, borderTop: `1px solid ${LINE_LIGHT}` }}>
        <p className="mb-eyebrow shell pt-16 md:pt-24">The site, section by section</p>
        <Filmstrip shots={STRIP} edge={EDGE_LIGHT} />
      </section>

      {/* ---- in a hand --------------------------------------------------- */}
      <section className="inv" style={night}>
        <div className="shell flex flex-wrap items-baseline justify-between gap-4 pt-16 md:pt-24">
          <p className="mb-eyebrow">On a phone</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-60">
            390 px · one column · the manager a thumb away
          </p>
        </div>
        <PhoneRail shots={PHONES} edge={EDGE_DARK} />
      </section>

      {/* ---- how it runs ------------------------------------------------- */}
      <section className="inv shell py-20 md:py-32" style={{ ...night, borderTop: `1px solid ${LINE_DARK}` }}>
        <p className="mb-eyebrow">How it runs</p>
        <SplitReveal className="display-2 mt-8 max-w-[15ch] leading-[1.06]">
          Built for the dealer to run alone
        </SplitReveal>
        <div className="mt-14 md:mt-20">
          <AssetShelf
            plain
            ratio="aspect-[16/10]"
            edge={EDGE_DARK}
            items={[
              { src: S("admin-cars"), title: "Stock", note: "Every car with its photo, price and status", wide: true },
              { src: S("admin-editor"), title: "A car", note: "Russian and English fields, specs, photos, video" },
              { src: S("admin-translations"), title: "Translations", note: "Every line of the interface, in both languages" },
            ]}
          />
        </div>
        <div className="mt-16 md:mt-24">
          <Reveal y={18} stagger={0.06}>
            {RUNS.map(([title, note]) => (
              <div
                key={title}
                className="grid gap-2 py-7 md:grid-cols-[22%_1fr] md:gap-10"
                style={{ borderTop: `1px solid ${LINE_DARK}` }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{title}</p>
                <p className="max-w-[64ch] text-[17px] leading-relaxed opacity-85 md:text-[19px]">{note}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---- the count, and what came out -------------------------------- */}
      <section className="inv shell pb-24 pt-6 md:pb-32 md:pt-10" style={night}>
        <Counters
          items={p.facts ?? []}
          className="grid gap-px md:grid-cols-3"
          itemClassName="py-10 md:py-16"
          labelClassName="mt-4 max-w-[24ch] text-[11px] font-bold uppercase leading-relaxed tracking-[0.18em] opacity-60"
        />
        <Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <p className="display-3 max-w-[14ch] leading-[1.05]">What came out</p>
            <div className="flex flex-col gap-4 md:col-span-2">
              {p.outcome.map((line) => (
                <p
                  key={line}
                  className="pb-4 text-[17px] leading-relaxed md:text-[19px]"
                  style={{ borderBottom: `1px solid ${LINE_DARK}` }}
                >
                  {line}
                </p>
              ))}
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] opacity-60">{p.stack}</p>
              <a
                href="https://masynbazar.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-eyebrow mt-4 self-start pb-1"
              >
                masynbazar.com <ArrowNE />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out --------------------------------------------------------- */}
      <section className="inv shell pb-24 md:pb-32" style={night}>
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
          <span className="block text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[450ms] group-hover:text-[#0B0B12]">
            Next project
          </span>
          <span className="display-2 mt-2 flex items-baseline gap-5 leading-[1.0] transition-colors duration-[450ms] group-hover:text-[#0B0B12]">
            <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
              {next.title}
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
