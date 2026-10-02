// Small friendly sound effects made with the Web Audio API (no files needed).
let ctx;

function audio() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!ctx) ctx = new Ctx();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, start = 0, duration = 0.15, type = 'sine', gain = 0.16 } = {}) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(0, ac.currentTime + start);
  vol.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.02);
  vol.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(vol).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.02);
}

export const sfx = {
  tap: () => tone({ freq: 660, duration: 0.08, type: 'triangle' }),
  correct() {
    tone({ freq: 784, start: 0, duration: 0.12, type: 'triangle' });
    tone({ freq: 1046, start: 0.1, duration: 0.18, type: 'triangle' });
    tone({ freq: 1318, start: 0.2, duration: 0.28, type: 'triangle' });
  },
  wrong() {
    tone({ freq: 300, start: 0, duration: 0.14, type: 'sine' });
    tone({ freq: 220, start: 0.13, duration: 0.22, type: 'sine' });
  },
  star() {
    tone({ freq: 1046, duration: 0.1 });
    tone({ freq: 1318, start: 0.09, duration: 0.1 });
    tone({ freq: 1568, start: 0.18, duration: 0.26 });
  },
  fanfare() {
    [523, 659, 784, 1046].forEach((freq, i) =>
      tone({ freq, start: i * 0.13, duration: 0.3, type: 'triangle', gain: 0.14 }),
    );
  },
};