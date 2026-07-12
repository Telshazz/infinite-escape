'use client';

// The "AI generating…" sequence. The spec was ALREADY computed by
// startGeneration — these steps surface the real resolution facts
// (rooms kept, puzzle count, hint policy, effect intensity), then hand
// off to a click-to-enter button (pointer lock needs a user gesture).

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { GENERATION_STEPS } from '@/lib/data';
import { sfx } from '@/lib/audio';

const STEP_MS = 560;

export default function GenerationSequence() {
  const enterRoom = useGame((s) => s.enterRoom);
  const profile = useGame((s) => s.profile);
  const spec = useGame((s) => s.spec);
  const [step, setStep] = useState(0);
  const total = GENERATION_STEPS.length;
  const ready = step >= total;

  useEffect(() => {
    if (step >= total) return;
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [step, total]);

  const pct = Math.min(100, Math.round((step / total) * 100));

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="scan-sweep" key={step} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(53,224,206,0.08),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="text-center">
          <span className="eyebrow">AI Game Master</span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-bone md:text-3xl">
            Generating Custom Room Experience
          </h2>
          <p className="mt-2 font-hud text-[0.7rem] uppercase tracking-[0.15em] text-mist/50">
            {profile.playerCount} players · Difficulty {profile.difficulty} ·{' '}
            {profile.mode} · {profile.fearLevel} fear · {profile.sessionLength} min
          </p>
        </div>

        <div className="holo bracket mt-7 p-6">
          <div className="mb-4 h-[3px] w-full overflow-hidden bg-teal/10">
            <motion.div
              className="h-full bg-gradient-to-r from-teal to-gold"
              animate={{ width: `${pct}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          <ul className="space-y-2">
            {GENERATION_STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={label} className="flex items-center gap-3 font-hud text-xs tracking-[0.1em]">
                  <span
                    className={`flex h-4 w-4 items-center justify-center border text-[0.55rem] ${
                      done
                        ? 'border-teal bg-teal/20 text-teal-glow'
                        : active
                          ? 'animate-pulse border-gold text-gold'
                          : 'border-mist/15 text-transparent'
                    }`}
                  >
                    {done ? '✓' : active ? '▸' : '·'}
                  </span>
                  <span className={done ? 'text-mist/80' : active ? 'text-teal-glow' : 'text-mist/30'}>
                    {label}
                    {active && <span className="ml-1 animate-pulse text-teal">…</span>}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* the ACTUAL resolution log from the spec resolver */}
          <AnimatePresence>
            {spec && step >= 5 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 overflow-hidden border-t border-teal/15 pt-3"
              >
                <div className="font-hud text-[0.58rem] uppercase tracking-[0.2em] text-gold/70">
                  Resolved session spec
                </div>
                <ul className="mt-2 space-y-1.5">
                  {spec.notes.map((n, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="flex gap-2 text-[0.72rem] font-light leading-snug text-mist/80"
                    >
                      <span className="text-teal">▸</span>
                      {n}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center">
          <AnimatePresence>
            {ready && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  sfx.portal();
                  enterRoom();
                }}
                className="bracket bg-gradient-to-r from-teal to-teal-glow px-10 py-3.5 font-hud text-sm uppercase tracking-[0.2em] text-abyss shadow-holo"
              >
                Enter the Room — First Person
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-5 text-center font-hud text-[0.62rem] uppercase tracking-[0.2em] text-mist/35">
          No physical reconstruction · Software-defined reality
        </p>
      </motion.div>
    </div>
  );
}
