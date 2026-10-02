import { useMemo, useState } from 'react';
import { SOUNDS } from '../data/curriculum.js';
import { speak, speakSound, demoPhonic } from '../lib/speech.js';
import { sfx } from '../lib/sfx.js';
import { Toast, useToast } from '../components/Toast.jsx';
import { HighlightWord, SentenceTapper, TracingPad } from '../components/PhonicsKit.jsx';

export default function Learn({ stage, onDone, onNext, onBack }) {
  const initial = stage.sounds[0];
  const [sound, setSound] = useState(initial);
  const data = SOUNDS[sound];
  const [toast, showToast] = useToast();

  const position = stage.sounds.indexOf(sound);
  const next = stage.sounds[position + 1];

  const emojiForStage = useMemo(() => stage.emoji, [stage.emoji]);

  function completeLesson() {
    sfx.star();
    speak(`Great job Noah! You learned a new sound.`);
    showToast(`⭐ +1 star for the “${sound}” sound!`);
    onDone({ stage: stage.id, sound });
  }

  return (
    <div className="view">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn ghost" onClick={onBack}>
          ← Home
        </button>
        <span className="chip">
          {emojiForStage} Level {stage.id} · {stage.name}
        </span>
      </div>

      <section className="sound-hero" style={{ background: `linear-gradient(135deg, ${stage.color}, ${stage.color}dd)` }}>
        <p style={{ fontWeight: 800, opacity: 0.9, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Today's sound
        </p>
        <div className="sound-big">{sound}</div>
        <div className="sound-say">say it: “{data.say}”</div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
          <button
            className="btn"
            onClick={() => {
              sfx.tap();
              demoPhonic(sound);
            }}
          >
            🐢 Slow sound
          </button>
          <button
            className="btn"
            onClick={() => {
              sfx.tap();
              speakSound(sound);
            }}
          >
            ⚡ Quick sound
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-title">Words with “{sound}”</div>
        <div className="word-grid">
          {data.words.map(([word, emoji]) => (
            <button
              key={word}
              className="word-card"
              onClick={() => {
                sfx.tap();
                speak(word);
              }}
            >
              <span className="emoji" aria-hidden="true">{emoji}</span>
              <span className="w">
                <HighlightWord word={word} sound={sound} />
              </span>
            </button>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 10, fontWeight: 600 }}>
          👆 Tap any word to hear Noah's voice say it.
        </p>
      </section>

      <section className="card">
        <div className="section-title">Read the sentence</div>
        <SentenceTapper sentence={data.sentence} sound={sound} />
        <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
          <button
            className="btn primary"
            onClick={() => {
              sfx.tap();
              speak(data.sentence, { rate: 0.62 });
            }}
          >
            🔊 Read it with me
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-title">Trace with your finger</div>
        <TracingPad sound={sound} />
      </section>

      <section className="card">
        <div className="section-title">Parent cheat sheet</div>
        <p style={{ fontWeight: 600 }}>{data.tip}</p>
        <p className="muted" style={{ marginTop: 6, fontWeight: 600 }}>
          Common mistake: make sure the sound comes first in the word, then blend quickly.
        </p>
      </section>

      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn" disabled={position === 0} onClick={() => { sfx.tap(); setSound(stage.sounds[position - 1]); }}>
          ← Previous
        </button>
        <button className="btn green" onClick={completeLesson}>
          ⭐ I learned “{sound}”
        </button>
        {next ? (
          <button
            className="btn primary"
            onClick={() => {
              sfx.tap();
              setSound(next);
            }}
          >
            Next: {next} →
          </button>
        ) : (
          <button className="btn primary" onClick={onNext}>
            All done! 🎉
          </button>
        )}
      </div>

      <Toast message={toast} />
    </div>
  );
}