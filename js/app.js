/* Noah's Phonics Adventure — app core: store, router, chrome, home */
'use strict';

const $ = (sel, r = document) => r.querySelector(sel);
const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = (a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const pickN = (a, n) => shuffle(a).slice(0, n);

/* ================= Store ================= */
const Store = {
  KEY: 'noahPhonicsV1',
  data: null,
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(this.KEY)); } catch (e) {}
    this.data = Object.assign({ v: 1, stars: 0, streak: { last: null, count: 0 }, progress: {}, booksOwned: [], pin: '1234', lastGameDay: null }, d || {});
    this.touchStreak();
    return this.data;
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) {} },
  reset() { try { localStorage.removeItem(this.KEY); } catch (e) {} this.load(); },
  today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  touchStreak() {
    const t = this.today(), s = this.data.streak;
    if (s.last === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const ys = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    s.count = (s.last === ys) ? s.count + 1 : 1;
    s.last = t; this.save();
  }
};

/* ================= App ================= */
const App = {
  view: null,
  grownUp: sessionStorage.getItem('npaGrown') === '1',

  init() {
    Store.load();
    this.view = $('#view');
    this.renderChrome();
    window.addEventListener('hashchange', () => this.route());
    document.addEventListener('pointerdown', () => Sfx.unlock(), { once: true });
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    this.route();
    setTimeout(() => $('#splash').classList.add('gone'), 500);
  },

  /* ----- helpers ----- */
  getStage(id) { return CURRICULUM.stages.find(s => s.id === +id); },
  getUnit(s, i) { const st = this.getStage(s); return st ? st.units[+i] : null; },
  unitKey(s, i) { return 's' + s + 'u' + i; },
  prog(key) { return Store.data.progress[key] || { done: false, correct: 0, total: 0 }; },
  unitDone(s, i) { return !!this.prog(this.unitKey(s, i)).done; },

  record(key, ok) {
    const p = Store.data.progress[key] || (Store.data.progress[key] = { done: false, correct: 0, total: 0 });
    p.total++; if (ok) p.correct++;
    Store.save(); this.updatePills();
  },
  markDone(s, i) {
    const key = this.unitKey(s, i);
    const p = Store.data.progress[key] || (Store.data.progress[key] = { done: false, correct: 0, total: 0 });
    p.done = true; Store.save();
  },
  addStars(n) {
    Store.data.stars += n; Store.save(); this.updatePills(true);
    const pill = $('#pill-stars'); if (pill) { pill.style.transform = 'scale(1.25)'; setTimeout(() => pill.style.transform = '', 250); }
  },
  toast(msg, ms = 1800) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(this._toastT); this._toastT = setTimeout(() => t.classList.remove('show'), ms);
  },
  confetti(n = 40) {
    const fx = $('#fx'), colors = ['#FFD93D', '#FF5D5D', '#5BBF5B', '#3FA7F5', '#8338EC', '#FF6FAE'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 0.4) + 's';
      fx.appendChild(c); setTimeout(() => c.remove(), 2200);
    }
  },
  go(hash) { if (location.hash === hash) this.route(); else location.hash = hash; },

  /* ----- chrome ----- */
  renderChrome() {
    $('#topbar').innerHTML = `
      <div class="brand">🦊 Noah's Phonics</div><div class="spacer"></div>
      <span class="pill streak">🔥 ${Store.data.streak.count}</span>
      <span class="pill stars" id="pill-stars">⭐ ${Store.data.stars}</span>`;
    const tabs = [
      ['#/', '🏠', 'Home'], ['#/stages', '📖', 'Learn'],
      ['#/games', '🎮', 'Play'], ['#/books', '📚', 'Books'], ['#/grownups', '🔒', 'Grown-ups']
    ];
    $('#tabbar').innerHTML = tabs.map(([h, ic, lb]) =>
      `<a href="${h}" data-tab="${h}"><span class="ti">${ic}</span>${lb}</a>`).join('');
  },
  updatePills(pop) {
    const s = $('#pill-stars'); if (s) s.innerHTML = `⭐ ${Store.data.stars}`;
    const pills = $$('#topbar .pill.streak'); if (pills[0]) pills[0].innerHTML = `🔥 ${Store.data.streak.count}`;
    void pop;
  },
  setTab(hash) {
    $$('#tabbar a').forEach(a => {
      const t = a.dataset.tab;
      a.classList.toggle('active', t === '#/' ? (hash === '#/' || hash === '') : hash.startsWith(t));
    });
  },

  /* ----- router ----- */
  route() {
    const h = location.hash || '#/';
    const parts = h.replace(/^#\//, '').split('/');
    const [name, a, b, c] = parts;
    window.scrollTo(0, 0);
    this.setTab(h);
    const V = this.view;
    ({ '': () => Views.home(V),
       'stages': () => Views.stages(V),
       'stage': () => Views.stage(V, a),
       'learn': () => Views.learn(V, a, b),
       'exercise': () => Views.exercise(V, a, b, c || 'find'),
       'games': () => Views.gamesMenu(V),
       'game': () => Views.game(V, a, b),
       'books': () => Views.books(V),
       'grownups': () => Views.grownups(V),
       'sheet': () => Views.sheet(V, a, b),
    }[name] || (() => Views.home(V)))();
  },

  /* ----- mission / progress ----- */
  nextUnit() {
    for (const st of CURRICULUM.stages)
      for (let i = 0; i < st.units.length; i++)
        if (!this.unitDone(st.id, i)) return { stageId: st.id, unitIdx: i, unit: st.units[i], stage: st };
    const st = CURRICULUM.stages[0];
    return { stageId: st.id, unitIdx: 0, unit: st.units[0], stage: st, allDone: true };
  },
  stageProgress(st) {
    let done = 0;
    st.units.forEach((_, i) => { if (this.unitDone(st.id, i)) done++; });
    return { done, total: st.units.length };
  },
  gamePool(stageId) {
    const pool = [];
    CURRICULUM.stages.forEach(st => {
      if (+stageId !== 0 && st.id !== +stageId) return;
      st.units.forEach((unit, unitIdx) => pool.push({ stageId: st.id, unitIdx, unit, stage: st }));
    });
    return pool;
  },
  trickyUnits() {
    const out = [];
    CURRICULUM.stages.forEach(st => st.units.forEach((unit, i) => {
      const p = this.prog(this.unitKey(st.id, i));
      if (p.total >= 4 && p.correct / p.total < 0.7) out.push({ stage: st, unit, idx: i, acc: p.correct / p.total });
    }));
    return out.sort((x, y) => x.acc - y.acc);
  }
};

