# Media wishlist — what to record, how it's used, how to send it

## How to send
1. Put files in `game-assets/videos/` (raw) in the repo, the same way the screenshots went
   into `game-assets/owner-shots/`. Keep each file **under 95 MB** (GitHub's hard limit is
   100 MB). Longer recordings → upload to YouTube (unlisted is fine) and send the link.
2. Name them like `jingles-dash-01.mp4`, `worm-flashlight-01.mp4`.
3. Raw files never deploy (`game-assets/` is in `.assetsignore`); a script will cut them
   into small web loops.

## Recording settings
OBS, 1920×1080, 60 fps, MP4 (H.264), **no music, no on-screen text**, game audio on.
GUI hidden unless the shot is about the GUI. 5–20 s per clip is plenty.

## Shot list (priority order)

| # | Clip | Length | Where it goes on the site | Traffic value |
|---|---|---|---|---|
| 1 | **Trailer** 60–90 s (cut by Jai) | 60–90 s | YouTube → homepage hero + a `/videos/trailer/` watch page | **High**: video results, YouTube search, shares |
| 2 | Jingles Dash, side angle | 5–8 s | Home Jingles section loop, Jingles guide | Medium (guide page dwell time) |
| 3 | Jingles attack → down → carry → pod | 10–15 s | Pods guide loop, home "Pod" card | Medium |
| 4 | Bell rung → Worm surfaces → flashlight repels it | 10–15 s | Worm guide + home Worm card | **High**: the most "clippable" mechanic for Shorts |
| 5 | Pod rescue (hold E) with timer visible | 8 s | Pods guide | Medium |
| 6 | Pod overload stunning a camping Jingles | 8 s | Pods guide, Shorts | High (Shorts) |
| 7 | Bloodlust reveal (Hunter POV) | 6–10 s | Jingles guide, Shorts | High (Shorts) |
| 8 | Feeding a crusher + gauge filling | 6 s | Crushers guide, home story step 2 | Low–medium |
| 9 | Each console minigame, success + fail (13 × 2) | 3–5 s each | Crushers guide: one loop per minigame + a `/guide/minigames/` page | **High** for search ("static wires minigame" etc.) |
| 10 | Siren → Intake Chute opens → UFO beam-up | 10–15 s | Home story step 4, crushers guide | Medium |
| 11 | Hunter reveal cutscene (full) | full | Home hero alt, map guide | Medium |
| 12 | Walkthrough of each room (slow pan) | 10 s each | Map guide, one loop per room | Medium (image + video search) |
| 13 | 3–5 real funny/scary playtest moments | any | YouTube Shorts → embedded on watch pages | **High** (social → site → game) |
| 14 | Mobile gameplay (phone recording) | 15 s | Play page ("works on mobile" proof) | Medium (conversion) |

## How they'll be used (technical)
- Web loops: re-encoded to ~1–3 MB WebM + MP4, `muted loop playsinline`, poster image,
  lazy-loaded, paused when off-screen and for reduced-motion users. No speed loss.
- Search: every YouTube upload gets a watch page on the site with the embed in the HTML,
  `VideoObject` + key-moment markup, so Google can index it as a video (the current
  click-to-load cards can't be indexed as videos).
- Shorts: clips 4, 6, 7, 13 → vertical 9:16 cuts with captions → YouTube/TikTok with the
  guide link in the description.

## Will they bring traffic?
Directly from Google: modest at first (new domain). The real win is **YouTube/TikTok
reach → people search "STATIC roblox" → land on the official guide → click Play**.
Videos also raise time-on-page, which feeds Google's click signals (see SEO-PLAYBOOK §1).
