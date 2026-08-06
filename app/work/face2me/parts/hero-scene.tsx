"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Camera,
  Geometry,
  Mesh,
  Program,
  Renderer,
  Texture,
  Transform,
  Vec2,
  Vec3,
} from "ogl";
import { reducedMotion } from "@/components/case/kit";
import { emitReception, onReception } from "./reception-events";

gsap.registerPlugin(ScrollTrigger);

/**
 * The hero's engine room. This file is everything WebGL — geometry built
 * from primitives, the shared-program mirror pass, the halftone gather —
 * and it is loaded as its own chunk so the words of the hero never wait
 * for it. The composition and copy live in hero.tsx.
 */

/* ---------------------------------------------------------------- scene */

const FOV = 36;
const FLOOR_Y = -1.35;

// the kiosk is all display: a portrait slab that is ~86% screen,
// on a short wide column and a heavy base plate
const K_W = 1.0;
const K_H = 1.9;
const K_D = 0.12;
const K_R = 0.08;
// screen (local to slab front) — slim bezels, a small chin for the LED
const SCR_W = 0.9;
const SCR_H = 1.72;
const SCR_Y = 0.04;
// halftone grid
const DOT_COLS = 76;
const DOT_ROWS = 145;

const CAM_START = 10.0; // distance at the top of the page
const CAM_END = 3.9; // the screen alone is two thirds of the portrait frame
const CAM_WIDE = 2.6; // and closer still once the display has gone landscape

type State = {
  z: number;
  yaw: number;
  camY: number;
  assemble: number;
  glow: number;
  wake: number;
  pool: number;
  focus: number;
};

/** Rounded-rect slab, extruded. Caps + a smooth side band, hard edge between. */
function roundedSlab(w: number, h: number, d: number, r: number, seg = 10) {
  const perim: [number, number, number, number][] = [];
  const hw = w / 2 - r;
  const hh = h / 2 - r;
  const corners: [number, number, number][] = [
    [hw, hh, 0],
    [-hw, hh, 90],
    [-hw, -hh, 180],
    [hw, -hh, 270],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = ((a0 + (i / seg) * 90) * Math.PI) / 180;
      perim.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a)]);
    }
  }
  const n = perim.length;
  const pos: number[] = [];
  const nrm: number[] = [];
  const idx: number[] = [];
  const zf = d / 2;

  // side band — smooth normals around the perimeter
  for (const [x, y, nx, ny] of perim) {
    pos.push(x, y, zf, x, y, -zf);
    nrm.push(nx, ny, 0, nx, ny, 0);
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = i * 2;
    const b = i * 2 + 1;
    const c = j * 2;
    const e = j * 2 + 1;
    idx.push(a, b, c, b, e, c);
  }

  // caps — fans around the center
  const frontC = pos.length / 3;
  pos.push(0, 0, zf);
  nrm.push(0, 0, 1);
  const frontRing = pos.length / 3;
  for (const [x, y] of perim) {
    pos.push(x, y, zf);
    nrm.push(0, 0, 1);
  }
  for (let i = 0; i < n; i++) idx.push(frontC, frontRing + i, frontRing + ((i + 1) % n));

  const backC = pos.length / 3;
  pos.push(0, 0, -zf);
  nrm.push(0, 0, -1);
  const backRing = pos.length / 3;
  for (const [x, y] of perim) {
    pos.push(x, y, -zf);
    nrm.push(0, 0, -1);
  }
  for (let i = 0; i < n; i++) idx.push(backC, backRing + ((i + 1) % n), backRing + i);

  return {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: new Float32Array(nrm) },
    index: { data: new Uint16Array(idx) },
  };
}

const BODY_VERT = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 modelViewMatrix, projectionMatrix, modelMatrix;
  uniform mat3 normalMatrix;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vNormal = normalize(mat3(modelMatrix) * normal);
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BODY_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform vec3 uCam;
  uniform float uMirror;
  uniform float uSceneGlow;
  varying vec3 vNormal;
  varying vec3 vWorld;
  const vec3 KEY_DIR = vec3(-0.4517, 0.7228, 0.5230); // top-left, camera side
  const vec3 KEY_COL = vec3(1.0, 0.97, 0.92);
  const vec3 RIM_COL = vec3(0.45, 0.58, 0.68);
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCam - vWorld);
    float diff = max(dot(N, KEY_DIR), 0.0);
    float rim = pow(1.0 - abs(dot(N, V)), 2.6);
    // a white shell wants fill light: higher ambient, gentler key
    vec3 col = uColor * (0.28 + 0.85 * diff) * KEY_COL + RIM_COL * rim * 0.58;
    float a = 1.0;
    if (uMirror > 0.5) {
      // the floor only reflects to the degree the machine has woken
      float drop = clamp((${FLOOR_Y.toFixed(2)} - vWorld.y) / 2.1, 0.0, 1.0);
      a = mix(0.08, 0.24, uSceneGlow) * (1.0 - drop);
      col *= 0.85;
    }
    gl_FragColor = vec4(col, a);
  }
`;

const PLATE_VERT = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  attribute vec3 normal;
  uniform mat4 modelViewMatrix, projectionMatrix, modelMatrix;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** The back-cover branding: the printed lockup, lit like the body around it. */
const PLATE_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uMirror;
  uniform float uSceneGlow;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  const vec3 KEY_DIR = vec3(-0.4517, 0.7228, 0.5230);
  void main() {
    vec4 tex = texture2D(tMap, vUv);
    float diff = max(dot(normalize(vNormal), KEY_DIR), 0.0);
    vec3 col = tex.rgb * (0.55 + 0.55 * diff);
    float a = tex.a;
    if (uMirror > 0.5) {
      float drop = clamp((${FLOOR_Y.toFixed(2)} - vWorld.y) / 2.1, 0.0, 1.0);
      a *= mix(0.08, 0.24, uSceneGlow) * (1.0 - drop);
    }
    gl_FragColor = vec4(col, a);
  }
`;

