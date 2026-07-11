'use client';

import { useGame } from '@/lib/store';
import { EFFECTS } from '@/lib/data';
import { sfx } from '@/lib/audio';

const ICONS: Record<string, JSX.Element> = {
  wind: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8a2.5 2.5 0 1 1-2.5 2.5" strokeLinecap="round" />
    </svg>
  ),
  mist: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M4 14h16M6 18h12M8 10h8M10 6h4" strokeLinecap="round" />
    </svg>
  ),
  lighting: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9z" strokeLinejoin="round" />
    </svg>
  ),
  audio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M4 10v4h4l5 4V6l-5 4H4z" strokeLinejoin="round" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" strokeLinecap="round" />
    </svg>
  ),
  scent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M8 21c-2-3 2-4 0-7M12 21c-2-3 2-4 0-7M16 21c-2-3 2-4 0-7" strokeLinecap="round" />
      <path d="M6 10a6 6 0 0 1 12 0" strokeLinecap="round" />
    </svg>
  ),
  vibration: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <rect x="9" y="4" width="6" height="16" rx="1.5" />
      <path d="M5 8v8M2.5 10v4M19 8v8M21.5 10v4" strokeLinecap="round" />
    </svg>
  ),
};

export default function EffectsRail() {
  const effects = useGame((s) => s.effects);
  const toggleEffect = useGame((s) => s.toggleEffect);

  return (
    <div className="holo flex items-stretch gap-1 px-2 py-1.5">
      <div className="mr-1 hidden flex-col justify-center pr-2 md:flex">
        <span className="font-hud text-[0.55rem] tracking-[0.22em] uppercase text-mist/45">
          Physical
        </span>
        <span className="font-hud text-[0.55rem] tracking-[0.22em] uppercase text-teal/70">
          Effects Rig
        </span>
      </div>
      {EFFECTS.map((e) => {
        const on = effects[e.key];
        return (
          <button
            key={e.key}
            onClick={() => {
              sfx.click();
              toggleEffect(e.key);
            }}
            title={`${e.hardware} — ${e.description}`}
            className={`group flex flex-col items-center gap-1 px-2.5 py-1.5 transition-all ${
              on
                ? 'text-teal-glow'
                : 'text-mist/35 hover:text-mist/70'
            }`}
          >
            <span
              className={`transition-transform ${on ? 'scale-110 drop-shadow-[0_0_6px_rgba(53,224,206,0.9)]' : ''}`}
            >
              {ICONS[e.key]}
            </span>
            <span className="font-hud text-[0.52rem] tracking-[0.14em] uppercase">
              {e.label}
            </span>
            <span
              className={`h-[2px] w-5 ${on ? 'bg-teal shadow-[0_0_6px_rgba(53,224,206,0.9)]' : 'bg-mist/15'}`}
            />
          </button>
        );
      })}
    </div>
  );
}
