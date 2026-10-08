# STATIC — SEO & reach playbook (researched 2026-10-08)

Primary sources first; anything from third-party blogs is marked *(unverified)*.
Re-check the official pages before acting on a detail — these systems change.

---

## 0. Where we stand (honest)

**On-site: done to a high standard.** Lighthouse 99–100 on every category, unique
titles/descriptions, canonical URLs, VideoGame/Organization/Article/ImageGallery/FAQ/
Breadcrumb JSON-LD, sitemap + image sitemap, IndexNow on every deploy, 80 original
screenshots with descriptive alt text, fast WebP pipeline, no thin AI content.

**What's left is not on the site.** A 2-day-old domain with zero backlinks ranks for
almost nothing no matter how good the HTML is. The levers that remain:
1. Time (new-host suppression), 2. links from real sites, 3. people clicking and
staying (click signals), 4. Roblox's own discovery (retention + co-play).

---

## 1. How Google actually treats a new site like ours

From the 2024 Google Content Warehouse API leak (verified by ex-Googlers, analysed by
Rand Fishkin / SparkToro and Mike King / iPullRank; Google said the docs may be
"out-of-context, outdated, or incomplete"):

| Attribute in the leak | What it implies for us |
|---|---|
| `hostAge` — notes say it's used "to sandbox fresh spam in serving time" | New domains are suppressed at first. Expect weeks–months before non-brand queries rank. Not a penalty; it lifts as trust builds. *(duration unverified; "~6 months" is anecdotal)* |
| `siteAuthority` | Google keeps a site-level authority score. It rises with links from trusted sites and real usage. |
| NavBoost (click re-ranking, 13-month window: good clicks, bad clicks, last-longest clicks) — corroborated by US v. Google testimony | Searchers who click us and **don't bounce back** improve rankings. Titles must match intent; pages must answer fast. |
| Chrome data | Real visits (from Discord, YouTube, Roblox) are visible to Google. Driving real traffic helps search, not just the other way round. |

**Practical rules that follow:**
- Brand queries first: "static roblox", "static jingles", "static roblox map/codes".
  These are winnable now because we're the official source.
