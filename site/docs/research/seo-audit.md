# beaniestudio.site — Search Performance Audit

**Subject:** STATIC: Salvage vs Hunter — official site (`beaniestudio.site`)
**Data:** Bing/Keyword report 2026-10-16, GSC Performance export 2026-10-16, GSC Performance export 2026-10-08, GSC Coverage export 2026-10-14, Bing AI Search Queries report 2026-10-16
**Workspace:** `D:\roblox game 4\_seo-audit\` — nothing in `beaniestudio-site\` was modified.

---

## 0. Reconciliation first — three stated numbers do not match the files

I read every file and printed real headers before analysing. Three numbers in the brief are **not reproducible** from the data provided:

| Claim in brief | What the files actually say |
|---|---|
| Bing: 92 impressions, 1 click, 1.09% CTR | `KeywordReport_10_16_2026.csv` = 44 queries, **68 impressions, 1 click, 1.47%**. The *click count matches* (the one click is `roblox games with proximity chat scary`). 68 ≠ 92; 1/92 = 1.09% so the brief's CTR is derived from 92, not 68. The export is likely a top-N subset — but 92 is not in the file. |
| GSC: 1 click, 92 impressions, 1.09% CTR | `Performance-on-Search-2026-10-16.zip` = **3 clicks, 179 impressions** (Chart.csv, 2026-09-12→10-14); 199 impressions over 31 URLs in Pages.csv; 0 clicks / 37 impressions in the exported Queries.csv. Not 92/1. |
| `/faq/` 58 imp · `/play/` 26 imp · `/` 13 imp · http `/` 5 imp / 1 click | **No file contains these.** GSC Pages.csv shows `/faq/` = 3 imp (avg pos **82.33**), `/play/` = 9 imp (pos 23.89), `https://…/` = 34 imp / 2 clicks. There is no `http://beaniestudio.site/` row at all. These are almost certainly **Bing page-report** figures, and that report was not supplied. |

This does not change the diagnosis, but the headline "1.09% CTR" should not be repeated as a GSC fact. **Every figure below is quoted from a file I parsed, and I label which file.**

Two other structural facts from the exports:
- The GSC **page sum (199) exceeds the chart sum (179)** — normal GSC anonymisation, but it means page-level percentages should not be added to 100%.
- **15.1% of all GSC impressions (27/179) are the single query `picfomo.com`**, at average position **55.89**.

---

## 1. The query list — branded vs non-branded

### 1a. Bing / Keyword report — all 44 queries

| Imp | Clk | CTR | Pos | Class | Query |
|---:|---:|---:|---:|---|---|
| 6 | 0 | 0% | 9.67 | static-only | v 5 static |
| 6 | 0 | 0% | 4.00 | static-only | what is the game that static report youtubers plays in roblox |
| 4 | 0 | 0% | 7.00 | static-only | 5vstatic |
| 4 | 0 | 0% | 8.50 | static-only | static roblox studio |
| 2 | 0 | 0% | 6.00 | non-branded | a roblox scary games with 7 ppl aloud |
| 2 | 0 | 0% | 9.00 | non-branded | asymmetrical horror game origin |
| 2 | 0 | 0% | 9.00 | non-branded | best two player scary game on roblox |
| 2 | 0 | 0% | 5.00 | non-branded | fun 3 player games on roblox story scary |
| 2 | 0 | 0% | 10.00 | non-branded | games to play with 3 friends in roblox horror |
| 2 | 0 | 0% | 9.00 | static-only | v5 static game free play |
| 2 | 0 | 0% | 7.00 | static-only | v5 static games free online |
| 2 | 0 | 0% | 7.00 | non-branded | what is a asymmetrical horror game |
| 1 | 0 | 0% | 9.00 | non-branded | 5 player party games roblox horror |
| 1 | 0 | 0% | 7.00 | non-branded | asymmetric horror ne demek |
| 1 | 0 | 0% | 6.00 | non-branded | asymmetrical horror definition |
| 1 | 0 | 0% | 6.00 | non-branded | asymmetrical horror game def |
| 1 | 0 | 0% | 7.00 | non-branded | asymmetrical horror meaning |
| 1 | 0 | 0% | 7.00 | non-branded | best roblox horror games to play with friend s |
| 1 | 0 | 0% | 3.00 | non-branded | best scary funny roblox game for duos |
| 1 | 0 | 0% | 9.00 | non-branded | best scary gams on roblox  with 6 people |
| 1 | 0 | 0% | 7.00 | non-branded | definition of asymmetrical horror game |
| 1 | 0 | 0% | 7.00 | non-branded | description of an asymmetrical horror game |
| 1 | 0 | 0% | 1.00 | static-only | does static have 60 seconds |
| 1 | 0 | 0% | 10.00 | non-branded | five player roblox horror games |
| 1 | 0 | 0% | 8.00 | non-branded | funny roblox horror games 2026 |
| 1 | 0 | 0% | 9.00 | non-branded | great roblox games horror with friends |
| 1 | 0 | 0% | 9.00 | non-branded | how to spell asymmetrical horro game |
| 1 | 0 | 0% | 7.00 | non-branded | roblock mod for low end android |
| 1 | 0 | 0% | 10.00 | non-branded | roblox game room screenshot |
| 1 | **1** | 100% | 2.00 | non-branded | **roblox games with proximity chat scary** |
| 1 | 0 | 0% | 8.00 | non-branded | roblox horror games 5 players |
| 1 | 0 | 0% | 6.00 | non-branded | roblox horror games multiplayer for more than 4 players |
| 1 | 0 | 0% | 6.00 | non-branded | roblox horror games with vc interactions |
| 1 | 0 | 0% | 4.00 | non-branded | scariest roblox games multiplayer no age limit |
| 1 | 0 | 0% | 6.00 | non-branded | scary roblox games to play as a duo |
| 1 | 0 | 0% | 10.00 | static-only | static unblocked |
| 1 | 0 | 0% | 10.00 | static-only | static underneath the room dollwave |
| 1 | 0 | 0% | 9.00 | static-only | static作者 |
| 1 | 0 | 0% | 6.00 | non-branded | what does asym stand for (in horror games) |
| 1 | 0 | 0% | 6.00 | static-only | what does static mean on roblox marketplace |
| 1 | 0 | 0% | 7.00 | non-branded | what is asymettrical horror |
| 1 | 0 | 0% | 7.00 | non-branded | what is asymmetrical horror |
| 1 | 0 | 0% | 8.00 | non-branded | what is asymmetrical horror game |
| 1 | 0 | 0% | 9.00 | non-branded | why is one bounce called one bounce on asymetrical horror |

