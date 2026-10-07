import Chip from "@/components/Chip";
import ElementChip from "@/components/ElementChip";
import { elementName, type ElementId, type Slot } from "@/lib/wiki-shared";

/**
 * Small wiki pieces, all built from the site's own primitives (slab, Chip, ElementChip).
 */

/** Renders a MiniMessage line from the plugin YAML: <white>…</white> becomes bold, every other tag is dropped. */
export function MiniText({ text }: { text: string }) {
  const parts = text.split(/<white>(.*?)<\/white>/g);
  const strip = (s: string) => s.replace(/<\/?[a-z_#0-9:]+>/gi, "");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold">
            {strip(p)}
          </strong>
        ) : (
          <span key={i}>{strip(p)}</span>
        ),
      )}
    </>
  );
}

/** Element chip from a YAML element id; Neutral weapon skills get a plain chip. */
export function ElementTag({ element }: { element: ElementId }) {
  const name = elementName(element);
  return name ? <ElementChip element={name} /> : <Chip>Neutral</Chip>;
}

const SLOT_FILL: Record<Slot, string> = {
  Q: "bg-accent text-accent-ink",
  E: "bg-accent text-accent-ink",
  R: "bg-accent-3 text-accent-ink",
  T: "bg-ink text-bg",
  Z: "bg-panel",
  X: "bg-panel",
  C: "bg-panel",
};

/** A key cap: the slot letter on the fill of its source (race yellow, class red, ultimate ink, weapon white). */
export function SlotKey({ slot, size = "md" }: { slot: Slot; size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "sm" ? "h-7 w-7 text-base border-2" : size === "lg" ? "h-16 w-16 text-4xl border-[length:var(--bw)]" : "h-10 w-10 text-xl border-[length:var(--bw)]";
  return (
    <span
      className={`display inline-flex shrink-0 items-center justify-center border-ink ${dims} ${SLOT_FILL[slot]}`}
    >
      <span className="sr-only">Slot </span>
      {slot}
    </span>
  );
}

/** A flat colour swatch for a class or race colour (always next to its name, so colour is never the only cue). */
export function Swatch({ color, className = "h-3 w-3" }: { color: string; className?: string }) {
  return <span aria-hidden="true" className={`inline-block shrink-0 border-2 border-ink ${className}`} style={{ background: color }} />;
}

/** Tier label on its tier colour, with ink text (contrast holds on every tier colour). */
export function TierChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block border-2 border-ink px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink"
      style={{ background: color }}
    >
      {label}
    </span>
  );
}

/** A mono key / value row list, the footer's pattern. */
export function Facts({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[8.5rem_minmax(0,1fr)]">
      {rows.map((r) => (
        <div key={r.label} className="contents">
          <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60 sm:pt-0.5">{r.label}</dt>
          <dd className="font-medium">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A small square bullet list, the home page's pattern. */
export function Bullets({ items, className = "" }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={`space-y-1.5 text-sm ${className}`}>
      {items.map((p, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className="mt-1.5 inline-block h-2 w-2 shrink-0 bg-ink" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}
