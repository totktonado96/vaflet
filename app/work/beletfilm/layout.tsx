import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./beletfilm.css";

/* The case wears Belet Film's own type: Inter, the one family the app is set
   in. Loaded here so the rest of the site never pays for it. */

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--bf-sans",
});

export default function BeletFilmLayout({ children }: { children: ReactNode }) {
  return <div className={inter.variable}>{children}</div>;
}
