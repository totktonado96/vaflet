import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import {
  AssetShelf,
  Counters,
  DriftShot,
  Filmstrip,
  Moves,
  PhoneRail,
  PriceLadder,
  Reveal,
} from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";

/**
 * ASAR TECH is a light, Apple-leaning shop that earns its depth from hairlines
 * and one blue, so the case is the only one on this site that keeps the lights
 * on: near-white paper, the shop's own ink, and its own accent doing all the
 * pointing. The argument is the price ladder, so the ladder comes first.
 */

const p = PROJECTS.find((x) => x.slug === "asartech")!;
const TITLE = "ASAR TECH — Vaflet LLC";

const PAPER = "#FAFAFA";
const INK = "#1D1D1F";
const BLUE = "#0A84FF";
const LINE = "rgba(29,29,31,0.14)";
// every shot but the hero gets a hairline: the shop is as pale as this page
const EDGE = "rgba(29,29,31,0.16)";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/asartech" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/asartech",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const S = (n: string) => `/photos/asartech/${n}.jpg`;

/** The real ladder off the shelf: MacBook Pro 14" M4 Pro, 512 GB, in AED. */
const LADDER = [
  { range: "1–9", price: 8999, note: "retail" },
  { range: "10–49", price: 8449, note: "wholesale" },
  { range: "50+", price: 7899, note: "by the pallet" },
];

const MOVES = [
  {
    kicker: "The shelf",
    line: "The wholesale price is printed on the page",
    src: S("tiers-batch"),
    alt: "Product page at twelve units: wholesale price, and the ladder under it",
  },
  {
    kicker: "The cart",
    line: "The tenth unit changes the bill",
    src: S("cart"),
    alt: "Cart with a batch of twelve at the wholesale unit price",
  },
  {
    kicker: "The counter",
    line: "Duties prepaid, 249 countries deep",
    src: S("checkout"),
    alt: "Checkout: contact, ship-to, delivery and payment on one rail",
  },
];

const STRIP = [
  { src: S("tiers"), caption: "Product — the ladder, before anyone asks for it" },
  { src: S("catalog"), caption: "Catalogue — facets, brands and sort over the whole shop" },
  { src: S("category"), caption: "Category — a spec sheet on every card" },
  { src: S("search"), caption: "Search — results and filters on the same screen" },
  { src: S("order"), caption: "Order placed — the receipt the customer keeps" },
  { src: S("contact"), caption: "Contact — form, callback, WhatsApp and Telegram" },
];

const PHONES = [
  { src: S("m-home"), caption: "Home — the shop as most of its buyers will see it" },
  { src: S("m-pdp"), caption: "Product — gallery, specs, the ladder" },
  { src: S("m-pdp-buy"), caption: "Sticky buy-bar — variant and price, one thumb" },
  { src: S("m-cart"), caption: "Cart — the batch and what it saved" },
  { src: S("m-catalog"), caption: "Catalogue — filters in a bottom sheet" },
  { src: S("m-search"), caption: "Search — over the page, not away from it" },
  { src: S("m-contact"), caption: "Contact — the reason picker does the sorting" },
];

const ADMIN = [
  {
    src: S("admin"),
    title: "The console",
    note: "Sales, the order queue and catalogue health on one screen",
    wide: true,
  },
  {
    src: S("admin-products"),
    title: "Products",
    note: "One form, EN and RU side by side",
  },
  {
    src: S("admin-orders"),
    title: "Orders",
    note: "Capture, pack, ship, deliver — each step a real workflow",
  },
  {
    src: S("admin-requests"),
    title: "Requests",
    note: "Every lead in the database, triaged, never in a metadata blob",
  },
  {
    src: S("admin-payments"),
    title: "Payments",
    note: "Methods and keys, write-only — the operator never opens a .env",
  },
  {
    src: S("admin-content"),
    title: "Home",
    note: "Hero and promo banners, changed without a deploy",
  },
];

/** The decisions that make it a shop somebody can run, not just look at. */
const RUNS = [
  [
    "Real data",
    "Catalogue, prices, specs and photos are the owner’s own, entered in the console and live the moment they are saved.",
  ],
  [
    "Payments",
    "Cash on delivery, cards, Tabby and Tamara — each method carries its own keys, entered in the admin and switched on without a redeploy.",
  ],
  [
    "Tax and duties",
    "Prices exclude VAT and delivery is DDP: duties are prepaid at checkout, so nothing is collected at the customer’s door.",
  ],
  [
    "Recommendations",
    "Six engines — similar, customers-also-bought, frequently-bought-together, bestsellers, new arrivals and recently viewed — ranked on the backend and rendered from the live catalogue.",
  ],
  [
    "Built for a reseller",
    "The shop sources to order out of Dubai, so availability and lead time come from the desk that answers the phone, not from a warehouse counter.",
  ],
  [
    "Two languages",
    "EN and RU, key for key — 541 = 541 — so one switch changes the whole shop, product copy and spec labels included.",
  ],
];

