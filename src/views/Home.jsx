import { useMemo } from 'react';
import { STAGES, SOUNDS } from '../data/curriculum.js';
import { sfx } from '../lib/sfx.js';
import { SpeakButton } from '../components/PhonicsKit.jsx';

export default function Home({ progress, onPickStage, onOpen }) {
  const { state, stageInfo, unitStats, learnedCount, totalUnits } = progress;

  const todayMission = useMemo(() => {
    const stage = stageInfo ?? STAGES[0];
    const next =
      stage.sounds.find((s) => !unitStats(stage.id, s).learned) ?? stage.sounds[0];
    const data = SOUNDS[next];
    return { stage, sound: next, data };
  }, [stageInfo, unitStats]);

  const pct = totalUnits ? Math.round((learnedCount / totalUnits) * 100) : 0;

  return (
    <div className="view">
      <section className="hero">
        <div className="hero-mascot" aria-hidden="true">
          🦉
        </div>
        <h1>Hi Noah! Ready to read?</h1>
        <p className="muted" style={{ fontWeight: 700 }}>
          Level {state.stage} · {stageInfo?.name}
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
          <button
            className="btn primary big"
            onClick={() => {
              sfx.tap();
              onOpen('learn', { sound: todayMission.sound });
            }}
          >
            ▶️ Today's sound: “{todayMission.sound}”
          </button>
        </div>
        <p className="muted" style={{ marginTop: 10, fontWeight: 600 }}>
          {todayMission.data.tip}
        </p>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="section-title">Your progress</div>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <strong>{learnedCount} of {totalUnits} sounds learned</strong>
          <strong style={{ color: '#e07800' }}>{pct}%</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <span className="chip">⭐ {state.stars} stars</span>
          <span className="chip">🔥 {state.streak}-day streak</span>
          <span className="chip">🎮 {state.gamesPlayed} games</span>
        </div>
      </section>

      <div className="big-tiles" style={{ marginTop: 16 }}>
        <button className="tile" onClick={() => { sfx.tap(); onOpen('learn'); }}>
          <span className="tile-emoji">📖</span>
          <span className="tile-title">Learn</span>
          <span className="tile-sub">Meet a new sound</span>
        </button>
        <button className="tile" onClick={() => { sfx.tap(); onOpen('exercise'); }}>
          <span className="tile-emoji">✏️</span>
          <span className="tile-title">Exercise</span>
          <span className="tile-sub">Practise with Noah's level</span>
        </button>
        <button className="tile" onClick={() => { sfx.tap(); onOpen('games'); }}>
          <span className="tile-emoji">🎮</span>
          <span className="tile-title">Quiz Games</span>
          <span className="tile-sub">4 fun challenges</span>
        </button>
        <button className="tile" onClick={() => { sfx.tap(); onOpen('books'); }}>
          <span className="tile-emoji">📚</span>
          <span className="tile-title">Books</span>
          <span className="tile-sub">Reading Tree levels</span>
        </button>
        <button className="tile" onClick={() => { sfx.tap(); onOpen('parent'); }}>
          <span className="tile-emoji">👨‍👩‍👦</span>
          <span className="tile-title">Parent Zone</span>
          <span className="tile-sub">Progress &amp; worksheets</span>
        </button>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="section-title">Choose a level</div>
        <div className="grid">
          {STAGES.map((stage) => {
            const learned = stage.sounds.filter((s) => unitStats(stage.id, s).learned).length;
            const complete = learned === stage.sounds.length;
            return (
              <button
                key={stage.id}
                className={`stage-card ${state.stage === stage.id ? 'selected' : ''}`}
                onClick={() => {
                  sfx.tap();
                  onPickStage(stage.id);
                }}
              >
                <span className="stage-num" style={{ background: stage.color }}>
                  {stage.emoji}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="tile-title" style={{ display: 'block' }}>
                    Level {stage.id} · {stage.name}
                    {complete && <span className="flag">✅</span>}
                  </span>
                  <span className="tile-sub" style={{ display: 'block' }}>
                    {stage.blurb}
                  </span>
                  <span className="chip-list" style={{ marginTop: 6 }}>
                    {stage.sounds.map((sound) => (
                      <span
                        key={sound}
                        className={`chip ${
                          unitStats(stage.id, sound).wrong > unitStats(stage.id, sound).correct
                            ? 'hot'
                            : ''
                        }`}
                      >
                        {sound}
                        {unitStats(stage.id, sound).learned && <span className="flag">✓</span>}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="muted" style={{ fontWeight: 800 }}>
                  {learned}/{stage.sounds.length}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="section-title">Read-aloud tip</div>
        <p style={{ fontWeight: 600 }}>
          Say the sound, then blend it into the word slowly: <strong>s</strong>…s-u-n →{' '}
          <strong>sun</strong>. Only speed up once Noah blends it by himself.
        </p>
        <div className="row" style={{ marginTop: 10 }}>
          <SpeakButton text="Sam has a sun hat." label="Try a practice sentence" />
        </div>
      </section>
    </div>
  );
}