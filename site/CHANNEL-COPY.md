# Channel copy — ready to paste

Written 2026-10-17, from the YouTube channel screenshot the owner supplied.

## Why this file exists

A search for `Beanie Studio STATIC Roblox` returns **nothing relevant** — no Wikipedia,
no Fandom, no Reddit thread, no article. That is the real reason an AI assistant with no
prior conversation history cannot answer "what is Beanie Studio": there is no text
anywhere for it to read. It is not an `llms.txt` problem.

The YouTube channel is the largest surface the studio already owns (313 subscribers,
29 videos, joined 3 May 2024) and **its description contains no descriptive text at all** —
only five bare URLs. So the single biggest, cheapest corroboration win available is to
put actual sentences on the channels.

**Rule for everything in this file: no claim that is not already true on the site.**
Every figure below comes from `src/data/game.ts`. If a number changes there, change it
here.

---

## 1. YouTube channel description — paste this

> Beanie Studios is a three-person independent game studio. We make **STATIC: Salvage vs
> Hunter**, a free co-op horror game on Roblox.
>
> One player is Jingles the Hunter. Everyone else is a Scrapper: search an abandoned
> research bunker for scrap, feed 400 kg to the crushers, and escape through the Intake
> Chute inside a 60-second window. Up to 6 players per server, PC and mobile, free to
> play.
>
> Public beta is live now on Roblox. Devlogs and gameplay Shorts go up here.
>
> ▶ Play STATIC free: https://www.roblox.com/games/80261274887781/STATIC
> 💬 Discord (find a squad): https://discord.gg/z8kPT6cRbG
> 👥 Roblox group: https://www.roblox.com/communities/1108819917/Beanies-studios
> 🐦 X: https://x.com/BeanieStudiosHQ
> 📸 Instagram: https://www.instagram.com/official_beaniestudios/
> 🌐 Official site and full guide: https://beaniestudio.site

**Why each part is there**

- The first sentence names the studio and the game in plain language. That is the sentence
  an AI system or a search engine can actually quote.
- "Roblox", "co-op horror", "free", "survival" and "asymmetrical" are the terms players
  search. They are used naturally, not stuffed.
- The loop is described in one paragraph so a reader learns what the game *is* without
  clicking anything — the same clarity-first rule the website follows.
- `up to 6 players` and `400 kg` and `60-second` are the corrected figures. Do not use
  "7 players" or "20 minutes" anywhere; both were wrong on the site until 2026-10-17.
- The site link is last and described, rather than being one of five bare URLs.

**Note:** the emoji are optional. YouTube renders them fine; strip them if you prefer.

---

## 2. Video description template — for new uploads

Every one of the 29 existing videos should at minimum get the first two lines.

```
STATIC: Salvage vs Hunter — a free co-op horror game on Roblox.

[One sentence describing what happens in THIS clip.]

Play free: https://www.roblox.com/games/80261274887781/STATIC
Full guide: https://beaniestudio.site/guide/
Discord: https://discord.gg/z8kPT6cRbG

Beanie Studios is a three-person studio. STATIC is our first game.
```

**Why the same block every time:** repeated, consistent text across many videos is what
makes a brand learnable — by people, by search engines, and by AI systems. Thirty videos
each saying "a free co-op horror game on Roblox" is thirty corroborating sources; thirty
videos with no text corroborate nothing.

---

## 3. Instagram and X bios

**Instagram** (@official_beaniestudios)

> Beanie Studios · three-person indie team
> STATIC: Salvage vs Hunter — free co-op horror on Roblox
> ▶ beaniestudio.site

**X** (@BeanieStudiosHQ)

> We make STATIC: Salvage vs Hunter, a free co-op horror game on Roblox.
> Three-person studio. Devlogs, updates and patch notes.
> ▶ beaniestudio.site

Both are under the platform limits and both state the studio and the game, which the
current bios may not.

---

## 4. Two things to check on the channel itself

**The channel location says "United States".** The studio is in India (the repo's own
config notes IST as local time). If that is deliberate audience targeting, fine — but it
is an inaccuracy on a channel that otherwise describes a studio, and it is the kind of
detail a journalist or a wiki editor notices. Decide and make it consistent with
everything else.

**The channel has 29 videos and 313 subscribers but only Shorts-length clips.** The site's
`/videos/` hub lists 7 clips, all 6–18 seconds. Nothing on either surface shows a full
round. A single 3–5 minute unedited round would do more for a new player than any amount
of channel copy — and it gives the site something to embed as a real watch page.

---

## 5. What NOT to write

- **No "best Roblox horror games 2026" style keyword-stuffed paragraphs.** It reads as
  spam and it does not work on YouTube or in AI answers.
- **No engagement bait** ("smash that like button") — the site's own voice rule bans
  exclamation-mark enthusiasm, and the studio's register is dry and factual.
- **No numbers you have not verified in `game.ts`.** The site carried a false player
  count and a false round length for weeks because a number was written down instead of
  imported. The same mistake on 29 video descriptions is 29 times harder to clean up.
- **Do not claim features that are planned.** The Roblox store description currently
  advertises the retired noise-radar, traps and fuel-canister design, which the site's
  own devlog says was cut. That is the same class of error.
