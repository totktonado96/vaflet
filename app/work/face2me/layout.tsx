import type { ReactNode } from "react";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";

/* The case wears face2.me's own type, not the site's: Jakarta for display,
   DM Sans for everything that talks. Loaded here so the rest of the site
   never pays for them. */

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--f2m-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--f2m-body",
});

export default function Face2meLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable}`}>{children}</div>
  );
}
