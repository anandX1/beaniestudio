/**
 * /press/static-press-kit.zip — the one-click press bundle, built at build
 * time so the fact sheet inside always matches src/data/game.ts.
 * Store-only ZIP (PNGs are already compressed) written with Node's stdlib.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { SITE, LINKS } from '../../site.config';
import { GAME, CRUSHERS, MINIGAMES, SCRAP, JINGLES, POD, TEAM, EXTRACTION } from '../../data/game';

const ASSETS = ['jingles-render.png', 'static-key-art.png', 'beanie-studios-logo.png', 'beanie-studios-icon.png'];

function factSheet(): string {
  return `STATIC — PRESS FACT SHEET
${SITE.url}/press/

Title:        ${GAME.name} (also: ${GAME.fullName})
Developer:    ${SITE.name} (independent, ${TEAM.length} people)
Platform:     Roblox — ${GAME.platforms.join(', ')}
Release:      Public beta, ${GAME.launchLabel}
Price:        ${GAME.price}
Players:      Up to ${GAME.serverSize} per server (${GAME.scrappers.min}–${GAME.scrappers.max} Scrappers vs ${GAME.hunters} Hunter)
Round length: Up to ${GAME.roundLimitMin} minutes
Genre:        Co-op asymmetrical horror
Play:         ${LINKS.game}
Contact:      ${SITE.contact}

SHORT DESCRIPTION
STATIC is a free co-op horror game on Roblox by ${SITE.name}. Up to ${GAME.scrappers.max} players search an abandoned bunker for scrap and feed ${CRUSHERS.totalKg} kg of it into ${CRUSHERS.count} crushers to open the way out, while one player hunts them as Jingles, a clockwork jester.

KEY FACTS
- ${SCRAP.length} scrap items from ${SCRAP[0].kg} kg to ${SCRAP[SCRAP.length - 1].kg} kg; ${CRUSHERS.count} crushers with a ${CRUSHERS.totalKg} kg combined quota
- ${MINIGAMES.length} console minigames, ${CRUSHERS.minigamesPerConsole} per crusher; two players can share a console
- Jingles: Dash, two-hit attack, Bloodlust reveal every ${JINGLES.bloodlust.everySec} seconds
- Pods: ${POD.timerSec}-second timer, ${POD.rescueHoldSec}-second rescues, anti-camping overload
- The Worm: summoned by noise and the bell, repelled by flashlight
- Escape through the ${EXTRACTION.room} within ${EXTRACTION.windowSec} seconds

TEAM
${TEAM.map((t) => `- ${t.name}: ${t.role}`).join('\n')}

All text and images in this kit are free to use for coverage, videos and streams.
`;
}

function zip(files: { name: string; data: Buffer }[]): Buffer {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  // Fixed DOS timestamp (2026-10-08 00:00) keeps the build reproducible.
  const dosTime = 0;
  const dosDate = ((2026 - 1980) << 9) | (10 << 5) | 8;
  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8');
    const crc = zlib.crc32(f.data) >>> 0;
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0x0800, 6); // UTF-8 names
    lh.writeUInt16LE(0, 8); // store
    lh.writeUInt16LE(dosTime, 10);
    lh.writeUInt16LE(dosDate, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(f.data.length, 18);
    lh.writeUInt32LE(f.data.length, 22);
    lh.writeUInt16LE(name.length, 26);
    lh.writeUInt16LE(0, 28);
    local.push(lh, name, f.data);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt16LE(0, 10);
    ch.writeUInt16LE(dosTime, 12);
    ch.writeUInt16LE(dosDate, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(f.data.length, 20);
    ch.writeUInt32LE(f.data.length, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(offset, 42);
    central.push(ch, name);
    offset += 30 + name.length + f.data.length;
  }
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, centralBuf, end]);
}

export function GET() {
  const dir = path.resolve(process.cwd(), 'public', 'press');
  const files = [
    { name: 'STATIC-press-kit/fact-sheet.txt', data: Buffer.from(factSheet(), 'utf8') },
    ...ASSETS.map((f) => ({ name: `STATIC-press-kit/${f}`, data: fs.readFileSync(path.join(dir, f)) })),
  ];
  return new Response(new Uint8Array(zip(files)), { headers: { 'Content-Type': 'application/zip' } });
}
