# beaniestudio — STATIC official site

Official site for **STATIC** — a free co-op asymmetrical horror game on Roblox by Beanie Studios. Live at **https://beaniestudio.site**.

## Deploy model (important)

This repo **commits the built site at the repo root**. Cloudflare Pages is configured as a
direct-upload project: it serves the repo root as the bundle (via `.assetsignore`),
so every `git push` = instant deploy with no build step on Cloudflare's side.

- **Repo root** = the built site (generated from `site/` — do not hand-edit)
- **`site/`** = the Astro 5 + Tailwind v4 source (edit here)
- `.assetsignore` keeps `site/`, `game-assets/` (raw screenshots) and `README.md` out of the deployed bundle

## Edit workflow

```bash
# 1. Work on the source
cd site
npm install        # first time only
npm run dev        # dev server on :4321 — use `npm run dev:host` for previews

# 2. Verify before shipping
npm run check      # typecheck
npm run build      # production build to site/dist
npm run seo        # link check + IndexNow dry-run
npm run audit:live # after deploy: verifies production SEO end-to-end

# 3. Sync the build to the repo root (deletes stale root files, copies dist)
npm run sync-root

# New screenshots? Add them to game-assets/, register them in
# site/src/data/media.json, then:  npm run media   (before build)
# Changed share-card copy?          npm run og

# 4. Commit + push — Cloudflare deploys automatically
git add -A
git commit -m "..."
git push
```

## Site structure

| Route | Purpose |
|---|---|
| `/` | Cinematic landing: screenshot hero, round loop, pinned bunker tour, Jingles, threats, end screens, videos, roadmap, team |
| `/guide/` + `/guide/{map,jingles,worm,scrap,crushers,capture-and-rescue}/` | Official guide — the SEO pages, real numbers from `site/src/data/game.ts` |
| `/codes/` | Official codes list |
| `/screenshots/` | Screenshot gallery (lightbox, ImageGallery schema) |
| `/play/`, `/faq/`, `/press/`, `/creators/` | Play steps, FAQ (FAQPage schema), press kit + zip, creator info |
| `/blog/` | Hand-written devlog (`site/src/blog/*.md`) |
| `/rss.xml`, `/llms.txt`, `/sitemap-index.xml`, `/sitemap-images.xml` | Feeds and machine-readable indexes |

Launch copy, outreach templates and the content plan: `site/LAUNCH-PACK.md`.

## SEO / answer-engine stack

- Structured data: `Organization` (+ founders, contact points), `WebSite`, `VideoGame` (+ screenshots, trailer), `Article`, `ImageGallery`, `ItemList`, `VideoObject`, `FAQPage`, `BlogPosting`, `BreadcrumbList`
- `llms.txt` for AI answer engines; permissive-to-attributing AI crawler policy in `robots.txt`
- `IndexNow` key file at root; ping Bing/Yandex/Seznam after each deploy: `npm run ping:indexnow` (in `site/`)
- Sitemap + image sitemap generated at build; internal links checked by `npm run check:links`; Lighthouse via `node scripts/lh-run.mjs`

## Ops runbook

Deploy-day checklist (Search Console, Bing, rich-results validation): see `site/DEPLOY.md` §SEO ops runbook.
