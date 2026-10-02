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

export function buildFindingQuestion(sounds) {
  const pool = allWords(sounds);
  const target = pool[rnd(pool.length)];
  const distractors = shuffle(pool.filter((w) => w.word !== target.word)).slice(0, 5);
  const options = shuffle([target, ...distractors]);
  return {
    id: 'find',
    prompt: `Which word starts with “${target.sound}”?`,
    promptSound: null,
    options,
    answer: target.word,
    unitSound: target.sound,
  };
}

export function buildBlendingQuestion(sounds) {
  const pool = allWords(sounds);
  const target = pool[rnd(pool.length)];
  const letters = target.word.toLowerCase().replace(/[^a-z]/g, '');
  const index = rnd(letters.length);
  const bank = shuffle([...letters, letters[index], letters[index], letters[index]]);
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