"use client";

import { useState } from "react";
import type { SeoGroup } from "@/lib/seo-pages";

/**
 * Collapsed index of every page. The links stay in the DOM while closed, so
 * crawlers read them even though the panel is clipped shut.
 */
export default function SeoIndex({ groups }: { groups: SeoGroup[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="-mx-4 mt-10 border-t-2 border-white pt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="seo-index"
        className="group/seo flex w-full items-center justify-between gap-6 px-4 py-1 text-left transition-colors duration-200 hover:bg-white hover:text-black"
      >
        <span className="truncate text-[13px] font-light leading-tight">
          We do our own SEO — the pages below are for robots
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-base font-bold leading-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "rotate-45" : "group-hover/seo:rotate-90"
          }`}
        >
          +
        </span>
      </button>

      <div
        id="seo-index"
        className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid gap-x-16 gap-y-10 px-4 pt-10 sm:grid-cols-2 md:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  {group.title}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        tabIndex={open ? 0 : -1}
                        className="text-[15px] font-light underline-offset-4 hover:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
