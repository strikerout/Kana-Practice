/* ═══════════════════════════════════════════════════════════════
   render.js — All DOM rendering and event wiring.
   ═══════════════════════════════════════════════════════════════ */

const Render = (() => {

  // ─── Router ──────────────────────────────────────────────────
  function screen() {
    const app = document.getElementById('app');
    switch (State.screen) {
      case 'home':   app.innerHTML = _homeHTML();   _homeEvents();   break;
      case 'table':  app.innerHTML = _tableHTML();  _tableEvents();  break;
      case 'config': app.innerHTML = _configHTML(); _configEvents(); break;
      case 'game':   app.innerHTML = _gameHTML();   _gameEvents();   break;
      case 'result': app.innerHTML = _resultHTML(); _resultEvents(); break;
    }
  }

  // ─── Shared helpers ──────────────────────────────────────────

  function _kanaSpan(char, font) {
    const len  = [...char].length;
    const attr = len <= 4 ? len : 'long';
    return `<span class="kana-char font-change" data-len="${attr}" style="font-family:${font}">${char}</span>`;
  }

  function _gameHeaderHTML() {
    const g     = State.game;
    const total = Game.totalQuestions();
    const done  = Game.answered();
    const pct   = total ? Math.round((done / total) * 100) : 0;
    return `
      <header class="game-header">
        <button class="btn-back" id="btn-exit">✕ Salir</button>
        <div class="progress-wrap">
          <span class="progress-text">${done} / ${total}</span>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="game-score">
          <span class="score-correct">✓ ${g.correct}</span>
          <span class="score-wrong">✗ ${g.wrong}</span>
        </div>
      </header>`;
  }

  // ── Effective mode for routing (handles 'random' sub-mode) ──
  function _effectiveMode() {
    const g = State.game;
    return g.subMode || g.mode;
  }

  // ══════════════════════════════════════════════════════════════
  // HOME
  // ══════════════════════════════════════════════════════════════
  function _homeHTML() {
    const { alphabet } = State.config;
    const hiActive = alphabet === 'hiragana' ? 'active' : '';
    const kaActive = alphabet === 'katakana' ? 'active' : '';
    return `
      <div class="screen screen-home">
        <header class="home-header">
          <h1 class="app-title">かな練習</h1>
          <p class="app-subtitle">Kana Practice</p>
        </header>
        <div class="alphabet-selector">
          <button class="btn-alphabet ${hiActive}" data-alphabet="hiragana">
            <span class="kana-char" style="font-size:2.5rem;font-family:'Noto Sans JP',sans-serif">あ</span>
            <span class="label">Hiragana</span>
          </button>
          <button class="btn-alphabet ${kaActive}" data-alphabet="katakana">
            <span class="kana-char" style="font-size:2.5rem;font-family:'Noto Sans JP',sans-serif">ア</span>
            <span class="label">Katakana</span>
          </button>
        </div>
        <div class="home-actions">
          <button class="btn btn-secondary" id="btn-table">📋 Ver Tabla</button>
          <button class="btn btn-primary"   id="btn-config">🎮 Practicar</button>
        </div>
      </div>`;
  }

  function _homeEvents() {
    document.querySelectorAll('.btn-alphabet').forEach(btn => {
      btn.addEventListener('click', () => {
        State.setAlphabet(btn.dataset.alphabet);
        screen();
      });
    });
    document.getElementById('btn-table').addEventListener('click', () => {
      State.setScreen('table'); screen();
    });
    document.getElementById('btn-config').addEventListener('click', () => {
      State.setScreen('config'); screen();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TABLE
  // ══════════════════════════════════════════════════════════════
  function _tableHTML() {
    const { alphabet } = State.config;
    const tab          = State.tableTab;
    const lookup       = getLookup(alphabet);
    const label        = alphabet === 'hiragana' ? 'Hiragana' : 'Katakana';
    const tabs         = ['gojuon', 'dakuten', 'youon'];
    const tabLabels    = { gojuon: 'Gojūon', dakuten: 'Dakuten / H.', youon: 'Yōon' };

    const tabsHTML = tabs.map(t =>
      `<button class="tab-btn ${t === tab ? 'active' : ''}" data-tab="${t}">${tabLabels[t]}</button>`
    ).join('');

    return `
      <div class="screen screen-table">
        <header class="screen-header">
          <button class="btn-back" id="btn-back">← Volver</button>
          <h2>${label}</h2>
          <div class="table-tabs">${tabsHTML}</div>
        </header>
        <div class="table-body">${_tableContentHTML(tab, lookup)}</div>
      </div>`;
  }

  function _tableContentHTML(tab, lookup) {
    if (tab === 'gojuon') {
      return _kanaGridHTML(TABLE_GOJUON_ROWS, ['a','i','u','e','o'], 'cols-6', lookup);
    }
    if (tab === 'dakuten') {
      return `<div class="table-section">
        <p class="table-section-title">Dakuten (voiced — ゛) + Handakuten (semi-voiced — ゜)</p>
        ${_kanaGridHTML(TABLE_DAKUTEN_ROWS, ['a','i','u','e','o'], 'cols-6', lookup)}
      </div>`;
    }
    return `<div class="table-section">
      <p class="table-section-title">Yōon — compuestos (ya / yu / yo)</p>
      ${_kanaGridHTML(TABLE_YOUON_ROWS, ['ya','yu','yo'], 'cols-4', lookup)}
    </div>`;
  }

  function _kanaGridHTML(rows, colLabels, colClass, lookup) {
    const headerCells = ['', ...colLabels].map(l =>
      `<div class="kana-col-label">${l}</div>`).join('');
    const dataRows = rows.map(row => {
      const cells = row.romajis.map(r => {
        if (!r || !lookup[r]) return `<div class="kana-cell empty"></div>`;
        return `<div class="kana-cell ${row.rowClass}" title="${r}">
          <span class="char">${lookup[r]}</span>
          <span class="rom">${r}</span>
        </div>`;
      }).join('');
      return `<div class="kana-col-label">${row.label}</div>${cells}`;
    }).join('');
    return `<div class="kana-grid ${colClass}">${headerCells}${dataRows}</div>`;
  }

  function _tableEvents() {
    document.getElementById('btn-back').addEventListener('click', () => {
      State.setScreen('home'); screen();
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        State.setTableTab(btn.dataset.tab); screen();
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CONFIG
  // ══════════════════════════════════════════════════════════════
  function _configHTML() {
    const { sets, mode, fonts, rounds } = State.config;
    const setsDisabled = mode === 'words';

    const modes = [
      { key: 'multiple', label: 'Opción múltiple' },
      { key: 'type',     label: 'Escribir' },
      { key: 'match',    label: 'Emparejar' },
      { key: 'words',    label: 'Palabras' },
      { key: 'random',   label: '🎲 Random' },
    ];

    const modeButtons = modes.map(m =>
      `<button class="opt-btn ${mode === m.key ? 'active' : ''}" data-mode="${m.key}">${m.label}</button>`
    ).join('');

    const fontButtons = ['base','random'].map(f =>
      `<button class="opt-btn ${fonts === f ? 'active' : ''}" data-fonts="${f}">
        ${f === 'base' ? 'Fuente base' : 'Fuentes random'}
      </button>`
    ).join('');

    const roundOpts = [10, 20, 30, null];
    const roundButtons = roundOpts.map(r => {
      const active = rounds === r ? 'active' : '';
      const val    = r === null ? 'all' : r;
      const label  = r === null ? 'Todo' : r;
      return `<button class="opt-btn ${active}" data-rounds="${val}">${label}</button>`;
    }).join('');

    const setsNote = setsDisabled
      ? '<p class="config-note">No aplica en modo Palabras</p>' : '';

    return `
      <div class="screen screen-config">
        <header class="screen-header">
          <button class="btn-back" id="btn-back">← Volver</button>
          <h2>Configurar práctica</h2>
        </header>
        <div class="config-body">

          <section class="config-section">
            <h3>Modo de juego</h3>
            <div class="option-grid cols-3">${modeButtons}</div>
          </section>

          <section class="config-section">
            <h3>Preguntas por sesión</h3>
            <div class="option-grid cols-4">${roundButtons}</div>
          </section>

          <section class="config-section">
            <h3>Caracteres${setsDisabled ? ' <span class="disabled-label">(deshabilitado)</span>' : ''}</h3>
            ${setsNote}
            <label class="checkbox-option">
              <input type="checkbox" id="set-gojuon" ${sets.gojuon ? 'checked' : ''} ${setsDisabled ? 'disabled' : ''}>
              <span class="opt-text">
                <span class="opt-label">Gojūon — puros</span>
                <span class="opt-sub">あ か さ た な は ま や ら わ…</span>
              </span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" id="set-dakuten" ${sets.dakuten ? 'checked' : ''} ${setsDisabled ? 'disabled' : ''}>
              <span class="opt-text">
                <span class="opt-label">Dakuten / Handakuten — impuros</span>
                <span class="opt-sub">が ざ ば ぱ…</span>
              </span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" id="set-youon" ${sets.youon ? 'checked' : ''} ${setsDisabled ? 'disabled' : ''}>
              <span class="opt-text">
                <span class="opt-label">Yōon — compuestos</span>
                <span class="opt-sub">きゃ しゅ ちょ…</span>
              </span>
            </label>
          </section>

          <section class="config-section">
            <h3>Fuente de los caracteres</h3>
            <div class="option-grid cols-2">${fontButtons}</div>
          </section>

        </div>
        <div class="config-footer">
          <button class="btn btn-primary" id="btn-start">▶ Empezar</button>
        </div>
      </div>`;
  }

  function _configEvents() {
    document.getElementById('btn-back').addEventListener('click', () => {
      State.setScreen('home'); screen();
    });

    ['gojuon','dakuten','youon'].forEach(key => {
      const el = document.getElementById(`set-${key}`);
      if (!el) return;
      el.addEventListener('change', () => {
        const accepted = State.toggleSet(key);
        if (!accepted) el.checked = true;
      });
    });

    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => { State.setMode(btn.dataset.mode); screen(); });
    });

    document.querySelectorAll('[data-fonts]').forEach(btn => {
      btn.addEventListener('click', () => { State.setFonts(btn.dataset.fonts); screen(); });
    });

    document.querySelectorAll('[data-rounds]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.rounds === 'all' ? null : parseInt(btn.dataset.rounds, 10);
        State.setRounds(val);
        screen();
      });
    });

    document.getElementById('btn-start').addEventListener('click', () => {
      Game.start();
      State.setScreen('game');
      screen();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // GAME — routes by effective mode (handles 'random' sub-mode)
  // ══════════════════════════════════════════════════════════════
  function _gameHTML() {
    switch (_effectiveMode()) {
      case 'multiple': return _gameMultipleHTML();
      case 'type':     return _gameTypeHTML();
      case 'match':    return _gameMatchHTML();
      case 'words':    return _gameWordsHTML();
    }
  }

  function _gameEvents() {
    document.getElementById('btn-exit').addEventListener('click', () => {
      State.setScreen('home'); screen();
    });
    switch (_effectiveMode()) {
      case 'multiple': _gameMultipleEvents(); break;
      case 'type':     _gameTypeEvents();     break;
      case 'match':    _gameMatchEvents();    break;
      case 'words':    _gameWordsEvents();    break;
    }
  }

  // ── Multiple choice ──────────────────────────────────────────
  function _gameMultipleHTML() {
    const g       = State.game;
    const current = g.queue[g.currentIndex];
    const fbClass = g.feedback ? `feedback-${g.feedback}` : '';

    const choiceButtons = g.choices.map(c => {
      let cls = '';
      if (g.answered) {
        if (c.romaji === current.romaji) cls = 'correct';
        else if (g.feedback === 'wrong' && c.romaji === g.lastWrong) cls = 'wrong';
      }
      return `<button class="choice-btn ${cls}" data-romaji="${c.romaji}" ${g.answered ? 'disabled' : ''}>
        ${c.romaji}
      </button>`;
    }).join('');

    // Badge for random mode
    const badge = g.mode === 'random'
      ? `<span class="mode-badge">🎲 opción múltiple</span>` : '';

    return `
      <div class="screen screen-game">
        ${_gameHeaderHTML()}
        <div class="game-content">
          ${badge}
          <div class="kana-display ${fbClass}">${_kanaSpan(current.char, g.font)}</div>
          <div class="choices-grid">${choiceButtons}</div>
        </div>
      </div>`;
  }

  function _gameMultipleEvents() {
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (State.game.answered) return;
        const romaji = btn.dataset.romaji;
        const result = Game.submitChoice(romaji);
        State.updateGame({ lastWrong: result === 'wrong' ? romaji : null });
        result === 'correct' ? Sound.correct() : Sound.wrong();
        screen();
        setTimeout(() => {
          const done = Game.advance();
          if (done) State.setScreen('result');
          screen();
        }, result === 'correct' ? Game.NEXT_DELAY_CORRECT : Game.NEXT_DELAY_WRONG);
      });
    });
  }

  // ── Type mode ────────────────────────────────────────────────
  function _gameTypeHTML() {
    const g       = State.game;
    const current = g.queue[g.currentIndex];
    const fbClass = g.feedback ? `feedback-${g.feedback}` : '';
    const inpCls  = g.feedback || '';

    let hint = `<span class="type-hint">Escribí el romaji y presioná Enter</span>`;
    if (g.feedback === 'correct') hint = `<span class="type-hint reveal">✓ ${current.romaji}</span>`;
    if (g.feedback === 'wrong')   hint = `<span class="type-hint reveal wrong">✗ Respuesta: ${current.romaji}</span>`;

    const badge = g.mode === 'random'
      ? `<span class="mode-badge">🎲 escribir</span>` : '';

    return `
      <div class="screen screen-game">
        ${_gameHeaderHTML()}
        <div class="game-content">
          ${badge}
          <div class="kana-display ${fbClass}">${_kanaSpan(current.char, g.font)}</div>
          <div class="type-area">
            <input id="type-input" class="type-input ${inpCls}"
              type="text" autocomplete="off" autocorrect="off"
              autocapitalize="off" spellcheck="false"
              placeholder="romaji..."
              ${g.answered ? 'disabled' : ''}
              value="${g.answered ? (g.lastTyped || '') : ''}">
            ${hint}
            <button class="btn-submit" id="btn-submit" ${g.answered ? 'disabled' : ''}>
              Verificar
            </button>
          </div>
        </div>
      </div>`;
  }

  function _gameTypeEvents() {
    const input  = document.getElementById('type-input');
    const submit = document.getElementById('btn-submit');
    if (input && !State.game.answered) {
      input.focus();
      // Scroll la kana card al tope para que sea visible sobre el teclado
      setTimeout(() => {
        const kana = document.querySelector('.kana-display');
        if (kana) kana.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }

    function doSubmit() {
      if (State.game.answered) return;
      const typed = input ? input.value : '';
      if (!typed.trim()) return;
      State.updateGame({ lastTyped: typed });
      const result = Game.submitType(typed);
      result === 'correct' ? Sound.correct() : Sound.wrong();
      screen();
      setTimeout(() => {
        const done = Game.advance();
        if (done) State.setScreen('result');
        screen();
        const ni = document.getElementById('type-input');
        if (ni) {
          ni.focus();
          setTimeout(() => {
            const kana = document.querySelector('.kana-display');
            if (kana) kana.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        }
      }, result === 'correct' ? Game.NEXT_DELAY_CORRECT : Game.NEXT_DELAY_WRONG);
    }

    if (submit) submit.addEventListener('click', doSubmit);
    if (input)  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSubmit(); });
  }

  // ── Match mode — two separate columns ───────────────────────
  function _gameMatchHTML() {
    const g           = State.game;
    const totalGroups = g.groups.length;
    const done        = Game.answered();
    const total       = Game.totalQuestions();
    const pct         = total ? Math.round((done / total) * 100) : 0;

    function cardHTML(card, index, side) {
      const isMatched  = g.matchedPairs.includes(card.pairIndex);
      const selKey     = side === 'left' ? 'selectedLeft' : 'selectedRight';
      const isSelected = g[selKey] === index;
      const cls = [
        'match-card',
        card.type === 'char' ? 'char-card' : 'romaji-card',
        isMatched  ? 'matched'  : '',
        isSelected ? 'selected' : '',
      ].filter(Boolean).join(' ');
      const font = card.type === 'char' ? card.font : FONTS[0];
      return `<button class="${cls}" data-index="${index}" data-side="${side}"
        ${isMatched ? 'data-disabled="true"' : ''} style="font-family:${font}">
        ${card.value}
      </button>`;
    }

    const leftHTML  = g.leftCards.map((c, i)  => cardHTML(c, i, 'left')).join('');
    const rightHTML = g.rightCards.map((c, i) => cardHTML(c, i, 'right')).join('');

    return `
      <div class="screen screen-game">
        <header class="game-header">
          <button class="btn-back" id="btn-exit">✕ Salir</button>
          <div class="progress-wrap">
            <span class="progress-text">
              Grupo ${g.groupIndex + 1}/${totalGroups} · ${done}/${total} pares
            </span>
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="game-score">
            <span class="score-correct">✓ ${g.correct}</span>
            <span class="score-wrong">✗ ${g.wrong}</span>
          </div>
        </header>
        <div class="game-content">
          <div class="match-columns">
            <div class="match-col">
              <p class="match-col-header">Carácter</p>
              <div class="match-col-cards">${leftHTML}</div>
            </div>
            <div class="match-col">
              <p class="match-col-header">Romaji</p>
              <div class="match-col-cards">${rightHTML}</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function _gameMatchEvents() {
    document.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.dataset.disabled) return;
        const index  = parseInt(card.dataset.index, 10);
        const side   = card.dataset.side;
        const result = Game.selectCard(index, side);

        if (result.type === 'matched' || result.type === 'group-done') Sound.correct();
        if (result.type === 'done') Sound.correct();

        if (result.type === 'wrong') {
          Sound.wrong();
          // Flash both wrong cards before re-rendering
          const leftEl  = document.querySelector(`.match-col-cards .match-card[data-side="left"][data-index="${result.wrongLeft}"]`);
          const rightEl = document.querySelector(`.match-col-cards .match-card[data-side="right"][data-index="${result.wrongRight}"]`);
          [leftEl, rightEl].forEach(el => {
            if (!el) return;
            el.classList.add('flash-wrong');
            el.addEventListener('animationend', () => el.classList.remove('flash-wrong'), { once: true });
          });
          // Re-render after the flash animation (0.5s)
          setTimeout(() => screen(), 520);
          return;
        }

        if (result.type === 'done') {
          screen();
          setTimeout(() => { State.setScreen('result'); screen(); }, 500);
          return;
        }

        screen();
      });
    });
  }

  // ── Words mode ───────────────────────────────────────────────
  function _gameWordsHTML() {
    const g       = State.game;
    const current = g.queue[g.currentIndex];
    const fbClass = g.feedback ? `feedback-${g.feedback}` : '';
    const inpCls  = g.feedback || '';

    let revealHTML = `<div style="height:4rem"></div>`;
    if (g.feedback === 'correct') {
      revealHTML = `
        <div class="word-feedback correct">
          <span class="word-romaji-confirm correct">✓ ${current.romaji}</span>
          <span class="word-meaning-big">${current.meaning}</span>
        </div>`;
    } else if (g.feedback === 'wrong') {
      revealHTML = `
        <div class="word-feedback wrong">
          <span class="word-romaji-confirm wrong">✗ ${current.romaji}</span>
          <span class="word-meaning-big">${current.meaning}</span>
        </div>`;
    }

    const badge = g.mode === 'random'
      ? `<span class="mode-badge">🎲 palabras</span>` : '';

    return `
      <div class="screen screen-game">
        ${_gameHeaderHTML()}
        <div class="game-content">
          ${badge}
          <div class="word-emoji">${current.emoji}</div>
          <div class="kana-display ${fbClass}">${_kanaSpan(current.word, g.font)}</div>
          ${revealHTML}
          <div class="type-area">
            <input id="type-input" class="type-input ${inpCls}"
              type="text" autocomplete="off" autocorrect="off"
              autocapitalize="off" spellcheck="false"
              placeholder="romaji..."
              ${g.answered ? 'disabled' : ''}
              value="${g.answered ? (g.lastTyped || '') : ''}">
            <button class="btn-submit" id="btn-submit" ${g.answered ? 'disabled' : ''}>
              Verificar
            </button>
          </div>
        </div>
      </div>`;
  }

  function _gameWordsEvents() {
    const input  = document.getElementById('type-input');
    const submit = document.getElementById('btn-submit');
    if (input && !State.game.answered) {
      input.focus();
      setTimeout(() => {
        const kana = document.querySelector('.kana-display');
        if (kana) kana.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }

    function doSubmit() {
      if (State.game.answered) return;
      const typed = input ? input.value : '';
      if (!typed.trim()) return;
      State.updateGame({ lastTyped: typed });
      const result = Game.submitType(typed);
      result === 'correct' ? Sound.correct() : Sound.wrong();
      screen();
      setTimeout(() => {
        const done = Game.advance();
        if (done) State.setScreen('result');
        screen();
        const ni = document.getElementById('type-input');
        if (ni) {
          ni.focus();
          setTimeout(() => {
            const kana = document.querySelector('.kana-display');
            if (kana) kana.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        }
      }, result === 'correct' ? Game.NEXT_DELAY_CORRECT : Game.NEXT_DELAY_WRONG);
    }

    if (submit) submit.addEventListener('click', doSubmit);
    if (input)  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSubmit(); });
  }

  // ══════════════════════════════════════════════════════════════
  // RESULT
  // ══════════════════════════════════════════════════════════════
  function _resultHTML() {
    const s = Game.summary();
    return `
      <div class="screen screen-result">
        <div class="result-card">
          <div class="result-emoji">${s.emoji}</div>
          <h2 class="result-title">${s.message}</h2>
          <div class="result-stats">
            <div class="stat-box correct-stat">
              <span class="stat-number">${s.correct}</span>
              <span class="stat-label">Correctas</span>
            </div>
            <div class="stat-box wrong-stat">
              <span class="stat-number">${s.wrong}</span>
              <span class="stat-label">Incorrectas</span>
            </div>
          </div>
          <div class="result-percent">${s.percent}%</div>
          <div class="result-actions">
            <button class="btn btn-secondary" id="btn-retry">↺ Repetir</button>
            <button class="btn btn-primary"   id="btn-home">⌂ Inicio</button>
          </div>
        </div>
      </div>`;
  }

  function _resultEvents() {
    document.getElementById('btn-retry').addEventListener('click', () => {
      Game.start(); State.setScreen('game'); screen();
    });
    document.getElementById('btn-home').addEventListener('click', () => {
      State.setScreen('home'); screen();
    });
  }

  return { screen };
})();
