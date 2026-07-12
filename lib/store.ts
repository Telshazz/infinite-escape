'use client';

import { create } from 'zustand';
import type {
  AimTarget,
  EffectKey,
  GMMessage,
  HintTier,
  LayerName,
  PlayerProfile,
  SessionSpec,
  Vec3,
  ViewName,
} from './types';
import { getDoorway } from './facility';
import { getTheme, getThemeByName } from './themes';
import { gateMissing, gateSatisfied, resolveSessionSpec } from './spec';

let msgId = 0;

interface GameState {
  view: ViewName;
  layer: LayerName;
  themeId: string;
  profile: PlayerProfile;
  /** resolved at generation time — the single source of truth for the session */
  spec: SessionSpec | null;
  currentRoomId: string | null;
  visitedRooms: string[];
  completedAnchors: string[];
  /** anchor currently engaged in focus mode (camera eased in, panel open) */
  focusedAnchorId: string | null;
  /** what the reticle points at, set by the interactor, read by the HUD */
  aim: AimTarget | null;
  /** true while the pointer is unlocked with no anchor focused */
  paused: boolean;
  transition: { active: boolean; label: string };
  /** player teleport request — bump signal to apply */
  spawnPoint: Vec3;
  spawnYaw: number;
  spawnSignal: number;
  hintsUsed: Record<string, number>;
  lastProgressAt: number;
  gmMessages: GMMessage[];
  effects: Record<EffectKey, boolean>;
  investorViewOpen: boolean;
  regeneratorOpen: boolean;
  regenerating: boolean;
  gmOpen: boolean;
  effectsOpen: boolean;
  sessionStartedAt: number | null;
  shakeSignal: number;
  sessionComplete: boolean;
}

interface Actions {
  setView: (v: ViewName) => void;
  setLayer: (l: LayerName) => void;
  setProfile: (p: Partial<PlayerProfile>) => void;
  startGeneration: () => void;
  enterRoom: () => void;
  setAim: (a: AimTarget | null) => void;
  setPaused: (p: boolean) => void;
  focusAnchor: (id: string | null) => void;
  completeAnchor: (id: string) => void;
  failAttempt: (id: string) => void;
  inspectClue: (id: string) => void;
  useDoor: (id: string) => void;
  requestHint: () => void;
  gmSay: (text: string, from?: GMMessage['from']) => void;
  toggleEffect: (key: EffectKey) => void;
  setEffect: (key: EffectKey, on: boolean) => void;
  pulseEffects: (keys: EffectKey[]) => void;
  setInvestorView: (open: boolean) => void;
  setRegenerator: (open: boolean) => void;
  setGmOpen: (open: boolean) => void;
  setEffectsOpen: (open: boolean) => void;
  regenerateTheme: (themeId: string) => void;
  triggerShake: () => void;
  markProgress: () => void;
  resetDemo: () => void;
}

const defaultProfile: PlayerProfile = {
  playerCount: 4,
  theme: 'The Lost City of Atlantis',
  difficulty: 5,
  mode: 'Adventure',
  fearLevel: 'Mild',
  sessionLength: 45,
};

const initialState: GameState = {
  view: 'start',
  layer: 'mixed',
  themeId: 'atlantis',
  profile: defaultProfile,
  spec: null,
  currentRoomId: null,
  visitedRooms: [],
  completedAnchors: [],
  focusedAnchorId: null,
  aim: null,
  paused: false,
  transition: { active: false, label: '' },
  spawnPoint: [0, 0, -6.5],
  spawnYaw: Math.PI,
  spawnSignal: 0,
  hintsUsed: {},
  lastProgressAt: 0,
  gmMessages: [],
  effects: {
    wind: false,
    mist: true,
    lighting: true,
    audio: true,
    scent: false,
    vibration: false,
  },
  investorViewOpen: false,
  regeneratorOpen: false,
  regenerating: false,
  gmOpen: true,
  effectsOpen: false,
  sessionStartedAt: null,
  shakeSignal: 0,
  sessionComplete: false,
};

