# Latent-bug audit — beaniestudio.site

**Auditor:** independent, read-only. **Scope:** `D:\roblox game 4\beaniestudio-site\` (Astro source, built root, deployed live site) cross-checked against the game's own scripts in `D:\roblox game 4\src\` and the public Roblox listing for place `80261274887781`.
**Nothing in the repo was created, modified or deleted. No npm script, no build, no git command was run.** Only `_bug-hunt\` (outside the audited tree) was written. Every claim below comes from a file I read, a URL I fetched, or a raw-byte check.

> **Concurrent-edit caveat:** three other agents were editing this repo while I read it. I re-read anything that looked mid-edit. Findings 7a–7d in particular are the kind of thing someone may have already fixed after my read; the evidence line numbers are as of my read.

**Ground truth used for "the game":** `src/ReplicatedStorage/STATIC_Shared/Config/*.luau`, `STATIC_Shared/{ScrapCatalog,ConsoleGameRegistry,MapNames}.luau`, `ServerScriptService/STATIC_Server/{RoundManager,PodManager,WormService,RoleManager}.luau`, `STATIC_Project_Docs/`, and `https://games.roblox.com/v1/games?universeIds=10491928635`.

---

## Ranked findings

| # | Finding | Severity | Consequence |
|---|---|---|---|
| 1 | Player count: site says **7 per server**, the game's server cap is **6** | Critical | The headline fact in the title tag, meta description, FAQ, `/llms.txt` and press kit is false |
| 2 | Round length: site says **up to 20 minutes**, the game's hunt phase is capped at **600 s (10 min)** | High | False claim on every surface; unreachable in any phase-sum reading |
| 3 | Worm bell: site says **3–5 s later, 60–100 studs away**; game says **0.5–1.0 s, 6–14 studs** | High | Two wrong numbers on 3 pages + `/llms.txt` + the reference page |
| 4 | Worm base spawn chance: site says **6%**, game says **3.5%** (and omits the bell's ×3 lure) | High | Wrong rate and wrong lure mechanics on the "free to cite" reference page |
| 5 | Pod rescue range: site says **7 studs**, game says **15 studs** | High | Stale by a 2026-10-10 change; players under-rescue |
| 6 | Struggle-break stun: site says **1.2 s**, game says **2 s** | Medium-high | Wrong number on 3 pages |
| 7 | Rule-9 violations: hardcoded game numbers typed into pages/config/copy | Medium | Six instances; two are individually wrong, one page cites a solve time the game contradicts |
| 8 | Bare blog-post URLs return **307**, not the **301** the `_redirects` contract promises | Medium | The exact duplicate-indexing problem they fixed for `/guide/map`, left open for both posts |
| 9 | `/devlog` → `/blog` → `/blog/`: a two-hop 301 chain | Low-medium | Signal dilution; the list's own rule is "no chains" |
| 10 | Image sitemap claims **2 images on `/guide/map/` that the page never renders** | Low-medium | Structured data contradicting the visible page |
| 11 | `VideoObject.embedUrl` hardcodes **youtube.com** on `/` and `/play/`, contradicting the site's own privacy-embed contract | Low-medium | Advertises a host the site says it never uses |
| 12 | `#game` `@id` referenced on **15 pages, defined on 1** | Low-medium | Un-resolvable `about` claim for single-page consumers/AI extractors |
| 13 | `/guide/numbers/` says **9 rooms**, `/guide/map/` shows **8** | Low | Two pages answer "how many rooms" differently |
| 14 | 404 page's canonical points at `/404/`, which does not exist | Low | Cosmetic (page is `noindex`) |
| 15 | Launch date exists in two constants and is used for two different renderings of the same label | Low | Latent divergence between the JS-updated and no-JS versions of the hero label |

---

### 1. The site claims 7 players per server. The game allows 6. (Critical)

This is the site's central number and it is wrong on **every** surface.

**Site side (what is claimed):**
- `site/src/data/game.ts:27-28` — `serverSize: 7`, `scrappers: { min: 4, max: 6 }`, `hunters: 1`
- `site/src/site.config.ts:8` — title `'STATIC: Salvage vs Hunter — 4-7 Player Roblox Horror'`; `:9-10` — description `'Free co-op Roblox horror for 4-7 players…'`
- `site/src/pages/llms.txt.ts:26` → live `/llms.txt:14`: *"Players: up to 7 per server — 4–6 Scrappers vs 1 Hunter"*
- `site/src/pages/faq.astro:27`: *"Up to 7 per server: 4 to 6 Scrappers and 1 Hunter."*
- `site/src/pages/index.astro:56` — the home page's count-up stat band: `{ to: GAME.serverSize, … label: 'players per server' }` → renders **7**
- `site/src/pages/index.astro:96` — `VideoGame.numberOfPlayers.maxValue = GAME.serverSize` (7); `minValue = 5`
- `site/src/pages/play.astro:66` — *"with up to {GAME.serverSize - 1} other players"* (6 others ⇒ 7 total)
- `site/src/pages/guide/numbers.astro:93` — the free-to-cite reference table: *"Players per server 7"*
- `site/src/pages/press/static-press-kit.zip.ts:24` — press fact sheet: *"Players: Up to 7 per server (4–6 Scrappers vs 1 Hunter)"*
- `site/src/pages/faq.astro:109` and `site/src/pages/play.astro:50` — meta descriptions hardcode "up to 7 players"

**Game side (what is true):**
- Roblox public API, place `80261274887781` → universeId `10491928635`: `"name": "STATIC [BETA]" … "maxPlayers": 6`, and the same listing's description says **"(5 vs 1)"**
- `src/ReplicatedStorage/STATIC_Shared/Config/Match.luau:54` — `MAX_MEMBERS = 6, -- matches this game's own max lobby size (1 Hunter + up to 5 Scrappers)`
- `src/ServerScriptService/STATIC_Server/RoundManager.luau:364` — `-- Max match size (6) is enforced via Players.MaxPlayers in Studio's Game Settings.`
- `STATIC_Project_Docs/CORE_LOOP.md:4` — *"6 players ready up in the lobby."*
- `STATIC_Project_Docs/Monetisation_Cosmetics/01_full_cosmetic_catalog.md:291` — *"Seen by all 4-6 players after every match."*

So a 6-slot server with 1 Hunter leaves **at most 5 Scrappers**, and the site's own arithmetic (`6 Scrappers + 1 Hunter = 7`) cannot occur. A secondary, softer error on the same line: `MIN_PLAYERS = 3` is live (`Match.luau:8`, *"temporary 3-player testing; shifts back to 4 later"*), so the "4–6 Scrappers" floor is not enforced either — the game currently starts a round with 3 players total.

**User-visible consequence:** the number in the SERP title and snippet, the FAQ answer Google may show as a rich result, the homepage stat band, the press fact sheet journalists copy, and the `/llms.txt` brief that AI answer engines cite — all overstate the server size by one, and imply a Scrapper count that cannot exist.

**Fix:** `game.ts` → `serverSize: 6`, `scrappers: { min: 4, max: 5 }` (or 3–5 while `MIN_PLAYERS = 3`); change the title to a 5-6 player framing; re-derive the two hardcoded meta descriptions (finding 7) from `GAME`; rebuild so `/llms.txt`, the numbers page, the press zip and the home stat band follow. `index.astro:96` fixes itself once `serverSize` is right.

---

### 2. "Rounds up to 20 minutes" — the game's hunt phase is 600 s. (High)

**Site side:** `game.ts:30` `roundLimitMin: 20` → `site/src/pages/faq.astro:31` *"Up to 20 minutes. If time runs out…"*; `site/src/pages/llms.txt.ts:27` → live `/llms.txt:15` *"Round limit: 20 minutes"*; `site/src/pages/guide/numbers.astro:96` *"Round length limit 20 min"*; `site/src/pages/press/static-press-kit.zip.ts:25` *"Round length: Up to 20 minutes"*; `site/src/pages/faq.astro:109` meta description *"rounds up to 20 minutes"*.

**Game side:** `Config/Match.luau:26` — `HUNT_PHASE_MAX_TIME = 600, -- 10 minutes`. `RoundManager.luau:172` wires it into `PHASE_DURATIONS.Hunt`, `:824-825` runs `self.Timer = GameConstants.HUNT_PHASE_MAX_TIME`, and `:906` hard-ends the round when it hits zero (`"Time ran out. Hunter Wins!"`). The design doc targets *"10–14 min average round length"* (`STATIC_Project_Docs/14_development_roadmap_mvp.md:37`).

Even summing every phase at its cap — lobby 60 (`LOBBY_TIME_MAX`) + PreGame 18 (`BRIEFING_TIME` 10 + `MATCH_READY_BARRIER_CAP` 8) + grace 30 + hunt 600 + extraction 60 + RoundEnd 9 — the maximum round is **777 s ≈ 13 minutes**. "20 minutes" is unreachable under any reading of the config.

**Fix:** `roundLimitMin: 10` (or rename to a hunt-phase cap of 10 and state the ~13-minute worst case). This one line propagates to the FAQ, the reference page, the press sheet and `/llms.txt`.

---

### 3. The bell's Worm: 0.5–1.0 seconds, 6–14 studs — not 3–5 seconds, 60–100 studs. (High)

**Site side:** `game.ts:143-144` — `bellSpawnDelaySec: '3–5'`, `bellSpawnDistStuds: '60–100'`, rendered as:
- `guide/worm.astro:33-34` — *"Ringing it always spawns a Worm **3–5 seconds** later, **60–100 studs** away."*
- `guide/danger.astro:132` — table cell *"Worm in 3–5 s, 60–100 studs away"*
- `guide/index.astro` (round steps) and `guide/numbers.astro:213-214` (*"Delay after ringing the bell 3–5 s"*, *"Spawn distance from the bell 60–100 studs"*)
- `/llms.txt:19` — *"ringing the bell always summons one 3–5s later"*

**Game side:** `Config/Worm.luau:114-127` (dated 2026-10-09, *after* the worm4 travel rework it replaced):
```
-- Bell-summoned worm: ringing = guaranteed jumpscare on closest player (2026-10-09 fix)
Bell = { Enabled = true, DelayMin = 0.5, DelayMax = 1.0, MinDist = 6, MaxDist = 14, … }
```
`WormService.luau:1192` — `local delayTime = B.DelayMin + math.random() * math.max(0, B.DelayMax - B.DelayMin)`; `:1155` and `:1203` — `travelSpot(targetRoot, B.MinDist or 6, B.MaxDist or 14)`. The `60/100` figures do exist in `Worm.luau:27-28` — but as the **general** travel spawn ring (`Travel.MinDist/MaxDist`) for random worms, which the bell path no longer uses. That is almost certainly where the site's number came from: a correct constant attached to the wrong mechanic.

**Consequence:** the site's own "don't ring the bell" advice is calibrated on a 3–5 second, map-crossing warning. In the game the bell worm is a near-instant close-range jumpscare on the nearest Scrapper, so the site materially understates the punishment.

**Fix:** `bellSpawnDelaySec: '0.5–1'`, `bellSpawnDistStuds: '6–14'`, and reword the three pages to "it emerges on the closest Scrapper within about a second".

---

### 4. Worm base spawn chance: 3.5%, not 6% — and the lure table is wrong. (High)

**Site side:** `game.ts:145-149` — `baseChancePct: 6`, `baseChanceEverySec: 5`, `lures: ['A missed or near-miss throw', 'A screaming mimic item nearby', 'Standing near or holding heavy scrap']` with the caption *"×1.5 each, capped at ×2"*, rendered on `guide/worm.astro:38-41` (*"6% chance every 5 seconds … (×1.5 each, up to ×2 in total)"*), `guide/danger.astro:142` (*"6% base, checked every 5 s"*) and `guide/numbers.astro:215-216`.

**Game side:**
- `Config/Worm.luau:70-71` — `SpawnTickInterval = 5`, `BaseChance = 0.035, -- balanced horror pacing` → **3.5%**, matching `baseChanceEverySec: 5` only.
- `WormService.luau:1237` — `local chance = CFG.BaseChance * lureMultiplier(pos, now) * heavyChanceMult(p, pos)`.
- `Config/Worm.luau:90-94` — `Lures = { Bell = { Multiplier = 3, … }, Miss = { Multiplier = 1.5, … }, Mimic = { Multiplier = 1.5, … } }`. The bell is **×3** and is missing from the site's list entirely; `Config/Worm.luau:105-107` — `Heavy = { HeldChanceMult = 1.5, MaxChanceMult = 2, … }`, so the ×2 cap applies to the heavy factor only, not "in total".

**Fix:** `baseChancePct: 3.5`; add `{ name: 'Ringing the bell', mult: 3 }` to the lure data and correct the "×1.5 each, capped at ×2" caption to distinguish the bell (×3) from miss/mimic (×1.5) and the heavy-scrap factor (×1.5, capped ×2).

---

### 5. Pod rescue range: 15 studs, not 7. (High)

**Site side:** `game.ts:65` — `rescueRangeStuds: 7` → `guide/capture-and-rescue.astro:56` *"Get within 7 studs of the pod"*, `guide/with-friends.astro:26` (HowTo schema text) and `:85` (*"7 studs away"*), `guide/numbers.astro:197` *"Rescue range 7 studs"*.

**Game side:** `ServerScriptService/STATIC_Server/PodManager.luau:74` —
```
local RESCUE_MAX_DISTANCE = 15.0 -- 2026-10-10: FloorPlate is 12.5x12.9 studs (~8.5 studs from center). 15.0 allows rescue from anywhere on or around the platform.
```
The comment records that the old value **was** 7.0, which is exactly what `game.ts` still carries (and `game.ts`'s header says it was read from the *8 Oct 2026* build — two days before this change).

**Consequence:** the site tells players they must be roughly touching the pod; the game lets them rescue from more than double that. Combined with the `HowTo` structured data on `/guide/with-friends/`, the wrong number is also machine-readable.

**Fix:** `rescueRangeStuds: 15`. Optional precision: `PodManager.luau:75` validates a minimum hold of `RESCUE_HOLD_MIN = 2.55 s` for the 3 s channel — the site's flat "hold E for 3 seconds" is fine, only the range is wrong.

---

### 6. Struggle-break stun: 2 seconds, not 1.2. (Medium-high)

**Site side:** `game.ts:67` — `struggleStunSec: 1.2` → `guide/capture-and-rescue.astro:35` *"Jingles is stunned for 1.2 seconds"*, `guide/jingles.astro:108` *"Breaking free stuns Jingles for 1.2 seconds"*, `guide/numbers.astro:199` *"Struggle stun on the Hunter 1.2 s"*.

**Game side:** `Config/World.luau:28` — `STRUGGLE_STUN_DURATION = 2, -- Hunter stun when a carried Scrapper breaks free`, consumed at `PlayerStateManager.luau:774` (`CS.Speed(hunter, "stun", 0, GameConstants.Timings.STRUGGLE_STUN_DURATION or 2)`). Note the `or 2` fallback inside the game: 2 is the value the code itself defaults to.

**Fix:** `struggleStunSec: 2`.

---

### 7. Rule-9 violations: game numbers typed into pages instead of imported. (Medium)

The contract (`site/CLAUDE.md` rule 9) is "never type a game number into a page". Six places do, and two of them are also factually wrong:

**(a) `site/src/pages/faq.astro:109`** — meta description `"…up to 7 players, rounds up to 20 minutes, a 60-second escape window…"`. All three numbers are typed; **two of the three are wrong** vs the game (7→6 per finding 1; 20 min→10 per finding 2). The escape window (60 s = `Match.EXTRACTION_TIME = 60`) is correct. Every other fact on that page is interpolated from `game.ts` — this one string escaped the discipline.

**(b) `site/src/pages/play.astro:50`** — `"…up to 7 players a server."` typed, wrong (same finding).

**(c) `site/src/pages/guide/crushers.astro:44`** — *"Each one takes about 2.5 to 4 seconds to solve when you know it."* Not in `game.ts`, and contradicted by the game's own timing budget: `ReplicatedStorage/STATIC_Shared/ConsoleGameRegistry.luau:163` — `ExpectedMs = { [1] = 12000, [2] = 12000, [3] = 12000 }` (12 s of expected solve time per difficulty tier). A "2.5–4 seconds" claim is off by 3–5× against the only number the game ships. Either delete the claim or replace it with the game's expected time.

**(d) `site/src/pages/guide/index.astro:64-65`** — *"a one-minute countdown starts. If the server fills up, it drops to seven seconds."* Both typed. They **do** match `Match.luau:14-16` (`LOBBY_TIME_MAX = 60`, `LOBBY_TIME_MIN = 7`, `LOBBY_FULL_PLAYERS = 8`) — but note `LOBBY_FULL_PLAYERS = 8` while the server caps at 6 (`RoundManager.luau:410` clamps with `math.min(LOBBY_FULL_PLAYERS, math.max(Players.MaxPlayers, …))`, so the true "full" point is 6 and the countdown does reach 7 s there). Worth knowing; no user-visible error.

**(e) `site/src/pages/guide/crushers.astro:19`** — *"When all three are done, the exit opens"* while the same page imports and prints `{CRUSHERS.count}` two lines earlier. Cosmetic Rule-9 leak.

**(f) `site/src/pages/guide/scrap.astro:132`** — *"it vanishes after 90 seconds if nobody grabs it."* Correct (`Config/Scrap.luau:70` `Spill.DESPAWN_SECONDS = 90`) but typed, so it cannot follow the game.

**(g) `site/src/pages/llms.txt.ts:69`** — `"These are YouTube Shorts (6-18 seconds each)"` typed, while line 72 of the same template derives each video's real duration and `/videos/` prints a computed `totalSeconds`. The claim silently breaks the first time a longer upload is added.

**(h) `site/src/pages/index.astro:193-195`** — the launch label reads its date from **two different constants on adjacent lines**: `data-launch={SITE.launchDate}` (`site.config.ts:14`) for the JS countdown, but `Beta out {GAME.launchLabel}` (`game.ts:21`) for the no-JS text. Both say 2026-10-10 today, so nothing is visibly broken; the moment one is updated the JS-enabled and no-JS visitors see different dates on the same label. Same duplication in `press.astro`, `about.astro`, `faq.astro` etc., all via `GAME` — only `index.astro` mixes the two.

---

### 8. Bare blog-post URLs get a 307, not the 301 the redirect contract promises. (Medium)

`_redirects:69-73` states the rule and the reason:

> `# Trailing-slash consolidation (2026-10-16)`
> `# Cloudflare's asset server answers a bare /page with a 307 Temporary redirect to`
> `# /page/, and a 307 does not consolidate ranking signal … These explicit 301s replace that 307`

The list that follows (lines 74-94) covers 21 routes — and omits both live blog posts, because those are dynamic `[...slug]` routes rather than hand-written page files.

**Live evidence (no-follow GETs against `https://beaniestudio.site`):**

| URL | Result |
|---|---|
| `/blog/why-static-is-not-a-generator-game` | **307** → `/blog/why-static-is-not-a-generator-game/` |
| `/blog/static-public-beta-whats-in-the-first-build` | **307** → `/blog/static-public-beta-whats-in-the-first-build/` |
| `/about` | 301 → `/about/` |
| `/guide/map` | 301 → `/guide/map/` |

Also 307 (harmless, but same class): `/index.html` → `/` and `/guide/index.html` → `/guide/`.

**Consequence:** the exact duplicate-indexing problem the file was written to fix still applies to the two pages most likely to attract backlinks.

**Fix:** add four lines to `site/public/_redirects` (and mirror to the repo root on next `sync-root`):
```
/blog/why-static-is-not-a-generator-game  /blog/why-static-is-not-a-generator-game/  301
/blog/static-public-beta-whats-in-the-first-build  /blog/static-public-beta-whats-in-the-first-build/  301
```
and add the equivalent line whenever a new post ships.

---

### 9. `/devlog` 301s to `/blog`, which 301s again to `/blog/`. (Low-medium)

`_redirects:1-2`:
```
/devlog/*  /blog/:splat  301
/devlog    /blog        301
```
There is no `/blog` page — the trailing-slash consolidation list at `_redirects:93` sends `/blog` → `/blog/`. Live: `GET /devlog` → `301 Location: /blog`, and `GET /blog` → `301 Location: /blog/`. A two-hop chain for the legacy path (and for every `/devlog/<post>` under the splat rule). The task's own criterion is "no redirect chains", and the file's stated purpose is merging signal.

**Fix:** `…  /blog/` (and `/blog/:splat/`) so it is one hop.

---

### 10. The image sitemap claims two images on `/guide/map/` that the page never renders. (Low-medium)

`site/src/pages/sitemap-images.xml.ts:15` builds the `/guide/map/` entry as `['map-topdown', ...ROOM_INFO shots, ...SHOTS.filter((s) => s.group === 'hallway').map((s) => s.id), 'lobby', 'hunter-reveal']` — i.e. **all** hallway shots. But `site/src/pages/guide/map.astro:87` renders a hand-picked six:
```
<ShotFigure ids={['hallway-storage', 'hallway-medbay', 'hallway-security', 'hallway-cargo', 'hallway-control', 'hallway-strip']} … />
```
The registry has **eight** `group: 'hallway'` shots. Live `/guide/map/` HTML contains 0 occurrences of `hallway-control-2` and `hallway-green`, yet the live `/sitemap-images.xml` lists `https://beaniestudio.site/media/hallway-control-2-1920.webp` and `…/hallway-green-1920.webp` under `<loc>https://beaniestudio.site/guide/map/</loc>`. (Both images do exist and are on `/screenshots/`, which lists all 80 — so nothing is broken, just mis-attributed.)

Everything else in that sitemap checks out: 10 `<url>` blocks, all other 130+ listed images verified present in their page's HTML.

**Fix:** either add the two ids to the map page's `ShotFigure`, or exclude them from the sitemap entry (drive that entry from the same array the page uses).

---

### 11. `VideoObject.embedUrl` uses `youtube.com`, contradicting the site's own privacy-embed contract. (Low-medium)

`site/src/data/videos.ts:117-120` documents:
```
/** Privacy-mode embed, no params. Used by VideoObject.embedUrl and the facades. */
export function embedUrlPlain(id) { return `https://www.youtube-nocookie.com/embed/${id}`; }
```
Two pages bypass it and hardcode the normal host:
- `site/src/pages/index.astro:107` — `embedUrl: \`https://www.youtube.com/embed/${FEATURED_VIDEO.id}\``
- `site/src/pages/play.astro:15` — `embedUrl: \`https://www.youtube.com/embed/${v.id}\``

