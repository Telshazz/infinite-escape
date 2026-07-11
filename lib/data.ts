import type {
  EnvironmentalEffect,
  PuzzleId,
  RoomAsset,
  Theme,
} from './types';

// ---------------------------------------------------------------------------
// Room: 20 ft x 20 ft, origin at floor center. +Z faces the door wall (north).
// ---------------------------------------------------------------------------

export const ROOM_SIZE = 20;
export const WALL_HEIGHT = 10;

export const ROOM_ASSETS: RoomAsset[] = [
  {
    id: 'table',
    name: 'Center Table',
    physicalType: 'table',
    position: [0, 1.5, 0],
    size: [4.5, 3, 3],
    interactionType: 'Puzzle Surface',
    linkedEffect: 'lighting',
    activeInMixedReality: true,
    puzzleId: 'altar',
  },
  {
    id: 'crate-1',
    name: 'Crate A',
    physicalType: 'crate',
    position: [-7, 1, -7],
    size: [2, 2, 2],
    rotationY: 0.3,
    interactionType: 'Inspect',
    linkedEffect: null,
    activeInMixedReality: true,
  },
  {
    id: 'crate-2',
    name: 'Crate B',
    physicalType: 'crate',
    position: [7.2, 1, -6.5],
    size: [2, 2, 2],
    rotationY: -0.2,
    interactionType: 'Inspect',
    linkedEffect: null,
    activeInMixedReality: true,
  },
  {
    id: 'crate-3',
    name: 'Crate C',
    physicalType: 'crate',
    position: [6.4, 1, 5.8],
    size: [2, 2, 2],
    rotationY: 0.55,
    interactionType: 'Inspect',
    linkedEffect: null,
    activeInMixedReality: true,
  },
  {
    id: 'cabinet',
    name: 'Storage Cabinet',
    physicalType: 'cabinet',
    position: [-9.1, 3.5, 2],
    size: [1.6, 7, 4],
    interactionType: 'Hidden Clue Chain',
    linkedEffect: 'audio',
    activeInMixedReality: true,
    puzzleId: 'archive',
  },
  {
    id: 'door',
    name: 'Exit Door',
    physicalType: 'door',
    position: [0, 3.75, 9.85],
    size: [4, 7.5, 0.4],
    interactionType: 'Final Objective',
    linkedEffect: 'lighting',
    activeInMixedReality: true,
    puzzleId: 'portal',
  },
  {
    id: 'panel-1',
    name: 'Wall Panel W',
    physicalType: 'wallPanel',
    position: [-9.8, 5, -4],
    size: [0.25, 6, 5],
    interactionType: 'Ambient Surface',
    linkedEffect: null,
    activeInMixedReality: true,
  },
  {
    id: 'panel-2',
    name: 'Wall Panel E',
    physicalType: 'wallPanel',
    position: [9.8, 5, 1],
    size: [0.25, 6, 5],
    interactionType: 'Ambient Surface',
    linkedEffect: null,
    activeInMixedReality: true,
  },
  {
    id: 'panel-3',
    name: 'Wall Panel S',
    physicalType: 'wallPanel',
    position: [3, 5, -9.8],
    size: [5, 6, 0.25],
    interactionType: 'Ambient Surface',
    linkedEffect: null,
    activeInMixedReality: true,
  },
  {
    id: 'fan-1',
    name: 'Fan Unit 1',
    physicalType: 'fan',
    position: [-9.5, 8, -8],
    size: [1, 1.6, 1.6],
    interactionType: 'Wind Effect',
    linkedEffect: 'wind',
    activeInMixedReality: true,
  },
  {
    id: 'fan-2',
    name: 'Fan Unit 2',
    physicalType: 'fan',
    position: [9.5, 8, 7],
    size: [1, 1.6, 1.6],
    interactionType: 'Wind Effect',
    linkedEffect: 'wind',
    activeInMixedReality: true,
  },
  {
    id: 'mister-1',
    name: 'Mist Emitter 1',
    physicalType: 'mister',
    position: [-8.6, 0.5, 8.6],
    size: [0.9, 1, 0.9],
    interactionType: 'Mist Effect',
    linkedEffect: 'mist',
    activeInMixedReality: true,
  },
  {
    id: 'mister-2',
    name: 'Mist Emitter 2',
    physicalType: 'mister',
    position: [8.8, 0.5, -8.8],
    size: [0.9, 1, 0.9],
    interactionType: 'Mist Effect',
    linkedEffect: 'mist',
    activeInMixedReality: true,
  },
  {
    id: 'led-1',
    name: 'LED Strip N',
    physicalType: 'ledStrip',
    position: [0, 0.15, 9.7],
    size: [18, 0.18, 0.25],
    interactionType: 'Lighting Effect',
    linkedEffect: 'lighting',
    activeInMixedReality: true,
  },
  {
    id: 'led-2',
    name: 'LED Strip S',
    physicalType: 'ledStrip',
    position: [0, 0.15, -9.7],
    size: [18, 0.18, 0.25],
    interactionType: 'Lighting Effect',
    linkedEffect: 'lighting',
    activeInMixedReality: true,
  },
  {
    id: 'led-3',
    name: 'LED Strip W',
    physicalType: 'ledStrip',
    position: [-9.7, 0.15, 0],
    size: [0.25, 0.18, 18],
    interactionType: 'Lighting Effect',
    linkedEffect: 'lighting',
    activeInMixedReality: true,
  },
  {
    id: 'led-4',
    name: 'LED Strip E',
    physicalType: 'ledStrip',
    position: [9.7, 0.15, 0],
    size: [0.25, 0.18, 18],
    interactionType: 'Lighting Effect',
    linkedEffect: 'lighting',
    activeInMixedReality: true,
  },
  {
    id: 'speaker-1',
    name: 'Speaker NW',
    physicalType: 'speaker',
    position: [-9, 9, 9],
    size: [1, 1, 1],
    interactionType: 'Audio Source',
    linkedEffect: 'audio',
    activeInMixedReality: true,
  },
  {
    id: 'speaker-2',
    name: 'Speaker NE',
    physicalType: 'speaker',
    position: [9, 9, 9],
    size: [1, 1, 1],
    interactionType: 'Audio Source',
    linkedEffect: 'audio',
    activeInMixedReality: true,
  },
  {
    id: 'speaker-3',
    name: 'Speaker SW',
    physicalType: 'speaker',
    position: [-9, 9, -9],
    size: [1, 1, 1],
    interactionType: 'Audio Source',
    linkedEffect: 'audio',
    activeInMixedReality: true,
  },
  {
    id: 'speaker-4',
    name: 'Speaker SE',
    physicalType: 'speaker',
    position: [9, 9, -9],
    size: [1, 1, 1],
    interactionType: 'Audio Source',
    linkedEffect: 'audio',
    activeInMixedReality: true,
  },
];

