'use client';

// Inspectable clue props — physical carriers of cross-room clue text.

import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { CluePropDef, ThemePalette } from '@/lib/types';
import { useGame } from '@/lib/store';
import { useInteractable } from '@/lib/interact';
import Prop from './Props';

export function ClueObject({
  clue,
  themeId,
  palette,
  mixed,
}: {
  clue: CluePropDef;
  themeId: string;
  palette: ThemePalette;
  mixed: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  useInteractable(root, { kind: 'clue', id: clue.id, range: 8 });
  const aim = useGame((s) => s.aim);
  const layer = useGame((s) => s.layer);
  const aimed = aim?.kind === 'clue' && aim.id === clue.id;

  const isPanel = clue.prop.kind === 'panel';
  const groupY = isPanel ? clue.position[1] : 0;

  return (
    <group
      ref={root}
      position={[clue.position[0], groupY, clue.position[2]]}
      rotation={[0, clue.rotationY ?? 0, 0]}
    >
      <RigidBody type="fixed" colliders="cuboid">
        <Prop
          spec={clue.prop}
          size={clue.size}
          ctx={{ themeId, palette, mixed }}
          glow={aimed ? 0.5 : 0}
        />
      </RigidBody>
      {/* invisible interaction volume (see AnchorObject) */}
      <mesh
        visible={false}
        position={[0, isPanel ? 0 : Math.max(clue.size[1], 6.2) / 2, 0]}
      >
        <boxGeometry
          args={[
            clue.size[0] + 0.8,
            isPanel ? clue.size[1] + 0.8 : Math.max(clue.size[1], 6.2),
            clue.size[2] + 0.8,
          ]}
        />
      </mesh>
      {layer === 'mapping' && (
        <Html
          position={[0, (isPanel ? clue.size[1] / 2 : clue.size[1]) + 0.6, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[10, 0]}
        >
          <div className="holo border-gold/30 px-2.5 py-1.5">
            <div className="font-hud text-[0.55rem] uppercase tracking-[0.15em] text-mist/50">
              Clue Carrier
            </div>
            <div className="font-display text-[0.72rem] text-gold">{clue.name}</div>
          </div>
        </Html>
      )}
    </group>
  );
}
