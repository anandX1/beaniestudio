# STATIC homepage — visual redesign spec

**Target:** `beaniestudio.site` (homepage `/`), Astro 5 + Tailwind v4, `site/src/pages/index.astro`
**Method:** every number below was measured on the **live production site** in headless Chrome (CDP) at 1440×900 and 390×844 on the day of writing — computed styles, live DOM census, resource timings and LCP/CLS observers. Raw captures: `live-1440.json`, `live-390.json`, `lcp-1440.json`, `weight-1440.json`. Nothing here was inferred from reading the source alone, though the source was read afterwards to name components.
**Nothing in `beaniestudio-site/` was modified.** All work is in `_design-lab/`.

---

## 0. Corrections to the brief, before anything else

Two premises in the brief are wrong, and the redesign changes shape because of it.

1. **The homepage is not prose-heavy.** Total rendered body text is **1,943 words**, including nav, footer and all 22 headings. The single longest paragraph on the whole page is **41 words** (the hero deck); the second is 26. There is no "large block of prose" anywhere.
   The real problem is the inverse: **20.73 viewports of document for ~1,379 words of home content — 69 words per viewport on mobile.** The page is not too wordy, it is *too long for what it says*. Cutting words is not the lever; deleting viewport-height is.

2. **The type problem is not "8–10 sizes".** It is **17 distinct rendered font sizes at 1440px and 18 at 390px — 21 across the two breakpoints**, from 9.6px to 158.4px. The `@theme` block only defines three families; every one of those 21 sizes is written inline in page markup as a Tailwind utility (`text-[0.68rem]`, `text-[0.62rem]`, `text-xs tracking-[0.3em]`, `text-9xl`, …). There is no type scale to trim — there is *no type scale*.

Two physical constraints that I could not verify, and am not guessing at:
- **`backdrop-filter` renders as `none` in this headless configuration** (no GPU). I therefore cannot confirm the header's glass visually; I can confirm from source that `blur(14px) saturate(1.4)` is declared on exactly two selectors (`.glass`, `.site-header`) and used on exactly two floating layers (header, mobile menu) — rule 14 is respected.
- **The mixed-exposure grading problem** was out of scope by instruction. I did not evaluate it.

---

## 1. Diagnosis of the current homepage

### 1.1 Shape

| metric | 1440×900 | 390×844 |
|---|---|---|
| document height | 18,660px | 18,172px |
| **viewports long** | **20.73** | **21.53** |
| rendered body words | 1,943 | 1,943 |
| words per viewport | 94 | 69 |
| headings | 22 | 22 |
| `<img>` in DOM | 76 (72 lazy, 2 eager) | 76 |
| first paint fetches | 7 images | 2 images |
| full-scroll transfer | **1,745 KB** (1,624 KB images / 40 requests) | — |

`loadMs` in my cold headless run was 15.1s and LCP 11.8–12.5s; those are lab numbers on a cold profile and are **not** field data. The brief's field LCP P90 of 4,360ms is the number to design against.

### 1.2 Type: 21 sizes, four of them doing the same job

Every distinct size actually rendered, unioned across both breakpoints:

`9.6 · 9.92 · 10.88 · 11.2 · 11.52 · 12 · 13.6 · 14 · 16 · 18 · 20 · 24 · 30 · 36 · 48 · 54.4 · 64 · 72 · 96 · 128 · 158.4`

Grouped by what they are used for, the duplication is the finding:

- **Mono micro-labels: 7 sizes** — 9.6, 9.92, 10.88, 11.2, 11.52, 12, 13.6px. All uppercase or tracking-modified, all at ≤0.05 of each other, all doing the same job. Tracking runs from +0.12em to **+0.30em** (`.kicker` is 0.28em, `.noise-label` 0.24em, ticker 0.3em) — the benchmark band is **+0.05 to +0.12em**, so labels are **2.3–2.8× too wide**, which is why 11px mono reads as texture rather than as a label.
- **Section headings: 5 sizes** — H2s at 48px (×6) and one at 36px (mobile 30px); H3s at 48, 36, 30, 18 and 16px. The video-card H3s (16px) are *the same size as body text*; the roadmap/community H3s are 18px. A reader cannot tell a subsection from a card title from a caption.
- **Hero/display: 3 sizes** — 158.4px (kinetic band), 128px (H1), 96px.
- **Display-to-body ratio: 8×** (128px H1 / 16px body), and the kinetic band reaches **9.9×**. The measured benchmark across 13 premium sites is **2.4–4×**.
- **Leading**: hero H1 is `leading-none` (1.0 — correct for a poster); `.display` followed by `mt-2` on a 30px tagline is fine; but `.prose-guide` uses 1.75 and the page body copy sits at 1.5–1.55 (in band, 1.4–1.6).

### 1.3 Spacing: the section rhythm is 96px, and it lives in the wrong element

16 of 18 top-level sections have **`padding-block: 0px`** — the rhythm is carried by inner wrapper `<div>`s. Measured wrapper padding-block values at 1440:

| padding-block | count | Tailwind |
|---|---|---|
| 96px | **7** | `py-24` |
| 112px | 1 | `py-28` |
| 80px | 1 | `py-20` |
| 64px | 2 | `py-16` |
| 56px | 1 | `py-14` |
| 40px / 14.4px | 12 | `.shot-caption` (not a section) |

So the real rhythm is **96px**, with two one-off values. The teardown band for premium dark sites at 1440 is **110–225px** (GTFO 176–220, Raycast 224, Linear 128, DBD 120). This site sits **below the floor of the band**, and because the padding is scattered across wrapper divs there is no single value to raise.

### 1.4 Colour: the accent is on 26% of text, and there are two ambers

Measured text-node census at 1440 (259 elements that directly own visible text):

| computed colour | token | text elements | share |
|---|---|---|---|
| `oklch(0.75 0.015 240)` | facility-300 | 74 | 28.6% |
| `oklch(0.95 0.005 240)` | facility-100 | 69 | 26.6% |
| **`oklch(0.62 0.12 75)`** | **signal-dim** | **36** | **13.9%** |
| **`oklch(0.78 0.15 75)`** | **signal** | **32** | **12.4%** |
| `oklch(0.66 0.02 240)` | facility-500 | 31 | 12.0% |
| `oklch(0.16 0.012 240)` | facility-950 (on amber buttons) | 6 | 2.3% |
| `oklch(0.62 0.19 25)` | status-red | 2 | 0.8% |
| `rgba(0,0,0,0)` | transparent (clipped/overlaid) | 8 | 3.1% |
| `oklab(0.95 … / 0.85)` | facility-100 at 85% | 1 | 0.4% |

- **Amber-family text = 68 of 259 = 26.3%.** The benchmark is **≤10%**, and GTFO — the amber reference — measures **~6%** (20 of 301 text nodes). This site is **4.4× over the reference**.
- The cause is structural: there are **two amber tokens used interchangeably as text**. `--color-signal-dim` is not an "interaction" colour, it is a second body-text amber. `.kicker`, every `.panel::before/::after` bracket (16 amber-dim border segments measured), and every `borderColor` count of 16 come from it.
- **5 solid-amber filled buttons on the homepage** (9 solid `oklch(0.78 0.15 75)` backgrounds measured): hero *Play free*, *Join the Discord* (`FollowSection`), *Share STATIC* (`FollowSection`), the final *Play free*, plus `SiteFooter`'s *Play STATIC on Roblox*. **Four of them are in `<main>`.** When there are four primaries there is no primary.
- Colour-token count: **16 colour tokens in `@theme`** across **5 hues** (240 surface ramp ×9 steps, 75 amber ×2, 25 red, 155 green, 230 blue). GTFO runs **7 colour tokens total**. The 9-step surface ramp is a legitimate ramp; the two-ambers-one-hue and the unused green/blue are not earning their place on the homepage (status-green and status-blue render **zero** times on `/`).
- Backgrounds in play: **13 distinct**. Note `.atmo-red`, `.atmo-amber`, `.atmo-blue` in `global.css` — **the site already has the "new background per section" pattern**, and it uses it twice on the homepage (`.atmo-amber` on the numbers band and on the threats section, `.atmo-red` on Jingles). That is the vector the Halloween brief warns about, already present.

### 1.5 Radius: clean, and the depth model is already right

