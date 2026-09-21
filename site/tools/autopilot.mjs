#!/usr/bin/env node
/**
 * autopilot.mjs — the content factory. One command, four jobs:
 *
 *   node tools/autopilot.mjs fill      # (re)fill the 100-post schedule via Groq
 *   node tools/autopilot.mjs tick      # publish today's post if due (cron/task calls this)
 *   node tools/autopilot.mjs status    # JSON status for the Studio tab
 *   node tools/autopilot.mjs refresh <slug>  # stats-aware rewrite of a live post
 *
 * Design laws:
 *   • ONE post per day, never more (the anti-spam law — see BLOG-100 honest math).
 *     `tick` is idempotent: a second run the same day does nothing.
 *   • Preferred publish window comes from content/autopilot-config.json
 *     (default 22:00 IST ≈ prime Roblox evening traffic;
 *     the "perfect time" is a hypothesis the analytics tab will confirm/refute).
 *   • Generation is SLOW (Groq free tier) → `fill` writes posts in batches and
 *     is resumable: re-run and it continues where it stopped.
 *   • Everything goes through scripts/publish-core.mjs — the exact pipeline the
 *     human Studio button uses (thin guard → build gate → deploy → IndexNow).
 *   • Queue JSON files (content/queue/) ARE the schedule: NNN-slug.json with
 *     scheduledFor date. Studio's Queue tab renders them; editing one and
 *     republishing is always possible — the autopilot never fights the human.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { groq, BRAND, BLOG_TRACKS, MARKDOWN_PROMPT, META_PROMPT } from '../scripts/blog-ai.mjs';
import { publishAsync } from '../scripts/publish-core.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(here, '..');
const CONTENT_DIR = path.join(SITE_ROOT, 'content');
const QUEUE_DIR = path.join(CONTENT_DIR, 'queue');
const LOG_PATH = path.join(CONTENT_DIR, 'autopilot-log.jsonl');
const CFG_PATH = path.join(SITE_ROOT, 'tools', 'autopilot-config.json');
const IDEAS_PATH = path.join(SITE_ROOT, 'BLOG-100.md');
const BLOG_DIR = path.join(SITE_ROOT, 'src', 'blog');

const cfg = JSON.parse(fs.readFileSync(CFG_PATH, 'utf8'));
const log = (obj) => fs.appendFileSync(LOG_PATH, JSON.stringify({ at: new Date().toISOString(), ...obj }) + '\n');

// ---------- idea bank (same parser as Studio) ----------
function parseIdeas() {
  if (!fs.existsSync(IDEAS_PATH)) return [];
  const text = fs.readFileSync(IDEAS_PATH, 'utf8');
  const tierRe = /^## TIER (\d) — (.+)$/gm;
  const ideaRe = /^(\d+)\.\s+\*\*(.+?)\*\*\s+—\s+(.*)$/gm;
  const tiers = [...text.matchAll(tierRe)];
  const ideas = [];
  tiers.forEach((m, i) => {
    const start = m.index + m[0].length;
    const end = i + 1 < tiers.length ? tiers[i + 1].index : text.length;
    for (const im of text.slice(start, end).matchAll(ideaRe)) {
      const n = Number(im[1]);
      const track = ((n >= 21 && n <= 33) || (n >= 63 && n <= 75)) ? 'technical'
        : ((n >= 46 && n <= 62) || n >= 86) ? 'indie' : 'game';
      ideas.push({ n, slug: im[2].replace(/\/$/, ''), note: im[3].trim(), track });
    }
  });
  return ideas;
}

function publishedSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return new Set();
  return new Set(fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')));
}

function queueFiles() {
  if (!fs.existsSync(QUEUE_DIR)) return [];
  return fs.readdirSync(QUEUE_DIR).filter((f) => f.endsWith('.json')).sort();
}

// ---------- keywords per track (harvest pools; fall back to seeds) ----------
function keywordsFor(track) {
  const p = path.join(CONTENT_DIR, track === 'game' ? 'keywords.json' : `keywords-${track}.json`);
  try {
    const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (Array.isArray(arr) && arr.length) return arr.slice(0, 6);
  } catch { /* fall through */ }
  return (BLOG_TRACKS[track] || BLOG_TRACKS.game).seeds.slice(0, 5);
}

