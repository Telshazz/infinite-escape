// ---------------------------------------------------------------------------
// Core domain types for Infinite Escape™ — playable FPS build.
//
// The model is split into two layers, and that split IS the product pitch:
//
//   FIXED LAYER   — the physical venue: chamber shells, doorway positions,
//                   effects hardware (fans, misters, LEDs, speakers).
//                   Real capex. Never changes between sessions.
//   SWAPPABLE LAYER — everything the "AI" regenerates per session: theme
//                   skin, room graph shape, which mechanic runs at each
//                   anchor, GM voice, effect→narrative mapping.
//
// A PlayerProfile is resolved into a SessionSpec by lib/spec.ts at
// generation time. The renderer and game logic only ever read the spec.
// ---------------------------------------------------------------------------

export type Vec3 = [number, number, number];

// ---------------------------------------------------------------------------
// FIXED LAYER — the physical facility
// ---------------------------------------------------------------------------

/** The venue has three physical chambers. Every theme maps onto them. */
export type ChamberId = 'A' | 'B' | 'C';

export interface ChamberShell {
  id: ChamberId;
  /** footprint in feet [width(x), depth(z)] — origin at floor center */
  size: [number, number];
  height: number;
}

/**
 * A physical doorway cut into a chamber wall. Fixed — themes decide whether
 * a doorway is an active passage or a sealed panel this session.
 */
export interface DoorwaySide {
  chamber: ChamberId;
  /** center of the opening on the wall, local chamber coords (y = 0 floor) */
  position: Vec3;
  /** yaw of the door plane (0 faces +z) */
  rotationY: number;
  /** where the player stands after coming through, local coords */
  spawn: Vec3;
  /** facing yaw applied to the player at spawn */
  spawnYaw: number;
}

export interface DoorwayDef {
  id: string; // 'A-B', 'A-C', 'B-C', 'ENTRY-A', 'EXIT-C', 'EXIT-A'
  width: number; // ft
  height: number; // ft — real door scale (~6'8" = 6.67)
  sides: DoorwaySide[]; // one side per chamber it opens into
}

/** Effects hardware classes bolted to the fixed layer. */
export type RigType = 'fan' | 'mister' | 'ledStrip' | 'speaker';

export interface RigUnit {
  id: string;
  type: RigType;
  chamber: ChamberId;
  position: Vec3;
  size: Vec3;
  rotationY?: number;
}

export type EffectKey =
  | 'wind'
  | 'mist'
  | 'lighting'
  | 'audio'
  | 'scent'
  | 'vibration';

export interface EnvironmentalEffect {
  key: EffectKey;
  label: string;
  hardware: string;
  description: string;
}

// ---------------------------------------------------------------------------
// SWAPPABLE LAYER — mechanics (5 reusable engines)
// ---------------------------------------------------------------------------

export type MechanicType =
  | 'sequence' // pick items in the correct order
  | 'dial' // rotate wheels to a code
  | 'connect' // wire left nodes to right nodes
  | 'arrange' // place items into the correct slots
  | 'riddle'; // type/select the answer to a clue

export interface SequenceOption {
  id: string;
  label: string;
  glyph: string;
  /** decoy options are removed entirely on Guided difficulty */
  decoy?: boolean;
}

export interface SequenceConfig {
  kind: 'sequence';
  options: SequenceOption[];
  solution: string[]; // option ids in order
}

export interface DialConfig {
  kind: 'dial';
  /** each wheel cycles through these symbols */
  wheels: string[][];
  code: string[]; // one symbol per wheel
  wheelLabels?: string[];
  submitLabel: string;
}

export interface ConnectNode {
  id: string;
  label: string;
  glyph?: string;
}

export interface ConnectConfig {
  kind: 'connect';
  left: ConnectNode[];
  right: ConnectNode[];
  /** left id -> right id */
  pairs: Record<string, string>;
  leftTitle: string;
  rightTitle: string;
}

export interface ArrangeSlot {
  id: string;
  label: string;
}

export interface ArrangeItem {
  id: string;
  label: string;
  glyph: string;
  /** decoy items are removed on Guided difficulty */
  decoy?: boolean;
}

