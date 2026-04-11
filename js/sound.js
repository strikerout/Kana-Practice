/* ═══════════════════════════════════════════════════════════════
   sound.js — Procedural audio feedback via Web Audio API.
   No external files. Sounds are generated on the fly.
   AudioContext is created lazily on first call (browser policy).
   ═══════════════════════════════════════════════════════════════ */

const Sound = (() => {
  let _ctx     = null;
  let _enabled = true;   // toggled by the speaker button

  function _getCtx() {
    if (!_ctx) {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (mobile browsers may auto-suspend)
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  /**
   * Play a single tone.
   * @param {number} freq       Frequency in Hz
   * @param {number} start      AudioContext time to start
   * @param {number} duration   Duration in seconds
   * @param {number} peak       Peak gain (volume 0–1)
   * @param {OscillatorType} type  'sine' | 'triangle' | 'square' | 'sawtooth'
   */
  function _tone(freq, start, duration, peak = 0.28, type = 'sine') {
    const ctx  = _getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    // Short attack → exponential decay (percussive envelope)
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  return {
    /** Called once on init with the saved preference. */
    setEnabled(v) { _enabled = v; },
    isEnabled()   { return _enabled; },

    /** Two ascending chime notes — E5 (659 Hz) → A5 (880 Hz). */
    correct() {
      if (!_enabled) return;
      const ctx = _getCtx();
      const now = ctx.currentTime;
      _tone(659, now,        0.18, 0.25);
      _tone(880, now + 0.13, 0.30, 0.22);
    },

    /** Short descending thud — low triangle wave. */
    wrong() {
      if (!_enabled) return;
      const ctx = _getCtx();
      const now = ctx.currentTime;
      _tone(280, now,        0.15, 0.22, 'triangle');
      _tone(180, now + 0.10, 0.25, 0.15, 'triangle');
    },
  };
})();
