/**
 * Site-wide settings, in the spirit of the portfolio's site.config: everything
 * about the project's identity lives here rather than in a component.
 */
export const site = {
  name: "Kepler",
  role: "sandbox MMO / Minecraft",
  url: "https://keplerentertainment.github.io/kepler-site/",
  org: {
    name: "KeplerEntertainment",
    url: "https://github.com/KeplerEntertainment",
  },
  headline: "A sandbox MMO where the world keeps breaking.",
  intro:
    "Kepler is an Albion-style sandbox MMO built on Minecraft: a player-driven economy, full-loot zones, kingdoms and guild sieges, and Calamity waves that tear the map open every week.",
  status: "In development. The plugins are drafted and going through review and QA. Nothing is live yet.",
  platform: "Paper 1.21.4 / Java 21",
  footerNote:
    "Kepler is an independent project. It is not affiliated with Mojang, Microsoft or Sandbox Interactive. Source repositories are private while the project is in development.",
} as const;

export interface NavItem {
  href: string;
  label: string;
}

/** The page is one long read; the nav jumps between its sections. */
export const nav: NavItem[] = [
  { href: "#world", label: "World" },
  { href: "#systems", label: "Systems" },
  { href: "#races", label: "Races & classes" },
  { href: "#architecture", label: "Architecture" },
  { href: "#roadmap", label: "Roadmap" },
];
