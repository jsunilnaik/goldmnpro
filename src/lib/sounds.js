/**
 * GoldMine Pro Procedural Sound Engine
 * Synthesizes UI sound effects using the Web Audio API (No external assets required).
 */

let audioCtx = null;

/**
 * Initializes the AudioContext on user interaction to satisfy browser policies.
 */
const initAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * Synthesizes a sound effect based on the specified preset.
 * @param {('start'|'stop'|'claim'|'success'|'error')} type - The sound preset to play.
 */
export const playMiningSound = (type) => {
  if (typeof window === 'undefined') return;
  
  const ctx = initAudioContext();
  const now = ctx.currentTime;

  switch (type) {
    case 'start': // Ascending Frequency Sweep (Power up)
      createSweep(ctx, 200, 800, 0.2, 'sine');
      break;
    
    case 'stop': // Descending Frequency Sweep (Power down)
      createSweep(ctx, 600, 150, 0.2, 'sine');
      break;

    case 'claim': // Reward Arpeggio (Victory chime)
      playArpeggio(ctx, [523.25, 659.25, 783.99, 1046.50], 0.4);
      break;

    case 'success': // High-pitched soft ding (Notification)
      createTone(ctx, 880, 0.1, 0.3, 'sine');
      break;

    case 'error': // Double low-tone alert (Warning)
      createTone(ctx, 220, 0.1, 0.2, 'square', 0.1);
      setTimeout(() => createTone(ctx, 180, 0.1, 0.2, 'square', 0.1), 150);
      break;

    default:
      console.warn(`Unknown sound type: ${type}`);
  }
};

/**
 * Helper to create a frequency sweep.
 */
function createSweep(ctx, startFreq, endFreq, duration, type = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

/**
 * Helper to play a single tone with decay.
 */
function createTone(ctx, freq, duration, decay = 0.3, type = 'sine', volume = 0.2) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + decay);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + Math.max(duration, decay));
}

/**
 * Helper to play an arpeggio sequence.
 */
function playArpeggio(ctx, freqs, totalDuration) {
  const noteDuration = totalDuration / freqs.length;
  freqs.forEach((freq, i) => {
    setTimeout(() => {
      createTone(ctx, freq, noteDuration, noteDuration * 1.5, 'sine', 0.15);
    }, i * noteDuration * 800); // Scale timing
  });
}
