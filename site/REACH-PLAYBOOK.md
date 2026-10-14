# Reach playbook — free traffic and links, from Roblox's own rules

Researched 2026-10-14. Primary source first: Roblox's official Discovery documentation
(`Roblox/creator-docs`, content/en-us/discovery.md) — quoted directly below, because it
contradicts several common assumptions about promoting a Roblox game.

**Read this before spending an hour on backlinks.** The single most important sentence
in Roblox's own docs:

> "Roblox doesn't count the engagement, monetization, or retention of users first
> acquired from ads, curation, friends, search, social media, or any other source in the
> ranking stage of Recommended for You."

And:

> "Each signal is based on users who **organically** joined from the Recommended for You
> sort on Home."

### What that means for us

| Belief | Reality |
|---|---|
| "Drive traffic to the game and Roblox will promote us" | External traffic does **not** count toward ranking signals. It only "accelerates your consideration" in the **retrieval** stage — a foot in the door, nothing more. |
| "We need lots of players to rank" | "Signals are calculated as **averages per user**, not total values... smaller games with highly engaged users are not disadvantaged." A 20-player game with good retention can out-rank a 2,000-player game with bad retention. |
| "The website drives growth" | The website drives **consideration + brand search + qualified players**. Growth is decided in-game, by players Roblox itself sent us. |

So the website's job is not to be the growth engine. It is to (a) get STATIC into the
retrieval mix, (b) win brand searches, and (c) send people who will actually stay —
because the first-play bounce rate is a **negative** ranking signal.

### The actual ranking signals (official, in priority order)

**Most important**
1. **Play through rate** — how often someone plays after seeing us in Recommended For You
2. **First play bounce rate** — *negative signal*. Bucketed at <60s and 61–180s. A player
   who quits in under a minute hurts more than a player who never arrived.
3. **Play days per user** — unique days played, measured D1 / D2–7 / D8–28
4. **Playtime per user** — capped at 60 min per user per game per day

**Important**
5. Intentional co-play days per user (joining with friends, invites, private servers)
6. Qualified play sessions per user
7. Spend days per user, 8. Robux spent per user

**Exposure limiters (things that suppress us outright)**

- **Leading with giveaways or money.** Roblox's own example: a game titled "Robux! Play
  now!" receives less exposure. → Our `/codes/` page and any free-Robux framing is a risk
  if it leaks into game metadata or thumbnails. Keep that language on the website only.
- **Mismatched metadata vs content** — thumbnails must match the first session.
- **Non-unique games** — metadata/place files resembling existing games are not
  prioritised. "STATIC" as a bare name is also weak here; the long form is the ownable one.

**Action:** Creator Dashboard shows a banner when exposure is reduced. Check it weekly.

### Surfaces we are not using yet

| Surface | Why it matters | Who acts |
|---|---|---|
| **Standout Games** | Hand-curated by Roblox for "novel games... unique and in-depth gameplay mechanics, distinctive visual styles, or an underrepresented genre." STATIC's scrap-hauling loop is genuinely novel. | Owner applies |
| **Experience Events** | Up to 5 thumbnails + opt-in notifications. Directly drives *play days per user* and *intentional co-play* — two ranked signals. | Owner |
| **Thumbnail personalization** | Roblox shifts impressions hourly toward the thumbnail with better play-through rate. Need 3–5 real gameplay thumbnails. | Owner |
| **Roblox Groups** | Officially named as "the best way for creators to connect with and inform their communities." | Owner |
| **Search** | Now semantic — natural-language queries work. Accurate, unique metadata is the lever. | Owner |
| **Notifications** | Resurrects lapsed users; drives play days per user. | Owner |

---

## What the website can still do (and why it is worth doing)

Retrieval-stage acceleration is real: Roblox names "search, charts, friends, teleport,
notifications, social media sharing" as things that accelerate consideration. So links
and referral traffic are not worthless — they widen the pool of people Roblox considers
showing us to. They just don't score.

1. **Backlinks → consideration + brand search, not ranking points.** Treat them as
   distribution, not as a ranking lever.
2. **Pre-qualify the visitor.** Because a <60s bounce is a negative signal, the site
   should tell people what STATIC is *accurately*, so the ones who click Play stay. The
   clarity-first copy rule already does this — do not let marketing copy oversell it.
3. **Image search is our unfair advantage.** 80 original screenshots, now with licence
   metadata. Nobody else has these.
4. **Answer engines.** `llms.txt` plus VideoGame/Organization/FAQ schema makes us the
   citable source when someone asks an AI "what is STATIC".

---

## Free link sources, ranked by value per minute

Automated link schemes (bot directories, bought links, forum spam) are what Google's link
spam policy penalises — for a new domain the risk is site-wide suppression, not just "no
benefit". There is no safe automated option. Ranked list of what actually works:

