#!/usr/bin/env node
/**
 * Live production SEO audit — fetches the DEPLOYED site (not the build) and
 * verifies what search engines actually see: titles, descriptions, canonicals,
 * robots directives, OG/Twitter tags, JSON-LD types, and the infrastructure
 * files (robots.txt, llms.txt, sitemap, RSS, 404 handling, https redirect).
 *
 * Complements `npm run check:links` (build-time) — run this AFTER a deploy:
 *   node scripts/audit-live.mjs
 *
 * Exit code 1 if any check fails.
 */
const SITE = 'https://beaniestudio.site';
const KEY_FILE = 'c2769c2629e7b24f6076ecdc17b61001.txt';

let pass = 0;
let fail = 0;
let urls = [];
const failures = [];

function check(name, ok, detail = '') {
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/** Advisory: reported, never fails the audit. */
function advise(name, ok, detail = '') {
  console.log(`  ${ok ? '✓' : '·'} ${name}${ok ? '' : ` (advisory${detail ? ` — ${detail}` : ''})`}`);
}

async function get(url, opts = {}) {
  const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000), ...opts });
  const text = res.headers.get('content-type')?.includes('text') || opts.forceText ? await res.text() : null;
  return { res, text };
}

function meta(html, attr, name) {
  const m = html.match(new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*>`, 'i'));
  if (!m) return null;
  const c = m[0].match(/content=["']([^"']*)["']/i);
  return c ? c[1] : '';
}

function jsonLdTypes(html) {
  const types = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const nodes = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
      for (const n of nodes) if (n && n['@type']) types.push(...(Array.isArray(n['@type']) ? n['@type'] : [n['@type']]));
    } catch {
      types.push('⚠ unparseable JSON-LD block');
    }
  }
  return types;
}

// ---------- 1. Infrastructure ----------
console.log(`\n□ Infrastructure — ${SITE}`);
{
  const { res } = await get(`http://beaniestudio.site/`);
  // Advisory, not a failure: duplication is already neutralized by https canonicals.
  // To fix server-side, enable "Always Use HTTPS" in the Cloudflare dashboard.
  advise('http → https redirect', [301, 302, 308].includes(res.status), `status ${res.status} — enable "Always Use HTTPS" in Cloudflare to fix`);

  const robots = await get(`${SITE}/robots.txt`, { forceText: true });
  check('robots.txt serves', robots.res.status === 200 && robots.text.includes('Sitemap:'), `status ${robots.res.status}`);
  check('robots.txt points at sitemap-index', robots.text.includes(`${SITE}/sitemap-index.xml`));

  const llms = await get(`${SITE}/llms.txt`, { forceText: true });
  check('llms.txt serves with domain', llms.res.status === 200 && llms.text.includes('beaniestudio.site'), `status ${llms.res.status}`);

  const sm = await get(`${SITE}/sitemap-index.xml`, { forceText: true });
  check('sitemap-index serves', sm.res.status === 200 && sm.text.includes('sitemap-0.xml'), `status ${sm.res.status}`);

  const sm0 = await get(`${SITE}/sitemap-0.xml`, { forceText: true });
  urls = [...(sm0.text || '').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check('sitemap lists pages', urls.length >= 6, `${urls.length} URLs`);
  check('IndexNow key file serves', (await get(`${SITE}/${KEY_FILE}`, { forceText: true })).res.status === 200);

  const nf = await get(`${SITE}/definitely-not-a-real-page-${Date.now()}/`, { forceText: true });
  // The 404 STATUS is what keeps URLs out of the index — that's the hard requirement.
  // Serving our custom 404.html body is advisory: Cloudflare Workers-assets deploys need
  // not_found_handling = "404-page" (or the dashboard equivalent) to serve the custom body.
  check('missing pages return 404', nf.res.status === 404, `status ${nf.res.status}`);
  advise('custom 404 body served with noindex', (nf.text || '').includes('noindex'), nf.res.status === 404 && !(nf.text || '').trim() ? 'Cloudflare serves an empty body — harmless for SEO; set not_found_handling = "404-page" to serve the custom page' : 'no noindex meta in body');

  const rss = await get(`${SITE}/rss.xml`, { forceText: true });
  check('RSS feed serves', rss.res.status === 200 && /<rss|<feed/.test(rss.text || ''), `status ${rss.res.status}`);
}

// ---------- 2. Per-page metadata ----------
for (const url of [...new Set(urls || [])]) {
  const path = url.replace(SITE, '') || '/';
  console.log(`\n□ Page ${path}`);
  const { res, text: html } = await get(url, { forceText: true });
  if (res.status !== 200 || !html) {
    check('page loads', false, `status ${res.status}`);
    continue;
  }
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || '';
  check('title present, ≤60 chars', title.length > 0 && title.length <= 60, `"${title}" (${title.length})`);
  const desc = meta(html, 'name', 'description') || '';
  check('description present, ≤165 chars', desc.length > 0 && desc.length <= 165, `(${desc.length})`);
  const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)?.[0]?.match(/href=["']([^"']*)["']/i)?.[1];
  check('canonical is self', canonical === url, canonical || 'missing');
  const robotsMeta = meta(html, 'name', 'robots') || '';
  check('robots meta allows indexing', robotsMeta.length > 0 && !robotsMeta.includes('noindex') && robotsMeta.includes('max-image-preview:large'), robotsMeta);
  check('og:title + og:image present', !!meta(html, 'property', 'og:title') && !!meta(html, 'property', 'og:image'));
  check('og:url matches', meta(html, 'property', 'og:url') === url);
  check('twitter:card present', !!meta(html, 'name', 'twitter:card'));
  const types = jsonLdTypes(html);
  check('JSON-LD parses + present', types.length > 0 && !types.some((t) => String(t).startsWith('⚠')), types.join(', ') || 'none');
  check('html lang set', /<html[^>]*lang=["'][a-z-]+["']/i.test(html));
  check('GSC verification tag present', /<meta[^>]*name=["']google-site-verification["'][^>]*>/i.test(html));
}

// ---------- 3. Report ----------
console.log(`\n${'─'.repeat(50)}`);
console.log(`Audit: ${pass} passed, ${fail} failed${fail ? '' : ' — production SEO is healthy.'}`);
if (fail) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
