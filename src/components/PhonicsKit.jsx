import { useCallback, useRef, useState } from 'react';
import { speak, speakSound } from '../lib/speech.js';
import { sfx } from '../lib/sfx.js';

// Colourful letter with the focus sound highlighted.
export function HighlightWord({ word, sound, className = '' }) {
  const letters = [...word];
  const target = sound.length === 1 ? sound : sound[0];
  const index = letters.findIndex((ch) => ch.toLowerCase() === target);
  return (
    <span className={className}>
      {letters.map((ch, i) => (
        <span key={i} className={i === index ? 'hl' : undefined}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export function SpeakButton({ text, label = 'Hear it', className = 'btn', sound = false }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        sfx.tap();
        if (sound) speakSound(text);
        else speak(text);
      }}
    >
      🔊 {label}
    </button>
  );
}

export function SoundTap({ sound, children }) {
  return (
    <button
      type="button"
      className="sound-chip"
      onClick={() => {
        sfx.tap();
        speakSound(sound);
      }}
      aria-label={`Say the sound ${sound}`}
    >
      {children ?? sound}
    </button>
  );
}

export function SentenceTapper({ sentence, sound }) {
  const target = sound.length === 1 ? sound : sound[0];
  return (
    <p className="sentence">
      {sentence.split(' ').map((word, i) => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, '');
        const isTarget = clean.includes(target);
        return (
          <span key={i}>
            <button
              type="button"
              className="tap-word"
              style={isTarget ? { color: '#e07800', fontWeight: 900 } : undefined}
              onClick={() => {
                sfx.tap();
                speak(word.replace(/[^A-Za-z' ]/g, ''));
              }}
            >
              {word}
            </button>{' '}
          </span>
        );
      })}
    </p>
  );
}

// Finger-tracing canvas over a dotted letter.
export function TracingPad({ sound }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return { ctx, rect };
  }, []);

  const position = (event) => {
    const source = event.touches?.[0] ?? event;
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  };

  const start = (event) => {
    event.preventDefault();
    const ctx = setup()?.ctx;
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = position(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#ff8c42';
    ctx.lineWidth = 12;
  };

  const move = (event) => {
    if (!drawing.current) return;
    event.preventDefault();
    const ctx = setup()?.ctx;
    if (!ctx) return;
    const { x, y } = position(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = setup()?.ctx;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sfx.tap();
  };

  return (
    <div>
      <div className="trace-wrap">
        <span className="trace-letter">{sound}</span>
        <canvas
          ref={canvasRef}
          className="trace-canvas"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <button type="button" className="btn" onClick={clear}>
          🧽 Clear
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            sfx.tap();
            speakSound(sound);
          }}
        >
          🔊 Listen first
        </button>
      </div>
    </div>
  );
}

export function useFeedback() {
  const [result, setResult] = useState(null);
  const flash = useCallback((isCorrect, message) => {
    setResult({ isCorrect, message });
    if (isCorrect) sfx.correct();
    else sfx.wrong();
    window.setTimeout(() => setResult(null), 1400);
  }, []);
  return [result, flash];
}