**Branded vs non-branded — the single most important split:**

| Bucket | Queries | Impressions | Share | Clicks |
|---|---:|---:|---:|---:|
| Contains `beanie` / `jingles` / `salvage` (**true brand tokens**) | **0** | **0** | **0.0%** | 0 |
| Contains `static` only (**ambiguous — an ordinary English word**) | 11 | 29 | 42.6% | 0 |
| **No brand token at all** (non-branded) | 33 | 39 | 57.4% | **1** |

**Blunt version: there is no branded search demand.** Zero queries contain "beanie", "jingles" or "salvage". Zero queries contain the official long name "Salvage vs Hunter". The word "STATIC" is a common English word, and every one of the 11 "static" queries resolved to a *different* entity (a Roblox Studio concept, a Marketplace term, an unblocked-games page, a Dollwave track, "V5 static", a Chinese author search). The only branded query anywhere in the data is `beanie studio` in the GSC export — **1 impression, position 3, 0 clicks.**

### 1b. GSC export — all 7 exported queries

| Imp | Clk | Pos | Query | Read |
|---:|---:|---:|---|---|
| 27 | 0 | 55.89 | picfomo.com | Third-party brand pollution. Page 6. 15.1% of all GSC impressions. |
| 3 | 0 | **3.67** | map bunker roblox | Position 3.67, zero clicks — snippet failure. |
| 3 | 0 | 46.67 | worm hub | Different product. Page 5. |
| 1 | 0 | **3.00** | beanie studio | Own brand, position 3, **no click**. |
| 1 | 0 | 6.00 | roblox gameplay screenshot | `/screenshots/` |
| 1 | 0 | 21.00 | at worm | Junk collision. Page 3. |
| 1 | 0 | 39.00 | biast maps | Different product. Page 4. |

### 1c. The site's authored keyword map vs reality

`site/content/keywords-game.json` contains **65 authored intents, every one phrased `static roblox <mechanic>`** (`static roblox codes`, `static roblox jingles speed`, `static roblox how many players`, …). Its own note admits autocomplete harvesting "returned 32 keywords and none were about this game."

**Not one of those 65 intents appears in the harvested data.** The nearest matches are `v5 static game free play` and `v5 static games free online` (2 impressions each) — and those are almost certainly a different entity. The content plan is written against a query set that does not exist yet. That is a defensible *demand-creation* strategy for a brand this new, but it means **none of the pages built to those intents can earn impressions today**, while the pages that do earn impressions are the ones accidentally matching generic queries — and those pages' titles were never written for those queries.

---

## 2. Where the impressions are concentrated

**Bing (68 impressions, 44 queries):** extraordinarily flat. The largest single query is 6 impressions (9% of total). **82.4% of all impressions sit at positions 6–10**; only 4.4% sit at positions 1–3. Impression-weighted average position = **7.26**.

| Position bucket | Queries | Impressions | Share | Clicks |
|---|---:|---:|---:|---:|
| 1–3 | 3 | 3 | 4.4% | 1 |
| 4–5 | 3 | 9 | 13.2% | 0 |
| 6–10 | 38 | 56 | 82.4% | 0 |

**GSC (199 impressions over 31 URLs):** thin and spread. Top URL is the homepage at 34 impressions (17%); nothing else exceeds 16.

| Clicks | Imp | CTR | Avg pos | URL |
|---:|---:|---:|---:|---|
| 2 | 34 | 5.88% | 7.71 | `https://beaniestudio.site/` |
| 1 | 16 | 6.25% | 9.81 | `/guide/map/` |
| 0 | 15 | 0% | 17.07 | `/blog/why-roblox-is-the-best-game-engine-for-solo-developers/` |
| 0 | 13 | 0% | 19.85 | `/guide/worm/` |
| 0 | 10 | 0% | **3.30** | `/guide/` |
| 0 | 9 | 0% | 6.44 | `/guide/scrap/` |
| 0 | 9 | 0% | 21.11 | `/creators/` |
| 0 | 9 | 0% | 23.89 | `/play/` |
| 0 | 8 | 0% | 9.88 | `/screenshots/` |
| 0 | 7 | 0% | 5.29 | `/guide/map` ← **same page, no trailing slash** |
| 0 | 3 | 0% | 4.67 | `/codes/` |
| 0 | 3 | 0% | 82.33 | `/faq/` |

**Devices — the most under-noticed fact in the whole dataset:**

| Device | Clicks | Impressions | CTR | Avg pos |
|---|---:|---:|---:|---:|
| Mobile | 3 | 65 | **4.62%** | **5.51** |
| Desktop | **0** | 113 | **0.00%** | **20.65** |
| Tablet | 0 | 1 | 0% | 4 |

