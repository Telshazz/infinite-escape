'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import type { FearLevel, GameMode } from '@/lib/types';
import { PrimaryButton, GhostButton } from './ui';
import { sfx } from '@/lib/audio';

const MODES: GameMode[] = [
  'Family Friendly',
  'Adventure',
  'Horror',
  'Corporate Team Building',
];
const FEARS: FearLevel[] = ['None', 'Mild', 'Intense'];
const LENGTHS = [30, 45, 60] as const;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="eyebrow mb-3">{label}</div>
      {children}
    </div>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  format,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o)}
          onClick={() => {
            sfx.click();
            onChange(o);
          }}
          className={`px-4 py-2 font-hud text-xs tracking-[0.12em] uppercase border transition-all ${
            value === o
              ? 'border-teal bg-teal/15 text-teal-glow shadow-holo'
              : 'border-teal/20 text-mist/60 hover:border-teal/50 hover:text-mist'
          }`}
        >
          {format ? format(o) : String(o)}
        </button>
      ))}
    </div>
  );
}

export default function SetupWizard() {
  const { profile, setProfile, startGeneration, setView } = useGame();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(53,224,206,0.08),transparent_55%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="holo bracket relative z-10 w-full max-w-2xl p-8 md:p-10"
      >
        <span className="eyebrow eyebrow-gold">Session Configuration</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-bone">
          Build the Group Profile
        </h2>
        <p className="mt-2 text-sm font-light text-mist/70">
          The AI Game Master generates a unique room experience from these
          parameters — story, puzzles, pacing, and physical effects all adapt.
        </p>

        <div className="mt-8 grid gap-7">
          <Field label={`Players — ${profile.playerCount}`}>
            <input
              type="range"
              min={2}
              max={10}
              value={profile.playerCount}
              onChange={(e) =>
                setProfile({ playerCount: Number(e.target.value) })
              }
              className="w-full"
              aria-label="Number of players"
            />
            <div className="mt-1 flex justify-between font-hud text-[0.6rem] text-mist/40">
              <span>2</span>
              <span>10</span>
            </div>
          </Field>

          <Field label="Theme">
            <div className="holo-gold border border-gold/30 bg-gold/5 px-4 py-3">
              <div className="font-display text-lg text-gold">
                The Lost City of Atlantis
              </div>
              <div className="mt-0.5 font-hud text-[0.65rem] tracking-[0.12em] uppercase text-mist/50">
                6 more themes unlock after this session · same physical room
              </div>
            </div>
          </Field>

          <Field label={`Difficulty — ${profile.difficulty} / 10`}>
            <input
              type="range"
              min={1}
              max={10}
              value={profile.difficulty}
              onChange={(e) =>
                setProfile({ difficulty: Number(e.target.value) })
              }
              className="w-full"
              aria-label="Difficulty"
            />
            <div className="mt-1 flex justify-between font-hud text-[0.6rem] text-mist/40">
              <span>Guided</span>
              <span>Expert</span>
            </div>
          </Field>

          <Field label="Mode">
            <Segmented
              options={MODES}
              value={profile.mode}
              onChange={(mode) => setProfile({ mode })}
            />
          </Field>

          <Field label="Fear Level">
            <Segmented
              options={FEARS}
              value={profile.fearLevel}
              onChange={(fearLevel) => setProfile({ fearLevel })}
            />
          </Field>

          <Field label="Session Length">
            <Segmented
              options={LENGTHS}
              value={profile.sessionLength}
              onChange={(sessionLength) => setProfile({ sessionLength })}
              format={(v) => `${v} min`}
            />
          </Field>
        </div>

        <div className="mt-10 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <GhostButton onClick={() => setView('start')}>Back</GhostButton>
          <PrimaryButton
            onClick={() => {
              sfx.open();
              startGeneration();
            }}
          >
            Generate Room Experience
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
}
