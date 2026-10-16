/**
 * Biome — which bunker location a page is.
 *
 * Spec: `site/docs/BIOMES.md`. One attribute on `<body>` (`data-biome`) selects
 * one token block in `global.css`, so eight biomes cover all 25 pages without a
 * bespoke background per page. A biome block may set exactly five things:
 * `--atmo-1`, `--atmo-2`, `--atmo-hue`, `--atmo-motion`, `--atmo-rate`.
 *
 * HARD LIMITS, restated here because this type is the system's front door:
 *  - A biome NEVER sets `--color-signal` / `--color-signal-dim`. Amber is the
 *    only signal on the site and it is identical on every page (rule 2).
 *  - A biome NEVER changes the LIGHTNESS of a `--color-facility-*` step. That
 *    ramp is contrast-tuned — `--color-facility-500` sits at L 0.66 because 0.55
 *    failed WCAG AA. Hue/chroma only, and a change needs recomputed ratios.
 *  - A biome is PER PAGE, never per section. If a section needs its own colour,
 *    the page has the wrong biome.
 *
 * Defined once and imported by both `BaseLayout` (which writes the attribute) and
 * `GuideLayout` (which forwards it), so the two unions cannot drift apart.
 */
export type Biome =
  | 'hub'
  | 'cold'
  | 'blueprint'
  | 'red'
  | 'green'
  | 'amber'
  | 'signal'
  | 'roster';

/**
 * A guide page is never the Central Room, so `GuideLayout` narrows the union
 * rather than restating it. Same values, one source.
 */
export type GuideBiome = Exclude<Biome, 'hub'>;
