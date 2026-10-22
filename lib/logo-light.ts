// One light for the whole logo: the mark's shading and the wordmark's hatched
// shadow both read their angle from here, so they always agree. The light
// drifts on its own; hovering the logo link hands it to the pointer, and
// letting go eases it back into the drift. Angle in radians, y up: the
// direction shadows fall.

export const LIGHT_REST = -0.95; // light from the upper left, shadow down-right

const state = { hover: 0, target: 0, pointer: 0.5, frame: -1, angle: LIGHT_REST };
const t0 = typeof performance === "undefined" ? 0 : performance.now();

/** Wire the hover handoff to the logo link; returns the cleanup. */
export function bindLogoLight(host: Element) {
  const onEnter = () => {
    state.target = 1;
  };
  const onLeave = () => {
    state.target = 0;
  };
  const onMove = (e: Event) => {
    const r = host.getBoundingClientRect();
    const x = (e as PointerEvent).clientX;
    state.pointer = Math.min(1, Math.max(0, (x - r.left) / r.width));
  };
  host.addEventListener("pointerenter", onEnter);
  host.addEventListener("pointerleave", onLeave);
  host.addEventListener("pointermove", onMove);
  return () => {
    host.removeEventListener("pointerenter", onEnter);
    host.removeEventListener("pointerleave", onLeave);
    host.removeEventListener("pointermove", onMove);
  };
}

/** The light's angle for this animation frame; steps once per timestamp. */
export function logoLight(now: number) {
  if (now !== state.frame) {
    state.frame = now;
    state.hover += (state.target - state.hover) * 0.07;
    const drift = LIGHT_REST + 0.55 * Math.sin(((now - t0) / 1000) * 0.35);
    const follow = state.pointer * 1.1 - Math.PI / 2;
    state.angle = drift + (follow - drift) * state.hover;
  }
  return state.angle;
}
