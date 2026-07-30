import Magnetic from "@/components/Magnetic";

/**
 * Outlined pill CTA: ink floods out of the centre, the label rolls up while its
 * twin rolls in, the arrow flies out top-right and re-enters bottom-left.
 * The label rides on mix-blend-difference, so it flips itself against both the
 * surface and the flood — only the border and the ink follow `surface`.
 *
 * The pill paints its own opaque background and isolates itself: difference
 * needs a backdrop to invert against, and a transparent one always resolves to
 * white — invisible the moment the surface underneath is white.
 */
export default function CtaButton({
  href,
  label,
  surface = "black",
  className,
}: {
  href: string;
  label: string;
  /** the colour the pill sits on */
  surface?: "black" | "white";
  className?: string;
}) {
  const onBlack = surface === "black";
  return (
    <Magnetic strength={0.4} className={className}>
      <a
        href={href}
        className={`group/cta relative isolate inline-flex items-center gap-4 overflow-hidden rounded-full border-2 px-10 py-6 md:px-14 md:py-7 ${
          onBlack ? "border-white bg-black" : "border-black bg-white"
        }`}
      >
        {/* ink blot flooding out from the centre */}
        <span
          aria-hidden
          className={`absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:scale-100 ${
            onBlack ? "bg-white" : "bg-black"
          }`}
        />
        {/* label rolls up, its twin rolls in from below */}
        <span className="relative block overflow-hidden text-lg font-extrabold uppercase leading-none tracking-[0.15em] text-white mix-blend-difference md:text-xl">
          <span className="block transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:-translate-y-[120%]">
            {label}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 block translate-y-[120%] transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-y-0"
          >
            {label}
          </span>
        </span>
        {/* arrow flies out top-right and re-enters from bottom-left */}
        <span
          aria-hidden
          className="relative block size-6 overflow-hidden text-xl font-bold leading-none text-white mix-blend-difference"
        >
          <span className="block transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-full group-hover/cta:-translate-y-full">
            ↗
          </span>
          <span className="absolute inset-0 block -translate-x-full translate-y-full transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-0 group-hover/cta:translate-y-0">
            ↗
          </span>
        </span>
      </a>
    </Magnetic>
  );
}
