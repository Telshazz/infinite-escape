// ---------------------------------------------------------------------------
// Back-compat barrel + demo constants. The domain data now lives in:
//   lib/facility.ts  — fixed physical layer (chambers, doorways, rig, effects)
//   lib/themes/      — swappable layer (per-theme room graphs + mechanics)
//   lib/spec.ts      — profile → SessionSpec resolver
// ---------------------------------------------------------------------------

export { EFFECTS, WALL_HEIGHT } from './facility';
export { THEMES, getTheme, getThemeByName } from './themes';

// Steps shown during the generation sequence. Each step surfaces a REAL
// fact computed by the spec resolver (see GenerationSequence.tsx).
export const GENERATION_STEPS = [
  'Scanning physical facility',
  'Loading chamber geometry',
  'Mapping fixed-layer hardware',
  'Generating story arc',
  'Building puzzle graph',
  'Assigning difficulty profile',
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
