"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { reducedMotion } from "@/components/case/kit";

gsap.registerPlugin(useGSAP);

type Patient = { id: string; name: string; dob: string; next: string };

/* Invented for this page. Chosen to break a lazy matcher: diacritics, an
   apostrophe, a hyphenated surname, a name given in family-name-first order,
   a leading consonant cluster — the kind of roster a kiosk actually meets. */
const ROSTER: Patient[] = [
  { id: "CHT-10041", name: "Yekaterina Volkova", dob: "1987-03-14", next: "2:15p · Dr. Osei, follow-up" },
  { id: "CHT-10042", name: "Siobhan O'Rourke", dob: "1994-11-02", next: "9:30a · Dr. Patel, new patient" },
  { id: "CHT-10043", name: "Nguyễn Thị Mai", dob: "1979-06-23", next: "11:00a · Dr. Osei, labs review" },
  { id: "CHT-10044", name: "Krzysztof Wiśniewski", dob: "1966-01-30", next: "3:45p · Dr. Farrow, post-op" },
  { id: "CHT-10045", name: "Xiomara Núñez-Villalobos", dob: "1990-09-08", next: "1:00p · Dr. Patel, annual" },
  { id: "CHT-10046", name: "Björn Håkansson", dob: "1983-12-19", next: "10:15a · Dr. Farrow, referral" },
  { id: "CHT-10047", name: "Aoife Ní Bhriain", dob: "1998-04-05", next: "4:30p · Dr. Osei, follow-up" },
  { id: "CHT-10048", name: "Dimitrios Papadopoulos", dob: "1971-07-11", next: "8:45a · Dr. Patel, imaging" },
  { id: "CHT-10049", name: "Meseret Alemu", dob: "2001-02-27", next: "2:45p · Dr. Farrow, new patient" },
  { id: "CHT-10050", name: "Grzegorz Kowalczyk", dob: "1988-10-16", next: "12:30p · Dr. Osei, follow-up" },
  { id: "CHT-10051", name: "Thandiwe Nkosi", dob: "1993-05-30", next: "9:00a · Dr. Patel, consult" },
  { id: "CHT-10052", name: "Marek Jelínek", dob: "1975-08-22", next: "5:00p · Dr. Farrow, annual" },
];

const EXAMPLES = ["Katerina Volkov", "Shivon Rourke"];
const STAGE_LABELS = ["Exact match", "Soundex", "Fuzzy match"] as const;

/** Lowercase, strip accents, fold hyphens/apostrophes to spaces — what a
 * kiosk's on-screen keyboard actually hands back. */
function fold(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-']/g, " ")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SOUNDEX_CODES: Record<string, string> = {
  b: "1", f: "1", p: "1", v: "1",
  c: "2", g: "2", j: "2", k: "2", q: "2", s: "2", x: "2", z: "2",
  d: "3", t: "3",
  l: "4",
  m: "5", n: "5",
  r: "6",
};

/**
 * Classic Soundex. The first letter is kept as itself; each of the next
 * three distinct consonant sounds becomes a digit, padded with zeros if the
 * word runs out. A vowel breaks a run of the same digit so it isn't
 * collapsed twice; H and W don't — "Ashcraft" and "Ashcroft" land on the
 * same code, the way the method has worked since the 1918 patent.
 */
function soundex(word: string): string {
  const w = word.replace(/[^a-z]/g, "");
  if (!w) return "0000";
  let code = w[0].toUpperCase();
  let last = SOUNDEX_CODES[w[0]] ?? "";
  for (let i = 1; i < w.length && code.length < 4; i++) {
    const ch = w[i];
    const digit = SOUNDEX_CODES[ch];
    if (digit) {
      if (digit !== last) code += digit;
      last = digit;
    } else if (ch !== "h" && ch !== "w") {
      last = "";
    }
  }
  return (code + "000").slice(0, 4);
}

/** Soundex over the whole name with the space squashed out, so a visitor
 * who runs the names together or leaves a gap out doesn't fail on that
 * alone — first name first, same as the exact pass. */
function soundexKey(folded: string): string {
  return soundex(folded.replace(/\s+/g, ""));
}

/** Levenshtein distance — insert, delete, substitute, one cost each — with
 * a two-row rolling table instead of the full O(n·m) matrix. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  let curr = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** How many edits still count as "close" — scales with name length so a
 * two-letter slip on a short name isn't held to the same bar as one on a
 * long one. */
function fuzzyThreshold(len: number): number {
  return Math.max(2, Math.floor(len * 0.22));
}

type StageOutcome = { tier: 1 | 2 | 3; pass: boolean };
type MatchHit = {
  outcomes: StageOutcome[];
  matched: Patient;
  matchedTier: 1 | 2 | 3;
  distance: number | null;
};
type MatchMiss = {
  outcomes: StageOutcome[];
  matched: null;
  matchedTier: null;
  distance: null;
};
type MatchRun = MatchHit | MatchMiss;

