# Design-reference teardown — `beaniestudio.site` redesign (STATIC: Salvage vs Hunter)

Scratch folder: `D:\roblox game 4\_ref-audit\` — nothing in `beaniestudio-site\` was touched.

---

## 0. Method, and three honesty notes

**Tooling.** The `agent-browser` skill could not run on this host. Its CLI launches a daemon that binds a **Unix domain socket** under `C:\Users\hp\.agent-browser`; this session's sandbox denies `AF_UNIX` binds with `EACCES` (`listen EACCES: permission denied ...\test.sock`). Named pipes and TCP both work, so I drove **Google Chrome 155 headless over the CDP DevTools TCP port** directly (`tools/cdp.js`, `tools/run.js`, `tools/run2.js`) — same engine, same measurements: `Emulation.setDeviceMetricsOverride` at **1440×900** and **390×844** (mobile UA + touch), `Page.captureScreenshot` with `captureBeyondViewport` for full pages, `Runtime.evaluate` probes for computed styles, `@font-face`/token dumps and CSS text.

**What "screenshot" means here.** Desktop full-page PNG + 3 viewport PNGs while scrolling (0 / 33% / 66%), plus mobile full-page + 2 viewport PNGs, per site. Full pages taller than 14 000 px are captured in segments (`*-full-part01.png`, `-part02`) because of the texture limit; `previews/` holds downscaled copies (long side 7600) that the reader can actually open. Cookie/consent overlays (`[id*=cookie]`, `#onetrust-consent-sdk`, `[class*=consent]`, … — `tools/hide.js`) were hidden before capture, so a few screenshots have a consent box removed. That is the only page mutation.

**What I could not inspect.** Three sites are JS/WebGL-rendered and are reported as unverifiable rather than guessed at:
- `igloo.inc` — WebGL2 unavailable in this headless config → page renders the literal string *"Seems like WebGL2 is not supported by your browser"* on a flat grey field. No DOM, no type scale.
- `activetheory.net` — WebGL starfield *does* render, but the site gates on a capability/UA check and serves an `/unsupported` page: *"YOUR BROWSER IS NOT SUPPORTED"*. No content to measure.
- `hellomonday.com` — DOM is nearly empty (no headings, no images in the flow; canvas-driven). Only the loading state was capturable.
- `theoutlasttrials.com` — DNS/connection fails from this host (`chrome-error://chromewebdata`). Dropped.

Everything below is measured, not estimated. Where a number is inferred I say so.

---

## 1. The reference set (13 sites, 6 categories)

| # | Category | Site | What I got |
|---|---|---|---|
| 1 | Minimalist / editorial | **teenage.engineering** | Full teardown + screenshots |
| 2 | Tech / dev-tool | **linear.app** | Full teardown + screenshots |
| 3 | Tech / dev-tool | **stripe.com** | Full teardown + screenshots |
| 4 | Tasteful glass/translucency | **raycast.com** | Full teardown + screenshots |
| 5 | Indie studio | **playdead.com** | Full teardown |
| 6 | Indie studio | **innersloth.com** | Full teardown (negative reference) |
| 7 | Indie studio (dark editorial) | **halfmermaid.co** | Full teardown + screenshots |
| 8 | Horror / dark game | **gtfothegame.com** (GTFO) | Full teardown — closest analogue |
| 9 | Horror / dark game | **deadbydaylight.com** | Full teardown + screenshots |
| 10 | Horror / dark game | **kineticgames.co.uk** (Phasmophobia) | Full teardown + screenshots |
| 11 | Horror (platform baseline) | **roblox.com DOORS page** | Full teardown (the thing we must beat) |
| 12 | Award / portfolio motion | **rauno.me** | Full teardown + screenshots |
| 13 | Award (WebGL) | igloo.inc, activetheory.net, hellomonday.com | **Unverifiable** — see §0 |

---

## 2. Per-site teardown

### 2.1 teenage.engineering — minimalist / editorial
**Type.** Two custom faces (`te-20` text 186 nodes, `te-40` display, 21 `@font-face` rules). Every size is a **fraction of viewport width**, not a px scale: `--base-design-width: 980`, `--fs-10: calc(.00918367 * 100vw)` (13.2 px @1440), `--fs-20: calc(.0183673 * 100vw)` (26.4 px), `--fs-30: calc(.027551 * 100vw)` (39.7 px), `--fs-40: calc(.0367347 * 100vw)` (52.9 px). That is a **linear 1 : 2 : 3 : 4 ramp**, not a modular ratio — verified: 390→10.35 px, 768→10.19 px, 1024→13.58 px, 1200→15.92 px, 1440→19.10 px for the same paragraph. Nav/labels 16 px/24 px weight 300; the “big” body paragraph is 19.1 px at **weight 100**. Display/body contrast comes from *weight and case*, not size. Zero added letter-spacing anywhere; `text-transform: lowercase` on one label class.
**Spacing.** Also vw-based: `--space-xs .510204vw` (7.3 px @1440), `--space-sm 1.0204vw` (14.7), `--space-md 1.53061vw` (22), `--space-lg 2.29592vw` (33), `--space-xl 4.59184vw` (66.1). Header height `.0816327 * 100vw` = **117.5 px**. Grid divider hairline `.102041vw` = **1.5 px**. Section padding 66.1 px each side. There are **no type breakpoints** — the whole page is one optical system that scales with the window.
**Colour.** Pure `#000` background (4 painted nodes). Text `#F1F2F2` (139), `#E5E5E5` (32). A full 8-step grey ramp `#272727 → #4d4d4d → #767676 → #7f7f7f → #a1a7af → #b2b2b2 → #ccc → #e5e5e5`. Then a **product-label accent set that only appears as tiny chips on the product grid**: `--te-green:#006837`, `--te-yellow:#fab413`, `--te-orange:#f05a24`, `--te-red:#b81d13`, `--te-blue:#0071bb`. Accent coverage ≈ 0 % of page area. **No gradients, no shadows, `border-radius: 0px` on all 189 rounded-capable elements.**
**Layout.** One full-bleed 1440×1920 b/w photograph *is* the homepage (doc height 2285 px). Fixed 2-row nav of flat 1px line icons in 5 columns, then a 4-line footer. No container, no cards, no max-width — everything hangs off the vw grid and hairline rules. Only 3 fixed elements, all `z-index: 100–1000`.
**Motion.** Almost none, on purpose: **0 animating elements**, 3 transitioning elements, one explicit timing (`transform .2s ease-in`). One `@keyframes` marquee (`_mrq-scroll`) and **exactly one rule with `animation-timeline`** — the only CSS scroll-driven animation I found in the whole reference set besides Raycast. The party trick is an **SVG filter applied to the page**: `filter: url("#luminosity-invert")` (2 elements) flips the entire site’s luminosity for light mode without re-exporting a single image.
**Imagery.** 1 giant static webp + 17 inline SVGs. No video. Static, not scroll-linked, not masked, not sequenced.
**Why it feels expensive.** One photograph, real type at thin weights, a vw-locked optical rhythm identical at every window size, and total refusal to decorate. Weight: 600 KB total, 83 requests, **no framework detected**.