**Every click came from mobile. Desktop holds 63% of impressions at average position 20.65 — page 2–3, where a ~0% CTR is arithmetically correct, not a defect.** A site-wide "1.09% CTR" is therefore mostly a *ranking* statistic (plus 15% pollution), not proof that every snippet is broken.

Countries: US 84 imp / 2 clicks / pos 25.31 — the biggest market is the worst-ranked. India 12 imp / 1 click / pos 3.17.

---

## 3. Why CTR is ~0 — per-query diagnosis

First, the honest framing: **38 of the 44 Bing queries sit at position 6–10, carrying 82.4% of all Bing impressions (56 of 68).** At those positions a 1–3% CTR is normal, and 56 impressions should have produced roughly 1 click by chance. So most of the 0% is position, not copy. The **provable snippet failures are the queries at positions 1–5 that still got nothing**, and the structural failures are the intent mismatches below. Query→page pairs are **not** in the CSV exports (GSC only provides them in the UI/API), so landing pages below are inferred from the served titles; I mark inference as such.

### Cluster A — "static" as an ordinary English word / wrong entity (11 queries, 29 imp, 42.6% of Bing impressions, 0 clicks)

| Query | Imp | Pos | Why nobody clicked |
|---|---:|---:|---|
| v 5 static | 6 | 9.67 | No product called "V5 Static" exists on the site. Token collision on `static` + `5`. The title says nothing about "V5", so the result looks unrelated. |
| 5vstatic | 4 | 7.00 | Not a real phrase. The engine is matching tokens; nothing can satisfy it. |
| v5 static game free play / v5 static games free online | 4 | 9 / 7 | `free play` / `free online` signals an in-browser instant-game expectation. `/play/` leads to a Roblox experience, and its title literally says "(PC & Mobile)" — it tells this searcher it is the wrong result. |
| static unblocked | 1 | 10.00 | "Unblocked" = school/work proxy games. This site is not and cannot be an unblocked-games portal. **Do not chase.** |
| static作者 | 1 | 9.00 | Chinese for "static author". No Chinese content, no author page. Wrong language *and* wrong intent. |
| static underneath the room dollwave | 1 | 10.00 | A music/album query. Nothing musical on the site. Pure collision on `static` + `room`. |
| what does static mean on roblox marketplace | 1 | 6.00 | Asks for the Marketplace meaning of the word "static". The site is a game *named* STATIC; it does not define the Marketplace term. |
| static roblox studio | 4 | 8.50 | The user wants **Roblox Studio** information (static typing / static variables in Luau). The game is built *in* Roblox Studio but nothing on the site answers this. Title confirms mismatch. |
| **does static have 60 seconds** | 1 | **1.00** | **The clearest snippet failure in the dataset.** The fact *is* on the site (`llms.txt`: "escape through the Intake Chute within 60 seconds"; `/guide/crushers/` description mentions "the 60-second extraction"). But the URL ranking at position 1 was almost certainly the homepage, whose served description is "…Up to 6 players haul 400 kg of scrap to the crushers while Jingles… hunts them." No "60 seconds". Position 1, answer absent from the snippet, no click. |
| **what is the game that static report youtubers plays in roblox** | 6 | **4.00** | Joint-largest Bing query, at position 4. The searcher wants to *identify* a game seen in a video. The homepage title ("…Free Roblox Horror Game…") is a genre label, not "yes, this is that game". No page answers "what game is this". At position 4 it also competes with the Roblox game page and YouTube, which answer identification more directly. |

### Cluster B — asymmetrical-horror definitions (14 queries, 16 imp, 0 clicks)

`what is asymmetrical horror` · `asymmetrical horror definition` / `-meaning` / `-game def` · `definition of asymmetrical horror game` · `description of an asymmetrical horror game` · `what is a asymmetrical horror game` · `what is asymmetrical horror game` · `what is asymettrical horror` · `asymmetrical horror game origin` · `what does asym stand for (in horror games)` · `asymmetric horror ne demek` · `how to spell asymmetrical horro game` · `why is one bounce called one bounce on asymetrical horror`

Every one of these wants an **encyclopedia/dictionary answer**. No page on the site is a glossary entry — the closest titles are "How to Play STATIC on Roblox — Beginner's Guide", "STATIC FAQ" and "The Worm in STATIC", all of which answer *about this game*, not *what does this term mean*. The SERPs for definition queries are held by Wikipedia, Fandom and the Dead by Daylight wiki; the site sits at positions 6–9, i.e. **below better-matched, higher-authority results, so 0 clicks is the expected outcome.** Three of these are not even game queries: `ne demek` is Turkish, "how to spell" is a spelling-help query, and "one bounce" is a DBD perk question.

**But note the AI report (§5): this exact cluster is where AI engines *do* cite the site** — 42 citations, 24% share. The click is being absorbed inside the AI answer.

### Cluster C — co-op Roblox horror discovery — the *right* audience, and the biggest structural failure (13 queries, 17 imp, 0 clicks)

`best two player scary game on roblox` (2, pos 9) · `scary roblox games to play as a duo` (1, 6) · `best scary funny roblox game for duos` (1, **3**) · `games to play with 3 friends in roblox horror` (2, 10) · `fun 3 player games on roblox story scary` (2, **5**) · `5 player party games roblox horror` (1, 9) · `five player roblox horror games` (1, 10) · `roblox horror games 5 players` (1, 8) · `roblox horror games multiplayer for more than 4 players` (1, 6) · `best scary gams on roblox with 6 people` (1, 9) · `great roblox games horror with friends` (1, 9) · `best roblox horror games to play with friend s` (1, 7) · `a roblox scary games with 7 ppl aloud` (2, 6)

Three separate reasons, all fixable:

