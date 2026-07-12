// ---------------------------------------------------------------------------
// Session spec resolver.
//
// This is what the "AI generating your room…" sequence actually computes.
// All six profile fields resolve DETERMINISTICALLY into one SessionSpec.
// Nothing in the setup wizard is cosmetic:
//
//   difficulty     → band → puzzles/room, decoys, cross-room deps,
//                    hint quantity cap + starting tier, GM posture,
//                    baseline effect intensity
//   sessionLength  → room budget (separate axis from difficulty: a 30-min
//                    Expert run is FEWER rooms with denser puzzles)
//   playerCount    → parallel vs sequential anchor structure
//   mode           → CEILINGS: hard caps on fear-adjacent intensity,
//                    copy register, timer pressure, parallel bias
//   fearLevel      → independent multiplier on effect intensity within
//                    whatever ceiling the mode allows
//
// Precedence when fields conflict (explicit, top wins):
//   1. Mode caps            (Family Friendly can never jump-scare)
//   2. Fear Level multiplier
//   3. Difficulty baseline
// ---------------------------------------------------------------------------

import type {
  AnchorDef,
  DifficultyBand,
  GameMode,
  GateCondition,
  PlayerProfile,
  ResolvedDoor,
  SessionSpec,
  Theme,
  ThemeRoom,
} from './types';

export function bandFor(difficulty: number): DifficultyBand {
  if (difficulty <= 3) return 'guided';
  if (difficulty <= 6) return 'standard';
  if (difficulty <= 8) return 'hard';
  return 'expert';
}

/** Max core+extra puzzles allowed per room, by band. */
const PUZZLES_PER_ROOM: Record<DifficultyBand, number> = {
  guided: 1,
  standard: 2,
  hard: 3,
  expert: Infinity,
};

/** Hint quantity cap per anchor, by band (tier escalation is separate). */
const HINT_CAP: Record<DifficultyBand, number> = {
  guided: Infinity,
  standard: 5,
  hard: 2,
  expert: 1,
};

const HINT_START: Record<DifficultyBand, 'clear' | 'moderate' | 'subtle'> = {
  guided: 'clear',
  standard: 'clear',
  hard: 'subtle',
  expert: 'subtle',
};

/** Room budget from session length. Length caps rooms; difficulty never adds rooms back. */
function roomBudget(sessionLength: number): number {
  if (sessionLength <= 30) return 2;
  return 3; // 45 and 60 minute sessions carry the full theme
}

/** Mode ceilings on effect intensity (applied LAST — they always win). */
const MODE_INTENSITY_CAP: Record<GameMode, number> = {
  'Family Friendly': 0.45,
  'Corporate Team Building': 0.6,
  Adventure: 0.85,
  Horror: 1.0,
};

const FEAR_MULT: Record<string, number> = {
  None: 0.55,
  Mild: 1.0,
  Intense: 1.35,
};

