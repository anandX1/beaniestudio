# BLOG-ARCHITECTURE.md — how blogs actually pull traffic (researched, mapped to our stack)

> Question answered: *how does Google blog, what's the architecture of blogs that rank,
> and what do big game studios do?* Every claim below traces to the Sept 2026 research
> sweep or to Google's own documentation. The last section maps it all onto the machinery
> this repo already runs.

---

## 1. How Google's own blogs work (blog.google, Search Central, Android)

- **Not one blog — a fleet.** Google runs ~20 product blogs (blog.google is the hub,
  each product has its own). Architectural lesson: **separate channels per topic**,
  one central brand hub. Our translation: the site is the hub; game/devlog/indie posts
  live in one blog but carry clear **tags** (design/systems/production) — and
  tag pages are distinct crawlable hubs.
- **Every post is structured data-complete.** Google's own docs tell you what they
  want: `BlogPosting` with `datePublished` + `dateModified`, `ImageObject`, author,
  breadcrumbs. (Source: developers.google.com/search/docs/appearance/structured-data/article.)
- **They write for the query, then the brand.** Search Central posts literally target
  one query each ("what's new in Search," "product updates"). No diary posts. Every
  entry answers something someone typed.
- **Feeds are first-class.** RSS/Atom on every Google blog. We already ship RSS —
  keep it healthy; Discover-adjacent surfaces and readers still use it.

## 2. The architecture that ranks in 2026: hub-and-spoke clusters

The consensus across 2026 studies (Digital Applied, Conductor, Webtonic):

- **Pillar (hub) page** targeting the broad head term ←→ **spoke posts** targeting
  long-tail queries, all interlinked. Hub-and-spoke drives ~30% more organic traffic
  and holds rankings ~2.5× longer than standalone posts.
- **Lateral links between spokes** (post A ↔ post B in the same cluster) matter as
  much as pillar↔spoke. Orphan posts don't rank, no matter how good.
- **Topic clusters are now also the AI-citation unit**: Conductor's 2026 guide notes
  engines decide *who to cite* per topic by measuring cluster coherence, not lone pages.

**Our position:** good news — the autopilot queue already came from one keyword corpus
(296 real searches), which makes it a cluster by construction. The gap: posts link out
to `/blog/` indices but rarely to each other. Fix: each publish should add 2–3
**related-posts links** to same-cluster posts (game → game, indie → indie, technical →
technical). Cheap, mechanical, compounding.

## 3. Google Discover — the traffic tier nobody in indie uses

Discover requirements (Google's own doc + 2026 practitioner consensus):

- `max-image-preview:large` meta robots — **✓ we already ship this** (verified live).
- Featured images **≥1200px wide**, with alt text.
- Headlines that spark curiosity *without* clickbait (Google's words: avoid
  " withheld information" tricks; "why/how/what changed" framing wins).
- Timeliness: posts connected to an event or trend spike get picked up.
- E-E-A-T: real author, real experience, up-to-date pages (dateModified!).

**Honesty note:** Discover is not switchable-on. It's a *readiness* checklist — when
Google's systems decide the site is interesting to a user's feed, these are the
gates. We've now cleared every gate we control.

**Discover-bait posts we're uniquely positioned to write:** "We analyzed 296 real
Roblox horror searches" (data = curiosity), update announcements, dev-story posts
("why we removed the radar"). Not listicles.

## 4. What big game studios do (Valve/Next Fest ecosystem, Zukowski doctrine)

- **Devlogs are reputation, not traffic.** Chris Zukowski's research line: people don't
  wishlist from a blog post; they wishlist because *the game looks good* — the blog's
  job is to make the studio look alive and interesting over years. Consistency > virality.
- **The store page is the SEO target, not the blog.** For us, the "store page" is the
  Roblox game page + beaniestudio.site home. Blog posts exist to (a) capture search
  demand and (b) funnel authority to those two pages. Every post must link the game.
- **Discord is retention; blog is acquisition.** Studios feed the blog → Discord funnel
  with "the full story is on the devlog" hooks. Our autopilot already broadcasts posts
  to Discord/Bluesky — that's the exact loop studios run manually.
- **Events > cadence for spikes.** Next Fest, Screenshot Saturdays, seasonal updates.
  We have the equivalent: update days, the 10-day sprint milestones, admin-abuse-style
  community events (per the +1 Keyboard Escape playbook).
- **Blogs die when cadence stops.** The graveyard pattern: 6 posts in month 1, silence
  after. Our 1/day autopilot + 32-post runway is precisely the anti-pattern to that.

## 5. The 2026 ranking mechanics (what "the SEO engine" of a blog is now)

1. **Indexing gate:** helpfulness + word count + crawlability. Sub-400-word posts get
   shelved as "Crawled – currently not indexed." (Our thin-content guard enforces ≥400;
   the editorial bar is ~900.)
2. **Freshness signals:** `dateModified` honesty. Google compares schema dates against
   content; fake freshness is detectable, real edits are rewarded.
3. **Cluster coherence:** internal links decide whether the *site* ranks or single
   lucky posts do.
4. **Entity strength:** sameAs → Wikidata, consistent naming, About pages.
5. **AI-engine citability:** direct-answer paragraphs, quotable stats, dated sources.
   (The GEO study: content with original data gets cited disproportionately.)

## 6. What we changed today (mapped onto the machine)

- **`updatedDate` freshness pipeline** (the audit's one real gap): Studio edits and
  autopilot republishes now preserve the original `pubDate` and stamp `updatedDate`,
  which flows through `content.config.ts` into the BlogPosting JSON-LD as
  `dateModified`. Editing a post is now a *ranking action*, not just cosmetics.
- Already-shipped pieces confirmed live: `max-image-preview:large`, BlogPosting +
  ImageObject + BreadcrumbList schema, RSS, IndexNow ping on publish, 1/day cadence,
  thin-content guard, future-link guard.

## 7. Backlog (ranked, from this research)

1. **Related-posts links on every publish** (cluster coherence — biggest open win).
   Mechanical: same-tag posts, pick 2–3, append "Related" section with links.
2. **Tag hub pages** (design/systems/production) with intro text — turn tags into
   crawlable mini-hubs.
3. **Discover-bait formats** in the queue: data posts, "why we changed X" dev stories.
4. **Author box** (real name, one-line bio) — E-E-A-T signal Google's article doc
   explicitly lists.
5. **dateModified display on posts** ("Updated Sep 22, 2026") — users AND engines.
