import Hero from "@/components/Hero";
import Section from "@/components/Section";

export default function HomePage() {
  return (
    <>
      <Hero
        actions={[
          { href: "#world", label: "The world" },
          { href: "#roadmap", label: "Where it stands" },
        ]}
      />
      <Section id="world" kicker="01" title="The world" tagline="Content follows in the next step." />
      <Section id="systems" kicker="02" title="Systems" tagline="Content follows in the next step." />
      <Section id="races" kicker="03" title="Races & classes" tagline="Content follows in the next step." />
      <Section id="architecture" kicker="04" title="Architecture" tagline="Content follows in the next step." />
      <Section id="roadmap" kicker="05" title="Roadmap" tagline="Content follows in the next step." />
    </>
  );
}
