import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ArrowNE from "@/components/ArrowNE";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import {
  AssetShelf,
  ColorWall,
  Counters,
  Filmstrip,
  PatternDrift,
  Reveal,
  type Swatch,
} from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";

/**
 * Aydym streams music, and its book is loud about it — Cosmic Violet on near
 * black, a mark that doubles as a play button, neon photography. The case runs
 * in those colours rather than ours.
 */

const p = PROJECTS.find((x) => x.slug === "aydym")!;
const TITLE = "AYDYM — Vaflet LLC";

const INK = "#FFFFFF";
const BLACK = "#111111";
const VIOLET = "#B56CF4";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/aydym" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/aydym",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const SWATCHES: Swatch[] = [
  { name: "Cosmic Violet", hex: "#B56CF4", rgb: "181 108 244", cmyk: "primary", ink: BLACK },
  { name: "Black", hex: "#111111", rgb: "17 17 17", cmyk: "HSL 0 0 7", ink: INK },
  { name: "White", hex: "#FFFFFF", rgb: "255 255 255", cmyk: "HSL 0 0 100", ink: BLACK },
  { name: "Positive", hex: "#FFD633", rgb: "255 214 51", cmyk: "secondary", ink: BLACK },
  { name: "Friendly", hex: "#33CC80", rgb: "51 204 128", cmyk: "secondary", ink: BLACK },
  { name: "Smart", hex: "#1A5AFF", rgb: "26 90 255", cmyk: "secondary", ink: INK },
];

const SYSTEM = [
  { src: "/photos/aydym/logo.jpg", caption: "Master logo — mark and wordmark" },
  { src: "/photos/aydym/symbol.jpg", caption: "The symbol, taken apart" },
  { src: "/photos/aydym/scale.jpg", caption: "Scale — 128 down to 32 px" },
  { src: "/photos/aydym/colorways.jpg", caption: "Colourways on every ground" },
  { src: "/photos/aydym/type-sf.jpg", caption: "SF Pro Display — the voice on screen" },
  { src: "/photos/aydym/type-hierarchy.jpg", caption: "Hierarchy, display to caption" },
  { src: "/photos/aydym/icons.jpg", caption: "Phosphor, cut to the brand's weight" },
];

const APPLIED = [
  { src: "/photos/aydym/social.jpg", title: "Social", note: "Posts and profile, in the app's own dark" },
  { src: "/photos/aydym/giftcards.jpg", title: "Gift cards & roll-up", note: "Gradients doing the shouting" },
  { src: "/photos/aydym/cards.jpg", title: "Business cards", note: "Violet front, quiet back" },
  { src: "/photos/aydym/stationery.jpg", title: "Stationery", note: "Bag and paper" },
  { src: "/photos/aydym/tote.jpg", title: "Tote", note: "Three grounds, one mark" },
  { src: "/photos/aydym/cap.jpg", title: "Merch", note: "Worn outside, still legible" },
];

export default function AydymPage() {
  const next = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "aydym") + 1) % PROJECTS.length];

  return (
    <main className="inv" style={{ backgroundColor: BLACK, color: INK }}>
      {/* ---- the platform, in its own violet --------------------------- */}
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src="/photos/aydym/hero-photo.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BLACK}dd 0%, ${BLACK}55 40%, ${BLACK} 100%)` }}
        />
        <div className="shell relative flex min-h-[92vh] flex-col justify-between pb-14 pt-32 md:pb-20 md:pt-44">
          <Link
            href="/work"
            className="self-start text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4"
          >
            ← All work
          </Link>
          <div>
            <SplitReveal
              as="h1"
              onLoad
              className="display-1 font-extrabold uppercase leading-[0.92]"
            >
              Aydym
            </SplitReveal>
            <p className="mt-8 max-w-[48ch] text-[17px] font-light leading-relaxed md:text-[19px]">
              {p.desc}
            </p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] opacity-70">
              {p.services}
            </p>
          </div>
        </div>
      </section>

      {/* ---- what the mark carries ------------------------------------- */}
      <section className="shell py-28 md:py-40">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: VIOLET }}>
          01 — The mark
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[18ch] font-extrabold uppercase leading-[1.0]">
          A circle that is also a play button
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className="text-[17px] font-light leading-relaxed opacity-85 md:text-[19px]">
              The circle stands for integrity and for the infinity of listening
              — and reads as the button every music app is judged by.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-85 md:text-[19px]">
              The vertical bars inside are sound: rhythm, waveform, the range of
              genres the platform carries.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-85 md:text-[19px]">
              Their symmetry is the balance the product promises — clarity in
              something as unruly as a music library.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 md:mt-20">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1rem] md:rounded-[1.5rem]">
            <Image
              src="/photos/aydym/symbol.jpg"
              alt="The Aydym symbol explained: circle, vertical bars, symmetry"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---- colour ------------------------------------------------------ */}
      <section className="shell pb-24 md:pb-32">
        <ColorWall swatches={SWATCHES} />
        <p className="mt-8 max-w-[62ch] text-[15px] font-light leading-relaxed opacity-75">
          Cosmic Violet leads, black carries the room — the dark theme is not a
          mode here, it is the brand. The other three are states, not decoration:
          positive, friendly, smart.
        </p>
      </section>

      {/* ---- the system, dragged past ---------------------------------- */}
      <section className="border-t border-white/15">
        <p className="shell pt-16 text-[11px] font-bold uppercase tracking-[0.3em] opacity-70 md:pt-24">
          02 — The system, page by page
        </p>
        <Filmstrip shots={SYSTEM} ratio="aspect-[16/9]" />
      </section>

      {/* ---- pattern ------------------------------------------------------ */}
      <section className="shell pb-24 md:pb-36">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">
          03 — Pattern
        </p>
        <div className="mt-10 md:mt-14">
          <PatternDrift
            src="/photos/aydym/pattern.jpg"
            alt="Aydym pattern: diagonal bars drawn from the symbol"
          />
        </div>
        <p className="mt-6 max-w-[60ch] text-[15px] font-light leading-relaxed opacity-75">
          The bars of the symbol laid on their side and repeated — a texture that
          belongs to the mark instead of being borrowed from a library.
        </p>
      </section>

      {/* ---- applications ------------------------------------------------ */}
      <section className="shell pb-24 md:pb-36">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">
          04 — Out in the world
        </p>
        <div className="mt-10 md:mt-14">
          <AssetShelf items={APPLIED} plain ratio="aspect-[16/9]" />
        </div>
      </section>

      {/* ---- what shipped -------------------------------------------------- */}
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
              <a
                href="https://aydym.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 self-start border-b-2 pb-1 text-[11px] font-bold uppercase tracking-[0.25em]"
                style={{ borderColor: VIOLET }}
              >
                aydym.com <ArrowNE />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out ------------------------------------------------------------ */}
      <section className="shell pb-24 md:pb-32">
        <Link
          href={`/work/${next.slug}`}
          className="group relative isolate block overflow-hidden border-t pb-6 pt-8 md:pb-8"
          style={{ borderColor: INK }}
          data-cursor-text={next.title}
        >
          {/* the ink rises and the reader leaves — same exit on every case */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-white transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
          />
          <span className="block text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[450ms] group-hover:text-[#111111]">
            Next project
          </span>
          <span className="display-2 mt-2 flex items-baseline gap-5 font-extrabold uppercase leading-[1.0] transition-colors duration-[450ms] group-hover:text-[#111111]">
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
