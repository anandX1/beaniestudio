/**
 * Open Graph cards (1200×630) rendered by a real browser, so type uses the
 * site's actual fonts and the Jingles key art. Replaces the old pixel-font
 * renderer, which drew every glyph as a box.
 *
 *   node scripts/og-cards.mjs
 *
 * Needs Playwright with Chromium (`npm i -g playwright && npx playwright install chromium`).
 * Output is committed (public/og/*.png + public/press/static-key-art.png), so
 * this only runs when card copy changes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(here, '..', 'public');

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const tries = ['playwright', '/opt/node22/lib/node_modules/playwright'];
  for (const t of tries) {
    try { return require(t); } catch { /* next */ }
  }
  console.error('og-cards: Playwright not found. Install it with: npm i -g playwright');
  process.exit(1);
}

const CARDS = [
  { file: 'og/home.png', kicker: 'FREE ON ROBLOX · PC + MOBILE', title: 'STATIC', sub: 'Co-op horror. One of you is the Hunter.', foot: '4–6 SCRAPPERS VS 1 HUNTER · 400 KG TO CRUSH' },
  { file: 'press/static-key-art.png', kicker: 'BEANIE STUDIOS', title: 'STATIC', sub: 'Salvage vs Hunter', foot: 'FREE ON ROBLOX · PC + MOBILE' },
  { file: 'og/guide.png', kicker: 'OFFICIAL GUIDE', title: 'How to play', sub: 'Roles, controls, crushers and survival tips.', foot: 'STATIC · ROBLOX' },
  { file: 'og/jingles.png', kicker: 'OFFICIAL GUIDE · THE HUNTER', title: 'Jingles', sub: 'Speed, Dash, Bloodlust, and how to survive it.', foot: 'STATIC · ROBLOX' },
  { file: 'og/faq.png', kicker: 'FAQ', title: 'Questions', sub: 'Price, devices, players, voice chat, codes.', foot: 'STATIC · ROBLOX' },
  { file: 'og/press.png', kicker: 'PRESS KIT', title: 'Cover STATIC', sub: 'Fact sheet, descriptions, art and contact.', foot: 'BEANIE STUDIOS' },
  { file: 'og/play.png', kicker: 'FREE · PC + MOBILE', title: 'Play STATIC', sub: 'Open it on Roblox, bring a squad.', foot: 'STATIC · ROBLOX' },
  { file: 'og/creators.png', kicker: 'FOR CREATORS', title: 'Film STATIC', sub: 'Free to stream and monetize. Art included.', foot: 'BEANIE STUDIOS' },
  { file: 'og/blog.png', kicker: 'DEVLOG', title: 'From the team', sub: 'Update notes and design decisions.', foot: 'STATIC · BEANIE STUDIOS' },
];

const font = (f) => pathToFileURL(path.join(PUB, 'fonts', f)).href;
const jingles = pathToFileURL(path.join(PUB, 'press', 'jingles-render.png')).href;

const html = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Chakra; src: url(${font('chakra-petch-latin-700-normal.woff2')}); font-weight: 700; }
@font-face { font-family: Chakra; src: url(${font('chakra-petch-latin-500-normal.woff2')}); font-weight: 500; }
@font-face { font-family: Mono; src: url(${font('jetbrains-mono-latin-wght-normal.woff2')}); font-weight: 100 900; }
@font-face { font-family: Sans; src: url(${font('public-sans-latin-wght-normal.woff2')}); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: oklch(0.16 0.012 240); color: oklch(0.95 0.005 240); position: relative; }
.bg { position: absolute; inset: 0;
  background:
    radial-gradient(520px 520px at 905px 300px, oklch(0.62 0.19 25 / 0.32), transparent 70%),
    radial-gradient(900px 500px at 200px 0px, oklch(0.24 0.016 240 / 0.8), transparent 70%),
    linear-gradient(oklch(0.18 0.013 240), oklch(0.14 0.012 240)); }
.lines { position: absolute; inset: 0; background: repeating-linear-gradient(to bottom, transparent 0 3px, oklch(0 0 0 / 0.08) 3px 4px); }
.frame { position: absolute; inset: 36px; border: 1px solid oklch(0.31 0.018 240); }
.frame::before, .frame::after { content: ''; position: absolute; width: 28px; height: 28px; border: 0 solid oklch(0.78 0.15 75); }
.frame::before { top: -1px; left: -1px; border-width: 3px 0 0 3px; }
.frame::after { bottom: -1px; right: -1px; border-width: 0 3px 3px 0; }
.art { position: absolute; right: 70px; bottom: 0; height: 600px; filter: drop-shadow(0 20px 40px oklch(0 0 0 / 0.7)) brightness(0.95); }
.fade { position: absolute; left: 0; right: 0; bottom: 0; height: 120px; background: linear-gradient(to top, oklch(0.14 0.012 240), transparent); }
.text { position: absolute; left: 84px; top: 92px; width: 640px; }
.kicker { font: 500 22px Mono; letter-spacing: 0.22em; color: oklch(0.78 0.15 75); }
h1 { margin-top: 26px; font: 700 ${c.title.length > 8 ? 104 : 150}px/0.92 Chakra; text-transform: uppercase; letter-spacing: -0.01em; color: ${c.title === 'STATIC' ? 'oklch(0.78 0.15 75)' : 'oklch(0.95 0.005 240)'}; }
.sub { margin-top: 28px; font: 500 34px/1.25 Chakra; text-transform: uppercase; letter-spacing: 0.04em; color: oklch(0.88 0.008 240); max-width: 600px; }
.foot { position: absolute; left: 84px; bottom: 74px; font: 500 20px Mono; letter-spacing: 0.18em; color: oklch(0.6 0.02 240); }
.dot { display: inline-block; width: 12px; height: 12px; background: oklch(0.78 0.15 75); margin-right: 14px; vertical-align: 1px; }
</style></head><body>
<div class="bg"></div>
<img class="art" src="${jingles}">
<div class="fade"></div>
<div class="lines"></div>
<div class="frame"></div>
<div class="text">
  <div class="kicker"><span class="dot"></span>${c.kicker}</div>
  <h1>${c.title}</h1>
  <div class="sub">${c.sub}</div>
</div>
<div class="foot">${c.foot}</div>
</body></html>`;

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const c of CARDS) {
  const tmp = path.join(here, `.og-${path.basename(c.file, '.png')}.html`);
  fs.writeFileSync(tmp, html(c));
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(PUB, c.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out });
  fs.rmSync(tmp);
  console.log('✓', c.file);
}
await browser.close();
