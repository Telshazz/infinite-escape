'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { getTheme, PUZZLES_BASE } from '@/lib/data';
import type { PuzzleId } from '@/lib/types';
import { sfx } from '@/lib/audio';

const STEP_LABELS: Record<PuzzleId, string> = {
  altar: 'Seal I — The Altar',
  archive: 'Seal II — The Archive',
  portal: 'Seal III — The Gate',
};

export default function GameMasterPanel() {
  const {
    profile,
    completedPuzzles,
    gmMessages,
    requestHint,
    sessionComplete,
    themeId,
  } = useGame();
  const theme = getTheme(themeId);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [gmMessages]);

  const order: PuzzleId[] = ['altar', 'archive', 'portal'];
  const next = order.find((p) => !completedPuzzles.includes(p));
  const objective = sessionComplete
    ? 'Session complete — regenerate the room'
    : next
      ? PUZZLES_BASE.find((p) => p.id === next)?.objective ?? ''
      : '';

  return (
    <aside className="holo bracket flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-teal/15 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
          </span>
          <span className="eyebrow">AI Game Master</span>
        </div>
        <div className="mt-1 font-display text-sm text-bone">
          {theme.name}
        </div>
      </div>

      {/* Objective + status */}
      <div className="border-b border-teal/15 px-4 py-3">
        <div className="font-hud text-[0.6rem] tracking-[0.2em] uppercase text-gold/80">
          Current Objective
        </div>
        <p className="mt-1 text-[0.8rem] font-light leading-snug text-mist/90">
          {objective}
        </p>
        <div className="mt-2 flex items-center justify-between font-hud text-[0.62rem] uppercase tracking-[0.12em]">
          <span className="text-mist/50">Room status</span>
          <span className={sessionComplete ? 'text-gold' : 'text-teal-glow'}>
            {sessionComplete ? 'Escaped' : 'Live · Adaptive'}
          </span>
        </div>
      </div>

      {/* Group profile */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-b border-teal/15 px-4 py-3 font-hud text-[0.62rem] uppercase tracking-[0.1em]">
        <span className="text-mist/45">Players</span>
        <span className="text-right text-mist/85">{profile.playerCount}</span>
        <span className="text-mist/45">Difficulty</span>
        <span className="text-right text-teal-glow">
          {profile.difficulty} / 10
        </span>
        <span className="text-mist/45">Mode</span>
        <span className="text-right text-mist/85">{profile.mode}</span>
        <span className="text-mist/45">Fear</span>
        <span className="text-right text-mist/85">{profile.fearLevel}</span>
        <span className="text-mist/45">Session</span>
        <span className="text-right text-mist/85">
          {profile.sessionLength} min
        </span>
      </div>

      {/* Progress tracker */}
      <div className="border-b border-teal/15 px-4 py-3">
        <div className="font-hud text-[0.6rem] tracking-[0.2em] uppercase text-mist/50">
          Energy Seals
        </div>
        <div className="mt-2 space-y-1.5">
          {order.map((id) => {
            const done = completedPuzzles.includes(id);
            const active = id === next && !sessionComplete;
            return (
              <div key={id} className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rotate-45 border ${
                    done
                      ? 'border-teal bg-teal shadow-[0_0_8px_rgba(53,224,206,0.8)]'
                      : active
                        ? 'animate-pulse border-gold'
                        : 'border-mist/25'
                  }`}
                />
                <span
                  className={`font-hud text-[0.68rem] tracking-[0.1em] ${
                    done
                      ? 'text-teal-glow'
                      : active
                        ? 'text-gold'
                        : 'text-mist/40'
                  }`}
                >
                  {STEP_LABELS[id]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message log */}
      <div
        ref={logRef}
        className="thin-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3"
      >
        <AnimatePresence initial={false}>
          {gmMessages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-[0.78rem] font-light leading-snug ${
                m.from === 'system'
                  ? 'border-l-2 border-gold/60 pl-2.5 text-gold/95'
                  : 'text-mist/85'
              }`}
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hint button */}
      <div className="border-t border-teal/15 p-3">
        <button
          onClick={() => {
            sfx.click();
            requestHint();
          }}
          className="w-full border border-gold/40 py-2.5 font-hud text-[0.7rem] tracking-[0.22em] uppercase text-gold transition-colors hover:bg-gold/10"
        >
          Request Adaptive Hint
        </button>
        <p className="mt-1.5 text-center font-hud text-[0.55rem] tracking-[0.15em] uppercase text-mist/35">
          Hints tune to difficulty {profile.difficulty} · sharper if you ask
          again
        </p>
      </div>
    </aside>
  );
}
