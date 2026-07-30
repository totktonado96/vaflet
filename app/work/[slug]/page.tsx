import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import SplitReveal from "@/components/SplitReveal";
import Footer from "@/components/Footer";
import { PROJECTS } from "@/lib/projects";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
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
  if (index === -1) notFound();
  const p = PROJECTS[index];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

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
          <span>{p.year}</span>
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
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.15rem] md:aspect-[16/7] md:rounded-[1.5rem]">
          <Image
            src={p.photo}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
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
          <div className="relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem]">
            <Image
              src={p.photoDetail}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
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
