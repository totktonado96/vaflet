/**
 * The ↗ glyph as ink, not a codepoint. U+2197 carries an emoji
 * presentation, so phones swap it for the emoji picture; an inline stroke
 * inherits currentColor and the surrounding font size and never does.
 *
 * The default className sizes it to ride along with the text; pass your own
 * to take over sizing/placement entirely (it replaces, not appends).
 */
export default function ArrowNE({
  className = "inline-block size-[0.72em]",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.2 11.8 11.8 4.2M5.4 4.2h6.4v6.4" />
    </svg>
  );
}
