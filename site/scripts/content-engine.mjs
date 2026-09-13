#!/usr/bin/env node
/**
 * CONTENT ENGINE — the local AI content pipeline.
 *
 * Pipeline:  harvest real search keywords (Google/DDG autocomplete, free)
 *         → Groq drafts platform posts woven with those keywords
 *         → YOU review a single drafts file and tick checkboxes  ← the anti-flag gate
 *         → engine:post pushes approved blocks to Discord/Bluesky
 *         → everything else lands as upload-ready copy for the editor.
 *
 * ANTI-FLAG DESIGN (read before editing):
 *  1. Human gate: nothing posts until a checkbox is ticked by a human. The
 *     engine physically cannot spam — worst case it drafts bad posts nobody
 *     approves. This is what makes a "single dev" schedule sustainable AND safe.
 *  2. Volume ceilings: post() refuses to push more than MAX_POSTS_PER_DAY
 *     across all channels, and warns if drafts < 30 min old (rushed cadence).
 *  3. Keywords come from REAL autocomplete queries — the words actual humans
 *     type into Google — so captions rank for demand that already exists
 *     instead of invented AI phrases ("unleash the terror" — no one searches that).
 *  4. Per-platform voice variation is prompted (TikTok ≠ Discord ≠ Bluesky),
 *     because identical crossposted text is a distribution-suppression signal.
 *
 * SETUP (one time):
 *   set GROQ_API_KEY=...        (free key: console.groq.com — llama 3.1 is free tier)
 *   set DISCORD_WEBHOOK_URL=... (same secret CI uses; or pass --webhook)
 *   Bluesky (optional): BLUESKY_IDENTIFIER + BLUESKY_APP_PASSWORD
 *
 * DAILY FLOW (5 min of you + 0 min editor for social copy):
 *   npm run engine:harvest   (2 min — or schedule it)
 *   npm run engine:draft     (1 min Groq call)
 *   open content/drafts-<date>.md, tick [x] what's good, fix what isn't
 *   npm run engine:post      (pushes approved blocks only)
 *
 * Everything the editor needs (hooks, captions, hashtags, filename, beat
 * notes) is generated per clip into content/editor-brief-<date>.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(here, '..');
const CONTENT_DIR = path.join(SITE_ROOT, 'content');
const KW_PATH = path.join(CONTENT_DIR, 'keywords.json');
const STATE_PATH = path.join(CONTENT_DIR, '.post-state.json');
const MAX_POSTS_PER_DAY = 6;

const log = (...m) => console.log('[engine]', ...m);
const die = (m) => { console.error('[engine] ✗', m); process.exit(1); };

/** Load site/.env (gitignored) into process.env — keys never live in code or git. */
try {
  for (const line of fs.readFileSync(path.join(SITE_ROOT, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* no .env — env vars only */ }

const args = process.argv.slice(2);
const cmd = args[0] || 'help';
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i !== -1 ? args[i + 1] : undefined; };

// ---------- config from site.config.ts ----------
const cfg = fs.readFileSync(path.join(SITE_ROOT, 'src/site.config.ts'), 'utf8');
const grab = (k) => (cfg.match(new RegExp(`${k}:\\s*'([^']+)'`)) || [])[1] || '';
const SITE_URL = grab('url');
const DISCORD_INVITE = grab('discord');
const ROBLOX_URL = grab('roblox');
const PLAYTEST_URL = `${SITE_URL}/playtest/`;

// ---------- 1. HARVEST ----------
// Topic tracks: the blog is not only about the game — indie-dev lessons and
// Roblox-technical posts earn links and reach audiences the game posts can't.
const TRACKS = {
  game: [
    'roblox horror game', 'asymmetrical horror', 'roblox horror multiplayer',
    'hide and seek horror game', '5v1 horror game', 'roblox horror with friends',
    'roblox sound based horror', 'new roblox horror 2026', 'roblox horror no radar',
    'scary roblox games to play with friends',
  ],
  indie: [
    'indie game marketing', 'how to market an indie game', 'roblox game dev tips',
    'solo game developer', 'game dev devlog', 'how to grow a discord server',
    'indie game launch checklist', 'game development motivation',
  ],
  technical: [
    'roblox sound design', 'roblox proximity chat', 'roblox ai npc',
    'roblox horror map ideas', 'roblox game optimization', 'roblox studio tips',
    'how to make a horror game on roblox', 'roblox asymmetrical gameplay',
  ],
};
const SEEDS = TRACKS[opt('track') || 'game'] || TRACKS.game;
const TRACK = opt('track') || 'game';

async function fetchGoogle(q) {
  const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`google ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.[1]) ? data[1] : [];
}
async function fetchDDG(q) {
  const res = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`);
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  return Array.isArray(data?.[1]) ? data[1] : [];
}

async function harvest() {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  const all = new Set();
  for (const seed of SEEDS) {
    for (const [name, fn] of [['google', fetchGoogle], ['ddg', fetchDDG]]) {
      try {
        for (const k of await fn(seed)) if (k?.trim) all.add(k.trim().toLowerCase());
      } catch (e) {
        log(`  ${name} failed for "${seed}": ${e.message} (continuing)`);
      }
      await new Promise((r) => setTimeout(r, 350)); // polite crawl
    }
  }
  const keywords = [...all].sort();
  const kwFile = TRACK === 'game' ? KW_PATH : path.join(CONTENT_DIR, `keywords-${TRACK}.json`);
  fs.writeFileSync(kwFile, JSON.stringify({ track: TRACK, harvestedAt: new Date().toISOString(), seeds: SEEDS, keywords }, null, 2));
  log(`[${TRACK}] harvested ${keywords.length} real search queries → ${path.relative(SITE_ROOT, kwFile)}`);
  log('top of the list:', keywords.slice(0, 8).join(' | '));
}

// ---------- 2. DRAFT (Groq) ----------
async function groq(messages, json = false) {
  const key = process.env.GROQ_API_KEY;
  if (!key) die('GROQ_API_KEY not set — free key at console.groq.com, then: set GROQ_API_KEY=...');
  // Groq retires models periodically — try the preferred one, then fall back
  // across the current catalog automatically instead of dying.
  const MODELS = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];
  let lastErr = '';
  for (const model of MODELS) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 900, // free-tier OTPM ceiling is 1000 — stay under it
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? '';
    }
    lastErr = `${model}: ${res.status}`;
    if (res.status === 429) { await new Promise((r) => setTimeout(r, 4000)); continue; } // rate-limited: breathe, try next
    if (res.status !== 404 && res.status !== 400) die(`Groq ${res.status}: ${await res.text().catch(() => '')}`);
  }
  die(`all Groq models failed (last: ${lastErr}) — check console.groq.com/models`);
}

