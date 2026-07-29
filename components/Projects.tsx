import Image from "next/image";
import Link from "next/link";
import Magnetic from "@/components/Magnetic";
import SplitReveal from "@/components/SplitReveal";
import { PROJECTS, type Project } from "@/lib/projects";

const RATIO = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
} as const;

function Card({ p }: { p: Project }) {
  const ratio = RATIO[p.ratio];
  return (
    <div className="mb-20 break-inside-avoid md:mb-28">
      <div>
        <Link
          href={`/work/${p.slug}`}
          className="group block"
          data-cursor-text="View"
        >
      {/* The frame itself gives a little on hover; the photo inside stays put */}
      <span
        className={`relative block ${ratio} overflow-hidden rounded-[1.15rem] transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[0.97] md:rounded-[1.5rem]`}
      >
        <Image
          src={p.photo}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        {/* Tags overlay the photo's top-left corner and fade out on hover.
            Solid fills, since a bordered pill would vanish over a light photo. */}
        <span className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 pr-4 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-0">
          {p.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                tag === "Open source"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {tag}
            </span>
          ))}
        </span>
      </span>
          {/* Title and description share one size — only the weight differs */}
          <span className="mt-6 block text-[17px] leading-snug md:mt-7 md:text-[19px]">
            <span className="font-extrabold">{p.title}</span>
            <span className="font-light"> — {p.desc}</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section
      id="work"
      tabIndex={-1}
      className="inv shell rounded-t-[2.5rem] bg-black pb-52 pt-20 text-white md:rounded-t-[4rem] md:pb-72 md:pt-28"
    >
      <SplitReveal className="display-2 mb-14 font-extrabold uppercase leading-[1.0] md:mb-20">
        Selected work
      </SplitReveal>

      {/* Column flow, not rows — mixed frame shapes stack without ragged gaps.
          Column gap matches the vertical gap, so cards narrow to keep it even. */}
      <div className="columns-1 gap-20 sm:columns-2 md:columns-3 md:gap-28">
        {PROJECTS.map((p) => (
          <Card key={p.slug} p={p} />
        ))}
      </div>

      <div className="mt-24 flex flex-col items-center text-center md:mt-44">
        <p className="max-w-lg text-[17px] font-light leading-relaxed md:text-[19px]">
          Six of them. The rest are under NDA, half-built, or still an argument
          in a group chat.
        </p>
        <Magnetic strength={0.4} className="mt-16 md:mt-24">
          <a
            href="/contact"
            className="group/cta relative inline-flex items-center gap-4 overflow-hidden rounded-full border-2 border-white px-10 py-6 md:px-14 md:py-7"
          >
            {/* ink blot flooding out from the centre */}
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:scale-100"
            />
            {/* label rolls up, its twin rolls in from below */}
            <span className="relative block overflow-hidden text-lg font-extrabold uppercase leading-none tracking-[0.15em] text-white mix-blend-difference md:text-xl">
              <span className="block transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:-translate-y-[120%]">
                Your project goes here
              </span>
              <span
                aria-hidden
                className="absolute inset-0 block translate-y-[120%] transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-y-0"
              >
                Your project goes here
              </span>
            </span>
            {/* arrow flies out top-right and re-enters from bottom-left */}
            <span
              aria-hidden
              className="relative block size-6 overflow-hidden text-xl font-bold leading-none text-white mix-blend-difference"
            >
              <span className="block transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-full group-hover/cta:-translate-y-full">
                ↗
              </span>
              <span className="absolute inset-0 block -translate-x-full translate-y-full transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-0 group-hover/cta:translate-y-0">
                ↗
              </span>
            </span>
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
