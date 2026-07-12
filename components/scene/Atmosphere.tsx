'use client';

// ---------------------------------------------------------------------------
// Lighting + fog + startle cues. One shadow-casting key light per room,
// palette fills, environment lightformers for reflections, and the
// spec-driven flicker/jump-scare machinery (Mode caps > Fear > Difficulty
// already resolved into spec.effectIntensity / spec.jumpScares).
// ---------------------------------------------------------------------------

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import type { ChamberId, Theme } from '@/lib/types';
import { CHAMBERS, WALL_HEIGHT } from '@/lib/facility';
import { useGame } from '@/lib/store';
import { sfx } from '@/lib/audio';

export default function Atmosphere({
  chamber,
  theme,
}: {
  chamber: ChamberId;
  theme: Theme;
}) {
  const layer = useGame((s) => s.layer);
  const lightingOn = useGame((s) => s.effects.lighting);
  const intensity = useGame((s) => s.spec?.effectIntensity ?? 0.5);
  const jumpScares = useGame((s) => s.spec?.jumpScares ?? false);
  const mixed = layer !== 'physical';
  const { scene } = useThree();
  const { size } = CHAMBERS[chamber];

  const keyRef = useRef<THREE.SpotLight>(null);
  const dropout = useRef(0); // >0 while a startle blackout is running

  // Startle cues: sparse random blackout + stinger. Armed ONLY when the
  // resolved spec allows it (never in Family Friendly).
  useEffect(() => {
    if (!jumpScares) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const wait = 30000 + Math.random() * 45000 / Math.max(0.4, intensity);
      timer = setTimeout(() => {
        if (!alive) return;
        const s = useGame.getState();
        if (s.view === 'room' && !s.paused && !s.focusedAnchorId) {
          dropout.current = 1;
          sfx.stinger();
          s.triggerShake();
        }
        schedule();
      }, wait);
    };
    schedule();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [jumpScares, intensity]);

  useFrame(({ clock }, dt) => {
    // fog
    const fogColor = mixed ? theme.palette.fog : '#1a2026';
    if (!scene.fog) scene.fog = new THREE.FogExp2(fogColor, 0.004);
    const fog = scene.fog as THREE.FogExp2;
    fog.color.lerp(new THREE.Color(fogColor), 0.06);
    const targetDensity = mixed ? 0.012 + intensity * 0.014 : 0.004;
    fog.density += (targetDensity - fog.density) * 0.06;
    scene.background = fog.color;

    // key light flicker scaled by resolved intensity
    if (keyRef.current) {
      const t = clock.elapsedTime;
      const flickAmp = mixed && lightingOn ? 0.05 + intensity * 0.1 : 0;
      const flicker =
        1 + Math.sin(t * 7.3) * flickAmp + Math.sin(t * 13.7) * flickAmp * 0.6;
      const black = dropout.current > 0 ? Math.max(0, 1 - dropout.current * 1.6) : 1;
      keyRef.current.intensity = (mixed ? 380 : 480) * flicker * black;
      keyRef.current.color.lerp(
        new THREE.Color(mixed ? theme.palette.keyLight : '#ffffff'),
        0.08
      );
    }
    if (dropout.current > 0)
      dropout.current = Math.max(0, dropout.current - dt * 1.4);
  });

  return (
    <>
      <ambientLight intensity={mixed ? 0.35 : 0.6} />
      <hemisphereLight
        intensity={mixed ? 0.5 : 0.45}
        color={mixed ? theme.palette.fillLight : '#aab4bd'}
        groundColor={mixed ? theme.palette.floor : '#3a4046'}
      />
      <spotLight
        ref={keyRef}
        position={[0, WALL_HEIGHT - 0.6, 0]}
        angle={1.4}
        penumbra={0.9}
        distance={50}
        decay={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      {/* palette fills in opposite corners */}
      <pointLight
        position={[-size[0] / 2 + 2, 4, -size[1] / 2 + 2]}
        intensity={mixed ? 18 : 4}
        color={mixed ? theme.palette.fillLight : '#ffffff'}
        distance={18}
        decay={1.8}
      />
      <pointLight
        position={[size[0] / 2 - 2, 4, size[1] / 2 - 2]}
        intensity={mixed ? 14 : 4}
        color={mixed ? theme.palette.accent : '#ffffff'}
        distance={16}
        decay={1.8}
      />
      {/* low-res environment for PBR reflections — no network fetch */}
      <Environment resolution={64} frames={1}>
        <Lightformer
          intensity={mixed ? 1.2 : 0.8}
          color={mixed ? theme.palette.keyLight : '#ffffff'}
          position={[0, 8, 0]}
          rotation-x={Math.PI / 2}
          scale={[12, 12, 1]}
        />
        <Lightformer
          intensity={0.5}
          color={mixed ? theme.palette.fillLight : '#8899aa'}
          position={[-8, 4, 0]}
          rotation-y={Math.PI / 2}
          scale={[10, 4, 1]}
        />
        <Lightformer
          intensity={0.4}
          color={mixed ? theme.palette.accent : '#777777'}
          position={[8, 3, 4]}
          rotation-y={-Math.PI / 2}
          scale={[8, 3, 1]}
        />
      </Environment>
    </>
  );
}