const Views = {};
document.addEventListener('DOMContentLoaded', () => App.init());

/* ================= HOME ================= */
Views.home = function (V) {
  const m = App.nextUnit();
  const playedToday = Store.data.lastGameDay === Store.today();
  const mission = m.allDone ? [
    { ic: '🏆', t: 'You finished every sound!', d: 'Free play — pick any game.', go: '#/games', done: true },
    { ic: '🎮', t: 'Play a game', d: 'Keep those sounds sharp!', go: '#/games', done: playedToday },
    { ic: '📚', t: 'Browse the books', d: 'See what each stage teaches.', go: '#/books', done: false },
  ] : [
    { ic: '📖', t: `Learn: the “${m.unit.sound}” sound`, d: `${m.stage.name} · about 2 min`, go: `#/learn/${m.stageId}/${m.unitIdx}`, done: !!App.prog(App.unitKey(m.stageId, m.unitIdx)).seen },
    { ic: '✏️', t: 'Practice it', d: 'Tap-the-word game · about 2 min', go: `#/exercise/${m.stageId}/${m.unitIdx}/find`, done: App.unitDone(m.stageId, m.unitIdx) },
    { ic: '🎮', t: 'Play Sound Hunt', d: 'Find the sounds · about 2 min', go: `#/game/hunt/${m.stageId}`, done: playedToday },
  ];
  const stickers = '⭐'.repeat(Math.min(30, Store.data.stars));

  V.innerHTML = `
    <div class="page-head"><h1>Hi, Noah! 🦊</h1></div>
    <p class="sub">Let's play with sounds — about 5 minutes!</p>

    <div class="card">
      <h2>🎯 Today's mission</h2>
      ${mission.map(x => `
        <div class="mission"><span class="mi">${x.done ? '✅' : x.ic}</span>
          <span class="grow"><b>${esc(x.t)}</b><br><span style="color:var(--ink-soft); font-size:14px;">${esc(x.d)}</span></span>
          <button class="go" data-go="${x.go}">${x.done && x.t.startsWith('You finished') ? 'Play' : 'Go!'}</button>
        </div>`).join('')}
    </div>

    <div class="card">
      <h2>⭐ My stars</h2>
      <div style="font-size:40px; font-weight:900;">${Store.data.stars} ⭐</div>
      <div class="sticker-row">${stickers || '<span style="font-size:15px; color:var(--ink-soft); font-weight:700;">Earn stars by playing — they land here!</span>'}</div>
    </div>

    <h2 style="margin:18px 0 10px;">📚 Pick a stage</h2>
    <div class="grid">
      ${CURRICULUM.stages.map(st => {
        const p = App.stageProgress(st);
        const pct = Math.round(p.done / p.total * 100);
        return `<button class="stage-card" style="--sc:${st.color}" data-go="#/stage/${st.id}">
          <span class="mascot">${st.mascot}</span>
          <span style="flex:1"><span class="t">${st.id}. ${esc(st.name)}</span><br>
          <span class="d">${esc(st.level)}</span>
          <span class="bar"><i style="width:${pct}%"></i></span></span>
          <span style="font-size:24px;">${pct === 100 ? '🏆' : '▶'}</span>
        </button>`;
      }).join('')}
    </div>

    <div class="btn-row"><button class="btn blue big" data-go="#/games">🎮 Quick game</button></div>`;

  $$('[data-go]', V).forEach(b => b.onclick = () => { Sfx.pop(); App.go(b.dataset.go); });
  const learnStep = mission[0];
  if (learnStep && learnStep.go.startsWith('#/learn')) {
    // mark "seen" when the learn step exists — actual marking happens in learn view
  }
};

