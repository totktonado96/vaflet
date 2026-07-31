import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { AssetShelf, ColorWall, Counters, PatternDrift, Reveal, type Swatch } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";
import { GradientRail } from "./story";

/**
 * Mirai is an identity, so the case wears it: the brand's own black, its lime
 * and green, its gradients and its pattern run the page. Nothing here is the
 * shared template — a brand book deserves to be read in its own colours.
 */

const p = PROJECTS.find((x) => x.slug === "mirai")!;
const TITLE = "MIRAI — Vaflet LLC";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/mirai" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/mirai",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const INK = "#FFFFF0";
const BLACK = "#0F1E14";

const SWATCHES: Swatch[] = [
  { name: "Mirai Lime", hex: "#E1FF00", rgb: "225 255 0", cmyk: "16 0 100 0", ink: BLACK },
  { name: "Mirai Green", hex: "#2DFF4B", rgb: "45 255 75", cmyk: "70 0 100 0", ink: BLACK },
  { name: "Mirai Black", hex: "#0F1E14", rgb: "15 30 20", cmyk: "76 58 72 78", ink: INK },
  { name: "Mirai Ivory", hex: "#FFFFF0", rgb: "255 255 240", cmyk: "0 0 6 0", ink: BLACK },
  { name: "Mirai Verdant", hex: "#148C46", rgb: "20 140 70", cmyk: "85 20 95 5", ink: INK },
  { name: "Mirai Amber", hex: "#FFB414", rgb: "255 180 20", cmyk: "0 32 100 0", ink: BLACK },
  { name: "Mirai Blue", hex: "#008CFF", rgb: "0 140 255", cmyk: "80 35 0 0", ink: INK },
  { name: "Mirai Red", hex: "#FA3246", rgb: "250 50 70", cmyk: "0 92 72 0", ink: INK },
];

const GRADIENTS = [
  { src: "/photos/mirai/gradient-1a.jpg", label: "Set 1 · 1a", note: "Lime into Green — freshness, clarity" },
  { src: "/photos/mirai/gradient-1b.jpg", label: "Set 1 · 1b", note: "The same air, turned" },
  { src: "/photos/mirai/gradient-2a.jpg", label: "Set 2 · 2a", note: "Black with Verdant — depth, contrast" },
  { src: "/photos/mirai/gradient-2b.jpg", label: "Set 2 · 2b", note: "For immersive, bold surfaces" },
];

const ASSETS = [
  { src: "/photos/mirai/card.jpg", title: "Business card", note: "Employee and corporate fronts" },
  { src: "/photos/mirai/letterhead.jpg", title: "Letterhead", note: "A4, first page and subsequent" },
  { src: "/photos/mirai/shipping-box.jpg", title: "Shipping box", note: "Dieline with tape alignment", wide: true },
  { src: "/photos/mirai/product-box.jpg", title: "Product box", note: "Smart Lock, premium black" },
  { src: "/photos/mirai/tape.jpg", title: "Tape", note: "Repeating mark, cut anywhere" },
];

const TYPE_PAGES = [
  { src: "/photos/mirai/type-screen.jpg", title: "Typeface for screen — NexaText" },
  { src: "/photos/mirai/type-print.jpg", title: "Typeface for print — Merriweather" },
  { src: "/photos/mirai/type-scale.jpg", title: "Hierarchy & sizing" },
];