### 2.2 linear.app — tech / dev-tool
**Type.** `Inter Variable` with `--font-settings: "cv01","ss03"` and `--font-variations: "opsz" auto` — i.e. **Inter with stylistic alternates enabled so it does not read as Inter**. Mono: Berkeley Mono (260 nodes). Measured @1440: h1 **64/64, ls −1.408 px (−0.022em), weight 510**; h2 48/48 ls −1.056 w510; h3 20/26.6 ls −0.24 w590; body p **15/24 ls −0.165 w400**; list 16/24; link 14/21; button 13/19.5; micro-label 12/14; blockquote 24/31.9. Steps ≈ **1.25–1.33** across the UI range with a 2.4× jump to display. By width: h1 38 → 56 → 56 → 64 → 64 px at 390/768/1024/1200/1440; h2 24 → 32 → 40 → 40 → 48. Breakpoints are just `max-width: 640 / 768 / 1024 / 1280`.
**Spacing.** `--page-padding-block: 64px`; homepage sections **pt/pb 128 px**; container max-width **1436 px with 46 px side padding**; header 72 px, `position: fixed`, `backdrop-filter: blur(20px)`. Easing tokens: `--ease-out-quart: cubic-bezier(.165,.84,.44,1)`, `--ease-in-out-quart: cubic-bezier(.77,0,.175,1)`, `--ease-in-out-circ: cubic-bezier(.785,.135,.15,.86)`, `--ease-out-quad: cubic-bezier(.25,.46,.45,.94)`; speed tokens `--speed-quickTransition: .1s`, `--speed-highlightFadeOut: .15s`.
**Colour.** bg `#08090A`; surfaces `#0F1011` (34), `#191A1B`; text ramp `#F7F8F8` (1083) → `#D0D6E0` (176) → `#E6E4E7` → `#8A8F98` (370) → `#62666D` (286); lines `#18191A / #202122 / #37393A`; accent `--color-accent: #7170FF` plus pink `rgb(247,156,224)` on **41 text nodes**. Depth is built from **1px rings and 4–5 % white washes, not shadows**: `rgba(255,255,255,.05) 0 0 0 1px inset` (4–6 elements), `rgba(0,0,0,.2) 0 0 0 1px` (6), `radial-gradient(circle, rgba(255,255,255,.04) 0%, transparent 50%)` (5 spotlight washes), `drop-shadow(.../10% 0 0 32px)` amber bloom on the AI art. `mix-blend-mode: overlay(7) / lighten(6) / screen(3)`.
**Layout.** Fixed header; a 9960 px page built from a repeated ~1220 px slot: **left column = two-line section title, right column = one-line description + 3 small feature links, then one big product screenshot full-container-width, then a hairline-separated row of 4 tiny feature links**. Asymmetric 1/3 : 2/3 text split, visual full width. Radial/linear dot grids animate behind the sections.
**Motion.** 300 `@keyframes`, **411 elements with transitions, 156 actively animating**. `color .1s cubic-bezier(.25,.46,.45,.94)` on 187 elements; `filter .16s + transform .16s` on 22; `background .4s ease-out` on 19. Reveal shape measured in the DOM: **`translateY(24.8px)` + `opacity: 0` → `0 / 1`**. `will-change: filter` on 48 elements (cheap GPU hint, not `all`). Ambient: `2s linear infinite` and `2.4s linear infinite` keyframes. One horizontal “shade” element at `translateX(-720px)` for a wipe. CSS does all the self-animation; JS/React only orchestrates.
**Imagery.** 38 `<img>` + 219 `<svg>`, all `loading="lazy"`, presented as **flat frameless product screenshots** over animated grid/dot backdrops — no device chrome, no tilt, no drop shadows. The only loud moment on the page: two large testimonial cards, one soft lavender radial wash, one flat acid yellow. Everything else is dark.
**Perf.** dcl 5.6 s, 61 requests, **31 KB transferred** (immutable chunking + cache) — proof that this much design does not require much weight.

### 2.3 stripe.com — tech / dev-tool
**Type.** One family (`sohne-var`, 1872 nodes). h1 **48/55.2, ls −0.96 px, weight 300**; h2 32/35.2 w300; h3 26/29.12 w300; lead paragraph also 32/35.2 w300; body 16; button 14; labels 14. Ratio ≈ **1.23**, and the display weight is *lighter* than the body — the opposite of the usual hierarchy, which is exactly why it looks editorial.
**Spacing.** **717 `--hds-*` design tokens.** Space tokens: `--hds-space-core-300: 24px`, `-550: 44px`, `-1900: 152px`, `-2000: 160px`, `--hds-space-section-gap-bottom-md: 96px`. Container 1298 px with a 1266 px inner layout, 16–18 px gutters, nav 76 px. Type tokens carry explicit tracking/leading: `--hds-font-heading-xl-lineHeight: 1.03`, `--hds-font-heading-md-letterSpacing: -0.01em`, `--hds-font-text-xxl-letterSpacing: -0.02em`.
**Colour.** White page; `#061B31` headings; `#50617A` / `#64748D` subdued; `#E5EDF5` / `#F8FAFD` surfaces; brand `#533AFD` on **492 text nodes and 7 backgrounds**; `--hds-color-action-bg-translucent: #ffffffa6` for a frosted button. The hero’s colour is a **canvas gradient mesh**, not an image.
**Layout.** The giveaway detail: **visible 1px vertical hairlines at the container edges**, so every band looks drawn on a grid. 2-column hero (copy left, mesh right), grayscale logo strip, then alternating copy/screenshot bands. `ul.navigation-buttons` is `position: sticky`; the mobile menu is `position: fixed` with `backdrop-filter: blur(12px)`.
**Motion.** **Zero `@keyframes` in the style sheets** — motion is JS/inline-style driven; 712 elements carry transitions. Named durations: `--navigation-duration: 240ms`, `--navigation-duration-slow: 300ms`. The hero eyebrow is a **live number** — “Global GDP running on Stripe: 1.73335807 %” with `tabular-nums` — plus `book-of-the-week-fade-in` and a `detect-scroll` animation.
**Imagery.** 36 `<img>` / 36 `<picture>` / 2 `<canvas>` / 4 iframes. Product UI is always **contained inside the hairlines**, never free-floating; the only full-bleed visuals are the canvas mesh and one 1440×467 cover image at 6 px radius.
**Perf.** dcl 31 s cold, 123 requests, 1.4 MB. The heaviest of the “clean” sites.

