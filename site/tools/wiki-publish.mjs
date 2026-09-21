#!/usr/bin/env node
/**
 * wiki-publish.mjs — push the entire WIKI-KIT to a fresh Fandom wiki in one command.
 *
 * Uses Fandom's official MediaWiki Action API with a BOT PASSWORD (not your main
 * login): Special:BotPasswords → grant "edit pages" + "create pages".
 *
 * Usage:
 *   node tools/wiki-publish.mjs                       # interactive first-run setup
 *   node tools/wiki-publish.mjs <subdomain>           # publish all pages
 *   node tools/wiki-publish.mjs <subdomain> "Title"   # publish one page by title
 *
 * Credentials live in .env.wiki (created by setup): WIKI_BOT_USER / WIKI_BOT_PASS.
 * The bot password is stored locally only — .env.wiki is git-ignored like .env.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
import { fileURLToPath } from 'node:url';

const UA = 'BeanieStudioWikiPublisher/1.0 (beaniestudio.site; contact: anand@picfomo.com)';

// ---------------------------------------------------------------------------
// Page definitions — WIKI-KIT.md content, ready for the API. Order = publish order.
// ---------------------------------------------------------------------------

const T_GAME_TEMPLATE = `<includeonly>{| class="infobox" style="width:290px; font-size:90%; border:1px solid #aaa; background:#f9f9f9; float:right; margin:0 0 1em 1em; padding:4px;"
! colspan="2" style="text-align:center; background:#ddd;" | {{{name}}}
|-
| colspan="2" style="text-align:center;" | {{{image|}}}
|-
! Developer
| {{{developer|}}}
|-
! Publisher
| {{{publisher|}}}
|-
! Platform
| {{{platform|}}}
|-
! Release
| {{{release|}}}
|-
! Genre
| {{{genre|}}}
|-
! Mode
| {{{mode|}}}
|}</includeonly><noinclude>Basic game infobox used on hub pages. [[Category:Templates]]</noinclude>`;

const T_STUDIO_NAVBOX = `<includeonly>{| class="navbox" style="width:100%; border:1px solid #aaa; margin-top:2em; font-size:90%;"
! style="background:#ddd; text-align:center;" | [[Beanie Studio]]
|-
| style="text-align:center;" | ''[[STATIC: Salvage vs Hunter]]'' &middot; [https://beaniestudio.site Official site] &middot; [https://beaniestudio.site/faq/ FAQ]
|}</includeonly><noinclude>Navigation box for studio pages. [[Category:Templates]]</noinclude>`;

const PAGES = [
  {
    title: 'Template:Game',
    text: T_GAME_TEMPLATE,
  },
  {
    title: 'Template:Beanie Studio games',
    text: T_STUDIO_NAVBOX,
  },
  {
    title: 'STATIC: Salvage vs Hunter',
    text: `{{Game
|name = STATIC: Salvage vs Hunter
|developer = [[Beanie Studio]]
|publisher = [[Beanie Studio]]
|platform = Roblox (PC, Mobile, Console)
|release = Q4 2026 (targeted)
|genre = Asymmetrical survival horror
|mode = Multiplayer (5v1)
}}

'''STATIC: Salvage vs Hunter''' is a free [[w:c:roblox:Roblox|Roblox]] horror game developed by [[Beanie Studio]], targeted for Q4 2026. Five players take the role of '''Scrappers''' — salvage workers extracting scrap from a wrecked shuttle — while a sixth plays the '''[[The Hunter|Hunter]]''', an unseen predator that hunts exclusively by sound.

== Overview ==
The game's defining rule is information symmetry of silence: neither side gets radar, minimaps, or wallhacks. Scrappers must make noise to do their job — cutting scrap, running repairs, hauling heavy pieces — and every mistake the players cause (a failed repair, a dropped crate) broadcasts through the wreck. The Hunter listens, triangulates, and strikes.

Rounds run five to ten minutes and end with one of two [[Rounds and Escapes|exit doors]] opening — a finale the Hunter can still ruin.

== Gameplay loop ==
# Five Scrappers spawn inside the wreck with a shared job: fill five [[Deposit Areas]] past their limits and complete their [[Deposit Areas|repair minigames]].
# Noise made by gameplay events pulls the [[The Hunter|Hunter]] toward the mistake.
# A Scrapper caught twice goes down: the first hit knocks, the second kills. Downed players crawl, self-revive on a ~5% gamble, or wait for a rescue — or get carried over the Hunter's shoulder to a [[Captures and Rescues|siphon pod]].
# Teammates see captured players highlighted and can stage a rescue before containment completes.
# With deposits secured, two exits power up, one opens, and the surviving crew runs.

== Platforms ==
STATIC runs inside Roblox on PC, mobile and console with full crossplay, tuned to run on iPhone-8-class hardware. See [[Performance and Accessibility]].

== Monetization ==
The game is free. Cosmetic customization (earned through [[Progression and Cosmetics|frags and coins]]) is planned; no pay-to-win mechanics.

== External links ==
* [https://beaniestudio.site Official website]
* [https://beaniestudio.site/faq/ Official FAQ]
* [https://www.wikidata.org/wiki/Q141512786 Wikidata entity]
* [https://www.roblox.com/communities/1108819917/Beanies-studios Beanie Studio community on Roblox]

{{Beanie Studio games}}

[[Category:Games]]
[[Category:STATIC: Salvage vs Hunter]]`,
  },
  {
    title: 'The Hunter',
    text: `The '''Hunter''' is the fifth player's role in ''[[STATIC: Salvage vs Hunter]]'' — a blind predator that hunts the Scrappers by sound alone.

== Abilities ==
* '''Sound-based tracking.''' The Hunter has no radar and no wallhacks. It hears the noises the game generates: failed repairs, dropped heavy scrap, running.
* '''Two-hit takedowns.''' The first hit knocks a Scrapper down; the second kills. A knock opens the capture window (see [[Captures and Rescues]]).
* '''The carry.''' A downed Scrapper can be lifted over the Hunter's shoulder and transported to a siphon pod — while their teammates can still rescue them.
* '''Heavy footsteps.'''' Every swing has a weighty cooldown; the Hunter cannot spam attacks.

== Weaknesses ==
* Silence. Careful Scrappers who do not rush repairs are nearly invisible.
* Numbers. Five coordinated crew members can body-block, rescue, and spread noise across the map.
* The endgame. The Hunter must defend two exit doors with one body.

== Strategy ==
=== For Hunters ===
* Patience beats aggression: camp the noise, not the corridors.
* Let the minigame fail-sounds do your scouting.
* Guard the siphon pod runs, not the kills.

=== Against Hunters ===
* Do the quiet work first; loud work only when the Hunter is confirmed far.
* Break line-of-sight, then stand still — movement is sound.
* A rescue attempt is worth more than a deposit; dead crew fill fewer meters.

[[Category:Roles]]
[[Category:STATIC: Salvage vs Hunter]]`,
  },
  {
    title: 'Scrappers',
    text: `'''Scrappers''' are the crew role in ''[[STATIC: Salvage vs Hunter]]'' — five salvage workers trying to fill the wreck's [[Deposit Areas]] and escape alive.

== The job ==
Scrappers collect scrap and feed the five deposit areas, each with a different limit, then complete repair minigames to secure them. Securing deposits is the only path to powering the [[Rounds and Escapes|exit doors]].

== What kills a crew ==
* '''Noise discipline.''' Sprinting, failed repairs and mishandled heavy items summon the [[The Hunter|Hunter]].
* '''Greed.''' Staying for one more haul while the Hunter closes is the classic death.
* '''Abandoning the downed.''' A dead crewmate fills no meters — and rescues are usually cheaper than losses.

== Self-revive ==
A downed Scrapper may gamble a self-revive at roughly a five percent success rate — success restores you, failure ends the run. The safe play is always a teammate rescue.

== Progression ==
Playing objectives earns [[Progression and Cosmetics|frags and coins]] — currency for cosmetics, with [[Classes|classes]] planned in the first major update.

[[Category:Roles]]
[[Category:STATIC: Salvage vs Hunter]]`,
  },
  {
    title: 'Deposit Areas',
    text: `'''Deposit Areas''' are the five objective stations in ''[[STATIC: Salvage vs Hunter]]''. Each has its own scrap limit; crews must fill them and complete a repair minigame to secure them.

== How they work ==
# Salvage scrap from around the wreck.
# Feed it to a deposit area until it reaches that area's limit.
# Complete the repair minigame to lock the area in.
# Fail the minigame and the mistake '''makes noise''' — the kind that pulls the [[The Hunter|Hunter]].

== Strategy ==
* Split the crew: three areas worked quietly beats five worked loudly.
* Listen before you repair: if the Hunter is near, wait it out.
* Secured areas never un-fill — bank progress early.

[[Category:Mechanics]]
[[Category:STATIC: Salvage vs Hunter]]`,
  },
  {
    title: 'Captures and Rescues',
    text: `'''Captures and Rescues''' describe the catch-and-contain sequence in ''[[STATIC: Salvage vs Hunter]]''.

== The sequence ==
# '''First hit''' — the Scrapper is knocked down and starts crawling.
# '''Downed state''' — crawl to safety, wait for rescue, or gamble a self-revive (~5% success; failure is death).
# '''The carry''' — the [[The Hunter|Hunter]] may lift a downed Scrapper over a shoulder and carry them to a siphon pod.
# '''Siphon pod''' — the capture point. While carrying or containing, the Hunter is committed and visible.
# '''Rescue window''' — captured teammates are highlighted for the crew; a rescue before containment completes returns the Scrapper to the fight.

== Why it exists ==
The sequence replaces instant elimination: a capture is a mini horror film with a final act the crew can still rewrite — which is exactly the clip-able, chat-screaming moment the game is built around.

[[Category:Mechanics]]
[[Category:STATIC: Salvage vs Hunter]]`,
  },
  {
    title: 'Sound and Stealth',
    text: `'''Sound and stealth''' is the core mechanic of ''[[STATIC: Salvage vs Hunter]]''.

== The rule ==
There is no radar and no minimap — for anyone. The [[The Hunter|Hunter]] wins by hearing; Scrappers win by managing what the wreck hears.

== What makes noise ==
* Failed repair minigames
* Mishandled or dropped heavy scrap (heavy items cap speed — plan the route)
* Sprinting and running
* Every sound the game fabricates through play — never an arbitrary whistle

== Sound as a weapon ==
Experienced crews use noise deliberately: one player makes controlled noise at a distance to pull the Hunter away while the rest bank deposits. The Hunter's counter: distinguish panic from bait.

[[Category:Mechanics]]
[[Category:STATIC: Salvage vs Hunter]]`,
  },
  {
    title: 'Rounds and Escapes',
    text: `'''Rounds and Escapes''' cover the structure of a match in ''[[STATIC: Salvage vs Hunter]]''.

A round is five to ten minutes: fill the [[Deposit Areas]], survive the [[The Hunter|Hunter]], then escape. Once deposits are secured, '''two exit doors power up and one opens''' — chosen randomly, announced to everyone. The endgame is a race the Hunter can still ruin.

[[Category:Mechanics]]
[[Category:STATIC: Salvage vs Hunter]]`,
  },
  {
    title: 'Progression and Cosmetics',
    text: `'''Progression and Cosmetics''' describe out-of-round advancement in ''[[STATIC: Salvage vs Hunter]]''.

== Earning ==
Between rounds, players earn '''frags''' and '''coins''' based on dynamic completion: scrap filled, repairs secured, players revived, and round outcomes.

== Spending ==
Currency buys '''cosmetics only''' — no pay-to-win. Nothing purchasable makes a player quieter or faster.

== Classes ==
Classes arrive in the first major update: each resists or disrupts the Hunter differently — stuns, slows, and other tools. Details land here as they are announced.

[[Category:Systems]]
[[Category:STATIC: Salvage vs Hunter]]`,
  },
  {
    title: 'Beanie Studio',
    text: `'''Beanie Studio''' is the independent development studio behind ''[[STATIC: Salvage vs Hunter]]''.

== About ==
A small indie team building a free, crossplay 5v1 horror game tuned to run on low-end phones. The studio communicates primarily through [https://discord.gg/z8kPT6cRbG Discord] and its official site.

== Links ==
* [https://beaniestudio.site Official website]
* [https://beaniestudio.site/blog/ Dev blog]
* [https://www.roblox.com/communities/1108819917/Beanies-studios Roblox community]
* [https://www.wikidata.org/wiki/Q141511863 Wikidata entity]

{{Beanie Studio games}}

[[Category:Studios]]`,
  },
  {
    title: 'About',
    text: `'''''STATIC Wiki''''' is the community encyclopedia for ''[[STATIC: Salvage vs Hunter]]''.

This wiki is officially maintained by [[Beanie Studio]] — the devs started it, and everyone can edit. Pages about gameplay mechanics reflect the current design; unreleased features are documented only from official announcements.

* Rules: keep it factual, keep it kind, mark speculation as speculation.
* Founding: September 2026.

[[Category:Community]]`,
  },
  // Stubs so Main Page links are not red at launch
  {
    title: 'The Facility',
    text: `'''The Facility''' is the wrecked shuttle where every round of ''[[STATIC: Salvage vs Hunter]]'' takes place — a maze of corridors and scrap caches surrounding the five [[Deposit Areas]].

This page is a stub. Expand it with map details as the game updates.

[[Category:Locations]]
[[Category:Stubs]]`,
  },
  {
    title: 'Classes',
    text: `'''Classes''' are the planned first major update for ''[[STATIC: Salvage vs Hunter]]'' — each Scrapper class resists or disrupts the [[The Hunter|Hunter]] differently (stuns, slows, and other tools).

This page is a stub. It will document each class as they are announced. See [[Progression and Cosmetics]].

[[Category:Systems]]
[[Category:Stubs]]`,
  },
  {
    title: 'Voice Chat',
    text: `'''Voice Chat''' refers to the planned proximity voice system for ''[[STATIC: Salvage vs Hunter]]'' — teammates talking by distance, not global radio.

This page is a stub. It will follow the feature's official announcement.

[[Category:Systems]]
[[Category:Stubs]]`,
  },
  {
    title: 'Performance and Accessibility',
    text: `''[[STATIC: Salvage vs Hunter]]'' is tuned to run on iPhone-8-class hardware with full crossplay between mobile, PC and console.

This page is a stub. It will collect settings, accessibility options and performance tips.

[[Category:Systems]]
[[Category:Stubs]]`,
  },
  {
    title: 'Main Page',
    text: `'''STATIC: Salvage vs Hunter''' is a free 5v1 asymmetrical horror game on [https://www.roblox.com Roblox] by [[Beanie Studio]]. Five '''[[Scrappers]]''' salvage scrap from a wrecked shuttle while one '''[[The Hunter|Hunter]]''' stalks the wreck — hunting by sound alone. No radar. No minimap. Only ears.

<mainpage-leftcolumn-start />

== The game ==
* '''[[The Facility]]''' — the wreck and its five [[Deposit Areas]]
* '''[[Scrappers]]''' — the crew trying to finish the job and escape
* '''[[The Hunter]]''' — faster, stronger, and blind; it listens
* '''[[Sound and Stealth]]''' — the mechanic everything else hangs on
* '''[[Rounds and Escapes]]''' — deposits, repair minigames, the two exits

== Game systems ==
* [[Captures and Rescues]] — knock, crawl, carry, siphon pods
* [[Progression and Cosmetics]] — frags, coins, classes
* [[Voice Chat]] — proximity voice plans

<mainpage-endcolumn />

<mainpage-rightcolumn-start />

== Quick facts ==
* '''Developer:''' [[Beanie Studio]]
* '''Platform:''' [[w:c:roblox:Roblox|Roblox]] — PC, mobile, console (crossplay)
* '''Release:''' Q4 2026 (targeted)
* '''Mode:''' 5v1 asymmetrical horror

== Play ==
'''Free to play''' — mobile, PC and console, full crossplay.

* [https://beaniestudio.site Official site]
* [https://beaniestudio.site/faq/ FAQ]
* [https://discord.gg/z8kPT6cRbG Discord]

<mainpage-endcolumn />

__NOTOC__
[[Category:Browse]]`,
  },
];

// ---------------------------------------------------------------------------
// MediaWiki client (cookie-jar fetch)
// ---------------------------------------------------------------------------

function makeJar() {
  const jar = new Map();
  return {
    absorb(res) {
      const list = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
      for (const c of list) {
        const [pair] = c.split(';');
        const i = pair.indexOf('=');
        if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
      }
    },
    header() {
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    },
  };
}

async function api(wiki, jar, params, method = 'GET') {
  const url = new URL(`https://${wiki}.fandom.com/api.php`);
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (method === 'GET') url.searchParams.set(k, v);
    else body.set(k, v);
  }
  const res = await fetch(url, {
    method,
    headers: {
      'user-agent': UA,
      cookie: jar.header(),
      ...(method === 'POST' ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: method === 'POST' ? body.toString() : undefined,
  });
  jar.absorb(res);
  const json = await res.json().catch(() => ({}));
  if (json.error) throw new Error(`API error ${json.error.code}: ${json.error.info}`);
  return json;
}

async function login(wiki, user, pass) {
  const jar = makeJar();
  const t = await api(wiki, jar, { action: 'query', meta: 'tokens', type: 'login', format: 'json' });
  await api(wiki, jar, { action: 'login', lgname: user, lgpassword: pass, lgtoken: t.query.tokens.logintoken, format: 'json' }, 'POST');
  const who = await api(wiki, jar, { action: 'query', meta: 'userinfo', format: 'json' });
  const name = who?.query?.userinfo?.name;
  if (!name) throw new Error('Login did not stick — check bot username/password (username must be "YourName@BotName").');
  const csrf = await api(wiki, jar, { action: 'query', meta: 'tokens', type: 'csrf', format: 'json' });
  return { jar, csrf: csrf.query.tokens.csrftoken, name };
}

async function publish(wiki, session, title, text) {
  const res = await api(wiki, session.jar, {
    action: 'edit',
    title,
    text,
    token: session.csrf,
    bot: 1,
    nocreate: 0,
    format: 'json',
  }, 'POST');
  const e = res.edit || {};
  if (e.nochange) return 'unchanged';
  if (e.result !== 'Success') throw new Error(`edit failed: ${JSON.stringify(e).slice(0, 300)}`);
  return e.newrevid ? 'created' : 'updated';
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const envPath = path.join(SITE_ROOT, '.env.wiki');
function readEnvWiki() {
  if (!fs.existsSync(envPath)) return null;
  const out = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function interactiveSetup() {
  const rl = readline.createInterface({ input, output });
  console.log('\n== STATIC Fandom wiki — one-time setup ==\n');
  console.log('You need a Fandom BOT PASSWORD (not your normal password):');
  console.log('  1. On your wiki: Special:BotPasswords  (address bar: https://<your-wiki>.fandom.com/wiki/Special:BotPasswords)');
  console.log('  2. "Create a new bot password" — name: publisher');
  console.log('  3. Grants: tick "Edit pages" and "Create, edit, and move pages"');
  console.log('  4. Save → copy the generated password (shown once)\n');
  const subdomain = (await rl.question('Wiki subdomain (the part before .fandom.com): ')).trim().toLowerCase();
  const user = (await rl.question('Bot login username (format: YourName@publisher): ')).trim();
  const pass = (await rl.question('Bot password: ')).trim();
  rl.close();
  if (!subdomain || !user || !pass) throw new Error('All three answers are required.');
  fs.writeFileSync(envPath, `WIKI_SUBDOMAIN=${subdomain}\nWIKI_BOT_USER=${user}\nWIKI_BOT_PASS=${pass}\n`);
  console.log(`\nSaved to .env.wiki (git-ignored). Running publish now…\n`);
  return { subdomain, user, pass };
}

async function main() {
  const args = process.argv.slice(2);
  let env = readEnvWiki();
  let only = null;

  if (args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: node tools/wiki-publish.mjs [subdomain] ["Page title"]');
    console.log('  no args        → one-time interactive setup, then publish all');
    console.log('  subdomain      → publish all pages to <subdomain>.fandom.com');
    console.log('  subdomain "X"  → publish a single page by title');
    return;
  }
  if (args[0]) {
    env = { ...env, WIKI_SUBDOMAIN: args[0].toLowerCase() };
    if (args[1]) only = args[1];
  }
  if (!env?.WIKI_SUBDOMAIN || !env?.WIKI_BOT_USER || !env?.WIKI_BOT_PASS) {
    if (!args[0]) {
      const s = await interactiveSetup();
      env = { WIKI_SUBDOMAIN: s.subdomain, WIKI_BOT_USER: s.user, WIKI_BOT_PASS: s.pass };
    } else {
      throw new Error('No bot credentials. Run `node tools/wiki-publish.mjs` once (interactive setup) to create .env.wiki.');
    }
  }

  const wiki = env.WIKI_SUBDOMAIN;
  console.log(`→ logging into https://${wiki}.fandom.com as ${env.WIKI_BOT_USER} …`);
  const session = await login(wiki, env.WIKI_BOT_USER, env.WIKI_BOT_PASS);
  console.log(`✓ logged in as ${session.name}`);

  const targets = only ? PAGES.filter((p) => p.title === only) : PAGES;
  if (only && targets.length === 0) {
    throw new Error(`Unknown page "${only}". Titles: ${PAGES.map((p) => p.title).join(' | ')}`);
  }

  let ok = 0;
  for (const p of targets) {
    try {
      const r = await publish(wiki, session, p.title, p.text);
      console.log(`✓ ${p.title} — ${r}`);
      ok++;
    } catch (err) {
      console.error(`✗ ${p.title} — ${err.message}`);
    }
  }
  console.log(`\nDone: ${ok}/${targets.length} pages pushed → https://${wiki}.fandom.com`);
  if (ok === targets.length) {
    console.log('Next: tell the agent the wiki URL to run the Part 10 cross-link wiring.');
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
