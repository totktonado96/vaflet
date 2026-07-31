import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { PROJECTS } from "@/lib/projects";
import { Counters, DriftShot, Filmstrip, Moves, Reveal } from "@/components/case/kit";

/**
 * GoTrack gets its own page rather than the shared case template: the product
 * is a dark ops room, and the story is a redesign, which reads as a sequence of
 * moves rather than a brief-and-bullets sheet.
 */

const p = PROJECTS.find((x) => x.slug === "gotrack")!;
const TITLE = "GOTRACK — Vaflet LLC";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/gotrack" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/gotrack",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const MOVES = [
  {
    kicker: "The surface",
    line: "The map became the workspace",
    src: "/photos/gotrack/monitoring.jpg",
    alt: "Monitoring: the fleet list floating over a full-bleed map",
  },
  {
    kicker: "The panel",
    line: "Editing moved beside the map",
    src: "/photos/gotrack/edit-panel.jpg",
    alt: "A vehicle being edited in the right panel while the map stays visible",
  },
  {
    kicker: "The rest",
    line: "Every form followed it out of the modal",
    src: "/photos/gotrack/create-marker.jpg",
    alt: "Creating a map marker in the right panel",
  },
];

const MARKS = [
  { src: "/photos/gotrack/brand/gotrack-monogram-white.svg", label: "Monogram · g." },
  { src: "/photos/gotrack/brand/gotrack-appicon.svg", label: "App icon" },
  { src: "/photos/gotrack/brand/gotrack-avatar.svg", label: "Avatar" },
];

const BRAND_COLOURS = [
  { name: "Ink", hex: "#14171A" },
  { name: "Paper", hex: "#F2F4F2" },
  { name: "Surface", hex: "#101413" },
  { name: "Signal green", hex: "#16C784" },
];

const STRIP = [
  { src: "/photos/gotrack/monitoring.jpg", caption: "Monitoring — the fleet, live" },
  { src: "/photos/gotrack/edit-panel.jpg", caption: "Right panel — editing a vehicle" },
  { src: "/photos/gotrack/create-marker.jpg", caption: "Right panel — a new marker" },
  { src: "/photos/gotrack/geofences.jpg", caption: "Geofences — zones on the workspace" },
  { src: "/photos/gotrack/create-geofence.jpg", caption: "Geofences — drawing a new zone" },
  { src: "/photos/gotrack/markers.jpg", caption: "Markers — depots, fuel, clients" },
];

export default function GotrackPage() {
  const next = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "gotrack") + 1) % PROJECTS.length];

  return (
    <main className="inv bg-black text-white">
      {/* ---- opening: the product first, the words after --------------- */}
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
            GoTrack
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
            src="/photos/gotrack/monitoring.jpg"
            alt="GoTrack monitoring: a fleet of trackers live on a dark map"
            className="aspect-[16/10] w-full"
            priority
          />
        </div>
      </section>

      {/* ---- the problem, in one sentence ------------------------------ */}
      <section className="shell py-28 md:py-44">
        <SplitReveal className="display-2 max-w-[20ch] font-extrabold uppercase leading-[1.0]">
          The tracking worked. Looking at it did not.
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              GoTrack watches fleets of Teltonika trackers in realtime. It wore
              the default desktop look of thirty years ago.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              Grey chrome. Boxed panels. Every list a table, every table a
              window.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              And modals that opened over almost the whole screen — so every
              edit cost you sight of the map you were working on.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- the mark the surface had to carry -------------------------- */}
      <section className="shell pb-24 md:pb-36">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
          Before the surface — the mark
        </p>

        <div className="mt-10 rounded-[1rem] border border-white/15 px-8 py-16 md:mt-14 md:rounded-[1.5rem] md:px-16 md:py-28">
          <Image
            src="/photos/gotrack/brand/gotrack-wordmark-white.svg"
            alt="GoTrack wordmark"
            width={752}
            height={216}
            className="mx-auto h-auto w-full max-w-[520px]"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 md:mt-6 md:gap-6">
          {MARKS.map((m) => (
            <figure
              key={m.src}
              className="flex flex-col items-center gap-4 rounded-[1rem] border border-white/15 px-6 py-10 md:rounded-[1.5rem] md:py-14"
            >
              <Image
                src={m.src}
                alt={m.label}
                width={140}
                height={140}
                className="h-[64px] w-auto md:h-[92px]"
              />
              <figcaption className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                {m.label}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-2">
          <div className="flex flex-wrap gap-3">
            {BRAND_COLOURS.map((c) => (
              <div
                key={c.hex}
                className="flex items-center gap-3 rounded-full border border-white/15 py-2 pl-2 pr-4"
              >
                <span
                  aria-hidden
                  className="size-6 rounded-full"
                  style={{ backgroundColor: c.hex, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                  {c.name}
                </span>
                <span className="text-[10px] font-bold tabular-nums opacity-50">
                  {c.hex}
                </span>
              </div>
            ))}
          </div>
          <p className="max-w-[52ch] text-[15px] font-light leading-relaxed opacity-75">
            A calm wordmark with one green dot — the arrival, which is the whole
            point of a tracker. Clear space is the height of the{" "}
            <span className="font-medium">o</span>; below 90&nbsp;px the monogram
            takes over, down to 16. Green paints the dot and nothing else.
          </p>
        </div>
      </section>

      {/* ---- three moves, one screen at a time ------------------------- */}
      <section className="shell pb-20 md:pb-32">
        <Moves moves={MOVES} />
      </section>

      {/* ---- the archive, dragged sideways ----------------------------- */}
      <section className="border-t-2 border-white/15">
        <p className="shell pt-16 text-[11px] font-bold uppercase tracking-[0.3em] opacity-60 md:pt-24">
          Every surface we touched
        </p>
        <Filmstrip shots={STRIP} />
      </section>

      {/* ---- what it costs to keep it alive ---------------------------- */}
      <section className="shell py-8 md:py-16">
        <Counters items={p.facts ?? []} />
        <Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <p className="display-3 max-w-[14ch] font-extrabold uppercase leading-[1.05] md:col-span-1">
              Still shipping
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
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
                Stack — {p.stack}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out ------------------------------------------------------- */}
      <section className="shell pb-24 pt-10 md:pb-32">
        <Link
          href={`/work/${next.slug}`}
          className="group block border-t-2 border-white pt-8"
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