### 2.4 raycast.com — glassmorphism done with discipline
**Type.** Inter + GeistMono + jetBrainsMono. h1 64/70.4 w600; h2 20; h3/h4 24; body 18; UI labels 13; **eyebrow 12 px uppercase mono, letter-spacing 1.44 px (0.12em)**; caption 10 px uppercase mono ls 0.5 px (literally `FIG_0`). So the ramp is **discontinuous**: two display steps, then pure software-UI sizes. h1 36 px at 390 → 64 px at 768+.
**Spacing.** `--spacing-1 … --spacing-13` = **8 / 12 / 16 / 24 / 32 / 40 / 48 / 56 / 64 / 80 / 96 / 112 / 168 / 224 px**. Hero section **padding-block: 224 px**; page is 15 983 px tall. Containers: xs 746, sm 1064, navbar 1204 px; navbar 76 px + 2×16 px.
**Colour & the glass.** bg `#07080A`. **There are no solid card fills**: surfaces come from `rgba(255,255,255,0.05)` (88 elements) and `rgba(255,255,255,0.1)` (27); borders `#242728`; text `#FFF` (1724) / `#E6E6E6` / `#9C9C9D` / `#6A6B6C`; accents `#57C1FF`, `#59D499`, `#FF6161`, `#FFC533` used **only inside mock UI**. Radii 4/6/8/12/16/20/24 px + full. The translucency works because it is a **simulated macOS window material**: 159 elements share one 4-layer shadow (`rgba(0,0,0,.4) 0 1.5px .5px 2.5px, rgb(0,0,0) 0 0 .5px 1px, rgba(0,0,0,.25) 0 2px …`), a `radial-gradient(75% 75% at 50% 91.9%, #121212 0%, #0D0D0D 100%)` body, a `1px rgb(27,28,30)` outer ring **plus** a `1px rgb(7,8,10) inset` ring, and `backdrop-filter` staged by depth: **blur(2px) · 5px · 10px · 15px · 20px · 36px**. Blur separates *stacked window layers*; it never decorates a card.
**Layout.** Centered mono eyebrow → one-line heading → the window mockup as the hero visual → alternating left/right text+visual pairs → 3-up extension cards on brand-coloured washes → a full-width **keyboard illustration** built from CSS. 1375 px hero band; extremely generous 224 px rhythm.
**Motion.** `opacity .4s cubic-bezier(.23,1,.32,1), box-shadow .2s …, transform .4s` on 159 window elements; `color .3s` on 88; entry animation `0.7s cubic-bezier(.215,.61,.355,1) forwards` **staggered at 100 / 180 / 260 / 340 / 420 ms**; `1s forwards fade-in-up` with a 1 s delay for the hero; `3s linear infinite` and `2s linear infinite` ambient rotations. `grayscale(1)` on 24 elements and `grayscale(.5)` on 18 (colour arrives on hover). `mix-blend-mode: plus-lighter` on 7. And — stealable — `--spring-1: linear(0 0%, .005927 1%, .022466 2%, …)`: **a hand-baked spring curve as a `linear()` easing function**, pure CSS. Two rules use `animation-timeline`.
**Imagery.** 117 `<img>`, but almost all are tiny (20×9 … 20×20) extension icons inside the simulated launcher; the one real visual is a 1300×733 hero screenshot. **No full-bleed photography anywhere.** The OS chrome is CSS, so the “product screenshot” is mostly *rendered*, not downloaded.
**Perf.** dcl 7.4 s, 160 requests, 2.85 MB (the fake-app illustration set). Blur on 5–6 elements only.

### 2.5 playdead.com — indie studio
**Type.** Oswald only. Nav 19 px; h2 20 px w700 ls 0.4 px; body **14 px `#707070`**; h2 16 px → 20 px at 1024 and never changes again. No tracking discipline, no display size — the type is deliberately undersold.
**Spacing.** Two 500–600 px artwork blocks under a 900 px banner, `main-content-wrapper` 1523 px, content ~900 px wide with wide empty gutters.
**Colour — 5 values total.** `#1E1E1E` page, `#707070` body, `#515352` nav, `#B4B9BE` hover, black. Counted text colours: `rgb(81,83,82)`×24, `rgb(112,112,112)`×23, `rgb(180,185,190)`×14. The only saturated thing on the entire page is the red INSIDE logotype **inside the artwork**.
**Layout.** Centered single column; fixed 67 px nav; two artwork tiles side by side at 438×575; newsletter field; footer.
**Motion — this is the lesson.** The site has essentially **no motion code** (one element with `opacity .02s ease-in-out`). Instead: **4 `<video autoplay loop muted playsinline>` `.webm` clips** ship as the images — a 900×488 banner (`object-fit: contain`) and two 438×575 game tiles that are *pre-rendered animated key art*. The page is static; the pictures move.
**Imagery.** 4 videos + 4 PNGs, radius 0 on all 64 rounded-capable elements, no shadows, no gradients, 38 media queries for retina only.
**Why it feels expensive.** Four pieces of art, one typeface, five colours, zero motion budget, and a gallery composition.

### 2.6 gtfothegame.com (GTFO) — horror / dark. **Closest analogue to STATIC.**
**Type.** **Share Tech Mono as the UI/body face (272 nodes)** + Oxanium as display (29 nodes). h2 **48/60 w800 UPPERCASE**; h3 26/32 w800; h4 20/26 w800; body/small print **15/24 ls 0.1 px**. Crucially there are only **two type steps**: below 1200 px h2 = **29 px**, h3 = 24 px; at ≥1200 px h2 = **48 px** while h3 only moves to 26 px. So the headline doubles at one breakpoint and everything else stays terminal-small — deliberate “loud poster + quiet readout”.
**Spacing.** Section **pt/pb 176 px**, with 200 px and 220 px variants; `--page-width: 1080px`; hero band 900 px.
**Colour — 7 tokens.** `--color-shadow:#181818`, `--color-highlight:#dadad1`, `--color-yellow:#e9bc29`, `--color-red:#e11900`, `--color-green:#00a441`, + white/black. Measured: `#DADAD1` on 277 nodes, **amber `#E9BC29` on 20 nodes**, red `#E11900` on 4. **Accent ≈ 6 % of text nodes.** Panels sit on `rgba(0,0,0,.7)` (4) / `.3` (7) with `rgba(218,218,209,.15)` scrims. `border-radius: 0px` on all 301 rounded-capable elements.
**Layout.** Full-bleed 900 px video hero → centered logo lockup + three review scores + one red “watch trailer” CTA → 3-up feature grid → **the circular “Rundown” ring selector** (a radial nav that *is* the section’s artwork) → full-bleed character-art rows with an off-centre text panel, alternating `Row_start` / `Row_end` (left/right anchoring) → Creatures → The Complex → Our Next Game → news grid → FAQ `<details>` → **a monospace System Requirements spec table** (OS / CPU / RAM / GPU / DirectX / Network / Storage, two columns, hairline rules) → footer.
**Motion.** 32 transitioning elements; hover/parallax at **`transform .05s linear` (5), `.1s` (3), `.2s` (3)** — 50–200 ms. Class names include `paralax-lev` on the section bars (JS parallax; my three sample points showed ≈0 translation, so it is subtle/inactive). Only 3 `@keyframes` (swiper loader, nprogress). **`backdrop-filter: blur(2.4px)` ×4** on the panels over video. One `@layer`.
**Imagery.** 37 `<img>` + **2 full-bleed autoplay/loop/muted `<video>`** (hero 1440×900 `object-fit: cover`; a 1440×767 lobby loop). Every image is **graded in CSS**: `filter: brightness(0.9)` (3), `brightness(0.75)` (1), `blur(20px)` (7) for background washes. Text panels over art are near-black at 70–100 % with 1px borders and radius 0. A repeating ruler motif comes from `linear-gradient(90deg, rgb(99,92,97) 2px, transparent 0)`.
**Perf.** dcl 23 s, 46 requests, 356 KB transferred; full page screenshot 7.7 MB of pixels. **The most efficient dark site in the set.**

