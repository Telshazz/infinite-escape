'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import { getTheme } from '@/lib/themes';
import { sfx } from '@/lib/audio';

export default function GameMasterPanel() {
  const profile = useGame((s) => s.profile);
  const spec = useGame((s) => s.spec);
  const completed = useGame((s) => s.completedAnchors);
  const currentRoomId = useGame((s) => s.currentRoomId);
  const gmMessages = useGame((s) => s.gmMessages);
  const requestHint = useGame((s) => s.requestHint);
  const sessionComplete = useGame((s) => s.sessionComplete);
  const themeId = useGame((s) => s.themeId);
  const theme = getTheme(themeId);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [gmMessages]);

  if (!spec) return null;

  const next = spec.requiredAnchors.find((a) => !completed.includes(a));
  const objective = sessionComplete
    ? 'Session complete — regenerate the facility'
    : next
      ? spec.anchors[next].objective
      : 'All mechanisms satisfied — reach the exit';

  return (
    <aside className="holo bracket flex h-full w-full flex-col overflow-hidden bg-abyss/80 backdrop-blur">
      {/* header */}
      <div className="border-b border-teal/15 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
          </span>
          <span className="eyebrow">AI Game Master</span>
          {spec.gmSilent && (
            <span className="ml-auto font-hud text-[0.52rem] uppercase tracking-[0.14em] text-mist/40">
              silent mode
            </span>
          )}
        </div>
        <div className="mt-0.5 font-display text-sm text-bone">{theme.name}</div>
      </div>

      {/* objective */}
      <div className="border-b border-teal/15 px-4 py-2.5">
        <div className="font-hud text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">
          Current Objective
        </div>
        <p className="mt-1 text-[0.78rem] font-light leading-snug text-mist/90">
          {objective}
        </p>
      </div>

      {/* puzzle graph, grouped by room */}
      <div className="thin-scroll max-h-[32%] overflow-y-auto border-b border-teal/15 px-4 py-2.5">
        <div className="font-hud text-[0.6rem] uppercase tracking-[0.2em] text-mist/50">
          Puzzle Graph · {theme.structure}
        </div>
        <div className="mt-1.5 space-y-2">
          {spec.rooms.map((room) => {
            const roomAnchors = spec.requiredAnchors.filter(
              (a) => spec.anchors[a].roomId === room.id
            );
            return (
              <div key={room.id}>
                <div
                  className={`font-hud text-[0.6rem] uppercase tracking-[0.14em] ${
                    room.id === currentRoomId ? 'text-teal-glow' : 'text-mist/45'
                  }`}
                >
                  {room.name}
                  {room.id === currentRoomId && ' · here'}
                </div>
                {roomAnchors.map((id) => {
                  const a = spec.anchors[id];
                  const done = completed.includes(id);
                  return (
                    <div key={id} className="mt-1 flex items-center gap-2 pl-2">
                      <span
                        className={`h-1.5 w-1.5 rotate-45 border ${
                          done
                            ? 'border-teal bg-teal shadow-[0_0_6px_rgba(53,224,206,0.8)]'
                            : 'border-mist/30'
                        }`}
                      />
                      <span
                        className={`font-hud text-[0.62rem] tracking-[0.08em] ${
                          done ? 'text-teal-glow' : 'text-mist/60'
                        }`}
                      >
                        {a.name}
                        <span className="ml-1.5 text-mist/30">
                          {a.mechanic}
                          {a.crossRoom ? ' · cross-room' : ''}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* group profile */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 border-b border-teal/15 px-4 py-2.5 font-hud text-[0.6rem] uppercase tracking-[0.1em]">
        <span className="text-mist/45">Players</span>
        <span className="text-right text-mist/85">{profile.playerCount}</span>
        <span className="text-mist/45">Difficulty</span>
        <span className="text-right text-teal-glow">
          {profile.difficulty}/10 · {spec.band}
        </span>
        <span className="text-mist/45">Mode / Fear</span>
        <span className="text-right text-mist/85">
          {profile.mode.split(' ')[0]} · {profile.fearLevel}
        </span>
        <span className="text-mist/45">Effects</span>
        <span className="text-right text-mist/85">
          {Math.round(spec.effectIntensity * 100)}%
        </span>
      </div>

      {/* message log */}
      <div
        ref={logRef}
        className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-2.5"
      >
        <AnimatePresence initial={false}>
          {gmMessages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-[0.76rem] font-light leading-snug ${
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

      {/* hint button */}
      <div className="border-t border-teal/15 p-3">
        <button
          onClick={() => {
            sfx.click();
            requestHint();
          }}
          className="w-full border border-gold/40 py-2 font-hud text-[0.68rem] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold/10"
        >
          Request Adaptive Hint [H]
        </button>
        <p className="mt-1.5 text-center font-hud text-[0.53rem] uppercase tracking-[0.14em] text-mist/35">
          {spec.hintCapPerAnchor === Infinity
            ? 'Unlimited hints · guided profile'
            : `${spec.hintCapPerAnchor} per puzzle · starts ${spec.hintStartTier} · sharper if you ask again`}
        </p>
      </div>
    </aside>
  );
}