/* ================= STAGE / UNIT PICKER ================= */
Views.stages = function (V) {
  V.innerHTML = `
    <div class="page-head"><button class="back-btn" data-go="#/">←</button><h1>📖 Learn a sound</h1></div>
    <p class="sub">Pick a stage, then pick a sound.</p>
    <div class="grid">
      ${CURRICULUM.stages.map(st => {
        const p = App.stageProgress(st);
        return `<button class="stage-card" style="--sc:${st.color}" data-go="#/stage/${st.id}">
          <span class="mascot">${st.mascot}</span>
          <span style="flex:1"><span class="t">${st.id}. ${esc(st.name)}</span><br>
          <span class="d">${p.done}/${p.total} sounds · ${esc(st.level)}</span></span>
          <span style="font-size:24px;">▶</span></button>`;
      }).join('')}
    </div>`;
  $$('[data-go]', V).forEach(b => b.onclick = () => App.go(b.dataset.go));
};

Views.stage = function (V, sid) {
  const st = App.getStage(sid);
  if (!st) return App.go('#/stages');
  V.innerHTML = `
    <div class="page-head"><button class="back-btn" data-go="#/stages">←</button><h1>${st.mascot} ${esc(st.name)}</h1></div>
    <p class="sub">${esc(st.level)} · ${esc(st.teaches)}</p>
    <div class="grid cols-3">
      ${st.units.map((u, i) => `
        <button class="unit-chip ${App.unitDone(st.id, i) ? 'done' : ''}" data-go="#/learn/${st.id}/${i}">
          <span class="snd" style="color:${st.color}">${esc(u.sound)}</span>
          <span>${esc(u.say)}</span>
        </button>`).join('')}
    </div>`;
  $$('[data-go]', V).forEach(b => b.onclick = () => { Sfx.pop(); App.go(b.dataset.go); });
};