### 2.7 deadbydaylight.com — horror / dark
**Type.** Roboto Condensed display + Roboto UI — a “cheap” stack made expensive by discipline. h2 **64 px, uppercase, letter-spacing 3.2 px**. Across widths: 390 → 28 px / ls 1.4 px; 768 → 42 / 2.1; 1200 → 64 / 3.2. **The tracking is a constant 0.05em** — it scales with the size instead of being a fixed px. h3 24 w700 ls 1.2 px uppercase; tags 14 w700 ls 0.7 px uppercase; body 20; nav 16 uppercase.
**Spacing.** Sections 804 / 994 (pt-pb 50) / 765 / 628 px; newsletter pt/pb 120 px; **outer container max-width 2160 px** (wider than a 1440 viewport → everything is edge-to-edge) with a 1024 px inner text measure. Fixed two-bar header 135 px.
**Colour.** Black + white + **one red family**: `#990F0F` (12 bg nodes), `#CC0000` (6), `#690504` (6). Red is used *structurally*: the “PLAY NOW” nav block, an outlined ghost CTA, a 1 px red rule under the active nav item, and the smoke art.
**Layout.** 900 px cinematic hero (giant close-up), centered outlined CTA, centered platform-icon row, hero media controls (pause/mute) bottom-left; then full-bleed `background-image` bands at 2160 px; sticky nav with `backdrop-filter: blur(4px)`.
**Motion.** 23 `@keyframes`; 152 transitioning. Interaction at **`0.075s cubic-bezier(.4,0,.2,1)` (38 elements)** — 75 ms, near-instant. Fades `opacity .5s linear` (14) and `.25s linear` (14) with **`will-change: opacity` on 14**. Logo intro `0.5s` / `0.3s` with a 0.3 s delay. And two **ambient loops: `90s linear infinite` smoke + `180s linear infinite` reverse smoke.** `grayscale(1)` on 36 elements.
**Imagery.** 83 `<img>`, 15 `<picture>`, 1 video, 2 canvas — with **blur-up LQIP**: inline `data:image/svg+xml` and 20×13 base64 JPEG placeholders scaled to 212×180.
**Perf.** 46 KB HTML but **9.2 MB of resources / 84 requests**. The most expensive site in the set, and the counter-example to copy from.

### 2.8 kineticgames.co.uk (Phasmophobia) — indie + horror
**Type.** **Spectral SC — a serif — for display**, Inter for UI. h2 48/48, h3 24/24, **body 18/18** (leading 1.0, poster-tight), small print 16, footer 10. Type barely responsive: h2 holds 30 px until 1024 then jumps to 48 px; only two breakpoints in the whole sheet (1000 px, 899 px). No added tracking.
**Spacing.** Section padding 111 / 120 / 150 / 200 px top and 80 / 111 / 200 / 220 px bottom. `--content-max-width: 960px`, `--breakout-max-width: 1280px`.
**Colour.** `#121212` / `#1A1A1A` / `#0A0A0A` dark stack, off-white “paper” surfaces `#D1CDCD`, text `#FFF` (145), muted `#858585` (17), dark-on-light `#1A1A1A` (30) / `#000` (23), and **one amber `#FFB43D` on 5 text nodes**, used as a single full-width CTA band.
**Layout.** Full-bleed 900 px video hero → “Small Studio. Big Impact.” 2-col (copy + 464×413 team photo) → centered 48 px pull-quote → full-bleed Phasmophobia art band → logo + copy 2-col → “Latest News” 3-up off-white cards on black (1 px borders, radius 0) → centered “Join the Team” → **torn-edge amber CTA band** → footer. **Every section transition is a paper silhouette** — classes `top-diagonal-up`, `bottom-diagonal-down`, `top-diagonal-down` — ink-bleed edges that make the page read as printed rather than built.
**Motion.** 53 transitioning elements, **no `@keyframes` at all**, no entry animations — everything is a hover state. `color .2s` (21), `color .3s` (17), `opacity .3s` (6). Radii: **0px ×216**, only 3 at 10 px and 2 at 20 px. `:has()` used twice.
**Imagery.** 23 images + one 1440×900 `object-fit: cover` hero video. Team photo, key art, logo lockups — all static. Personality comes from the silhouette, the serif, and the paper cards.
**Why it feels expensive.** Serif display against a sans UI, leading 1.0, torn section edges, warm off-white cards on a near-black page, and one accent used on exactly one band.

### 2.9 halfmermaid.co — dark editorial indie
**Type.** Roboto Condensed at **weight 300** (light) throughout: h1 46.2/57.75 uppercase, h2 35.2/52.8, h3 19.8/29.7, p 17.6/26.4 (leading 1.5), Oxygen 16 for UI. h1 scales 33 → 38.5 → 46.2 px at 390/1024/1200. Step ratio ≈ **1.32**.
**Colour.** `#000` page, `#C1C1C1` body (108), `#FFF` headings (23), and **one accent — teal `#23E0BA` on 21 text nodes** (links, social icons).
**Layout.** Centered logo → centered social icons → centered 7-item nav over a 1 px hairline → centered section titles → a bordered “Steam app” card → YouTube embed → footer. A **repeating scanline/grid texture** covers the whole background, and full-bleed photographic art (fire/red) sits inside the centered column.
**Motion.** 25 transitioning elements, 13 `@keyframes` (lightbox zoom, fades), no scroll effects. Radii: **0px ×156 — every single one**. Transitions `color .25s` (10), `color .4s` (7), `opacity .25s ease-out` (4).
**Why it feels expensive.** Scanline texture + a strict center axis + one teal accent + light condensed caps = film title card. And it is a WordPress theme — the taste is the palette and the texture, not the engineering.

