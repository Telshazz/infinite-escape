'use client';

// ---------------------------------------------------------------------------
// An anchor rendered as a literal in-world object. Aim at it → highlight +
// prompt. Interact → focus mode: pointer unlocks, the camera eases up to
// the prop, and the mechanic panel projects off its interaction face.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { AnchorDef, ThemePalette } from '@/lib/types';
import { useGame } from '@/lib/store';
import { useInteractable } from '@/lib/interact';
import Prop from './Props';
import { AnchorPanel } from '../mechanics';

export function AnchorObject({
  anchor,
  themeId,
  palette,
  mixed,
}: {
  anchor: AnchorDef;
  themeId: string;
  palette: ThemePalette;
  mixed: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  useInteractable(root, { kind: 'anchor', id: anchor.id, range: 8 });

  const aim = useGame((s) => s.aim);
  const layer = useGame((s) => s.layer);
  const focused = useGame((s) => s.focusedAnchorId === anchor.id);
  const done = useGame((s) => s.completedAnchors.includes(anchor.id));
  const focusAnchor = useGame((s) => s.focusAnchor);
  const aimed = aim?.kind === 'anchor' && aim.id === anchor.id;

  // Esc steps back out of the panel
  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') focusAnchor(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused, focusAnchor]);

  // Panels are wall-mounted (authored y = center); everything else sits on
  // the floor.
  const isPanel = anchor.prop.kind === 'panel';
  const groupY = isPanel ? anchor.position[1] : 0;

  const facing = new THREE.Vector3(
    anchor.facing?.[0] ?? 0,
    0,
    anchor.facing?.[2] ?? 1
  ).normalize();
  const panelAnchor: [number, number, number] = [
    facing.x * (Math.max(anchor.size[0], anchor.size[2]) / 2 + 0.8),
    isPanel ? 0 : Math.max(anchor.size[1] * 0.72, 3.4),
    facing.z * (Math.max(anchor.size[0], anchor.size[2]) / 2 + 0.8),
  ];

  return (
    <group
      ref={root}
      position={[anchor.position[0], groupY, anchor.position[2]]}
      rotation={[0, anchor.rotationY ?? 0, 0]}
    >
      <RigidBody type="fixed" colliders="cuboid">
        <Prop
          spec={anchor.prop}
          size={anchor.size}
          ctx={{ themeId, palette, mixed }}
          glow={done ? 1 : aimed ? 0.7 : 0}
        />
      </RigidBody>
      {/* invisible interaction volume: tall enough that an eye-level ray
          registers low furniture the player is facing */}
      <mesh
        visible={false}
        position={[0, isPanel ? 0 : Math.max(anchor.size[1], 6.2) / 2, 0]}
      >
        <boxGeometry
          args={[
            anchor.size[0] + 0.8,
            isPanel ? anchor.size[1] + 0.8 : Math.max(anchor.size[1], 6.2),
            anchor.size[2] + 0.8,
          ]}
        />
      </mesh>

      {/* completed seal marker */}
      {done && mixed && (
        <mesh position={[0, (isPanel ? anchor.size[1] / 2 : anchor.size[1]) + 0.9, 0]}>
          <octahedronGeometry args={[0.3]} />
          <meshStandardMaterial
            color={palette.accent}
            emissive={palette.accent}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* mapping layer label */}
      {layer === 'mapping' && (
        <Html
          position={[0, (isPanel ? anchor.size[1] / 2 : anchor.size[1]) + 0.7, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[10, 0]}
        >
          <div className="holo min-w-[190px] max-w-[230px] border-teal/30 px-3 py-2 text-left">
            <div className="font-hud text-[0.58rem] uppercase tracking-[0.15em] text-mist/50">
              Anchor Station · {anchor.mechanic} engine
            </div>
            <div className="font-display text-[0.78rem] leading-tight text-teal-glow">
              {anchor.name}
            </div>
            <div className="mt-1 font-hud text-[0.55rem] uppercase tracking-[0.1em] text-gold/90">
              {anchor.role === 'parallel' ? 'parallel station' : `${anchor.role} puzzle`}
              {done ? ' · solved' : ''}
            </div>
          </div>
        </Html>
      )}

      {/* in-world mechanic panel while focused */}
      {focused && (
        <Html
          position={panelAnchor}
          center
          zIndexRange={[60, 40]}
          className="pointer-events-auto"
        >
          <AnchorPanel anchor={anchor} />
        </Html>
      )}
    </group>
  );
}
