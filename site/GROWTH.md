# GROWTH.md — The Organic Audience Engine

> Chief-marketing-officer runbook for STATIC: Salvage vs Hunter. Objective: arrive at
> launch day (Q4 2026) with an audience that already exists — so the first wave of
> players comes from follows and notifications, not from ad spend. Everything
> automatable is automated inside this repo; everything that needs a human is marked
> **[YOU]**, ranked by leverage.

---

## 1. The funnel, honestly

```
Stranger sees a clip / search result / Discord invite / friend's share
  → lands on beaniestudio.site (fast, clear, Lighthouse-clean)
  → picks a frequency (Discord / YouTube / Roblox follow)   ← CAPTURE
  → gets pulled into every devlog by the auto-broadcaster    ← RETENTION
  → shares the site via the recruit button                   ← REFERRAL
  → launch day: the follow list IS the player count          ← CONVERSION
```

Each arrow now has machinery behind it:

| Arrow | Machinery | Status |
|---|---|---|
| Discover → site | SEO (100/100), sitemap, IndexNow ping on every push, llms.txt for AI answer engines | ✅ live |
| Site → capture | Follow section on home (Discord/YouTube/Roblox + Web Share recruit button) | ✅ live |
| New content → audience | `social-post.mjs` in CI: every pushed devlog auto-posts to Discord + Bluesky with UTM links | ⚙️ needs secrets |
| Is it working? | Cloudflare Web Analytics beacon (cookie-free) + UTM attribution on every share link | ⚙️ needs token |
| Me → press/creators | BACKLINKS.md + PROMO-COPY.md runbooks | ✅ live |

---

## 2. The bottleneck map (be honest about these)

1. **The Discord is the #1 asset and the #1 risk.** Capture beats clicks only if the
   server is alive when people arrive. An empty Discord converts nobody. Before
   pointing traffic at it: welcome channel with the pitch in one screenshot, a
   #devlog feed (the webhook posts here automatically once wired), and one human
   (you) answering within a day.
2. **One video per week is the real growth engine.** The research is unambiguous:
   short-form clips of the *core hook* (sprint = death; "don't trust your friend")
   are the highest-leverage channel for Roblox horror, and the algorithm rewards
   consistency over brilliance. 3 clips/week from one recording session beats
   1 perfect video. This is the only thing that cannot be automated — it's the
   game itself being interesting.
3. **Search compounds; social spikes.** The site wins "roblox horror game no radar",
   "asymmetrical horror roblox", "static salvage vs hunter" queries over time.
   Every devlog post adds another long-tail hook. Keep publishing — the CI pipeline
   does the indexing half automatically.
4. **Backlinks are earned, never bot-spammed.** Google's spam policies specifically
   target scaled automated link schemes — and a new domain is the easiest target to
   suppress. The automation does the *auditing and indexing*; you do the 8 hand
   submissions in BACKLINKS.md (an hour total, once).
5. **No measurement = no marketing.** Until the analytics token is set, every growth
   decision is a guess. This is a 10-minute fix, listed first in the [YOU] tier.

---

## 3. Automated in this repo (zero ongoing effort)

- **Broadcast**: push a devlog → Discord + Bluesky posts go out with UTM-tagged
  links; state is cached in CI so nothing double-posts. Setup: §4 below.
- **Indexing**: every push pings IndexNow (Bing/Yandex/Seznam crawl within minutes).
- **Quality floor**: Lighthouse gates + link checks + production SEO audit run on
  every push and daily — a slow or broken page can't silently bleed traffic.
- **Attribution**: every share/link carries `utm_source`, so analytics tells you
  which channel actually recruits.

## 4. [YOU] — 10-minute setups that unlock the automation

1. **Analytics (do this first):** Cloudflare dashboard → your domain →
   *Analytics & Logs → Web Analytics → copy the JS snippet token* → add repo secret
   `CF_BEACON_TOKEN` (or set `PUBLIC_CF_BEACON_TOKEN` at build) → next deploy has
   private, cookie-free measurement. Full steps: DEPLOY.md.
2. **Discord webhook (5 min):** Discord server settings → Integrations →
   Webhooks → new webhook for #devlog (or #announcements) → copy URL → add repo
   secret `DISCORD_WEBHOOK_URL`. Every pushed devlog now announces itself.
3. **Bluesky (optional, 5 min):** create `@beaniestudio` on bsky.app →
   Settings → App passwords → generate → secrets `BLUESKY_IDENTIFIER` +
   `BLUESKY_APP_PASSWORD`. (X/Instagram have no free posting API — post there
   manually with PROMO-COPY.md; takes 2 min per devlog.)

## 5. [YOU] — the weekly rhythm (total ≈ 3h/week)

| Cadence | Action | Why |
|---|---|---|
| Per devlog (30 min) | Record the devlog as gameplay first; write the post from what you did | One session feeds both YouTube and the site |
| Per devlog (10 min) | Post the clip + link to X/IG manually with PROMO-COPY.md snippets | Platforms without free APIs |
| Weekly (60 min) | Cut 2–3 vertical clips (15–45s) from playtests: a sprint-death, a locker escape, a hunter listen moment. Hook in the first line of on-screen text | The single highest-leverage channel for Roblox horror |
| Weekly (30 min) | Reply to every comment/DM; note recurring questions → they become FAQ entries | FAQ doubles as SEO + reduces support load |
| Monthly (60 min) | One "numbers" devlog (e.g. "we rebuilt the footstep system 4 times") | Transparency posts earn links and trust |

## 6. The 12-week runway to Q4 2026

- **Weeks 1–2 — Foundation:** set secrets (§4), submit the 8 listings in
  BACKLINKS.md, pin the best clip in Discord.
- **Weeks 3–6 — Cadence:** 3 clips/week + 1 devlog/week; first community playtest
  night in Discord (they become your first streamers).
- **Weeks 7–10 — Creators:** email 10 micro-streamers (2k–20k followers) with the
  PROMO-COPY.md pitch; offer first-access keys. Horror = reaction content = free
  reach; one mid-size "he's listening under the floor" clip outperforms ads.
- **Weeks 11–12 — Pre-launch:** countdown assets, "be there when the lights go out"
  push to every captured channel; the Roblox follow count is your day-one population.

## 7. Metrics that matter (check monthly, not daily)

- Discord joins per week (the launch currency)
- Roblox community follows (the day-one player count)
- YouTube: average % viewed on shorts (hook strength), subs
- Site: organic clicks in Search Console (after you verify it — see DEPLOY.md),
  top UTM sources in Cloudflare Analytics
- One vanity metric is allowed: total follows across channels, because momentum is real

## 8. The one rule

**Never automate posting to communities (subreddits, Discords you don't own),
never buy links, never mass-DM.** Roblox communities and Reddit ban self-promo
bots hard, and Google's spam systems are built to catch exactly that pattern.
The engine here automates *your own channels and indexing* — the human touches
(the 8 listings, creator emails, community replies) are the parts that build
actual reputation.