1. **Intent is plural, the page is singular.** "Best…games", "games to play with 3 friends", "5 player party games" — the user wants *a list to choose from*. The site is *one game*. A single-game page structurally cannot satisfy it, so the user takes a competitor's listicle.
2. **The site deleted the page that could have.** `/blog/best-roblox-horror-games-2026-what-wed-actually-play/` is **301-redirected to `/`** (verified live). That was the one page targeting list intent, and it now lands on a page that cannot satisfy it. It still shows 3 impressions at position 7.33 in GSC — Google is still spending the old URL's equity on a redirect to the wrong target.
3. **No title on the site contains the qualifier the user typed.** "5", "6", "7", "duo", "3 friends", "more than 4 players" appear in *no* title. Worse, the copy is internally inconsistent: homepage description says **"Up to 6 players"**, `/play/` says **"up to 7 players per server"**, and `llms.txt` says both ("Up to 6 players" in the summary line, "up to 7 per server" in the facts) — while `game.ts` sets `serverSize: 7, scrappers 4–6, hunters 1`. The correct, searchable fact ("4–7 players") is stated inconsistently and never appears in a title.

### Cluster D — Roblox horror, generic (4 imp, 0 clicks)

- `funny roblox horror games 2026` (1, pos 8) — list intent again, and the 2026 list page is redirected away.
- `roblox horror games with vc interactions` (1, pos 6) — voice chat is a genuine, true hook the site already documents, but **no page is titled or described for it**. The only page about it, `/blog/roblox-proximity-chat-in-2026-age-checks-and-voice-rules/`, sits at pos 5.00 with 2 impressions and 0 clicks.
- `scariest roblox games multiplayer no age limit` (1, pos **4**) — "no age limit" is an age/accessibility qualifier. `/faq/` holds the age answer, but nothing in its title or description mentions age. Position 4 with no matched promise → no click.
- `roblox games with proximity chat scary` (1, pos **2**, **1 click — the only Bing click in the dataset**). This is the proof of the whole thesis: the single query whose *specific hook* (proximity/voice chat horror) matched a page actually produced a click. When the served page matches the query's distinguishing detail, people click. When the page is a generic "horror game" label, they do not.

### Cluster E — unrelated collisions (2 imp, 0 clicks)

- `roblox game room screenshot` (1, pos 10) — generic screenshot search; `/screenshots/` is titled "Official Roblox **Game Images**", which says neither "gameplay" nor "room".
- `roblock mod for low end android` (1, pos 7) — "Roblock" is a different product. Collision on `roblox`. Nothing to fix.

### Cluster F — GSC-specific

- **`picfomo.com` — 27 imp, pos 55.89, 15.1% of all GSC impressions.** The repo's own `site/CLAUDE.md` states a third-party address was once published on the site and "made `picfomo.com` the site's top Google query". At position 56 the site can never be clicked. This one query alone drags site-wide CTR down by a large fraction, and it is *pure legacy pollution*.
- **`map bunker roblox` — 3 imp, pos 3.67, 0 clicks.** Second-clearest snippet failure after "60 seconds". `/guide/map/`'s title is "STATIC Map Guide — Every Room in the Bunker (Roblox)": the user typed `bunker map`, the title says `Map Guide`, and the description never promises the top-down map that the page actually contains.
- `worm hub` (3, pos 46.67) and `biast maps` (1, pos 39) and `at worm` (1, 21) — other products' brands. Page 3–5. Nothing to win.
- `/guide/` — **10 impressions at average position 3.30 and 0 clicks**, the strongest single position-anomaly on a real page. Its title is "How to Play STATIC on Roblox — Beginner's Guide". Whatever query it ranks 3.3 for, a stranger reading that title learns only that it is a guide to a game they have not heard of. If that query is from the definition cluster (most likely), the title is answering the wrong question entirely.

### Technical causes that multiply all of the above

1. **Trailing-slash redirects are `307 Temporary`, not `301/308`.** Verified live: `/guide/map` → `/guide/map/`, `/press` → `/press/`, `/faq` → `/faq/`, `/play` → `/play/` all return **307**. A temporary redirect does not consolidate signals. Consequence visible in the data: **`/guide/map` (7 imp, pos 5.29) and `/guide/map/` (16 imp, pos 9.81) are indexed as two separate pages**, and `/press` and `/press/` likewise. That is ~9 impressions split across a duplicate, and it matches the Coverage export's **"Page with redirect — 13 pages — Failed"**. (http→https *is* a correct 301, and www→non-www *is* a correct 301 — those are fine.)
2. **Google is still spending impressions on redirected legacy URLs.** Ten blog URLs that appear in GSC with impressions are no longer in `sitemap-0.xml` (which lists only 24 URLs, of which just 2 are blog posts). Most now 301 — several to `/`, `/blog/` or `/guide/`, i.e. to pages that do not replace the article's intent. Impressions landing on a redirect to an unrelated listing can never convert.
3. **Coverage export (2026-10-14):** 19 not-indexed vs 33 indexed; failures = *Page with redirect* 13, *Alternate page with proper canonical tag* 3, *Crawled — currently not indexed* 3.
4. `robots.txt` is genuinely good (explicit allow for GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, Applebot; `CCBot`/`anthropic-ai` disallowed), and it points at `sitemap-index.xml`, which exists (200). `/sitemap.xml` 404s but nothing references it. `/llms.txt` returns 200 and is well-built. **No problem here** — worth saying because it is the one part of this that is better than average.
5. **Two descriptions exceed the truncation limit** (site rule says ≤155): `/guide/jingles/` = **159**, `/guide/worm/` = **158**. Both lose their final clause in the SERP.

---

## 4. What titles and meta descriptions are actually being served