- Every page must satisfy the click: answer in the first screen (we do: plain-language first line rule in CLAUDE.md).
- Never publish thin/scaled pages (Google's scaled-content-abuse policy; the old autopilot is paused for this reason).

## 2. Bing / DuckDuckGo / ChatGPT search

Bing powers DuckDuckGo, Yahoo, Ecosia and ChatGPT's web search, so it matters.

- **"Discovered but not crawled"** = Bing knows the URL but hasn't prioritised fetching it.
  Bing's own help lists: new site not yet assessed, fetch problems, and **few or no
  external links**. Ours is the first and third. It's a priority issue, not a block.
- Do: Live URL test in Bing Webmaster (must pass), "Request indexing" on the 10 key
  URLs, keep IndexNow pinging (CI does it on every push — key file
  `c2769c2629e7b24f6076ecdc17b61001.txt` at the root), and get real inbound links.
- IndexNow tells Bing/Yandex/Seznam/Naver a URL changed. It speeds re-crawling; it does
  **not** force indexing. Google does not use IndexNow.
- Typical wait for a new domain: weeks *(unverified, forum reports range widely)*.

## 3. Google Images (our unfair advantage)

Original screenshots of an official game are content nobody else has.
- Page context outranks image metadata: title, H1, headings and text around the image matter most. Our map/guide pages put each shot under the room's heading. Keep it that way.
- Alt text = accurate description, not keyword lists (we follow this in `media.json`).
- Image sitemap: `/sitemap-images.xml`, also listed inside `/sitemap-index.xml`.
- Stable image URLs: never rename `/media/*` files once indexed.

## 4. Video (needs the media wishlist)

Google Search Central "Video SEO best practices":
- Google indexes a video when it can **see the embed in the page HTML** (`<video>`,
  `<iframe>`, `<embed>`), ideally on a **watch page** where the video is the main content.
- Our YouTube cards are click-to-load facades (good for speed) → Google can't treat
  them as page videos. **Fix when videos arrive:** dedicated watch pages
  (`/videos/<slug>/`) with the iframe in the HTML, `VideoObject` JSON-LD, a stable
  thumbnail URL, and `SeekToAction`/`Clip` markup for key moments.
- Short self-hosted loops (MP4/WebM, ≤3 MB) for the site itself: served as `<video
  muted loop playsinline>` with a poster image. Workers assets limit is 25 MiB per file.

## 5. Roblox discovery (where most players will come from)

Official Roblox sources (DevForum announcements + Creator Docs "Discovery"):
- Recommended For You = **retrieval** (candidates by engagement, retention,
  monetization) → **ranking** (personalised).
- Signals named officially: **qualified play-through rate (qPTR)**, **7-day qualified
  play sessions per user**, **deep play-through rate**, and **intentional co-play**
  (players joining with friends via invites, sessions, private servers).
- Players acquired from ads, search, social etc. are **not counted in the ranking
  stage** — outside traffic seeds you; retention decides whether Roblox keeps
  recommending you.
- **Thumbnail personalization**: upload several thumbnails; Roblox shifts impressions
  hourly to the ones with higher qPTR per player group (+8.5% qPTR on average per
  Roblox). Thumbnails must match the first session, or bounces hurt qPTR.
- Check **Creator Analytics → Home Recommendations** weekly.
- A 7→28-day window change in June 2026 is reported by third parties *(unverified
  against Roblox's own posts)*.

**Game-side actions (bigger than any website work):**
1. First 5 minutes: get players into a chase fast. Bounce kills qPTR.
2. Co-play: friend invites, party join, private servers → official co-play signal.
3. Day-2/day-7 reasons to return: daily reward, codes, weekly update.
4. 3–5 thumbnails in personalization from real gameplay moments.

## 6. Links (the slowest, most valuable lever)

Earn, never buy. In order of value per hour:
1. Roblox code sites (they write "STATIC codes" pages and link the game/site) — needs
   live codes. See LAUNCH-PACK §7.
2. YouTube descriptions (every video → guide link), creator videos (outreach template).
3. Fandom wiki for STATIC linking the official guide pages.
4. r/robloxgamedev devlog posts with real stories + screenshots.
5. Wikidata items (already exist) → update label + official website.
6. Press kit at `/press/` for journalists; codes/update news gives them a reason.

## 7. Tools (free, legit)

| Tool | Use |
|---|---|
| Google Search Console | Indexing, queries, CTR. Check Performance weekly. |
| Bing Webmaster Tools | Same for Bing; URL submission; IndexNow log. |
| Lighthouse / PageSpeed Insights | Speed + SEO basics (`node scripts/lh-run.mjs`, CI runs it). |
| Rich Results Test / Schema validator | Validate JSON-LD after page changes. |
| Roblox Creator Analytics | qPTR, retention, Home Recommendations — the real growth dashboard. |
| Cloudflare Web Analytics | Cookie-free traffic numbers (set `PUBLIC_CF_BEACON_TOKEN`). |

**Traps to ignore:** paid "SEO packages", PBNs/backlink bundles, "AI-detector-proof"
content farms, keyword-density tools, "domain authority" as a goal (it's a third-party
estimate, not Google's), mass directory submissions, auto-generated pages per keyword.

## Sources
- Google Search Central — Video SEO best practices: https://developers.google.com/search/docs/appearance/video
- 2024 Google Search documentation leak (overview): https://en.wikipedia.org/wiki/2024_Google_Search_documentation_leak
- Hobo Web leak analysis: https://www.hobo-web.co.uk/the-google-content-warehouse-leak-2024/
- Roblox Creator Docs — Discovery: https://create.roblox.com/docs/discovery
- Roblox DevForum — Improved Recommended For You + analytics: https://devforum.roblox.com/t/boost-your-discovery-with-the-improved-recommended-for-you-algorithm-and-analytics-for-creators/3587441
- Roblox DevForum — Testing more RFY signals: https://devforum.roblox.com/t/testing-more-recommended-for-you-algorithm-signals/4568033
- Roblox DevForum — Thumbnail personalization: https://devforum.roblox.com/t/thumbnail-personalization-now-remembers-your-existing-winning-thumbnails/3793665
- Microsoft Q&A — "Discovered but not crawled": https://learn.microsoft.com/en-us/answers/questions/5920490/bing-webmaster-tools-showing-discovered-but-not-cr
- IndexNow documentation: https://www.indexnow.org/documentation