export function resolveSessionSpec(
  theme: Theme,
  profile: PlayerProfile
): SessionSpec {
  const notes: string[] = [];
  const band = bandFor(profile.difficulty);

  // -------------------------------------------------------------------
  // 1. Room budget — session length prunes rooms (never difficulty).
  // -------------------------------------------------------------------
  const budget = roomBudget(profile.sessionLength);
  const sorted = [...theme.rooms].sort((a, b) => a.priority - b.priority);
  const kept = sorted.slice(0, budget);
  const keptIds = new Set(kept.map((r) => r.id));
  const pruned = sorted.slice(budget);
  // preserve authored order for kept rooms
  const rooms: ThemeRoom[] = theme.rooms.filter((r) => keptIds.has(r.id));

  if (pruned.length > 0) {
    notes.push(
      `${profile.sessionLength}-minute session: ${pruned
        .map((r) => r.name)
        .join(', ')} sealed off — ${rooms.length} of ${theme.rooms.length} chambers active`
    );
  } else {
    notes.push(
      `${profile.sessionLength}-minute session: all ${rooms.length} chambers active`
    );
  }

  // -------------------------------------------------------------------
  // 2. Anchor selection per room — difficulty band + player count.
  // -------------------------------------------------------------------
  const crossRoomEnabled = profile.difficulty >= 7;
  const decoysEnabled = band !== 'guided';
  // Corporate mode biases toward split-up structure regardless of headcount;
  // otherwise parallel anchors need a group big enough to split.
  const parallelBias =
    profile.mode === 'Corporate Team Building' || profile.playerCount >= 5;

  const perRoomCap = PUZZLES_PER_ROOM[band];
  const anchors: Record<string, AnchorDef> = {};
  const requiredAnchors: string[] = [];

  for (const room of rooms) {
    let taken = 0;
    for (const a of room.anchors) {
      if (a.role === 'extra' && band !== 'hard' && band !== 'expert') continue;
      if (a.crossRoom && !crossRoomEnabled) continue;
      if (a.role === 'parallel' && !parallelBias) continue;
      // parallel anchors sit OUTSIDE the difficulty cap — they exist so a
      // bigger group has simultaneous work, not to raise difficulty
      if (a.role !== 'parallel') {
        if (taken >= perRoomCap) continue;
        taken++;
      }
      // Guided difficulty strips decoy options out of the mechanic itself
      const config = decoysEnabled ? a.config : stripDecoys(a.config);
      anchors[a.id] = { ...a, config };
      requiredAnchors.push(a.id);
    }
  }

  const totalPuzzles = requiredAnchors.length;
  notes.push(
    `Difficulty ${profile.difficulty} (${band}): ${totalPuzzles} puzzles across ${rooms.length} chambers` +
      (decoysEnabled ? ', decoys live' : ', no decoys') +
      (crossRoomEnabled ? ', cross-chamber dependencies armed' : '')
  );
  if (parallelBias) {
    notes.push(
      `${profile.playerCount} players${
        profile.mode === 'Corporate Team Building' ? ' (corporate)' : ''
      }: parallel stations enabled — the group can split up`
    );
  } else {
    notes.push(
      `${profile.playerCount} players: sequential single-focus pacing`
    );
  }

  // -------------------------------------------------------------------
  // 3. Doors — retarget/prune against removed rooms, filter gate ids
  //    down to anchors that actually spawned.
  // -------------------------------------------------------------------
  const collapse = new Map<string, string>();
  for (const r of pruned) {
    if (r.pruneCollapseTo) collapse.set(r.id, r.pruneCollapseTo);
  }
  const resolveTarget = (id: string): string | null => {
    let cur = id;
    for (let i = 0; i < 8 && collapse.has(cur); i++) cur = collapse.get(cur)!;
    return cur === 'ESCAPE' || keptIds.has(cur) ? cur : null;
  };

  const doors: ResolvedDoor[] = [];
  for (const d of theme.doors) {
    const from = keptIds.has(d.from) ? d.from : null;
    const to = d.to === 'ESCAPE' ? 'ESCAPE' : resolveTarget(d.to);
    if (!from || !to || from === to) continue; // door into a pruned leaf: gone
    doors.push({
      ...d,
      from,
      to,
      resolvedGate: filterGate(d.gate, anchors),
    });
  }

  // -------------------------------------------------------------------
  // 4. Effect intensity — explicit precedence chain.
  // -------------------------------------------------------------------
  // Difficulty baseline: 0.35 (easy) … 0.8 (expert)
  let intensity = 0.3 + profile.difficulty * 0.05;
  // Horror raises the FLOOR regardless of difficulty (flicker, stingers)
  if (profile.mode === 'Horror') intensity = Math.max(intensity, 0.65);
  // Fear level multiplies within the range…
  intensity *= FEAR_MULT[profile.fearLevel] ?? 1;
  // …and the mode ceiling always wins.
  intensity = Math.min(intensity, MODE_INTENSITY_CAP[profile.mode]);
  intensity = Math.min(1, Math.max(0.15, intensity));

  // Jump-scare-style spikes: never in Family Friendly (hard cap), otherwise
  // require Intense fear plus either Horror mode or a hard/expert run.
  const jumpScares =
    profile.mode !== 'Family Friendly' &&
    profile.fearLevel === 'Intense' &&
    (profile.mode === 'Horror' || profile.difficulty >= 7);

  notes.push(
    `Effects: ${Math.round(intensity * 100)}% intensity — ` +
      `${profile.mode} ceiling ${Math.round(MODE_INTENSITY_CAP[profile.mode] * 100)}%, ` +
      `fear ${profile.fearLevel} ×${FEAR_MULT[profile.fearLevel]}` +
      (jumpScares ? ', startle cues armed' : ', no startle cues')
  );

  // -------------------------------------------------------------------
  // 5. GM posture + copy register.
  // -------------------------------------------------------------------
  const gmProactive = band === 'guided';
  const gmSilent = band === 'expert';
  const copyRegister =
    profile.mode === 'Horror'
      ? 'dark'
      : profile.mode === 'Corporate Team Building'
        ? 'professional'
        : profile.mode === 'Family Friendly'
          ? 'family'
          : 'standard';

  const hintCap = HINT_CAP[band];
  notes.push(
    `Game Master: ${
      gmProactive
        ? 'proactive — nudges after ~50s idle, unlimited hints'
        : gmSilent
          ? `silent until asked — ${hintCap} hint/puzzle`
          : `on request — ${hintCap} hints/puzzle`
    }, ${HINT_START[band]} first hint, ${copyRegister} register`
  );

  // Family Friendly avoids tense mechanics: the timer counts up, no pressure.
  const timerPressure = profile.mode !== 'Family Friendly';

  return {
    themeId: theme.id,
    profile,
    band,
    rooms,
    startRoomId: rooms[0].id,
    doors,
    requiredAnchors,
    anchors,
    hintCapPerAnchor: hintCap,
    hintStartTier: HINT_START[band],
    gmProactive,
    gmIdleNudgeSec: 50,
    gmSilent,
    copyRegister,
    effectIntensity: intensity,
    jumpScares,
    timerPressure,
    decoysEnabled,
    crossRoomEnabled,
    parallelBias,
    totalPuzzles,
    notes,
  };
}