- **701 of 701 elements have `border-radius: 0`.** There is not one non-zero radius on the entire page. This is *better* than the benchmark (which expects 0px to dominate by 10–30×, not to be unanimous).
- Depth is already `inset 0 1px 0 0 oklch(1 0 0 / 0.05)` + one long shadow, exactly as the teardown describes, and there is **no rounded-2xl soft-shadow card anywhere**. Rule 7's `.panel` corner brackets are the only decorative amber in the depth layer — 7 panels × 2 brackets × 2 sides = **28 amber-dim border segments** on the homepage.

### 1.6 Motion, CTA and image-accounting findings

- **20 distinct keyframe animations running**, 51 elements on `animation-timeline: scroll()/view()`. This is CSS-only (0 KB JS) — correct per rule 5 and correct per the teardown (GSAP: 0 of 13 sites).
- Hover/press transitions are **180–600ms** (`.btn-primary` 180ms, `.shot-link img` 600ms). The measured band is **75–100ms**.
- Reveal shape is `translateY(40px) scale(0.98)` at 700ms with 60–120ms stagger. The benchmark is `translateY(24px)` + opacity at 400–700ms with **80–100ms** stagger — the shape is close; the `scale(0.98)` and the `scale(1.14)` on `.reveal img` are the parts to drop.
- **26 distinct screenshots of the 80 are referenced on the homepage** (counted from the deployed HTML: 26 families across 276 `srcset` variants). Of those, **8 appear only inside the ribbon** — a 288px-wide marquee inside `aria-hidden="true"` with `tabindex="-1"` that scrolls past in ~2.9s (novel to the ribbon: `cargo-dock-floor`, `reactor-tanks`, `storage-bay-forklift`, `control-room`, `medbay-red`, `hunter-reveal`, `cargo-dock-bay`, `reactor-door`). The showcase spends 20 of its 40 slots on **8 repeats**, and its only novel images are unreachable textures.
- **`crusher-console` is used as the image for both step 02 (Crush) and step 03 (Calibrate)** — the same screenshot twice, back to back, in a four-step sequence. On desktop the sticky crossfade shows it twice; on mobile (`.step-inline`) the user sees the same image twice in a row.
- The numbers band (`STATIC in numbers`) spends **a gauge SVG arc, an icon, a `@property --n` counter animation and 6,000px² of amber unit text** to deliver four integers — 19 words across 412px.
- **What is genuinely good and must survive the redesign:** the hero. It has a real composition (gradient scrim, Jingles cutout standing in a light pool, one amber CTA, mono fact row), it loads the LCP image with `fetchpriority=high` + `<link rel=preload>`, and **measured LCP is the hero image itself with `opacity: 1` and `clip-path: none`** — the thing most redesigns break.

### 1.7 Verdict: which sections earn their length

Ranked by "content per viewport" (words + images ÷ viewports, at 1440):

| # | section | vp | words | imgs | info/vp | verdict |
|---|---|---|---|---|---|---|
| 1.05 | **Videos** | 1.37 | 216 | 4 | 161 | **Earns it.** Densest section on the page. |
| 1.14 | **Roadmap** | 0.78 | 113 | 0 | 145 | Earns it *as a list*; 5×23-word entries is more than it needs. |
| 1.16 | **Community (FollowSection)** | 0.94 | 126 | 0 | 134 | **Filler as a section.** Duplicates the footer's Discord/YouTube/Roblox links (verified: `SiteFooter.astro` has all three + a Play CTA). |
| 1.12 | **Comparison table** | 0.85 | 103 | 0 | 121 | Earns the *information*, not the 767px. A 3-col table with only 2 real columns. |
| 1.15 | **Team** | 0.69 | 68 | 0 | 99 | **Filler.** `SiteFooter` already says "a three-person team"; `/about/` already has all three with emails. |
| 1.07 | **Jingles** | 1.01 | 93 | 3 | 95 | **Earns it.** Best content-to-length ratio of the image sections. |
| 1.08 | **Threats (Worm + Pod)** | 1.01 | 88 | 2 | 89 | **Earns it.** |
| 1.01 | **Hero** | 1.00 | 76 | 2 | 78 | **Earns it.** Unanimously the strongest block. |
| 1.09 | **Endings** | 0.76 | 50 | 4 | 71 | **Filler.** `result-escaped` already appears in step 04 *Escape*; the other three are UI screenshots of a results card. |
| 1.10 | **Screenshot ribbon** | 0.65 | 5 | 40 | 69 | **Filler as built.** 40 `<img>` for 5 words, inside `aria-hidden`. |
| 1.17 | **Final CTA** | 0.50 | 31 | 1 | 62 | Earns it. |
| 1.05 | **Tour the bunker** | **4.84** | 224 | 8 | 48 | **Does not earn 4.84 viewports.** A pinned horizontal scroll-jack that spends 23% of the page to show 8 images and 8×28-word blurbs — all of which are already structured as `/guide/map/`. |
| 1.03 | **Numbers band** | 0.46 | 19 | 0 | 41 | **Does not earn the machinery.** 4 integers, delivered with a gauge SVG + counter + icons. |
| 1.06 | **Kinetic type band** | 0.49 | 14 | 0 | 29 | **Cut.** `aria-hidden="true"`, zero information, 158.4px type, and the only source of the 9.9× display ratio. Pure decoration occupying half a viewport. |
| 1.04 | **How a round works** | **3.87** | 101 | 8 | 28 | **The worst offender.** 3.87 viewports — 19% of the page — for four 25-word sentences, 4 of whose 8 images are duplicates of 4 others (2 of them the *same* screenshot twice). |
| 1.13 | **Parallax divider band** | 0.60 | 0 | 1 | 2 | **Cut.** 540px of image, 0 words, 0 function. |

**Totals: the two pinned/sticky sections (`how-to-play` 3.87vp + `tour` 4.84vp) consume 8.71 viewports — 42% of the homepage.** The five blocks I would remove outright (kinetic 0.49, parallax 0.60, endings 0.76, team 0.69, community 0.94) consume another **3.48 viewports = 17%**. Together, **59% of this page's scroll length is either a scroll-jack or a duplicate of something the footer or `/about/` already says.**

---

## 2. Section-by-section redesigned homepage

**Architecture, per the owner's direction:** *hook → two or three visual content pages → CTA.*
Read literally, the homepage becomes a **hub**: one hook, then three image-led doors into the three real visual pages that already exist (`/guide/map/`, `/guide/jingles/`+`/guide/worm/`, `/videos/`), one short proof block, then the CTA. Every door is a promise the destination keeps.

**Result: 20.73vp → ~9.4vp (−55%).** Words of home copy ~1,100 → ~640. Sections 12 → 9.

Conventions used below: *length* is measured in viewports at 1440×900, with mobile (390×844) after the slash. Each section's eyebrow follows the mono-readout system in §3 — **and carries no index number**, because one block (§08) has no eyebrow and a numbered sequence with a gap in it is worse than no numbers. The numbers that survive are the ones that mean something: step `01–04` and room `01 / 08`.

---