/** The three-tier pass. Each stage only runs if the one before it missed —
 * a real name matcher doesn't run all three every time; it stops the
 * moment one of them is sure. */
function matchName(rawQuery: string): MatchRun {
  const query = fold(rawQuery);
  const outcomes: StageOutcome[] = [];

  const exact = ROSTER.find((p) => fold(p.name) === query);
  outcomes.push({ tier: 1, pass: !!exact });
  if (exact) return { outcomes, matched: exact, matchedTier: 1, distance: null };

  const qCode = soundexKey(query);
  const phonetic = ROSTER.find((p) => soundexKey(fold(p.name)) === qCode);
  outcomes.push({ tier: 2, pass: !!phonetic });
  if (phonetic) return { outcomes, matched: phonetic, matchedTier: 2, distance: null };

  let best: Patient | null = null;
  let bestDistance = Infinity;
  for (const p of ROSTER) {
    const d = levenshtein(query, fold(p.name));
    if (d < bestDistance) {
      bestDistance = d;
      best = p;
    }
  }
  const bestLen = best ? fold(best.name).length : 0;
  const threshold = fuzzyThreshold(Math.max(query.length, bestLen));
  if (best && bestDistance <= threshold) {
    outcomes.push({ tier: 3, pass: true });
    return { outcomes, matched: best, matchedTier: 3, distance: bestDistance };
  }
  outcomes.push({ tier: 3, pass: false });
  return { outcomes, matched: null, matchedTier: null, distance: null };
}

function tierCaption(tier: 1 | 2 | 3): string {
  if (tier === 1) return "caught — exact";
  if (tier === 2) return "caught — soundex";
  return "caught — fuzzy match";
}

function verdictLine(result: MatchRun): string {
  if (result.matchedTier === 1) return "Typed clean. Passes two and three never ran.";
  if (result.matchedTier === 2) return "Spelled wrong, sounded right — the phonetic pass caught it.";
  if (result.matchedTier === 3) {
    const d = result.distance ?? 0;
    return `Neither exact nor phonetic. Caught on edit distance, ${d} character${d === 1 ? "" : "s"} off the record.`;
  }
  return "Not on the roster, spelled any way the kiosk tried it. Same outcome a human gets from a blank chart.";
}

/**
 * The three-tier name matcher, playable. A visitor's guess runs against a
 * synthetic roster live in the browser; the rail below shows which of the
 * three passes actually caught it, in the order they really run — steals
 * Pipeline's rail-and-dot draw-in from the minipacs case, retimed from a
 * scroll scrub to a submit.
 */
