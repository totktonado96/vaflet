import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { Counters, DriftShot, Filmstrip, Moves, PhoneRail, Reveal } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";
import { BONE, EDGE, GOLD, INK, LINE } from "./palette";
import { Crest, LightsWipe, Manifest } from "./parts";

/**
 * Sada Suw is opened from a country where a foreign domain does not fail, it
 * hangs — so the case argues one thing: everything the page needs comes from
 * its own address. It says so in the plant's own skin: ink, gold hairlines,
 * Prata, and the seigaiha wave across the top.
 */

const p = PROJECTS.find((x) => x.slug === "sadasuw")!;
const TITLE = "SADA SUW — Vaflet LLC";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/sadasuw" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/sadasuw",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const S = (n: string) => `/photos/sadasuw/${n}.jpg`;

/** One visit to /en, scrolled top to bottom, every finished request sorted by kind. */
const MANIFEST = [
  { label: "Type", note: "Prata, Manrope, Unbounded and IBM Plex Mono", files: 7, bytes: 126804 },
  { label: "Film", note: "The factory floor behind the first screen", files: 1, bytes: 633870 },
  { label: "Stills", note: "Posters for both films", files: 2, bytes: 74828 },
  { label: "Bottles", note: "The eleven flavours, in AVIF", files: 13, bytes: 147643 },
];

const MOVES = [
  {
    kicker: "The range",
    line: "Specs stay off the shelf until the plant signs them",
    src: S("catalog"),
    alt: "The ELLE range: a card per flavour, a bottle and a note on each",
  },
  {
    kicker: "The bottles",
    line: "Three bottles, drawn instead of photographed",
    src: S("formats"),
    alt: "Packaging formats: the 0.25, 0.5 and 1 litre bottles as line drawings",
  },
  {
    kicker: "The line",
    line: "From orchard to bottle in four steps",
    src: S("line"),
    alt: "Production: four steps from intake to quality control, above the plant’s film",
  },
];

const STRIP = [
  { src: S("about"), caption: "Company — the plant in its own words, its figures under them" },
  { src: S("catalog-more"), caption: "Range — each flavour lit in its own colour" },
  { src: S("formats-light"), caption: "Formats — the same drawings on the catalogue’s paper" },
  { src: S("film"), caption: "Production — the plant’s film, framed to its own proportions" },
  { src: S("export"), caption: "Export — the markets as a numbered list, not a scatter of pills" },
  { src: S("contact-light"), caption: "Contacts — the price request, on paper" },
];

const PHONES = [
  { src: S("m-hero"), caption: "First screen — the flavours turn under the heading" },
  { src: S("m-menu"), caption: "Menu — sections, language and theme in one sheet" },
  { src: S("m-catalog"), caption: "Range — one flavour to a card" },
  { src: S("m-about"), caption: "Company — the story, then the figures" },
  { src: S("m-formats"), caption: "Formats — one bottle at a time" },
  { src: S("m-line"), caption: "Production — four steps, top to bottom" },
  { src: S("m-export"), caption: "Export — eight markets, numbered" },
  { src: S("m-contact"), caption: "Contacts — every number is a tap away" },
  { src: S("m-hero-light"), caption: "The light theme, in a hand" },
];

/** The decisions that let it open on a slow line and run without us. */
const RUNS = [
  [
    "One address",
    "Fonts, film, pictures and scripts all come from the site’s own server. A script walks the live pages in all three languages and names any file that would load from somewhere else.",
  ],
  [
    "Cached on purpose",
    "The page is built once and served from cache; saving in the admin is what rebuilds it. A second check guards that, because one read of a cookie would quietly send every visitor to the database.",
  ],
  [
    "No captcha",
    "reCAPTCHA and Turnstile load from google.com and cloudflare.com. Spam is stopped by a hidden field, a timing check and the message itself.",
  ],
  [
    "Price requests",
    "Every request is saved first and sent to the plant’s Telegram second, and the admin shows whether that message actually went out.",
  ],
  [
    "Three languages",
    "Russian, English and Turkmen. An untranslated field falls back to Russian and the page still looks whole, so the admin’s first screen lists every gap by name.",
  ],
  [
    "Backups",
    "One command copies the database and the photos. A drill restores the copy into a scratch database and counts the records — a backup nobody has restored is not a backup.",
  ],
];

