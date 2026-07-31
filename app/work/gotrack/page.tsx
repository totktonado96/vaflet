import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { PROJECTS } from "@/lib/projects";
import { Counters, DriftShot, Filmstrip, Moves, Reveal } from "./story";

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
              {p.year} · {p.services}
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
