# STATIC launch pack (beta, 10 Oct 2026)

Everything here uses only confirmed facts (`src/data/game.ts`) and real screenshots
(`/screenshots/`). Copy, tweak in your own voice, post. **Never paste the same text on
two platforms**: rewrite the first line at least. Identical cross-posts get suppressed.

---

## 1. Launch-day checklist (in order)

1. [ ] Cloudflare → Email Routing: create `hello@`, `press@`, `anand@`, `pawan@`, `jai@` → forward to your Gmails. Send a test email to each.
2. [ ] Cloudflare → SSL/TLS → Edge Certificates → **Always Use HTTPS** = on.
3. [ ] Merge the site PR → wait for the deploy → open beaniestudio.site on your phone and click Play.
4. [ ] Search Console: Sitemaps → submit `sitemap-index.xml` **and** `sitemap-images.xml`. URL Inspection → Request indexing for `/`, `/guide/`, `/guide/map/`, `/guide/jingles/`, `/screenshots/`.
5. [ ] Bing Webmaster Tools → "Import from Google Search Console" (2 minutes, also covers DuckDuckGo/Yahoo).
6. [ ] Roblox game page: update the description (section 2), set the thumbnails (section 2), and link the Roblox group.
7. [ ] Wikidata: rename the studio item to **Beanie Studios**, and add "official website" = https://beaniestudio.site to both the studio and game items.
8. [ ] Post the Discord announcement (section 3) → then YouTube/TikTok Short #1 (section 5).
9. [ ] Disable the old blog autopilot scheduled task in Windows Task Scheduler (it's paused in the repo, but stop the task too).

---

## 2. Roblox game page

**Description** (Roblox shows ~1,000 characters; keep it plain and true; misleading
descriptions get moderated):

```
STATIC [BETA]: co-op horror where one of you is the Hunter.

Up to 6 Scrappers search an abandoned bunker for scrap and feed 400 kg of it into 3 crushers. Clear each crusher's console minigames, then reach the Intake Chute before it closes.

One player is JINGLES, a clockwork jester. Jingles is a little faster than you, can Dash, and every 50–80 seconds its Bloodlust reveals everyone.

• 14 scrap items, from a 3 kg access card to a 140 kg reactor core
• 13 console minigames: two players can share a console
• Get caught → Bio-Siphon Pod. Teammates have 90 seconds to break you out
• Never ring the bell. Something under the floor hears it

PC + mobile · Voice chat · Beta: report bugs in our Discord (Roblox group → Socials)

Guide, map & codes: beaniestudio.site
```

**Thumbnails** (Roblox shows these big on the game page and in Discover). Order:
1. Jingles key art + STATIC logo (`press/static-key-art.png`)
2. `static-cargo-dock-shuttle.jpg` (largest room, most "game-looking")
3. `static-jingles-medbay.jpg` (the monster in the level)
4. `static-crusher-console.jpg` (shows the objective)
5. `static-result-escaped.jpg` (shows progression)

Swap in gameplay video thumbnails once the trailer exists.

---

## 3. Discord launch announcement

```
@everyone STATIC IS OUT. 🔦

The public beta is live on Roblox, free on PC and mobile:
https://www.roblox.com/games/80261274887781/STATIC

What's in it: one bunker map, Jingles, the Worm, 3 crushers, 13 minigames, Bio-Siphon Pods.
New to it? 3-minute guide → https://beaniestudio.site/guide/

It's a beta: post every bug in #bug-reports, and vote in #suggestions on what we build next (new modes, second Hunter, second map).

See you in the bunker. Leave the bell alone.
```

---

## 4. Reddit (read each sub's rules first, post as yourself, reply to every comment)

**r/robloxgamedev** (devs share their work there; lead with the dev story, not an ad):

> Title: We swapped "fix 5 generators" for hauling 400 kg of scrap. Our 3-person asym horror game just hit beta.
>
> Body: 3 of us (scripter, map builder, content/audio) have been building STATIC since July. Most asym horror we played had the same survivor loop, so we made the survivors' side its own game: 14 scrap items with weights from 3 kg to 140 kg, 3 crushers with quotas, 13 console minigames, and a player Hunter (Jingles) who gets a Bloodlust reveal every 50–80 s so hiding forever doesn't work.
>
> Hardest part: the custom rig and animations for Jingles. [1–2 sentences from Anand about what actually broke and how you fixed it.]
>
> Screenshots: [3 images: cargo dock, jingles-medbay, crusher-console]. Happy to answer anything about the systems.

Don't put the game link in the title. Put it in a comment only if someone asks or the sub allows it.

---

## 5. Shorts / TikTok / Reels: 5 ideas from real mechanics

Each one is a real thing the game does, so the clip can't be called clickbait. Record in
OBS 1080p60, cut to 9:16, captions on screen.

| # | Hook (first 1.5 s on screen) | What to show | Caption |
|---|---|---|---|
| 1 | "My friend rang the bell." | A teammate presses 4, the Worm surfaces 3–5 s later | never trust the bell guy |
| 2 | "Every minute or so, the monster sees EVERYONE" | Jingles POV during Bloodlust, then a chase | hiding doesn't work in this game |
| 3 | "He camped the pod. Big mistake." | Pod overload knocks Jingles back, captive freed | anti-camp in a roblox horror game? |
| 4 | "Point your flashlight at it." | Worm rears up, flashlight beam, it backs off | the worm hates light |
| 5 | "Escaped… or Consumed?" | Split: last-second escape vs. caught at the chute | 60 seconds to get out |

**Description template** (every upload):
```
STATIC is a free co-op horror game on Roblox. Play: https://www.roblox.com/games/80261274887781/STATIC
Guide & map: https://beaniestudio.site/guide/
#roblox #robloxhorror #static
```
Three hashtags max. More looks spammy and doesn't help.

---

## 6. Creator outreach (mid-size Roblox horror channels, 10k–500k subs)

Find 30–50 channels that posted a Roblox horror video in the last month. Personalise the
first line every time.

```
Subject: STATIC: a Roblox horror game where your friend is the monster

Hi [name], loved your [specific video]. [one honest sentence why].

We're 3 devs who just launched STATIC on Roblox. One player is Jingles, a clockwork jester hunting everyone else, and any teammate can ring a bell that summons a Worm under the floor. It's made for group videos.

Free to stream and monetize. Art + screenshots: https://beaniestudio.site/press/
If you want a private server with us, or the Hunter role guaranteed for a video, reply and we'll set it up.

— [name], Beanie Studios · press@beaniestudio.site
```

---

## 7. Codes = free coverage (do this in week 1)

Roblox "codes" sites (they publish pages like "STATIC codes October 2026") are the
biggest source of links for new Roblox games. They write about games that **have codes**.

1. Add a code system with one launch code (e.g. a Fragments bonus).
2. Put it on https://beaniestudio.site/codes/ (edit `src/pages/codes.astro`), in the Discord and in the Roblox description.
3. Add a new code at each milestone (likes, visits, update). Each new code is a reason for those sites to update their page and link you again.

---

## 8. Devlog posts that will actually rank (one per update, written by you)

Google ranks first-hand experience. AI can tidy the writing, but the facts and stories
have to come from you. Answer the questions, send them over, and they become posts.

1. **"How we built Jingles"** (Anand): Why a jester? What went wrong with the custom rig? Which animation took longest? One before/after GIF.
2. **"Building the bunker: 9 rooms in X weeks"** (Pawan): Which room came first? Which room was rebuilt? Where do players get caught most?
3. **"The sounds of STATIC"** (Jai): What's the Worm made of (sound-wise)? The Hunter reveal stinger? One clip.
4. **"Beta week 1: what we changed"** (all): Real numbers (players, rounds, win rate Hunter vs Scrappers), the top 3 bugs, the top 3 suggestions you're doing.
5. **Patch notes** for every update: short, factual, dated. Also post them in the Discord and as a Roblox group shout.

---

## 9. What NOT to do (these get sites and games buried)

- No bought links, link exchanges, "SEO packages" or directory blasts.
- No mass-generated blog posts (the old autopilot is paused for this reason).
- No fake reviews, fake player counts or fake "leaks".
- No keyword lists in the Roblox description; Roblox moderates misleading titles and descriptions.
- No identical text across platforms.
- Don't promise features in thumbnails that aren't in the game.
