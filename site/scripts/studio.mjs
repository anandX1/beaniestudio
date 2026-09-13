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
const DEVLOG_DIR = path.join(SITE_ROOT, 'src', 'devlog');
const BLOG_IMG_DIR = path.join(SITE_ROOT, 'public', 'blog');

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

async function groq(messages, { json = false, maxTokens = 980 } = {}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY missing — put it in site/.env');
  const models = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];
  const call = (model, useJsonMode, extraMsg) =>
    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: extraMsg ? [...messages, { role: 'user', content: extraMsg }] : messages,
        temperature: 0.7,
        max_tokens: maxTokens,
        ...(useJsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

  let last = '';
  for (const model of models) {
    // Up to 3 attempts per model: json-mode → json-mode+guardrail → plain + extraction.
    for (let attempt = 0; attempt < 3; attempt++) {
      const useJson = json && attempt < 2;
      const guard = attempt === 1 ? 'Your previous reply was empty or invalid JSON. Output STRICT valid JSON only — no markdown fences, no commentary, escape all newlines inside string values as \\n. Keep it under 200 words.' : undefined;
      const res = await call(model, useJson, guard);
      if (res.ok) {
        const data = await res.json();
        const choice = data.choices?.[0];
        const content = choice?.message?.content ?? '';
        // Reasoning models can burn the token budget before emitting content —
        // an empty or length-truncated reply is a retryable failure, not a result.
        if (!content.trim() || choice?.finish_reason === 'length') {
          last = `${model}: empty/length-capped output`;
          continue;
        }
        return content;
      }
      const body = await res.text().catch(() => '');
      last = `${model}: ${res.status}`;
      if (res.status === 429) { await new Promise((r) => setTimeout(r, 4000)); break; } // next model
      if (res.status === 400 && body.includes('json_validate_failed') && attempt < 2) continue; // repair loop
      if (res.status !== 404 && res.status !== 400) throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
      if (res.status === 400 && attempt >= 2) break; // next model
    }
  }
  throw new Error(`all Groq models failed (${last})`);
}

const BRAND = `Brand: Beanie Studio — indie team making "STATIC: Salvage vs Hunter", a free 5v1 horror game on Roblox. Five Scrapper players salvage fuel from a wrecked shuttle; the sixth player, the Hunter, is blind and hunts entirely by sound (sprints, dropped scrap, panicked breathing, proximity voice chat). No radar, no minimap. Crossplay, tuned for low-end phones. Launch window Q4 2026. Playtest nights via Discord. Site: https://beaniestudio.site — Discord: https://discord.gg/z8kPT6cRbG — Roblox community: https://www.roblox.com/communities/1108819917/Beanies-studios`;

/** Topic tracks: the blog is not only about the game — indie-dev lessons and
 *  Roblox-technical posts earn links from audiences the game posts can't reach. */
const BLOG_TRACKS = {
  game: {
    label: 'Game — STATIC itself',
    seeds: ['roblox horror game', 'asymmetrical horror', 'roblox horror multiplayer', 'hide and seek horror game', '5v1 horror game', 'roblox horror with friends', 'roblox sound based horror', 'new roblox horror 2026', 'roblox horror no radar', 'scary roblox games to play with friends'],
    brief: 'Post topic: STATIC itself — mechanics, the Hunter, sound design, the wreck, playtest stories, dev progress. Speak as the studio. End CTA: one line inviting readers to the playtest Discord.',
  },
  indie: {
    label: 'Indie dev — lessons & process',
    seeds: ['indie game marketing', 'how to market an indie game', 'roblox game dev tips', 'solo game developer', 'game dev devlog', 'how to grow a discord server', 'indie game launch checklist', 'game development motivation'],
    brief: 'Post topic: indie game development lessons from building STATIC — marketing experiments (real numbers), cutting features, solo-dev process, community building. Useful to ANY indie dev; STATIC is the case study, not the subject. End CTA: one soft line like "we document everything we learn on this blog and in our Discord" — do NOT hard-sell the game.',
  },
  technical: {
    label: 'Roblox technical — how it\u2019s built',
    seeds: ['roblox sound design', 'roblox proximity chat', 'roblox ai npc', 'roblox horror map ideas', 'roblox game optimization', 'roblox studio tips', 'how to make a horror game on roblox', 'roblox asymmetrical gameplay'],
    brief: 'Post topic: Roblox development technique shown through STATIC — sound design, listening AI, optimization for low-end phones, proximity chat. Practical, technical, generous. End CTA: one line pointing to the devlog for more build notes.',
  },
};

