/**
 * Video registry — real uploads from @official_beaniestudios (channel UC9kfYF5VWu5ZEZdMfkWOa1w).
 * Thumbnails are self-hosted at /yt/<id>.jpg (downloaded at build-authoring time from i.ytimg.com,
 * 1280×720). To add a video: drop its maxresdefault.jpg at public/yt/<id>.jpg and add an entry.
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
  /** Curio-board tag. Tag styling is reserved for signal amber. */
  tag: 'STATIC' | 'DEVLOG' | 'GAMEPLAY' | 'COMMUNITY';
}

export const FEATURED_VIDEO: SiteVideo = {
  id: '7mjWe7s1jFE',
  title: "Don't trust your friend in this game",
  note: 'The core hook in thirty seconds — one of you is not coming back.',
  date: '2026-09-07',
  tag: 'STATIC',
};

/** Home page transmissions grid (newest first). */
export const VIDEOS: SiteVideo[] = [
  FEATURED_VIDEO,
  {
    id: '9nR4wjaOpMs',
    title: 'Making a $150K Roblox Menu',
    note: 'Devlog: how the facility UI gets built to feel like a terminal.',
    date: '2026-09-05',
    tag: 'DEVLOG',
  },
  {
    id: 'YqXT145afBA',
    title: "Don't trust your friends in this game",
    note: 'STATIC playtest — sprint once and the whole wreck hears it.',
    date: '2026-09-04',
    tag: 'STATIC',
  },
  {
    id: 'PJdjuL2hKWs',
    title: 'We picked the WORST place to hide',
    note: 'Hide-and-seek gone wrong, exactly as designed.',
    date: '2026-09-01',
    tag: 'GAMEPLAY',
  },
  {
    id: 'ZnU8pAC6uJ8',
    title: 'The start of your worst nightmare',
    note: 'First contact with the wreck. Headphones recommended.',
    date: '2026-08-23',
    tag: 'STATIC',
  },
  {
    id: 'q01DyGE1ggw',
    title: 'That one friend who leaves you in the dark',
    note: 'Community clip — the betrayal genre writes itself.',
    date: '2026-08-23',
    tag: 'COMMUNITY',
  },
  {
    id: 'DSP8Kr5EXeQ',
    title: 'Can AI make a scary Roblox game?',
    note: 'Devlog: where the tools help, and where they make slop.',
    date: '2026-08-10',
    tag: 'DEVLOG',
  },
];

/** Play page strip — gameplay-heavy picks, deliberately different order from home. */
export const PLAY_VIDEOS: SiteVideo[] = [
  VIDEOS[3], // worst place to hide
  VIDEOS[4], // worst nightmare
  VIDEOS[5], // leaves you in the dark
  VIDEOS[6], // can AI make a scary game
];

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
