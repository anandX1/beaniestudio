#!/usr/bin/env node
/**
 * blog-ai.mjs — the shared writing brain: env loading, Groq client, brand
 * brief, topic tracks and every prompt the content pipeline uses. Imported
 * by scripts/studio.mjs (Compose UI) and tools/autopilot.mjs (scheduled
 * generation) so the two can never drift apart.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- env: site/.env is the single secret store for every entrypoint ----
const _here = path.dirname(fileURLToPath(import.meta.url));
const _root = path.resolve(_here, '..');
try {
  for (const line of fs.readFileSync(path.join(_root, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* env vars only */ }

export async function groq(messages, { json = false, maxTokens = 980 } = {}) {
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

export const BRAND = `Brand: Beanie Studio — indie team making "STATIC: Salvage vs Hunter", a free 5v1 horror game on Roblox. Five Scrapper players salvage fuel from a wrecked shuttle; the sixth player, the Hunter, is blind and hunts entirely by sound (sprints, dropped scrap, panicked breathing, proximity voice chat). No radar, no minimap. Crossplay, tuned for low-end phones. Launch window Q4 2026. Playtest nights via Discord. Site: https://beaniestudio.site — Discord: https://discord.gg/z8kPT6cRbG — Roblox community: https://www.roblox.com/communities/1108819917/Beanies-studios`;

/** Topic tracks: the blog is not only about the game — indie-dev lessons and
 *  Roblox-technical posts earn links from audiences the game posts can't reach. */
export const BLOG_TRACKS = {
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

export const MARKDOWN_PROMPT = (angle, keywords, track = 'game') => {
  const t = BLOG_TRACKS[track] || BLOG_TRACKS.game;
  return [
    { role: 'system', content: `${BRAND}\n${t.brief}\n\nKEYWORD RULES (critical — violation makes the post useless):\nThese search phrases must be woven into NORMAL sentences so a reader never notices them: ${keywords.join(', ')}.\n- NEVER put a keyword in quotation marks.\n- NEVER use a keyword phrase as a heading by itself — headings must be descriptive sentences or phrases that may CONTAIN a keyword naturally (e.g. \"Why our Hunter hunts by sound alone\", not \"roblox horror game\").\n- Use each phrase at most once. If a phrase cannot fit naturally into a sentence, skip it — natural readability beats keyword presence.\n\nSTYLE: short paragraphs (2-4 sentences). Concrete details over adjectives. Never use "unleash", "elevate", "delve", "seamless", "game-changer", "revolutionize", "testament", "furthermore", "moreover", "utilize", "leverage". Voice: a smart, candid developer. Output ONLY the markdown body (900-1100 words — search depth matters more than brevity; fill it honestly with concrete detail, numbers, examples and mini-stories, never padding. H2 headings with ##, no H1, no title line). No preamble, no code fences.` },
    { role: 'user', content: `Post angle: ${angle}` },
  ];
};

export const META_PROMPT = (markdown, keywords) => [
  { role: 'system', content: 'Return ONLY strict JSON: {"title": string, "description": string}. Title: max 55 chars, compelling, no clickbait. Description: max 150 chars meta description including one of the keywords. No extra keys.' },
  { role: 'user', content: `Keywords: ${keywords.join(', ')}\n\nPost:\n${markdown.slice(0, 1500)}` },
];

export const HUMANIZE_PROMPT = (md) => [
  { role: 'system', content: `You are a humanizing editor. Rewrite the text so it reads like a real developer wrote it fast and honestly: use contractions, vary sentence length (some very short), keep every fact/link/heading intact, kill any remaining AI-isms ("delve", "elevate", "seamless", "robust", "landscape", "testament"), no new facts, no emoji. PRESERVE the full length — the input is ~1000 words on purpose for search depth; output must stay 900+ words and keep every section. Return ONLY the rewritten markdown.` },
  { role: 'user', content: md },
];
