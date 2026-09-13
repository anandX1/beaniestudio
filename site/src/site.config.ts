/**
 * Single source of truth for every link, handle, and brand string on the site.
 * Change it here and it propagates everywhere (header, footer, JSON-LD, press kit).
 */
export const SITE = {
  name: 'Beanie Studio',
  title: 'STATIC: Salvage vs Hunter — Roblox',
  description:
    'STATIC is a free 5v1 horror game for Roblox. Five Scrappers salvage fuel while one Hunter hunts them by sound alone. No radar. No minimap. Only ears. Q4 2026.',
  url: 'https://beaniestudio.site',
  locale: 'en_US',
  /** Targeted launch window (drives countdown + copy). */
  launchDate: '2026-12-01T00:00:00Z',
  contact: 'anand@picfomo.com',
  /** Pre-launch playtest night (drives /playtest countdown). Update per event. */
  playtestDate: '2026-09-20T18:00:00Z',
} as const;

export const LINKS = {
  discord: 'https://discord.gg/z8kPT6cRbG',
  roblox: 'https://www.roblox.com/communities/1108819917/Beanies-studios',
  x: 'https://x.com/BeanieStudiosHQ',
  instagram: 'https://www.instagram.com/official_beaniestudios/',
  youtube: 'https://youtube.com/@official_beaniestudios',
} as const;

export const CHANNELS = [
  { name: 'Discord', handle: 'discord.gg/z8kPT6cRbG', url: LINKS.discord, note: 'Be first in when doors open' },
  { name: 'Roblox', handle: 'Beanie’s Studios community', url: LINKS.roblox, note: 'Follow now, play the second it’s live' },
  { name: 'YouTube', handle: '@official_beaniestudios', url: LINKS.youtube, note: 'Devlogs and gameplay clips' },
  { name: 'Instagram', handle: '@official_beaniestudios', url: LINKS.instagram, note: 'Concept art and behind the scenes' },
  { name: 'X', handle: '@BeanieStudiosHQ', url: LINKS.x, note: 'Fastest updates, shortest posts' },
] as const;