| # | Source | Link type | Effort | Who |
|---|---|---|---|---|
| 1 | **Roblox game description + group page** | Referral, high intent | 10 min | Owner |
| 2 | **YouTube descriptions + channel links** (7 videos = 7 links) | Real, indexed | 20 min | Owner |
| 3 | **Fandom / Roblox wiki page for STATIC** | Roblox wikis rank extremely well and get scraped endlessly | 1 hr | Owner posts, I write it |
| 4 | **Reddit** r/robloxgamedev, r/roblox, r/IndieDev | Nofollow but drives clicks + brand search | 30 min | Owner posts, I write it |
| 5 | **Discord** dev/horror servers + our own | Direct, first-100-players | 20 min | Owner |
| 6 | **IndieDB + itch.io devlog mirror** | Long-lived editorial listings | 40 min | Either |
| 7 | **Roblox guide/code sites** (outreach by email) | Editorial, contextual | 30 min | I draft, owner sends |
| 8 | **Wikidata** (2 items already exist) | Entity anchor for AI + knowledge graph | 30 min | Owner (needs account) |
| 9 | **Creator/YouTuber outreach** | One honest video > 1,000 directory links | 1 hr | I draft, owner sends |
| 10 | **Open-source one of our tools** | Devs link useful repos constantly | 2 hr | Either |

---

## Paste-ready outreach

### A. Roblox guide / code sites (email)

> **Subject:** STATIC (Roblox) — official codes page and fact sheet for your coverage
>
> Hi [name],
>
> I'm Anand from Beanie Studios. We make STATIC: Salvage vs Hunter, a free co-op
> asymmetrical horror game on Roblox — 4–6 Scrappers haul 400 kg of scrap to three
> crushers while one player hunts them as Jingles.
>
> Two things that might save you time:
> - Our official codes page is the source of truth and updates the moment a code goes
>   live: https://beaniestudio.site/codes/
> - A full press kit with a fact sheet and free-to-use art: https://beaniestudio.site/press/
>
> If you cover it, point your readers at the official pages so they don't land on expired
> codes. Happy to answer anything or send early info on updates.
>
> Anand Kumar — Lead developer, Beanie Studios
> anand@beaniestudio.site

### B. Fandom wiki (talk page / new article request)

> **STATIC (Roblox) — article request**
>
> STATIC: Salvage vs Hunter is a free co-op asymmetrical horror game by Beanie Studios,
> public beta since 10 October 2026. 4–6 Scrappers search a bunker for scrap and haul
> 400 kg to three crushers (120/130/150 kg) while one player, Jingles, hunts them.
>
> All numbers below are from the developer and verifiable at beaniestudio.site:
> - Scrap: https://beaniestudio.site/guide/scrap/
> - Jingles' abilities: https://beaniestudio.site/guide/jingles/
> - The map: https://beaniestudio.site/guide/map/
> - Official numbers file for AI/editors: https://beaniestudio.site/llms.txt
>
> Screenshots on the site are free to use for coverage. I'm the lead developer and can
> verify anything or supply higher-resolution assets.

### C. Reddit (r/robloxgamedev) — read the sub rules first, they vary

> **Title:** We removed our audio-stealth mechanic after playtests — here's what we
> replaced it with [devlog]
>
> We've been building STATIC for [X] months: 4–6 players haul 400 kg of scrap to three
> crushers while one player hunts them.
>
> The honest part: we built a whole sound-based stealth system, playtested it, and deleted
> it. [2–3 specific sentences on why — real numbers, what players did.]
>
> What we learned: [one concrete, transferable lesson other devs can use.]
>
> Devlog with the numbers: [link] · Playable: [Roblox link]
>
> Happy to answer anything about the systems or the cuts.

**Rule for Reddit: lead with something useful to other devs, never with the game.** A
"play my game" post gets removed and earns nothing.

### D. Wikidata (the two items already exist)

On `Q141512786` (the game), add/verify: `instance of` video game · `developer` →
Beanie Studios (`Q141511863`) · `publisher` → same · `platform` → Roblox · `genre` →
survival horror, asymmetrical multiplayer · `publication date` → 2026-10-10 · `official
website` → https://beaniestudio.site · `price` → free. On the studio item: `official
website`, `founded` → 2026-07, `country` → India, and link the two items to each other.

---

## 30-day order of operations

**Week 1 — the links you fully control (2 hours total, biggest return)**
1. Roblox game description: current, accurate, links beaniestudio.site
2. All 7 YouTube video descriptions + channel links section → site
3. Discord: site link in server description + pinned
4. GitHub org/profile → site (developer links help)
5. Correct any stale claims in our own strategy docs (done — see below)

**Week 2 — wiki + reddit (owner posts, drafts above)**
6. Request the Fandom article; offer to supply verified data
7. One genuinely useful r/robloxgamedev devlog post
8. Submit to IndieDB

**Week 3 — outreach (owner sends, drafts above)**
9. 5 Roblox guide/code sites
10. 10 mid-size Roblox YouTubers, offering early access

**Week 4 — Roblox-side signals (this is where growth actually comes from)**
11. Apply for Standout Games
12. Create an Experience Event with 5 thumbnails
13. Upload 3–5 gameplay thumbnails for personalization
14. Check the Creator Dashboard banner for exposure limits
15. Read Home Recommendations analytics weekly

---

## Corrections to this repo's own claims (fixed 2026-10-14)

`BACKLINKS.md` previously stated that CI enforces "Lighthouse performance ≥85" as a hard
gate and that the channel has 21 videos. Both were wrong: Lighthouse was never
installed as a dependency so the local runner crashed and the claim was never measured,
and the channel has 7 uploads (all Shorts, 6–18s). Measured performance is 72 simulated /
51 real-throttled, so the per-formance gate is **not** met today. The gate is in `warn`
mode and does not fail the build. Treat performance as an open item, not a solved one.