### 2.10 rauno.me — award / portfolio-calibre motion
**Type.** A custom `X` family. Working sizes: 14 px labels / 16 px body / 32 px statement / **85 px** / **720 px** graphic type (h3 measured at 720 px — it is a *specimen block*, not a heading). No responsive type at all: identical at 390 and 1440.
**Spacing.** `--space-1 … --space-11` = **8 / 16 / 24 / 32 / 40 / 48 / 56 / 64 / 72 / 80 / 88 px**.
**Colour.** `#EDEDED` page, `#FFF` cards, black text, plus two graphic colours: **`#FFFF02` yellow** and `color(display-p3 0.99 0.4 0.02)` — a **P3-gamut orange** that sRGB cannot represent; `--colors-grid: hsl(0 0% 78%)`.
**Layout.** The document is **3000 px wide** with `index_center` at `position: fixed; top: 450px; height: 720px` — the page scrolls *past* a pinned panel, one idea per screen. A `.minimap` fixed at `top: 64px` shows position in the sequence. An SVG with **`mix-blend-mode: difference`** (1 element) sits fixed over the content. Giant type is masked by coloured circles.
**Motion.** 24 transitioning elements, 7 animating, 3 `@keyframes` (`fade`, `animate`, `RAnv2`); **`0.35s ease-in-out forwards index_fadeFrames` on 7**; transitions `background .2s ease-in-out .2s, border-color .2s ease-in-out .2s, opacity .2s …` (4). The scroll model is JS-driven; 19 requests / 236 KB total.
**Why it feels expensive.** Composition as a specimen sheet, type as art at 720 px, unmasked colour blocks, a display-P3 colour no template would pick, and total commitment to an unusual scroll model.

### 2.11 innersloth.com — indie studio (negative reference)
**Type.** Sofia Pro 60/72 w600 h1 (41 → 51 → 60 px at 390/1024/1200), 34/40.8 h2, 30/36 h3; PTSans 22/33 body; tags 14 w700 ls 1.08 px uppercase; nav 18 w700 ls 1 px.
**Colour — 51 tokens, 8+ hues.** Beige `#D3C7B5`, blue `#2D75B6`, light blue `#5DA3E2`, red `#C61111`, coral `#E95C74`, plus `#000 / #111 / #1E1F26 / #262626 / #313131 / #3C3C3C / #2B1F16 / #102B55` — **a new background colour per section**, which is precisely what makes it read as themed rather than designed.
**Spacing.** `--container: 1120px`, `--gutter: 22px`, `--grid-gutter: 15px`; sections 183–623 px; dense, packed tiles (238×64 images).
**Motion.** `--animation-duration: .3s` with `--animation-timing-function: ease` on **85 elements**, 17 generic keyframes (`appear-animation`, `slide-in-animation`, `fade-in-animation`, `top-bottom-animation`, `left-right-animation`), jQuery.
**Imagery.** 19 images, hero darkened with `filter: brightness(0.5)` so white type can sit on it (a legitimate trick). 5.6 MB.
**Verdict.** The “well-made template” end of the spectrum: many colours, mixed radii (0/4/10/11/22/27 px/50 %), no rhythmic spine. Useful as the thing *not* to become.

### 2.12 roblox.com — DOORS game page (the baseline to beat)
White marketplace chrome; Builder Sans 32/44.8 w800 h1 with **emoji in the title** (`DOORS 🚨`); description copy bulleted with **🚨🔥⭐🎵 emoji**; grey gradient LQIP thumbnails; tabs with a 2 px black underline indicator; a stat row (`Favorite` / `4M+` / `355K`) with icon-caption-number stacking. Not an art-direction reference — but it is exactly what a player sees today, and it is the argument for a bespoke site. Two patterns are worth reusing in a diegetic register: the **stat readout** (icon → big number → tiny mono caption) and the **sliding active-tab rule**.

---

## 3. Cross-cutting synthesis (all measured)

### 3.1 Type
| Site | Display (1440) | Mid | Body | Micro | Working step ratio |
|---|---|---|---|---|---|
| teenage.engineering | 52.9 px (thin 100) | 26.4 | 16 | 13.2 | linear 1:2:3:4 on vw |
| linear.app | 64 / ls −0.022em / w510 | 48, 20 | 15 | 12 | ≈1.25–1.33 |
| stripe.com | 48 / w300 | 32, 26 | 16 | 14 | ≈1.23 |
| raycast.com | 64 / w600 | 24 | 18 | 12 mono caps | 2 display steps then UI sizes |
| gtfo | 48 / w800 caps | 26, 20 | 15 mono | 15 mono | **2 steps only** (jump at 1200 px) |
| deadbydaylight | 64 caps / ls 0.05em | 24 | 20 | 14 caps | 1 step |
| kineticgames | 48 serif caps | 24 | 18 | 16 / 10 | 1 step |
| halfmermaid | 46.2 / w300 caps | 35.2 | 17.6 | 16 | ≈1.32 |
| playdead | 20 | — | 14 | 14 | ≈1 |
| innersloth | 60 / w600 | 34, 30 | 22 | 14 caps | mixed |

**Findings.** (1) Every serious site uses **3–5 working text sizes, not 8–10**. (2) The display step is **2.4–4×** the body size — the gap is what makes it feel composed. (3) Micro labels are **10–13 px, mono or uppercase, with positive tracking 0.05–0.12em**, while display text gets **negative tracking −0.01 to −0.025em** (Linear, Stripe) or **proportional positive tracking** (DBD 0.05em at every size; GTFO/Pheasto 0). (4) Body is 15–18 px with leading **1.4–1.6** — except the horror/indie sites, which run **1.0–1.15** for poster density (GTFO 48/60 ≈1.25 poster; kinetic 48/48 and 18/18 = 1.0; halfmermaid 46.2/57.75 = 1.25). (5) Responsive type is either a **single hard jump at ~1024–1200 px** (GTFO, DBD, kineticgames, halfmermaid) or **pure vw proportionality** (teenage.engineering) — nobody uses a 6-step clamp ramp.

### 3.2 Spacing
- Section padding-block, measured: **128 px** (Linear), **176–220 px** (GTFO), **224 px** (Raycast), 152–160 px tokens (Stripe), 111–200 px (Kinetic), 66 px vw-derived (teenage.engineering), 120 px (DBD newsletter).
- **Practical band for a dark premium site at 1440 px: 110–225 px**, and the same value repeated so the page has a spine.
- Side gutters: 16–24 px (Stripe/Raycast), 46 px (Linear), 66 px (teenage.engineering). Containers: 960 / 1064 / 1080 / 1120 / 1204 / 1266 / 1436 px, or **wider than the viewport** (DBD 2160 px) for full-bleed art with a pinned inner measure.
- Named spacing systems: Raycast `8/12/16/24/32/40/48/56/64/80/96/112/168/224`; Stripe `--hds-space-core-300: 24px … -2000: 160px`; rauno `8…88`; teenage.engineering `0.51vw … 4.59vw`.