Fetched live over HTTPS with a browser User-Agent and parsed from the real HTML (`live_pages.json`).

| Path | Served `<title>` (chars) | Served `meta description` (chars) | Canonical |
|---|---|---|---|
| `/` | `STATIC — Free Roblox Horror Game \| Beanie Studios` (49) | `STATIC is a free co-op horror game on Roblox. Up to 6 players haul 400 kg of scrap to the crushers while Jingles, a player-controlled jester, hunts them.` (153) | self ✓ |
| `/faq/` | `STATIC FAQ — Price, Devices, Players, Jingles` (45) | `Answers about STATIC on Roblox: is it free, what devices it runs on, how many players, round length, Jingles, the Worm, voice chat and codes.` (141) | self ✓ |
| `/play/` | `Play STATIC — Free Roblox Horror Game (PC & Mobile)` (55) | `How to play STATIC on Roblox: free on PC and mobile, up to 7 players per server. Open the game, find a squad in the Discord, and learn the basics.` (146) | self ✓ |
| `/guide/` | `How to Play STATIC on Roblox — Beginner&#39;s Guide` (51) | `How STATIC on Roblox works: roles, controls, the round from lobby to extraction, and beginner tips for surviving Jingles and the Worm. Official guide.` (150) | self ✓ |
| `/codes/` | `STATIC Codes (October 2026) — Roblox \| Beanie Studios` (53) | `Every working STATIC code on Roblox, checked by the developers. No codes are live in the October 2026 beta yet; launch codes will be listed here first.` (151) | self ✓ |
| `/screenshots/` | `STATIC Screenshots — Official Roblox Game Images` (48) | `80 official screenshots of STATIC on Roblox: Jingles the Hunter, every room of the bunker, crushers, pods, the Worm and the end-of-round screens.` (145) | self ✓ |
| `/guide/map/` | `STATIC Map Guide — Every Room in the Bunker (Roblox)` (52) | `The full STATIC map on Roblox: a top-down view of the bunker and screenshots of every room, from the Cargo Dock and Storage Bay to the Nuclear Reactor.` (151) | self ✓ |
| `/guide/worm/` | `The Worm in STATIC (Roblox): Triggers and Survival` (50) | `…Official guide with real numbers.` (**158 — truncated**) | self ✓ |
| `/guide/jingles/` | `Jingles (STATIC Hunter) — Abilities, Stats & Counters` (57) | `…plus how to survive it and how to play it.` (**159 — truncated**) | self ✓ |
| `/guide/with-friends/` | `How to Play STATIC With Friends (Roblox)` (40) | `How to play STATIC with friends on Roblox: same server, voice chat, splitting work, and why a partner is the difference between a pod and a rescue.` (147) | self ✓ |

**Where the mismatch is, plainly:**

| Query cluster | Impressions | What the served titles promise | The gap |
|---|---|---|---|
| Player-count / duo / co-op discovery | ~18 (Bing) | "Free Roblox Horror Game", "Play STATIC", "With Friends", "Beginner's Guide" | **The player count is never in a title** — and the two places it appears contradict each other (home says 6, `/play/` says 7, `game.ts` says 7). The user's defining qualifier is absent. |
| `does static have 60 seconds` (pos 1) | 1 | Home: "…haul 400 kg of scrap… Jingles… hunts them" | The word **"60 seconds" appears in no title or description on the homepage or FAQ**, though the fact is documented on `/guide/crushers/`. |
| `map bunker roblox` (pos 3.67) | 3 | "STATIC **Map Guide** — Every Room in the Bunker" | User typed `bunker map`; title says `Map Guide`; the description buries "top-down" in the middle. No title promises *a map*. |
| Asymmetrical-horror definitions | 16 (Bing) | "Beginner's Guide", "FAQ", "The Worm in STATIC" | Nothing on the site is a definition. Every title assumes the reader already knows the game and the genre. |
| `roblox gameplay screenshot` / `roblox game room screenshot` | 2 | "Official Roblox **Game Images**" | "Images" ≠ "gameplay screenshots" / "room screenshot". |
| `beanie studio` (pos 3) | 1 | Home is what ranks; `/about/` = "About Beanie Studios — the team behind STATIC" | The studio-brand page exists but was not the one served for the studio-brand query. |
| `static unblocked`, `v5 static*`, `worm hub`, `roblock`, `picfomo.com` | ~35 | — | **Unwinnable and not worth matching.** These need suppression/cleanup, not copy. |

One more served-page defect worth flagging: the homepage description states **"Up to 6 players"**, which contradicts `game.ts` (`serverSize: 7`) and the site's own rule 9 ("up to 7 per server"). It also understates the game for exactly the queries asking for 6 and 7 players.

---

## 5. The AI Search Queries report

**What it is:** Bing Webmaster Tools' *AI Search Queries* report. It lists the **grounding queries** — the user queries that triggered an AI-generated answer (Copilot / Bing generative search) in which the site's content was used as a source. `Citations` = number of times the site was cited; `Citation Share` = the site's share of all citations for that grounding query.

**Full contents (2 rows, verbatim):**

| Grounding Query | Intent | Topic | Citations | Citation Share |
|---|---|---|---:|---:|
| asymmetrical horror | Informational | Entertainment | 42 | 24.00% |
| 5 player roblox horror games | *(blank)* | *(blank)* | 5 | 45.45% |

**What it implies:**

