'use client';

// ---------------------------------------------------------------------------
// Game HUD — everything lives as toggleable overlays on the full-viewport
// scene: reticle + prompt, objective ticker, timer, GM drawer, effects
// drawer, reality switch, pause overlay, transition overlay, complete banner.
// Keybinds while locked:  E interact · H hint · V reality layer · G GM drawer
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { getTheme } from '@/lib/themes';
import { EFFECTS } from '@/lib/facility';
import type { LayerName } from '@/lib/types';
import GameMasterPanel from '../GameMasterPanel';
import EffectsRail from '../EffectsRail';
import { sfx } from '@/lib/audio';

// ---------------------------------------------------------------------------
// Reticle + interaction prompt
// ---------------------------------------------------------------------------
function Reticle() {
  const aim = useGame((s) => s.aim);
  const focused = useGame((s) => s.focusedAnchorId);
  const paused = useGame((s) => s.paused);
  const transition = useGame((s) => s.transition.active);
  if (focused || paused || transition) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div
          className={`rounded-full border transition-all duration-150 ${
            aim
              ? aim.locked
                ? 'h-3.5 w-3.5 border-red-400/80 bg-red-400/20'
                : 'h-3.5 w-3.5 border-teal bg-teal/25 shadow-holo'
              : 'h-2 w-2 border-mist/50 bg-mist/10'
          }`}
        />
        {aim && (
          <div
            className={`mt-3 whitespace-nowrap border px-3 py-1.5 font-hud text-[0.68rem] uppercase tracking-[0.14em] backdrop-blur ${
              aim.locked
                ? 'border-red-400/40 bg-abyss/80 text-red-300'
                : 'border-teal/40 bg-abyss/80 text-teal-glow'
            }`}
          >
            {aim.locked ? aim.prompt : `[E] ${aim.prompt}`}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Objective ticker + progress
// ---------------------------------------------------------------------------
function ObjectiveTicker() {
  const spec = useGame((s) => s.spec);
  const currentRoomId = useGame((s) => s.currentRoomId);
  const completed = useGame((s) => s.completedAnchors);
  const sessionComplete = useGame((s) => s.sessionComplete);
  if (!spec) return null;
  const room = spec.rooms.find((r) => r.id === currentRoomId);
  const done = spec.requiredAnchors.filter((a) => completed.includes(a)).length;
  const next = spec.requiredAnchors.find(
    (a) => !completed.includes(a) && spec.anchors[a].roomId === currentRoomId
  );
  const anywhere = spec.requiredAnchors.find((a) => !completed.includes(a));

  return (
    <div className="pointer-events-none absolute left-4 top-14 z-20 max-w-[280px]">
      <div className="font-hud text-[0.6rem] uppercase tracking-[0.2em] text-mist/50">
        {room?.name}
      </div>
      <div className="mt-0.5 font-hud text-[0.68rem] uppercase tracking-[0.12em] text-gold/90">
        {sessionComplete
          ? 'Escaped — session complete'
          : next
            ? spec.anchors[next].objective
            : anywhere
              ? `Nothing left here — ${spec.anchors[anywhere].name} awaits elsewhere`
              : 'All mechanisms satisfied — find the exit'}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        {spec.requiredAnchors.map((a) => (
          <span
            key={a}
            className={`h-1.5 w-4 ${
              completed.includes(a)
                ? 'bg-teal shadow-[0_0_6px_rgba(53,224,206,0.8)]'
                : 'bg-mist/20'
            }`}
          />
        ))}
        <span className="ml-1 font-hud text-[0.6rem] text-mist/50">
          {done}/{spec.totalPuzzles}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session timer — countdown under pressure, count-up for Family Friendly
// ---------------------------------------------------------------------------
function SessionTimer() {
  const startedAt = useGame((s) => s.sessionStartedAt);
  const minutes = useGame((s) => s.profile.sessionLength);
  const pressure = useGame((s) => s.spec?.timerPressure ?? true);
  const complete = useGame((s) => s.sessionComplete);
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  if (!startedAt) return null;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const val = pressure ? Math.max(0, minutes * 60 - elapsed) : elapsed;
  const mm = String(Math.floor(val / 60)).padStart(2, '0');
  const ss = String(val % 60).padStart(2, '0');
  return (
    <div
      className={`font-hud text-sm tracking-[0.2em] ${
        complete
          ? 'text-gold'
          : pressure && val < 300
            ? 'text-red-300'
            : 'text-teal-glow'
      }`}
    >
      {complete ? 'ESCAPED' : `${mm}:${ss}`}
      {!pressure && !complete && (
        <span className="ml-1.5 text-[0.55rem] text-mist/40">ELAPSED</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact reality switch (bottom-left corner)
// ---------------------------------------------------------------------------
const LAYERS: { id: LayerName; label: string }[] = [
  { id: 'physical', label: 'Physical' },
  { id: 'mixed', label: 'Mixed Reality' },
  { id: 'mapping', label: 'Mapping' },
];

function RealitySwitch() {
  const layer = useGame((s) => s.layer);
  const setLayer = useGame((s) => s.setLayer);
  return (
    <div className="holo pointer-events-auto flex overflow-hidden">
      {LAYERS.map((l) => (
        <button
          key={l.id}
          onClick={() => {
            sfx.open();
            setLayer(l.id);
          }}
          className={`px-3 py-2 font-hud text-[0.6rem] uppercase tracking-[0.16em] transition-colors ${
            layer === l.id
              ? 'bg-teal/15 text-teal-glow'
              : 'text-mist/45 hover:bg-teal/5 hover:text-mist/80'
          }`}
        >
          {l.label}
        </button>
      ))}
      <span className="self-center px-2 font-hud text-[0.5rem] uppercase text-mist/30">
        V
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GM proactive idle nudger (Guided difficulty only, per resolved spec)
// ---------------------------------------------------------------------------
function IdleNudger() {
  useEffect(() => {
    const t = setInterval(() => {
      const s = useGame.getState();
      if (
        !s.spec?.gmProactive ||
        s.view !== 'room' ||
        s.paused ||
        s.focusedAnchorId ||
        s.sessionComplete
      )
        return;
      const idleFor = (Date.now() - s.lastProgressAt) / 1000;
      if (idleFor < (s.spec.gmIdleNudgeSec ?? 50)) return;
      const next = s.spec.requiredAnchors.find(
        (a) =>
          !s.completedAnchors.includes(a) &&
          s.spec!.anchors[a].roomId === s.currentRoomId
      );
      const target = next ?? s.spec.requiredAnchors.find((a) => !s.completedAnchors.includes(a));
      if (!target) return;
      const anchor = s.spec.anchors[target];
      s.gmSay(
        `You seem stuck — try the ${anchor.name}. ${anchor.hints.clear[0]}`
      );
      s.markProgress(); // reset the idle clock
    }, 5000);
    return () => clearInterval(t);
  }, []);
  return null;
}

// ---------------------------------------------------------------------------
// Global keybinds (H hint, V layer, G GM drawer)
// ---------------------------------------------------------------------------
function Keybinds() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useGame.getState();
      if (s.view !== 'room' || s.focusedAnchorId) return;
      if (e.code === 'KeyH') {
        sfx.click();
        s.requestHint();
      } else if (e.code === 'KeyV') {
        const order: LayerName[] = ['physical', 'mixed', 'mapping'];
        const next = order[(order.indexOf(s.layer) + 1) % order.length];
        sfx.open();
        s.setLayer(next);
      } else if (e.code === 'KeyG') {
        s.setGmOpen(!s.gmOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}

// ---------------------------------------------------------------------------
// Pause overlay (pointer unlocked, nothing focused)
// ---------------------------------------------------------------------------
function PauseOverlay() {
  const paused = useGame((s) => s.paused);
  const transition = useGame((s) => s.transition.active);
  const focused = useGame((s) => s.focusedAnchorId);
  const investorOpen = useGame((s) => s.investorViewOpen);
  const regenOpen = useGame((s) => s.regeneratorOpen);
  const regenerating = useGame((s) => s.regenerating);
  const setInvestorView = useGame((s) => s.setInvestorView);
  const setRegenerator = useGame((s) => s.setRegenerator);
  const resetDemo = useGame((s) => s.resetDemo);
  const profile = useGame((s) => s.profile);
  const spec = useGame((s) => s.spec);

  const show =
    paused && !transition && !focused && !investorOpen && !regenOpen && !regenerating;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-abyss/70 backdrop-blur-sm"
        >
          <div className="holo bracket w-[min(520px,92vw)] p-7 text-center">
            <span className="eyebrow">Paused — pointer released</span>
            <h3 className="mt-2 font-display text-2xl font-semibold text-bone">
              Click Resume to keep exploring
            </h3>
            <div className="mx-auto mt-4 grid max-w-sm grid-cols-2 gap-x-6 gap-y-1 text-left font-hud text-[0.65rem] uppercase tracking-[0.12em] text-mist/60">
              <span>Move</span><span className="text-mist/90">W A S D</span>
              <span>Sprint / Crouch</span><span className="text-mist/90">Shift / C</span>
              <span>Interact</span><span className="text-mist/90">E or Click</span>
              <span>Hint</span><span className="text-mist/90">H</span>
              <span>Reality layer</span><span className="text-mist/90">V</span>
              <span>GM drawer</span><span className="text-mist/90">G</span>
            </div>
            <div className="mt-5 font-hud text-[0.6rem] uppercase tracking-[0.14em] text-mist/40">
              {profile.playerCount} players · D{profile.difficulty} ·{' '}
              {profile.mode} · {spec?.totalPuzzles} puzzles ·{' '}
              {spec?.rooms.length} chambers
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  // resume re-locks via the canvas click handler
                  const canvas = document.querySelector('canvas');
                  (canvas as HTMLCanvasElement | null)?.click();
                }}
                className="bracket bg-gradient-to-r from-teal to-teal-glow px-7 py-2.5 font-hud text-xs uppercase tracking-[0.2em] text-abyss"
              >
                Resume
              </button>
              <button
                onClick={() => setRegenerator(true)}
                className="border border-teal/30 px-5 py-2.5 font-hud text-[0.65rem] uppercase tracking-[0.16em] text-teal hover:bg-teal/10"
              >
                Regenerate Room
              </button>
              <button
                onClick={() => setInvestorView(true)}
                className="border border-gold/40 px-5 py-2.5 font-hud text-[0.65rem] uppercase tracking-[0.16em] text-gold hover:bg-gold/10"
              >
                Investor View
              </button>
              <button
                onClick={resetDemo}
                className="border border-mist/20 px-5 py-2.5 font-hud text-[0.65rem] uppercase tracking-[0.16em] text-mist/50 hover:bg-mist/5"
              >
                Exit Demo
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Door transition overlay — "reality reconfigures", not a loading screen
// ---------------------------------------------------------------------------
function TransitionOverlay() {
  const transition = useGame((s) => s.transition);
  return (
    <AnimatePresence>
      {transition.active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-abyss"
        >
          <div className="scan-sweep" />
          <div className="text-center">
            <div className="eyebrow animate-pulse">Reality reconfigures</div>
            <div className="mt-2 max-w-md px-6 font-display text-xl text-bone">
              {transition.label}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Session complete banner
// ---------------------------------------------------------------------------
function CompleteBanner() {
  const sessionComplete = useGame((s) => s.sessionComplete);
  const transition = useGame((s) => s.transition.active);
  const regenerating = useGame((s) => s.regenerating);
  const setRegenerator = useGame((s) => s.setRegenerator);
  const setInvestorView = useGame((s) => s.setInvestorView);
  return (
    <AnimatePresence>
      {sessionComplete && !transition && !regenerating && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="absolute bottom-20 left-1/2 z-30 w-[min(560px,90%)] -translate-x-1/2"
        >
          <div className="holo holo-gold bracket pointer-events-auto p-5 text-center">
            <div className="eyebrow eyebrow-gold">Session Complete — Escaped</div>
            <p className="mt-2 text-sm font-light leading-relaxed text-mist/90">
              This facility can now instantly regenerate into a different
              story, puzzle graph, and difficulty profile —{' '}
              <span className="text-gold">without physical reconstruction</span>.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setRegenerator(true)}
                className="bracket bg-gradient-to-r from-teal to-teal-glow px-6 py-2.5 font-hud text-[0.7rem] uppercase tracking-[0.2em] text-abyss"
              >
                Regenerate the Facility
              </button>
              <button
                onClick={() => setInvestorView(true)}
                className="border border-gold/40 px-6 py-2.5 font-hud text-[0.7rem] uppercase tracking-[0.2em] text-gold hover:bg-gold/10"
              >
                See the Business Case
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Regeneration sweep
// ---------------------------------------------------------------------------
function RegenOverlay() {
  const regenerating = useGame((s) => s.regenerating);
  return (
    <AnimatePresence>
      {regenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-abyss/70 backdrop-blur-sm"
        >
          <div className="scan-sweep" />
          <div className="text-center">
            <div className="eyebrow animate-pulse">AI Game Master</div>
            <div className="mt-2 font-display text-2xl text-bone">
              Regenerating reality…
            </div>
            <div className="mt-1 font-hud text-[0.62rem] uppercase tracking-[0.18em] text-mist/50">
              Same chambers · new story · new puzzle graph · new effects map
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------

export default function Hud() {
  const themeId = useGame((s) => s.themeId);
  const gmOpen = useGame((s) => s.gmOpen);
  const setGmOpen = useGame((s) => s.setGmOpen);
  const effectsOpen = useGame((s) => s.effectsOpen);
  const setEffectsOpen = useGame((s) => s.setEffectsOpen);
  const resetDemo = useGame((s) => s.resetDemo);
  const effects = useGame((s) => s.effects);
  const theme = getTheme(themeId);
  const liveEffects = EFFECTS.filter((e) => effects[e.key]).length;

  return (
    <>
      <IdleNudger />
      <Keybinds />

      {/* top bar */}
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-2.5">
        <div className="flex items-baseline gap-3">
          <button
            onClick={resetDemo}
            className="pointer-events-auto font-display text-base font-semibold tracking-[0.1em] text-bone hover:text-teal-glow"
            title="Back to start"
          >
            INFINITE <span className="text-teal">ESCAPE</span>
            <sup className="text-[0.5rem] text-mist/40">™</sup>
          </button>
          <span className="hidden font-hud text-[0.62rem] uppercase tracking-[0.18em] text-gold/80 md:inline">
            {theme.name}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <SessionTimer />
          <button
            onClick={() => setEffectsOpen(!effectsOpen)}
            className={`pointer-events-auto border px-2.5 py-1.5 font-hud text-[0.6rem] uppercase tracking-[0.14em] ${
              effectsOpen
                ? 'border-teal bg-teal/10 text-teal-glow'
                : 'border-teal/25 text-mist/60 hover:text-teal'
            }`}
          >
            FX {liveEffects}/6
          </button>
          <button
            onClick={() => setGmOpen(!gmOpen)}
            className={`pointer-events-auto border px-2.5 py-1.5 font-hud text-[0.6rem] uppercase tracking-[0.14em] ${
              gmOpen
                ? 'border-teal bg-teal/10 text-teal-glow'
                : 'border-teal/25 text-mist/60 hover:text-teal'
            }`}
          >
            GM [G]
          </button>
        </div>
      </header>

      <Reticle />
      <ObjectiveTicker />

      {/* reality switch */}
      <div className="absolute bottom-4 left-4 z-20">
        <RealitySwitch />
      </div>

      {/* effects drawer */}
      <AnimatePresence>
        {effectsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-auto absolute bottom-4 right-4 z-20"
          >
            <EffectsRail />
          </motion.div>
        )}
      </AnimatePresence>

      {/* GM drawer */}
      <AnimatePresence>
        {gmOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="pointer-events-auto absolute bottom-16 right-4 top-14 z-20 w-[300px] xl:w-[330px]"
          >
            <GameMasterPanel />
          </motion.div>
        )}
      </AnimatePresence>

      <CompleteBanner />
      <PauseOverlay />
      <RegenOverlay />
      <TransitionOverlay />
    </>
  );
}
