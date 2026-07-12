'use client';

// ---------------------------------------------------------------------------
// Canvas root for the playable experience: physics world, FPS player,
// reticle interactor, the ONE currently-mounted room, and the post chain.
// ---------------------------------------------------------------------------

import { Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useGame } from '@/lib/store';
import { getTheme } from '@/lib/themes';
import Player from './Player';
import Interactor from './Interactor';
import Room from './Room';
import PostFX from './PostFX';

function DebugBridge() {
  const three = useThree();
  if (typeof window !== 'undefined' && window.location.search.includes('debug')) {
    (window as unknown as Record<string, unknown>).__r3f = three;
  }
  return null;
}

export default function FpsScene() {
  const spec = useGame((s) => s.spec);
  const themeId = useGame((s) => s.themeId);
  const currentRoomId = useGame((s) => s.currentRoomId);

  if (!spec || !currentRoomId) return null;
  const theme = getTheme(themeId);
  const room = spec.rooms.find((r) => r.id === currentRoomId);
  if (!room) return null;

  return (
    <Canvas
      shadows
      camera={{ fov: 72, near: 0.15, far: 140, position: [0, 5.6, -6.5] }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        {/* fixed timestep: load hitches with a variable step tunnel the
            player capsule straight through the floor */}
        <Physics gravity={[0, -32.17, 0]} timeStep={1 / 60}>
          {/* key on room id: unmount previous room's geometry + colliders,
              mount the next — scene swapping, not streaming */}
          <Room key={`${themeId}-${room.id}`} room={room} theme={theme} spec={spec} />
          <Player />
        </Physics>
        <Interactor />
        <PostFX />
        <DebugBridge />
      </Suspense>
    </Canvas>
  );
}
