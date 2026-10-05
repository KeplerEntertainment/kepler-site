import SectionHead from "@/components/SectionHead";

/** One block of the page: the portfolio's section frame (rule on top, max-w-6xl). */
export default function Section({
  id,
  kicker,
  title,
  tagline,
  children,
}: {
  id: string;
  kicker?: string;
  title: string;
  tagline?: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-16 rule">
      <SectionHead id={`${id}-h`} kicker={kicker} title={title} tagline={tagline} />
      {children}
    </section>
  );
}
