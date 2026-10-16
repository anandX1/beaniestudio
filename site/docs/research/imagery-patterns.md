# Premium Gameplay-Imagery Treatment — Reference Audit

**For:** `beaniestudio.site` / STATIC: Salvage vs Hunter (80 original in-game screenshots)
**Method:** every site below was loaded live in headless Chrome (`agent-browser` skill, CDP-attached) at 1422×748; screenshots are in this folder; the technical claims are read from the live DOM/CSSOM of the running page, not from memory.
**Constraint that governs everything:** LCP P90 = 4,360 ms, 13 % of loads "poor", currently ~1 KB JS. Nothing here may add bytes to the critical path.

---

## Part 1 — Twelve techniques

### 1. Diegetic "facility monitor" framing
**One line:** the screenshot is not a picture of a place, it is the output of a camera that is *inside* the place — so it ships with a frame, an ID, a sector label and a status bit.

- **Real site:** `https://teenage.engineering/` — `imagery-research/22-teenage-engineering.png`. Confirmed: 1,078 CSS rules, 30 `clip-path`, 2 `mask-image`, 1 rule containing `animation-timeline`. Product imagery presented inside a diegetic instrument panel with readouts, not a gallery. Secondary reference: `https://www.cyberpunk.net/en/` (`03-cyberpunk.png`) uses `clip-path: polygon(...)` chamfered panels — i.e. the frame itself is a machined shape, not a rounded rectangle.
- **How it works technically:** a `<figure>` wrapper with `position: relative; isolation: isolate`, a hairline `border: 1px solid oklch(0.72 0.17 65 / .22)` (the amber accent at 22 % alpha), plus a `::after` scanline plate built from `repeating-linear-gradient(to bottom, oklch(0 0 0 / .28) 0 1px, transparent 1px 3px)` and `mix-blend-mode: multiply`. Corner brackets are two extra `background-image: linear-gradient(...)` layers at `background-position: 0 0, 100% 0, 0 100%, 100% 100%` with `background-repeat: no-repeat`. The HUD row is a `<figcaption>` in Chakra Petch at `letter-spacing: .14em; text-transform: uppercase`. `clip-path: inset(0 round 2px)` or a `polygon()` chamfer replaces `border-radius` for the industrial read.
- **JS:** zero lines. (`data-state` attributes are authored, not scripted.)
- **Performance risk:** **none.** Paint-only, no network, no layout change. Scanlines baked as a 3×3 px repeating SVG/WebP data-URI instead of a gradient are even cheaper on low-end GPUs.
- **Dark industrial horror fit:** **best in class.** This is the only technique in the list that *solves* the mixed-brightness problem instead of hiding it — once every shot sits in an identical frame with identical chrome, exposure differences read as "different cameras in the same facility" rather than as sloppy art direction. Nothing else here is as cheap or as on-theme.

---

### 2. Unified grade stack (brightness/colour normalisation)
**One line:** force every screenshot through the same transfer curve so 80 differently-exposed images become one printed set.

- **Real site:** `https://linear.app/` — `10-linear.png`. Confirmed on the live page: 23 elements with `mask-image`, 35 with a non-`none` `filter`, and `mix-blend-mode` values of `overlay`, `lighten`, `screen` — the dark UI stays within a narrow luminance band across a 9,960 px page. Second reference: `https://raycast.com/` (`05-raycast.png`) — 14 `mask-image`, 64 `filter`, `mix-blend-mode: plus-lighter`. Third: `https://www.apple.com/macbook-pro/` (`18-apple-mbp.png`) — `mix-blend-mode: multiply` and `darken` on imagery, 9 `mask-image`, 79 `clip-path`.
- **How it works technically:** see the full recipe in Part 2. Core properties: `filter: brightness()/contrast()/saturate()/sepia()`, `mix-blend-mode: multiply | soft-light | luminosity`, `object-position`, `radial-gradient` scrims, and an optional SVG `feColorMatrix` (`filter: url(#grade)`).
- **JS:** zero lines. Optionally ~30 lines of Node/Python at build time to *measure* each screenshot's mean luminance and emit a `data-exposure` attribute (or per-image CSS vars `--b/--c/--s`).
- **Performance risk:** **low.** `filter` and `mix-blend-mode` are compositor/paint operations. They do *not* delay decode or first paint of the image itself. Two caveats: (a) a `filter` on a hover/animated element re-rasterises the layer, so don't animate `filter` on 80 thumbnails at once; (b) each `mix-blend-mode` element creates a stacking context and can force a separate composited layer — `will-change` is *not* needed and should be avoided.
- **Dark industrial horror fit:** **excellent, and mandatory for this site.** Grey-on-near-black is muddy by default; the fix (desaturate + slight sepia + luminance clamp) is exactly the "one film stock" look the genre wants.

---

### 3. Luminance-lock duotone (`mix-blend-mode: luminosity`)
**One line:** put every screenshot over a single amber plate with `mix-blend-mode: luminosity` and all 80 images become amber-and-black — exposures become literally indistinguishable.

- **Real site:** `https://nothing.tech/` — `04-nothing.png`. Confirmed live: `mix-blend-mode: difference` in the computed stylesheet (a full inversion grade over imagery) plus a Lenis smooth-scroll instance and 11 `scroll-snap` elements. Secondary: `https://www.playdead.com/` (`09-playdead.png`) uses `mix-blend-mode: overlay` over looping video.
- **How it works technically:**
  ```css
  .shot--lock { background: #F5A623; }
  .shot--lock img { mix-blend-mode: luminosity; opacity: .92; }
  ```
  `luminosity` keeps the *luminance* of the top layer and the *hue/saturation* of the bottom layer — so the accent plate supplies all colour and the photo supplies only light. Zero JS.