/** Remove decoy options/items from a mechanic config (Guided difficulty). */
function stripDecoys(config: AnchorDef['config']): AnchorDef['config'] {
  switch (config.kind) {
    case 'sequence':
      return { ...config, options: config.options.filter((o) => !o.decoy) };
    case 'arrange':
      return { ...config, items: config.items.filter((i) => !i.decoy) };
    default:
      return config;
  }
}

/** Drop anchor ids that didn't spawn this session from a gate condition. */
function filterGate(
  gate: GateCondition,
  anchors: Record<string, AnchorDef>
): GateCondition {
  if (gate.type !== 'anchors') return gate;
  const allOf = gate.allOf.filter((id) => anchors[id]);
  return allOf.length === 0 ? { type: 'always' } : { type: 'anchors', allOf };
}

/** Is this gate satisfied given the completed-anchor set? */
export function gateSatisfied(
  gate: GateCondition,
  completed: string[],
  requiredAnchors: string[]
): boolean {
  switch (gate.type) {
    case 'always':
      return true;
    case 'anchors':
      return gate.allOf.every((id) => completed.includes(id));
    case 'allRequired':
      return requiredAnchors.every((id) => completed.includes(id));
  }
}

/** Human-readable description of what a locked gate still needs. */
export function gateMissing(
  gate: GateCondition,
  completed: string[],
  requiredAnchors: string[],
  anchors: Record<string, AnchorDef>
): string[] {
  const ids =
    gate.type === 'anchors'
      ? gate.allOf
      : gate.type === 'allRequired'
        ? requiredAnchors
        : [];
  return ids
    .filter((id) => !completed.includes(id))
    .map((id) => anchors[id]?.name ?? id);
}
