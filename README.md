# beaniestudio — STATIC official site

Official site for **STATIC: Salvage vs Hunter** — asymmetrical 5v1 horror game for Roblox by Beanie Studio. Live at **https://beaniestudio.site**.

## Deploy model (important)

This repo **commits the built site at the repo root**. Cloudflare Pages is configured as a
direct-upload project: it serves the repo root as the bundle (via `.assetsignore`),
so every `git push` = instant deploy with no build step on Cloudflare's side.

- **Repo root** = the built site (generated from `site/` — do not hand-edit)
- **`site/`** = the Astro 5 + Tailwind v4 source (edit here)
- `.assetsignore` keeps `site/` and `README.md` out of the deployed bundle

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

# 3. Sync the build to the repo root
#    (from the repo root, using Git Bash / tar)
rm -rf index.html _astro devlog faq play press robots.txt sitemap*.xml rss.xml llms.txt og yt favicon.png apple-touch-icon.png logo.png c2769c2629e7b24f6076ecdc17b61001.txt
cp -r site/dist/* .
rm -rf site/dist site/node_modules   # not needed in the commit
# .astro cache too if present

# 4. Commit + push — Cloudflare deploys automatically
git add -A
git commit -m "..."
git push
```

## Site structure

| Route | Purpose |
|---|---|
| `/` | 5-act scroll-film landing: signal → wreck → two sides → the mechanic (live noise-discipline demo) → the door |
| `/play` | How to play + fresh footage (YouTube facades) |
| `/devlog` | Devlog posts (`site/src/devlog/*.md`) |
| `/faq` | FAQ (FAQPage schema) |
| `/press` | Press kit (logo download, fact sheet) |
| `/rss.xml` | Devlog feed |

## SEO / answer-engine stack

- Structured data on every page: `Organization`, `WebSite`, `VideoGame` + trailer, `VideoObject`, `FAQPage`, `BlogPosting`, `BreadcrumbList`
- `llms.txt` for AI answer engines; permissive-to-attributing AI crawler policy in `robots.txt`
- `IndexNow` key file at root; ping Bing/Yandex/Seznam after each deploy: `npm run ping:indexnow` (in `site/`)
- Sitemap auto-generated at build; internal links checked by `npm run check:links`

## Ops runbook

Deploy-day checklist (Search Console, Bing, rich-results validation): see `site/DEPLOY.md` §SEO ops runbook.
