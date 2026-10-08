/**
 * The bunker's rooms, as built in Studio. Blurbs describe what's visible in
 * the screenshots — layout and mood, not mechanics. Mechanics that apply to
 * a room (crusher spots, pods) are random per round and are NOT tied to rooms.
 */
export interface Room {
  slug: string;
  name: string;
  /** Screenshot ids from media.json, best first. */
  shots: string[];
  blurb: string;
}

export const ROOM_INFO: Room[] = [
  {
    slug: 'central-room',
    name: 'Central Room',
    shots: ['central-room-globe', 'central-room', 'first-person-hub'],
    blurb: 'The hub where every round starts, built around a giant amber globe on a red-lit platform. Walkways lead off it toward the rest of the bunker.',
  },
  {
    slug: 'cargo-dock',
    name: 'Cargo Dock',
    shots: ['cargo-dock-shuttle', 'cargo-dock-floor'],
    blurb: 'The biggest open space in the bunker: a battered shuttle, a forklift, stacked crates and catwalks overhead, lit in red warning light.',
  },
  {
    slug: 'storage-bay',
    name: 'Storage Bay',
    shots: ['storage-bay', 'storage-bay-forklift'],
    blurb: 'Long aisles of floor-to-ceiling shelving packed with crates. Plenty to search, and plenty of corners you can’t see past.',
  },
  {
    slug: 'control-room',
    name: 'Control Room',
    shots: ['control-room-hologram', 'control-room'],
    blurb: 'Banks of consoles under a wall of blue screens and a glowing holographic world map. One of the brightest rooms in the bunker.',
  },
  {
    slug: 'nuclear-reactor',
    name: 'Nuclear Reactor',
    shots: ['reactor-coils', 'reactor-tanks', 'reactor-door'],
    blurb: 'Behind an “Authorized personnel only” door: red-glowing coils, green-lit reactor tanks and very little light to see by.',
  },
  {
    slug: 'medbay',
    name: 'Medbay',
    shots: ['medbay', 'medbay-red', 'jingles-medbay'],
    blurb: 'Rows of stretchers, blue privacy curtains and supply shelves. The long centre aisle leaves nowhere to hide when Jingles walks it.',
  },
  {
    slug: 'security',
    name: 'Security',
    shots: ['security', 'security-desk'],
    blurb: 'Desks, monitors and a server rack in cold blue light, reached through a corridor with a DANGER electrical cabinet.',
  },
  {
    slug: 'interrogation-room',
    name: 'Interrogation Room',
    shots: ['interrogation', 'interrogation-red'],
    blurb: 'Steel shelving and desks under harsh light, watched through a red-lit observation window.',
  },
];
