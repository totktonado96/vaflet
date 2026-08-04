"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { reducedMotion } from "@/components/case/kit";

/**
 * The door: the kiosk stands in the page, and she stands in the kiosk.
 *
 * Asleep she is a field of ink dots sampled from her own idle frame. Waking
 * her runs two things at once — the dots pull home into a face, and the room
 * negotiates — so the two to five seconds WebRTC needs are the show rather
 * than a spinner. Live, the video starts grey and only takes colour while she
 * is actually speaking: on a page with no colour in it, speech is the colour.
 */

const IDLE_SRC = "/photos/face2me/ren-idle.jpg";
const GAP = 7;

type Phase = "asleep" | "waking" | "live" | "closed" | "over";

type Dot = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

function useDots(canvas: HTMLCanvasElement | null, phase: Phase) {
  const dots = useRef<Dot[]>([]);
  const pull = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let visible = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const build = (img: HTMLImageElement) => {
      const box = canvas.getBoundingClientRect();
      if (!box.width) return;
      canvas.width = box.width * dpr;
      canvas.height = box.height * dpr;

      const off = document.createElement("canvas");
      const cols = Math.floor(box.width / GAP);
      const rows = Math.floor(box.height / GAP);
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      // cover-fit the portrait frame, same as object-cover would
      const scale = Math.max(cols / img.width, rows / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      octx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);
      const px = octx.getImageData(0, 0, cols, rows).data;

      const next: Dot[] = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const lum = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
          // dark pixels carry the drawing; the backdrop is already near-black,
          // so invert and cut the flat field or the whole frame turns solid
          const ink = 1 - lum;
          if (ink < 0.22) continue;
          const hx = x * GAP + GAP / 2;
          const hy = y * GAP + GAP / 2;
          next.push({
            hx,
            hy,
            x: hx + (Math.random() - 0.5) * box.width * 1.4,
            y: hy + (Math.random() - 0.5) * box.height * 1.4,
            vx: 0,
            vy: 0,
            r: 0.6 + ink * (GAP / 2 - 0.5),
          });
        }
      }
      dots.current = next;
    };

    const img = new Image();
    img.src = IDLE_SRC;
    img.onload = () => {
      if (disposed) return;
      build(img);
      if (reducedMotion()) {
        pull.current = 1;
        draw(1);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    const draw = (settle: number) => {
      const box = canvas.getBoundingClientRect();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, box.width, box.height);
      ctx.fillStyle = "#173543";
      for (const d of dots.current) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * (0.55 + 0.45 * settle), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let t = 0;
    const tick = () => {
      raf.current = requestAnimationFrame(tick);
      if (!visible) return;
      t += 0.016;

      const target = pull.current;
      for (const d of dots.current) {
        // asleep the dots drift on their own noise; waking, home wins
        const driftX = Math.sin(t * 0.7 + d.hy * 0.05) * 2.2 * (1 - target);
        const driftY = Math.cos(t * 0.6 + d.hx * 0.05) * 2.2 * (1 - target);
        const k = 0.006 + 0.05 * target;
        d.vx += (d.hx + driftX - d.x) * k;
        d.vy += (d.hy + driftY - d.y) * k;
        d.vx *= 0.86;
        d.vy *= 0.86;
        d.x += d.vx;
        d.y += d.vy;
      }
      draw(target);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: "200px" },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => build(img));
    ro.observe(canvas);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf.current);
      io.disconnect();
      ro.disconnect();
    };
  }, [canvas]);

  useEffect(() => {
    const wanted = phase === "asleep" ? 0.12 : 1;
    if (reducedMotion()) {
      pull.current = wanted;
      return;
    }
    gsap.to(pull, {
      current: wanted,
      duration: phase === "asleep" ? 1.6 : 2.4,
      ease: phase === "asleep" ? "power2.out" : "power2.inOut",
    });
  }, [phase]);
}

function Countdown({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(id);
          onDone();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onDone]);
  const m = Math.floor(left / 60);
  const s = String(left % 60).padStart(2, "0");
  return <span className="tabular-nums">{`${m}:${s}`}</span>;
}