// ---------------------------------------------------------------------------
// Puzzles
// ---------------------------------------------------------------------------

export const SYMBOLS = [
  { id: 'trident', label: 'Trident', glyph: 'trident' },
  { id: 'wave', label: 'Wave', glyph: 'wave' },
  { id: 'spiral', label: 'Nautilus', glyph: 'spiral' },
  { id: 'star', label: 'Guiding Star', glyph: 'star' },
  { id: 'eye', label: 'Watcher', glyph: 'eye' },
  { id: 'column', label: 'Pillar', glyph: 'column' },
] as const;

export type SymbolId = (typeof SYMBOLS)[number]['id'];

export const ALTAR_SOLUTION: SymbolId[] = ['trident', 'wave', 'spiral', 'star'];
export const ARCHIVE_CODE = ['7', '4', '2'];

export const PUZZLES_BASE = [
  {
    id: 'altar' as PuzzleId,
    title: 'Activate the Atlantean Altar',
    objective: 'Restore the first energy seal by entering the sacred sequence.',
    clueEasy:
      'The inscription reads plainly: first the weapon of the deep, then the rising tide, then the shell that remembers, then the light that guides.',
    clueHard:
      'A weathered inscription: "What Poseidon wields precedes what the moon commands. Memory coils before light leads home."',
    solution: ALTAR_SOLUTION as string[],
  },
  {
    id: 'archive' as PuzzleId,
    title: 'Open the Relic Archive',
    objective: 'Recover the second seal by unlocking the archive cipher.',
    clueEasy:
      'Etched inside the archive door: "Seven tides. Four pillars. Two moons." Enter 7 · 4 · 2.',
    clueHard:
      'A mural shows the tides that struck the city (VII), the pillars still standing (IV), and the moons above the gate (II).',
    solution: ARCHIVE_CODE,
  },
  {
    id: 'portal' as PuzzleId,
    title: 'Stabilize the Portal Gate',
    objective: 'With both seals restored, channel their energy into the gate.',
    clueEasy: 'The gate only answers when both seals burn teal.',
    clueHard: 'The gate is deaf until the altar and the archive both sing.',
    solution: [],
  },
];

