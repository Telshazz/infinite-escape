'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { BUSINESS } from '@/lib/data';
import { StatRow } from './ui';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function RoiBar({
  label,
  value,
  max,
  color,
  negative = false,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  negative?: boolean;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-hud text-[0.62rem] tracking-[0.12em] uppercase text-mist/60">
          {label}
        </span>
        <span className={`font-hud text-sm ${negative ? 'text-red-300' : 'text-bone'}`}>
          {negative ? '−' : ''}
          {fmt(value)}
        </span>
      </div>
      <div className="h-2 w-full bg-mist/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function InvestorDashboard() {
  const open = useGame((s) => s.investorViewOpen);
  const setOpen = useGame((s) => s.setInvestorView);
  const { roi } = BUSINESS;
  const max = roi.incrementalRevenue;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="holo holo-gold bracket thin-scroll max-h-[90vh] w-full max-w-3xl overflow-y-auto p-7 md:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="eyebrow eyebrow-gold">Investor View</span>
                <h3 className="mt-2 font-display text-3xl font-semibold text-bone">
                  One Room. Unlimited Inventory.
                </h3>
                <p className="mt-1 text-sm font-light text-mist/70">
                  Everything in this session ran on software — the physical
                  room never changed.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="px-2 font-hud text-mist/50 hover:text-mist"
                aria-label="Close investor view"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-8 md:grid-cols-2">
              {/* Live session facts */}
              <div>
                <div className="eyebrow mb-2">This Session</div>
                <StatRow label="Current room" value="20 ft × 20 ft" />
                <StatRow label="Physical rebuild avoided" value="Yes" gold />
                <StatRow label="Replayable themes" value="Unlimited" gold />
                <StatRow label="AI puzzle variation" value="Active" />
                <StatRow label="Automated Game Master" value="Active" />
                <StatRow label="Physical effects sync" value="Active" />
              </div>

              {/* Commercial model */}
              <div>
                <div className="eyebrow mb-2">Commercial Model</div>
                <StatRow
                  label="Operator license (one-time)"
                  value={fmt(BUSINESS.license)}
                  gold
                />
                <StatRow
                  label="Platform subscription"
                  value={`${fmt(BUSINESS.monthly)} / mo`}
                  gold
                />
                <StatRow
                  label="Target customers"
                  value="Escape room operators"
                />
                <div className="mt-3">
                  <div className="font-hud text-[0.62rem] tracking-[0.14em] uppercase text-mist/60">
                    Future expansion
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {BUSINESS.expansion.map((e) => (
                      <span
                        key={e}
                        className="border border-teal/25 px-2 py-0.5 font-hud text-[0.6rem] tracking-[0.08em] uppercase text-teal/80"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ROI example */}
            <div className="mt-8 border-t border-gold/20 pt-6">
              <div className="eyebrow eyebrow-gold mb-1">
                Operator ROI — Single Room Example
              </div>
              <p className="mb-4 text-xs font-light text-mist/60">
                A room generating {fmt(roi.annualRevenue)}/year, with Infinite
                Escape lifting occupancy by{' '}
                {Math.round(roi.occupancyLift * 100)}%.
              </p>
              <div className="space-y-4">
                <RoiBar
                  label="Incremental revenue / year"
                  value={roi.incrementalRevenue}
                  max={max}
                  color="linear-gradient(90deg,#35e0ce,#7ff7ea)"
                />
                <RoiBar
                  label="Annual subscription cost"
                  value={roi.annualSubscription}
                  max={max}
                  color="rgba(194,90,74,0.85)"
                  negative
                />
                <RoiBar
                  label="Net operator value / year (pre-license)"
                  value={roi.netOperatorValue}
                  max={max}
                  color="linear-gradient(90deg,#d9a441,#f0cd7a)"
                />
              </div>
              <p className="mt-4 font-hud text-[0.62rem] tracking-[0.12em] uppercase text-gold/80">
                {fmt(roi.netOperatorValue)} / year of operator value before
                license recovery — versus a $80K–$200K physical rebuild every
                2–5 years.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