/* ================= LEARN ================= */
Views.learn = function (V, sid, idx) {
  const st = App.getStage(sid), u = App.getUnit(sid, idx);
  if (!st || !u) return App.go('#/stages');
  const key = App.unitKey(st.id, idx);
  const p = App.prog(key); p.seen = true; Store.save();

  const letters = u.sound.split('').map(ch => `<span class="merge">${esc(ch)}</span>`).join('');
  const words = u.sentence.replace(/[.,!?]/g, '').split(' ');

  V.innerHTML = `
    <div class="page-head"><button class="back-btn" data-go="#/stage/${st.id}">←</button>
      <h1>Sound: “${esc(u.sound)}”</h1></div>

    <div class="card sound-card" id="soundCard" style="--sc:${st.color}">
      <div class="sound-letters">${letters}</div>
      <div class="sound-say">says <b>${esc(u.say)}</b></div><br>
      <span class="cue">${esc(u.cue)}</span>
      <div class="btn-row" style="justify-content:center;">
        <button class="btn" id="hearSound" style="flex:0 1 auto;">🔊 Hear the sound</button>
        <button class="btn blue" id="watchBlend" style="flex:0 1 auto;">👀 Watch it blend</button>
      </div>
    </div>

    <div class="card">
      <h2>🖼️ Words with “${esc(u.sound)}”</h2>
      <p class="sub">Tap a picture to hear the word.</p>
      <div class="word-grid">
        ${u.words.map(([w, e]) => `<button class="word-card" data-w="${esc(w)}"><span class="emoji">${e}</span><span>${esc(w)}</span></button>`).join('')}
      </div>
    </div>

    <div class="card">
      <h2>📖 Read along</h2>
      <p class="sub">Tap a word to hear it. ⭐ = tricky word, learn it by heart!</p>
      <div class="sentence">
        ${words.map(w => `<button class="schip ${u.tricky.includes(w) ? 'tricky' : ''}" data-w="${esc(w)}">${esc(w)}${u.tricky.includes(w) ? ' <span class="star">⭐</span>' : ''}</button>`).join('')}
      </div>
      <div class="btn-row">
        <button class="btn green" id="readAll">🔊 Read it to me</button>
        <button class="btn blue" id="readSlow">🐢 Slow</button>
      </div>
    </div>

    <div class="card">
      <h2>✏️ Trace it!</h2>
      <div class="trace-wrap">
        <canvas id="trace" width="640" height="640" aria-label="Trace the letters"></canvas>
        <div class="trace-hint">Use your finger to trace the ${esc(u.sound.length > 2 ? 'sound' : 'letter')}!</div>
        <div class="btn-row" style="justify-content:center;">
          <button class="btn small ghost" id="traceClear">🗑️ Clear</button>
          <button class="btn small green" id="traceDone">✅ Done!</button>
        </div>
      </div>
    </div>

    <div class="card">
      <details class="cheat">
        <summary>Grown-up tip: how to say “${esc(u.sound)}”</summary>
        <ul>
          <li><b>Say it:</b> ${esc(u.cheat.say)}</li>
          <li><b>Watch out:</b> ${esc(u.cheat.mistake)}</li>
          <li><b>Practice words:</b> ${u.cheat.practice.map(esc).join(', ')}</li>
        </ul>
      </details>
    </div>

    <div class="btn-row">
      <button class="btn green big" data-go="#/exercise/${st.id}/${idx}/find">✏️ Practice it!</button>
      <button class="btn blue big" data-go="#/game/hunt/${st.id}">🎮 Play a game</button>
    </div>`;

  $$('[data-go]', V).forEach(b => b.onclick = () => { Sfx.pop(); App.go(b.dataset.go); });

  const card = $('#soundCard', V);
  const hear = () => {
    card.classList.add('playing');
    Sfx.pop();
    Voice.sound(u).then(() => card.classList.remove('playing'));
    setTimeout(() => card.classList.remove('playing'), 2500);
  };
  $('#hearSound', V).onclick = hear;
  $('#watchBlend', V).onclick = () => {
    card.classList.add('playing');
    Voice.speak(`${u.sound.split('').join('... ')} ... ${u.say}`, { rate: 0.6 })
      .then(() => Voice.sound(u))
      .then(() => card.classList.remove('playing'));
  };
  setTimeout(hear, 600);

  $$('.word-card', V).forEach(b => b.onclick = () => {
    b.classList.add('hear'); setTimeout(() => b.classList.remove('hear'), 450);
    Sfx.pop(); Voice.word(b.dataset.w);
  });
  $$('.schip', V).forEach(b => b.onclick = () => { Sfx.pop(); Voice.word(b.dataset.w); });
  $('#readAll', V).onclick = () => Voice.sentence(u.sentence);
  $('#readSlow', V).onclick = () => Voice.speak(u.sentence, { rate: 0.6 });

  /* tracing canvas */
  const cv = $('#trace', V), ctx = cv.getContext('2d');
  const traceText = u.sound.length <= 3 ? u.sound : u.sound.slice(0, 2);
  function drawGuide() {
    ctx.clearRect(0, 0, 640, 640);
    ctx.save();
    ctx.setLineDash([22, 16]);
    ctx.strokeStyle = '#C9D6E8'; ctx.lineWidth = 14; ctx.lineJoin = 'round';
    ctx.font = `900 ${traceText.length > 1 ? 240 : 340}px Nunito, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeText(traceText, 320, 340);
    ctx.restore();
  }
  drawGuide();
  let drawing = false;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 640 / r.width, (e.clientY - r.top) * 640 / r.height]; };
  cv.addEventListener('pointerdown', (e) => { drawing = true; cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); });
  cv.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const [x, y] = pos(e);
    ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.strokeStyle = st.color; ctx.setLineDash([]);
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => cv.addEventListener(ev, () => drawing = false));
  $('#traceClear', V).onclick = () => { drawGuide(); Sfx.pop(); };
  let traced = false;
  $('#traceDone', V).onclick = () => {
    if (!traced) { traced = true; App.addStars(1); }
    Sfx.sparkle(); Voice.praise(); App.confetti(25);
    App.toast('Beautiful tracing! +1 ⭐');
  };
};

/* ================= EXERCISE (3 modes per unit) ================= */
Views.exercise = function (V, sid, idx, mode) {
  const st = App.getStage(sid), u = App.getUnit(sid, idx);
  if (!st || !u) return App.go('#/stages');
  const key = App.unitKey(st.id, idx);
  const MODES = [['find', '👂 Hear & Find'], ['missing', '🔤 Missing Letter'], ['build', '🧱 Build the Word']];
  const ROUNDS = 5;

  V.innerHTML = `
    <div class="page-head"><button class="back-btn" data-go="#/learn/${st.id}/${idx}">←</button>
      <h1>Practice: “${esc(u.sound)}”</h1></div>
    <div class="mode-tabs">
      ${MODES.map(([m, lb]) => `<button class="btn ${m === mode ? 'green' : 'ghost'}" data-mode="${m}">${lb}</button>`).join('')}
    </div>
    <div class="card">
      <div class="progress-dots" id="ex-dots">${'<i></i>'.repeat(ROUNDS)}</div>
      <div id="ex-q"></div>
    </div>`;

  $$('[data-mode]', V).forEach(b => b.onclick = () => { Sfx.pop(); App.go(`#/exercise/${st.id}/${idx}/${b.dataset.mode}`); });

  let q = 0, correct = 0;
  const qEl = $('#ex-q', V);
  const dot = (ok) => { const d = $$('#ex-dots i', V)[q]; if (d) d.className = ok ? 'ok' : 'no'; };
  function next(ok) {
    dot(ok); q++;
    if (ok) { correct++; App.addStars(1); App.record(key, true); Sfx.ding(); Voice.praise(); }
    else { App.record(key, false); Sfx.boop(); Voice.tryAgain(); }
    setTimeout(() => q >= ROUNDS ? done() : ask(), ok ? 1000 : 1700);
  }
  function done() {
    App.markDone(st.id, idx);
    Sfx.fanfare(); App.confetti(50);
    const nxt = +idx + 1 < st.units.length;
    qEl.innerHTML = `
      <div style="text-align:center; padding:8px;">
        <div style="font-size:72px;">🏆</div>
        <div class="q">You practiced “${esc(u.sound)}”!</div>
        <p style="font-weight:700; color:var(--ink-soft);">${correct} out of ${ROUNDS} right · +${correct} ⭐</p>
        <div class="btn-row">
          ${nxt ? `<button class="btn green" id="ex-next">Next sound ▶</button>` : ''}
          <button class="btn blue" id="ex-game">🎮 Play a game</button>
          <button class="btn" id="ex-home">🏠 Home</button>
        </div></div>`;
    if (nxt) $('#ex-next', qEl).onclick = () => App.go(`#/learn/${st.id}/${+idx + 1}`);
    $('#ex-game', qEl).onclick = () => App.go(`#/game/hunt/${st.id}`);
    $('#ex-home', qEl).onclick = () => App.go('#/');
  }

  /* --- mode A: hear the sound, tap the word that starts with it --- */
  function askFind() {
    const snd = u.sound.toLowerCase();
    const [tw, te] = u.words[Math.floor(Math.random() * u.words.length)];
    const others = [];
    CURRICULUM.stages.forEach(s2 => s2.units.forEach(u2 => {
      if (u2 === u) return;
      u2.words.forEach(([w, e]) => { if (!w.toLowerCase().startsWith(snd)) others.push([w, e]); });
    }));
    const opts = shuffle([[tw, te, true], ...pickN(others, 3).map(([w, e]) => [w, e, false])]);
    qEl.innerHTML = `
      <div class="q">Tap the word that starts with <span class="hl">“${esc(u.sound)}”</span>
        <button class="btn small blue" id="f-hear">🔊 Hear it</button></div>
      <div class="opt-grid">${opts.map(([w, e]) =>
        `<button class="opt" data-ok="${1}"><span class="emoji">${e}</span><span>${esc(w)}</span></button>`).join('')}</div>`;
    // fix data-ok values
    $$('.opt', qEl).forEach((b, i) => b.dataset.ok = opts[i][2] ? '1' : '0');
    const hear = () => Voice.sound(u);
    $('#f-hear', qEl).onclick = () => { Sfx.pop(); hear(); };
    setTimeout(hear, 400);
    $$('.opt', qEl).forEach(b => b.onclick = () => {
      const ok = b.dataset.ok === '1';
      b.classList.add(ok ? 'correct' : 'wrong');
      next(ok);
    });
  }

  /* --- mode B: fill the missing letter (unit words) --- */
  function askMissing() {
    const [w0] = u.words[Math.floor(Math.random() * u.words.length)];
    const word = w0.replace(/[^a-zA-Z]/g, '').toLowerCase() || 'sun';
    const bi = 1 + Math.floor(Math.random() * Math.max(1, word.length - 1));
    const ans = word[bi];
    const pool = new Set('satpinmdgockeuhrjvwlfz'.split('')); pool.delete(ans);
    const opts = shuffle([ans, ...pickN([...pool], 2)]);
    qEl.innerHTML = `
      <div class="q">Which letter is missing?</div>
      <div class="blank-row">${word.split('').map((ch, i) => i === bi ? '<span class="blank">?</span>' : `<span>${ch}</span>`).join('')}</div>
      <div class="letter-bank">${opts.map(o => `<button class="tile" data-l="${o}">${o}</button>`).join('')}</div>
      <div style="text-align:center;"><button class="btn small blue" id="x-hear">🔊 Hear the word</button></div>`;
    $('#x-hear', qEl).onclick = () => Voice.word(word);
    setTimeout(() => Voice.word(word), 400);
    $$('.tile', qEl).forEach(b => b.onclick = () => {
      const ok = b.dataset.l === ans;
      b.classList.add(ok ? 'correct' : 'wrong');
      $('.blank', qEl).textContent = ok ? ans : '?';
      next(ok);
    });
  }

  /* --- mode C: tap letters in order to build the word --- */
  function askBuild() {
    const cands = u.words.map(([w]) => w.toLowerCase().replace(/[^a-z]/g, '')).filter(w => w.length >= 3);
    const word = cands[Math.floor(Math.random() * cands.length)] || 'sun';
    const bank = shuffle(word.split(''));
    qEl.innerHTML = `
      <div class="q">Build the word you hear! <button class="btn small blue" id="b-hear">🔊 Hear it</button></div>
      <div class="slots">${word.split('').map(() => '<button class="slot" aria-label="letter slot"></button>').join('')}</div>
      <div class="letter-bank">${bank.map((l, i) => `<button class="tile" data-i="${i}">${l}</button>`).join('')}</div>`;
    const hear = () => Voice.word(word);
    $('#b-hear', qEl).onclick = () => { Sfx.pop(); hear(); };
    setTimeout(hear, 400);
    const slots = $$('.slot', qEl), tiles = $$('.tile', qEl);
    const placed = new Array(word.length).fill(null);
    tiles.forEach(tb => tb.onclick = () => {
      const i = placed.findIndex(v => v === null); if (i < 0) return;
      placed[i] = tb.textContent; tb.classList.add('used');
      slots[i].textContent = tb.textContent; slots[i].classList.add('filled'); slots[i].dataset.ti = tb.dataset.i;
      Sfx.pop();
      if (!placed.includes(null)) {
        const ok = placed.join('') === word;
        if (ok) slots.forEach(s => s.classList.add('filled'));
        setTimeout(() => next(ok), ok ? 700 : 1500);
      }
    });
    slots.forEach((s, i) => s.onclick = () => {
      if (placed[i] === null) return;
      const tb = tiles.find(t => t.dataset.i === s.dataset.ti); if (tb) tb.classList.remove('used');
      placed[i] = null; s.textContent = ''; s.classList.remove('filled');
    });
  }

  function ask() { ({ find: askFind, missing: askMissing, build: askBuild }[mode] || askFind)(); }
  ask();
};

/* ================= GAMES MENU + LAUNCHER ================= */
Views.gamesMenu = function (V) {
  const m = App.nextUnit();
  const GAMES = [
    ['hunt', '🔎', 'Sound Hunt', 'Hear a sound, find its letters!'],
    ['missing', '🔤', 'Missing Letter', 'Which letter is hiding?'],
    ['odd', '🧐', 'Odd One Out', 'Three match… one is sneaky!'],
    ['spell', '🐝', 'Spelling Bee', 'Hear it, then spell it!'],
  ];
  V.innerHTML = `
    <div class="page-head"><button class="back-btn" data-go="#/">←</button><h1>🎮 Games</h1></div>
    <p class="sub">Pick a game, then pick where the words come from.</p>
    <div class="card">
      <h2>🌍 Word pack</h2>
      <div class="btn-row" id="scopeRow">
        <button class="btn small green" data-scope="${m.stageId}">Stage ${m.stageId}: ${esc(m.stage.name)}</button>
        <button class="btn small ghost" data-scope="0">🌈 Everything!</button>
      </div>
      <p class="sub" id="scopeNote" style="margin:8px 0 0;">Words from Stage ${m.stageId} (${esc(m.stage.name)}).</p>
    </div>
    <div class="grid">
      ${GAMES.map(([g, ic, t, d]) => `
        <button class="game-card" data-game="${g}">
          <span class="gi">${ic}</span>
          <span><span class="gt">${t}</span><br><span style="color:var(--ink-soft);">${d}</span></span>
        </button>`).join('')}
    </div>`;
  let scope = String(m.stageId);
  $$('#scopeRow .btn', V).forEach(b => b.onclick = () => {
    scope = b.dataset.scope;
    $$('#scopeRow .btn', V).forEach(x => { x.classList.remove('green'); x.classList.add('ghost'); });
    b.classList.remove('ghost'); b.classList.add('green');
    const st = scope === '0' ? null : App.getStage(scope);
    $('#scopeNote', V).textContent = st ? `Words from Stage ${st.id} (${st.name}).` : 'Words from all 6 stages — the big mix!';
    Sfx.pop();
  });
  $$('[data-game]', V).forEach(b => b.onclick = () => { Sfx.pop(); App.go(`#/game/${b.dataset.game}/${scope}`); });
  $('[data-go]', V).onclick = () => App.go('#/');
};

Views.game = function (V, name, scope) {
  const pool = App.gamePool(scope || 0);
  if (!pool.length) return App.go('#/games');
  Store.data.lastGameDay = Store.today(); Store.save();
  const fn = { hunt: Games.hunt, missing: Games.missing, odd: Games.odd, spell: Games.spell }[name];
  if (!fn) return App.go('#/games');
  fn(V, pool);
};

/* ================= BOOKS ================= */
Views.books = function (V) {
  V.innerHTML = `
    <div class="page-head"><button class="back-btn" data-go="#/">←</button><h1>📚 Book shelf</h1></div>
    <p class="sub">Example titles from the Oxford Reading Tree series, grouped by stage.
      Tick the ones on your shelf! <span style="font-size:13px;">(Examples only — check against your books.)</span></p>
    ${CURRICULUM.stages.map(st => `
      <div class="card book-stage">
        <h2>${st.mascot} Stage ${st.id}: ${esc(st.name)}</h2>
        <div class="teaches">${esc(st.level)}<br>Teaches: ${esc(st.teaches)}</div>
        <ul class="book-list">
          ${st.books.map(t => {
            const id = st.id + '::' + t;
            const owned = Store.data.booksOwned.includes(id);
            return `<li><input type="checkbox" data-book="${esc(id)}" ${owned ? 'checked' : ''} aria-label="We own ${esc(t)}">
              <span>${esc(t)}</span>${owned ? ' <span>✅</span>' : ''}</li>`;
          }).join('')}
        </ul>
      </div>`).join('')}`;
  $$('[data-book]', V).forEach(cb => cb.onchange = () => {
    const id = cb.dataset.book;
    const i = Store.data.booksOwned.indexOf(id);
    if (cb.checked && i < 0) { Store.data.booksOwned.push(id); Sfx.pop(); }
    if (!cb.checked && i >= 0) Store.data.booksOwned.splice(i, 1);
    Store.save();
  });
  $('[data-go]', V).onclick = () => App.go('#/');
};

/* ================= PARENT ZONE (PIN-gated) ================= */
Views.grownups = function (V) {
  if (!App.grownUp) return Views.pinGate(V);
  const tricky = App.trickyUnits();
  let totC = 0, totT = 0, unitsDone = 0, unitsTotal = 0;
  CURRICULUM.stages.forEach(st => st.units.forEach((_, i) => {
    unitsTotal++;
    const p = App.prog(App.unitKey(st.id, i));
    if (p.done) unitsDone++;
    totC += p.correct; totT += p.total;
  }));
  const acc = totT ? Math.round(totC / totT * 100) : 0;

  V.innerHTML = `
    <div class="page-head"><button class="back-btn" data-go="#/">←</button><h1>🔒 Grown-ups</h1></div>
    <p class="sub">Noah's progress at a glance.</p>

    <div class="stat-grid">
      <div class="stat"><div class="n">⭐ ${Store.data.stars}</div><div class="l">stars earned</div></div>
      <div class="stat"><div class="n">🔥 ${Store.data.streak.count}</div><div class="l">day streak</div></div>
      <div class="stat"><div class="n">${unitsDone}/${unitsTotal}</div><div class="l">sounds practiced</div></div>
      <div class="stat"><div class="n">${acc}%</div><div class="l">answer accuracy</div></div>
      <div class="stat"><div class="n">📚 ${Store.data.booksOwned.length}</div><div class="l">books owned</div></div>
    </div>

    <div class="card"><h2>📊 Progress per stage</h2>
      ${CURRICULUM.stages.map(st => {
        const p = App.stageProgress(st), pct = Math.round(p.done / p.total * 100);
        return `<div style="margin:10px 0;"><b>${st.mascot} Stage ${st.id}: ${esc(st.name)}</b>
          <span style="color:var(--ink-soft); font-weight:700;"> — ${p.done}/${p.total}</span>
          <div class="pbar"><i style="width:${pct}%"></i></div></div>`;
      }).join('')}
    </div>

    <div class="card"><h2>🧐 Tricky sounds</h2>
      ${tricky.length ? tricky.map(t => `
        <div class="tricky-row"><span style="font-size:28px;">${t.stage.mascot}</span>
          <span class="grow">“${esc(t.unit.sound)}” <span style="color:var(--ink-soft);">(${Math.round(t.acc * 100)}% right)</span></span>
          <button class="btn small blue" data-go="#/learn/${t.stage.id}/${t.idx}">Practice</button>
        </div>`).join('')
        : '<p style="font-weight:700; color:var(--ink-soft);">No tricky sounds yet — keep playing and they\'ll show up here.</p>'}
    </div>

    <div class="card"><h2>🖨️ Printable practice sheets</h2>
      <p class="sub">A4-ready: tracing lines, spot-the-sound, match-ups.</p>
      <div class="grid cols-2" id="sheetPick">
        ${CURRICULUM.stages.map(st => `
          <button class="btn small ghost" data-stage="${st.id}">${st.mascot} Stage ${st.id}</button>`).join('')}
      </div>
      <div id="sheetUnits" style="margin-top:10px;"></div>
    </div>

    <div class="card"><h2>⚙️ Manage</h2>
      <div class="btn-row">
        <button class="btn small blue" id="pz-export">💾 Export progress</button>
        <button class="btn small ghost" id="pz-pin">🔑 Change PIN</button>
        <button class="btn small coral" id="pz-reset">🗑️ Reset all progress</button>
        <button class="btn small ghost" id="pz-lock">🔒 Lock</button>
      </div>
    </div>`;

  $$('[data-go]', V).forEach(b => b.onclick = () => App.go(b.dataset.go));
  $$('#sheetPick .btn', V).forEach(b => b.onclick = () => {
    const st = App.getStage(b.dataset.stage);
    $('#sheetUnits', V).innerHTML = `<p><b>Pick a sound:</b></p><div class="grid cols-3">` +
      st.units.map((u, i) => `<button class="btn small ghost" data-go="#/sheet/${st.id}/${i}">${esc(u.sound)}</button>`).join('') + '</div>';
    $$('#sheetUnits [data-go]', V).forEach(x => x.onclick = () => App.go(x.dataset.go));
    Sfx.pop();
  });
  $('#pz-export', V).onclick = () => {
    const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), data: Store.data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'noah-phonics-progress.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    App.toast('Progress exported 💾');
  };
  $('#pz-reset', V).onclick = () => {
    if (confirm('Reset ALL of Noah\'s stars and progress? This cannot be undone.')) {
      Store.reset(); App.grownUp = true; sessionStorage.setItem('npaGrown', '1');
      App.renderChrome(); App.toast('Fresh start! 🌱'); App.go('#/grownups');
    }
  };
  $('#pz-lock', V).onclick = () => { App.grownUp = false; sessionStorage.removeItem('npaGrown'); App.go('#/'); };
  $('#pz-pin', V).onclick = () => {
    const p1 = prompt('Enter a new 4-digit PIN:');
    if (!/^\d{4}$/.test(p1 || '')) { App.toast('PIN must be 4 digits.'); return; }
    const p2 = prompt('Enter it again to confirm:');
    if (p1 !== p2) { App.toast('PINs did not match.'); return; }
    Store.data.pin = p1; Store.save(); App.toast('PIN changed ✅');
  };
};

