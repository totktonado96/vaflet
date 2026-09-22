import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import ArrowNE from "@/components/ArrowNE";
import Footer from "@/components/Footer";
import SplitReveal from "@/components/SplitReveal";
import { AssetShelf, Counters, DriftShot, Filmstrip, PhoneRail, Reveal } from "@/components/case/kit";
import { PROJECTS } from "@/lib/projects";
import { AMBER, BLUSH, EDGE_DARK, EDGE_LIGHT, FIRE, INK, LIME, LINE_DARK, LINE_LIGHT, PAPER } from "./palette";
import { Ecosystem, OfflineSwitch, OrderPath, ServerArt, type Product, type Step } from "./parts";

/**
 * sahypa.menu is not one product, and the case must not read like one. Its own
 * front page gives each part a colour — fire for the table, amber for the
 * waiter, ink for the till, green for the panel, blush for the server — so the
 * case walks through them in those colours, after first following one order
 * across all five. The skin is the product's: warm paper, Unbounded, fire.
 */

const p = PROJECTS.find((x) => x.slug === "sahypa")!;
const TITLE = "SAHYPA.MENU — Vaflet LLC";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/sahypa" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/sahypa",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const S = (n: string) => `/photos/sahypa/${n}.jpg`;

const PRODUCTS: Product[] = [
  {
    key: "Guest",
    name: "The table",
    who: "The guest",
    where: "their own phone, no app",
    line: "A camera on the code at the table opens the menu in the browser. Nothing to install, nobody to sign up — and one order for the whole table, from as many phones as sit at it.",
    plate: FIRE,
    ink: "#FFFFFF",
    screen: { src: S("g-cover"), alt: "Michelle Cafe's menu at table 5: reviews, the café's hours, a banner and the sections as photo tiles", kind: "phone" },
  },
  {
    key: "Waiter",
    name: "Waiter’s phone",
    who: "Waiters",
    where: "their own phones, in a browser",
    line: "The room on the waiter’s own phone: every table, the ones calling first. A round from a table rings one way and a call another, so a glance at the pocket is enough.",
    plate: AMBER,
    ink: INK,
    screen: { src: S("w-room"), alt: "The waiter's room screen: tables as tiles, one lit with a new order", kind: "phone" },
  },
  {
    key: "Till",
    name: "Till",
    who: "Cashier and manager",
    where: "any Windows computer",
    line: "An ordinary Windows computer becomes the till. Cash, card or both, the change worked out, the shift closed on a blind count and a printed Z-report.",
    plate: INK,
    ink: "#FFFFFF",
    screen: { src: S("t-room"), alt: "The till's room screen: the tables by area, a rail of the cashier's screens on the left", kind: "desk" },
  },
  {
    key: "Panel",
    name: "Owner’s panel",
    who: "Owner and manager",
    where: "any browser, even at home",
    line: "The menu with photos, the floor and its QR codes, staff with a PIN and permissions each, revenue, what sells and what guests say — from any browser.",
    plate: LIME,
    ink: "#FFFFFF",
    screen: { src: S("p-menu"), alt: "The owner's panel: the menu as photo cards by section, the stop list one tap away", kind: "desk" },
  },
  {
    key: "Server",
    name: "Restaurant server",
    who: "Nobody — it runs itself",
    where: "the till’s own computer",
    line: "The restaurant’s own copy of the system, on the computer by the till. The orders, the till and the printers live on it, which is why a shift does not stop when the internet does.",
    plate: BLUSH,
    ink: INK,
    art: <ServerArt />,
  },
];

