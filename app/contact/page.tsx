import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import InkField from "@/components/InkField";
import SplitReveal from "@/components/SplitReveal";
import { MAIL_TO } from "@/lib/site";

const TITLE = "Tell us all the things — Vaflet LLC";
const DESCRIPTION =
  "Start a project with Vaflet LLC. Tell us what you're building, what you need and roughly what it's worth — we answer the same day.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: DESCRIPTION,
    url: "/contact",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// The order is real: this is how a brief moves once it lands.
const NEXT: Array<[string, string]> = [
  ["Today", "We read every word and answer the same day."],
  ["Next", "A founder gets on a call with you to pin down the scope."],
  ["Then", "You get a clear plan and a price before any work starts."],
];

export default function ContactPage() {
  return (
    <main>
      <section className="shell pb-24 pt-36 md:pb-32 md:pt-48">
        <SplitReveal
          as="h1"
          onLoad
          className="display-1 max-w-[16ch] font-extrabold uppercase leading-[0.95]"
        >
          Hey! Tell us all the things
        </SplitReveal>
        <div className="mt-16 grid gap-20 md:mt-24 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-24">
          <ContactForm />
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <InkField
              type={6}
              scale={2.2}
              speed={0.5}
              interactive
              className="h-28 w-full rounded-[1.25rem] md:h-36"
            />
            <h2 className="mt-8 text-xs font-bold uppercase tracking-[0.2em]">
              What happens next
            </h2>
            <ol className="mt-5 grid gap-5">
              {NEXT.map(([when, what]) => (
                <li
                  key={when}
                  className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border-t-2 border-black pt-3"
                >
                  <span className="text-xs font-bold uppercase leading-6 tracking-[0.15em]">
                    {when}
                  </span>
                  <span className="font-medium leading-6">{what}</span>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em]">
              Rather write yourself
            </p>
            <a
              href={`mailto:${MAIL_TO}`}
              className="mt-3 inline-block select-all break-all text-lg font-bold underline underline-offset-4 hover:bg-black hover:text-white hover:no-underline"
            >
              {MAIL_TO}
            </a>
          </aside>
        </div>
      </section>
      <Footer compact />
    </main>
  );
}
