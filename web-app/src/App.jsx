import { useEffect, useState } from 'react';
import { useProgress } from './lib/progress.js';
import { getStage } from './data/curriculum.js';
import { sfx } from './lib/sfx.js';
import Home from './views/Home.jsx';
import Learn from './views/Learn.jsx';
import Exercise from './views/Exercise.jsx';
import Games from './views/Games.jsx';
import Books from './views/Books.jsx';
import Parent from './views/Parent.jsx';

const TABS = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'learn', label: 'Learn', emoji: '📖' },
  { id: 'exercise', label: 'Exercise', emoji: '✏️' },
  { id: 'games', label: 'Games', emoji: '🎮' },
  { id: 'books', label: 'Books', emoji: '📚' },
  { id: 'parent', label: 'Grown-ups', emoji: '👨‍👩‍👦' },
];

export default function App() {
  const progress = useProgress();
  const [tab, setTab] = useState('home');
  const [pendingSound, setPendingSound] = useState(null);
  const stage = getStage(progress.state.stage) ?? getStage(1);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  function open(next, options = {}) {
    sfx.tap();
    setTab(next);
    if (options.sound) setPendingSound(options.sound);
  }

  function renderView() {
    switch (tab) {
      case 'learn':
        return (
          <Learn
            key={`${stage.id}-${pendingSound ?? ''}`}
            stage={stage}
            onDone={(unit) => progress.recordUnit(unit, { learned: true })}
            onNext={() => open('games')}
            onBack={() => open('home')}
          />
        );
      case 'exercise':
        return <Exercise stage={stage} recordUnit={progress.recordUnit} onBack={() => open('home')} />;
      case 'games':
        return (
          <Games stage={stage} recordUnit={progress.recordUnit} addStars={progress.addStars} />
        );
      case 'books':
        return (
          <Books
            state={progress.state}
            onPickStage={(id) => {
              progress.setStage(id);
              open('learn');
            }}
            toggleBook={progress.toggleBook}
          />
        );
      case 'parent':
        return <Parent progress={progress} recordUnit={progress.recordUnit} />;
      default:
        return <Home progress={progress} onPickStage={progress.setStage} onOpen={open} />;
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">
          <span className="brand-badge" aria-hidden="true">A</span>
          <span className="brand-text">Noah’s Phonics</span>
        </span>
        <span className="stars-pill">⭐ {progress.state.stars}</span>
      </header>

      {renderView()}

      <nav className="tabs" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => open(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span className="tab-emoji" aria-hidden="true">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}