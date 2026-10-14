/**
 * Video registry — real uploads from @official_beaniestudios (channel UC9kfYF5VWu5ZEZdMfkWOa1w).
 *
 * These are YouTube SHORTS: every clip is 6–18 seconds. That matters, and it was
 * not known when per-video watch pages were first built here — 7 pages of ~300
 * words each around a 6-second clip is exactly the thin/doorway pattern Google
 * rejects, and they measured as the thinnest pages on the site. They were retired
 * in favour of the single /videos/ hub (see _redirects).
 *
 * `slug` is therefore no longer a live URL segment. It is kept only as the record
 * of the retired URL that _redirects must keep 301ing.
 *
 * `durationSec` is the real length from YouTube's player response, not an
 * estimate. VideoObject.duration is a documented Google field and it must be ISO
 * 8601, which is what isoDuration() is for.
 *
 * Thumbnails are self-hosted at /yt/<id>.jpg. To add a video: drop its thumbnail
 * at public/yt/<id>.jpg, add an entry with its real duration, and add its
 * dimensions to THUMB_DIMS. Notes describe only what the video is — never game
 * mechanics (those live in data/game.ts).
 */
import { LINKS } from '../site.config';

export interface SiteVideo {
  /** YouTube video ID. */
  id: string;
  /** Retired URL segment, kept so _redirects can 301 it. Not a live route. */
  slug: string;
  /** Cleaned public title (hashtag spam stripped). */
  title: string;
  /** One-line context note shown on cards. */
  note: string;
  /** ISO publish date (from the channel RSS feed). */
  date: string;
  /** Real clip length in seconds, read from YouTube. */
  durationSec: number;
  /** Card tag. Tag styling is reserved for signal amber. */
  tag: 'STATIC' | 'DEVLOG' | 'GAMEPLAY' | 'COMMUNITY';
}

export const FEATURED_VIDEO: SiteVideo = {
  id: '7mjWe7s1jFE',
  slug: 'dont-trust-your-friend-in-this-game',
  title: "Don't trust your friend in this game",
  note: 'STATIC gameplay: a crew of Scrappers, one Hunter, and nobody watching your back.',
  date: '2026-09-07',
  durationSec: 12,
  tag: 'STATIC',
};

/** Newest first. */
export const VIDEOS: SiteVideo[] = [
  FEATURED_VIDEO,
  {
    id: 'YqXT145afBA',
    slug: 'dont-trust-your-friends-in-this-game',
    title: "Don't trust your friends in this game",
    note: 'Playtest footage from inside the bunker.',
    date: '2026-09-04',
    durationSec: 17,
    tag: 'STATIC',
  },
  {
    id: 'PJdjuL2hKWs',
    slug: 'we-picked-the-worst-place-to-hide',
    title: 'We picked the WORST place to hide',
    note: 'A hiding spot that did not work out.',
    date: '2026-09-01',
    durationSec: 15,
    tag: 'GAMEPLAY',
  },
  {
    id: 'ZnU8pAC6uJ8',
    slug: 'the-start-of-your-worst-nightmare',
    title: 'The start of your worst nightmare',
    note: 'Early footage. Headphones recommended.',
    date: '2026-08-23',
    durationSec: 16,
    tag: 'STATIC',
  },
  {
    id: '9nR4wjaOpMs',
    slug: 'making-a-150k-roblox-menu',
    title: 'Making a $150K Roblox Menu',
    note: 'Devlog: building the game’s menu UI.',
    date: '2026-09-05',
    durationSec: 6,
    tag: 'DEVLOG',
  },
  {
    id: 'q01DyGE1ggw',
    slug: 'that-one-friend-who-leaves-you-in-the-dark',
    title: 'That one friend who leaves you in the dark',
    note: 'Community clip.',
    date: '2026-08-23',
    durationSec: 11,
    tag: 'COMMUNITY',
  },
  {
    id: 'DSP8Kr5EXeQ',
    slug: 'can-ai-make-a-scary-roblox-game',
    title: 'Can AI make a scary Roblox game?',
    note: 'Devlog: what AI tools can and can’t do for a Roblox horror game.',
    date: '2026-08-10',
    durationSec: 18,
    tag: 'DEVLOG',
  },
];

/** Play page strip — different picks from the home grid. */
export const PLAY_VIDEOS: SiteVideo[] = [VIDEOS[3], VIDEOS[4], VIDEOS[5], VIDEOS[2]];

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Privacy-mode embed, no params. Used by VideoObject.embedUrl and the facades. */
export function embedUrlPlain(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/** Click-to-load embed for listing-page facades — plays once the visitor asks. */
export function embedUrl(id: string): string {
  return `${embedUrlPlain(id)}?autoplay=1&rel=0`;
}

export function thumbUrl(id: string): string {
  return `/yt/${id}.jpg`;
}

/** Seconds → ISO 8601 duration, which is what schema.org VideoObject requires. */
export function isoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m ? `${m}M` : ''}${s}S`;
}

/**
 * True pixel size of each self-hosted /yt/<id>.jpg, measured from the files.
 *
 * Do not assume 1280×720: YouTube does not always serve a maxresdefault, and one
 * of these clips only has a 4:3 640×480 frame. Every consumer (intrinsic size on
 * the <img>) reads it from here, so the numbers can never disagree with the bytes
 * we actually ship.
 */
const THUMB_DIMS: Record<string, { w: number; h: number }> = {
  '7mjWe7s1jFE': { w: 862, h: 486 },
  'YqXT145afBA': { w: 862, h: 486 },
  'PJdjuL2hKWs': { w: 640, h: 480 },
  'ZnU8pAC6uJ8': { w: 862, h: 486 },
  '9nR4wjaOpMs': { w: 862, h: 486 },
  'q01DyGE1ggw': { w: 862, h: 486 },
  'DSP8Kr5EXeQ': { w: 862, h: 486 },
};

export function thumbDims(id: string): { w: number; h: number } {
  const d = THUMB_DIMS[id];
  if (!d) throw new Error(`videos: ${id} has no thumbnail dimensions — measure yt/${id}.jpg and add it`);
  return d;
}

export const CHANNEL_URL = LINKS.youtube;
