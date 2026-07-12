'use client';

// ---------------------------------------------------------------------------
// Center-screen reticle logic: raycast forward from the camera, publish the
// best in-range target to the store (HUD renders the prompt), and handle
// E / click to interact while pointer-locked.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '@/lib/store';
import { findInteractRoot, interactables } from '@/lib/interact';
import { gateSatisfied } from '@/lib/spec';
import { sfx } from '@/lib/audio';

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);

function promptFor(
  kind: 'anchor' | 'door' | 'clue',
  id: string
): { prompt: string; locked: boolean } | null {
  const s = useGame.getState();
  if (!s.spec) return null;
  if (kind === 'anchor') {
    const a = s.spec.anchors[id];
    if (!a) return null;
    if (s.completedAnchors.includes(id))
      return { prompt: `${a.name} — solved`, locked: false };
    return { prompt: `Examine ${a.name}`, locked: false };
  }
  if (kind === 'door') {
    const d = s.spec.doors.find((x) => x.id === id);
    if (!d) return null;
    const open = gateSatisfied(
      d.resolvedGate,
      s.completedAnchors,
      s.spec.requiredAnchors
    );
    if (d.to === 'ESCAPE')
      return {
        prompt: open ? `Open ${d.name} — Escape` : `${d.name} — sealed`,
        locked: !open,
      };
    return {
      prompt: open ? `Open ${d.name}` : `${d.name} — locked`,
      locked: !open,
    };
  }
  // clue
  for (const room of s.spec.rooms) {
    const c = room.clueProps?.find((x) => x.id === id);
    if (c) return { prompt: `Inspect ${c.name}`, locked: false };
  }
  return null;
}

export default function Interactor() {
  const { camera, gl } = useThree();
  const frame = useRef(0);

  useFrame(() => {
    // every 3rd frame is plenty for a reticle
    if (++frame.current % 3 !== 0) return;
    const s = useGame.getState();
    if (
      s.view !== 'room' ||
      s.paused ||
      s.focusedAnchorId ||
      s.transition.active
    ) {
      if (s.aim) s.setAim(null);
      return;
    }
    raycaster.setFromCamera(CENTER, camera);
    raycaster.far = 12;
    const hits = raycaster.intersectObjects(Array.from(interactables), true);
    let target: ReturnType<typeof promptFor> & { kind?: string; id?: string } | null =
      null;
    let meta: { kind: 'anchor' | 'door' | 'clue'; id: string } | null = null;
    for (const hit of hits) {
      const root = findInteractRoot(hit.object);
      if (!root) continue;
      const m = root.userData.interact as {
        kind: 'anchor' | 'door' | 'clue';
        id: string;
        range: number;
      };
      if (hit.distance > m.range) break; // sorted by distance — done
      const p = promptFor(m.kind, m.id);
      if (p) {
        target = p;
        meta = m;
      }
      break; // nearest interactable wins, whether usable or not
    }
    if (target && meta) {
      s.setAim({
        kind: meta.kind,
        id: meta.id,
        prompt: target.prompt,
        locked: target.locked,
      });
    } else if (s.aim) {
      s.setAim(null);
    }
  });

  useEffect(() => {
    const interact = () => {
      const s = useGame.getState();
      if (
        s.view !== 'room' ||
        s.paused ||
        s.focusedAnchorId ||
        s.transition.active ||
        !s.aim
      )
        return;
      const { kind, id } = s.aim;
      if (kind === 'anchor') {
        if (!s.completedAnchors.includes(id)) sfx.open();
        s.focusAnchor(id);
      } else if (kind === 'door') {
        sfx.click();
        s.useDoor(id);
      } else {
        sfx.click();
        s.inspectClue(id);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') interact();
    };
    const onClick = () => {
      // clicks while pointer-locked are interactions
      if (document.pointerLockElement === gl.domElement) interact();
    };
    window.addEventListener('keydown', onKey);
    gl.domElement.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      gl.domElement.removeEventListener('click', onClick);
    };
  }, [gl]);

  return null;
}
