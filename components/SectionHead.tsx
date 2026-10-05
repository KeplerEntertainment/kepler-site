/** A section title with an optional tagline and a short mono label above it. */
export default function SectionHead({
  id,
  kicker,
  title,
  tagline,
}: {
  id: string;
  kicker?: string;
  title: string;
  tagline?: string;
}) {
  return (
    <div className="mb-9">
      {kicker && <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-2">{kicker}</p>}
      <h2 id={id} className="display text-3xl sm:text-4xl">
        {title}
      </h2>
      {tagline && <p className="mt-3 max-w-[60ch] text-lg leading-relaxed opacity-80">{tagline}</p>}
    </div>
  );
}
