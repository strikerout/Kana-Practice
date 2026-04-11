/* ═══════════════════════════════════════════════════════════════
   state.js — Application state manager.
   Responsibilities:
     • Hold all runtime state (screen, config, game)
     • Persist config to localStorage; game state is ephemeral
     • Expose clean getters and setters; never expose raw internals
   ═══════════════════════════════════════════════════════════════ */

const State = (() => {
  const STORAGE_KEY = 'kana_practice_v1';

  // ─── Default configuration (persisted) ──────────────────────
  const DEFAULT_CONFIG = {
    alphabet: 'hiragana',           // 'hiragana' | 'katakana'
    sets: {
      gojuon:   true,               // always start with gojūon enabled
      dakuten:  false,              // dakuten + handakuten together
      youon:    false,              // yōon compounds
      longVowel: false,             // words with long vowels (ー / おう / えい…)
    },
    mode: 'multiple',               // 'multiple' | 'type' | 'match' | 'words' | 'random' | 'table-fill'
    fonts: 'base',                  // 'base' | 'random'
    rounds: 20,                     // questions per session: 10 | 20 | 30 | null (all)
    theme: 'light',                 // 'light' | 'dark'
    sound: true,                    // sound effects on/off
    wordDirection: 'jp-to-romaji',  // 'jp-to-romaji' | 'romaji-to-jp'
    tableFillLevel: 'gojuon',       // 'gojuon' | 'dakuten' | 'all'
  };

  // ─── Internal state ──────────────────────────────────────────
  let _screen = 'home';             // current screen name
  let _config  = structuredClone(DEFAULT_CONFIG);
  let _game    = null;              // set by Game.start(); never persisted
  // Active table tab — stored here so switching screens preserves it
  let _tableTab = 'gojuon';        // 'gojuon' | 'dakuten' | 'youon'

  // ─── localStorage helpers ────────────────────────────────────
  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      _config = {
        ...DEFAULT_CONFIG,
        ...saved,
        sets: { ...DEFAULT_CONFIG.sets, ...(saved.sets || {}) },
      };
    } catch (_) { /* ignore parse errors */ }
  }

  function _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_config));
    } catch (_) { /* ignore storage errors (private mode, quota) */ }
  }

  // ─── Public API ──────────────────────────────────────────────
  return {
    /** Must be called once on app startup. */
    init() { _load(); },

    // Screens
    get screen()   { return _screen; },
    setScreen(s)   { _screen = s; },

    // Config (persisted)
    get config()   { return structuredClone(_config); },

    setAlphabet(a) {
      _config.alphabet = a;
      _save();
    },
    setMode(m) {
      _config.mode = m;
      _save();
    },
    setFonts(f) {
      _config.fonts = f;
      _save();
    },
    setRounds(r) {
      _config.rounds = r; // null = all
      _save();
    },
    setTheme(t) {
      _config.theme = t;
      _save();
    },
    setSound(v) {
      _config.sound = v;
      _save();
    },
    toggleSet(key) {
      // longVowel is a word-filter option, not a character set —
      // it's excluded from the minimum-one-set guard.
      const CHAR_SETS = ['gojuon', 'dakuten', 'youon'];
      if (CHAR_SETS.includes(key)) {
        const active = CHAR_SETS.filter(k => _config.sets[k]).length;
        if (_config.sets[key] && active === 1) return false; // prevent removing last char set
      }
      _config.sets[key] = !_config.sets[key];
      _save();
      return true;
    },
    setWordDirection(d) {
      _config.wordDirection = d;
      _save();
    },
    setTableFillLevel(l) {
      _config.tableFillLevel = l;
      _save();
    },

    // Table tab (session-only)
    get tableTab()   { return _tableTab; },
    setTableTab(t)   { _tableTab = t; },

    // Game state (ephemeral — never saved to localStorage)
    get game()       { return _game; },
    setGame(g)       { _game = g; },
    updateGame(diff) { _game = { ..._game, ...diff }; },
  };
})();
