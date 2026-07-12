'use client';

// ---------------------------------------------------------------------------
// Procedural prop library. Each PropKind gets a real-scale build from
// primitives with themed PBR materials. A Higgsfield-generated GLB can
// replace any build via PropSpec.glbUrl.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { PropSpec, ThemePalette, Vec3 } from '@/lib/types';
import { useSurface } from './materials';
import { THEME_PATTERN } from './materials';
import type { TexPattern } from '@/lib/textures';

export interface PropContext {
  themeId: string;
  palette: ThemePalette;
  mixed: boolean;
}

interface BuildProps {
  spec: PropSpec;
  size: Vec3;
  ctx: PropContext;
  /** boosted when the prop is highlighted/aimed at */
  glow?: number;
}

function GlbProp({ spec, size }: { spec: PropSpec; size: Vec3 }) {
  const { scene } = useGLTF(spec.glbUrl!);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    // normalize to the authored footprint
    const box = new THREE.Box3().setFromObject(c);
    const dims = new THREE.Vector3();
    box.getSize(dims);
    const s =
      (spec.glbScale ?? 1) *
      Math.min(size[0] / dims.x, size[1] / dims.y, size[2] / dims.z);
    c.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(c);
    c.position.y -= box2.min.y; // feet on the floor
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return c;
  }, [scene, spec.glbScale, size]);
  return <primitive object={cloned} />;
}

/**
 * All positions are floor-anchored: the group's origin sits ON the floor at
 * the prop's position; builds extend upward from y=0.
 */
