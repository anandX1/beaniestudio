#!/usr/bin/env node
/**
 * CONTENT STUDIO — the local content operations dashboard.
 *
 *   npm run studio   →  http://127.0.0.1:4323
 *
 * One page that does the whole loop:
 *   trending keywords (real autocomplete data) → Groq drafts an SEO blog post
 *   → humanize pass (strips AI tells) → SEO lint (live heuristics) → attach
 *   images → PUBLISH → writes the devlog entry, builds, pushes, pings IndexNow
 *   → CI broadcasts it to Discord/Bluesky. The site's existing pipeline does
 *   the rest.
 *
 * SECURITY MODEL: binds 127.0.0.1 only — not reachable from the network.
 * Secrets stay in site/.env (gitignored). Publish runs the same vetted
 * deploy script a human would run; nothing here bypasses the build check.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(here, '..');
const PORT = Number(process.env.STUDIO_PORT || 4323);
const HOST = '127.0.0.1';
const CONTENT_DIR = path.join(SITE_ROOT, 'content');
const KW_PATH = path.join(CONTENT_DIR, 'keywords.json');
const DEVLOG_DIR = path.join(SITE_ROOT, 'src', 'blog'); // folder + public URLs are "blog" now (collection key kept for compat)
const BLOG_IMG_DIR = path.join(SITE_ROOT, 'public', 'blog');
const RANK_LOCK = path.join(CONTENT_DIR, 'rank-run.lock');

// ---- env ----
try {
  for (const line of fs.readFileSync(path.join(SITE_ROOT, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* env vars only */ }

// ---- groq (same fallback chain as content-engine) ----
function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('no JSON object in model output');
  return JSON.parse(text.slice(start, end + 1));
}

// ---- SEO lint (pure heuristics, instant, no AI) ----
function seoLint({ title = '', description = '', markdown = '', keywords = [] }) {
  const text = markdown.replace(/[#*`>\-\[\]()!]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 1);
  const avgSentence = words.length / Math.max(1, sentences.length);
  const lower = (title + ' ' + description + ' ' + markdown).toLowerCase();
  const checks = [];
  const add = (ok, label, detail = '') => checks.push({ ok, label, detail });

  add(title.length >= 20 && title.length <= 60, 'Title 20–60 chars', `${title.length}`);
  add(description.length >= 50 && description.length <= 160, 'Meta description 50–160 chars', `${description.length}`);
  add(words.length >= 900, '900+ words (target 1,000 — search depth)', `${words.length} words`);
  add(avgSentence <= 22, 'Avg sentence ≤22 words', avgSentence.toFixed(1));
  add(/^##\s/m.test(markdown), 'Has H2 sections', '');
  const kwHits = keywords.filter((k) => lower.includes(k.toLowerCase()));
  add(keywords.length === 0 || kwHits.length >= Math.min(2, keywords.length), 'Keywords present in copy', kwHits.join(', ') || 'none found');
  const firstPara = text.slice(0, 600).toLowerCase();
  add(keywords.some((k) => firstPara.includes(k.toLowerCase())), 'A keyword in the first 100 words', '');
  add(/discord\.gg|beaniestudio\.site/.test(markdown), 'Internal/Discord link present', '');
  const imgCount = (markdown.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length;
  add(true, 'Image optional (add one for OG/social)', imgCount ? `${imgCount} image(s)` : 'none');
  const aiisms = ['delve', 'elevate', 'seamless', 'game-changer', 'revolutionize', 'testament', 'unleash', 'in the realm of', 'furthermore', 'moreover', 'utilize', 'leverage', 'pleased to announce'];
  const found = aiisms.filter((w) => lower.includes(w));
  add(found.length === 0, 'No AI-tell phrases', found.join(', ') || 'clean');

  // ---- plain-language checks: all ages, all reading levels ----
  const longOnes = sentences.filter((s) => s.trim().split(/\s+/).length > 30).length;
  add(sentences.length < 5 || longOnes / sentences.length <= 0.1, 'Long sentences (30+ words) ≤10%', longOnes ? `${longOnes} long of ${sentences.length}` : 'none');
  const passive = (text.match(/\b(was|were|is|are|been|being)\s+\w+(ed|en)\b/gi) || []).length;
  add(passive <= 3, 'Mostly active voice', passive ? `${passive} passive-style hits` : 'active');
  const jargon = ['asymmetrical', 'gameplay loop', 'vertical slice', 'procedural', 'greybox', 'whitebox', 'navmesh', 'tick rate', 'netcode', 'client-side prediction', 'iteration cadence', 'horizontal slice', 'art pipeline', 'design pillar'];
  const jfound = jargon.filter((j) => lower.includes(j));
  add(jfound.length === 0 || words.length >= 900, 'Jargon explained (or post long enough to)', jfound.length ? `${jfound.join(', ')} — first use should say what it means` : 'none');

  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { score, checks };
}

// ---- helpers ----
const json = (res, code, data) => { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(data)); };
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);

function readBody(req, limit = 24 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('body too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new Error('invalid JSON')); } });
    req.on('error', reject);
  });
}

// ---- publish queue: pre-written posts waiting in content/queue/ ----
// Each queue file is a JSON post object (same shape /api/draft returns, plus
// id + idea). "Load" fills the editor; publishing auto-drops the item so the
// queue shows what's left. One post a day ≈ 9 days of runway out of the box.
const QUEUE_DIR = path.join(CONTENT_DIR, 'queue');
function listQueue() {
  if (!fs.existsSync(QUEUE_DIR)) return [];
  return fs.readdirSync(QUEUE_DIR).filter((f) => f.endsWith('.json')).map((f) => {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, f), 'utf8'));
      const words = String(d.markdown || '').replace(/\[\s*photo\s*\]/gi, ' ').trim().split(/\s+/).filter(Boolean).length;
      return { id: d.id || f.replace(/\.json$/, ''), title: d.title || d.id || f, words, idea: d.idea || null, file: f };
    } catch { return { id: f, title: f + ' (invalid JSON)', words: 0, file: f, broken: true }; }
  }).sort((a, b) => a.file.localeCompare(b.file));
}

