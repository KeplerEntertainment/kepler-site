"use client";

import { useMemo, useState } from "react";
import AbilityCard, { type CardData } from "@/components/wiki/AbilityCard";
import type { ElementId, Slot } from "@/lib/wiki-shared";

interface Owner {
  id: string;
  name: string;
  color: string;
  kind: "class" | "race";
}

const SLOTS: Slot[] = ["Q", "E", "R", "T", "Z", "X", "C"];
const ELEMENTS: ElementId[] = ["WATER", "FIRE", "AIR", "EARTH", "NEUTRAL"];
const EL_LABEL: Record<ElementId, string> = { WATER: "Water", FIRE: "Fire", AIR: "Air", EARTH: "Earth", NEUTRAL: "Neutral" };

function FilterButton({
  pressed,
  onClick,
  children,
  swatch,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-2 border-ink px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-transform active:translate-x-px active:translate-y-px ${
        pressed ? "bg-ink text-bg" : "bg-panel hover:bg-accent"
      }`}
    >
      {swatch && <span aria-hidden="true" className="inline-block h-2.5 w-2.5 border border-current" style={{ background: swatch }} />}
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="grid gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-start">
      <p className="pt-1 font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

/** The ability index with client-side filters: owner (class or race), slot and element. */
export default function AbilityBrowser({ cards, owners }: { cards: CardData[]; owners: Owner[] }) {
  const [owner, setOwner] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [element, setElement] = useState<ElementId | null>(null);

  const shown = useMemo(
    () =>
      cards.filter(
        (c) =>
          (!owner || `${c.ownerKind}:${c.ownerId}` === owner) && (!slot || c.slot === slot) && (!element || c.element === element),
      ),
    [cards, owner, slot, element],
  );

  const classes = owners.filter((o) => o.kind === "class");
  const races = owners.filter((o) => o.kind === "race");
  const any = owner || slot || element;

  return (
    <div>
      <div className="slab space-y-3 p-4 sm:p-5">
        <Group label="Owner">
          <FilterButton pressed={!owner} onClick={() => setOwner(null)}>
            All
          </FilterButton>
        </Group>
        <Group label="Classes">
          {classes.map((o) => (
            <FilterButton
              key={o.id}
              swatch={o.color}
              pressed={owner === `class:${o.id}`}
              onClick={() => setOwner(owner === `class:${o.id}` ? null : `class:${o.id}`)}
            >
              {o.name}
            </FilterButton>
          ))}
        </Group>
        <Group label="Races">
          {races.map((o) => (
            <FilterButton
              key={o.id}
              swatch={o.color}
              pressed={owner === `race:${o.id}`}
              onClick={() => setOwner(owner === `race:${o.id}` ? null : `race:${o.id}`)}
            >
              {o.name}
            </FilterButton>
          ))}
        </Group>
        <Group label="Slot">
          <FilterButton pressed={!slot} onClick={() => setSlot(null)}>
            All
          </FilterButton>
          {SLOTS.map((s) => (
            <FilterButton key={s} pressed={slot === s} onClick={() => setSlot(slot === s ? null : s)}>
              {s}
            </FilterButton>
          ))}
        </Group>
        <Group label="Element">
          <FilterButton pressed={!element} onClick={() => setElement(null)}>
            All
          </FilterButton>
          {ELEMENTS.map((e) => (
            <FilterButton key={e} pressed={element === e} onClick={() => setElement(element === e ? null : e)}>
              {EL_LABEL[e]}
            </FilterButton>
          ))}
        </Group>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink pt-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em]" aria-live="polite">
            Showing <strong>{shown.length}</strong> of {cards.length} abilities
          </p>
          {any && (
            <button
              type="button"
              onClick={() => {
                setOwner(null);
                setSlot(null);
                setElement(null);
              }}
              className="ul-link font-mono text-xs uppercase tracking-[0.14em]"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 slab bg-accent px-4 py-3 font-semibold text-accent-ink">No ability matches these filters.</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((c) => (
            <li key={c.id}>
              <AbilityCard card={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