export default function AsartechPage() {
  const next =
    PROJECTS[(PROJECTS.findIndex((x) => x.slug === "asartech") + 1) % PROJECTS.length];

  return (
    <main style={{ backgroundColor: PAPER, color: INK }}>
      {/* ---- title, then the shop itself -------------------------------- */}
      <section className="pt-32 md:pt-44">
        <div className="shell">
          <Link
            href="/work"
            className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4"
          >
            ← All work
          </Link>
          <SplitReveal
            as="h1"
            onLoad
            className="display-1 mt-6 font-extrabold uppercase leading-[0.92]"
          >
            ASAR TECH
          </SplitReveal>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <p className="max-w-[48ch] text-[17px] font-light leading-relaxed md:text-[19px]">
              {p.desc}
            </p>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: BLUE }}
            >
              {p.services}
            </p>
          </div>
        </div>

        <div className="mt-12 px-5 md:mt-16 md:px-10">
          <DriftShot
            src={S("home")}
            alt="ASAR TECH home: hero banner, categories, new arrivals"
            className="aspect-[16/10] w-full"
            priority
          />
        </div>
      </section>

      {/* ---- the brief: two buyers, one shelf ---------------------------- */}
      <section className="shell py-24 md:py-36">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.3em]"
          style={{ color: BLUE }}
        >
          Retail and wholesale, same shelf
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[18ch] font-extrabold uppercase leading-[1.0]">
          One price list, two kinds of buyer
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              A Dubai reseller sells the same laptop twice over: one to a
              traveller who wants it today, fifty to a shop that will resell
              them.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              The usual answer is two websites — a retail store, and a B2B
              portal where the price hides behind a login, an account approval
              and a quote request.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              Here there is one shop. The ladder is printed on the product page,
              and the tenth unit drops the price in the cart in front of
              everybody.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- the ladder, drawn ------------------------------------------- */}
      <section className="shell pb-24 md:pb-36">
        <div
          className="rounded-[1.25rem] px-6 py-10 md:rounded-[2rem] md:px-14 md:py-16"
          style={{ backgroundColor: "#FFFFFF", boxShadow: `inset 0 0 0 1px ${LINE}` }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
              Price per unit, AED
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
              MacBook Pro 14&quot; M4 Pro · 512 GB
            </p>
          </div>
          <div className="mt-8 md:mt-12">
            <PriceLadder rows={LADDER} accent={BLUE} />
          </div>
          <p className="mt-10 max-w-[62ch] text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
            Medusa price lists carry the tiers, the product page prints them,
            and the cart applies them the moment the quantity crosses. No B2B
            portal, no login for prices, no invoice on credit.
          </p>
        </div>
      </section>

      {/* ---- three moves, the shot beside each ---------------------------- */}
      <section className="shell pb-20 md:pb-32">
        <Moves moves={MOVES} edge={EDGE} />
      </section>

      {/* ---- the shop, dragged past --------------------------------------- */}
      <section style={{ borderTop: `2px solid ${INK}` }}>
        <p className="shell pt-16 text-[11px] font-bold uppercase tracking-[0.3em] opacity-60 md:pt-24">
          The shop we shipped
        </p>
        <Filmstrip shots={STRIP} edge={EDGE} />
      </section>

      {/* ---- 390 px first -------------------------------------------------- */}
      <section style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="shell flex flex-wrap items-baseline justify-between gap-4 pt-16 md:pt-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: BLUE }}>
            Drawn at 390 px, then widened
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
            Bottom nav · sticky buy-bar · filter sheet
          </p>
        </div>
        <PhoneRail shots={PHONES} edge={EDGE} />
      </section>

      {/* ---- the console the owner actually opens ------------------------- */}
      <section className="shell py-20 md:py-32" style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: BLUE }}>
          The back office
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[20ch] font-extrabold uppercase leading-[1.0]">
          The owner never opens Medusa
        </SplitReveal>
        <Reveal>
          <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3">
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              A commerce engine ships with an admin built for developers. The
              person running this shop is not one, and reads Russian.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              So the console lives inside the same Next.js app, in their
              language, with task names instead of Medusa nouns — and the admin
              token stays in an httpOnly cookie the browser never reads.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              Every write goes through a narrow endpoint of its own. There is no
              generic proxy handing the whole admin API to a browser tab.
            </p>
          </div>
        </Reveal>
        <div className="mt-14 md:mt-20">
          <AssetShelf items={ADMIN} plain ratio="aspect-[16/10]" edge={EDGE} />
        </div>
      </section>

      {/* ---- what it refuses to fake -------------------------------------- */}
      <section className="shell pb-8 md:pb-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: BLUE }}>
          How it runs
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] font-extrabold uppercase leading-[1.0]">
          Built to be handed over
        </SplitReveal>
        <Reveal y={18} stagger={0.06}>
          {RUNS.map(([title, note]) => (
            <div
              key={title}
              className="mt-0 grid gap-2 py-7 md:grid-cols-[22%_1fr] md:gap-10"
              style={{ borderTop: `1px solid ${LINE}` }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.25em]">
                {title}
              </p>
              <p className="max-w-[64ch] text-[17px] font-light leading-relaxed opacity-85 md:text-[19px]">
                {note}
              </p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---- the count, and what came out --------------------------------- */}
      <section className="shell pb-24 pt-14 md:pb-32 md:pt-20">
        <Counters
          items={p.facts ?? []}
          className="grid gap-px md:grid-cols-3"
          itemClassName="py-10 md:py-16"
          labelClassName="mt-4 max-w-[24ch] text-[11px] font-bold uppercase leading-snug tracking-[0.2em] opacity-60"
        />
        <Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <p className="display-3 max-w-[14ch] font-extrabold uppercase leading-[1.05]">
              What came out
            </p>
            <div className="flex flex-col gap-4 md:col-span-2">
              {p.outcome.map((line) => (
                <p
                  key={line}
                  className="pb-4 text-[17px] font-light leading-relaxed md:text-[19px]"
                  style={{ borderBottom: `1px solid ${LINE}` }}
                >
                  {line}
                </p>
              ))}
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
                Medusa 2 · Next.js 15 · PostgreSQL · Redis · Playwright
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out ---------------------------------------------------------- */}
      <section className="shell pb-24 md:pb-32">
        <Link
          href={`/work/${next.slug}`}
          className="group block pt-8"
          style={{ borderTop: `2px solid ${INK}` }}
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
