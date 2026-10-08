/**
 * GAME FACTS — the single source of truth for every number on the site.
 *
 * Every value here was read out of the live game's scripts (Config/Movement.lua,
 * Config/Hunter.lua, HunterDashSystem.lua, the scrap/crusher/worm/pod configs)
 * for the beta build of 8 Oct 2026. Pages, FAQ answers, JSON-LD and the press
 * kit all import from this file — never type a game number into a page.
 *
 * If the game changes: change it HERE, rebuild, and every page follows.
 * If a value is not in this file, the site does not claim it.
 */

export const GAME = {
  name: 'STATIC',
  /** Long-form name used in press copy and as schema alternateName. */
  fullName: 'STATIC: Salvage vs Hunter',
  tagline: 'Salvage vs Hunter',
  status: 'Beta',
  /** Public beta launch day (date only — no launch hour is fixed). */
  launchDate: '2026-10-10',
  launchLabel: '10 October 2026',
  devStarted: 'July 2026',
  platforms: ['PC', 'Mobile'],
  price: 'Free to play',
  ageTarget: '13+',
  genres: ['Asymmetrical horror', 'Co-op survival horror', 'Multiplayer'],
  serverSize: 7,
  scrappers: { min: 4, max: 6 },
  hunters: 1,
  roundLimitMin: 20,
  /** Hunter is released this many seconds after the Scrappers spawn. */
  hunterReleaseSec: '10–20',
  hunterSpawnPoints: 5,
  voiceChat: true,
} as const;

/** Studio speeds are in studs per second (Roblox WalkSpeed). */
export const MOVEMENT = {
  scrapperWalk: 7,
  scrapperSprint: 13,
  hunter: 13.5,
  hunterCarrying: 10.8,
  downedCrawl: 1.5,
  downedSprint: 6,
  hunterDash: 26,
} as const;

export const JINGLES = {
  name: 'Jingles',
  role: 'The Hunter',
  description: 'A clockwork jester: a grinning skull mask under a belled cap, brass-jointed limbs and hooked metal claws.',
  dash: { speed: 26, durationSec: 1.6, cooldownSec: 8.5 },
  attack: { rangeStuds: 6.6, windupSec: 0.35, cooldownSec: 1.5, hitsToDown: 2 },
  executeSec: 2,
  bloodlust: { everySec: '50–80', revealSec: 3, speedMult: 1.5, cooldownSec: 15 },
} as const;

export const POD = {
  name: 'Bio-Siphon Pod',
  timerSec: 90,
  /** Timer runs twice as fast once no free teammate is left. */
  doubleSpeedWhenAlone: true,
  floorSec: 30,
  rescueHoldSec: 3,
  rescueRangeStuds: 7,
  rescueShieldSec: 5,
  struggleStunSec: 1.2,
  selfEscapeChance: 5,
  selfEscapePenaltySec: 15,
  overloadBurnoutSec: 20,
} as const;

export const SCRAPPER = {
  hitsToDown: 2,
  reviveHoldSec: 5,
  backpackSlots: 2,
  heavyCarrySlowMaxPct: 7,
  lockerMaxSec: 18,
  shoveCooldownSec: 8,
  bellCooldownSec: 7,
} as const;

/** PC key binds. Mobile uses on-screen buttons (see MOBILE_BUTTONS). */
export const CONTROLS = [
  { key: 'E (hold)', action: 'Interact — feed a crusher, rescue a teammate from a pod' },
  { key: 'F or 3', action: 'Flashlight (off while carrying heavy scrap)' },
  { key: '4', action: 'Ring the bell — loud, and it always brings the Worm' },
  { key: 'Q', action: 'Drop the held item' },
  { key: 'G', action: 'Drop everything' },
  { key: 'X', action: 'Aimed throw' },
] as const;

export type ScrapClass = 'Backpack' | 'Heavy';

export interface ScrapItem {
  name: string;
  kg: number;
  /** Chance this item is in the round's spawn pool. */
  spawnPct: number;
  slot: ScrapClass;
}

export const SCRAP: ScrapItem[] = [
  { name: 'Security access card', kg: 3, spawnPct: 100, slot: 'Backpack' },
  { name: 'PCB', kg: 6, spawnPct: 100, slot: 'Backpack' },
  { name: 'Tool box', kg: 15, spawnPct: 100, slot: 'Backpack' },
  { name: 'Drone', kg: 18, spawnPct: 100, slot: 'Backpack' },
  { name: 'Biohazard canister', kg: 20, spawnPct: 100, slot: 'Backpack' },
  { name: 'Copper spool', kg: 20, spawnPct: 100, slot: 'Backpack' },
  { name: 'Hydraulic pump', kg: 40, spawnPct: 75, slot: 'Heavy' },
  { name: 'Fuel cell', kg: 45, spawnPct: 75, slot: 'Heavy' },
  { name: 'Heavy engine', kg: 50, spawnPct: 75, slot: 'Heavy' },
  { name: 'Server rack', kg: 50, spawnPct: 50, slot: 'Heavy' },
  { name: 'Landing gear', kg: 90, spawnPct: 40, slot: 'Heavy' },
  { name: 'Radio', kg: 90, spawnPct: 40, slot: 'Heavy' },
  { name: 'Oxygen tank', kg: 100, spawnPct: 40, slot: 'Heavy' },
  { name: 'Nuclear reactor core', kg: 140, spawnPct: 20, slot: 'Heavy' },
];

