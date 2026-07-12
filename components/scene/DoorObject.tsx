'use client';

// ---------------------------------------------------------------------------
// Doors: live themed passages (gate-evaluated, interactive) and sealed
// panels filling fixed doorways the current theme doesn't use.
// A door slab is always solid — traversal happens through interaction,
// which the store turns into a transition + room swap.
// ---------------------------------------------------------------------------

import { useMemo, useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DoorwaySide, ResolvedDoor, ThemePalette } from '@/lib/types';
import { getDoorway } from '@/lib/facility';
import { useGame } from '@/lib/store';
import { gateSatisfied } from '@/lib/spec';
import { useInteractable } from '@/lib/interact';
import { useSurface } from './materials';

export function SealedDoorway({
  side,
  doorwayId,
  palette,
  mixed,
  label,
}: {
  side: DoorwaySide;
  doorwayId: string;
  palette: ThemePalette;
  mixed: boolean;
  label: string;
}) {
  const dw = getDoorway(doorwayId);
  const mat = useSurface({
    pattern: 'panel',
    tint: mixed ? palette.wall : '#5a5f66',
    mixed: true,
    seed: 21,
  });
  const layer = useGame((s) => s.layer);
  return (
    <group
      position={[side.position[0], 0, side.position[2]]}
      rotation={[0, side.rotationY, 0]}
    >
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={mat} position={[0, dw.height / 2, 0]} castShadow>
          <boxGeometry args={[dw.width, dw.height, 0.9]} />
        </mesh>
      </RigidBody>
      {layer === 'mapping' && (
        <Html position={[0, dw.height + 0.6, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <div className="holo whitespace-nowrap border-teal/30 px-2 py-1 font-hud text-[0.6rem] uppercase tracking-[0.14em] text-mist/60">
            {label} · sealed this session
          </div>
        </Html>
      )}
    </group>
  );
}

export function DoorObject({
  door,
  side,
  palette,
  mixed,
}: {
  door: ResolvedDoor;
  side: DoorwaySide;
  palette: ThemePalette;
  mixed: boolean;
}) {
  const dw = getDoorway(door.doorway);
  const root = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  useInteractable(root, { kind: 'door', id: door.id, range: 9 });

  const completed = useGame((s) => s.completedAnchors);
  const required = useGame((s) => s.spec?.requiredAnchors ?? []);
  const aim = useGame((s) => s.aim);
  const layer = useGame((s) => s.layer);
  const open = gateSatisfied(door.resolvedGate, completed, required);
  const aimed = aim?.kind === 'door' && aim.id === door.id;
  const isExit = door.to === 'ESCAPE';

  const slabMat = useSurface({
    pattern: 'metal',
    tint: mixed ? palette.primary : '#6b7076',
    mixed: true,
    metalness: 0.4,
    seed: 22,
  });
  const frameMat = useSurface({
    pattern: 'metal',
    tint: mixed ? palette.accent : '#4a4f55',
    mixed: true,
    metalness: 0.7,
    roughBase: 0.35,
    seed: 23,
  });

  const glowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: palette.secondary,
        emissive: palette.secondary,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.85,
        toneMapped: false,
      }),
    [palette.secondary]
  );

  // pulse the seal glow: locked = dim ember, open = breathing bright
  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const m = glowRef.current.material as THREE.MeshStandardMaterial;
    const t = clock.elapsedTime;
    const base = !mixed ? 0.05 : open ? 1.4 : 0.25;
    m.emissiveIntensity =
      base + (open ? Math.sin(t * 2.2) * 0.5 : Math.sin(t * 1.2) * 0.06) +
      (aimed ? 0.5 : 0);
    m.color.set(open ? palette.secondary : mixed ? palette.accent : '#888888');
    m.emissive.copy(m.color);
  });

  return (
    <group
      ref={root}
      position={[side.position[0], 0, side.position[2]]}
      rotation={[0, side.rotationY, 0]}
    >
      <RigidBody type="fixed" colliders="cuboid">
        {/* slab */}
        <mesh material={slabMat} position={[0, dw.height / 2, 0]} castShadow>
          <boxGeometry args={[dw.width - 0.3, dw.height - 0.15, 0.5]} />
        </mesh>
      </RigidBody>
      {/* frame */}
      <mesh material={frameMat} position={[-dw.width / 2 + 0.15, dw.height / 2, 0]} castShadow>
        <boxGeometry args={[0.35, dw.height, 0.9]} />
      </mesh>
      <mesh material={frameMat} position={[dw.width / 2 - 0.15, dw.height / 2, 0]} castShadow>
        <boxGeometry args={[0.35, dw.height, 0.9]} />
      </mesh>
      <mesh material={frameMat} position={[0, dw.height - 0.15, 0]} castShadow>
        <boxGeometry args={[dw.width, 0.35, 0.9]} />
      </mesh>
      {/* seal glow strip / exit sigil */}
      <mesh ref={glowRef} material={glowMat} position={[0, isExit ? dw.height * 0.55 : dw.height * 0.5, 0.3]}>
        {isExit ? (
          <ringGeometry args={[dw.width * 0.22, dw.width * 0.3, 32]} />
        ) : (
          <planeGeometry args={[dw.width * 0.12, dw.height * 0.7]} />
        )}
      </mesh>
      {(layer === 'mapping' || aimed) && (
        <Html position={[0, dw.height + 0.7, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <div className="holo whitespace-nowrap border-teal/40 px-2.5 py-1 font-hud text-[0.62rem] uppercase tracking-[0.14em] text-teal-glow">
            {door.name}
            {layer === 'mapping' && (
              <span className="ml-2 text-mist/50">
                {open ? 'unlocked' : 'gate: pending'}
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
