import Chip, { type ChipTone } from "@/components/Chip";
import type { Element } from "@/lib/content";

/** Each Current gets one of the palette's fills. The word is always shown, so colour is never the only cue. */
const TONE: Record<Element, ChipTone> = {
  Water: "accent2",
  Fire: "accent3",
  Air: "panel",
  Earth: "accent",
};

export default function ElementChip({ element }: { element: Element }) {
  return <Chip tone={TONE[element]}>{element}</Chip>;
}
