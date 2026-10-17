# Performance contract — rules for creative work, and the baseline it is measured against

Written 2026-10-17. Two audiences:

- **Part 2 and 3 are for whoever does the creative work** (Antigravity). Follow them and the
  work ships clean; break them and the work gets reverted.
- **Part 1, 4 and 5 are the measurement side.** They say what "good" currently is, how it is
  measured, and which numbers are trustworthy.

The point of this file: **the creative work and the performance work must not negotiate
after the fact.** Every rule below exists because of a specific measured failure, and the
reason is given so it is not cargo-culted.

---

# Part 1 — The baseline

Three sources, with different trust levels. Do not mix them.

## 1a. Field data — the only numbers that describe real users

From Cloudflare RUM (30 days):

| Metric | Value |
|---|---|
| LCP | **P50 480ms · P75 1,948ms · P90 4,360ms · P99 5,492ms** |
| Poor-rated loads | **13%** |
| CLS | **0.014** |
| INP | green |
| Page load time | 699ms |
| Traffic | 190 visits / 210 page views |

**The 9x gap between P50 and P90 is a latency signature, not a payload signature.** It means
the slow tail is slow devices, cold caches and bad networks — not too many bytes. Do not
expect a byte reduction to fix the tail.

## 1b. Lab baseline — median of 3 runs, host idle, 1440x900, no throttling

`node scripts/audit-perf.mjs --label baseline-true --runs 3`

| Page | LCP median | LCP spread | CLS | Weight | Requests | Images | Inline CSS |
|---|---|---|---|---|---|---|---|
| `/` | 1468ms | 97% | 0.000 | 328KB | 12 | 275K | 64K |
| `/guide/map/` | 660ms | 112% | 0.000 | **433KB** | 24 | **380K** | 69K |
| `/guide/jingles/` | 808ms | 48% | 0.000 | 104KB | 12 | 50K | 67K |
| `/guide/crushers/` | 840ms | 107% | 0.000 | 91KB | 9 | 38K | 70K |
| `/guide/numbers/` | 356ms | 14% | 0.000 | 57KB | 8 | 4K | 64K |
| `/screenshots/` | 416ms | 20% | 0.000 | 709KB | 45 | 656K | 64K |
| `/faq/` | 360ms | 15% | 0.000 | 57KB | 8 | 4K | 64K |

**Means: LCP 701ms · weight 254KB · CLS 0.000 · JS 1KB per page · 0 render-blocking
stylesheets · 0 render-blocking scripts.**

## 1c. What the site already does better than most premium sites

- **1 KB of JavaScript per page.** Zero frameworks. The 13-site design teardown found no
  premium reference ships GSAP, and this site ships a third of what they do.
- **Zero render-blocking resources.** No external stylesheet, no synchronous script.
- **CLS 0.000 on every page** in the lab, 0.014 in the field.
- **224 AVIF images at 29.9% smaller** than their WebP twins, with WebP as fallback.
- **Fonts subsetted to 53,176 B** from 87,092 B, with advance widths proven byte-identical.

## 1d. The noise floor — read this before believing any diff

Measured run-to-run on this host, same page, same code:

| Metric | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| `/` LCP | 1408ms | 1468ms | 2776ms |
| `/guide/map/` LCP | 512ms | 660ms | 1084ms |
| `/screenshots/` weight | 617KB | 375KB | 709KB |

Two distinct causes, both structural:

- **LCP swing** — `font-display: swap` re-triggers LCP when the webfont arrives, so LCP
  partly measures font arrival time. The harness records both `lcpFirst` (what painted
  first) and the settled value, because reporting only one hides a font regression.
- **Weight swing** — `loading="lazy"`. How many images load depends on how many happen to
  finish inside the settle window, so raw weight is only comparable at a fixed scroll
  position. Treat weight as a **trend**, not a precise figure.

**Consequence: an LCP diff under ~50% is not signal. A weight diff under ~10% is not signal.**
Everything below those thresholds is noise and must not be reported as a regression.

---

# Part 2 — Rules for creative work

