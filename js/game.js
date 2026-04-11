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
    return str.trim().toLowerCase().replace(/\s+/g, '');
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

  /**
   * Pick a sub-mode for one question in a 'random' session.
   * Word items always use 'words'; char items alternate between multiple/type.
   */
  function _pickSubMode(itemType) {
    if (itemType === 'word') return 'words';
    return Math.random() < 0.5 ? 'multiple' : 'type';
  }

  /**
   * Build two independently-shuffled card columns for match mode.
   * Left  = character cards (one random font each).
   * Right = romaji cards (always base font).
   * Both shuffled in different orders so pairs never align visually.
   */
  function _buildMatchColumns(group) {
    const leftCards = shuffle(group.map((item, i) => ({
      type: 'char', value: item.char, pairIndex: i, font: _font(),
    })));
    const rightCards = shuffle(group.map((item, i) => ({
      type: 'romaji', value: item.romaji, pairIndex: i,
    })));
    return { leftCards, rightCards };
  }

  /** Limit a queue to the configured number of rounds. */
  function _applyRounds(arr) {
    const r = State.config.rounds;
    return (r && arr.length > r) ? arr.slice(0, r) : arr;
  }

  // ─── Public API ──────────────────────────────────────────────
  return {

    start() {
      const cfg  = State.config;
      const mode = cfg.mode;

      // ── Words ───────────────────────────────────────────────
      if (mode === 'words') {
        const queue = _applyRounds(shuffle(getWords(cfg.alphabet)));
        State.setGame({
          mode, queue, currentIndex: 0,
          correct: 0, wrong: 0,
          answered: false, feedback: null,
          font: _font(), lastTyped: '',
        });
        return;
      }

      // ── Match ───────────────────────────────────────────────
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

      // ── Random — mixed queue of chars + words ───────────────
      if (mode === 'random') {
        const pool    = getData(cfg.alphabet, cfg.sets);
        const chars   = pool.map(c => ({ ...c, itemType: 'char' }));
        const words   = getWords(cfg.alphabet).map(w => ({ ...w, itemType: 'word' }));
        const queue   = _applyRounds(shuffle([...chars, ...words]));
        const subMode = _pickSubMode(queue[0].itemType);
        const choices = subMode === 'multiple'
          ? Game._buildChoices(queue[0], pool) : null;
        State.setGame({
          mode, subMode, pool, queue, currentIndex: 0,
          correct: 0, wrong: 0,
          answered: false, feedback: null,
          font: _font(), choices,
          lastTyped: '', lastWrong: null,
        });
        return;
      }

      // ── Type / Multiple ──────────────────────────────────────
      const pool  = getData(cfg.alphabet, cfg.sets);
      const queue = _applyRounds(shuffle(pool));
      const choices = mode === 'multiple'
        ? Game._buildChoices(queue[0], pool)
        : null;

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

    // ── Submit: type / words ─────────────────────────────────
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

    // ── Submit: multiple choice ──────────────────────────────
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

    // ── Advance (type / multiple / random / words) ───────────
    /** Returns true when the session is over. */
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
        font: newFont, lastTyped: '',
      });
      return false;
    },

    // ── Match: card selection ────────────────────────────────
    /**
     * @param {number} index - index within leftCards or rightCards
     * @param {'left'|'right'} side
     * @returns {{ type: string, wrongLeft?: number, wrongRight?: number }}
     */
    selectCard(index, side) {
      const g = State.game;

      const card = side === 'left' ? g.leftCards[index] : g.rightCards[index];

      // Ignore already-matched cards
      if (g.matchedPairs.includes(card.pairIndex)) return { type: 'noop' };

      // Toggle deselect on same card
      const selKey = side === 'left' ? 'selectedLeft' : 'selectedRight';
      if (g[selKey] === index) {
        State.updateGame({ [selKey]: null });
        return { type: 'deselect' };
      }

      // Set new selection
      State.updateGame({ [selKey]: index });

      // Determine if both sides now have a selection
      const leftIdx  = side === 'left'  ? index : g.selectedLeft;
      const rightIdx = side === 'right' ? index : g.selectedRight;

      if (leftIdx === null || leftIdx === undefined ||
          rightIdx === null || rightIdx === undefined) {
        return { type: 'select' };
      }

      // Both selected — check pair match
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

        // Advance to next group
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

    // ── Score helpers ────────────────────────────────────────
    totalQuestions() {
      const g = State.game;
      if (!g) return 0;
      return g.mode === 'match' ? g.totalPairs : g.queue.length;
    },

    answered() {
      const g = State.game;
      if (!g) return 0;
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
