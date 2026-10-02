# Noah's Phonics Adventure 🦊

A playful, offline-first phonics web app for Noah (age 5) — Oxford-style
letter sounds across 6 stages, word games, read-along sentences, letter
tracing, a book shelf, and a PIN-gated parent zone with printable worksheets.

**No build step. No backend. No ads, no accounts, no data collection.**
All progress (stars, streaks, accuracy) stays in the browser's `localStorage`.

## Run it

```sh
cd noah-phonics
python3 -m http.server 8080
# open http://localhost:8080
```

It also works by opening `index.html` directly (service worker needs http).

## Structure

```
noah-phonics/
  index.html          # home + nav + all views (shell)
  manifest.json       # PWA manifest
  sw.js               # offline-first service worker
  css/styles.css      # kid-friendly styles + print CSS for worksheets
  js/app.js           # router, store, Home, Learn, Exercise, Books, Parent Zone, worksheets
  js/speech.js        # Web Speech API wrapper + WebAudio sound cues
  js/data.js          # curriculum data (source of truth)
  js/games.js         # Sound Hunt, Missing Letter, Odd One Out, Spelling Bee
  data/curriculum.json# generated copy of the curriculum (reference/export)
  icons/              # PWA icons
```

## Curriculum

| Stage | Name | Focus |
|---|---|---|
| 1 | First Steps | s·a·t·p·i·n — blending CVC words |
| 2 | Fun & Friends | m·d·g·o·c·k |
| 3 | Plants & Animals | e·u·h·r·j·v·w·l·f·z |
| 4 | In the Village | ch·sh·th·ng·ai·ee·oa (digraphs) |
| 5 | Look Around! | oo·igh·ar·or·er·oy·ow (vowel teams) |
| 6 | Our World | qu·x·y·zz, blends, tricky sight words |

Each unit stores: focus sound, phonetic cue, mouth/action cue, 5 example
words with emoji, a decodable read-along sentence (⭐ marks tricky words),
and a parent cheat sheet (how to say it, common mistake, 3 practice words).
Stage levels reference Oxford Reading Tree stage groupings; the Books view
lists example ORT titles per stage — tick the ones you own.

## Features

- **Home / Noah's Hub** — mascot, stage picker, auto-generated 5-minute
  daily mission, star count, streak, sticker chart.
- **Learn** — big animated sound card (tap to hear, "watch it blend"),
  example words with pictures, tap-to-hear read-along sentence, finger
  tracing canvas, parent cheat sheet.
- **Exercise** — 3 modes per unit: Hear & Find, Missing Letter, Build the
  Word. Instant ✅/❌ with sound replay and praise.
- **Quiz Games** — Sound Hunt, Missing Letter, Odd One Out, Spelling Bee
  (progressive difficulty, 3 hearts, generous 40s timer).
- **Books** — ORT stage reference library + "books we own" checkboxes.
- **Parent Zone** (PIN-gated, default PIN `1234`, changeable inside) —
  progress per stage, accuracy, tricky-sounds report, reset/export,
  A4 printable worksheets (tracing, spot-the-sound, match-ups, copywork).
- **PWA** — installable, works fully offline (speech uses device voices).

## Deploy

Static hosting (Vercel, GitHub Pages, Netlify…): serve the folder as-is,
no build command needed.

## Regenerating `data/curriculum.json`

```sh
node -e "const fs=require('fs'); const src=fs.readFileSync('js/data.js','utf8');
eval(src.replace('const CURRICULUM','globalThis.CURRICULUM'));
fs.writeFileSync('data/curriculum.json', JSON.stringify(globalThis.CURRICULUM,null,2));"
```
