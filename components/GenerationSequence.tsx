'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { GENERATION_STEPS } from '@/lib/data';
import { sfx } from '@/lib/audio';

const STEP_MS = 620;

export default function GenerationSequence() {
  const enterRoom = useGame((s) => s.enterRoom);
  const profile = useGame((s) => s.profile);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= GENERATION_STEPS.length) {
      const t = setTimeout(() => {
        sfx.portal();
        enterRoom();
      }, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [step, enterRoom]);

  const pct = Math.min(100, Math.round((step / GENERATION_STEPS.length) * 100));

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="scan-sweep" key={step} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(53,224,206,0.08),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="text-center">
          <span className="eyebrow">AI Game Master</span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-bone md:text-3xl">
            Generating Custom Room Experience
          </h2>
          <p className="mt-2 font-hud text-[0.7rem] tracking-[0.15em] uppercase text-mist/50">
            {profile.playerCount} players · Difficulty {profile.difficulty} ·{' '}
            {profile.mode} · {profile.sessionLength} min
          </p>
        </div>

        <div className="holo bracket mt-8 p-6">
          <div className="mb-4 h-[3px] w-full overflow-hidden bg-teal/10">
            <motion.div
              className="h-full bg-gradient-to-r from-teal to-gold"
              animate={{ width: `${pct}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          <ul className="space-y-2.5">
            {GENERATION_STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li
                  key={label}
                  className="flex items-center gap-3 font-hud text-xs tracking-[0.1em]"
                >
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
                  <span
                    className={
                      done
                        ? 'text-mist/80'
                        : active
                          ? 'text-teal-glow'
                          : 'text-mist/30'
                    }
                  >
                    {label}
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="ml-1 text-teal"
                        >
                          …
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-6 text-center font-hud text-[0.62rem] tracking-[0.2em] uppercase text-mist/35">
          No physical reconstruction · Software-defined reality
        </p>
      </motion.div>
    </div>
  );
}
