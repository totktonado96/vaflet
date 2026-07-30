import Image from "next/image";
import InkField from "@/components/InkField";
import SplitReveal from "@/components/SplitReveal";

// Real founders. Roles and one-liners are still ours to confirm.
// TODO: swap the LinkedIn/Telegram placeholders for the real handles.
const FOUNDERS = [
  {
    initials: "TH",
    name: "Tim Hunt",
    role: "Co-founder — Engineer & AI Alchemist",
    line: "Builds the whole thing himself, then argues with his AI about who did it better.",
    whisper: "Talks to computers.",
    type: 1 as const,
    photo: "/photos/tim.jpg",
    photoPosition: "object-[50%_60%]",
    email: "tim@vaflet.com",
    linkedin: "https://www.linkedin.com/in/tim-vaflet",
    telegram: "https://t.me/tim_vaflet",
  },
  {
    initials: "BK",
    name: "Baha Kabulov",
    role: "Co-founder — Design & Product",
    line: "Physically hurts when an interface is ugly. Deletes one more thing after you say it's perfect.",
    whisper: "Talks to humans.",
    type: 2 as const,
    photo: "/photos/baha.jpg",
    photoPosition: "object-[50%_35%]",
    email: "baha@vaflet.com",
    linkedin: "https://www.linkedin.com/in/baha-vaflet",
    telegram: "https://t.me/baha_vaflet",
  },
];

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px] fill-current" aria-hidden>
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px] fill-current" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px] fill-current" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export default function Founders() {
  return (
    <section id="founders" tabIndex={-1} className="shell pb-28 md:pb-40">
      <SplitReveal className="display-2 mb-12 font-extrabold uppercase leading-[1.0] md:mb-16">
        Two founders, zero managers
      </SplitReveal>
      <div className="grid gap-10 md:grid-cols-2">
        {FOUNDERS.map((f) => (
          <div
            key={f.name}
            className="group rounded-[1.5rem] border-2 border-black p-6 md:rounded-[2rem] md:p-8"
          >
            <div
              className="relative aspect-[3/2] overflow-hidden rounded-[1rem] md:rounded-[1.25rem]"
              data-cursor-text={f.whisper}
            >
              {f.photo ? (
                <Image
                  src={f.photo}
                  alt={f.name}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className={`object-cover ${f.photoPosition ?? ""}`}
                />
              ) : (
                <>
                  <InkField
                    type={f.type}
                    scale={2.4}
                    speed={0.4}
                    className="h-full w-full"
                  />
                  {/* Initials only stand in while there is no portrait yet */}
                  <span className="absolute bottom-4 left-5 text-5xl font-extrabold uppercase text-white mix-blend-difference md:text-6xl">
                    {f.initials}
                  </span>
                </>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between gap-4">
              <h3 className="text-2xl font-extrabold uppercase tracking-[-0.02em] md:text-3xl">
                {f.name}
              </h3>
              <div className="flex gap-4">
                <a
                  href={`mailto:${f.email}`}
                  aria-label={`Email ${f.name}`}
                  title={f.email}
                  className="transition-transform duration-300 ease-out hover:-translate-y-1"
                >
                  <MailIcon />
                </a>
                <a
                  href={f.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${f.name} on LinkedIn`}
                  className="transition-transform duration-300 ease-out hover:-translate-y-1"
                >
                  <LinkedInIcon />
                </a>
                <a
                  href={f.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${f.name} on Telegram`}
                  className="transition-transform duration-300 ease-out hover:-translate-y-1"
                >
                  <TelegramIcon />
                </a>
              </div>
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em]">
              {f.role}
            </p>
            <p className="mt-4 max-w-md font-medium leading-relaxed">
              {f.line}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-14 max-w-md text-[15px] font-medium leading-relaxed">
        That&apos;s the whole org chart, by the way. The one answering your
        messages is the one building your product.
      </p>
    </section>
  );
}
