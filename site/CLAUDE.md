# Beanie Studio site — design contract

This file is the law for anyone (human or AI) editing `site/`. Read it before generating a single component. Its purpose: keep the site fast, keep it on-brand, and keep it from drifting into generic AI-output territory.

## Non-negotiable rules

1. **Compose from tokens, never invent styles.** All colors come from `--color-*` tokens in `src/styles/global.css` (OKLCH). All type from `--font-display` / `--font-sans` / `--font-mono`. If a needed token is missing, add it to the token layer first — never inline a raw hex/oklch value in a component.
2. **Amber (`--color-signal`) is a signal, not a decoration.** It marks CTAs, live elements, active states, and danger. Never use it for large background fills or body text. One accent per view.
3. **No new dependencies without beating a hand-rolled version.** This site's entire JS payload should stay in the low single-digit KB. Prefer CSS. Prefer `<details>` over menu libraries. Prefer zero-JS solutions.
4. **Every interactive element works without JS** where technically possible (menus, accordions = `<details>`, countdown degrades to static text).
5. **Motion rules:** animations are diegetic (flicker = failing lights, blink = live telemetry). Every animation must map to the facility-fiction vocabulary. `prefers-reduced-motion: reduce` must disable every non-essential animation — check `global.css` before adding any new keyframes. The home page's `.beat` reveals and progress rail run on IntersectionObserver + CSS transforms only — never add a scroll-listener animation library (GSAP/Motion/three.js). Motion budget: if a new effect doesn't direct attention, communicate state, or build tone, it doesn't ship. Gimmicks never replace information: a visitor must learn what the game is from the first screen.
6. **Typography:** Chakra Petch (display, uppercase, wide tracking) / Public Sans (body) / JetBrains Mono (labels, readouts). Never introduce another family. Headings are uppercase via CSS, never typed in caps.
7. **Layout:** asymmetric panels over equal card grids where possible; the `.panel` component with corner brackets is the standard container; generous whitespace beats density.
8. **Content voice:** facility-terminal register, dry, concrete. Real facts and numbers. Banned: "unleash", "elevate", "dive into", "game-changing", "revolutionary", emoji in copy, exclamation-mark enthusiasm.
8b. **Clarity-first copy ramp.** The first line of every page must be understandable by a stranger who has never heard of the game — name the thing plainly, no jargon. Punch and in-world register increase as the reader scrolls. Labels must be plain language ("move your cursor to see in the dark"), never leetspeak hints ("sweep to survey"). Info-dense sections (The Briefing, FAQ) carry the SEO load; fiction carries the vibe. Both, in that order.
9. **Facts must match the game.** Every game number lives in `src/data/game.ts`, read from the game's scripts. Pages import from it — never type a game number into a page. Key facts: up to 7 per server (4–6 Scrappers + 1 Hunter, Jingles), rounds up to 20 min, 3 crushers (120/130/150 kg = 400 kg), 13 console minigames (7 per crusher), one exit (Intake Chute, 60 s), PC + mobile (NOT console, NOT "sound-only" — Jingles has Bloodlust reveals), public beta 10 Oct 2026. If it's not in `game.ts`, the site doesn't claim it. If the game changes, update `game.ts` first.
10. **Links live in `src/site.config.ts` only.** Components import from it; hardcoded URLs in pages are a bug.
11. **SEO hygiene:** every page gets a unique title (≤60 chars), description (≤155 chars), canonical via `BaseLayout` props, and appropriate JSON-LD. FAQ claims must match the FAQPage schema on the same page. New pages: pass `breadcrumb` (emits BreadcrumbList), an `ogImageAlt`, and add the route to `src/pages/llms.txt.ts`. IndexNow key + pinger live in `scripts/ping-indexnow.mjs`; run `npm run ping:indexnow` after each deploy and `npm run seo` before it.
12. **Accessibility:** focus-visible states everywhere, alt text on every image, semantic headings in order, contrast ≥ 4.5:1 for text (the facility palette is tuned for this — keep it).
13. **Video embeds are facades.** YouTube videos render as self-hosted thumbnails (`public/yt/<id>.jpg`) that swap to a `youtube-nocookie` iframe only on click (`VideoCard.astro`). Never ship a bare `<iframe>` at page load — it drags ~1 MB of third-party JS and leaks every visitor's IP to Google before they asked to play anything. The registry of real videos is `src/data/videos.ts`; to add a clip, save its `maxresdefault.jpg` as `public/yt/<id>.jpg` and add an entry there. Thumbnails are self-hosted so the page makes zero YouTube requests until the visitor clicks play.