// ---------- idea classification: live-fact vs evergreen ----------
// Live-fact posts make claims about the CURRENT world (which games exist,
// what things cost, platform policies, trend charts). A model without
// research hallucinates exactly these — game titles, prices, IDs. They are
// RESERVED FOR THE AGENT (web + SERP research) and the tick will never
// auto-publish them as stubs. Evergreen posts (tutorials, definitions,
// our own mechanics, process lessons) are safe for generation.
const LIVE_PATTERNS = [
  /best-|scariest-|top-\d|new-|-2025|-2026|recap|trending|tiktok|reddit-says|under-the-radar|watch-on-twitch/,
  /sound-ids|music-and-sound|sound-codes|thumbnail-downloader/,
  /how-much-do-.*-make|devex-explained|budget-breakdown/,
  /voice-chat-not-working|vc-|proximity-chat/,
  /rat-horror|horror-movies|not-roblox/,
];
const isLiveIdea = (slug) => LIVE_PATTERNS.some((re) => re.test(slug));

// ---------- generation ----------
async function generatePost(idea, kwOverride) {
  const keywords = kwOverride || keywordsFor(idea.track);
  const angle = `${idea.slug.replace(/-/g, ' ')} — ${idea.note}`;
  const md = await groq(MARKDOWN_PROMPT(angle, keywords, idea.track), { maxTokens: 2600 });
  const metaRaw = await groq(META_PROMPT(md, keywords), { json: true, maxTokens: 400 });
  let meta = {};
  try { meta = JSON.parse(metaRaw); } catch { /* fallback below */ }
  const title = (meta.title || idea.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())).slice(0, 60);
  const description = (meta.description || `${title} — from the Beanie Studio dev blog on STATIC, the free 5v1 horror game on Roblox.`).slice(0, 160);
  const body = md
    .replace(/^```[a-z]*\n?|```$/gm, '')
    .replace(/\b(delve|seamless|elevate|testament|unleash|furthermore|moreover|utilize|leverage)\b/gi, '')
    .trim();
  return { title, description, markdown: body, keywords, track: idea.track, idea: idea.n };
}

// ---------- commands ----------
async function fill() {
  fs.mkdirSync(QUEUE_DIR, { recursive: true });
  const ideas = parseIdeas();
  const done = publishedSlugs();
  // Existing queue posts (the hand-written ones use their own numbering) —
  // match ideas against their slugs too so fill never duplicates them.
  const queuedSlugs = queueFiles().map((f) => f.replace(/^\d+-/, '').replace(/\.json$/, ''));
  const existing = new Set(queueFiles().map((f) => { try { return JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, f), 'utf8')).id || f; } catch { return f; } }));
  const scheduled = [];
  const startDate = new Date(cfg.nextPublishDate || new Date().toISOString().slice(0, 10));

  // Schedule order: Tier 1 first (converter intent), then 2, 3, 4.
  const byTier = [1, 2, 3, 4].flatMap((t) => ideas.filter((i) => {
    const tier = i.n <= 15 ? 1 : i.n <= 45 ? 2 : i.n <= 75 ? 3 : 4;
    return tier === t;
  }));

  let day = 0;
  for (const idea of byTier) {
    if (scheduled.length >= cfg.targetCount - done.size) break;
    const slugHint = idea.slug.replace(/\/$/, '');
    // skip already-published (by fuzzy slug match) or already scheduled
    if ([...done].some((s) => s.includes(slugHint.slice(0, 18)) || slugHint.includes(s.slice(0, 18)))) continue;
    if (queuedSlugs.some((q) => q.includes(slugHint.slice(0, 18)) || slugHint.includes(q.slice(0, 18)))) continue;
    const qid = String(idea.n).padStart(3, '0') + '-' + slugHint;
    if (existing.has(qid) || fs.existsSync(path.join(QUEUE_DIR, qid + '.json'))) continue;
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    // LIVE-FACT ideas: placeholder only — the agent researches and writes
    // these with real sources. No date, no generation, never auto-published.
    if (isLiveIdea(idea.slug)) {
      fs.writeFileSync(path.join(QUEUE_DIR, qid + '.json'), JSON.stringify({
        id: qid, idea: idea.n, track: idea.track, title: idea.slug.replace(/-/g, ' '),
        needsResearch: true, scheduledFor: null,
        note: 'LIVE-FACT post — reserved for agent research (real games, real numbers, real sources). Pinged in Studio → Autopilot.',
      }, null, 1));
      log({ op: 'reserve-live', id: qid });
      continue; // does not consume a day
    }
    scheduled.push({ qid, idea, date: date.toISOString().slice(0, 10) });
    day++;
  }

  console.log(`to generate: ${scheduled.length} posts (queue currently ${queueFiles().length}, published ${done.size})`);
  let made = 0;
  for (const s of scheduled) {
    try {
      console.log(`  generating #${s.idea.n} ${s.idea.slug} …`);
      const post = await generatePost(s.idea);
      post.id = s.qid;
      post.scheduledFor = s.date;
      fs.writeFileSync(path.join(QUEUE_DIR, s.qid + '.json'), JSON.stringify(post, null, 1));
      log({ op: 'generate', id: s.qid, title: post.title });
      made++;
      if (made % cfg.groqBatchSize === 0) {
        console.log(`  batch of ${cfg.groqBatchSize} done — pausing ${cfg.batchPauseMs / 1000}s (rate limits + resumable)`);
        await new Promise((r) => setTimeout(r, cfg.batchPauseMs));
      }
    } catch (e) {
      log({ op: 'generate-error', id: s.qid, error: e.message });
      console.log(`  ✗ ${s.qid}: ${e.message} — continuing`);
    }
  }
  console.log(`✓ generated ${made} posts. Queue: ${queueFiles().length}. Re-run 'fill' anytime to top up.`);
}

