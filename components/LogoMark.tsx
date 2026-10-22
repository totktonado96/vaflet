"use client";

import { useEffect, useRef } from "react";
import { LIGHT_REST, logoLight } from "@/lib/logo-light";

const VERTEX = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// An engraved sphere: shaded only with lines that thicken away from the light,
// sitting on its own hatched shadow. The light is shared with the wordmark.
// White ink on transparent, so the header's difference blend flips it to
// black over paper and keeps it white over ink.
const FRAGMENT = /* glsl */ `
precision highp float;
uniform float uLight;
uniform vec2 uRes;
varying vec2 vUv;

float fill(float d, float aa) {
  return 1.0 - smoothstep(-aa, aa, d);
}

void main() {
  vec2 c = vUv - 0.5;
  float aa = 1.5 / uRes.y;
  vec2 dir = vec2(cos(uLight), sin(uLight));
  vec2 q = c - vec2(-0.045, 0.05);
  float R = 0.38;
  float r = length(q);
  float inside = fill(r - R, aa);

  // lambert from a light opposite the shadow, a little in front of the paper
  float z = sqrt(max(R * R - dot(q, q), 0.0)) / R;
  float lam = clamp(dot(vec3(q / R, z), normalize(vec3(-dir, 0.75))), 0.0, 1.0);

  // engraving lines wrap the sphere; the dark side gets the fat ones
  float u = q.y / (R * sqrt(max(1.0 - (q.x / R) * (q.x / R), 0.03)));
  float f = abs(fract(u * 5.5 + 0.5) - 0.5) * 2.0;
  float th = mix(1.05, 0.06, pow(lam, 0.8));
  float lines = 1.0 - smoothstep(th - 0.12, th + 0.12, f);
  float rim = inside * (1.0 - fill(r - R + 0.02, aa));

  float ground = fill(length(q - dir * 0.1) - R * 0.97, aa) * smoothstep(0.02, 0.035, r - R);
  float hatch = smoothstep(-0.3, 0.3, sin((c.x - c.y) * 6.2831 / 0.09));

  float k = max(inside * max(lines, rim), ground * hatch);
  gl_FragColor = vec4(vec3(k), k);
}
`;

// Shown until (or instead of) the shader renders
const FALLBACK =
  "repeating-linear-gradient(0deg, #fff 0 9%, transparent 9% 18%)";

export default function LogoMark({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let disposed = false;
    let visible = true;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { Renderer, Program, Mesh, Triangle } = await import("ogl");
      if (disposed || !ref.current) return;

      const renderer = new Renderer({
        dpr: Math.min(3, window.devicePixelRatio || 1),
        alpha: true,
        premultipliedAlpha: true,
      });
      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      el.appendChild(gl.canvas);

      const program = new Program(gl, {
        vertex: VERTEX,
        fragment: FRAGMENT,
        uniforms: {
          uLight: { value: LIGHT_REST },
          uRes: { value: [1, 1] },
        },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const draw = () => renderer.render({ scene: mesh });
      const resize = () => {
        renderer.setSize(el.clientWidth, el.clientHeight);
        program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
        if (still) draw();
      };
      resize();
      el.style.background = "none";
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(el);

      const onContextLost = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(raf);
        gl.canvas.remove();
        el.style.background = FALLBACK;
      };
      gl.canvas.addEventListener("webglcontextlost", onContextLost);

      // the wordmark binds the hover handoff; the mark only reads the light
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        program.uniforms.uLight.value = logoLight(now);
        draw();
      };
      if (!still) raf = requestAnimationFrame(loop);

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
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      style={{ background: FALLBACK, borderRadius: "50%" }}
      className={`relative block overflow-hidden ${className ?? ""}`}
    />
  );
}
