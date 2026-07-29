import Magnetic from "@/components/Magnetic";
import SeoIndex from "@/components/SeoIndex";
import SplitReveal from "@/components/SplitReveal";
import Starfield from "@/components/Starfield";
import { SEO_GROUPS } from "@/lib/seo-pages";

// TODO: swap for the real bot handle
const TELEGRAM = "https://t.me/vaflet_bot";

const NAV: Array<[string, string]> = [
  ["Work", "/#work"],
  ["Services", "/#services"],
  ["Founders", "/#founders"],
  ["Contact", "/contact"],
];

/** Outlined pill: ink floods out from the centre, the label rolls over. */
function Pill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Magnetic strength={0.35}>
      <a
        href={href}
        className="group/pill relative inline-flex items-center overflow-hidden rounded-full border-2 border-white px-6 py-3 md:px-7 md:py-3.5"
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-[135%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pill:scale-100"
        />
        <span className="relative block overflow-hidden text-base font-bold leading-none text-white mix-blend-difference md:text-lg">
          <span className="block transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pill:-translate-y-[130%]">
            {children}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 block translate-y-[130%] transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pill:translate-y-0"
          >
            {children}
          </span>
        </span>
      </a>
    </Magnetic>
  );
}

export default function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      id="contact"
      tabIndex={-1}
      className="inv relative overflow-hidden rounded-t-[2.5rem] bg-black text-white md:rounded-t-[4rem]"
    >
      {/* dust rising off the very bottom of the page, through the whole footer */}
      <Starfield className="absolute inset-0 z-0 h-full w-full" />

      {/* ——— full-height call to action (skipped on the contact page) ——— */}
      {!compact && (
      <section className="relative z-10 flex min-h-svh flex-col items-center justify-center px-6">
        <SplitReveal
          as="h2"
          className="relative z-10 text-center text-[clamp(3rem,12vw,11rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-white mix-blend-difference"
        >
          Have an idea?
        </SplitReveal>

        <Magnetic strength={0.45} className="relative z-10 mt-12 md:mt-16">
          <a
            href="/contact"
            className="group/tell flex size-44 items-center justify-center rounded-full border-2 border-white bg-black transition-colors duration-500 hover:bg-white md:size-60"
          >
            <span className="relative block overflow-hidden text-xl font-extrabold uppercase leading-none tracking-[0.15em] text-white transition-colors duration-500 group-hover/tell:text-black md:text-2xl">
              <span className="block transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tell:-translate-y-[130%]">
                Tell us
              </span>
              <span
                aria-hidden
                className="absolute inset-0 block translate-y-[130%] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tell:translate-y-0"
              >
                Tell us
              </span>
            </span>
          </a>
        </Magnetic>
      </section>
      )}

      {/* ——— contact block ——— */}
      <section className={`shell relative z-10 pb-10 ${compact ? "pt-20 md:pt-28" : "pt-24 md:pt-32"}`}>
        <div className="grid gap-14 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap gap-4">
              <Pill href="mailto:cuntact@vaflet.agency">cuntact@vaflet.agency</Pill>
              <Pill href={TELEGRAM}>Telegram ↗</Pill>
            </div>
            <div className="mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">
                Based in
              </p>
              <p className="mt-2 text-[17px] font-light leading-relaxed">
                New Jersey, USA
                <br />
                Remote-first, working worldwide — and always reachable
              </p>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-x-14 gap-y-4 self-start md:text-right">
            {NAV.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-2xl font-light transition-transform duration-300 hover:translate-x-1 md:text-3xl md:hover:-translate-x-1"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-24 flex flex-col gap-3 border-t-2 border-white pt-8 text-xs font-bold uppercase tracking-[0.2em] md:flex-row md:items-center md:justify-between">
          <span>© 2026 Vaflet LLC</span>
          <span>Design &amp; code by Vaflet LLC, obviously</span>
          <a
            href="#top"
            className="underline underline-offset-4 hover:bg-white hover:text-black hover:no-underline"
          >
            Back to top ↑
          </a>
        </div>

        <SeoIndex groups={SEO_GROUPS} />

      </section>
    </footer>
  );
}
