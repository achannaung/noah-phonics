import { useState } from 'react';
import { BOOKS, STAGES } from '../data/curriculum.js';
import { sfx } from '../lib/sfx.js';

export default function Books({ state, onPickStage, toggleBook }) {
  const [stageId, setStageId] = useState(state.stage);
  const stage = STAGES.find((s) => s.id === stageId);
  const books = BOOKS[stageId] ?? [];

  return (
    <div className="view">
      <section className="hero">
        <div className="hero-mascot" aria-hidden="true">📚</div>
        <h1>Book Levels</h1>
        <p className="muted" style={{ fontWeight: 700 }}>
          Tick the books Noah owns to track your reading library.
        </p>
      </section>

      <div className="row" style={{ marginTop: 16, marginBottom: 12 }}>
        {STAGES.map((s) => (
          <button
            key={s.id}
            className={`btn ${stageId === s.id ? 'primary' : ''}`}
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
            onClick={() => { sfx.tap(); setStageId(s.id); }}
          >
            {s.emoji} {s.id}
          </button>
        ))}
      </div>

      <section className="card">
        <div className="section-title">
          Level {stage.id} · {stage.name}
        </div>
        <p className="muted" style={{ fontWeight: 600, marginBottom: 12 }}>
          {stage.blurb}
        </p>
        <div className="row" style={{ marginBottom: 14 }}>
          <span className="chip">Sounds: {stage.sounds.join(', ')}</span>
        </div>

        <div className="grid">
          {books.map((book) => {
            const owned = state.bookList.includes(book.title);
            return (
              <button
                key={book.title}
                className={`book-row ${owned ? 'owned' : ''}`}
                onClick={() => { sfx.tap(); toggleBook(book.title); }}
              >
                <span className="check" aria-hidden="true">{owned ? '✓' : ''}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="book-title" style={{ display: 'block' }}>
                    {book.title}
                    {book.reference && <span className="flag">📗 non-fiction</span>}
                  </span>
                  <span className="book-note" style={{ display: 'block' }}>{book.note}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="row" style={{ marginTop: 16 }}>
          <button
            className="btn primary"
            onClick={() => { sfx.tap(); onPickStage(stageId); }}
          >
            Practise this level’s sounds →
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-title">Reading tip</div>
        <p style={{ fontWeight: 600 }}>
          Read the same book three days in a row. Day 1 read together, day 2 you read each word,
          day 3 Noah reads it to you. Familiarity builds real fluency.
        </p>
      </section>
    </div>
  );
}