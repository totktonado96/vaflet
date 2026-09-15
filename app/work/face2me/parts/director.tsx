"use client";

import { useEffect, type RefObject } from "react";
import {
  emitReception,
  onReception,
  type CardTopic,
  type Chip,
  type ChipId,
  type NameId,
  type PopupView,
  type ScreenLine,
} from "./reception-events";

/**
 * The director. There is no call anymore — there is a show. This file is
 * the only writer of visit-truth on the reception bus: it runs Ren's
 * scripted shift (captions, speaking beats, cards, conjures, pop-ups) and
 * reacts to the visitor's taps. Everything is local and deterministic;
 * the whole visit can be rehearsed by clicking through it, and the script
 * says out loud that it is a recording — the honesty is the second thing
 * she tells everyone.
 *
 * Timing discipline: bus emissions inside one answer are serialized with
 * fixed gaps so no two motions compete for the same glance; speaking(on)
 * leads the first caption by a beat, so the machine visibly reacts before
 * it "speaks".
 */

/* -------------------------------------------------------------- timing */

const PRE = 180; // speaking warms the glass this long before the line lands
const GAP = 240; // serialization gap between visual emissions
const IDLE_COLD = 14000; // untouched kiosk speaks once
const IDLE_NUDGE = 10000; // menu silence before the nudge, and again before self-end

/** how long a caption line holds the floor — readers, not speedrunners */
const hold = (text: string) => Math.min(3400, Math.max(1600, 1150 + text.length * 34));

/* -------------------------------------------------------------- script */

const CHIPS: Chip[] = [
  { id: "names", label: "Find my name" },
  { id: "bill", label: "The bill" },
  { id: "box", label: "What's in the box" },
  { id: "lang", label: "¿Español? Русский?" },
  { id: "staff", label: "Staff only" },
  { id: "real", label: "Is this even real?", quiet: true },
];

const PRIMARY: ChipId[] = ["names", "bill", "box", "lang", "staff"];

const GREETING = [
  "Oh — hi.",
  "Before you ask — this isn't a call.",
  "It's a recording of one, on a loop.",
  "The real me does voice and touch.",
  "Tonight it's tap only. I'm not listening — just answering.",
];

/** the roster the name trick plays against: said → found, and by which pass */
const ROSTER: Record<
  NameId,
  { said: string; found: string; lines: string[]; tier: "exact" | "sounds-like" | "fuzzy"; line: string }
> = {
  maria: {
    said: "Maria Lopez",
    found: "Maria Lopez",
    lines: ["MARIA", "LOPEZ"],
    tier: "exact",
    line: "First try. Easy.",
  },
  mikhael: {
    said: "Mikhael",
    found: "Mikhail Volkov",
    lines: ["MIKHAIL", "VOLKOV"],
    tier: "sounds-like",
    line: "Didn't need the spelling. Just the sound of it.",
  },
  zeynep: {
    said: "Zeynep",
    found: "Zeynab Karim",
    lines: ["ZEYNAB", "KARIM"],
    tier: "fuzzy",
    line: "Mangled that one. Found you anyway.",
  },
};

/* what the glass says, topic by topic — every slide is drawn by the same
   7656 dots that draw her face. Short, huge, LED-board words. */

const PRICE_SLIDES: ScreenLine[][] = [
  [{ text: "$599" }, { text: "STARTER", em: 0.3 }],
  [{ text: "$999" }, { text: "STANDARD", em: 0.3 }],
  [{ text: "$1500+" }, { text: "CUSTOM", em: 0.3 }],
];

const SYSTEM_SLIDES: ScreenLine[][] = [
  [{ text: "FACE" }],
  [{ text: "HANDS" }],
  [{ text: "NAMES" }],
  [{ text: "BOOKING" }],
  [{ text: "RECORDS" }],
  [{ text: "STAFF" }],
  [{ text: "ARMOR" }],
];

/* ------------------------------------------------------------ component */