### 01 · HOOK — Hero
- **Purpose:** in one screen, tell a stranger what this is and let them play it.
- **Length:** 1.0 / 1.26 vp (unchanged — this is the one block at the right size).
- **Text-led or image-led:** image-led (full-bleed graded still + cutout).
- **Contains:** status line (`.eyebrow`: amber tick + "FREE ON ROBLOX · BETA OUT 10 OCT 2026") · `h1.display` **"STATIC — Salvage vs Hunter"** at 72px (was 128px) · `.lead` — the existing 41-word deck, cut to ~30: *"A free co-op horror game on Roblox. Up to 6 players search an abandoned bunker for scrap and haul 400 kg of it to the crushers. One more player is Jingles, the Hunter — and Jingles is faster than you."* · **one** `btn-primary` "Play free on Roblox" · the four facts as a `.strip-row` readout: `4–6 SCRAPPERS VS 1 HUNTER · ROUNDS UP TO 20 MIN · PC + MOBILE` · Jingles cutout.
- **Replaces / deletes:**
  - **Deletes the "Tour the bunker ↓" secondary button.** Two adjacent buttons of near-equal weight halve the primary. The map door is section 04, one scroll down.
  - **Deletes the 39px scrolling ticker.** A 42s marquee of six 11.2px facts means a visitor reads two of six. Those facts become the static `.strip-row` above — same content, 0 viewports, and now actually readable (the owner's "reading titles and getting the info").
  - **Deletes the `128px` H1 and the `158.4px` kinetic band**, cutting the display-to-body ratio from 8–9.9× to 4.5×.
  - Retunes the hero image `sizes` so a 1440 viewport gets the **1280** file (61 KB) instead of the **1920** file (106 KB).

---

### 02 · THE JOB
- **Purpose:** the entire objective in one glance — four numbers and their units.
- **Length:** 0.35 / 0.5 vp.
- **Text-led or image-led:** type-led, no image. Zero cards.
- **Contains:** `.eyebrow` "THE JOB" + one `.h2`: **"Find 400 kg of scrap. Crush it. Get out."** Below it, a 4-cell `.strip-row` of `.readout--xl` values at the **h2 size (40px)** in the display face with `tabular-nums`: **400** KG · **3** CRUSHERS · **13** MINIGAMES · **20** MIN ROUNDS, each with a `.label` under it.
- **Replaces / deletes:** replaces the `STATIC in numbers` band (412px, 19 words) and folds in the deleted ticker.
  - **Deletes the gauge SVG arc** (`<svg>` + `gauge-fill` animation + `@property --arc`) — an arc that fills on scroll measures nothing.
  - **Deletes the count-up counter** (`@property --n` + `counter-reset` + `count::before`) and its `@keyframes count-up` — an animated 400 is not more informative than a printed 400, and the counter stamps the real number into a visually-hidden span, which is a fragile pattern.
  - **Deletes 4 `Icon.astro` SVGs** and the `stat` card wrapper (gradient + border + `overflow: hidden`).
  - **Deletes `.atmo-amber`** from this band — no per-section background wash.

---

### 03 · THE ROUND — how a round works
- **Purpose:** the four verbs of a round, in order, scannable as headings.
- **Length:** **1.4 / 1.5 vp** (from 3.87 / 3.01).
- **Text-led or image-led:** text-led, with one thumbnail.
- **Contains:** `.eyebrow` "THE ROUND" + `.h2` **"Find it. Haul it. Crush it. Get out."** (this heading already carries the information — keep it verbatim; it is the best headline on the site). Then a **4-column hairline grid** (no cards): each cell = mono step index `01`–`04`, `.h3` verb, one 12-word line, one `.link`. Cells divided by 1px `--hairline` rules. One shared 16:9 still at the section foot — **not four images**.
  - `01 SCAVENGE` — "14 kinds of scrap, 3 kg to 140 kg. Two backpack slots; heavy stuff goes in your hands."
  - `02 CRUSH` — "3 crushers, random spots, 400 kg to feed. Crushing is loud."
  - `03 CALIBRATE` — "7 minigames per console, from a pool of 13. Fail one and it faults."
  - `04 ESCAPE` — "The Intake Chute opens for 60 seconds. Make it and a UFO beams you out."
- **Replaces / deletes:** replaces the sticky scrollytelling `.story` block.
  - **Deletes the 4-frame sticky crossfading media column** (`.story-media`, `.story-step` `view-timeline-name`, `@keyframes st-fade`, `@keyframes step-focus`, `timeline-scope`). That single deletion is **2.5 viewports** and 4 duplicate image loads.
  - **Deletes the duplicate `crusher-console`** (steps 02 and 03 currently share one file) and the 4 mobile `.step-inline` images (which re-show the same 4 shots already in the media column).
  - **Deletes the `.rise` scale** and the `.step-num` outline numeral (80px of transparent text with a 1px stroke, repeated 4×, reading as decoration over a heading that already says the number).
  - Detail moves to `/guide/` and `/guide/crushers/`, which already exist and are the SEO engine.

---

### 04 · VISUAL DOOR 1 — The bunker (the map)
- **Purpose:** show the place. This is the section that sells the game to someone who will never read a bulleted list.
- **Length:** **1.6 / 1.4 vp** (from 4.84 / 0.86).
- **Text-led or image-led:** heavily image-led.
- **Contains:** `.eyebrow` "THE MAP" + `.h2` **"One map. Eight rooms. No safe corners."** + 8 room tiles in a **3-column grid at 1440** (3 rows), radius 0, hairline-ringed, each: the room's best shot at ~400×225px rendered (up from 288px in the ribbon), a `.label` `01 / 08`, the room name in `.h3`, and **one line** of the existing blurb cut to ~12 words. Each tile is a whole-tile link to `/guide/map/#<slug>`. Below: `.strip-row` foot with "8 rooms, 44 screenshots" + `btn-secondary` → `/guide/map/`.
- **Replaces / deletes:**
  - **Deletes the pinned horizontal scroll-jack** (`.tour` height formula `calc(var(--tour-count) * 48svh + 100svh)`, `.tour-pin` sticky, `.strip` `tour-slide` animation, `.tour-progress`, the `@supports (animation-timeline: view())` + `min-width: 1024px` block). **3.24 viewports freed**, and the page stops having a section where the scroll axis and the content axis disagree.
  - **Deletes the 240px-tall card + caption overlay pattern** (`shot-caption` gradient over the image) in favour of a caption *under* the plate — a caption that needs a scrim to be readable on top of a screenshot is a caption in the wrong place, and it hides 30% of the image.
  - Keeps all 8 rooms and all 8 images. Same content, **3× fewer viewports, 3× larger images.**

---

### 05 · VISUAL DOOR 2 — The Hunter and the other two threats
- **Purpose:** the antagonist is the product. Show the three things that can end a round, in one hierarchy.
- **Length:** **1.9 / 1.9 vp** (from 1.01 + 1.01 = 2.02).
- **Text-led or image-led:** image-led.
- **Contains:** `.eyebrow` "THE HUNTER" + `.h2` **"One player is the Hunter. Jingles is faster than you."** Layout is deliberately asymmetric (rule 7): a **2/3-width Jingles plate** (16:10, `jingles-closeup`) beside a **1/3 column** holding two stacked half-height plates (`worm-render`, `pod-active`) — one row, three images, one shared `.spec` table underneath.
  - `.spec` rows: `SPEED 13.5` · `DASH 50–80s` · `BLOODLUST 50–80s` · `HITS TO DOWN 2` · `TELL 0.35s`. **Only the Bloodlust value is amber** (`<b>`); the rest are `facility-100`. Today all five values are `text-signal` — five amber display numerals in one block.
  - Under the two small plates, one line each: *"THE WORM — ring your bell and it surfaces 3–5 s later"* and *"THE POD — 90 s, or a teammate holds for 6."* Each is a link.
  - Foot: `btn-secondary` → `/guide/jingles/`.
- **Replaces / deletes:** merges **`Meet Jingles`** + **`Two more ways to lose`** into one hierarchy.
  - **Deletes 4 of the 5 amber `dd` values** in the Jingles stat list.
  - **Deletes `.atmo-red` (Jingles) and `.atmo-amber` (threats)** — no section gets its own light. Three of the page's four atmosphere washes die here. Atmosphere comes from the graded screenshots.
  - **Deletes the 600×120 hand-drawn SVG worm path** (`.draw-path`, `pathLength="1"`, `@keyframes draw`) that floats over the section at 60% width — a squiggle that is not the Worm, drawn in the accent, competing with the actual photograph of the Worm 200px below it.
  - **Deletes the duplicated `.panel` wrapper + `overflow-hidden` on each card** — the plates carry their own ring.

---

### 06 · VISUAL DOOR 3 — Footage
- **Purpose:** hand off to the highest-intent page on the site (216 words in 1.37vp — the densest thing here).
- **Length:** **0.9 / 1.6 vp** (from 1.37 / 2.49).
- **Text-led or image-led:** image-led, but **titles carry the information**.
- **Contains:** `.eyebrow` "FOOTAGE" + `.h2` **"Watch it in motion."** One 3/5-width featured `VideoCard` facade (unchanged — it is already a zero-YouTube-request facade per rule 13) + a **1/3-width hairline list of the other three titles**, one line each: `.h3`-at-16px title, mono duration, `OPEN ON YOUTUBE ↗`. Foot: `.label` "84,000+ VIEWS" + `btn-secondary` → `/videos/` (which already gives each video its own indexable page).
- **Replaces / deletes:**
  - **Deletes the "From the team's channel / 84,000+ views and counting" panel** (a bordered box, 4 lines of copy and its own CTA to say one number), and the `md:grid-cols-3` row of three full `VideoCard`s each with its own description.
  - The three videos stay as images and titles; their prose moves to `/videos/`.

---

### 07 · PROOF — Why it isn't another generator game
- **Purpose:** the one differentiator that a Roblox player will actually evaluate.
- **Length:** **0.45 / 0.6 vp** (from 0.85).
- **Text-led or image-led:** text-led (scannable rows).
- **Contains:** `.eyebrow` "THE COMPARISON" + `.h2` **"Survivors here don't just fix machines."** Five `.spec`-style rows replacing the table — `OBJECTIVE` / `TASKS` / `THREATS` / `TEAMWORK` / `ESCAPE`; the "most asymmetrical horror" column becomes a `.label--dead` single line and STATIC's line becomes `facility-100`. One `.link` → the existing `/blog/why-static-is-not-a-generator-game/`.
- **Replaces / deletes:** replaces the 767px `<table class="min-w-[40rem]">`.
  - **Deletes the horizontal-scrolling table wrapper.** On a 390px phone `min-w-[40rem]` (640px) inside `overflow-x-auto` creates a **second scroll axis inside a vertically scrolling page** — the same justification the CSS comment uses for the lightbox, applied where it isn't true.
  - **Deletes the `<th>` `Aspect` sr-only header column** and the em-dash-ish empty first column.
  - Same five facts, 40% of the height, and every row is one line on mobile.

---

### 08 · STILLS — full-bleed band
- **Purpose:** the visual climax; the only place on the homepage a screenshot gets the full 1440px.
- **Length:** **0.9 / 1.1 vp** (from ribbon 0.65 + parallax 0.60 = 1.25).
- **Text-led or image-led:** pure image. Two stills.
- **Contains:** two full-bleed plates, **alternating off-centre** (first: image full-bleed, caption block offset left at 6 columns; second: image full-bleed, caption offset right). Each is a real screenshot at 1280–1920 wide, graded with the recipe (`filter: brightness(.85) saturate(.92)` + an `rgba(0,0,0,.6)` linear scrim), with **one** line of information: a `.label` room name + one 10-word line + a `.link` to the room or the category. Prefer two of the **8 shots that currently appear only in the ribbon at 288px** — `reactor-coils`-class wide interiors, e.g. `reactor-tanks` and `security`.
- **Replaces / deletes:** replaces the **screenshot ribbon** and the **parallax divider band**.
  - **Deletes 40 `<img>` elements** (two duplicated 20-item marquees), `@keyframes ribbon` at 70s/85s, its reverse variant, `mask-image`, and the `aria-hidden`/`tabindex="-1"` wrapper that made the whole showcase invisible to assistive tech and to crawlers.
  - **Deletes the 540px empty parallax band** (0 words, 1 image, no function).
  - Net: **−0.35vp, −40 image elements, and 8 unique screenshots move from 288px unreachable texture to 1440px content.**

---

### 09 · PLANNED strip + community row (one hairline block)
- **Purpose:** the roadmap and the community links, as two rows of information rather than two sections.
- **Length:** **0.25 / 0.4 vp** (from roadmap 0.78 + team 0.69 + community 0.94 = 2.41).
- **Text-led or image-led:** text-led, one row each.
- **Contains:** `.eyebrow` "PLANNED — NOT IN THE BETA" + a single wrapping `.strip-row` of the five roadmap titles as `.label`s at `facility-100` with a `.label--dead` "PLANNED" tag: *modes · second map · second Hunter · cosmetics · streamer events*, ending in a `.link` to the Discord. Below, one `.strip-row` of four community cells, each `label + readout + link`: `DISCORD 75+` · `YOUTUBE 310+ SUBS · 84,000+ VIEWS` · `ROBLOX GROUP` · `CREATOR PROGRAM`.
- **Replaces / deletes:**
  - **Deletes the roadmap section's 5×23-word list** — five headings and five paragraphs (113 words) for five planned features. The titles carry the information; the descriptions belong on `/about/`.
  - **Deletes the entire team section** (3 `.panel` cards, 68 words, 618px). `SiteFooter` already states "a three-person team making STATIC"; `/about/` already lists all three with roles, emails, Roblox and Discord handles. Showing it twice on one page is not credibility, it is padding.
  - **Deletes the `FollowSection` component from the homepage** (4 `.panel` cards, 126 words, 849px, 2 more amber CTAs) — it duplicates `SiteFooter`'s Discord/YouTube/Roblox links, which are on every page already. **The Share button survives** as one cell of the community row (it is a genuine utility and the only social-distribution affordance on the page).

---

### 10 · CTA — The bunker is open
- **Purpose:** one action, at the end of a page that has earned it.
- **Length:** **0.5 / 0.6 vp** (unchanged).
- **Text-led or image-led:** image-led (full-bleed `control-room-hologram` under a vertical scrim).
- **Contains:** `.eyebrow` "FREE ON ROBLOX · PC + MOBILE" + `.h2` **"The bunker is open."** + one line + **one** `btn-primary` "Play free on Roblox".
- **Replaces / deletes:**
  - **Deletes the "Read the guide first" secondary button** (or demotes it to a `.link` under the button) — the page has already offered the guide four times.
  - **Deletes `text-center`-everything** on this block: the offset caption grid from §08 establishes an asymmetric column, and the closing CTA should sit on it, not centred against it.

---

### 2.1 Summary arithmetic

| block | now (vp) | proposed (vp) | words now → after |
|---|---|---|---|
| Hero | 1.00 | 1.00 | 76 → 60 |
| Ticker | 0.04 | 0.00 (absorbed) | 52 → 0 |
| The Job (was: Numbers) | 0.46 | 0.35 | 19 → 16 |
| How a round works | **3.87** | **1.40** | 101 → 70 |
| The Bunker (was: Tour) | **4.84** | **1.60** | 224 → 120 |
| Kinetic band | 0.49 | **0** | 14 → 0 |
| The Hunter (Jingles + Worm + Pod) | 2.02 | 1.90 | 181 → 150 |
| Endings | 0.76 | **0** | 50 → 0 |
| Ribbon + parallax | 1.25 | 0.90 | 5 → 30 |
| Footage | 1.37 | 0.90 | 216 → 90 |
| Proof (comparison) | 0.85 | 0.45 | 103 → 60 |
| Roadmap + Team + Community | 2.41 | 0.25 | 307 → 40 |
| Final CTA | 0.50 | 0.50 | 31 → 20 |
| **total** | **20.73** | **≈9.25** | **1,379 → ≈656** |

---

## 3. The mono-readout system — exact values, and where each appears

Four roles, two sizes, two tracking values. Today the same job is done by **7 mono sizes** (9.6 → 13.6px) at 6 tracking values (0.12em → 0.30em). Full CSS: `_design-lab/homepage-redesign.css` §B. New tokens go in `@theme` first (rule 1), then the component classes.

### 3.1 Tokens to add to `@theme`

```css
--text-micro: 0.6875rem;      /* 11px  — the ONE label size */
--text-unit:  0.8125rem;      /* 13px  — the ONE unit size */
--text-body:  1rem;           /* 16px */
--text-lead:  1.125rem;       /* 18px */
--text-h3:    1.625rem;       /* 26px */
--text-h2:    2.5rem;         /* 40px */
--text-display: 4.5rem;       /* 72px */
--tracking-label:   0.08em;   /* was 0.16–0.30em */
--tracking-eyebrow: 0.12em;   /* the top of the band, not past it */
--tracking-h2:      0.05em;   /* DBD's constant: 64px/+3.2px */
--tracking-h3:      0.05em;
--tracking-display: 0.02em;   /* was -0.025em (tech) on a poster-scale H1 */
```
Five working sizes (16 / 18 / 26 / 40 / 72) + two mono sizes (11 / 13). Display-to-body **4.5×** (was 8×). The four big numbers reuse the **h2 step in the display face** so no sixth size is needed.

### 3.2 Role 1 — `.eyebrow` (the section's own name)

```css
.eyebrow {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: var(--text-micro);          /* 11px */
  line-height: 1.1;
  letter-spacing: var(--tracking-eyebrow); /* 0.12em → +1.32px */
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: var(--color-facility-500);      /* 5.9:1 — no opacity, no /55 */
}
.eyebrow::before { content: ''; flex: none; width: 0.5rem; height: 2px; background: var(--color-signal); }
```
**The single highest-leverage change in this document.** It replaces `.kicker` (11.52px, 0.28em tracking, `color: var(--color-signal-dim)`) and `.noise-label` (11.2px, 0.24em). An eyebrow is currently **11.5px of amber-dim uppercase text with 2.3× too much tracking** — 36 elements' worth. As a `.eyebrow` it is **11px of `facility-500` grey with a 8×2px amber tick**. The accent survives as a mark instead of as a texture, and the amber text share on the page drops by roughly a third in one selector.

**Appears on:** every section eyebrow (02–10), the hero status line, the video list, the community cells, and the `label` line under each room tile.

### 3.3 Role 2 — `.label` (field names, tags, table heads)

```css
.label {
  font-family: var(--font-mono); font-size: var(--text-micro);
  line-height: 1.1; letter-spacing: var(--tracking-label);   /* 0.08em → +0.88px */
  text-transform: uppercase; font-variant-numeric: tabular-nums;
  color: var(--color-facility-500);
}
.label--warn { color: var(--color-signal); }     /* live/danger only */
.label--dead { color: var(--color-facility-600); }
.tag { /* mono 11px, hairline box, never filled */
  font: 400 var(--text-micro)/1 var(--font-mono);
  letter-spacing: var(--tracking-label); text-transform: uppercase;
  font-variant-numeric: tabular-nums; color: var(--color-facility-500);
  border: 1px solid var(--color-facility-700); padding: 0.25rem 0.5rem;
}
.tag--live { color: var(--color-signal); border-color: var(--color-signal-dim); }
```
Contrast note: `facility-500` is `oklch(0.66 0.02 240)` — the CSS comment records it at **~5.9:1**, chosen *because* 0.55 failed AA. So the label colour is **the token, at full opacity, not the token at 55% opacity**. The teardown's "~55% opacity" is a description of how premium sites *look*; the way to get there legitimately is a darker token, not an alpha on a passing one.

**Appears on:** the hero fact strip, the four `.readout--xl` unit labels (02), the step indices `01–04` (03), the room numbers `01/08` (04), the `.spec` dt column (05), the comparison row labels (07), the roadmap titles (09), the community cells (09), and the video rows (06).

### 3.4 Role 3 — `.readout` (a mono value + unit in a row)

```css
.readout {
  font-family: var(--font-mono); font-size: var(--text-unit);   /* 13px */
  line-height: 1.2; letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums; color: var(--color-facility-100);
}
.readout > u { text-decoration: none; margin-left: 0.375em; color: var(--color-facility-500); }  /* unit */
.readout > b { font-weight: 400; color: var(--color-signal); }                                  /* live only */

/* The 4-number band reuses the h2 step rather than adding a 6th size. */
.readout--xl {
  display: block; font-family: var(--font-display); font-weight: 700;
  font-size: var(--text-h2); line-height: 0.95;
  letter-spacing: var(--tracking-display);
  font-variant-numeric: tabular-nums; color: var(--color-facility-100);
}
```
`tabular-nums` is mandatory in all four roles: without it, the roadmap counters and `01 / 08` room indices jitter as values change width.

**Appears on:** the four big numbers (02), the community cells `DISCORD 75+` / `YOUTUBE 310+ SUBS · 84,000+ VIEWS` (09), the `.spec` value column (05), the video rows' durations (06), and the room-tile `01 / 08` indices (04).

### 3.5 Role 4 — `.spec` (the replacement for `.data-table` on the homepage)

```css
.spec { border-top: 1px solid var(--color-facility-700); }
.spec > div {
  display: grid; grid-template-columns: 7.5rem 6rem minmax(0, 1fr);
  gap: 0.75rem 1rem; align-items: baseline;
  padding-block: 0.875rem; border-bottom: 1px solid var(--color-facility-700);
}
.spec .v { font-family: var(--font-display); font-weight: 700; font-size: var(--text-h3);
           line-height: 1; letter-spacing: var(--tracking-h3);
           font-variant-numeric: tabular-nums; color: var(--color-facility-100); }
.spec .v--warn { color: var(--color-signal); }   /* 1 of 5 rows, not 5 of 5 */
.spec .n { font-size: 0.875rem; line-height: 1.5; color: var(--color-facility-300); }
@media (max-width: 480px) {
  .spec > div { grid-template-columns: 5.5rem minmax(0, 1fr); }
  .spec .n { grid-column: 1 / -1; }
}
```
`.data-table` **stays** for `/guide/*` (real data tables — scrap weights, crusher figures). On the homepage it is replaced by `.spec`, which is the same three-column rhythm without the `<table>` semantics or the `min-w-[40rem]` horizontal scroller.

### 3.6 The hairline strip — the row that replaces three sections

```css
.strip-row { display: flex; flex-wrap: wrap; border-block: 1px solid var(--color-facility-800); }
.strip-row > * { padding: 0.75rem 1.25rem; border-right: 1px solid var(--color-facility-800); }
.strip-row > *:last-child { border-right: 0; }
@media (max-width: 639px) { .strip-row > * { flex: 1 1 50%; border-bottom: 1px solid var(--color-facility-800); } }
```
**Appears on:** the hero fact row (01), the four numbers (02), the roadmap strip (09), the community row (09). Four uses of one class replace: the ticker marquee, the stat card grid, the roadmap list and `FollowSection`'s 4-panel grid.

### 3.7 Surfaces and texture (Stripe's hairlines, CSS-only, zero requests)

```css
.wrap { max-width: 72rem; margin-inline: auto; padding-inline: 1rem;
        border-inline: 1px solid var(--color-facility-800); }   /* the container edges */
.ticks { height: 6px; background-image: linear-gradient(90deg, var(--color-facility-600) 1px, transparent 0);
         background-size: 8px 6px; background-repeat: repeat-x; }
.rule { height: 1px; background: var(--color-facility-700); }
```
`.ticks` — the tick-mark ruler — appears **once per section**, immediately under the `.h2`, and is the cheapest "engineered" signal available: 0 requests, 6px tall, and it visually ties the eyebrow, the head and the body copy to the same terminal. The teardown's `2px` tick at an 8px pitch is too heavy for a 6px ruler; **1px at 8px pitch** reads as a ruler rather than as a dashed border.

### 3.8 Surface change to `.panel`

```css
.panel {
  position: relative;
  border: 1px solid var(--color-facility-700);
  background: radial-gradient(120% 90% at 0% 0%, oklch(0.22 0.016 240 / 0.75), transparent 60%),
              var(--color-facility-900);
  box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.05);
}
.panel::before, .panel::after { content: none; }   /* amber corner brackets deleted */
```
The teardown's depth model is *inset rings and radial washes*, not gradients-plus-shadow. More importantly the corner brackets are **the largest single source of decorative amber-dim** on the page (28 border segments across 7 panels) and they land on panels that are already bounded by a 1px border and already contain an image. Deleting them is free information-design.

---

## 4. The Halloween layer

### 4.1 The two constraints, restated as design rules

- **(a)** The teardown found that *a new background colour per section* is the "well-made template smell" (Innersloth: 51 tokens, 8 hues). Note that **this site is already on that road**: `global.css` ships `.atmo-red`, `.atmo-amber`, `.atmo-blue`, and the homepage uses two of the three. The Halloween layer must therefore not add a fourth atmosphere class — and §2 already removes the `.atmo-*` calls from the homepage's content sections entirely. **Halloween is the accent warming and one wash strengthening. That is all.**
- **(b)** One accent on ≤10% of elements. Measured today: **26.3% of text elements carry amber** (68 of 259). Halloween must **not** raise that. The design below carries it: the seasonal layer changes *which* amber, never *how much*.

### 4.2 The switch

One attribute on `<html>`, no build flag, no JS, no second stylesheet:

```html
<html lang="en" data-season="halloween">   <!-- omit the attribute to switch off -->
```
Everything seasonal is scoped to `html[data-season='halloween']`. With the attribute absent, **not one seasonal declaration matches** — the site is byte-for-byte the default. The seasonal tokens are declared in `@theme` with inert defaults (`--season-wash: transparent; --season-wash-strength: 0`), so a partial rollout cannot leave the page in a half-seasonal state. Set it in `BaseLayout.astro` from a single constant, or flip it in one line at build time.

### 4.3 Tokens that change (2)

```css
html[data-season='halloween'] {
  --color-signal:     oklch(0.78 0.17 62);   /* was oklch(0.78 0.15 75) — 13° warmer, +0.02 C */
  --color-signal-dim: oklch(0.62 0.14 62);   /* was oklch(0.62 0.12 75) */
}
```
Lightness is **identical** (0.78 / 0.62) and chroma moves by +0.02, so every contrast ratio on the site is preserved to within measurement noise. The hue moves from 75° (golden amber) to 62° (pumpkin) — enough to read as seasonal on a near-black ground at 11px, small enough that the palette is still provably "one accent". Because both amber tokens move together, the two-ambers problem from §1.4 does not get worse.

### 4.3a One prerequisite I verified, and it must be fixed before the flag is trustworthy

I checked whether the deployed CSS actually consumes the tokens, because a token swap only works if nothing was baked at build time. Result:

- **It mostly works.** Tailwind v4 emits `color: var(--color-signal)` — **29 utility rules** (`.text-signal`, `.bg-signal`, `.border-signal`, `.text-signal-dim`, …) — and **39 `color-mix(in oklab, var(--color-signal) …)`** declarations for the opacity modifiers (`bg-signal/70` on the ticker dots, etc.). All of those follow the swap correctly.
- **Two places do not.** The minifier resolved hand-written `oklch(0.78 0.15 75 / α)` to a **frozen hex literal**: `.step-icon { background: #efa8310f }` (the 6% step-icon wash, ×4 on the page, confirmed independently as computed `rgba(239, 168, 49, 0.06)`) and `.btn-primary:hover { box-shadow: … 0 6px 24px #efa83159 }` (the 35% amber halo). `.btn-secondary:hover`'s `oklch(0.78 0.15 75 / 0.08)` is in the same class.

**Action:** convert those three hand-written alpha ambers to `color-mix(in oklch, var(--color-signal) 6%, transparent)` (and `35%` / `8%` respectively) **before** shipping `data-season`. Otherwise the Halloween build ships a stray **gold** halo on the primary button's hover and a gold wash on four step icons, in the middle of a pumpkin page — and it will look like a rendering bug rather than a missed token. This is also worth doing with no season at all, since it is the one place the token layer currently leaks.

### 4.4 Tokens that change (atmosphere, 4)

```css
  --season-wash: radial-gradient(90% 60% at 50% 0%, oklch(0.52 0.14 62 / 0.16), transparent 70%);
  --season-wash-strength: 1;
  --season-flicker: 4.5s;   /* candle cadence, on the EXISTING flicker keyframes */
  --season-blink: 2.4s;     /* on the EXISTING blink keyframes */
```
Consumed by exactly two rules:
```css
body::before { content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
               background: var(--season-wash); opacity: var(--season-wash-strength); }
html[data-season='halloween'] .flicker { animation-duration: var(--season-flicker); }
html[data-season='halloween'] .dot    { animation-duration: var(--season-blink); }
html[data-season='halloween'] .ticks  { background-image: linear-gradient(90deg, var(--color-signal-dim) 1px, transparent 0); }
```
`body::before` is currently **unused** (`body::after` is the CRT scanline), so this costs **one fixed composited layer and zero DOM**. Reusing the existing `.flicker` / `.dot` keyframes means **zero new `@keyframes`** — which matters because `prefers-reduced-motion: reduce` already disables `.flicker` and `.dot` in `global.css`, so the seasonal cadence inherits reduced-motion compliance for free. The seasonal tick ruler is 1px of `signal-dim`: atmosphere as a grid line, which is exactly the line between "seasonal" and "a new palette".

### 4.5 Tokens that MUST NOT change

| token | why not |
|---|---|
| `--color-facility-950 … 100` (9 tokens) | The cold surface ramp. Its 0.66 step exists **specifically** because 0.55 failed AA (see the comment in `global.css`). Tinting the surfaces is simultaneously (i) how a redesign breaks accessibility, (ii) how a per-section palette starts, and (iii) how the page stops being a facility and becomes a greeting card. |
| `--color-facility-950` (page base) | Never re-tint the page ground. |
| `--color-status-red` | Danger must stay a different **hue** from the accent, or amber stops meaning "danger" and the Worm/Pod warnings lose their signal. Warm it 3° if you must; do not move it toward 62°. |
| `--color-status-green`, `--color-status-blue` | Unused on the homepage. Leave them; a seasonal layer that starts retinting unused tokens is a palette. |
| `--font-display/sans/mono` | Rule 6. No seasonal face — Chakra Petch's industrial cut *is* the season's register. |
| `--color-glass`, `--color-glass-line`, `--edge-highlight`, `--shadow-*` | No seasonal glass, no seasonal shadows. |
| `.atmo-*` classes | **No fourth atmosphere.** No per-section wash under any season. |
| Layout, spacing, radius, type sizes | A season is colour and cadence, never geometry. |

### 4.6 What is explicitly rejected

A pumpkin countdown clock · a spider-web SVG · a candy-corn gradient · a hero image swap (that would change the LCP element mid-season, and the LCP element being an un-hidden hero image at `opacity: 1` is measured, load-bearing and worth protecting) · a "spooky" display font · a `<canvas>` fog · a per-section hue rotation · a price/event banner that appears only in October (it would occupy space in the layout only part of the year, which is a layout bug, not a season).

**Cost:** ~600 bytes of CSS in the inlined stylesheet, 0 bytes of JS, 0 requests, 1 extra composited fixed layer, 0 new keyframes. **Risk:** the `body::before` layer sits above the page ground and below content — verify it does not sit above the lightbox (`z-index: 0` vs the lightbox's `dialog` top layer, so it cannot) and that at 16% chroma-0.14 on a near-black ground it stays under the "reads as a tint" threshold on a phone in daylight.

---

## 5. The interaction / aesthetic layer

Budget reality for everything below: **total JS on the live page is 1 KB** (one file) plus 16,405 characters of inline script, and **CSS is inlined into the HTML** — 58,823 characters inside a 34 KB (163 KB decoded) document, with **no external stylesheet and therefore no cacheable CSS**. Every byte of CSS added here grows the render-blocking document on *every* page. The teardown's finding that GSAP is used by 0 of 13 sites is worth restating: this site already achieves more motion than most of them with 0 KB of it.

### 5.1 Loading behaviour — "the signal acquires"

**What it is.** The hero backdrop keeps `opacity: 1` and animates **`filter` only**: `brightness(.35) saturate(.4)` → `brightness(.8) saturate(1.08)` over 600ms `cubic-bezier(.215,.61,.355,1)`, triggered by a class the existing inline script adds on `load`. The mono fact row resolves through the existing `data-decode` scramble. Diegetically: the camera coming online, not a curtain lifting.
**Cost:** ~120 bytes CSS, ~40 bytes JS (one `classList.add` inside the existing hero script). 0 requests.
**Risk:** LOW. `filter` on a 1440×900 layer is a composited pass; keep `will-change: filter` off (it would pin a full-size layer) and the animation stops after 600ms. **It never removes the LCP element from paint**, which is the whole point.

**Explicitly rejected:**
- ❌ **Any full-screen "boot sequence" overlay at `opacity: 1` that fades out** — it sits *on top of* the LCP element, and Chromium records LCP when the largest element is *painted and visible*, so the fade pushes LCP to the end of the animation. On a site already at **P90 4,360ms**, that is a multi-second regression for a 600ms animation.
- ❌ **Any hero element starting at `opacity: 0` or `clip-path: inset(…100%…)`.** I measured this build specifically for it and it comes back clean: **0 of 43 first-fold elements** sit behind `opacity: 0` or `clip-path`, and the **measured LCP element is the hero `<img>` at `opacity: 1`, `clip-path: none`**. This is a property of the current build that must be *preserved*, not a blank cheque. Write it into the contract as a rule: *no `.rise`/`.reveal` inside the first `100svh`.*
- ❌ **A fake "LOADING… 43%" / progress-ring** — there is no real work to report; it is a lie inside the fiction and it delays content behind a timer.
- ❌ **A skeleton screen for the hero** — the hero has one image and it is preloaded; a skeleton would *create* the shift it pretends to prevent.

### 5.2 Cursor treatment — two options, one recommended

**Recommended: the reticle.** A 1px crosshair on the image surfaces, built as two `position: fixed` 1px lines (one full-width, one full-height) with `mix-blend-mode: difference`, moved with `transform: translate3d()` from a single `pointermove` listener that writes custom properties. Diegetically it is the Sorter terminal's targeting reticle, and it is honest about the site being a machine interface.
**Cost:** ~180 bytes CSS, ~200 bytes JS. **Zero repaints** — two 1px layers moved by transform on the compositor.
**Risk:** LOW. Guard with `@media (hover: hover) and (pointer: fine)`, and set `cursor: none` on **nothing** (keep the OS cursor; a crosshair ring around it is the effect, hiding it is a usability defect).

**Optional and expensive: the flashlight beam.** A 440×440px element with `background: radial-gradient(closest-side, transparent 55%, oklch(0.1 0.02 240 / .5) 100%)`, `margin: -220px`, `will-change: transform`, translated to the pointer.
**Cost:** ~260 bytes CSS, ~180 bytes JS.
**Risk:** **MEDIUM–HIGH.** The obvious implementation — `radial-gradient(circle 220px at var(--x) var(--y))` on a full-viewport `fixed` layer — repaints a 1440×900 gradient on every pointermove, which is exactly the kind of per-event full-screen paint that tanks a low-end Android. The `transform`-a-small-element version above is the only acceptable one. Even then, ship it behind `(hover: hover) and (pointer: fine)` and **not** on the hero image, and measure INP afterwards.

**Explicitly rejected:**
- ❌ **A custom cursor image** (`url(crosshair.png)`) — an extra request, meaningless on touch, and it obscures the OS cursor's affordances.
- ❌ **A cursor-trailing DOM particle trail** — N elements created per pointermove, each triggering layout. This is the single most common way "facility ambience" turns into a jank complaint.
- ❌ **Any cursor treatment that changes the cursor over the primary CTA** — the amber button is the one place the OS pointer must stay unambiguous.

### 5.3 Lazy-loading — mostly already right; four specific fixes

The build is genuinely good here: **72 of 76 images are `loading="lazy"`, 2 eager, 0 natural-size mismatches**, first paint fetches **7 images**, and a full scroll costs **1,624 KB across 40 image requests**. Fix these four things:

1. **The hero picks the wrong file.** `sizes="(min-width: 768px) 100vw, 50vw"` selects `central-room-globe-1920.webp` (**106 KB**) on a 1440 viewport. Spec `sizes="(min-width: 1600px) 100vw, (min-width: 768px) 1280px, 50vw"` → the **1280** file (61 KB). ~45 KB, 42% of the LCP image, off the critical path. The hero is the LCP element; this is the cheapest LCP win on the site.
2. **Three full-bleed bands fetch 1920px files**: `cargo-dock-shuttle-1920` 167 KB + `control-room-hologram-1920` 152 KB + `central-room-globe-1920` 106 KB = **425 KB** — a quarter of the page's total weight, for pixels that are then pushed through `brightness(~.85)` and a dark scrim. Cap full-bleed bands at **1280** below 1600px viewport width; the grading destroys the difference.
3. **The ribbon's 40 `<img>`**: removed by §08. That is **40 image elements** gone from the DOM (two 20-item marquees) and their 20 duplicated shot ids.
4. **Add `content-visibility: auto` to four below-fold sections.** This is the highest-value item on a 20→9-viewport page: it skips layout *and* paint for off-screen sections. Because I have the exact rendered heights, `contain-intrinsic-size` can be given as an exact value rather than a guess:
   ```css
   #bunker  { content-visibility: auto; contain-intrinsic-size: auto 1456px; }
   #danger  { content-visibility: auto; contain-intrinsic-size: auto 1710px; }
   #footage { content-visibility: auto; contain-intrinsic-size: auto  810px; }
   #proof   { content-visibility: auto; contain-intrinsic-size: auto  405px; }
   ```
   (Values are the measured section heights at 1440 and must be re-derived per breakpoint.)
   **Risk:** MEDIUM and specific. `content-visibility: auto` interacts badly with **sticky descendants** and with **in-page anchor targets** — which is exactly why it should **not** go on `#tour`, the hero's "Tour the bunker ↓" target, and why it must not be applied while any section still contains `.story-media` / `.tour-pin`. It also makes scrollbar-length estimates approximate. Apply it after §2's sticky sections are deleted, not before, and verify the hero's anchor jump still lands.

Also: keep `<link rel="preload">` on the hero image, keep `fetchpriority="high"`, and **cut the font preloads from four to two** — see 5.5.

### 5.4 Scroll / motion language

**Keep the mechanism.** CSS `animation-timeline: scroll()/view()` behind `@supports` + `prefers-reduced-motion: no-preference` is the right call, is 0 KB of JS, runs on the compositor, and 0 of 13 premium reference sites use GSAP. The existing `.fx-io` IntersectionObserver fallback for Firefox is also right (Firefox has not shipped scroll-driven animations), and its rAF-writes-vars / CSS-owns-paint split matches the contract's guarantee 5. This is the part of the site that is ahead of the references — do not "modernise" it.

**Change four things:**

1. **Cut from 20 keyframes to 8.** Deleted with their sections: `kin-l`, `kin-r`, `st-fade`, `step-focus`, `tour-slide`, `tour-progress`, `parallax`, `ribbon`, `gauge`, `count-up`. Kept: `flicker` (failing lights), `blink` (telemetry), `ticker-scroll`, `rise` (entry), `settle` (shutter), `hero-drift`, `hero-rise`, `hero-copy`. That is ~700 bytes of CSS out of the inlined document and 51 scroll-timeline elements down to ~14.
2. **Adopt the measured reveal shape.** `translateY(24px)` + opacity at **500ms** `cubic-bezier(.215,.61,.355,1)` with **80ms** stagger (`--i`-indexed, replacing hand-written `--beat-delay: 60/100/110/120ms` values scattered across the markup). Drop `scale(0.98)` from `.rise` and `scale(1.14)` from `.reveal img` — a large transform on a 700px image is texture, not signal, and it is the most expensive thing in the current reveal.
3. **Adopt the measured hover band: 90ms.** Today: `.btn-primary` 180ms, `.btn-secondary` 180ms, `.link` 180ms, `.shot-link img` 600ms, `.video-card` 180ms. The teardown band is **75–100ms**.
4. **Slow the ambient loops and give them non-arbitrary durations.** Ticker 42s → **90s** (DBD's register is 90s/180s); flicker stays 7s (a light that flickers faster than 7s becomes a strobe and stops reading as a *failing* light); blink stays 1.6s.

**Explicitly rejected:**
- ❌ **GSAP / Motion / three.js** — rule 5, and 0 of 13 reference sites. A single `ScrollTrigger` bundle is 30–70 KB, i.e. **30–70× the site's entire current JS payload**.
- ❌ **IntersectionObserver-driven parallax on the hero.** The hero already has a compositor-driven `hero-drift`; duplicating it with a JS scroll listener converts a compositor animation into a main-thread one. The existing `.fx-io` fallback exists only for the browser without scroll timelines — leave it there.
- ❌ **A scroll-jacked/pinned section.** The two pinned sections (`how-to-play`, `tour`) are 42% of the current page length and are the reason the page reads as long. Pinning converts a scroll gesture the user controls into a timeline the site controls; on a touch device with momentum scrolling it reads as broken.
- ❌ **A `scroll-behavior` hijack or smooth-scroll library** — `html { scroll-behavior: smooth }` already exists; that is sufficient.
- ❌ **Any reveal on the hero or on the section immediately below it.** See 5.1; this is the LCP guard.

### 5.5 One adjacent fix that is worth more than any effect above

The **CLS I measured on the hero is 0.063** — not failing, but real, and it comes from the hero grid (`0.0509`) and `.hero-cine-copy` (`0.008`). The cause is `font-display: swap` on a **128px display headline**: when Chakra Petch swaps in, the headline's metrics change and the whole hero block reflows below it. Three fixes, in order of value:
1. Add metric-matched fallbacks — `@font-face` with `size-adjust` / `ascent-override` / `descent-override` for `Arial Black` and `system-ui`, so the fallback occupies the same box. This removes the shift without touching the type ramp.
2. Consider `font-display: optional` for **JetBrains Mono and Public Sans** (labels and body — a 200ms delay on an 11px label is invisible) while keeping `swap` on Chakra Petch 700, which *is* the LCP text.
3. **Demote two of the four font preloads.** All four faces are preloaded (**86 KB: JetBrains Mono 40 KB, Public Sans 26 KB, Chakra Petch 700 10 KB, Chakra Petch 500 10 KB**) and they compete with the hero image preload for the same critical-path bytes. Chakra Petch 700 and the hero image are what the first viewport actually needs. This is free LCP.

---

## 6. Priority order

Ordered by (value ÷ cost), where value is measured: viewports removed, LCP bytes removed, or accent share removed.

**P0 — the deletions (no design decisions, big wins, ~1 session)**
1. **Delete the kinetic type band, the parallax divider band, the endings section, the team section and `FollowSection` from the homepage.** −3.48 viewports, −4 images, −194 words, **−2 amber filled CTAs**, −4 `.panel`s. Nothing needs to be designed to do this; the content already exists in `SiteFooter` and `/about/`.
2. **Un-pin the two sticky sections** (`how-to-play`, `tour`). −8.71 viewports on its own — the single biggest change available. Ship them as static grids first; refine them afterwards.
3. **Build the type scale** (§3.1) and **replace `.kicker`/`.noise-label` with `.eyebrow`/`.label`.** 21 sizes → 5+2; 7 mono sizes → 2; tracking 0.30em → 0.12em; **amber text share drops from 26.3% toward the ≤10% rule in one selector**, because the eyebrow's amber becomes an 8×2px tick instead of 11.5px of uppercase text.
   *Reasoning:* these three are the entire diagnosis and they cost nothing but deletion. Doing them first makes the remaining work measurable — you can re-run the same teardown and watch the viewport count and accent share move.

**P1 — the images (the owner's "less text, more image", ~1–2 sessions)**
4. **Section 04 (The Bunker) as a 3-up hairline grid** — converts 8 pinned cards into 8 larger static plates with one-line captions. This is the section that proves the design direction; do it before the others so the grid can be reused.
5. **Section 08 (two full-bleed stills)** and **delete the ribbon** — −40 `<img>`, +8 screenshots promoted from 288px `aria-hidden` texture to 1440px content.
6. **Fix the `sizes` attributes** (§5.3 items 1–2): −45 KB on the LCP image, −~170 KB on the full-bleed bands below 1600px. Cheapest performance win on the site and it needs no design input.

**P2 — the copy and the readouts (~1 session)**
7. **Section 03 (the round) as a 4-column hairline grid** + **section 02 (the job) reusing the h2 step** — deletes the gauge SVG, the counter, 4 icons, the duplicate `crusher-console`, and 4 × `.step-num` outline numerals.
8. **Section 07 (comparison) as `.spec` rows** — kills the nested horizontal scroller on mobile.
9. **Section 05 (the Hunter) merge + one amber `.spec` value out of five**; **section 06 (footage) as one featured + a title list**; **section 09 (the two `.strip-row`s)**.

**P3 — motion and the CSS system (~1 session, then verify)**
10. **`@theme` spacing token + `.section`/`.wrap`** — moves the rhythm out of 16 scattered wrapper divs and raises section padding from 96px into the 110–225px band.
11. **Rewrite `.panel` as a ring + wash; delete the corner brackets** (−28 amber-dim border segments); **glass 14px → 6px** on the two floating layers.
12. **Cut 20 keyframes → 8; adopt 24px/500ms/80ms reveals and 90ms hovers; ticker 42s → 90s.** All behind `@supports` + `no-preference`, with the reduced-motion block updated for the two new classes.

**P4 — the interaction layer and the season (last, and only after measuring)**
13. **The loading `filter` fade** (~160 bytes) — do this after P1.6, so its effect on LCP is measurable against a fixed baseline.
14. **`content-visibility: auto` on the four sections with no sticky descendants and no anchor targets**, with exact `contain-intrinsic-size` values, **after** P0.2 has removed the sticky sections. Verify the hero's "Tour the bunker ↓" anchor still lands.
15. **The reticle cursor** (~380 bytes) behind `(hover: hover) and (pointer: fine)`; measure INP. The flashlight ring only if INP survives it.
16. **The Halloween layer** last. It is a colour change plus a switch, it depends on P3.11 having settled the token layer, and by then the accent share is a measured number that the seasonal block can be checked against rather than guessed at.

*Reasoning for the whole order:* every item in P0 is a **deletion**, and on a page that is 59% scroll-jack-and-duplicate, deletion is both the largest and the cheapest change. P1 is the owner's stated direction and also the largest perceived-quality change. P2 is information design with no visual risk. P3 and P4 are refinements that are only worth doing once the page's length is right — building a perfect motion system on top of a 20.7-viewport page is optimising the wrong object. And P4.16 (Halloween) is deliberately last: it is the only item whose success is measured against numbers that P0–P3 produce.

### What I would deliberately not do

- **Not add a dependency.** Total JS is **1 KB**. There is no library that improves this page by 1 KB worth of value.
- **Not touch the radius.** 701 of 701 elements are `border-radius: 0`. The site is already the cleanest data point in the teardown.
- **Not touch the fonts.** Three families, 86 KB, all self-hosted and preloaded — but **do** drop two preloads and **do** add metric-matched fallbacks (§5.5). No new family, ever.
- **Not add a hero video.** At LCP P90 **4,360ms**, a 2–4 MB mp4 in the critical path on a page whose LCP element is currently an image is the wrong trade at any bitrate. The video facades already do the job at 0 third-party requests.
- **Not expand `backdrop-filter`.** Rule 14, and it is already correct — the fix is *reducing* 14px to 6px on two selectors, not removing glass.
- **Not fix the screenshot grading.** Out of scope by instruction, and the redesign is designed to *assume it is solved* — every plate in §2 is specified under a graded, full-bleed, radius-0 container, so a solved grading recipe drops in without touching layout.
- **Not chase the `<table>` off `/guide/*`.** `.data-table` is right for real data pages (scrap weights, crusher figures). Only the homepage's comparison should become `.spec`.
- **Not add a fourth atmosphere.** Two of the three existing `.atmo-*` classes are removed from the homepage in §2; the Halloween layer adds none.
- **Not put a reveal on anything in the first viewport.** Measured today: 0 of 43 first-fold elements hidden, LCP element painted at `opacity: 1`. That is the one property of this build that a redesign is most likely to break and hardest to notice breaking, because it fails only in the field.
- **Not claim a fix I have not measured.** Two things in this spec I could not verify: whether `backdrop-filter` renders as declared (headless has no GPU), and how the 12 ribbon-only screenshots grade against the rest. Both are flagged, neither is guessed at.

---

## Files in `_design-lab/`

| file | what it is |
|---|---|
| `redesign-spec.md` | this document |
| `homepage-redesign.css` | the drop-in CSS layer: tokens, mono-readout system, display ramp, rhythm, surfaces, Halloween block, motion, reduced-motion. **Scratch — not applied.** |
| `live-1440.json` | live-DOM teardown at 1440×900 (type census, radii, accent, sections, paddings, colours, images, transfer) |
| `live-390.json` | same at 390×844 |
| `lcp-1440.json` | LCP element + CLS sources + first-fold hidden-element audit + full resource waterfall |
| `weight-1440.json` | full-scroll transfer audit (1,745 KB; 40 image requests; inlined-CSS sizes) |
| `live-1440.jpg`, `live-390.jpg` | full-page renders (see caveat: off-viewport scroll-timeline content paints at its `both`-fill start state, so the render shows the *unrevealed* page below the fold — a screenshot artefact, not the in-browser appearance) |
| `cdp-measure.mjs`, `lcp-measure.mjs`, `scroll-weight.mjs`, `digest.mjs` | the harnesses, so every number above is reproducible |
