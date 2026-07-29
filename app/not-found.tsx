import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell flex min-h-svh flex-col items-start justify-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em]">404</p>
      <h1 className="display-1 mt-4 font-extrabold uppercase leading-[0.95]">
        Nothing here
      </h1>
      <p className="mt-6 max-w-md font-medium leading-relaxed">
        The page moved, never existed, or is still being vibecoded.
      </p>
      <Link
        href="/"
        className="group relative mt-10 inline-flex items-center gap-3 overflow-hidden rounded-full border-2 border-black bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.15em]"
      >
        <span className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-black transition-transform duration-300 ease-out group-hover:scale-y-100" />
        <span className="relative z-10 text-white mix-blend-difference">
          Back home
        </span>
      </Link>
    </main>
  );
}
