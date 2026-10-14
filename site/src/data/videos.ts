/**
 * Video registry — real uploads from @official_beaniestudios (channel UC9kfYF5VWu5ZEZdMfkWOa1w).
 * Thumbnails are self-hosted at /yt/<id>.jpg (downloaded at build-authoring time from i.ytimg.com,
 * 1280×720). To add a video: drop its maxresdefault.jpg at public/yt/<id>.jpg and add an entry.
 * Notes describe only what the video is — never game mechanics (those live in data/game.ts).
 */
import { LINKS } from '../site.config';

export interface SiteVideo {
  /** YouTube video ID. */
  id: string;
  /**
   * Permanent URL segment for the /videos/<slug>/ watch page. Once a watch page
   * is indexed this must never change — treat it like the /media/* filenames.
   */
  slug: string;
  /** Cleaned public title (hashtag spam stripped). */
  title: string;
  /** One-line context note shown on cards. */
  note: string;
  /** ISO publish date (from the channel RSS feed). */
  date: string;
  /** Card tag. Tag styling is reserved for signal amber. */
  tag: 'STATIC' | 'DEVLOG' | 'GAMEPLAY' | 'COMMUNITY';
}

export const FEATURED_VIDEO: SiteVideo = {
  id: '7mjWe7s1jFE',
  slug: 'dont-trust-your-friend-in-this-game',
  title: "Don't trust your friend in this game",
  note: 'STATIC gameplay: a crew of Scrappers, one Hunter, and nobody watching your back.',
  date: '2026-09-07',
  tag: 'STATIC',
};

/** Home page grid (newest first). */
export const VIDEOS: SiteVideo[] = [
  FEATURED_VIDEO,
  {
    id: 'YqXT145afBA',
    slug: 'dont-trust-your-friends-in-this-game',
    title: "Don't trust your friends in this game",
    note: 'Playtest footage from inside the bunker.',
    date: '2026-09-04',
    tag: 'STATIC',
  },
  {
    id: 'PJdjuL2hKWs',
    slug: 'we-picked-the-worst-place-to-hide',
    title: 'We picked the WORST place to hide',
    note: 'A hiding spot that did not work out.',
    date: '2026-09-01',
    tag: 'GAMEPLAY',
  },
  {
    id: 'ZnU8pAC6uJ8',
    slug: 'the-start-of-your-worst-nightmare',
    title: 'The start of your worst nightmare',
    note: 'Early footage. Headphones recommended.',
    date: '2026-08-23',
    tag: 'STATIC',
  },
  {
    id: '9nR4wjaOpMs',
    slug: 'making-a-150k-roblox-menu',
    title: 'Making a $150K Roblox Menu',
    note: 'Devlog: building the game’s menu UI.',
    date: '2026-09-05',
    tag: 'DEVLOG',
  },
  {
    id: 'q01DyGE1ggw',
    slug: 'that-one-friend-who-leaves-you-in-the-dark',
    title: 'That one friend who leaves you in the dark',
    note: 'Community clip.',
    date: '2026-08-23',
    tag: 'COMMUNITY',
  },
  {
    id: 'DSP8Kr5EXeQ',
    slug: 'can-ai-make-a-scary-roblox-game',
    title: 'Can AI make a scary Roblox game?',
    note: 'Devlog: what AI tools can and can’t do for a Roblox horror game.',
    date: '2026-08-10',
    tag: 'DEVLOG',
  },
];

/** Watch-page lookup. Throws on an unknown slug so a bad link fails the build. */
export function videoBySlug(slug: string): SiteVideo {
  const v = VIDEOS.find((x) => x.slug === slug);
  if (!v) throw new Error(`videos: unknown slug "${slug}"`);
  return v;
}

/** Play page strip — different picks from the home grid. */
export const PLAY_VIDEOS: SiteVideo[] = [VIDEOS[3], VIDEOS[4], VIDEOS[5], VIDEOS[2]];

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Param-free privacy-mode embed. This is what goes in the /videos/<slug>/ page
 * HTML and in VideoObject.embedUrl — Google only treats a video as page content
 * when it can see the embed in the served HTML, so this URL must be static.
 * No autoplay: the visitor already chose to be here.
 */
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

/**
 * True pixel size of each self-hosted /yt/<id>.jpg, measured from the files.
 *
 * Do not assume 1280×720: YouTube does not always serve a maxresdefault, and one
 * of these clips only has a 4:3 640×480 frame. Every consumer (intrinsic size on
 * the <img>, og:image:width/height on the watch page) reads it from here, so the
 * numbers can never disagree with the bytes we actually ship.
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
