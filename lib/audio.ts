'use client';

// Minimal, dependency-free audio cues. Everything is guarded so the demo
// never breaks if the browser blocks audio before a user gesture.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  gainPeak: number
) {
  const c = getCtx();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(gainPeak, c.currentTime + start + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.05);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  click: () => tone(520, 0, 0.08, 'sine', 0.06),
  open: () => {
    tone(330, 0, 0.12, 'sine', 0.07);
    tone(494, 0.08, 0.14, 'sine', 0.06);
  },
  success: () => {
    tone(392, 0, 0.16, 'sine', 0.09);
    tone(523, 0.12, 0.16, 'sine', 0.09);
    tone(659, 0.24, 0.28, 'sine', 0.1);
  },
  fail: () => {
    tone(220, 0, 0.18, 'triangle', 0.08);
    tone(174, 0.12, 0.22, 'triangle', 0.08);
  },
  portal: () => {
    tone(196, 0, 0.5, 'sine', 0.08);
    tone(392, 0.15, 0.5, 'sine', 0.07);
    tone(587, 0.3, 0.6, 'sine', 0.08);
    tone(784, 0.45, 0.7, 'sine', 0.07);
  },
};
