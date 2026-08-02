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
  Reveal,
} from "@/components/case/kit";
import {
  CaseFx,
  Deal,
  GateHead,
  HalftoneWordmark,
  Meter,
  Pipeline,
  Rule,
  Tape,
  ViewerShot,
} from "./parts";
import { PROJECTS } from "@/lib/projects";

/**
 * MiniPACS + Vendo is our own product, so the case borrows the product's own
 * stone palette — limestone paper, obsidian ink, warm hairlines — and its
 * habit of setting technical truths in a monospace. Colour appears twice on
 * purpose: PACS-overlay orange in the dark reading room, and one clinical red
 * at the safety gate. Everything else stays stone.
 */

const p = PROJECTS.find((x) => x.slug === "minipacs")!;
const TITLE = "MINIPACS + VENDO — Vaflet LLC";

const PAPER = "#FAF9F6";
const CARD = "#F4F2EC";
const INK = "#0A0A0A";
const LINE = "#E2DED4";
// every pale shot gets a hairline: the product is as pale as this page
const EDGE = "rgba(10,10,10,0.16)";
// the colour DICOM overlays have worn since film went digital
const OVERLAY = "#F5A623";
const RED = "#B42318";

export const metadata: Metadata = {
  title: TITLE,
  description: p.desc,
  alternates: { canonical: "/work/minipacs" },
  openGraph: {
    type: "article",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: p.desc,
    url: "/work/minipacs",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: p.desc },
};

const S = (n: string) => `/photos/minipacs/${n}.jpg`;

const MOVES = [
  {
    kicker: "The worklist",
    line: "Every scan the clinic ever made, on one screen",
    src: S("worklist-grid"),
    alt: "The worklist as a grid of real studies — MRI brains, knees, CT sinuses",
  },
  {
    kicker: "The report",
    line: "The radiologist speaks. It types.",
    src: S("report"),
    alt: "Structured report with voice dictation beside its live PDF preview",
  },
  {
    kicker: "The handoff",
    line: "The patient leaves with a QR, not a CD",
    src: S("share-qr"),
    alt: "Share with patient: a QR code and a PIN-protected link over the viewer",
  },
];

const VENDO_SHELF = [
  {
    src: S("vendo-inbox"),
    title: "The inbox",
    note: "Every appointment every doctor has sent — one queue, with SLA aging",
    wide: true,
  },
  {
    src: S("vendo-wizard"),
    title: "Booking",
    note: "Real open slots from the live schedule — no phone tag",
  },
  {
    src: S("vendo-overview"),
    title: "The numbers",
    note: "Lead time, no-shows, referrer movement — watched, not guessed",
  },
  {
    src: S("vendo-referral-detail"),
    title: "One order, watched",
    note: "The same five states on the order itself — nobody has to call and ask",
    wide: true,
  },
];

const STRIP = [
  { src: S("dashboard"), caption: "Dashboard — the whole box at a glance" },
  { src: S("rbac"), caption: "Roles — 17 rights, 4 roles, editable" },
  { src: S("audit-log"), caption: "Audit — hash-chained, verified from the browser" },
  { src: S("patient-portal"), caption: "The patient side — scans on any phone, PIN first" },
  { src: S("vendo-settings"), caption: "White-label — the portal wears the clinic's name" },
  { src: S("vendo-digest"), caption: "The weekly digest — what stalls, flagged early" },
];

/** How it is sold and run — the guarantees the product prints, not implies. */
const DEAL = [
  [
    "Flat",
    "$300 a location a month for MiniPACS, $500 for Vendo, $640 for both. No per-study fees, no per-seat fees, no surprise line items.",
  ],
  [
    "Yours",
    "The archive lives on the clinic's own box with AES-256 encrypted backups — and a bulk importer that swallows the old archive on the way in.",
  ],
  [
    "Provable",
    "A hash-chained, append-only audit log verifiable from the browser, and a self-service Accounting of Disclosures report the front desk pulls itself.",
  ],
  [
    "Controlled",
    "An editable permission matrix — 17 rights across 4 roles — with instant session revocation when somebody leaves.",
  ],
  [
    "Honest",
    "No HL7 yet, and the site prints that instead of promising it. If the subscription ever lapses, the archive drops to read-only — never hostage.",
  ],
];

