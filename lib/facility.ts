// ---------------------------------------------------------------------------
// FIXED LAYER — the physical venue.
//
// Three chambers, five doorways, and the effects rig. This is the capex the
// operator builds once. Themes (the swappable layer) map their room graphs
// onto these shells: a doorway a theme doesn't use renders as a sealed
// panel, and every anchor station / rig unit keeps its physical position
// across all themes.
//
// Units are FEET throughout (1 world unit = 1 ft). Origin of each chamber
// is its floor center; +z is that chamber's "north".
// ---------------------------------------------------------------------------

import type {
  ChamberId,
  ChamberShell,
  DoorwayDef,
  EnvironmentalEffect,
  RigUnit,
} from './types';

export const WALL_HEIGHT = 10;
export const EYE_HEIGHT = 5.6; // ~5'7" human eye level
export const DOOR_WIDTH = 3.5;
export const DOOR_HEIGHT = 6.7; // ~6'8" real door

export const CHAMBERS: Record<ChamberId, ChamberShell> = {
  A: { id: 'A', size: [20, 20], height: WALL_HEIGHT },
  B: { id: 'B', size: [16, 20], height: WALL_HEIGHT },
  C: { id: 'C', size: [20, 24], height: WALL_HEIGHT },
};

// Face-into-the-room yaws (forward = (-sin θ, 0, -cos θ)):
const FACE_N = Math.PI; // toward +z
const FACE_S = 0; // toward -z
const FACE_E = -Math.PI / 2; // toward +x
const FACE_W = Math.PI / 2; // toward -x

export const DOORWAYS: DoorwayDef[] = [
  {
    // Lobby entry into chamber A — players spawn here.
    id: 'ENTRY-A',
    width: DOOR_WIDTH,
    height: DOOR_HEIGHT,
    sides: [
      {
        chamber: 'A',
        position: [0, 0, -10],
        rotationY: 0,
        spawn: [0, 0, -6.5],
        spawnYaw: FACE_N,
      },
    ],
  },
  {
    id: 'A-B',
    width: DOOR_WIDTH,
    height: DOOR_HEIGHT,
    sides: [
      {
        chamber: 'A',
        position: [10, 0, 2],
        rotationY: Math.PI / 2,
        spawn: [6.5, 0, 2],
        spawnYaw: FACE_W,
      },
      {
        chamber: 'B',
        position: [-8, 0, 2],
        rotationY: Math.PI / 2,
        spawn: [-4.5, 0, 2],
        spawnYaw: FACE_E,
      },
    ],
  },
  {
    id: 'A-C',
    width: DOOR_WIDTH,
    height: DOOR_HEIGHT,
    sides: [
      {
        chamber: 'A',
        position: [-3, 0, 10],
        rotationY: 0,
        spawn: [-3, 0, 6.5],
        spawnYaw: FACE_S,
      },
      {
        chamber: 'C',
        position: [-3, 0, -12],
        rotationY: 0,
        spawn: [-3, 0, -8.5],
        spawnYaw: FACE_N,
      },
    ],
  },
  {
    id: 'B-C',
    width: DOOR_WIDTH,
    height: DOOR_HEIGHT,
    sides: [
      {
        chamber: 'B',
        position: [2, 0, 10],
        rotationY: 0,
        spawn: [2, 0, 6.5],
        spawnYaw: FACE_S,
      },
      {
        chamber: 'C',
        position: [7, 0, -12],
        rotationY: 0,
        spawn: [7, 0, -8.5],
        spawnYaw: FACE_N,
      },
    ],
  },
  {
    // Final exit at the far end of chamber C (most themes).
    id: 'EXIT-C',
    width: 4.5,
    height: 7.5,
    sides: [
      {
        chamber: 'C',
        position: [0, 0, 12],
        rotationY: 0,
        spawn: [0, 0, 8.5],
        spawnYaw: FACE_N,
      },
    ],
  },
  {
    // Alternate exit in chamber A — used by hub-shaped themes (Wonderland)
    // whose finale lives in the hub itself.
    id: 'EXIT-A',
    width: 3,
    height: 5.5, // deliberately small — "the little door"
    sides: [
      {
        chamber: 'A',
        position: [-10, 0, -4],
        rotationY: Math.PI / 2,
        spawn: [-6.5, 0, -4],
        spawnYaw: FACE_W,
      },
    ],
  },
];

