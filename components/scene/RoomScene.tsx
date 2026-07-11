'use client';

import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '@/lib/store';
import { ROOM_ASSETS, ROOM_SIZE, WALL_HEIGHT, getTheme } from '@/lib/data';
import type { RoomAsset } from '@/lib/types';
import { sfx } from '@/lib/audio';

// ---------------------------------------------------------------------------
// Physical-layer material palette (plain escape-room set)
// ---------------------------------------------------------------------------
const PHYS: Record<string, string> = {
  table: '#7a6a55',
  crate: '#8a7455',
  cabinet: '#5a5f66',
  door: '#6b7076',
  wallPanel: '#82878c',
  fan: '#4a4f55',
  mister: '#5f6468',
  ledStrip: '#3a3f45',
  speaker: '#2e3338',
  floor: '#565b60',
  wall: '#6e7378',
};

// ---------------------------------------------------------------------------
// Camera shake driven by store.shakeSignal
// ---------------------------------------------------------------------------
function CameraShake() {
  const shakeSignal = useGame((s) => s.shakeSignal);
  const last = useRef(shakeSignal);
  const energy = useRef(0);
  const { camera } = useThree();
  const base = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    if (last.current !== shakeSignal) {
      last.current = shakeSignal;
      energy.current = 1;
      base.current.copy(camera.position);
    }
    if (energy.current > 0.001) {
      const e = energy.current;
      camera.position.x += (Math.random() - 0.5) * 0.25 * e;
      camera.position.y += (Math.random() - 0.5) * 0.18 * e;
      energy.current = Math.max(0, e - dt * 2.2);
    }
  });
  return null;
}

