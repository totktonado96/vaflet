"use client";

import { useEffect, useRef } from "react";

const VERTEX = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform float uScale;
uniform float uType;
uniform float uTypeB;
uniform float uMix;
uniform float uSpeed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

float pattern(float ty, vec2 uv, vec2 c, float n, float t) {
  if (ty < 0.5) {
    // flowing diagonal strata
    return sin((uv.x + uv.y) * 18.0 + n * 12.0 + t);
  } else if (ty < 1.5) {
    // concentric ripples
    return sin(length(c) * 44.0 - t * 2.0 + n * 9.0);
  } else if (ty < 2.5) {
    // organic cell blobs
    return sin(n * 22.0 + t * 1.4);
  } else if (ty < 3.5) {
    // interference of two rotating wave sets — moire
    float a = sin(uv.x * 34.0 + n * 5.0 + t);
    float b = sin((uv.x * 0.4 + uv.y) * 30.0 - t * 1.3 + n * 4.0);
    return a * b;
  } else if (ty < 4.5) {
    // warped crosshatch grid
    vec2 w = uv * 22.0 + vec2(n * 6.0, n * 6.0) + t * 0.6;
    return sin(w.x) * sin(w.y) + n - 0.5;
  }
  if (ty < 5.5) {
    // radial spokes twisting over time
    float ang = atan(c.y, c.x);
    return sin(ang * 9.0 + length(c) * 12.0 - t * 1.6 + n * 7.0);
  } else if (ty < 6.5) {
    // horizontal topo flow lines
    return sin(uv.y * 26.0 + n * 10.0 - t * 0.9);
  } else if (ty < 7.5) {
    // diamond rings (chebyshev distance)
    return sin(max(abs(c.x), abs(c.y)) * 52.0 - t * 1.8 + n * 6.0);
  } else if (ty < 8.5) {
    // spiral arms
    float sang = atan(c.y, c.x);
    return sin(sang * 4.0 + length(c) * 26.0 - t * 1.7 + n * 6.0);
  } else if (ty < 9.5) {
    // halftone dot lattice
    vec2 g = uv * 28.0 + t * 0.5;
    return cos(g.x) + cos(g.y) + n * 1.5 - 0.75;
  } else if (ty < 10.5) {
    // vertical strata drifting sideways
    return sin(uv.x * 24.0 + n * 9.0 + t * 0.8);
  } else if (ty < 11.5) {
    // chevron zigzag
    float tri = abs(fract(uv.x * 6.0) * 2.0 - 1.0);
    return sin(uv.y * 22.0 + tri * 6.0 + n * 6.0 - t * 1.2);
  } else if (ty < 12.5) {
    // big wobbling checker tiles
    vec2 q = uv * 8.0 + vec2(sin(uv.y * 4.0 + t * 0.7), cos(uv.x * 4.0 - t * 0.6)) * 0.8;
    return sin(q.x) * sin(q.y) * 1.4 + n - 0.5;
  }
  // woven counterflow rows
  float row = floor(uv.y * 10.0);
  return sin(uv.x * 30.0 + row * 1.7 + n * 5.0 + t * (mod(row, 2.0) * 2.0 - 1.0));
}

