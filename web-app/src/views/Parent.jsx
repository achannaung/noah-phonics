import { useState } from 'react';
import { SOUNDS, STAGES } from '../data/curriculum.js';
import { speakSound } from '../lib/speech.js';

const PIN = '1234';

function Worksheet({ stage }) {
  const sounds = stage.sounds.slice(0, 6);
  const otherStage = STAGES.find((s) => s.id !== stage.id);
  const otherSound = (otherStage ? otherStage.sounds[0] : 'zz');

  const traceSound = sounds[0];
  const circleSound = sounds[1] ?? traceSound;
  const circleWords = SOUNDS[circleSound].words.slice(0, 3).map((w) => w[0]);
  const decoys = SOUNDS[otherSound].words.slice(0, 2).map((w) => w[0]);
  const gapSound = sounds[2] ?? traceSound;
  const gapWords = SOUNDS[gapSound].words.slice(0, 4).map((w) => w[0] + '_' + w[0].slice(1));
  const drawSound = sounds[3] ?? traceSound;
  const drawWords = SOUNDS[drawSound].words.slice(0, 3).map((w) => w[0]);

  return (
    <div className="card sheet">
      <h2 style={{ fontStyle: 'normal' }}>
        Level {stage.id} · {stage.name} — practice sheet
      </h2>
      <p style={{ fontWeight: 700 }}>Name: ______________________ Date: ____________</p>
      <div style={{ marginTop: 12 }}>
        <strong>1. Write the sound 5 times.</strong>
        <div className="row" style={{ marginTop: 6, gap: 0 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: 68,
                height: 74,
                border: '1px solid #999',
                marginRight: 6,
              }}
            />
          ))}
        </div>
        <strong style={{ fontSize: '1.6rem' }}>{traceSound}</strong>
      </div>
      <div style={{ marginTop: 18 }}>
        <strong>
          2. Circle the words with the “{circleSound}” sound.
        </strong>
        <p style={{ marginTop: 6, fontSize: '1.1rem', fontWeight: 700 }}>
          {circleWords.concat(decoys).join('     ')}
        </p>
      </div>
      <div style={{ marginTop: 18 }}>
        <strong>3. Fill in the missing letter.</strong>
        <p style={{ marginTop: 6, fontSize: '1.1rem', fontWeight: 700 }}>
          {gapWords.join('     ')}
        </p>
      </div>
      <div style={{ marginTop: 18 }}>
        <strong>4. Draw a picture of one of these words and label it.</strong>
        <div className="row" style={{ gap: 6, marginTop: 6 }}>
          {drawWords.map((w) => (
            <span key={w} style={{ fontWeight: 800 }}>
              {w}
            </span>
          ))}
        </div>
        <div style={{ border: '1px solid #999', height: 150, marginTop: 6 }} />
      </div>
    </div>
  );
}

export default function Parent({ progress, recordUnit }) {
  const { state, learnedCount, totalUnits, trickySounds, unitStats, reset } = progress;
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [sheetStage, setSheetStage] = useState(state.stage);

  if (!unlocked) {
    return (
      <div className="view">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }} aria-hidden="true">🔐</div>
          <h2>Parent Zone</h2>
          <p className="muted" style={{ fontWeight: 600 }}>
            Enter the PIN (hint: 1234)
          </p>
          <input
            className="pin-input"
            type="password"
            inputMode="numeric"
            value={pin}
            maxLength={4}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && pin === PIN) setUnlocked(true);
            }}
            placeholder="••••"
            aria-label="Parent PIN"
          />
          <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
            <button
              className="btn primary"
              onClick={() => {
                if (pin === PIN) setUnlocked(true);
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalCorrect = Object.values(state.units).reduce((sum, u) => sum + u.correct, 0);
  const totalWrong = Object.values(state.units).reduce((sum, u) => sum + u.wrong, 0);
  const accuracy = totalCorrect + totalWrong ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;

  return (
    <div className="view">
      <section className="hero">
        <div className="hero-mascot" aria-hidden="true">👨‍👩‍👦</div>
        <h1>Parent Zone</h1>
        <p className="muted" style={{ fontWeight: 700 }}>Everything stays on this device — nothing is uploaded.</p>
      </section>

      <div className="stat-grid" style={{ marginTop: 16 }}>
        <div className="stat">
          <div className="num">{learnedCount}</div>
          <div className="lbl">sounds learned</div>
        </div>
        <div className="stat">
          <div className="num">{state.stars}</div>
          <div className="lbl">stars earned</div>
        </div>
        <div className="stat">
          <div className="num">{state.streak}</div>
          <div className="lbl">day streak</div>
        </div>
        <div className="stat">
          <div className="num">{accuracy}%</div>
          <div className="lbl">accuracy</div>
        </div>
      </div>

      <section className="card" style={{ marginTop: 14 }}>
        <div className="section-title">Sounds needing more practice</div>
        {trickySounds.length ? (
          <div className="grid">
            {trickySounds.map(([sound, count]) => (
              <div key={sound} className="book-row" style={{ cursor: 'default' }}>
                <span className="sound-chip hot">{sound}</span>
                <span style={{ flex: 1 }}>
                  <span className="book-title" style={{ display: 'block' }}>{SOUNDS[sound]?.tip}</span>
                  <span className="book-note">{count} mistakes — say it slowly, then blend.</span>
                </span>
                <button className="btn" onClick={() => speakSound(sound)}>🔊</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ fontWeight: 600 }}>No problem sounds yet — nice and steady!</p>
        )}
      </section>

      <section className="card">
        <div className="section-title">All sounds (click to mark learned)</div>
        <div className="grid">
          {STAGES.map((stage) => (
            <div key={stage.id}>
              <p style={{ fontWeight: 800, margin: '6px 0' }}>
                {stage.emoji} Level {stage.id} · {stage.name}
              </p>
              <div className="chip-list">
                {stage.sounds.map((sound) => {
                  const st = unitStats(stage.id, sound);
                  return (
                    <button
                      key={sound}
                      className={`sound-chip ${st.learned ? 'learned' : ''}`}
                      onClick={() => recordUnit({ stage: stage.id, sound }, { learned: !st.learned })}
                    >
                      {sound}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card no-print">
        <div className="section-title">Print a practice sheet</div>
        <div className="row">
          {STAGES.map((stage) => (
            <button
              key={stage.id}
              className={`btn ${sheetStage === stage.id ? 'primary' : ''}`}
              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
              onClick={() => setSheetStage(stage.id)}
            >
              Level {stage.id}
            </button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={() => window.print()}>
            🖨️ Print Level {sheetStage} sheet
          </button>
        </div>
      </section>

      <Worksheet stage={STAGES.find((s) => s.id === sheetStage)} />

      <section className="card no-print">
        <div className="section-title">Data</div>
        <div className="row">
          <button
            className="btn"
            onClick={() => {
              const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'noah-phonics-progress.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            ⬇️ Export progress
          </button>
          <button className="btn" onClick={() => window.confirm('Reset all progress for Noah?') && reset()}>
            🗑️ Reset progress
          </button>
        </div>
        <p className="muted" style={{ marginTop: 8, fontWeight: 600 }}>
          {totalUnits} sounds tracked across {STAGES.length} levels. Change the PIN in ParentZone
          if Noah discovers it.
        </p>
      </section>
    </div>
  );
}

export { Worksheet };