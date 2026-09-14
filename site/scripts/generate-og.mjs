/**
 * Build-time Open Graph image generator — zero dependencies.
 *
 * Why hand-rolled: satori + resvg pulls ~40MB of native binaries onto every
 * contributor's machine for six images. This renders a branded 1200×630 card
 * per page/post with pure JS (zlib is in Node's stdlib), using the same
 * design language as the site: facility panel, amber signal bar, kicker,
 * title, status footer.
 *
 * A "logo" is rendered as SVG paths converted to PNG via PNGBuilder.shapes.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const W = 1200;
const H = 630;

/** Minimal RGBA raster with rect/line/text fills. */
class Raster {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = Buffer.alloc(w * h * 4);
  }
  blend(x, y, r, g, b, a) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    // Source-over alpha compositing (alpha channel stored 0–255).
    const da = this.data[i + 3] / 255;
    const na = a + da * (1 - a);
    if (na <= 0) return;
    this.data[i] = Math.round(((r * a + (this.data[i] / 255) * da * (1 - a)) / na) * 255);
    this.data[i + 1] = Math.round(((g * a + (this.data[i + 1] / 255) * da * (1 - a)) / na) * 255);
    this.data[i + 2] = Math.round(((b * a + (this.data[i + 2] / 255) * da * (1 - a)) / na) * 255);
    this.data[i + 3] = Math.round(na * 255);
  }
  rect(x0, y0, w, h, [r, g, b], a = 1) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) this.blend(x, y, r, g, b, a);
    }
  }
  /** Nearest-sample blit of a decoded RGBA image into this raster. */
  blit(img, dx, dy, dw, dh) {
    for (let y = 0; y < dh; y++) {
      const sy = Math.min(img.h - 1, Math.floor((y * img.h) / dh));
      for (let x = 0; x < dw; x++) {
        const sx = Math.min(img.w - 1, Math.floor((x * img.w) / dw));
        const i = (sy * img.w + sx) * 4;
        if (img.data[i + 3] === 0) continue;
        this.blend(dx + x, dy + y, img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3] / 255);
      }
    }
  }
  /** 5×7 pixel font — terminal look is a feature, not a limitation. */
  text(str, x, y, scale, [r, g, b], a = 1) {
    let cx = x;
    for (const ch of str.toUpperCase()) {
      const glyph = FONT[ch] ?? FONT['?'];
      for (let gy = 0; gy < 7; gy++) {
        for (let gx = 0; gx < 5; gx++) {
          if (glyph[gy][gx]) {
            this.rect(cx + gx * scale, y + gy * scale, scale, scale, [r, g, b], a);
          }
        }
      }
      cx += 6 * scale;
    }
  }
  measure(str, scale) {
    return str.length * 6 * scale - scale;
  }
}

