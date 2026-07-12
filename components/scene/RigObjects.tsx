'use client';

// ---------------------------------------------------------------------------
// Fixed-layer effects hardware: fans, misters, LED channels, speakers.
// Same physical units in every theme — only the digital twin changes.
// Includes the particle systems the rig drives (mist, wind) and positional
// ambient audio bound to the speaker corners.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// soft round sprite so particles don't render as hard squares
let particleSprite: THREE.Texture | null = null;
function getParticleSprite(): THREE.Texture | null {
  if (typeof document === 'undefined') return null;
  if (particleSprite) return particleSprite;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  particleSprite = new THREE.CanvasTexture(c);
  return particleSprite;
}
import type { ChamberId, RigUnit, Theme } from '@/lib/types';
import { CHAMBERS, rigForChamber } from '@/lib/facility';
import { useGame } from '@/lib/store';
import { startAmbience, type AmbienceHandle } from '@/lib/ambience';

const RIG_COLOR = '#3f444a';

function FanUnit({ unit, theme, mixed }: { unit: RigUnit; theme: Theme; mixed: boolean }) {
  const blades = useRef<THREE.Group>(null);
  const windOn = useGame((s) => s.effects.wind);
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += (windOn ? 10 : 0.5) * dt;
  });
  const inward = unit.position[0] > 0 ? -1 : 1;
  return (
    <group position={unit.position} rotation={[0, (inward * Math.PI) / 2, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.5, 16]} />
        <meshStandardMaterial color={RIG_COLOR} metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={blades} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} rotation={[0, 0, r]}>
            <boxGeometry args={[0.14, 1.4, 0.1]} />
            <meshStandardMaterial color="#9aa2a8" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
      {mixed && windOn && (
        <pointLight color={theme.palette.secondary} intensity={1.5} distance={5} />
      )}
    </group>
  );
}

function LedStrip({ unit, theme, mixed }: { unit: RigUnit; theme: Theme; mixed: boolean }) {
  const on = useGame((s) => s.effects.lighting);
  const ref = useRef<THREE.Mesh>(null);
  const intensity = useGame((s) => s.spec?.effectIntensity ?? 0.5);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    const t = clock.elapsedTime;
    m.emissiveIntensity =
      mixed && on
        ? (1.1 + Math.sin(t * 2.4 + unit.position[0]) * 0.5) * (0.5 + intensity)
        : 0.08;
  });
  return (
    <mesh ref={ref} position={unit.position}>
      <boxGeometry args={unit.size} />
      <meshStandardMaterial
        color={mixed ? theme.palette.secondary : '#2a2f34'}
        emissive={mixed ? theme.palette.secondary : '#111111'}
        emissiveIntensity={0.4}
        toneMapped={false}
      />
    </mesh>
  );
}

function SpeakerUnit({ unit, theme, mixed }: { unit: RigUnit; theme: Theme; mixed: boolean }) {
  const on = useGame((s) => s.effects.audio);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.elapsedTime % 1.6) / 1.6;
    ring.current.visible = mixed && on;
    ring.current.scale.setScalar(0.4 + t * 1.8);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - t);
  });
  return (
    <group position={unit.position}>
      <mesh castShadow>
        <boxGeometry args={unit.size} />
        <meshStandardMaterial color="#2e3338" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <ringGeometry args={[0.8, 0.92, 24]} />
        <meshBasicMaterial color={theme.palette.secondary} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function MisterUnit({ unit }: { unit: RigUnit }) {
  return (
    <mesh position={unit.position} castShadow>
      <cylinderGeometry args={[0.4, 0.5, 1, 10]} />
      <meshStandardMaterial color={RIG_COLOR} metalness={0.4} roughness={0.6} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Particles driven by the rig
// ---------------------------------------------------------------------------

function MistParticles({ chamber, mixed }: { chamber: ChamberId; mixed: boolean }) {
  const on = useGame((s) => s.effects.mist);
  const intensity = useGame((s) => s.spec?.effectIntensity ?? 0.5);
  const ref = useRef<THREE.Points>(null);
  const { size } = CHAMBERS[chamber];

  const { positions, seeds, emitters } = useMemo(() => {
    const count = 240;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const em: [number, number][] = [
      [-size[0] / 2 + 1.4, size[1] / 2 - 1.4],
      [size[0] / 2 - 1.4, -size[1] / 2 + 1.4],
    ];
    for (let i = 0; i < count; i++) {
      const [ex, ez] = em[i % 2];
      pos[i * 3] = ex + (Math.random() - 0.5) * 2.4;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = ez + (Math.random() - 0.5) * 2.4;
      seed[i] = Math.random();
    }
    return { positions: pos, seeds: seed, emitters: em };
  }, [size]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const visible = on && mixed;
    ref.current.visible = visible;
    if (!visible) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3 + 1] += (0.5 + seeds[i]) * dt;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] + seeds[i] * 10) * dt * 0.25;
      if (arr[i * 3 + 1] > 6.5) {
        const [ex, ez] = emitters[i % 2];
        arr[i * 3] = ex + (Math.random() - 0.5) * 2.4;
        arr[i * 3 + 1] = 0.2;
        arr[i * 3 + 2] = ez + (Math.random() - 0.5) * 2.4;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#bfe8ea"
        size={0.45}
        map={getParticleSprite()}
        alphaMap={getParticleSprite()}
        transparent
        opacity={0.14 + intensity * 0.18}
        depthWrite={false}
      />
    </points>
  );
}

function WindStreaks({ chamber, theme, mixed }: { chamber: ChamberId; theme: Theme; mixed: boolean }) {
  const on = useGame((s) => s.effects.wind);
  const intensity = useGame((s) => s.spec?.effectIntensity ?? 0.5);
  const ref = useRef<THREE.Points>(null);
  const { size } = CHAMBERS[chamber];
  const hx = size[0] / 2 - 0.5;
  const hz = size[1] / 2 - 0.5;

  const positions = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * hx * 2;
      pos[i * 3 + 1] = 1 + Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * hz * 2;
    }
    return pos;
  }, [hx, hz]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const visible = on && mixed;
    ref.current.visible = visible;
    if (!visible) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const speed = 5 + intensity * 5;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3] += dt * speed;
      arr[i * 3 + 2] += Math.sin(arr[i * 3] * 0.4) * dt * 1.2;
      if (arr[i * 3] > hx) arr[i * 3] = -hx;
      if (arr[i * 3 + 2] > hz) arr[i * 3 + 2] = -hz;
      if (arr[i * 3 + 2] < -hz) arr[i * 3 + 2] = hz;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={theme.palette.secondary}
        size={0.18}
        map={getParticleSprite()}
        alphaMap={getParticleSprite()}
        transparent
        opacity={0.3 + intensity * 0.3}
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Ambient audio, two tiers:
//   1. If public/audio/<theme>-ambient.mp3 exists, it plays as positional
//      audio at the speaker corners (pans as the player walks).
//   2. Otherwise the procedural ambience engine (lib/ambience.ts) synthesizes
//      a themed background bed — no files, no licensing, works offline.
// ---------------------------------------------------------------------------

