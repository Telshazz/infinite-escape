'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import {
  ALTAR_SOLUTION,
  ARCHIVE_CODE,
  PUZZLES_BASE,
  SYMBOLS,
} from '@/lib/data';
import type { SymbolId } from '@/lib/data';
import { SymbolGlyph } from './ui';
import { sfx } from '@/lib/audio';

function AltarPuzzle({ onSolve }: { onSolve: () => void }) {
  const [seq, setSeq] = useState<SymbolId[]>([]);
  const [wrong, setWrong] = useState(false);

  const pick = (id: SymbolId) => {
    if (seq.includes(id)) return;
    const next = [...seq, id];
    // Validate prefix as we go
    const ok = next.every((s, i) => ALTAR_SOLUTION[i] === s);
    if (!ok) {
      sfx.fail();
      setWrong(true);
      setTimeout(() => {
        setWrong(false);
        setSeq([]);
      }, 650);
      return;
    }
    sfx.click();
    setSeq(next);
    if (next.length === ALTAR_SOLUTION.length) {
      sfx.success();
      setTimeout(onSolve, 500);
    }
  };

  return (
    <div>
      {/* Sequence slots */}
      <div
        className={`mb-6 flex justify-center gap-3 ${wrong ? 'shaking' : ''}`}
      >
        {ALTAR_SOLUTION.map((_, i) => (
          <div
            key={i}
            className={`flex h-14 w-14 items-center justify-center border ${
              seq[i]
                ? 'border-teal bg-teal/15 text-teal-glow shadow-holo'
                : wrong
                  ? 'border-red-400/60'
                  : 'border-teal/25 text-mist/20'
            }`}
          >
            {seq[i] ? (
              <SymbolGlyph
                glyph={SYMBOLS.find((s) => s.id === seq[i])!.glyph}
                className="h-7 w-7"
              />
            ) : (
              <span className="font-hud text-xs">{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Symbol choices */}
      <div className="grid grid-cols-3 gap-3">
        {SYMBOLS.map((s) => {
          const used = seq.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => pick(s.id)}
              disabled={used}
              className={`group flex flex-col items-center gap-1.5 border px-3 py-3.5 transition-all ${
                used
                  ? 'border-teal/40 bg-teal/10 text-teal opacity-50'
                  : 'border-gold/25 text-gold hover:border-gold hover:bg-gold/10 hover:shadow-holo-gold'
              }`}
            >
              <SymbolGlyph glyph={s.glyph} className="h-8 w-8" />
              <span className="font-hud text-[0.6rem] tracking-[0.15em] uppercase">
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ArchivePuzzle({ onSolve }: { onSolve: () => void }) {
  const [code, setCode] = useState(['0', '0', '0']);
  const [wrong, setWrong] = useState(false);

  const bump = (i: number, dir: 1 | -1) => {
    sfx.click();
    setCode((c) => {
      const next = [...c];
      next[i] = String((Number(next[i]) + dir + 10) % 10);
      return next;
    });
  };

  const submit = () => {
    if (code.join('') === ARCHIVE_CODE.join('')) {
      sfx.success();
      setTimeout(onSolve, 400);
    } else {
      sfx.fail();
      setWrong(true);
      setTimeout(() => setWrong(false), 650);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`flex gap-4 ${wrong ? 'shaking' : ''}`}>
        {code.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <button
              onClick={() => bump(i, 1)}
              className="px-4 py-1 font-hud text-teal hover:bg-teal/10"
              aria-label={`Increase dial ${i + 1}`}
            >
              ▲
            </button>
            <div
              className={`flex h-16 w-14 items-center justify-center border font-display text-3xl ${
                wrong
                  ? 'border-red-400/60 text-red-300'
                  : 'border-gold/40 bg-gold/5 text-gold shadow-holo-gold'
              }`}
            >
              {d}
            </div>
            <button
              onClick={() => bump(i, -1)}
              className="px-4 py-1 font-hud text-teal hover:bg-teal/10"
              aria-label={`Decrease dial ${i + 1}`}
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={submit}
        className="bracket mt-6 bg-gradient-to-r from-teal to-teal-glow px-8 py-2.5 font-hud text-xs tracking-[0.2em] uppercase text-abyss"
      >
        Unlock Archive
      </button>
    </div>
  );
}

function PortalPuzzle({ onSolve }: { onSolve: () => void }) {
  const [channeling, setChanneling] = useState(false);
  return (
    <div className="flex flex-col items-center text-center">
      <p className="max-w-sm text-sm font-light leading-relaxed text-mist/85">
        Both seals burn teal. Channel their energy into the gate to stabilize
        the portal and complete the session.
      </p>
      <motion.button
        onClick={() => {
          if (channeling) return;
          setChanneling(true);
          sfx.portal();
          setTimeout(onSolve, 1400);
        }}
        animate={
          channeling
            ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.7 } }
            : {}
        }
        className="bracket mt-7 border border-teal/50 bg-teal/10 px-10 py-4 font-display text-lg tracking-[0.1em] text-teal-glow shadow-holo hover:bg-teal/20"
      >
        {channeling ? 'CHANNELING…' : 'STABILIZE THE GATE'}
      </motion.button>
    </div>
  );
}

export default function PuzzleModal() {
  const { activePuzzle, closePuzzle, completePuzzle, profile, themeId } =
    useGame();
  const puzzle = PUZZLES_BASE.find((p) => p.id === activePuzzle);
  const easy = profile.difficulty <= 5;

  return (
    <AnimatePresence>
      {puzzle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-abyss/70 p-4 backdrop-blur-sm"
          onClick={closePuzzle}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="holo bracket w-full max-w-lg p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-start justify-between">
              <span className="eyebrow eyebrow-gold">
                Puzzle · Difficulty {profile.difficulty}
              </span>
              <button
                onClick={closePuzzle}
                className="-mt-1 px-2 font-hud text-mist/50 hover:text-mist"
                aria-label="Close puzzle"
              >
                ✕
              </button>
            </div>
            <h3 className="font-display text-2xl font-semibold text-bone">
              {puzzle.title}
            </h3>

            <div className="mt-4 border-l-2 border-teal/50 bg-teal/5 px-4 py-3 text-[0.83rem] font-light italic leading-relaxed text-mist/90">
              {easy ? puzzle.clueEasy : puzzle.clueHard}
              <div className="mt-1 font-hud text-[0.55rem] not-italic tracking-[0.2em] uppercase text-teal/60">
                {easy
                  ? 'Direct clue · low difficulty profile'
                  : 'Cryptic clue · high difficulty profile'}
              </div>
            </div>

            <div className="mt-6">
              {puzzle.id === 'altar' && (
                <AltarPuzzle onSolve={() => completePuzzle('altar')} />
              )}
              {puzzle.id === 'archive' && (
                <ArchivePuzzle onSolve={() => completePuzzle('archive')} />
              )}
              {puzzle.id === 'portal' && (
                <PortalPuzzle onSolve={() => completePuzzle('portal')} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
