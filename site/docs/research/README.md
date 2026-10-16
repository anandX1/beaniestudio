# Research index

These are the measured research deliverables behind the 2026-10-17 work. They were
produced outside the repository and copied here so they survive a clean checkout.

Everything in this folder is **research, not code**. Nothing here is deployed:
`.assetsignore` excludes `site/` from the Cloudflare upload.

| File | What it is |
|---|---|
| [seo-audit.md](seo-audit.md) | Every query and page from GSC + Bing, per-query CTR diagnosis, title/description rewrites (44 KB) |
| [design-teardown.md](design-teardown.md) | 13 premium dark sites measured live (type scale, spacing, radii, accent share, motion timings) (49 KB) |
| [imagery-patterns.md](imagery-patterns.md) | 12 imagery techniques verified live + the mixed-exposure grading recipe (42 KB) |
| [homepage-redesign-spec.md](homepage-redesign-spec.md) | The measured homepage diagnosis and the section-by-section rebuild (63 KB) |
| [perf-lab.md](perf-lab.md) | AVIF and font subsetting, with measured byte tables and the metric-verification gate (43 KB) |
| [bug-hunt.md](bug-hunt.md) | The latent-bug audit that found the false player count and five other wrong facts (32 KB) |

## How to read them

- **`bug-hunt.md` first.** It is the one that found real defects, including the site
  claiming 7 players per server when the game supports 6.
- **`seo-audit.md`** explains why the CTR looked catastrophic (54% of impressions came
  from a query about a different company plus two retired URLs) and what to write instead.
- **`design-teardown.md`** and **`imagery-patterns.md`** are the evidence behind every
  visual decision. They include a "what NOT to do" section measured from real sites — not
  opinions.
- **`homepage-redesign-spec.md`** is the only one whose recommendations were partly
  superseded: two of its "free wins" (retargeting the hero `sizes`, and the `1px` sizes
  on the story images) were checked afterwards and found to be **already correct**. Do not
  apply them.
- **`perf-lab.md`** corrects two premises of its own brief: the site never shipped PNGs
  on an LCP path, and fonts are not on the text-LCP critical path because every face uses
  `font-display: swap`.