Views.pinGate = function (V) {
  let entry = '';
  V.innerHTML = `
    <div class="page-head"><button class="back-btn" data-go="#/">←</button><h1>🔒 Grown-ups only</h1></div>
    <div class="card" style="text-align:center;">
      <p class="sub">Hey Noah! This part is for grown-ups. Please hand the phone to a grown-up. 🙏</p>
      <div class="pin-dots" id="pinDots"><i></i><i></i><i></i><i></i></div>
      <div class="pin-pad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k =>
          k === '' ? '<span></span>' : `<button data-k="${k}">${k}</button>`).join('')}
      </div>
      <p class="sub" style="font-size:13px;">Default PIN is 1234 — change it inside.</p>
    </div>`;
  const dots = $$('#pinDots i', V);
  $$('.pin-pad button', V).forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    if (k === '⌫') entry = entry.slice(0, -1);
    else if (entry.length < 4) entry += k;
    dots.forEach((d, i) => d.classList.toggle('on', i < entry.length));
    Sfx.pop();
    if (entry.length === 4) {
      if (entry === Store.data.pin) {
        App.grownUp = true; sessionStorage.setItem('npaGrown', '1');
        Sfx.ding(); Views.grownups(V);
      } else { Sfx.boop(); App.toast('Wrong PIN — try again.'); entry = ''; dots.forEach(d => d.classList.remove('on')); }
    }
  });
  $('[data-go]', V).onclick = () => App.go('#/');
};

