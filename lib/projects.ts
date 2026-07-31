// MOCK DATA — swap titles, copy and metrics for real case studies when ready

/**
 * Filter taxonomy for the archive. Deliberately coarse and fixed: `tags` is
 * free prose for the eye, this is what the filter bar counts on. Order here is
 * the order they are shown in.
 */
export const DISCIPLINES = [
  "Web",
  "Mobile",
  "AI",
  "Design",
  "Automation",
  "Open source",
] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export type Project = {
  slug: string;
  title: string;
  desc: string;
  services: string;
  stack: string;
  brief: string;
  did: string[];
  outcome: string[];
  tags: string[];
  disciplines: Discipline[];
  /** frame shape in the grid */
  ratio: "square" | "portrait" | "landscape" | "wide";
  /** Real product shots only. Without them the frames fall back to the ink
      field — an honest pattern beats a stock photo standing in for a screen. */
  photo?: string;
  photoDetail?: string;
  /** Frame image for the archive row and the home grid. A composed scene reads
      as mud at card size, so the flat shot stands in there. Falls back to photo. */
  cover?: string;
  /** ink-field pattern for a project with no shots yet (see InkField) */
  pattern?: number;
  /** Countable, checkable figures. Never a claim we cannot back. */
  facts?: { value: string; label: string }[];
  /** Has a hand-built page under app/work/<slug> instead of the shared template */
  custom?: boolean;
  /** Product shots that carry the case, each captioned for what it proves */
  gallery?: { src: string; caption: string }[];
  oss?: boolean;
};

export const PROJECTS: Project[] = [
  {
    slug: "masynbazar",
    title: "MashynBazar",
    desc: "Turnkey e-commerce for a Dubai car dealer — a dark showroom landing and a daylight catalogue",
    services: "Product design · Web · Turnkey build",
    stack: "Landing · Catalogue · Search & filters · Multilingual",
    brief:
      "A Dubai dealer sells premium cars abroad, where the buyer never walks the lot. The site has to do both jobs at once: make the car wanted, and make the paperwork side of it feel safe.",
    did: [
      "Designed and built the whole thing turnkey — landing, catalogue, content, launch",
      "Put the showroom in the dark: one car under red light, two ways in",
      "Built the catalogue as a pale grid where the spec sheet leads — engine, drive, power, 0–100, price",
      "Wired finding: search by name or tag, a brand picker and filters across the showroom",
      "Embedded the dealer's YouTube reviews on the page instead of linking away",
      "Shipped it multilingual, with the language toggle in the header",
    ],
    outcome: [
      "One shop with two surfaces that never look like two different companies",
      "Every car carries its own spec sheet, so the buyer compares without asking",
      "Live at masynbazar.com",
    ],
    custom: true,
    tags: ["E-commerce", "Web", "Turnkey"],
    disciplines: ["Web", "Design"],
    ratio: "wide",
    photo: "/photos/masynbazar/hero-v2.jpg",
    cover: "/photos/masynbazar/hero-v2.jpg",
  },
  {
    slug: "mirai",
    title: "Mirai",
    desc: "Brand identity for a smart-home company — mark, system and the book that holds it together",
    services: "Brand identity · Guidelines · Website · Interactive brandbook",
    stack: "Logo system · Colour · Gradients · Type · Pattern",
    brief:
      "A smart-home company needed an identity that survives contact with reality: a product box, a delivery van, a phone screen, a letter to a partner. Mirai means future in Japanese, and the mark had to carry that without shouting it.",
    did: [
      "Built the mark from one geometric frame — four lockups, clear space measured by the symbol itself",
      "Set a palette of eight, with only two combinations allowed to lead",
      "Cut four official gradients, two light and two dark, with rules for cropping them",
      "Derived the pattern from the symbol so the system repeats itself all the way down",
      "Paired NexaText for screen with Merriweather for print on one shared hierarchy",
      "Applied it: business cards, letterhead, tape, shipping and product boxes, uniform, social templates",
      "Built the website on top of the system, and turned the book itself into an interactive brandbook on the web",
    ],
    outcome: [
      "A 39-page brand book a designer, a marketer or a factory can act on without asking",
      "Every asset delivered in vector and raster, colour and mono, light and dark",
      "One identity that reads the same on a phone screen and on a cardboard box",
      "The guidelines live at a URL — the team reads the rules where they work, not in a PDF attachment",
    ],
    facts: [
      { value: "39", label: "pages of guidelines" },
      { value: "8", label: "colours, two of them leading" },
      { value: "250", label: "files handed over" },
    ],
    custom: true,
    tags: ["Brand identity", "Website", "Guidelines"],
    disciplines: ["Design", "Web"],
    ratio: "portrait",
    photo: "/photos/mirai/cover-v2.jpg",
    cover: "/photos/mirai/cover-portrait.jpg",
  },
  {
    slug: "gotrack",
    title: "GoTrack",
    desc: "Redesign of a realtime GPS monitoring platform for vehicle fleets",
    services: "Brand mark · Product design · Web app",
    stack: "React 19 · TypeScript · Vite · Leaflet · SignalR",
    brief:
      "The tracking worked. Looking at it did not. GoTrack watches fleets of Teltonika trackers in realtime, and it wore the default desktop look of thirty years ago — grey chrome, boxed panels, and modals that opened over almost the entire screen, so every edit meant losing sight of the map you were working on.",
    did: [
      "Drew the mark: a calm wordmark with one green arrival dot, plus a monogram, app icon and avatar",
      "Made the map the workspace — full bleed, edge to edge, every panel floating above it",
      "Moved the fleet into one left sidebar that collapses out of the way when the map matters more",
      "Replaced the full-screen modals with a right panel: create a marker, draw a zone, edit a vehicle, all beside the map instead of on top of it",
      "Rebuilt monitoring around live state — positions pushed over SignalR, status, speed, fuel and battery on the card",
      "Carried the new surface through geofences, map markers and notifications, on a dark and a light theme",
    ],
    outcome: [
      "The fleet answers for itself at a glance: counts, statuses, alerts, details one click deep",
      "Nothing covers the map any more — editing and watching happen side by side",
      "Installable PWA, still shipping continuously since February 2025",
    ],
    gallery: [
      {
        src: "/photos/gotrack/edit-panel.jpg",
        caption:
          "Editing a vehicle in the right panel — the map never leaves the screen",
      },
      {
        src: "/photos/gotrack/create-marker.jpg",
        caption:
          "Creating a marker: colour, icon, coordinates, all beside the map instead of over it",
      },
      {
        src: "/photos/gotrack/geofences.jpg",
        caption:
          "Geofences — zones drawn on the workspace, filtered by type and colour",
      },
      {
        src: "/photos/gotrack/markers.jpg",
        caption:
          "Map markers — depots, fuel, clients and checkpoints as one legend",
      },
    ],
    facts: [
      { value: "610", label: "commits shipped" },
      { value: "13", label: "feature areas, each documented" },
      { value: "24k", label: "lines of strict TypeScript" },
    ],
    custom: true,
    tags: ["Redesign", "Web app", "Realtime"],
    disciplines: ["Web", "Design"],
    ratio: "wide",
    photo: "/photos/gotrack/monitoring.jpg",
    cover: "/photos/gotrack/cover.jpg",
    // concentric rings — a radar ping, which is what this product is
    pattern: 7,
  },
];
