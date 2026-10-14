/**
 * Typed access to the screenshot registry (media.json) and the dimensions
 * the pipeline measured (media-meta.json). Never reference /media/ paths by
 * hand — go through `shot()` so srcsets always match the generated files.
 */
import registry from './media.json';
import meta from './media-meta.json';

export interface Shot {
  id: string;
  src: string;
  alt: string;
  group: 'room' | 'objective' | 'round' | 'hallway' | 'map' | 'jingles' | 'worm' | 'pod' | 'ui';
  room?: string;
  press?: boolean;
  w: number;
  h: number;
  /** Largest generated file — used for lightbox + og:image. */
  full: string;
  srcset: string;
}

const dims = meta as Record<string, { w: number; h: number }>;

function build(raw: (typeof registry.shots)[number]): Shot {
  const d = dims[raw.id];
  if (!d) throw new Error(`media: ${raw.id} has no dimensions — run node scripts/media.mjs`);
  const parts = [`/media/${raw.id}-640.webp 640w`];
  if (d.w > 1280) parts.push(`/media/${raw.id}-1280.webp 1280w`);
  parts.push(`/media/${raw.id}-1920.webp ${Math.min(1920, d.w)}w`);
  return { ...(raw as Omit<Shot, 'w' | 'h' | 'full' | 'srcset'>), w: d.w, h: d.h, full: `/media/${raw.id}-1920.webp`, srcset: parts.join(', ') };
}

export const SHOTS: Shot[] = registry.shots.map(build);
const byId = new Map(SHOTS.map((s) => [s.id, s]));

export function shot(id: string): Shot {
  const s = byId.get(id);
  if (!s) throw new Error(`media: unknown shot "${id}"`);
  return s;
}

/**
 * True pixel size of the largest generated file — the one `Shot.full` points at.
 * media.mjs caps the widest variant at 1920 without upscaling, so this is the
 * source width clamped to 1920, with the height scaled to match. Use it for any
 * declaration that must state real dimensions (og:image:width/height,
 * ImageObject width/height); `Shot.w`/`Shot.h` are the *source* size and would
 * overstate a wide shot.
 */
export function fullDims(s: Shot): { w: number; h: number } {
  const w = Math.min(1920, s.w);
  return { w, h: Math.round((w / s.w) * s.h) };
}

export const shotsBy = (group: Shot['group']) => SHOTS.filter((s) => s.group === group);
export const shotsForRoom = (room: string) => SHOTS.filter((s) => s.room === room);
export const pressJpg = (id: string) => `/media/press/static-${id}.jpg`;
