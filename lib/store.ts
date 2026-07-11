'use client';

import { create } from 'zustand';
import type {
  EffectKey,
  GameState,
  GMMessage,
  LayerName,
  PlayerProfile,
  PuzzleId,
  ViewName,
} from './types';
import { getTheme, HINTS } from './data';

let msgId = 0;

interface Actions {
  setView: (v: ViewName) => void;
  setLayer: (l: LayerName) => void;
  setProfile: (p: Partial<PlayerProfile>) => void;
  startGeneration: () => void;
  enterRoom: () => void;
  openPuzzle: (id: PuzzleId) => void;
  closePuzzle: () => void;
  completePuzzle: (id: PuzzleId) => void;
  requestHint: () => void;
  gmSay: (text: string, from?: GMMessage['from']) => void;
  toggleEffect: (key: EffectKey) => void;
  setEffect: (key: EffectKey, on: boolean) => void;
  setInvestorView: (open: boolean) => void;
  setRegenerator: (open: boolean) => void;
  regenerateTheme: (themeId: string) => void;
  triggerShake: () => void;
  inspectCrate: (name: string) => void;
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
  completedPuzzles: [],
  activePuzzle: null,
  hintsUsed: { altar: 0, archive: 0, portal: 0 },
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
  sessionStartedAt: null,
  shakeSignal: 0,
  sessionComplete: false,
};

export const useGame = create<GameState & Actions>((set, get) => ({
  ...initialState,

  setView: (view) => set({ view }),
  setLayer: (layer) => set({ layer }),
  setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

  startGeneration: () => set({ view: 'generating' }),

  enterRoom: () => {
    const theme = getTheme(get().themeId);
    set({
      view: 'room',
      layer: 'mixed',
      sessionStartedAt: Date.now(),
      gmMessages: [],
    });
    get().gmSay(theme.gmIntro);
  },

  openPuzzle: (id) => {
    const s = get();
    if (id === 'portal') {
      const ready =
        s.completedPuzzles.includes('altar') &&
        s.completedPuzzles.includes('archive');
      if (!ready) {
        const missing = ['altar', 'archive']
          .filter((p) => !s.completedPuzzles.includes(p as PuzzleId))
          .map((p) => (p === 'altar' ? 'the Altar' : 'the Archive'));
        get().gmSay(
          `The gate does not answer. ${missing.join(' and ')} must be restored first.`
        );
        return;
      }
    }
    if (s.completedPuzzles.includes(id)) {
      get().gmSay('That seal already burns bright. Seek the next.');
      return;
    }
    set({ activePuzzle: id });
  },

  closePuzzle: () => set({ activePuzzle: null }),

  completePuzzle: (id) => {
    const s = get();
    if (s.completedPuzzles.includes(id)) return;
    const completed = [...s.completedPuzzles, id];
    set({
      completedPuzzles: completed,
      activePuzzle: null,
      shakeSignal: s.shakeSignal + 1,
    });
    if (id === 'altar') {
      get().setEffect('lighting', true);
      get().setEffect('audio', true);
      get().gmSay(
        'The first seal ignites. Water hums through the energy channels. Two remain.'
      );
    } else if (id === 'archive') {
      get().setEffect('mist', true);
      get().gmSay(
        'The archive yields its relic. The second seal is restored — the gate is listening now.'
      );
    } else if (id === 'portal') {
      get().setEffect('wind', true);
      get().setEffect('lighting', true);
      set({ sessionComplete: true });
      get().gmSay(
        'Session Complete. This room can now instantly regenerate into a different story, puzzle path, and difficulty profile — without physical reconstruction.',
        'system'
      );
    }
  },

  requestHint: () => {
    const s = get();
    // Hint targets the active puzzle, or the next incomplete step.
    const order: PuzzleId[] = ['altar', 'archive', 'portal'];
    const target: PuzzleId =
      s.activePuzzle ??
      order.find((p) => !s.completedPuzzles.includes(p)) ??
      'portal';

    const d = s.profile.difficulty;
    const used = s.hintsUsed[target];
    const bank = HINTS[target];
    // Higher difficulty starts subtle; repeated requests escalate to clearer.
    let tier: 'clear' | 'moderate' | 'subtle';
    if (d <= 4) tier = 'clear';
    else if (d <= 7) tier = used === 0 ? 'moderate' : 'clear';
    else tier = used === 0 ? 'subtle' : used === 1 ? 'moderate' : 'clear';

    const list = bank[tier];
    const hint = list[Math.min(used, list.length - 1)];
    set({ hintsUsed: { ...s.hintsUsed, [target]: used + 1 } });
    get().gmSay(`Hint — ${hint}`);
  },

  gmSay: (text, from = 'gm') =>
    set((s) => ({
      gmMessages: [...s.gmMessages.slice(-11), { id: ++msgId, from, text }],
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

  setInvestorView: (open) => set({ investorViewOpen: open }),
  setRegenerator: (open) => set({ regeneratorOpen: open }),

  regenerateTheme: (themeId) => {
    const theme = getTheme(themeId);
    set({ regenerating: true, regeneratorOpen: false });
    setTimeout(() => {
      set({
        themeId,
        regenerating: false,
        completedPuzzles: [],
        sessionComplete: false,
        hintsUsed: { altar: 0, archive: 0, portal: 0 },
        layer: 'mixed',
        profile: { ...useGame.getState().profile, theme: theme.name },
      });
      useGame
        .getState()
        .gmSay(
          `Room regenerated: ${theme.name}. Same 20×20 physical space — new story, new puzzles, new reality.`,
          'system'
        );
      useGame.getState().gmSay(theme.gmIntro);
    }, 1600);
  },

  triggerShake: () => set((s) => ({ shakeSignal: s.shakeSignal + 1 })),

  inspectCrate: (name) => {
    const flavor = [
      `${name} holds ceremonial offerings — sealed, but the AI Game Master notes your curiosity.`,
      `${name} is empty except for a carving of a nautilus. It might matter.`,
      `${name} rattles faintly. Whatever is inside stopped moving long ago.`,
    ];
    get().gmSay(flavor[Math.floor(Math.random() * flavor.length)]);
  },

  resetDemo: () =>
    set({
      ...initialState,
      gmMessages: [],
    }),
}));
