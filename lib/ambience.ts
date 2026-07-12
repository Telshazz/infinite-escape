'use client';

// ---------------------------------------------------------------------------
// Procedural ambience engine — synthesized WebAudio background beds, one
// recipe per theme. Zero audio files, zero licensing, works offline.
//
// This is the automatic FALLBACK: RigObjects first tries the theme's
// ambientAudio file (public/audio/<theme>-ambient.mp3, positional); when
// that file is missing it starts one of these beds instead. Drop real
// recordings into public/audio/ and they win automatically.
//
// Each bed = a looped filtered-noise wash + two slow-breathing detuned
// drones + sparse randomized "events" (bubbles, creaks, chimes…).
// ---------------------------------------------------------------------------

import { getAudioContext } from './audio';

export interface AmbienceHandle {
  setVolume: (v: number) => void;
  stop: () => void;
}

type EventKind =
  | 'bubbles' // rising sine blips (Atlantis)
  | 'creaks' // pitch-bent groans (Pirate hull)
  | 'moans' // low distant glides (Zombie)
  | 'chimes' // pentatonic plucks (Wonderland)
  | 'beeps' // soft telemetry pings (Space / Corporate)
  | 'gusts'; // filtered noise swells (Castle drafts)

interface Recipe {
  drone: number; // fundamental Hz
  drone2?: number; // second voice Hz
  cutoff: number; // noise lowpass Hz
  noise: number; // noise level 0..1 (relative)
  event: EventKind;
  /** average seconds between events */
  rate: number;
}

const RECIPES: Record<string, Recipe> = {
  atlantis: { drone: 55, drone2: 82.4, cutoff: 360, noise: 0.55, event: 'bubbles', rate: 6 },
  pirate: { drone: 49, drone2: 73.4, cutoff: 520, noise: 0.6, event: 'creaks', rate: 9 },
  zombie: { drone: 41.2, cutoff: 280, noise: 0.45, event: 'moans', rate: 13 },
  wonderland: { drone: 65.4, drone2: 98, cutoff: 900, noise: 0.3, event: 'chimes', rate: 7 },
  space: { drone: 58, drone2: 87.3, cutoff: 240, noise: 0.42, event: 'beeps', rate: 10 },
  castle: { drone: 43.7, cutoff: 430, noise: 0.5, event: 'gusts', rate: 11 },
  corporate: { drone: 110, cutoff: 640, noise: 0.22, event: 'beeps', rate: 15 },
};

/** 2s looping pink-ish noise buffer (Voss-McCartney-lite). */
function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + 0.03 * white;
    b1 = 0.985 * b1 + 0.06 * white;
    b2 = 0.95 * b2 + 0.12 * white;
    data[i] = (b0 + b1 + b2 + white * 0.05) * 0.6;
  }
  return buf;
}

function scheduleEvent(ctx: AudioContext, out: GainNode, kind: EventKind) {
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.connect(out);
  const tone = (
    freq0: number,
    freq1: number,
    dur: number,
    type: OscillatorType,
    peak: number
  ) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, freq1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    o.start(t);
    o.stop(t + dur + 0.1);
  };
  const r = Math.random;
  switch (kind) {
    case 'bubbles': {
      const f = 180 + r() * 240;
      tone(f, f * (1.8 + r()), 0.35 + r() * 0.3, 'sine', 0.05);
      break;
    }
    case 'creaks': {
      const f = 70 + r() * 60;
      tone(f, f * (0.55 + r() * 0.2), 0.8 + r() * 0.8, 'sawtooth', 0.022);
      break;
    }
    case 'moans': {
      const f = 55 + r() * 35;
      tone(f, f * (1.15 + r() * 0.2), 2.2 + r() * 1.5, 'triangle', 0.035);
      break;
    }
    case 'chimes': {
      const scale = [523, 587, 659, 784, 880];
      const f = scale[Math.floor(r() * scale.length)];
      tone(f, f * 0.995, 1.4 + r() * 0.8, 'sine', 0.03);
      break;
    }
    case 'beeps': {
      const f = 620 + r() * 500;
      tone(f, f, 0.12, 'sine', 0.025);
      break;
    }
    case 'gusts': {
      // a slow swell of extra noise, not a tone
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx);
      src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 300 + r() * 400;
      bp.Q.value = 0.7;
      src.connect(bp).connect(g);
      const dur = 2.5 + r() * 2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.start(t);
      src.stop(t + dur + 0.1);
      break;
    }
  }
}

/**
 * Start the ambience bed for a theme. Returns null if the browser blocks
 * audio (no gesture yet) — safe to retry later.
 */
export function startAmbience(themeId: string): AmbienceHandle | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  const recipe = RECIPES[themeId] ?? RECIPES.atlantis;

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // noise wash
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx);
  noise.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = recipe.cutoff;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.05 * recipe.noise;
  noise.connect(lp).connect(noiseGain).connect(master);
  noise.start();

  // breathing drones
  const oscs: OscillatorNode[] = [];
  const droneFreqs = [recipe.drone, recipe.drone2].filter(Boolean) as number[];
  droneFreqs.forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = f * (1 + (i ? 0.002 : -0.002)); // slight detune
    const og = ctx.createGain();
    og.gain.value = 0.028;
    // slow amplitude breathing
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05 + i * 0.023;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain).connect(og.gain);
    o.connect(og).connect(master);
    o.start();
    lfo.start();
    oscs.push(o, lfo);
  });

  // sparse events with randomized spacing
  let alive = true;
  let timer: ReturnType<typeof setTimeout>;
  const loop = () => {
    if (!alive) return;
    scheduleEvent(ctx, master, recipe.event);
    timer = setTimeout(loop, (recipe.rate * (0.5 + Math.random())) * 1000);
  };
  timer = setTimeout(loop, 2500);

  return {
    setVolume: (v: number) => {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, v)),
        ctx.currentTime + 0.6
      );
    },
    stop: () => {
      alive = false;
      clearTimeout(timer);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setTimeout(() => {
        oscs.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* already stopped */
          }
        });
        try {
          noise.stop();
        } catch {
          /* already stopped */
        }
        master.disconnect();
      }, 600);
    },
  };
}
