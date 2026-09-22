"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "@/components/case/kit";
import { BLUSH, FIRE, INK, LIME } from "./palette";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Screen = {
  src: string;
  alt: string;
  /** a phone is drawn standing up, a desk screen lying down, a slip as paper */
  kind: "phone" | "desk" | "slip";
};

/**
 * One screen on a coloured plate, sized to its kind. The plate is a fixed
 * landscape stage, so a phone and a till can take turns in the same place
 * without the layout jumping.
 */
function OnPlate({ screen, sizes, priority = false }: { screen: Screen; sizes: string; priority?: boolean }) {
  if (screen.kind === "phone") {
    return (
      <div className="relative aspect-[1170/2532] h-[86%] overflow-hidden rounded-[1.1rem] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.45)] md:rounded-[1.6rem]">
        <Image src={screen.src} alt={screen.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  if (screen.kind === "slip") {
    return (
      <div className="relative h-[88%] w-[40%] overflow-hidden rounded-[0.4rem] bg-white shadow-[0_30px_60px_-24px_rgba(0,0,0,0.45)]">
        <Image src={screen.src} alt={screen.alt} fill sizes={sizes} priority={priority} className="object-contain object-top" />
      </div>
    );
  }
  return (
    <div className="relative aspect-[16/10] w-[88%] overflow-hidden rounded-[0.6rem] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.45)] md:rounded-[0.9rem]">
      <Image src={screen.src} alt={screen.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}

export type Product = {
  key: string;
  name: string;
  /** who holds it */
  who: string;
  /** what it runs on */
  where: string;
  line: string;
  plate: string;
  ink: string;
  screen?: Screen;
  /** a product with no screen of its own gets a drawing instead */
  art?: ReactNode;
};

/**
 * The system, one product at a time. Pointing at a row paints the stage in that
 * product's colour — the colours its own front page gives it — and puts its
 * screen up, so the five read as one family and not as five vendors.
 */
export function Ecosystem({ products, line }: { products: Product[]; line: string }) {
  const [on, setOn] = useState(0);
  const current = products[on];

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
      <ol className="flex flex-col" style={{ borderTop: `1px solid ${line}` }}>
        {products.map((p, i) => (
          <li key={p.key} style={{ borderBottom: `1px solid ${line}` }}>
            <button
              type="button"
              onMouseEnter={() => setOn(i)}
              onFocus={() => setOn(i)}
              onClick={() => setOn(i)}
              aria-pressed={on === i}
              className="group grid w-full grid-cols-[2.2rem_1fr] items-baseline gap-x-3 py-5 text-left md:py-6"
            >
              <span
                className="sh-display text-[13px] tabular-nums transition-opacity duration-300"
                style={{ opacity: on === i ? 1 : 0.45 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span
                  className="sh-display flex items-center gap-3 text-[22px] leading-tight transition-opacity duration-300 md:text-[28px]"
                  style={{ opacity: on === i ? 1 : 0.5 }}
                >
                  {/* the product's own colour, the one its plate is painted */}
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-full transition-transform duration-300"
                    style={{
                      backgroundColor: p.plate,
                      boxShadow: `inset 0 0 0 1px ${line}`,
                      transform: on === i ? "scale(1.25)" : "scale(1)",
                    }}
                  />
                  {p.name}
                </span>
                <span className="mt-2 block text-[13px] leading-relaxed opacity-70 md:text-[14px]">
                  {p.who} · {p.where}
                </span>
                {/* phones get the stage inline, under the row it belongs to */}
                <span className="mt-5 block md:hidden">
                  <Stage product={p} sizes="90vw" />
                  <span className="mt-4 block text-[15px] leading-relaxed opacity-85">{p.line}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="hidden md:block">
        <div className="sticky top-[12vh]">
          <div className="relative">
            {products.map((p, i) => (
              <div
                key={p.key}
                aria-hidden={on !== i}
                className="transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  opacity: on === i ? 1 : 0,
                  position: i === 0 ? "relative" : "absolute",
                  inset: i === 0 ? undefined : 0,
                  pointerEvents: on === i ? "auto" : "none",
                }}
              >
                <Stage product={p} sizes="55vw" />
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed opacity-85" aria-live="polite">
            {current.line}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stage({ product, sizes }: { product: Product; sizes: string }) {
  return (
    <span
      className="relative flex aspect-[16/11] w-full items-center justify-center overflow-hidden rounded-[1.25rem] md:rounded-[2rem]"
      style={{ backgroundColor: product.plate, color: product.ink, boxShadow: `inset 0 0 0 1px rgba(19,22,28,0.08)` }}
    >
      <span className="sh-pill absolute left-5 top-5 md:left-7 md:top-7">{product.key}</span>
      {product.screen ? <OnPlate screen={product.screen} sizes={sizes} /> : product.art}
    </span>
  );
}

/** The drawing for the one product nobody looks at: three tiles, as its own front page draws it. */
export function ServerArt() {
  const tile = "grid size-16 place-items-center rounded-[1.1rem] md:size-24 md:rounded-[1.6rem]";
  return (
    <span className="flex items-center gap-4 md:gap-6" aria-hidden>
      <span className={`${tile} -rotate-6`} style={{ backgroundColor: INK, color: "#fff" }}>
        <svg viewBox="0 0 24 24" className="size-7 md:size-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      </span>
      <span className={`${tile} rotate-3`} style={{ backgroundColor: FIRE, color: "#fff" }}>
        <svg viewBox="0 0 24 24" className="size-7 md:size-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 8.8a15 15 0 0 1 4.2-2.6M9.9 4.9A15 15 0 0 1 22 8.8M5 12.6a10 10 0 0 1 3-1.8M16.1 10.9a10 10 0 0 1 2.9 1.7M8.5 16.3a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" />
        </svg>
      </span>
      <span className={`${tile} -rotate-3`} style={{ backgroundColor: LIME, color: "#fff" }}>
        <svg viewBox="0 0 24 24" className="size-7 md:size-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </span>
    </span>
  );
}

export type Step = { title: string; body: string; screen: Screen };

/**
 * One order, walked through the five products it touches. The rail at the top
 * is the one the product's own front page draws; here the scrollbar moves the
 * order along it, and each stop puts up the screen it lands on.
 */
export function OrderPath({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const atRef = useRef(0);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: () => "+=" + window.innerHeight * steps.length * 0.8,
          pin: true,
          onUpdate: (self) => {
            const next = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
            if (next !== atRef.current) {
              atRef.current = next;
              setAt(next);
            }
          },
        });
        // a pin made inside matchMedia is made after the pins below it; put
        // it back in page order, or they measure themselves without its spacer
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
    },
    { scope: root },
  );

  const step = steps[at];

  return (
    <>
      {/* phones and reduced motion: the order read top to bottom */}
      <ol className="flex flex-col gap-14 md:hidden">
        {steps.map((s, i) => (
          <li key={s.title}>
            <p className="sh-display text-[13px] opacity-60">{String(i + 1).padStart(2, "0")}</p>
            <p className="sh-display mt-3 text-[26px] leading-[1.1]">{s.title}</p>
            <p className="mt-4 text-[16px] leading-relaxed opacity-80">{s.body}</p>
            <span
              className="mt-6 flex aspect-[16/11] w-full items-center justify-center overflow-hidden rounded-[1.25rem]"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <OnPlate screen={s.screen} sizes="90vw" />
            </span>
          </li>
        ))}
      </ol>

      <div ref={root} className="hidden h-screen flex-col justify-center gap-10 md:flex">
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {/* the dashed road between the stops, filled as far as the order has come */}
          <span
            aria-hidden
            className="absolute left-[10%] right-[10%] top-[1.25rem] border-t-2 border-dashed"
            style={{ borderColor: "rgba(255,255,255,0.22)" }}
          />
          <span
            aria-hidden
            className="absolute left-[10%] top-[1.25rem] h-[2px] origin-left transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              right: "10%",
              backgroundColor: FIRE,
              transform: `scaleX(${steps.length > 1 ? at / (steps.length - 1) : 1})`,
            }}
          />
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => {
                atRef.current = i;
                setAt(i);
              }}
              className="relative flex flex-col items-center gap-3 text-center"
            >
              <span
                className="sh-display grid size-10 place-items-center rounded-full text-[13px] transition-[background-color,color,transform] duration-500"
                style={{
                  backgroundColor: i <= at ? FIRE : "#1f232b",
                  color: "#fff",
                  transform: i === at ? "scale(1.18)" : "scale(1)",
                }}
              >
                {i + 1}
              </span>
              <span
                className="max-w-[16ch] text-[13px] font-bold leading-snug transition-opacity duration-500"
                style={{ opacity: i === at ? 1 : 0.5 }}
              >
                {s.title}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-14">
          <div className="relative min-h-[14rem]">
            {steps.map((s, i) => (
              <div
                key={s.title}
                aria-hidden={i !== at}
                className="absolute inset-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ opacity: i === at ? 1 : 0, transform: i === at ? "none" : "translateY(14px)" }}
              >
                <p className="sh-display text-[13px] opacity-60">
                  {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                </p>
                <p className="sh-display mt-4 max-w-[14ch] text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.08]">{s.title}</p>
                <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed opacity-80">{s.body}</p>
              </div>
            ))}
          </div>
          <div
            className="relative flex aspect-[16/11] max-h-[62vh] w-full items-center justify-center overflow-hidden rounded-[2rem]"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            {steps.map((s, i) => (
              <div
                key={s.screen.src}
                aria-hidden={i !== at}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                style={{ opacity: i === at ? 1 : 0 }}
              >
                <OnPlate screen={s.screen} sizes="55vw" />
              </div>
            ))}
            <span className="sr-only" aria-live="polite">
              {step.title}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * The room with the line to the cloud cut. The floor keeps taking orders and
 * printing them against the restaurant's own server; what the cloud has not
 * heard about piles up, and goes up by itself once the line is back. A drawing
 * of the behaviour — the counts are the drawing's own.
 */
export function OfflineSwitch() {
  const [online, setOnline] = useState(true);
  const [taken, setTaken] = useState(0);
  const [waiting, setWaiting] = useState(0);
  const [motion, setMotion] = useState(false);

  useEffect(() => setMotion(!reducedMotion()), []);

  // the floor works the same either way; only where it ends up differs
  useEffect(() => {
    const id = window.setInterval(() => {
      setTaken((n) => n + 1);
      if (!online) setWaiting((n) => Math.min(n + 1, 99));
    }, 1400);
    return () => window.clearInterval(id);
  }, [online]);

  // back online: what piled up goes up, in order, without anybody pressing anything
  useEffect(() => {
    if (!online || waiting === 0) return;
    const id = window.setTimeout(() => setWaiting((n) => Math.max(0, n - 1)), 160);
    return () => window.clearTimeout(id);
  }, [online, waiting]);

  const status = !online
    ? "Internet’s down — still running"
    : waiting > 0
      ? `Catching up — ${waiting} to go`
      : "Everything is in the cloud";

  const room = [
    { id: "till", x: 140, label: "Till" },
    { id: "phones", x: 380, label: "Waiters’ phones" },
    { id: "kitchen", x: 620, label: "Kitchen printer" },
    { id: "bar", x: 860, label: "Bar printer" },
  ];
  const SERVER = { x: 500, y: 250 };
  const CLOUD = { x: 500, y: 60 };
  const ROOM_Y = 440;
  const cut = !online;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span
          className="inline-flex items-center gap-3 rounded-full px-4 py-2 text-[14px] font-bold transition-colors duration-500"
          style={{ backgroundColor: cut ? LIME : "#fff", color: cut ? "#fff" : INK }}
          aria-live="polite"
        >
          <span
            aria-hidden
            className="size-2.5 rounded-full"
            style={{ backgroundColor: cut ? "#fff" : waiting > 0 ? FIRE : LIME }}
          />
          {status}
        </span>
        <button
          type="button"
          onClick={() => setOnline((v) => !v)}
          className="rounded-full px-6 py-3 text-[15px] font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
          style={{ backgroundColor: cut ? INK : FIRE }}
        >
          {cut ? "Plug the internet back in" : "Pull the internet cable"}
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.25rem] bg-white md:rounded-[2rem]">
        <svg viewBox="0 0 1000 520" className="block h-auto w-full" role="img" aria-label="The cloud above, the restaurant's server in the middle, and the till, waiters' phones and two printers wired to the server">
          {/* the internet: the one line a storm or a provider can cut */}
          <line
            x1={CLOUD.x}
            y1={CLOUD.y + 34}
            x2={SERVER.x}
            y2={SERVER.y - 40}
            stroke={cut ? FIRE : INK}
            strokeWidth="3"
            strokeDasharray={cut ? "6 10" : undefined}
            style={{ transition: "stroke 0.4s" }}
          />
          {cut && (
            <g transform={`translate(${CLOUD.x} ${(CLOUD.y + SERVER.y) / 2 - 3})`}>
              <circle r="17" fill={FIRE} />
              <path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}
          {/* the room's own network */}
          {room.map((d) => (
            <path
              key={d.id}
              id={`sh-wire-${d.id}`}
              d={`M${SERVER.x} ${SERVER.y + 40} C ${SERVER.x} ${SERVER.y + 110}, ${d.x} ${ROOM_Y - 110}, ${d.x} ${ROOM_Y - 34}`}
              fill="none"
              stroke={INK}
              strokeOpacity="0.28"
              strokeWidth="2"
            />
          ))}
          {/* orders moving on the floor, line or no line */}
          {motion &&
            room.map((d, i) => (
              <circle key={d.id} r="6" fill={FIRE}>
                <animateMotion dur={`${2.2 + i * 0.35}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} keyPoints={d.id === "phones" || d.id === "till" ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear">
                  <mpath href={`#sh-wire-${d.id}`} />
                </animateMotion>
              </circle>
            ))}
          {/* what piled up, going up once the line is back */}
          {motion && online && waiting > 0 && (
            <circle r="7" fill={LIME}>
              <animateMotion dur="0.5s" repeatCount="indefinite" path={`M${SERVER.x} ${SERVER.y - 40} L${CLOUD.x} ${CLOUD.y + 34}`} />
            </circle>
          )}

          <g transform={`translate(${CLOUD.x} ${CLOUD.y})`}>
            <rect x="-120" y="-34" width="240" height="68" rx="34" fill={cut ? "#EDE7E1" : INK} style={{ transition: "fill 0.4s" }} />
            <text textAnchor="middle" y="-2" fontSize="19" fontWeight="800" fill={cut ? "#8A8580" : "#fff"} fontFamily="var(--sh-display)">
              sahypa cloud
            </text>
            <text textAnchor="middle" y="20" fontSize="13" fill={cut ? "#8A8580" : "rgba(255,255,255,0.7)"}>
              panel · directory · backups
            </text>
          </g>

          <g transform={`translate(${SERVER.x} ${SERVER.y})`}>
            <rect x="-150" y="-40" width="300" height="80" rx="22" fill={FIRE} />
            <text textAnchor="middle" y="-4" fontSize="20" fontWeight="800" fill="#fff" fontFamily="var(--sh-display)">
              Restaurant server
            </text>
            <text textAnchor="middle" y="20" fontSize="13" fill="rgba(255,255,255,0.85)">
              orders · till · printing · menu
            </text>
          </g>
          {cut && waiting > 0 && (
            <g transform={`translate(${SERVER.x + 150} ${SERVER.y - 40})`}>
              <circle r="20" fill={INK} />
              <text textAnchor="middle" y="6" fontSize="16" fontWeight="800" fill="#fff">
                {waiting}
              </text>
            </g>
          )}

          {room.map((d) => (
            <g key={d.id} transform={`translate(${d.x} ${ROOM_Y})`}>
              <rect x="-100" y="-34" width="200" height="68" rx="18" fill={BLUSH} />
              <text textAnchor="middle" y="6" fontSize="17" fontWeight="700" fill={INK}>
                {d.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-2 text-[13px] font-bold uppercase tracking-[0.14em] opacity-70">
        <span className="tabular-nums">Orders on the floor: {taken}</span>
        <span className="tabular-nums">Waiting for the cloud: {waiting}</span>
      </div>
    </div>
  );
}
