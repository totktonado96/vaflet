"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { reducedMotion } from "@/components/case/kit";

/**
 * The door: an intercom panel pressed flush into the page, running off the
 * right edge of the frame — the page is the lobby wall, not a product shot.
 *
 * On the wall beside it sits a round doorbell. Ring it and the dots on the
 * dark glass pull home into her face, so the two to five seconds WebRTC
 * needs are the show rather than a spinner. Live, the video starts grey and
 * only takes colour while she is actually speaking: on a page with no colour
 * in it, speech is the colour. Hang up and the glass goes back to her shift
 * log — she returns to work.
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
      // client sizes, not getBoundingClientRect — transformed ancestors would
      // hand us a projected rect and squish the dot grid
      const box = { width: canvas.clientWidth, height: canvas.clientHeight };
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

      // contain-fit: the panel is wide, the portrait is not — keep her whole
      // face on the glass and let the sides stay dark, like an intercom camera
      const scale = Math.min(cols / img.width, rows / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      octx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);
      const px = octx.getImageData(0, 0, cols, rows).data;

      const next: Dot[] = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const lum = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
          // light carries the drawing — she reads as glow on dark glass, and
          // the near-black backdrop of her idle frame falls away on its own
          if (lum < 0.25) continue;
          const hx = x * GAP + GAP / 2;
          const hy = y * GAP + GAP / 2;
          next.push({
            hx,
            hy,
            x: hx + (Math.random() - 0.5) * box.width * 1.4,
            y: hy + (Math.random() - 0.5) * box.height * 1.4,
            vx: 0,
            vy: 0,
            r: 0.6 + lum * (GAP / 2 - 0.5),
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.fillStyle = "#d9e2ec";
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
    // at the desk she stays loose and drifting; called over, she assembles
    const wanted = phase === "waking" || phase === "live" ? 1 : 0.12;
    if (reducedMotion()) {
      pull.current = wanted;
      return;
    }
    gsap.to(pull, {
      current: wanted,
      duration: wanted === 1 ? 2.4 : 1.6,
      ease: wanted === 1 ? "power2.inOut" : "power2.out",
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

function DeskClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now}</span>;
}

/* Her morning so far — the job as it actually goes, one line at a time. */
const LOG = [
  "checked in a party of two",
  "switched to Spanish mid-sentence",
  "took a payment, printed nothing",
  "paged a human for an edge case",
  "same question, fourth time — still polite",
  "pointed the courier to the loading door",
  "greeted a regular by name",
  "booked nothing. not her job",
];

function DeskLog({ on }: { on: boolean }) {
  const [head, setHead] = useState(3);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setHead((h) => h + 1), 3400);
    return () => clearInterval(id);
  }, [on]);
  const rows = Array.from({ length: 4 }, (_, i) => {
    const idx = head - 3 + i;
    return { key: idx, text: LOG[((idx % LOG.length) + LOG.length) % LOG.length] };
  });
  return (
    <ul className="flex flex-col gap-1.5 font-mono text-[10px] font-medium leading-snug text-[#c3d0dd]">
      {rows.map((row, i) => (
        <li
          key={row.key}
          className="f2m-log-line flex items-baseline gap-2"
          style={{ opacity: 0.25 + i * 0.25 }}
        >
          <span
            aria-hidden
            className="size-1 shrink-0 translate-y-[-1px] rounded-full bg-[#6d8496]"
          />
          {row.text}
        </li>
      ))}
    </ul>
  );
}

function Bell({
  onRing,
  live,
  rang,
  disabled,
}: {
  onRing: () => void;
  live: boolean;
  rang: number;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label="Ring the front desk bell"
      onClick={onRing}
      disabled={disabled}
      data-cursor-text="Ding"
      className="f2m-neu relative grid size-24 shrink-0 place-items-center rounded-full! transition-transform duration-150 active:scale-[0.93] active:shadow-[inset_5px_5px_12px_var(--f2m-lo),inset_-5px_-5px_12px_var(--f2m-hi)] disabled:cursor-default disabled:active:scale-100"
    >
      <span className="f2m-in grid size-12 place-items-center rounded-full!">
        <span
          aria-hidden
          className={`size-3.5 rounded-full transition-colors duration-300 ${
            live ? "bg-[color:var(--f2m-accent)]" : "bg-[color:var(--f2m-muted)]"
          }`}
        />
      </span>
      {rang > 0 && (
        <span
          key={rang}
          aria-hidden
          className="f2m-ding pointer-events-none absolute inset-0 rounded-full border-2 border-[color:var(--f2m-accent)]"
        />
      )}
    </button>
  );
}

