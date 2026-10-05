import { site, type NavItem } from "@/lib/site";

const ROWS: { label: string; value: React.ReactNode }[] = [
  {
    label: "github",
    value: (
      <a href={site.org.url} className="ul-link font-medium break-all" target="_blank" rel="noopener noreferrer">
        github.com/{site.org.name}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ),
  },
  { label: "source", value: <span className="font-medium">Private repositories, one per plugin</span> },
  { label: "platform", value: <span className="font-medium">{site.platform}</span> },
];

export default function SiteFooter({ nav }: { nav: NavItem[] }) {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="mt-16 border-t-[length:var(--bw)] border-ink bg-panel">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="display text-lg mb-4">{site.org.name}</h2>
            <ul className="space-y-2">
              {ROWS.map((row) => (
                <li key={row.label} className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-mono text-xs uppercase tracking-widest opacity-60 w-20 shrink-0">
                    {row.label}
                  </span>
                  {row.value}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="display text-lg mb-4">This site</h2>
            <ul className="space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="ul-link font-medium">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 max-w-prose text-sm opacity-70">{site.footerNote}</p>

        <p className="mt-6 font-mono text-xs uppercase tracking-widest opacity-60">
          &copy; {year} {site.org.name}
        </p>
      </div>
    </footer>
  );
}