const para = "text-[17px] leading-relaxed opacity-80 md:text-[19px]";

export default function SadaSuwPage() {
  const next = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "sadasuw") + 1) % PROJECTS.length];

  return (
    <main className="sada-case inv" style={{ backgroundColor: INK, color: BONE }}>
      {/* ---- the wave, the name, the site ------------------------------- */}
      <section className="relative pt-32 md:pt-44">
        {/* the plant's own site opens under this wave, so the case does too */}
        <Crest className="pointer-events-none absolute left-0 top-0 h-[22rem] w-full md:h-[32rem]" />
        <div className="shell relative">
          <Link
            href="/work"
            className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:bg-[#EDE6D6] hover:text-[#07070A] hover:no-underline"
          >
            ← All work
          </Link>
          <p className="sada-mono mt-10" style={{ color: GOLD }}>
            Türkmenistan · Ahal welaýaty · since&nbsp;2011
          </p>
          {/* Prata's ascenders stand taller than its caps; below ~1.05 the
              line mask of the reveal shaves the tops off the S and the d */}
          <SplitReveal as="h1" onLoad className="display-1 sada-title mt-4 leading-[1.08]">
            Sada Suw
          </SplitReveal>
          <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <p className="max-w-[48ch] text-[17px] leading-relaxed md:text-[19px]">{p.desc}</p>
            <p className="sada-mono" style={{ color: GOLD }}>
              {p.services}
            </p>
          </div>
        </div>

        <div className="relative mt-12 px-5 md:mt-16 md:px-10">
          <DriftShot
            src={S("hero")}
            alt="Sada Suw first screen: Gowy hilli, tebigy tagam, and the orange bottles beside it"
            className="aspect-[16/10] w-full"
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

      {/* ---- the brief: a border the internet stops at ------------------ */}
      <section className="shell py-24 md:py-36">
        <p className="sada-mono" style={{ color: GOLD }}>
          The brief
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] leading-[1.08]">
          The page has to open <em>where the internet stops</em>
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              Sada Suw presses fruit and vegetable juice in the Ahal region and
              ships it by the pallet under ELLE and ILKENT, across Turkmenistan
              and abroad.
            </p>
            <p className={para}>
              Its buyers open the site from a country where a foreign domain
              does not fail with an error. A Google font or a CDN script simply
              never arrives, and the page waits for it.
            </p>
            <p className={para}>
              So the site asks nothing of anybody else. Every font, film and
              bottle is served from its own address, and a check walks the live
              pages to catch anything that sneaks in.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- the packing list ------------------------------------------- */}
      <section className="shell pb-24 md:pb-36">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <p className="sada-mono" style={{ color: GOLD }}>
              What the page asks for
            </p>
            <SplitReveal className="display-2 mt-8 max-w-[15ch] leading-[1.08]">
              Everything it loads comes from <em>one address</em>
            </SplitReveal>
          </div>
          <p className="max-w-[34ch] text-[15px] leading-relaxed opacity-70">
            Recorded on one visit to the English page, scrolled from top to
            bottom. Every dot is a font, a film or a picture the browser fetched.
          </p>
        </div>
        <div
          className="mt-14 rounded-[1.25rem] px-6 py-10 md:mt-20 md:rounded-[2rem] md:px-14 md:py-14"
          style={{ boxShadow: `inset 0 0 0 1px ${LINE}` }}
        >
          <Manifest
            lines={MANIFEST}
            page={{
              label: "Page",
              note: "The page itself, its styles and its scripts — built and served by the site",
            }}
            elsewhere="files from any other address. No Google Fonts, no CDN, no captcha."
          />
        </div>
      </section>

      {/* ---- three moves, the shot beside each -------------------------- */}
      <section className="shell pb-20 md:pb-32">
        <Moves moves={MOVES} edge={EDGE} />
      </section>

      {/* ---- two lights ------------------------------------------------- */}
      <section className="shell py-24 md:py-36" style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="sada-mono" style={{ color: GOLD }}>
          Two themes
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[17ch] leading-[1.08]">
          The light theme is the catalogue’s paper, <em>not an inversion</em>
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              The site opens dark, like a shelf lit from inside. One button in
              the header turns the lights on.
            </p>
            <p className={para}>
              What comes up is not the same page flipped. It has a palette of
              its own taken from the printed catalogue, its own pattern, and a
              softer glow behind each flavour.
            </p>
            <p className={para}>
              The choice is kept in the browser rather than in a cookie — a
              cookie would make the page dynamic, and a cached page is what
              opens fast on a slow line.
            </p>
          </div>
        </Reveal>
        <div className="mt-14 md:mt-20">
          <LightsWipe
            dark={{ src: S("hero"), alt: "The first screen in the dark theme" }}
            light={{ src: S("hero-light"), alt: "The first screen in the light theme" }}
          />
        </div>
      </section>

      {/* ---- the page, dragged past ------------------------------------- */}
      <section style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="sada-mono shell pt-16 md:pt-24" style={{ color: GOLD }}>
          The page, section by section
        </p>
        <Filmstrip shots={STRIP} edge={EDGE} />
      </section>

      {/* ---- in a hand -------------------------------------------------- */}
      <section style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="shell flex flex-wrap items-baseline justify-between gap-4 pt-16 md:pt-24">
          <p className="sada-mono" style={{ color: GOLD }}>
            On a phone
          </p>
          <p className="sada-mono opacity-60">390 px · one sheet for the menu · one column</p>
        </div>
        <PhoneRail shots={PHONES} edge={EDGE} />
      </section>

      {/* ---- how it runs ------------------------------------------------ */}
      <section className="shell py-20 md:py-32" style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="sada-mono" style={{ color: GOLD }}>
          How it runs
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] leading-[1.08]">
          Built to be run by <em>the plant</em>
        </SplitReveal>
        <Reveal y={18} stagger={0.06}>
          {RUNS.map(([title, note]) => (
            <div
              key={title}
              className="grid gap-2 py-7 md:grid-cols-[22%_1fr] md:gap-10"
              style={{ borderTop: `1px solid ${LINE}` }}
            >
              <p className="sada-mono">{title}</p>
              <p className="max-w-[64ch] text-[17px] leading-relaxed opacity-85 md:text-[19px]">
                {note}
              </p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---- the count, and what came out ------------------------------- */}
      <section className="shell pb-24 pt-6 md:pb-32 md:pt-10">
        <Counters
          items={p.facts ?? []}
          className="grid gap-px md:grid-cols-3"
          itemClassName="py-10 md:py-16"
          labelClassName="sada-mono mt-4 max-w-[24ch] opacity-60"
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
              <p className="sada-mono mt-2 opacity-60">{p.stack}</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out -------------------------------------------------------- */}
      <section className="shell pb-24 md:pb-32">
        <Link
          href={`/work/${next.slug}`}
          className="group relative isolate block overflow-hidden pb-6 pt-8 md:pb-8"
          style={{ borderTop: `2px solid ${BONE}` }}
          data-cursor-text={next.title}
        >
          {/* the ink rises and the reader leaves — same exit on every case */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
            style={{ backgroundColor: BONE }}
          />
          <span className="block text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[450ms] group-hover:text-[#07070A]">
            Next project
          </span>
          <span className="display-2 mt-2 flex items-baseline gap-5 leading-[1.0] transition-colors duration-[450ms] group-hover:text-[#07070A]">
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
