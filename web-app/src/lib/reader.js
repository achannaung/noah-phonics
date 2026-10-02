import { SOUNDS } from '../data/curriculum.js';

// Words that can't be "a ___" in a picture sentence (verbs, adjectives,
// pronouns...). Everything else in the word lists works as a picture noun.
const NON_NOUNS = new Set(
  'up open yes you more for her first quick quiet dry cross cry enjoy turn hurt high sleep sing this that three thin zap sit blow draw red wind unhappy yellow blue black brown green purple short long'.split(' '),
);

function nounsFor(sounds) {
  const nouns = [];
  for (const sound of sounds) {
    for (const [word, emoji] of SOUNDS[sound].words) {
      if (!NON_NOUNS.has(word.toLowerCase())) nouns.push({ word, emoji, sound });
    }
  }
  return nouns;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function article(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function Article(word) {
  const a = article(word);
  return a.charAt(0).toUpperCase() + a.slice(1);
}

// Five classic early-reader sentence shapes. Any picture noun fits,
// so the sentences stay grammatical while mostly silly (kids love that).
function makePages(nouns) {
  const pool = nouns.length ? nouns : [{ word: 'sun', emoji: '☀️', sound: 's' }];
  const picked = [];
  const shuffled = shuffle(pool);
  for (let i = 0; i < 5; i += 1) picked.push(shuffled[i % shuffled.length]);
  const [n1, n2, n3, n4, n5] = picked;
  return [
    { emoji: n1.emoji, sentence: `I see ${article(n1.word)} ${n1.word}.` },
    { emoji: n2.emoji, sentence: `See the ${n2.word}.` },
    { emoji: n3.emoji, sentence: `The ${n3.word} is big.` },
    { emoji: n4.emoji, sentence: `${Article(n1.word)} ${n1.word} and ${article(n4.word)} ${n4.word}.` },
    { emoji: n5.emoji, sentence: `I like the ${n5.word}.` },
  ];
}

export function buildMiniBook(stage, book) {
  const nouns = nounsFor(stage.sounds);
  return {
    title: book.title,
    stageId: stage.id,
    stageName: stage.name,
    emoji: stage.emoji,
    pages: makePages(nouns),
  };
}

export function nounsCount(sounds) {
  return nounsFor(sounds).length;
}