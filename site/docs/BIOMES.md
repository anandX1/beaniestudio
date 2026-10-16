# BIOMES — one place per page

Written 2026-10-17. The spec for making every page of `beaniestudio.site` feel like a
distinct location in the bunker, without hurting performance.

## Why

The site has a facility fiction, but it is currently **decorative** — a terminal skin on
ordinary pages. Every sub-page is flat near-black with plain stacked text, so the site
reads as "loading content", not as a place. The homepage now has atmosphere; the other
24 pages do not.

This makes the fiction **structural**: each page is a room or a system, and the site reads
as a route through the bunker.

**Hard constraint from the 13-site teardown:** a new background colour *per section* is
the "well-made template smell" (one reference site was flagged for 51 tokens and 8 hues).
So this is **per page, never per section.** Eight biome definitions cover all 25 pages.

## The journey arc

The pages are not random biomes; they are a sequence. Every page should know where it
sits in this:

> Arrive → Orient → Learn the terrain → Meet the threat → Work → Crisis → Leave → Debrief

| Stage | Pages |
|---|---|
| Arrive | `/` |
| Orient | `/guide/`, `/faq/`, `/about/` |
| Learn the terrain | `/guide/map/`, `/guide/danger/`, `/guide/hiding/` |
| Meet the threat | `/guide/jingles/`, `/guide/worm/` |
| Work | `/guide/scrap/`, `/guide/crushers/`, `/codes/` |
| Crisis | `/guide/capture-and-rescue/`, `/guide/with-friends/` |
| Leave | `/play/` |
| Debrief | `/guide/numbers/`, `/screenshots/`, `/videos/`, `/press/`, `/creators/`, `/community/`, `/blog/`, `/404` |

## The system — one attribute, not 25 bespoke pages

```astro
<BaseLayout biome="blueprint">
```

`BaseLayout` writes it to `<body data-biome="blueprint">`. `global.css` resolves it to a
token block. Each page gets a whole personality from **three lines of markup**.

### What a biome block may set

Only these. Nothing else.

```css
[data-biome='blueprint'] {
  --atmo-1: <a radial-gradient colour stop>;   /* primary depth layer   */
  --atmo-2: <a second, offset stop>;           /* secondary depth layer */
  --atmo-hue: <a hue shift for surface tints>; /* NOT for the accent    */
  --atmo-motion: drift-a;                      /* which ambient keyframe */
  --atmo-rate: 150s;                           /* ambient duration       */
}
```

`--atmo-1` / `--atmo-2` feed **one shared body-level layer** that already exists
(`--body-wash`), so eight biomes cost eight small token blocks and **one** composited
layer — not eight background implementations.

### What a biome block may NOT set

- **Never `--color-signal` or `--color-signal-dim`.** Amber is the only signal on the
  site and it must stay identical page to page (rule 2). A biome changes *atmosphere*
  depth, not the accent.
- **Never any step of the `--color-facility-*` ramp's lightness.** That ramp is
  contrast-tuned — `--color-facility-500` sits at L 0.66 specifically because 0.55 failed
  WCAG AA. Hue/chroma shifts are allowed; lightness changes are not, and any change
  requires recomputed contrast ratios (rule 12).
- **Never a per-section override.** If a section needs to differ, the page has the wrong
  biome.
- No new fonts, no radius changes (the site is 701/701 at radius 0 — better than the
  benchmark), no new dependencies.

## The motion vocabulary — six primitives, that is all

Every biome reuses this same set. No page invents its own animation. This is what keeps
25 pages from becoming 25 performance risks.

| Primitive | What it does | Cost |
|---|---|---|
| `.boot` | Entry transition: a ~400ms scanline sweep plus the page's first readout locking in. Diegetic "system online", not a fake progress bar | 0 KB JS, `transform` only |
| `.drift` | Ambient background movement, **90–180s**, `transform` only, one layer. Dead by Daylight runs 90s and 180s loops | 0 KB JS, 1 composited layer |
| `.draw` | SVG `stroke-dashoffset` driven by `animation-timeline: view()` — for schematics, meters, line art | 0 KB JS |
| `.count` | Numeric count-up on `view()`, using `@property` so the number is animatable | 0 KB JS |
| `.rise` | The existing scroll reveal: 24px rise, 600ms, `cubic-bezier(.215,.61,.355,1)`, 80ms stagger | 0 KB JS, already shipped |
| `.focus` | An image's grade shifts on hover or on entry (the "camera focusing") | `filter` is **not** compositor-only — cap at **4 nodes per page** |

### 🚨 The one absolute prohibition

**Never put the hero, or any above-the-fold element, behind `opacity: 0`,
`clip-path: inset(…100%…)`, a fully transparent start mask, or an `.boot` that starts
invisible.** Zero visible area at first paint makes Chromium record LCP at *scroll* time
and can literally cause a multi-second LCP. This site's LCP P90 is already 4,360 ms.