Live JSON-LD confirms `/` and `/play/` publish `https://www.youtube.com/embed/…` while `/videos/` publishes `…youtube-nocookie.com/embed/…` for the same video (`videos/index.astro:40` uses the helper). This is the same class as the design contract's rule 13 (never a bare `youtube.com` surface) and rule 10 (URLs come from the data module).

**Fix:** call `embedUrlPlain(v.id)` in both pages.

---

### 12. `https://beaniestudio.site/#game` is referenced on 15 pages and defined on one. (Low-medium)

Parsed the live JSON-LD of all 23 pages: valid JSON everywhere, but `#game` appears as a bare `{'@id': …}` reference with no definition in that page's graph on: `/codes/`, `/guide/`, `/guide/capture-and-rescue/`, `/guide/crushers/`, `/guide/danger/`, `/guide/hiding/`, `/guide/jingles/`, `/guide/map/`, `/guide/numbers/`, `/guide/scrap/`, `/guide/with-friends/`, `/guide/worm/`, `/screenshots/`, `/videos/`, `/blog/<post>/`. It is defined only at `index.astro:81` (`VideoGame` with `'@id': ${SITE.url}/#game`).

Sources: `GuideLayout.astro:60`, `blog/[...slug].astro:36`, `screenshots.astro:27`, `videos/index.astro:45`, plus two hardcoded string copies (`guide/danger.astro:36` and `guide/hiding.astro:27` write the absolute URL as a literal instead of using `SITE.url`).