export interface ArrangeConfig {
  kind: 'arrange';
  slots: ArrangeSlot[];
  items: ArrangeItem[];
  /** slot id -> item id */
  solution: Record<string, string>;
  submitLabel: string;
}

export interface RiddleConfig {
  kind: 'riddle';
  prompt: string;
  /** accepted answers, compared case/whitespace-insensitively */
  answers: string[];
  /** shown as buttons instead of free text on Guided difficulty */
  choices?: string[];
  placeholder?: string;
}

export type MechanicConfig =
  | SequenceConfig
  | DialConfig
  | ConnectConfig
  | ArrangeConfig
  | RiddleConfig;

// ---------------------------------------------------------------------------
// SWAPPABLE LAYER — anchors, rooms, doors, graph
// ---------------------------------------------------------------------------

/** Visual prop archetypes the renderer knows how to build procedurally. */
export type PropKind =
  | 'altar'
  | 'console'
  | 'cabinet'
  | 'pedestal'
  | 'table'
  | 'crate'
  | 'barrel'
  | 'shelf'
  | 'gate'
  | 'statue'
  | 'brazier'
  | 'panel'
  | 'pipe'
  | 'plant';

export interface PropSpec {
  kind: PropKind;
  /** optional Higgsfield-generated GLB replacing the procedural build */
  glbUrl?: string;
  glbScale?: number;
  /** color override on top of the theme palette */
  tint?: string;
}

/**
 * How an anchor participates in the resolved session:
 *  core     — the room's main beats; per-room count capped by difficulty band
 *  extra    — only spawns on Hard/Expert (difficulty >= 7)
 *  parallel — only spawns for larger groups (or Corporate mode) so players
 *             can split up; dropped for small groups
 */
export type AnchorRole = 'core' | 'extra' | 'parallel';

export interface AnchorDef {
  id: string; // unique across the whole theme
  roomId: string;
  name: string; // themed display name
  role: AnchorRole;
  mechanic: MechanicType;
  config: MechanicConfig;
  prop: PropSpec;
  position: Vec3;
  size: Vec3; // ft, for collider + focus framing
  rotationY?: number;
  /** normal direction the interaction face points (unit-ish, y ignored) */
  facing?: Vec3;
  objective: string;
  clueEasy: string; // shown in-panel at difficulty <= 5
  clueHard: string;
  hints: { clear: string[]; moderate: string[]; subtle: string[] };
  /**
   * When true, the clue needed to solve this anchor is physically located
   * in a DIFFERENT room (see ThemeRoom.clueProps). Only spawns when the
   * spec enables cross-room dependencies (difficulty >= 7).
   */
  crossRoom?: boolean;
  solvedCopy: string; // GM line on completion
  /** effect keys pulsed on completion */
  solvedEffects?: EffectKey[];
}

/** An inspectable non-puzzle prop that carries written clue text. */
export interface CluePropDef {
  id: string;
  roomId: string;
  name: string;
  text: string; // GM relays this on inspect
  prop: PropSpec;
  position: Vec3;
  size: Vec3;
  rotationY?: number;
  /** only rendered if this anchor made it into the resolved spec */
  forAnchor?: string;
}

/** Decorative themed set dressing (has a collider, not interactive). */
export interface SetPieceDef {
  prop: PropSpec;
  position: Vec3;
  size: Vec3;
  rotationY?: number;
}

export interface ThemeRoom {
  id: string;
  chamber: ChamberId;
  name: string; // themed room name
  flavor: string; // GM line on first entry
  /** 1 = always kept; higher numbers pruned first when session length is short */
  priority: number;
  /**
   * When this room is pruned, doors that pointed INTO it are retargeted to
   * this room id (linear chains stay connected). Absent = leaf room, its
   * doors are simply removed (hub side-chambers).
   */
  pruneCollapseTo?: string;
  anchors: AnchorDef[];
  clueProps?: CluePropDef[];
  setPieces?: SetPieceDef[];
}

export type GateCondition =
  | { type: 'always' }
  /** all listed anchors complete (ids not in the resolved spec are ignored) */
  | { type: 'anchors'; allOf: string[] }
  /** every required anchor in the whole session is complete */
  | { type: 'allRequired' };

