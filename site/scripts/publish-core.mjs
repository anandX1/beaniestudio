#!/usr/bin/env node
/**
 * publish-core.mjs — THE publish pipeline, shared by two callers:
 *   • scripts/studio.mjs  (the Compose button)
 *   • tools/autopilot.mjs (the scheduled daily auto-poster)
 * One implementation = no drift: whatever safety the Studio has, the
 * autopilot has too (thin-content guard BEFORE write, build-gate before
 * deploy, [photo]-marker image placement, IndexNow ping).
 *
 * publishAsync({ title, description, tag, markdown, keywords, images, draft })
 *   → { ok, slug, draft, url, images, log: [lines] }
 *   → { ok:false, error, log }  (nothing written when rejected)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(here, '..');
const DEVLOG_DIR = path.join(SITE_ROOT, 'src', 'blog');
const BLOG_IMG_DIR = path.join(SITE_ROOT, 'public', 'blog');

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);

function runStep(cmd) {
  return new Promise((resolve) => {
    const child = spawn('cmd.exe', ['/c', cmd], { cwd: SITE_ROOT, windowsHide: true });
    let out = '';
    child.stdout.on('data', (d) => { out += String(d); });
    child.stderr.on('data', (d) => { out += String(d); });
    child.on('close', (code) => resolve({ code, out }));
  });
}

export async function publishAsync({ title, description, tag = 'design', markdown, keywords = [], images = [], draft = false, pubDate = null }) {
  const log = [];
  const say = (m) => log.push(m);
  try {
    if (!title || !description || !markdown) return { ok: false, error: 'title, description and markdown are required', log };
    const slug = slugify(title);
    if (!slug) return { ok: false, error: 'could not make a slug from that title', log };

    // Thin-content guard FIRST (a rejection must never leave a draft:false file behind)
    if (!draft) {
      const wc = markdown.replace(/\[\s*photo\s*\]/gi, ' ').trim().split(/\s+/).filter(Boolean).length;
      if (wc < 400) return { ok: false, error: `only ${wc} words — the SEO bar is ~900 (Google shelves thin posts). Expand it, or publish as draft.`, log };
    }

    // Images → public/blog/
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
      say(`image saved: public/blog/${file}`);
    }

    // [photo] markers → images in order; leftovers append; unfilled → comment
    let bodyMd = markdown.trim();
    let sIdx = 0;
    bodyMd = bodyMd.replace(/\[\s*photo\s*\]/gi, () => {
      if (sIdx < saved.length) return `\n\n${saved[sIdx++].markdown}\n\n`;
      return `\n\n<!-- photo slot: attach an image in Studio to fill this spot -->\n\n`;
    });
    const leftovers = saved.slice(sIdx);
    if (leftovers.length) say(`${leftovers.length} image(s) had no [photo] marker — appended at the end`);
    const markerCount = (markdown.match(/\[\s*photo\s*\]/gi) || []).length;
    if (markerCount > saved.length) say(`${markerCount - saved.length} [photo] slot(s) left empty — attach more images next time`);

    // Future-link guard: a link to /blog/<slug>/ whose post is not published
    // yet (it may be scheduled for next week) breaks check:links → the CI
    // SEO guard → a failed-workflow notification. Rewrite such links to their
    // label text; when the target eventually ships, new posts can link it.
    bodyMd = bodyMd.replace(/\[([^\]]+)\]\(\/blog\/([^\/#?)]+)\/?\)/g, (full, label, slug) => {
      const target = path.join(DEVLOG_DIR, `${slug}.md`);
      if (fs.existsSync(target)) return full;
      say(`future-link rewritten to plain text: ${label} (target /blog/${slug}/ not published yet)`);
      return label;
    });
    const imageBlock = leftovers.length ? `\n${leftovers.map((s) => s.markdown).join('\n\n')}\n` : '';
    const kwLine = keywords.length ? `\n<!-- studio-keywords: ${keywords.join(' | ')} -->\n` : '';
    // Freshness signal: on an edit-republish, keep the ORIGINAL pubDate and
    // stamp updatedDate → surfaces as dateModified in the BlogPosting JSON-LD
    // (Google's freshness/ranking signal; without it dateModified always
    // equals datePublished no matter how often a post improves).
    const postPath = path.join(DEVLOG_DIR, `${slug}.md`);
    const prevPub = fs.existsSync(postPath)
      ? fs.readFileSync(postPath, 'utf8').match(/^pubDate:\s*(\S+)/m)?.[1]
      : null;
    const effPub = pubDate || prevPub || new Date().toISOString().slice(0, 10);
    const updLine = prevPub ? `\nupdatedDate: ${new Date().toISOString()}` : '';
    // YAML: inside single-quoted scalars an apostrophe is escaped by DOUBLING it
    // (''), never backslash — \' corrupts frontmatter and bricks the build.
    const yq = (s) => s.replace(/'/g, "''");
    const post = `---\ntitle: '${yq(title)}'\ndescription: '${yq(description)}'\npubDate: ${effPub}\ntag: ${['design', 'production', 'systems'].includes(tag) ? tag : 'design'}\ndraft: ${draft ? 'true' : 'false'}${updLine}\n---\n\n${bodyMd}\n${imageBlock}${kwLine}`;
    fs.writeFileSync(postPath, post);
    say(`post written: src/blog/${slug}.md`);

    if (draft) {
      return { ok: true, slug, draft: true, url: `(local draft) src/blog/${slug}.md`, images: saved.map((s) => s.file), log };
    }

    say('building site…');
    const build = await runStep('npm run build');
    if (build.code !== 0) {
      say(build.out.slice(-600));
      return { ok: false, error: 'build failed — post kept as a draft file, fix and republish', slug, log };
    }
    say('deploying (sync → push → ping)…');
    const deploy = await runStep('npm run deploy --silent --no-ping');
    if (deploy.code !== 0) {
      say(deploy.out.slice(-600));
      return { ok: false, error: 'deploy failed after a successful build — check the repo', slug, log };
    }
    say('pinging IndexNow…');
    await runStep('npm run ping:indexnow --silent');
    return { ok: true, slug, draft: false, url: `https://beaniestudio.site/blog/${slug}/`, images: saved.map((s) => s.file), log };
  } catch (e) {
    return { ok: false, error: e.message, log };
  }
}
