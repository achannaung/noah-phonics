// Text-to-speech using the browser's built-in speech engine.
let voices = [];

function loadVoices() {
  if (!('speechSynthesis' in window)) return [];
  voices = window.speechSynthesis.getVoices();
  return voices;
}

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice() {
  if (!voices.length) loadVoices();
  const exact = ['Samantha', 'Karen', 'Daniel', 'Moira', 'Google UK English Female', 'Google US English'];
  for (const name of exact) {
    const found = voices.find((v) => v.name.includes(name));
    if (found) return found;
  }
  return (
    voices.find((v) => /en-GB/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  );
}

export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text, { rate = 0.75, pitch = 1.15, lang = 'en-US' } = {}) {
  if (!speechSupported) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = voice?.lang || lang;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

// Slow, stretched sound for teaching a phoneme: "sh sh sh"
export function speakSound(sound) {
  const stretched = sound.length === 1 ? sound.repeat(6) : sound.split('').join(' ');
  speak(`${sound}. ${stretched}`, { rate: 0.5 });
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel();
}