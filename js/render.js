/* ═══════════════════════════════════════════════════════════════
   render.js — All DOM rendering and event wiring.
   ═══════════════════════════════════════════════════════════════ */

const Render = (() => {

  // ─── Dictionary module-level state ───────────────────────────
  let _dictData  = null;   // loaded once from dictionary.json
  let _dictQuery = '';
  let _dictLevel = 'all';

  async function _loadDict() {
    if (_dictData) return;
    try {
      const resp = await fetch('js/dictionary.json');
      _dictData  = await resp.json();
    } catch (e) {
      _dictData = [];
    }
    screen(); // re-render with data
  }

  function _filterDict() {
    const q = _dictQuery.toLowerCase().normalize('NFC').trim();
    return (_dictData || []).filter(e => {
      if (_dictLevel !== 'all' && e.l !== _dictLevel) return false;
      if (!q) return true;
      return (
        e.h.includes(q) ||
        e.k.includes(q) ||
        e.r.includes(q) ||
        e.s.toLowerCase().includes(q)
      );
    });
  }

  function _updateDictResults() {
    const MAX = 200;
    const filtered = _filterDict();
    const shown    = filtered.slice(0, MAX);
    const total    = filtered.length;

    const tbody  = document.getElementById('dict-tbody');
    const countEl = document.getElementById('dict-count');

    if (tbody) {
      tbody.innerHTML = shown.map(e => `
        <tr>
          <td class="dict-s">${e.s}</td>
          <td class="dict-kana">${e.h}</td>
          <td class="dict-kana dict-muted">${e.k}</td>
          <td class="dict-rom">${e.r}</td>
          <td><span class="dict-lvl-badge dict-${e.l}">${e.l}</span></td>
        </tr>`).join('');
    }
    if (countEl) {
      countEl.textContent = total === 0
        ? 'Sin resultados'
        : total > MAX
          ? `${total.toLocaleString()} palabras · mostrando ${MAX}`
          : `${total.toLocaleString()} palabra${total !== 1 ? 's' : ''}`;
    }
  }

  // ─── Router ──────────────────────────────────────────────────
  function screen() {
    const app = document.getElementById('app');
    switch (State.screen) {
      case 'home':        app.innerHTML = _homeHTML();        _homeEvents();        break;
      case 'repaso':      app.innerHTML = _repasoHTML();      _repasoEvents();      break;
      case 'table':       app.innerHTML = _tableHTML();       _tableEvents();       break;
      case 'diccionario': app.innerHTML = _dictHTML();        _dictEvents();        break;
      case 'config':      app.innerHTML = _configHTML();       _configEvents();      break;
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
          <span class="score-correct">✓ ${g.correct || 0}</span>
          <span class="score-wrong">✗ ${g.wrong || 0}</span>
        </div>
      </header>`;
  }

  /** Effective mode for routing — handles 'random' subMode. */
  function _effectiveMode() {
    const g = State.game;
    return g.subMode || g.mode;
  }

  // ══════════════════════════════════════════════════════════════
  // HOME
  // ══════════════════════════════════════════════════════════════
  /** Pick a word deterministically from the combined pool based on today's date. */
  function _wordOfDay() {
    const pool = [...WORDS_HIRAGANA, ...WORDS_KATAKANA];
    const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
    return pool[daysSinceEpoch % pool.length];
  }

  function _homeHTML() {
    const { alphabet } = State.config;
    const hiA = alphabet === 'hiragana' ? 'active' : '';
    const kaA = alphabet === 'katakana' ? 'active' : '';

    const w    = _wordOfDay();
    const isHira = WORDS_HIRAGANA.includes(w);
    const badge  = isHira ? 'Hiragana' : 'Katakana';

    // Format today's date nicely
    const today = new Date().toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

    return `
      <div class="screen screen-home">
        <header class="home-header">
          <h1 class="app-title">かな練習</h1>
          <p class="app-subtitle">Kana Practice</p>
        </header>

        <!-- Word of the Day -->
        <div class="wod-card">
          <p class="wod-eyebrow">📅 Palabra del día &nbsp;·&nbsp; ${todayLabel}</p>
          <div class="wod-body">
            <span class="wod-emoji">${w.emoji}</span>
            <div class="wod-text">
              <span class="wod-kana" style="font-family:'Noto Sans JP',sans-serif">${w.word ?? w.h ?? ''}</span>
              <span class="wod-romaji">${w.romaji ?? w.r ?? ''}</span>
              <span class="wod-meaning">${w.meaning ?? w.s ?? ''}</span>
            </div>
          </div>
          <span class="wod-badge">${badge}</span>
        </div>

        <div class="alphabet-selector">
          <button class="btn-alphabet ${hiA}" data-alphabet="hiragana">
            <span class="kana-char" style="font-size:2.5rem;font-family:'Noto Sans JP',sans-serif">あ</span>
            <span class="label">Hiragana</span>
          </button>
          <button class="btn-alphabet ${kaA}" data-alphabet="katakana">
            <span class="kana-char" style="font-size:2.5rem;font-family:'Noto Sans JP',sans-serif">ア</span>
            <span class="label">Katakana</span>
          </button>
        </div>
        <div class="home-actions">
          <button class="btn btn-secondary" id="btn-table">📋 Ver Tabla</button>
          <button class="btn btn-secondary" id="btn-repaso">📝 Repaso</button>
          <button class="btn btn-secondary" id="btn-dict">📖 Diccionario</button>
          <button class="btn btn-primary"   id="btn-config">🎮 Practicar</button>
        </div>
      </div>`;
  }

  function _homeEvents() {
    document.querySelectorAll('.btn-alphabet').forEach(btn => {
      btn.addEventListener('click', () => { State.setAlphabet(btn.dataset.alphabet); screen(); });
    });
    document.getElementById('btn-table').addEventListener('click', () => {
      State.setScreen('table'); screen();
    });
    document.getElementById('btn-repaso').addEventListener('click', () => {
      State.setScreen('repaso'); screen();
    });
    document.getElementById('btn-dict').addEventListener('click', () => {
      State.setScreen('diccionario'); screen();
    });
    document.getElementById('btn-config').addEventListener('click', () => {
      State.setScreen('config'); screen();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // DICCIONARIO
  // ══════════════════════════════════════════════════════════════
  function _dictHTML() {
    const loading = !_dictData;
    const MAX     = 200;
    const filtered = _filterDict();
    const shown    = filtered.slice(0, MAX);
    const total    = filtered.length;

    const countText = loading
      ? 'Cargando…'
      : total === 0
        ? 'Sin resultados'
        : total > MAX
          ? `${total.toLocaleString()} palabras · mostrando ${MAX}`
          : `${total.toLocaleString()} palabra${total !== 1 ? 's' : ''}`;

    const lvls = ['all','N5','N4','N3'];
    const lvlLabels = { all: 'Todos', N5: 'N5', N4: 'N4', N3: 'N3' };
    const lvlBtns = lvls.map(l =>
      `<button class="dict-filter-btn ${_dictLevel === l ? 'active' : ''}" data-lvl="${l}">${lvlLabels[l]}</button>`
    ).join('');

    const rowsHTML = shown.map(e => `
      <tr>
        <td class="dict-s">${e.s}</td>
        <td class="dict-kana">${e.h}</td>
        <td class="dict-kana dict-muted">${e.k}</td>
        <td class="dict-rom">${e.r}</td>
        <td><span class="dict-lvl-badge dict-${e.l}">${e.l}</span></td>
      </tr>`).join('');

    return `
      <div class="screen screen-dict">
        <header class="screen-header">
          <button class="btn-back" id="btn-back">← Volver</button>
          <h2>📖 Diccionario</h2>
        </header>

        <div class="dict-controls">
          <input id="dict-search" class="dict-search" type="search"
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            placeholder="Buscar en español, kana o romaji…"
            value="${_dictQuery}">
          <div class="dict-level-row">${lvlBtns}</div>
        </div>

        ${loading
          ? `<div class="dict-loading">⏳ Cargando diccionario…</div>`
          : `<p id="dict-count" class="dict-count">${countText}</p>
             <div class="dict-table-wrap">
               <table class="dict-table">
                 <thead>
                   <tr>
                     <th>Español</th>
                     <th>Hiragana</th>
                     <th>Katakana</th>
                     <th>Romaji</th>
                     <th>Niv.</th>
                   </tr>
                 </thead>
                 <tbody id="dict-tbody">${rowsHTML}</tbody>
               </table>
             </div>`
        }
      </div>`;
  }

  function _dictEvents() {
    document.getElementById('btn-back').addEventListener('click', () => {
      State.setScreen('home'); screen();
    });

    if (!_dictData) { _loadDict(); return; }

    const input = document.getElementById('dict-search');
    if (input) {
      input.focus();
      input.addEventListener('input', () => {
        _dictQuery = input.value;
        _updateDictResults();
      });
    }

    document.querySelectorAll('.dict-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _dictLevel = btn.dataset.lvl;
        btn.closest('.dict-level-row').querySelectorAll('.dict-filter-btn')
          .forEach(b => b.classList.toggle('active', b === btn));
        _updateDictResults();
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // REPASO  — accordion with theory sections
  // ══════════════════════════════════════════════════════════════
  function _repasoHTML() {
    return `
      <div class="screen screen-repaso">
        <header class="screen-header">
          <button class="btn-back" id="btn-back">← Volver</button>
          <h2>📝 Repaso</h2>
        </header>
        <div class="repaso-body">

          <details class="repaso-item">
            <summary class="repaso-title">
              <span class="repaso-icon">🔤</span>
              <span>Gojūon (五十音) — Puros</span>
              <span class="repaso-chevron">›</span>
            </summary>
            <div class="repaso-content">
              <p>Los <strong>46 caracteres base</strong> del japonés. Son "la tabla" que todo estudiante aprende primero. No llevan ninguna marca adicional.</p>
              <p>Se organizan en <strong>filas por consonante</strong> y <strong>columnas por vocal</strong> (a · i · u · e · o):</p>
              <div class="repaso-examples">
                <div class="repaso-row-ex"><span class="rex-kana">あかさたな</span><span class="rex-rom">a · ka · sa · ta · na</span></div>
                <div class="repaso-row-ex"><span class="rex-kana">はまやらわ</span><span class="rex-rom">ha · ma · ya · ra · wa</span></div>
              </div>
              <p class="repaso-tip">💡 Aprendelos fila por fila, no columna por columna.</p>
            </div>
          </details>

          <details class="repaso-item">
            <summary class="repaso-title">
              <span class="repaso-icon">゛゜</span>
              <span>Dakuten &amp; Handakuten — Impuros</span>
              <span class="repaso-chevron">›</span>
            </summary>
            <div class="repaso-content">
              <div class="repaso-subsection">
                <h4>El tenten ゛— Dakuten (濁点)</h4>
                <p><strong>Tenten</strong> (てんてん) significa "puntito puntito" — se llama así por su forma. El nombre técnico es <strong>dakuten</strong> (濁点, "marca de sonorización").</p>
                <p>Convierte sonidos <em>sordos</em> en <em>sonoros</em>:</p>
                <div class="repaso-transform-grid">
                  <div><span class="rex-kana">か → が</span> <span class="rex-rom">k → g</span></div>
                  <div><span class="rex-kana">さ → ざ</span> <span class="rex-rom">s → z</span></div>
                  <div><span class="rex-kana">た → だ</span> <span class="rex-rom">t → d</span></div>
                  <div><span class="rex-kana">は → ば</span> <span class="rex-rom">h → b</span></div>
                </div>
              </div>
              <div class="repaso-subsection">
                <h4>El maru ゜— Handakuten (半濁点)</h4>
                <p><strong>Maru</strong> (まる) significa "círculo". El nombre técnico es <strong>handakuten</strong> (半濁点, "marca semi-sonora").</p>
                <p>Solo funciona en la fila H, convirtiéndola en P:</p>
                <div class="repaso-transform-grid">
                  <div><span class="rex-kana">は → ぱ</span> <span class="rex-rom">ha → pa</span></div>
                  <div><span class="rex-kana">ひ → ぴ</span> <span class="rex-rom">hi → pi</span></div>
                  <div><span class="rex-kana">ふ → ぷ</span> <span class="rex-rom">fu → pu</span></div>
                  <div><span class="rex-kana">へ → ぺ</span> <span class="rex-rom">he → pe</span></div>
                  <div><span class="rex-kana">ほ → ぽ</span> <span class="rex-rom">ho → po</span></div>
                </div>
              </div>
            </div>
          </details>

          <details class="repaso-item">
            <summary class="repaso-title">
              <span class="repaso-icon">きゃ</span>
              <span>Yōon (拗音) — Compuestos</span>
              <span class="repaso-chevron">›</span>
            </summary>
            <div class="repaso-content">
              <p>Se forman combinando un carácter de la <strong>fila い</strong> con una versión <strong>pequeña</strong> de ya / yu / yo.</p>
              <div class="repaso-examples">
                <div class="repaso-row-ex"><span class="rex-kana">き + ゃ = きゃ</span><span class="rex-rom">ki + ya = kya</span></div>
                <div class="repaso-row-ex"><span class="rex-kana">し + ゅ = しゅ</span><span class="rex-rom">shi + yu = shu</span></div>
                <div class="repaso-row-ex"><span class="rex-kana">ち + ょ = ちょ</span><span class="rex-rom">chi + yo = cho</span></div>
                <div class="repaso-row-ex"><span class="rex-kana">ぎ + ゃ = ぎゃ</span><span class="rex-rom">gi + ya = gya</span></div>
                <div class="repaso-row-ex"><span class="rex-kana">じ + ゅ = じゅ</span><span class="rex-rom">ji + yu = ju</span></div>
              </div>
              <div class="repaso-warning">
                ⚠️ El tamaño importa:<br>
                <span class="rex-kana">ゃゅょ</span> (pequeño, compuesto) ≠ <span class="rex-kana">やゆよ</span> (normal, sílaba propia)
              </div>
              <p class="repaso-tip">💡 El carácter pequeño no es una sílaba independiente, es un modificador del anterior.</p>
            </div>
          </details>

          <details class="repaso-item">
            <summary class="repaso-title">
              <span class="repaso-icon">ō</span>
              <span>Vocales largas (長音) — El macron</span>
              <span class="repaso-chevron">›</span>
            </summary>
            <div class="repaso-content">
              <p>El <strong>macron</strong> (la raya plana: ā ī ū ē ō) indica que esa vocal se pronuncia <strong>el doble de tiempo</strong>. No es decorativo — cambia el significado.</p>
              <div class="repaso-warning">
                おばさん = obasan (tía) · おばあさん = obāsan (abuela)
              </div>

              <div class="repaso-subsection">
                <h4>En katakana: el chōonpu ー</h4>
                <p>Se usa el signo <strong>ー</strong>, llamado <strong>chōonpu</strong> (長音符, "símbolo de vocal larga"). Simplemente extiende la vocal anterior.</p>
                <div class="repaso-examples">
                  <div class="repaso-row-ex"><span class="rex-kana">コ + ー = コー</span><span class="rex-rom">ko + ー = kō</span></div>
                  <div class="repaso-row-ex"><span class="rex-kana">ラ + ー = ラー</span><span class="rex-rom">ra + ー = rā</span></div>
                  <div class="repaso-row-ex"><span class="rex-kana">ビ + ー = ビー</span><span class="rex-rom">bi + ー = bī</span></div>
                </div>
              </div>

              <div class="repaso-subsection">
                <h4>En hiragana: se agrega la vocal</h4>
                <p>No hay un símbolo especial. En cambio, se escribe la vocal que extiende el sonido:</p>
                <table class="repaso-table">
                  <thead><tr><th>Vocal</th><th>Patrón</th><th>Macron</th><th>Ejemplo</th></tr></thead>
                  <tbody>
                    <tr><td>a</td><td>+ あ</td><td>ā</td><td class="rex-kana-sm">おかあさん → okāsan</td></tr>
                    <tr><td>i</td><td>+ い</td><td>ī</td><td class="rex-kana-sm">きいろ → kīro</td></tr>
                    <tr><td>u</td><td>+ う</td><td>ū</td><td class="rex-kana-sm">ゆうき → yūki</td></tr>
                    <tr><td>e</td><td>+ い</td><td>ē</td><td class="rex-kana-sm">とけい → tokē</td></tr>
                    <tr><td>o</td><td>+ う</td><td>ō</td><td class="rex-kana-sm">がっこう → gakkō</td></tr>
                    <tr><td>o</td><td>+ お</td><td>ō</td><td class="rex-kana-sm">おおきい → ōkī</td></tr>
                  </tbody>
                </table>
              </div>

              <div class="repaso-subsection">
                <h4>La regla ou → ō</h4>
                <p>おう <strong>siempre</strong> se pronuncia ō en japonés moderno. Nunca como dos vocales separadas "o-u". Cuando veas "ou" en romanizaciones viejas, es un ō.</p>
                <div class="repaso-examples">
                  <div class="repaso-row-ex"><span class="rex-kana">がっこう</span><span class="rex-rom">gakkō (no "gakkou")</span></div>
                  <div class="repaso-row-ex"><span class="rex-kana">ありがとう</span><span class="rex-rom">arigatō (no "arigatou")</span></div>
                </div>
              </div>

              <div class="repaso-subsection">
                <h4>La regla ei → ē</h4>
                <p>えい en japonés moderno casi siempre se pronuncia como una ē larga. En la romanización Hepburn estándar puede escribirse "ei" o "ē". En esta app usamos macron.</p>
                <div class="repaso-examples">
                  <div class="repaso-row-ex"><span class="rex-kana">とけい</span><span class="rex-rom">tokē (reloj)</span></div>
                  <div class="repaso-row-ex"><span class="rex-kana">せんせい</span><span class="rex-rom">sensē (maestro)</span></div>
                </div>
              </div>

              <p class="repaso-tip">💡 La doble vocal (koohii, gakkou) también se acepta como respuesta correcta en esta app.</p>
            </div>
          </details>

          <details class="repaso-item">
            <summary class="repaso-title">
              <span class="repaso-icon" style="font-family:'Noto Sans JP',sans-serif">っ</span>
              <span>Sokuon (促音) — Doble consonante</span>
              <span class="repaso-chevron">›</span>
            </summary>
            <div class="repaso-content">
              <p>El carácter <strong>っ</strong> (hiragana) / <strong>ッ</strong> (katakana) se llama <strong>sokuon</strong> (促音). Informalmente: <strong>tsu pequeño</strong> (ちいさいつ).</p>
              <p>No tiene sonido propio. Crea una <strong>pausa de una mora</strong> y hace que la consonante siguiente se pronuncie doble — como si la "retuvieras" un instante antes de soltarla.</p>

              <div class="repaso-subsection">
                <h4>Regla en romaji: duplicar la consonante siguiente</h4>
                <table class="repaso-table">
                  <thead><tr><th>Combinación</th><th>Romaji</th><th>Ejemplo</th></tr></thead>
                  <tbody>
                    <tr><td class="rex-kana-sm">っ + か</td><td><strong>kk</strong></td><td class="rex-kana-sm">がっこう → gakkō</td></tr>
                    <tr><td class="rex-kana-sm">っ + た</td><td><strong>tt</strong></td><td class="rex-kana-sm">きって → kitte</td></tr>
                    <tr><td class="rex-kana-sm">っ + さ</td><td><strong>ss</strong></td><td class="rex-kana-sm">ざっし → zasshi</td></tr>
                    <tr><td class="rex-kana-sm">っ + ぱ</td><td><strong>pp</strong></td><td class="rex-kana-sm">きっぷ → kippu</td></tr>
                    <tr><td class="rex-kana-sm">ッ + ク</td><td><strong>kk</strong></td><td class="rex-kana-sm">サッカー → sakkā</td></tr>
                    <tr><td class="rex-kana-sm">ッ + ト</td><td><strong>tt</strong></td><td class="rex-kana-sm">ロケット → roketto</td></tr>
                  </tbody>
                </table>
              </div>

              <div class="repaso-subsection">
                <h4>Caso especial: っ + ち (chi)</h4>
                <p>Antes de <strong>ち</strong>, se duplica el dígrafo completo "ch" → <strong>cch</strong> (no "tch").</p>
                <div class="repaso-examples">
                  <div class="repaso-row-ex"><span class="rex-kana">サンドイッチ</span><span class="rex-rom">sandoicchi</span></div>
                </div>
              </div>

              <div class="repaso-warning">
                ⚠️ Tamaño importa: <span style="font-family:'Noto Sans JP',sans-serif">っ</span> (pequeño, sokuon) ≠ <span style="font-family:'Noto Sans JP',sans-serif">つ</span> (normal, "tsu")
              </div>
              <p class="repaso-tip">💡 En el teclado de esta app, っ/ッ está en la fila de caracteres especiales.</p>
            </div>
          </details>

        </div>
      </div>`;
  }

  function _repasoEvents() {
    document.getElementById('btn-back').addEventListener('click', () => {
      State.setScreen('home'); screen();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TABLE  (+ guide tab)
  // ══════════════════════════════════════════════════════════════
  function _tableHTML() {
    const { alphabet } = State.config;
    const tab    = State.tableTab;
    const lookup = getLookup(alphabet);
    const label  = alphabet === 'hiragana' ? 'Hiragana' : 'Katakana';
    const tabs   = ['gojuon', 'dakuten', 'youon'];
    const tl     = { gojuon: 'Gojūon', dakuten: 'Dakuten', youon: 'Yōon' };
    const tabsHTML = tabs.map(t =>
      `<button class="tab-btn ${t === tab ? 'active' : ''}" data-tab="${t}">${tl[t]}</button>`
    ).join('');
    return `
      <div class="screen screen-table">
        <header class="table-header">
          <div class="table-header-top">
            <button class="btn-back" id="btn-back">← Volver</button>
            <h2>${label}</h2>
          </div>
          <div class="table-tabs">${tabsHTML}</div>
        </header>
        <div class="table-body">${_tableContentHTML(tab, lookup)}</div>
      </div>`;
  }

  function _tableContentHTML(tab, lookup) {
    if (tab === 'gojuon')  return _kanaGridHTML(TABLE_GOJUON_ROWS, ['a','i','u','e','o'], 'cols-6', lookup);
    if (tab === 'dakuten') return `
      <div class="table-section">
        <p class="table-section-title">Dakuten (voiced ゛) + Handakuten (semi-voiced ゜)</p>
        ${_kanaGridHTML(TABLE_DAKUTEN_ROWS, ['a','i','u','e','o'], 'cols-6', lookup)}
      </div>`;
    if (tab === 'youon')   return `
      <div class="table-section">
        <p class="table-section-title">Yōon — compuestos (ya / yu / yo)</p>
        ${_kanaGridHTML(TABLE_YOUON_ROWS, ['ya','yu','yo'], 'cols-4', lookup)}
      </div>`;
    return _guideHTML();
  }

  function _kanaGridHTML(rows, colLabels, colClass, lookup) {
    const headerCells = ['', ...colLabels].map(l =>
      `<div class="kana-col-label">${l}</div>`).join('');
    const dataRows = rows.map(row => {
      const cells = row.romajis.map(r => {
        if (!r || !lookup[r]) return `<div class="kana-cell empty"></div>`;
        return `<div class="kana-cell ${row.rowClass}" title="${r}">
          <span class="char">${lookup[r]}</span><span class="rom">${r}</span>
        </div>`;
      }).join('');
      return `<div class="kana-col-label">${row.label}</div>${cells}`;
    }).join('');
    return `<div class="kana-grid ${colClass}">${headerCells}${dataRows}</div>`;
  }

  // ─── Guide tab ───────────────────────────────────────────────
  function _guideHTML() {
    return `
      <div class="guide-body">

        <div class="guide-section">
          <h3>🔤 Gojūon (五十音) — Puros</h3>
          <p>Los 46 caracteres base. Cada uno representa una sílaba: vocal sola o consonante + vocal. Sin ninguna marca adicional.</p>
          <div class="guide-chars">
            ${[['あ','a'],['か','ka'],['さ','sa'],['た','ta'],['な','na'],
               ['は','ha'],['ま','ma'],['や','ya'],['ら','ra'],['わ','wa']].map(([c,r]) =>
              `<div class="guide-pair"><span class="guide-kana">${c}</span><span class="guide-rom">${r}</span></div>`
            ).join('')}
          </div>
          <p class="guide-note">En katakana: ア カ サ タ ナ ハ マ ヤ ラ ワ</p>
        </div>

        <div class="guide-section">
          <h3>゛゜ Dakuten / Handakuten — Impuros</h3>
          <p>Agregar <strong>゛</strong>(dakuten) cambia el sonido a su versión sonora. Agregar <strong>゜</strong>(handakuten) lo vuelve semi-sonoro.</p>
          <div class="guide-transforms">
            <div class="guide-transform">か → <strong>が</strong> <span class="guide-rom-inline">(ka → ga)</span></div>
            <div class="guide-transform">さ → <strong>ざ</strong> <span class="guide-rom-inline">(sa → za)</span></div>
            <div class="guide-transform">た → <strong>だ</strong> <span class="guide-rom-inline">(ta → da)</span></div>
            <div class="guide-transform">は → <strong>ば</strong> → <strong>ぱ</strong> <span class="guide-rom-inline">(ha → ba → pa)</span></div>
          </div>
          <p class="guide-note">En katakana: カ → ガ · サ → ザ · ハ → バ → パ</p>
        </div>

        <div class="guide-section">
          <h3>拗音 Yōon — Compuestos</h3>
          <p>Se forman combinando un carácter de la fila い con una versión <strong>pequeña</strong> de や, ゆ o よ.</p>
          <div class="guide-youon-examples">
            <div class="guide-youon-row">
              <span class="guide-kana-big">きゃ</span>
              <span class="guide-youon-eq">= き + <span class="guide-small-kana">ゃ</span></span>
              <span class="guide-rom">kya</span>
            </div>
            <div class="guide-youon-row">
              <span class="guide-kana-big">しゅ</span>
              <span class="guide-youon-eq">= し + <span class="guide-small-kana">ゅ</span></span>
              <span class="guide-rom">shu</span>
            </div>
            <div class="guide-youon-row">
              <span class="guide-kana-big">ちょ</span>
              <span class="guide-youon-eq">= ち + <span class="guide-small-kana">ょ</span></span>
              <span class="guide-rom">cho</span>
            </div>
          </div>
          <div class="guide-warning">⚠️ Fijate en el tamaño: <span style="font-family:'Noto Sans JP'">ゃゅょ</span> (pequeño, compuesto) ≠ <span style="font-family:'Noto Sans JP'">やゆよ</span> (normal)</div>
          <p class="guide-note">En katakana: キャ シュ チョ · Con impuros: ギャ ジュ ビョ ピャ…</p>
        </div>

        <div class="guide-section">
          <h3>ー 長音 — Vocales largas</h3>
          <p>Ciertas sílabas se pronuncian el <strong>doble de tiempo</strong>. En rōmaji se indica con macron (ō, ū) o doble vocal (oo, uu).</p>
          <div class="guide-lv-block">
            <p class="guide-lv-title">En katakana → se usa ー</p>
            <div class="guide-lv-row"><span class="guide-kana-md">コーヒー</span><span class="guide-rom-inline">ko·<strong>o</strong>·hi·<strong>i</strong> = koohii ☕</span></div>
            <div class="guide-lv-row"><span class="guide-kana-md">ラーメン</span><span class="guide-rom-inline">ra·<strong>a</strong>·me·n = raamen 🍜</span></div>
            <div class="guide-lv-row"><span class="guide-kana-md">スーパー</span><span class="guide-rom-inline">su·<strong>u</strong>·pa·<strong>a</strong> = suupaa 🛒</span></div>
          </div>
          <div class="guide-lv-block">
            <p class="guide-lv-title">En hiragana → se agrega la vocal extendida</p>
            <div class="guide-lv-row"><span class="guide-kana-md">おとうさん</span><span class="guide-rom-inline">o·to·<strong>u</strong>·sa·n = otousan (papá)</span></div>
            <div class="guide-lv-row"><span class="guide-kana-md">とけい</span><span class="guide-rom-inline">to·ke·<strong>i</strong> = tokei ⏰</span></div>
            <div class="guide-lv-row"><span class="guide-kana-md">ちょう</span><span class="guide-rom-inline">cho·<strong>u</strong> = chou 🦋</span></div>
          </div>
          <div class="guide-lv-block">
            <p class="guide-lv-title">Equivalencias en rōmaji</p>
            <div class="guide-lv-romaji">ō = oo &nbsp;·&nbsp; ū = uu &nbsp;·&nbsp; ā = aa &nbsp;·&nbsp; ē = ei o ee</div>
          </div>
        </div>

      </div>`;
  }

  function _tableEvents() {
    document.getElementById('btn-back').addEventListener('click', () => {
      State.setScreen('home'); screen();
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => { State.setTableTab(btn.dataset.tab); screen(); });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CONFIG
  // ══════════════════════════════════════════════════════════════
  function _configHTML() {
    const { sets, mode, fonts, rounds, wordDirection, tableFillLevel, alphabet } = State.config;
    const isTableFill = mode === 'table-fill';
    const isWords     = mode === 'words' || mode === 'random';

    // Check for empty word pool (words / random)
    let emptyPoolWarning = '';
    if (isWords) {
      const count = getFilteredWords(alphabet, sets).length;
      if (count === 0) {
        emptyPoolWarning = `<p class="config-warning">⚠️ Ninguna palabra disponible con los sets actuales. Activá más opciones.</p>`;
      }
    }

    const modes = [
      { key: 'multiple',   label: 'Opción múltiple' },
      { key: 'type',       label: 'Escribir' },
      { key: 'match',      label: 'Emparejar' },
      { key: 'words',      label: 'Palabras' },
      { key: 'random',     label: '🎲 Random' },
      { key: 'table-fill', label: '📋 Completa tabla' },
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
      const val = r === null ? 'all' : r;
      return `<button class="opt-btn ${active}" data-rounds="${val}">${r === null ? 'Todo' : r}</button>`;
    }).join('');

    // Word direction (only for words / random)
    const wordDirHTML = isWords ? `
      <section class="config-section">
        <h3>Dirección (Palabras)</h3>
        <div class="option-grid cols-2">
          <button class="opt-btn ${wordDirection === 'jp-to-romaji' ? 'active' : ''}" data-direction="jp-to-romaji">日 → Romaji</button>
          <button class="opt-btn ${wordDirection === 'romaji-to-jp' ? 'active' : ''}" data-direction="romaji-to-jp">Romaji → 日</button>
        </div>
      </section>` : '';

    // Table fill level (only for table-fill)
    const tfLevelHTML = isTableFill ? `
      <section class="config-section">
        <h3>Nivel de la tabla</h3>
        <div class="option-grid cols-3">
          <button class="opt-btn ${tableFillLevel === 'gojuon'  ? 'active' : ''}" data-tflevel="gojuon">1 — Puros</button>
          <button class="opt-btn ${tableFillLevel === 'dakuten' ? 'active' : ''}" data-tflevel="dakuten">2 — + Impuros</button>
          <button class="opt-btn ${tableFillLevel === 'all'     ? 'active' : ''}" data-tflevel="all">3 — + Yōon</button>
        </div>
      </section>` : '';

    // Characters section (hidden for table-fill, relevant for others)
    const charSectionHTML = !isTableFill ? `
      <section class="config-section">
        <h3>Caracteres</h3>
        <label class="checkbox-option">
          <input type="checkbox" id="set-gojuon" ${sets.gojuon ? 'checked' : ''}>
          <span class="opt-text">
            <span class="opt-label">Gojūon — puros</span>
            <span class="opt-sub">あ か さ た な は ま や ら わ…</span>
          </span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" id="set-dakuten" ${sets.dakuten ? 'checked' : ''}>
          <span class="opt-text">
            <span class="opt-label">Dakuten / Handakuten — impuros</span>
            <span class="opt-sub">が ざ ば ぱ…</span>
          </span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" id="set-youon" ${sets.youon ? 'checked' : ''}>
          <span class="opt-text">
            <span class="opt-label">Yōon — compuestos</span>
            <span class="opt-sub">きゃ しゅ ちょ…</span>
          </span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" id="set-longVowel" ${sets.longVowel ? 'checked' : ''}>
          <span class="opt-text">
            <span class="opt-label">Vocales largas — acentos (ō ū ā ē ī)</span>
            <span class="opt-sub">コーヒー · がっこう → kōhī · gakkō…</span>
          </span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" id="set-sokuon" ${sets.sokuon ? 'checked' : ''}>
          <span class="opt-text">
            <span class="opt-label">Sokuon — doble consonante (っ / ッ)</span>
            <span class="opt-sub">きって · サッカー → kitte · sakkā…</span>
          </span>
        </label>
        ${emptyPoolWarning}
      </section>` : '';

    // Rounds (not for table-fill)
    const roundsHTML = !isTableFill ? `
      <section class="config-section">
        <h3>Preguntas por sesión</h3>
        <div class="option-grid cols-4">${roundButtons}</div>
      </section>` : '';

    const startDisabled = isWords && getFilteredWords(alphabet, sets).length === 0;

    return `
      <div class="screen screen-config">
        <header class="screen-header">
          <button class="btn-back" id="btn-back">← Volver</button>
          <h2>Configurar práctica</h2>
        </header>
        <div class="config-body">
          <section class="config-section">
            <h3>Modo de juego <button class="section-help-btn" id="btn-modes-help" aria-label="Explicar modos">?</button></h3>
            <div class="option-grid cols-3">${modeButtons}</div>
          </section>
          ${tfLevelHTML}
          ${wordDirHTML}
          ${roundsHTML}
          ${charSectionHTML}
          <section class="config-section">
            <h3>Fuente de los caracteres</h3>
            <div class="option-grid cols-2">${fontButtons}</div>
          </section>
        </div>
        <div class="config-footer">
          <button class="btn btn-primary" id="btn-start" ${startDisabled ? 'disabled' : ''}>▶ Empezar</button>
        </div>

      </div>`;
  }

  function _configEvents() {
    document.getElementById('btn-back').addEventListener('click', () => {
      State.setScreen('home'); screen();
    });

    ['gojuon','dakuten','youon','longVowel','sokuon'].forEach(key => {
      const el = document.getElementById(`set-${key}`);
      if (!el) return;
      el.addEventListener('change', () => {
        const accepted = State.toggleSet(key);
        if (!accepted) el.checked = true;
        else screen(); // re-render for empty pool warning
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
        State.setRounds(val); screen();
      });
    });

    document.querySelectorAll('[data-direction]').forEach(btn => {
      btn.addEventListener('click', () => { State.setWordDirection(btn.dataset.direction); screen(); });
    });

    document.querySelectorAll('[data-tflevel]').forEach(btn => {
      btn.addEventListener('click', () => { State.setTableFillLevel(btn.dataset.tflevel); screen(); });
    });

    // Popup modos de juego
    const modesModal = document.getElementById('modes-modal');
    document.getElementById('btn-modes-help')?.addEventListener('click', () => {
      modesModal?.classList.add('open');
    });
    document.getElementById('modes-modal-close')?.addEventListener('click', () => {
      modesModal?.classList.remove('open');
    });
    modesModal?.addEventListener('click', e => {
      if (e.target === modesModal) modesModal.classList.remove('open');
    });

    document.getElementById('btn-start').addEventListener('click', () => {
      Game.start();
      // Empty pool guard
      if (State.game?.emptyPool) { screen(); return; }
      State.setScreen('game');
      screen();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // GAME — routes by effective mode + word direction
  // ══════════════════════════════════════════════════════════════
  function _gameHTML() {
    const g  = State.game;
    // Empty pool guard
    if (g?.emptyPool) return `
      <div class="screen screen-config" style="align-items:center;justify-content:center;padding:2rem">
        <p style="text-align:center;color:var(--wrong);font-weight:700">Sin palabras disponibles.<br>Activá más sets en la configuración.</p>
        <button class="btn btn-primary" id="btn-back-config" style="margin-top:1rem">← Configuración</button>
      </div>`;

    const em = _effectiveMode();
    if (em === 'words') {
      const dir = (g.wordDirection || State.config.wordDirection);
      return dir === 'romaji-to-jp' ? _gameWordsRtJHTML() : _gameWordsHTML();
    }
    switch (em) {
      case 'multiple':   return _gameMultipleHTML();
      case 'type':       return _gameTypeHTML();
      case 'match':      return _gameMatchHTML();
      case 'table-fill': return _gameTableFillHTML();
    }
  }

  function _gameEvents() {
    if (State.game?.emptyPool) {
      document.getElementById('btn-back-config')?.addEventListener('click', () => {
        State.setScreen('config'); screen();
      });
      return;
    }
    document.getElementById('btn-exit')?.addEventListener('click', () => {
      State.setScreen('home'); screen();
    });
    const em = _effectiveMode();
    if (em === 'words') {
      const dir = (State.game.wordDirection || State.config.wordDirection);
      dir === 'romaji-to-jp' ? _gameWordsRtJEvents() : _gameWordsEvents();
      return;
    }
    switch (em) {
      case 'multiple':   _gameMultipleEvents(); break;
      case 'type':       _gameTypeEvents();     break;
      case 'match':      _gameMatchEvents();    break;
      case 'table-fill': _gameTableFillEvents(); break;
    }
  }

  // ── Multiple choice ──────────────────────────────────────────
  function _gameMultipleHTML() {
    const g = State.game;
    const current = g.queue[g.currentIndex];
    const fbClass = g.feedback ? `feedback-${g.feedback}` : '';
    const badge = g.mode === 'random' ? `<span class="mode-badge">🎲 opción múltiple</span>` : '';
    const choiceButtons = g.choices.map(c => {
      let cls = '';
      if (g.answered) {
        if (c.romaji === current.romaji) cls = 'correct';
        else if (g.feedback === 'wrong' && c.romaji === g.lastWrong) cls = 'wrong';
      }
      return `<button class="choice-btn ${cls}" data-romaji="${c.romaji}" ${g.answered ? 'disabled' : ''}>${c.romaji}</button>`;
    }).join('');
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
    const g = State.game;
    const current = g.queue[g.currentIndex];
    const fbClass = g.feedback ? `feedback-${g.feedback}` : '';
    const inpCls  = g.feedback || '';
    const badge = g.mode === 'random' ? `<span class="mode-badge">🎲 escribir</span>` : '';
    let hint = `<span class="type-hint">Escribí el romaji y presioná Enter</span>`;
    if (g.feedback === 'correct') hint = `<span class="type-hint reveal">✓ ${current.romaji}</span>`;
    if (g.feedback === 'wrong')   hint = `<span class="type-hint reveal wrong">✗ Respuesta: ${current.romaji}</span>`;
    return `
      <div class="screen screen-game">
        ${_gameHeaderHTML()}
        <div class="game-content">
          ${badge}
          <div class="kana-display ${fbClass}">${_kanaSpan(current.char, g.font)}</div>
          <div class="type-area">
            <input id="type-input" class="type-input ${inpCls}"
              type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
              placeholder="romaji..."
              ${g.answered ? 'disabled' : ''}
              value="${g.answered ? (g.lastTyped || '') : ''}">
            ${hint}
            <button class="btn-submit" id="btn-submit" ${g.answered ? 'disabled' : ''}>Verificar</button>
          </div>
        </div>
      </div>`;
  }

  function _gameTypeEvents() {
    const input  = document.getElementById('type-input');
    const submit = document.getElementById('btn-submit');
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
      const cls = ['match-card', card.type === 'char' ? 'char-card' : 'romaji-card',
        isMatched ? 'matched' : '', isSelected ? 'selected' : ''].filter(Boolean).join(' ');
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
            <span class="progress-text">Grupo ${g.groupIndex + 1}/${totalGroups} · ${done}/${total} pares</span>
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
        if (result.type === 'wrong') {
          Sound.wrong();
          const lEl = document.querySelector(`.match-col-cards .match-card[data-side="left"][data-index="${result.wrongLeft}"]`);
          const rEl = document.querySelector(`.match-col-cards .match-card[data-side="right"][data-index="${result.wrongRight}"]`);
          [lEl, rEl].forEach(el => {
            if (!el) return;
            el.classList.add('flash-wrong');
            el.addEventListener('animationend', () => el.classList.remove('flash-wrong'), { once: true });
          });
          setTimeout(() => screen(), 520);
          return;
        }
        if (result.type === 'matched' || result.type === 'group-done') Sound.correct();
        if (result.type === 'done') {
          Sound.correct();
          screen();
          setTimeout(() => { State.setScreen('result'); screen(); }, 500);
          return;
        }
        screen();
      });
    });
  }

  // ── Macron vowel helper bar (ā ī ū ē ō) ─────────────────────
  // Shown above the input in words JP→Romaji mode.
  // mousedown:preventDefault keeps focus on the text input when tapped.
  function _macronBarHTML() {
    return `<div class="macron-bar" aria-label="Vocales largas">
      <span class="macron-label">vocal larga →</span>
      ${['ā','ī','ū','ē','ō'].map(v =>
        `<button class="macron-btn" data-vowel="${v}" tabindex="-1">${v}</button>`
      ).join('')}
    </div>`;
  }

  // ── Words JP→Romaji ──────────────────────────────────────────
  function _gameWordsHTML() {
    const g       = State.game;
    const current = g.queue[g.currentIndex];
    const fbClass = g.feedback ? `feedback-${g.feedback}` : '';
    const inpCls  = g.feedback || '';
    const badge = g.mode === 'random' ? `<span class="mode-badge">🎲 palabras</span>` : '';
    let revealHTML = `<div style="height:4rem"></div>`;
    if (g.feedback === 'correct') {
      revealHTML = `<div class="word-feedback correct">
        <span class="word-romaji-confirm correct">✓ ${current.romaji}</span>
        <span class="word-meaning-big">${current.meaning}</span></div>`;
    } else if (g.feedback === 'wrong') {
      revealHTML = `<div class="word-feedback wrong">
        <span class="word-romaji-confirm wrong">✗ ${current.romaji}</span>
        <span class="word-meaning-big">${current.meaning}</span></div>`;
    }
    return `
      <div class="screen screen-game">
        ${_gameHeaderHTML()}
        <div class="game-content">
          ${badge}
          <div class="word-emoji">${current.emoji}</div>
          <div class="kana-display ${fbClass}">${_kanaSpan(current.word, g.font)}</div>
          ${revealHTML}
          <div class="type-area">
            ${!g.answered ? _macronBarHTML() : ''}
            <input id="type-input" class="type-input ${inpCls}"
              type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
              placeholder="romaji..."
              ${g.answered ? 'disabled' : ''}
              value="${g.answered ? (g.lastTyped || '') : ''}">
            <button class="btn-submit" id="btn-submit" ${g.answered ? 'disabled' : ''}>Verificar</button>
          </div>
        </div>
      </div>`;
  }

  function _gameWordsEvents() {
    const input  = document.getElementById('type-input');
    const submit = document.getElementById('btn-submit');

    // Macron buttons: insert vowel at cursor without blurring the input
    document.querySelectorAll('.macron-btn').forEach(btn => {
      btn.addEventListener('mousedown', e => e.preventDefault()); // keep focus
      btn.addEventListener('click', () => {
        if (!input || State.game.answered) return;
        const s = input.selectionStart, e2 = input.selectionEnd;
        input.value = input.value.slice(0, s) + btn.dataset.vowel + input.value.slice(e2);
        input.selectionStart = input.selectionEnd = s + 1;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      });
    });

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
      }, result === 'correct' ? Game.NEXT_DELAY_CORRECT : Game.NEXT_DELAY_WRONG);
    }
    if (submit) submit.addEventListener('click', doSubmit);
    if (input)  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSubmit(); });
  }

  // ── Words Romaji→JP (on-screen kana keyboard) ────────────────
  function _gameWordsRtJHTML() {
    const g        = State.game;
    const current  = g.queue[g.currentIndex];
    const alphabet = State.config.alphabet;
    const sets     = State.config.sets;
    const input    = (g.currentInput || []).join('');
    const fbClass  = g.feedback ? `feedback-${g.feedback}` : '';
    const badge    = g.mode === 'random' ? `<span class="mode-badge">🎲 palabras</span>` : '';
    const kb       = KEYBOARD_ROWS[alphabet];

    const renderRow = (row, extraClass = '') =>
      `<div class="kb-row">${row.map(c => c
        ? `<button class="kb-key ${extraClass}" data-char="${c}">${c}</button>`
        : `<span class="kb-cell-gap"></span>`
      ).join('')}</div>`;

    const basicHTML   = kb.basic.map(row => renderRow(row)).join('');
    const dakutenHTML = sets.dakuten
      ? `<p class="kb-section-label">Impuros</p>${kb.dakuten.map(r => renderRow(r,'kb-key-dakuten')).join('')}`
      : '';
    const specialHTML = `<div class="kb-row">${kb.special.map(c =>
      `<button class="kb-key kb-key-special" data-char="${c}">${c}</button>`
    ).join('')}</div>`;

    let revealHTML = '';
    if (g.feedback === 'correct') {
      revealHTML = `<div class="word-feedback correct">
        <span class="word-romaji-confirm correct">✓ ${current.word}</span>
        <span class="word-meaning-big">${current.meaning}</span></div>`;
    } else if (g.feedback === 'wrong') {
      revealHTML = `<div class="word-feedback wrong">
        <span class="word-romaji-confirm wrong">✗ ${current.word}</span>
        <span class="word-meaning-big">${current.meaning}</span></div>`;
    }

    return `
      <div class="screen screen-game">
        ${_gameHeaderHTML()}
        <div class="game-content rtoj-content">
          ${badge}
          <div class="rtoj-prompt">
            <span class="rtoj-emoji">${current.emoji}</span>
            <span class="rtoj-romaji">${current.romaji}</span>
          </div>
          <div class="kana-input-display ${fbClass}">
            ${input
              ? `<span style="font-family:'Noto Sans JP',sans-serif">${input}</span>`
              : `<span class="kana-input-placeholder">Tocá las letras...</span>`}
            ${!g.answered ? `<span class="kana-cursor">|</span>` : ''}
          </div>
          ${revealHTML}
          ${g.answered ? '' : `
            <div class="kana-keyboard">
              <div class="kb-keys-scroll">
                ${basicHTML}${dakutenHTML}${specialHTML}
              </div>
              <div class="kb-controls">
                <button class="kb-backspace-btn" id="kb-backspace">⌫</button>
                <button class="btn-submit" id="btn-verify" ${!input ? 'disabled' : ''}>✓ Verificar</button>
              </div>
            </div>
          `}
        </div>
      </div>`;
  }

  function _gameWordsRtJEvents() {
    document.querySelectorAll('.kb-key').forEach(btn => {
      btn.addEventListener('click', () => {
        Game.kbInput(btn.dataset.char);
        screen();
      });
    });
    document.getElementById('kb-backspace')?.addEventListener('click', () => {
      Game.kbBackspace(); screen();
    });
    document.getElementById('btn-verify')?.addEventListener('click', () => {
      if (!(State.game.currentInput || []).length) return;
      const result = Game.submitKana();
      result === 'correct' ? Sound.correct() : Sound.wrong();
      screen();
      setTimeout(() => {
        const done = Game.advance();
        if (done) State.setScreen('result');
        screen();
      }, result === 'correct' ? Game.NEXT_DELAY_CORRECT : Game.NEXT_DELAY_WRONG);
    });
  }

  // ── Completa la tabla ────────────────────────────────────────
  function _gameTableFillHTML() {
    const g        = State.game;
    const alphabet = g.alphabet;
    const lookup   = getLookup(alphabet);
    const reverse  = getReverse(alphabet);
    const answered = Object.keys(g.answers).length;
    const total    = g.chars.length;

    // Which table rows to display based on level
    const rowDefs = [];
    rowDefs.push(...TABLE_GOJUON_ROWS);
    if (g.level === 'dakuten' || g.level === 'all') rowDefs.push(...TABLE_DAKUTEN_ROWS);
    if (g.level === 'all') rowDefs.push(...TABLE_YOUON_ROWS);

    const cols = (g.level === 'all' && rowDefs.some(r => r.romajis.length === 3))
      ? null : null; // handled inline

    const activeChar = g.chars[g.activeIndex];

    // Build the table grid
    const cellsHTML = rowDefs.map(row => {
      const numCols = row.romajis.length;
      const colClass = numCols === 3 ? 'cols-4' : 'cols-6';
      const rowCells = row.romajis.map(r => {
        if (!r || !lookup[r]) return `<div class="kana-cell empty tf-cell"></div>`;
        const char = lookup[r];
        const item = g.chars.find(c => c.char === char);
        if (!item) return `<div class="kana-cell ${row.rowClass}"><span class="char">${char}</span></div>`;

        const typed     = g.answers[char] || '';
        const isActive  = g.activeIndex === g.chars.indexOf(item);
        let statusCls   = '';
        let statusHTML  = '';

        if (g.submitted) {
          const ok = _normCheck(typed, item);
          statusCls  = ok ? 'tf-correct' : 'tf-wrong';
          statusHTML = ok
            ? `<span class="tf-answer tf-ok">✓</span>`
            : `<span class="tf-answer tf-err">${typed||'—'}<br><small>${item.romaji}</small></span>`;
        } else {
          statusHTML = typed
            ? `<span class="tf-typed">${typed}</span>`
            : `<span class="tf-empty">___</span>`;
        }

        return `<div class="kana-cell ${row.rowClass} tf-cell ${isActive ? 'tf-active' : ''} ${statusCls}"
          data-char-idx="${g.chars.indexOf(item)}">
          <span class="char">${char}</span>
          ${statusHTML}
        </div>`;
      }).join('');
      return `<div class="kana-col-label">${row.label}</div>${rowCells}`;
    }).join('');

    const levelLabel = g.level === 'gojuon' ? 'Nivel 1' : g.level === 'dakuten' ? 'Nivel 2' : 'Nivel 3';

    const footerContent = !g.submitted
      ? `<button class="btn btn-primary tf-verify-btn" id="tf-verify">✓ Verificar (${answered}/${total})</button>`
      : `<div class="tf-result-bar">
           <span class="score-correct">✓ ${g.results.correct}</span>
           <span class="score-wrong">✗ ${g.results.wrong}</span>
           <span style="color:var(--primary);font-weight:700">${Math.round(g.results.correct/g.results.total*100)}%</span>
         </div>
         <div style="display:flex;gap:0.5rem">
           <button class="btn btn-secondary" id="tf-retry" style="flex:1">↺ Repetir</button>
           <button class="btn btn-primary" id="btn-home-tf" style="flex:1">⌂ Inicio</button>
         </div>`;

    const inputZoneHTML = !g.submitted ? `
      <div class="tf-input-zone">
        <div class="tf-active-char">${activeChar.char}</div>
        <input id="tf-input" class="type-input" type="text"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          placeholder="romaji..."
          value="${g.answers[activeChar.char] || ''}">
        <button class="corner-btn" id="tf-next" style="width:2.75rem;height:2.75rem;flex-shrink:0">→</button>
      </div>` : '';

    /*
     * Layout strategy: .screen.tf-page is the SINGLE scroll container
     * (overflow-y: auto). Sticky elements inside it stick relative to
     * that container, so no nested-scroll conflicts exist.
     *
     * ┌─ .tf-sticky-top  (sticky top:0) ──────────────┐
     * │  game-header + tf-input-zone                   │
     * └────────────────────────────────────────────────┘
     * │  .tf-table-body  (natural flow, scrolls)       │
     * ┌─ .tf-footer      (sticky bottom:0) ────────────┐
     * │  verify button or results                       │
     * └────────────────────────────────────────────────┘
     */
    /*
     * Fixed top + fixed bottom. Works because .tf-page has animation:none —
     * the default fadeIn uses transform:translateY which would create a new
     * containing block and break position:fixed. With no animation/transform
     * on any ancestor, fixed children correctly stick to the viewport.
     */
    return `
      <div class="screen screen-game tf-page">

        <div class="tf-fixed-top">
          <header class="game-header">
            <button class="btn-back" id="btn-exit">✕ Salir</button>
            <div class="progress-wrap">
              <span class="progress-text">${answered} / ${total} completadas</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${Math.round(answered/total*100)}%"></div>
              </div>
            </div>
            <div class="game-score" style="font-size:0.75rem">${levelLabel}</div>
          </header>
          ${inputZoneHTML}
        </div>

        <div class="tf-table-body">
          <div class="kana-grid cols-6">${cellsHTML}</div>
        </div>

        <div class="tf-fixed-bottom">${footerContent}</div>

      </div>`;
  }

  /** Normalised romaji check for table-fill (reuses game logic). */
  function _normCheck(typed, item) {
    const n = typed.trim().toLowerCase();
    if (n === item.romaji) return true;
    if (item.alt) return item.alt.some(a => a === n);
    return false;
  }

  function _gameTableFillEvents() {
    const g = State.game;

    /** Re-render → re-focus input. User scrolls the table manually. */
    function advanceUI() {
      screen();
      setTimeout(() => {
        const ni = document.getElementById('tf-input');
        if (ni) { ni.focus(); ni.select(); }
      }, 60);
    }

    // Helper: check if all cells answered and auto-verify
    function checkAutoVerify() {
      const g2 = State.game;
      const allDone = g2.chars.every(c => g2.answers[c.char]?.trim());
      if (allDone) {
        setTimeout(() => {
          if (!State.game.submitted) {
            const res = Game.tfSubmit();
            res.correct === res.total ? Sound.correct() : Sound.wrong();
            screen();
          }
        }, 400);
        return true;
      }
      return false;
    }

    // Cell tap → make active + scroll + focus
    document.querySelectorAll('.tf-cell[data-char-idx]').forEach(cell => {
      cell.addEventListener('click', () => {
        const idx = parseInt(cell.dataset.charIdx, 10);
        Game.tfSetActive(idx);
        advanceUI(); // re-render + scroll to cell + focus input
      });
    });

    // Input change → save answer
    const inp = document.getElementById('tf-input');
    if (inp) {
      inp.addEventListener('input', () => Game.tfSetAnswer(inp.value));

      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          Game.tfSetAnswer(inp.value);
          Game.tfAdvance();
          if (!checkAutoVerify()) advanceUI();
        }
      });

      // Auto-focus on load (opens keyboard on mobile)
      setTimeout(() => { inp.focus(); }, 80);
    }

    // Next button
    document.getElementById('tf-next')?.addEventListener('click', () => {
      if (inp) Game.tfSetAnswer(inp.value);
      Game.tfAdvance();
      if (!checkAutoVerify()) advanceUI();
    });

    // Manual verify
    document.getElementById('tf-verify')?.addEventListener('click', () => {
      if (inp) Game.tfSetAnswer(inp.value);
      const res = Game.tfSubmit();
      res.correct === res.total ? Sound.correct() : Sound.wrong();
      screen();
    });

    // Retry / Home
    document.getElementById('tf-retry')?.addEventListener('click', () => {
      Game.start(); screen();
    });
    document.getElementById('btn-home-tf')?.addEventListener('click', () => {
      State.setScreen('home'); screen();
    });
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
