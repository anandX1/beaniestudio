# WIKIDATA-DRAFT — create the STATIC entity (30 min, do it once)

> Why: Wikidata is the knowledge graph AI engines (ChatGPT, Perplexity, Google's
> Knowledge Graph) pull entity facts from. Having a verified item for STATIC and
> Beanie Studio means engines can *know* what the game is before any Wikipedia
> notability exists. All Q-IDs below were verified against the live Wikidata API
> on 2026-09-21. Wikidata has NO notability requirement (unlike Wikipedia) —
> verifiability is enough.

---

## PART 0 — one-time setup (2 min)

1. Log in to **wikidata.org** (top-right → *Log in* → *Create account* if needed).
   Use any account name you like.
2. Go to **Preferences → Editing** and set **Media type: all / Page length limit:
   50** (this shows the "Publish changes" box bigger — optional but comfortable).
3. Keep this doc open in a second window; you'll copy-paste from it.

---

## PART 1 — create the Beanie Studio item first (the game references it)

### 1a. Create the item
- Left sidebar (or [wikidata.org/wiki/Special:NewItem](https://www.wikidata.org/wiki/Special:NewItem))
  → **Create a new item**
- It asks for a label in one language first: paste

**Label (en):**
```
Beanie Studio
```
**Description (en):**
```
independent video game development studio
```
**Aliases (en)** — add one per line:
```
Beanie Studios
beanie studio games
```
→ Click **Create**. You are now on the new item page (e.g. `wikidata.org/wiki/Q123456789`).

### 1b. Add statements (on the item page, click **+ add statement** for each)

| # | Property (type this in the property box) | Value (type, pick the suggestion) |
|---|---|---|
| 1 | `instance of` | `video game developer` → pick **Q210167** |
| 2 | `official website` | `https://beaniestudio.site` |

After each statement click **publish**. Done — the studio item is complete.

### 1c. Note the Q-ID
Copy the item's Q-ID from the page title (like **Q123456789**) — you need it in
Part 2, row 3 and 4. Write it here when you have it:

```
Beanie Studio = Q____________
```

---

## PART 2 — create the STATIC game item

### 2a. Create the item
**[Special:NewItem](https://www.wikidata.org/wiki/Special:NewItem)** → paste:

**Label (en):**
```
STATIC: Salvage vs Hunter
```
**Description (en):**
```
upcoming 5v1 survival horror game on the Roblox platform
```
**Aliases (en)** — one per line:
```
STATIC
STATIC Roblox
STATIC Salvage vs Hunter game
Salvage vs Hunter
```
→ **Create**.

### 2b. Add statements (in this order)

| # | Property | Value to search & pick |
|---|---|---|
| 1 | `instance of` | `Roblox experience` → pick **Q113574332** |
| 2 | `genre` | `survival horror` → pick **Q333967** |
| 3 | `developer` | `Beanie Studio` → **the Q-ID you created in Part 1** |
| 4 | `publisher` | `Beanie Studio` → same Q-ID |
| 5 | `platform` | `Roblox` → pick **Q692989** |
| 6 | `language of work or name` | `English` → pick **Q1860** |
| 7 | `official website` | `https://beaniestudio.site` |
| 8 | `described at URL` | your Roblox game page URL, e.g. `https://www.roblox.com/games/XXXXXXXX/STATIC-Salvage-vs-Hunter` (grab the exact URL from the Roblox creator dashboard) |

Notes:
- **No publication date** — the game is unreleased; adding a guessed date is worse
  than omitting. When launch happens, add `publication date` (`P577`).
- **No image (P18)** — Commons requires a free license; game screenshots don't
  qualify. Skip it.
- If a property suggestion doesn't appear, type the Q-ID number directly (e.g.
  paste `Q113574332`) — the box accepts raw IDs.

### 2c. Note the game's Q-ID

```
STATIC: Salvage vs Hunter = Q____________
```

### 2d. Add one reference to the instance-of statement (keeps it bulletproof)
Open statement 1 → click **edit** → **+ add reference** → property `reference URL`
→ value: `https://beaniestudio.site/` → **publish**. (One source on one statement
is enough for a new item; more can be added later.)

---

## PART 3 — tell me the two Q-IDs (30 seconds)

Paste them in chat like: `studio = Q…, game = Q…`

I will then:
1. Add `"sameAs": ["https://www.wikidata.org/wiki/Q…"]` to the site's JSON-LD
   (Organization + VideoGame) — this machine-ties the site to the entity.
2. Ping IndexNow so the connection is crawled.
3. Verify the site still audits clean.

---

## PART 4 — after both items exist (optional, later)

- **Item hygiene**: if anything looks wrong, every statement is editable — no
  mistakes are permanent.
- **When the game launches**: add `publication date`, update the description
  (drop "upcoming"), and add the Discord URL as `official website` qualifier is
  NOT needed — one website property stays.
- **When a blog covers STATIC**: add that article as another `reference URL` on
  `instance of` / `developer` — references compound over time.

*Draft prepared 2026-09-21 · all referenced Q-IDs verified live via the Wikidata
API (wbsearchentities) the same day.*
