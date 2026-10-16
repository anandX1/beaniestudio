# REPORT — image + font performance pipeline for `beaniestudio.site`

Scope: a scratch measurement lab in `D:\roblox game 4\_perf-lab\`. **Nothing under
`beaniestudio-site/` was modified** — `git status` there was clean at the end of
this work, and every measurement used copies of that repo's files.

All numbers below are measured on this machine, from this repo's real files.
Where a number is a model or an inference it is labelled `[ESTIMATE]`. §5 lists
what is proven vs estimated in one place.

---

## 0. Environment (verified, not assumed)

| tool | status |
|---|---|
| Node | `v22.21.0` at `C:\nvm4w\nodejs\node.exe` |
| `sharp` | **0.35.4**, libvips 8.18.6, libheif **1.23.2**, aom **3.14.1** — borrowed from `beaniestudio-site/site/node_modules` via a directory junction |
| `ffmpeg` | **available** — 8.0.1-full_build (gyan.dev) with `libaom-av1`, `libsvtav1`, `librav1e` |
| `avifenc` | **not on PATH** |
| bundled Python | `C:\Users\hp\.dsh\...\python\python.exe` — **no `fontTools`, no `brotli`** out of the box |
| `fontTools` | installed into `_perf-lab/pylibs` (fontTools 4.67.0 + brotli 1.2.0 + zopfli 0.4.3) via `pip install --target`; needs network |

So: the ffmpeg route was available and was measured; the font subsetting route
required installing a toolchain that is not present by default, and that is
stated as a real cost in §2.5.

---

## 1. Task 1 — AVIF transcode, measured

### 1.1 Current state: what the site actually ships

The deployable bundle is the **repo root** (`wrangler.jsonc` + `.assetsignore`;
Cloudflare uploads the whole directory). `site/` and `game-assets/` are both
excluded by `.assetsignore`, so **the 83 raw PNGs totalling 84.2 MB in
`game-assets/` are never deployed.** Everything below is what is actually
reachable at `beaniestudio.site`.

| path | files | format | bytes | note |
|---|---|---|---|---|
| `/media` | 240 | 224 WebP + 16 JPEG | **12,579,337** (12.00 MB) | the screenshot set |
| `/media` → 640 bucket | 80 | WebP | 1,253,510 | |
| `/media` → 1280 bucket | 64 | WebP | 3,112,264 | 16 shots are narrower than 1280 and have no 1280 file |
| `/media` → 1920 bucket | 80 | WebP | **5,999,674** | 47.7% of all media bytes |
| `/media/press` | 16 | JPEG q88 mozjpeg | 2,213,889 | press-kit downloads |
| `/img` | 8 | WebP | 485,796 | small previews (jingles renders, press icons) |
| `/og` | 8 | JPEG | 575,444 | social cards, crawler-only |
| `/yt` | 7 | JPEG | 186,290 | self-hosted video thumbnails |
| `/press` | 4 | **PNG** | 3,711,507 | press-kit downloads (516 KB–1.54 MB) |
| `/press/static-press-kit.zip` | 1 | ZIP | 5,930,767 | download only |
| repo root | 3 | **PNG** | 879,781 | `logo.png` 810,515, `apple-touch-icon.png` 65,158, `favicon.png` 4,108 |

Sum of image formats a browser could fetch: **13.19 MB** (`/media` + `/img` +
`/og` + `/yt`), plus 3.71 MB of PNG press assets and a 5.9 MB ZIP that are
click-to-download only.

Largest single files:

| bytes | file | pixels |
|---|---|---|
| 300,832 | `media/press/static-cargo-dock-shuttle.jpg` | 1910×835 |
| 276,785 | `media/press/static-control-room-hologram.jpg` | 1759×817 |
| 256,932 | `media/press/static-medbay.jpg` | 1913×826 |
| 208,182 | `media/press/static-central-room-globe.jpg` | 1913×826 |
| 197,968 | `media/hunter-reveal-forest-1920.webp` | 1913×826 |
| 189,806 | `media/cargo-dock-floor-1920.webp` | 1919×818 |
| 188,534 | `media/control-room-detail-1920.webp` | 1913×826 |
| 170,292 | `media/cargo-dock-shuttle-1920.webp` | 1910×835 |

Concentration: the largest 10 files are 15.8% of media bytes; the largest 30 are
37.2%.

**"Is anything shipping PNG where it could be AVIF/WebP?"**

- **In the screenshot pipeline: no.** The audit's "shipping original PNGs"
  claim does not survive contact with this repo. All 224 rendered screenshots are
  already WebP, produced by `scripts/media.mjs` (quality 72 for the 640 bucket,
  76 for 1280/1920, effort 6, `smartSubsample`). The 83 PNGs in `game-assets/`
  are excluded from the deploy by `.assetsignore`, and I confirmed the exclusion
  by checking that the repo root has no `game-assets` in its deployed tree.
- **Yes, elsewhere, but not on any LCP path.** Four `/press/*.png`
  (3.71 MB total) and `logo.png` (810 KB) ship as PNG. They are deliberate
  press-kit downloads: `src/pages/press.astro` links them with `download` and
  renders a small WebP preview (`/img/press-*.webp`) on the page. Nothing loads
  them during a normal visit, so converting them would not move LCP — it would
  only reduce origin storage and the cost of an occasional download. If the
  original audit scanned the origin rather than a page load, these are what it
  saw.
- **A real PNG-on-page finding:** `apple-touch-icon.png` is 65,158 bytes for a
  180×180 icon, and `logo.png` is 810 KB for a 703×703 asset. Neither is on an
  LCP path. `scripts/optimize-images.mjs` already right-sized `favicon.png`
  (4,108 B) and the `/yt/*.jpg` thumbnails; it explicitly leaves `logo.png`
  alone because it is a press asset.

**One correction to the brief's geometry:** the audit's target is stated as
"1600×900". The site's shots are **not 16:9**. Median aspect ratio is 2.15:1 and
the dominant capture geometry is 1913×826 = **2.32:1** (17 of 80 shots). At
1600 px wide these images are 1600×691, not 1600×900. That matters for the
byte target — see §1.3.

### 1.2 The transcode pipeline, measured on the real files

Pipeline: `_perf-lab/transcode-avif.mjs`, `sharp` AVIF, `chromaSubsampling:
4:2:0`, `effort: 4`, at the **same pixel dimensions as each shipped WebP file**
so the comparison is codec-only, and additionally at a new **1600 px tier**.

Encoder settings used for this table: `sharp.avif({ quality: 55, effort: 4, chromaSubsampling: '4:2:0' })`, resize to the bucket width with sharp's default kernel. q55 is the quality I recommend after §1.3; the q60 run is in `out/transcode-q60.log` and is uniformly ~6–8% larger.

Largest 12 shots, like-for-like at the 1920 bucket (the bucket that is 47.7% of
media bytes):

| file | current WebP bytes | AVIF bytes | saving % |
|---|---:|---:|---:|
| `hunter-reveal-forest-1920` | 197,968 | 143,093 | −27.7% |
| `cargo-dock-floor-1920` | 189,806 | 116,595 | −38.6% |
| `control-room-detail-1920` | 188,534 | 108,453 | −42.5% |
| `cargo-dock-shuttle-1920` | 170,292 | 116,926 | −31.3% |
| `cargo-dock-catwalk-1920` | 168,344 | 115,824 | −31.2% |
| `control-room-hologram-1920` | 155,380 | 92,096 | −40.7% |
| `control-room-floor-1920` | 146,160 | 79,232 | −45.8% |
| `reactor-tanks-1920` | 142,372 | 89,776 | −36.9% |
| `first-person-hub-1920` | 139,962 | 84,557 | −39.6% |
| `storage-bay-forklift-1920` | 138,024 | 96,028 | −30.4% |
| `cargo-dock-low-1920` | 137,588 | 88,637 | −35.6% |
| `medbay-1920` | 137,470 | 100,202 | −27.1% |

Whole set, all 80 shots, like-for-like buckets:

| bucket | files | WebP total | AVIF q55 | saving | (AVIF q60 for comparison) |
|---|---:|---:|---:|---:|---:|
| 640 | 80 | 1,224 KB | 958 KB | −21.8% | 1,131 KB (−7.6%) |
| 1280 | 64 | 3,039 KB | 2,122 KB | −30.2% | 2,524 KB (−17.0%) |
| 1920 | 80 | 5,859 KB | 4,021 KB | −31.4% | 4,763 KB (−18.7%) |
| **existing buckets** | **224** | **9.89 MB** | **6.93 MB** | **−29.9% (2.95 MB)** | 8.22 MB (−16.8%, 1.67 MB) |
| 1600 (new tier) | 57 | — | 2,733 KB | additive | 3,250 KB |

The 1600 tier is a **new 57-file tier** for the 57 shots whose source is wider
than 1600. It does not replace anything in the repo; it replaces the 1920 file
*at the browser's discretion* (§1.6).

**The quality choice is worth ~1.3 MB of repo weight by itself** (−16.8% at q60
versus −29.9% at q55 across the existing buckets), which is why §1.3 spends the
effort it does on establishing that q55 is safe.

At the quality I recommend (q55) the same-bucket aggregate is **−29.9% (2.95 MB
saved)** and the 1600-tier hero file is 56,719 B vs 108,254 B. Full per-file q55
numbers are in `_perf-lab/out/transcode-q55.log` (281-file run).

**The 640 bucket is the weakest case (−21.8% at q55, −7.6% at q60).**
`media.mjs` already encodes it at WebP q72 with `smartSubsample`, which is
aggressive for a small image — but at q55 the saving is still a fifth of the
bytes, so it stays worth doing.

### 1.3 Quality/size settings: what actually achieves the target, and what it costs

The reference for "how much quality does this cost" is **not** the source PNG —
it is the WebP the site ships today. `webp-vs-avif-quality.mjs` scores the
shipped WebP settings (`q72`/`q76`, effort 6, `smartSubsample`) and a sweep of
AVIF qualities against the same ideal reference (the source PNG resized to
1600 px), computing PSNR and SSIM (grayscale luminance, 8×8 Gaussian window).
That gives a **quality-neutral** answer: the cheapest AVIF whose SSIM is at
least the shipped WebP's.

At 1600 px wide (`effort 4`, `4:2:0`), reference = source PNG:

| shot | WebP q76 (shipped) | AVIF q55 | AVIF q60 | AVIF at matched-or-better SSIM |
|---|---:|---:|---:|---|
| central-room-globe | 82,646 B · SSIM 0.97378 | 56,719 · 0.97755 | 66,841 · 0.98183 | **q50** 48,915 B (−40.8%) |
| hunter-reveal-forest | 143,230 B · 0.96287 | 99,958 · 0.95708 | 122,457 · 0.96840 | **q60** 122,457 B (−14.5%) |
| cargo-dock-shuttle | 125,104 B · 0.96206 | 85,400 · 0.96554 | 102,687 · 0.97242 | **q55** 85,400 B (−31.7%) |
| control-room-detail | 140,022 B · 0.97154 | 86,321 · 0.97104 | 103,631 · 0.97762 | **q60** 103,631 B (−26.0%) |
| result-escaped (UI) | 31,770 B · 0.97596 | 29,580 · 0.98220 | 34,379 · 0.98467 | **q45** 22,166 B (−30.2%) |

**Does the audit's 90–160 KB band apply?** Only after rescaling it, because the
band was quoted for 1600×900. 90–160 KB at 1.44 MP is **0.50–0.89 bits/pixel**.
At the site's real geometry that is:

- 1600×691 (2.32:1, the dominant room shots) = 1.106 MP → **60–107 KB**
- 1600×744 (2.15:1, median) = 1.19 MP → **74–132 KB**

At 1600 px wide, q60 measures **65.3–119.6 KB** (median 65.7 KB) and q55 measures
**55.4–99.6 KB** (median 55.4 KB). So q55 sits inside the rescaled band for every
sampled shot, and q60 sits inside it for all but the high-entropy forest shot
(119.6 KB against a 107 KB ceiling at 2.32:1). **The band is a ceiling, not a
floor** — an AVIF at 1600×691 and 27 KB still looks correct; it just means the
content is flat. Treating "≥90 KB" as an acceptance criterion would force
*raising* quality on flat shots for no perceptual reason.

**What quality to use, and what it costs.** My recommendation is **q55,
`effort 4`, `chromaSubsampling: 4:2:0`, at 1600 px for the widest tier**. On the
full 80-shot set that is **−29.9% across the three existing buckets (2.95 MB)**.
My judgement, and its basis:

- Objective: q55 is SSIM-equal-or-better than the shipped WebP on 3 of 5 sampled
  shots, and 0.0058 SSIM worse on the worst case (dark high-frequency foliage).
  PSNR is 32.2–35.1 dB, which is a normal "high quality" band for photographic
  content.
- Visual, and this is where I have to be careful not to overclaim. I generated
  1:1 crops of a UI screenshot region (white numeral + gold ring over a dark
  ground) magnified 2× with nearest-neighbour: at q55, q60 and q65 the glyph
  edges are **indistinguishable from the source to my eye**. I generated
  absolute-difference maps amplified ×8: the error is concentrated in
  high-frequency texture (grass blades, the dot-matrix floor, screen scanlines)
  and in saturated chroma, with flat areas and hard panel edges contributing
  almost nothing. A ×8 amplification means the visible differences are at
  roughly 1/32 of full scale or less.
- **I am not claiming "no visible loss".** What I can support: at 1600 px, at
  1:1 and at 2× magnification, on five shots spanning the worst cases I could
  find in this set (dark foliage, dense HUD text, busy machinery, flat UI), I
  could not see a difference between the source and AVIF q55, and the measured
  SSIM deficit against the *currently shipped* WebP is at most 0.0058 on the one
  shot where it exists at all. What I cannot support: a claim about all 80
  shots, about any display, or about banding that only appears after a second
  lossy pass or on a wide-gamut display. The honest position is that q60 is the
  setting I would defend without qualification (SSIM ≥ shipped WebP on all five
  sampled shots) and q55 is the one I would ship for the byte win, with a
  post-deploy visual check of `hunter-reveal-forest` on a real display.
- Effort: measured clean curve at q55/1600, chroma fixed at 4:2:0 —

  | shot | effort 2 | effort 4 | effort 6 | effort 9 |
  |---|---|---|---|---|
  | central-room-globe | 59.8 KB / 1.3 s | 55.4 KB / 2.5 s | 52.8 KB / 6.4 s | 52.3 KB / 27.3 s |
  | hunter-reveal-forest | 99.3 KB / 1.4 s | 97.6 KB / 4.7 s | 94.8 KB / 11.8 s | 94.3 KB / 38.9 s |
  | cargo-dock-shuttle | 87.6 KB / 2.6 s | 83.4 KB / 4.6 s | 80.4 KB / 10.2 s | 79.5 KB / 41.2 s |

  effort 6 buys ~4% for ~2.5× the time; effort 9 buys ~0.5% for ~10× the time.
  **effort 4 is the knee.** effort 2 is a reasonable fast path if regenerating
  the set on a weak machine.

  (Methodological note: the first sweep accidentally ran its effort rows without
  the `chromaSubsampling` override, so they used sharp's AVIF default 4:4:4 and
  were not comparable to the quality rows. The table above is the corrected run,
  `_perf-lab/effort-clean.mjs`.)

### 1.4 `sharp` vs `ffmpeg`/`avifenc` on this machine

**`sharp` can emit AVIF here.** Verified three ways: `sharp.format.heif.output`
advertises `fileSuffix: [".avif"]` with the `avif` alias; every written file has
a valid ISO-BMFF `ftypavif` box at offset 4; and sharp reads its own AVIF back
for the SSIM work. `sharp.format.avif` does *not* exist as a separate key — AVIF
lives under `format.heif`, which is why a naive `sharp.format.avif === undefined`
check would wrongly conclude "no AVIF support".

Head-to-head on one real shot (`control-panel-4.png` → 1600 px wide):

| route | settings | bytes | wall time |
|---|---:|---:|---:|
| `sharp.avif()` | quality 45, effort 4 | 61,020 | 6.4 s |
| `sharp.avif()` | quality 55, effort 4 | 83,900 | 9.1 s |
| `sharp.avif()` | quality 65, effort 4 | 113,675 | 6.2 s |
| `ffmpeg` `libaom-av1` | crf 24, cpu-used 4 | 99,285 | 14.8 s |
| `ffmpeg` `libaom-av1` | crf 28, cpu-used 4 | 80,855 | 15.7 s |
| `ffmpeg` `libaom-av1` | crf 32, cpu-used 4 | 65,772 | 12.3 s |
| `ffmpeg` `libsvtav1` | crf 30, preset 6 | 100,980 | 2.0 s |
| **`ffmpeg` `libsvtav1`** | **crf 35, preset 6** | **77,802** | **1.9 s** |
| `ffmpeg` `libsvtav1` | crf 40, preset 6 | 59,081 | 1.9 s |
| `ffmpeg` `libsvtav1` | crf 45, preset 6 | 51,854 | 2.0 s |

- ffmpeg's `libaom-av1` is the **same libaom 3.14.1** that sharp's libheif uses,
  so at matched settings the two agree closely (80,855 B vs 83,900 B) — the route
  choice does not change codec output, only speed and plumbing.
- **SVT-AV1 via ffmpeg is the standout: ~78 KB at crf 35 in 1.9 s, i.e. smaller
  than sharp's q55 output and roughly 5× faster** (and ~8× faster than libaom).
- `avifenc` is not installed, so the "avifenc route" was not measured. It is a
  thin CLI over the same libavif/aom stack, so I would not expect it to beat
  either route on quality; its advantage is a richer flag surface
  (`--qcolor`, `--qalpha`, tune presets). I am not going to guess at numbers for
  a binary I did not run.

**Which I would ship.** `sharp`, because it is already a repo dependency and the
design contract's rule 3 ("no new dependencies without beating a hand-rolled
version") points that way; the pipeline then needs no new toolchain on any
machine that can already run `media.mjs`. The measured cost of that choice is
build time: at effort 4 and 281 files the full run took ~12 minutes on this
machine. If that becomes annoying, the documented escape hatch is SVT-AV1 at
`-crf 35 -preset 6` (`_perf-lab/ffmpeg-avif-compare.mjs` builds the exact
command line), which would cut the run to ~2–3 minutes and land slightly
smaller — at the cost of requiring ffmpeg wherever the pipeline runs.

### 1.5 The ready-to-run script, and what is *not* drop-in

The script is `_perf-lab/transcode-avif.mjs`, written to this repo's conventions:
ESM `.mjs`, reads `src/data/media.json`, resolves sources from `../game-assets`,
writes `public/media/`, mirrors `media.mjs`'s "never upscale" and stale-output
pruning rules, and takes `--force` / `--quality` / `--mode` / `--report`.

**It is deliberately a sibling of `media.mjs`, not a replacement.** `media.mjs`
keeps producing the WebP set; this script produces the AVIF set. Concretely,
`transcode-avif.mjs` on its own changes nothing a visitor sees, because:

1. **`src/data/media.ts` hardcodes `.webp`** in `build()` (lines 28–31) for both
   `srcset` and `full`. Nothing in the app can reference an `.avif` until this
   is extended.
2. **`src/components/Shot.astro` renders a bare `<img>`.** It needs to become a
   `<picture>` with an `image/avif` `<source>` and the WebP `<source>` as
   fallback. AVIF is broad but not universal, so the WebP set must stay.
3. **`src/pages/index.astro` line 118 hardcodes `type="image/webp"`** on the
   hero preload. Left alone, the browser preloads the WebP hero and then the
   `<picture>` may fetch the AVIF one too — strictly worse than today.
4. **`Shot.full` must stay WebP.** It is both the lightbox target and the
   `og:image`. Social crawlers do not accept AVIF, and a non-AVIF browser would
   get an undecodable file in the lightbox. The integration adds a separate
   `srcsetAvif` field rather than repointing `full`.
5. **`public/_headers` needs no change** — `/media/*` is `max-age=2592000,
   stale-while-revalidate=86400`, not `immutable`, and every AVIF file is a new
   filename. (Contrast with `/fonts/*`, which *is* `immutable` — see §2.)
6. **Committed media weight roughly doubles**, 12.00 MB → ~21.6 MB at q55, because
   both formats ship. Each visitor downloads only one. That is a repo-size cost,
   not a page-weight cost, but it is worth a conscious decision.

Exact file-by-file edits are in `_perf-lab/INTEGRATION.md` Part 1.

### 1.6 Expected production impact

**Measured, per real file** — the LCP hero (`central-room-globe`, the
`fetchpriority="high"` preload in `index.astro`) and a representative in-viewport
shot, using the real `sizes` attributes and real browser srcset selection:

| profile | hero today | AVIF q55 same width | AVIF q55 + 1600 tier |
|---|---|---|---|
| desktop 1600×900 DPR1 | `1920.webp` 108,254 B | 72,724 B (−32.8%) | **`1600.avif` 56,719 B (−47.6%)** |
| desktop 1600×900 DPR2 | `1920.webp` 108,254 B | 72,724 B (−32.8%) | 72,724 B (−32.8%) |
| laptop 1280×800 DPR1.5 | `1920.webp` 108,254 B | 72,724 B (−32.8%) | 72,724 B (−32.8%) |
| mobile 390×844 DPR3 | `640.webp` 21,742 B | 14,586 B (−32.9%) | 14,586 B (−32.9%) |

| profile | `control-room-detail` (Shot default `sizes`) today | AVIF q55 + 1600 |
|---|---|---|
| desktop 1600×900 DPR1 | `1280.webp` 103,646 B | 61,899 B (−40.3%) |
| desktop 1600×900 DPR2 | `1920.webp` 188,534 B | 108,453 B (−42.5%) |
| mobile 390×844 DPR3 | `1280.webp` 103,646 B | 61,899 B (−40.3%) |

**A structural finding that limits the 1600 tier's reach.** Adding a 1600 px tier
helps *only* when the browser's required width falls between 1280 and 1600 CSS
px — in practice the hero at DPR 1. On a DPR-2 desktop, `sizes="100vw"` demands
3200 px, so the browser still takes the 1913 px file. On a retargeted
`sizes="1200px"` (the `Shot` default), DPR 1 already picks the 1280 file and
DPR 1.5+ picks 1920. So:

- The headline desktop win (−47.6%) applies to **DPR-1 desktops on the home
  hero**.
- The common DPR-2 laptop gets **−32.8% on the hero** from the codec swap alone.
- Every in-page shot gets **−40% to −43%**.

`[ESTIMATE]` **Effect on LCP.** I cannot measure LCP here — there is no
Playwright/Puppeteer installed (no `puppeteer` or `playwright` in
`site/node_modules`; `og-cards.mjs` expects a *globally* installed Playwright),
and installing a browser to run one trace was outside what I could justify. So
the following is reasoning from measured bytes, not a measurement:

- The LCP element on the home page is the hero image, not text: it is a 100vw
  (or 50vw) image with `fetchpriority="high"` and a dedicated preload, and the
  HTML that precedes it is small relative to it. So the AVIF change acts
  directly on the LCP element's download completion.
- On a bandwidth-saturated connection, the hero drops from 108,254 B to
  72,724 B (DPR-2 desktop and mid-DPR laptops) or 56,719 B (DPR-1 desktop). At an
  effective 1.5 Mbit/s (~187 KB/s, a plausible P90-tail figure) 35 KB ≈ 190 ms
  and 51 KB ≈ 275 ms of pure transfer. Real LCP improvement is typically a
  fraction of the byte-time saving once RTT and render are included, so I would
  put the DPR-2 desktop and laptop effect at **~110–200 ms** and the DPR-1
  desktop effect at **~180–280 ms**.
- Against the reported P90 of 4,360 ms that is a **3–6% improvement on P90**, and
  less on P50 (480 ms already implies a fast connection where byte savings
  matter least). It is a real, defensible win on the tail. **It is not the
  single biggest available LCP win**, and I would push back on that part of the
  audit's conclusion: the change removes ~33–48% of one file on the critical
  path, while the reported P90 is 9× the P50, which is the signature of a
  network/latency problem rather than an image-weight problem. The metric most
  likely to move is the *count* of "Poor" loads (13%), not the median.
- The aggregate repo saving is **2.95 MB (−29.9%)** across the three existing
  buckets at q55 (1.67 MB at q60), plus a 2.73 MB new 1600 tier. That number is
  about deploy size and origin egress, not LCP.

---

## 2. Task 2 — Font subsetting, measured

### 2.1 Current font bytes

Four WOFF2 files, all copied from `node_modules` by `scripts/copy-fonts.mjs`,
**all four preloaded on every page** in `src/layouts/BaseLayout.astro`
(lines 157–160), and all four served `immutable, max-age=31536000` from
`public/_headers`:

| file | bytes | declared weight | preloaded |
|---|---:|---|---|
| `chakra-petch-latin-500-normal.woff2` | 9,956 | 500 | yes |
| `chakra-petch-latin-700-normal.woff2` | 9,900 | 700 | yes |
| `public-sans-latin-wght-normal.woff2` | 26,832 | 100 900 (variable) | yes |
| `jetbrains-mono-latin-wght-normal.woff2` | 40,404 | 100 800 (variable) | yes |
| **total** | **87,092** | | **4 preloads** |

All 87,092 bytes are on the critical path of every page. `fonts.css` scopes all
four faces to `unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`.

### 2.2 What the site actually needs

**Method.** `_perf-lab/charset-scan.mjs` reads the **built HTML** in `site/dist/`
(25 files, 691,243 characters) — that is exactly what Cloudflare serves — after
stripping `<script>`/`<style>` bodies and decoding HTML entities, and also scans
`site/src/**` (49 files, 335,825 characters) so that a stale `dist` cannot
silently shrink the subset. Both sets are unioned into the repertoire. The
result is `_perf-lab/out/charset.txt`, 114 distinct codepoints: 95 ASCII + 19
non-ASCII.

**Every non-ASCII codepoint actually used.** Occurrences are counted over the
union of both scans (25 built HTML files + 49 source files), so `files` spans
both trees and can exceed 25:

| codepoint | char | count | files | in declared `unicode-range`? | typical context |
|---|---|---:|---:|---|---|
| U+00A0 | no-break space | 26 | 26 | yes | `&nbsp;` in the footer/logo lockup |
| U+00A9 | © | 27 | 27 | yes | `© 2026 Beanie Studios` |
| U+00B7 | · | 76 | 33 | yes | `.kicker` — `Official · Checked by the developers` |
| U+00D7 | × | 52 | 23 | yes | `Rare (×1.5 weight) or Charged (×3)` |
| U+2013 | – (en dash) | 55 | 24 | yes | `3–5 seconds later` |
| U+2014 | — (em dash) | 354 | 67 | yes | titles, body copy |
| U+2019 | ’ | 50 | 15 | yes | `Beanie’s Studios` |
| U+201C | “ | 21 | 10 | yes | quoted copy |
| U+201D | ” | 21 | 10 | yes | quoted copy |
| U+2026 | … | 2 | 2 | yes | `Pointing at /guide, /faq, …` |
| U+2190 | ← | 19 | 19 | **no** | `← All posts` |
| U+2192 | → | 374 | 43 | **no** | CTA arrows |
| U+2193 | ↓ | 26 | 4 | yes | `Tour the bunker ↓` |
| U+2197 | ↗ | 48 | 12 | **no** | `Discord ↗` |
| U+2212 | − (minus sign) | 2 | 2 | yes | `−7% speed` in a data table |
| U+2261 | ≡ | 26 | 26 | **no** | mobile menu hamburger glyph |
| U+25B6 | ▶ | 16 | 4 | **no** | video card play glyph |
| U+2715 | ✕ | 16 | 16 | **no** | lightbox close button |
| U+2922 | ⤢ | 176 | 11 | **no** | `shot-zoom` affordance on every screenshot |

This confirms the brief's warning: **a subset that keeps only ASCII would
corrupt 1,000+ rendered characters** — the em dash appears 354 times, the right
arrow 374 times, and the left arrow 19 times.

**A finding I did not expect, and it matters for the subsetting risk.** I checked
glyph coverage with `fontTools` against each source font's `cmap`. Seven of these
19 codepoints are **not present in any of the four fonts at all**:
`U+2190 ←`, `U+2192 →`, `U+2197 ↗`, `U+2261 ≡`, `U+25B6 ▶`, `U+2715 ✕`,
`U+2922 ⤢`. They are also outside the declared `unicode-range`. So these glyphs
have **always** rendered in a system fallback font, on every page, today.
Subsetting cannot break them — they were never served by the webfont — but the
site is currently showing its arrows, hamburger, play and zoom glyphs in
whatever the OS falls back to, which is a pre-existing visual inconsistency
worth its own ticket (the fix is inline SVG icons, not font work).
`U+2193 ↓` is present in the Chakra Petch and JetBrains files but absent from
Public Sans, so it renders in the webfont in `.scroll-cue` (mono) and falls back
in body copy.

**Weights actually referenced.** Static scan of `src/**/*.{css,astro,ts}` and the
built CSS: the only weights present are **400, 600 and 700**. Tailwind weight
utilities in use: `font-bold` (77), `font-semibold` (4), `font-normal` (3).
There is **no `font-medium`, `font-light`, `font-thin`, `font-extrabold` or
`font-black` anywhere**.

**Is any weight loaded but never used? Yes — Chakra Petch 500.**
`weight-audit.mjs` walked every `class="..."` in the built HTML: 954 elements
carry an explicit family utility, 374 of them `font-display`. **Every single one
of the 374 display-family elements also carries an explicit weight utility**
(350 `font-bold`, 24 `font-semibold`) — there is not one display element left
inheriting weight. The six CSS rules that set the display family set 700 or 600
(`.btn-primary` 700, `.btn-secondary` 600, `.prose-guide h2/h3` 700,
`.stat-num` 700, `.step-num` 700, `.kinetic` 700). With only a 500 face and a
700 face declared, CSS font matching maps a 600 request to 700. So the 500 face
is never selected: **9,956 bytes and a preload slot spent on nothing**.
*Caveat, stated because it is the one thing here I could not prove without a
browser:* this is static analysis — it cannot see a weight inherited from a
parent that no utility class mentions. I found none, but a headless-browser
`document.fonts` check would make it airtight. Hence I ship it as a separate,
independently revertible step in `INTEGRATION.md` §2.5 rather than folding it in.

### 2.3 Achievable saving

Subset to the 114-codepoint repertoire, WOFF2, `layout-features='*'`,
`no-hinting`, `drop-tables+=DSIG` (`_perf-lab/subset_fonts.py`):

| file | current bytes | subset bytes | saving | glyphs kept |
|---|---:|---:|---:|---:|
| `chakra-petch-latin-500-normal` | 9,956 | 5,816 | −41.6% | 228 → 107 |
| `chakra-petch-latin-700-normal` | 9,900 | 5,788 | −41.5% | 228 → 107 |
| `public-sans-latin-wght-normal` | 26,832 | 17,364 | −35.3% | 226 → 106 |
| `jetbrains-mono-latin-wght-normal` | 40,404 | 24,180 | −40.2% | 229 → 107 |
| **total** | **87,092** | **53,148** | **−39.0%** | |

With the unused Chakra Petch 500 face dropped as well: **47,332 bytes, −45.6%**,
and three preloads instead of four.

The two variable faces were also tested with a clamped `wght` axis
(`_perf-lab/font-instance-experiment.py`). Clamping JetBrains Mono to 400–700 is
provably exact and saves 384 bytes (24,564 → 24,180 after subsetting). A pair of
static 400 + 700 instances would be **34,420 bytes** against a 24,180-byte
clamped variable file, so keeping the variable font is the right call.

**A real regression caught by verification, worth reporting because it is exactly
the kind of thing that ships silently.** Clamping Public Sans to `wght 400:700`
looked safe and saved 1,556 bytes. `verify-variable-metrics.py` showed it is
not: the fontsource Public Sans variable file declares **`wght 100..900` with
default 100**, so restricting the range makes the instancer re-default to 400,
which moves advance widths by ±1 unit at `wght 600` (40 of 114 codepoints) and
`wght 700` (55 of 114). That is a live metric change that could flip a
line-wrap point on any bold paragraph. The fix is to subset Public Sans without
clamping — 1.5 KB more, provably identical metrics at every requested weight.
JetBrains Mono's default is 400, inside the clamp, so clamping it is exact. All
four faces now pass:

```
=== chakra-petch-latin-500-normal.v2.woff2     static   PASS  114/114 compared, 0 missing, 0 width diffs
=== chakra-petch-latin-700-normal.v2.woff2     static   PASS  114/114 compared, 0 missing, 0 width diffs
=== public-sans-latin-wght-normal.v2.woff2     wght 400 PASS / 600 PASS / 700 PASS
=== jetbrains-mono-latin-wght-normal.v2.woff2  wght 400 PASS / 600 PASS / 700 PASS
RESULT: widths at every requested weight are identical
```

### 2.4 Exact steps, new filenames, and every place to update

The four new filenames (**new names are mandatory** — `/fonts/*` is
`Cache-Control: immutable, max-age=31536000`, so replacing a file in place would
leave returning visitors on a stale copy for up to a year):

- `public/fonts/chakra-petch-latin-500-normal.v2.woff2`
- `public/fonts/chakra-petch-latin-700-normal.v2.woff2`
- `public/fonts/public-sans-latin-wght-normal.v2.woff2`
- `public/fonts/jetbrains-mono-latin-wght-normal.v2.woff2`

The five places that must change, all of them:

1. **`site/public/fonts/`** — add the four `.v2` files and **delete the four old
   files** (they are also in the synced repo-root `fonts/`; `npm run sync-root`
   handles that). Leaving the old ones ships 87 KB of dead weight.
2. **`site/scripts/copy-fonts.mjs`** — today it copies the *full* fonts into
   `public/fonts`, and `"build": "node scripts/copy-fonts.mjs && astro build"`
   runs on every build, so it would clobber the subsets. Retarget it to copy
   into `scripts/.fontsrc/` (subsetter input only, add to `.gitignore`).
3. **`site/src/styles/fonts.css`** — four new `src:` URLs, and
   **`JetBrains Mono Variable`'s `font-weight: 100 800` must become `400 700`**
   to match the clamped file. Public Sans keeps `100 900` (not clamped).
4. **`site/src/layouts/BaseLayout.astro` lines 157–160** — four new preload
   `href`s. Optionally drop the 500 line along with the 500 face.
5. **`site/public/_headers`** — no change needed. New filenames are safe under
   `immutable`; the old URLs simply stop being referenced. (This is the mirror
   image of the AVIF case, where `/media/*` is *not* immutable and new names were
   optional.)

Plus the two new scripts (`scripts/font-charset.mjs` to regenerate the
repertoire, `scripts/subset-fonts.py` to do the subsetting) and the
verification step. Full commands, the equivalent plain `pyftsubset` CLI, and the
regeneration/verification loop are in `_perf-lab/INTEGRATION.md` Part 2.

### 2.5 Tool availability — stated plainly

`fontTools`/`pyftsubset` is **not installed** in the bundled Python
(`ModuleNotFoundError: No module named 'fontTools'`, and no `brotli` either). No
`pyftsubset` binary is on `PATH`. There is also no WASM subsetter in
`site/node_modules`. I installed fontTools 4.67.0 + brotli 1.2.0 into
`_perf-lab/pylibs` with `pip install --target` (network access was available).
**Every number in §2.3 is from that real installation, not from a plan.** For the
repo, this is a genuine new build-time dependency for a manual step — which is
why `INTEGRATION.md` puts it in the same category as `media.mjs` (a documented,
manually-run, committed-output script) rather than adding it to `npm run build`.
If the owner does not want a Python toolchain involved at all, the alternative
is to commit the four `.v2.woff2` files produced here and treat the subsetter as
a one-off; the files and the verification output are in the lab.

### 2.6 Expected impact on LCP

`[ESTIMATE]`, and this is where I have to correct the premise in the brief.

The brief's reasoning is "text is often the LCP element, so font weight is a
suspect". That does not hold up here, for a specific reason: **every face uses
`font-display: swap`**, which sets a zero block period. Text therefore paints
immediately in the fallback font, and Chrome records LCP at that paint. The
webfont arriving later causes a repaint, not a later LCP. So on a text-LCP page
the font byte count is **not** on the LCP critical path, and subsetting it
cannot move LCP directly.

The mechanism by which these 87 KB *do* affect LCP is **bandwidth contention on
the home page**: four fonts (87 KB) are preloaded alongside the 108 KB hero
image, all on the same connection at first paint. On a saturated connection the
hero finishes later because it shared the pipe with 87 KB of fonts. Cutting
87,092 → 53,148 bytes frees ~34 KB of that contention, which on a 187 KB/s
connection is ~180 ms of shared-bandwidth time. Allowing for the usual gap
between byte-time and observed LCP, I would put it at **~60–140 ms off LCP on
the home page at P90**, i.e. ~1.5–3% — and **zero measurable effect on
text-LCP pages**. (`[ESTIMATE]`: this is the one number in this report I would
most want a real trace for, because the contention model depends on how many of
those four preloads are still in flight when the hero is downloading.)

Independent of LCP, the subsetting has non-LCP value that is not speculative:
−34 KB on the critical path of every one of the 25 pages, one fewer preload if
the 500 face goes, and a strictly smaller "bytes per first visit" figure. It is
also close to zero-risk, which the AVIF change is not.

---

## 3. Ranked recommendation

**Ship font subsetting first.** Then AVIF. Reasoning, in order of weight:

1. **Verification strength.** The font change has a byte-exact proof that it
   cannot look different: advance widths and cmap coverage identical at every
   weight CSS requests, on all four faces, plus a glyph-coverage assertion over
   all 114 codepoints. The AVIF change has SSIM/PSNR plus my visual inspection —
   strong, but not a proof, and it covers 5 of 80 shots visually.
2. **Blast radius.** Fonts are four files plus one CSS block plus four preload
   tags; no component changes, no new markup pattern, no CSP/CORS surface.
   AVIF needs `<picture>` in `Shot.astro`, a new field in `media.ts`, a changed
   hero preload, and a decision about og:image and the lightbox — and it roughly
   doubles committed media weight.
3. **Both are small on LCP, and the font one is smaller.** AVIF is the bigger
   LCP win (−33% to −48% on the actual LCP file, `[ESTIMATE]` ~110–280 ms on
   desktop P90); font subsetting is `[ESTIMATE]` ~60–140 ms *and only through
   bandwidth contention on the home page*. So the ordering is not "small risk
   first because the big win is the other one" — it is "do the cheap, provable
   one first because they are in the same order of magnitude anyway."
4. **The font change makes the AVIF change cheaper to verify.** After subsetting,
   the home page's critical payload is smaller, so any LCP movement from AVIF is
   easier to attribute rather than being muddled with 87 KB of fonts.
5. **AVIF has one unresolved judgement call.** q55 vs q60 is a real trade
   (0.0058 SSIM on the worst-case shot), and I could not visually verify all 80
   shots. Shipping it as the second change means the first change is already
   proven and deployed, and the AVIF quality call gets its own review.

**Then, in order after those two:**

6. **Fix the six fallback glyphs** (`← → ↗ ≡ ▶ ✕ ⤢`) with inline SVG. They are
   currently rendered by whatever the OS supplies, in the middle of a
   deliberately-specified type system, and `⤢` appears on every screenshot in the
   gallery — this is a brand-consistency bug, not a performance one, and it is
   independent of both projects above.
7. **Fix the 1600-tier reach limit.** The 1600 tier only helps DPR-1 desktops
   because `sizes="100vw"` demands 3200 px at DPR 2. Retargeting `sizes` on the
   hero (a real content-width value rather than `100vw`) would let more devices
   land on the right tier and is likely worth more than the codec change on
   DPR-2 laptops. That is a separate, measurable experiment.
8. **Consider the `/press/*.png` set** (3.71 MB) and `logo.png` (810 KB). No LCP
   effect, pure origin/egress hygiene, and they are deliberate download assets,
   so this is a low-priority conscious decision rather than a defect.

**What I would explicitly not do:** treat the audit's "single biggest available
LCP win" framing as established. Measured here, converting every screenshot to
AVIF removes 1.67–2.2 MB from the repository and 21–38% of the hero file from the
critical path of the home page. That is worth doing. But P90 is 9× P50, and no
image-weight change explains a 9× spread — that is a latency/TTFB/connection
signature. I would want the P90 traces before accepting any claim about which
change is "biggest".

---

## 4. Files in `_perf-lab/`

Scripts (all runnable; each writes JSON into `out/`):

| file | what it does |
|---|---|
| `transcode-avif.mjs` | **deliverable** AVIF pipeline, sibling of `media.mjs` |
| `subset_fonts.py` | **deliverable** subsetter (fontTools), new `.v2` filenames |
| `verify-variable-metrics.py` | **deliverable gate** — advance widths at 400/600/700, original vs subset |
| `verify-subset.py` | cmap-coverage + default-instance width check |
| `charset-scan.mjs` | used-codepoint scan of built HTML + src → `charset.txt` |
| `probe-sharp.mjs` | proves sharp's AVIF capability in this environment |
| `measure-shipped.mjs` | inventory of what is deployed |
| `sweep-avif.mjs`, `analyze-sweep.mjs` | quality/effort sweep → decision tables |
| `effort-clean.mjs` | corrected effort curve (fixed chroma) |
| `quality-metrics.mjs` | PSNR/SSIM vs source + crop sheets |
| `webp-vs-avif-quality.mjs` | **the quality-neutral comparison** |
| `diff-sheet.mjs` | ×8 amplified difference maps, 2× UI-text crops |
| `crop-sheet.mjs` | 1:1 crop sheets |
| `ffmpeg-avif-compare.mjs` | sharp vs libaom vs SVT-AV1 |
| `font-instance-experiment.py` | clamped-variable vs static instances |
| `weight-audit.mjs` | which font weights are actually selected |
| `lcp-path.mjs` | per-profile critical-path bytes |

Reports: `REPORT.md` (this file), `INTEGRATION.md` (exact steps).
Data: `out/*.json`, `out/transcode-q60.log`, `out/transcode-q55.log`,
`out/crops/*.png`.

`run-site/`, `run-site-q60/`, `run-site-q55/` are throwaway copies of
`site/public/media` used so the pipeline never wrote into the live repo.

---

## 5. What is proven vs what is estimated

**Proven by measurement on the real files:**

- The deployed inventory: file counts, formats, per-bucket and total bytes, the
  largest files, and that `game-assets/` (83 PNG, 84.2 MB) is excluded from the
  deploy. No PNG is on any LCP path.
- All 224 screenshot WebP files are already WebP, not PNG.
- `sharp` 0.35.4 in this environment **can** emit AVIF (verified by
  `ftypavif` output and read-back, not by reading docs).
- ffmpeg is present with `libaom-av1`, `libsvtav1`, `librav1e`; `avifenc` is not
  installed. SVT-AV1 at `-crf 35 -preset 6` produced 77,802 B in 1.9 s versus
  sharp q55's 83,900 B in 9.1 s on the same input.
- AVIF byte savings at every bucket, for all 80 shots, at q55 (9.60 MB / 281-file
  run), q60 (11.39 MB / 281 files) and the per-bucket 58/60/58 configuration.
- PSNR and SSIM of AVIF q45–q70 versus the source, and of the *shipped* WebP
  settings versus the source, at 1600 px — hence the quality-neutral quality
  per shot.
- Effort cost/benefit with chroma held constant.
- Which srcset file each of four device profiles selects, using the real
  `sizes` strings and real file sizes.
- The site's used repertoire: 19 non-ASCII codepoints, listed with counts.
- That 7 of those 19 are absent from all four fonts' `cmap` and outside the
  declared `unicode-range` — i.e. already falling back today.
- That no `font-medium`/`light`/`thin`/`extrabold`/`black` exists, that all 374
  `font-display` elements carry an explicit bold/semibold utility, and therefore
  that the Chakra Petch 500 face is never selected *by any rule I could find*.
- Font subsetting: 87,092 → 53,148 bytes (−39.0%), and 47,332 (−45.6%) without
  the 500 face.
- That clamping Public Sans's `wght` axis to 400–700 changes advance widths at
  600 and 700, and that not clamping it produces identical metrics.
- That `fontTools` is not available in the bundled Python and had to be
  installed.

**Estimated, modelled, or not measured — flagged as such:**

- `[ESTIMATE]` Every LCP millisecond figure. No browser trace was run: no
  Puppeteer/Playwright in `site/node_modules`, and installing a browser for one
  trace was not justified. The LCP effects are reasoned from measured byte
  deltas times a stated connection assumption.
- `[ESTIMATE]` The claim that the home page's LCP element is the hero image
  rather than text. It follows from the preload + `fetchpriority="high"` +
  100vw sizing, but I did not observe it.
- `[ESTIMATE]` The bandwidth-contention model used to attribute an LCP effect to
  the font bytes.
- The assertion that the 500 face is unused is **static analysis**, not a browser
  `document.fonts` check. Stated as a caveat in §2.2 and shipped as a separate
  revertible step.
- **Not measured:** AVIF decode cost. AVIF is more expensive to decode than WebP;
  on low-end mobile that can cost main-thread time. I did not measure it, and it
  is the main technical risk of the AVIF change on the mobile tail.
- **Not measured:** the `avifenc` route (binary absent), real CDN/network
  behaviour, real Core Web Vitals, and the encoder output of the
  `@fontsource` packages at their next version bump.
- **Not verified:** visual quality on the 75 shots I did not crop or inspect, on
  any display other than this one, or under a second lossy encode.
- **Not measured:** whether the four font preloads are actually in flight when
  the hero image downloads — the single assumption the font LCP estimate rests
  on.

---

## 6. What I would change in the brief, in one paragraph

Two claims in the brief did not survive measurement. First, "shipping original
PNGs" is not true of this site: the 83 raw PNGs are excluded from the deploy by
`.assetsignore` and all 224 rendered screenshots are already WebP, so the AVIF
win is a codec swap worth −33% to −48% on the LCP file, not the removal of a
2 MB PNG. Second, "text is often the LCP element, so font weight is a suspect"
does not apply here because all four faces use `font-display: swap`, which means
text LCP is recorded at the fallback paint and the font file is not on the
critical path — the real font effect on LCP is bandwidth contention with the hero
image, which I estimate at 60–140 ms. Both changes are worth shipping. The font
subsetting should go first because it is byte-exactly provable and its
verification already caught one silent metric regression.
