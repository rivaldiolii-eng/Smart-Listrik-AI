// Utility for electric/tech futuristic Web Audio API Sound Effects
export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
}

const SOUND_STORAGE_KEY = 'smart_listrik_sound_settings_v2';

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.7,
};

export function loadSoundSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(SOUND_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_SOUND_SETTINGS.enabled,
        volume: typeof parsed.volume === 'number' ? Math.max(0, Math.min(1, parsed.volume)) : DEFAULT_SOUND_SETTINGS.volume,
      };
    }
  } catch (e) {
    console.warn('Failed to load sound settings:', e);
  }
  return DEFAULT_SOUND_SETTINGS;
}

export function saveSoundSettings(settings: SoundSettings): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save sound settings:', e);
  }
}

// Global AudioContext singleton
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Helper to play synthesized tone
function playToneSequence(tones: Array<{ freq: number; duration: number; type?: OscillatorType; delay?: number }>) {
  const settings = loadSoundSettings();
  if (!settings.enabled || settings.volume <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(settings.volume * 0.2, ctx.currentTime); // keep sounds pleasant & non-jarring
  masterGain.connect(ctx.destination);

  tones.forEach(({ freq, duration, type = 'sine', delay = 0 }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.02);
  });
}

// Specific Sound Effects:

/** Click button sound: short crisp futuristic tick */
export function playClickSound() {
  playToneSequence([
    { freq: 800, duration: 0.04, type: 'sine' },
    { freq: 1200, duration: 0.03, type: 'triangle', delay: 0.01 },
  ]);
}

/** Open menu or modal sound: smooth rising dual tone */
export function playMenuOpenSound() {
  playToneSequence([
    { freq: 523.25, duration: 0.08, type: 'sine' },
    { freq: 659.25, duration: 0.1, type: 'sine', delay: 0.04 },
    { freq: 783.99, duration: 0.12, type: 'triangle', delay: 0.08 },
  ]);
}

/** Close modal sound: soft falling tone */
export function playModalCloseSound() {
  playToneSequence([
    { freq: 659.25, duration: 0.06, type: 'sine' },
    { freq: 440.00, duration: 0.08, type: 'sine', delay: 0.04 },
  ]);
}

/** Save data sound: pleasant futuristic chord ping */
export function playSaveSound() {
  playToneSequence([
    { freq: 523.25, duration: 0.08, type: 'sine' }, // C5
    { freq: 659.25, duration: 0.08, type: 'sine', delay: 0.05 }, // E5
    { freq: 783.99, duration: 0.12, type: 'triangle', delay: 0.10 }, // G5
    { freq: 1046.50, duration: 0.18, type: 'sine', delay: 0.15 }, // C6
  ]);
}

/** Delete data sound: low clean tech pulse */
export function playDeleteSound() {
  playToneSequence([
    { freq: 330, duration: 0.06, type: 'triangle' },
    { freq: 220, duration: 0.1, type: 'sawtooth', delay: 0.04 },
  ]);
}

/** Tab/Page switch sound: subtle soft blip */
export function playTabSwitchSound() {
  playToneSequence([
    { freq: 600, duration: 0.04, type: 'sine' },
    { freq: 900, duration: 0.05, type: 'sine', delay: 0.02 },
  ]);
}

/** AI finished answering: spark shimmer chime */
export function playAiDoneSound() {
  playToneSequence([
    { freq: 880.00, duration: 0.08, type: 'sine' }, // A5
    { freq: 1108.73, duration: 0.08, type: 'sine', delay: 0.06 }, // C#6
    { freq: 1318.51, duration: 0.12, type: 'triangle', delay: 0.12 }, // E6
    { freq: 1760.00, duration: 0.20, type: 'sine', delay: 0.18 }, // A6
  ]);
}

/** Notification / Alert sound: gentle double warning chime */
export function playAlertSound() {
  playToneSequence([
    { freq: 587.33, duration: 0.08, type: 'triangle' },
    { freq: 587.33, duration: 0.1, type: 'triangle', delay: 0.1 },
  ]);
}
