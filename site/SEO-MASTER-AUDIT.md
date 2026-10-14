# SEO master audit — every workstream, honest status, and the order to fix them

Written 2026-10-14 after reading this repo's own SEO machinery
(`content/keywords.json`, `tools/rank-keywords.json`, `scripts/content-engine.mjs`,
`tools/autopilot.mjs` + config, `BLOG-100.md`, `BLOG-ARCHITECTURE.md`, `GROWTH.md`,
`RANK-TRACKING.md`, `SEO-PLAYBOOK.md`, `BACKLINKS.md`, `WIKI-KIT.md`).

Two purposes: (1) a blunt read of what the existing keyword/blog machinery is actually
doing, and (2) the complete map of SEO workstreams with status, so they can be worked
one at a time instead of by vibes.

---

## Part 1 — What the existing machinery is actually doing

### The docs are genuinely good

Say this first, because it is true and unusual: `BLOG-ARCHITECTURE.md` covers hub-and-spoke
clusters, Google Discover, and what actual studios do. `GROWTH.md` has a real funnel and a
bottleneck map. `RANK-TRACKING.md` is honest about why it tracks Bing/DuckDuckGo instead of
Google. `REACH-PLAYBOOK.md` cites Roblox's own discovery docs. This is far better thinking
than most indie projects have.

The problem is not the thinking. It is the input.

### Finding 1 — the keyword harvester has never harvested a brand keyword

`content/keywords.json` holds **113 keywords. Zero of them contain "STATIC", "Beanie",
"Jingles" or "Salvage".** Verified by filter, not by eye.

That is not a bug in the harvester — `content-engine.mjs` works. It is a bug in the seeds:

```
"roblox horror game", "asymmetrical horror", "roblox horror multiplayer",
"hide and seek horror game", "5v1 horror game", "roblox horror with friends",
"roblox sound based horror", "new roblox horror 2026", "roblox horror no radar",
"scary roblox games to play with friends"
```

Every seed is a generic genre term, so every harvested keyword is a generic genre term.
The result reads like a list of fights we cannot win: `hide and seek game`,
`hide and seek horror game 2013`, `hide and seek horror game movie`,
`roblox horror music download`, `old roblox horror music`,
`good roblox horror movies 2023`, `how to make sounds in roblox`,
`under the radar roblox code`.

**Why this matters more than anything else on this page.** A one-month-old domain with
effectively zero backlinks cannot rank for `roblox horror games`. It *can* rank for
`static roblox codes`, `static jingles abilities`, `how to play static roblox`, because for
those we are the only credible source and there is no competition. We have been
optimising for the lost fights and ignoring the winnable ones.

The same flaw is in `tools/rank-keywords.json`: 11 of its 14 tracked keywords are generic
(`best roblox horror games 2026`, `scary roblox games to play with friends`). Only 3 are
brand terms — and those 3 are the ones that will actually move.

### Finding 2 — the 100-post plan is a scaled-content trap

`BLOG-100.md` is well structured (Tier 1 converters → Tier 4 long-tail). But the tiers are
populated from the generic keyword list above, and the stack it describes is
`Groq drafts + humanize` → 1,000-word drafts, with a `900-word bar` in the SEO lint.

Two problems, both already proven in this repo's own history:

- It is the pattern that got ~20 generated posts **retired** and the autopilot **paused**.
  `tools/autopilot-config.json` says it plainly: *"auto-generated posts were contradicting
  the real game."* Generating 100 more from the same generic keywords repeats that.
- **Word count is not a quality signal.** A 900-word bar optimises for padding. Google's
  scaled-content policy cares about value per page, not length. Our own best pages —
  `/guide/numbers/` at 988 words of pure data, `/guide/jingles/` at 916 — earn their length;
  a 1,000-word post about `hide and seek game movie` never would.

### Finding 3 — the toolstack table makes claims that are no longer true

In `BLOG-100.md`:

| Claim | Reality |
|---|---|
| "Astro — static site, **perfect Lighthouse**" | Performance is 51–72, not perfect. Feeds the false 99–100 belief. |
| "audit-live — **140-point** production audit" | It is **228** checks now. |
| "**Pagefind** — instant client-side search over the blog" | Pagefind is a dependency, but **there is no search page**. It was never wired up. |
| "SEO lint — 15-point scoring incl. **900-word bar**" | The word bar is a bad target (see Finding 2). |
| "Groq drafts + humanize" | Paused, and it is the thing that produced the retired posts. |

### Finding 4 — what is genuinely strong (and should be protected)

- **Unique first-party data.** 80 original screenshots, exact game config numbers, the
  scrape/crusher/minigame tables. Nobody else has this and it cannot be copied.
- **`/guide/numbers/`** — a citeable reference. This is the right shape for a linkable asset.
- **Technical SEO.** 228 production checks passing, canonicalised internal links, licence
  metadata on 125 images, clean redirects, real `llms.txt`, extensive structured data.
