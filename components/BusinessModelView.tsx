'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { BUSINESS } from '@/lib/data';
import { GhostButton, PrimaryButton } from './ui';

const fmt = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

function Section({
  eyebrow,
  title,
  children,
  gold = false,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55 }}
      className={`holo bracket p-7 md:p-8 ${gold ? 'holo-gold' : ''}`}
    >
      <span className={`eyebrow ${gold ? 'eyebrow-gold' : ''}`}>{eyebrow}</span>
      <h3 className="mt-2 font-display text-2xl font-semibold text-bone">
        {title}
      </h3>
      <div className="mt-3 text-sm font-light leading-relaxed text-mist/80">
        {children}
      </div>
    </motion.section>
  );
}

export default function BusinessModelView() {
  const setView = useGame((s) => s.setView);

  return (
    <div className="relative min-h-screen px-6 py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(217,164,65,0.06),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <span className="eyebrow eyebrow-gold">Business Model</span>
          <h2 className="mt-3 font-display text-4xl font-semibold text-bone md:text-5xl">
            The Operating System for
            <span className="block bg-gradient-to-r from-teal to-gold bg-clip-text text-transparent">
              Immersive Entertainment
            </span>
          </h2>
        </div>

        <div className="grid gap-5">
          <Section eyebrow="The Problem" title="Escape rooms expire">
            A themed room costs $80K–$200K to build and stays interesting for
            2–5 years. Then operators face the same brutal choice: spend six
            figures on a physical rebuild, or watch repeat visits and revenue
            decay. The industry's core asset — the room — depreciates like a
            movie that can only be watched once.
          </Section>

          <Section
            eyebrow="The Solution"
            title="Software-generated realities"
            gold
          >
            Infinite Escape scans the physical room once, maps every prop to a
            digital twin, and layers AI-generated mixed reality on top:
            adaptive stories, procedurally varied puzzles, an automated Game
            Master, and synchronized physical effects (wind, mist, light,
            spatial audio, scent, vibration). The same room becomes Atlantis
            today, a pirate galleon tonight, and a corporate mission tomorrow —
            with zero construction.
          </Section>

          <Section eyebrow="Target Market" title="Existing operators first">
            Thousands of escape room venues already own the hardest part — the
            physical space, the foot traffic, the staff. Infinite Escape sells
            them infinite content inventory for the rooms they already have,
            converting a depreciating set into a software-defined platform.
          </Section>

          <Section eyebrow="Revenue Model" title="License + recurring platform" gold>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div className="border border-gold/30 bg-gold/5 p-5 text-center">
                <div className="font-display text-3xl text-gold">
                  {fmt(BUSINESS.license)}
                </div>
                <div className="mt-1 font-hud text-[0.62rem] tracking-[0.18em] uppercase text-mist/60">
                  Initial operator license
                </div>
              </div>
              <div className="border border-teal/30 bg-teal/5 p-5 text-center">
                <div className="font-display text-3xl text-teal-glow">
                  {fmt(BUSINESS.monthly)}
                  <span className="text-base text-mist/50"> /mo</span>
                </div>
                <div className="mt-1 font-hud text-[0.62rem] tracking-[0.18em] uppercase text-mist/60">
                  Platform subscription
                </div>
              </div>
            </div>
            <p className="mt-4">
              Per the ROI model inside the demo: a {fmt(250000)}/year room with
              a 25% occupancy lift generates {fmt(62500)} in incremental
              revenue against {fmt(23988)} in subscription — {fmt(38512)}/year
              of operator value before license recovery.
            </p>
          </Section>

          <Section eyebrow="Expansion" title="From rooms to an OS">
            <ul className="mt-1 space-y-2.5">
              {[
                ['Certified Infinite Escape Rooms', 'Quality-badged operator network with shared content marketplace'],
                ['Flagship locations', 'Owned-and-operated showcase venues in top tourism markets'],
                ['Franchise model', 'Turnkey packages for new entrants: hardware kit + platform + content'],
                ['Immersive entertainment OS', 'Theme parks, museums, corporate training, education, tourism attractions'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-teal" />
                  <span>
                    <span className="text-bone">{t}</span>
                    <span className="text-mist/60"> — {d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <PrimaryButton onClick={() => setView('wizard')}>
            Launch Investor Demo
          </PrimaryButton>
          <GhostButton onClick={() => setView('start')}>
            Back to Start
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