export default function Prop({ spec, size, ctx, glow = 0 }: BuildProps) {
  const pattern = (THEME_PATTERN[ctx.themeId] ?? 'stone') as TexPattern;
  const { palette, mixed } = ctx;
  const [w, h, d] = size;

  const body = useSurface({
    pattern,
    tint: palette.primary,
    mixed,
    emissive: glow > 0 ? palette.accent : palette.primary,
    emissiveIntensity: glow > 0 ? 0.25 + glow * 0.3 : 0.04,
    seed: 2,
  });
  const trim = useSurface({
    pattern: 'metal',
    tint: palette.accent,
    mixed,
    metalness: 0.7,
    roughBase: 0.35,
    emissive: palette.accent,
    emissiveIntensity: glow > 0 ? 0.5 : 0.12,
    seed: 3,
  });
  const wood = useSurface({ pattern: 'wood', tint: mixed ? '#7a5c38' : '#7a7468', mixed, seed: 4 });
  const glowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: palette.secondary,
        emissive: palette.secondary,
        emissiveIntensity: mixed ? 1.6 + glow : 0.1,
        toneMapped: false,
      }),
    [palette.secondary, mixed, glow]
  );

  if (spec.glbUrl) return <GlbProp spec={spec} size={size} />;

  switch (spec.kind) {
    case 'altar':
      return (
        <group>
          {/* stepped base */}
          <mesh material={body} castShadow receiveShadow position={[0, h * 0.13, 0]}>
            <boxGeometry args={[w, h * 0.26, d]} />
          </mesh>
          <mesh material={body} castShadow position={[0, h * 0.5, 0]}>
            <boxGeometry args={[w * 0.72, h * 0.5, d * 0.72]} />
          </mesh>
          {/* top slab */}
          <mesh material={trim} castShadow position={[0, h * 0.83, 0]}>
            <boxGeometry args={[w * 0.9, h * 0.14, d * 0.9]} />
          </mesh>
          {/* rune ring */}
          <mesh material={glowMat} position={[0, h * 0.91, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[w * 0.22, w * 0.28, 32]} />
          </mesh>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
            <mesh key={i} material={trim} castShadow position={[x * w * 0.4, h * 0.45, z * d * 0.4]}>
              <cylinderGeometry args={[0.12, 0.16, h * 0.9, 8]} />
            </mesh>
          ))}
        </group>
      );
    case 'console':
      return (
        <group>
          <mesh material={body} castShadow receiveShadow position={[0, h * 0.35, 0]}>
            <boxGeometry args={[w, h * 0.7, d]} />
          </mesh>
          {/* angled screen deck */}
          <mesh material={trim} castShadow position={[0, h * 0.78, -d * 0.05]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[w * 0.92, 0.16, d * 0.7]} />
          </mesh>
          <mesh material={glowMat} position={[0, h * 0.82, -d * 0.02]} rotation={[-0.5, 0, 0]}>
            <planeGeometry args={[w * 0.7, d * 0.4]} />
          </mesh>
        </group>
      );
    case 'cabinet':
      return (
        <group>
          <mesh material={body} castShadow receiveShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
          </mesh>
          {/* double doors + seam */}
          <mesh material={trim} position={[0, h * 0.5, 0]}>
            <boxGeometry args={[w * 1.02, h * 0.04, d * 1.02]} />
          </mesh>
          <mesh material={glowMat} position={[w > d ? 0 : w / 2 + 0.01, h * 0.5, w > d ? d / 2 + 0.01 : 0]}>
            <boxGeometry args={w > d ? [0.1, h * 0.8, 0.03] : [0.03, h * 0.8, 0.1]} />
          </mesh>
        </group>
      );
    case 'pedestal':
      return (
        <group>
          <mesh material={body} castShadow receiveShadow position={[0, h * 0.08, 0]}>
            <boxGeometry args={[w, h * 0.16, d]} />
          </mesh>
          <mesh material={body} castShadow position={[0, h * 0.5, 0]}>
            <cylinderGeometry args={[w * 0.3, w * 0.38, h * 0.75, 10]} />
          </mesh>
          <mesh material={trim} castShadow position={[0, h * 0.93, 0]}>
            <boxGeometry args={[w * 0.95, h * 0.12, d * 0.95]} />
          </mesh>
        </group>
      );
    case 'table':
      return (
        <group>
          <mesh material={wood} castShadow receiveShadow position={[0, h * 0.93, 0]}>
            <boxGeometry args={[w, h * 0.12, d]} />
          </mesh>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
            <mesh key={i} material={wood} castShadow position={[x * (w / 2 - 0.25), h * 0.44, z * (d / 2 - 0.25)]}>
              <boxGeometry args={[0.3, h * 0.88, 0.3]} />
            </mesh>
          ))}
        </group>
      );
    case 'crate':
      return (
        <group>
          <mesh material={wood} castShadow receiveShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
          </mesh>
          <mesh material={trim} position={[0, h / 2, 0]}>
            <boxGeometry args={[w * 1.03, h * 0.12, d * 1.03]} />
          </mesh>
        </group>
      );
    case 'barrel':
      return (
        <mesh material={wood} castShadow receiveShadow position={[0, h / 2, 0]}>
          <cylinderGeometry args={[w * 0.42, w * 0.48, h, 12]} />
        </mesh>
      );
    case 'shelf':
      return (
        <group>
          <mesh material={wood} castShadow receiveShadow position={[0, h / 2, -d * 0.35]}>
            <boxGeometry args={[w, h, d * 0.25]} />
          </mesh>
          {[0.25, 0.5, 0.75].map((f) => (
            <mesh key={f} material={wood} castShadow position={[0, h * f, 0]}>
              <boxGeometry args={[w, 0.15, d]} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={s} material={wood} castShadow position={[s * (w / 2 - 0.08), h / 2, 0]}>
              <boxGeometry args={[0.16, h, d]} />
            </mesh>
          ))}
        </group>
      );
    case 'gate':
      return (
        <group>
          <mesh material={body} castShadow receiveShadow position={[0, h * 0.06, 0]}>
            <boxGeometry args={[w, h * 0.12, d]} />
          </mesh>
          <mesh material={trim} castShadow position={[0, h * 0.55, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[h * 0.38, 0.25, 12, 40]} />
          </mesh>
          <mesh material={glowMat} position={[0, h * 0.55, 0]}>
            <circleGeometry args={[h * 0.32, 32]} />
          </mesh>
        </group>
      );
    case 'statue':
      return (
        <group>
          <mesh material={body} castShadow receiveShadow position={[0, h * 0.08, 0]}>
            <boxGeometry args={[w, h * 0.16, d]} />
          </mesh>
          <mesh material={body} castShadow position={[0, h * 0.5, 0]}>
            <cylinderGeometry args={[w * 0.18, w * 0.34, h * 0.72, 8]} />
          </mesh>
          <mesh material={body} castShadow position={[0, h * 0.9, 0]}>
            <sphereGeometry args={[w * 0.22, 12, 10]} />
          </mesh>
          <mesh material={glowMat} position={[0, h * 0.9, d * 0.14]}>
            <sphereGeometry args={[w * 0.06, 8, 8]} />
          </mesh>
        </group>
      );
    case 'brazier':
      return (
        <group>
          <mesh material={trim} castShadow position={[0, h * 0.4, 0]}>
            <cylinderGeometry args={[0.1, 0.14, h * 0.8, 8]} />
          </mesh>
          <mesh material={trim} castShadow position={[0, h * 0.85, 0]}>
            <cylinderGeometry args={[w * 0.45, w * 0.2, h * 0.3, 10]} />
          </mesh>
          <mesh material={glowMat} position={[0, h * 0.95, 0]}>
            <sphereGeometry args={[w * 0.3, 10, 8]} />
          </mesh>
          <pointLight
            color={ctx.palette.keyLight}
            intensity={ctx.mixed ? 6 : 0}
            distance={12}
            decay={1.9}
            position={[0, h * 1.1, 0]}
          />
        </group>
      );
    case 'panel':
      // wall-mounted: authored y is the CENTER height for panels
      return (
        <group>
          <mesh material={body} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
          </mesh>
          <mesh material={glowMat} position={[w > d ? 0 : d * 0 + w / 2 + 0.02, 0, w > d ? d / 2 + 0.02 : 0]} rotation={w > d ? [0, 0, 0] : [0, Math.PI / 2, 0]}>
            <planeGeometry args={[Math.max(w, d) * 0.85, h * 0.8]} />
          </mesh>
        </group>
      );
    case 'pipe':
      return (
        <mesh material={trim} castShadow position={[0, h / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[d / 2, d / 2, w, 10]} />
        </mesh>
      );
    case 'plant':
      return (
        <group>
          <mesh material={wood} castShadow position={[0, h * 0.15, 0]}>
            <cylinderGeometry args={[w * 0.3, w * 0.35, h * 0.3, 8]} />
          </mesh>
          <mesh castShadow position={[0, h * 0.65, 0]}>
            <coneGeometry args={[w * 0.45, h * 0.75, 8]} />
            <meshStandardMaterial color={mixed ? '#2f7a4a' : PHYSGREEN} roughness={0.9} />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh material={body} castShadow receiveShadow position={[0, h / 2, 0]}>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      );
  }
}

const PHYSGREEN = '#6e7378';
