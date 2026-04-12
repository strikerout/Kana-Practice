/* ═══════════════════════════════════════════════════════════════
   game.js — Pure game logic. No DOM access.
   ═══════════════════════════════════════════════════════════════ */

const Game = (() => {

  const MATCH_GROUP_SIZE_DESKTOP = 6;
  const MATCH_GROUP_SIZE_MOBILE  = 4;
  const NEXT_DELAY_CORRECT = 700;
  const NEXT_DELAY_WRONG   = 1600;

  // ─── Internal helpers ────────────────────────────────────────

  function _font() {
    return State.config.fonts === 'random' ? randomFont() : FONTS[0];
  }

  function _norm(str) {
    // NFC: normaliza ō (precompuesto) y o + combining macron a la misma forma
    return str.trim().toLowerCase().normalize('NFC').replace(/\s+/g, '');
  }

  function _checkRomaji(typed, item) {
    const n = _norm(typed);
    if (n === _norm(item.romaji)) return true;
    if (item.alt) return item.alt.some(a => _norm(a) === n);
    return false;
  }

  function _chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  function _wrongChoices(pool, correct, count) {
    const others = pool.filter(c => c.romaji !== correct.romaji);
    return shuffle(others).slice(0, count);
  }

  function _pickSubMode(itemType) {
    if (itemType === 'word') return 'words';
    return Math.random() < 0.5 ? 'multiple' : 'type';
  }

  function _buildMatchColumns(group) {
    const leftCards = shuffle(group.map((item, i) => ({
      type: 'char', value: item.char, pairIndex: i, font: _font(),
    })));
    const rightCards = shuffle(group.map((item, i) => ({
      type: 'romaji', value: item.romaji, pairIndex: i,
    })));
    return { leftCards, rightCards };
  }

  function _applyRounds(arr) {
    const r = State.config.rounds;
    return (r && arr.length > r) ? arr.slice(0, r) : arr;
  }

  /**
   * Build a word queue guaranteeing representation of each enabled
   * extra feature (dakuten, youon, longVowel).
   * ~25% of the session slots are reserved per enabled extra feature,
   * then filled randomly from the full pool.
   */
  function _buildGuaranteedWordQueue(alphabet, sets, rounds) {
    const all = getFilteredWords(alphabet, sets);
    if (all.length === 0) return [];
    const total   = rounds ? Math.min(rounds, all.length) : all.length;
    const QUOTA   = Math.max(2, Math.floor(total * 0.25));
    const selected = new Set();

    // Reserve guaranteed slots for each enabled extra feature
    [
      { key: 'dakuten',   on: sets.dakuten },
      { key: 'youon',     on: sets.youon },
      { key: 'longVowel', on: sets.longVowel },
    ].forEach(({ key, on }) => {
      if (!on) return;
      const pool = all.filter(w => detectWordFeatures(w.word, alphabet)[key]);
      shuffle(pool).slice(0, QUOTA).forEach(w => selected.add(w));
    });

    // Fill remaining slots randomly
    for (const w of shuffle(all)) {
      if (selected.size >= total) break;
      selected.add(w);
    }
    return shuffle([...selected]).slice(0, total);
  }

  /** Build the character array for the table-fill mode from a level. */
  function _tableFillChars(alphabet, level) {
    const H = alphabet === 'hiragana';
    const base = H ? HIRAGANA_GOJUON    : KATAKANA_GOJUON;
    const daku = H ? [...HIRAGANA_DAKUTEN, ...HIRAGANA_HANDAKUTEN]
                   : [...KATAKANA_DAKUTEN, ...KATAKANA_HANDAKUTEN];
    const yoon = H ? HIRAGANA_YOUON     : KATAKANA_YOUON;

    if (level === 'gojuon')  return [...base];
    if (level === 'dakuten') return [...base, ...daku];
    return [...base, ...daku, ...yoon]; // 'all'
  }

  // ─── Public API ──────────────────────────────────────────────
  return {

    start() {
      const cfg  = State.config;
      const mode = cfg.mode;

      // ── Table fill ───────────────────────────────────────────
      if (mode === 'table-fill') {
        const chars = _tableFillChars(cfg.alphabet, cfg.tableFillLevel);
        State.setGame({
          mode,
          level:       cfg.tableFillLevel,
          alphabet:    cfg.alphabet,
          chars,
          answers:     {}, // char.char → typed string
          activeIndex: 0,
          submitted:   false,
          results:     null,
        });
        return;
      }

      // ── Words ────────────────────────────────────────────────
      if (mode === 'words') {
        const queue = _buildGuaranteedWordQueue(cfg.alphabet, cfg.sets, cfg.rounds);
        if (queue.length === 0) {
          State.setGame({ mode, emptyPool: true });
          return;
        }
        State.setGame({
          mode,
          wordDirection: cfg.wordDirection,
          queue, currentIndex: 0,
          correct: 0, wrong: 0,
          answered: false, feedback: null,
          font: _font(), lastTyped: '',
          currentInput: [],
        });
        return;
      }

      // ── Match ────────────────────────────────────────────────
      if (mode === 'match') {
        const groupSize = window.innerWidth >= 540
          ? MATCH_GROUP_SIZE_DESKTOP
          : MATCH_GROUP_SIZE_MOBILE;
        const allChars  = _applyRounds(shuffle(getData(cfg.alphabet, cfg.sets)));
        const groups    = _chunk(allChars, groupSize);
        const { leftCards, rightCards } = _buildMatchColumns(groups[0]);
        State.setGame({
          mode, groups, groupIndex: 0,
          leftCards, rightCards,
          selectedLeft: null, selectedRight: null,
          matchedPairs: [],
          correct: 0, wrong: 0,
          totalPairs: allChars.length,
        });
        return;
      }

      // ── Random ───────────────────────────────────────────────
      if (mode === 'random') {
        const pool      = getData(cfg.alphabet, cfg.sets);
        const wordPool  = _buildGuaranteedWordQueue(cfg.alphabet, cfg.sets, null);
        const chars     = shuffle(pool).map(c => ({ ...c, itemType: 'char' }));
        const wordItems = wordPool.map(w => ({ ...w, itemType: 'word' }));
        const queue     = _applyRounds(shuffle([...chars, ...wordItems]));
        const subMode = _pickSubMode(queue[0]?.itemType);
        const choices = subMode === 'multiple'
          ? Game._buildChoices(queue[0], pool) : null;
        State.setGame({
          mode, subMode, pool, queue, currentIndex: 0,
          wordDirection: cfg.wordDirection,
          correct: 0, wrong: 0,
          answered: false, feedback: null,
          font: _font(), choices,
          lastTyped: '', lastWrong: null,
          currentInput: [],
        });
        return;
      }

      // ── Type / Multiple ──────────────────────────────────────
      const pool  = getData(cfg.alphabet, cfg.sets);
      const queue = _applyRounds(shuffle(pool));
      const choices = mode === 'multiple'
        ? Game._buildChoices(queue[0], pool) : null;
      State.setGame({
        mode, subMode: null, pool, queue, currentIndex: 0,
        correct: 0, wrong: 0,
        answered: false, feedback: null,
        font: _font(), choices,
        lastTyped: '', lastWrong: null,
      });
    },

    _buildChoices(item, pool) {
      const count  = Math.min(3, pool.length - 1);
      const wrongs = _wrongChoices(pool, item, count);
      return shuffle([item, ...wrongs]);
    },

    // ── Submit: type / words ────────────────────────────────
    submitType(typed) {
      const g  = State.game;
      const ok = _checkRomaji(typed, g.queue[g.currentIndex]);
      State.updateGame({
        answered: true, feedback: ok ? 'correct' : 'wrong',
        correct: g.correct + (ok ? 1 : 0),
        wrong:   g.wrong   + (ok ? 0 : 1),
      });
      return ok ? 'correct' : 'wrong';
    },

    // ── Submit: multiple choice ─────────────────────────────
    submitChoice(choiceRomaji) {
      const g  = State.game;
      const ok = _norm(choiceRomaji) === _norm(g.queue[g.currentIndex].romaji);
      State.updateGame({
        answered: true, feedback: ok ? 'correct' : 'wrong',
        correct: g.correct + (ok ? 1 : 0),
        wrong:   g.wrong   + (ok ? 0 : 1),
      });
      return ok ? 'correct' : 'wrong';
    },

    // ── On-screen keyboard input (Romaji→JP) ────────────────
    kbInput(char) {
      const g = State.game;
      if (g.answered) return;
      State.updateGame({ currentInput: [...(g.currentInput || []), char] });
    },
    kbBackspace() {
      const g = State.game;
      if (g.answered) return;
      const arr = [...(g.currentInput || [])];
      arr.pop();
      State.updateGame({ currentInput: arr });
    },
    submitKana() {
      const g      = State.game;
      const typed  = (g.currentInput || []).join('');
      const target = g.queue[g.currentIndex].word;
      const ok     = typed === target;
      State.updateGame({
        answered: true, feedback: ok ? 'correct' : 'wrong',
        correct: g.correct + (ok ? 1 : 0),
        wrong:   g.wrong   + (ok ? 0 : 1),
      });
      return ok ? 'correct' : 'wrong';
    },

    // ── Advance (type / multiple / random / words) ──────────
    advance() {
      const g    = State.game;
      const next = g.currentIndex + 1;
      if (next >= g.queue.length) return true;

      const newFont = _font();

      if (g.mode === 'random') {
        const nextItem = g.queue[next];
        const subMode  = _pickSubMode(nextItem.itemType);
        const choices  = subMode === 'multiple'
          ? Game._buildChoices(nextItem, g.pool) : null;
        State.updateGame({
          currentIndex: next, answered: false, feedback: null,
          font: newFont, subMode, choices, lastTyped: '', lastWrong: null,
          currentInput: [],
        });
        return false;
      }

      if (g.mode === 'multiple') {
        State.updateGame({
          currentIndex: next, answered: false, feedback: null,
          font: newFont,
          choices: Game._buildChoices(g.queue[next], g.pool),
          lastWrong: null,
        });
        return false;
      }

      State.updateGame({
        currentIndex: next, answered: false, feedback: null,
        font: newFont, lastTyped: '', currentInput: [],
      });
      return false;
    },

    // ── Match: card selection ───────────────────────────────
    selectCard(index, side) {
      const g    = State.game;
      const card = side === 'left' ? g.leftCards[index] : g.rightCards[index];

      if (g.matchedPairs.includes(card.pairIndex)) return { type: 'noop' };

      const selKey = side === 'left' ? 'selectedLeft' : 'selectedRight';
      if (g[selKey] === index) {
        State.updateGame({ [selKey]: null });
        return { type: 'deselect' };
      }

      State.updateGame({ [selKey]: index });

      const leftIdx  = side === 'left'  ? index : g.selectedLeft;
      const rightIdx = side === 'right' ? index : g.selectedRight;

      if (leftIdx === null || leftIdx === undefined ||
          rightIdx === null || rightIdx === undefined) {
        return { type: 'select' };
      }

      const leftCard  = g.leftCards[leftIdx];
      const rightCard = g.rightCards[rightIdx];
      const isMatch   = leftCard.pairIndex === rightCard.pairIndex;

      if (isMatch) {
        const newMatched = [...g.matchedPairs, leftCard.pairIndex];
        const groupDone  = newMatched.length === g.groups[g.groupIndex].length;

        State.updateGame({
          selectedLeft: null, selectedRight: null,
          matchedPairs: newMatched,
          correct: g.correct + 1,
        });

        if (!groupDone) return { type: 'matched' };

        const nextGroupIdx = g.groupIndex + 1;
        if (nextGroupIdx >= g.groups.length) return { type: 'done' };

        const { leftCards, rightCards } = _buildMatchColumns(g.groups[nextGroupIdx]);
        State.updateGame({
          groupIndex: nextGroupIdx,
          leftCards, rightCards,
          matchedPairs: [], selectedLeft: null, selectedRight: null,
        });
        return { type: 'group-done' };

      } else {
        State.updateGame({
          selectedLeft: null, selectedRight: null,
          wrong: g.wrong + 1,
        });
        return { type: 'wrong', wrongLeft: leftIdx, wrongRight: rightIdx };
      }
    },

    // ── Table fill: set active cell ─────────────────────────
    tfSetActive(index) {
      State.updateGame({ activeIndex: index });
    },

    /** Set the typed answer for the current active cell. */
    tfSetAnswer(text) {
      const g = State.game;
      const char = g.chars[g.activeIndex].char;
      State.updateGame({ answers: { ...g.answers, [char]: text } });
    },

    /** Advance to next unanswered cell, or stay if all answered. */
    tfAdvance() {
      const g = State.game;
      // Find next unanswered starting from current+1
      for (let i = 1; i <= g.chars.length; i++) {
        const idx = (g.activeIndex + i) % g.chars.length;
        if (!g.answers[g.chars[idx].char]) {
          State.updateGame({ activeIndex: idx });
          return;
        }
      }
      // All answered — stay on current
    },

    /** Submit all answers, compute results. Returns { correct, wrong, total }. */
    tfSubmit() {
      const g = State.game;
      let correct = 0, wrong = 0;
      g.chars.forEach(item => {
        const typed = g.answers[item.char] || '';
        if (_checkRomaji(typed, item)) correct++;
        else wrong++;
      });
      const results = { correct, wrong, total: g.chars.length };
      State.updateGame({ submitted: true, results });
      return results;
    },

    // ── Score helpers ───────────────────────────────────────
    totalQuestions() {
      const g = State.game;
      if (!g) return 0;
      if (g.mode === 'match')      return g.totalPairs;
      if (g.mode === 'table-fill') return g.chars.length;
      return g.queue.length;
    },

    answered() {
      const g = State.game;
      if (!g) return 0;
      if (g.mode === 'table-fill') return Object.keys(g.answers).length;
      return g.correct + g.wrong;
    },

    summary() {
      const g       = State.game;
      const total   = g.correct + g.wrong;
      const percent = total === 0 ? 0 : Math.round((g.correct / total) * 100);
      let emoji, message;
      if      (percent === 100) { emoji = '🏆'; message = '¡Perfecto!'; }
      else if (percent >= 80)   { emoji = '⭐'; message = '¡Muy bien!'; }
      else if (percent >= 50)   { emoji = '👍'; message = '¡Buen trabajo!'; }
      else                      { emoji = '📚'; message = 'Sigue practicando'; }
      return { correct: g.correct, wrong: g.wrong, percent, emoji, message };
    },

    NEXT_DELAY_CORRECT,
    NEXT_DELAY_WRONG,
  };
})();