// ---------------------------------------------------------------------------
// Scene atmosphere: fog + lights react to layer / theme / lighting effect
// ---------------------------------------------------------------------------
function Atmosphere() {
  const layer = useGame((s) => s.layer);
  const themeId = useGame((s) => s.themeId);
  const lightingOn = useGame((s) => s.effects.lighting);
  const theme = getTheme(themeId);
  const mixed = layer !== 'physical';

  const keyRef = useRef<THREE.PointLight>(null);
  const { scene } = useThree();

  useFrame(({ clock }) => {
    // Fog
    const fogColor = mixed ? theme.palette.fog : '#1a2026';
    if (!scene.fog) scene.fog = new THREE.FogExp2(fogColor, 0.001);
    const fog = scene.fog as THREE.FogExp2;
    fog.color.lerp(new THREE.Color(fogColor), 0.06);
    const targetDensity = mixed ? 0.028 : 0.006;
    fog.density += (targetDensity - fog.density) * 0.06;
    scene.background = fog.color;

    // Flicker on the key light when lighting effect is live in MR
    if (keyRef.current) {
      const t = clock.elapsedTime;
      const flicker =
        mixed && lightingOn
          ? 1 + Math.sin(t * 7.3) * 0.08 + Math.sin(t * 13.7) * 0.05
          : 1;
      keyRef.current.intensity =
        (mixed ? 90 : 140) * flicker;
      keyRef.current.color.lerp(
        new THREE.Color(mixed ? theme.palette.keyLight : '#ffffff'),
        0.08
      );
    }
  });

  return (
    <>
      <ambientLight intensity={mixed ? 0.25 : 0.7} />
      <pointLight
        ref={keyRef}
        position={[0, WALL_HEIGHT - 1.2, 0]}
        distance={45}
        decay={1.6}
      />
      <pointLight
        position={[0, 4, ROOM_SIZE / 2 - 1]}
        intensity={mixed ? 40 : 10}
        color={mixed ? theme.palette.accent : '#ffffff'}
        distance={20}
        decay={1.8}
      />
      <pointLight
        position={[-ROOM_SIZE / 2 + 2, 3, -ROOM_SIZE / 2 + 2]}
        intensity={mixed ? 25 : 0}
        color={theme.palette.fillLight}
        distance={18}
        decay={1.8}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Room shell: floor + four walls (gap for the door handled by the door asset)
// ---------------------------------------------------------------------------
function RoomShell() {
  const layer = useGame((s) => s.layer);
  const themeId = useGame((s) => s.themeId);
  const theme = getTheme(themeId);
  const mixed = layer !== 'physical';

  const floorColor = mixed ? theme.palette.floor : PHYS.floor;
  const wallColor = mixed ? theme.palette.wall : PHYS.wall;
  const half = ROOM_SIZE / 2;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={mixed ? 0.55 : 0.95}
          metalness={mixed ? 0.35 : 0}
        />
      </mesh>
      {/* Floor grid glow in MR */}
      {mixed && (
        <gridHelper
          args={[ROOM_SIZE, 10, theme.palette.secondary, theme.palette.primary]}
          position={[0, 0.02, 0]}
        />
      )}
      {/* Walls */}
      {[
        { pos: [0, WALL_HEIGHT / 2, -half] as const, size: [ROOM_SIZE, WALL_HEIGHT, 0.5] as const },
        { pos: [0, WALL_HEIGHT / 2, half] as const, size: [ROOM_SIZE, WALL_HEIGHT, 0.5] as const },
        { pos: [-half, WALL_HEIGHT / 2, 0] as const, size: [0.5, WALL_HEIGHT, ROOM_SIZE] as const },
        { pos: [half, WALL_HEIGHT / 2, 0] as const, size: [0.5, WALL_HEIGHT, ROOM_SIZE] as const },
      ].map((w, i) => (
        <mesh key={i} position={w.pos as unknown as [number, number, number]}>
          <boxGeometry args={w.size as unknown as [number, number, number]} />
          <meshStandardMaterial
            color={wallColor}
            roughness={0.9}
            metalness={mixed ? 0.2 : 0}
            emissive={mixed ? theme.palette.primary : '#000000'}
            emissiveIntensity={mixed ? 0.08 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Fan blades that spin when wind is on
// ---------------------------------------------------------------------------
function FanBlades({ on }: { on: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.x += (on ? 9 : 0.6) * dt;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.12, 1.35, 0.22]} />
        <meshStandardMaterial color="#9aa2a8" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.12, 1.35, 0.22]} />
        <meshStandardMaterial color="#9aa2a8" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Speaker audio pulse ring
// ---------------------------------------------------------------------------
function PulseRing({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime % 1.6) / 1.6;
    const s = 0.4 + t * 2.2;
    ref.current.scale.setScalar(s);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.55 * (1 - t);
  });
  return (
    <mesh ref={ref}>
      <ringGeometry args={[0.85, 1, 32]} />
      <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Portal glow inside the door frame (visible once session complete or in MR)
// ---------------------------------------------------------------------------
function PortalGlow({ active, color }: { active: boolean; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    const t = clock.elapsedTime;
    mat.opacity = active ? 0.55 + Math.sin(t * 3) * 0.2 : 0.12 + Math.sin(t * 1.5) * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.35]}>
      <planeGeometry args={[3.4, 6.9]} />
      <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// One asset: physical box vs themed MR treatment + mapping label
// ---------------------------------------------------------------------------
function Asset({ asset }: { asset: RoomAsset }) {
  const layer = useGame((s) => s.layer);
  const themeId = useGame((s) => s.themeId);
  const effects = useGame((s) => s.effects);
  const completed = useGame((s) => s.completedPuzzles);
  const openPuzzle = useGame((s) => s.openPuzzle);
  const inspectCrate = useGame((s) => s.inspectCrate);
  const sessionComplete = useGame((s) => s.sessionComplete);
  const [hovered, setHovered] = useState(false);

  const theme = getTheme(themeId);
  const mixed = layer !== 'physical';
  const mapping = layer === 'mapping';

  const interactive =
    asset.puzzleId !== undefined || asset.physicalType === 'crate';
  const isDone = asset.puzzleId ? completed.includes(asset.puzzleId) : false;

  const baseColor = mixed
    ? asset.physicalType === 'ledStrip'
      ? theme.palette.secondary
      : asset.physicalType === 'table' || asset.physicalType === 'door'
        ? theme.palette.primary
        : asset.physicalType === 'crate' || asset.physicalType === 'cabinet'
          ? theme.palette.accent
          : theme.palette.primary
    : PHYS[asset.physicalType];

  const emissive = mixed
    ? isDone || asset.physicalType === 'ledStrip'
      ? theme.palette.secondary
      : hovered && interactive
        ? theme.palette.accent
        : theme.palette.primary
    : hovered && interactive
      ? '#ffffff'
      : '#000000';

  const emissiveIntensity = mixed
    ? asset.physicalType === 'ledStrip'
      ? effects.lighting
        ? 1.6
        : 0.3
      : isDone
        ? 0.9
        : hovered && interactive
          ? 0.7
          : 0.25
    : hovered && interactive
      ? 0.15
      : 0;

  const twin = theme.twins[asset.physicalType];

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (asset.puzzleId) {
      sfx.open();
      openPuzzle(asset.puzzleId);
    } else if (asset.physicalType === 'crate') {
      sfx.click();
      inspectCrate(mixed ? twin : asset.name);
    }
  };

  return (
    <group
      position={asset.position}
      rotation={[0, asset.rotationY ?? 0, 0]}
    >
      <mesh
        onClick={interactive ? handleClick : undefined}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={asset.size} />
        <meshStandardMaterial
          color={baseColor}
          roughness={mixed ? 0.4 : 0.85}
          metalness={mixed ? 0.5 : 0.05}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Fans get spinning blades */}
      {asset.physicalType === 'fan' && (
        <group position={[asset.position[0] > 0 ? -0.7 : 0.7, 0, 0]}>
          <FanBlades on={effects.wind && mixed} />
        </group>
      )}

      {/* Speakers pulse when audio effect live in MR */}
      {asset.physicalType === 'speaker' && mixed && effects.audio && (
        <group rotation={[0, 0, 0]}>
          <PulseRing color={theme.palette.secondary} />
        </group>
      )}

      {/* Door portal glow in MR */}
      {asset.physicalType === 'door' && mixed && (
        <PortalGlow
          active={isDone || sessionComplete}
          color={theme.palette.secondary}
        />
      )}

      {/* Completed seal marker */}
      {isDone && mixed && (
        <mesh position={[0, asset.size[1] / 2 + 0.9, 0]}>
          <octahedronGeometry args={[0.35]} />
          <meshStandardMaterial
            color={theme.palette.accent}
            emissive={theme.palette.accent}
            emissiveIntensity={1.4}
          />
        </mesh>
      )}

      {/* Mapping overlay label */}
      {mapping && (
        <Html
          position={[0, asset.size[1] / 2 + 0.6, 0]}
          center
          distanceFactor={16}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[10, 0]}
        >
          <div className="holo min-w-[200px] max-w-[240px] border-teal/30 px-3 py-2 text-left">
            <div className="font-hud text-[0.6rem] tracking-[0.15em] uppercase text-mist/50">
              {asset.name}
            </div>
            <div className="font-display text-[0.8rem] leading-tight text-teal-glow">
              {twin}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-2 font-hud text-[0.58rem] text-gold/90">
              <span>{asset.interactionType}</span>
              {asset.linkedEffect && (
                <span className="text-mist/60">
                  ↳ {asset.linkedEffect} effect
                </span>
              )}
            </div>
          </div>
        </Html>
      )}

      {/* Hover name tag in MR / physical */}
      {hovered && interactive && !mapping && (
        <Html
          position={[0, asset.size[1] / 2 + 0.7, 0]}
          center
          distanceFactor={14}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[10, 0]}
        >
          <div className="whitespace-nowrap border border-teal/40 bg-abyss/85 px-3 py-1.5 font-hud text-[0.7rem] tracking-[0.12em] uppercase text-teal-glow">
            {mixed ? twin : asset.name}
            {asset.puzzleId && !isDone && (
              <span className="ml-2 text-gold">● click</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Mist particles rising from the two mist emitters
// ---------------------------------------------------------------------------
function MistParticles() {
  const layer = useGame((s) => s.layer);
  const on = useGame((s) => s.effects.mist);
  const ref = useRef<THREE.Points>(null);

  const { positions, seeds } = useMemo(() => {
    const count = 260;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const emitters = [
      [-8.6, 8.6],
      [8.8, -8.8],
    ];
    for (let i = 0; i < count; i++) {
      const [ex, ez] = emitters[i % 2];
      pos[i * 3] = ex + (Math.random() - 0.5) * 2.4;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = ez + (Math.random() - 0.5) * 2.4;
      seed[i] = Math.random();
    }
    return { positions: pos, seeds: seed };
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const visible = on && layer !== 'physical';
    ref.current.visible = visible;
    if (!visible) return;
    const arr = ref.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3 + 1] += (0.5 + seeds[i]) * dt;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] + seeds[i] * 10) * dt * 0.25;
      if (arr[i * 3 + 1] > 6.5) arr[i * 3 + 1] = 0.2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#bfe8ea"
        size={0.35}
        transparent
        opacity={0.28}
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Wind streaks flowing across the room when wind effect is live
// ---------------------------------------------------------------------------
function WindStreaks() {
  const layer = useGame((s) => s.layer);
  const on = useGame((s) => s.effects.wind);
  const themeId = useGame((s) => s.themeId);
  const theme = getTheme(themeId);
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 140;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 19;
      pos[i * 3 + 1] = 1 + Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 19;
    }
    return pos;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const visible = on && layer !== 'physical';
    ref.current.visible = visible;
    if (!visible) return;
    const arr = ref.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3] += dt * 7;
      arr[i * 3 + 2] += Math.sin(arr[i * 3] * 0.4) * dt * 1.2;
      if (arr[i * 3] > 9.5) arr[i * 3] = -9.5;
      if (arr[i * 3 + 2] > 9.5) arr[i * 3 + 2] = -9.5;
      if (arr[i * 3 + 2] < -9.5) arr[i * 3 + 2] = 9.5;
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
        size={0.14}
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Canvas wrapper
// ---------------------------------------------------------------------------
export default function RoomScene() {
  return (
    <Canvas
      camera={{ position: [14, 11, 16], fov: 48 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
    >
      <Atmosphere />
      <CameraShake />
      <RoomShell />
      {ROOM_ASSETS.map((a) => (
        <Asset key={a.id} asset={a} />
      ))}
      <MistParticles />
      <WindStreaks />
      <OrbitControls
        target={[0, 3, 0]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={6}
        maxDistance={34}
        enablePan={false}
      />
    </Canvas>
  );
}