export function Door() {
  const [phase, setPhase] = useState<Phase>("asleep");
  const [seconds, setSeconds] = useState(180);
  const [speaking, setSpeaking] = useState(false);
  const [rang, setRang] = useState(0);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const call = useRef<{ destroy: () => void } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const busy = useRef(false); // a session is opening or open

  useDots(canvas, phase);

  const atDesk = phase === "asleep" || phase === "over";
  const lit = phase === "live";

  useGSAP(
    () => {
      if (reducedMotion()) return;
      // the wall furniture surfaces from its own material — rise, no wipe
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
    busy.current = false;
    setSpeaking(false);
    setPhase("over");
  }, []);

  const wake = useCallback(async () => {
    // a second ring while she is already coming over must not open two calls
    if (busy.current) return;
    busy.current = true;
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
      busy.current = false;
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
      busy.current = false;
      setPhase("closed");
    }
  }, [hangUp]);

  const ring = useCallback(() => {
    if (busy.current) return;
    setRang((n) => n + 1);
    void wake();
  }, [wake]);

  useEffect(() => () => call.current?.destroy(), []);

  return (
    <div ref={root}>
      <div className="flex items-center gap-6 md:gap-8">
        {/* the doorbell on the wall, beside the panel */}
        <div data-rise className="hidden shrink-0 flex-col items-center gap-4 md:flex">
          <Bell onRing={ring} live={lit} rang={rang} disabled={!atDesk} />
          <p className="text-xs font-bold text-[color:var(--f2m-muted)]">
            {phase === "over" ? "Ring again" : "Ring the bell"}
          </p>
        </div>

        {/* the intercom panel — pressed into the wall, running off the frame */}
        <div
          data-rise
          className="f2m-in -mx-5 grow rounded-none! p-3 md:mx-0 md:rounded-l-[2rem]! md:mr-[calc(-1*max(2.5rem,(100vw-100rem)/2))] md:p-4 md:pr-0"
        >
          <div
            className="relative h-[min(66vh,40rem)] overflow-hidden rounded-[1.2rem] bg-[color:var(--f2m-ink)] shadow-[inset_0_6px_28px_rgba(0,0,0,0.55)] md:rounded-r-none"
            onClick={atDesk ? ring : undefined}
            data-cursor-text={atDesk ? "Ring the bell" : lit ? "Say something" : undefined}
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
              className={`absolute inset-0 h-full w-full object-contain transition-[opacity,filter] duration-700 ${
                lit ? "opacity-100" : "opacity-0"
              } ${speaking ? "grayscale-0 contrast-100" : "grayscale contrast-125"}`}
            />

            {/* glass vignette so her screen text sits legibly on the dots */}
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(23,53,67,0.9),transparent_24%,transparent_68%,rgba(23,53,67,0.92))] transition-opacity duration-700 ${
                lit ? "opacity-0" : "opacity-100"
              }`}
            />

            {/* her duty screen — what you see over her shoulder */}
            <div
              className={`pointer-events-none absolute inset-0 flex flex-col justify-between p-5 pb-16 transition-opacity duration-700 ${
                atDesk ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#93a7b8]">
                <span>Ren — on shift</span>
                <DeskClock />
              </div>
              <DeskLog on={atDesk} />
            </div>

            {/* nobody home: the glass says so itself */}
            {phase === "closed" && (
              <div className="absolute inset-0 grid place-items-center p-8">
                <p className="max-w-sm text-center text-[15px] font-medium leading-relaxed text-[#c3d0dd]">
                  Nobody is at the desk right now.{" "}
                  <a
                    href="/contact"
                    className="font-bold text-[#eef3f8] underline underline-offset-4"
                  >
                    Leave it with the founders
                  </a>{" "}
                  — there is no one else here anyway.
                </p>
              </div>
            )}

            {/* the product's own UI floats on the glass */}
            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
              {phase !== "closed" && (
                <div className="flex items-center gap-2.5 rounded-full bg-[color:var(--f2m-bg)] px-4 py-2 text-xs font-bold text-[color:var(--f2m-fg)] shadow-[0_8px_22px_rgba(0,0,0,0.4)]">
                  <span
                    aria-hidden
                    className={`size-2 rounded-full transition-colors duration-300 ${
                      lit
                        ? "bg-[color:var(--f2m-accent)]"
                        : "bg-[color:var(--f2m-muted)]"
                    } ${lit && !speaking ? "animate-pulse" : ""}`}
                  />
                  <span>
                    {phase === "asleep" && "With a visitor"}
                    {phase === "waking" && "She heard the bell…"}
                    {phase === "live" && (speaking ? "Speaking" : "Listening…")}
                    {phase === "over" && "Back to work"}
                  </span>
                  {lit && <Countdown seconds={seconds} onDone={hangUp} />}
                </div>
              )}
              {lit && (
                <button
                  type="button"
                  onClick={hangUp}
                  className="rounded-full bg-[color:var(--f2m-bg)] px-4 py-2 text-xs font-bold text-[color:var(--f2m-ink)] shadow-[0_8px_22px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:scale-[1.04] active:scale-95"
                >
                  End the shift
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* the doorbell moves under the panel on a phone, like a real intercom */}
      <div data-rise className="mt-6 flex flex-col items-center gap-3 md:hidden">
        <Bell onRing={ring} live={lit} rang={rang} disabled={!atDesk} />
        <p className="text-xs font-bold text-[color:var(--f2m-muted)]">
          {phase === "over" ? "Ring again" : "Ring the bell"}
        </p>
      </div>

      <p className="mt-6 max-w-md text-xs font-medium leading-relaxed text-[color:var(--f2m-muted)]">
        You are talking to an AI. She answers questions and books nothing — the
        one in a lobby does the rest. Three minutes a visit, then she hangs up.
      </p>
    </div>
  );
}
