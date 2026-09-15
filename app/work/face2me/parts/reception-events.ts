"use client";

/**
 * The reception bus: one window event, typed payloads. The director
 * (director.tsx) is the only writer of visit-truth — it runs the scripted
 * rehearsal that stands in for the live call; the scene and the card layer
 * are readers; the layer writes UI-intent back (chip taps, hangup, lead).
 * There is no camera, no microphone and no network in the loop anymore:
 * the whole visit is local, honest about being a recording, and can be
 * rehearsed end-to-end by simply clicking through it.
 *
 * The literal name must stay a literal: client module constants don't cross
 * the server boundary, and the scene chunk loads separately.
 */

export const F2M_EVENT = "vaflet:f2m-reception";

export type Phase = "idle" | "connecting" | "live" | "over" | "closed";

/** the six chips of the rail — five features and one quieter honest one */
export type ChipId = "names" | "bill" | "box" | "lang" | "staff" | "real";
export type Chip = { id: ChipId; label: string; quiet?: boolean };

/** the one DOM pop-up left on the counter: the staff peek. Everything the
    visitor chooses (names, check-in, slots) happens ON THE GLASS — the
    dot matrix draws the options and invisible buttons over the screen
    make them tappable, like the touchscreen the product actually is. */
export type PopupView = "staff";

/** what tapping a glass menu row means */
export type GlassIntent =
  | { kind: "name"; id: NameId }
  | { kind: "action"; id: "checkin" | "book" }
  | { kind: "slot"; slot: string };

/**
 * What the kiosk's own screen shows. The dot matrix that draws Ren's face
 * can draw anything: the director hands it slides (each a stack of text
 * lines), the scene rasterizes them and the 7656 dots leap from her face
 * into the words and back. `em` scales a line relative to the biggest one;
 * several slides with an `interval` play as a flipbook.
 */
export type ScreenLine = { text: string; em?: number };

export type MatchTier = "exact" | "sounds-like" | "fuzzy";
export type NameId = "maria" | "mikhael" | "zeynep";

export type ReceptionDetail =
  /* director -> readers (visit truth) */
  | { type: "phase"; phase: Phase; reason?: "minutes" | "denied" }
  | { type: "speaking"; who: "pal" | "user"; on: boolean; interrupted?: boolean }
  /* lang rides along for the non-English beats, so screen readers switch voice */
  | { type: "caption"; who: "pal" | "user"; text: string; lang?: "es" | "ru" }
  /* the language ripple: a second, smaller line under the caption */
  | { type: "subtitle"; text: string | null }
  | { type: "chips"; items: Chip[] | null }
  /* visitor/checkedIn ride along so the pop-ups can carry the journey's
     state: the staff queue shows YOUR check-in, the actions card knows
     what's already done */
  | { type: "popup"; view: PopupView | null; visitor?: string; checkedIn?: boolean }
  | { type: "screen"; slides: ScreenLine[][] | null; interval?: number }
  /* a glass menu: which slide lines are tappable and what they mean */
  | { type: "screen-menu"; items: { line: number; label: string; intent: GlassIntent }[] | null }
  /* scene -> layer: where the screen (and each text line) sits in pixels */
  | {
      type: "screen-geom";
      rect: { x: number; y: number; w: number; h: number };
      bands: { a: number; b: number }[];
    }
  /* layer -> scene: which glass line the pointer is on */
  | { type: "screen-hot"; line: number | null }
  /* the name trick: what was said, what was found, and by which pass */
  | { type: "trick"; said: string; found: string; tier: MatchTier }
  | { type: "trick-clear" }
  /* the kiosk's printout at the end of a finished visit */
  | { type: "stub"; lines: string[] | null }
  | { type: "lead-form" }
  | { type: "dismiss" }
  /* readers -> director (UI intent) */
  | { type: "chip-pick"; id: ChipId }
  | { type: "name-pick"; id: NameId }
  | { type: "action-pick"; id: "checkin" | "book" }
  | { type: "slot-pick"; slot: string }
  | { type: "staff-unlocked" }
  | { type: "hangup-request" }
  | { type: "call-request" } // the "ring again" button on the over panel
  | { type: "left-stage" }
  | { type: "lead-submitted"; name: string; email: string; note?: string }
  /* scene -> director: the kiosk is settled in frame (controls shown) */
  | { type: "settled"; on: boolean };

export function emitReception(detail: ReceptionDetail) {
  window.dispatchEvent(new CustomEvent<ReceptionDetail>(F2M_EVENT, { detail }));
}

export function onReception(fn: (d: ReceptionDetail) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<ReceptionDetail>).detail);
  window.addEventListener(F2M_EVENT, h);
  return () => window.removeEventListener(F2M_EVENT, h);
}
