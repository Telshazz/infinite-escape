'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { getTheme } from '@/lib/data';
import type { LayerName } from '@/lib/types';
import GameMasterPanel from './GameMasterPanel';
import PuzzleModal from './PuzzleModal';
import EffectsRail from './EffectsRail';
import InvestorDashboard from './InvestorDashboard';
import ThemeRegenerator from './ThemeRegenerator';
import { sfx } from '@/lib/audio';

// R3F must not be server-rendered
const RoomScene = dynamic(() => import('./scene/RoomScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-hud text-xs tracking-[0.25em] uppercase text-teal/60">
      Initializing mixed reality layer…
    </div>
  ),
});

const LAYERS: { id: LayerName; label: string; sub: string }[] = [
  { id: 'physical', label: 'Physical', sub: 'The real room' },
  { id: 'mixed', label: 'Mixed Reality', sub: 'What players see' },
  { id: 'mapping', label: 'Mapping', sub: 'Digital twin links' },
];

function RealitySwitch() {
  const layer = useGame((s) => s.layer);
  const setLayer = useGame((s) => s.setLayer);
  const [sweep, setSweep] = useState(0);

  return (
    <div className="relative">
      <div className="holo flex overflow-hidden">
        {LAYERS.map((l) => {
          const active = layer === l.id;
          return (
            <button
              key={l.id}
              onClick={() => {
                if (active) return;
                sfx.open();
                setLayer(l.id);
                setSweep((n) => n + 1);
              }}
              className={`relative px-4 py-2.5 text-left transition-colors md:px-5 ${
                active ? 'bg-teal/15' : 'hover:bg-teal/5'
              }`}
            >
              <div
                className={`font-hud text-[0.7rem] tracking-[0.18em] uppercase ${
                  active ? 'text-teal-glow' : 'text-mist/50'
                }`}
              >
                {l.label}
              </div>
              <div className="hidden font-hud text-[0.55rem] tracking-[0.1em] text-mist/35 md:block">
                {l.sub}
              </div>
              {active && (
                <motion.div
                  layoutId="layer-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal to-gold"
                />
              )}
            </button>
          );
        })}
      </div>
      {sweep > 0 && <div key={sweep} className="scan-sweep" />}
    </div>
  );
}

function SessionTimer() {
  const startedAt = useGame((s) => s.sessionStartedAt);
  const minutes = useGame((s) => s.profile.sessionLength);
  const complete = useGame((s) => s.sessionComplete);
  const [, tick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!startedAt) return null;
  const remaining = Math.max(
    0,
    minutes * 60 - Math.floor((Date.now() - startedAt) / 1000)
  );
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div
      className={`font-hud text-sm tracking-[0.2em] ${complete ? 'text-gold' : 'text-teal-glow'}`}
    >
      {complete ? 'ESCAPED' : `${mm}:${ss}`}
    </div>
  );
}

export default function RoomExperience() {
  const {
    themeId,
    setInvestorView,
    setRegenerator,
    sessionComplete,
    regenerating,
    resetDemo,
    shakeSignal,
  } = useGame();
  const theme = getTheme(themeId);
  const [shaking, setShaking] = useState(false);

  // Screen pulse mirroring the in-scene camera shake (no remount)
  useEffect(() => {
    if (shakeSignal > 0) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(t);
    }
  }, [shakeSignal]);

  return (
    <div
      className={`relative flex h-screen flex-col overflow-hidden ${shaking ? 'shaking' : ''}`}
    >
      {/* Top HUD bar */}
      <header className="relative z-20 flex items-center justify-between gap-3 border-b border-teal/15 bg-abyss/70 px-4 py-2.5 backdrop-blur md:px-6">
        <div className="flex items-baseline gap-3">
          <button
            onClick={resetDemo}
            className="font-display text-base font-semibold tracking-[0.1em] text-bone hover:text-teal-glow"
            title="Back to start"
          >
            INFINITE <span className="text-teal">ESCAPE</span>
            <sup className="text-[0.5rem] text-mist/40">™</sup>
          </button>
          <span className="hidden font-hud text-[0.62rem] tracking-[0.18em] uppercase text-gold/80 md:inline">
            {theme.name}
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          <SessionTimer />
          <button
            onClick={() => setRegenerator(true)}
            className="border border-teal/30 px-3 py-1.5 font-hud text-[0.65rem] tracking-[0.16em] uppercase text-teal hover:bg-teal/10"
          >
            Regenerate Room
          </button>
          <button
            onClick={() => setInvestorView(true)}
            className="border border-gold/40 px-3 py-1.5 font-hud text-[0.65rem] tracking-[0.16em] uppercase text-gold hover:bg-gold/10"
          >
            Investor View
          </button>
        </div>
      </header>

      {/* Main area: scene + GM panel */}
      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <RoomScene />

          {/* Room spec tag */}
          <div className="pointer-events-none absolute left-4 top-4 z-10 font-hud text-[0.6rem] tracking-[0.2em] uppercase text-mist/45">
            Room 01 · 20 ft × 20 ft · 9 mapped prop classes
          </div>

          {/* Reality switch (signature element) */}
          <div className="absolute bottom-4 left-4 z-10">
            <RealitySwitch />
          </div>

          {/* Effects rail */}
          <div className="absolute bottom-4 right-4 z-10">
            <EffectsRail />
          </div>

          {/* Orbit hint */}
          <div className="pointer-events-none absolute right-4 top-4 z-10 font-hud text-[0.58rem] tracking-[0.15em] uppercase text-mist/35">
            Drag to orbit · Scroll to zoom · Click glowing objects
          </div>

          {/* Regeneration sweep */}
          <AnimatePresence>
            {regenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-abyss/60 backdrop-blur-sm"
              >
                <div className="scan-sweep" />
                <div className="text-center">
                  <div className="eyebrow animate-pulse">
                    AI Game Master
                  </div>
                  <div className="mt-2 font-display text-2xl text-bone">
                    Regenerating reality…
                  </div>
                  <div className="mt-1 font-hud text-[0.62rem] tracking-[0.18em] uppercase text-mist/50">
                    Same room · new story · new puzzles · new effects map
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session complete banner */}
          <AnimatePresence>
            {sessionComplete && !regenerating && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                className="absolute bottom-24 left-1/2 z-20 w-[min(560px,90%)] -translate-x-1/2"
              >
                <div className="holo holo-gold bracket p-5 text-center">
                  <div className="eyebrow eyebrow-gold">Session Complete</div>
                  <p className="mt-2 text-sm font-light leading-relaxed text-mist/90">
                    This room can now instantly regenerate into a different
                    story, puzzle path, and difficulty profile —{' '}
                    <span className="text-gold">
                      without physical reconstruction
                    </span>
                    .
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setRegenerator(true)}
                      className="bracket bg-gradient-to-r from-teal to-teal-glow px-6 py-2.5 font-hud text-[0.7rem] tracking-[0.2em] uppercase text-abyss"
                    >
                      Regenerate Same Room
                    </button>
                    <button
                      onClick={() => setInvestorView(true)}
                      className="border border-gold/40 px-6 py-2.5 font-hud text-[0.7rem] tracking-[0.2em] uppercase text-gold hover:bg-gold/10"
                    >
                      See the Business Case
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <PuzzleModal />
        </div>

        {/* Right GM panel */}
        <div className="hidden w-[300px] shrink-0 p-3 lg:block xl:w-[330px]">
          <GameMasterPanel />
        </div>
      </div>

      <InvestorDashboard />
      <ThemeRegenerator />
    </div>
  );
}
