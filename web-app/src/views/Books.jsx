import { useState } from 'react';
import { BOOKS, STAGES } from '../data/curriculum.js';
import { sfx } from '../lib/sfx.js';
import BookReader from './BookReader.jsx';

export default function Books({ state, onPickStage, toggleBook, markRead, addStars }) {
  const [stageId, setStageId] = useState(state.stage);
  const [openTitle, setOpenTitle] = useState(null);
  const stage = STAGES.find((s) => s.id === stageId);
  const books = BOOKS[stageId] ?? [];

  if (openTitle) {
    const book = books.find((b) => b.title === openTitle) ?? { title: openTitle, note: '' };
    return (
      <BookReader
        stage={stage}
        book={book}
        isRead={(state.readList ?? []).includes(book.title)}
        isOwned={state.bookList.includes(book.title)}
        onBack={() => setOpenTitle(null)}
        onFinish={(title) => {
          markRead(title);
          addStars(2);
        }}
        onToggleOwned={toggleBook}
      />
    );
  }

  return (
    <div className="view">
      <section className="hero">
        <div className="hero-mascot" aria-hidden="true">📚</div>
        <h1>Book Levels</h1>
        <p className="muted" style={{ fontWeight: 700 }}>
          Tap a book to read it. Tick ✓ for books Noah owns.
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
            const read = (state.readList ?? []).includes(book.title);
            return (
              <div key={book.title} className={`book-row ${owned ? 'owned' : ''}`}>
                <button
                  type="button"
                  style={{ flex: 1, minWidth: 0, textAlign: 'left' }}
                  onClick={() => {
                    sfx.tap();
                    setOpenTitle(book.title);
                  }}
                  aria-label={`Read ${book.title}`}
                >
                  <span className="book-title" style={{ display: 'block' }}>
                    📖 {book.title}
                    {book.reference && <span className="flag">📗 non-fiction</span>}
                    {read && <span className="flag">✅ read</span>}
                  </span>
                  <span className="book-note" style={{ display: 'block' }}>{book.note}</span>
                </button>
                <button
                  type="button"
                  className="check"
                  style={owned ? { background: '#34c759', borderColor: '#24a148', color: '#fff' } : undefined}
                  onClick={() => {
                    sfx.tap();
                    toggleBook(book.title);
                  }}
                  aria-label={owned ? `Unmark ${book.title} as owned` : `Mark ${book.title} as owned`}
                >
                  {owned ? '✓' : ''}
                </button>
              </div>
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