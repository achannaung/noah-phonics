import { useMemo, useState } from 'react';
import { SOUNDS, STAGES } from '../data/curriculum.js';
import { speak } from '../lib/speech.js';
import { sfx } from '../lib/sfx.js';
import { buildQuestionBank } from '../lib/questions.js';
import { Toast, useToast } from '../components/Toast.jsx';

const GAMES = [
  { id: 'sound-hunt', label: 'Sound Hunt', emoji: '🔍', blurb: 'Find the word with the sound' },
  { id: 'odd-one-out', label: 'Odd One Out', emoji: '🐒', blurb: 'Which one is different?' },
  { id: 'missing-letter', label: 'Missing Letter', emoji: '🕳️', blurb: 'Fill the gap' },
  { id: 'spelling-bee', label: 'Spelling Bee', emoji: '🐝', blurb: 'Build the whole word' },
];

// ---------- Question builders per game ----------
function soundHunt(sounds) {
  const bank = buildQuestionBank('find', sounds, 1)[0];
  return { kind: 'sound-hunt', ...bank };
}

function oddOneOut(sounds) {
  const pool = sounds.flatMap((sound) => SOUNDS[sound].words.map(([word, emoji]) => ({ word, emoji, sound })));
  const anchor = pool[Math.floor(Math.random() * pool.length)];
  const same = pool.filter((p) => p.sound === anchor.sound && p.word !== anchor.word);
  const others = pool.filter((p) => p.sound !== anchor.sound);
  if (!same.length) return soundHunt(sounds);
  const options = [
    anchor,
    same[Math.floor(Math.random() * same.length)],
    ...Array.from({ length: 3 }, () => others[Math.floor(Math.random() * others.length)]),
  ];
  return {
    kind: 'odd-one-out',
    prompt: `Which one does NOT use the “${anchor.sound}” sound?`,
    targetSound: anchor.sound,
    options: shuffle(options),
    answer: options.find((o) => o.sound !== anchor.sound)?.word,
    unitSound: anchor.sound,
  };
}

function missingLetter(sounds) {
  const pool = sounds.flatMap((sound) => SOUNDS[sound].words.map(([word, emoji]) => ({ word, emoji, sound })));
  const target = pool[Math.floor(Math.random() * pool.length)];
  const letters = target.word.toLowerCase().replace(/[^a-z]/g, '');
  const pos = Math.floor(Math.random() * letters.length);
  const shown = letters.split('').map((l, i) => (i === pos ? '_' : l)).join('');
  const options = shuffle([
    letters[pos],
    ...shuffle(
      [...new Set(pool.map((p) => p.word.replace(/[^a-z]/g, '').charAt(pos)))].filter(
        (l) => l && l !== letters[pos],
      ),
    ).slice(0, 3),
  ]);
  return {
    kind: 'missing-letter',
    prompt: 'Which letter is missing?',
    word: target.word,
    emoji: target.emoji,
    pattern: shown,
    position: pos,
    options,
    answer: letters[pos],
    unitSound: target.sound,
  };
}

