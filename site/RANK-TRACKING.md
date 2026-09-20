# RANK-TRACKING — know where we stand, for $0

> Two tools, two honesty levels:
> **1. The free tracker (this repo, already running)** — real Bing/DuckDuckGo SERP positions via the community [OpenSERP](https://github.com/karust/openserp) (MIT). Local, private, $0.
> **2. The paid upgrade ([OpenSEO](https://github.com/every-app/open-seo), 19.6k★)** — keyword volumes, Google rank tracking, backlink indexes via DataForSEO. Real data, real invoices. Adopt when traffic justifies it (see OPENSEO-UPGRADE.md).

## Why Bing/DDG and not Google

Google blocks anonymous SERP scraping (any residential IP gets `rate_limited` in
minutes). Options for Google positions are: Google Search Console (free, legit,
**already ours** — but averaged and delayed) or paid SERP APIs (DataForSEO et al).
The free tracker covers the gap: **exact organic positions on engines we can
actually query, any time, free** — and since every publish IndexNow-pings Bing,
Bing movement is our fastest feedback loop on new content.

## One-time setup (already done on this PC)

```sh
node tools/setup-openserp.mjs v0.8.12   # downloads ~10MB binary into tools/bin/ (gitignored)
```
Requires Chrome installed (openserp drives a headless Chromium).

## Daily use

```sh
npm run rank           # all 14 keywords × Bing + DuckDuckGo, ~5 min, polite delays
npm run rank -- --engine bing --delay 3000   # faster, one engine
npm run rank -- --depth 50                   # look deeper (slower)
```

**Or from Studio:** "Track rankings now" button (Rank tracker panel) — runs it
in the background, panel shows positions + ▲▼ movement when done. Run-lock
prevents double-starts (stale lock auto-expires after 15 min).

## Data

| File | Tracked? | What |
|---|---|---|
| `tools/rank-keywords.json` | ✅ git | keywords + target domain — edit freely, tracker reads live |
| `content/rank-history.jsonl` | ❌ local | append-only history; each line = one full run |

Each row stores rank, result-pool size, and the top-3 domains for that query —
so the history answers "who is above us?" too.

## Reading the baseline (2026-09-20, day 1)

- DDG: `static salvage vs hunter` **#1 + #2**, `beaniestudio.site` #1,
  `beanie studio roblox` #5 — brand is owned.
- Bing: brand-as-text (`static salvage vs hunter`) not surfacing the domain yet —
  Bing's index of a 3-week-old site is slower; re-check after next IndexNow pings.
- All 11 competitive keywords: not in top 30 — expected. That's the job the
  blog queue + internal links + backlinks have ahead of them, and this tracker
  is how we'll watch each post move its keyword.
