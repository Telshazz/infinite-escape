'use client';

// ---------------------------------------------------------------------------
// One mounted room = shell + rig (fixed layer) + anchors, clue props,
// set pieces, doors (swappable layer). Only ever one instance in the tree —
// the room graph is walked by swapping this component's room prop.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import type { Theme, ThemeRoom } from '@/lib/types';
import type { SessionSpec } from '@/lib/types';
import { DOORWAYS } from '@/lib/facility';
import { useGame } from '@/lib/store';
import RoomShell from './RoomShell';
import Rig from './RigObjects';
import Prop from './Props';
import { AnchorObject } from './AnchorObject';
import { ClueObject } from './ClueObject';
import { DoorObject, SealedDoorway } from './DoorObject';
import Atmosphere from './Atmosphere';

export default function Room({
  room,
  theme,
  spec,
}: {
  room: ThemeRoom;
  theme: Theme;
  spec: SessionSpec;
}) {
  const layer = useGame((s) => s.layer);
  const mixed = layer !== 'physical';
  const palette = theme.palette;

  // Anchors that actually spawned this session, in this room
  const anchors = useMemo(
    () =>
      Object.values(spec.anchors).filter((a) => a.roomId === room.id),
    [spec, room.id]
  );

  // Clue props: only if their target anchor spawned (or untargeted)
  const clues = useMemo(
    () =>
      (room.clueProps ?? []).filter(
        (c) => !c.forAnchor || spec.anchors[c.forAnchor]
      ),
    [room.clueProps, spec]
  );

  // Doorway sides opening into this chamber: live doors vs sealed panels
  const doorways = useMemo(() => {
    const out: {
      side: (typeof DOORWAYS)[number]['sides'][number];
      doorwayId: string;
      door: SessionSpec['doors'][number] | null;
    }[] = [];
    for (const dw of DOORWAYS) {
      for (const side of dw.sides) {
        if (side.chamber !== room.chamber) continue;
        const door =
          spec.doors.find(
            (d) =>
              d.doorway === dw.id && (d.from === room.id || d.to === room.id)
          ) ?? null;
        out.push({ side, doorwayId: dw.id, door });
      }
    }
    return out;
  }, [room.chamber, room.id, spec]);

  return (
    <group>
      <Atmosphere chamber={room.chamber} theme={theme} />
      <RoomShell
        chamber={room.chamber}
        themeId={theme.id}
        palette={palette}
        mixed={mixed}
      />
      <Rig chamber={room.chamber} theme={theme} mixed={mixed} />

      {doorways.map(({ side, doorwayId, door }) =>
        door ? (
          <DoorObject
            key={door.id}
            door={door}
            side={side}
            palette={palette}
            mixed={mixed}
          />
        ) : (
          <SealedDoorway
            key={doorwayId}
            side={side}
            doorwayId={doorwayId}
            palette={palette}
            mixed={mixed}
            label={
              doorwayId.startsWith('ENTRY')
                ? 'Entry (staff)'
                : theme.twins.door ?? 'Sealed Passage'
            }
          />
        )
      )}

      {anchors.map((a) => (
        <AnchorObject
          key={a.id}
          anchor={a}
          themeId={theme.id}
          palette={palette}
          mixed={mixed}
        />
      ))}

      {clues.map((c) => (
        <ClueObject
          key={c.id}
          clue={c}
          themeId={theme.id}
          palette={palette}
          mixed={mixed}
        />
      ))}

      {(room.setPieces ?? []).map((p, i) => (
        <group
          key={i}
          position={[p.position[0], p.prop.kind === 'panel' ? p.position[1] : 0, p.position[2]]}
          rotation={[0, p.rotationY ?? 0, 0]}
        >
          <RigidBody type="fixed" colliders="cuboid">
            <Prop
              spec={p.prop}
              size={p.size}
              ctx={{ themeId: theme.id, palette, mixed }}
            />
          </RigidBody>
        </group>
      ))}
    </group>
  );
}