/** Dark glass; a malachite backlight seeps in as the dots land. */
const SCREEN_FRAG = /* glsl */ `
  precision highp float;
  uniform float uGlow;
  uniform float uWake;
  uniform float uTime;
  uniform float uMirror;
  uniform float uSceneGlow;
  uniform vec2 uGaze;
  uniform sampler2D uLive;
  uniform float uLiveMix;
  uniform float uSpeak;
  uniform float uLiveAspect;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormal;
  float rrect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  void main() {
    vec2 p = vUv - 0.5;
    p.x *= ${(SCR_W / SCR_H).toFixed(4)};
    float d = rrect(p, vec2(${(SCR_W / SCR_H / 2).toFixed(4)}, 0.5), 0.04);
    float mask = 1.0 - smoothstep(-0.004, 0.0, d);
    // asleep: barely-there glass with a cold diagonal sheen
    float sheen = smoothstep(0.0, 1.0, 1.0 - abs(vUv.x + vUv.y - 1.06 - sin(uTime * 0.13) * 0.02)) * 0.05;
    vec3 glass = vec3(0.030, 0.042, 0.050) + vec3(0.35, 0.45, 0.52) * sheen * (1.0 - uGlow);
    // awake: backlight pooled toward the middle, malachite-cold — and for a
    // beat while the face gathers it leans toward the pointer (uGaze), then
    // re-centers so the settled frame is symmetric
    float vig = 1.0 - smoothstep(0.12, 0.62, length(vUv - vec2(0.5 + uGaze.x, 0.52 + uGaze.y)));
    vec3 lit = vec3(0.024, 0.10, 0.062) * (0.35 + 0.65 * vig);
    vec3 col = glass + lit * uGlow + vec3(0.043, 0.855, 0.318) * 0.012 * uWake;
    // the live face: greenscreen video keyed on the glass. Cover-fit the
    // frame to the screen rect; where the key removes background the lit
    // glass shows through, so she floats in the backlight, not in a box.
    if (uLiveMix > 0.001) {
      float screenAspect = ${(SCR_W / SCR_H).toFixed(4)};
      vec2 vuv = vUv - 0.5;
      float k = uLiveAspect / screenAspect;
      if (k > 1.0) { vuv.x /= k; } else { vuv.y *= k; }
      vuv += 0.5;
      vec4 live = texture2D(uLive, vec2(vuv.x, 1.0 - vuv.y));
      float dom = live.g - max(live.r, live.b);
      float keep = 1.0 - smoothstep(0.04, 0.16, dom);
      // spill: pull the green bounce off skin and hair near the key
      live.g = mix(min(live.g, max(live.r, live.b) * 1.15), live.g, keep);
      float grey = dot(live.rgb, vec3(0.299, 0.587, 0.114));
      // silence is grayscale; her speech is the only colour on this page
      vec3 face = mix(vec3(grey) * vec3(0.94, 1.0, 0.97), live.rgb, uSpeak);
      col = mix(col, face, uLiveMix * keep * mask);
    }
    float a = mask;
    if (uMirror > 0.5) {
      float drop = clamp((${FLOOR_Y.toFixed(2)} - vWorld.y) / 2.1, 0.0, 1.0);
      a *= mix(0.08, 0.24, uSceneGlow) * (1.0 - drop);
    }
    gl_FragColor = vec4(col, a);
  }
`;

const LED_FRAG = /* glsl */ `
  precision highp float;
  uniform float uWake;
  uniform float uTime;
  uniform float uMirror;
  uniform float uSceneGlow;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec2 p = vUv - 0.5;
    float m = 1.0 - smoothstep(0.30, 0.5, length(vec2(p.x * 1.4, p.y)));
    float breathe = 0.72 + 0.28 * sin(uTime * 1.9);
    float a = m * uWake * breathe;
    if (uMirror > 0.5) a *= mix(0.08, 0.24, uSceneGlow);
    gl_FragColor = vec4(vec3(0.043, 0.855, 0.318) * 1.2, a);
  }
`;

/** The light the kiosk stands in — a quiet key-light pool that learns green.
    At the top of the walk it is a wide, half-forgotten wash (uFocus 0); as
    the walk closes in it narrows to a tight circle under the kiosk. */
const POOL_FRAG = /* glsl */ `
  precision highp float;
  uniform float uPool;
  uniform float uGlow;
  uniform float uFocus;
  varying vec2 vUv;
  void main() {
    float d = length((vUv - vec2(0.5, 0.46)) * vec2(1.0, 1.55));
    float fall = pow(max(1.0 - d * mix(1.15, 2.1, uFocus), 0.0), mix(1.5, 2.2, uFocus));
    vec3 col = mix(vec3(0.30, 0.38, 0.44), vec3(0.16, 0.52, 0.33), uGlow * 0.55);
    gl_FragColor = vec4(col, fall * uPool * mix(0.42, 0.22, uFocus));
  }
`;

const DOTS_VERT = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec3 aTarget2;
  attribute vec3 aStart;
  attribute float aDelay;
  attribute float aSize;
  attribute float aSize2;
  attribute float aLum;
  attribute float aLum2;
  uniform mat4 modelViewMatrix, projectionMatrix;
  uniform float uAssemble;
  uniform float uMorph;
  uniform float uTime;
  uniform float uProjScale;
  varying float vAlpha;
  varying float vLum;
  void main() {
    // per-dot stagger: the wave settles centre-out (aDelay carries it)
    float t = clamp((uAssemble * 1.55 - aDelay) / 0.55, 0.0, 1.0);
    // ease-out with a whisper of overshoot, so landings feel caught, not parked
    float e = 1.0 - pow(1.0 - t, 3.0);
    float over = sin(min(t * 3.14159, 3.14159)) * 0.06 * (1.0 - t);
    // second act: every dot leaves the glass, arcs, and lands in the wide frame
    float m = clamp((uMorph * 1.35 - aDelay * 0.35), 0.0, 1.0);
    float me = m * m * (3.0 - 2.0 * m);
    vec3 tgt = mix(aTarget, aTarget2, me);
    tgt.z += sin(me * 3.14159) * 0.14;
    vec3 pos = mix(aStart, tgt, e + over);
    // settled dots shimmer in place — but not while they are mid-flight
    float mid = smoothstep(0.0, 0.05, me) * (1.0 - smoothstep(0.95, 1.0, me));
    float settled = step(0.999, t) * (1.0 - mid);
    pos.z += settled * sin(uTime * 1.7 + aDelay * 40.0) * 0.0035;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = mix(aSize, aSize2, me) * uProjScale / max(-mv.z, 0.1);
    vAlpha = smoothstep(0.0, 0.25, t);
    vLum = mix(aLum, aLum2, me);
  }