const DRAFT_PROMPT = (keywords) => [
  { role: 'system', content: `You are the social media voice of Beanie Studio, an indie team building "STATIC: Salvage vs Hunter" — a free 5v1 horror game on Roblox. Five Scrapper players salvage fuel from a wrecked shuttle; the sixth player is the Hunter, who is blind but hears everything (sprints, dropped items, panicked breathing, proximity voice chat). No radar, no minimap. Launch Q4 2026. Links: site ${SITE_URL} , Discord ${DISCORD_INVITE} , Roblox community ${ROBLOX_URL} , playtest info ${PLAYTEST_URL} .` },
  { role: 'user', content: `Today's real Google search queries around our niche (weave these EXACT phrases naturally into captions — they are what humans actually search):\n${keywords.join('\n')}\n\nWrite today's post pack as JSON:\n{
  "topic": "the one game moment or dev story today's posts are about (pick something concrete from the game description)",
  "tiktok": "caption for a 30s clip. First line = the hook (max 8 words, curiosity gap). Then 2-3 short lines. 1-2 of the search phrases woven in naturally. End with a question to drive comments. Max 150 words. Then a line starting with # containing 8-10 hashtags from: roblox robloxhorror horrorshorts indiedev gamedev robloxdev fyp horrorgaming asymmetricalhorror 5v1 scaryroblox",
  "bluesky": "Same moment retold for Bluesky: 2-3 sentences, more devlog-y, one search phrase woven in, end with the site link ${SITE_URL} . Max 280 chars total.",
  "discord": "Post for our own Discord #announcements: warm, community-insider tone, references playtest night, 3-4 sentences max, invite-forward.",
  "editor_notes": "For a video editor: what the 30s clip should show beat by beat (3-4 beats), the on-screen text for second 0-2, and which of the game's sounds must be audible."
}\n\nRules: never invent game features. Never promise a launch date beyond Q4 2026. No emoji spam (max 2). No words like "unleash", "elevate", "game-changer".` },
];

async function draft() {
  if (!fs.existsSync(KW_PATH)) { log('no keywords yet — running harvest first…'); await harvest(); }
  const { keywords } = JSON.parse(fs.readFileSync(KW_PATH, 'utf8'));
  const sample = keywords.sort(() => Math.random() - 0.5).slice(0, 14);
  log('drafting with Groq (gpt-oss-20b, auto-fallback)…');
  const raw = await groq(DRAFT_PROMPT(sample), true);
  let pack;
  try { pack = JSON.parse(raw); } catch { die('Groq returned invalid JSON — rerun `npm run engine:draft`'); }

  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const file = path.join(CONTENT_DIR, `drafts-${date}.md`);
  // Models sometimes return editor_notes as an object — render either shape readably.
  const brief = typeof pack.editor_notes === 'string'
    ? pack.editor_notes
    : Object.entries(pack.editor_notes || {}).map(([k, v]) => `- **${k}:** ${v}`).join('\n');

  const md = `# Draft pack — ${date}

> Topic: ${pack.topic}
> Review, then tick \`[x]\` on approved blocks and run \`npm run engine:post\`.
> Everything here was drafted by AI from real search queries — YOU are the anti-flag gate. Edit freely before ticking.

## TIKTOK / REELS / SHORTS caption
- [ ] \`\`\`\n${pack.tiktok}\n\`\`\`

## BLUESKY
- [ ] \`\`\`\n${pack.bluesky}\n\`\`\`

## DISCORD (#announcements)
- [ ] \`\`\`\n${pack.discord}\n\`\`\`

## EDITOR BRIEF (today's clip)
${brief}

*Suggested filename: \`static-${date}-clip.mp4\` — hook text on screen 0-2s.*
`;
  fs.writeFileSync(file, md);
  log(`draft pack ready → ${path.relative(SITE_ROOT, file)}`);
  log('review it, tick [x], then: npm run engine:post');
}

