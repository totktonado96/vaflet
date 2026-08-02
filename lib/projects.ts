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
    slug: "minipacs",
    title: "MiniPACS + Vendo",
    desc: "A self-hosted PACS and the referral portal beside it — an imaging center's whole stack, owned outright on one mini PC",
    services: "Product design · Full-stack build · Health tech",
    stack: "FastAPI · React PWA · Orthanc · Medplum FHIR · Next.js 15 · PostgreSQL",
    brief:
      "Independent imaging centers rent their own archive from cloud PACS vendors at $150–$2,000 a month, and take referrals by fax. We built the way out twice: a PACS the clinic owns on one mini PC, and a portal that finally gives a referral a status. This time the client was us — it is our own product.",
    did: [
      "Built the whole PACS: FastAPI and asyncpg behind, React PWA in front, Orthanc for DICOM, Docker on one mini PC",
      "Made reading instant — any study opens in any browser in under a second, ten modalities into one archive",
      "Wired voice into reporting: dictation, templates and dot-phrase macros, signed as DICOM PDFs that travel inside the study",
      "Gave patients a way out — PIN-protected links, QR, or a disc that opens on any computer",
      "Built Vendo on Medplum FHIR: a referral inbox with SLA aging, real-slot booking, white-label branding per clinic",
      "Put a safety gate before the scanner — an eGFR hard-block for MRI contrast, and pregnancy screening before booking",
      "Kept it provable: a hash-chained audit log, a 17-right permission matrix, AES-256 backups, zero open ports",
    ],
    outcome: [
      "A working American imaging clinic runs the exact stack in production — reading, reporting and booking on it every day",
      "Two products sold apart or together — $300, $500 or $640 a month, flat, with no per-study fees anywhere",
      "The live demo is one click at minipacs.net — synthetic patients, real product",
    ],
    facts: [
      { value: "300", label: "dollars a month, flat — the entire pitch" },
      { value: "10", label: "modalities into one archive" },
      { value: "0", label: "ports open to the internet" },
    ],
    custom: true,
    tags: ["Health tech", "Web app", "Self-hosted"],
    disciplines: ["Web", "Design"],
    ratio: "wide",
    photo: "/photos/minipacs/viewer.jpg",
    cover: "/photos/minipacs/login.jpg",
  },
  {
    slug: "asartech",
    title: "ASAR TECH",
    desc: "A Dubai tech shop where retail and wholesale share one cart — storefront, checkout and an admin the owner can actually use",
    services: "Product design · Full-stack build · E-commerce",
    stack: "Medusa 2 · Next.js 15 · PostgreSQL · Redis · Playwright",
    brief:
      "A Dubai reseller sells the same laptop to a tourist buying one and to a shop buying fifty. The usual answer is two websites — a retail store, and a B2B portal behind a login where you ask for a price. We built one shop, with the price ladder printed on the page.",
    did: [
      "Built the whole thing: Medusa 2 backend, Next.js 15 storefront, operator admin, deploy",
      "Put wholesale on the shelf — tiered price lists 1–9 / 10–49 / 50+, shown on the product and applied in the cart",
      "Shipped it worldwide: 249 countries at checkout, DDP delivery, AED and USD, EN and RU at key-for-key parity",
      "Wrote the recommendation engine — six algorithms ranked on the backend: similar, bought-together, frequently-bought, bestsellers, new arrivals, recently viewed",
      "Gave the owner a Russian admin inside the storefront, so nobody has to open Medusa's own back office",
      "Held the design to one blue accent, hairlines instead of shadows, real photos, and 390 px first",
    ],
    outcome: [
      "One cart serves the tourist buying one and the shop buying fifty — no login, no quote request",
      "The owner runs the whole shop from one Russian console: catalogue, orders, leads, payment keys and the home page, no redeploy",
      "7,474 pages in the production build, EN/RU parity 541 = 541, unit and end-to-end suites green",
    ],
    facts: [
      { value: "3", label: "prices on every product, one cart" },
      { value: "249", label: "countries the checkout accepts" },
      { value: "6", label: "recommendation engines behind the shop" },
    ],
    custom: true,
    tags: ["E-commerce", "Web", "Full-stack"],
    disciplines: ["Web", "Design"],
    ratio: "wide",
    photo: "/photos/asartech/home.jpg",
    cover: "/photos/asartech/home.jpg",
  },
  {
    slug: "tmcars",
    title: "TMCARS",
    desc: "Redesign of the largest classifieds app in Turkmenistan — stage one, built as a clickable prototype",
    services: "Product design · Prototype · Mobile",
    stack: "36 screens · Next.js prototype · Motion",
    brief:
      "TMCARS is the country's biggest classifieds board and one of its most used apps. Every screen is already somebody's daily habit, so the redesign goes in stages and each one is proven in a working prototype before anything ships.",
    did: [
      "Rebuilt the app as a clickable prototype — 36 screens, real navigation, real transitions",
      "Put the whole market on one feed: stories, categories, cars, parts and everything else without a mode switch",
      "Reworked finding: search suggestions, saved words, filters and results on one screen",
      "Gave selling its own place — publication quota, per-listing state, and a paid tier that explains itself",
      "Carried the system through business accounts, saved items, news and settings",
    ],
    outcome: [
      "A prototype the team could tap through instead of a deck they had to imagine",
      "Stage one agreed screen by screen before a line of production code",
      "The rest of the redesign is under NDA",
    ],
    facts: [
      { value: "36", label: "screens in the prototype" },
      { value: "1", label: "stage public, of several" },
      { value: "24", label: "screens shown in this case" },
    ],
    custom: true,
    tags: ["App redesign", "Prototype", "Classifieds"],
    disciplines: ["Design", "Mobile"],
    ratio: "wide",
    photo: "/photos/tmcars/main.jpg",
    cover: "/photos/tmcars/cover-white.jpg",
  },
  {
    slug: "aydym",
    title: "Aydym",
    desc: "Rebrand of the largest music streaming platform in Turkmenistan — mark, colour, type and the book that holds it",
    services: "Brand identity · Guidelines · Applications",
    stack: "Logo system · Colour · Typography · Iconography · Pattern",
    brief:
      "Aydym streams music to a whole country, and it needed an identity that works at 32 pixels on a phone and on a tote bag in the street. The mark had to say music without a note in sight, and the system had to survive a dark interface, a printed flyer and a gift card.",
    did: [
      "Built the mark from a circle that doubles as a play button, with sound bars inside it",
      "Set Cosmic Violet against near-black as the brand, not as a dark mode",
      "Added three states — positive, friendly, smart — instead of decorative extras",
      "Paired SF Pro Display with Inter on one hierarchy, display down to caption",
      "Cut the icon set to the brand's weight and derived a pattern from the mark's own bars",
      "Applied it end to end: app screens, social, gift cards, roll-up, flyer, cards, stationery, merch",
    ],
    outcome: [
      "One identity that holds from a 32 px favicon to a printed poster",
      "A dark-first system, so the product and the brand stopped disagreeing",
      "A 59-page book covering logo, colour, type, icons, photography, pattern and applications",
    ],
    facts: [
      { value: "59", label: "pages of guidelines" },
      { value: "6", label: "colours, one of them leading" },
      { value: "32", label: "px — where the mark still reads" },
    ],
    custom: true,
    tags: ["Brand identity", "Streaming", "Guidelines"],
    disciplines: ["Design"],
    ratio: "square",
    photo: "/photos/aydym/hero-photo.jpg",
    cover: "/photos/aydym/cover-square.jpg",
  },
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
