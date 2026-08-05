import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Magnetic from "@/components/Magnetic";
import { Reveal } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";
import { KioskAnatomy } from "./parts/anatomy";
import { Hero } from "./parts/hero";

/**
 * Face2me gets a site inside the site. The case wears the product's own
 * skin — face2.me's neumorphism: one pale material, light from the top
 * left, everything either extruded from the surface or pressed into it,
 * Jakarta for display, malachite for anything alive. None of the studio's
 * ink survives in here except at the very end, where the exit door drops
 * the reader back into our black — leaving the product's world is the
 * transition.
 *
 * The case is told straight and short: the walk-up to the kiosk in the
 * dark, the box exploded into its seven systems, and the question at the
 * end. Nothing on this page is invented — the only character is the one
 * on the kiosk's own screen.
 */

const p = PROJECTS.find((x) => x.slug === "face2me")!;
const TITLE = "FACE2ME — Vaflet LLC";

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
      {/* THE WALK-UP — the kiosk stands far off in the studio's black with
          its back turned; scrolling walks you up to it, it turns to face
          you, and the screen gathers the receptionist out of halftone dots.
          The product opens on itself, not on a claim. */}
      <Hero />

      <div data-f2m>
        {/* THE BOX, EXPLODED — no headline, no preamble: seven systems as
            seven physical layers of the kiosk, and the rows to read them by */}
        <section id="brief" className="shell scroll-mt-24 pb-24 pt-20 md:pb-32 md:pt-28">
          <KioskAnatomy />

        </section>





        {/* THE QUESTION */}
        <section className="shell pb-28 md:pb-40">
          <Reveal>
            <Chip>The question</Chip>
            <p className="f2m-display mt-7 max-w-4xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
              So — want one in your lobby?
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
                  See it live at face2.me
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </section>
      </div>

      {/* the exit is the studio's own ink — leaving the product's world is
          the transition, and the contrast is the point */}
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
