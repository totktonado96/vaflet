import { PROJECTS } from "@/lib/projects";

export type SeoGroup = { title: string; links: { href: string; label: string }[] };

/**
 * Index of every crawlable page. Add SEO landing pages here as they ship —
 * the footer list and the sitemap both read from this file.
 */
export const SEO_GROUPS: SeoGroup[] = [
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/#services", label: "Services" },
      { href: "/#work", label: "Selected work" },
      { href: "/work", label: "All work" },
      { href: "/#founders", label: "Founders" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Case studies",
    links: PROJECTS.map((p) => ({
      href: `/work/${p.slug}`,
      label: p.title,
    })),
  },
];
