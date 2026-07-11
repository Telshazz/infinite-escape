'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { THEMES } from '@/lib/data';
import { sfx } from '@/lib/audio';

export default function ThemeRegenerator() {
  const open = useGame((s) => s.regeneratorOpen);
  const setOpen = useGame((s) => s.setRegenerator);
  const regenerateTheme = useGame((s) => s.regenerateTheme);
  const currentId = useGame((s) => s.themeId);

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
            className="holo bracket thin-scroll max-h-[90vh] w-full max-w-3xl overflow-y-auto p-7 md:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="eyebrow">Regenerate Same Room</span>
                <h3 className="mt-2 font-display text-3xl font-semibold text-bone">
                  Same 20×20 Space. New Reality.
                </h3>
                <p className="mt-1 max-w-lg text-sm font-light text-mist/70">
                  Every prop stays exactly where it is. The AI re-skins the
                  digital twins, rewrites the story, rebuilds the puzzle chain,
                  and re-syncs the physical effects — in seconds.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="px-2 font-hud text-mist/50 hover:text-mist"
                aria-label="Close theme selector"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {THEMES.map((t) => {
                const current = t.id === currentId;
                return (
                  <button
                    key={t.id}
                    disabled={current}
                    onClick={() => {
                      sfx.portal();
                      regenerateTheme(t.id);
                    }}
                    className={`group relative overflow-hidden border p-4 text-left transition-all ${
                      current
                        ? 'cursor-default border-gold/50 bg-gold/5'
                        : 'border-teal/20 hover:border-teal/70 hover:shadow-holo'
                    }`}
                  >
                    {/* Theme palette swatch strip */}
                    <div className="mb-3 flex h-1.5 w-full overflow-hidden">
                      {[
                        t.palette.primary,
                        t.palette.secondary,
                        t.palette.accent,
                      ].map((c) => (
                        <span
                          key={c}
                          className="h-full flex-1"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <div className="font-display text-base leading-tight text-bone">
                      {t.name}
                    </div>
                    <div className="mt-1 text-[0.72rem] font-light leading-snug text-mist/60">
                      {t.tagline}
                    </div>
                    <div className="mt-2 font-hud text-[0.56rem] tracking-[0.12em] uppercase text-teal/70">
                      {t.samplePuzzleType}
                    </div>
                    {current && (
                      <span className="absolute right-2 top-2 font-hud text-[0.55rem] tracking-[0.2em] uppercase text-gold">
                        Live
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-center font-hud text-[0.6rem] tracking-[0.2em] uppercase text-mist/40">
              Zero construction · Zero downtime · Zero new floor space
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