export function Director({ callBtnRef }: { callBtnRef: RefObject<HTMLButtonElement | null> }) {
  useEffect(() => {
    const btn = callBtnRef.current;

    /* -- the metronome: every visit owns a generation; cutting the tape
          voids every cue that was still waiting on it -- */
    let gen = 0;
    let pending: number[] = [];
    let speaking = false;
    let phase: "idle" | "connecting" | "live" | "over" = "idle";
    let disposed = false;

    const cut = () => {
      gen++;
      pending.forEach((id) => window.clearTimeout(id));
      pending = [];
    };

    /** a small cue sheet: build with `say`/`cue`/`wait`, then it schedules
        itself. Returns the total running time. */
    const play = (build: (s: { say: (t: string, sub?: string | null, lang?: "es" | "ru") => void; cue: (fn: () => void) => void; wait: (ms: number) => void }) => void, done?: () => void) => {
      const my = gen;
      let clock = 0;
      const at = (ms: number, fn: () => void) => {
        const id = window.setTimeout(() => {
          if (gen !== my || disposed) return;
          fn();
        }, ms);
        pending.push(id);
      };
      const s = {
        say: (text: string, sub?: string | null, lang?: "es" | "ru") => {
          at(clock, () => {
            if (!speaking) {
              speaking = true;
              emitReception({ type: "speaking", who: "pal", on: true });
            }
            if (sub !== undefined) emitReception({ type: "subtitle", text: sub });
          });
          at(clock + PRE, () => emitReception({ type: "caption", who: "pal", text, lang }));
          clock += PRE + hold(text);
        },
        cue: (fn: () => void) => {
          at(clock, fn);
          clock += GAP;
        },
        wait: (ms: number) => {
          clock += ms;
        },
      };
      build(s);
      at(clock, () => {
        if (speaking) {
          speaking = false;
          emitReception({ type: "speaking", who: "pal", on: false });
        }
        emitReception({ type: "subtitle", text: null });
        done?.();
      });
      return clock;
    };

    /* -- idle bookkeeping -- */
    let settled = false;
    let coldSaid = false; // "Standing there's fine" plays once, ever
    let coldTimer = 0;
    let idleTimer = 0;
    let nudged = false;

    // "over" counts as resting too: after a finished visit the kiosk is
    // visually just standing there again, and the line still applies
    const resting = () => phase === "idle" || phase === "over";
    const armCold = () => {
      window.clearTimeout(coldTimer);
      if (settled && resting() && !coldSaid) {
        coldTimer = window.setTimeout(() => {
          if (!resting() || coldSaid || disposed) return;
          coldSaid = true;
          emitReception({ type: "caption", who: "pal", text: "Standing there's fine. Waving works too." });
        }, IDLE_COLD);
      }
    };

    const disarmIdle = () => {
      window.clearTimeout(idleTimer);
    };

    /** Silence in the menu: one nudge per visit, and she only gives up
        after TWO ignored windows in a row — activity resets the count,
        never the once-per-visit nudge. No number is ever shown; this is
        the product's own "nudges the silent" habit, not a countdown. */
    let idleRuns = 0;
    const armIdle = (fresh = true) => {
      disarmIdle();
      if (fresh) idleRuns = 0;
      if (phase !== "live") return;
      idleTimer = window.setTimeout(() => {
        if (phase !== "live" || disposed) return;
        idleRuns++;
        if (!nudged) {
          nudged = true;
          play((s) => s.say("Take your time. I don't clock out."), () => armIdle(false));
        } else if (idleRuns >= 2) {
          play(
            (s) => s.say("I'll let you keep scrolling. Ring again whenever."),
            () => end("quiet"),
          );
        } else {
          armIdle(false);
        }
      }, IDLE_NUDGE);
    };

    /* -- visit state -- */
    const opened = new Set<ChipId>();
    const visits = new Map<ChipId, number>();
    // which topic currently owns the counter: pop-up intents (a name tapped,
    // the PIN pad finishing) are honored only while their topic is the one
    // on stage — a leftover pad timer must not hijack a freshly-picked topic
    let activeTopic: ChipId | null = null;
    let wrapSaid = false;
    let namesCloserSaid = false;

    const maybeWrap = () => {
      if (wrapSaid || opened.size < 4) {
        armIdle();
        return;
      }
      wrapSaid = true;
      play((s) => {
        s.wait(700);
        s.say("That's the whole toy box. Ring again any time.");
        s.say("I don't sleep. I don't do much else, either.");
      }, armIdle);
    };

    /* -- the ends of a visit -- */
    let ending = false;
    const end = (kind: "manual" | "quiet" | "silent") => {
      if (ending) return;
      ending = true;
      activeTopic = null;
      cut();
      disarmIdle();
      if (speaking) {
        speaking = false;
        emitReception({ type: "speaking", who: "pal", on: false });
      }
      emitReception({ type: "subtitle", text: null });
      // the counter is cleared for the goodbye: the glass gives the face
      // back, pop-ups and the rail go — only the farewell (and its
      // printout) remain
      emitReception({ type: "screen", slides: null });
      emitReception({ type: "popup", view: null });
      emitReception({ type: "trick-clear" });
      emitReception({ type: "chips", items: null });
      const finish = () => {
        ending = false;
        phase = "over";
        emitReception({ type: "dismiss" });
        emitReception({ type: "phase", phase: "over" });
        armCold();
      };
      if (kind === "manual") {
        play((s) => {
          s.say("That's my shift. Yours whenever you want it.");
          s.cue(() =>
            emitReception({
              type: "stub",
              lines: [
                "VISITOR: YOU",
                `CHIPS OPENED: ${opened.size}/5`,
                "STATUS: STILL DEADPAN",
                "NEXT SHOWING: WHENEVER YOU SCROLL BACK",
              ],
            }),
          );
          s.wait(2600);
        }, finish);
      } else {
        // quiet self-end already said its line; a scroll-away says nothing —
        // she just noticed you left
        finish();
      }
    };

    /* -- topics -- */

    const scr = (slides: ScreenLine[][] | null, interval?: number) =>
      emitReception({ type: "screen", slides, interval });
    const card = (c: CardTopic) => emitReception({ type: "card", card: c });
    const popup = (v: PopupView | null) => emitReception({ type: "popup", view: v });

    const topic = (id: ChipId) => {
      const again = (visits.get(id) ?? 0) > 0;
      visits.set(id, (visits.get(id) ?? 0) + 1);
      if (PRIMARY.includes(id)) opened.add(id);

      // the counter is swept before the next act: the glass gives the face
      // back, the trick and pop-ups clear; the topic's own slides follow
      scr(null);
      emitReception({ type: "trick-clear" });
      if (id !== "names" && id !== "staff") popup(null);

      switch (id) {
        case "names":
          play((s) => {
            s.say(again ? "Roster's still warm. Go ahead." : "Say a name. Any of these — pretend it's yours.");
            s.cue(() => popup("names"));
          }, armIdle);
          break;
        case "bill":
          play((s) => {
            if (again) {
              s.say("Same three numbers as before. They hold still.");
              s.cue(() => scr(PRICE_SLIDES, 900));
              s.cue(() => card("pricing"));
              s.wait(2400);
              s.cue(() => scr(null));
            } else {
              // the voice stays short — the glass carries the numbers,
              // one price per line she says
              s.say("Fair. Let's do the boring part first.");
              s.cue(() => scr([PRICE_SLIDES[0]]));
              s.cue(() => card("pricing"));
              s.say("Three sizes. One monthly bill.");
              s.cue(() => scr([PRICE_SLIDES[1]]));
              s.say("Hardware and install ride inside it.");
              s.cue(() => scr([PRICE_SLIDES[2]]));
              s.say("No meter. I don't charge you to think.");
              s.wait(700);
              s.cue(() => scr(null));
            }
          }, maybeWrap);
          break;
        case "box":
          play((s) => {
            if (again) {
              s.say("Still one box. Still not your problem.");
              s.cue(() => scr(SYSTEM_SLIDES, 560));
              s.cue(() => card("bundle"));
              s.wait(3600);
              s.cue(() => scr(null));
            } else {
              s.say("Not yours to fix. Ever.");
              s.cue(() => scr([[{ text: "7" }, { text: "SYSTEMS", em: 0.36 }]]));
              s.cue(() => card("bundle"));
              s.say("Plugs into whatever your business already runs.");
              // the seven layers deal themselves across the glass while
              // she keeps talking — a flipbook in her own dots
              s.cue(() => scr(SYSTEM_SLIDES, 560));
              s.say("It checks people in live and books what's next.");
              s.say("First-timers sign up mid-conversation. No form.");
              s.wait(400);
              s.cue(() => scr(null));
            }
          }, maybeWrap);
          break;
        case "lang":
          play((s) => {
            if (again) {
              s.say("Still three. Still no fourth.");
              s.cue(() => scr([[{ text: "HOLA." }], [{ text: "ПРИВЕТ." }]], 900));
              s.cue(() => card("languages"));
              s.wait(1600);
              s.cue(() => scr(null));
            } else {
              s.say("I do three languages. Watch the switch—");
              s.cue(() => scr([[{ text: "HOLA." }]]));
              s.say("—justo así, a mitad de frase—", "—just like that, mid-sentence—", "es");
              s.cue(() => scr([[{ text: "ПРИВЕТ." }]]));
              s.say("—и обратно, без остановки.", "—and back, without stopping.", "ru");
              s.cue(() => scr(null));
              s.say("No fourth language. I looked. There isn't one.", null);
              s.cue(() => card("languages"));
            }
          }, maybeWrap);
          break;
        case "staff":
          play((s) => {
            s.say(again ? "Back for the queue? Can't blame you." : "That one's not really for you.");
            s.cue(() => scr([[{ text: "STAFF" }, { text: "ONLY", em: 0.62 }]]));
            s.cue(() => popup("staff"));
          }, armIdle);
          break;
        case "real":
          play((s) => {
            if (again) {
              s.say("Still AI. Still New York. Still rehearsed.");
              s.cue(() => scr([[{ text: "AI." }], [{ text: "NYC" }], [{ text: "REC" }, { text: "REHEARSED", em: 0.3 }]], 900));
              s.cue(() => card("spec"));
              s.wait(2400);
              s.cue(() => scr(null));
            } else {
              s.say("Honestly? Yes and no.");
              s.cue(() => scr([[{ text: "AI." }]]));
              s.say("I'm AI. No ghostwriter, no guy in a back room.");
              s.cue(() => scr([[{ text: "NYC" }]]));
              s.say("Two engineers built me — in New York.");
              s.say("I don't replace anybody. I take the shifts nobody wants.");
              s.say("Six a.m., holidays, the third wrong building of the hour.");
              s.cue(() => scr([[{ text: "REC" }, { text: "REHEARSED", em: 0.3 }]]));
              s.say("This run, right here? Rehearsed.");
              s.say("The one in a real lobby isn't.");
              s.cue(() => card("spec"));
              s.say("There's my whole file, since you asked.");
              s.wait(500);
              s.cue(() => scr(null));
            }
          }, maybeWrap);
          break;
      }
    };

    /* -- the wake: button press to greeting to menu -- */
    const wake = () => {
      if (phase === "connecting" || phase === "live") return;
      cut();
      disarmIdle();
      window.clearTimeout(coldTimer);
      phase = "connecting";
      nudged = false;
      activeTopic = null;
      emitReception({ type: "phase", phase: "connecting" });
      play((s) => {
        s.wait(800); // a beat, not a load — no spinner earns its place here
        s.cue(() => {
          phase = "live";
          emitReception({ type: "phase", phase: "live" });
        });
        s.wait(400);
        // she says hi with her own pixels first — the face re-deals itself
        // into the word and back, so the first thing the visit teaches you
        // is that this screen can say anything
        s.cue(() => scr([[{ text: "HI." }]]));
        s.say(GREETING[0]);
        s.cue(() => scr(null));
        GREETING.slice(1, 3).forEach((line) => s.say(line));
        // the rail rises once the honesty is out (beat three) — the last two
        // beats finish over it, and a tap may well cut them off. Her problem.
        s.cue(() => emitReception({ type: "chips", items: CHIPS }));
        GREETING.slice(3).forEach((line) => s.say(line));
      }, armIdle);
    };

    /* -- what the visitor does -- */
    const offBus = onReception((d) => {
      if (ending && (d.type === "chip-pick" || d.type === "name-pick" || d.type === "staff-unlocked")) return;
      if (d.type === "chip-pick") {
        if (phase !== "live") return;
        disarmIdle();
        if (speaking) {
          // topic-jumped mid-line: she flinches, then takes the new one
          cut();
          speaking = false;
          emitReception({ type: "speaking", who: "pal", on: false, interrupted: true });
          emitReception({ type: "subtitle", text: null });
        } else {
          cut();
        }
        emitReception({ type: "caption", who: "user", text: CHIPS.find((c) => c.id === d.id)?.label ?? "" });
        const id = d.id;
        activeTopic = id;
        const t = window.setTimeout(() => topic(id), 650);
        pending.push(t);
      } else if (d.type === "name-pick") {
        if (phase !== "live" || activeTopic !== "names") return;
        disarmIdle();
        cut();
        if (speaking) {
          // she was mid-line — same flinch as a chip-driven topic jump
          speaking = false;
          emitReception({ type: "speaking", who: "pal", on: false, interrupted: true });
          emitReception({ type: "subtitle", text: null });
        }
        const r = ROSTER[d.id];
        emitReception({ type: "trick-clear" });
        play((s) => {
          s.cue(() => emitReception({ type: "caption", who: "user", text: r.said }));
          s.wait(500);
          // the glass answers: the face re-deals into the found name and
          // the pass that caught it — the sr-only live region says the same
          s.cue(() => {
            emitReception({ type: "trick", said: r.said, found: r.found, tier: r.tier });
            scr([
              [
                ...r.lines.map((text) => ({ text })),
                { text: r.tier.toUpperCase(), em: 0.48 },
              ],
            ]);
          });
          s.wait(r.tier === "exact" ? 500 : 1000);
          s.say(r.line);
          if (!namesCloserSaid) {
            namesCloserSaid = true;
            s.say("Three passes. After that, I actually ask.");
          }
        }, armIdle);
      } else if (d.type === "staff-unlocked") {
        if (phase !== "live" || activeTopic !== "staff") return;
        disarmIdle();
        cut();
        play((s) => {
          s.cue(() => scr(null)); // the badge leaves the glass — the queue took over
          s.wait(400);
          s.say("Fine — this is what staff sees.");
          s.say("Real PIN, real queue, on the real one.");
          s.say("That top row? Live the second someone walks in.");
          s.say("Not a batch job at midnight.");
        }, maybeWrap);
      } else if (d.type === "hangup-request") {
        if (phase === "live") end("manual");
        else if (phase === "connecting") {
          cut();
          phase = "over";
          emitReception({ type: "dismiss" });
          emitReception({ type: "phase", phase: "over" });
        }
      } else if (d.type === "left-stage") {
        if (phase === "live" || phase === "connecting") end("silent");
      } else if (d.type === "call-request") {
        wake();
      } else if (d.type === "settled") {
        settled = d.on;
        if (d.on) armCold();
        else window.clearTimeout(coldTimer);
      }
    });

    const onClick = () => wake();
    btn?.addEventListener("click", onClick);

    return () => {
      disposed = true;
      cut();
      disarmIdle();
      window.clearTimeout(coldTimer);
      btn?.removeEventListener("click", onClick);
      offBus();
    };
    // refs are stable for the life of the hero
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
