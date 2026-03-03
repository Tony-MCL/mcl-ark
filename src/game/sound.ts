import type { Settings } from "./types";

type CanPlayFn = () => boolean;

export function createSfx(canPlay: CanPlayFn) {
  let ctx: AudioContext | null = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx;
  }

  async function unlock() {
    if (!canPlay()) return;
    const c = getCtx();
    if (c.state === "suspended") {
      try { await c.resume(); } catch {}
    }
  }

  function beep(freq: number, durMs: number, vol: number, type: OscillatorType = "sine", when = 0) {
    if (!canPlay()) return;
    const c = getCtx();
    const t0 = c.currentTime + when;

    const o = c.createOscillator();
    const g = c.createGain();

    o.type = type;
    o.frequency.setValueAtTime(freq, t0);

    // Quick envelope (click-free)
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);

    o.connect(g);
    g.connect(c.destination);

    o.start(t0);
    o.stop(t0 + durMs / 1000 + 0.02);
  }

  return {
    unlock,

    brickHit() {
      beep(880, 55, 0.06, "square");
    },

    paddleHit() {
      beep(220, 70, 0.07, "triangle");
    },

    wallHit() {
      beep(520, 45, 0.04, "square");
    },

    lifeLost() {
      beep(180, 140, 0.08, "sawtooth");
      beep(120, 170, 0.06, "sine", 0.06);
    },

    levelClear() {
      // tiny “jingle” (moderate)
      beep(659, 90, 0.08, "triangle", 0.00);
      beep(784, 90, 0.08, "triangle", 0.09);
      beep(988, 120, 0.09, "triangle", 0.18);
    }
  };
}
