import Link from "next/link";
import { site, type NavItem } from "@/lib/site";

export default function SiteHeader({ nav }: { nav: NavItem[] }) {
  return (
    <header className="sticky top-0 z-40 bg-bg border-b-[length:var(--bw)] border-ink">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
          <Link href="/" className="display text-xl sm:text-2xl leading-none hover:text-accent-2">
            {site.name}
          </Link>

          <nav aria-label="Primary">
            <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`slab slab-press inline-block px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-sm font-semibold uppercase tracking-wide ${
                      item.href.startsWith("/wiki") ? "bg-accent-2 text-white" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
