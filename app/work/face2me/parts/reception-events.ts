"use client";

/**
 * The reception bus: one window event, typed payloads. The Daily controller
 * (reception.tsx) is the only writer of call-truth; the scene and the card
 * layer are readers; the card layer and the scene write UI-intent back
 * (hangup-request, lead-submitted, left-stage). In dev, window.__ren writes
 * fake call-truth so every effect can be rehearsed without spending a
 * single Tavus minute.
 *
 * The literal name must stay a literal: client module constants don't cross
 * the server boundary, and the scene chunk loads separately.
 */

export const F2M_EVENT = "vaflet:f2m-reception";

export type Phase = "idle" | "connecting" | "live" | "over" | "closed";
export type CardTopic = "pricing" | "spec" | "languages" | "bundle";

export type ReceptionDetail =
  /* controller -> readers (call truth) */
  | { type: "phase"; phase: Phase; seconds?: number; reason?: "minutes" | "denied" }
  | { type: "video"; el: HTMLVideoElement }
  | { type: "selfview"; stream: MediaStream | null }
  | { type: "speaking"; who: "pal" | "user"; on: boolean; interrupted?: boolean }
  | { type: "caption"; who: "pal" | "user"; text: string }
  | { type: "card"; card: CardTopic }
  | { type: "lead-form" }
  | { type: "dismiss" }
  /* readers -> controller (UI intent) */
  | { type: "hangup-request" }
  | { type: "call-request" } // the "ring again" button on the over panel
  | { type: "left-stage" }
  | { type: "lead-submitted"; name: string; email: string; note?: string };

export function emitReception(detail: ReceptionDetail) {
  window.dispatchEvent(new CustomEvent<ReceptionDetail>(F2M_EVENT, { detail }));
}

export function onReception(fn: (d: ReceptionDetail) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<ReceptionDetail>).detail);
  window.addEventListener(F2M_EVENT, h);
  return () => window.removeEventListener(F2M_EVENT, h);
}

/* ------------------------------------------------------------- dev hook */

interface DevHook {
  card(card: CardTopic): void;
  form(): void;
  dismiss(): void;
  caption(text: string, who?: "pal" | "user"): void;
  speaking(on: boolean, who?: "pal" | "user"): void;
  phase(phase: Phase): void;
  live(): void;
  over(): void;
}

declare global {
  interface Window {
    __ren?: DevHook;
  }
}

/**
 * Rehearsal controls. `__ren.live()` builds a greenscreen stand-in feed from
 * a canvas (Tavus keys the background to rgb(0,255,155)) so the chroma-key
 * shader and the whole card choreography can be exercised offline.
 */
export function installDevHook() {
  if (process.env.NODE_ENV === "production") return;
  let fakeRaf = 0;
  let fakeVideo: HTMLVideoElement | null = null;
  const stopFake = () => {
    cancelAnimationFrame(fakeRaf);
    if (fakeVideo) {
      const stream = fakeVideo.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      fakeVideo.srcObject = null;
      fakeVideo = null;
    }
  };
  window.__ren = {
    card: (card: CardTopic) => emitReception({ type: "card", card }),
    form: () => emitReception({ type: "lead-form" }),
    dismiss: () => emitReception({ type: "dismiss" }),
    caption: (text: string, who: "pal" | "user" = "pal") =>
      emitReception({ type: "caption", who, text }),
    speaking: (on: boolean, who: "pal" | "user" = "pal") =>
      emitReception({ type: "speaking", who, on }),
    phase: (phase: Phase) => emitReception({ type: "phase", phase, seconds: 180 }),
    live: () => {
      stopFake();
      const c = document.createElement("canvas");
      c.width = 480;
      c.height = 854;
      const ctx = c.getContext("2d")!;
      let t = 0;
      const draw = () => {
        fakeRaf = requestAnimationFrame(draw);
        t += 0.02;
        ctx.fillStyle = "rgb(0,255,155)"; // Tavus greenscreen color, exactly
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#8a6a58"; // a face-ish blob to watch the key edges
        ctx.beginPath();
        ctx.ellipse(240 + Math.sin(t) * 18, 340, 130, 175, 0, 0, Math.PI * 2);
        ctx.fill();
      };
      draw();
      const video = document.createElement("video");
      video.muted = true;
      video.srcObject = c.captureStream(24);
      video.play().catch(() => {});
      fakeVideo = video;
      emitReception({ type: "video", el: video });
      emitReception({ type: "phase", phase: "live", seconds: 180 });
    },
    over: () => {
      stopFake();
      emitReception({ type: "phase", phase: "over" });
    },
  };
}
