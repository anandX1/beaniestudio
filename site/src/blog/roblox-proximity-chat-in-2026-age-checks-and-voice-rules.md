---
title: 'Roblox Proximity Chat in 2026: Age Checks and Voice Rules'
description: 'How Roblox proximity chat works in 2026: the global age-check rule, who can talk to whom, the social-link crackdown, and what it means for voice-first games.'
pubDate: 2026-10-07
tag: systems
draft: false
---

## The short version

Roblox proximity chat is voice chat that gets louder as players get closer to each other in a game. In 2026 it comes with a rule that changed the whole platform: every player who wants to chat — voice or text — has to pass an age check first. The requirement went global on January 7, 2026, and it reshaped who can talk, who can hear whom, and how developers build social games. This post explains exactly how it works today, in plain words, from a studio building a voice-first horror game on the platform.

## What proximity chat actually is on Roblox

Roblox's engine supports spatial voice — audio anchored to a point in 3D space. Walk toward a player and their voice gets louder; walk away and it fades. Text chat, by contrast, reaches everyone in the server unless a developer filters it. Most games that advertise proximity chat use the spatial VoiceChat API: the mic signal is positioned in the world, so a conversation only makes sense if you physically stand near the person having it.

The effect is strongest in horror. Distance creates tension — you hear someone breathing three corridors away, and you do not know if they are friend or Hunter. That is not an accident. Our game STATIC is built around it.

## The January 2026 age-check rule, without the jargon

Roblox announced "Age Check to Chat" on the [DevForum](https://devforum.roblox.com/t/age-check-requirement-to-chat-now-live-globally/4226101) on January 7, 2026, and rolled it out to every region where chat is available within about a week. Australia, New Zealand and the Netherlands had required it since early December 2025, and by the end of December more than half of daily users there had completed it. Roblox reported tens of millions of daily active users age-checked across the platform within weeks.

Roblox age verification comes in two forms: upload an ID, or use the camera-based Facial Age Estimation. Roblox states the facial images and videos are deleted immediately after the check completes, not stored. Voice chat specifically requires a verified 13+ account; younger accounts can still use text inside their bracket.

## Who can talk to whom now

This is the part players discover by accident mid-game. Chat is sorted into age groups:

- Kids under 9 need parental consent for any chat at all.
- Players 9–12 can chat with under-9s and with 13–15s, but nobody older.
- Older brackets connect to the groups directly above and below them.
- Adults cannot chat with children under 16, full stop.

"Trusted Connections" is the exception: a verified 13+ player can link with people they actually know and chat across brackets with them.

For developers this creates a matchmaking wrinkle: two players standing next to each other may not be able to hear each other because they sit in different brackets. Roblox shipped a Text Chat matchmaking signal you can weight so chat-eligible players get grouped together. We turned that on in our playtest servers after finding out the hard way that a five-player squad could sometimes only hear three of itself.

## The February 2026 social-link crackdown

If you run a game community, this section saves you a real headache. From February 23, 2026, social media links on game pages, communities and profiles are only visible to age-checked 13+ users. More importantly, creators can no longer post social links *inside* a game — the endpoint that served "join our Discord" links in-experience now returns nothing.

What is still allowed is pointing players to your game's page: "our community links live on the game page" is fine; typing an invite code in-experience is not. We rebuilt our funnel the week this shipped. In STATIC, the exit screen says to check the game's page, and the [Discord link](https://beaniestudio.site/play/) lives there, where it is allowed and age-gated.

## How to enable voice chat on Roblox (and why it may be missing)

A quick triage, because this became one of the most common questions of 2026:

1. Age: voice chat needs a verified 13+ account. ID or Facial Age Estimation both count.
2. Opt-in: voice is not automatic. Check settings → privacy → enable the voice feature, and give the app microphone permission.
3. Bracket mismatch: if you can use voice but one specific player is silent, they may be in a different age group or unverified. The system is working as designed.
4. Region and device: voice rolls out per region, and some managed or older devices hide the feature entirely.

The long version of every fix lives in our voice chat troubleshooting guide.



<!-- photo slot: attach an image in Studio to fill this spot -->



## Why a horror studio cares this much

STATIC is a 5v1 horror game where voice is gameplay. Scrappers coordinate by proximity voice while the Hunter hunts; screaming into your mic when you get caught is not a bug, it is the content. The 2026 rules genuinely helped us: verified 13+ players skew older, chat-eligible matchmaking keeps our squads audible, and the bracket system cut the random-troll problem that ruined our first playtest nights.

The trade-off is onboarding friction. Every new playtester passes an age check before their mic works, so our instructions now start with "do the age check first, then the game." It costs a few players at the door and saves ten times that in the lobby.

If you want to hear proximity voice used as a horror mechanic, [STATIC is free on Roblox](https://beaniestudio.site/play/) and playtests run weekly — the age check is the price of admission, and the screams are the point.

## Where Roblox voice is heading next

The March 2026 follow-up posts added read-only moderation chat for verified 18+ community members, promised clearer indicators showing who you can talk to, and confirmed the direction: more communication surfaces gated behind verification, not fewer. For players, a safer chat floor. For developers, one more checkbox in onboarding — and, if your game uses voice as a mechanic like ours, a reason to walk every new player through verification in their first five minutes.

Age checks were the story of 2026 on Roblox. Proximity voice is where the rules, the matchmaking and the gameplay all touch at once — which is exactly why we pay attention to every update.

<!-- studio-keywords: roblox proximity chat | roblox voice chat | how to enable voice chat on roblox | roblox age verification | roblox spatial voice -->
