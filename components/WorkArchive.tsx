"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InkField from "@/components/InkField";
import { DISCIPLINES, type Discipline, type Project } from "@/lib/projects";

/* The frame keeps each project's own shape. Stacked on phones, floating out of
   the row on hover from md up — one element, two lives. */
const FRAME = {
  square: "md:aspect-square md:w-[13rem] lg:w-[16rem]",
  portrait: "md:aspect-[3/4] md:w-[11rem] lg:w-[13rem]",
  landscape: "md:aspect-[4/3] md:w-[15rem] lg:w-[19rem]",
  wide: "md:aspect-[16/10] md:w-[17rem] lg:w-[21rem]",
} as const;

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group/chip relative isolate overflow-hidden rounded-full border-2 border-black px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
        active ? "bg-black text-white" : "bg-white text-black hover:text-white"
      }`}
    >
      {/* ink rises from the floor of the chip; the label rides over it */}
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 origin-bottom bg-black transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          active ? "scale-y-100" : "scale-y-0 group-hover/chip:scale-y-100"
        }`}
      />
      {label}
      <span className="ml-2 tabular-nums opacity-60">{count}</span>
    </button>
  );
}

function Row({ p, index }: { p: Project; index: number }) {
  return (
    <Link
      href={`/work/${p.slug}`}
      className="group row-in relative block border-t-2 border-black py-7 md:py-10"
      style={{ animationDelay: `${index * 55}ms` }}
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
        {(p.cover ?? p.photo) ? (
          <Image
            src={(p.cover ?? p.photo)!}
            alt=""
            fill
            sizes="(min-width: 768px) 304px, 100vw"
            className="object-cover"
          />
        ) : (
          <InkField
            type={p.pattern ?? 0}
            scale={2.2}
            speed={0.35}
            className="h-full w-full"
          />
        )}
      </span>
    </Link>
  );
}

export default function WorkArchive({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Discipline | null>(null);

  const counts = useMemo(() => {
    const map = new Map<Discipline, number>();
    for (const p of projects) {
      for (const d of p.disciplines) map.set(d, (map.get(d) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  const shown = active
    ? projects.filter((p) => p.disciplines.includes(active))
    : projects;

  // A shorter list moves everything below it. Lenis and ScrollTrigger both
  // measure once on mount, so they have to be told the page just changed size.
  useEffect(() => {
    window.__lenis?.resize();
    ScrollTrigger.refresh();
  }, [active]);

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center gap-3 md:mb-14">
        <Chip
          label="All"
          count={projects.length}
          active={active === null}
          onClick={() => setActive(null)}
        />
        {DISCIPLINES.filter((d) => counts.has(d)).map((d) => (
          <Chip
            key={d}
            label={d}
            count={counts.get(d) ?? 0}
            active={active === d}
            onClick={() => setActive(active === d ? null : d)}
          />
        ))}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {shown.length} {shown.length === 1 ? "project" : "projects"} shown
        {active ? ` in ${active}` : ""}
      </p>

      {/* keyed on the filter so every row replays its entrance */}
      <div key={active ?? "all"}>
        {shown.map((p, i) => (
          <Row key={p.slug} p={p} index={i} />
        ))}
      </div>
    </>
  );
}