export const getDoorway = (id: string): DoorwayDef => {
  const d = DOORWAYS.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown doorway: ${id}`);
  return d;
};

// ---------------------------------------------------------------------------
// Effects rig — generated per chamber from its footprint so every chamber
// carries the same hardware classes in the same relative places.
// ---------------------------------------------------------------------------

export function rigForChamber(chamber: ChamberId): RigUnit[] {
  const { size, height } = CHAMBERS[chamber];
  const hx = size[0] / 2;
  const hz = size[1] / 2;
  const units: RigUnit[] = [];

  // Two fans high on opposite walls
  units.push(
    {
      id: `${chamber}-fan-1`,
      type: 'fan',
      chamber,
      position: [-hx + 0.6, height - 2, -hz + 2],
      size: [1, 1.6, 1.6],
    },
    {
      id: `${chamber}-fan-2`,
      type: 'fan',
      chamber,
      position: [hx - 0.6, height - 2, hz - 2],
      size: [1, 1.6, 1.6],
    }
  );

  // Two floor misters in opposite corners
  units.push(
    {
      id: `${chamber}-mister-1`,
      type: 'mister',
      chamber,
      position: [-hx + 1.4, 0.5, hz - 1.4],
      size: [0.9, 1, 0.9],
    },
    {
      id: `${chamber}-mister-2`,
      type: 'mister',
      chamber,
      position: [hx - 1.4, 0.5, -hz + 1.4],
      size: [0.9, 1, 0.9],
    }
  );

  // LED strips along all four wall bases
  units.push(
    {
      id: `${chamber}-led-n`,
      type: 'ledStrip',
      chamber,
      position: [0, 0.15, hz - 0.35],
      size: [size[0] - 2, 0.18, 0.25],
    },
    {
      id: `${chamber}-led-s`,
      type: 'ledStrip',
      chamber,
      position: [0, 0.15, -hz + 0.35],
      size: [size[0] - 2, 0.18, 0.25],
    },
    {
      id: `${chamber}-led-w`,
      type: 'ledStrip',
      chamber,
      position: [-hx + 0.35, 0.15, 0],
      size: [0.25, 0.18, size[1] - 2],
    },
    {
      id: `${chamber}-led-e`,
      type: 'ledStrip',
      chamber,
      position: [hx - 0.35, 0.15, 0],
      size: [0.25, 0.18, size[1] - 2],
    }
  );

  // Four ceiling-corner speakers
  const corners: [number, number][] = [
    [-hx + 1, -hz + 1],
    [hx - 1, -hz + 1],
    [-hx + 1, hz - 1],
    [hx - 1, hz - 1],
  ];
  corners.forEach(([x, z], i) =>
    units.push({
      id: `${chamber}-speaker-${i + 1}`,
      type: 'speaker',
      chamber,
      position: [x, height - 1, z],
      size: [1, 1, 1],
    })
  );

  return units;
}

// ---------------------------------------------------------------------------
// Effects catalogue (physical rig ↔ digital layer)
// ---------------------------------------------------------------------------

export const EFFECTS: EnvironmentalEffect[] = [
  {
    key: 'wind',
    label: 'Wind',
    hardware: 'Wall-mounted fan array',
    description: 'Directional air movement',
  },
  {
    key: 'mist',
    label: 'Mist',
    hardware: 'Ultrasonic mist emitters',
    description: 'Atmospheric fog and haze',
  },
  {
    key: 'lighting',
    label: 'Lighting',
    hardware: 'Addressable LED channels',
    description: 'Dynamic accent lighting',
  },
  {
    key: 'audio',
    label: 'Audio',
    hardware: '4-corner spatial speakers',
    description: 'Positional sound cues',
  },
  {
    key: 'scent',
    label: 'Scent',
    hardware: 'Cartridge scent diffuser',
    description: 'Theme-matched scent profile',
  },
  {
    key: 'vibration',
    label: 'Vibration',
    hardware: 'Floor transducers',
    description: 'Low-frequency rumble',
  },
];
