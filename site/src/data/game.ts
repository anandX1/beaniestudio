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
  serverSize: 6,
  scrappers: { min: 4, max: 5 },
  hunters: 1,
  roundLimitMin: 15,
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
  rescueRangeStuds: 15,
  rescueShieldSec: 5,
  struggleStunSec: 2,
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
  /**
     * Games per console: 3.
     *
     * OWNER-CONFIRMED DESIGN CHANGE (2026-10-17): each console runs a memory game,
     * one game drawn at random from the pool below, and a wheel game.
     *
     * The shipped code still generates a 7-game plan — three L/R pairs plus a solo
     * finisher (CrusherStationService.luau:161 doc comment, :207-220 the seven
     * inserts, :219 "Game 7: Solo finisher"; Research/CRUSHER_CONSOLE_DESIGN.md
     * section 7.3). The owner is implementing the 3-game version. Per CLAUDE.md
     * rule 9, game.ts leads: this value changed first and the code catches up.
     * If the code still says 7 when you read this, check with the owner before
     * reverting it back.
     */
    minigamesPerConsole: 3,
    /** The three console slots, in order, as confirmed by the owner. */
    minigameSlots: ['Memory game', 'Random from the pool', 'Wheel game'] as const,
} as const;

/**
 * The 13 console minigames from ConsoleGameRegistry.luau — one Register() call
 * each, ids in file order: wires, pipes, waveform, matrix, fuelrods, sonar,
 * logic, spectro, pressure, lasers, geiger, flux, piston.
 *
 * Each entry carries ExpectedMs (the designer's expected solve time, 7-12 s) and
 * a MinMs anti-cheat floor (2.5-4 s) — see ConsoleGameRegistry.luau:12-14 for the
 * type. There is no wheel game in the pool; the only wheel in the console system
 * is the physical `valve` transition (Console/Transitions.luau:205-221), and
 * "matrix" is the one memory game (Console/Games/matrix.luau:2 "watch the cells
 * flash, then repeat the sequence").
 */
export const MINIGAMES = [
  'Wires', 'Pipes', 'Waveform', 'Matrix', 'Fuel Rods', 'Sonar', 'Logic',
  'Spectro', 'Pressure', 'Lasers', 'Geiger', 'Flux', 'Piston',
] as const;

/**
 * ExpectedMs from ConsoleGameRegistry.luau — the designer's expected solve time
 * for each minigame, keyed by the registry id (same order as MINIGAMES). Every
 * game carries the same value at tiers 1/2/3.
 *
 * Registry line per game: wires :65 = 7000, pipes :163 = 12000, waveform :265 =
 * 8000, matrix :298 = 10000, fuelrods :333 = 7000, sonar :365 = 8000, logic :416
 * = 10000, spectro :465 = 10000, pressure :502 = 8000, lasers :544 = 9000,
 * geiger :615 = 10000, flux :650 = 7000, piston :677 = 8000.
 *
 * The registry's other timing field, MinMs (:12), is NOT a solve time — it is an
 * anti-cheat floor that holds a too-fast answer until 75 % of the floor has
 * elapsed (CrusherStationService.luau:950-961). It runs 2.5-4 s. Do not quote it
 * as how long a minigame takes.
 */
export const MINIGAME_EXPECTED_MS: Record<string, number> = {
  Wires: 7000,
  Pipes: 12000,
  Waveform: 8000,
  Matrix: 10000,
  'Fuel Rods': 7000,
  Sonar: 8000,
  Logic: 10000,
  Spectro: 10000,
  Pressure: 8000,
  Lasers: 9000,
  Geiger: 10000,
  Flux: 7000,
  Piston: 8000,
};

/** Range across the pool: 7–12 s. */
export const MINIGAME_EXPECTED_MS_RANGE = { min: 7000, max: 12000 } as const;

export const TRANSITION_TASKS = ['Switches', 'Buttons', 'Valve', 'Fuses'] as const;

export const WORM = {
  maxAlive: 3,
  /**
   * Display strings for the bell spawn. These are DERIVED from `bell` below —
   * keep the two in step. They exist because templates interpolate them inline.
   */
  bellSpawnDelaySec: '0.5–1',
  bellSpawnDistStuds: '6–14',
  /**
   * Config.Worm.Bell (src/ReplicatedStorage/STATIC_Shared/Config/Worm.luau:115-127),
   * consumed in WormService.luau:1192 (delay) and :1203 (distance). The bell is a
   * close-range jumpscare: a worm erupts 6-14 studs from the target 0.5-1 s after
   * the ring. The old 3-5 s / 60-100 studs was Travel's spawn ring (Worm.luau:24-38),
   * which is the general random-spawn path, not the bell's.
   */
  bell: {
    delaySec: { min: 0.5, max: 1 },
    distStuds: { min: 6, max: 14 },
    cooldownSec: 35,
    alertRadiusStuds: 40,
    /** Round states the bell works in (Worm.luau:126). */
    states: ['GracePeriod', 'Hunt', 'Extraction'],
  },
  baseChancePct: 3.5,
  baseChanceEverySec: 5,
  grabDamagePct: '8–20',
  /**
   * Lure multipliers from Config.Worm.Lures (Worm.luau:90-94), applied to the base
   * chance in WormService.luau:1237. There is NO cap on the combined lure product:
   * a bell lure is ×3, not ×1.5, and misses/mimics are ×1.5 each.
   */
  lureMultipliers: [
    { trigger: 'Ringing the bell', mult: 3, radiusStuds: 40, durationSec: 20 },
    { trigger: 'A missed or near-miss throw', mult: 1.5, radiusStuds: 40, durationSec: 20 },
    { trigger: 'A screaming mimic item nearby', mult: 1.5, radiusStuds: 40, durationSec: 20 },
  ],
  /**
   * The heavy-scrap factor is separate from the lures and is the only *capped*
   * factor: ×1.5 while carrying heavy scrap or standing within 20 studs of a heavy
   * pickup, capped at ×2 (Worm.luau:105-111, WormService.luau:993-1001, applied
   * at :1237). Because the base is ×1.5 and the cap is ×2 the cap never binds —
   * do not describe it as a cap on the lures.
   */
  heavyScrap: { mult: 1.5, cap: 2, radiusStuds: 20 },
  /** Rendered as prose lists on the guide pages. */
  lures: ['Ringing the bell (×3)', 'A missed or near-miss throw (×1.5)', 'A screaming mimic item nearby (×1.5)'],
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
  { name: 'Anand Kumar', title: 'Founder & lead developer', role: 'Scripting, gameplay systems, game AI, animation and lighting', knowsAbout: ['Roblox game development', 'Luau scripting', 'gameplay systems design', 'asymmetrical multiplayer design', 'game AI', 'character animation', 'lighting design'], email: 'anand@beaniestudio.site', roblox: 'anandxdev', discord: '._.anand._.' },
  { name: 'Pawan Dahe', title: 'Founder & level designer', role: 'Level design, bunker maps, props, concept art and community', knowsAbout: ['level design', 'Roblox Studio', 'environment design', '3D prop modelling', 'game concept design', 'community management'], email: 'pawan@beaniestudio.site', roblox: 'SosukeAizen2404', discord: 'pawanxdev' },
  { name: 'Jai Mishra', title: 'Content & audio lead', role: 'Content, video editing, social media and sound effects', knowsAbout: ['video editing', 'social media management', 'sound design', 'content creation'], email: 'jai@beaniestudio.site', roblox: 'souljai12e43', discord: 'devil_jai2626' },
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
