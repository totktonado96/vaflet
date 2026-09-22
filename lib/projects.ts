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
    services: "Product design · Full-stack build · Health tech · New York",
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
    // the mark on the product's own limestone — the grid card reads as brand,
    // like Aydym's; the marble stays on the case page hero
    cover: "/photos/minipacs/cover.jpg",
  },
  {
    slug: "face2me",
    title: "Face2me",
    desc: "An AI receptionist that stands in the lobby — a New York-built kiosk with a face that greets you, finds you by name and checks you in, in your own language",
    services: "Product design · Full-stack build · Voice AI · New York",
    // the client's rule for this case: no tech stack anywhere in lead-facing
    // copy — the field stays honest but vendor-free (custom page never shows it)
    stack: "Kiosk hardware · Real-time voice · A face on the screen",
    brief:
      "A front desk costs three to four and a half thousand a month and goes home at five. The phone AIs are a voice with nobody behind it, and the lobby kiosks the enterprises sell start at fifty thousand to install. We built the third answer, and again the client was us: a face on a screen that talks back, hears the language you walked in speaking, and arrives as one monthly bill with the hardware inside it.",
    did: [
      "Put a real face on the front desk — it speaks, lip-syncs and looks at you; voice and touch in the same flow",
      "Taught it to find people: exact lookup, then sounds-like, then fuzzy — a name said with an accent is still that name",
      "Wired it into whatever runs the business, so a check-in lands in the schedule while the visitor is still standing there",
      "Let it book the next visit and sign up first-timers by conversation — service, time, details, done",
      "Gave it three languages — English, Spanish, Russian — and the ear to follow whichever one walks in",
      "Left the staff a way back in: a PIN-locked panel with the live queue, search, and a manual override for anything",
      "Made it lobby-proof: it reconnects on bad wifi, nudges the silent, hangs up after goodbye, and logs every move",
    ],
    outcome: [
      "One monthly bill carries the hardware, the software, the integration and the install — there is no per-minute meter anywhere",
      "Month to month, no annual contract: the day it stops earning its place, it goes back",
      "Built by two engineers in New York — the same two who install it",
    ],
    facts: [
      { value: "3", label: "languages — English, Spanish, Russian — followed mid-sentence" },
      { value: "3", label: "tiers of name matching before it asks again" },
      { value: "0", label: "per-minute fees — the meter runs monthly" },
    ],
    custom: true,
    tags: ["AI avatar", "Kiosk", "Voice"],
    disciplines: ["AI", "Design", "Automation"],
    ratio: "wide",
    // the mark on the same limestone as MiniPACS — both cards are our own brands
    cover: "/photos/face2me/cover-mark.jpg",
    // ripples — a voice leaving a face, which is the whole product
    pattern: 1,
  },
  // sahypa.menu third and square on purpose: with eleven cases the third
  // column holds only three cards, so the square and the portrait both go
  // there — Mirai before Aydym for the same reason — and the other two columns
  // take four wide frames each
  {
    slug: "sahypa",
    title: "sahypa.menu",
    desc: "A whole restaurant in one system — the guest’s table, the waiter’s phone, the till, the owner’s panel, and a server in the room that keeps the shift going when the internet drops",
    services: "Product design · Full-stack build · Desktop app · Restaurant tech",
    stack: "NestJS · React 19 · Tauri 2 · PostgreSQL · PGlite · PWA",
    brief:
      "A restaurant in Ashgabat usually runs on a zoo: a QR menu from one vendor, a till from another, orders carried to the kitchen by hand and the takings in a notebook — and all of it stops when the internet does. We built the whole restaurant as one system instead: five products on one core, and a server in the room that keeps the floor working on its own.",
    did: [
      "Designed and built five products on one core: the guest’s menu, the waiter’s phone, the till, the owner’s panel and the restaurant server",
      "Put ordering on the guest’s own phone — a code on the table, no app, no sign-up, one order from every phone at it",
      "Turned an ordinary Windows computer into the till and the restaurant’s server with one installer",
      "Kept the floor working with the internet down: orders, the till and printing live in the room and catch the cloud up by themselves",
      "Sent the paper where it belongs — kitchen and bar tickets with no prices, the table’s bill, receipts and a Z-report on network thermal printers",
      "Gave the owner a panel in any browser: menu and stop list, floor and QR codes, staff and permissions, analytics, printed menus and reviews",
      "Built all of it in four languages — Turkmen, Russian, English and Turkish — with a public directory of the places on it",
    ],
    outcome: [
      "Live at sahypa.menu — the menu, the directory and the panel in the cloud, the till and the server on the restaurant’s own computer",
      "Five products in one subscription, with sahypa.delivery next on the same core",
      "161 places already in the public directory, each with its menu, hours and reviews",
    ],
    facts: [
      { value: "5", label: "products on one system, in one subscription" },
      { value: "4", label: "languages on every screen — Turkmen, Russian, English, Turkish" },
      { value: "161", label: "places in the public directory" },
    ],
    custom: true,
    tags: ["Restaurant tech", "Ecosystem", "Offline-first"],
    disciplines: ["Web", "Mobile", "Design"],
    ratio: "square",
    photo: "/photos/sahypa/l-hero.jpg",
    // the mark on the brand's own fire — the grid card reads as the product
    cover: "/photos/sahypa/cover.jpg",
  },
  {
    slug: "beletfilm",
    title: "Belet Film",
    desc: "App design for Turkmenistan’s main streaming service — from the first launch to a locked player",
    services: "Product design · UX · Mobile app",
    stack: "Figma · Inter · Microsoft Fluent System Icons",
    brief:
      "Belet Film is Turkmenistan’s main streaming service: series from all over the world, in translation and in the original language. We designed its app — the research, the flows between the screens and the interface itself, from the first launch to the account, including the moments nobody puts in a pitch.",
    did: [
      "Started from desk research into how streaming apps are used and built",
      "Designed the flows: first launch, sign-in by phone number, the feed, the catalog and its filters, a title, the player, the account",
      "Drew the player’s states — settings, speed, series, a lock, a complaint — and what the app says when the connection drops",
      "Built one visual language for every service: Inter, Microsoft Fluent System Icons on three grids, near-black and one blue",
      "Crafted a prototype that puts simplicity and clarity first, so the key features are found without being explained",
    ],
    outcome: [
      "Every main flow designed end to end — first launch, sign-in, the feed, the catalog, a title, the player and the account",
      "The awkward moments drawn too: a locked screen, a complaint about quality, a dropped connection",
      "One visual language — Inter, Fluent icons and one blue — across the whole platform",
    ],
    facts: [
      { value: "14", label: "screens shown in this case" },
      { value: "5", label: "states of the player, from playing to offline" },
      { value: "3", label: "icon grids — 24, 20 and 16 px" },
    ],
    custom: true,
    tags: ["Streaming", "App design", "UX/UI"],
    disciplines: ["Design", "Mobile"],
    ratio: "wide",
    photo: "/photos/beletfilm/player.jpg",
    // the brand on its own gradient — the grid card reads as the service, like
    // MiniPACS and Face2me; the screens carry the case page
    cover: "/photos/beletfilm/cover.jpg",
  },
  {
    slug: "sadasuw",
    title: "Sada Suw",
    desc: "A website for a juice plant in Turkmenistan — eleven flavours in glass, three languages, and not one file from anybody else’s server",
    services: "Web design · Full-stack build · CMS",
    stack: "Next.js 16 · Payload 3 · PostgreSQL 16 · Docker",
    brief:
      "Sada Suw presses fruit and vegetable juice in the Ahal region and ships it by the pallet under two brands, ELLE and ILKENT. Its site is opened from a country where a foreign domain does not fail with an error — a Google font or a CDN script simply never arrives, and the page waits for it. So the site asks nothing of anybody else.",
    did: [
      "Built the approved design into the production site: Next.js 16, Russian, English and Turkmen, one page served from cache",
      "Kept every font, film and image on the site’s own address, and wrote the check that walks the live pages for anything loaded from elsewhere",
      "Laid out the range, three bottle formats drawn with their dimensions, the production chain and the plant’s own film",
      "Gave it a light theme with its own palette and pattern — the catalogue’s paper, not an inversion",
      "Moved the content into Payload and PostgreSQL behind a single facade, so no component knows the database exists",
      "Wrote a Russian admin on the pattern of a tool the client already liked: the day’s tasks first, the range as cards, edits in a window over the catalogue",
      "Sent price requests to the database and the plant’s Telegram, and stopped spam without a captcha",
    ],
    outcome: [
      "Ready for the plant’s own server — the site, the admin and the database come up together with one docker compose",
      "The plant edits its range, texts and contacts in Russian, and any record can be rolled back to an earlier version",
      "Specs stay off the page until the plant confirms them — a food producer’s numbers are not placeholders",
    ],
    facts: [
      { value: "0", label: "files loaded from any address but its own" },
      { value: "3", label: "languages — Russian, English, Turkmen" },
      { value: "11", label: "flavours, each edited from the admin" },
    ],
    custom: true,
    tags: ["Manufacturing", "Website", "CMS"],
    disciplines: ["Web", "Design"],
    ratio: "wide",
    photo: "/photos/sadasuw/hero.jpg",
    cover: "/photos/sadasuw/cover.jpg",
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
    cover: "/photos/asartech/cover-logo.jpg",
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
    slug: "masynbazar",
    title: "MashynBazar",
    desc: "The online showroom of a Dubai car dealer, built for buyers who never walk the lot — a film at night, a catalogue by daylight",
    services: "Product design · Full-stack build · E-commerce",
    stack: "React · TypeScript · Express · Prisma · PWA · Telegram",
    brief:
      "MashynBazar sells new and used cars from a lot in Al Quoz, Dubai, and ships them to buyers across the CIS, the Caucasus and the Gulf. Those buyers cannot kick the tyres, so the site has to do the walk-around: make the car wanted, answer what the lot would, and keep a manager one tap away.",
    did: [
      "Designed and built it turnkey — home, catalogue, car pages, the admin behind them, and the launch",
      "Opened it on a film of one car under red light, and turned the lights on for the catalogue",
      "Put the spec sheet on every card, and eleven tiles beside every car’s gallery — speed, 0–100, power, drive, mileage",
      "Brought the dealer’s YouTube channel onto the home page without an API key, cached so the section never goes blank",
      "Sent every request to the manager’s Telegram behind eight layers of spam defence",
      "Handed over an admin in Russian and English: cars, photos, statuses, translations and contacts",
    ],
    outcome: [
      "A buyer thousands of kilometres away compares cars spec by spec before the first message",
      "The dealer runs the stock, the copy and the contacts alone, in two languages",
      "Live at masynbazar.com",
    ],
    facts: [
      { value: "11", label: "specs beside every car’s gallery" },
      { value: "10", label: "delivery routes on the footer globe" },
      { value: "8", label: "layers of spam defence before Telegram" },
    ],
    custom: true,
    tags: ["Automotive", "E-commerce", "Turnkey"],
    disciplines: ["Web", "Design"],
    ratio: "wide",
    photo: "/photos/masynbazar/hero.jpg",
    cover: "/photos/masynbazar/cover.jpg",
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
    cover: "/photos/gotrack/cover-logo.jpg",
    // concentric rings — a radar ping, which is what this product is
    pattern: 7,
  },
];
