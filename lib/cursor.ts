import gsap from "gsap";
import type MouseFollower from "mouse-follower";

/**
 * The ink-droplet cursor's behaviour layer, on top of a bare MouseFollower.
 *
 * Two-layer build: the library element (.mf-cursor) is the *shape* — always
 * mix-blend-difference, so it reads on any background — and a separate
 * .cur-tag element is the *word* — normal blending, chasing the pointer with
 * its own lag. The library's data-attribute pipeline is disabled (dataAttr:
 * null); every label and section state is driven from here instead, so the
 * two never fight over the same DOM.
 */

const VIEWFINDER: Record<string, [number, number]> = {
  square: [100, 100],
  portrait: [84, 112],
  landscape: [120, 90],
};

// Escalates across separate bursts, then never speaks of it again.
const RAGE_LINES = [
  "Ok.",
  "We heard you the first time.",
  "Clicking harder won't ship it faster.",
];

const DWELL_MS = 1400;

/** Velocity (px/ms) thresholds for stretch levels 1..3 — quantized on purpose. */
const V_LEVELS = [0.45, 1.3, 2.6];

export default function attachInkCursor(cursor: MouseFollower): () => void {
  const el = cursor.el as HTMLElement;

  // ——— the word layer ———
  const tag = document.createElement("div");
  tag.className = "cur-tag";
  tag.setAttribute("aria-hidden", "true");
  document.body.appendChild(tag);
  const tagX = gsap.quickTo(tag, "x", { duration: 0.5, ease: "expo.out" });
  const tagY = gsap.quickTo(tag, "y", { duration: 0.5, ease: "expo.out" });

  const showTag = (text: string) => {
    tag.textContent = text;
    // restart the typewriter wipe even if the class is already on
    tag.classList.remove("-on");
    void tag.offsetWidth;
    tag.classList.add("-on");
  };
  const hideTag = () => tag.classList.remove("-on");

  // ——— delegated hover states ———
  let textHolder: Element | null = null;
  let inkRow: Element | null = null;
  let frameHolder: Element | null = null;
  let dwellTimer = 0;

  // hybrid devices report pen/touch through the same listeners — mouse only
  const isMouse = (e: Event) => {
    const t = (e as PointerEvent).pointerType;
    return !t || t === "mouse";
  };

  const syncTag = () => {
    const t = textHolder?.getAttribute("data-cursor-text");
    if (t) showTag(t);
    else hideTag();
  };

  // A plus over a closed row, snapped 45° into a cross while it is open.
  const refreshInkRow = () => {
    if (inkRow) {
      const open = inkRow.getAttribute("aria-expanded") === "true";
      el.style.setProperty("--ink-rot", open ? "45deg" : "0deg");
      cursor.addState("-ink");
    } else {
      cursor.removeState("-ink");
    }
  };

  const applyTarget = (target: Element) => {
    const holder = target.closest("[data-cursor-text]");
    if (holder !== textHolder) {
      textHolder = holder;
      window.clearTimeout(dwellTimer);
      syncTag();
      const dwell = holder?.getAttribute("data-cursor-dwell");
      if (dwell) {
        dwellTimer = window.setTimeout(() => showTag(dwell), DWELL_MS);
      }
    }

    const frame = target.closest("[data-cursor-ratio]");
    if (frame) {
      const [w, h] =
        VIEWFINDER[frame.getAttribute("data-cursor-ratio") ?? ""] ??
        VIEWFINDER.square;
      el.style.setProperty("--vf-w", `${w}px`);
      el.style.setProperty("--vf-h", `${h}px`);
      // card-to-card hops replay the snap-in, not just resize the brackets
      if (frame !== frameHolder && frameHolder) {
        el.classList.remove("-frame");
        void el.offsetWidth;
      }
      frameHolder = frame;
      cursor.addState("-frame");
    } else {
      frameHolder = null;
      cursor.removeState("-frame");
    }

    const row = target.closest("[data-cursor-ink]");
    if (row !== inkRow) {
      inkRow = row;
      refreshInkRow();
    }
  };

  const onOver = (e: Event) => {
    if (!isMouse(e)) return;
    if (e.target instanceof Element) applyTarget(e.target);
  };

  // Content can move under a stationary pointer (Lenis scroll, accordion
  // collapse, route swap) with no pointerover fired — re-read the hit test.
  const reevaluate = () => {
    if (!lastT) return;
    const under = document.elementFromPoint(px, py);
    if (under) applyTarget(under);
  };

  let scrollReeval = 0;
  const onScroll = () => {
    if (scrollReeval) return;
    scrollReeval = window.setTimeout(() => {
      scrollReeval = 0;
      reevaluate();
    }, 120);
  };

  // A service row's aria-expanded flips after React re-renders the click,
  // and rows shift once the 500ms grid transition ends.
  let rowTimerA = 0;
  let rowTimerB = 0;
  const onRowClick = (e: Event) => {
    if (!(e.target instanceof Element)) return;
    if (!e.target.closest("[data-cursor-ink]")) return;
    rowTimerA = window.setTimeout(refreshInkRow, 80);
    rowTimerB = window.setTimeout(reevaluate, 620);
  };

  // Client-side navigation unmounts hovered elements without any pointer
  // event — Effects.tsx announces the route swap so every state lets go.
  const onNavigate = () => {
    textHolder = null;
    inkRow = null;
    frameHolder = null;
    window.clearTimeout(dwellTimer);
    hideTag();
    cursor.removeState("-frame");
    cursor.removeState("-ink");
    window.setTimeout(reevaluate, 350);
  };

  // ——— quantized velocity: stretch snaps between discrete levels ———
  let px = 0;
  let py = 0;
  let lastT = 0;
  let ema = 0;
  let angle = 0;
  let level = 0;
  let raf = 0;
  let settleAt = 0;
  let settleTimer = 0;

  const bigState = () =>
    /-(lg|ink|frame|void|suck|pointer|hidden)\b/.test(el.className);

  const applyLevel = (lv: number) => {
    if (lv === level) return;
    // a hard stop from real speed lands with a settle pop; the class must
    // come back off — its fill-mode would otherwise pin the scale forever
    if (level >= 2 && lv <= 1 && !bigState()) {
      const now = performance.now();
      if (now - settleAt > 300) {
        settleAt = now;
        el.classList.remove("-settle");
        void el.offsetWidth;
        el.classList.add("-settle");
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(
          () => el.classList.remove("-settle"),
          260,
        );
      }
    }
    level = lv;
    el.dataset.v = String(lv);
  };

  const flush = () => {
    raf = 0;
    let lv = 0;
    for (const th of V_LEVELS) if (ema > th) lv++;
    el.style.setProperty("--cur-rot", `${angle.toFixed(1)}deg`);
    applyLevel(lv);
  };

  const onMove = (e: PointerEvent) => {
    if (!isMouse(e)) return;
    tagX(e.clientX);
    tagY(e.clientY);
    const dt = Math.max(1, e.timeStamp - lastT);
    if (lastT) {
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      ema += (Math.hypot(dx, dy) / dt - ema) * 0.25;
      if (Math.hypot(dx, dy) > 2) angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    }
    lastT = e.timeStamp;
    px = e.clientX;
    py = e.clientY;
    if (!raf) raf = requestAnimationFrame(flush);
  };

  // pointermove stops the moment the mouse rests — decay the speed estimate
  // from the ticker that is already running for Lenis.
  const tick = () => {
    if (ema > 0.01 && performance.now() - lastT > 90) {
      ema *= 0.8;
      if (!raf) raf = requestAnimationFrame(flush);
    }
  };
  gsap.ticker.add(tick);

  // ——— manifesto words land as stamps; the droplet taps along ———
  // Scrubbed timelines re-fire the call on every crossing, both directions —
  // the cooldown keeps a fast wheel flick from becoming a reflow storm.
  let stampTimer = 0;
  let stampAt = 0;
  const onStamp = () => {
    if (bigState()) return;
    const now = performance.now();
    if (now - stampAt < 130) return;
    stampAt = now;
    el.classList.remove("-stamp");
    void el.offsetWidth;
    el.classList.add("-stamp");
    window.clearTimeout(stampTimer);
    stampTimer = window.setTimeout(() => el.classList.remove("-stamp"), 220);
  };
  window.addEventListener("vaflet:manifesto-word", onStamp);

  // ——— the footer singularity swallows the cursor with the dust ———
  let suckTimer = 0;
  let showTimer = 0;
  const onSingularity = () => {
    hideTag();
    el.classList.add("-suck");
    suckTimer = window.setTimeout(() => {
      cursor.hide();
      cursor.removeState("-void");
      el.classList.remove("-suck");
    }, 720);
    showTimer = window.setTimeout(() => cursor.show(), 1900);
  };
  window.addEventListener("vaflet:singularity", onSingularity);

  // ——— rage clicks earn three replies, then silence ———
  let clicks: Array<{ t: number; x: number; y: number }> = [];
  let rageStep = 0;
  let rageTimer = 0;
  const onClick = (e: MouseEvent) => {
    if (!isMouse(e)) return;
    // any click commits: the label has done its job
    window.clearTimeout(dwellTimer);
    hideTag();

    if (
      e.target instanceof Element &&
      e.target.closest("a, button, input, textarea, select, label, [role='button']")
    ) {
      clicks = [];
      return;
    }
    clicks = clicks.filter(
      (c) =>
        e.timeStamp - c.t < 900 &&
        Math.hypot(c.x - e.clientX, c.y - e.clientY) < 28,
    );
    clicks.push({ t: e.timeStamp, x: e.clientX, y: e.clientY });
    if (clicks.length < 3 || rageStep >= RAGE_LINES.length) return;

    showTag(RAGE_LINES[rageStep]);
    rageStep += 1;
    clicks = [];
    el.classList.add("-rage");
    window.clearTimeout(rageTimer);
    rageTimer = window.setTimeout(() => {
      el.classList.remove("-rage");
      syncTag();
    }, 1600);
  };

  const onLeaveWindow = () => {
    window.clearTimeout(dwellTimer);
    textHolder = null;
    hideTag();
  };

  document.addEventListener("pointerover", onOver);
  document.addEventListener("click", onRowClick);
  document.addEventListener("click", onClick);
  document.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeaveWindow);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("vaflet:navigate", onNavigate);

  return () => {
    document.removeEventListener("pointerover", onOver);
    document.removeEventListener("click", onRowClick);
    document.removeEventListener("click", onClick);
    document.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("vaflet:navigate", onNavigate);
    window.removeEventListener("vaflet:manifesto-word", onStamp);
    window.removeEventListener("vaflet:singularity", onSingularity);
    gsap.ticker.remove(tick);
    cancelAnimationFrame(raf);
    window.clearTimeout(dwellTimer);
    window.clearTimeout(rageTimer);
    window.clearTimeout(suckTimer);
    window.clearTimeout(showTimer);
    window.clearTimeout(settleTimer);
    window.clearTimeout(stampTimer);
    window.clearTimeout(scrollReeval);
    window.clearTimeout(rowTimerA);
    window.clearTimeout(rowTimerB);
    tag.remove();
  };
}
