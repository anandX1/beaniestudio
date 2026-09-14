---
title: 'Why we deleted the radar'
description: 'The Hunter used to have a server-side radar. It was the most technically honest feature in the game — and we cut it anyway. Here is the design math that killed it.'
pubDate: 2026-08-28
tag: design
---

Every asymmetrical horror game lives or dies on the same question: **how does the killer find people?** Too strong and the survivors feel hunted by an aimbot. Too weak and the killer wanders a dead map for ten minutes.

## Where we started

STATIC's first answer was a radar — a server-side only tracker that lit up Scrapper positions for the Hunter. No ESP exploits possible, because the data never left the server until it was meant to. It was fair, it was clean, and it was the feature most technically honest thing we'd built.

It was also the wrong game.

## The problem

Playtests kept surfacing the same three facts:

1. **Radar made the Hunter lazy.** Why listen, corner, or set traps when a blip says "go here"? The skill ceiling of the role collapsed to pathfinding.
2. **Radar made Scrappers paranoid in a boring way.** Not "the Hunter might be near" tension — "the Hunter *knows*, always" resignation.
3. **Chases started too fairly.** Every engagement began with the Hunter already knowing where you were. The most fun moments in playtests — the accidental near-misses, the hiding-under-a-desk sequences — only happened when the radar *failed* to describe reality.

## The new rule: only ears

So we deleted it. In the current build the Hunter has **no radar, no minimap, no tracker of any kind** — and neither do the Scrappers. What both sides have is a sound system: footsteps carry, sprinting rings out, dropping heavy salvage echoes through the whole wreck, and the Hunter's own strides are loud enough that Scrappers can *echolocate the Hunter right back*.

The result is the thing we were chasing all along:

- Sneaking is a *skill*, not a default state.
- The Hunter is a listener and a hunter, not a heat-seeking missile.
- Every panic-sprint is a genuine gamble with the acoustics of the room you're in.

## What it cost

Sound systems are expensive to build honestly. Server-authoritative volume falloff, per-surface footstep audio, a mix tree where the heartbeat can never be masked by ambience — all of that got harder, because sound went from "atmosphere" to "the entire tracking mechanic." The audio blueprint alone is now longer than the design doc for the radar ever was.

We think it's the best decision we've made. The countdown is running. Come hear for yourself when the doors open — [follow the community](https://www.roblox.com/communities/1108819917/Beanies-studios) or [join the Discord](https://discord.gg/z8kPT6cRbG).
