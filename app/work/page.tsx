import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CtaButton from "@/components/CtaButton";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { PROJECTS, type Project } from "@/lib/projects";

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

/* The frame keeps each project's own shape. Stacked on phones, floating out of
   the row on hover from md up — one element, two lives. */
const FRAME = {
  square: "md:aspect-square md:w-[13rem] lg:w-[16rem]",
  portrait: "md:aspect-[3/4] md:w-[11rem] lg:w-[13rem]",
  landscape: "md:aspect-[4/3] md:w-[15rem] lg:w-[19rem]",
} as const;

function Row({ p, index }: { p: Project; index: number }) {
  return (
    <Link
      href={`/work/${p.slug}`}
      className="group relative block border-t-2 border-black py-7 md:py-10"
      data-cursor-text="View"
    >
      <div className="flex items-baseline justify-between gap-6">
        <span className="flex items-baseline gap-4 md:gap-8">
          <span className="text-xs font-bold tracking-[0.2em] tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          {/* the title steps aside for the frame that slides in behind it */}
          <span className="display-3 block font-extrabold uppercase leading-[1.0] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
            {p.title}
          </span>
        </span>
        <span className="flex shrink-0 items-baseline gap-5 text-xs font-bold uppercase tracking-[0.2em]">
          {p.year}
          <span
            aria-hidden
            className="hidden text-base leading-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 md:block"
          >
            →
          </span>
        </span>
      </div>

      <p className="mt-3 max-w-xl text-[15px] font-light leading-relaxed md:ml-14 md:mt-4 md:text-base">
        {p.desc}
      </p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] md:ml-14">
        {p.services}
      </p>

      <span
        aria-hidden
        className={`relative mt-5 block aspect-[16/10] w-full overflow-hidden rounded-[1rem] md:pointer-events-none md:absolute md:left-[54%] md:top-1/2 md:z-10 md:mt-0 md:-translate-y-1/2 md:scale-95 md:rounded-[1.25rem] md:opacity-0 md:transition-[opacity,scale] md:duration-[600ms] md:ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:scale-100 md:group-hover:opacity-100 ${FRAME[p.ratio]}`}
      >
        <Image
          src={p.photo}
          alt=""
          fill
          sizes="(min-width: 768px) 304px, 100vw"
          className="object-cover"
        />
      </span>
    </Link>
  );
}

export default function WorkIndexPage() {
  const oss = PROJECTS.filter((p) => p.oss).length;

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
          That&rsquo;s {spell(PROJECTS.length)} we can show, {spell(oss)} of them
          open source. The rest are under NDA, half-built, or still an argument
          in a group chat.
        </p>
      </section>

      <section className="shell pb-4 md:pb-10">
        {PROJECTS.map((p, i) => (
          <Row key={p.slug} p={p} index={i} />
        ))}
      </section>

      <section className="shell pb-28 md:pb-40">
        <div className="flex flex-col items-center border-t-2 border-black pt-16 text-center md:pt-24">
          <p className="max-w-lg text-[17px] font-light leading-relaxed md:text-[19px]">
            Number {spell(PROJECTS.length + 1)} is still an empty row. Tell us
            what goes in it.
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