/** Spawn position/yaw when entering a room, optionally through a doorway. */
function spawnFor(
  spec: SessionSpec,
  roomId: string,
  viaDoorway?: string
): { point: Vec3; yaw: number } {
  const room = spec.rooms.find((r) => r.id === roomId);
  const chamber = room?.chamber ?? 'A';
  if (viaDoorway) {
    const side = getDoorway(viaDoorway).sides.find(
      (s) => s.chamber === chamber
    );
    if (side) return { point: side.spawn, yaw: side.spawnYaw };
  }
  // Entry default: the first doorway side belonging to this chamber among
  // the room's session doors, else the facility entry.
  const entry = getDoorway('ENTRY-A').sides[0];
  return { point: entry.spawn, yaw: entry.spawnYaw };
}

export const useGame = create<GameState & Actions>((set, get) => ({
  ...initialState,

  setView: (view) => set({ view }),
  setLayer: (layer) => set({ layer }),
  setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

  startGeneration: () => {
    const s = get();
    // The wizard stores the theme by display name; resolve it to a theme id
    // and run the ACTUAL generation: profile -> SessionSpec.
    const theme = getThemeByName(s.profile.theme) ?? getTheme(s.themeId);
    const spec = resolveSessionSpec(theme, s.profile);
    set({
      view: 'generating',
      themeId: theme.id,
      spec,
      completedAnchors: [],
      hintsUsed: {},
      visitedRooms: [],
      sessionComplete: false,
    });
  },

  enterRoom: () => {
    const s = get();
    if (!s.spec) return;
    const theme = getTheme(s.themeId);
    const startId = s.spec.startRoomId;
    const { point, yaw } = spawnFor(s.spec, startId, 'ENTRY-A');
    set({
      view: 'room',
      layer: 'mixed',
      currentRoomId: startId,
      visitedRooms: [startId],
      spawnPoint: point,
      spawnYaw: yaw,
      spawnSignal: s.spawnSignal + 1,
      sessionStartedAt: Date.now(),
      lastProgressAt: Date.now(),
      gmMessages: [],
      focusedAnchorId: null,
      paused: false,
      sessionComplete: false,
    });
    get().gmSay(theme.gmIntro);
    const room = s.spec.rooms.find((r) => r.id === startId);
    if (room) get().gmSay(room.flavor);
  },

  setAim: (aim) => {
    const cur = get().aim;
    // called every frame — only write when the target actually changes
    if (
      cur?.id === aim?.id &&
      cur?.kind === aim?.kind &&
      cur?.locked === aim?.locked
    )
      return;
    set({ aim });
  },

  setPaused: (paused) => set({ paused }),

  focusAnchor: (id) => {
    const s = get();
    if (id && s.completedAnchors.includes(id)) {
      get().gmSay(registerLine(s, 'alreadySolved'));
      return;
    }
    set({ focusedAnchorId: id, paused: false });
  },

  completeAnchor: (id) => {
    const s = get();
    if (!s.spec || s.completedAnchors.includes(id)) return;
    const anchor = s.spec.anchors[id];
    const completed = [...s.completedAnchors, id];
    set({
      completedAnchors: completed,
      focusedAnchorId: null,
      shakeSignal: s.shakeSignal + 1,
      lastProgressAt: Date.now(),
    });
    if (anchor?.solvedEffects) get().pulseEffects(anchor.solvedEffects);
    if (anchor) get().gmSay(anchor.solvedCopy);
    const allDone = s.spec.requiredAnchors.every((a) => completed.includes(a));
    if (allDone) {
      get().gmSay(registerLine(get(), 'allSolved'), 'system');
    }
  },

  failAttempt: (id) => {
    const s = get();
    // Guided groups get an immediate consolation nudge on a wrong attempt.
    if (s.spec?.gmProactive) {
      const anchor = s.spec.anchors[id];
      if (anchor) get().gmSay(`Not quite — ${anchor.hints.clear[0]}`);
    }
  },

  inspectClue: (id) => {
    const s = get();
    if (!s.spec) return;
    for (const room of s.spec.rooms) {
      const clue = room.clueProps?.find((c) => c.id === id);
      if (clue) {
        get().gmSay(clue.text);
        return;
      }
    }
  },

  useDoor: (id) => {
    const s = get();
    if (!s.spec || s.transition.active) return;
    const door = s.spec.doors.find((d) => d.id === id);
    if (!door) return;
    const open = gateSatisfied(
      door.resolvedGate,
      s.completedAnchors,
      s.spec.requiredAnchors
    );
    if (!open) {
      const missing = gateMissing(
        door.resolvedGate,
        s.completedAnchors,
        s.spec.requiredAnchors,
        s.spec.anchors
      );
      get().gmSay(
        missing.length > 0
          ? `${door.lockedCopy} (${missing.join(' · ')})`
          : door.lockedCopy
      );
      return;
    }

    if (door.to === 'ESCAPE') {
      set({
        sessionComplete: true,
        transition: { active: true, label: door.transitionCopy },
      });
      get().pulseEffects(['wind', 'lighting']);
      setTimeout(() => {
        set({ transition: { active: false, label: '' } });
        get().gmSay(
          'Session Complete. This facility can now instantly regenerate into a different story, puzzle graph, and difficulty profile — without physical reconstruction.',
          'system'
        );
      }, 1400);
      return;
    }

    // Which side of the door are we entering from? Traversal is
    // bidirectional once the gate is satisfied (cross-room clue runs).
    const targetRoom = s.currentRoomId === door.from ? door.to : door.from;
    const spec = s.spec;
    set({ transition: { active: true, label: door.transitionCopy } });
    setTimeout(() => {
      const st = get();
      const { point, yaw } = spawnFor(spec, targetRoom, door.doorway);
      const firstVisit = !st.visitedRooms.includes(targetRoom);
      set({
        currentRoomId: targetRoom,
        visitedRooms: firstVisit
          ? [...st.visitedRooms, targetRoom]
          : st.visitedRooms,
        spawnPoint: point,
        spawnYaw: yaw,
        spawnSignal: st.spawnSignal + 1,
        aim: null,
      });
      if (firstVisit) {
        const room = spec.rooms.find((r) => r.id === targetRoom);
        if (room) get().gmSay(room.flavor);
      }
      setTimeout(
        () => set({ transition: { active: false, label: '' } }),
        650
      );
    }, 750);
  },

  requestHint: () => {
    const s = get();
    if (!s.spec) return;
    // Target: the focused anchor, else the aimed anchor, else the first
    // incomplete anchor in the current room, else any incomplete anchor.
    const incomplete = s.spec.requiredAnchors.filter(
      (a) => !s.completedAnchors.includes(a)
    );
    const inRoom = incomplete.filter(
      (a) => s.spec!.anchors[a].roomId === s.currentRoomId
    );
    const target =
      s.focusedAnchorId ??
      (s.aim?.kind === 'anchor' && incomplete.includes(s.aim.id)
        ? s.aim.id
        : null) ??
      inRoom[0] ??
      incomplete[0];
    if (!target) {
      get().gmSay(registerLine(s, 'nothingLeft'));
      return;
    }
    const anchor = s.spec.anchors[target];
    const used = s.hintsUsed[target] ?? 0;

    // Quantity cap from the resolved spec (Guided = unlimited).
    if (used >= s.spec.hintCapPerAnchor) {
      get().gmSay(registerLine(s, 'hintBudget', anchor.name));
      return;
    }

    // Tier escalation: start at the spec's tier, walk clearer per request.
    const ladder: HintTier[] =
      s.spec.hintStartTier === 'clear'
        ? ['clear']
        : s.spec.hintStartTier === 'moderate'
          ? ['moderate', 'clear']
          : ['subtle', 'moderate', 'clear'];
    const tier = ladder[Math.min(used, ladder.length - 1)];
    const list = anchor.hints[tier];
    const hint = list[Math.min(used, list.length - 1)] ?? list[list.length - 1];
    set({ hintsUsed: { ...s.hintsUsed, [target]: used + 1 } });
    get().gmSay(`Hint — ${hint}`);
  },

  gmSay: (text, from = 'gm') =>
    set((s) => ({
      gmMessages: [...s.gmMessages.slice(-13), { id: ++msgId, from, text }],
    })),

  toggleEffect: (key) =>
    set((s) => {
      const next = !s.effects[key];
      return {
        effects: { ...s.effects, [key]: next },
        shakeSignal:
          key === 'vibration' && next ? s.shakeSignal + 1 : s.shakeSignal,
      };
    }),

  setEffect: (key, on) =>
    set((s) => ({ effects: { ...s.effects, [key]: on } })),

  pulseEffects: (keys) => {
    keys.forEach((k) => get().setEffect(k, true));
    if (keys.includes('vibration'))
      set((s) => ({ shakeSignal: s.shakeSignal + 1 }));
  },

  setInvestorView: (open) => set({ investorViewOpen: open }),
  setRegenerator: (open) => set({ regeneratorOpen: open }),
  setGmOpen: (open) => set({ gmOpen: open }),
  setEffectsOpen: (open) => set({ effectsOpen: open }),

  regenerateTheme: (themeId) => {
    const s = get();
    const theme = getTheme(themeId);
    const profile = { ...s.profile, theme: theme.name };
    const spec = resolveSessionSpec(theme, profile);
    set({ regenerating: true, regeneratorOpen: false });
    setTimeout(() => {
      const st = get();
      const { point, yaw } = spawnFor(spec, spec.startRoomId, 'ENTRY-A');
      set({
        themeId,
        profile,
        spec,
        regenerating: false,
        completedAnchors: [],
        hintsUsed: {},
        sessionComplete: false,
        focusedAnchorId: null,
        currentRoomId: spec.startRoomId,
        visitedRooms: [spec.startRoomId],
        spawnPoint: point,
        spawnYaw: yaw,
        spawnSignal: st.spawnSignal + 1,
        layer: 'mixed',
        aim: null,
        lastProgressAt: Date.now(),
      });
      get().gmSay(
        `Facility regenerated: ${theme.name}. Same chambers, same hardware — new story, new puzzle graph, new reality.`,
        'system'
      );
      get().gmSay(theme.gmIntro);
    }, 1600);
  },

  triggerShake: () => set((s) => ({ shakeSignal: s.shakeSignal + 1 })),
  markProgress: () => set({ lastProgressAt: Date.now() }),

  resetDemo: () => set({ ...initialState, gmMessages: [] }),
}));

