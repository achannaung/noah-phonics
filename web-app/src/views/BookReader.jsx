import { useMemo, useState } from 'react';
import { buildMiniBook } from '../lib/reader.js';
import { speak } from '../lib/speech.js';
import { sfx } from '../lib/sfx.js';
import { SentenceTapper } from '../components/PhonicsKit.jsx';

export default function BookReader({ stage, book, isRead, isOwned, onBack, onFinish, onToggleOwned }) {
  const mini = useMemo(() => buildMiniBook(stage, book), [stage, book]);
  // 0 = cover, 1..pages = story, last = finish
  const [page, setPage] = useState(0);
  const total = mini.pages.length + 2;
  const last = total - 1;

  function finish() {
    sfx.fanfare();
    speak(`You read ${mini.title}. Amazing reading, Noah!`);
    onFinish(mini.title);
  }

  function go(next) {
    sfx.tap();
    if (next === last && page !== last) finish();
    setPage(next);
  }

  return (
    <div className="view">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn ghost" onClick={onBack}>
          ← Books
        </button>
        <span className="chip">
          📖 Page {Math.min(page + 1, total)} of {total}
        </span>
      </div>

      {page === 0 && (
        <section className="prompt-card">
          <div style={{ fontSize: '4.5rem' }} aria-hidden="true">
            {mini.emoji}📚
          </div>
          <div className="prompt-sound" style={{ fontSize: '2rem' }}>
            {mini.title}
          </div>
          <p style={{ fontWeight: 800, marginTop: 6 }}>
            Level {mini.stageId} · {mini.stageName}
          </p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button
              className="btn primary big"
              onClick={() => {
                sfx.tap();
                speak(mini.title, { rate: 0.7 });
                setPage(1);
              }}
            >
              Start reading ▶
            </button>
          </div>
        </section>
      )}

      {page > 0 && page < last && (
        <section className="prompt-card">
          <div style={{ fontSize: '4.5rem' }} aria-hidden="true">
            {mini.pages[page - 1].emoji}
          </div>
          <SentenceTapper sentence={mini.pages[page - 1].sentence} sound={stage.sounds[0]} />
          <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
            <button
              className="btn primary"
              onClick={() => {
                sfx.tap();
                speak(mini.pages[page - 1].sentence, { rate: 0.62 });
              }}
            >
              🔊 Read to me
            </button>
          </div>
          <p className="muted" style={{ marginTop: 10, fontWeight: 600 }}>
            👆 Tap any word to hear it.
          </p>
        </section>
      )}

      {page === last && (
        <div className="result-banner win">
          🎉 You read “{mini.title}”!
          <div style={{ fontSize: '1rem', marginTop: 8 }}>+2 stars for Noah’s star jar ⭐⭐</div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
            <button className="btn" onClick={() => { sfx.tap(); setPage(0); }}>
              🔁 Read again
            </button>
            <button className="btn" onClick={onBack}>
              📚 More books
            </button>
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
            <button className="btn" onClick={() => { sfx.tap(); onToggleOwned(mini.title); }}>
              {isOwned ? '✅ We own this book' : '📦 We own this book — tick it'}
            </button>
          </div>
        </div>
      )}

      <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
        <button className="btn" disabled={page === 0} onClick={() => go(page - 1)}>
          ← Back
        </button>
        <span className="chip">
          {'●'.repeat(page + 1)}
          {'○'.repeat(total - page - 1)}
        </span>
        {page < last ? (
          <button className="btn primary" onClick={() => go(page + 1)}>
            Next →
          </button>
        ) : (
          <button className="btn green" onClick={onBack}>
            Done ✓
          </button>
        )}
      </div>

      {isRead && page !== last && (
        <p className="muted" style={{ textAlign: 'center', marginTop: 10, fontWeight: 700 }}>
          📖 Already read — nice!
        </p>
      )}
    </div>
  );
}