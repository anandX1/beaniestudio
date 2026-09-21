# REDDIT-DOCTRINE.md — Step 3: Reddit as an organic-traffic channel

> Why Reddit is on the ladder at all: Perplexity draws roughly **1 in 5 of its citations
> from Reddit**, Google surfaces Reddit threads for "best/for friends/with vc" style
> queries, and Reddit threads now outrank most blogs for game-recommendation searches.
> Being genuinely present in the right threads is discovery infrastructure, not marketing.
>
> Pair with: `VIRAL-GEO-PLAYBOOK.md` (the ladder), `BLOG-100.md` (content map),
> Analytics tab (UTM-tracked referrers — Reddit shows up there per-answer).

---

## 0. The three laws (break one = banned or ignored)

1. **90/10.** Ninety percent of your Reddit activity helps others with zero link to us.
   Ten percent (max) may involve STATIC. This is the official guideline across subs.
2. **Disclose every time.** "Dev here — I built STATIC" in any comment that touches our
   game. Disclosed devs get respect; hidden shills get banned and screenshotted.
3. **One account, one identity.** u/BeanieStudioAnand (or your personal). No second
   accounts, no vote manipulation, no copy-pasting the same paragraph into many threads
   (Reddit's spam filter fingerprints duplicates).

**Account warm-up (before ANY link):** 2 weeks of plain helpful answers in Roblox subs,
~30 karma. No links in your first 10 comments even when relevant.

---

## 1. The subreddit map (verified roles)

| Sub | Audience | What's allowed for us |
|---|---|---|
| **r/RobloxHelp** | Players asking questions | **The goldmine.** Answer "scary roblox games?", "roblox horror with friends" threads. Helpful list first; disclosure line last; link only when STATIC genuinely fits the ask. |
| **r/roblox** | Players, huge, strict | Self-promo posts are removed. Comment-thread presence only — be a known helpful regular, occasionally mention the game when someone asks for recommendations. |
| **r/robloxgamedev** | Devs | Feedback Fridays / showcase posts WITH substance (dev-log details, numbers, lessons). Best for creator recruitment + networking, not players. |
| **r/gamedev** | Industry | Progress posts in designated threads; **data posts fit as real posts** — our 296-searches study is a legitimate r/gamedev contribution. |
| **r/IndieDev**, **r/IndieGaming** | Indie devs + enthusiasts | Clip/progress posts with honesty (what worked, what didn't). One per milestone, not weekly spam. |
| **r/HorrorGaming** | Horror fans (non-Roblox mostly) | Only when we have broad horror content (e.g. "what makes sound-based hunting scary") — link sparingly. |

## 2. The thread radar (10 min/day)

Run these searches (sorted: New) every day or two — reply to anything from the last 48h:

```
site:reddit.com "scary roblox games"            ← also: "to play with friends", "2 player"
site:reddit.com "roblox horror games" 2026
site:reddit.com "asymmetrical horror" roblox
site:reddit.com roblox "hide and seek" horror
site:reddit.com "voice chat" roblox horror
```

Efficient way: save each as a bookmark. On mobile, Google the query + tap the Reddit
result. If a thread asks exactly for what STATIC is → reply using template T1/T2 below.

## 3. Reply templates (adapt every one — never paste verbatim)

**T1 — The recommendation list (player threads):**
> [Name 2–3 well-known games that genuinely fit, one line each on why.]
> If you want something built around that idea: I'm making STATIC — a 5v1 where
> the Hunter tracks you by sound alone (no radar for anyone). Free, crossplay,
> playtests open: beaniestudio.site. Disclosure: I'm the dev, so take my plug
> with a grain of salt.

Rules: their question answered FIRST, our game last, max one link, always the
disclosure line. If STATIC doesn't fit the ask, don't mention it.

**T2 — The dev insight (design/mechanic threads):**
> Dev of a sound-horror game here. The counterintuitive lesson from playtests:
> [one specific, true, useful insight — e.g. "players forgive being caught, they
> don't forgive unfair detection; we cut radar from BOTH sides and chases got
> fairer overnight"]. Happy to answer questions about the approach.

Link only if someone asks or it's natural; the profile carries the URL.

**T3 — Showcase/progress post (r/robloxgamedev, r/IndieDev, per milestone):**
Title: what changed + a number. Body: 3–5 bullets of real dev substance, one clip
or screenshot, end with a genuine question ("balancing hunter speed vs scrapper
noise — how would you tune it?"). This earns feedback AND followers.

**T4 — The data post (r/gamedev, when the study post is live):**
"We analyzed 296 real Google searches about Roblox horror — what players actually
type." Body: the 5 findings, method, honest limitations, link to full post.
Data posts are the single most upvoted format on r/gamedev — and journalists/AI
engines cite them.

## 4. Daily 10-minute routine

1. (3 min) Run the thread radar — reply to 1–2 fresh threads (T1/T2).
2. (3 min) Answer one general Roblox question with zero self-interest (the 90%).
3. (2 min) Check replies to your previous comments — fast replies double the karma.
4. (2 min) Log it: date, subreddit, thread link, template used — in
   `content/reddit-log.md` so the Analytics tab's Reddit referrers can be matched
   to specific comments.

## 5. What NOT to do (each has killed indie campaigns)

- ❌ DMing people who asked for game recs (fastest way to a ban + witch-hunt thread)
- ❌ Posting the same text in multiple subs (duplicate fingerprint → site-wide spam filter)
- ❌ Asking friends to upvote (Reddit detects vote rings; can nuke the whole account)
- ❌ Link-dropping before the 2-week warm-up (first impression = spammer = shadowban)
- ❌ Arguing with hostile commenters — one gracious reply, then leave it
- ❌ Posting our links in r/roblox posts (that sub removes them; earn mentions instead)

## 6. Measurement (tie to Analytics tab)

Every link we control carries UTM: `?utm_source=reddit&utm_medium=social&utm_campaign=<thread-topic>`.
Weekly in Studio → Analytics → Referrers: reddit.com clicks, which landing page, which
U campaign → match against `content/reddit-log.md`. Double down on the comment styles
that produce visits; retire the ones that don't. Honest expectation: 10–50 clicks per
good answer, compounding as threads rank in Google — the payoff is the citations and
the long tail, not one viral spike.