Cross-page `@id` resolution is legal for Google, so this is not a hard error — but a single-page consumer (most AI answer engines, most schema linters, Search Console's per-URL report) sees an `about` pointer to a node that does not exist on the page it is reading, which is exactly the "referenced but never defined" pattern in the brief.

**Fix:** emit a minimal `VideoGame`/`Thing` node with that `@id` in `GuideLayout` (or drop `about` from Article/VideoObject where it cannot resolve), and use `SITE.url` rather than two hardcoded copies.

---

### 13. `/guide/numbers/` says 9 rooms; `/guide/map/` shows 8. (Low)

`game.ts:176-179` — `ROOMS` has **9** entries including `'Airlock'`; `guide/numbers.astro:254` prints *"9 rooms as built in Studio: Nuclear Reactor, Security, … Airlock, Central Room"*. `site/src/data/rooms.ts:14-63` — `ROOM_INFO` has **8** (no Airlock), and `/guide/map/` renders those 8 plus a separate "Hallways" section. `guide/index.astro:163-165` lists all 9 (from `ROOMS`), matching the blog post's list of 9. So the site itself gives 8 and 9 for "rooms in the bunker" depending on the page; `index.astro:336` sidesteps it with `{ROOM_INFO.length}+ rooms`. Not a falsehood if Airlock is a corridor, but two pages visibly disagree.

**Fix:** state the distinction on `/guide/map/` ("8 rooms plus the corridor network, including the Airlock"), or align `rooms.ts` with `ROOMS`.

---

### 14. 404 page canonical points at a URL that does not exist. (Low)

`site/src/pages/404.astro:8` — `path="/404"` → `BaseLayout` normalises to `https://beaniestudio.site/404/` (live-verified in the served 404 HTML). `/404/` is not a route. The page carries `noindex` (`404.astro:9`), so this is cosmetic — but a canonical pointing at a 404 is free to fix.

**Fix:** drop `path` handling for the 404 (or point canonical at `/404.html`).

---

### 15. Duplicate launch-date constant. (Low — latent)

`game.ts:20-21` (`launchDate: '2026-10-10'`, `launchLabel: '10 October 2026'`) and `site.config.ts:13-14` (`launchDate: '2026-10-10'`) are two sources of truth for the same game fact; `game.ts`'s own header says game numbers live only there. `index.astro:193-195` uses both on adjacent lines (see 7h). See also the observation below about the game's in-game dates.

---

### Observations that are not site bugs but affect what the site should claim

These are outside the audited tree; flagging them because the site's numbers are correct against the config and the *game UI* disagrees with its own config, so a player will see different numbers than the site promises:

- **Extraction window.** Site and `game.ts` say 60 s, matching `Match.luau:27 EXTRACTION_TIME = 60`. But the in-game tutorial hint (`ReplicatedStorage/STATIC_Shared/TutorialHints.luau:75`) says *"Quota satisfied! Shuttle airlock open — 30 seconds to departure."*, and `RoundManager.luau:919-930` comments describe a *"35s window"*. A player reads "30 seconds" in-game and "60 seconds" on the site.
- **Quota.** Site says 400 kg, matching `Config/Scrap.luau:8 TOTAL_FUEL_QUOTA = 400` and `CrusherStationService.luau:52-53 (TOTAL_QUOTA = 400, STATION_QUOTA = {120, 130, 150})`. The same tutorial hint says *"COLLECT 500KG SCRAP"* (`TutorialHints.luau:15`), and two client fallbacks still default to 500 (`CrusherStateService.luau:63`, `ExtractionScreenUI.luau:276`).
- **The Roblox store listing still advertises the retired design.** Live `games.roblox.com` description for this place: *"asymmetrical horror game (5 vs 1) … scavenge fuel canisters, avoid making noise on the monster's radar … HUNTER: Track down the Scrappers using noise pings, set traps"*. The site's own devlog explains that noise-stealth was cut (`blog/why-static-is-not-a-generator-game.md:27-31`) and `_redirects:33` retires *"we-built-a-sound-stealth-hunter-then-we-deleted-it"*. The site links there as its primary CTA, so the store listing contradicts the site. Fix is on Roblox, not in this repo.

---

## Checked and clean (do not re-audit these)

**Glyph coverage / fonts (the precedent class) — clean, and I verified it at the cmap level, not just the `unicode-range`.**
Parsed all four `fonts/*.woff2` with `fontkitten` and extracted each real `characterSet` (229/229/230/227 codepoints; union 232). Then scanned every text file under `site/src`, `site/public` and the built root for non-ASCII characters. The **only** characters used anywhere in content that are absent from all four fonts are the seven already known — `→` (808 uses), `⤢` (182), `↗` (63), `←` (29), `≡` (27), `▶` (27), `✕` (21) — plus a set that appears **only** in dev docs/scripts/Lighthouse JSON, never on a page: `† ═ ≥ ≤ ≈ ≠ ✓ ✗ ❌ ✅ ✎ ⚠ ★ ▲ ▼ ⌕ ─ ├ └ □ ️ ＋` and flag/emoji sequences. **No new user-visible glyph gap.** Notably `↓` (U+2193), `×`, `·` (188 uses), `–`, `—`, `’`, `“”`, `•`, `…`, `©`, `§`, `−` (used as `&minus;` in `guide/danger.astro:137`) and `™` are all both in the declared ranges and in the actual cmaps.

**Mojibake — clean in source and live.**
Byte-level scan (Python/Node, UTF-8, never through PowerShell) of the whole repo and of every fetched page: **no** `Â·`, `Ã©`, `â€`, C1 sequences or U+FFFD in any source file, built file or live response. The known `FREE ON ROBLOX Â· BETA LIVE NOW` corruption survives only inside the stale artifact `site/reports/lh-home-mobile.json:4292` (a Lighthouse report) — the live homepage serves `·` as proper U+00B7. **Do all non-ASCII work in Python/Node here:** PowerShell's stdout mangles valid UTF-8 on this machine (it rendered a valid-UTF-8 `node_modules` file as `â€”`), so a PowerShell round-trip will manufacture mojibake that is not there.

**Sitemap ↔ routes — clean.**
Live `sitemap-0.xml` has 24 URLs; the built tree has exactly 24 corresponding pages (all fetched 200), no sitemap URL without a file, and no built page missing from the sitemap except the intentionally `noindex`ed `404.html`. `_redirects` and `robots.txt` in `site/public/` are identical to the deployed root copies (no sync drift). Every destination listed in `_redirects` was fetched and returns 200 — no 301-to-404 and no redirect to a retired route.

**Titles and descriptions — clean.**
All 25 pages (24 + 404) have unique `<title>`s; the longest as served is exactly 60 chars (`/guide/scrap/`, counting `&amp;`), and the `BaseLayout` brand-suffix budget logic behaves as documented. All meta descriptions are ≤155 chars (maximum is exactly 155 on `/community/`). Canonicals are correct on every page except the 404 (finding 14).

**Structured data — parse-clean and FAQ-consistent.**
Every page's `<script type="application/ld+json">` parses as valid JSON (23/23 pages, single block each). `FAQPage` on `/faq/` and `/creators/` is generated from the *same* array that renders the visible `<details>`/FAQ list, so the schema cannot drift from the visible copy — rule 11 satisfied on both. The only structured-data issues are the dangling `#game` reference (12) and the image-sitemap mis-attribution (10).

**Screenshot registry — clean.**
`media.json` has 80 shots and `media-meta.json` has 80 dimension entries; every generated `-640/-1280/-1920.webp` variant referenced by `media.ts` exists on disk; all 24 distinct shot ids referenced from `.astro` files and all 19 ids in `rooms.ts` resolve; all 16 `press: true` shots have their `public/media/press/static-<id>.jpg` and there are no orphan press JPGs.

**Screenshot press/gallery counts — consistent.** `/screenshots/`'s "80 official screenshots" matches `SHOTS.length`; `press.astro`'s "{pressShots.length} picks" (16) matches both the zip contents and the image sitemap.

**Cache and security headers — the `_headers` contract holds live.**
`/fonts/*` → `public, max-age=31536000, immutable`; `/_astro/*` (hashed) → same; `/og/*` and `/yt/*` → `max-age=2592000`; `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin` and `permissions-policy: camera=(), microphone=(), geolocation=()` present on HTML, fonts, images and text. No stale or overstated header claims.

**External links and community numbers — live and accurate.**
Discord invite `z8kPT6cRbG` resolves (guild "Beanie Studios", 83 members — site says "75+"); YouTube `@official_beaniestudios` resolves (313 subscribers — site says "310+"); the Roblox group id resolves to "Beanie's studios"; `x.com/BeanieStudiosHQ` and the Instagram handle both return 200. `rss.xml` is valid and its post links use trailing slashes.

**Game facts that do match the game (verified line by line, so these are not the bug):**
- `SCRAP`: all 14 items, every weight (3/6/15/18/20/20/40/45/50/50/90/90/100/140 kg) and every spawn chance (100/75/50/40/20 %) match `ScrapCatalog.luau:12-35` exactly; backpack cap 2 = `Scrap.luau:36 LIGHT_ITEM_CAP`; max carry slowdown 7 % = `Scrap.luau:93 SPEED_PENALTY_MAX` at 140 kg = `SPEED_PENALTY_FULL_KG`.
- `CRUSHERS`: 3, quotas 120/130/150, total 400 = `CrusherStationService.luau:52-53`; `MINIGAMES` (13 names) matches the 13 `Id`s in `ConsoleGameRegistry.luau`.
- `MOVEMENT`: 7 / 13 / 13.5 / 10.8 / 1.5 / 6 all match `Config/Movement.luau:8-13`.
- `JINGLES`: melee range 6.6, wind-up 0.35, hit cooldown 1.5, dash 26/1.6 s/8.5 s, bloodlust 50–80 s with a 3 s reveal and ×1.5 burst — all match `Config/Hunter.luau:8,18-20,26,56-63`.
- `POD`: 90 s timer, floor 30 s, double drain last-stand, 3 s rescue channel, 5 s rescue shield, 5 % gamble, 15 s fail penalty, 20 s burnout, 2-hit down — all match `PodManager.luau:73-101` and `Config/World.luau:25`.
- `WORM.maxAlive` 3, 5 s tick, grab damage 8–20 % — match `Worm.luau:70-73,131-133`.
- `SCRAPPER.lockerMaxSec` 18 = `World.luau:12 LOCKER_CAMP_TIME`; `bellCooldownSec` 7 = `HotbarConfig.luau:31 BELL_COOLDOWN`; `reviveHoldSec` 5 = `World.luau:25 REVIVE_DURATION`.
- `RESULTS` titles and lines match `ResultsV2.luau:41-64` verbatim; `EXTRACTION.room` "Intake Chute" matches `MapNames.luau:20`.
- Dates: launch 2026-10-10, dev start July 2026 — consistent across `game.ts`, `site.config.ts`, `/llms.txt`, the press sheet and the blog.
- Two values I could **not** verify from disk (Studio-owned, not in `src/`): `hunterSpawnPoints: 5` (the game finds parts whose name contains "hunterspawn", `RoleManager.luau:136-168` — the count lives in the map, not in code) and `hunterReleaseSec: '10–20'` (no constant of that shape exists; the only related constant is `GRACE_PERIOD_TIME = 30`, `Match.luau:25`). Neither is disproved, but neither is traceable to `game.ts`'s stated provenance, so both are soft Rule-9 exposures rather than proven errors.

---

## The single most important thing

**The site's headline player count is wrong: every page, the title tag, the FAQ, the press fact sheet and `/llms.txt` say "up to 7 per server (4–6 Scrappers + 1 Hunter)", but the live Roblox listing for that exact place reports `maxPlayers: 6` and the game's own config comments say "max match size (6) … 1 Hunter + up to 5 Scrappers" — so the site overstates its own server size on every surface it has.**