## Page structure (2026-10-08 rebuild)

- **Home** follows the industry order: cinematic hero (real screenshot backdrop + Jingles key art, one-line pitch, Play on Roblox) → how a round works (screenshot rows) → pinned "Tour the bunker" → Jingles → Worm + Pod → four end screens → videos → comparison → roadmap (PLANNED) → team → community → final CTA.
- **Screenshots** come from `game-assets/` (raw, never deployed — see repo `.assetsignore`) through `scripts/media.mjs` → `public/media/*.webp`. Register shots in `src/data/media.json`, render with `Shot.astro` / `ShotFigure.astro`, never hand-write `/media/` paths. `/screenshots/` and `/guide/map/` are the image-SEO pages; `/sitemap-images.xml` lists them.
- **Scroll motion is CSS-only**: `animation-timeline: scroll()/view()` (hero drift, `.reveal` shutter, `.parallax`, pinned `.tour` on ≥1024px). It lives in `@supports` + `prefers-reduced-motion: no-preference`, so unsupported browsers and reduced-motion users get a complete static page.
- **Official guide** (`/guide/*`, `src/layouts/GuideLayout.astro`) is the SEO engine: one page per game-specific search term (Jingles, Worm, scrap list, crushers, pods, codes). Real numbers only.
- **Blog content is hand-written.** The Groq autopilot (`tools/autopilot.mjs`) is paused via `tools/autopilot-config.json` → `paused: true`. Mass-generated posts contradicted the game and match Google's scaled-content pattern. Don't unpause it.

## The interaction set (site-wide, same law as everything above)

Every interactive effect follows the same five guarantees. Break one and it's a bug:

1. **Reduced-motion early return.** Every effect script starts with the `prefers-reduced-motion` check and exits; CSS additionally hides/blunts the visual (e.g. `.torch-shade` displays none so content isn't hidden behind an unsweepable darkness).
2. **No-JS = complete content.** The real string lives in `data-decode` before any scramble; the tuner degrades to the idle transmission text; the schematic is a labelled figure. Nothing is locked behind JS.
3. **Audio only inside a real user gesture**, always synthesized WebAudio (oscillators/noise buffers, zero downloaded files), always in try/catch — audio is decorative, never load-bearing.
4. **State via CSS custom properties** (`--torch-x/y`, `--hunt`, `--tune-deg`, `--noise-level`) and `body[data-noise]`. JS writes variables; CSS owns visuals.
5. **Prefer direct paint-only writes over rAF loops** unless something truly needs per-frame orchestration (the hero static canvas and noise decay are the exceptions, both IO-gated or interval-driven).

The current set: **decode scramble** (`data-decode`, BaseLayout, any page can opt in), **hero static canvas** (home), **404 proximity monitor** (cursor haste = dread), **hunter distance bar** (devlog reading progress reframed as the Hunter closing in). All ARIA-labelled.

## Build facts

- Astro 5 static + Tailwind v4 (CSS-first config — the `@theme` block in `global.css` IS the Tailwind config).
- OG images: `node scripts/og-cards.mjs` renders `public/og/*.png` and `public/press/static-key-art.png` in headless Chromium with the real fonts + Jingles art. Rerun after changing card copy.
- `npm run check` = astro check (TS). `npm run build` must pass both before deploy.
- Emails live in `src/site.config.ts` (`SITE.contact` = hello@, `SITE.press` = press@) and per-person in `TEAM` (`game.ts`): anand@, pawan@, jai@ — all @beaniestudio.site via Cloudflare Email Routing. Never put a personal or other-company address on the site — it made "picfomo.com" the site's top Google query.
- `/llms.txt` is generated from `game.ts` by `src/pages/llms.txt.ts`.
- Deploy target: Cloudflare Pages, build command `npm run build`, output `dist`, Node 20+.

## Slop tells to never introduce

Purple gradients · Inter/Roboto · rounded-2xl cards with soft shadows · glassmorphism · "3 identical cards" without content reason · emoji bullets · centered-everything · generic hero headline + subtitle + CTA stack with no real information · stock imagery.
