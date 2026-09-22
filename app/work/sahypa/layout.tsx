import type { ReactNode } from "react";
import { Manrope, Unbounded } from "next/font/google";
import "./sahypa.css";

/* The case wears the product's own type: Unbounded for the voice of the site,
   Manrope for everything a guest reads at a table. Loaded here so the rest of
   the site never pays for them. */

const display = Unbounded({ subsets: ["latin"], variable: "--sh-display" });
const body = Manrope({ subsets: ["latin"], variable: "--sh-body" });

export default function SahypaLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} ${body.variable}`}>{children}</div>;
}