1. **The site is already a cited authority — for two topics, and each is a real win.** 24% citation share on `asymmetrical horror` across 42 citations is a strong position for a one-month-old domain. **45.45% on `5 player roblox horror games` means nearly half of all AI answers for that query cite beaniestudio.site.**
2. **This is the zero-click mechanism made visible.** Those two grounding queries map directly onto the two clusters with 0 human clicks: the asymmetrical-horror definitions (16 Bing impressions, 0 clicks) and 5-player Roblox horror (5 Bing queries, 0 clicks). The site's content is doing the answering *inside* the AI answer, so the click never happens. The 1.09% CTR is partly a *success* metric in disguise.
3. **The strategic split follows from it.** For genre-definition queries, the goal should be citation share, not clicks — and `llms.txt` (200, well-structured, canonical facts, explicit "cite https://beaniestudio.site" instruction) is already the right instrument. For **`5 player roblox horror games`, the site has a 45.45% AI citation share and *no page that targets it at all*** — not in `sitemap-0.xml`, not in any title, not in `keywords-game.json` (whose 65 intents are all `static roblox …`). That is the single largest untapped asset in the dataset: high proven authority, zero owned surface.
4. It also means `keywords-game.json` is measuring the wrong universe for the current stage. The AI report shows the site's real near-term authority is **generic co-op Roblox horror discovery**, not branded mechanics.

---

## 6. Content gaps the query data reveals

Ranked by impressions behind them.

1. **No page owns `5 player roblox horror games`** — despite a **45.45% AI citation share**. 7 Bing impressions across 6 queries (`5 player party games roblox horror`, `five player roblox horror games`, `roblox horror games 5 players`, `roblox horror games multiplayer for more than 4 players`, `best scary gams on roblox with 6 people`, `a roblox scary games with 7 ppl aloud`).
2. **No list page for co-op Roblox horror.** ~13 non-branded queries want a list; the one page that served list intent (`/blog/best-roblox-horror-games-2026-what-wed-actually-play/`) is **301'd to `/`**. This is a self-inflicted wound: the site removed the page matching its largest non-branded cluster.
3. **No definition page for "asymmetrical horror".** 14 queries, 16 impressions, 0 clicks, *and* 24% AI citation share. The nearest asset, `/blog/asymmetrical-horror-1-blind-hunter-vs-5-scrappers/`, sits at **position 67.8**.
4. **No page answers `does static have 60 seconds`** as a headline fact — the single query where the site ranks **position 1** and still gets nothing.
5. **No "what game is this / STATIC on YouTube" identification page** — 6 impressions at position 4, the joint-largest Bing query, with no page built for the question.
6. **No duo / two-player targeting.** `scary roblox games to play as a duo`, `best two player scary game on roblox`, `best scary funny roblox game for duos` = 5 impressions. `/guide/with-friends/` says "with friends", never "2 players" or "duo".
7. **No page targeting voice / proximity chat as a Roblox-horror hook** — even though that is the *only* query in the entire dataset that produced a Bing click, and there is a relevant blog post stuck at pos 5.00 with 2 impressions.
8. **No age-rating surface.** `scariest roblox games multiplayer no age limit` (position 4, 0 clicks) and `scariest… no age limit` intent generally; `/faq/` holds the answer but no title or description mentions age.
9. **No studio-brand page ranking for `beanie studio`** (position 3, 0 clicks). `/about/` exists and is titled correctly, but it was not the URL served for the studio's own name.
10. **The `v5 static` / `V5 static` cluster is unowned** — 14 impressions, **20.6% of all Bing impressions**, across 4 queries (`v 5 static`, `5vstatic`, `v5 static game free play`, `v5 static games free online`). **This needs an owner decision before any content is written:** if "V5 static" is a version of STATIC or an adjacent real thing, it justifies a page; if it is a different entity entirely, it is unwinnable noise and should be documented as such rather than chased.
11. **Waste to be suppressed, not matched:** `static unblocked`, `static作者`, `static underneath the room dollwave`, `what does static mean on roblox marketplace`, `static roblox studio`, `roblock mod for low end android`, `worm hub`, `at worm`, `biast maps`, and above all **`picfomo.com` (27 impressions, 15.1% of GSC)**.

---

## 7. Ready-to-use title / meta description rewrites