/* ================= PRINTABLE WORKSHEET ================= */
Views.sheet = function (V, sid, idx) {
  const st = App.getStage(sid), u = App.getUnit(sid, idx);
  if (!st || !u) return App.go('#/grownups');
  const traceText = u.sound === 'blends' ? 'st' : u.sound === 'tricky words' ? 'the' : u.sound.split('·')[0].trim().slice(0, 3);
  const dashLetter = (ch, size) => `
    <svg class="trace-svg" viewBox="0 0 100 100" aria-hidden="true">
      <text x="50" y="80" text-anchor="middle" font-size="${size}" font-weight="900"
        fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="9 7"
        font-family="Nunito, sans-serif">${esc(ch)}</text></svg>`;
  const targetWords = u.words.slice(0, 6);
  const distractorPool = [];
  CURRICULUM.stages.forEach(s2 => s2.units.forEach(u2 => {
    if (u2 === u) return;
    u2.words.forEach(([w, e]) => { if (!w.toLowerCase().startsWith(u.sound.toLowerCase())) distractorPool.push([w, e]); });
  }));
  const circleItems = shuffle([...targetWords.map(([w, e]) => ({ e, hit: true })), ...pickN(distractorPool, 6).map(([, e]) => ({ e, hit: false }))]);
  const matchPairs = pickN(u.words, 5);
  const matchLeft = shuffle(matchPairs.map(([w]) => w));
  const matchRight = shuffle(matchPairs.map(([, e]) => e));

  V.innerHTML = `
    <div class="page-head no-print"><button class="back-btn" data-go="#/grownups">←</button>
      <h1>🖨️ Worksheet: “${esc(u.sound)}”</h1></div>
    <div class="no-print btn-row" style="margin-bottom:14px;">
      <button class="btn green" id="doPrint">🖨️ Print this sheet</button>
      <button class="btn ghost" data-go="#/learn/${st.id}/${idx}">📖 Open in Learn</button>
    </div>
    <div class="sheet">
      <h2>Noah's Phonics — “${esc(u.sound)}” <span style="font-size:15px; color:var(--ink-soft);">(${esc(st.name)})</span></h2>
      <p><b>Name:</b> ____________________ &nbsp; <b>Date:</b> __________</p>
      <h3>1. Trace the sound</h3>
      <div class="trace-row">${dashLetter(traceText, traceText.length > 1 ? 52 : 72)}${dashLetter(traceText, traceText.length > 1 ? 52 : 72)}${dashLetter(traceText, traceText.length > 1 ? 52 : 72)}</div>
      <div class="trace-row">${dashLetter(traceText, traceText.length > 1 ? 52 : 72)}${dashLetter(traceText, traceText.length > 1 ? 52 : 72)}${dashLetter(traceText, traceText.length > 1 ? 52 : 72)}</div>
      <h3>2. Circle the pictures that start with “${esc(u.sound)}”</h3>
      <div class="circle-grid">${circleItems.map(c => `<div class="circle-item">${c.e}</div>`).join('')}</div>
      <h3>3. Match the word to the picture</h3>
      <div class="match-cols">
        <div class="match-col">${matchLeft.map(w => `<div class="match-item">${esc(w)}</div>`).join('')}</div>
        <div class="match-col">${matchRight.map(e => `<div class="match-item" style="font-size:34px;">${e}</div>`).join('')}</div>
      </div>
      <h3>4. Copy the sentence</h3>
      <p style="font-size:20px; font-weight:800;">${esc(u.sentence)}</p>
      <div style="border-bottom:2px solid #D8CFB8; height:34px;"></div>
      <div style="border-bottom:2px solid #D8CFB8; height:34px;"></div>
      <p class="sub">🦊 Great work, Noah! Grown-up tip — say it: ${esc(u.cheat.say)}</p>
    </div>`;
  $('#doPrint', V).onclick = () => window.print();
  $$('[data-go]', V).forEach(b => b.onclick = () => App.go(b.dataset.go));
};