const MARKDOWN_PROMPT = (angle, keywords, track = 'game') => {
  const t = BLOG_TRACKS[track] || BLOG_TRACKS.game;
  return [
    { role: 'system', content: `${BRAND}\n${t.brief}\nSEO rules: weave these search phrases naturally into the intro and at least two H2 headings: ${keywords.join(', ')}. Short paragraphs (2-4 sentences). Concrete details over adjectives. Never use "unleash", "elevate", "delve", "seamless", "game-changer", "revolutionize", "testament". Voice: a smart, candid developer. Output ONLY the markdown body (300-420 words, H2 headings with ##, no H1, no title line). No preamble, no code fences.` },
    { role: 'user', content: `Post angle: ${angle}` },
  ];
};

const META_PROMPT = (markdown, keywords) => [
  { role: 'system', content: 'Return ONLY strict JSON: {"title": string, "description": string}. Title: max 55 chars, compelling, no clickbait. Description: max 150 chars meta description including one of the keywords. No extra keys.' },
  { role: 'user', content: `Keywords: ${keywords.join(', ')}\n\nPost:\n${markdown.slice(0, 1500)}` },
];

const HUMANIZE_PROMPT = (md) => [
  { role: 'system', content: `You are a humanizing editor. Rewrite the text so it reads like a real developer wrote it fast and honestly: use contractions, vary sentence length (some very short), keep every fact/link/heading intact, kill any remaining AI-isms ("delve", "elevate", "seamless", "robust", "landscape", "testament"), no new facts, no emoji. Keep it under 400 words. Return ONLY the rewritten markdown.` },
  { role: 'user', content: md },
];

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
  add(words.length >= 350, '≥350 words', `${words.length} words`);
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

  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { score, checks };
}

// ---- helpers ----
const json = (res, code, data) => { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(data)); };
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);

function readBody(req, limit = 6 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('body too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new Error('invalid JSON')); } });
    req.on('error', reject);
  });
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
  for (const img of images.slice(0, 3)) {
    const m = String(img.data || '').match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/s);
    if (!m) continue;
    i++;
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const file = `${slug}-${i}.${ext}`;
    fs.writeFileSync(path.join(BLOG_IMG_DIR, file), Buffer.from(m[2], 'base64'));
    saved.push({ file, markdown: `![${img.alt || title}](/blog/${file})` });
    onLine(`image saved: public/blog/${file}\n`);
  }

  const imageBlock = saved.length ? `\n${saved.map((s) => s.markdown).join('\n\n')}\n` : '';
  const kwLine = keywords.length ? `\n<!-- studio-keywords: ${keywords.join(' | ')} -->\n` : '';
  const post = `---\ntitle: '${title.replace(/'/g, "\\'")}'\ndescription: '${description.replace(/'/g, "\\'")}'\npubDate: ${new Date().toISOString().slice(0, 10)}\ntag: ${['design', 'production', 'systems'].includes(tag) ? tag : 'design'}\ndraft: ${draft ? 'true' : 'false'}\n---\n\n${markdown.trim()}\n${imageBlock}${kwLine}`;
  const postPath = path.join(DEVLOG_DIR, `${slug}.md`);
  fs.writeFileSync(postPath, post);
  onLine(`post written: src/devlog/${slug}.md\n`);

  // Draft mode: write the file and stop — nothing touches the live site
  // until the post is flipped to draft:false and republished.
  if (draft) {
    return json(res, 200, { ok: true, slug, draft: true, url: `(local draft) src/devlog/${slug}.md`, images: saved.map((s) => s.file) });
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
  return json(res, 200, { ok: true, slug, draft, url: `https://beaniestudio.site/devlog/${slug}/`, images: saved.map((s) => s.file) });
}