/** Order #17, from the table to the owner's figures. */
const STEPS: Step[] = [
  {
    title: "The guest orders from the table",
    body: "A steak, plov, a lemonade and an ayran leave the guest’s own phone as order #17 — with the service charge worked out before anyone asks.",
    screen: { src: S("g-orders-sent"), alt: "The guest's order sheet: order #17, sent to the waiter, with its lines and total", kind: "phone" },
  },
  {
    title: "The waiter accepts it",
    body: "It lands on the waiter’s phone with its own ring. One tap checks it and accepts it; a guest’s order is not fired until somebody on the floor has.",
    screen: { src: S("w-round"), alt: "The waiter's phone: a table with a new round from the guest, and the button that accepts it", kind: "phone" },
  },
  {
    title: "The kitchen gets its ticket",
    body: "Accepting prints it. Hot dishes to the kitchen, drinks to the bar, each on its own slip — what to cook, and not a single price.",
    screen: { src: S("s-kitchen"), alt: "A kitchen ticket: the table, the waiter, and the dishes to cook with no prices", kind: "slip" },
  },
  {
    title: "The till closes the table",
    body: "Cash, card or both. The change comes up in green, and a sum below the bill cannot be taken — not by the screen, not by the server.",
    screen: { src: S("t-pay"), alt: "The till's payment screen: the table's check on the left, cash and card and a keypad on the right", kind: "desk" },
  },
  {
    title: "The owner sees the result",
    body: "The day’s revenue, the average check and what sold, in the panel. From a laptop at home as easily as from the office.",
    screen: { src: S("p-analytics"), alt: "The panel's analytics: revenue, orders, the average check and the best-selling dishes", kind: "desk" },
  },
];

const GUEST = [
  { src: S("g-cover"), caption: "The table — reviews, hours and the sections as photos" },
  { src: S("g-section"), caption: "A section — every dish with its photo and price" },
  { src: S("g-dish"), caption: "A dish — its options, a note, how many" },
  { src: S("g-cart"), caption: "The cart — each guest’s dishes under their own name" },
  { src: S("g-orders-accepted"), caption: "The order — accepted by the waiter, in real time" },
  { src: S("g-bill"), caption: "The bill — dishes, service, and what to pay" },
  { src: S("g-call"), caption: "Call a waiter — one tap, and it says one is coming" },
  { src: S("g-reviews"), caption: "Reviews — only from people who sat at a table" },
  { src: S("g-about"), caption: "The place — hours, the way there, how to reach it" },
];

const WAITER = [
  { src: S("w-room"), caption: "The room — every table, the calling ones first" },
  { src: S("w-round"), caption: "A new round — checked and accepted in one tap" },
  { src: S("w-table"), caption: "A table — its rounds and its check" },
  { src: S("w-stop"), caption: "The stop list — a dish off every guest’s menu at once" },
  { src: S("w-settings"), caption: "Settings — sound, the colour scheme, sign out" },
];

const TILL = [
  { src: S("t-signin"), caption: "Sign-in — pick yourself, type a four-digit PIN" },
  { src: S("t-room"), caption: "The room — every table by area, takeaway and delivery on top" },
  { src: S("t-table"), caption: "A table — the dish grid on the left, the round building on the right" },
  { src: S("t-options"), caption: "A dish with a choice — size, extras, and what each costs" },
  { src: S("t-table-sent"), caption: "Sent — every line accepted, the table’s total waiting to be paid" },
  { src: S("t-pay"), caption: "Payment — cash, card or both, and the change in green" },
  { src: S("t-change"), caption: "The change screen — it stays until somebody dismisses it" },
  { src: S("t-takeaway"), caption: "Takeaway — a sale over the counter, straight to payment" },
  { src: S("t-drawer"), caption: "The drawer — float, takings, movements and the shift’s close" },
];

