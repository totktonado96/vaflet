"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const LINKS: Array<[string, string]> = [
  ["Work", "#work"],
  ["Services", "#services"],
  ["Founders", "#founders"],
  ["Contact", "/contact"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const href = (target: string) =>
    target.startsWith("#") && pathname !== "/" ? `/${target}` : target;
  const asideRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    };
  }, [open]);

  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const nodes =
      asideRef.current?.querySelectorAll<HTMLElement>("a[href], button");
    if (!nodes?.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="shell flex items-center justify-between py-5 text-white">
          <a
            href="/"
            className="text-xl font-extrabold uppercase tracking-[-0.02em]"
            aria-label="Vaflet LLC — home"
          >
            Vaflet&nbsp;LLC
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map(([label, hash]) => (
              <a
                key={hash}
                href={href(hash)}
                className="relative inline-block text-xs font-bold uppercase tracking-[0.2em] transition-transform duration-300 ease-out hover:-translate-y-1 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
              >
                {label}
              </a>
            ))}
          </nav>
          <button
            ref={triggerRef}
            onClick={() => setOpen(true)}
            className="text-xs font-bold uppercase tracking-[0.2em] md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            Menu
          </button>
        </div>
      </header>

      <button
        aria-hidden={!open}
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[55] cursor-default bg-transparent ${
          open ? "" : "pointer-events-none"
        }`}
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        onKeyDown={trapTab}
        className={`inv fixed inset-y-0 right-0 z-[60] flex w-full max-w-[24rem] flex-col justify-between border-l-2 border-white bg-black px-8 py-7 text-white transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            Menu
          </span>
          <button
            ref={closeBtnRef}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="p-1 text-2xl leading-none"
            tabIndex={open ? 0 : -1}
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          {LINKS.map(([label, hash]) => (
            <a
              key={hash}
              href={href(hash)}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="text-5xl font-extrabold uppercase tracking-[-0.02em] transition-transform duration-300 hover:translate-x-2"
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href="mailto:cuntact@vaflet.agency"
          tabIndex={open ? 0 : -1}
          className="text-sm font-bold uppercase tracking-[0.15em] underline underline-offset-4 hover:bg-white hover:text-black hover:no-underline"
        >
          cuntact@vaflet.agency
        </a>
      </aside>
    </>
  );
}