- **JS:** zero lines.
- **Performance risk:** **low.** One extra composited layer per image. No network cost.
- **Dark industrial horror fit:** **strong but a commitment.** It destroys the red/blue room lighting that *is* the bunker's atmosphere — so use it for the archive grid, thumbnails, the marquee ribbon and section textures, and **never** on the hero shot or the "Tour the bunker" rooms. It is the single most effective "make 80 mixed shots look art-directed" trick that costs nothing.

---

### 4. Scroll-driven wipe reveal (`clip-path` / `mask-image` + `animation-timeline`)
**One line:** the image is *uncovered* by a moving edge instead of fading in — a shutter, not a dissolve.

- **Real site:** `https://stripe.com/` — `08-stripe.png`. Confirmed live: **90** elements with `clip-path`, 4 with `mask-image`, `mix-blend-mode: multiply`, `hard-light` and `exclusion`, 9 `filter`, 14 `scroll-snap`. Apple's product pages are the reference for the CSS-native path: `https://www.apple.com/airpods-pro/` (`02-apple-airpods.png`) has **3 stylesheet rules containing `animation-timeline` / `animation-range`**, 74 `clip-path`, 7 `mask-image`, 12 `position: sticky`, 31 scroll-snap; `https://www.apple.com/macbook-pro/` (`18-apple-mbp.png`) shows the same profile (3 timeline rules, 79 clip-path, 19 sticky).
- **How it works technically:**
  ```css
  @supports (animation-timeline: view()) {
    .reveal > img {
      animation: wipe linear both;
      animation-timeline: view();
      animation-range: entry 8% cover 42%;
    }
    @keyframes wipe {
      from { clip-path: inset(0 100% 0 0); }
      to   { clip-path: inset(0 0 0 0); }
    }
  }
  ```
  Variants that read as mechanical rather than soft: `inset(0 0 100% 0)` (top-down shutter), `polygon()` for a slanted blade, or `mask-image: linear-gradient(90deg, #000 0 40%, transparent 40%)` with `mask-size: 250% 100%` and `mask-position` animated left→right for a soft-edged wipe. Add `animation-range: cover 0% cover 60%` + `animation-timeline: scroll(root block)` on a `position: sticky` child for a pinned reveal.
- **JS:** zero lines for the reveal itself. Realistically add ~15 lines of `IntersectionObserver` fallback (or just accept the un-revealed state) for engines without `animation-timeline` — Firefox still needs the fallback; Chromium 115+ and Safari 26 ship it. The fallback must be "image is simply visible", never "image is invisible".
- **Performance risk:** **low**, with one hard rule: **never put the LCP element behind a clip-path that starts at `inset(…100%…)`.** Chromium records LCP at the element's first *painted* size; a fully clipped element has zero visible area, so the LCP timestamp effectively becomes the moment the user scrolls. Keep the hero image un-masked and reveal only below-the-fold shots.
- **Dark industrial horror fit:** **excellent.** A hard-edged wipe reads as a blast door, a shutter, a monitor switching on. Opacity fades read as a slideshow — this is the single cheapest way to stop looking like one.

---

### 5. Layered depth parallax
**One line:** foreground / midground / background plates translate at different rates so the frame has physical depth.

- **Real site:** `https://www.firewatchgame.com/` — `01-firewatch.png`. Confirmed live: 5 distinct background-image layers including `images/parallax/parallax0.png` … `parallax3.png` and a mobile keyart fallback, **8 `position: fixed`** elements, and a `parallax` library in the page. Here the canyon is one image and the depth comes from the *site chrome* scrolling over it — worth copying directly.
- **How it works technically:**
  ```css
  @supports (animation-timeline: scroll()) {
    .layer { animation: drift linear both; animation-timeline: scroll(root block); }
    .layer--bg  { --d: 4%;  }
    .layer--mid { --d: 11%; }
    .layer--fg  { --d: 24%; }
    @keyframes drift { to { translate: 0 calc(var(--d) * -1); } }
  }
  ```
  The classic version is `parallax.js` / `data-depth` attributes writing `transform: translate3d()` from a scroll listener (~2 KB), or GSAP `ScrollTrigger` + `yPercent` tweens (lazy-loaded). `background-attachment: fixed` is the zero-JS version but is janky on mobile — prefer the `animation-timeline` route.
- **JS:** zero with `animation-timeline: scroll()`; ~2 KB if using `parallax.js`; ~50 KB gzipped if GSAP + ScrollTrigger.
- **Performance risk:** **low** if only `translate`/`transform` is animated on already-composited layers; **medium** if a scroll listener writes styles synchronously (`scroll` handlers that touch `getBoundingClientRect` cause forced reflow). `background-attachment: fixed` = **high** on mobile.
- **Dark industrial horror fit:** **good, with a caveat.** Firewatch is warm, hand-illustrated and flat — copy the *layering*, not the look. For STATIC the readable version is: a fully black foreground silhouette (pipe, gantry, door frame) over the screenshot, drifting at a different rate. That is a horror-composition device (looking *through* something), not a decorative one.

---

### 6. Pinned scroll-scrubbed sequence
**One line:** scroll position drives a film — video `currentTime` or canvas frame index — so the imagery plays only as fast as the user reads.