/** Where the line is drawn, in the product's own words. */
const KNOWS = [
  [
    "No account, ever",
    "No sign-up, no phone number, no app. A phone mints its own token, the server keeps it in a cookie it set, and it never travels in a link — a token in a query string is a credential in every proxy log.",
  ],
  [
    "One restaurant’s own guests",
    "«First seen» means here, not on the platform: a restaurant is never shown where else a guest eats. Ask for somebody else’s guest and the answer is that there is no such guest.",
  ],
  [
    "Nothing reaches the till",
    "Guest history, events and reviews stay in the cloud and never replicate to the restaurant’s computer. The machine on the floor has no question they answer.",
  ],
  [
    "The funnel counts itself honestly",
    "Menu opened, section opened, dish opened, cart opened — measured by the product itself, with no third-party script on a guest’s phone, and sent only after the screen has already drawn. The fifth step is read from the orders, so the surface being measured cannot inflate its own figure.",
  ],
  [
    "A review comes from a seat",
    "Only from a table the restaurant’s own staff closed, once per seat, within a fortnight. The restaurant may answer it or report it, and only the platform can take it down — until then it stands exactly as written.",
  ],
  [
    "Nobody is named",
    "A guest is the number their table calls them. The name in the panel is the restaurant’s own note to itself, and the guest is never shown it.",
  ],
];

/** The decisions that let a restaurant run it without us. */
const RUNS = [
  [
    "Four languages",
    "Turkmen, Russian, English and Turkish on every screen — the guest’s, the waiter’s, the till and the panel. A dish’s own name is translated by the restaurant, and the guest’s phone picks it up.",
  ],
  [
    "People",
    "Owner, manager, waiter and cashier, each with permissions of their own and a PIN for the floor. The till draws only the doors a job needs, and every door still checks on its own.",
  ],
  [
    "Updates",
    "The restaurant’s computer checks for a new version every fifteen minutes and installs it only when the shift is closed. If the new one does not come up healthy, it rolls itself back.",
  ],
  [
    "Backups",
    "Every six hours, checked for integrity, kept on the computer itself — so the restaurant’s own data does not depend on the line out of it either.",
  ],
  [
    "Paper",
    "Kitchen tickets, receipts and the Z-report go to ordinary network thermal printers. A printer that is off or out of paper never fails an order, a payment or a closed shift.",
  ],
  [
    "The bill, asked for from the table",
    "Guests press «ask for the bill» on their phones. The cloud takes the tap, the restaurant’s own machine decides from its own database whether anything has changed, and prints once — a second identical request prints nothing, and a jammed printer leaves the next one free to try.",
  ],
  [
    "Who owns what",
    "There is no merge: every kind of record has one owner. The price of a dish is the cloud’s, having run out of it is the kitchen’s, and a ticket is born in the cloud when a guest scans and becomes the machine’s the moment the floor accepts it. A new kind of record does not compile until somebody has decided.",
  ],
  [
    "A code that outlives us",
    "A table’s address is derived, not stored: six characters with no 0 or O, no 1 or l, drawn once for the restaurant and never changed. Printed codes outlive deployments, so nothing on the wall has to be reprinted.",
  ],
  [
    "The public page",
    "Every restaurant on the system is in the directory at sahypa.menu, with its menu, hours and reviews — and a review can only come from a table somebody actually sat at.",
  ],
];

const para = "text-[17px] leading-relaxed opacity-80 md:text-[19px]";

function Pill({ children }: { children: string }) {
  return <p className="sh-pill">{children}</p>;
}