// ---- UI ----
const UI = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Content Studio — Beanie Studio</title>
<style>
:root{--bg:#101216;--panel:#16181d;--line:#2a2e37;--txt:#e8eaf0;--dim:#9aa3b2;--amber:#ffb547;--green:#4ade80;--red:#f87171}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:14px/1.5 'Segoe UI',system-ui,sans-serif}
header{padding:14px 20px;border-bottom:1px solid var(--line);display:flex;gap:14px;align-items:baseline}
header h1{font-size:16px;margin:0;letter-spacing:.08em;text-transform:uppercase}
header .tag{color:var(--dim);font-size:12px}
main{display:grid;grid-template-columns:260px 1fr 250px;gap:14px;padding:14px 20px;max-width:1500px;margin:0 auto}
@media(max-width:1000px){main{grid-template-columns:1fr}}
section{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px}
h2{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--amber);margin:0 0 10px}
.kw{display:inline-block;margin:2px;padding:3px 8px;border:1px solid var(--line);border-radius:99px;font-size:12px;cursor:pointer;user-select:none}
.kw:hover{border-color:var(--amber)}
.kw.on{background:var(--amber);color:#101216;border-color:var(--amber)}
button{background:var(--amber);color:#101216;border:0;border-radius:8px;padding:9px 14px;font-weight:700;cursor:pointer;font-size:13px}
button.sec{background:transparent;color:var(--amber);border:1px solid var(--amber)}
button:disabled{opacity:.5;cursor:wait}
input,select,textarea{width:100%;background:#0d0f12;color:var(--txt);border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit;margin:4px 0 10px}
textarea{min-height:260px;font:13px/1.6 ui-monospace,Consolas,monospace;resize:vertical}
label{font-size:12px;color:var(--dim);text-transform:uppercase;letter-spacing:.08em}
.row{display:flex;gap:10px}.row>*{flex:1}
#seo{position:sticky;top:10px}
.check{display:flex;gap:8px;padding:3px 0;font-size:13px;align-items:baseline}
.check b{font-size:14px}.ok b{color:var(--green)}.bad b{color:var(--red)}
#score{font-size:34px;font-weight:800;text-align:center;padding:6px 0}
#log{background:#0d0f12;border:1px solid var(--line);border-radius:8px;padding:8px;font:11px/1.5 ui-monospace,monospace;max-height:130px;overflow:auto;white-space:pre-wrap;color:var(--dim);margin-top:10px}
.post{padding:6px 0;border-bottom:1px solid var(--line);font-size:13px}
.post .d{color:var(--dim);font-size:11px}
.badge{font-size:10px;color:var(--amber);border:1px solid var(--amber);border-radius:4px;padding:0 4px;margin-left:6px}
#imgs>div{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--dim);padding:2px 0}
</style></head><body>
<header><h1>Content Studio</h1><span class="tag">local · 127.0.0.1 · keywords → groq → humanize → seo → publish</span></header>
<main>
<section>
  <h2>Trending keywords</h2>
  <div style="display:flex;gap:6px;margin-bottom:8px"><button class="sec" id="reharvest" style="flex:1">Refresh harvest</button></div>
  <div id="kwlist" style="max-height:420px;overflow:auto"></div>
</section>
<section>
  <h2>Draft</h2>
  <label>Topic track</label>
  <select id="track"><option value="game">Game — STATIC itself</option><option value="indie">Indie dev — lessons &amp; process</option><option value="technical">Roblox technical — how it's built</option></select>
  <label>Post angle (what's the story?)</label>
  <input id="angle" placeholder="e.g. how the Hunter's hearing actually works">
  <label>Using keywords (click left to add)</label>
  <div id="chosen" style="min-height:26px;margin-bottom:8px;color:var(--dim);font-size:12px">none yet</div>
  <div class="row">
    <div><label>Title</label><input id="title"></div>
    <div style="max-width:140px"><label>Tag</label><select id="tag"><option>design</option><option>production</option><option>systems</option></select></div>
  </div>
  <label>Meta description</label><input id="desc" maxlength="170">
  <label>Markdown</label>
  <textarea id="md" placeholder="Draft it with Groq, or write/paste your own…"></textarea>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button id="draft">Draft with Groq</button>
    <button class="sec" id="humanize">Humanize pass</button>
    <button class="sec" id="adapt">Adapt for X · Reddit · Telegram · LinkedIn</button>
    <label class="sec" style="border:1px solid var(--amber);border-radius:8px;padding:8px 12px;cursor:pointer">Attach images<input type="file" id="imgfile" accept="image/*" multiple style="display:none"></label>
  </div>
  <div id="share" style="margin-top:10px"></div>
  <div id="imgs"></div>
  <div style="margin-top:12px;font-size:12px;color:var(--dim)"><label style="text-transform:none;letter-spacing:0;color:var(--dim)"><input type="checkbox" id="asDraft" style="width:auto;margin-right:6px">Publish as draft (hidden from the site until you flip draft:false)</label></div>
  <div style="margin-top:8px"><button id="publish" style="width:100%">Publish to blog →</button></div>
  <div style="margin-top:6px"><button class="sec" id="deploy" style="width:100%">Deploy site now (build → push → ping)</button></div>
  <div id="log">ready.</div>
</section>
<section id="seo">
  <h2>SEO lint</h2>
  <div id="score">–</div>
  <div id="checks"></div>
  <hr style="border-color:var(--line);margin:12px 0">
  <h2>Post stats <button class="sec" id="statrefresh" style="float:right;padding:2px 8px;font-size:10px">refresh</button></h2>
  <div id="stats" style="font-size:12px;color:var(--dim)">loading…</div>
  <div id="kwtop" style="margin-top:12px"></div>
  <hr style="border-color:var(--line);margin:12px 0">
  <h2>Blog posts</h2>
  <div id="posts"></div>
</section>
</main>
<script>
var chosen = [];
var images = [];
function $(id){return document.getElementById(id)}
function log(m){var l=$('log');l.textContent+=m;l.scrollTop=l.scrollHeight}
async function api(path,body){var r=await fetch(path,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{});var d=await r.json().catch(function(){return{error:'bad response'}});if(!r.ok)throw new Error(d.error||r.status);return d}
function renderChosen(){$('chosen').textContent=chosen.length?chosen.join('  ·  '):'none yet'}
function renderKws(list){$('kwlist').innerHTML='';list.forEach(function(k){var s=document.createElement('span');s.className='kw';s.textContent=k;s.onclick=function(){if(chosen.indexOf(k)<0){chosen.push(k);s.classList.add('on');renderChosen()}};$('kwlist').appendChild(s)})}
function trk(){return document.getElementById('track').value}
async function loadKeywords(){try{var d=await api('/api/keywords?track='+trk());renderKws(d.keywords||[]);var f=d.harvestedAt?new Date(d.harvestedAt).toLocaleString():'never';document.querySelector('#kwlist').insertAdjacentHTML('beforebegin','<div style="font-size:11px;color:var(--dim);margin-bottom:6px">'+(d.keywords||[]).length+' queries · harvested '+f+'</div>')}catch(e){log('keywords: '+e.message+'\\n')}}
async function loadPosts(){try{var d=await api('/api/posts');$('posts').innerHTML='';d.posts.forEach(function(p){var e=document.createElement('div');e.className='post';e.innerHTML='<div>'+p.title+(p.draft?'<span class="badge">draft</span>':'')+'</div><div class="d">'+(p.pubDate||'')+' · '+p.file+'</div>';$('posts').appendChild(e)})}catch(e){}}
function lint(){var r=apiLater();function apiLater(){return null}var title=$('title').value,desc=$('desc').value,md=$('md').value;
  fetch('/api/seo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:title,description:desc,markdown:md,keywords:chosen})}).then(function(r){return r.json()}).then(function(d){
    $('score').textContent=d.score+' / 100';$('score').style.color=d.score>=80?'var(--green)':d.score>=55?'var(--amber)':'var(--red)';
    $('checks').innerHTML='';d.checks.forEach(function(c){var e=document.createElement('div');e.className='check '+(c.ok?'ok':'bad');e.innerHTML='<b>'+(c.ok?'✓':'✗')+'</b><span>'+c.label+(c.detail?' <span style="color:var(--dim)">('+c.detail+')</span>':'')+'</span>';$('checks').appendChild(e)})})}
$('reharvest').onclick=function(){var b=this;b.disabled=true;b.textContent='harvesting…';api('/api/harvest?track='+trk(),{}).then(function(d){renderKws(d.keywords||[]);b.disabled=false;b.textContent='Refresh harvest'}).catch(function(e){log('harvest: '+e.message+'\\n');b.disabled=false;b.textContent='Refresh harvest'})};
$('draft').onclick=function(){var b=this;if(!$('angle').value){log('angle required — what is the post about?\\n');return}b.disabled=true;b.textContent='drafting…';log('\\ngroq is writing…\\n');api('/api/draft',{angle:$('angle').value,keywords:chosen,track:trk()}).then(function(d){$('title').value=d.title;$('desc').value=d.description;$('md').value=d.markdown;lint();log('draft ready — edit freely.\\n')}).catch(function(e){log('draft: '+e.message+'\\n')}).finally(function(){b.disabled=false;b.textContent='Draft with Groq'})};
$('humanize').onclick=function(){var b=this;if(!$('md').value){log('nothing to humanize\\n');return}b.disabled=true;log('\\nhumanize pass…\\n');api('/api/humanize',{markdown:$('md').value}).then(function(d){$('md').value=d.markdown;lint();log('humanized.\\n')}).catch(function(e){log('humanize: '+e.message+'\\n')}).finally(function(){b.disabled=false})};
$('imgfile').onchange=function(){[].forEach.call(this.files,function(f){var rd=new FileReader();rd.onload=function(){var data=String(rd.result);images.push({name:f.name,data:data,alt:$('title').value||'image'});var e=document.createElement('div');e.textContent='▲ '+f.name+' ('+Math.round(data.length/1365)+' KB) — attached';$('imgs').appendChild(e)};rd.readAsDataURL(f)});this.value=''};
$('publish').onclick=function(){var b=this;b.disabled=true;b.textContent=document.getElementById('asDraft').checked?'saving draft…':'publishing…';log('\\npublishing…\\n');api('/api/publish',{title:$('title').value,description:$('desc').value,tag:$('tag').value,markdown:$('md').value,keywords:chosen,images:images,draft:document.getElementById('asDraft').checked).then(function(d){log('\\n✓ '+(d.draft?'saved as draft post (not on site yet)':'LIVE: '+d.url)+'\\n');loadPosts()}).catch(function(e){log('publish: '+e.message+'\\n')}).finally(function(){b.disabled=false;b.textContent='Publish to blog →'})};
$('title').oninput=$('desc').oninput=$('md').oninput=lint;
$('track').onchange=function(){loadKeywords()};
async function loadStats(){try{var d=await api('/api/stats');var el=$('stats');if(!d.configured){el.innerHTML='<div style="border:1px solid var(--line);border-radius:8px;padding:10px">'+
  '<b style="color:var(--txt)">What you will see here once connected:</b>'+
  '<ul style="margin:8px 0 8px 18px;padding:0;color:var(--dim)">'+
  '<li>pageviews per blog post (last 30 days)</li>'+
  '<li>which platform sent them (utm_source: x / reddit / discord / tiktok)</li>'+
  '<li>which keywords actually pulled traffic</li></ul>'+
  '<b style="color:var(--txt)">One-time setup (2 min):</b>'+
  '<ol style="margin:8px 0 8px 18px;padding:0;color:var(--dim)">'+
  '<li>Cloudflare dash → My Profile → API Tokens → Create → permission <i>Web Analytics Reports: Read</i></li>'+
  '<li>paste into <code>site/.env</code>:<br><code style="color:var(--amber)">CF_API_TOKEN=…</code> and <code style="color:var(--amber)">CF_SITE_TAG=…</code><br><span style="opacity:.7">(site tag = the "token" value inside your beacon snippet)</span></li>'+
  '<li>click refresh above</li></ol>'+
  '<a href="https://dash.cloudflare.com/?to=/:account/web-analytics" target="_blank" style="color:var(--amber)">Open Cloudflare Web Analytics dashboard ↗</a> — live data is there right now (visitors, pages, referrers).</div>';return}el.innerHTML=d.ok?'<b style="color:var(--green)">✓ connected</b> — per-path pageviews flowing. Detailed tables render in the Cloudflare dashboard (button below).<br><a href="https://dash.cloudflare.com/?to=/:account/web-analytics" target="_blank" style="color:var(--amber)">Open full analytics ↗</a>':'token issue — check CF_API_TOKEN / CF_SITE_TAG in site/.env'}catch(e){$('stats').textContent='stats: '+e.message}}
async function loadKwTop(){try{var d=await api('/api/keywords');var ks=(d.keywords||[]).slice(0,10);var el=$('kwtop');el.innerHTML='<b style="color:var(--txt)">Top trending queries right now:</b><div style="margin-top:6px;line-height:2">'+ks.map(function(k){return '<span class="kw" style="cursor:default">'+k+'</span>'}).join(' ')+'</div><div style="opacity:.6;margin-top:4px">these are real Google searches people type — full list in the left panel</div>'}catch(e){}}
$('statrefresh').onclick=loadStats;
$('deploy').onclick=function(){var b=this;b.disabled=true;b.textContent='deploying…';log(' deploying: build, push, ping ');api('/api/deploy',{}).then(function(d){log(' deploy finished, exit '+d.code+' ');if(d.code===0)loadPosts()}).catch(function(e){log(' deploy: '+e.message+' ')}).finally(function(){b.disabled=false;b.textContent='Deploy site now (build → push → ping)'})};
$('adapt').onclick=function(){var b=this;b.disabled=true;b.textContent='adapting…';api('/api/adapt',{title:$('title').value,markdown:$('md').value}).then(function(d){var el=$('share');el.innerHTML='';Object.keys(d.variants).forEach(function(p){var v=d.variants[p];var box=document.createElement('div');box.style.cssText='border:1px solid var(--line);border-radius:8px;padding:8px;margin-top:6px;font-size:12px';box.innerHTML='<b style="color:var(--amber)">'+p.toUpperCase()+'</b> <span style="color:var(--dim)">'+v.note+'</span>';var pre=document.createElement('div');pre.style.cssText='margin:6px 0;white-space:pre-wrap;background:#0d0f12;border-radius:6px;padding:6px';pre.textContent=v.text||'';var row=document.createElement('div');row.style.cssText='display:flex;gap:6px';var cp=document.createElement('button');cp.className='sec';cp.style.padding='4px 10px';cp.style.fontSize='11px';cp.textContent='Copy';cp.onclick=function(){navigator.clipboard.writeText(v.text||'').then(function(){cp.textContent='Copied'})};row.appendChild(cp);if(v.intent){var op=document.createElement('button');op.style.padding='4px 10px';op.style.fontSize='11px';op.textContent='Open '+p;op.onclick=function(){window.open(v.intent,'_blank')}}box.appendChild(pre);box.appendChild(row);el.appendChild(box)})}).catch(function(e){log(' adapt: '+e.message+' ')}).finally(function(){b.disabled=false;b.textContent='Adapt for X · Reddit · Telegram · LinkedIn'})};
loadKeywords();loadStats();loadKwTop();loadPosts();
</script></body></html>`;

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
      const markdown = (await groq(MARKDOWN_PROMPT(angle, kws, track), { maxTokens: 980 })).replace(/^```(markdown)?\n?|\n?```$/g, '').trim();
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
      const src = postUrl || `https://beaniestudio.site/devlog/${slugify(title)}/`;
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
        return json(res, 200, { configured: false, hint: 'Add CF_API_TOKEN to site/.env (Cloudflare dash → My Profile → API Tokens → "Web Analytics reports:read" permission). Until then, use the utm breakdown in the Web Analytics dashboard.' });
      }
      const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
      const until = new Date().toISOString().slice(0, 10);
      const siteTag = process.env.CF_SITE_TAG || '';
      const q = `query { viewer { accounts(filter: {}) { webAnalyticsReports(limit: 1, filter: { siteTag: "${siteTag}", date_geq: "${since}", date_leq: "${until}" }) { topPages { pageInfo { count } rows: topPages(limit: 20) { pageViews date } } } } } }`;
      const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: q }),
      });
      const body = await r.json().catch(() => null);
      if (!r.ok || !body?.data) return json(res, 200, { configured: true, ok: false, hint: `CF API said ${r.status} — check token permission or site tag. Raw: ${JSON.stringify(body).slice(0, 200)}` });
      return json(res, 200, { configured: true, ok: true, data: body.data });
    }

    if (url.pathname === '/api/humanize' && req.method === 'POST') {
      const { markdown } = await readBody(req, 1024 * 1024);
      if (!markdown?.trim()) return json(res, 400, { error: 'markdown required' });
      const out = await groq(HUMANIZE_PROMPT(markdown), { maxTokens: 980 });
      return json(res, 200, { markdown: out });
    }

    if (url.pathname === '/api/publish' && req.method === 'POST') {
      const body = await readBody(req);
      const lines = [];
      const onLine = (s) => { lines.push(s); process.stdout.write(`[studio] ${String(s).split('\n')[0]}\n`); };
      return await publish(body, res, onLine);
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