void main() {
  vec2 uv0 = gl_FragCoord.xy / uRes.y;
  float t = uTime * uSpeed;
  float n = fbm(uv0 * uScale + vec2(t * 0.15, t * 0.1));
  // morph: blend the raw fields, then binarize — contours flow from one
  // pattern into the other while the image stays pure 1-bit. Mid-morph the
  // space itself melts (noise warp) and the ink edge relaxes a touch, so
  // shapes pour into each other instead of flickering across the threshold.
  float bell = uMix * (1.0 - uMix) * 4.0;
  vec2 warp = (vec2(fbm(uv0 * 2.6 + t * 0.12), fbm(uv0 * 2.6 + 7.31 - t * 0.09)) - 0.5) * bell * 0.3;
  vec2 uv = uv0 + warp;
  vec2 c = uv - vec2(0.5 * uRes.x / uRes.y, 0.5);
  float field = pattern(uType, uv, c, n, t);
  if (uMix > 0.0005) {
    field = mix(field, pattern(uTypeB, uv, c, n, t), uMix);
  }
  float edge = 0.06 + 0.14 * bell;
  float v = smoothstep(-edge, edge, field);
  gl_FragColor = vec4(vec3(v), 1.0);
}
`;

// Pure-b/w CSS patterns shown until (or instead of) the shader renders
const FALLBACKS = [
  "repeating-linear-gradient(115deg, #000 0 10px, #fff 10px 20px)",
  "repeating-radial-gradient(circle at 50% 45%, #000 0 10px, #fff 10px 20px)",
  "repeating-linear-gradient(45deg, #000 0 12px, #fff 12px 24px)",
  "repeating-linear-gradient(90deg, #000 0 9px, #fff 9px 18px)",
  "repeating-conic-gradient(#000 0 25%, #fff 0 50%) 0 0 / 26px 26px",
  "repeating-conic-gradient(from 0deg at 50% 50%, #000 0 8deg, #fff 8deg 16deg)",
  "repeating-linear-gradient(0deg, #000 0 10px, #fff 10px 20px)",
  "repeating-radial-gradient(circle at 50% 50%, #000 0 12px, #fff 12px 24px)",
  "repeating-conic-gradient(from 45deg, #000 0 12deg, #fff 12deg 24deg)",
  "radial-gradient(#000 40%, #fff 41%) 0 0 / 22px 22px",
  "repeating-linear-gradient(90deg, #000 0 14px, #fff 14px 28px)",
  "repeating-linear-gradient(135deg, #000 0 10px, #fff 10px 20px)",
  "repeating-conic-gradient(#000 0 25%, #fff 0 50%) 0 0 / 40px 40px",
  "repeating-linear-gradient(0deg, #000 0 6px, #fff 6px 12px)",
];

const TYPE_COUNT = FALLBACKS.length;

export default function InkField({
  type = 0,
  scale = 3,
  speed = 0.6,
  morphEvent,
  interactive = false,
  className,
}: {
  /** 0 strata · 1 ripples · 2 cells · 3 moire · 4 crosshatch · 5 spokes ·
      6 topo lines · 7 diamond rings · 8 spiral · 9 halftone dots ·
      10 vertical strata · 11 chevrons · 12 checker tiles · 13 woven rows */
  type?: number;
  scale?: number;
  speed?: number;
  /** window event name: each dispatch boils the pattern into the next type
      (CustomEvent detail may carry a number to pick the type) */
  morphEvent?: string;
  /** hover speeds the pattern up and grows the custom cursor */
  interactive?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let disposed = false;
    let visible = true;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { Renderer, Program, Mesh, Triangle } = await import("ogl");
      if (disposed || !ref.current) return;

      const renderer = new Renderer({
        dpr: Math.min(2, window.devicePixelRatio || 1),
        alpha: false,
      });
      const gl = renderer.gl;
      el.appendChild(gl.canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: VERTEX,
        fragment: FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: [1, 1] },
          uScale: { value: scale },
          uType: { value: type },
          uTypeB: { value: type },
          uMix: { value: 0 },
          uSpeed: { value: speed },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      const resize = () => {
        renderer.setSize(el.clientWidth, el.clientHeight);
        program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(el);

      // On context loss, drop the canvas so the CSS pattern fallback shows
      const onContextLost = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(raf);
        gl.canvas.remove();
      };
      gl.canvas.addEventListener("webglcontextlost", onContextLost);

      // The clock is an accumulated phase, so speed changes (hover, morph
      // boil) bend time smoothly instead of jumping the pattern.
      let currentType: number = type;
      let pendingType: number = type;
      let morphStart = -1;
      let hoverBoost = 1;
      let hoverTarget = 1;
      let phase = 0;
      let last = performance.now();

      const onMorph = (e: Event) => {
        // commit an in-flight morph before starting the next one
        if (morphStart >= 0) {
          currentType = pendingType;
          program.uniforms.uType.value = currentType;
          program.uniforms.uMix.value = 0;
        }
        const d = (e as CustomEvent).detail;
        pendingType =
          typeof d === "number"
            ? ((Math.round(d) % TYPE_COUNT) + TYPE_COUNT) % TYPE_COUNT
            : (currentType + 1) % TYPE_COUNT;
        if (pendingType === currentType)
          pendingType = (currentType + 1) % TYPE_COUNT;
        program.uniforms.uTypeB.value = pendingType;
        morphStart = performance.now();
      };
      if (morphEvent) window.addEventListener(morphEvent, onMorph);

      const onEnter = () => {
        hoverTarget = 2.6;
      };
      const onLeave = () => {
        hoverTarget = 1;
      };
      if (interactive) {
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
      }

      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        if (!visible) return;

        // morph: the raw fields crossfade in the shader (with space melt)
        // over a long quintic ease, then the target type is committed
        let boil = 1;
        if (morphStart >= 0) {
          const ph = (now - morphStart) / 1200;
          if (ph >= 1) {
            morphStart = -1;
            currentType = pendingType;
            program.uniforms.uType.value = currentType;
            program.uniforms.uMix.value = 0;
          } else {
            program.uniforms.uMix.value =
              ph * ph * ph * (ph * (ph * 6 - 15) + 10);
            boil = 1 + 1.3 * Math.sin(Math.PI * ph);
          }
        }
        hoverBoost += (hoverTarget - hoverBoost) * 0.07;
        phase += dt * boil * hoverBoost;
        program.uniforms.uTime.value = phase;
        renderer.render({ scene: mesh });
      };
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        ro.disconnect();
        io.disconnect();
        if (morphEvent) window.removeEventListener(morphEvent, onMorph);
        if (interactive) {
          el.removeEventListener("pointerenter", onEnter);
          el.removeEventListener("pointerleave", onLeave);
        }
        gl.canvas.removeEventListener("webglcontextlost", onContextLost);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        gl.canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, [type, scale, speed, morphEvent, interactive]);

  return (
    <div
      ref={ref}
      aria-hidden
      {...(interactive ? { "data-cursor-big": "" } : {})}
      style={{ background: FALLBACKS[type] }}
      className={`ink-field relative overflow-hidden ${className ?? ""}`}
    />
  );
}
