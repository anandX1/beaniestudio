---
title: 'We Built a Sound-Stealth Hunter. Then We Deleted It.'
description: 'Our Hunter originally hunted entirely by player-made sound. It was our signature mechanic - and we removed it. Here is the honest design postmortem.'
pubDate: 2026-10-01
tag: design
draft: false
updatedDate: 2026-10-01T18:12:35.578Z
---

Every game has one mechanic it is known by. Ours, for most of development, was going to be sound. The original STATIC pitch, the one on our old posters: *the Hunter is blind and hunts entirely by sound*. Sprint and he hears you. Crouch and you vanish. Every footstep a decision. It was elegant, it was ours, and last month we removed it as a core stealth layer. This is the honest postmortem - what the system was, why it failed, and what replaced it (which, plot twist, is most of the same idea used differently).

## What the sound-stealth system was

The first design was pure audio warfare. Every Scrapper action emitted sound the Hunter could genuinely track: walking was a ripple, sprinting a beacon, dropping scrap an invitation. Voice chat was theoretically audible to the Hunter at close range. The Hunter saw darkness and noise; Scrappers saw a normal world. Skill expression was entirely in quietness - the best Scrappers crossed the map like ghosts.

On paper: the most distinctive horror game on Roblox. In playtests: three problems, escalating.



<!-- photo slot: attach an image in Studio to fill this spot -->



## Problem 1: most of our players have phone speakers

Roblox's audience skews mobile - so does ours, hard. The first playtest night on cheap earbuds and laptop speakers taught us something our beautiful design doc had ignored: **audio stealth is a skill only headphone players can perform.** On phone speakers, the direction and distance of sounds collapsed. Players could not hear the Hunter; the Hunter heard everything. It was not harder - it was *unfair by hardware*. We watched a Scrapper crouch-walk perfectly through a corridor, silent to themselves and their squad, while the Hunter walked straight to them. There is no counterplay for "your speakers are bad." Design that depends on hardware quality is not difficulty, it is a lottery.

## Problem 2: silence made the game slower, not tenser

The stealth layer's second-order effect surprised us: Scrappers who feared sound *stopped doing anything*. The optimal strategy became finding one corner and existing there. Our game's economy - salvage the scrap, feed the deposits, escape - requires motion and risk. A system that rewards total stillness is anti-game. The fix seemed obvious: punish camping harder. But that is whack-a-mole balancing - every patch to force motion just made stealth more punishing, which made play *more* timid. The system was fighting the game.

## Problem 3: new players could not learn it

Watch a new player's first sound-stealth round and you will see confusion, not dread: *was that me? did he hear that? was that crouched or standing?* Audio feedback is invisible - there is no HUD clean enough to show someone their own noise in a readable way without drowning the screen in meters. Our best attempt (a noise ripple indicator) helped the players who stared at it and corrupted the horror for everyone else. Twenty minutes in, new players' question was not "where is the Hunter" but "what is even happening." For a game that needs a thriving community, that learning cliff was a threat.

## What we replaced it with: the same idea, as consequence

Here is the twist. We did not delete sound from the design. We moved it from *presence* to *consequence*:

- **Now:** playing normally makes no meaningful sound. The Hunter gains information only when something goes *wrong* - a failed repair minigame, a dropped heavy crate, a triggered alarm, a rescue attempt. Quiet play is safe play, but the objective keeps pulling you into noisy risk.
- Sound became a mistake-feedback system: every alarm means *someone* did something, and both sides know it. Chases are earned by errors, not scheduled by footsteps.
- The Hunter hunts with eyes and patience instead of super-hearing - and, critically, no radar for anyone. Information asymmetry by *skill in reading the map*, not by hardware lottery.

Playtests after the change: rounds got faster, new-player retention jumped, and the best moments survived - a failed calibration in a quiet wing still sends everyone's stomach through the floor, because now the *silence before* is the default state.



<!-- photo slot: attach an image in Studio to fill this spot -->



## What the numbers said

Anecdote is cheap, so we checked the telemetry from the two playtest windows around the change. Average round length dropped noticeably once the stealth layer came out - players who had been freeze-camping were moving again, and salvage completion rates per round rose by roughly a third. Chase initiations per round *increased* - a result we did not predict - because the Hunter now engaged off visible, legible mistakes rather than off sound events players did not understand were being broadcast. Most telling was the first-round survival rate of brand-new players, which climbed sharply after the change; the "what is even happening" confusion was measurably a churn point, not just an anecdote. Small sample, one game, early build - but every signal pointed the same direction, and the Discord's vibe shifted from "am I playing this right?" to "did you see him carry me?". That second question is what a horror community sounds like.

## What we learned (for any dev building audio mechanics)

1. **Design for the worst speakers your audience uses**, not the best headphones in the room. On Roblox, that means phone speakers, full stop.
2. **Stealth needs a visible feedback channel.** Invisible information reads as unfairness, not depth.
3. **Reward systems beat punishment systems.** We spent two patches punishing campers before realizing the game itself should make motion the attractive option.
4. **Killing your signature mechanic is survivable.** The pitch got simpler - "one Hunter, five scavengers, no radar for anyone" - and simpler turned out to be easier to say in a crowded lobby of horror games.

The old system is not entirely gone: fragments of it live in the mistake-noise design and in proximity voice tension. But the blind Hunter is retired, and honestly? The game is better.

Disagree with the call? Tell us in the playtest Discord - balance debates are open and regular. You can also read [why we removed the radar](/blog/why-we-removed-the-radar/), this post's older sibling, or the [full game overview](/play/).

<!-- studio-keywords: roblox sound based horror | roblox horror game design | asymmetrical horror game design | roblox game design lessons -->