function AmbientAudio({ theme, units }: { theme: Theme; units: RigUnit[] }) {
  const { camera } = useThree();
  const on = useGame((s) => s.effects.audio);
  const intensity = useGame((s) => s.spec?.effectIntensity ?? 0.5);
  const nodes = useRef<THREE.PositionalAudio[]>([]);
  const synth = useRef<AmbienceHandle | null>(null);
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!group.current) return;
    if (!theme.ambientAudio) {
      synth.current = startAmbience(theme.id);
      return () => {
        synth.current?.stop();
        synth.current = null;
      };
    }
    let listener = camera.children.find(
      (c) => c instanceof THREE.AudioListener
    ) as THREE.AudioListener | undefined;
    if (!listener) {
      listener = new THREE.AudioListener();
      camera.add(listener);
    }
    const loader = new THREE.AudioLoader();
    let disposed = false;
    const speakers = units.filter((u) => u.type === 'speaker').slice(0, 2);
    loader.load(
      theme.ambientAudio,
      (buffer) => {
        if (disposed || !group.current) return;
        for (const sp of speakers) {
          const a = new THREE.PositionalAudio(listener!);
          a.setBuffer(buffer);
          a.setLoop(true);
          a.setRefDistance(8);
          a.setMaxDistance(40);
          a.position.set(...sp.position);
          try {
            a.play();
          } catch {
            /* autoplay blocked until gesture — fine */
          }
          group.current.add(a);
          nodes.current.push(a);
        }
      },
      undefined,
      () => {
        // file missing → fall back to the procedural bed
        if (!disposed) synth.current = startAmbience(theme.id);
      }
    );
    return () => {
      disposed = true;
      nodes.current.forEach((a) => {
        try {
          a.stop();
        } catch {
          /* noop */
        }
        a.removeFromParent();
      });
      nodes.current = [];
      synth.current?.stop();
      synth.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.ambientAudio, theme.id, camera, units]);

  useEffect(() => {
    const vol = on ? 0.25 + intensity * 0.55 : 0;
    nodes.current.forEach((a) => a.setVolume(vol));
    synth.current?.setVolume(on ? 0.35 + intensity * 0.4 : 0);
  }, [on, intensity]);

  return <group ref={group} />;
}

// ---------------------------------------------------------------------------

export default function Rig({
  chamber,
  theme,
  mixed,
}: {
  chamber: ChamberId;
  theme: Theme;
  mixed: boolean;
}) {
  const layer = useGame((s) => s.layer);
  const units = useMemo(() => rigForChamber(chamber), [chamber]);

  return (
    <group>
      {units.map((u) => {
        const el =
          u.type === 'fan' ? (
            <FanUnit key={u.id} unit={u} theme={theme} mixed={mixed} />
          ) : u.type === 'ledStrip' ? (
            <LedStrip key={u.id} unit={u} theme={theme} mixed={mixed} />
          ) : u.type === 'speaker' ? (
            <SpeakerUnit key={u.id} unit={u} theme={theme} mixed={mixed} />
          ) : (
            <MisterUnit key={u.id} unit={u} />
          );
        return el;
      })}
      {/* mapping layer: digital-twin labels on rig hardware */}
      {layer === 'mapping' &&
        units
          .filter((u) => u.type !== 'ledStrip')
          .map((u) => (
            <Html
              key={`${u.id}-label`}
              position={[u.position[0], u.position[1] + 1.2, u.position[2]]}
              center
              distanceFactor={16}
              style={{ pointerEvents: 'none' }}
              zIndexRange={[10, 0]}
            >
              <div className="holo whitespace-nowrap border-teal/25 px-2 py-1 font-hud text-[0.55rem] uppercase tracking-[0.12em] text-mist/60">
                {u.type} → <span className="text-teal-glow">{theme.twins[u.type] ?? u.type}</span>
              </div>
            </Html>
          ))}
      <MistParticles chamber={chamber} mixed={mixed} />
      <WindStreaks chamber={chamber} theme={theme} mixed={mixed} />
      <AmbientAudio theme={theme} units={units} />
    </group>
  );
}