### 3.3 Colour
- **One accent, ≤10 % of elements, never as a panel fill except one CTA/nav block.** Measured accent share of text nodes: GTFO 20/301 (6 %), Kinetic 5/~250 (2 %), Halfmermaid 21/152 (14 %, links only), DBD: one red family used structurally, Linear 41/~2000.
- Neutrals: 4–8 steps, evenly spaced, named (`--color-text-secondary/tertiary`, `--te-grey-100…1000`, `--grey-50…900`).
- Surfaces come from **5 % and 10 % white overlays**, not solid greys (Raycast 88 + 27 elements).
- Depth: **1 px rings + 1 px inset highlights + 4–5 % radial washes**, not `box-shadow: 0 20px 40px rgba(0,0,0,.4)` (Linear’s rings; Stripe’s hairlines).
- Radii: **0 px dominates overwhelmingly** — linear 2317, gtfo 301, innersloth 228, kineticgames 216, teenage.engineering 189, halfmermaid 156, playdead 64, rauno 84. Non-zero radii exist only for pills (9999 px) and simulated window chrome (Raycast 11 px, DBD 3.75 px badges).

### 3.4 Motion — durations, easing, and CSS vs JS
| Purpose | Observed values | Where |
|---|---|---|
| Hover / press | **75 ms** `cubic-bezier(.4,0,.2,1)`; **100 ms** `cubic-bezier(.25,.46,.45,.94)`; 150–200 ms; GTFO `transform 50–100 ms linear` | DBD (38 els), Linear (187 els), GTFO |
| Reveal on enter | **400–700 ms**, ease-out family: `cubic-bezier(.215,.61,.355,1)`, `cubic-bezier(.23,1,.32,1)`, `cubic-bezier(.165,.84,.44,1)`; **stagger 80–100 ms** | Raycast (0.7 s @ 100/180/260/340/420 ms), Linear, Halfmermaid, Kinetic |
| Reveal *shape* | `translateY(24.8px)` + `opacity: 0` → `0 / 1` | Linear (measured in DOM) |
| Ambient loop | `2–3 s linear infinite` (rotations, sweeps) | Linear, Raycast |
| Ambient atmosphere | **90 s and 180 s** `linear infinite` smoke | DBD |
| Colour fade | `color .1s–.4s`; `opacity .25s–.5s linear` with `will-change: opacity` on 14 | Linear, DBD, Kinetic, Halfmermaid |
| Spring | `--spring-1: linear(0 0%, .005927 1%, .022466 2%, …)` — baked `linear()` easing | Raycast |

**CSS vs JS, verified:**
- Everything that animates *by itself* is **CSS**: keyframe counts 300 (Linear), 55 (Raycast), 23 (DBD), 17 (Innersloth), 13 (Halfmermaid), 7 (teenage.engineering), 3 (GTFO), **0 (Stripe — all JS/inline)**, **0 (Kinetic)**.
- Reveal-on-scroll is overwhelmingly **JS observers** (transform+opacity preset in the DOM), not CSS scroll-driven animation.
- **`animation-timeline` appears on only two sites**: `teenage.engineering` (1 rule) and `raycast.com` (2 rules). `view-timeline`/`scroll-timeline`: zero everywhere else. Nobody in this set is using `animation-timeline: view()` at scale — it is a genuinely open differentiator, and it costs **0 KB of JS**.
- GSAP was not detected on any of the 13 sites (`window.gsap === false` everywhere). They hand-roll or use CSS.
- `backdrop-filter` is used sparingly and always shallow: 2.4 px (GTFO panels), 4 px (DBD sticky nav), 5/10/15/20/36 px staged by layer depth (Raycast), 12 px (Stripe mobile menu).

### 3.5 How they present imagery — the important part
1. **Full-bleed graded video loops as the hero**, `object-fit: cover`, `autoplay muted loop playsinline` — GTFO (1440×900 + a 1440×767 lobby loop), DBD (1430×804), Kinetic (1440×900), Playdead (4 clips). Every one is **graded in CSS** (`filter: brightness(.75–.9) saturate()`, `blur(20px)` washes, `rgba(0,0,0,.7)` scrims) so unrelated screenshots look like one shoot.
2. **Pre-rendered animated art instead of layout animation** — Playdead ships 4 tiny looping `.webm` files as its “images”. The page is static; the pictures move. Cheapest perceived-motion win in the entire set.
3. **Blur-up LQIP** — 15 `<picture>` elements with inline `data:image/svg+xml` + 20×13 px base64 JPEG placeholders upscaled to 212×180 (DBD).
4. **Images as content inside simulated chrome** — Raycast’s 117 tiny icons inside a CSS-built macOS window; the chrome is gradients/shadows/blur, not an image.
5. **Near-black translucent panels over full-bleed art, off-centre, radius 0** — GTFO: `rgba(0,0,0,.7)` panel, 1 px border, alternating `Row_start`/`Row_end` (left/right anchoring) so no two art sections have the same composition.
6. **One giant static photograph as the whole homepage** — teenage.engineering (1440×1920 webp, eager).
7. **Section silhouettes as masks** — Kinetic’s torn-paper `top-diagonal-up` / `bottom-diagonal-down` edges between bands.
8. **Textures built from CSS, not files** — vertical scanlines (Halfmermaid background), the tick-mark ruler `linear-gradient(90deg, rgb(99,92,97) 2px, transparent 0)` (GTFO), `radial-gradient(circle, rgba(255,255,255,.04) 0, transparent 50%)` dot washes and self-animating grid dots (Linear).
9. **Whole-page luminosity inversion via an SVG filter** — `filter: url("#luminosity-invert")` (teenage.engineering) flips the site to light mode without touching a single image.
10. **Grayscale-until-hover** — `grayscale(1)` on 24 (Raycast) / 36 (DBD) elements → `grayscale(0)`. Instantly unifies a wall of mismatched screenshots and gives the accent colour somewhere to land.

### 3.6 What actually makes these feel expensive
1. **Type conviction.** One or two families, *customised* (Linear’s `font-feature-settings: "cv01","ss03"`, teenage.engineering’s bespoke `te-20`/`te-40`), negative tracking at display sizes, proportional tracking on uppercase, 1.0–1.25 leading on posters.
2. **A complete, named neutral ramp and depth from 1 px rings** instead of card shadows.
3. **A rhythmic spine**: 110–225 px section padding, repeated identically.
4. **One accent with a job.** Nothing else is coloured.
5. **Zero-radius geometry + hairlines.** Cheaper *and* better than any card style.
6. **Motion that is small in distance and short in duration** (24 px, 400–700 ms, ease-out), plus exactly one long slow ambient loop for atmosphere.
7. **Graded media.** Same camera/exposure/palette across every screenshot — and no stock photography anywhere in the set.

---

## 4. What we should steal (12 adoptable techniques)

Risk = page-performance impact.

**S1. vw-proportional type ramp with linear steps** — *teenage.engineering.*
`--u: calc(100vw / 980); --fs-1: calc(var(--u) * 18); --fs-2: calc(var(--u) * 36); --fs-3: calc(var(--u) * 54); --fs-4: calc(var(--u) * 72);` wrapped in `clamp(14px, …, 72px)` for a floor/ceiling. Verified behaviour: 390→10.35 px … 1440→19.10 px for the same token; the layout is optically identical at every width with **no type breakpoints at all**. **Risk: none** (pure CSS custom properties).

