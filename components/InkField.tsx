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

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  float t = uTime * uSpeed;
  float n = fbm(uv * uScale + vec2(t * 0.15, t * 0.1));
  vec2 c = uv - vec2(0.5 * uRes.x / uRes.y, 0.5);
  float field;
  if (uType < 0.5) {
    // flowing diagonal strata
    field = sin((uv.x + uv.y) * 18.0 + n * 12.0 + t);
  } else if (uType < 1.5) {
    // concentric ripples
    field = sin(length(c) * 44.0 - t * 2.0 + n * 9.0);
  } else if (uType < 2.5) {
    // organic cell blobs
    field = sin(n * 22.0 + t * 1.4);
  } else if (uType < 3.5) {
    // interference of two rotating wave sets — moire
    float a = sin(uv.x * 34.0 + n * 5.0 + t);
    float b = sin((uv.x * 0.4 + uv.y) * 30.0 - t * 1.3 + n * 4.0);
    field = a * b;
  } else if (uType < 4.5) {
    // warped crosshatch grid
    vec2 w = uv * 22.0 + vec2(n * 6.0, n * 6.0) + t * 0.6;
    field = sin(w.x) * sin(w.y) + n - 0.5;
  } else {
    // radial spokes twisting over time
    float ang = atan(c.y, c.x);
    field = sin(ang * 9.0 + length(c) * 12.0 - t * 1.6 + n * 7.0);
  }
  float v = smoothstep(-0.06, 0.06, field);
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
];

export default function InkField({
  type = 0,
  scale = 3,
  speed = 0.6,
  className,
}: {
  /** 0 strata · 1 ripples · 2 cells · 3 moire · 4 crosshatch · 5 spokes */
  type?: 0 | 1 | 2 | 3 | 4 | 5;
  scale?: number;
  speed?: number;
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

      const t0 = performance.now();
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        program.uniforms.uTime.value = (now - t0) / 1000;
        renderer.render({ scene: mesh });
      };
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        ro.disconnect();
        io.disconnect();
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
  }, [type, scale, speed]);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ background: FALLBACKS[type] }}
      className={`ink-field relative overflow-hidden ${className ?? ""}`}
    />
  );
}
