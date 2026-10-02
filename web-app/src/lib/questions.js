import { SOUNDS } from '../data/curriculum.js';

// Deterministic-ish helpers
const rnd = (n) => Math.floor(Math.random() * n);

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = rnd(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// All words in the stage, labelled with their sound.
function allWords(sounds) {
  return sounds.flatMap((sound) =>
    SOUNDS[sound].words.map(([word, emoji]) => ({ word, emoji, sound })),
  );
}

// Pick N unique-by-word distractors that do NOT match the target sound,
// so there is exactly one correct answer (e.g. only one "p..." word).
// `matches(word)` is true when the word uses the target sound in the
// tested position (start, or anywhere for end-sounds like x / zz).
function pickDistractors(pool, target, count, matches) {
  const clean = [];
  const seen = new Set([target.word.toLowerCase()]);
  for (const w of shuffle(pool)) {
    const lw = w.word.toLowerCase();
    if (seen.has(lw)) continue;
    if (matches(lw)) continue;
    seen.add(lw);
    clean.push(w);
    if (clean.length >= count) break;
  }
  // Fallback (tiny pools): allow same-sound words rather than crash,
  // but never duplicate the answer word itself.
  if (clean.length < count) {
    for (const w of shuffle(pool)) {
      const lw = w.word.toLowerCase();
      if (seen.has(lw)) continue;
      seen.add(lw);
      clean.push(w);
      if (clean.length >= count) break;
    }
  }
  return clean;
}

export function buildFindingQuestion(sounds) {
  const pool = allWords(sounds);
  // Only words that actually show the sound's spelling (night for igh,
  // royal for oy) can be the answer — "kite" never spells igh.
  const candidates = pool.filter((w) => w.word.toLowerCase().includes(w.sound.toLowerCase()));
  const source = candidates.length ? candidates : pool;
  const target = source[rnd(source.length)];
  const sound = target.sound.toLowerCase();
  const word = target.word.toLowerCase();
  // End-sounds (x in "box", zz in "fizz") can't "start" a word:
  // test "uses the sound" anywhere instead.
  const testsStart = word.startsWith(sound);
  const matches = testsStart
    ? (w) => w.startsWith(sound)
    : (w) => w.includes(sound);
  const distractors = pickDistractors(pool, target, 5, matches);
  const options = shuffle([target, ...distractors]);
  return {
    id: 'find',
    prompt: testsStart
      ? `Which word starts with “${target.sound}”?`
      : `Which word uses the “${target.sound}” sound?`,
    promptSound: null,
    promptKind: testsStart ? 'starts' : 'uses',
    options,
    answer: target.word,
    unitSound: target.sound,
  };
}

const DECOY_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function buildBlendingQuestion(sounds) {
  const pool = allWords(sounds);
  const target = pool[rnd(pool.length)];
  const letters = target.word.toLowerCase().replace(/[^a-z]/g, '');
  // 3 random decoy letters that are NOT in the word (no triplicated tiles).
  const inWord = new Set(letters.split(''));
  const decoys = shuffle(DECOY_LETTERS.filter((l) => !inWord.has(l))).slice(0, 3);
  const bank = shuffle([...letters.split(''), ...decoys]);
  return {
    id: 'spell',
    prompt: 'Tap the letters to spell the word',
    hintWord: target.word,
    emoji: target.emoji,
    answer: letters,
    bank,
    unitSound: target.sound,
  };
}

export function buildSoundChoiceQuestion(sounds) {
  const others = shuffle(Object.keys(SOUNDS).filter((s) => !sounds.includes(s))).slice(0, 2);
  const answer = sounds[rnd(sounds.length)];
  const options = shuffle([answer, ...others]);
  return {
    id: 'sound',
    prompt: 'Which sound does this word use?',
    word: SOUNDS[answer].words[rnd(SOUNDS[answer].words.length)],
    options,
    answer,
    unitSound: answer,
  };
}

const BUILDERS = {
  find: buildFindingQuestion,
  spell: buildBlendingQuestion,
  sound: buildSoundChoiceQuestion,
};

export function buildQuestionBank(mode, sounds, count = 6) {
  const builder = BUILDERS[mode] ?? buildFindingQuestion;
  return Array.from({ length: count }, () => builder(sounds));
}