'use client';

// Post chain: N8AO ambient occlusion, bloom (energy channels / portal),
// ACES filmic tone mapping, subtle vignette + chromatic aberration.

import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  N8AO,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Vector2 } from 'three';
import { useGame } from '@/lib/store';

const CA_OFFSET = new Vector2(0.0005, 0.0005);

export default function PostFX() {
  const intensity = useGame((s) => s.spec?.effectIntensity ?? 0.5);
  const layer = useGame((s) => s.layer);
  const mixed = layer !== 'physical';

  // escape hatch for low-end GPUs / debugging: ?nofx disables the chain
  if (typeof window !== 'undefined' && window.location.search.includes('nofx'))
    return null;

  return (
    <EffectComposer multisampling={0}>
      <N8AO
        quality="performance"
        halfRes
        aoRadius={2}
        intensity={2.2}
        distanceFalloff={1}
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={0.85}
        luminanceSmoothing={0.2}
        intensity={mixed ? 0.5 + intensity * 0.7 : 0.15}
      />
      <ChromaticAberration
        offset={CA_OFFSET}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.22} darkness={0.65} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
