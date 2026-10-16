/**
 * Single source of truth for every link, handle, and brand string on the site.
 * Change it here and it propagates everywhere (header, footer, JSON-LD, press kit).
 * Game numbers live in src/data/game.ts — not here.
 */
export const SITE = {
  name: 'Beanie Studios',
  title: 'STATIC: Salvage vs Hunter — 4-7 Player Roblox Horror',
  description:
    'Free co-op Roblox horror for 4-7 players. One is Jingles the Hunter; the rest haul 400 kg of scrap, run the crushers and get 60 seconds to escape.',
  url: 'https://beaniestudio.site',
  locale: 'en_US',
  /** Public beta launch (date only; drives the day countdown + copy). */
  launchDate: '2026-10-10',
  /** General contact (players, partners). Forwarded by Cloudflare Email Routing. */
  contact: 'hello@beaniestudio.site',
  /** Press, creators and media requests. */
  press: 'press@beaniestudio.site',
} as const;

/**
 * Licensing metadata for every ImageObject we publish (the screenshot gallery
 * and the map page). Google Images uses these to render the "Licensable" badge
 * and they are a documented Search Console requirement — the coverage report
 * flagged 170 images missing copyrightNotice / license / creditText and 90
 * missing acquireLicensePage.
 *
 * The terms themselves are the ones already published on /press/: press assets
 * are free to use for coverage. This states that in machine-readable form, it
 * does not invent a licence we have not granted.
 */
export const IMAGE_LICENSE = {
  /** Shown alongside the image. Year is resolved at build time so it cannot rot. */
  copyrightNotice: `© ${new Date().getFullYear()} ${SITE.name}`,
  /** Who to credit when the image is reused. */
  creditText: SITE.name,
  /** Where the usage terms are stated. */
  license: new URL('/press/', SITE.url).href,
  /** Where a licence can be obtained — free for coverage, so the same page. */
  acquireLicensePage: new URL('/press/', SITE.url).href,
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