// Hints: [clear, moderate, subtle] per puzzle. Difficulty picks the band,
// repeated requests walk toward clearer hints.
export const HINTS: Record<PuzzleId, { clear: string[]; moderate: string[]; subtle: string[] }> = {
  altar: {
    clear: [
      'Select in this exact order: Trident → Wave → Nautilus → Guiding Star.',
      'Start with the Trident. End with the Guiding Star.',
    ],
    moderate: [
      'Poseidon acts first. The star always comes last.',
      'Two of the six symbols are decoys — the Watcher and the Pillar play no part.',
    ],
    subtle: [
      'Weapons precede water. Memory precedes light.',
      'Six symbols are offered. Only four belong to the sequence.',
    ],
  },
  archive: {
    clear: [
      'The code is 7 · 4 · 2 — tides, pillars, moons.',
      'Count downward: tides, then pillars, then moons.',
    ],
    moderate: [
      'Roman numerals hide in the mural: VII, IV, II.',
      'Three numbers, strictly decreasing.',
    ],
    subtle: [
      'The city counted everything in what it lost.',
      'Read the mural top to bottom, largest to smallest.',
    ],
  },
  portal: {
    clear: [
      'Complete the Altar and the Archive first, then click the gate.',
    ],
    moderate: ['The gate needs both energy seals restored before it responds.'],
    subtle: ['Unfinished seals leave the gate silent.'],
  },
};

// ---------------------------------------------------------------------------
// Environmental effects (physical rig ↔ digital layer)
// ---------------------------------------------------------------------------

export const EFFECTS: EnvironmentalEffect[] = [
  {
    key: 'wind',
    label: 'Wind',
    hardware: 'Wall-mounted fan array',
    description: 'Ocean currents sweep the chamber',
  },
  {
    key: 'mist',
    label: 'Mist',
    hardware: 'Ultrasonic mist emitters',
    description: 'Thermal vents release sea fog',
  },
  {
    key: 'lighting',
    label: 'Lighting',
    hardware: 'Addressable LED channels',
    description: 'Energy channels pulse across the floor',
  },
  {
    key: 'audio',
    label: 'Audio',
    hardware: '4-corner spatial speakers',
    description: 'Directional creature and voice cues',
  },
  {
    key: 'scent',
    label: 'Scent',
    hardware: 'Cartridge scent diffuser',
    description: 'Salt air and ancient stone',
  },
  {
    key: 'vibration',
    label: 'Vibration',
    hardware: 'Floor transducers',
    description: 'The chamber trembles',
  },
];

// ---------------------------------------------------------------------------
// Themes — same physical room, different generated realities
// ---------------------------------------------------------------------------