**S2. Micro-readout system: 10–13 px uppercase mono, tracking 0.08–0.12em, 55 % opacity** — *raycast.com (12 px / ls 1.44 px), deadbydaylight.com (14 px w700 / ls 0.05em), gtfo (15 px Share Tech Mono).*
`.readout { font: 500 12px/1 var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: color-mix(in oklab, var(--fg) 55%, transparent); font-variant-numeric: tabular-nums; }` For STATIC this is your “facility label” layer and it replaces the eyebrow/`<small>` tags. **Risk: none.**

**S3. Hairline grid + 1 px inset rings instead of shadows or cards** — *stripe.com (visible 1 px vertical rules at container edges), linear.app (`rgba(255,255,255,.05) 0 0 0 1px inset`, 2317 zero-radius elements), teenage.engineering (`--grid-divider: 1.5px`).*
`.grid { border-inline: 1px solid color-mix(in oklab, #fff 8%, transparent); } .panel { border-radius: 0; box-shadow: inset 0 0 0 1px #ffffff0f; }` plus a `repeating-linear-gradient` tick ruler for dividers. **Risk: none** — and it directly satisfies the “no rounded-2xl soft-shadow cards” rule.

**S4. Full-bleed in-game video hero, graded in CSS, with a static poster fallback** — *gtfothegame.com, deadbydaylight.com, kineticgames.co.uk.*
`<video autoplay muted loop playsinline preload="metadata" poster="hero.avif">` + `.hero video { object-fit: cover; filter: brightness(.82) saturate(.85) contrast(1.06); }` + a `::after` scrim `linear-gradient(180deg, #0A0A09 0%, transparent 38%, #0A0A09 100%)`. Pause off-screen with one IntersectionObserver. **Risk: medium** — mitigate: one clip ≤ 3 MB, 1920×1080 webm/av1, 6–8 s loop, poster always present, `@media (prefers-reduced-motion: reduce)` → poster only.

**S5. Ship short looping clips as the “screenshots”** — *playdead.com* (4 × `<video autoplay loop muted playsinline>` at 438×575 / 900×488, `object-fit: contain`).
For STATIC: 2–4 gameplay loops (hunter approach, salvage pickup, pod closure) in the gallery instead of static PNGs. Perceived motion without a single line of animation code. **Risk: medium** — cap at 3 clips ≤ 1.2 MB each, `loading="lazy"`-equivalent: only `play()` when in view, `muted` + `playsinline` mandatory for iOS.

**S6. Diegetic “data” panel over art: off-centre, near-black, 1 px border, 2–4 px blur** — *gtfothegame.com.*
`.panel { position: absolute; inset-block: 12%; inset-inline-start: 7%; max-inline-size: 44ch; background: rgb(10 10 9 / .74); border: 1px solid #ffffff1a; backdrop-filter: blur(3px); }` — and alternate `inset-inline-start` / `end` per section like GTFO’s `Row_start` / `Row_end`. **Risk: low** (blur ≤ 4 px on ≤ 4 elements; never animate the blur).

**S7. Terminal spec table as a hero-grade design object** — *gtfothegame.com System Requirements grid.*
For STATIC: a “SESSION PARAMETERS” mono table — Players 1–4 · Platform Roblox · Genre co-op asymmetrical horror · Status in development · Download free — with `border-collapse` hairlines, `tabular-nums`, and a right-aligned value column. **Risk: none.**

**S8. CSS-only reveals with `animation-timeline: view()`** — *verified in production at raycast.com (2 rules) and teenage.engineering (1 rule); nobody else in the set uses it.*
```css
@keyframes rise { from { opacity: 0; translate: 0 24px } }
.reveal { animation: rise .6s cubic-bezier(.215,.61,.355,1) both; animation-timeline: view(); animation-range: entry 12% cover 34%; }
@media (prefers-reduced-motion: reduce) { .reveal { animation: none } }
```
Zero JavaScript, matches the 24 px / 400–700 ms ease-out shape that Linear and Raycast use, and degrades to “content simply visible” in older browsers. **Risk: none.** (GSAP ScrollTrigger only if you later need pinning/scrubbing — and note *no site in this set uses GSAP at all*.)

**S9. Spring easing baked as a `linear()` function** — *raycast.com* (`--spring-1: linear(0 0%, .005927 1%, .022466 2%, …)`).
`--ease-spring: linear(0, .0039 1.1%, .0157 2.3%, .0345 3.6%, .1058 8.1%, .184 12.4%, .3333 22%, .4 30%, 1);` gives an Apple-style spring with **no JS and no library**. Use for the one or two “mechanical” motions a terminal UI deserves (panel latch, readout settle). **Risk: none.**

**S10. Long, slow ambient texture loop for atmosphere** — *deadbydaylight.com* (`90s linear infinite` + `180s linear infinite reverse` smoke) and *raycast.com* (`2–3 s linear infinite` micro-motion).
One full-bleed fog/dust/grain layer at 4–8 % opacity, `transform: translate3d()` only, `will-change: transform` on **one** element, `pointer-events: none`, killed under reduced motion. **Risk: low** if you animate `transform` only (one composited layer) — **high** if you animate `filter`/`background-position` or use a blur.

**S11. Diegetic material instead of glassmorphism** — *raycast.com.*
Rebuild the “facility terminal panel” the way Raycast builds its macOS window: `radial-gradient(75% 75% at 50% 92%, #141513 0%, #0C0C0B 100%)` body, 1 px outer ring `#1B1C1E` + 1 px inset `#07080A`, one shared multi-layer shadow, `backdrop-filter: blur(4px)` **only on the chrome**, plus a 3 %-opacity scanline overlay. It reads as a physical device rather than “a blurred card”. **Risk: low–medium** (keep `backdrop-filter` to ≤ 3 surfaces).

**S12. Grayscale-until-hover media + one live tabular readout** — *raycast.com* (`grayscale(1)` on 24, `grayscale(.5)` on 18, `plus-lighter` on 7) and *stripe.com* (live eyebrow “Global GDP running on Stripe: 1.73335807 %” with `tabular-nums`).
`.shot { filter: grayscale(1) contrast(1.05); transition: filter .4s cubic-bezier(.23,1,.32,1) } .shot:hover { filter: none }` — gate hover with `@media (hover: hover)`. Plus one diegetic counter (“SALVAGE RECOVERED 1,284,003”) with `font-variant-numeric: tabular-nums`, animated once over ~1.2 s on entry. **Risk: none / low** (a single bounded rAF run, not a permanent loop).

**Runners-up worth noting:** proportional letter-spacing on uppercase (DBD’s constant 0.05em — S2 can absorb it); SVG-filter luminosity inversion for a light “overlay/HUD” mode (teenage.engineering, zero image cost); torn/diagonal section silhouettes via `clip-path`/`mask-image` (Kinetic — take the silhouette, not the paper).

---

## 5. What we should NOT do

