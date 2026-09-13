#!/usr/bin/env node
/**
 * Social auto-broadcaster — the autonomous distribution layer.
 *
 * On every CI run (and the daily cron), reads the freshly built RSS feed and
 * posts anything new to Discord and Bluesky with UTM-tagged links, then
 * records what was posted in .state/social-state.json so the repo itself is
 * the broadcast memory (auditable, diffable, no external service).
 *
 * DESIGN RULES — read before editing:
 *  1. SAFE BY DEFAULT: the first run only SEEDS state (marks everything as
 *     posted) and tells you so. Auto-broadcasting your whole back catalog on
 *     day one is spam. After seeding, ONLY genuinely new items post.
 *  2. Every post ends with the UTM-tagged site URL — attribution is automatic
 *     (utm_source=discord / utm_source=bluesky, utm_medium=social).
 *  3. Partial failure never aborts the pipeline: a Discord webhook outage
 *     must not block the Lighthouse/SEO guard. Exit code is 0 unless BOTH
 *     channels fail with a config error.
 *  4. Secrets come from env only (CI secrets): DISCORD_WEBHOOK_URL,
 *     BLUESKY_IDENTIFIER, BLUESKY_APP_PASSWORD. Missing config = channel
 *     skipped with a note, never a crash.
 *
 * Usage: node scripts/social-post.mjs [--seed] [--rss path] [--state path]
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const SITE_URL = 'https://beaniestudio.site';
const RSS_PATH = opt('rss', 'dist/rss.xml');
const STATE_PATH = opt('state', '.state/social-state.json');
const SEED_ONLY = has('--seed');

const discordWebhook = process.env.DISCORD_WEBHOOK_URL || '';
const blueskyId = process.env.BLUESKY_IDENTIFIER || '';
const blueskyPass = process.env.BLUESKY_APP_PASSWORD || '';

const log = (...m) => console.log('[social-post]', ...m);

/** Parse the built RSS feed with regex — no XML dependency needed for our own known shape. */
function readFeed(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const pick = (tag) => {
      const t = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      if (!t) return '';
      // Decode the handful of entities @astrojs/rss emits.
      return t[1]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    };
    const title = pick('title');
    const link = pick('link');
    const description = pick('description');
    const pubDate = pick('pubDate');
    if (title && link) items.push({ title, link, description, pubDate });
  }
  return items;
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { posted: {} };
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

/** Compose the share copy for one devlog entry. */
function composePost(item, source) {
  // The built feed emits ABSOLUTE urls — never prepend the domain to one that
  // already has it (the double-domain bug in the first real broadcast).
  const base = /^https?:\/\//.test(item.link) ? item.link : SITE_URL + item.link;
  const url = `${base}?utm_source=${source}&utm_medium=social&utm_campaign=devlog`;
  const blurb = item.description.replace(/\s+/g, ' ').slice(0, 120).trim();
  const tail = blurb.endsWith('.') ? blurb : blurb ? blurb + '.' : '';
  return `NEW DEVLOG: ${item.title}\n${tail}\n→ ${url}`;
}

async function postDiscord(text) {
  const res = await fetch(discordWebhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content: text }),
  });
  if (!res.ok) throw new Error(`Discord ${res.status}: ${await res.text().catch(() => '')}`);
}

async function postBluesky(text) {
  // App-password session → record post. Free official API, no bot label.
  const session = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: blueskyId, password: blueskyPass }),
  });
  if (!session.ok) throw new Error(`Bluesky session ${session.status}`);
  const { accessJwt } = await session.json();
  const res = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessJwt}`,
    },
    body: JSON.stringify({
      repo: blueskyId,
      collection: 'app.bsky.feed.post',
      record: {
        text,
        createdAt: new Date().toISOString(),
      },
    }),
  });
  if (!res.ok) throw new Error(`Bluesky post ${res.status}: ${await res.text().catch(() => '')}`);
}

async function main() {
  let xml = '';
  try {
    xml = fs.readFileSync(RSS_PATH, 'utf8');
  } catch {
    log(`RSS feed not found at ${RSS_PATH} — run the build first. Nothing to do.`);
    return;
  }
  const items = readFeed(xml);
  if (!items.length) {
    log('RSS parsed but empty — skipping.');
    return;
  }

  const state = loadState();
  const fresh = items.filter((it) => !state.posted[it.link]);

  // First-ever run: seed, don't spam. The back catalog stays unposted; the
  // operator can pin/share it manually. Everything after this is incremental.
  if (Object.keys(state.posted).length === 0) {
    for (const it of items) state.posted[it.link] = SEED_ONLY ? new Date().toISOString() : new Date().toISOString();
    saveState(state);
    log(`SEEDED ${items.length} existing entries — no auto-posts sent. From now on, only new devlog entries broadcast.`);
    return;
  }

  if (!fresh.length) {
    log(`No new entries (${items.length} known). Nothing to post.`);
    return;
  }

  let discordOk = true;
  let blueskyOk = true;

  for (const it of fresh) {
    log(`New entry: "${it.title}"`);
    if (discordWebhook) {
      try {
        await postDiscord(composePost(it, 'discord'));
        log('  → Discord posted');
      } catch (e) {
        discordOk = false;
        log('  → Discord FAILED:', e.message);
      }
    } else {
      log('  → Discord skipped (DISCORD_WEBHOOK_URL not set)');
    }
    if (blueskyId && blueskyPass) {
      try {
        await postBluesky(composePost(it, 'bluesky'));
        log('  → Bluesky posted');
      } catch (e) {
        blueskyOk = false;
        log('  → Bluesky FAILED:', e.message);
      }
    } else {
      log('  → Bluesky skipped (BLUESKY_IDENTIFIER / BLUESKY_APP_PASSWORD not set)');
    }
    // Mark posted even on channel failure? No — retry next run, but avoid
    // infinite retry loops on permanently-bad config: mark when at least one
    // channel succeeded, else leave unposted for the next cron to retry.
    if (discordOk || blueskyOk) state.posted[it.link] = new Date().toISOString();
  }
  saveState(state);

  if (!discordOk && !blueskyOk) {
    log('All configured channels failed — leaving entries unposted for retry.');
    process.exitCode = 1;
  }
}

main().catch((e) => {
  log('Unexpected failure:', e.message);
  process.exitCode = 1;
});
