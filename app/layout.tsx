import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import Effects from "@/components/Effects";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { SITE_URL } from "@/lib/site";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
});

const TITLE = "Vaflet LLC — Design. Code. AI. End-to-end.";
const DESCRIPTION =
  "Vaflet LLC is a two-founder digital studio in New Jersey. Websites, mobile apps, AI agents and automation — designed, built and shipped by the same people you talk to.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Vaflet LLC",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={schibsted.variable}>
      <body className="font-sans antialiased">
        <noscript>
          <style>{`.pre-reveal{visibility:visible}`}</style>
        </noscript>
        <Effects />
        <Header />
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
