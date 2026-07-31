import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import SplitReveal from "@/components/SplitReveal";
import Footer from "@/components/Footer";
import InkField from "@/components/InkField";
import { PROJECTS } from "@/lib/projects";

export function generateStaticParams() {
  // Projects with a page of their own are routed by that page, not by this one
  return PROJECTS.filter((p) => !p.custom).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) return {};
  const title = `${p.title.toUpperCase()} — Vaflet LLC`;
  return {
    title,
    description: p.desc,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: {
      type: "article",
      siteName: "Vaflet LLC",
      title,
      description: p.desc,
      url: `/work/${p.slug}`,
    },
    twitter: { card: "summary_large_image", title, description: p.desc },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = PROJECTS.findIndex((x) => x.slug === slug);
  if (index === -1 || PROJECTS[index].custom) notFound();
  const p = PROJECTS[index];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const rest = (p.gallery ?? []).filter((shot) => shot.src !== p.photo);

  return (
    <main>
      <section className="shell pb-10 pt-32 md:pb-14 md:pt-44">
        <Link
          href="/work"
          className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:bg-black hover:text-white hover:no-underline"
        >
          ← All work
        </Link>
        <SplitReveal
          as="h1"
          onLoad
          className="display-1 mt-6 font-extrabold uppercase leading-[0.95]"
        >
          {p.title}
        </SplitReveal>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-xs font-bold uppercase tracking-[0.2em]">
          {p.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1 ${
                tag === "Open source"
                  ? "bg-black text-white"
                  : "border-2 border-black"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="shell pb-16 md:pb-24">
        {/* A product shot is shown whole — cropping a UI to a letterbox throws
            away the part that carries the work. Photography can letterbox. */}
        <div
          className={`relative aspect-[16/10] w-full overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem] ${
            p.gallery ? "" : "md:aspect-[16/7]"
          }`}
        >
          {p.photo ? (
            <Image
              src={p.photo}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <InkField
              type={p.pattern ?? 0}
              scale={2}
              speed={0.35}
              className="h-full w-full"
            />
          )}
        </div>
      </section>

      <section className="shell grid gap-x-16 gap-y-12 pb-20 md:grid-cols-2 md:pb-28">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">
            The brief
          </h2>
          <p className="mt-4 max-w-md text-lg font-medium leading-relaxed">
            {p.brief}
          </p>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em]">
            Stack
          </p>
          <p className="mt-2 text-[15px] font-medium">{p.stack}</p>

          {/* Figures carry the column when there is no second frame to fill it */}
          {p.facts && (
            <dl className="mt-12 flex flex-col">
              {p.facts.map((f) => (
                <div
                  key={f.label}
                  className="flex items-baseline gap-5 border-t-2 border-black py-4"
                >
                  <dt className="display-3 font-extrabold leading-none tabular-nums">
                    {f.value}
                  </dt>
                  <dd className="text-[11px] font-bold uppercase leading-snug tracking-[0.2em]">
                    {f.label}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {/* A second frame only earns its place when there is a real shot for
              it — two ink fields on one page is wallpaper, not a case study. */}
          {p.photoDetail && (
            <div className="relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem]">
              <Image
                src={p.photoDetail}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">
            What we did
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {p.did.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-3 font-medium leading-relaxed"
              >
                <span aria-hidden className="text-[9px]">
                  ■
                </span>
                {item}
              </li>
            ))}
          </ul>
          <h2 className="mt-10 text-xs font-bold uppercase tracking-[0.2em]">
            The outcome
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {p.outcome.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-3 font-medium leading-relaxed"
              >
                <span aria-hidden className="text-[9px]">
                  ■
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The hero already carries one shot — the gallery shows what it does not */}
      {rest.length > 0 && (
        <section className="shell grid gap-x-10 gap-y-12 pb-20 md:grid-cols-2 md:pb-28">
          {rest.map((shot, i) => (
            <figure
              key={shot.src}
              /* an odd one out spans the row instead of leaving a hole */
              className={
                i === rest.length - 1 && rest.length % 2 === 1
                  ? "md:col-span-2"
                  : undefined
              }
            >
              <div className="relative aspect-[8/5] w-full overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem]">
                <Image
                  src={shot.src}
                  alt={shot.caption}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 text-[11px] font-bold uppercase leading-snug tracking-[0.2em]">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </section>
      )}

      <section className="shell pb-24 md:pb-32">
        <Link
          href={`/work/${next.slug}`}
          className="group block border-t-2 border-black pt-8"
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
