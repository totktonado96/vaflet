import InkField from "@/components/InkField";
import LineReveal from "@/components/LineReveal";
import Magnetic from "@/components/Magnetic";
import RotatingWords from "@/components/RotatingWords";
import SplitReveal from "@/components/SplitReveal";

export default function Hero() {
  return (
    <section
      id="top"
      tabIndex={-1}
      className="shell flex min-h-svh flex-col justify-center pb-16 pt-32"
    >
      <h1 className="sr-only">
        Vaflet LLC — digital studio. We build digital products end-to-end: design,
        code, AI agents and automation.
      </h1>
      <div
        aria-hidden
        className="display-1 font-extrabold uppercase leading-[0.95]"
      >
        {/* The live canvas must stay out of SplitText's innerHTML round-trip */}
        <LineReveal>
          <span className="flex items-center gap-[0.18em]">
            We build
            <InkField
              type={0}
              scale={2.2}
              speed={0.8}
              morphEvent="vaflet:hero-word"
              interactive
              className="inline-block h-[0.66em] w-[1.6em] shrink-0 rounded-full"
            />
          </span>
        </LineReveal>
        <RotatingWords
          delay={0.1}
          announceEvent="vaflet:hero-word"
          words={[
            "digital products",
            "websites",
            "mobile apps",
            "SaaS platforms",
            "AI agents",
            "automation",
            "e-commerce",
            "internal tools",
            "social media bots",
            "dashboards",
            "rapid MVPs",
            "design systems",
            "data pipelines",
            "APIs & backends",
          ]}
        />
        <SplitReveal as="div" onLoad delay={0.2}>
          end-to-end
        </SplitReveal>
      </div>

      <div className="mt-14 flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
        <p className="max-w-md font-medium leading-relaxed">
          Vaflet LLC is a two-founder studio in New Jersey. We design it, build it
          and wire the AI in — and you never have to talk to an account
          manager, because we don&apos;t have any.
        </p>
        <Magnetic>
          <a
            href="/contact"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border-2 border-black bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.15em]"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-black transition-transform duration-300 ease-out group-hover:scale-y-100" />
            {/* Two copies rolling over — no blend mode, so the magnetic
                transform can't break how the colour resolves. */}
            <span className="relative z-10 block overflow-hidden">
              <span className="flex items-center gap-3 text-black transition-transform duration-300 ease-out group-hover:-translate-y-[140%]">
                Start a project <span aria-hidden>↗</span>
              </span>
              <span
                aria-hidden
                className="absolute inset-0 flex translate-y-[140%] items-center gap-3 text-white transition-transform duration-300 ease-out group-hover:translate-y-0"
              >
                Start a project <span>↗</span>
              </span>
            </span>
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
