# Noah's Phonics Adventure 🦉

A kid-friendly Oxford Reading Tree style phonics web app built with React + Vite.

- **Learn** — 6 levels, 50+ sounds, tap-to-hear words, read-along sentences, finger tracing, parent cheat sheet per sound.
- **Exercise** — Find the sound / Which sound? / Spell it, with instant audio feedback.
- **Quiz Games** — Sound Hunt, Odd One Out, Missing Letter, Spelling Bee (6 rounds, 3 lives, stars).
- **Books** — book levels with "books we own" checklist.
- **Parent Zone** (PIN `1234`) — stars, streak, accuracy, tricky-sounds report, printable practice sheets, export/reset.
- **Privacy** — 100% on-device via `localStorage`. No accounts, no tracking, no ads.
- **Speech** — uses the browser's built-in Speech Synthesis (free, works offline once voices load).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

Node 20.19+ or 22.12+ recommended.

## Deploy

Static Vite build (`dist/`). Works on Vercel / Netlify / GitHub Pages with zero config.

## Project layout

- `src/data/curriculum.js` — stages, sounds, words, sentences, book levels (edit content here)
- `src/lib/` — speech (TTS), sfx (Web Audio), progress (localStorage), questions (quiz builders)
- `src/views/` — Home, Learn, Exercise, Games, Books, Parent
- `src/components/` — shared phonics UI kit + toasts
