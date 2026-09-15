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
export type CardTopic = "pricing" | "spec" | "languages" | "bundle";

/** the six chips of the rail — five features and one quieter honest one */
export type ChipId = "names" | "bill" | "box" | "lang" | "staff" | "real";
export type Chip = { id: ChipId; label: string; quiet?: boolean };

/** the two interactive pop-ups the director can put on the counter */
export type PopupView = "names" | "staff";

/**
 * A conjured element — the genie half of the show. When Ren answers, she
 * doesn't hand over one card: glass tags materialize in the void around
 * the kiosk, each at its own spot, tilt and depth. Desktop only — the
 * phone has no void to conjure into, so there the topic card carries it.
 * x/y are percentages of the stage, tilt is degrees of rotateY, z is the
 * starting translateZ the tag flies in from (negative = out of the deep).
 */
export type ConjureItem = {
  text: string;
  sub?: string;
  x: number;
  y: number;
  tilt: number;
  z: number;
  accent?: boolean;
  /** "lg" for standalone words with no sub line — they carry the frame alone */
  size?: "lg";
};

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
  | { type: "card"; card: CardTopic }
  | { type: "chips"; items: Chip[] | null }
  | { type: "popup"; view: PopupView | null }
  | { type: "conjure"; items: ConjureItem[] | null }
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
