# VIRAL-GEO-PLAYBOOK — the 2026 evidence-based traffic plays

> Built from a research sweep (Sep 2026): GEO citation studies (680M citations analyzed),
> Ahrefs' 137k-domain llms.txt study, Reddit-SERP commercial-keyword data, indie-horror
> virality cases (Ampere Analysis, Chris Zukowski). Every play is ranked by
> **effort → expected impact** for OUR situation: $0 budget, machinery already built
> (autopilot, rank tracker, analytics, broadcaster). Debunks included so we never
> chase dead tactics.

---

## 0. The one research finding that reframes everything

**AI search engines barely overlap.** Only **11% of domains are cited by both
ChatGPT and Perplexity** (680M-citation study). Winning one engine says nothing
about the other. And the citation sources are not what SEOs assumed:

| Engine | Top citation source | Share |
|---|---|---|
| Perplexity | **Reddit** | **~1 in 5 citations** |
| ChatGPT | Wikipedia | ~5% |
| Google AI Overviews | Reddit threads (2026 deal) | rising |

**Translation:** the highest-leverage "SEO" work in 2026 is (a) being a real
entity in structured data, (b) existing inside Reddit discussions honestly, and
(c) publishing **original data** that engines and journalists must cite. Keyword
blog posts alone are table stakes, not the moat.

---

## 1. TIER-0 plays — this week, ~2h total, near-zero cost

### Play 1 — Wikidata entity (the AI knowledge-graph backdoor)
Create a Wikidata item for **STATIC: Salvage vs Hunter** (instance of: video game;
platform: Roblox; genre: survival horror; publisher: Beanie Studio; official
website: beaniestudio.site). 30 minutes, free, permanent.
- AI engines lean on Wikidata heavily for entity facts; it is the cheapest way to
  exist in the knowledge graph before we "deserve" a Wikipedia page.
- Then add `"sameAs": [wikidata URL, YouTube channel, Roblox game URL]` to our
  JSON-LD so engines tie our site to the entity.
- Owner: **[YOU]** (needs an account; I draft the item text).

### Play 2 — Publish the "296 searches" study (original data = citation magnet)
We ALREADY harvested **296 real Google/DuckDuckGo autocomplete queries**
(BLOG-100.md). That is an original dataset nobody else has.
- Post: **"We analyzed 296 real Google searches about Roblox horror. Here's what players actually want in 2026."**
- Full methodology (how autocomplete harvesting works), a table of top queries by
  intent, 5 counterintuitive findings.
- Why it works: journalists, listicle writers, and AI engines **must cite the
  source of a stat**. "34% of searches mention playing with friends" is citable;
  "our game is fun" is not. Statistics pages are the most-cited page type in
  AI answers after Wikipedia/Reddit.
- Owner: **me** (one agent-researched post, ~2h). Then pitch it to
  GameDiscoverCo + r/gamedev ("data" posts are the ones that hit front page).

### Play 3 — Reddit presence doctrine (1 in 5 Perplexity citations)
Reddit threads rank for **150k+ commercial keywords** and feed AI Overviews.
- **[YOU]**: answer genuinely in r/RobloxHelp, r/roblox, r/HorrorGaming when
  threads ask "scary roblox games?" — mention STATIC only where it's a real
  answer. One helpful comment beats ten promos; Reddit bans astroturf fast.
- **Me**: the site's FAQ/getting-started pages get rewritten to **answer the exact
  questions those Reddit threads discuss**, in quotable 40–60 word direct-answer
  paragraphs — so when AI engines summarize a Reddit thread, our page is the
  citation.
- When the game launches: **AMA** in r/gamedev ("solo dev building a
  sound-only-hunting horror game — AMA"). Data + stories front-page; ads don't.

---

## 2. TIER-1 plays — this month, the compounding assets

### Play 4 — Free SFX pack as a link magnet
Game devs **permanently** link to free asset packs. We have a full SFX
architecture (31_sfx doc) — release **"50 free horror ambience loops (CC0)"**
on a `/sfx-pack/` page.
- Every indie-dev blog, YouTube description, and "free SFX" listicle becomes a
  backlink forever. Free-asset pages are the highest evergreen-link-value asset
  a game studio can publish.
- Requires: you export/render the loops from your SFX work; I build the page
  (license, download, attribution request). **This is the sleeper hit of the playbook.**

### Play 5 — Fandom wiki for STATIC
roblox.fandom.com is a top-100k domain; game wikis rank for `"<game> wiki"`
queries and get scraped into AI answers. Create the STATIC wiki (3–5 starter
pages: the game, the Scrapper, the Hunter, maps) from our docs. **[YOU] + me.**
- SEO value: Fandom's authority + entity corroboration + capturing branded
  wiki queries before squatters do.

### Play 6 — Statistics hub (living page)
`/statistics/` — "Roblox horror by the numbers": our autocomplete study, our rank
tracker's SERP data, public Roblox stats, updated monthly. Every update is a new
citation opportunity + RSS item + Discord broadcast (already automated).

### Play 7 — Glossary hub (the honest programmatic play)
`/glossary/` — 25 interlinked definitions (proximity chat, asymmetrical horror,
CCU, DevEx, IndexNow…), each with a 40–60 word direct-answer first paragraph
(featured-snippet + AI-citation format). Interlink from every blog post. This is
programmatic SEO that is *genuinely useful* — the kind engines don't punish.

---

## 3. The measurement loop (why our machinery makes this unfair)

Weekly loop, 15 minutes:
1. **Ask the engines**: "best roblox horror games 2026" in ChatGPT, Perplexity,
   Gemini — log whether beaniestudio.site is cited (manual rows in the rank
   tracker's JSONL).
2. **Analytics tab**: which referrers moved (Reddit? Fandom? Discord?).
3. **Double down** on whatever moved; kill what didn't. The Autopilot pipeline
   makes content cheap; measurement is what makes it *grow*.

---

## 4. Debunked — do NOT spend time (researched, with receipts)

| Tactic | Verdict | Source |
|---|---|---|
| **llms.txt as a traffic lever** | Dead: 97% of 137k llms.txt files get **zero** AI-bot fetches; zero citation lift. We keep ours (free), but it is not a strategy. | Ahrefs study, 2026 |
| **VideoGame review stars in Google** | Not a supported rich-result type in practice; don't chase `aggregateRating` stars. VideoGame schema still helps **entity understanding** — keep it, minus star-chasing. | Google docs + 2026 eligibility lists |
| **Auto Minify toggles** | Cloudflare **retired** Auto Minify in 2024; Astro already minifies. | Cloudflare changelog |
| **"Submit to 500 directories"** | Spam-profile risk, zero AI-engine value. | every modern study |
| **Scaled AI content without value-add** | Google's scaled-content abuse policy; our live-vs-evergreen doctrine already guards this. | Google spam policies |

---

## 5. What "viral" actually is for a Roblox horror game (Ampere/Zukowski)

Horror is the most viral genre **because clips are self-propagating** (jump-scare
reactions). The blog/SEO plays above make us *findable*; virality comes from:
- **10s vertical clips with a scare in the first 2s** (editor: batch-cut 20 from
  every playtest)
- **Creator keys + streamer clips** (CREATOR-ENGINE.md covers the machine)
- The site's job is to be the **conversion floor**: every clip → link-in-bio →
  landing page that answers "what is this game" in one screen.

---

*Next review: when Play 2 (the study) is live and pitched, or after the first
citation-log week — whichever comes first.*
