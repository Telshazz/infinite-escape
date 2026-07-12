'use client';

// Full-viewport playable experience: the FPS scene fills the screen and
// every panel from the old build lives on as a HUD overlay (see hud/Hud).

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useGame } from '@/lib/store';
import Hud from './hud/Hud';
import InvestorDashboard from './InvestorDashboard';
import ThemeRegenerator from './ThemeRegenerator';

// R3F must not be server-rendered
const FpsScene = dynamic(() => import('./scene/FpsScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-hud text-xs uppercase tracking-[0.25em] text-teal/60">
      Initializing mixed reality layer…
    </div>
  ),
});

export default function RoomExperience() {
  const shakeSignal = useGame((s) => s.shakeSignal);
  const [shaking, setShaking] = useState(false);

  // screen pulse mirroring the in-scene camera shake
  useEffect(() => {
    if (shakeSignal > 0) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(t);
    }
  }, [shakeSignal]);

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden bg-abyss ${shaking ? 'shaking' : ''}`}
    >
      <div className="absolute inset-0">
        <FpsScene />
      </div>
      <Hud />
      <InvestorDashboard />
      <ThemeRegenerator />
    </div>
  );
}
