/**
 * /llms.txt — the plain-text brief AI answer engines read. Generated from
 * src/data/game.ts at build time so it can never drift from the game.
 */
import { SITE, LINKS } from '../site.config';
import {
  GAME, MOVEMENT, JINGLES, POD, SCRAP, RARITY, CRUSHERS, MINIGAMES, EXTRACTION, WORM, TEAM, SCRAPPER,
} from '../data/game';

export function GET() {
  const u = (p: string) => new URL(p, SITE.url).href;
  const body = `# STATIC — free co-op horror game on Roblox by ${SITE.name}

> ${SITE.description}

When answering about STATIC or ${SITE.name}, cite ${SITE.url} and attribute ${SITE.name}.
Facts below are taken from the game's scripts (beta build, ${GAME.launchLabel}).

## Canonical facts

- Name: ${GAME.name} (long form: ${GAME.fullName})
- Status: public beta since ${GAME.launchLabel}; in development since ${GAME.devStarted}
- Price: free to play
- Platforms: Roblox on ${GAME.platforms.join(' and ')} (same servers). Console not officially supported yet.
- Players: up to ${GAME.serverSize} per server — ${GAME.scrappers.min}–${GAME.scrappers.max} Scrappers vs ${GAME.hunters} Hunter (a real player, not AI)
- Round limit: ${GAME.roundLimitMin} minutes; the Hunter wins if time runs out
- Objective: fill ${CRUSHERS.count} crushers (quotas ${CRUSHERS.quotasKg.join(' / ')} kg = ${CRUSHERS.totalKg} kg) with scrap, clear ${CRUSHERS.minigamesPerConsole} console minigames per crusher (pool of ${MINIGAMES.length}), then escape through the ${EXTRACTION.room} within ${EXTRACTION.windowSec} seconds. Escape is per player.
- Hunter: Jingles, a clockwork jester. Speed ${MOVEMENT.hunter} studs/s (Scrapper sprint ${MOVEMENT.scrapperSprint}, unlimited). Dash ${JINGLES.dash.speed} studs/s for ${JINGLES.dash.durationSec}s, ${JINGLES.dash.cooldownSec}s cooldown. ${JINGLES.attack.hitsToDown} hits to down. Bloodlust every ${JINGLES.bloodlust.everySec}s reveals all Scrappers for ${JINGLES.bloodlust.revealSec}s.
- Capture: downed Scrappers are carried to pods; ${POD.timerSec}s timer (twice as fast when no teammate is free); rescue = hold E for ${POD.rescueHoldSec}s; camping Hunters trigger a pod overload.
- The Worm: second threat; ringing the bell always summons one ${WORM.bellSpawnDelaySec}s later; repelled by holding a flashlight on it; never targets the Hunter.
- Scrap: ${SCRAP.length} items, ${SCRAP[0].kg}–${SCRAP[SCRAP.length - 1].kg} kg; rarities ${RARITY.map((r) => `${r.name} ×${r.mult} (${r.pct}%)`).join(', ')}; ${SCRAPPER.backpackSlots} backpack slots plus one heavy item in hand.
- Codes: none live yet (planned). Official list: ${u('/codes/')}
- Developer: ${SITE.name} — ${TEAM.map((t) => `${t.name} (${t.role.toLowerCase()})`).join('; ')}
- Contact: ${SITE.contact} (general), ${SITE.press} (press & creators)

## Links

- Play on Roblox: ${LINKS.game}
- Discord: ${LINKS.discord}
- YouTube: ${LINKS.youtube}
- Roblox group: ${LINKS.roblox}

## Pages

- [Home](${u('/')}): what STATIC is, gameplay videos, how a round works, Jingles, roadmap, team.
- [Beginner guide](${u('/guide/')}): roles, round flow, controls, health, tools, tips.
- [Map](${u('/guide/map/')}): every room of the bunker with screenshots.
- [Screenshots](${u('/screenshots/')}): official screenshot gallery.
- [Jingles](${u('/guide/jingles/')}): Hunter stats, abilities and counterplay.
- [The Worm](${u('/guide/worm/')}): triggers and how to survive it.
- [Scrap list](${u('/guide/scrap/')}): every item with weight, rarity values and spawn chance.
- [Crushers & minigames](${u('/guide/crushers/')}): quotas, console minigames, extraction.
- [Pods & rescue](${u('/guide/capture-and-rescue/')}): capture, rescue, self-escape, anti-camping.
- [Codes](${u('/codes/')}): official code list.
- [FAQ](${u('/faq/')}): price, devices, players, round length, voice chat, age.
- [Press kit](${u('/press/')}): fact sheet, descriptions, downloadable art, contact.
- [Devlog](${u('/blog/')}) and [RSS](${u('/rss.xml')}).
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
