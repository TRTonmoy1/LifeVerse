// Tiny synthesized UI sounds for the bedroom (no audio files needed).
// Browsers block audio until the visitor has interacted, so every call is silent until then.
const KEY = 'lifeverse-room-sound';
let ctx: AudioContext | null = null;
let lastHover = 0;

export function isRoomSoundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}
export function setRoomSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable */
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function note(c: AudioContext, freq: number, at: number, dur: number, peak: number) {
  for (const [mult, level] of [
    [1, 1],
    [2, 0.25],
  ] as const) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak * level, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }
}

// One pentatonic note per object, so moving across the room sounds like a soft wind chime.
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

export function playHoverSound(index: number) {
  if (!isRoomSoundOn()) return;
  const now = performance.now();
  if (now - lastHover < 90) return;
  lastHover = now;
  const c = getCtx();
  if (c) note(c, SCALE[index % SCALE.length], c.currentTime, 0.35, 0.04);
}

export function playSelectSound(index: number) {
  if (!isRoomSoundOn()) return;
  const c = getCtx();
  if (!c) return;
  const base = SCALE[index % SCALE.length] / 2;
  [1, 1.25, 1.5, 2].forEach((m, i) => note(c, base * m, c.currentTime + i * 0.07, 0.4, 0.05));
}

export function playToggleSound() {
  if (!isRoomSoundOn()) return;
  const c = getCtx();
  if (c) note(c, 880, c.currentTime, 0.12, 0.03);
}