**`.boot` must play around the hero, never over it.** The hero is fully visible at first
paint. Reveals below the fold only. This rule has already been broken once on this project
and is recorded in `_design-lab/redesign-spec.md`.

### Also required

- **Every primitive is inert under `prefers-reduced-motion: reduce`** (rule 5). The page
  must be complete and attractive with all motion off.
- **No second `animation` shorthand on an element that already has one.** A previous agent
  nearly broke the hero this way — `.hero-cine-bg img` already owns `hero-drift`.
- **Never `animation-delay` on a progress timeline** (`view()` / `scroll()`). A
  time-valued delay there consumes part of a range whose duration is `auto`, which is the
  documented way to make a scroll-linked animation never fire. Stagger via `--i` on a
  transition instead, or via `animation-range`.
- **`transform` and `opacity` only** (except `.focus`, capped). Anything else forces
  layout or paint per frame.

## The eight biomes

| Biome | Pages | Room / system | Atmosphere | Motion | The interaction |
|---|---|---|---|---|---|
| `hub` | `/` | Central Room | Amber globe glow — the one warm room | `drift` 120s | Already built |
| `cold` | `/guide/`, `/faq/`, `/blog/`, `/blog/*`, `/press/` | The Briefing / the manual | Neutral, archival, minimal | `rise` only — deliberate calm | A spec table as a design object |
| `blueprint` | `/guide/map/`, `/guide/numbers/` | Schematic / data core | Cold blue, dense | `draw` + `count` | Rooms highlight as you pass; numbers count up as they enter |
| `red` | `/guide/jingles/`, `/guide/danger/`, `/404` | His territory / threat assessment | Red, predatory | `drift` 90s + an approach | A distance bar that **closes** as you scroll |
| `green` | `/guide/worm/` | Subterranean, seismic | Sickly green | Low-amplitude displacement | A rumble meter that spikes at the bell section |
| `amber` | `/guide/crushers/`, `/guide/scrap/`, `/codes/`, `/play/` | The machines / weigh station / keypad / airlock | Amber-lit industrial — the loudest pages | Stepped, percussive, snappy | Items tick onto a scale; the console wakes |
| `signal` | `/community/`, `/creators/`, `/videos/`, `/screenshots/` | Comms array / uplink / playback / archive | Signal blue, outward | Transmitting bars, slow dish rotation | Live counts as a radio readout; tiles "focus" |
| `roster` | `/guide/with-friends/`, `/about/`, `/guide/capture-and-rescue/` | Muster point / personnel file / pod bay | Warm-neutral, assembling | A roster filling | Slots assemble as you scroll; the pod timer runs |

`/guide/hiding/` is a deliberate special case — see below.

### The one bespoke page

**`/guide/hiding/`** earns a unique treatment because its subject *is* darkness: the page
loads near-black and the reader's cursor is the torch. The site already has a working
torch/proximity effect on `/404`, so this reuses proven machinery rather than inventing
any. It must still degrade to a fully readable static page with JS off or reduced motion
(the existing 404 implementation already handles this — copy its guarantees).

## Build order

**Do not build 25 pages at once.** Ship three, look at them, then roll out.

**First slice — chosen because they are three genuinely different motion languages, so
they prove the system rather than just decorating it:**

1. **`/guide/map/`** — `blueprint`. The floor plan **draws itself** with `.draw` as you
   scroll, and rooms highlight as you pass. Proves `.draw`, `.count` and per-page tokens.
2. **`/guide/jingles/`** — `red`. A slow **approach**: the Hunter's distance bar closes
   over the course of the page, and the layout tightens as it does. Proves the `drift`
   variant plus a scroll-linked readout.
3. **`/guide/crushers/`** — `amber`. **Mechanical**: stepped, percussive motion, noise
   bars, a console that wakes. The loudest page on the site. Proves the system can carry a
   completely different rhythm without new machinery.

Then, if it lands: `green` (`/guide/worm/`), then `/guide/hiding/` as the special case,
then sweep the remaining pages.

## Verification required for every page

1. The LCP element is **fully visible at first paint** — grep every rule that could gate
   it and show the output.
2. Every primitive is disabled under `prefers-reduced-motion: reduce` — show each rule.
3. **One composited layer per page.** Count them.
4. No new colour literals: every colour is a `var(--color-*)` or a `color-mix()` of one.
5. `--color-signal` and the `--color-facility-*` lightnesses are **unchanged**. Show the
   diff of the token block.
6. Contrast ratios for text against the page's own biome surface — report the numbers.
7. No new dependency. JS still in the low single-digit KB.
8. Measured before/after page height and, if a browser is available, a screenshot pair.

## Related

- `site/CLAUDE.md` — the binding design contract
- `site/docs/research/design-teardown.md` — the measured values every decision here cites
- `site/docs/research/homepage-redesign-spec.md` — the homepage rebuild this extends
- `site/docs/research/imagery-patterns.md` — the `.plate` monitor framing