export default function SahypaPage() {
  const next = PROJECTS[(PROJECTS.findIndex((x) => x.slug === "sahypa") + 1) % PROJECTS.length];
  const paper = { backgroundColor: PAPER, color: INK };
  const ink = { backgroundColor: INK, color: "#FFFFFF" };

  return (
    <main className="sh-case" style={paper}>
      {/* ---- the name --------------------------------------------------- */}
      <section className="pt-32 md:pt-44" style={paper}>
        <div className="shell">
          <Link
            href="/work"
            className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4 hover:bg-[#13161C] hover:text-white hover:no-underline"
          >
            ← All work
          </Link>
          <div className="mt-10">
            <Pill>Restaurant system · Turkmenistan</Pill>
          </div>
          {/* the wordmark's rule: the product after the dot is quieter than the name */}
          <SplitReveal as="h1" onLoad className="display-1 sh-title mt-6">
            sahypa<span className="opacity-45">.menu</span>
          </SplitReveal>
          <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <p className="max-w-[52ch] text-[17px] leading-relaxed opacity-85 md:text-[19px]">{p.desc}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-60">
              {p.services.split(" · ").map((s, i) => (
                <Fragment key={s}>
                  {i > 0 && " · "}
                  <span className="whitespace-nowrap">{s}</span>
                </Fragment>
              ))}
            </p>
          </div>
        </div>

        <div className="mt-12 px-5 md:mt-16 md:px-10">
          <DriftShot
            src={S("l-hero")}
            alt="sahypa.menu's front page: “Not a menu. A restaurant in one system”, beside the guest menu, the panel, the waiter's phone and the till around the brand's S"
            className="aspect-[16/10] w-full"
            priority
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ boxShadow: `inset 0 0 0 1px ${EDGE_LIGHT}` }}
            />
          </DriftShot>
        </div>

      </section>

      {/* ---- the brief --------------------------------------------------- */}
      <section className="shell py-24 md:py-36" style={paper}>
        <Pill>The brief</Pill>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] leading-[1.06]">
          One system instead of a zoo of apps
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              A restaurant in Ashgabat usually runs on a zoo: a QR menu from
              one vendor, a till from another, orders carried to the kitchen by
              hand, and the day’s takings added up in a notebook.
            </p>
            <p className={para}>
              Every one of them stops when the internet does, and here it does
              — the provider drops, a storm passes, somebody reboots the router
              in the middle of a Friday.
            </p>
            <p className={para}>
              So we built the whole restaurant as one system: the guest’s table,
              the waiter’s phone, the till, the owner’s panel, and a server in
              the room that keeps the floor working on its own.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- the family -------------------------------------------------- */}
      <section className="shell pb-24 md:pb-36" style={paper}>
        <Pill>The system</Pill>
        <SplitReveal className="display-2 mt-8 max-w-[15ch] leading-[1.06]">
          Five products, one system
        </SplitReveal>
        <p className="mt-8 max-w-[46ch] text-[15px] leading-relaxed opacity-70 md:text-[17px]">
          Each wears the colour its own front page gives it. Point at one to see
          who holds it and what it runs on.
        </p>
        <div className="mt-14 md:mt-20">
          <Ecosystem products={PRODUCTS} line={LINE_LIGHT} />
        </div>
        <p className="mt-14 max-w-[60ch] text-[15px] leading-relaxed opacity-70 md:mt-20 md:text-[17px]">
          Next on the same core is <span className="font-bold">sahypa.delivery</span>, under
          the same subscription — and behind all of them sits a platform panel of
          our own, where restaurants are brought on, looked after, and switched
          off and back on without losing a thing.
        </p>
      </section>

      {/* ---- one order, five products ------------------------------------ */}
      <section className="shell py-24 md:py-0" style={ink}>
        <div className="md:pt-32">
          <Pill>The path of one order</Pill>
          <SplitReveal className="display-2 mt-8 max-w-[16ch] leading-[1.06]">
            Nobody rewrites anything
          </SplitReveal>
          <p className="mt-8 max-w-[46ch] text-[15px] leading-relaxed opacity-70 md:text-[17px]">
            One order crosses the whole system on its own. Scroll it along.
          </p>
        </div>
        <div className="mt-14 md:mt-0">
          <OrderPath steps={STEPS} />
        </div>
      </section>

      {/* ---- the table --------------------------------------------------- */}
      <section style={{ backgroundColor: FIRE, color: "#fff" }}>
        <div className="shell pt-24 md:pt-36">
          <Pill>Guest</Pill>
          <SplitReveal className="display-2 mt-8 max-w-[15ch] leading-[1.06]">
            The table orders for itself
          </SplitReveal>
          <Reveal>
            <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
              <p className={para}>
                A camera on the code at the table, and the menu opens in the
                browser — in Turkmen, Russian, English or Turkish, with no app
                and no sign-up.
              </p>
              <p className={para}>
                Every phone at the table adds to one order, each guest’s dishes
                under their own name, and the bill reads the same way. A waiter
                or the bill is one tap away.
              </p>
              <p className={para}>
                The page wears the restaurant’s own look, keeps the menu
                readable with no signal, and is the only place a review can be
                written — by somebody who sat there.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="shell flex flex-wrap items-baseline justify-between gap-4 pt-16 md:pt-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">Michelle Cafe, table 5</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">390 px · a phone over a plate</p>
        </div>
        <PhoneRail shots={GUEST} />
        <div className="shell pb-24 md:pb-36">
          <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-14">
            <div>
              <Pill>Places</Pill>
              <p className="sh-display mt-6 max-w-[14ch] text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.08]">
                Found before anybody sits down
              </p>
              <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed opacity-85">
                Every restaurant on the system also gets a public page in the
                directory at sahypa.menu: its menu, its hours and its reviews,
                sorted by name, by rating, or by who is open now.
              </p>
            </div>
            <div
              className="relative aspect-[16/10] w-full overflow-hidden rounded-[1rem] md:rounded-[1.25rem]"
              style={{ boxShadow: "0 30px 60px -24px rgba(0,0,0,0.35)" }}
            >
              <Image
                src={S("l-places")}
                alt="The places directory: search, sorting by name, rating or open now, and restaurant cards with their photos"
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---- the waiter -------------------------------------------------- */}
      <section style={{ backgroundColor: AMBER, color: INK }}>
        <div className="shell pt-24 md:pt-36">
          <Pill>Waiter</Pill>
          <SplitReveal className="display-2 mt-8 max-w-[15ch] leading-[1.06]">
            The whole floor in a pocket
          </SplitReveal>
          <Reveal>
            <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
              <p className={para}>
                Waiters use their own phones. The room opens in a browser from
                the restaurant’s own server, so there is nothing to install and
                nothing that needs the internet.
              </p>
              <p className={para}>
                One screen: the tables, the calling ones first. A new round
                rings in two rising runs, a call in three pulses — told apart
                without looking.
              </p>
              <p className={para}>
                The stop list sits in the header. A dish marked out there leaves
                every guest’s menu at once, so nobody orders what the kitchen
                no longer has.
              </p>
            </div>
          </Reveal>
        </div>
        <PhoneRail shots={WAITER} edge={EDGE_LIGHT} />
      </section>

      {/* ---- what the scan leaves behind ---------------------------------- */}
      <section className="shell py-24 md:py-36" style={paper}>
        <Pill>What it knows</Pill>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] leading-[1.06]">
          A scan leaves more than an order
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              A restaurant has never had a way to count the people who walk in.
              Here every phone that scans is counted — as a device, not as a
              person, which is a distinction the panel makes in writing.
            </p>
            <p className={para}>
              Some of it is service, this minute: a table whose phones are about
              to die shows the waiter a figure, because a dead phone is a table
              that has to be served by hand — the round taken on paper and the
              bill carried over.
            </p>
            <p className={para}>
              The rest is the restaurant’s own trade: who came back, what they
              order every time, which sections guests open, and how far a phone
              gets before it stops short of ordering.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-10">
          <figure>
            <div
              className="relative aspect-[1170/2532] w-full overflow-hidden rounded-[1.1rem] md:rounded-[1.6rem]"
              style={{ boxShadow: `0 30px 60px -28px rgba(19,22,28,0.4), inset 0 0 0 1px ${EDGE_LIGHT}` }}
            >
              <Image
                src={S("w-battery")}
                alt="The waiter's room: table 2 carries a 9 per cent battery chip beside its guest count"
                fill
                sizes="(min-width: 768px) 32vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 text-[13px] leading-relaxed opacity-75">
              <span className="font-bold">9% at table 2.</span> It shows at twenty
              per cent and below, takes the lowest phone at the table, and is
              forgotten after half an hour — a healthy battery is not news, and
              an icon on every table is an icon nobody sees.
            </figcaption>
          </figure>

          <div className="grid gap-8 md:gap-10">
            {[
              {
                src: S("p-guests"),
                alt: "The panel's guests board: devices, new in 30 days, who came back, and rounds that came from a phone",
                bold: "Devices, not people.",
                note: "The board says so under its own table: a cleared browser, a private tab, a second phone or a shared one each start a new guest, and returns are undercounted. A screen that promised «regulars» would be claiming more than the row holds.",
              },
              {
                src: S("p-guest"),
                alt: "One guest's page: visits, rounds, what they spent, what they keep ordering, and every visit with its tickets",
                bold: "What this one keeps ordering.",
                note: "Every seating, every ticket inside it, and a private name and note the restaurant writes for itself — «Meret, table by the window». None of it leaves this restaurant.",
              },
            ].map((card) => (
              <figure key={card.src}>
                <div
                  className="relative aspect-[16/10] w-full overflow-hidden rounded-[1rem] md:rounded-[1.25rem]"
                  style={{ boxShadow: `0 30px 60px -28px rgba(19,22,28,0.35), inset 0 0 0 1px ${EDGE_LIGHT}` }}
                >
                  <Image src={card.src} alt={card.alt} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
                </div>
                <figcaption className="mt-4 max-w-[70ch] text-[13px] leading-relaxed opacity-75">
                  <span className="font-bold">{card.bold}</span> {card.note}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <p className="sh-display max-w-[20ch] text-[clamp(1.5rem,2.4vw,2.2rem)] leading-[1.1]">
            And the part it refuses to know
          </p>
          <Reveal y={16} stagger={0.05}>
            {KNOWS.map(([title, note]) => (
              <div
                key={title}
                className="grid gap-2 py-6 md:grid-cols-[26%_1fr] md:gap-10"
                style={{ borderTop: `1px solid ${LINE_LIGHT}` }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{title}</p>
                <p className="max-w-[64ch] text-[16px] leading-relaxed opacity-85 md:text-[17px]">{note}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---- the till ---------------------------------------------------- */}
      <section style={ink}>
        <div className="shell pt-24 md:pt-36">
          <Pill>Till</Pill>
          <SplitReveal className="display-2 mt-8 max-w-[16ch] leading-[1.06]">
            An ordinary Windows computer is the till
          </SplitReveal>
          <Reveal>
            <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
              <p className={para}>
                One installer turns any Windows computer into the till and the
                restaurant’s server at once. A second till, or a waiters’
                station, sits beside it.
              </p>
              <p className={para}>
                Who signs in decides what they see: a cashier gets the room,
                takeaway, checks and the drawer; a waiter only the room and the
                stop list. Everybody signs in with a PIN.
              </p>
              <p className={para}>
                It stops behaving like a web page: no right-click menu, no photo
                peeled off the screen, no zoom — a double tap adds a second
                portion instead.
              </p>
            </div>
          </Reveal>
        </div>
        <Filmstrip shots={TILL} edge={EDGE_DARK} />
      </section>

      {/* ---- the panel --------------------------------------------------- */}
      <section style={{ backgroundColor: LIME, color: "#fff" }}>
        <div className="shell py-24 md:py-36">
          <Pill>Panel</Pill>
          <SplitReveal className="display-2 mt-8 max-w-[15ch] leading-[1.06]">
            The owner sees it from home
          </SplitReveal>
          <Reveal>
            <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
              <p className={para}>
                The panel opens in any browser: the menu with photos and a stop
                list, the floor with its QR codes, staff with a PIN and
                permissions each.
              </p>
              <p className={para}>
                A paper menu in the restaurant’s own colours and fonts, A4 or
                A5, straight to PDF — and one sheet with every table’s code, to
                print, cut and stick. The code never changes.
              </p>
              <p className={para}>
                Revenue, the average check, what sells and how staff perform,
                for any period, out to Excel. Reviews arrive here too, and get
                answered where the guest will read it.
              </p>
            </div>
          </Reveal>
          <div className="mt-16 md:mt-24">
            <AssetShelf
              plain
              ratio="aspect-[16/10]"
              edge={EDGE_DARK}
              items={[
                { src: S("p-summary"), title: "Summary", note: "The day so far — revenue, checks, the floor, what sells", wide: true },
                { src: S("p-menu"), title: "Menu", note: "Sections as photos, in the order a guest sees them" },
                { src: S("p-section"), title: "A section", note: "Every dish, its price, and whether it is on" },
                { src: S("p-tables"), title: "Floor", note: "Zones and tables, each with the code a guest scans" },
                { src: S("p-staff"), title: "Staff", note: "A role, a PIN and permissions per person" },
                { src: S("p-orders"), title: "Orders", note: "What each table ordered and where the ticket got to" },
                { src: S("p-analytics"), title: "Analytics", note: "Any period, by section or by dish, out to Excel" },
                { src: S("p-reviews"), title: "Reviews", note: "Read, answered, or reported", wide: true },
              ]}
            />
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 md:mt-24 md:gap-10">
            {[
              { src: S("p-print-menu-sheet"), title: "The printed menu", note: "Its own colours and type, A4 or A5, straight to PDF" },
              { src: S("p-qr-sheet"), title: "The table codes", note: "One sheet to print, cut and stick — the code never changes" },
            ].map((sheet) => (
              <figure key={sheet.src}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1rem] bg-white md:rounded-[1.5rem]">
                  <Image
                    src={sheet.src}
                    alt={`${sheet.title} — ${sheet.note}`}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-contain p-4 md:p-8"
                  />
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em]">{sheet.title}</span>
                  <span className="text-[11px] opacity-70">{sheet.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---- paper ------------------------------------------------------- */}
      <section className="shell py-24 md:py-36" style={paper}>
        <Pill>Paper</Pill>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] leading-[1.06]">
          Four slips, and none of them stops a shift
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              The kitchen ticket says what to cook and nothing about money. It
              prints when a waiter takes a round — or accepts one a guest sent —
              so it prints exactly once.
            </p>
            <p className={para}>
              The table’s bill prints when a waiter presses for it, or when the
              guests ask for it from their phones — the cloud takes the tap, and
              the printer in the room answers by itself.
            </p>
            <p className={para}>
              The receipt ends on the total, so a copy printed later reads like
              the first; the Z-report closes the drawer on a blind count. A
              printer that is off or out of paper never fails any of it.
            </p>
          </div>
        </Reveal>
        <Reveal y={40} stagger={0.12}>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 md:mt-24 md:grid-cols-4 md:gap-10">
            {[
              { src: S("s-kitchen"), title: "Kitchen ticket", note: "No prices, one per station" },
              { src: S("s-bill"), title: "The table’s bill", note: "Ends on what is owed" },
              { src: S("s-receipt"), title: "Receipt", note: "The total as the last line" },
              { src: S("s-z"), title: "Z-report", note: "The shift, counted blind" },
            ].map((slip) => (
              <figure key={slip.src}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1rem] md:rounded-[1.5rem]" style={{ backgroundColor: BLUSH }}>
                  <Image
                    src={slip.src}
                    alt={`${slip.title} — ${slip.note}`}
                    fill
                    sizes="(min-width: 768px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-6 md:p-10"
                  />
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em]">{slip.title}</span>
                  <span className="text-[11px] opacity-70">{slip.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---- the server -------------------------------------------------- */}
      <section className="shell py-24 md:py-36" style={{ backgroundColor: BLUSH, color: INK }}>
        <Pill>Server</Pill>
        <SplitReveal className="display-2 mt-8 max-w-[14ch] leading-[1.06]">
          Internet’s down — the shift goes on
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className={para}>
              The restaurant runs its own copy of the system on the till’s
              computer — Postgres inside the app, nothing else installed. The
              orders, the tables, the till and the printing live there.
            </p>
            <p className={para}>
              So the provider can drop and the floor does not notice: waiters,
              the till and the printers talk to the server in the room, not to
              the cloud.
            </p>
            <p className={para}>
              When the line comes back, whatever piled up goes to the cloud by
              itself, in order. Nobody presses anything. Pull the cable below
              and see.
            </p>
          </div>
        </Reveal>
        <div className="mt-14 md:mt-20">
          <OfflineSwitch />
        </div>
        <p className="mt-6 text-[12px] opacity-60">A drawing of the behaviour; the counts are the drawing’s own.</p>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center">
          <div>
            <p className="sh-display max-w-[16ch] text-[clamp(1.5rem,2.4vw,2.2rem)] leading-[1.1]">
              And the owner can see that it is up
            </p>
            <p className="mt-5 max-w-[42ch] text-[16px] leading-relaxed opacity-80">
              The panel lists the restaurant’s own computer, whether it is up and
              when it last said so — the one page that answers “is the till
              talking to us?” without a phone call.
            </p>
          </div>
          <div
            className="relative aspect-[16/10] w-full overflow-hidden rounded-[1rem] md:rounded-[1.25rem]"
            style={{ boxShadow: "0 30px 60px -24px rgba(0,0,0,0.3)" }}
          >
            <Image
              src={S("p-server")}
              alt="The panel's restaurant server page: the machine, its state and when it was last seen"
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---- how it runs ------------------------------------------------- */}
      <section className="shell py-20 md:py-32" style={ink}>
        <Pill>How it runs</Pill>
        <SplitReveal className="display-2 mt-8 max-w-[15ch] leading-[1.06]">
          Built for a restaurant to run alone
        </SplitReveal>
        <div className="mt-14 md:mt-20">
          <Reveal y={18} stagger={0.06}>
            {RUNS.map(([title, note]) => (
              <div
                key={title}
                className="grid gap-2 py-7 md:grid-cols-[22%_1fr] md:gap-10"
                style={{ borderTop: `1px solid ${LINE_DARK}` }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{title}</p>
                <p className="max-w-[64ch] text-[17px] leading-relaxed opacity-85 md:text-[19px]">{note}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---- the count, and what came out -------------------------------- */}
      <section className="shell pb-24 pt-6 md:pb-32 md:pt-10" style={ink}>
        <Counters
          items={p.facts ?? []}
          className="grid gap-px md:grid-cols-3"
          itemClassName="py-10 md:py-16"
          labelClassName="mt-4 max-w-[24ch] text-[11px] font-bold uppercase leading-relaxed tracking-[0.18em] opacity-60"
        />
        <Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <p className="display-3 max-w-[14ch] leading-[1.05]">What came out</p>
            <div className="flex flex-col gap-4 md:col-span-2">
              {p.outcome.map((line) => (
                <p
                  key={line}
                  className="pb-4 text-[17px] leading-relaxed md:text-[19px]"
                  style={{ borderBottom: `1px solid ${LINE_DARK}` }}
                >
                  {line}
                </p>
              ))}
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] opacity-60">{p.stack}</p>
              <a
                href="https://sahypa.menu/"
                target="_blank"
                rel="noopener noreferrer"
                className="sh-pill mt-4 gap-2 self-start"
              >
                sahypa.menu <ArrowNE />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out --------------------------------------------------------- */}
      <section className="shell pb-24 md:pb-32" style={ink}>
        <Link
          href={`/work/${next.slug}`}
          className="group relative isolate block overflow-hidden border-t-2 border-white pb-6 pt-8 md:pb-8"
          data-cursor-text={next.title}
        >
          {/* the ink rises and the reader leaves — same exit on every case */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-white transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
          />
          <span className="block text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[450ms] group-hover:text-[#13161C]">
            Next project
          </span>
          <span className="display-2 mt-2 flex items-baseline gap-5 leading-[1.0] transition-colors duration-[450ms] group-hover:text-[#13161C]">
            <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
              {next.title}
            </span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </span>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