- **Real site:** `https://www.apple.com/airpods-pro/` — `02-apple-airpods.png`. Confirmed live: **15 `<video>` elements**, the significant ones `muted`, `loop: true`, no `src` until they enter view; explicit **`hero_startframe__….jpg` and `hero_endframe__….jpg`** still images shipped alongside, plus 3 `animation-timeline` rules and 12 sticky elements. `https://www.apple.com/apple-vision-pro/` (`11-apple-visionpro.png`) is the same machine at scale: 26 videos, 9 sticky, 57 scroll-snap. The canonical frame-based version is documented with a live demo at `https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub/` (`15-gsap-seq.png`, GSAP detected on page).
- **How it works technically:** *Video-scrub (Apple's approach):* a `position: sticky` stage, a `<video muted playsinline preload="none" poster="…">`, and ~25–40 lines of vanilla JS mapping scroll progress to `video.currentTime` (throttled with `requestVideoFrameCallback`). The `startframe`/`endframe` JPEGs are the fallback for reduced-motion and for browsers that never get to play. *Canvas-sequence:* 60–150 preloaded frames drawn into a `<canvas>` on a rAF loop driven by ScrollTrigger (~30 lines + GSAP). *Scroll-driven CSS:* `animation-timeline: scroll(root block)` on a sticky child, which animates a CSS variable consumed by the canvas/`object-position` — zero listener.
- **JS:** 0 if it is a CSS scroll-driven progress bar over stills; ~25–40 lines for video scrub; ~30 lines + GSAP (~50 KB gz) for canvas frames.
- **Performance risk:** **high.** This is the one technique that can eat the whole LCP budget. 90 frames at 1600×900 AVIF ≈ 90 × 120 KB ≈ **10.8 MB**, every byte of which must decode; canvas decode of a 150-frame sequence is a 100–400 ms main-thread stall on a mid-range Android even after download. Video scrub is cheaper if the video is short and `preload="none"` (one ~1–3 MB MP4/WebM instead of 90 images) but still needs the poster to be the LCP element.
- **Dark industrial horror fit:** **very good content-wise, dangerous budget-wise.** A slow push down a corridor, or a door breathing open, is exactly right. But for STATIC's 4,360 ms LCP P90 this can only ever be a *below-the-fold, one-per-page* moment, never the hero.

---

### 7. Cinemagraph / video-loop substitution
**One line:** replace a still with a 2–6 second muted loop where only one thing moves — steam, a light flicker, a hanging cable.

- **Real site:** `https://www.playdead.com/` — `09-playdead.png`. Confirmed live: **4 `<video>` elements**, all `loop: true; autoplay: true; muted: true` with `poster` set — `Game3_Banner780.webm`, `Game3_Banner-bn780.webm`, `LIMBO_game_animated.webm`, `INSIDE_game_animated.webm` — with an `overlay` blend mode over the page plate. Second, and closer to STATIC's genre: `https://gtfothegame.com/` (`23-gtfo.png`, GTFO — dark industrial co-op horror) — 2 looping muted videos (`Trailer_for_website_…`, `lobby_FIX_….mp4` with a poster) and 11 `filter`ed elements. Third: `https://www.cyberpunk.net/en/` (`03-cyberpunk.png`) — `CP2077_UE_KV_Animation_1920x1080.webm`, `loop autoplay muted` with a poster.
- **How it works technically:** `<video autoplay muted loop playsinline preload="none" poster="/shots/room-04.avif">` with a `<source type="video/webm; codecs=vp9">` then `video/mp4` fallback. `preload="none"` is the whole trick: the poster paints as a normal image (and can be the LCP element), and the video streams in afterwards. In a `prefers-reduced-motion: reduce` block, hide the video and show the poster.
- **JS:** zero lines.
- **Performance risk:** **medium.** A 1080p VP9 loop at 2–4 s is ~400 KB–1.2 MB; three of them is ~2–3 MB and 3 concurrent decoders. Decode is off-main-thread on modern Chrome but on low-end Android hardware-accelerated VP9 is limited to 720p and it will fall back to software. Cap at 2–3 loops per page, `<source media>` or just size them to ≤ 1280×720, and never put one in the LCP viewport.
- **Dark industrial horror fit:** **excellent.** Flickering fluorescent tube, dripping pipe, swinging lamp, a body bag that is breathing. It converts "static screenshot" into "surveillance footage" without a single line of JS. Best used *sparingly* — its power is inverse to how often it appears.

---

### 8. Before / after wipe comparison
**One line:** the same room twice — lit and unlit, door sealed and breached, Hunter absent and present — with a draggable seam.

- **Real site:** `https://www.nvidia.com/en-us/geforce/technologies/dlss/` — `06-nvidia-dlss.png`. Confirmed live: paired assets `geforce-nba-2k27-tatum-dlss-on-2048.png` / `geforce-nba-2k27-tatum-dlss-off-2048.png` (and wemby, and a `geforce-dlss5-bm-md460-offset-left-d.jpg`), 2 sticky elements, GSAP + ScrollTrigger present, 1 `animation-timeline` rule.
- **How it works technically:** two stacked images, the top one clipped by a variable:
  ```css
  .cmp { position: relative; aspect-ratio: 16/9; }
  .cmp img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .cmp img:last-child { clip-path: inset(0 0 0 var(--seam, 50%)); }
  ```
  Driven three ways: (a) CSS-only on hover using `@property --seam { syntax: '<percentage>'; }` and a transition — 0 JS; (b) an `<input type="range">` overlay with ~4 lines of JS writing `--seam`; (c) scroll-driven with `animation-timeline: view()` — 0 JS but the seam moves only while scrolling.
- **JS:** 0–6 lines.
- **Performance risk:** **medium.** Two full-resolution images per comparison; four comparisons is eight images. Use one `loading="lazy"` pair at a time, and be honest that on a dark site the "on/off" luminance difference is large, which is exactly what makes the wipe satisfying.
- **Dark industrial horror fit:** **very good, and underused in this genre.** NVIDIA's page is clean/corporate — copy the mechanic, not the styling. For STATIC: red emergency lighting vs blackout; sealed door vs breached; corridor before and after the Hunter has been through it. Wrap it in the same facility-monitor chrome (technique 1) so it reads as a before/after *camera*, not a slider widget.

---

### 9. Image-as-texture (type over imagery)
**One line:** the screenshot stops being a picture and becomes the surface a headline is printed on.

- **Real site:** `https://www.alanwake.com/` — `20-alanwake.png` (Alan Wake 2). Confirmed live: 13 images, the keyart served as a CSS `background-image` at `2560px` wide (`Alan_Wake_2_keyart_for_web3-2560x…`), 6 `position: fixed` elements, 13 `clip-path`, trailer `<video>`s with posters. Second: `https://www.playdead.com/` (`09-playdead.png`) — a full-bleed desaturated plate with the line "JOIN US ON OUR NEXT PROJECT" set directly over it. Third: `https://www.hellomonday.com/` (`17-hellomonday.png`) — a 1422×748 `<canvas class="PageWipe" id="paper-view-0">` used as a page-transition wipe over the whole viewport, with 9 fixed layers.
- **How it works technically:** the image as a `background-image` on the section (or `object-fit: cover` on an absolutely positioned `<img>`), then a legibility scrim so type survives:
  ```css
  .plate { position: relative; isolation: isolate; }
  .plate__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
                filter: saturate(.6) contrast(1.15) brightness(.55); }
  .plate__type { position: relative; z-index: 1; color: oklch(.96 .01 90); }
  .plate::after { content: ""; position: absolute; inset: 0;
                  background: linear-gradient(90deg, oklch(.16 .012 240/.94) 0 38%, transparent 78%); }
  ```
  When the texture is *behind* scrolling type, add `animation-timeline: scroll(root block)` with `translate: 0 calc(var(--p) * -1)` on the image for a slow counter-drift.
- **JS:** zero lines.
- **Performance risk:** **medium** if it is full-viewport, because it forces a large decode at a large paint size and can easily *become* the LCP element. Serve it AVIF at the rendered CSS size, give it explicit dimensions, and keep it below the fold if it is decorative.
- **Dark industrial horror fit:** **excellent.** It is the standard way to make a screenshot feel like the world rather than a picture of the world. Keep opacity low (0.35–0.6) and grade hard; a bright grey studio shot used as a texture at full strength will kill the page.

---

### 10. Contact sheet / film-strip as an intentional object
**One line:** a dense, labelled, uniformly-graded grid that reads as an *archive* — evidence, surveillance stills, rushes — rather than a photo gallery.

- **Real site:** `https://leica-camera.com/en-US` — `21-leica.png`. Confirmed live: **465 `<img>` elements**, essentially all `loading="lazy"`, across a 15,012 px editorial page — a deliberately uniform, metadata-driven contact-sheet rhythm. Secondary: `https://www.artsy.net/` (`19-artsy.png`) — 36 `object-fit: cover` tiles in a dense uniform grid, `loading="lazy"` throughout, 10 `clip-path`.
- **How it works technically:** `display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 2px;` with every tile a fixed `aspect-ratio: 16/9`, a uniform grade (technique 2) or luminance-lock (technique 3), and a mono label row. Frame numbers via a CSS counter: `counter-increment: shot;` and `.tile::before { content: "SHOT " counter(shot, decimal-leading-zero); }` — zero JS. Hover reveals the full-brightness image via `filter` transition.
- **JS:** zero lines.
- **Performance risk:** **medium.** A real contact sheet is 40–80 images; that is fine *only* with `loading="lazy"`, `decoding="async"`, explicit `width`/`height` (or `aspect-ratio`) on every tile, and `content-visibility: auto` on the section. Without those it is the classic long-page LCP/CLS disaster.
- **Dark industrial horror fit:** **good if and only if it is labelled.** A bare photo grid is the most corporate pattern in this document. It becomes horror when it is clearly *evidence*: `CAM 04 / LVL −3 / 02:14:07`, tiles numbered like frames, one tile deliberately missing (`SHOT 31 — CORRUPTED`). Leica and Artsy are the *craft* reference, not the mood reference.

---

### 11. The rack — a scroll-snap film-strip with a live readout
**One line:** keep the horizontal strip, but make it a physical rack of frames with a counter and a position indicator, not a carousel with dots.

- **Real site:** `https://www.apple.com/apple-vision-pro/` — `11-apple-visionpro.png`. Confirmed live: **57** elements with `scroll-snap-type`/`scroll-snap-align`, 9 sticky, 37 `clip-path`. `https://www.apple.com/airpods-pro/` (`02-apple-airpods.png`) shows the same profile (31 snap, 12 sticky) and Stripe (`08-stripe.png`) uses 14.
- **How it works technically:** `scroll-snap-type: x mandatory` + `scroll-snap-align: center` + `overscroll-behavior-x: contain`; hide the scrollbar with `scrollbar-width: none` and `::-webkit-scrollbar { display: none }`; drive a progress readout with CSS only:
  ```css
  .rack { scroll-timeline-name: --rack; scroll-timeline-axis: inline; }
  .rack__progress { animation: fill linear both; animation-timeline: --rack; transform-origin: 0 50%; }
  @keyframes fill { from { scale: 0 1; } to { scale: 1 1; } }
  ```
  and fade the edge frames with `mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)` — which also removes the "there is content off-screen" ambiguity by making it deliberate.
- **JS:** zero lines. A one-line `scroll-snap-stop: always` on each child changes the feel from "free scroll" to "indexed frames".
- **Performance risk:** **low.** `scroll-snap` is compositor-driven; `mask-image` on the strip is one extra layer. The risk is decode volume — 8 rooms × 3 resolutions is fine, 80 is not.
- **Dark industrial horror fit:** **excellent — and this is the honest upgrade path from the existing "Tour the bunker" carousel.** A rack with `CAM 01 → CAM 08`, mono labels, snap-stop, and an edge mask reads as a switcher, not a slideshow. It is a strict superset of what they already have.

---

### 12. Cold-to-warm / duotone grade transition on enter or hover
**One line:** the image arrives colourless and cold, and warms into the amber palette as it crosses the viewport — or inverts on hover.

- **Real site:** `https://www.cyberpunk.net/en/` — `03-cyberpunk.png`. Confirmed live: `.menu-item.menu-item-lang:hover > img { filter: invert(100%); }` — a real, shipping hover grade — plus `clip-path: polygon(16px 0, 100% 0, 100% 30px, calc(100% - 18px) 48px, …)` chamfered panels and `drop-shadow()` filter stacks on imagery. Second: `https://nothing.tech/` (`04-nothing.png`) uses `mix-blend-mode: difference`. Third: `https://linear.app/` (`10-linear.png`) — blend modes `overlay`, `lighten`, `screen`, 35 `filter`ed elements.
- **How it works technically:**
  ```css
  .cold { filter: grayscale(1) brightness(.82) contrast(1.1); transition: filter 700ms ease; }
  @supports (animation-timeline: view()) {
    .cold { animation: warm linear both; animation-timeline: view(); animation-range: entry 0% cover 55%; }
    @keyframes warm { from { filter: grayscale(1) brightness(.8); } to { filter: grayscale(0) brightness(1); } }
  }
  ```
  Or a true duotone with an SVG filter referenced by `filter: url(#amber)` where `#amber` is a `feColorMatrix`/`feComponentTransfer` mapping shadows to near-black and highlights to `#F5A623`.
- **JS:** zero lines.
- **Performance risk:** **medium.** Animating `filter` is *not* a compositor-only operation in Chromium — it re-rasterises the element each frame. Fine for 2–4 large images; on 40 grid tiles it will drop frames on mid-range Android. `mix-blend-mode` changes are cheaper than `filter` animations.
- **Dark industrial horror fit:** **good, if it goes cold→neutral, not grey→colour.** Grey-to-colour on hover is a 2012 agency trope and reads as a portfolio. Cold-blue-desaturated → amber-warm as the image enters reads as "the emergency lighting coming up", which is the right idea for a bunker.

---

## Part 2 — Ranked top 3 for STATIC

### #1 — Facility-monitor framing + unified grade stack (techniques 1 + 2 + 3, applied selectively)
**Why first.** It fixes the *actual* problem. Their problem is not "the pictures do not move", it is "80 screenshots with wildly different exposures look un-art-directed". Motion does not fix that — a beautiful scroll-scrub of a badly-exposed image is still a badly-exposed image. A frame + a grade fixes it immediately, for every image, at every viewport, with zero JS and zero bytes on the critical path.
It is also the only recommendation that is *strictly additive* to the LCP: pure paint-time CSS on images that were going to load anyway. It cannot move a 4,360 ms P90.
And it is the most on-theme: a diegetic camera frame with a sector readout is the visual language of the genre, it uses the amber accent they already have, and it makes the eight bunker rooms cohere as one facility instead of eight pictures.

**Concrete first move:** wrap all 80 shots in one `<figure class="mon">` component with the shared grade, ship a 3×3 scanline tile as a data-URI, and add `data-exposure="dark|mid|bright"` to each. That is a single component and ~40 lines of CSS for the whole site.

### #2 — CSS scroll-driven wipe reveals + the rack upgrade (`animation-timeline` + `clip-path`)
**Why second.** This is what removes the "static slideshow" feel, and it is the rare case where the premium technique is also the cheapest one. It is **zero JavaScript** (`animation-timeline: view()` / `scroll()`), it is the identical machinery Apple ships (verified: 3 `animation-timeline` rules on both airpods-pro and macbook-pro), and it is progressive enhancement — engines without support simply show the image, so it can never regress first paint.
Pair it with the rack (technique 11) to upgrade the existing "Tour the bunker" carousel: same markup, `scroll-snap-stop: always`, an edge `mask-image`, and a CSS-only progress readout. That is the difference between a carousel and a switcher.
**Hard rule:** the LCP element must be fully visible at first paint. Reveal only below-the-fold shots — a reveal that starts at `clip-path: inset(0 0 0 100%)` defers the LCP paint to the scroll.

### #3 — Cinemagraph loops on 2–3 hero rooms, plus one before/after wipe (techniques 7 + 8)
**Why third.** This is the highest-impact-per-byte motion available, because a 3-second looping WebM of a flickering light is *one* asset that replaces dozens of stills and reads as surveillance footage rather than a screenshot. Playdead and GTFO — the closest genre references verified here — both do exactly this and nothing else.
It is third, not first, because it is the only item on this list that can genuinely hurt the LCP number: video in the hero means the poster becomes the LCP element at best and the first video frame at worst. So: `preload="none"`, poster as the LCP image, 1280×720 max, 2–3 loops total, all below the fold, all disabled under `prefers-reduced-motion`.
The before/after wipe (technique 8, verified live on NVIDIA's DLSS page) belongs in the same tier because it is nearly free (two images + a `clip-path` var) and it is the single most *narratively* loaded pattern for a co-op asymmetrical horror game: lit / unlit, sealed / breached, Hunter absent / present.

**Deliberately not in the top 3:** canvas frame-sequence scrubbing and WebGL/Three.js. Both are the most impressive things in this document and both are the wrong answer for a site whose LCP P90 is 4,360 ms. Frame sequences are 10–60 MB of images (`imageSequenceScrub` on GSAP's docs uses ~150 frames); WebGL adds a runtime plus a GPU-dependent first-paint. If one scrubbed moment is wanted, use Apple's video-scrub variant (one 1–3 MB file, `preload="none"`) below the fold.

---

## Part 3 — The mixed-brightness treatment recipe

Two parts: a **build-time normalisation** (do this if at all possible) and a **CSS grade stack** (do this regardless). The CSS alone will get you 80 % of the way; the two together make it look like one shoot.

### 3a. Build-time normalisation (the 20 % that is worth it)

For each of the 80 screenshots, measure mean luminance `L` (0–1) on the sRGB values, then emit one of three exposure classes. Roughly 30 lines of Python:

```python
from PIL import Image, ImageStat
import pathlib
for p in pathlib.Path("shots").glob("*.png"):
    im = Image.open(p).convert("L")
    L = ImageStat.Stat(im).mean[0] / 255.0
    cls = "bright" if L > 0.42 else ("dark" if L < 0.18 else "mid")
    print(f'{p.name}  L={L:.3f}  {cls}')
```

Then normalise with a **fixed** transfer curve so every image lands in the same band (target mean ≈ 0.26, black point lifted to 0.02, highlights rolled off at 0.90):

```bash
ffmpeg -i in.png -vf "\
curves=all='0/0.02 0.25/0.20 0.5/0.44 1/0.90',\
eq=contrast=1.10:saturation=0.82:brightness=-0.02,\
colorbalance=rs=0.012:gs=0.004:bs=-0.010" \
-c:v libaom-av1 -crf 32 -still-picture 1 out.avif
```

Concrete numbers to aim for: after grading, every shot's mean luminance within **0.23–0.30**, its 5th percentile below **0.04** (so there is true black in frame), and its 95th percentile below **0.88** (so nothing blows out against `oklch(0.16 0.012 240)`). Transcode to AVIF at the rendered size — 1600×900 AVIF q≈50 lands around **90–160 KB** vs **250–400 KB** JPEG, which is also the single biggest LCP win available on this site.

The colour target: pull every shot toward one axis. `saturation 0.78–0.86` plus a small warm bias on the midtones. This is what makes red-lit and blue-lit rooms sit in the same palette without repainting them.

### 3b. The CSS grade stack (works with the images exactly as they are today)

```css
/* ---- shared tokens -------------------------------------------------- */
:root {
  --ink:  oklch(0.16 0.012 240);     /* the site's near-black            */
  --ink-2: oklch(0.12 0.010 240);    /* deeper, for vignettes            */
  --amber: oklch(0.72 0.17 65);      /* #F5A623                          */
}

/* ---- the frame that unifies everything ------------------------------ */
.shot {
  position: relative;
  isolation: isolate;                /* contain blend modes per shot     */
  background: var(--ink-2);
  overflow: hidden;
  aspect-ratio: 16 / 9;              /* reserve space -> no CLS          */
  border: 1px solid color-mix(in oklab, var(--amber) 22%, transparent);
  clip-path: inset(0 round 2px);     /* machined, not a rounded card     */
}

/* ---- 1. exposure clamp, per shot ------------------------------------ */
.shot > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: var(--pos, 50% 50%);
  /* the four properties that do the unifying work:                    */
  filter:
    brightness(var(--b, 1))
    contrast(var(--c, 1.12))
    saturate(var(--s, 0.78))
    sepia(0.14);                     /* one shared colour axis           */
  transition: filter 600ms cubic-bezier(.2, .7, 0, 1);
}

/* dark rooms: open them up ------------------------------------------- */
.shot[data-exposure="dark"]   > img { --b: 1.24; --c: 1.06; --s: 0.88; --pos: 50% 62%; }
/* mid ----------------------------------------------------------------- */
.shot[data-exposure="mid"]    > img { --b: 1.00; --c: 1.12; --s: 0.78; }
/* bright grey studio shots: clamp hard, then re-contrast ------------- */
.shot[data-exposure="bright"] > img { --b: 0.70; --c: 1.26; --s: 0.62; }

/* ---- 2. vignette: pulls the eye to the lit centre ------------------- */
.shot__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    118% 88% at 50% 46%,
    transparent 42%,
    color-mix(in oklab, var(--ink-2) 78%, transparent) 100%
  );
  mix-blend-mode: multiply;
}

/* ---- 3. scrim: gives the caption row a floor to sit on, and
          kills the bottom edge of every bright shot -------------------- */
.shot__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to top,
    color-mix(in oklab, var(--ink) 92%, transparent) 0%,
    color-mix(in oklab, var(--ink) 46%, transparent) 34%,
    color-mix(in oklab, var(--ink) 10%, transparent) 68%,
    color-mix(in oklab, var(--ink) 58%, transparent) 100%
  );
}

/* ---- 4. colour cast: one amber hand, one cold hand, on every shot --- */
.shot__cast {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(120% 80% at 50% 118%,
      color-mix(in oklab, var(--amber) 12%, transparent), transparent 62%),
    radial-gradient(90% 70% at 50% -8%,
      oklch(0.55 0.10 245 / 0.15), transparent 72%);
  mix-blend-mode: soft-light;
}

/* ---- 5. the escape hatch: absolute luminance lock ------------------- */
/* Applied to thumbnails / marquee / archive tiles only.               */
.shot--locked { background: var(--amber); }
.shot--locked > img { mix-blend-mode: luminosity; opacity: 0.92; }

/* ---- 6. motion & accessibility -------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .shot > img { transition: none; }
}
```

**Why each piece is there**

| Layer | Property | Solves |
|---|---|---|
| 1 | `filter: brightness/contrast/saturate/sepia` | the core exposure + hue mismatch; `sepia(0.14)` is the cheap shared colour axis |
| 2 | `mix-blend-mode: multiply` + radial gradient | kills flat, evenly-lit frames; gives dark rooms a centre of gravity |
| 3 | linear-gradient scrim | stops bright shots glowing at the bottom; gives captions a floor |
| 4 | `mix-blend-mode: soft-light` + two radial gradients | stamps the amber/cold palette onto every image at ~12 % |
| 5 | `mix-blend-mode: luminosity` | the nuclear option — one value, total unification |
| 6 | shared frame | makes exposure differences read as *different cameras*, not sloppiness |

**Order matters:** `filter` first (on the `<img>`), then vignette, scrim, cast as separate absolutely-positioned layers. Do not try to do scrim + vignette + cast in one `background` list — you lose the per-layer blend mode that makes each one behave.

**The optional SVG route** (a true duotone, one property on the image):

```html
<svg width="0" height="0" aria-hidden="true"><filter id="grade" color-interpolation-filters="sRGB">
  <feColorMatrix type="matrix" values="
    0.62 0.24 0.06 0 0.010
    0.20 0.58 0.08 0 0.008
    0.14 0.20 0.44 0 0.020
    0    0    0    1 0"/>
</filter></svg>
```
```css
.shot--duotone > img { filter: url(#grade) contrast(1.06); }
```
This gives the cleanest, most "printed" unification of the lot. Two honest warnings: `filter: url()` on a large raster is a CPU paint operation in Chromium (**medium** risk on a grid of images), and it needs `color-interpolation-filters: sRGB` or the result is 2× too bright on some Android GPUs. Use it on the hero shots and the texture plates, not on 80 tiles.

---

## Part 4 — What to avoid, and why

1. **Canvas / WebGL frame-sequence scrubbing as the hero.** 60–150 frames × 120 KB ≈ 10–60 MB, plus a 100–400 ms main-thread decode stall on mid-range Android. It attacks the 4,360 ms LCP P90 directly. If it is wanted at all: below the fold, one instance, `preload="none"`, and never the same element that carries the headline.
2. **Putting the LCP image behind a reveal.** `opacity: 0`, `clip-path: inset(... 100% ...)` or a `mask-image` that starts fully transparent all mean zero *visible* area at first paint — Chromium then records LCP at the moment the reveal runs, i.e. when the user scrolls. The hero must be fully visible, un-masked and un-clipped on first paint. This one mistake can *cause* a 4 s LCP.
3. **`backdrop-filter: blur()`** for monitor glass, scrims or the sticky header. It is one of the most expensive compositing operations on mid-range Android and it is a well-known INP/LCP killer. If the look is wanted, bake a pre-blurred WebP or use a plain gradient.
4. **Autoplaying video in the hero.** The LCP then becomes the first video frame, which typically lands after everything else. Video belongs below the fold, poster-first.
5. **`background-attachment: fixed` parallax.** Not compositable on mobile; it repaints the full viewport every scroll frame. Use `animation-timeline: scroll()` + `translate` instead.
6. **Scroll handlers that write styles (`onScroll → el.style.transform`).** Forced synchronous layout, and it fights `animation-timeline`. If a listener is unavoidable, batch it in one rAF and only write `transform`/`opacity`.
7. **`will-change: transform` sprinkled across the image set.** Each one reserves a GPU texture; 80 of them will exhaust compositor memory on low-end devices and cause *more* jank, not less.
8. **Smooth-scroll libraries (Lenis / Locomotive) on a content site.** Nothing.tech uses Lenis (verified) — but it is a showcase page. On a site that must convert, scroll-jacking breaks native `scroll-snap`, breaks anchor links, breaks keyboard navigation, and cannot be reconciled cleanly with `animation-timeline`.
9. **A bare photo grid with no labels or chrome.** Leica and Artsy are beautiful and completely corporate. On a near-black horror site an unlabelled grid reads as a stock-photo page. Either label it as an archive (technique 10) or do not ship it.
10. **Animated `filter` on large sets.** `filter` is not compositor-only in Chromium; animating it re-rasterises. Fine on 2–4 hero images, a frame-dropper on 40 tiles.
11. **Luminance-lock duotone on the hero rooms.** It erases the red/blue bunker lighting that carries the atmosphere. Reserve it for the marquee, the archive and background textures.
12. **Neon multi-hue grading (Cyberpunk's language).** Their palette is one amber accent over near-black. Copying Cyberpunk's `invert()` hover and chamfered `clip-path` panels is fine; copying its colour range destroys the discipline.
13. **Keeping the infinite marquee as the primary motion statement.** It is the weakest of the patterns audited here: it moves constantly, so it signals nothing, and it forces continuous compositing of many images. Demote it to a texture — or replace it with the rack (technique 11), which indexes and labels the same content.
14. **Preloading all 80 screenshots, or shipping the original PNGs.** Transcode to AVIF at the rendered size, `loading="lazy"` + `decoding="async"` everywhere below the fold, explicit `width`/`height` (or `aspect-ratio`) on every frame, `content-visibility: auto` on long sections, and `fetchpriority="high"` on exactly one image — the hero.

---

## Appendix — verified sites and captures

All captures are 1422×748, in `D:\roblox game 4\_ref-audit\imagery-research\`.

| # | Site | Capture | Technique(s) evidenced | Live CSSOM evidence |
|---|---|---|---|---|
| 1 | firewatchgame.com | `01-firewatch.png` | Layered depth parallax | 4 × `parallax{0..3}.png` bg layers, 8 `position: fixed`, `parallax` lib |
| 2 | apple.com/airpods-pro | `02-apple-airpods.png` | Scroll-scrub, mask/clip reveal | 15 `<video>` (muted/loop/lazy), **3 `animation-timeline` rules**, 74 `clip-path`, 7 `mask-image`, 12 sticky, 31 snap |
| 3 | cyberpunk.net | `03-cyberpunk.png` | Hover grade, clip-path panels, cinemagraph | `.menu-item…:hover > img { filter: invert(100%) }`, `clip-path: polygon(16px 0, 100% 0, 100% 30px, …)`, looping `.webm` KV, 6 `filter` |
| 4 | nothing.tech | `04-nothing.png` | Luminance/inversion grade, snap | `mix-blend-mode: difference`, Lenis, 11 snap, 5 fixed |
| 5 | raycast.com | `05-raycast.png` | Brightness unification | `mix-blend-mode: plus-lighter`, 14 `mask-image`, 64 `filter`, 2 timeline rules |
| 6 | nvidia.com DLSS | `06-nvidia-dlss.png` | Before/after wipe | paired `…-dlss-on-2048.png` / `…-dlss-off-2048.png`, GSAP + ScrollTrigger, 2 sticky |
| 7 | magnumphotos.com | `07-magnum.png` | (negative control — Swiper carousel) | Swiper present, 0 mask / 0 clip |
| 8 | stripe.com | `08-stripe.png` | Masked/clip reveals, blend grading | **90 `clip-path`**, 4 `mask-image`, `multiply`/`hard-light`/`exclusion`, 14 snap |
| 9 | playdead.com | `09-playdead.png` | Cinemagraph substitution | 4 `<video loop autoplay muted poster>`, `mix-blend-mode: overlay` |
| 10 | linear.app | `10-linear.png` | Brightness unification | 23 `mask-image`, 35 `filter`, `overlay`/`lighten`/`screen`, 8 snap |
| 11 | apple.com/apple-vision-pro | `11-apple-visionpro.png` | Rack / scroll-snap, video | 26 `<video>`, **57 scroll-snap**, 9 sticky, 37 `clip-path` |
| 12 | landrover.com | `12-landrover.png` | (redirected to market selector — excluded) | — |
| 13 | criterion.com | `13-criterion.png` | (Cloudflare challenge — excluded) | — |
| 14 | igloo.inc | `14-igloo.png` | (JS-only shell, 11 CSS rules — excluded) | — |
| 15 | gsap.com imageSequenceScrub | `15-gsap-seq.png` | Canonical canvas frame scrub | GSAP present, 4 `mask`, 3 sticky |
| 16 | are.na | `16-arena.png` | (client-rendered, 0 imgs at capture — excluded) | — |
| 17 | hellomonday.com | `17-hellomonday.png` | Image-as-texture / page wipe | `<canvas class="PageWipe" id="paper-view-0">` 1422×748, looping `.mp4`, 9 fixed |
| 18 | apple.com/macbook-pro | `18-apple-mbp.png` | Start/end-frame video scrub + `multiply` | `hero_startframe`/`hero_endframe`, **3 timeline rules**, 79 `clip-path`, 9 `mask`, 19 sticky, `multiply`/`darken` |
| 19 | artsy.net | `19-artsy.png` | Contact sheet | 36 uniform `object-fit: cover` lazy tiles, 10 `clip-path` |
| 20 | alanwake.com | `20-alanwake.png` | Image-as-texture | 2560 px keyart as `background-image`, 6 fixed, poster'd trailers |
| 21 | leica-camera.com | `21-leica.png` | Contact sheet / editorial grid | **465 `<img>`**, almost all `loading="lazy"`, 15,012 px page |
| 22 | teenage.engineering | `22-teenage-engineering.png` | Diegetic instrument framing | 30 `clip-path`, 2 `mask-image`, 1 timeline rule |
| 23 | gtfothegame.com | `23-gtfo.png` | Cinemagraph (genre reference) | 2 `<video loop autoplay muted>` incl. `lobby_FIX….mp4` w/ poster, 11 `filter`, base64 LQIP placeholders |

**Reproduce:** `agent-browser --cdp <port> batch --json` with a JSON array of `["navigate", url] / ["wait","--load","domcontentloaded"] / ["wait","4000"] / ["screenshot", name] / ["eval", probe]`. Probe scripts: `_tools/probe.js` (computed styles, canvas/video/lib detection) and `_tools/probeFilters.js` (CSSOM scan for `filter`/`mix-blend-mode`/`mask-image`/`clip-path`/`animation-timeline`/hover rules).
