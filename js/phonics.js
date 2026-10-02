/* Noah's Phonics Adventure — pure phonics sound synthesizer (WebAudio)
 *
 * Why this exists: speechSynthesis reads "sss" as "ess ess ess" (letter
 * names) and "t" as "tee". Real phonics needs PURE sounds — a long hiss for
 * s, a tiny burst for t with no "uh" after it. This engine synthesizes every
 * sound directly: filtered noise for hissy sounds, a hum for nasals, formant
 * synthesis for vowels, and short bursts for stops. No API keys, works
 * offline, identical on every device.
 */
const Phonics = (() => {
  let ctx = null, noiseBuf = null;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const len = ctx.sampleRate * 2;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function env(g, t0, attack, dur, peak) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }

  /* Hissy / breathy sounds: filtered white noise */
  function hiss({ dur = 0.8, type = 'highpass', freq = 5500, Q = 0.7, gain = 0.4, at = 0, attack = 0.04 }) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + at;
    const src = c.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = Q;
    const g = c.createGain(); env(g, t0, attack, dur, gain);
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t0); src.stop(t0 + dur + 0.1);
  }

  /* Voiced hums and glides */
  function hum({ freq = 150, dur = 0.8, type = 'sine', gain = 0.35, at = 0, attack = 0.05, slideTo = null, growl = 0 }) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + at;
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    let head = o;
    if (growl > 0) { // amplitude wobble -> throaty growl (for r)
      const lfo = c.createOscillator(); lfo.frequency.value = growl;
      const lg = c.createGain(); lg.gain.value = 0.45;
      const am = c.createGain(); am.gain.value = 0.55;
      lfo.connect(lg); lg.connect(am.gain); o.connect(am); head = am;
      lfo.start(t0); lfo.stop(t0 + dur + 0.1);
    }
    const g = c.createGain(); env(g, t0, attack, dur, gain);
    head.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.1);
  }

  /* Vowels: sawtooth buzz through 3 formant bandpass filters.
     glide = [f1End, f2End] for diphthongs. */
  function vowel({ f1, f2, f3 = 2600, dur = 0.7, gain = 0.4, at = 0, glide = null }) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + at;
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 135;
    const g = c.createGain(); env(g, t0, 0.06, dur, gain);
    const starts = [f1, f2, f3], amps = [1, 0.45, 0.22], qs = [7, 9, 11];
    starts.forEach((f0, i) => {
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = qs[i];
      bp.frequency.setValueAtTime(f0, t0);
      if (glide && glide[i]) bp.frequency.exponentialRampToValueAtTime(glide[i], t0 + dur);
      const gg = c.createGain(); gg.gain.value = amps[i];
      o.connect(bp); bp.connect(gg); gg.connect(g);
    });
    g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.1);
  }

  /* ---- one recipe per unit sound (keys match unit.sound in data.js) ---- */
  const R = {
    /* hissy continuants */
    's':  () => hiss({ dur: 0.9, freq: 5800, gain: 0.4 }),
    'z':  () => { hiss({ dur: 0.9, freq: 5800, gain: 0.2 }); hum({ freq: 140, dur: 0.9, type: 'sawtooth', gain: 0.12 }); },
    'zz': () => { hiss({ dur: 1.2, freq: 5800, gain: 0.2 }); hum({ freq: 140, dur: 1.2, type: 'sawtooth', gain: 0.12 }); },
    'sh': () => hiss({ dur: 0.9, type: 'bandpass', freq: 2600, Q: 0.9, gain: 0.5 }),
    'f':  () => hiss({ dur: 0.8, freq: 4800, gain: 0.32 }),
    'v':  () => { hiss({ dur: 0.8, freq: 4800, gain: 0.18 }); hum({ freq: 130, dur: 0.8, type: 'sawtooth', gain: 0.12 }); },
    'th': () => hiss({ dur: 0.7, type: 'bandpass', freq: 6800, Q: 1, gain: 0.2 }),
    'h':  () => hiss({ dur: 0.6, type: 'bandpass', freq: 1100, Q: 0.6, gain: 0.3 }),
    /* nasals & liquids */
    'm':  () => { hum({ freq: 150, dur: 0.9, gain: 0.38 }); hum({ freq: 300, dur: 0.9, gain: 0.1 }); },
    'n':  () => hum({ freq: 178, dur: 0.85, gain: 0.38 }),
    'ng': () => hum({ freq: 128, dur: 1.0, gain: 0.42 }),
    'l':  () => vowel({ f1: 380, f2: 1400, dur: 0.7, gain: 0.35 }),
    'r':  () => hum({ freq: 105, dur: 0.9, type: 'sawtooth', gain: 0.3, growl: 27 }),
    'w':  () => hum({ freq: 280, slideTo: 520, dur: 0.45, gain: 0.32 }),
    'y':  () => hum({ freq: 380, slideTo: 1700, dur: 0.4, gain: 0.3 }),
    /* short vowels */
    'a':  () => vowel({ f1: 720, f2: 1750, dur: 0.7 }),          // as in apple
    'e':  () => vowel({ f1: 560, f2: 1850, dur: 0.7 }),          // as in egg
    'i':  () => vowel({ f1: 420, f2: 2100, dur: 0.7 }),          // as in igloo
    'o':  () => vowel({ f1: 640, f2: 1050, dur: 0.7 }),          // as in octopus
    'u':  () => vowel({ f1: 620, f2: 1400, dur: 0.7 }),          // as in umbrella
    'oo': () => vowel({ f1: 460, f2: 1100, dur: 0.7 }),          // as in book
    'ee': () => vowel({ f1: 300, f2: 2350, f3: 3000, dur: 0.8 }),// as in tree
    /* diphthongs & r-controlled */
    'ai': () => vowel({ f1: 720, f2: 1750, dur: 0.75, glide: [420, 2100] }),
    'oa': () => vowel({ f1: 640, f2: 1050, dur: 0.75, glide: [460, 1100] }),
    'igh':() => vowel({ f1: 780, f2: 1300, dur: 0.8, glide: [420, 2100] }),
    'ar': () => vowel({ f1: 760, f2: 1250, f3: 2100, dur: 0.85 }),
    'or': () => vowel({ f1: 560, f2: 1000, f3: 2100, dur: 0.85 }),
    'er · ir · ur': () => vowel({ f1: 520, f2: 1500, f3: 1750, dur: 0.85 }),
    'oy': () => vowel({ f1: 560, f2: 1000, dur: 0.8, glide: [420, 2100] }),
    'ow': () => vowel({ f1: 780, f2: 1300, dur: 0.8, glide: [460, 1100] }),
    /* stops: tiny burst, NO extra vowel */
    'p':  () => hiss({ dur: 0.14, type: 'lowpass', freq: 1100, gain: 0.6, attack: 0.005 }),
    't':  () => hiss({ dur: 0.12, freq: 4300, gain: 0.5, attack: 0.005 }),
    'd':  () => { hiss({ dur: 0.12, freq: 3900, gain: 0.4, attack: 0.005 }); hum({ freq: 130, dur: 0.16, type: 'sawtooth', gain: 0.14 }); },
    'k':  () => hiss({ dur: 0.14, type: 'bandpass', freq: 2100, Q: 1.2, gain: 0.55, attack: 0.005 }),
    'c':  () => hiss({ dur: 0.14, type: 'bandpass', freq: 2100, Q: 1.2, gain: 0.55, attack: 0.005 }),
    'g':  () => { hiss({ dur: 0.14, type: 'bandpass', freq: 1900, Q: 1.2, gain: 0.45, attack: 0.005 }); hum({ freq: 125, dur: 0.16, type: 'sawtooth', gain: 0.14 }); },
    'j':  () => { hiss({ dur: 0.1, type: 'bandpass', freq: 2400, Q: 1, gain: 0.3, attack: 0.005 });
                  hiss({ dur: 0.45, type: 'bandpass', freq: 2600, Q: 0.9, gain: 0.32, at: 0.08 });
                  hum({ freq: 135, dur: 0.5, type: 'sawtooth', gain: 0.1, at: 0.08 }); },
    'qu': () => { hiss({ dur: 0.12, type: 'bandpass', freq: 2100, Q: 1.2, gain: 0.5, attack: 0.005 });
                  hum({ freq: 280, slideTo: 520, dur: 0.4, gain: 0.3, at: 0.1 }); },
    'x':  () => { hiss({ dur: 0.12, type: 'bandpass', freq: 2100, Q: 1.2, gain: 0.5, attack: 0.005 });
                  hiss({ dur: 0.6, freq: 5800, gain: 0.35, at: 0.1 }); },
    'ch': () => { hiss({ dur: 0.1, freq: 4300, gain: 0.45, attack: 0.005 });
                  hiss({ dur: 0.55, type: 'bandpass', freq: 2600, Q: 0.9, gain: 0.45, at: 0.07 }); },
    /* blends demo: "st" run together, fast */
    'blends': () => { hiss({ dur: 0.3, freq: 5800, gain: 0.38 }); hiss({ dur: 0.12, freq: 4300, gain: 0.5, attack: 0.005, at: 0.27 }); },
  };

  /* "Watch it blend": components first, then the merged sound */
  const DEMO = {
    'sh': [['s', 0], ['h', 0.35], ['sh', 0.75]],
    'ch': [['t', 0], ['h', 0.25], ['ch', 0.55]],
    'th': [['t', 0], ['h', 0.2], ['th', 0.5]],
    'ng': [['n', 0], ['g', 0.4], ['ng', 0.7]],
    'ai': [['a', 0], ['i', 0.4], ['ai', 0.85]],
    'ee': [['e', 0], ['e', 0.4], ['ee', 0.85]],
    'oa': [['o', 0], ['oo', 0.4], ['oa', 0.85]],
  };

  function play(key) {
    const r = R[key];
    if (!r) return false;
    try { r(); return true; } catch (e) { return false; }
  }

  /* spoken-style demo: components then merged; single sounds chant 3x */
  function demo(key) {
    const seq = DEMO[key];
    try {
      if (seq) seq.forEach(([k, at]) => setTimeout(() => play(k), at * 1000));
      else { play(key); setTimeout(() => play(key), 550); setTimeout(() => play(key), 1100); }
      return true;
    } catch (e) { return false; }
  }

  return { play, demo };
})();
