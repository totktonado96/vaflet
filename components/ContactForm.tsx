"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "@/components/Magnetic";
import { MAIL_TO } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const INTERESTS = [
  "Website",
  "Web app",
  "Mobile app",
  "AI agent",
  "Automation",
  "Rapid MVP",
  "Brand & motion",
];

const BUDGETS = ["< 10k", "10–25k", "25–50k", "50–100k", "> 100k", "No idea yet"];


/**
 * Toggleable pill. Same mechanic as the archive filters: the ink rises from the
 * floor of the pill and the label rides over it, so picking an answer feels
 * like the same gesture as filtering the work.
 */
function Choice({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-reveal-item
      className={`group/choice relative isolate overflow-hidden rounded-full border-2 border-black px-5 py-2.5 text-base font-bold transition-[color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] md:text-lg ${
        active ? "text-white" : "text-black hover:text-white"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 origin-bottom bg-black transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          active ? "scale-y-100" : "scale-y-0 group-hover/choice:scale-y-100"
        }`}
      />
      {label}
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  error?: string;
}) {
  // the resting rule is faint; focus draws the full-weight line under it
  const shared =
    "peer w-full border-b-2 border-black/25 bg-transparent pb-3 pt-2 text-xl font-light outline-none transition-colors duration-300 placeholder:text-black/40 focus:border-black/25 md:text-2xl";
  return (
    <div data-reveal-item>
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-[0.2em]"
      >
        {label}
      </label>
      <div className="relative mt-3">
        {textarea ? (
          <textarea
            id={id}
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${shared} resize-none`}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={shared}
          />
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-black transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:scale-x-100"
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-bold uppercase tracking-[0.1em]">
          ↑ {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const root = useRef<HTMLDivElement>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const toggle = (tag: string) =>
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  /* Each block of the brief arrives in turn — pills one after another, then the
     questions. The heading above splits in on load, so the form waits its turn
     rather than landing with it. */
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((block, i) => {
        const items = block.querySelectorAll("[data-reveal-item]");
        gsap.from(items.length ? items : [block], {
          y: 22,
          autoAlpha: 0,
          duration: 0.85,
          stagger: 0.055,
          ease: "power3.out",
          // the first block sits under the hero line and follows it in
          delay: i === 0 ? 0.45 : 0,
          scrollTrigger: { trigger: block, start: "top 92%", once: true },
        });
      });
    },
    { scope: root },
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "We need something to call you";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "That email looks off";
    if (!message.trim()) next.message = "Tell us at least one sentence";
    setErrors(next);
    if (Object.keys(next).length) return;

    // straight into our inbox from the server — the visitor's mail app stays shut
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, interests, budget, company }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div ref={root} role="status">
        <p className="text-[clamp(2rem,5vw,4rem)] font-extrabold uppercase leading-[1.05] tracking-[-0.02em]">
          Got it, {name.trim().split(/\s+/)[0]}.
        </p>
        <p className="mt-6 max-w-md text-lg font-light leading-relaxed">
          Your brief is in our inbox. We&apos;ll answer today, at{" "}
          <span className="font-bold">{email}</span> — keep an eye on spam
          the first time.
        </p>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setStatus("idle");
          }}
          className="mt-10 rounded-full border-2 border-black px-7 py-3.5 text-base font-bold transition-colors duration-200 hover:bg-black hover:text-white"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div ref={root}>
      <form onSubmit={submit} noValidate>
        {/* hidden from people; bots fill every field they find */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <fieldset data-reveal>
          <legend
            data-reveal-item
            className="text-xs font-bold uppercase tracking-[0.2em]"
          >
            I&apos;m interested in
          </legend>
          <div className="mt-5 flex flex-wrap gap-3">
            {INTERESTS.map((tag) => (
              <Choice
                key={tag}
                label={tag}
                active={interests.includes(tag)}
                onClick={() => toggle(tag)}
              />
            ))}
          </div>
        </fieldset>

        <div data-reveal className="mt-16 grid max-w-3xl gap-12">
          <Field
            id="name"
            label="Your name"
            value={name}
            onChange={setName}
            error={errors.name}
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />
          <Field
            id="message"
            label="Tell us about your project"
            value={message}
            onChange={setMessage}
            textarea
            error={errors.message}
          />
        </div>

        <fieldset data-reveal className="mt-16">
          <legend
            data-reveal-item
            className="text-xs font-bold uppercase tracking-[0.2em]"
          >
            Project budget (USD)
          </legend>
          <div className="mt-5 flex flex-wrap gap-3">
            {BUDGETS.map((b) => (
              <Choice
                key={b}
                label={b}
                active={budget === b}
                onClick={() => setBudget(budget === b ? null : b)}
              />
            ))}
          </div>
        </fieldset>

        <div data-reveal>
          <Magnetic strength={0.4} className="mt-16 md:mt-20">
            <button
              type="submit"
              data-reveal-item
              disabled={status === "sending"}
              aria-busy={status === "sending"}
              className="group/send relative inline-flex items-center overflow-hidden rounded-full border-2 border-black px-10 py-6 disabled:cursor-wait md:px-14 md:py-7"
            >
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-black transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/send:scale-100"
              />
              {/* Explicit colours per copy — a blend mode would break once the
                  magnetic wrapper applies a transform. */}
              <span className="relative block overflow-hidden text-lg font-extrabold uppercase leading-none tracking-[0.15em] md:text-xl">
                <span className="block text-black transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/send:-translate-y-[130%]">
                  {status === "sending" ? "Sending…" : "Send request"}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 block translate-y-[130%] text-white transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/send:translate-y-0"
                >
                  {status === "sending" ? "Sending…" : "Send request"}
                </span>
              </span>
            </button>
          </Magnetic>

          {status === "error" ? (
            <p
              role="alert"
              className="mt-8 max-w-md text-[15px] font-bold leading-relaxed"
            >
              That didn&apos;t go through on our side. Try again in a minute,
              or write to us at{" "}
              <a
                href={`mailto:${MAIL_TO}`}
                className="underline underline-offset-4 hover:bg-black hover:text-white hover:no-underline"
              >
                {MAIL_TO}
              </a>{" "}
              — your answers are still here.
            </p>
          ) : (
            <p
              data-reveal-item
              className="mt-8 max-w-md text-[15px] font-light leading-relaxed"
            >
              It lands straight in our inbox — nothing opens on your side.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
