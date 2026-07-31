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
  year: string;
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
    slug: "gotrack",
    title: "GoTrack",
    desc: "Redesign of a realtime GPS monitoring platform for vehicle fleets",
    year: "2025—",
    services: "Product design · Web app · Realtime",
    stack: "React 19 · TypeScript · Vite · Leaflet · SignalR",
    brief:
      "The tracking worked. Looking at it did not. GoTrack watches fleets of Teltonika trackers in realtime, and it wore the default desktop look of thirty years ago — grey chrome, boxed panels, and modals that opened over almost the entire screen, so every edit meant losing sight of the map you were working on.",
    did: [
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
  {
    slug: "loopwire",
    title: "Loopwire",
    desc: "Ops automation platform for logistics teams",
    year: "2026",
    services: "Product design · Web app · Automation",
    stack: "Next.js · Supabase · n8n",
    brief:
      "A logistics operator was running dispatch on spreadsheets, chat threads and vibes. Orders fell through the cracks daily, and nobody could say where a shipment actually was.",
    did: [
      "Mapped the real workflow — not the one in the org chart",
      "Designed and built a dispatch web app around it",
      "Wired carriers, CRM and billing into one pipeline",
      "Automated status chasing so humans stopped doing it",
    ],
    outcome: [
      "Dispatch went from three tools to one screen",
      "Status calls stopped — the system reports itself",
      "New hires onboard in a day, not a month",
    ],
    tags: ["Web app", "Product design", "Automation"],
    disciplines: ["Web", "Design", "Automation"],
    ratio: "landscape",
    photo: "/photos/loopwire.jpg",
    photoDetail: "/photos/loopwire-2.jpg",
  },
  {
    slug: "fintary",
    title: "Fintary",
    desc: "Personal finance app that talks back",
    year: "2026",
    services: "Mobile app · AI integration",
    stack: "React Native · Expo · Claude",
    brief:
      "A fintech founder wanted a budgeting app people would actually open twice. The idea: your money answers questions in plain language instead of charts you don't read.",
    did: [
      "Ran research sprints with real budgeters",
      "Designed a chat-first interface over transactions",
      "Built iOS and Android apps from one codebase",
      "Shipped an LLM layer with guardrails on every answer",
    ],
    outcome: [
      "A working App Store product, not a prototype",
      "Users ask their money questions — and get answers",
      "The retention curve stopped looking like a cliff",
    ],
    tags: ["Mobile app", "AI"],
    disciplines: ["Mobile", "AI"],
    ratio: "portrait",
    photo: "/photos/fintary.jpg",
    photoDetail: "/photos/fintary-2.jpg",
  },
  {
    slug: "agent-loom",
    title: "agent-loom",
    desc: "Lightweight framework for wiring LLM agents into real workflows",
    year: "2025—",
    services: "Open source · AI tooling",
    stack: "TypeScript · works with any model",
    brief:
      "Every agent project starts with the same plumbing: tools, retries, guardrails, logging. We got tired of rebuilding it, so we packaged ours.",
    did: [
      "Extracted the agent runtime we use on client work",
      "Made tools and evals first-class citizens",
      "Kept the API small enough to read in one sitting",
      "Documented it like we mean it",
    ],
    outcome: [
      "One dependency instead of a folder of copy-paste",
      "Powers the agents we ship to clients",
      "Public repo coming — ping us for early access",
    ],
    tags: ["Open source", "AI tooling"],
    disciplines: ["AI", "Open source"],
    ratio: "square",
    photo: "/photos/agent-loom.jpg",
    photoDetail: "/photos/agent-loom-2.jpg",
    oss: true,
  },
  {
    slug: "casehawk",
    title: "Casehawk",
    desc: "Research copilot for a boutique law firm",
    year: "2025",
    services: "AI agent · Web app",
    stack: "Next.js · retrieval over case files",
    brief:
      "Associates were spending evenings digging through case archives. The partners wanted the digging done by software — with sources cited, because lawyers.",
    did: [
      "Built retrieval over decades of case files",
      "Designed a research interface lawyers didn't hate",
      "Every answer links to the exact source page",
      "Added evals so wrong answers get caught, not shipped",
    ],
    outcome: [
      "Research that took evenings now takes minutes",
      "Zero uncited claims make it past the interface",
      "The associates got their evenings back",
    ],
    tags: ["AI agent", "Web app"],
    disciplines: ["AI", "Web"],
    ratio: "portrait",
    photo: "/photos/casehawk.jpg",
    photoDetail: "/photos/casehawk-2.jpg",
  },
  {
    slug: "vibekit",
    title: "vibekit",
    desc: "Opinionated Next.js starter for shipping an MVP in a weekend",
    year: "2025—",
    services: "Open source · Developer tooling",
    stack: "Next.js · Tailwind · Supabase",
    brief:
      "Our own MVP checklist, turned into code: auth, payments, analytics and deploys pre-wired, so an AI-native weekend build ends with something on a real URL.",
    did: [
      "Distilled our fastest client builds into a starter",
      "Pre-wired the boring 80% every product needs",
      "Kept it deletable — rip out anything in minutes",
      "Battle-tested it on our own rapid MVPs",
    ],
    outcome: [
      "Idea to deployed product in a weekend, repeatedly",
      "The starter behind our Rapid MVP service",
      "Public repo coming — ping us for early access",
    ],
    tags: ["Open source", "Dev tooling"],
    disciplines: ["Web", "Open source"],
    ratio: "landscape",
    photo: "/photos/vibekit.jpg",
    photoDetail: "/photos/vibekit-2.jpg",
    oss: true,
  },
  {
    slug: "peakform",
    title: "Peakform",
    desc: "AI coaching app for amateur athletes",
    year: "2026",
    services: "Mobile app · AI agent · Brand",
    stack: "React Native · wearables APIs",
    brief:
      "A coaching startup wanted training plans that adapt daily — to sleep, soreness and schedule — without paying a human coach to babysit every athlete.",
    did: [
      "Designed the brand and the app as one system",
      "Built training plans that re-plan themselves",
      "Synced wearables so the app knows before you do",
      "Kept a human-coach handoff for the hard calls",
    ],
    outcome: [
      "Plans adjust overnight, athletes just open the app",
      "Coaches supervise ten times more athletes",
      "The brand looks fast even standing still",
    ],
    tags: ["Mobile app", "AI agent", "Brand"],
    disciplines: ["Mobile", "AI", "Design"],
    ratio: "square",
    photo: "/photos/peakform.jpg",
    photoDetail: "/photos/peakform-2.jpg",
  },
];