// debug bridge for automated end-to-end tests (?debug)
if (
  typeof window !== 'undefined' &&
  window.location.search.includes('debug')
) {
  (window as unknown as Record<string, unknown>).__game = useGame;
}

// ---------------------------------------------------------------------------
// GM copy register — generic system lines adapt to the resolved register.
// Theme-authored copy (clues, solved lines) is used verbatim.
// ---------------------------------------------------------------------------

type LineKey = 'alreadySolved' | 'allSolved' | 'nothingLeft' | 'hintBudget';

function registerLine(
  s: { spec: SessionSpec | null },
  key: LineKey,
  subject?: string
): string {
  const reg = s.spec?.copyRegister ?? 'standard';
  const lines: Record<LineKey, Record<string, string>> = {
    alreadySolved: {
      standard: 'That mechanism is already satisfied. Seek the next.',
      dark: 'That one is already done. What remains is worse.',
      professional: 'That workstream is complete. Move to the next item.',
      family: 'You already solved that one — nice work! On to the next.',
    },
    allSolved: {
      standard:
        'Every mechanism is satisfied. The exit is listening — go to it.',
      dark: 'It is done. The way out will open… if you hurry.',
      professional:
        'All deliverables complete. The exit is unlocked — proceed to debrief.',
      family: 'Amazing — you solved everything! Head to the exit door!',
    },
    nothingLeft: {
      standard: 'Nothing remains unsolved. The exit awaits.',
      dark: 'There is nothing left to solve. Leave. Now.',
      professional: 'No open items. Proceed to the exit.',
      family: 'All done! Time to head for the exit.',
    },
    hintBudget: {
      standard: `The ${subject ?? 'mechanism'} will yield no more guidance — your hint allowance there is spent.`,
      dark: `I have said all I will say about the ${subject ?? 'mechanism'}.`,
      professional: `Hint budget for ${subject ?? 'this item'} is exhausted per your difficulty profile.`,
      family: `That's all the hints for the ${subject ?? 'puzzle'} — you're close, keep trying!`,
    },
  };
  return lines[key][reg] ?? lines[key].standard;
}
