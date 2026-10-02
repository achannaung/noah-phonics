/* Noah's Phonics Adventure — speech (Web Speech API) + sound cues (WebAudio) */
const Voice = (() => {
  let voice = null;
  let ready = false;

  function pick() {
    try {
      if (!('speechSynthesis' in window)) return;
      const vs = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
      voice = vs.find(v => /en[-_]gb/i.test(v.lang) && /female|samantha|serena|kate|martha|stephanie/i.test(v.name))
        || vs.find(v => /en[-_]gb/i.test(v.lang))
        || vs.find(v => /female|samantha|zira|aria|jenny/i.test(v.name))
        || vs[0] || null;
      ready = true;
    } catch (e) { /* speech unavailable */ }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    pick();
    speechSynthesis.onvoiceschanged = pick;
  }

  function speak(text, { rate = 0.92, pitch = 1.05 } = {}) {
    return new Promise((resolve) => {
      try {
        if (!('speechSynthesis' in window)) return resolve();
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice;
        u.rate = rate; u.pitch = pitch; u.lang = (voice && voice.lang) || 'en-GB';
        let done = false;
        const fin = () => { if (!done) { done = true; resolve(); } };
        u.onend = fin; u.onerror = fin;
        speechSynthesis.speak(u);
        setTimeout(fin, 6000); // safety net
      } catch (e) { resolve(); }
    });
  }

  const PRAISE = ["Great job!", "Amazing!", "Super star!", "You did it!", "Brilliant!", "Wow, fantastic!"];
  const TRYAGAIN = ["Try again!", "Almost! One more try!", "You can do it!"];

  return {
    speak,
    sound: (unit) => speak(unit.say, { rate: 0.7, pitch: 1.1 }),
    word: (w) => speak(w, { rate: 0.8 }),
    sentence: (s) => speak(s, { rate: 0.88 }),
    cue: (t) => speak(t, { rate: 0.9 }),
    praise: () => speak(PRAISE[Math.floor(Math.random() * PRAISE.length)], { rate: 0.95, pitch: 1.15 }),
    tryAgain: () => speak(TRYAGAIN[Math.floor(Math.random() * TRYAGAIN.length)], { rate: 0.95 }),
  };
})();

/* Cheerful sound effects, synthesized — no audio files needed */
const Sfx = (() => {
  let ctx = null;
  function ac() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }
  function tone(freq, at, dur, type = 'sine', vol = 0.18) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    const t = c.currentTime + at;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  return {
    unlock() { ac(); }, // call on first tap
    ding()   { tone(523.25, 0, .18); tone(659.25, .1, .18); tone(783.99, .2, .3); },
    boop()   { tone(220, 0, .22, 'sine', .14); tone(174, .08, .25, 'sine', .12); },
    pop()    { tone(440, 0, .09, 'triangle', .2); tone(660, .06, .12, 'triangle', .16); },
    sparkle(){ [880, 1046, 1318, 1568].forEach((f, i) => tone(f, i * .07, .25, 'sine', .1)); },
    fanfare(){ [523, 523, 659, 784, 1046].forEach((f, i) => tone(f, i * .12, .3, 'triangle', .16)); },
  };
})();