export const THEMES: Theme[] = [
  {
    id: 'atlantis',
    name: 'The Lost City of Atlantis',
    tagline: 'A drowned temple wakes for the first explorers in 3,000 years.',
    gmIntro:
      'Welcome, explorers. The temple has awakened. Restore the three energy seals before the chamber floods.',
    samplePuzzleType: 'Symbol sequence + numeric cipher',
    palette: {
      fog: '#06283a',
      floor: '#0a2f42',
      wall: '#0d3a52',
      primary: '#1f8f85',
      secondary: '#35e0ce',
      accent: '#d9a441',
      keyLight: '#35e0ce',
      fillLight: '#0e7c74',
    },
    twins: {
      table: 'Atlantean Navigation Altar',
      crate: 'Ancient Treasure Container',
      cabinet: 'Relic Archive',
      door: 'Portal Gate',
      wallPanel: 'Underwater Temple Wall',
      fan: 'Ocean-Current Emitter',
      mister: 'Underwater Steam Vent',
      ledStrip: 'Magical Energy Channel',
      speaker: 'Leviathan Voice Source',
    },
  },
  {
    id: 'pirate',
    name: 'Pirate Adventure',
    tagline: 'A cursed galleon hold, one tide from sinking.',
    gmIntro:
      "Ahoy. The captain's hold is sealed and the tide is rising. Find the marks, crack the strongbox, and take the wheel before she goes under.",
    samplePuzzleType: 'Map fragment assembly + compass bearing lock',
    palette: {
      fog: '#2a1c0e',
      floor: '#3a2a16',
      wall: '#4a3319',
      primary: '#8a5a24',
      secondary: '#e0a035',
      accent: '#c23b22',
      keyLight: '#ffb347',
      fillLight: '#8a5a24',
    },
    twins: {
      table: "Captain's Chart Table",
      crate: 'Plundered Cargo Chest',
      cabinet: 'Powder Magazine Locker',
      door: 'Quarterdeck Hatch',
      wallPanel: 'Galleon Hull Timbers',
      fan: 'Storm-Gust Rig',
      mister: 'Sea-Spray Vent',
      ledStrip: 'Lantern Fuse Line',
      speaker: 'Crow’s-Nest Callout',
    },
  },
  {
    id: 'zombie',
    name: 'Zombie Apocalypse',
    tagline: 'A quarantine lab, sixty seconds after containment failed.',
    gmIntro:
      'Containment breach confirmed. Power is failing. Re-arm the lab, decode the antidote sequence, and reach the airlock before the horde does.',
    samplePuzzleType: 'UV-reveal codes + circuit re-routing',
    palette: {
      fog: '#141b12',
      floor: '#1a2418',
      wall: '#22301e',
      primary: '#3f6b2f',
      secondary: '#8fe03a',
      accent: '#c23b22',
      keyLight: '#8fe03a',
      fillLight: '#2f4d24',
    },
    twins: {
      table: 'Field Autopsy Station',
      crate: 'Military Supply Drop',
      cabinet: 'Antidote Cold Storage',
      door: 'Quarantine Airlock',
      wallPanel: 'Blast-Scarred Bulkhead',
      fan: 'Ventilation Failure Duct',
      mister: 'Coolant Leak Vent',
      ledStrip: 'Emergency Power Conduit',
      speaker: 'Horde Proximity Audio',
    },
  },
  {
    id: 'wonderland',
    name: 'Alice in Wonderland',
    tagline: 'A tea party where logic runs backwards.',
    gmIntro:
      "You're late. The Queen has locked the garden and the riddles only answer in nonsense. Solve the table, open the cupboard, and find the little door.",
    samplePuzzleType: 'Mirror-logic riddles + size-shift sequencing',
    palette: {
      fog: '#241033',
      floor: '#2e1542',
      wall: '#3a1b52',
      primary: '#7a3fa0',
      secondary: '#e05ad0',
      accent: '#ffd23f',
      keyLight: '#e05ad0',
      fillLight: '#5a2f7a',
    },
    twins: {
      table: 'Mad Tea Table',
      crate: 'Queen’s Croquet Chest',
      cabinet: 'Curiouser Cupboard',
      door: 'The Little Door',
      wallPanel: 'Living Rose Hedge',
      fan: 'Cheshire Breeze',
      mister: 'Looking-Glass Fog',
      ledStrip: 'Talking Flower Border',
      speaker: 'Disembodied Grin Audio',
    },
  },
  {
    id: 'space',
    name: 'Space Station',
    tagline: 'A derelict orbital lab, drifting toward re-entry.',
    gmIntro:
      'Station AURA is losing orbit. Restore reactor sequence, recover the black box, and stabilize the docking gate before atmospheric burn.',
    samplePuzzleType: 'Reactor sequencing + orbital telemetry cipher',
    palette: {
      fog: '#0a1024',
      floor: '#101a33',
      wall: '#152242',
      primary: '#2a4a8f',
      secondary: '#4aa8ff',
      accent: '#ff8a3d',
      keyLight: '#4aa8ff',
      fillLight: '#1f3a6b',
    },
    twins: {
      table: 'Reactor Control Console',
      crate: 'Zero-G Cargo Pod',
      cabinet: 'Cryo-Sample Vault',
      door: 'Docking Airlock Gate',
      wallPanel: 'Observation Viewport',
      fan: 'Life-Support Circulator',
      mister: 'Coolant Vent',
      ledStrip: 'Guidance Light Rail',
      speaker: 'Station AI Voice Node',
    },
  },
  {
    id: 'castle',
    name: 'Medieval Castle',
    tagline: 'The king’s vault, guarded by riddles older than the crown.',
    gmIntro:
      'The castle sleeps and the vault waits. Read the heraldry, unlock the reliquary, and open the great gate before the watch returns.',
    samplePuzzleType: 'Heraldry matching + mechanical lock sequence',
    palette: {
      fog: '#1c1610',
      floor: '#262019',
      wall: '#332a20',
      primary: '#6b5638',
      secondary: '#d9a441',
      accent: '#8f2f2f',
      keyLight: '#ffcf7a',
      fillLight: '#6b5638',
    },
    twins: {
      table: 'War Council Table',
      crate: 'Royal Treasury Chest',
      cabinet: 'Saint’s Reliquary',
      door: 'The Great Gate',
      wallPanel: 'Tapestried Stone Wall',
      fan: 'Arrow-Slit Draft',
      mister: 'Dungeon Damp',
      ledStrip: 'Torch Ember Line',
      speaker: 'Battlement Horn',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate Team Building Mission',
    tagline: 'A boardroom heist with KPIs on the line.',
    gmIntro:
      'Your team has 60 minutes to recover the merger file. Delegate roles, decrypt the terminal, and badge out through the executive door — together.',
    samplePuzzleType: 'Role-based parallel tasks + shared decryption',
    palette: {
      fog: '#0e1620',
      floor: '#14202e',
      wall: '#1a2a3c',
      primary: '#2a5a7a',
      secondary: '#3dd6f5',
      accent: '#f5f5f0',
      keyLight: '#3dd6f5',
      fillLight: '#22506e',
    },
    twins: {
      table: 'Executive Strategy Console',
      crate: 'Secure Document Vault',
      cabinet: 'Server Rack Archive',
      door: 'Badge-Locked Executive Exit',
      wallPanel: 'Smart-Glass Display Wall',
      fan: 'HVAC Override Duct',
      mister: 'Server-Room Coolant',
      ledStrip: 'Status Indicator Rail',
      speaker: 'PA Announcement Node',
    },
  },
];

export const getTheme = (id: string): Theme =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];

// ---------------------------------------------------------------------------
// Generation sequence steps
// ---------------------------------------------------------------------------

export const GENERATION_STEPS = [
  'Scanning physical room',
  'Loading room geometry',
  'Mapping physical props',
  'Generating story arc',
  'Building puzzle chain',
  'Assigning difficulty',
  'Syncing environmental effects',
  'Launching mixed reality layer',
];

// ---------------------------------------------------------------------------
// Business model figures
// ---------------------------------------------------------------------------

export const BUSINESS = {
  license: 50000,
  monthly: 1999,
  roi: {
    annualRevenue: 250000,
    occupancyLift: 0.25,
    incrementalRevenue: 62500,
    annualSubscription: 23988,
    netOperatorValue: 38512,
  },
  expansion: [
    'Theme parks',
    'Museums',
    'Corporate training',
    'Education',
    'Tourism attractions',
  ],
};
