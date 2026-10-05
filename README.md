# kepler-site

The public project page for **Kepler**, an Albion-style sandbox MMO built on Minecraft as a suite of
Paper 1.21.4 plugins: a player-driven economy, full-loot zones, kingdoms and guild sieges, and
Calamity waves that tear the map open every week.

Live at **https://keplerentertainment.github.io/kepler-site/**

> Kepler is in development. The plugins are drafted and in review and QA; nothing is playable yet.
> The plugin source repositories are private. This repository holds only the website.

## What is on the page

One page with anchored sections:

1. **Hero** - the pitch and the current status.
2. **The world** - the premise, the default 23×23 map of city pockets, bands and roads, the five cities and the travel services.
3. **Systems** - the core loop, economy, zones and full loot, kingdoms and sieges, dungeons,
   calamity waves, quests, BlueMap and custom content.
4. **Races & classes** - the ten biome races, fifteen classes, seven-slot skill bar and skill tiers.
5. **Architecture** - KeplerCore and its addon plugins.
6. **Roadmap** - what is done, what is in progress, what comes later.

All copy and data live in `lib/site.ts` (identity, nav) and `lib/content.ts` (everything else), so
updating the page rarely means touching a component.

## Stack and design

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript, built as a **static export**.
The design system is the one from the owner's portfolio (portfolio-v2): the neo-brutalist `.slab`
primitive (hard outline, solid offset shadow, flat fill), the same colour tokens, Archivo Black for
display, Space Grotesk for body text and IBM Plex Mono for labels.

## Run it

Requires Node 20 or newer (CI uses Node 22).

```bash
npm install
npm run dev     # http://localhost:3000/kepler-site/
npm run build   # writes the static site to ./out
npm run lint
```

The site is served under `/kepler-site`, so `basePath` and `assetPrefix` are set in
`next.config.ts`. To preview a build locally, serve the parent of a folder named `kepler-site`
that contains the contents of `out/`, for example:

```bash
mkdir -p /tmp/preview && cp -r out /tmp/preview/kepler-site
npx serve /tmp/preview   # then open http://localhost:3000/kepler-site/
```

## Deployment

`.github/workflows/deploy.yml` builds the export on every push to `main` and publishes `./out`
with the official GitHub Pages actions. In the repository settings, set **Pages → Source** to
**GitHub Actions**. `public/.nojekyll` stops Pages from running Jekyll, which would hide the
`_next` folder.

## Licence and affiliation

Kepler is an independent project by KeplerEntertainment. It is not affiliated with Mojang,
Microsoft or Sandbox Interactive.
