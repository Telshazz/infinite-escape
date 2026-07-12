'use client';

// ---------------------------------------------------------------------------
// Chamber shell: floor, ceiling, four walls with REAL doorway openings cut
// into them (all fixed-layer doorways are always cut; the theme decides
// which are live passages and which get sealed panels). One fixed RigidBody
// with auto cuboid colliders covers the whole shell.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { ChamberId, ThemePalette } from '@/lib/types';
import { CHAMBERS, DOORWAYS, WALL_HEIGHT } from '@/lib/facility';
import { useSurface, PHYS, THEME_PATTERN } from './materials';
import type { TexPattern } from '@/lib/textures';

interface WallOpening {
  offset: number; // along the wall axis
  width: number;
  height: number;
}

interface WallSpec {
  // wall center position + axis
  center: [number, number, number];
  horizontal: boolean; // true = runs along x (north/south walls)
  length: number;
  openings: WallOpening[];
}

function buildWalls(chamber: ChamberId): WallSpec[] {
  const shell = CHAMBERS[chamber];
  const [w, d] = shell.size;
  const hx = w / 2;
  const hz = d / 2;

  const walls: WallSpec[] = [
    { center: [0, 0, hz], horizontal: true, length: w, openings: [] }, // N
    { center: [0, 0, -hz], horizontal: true, length: w, openings: [] }, // S
    { center: [hx, 0, 0], horizontal: false, length: d, openings: [] }, // E
    { center: [-hx, 0, 0], horizontal: false, length: d, openings: [] }, // W
  ];

  for (const doorway of DOORWAYS) {
    for (const side of doorway.sides) {
      if (side.chamber !== chamber) continue;
      const [px, , pz] = side.position;
      // pick the wall this opening belongs to
      const wall =
        Math.abs(Math.abs(pz) - hz) < 0.6 && Math.abs(px) < hx
          ? pz > 0
            ? walls[0]
            : walls[1]
          : px > 0
            ? walls[2]
            : walls[3];
      wall.openings.push({
        offset: wall.horizontal ? px : pz,
        width: doorway.width,
        height: doorway.height,
      });
    }
  }
  return walls;
}

/** Split a wall into box segments around its openings. */
function wallSegments(wall: WallSpec) {
  const segs: { center: number; width: number; y: number; height: number }[] =
    [];
  const half = wall.length / 2;
  const sorted = [...wall.openings].sort((a, b) => a.offset - b.offset);
  let cursor = -half;
  for (const o of sorted) {
    const left = o.offset - o.width / 2;
    const right = o.offset + o.width / 2;
    if (left > cursor + 0.01)
      segs.push({
        center: (cursor + left) / 2,
        width: left - cursor,
        y: WALL_HEIGHT / 2,
        height: WALL_HEIGHT,
      });
    // header above the opening
    segs.push({
      center: o.offset,
      width: o.width,
      y: (o.height + WALL_HEIGHT) / 2,
      height: WALL_HEIGHT - o.height,
    });
    cursor = right;
  }
  if (cursor < half - 0.01)
    segs.push({
      center: (cursor + half) / 2,
      width: half - cursor,
      y: WALL_HEIGHT / 2,
      height: WALL_HEIGHT,
    });
  return segs;
}

export default function RoomShell({
  chamber,
  themeId,
  palette,
  mixed,
}: {
  chamber: ChamberId;
  themeId: string;
  palette: ThemePalette;
  mixed: boolean;
}) {
  const shell = CHAMBERS[chamber];
  const [w, d] = shell.size;
  const pattern = (THEME_PATTERN[themeId] ?? 'stone') as TexPattern;

  const wallMat = useSurface({
    pattern,
    tint: mixed ? palette.wall : PHYS.wall,
    mixed: true, // wall/floor always textured; tint carries the layer switch
    repeat: [3, 1.6],
    seed: 11,
  });
  const floorMat = useSurface({
    pattern: pattern === 'wood' ? 'wood' : 'stone',
    tint: mixed ? palette.floor : PHYS.floor,
    mixed: true,
    repeat: [4, 4],
    roughBase: 0.75,
    seed: 12,
  });
  const ceilMat = useSurface({
    pattern: 'plaster',
    tint: mixed ? palette.wall : PHYS.wall,
    mixed: true,
    repeat: [3, 3],
    seed: 13,
  });

  const walls = useMemo(() => buildWalls(chamber), [chamber]);

  return (
    <RigidBody type="fixed" colliders="cuboid">
      {/* floor */}
      <mesh material={floorMat} receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[w, 1, d]} />
      </mesh>
      {/* ceiling */}
      <mesh material={ceilMat} position={[0, WALL_HEIGHT + 0.5, 0]}>
        <boxGeometry args={[w, 1, d]} />
      </mesh>
      {/* walls with openings */}
      {walls.map((wall, wi) =>
        wallSegments(wall).map((seg, si) => {
          const pos: [number, number, number] = wall.horizontal
            ? [seg.center, seg.y, wall.center[2]]
            : [wall.center[0], seg.y, seg.center];
          const size: [number, number, number] = wall.horizontal
            ? [seg.width, seg.height, 1]
            : [1, seg.height, seg.width];
          if (seg.height < 0.05 || seg.width < 0.05) return null;
          return (
            <mesh
              key={`${wi}-${si}`}
              material={wallMat}
              position={pos}
              castShadow
              receiveShadow
            >
              <boxGeometry args={size} />
            </mesh>
          );
        })
      )}
    </RigidBody>
  );
}
