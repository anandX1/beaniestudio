# Deploying to Cloudflare Pages

The site is a fully static Astro build — no server, no database, free at any traffic level.

## One-time setup (~10 minutes)

1. **Push `site/` to a GitHub repo** (or a subfolder of your existing repo — Cloudflare handles monorepos fine).
2. Go to **dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repo, then set:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `site` (if it's inside a bigger repo)
   - **Environment variable:** `NODE_VERSION` = `20` (or later)
4. Click **Save and Deploy**. First build takes ~1 minute. You get a `*.pages.dev` URL immediately.

## Point beaniestudio.site at it

1. In your domain's DNS (wherever beaniestudio.site is registered — if that's Cloudflare already, skip to step 3):
   - `A` record: `@` → `192.0.2.1` is **not** needed — instead use:
   - `CNAME` record: `@` → `<your-project>.pages.dev` (Cloudflare flattens CNAMEs at the apex), or move DNS to Cloudflare (free) and add the domain there.
2. In the Pages project: **Custom domains → Set up a custom domain** → enter `beaniestudio.site` → follow the prompts. Cloudflare provisions the SSL certificate automatically.
3. Wait for DNS propagation (usually minutes if DNS is on Cloudflare).

## After first deploy

- Every `git push` to the production branch auto-deploys. PRs get preview URLs.
- Submit `https://beaniestudio.site/sitemap-index.xml` in **Google Search Console** (add the property, verify via DNS TXT record — takes 5 min) and in **Bing Webmaster Tools** (it imports from Google).
- Replace the countdown target in `src/site.config.ts` (`launchDate`) when the launch window firms up — it propagates everywhere including the fallback text.
- OG images: if you change card copy in `scripts/generate-og.mjs`, run `node scripts/generate-og.mjs` and commit the new PNGs.

## SEO ops runbook

The site ships with a full SEO stack. Every deploy, in order:

1. **Pre-flight (local, before push):** `npm run seo` — checks every internal link in the built site, then dry-runs the IndexNow ping.
2. **Deploy** (push → Cloudflare builds automatically).
3. **Ping IndexNow:** `npm run ping:indexnow` — submits every sitemap URL to Bing/Seznam/Yandex; they typically crawl within minutes. (Google doesn't participate in IndexNow; it discovers via sitemap + Search Console. The key file is `public/<key>.txt` — deleting or regenerating the key invalidates submissions, so treat it like config, not junk.)
4. **Post-deploy audit:** `npm run audit:live` — fetches the deployed site and verifies titles, canonicals, robots, OG/Twitter tags, JSON-LD, robots.txt/llms.txt/sitemap/RSS/404 handling. Two known advisories: enable "Always Use HTTPS" in Cloudflare, and set `not_found_handling = "404-page"` so the custom 404 body serves (the 404 status itself is already correct — SEO-safe either way).

### One-time SEO setup (do once, then forget)

- **Google Search Console:** verify `beaniestudio.site` (DNS TXT), submit `sitemap-index.xml`, then use **URL Inspection → Request Indexing** on `/` for first-day indexing.
- **Bing Webmaster Tools:** import from GSC — IndexNow pings make future updates instant.
- **Rich results validation:** run [Rich Results Test](https://search.google.com/test/rich-results) on `/`, `/faq`, and any devlog post — the site ships VideoGame + VideoObject + FAQPage + BreadcrumbList + BlogPosting + Organization + WebSite schema, so all should pass.
- **Social cards:** run the Rich Preview check in Discord (paste a link in any channel) and the X/Twitter card validator — Discord, Slack, iMessage, and X all read the same OG tags.
- **AI answer engines:** ChatGPT/Claude/Perplexity are explicitly welcomed in `robots.txt`, and `llms.txt` gives them a citable fact sheet. Ask an AI assistant "what is STATIC: Salvage vs Hunter?" a few weeks after launch — if it cites beaniestudio.site, AEO is working.

### What's already automated (don't rebuild it)

- Canonical URLs (trailing-slash normalized), robots directives (`max-image-preview:large` etc.) on every page via `BaseLayout`
- BreadcrumbList schema from a `breadcrumb` prop; `noindex` prop for utility pages (404)
- Sitemap excludes noindex pages; RSS + llms.txt + robots.txt ship from `public/`
- OG cards regenerate with the real studio logo: `node scripts/generate-og.mjs`
- Internal link checker: `npm run check:links` (fails the build on dead links)
- Hover prefetch + inlined CSS for Core Web Vitals (LCP/CINP headroom)

## Analytics (10 minutes, do this before any promotion)

The layout ships with a **Cloudflare Web Analytics** beacon slot — cookie-free, GDPR-friendly, zero performance cost, and it loads only when configured:

1. Cloudflare dashboard → **beaniestudio.site → Analytics & Logs → Web Analytics → enable** → copy the token from the JS snippet (the `token` value).
2. This repo deploys **committed built files** (no Cloudflare build step), so the token is injected at the local build: put it in `site/.env.production` as `PUBLIC_CF_BEACON_TOKEN=<token>` (gitignored — never commit it), run `npm run build`, sync `dist/` to the repo root, push.
3. Check the page source for `cloudflareinsights.com/beacon.min.js`. Done — private, adblock-resistant traffic + UTM attribution.

Note: the beacon token is a public identifier (it appears in every page's HTML source by design — that's how all Cloudflare-analyzed sites work), but keep it in `.env.production` anyway so it can be rotated without touching source.

Why this one: no consent banner needed, no third-party tracker list, and every `utm_source` link (Discord/Bluesky broadcasts, the site's share button) shows up as its own line — so you know exactly which channel recruits players.

## Growth automation (see GROWTH.md for the full runbook)

The repo can auto-broadcast every new devlog to Discord + Bluesky with UTM-tagged links (state-cached, seed-safe — first run never spams). To arm it, add repo secrets:

- `DISCORD_WEBHOOK_URL` — Discord server → Integrations → Webhooks → copy URL into `#devlog`.
- `BLUESKY_IDENTIFIER` + `BLUESKY_APP_PASSWORD` — optional; bsky.app account + app password.

Until secrets exist, the CI step logs `skipped` and everything else runs green.

## Optional next steps

- **Self-hosted analytics alternative:** Umami or Matomo on any small VPS — add the snippet to `BaseLayout.astro` next to the CF beacon slot. Cloudflare Web Analytics above is recommended first: zero infra.
- **CI gate:** add a GitHub Action running `npm run check && npm run build && npm run check:links` on every PR (Unlighthouse for Lighthouse budgets when you want the next level).