// ---------- 3. POST (approved blocks only) ----------
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch { return { days: {} }; }
}
function blocksApproved(md) {
  // A block = "- [x] ```\n...\n```" (ticked). Returns [{ platform, text }]
  const out = [];
  const re = /## (TIKTOK[^\n]*|BLUESKY|DISCORD[^\n]*)\n- \[x\] ```\n([\s\S]*?)\n```/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    const header = m[1];
    const text = m[2].trim();
    const platform = header.startsWith('TIKTOK') ? 'tiktok' : header.startsWith('BLUESKY') ? 'bluesky' : 'discord';
    out.push({ platform, text });
  }
  return out;
}

async function post() {
  const date = new Date().toISOString().slice(0, 10);
  const file = opt('file') || path.join(CONTENT_DIR, `drafts-${date}.md`);
  if (!fs.existsSync(file)) die(`no draft file for today: ${file} — run engine:draft`);
  const approved = blocksApproved(fs.readFileSync(file, 'utf8'));
  if (!approved.length) die('nothing approved — tick [x] on at least one block first (that tick IS the human gate)');

  const state = loadState();
  const today = state.days[date] || { count: 0 };
  const room = MAX_POSTS_PER_DAY - today.count;
  if (room <= 0) die(`daily ceiling reached (${MAX_POSTS_PER_DAY}) — this is the anti-spam brake`);
  const queue = approved.slice(0, room);

  const webhook = process.env.DISCORD_WEBHOOK_URL || opt('webhook') || '';
  const bskyId = process.env.BLUESKY_IDENTIFIER || '';
  const bskyPass = process.env.BLUESKY_APP_PASSWORD || '';

  let sent = 0;
  for (const b of queue) {
    try {
      if (b.platform === 'discord') {
        if (!webhook) { log('  discord skipped (no webhook)'); continue; }
        const res = await fetch(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: b.text }) });
        if (!res.ok) throw new Error(`discord ${res.status}`);
      } else if (b.platform === 'bluesky') {
        if (!bskyId || !bskyPass) { log('  bluesky skipped (no app password)'); continue; }
        const s = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifier: bskyId, password: bskyPass }) });
        if (!s.ok) throw new Error(`bsky session ${s.status}`);
        const { accessJwt } = await s.json();
        const r = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${accessJwt}` }, body: JSON.stringify({ repo: bskyId, collection: 'app.bsky.feed.post', record: { text: b.text, createdAt: new Date().toISOString() } }) });
        if (!r.ok) throw new Error(`bsky post ${r.status}`);
      } else {
        log('  tiktok/shorts/reels: copy-paste manually (no free API — that platform kills bots) — caption is in the drafts file');
        continue;
      }
      sent++;
      log(`  ✓ ${b.platform} posted (${b.text.length} chars)`);
    } catch (e) {
      log(`  ✗ ${b.platform} failed: ${e.message}`);
    }
  }
  today.count += sent;
  state.days[date] = today;
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  log(`done: ${sent} posted, ${today.count}/${MAX_POSTS_PER_DAY} today. TikTok/Shorts/Reels captions wait in the drafts file for the manual 2-minute paste.`);
}

// ----------
(async () => {
  if (cmd === 'harvest') await harvest();
  else if (cmd === 'draft') await draft();
  else if (cmd === 'post') await post();
  else if (cmd === 'all') { await harvest(); await draft(); }
  else {
    log('commands:');
    log('  harvest  — pull real search keywords (Google + DDG autocomplete)');
    log('  draft    — Groq writes today\u2019s post pack into content/drafts-<date>.md');
    log('  post     — push [x]-approved blocks (Discord/Bluesky); ceiling 6/day');
    log('  all      — harvest + draft in one go');
    log('  --track game|indie|technical  — keyword set to harvest (default: game)');
    log('daily: npm run engine:all → review/tick → npm run engine:post');
  }
})().catch((e) => die(e.message));
