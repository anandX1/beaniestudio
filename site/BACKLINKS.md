# Backlinks blueprint — the honest version

> **Read `REACH-PLAYBOOK.md` first (added 2026-10-14).** It captures Roblox's official
> Discovery documentation, and it changes what backlinks are *for*: Roblox explicitly does
> not count engagement from externally-acquired users in its ranking signals — external
> traffic only "accelerates consideration" in the retrieval stage. Signals are per-user
> averages, so scale is not required. Backlinks are for consideration and brand search,
> not for ranking points.

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
| **YouTube** — your channel descriptions | Link beaniestudio.site in every upload's description | 7 uploads (all Shorts) = 7 links you fully control. **Corrected 2026-10-14:** this said 21 videos; the channel has 7. |
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
3. **Lighthouse CI** — Google's open-source engine, tracked in `warn` mode. **Corrected
   2026-10-14:** this file previously claimed hard gates of performance ≥85. That was
   never true — Lighthouse is not a dependency, so the local runner crashed and the
   number was never measured. Measured performance is **72 simulated / 51 real-throttled**,
   so the gate is not met. Nothing fails the build; treat performance as an open item.
4. **Live production audit** — `npm run audit:live` (217 checks as of 2026-10-14) against the deployed site.
5. **IndexNow ping** — new/changed URLs submitted to Bing/Yandex/Seznam within minutes.
6. **Daily schedule** — even with no pushes, the site is re-audited every morning.

What it deliberately does **not** do: submit your site to link farms. That's the part
that would get you penalized.
