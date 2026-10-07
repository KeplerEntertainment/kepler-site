import type { Metadata } from "next";
import AbilityBrowser from "@/components/wiki/AbilityBrowser";
import { toCard } from "@/components/wiki/AbilityCard";
import { abilities, wikiClasses, wikiRaces } from "@/lib/wiki";

export const metadata: Metadata = {
  title: "Abilities / Kepler wiki",
  description: `All ${abilities.length} race and class skills of Kepler, each with its five stages from Common to Mythic and an animated preview.`,
};

export default function AbilitiesIndex() {
  const owners = [
    ...wikiClasses.map((c) => ({ id: c.id, name: c.name, color: c.color, kind: "class" as const })),
    ...wikiRaces.map((r) => ({ id: r.id, name: r.name, color: r.color, kind: "race" as const })),
  ];
  const classCount = abilities.filter((a) => a.ownerKind === "class").length;

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-10 sm:px-8 sm:pt-16">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-2">Wiki / Abilities</p>
        <h1 className="display text-5xl sm:text-6xl">Every skill, every stage</h1>
        <p className="mt-6 max-w-[60ch] text-lg leading-relaxed">
          {abilities.length} abilities: {classCount} class skills (R, T and the class weapons&rsquo; Z, X and C) and{" "}
          {abilities.length - classCount} race skills (Q and E). Each card shows the skill&rsquo;s Mythic form; open one for its
          stats and all five stages, Common at level 1 to Mythic at level 100.
        </p>
      </section>
      <section aria-label="Ability browser" className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <AbilityBrowser cards={abilities.map(toCard)} owners={owners} />
        <p className="mt-8 max-w-[80ch] text-xs leading-relaxed opacity-70">
          Previews are rendered from recordings of the live server&rsquo;s skill visuals (moving blocks, particles, caster and
          training dummies); stylised, not in-game screenshots.
        </p>
      </section>
    </>
  );
}
