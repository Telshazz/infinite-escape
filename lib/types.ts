// ---------- Core domain types for Infinite Escape™ investor demo ----------

export type Vec3 = [number, number, number];

export type PhysicalType =
  | 'table'
  | 'crate'
  | 'cabinet'
  | 'door'
  | 'wallPanel'
  | 'fan'
  | 'mister'
  | 'ledStrip'
  | 'speaker';

export type InteractionType =
  | 'Puzzle Surface'
  | 'Hidden Clue Chain'
  | 'Final Objective'
  | 'Inspect'
  | 'Wind Effect'
  | 'Mist Effect'
  | 'Lighting Effect'
  | 'Audio Source'
  | 'Ambient Surface';

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
  hardware: string; // what the real-world rig is
  description: string;
}

export interface DigitalTwinMapping {
  twinName: string; // name in the current theme's MR layer
  interactionType: InteractionType;
  linkedEffect: EffectKey | null;
}

export interface RoomAsset {
  id: string;
  name: string; // physical name
  physicalType: PhysicalType;
  position: Vec3; // feet, room is 20x20, origin at center
  size: Vec3; // feet
  rotationY?: number;
  interactionType: InteractionType;
  linkedEffect: EffectKey | null;
  activeInMixedReality: boolean;
  puzzleId?: PuzzleId; // if clicking opens a puzzle
}

export type PuzzleId = 'altar' | 'archive' | 'portal';

export interface Puzzle {
  id: PuzzleId;
  title: string;
  objective: string;
  clueEasy: string;
  clueHard: string;
  solution: string[]; // symbol ids or code digits
  completed: boolean;
}

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

export interface ThemePalette {
  fog: string;
  floor: string;
  wall: string;
  primary: string; // main emissive/material tint
  secondary: string;
  accent: string; // gold-equivalent
  keyLight: string;
  fillLight: string;
}

export interface Theme {
  id: string;
  name: string;
  tagline: string;
  gmIntro: string;
  samplePuzzleType: string;
  palette: ThemePalette;
  twins: Record<PhysicalType, string>; // physical type -> digital twin name
}

export type ViewName = 'start' | 'wizard' | 'generating' | 'room' | 'business';

export type LayerName = 'physical' | 'mixed' | 'mapping';

export interface GMMessage {
  id: number;
  from: 'gm' | 'system';
  text: string;
}

export interface GameState {
  view: ViewName;
  layer: LayerName;
  themeId: string;
  profile: PlayerProfile;
  completedPuzzles: PuzzleId[];
  activePuzzle: PuzzleId | null;
  hintsUsed: Record<PuzzleId, number>;
  gmMessages: GMMessage[];
  effects: Record<EffectKey, boolean>;
  investorViewOpen: boolean;
  regeneratorOpen: boolean;
  regenerating: boolean;
  sessionStartedAt: number | null;
  shakeSignal: number; // increments to trigger camera shake
  sessionComplete: boolean;
}