/** Thin-generation guard: a token-capped stub (we shipped 38-word posts once)
 *  gets ONE retry at higher budget; if still thin it is parked needsHuman —
 *  never scheduled, never auto-published. */

/** Single source of truth for "should we publish now?" — used by tick AND
 *  status. Eligibility = scheduled today-or-earlier AND written AND ≥600w
 *  AND not flagged needsResearch/needsHuman. */
function dueCheck() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (cfg.nextPublishDate && today < cfg.nextPublishDate) return { due: false, reason: `autopilot arms on ${cfg.nextPublishDate}` };
  const last = lastPublishedDate();
  if (last === today) return { due: false, reason: `already published today (${last})` };
  const [h, m] = (cfg.publishTime || '09:00').split(':').map(Number);
  const dueTime = new Date(now); dueTime.setHours(h, m, 0, 0);
  if (now < dueTime) return { due: false, reason: `before publish time ${cfg.publishTime}` };
  let post = null, file = null;
  const skipped = [];
  for (const f of queueFiles()) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, f), 'utf8'));
      const wc = String(p.markdown || '').replace(/\[\s*photo\s*\]/gi, ' ').trim().split(/\s+/).filter(Boolean).length;
      if (p.needsResearch || p.needsHuman) { skipped.push(`${p.id} (${p.needsResearch ? 'needs agent research' : 'needs human'})`); continue; }
      if (!p.markdown || wc < 600) { skipped.push(`${p.id} (thin: ${wc}w)`); continue; }
      if ((p.scheduledFor || '9999') > today) continue;
      post = p; file = f; break;
    } catch { continue; }
  }
  if (!post) {
    const reason = queueFiles().length ? `no eligible post — waiting on: ${skipped.slice(0, 3).join(', ') || 'future schedule'}` : 'queue empty';
    return { due: false, reason };
  }
  return { due: true, post, file };
}

function lastPublishedDate() {
  try {
    const lines = fs.readFileSync(LOG_PATH, 'utf8').trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const l = JSON.parse(lines[i]);
      if (l.op === 'publish-ok') return l.date;
    }
  } catch { /* none */ }
  return null;
}

async function tick() {
  await maybeTopUp();
  const c = dueCheck();
  if (!c.due) { console.log('autopilot: not due —', c.reason); log({ op: 'tick-skip', reason: c.reason }); return; }
  const post = c.post, file = c.file;
  const today = new Date().toISOString().slice(0, 10);
  console.log(`autopilot: publishing ${post.id} — "${post.title}"`);
  log({ op: 'publish-start', id: post.id, title: post.title });
  const res = await publishAsync({ title: post.title, description: post.description, tag: post.tag || 'design', markdown: post.markdown, keywords: post.keywords || [], images: [], draft: false });
  res.log.forEach((l) => console.log('  ' + l));
  if (res.ok && !res.draft) {
    fs.rmSync(path.join(QUEUE_DIR, file), { force: true });
    log({ op: 'publish-ok', id: post.id, url: res.url, date: new Date().toISOString().slice(0, 10) });
    console.log('✓ live:', res.url);
  } else {
    log({ op: 'publish-fail', id: post.id, error: res.error });
    console.log('✗ failed:', res.error, '— will retry next tick');
  }
  await maybeTopUp();
}