- **Honesty discipline.** The paused autopilot, the retired thin posts, and the
  "facts must match the game" rule are all correct instincts. They are why the technical
  layer is sound.

---

## Part 2 — The complete SEO map, with status

Status key: **DONE** · **PARTIAL** · **WEAK** · **MISSING** · **N/A**
Owner: **ME** = I can do it without input · **YOU** = needs an account/dashboard/decision

### A. Technical foundations

| # | Workstream | Status | Owner | Note |
|---|---|---|---|---|
| A1 | Crawlability (robots.txt, sitemaps) | DONE | ME | sitemap-index + image sitemap, both declared |
| A2 | Indexation control (canonicals, noindex) | DONE | ME | 228 checks; noindex only on 404 |
| A3 | Redirect hygiene | DONE | ME | www→apex 301 live; 0 internal redirects; retired pages 301 |
| A4 | HTTPS enforcement | DONE | YOU | Cloudflare "Always Use HTTPS" verified working |
| A5 | URL structure | DONE | ME | trailing-slash canonical everywhere |
| A6 | Internal linking architecture | DONE | ME | 914 references resolve; guide sidebar + footer hubs |
| A7 | Orphan pages | DONE | ME | every page reachable in ≤2 hops |
| A8 | Duplicate content control | DONE | ME | 7 thin pages retired with 301s |
| A9 | Page speed / CWV (field) | **PARTIAL** | ME | CLS 0.014 excellent; **LCP P90 4,360ms, 13% poor** |
| A10 | JS rendering / SSR | DONE | ME | fully pre-rendered SSG |
| A11 | Compression | DONE | — | zstd live |
| A12 | Crawl budget | DONE | ME | no thin or redirected URLs left to waste it |
| A13 | i18n / hreflang | N/A | — | single language |
| A14 | Log-file analysis | N/A | — | no origin logs on Workers; Cloudflare Analytics instead |
| A15 | Broken link monitoring | DONE | ME | `check:links` fails the build |

### B. On-page

| # | Workstream | Status | Owner | Note |
|---|---|---|---|---|
| B1 | Titles + meta descriptions | DONE | ME | unique, ≤60/≤165, verified per page |
| B2 | Heading hierarchy | DONE | ME | one H1, ordered H2/H3 |
| B3 | Thin-content elimination | DONE | ME | thinnest real page 391 words, all substantive |
| B4 | **Keyword targeting & intent** | **WEAK** | ME | **0 of 113 keywords are brand/game terms — see Part 1** |
| B5 | Image SEO | DONE | ME | descriptive alt, stable URLs, licence metadata |
| B6 | Structured data | DONE | ME | Org, WebSite, VideoGame, Article, FAQ, ImageGallery, ItemList, VideoObject, Breadcrumb, AboutPage |
| B7 | E-E-A-T signals | DONE | ME | `/about/` with real people, roles, addresses |
| B8 | Breadcrumbs | DONE | ME | visible + BreadcrumbList |
| B9 | Anchor-text quality | PARTIAL | ME | internal anchors are descriptive; could be more query-shaped |
| B10 | Snippet formatting | PARTIAL | ME | FAQPage exists; no deliberate featured-snippet shaping |
| B11 | Freshness signals | PARTIAL | ME | `updated` dates on guides; only 2 blog posts |
| B12 | Answer-engine optimisation | DONE | ME | llms.txt generated from data; facts page |
| B13 | Accessibility (a ranking-adjacent quality signal) | DONE | ME | 100 |

### C. Content & keyword strategy

| # | Workstream | Status | Owner | Note |
|---|---|---|---|---|
| C1 | Keyword research quality | **WEAK** | ME | seeds are all generic; needs a brand-first seed set |
| C2 | Search-intent mapping | PARTIAL | ME | guide pages good; blog untargeted |
| C3 | Long-tail game-specific coverage | PARTIAL | ME | good guides; missing "how to play with friends", "how to be the Hunter" |
| C4 | Content volume & cadence | **WEAK** | YOU+ME | 2 posts; a real cadence needs your stories |
| C5 | Unique first-party data | **STRONG** | ME | config numbers, 80 original screenshots |
| C6 | Content refresh / decay | MISSING | ME | nothing revisits old pages |
| C7 | Cannibalisation control | MISSING | ME | unmeasured; `/guide/` vs `/guide/scrap/` overlap was flagged by GSC |
| C8 | Topic clusters / hub-spoke | PARTIAL | ME | guide hub exists; blog is not clustered |
| C9 | Video SEO | PARTIAL | YOU | 7 Shorts; real clips would need recording |
| C10 | UGC | N/A | — | — |

### D. Off-page authority

