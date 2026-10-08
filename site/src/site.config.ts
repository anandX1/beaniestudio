/**
 * Single source of truth for every link, handle, and brand string on the site.
 * Change it here and it propagates everywhere (header, footer, JSON-LD, press kit).
 * Game numbers live in src/data/game.ts — not here.
 */
export const SITE = {
  name: 'Beanie Studios',
  title: 'STATIC — Free Roblox Horror Game | Beanie Studios',
  description:
    'STATIC is a free co-op horror game on Roblox. Up to 6 players haul 400 kg of scrap to the crushers while Jingles, a player-controlled jester, hunts them.',
  url: 'https://beaniestudio.site',
  locale: 'en_US',
  /** Public beta launch (date only; drives the day countdown + copy). */
  launchDate: '2026-10-10',
  /** Public press/contact address. Forwarded by Cloudflare Email Routing. */
  contact: 'press@beaniestudio.site',
} as const;

export const LINKS = {
  /** The playable game page — every PLAY button points here. */
  game: 'https://www.roblox.com/games/80261274887781/STATIC',
  discord: 'https://discord.gg/z8kPT6cRbG',
  roblox: 'https://www.roblox.com/communities/1108819917/Beanies-studios',
  x: 'https://x.com/BeanieStudiosHQ',
  instagram: 'https://www.instagram.com/official_beaniestudios/',
  youtube: 'https://youtube.com/@official_beaniestudios',
  wikidataStudio: 'https://www.wikidata.org/wiki/Q141511863',
  wikidataGame: 'https://www.wikidata.org/wiki/Q141512786',
} as const;

export const CHANNELS = [
  { name: 'Discord', handle: 'discord.gg/z8kPT6cRbG', url: LINKS.discord, note: 'Find a squad, report bugs, vote on updates' },
  { name: 'Roblox group', handle: 'Beanie’s Studios', url: LINKS.roblox, note: 'Join for update pings on Roblox' },
  { name: 'YouTube', handle: '@official_beaniestudios', url: LINKS.youtube, note: 'Gameplay Shorts and devlogs' },
  { name: 'Instagram', handle: '@official_beaniestudios', url: LINKS.instagram, note: 'Concept art and behind the scenes' },
  { name: 'X', handle: '@BeanieStudiosHQ', url: LINKS.x, note: 'Short update posts' },
] as const;
