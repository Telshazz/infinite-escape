'use client';

// Themed PBR material selection. Every theme maps to a base texture pattern;
// the PHYSICAL layer swaps all of it for the plain warehouse-gray set.

import { useMemo } from 'react';
import * as THREE from 'three';
import { getPBR, type TexPattern } from '@/lib/textures';

export const THEME_PATTERN: Record<string, TexPattern> = {
  atlantis: 'stone',
  pirate: 'wood',
  zombie: 'metal',
  wonderland: 'plaster',
  space: 'metal',
  castle: 'stone',
  corporate: 'panel',
};

export const PHYS: Record<string, string> = {
  prop: '#7a7468',
  floor: '#565b60',
  wall: '#6e7378',
  rig: '#4a4f55',
};

export interface SurfaceOpts {
  pattern: TexPattern;
  tint: string;
  mixed: boolean; // false = physical layer
  repeat?: [number, number];
  roughBase?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  seed?: number;
}

/** Memoized MeshStandardMaterial with procedural PBR maps. */
export function useSurface(o: SurfaceOpts): THREE.MeshStandardMaterial {
  return useMemo(() => {
    const pattern = o.mixed ? o.pattern : 'plaster';
    const tint = o.mixed ? o.tint : PHYS.prop;
    const maps = getPBR(pattern, tint, {
      repeat: o.repeat,
      roughBase: o.roughBase,
      seed: o.seed,
    });
    return new THREE.MeshStandardMaterial({
      map: maps.map,
      normalMap: maps.normalMap,
      roughnessMap: maps.roughnessMap,
      metalness: o.mixed ? (o.metalness ?? (pattern === 'metal' ? 0.55 : 0.05)) : 0,
      emissive: new THREE.Color(o.mixed ? (o.emissive ?? '#000000') : '#000000'),
      emissiveIntensity: o.mixed ? (o.emissiveIntensity ?? 0) : 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    o.pattern,
    o.tint,
    o.mixed,
    o.repeat?.[0],
    o.repeat?.[1],
    o.roughBase,
    o.metalness,
    o.emissive,
    o.emissiveIntensity,
    o.seed,
  ]);
}