`;

const DOTS_FRAG = /* glsl */ `
  precision highp float;
  uniform float uMirror;
  uniform float uSceneGlow;
  uniform float uFade;
  varying float vAlpha;
  varying float vLum;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float m = 1.0 - smoothstep(0.34, 0.5, length(p));
    // paper dots; the brightest learn a little malachite from the backlight
    vec3 col = mix(vec3(0.875, 0.906, 0.933), vec3(0.36, 0.93, 0.55), smoothstep(0.55, 1.0, vLum) * 0.26);
    col *= 0.4 + 0.75 * vLum; // tone lives in brightness too, not just dot size
    float a = m * vAlpha * (1.0 - uFade);
    if (uMirror > 0.5) a *= mix(0.05, 0.16, uSceneGlow);
    gl_FragColor = vec4(col, a);
  }
`;

/* -------------------------------------------------------------- helpers */

function plane(w: number, h: number) {
  return {
    position: {
      size: 3,
      data: new Float32Array([-w / 2, -h / 2, 0, w / 2, -h / 2, 0, -w / 2, h / 2, 0, w / 2, h / 2, 0]),
    },
    normal: { size: 3, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]) },
    uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]) },
    index: { data: new Uint16Array([0, 1, 2, 1, 3, 2]) },
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * The real branding, not a redrawing of it: take the cover mark, read the
 * ink off its paper, and restack it for the back of a white kiosk — the
 * symbol above the wordmark, both keeping their printed colors (dark navy
 * ink, malachite "me"). The pixel pass runs at output resolution, not at
 * print size.
 */
async function extractBrand(): Promise<HTMLCanvasElement | null> {
  try {
    const img = await loadImage("/photos/face2me/cover-mark.jpg");
    const w = Math.min(1024, img.naturalWidth);
    const h = Math.max(2, Math.round((w * img.naturalHeight) / img.naturalWidth));
    const src = document.createElement("canvas");
    src.width = w;
    src.height = h;
    const sctx = src.getContext("2d");
    if (!sctx) return null;
    sctx.drawImage(img, 0, 0, w, h);
    const data = sctx.getImageData(0, 0, w, h);
    const px = data.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    const colInk = new Uint8Array(w);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = px[i], g = px[i + 1], b = px[i + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const green = g - Math.max(r, b);
        // paper is bright and unsaturated; everything else is ink
        const ink = 1 - Math.min(Math.max((lum - 150) / 90, 0), 1);
        if (ink > 0.04 || green > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          colInk[x] = 1;
        }
        // keep the printed color, drop the paper
        const a255 = green > 30 ? 255 : Math.round(ink * 255);
        px[i + 3] = a255;
        if (a255 === 0) {
          // transparent texels still carry the ink's own color, so bilinear
          // filtering and mipmaps never bleed paper-white into glyph edges
          px[i] = 29; px[i + 1] = 45; px[i + 2] = 58;
        } else {
          // anti-aliased edges are ink mixed with limestone (#FAF9F6):
          // un-mix the paper out, or it rings every glyph with a pale halo
          const a = a255 / 255;
          px[i] = Math.min(255, Math.max(0, Math.round((r - 250 * (1 - a)) / a)));
          px[i + 1] = Math.min(255, Math.max(0, Math.round((g - 249 * (1 - a)) / a)));
          px[i + 2] = Math.min(255, Math.max(0, Math.round((b - 246 * (1 - a)) / a)));
        }
      }
    }
    if (maxX <= minX || maxY <= minY) return null;
    sctx.putImageData(data, 0, 0);

    // the lockup is one row: symbol, gap, wordmark. Find the widest empty
    // column run between them and cut there.
    let gapStart = -1, gapLen = 0, runStart = -1;
    for (let x = minX; x <= maxX + 1; x++) {
      if (x <= maxX && !colInk[x]) {
        if (runStart < 0) runStart = x;
      } else if (runStart >= 0) {
        if (x - runStart > gapLen) {
          gapLen = x - runStart;
          gapStart = runStart;
        }
        runStart = -1;
      }
    }
    if (gapStart < 0) return null;

    const bboxOf = (x0: number, x1: number) => {
      let bMinX = x1, bMaxX = x0, bMinY = h, bMaxY = 0;
      for (let y = 0; y < h; y++) {
        for (let x = x0; x <= x1; x++) {
          if (px[(y * w + x) * 4 + 3] > 10) {
            if (x < bMinX) bMinX = x;
            if (x > bMaxX) bMaxX = x;
            if (y < bMinY) bMinY = y;
            if (y > bMaxY) bMaxY = y;
          }
        }
      }
      return { x: bMinX, y: bMinY, w: bMaxX - bMinX + 1, h: bMaxY - bMinY + 1 };
    };
    const sym = bboxOf(minX, gapStart - 1);
    const word = bboxOf(gapStart + gapLen, maxX);

    // stack them: symbol centered over the wordmark, breathing room between
    const gap = Math.round(word.h * 0.5);
    const cw = Math.max(sym.w, word.w);
    const pad = Math.round(cw * 0.06);
    const stackW = cw + pad * 2;
    const stackH = sym.h + gap + word.h + pad * 2;
    const out = document.createElement("canvas");
    out.width = 1024;
    out.height = Math.max(2, Math.round((1024 * stackH) / stackW));
    const octx = out.getContext("2d");
    if (!octx) return null;
    const k = out.width / stackW;
    octx.drawImage(
      src, sym.x, sym.y, sym.w, sym.h,
      Math.round((pad + (cw - sym.w) / 2) * k), Math.round(pad * k),
      Math.round(sym.w * k), Math.round(sym.h * k),
    );
    octx.drawImage(
      src, word.x, word.y, word.w, word.h,
      Math.round((pad + (cw - word.w) / 2) * k), Math.round((pad + sym.h + gap) * k),
      Math.round(word.w * k), Math.round(word.h * k),
    );
    return out;
  } catch {
    return null;
  }
}

/**
 * Sample the door's idle frame twice: a tight head crop for the portrait
 * screen, and a full-width cinematic crop for the landscape one — the grid
 * is transposed (76×145 → 145×76), so the same dots serve both layouts.
 */
async function sampleFace() {
  const img = await loadImage("/photos/face2me/ren-idle.jpg");
  const grab = (cols: number, rows: number, sx: number, sy: number, sw: number, sh: number) => {
    const c = document.createElement("canvas");
    c.width = cols;
    c.height = rows;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
    return ctx.getImageData(0, 0, cols, rows).data;
  };
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const psw = W * 0.68;
  const psy = H * 0.04;
  const port = grab(
    DOT_COLS, DOT_ROWS,
    W * 0.16, psy, psw, Math.min(psw / (SCR_W / SCR_H), H - psy),
  );
  const lsh = Math.min(W / (SCR_H / SCR_W), H);
  const land = grab(DOT_ROWS, DOT_COLS, 0, Math.min(H * 0.14, H - lsh), W, lsh);
  return port && land ? { port, land } : null;
}

/** Damp the photo's background so the halftone is her, not the office. */
function faceWeight(col: number, row: number) {
  const cx = (col + 0.5) / DOT_COLS - 0.5;
  const cy = (row + 0.5) / DOT_ROWS - 0.42;
  const r = Math.hypot(cx * 1.35, cy * 0.9);
  const m = Math.min(Math.max(1.45 - r * 2.3, 0), 1);
  return 0.35 + 0.65 * m;
}

/** Same damping for the wide crop — face centred, office dimmed hard. */
function faceWeightWide(col: number, row: number) {
  const cx = (col + 0.5) / DOT_ROWS - 0.5;
  const cy = (row + 0.5) / DOT_COLS - 0.48;
  const r = Math.hypot(cx * 1.7, cy * 0.75);
  const m = Math.min(Math.max(1.5 - r * 2.6, 0), 1);
  return 0.22 + 0.78 * m;
}

/* ------------------------------------------------------------ component */

type Refs = {
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  hostRef: RefObject<HTMLDivElement | null>;
  rotateRef: RefObject<HTMLButtonElement | null>;
  fsRef: RefObject<HTMLButtonElement | null>;
  coldRef: RefObject<HTMLAnchorElement | null>;
  walkRef: RefObject<HTMLDivElement | null>;
  callRef: RefObject<HTMLButtonElement | null>;
};

export default function HeroScene({
  sectionRef,
  stageRef,
  hostRef,
  rotateRef,
  fsRef,
  coldRef,
  walkRef,
  callRef,
}: Refs) {
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const host = hostRef.current;
    const rotateBtn = rotateRef.current;
    const fsBtn = fsRef.current;
    const callBtn = callRef.current;
    const coldEl = coldRef.current;
    // the margin notes carry their own scroll windows as data attributes
    const walkCaps = Array.from(walkRef.current?.children ?? []).flatMap((el) => {
      if (!(el instanceof HTMLElement)) return [];
      const from = parseFloat(el.dataset.from ?? "");
      const to = parseFloat(el.dataset.to ?? "");
      return Number.isFinite(from) && Number.isFinite(to) ? [{ el, from, to }] : [];
    });
    if (!section || !stage || !host) return;

    const still = reducedMotion();

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(2, window.devicePixelRatio || 1),
        alpha: true,
        // dpr >= 1.5 already supersamples; MSAA on top would only burn fill rate
        antialias: (window.devicePixelRatio || 1) < 1.5,
      });
    } catch {
      // no WebGL — nothing to walk up to; shed the runway
      section.style.height = "100vh";
      return;
    }
    const gl = renderer.gl;
    host.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    gl.clearColor(0, 0, 0, 0);
    renderer.autoClear = false;

    const camera = new Camera(gl, { fov: FOV, near: 0.1, far: 40 });

    /* -- programs (shared between the world and its reflection) -- */
    const mkUniforms = () => ({
      uMirror: { value: 0 },
      uTime: { value: 0 },
      uCam: { value: new Vec3() },
      uSceneGlow: { value: 0 },
    });

    const bodyProgram = new Program(gl, {
      vertex: BODY_VERT,
      fragment: BODY_FRAG,
      transparent: true,
      cullFace: false,
      uniforms: { ...mkUniforms(), uColor: { value: new Vec3(0.9, 0.93, 0.97) } },
    });
    const plateProgram = new Program(gl, {
      vertex: PLATE_VERT,
      fragment: PLATE_FRAG,
      transparent: true,
      cullFace: false,
      depthWrite: false,
      uniforms: { ...mkUniforms(), tMap: { value: new Texture(gl) } },
    });
    const screenProgram = new Program(gl, {
      vertex: PLATE_VERT,
      fragment: SCREEN_FRAG,
      transparent: true,
      cullFace: false,
      depthWrite: false,
      uniforms: {
        ...mkUniforms(),
        uGlow: { value: 0 },
        uWake: { value: 0 },
        uGaze: { value: new Vec2() },
        uLive: { value: new Texture(gl) },
        uLiveMix: { value: 0 },
        uSpeak: { value: 0 },
        uLiveAspect: { value: 0.75 },
      },
    });
    const ledProgram = new Program(gl, {
      vertex: PLATE_VERT,
      fragment: LED_FRAG,
      transparent: true,
      cullFace: false,
      depthWrite: false,
      uniforms: { ...mkUniforms(), uWake: { value: 0 } },
    });
    ledProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
    const poolProgram = new Program(gl, {
      vertex: PLATE_VERT,
      fragment: POOL_FRAG,
      transparent: true,
      cullFace: false,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        ...mkUniforms(),
        uPool: { value: 0 },
        uGlow: { value: 0 },
        uFocus: { value: 0 },
      },
    });
    poolProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
    const dotsProgram = new Program(gl, {
      vertex: DOTS_VERT,
      fragment: DOTS_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        ...mkUniforms(),
        uAssemble: { value: 0 },
        uMorph: { value: 0 },
        uProjScale: { value: 1 },
        uFade: { value: 0 },
      },
    });
    dotsProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
    const programs = [bodyProgram, plateProgram, screenProgram, ledProgram, poolProgram, dotsProgram];
    const setMirror = (v: number) => programs.forEach((p) => (p.uniforms.uMirror.value = v));

    /* -- geometry -- */
    const slabGeo = new Geometry(gl, roundedSlab(K_W, K_H, K_D, K_R));
    const columnGeo = new Geometry(gl, roundedSlab(0.5, 0.32, 0.1, 0.03, 4));
    const baseGeo = new Geometry(gl, roundedSlab(0.85, 0.5, 0.08, 0.04, 6));
    const screenGeo = new Geometry(gl, plane(SCR_W, SCR_H));
    const ledGeo = new Geometry(gl, plane(0.1, 0.018));
    const poolGeo = new Geometry(gl, plane(9, 9));
    const plateGeo = new Geometry(gl, plane(1, 1)); // scaled once the brand loads

    /* dots geometry is preallocated, filled once the face loads —
       until then every dot is size zero, i.e. not there */
    const DOT_N = DOT_COLS * DOT_ROWS;
    const dotsGeo = new Geometry(gl, {
      aTarget: { size: 3, data: new Float32Array(DOT_N * 3) },
      aTarget2: { size: 3, data: new Float32Array(DOT_N * 3) },
      aStart: { size: 3, data: new Float32Array(DOT_N * 3) },
      aDelay: { size: 1, data: new Float32Array(DOT_N) },
      aSize: { size: 1, data: new Float32Array(DOT_N) },
      aSize2: { size: 1, data: new Float32Array(DOT_N) },
      aLum: { size: 1, data: new Float32Array(DOT_N) },
      aLum2: { size: 1, data: new Float32Array(DOT_N) },
    });

    /** One kiosk = one parent with the same children; built twice, world + mirror.
        The display (slab, screen, LED, back plate, dots) lives in `head`, which
        can turn flat on its column; the column and base plate stay put. */
    const buildKiosk = () => {
      const root = new Transform();
      const head = new Transform();
      head.setParent(root);
      new Mesh(gl, { geometry: slabGeo, program: bodyProgram }).setParent(head);
      const column = new Mesh(gl, { geometry: columnGeo, program: bodyProgram });
      column.position.set(0, -K_H / 2 - 0.16, 0);
      column.setParent(root);
      const base = new Mesh(gl, { geometry: baseGeo, program: bodyProgram });
      base.position.set(0, -K_H / 2 - 0.36, 0);
      base.rotation.x = -Math.PI / 2;
      base.setParent(root);
      const screen = new Mesh(gl, { geometry: screenGeo, program: screenProgram });
      screen.position.set(0, SCR_Y, K_D / 2 + 0.003);
      screen.setParent(head);
      const led = new Mesh(gl, { geometry: ledGeo, program: ledProgram });
      led.position.set(0, SCR_Y - SCR_H / 2 - 0.045, K_D / 2 + 0.003);
      led.setParent(head);
      const plate = new Mesh(gl, { geometry: plateGeo, program: plateProgram });
      plate.position.set(0, 0.3, -K_D / 2 - 0.003);
      plate.rotation.y = Math.PI;
      plate.scale.set(0, 0, 1); // invisible until the brand texture lands
      plate.setParent(head);
      const dots = new Mesh(gl, { geometry: dotsGeo, program: dotsProgram, mode: gl.POINTS });
      dots.position.set(0, SCR_Y, K_D / 2 + 0.012);
      dots.setParent(head);
      return { root, head, plate };
    };

    const world = new Transform();
    const pool = new Mesh(gl, { geometry: poolGeo, program: poolProgram });
    pool.position.set(0, FLOOR_Y + 0.001, -CAM_END + 0.4);
    pool.rotation.x = -Math.PI / 2;
    pool.setParent(world);
    const kiosk = buildKiosk();
    kiosk.root.setParent(world);

    const mirrorWorld = new Transform();
    mirrorWorld.position.y = FLOOR_Y * 2;
    mirrorWorld.scale.set(1, -1, 1);
    const kioskM = buildKiosk();
    kioskM.root.setParent(mirrorWorld);

    /* -- async dressing: brand plate + halftone face -- */
    let dead = false;
    let faceReady = false;

    extractBrand().then((canvas) => {
      if (dead || !canvas) return;
      const tex = new Texture(gl, { image: canvas, generateMipmaps: true });
      plateProgram.uniforms.tMap.value = tex;
      const w = 0.7;
      const h = (w * canvas.height) / canvas.width;
      kiosk.plate.scale.set(w, h, 1);
      kioskM.plate.scale.set(w, h, 1);
      if (still) renderOnce();
    });

    sampleFace().then((px) => {
      if (dead || !px) return;
      const target = dotsGeo.attributes.aTarget.data as Float32Array;
      const target2 = dotsGeo.attributes.aTarget2.data as Float32Array;
      const start = dotsGeo.attributes.aStart.data as Float32Array;
      const delay = dotsGeo.attributes.aDelay.data as Float32Array;
      const size = dotsGeo.attributes.aSize.data as Float32Array;
      const size2 = dotsGeo.attributes.aSize2.data as Float32Array;
      const lums = dotsGeo.attributes.aLum.data as Float32Array;
      const lums2 = dotsGeo.attributes.aLum2.data as Float32Array;
      const punch = (p: Uint8ClampedArray, i: number) => {
        const raw = (0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]) / 255;
        // local contrast first, so the eyes and mouth survive the dots
        return Math.min(1, Math.max(0, (raw - 0.1) * 1.45));
      };
      const cell = SCR_W / DOT_COLS;
      let rand = 1234567;
      const rnd = () => ((rand = (rand * 16807) % 2147483647) / 2147483647);
      for (let row = 0; row < DOT_ROWS; row++) {
        for (let col = 0; col < DOT_COLS; col++) {
          const i = row * DOT_COLS + col;
          const lum = Math.pow(punch(px.port, i * 4), 1.05) * faceWeight(col, row);
          // the grid stops a hair short of the glass, clear of its corners
          const x = ((col + 0.5) * cell - SCR_W / 2) * 0.955;
          const y = (SCR_H / 2 - (row + 0.5) * (SCR_H / DOT_ROWS)) * 0.965;
          target[i * 3] = x;
          target[i * 3 + 1] = y;
          target[i * 3 + 2] = 0;
          // thrown in from a shell around the kiosk, biased toward the viewer
          const th = rnd() * Math.PI * 2;
          const ph = Math.acos(rnd() * 2 - 1);
          const rr = 2.1 + rnd() * 2.6;
          start[i * 3] = Math.sin(ph) * Math.cos(th) * rr;
          start[i * 3 + 1] = Math.cos(ph) * rr * 0.7;
          start[i * 3 + 2] = Math.abs(Math.sin(ph) * Math.sin(th)) * rr * 0.9 + 0.35;
          // the wave lands centre-out, with grain so it never reads mechanical
          const dc = Math.hypot(x / (SCR_W / 2), y / (SCR_H / 2)) / Math.SQRT2;
          delay[i] = dc * 0.62 + rnd() * 0.3;
          lums[i] = lum;
          size[i] = cell * (0.34 + Math.pow(lum, 1.3) * 1.3);
        }
      }
      // the wide layout on the transposed grid: dot j lands at landscape cell j.
      // Targets live in head-local space, which ends the act rotated -90° —
      // so an upright wide image needs local (x, y) = (-wy, wx).
      const cellW = SCR_H / DOT_ROWS;
      for (let row = 0; row < DOT_COLS; row++) {
        for (let col = 0; col < DOT_ROWS; col++) {
          const j = row * DOT_ROWS + col;
          const lum = Math.pow(punch(px.land, j * 4), 1.05) * faceWeightWide(col, row);
          const wx = ((col + 0.5) * cellW - SCR_H / 2) * 0.955;
          const wy = (SCR_W / 2 - (row + 0.5) * (SCR_W / DOT_COLS)) * 0.965;
          target2[j * 3] = -wy;
          target2[j * 3 + 1] = wx;
          target2[j * 3 + 2] = 0;
          lums2[j] = lum;
          size2[j] = cellW * (0.34 + Math.pow(lum, 1.3) * 1.3);
        }
      }
      for (const key of [
        "aTarget", "aTarget2", "aStart", "aDelay", "aSize", "aSize2", "aLum", "aLum2",
      ] as const) {
        dotsGeo.attributes[key].needsUpdate = true;
      }
      faceReady = true;
      if (still) renderOnce();
    });

    /* -- state driven by scroll -- */
    const state: State = {
      z: -CAM_START,
      yaw: Math.PI,
      camY: 0.45,
      assemble: 0,
      glow: 0,
      wake: 0,
      pool: 0.55,
      focus: 0,
    };

    /** The second act is not on the scroll: the rotate button drives it.
        Kept outside the timeline so tl.progress() never fights the tween. */
    const act2 = { rot: 0, dz: 0, dy: 0 };
    let rotOn = false;

    /** The call, as the scene sees it. mix fades the keyed video in over the
        halftone; speak colours it; jolt is the flinch when she is cut off. */
    const live = { mix: 0, speak: 0, jolt: 0 };
    let liveVideo: HTMLVideoElement | null = null;
    let liveOn = false;
    let liveish = false; // connecting OR live: parks the rotate act early
    let fed = 0; // ramps only once real frames flow — an unfed texture is black,
    // and black reads as "face" to the keyer (no green to dominate), so mixing
    // before the first frame would flash the glass dark
    let leftStageSent = false;
    const liveTex = new Texture(gl, {
      generateMipmaps: false,
      flipY: false, // video uploads skip the flip; the shader flips vUv instead
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });
    screenProgram.uniforms.uLive.value = liveTex;

    const offBus = onReception((d) => {
      if (d.type === "video") {
        liveVideo = d.el;
      } else if (d.type === "phase") {
        const was = liveOn;
        liveOn = d.phase === "live";
        liveish = d.phase === "live" || d.phase === "connecting";
        if (liveOn && !was) {
          leftStageSent = false; // new call, new ticket
          fed = 0; // every call re-earns its first frame
          if (rotOn) setRotation(false); // portrait face on a landscape act reads sideways
          gsap.killTweensOf(live);
          if (still) { live.mix = 1; start(); } // the loop must run to feed the texture
          else gsap.to(live, { mix: 1, duration: 1.8, ease: "power2.inOut" });
        } else if (!liveOn && was) {
          gsap.killTweensOf(live);
          if (still) { live.mix = 0; live.speak = 0; stop(); renderOnce(); }
          else gsap.to(live, { mix: 0, speak: 0, duration: 1.4, ease: "power2.inOut" });
        }
      } else if (d.type === "speaking" && d.who === "pal") {
        if (!still) {
          gsap.to(live, { speak: d.on ? 1 : 0, duration: 0.45, ease: "power1.inOut" });
          if (d.interrupted) gsap.fromTo(live, { jolt: 1 }, { jolt: 0, duration: 0.6, ease: "power2.out" });
        } else {
          live.speak = d.on ? 1 : 0;
        }
      }
    });

    // narrow viewports step closer for the portrait act, then well back for the
    // wide one — a landscape display doesn't fit a phone any other way
    let wide = false;
    const distK = () => (wide ? 1 : 0.91 + act2.rot * 1.51);

    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    tl.to(state, { z: -CAM_END, duration: 0.55, ease: "power2.inOut" }, 0)
      .to(state, { camY: -0.2, duration: 0.55, ease: "power2.out" }, 0)
      .to(state, { yaw: 0, duration: 0.47, ease: "power2.inOut" }, 0.08)
      .to(state, { pool: 1, duration: 0.5, ease: "none" }, 0.05)
      // the one floor light learns its aim on the same span as the walk
      .to(state, { focus: 1, duration: 0.55, ease: "power2.inOut" }, 0)
      .to(state, { wake: 1, duration: 0.06, ease: "power1.in" }, 0.5)
      .to(state, { assemble: 1, duration: 0.36, ease: "none" }, 0.55)
      .to(state, { glow: 1, duration: 0.3, ease: "power1.inOut" }, 0.6);

    /** Turn the display flat (or back): hop, swing, set down — and only then
        the camera steps in close (in reverse it backs out first), so the
        swinging diagonal never clips the frame. */
    const setRotation = (on: boolean) => {
      rotOn = on;
      rotateBtn?.setAttribute("aria-pressed", String(on));
      gsap.killTweensOf(act2);
      if (still) {
        gsap.set(act2, {
          rot: on ? 1 : 0,
          dz: on ? CAM_WIDE - CAM_END : 0,
          dy: on ? -0.42 : 0,
        });
        renderOnce();
        return;
      }
      gsap.to(act2, { rot: on ? 1 : 0, duration: 1.7, ease: "power3.inOut" });
      gsap.to(act2, {
        dz: on ? CAM_WIDE - CAM_END : 0,
        dy: on ? -0.42 : 0,
        duration: 0.8,
        ease: "power2.inOut",
        delay: on ? 0.9 : 0,
      });
    };
    const onRotateClick = () => setRotation(!rotOn);
    rotateBtn?.addEventListener("click", onRotateClick);

    /* -- fullscreen: the stage itself goes full-bleed -- */
    const fsSupported = typeof stage.requestFullscreen === "function";
    if (fsBtn && !fsSupported) fsBtn.style.display = "none";
    const onFsClick = () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        target = 1; // fullscreen always shows the settled kiosk
        void stage.requestFullscreen();
      }
    };
    const onFsChange = () => {
      fsBtn?.setAttribute("aria-pressed", String(!!document.fullscreenElement));
      resize();
      if (still) renderOnce();
    };
    if (fsSupported) {
      fsBtn?.addEventListener("click", onFsClick);
      document.addEventListener("fullscreenchange", onFsChange);
    }

    /* -- sizing (coalesced to one real resize per frame) -- */
    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
      // same signal as the copy overlay's md: breakpoint, so they never disagree
      wide = window.matchMedia("(min-width: 768px)").matches;
      dotsProgram.uniforms.uProjScale.value =
        gl.canvas.height / (2 * Math.tan((FOV * Math.PI) / 360));
    };
    resize();
    let resizeQueued = false;
    const onResize = () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        resizeQueued = false;
        resize();
        if (still) renderOnce();
      });
    };
    window.addEventListener("resize", onResize);

    /* -- pointer: the camera leans, barely -- */
    const lean = { x: 0, y: 0 };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointer = (e: PointerEvent) => {
      lean.x = (e.clientX / window.innerWidth - 0.5) * 0.09;
      lean.y = (e.clientY / window.innerHeight - 0.5) * -0.05;
    };
    if (fine && !still) window.addEventListener("pointermove", onPointer);

    /* -- render -- */
    let target = still ? 1 : 0;
    let shown = still ? 1 : 0;
    let assembleShown = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();
    const born = last; // the title card fades in against real time, not scroll
    const leanNow = { x: 0, y: 0 };
    const lookTarget = new Vec3();
    const sstep = (a: number, b: number, x: number) => {
      const s = Math.min(Math.max((x - a) / (b - a), 0), 1);
      return s * s * (3 - 2 * s);
    };

    const paint = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = still ? 1 : 1 - Math.exp(-dt * 7.5);
      shown += (target - shown) * k;
      leanNow.x += (lean.x - leanNow.x) * k;
      leanNow.y += (lean.y - leanNow.y) * k;
      tl.progress(shown);

      // the gather can never outrun its own data: until the face sample has
      // landed the dots hold at zero, and a late arrival glides in instead
      // of popping fully formed
      const want = faceReady ? state.assemble : 0;
      const rate = want - assembleShown > 0.25 ? 2.4 : 16;
      assembleShown += (want - assembleShown) * (still ? 1 : 1 - Math.exp(-dt * rate));

      const t = still ? 0 : now / 1000;
      const z = (state.z - act2.dz) * distK();
      kiosk.root.position.set(0, 0, z);
      kiosk.root.rotation.y = state.yaw;
      // the display turns flat on its column: drops to meet it, with a small
      // hop mid-turn so the swinging corner clears the base plate
      kiosk.head.rotation.z = (-Math.PI / 2) * act2.rot;
      kiosk.head.position.y = -0.43 * act2.rot + Math.sin(act2.rot * Math.PI) * 0.12;
      kioskM.root.position.copy(kiosk.root.position);
      kioskM.root.rotation.copy(kiosk.root.rotation);
      kioskM.head.rotation.copy(kiosk.head.rotation);
      kioskM.head.position.copy(kiosk.head.position);
      pool.position.z = z + 0.3;
      // the wash is physically wide while the light is still lost, and pulls
      // its footprint in as it learns its aim
      const poolSpread = 1.9 - 0.9 * state.focus;
      pool.scale.set(poolSpread, poolSpread, 1);

      // the controls belong to the settled kiosk: show them only once the face
      // has landed, and take the act back to portrait if the reader walks off
      const ready = shown > 0.965 && faceReady;
      for (const btn of [rotateBtn, fsBtn, callBtn]) {
        if (!btn) continue;
        // during the call (and already while it connects) the rotate act is
        // parked: a portrait face on a landscape display would lie on its side
        const parked = btn === rotateBtn && (liveish || live.mix > 0.5);
        btn.style.opacity = ready ? (parked ? "0.3" : "1") : "0";
        btn.style.pointerEvents = ready && !parked ? "auto" : "none";
      }
      if (rotOn && shown < 0.9) setRotation(false);
      // walking away from the desk hangs up — once per call
      if (liveOn && shown < 0.9 && !leftStageSent) {
        leftStageSent = true;
        emitReception({ type: "left-stage" });
      }

      camera.position.set(leanNow.x, state.camY + act2.dy + leanNow.y, 0);
      // level gaze — the height offset does the framing
      lookTarget.set(0, state.camY + act2.dy, z);
      camera.lookAt(lookTarget);

      for (const p of programs) {
        p.uniforms.uTime.value = t;
        // the floor's reflection firms up only as the machine wakes
        p.uniforms.uSceneGlow.value = state.glow;
        if (p.uniforms.uCam) p.uniforms.uCam.value.copy(camera.position);
      }
      if (liveVideo && live.mix > 0.001 && liveVideo.readyState >= 2) {
        if (liveTex.image !== liveVideo) liveTex.image = liveVideo;
        liveTex.needsUpdate = true;
        screenProgram.uniforms.uLiveAspect.value =
          liveVideo.videoWidth / Math.max(1, liveVideo.videoHeight);
        fed = Math.min(1, fed + dt * 2.5);
      }
      const mixNow = live.mix * fed; // the key opens only once frames actually flow
      // her speech warms the backlight and the pool, a breath, not a strobe
      screenProgram.uniforms.uGlow.value = state.glow * (1 + live.speak * 0.22);
      screenProgram.uniforms.uWake.value = state.wake;
      screenProgram.uniforms.uLiveMix.value = mixNow;
      screenProgram.uniforms.uSpeak.value = live.speak;
      // the backlight glances toward the pointer while the face gathers,
      // then provably re-centers so the settled frame stays symmetric —
      // and it kicks sideways for a beat when the visitor cuts her off
      const gaze = sstep(0.55, 0.65, shown) * (1 - sstep(0.75, 0.85, shown));
      screenProgram.uniforms.uGaze.value.set(
        leanNow.x * 0.8 * gaze + live.jolt * 0.06 * Math.sin(now * 0.04),
        leanNow.y * 0.8 * gaze,
      );
      ledProgram.uniforms.uWake.value = state.wake;
      poolProgram.uniforms.uPool.value = state.pool;
      poolProgram.uniforms.uGlow.value = state.glow * (1 + live.speak * 0.18);
      poolProgram.uniforms.uFocus.value = state.focus;
      dotsProgram.uniforms.uAssemble.value = assembleShown;
      dotsProgram.uniforms.uMorph.value = act2.rot;
      dotsProgram.uniforms.uFade.value = mixNow;

      // the visit button holds over the opening frame and dissolves as the
      // walk starts (reduced motion never shows it); its letters glide
      // together as it arrives. It is clickable and tabbable only while
      // actually visible.
      if (coldEl) {
        const intro = still ? 1 : Math.min(1, (now - born) / 900);
        const cold = still ? 0 : intro * (1 - sstep(0.02, 0.055, shown));
        coldEl.style.opacity = cold.toFixed(3);
        coldEl.style.letterSpacing = `${(0.35 + (1 - intro) * 0.22).toFixed(3)}em`;
        coldEl.style.pointerEvents = cold > 0.35 ? "auto" : "none";
        coldEl.style.visibility = cold > 0.01 ? "visible" : "hidden";
      }
      // the margin notes each live in their own scroll window, rising a few
      // pixels as they arrive; all of them are gone before the screen wakes
      for (const cap of walkCaps) {
        const o = still
          ? 0
          : sstep(cap.from, cap.from + 0.04, shown) * (1 - sstep(cap.to - 0.04, cap.to, shown));
        cap.el.style.opacity = o.toFixed(3);
        cap.el.style.transform = `translateY(${((1 - o) * 8).toFixed(2)}px)`;
      }

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      setMirror(1);
      renderer.render({ scene: mirrorWorld, camera, sort: false, frustumCull: false, clear: false });
      setMirror(0);
      renderer.render({ scene: world, camera, sort: false, frustumCull: false, clear: false });
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      paint(now);
    };
    /** Reduced motion renders on demand — one frame per change, no loop. */
    const renderOnce = () => {
      last = performance.now();
      paint(last);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /* -- scroll -- */
    let st: ScrollTrigger | undefined;
    let io: IntersectionObserver | undefined;
    if (!still) {
      st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          // in fullscreen the scroll behind the stage must not move the scene
          if (!document.fullscreenElement) target = self.progress;
        },
      });
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            start();
            return;
          }
          // scrolled off the hero in either direction — walking away from
          // the desk hangs up whichever way she left it
          if (liveOn && !leftStageSent) {
            leftStageSent = true;
            emitReception({ type: "left-stage" });
          }
          stop();
        },
        { threshold: 0 },
      );
      io.observe(section);
    } else {
      // the end frame, at rest; motion-reduce: CSS has already shed the runway
      tl.progress(1);
      renderOnce();
    }

    // fromTo + overwrite, not from: a StrictMode remount kills the first tween
    // mid-flight and a second `from` would then animate 0 -> 0 (see LineReveal)
    const fadeIn = still
      ? null
      : gsap.fromTo(
          host,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8, ease: "power1.out", overwrite: true },
        );

    return () => {
      dead = true;
      stop();
      io?.disconnect();
      st?.kill();
      tl.kill();
      fadeIn?.kill();
      offBus();
      gsap.killTweensOf(live);
      gsap.killTweensOf(act2);
      rotateBtn?.removeEventListener("click", onRotateClick);
      if (fsSupported) {
        fsBtn?.removeEventListener("click", onFsClick);
        document.removeEventListener("fullscreenchange", onFsChange);
      }
      window.removeEventListener("resize", onResize);
      if (fine && !still) window.removeEventListener("pointermove", onPointer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      host.removeChild(gl.canvas);
    };
    // refs are stable for the life of the hero
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