export function NameMatch() {
  const root = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([null, null, null]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([null, null, null]);
  const resultRef = useRef<HTMLDivElement>(null);
  const nameId = useId();

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<MatchRun | null>(null);

  useGSAP(
    () => {
      if (!result) return;
      const rail = railRef.current;
      if (!rail) return;
      const n = result.outcomes.length;
      const railTarget = n === 1 ? 0 : n === 2 ? 0.5 : 1;

      if (reducedMotion()) {
        gsap.set(rail, { scaleX: railTarget });
        result.outcomes.forEach((o, i) => {
          const dot = dotRefs.current[i];
          const label = labelRefs.current[i];
          if (dot) {
            gsap.set(dot, {
              backgroundColor: o.pass ? "#0bda51" : "rgba(23,53,67,0)",
              borderColor: o.pass ? "#0bda51" : "rgba(23,53,67,0.85)",
            });
          }
          if (label) gsap.set(label, { opacity: 1 });
        });
        if (resultRef.current) gsap.set(resultRef.current, { autoAlpha: 1, y: 0 });
        return;
      }

      const STEP = 0.4;
      const tl = gsap.timeline();
      tl.to(
        rail,
        { scaleX: railTarget, duration: Math.max(0.4, (n - 1) * STEP + 0.5), ease: "power2.inOut" },
        0,
      );
      result.outcomes.forEach((o, i) => {
        const at = i * STEP + 0.15;
        const dot = dotRefs.current[i];
        const label = labelRefs.current[i];
        if (label) tl.to(label, { opacity: 1, duration: 0.2 }, at);
        if (dot) {
          tl.to(
            dot,
            {
              backgroundColor: o.pass ? "#0bda51" : "rgba(23,53,67,0)",
              borderColor: o.pass ? "#0bda51" : "rgba(23,53,67,0.85)",
              duration: 0.25,
              ease: "power2.out",
            },
            at,
          );
        }
      });
      if (resultRef.current) {
        tl.fromTo(
          resultRef.current,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
          (n - 1) * STEP + 0.5,
        );
      }
    },
    { scope: root, dependencies: [result], revertOnUpdate: true },
  );

  function runSearch(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setQuery(trimmed);
    setResult(matchName(trimmed));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    runSearch(query);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (result) setResult(null);
  }

  function handleReset() {
    setResult(null);
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div ref={root}>
      <p className="f2m-neu-sm inline-block rounded-full px-3 py-1 text-xs font-bold tracking-normal text-[color:var(--f2m-muted)]">
        front desk, playable — misspell it on purpose
      </p>
      <p className="mt-3 max-w-[46ch] text-[13px] font-medium leading-relaxed opacity-70">
        Three passes, run in order. The second only fires if the first misses; the third only if
        both do.
      </p>

      <form onSubmit={handleSubmit} className="mt-7">
        <label htmlFor={nameId} className="text-[11px] font-bold text-[color:var(--f2m-muted)]">
          Visitor name
        </label>
        <div data-cursor-text="Type" className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            ref={inputRef}
            id={nameId}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="e.g. Katerina Volkov"
            autoComplete="off"
            spellCheck={false}
            className="f2m-in w-full px-5 py-4 text-[15px] font-medium text-[color:var(--f2m-ink)] outline-none placeholder:text-[color:var(--f2m-muted)] focus:ring-2 focus:ring-[color:var(--f2m-accent)]"
          />
          <button
            type="submit"
            data-cursor-text="Check"
            className="f2m-btn shrink-0 px-6 py-4 text-sm font-bold text-[color:var(--f2m-ink)]"
          >
            Check in
          </button>
        </div>
      </form>

      <div data-cursor-text="Try" className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => runSearch(ex)}
            className="f2m-btn px-3 py-1.5 text-xs font-bold text-[color:var(--f2m-muted)]"
          >
            try: {ex}
          </button>
        ))}
      </div>

      <div className="relative mt-10">
        <div aria-hidden className="f2m-in absolute left-1 right-1 top-[1px] h-2 !rounded-full" />
        <div
          ref={railRef}
          aria-hidden
          className="absolute left-1 right-1 top-[1px] h-2 origin-left scale-x-0 rounded-full bg-[color:var(--f2m-accent)]"
        />
        <ol className="relative flex justify-between">
          {STAGE_LABELS.map((label, i) => (
            <li
              key={label}
              className={`flex max-w-[7rem] flex-col gap-3 ${
                i === 0
                  ? "items-start text-left"
                  : i === STAGE_LABELS.length - 1
                    ? "items-end text-right"
                    : "items-center text-center"
              }`}
            >
              <span
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                aria-hidden
                className="block size-[10px] rounded-full border-2 border-[color:var(--f2m-ink)]/20 bg-transparent"
              />
              <span
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="text-[10px] font-bold leading-snug tracking-normal text-[color:var(--f2m-muted)] opacity-40 md:text-[11px]"
              >
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {result && (
        <div ref={resultRef} role="status" aria-live="polite" className="mt-8 opacity-0">
          {result.matched ? (
            <div className="f2m-neu p-6">
              <p className="f2m-neu-sm inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-normal text-[color:var(--f2m-fg)]">
                <span aria-hidden className="size-1.5 rounded-full bg-[color:var(--f2m-accent)]" />
                {tierCaption(result.matchedTier)}
              </p>
              <p className="f2m-display mt-3 text-[20px] font-extrabold leading-tight md:text-[26px]">
                {result.matched.name}
              </p>
              <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-[color:var(--f2m-muted)]">
                {result.matched.id} · dob {result.matched.dob} · next {result.matched.next}
              </p>
              <p className="mt-4 max-w-[48ch] text-[13px] font-medium leading-relaxed opacity-80">
                {verdictLine(result)}
              </p>
            </div>
          ) : (
            <div className="f2m-neu-sm p-6">
              <p className="f2m-neu-sm inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-normal text-[color:var(--f2m-fg)]">
                <span aria-hidden className="size-1.5 rounded-full bg-[color:var(--f2m-muted)]" />
                no match — three for three
              </p>
              <p className="mt-4 max-w-[48ch] text-[13px] font-medium leading-relaxed opacity-80">
                {verdictLine(result)}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 text-xs font-bold text-[color:var(--f2m-muted)] underline decoration-[color:var(--f2m-muted)] underline-offset-4 transition-colors hover:text-[color:var(--f2m-ink)] hover:decoration-[color:var(--f2m-ink)]"
          >
            try another name
          </button>
        </div>
      )}

      <p className="mt-10 max-w-[52ch] text-[11px] font-medium leading-relaxed text-[color:var(--f2m-muted)]">
        Roster is invented for this page — {ROSTER.length} patients, none real. Every pass above
        runs in your browser; nothing you type leaves it.
      </p>
    </div>
  );
}
