const WORDS = ["Design", "Code", "AI agents", "Automation", "Branding", "MVPs"];

export default function Marquee() {
  const half = (
    <div className="flex shrink-0 items-center">
      {WORDS.map((word, i) => (
        <span
          key={word}
          className="display-2 flex items-center font-extrabold uppercase"
        >
          {i % 2 === 1 ? (
            <span className="rounded-full bg-black px-[0.4em] pb-[0.1em] leading-[1.25] text-white">
              {word}
            </span>
          ) : (
            <span>{word}</span>
          )}
          <span className="mx-8 text-[0.35em]">✕</span>
        </span>
      ))}
    </div>
  );

  return (
    <section
      aria-hidden
      className="overflow-hidden whitespace-nowrap border-y-2 border-black py-5 md:py-7"
    >
      <div
        className="marquee-track inline-flex"
        style={{ animationDuration: "26s" }}
      >
        {half}
        {half}
      </div>
    </section>
  );
}