Rules applied: primary phrase appears naturally; title reads as a specific promise, not a category label; description states what the reader gets; ≤60 / ≤150 characters (stricter than the site's own ≤155); no clickbait, no ALL CAPS, no "Best 2026" filler. Character counts are exact (Python `len()` on the string as written; note the pages use an em dash `—`).

> **Note on "STATIC" in caps:** the brief bans ALL-CAPS, but `STATIC` is the product's wordmark and the site's own rule 6 says headings are uppercased in CSS never typed in caps. Keeping the brand wordmark is correct; I have removed all other shouting.

### `/` — homepage

| | Characters | Text |
|---|---:|---|
| Current title | 49 | `STATIC — Free Roblox Horror Game \| Beanie Studios` |
| **New title** | **52** | `STATIC: Salvage vs Hunter — 4-7 Player Roblox Horror` |
| Current desc | 153 | `STATIC is a free co-op horror game on Roblox. Up to 6 players haul 400 kg of scrap to the crushers while Jingles, a player-controlled jester, hunts them.` |
| **New desc** | **146** | `Free co-op Roblox horror for 4-7 players. One is Jingles the Hunter; the rest haul 400 kg of scrap, run the crushers and get 60 seconds to escape.` |

*Why:* restores the official long name (`llms.txt` canonical: "STATIC (long form: STATIC: Salvage vs Hunter)"), which is the one string that disambiguates from the ordinary word "static"; puts the player count **and** "Roblox horror" into the title (matching Cluster C); the description answers `does static have 60 seconds` and corrects "6" → "4-7".
*Alternative title (56):* `STATIC — 4-7 Player Co-op Roblox Horror | Beanie Studios` — use this if the studio brand string must stay in the homepage title.

### `/faq/`

| | Characters | Text |
|---|---:|---|
| Current title | 45 | `STATIC FAQ — Price, Devices, Players, Jingles` |
| **New title** | **51** | `STATIC FAQ — Free, 4-7 Players, 60s Escape (Roblox)` |
| Current desc | 141 | `Answers about STATIC on Roblox: is it free, what devices it runs on, how many players, round length, Jingles, the Worm, voice chat and codes.` |
| **New desc** | **140** | `Straight answers about STATIC on Roblox: price, player count, devices, round length, the 60-second escape, voice chat, age rating and codes.` |

*Why:* the current title is a category label ("Price, Devices, Players, Jingles"). The new one puts three *answers* in the title, including the `60s` that answers the position-1 query, and adds "age rating" to match the age-qualified queries. Note: in the GSC export `/faq/` averages position **82.33**, so copy alone cannot fix it — it needs internal links (see §8).

### `/play/`

| | Characters | Text |
|---|---:|---|
| Current title | 51 | `Play STATIC — Free Roblox Horror Game (PC & Mobile)` |
| **New title** | **55** | `Play STATIC Free on Roblox — PC and Mobile, 4-7 Players` |
| Current desc | 146 | `How to play STATIC on Roblox: free on PC and mobile, up to 7 players per server. Open the game, find a squad in the Discord, and learn the basics.` |
| **New desc** | **141** | `How to get into a STATIC round on Roblox: free on PC and mobile, 4-7 players per server, played inside the Roblox app with no extra download.` |

*Why:* puts "free" and the player count into the title. Honest about "inside the Roblox app" so the `static unblocked` / `free online` searcher self-selects out instead of bouncing. **Do not** claim browser play — the game is not browser-based.

### `/guide/`

| | Characters | Text |
|---|---:|---|
| Current title | 47 | `How to Play STATIC on Roblox — Beginner's Guide` |
| **New title** | **53** | `How to Play STATIC on Roblox — Round, Roles, Controls` |
| Current desc | 150 | `How STATIC on Roblox works: roles, controls, the round from lobby to extraction, and beginner tips for surviving Jingles and the Worm. Official guide.` |
| **New desc** | **143** | `A beginner walkthrough for STATIC on Roblox: the two roles, one round from lobby to extraction, controls, revives, tools and ten survival tips.` |

*Why:* "Beginner's Guide" is a category label; "Round, Roles, Controls" promises specific content. This page is at **average position 3.30 with 10 impressions and 0 clicks**, so it is the highest-leverage copy change on the site — but if it is ranking for definition-cluster queries, no title tweak will beat a purpose-built definition page (§8, fix 5).

### `/codes/`

| | Characters | Text |
|---|---:|---|
| Current title | 53 | `STATIC Codes (October 2026) — Roblox \| Beanie Studios` |
| **New title** | **53** | `STATIC Codes on Roblox — None Live Yet (October 2026)` |
| Current desc | 151 | `Every working STATIC code on Roblox, checked by the developers. No codes are live in the October 2026 beta yet; launch codes will be listed here first.` |
| **New desc** | **148** | `No STATIC codes work in the October 2026 beta. What the developers have said about codes, where they will be posted first, and what to do meanwhile.` |

*Why:* the current title reads like a codes list that contains codes, then the description says there are none — the promise and the payload contradict. Setting the expectation in the title is both honest and better CTR. **Caveat: `/codes/` at position 4.67 with 0 clicks may be correct behaviour** — there is nothing to click through for. Do not expect a large gain here.

### `/screenshots/`

| | Characters | Text |
|---|---:|---|
| Current title | 48 | `STATIC Screenshots — Official Roblox Game Images` |
| **New title** | **49** | `STATIC Screenshots — Bunker, Jingles and Crushers` |
| Current desc | 145 | `80 official screenshots of STATIC on Roblox: Jingles the Hunter, every room of the bunker, crushers, pods, the Worm and the end-of-round screens.` |
| **New desc** | **146** | `80 official STATIC screenshots, free to use: Jingles the Hunter, every bunker room, the crushers, the pods, the Worm and the end-of-round screens.` |

*Why:* "Game Images" is a category label that matches neither `roblox gameplay screenshot` nor `roblox game room screenshot`. The new title names the actual subjects. The count 80 is verified against `src/data/media.json` (`shots: 80`).

### `/guide/map/` — high priority (the position-3.67 / 0-click page)

| | Characters | Text |
|---|---:|---|
| Current title | 52 | `STATIC Map Guide — Every Room in the Bunker (Roblox)` |
| **New title** | **49** | `STATIC Bunker Map — Every Room, Top-Down (Roblox)` |
| Current desc | 151 | `The full STATIC map on Roblox: a top-down view of the bunker and screenshots of every room, from the Cargo Dock and Storage Bay to the Nuclear Reactor.` |
| **New desc** | **147** | `A top-down map of the STATIC bunker with a screenshot of every room, from the Cargo Dock and Storage Bay to the Nuclear Reactor and the exit chute.` |

*Why:* the query is `map bunker roblox`; the old title said "Map Guide". The new title leads with "Bunker Map" and promises "Top-Down", which is what the page actually delivers.

### `/guide/with-friends/` — bonus, directly matches 5 impressions

| | Characters | Text |
|---|---:|---|
| Current title | 40 | `How to Play STATIC With Friends (Roblox)` |
| **New title** | **45** | `STATIC With Friends — Duos, 3 Players, Squads` |
| Current desc | 147 | `How to play STATIC with friends on Roblox: same server, voice chat, splitting work, and why a partner is the difference between a pod and a rescue.` |
| **New desc** | **150** | `How to get your friends into one STATIC server on Roblox: voice chat, splitting roles, and why a partner is the difference between a pod and a rescue.` |

*Why:* the queries say "duo", "two player", "3 friends". "With Friends" matches none of that wording.

### Also fix (not rewrites, corrections)

- `/guide/jingles/` description is **159 chars** and `/guide/worm/` is **158** — both truncate. Trim to ≤155.
- **Reconcile the player count everywhere.** `game.ts` says `serverSize: 7` (4–6 Scrappers + 1 Hunter). The homepage description says "Up to 6 players"; `llms.txt` says "Up to 6 players" in its summary line and "up to 7 per server" in its facts. Pick "4–7 players" and use it consistently — this is the qualifier the highest-value query cluster is searching with.

---

## 8. The five highest-impact fixes, ranked

**1. Restore a co-op Roblox horror list page, and repoint the dead list URLs at it instead of `/`.**
`/blog/best-roblox-horror-games-2026-what-wed-actually-play/` — the only page that ever served list intent — is 301'd to the homepage. ~13 non-branded queries (the site's largest *addressable* cluster, and the one where the AI report shows 45.45% citation share) want a list. Build one page titled for it (e.g. *"Roblox Horror Games for 5 Players — Co-op Picks"*), point the old URL there, and make STATIC the honest first entry. This converts both the organic list queries and the AI citation share into a surface the site owns. Nothing else in the data comes close.

