/* Noah's Phonics Adventure — quiz games */
const Games = (() => {
  const ROUNDS = 8, HEARTS = 3, QTIME = 40; // generous, kid-friendly

  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const shuffle = (a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  const pickN = (a, n) => shuffle(a).slice(0, n);

  /* Shared game frame: hearts, timer, progress dots. Returns controller. */
  function shell(root, { title, emoji, onDone }) {
    let hearts = HEARTS, q = 0, correct = 0, timerId = null, tLeft = QTIME, locked = false;
    root.innerHTML = `
      <div class="page-head">
        <button class="back-btn" id="g-back" aria-label="Back">←</button>
        <h1>${emoji} ${esc(title)}</h1>
      </div>
      <div class="card">
        <div class="hearts" id="g-hearts">${'❤️'.repeat(HEARTS)}</div>
        <div class="timer" id="g-timer"><i></i></div>
        <div class="progress-dots" id="g-dots">${'<i></i>'.repeat(ROUNDS)}</div>
        <div id="g-q"></div>
      </div>`;
    const qEl = root.querySelector('#g-q');
    root.querySelector('#g-back').onclick = () => { stopTimer(); App.go('#/games'); };

    function renderHearts() {
      root.querySelector('#g-hearts').innerHTML =
        Array.from({ length: HEARTS }, (_, i) => `<span class="${i < hearts ? '' : 'lost'}">❤️</span>`).join('');
    }
    function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
    function startTimer(onTimeout) {
      stopTimer(); tLeft = QTIME; locked = false;
      const bar = root.querySelector('#g-timer');
      bar.classList.remove('low');
      const fill = bar.querySelector('i');
      timerId = setInterval(() => {
        tLeft -= 0.2;
        fill.style.width = Math.max(0, (tLeft / QTIME) * 100) + '%';
        if (tLeft <= 10) bar.classList.add('low');
        if (tLeft <= 0) { stopTimer(); onTimeout(); }
      }, 200);
    }
    function dot(ok) {
      const d = root.querySelectorAll('#g-dots i')[q];
      if (d) d.className = ok ? 'ok' : 'no';
    }
    /* called by the game when the kid answers */
    function answer(ok, unitKey, after) {
      if (locked) return; locked = true; stopTimer();
      dot(ok);
      if (ok) { correct++; App.addStars(1); App.record(unitKey, true); Sfx.ding(); }
      else { hearts--; renderHearts(); App.record(unitKey, false); Sfx.boop(); if (hearts <= 0) { setTimeout(() => end(), 1100); if (after) after(); return; } }
      q++;
      setTimeout(() => { if (q >= ROUNDS) end(); else if (after) after(); }, ok ? 900 : 1600);
    }
    function timeout(unitKey, after) { answer(false, unitKey, after); App.toast("Time's up — good try!"); }
    function end() {
      stopTimer();
      const acc = Math.round((correct / Math.max(1, q)) * 100);
      if (correct >= 5) Sfx.fanfare();
      qEl.innerHTML = `
        <div style="text-align:center; padding:10px;">
          <div style="font-size:72px;">${correct >= 5 ? '🏆' : '🌟'}</div>
          <div class="q">${correct >= 5 ? 'Amazing playing!' : 'Good trying!'}</div>
          <p style="font-weight:700; color:var(--ink-soft);">${correct} out of ${q} right · you earned ${correct} ⭐</p>
          <div class="btn-row">
            <button class="btn green" id="g-again">🔁 Play again</button>
            <button class="btn" id="g-home">🏠 Home</button>
          </div>
        </div>`;
      qEl.querySelector('#g-again').onclick = () => onDone(true);
      qEl.querySelector('#g-home').onclick = () => App.go('#/');
      App.confetti(correct >= 5 ? 60 : 25);
    }
    return { qEl, answer, timeout, startTimer, stopTimer,
             get q() { return q; }, next() { /* games advance via after() */ } };
  }

  /* ---------- GAME 1: Sound Hunt — hear a sound, find its letters ---------- */
  function hunt(root, pool) {
    const units = pool.filter(p => !/tricky|blend/i.test(p.unit.sound));
    const ctl = shell(root, { title: 'Sound Hunt', emoji: '🔎', onDone: (r) => r && hunt(root, pool) });
    function question() {
      const target = units[Math.floor(Math.random() * units.length)];
      const opts = shuffle([target, ...pickN(units.filter(u => u.unit.sound !== target.unit.sound), 3)]);
      ctl.qEl.innerHTML = `
        <div class="q">Hear the sound… then tap it! <button class="btn small blue" id="h-hear">🔊 Hear it</button></div>
        <div class="opt-grid">${opts.map(o =>
          `<button class="opt" data-s="${esc(o.unit.sound)}"><span class="emoji" style="font-size:44px; font-weight:900;">${esc(o.unit.sound)}</span></button>`).join('')}</div>`;
      const key = App.unitKey(target.stageId, target.unitIdx);
      const hear = () => Voice.sound(target.unit);
      ctl.qEl.querySelector('#h-hear').onclick = () => { Sfx.pop(); hear(); };
      setTimeout(hear, 400);
      ctl.startTimer(() => ctl.timeout(key, question));
      ctl.qEl.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const ok = b.dataset.s === target.unit.sound;
        b.classList.add(ok ? 'correct' : 'wrong');
        if (ok) { Voice.praise(); } else { Voice.tryAgain(); hear(); }
        ctl.answer(ok, key, question);
      });
    }
    question();
  }

  /* ---------- GAME 2: Missing Letter ---------- */
  function missing(root, pool) {
    const ctl = shell(root, { title: 'Missing Letter', emoji: '🔤', onDone: (r) => r && missing(root, pool) });
    function question() {
      const p = pool[Math.floor(Math.random() * pool.length)];
      const [w] = p.unit.words[Math.floor(Math.random() * p.unit.words.length)];
      const word = w.replace(/[^a-zA-Z'-]/g, '') || w;
      const bi = 1 + Math.floor(Math.random() * Math.max(1, word.length - 1));
      const answerCh = word[bi].toLowerCase();
      const letters = new Set(pool.flatMap(x => x.unit.words.map(([ww]) => ww.toLowerCase().replace(/[^a-z]/g, '').split('')).flat()));
      letters.delete(answerCh);
      const distract = pickN([...letters], 2);
      const opts = shuffle([answerCh, ...distract]);
      const key = App.unitKey(p.stageId, p.unitIdx);
      ctl.qEl.innerHTML = `
        <div class="q">Which letter is missing?</div>
        <div class="blank-row">${word.split('').map((ch, i) =>
          i === bi ? `<span class="blank">?</span>` : `<span>${esc(ch)}</span>`).join('')}</div>
        <div class="letter-bank">${opts.map(o => `<button class="tile" data-l="${o}">${o}</button>`).join('')}</div>
        <div style="text-align:center;"><button class="btn small blue" id="m-hear">🔊 Hear the word</button></div>`;
      ctl.qEl.querySelector('#m-hear').onclick = () => Voice.word(word);
      setTimeout(() => Voice.word(word), 400);
      ctl.startTimer(() => ctl.timeout(key, question));
      ctl.qEl.querySelectorAll('.tile').forEach(b => b.onclick = () => {
        const ok = b.dataset.l === answerCh;
        b.classList.add(ok ? 'correct' : 'wrong');
        ctl.qEl.querySelector('.blank').textContent = ok ? answerCh : '?';
        if (ok) Voice.praise(); else { Voice.tryAgain(); Voice.word(word); }
        ctl.answer(ok, key, question);
      });
    }
    question();
  }

  /* ---------- GAME 3: Odd One Out ---------- */
  function odd(root, pool) {
    const units = pool.filter(p => !/tricky|blend/i.test(p.unit.sound));
    const ctl = shell(root, { title: 'Odd One Out', emoji: '🧐', onDone: (r) => r && odd(root, pool) });
    function question() {
      const target = units[Math.floor(Math.random() * units.length)];
      const snd = target.unit.sound.toLowerCase();
      const three = pickN(target.unit.words, 3);
      const others = pool.filter(p => p.unit.sound !== target.unit.sound);
      let oddW = null, guard = 0;
      while (!oddW && guard++ < 60) {
        const p = others[Math.floor(Math.random() * others.length)];
        const [w, e] = p.unit.words[Math.floor(Math.random() * p.unit.words.length)];
        if (!w.toLowerCase().startsWith(snd)) oddW = [w, e];
      }
      if (!oddW) oddW = ['zebra', '🦓'];
      const cards = shuffle([...three.map(([w, e]) => ({ w, e, odd: false })), { w: oddW[0], e: oddW[1], odd: true }]);
      const key = App.unitKey(target.stageId, target.unitIdx);
      ctl.qEl.innerHTML = `
        <div class="q">Three start with <span class="hl">${esc(target.unit.sound)}</span>… one does not! Tap each to hear it.</div>
        <div class="opt-grid">${cards.map((c, i) =>
          `<button class="opt" data-i="${i}"><span class="emoji">${c.e}</span><span>${esc(c.w)}</span></button>`).join('')}</div>`;
      ctl.startTimer(() => ctl.timeout(key, question));
      ctl.qEl.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const c = cards[+b.dataset.i];
        Voice.word(c.w);
        b.classList.add('hear');
        setTimeout(() => b.classList.remove('hear'), 450);
      });
      // second tap = choose; use dblclick-free approach: tap selects via confirm button? Keep simple: single tap hears AND we add a "This one!" flow.
      // Simpler for kids: first tap hears, tap again on same card chooses it.
      let lastTap = -1;
      ctl.qEl.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const i = +b.dataset.i, c = cards[i];
        if (lastTap === i) {
          const ok = c.odd;
          b.classList.add(ok ? 'correct' : 'wrong');
          if (ok) Voice.praise(); else Voice.tryAgain();
          ctl.answer(ok, key, question);
        } else {
          lastTap = i;
          Voice.word(c.w);
          b.classList.add('hear'); setTimeout(() => b.classList.remove('hear'), 450);
          App.toast('Tap it again if this is the odd one out!');
        }
      });
    }
    question();
  }

  /* ---------- GAME 4: Spelling Bee ---------- */
  function spell(root, pool) {
    const clean = pool.flatMap(p => p.unit.words
      .map(([w, e]) => ({ w: w.toLowerCase().replace(/[^a-z]/g, ''), e, p }))
      .filter(x => x.w.length >= 3 && x.w.length <= 6));
    const ctl = shell(root, { title: 'Spelling Bee', emoji: '🐝', onDone: (r) => r && spell(root, pool) });
    function question() {
      const round = ctl.q;
      const len = round < 3 ? 3 : round < 6 ? 4 : 5;
      const cands = clean.filter(x => x.w.length === len || (len === 5 && x.w.length >= 5));
      const t = (cands.length ? cands : clean)[Math.floor(Math.random() * (cands.length ? cands.length : clean.length))];
      const word = t.w;
      const bank = shuffle(word.split(''));
      const key = App.unitKey(t.p.stageId, t.p.unitIdx);
      ctl.qEl.innerHTML = `
        <div class="q">Spell the word you hear! <button class="btn small blue" id="s-hear">🔊 Hear it</button></div>
        <div style="text-align:center; font-size:64px;">${t.e}</div>
        <div class="slots" id="s-slots">${word.split('').map(() => '<button class="slot" aria-label="letter slot"></button>').join('')}</div>
        <div class="letter-bank" id="s-bank">${bank.map((l, i) => `<button class="tile" data-i="${i}">${l}</button>`).join('')}</div>`;
      const hear = () => Voice.word(word);
      ctl.qEl.querySelector('#s-hear').onclick = () => { Sfx.pop(); hear(); };
      setTimeout(hear, 400);
      ctl.startTimer(() => ctl.timeout(key, question));
      const slots = [...ctl.qEl.querySelectorAll('.slot')];
      const tiles = [...ctl.qEl.querySelectorAll('.tile')];
      const placed = new Array(word.length).fill(null);
      function check() {
        if (placed.some(v => v === null)) return;
        const got = placed.join('');
        const ok = got === word;
        if (ok) { slots.forEach(s => s.classList.add('filled')); Voice.praise(); }
        else { Sfx.boop(); Voice.tryAgain(); setTimeout(() => Voice.word(word), 600); }
        setTimeout(() => ctl.answer(ok, key, question), ok ? 900 : 1700);
      }
      tiles.forEach(tb => tb.onclick = () => {
        const i = placed.findIndex(v => v === null);
        if (i < 0) return;
        placed[i] = tb.textContent; tb.classList.add('used');
        slots[i].textContent = tb.textContent; slots[i].classList.add('filled');
        slots[i].dataset.ti = tb.dataset.i;
        Sfx.pop(); check();
      });
      slots.forEach((s, i) => s.onclick = () => {
        if (placed[i] === null) return;
        const ti = tiles.find(t2 => t2.dataset.i === s.dataset.ti);
        if (ti) ti.classList.remove('used');
        placed[i] = null; s.textContent = ''; s.classList.remove('filled');
      });
    }
    question();
  }

  return { hunt, missing, odd, spell };
})();
