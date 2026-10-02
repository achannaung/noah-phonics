/* Noah's Phonics Adventure — pure phonics sound synthesizer (WebAudio) v2
 *
 * Design goals from classroom phonics:
 *  - SLOW and sustained: continuants hold ~1.3s, nothing feels rushed.
 *  - WARM vowels: soft lowpassed buzz + gentle vibrato, wide formants —
 *    no robot voice.
 *  - PURE stops: a tiny burst with no "uh" after it.
 *  - No overlaps: demo sequences are spaced so sounds never stutter.
 * Works offline, no API keys, identical on every device.
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

  /* Hissy / breathy sounds: filtered white noise, slow swell in/out */
  function hiss({ dur = 1.3, type = 'highpass', freq = 5500, Q = 0.7, gain = 0.38, at = 0 }) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + at;
    const src = c.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = Q;
    const g = c.createGain(); env(g, t0, 0.12, dur, gain);
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t0); src.stop(t0 + dur + 0.15);
  }

  /* Voiced hums and glides */
  function hum({ freq = 150, dur = 1.3, type = 'sine', gain = 0.34, at = 0, slideTo = null, growl = 0 }) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + at;
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    let head = o;
    if (growl > 0) {
      const lfo = c.createOscillator(); lfo.frequency.value = growl;
      const lg = c.createGain(); lg.gain.value = 0.3;
      const am = c.createGain(); am.gain.value = 0.7;
      lfo.connect(lg); lg.connect(am.gain); o.connect(am); head = am;
      lfo.start(t0); lfo.stop(t0 + dur + 0.15);
    }
    const g = c.createGain(); env(g, t0, 0.12, dur, gain);
    head.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.15);
  }

  /* Warm vowels: soft buzz (lowpassed sawtooth) + gentle vibrato
     through wide formant filters. glide=[f1End,f2End] for diphthongs. */
  function vowel({ f1, f2, f3 = 2600, dur = 1.3, gain = 0.36, at = 0, glide = null }) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + at;
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 112;
    const vib = c.createOscillator(); vib.frequency.value = 5.2;      // gentle vibrato
    const vg = c.createGain(); vg.gain.value = 4;
    vib.connect(vg); vg.connect(o.frequency);
    const soft = c.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 2600;
    const g = c.createGain(); env(g, t0, 0.16, dur, gain);
    const starts = [f1, f2, f3], amps = [1, 0.5, 0.25];
    starts.forEach((f0, i) => {
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 5; // wide, natural
      bp.frequency.setValueAtTime(f0, t0);
      if (glide && glide[i]) bp.frequency.exponentialRampToValueAtTime(glide[i], t0 + dur);
      const gg = c.createGain(); gg.gain.value = amps[i];
      o.connect(soft); soft.connect(bp); bp.connect(gg); gg.connect(g);
    });
    g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.15);
    vib.start(t0); vib.stop(t0 + dur + 0.15);
  }

  /* ---- one recipe per unit sound (keys match unit.sound in data.js) ---- */
  const R = {
    /* hissy continuants — long and steady */
    's':  () => hiss({ dur: 1.4, freq: 5800, gain: 0.38 }),
    'z':  () => { hiss({ dur: 1.4, freq: 5800, gain: 0.18 }); hum({ freq: 140, dur: 1.4, type: 'sawtooth', gain: 0.1 }); },
    'zz': () => { hiss({ dur: 1.6, freq: 5800, gain: 0.18 }); hum({ freq: 140, dur: 1.6, type: 'sawtooth', gain: 0.1 }); },
    'sh': () => hiss({ dur: 1.4, type: 'bandpass', freq: 2600, Q: 0.9, gain: 0.46 }),
    'f':  () => hiss({ dur: 1.3, freq: 4800, gain: 0.3 }),
    'v':  () => { hiss({ dur: 1.3, freq: 4800, gain: 0.16 }); hum({ freq: 130, dur: 1.3, type: 'sawtooth', gain: 0.1 }); },
    'th': () => hiss({ dur: 1.2, type: 'bandpass', freq: 6800, Q: 1, gain: 0.18 }),
    'h':  () => hiss({ dur: 1.0, type: 'bandpass', freq: 1100, Q: 0.6, gain: 0.28 }),
    /* nasals & liquids — warm hums */
    'm':  () => { hum({ freq: 150, dur: 1.3, gain: 0.36 }); hum({ freq: 300, dur: 1.3, gain: 0.09 }); },
    'n':  () => hum({ freq: 178, dur: 1.3, gain: 0.36 }),
    'ng': () => hum({ freq: 128, dur: 1.4, gain: 0.4 }),
    'l':  () => vowel({ f1: 380, f2: 1400, dur: 1.2, gain: 0.32 }),
    'r':  () => hum({ freq: 100, dur: 1.3, type: 'sawtooth', gain: 0.26, growl: 16 }),
    'w':  () => hum({ freq: 280, slideTo: 520, dur: 0.6, gain: 0.3 }),
    'y':  () => hum({ freq: 380, slideTo: 1700, dur: 0.55, gain: 0.28 }),
    /* short vowels — warm and held */
    'a':  () => vowel({ f1: 720, f2: 1750, dur: 1.3 }),   // as in apple
    'e':  () => vowel({ f1: 560, f2: 1850, dur: 1.3 }),   // as in egg
    'i':  () => vowel({ f1: 420, f2: 2100, dur: 1.3 }),   // as in igloo
    'o':  () => vowel({ f1: 640, f2: 1050, dur: 1.3 }),   // as in octopus
    'u':  () => vowel({ f1: 620, f2: 1400, dur: 1.3 }),   // as in umbrella
    'oo': () => vowel({ f1: 460, f2: 1100, dur: 1.3 }),   // as in book
    'ee': () => vowel({ f1: 300, f2: 2350, f3: 3000, dur: 1.4 }), // as in tree
    /* diphthongs & r-controlled — slow glides */
    'ai': () => vowel({ f1: 720, f2: 1750, dur: 1.4, glide: [420, 2100] }),
    'oa': () => vowel({ f1: 640, f2: 1050, dur: 1.4, glide: [460, 1100] }),
    'igh':() => vowel({ f1: 780, f2: 1300, dur: 1.5, glide: [420, 2100] }),
    'ar': () => vowel({ f1: 760, f2: 1250, f3: 2100, dur: 1.4 }),
    'or': () => vowel({ f1: 560, f2: 1000, f3: 2100, dur: 1.4 }),
    'er · ir · ur': () => vowel({ f1: 520, f2: 1500, f3: 1750, dur: 1.4 }),
    'oy': () => vowel({ f1: 560, f2: 1000, dur: 1.4, glide: [420, 2100] }),
    'ow': () => vowel({ f1: 780, f2: 1300, dur: 1.4, glide: [460, 1100] }),
    /* stops: one tiny burst, NO extra vowel */
    'p':  () => hiss({ dur: 0.2, type: 'lowpass', freq: 1100, gain: 0.55, attack: 0.008 }),
    't':  () => hiss({ dur: 0.18, freq: 4300, gain: 0.48, attack: 0.008 }),
    'd':  () => { hiss({ dur: 0.18, freq: 3900, gain: 0.38, attack: 0.008 }); hum({ freq: 130, dur: 0.22, type: 'sawtooth', gain: 0.12 }); },
    'k':  () => hiss({ dur: 0.2, type: 'bandpass', freq: 2100, Q: 1.2, gain: 0.5, attack: 0.008 }),
    'c':  () => hiss({ dur: 0.2, type: 'bandpass', freq: 2100, Q: 1.2, gain: 0.5, attack: 0.008 }),
    'g':  () => { hiss({ dur: 0.2, type: 'bandpass', freq: 1900, Q: 1.2, gain: 0.42, attack: 0.008 }); hum({ freq: 125, dur: 0.22, type: 'sawtooth', gain: 0.12 }); },
    'j':  () => { hiss({ dur: 0.14, type: 'bandpass', freq: 2400, Q: 1, gain: 0.3, attack: 0.008 });
                  hiss({ dur: 0.7, type: 'bandpass', freq: 2600, Q: 0.9, gain: 0.3, at: 0.12 });
                  hum({ freq: 135, dur: 0.75, type: 'sawtooth', gain: 0.09, at: 0.12 }); },
    'qu': () => { hiss({ dur: 0.16, type: 'bandpass', freq: 2100, Q: 1.2, gain: 0.48, attack: 0.008 });
                  hum({ freq: 280, slideTo: 520, dur: 0.55, gain: 0.28, at: 0.14 }); },
    'x':  () => { hiss({ dur: 0.16, type: 'bandpass', freq: 2100, Q: 1.2, gain: 0.48, attack: 0.008 });
                  hiss({ dur: 0.9, freq: 5800, gain: 0.32, at: 0.14 }); },
    'ch': () => { hiss({ dur: 0.14, freq: 4300, gain: 0.42, attack: 0.008 });
                  hiss({ dur: 0.8, type: 'bandpass', freq: 2600, Q: 0.9, gain: 0.42, at: 0.1 }); },
    /* blends demo: "st" run together, unhurried */
    'blends': () => { hiss({ dur: 0.55, freq: 5800, gain: 0.34 }); hiss({ dur: 0.18, freq: 4300, gain: 0.46, attack: 0.008, at: 0.5 }); },
  };

  /* Natural length of each recipe (seconds) — used to space demos */
  const DUR = { s:1.4, z:1.4, zz:1.6, sh:1.4, f:1.3, v:1.3, th:1.2, h:1.0,
    m:1.3, n:1.3, ng:1.4, l:1.2, r:1.3, w:0.6, y:0.55,
    a:1.3, e:1.3, i:1.3, o:1.3, u:1.3, oo:1.3, ee:1.4,
    ai:1.4, oa:1.4, igh:1.5, ar:1.4, or:1.4, 'er · ir · ur':1.4, oy:1.4, ow:1.4,
    p:0.3, t:0.3, d:0.3, k:0.3, c:0.3, g:0.3, j:1.0, qu:0.9, x:1.2, ch:1.1, blends:0.9 };

  /* "Watch it blend": components, then the merged sound — never overlapping */
  const DEMO = {
    'sh': ['s', 'h', 'sh'],
    'ch': ['t', 'h', 'ch'],
    'th': ['t', 'h', 'th'],
    'ng': ['n', 'g', 'ng'],
    'ai': ['a', 'i', 'ai'],
    'ee': ['e', 'e', 'ee'],
    'oa': ['o', 'oo', 'oa'],
  };

  function play(key) {
    const r = R[key];
    if (!r) return false;
    try { r(); return true; } catch (e) { return false; }
  }

  function demo(key) {
    const seq = DEMO[key] || [key]; // single sounds: one slow sustained play
    try {
      let t = 0;
      seq.forEach((k) => {
        const kk = k, at = t;
        setTimeout(() => play(kk), at * 1000);
        t += (DUR[k] || 1.0) + 0.45; // gap so nothing overlaps
      });
      return true;
    } catch (e) { return false; }
  }

  return { play, demo };
})();
