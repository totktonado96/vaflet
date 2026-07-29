import Image from "next/image";
import InkField from "@/components/InkField";
import SplitReveal from "@/components/SplitReveal";

// Real founders. Roles and one-liners are still ours to confirm.
const FOUNDERS = [
  {
    initials: "TA",
    name: "Tim Avci",
    role: "Founder — Engineering & AI",
    line: "Ships product end-to-end. Vibecodes the sketch, hardens the release, teaches the agents to behave.",
    type: 1 as const,
    photo: "/photos/tim.jpg",
    photoPosition: "object-[50%_60%]",
  },
  {
    initials: "BK",
    name: "Baha Kabulov",
    role: "Founder — Design & Product",
    line: "Turns fuzzy ideas into interfaces people actually feel. Deletes decoration on sight.",
    type: 2 as const,
    photo: "/photos/baha.jpg",
    photoPosition: "object-[50%_35%]",
  },
];

export default function Founders() {
  return (
    <section id="founders" tabIndex={-1} className="shell pb-28 md:pb-40">
      <SplitReveal className="display-2 mb-12 font-extrabold uppercase leading-[1.0] md:mb-16">
        Two founders, zero managers
      </SplitReveal>
      <div className="grid gap-10 md:grid-cols-2">
        {FOUNDERS.map((f) => (
          <div
            key={f.name}
            className="group rounded-[1.5rem] border-2 border-black p-6 md:rounded-[2rem] md:p-8"
          >
            <div className="relative aspect-[3/2] overflow-hidden rounded-[1rem] md:rounded-[1.25rem]">
              {f.photo ? (
                <Image
                  src={f.photo}
                  alt={f.name}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className={`object-cover ${f.photoPosition ?? ""}`}
                />
              ) : (
                <>
                  <InkField
                    type={f.type}
                    scale={2.4}
                    speed={0.4}
                    className="h-full w-full"
                  />
                  {/* Initials only stand in while there is no portrait yet */}
                  <span className="absolute bottom-4 left-5 text-5xl font-extrabold uppercase text-white mix-blend-difference md:text-6xl">
                    {f.initials}
                  </span>
                </>
              )}
            </div>
            <h3 className="mt-6 text-2xl font-extrabold uppercase tracking-[-0.02em] md:text-3xl">
              {f.name}
            </h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em]">
              {f.role}
            </p>
            <p className="mt-4 max-w-md font-medium leading-relaxed">
              {f.line}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-14 max-w-md text-[15px] font-medium leading-relaxed">
        You talk to the people doing the work. Every call, every commit, every
        pixel — one of these two.
      </p>
    </section>
  );
}
