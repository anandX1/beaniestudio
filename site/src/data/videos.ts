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
    title: "Don't trust your friends in this game",
    note: 'Playtest footage from inside the bunker.',
    date: '2026-09-04',
    tag: 'STATIC',
  },
  {
    id: 'PJdjuL2hKWs',
    title: 'We picked the WORST place to hide',
    note: 'A hiding spot that did not work out.',
    date: '2026-09-01',
    tag: 'GAMEPLAY',
  },
  {
    id: 'ZnU8pAC6uJ8',
    title: 'The start of your worst nightmare',
    note: 'Early footage. Headphones recommended.',
    date: '2026-08-23',
    tag: 'STATIC',
  },
  {
    id: '9nR4wjaOpMs',
    title: 'Making a $150K Roblox Menu',
    note: 'Devlog: building the game’s menu UI.',
    date: '2026-09-05',
    tag: 'DEVLOG',
  },
  {
    id: 'q01DyGE1ggw',
    title: 'That one friend who leaves you in the dark',
    note: 'Community clip.',
    date: '2026-08-23',
    tag: 'COMMUNITY',
  },
  {
    id: 'DSP8Kr5EXeQ',
    title: 'Can AI make a scary Roblox game?',
    note: 'Devlog: what AI tools can and can’t do for a Roblox horror game.',
    date: '2026-08-10',
    tag: 'DEVLOG',
  },
];

/** Play page strip — different picks from the home grid. */
export const PLAY_VIDEOS: SiteVideo[] = [VIDEOS[3], VIDEOS[4], VIDEOS[5], VIDEOS[2]];

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function embedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
}

export function thumbUrl(id: string): string {
  return `/yt/${id}.jpg`;
}

export const CHANNEL_URL = LINKS.youtube;
