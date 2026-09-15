import type { ReactNode } from "react";
import { Manrope, Unbounded } from "next/font/google";
import "./masynbazar.css";

/* The case wears the dealer's own type: Unbounded for what is said, Manrope
   for what explains it. Loaded here so the rest of the site never pays for
   them; both are variable, so every weight comes from one file. */

const display = Unbounded({ subsets: ["latin"], variable: "--mb-display" });
const body = Manrope({ subsets: ["latin"], variable: "--mb-body" });

export default function MasynbazarLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} ${body.variable}`}>{children}</div>;
}