/** Every spawned item rolls a rarity that multiplies its weight. */
export const RARITY = [
  { name: 'Common', mult: 1, pct: 78 },
  { name: 'Rare', mult: 1.5, pct: 17 },
  { name: 'Charged', mult: 3, pct: 5 },
] as const;

export const CRUSHERS = {
  count: 3,
  quotasKg: [120, 130, 150],
  totalKg: 400,
  minigamesPerConsole: 7,
} as const;

export const MINIGAMES = [
  'Wires', 'Pipes', 'Waveform', 'Matrix', 'Fuel Rods', 'Sonar', 'Logic',
  'Spectro', 'Pressure', 'Lasers', 'Geiger', 'Flux', 'Piston',
] as const;

export const TRANSITION_TASKS = ['Switches', 'Buttons', 'Valve', 'Fuses'] as const;

export const WORM = {
  maxAlive: 3,
  bellSpawnDelaySec: '3–5',
  bellSpawnDistStuds: '60–100',
  baseChancePct: 6,
  baseChanceEverySec: 5,
  grabDamagePct: '8–20',
  /** Triggers that multiply the base chance (×1.5 each, capped at ×2). */
  lures: ['A missed or near-miss throw', 'A screaming mimic item nearby', 'Standing near or holding heavy scrap'],
} as const;

export const EXTRACTION = {
  room: 'Intake Chute',
  windowSec: 60,
} as const;

/** End-of-round screens (text copied from the in-game UI). */
export const RESULTS = [
  { id: 'result-escaped', title: 'Escaped', line: 'You made it out of the bunker.', side: 'Scrapper', win: true },
  { id: 'result-consumed', title: 'Consumed', line: 'Jingles got you.', side: 'Scrapper', win: false },
  { id: 'result-prey-slain', title: 'Prey slain', line: 'Nobody made it out.', side: 'Hunter', win: true },
  { id: 'result-defeated', title: 'Defeated', line: 'The prey escaped.', side: 'Hunter', win: false },
] as const;

/** Progression shown on the results screen. */
export const PROGRESSION = {
  currency: 'Fragments',
  /** Stats a Scrapper's results card tracks. */
  scrapperStats: ['kg fed', 'feeds', 'revives', 'time alive'],
} as const;

/** Mobile on-screen buttons (labels as shown in the HUD). */
export const MOBILE_BUTTONS = ['Light', 'Bell', 'Objective', 'Run', 'Drop', 'Slam'] as const;

/** Rooms of the bunker map as built in Studio (names from the map builder). */
export const ROOMS = [
  'Nuclear Reactor', 'Security', 'Control Room', 'Medbay', 'Interrogation Room',
  'Storage Bay', 'Cargo Dock', 'Airlock', 'Central Room',
] as const;

/** Announced next — label as PLANNED wherever shown. */
export const ROADMAP = [
  { t: 'New game modes', b: 'Rotating-Hunter modes where the Hunter role passes between players, and infection-style rounds where caught Scrappers switch sides.' },
  { t: 'A second map', b: 'A new facility with its own rooms, scrap spawns and crusher points.' },
  { t: 'A second Hunter', b: 'A new monster with its own abilities alongside Jingles.' },
  { t: 'Cosmetics and events', b: 'Skins, emotes and limited-time events, bought with the Fragments you earn every round.' },
  { t: 'Streamer integration', b: 'Chat and live-stream events that trigger things inside the round while a creator plays.' },
] as const;

export const TEAM = [
  { name: 'Anand Kumar', role: 'Scripting, systems, animation and lighting', title: 'Lead developer', email: 'anand@beaniestudio.site', roblox: 'anandxdev', discord: '._.anand._.' },
  { name: 'Pawan Dahe', role: 'Map building, props, concept and community', title: 'Level designer & community lead', email: 'pawan@beaniestudio.site', roblox: 'SosukeAizen2404', discord: 'pawanxdev' },
  { name: 'Jai Mishra', role: 'Content, editing, social media and sound effects', title: 'Content & audio lead', email: 'jai@beaniestudio.site', roblox: 'souljai12e43', discord: 'devil_jai2626' },
] as const;

/** Real, verifiable community numbers (8 Oct 2026). Update before quoting. */
export const COMMUNITY = {
  youtubeViews: '84,000+',
  youtubeSubs: '310+',
  discordMembers: '75+',
  playtesters: '~20',
  asOf: 'October 2026',
} as const;

/** Small helper so pages never format weights differently. */
export const kg = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} kg`;
