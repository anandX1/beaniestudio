# OPENSEO-UPGRADE — the honest path to the 19.6k★ community suite

> **What it is:** [every-app/open-seo](https://github.com/every-app/open-seo) —
> open-source alternative to Semrush/Ahrefs. Self-hosted (Docker/Cloudflare) or
> hosted ($10/mo). Exposes an **MCP server + agent skills**, so an AI agent can
> run keyword research, rank tracking, competitor analysis, backlink lookups,
> site audits, and AI-visibility checks directly.
>
> **What it is NOT:** free data. It queries [DataForSEO](https://dataforseo.com),
> and you pay DataForSEO per request (open-seo self-hosted = their list price;
> their hosted version adds ~28%). "Open source" = the software, not the data.

## Do we adopt it today? No. Here's the trigger list instead.

Adopt **when any one of these becomes true** — not before:

| Trigger | Why that unlocks it |
|---|---|
| GSC shows **300+ clicks/month** | you have real queries to expand; volume data stops being a guess-machine |
| **20+ blog posts** published | rank tracking across many keywords needs a database + dashboards, not a JSONL file |
| First **competitor survey** needed (e.g. before a big update) | competitor insights are open-seo's killer feature vs our scripts |
| A **link-building campaign** starts | backlink index + outreach tracking is the other killer feature |

Rough DataForSEO costs at that stage: keyword research batch ~$0.60, daily rank
tracking of 20 keywords ~$2–4/month, competitor backlink scan ~$1–5/scan.
**Under $10/month total** — cheaper than any SaaS SEO suite by an order of magnitude.

## What we already have (so we don't pay twice)

- Keyword **discovery**: our autocomplete harvester (`npm run engine:harvest`)
  — free, real search queries, no API.
- Rank tracking: `npm run rank` (OpenSERP, Bing/DDG) + GSC for Google.
- Site audits: `npm run audit:live` (140 checks) + CI SEO/perf guard + Lighthouse.
- Distribution: IndexNow pings, Discord/Bluesky broadcaster, Content Studio.

The gaps open-seo fills when we're ready: **search volumes**, **Google SERP
tracking at scale**, **backlink indexes**, **AI-answer-engine visibility**.

## Activation path (when a trigger hits)

1. `git clone https://github.com/every-app/open-seo` (or Docker: see their
   `docs/SELF_HOSTING_DOCKER.md` — Cloudflare path works on the free plan).
2. DataForSEO account → API key → `docs/DATAFORSEO_API_KEY.md` in their repo.
3. Expose their MCP server, then the agent (me) can call keyword/rank/backlink
   tools conversationally — e.g. "pull volumes for the 50 Tier-2 keywords".
4. Optional: replace `tools/rank-keywords.json` sourcing with open-seo rank
   tracking for Google, keep our OpenSERP tracker for Bing/DDG as the free layer.

**Bottom line:** the community suite is worth adopting — at the moment it saves
us money instead of costing it. Nothing in this repo blocks that switch; the
keyword list and rank history formats were kept tool-agnostic on purpose.
