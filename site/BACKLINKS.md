# Backlinks blueprint — the honest version

**Read the warning first:** automated backlink schemes (bot-submitted directories, bought
links, comment/forum spam, link exchanges) are exactly what [Google's link spam
policy](https://developers.google.com/search/docs/essentials/spam-policies) penalizes —
the 2026 spam updates target this specifically. For a new domain the risk isn't just
"no benefit," it's suppressed rankings site-wide. There is no safe fully-automated
backlink bot. What follows is what actually works and can be partly automated.

## Tier 1 — submit these by hand this week (highest trust per minute spent)

Every entry below accepts indie/Roblox games, gives real referral traffic, and is a
legitimate editorial listing. Paste-ready copy is in `PROMO-COPY.md`.

| Where | What | Why it matters |
|---|---|---|
| **Roblox community page** | Keep the game description current | The single most-linked "backlink" for a Roblox game; feeds the ecosystem |
| **Reddit** r/roblox, r/RobloxDev, r/indiegames | Playtest/announcement posts following each sub's rules | DoFollow-adjacent traffic + real players; Reddit links dominate AI answers now |
| **Discord servers** (Roblox dev hubs, horror-game servers) | Genuine participation + #showcase channels | First-100-players source, not just links |
| **YouTube** — your channel descriptions | Link beaniestudio.site in every upload's description | You already have 21 videos = 21 real links |
| **itch.io** — devlog mirror | Mirror each site devlog post | Game-dev community + a real profile backlink |
| **IndieDB / Indie game websites** | Studio + game profile | Long-standing indie directories, still crawled |
| **Google Business Profile** | Studio listing | Brand SERP real estate |
| **Bing Webmaster Tools** | Import from GSC | Bing links + IndexNow already wired |

## Tier 2 — earn links by making things people cite (this is the real engine)

- **Devlogs with real numbers** (what changed, why, what it cost) — the single best link
  magnet for game sites. Publish one per sprint; each ships as `BlogPosting` schema + RSS.
- **Open-source your tools** (the OG-card renderer, the SFX budget doc) with a link back —
  developers link to useful repos constantly.
- **Press kit that does the work** — `/press` already exists: facts, logo, copy-paste
  descriptions. Journalists and creators link sites that make linking effortless.
- **Creator outreach** — offer 10 mid-size Roblox YouTubers early access. One honest
  coverage video outperforms a thousand directory links.

## What the "autonomous" part can legitimately do (and now does)

The CI pipeline (`.github/workflows/seo.yml`) automates everything automation is *good*
at, on every push and daily:

1. **Build + typecheck** — nothing broken ships.
2. **Internal link check** — dead links leak authority; this fails the build on any.
3. **Lighthouse CI** — Google's open-source engine, hard gates: performance ≥85,
   SEO ≥95, accessibility ≥95, LCP ≤2.5s, CLS ≤0.1. Regressions can't deploy quietly.
4. **Live production audit** — `npm run audit:live` (62 checks) against the deployed site.
5. **IndexNow ping** — new/changed URLs submitted to Bing/Yandex/Seznam within minutes.
6. **Daily schedule** — even with no pushes, the site is re-audited every morning.

What it deliberately does **not** do: submit your site to link farms. That's the part
that would get you penalized.
