import type { Metadata } from "next";
import Link from "next/link";
import ArrowNE from "@/components/ArrowNE";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { DriftShot, Filmstrip, Moves, Reveal } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";

/**
 * MashynBazar sells cars out of Dubai on two surfaces that could not look less
 * alike — a night-lit showroom and a daylight catalogue — so the case runs the
 * same way: it opens in the dark and turns the lights on halfway through.
 */

const p = PROJECTS.find((x) => x.slug === "masynbazar")!;
const TITLE = "MASHYNBAZAR — Vaflet LLC";
const ACCENT = "#FF3D00";

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

const MOVES = [
  {
    kicker: "The dark",
    line: "The showroom sells at night",
    src: "/photos/masynbazar/hero-v2.jpg",
    alt: "MashynBazar landing: a car lit red in a dark hall",
  },
  {
    kicker: "The light",
    line: "The catalogue sells by daylight",
    src: "/photos/masynbazar/catalog.jpg",
    alt: "MashynBazar catalogue: cards with specs on a pale surface",
  },
  {
    kicker: "The car",
    line: "Every car carries its own spec sheet",
    src: "/photos/masynbazar/car.jpg",
    alt: "A car page: speed, 0-100, power, engine, drive, mileage, condition, price",
  },
];

const STRIP = [
  { src: "/photos/masynbazar/hero-v2.jpg", caption: "Landing — find your car" },
  { src: "/photos/masynbazar/catalog.jpg", caption: "Catalogue — search, brands, filters" },
  { src: "/photos/masynbazar/car.jpg", caption: "Car page — the spec sheet, tile by tile" },
];

const BUILT = [
  ["Landing", "A dark hall, one car under red light, two ways in: catalogue or call."],
  ["Catalogue", "Cards that carry the spec sheet — engine, drive, power, 0–100, price."],
  ["Finding", "Search by name or tag, a brand picker and filters over the whole showroom."],
  ["Car page", "Speed, 0–100, power, engine, drive, mileage, condition — and every photo the dealer shot."],
  ["Services & contact", "What they do for a buyer abroad, and every way to reach them."],
  ["Language", "Built to switch — the site ships with a language toggle in the header."],
];

export default function MasynbazarPage() {
  const next = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "masynbazar") + 1) % PROJECTS.length];

  return (
    <main className="inv bg-black text-white">
      {/* ---- night ------------------------------------------------------ */}
      <section className="relative">
        <div className="shell pb-8 pt-32 md:pb-12 md:pt-44">
          <Link
            href="/work"
            className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:bg-white hover:text-black hover:no-underline"
          >
            ← All work
          </Link>
          <SplitReveal
            as="h1"
            onLoad
            className="display-1 mt-6 font-extrabold uppercase leading-[0.92]"
          >
            MashynBazar
          </SplitReveal>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-3">
            <p className="max-w-[46ch] text-[17px] font-light leading-relaxed md:text-[19px]">
              {p.desc}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
              {p.services}
            </p>
          </div>
        </div>

        <div className="px-5 md:px-10">
          <DriftShot
            src="/photos/masynbazar/hero-v2.jpg"
            alt="MashynBazar: find your perfect car"
            className="aspect-[16/10] w-full"
            priority
          />
        </div>
      </section>

      {/* ---- the shop has two rooms ------------------------------------- */}
      <section className="shell py-28 md:py-44">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
          Turnkey — design, build, content
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[18ch] font-extrabold uppercase leading-[1.0]">
          Two rooms, one shop
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              Buying a car from Dubai is half desire and half diligence, and the
              two want opposite rooms to happen in.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              So the landing is a dark hall with one car under red light, and
              the catalogue is a pale, quiet grid where nothing competes with
              the spec sheet.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              Same shop, same header, same three clicks to a conversation — the
              lights just change.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- moves ------------------------------------------------------- */}
      <section className="shell pb-20 md:pb-32">
        <Moves moves={MOVES} />
      </section>

      {/* ---- the whole site, dragged past ------------------------------- */}
      <section className="border-t-2 border-white/15">
        <p className="shell pt-16 text-[11px] font-bold uppercase tracking-[0.3em] opacity-60 md:pt-24">
          Every screen we shipped
        </p>
        <Filmstrip shots={STRIP} />
      </section>

      {/* ---- what turnkey meant here ------------------------------------ */}
      <section className="shell py-8 md:py-16">
        <Reveal y={18} stagger={0.06}>
          {BUILT.map(([title, note]) => (
            <div
              key={title}
              className="grid gap-2 border-t border-white/15 py-7 md:grid-cols-[26%_1fr] md:gap-10"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.25em]">
                {title}
              </p>
              <p className="max-w-[60ch] text-[17px] font-light leading-relaxed opacity-85 md:text-[19px]">
                {note}
              </p>
            </div>
          ))}
        </Reveal>

        <Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <p className="display-3 max-w-[14ch] font-extrabold uppercase leading-[1.05]">
              Live
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
                href="https://masynbazar.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 self-start border-b-2 pb-1 text-[11px] font-bold uppercase tracking-[0.25em]"
                style={{ borderColor: ACCENT }}
              >
                masynbazar.com <ArrowNE />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out ---------------------------------------------------------- */}
      <section className="shell pb-24 pt-10 md:pb-32">
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
          <span className="display-2 mt-2 flex items-baseline gap-5 font-extrabold uppercase leading-[1.0] transition-colors duration-[450ms] group-hover:text-black">
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
