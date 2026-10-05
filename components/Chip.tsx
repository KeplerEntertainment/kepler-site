export type ChipTone = "panel" | "accent" | "accent2" | "accent3" | "ink";

/** The portfolio's small mono label: a 2px outline and a flat fill. */
export default function Chip({ tone = "panel", children }: { tone?: ChipTone; children: React.ReactNode }) {
  const bg =
    tone === "accent"
      ? "bg-accent text-accent-ink"
      : tone === "accent2"
        ? "bg-accent-2 text-white"
        : tone === "accent3"
          ? "bg-accent-3 text-accent-ink"
          : tone === "ink"
            ? "bg-ink text-bg"
            : "bg-panel";
  return (
    <span
      className={`${bg} inline-block border-2 border-ink px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em]`}
    >
      {children}
    </span>
  );
}