export default function MinipacsPage() {
  const next =
    PROJECTS[(PROJECTS.findIndex((x) => x.slug === "minipacs") + 1) % PROJECTS.length];

  return (
    <main data-case style={{ backgroundColor: PAPER, color: INK }}>
      <CaseFx />
      {/* ---- title, then the marble the product signs in on --------------- */}
      <section className="pt-32 md:pt-44">
        <div className="shell">
          <Link
            href="/work"
            className="text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4"
          >
            ← All work
          </Link>
          {/* the product's own masthead trick: the title in halftone, and the
              pointer blows the letters apart */}
          <h1 className="sr-only">MiniPACS + Vendo</h1>
          <HalftoneWordmark
            text="MINIPACS + VENDO"
            className="mt-6 h-[clamp(2.4rem,9.4vw,9.4rem)] w-full"
          />
          <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <p className="max-w-[48ch] text-[17px] font-light leading-relaxed md:text-[19px]">
              {p.desc}
            </p>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
              {p.services}
            </p>
          </div>
        </div>

        <div className="mt-12 px-5 md:mt-16 md:px-10">
          <DriftShot
            src={S("cover-dark")}
            alt="The MiniPACS mark — a stack of DICOM slices — with the wordmark, white on obsidian"
            className="aspect-[16/10] w-full"
            priority
          />
        </div>
      </section>

      {/* ---- the brief: rent, fax, and the way out ------------------------ */}
      <section className="shell py-24 md:py-36">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
          For independent imaging centers
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] font-extrabold uppercase leading-[1.0]">
          Own the archive. Retire the fax.
        </SplitReveal>
        <Reveal>
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3">
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              An independent imaging center rents its own archive: cloud PACS,
              $150 to $2,000 a month, priced by how much it scans. The images
              live in somebody else&rsquo;s data centre.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              And the referrals that feed the scanner still arrive by fax —
              unreadable, twice, or not at all, and always without a status
              anyone can check.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              We built the way out twice. MiniPACS puts the archive on one mini
              PC in the clinic. Vendo gives referring doctors a portal instead
              of a fax number. And this time the client was us — it is our own
              product.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- the front door itself: the sign-in over liquid marble ---------- */}
      <div className="px-5 pb-24 md:px-10 md:pb-36">
        <DriftShot
          src={S("login")}
          alt="The MiniPACS sign-in screen over a black-and-white liquid-marble field"
          className="aspect-[16/10] w-full"
        />
      </div>

      {/* ---- chapter one: the archive ------------------------------------- */}
      <Rule />
      <section className="shell pb-6 md:pb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 pt-16 md:pt-24">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]">
            01 — MiniPACS
          </p>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
            $300 a month, flat
          </p>
        </div>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] font-extrabold uppercase leading-[1.0]">
          The archive comes home
        </SplitReveal>
        <div className="mt-10 md:mt-4">
          <Moves moves={MOVES} edge={EDGE} />
        </div>
      </section>

      {/* ---- the reading room: lights off. The page itself dims on the way
              in (CaseFx), and the product's halftone cloth emerges with it --- */}
      <section
        data-dark
        className="inv mp-halftone"
        style={{ backgroundColor: INK, color: PAPER }}
      >
        <div className="shell pt-24 md:pt-36">
          <p
            className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]"
            style={{ color: OVERLAY }}
          >
            MRI Brain w wo contrast · 401 | T2 FLAIR · ww/wc 596 / 343
          </p>
          <SplitReveal className="display-2 mt-8 max-w-[16ch] font-extrabold uppercase leading-[1.0]">
            Reading happens in the dark
          </SplitReveal>
          <Reveal>
            <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3">
              <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
                No workstation, no install, no dongle: a study opens in any
                browser in under a second, on whatever machine the radiologist
                already has.
              </p>
              <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
                Series, viewports, window and level, cine — and the finished
                read signed as a DICOM PDF that travels inside the study
                itself.
              </p>
              <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
                Whatever the modality sends over C-STORE, the archive takes,
                indexes, and has on screen typically within about a minute of
                the scan.
              </p>
            </div>
          </Reveal>
        </div>
        {/* everything the archive accepts, dragged past by the scroll */}
        <div className="mt-14 md:mt-20">
          <Tape />
        </div>
        <div className="px-5 pb-24 pt-10 md:px-10 md:pb-36 md:pt-14">
          <ViewerShot
            src={S("viewer")}
            alt="The browser viewer: an axial MRI brain with classic orange DICOM overlays"
          />
        </div>
      </section>

      {/* ---- the deal: a meter that is not the product --------------------- */}
      <section className="shell py-24 md:py-36">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
          The deal
        </p>
        <SplitReveal className="display-2 mt-8 max-w-[18ch] font-extrabold uppercase leading-[1.0]">
          The bill does not watch the counter
        </SplitReveal>
        <div className="mt-14 md:mt-20">
          <Meter />
        </div>
        <div className="mt-16 md:mt-24">
          <Deal items={DEAL} />
        </div>
      </section>

      {/* ---- chapter two: the front door ----------------------------------- */}
      <Rule />
      <section className="shell pb-20 md:pb-28">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 pt-16 md:pt-24">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]">
            02 — Vendo
          </p>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
            $500 a month, flat
          </p>
        </div>
        <SplitReveal className="display-2 mt-8 max-w-[16ch] font-extrabold uppercase leading-[1.0]">
          A fax has no status
        </SplitReveal>
        <Reveal>
          <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3">
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              Referrals feed an imaging center, and most still arrive on paper
              a machine printed at 3 a.m. The problem is not the paper. It is
              that nobody can see where an order stands.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              Vendo is the portal the referring doctor actually logs into: an
              order in about a minute, booked straight into a real open slot
              in the clinic&rsquo;s schedule.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              From there both sides watch the same rail — so the front desk
              works one inbox instead of a fax tray, and the phone stops
              ringing with &ldquo;where is it?&rdquo;
            </p>
          </div>
        </Reveal>

        {/* the rail itself, on a real order off the demo inbox */}
        <div
          className="mt-16 rounded-[1.25rem] px-6 py-10 md:mt-24 md:rounded-[2rem] md:px-14 md:py-14"
          style={{ backgroundColor: CARD, boxShadow: `inset 0 0 0 1px ${LINE}` }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
              Xray — right clavicle, 2-view
            </p>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">
              Referred by Dr Elena Brooks
            </p>
          </div>
          <div className="mt-10 md:mt-14">
            <Pipeline />
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <AssetShelf items={VENDO_SHELF} plain ratio="aspect-[16/10]" edge={EDGE} />
        </div>
      </section>

      {/* ---- the safety gate: the one red on this page. The lab value runs
              down with the scroll and the ink flips red under 30 ------------- */}
      <section className="shell pb-24 md:pb-36">
        <GateHead />
        <Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              IV contrast with an eGFR under 30 risks nephrogenic systemic
              fibrosis, so the wizard refuses the booking before it exists:
              order the study without contrast, or call the clinic. An unsafe
              order never reaches the scanner.
            </p>
            <p className="text-[17px] font-light leading-relaxed opacity-80 md:text-[19px]">
              Pregnancy and implant screening ride the same step, so the front
              desk is never the last line of defence. This block is also the
              only red we allowed ourselves on this page.
            </p>
          </div>
        </Reveal>
        <div className="relative mt-14 aspect-[16/10] w-full overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem]">
          <Image
            src={S("vendo-safety-block")}
            alt="The booking wizard refusing MRI contrast at eGFR 22 with a red hard-block"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ boxShadow: `inset 0 0 0 1px ${RED}66` }}
          />
        </div>
      </section>

      {/* ---- the rest of the stack, dragged past ---------------------------- */}
      <Rule />
      <section>
        <p className="shell pt-16 font-mono text-[11px] font-bold uppercase tracking-[0.3em] opacity-60 md:pt-24">
          The rest of the stack
        </p>
        <Filmstrip shots={STRIP} edge={EDGE} />
      </section>

      {/* ---- what came out --------------------------------------------------- */}
      <section className="shell pb-24 pt-8 md:pb-32 md:pt-16">
        <Counters
          items={p.facts ?? []}
          className="grid gap-px md:grid-cols-3"
          itemClassName="py-10 md:py-16"
          labelClassName="mt-4 max-w-[24ch] font-mono text-[11px] font-bold uppercase leading-snug tracking-[0.2em] opacity-60"
        />
        <Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <p className="display-3 max-w-[14ch] font-extrabold uppercase leading-[1.05]">
              In production
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
              <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
                {p.stack}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- out -------------------------------------------------------------- */}
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
