import Image from "next/image";
import Link from "next/link";
import CtaButton from "@/components/CtaButton";
import InkField from "@/components/InkField";
import SplitReveal from "@/components/SplitReveal";
import { PROJECTS, type Project } from "@/lib/projects";

const RATIO = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  // product shots keep their own frame instead of being cropped to fit
  wide: "aspect-[16/10]",
} as const;

function Card({ p }: { p: Project }) {
  const ratio = RATIO[p.ratio];
  return (
    <div>
      <div>
        <Link
          href={`/work/${p.slug}`}
          className="group block"
          data-cursor-text="View"
          data-cursor-ratio={p.ratio}
          data-cursor-dwell="Yes, we can build that too."
        >
      {/* The frame itself gives a little on hover; the photo inside stays put */}
      <span
        className={`relative block ${ratio} overflow-hidden rounded-[1.15rem] transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[0.97] md:rounded-[1.5rem]`}
      >
        {(p.cover ?? p.photo) ? (
          <Image
            src={(p.cover ?? p.photo)!}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <InkField
            type={p.pattern ?? 0}
            scale={2.6}
            speed={0.4}
            className="h-full w-full"
          />
        )}
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

      {/* Three columns that stack independently. A grid would align rows and
          leave a void under every short card; CSS column-flow balances by
          height and leaves a hole in the middle. Splitting by index does
          neither, and each column starts at its own height on purpose. */}
      <div className="grid gap-16 sm:grid-cols-2 md:grid-cols-3 md:gap-x-16 lg:gap-x-24">
        {[0, 1, 2].map((col) => (
          <div
            key={col}
            className={`flex flex-col gap-16 md:gap-24 ${
              col === 1 ? "md:mt-28" : col === 2 ? "md:mt-14" : ""
            }`}
          >
            {PROJECTS.filter((_, i) => i % 3 === col).map((p) => (
              <Card key={p.slug} p={p} />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-24 flex flex-col items-center text-center md:mt-44">
        <p className="max-w-lg text-[17px] font-light leading-relaxed md:text-[19px]">
          A selection, not the archive. The rest are one click away.
        </p>
        <CtaButton href="/work" label="See all work" className="mt-16 md:mt-24" />
      </div>
    </section>
  );
}
