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
  ratio: "square" | "portrait" | "landscape";
  photo: string;
  photoDetail: string;
  oss?: boolean;
};

export const PROJECTS: Project[] = [
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