1. **Purple/indigo gradient meshes or aurora canvases.** Stripe’s hero is a JS canvas mesh; it is beautiful and it is exactly the banned category. **High cost**, and it destroys the single-accent rule.
2. **WebGL-first experiences.** igloo.inc and activetheory.net both refused to render for me at all (WebGL2 check / UA gate). A site you cannot verify on a normal machine is a site you cannot guarantee for a Roblox audience on school laptops and mid-tier Android. **High cost, high risk, and it fights the “real in-game screenshots” premise.**
3. **Generic blurred glass cards.** Raycast’s translucency works because it simulates *stacked OS window layers* with 4-layer shadows, radial-gradient bodies and staged blur. Copy only the `backdrop-filter` and you get the templated look. Six or more large blurred surfaces is a documented jank source on mid-range Android.
4. **9 MB of art direction.** deadbydaylight.com ships 9.2 MB / 84 requests for a 4 376 px page. Budget instead: **≤ 1.2 MB total page weight, ≤ 250 KB per screenshot** (AVIF/WebP, 1600 px wide, `srcset`), ≤ 2 video loops.
5. **Rounded-2xl soft-shadow cards.** Measured radii across the premium set: 0 px wins by 10–30× (2317 / 301 / 228 / 216 / 189 / 156 / 84). Nobody in this set uses a 16 px-radius card with a large soft drop shadow.
6. **Multi-hue, per-section palettes.** Innersloth runs 51 colour tokens across 8 hues and a new background per section — that is the “well-made template” smell. DBD’s discipline (black + white + one red family) is the model.
7. **Emoji bullets and centered-everything.** That is literally the DOORS marketplace page (🚨🔥⭐🎵 in the description). Do not reproduce the platform page as a website.
8. **Serif display + paper/ink textures.** Kinetic Games’ Spectral SC + torn-paper edges + off-white cards is a *beautiful* indie-print identity and the opposite of a facility terminal. Steal the section-silhouette idea; leave the paper.
9. **Long PNG-sequence smoke loops.** DBD’s 90 s/180 s smoke is an enormous asset behind a modest visual. A 30 s looping webm fog at 30 % opacity, or CSS-only animated grain, buys the same atmosphere at 1 % of the weight.
10. **Parallax on every band.** GTFO carries a `paralax-lev` class on its section bars; overdone parallax reads cheap and fights `content-visibility`. One layer maximum — and prefer `animation-timeline: view()` over scroll listeners.
11. **Custom cursors / `mix-blend-mode: difference` overlays.** rauno.me’s difference-blended SVG is gorgeous and forces a large composited layer on every pointer move; on a game site it reads “agency portfolio”. Skip.
12. **Hover-only content reveals.** Raycast and Kinetic gate information behind hover. Mobile has none. Always wrap in `@media (hover: hover)` and provide the static state as the default.

---

## 6. Blunt opinion: the two techniques that would most improve a dark, screenshot-heavy game site

**First: full-bleed, CSS-graded in-game video loops (S4 + S5), with static posters as the fallback.**
The brief says the site has *real in-game screenshots*. GTFO, Dead by Daylight, Phasmophobia and Playdead all answer that brief the same way, and it is not with PNGs: they put moving, colour-graded, edge-to-edge footage on the page and let a near-black panel sit on top of it. That combination — `object-fit: cover`, `filter: brightness(.82) saturate(.85)`, a 70 % black panel with a 1 px border, radius 0 — is what makes those sites feel like the game is *in the room* rather than in a carousel. It also solves the hardest problem this redesign has: STATIC’s screenshots are dark, noisy and mismatched in exposure; `filter: brightness()/saturate()/contrast()` plus a scrim is a five-line CSS grade that makes eight screenshots from eight sessions look like one art direction. The cost is real (1.5–3 MB per clip) so cap it at **two clips**, each ≤ 3 MB, 6–8 s, `preload="metadata"`, `poster` mandatory, `playsinline muted loop autoplay`, paused off-screen, replaced by the poster under `prefers-reduced-motion`. Two clips and a grade is the single largest perceived-quality jump available per byte spent.

**Second: the mono-readout system — hairline grid + uppercase mono micro-labels + tabular readouts + a spec table (S2 + S3 + S7 + S12’s counter).**
This is the redesign’s actual thesis — “diegetic facility UI, a terminal inside the game’s universe” — expressed entirely in CSS, and it is the cheapest differentiator in the whole teardown. GTFO is the proof: Share Tech Mono for every label and spec against Oxanium posters, 7 colour tokens, radius 0 on 301 elements, 176 px rhythm, one amber accent on 6 % of text nodes — and the whole site transfers **356 KB**. That is the same structural split STATIC already has (Chakra Petch display / JetBrains Mono labels), which means you are not adopting a foreign language, you are finishing the one that is already there. Linear, Stripe and Raycast show the modern grammar of the same device: 1 px rings instead of card shadows, `rgba(255,255,255,.05)` surfaces, 12 px/0.12em uppercase mono eyebrows, `tabular-nums` on every number, and hairlines drawn at the container edges so the page looks engineered. It costs ~0 KB, scales to every page, works identically on mobile, and is the reason GTFO, Linear and Stripe look *built* while Innersloth and the DOORS page look *themed*. Pair it with the CSS-only `animation-timeline: view()` reveal (24 px rise, 600 ms, ease-out — S8): the two sites that already do this in production are the two most restrained sites in the set, and no reference site ships GSAP.

---

## 7. Evidence index

Everything is in `D:\roblox game 4\_ref-audit\`:

- `<slug>-desktop-full.png` / `-partNN.png` — desktop 1440×900 full-page
- `<slug>-desktop-01|02|03.png` — viewport frames at scroll 0 / 33 % / 66 %
- `<slug>-mobile-full.png`, `-mobile-01|02.png` — 390×844 (Chrome Android UA, touch emulation)
- `previews/` — downscaled copies of the tall full-page images
- `<slug>-probe-desktop.json`, `-probe-mobile.json` — computed type scale, root tokens, colour histograms, sections, media inventory, sticky/fixed elements, `@keyframes` inventory, `animation-timeline` counts, library detection, perf timings
- `<slug>-tokens.json` + `<slug>-styles.css` — full CSS text, breakpoints, radii/shadows/backdrop/gradient/transition/animation value histograms
- `<slug>-widths.json` — the type scale re-measured at 1440/1200/1024/768/390
- `<slug>-motion-desktop.json` — transform/opacity sampling at scroll 0/900/2200 + elements with a live `animation-timeline`
- `SUMMARY-desktop.txt`, `SUMMARY-brief.txt`, `SUMMARY-tokens.txt` — condensed readable dumps
- `capture.log`, `pass2.log` — run logs; `tools/` — the CDP harness (`cdp.js`, `run.js`, `run2.js`, probes, summarizers)

Sites with full artifacts: teenage-engineering, linear, stripe, raycast, playdead, gtfo, deadbydaylight, kineticgames, halfmermaid, rauno, innersloth, doors-roblox (partial artifacts: igloo, activetheory — WebGL blocked).