/** 5×7 pixel glyphs (rows of 5 bits). Only what the cards need. */
const FONT = {
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  B: ['11110','10001','10001','11110','10001','10001','11110'],
  C: ['01110','10001','10000','10000','10000','10001','01110'],
  D: ['11110','10001','10001','10001','10001','10001','11110'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  F: ['11111','10000','10000','11110','10000','10000','10000'],
  G: ['01110','10001','10000','10111','10001','10001','01110'],
  H: ['10001','10001','10001','11111','10001','10001','10001'],
  I: ['11111','00100','00100','00100','00100','00100','11111'],
  K: ['10001','10010','10100','11000','10100','10010','10001'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  M: ['10001','11011','10101','10101','10001','10001','10001'],
  N: ['10001','11001','10101','10011','10001','10001','10001'],
  O: ['01110','10001','10001','10001','10001','10001','01110'],
  P: ['11110','10001','10001','11110','10000','10000','10000'],
  Q: ['01110','10001','10001','10001','10101','10010','01101'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  U: ['10001','10001','10001','10001','10001','10001','01110'],
  V: ['10001','10001','10001','10001','10001','01010','00100'],
  W: ['10001','10001','10001','10101','10101','11011','10001'],
  X: ['10001','10001','01010','00100','01010','10001','10001'],
  Y: ['10001','10001','01010','00100','00100','00100','00100'],
  Z: ['11111','00001','00010','00100','01000','10000','11111'],
  ' ': ['00000','00000','00000','00000','00000','00000','00000'],
  ':': ['00000','00100','00100','00000','00100','00100','00000'],
  '.': ['00000','00000','00000','00000','00000','00110','00110'],
  ',': ['00000','00000','00000','00000','00110','00110','01100'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  '—': ['00000','00000','00000','11111','00000','00000','00000'],
  '/': ['00001','00010','00010','00100','01000','01000','10000'],
  '!': ['00100','00100','00100','00100','00100','00000','00100'],
  '?': ['01110','10001','00001','00110','00100','00000','00100'],
  "'": ['00100','00100','00000','00000','00000','00000','00000'],
  '(': ['00010','00100','01000','01000','01000','00100','00010'],
  ')': ['01000','00100','00010','00010','00010','00100','01000'],
  '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00110','01000','10000','11111'],
  '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'],
  '5': ['11111','10000','11110','00001','00001','10001','01110'],
  '6': ['01110','10000','11110','10001','10001','10001','01110'],
  '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'],
  '9': ['01110','10001','10001','01111','00001','00001','01110'],
  '0': ['01110','10001','10011','10101','11001','10001','01110'],
  '&': ['01100','10010','10100','01000','10101','10010','01101'],
  '%': ['11001','11010','00010','00100','01000','01011','10011'],
  '+': ['00000','00100','00100','11111','00100','00100','00000'],
  '#': ['01010','11111','01010','01010','01010','11111','01010'],
};

const COL = {
  bg: [0.086, 0.09, 0.102],
  panel: [0.11, 0.115, 0.13],
  signal: [0.91, 0.66, 0.24],
  text: [0.93, 0.94, 0.95],
  dim: [0.42, 0.44, 0.5],
};

/** Encode RGBA raster as PNG (stdlib zlib only). */
function toPng(raster) {
  const raw = Buffer.alloc((raster.w * 4 + 1) * raster.h);
  for (let y = 0; y < raster.h; y++) {
    raw[y * (raster.w * 4 + 1)] = 0; // filter: none
    raster.data.copy(raw, y * (raster.w * 4 + 1) + 1, y * raster.w * 4, (y + 1) * raster.w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunks = [];
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(body) >>> 0);
    chunks.push(len, body, crcBuf);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  chunk('IHDR', ihdr);
  chunk('IDAT', idat);
  chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...chunks]);
}

