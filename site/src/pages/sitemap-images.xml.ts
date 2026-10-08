/**
 * Image sitemap — tells Google Images which page each screenshot lives on.
 * Original game screenshots are the one thing no other site has; this is
 * how they rank for "static roblox map", "static roblox jingles" etc.
 */
import { SITE } from '../site.config';
import { SHOTS, shot } from '../data/media';
import { ROOM_INFO } from '../data/rooms';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PAGES: { path: string; ids: string[] }[] = [
  { path: '/', ids: ['central-room-globe', 'storage-bay', 'crusher-console', 'result-escaped', ...ROOM_INFO.map((r) => r.shots[0]), 'jingles-closeup', 'jingles-red', 'jingles-medbay', 'worm-render', 'pod-active', 'result-consumed', 'result-prey-slain', 'result-defeated', 'cargo-dock-shuttle', 'control-room-hologram'] },
  { path: '/screenshots/', ids: SHOTS.map((s) => s.id) },
  { path: '/guide/map/', ids: ['map-topdown', ...ROOM_INFO.flatMap((r) => [...r.shots, ...SHOTS.filter((s) => s.room === r.name).map((s) => s.id)]), ...SHOTS.filter((s) => s.group === 'hallway').map((s) => s.id), 'lobby', 'hunter-reveal'] },
  { path: '/guide/', ids: ['lobby', 'hunter-reveal', 'hud-mobile', 'cargo-dock-shuttle'] },
  { path: '/guide/jingles/', ids: ['jingles-closeup', 'jingles-red', 'jingles-medbay', 'jingles-player'] },
  { path: '/guide/worm/', ids: ['worm-render', 'worm-ingame'] },
  { path: '/guide/capture-and-rescue/', ids: ['pod-active', 'pod-idle'] },
  { path: '/guide/crushers/', ids: ['crusher-console', 'result-escaped'] },
  { path: '/guide/scrap/', ids: ['storage-bay'] },
  { path: '/press/', ids: SHOTS.filter((s) => s.press).map((s) => s.id) },
];

export function GET() {
  const urls = PAGES.map((p) => {
    const imgs = [...new Set(p.ids)]
      .map((id) => `    <image:image><image:loc>${esc(new URL(shot(id).full, SITE.url).href)}</image:loc></image:image>`)
      .join('\n');
    return `  <url>\n    <loc>${esc(new URL(p.path, SITE.url).href)}</loc>\n${imgs}\n  </url>`;
  }).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
