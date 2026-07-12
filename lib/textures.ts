'use client';

// ---------------------------------------------------------------------------
// Procedural PBR texture factory. Generates tiling albedo / normal /
// roughness maps on a canvas at runtime — real material response without
// shipping (or fetching) texture binaries. Cached per pattern+tint.
// ---------------------------------------------------------------------------

import * as THREE from 'three';

export type TexPattern = 'stone' | 'wood' | 'metal' | 'panel' | 'plaster';

export interface PBRMaps {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

const SIZE = 256;
const cache = new Map<string, PBRMaps>();

// Deterministic pseudo-random (stable across sessions, resume-safe)
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tileable value noise via a wrapped lattice. */
function makeNoise(seed: number, cells: number) {
  const rand = mulberry(seed);
  const lattice = new Float32Array(cells * cells);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
  const at = (x: number, y: number) =>
    lattice[((y % cells) + cells) % cells * cells + (((x % cells) + cells) % cells)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    const x = u * cells;
    const y = v * cells;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = smooth(x - x0);
    const fy = smooth(y - y0);
    const a = at(x0, y0);
    const b = at(x0 + 1, y0);
    const c = at(x0, y0 + 1);
    const d = at(x0 + 1, y0 + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

/** fBm stack of tileable noise octaves. */
function fbm(seed: number, octaves: number) {
  const layers = Array.from({ length: octaves }, (_, i) =>
    makeNoise(seed + i * 101, 4 << i)
  );
  return (u: number, v: number) => {
    let sum = 0;
    let amp = 1;
    let total = 0;
    for (let i = 0; i < layers.length; i++) {
      sum += layers[i](u, v) * amp;
      total += amp;
      amp *= 0.55;
    }
    return sum / total;
  };
}

/** Height field per pattern, 0..1. */
function heightField(pattern: TexPattern, seed: number) {
  const noise = fbm(seed, 4);
  const fine = makeNoise(seed + 777, 64);
  switch (pattern) {
    case 'stone':
      return (u: number, v: number) => {
        // large blocks with mortar lines + surface noise
        const bx = u * 4;
        const by = v * 4;
        const row = Math.floor(by);
        const off = (row % 2) * 0.5;
        const fx = (bx + off) % 1;
        const fy = by % 1;
        const edge = Math.min(fx, 1 - fx, fy, 1 - fy);
        const mortar = Math.min(1, edge * 14);
        return 0.25 + 0.55 * noise(u, v) * mortar + 0.1 * fine(u, v);
      };
    case 'wood':
      return (u: number, v: number) => {
        const plank = Math.floor(v * 6);
        const gap = Math.abs((v * 6) % 1 - 0.5) > 0.47 ? 0 : 1;
        const grain =
          0.5 + 0.5 * Math.sin((u * 14 + noise(u, v * 0.4 + plank * 0.13) * 6) * Math.PI);
        return (0.3 + 0.45 * grain + 0.15 * fine(u, v)) * gap;
      };
    case 'metal':
      return (u: number, v: number) =>
        0.5 + 0.06 * Math.sin(u * 400) + 0.12 * fine(u, v) + 0.2 * noise(u, v);
    case 'panel':
      return (u: number, v: number) => {
        const gx = Math.abs((u * 3) % 1 - 0.5);
        const gy = Math.abs((v * 3) % 1 - 0.5);
        const line = gx > 0.47 || gy > 0.47 ? 0.15 : 1;
        return (0.45 + 0.15 * noise(u, v) + 0.05 * fine(u, v)) * line;
      };
    case 'plaster':
    default:
      return (u: number, v: number) => 0.4 + 0.45 * noise(u, v) + 0.1 * fine(u, v);
  }
}

function toTexture(canvas: HTMLCanvasElement, colorSpace = false): THREE.Texture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (colorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function getPBR(
  pattern: TexPattern,
  tint: string,
  opts?: { repeat?: [number, number]; roughBase?: number; seed?: number }
): PBRMaps {
  // repeat is part of the key: textures are shared objects, so consumers
  // with different tiling must not mutate each other's repeat settings
  const key = `${pattern}:${tint}:${opts?.roughBase ?? ''}:${opts?.seed ?? 0}:${
    opts?.repeat?.join('x') ?? '1x1'
  }`;
  const cached = cache.get(key);
  if (cached) return cached;

  const h = new Float32Array(SIZE * SIZE);
  const field = heightField(pattern, (opts?.seed ?? 1) * 7919 + pattern.length);
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      h[y * SIZE + x] = field(x / SIZE, y / SIZE);

  const color = new THREE.Color(tint);
  const roughBase =
    opts?.roughBase ?? (pattern === 'metal' ? 0.35 : pattern === 'wood' ? 0.7 : 0.85);

  // Albedo: tint modulated by height
  const cAlbedo = document.createElement('canvas');
  cAlbedo.width = cAlbedo.height = SIZE;
  const aCtx = cAlbedo.getContext('2d')!;
  const aImg = aCtx.createImageData(SIZE, SIZE);
  // Roughness (in green channel per glTF convention — MeshStandardMaterial
  // reads roughnessMap.g)
  const cRough = document.createElement('canvas');
  cRough.width = cRough.height = SIZE;
  const rCtx = cRough.getContext('2d')!;
  const rImg = rCtx.createImageData(SIZE, SIZE);
  // Normal from height via Sobel
  const cNorm = document.createElement('canvas');
  cNorm.width = cNorm.height = SIZE;
  const nCtx = cNorm.getContext('2d')!;
  const nImg = nCtx.createImageData(SIZE, SIZE);

  const at = (x: number, y: number) =>
    h[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)];
  const strength = pattern === 'metal' ? 1.2 : 2.6;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      const v = at(x, y);
      const shade = 0.55 + v * 0.55;
      aImg.data[i] = Math.min(255, color.r * 255 * shade);
      aImg.data[i + 1] = Math.min(255, color.g * 255 * shade);
      aImg.data[i + 2] = Math.min(255, color.b * 255 * shade);
      aImg.data[i + 3] = 255;

      const rough = Math.max(0.1, Math.min(1, roughBase + (1 - v) * 0.25));
      rImg.data[i] = rImg.data[i + 1] = rImg.data[i + 2] = rough * 255;
      rImg.data[i + 3] = 255;

      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      nImg.data[i] = (-dx * inv * 0.5 + 0.5) * 255;
      nImg.data[i + 1] = (-dy * inv * 0.5 + 0.5) * 255;
      nImg.data[i + 2] = inv * 255;
      nImg.data[i + 3] = 255;
    }
  }
  aCtx.putImageData(aImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);
  nCtx.putImageData(nImg, 0, 0);

  const maps: PBRMaps = {
    map: toTexture(cAlbedo, true),
    normalMap: toTexture(cNorm),
    roughnessMap: toTexture(cRough),
  };
  if (opts?.repeat) {
    for (const t of [maps.map, maps.normalMap, maps.roughnessMap]) {
      t.repeat.set(opts.repeat[0], opts.repeat[1]);
    }
  }
  cache.set(key, maps);
  return maps;
}