let crcTable;
function crc32(buf) {
  if (!crcTable) {
    crcTable = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return crc ^ 0xffffffff;
}

/** Draw the shared card chrome; caller adds title lines. */
function drawCard(titleLines, kicker) {
  const r = new Raster(W, H);
  r.rect(0, 0, W, H, COL.bg);
  // Panel
  r.rect(48, 48, W - 96, H - 96, COL.panel, 0.85);
  r.rect(48, 48, W - 96, 3, COL.signal);
  // Corner brackets
  r.rect(48, 48, 16, 3, COL.signal);
  r.rect(48, 48, 3, 16, COL.signal);
  r.rect(W - 64, H - 51, 16, 3, COL.signal);
  r.rect(W - 51, H - 64, 3, 16, COL.signal);
  // Kicker
  r.text(kicker, 96, 110, 4, COL.signal);
  // Title lines
  let y = 200;
  for (const line of titleLines) {
    r.text(line.text, 96, y, line.scale, COL.text);
    y += 9 * line.scale + 28;
  }
  // Footer
  r.text('BEANIE STUDIO', 96, H - 130, 4, COL.dim);
  r.text('ROBLOX — Q4 2026', 96, H - 96, 3, COL.dim);
  // Real studio logo, bottom right (decoded once, cached).
  const logo = loadLogo();
  if (logo) {
    const S = 140;
    const lx = W - 64 - S;
    const ly = H - 64 - S;
    r.rect(lx - 4, ly - 4, S + 8, S + 8, COL.signal);
    r.blit(logo, lx, ly, S, S);
  } else {
    // Fallback: amber monogram block if the logo file is missing.
    r.rect(W - 148, H - 130, 52, 52, COL.signal);
    r.rect(W - 148 + 10, H - 130 + 10, 32, 32, COL.bg);
    r.rect(W - 148 + 18, H - 130 + 18, 16, 16, COL.signal);
  }
  return r;
}

/**
 * Decode public/logo.png (32-bit RGBA, non-interlaced) with stdlib only.
 * Handles all five scanline filters; throws on anything fancier (the caller
 * falls back to the monogram block).
 */
function loadLogo() {
  try {
    const file = path.join(outDir, '..', 'logo.png');
    const buf = fs.readFileSync(file);
    if (buf.readUInt32BE(12) !== 0x49484452) throw new Error('IHDR missing');
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    const bitDepth = buf[24];
    const colorType = buf[25];
    const interlace = buf[28];
    if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) throw new Error('unsupported PNG variant');

    // Concatenate all IDAT chunks.
    const idatParts = [];
    let off = 8;
    while (off < buf.length) {
      const len = buf.readUInt32BE(off);
      const type = buf.readUInt32BE(off + 4);
      if (type === 0x49444154) idatParts.push(buf.subarray(off + 8, off + 8 + len));
      off += 12 + len;
    }
    const raw = zlib.inflateSync(Buffer.concat(idatParts));

    // Unfilter scanlines (filters 0–4).
    const stride = w * 4;
    const px = Buffer.alloc(w * h * 4);
    let rp = 0;
    for (let y = 0; y < h; y++) {
      const filter = raw[rp++];
      const line = raw.subarray(rp, rp + stride);
      rp += stride;
      const out = y * stride;
      for (let x = 0; x < stride; x++) {
        const a = x >= 4 ? px[out + x - 4] : 0;
        const b = y > 0 ? px[out - stride + x] : 0;
        const c = x >= 4 && y > 0 ? px[out - stride + x - 4] : 0;
        let v = line[x];
        if (filter === 1) v += a;
        else if (filter === 2) v += b;
        else if (filter === 3) v += (a + b) >> 1;
        else if (filter === 4) {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        px[out + x] = v & 0xff;
      }
    }
    return { w, h, data: px };
  } catch {
    return null;
  }
}

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og');
fs.mkdirSync(outDir, { recursive: true });

/** Fit text into width; downscale if needed. */
function fit(str, scale, maxW) {
  while (raster_measure(str, scale) > maxW && scale > 2) scale--;
  return scale;
}
function raster_measure(str, scale) {
  return str.length * 6 * scale - scale;
}

const cards = [
  {
    file: 'home.png',
    kicker: 'STATIC — FREE ON ROBLOX',
    lines: [
      { text: 'STATIC', scale: 14 },
      { text: 'SALVAGE VS HUNTER', scale: 6 },
      { text: 'NO RADAR. NO MINIMAP.', scale: 4 },
      { text: 'ONLY EARS.', scale: 4 },
    ],
  },
  {
    file: 'play.png',
    kicker: 'STATIC — FREE ON ROBLOX',
    lines: [
      { text: 'PLAY STATIC', scale: 10 },
      { text: 'FREE ON ROBLOX', scale: 5 },
      { text: 'MOBILE — PC — CONSOLE', scale: 4 },
    ],
  },
  {
    file: 'faq.png',
    kicker: 'QUESTIONS ABOUT STATIC?',
    lines: [
      { text: 'QUESTIONS', scale: 10 },
      { text: 'ANSWERS FROM THE FACILITY', scale: 4 },
    ],
  },
  {
    file: 'blog.png',
    kicker: 'NEWS & UPDATES',
    lines: [
      { text: 'BLOG', scale: 10 },
      { text: 'MAKING STATIC, PIECE BY PIECE', scale: 4 },
    ],
  },
  {
    file: 'press.png',
    kicker: 'PRESS KIT',
    lines: [
      { text: 'PRESS KIT', scale: 10 },
      { text: 'ASSETS — FACTS — CONTACT', scale: 4 },
    ],
  },
  {
    file: 'creators.png',
    kicker: 'CREATOR PROGRAM',
    lines: [
      { text: 'STREAM STATIC', scale: 10 },
      { text: 'YOUR CHAT PLAYS DETECTIVE', scale: 4 },
      { text: 'VERIFIED CREATORS WANTED', scale: 4 },
    ],
  },
  {
    file: 'playtest.png',
    kicker: 'PLAYTEST NIGHTS',
    lines: [
      { text: 'PLAYTEST STATIC', scale: 10 },
      { text: 'FREE — EVERYONE WELCOME', scale: 4 },
      { text: 'YOUR FEEDBACK SHAPES THE GAME', scale: 4 },
    ],
  },
];

for (const card of cards) {
  const lines = card.lines.map((l) => ({ ...l, scale: fit(l.text, l.scale, W - 192) }));
  const png = toPng(drawCard(lines, card.kicker));
  fs.writeFileSync(path.join(outDir, card.file), png);
  console.log(`og/${card.file}  ${(png.length / 1024).toFixed(1)} KB`);
}

// Post cards are generated by the blog page script via `node scripts/generate-og.mjs --posts`
// (kept in one place so the pixel font stays shared). See generate-post-og note in blog page.
console.log('OG generation complete.');
