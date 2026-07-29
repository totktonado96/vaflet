import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";

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
        <ContactForm />
      </section>
      <Footer compact />
    </main>
  );
}
