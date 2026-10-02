import { useMemo, useState } from 'react';
import { speak, speakSound } from '../lib/speech.js';
import { sfx } from '../lib/sfx.js';
import { buildQuestionBank } from '../lib/questions.js';
import { Toast, useToast } from '../components/Toast.jsx';

const MODES = [
  { id: 'find', label: 'Find the sound', emoji: '🔍' },
  { id: 'spell', label: 'Spell it', emoji: '🔤' },
  { id: 'sound', label: 'Which sound?', emoji: '👂' },
];

export default function Exercise({ stage, onBack, recordUnit }) {
  const [mode, setMode] = useState('find');
  const [round, setRound] = useState(0);
  const questions = useMemo(
    () => buildQuestionBank(mode, stage.sounds, 6),
    [mode, stage.sounds, round],
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [typed, setTyped] = useState([]);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [toast, showToast] = useToast();

  const question = questions[index];

  function reset() {
    setIndex(0);
    setPicked(null);
    setTyped([]);
    setScore({ correct: 0, wrong: 0 });
  }

  function switchMode(next) {
    sfx.tap();
    setMode(next);
    setRound((r) => r + 1);
    reset();
  }

  function next() {
    if (index + 1 >= questions.length) {
      setRound((r) => r + 1);
      reset();
      return;
    }
    setPicked(null);
    setTyped([]);
    setIndex((i) => i + 1);
  }

  function record(sound, ok) {
    setScore((s) => ({ ...s, [ok ? 'correct' : 'wrong']: s[ok ? 'correct' : 'wrong'] + 1 }));
    recordUnit({ stage: stage.id, sound }, { correct: ok ? 1 : 0, wrong: ok ? 0 : 1 });
  }

  function choose(word) {
    if (picked) return;
    setPicked(word);
    const ok = word === question.answer;
    record(question.unitSound, ok);
    if (ok) showToast('Yes! 🎉');
    else {
      showToast(`Almost! It was “${question.answer}”.`);
      speak(question.answer);
    }
  }

  function submitSpelling() {
    const built = typed.join('');
    const ok = built === question.answer;
    setPicked(built);
    record(question.unitSound, ok);
    if (ok) showToast(`You spelled ${question.answer}! ⭐`);
    else showToast(`The word is ${question.answer}`);
  }

  const total = score.correct + score.wrong;
  const accuracy = total ? Math.round((score.correct / total) * 100) : 0;

  if (!question) {
    return (
      <div className="view">
        <div className="card">Loading exercises…</div>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn ghost" onClick={onBack}>
          ← Home
        </button>
        <span className="chip">
          ✏️ Level {stage.id} · {stage.name}
        </span>
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`btn ${mode === m.id ? 'primary' : ''}`}
            onClick={() => switchMode(m.id)}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="chip">Question {index + 1} of {questions.length}</span>
        <span className="chip">✅ {score.correct} right</span>
        <span className="chip">❌ {score.wrong} wrong</span>
        <span className="chip">🎯 {accuracy}%</span>
      </div>

      {mode === 'find' && (
        <section className="prompt-card">
          <div className="prompt-sound">{question.prompt.match(/“(.+)”/)[1]}</div>
          <p style={{ fontWeight: 800, marginTop: 6 }}>
            {question.promptKind === 'uses' ? 'Which word uses this sound?' : 'Which word starts with it?'}
          </p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
            <button className="btn" onClick={() => { sfx.tap(); speakSound(question.prompt.match(/“(.+)”/)[1]); }}>
              🔊 Hear the sound
            </button>
          </div>
          <div className="answer-grid" style={{ marginTop: 16 }}>
            {question.options.map((opt) => (
              <button
                key={opt.word}
                className={`answer-btn ${
                  picked && opt.word === question.answer ? 'right' : picked === opt.word ? 'wrong' : ''
                }`}
                onClick={() => choose(opt.word)}
              >
                <span className="emoji" aria-hidden="true">{opt.emoji}</span>
                {opt.word}
              </button>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button className="btn primary" disabled={!picked} onClick={next}>
              Next question →
            </button>
          </div>
        </section>
      )}

      {mode === 'sound' && (
        <section className="prompt-card">
          <div style={{ fontSize: '4rem' }} aria-hidden="true">{question.word[1]}</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, margin: '6px 0' }}>{question.word[0]}</div>
          <p style={{ fontWeight: 800 }}>Which sound does this word use?</p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
            <button className="btn" onClick={() => { sfx.tap(); speak(question.word[0]); }}>
              🔊 Hear the word
            </button>
          </div>
          <div className="answer-grid" style={{ marginTop: 16 }}>
            {question.options.map((sound) => (
              <button
                key={sound}
                className={`answer-btn ${
                  picked && sound === question.answer ? 'right' : picked === sound ? 'wrong' : ''
                }`}
                onClick={() => {
                  if (picked) return;
                  setPicked(sound);
                  const ok = sound === question.answer;
                  if (ok) setScore((s) => ({ ...s, correct: s.correct + 1 }));
                  else setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
                  recordUnit({ stage: stage.id, sound: question.unitSound }, { correct: ok ? 1 : 0, wrong: ok ? 0 : 1 });
                  if (ok) showToast('Correct sound! 🎉');
                  else {
                    showToast(`That word uses “${question.answer}”.`);
                    speak(question.word[0]);
                  }
                }}
              >
                {sound}
              </button>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button className="btn primary" disabled={!picked} onClick={next}>
              Next question →
            </button>
          </div>
        </section>
      )}

      {mode === 'spell' && (
        <section className="prompt-card">
          <div style={{ fontSize: '3.4rem' }} aria-hidden="true">{question.emoji}</div>
          <p style={{ fontWeight: 800 }}>{question.prompt}</p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
            <button className="btn" onClick={() => { sfx.tap(); speak(question.answer); }}>
              🔊 Hear the word
            </button>
          </div>
          <div className="letter-slots" style={{ marginTop: 14 }}>
            {question.answer.split('').map((_, i) => (
              <span key={i} className={`slot ${i < typed.length ? 'filled' : 'empty-slot'}`}>
                {typed[i] ?? ''}
              </span>
            ))}
          </div>
          <div className="letter-bank">
            {question.bank.map((letter, i) => {
              const usedCount = typed.filter((t) => t === letter).length;
              const available = question.bank.filter((l) => l === letter).length;
              const isUsed = usedCount >= available;
              return (
                <button
                  key={`${letter}-${i}`}
                  className={`letter-tile ${isUsed ? 'used' : ''}`}
                  onClick={() => {
                    sfx.tap();
                    setTyped((prev) => [...prev, letter]);
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button className="btn" onClick={() => { sfx.tap(); setTyped((prev) => prev.slice(0, -1)); }} disabled={!typed.length}>↩️ Undo</button>
            <button
              className="btn green"
              disabled={typed.length !== question.answer.length || !!picked}
              onClick={submitSpelling}
            >
              Check
            </button>
            <button className="btn primary" disabled={!picked} onClick={next}>
              Next →
            </button>
          </div>
        </section>
      )}

      <Toast message={toast} />
      <p className="muted" style={{ textAlign: 'center', marginTop: 16, fontWeight: 700 }}>
        Tip: start with the sound chips on the Learn page, then come back and do 6 questions
        only — short sessions work best for 5-year-olds.
      </p>
    </div>
  );
}