/** Queue top-up: twice a day max, only when runway is low. Fill is resumable
 *  and batch-paced, so repeated calls grind forward without burning the
 *  Groq free-tier budget faster than it refills. */
async function maybeTopUp() {
  const mark = path.join(CONTENT_DIR, 'last-fill.stamp');
  if (fs.existsSync(mark) && Date.now() - fs.statSync(mark).mtimeMs < 12 * 3600e3) return;
  if (queueFiles().length >= 15) return; // plenty of runway
  fs.writeFileSync(mark, String(Date.now()));
  console.log('queue runway low — topping up (batch-paced, resumable)');
  log({ op: 'topup-start', queueSize: queueFiles().length });
  try { await fill(); } catch (e) { log({ op: 'topup-error', error: e.message }); }
}

function status() {
  const queue = queueFiles().map((f) => { try { return JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, f), 'utf8')); } catch { return null; } }).filter(Boolean);
  const done = publishedSlugs();
  const c = dueCheck();
  const out = {
    now: new Date().toISOString(),
    publishTime: cfg.publishTime,
    dueNow: c.due,
    dueReason: c.reason || null,
    nextPost: queue.sort((a, b) => (a.scheduledFor || '').localeCompare(b.scheduledFor || ''))[0] ? {
      id: queue[0].id, title: queue[0].title, scheduledFor: queue[0].scheduledFor,
    } : null,
    queueSize: queue.length,
    publishedTotal: done.size,
    target: cfg.targetCount,
    lastPublished: lastPublishedDate(),
  };
  console.log(JSON.stringify(out, null, 2));
  return out;
}

async function refresh(slug) {
  const file = path.join(BLOG_DIR, slug + '.md');
  if (!fs.existsSync(file)) { console.error('no such post: ' + slug); process.exit(1); }
  const raw = fs.readFileSync(file, 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
  const pick = (k) => (fm.match(new RegExp(`${k}:\\s*(.+)`)) || [])[1]?.replace(/^['"]|['"]$/g, '') || '';
  const title = pick('title');
  const oldWords = raw.replace(/^---[\s\S]*?---/, '').trim().split(/\s+/).length;
  console.log(`refreshing "${title}" (${oldWords} words) with fresh 2026 context…`);
  const kwMatch = raw.match(/<!-- studio-keywords: (.+?) -->/);
  const keywords = kwMatch ? kwMatch[1].split(' | ') : keywordsFor('game');
  const md = await groq([
    { role: 'system', content: `${BRAND}\nYou are updating an existing blog post to be more useful and current. Keep the same voice, keep every heading that still makes sense, add what's new, cut what's stale. Output ONLY the new markdown body (1000-1200 words), no title, no fences.` },
    { role: 'user', content: `Current post:\n\n${raw.replace(/^---[\s\S]*?---/, '').slice(0, 6000)}` },
  ], { maxTokens: 2600 });
  const body = md.replace(/^```[a-z]*\n?|```$/gm, '').trim();
  const updated = raw.replace(/^(## [\s\S]*)$/m, body) // replace from first H2 on
    .replace(/^---\n([\s\S]*?)\n---/, (m) => m.replace(/updatedDate: .*/, 'updatedDate: ' + new Date().toISOString().slice(0, 10)));
  fs.writeFileSync(file, updated);
  console.log('rewritten — building+deploying…');
  const res = await publishAsync({ title, description: pick('description') || title, tag: pick('tag') || 'design', markdown: body, keywords, images: [], draft: false });
  res.log.forEach((l) => console.log('  ' + l));
  console.log(res.ok ? '✓ refreshed: ' + res.url : '✗ ' + res.error);
}

// ---------- main ----------
const [cmd, arg] = process.argv.slice(2);
if (cmd === 'fill') await fill();
else if (cmd === 'tick') await tick();
else if (cmd === 'status') status();
else if (cmd === 'refresh') await refresh(arg);
else {
  console.log('usage: node tools/autopilot.mjs fill|tick|status|refresh <slug>');
  process.exit(1);
}
