'use client';

// Registry of interactable Object3Ds for the center-reticle raycaster.
// Scene objects register themselves with metadata; the Interactor raycasts
// against exactly this set every few frames.

import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import type * as THREE from 'three';

export interface InteractMeta {
  kind: 'anchor' | 'door' | 'clue';
  id: string;
  /** interaction reach in feet */
  range: number;
}

export const interactables = new Set<THREE.Object3D>();

export function useInteractable(
  ref: MutableRefObject<THREE.Object3D | null>,
  meta: InteractMeta
) {
  useEffect(() => {
    const obj = ref.current;
    if (!obj) return;
    obj.userData.interact = meta;
    interactables.add(obj);
    return () => {
      interactables.delete(obj);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, meta.id, meta.kind, meta.range]);
}

/** Walk up the parent chain to the registered interactable root. */
export function findInteractRoot(
  obj: THREE.Object3D | null
): THREE.Object3D | null {
  let cur = obj;
  while (cur) {
    if (cur.userData.interact) return cur;
    cur = cur.parent;
  }
  return null;
}
