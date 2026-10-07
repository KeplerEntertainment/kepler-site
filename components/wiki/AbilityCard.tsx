import Image from "next/image";
import Link from "next/link";
import { ElementTag, SlotKey, Swatch } from "@/components/wiki/bits";
import { abilityHref, GIF_H, GIF_W, mediaSrc, type Ability, type ElementId, type Slot } from "@/lib/wiki-shared";

/** The few fields a card needs, so the client-side browser does not ship every stage of every skill. */
export interface CardData {
  id: string;
  slot: Slot;
  name: string;
  mythicName: string;
  element: ElementId;
  kind: string;
  ownerKind: "class" | "race";
  ownerId: string;
  ownerName: string;
  ownerColor: string;
  weapon: string | null;
  cooldown: number | null;
  gif: string;
}

export function toCard(a: Ability): CardData {
  return {
    id: a.id,
    slot: a.slot,
    name: a.name,
    mythicName: a.stages[4].name,
    element: a.element,
    kind: a.kind,
    ownerKind: a.ownerKind,
    ownerId: a.ownerId,
    ownerName: a.ownerName,
    ownerColor: a.ownerColor,
    weapon: a.weapon,
    cooldown: a.cooldown,
    gif: a.stages[4].gif,
  };
}

/** One skill as a pressable slab: the Mythic preview on top, then name → Mythic name, slot, element, owner, cooldown. */
export default function AbilityCard({ card }: { card: CardData }) {
  return (
    <Link href={abilityHref(card.id)} className="slab slab-press group flex h-full flex-col overflow-hidden">
      <div className="relative border-b-[length:var(--bw)] border-ink bg-ink">
        <Image
          src={mediaSrc(card.gif)}
          alt={`${card.mythicName}, the Mythic form of ${card.name}: animated preview`}
          width={GIF_W}
          height={GIF_H}
          loading="lazy"
          unoptimized
          className="block h-auto w-full"
        />
        <span className="absolute left-2 top-2">
          <SlotKey slot={card.slot} size="sm" />
        </span>
        <span className="absolute bottom-2 right-2 border-2 border-ink bg-[#ff3d5a] px-1.5 py-px font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink">
          Mythic
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="display text-lg leading-tight group-hover:underline">{card.name}</p>
        <p className="mt-0.5 text-xs opacity-75">
          <span aria-hidden="true">→ </span>
          <span className="sr-only">Mythic form: </span>
          {card.mythicName}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <ElementTag element={card.element} />
          <span className="inline-block border-2 border-ink bg-panel px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em]">
            {card.slot === "T" ? "100 charge" : card.cooldown != null ? `${card.cooldown} s` : "—"}
          </span>
        </div>
        <p className="mt-auto flex items-center gap-2 pt-3 text-xs font-semibold">
          <Swatch color={card.ownerColor} />
          <span>
            {card.ownerName}
            <span className="font-normal opacity-70">
              {" "}
              · {card.weapon ?? (card.ownerKind === "class" ? "class" : "race")}
            </span>
          </span>
        </p>
      </div>
    </Link>
  );
}