| # | Workstream | Status | Owner | Note |
|---|---|---|---|---|
| D1 | Backlinks | **WEAK** | YOU | ~zero. The single biggest constraint. |
| D2 | Digital PR / outreach execution | PARTIAL | YOU | drafts written, nothing sent |
| D3 | Entity building (Wikidata) | PARTIAL | YOU | 2 items exist, unpopulated |
| D4 | Brand mentions | WEAK | YOU | grows with D1/D2 |
| D5 | Community presence (Discord/Reddit/Roblox) | PARTIAL | YOU | Discord exists; Roblox surfaces unused |
| D6 | Guest posting / collabs | MISSING | YOU | — |
| D7 | Broken-link building | MISSING | ME | find dead STATIC-related links on other sites, offer our page |
| D8 | Journalist requests (HARO-style) | MISSING | YOU | needs your inbox |
| D9 | Podcast / YouTube appearances | MISSING | YOU | — |

### E. Measurement & ops

| # | Workstream | Status | Owner | Note |
|---|---|---|---|---|
| E1 | GSC + Bing verification, sitemap submitted | DONE | YOU | both verified |
| E2 | Rank tracking | PARTIAL | ME | Bing/DDG via OpenSERP; Google via GSC only |
| E3 | Analytics | PARTIAL | YOU | Cloudflare beacon only if token is set — confirm |
| E4 | Field CWV monitoring | PARTIAL | YOU | Cloudflare shows LCP; GSC has the CWV report |
| E5 | Conversion tracking (site → Roblox click) | **MISSING** | ME | we cannot currently tell if the site sends *players* |
| E6 | Content performance reporting | MISSING | ME | no per-page GSC join |
| E7 | Competitor monitoring | PARTIAL | — | `competitor-intel` skill exists, unused |
| E8 | Algorithm-update monitoring | MISSING | ME | — |

### F. AI-era (new surface, real traffic)

| # | Workstream | Status | Owner |
|---|---|---|---|
| F1 | AI crawler policy | DONE | ME |
| F2 | llms.txt | DONE | ME |
| F3 | Structured fact source | DONE | ME |
| F4 | Being cited by answer engines | PARTIAL | YOU+ME |

### G. Roblox-platform SEO — **where this business actually grows**

| # | Workstream | Status | Owner | Note |
|---|---|---|---|---|
| G1 | Game title/description metadata | ? | YOU | must not use giveaway/Robux language |
| G2 | Thumbnails + personalization | MISSING | YOU | Roblox A/B tests them for free |
| G3 | Experience Events | MISSING | YOU | drives ranked play-days signals |
| G4 | Standout Games | MISSING | YOU | hand-curated; our loop qualifies |
| G5 | Roblox group page | ? | YOU | official "best way to reach your community" |
| G6 | In-game retention (ranked signals) | ? | GAME | play-through, bounce, play days, playtime |
| G7 | Roblox semantic search | ? | YOU | accurate unique metadata is the lever |
| G8 | Notifications | MISSING | YOU | resurrects lapsed players |

---

## Part 3 — The order to fix them

Not by importance in the abstract — by **value ÷ effort**, respecting what is already done.

**Wave 1 — fix the targeting (this is the actual root cause)**
1. **Rewrite the harvester seeds** to brand + game terms first:
   `static roblox`, `static roblox codes`, `static jingles`, `how to play static roblox`,
   `static roblox map`, `static roblox worm`, `static salvage vs hunter`, plus
   `roblox asymmetrical horror 2026` style terms only where a guide page genuinely fits.
2. **Re-harvest** and rebuild `rank-keywords.json` around terms we can win.
3. **Kill the 900-word bar.** Replace the SEO lint's word target with checks that matter:
   does the page answer the query in the first screen, does it carry unique first-party data,
   does it link to the next logical page.

**Wave 2 — measure what we cannot see (E5, E6)**
4. **Conversion tracking**: instrument the "Play free on Roblox" clicks. Right now we cannot
   tell whether the site sends players at all. Without this, every content decision is blind.
5. **Join GSC page data** to per-page content, so we can see which pages earn impressions.

**Wave 3 — winnable coverage (C3, C7)**
6. Write the genuinely missing game-intent pages: "how to play STATIC with friends", and a
   Hunter-role landing that does not cannibalise `/guide/jingles/`.
7. **Measure cannibalisation** between `/guide/`, `/guide/scrap/` and `/guide/numbers/`.

**Wave 4 — technical tail (A9)**
8. Font subsetting (needs new filenames because `/fonts/*` is cached immutable for a year).

**Wave 5 — authority (yours)**
9. Execute the outreach already drafted in `REACH-PLAYBOOK.md`.
10. Populate the two Wikidata items.

**Wave 6 — Roblox (yours, and the highest growth ceiling of anything here)**
11. Thumbnails → Experience Event → Standout Games → group page → notifications.

---

## The one-line summary

**The machine is built correctly and the technical layer is genuinely finished. What is
broken is the aim: 113 harvested keywords, none of them ours.** Fix the seeds and the
winnable-term targeting first, then measure conversions, then cover the missing
game-intent pages — and only then spend effort on volume. Volume aimed at terms we cannot
win is how the 20 retired posts happened.