export default function MiraiPage() {
  const next = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "mirai") + 1) % PROJECTS.length];

  return (
    <main style={{ backgroundColor: BLACK, color: INK }} className="inv">
      {/* ---- the mark, at the size it deserves ------------------------- */}
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src="/photos/mirai/gradient-2b.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-90"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BLACK}cc 0%, ${BLACK}22 45%, ${BLACK} 100%)` }}
        />
        <div className="shell relative flex min-h-[92vh] flex-col justify-between pb-14 pt-32 md:pb-20 md:pt-44">
          <Link
            href="/work"
            className="self-start text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4"
            style={{ color: INK }}
          >
            ← All work
          </Link>

          <div>
            <div className="relative h-[68px] w-[min(78vw,560px)] md:h-[104px] md:w-[min(52vw,820px)]">
              <Image
                src="/photos/mirai/logo-on-dark.svg"
                alt="Mirai"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
            <p className="mt-8 max-w-[46ch] text-[17px] font-light leading-relaxed md:text-[19px]">
              {p.desc}
            </p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] opacity-70">
              {p.services}
            </p>
          </div>
        </div>
      </section>

      {/* ---- what the name carries ------------------------------------- */}
      <section className="shell py-28 md:py-40">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "#E1FF00" }}>
          01 — The name
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] font-extrabold uppercase leading-[1.0]">
          Mirai means future
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className="text-[17px] font-light leading-relaxed opacity-85 md:text-[19px]">
              A smart-home company needed an identity that could sit on a
              product box, a delivery van and a phone screen without ever
              looking like three different companies.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-85 md:text-[19px]">
              We built the mark from one geometric frame, then derived
              everything from it — the logomark, the pattern, the way the
              gradients move.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-85 md:text-[19px]">
              The result is a system, not a logo: a 39-page book that tells a
              designer, a marketer and a factory exactly what to do.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- the lockups ----------------------------------------------- */}
      <section className="shell pb-24 md:pb-36">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">
          02 — The mark
        </p>
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          <div className="relative col-span-1 flex aspect-[16/9] items-center justify-center rounded-[1rem] border border-white/15 p-8 md:col-span-2 md:rounded-[1.5rem] md:p-14">
            <Image
              src="/photos/mirai/logo-slogan.svg"
              alt="Mirai logo with slogan"
              width={720}
              height={220}
              className="h-auto w-full max-w-[520px] object-contain"
            />
          </div>
          <div
            className="flex aspect-[16/9] items-center justify-center rounded-[1rem] p-10 md:aspect-auto md:rounded-[1.5rem]"
            style={{ backgroundColor: "#E1FF00" }}
          >
            <Image
              src="/photos/mirai/logomark-black.svg"
              alt="Mirai logomark"
              width={220}
              height={220}
              className="h-auto w-[38%] object-contain md:w-[46%]"
            />
          </div>
        </div>
        <p className="mt-6 max-w-[60ch] text-[15px] font-light leading-relaxed opacity-75">
          Four lockups — horizontal, with slogan, vertical, and the mark alone —
          with clear space measured by the symbol itself and minimum sizes down
          to 40&nbsp;px on screen.
        </p>
      </section>

      {/* ---- colour takes the room ------------------------------------- */}
      <section className="shell pb-24 md:pb-32">
        <ColorWall swatches={SWATCHES} />
      </section>

      {/* ---- gradients, dragged past --------------------------------- */}
      <section>
        <p className="shell text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">
          04 — Gradients
        </p>
        <GradientRail items={GRADIENTS} />
        <p className="shell max-w-[60ch] pb-16 text-[15px] font-light leading-relaxed opacity-75">
          Height is fixed, width is free: crop a gradient sideways to fit any
          format, never stretch it. Two sets — light for energy, dark for depth.
        </p>
      </section>

      {/* ---- type -------------------------------------------------------- */}
      <section className="shell pb-24 md:pb-36">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">
          05 — Typography
        </p>
        {/* Set in the brand's own faces, so the spreads come straight out of
            the book rather than being re-typeset in ours. */}
        <Reveal y={18} stagger={0.06}>
          {TYPE_PAGES.map((t) => (
            <figure key={t.src} className="mt-10 first:mt-12 md:mt-14">
              <div className="relative aspect-[297/210] w-full overflow-hidden rounded-[1rem] md:rounded-[1.5rem]">
                <Image
                  src={t.src}
                  alt={t.title}
                  fill
                  sizes="(min-width: 768px) 90vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] opacity-70">
                {t.title}
              </figcaption>
            </figure>
          ))}
        </Reveal>
        <p className="mt-8 max-w-[60ch] text-[15px] font-light leading-relaxed opacity-75">
          NexaText carries the screen, Merriweather carries print — one
          geometric, one classical, both cut to the same hierarchy so a letter
          and a landing page speak with one voice.
        </p>
      </section>

      {/* ---- pattern ----------------------------------------------------- */}
      <section className="shell pb-24 md:pb-36">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">
          06 — Pattern
        </p>
        <div className="mt-10 md:mt-14">
          <PatternDrift
            src="/photos/mirai/pattern-dark.jpg"
            alt="Mirai pattern, dark version"
          />
        </div>
        <p className="mt-6 max-w-[60ch] text-[15px] font-light leading-relaxed opacity-75">
          The pattern is the symbol&rsquo;s own frame, repeated. It goes on
          solid colour only — never over an image, never rotated, never louder
          than the logo standing on it.
        </p>
      </section>

      {/* ---- it exists in the world -------------------------------------- */}
      <section className="shell pb-24 md:pb-36">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">
          07 — Applications
        </p>
        <div className="mt-10 md:mt-14">
          <AssetShelf items={ASSETS} />
        </div>
      </section>

      {/* ---- what shipped ------------------------------------------------- */}
      <section className="shell pb-24 md:pb-32">
        <Counters
          items={p.facts ?? []}
          className="grid gap-px border-y border-white/20 md:grid-cols-3"
          itemClassName="py-10 md:py-16"
          labelClassName="mt-4 max-w-[22ch] text-[11px] font-bold uppercase leading-snug tracking-[0.2em] opacity-60"
        />
        <Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <p className="display-3 max-w-[14ch] font-extrabold uppercase leading-[1.05]">
              Handed over
            </p>
            <div className="flex flex-col gap-4 md:col-span-2">
              {p.outcome.map((line) => (
                <p
                  key={line}
                  className="border-b border-white/15 pb-4 text-[17px] font-light leading-relaxed md:text-[19px]"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out ---------------------------------------------------------- */}
      <section className="shell pb-24 md:pb-32">
        <Link
          href={`/work/${next.slug}`}
          className="group block border-t pt-8"
          style={{ borderColor: INK }}
          data-cursor-text="Next"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            Next project
          </span>
          <span className="display-2 mt-2 flex items-baseline gap-5 font-extrabold uppercase leading-[1.0]">
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