function spellingBee(sounds) {
  const bank = buildQuestionBank('spell', sounds, 1)[0];
  return { kind: 'spelling-bee', ...bank };
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const BUILDERS = {
  'sound-hunt': soundHunt,
  'odd-one-out': oddOneOut,
  'missing-letter': missingLetter,
  'spelling-bee': spellingBee,
};

const ROUNDS = 6;
const LIVES = 3;

// ---------- Game component ----------
function PlayGame({ game, sounds, onExit, recordUnit, addStars }) {
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [typed, setTyped] = useState([]);
  const [done, setDone] = useState(false);
  const [toast, showToast] = useToast();

  const question = useMemo(() => {
    if (done) return null;
    return BUILDERS[game](sounds);
  }, [game, sounds, round, done]);

  function judge(answer, ok) {
    if (done) return;
    setPicked(answer);
    recordUnit({ stage: STAGES.find((s) => s.sounds.includes(question.unitSound))?.id ?? 1, sound: question.unitSound }, { correct: ok ? 1 : 0, wrong: ok ? 0 : 1 });
    if (ok) {
      setScore((s) => s + 1);
      showToast('Great! ⭐');
    } else {
      setLives((l) => l - 1);
      showToast('Not quite. Listen again…');
      speak(question.unitSound);
    }
  }

  function advance() {
    if (lives - (pickedIsWrong ? 1 : 0) <= 0 || round + 1 >= ROUNDS) {
      finish();
      return;
    }
    setPicked(null);
    setTyped([]);
    setRound((r) => r + 1);
  }

  const pickedIsWrong = picked !== null && picked !== question?.answer && question?.kind !== 'spelling-bee';

  function finish() {
    setDone(true);
    const stars = Math.max(1, Math.round((score / ROUNDS) * 5));
    addStars(stars);
    sfx.fanfare();
  }

  if (done) {
    return (
      <div className="view">
        <div className={`result-banner ${score >= 3 ? 'win' : 'lose'}`}>
          {score >= 3 ? '🏆 Brilliant, Noah!' : '💪 Good try, Noah!'}
          <div style={{ fontSize: '1rem', marginTop: 8 }}>
            {score} out of {ROUNDS} correct
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
          <button className="btn primary" onClick={() => { setDone(false); setRound(0); setLives(LIVES); setScore(0); setPicked(null); setTyped([]); }}>
            🔁 Play again
          </button>
          <button className="btn" onClick={onExit}>
            🏠 Choose another game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn ghost" onClick={onExit}>
          ← Games
        </button>
        <span className="lives" aria-label={`${lives} lives left`}>
          {'❤️'.repeat(Math.max(0, lives))}
        </span>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="chip">Round {round + 1} of {ROUNDS}</span>
        <span className="chip">⭐ {score} correct</span>
      </div>

      <section className="prompt-card">
        {question.kind === 'sound-hunt' && (
          <>
            <div className="prompt-sound">{question.prompt.match(/“(.+)”/)[1]}</div>
            <p style={{ fontWeight: 800, marginTop: 6 }}>Which word starts with it?</p>
            <div className="answer-grid" style={{ marginTop: 16 }}>
              {question.options.map((opt) => (
                <button
                  key={opt.word}
                  className={`answer-btn ${
                    picked && opt.word === question.answer ? 'right' : picked === opt.word ? 'wrong' : ''
                  }`}
                  onClick={() => { if (!picked) judge(opt.word, opt.word === question.answer); }}
                >
                  <span className="emoji" aria-hidden="true">{opt.emoji}</span>
                  {opt.word}
                </button>
              ))}
            </div>
          </>
        )}

        {question.kind === 'odd-one-out' && (
          <>
            <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{question.prompt}</p>
            <div className="answer-grid" style={{ marginTop: 16 }}>
              {question.options.map((opt) => (
                <button
                  key={opt.word}
                  className={`answer-btn ${
                    picked && opt.word === question.answer ? 'right' : picked === opt.word ? 'wrong' : ''
                  }`}
                  onClick={() => { if (!picked) judge(opt.word, opt.word === question.answer); }}
                >
                  <span className="emoji" aria-hidden="true">{opt.emoji}</span>
                  {opt.word}
                </button>
              ))}
            </div>
          </>
        )}

        {question.kind === 'missing-letter' && (
          <>
            <div style={{ fontSize: '3.4rem' }} aria-hidden="true">{question.emoji}</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '0.1em', margin: '8px 0' }}>
              {question.pattern}
            </div>
            <p style={{ fontWeight: 800 }}>Which letter is missing?</p>
            <div className="answer-grid" style={{ marginTop: 16 }}>
              {question.options.map((letter) => (
                <button
                  key={letter}
                  className={`answer-btn ${
                    picked && letter === question.answer ? 'right' : picked === letter ? 'wrong' : ''
                  }`}
                  style={{ fontSize: '2rem' }}
                  onClick={() => { if (!picked) judge(letter, letter === question.answer); }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </>
        )}

        {question.kind === 'spelling-bee' && (
          <>
            <div style={{ fontSize: '3.4rem' }} aria-hidden="true">{question.emoji}</div>
            <p style={{ fontWeight: 800 }}>{question.prompt}</p>
            <div className="letter-slots" style={{ marginTop: 14 }}>
              {question.answer.split('').map((_, i) => (
                <span key={i} className={`slot ${i < typed.length ? 'filled' : 'empty-slot'}`}>
                  {typed[i] ?? ''}
                </span>
              ))}
            </div>
            <div className="letter-bank">
              {question.bank.map((letter, i) => {
                const used = typed.filter((t) => t === letter).length;
                const available = question.bank.filter((l) => l === letter).length;
                return (
                  <button
                    key={`${letter}-${i}`}
                    className={`letter-tile ${used >= available ? 'used' : ''}`}
                    onClick={() => { sfx.tap(); setTyped((prev) => [...prev, letter]); }}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
            <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button className="btn" onClick={() => setTyped((prev) => prev.slice(0, -1))} disabled={!typed.length}>↩️ Undo</button>
              <button
                className="btn green"
                disabled={typed.length !== question.answer.length}
                onClick={() => judge(typed.join(''), typed.join('') === question.answer)}
              >
                Check
              </button>
            </div>
          </>
        )}

        {question.kind !== 'spelling-bee' && (
          <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button className="btn primary" disabled={!picked} onClick={advance}>
              Continue →
            </button>
          </div>
        )}
        {question.kind === 'spelling-bee' && picked !== null && (
          <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button className="btn primary" onClick={advance}>
              Continue →
            </button>
          </div>
        )}
      </section>

      <Toast message={toast} />
    </div>
  );
}

// ---------- Menu ----------
export default function Games({ stage, recordUnit, addStars }) {
  const [game, setGame] = useState(null);

  if (game) {
    return (
      <PlayGame
        game={game}
        sounds={stage.sounds}
        recordUnit={recordUnit}
        addStars={addStars}
        onExit={() => setGame(null)}
      />
    );
  }

  return (
    <div className="view">
      <section className="hero">
        <div className="hero-mascot" aria-hidden="true">🎮</div>
        <h1>Quiz Games</h1>
        <p className="muted" style={{ fontWeight: 700 }}>
          Playing with Level {stage.id} sounds · {stage.name}
        </p>
      </section>

      <div className="big-tiles" style={{ marginTop: 16 }}>
        {GAMES.map((g) => (
          <button
            key={g.id}
            className="tile"
            onClick={() => { sfx.tap(); setGame(g.id); }}
          >
            <span className="tile-emoji">{g.emoji}</span>
            <span className="tile-title">{g.label}</span>
            <span className="tile-sub">{g.blurb}</span>
          </button>
        ))}
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="section-title">How to play</div>
        <p style={{ fontWeight: 600 }}>
          6 rounds, 3 lives. Tap an answer, or tap the letters to build the word. Earn stars
          for every game — 3 stars is a nice reward for Noah's star jar.
        </p>
      </section>
    </div>
  );
}