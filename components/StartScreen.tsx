'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { PrimaryButton, GhostButton } from './ui';
import { sfx } from '@/lib/audio';

export default function StartScreen() {
  const setView = useGame((s) => s.setView);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Ambient depth gradient + slow caustic shimmer */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(53,224,206,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(217,164,65,0.07),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.35] animate-shimmer"
          style={{
            backgroundImage:
              'linear-gradient(115deg, transparent 40%, rgba(53,224,206,0.05) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative z-10 flex max-w-3xl flex-col items-center text-center"
      >
        <span className="eyebrow eyebrow-gold mb-6">
          Investor Demonstration · Prototype 01
        </span>

        <h1 className="font-display text-5xl font-semibold tracking-[0.08em] text-bone md:text-7xl">
          INFINITE
          <span className="mx-3 bg-gradient-to-r from-teal via-teal-glow to-gold bg-clip-text text-transparent">
            ESCAPE
          </span>
          <sup className="text-lg align-super text-mist/50">™</sup>
        </h1>

        <p className="mt-5 font-hud text-xs tracking-[0.3em] uppercase text-teal/80 md:text-sm">
          The AI-Powered Mixed Reality Escape Room Operating System
        </p>

        <p className="mt-8 max-w-xl font-body text-base font-light leading-relaxed text-mist/80">
          One physical room. Unlimited AI-generated realities. Room scanning,
          adaptive storytelling, synchronized physical effects, and an AI Game
          Master — with zero rebuilds.
        </p>

        <p className="mt-6 font-display text-lg italic tracking-wide text-gold/90">
          “We don’t rebuild rooms. We rebuild reality.”
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <PrimaryButton
            onClick={() => {
              sfx.open();
              setView('wizard');
            }}
          >
            Launch Investor Demo
          </PrimaryButton>
          <GhostButton gold onClick={() => setView('business')}>
            View Business Model
          </GhostButton>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 font-hud text-[0.65rem] tracking-[0.25em] uppercase text-mist/35"
      >
        Best experienced on desktop · 3–5 minute walkthrough
      </motion.div>
    </div>
  );
}
