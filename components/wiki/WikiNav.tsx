"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/wiki/", label: "Wiki home", match: (p: string) => p === "/wiki" || p === "/wiki/" },
  { href: "/wiki/#how", label: "How it plays", match: () => false },
  { href: "/wiki/abilities/", label: "Abilities", match: (p: string) => p.startsWith("/wiki/abilities") },
  { href: "/wiki/#classes", label: "Classes", match: (p: string) => p.startsWith("/wiki/classes") },
  { href: "/wiki/#races", label: "Races", match: (p: string) => p.startsWith("/wiki/races") },
  { href: "/wiki/#roadmap", label: "Roadmap", match: () => false },
];

/** The wiki's own bar under the site header: a mono strip of the wiki's sections, current one inked. */
export default function WikiNav() {
  const path = usePathname() ?? "";
  return (
    <nav aria-label="Wiki" className="border-b-[length:var(--bw)] border-ink bg-panel">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-5 py-2.5 sm:px-8">
        <span className="shrink-0 bg-accent-2 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
          Wiki
        </span>
        <ul className="flex shrink-0 items-center gap-1.5">
          {ITEMS.map((item) => {
            const active = item.match(path);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block border-2 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] whitespace-nowrap ${
                    active ? "border-ink bg-ink text-bg" : "border-transparent hover:border-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