function listPosts() {
  if (!fs.existsSync(DEVLOG_DIR)) return [];
  return fs.readdirSync(DEVLOG_DIR).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(DEVLOG_DIR, f), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
    const pick = (k) => (fm.match(new RegExp(`${k}:\\s*(.+)`)) || [])[1]?.replace(/^['"]|['"]$/g, '') || '';
    return { file: f, title: pick('title'), pubDate: pick('pubDate'), draft: /draft:\s*true/.test(fm) };
  }).sort((a, b) => (b.pubDate || '').localeCompare(a.pubDate || ''));
}

// ---- idea bank: parsed live from BLOG-100.md (the doc stays the single source) ----
function parseIdeas() {
  const docPath = path.join(SITE_ROOT, 'BLOG-100.md');
  if (!fs.existsSync(docPath)) return { tiers: [] };
  const text = fs.readFileSync(docPath, 'utf8');
  const tierRe = /^## TIER (\d) — (.+)$/gm;
  const ideaRe = /^(\d+)\.\s+\*\*(.+?)\*\*\s+—\s+(.*)$/gm;
  const tierMatches = [...text.matchAll(tierRe)];
  const tiers = tierMatches.map((m, i) => {
    const start = m.index + m[0].length;
    const end = i + 1 < tierMatches.length ? tierMatches[i + 1].index : text.length;
    const ideas = [...text.slice(start, end).matchAll(ideaRe)].map((im) => {
      const n = Number(im[1]);
      const slug = im[2].replace(/\/$/, '');
      const note = im[3].trim();
      // Track mapping mirrors the doc's "operating system" section.
      const track = ((n >= 21 && n <= 33) || (n >= 63 && n <= 75)) ? 'technical'
        : ((n >= 46 && n <= 62) || n >= 86) ? 'indie' : 'game';
      return { n, slug, note, track, title: slug.replace(/-\//g, '').replace(/-/g, ' ') };
    });
    return { tier: Number(m[1]), label: m[2].trim(), ideas };
  });
  return { tiers };
}

function runStep(cmd, onLine) {
  return new Promise((resolve) => {
    const child = spawn('cmd.exe', ['/c', cmd], { cwd: SITE_ROOT, windowsHide: true });
    child.stdout.on('data', (d) => onLine(String(d)));
    child.stderr.on('data', (d) => onLine(String(d)));
    child.on('close', (code) => resolve(code));
  });
}

// ---- publish ----
async function publish(body, res, onLine) {
  const { title, description, tag = 'design', markdown, keywords = [], images = [], draft = false } = body;
  if (!title || !description || !markdown) return json(res, 400, { error: 'title, description and markdown are required' });
  const slug = slugify(title);
  if (!slug) return json(res, 400, { error: 'could not make a slug from that title' });

  // Images → public/blog/ (served as-is; referenced by absolute path).
  // Response carries draft so the UI can message correctly.
  const saved = [];
  fs.mkdirSync(BLOG_IMG_DIR, { recursive: true });
  let i = 0;
  for (const img of images.slice(0, 6)) {
    const m = String(img.data || '').match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/s);
    if (!m) continue;
    i++;
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const file = `${slug}-${i}.${ext}`;
    fs.writeFileSync(path.join(BLOG_IMG_DIR, file), Buffer.from(m[2], 'base64'));
    saved.push({ file, markdown: `![${img.alt || title}](/blog/${file})` });
    onLine(`image saved: public/blog/${file}\n`);
  }

  // Inline [photo] markers: uploaded images drop into their markers IN ORDER,
  // so each image lands exactly where the writer put the slot. Leftover
  // images (markers exhausted) append at the end like before; leftover
  // markers become an HTML comment placeholder so no literal "[photo]"
  // ever ships to readers.
  let bodyMd = markdown.trim();
  let sIdx = 0;
  bodyMd = bodyMd.replace(/\[\s*photo\s*\]/gi, () => {
    if (sIdx < saved.length) return `\n\n${saved[sIdx++].markdown}\n\n`;
    return `\n\n<!-- photo slot: attach an image in Studio to fill this spot -->\n\n`;
  });
  const leftovers = saved.slice(sIdx);
  if (leftovers.length) onLine(`${leftovers.length} image(s) had no [photo] marker — appended at the end\n`);
  const markerCount = (markdown.match(/\[\s*photo\s*\]/gi) || []).length;
  if (markerCount > saved.length) onLine(`${markerCount - saved.length} [photo] slot(s) left empty — attach more images next time\n`);
  const imageBlock = leftovers.length ? `\n${leftovers.map((s) => s.markdown).join('\n\n')}\n` : '';
  const kwLine = keywords.length ? `\n<!-- studio-keywords: ${keywords.join(' | ')} -->\n` : '';
  const post = `---\ntitle: '${title.replace(/'/g, "\\'")}'\ndescription: '${description.replace(/'/g, "\\'")}'\npubDate: ${new Date().toISOString().slice(0, 10)}\ntag: ${['design', 'production', 'systems'].includes(tag) ? tag : 'design'}\ndraft: ${draft ? 'true' : 'false'}\n---\n\n${bodyMd}\n${imageBlock}${kwLine}`;
  const postPath = path.join(DEVLOG_DIR, `${slug}.md`);

  // Thin-content guard: sub-400-word posts are exactly what Google shelved as
  // "Crawled - currently not indexed". Production refuses them; drafts are free.
  // MUST run before the file is written — a guard that rejects *after* writing
  // leaves a draft:false .md behind that the next build ships to the live site
  // (this exact bug once put a test post in the sitemap).
  if (!draft) {
    const wc = markdown.replace(/\[\s*photo\s*\]/gi, ' ').trim().split(/\s+/).filter(Boolean).length;
    if (wc < 400) return json(res, 400, { error: `only ${wc} words — the SEO bar is ~900 (Google shelves thin posts). Expand it, or tick "Publish as draft".` });
  }

  fs.writeFileSync(postPath, post);    onLine(`post written: src/blog/${slug}.md\n`);

  // Draft mode: write the file and stop — nothing touches the live site
  // until the post is flipped to draft:false and republished.
  if (draft) {
    return json(res, 200, { ok: true, slug, draft: true, url: `(local draft) src/blog/${slug}.md`, images: saved.map((s) => s.file) });
  }

  // Build → if it fails, leave the post as draft so nothing breaks production.
  onLine('building site…\n');
  const buildCode = await runStep('npm run build', onLine);
  if (buildCode !== 0) {
    return json(res, 500, { error: 'build failed — post kept locally as a draft, fix in the editor and republish', slug });
  }

  onLine('deploying (sync → push → ping)…\n');
  const deployCode = await runStep('npm run deploy --silent --no-ping', onLine);
  if (deployCode !== 0) return json(res, 500, { error: 'deploy failed after a successful build — check the repo', slug });

  onLine('pinging IndexNow…\n');
  await runStep('npm run ping:indexnow --silent', onLine);
  return json(res, 200, { ok: true, slug, draft, url: `https://beaniestudio.site/blog/${slug}/`, images: saved.map((s) => s.file) });
}

// ---- UI ----
// The whole page (markup + client JS) lives in studio-ui.mjs so it can be
// redesigned without touching server logic. All IDs and API contracts stay
// identical; the boot self-check below still verifies the page script parses.
import { groq, BRAND, BLOG_TRACKS, MARKDOWN_PROMPT, META_PROMPT, HUMANIZE_PROMPT } from './blog-ai.mjs';
import { UI } from './studio-ui.mjs';

// ---- boot self-check: the page script must parse, or the UI dies silently ----
// (a single unbalanced brace once killed every button with zero visible errors —
// the server kept serving a page whose only script never ran. This makes that
// failure mode a loud startup error instead.)
try {
  const pageJs = UI.match(/<script>([\s\S]*?)<\/script>/)[1];
  // eslint-disable-next-line no-new-func
  new Function(pageJs);
  console.log(`[studio] page script OK (${pageJs.length} chars)`);
} catch (err) {
  console.error('[studio] ✗ PAGE SCRIPT IS BROKEN — refusing to start:\n', err.message);
  process.exit(1);
}

// ---- server ----
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(UI);
    }

    if (url.pathname === '/api/keywords' && req.method === 'GET') {
      let kw = null;
      try { kw = JSON.parse(fs.readFileSync(KW_PATH, 'utf8')); } catch { /* none yet */ }
      return json(res, 200, kw || { keywords: [], harvestedAt: null });
    }

    if (url.pathname === '/api/harvest' && req.method === 'POST') {
      const track = (['game', 'indie', 'technical'].includes(url.searchParams.get('track') || '') ? url.searchParams.get('track') : 'game');
      const kwFile = track === 'game' ? KW_PATH : path.join(CONTENT_DIR, `keywords-${track}.json`);
      execSync(`node scripts/content-engine.mjs harvest --track ${track}`, { cwd: SITE_ROOT, stdio: 'pipe', timeout: 120000 });
      return json(res, 200, JSON.parse(fs.readFileSync(kwFile, 'utf8')));
    }

    if (url.pathname === '/api/posts' && req.method === 'GET') {
      return json(res, 200, { posts: listPosts() });
    }

    if (url.pathname === '/api/ideas' && req.method === 'GET') {
      const parsed = parseIdeas();
      const published = new Set(listPosts().map((p) => p.file.replace(/\.md$/, '')));
      const tiers = parsed.tiers.map((t) => ({
        ...t,
        ideas: t.ideas.map((i2) => ({ ...i2, done: published.has(i2.slug) })),
      }));
      const total = tiers.reduce((a, t) => a + t.ideas.length, 0);
      const done = tiers.reduce((a, t) => a + t.ideas.filter((i2) => i2.done).length, 0);
      return json(res, 200, { tiers, total, done });
    }

    if (url.pathname === '/api/queue' && req.method === 'GET') {
      return json(res, 200, { queue: listQueue() });
    }

    if (url.pathname === '/api/queue/load' && req.method === 'POST') {
      const { id } = await readBody(req, 64 * 1024);
      const item = listQueue().find((q) => q.id === id);
      if (!item) return json(res, 404, { error: 'queue item not found' });
      // Full post content goes back; the file stays in the queue until it is
      // actually published (auto-drop), so a load is free to be repeated.
      return json(res, 200, JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, item.file), 'utf8')));
    }

    if (url.pathname === '/api/queue/drop' && req.method === 'POST') {
      const { id } = await readBody(req, 64 * 1024);
      const item = listQueue().find((q) => q.id === id);
      if (!item) return json(res, 404, { error: 'queue item not found' });
      fs.rmSync(path.join(QUEUE_DIR, item.file));
      return json(res, 200, { ok: true, remaining: listQueue().length });
    }

    // ---- rank tracking (community OpenSERP → Bing/DDG, local-only history) ----
    if (url.pathname === '/api/rank' && req.method === 'GET') {
      const histPath = path.join(SITE_ROOT, 'content', 'rank-history.jsonl');
      if (!fs.existsSync(histPath)) return json(res, 200, { runs: [], note: 'no runs yet — click “Track rankings now”' });
      const lines = fs.readFileSync(histPath, 'utf8').trim().split('\n');
      const runs = lines.slice(-30).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      return json(res, 200, { runs });
    }
    if (url.pathname === '/api/rank/run' && req.method === 'POST') {
      // Spawn the tracker detached from the request; the UI polls /api/rank
      // (last-run date changes) instead of holding a 5-minute HTTP call open.
      if (fs.existsSync(RANK_LOCK)) {
        const age = Date.now() - fs.statSync(RANK_LOCK).mtimeMs;
        if (age < 15 * 60_000) return json(res, 409, { error: 'a rank run is already in progress' });
        fs.rmSync(RANK_LOCK); // stale lock (crashed run)
      }
      fs.writeFileSync(RANK_LOCK, String(Date.now()));
      const child = spawn(process.execPath, [path.join(SITE_ROOT, 'tools', 'rank-track.mjs')], {
        cwd: SITE_ROOT,
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      child.on('exit', () => fs.rmSync(RANK_LOCK, { force: true }));
      return json(res, 200, { ok: true, note: 'tracking started — takes ~4–6 min for all keywords on both engines' });
    }

    if (url.pathname === '/api/seo' && req.method === 'POST') {
      return json(res, 200, seoLint(await readBody(req, 1024 * 1024)));
    }

    if (url.pathname === '/api/draft' && req.method === 'POST') {
      const { angle, keywords = [], track = 'game' } = await readBody(req);
      if (!angle) return json(res, 400, { error: 'angle required' });
      const kwFile = track === 'game' ? KW_PATH : path.join(CONTENT_DIR, `keywords-${track}.json`);
      let pool = keywords;
      if (!pool.length) { try { pool = JSON.parse(fs.readFileSync(kwFile, 'utf8')).keywords || []; } catch { pool = []; } }
      if (!pool.length) { try { pool = JSON.parse(fs.readFileSync(KW_PATH, 'utf8')).keywords || []; } catch { pool = []; } }
      const kws = (pool.length ? pool : BLOG_TRACKS[track].seeds).slice(0, 8);
      // Two small calls beat one big one: reasoning models burn token budgets,
      // so the body is plain-text and the tiny title/meta pair is a separate
      // cheap JSON call that fits the free tier easily.
      // 2600 tokens ≈ 1000+ words of markdown — the old 980 cap silently
      // truncated drafts at ~400 words, which is exactly the thin-content
      // pattern Google's "Crawled - currently not indexed" punishes.
      const markdown = (await groq(MARKDOWN_PROMPT(angle, kws, track), { maxTokens: 2600 })).replace(/^```(markdown)?\n?|\n?```$/g, '').trim();
      let meta = { title: angle.slice(0, 55), description: '' };
      try {
        const raw = await groq(META_PROMPT(markdown, kws), { json: true, maxTokens: 200 });
        meta = { ...meta, ...JSON.parse(raw) };
      } catch { /* fall back to angle-derived title */ }
      return json(res, 200, { title: (meta.title || angle).slice(0, 70), description: (meta.description || '').slice(0, 165), markdown, keywords: kws, track });
    }

    if (url.pathname === '/api/adapt' && req.method === 'POST') {
      const { title = '', markdown = '', url: postUrl = '' } = await readBody(req, 1024 * 1024);
      if (!markdown) return json(res, 400, { error: 'markdown required' });
      const src = postUrl || `https://beaniestudio.site/blog/${slugify(title)}/`;
      const first = markdown.replace(/[#*>`]/g, '').split('\n').map((l) => l.trim()).filter(Boolean)[0] || title;
      const utm = (source) => `${src}?utm_source=${source}&utm_medium=social&utm_campaign=blog`;
      // Per-platform adaptation: the same content, each platform's native voice
      // and constraints. Reddit/Telegram/LinkedIn ship as intent URLs + copy —
      // one click opens the platform pre-filled (their APIs forbid auto-posting;
      // intent URLs are the compliant path).
      const variants = {
        x: {
          mode: 'intent',
          note: 'Opens X pre-filled (280 chars incl. link). Post from the handle for reach.',
          text: `${title}\n${first.slice(0, 120)}…\n${utm('x')}`.slice(0, 279) + '…',
          intent: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}\n${utm('x')}`.slice(0, 279))}`,
        },
        reddit: {
          mode: 'intent+rules',
          note: 'Title + body for r/robloxgamedev or r/gamedev. LINK IN FIRST COMMENT ONLY — subreddits remove link-drops.',
          text: `${title}\n\n${first}\n\n(Context: we are building this game; full writeup on our site.)`,
        },
        telegram: {
          mode: 'intent',
          note: 'Opens Telegram share.',
          intent: `https://t.me/share/url?url=${encodeURIComponent(utm('telegram'))}&text=${encodeURIComponent(title)}`,
          text: `${title} — ${utm('telegram')}`,
        },
        linkedin: {
          mode: 'intent',
          note: 'Opens LinkedIn share. Angle indie-dev lessons as professional lessons.',
          intent: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(utm('linkedin'))}`,
          text: utm('linkedin'),
        },
      };
      return json(res, 200, { url: src, variants });
    }

    if (url.pathname === '/api/deploy' && req.method === 'POST') {
      const code = await runStep('npm run deploy --silent --no-ping', (s) => process.stdout.write(`[studio:deploy] ${String(s).split('\n')[0]}\n`));
      return json(res, 200, { code });
    }

    if (url.pathname === '/api/stats' && req.method === 'GET') {
      const token = process.env.CF_API_TOKEN;
      if (!token) {
        return json(res, 200, { configured: false, hint: 'Add CF_API_TOKEN to site/.env (Cloudflare dash → My Profile → API Tokens → "Web Analytics reports:read" permission). Or paste a token in the Traffic tab — it is saved to .env automatically.' });
      }
      const siteTag = process.env.CF_SITE_TAG || '';
      const days = Math.min(90, Math.max(1, Number(new URL(req.url, 'http://x').searchParams.get('days')) || 30));
      const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
      const until = new Date().toISOString().slice(0, 10);
      const filter = `siteTag: "${siteTag}", date_geq: "${since}", date_leq: "${until}"`;
      // One query per dataset; each dataset fails independently so one unknown
      // field can never blank the whole panel.
      const q = `query {
        viewer { accounts(filter: {}) { webAnalyticsReports(limit: 1, filter: { ${filter} }) {
          topPages      { pageInfo { count } rows { pageViews date } }
          topReferrers  { pageInfo { count } rows { referrer pageViews } }
          topCountries  { pageInfo { count } rows { countryAlpha2 pageViews } }
          topDevices    { pageInfo { count } rows { deviceType pageViews } }
          topPaths      { pageInfo { count } rows { path pageViews } }
        } } }
      }`;
      const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: q }),
      });
      const body = await r.json().catch(() => null);
      if (!r.ok || !body?.data) {
        // fall back to the minimal known-good shape (topPages only)
        const q2 = `query { viewer { accounts(filter: {}) { webAnalyticsReports(limit: 1, filter: { siteTag: "${siteTag}", date_geq: "${since}", date_leq: "${until}" }) { topPages { pageInfo { count } rows { pageViews date } } } } } }`;
        const r2 = await fetch('https://api.cloudflare.com/client/v4/graphql', {
          method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
          body: JSON.stringify({ query: q2 }),
        });
        const b2 = await r2.json().catch(() => null);
        if (!r2.ok || !b2?.data) return json(res, 200, { configured: true, ok: false, hint: `CF API said ${r.status}/${r2.status} — check token permission or site tag.` });
        return json(res, 200, { configured: true, ok: true, data: b2.data, partial: true, errors: body?.errors?.map((e) => e.message)?.slice(0, 4) });
      }
      return json(res, 200, { configured: true, ok: true, days, data: body.data, errors: body.errors?.map((e) => e.message)?.slice(0, 4) });
    }

    // Save Cloudflare token from the Traffic tab into site/.env (local only).
    if (url.pathname === '/api/stats/token' && req.method === 'POST') {
      const { token, siteTag } = await readBody(req, 16 * 1024);
      if (!token || token.length < 30) return json(res, 400, { error: 'that does not look like a Cloudflare API token' });
      const envPath = path.join(SITE_ROOT, '.env');
      let env = '';
      try { env = fs.readFileSync(envPath, 'utf8'); } catch { /* new file */ }
      const upsert = (key, val) => {
        const re = new RegExp(`^${key}=.*$`, 'm');
        if (re.test(env)) env = env.replace(re, `${key}=${val}`);
        else env += (env && !env.endsWith('\n') ? '\n' : '') + `${key}=${val}\n`;
      };
      upsert('CF_API_TOKEN', String(token).trim());
      if (siteTag) upsert('CF_SITE_TAG', String(siteTag).trim());
      fs.writeFileSync(envPath, env);
      process.env.CF_API_TOKEN = String(token).trim();
      if (siteTag) process.env.CF_SITE_TAG = String(siteTag).trim();
      return json(res, 200, { ok: true });
    }

    // ---- Autopilot ----
    if (url.pathname === '/api/autopilot' && req.method === 'GET') {
      const out = await new Promise((resolve) => {
        const child = spawn(process.execPath, [path.join(SITE_ROOT, 'tools', 'autopilot.mjs'), 'status'], { cwd: SITE_ROOT, windowsHide: true });
        let buf = '';
        child.stdout.on('data', (d) => { buf += d; });
        child.on('close', () => { try { resolve(JSON.parse(buf)); } catch { resolve({ error: 'status failed' }); } });
      });
      // queue details for the pipeline table
      const queue = listQueue().map((q) => {
        try {
          const d = JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, q.file), 'utf8'));
          return { id: q.id, title: q.title, words: q.words, idea: q.idea || null, scheduledFor: d.scheduledFor || null, track: d.track || null, file: q.file, source: d.source || null, needsResearch: !!d.needsResearch, researchedOn: d.researchedOn || null };
        } catch { return { id: q.id, title: q.title, words: q.words, file: q.file, broken: true } ; }
      }).sort((a, b) => String(a.scheduledFor || '9999').localeCompare(String(b.scheduledFor || '9999')));
      const logLines = [];
      try { logLines.push(...fs.readFileSync(path.join(CONTENT_DIR, 'autopilot-log.jsonl'), 'utf8').trim().split('\n').slice(-40).reverse().map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)); } catch { /* none */ }
      return json(res, 200, { ...out, queue, log: logLines });
    }
    if (url.pathname === '/api/autopilot/run' && req.method === 'POST') {
      const LOCK = path.join(CONTENT_DIR, 'autopilot-run.lock');
      if (fs.existsSync(LOCK)) {
        if (Date.now() - fs.statSync(LOCK).mtimeMs < 20 * 60_000) return json(res, 409, { error: 'an autopilot action is already running' });
        fs.rmSync(LOCK);
      }
      const body = await readBody(req, 4096).catch(() => ({}));
      const cmd = body?.cmd === 'fill' ? 'fill' : 'tick';
      fs.writeFileSync(LOCK, String(Date.now()));
      const child = spawn(process.execPath, [path.join(SITE_ROOT, 'tools', 'autopilot.mjs'), cmd], { cwd: SITE_ROOT, detached: true, stdio: 'ignore', windowsHide: true });
      child.unref();
      child.on('exit', () => fs.rmSync(LOCK, { force: true }));
      return json(res, 200, { ok: true, cmd, note: cmd === 'fill' ? 'generation started — posts appear in the pipeline as they finish (about 1/min)' : 'publish tick started' });
    }

    if (url.pathname === '/api/humanize' && req.method === 'POST') {
      const { markdown } = await readBody(req, 1024 * 1024);
      if (!markdown?.trim()) return json(res, 400, { error: 'markdown required' });
      const out = await groq(HUMANIZE_PROMPT(markdown), { maxTokens: 2600 });
      return json(res, 200, { markdown: out });
    }

    if (url.pathname === '/api/publish' && req.method === 'POST') {
      const body = await readBody(req);
      const lines = [];
      const onLine = (s) => { lines.push(s); process.stdout.write(`[studio] ${String(s).split('\n')[0]}\n`); };
      const result = await publish(body, res, onLine);
      // Published (not merely saved-as-draft) → drop the queue item so the
      // queue reflects reality. Match by title; queue ids map 1:1 to titles.
      if (result?.ok && !result?.draft && body?.title) {
        const hit = listQueue().find((q) => q.title === body.title);
        if (hit) { fs.rmSync(path.join(QUEUE_DIR, hit.file)); process.stdout.write(`[studio] queue: dropped "${hit.title}" (${listQueue().length} left)\n`); }
      }
      return result;
    }

    json(res, 404, { error: 'not found' });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`[studio] port ${PORT} busy — Studio is probably already running at http://${HOST}:${PORT}`);
    process.exit(0);
  }
  throw e;
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`[studio] Content Studio → ${url}  (local only, Ctrl+C to stop)`);
  if (process.env.STUDIO_NO_OPEN !== '1') {
    spawn('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore', windowsHide: true });
  }
});