export function Door() {
  const [phase, setPhase] = useState<Phase>("asleep");
  const [seconds, setSeconds] = useState(180);
  const [speaking, setSpeaking] = useState(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const call = useRef<{ destroy: () => void } | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useDots(canvas, phase);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      // the kiosk surfaces from its own material — rise and settle, no wipe
      gsap.from(root.current!.querySelectorAll("[data-rise]"), {
        y: 26,
        autoAlpha: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "power3.out",
      });
    },
    { scope: root },
  );

  const hangUp = useCallback(() => {
    call.current?.destroy();
    call.current = null;
    setSpeaking(false);
    setPhase("over");
  }, []);

  const wake = useCallback(async () => {
    setPhase("waking");
    let url: string;
    let cap = 180;
    try {
      const res = await fetch("/api/reception", { method: "POST" });
      if (!res.ok) throw new Error("closed");
      const data = (await res.json()) as { url: string; seconds?: number };
      url = data.url;
      cap = data.seconds ?? 180;
    } catch {
      setPhase("closed");
      return;
    }

    try {
      const { default: Daily } = await import("@daily-co/daily-js");
      const frame = Daily.createCallObject({
        audioSource: true,
        videoSource: false,
      });
      call.current = frame;

      frame.on("track-started", (ev) => {
        if (!ev?.participant || ev.participant.local) return;
        if (ev.track.kind !== "video" || !video.current) return;
        video.current.srcObject = new MediaStream([ev.track]);
        void video.current.play();
        setSeconds(cap);
        setPhase("live");
      });

      // her own speech is the only thing that puts colour on this page
      frame.on("active-speaker-change", (ev) => {
        setSpeaking(ev?.activeSpeaker?.peerId !== frame.participants().local.session_id);
      });
      frame.on("left-meeting", hangUp);
      frame.on("error", hangUp);

      await frame.join({ url, startAudioOff: false, startVideoOff: true });
    } catch {
      setPhase("closed");
    }
  }, [hangUp]);

  useEffect(() => () => call.current?.destroy(), []);

  const lit = phase === "live";

  return (
    <div ref={root} className="flex flex-col items-center">
      <div className="relative w-full max-w-[26rem]">
        {/* the kiosk: a raised slab, its screen pressed into it */}
        <div data-rise className="f2m-neu p-4 md:p-5">
          <div
            className="f2m-in relative aspect-[3/4] overflow-hidden rounded-[1.1rem]!"
            data-cursor-text={
              phase === "asleep" ? "Wake her" : lit ? "Say something" : undefined
            }
          >
            <canvas
              ref={setCanvas}
              className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
                lit ? "opacity-0" : "opacity-100"
              }`}
            />
            <video
              ref={video}
              playsInline
              autoPlay
              className={`absolute inset-0 h-full w-full rounded-[1.1rem] object-cover transition-[opacity,filter] duration-700 ${
                lit ? "opacity-100" : "opacity-0"
              } ${speaking ? "grayscale-0 contrast-100" : "grayscale contrast-125"}`}
            />

            {/* status chip, floating on the glass like the product's own UI */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <div className="f2m-neu-sm flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold text-[color:var(--f2m-fg)]">
                <span
                  aria-hidden
                  className={`size-2 rounded-full transition-colors duration-300 ${
                    lit
                      ? "bg-[color:var(--f2m-accent)]"
                      : "bg-[color:var(--f2m-muted)]"
                  } ${lit && !speaking ? "animate-pulse" : ""}`}
                />
                <span>
                  {phase === "asleep" && "Front desk — asleep"}
                  {phase === "waking" && "Waking her…"}
                  {phase === "live" && (speaking ? "Speaking" : "Listening…")}
                  {phase === "closed" && "Desk closed"}
                  {phase === "over" && "Shift over"}
                </span>
                {lit && <Countdown seconds={seconds} onDone={hangUp} />}
              </div>
            </div>
          </div>
        </div>

        {/* the stand — extruded from the same material, nothing drawn on top */}
        <div data-rise aria-hidden className="flex flex-col items-center">
          <div className="f2m-neu h-14 w-16 rounded-none! md:h-16" />
          <div className="f2m-neu h-4 w-44 rounded-[9999px]! md:w-52" />
        </div>
      </div>

      <div className="mt-10 flex w-full max-w-[26rem] flex-col items-center gap-5">
        {phase === "asleep" && (
          <button
            type="button"
            onClick={wake}
            data-rise
            className="f2m-btn w-full px-8 py-4 text-sm font-bold text-[color:var(--f2m-ink)]"
          >
            Buzz her in
          </button>
        )}
        {phase === "waking" && (
          <p className="text-sm font-bold text-[color:var(--f2m-muted)]">
            She is putting her face on
          </p>
        )}
        {lit && (
          <button
            type="button"
            onClick={hangUp}
            className="f2m-btn w-full px-8 py-4 text-sm font-bold text-[color:var(--f2m-ink)]"
          >
            End the shift
          </button>
        )}
        {phase === "over" && (
          <button
            type="button"
            onClick={wake}
            className="f2m-btn w-full px-8 py-4 text-sm font-bold text-[color:var(--f2m-ink)]"
          >
            Again
          </button>
        )}
        {phase === "closed" && (
          <p className="text-center text-[15px] font-medium leading-relaxed">
            Nobody is at the desk right now.{" "}
            <a
              href="/contact"
              className="font-bold text-[color:var(--f2m-ink)] underline underline-offset-4"
            >
              Leave it with the founders
            </a>{" "}
            — there is no one else here anyway.
          </p>
        )}

        <p className="max-w-xs text-center text-xs font-medium leading-relaxed text-[color:var(--f2m-muted)]">
          You are talking to an AI. She answers questions and books nothing —
          the one in a lobby does the rest. Three minutes a visit, then she
          hangs up.
        </p>
      </div>
    </div>
  );
}