Follow these and the work ships first time. The reason is given for each so it is
understandable rather than arbitrary.

## R1. Never gate the largest element above the fold

**No `opacity: 0`, no `clip-path: inset(… 100% …)`, no `mask` that starts fully transparent,
no `visibility: hidden`, no entry animation that begins invisible — on anything in the first
viewport.**

Reason: zero visible area at first paint makes Chromium record LCP at *scroll* time. This
single mistake can **cause** a multi-second LCP. It has already been broken once on this
project, and the current median LCP of 701ms is the thing that would be lost.

Reveals below the fold only. The hero is fully visible from frame one.

## R2. Animate `transform` and `opacity` only

Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`,
`border-width` or `box-shadow` — not on scroll, not on hover of large elements.

Reason: everything else forces layout or paint every frame. `transform` and `opacity` are the
only two properties the compositor can handle alone.

## R3. `filter` and `backdrop-filter` have a hard budget

- `filter` on **at most 4 nodes per page**. It is not compositor-only in Chromium and
  re-rasterises the element.
- `backdrop-filter` on **floating layers only** — sticky header, mobile menu, lightbox
  chrome, sticky rails. Never on a content panel.
- **Blur <= 6px.** The 13-site teardown measured premium dark sites at 2.4px (GTFO) and 4px
  (Dead by Daylight). The site currently uses 14px, which is heavier than every dark
  reference and is real paint cost on mid-range Android.

Reason: a backdrop-filter over a large area is one of the most expensive compositing
operations there is, and it is invisible on a flat background anyway.

## R4. No new JavaScript. The budget is 1 KB.

The site ships **1 KB of JS per page**. Anything that adds a library (GSAP, Motion, three.js,
Lenis, a carousel, a lightbox) must be:

- **lazy-loaded** — after first paint, in its own chunk, never in the critical path, and
- **justified in one sentence** — what it does that CSS cannot, and
- **declared** — say the added gzipped byte count.

Anything that adds more than 5 KB globally is rejected by default. GSAP's real advantage on
this site is limited to Flip / SplitText / MorphSVG; reveals, drift and parallax are already
CSS and already 0 KB.

## R5. No new dependencies.

## R6. Every animation inert under `prefers-reduced-motion: reduce`

Not "slower" — **disabled**, with the page remaining complete and attractive. There must be an
explicit named disarm block, not just a hope.

Reason: design contract rule 5, and accessibility is not optional.

## R7. Images

- **AVIF with a WebP fallback** via `<picture>`; the existing `Shot.astro` already does this
  and should be reused rather than hand-rolled.
- **Explicit `width` and `height`** on every image. CLS is currently 0.000 and stays there.
- `loading="lazy"` **below the fold only**; the hero stays `eager` + `fetchpriority="high"`.
- **At most one image above 1280px above the fold.**

## R8. Never add a second `animation` shorthand to an element that already has one

A CSS `animation` shorthand resets the whole property, so adding one silently cancels the
existing animation. `.hero-cine-bg img` already owns `hero-drift` — this nearly broke the
hero once.

## R9. Never put `animation-delay` on a progress timeline

On `animation-timeline: view()` or `scroll()`, a time-valued delay consumes part of a range
whose duration is `auto`. That is the documented way to make a scroll-linked animation
**never fire**. Use `animation-range`, or a `--i` stagger on transitions.

## R10. The inline CSS is already 64–70 KB per page

It is inlined deliberately (it removes a render-blocking request), but it is **uncacheable**,
so every page view re-downloads it. Adding a lot more inline CSS makes an existing trade-off
worse. If a change adds inline CSS, say roughly how much. Prefer a shared stylesheet when the
addition is large.

## R11. Do not touch the amber accent or the facility ramp's lightness

- `--color-signal` is the only accent and is identical on every page. A biome may change
  atmosphere depth, never the accent.
- `--color-facility-*` is contrast-tuned: `facility-500` sits at L 0.66 **because 0.55 failed
  WCAG AA**. Hue and chroma may shift; lightness may not, and any change requires recomputed
  contrast ratios (>= 4.5:1).

## R12. Never type a game number

Every game fact lives in `src/data/game.ts` and is imported. Numbers typed into prose are how
the site claimed 7 players per server when the game supported 6.

## R13. Report numbers, not adjectives

"Feels fast" and "smooth" are not data. Report the measured diff (Part 3).

---

# Part 3 — Pre-flight: what to run before calling it done

Every creative change is checked with the same command:

```
node scripts/audit-perf.mjs --label ag-<feature-name> --runs 3 --diff baseline-true
```

It prints, per page, every metric that moved, sorted by relative change. **Paste that output
with the change.** Then confirm:

- [ ] No above-fold element gated behind `opacity: 0` / `clip-path` / `mask` (R1)
- [ ] Only `transform` and `opacity` animated (R2)
- [ ] `filter` count per page <= 4; no new `backdrop-filter` on a content panel (R3)
- [ ] JS delta declared in KB; zero new libraries, or justified and lazy (R4)
- [ ] Every animation disabled under `prefers-reduced-motion: reduce` (R6)
- [ ] Images: AVIF+WebP, explicit dimensions, lazy below fold (R7)
- [ ] No second `animation` shorthand; no `animation-delay` on a view/scroll timeline (R8, R9)
- [ ] Inline-CSS delta stated (R10)
- [ ] Accent and facility lightness untouched (R11)
- [ ] No typed game numbers (R12)

**If any metric moves by more than the noise floor and the change is not the cause, say so
in the same message rather than letting it be found later.**

---

# Part 4 — How the rounds work

1. **Ship one visual idea per increment.** Not five. If ten things change at once and LCP
   regresses, nobody can attribute it, and the whole increment gets reverted instead of the
   one bad rule.
2. **One label per increment** — `ag-hero`, `ag-glass`, `ag-guide-motion`. That is what makes
   `--diff` meaningful.
3. **Measure before saying done**, with the command in Part 3. Three runs, not one.
4. **Review compares medians and reports only differences above the noise floor.**
5. **Regressions get one round of fixing, then revert.** A revert is not a failure; a site
   that got 40% slower for a visual effect is.

---

# Part 5 — Known leaks and watch items

Measured today. Do not make these worse, and mention it if a change touches them.

| Item | State | Note |
|---|---|---|
| **Inline CSS** | **64–70 KB on every page**, uncacheable | The largest structural cost on the site. Externalising it is a real experiment. |
| **`/guide/map/`** | **433KB · 24 req · 380KB images** | Newly heavy after the biome redesign. The page's motion is an SVG schematic, so 380KB of images is almost certainly not all above the fold. **Investigate.** |
| `/screenshots/` | 709KB · 45 req · 656KB images | A gallery — expected. Watch that everything below the first screen is lazy. |
| `/` | 328KB · 275KB images | The hero plus framed stills. Check the hero is not serving 1920 to small viewports. |
| LCP spread 97–112% on `/`, `/guide/map/`, `/guide/crushers/` | Noise | Only diffs above ~50% are signal. |
| JS | 1 KB | The site's biggest advantage. Protect it. |
| AVIF | 224 files, 29.9% smaller than WebP | 10 files are *larger* than their WebP twin (very dark 640px) — benign, total excess 4 KB against a 3.1 MB saving. |

## The three experiments worth running, in order

1. **Externalise the inline CSS** and measure. 64–70 KB uncacheable on every page is the
   biggest single number on this site.
2. **Trim `/guide/map/`'s images.** 380 KB on a page whose hero motion is a drawing is the
   clearest win available right now.
3. **Reduce the header blur** from 14px toward the 2.4–4px the premium references actually
   use, and measure whether anyone can see the difference.

---

## Related

- `site/CLAUDE.md` — the binding design contract (rules 1-14)
- `site/docs/BIOMES.md` — the per-page biome system and its six motion primitives
- `site/docs/research/design-teardown.md` — the measured values every number here cites
- `site/scripts/audit-perf.mjs` — the harness; `--help` semantics are in its header