export interface ThemeDoor {
  id: string;
  doorway: string; // fixed DoorwayDef id — the physical opening it uses
  from: string; // theme room id
  /** theme room id, or 'ESCAPE' for the session-completing exit */
  to: string;
  name: string; // themed door name
  gate: GateCondition;
  lockedCopy: string; // GM line when the gate is not yet satisfied
  transitionCopy: string; // overlay copy during the room swap
}

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

export interface ThemePalette {
  fog: string;
  floor: string;
  wall: string;
  primary: string;
  secondary: string;
  accent: string;
  keyLight: string;
  fillLight: string;
}

export type CopyRegister = 'standard' | 'dark' | 'professional' | 'family';

export interface Theme {
  id: string;
  name: string;
  tagline: string;
  gmIntro: string;
  /** one-line description of this theme's puzzle identity, for pickers */
  samplePuzzleType: string;
  /** 'linear' | 'nonlinear' — a property of the authored content, shown in UI */
  structure: 'linear' | 'nonlinear';
  palette: ThemePalette;
  /** digital-twin names for fixed rig + generic prop classes (mapping layer) */
  twins: Record<string, string>;
  rooms: ThemeRoom[];
  doors: ThemeDoor[];
  /** optional ambient loop in /public/audio */
  ambientAudio?: string;
}

// ---------------------------------------------------------------------------
// Player profile → resolved SessionSpec
// ---------------------------------------------------------------------------

export type GameMode =
  | 'Family Friendly'
  | 'Adventure'
  | 'Horror'
  | 'Corporate Team Building';

export type FearLevel = 'None' | 'Mild' | 'Intense';

export interface PlayerProfile {
  playerCount: number;
  theme: string;
  difficulty: number; // 1-10
  mode: GameMode;
  fearLevel: FearLevel;
  sessionLength: 30 | 45 | 60;
}

export type DifficultyBand = 'guided' | 'standard' | 'hard' | 'expert';

export type HintTier = 'clear' | 'moderate' | 'subtle';

export interface ResolvedDoor extends ThemeDoor {
  /** gate condition with pruned anchor ids already removed */
  resolvedGate: GateCondition;
}

export interface SessionSpec {
  themeId: string;
  profile: PlayerProfile;
  band: DifficultyBand;
  /** rooms kept this session, in authored order */
  rooms: ThemeRoom[];
  startRoomId: string;
  doors: ResolvedDoor[];
  /** anchor ids that must be completed before the exit opens */
  requiredAnchors: string[];
  /** all spawned anchors by id (includes decorative decoy info already applied) */
  anchors: Record<string, AnchorDef>;
  // --- hint policy ---
  hintCapPerAnchor: number; // Infinity on Guided
  hintStartTier: HintTier;
  // --- GM behaviour ---
  gmProactive: boolean; // nudges on idle (Guided)
  gmIdleNudgeSec: number;
  gmSilent: boolean; // Expert: speaks only when asked
  copyRegister: CopyRegister;
  // --- effects ---
  /** 0..1 — resolved via Mode caps > Fear multiplier > Difficulty baseline */
  effectIntensity: number;
  jumpScares: boolean;
  /** Family Friendly: count-up timer instead of pressure countdown */
  timerPressure: boolean;
  // --- structure facts (surfaced in the generation sequence + investor view) ---
  decoysEnabled: boolean;
  crossRoomEnabled: boolean;
  parallelBias: boolean;
  totalPuzzles: number;
  notes: string[]; // human-readable resolution log, shown during generation
}

// ---------------------------------------------------------------------------
// App / UI state
// ---------------------------------------------------------------------------

export type ViewName = 'start' | 'wizard' | 'generating' | 'room' | 'business';

export type LayerName = 'physical' | 'mixed' | 'mapping';

export interface GMMessage {
  id: number;
  from: 'gm' | 'system';
  text: string;
}

/** What the center reticle is currently pointing at (within reach). */
export interface AimTarget {
  kind: 'anchor' | 'door' | 'clue';
  id: string;
  prompt: string;
  locked?: boolean;
}
