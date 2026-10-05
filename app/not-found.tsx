import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-20">
      <div className="slab bg-accent p-8 text-accent-ink">
        <h1 className="display text-4xl">Off the map</h1>
        <p className="mt-3 max-w-[52ch]">Nobody has surveyed this tile yet. Head back to the city.</p>
        <Link href="/" className="slab slab-press mt-6 inline-block bg-panel px-5 py-3 font-semibold uppercase">
          Back to Kepler
        </Link>
      </div>
    </section>
  );
}
