import type { Metadata } from "next";
import Link from "next/link";
import CtaButton from "@/components/CtaButton";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import WorkArchive from "@/components/WorkArchive";
import { PROJECTS } from "@/lib/projects";

const TITLE = "All work — Vaflet LLC";
const DESCRIPTION =
  "Every Vaflet LLC case study in one place — web apps, mobile products, AI agents and open source, with the brief, the build and what came out of it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: DESCRIPTION,
    url: "/work",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/** Counts read as words on this site, not digits. */
const SPELLED = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];
const spell = (n: number) => SPELLED[n] ?? String(n);

export default function WorkIndexPage() {
  return (
    <main>
      <section className="shell pb-14 pt-32 md:pb-20 md:pt-44">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:bg-black hover:text-white hover:no-underline"
        >
          ← Home
        </Link>
        <SplitReveal
          as="h1"
          onLoad
          className="display-1 mt-6 font-extrabold uppercase leading-[0.95]"
        >
          All work
        </SplitReveal>
        <p className="mt-8 max-w-lg text-[17px] font-light leading-relaxed md:text-[19px]">
          {spell(PROJECTS.length)[0].toUpperCase() + spell(PROJECTS.length).slice(1)}{" "}
          we can show. Newest first.
        </p>
      </section>

      <section className="shell pb-4 md:pb-10">
        <WorkArchive projects={PROJECTS} />
      </section>

      <section className="shell pb-28 md:pb-40">
        <div className="flex flex-col items-center border-t-2 border-black pt-16 text-center md:pt-24">
          <p className="max-w-lg text-[17px] font-light leading-relaxed md:text-[19px]">
            The rest are under NDA, half-built, or still an argument in a group
            chat.
          </p>
          <CtaButton
            href="/contact"
            label="Start a project"
            surface="white"
            className="mt-12 md:mt-16"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