**2. Change the trailing-slash redirect from `307` to `308`/`301`.**
Verified live on `/guide/map`, `/press`, `/faq`, `/play`. A temporary redirect does not consolidate, and the proof is in the export: `/guide/map` (7 imp, pos 5.29) and `/guide/map/` (16 imp, pos 9.81) are indexed as two URLs, `/press` and `/press/` likewise. This also clears the Coverage export's **13 failed "Page with redirect"** rows. One config change; merges ~9 impressions of split signal and removes indexed duplicates. *(Belongs to whoever owns the Cloudflare Workers static-asset routing.)*

**3. Ship the title/description rewrites for `/`, `/faq/`, `/guide/`, `/guide/map/`, `/play/`, `/screenshots/`, `/codes/`, `/guide/with-friends/`** (§7), and fix the "6 players" vs "7 players" contradiction in `site.config.ts`.
This directly targets the provable failures: `does static have 60 seconds` (position 1, 0 clicks), `map bunker roblox` (3.67, 0 clicks), `beanie studio` (3.0, 0 clicks), and `/guide/` at position 3.30 with 10 impressions and 0 clicks. It also puts the player count — the single most common qualifier in the impression data — into titles for the first time.

**4. Kill the `picfomo.com` bleed.**
27 impressions, **15.1% of all GSC impressions**, at average position 55.89 — unsatisfiable by construction. The repo's own `site/CLAUDE.md` already names the cause (a third-party address once published on the site). Audit the built HTML, JSON-LD, press kit and any PDF/asset for `picfomo.com` and the third-party address; remove every trace; then resubmit/request removal so the query drops out. Until this is gone, every site-wide CTR figure is understated by roughly a sixth.

**5. Build one definition page: "What is an asymmetrical horror game?"**
14 queries, 16 impressions, 0 clicks — and **42 citations at 24% citation share** in AI answers. The nearest existing asset sits at position 67.8. A single honest glossary page (definition, origin, how STATIC fits, links to the guide pages) wins the click *and* strengthens the AI-citation position the site already has. Pair it with an internal link pass: `/faq/` at position 82.33 and `/guide/` at 3.30 both need contextual links from the homepage and the guide hub.

**Do not spend effort on:** `static unblocked` (school-proxy traffic — unwinnable and undesirable), `static roblox studio`, `what does static mean on roblox marketplace`, `static underneath the room dollwave`, `static作者`, `roblock mod for low end android`, `worm hub`, `at worm`, `biast maps`. And **resolve the `v5 static` cluster with the owner first** — 14 impressions (20.6% of Bing) is too much to ignore and probably too irrelevant to chase.

---

## 9. Method and artifacts

Every number above was parsed from the supplied files with the bundled Python 3.12 interpreter. Encodings were sniffed by BOM (the two CSVs are UTF-8-with-BOM; the zips contain plain UTF-8 CSV), and headers were printed before any analysis.

| Artifact | What it is |
|---|---|
| `01_inspect.py` → `out_01_inspect.txt` | Raw bytes, encodings, zip entry listings, full text of the two CSVs and all zip CSVs |
| `02_analyze.py` → `out_02_analyze.txt` | Parsed keyword report, brand classification, theme grouping, full GSC page/query/device/country tables |
| `03_fetch.py` → `live_pages.json` | Live HTTPS fetch of 14 pages + robots + sitemap with browser UA; real `<title>`, `<meta description>`, canonical, robots meta, h1, h2s |
| `04_checks.py` → `out_04_checks.txt` | Sitemap endpoints, http/https and trailing-slash redirect codes, sitemap-index contents, full `llms.txt` |
| `05_final_numbers.py` → `out_05.txt` | Exact totals, position buckets, anomaly lists, and exact character counts for every proposed title/description |
| `06_legacy.py` → `out_06.txt` | Live status of every legacy GSC URL — proves which redirect where |

**Nothing under `beaniestudio-site\` was modified.** Reads only (`grep`/`read` of `keywords-game.json`, `game.ts`, `media.json`, `site.config.ts`, source page titles).

**Unparsed/absent data, stated rather than invented:** the brief's Bing page-level figures (`/faq/` 58, `/play/` 26, `/` 13, http `/` 5 + 1 click) and its 92-impression totals are in none of the five supplied files — they require the Bing *page* report, which was not provided. The `v5 static` cluster's meaning cannot be determined from the data.
