import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  CheckCircle2,
  Clock3,
  Headphones,
  Music4,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { id, type FocusSession, type LifeData } from '../life/lifeData';
import './focus.css';

type Props = { data: LifeData; setData: Dispatch<SetStateAction<LifeData>> };
type Phase = 'focus' | 'break';
type Sound = 'off' | 'rain' | 'fire' | 'night' | 'lofi';
type Timer = {
  phase: Phase;
  focusMin: number;
  breakMin: number;
  courseId: string;
  remainingMs: number;
  running: boolean;
  deadline: number | null;
  ready: boolean;
  startedAt: number | null;
};

type ManagedAudio = {
  ctx: AudioContext;
  master: GainNode;
  teardown: () => void;
};

const KEY = 'lifeverse-focus-timer-v1';

const initial = (): Timer => ({
  phase: 'focus',
  focusMin: 25,
  breakMin: 5,
  courseId: '',
  remainingMs: 25 * 60_000,
  running: false,
  deadline: null,
  ready: false,
  startedAt: null,
});

function clamp(value: unknown, min: number, max: number, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function loadTimer(): Timer {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<Timer> | null;
    if (!raw || !['focus', 'break'].includes(String(raw.phase))) return initial();
    const focusMin = clamp(raw.focusMin, 1, 180, 25);
    const breakMin = clamp(raw.breakMin, 1, 60, 5);
    // A reload never completes a session silently. Resume explicitly.
    return {
      phase: raw.phase!,
      focusMin,
      breakMin,
      courseId: typeof raw.courseId === 'string' ? raw.courseId : '',
      remainingMs: clamp(raw.remainingMs, 0, 180 * 60_000, focusMin * 60_000),
      running: false,
      deadline: null,
      ready: false,
      startedAt: null,
    };
  } catch {
    return initial();
  }
}

const pad = (n: number) => String(n).padStart(2, '0');
const timeLabel = (ms: number) => {
  const sec = Math.ceil(ms / 1000);
  return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
};

function localWeekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

function noteToHz(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function createNoiseBuffer(ctx: AudioContext, seconds: number, color: 'white' | 'pink' = 'white') {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  let lastBrown = 0;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;

  for (let i = 0; i < channel.length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (color === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
      channel[i] = pink;
    } else {
      lastBrown = (lastBrown + 0.02 * white) / 1.02;
      channel[i] = lastBrown;
    }
  }

  return buffer;
}

function fadeGain(param: AudioParam, ctx: AudioContext, value: number, seconds = 0.25) {
  param.cancelScheduledValues(ctx.currentTime);
  param.setValueAtTime(param.value, ctx.currentTime);
  param.linearRampToValueAtTime(value, ctx.currentTime + seconds);
}

function buildRain(ctx: AudioContext, output: AudioNode) {
  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(output);

  const broad = ctx.createBufferSource();
  broad.buffer = createNoiseBuffer(ctx, 4, 'pink');
  broad.loop = true;
  const broadFilter = ctx.createBiquadFilter();
  broadFilter.type = 'highpass';
  broadFilter.frequency.value = 700;
  const broadLow = ctx.createBiquadFilter();
  broadLow.type = 'lowpass';
  broadLow.frequency.value = 3600;
  const broadGain = ctx.createGain();
  broadGain.gain.value = 0.42;
  broad.connect(broadFilter);
  broadFilter.connect(broadLow);
  broadLow.connect(broadGain);
  broadGain.connect(master);
  broad.start();

  const soft = ctx.createBufferSource();
  soft.buffer = createNoiseBuffer(ctx, 5, 'white');
  soft.loop = true;
  const softFilter = ctx.createBiquadFilter();
  softFilter.type = 'bandpass';
  softFilter.frequency.value = 1900;
  softFilter.Q.value = 0.6;
  const softGain = ctx.createGain();
  softGain.gain.value = 0.08;
  soft.connect(softFilter);
  softFilter.connect(softGain);
  softGain.connect(master);
  soft.start();

  return () => {
    broad.stop();
    soft.stop();
    master.disconnect();
  };
}

function buildFire(ctx: AudioContext, output: AudioNode) {
  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(output);

  const crackle = ctx.createBufferSource();
  crackle.buffer = createNoiseBuffer(ctx, 3.5, 'white');
  crackle.loop = true;
  const crackleBand = ctx.createBiquadFilter();
  crackleBand.type = 'bandpass';
  crackleBand.frequency.value = 480;
  crackleBand.Q.value = 0.8;
  const crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.16;
  crackle.connect(crackleBand);
  crackleBand.connect(crackleGain);
  crackleGain.connect(master);
  crackle.start();

  const warmth = ctx.createBufferSource();
  warmth.buffer = createNoiseBuffer(ctx, 4, 'pink');
  warmth.loop = true;
  const warmthLow = ctx.createBiquadFilter();
  warmthLow.type = 'lowpass';
  warmthLow.frequency.value = 320;
  const warmthGain = ctx.createGain();
  warmthGain.gain.value = 0.12;
  warmth.connect(warmthLow);
  warmthLow.connect(warmthGain);
  warmthGain.connect(master);
  warmth.start();

  return () => {
    crackle.stop();
    warmth.stop();
    master.disconnect();
  };
}

function buildNight(ctx: AudioContext, output: AudioNode) {
  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(output);

  const wind = ctx.createBufferSource();
  wind.buffer = createNoiseBuffer(ctx, 4, 'pink');
  wind.loop = true;
  const windBand = ctx.createBiquadFilter();
  windBand.type = 'bandpass';
  windBand.frequency.value = 260;
  windBand.Q.value = 0.4;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.1;
  wind.connect(windBand);
  windBand.connect(windGain);
  windGain.connect(master);
  wind.start();

  const tone = ctx.createOscillator();
  const toneGain = ctx.createGain();
  tone.type = 'sine';
  tone.frequency.value = 208;
  toneGain.gain.value = 0.01;
  tone.connect(toneGain);
  toneGain.connect(master);
  tone.start();

  return () => {
    wind.stop();
    tone.stop();
    master.disconnect();
  };
}

function buildLofi(ctx: AudioContext, output: AudioNode) {
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 16;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.008;
  compressor.release.value = 0.22;

  const toneLowpass = ctx.createBiquadFilter();
  toneLowpass.type = 'lowpass';
  toneLowpass.frequency.value = 2400;
  toneLowpass.Q.value = 0.7;

  const master = ctx.createGain();
  master.gain.value = 0.75;
  compressor.connect(toneLowpass);
  toneLowpass.connect(master);
  master.connect(output);

  const hiss = ctx.createBufferSource();
  hiss.buffer = createNoiseBuffer(ctx, 4, 'white');
  hiss.loop = true;
  const hissHigh = ctx.createBiquadFilter();
  hissHigh.type = 'highpass';
  hissHigh.frequency.value = 2200;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.018;
  hiss.connect(hissHigh);
  hissHigh.connect(hissGain);
  hissGain.connect(compressor);
  hiss.start();

  const kick = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(122, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.18);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.48, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    osc.connect(gain);
    gain.connect(compressor);
    osc.start(time);
    osc.stop(time + 0.23);
  };

  const noiseBurst = (
    time: number,
    duration: number,
    frequency: number,
    q: number,
    gainValue: number,
  ) => {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, Math.max(0.25, duration), 'white');
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(compressor);
    src.start(time);
    src.stop(time + duration + 0.02);
  };

  const bass = (midi: number, time: number, duration: number) => {
    const osc = ctx.createOscillator();
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 220;
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(noteToHz(midi), time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.12, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(low);
    low.connect(gain);
    gain.connect(compressor);
    osc.start(time);
    osc.stop(time + duration + 0.03);
  };

  const chord = (notes: number[], time: number, duration: number) => {
    notes.forEach((note, index) => {
      const osc = ctx.createOscillator();
      const low = ctx.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.value = 1700;
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(noteToHz(note), time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.06 - index * 0.008, time + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(low);
      low.connect(gain);
      gain.connect(compressor);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    });
  };

  const pluck = (midi: number, time: number) => {
    const osc = ctx.createOscillator();
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 1500;
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteToHz(midi), time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.05, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.32);
    osc.connect(low);
    low.connect(gain);
    gain.connect(compressor);
    osc.start(time);
    osc.stop(time + 0.34);
  };

  const progression = [
    { root: 45, chord: [57, 60, 64] }, // Am
    { root: 41, chord: [53, 57, 60] }, // F
    { root: 38, chord: [50, 53, 57] }, // Dm
    { root: 43, chord: [55, 59, 62] }, // G
  ];
  const melodyOffsets = [7, 4, 2, 4];
  const tempo = 74;
  const beat = 60 / tempo;
  const stepLength = beat / 2;
  let nextStepTime = ctx.currentTime + 0.08;
  let step = 0;

  const scheduleStep = () => {
    while (nextStepTime < ctx.currentTime + 0.6) {
      const bar = Math.floor(step / 8) % progression.length;
      const slot = step % 8;
      const { root, chord: chordNotes } = progression[bar];

      if (slot === 0) {
        chord(chordNotes, nextStepTime, beat * 3.4);
        bass(root, nextStepTime, beat * 0.95);
        kick(nextStepTime);
      }
      if (slot === 2) {
        pluck(chordNotes[1] + melodyOffsets[bar], nextStepTime);
      }
      if (slot === 4) {
        kick(nextStepTime);
        noiseBurst(nextStepTime, 0.16, 1800, 1.1, 0.13);
        bass(root + 7, nextStepTime, beat * 0.78);
      }
      if (slot === 6) {
        pluck(chordNotes[2] + 12, nextStepTime);
      }
      if (slot % 2 === 1) {
        noiseBurst(nextStepTime, 0.05, 5200, 3.4, 0.04);
      }

      nextStepTime += stepLength;
      step += 1;
    }
  };

  scheduleStep();
  const intervalId = window.setInterval(scheduleStep, 120);

  return () => {
    window.clearInterval(intervalId);
    hiss.stop();
    master.disconnect();
  };
}

function getSoundVolume(sound: Sound, volume: number) {
  const base = volume / 100;
  switch (sound) {
    case 'rain':
      return base * 0.28;
    case 'fire':
      return base * 0.24;
    case 'night':
      return base * 0.23;
    case 'lofi':
      return base * 0.34;
    case 'off':
    default:
      return 0;
  }
}

function useAmbientSound() {
  const [sound, setSound] = useState<Sound>('off');
  const [volume, setVolume] = useState(35);
  const managedRef = useRef<ManagedAudio | null>(null);

  useEffect(() => {
    const current = managedRef.current;
    if (!current) return;
    fadeGain(current.master.gain, current.ctx, getSoundVolume(sound, volume), 0.28);
  }, [sound, volume]);

  useEffect(() => {
    const cleanupExisting = () => {
      const current = managedRef.current;
      if (!current) return;
      current.teardown();
      void current.ctx.close();
      managedRef.current = null;
    };

    if (sound === 'off') {
      cleanupExisting();
      return undefined;
    }

    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    let teardown: () => void = () => undefined;
    void ctx.resume();
    if (sound === 'rain') teardown = buildRain(ctx, master);
    if (sound === 'fire') teardown = buildFire(ctx, master);
    if (sound === 'night') teardown = buildNight(ctx, master);
    if (sound === 'lofi') teardown = buildLofi(ctx, master);

    managedRef.current = {
      ctx,
      master,
      teardown: () => {
        try {
          teardown();
        } catch {
          /* audio already stopped */
        }
      },
    };
    fadeGain(master.gain, ctx, getSoundVolume(sound, volume), 0.4);

    return () => {
      if (managedRef.current?.ctx !== ctx) return;
      teardown();
      void ctx.close();
      managedRef.current = null;
    };
  }, [sound]);

  return { sound, setSound, volume, setVolume };
}

export default function FocusHub({ data, setData }: Props) {
  const [timer, setTimer] = useState<Timer>(loadTimer);
  const [now, setNow] = useState(() => Date.now());
  const [custom, setCustom] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const { sound, setSound, volume, setVolume } = useAmbientSound();

  const remaining =
    timer.running && timer.deadline !== null
      ? Math.max(0, timer.deadline - now)
      : timer.remainingMs;
  const completed = timer.ready || (timer.running && remaining === 0);

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          ...timer,
          remainingMs:
            timer.running && timer.deadline
              ? Math.max(0, timer.deadline - Date.now())
              : timer.remainingMs,
          running: false,
          deadline: null,
          ready: false,
          startedAt: null,
        }),
      );
    } catch {
      /* local storage unavailable */
    }
  }, [timer, now]);

  useEffect(() => {
    if (!timer.running) return undefined;
    const tick = () => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 500);
    const visible = () => setNow(Date.now());
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [timer.running]);

  const choosePreset = (focusMin: number, breakMin: number) => {
    setTimer({
      ...initial(),
      focusMin,
      breakMin,
      courseId: timer.courseId,
      remainingMs: focusMin * 60_000,
    });
    setNotice('');
  };

  const pause = () => {
    setTimer((current) => ({
      ...current,
      remainingMs: Math.max(0, (current.deadline ?? Date.now()) - Date.now()),
      running: false,
      deadline: null,
      startedAt: null,
    }));
  };

  const start = () => {
    setNotice('');
    setNow(Date.now());
    setTimer((current) => ({
      ...current,
      running: true,
      deadline: Date.now() + current.remainingMs,
      startedAt: Date.now(),
      ready: false,
    }));
  };

  const reset = () => {
    setTimer((current) => ({
      ...current,
      running: false,
      ready: false,
      deadline: null,
      startedAt: null,
      remainingMs: (current.phase === 'focus' ? current.focusMin : current.breakMin) * 60_000,
    }));
    setNotice('Timer reset — no session recorded.');
  };

  const switchPhase = useCallback((phase: Phase) => {
    setTimer((current) => ({
      ...current,
      phase,
      running: false,
      ready: false,
      deadline: null,
      startedAt: null,
      remainingMs: (phase === 'focus' ? current.focusMin : current.breakMin) * 60_000,
    }));
  }, []);

  const finish = () => {
    if (!completed) return;
    if (timer.phase === 'break') {
      switchPhase('focus');
      setNotice('Break complete. Ready for another focus session?');
      return;
    }

    const courseId = data.study.subjects.some((course) => course.id === timer.courseId)
      ? timer.courseId
      : null;
    const xp = timer.focusMin >= 25 ? 15 : timer.focusMin >= 10 ? 10 : 0;
    const session: FocusSession = {
      id: id(),
      courseId,
      minutes: timer.focusMin,
      completedAt: new Date().toISOString(),
      xp,
    };

    setData((current) => ({
      ...current,
      focus: { sessions: [session, ...current.focus.sessions].slice(0, 3000) },
    }));
    switchPhase('break');
    setNotice(
      `Focus saved · ${timer.focusMin} minutes${xp ? ` · up to +${xp} XP (daily cap)` : ''}. Take a break.`,
    );
  };

  const sessions = data.focus.sessions;
  const week = useMemo(
    () => sessions.filter((session) => new Date(session.completedAt).getTime() >= localWeekStart()),
    [sessions],
  );
  const total = useMemo(() => week.reduce((sum, session) => sum + session.minutes, 0), [week]);

  return (
    <div className="lv-focus lv-hub-body">
      <header className="lv-focus-heading">
        <div>
          <div className="lv-focus-eyebrow">
            <Headphones size={15} /> FIND YOUR FLOW
          </div>
          <h2>A little time, fully yours.</h2>
          <p>Choose a session, settle in, and focus on one thing.</p>
        </div>
        <div className="lv-focus-week">
          <Clock3 size={20} />
          <strong>{total} min</strong>
          <span>focused this week</span>
        </div>
      </header>

      <div className="lv-focus-layout">
        <section className="lv-focus-timer-card" aria-label="Focus timer">
          <div className="lv-focus-presets">
            <button
              type="button"
              className={timer.focusMin === 25 && timer.breakMin === 5 ? 'selected' : ''}
              onClick={() => choosePreset(25, 5)}
            >
              25 / 5
            </button>
            <button
              type="button"
              className={timer.focusMin === 50 && timer.breakMin === 10 ? 'selected' : ''}
              onClick={() => choosePreset(50, 10)}
            >
              50 / 10
            </button>
            <button
              type="button"
              className={custom ? 'selected' : ''}
              onClick={() => setCustom((value) => !value)}
            >
              <Settings2 size={15} /> Custom
            </button>
          </div>

          {custom && (
            <div className="lv-focus-custom">
              <label>
                Focus (min)
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={timer.focusMin}
                  onChange={(event) => {
                    const value = clamp(Number(event.target.value), 1, 180, 25);
                    choosePreset(value, timer.breakMin);
                  }}
                />
              </label>
              <label>
                Break (min)
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={timer.breakMin}
                  onChange={(event) => {
                    const value = clamp(Number(event.target.value), 1, 60, 5);
                    choosePreset(timer.focusMin, value);
                  }}
                />
              </label>
            </div>
          )}

          <div className="lv-focus-phase">
            <span className={timer.phase === 'focus' ? 'active' : ''}>Focus</span>
            <span className={timer.phase === 'break' ? 'active' : ''}>Break</span>
          </div>

          <div
            className="lv-focus-clock"
            role="timer"
            aria-label={`${timer.phase} timer: ${timeLabel(remaining)} remaining`}
          >
            <strong>{timeLabel(remaining)}</strong>
            <span>
              {completed
                ? 'Time is up — confirm below'
                : timer.running
                  ? 'Stay with it'
                  : 'Start whenever you’re ready'}
            </span>
          </div>

          <div className="lv-focus-controls">
            {completed ? (
              <button className="lv-focus-main" type="button" onClick={finish}>
                <CheckCircle2 size={19} />{' '}
                {timer.phase === 'focus' ? 'Finish & save session' : 'Finish break'}
              </button>
            ) : timer.running ? (
              <button className="lv-focus-main" type="button" onClick={pause}>
                <Pause size={19} /> Pause
              </button>
            ) : (
              <button className="lv-focus-main" type="button" onClick={start}>
                <Play size={19} />{' '}
                {remaining < (timer.phase === 'focus' ? timer.focusMin : timer.breakMin) * 60_000
                  ? 'Resume'
                  : timer.phase === 'focus'
                    ? 'Start focus'
                    : 'Start break'}
              </button>
            )}
            <button type="button" onClick={reset} title="Reset timer" aria-label="Reset timer">
              <RotateCcw size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Skip this interval? No focus time will be saved.'))
                  switchPhase(timer.phase === 'focus' ? 'break' : 'focus');
              }}
              title="Skip interval"
              aria-label="Skip interval"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <label className="lv-focus-course">
            Studying for a course? <span>Optional</span>
            <select
              value={timer.courseId}
              onChange={(event) =>
                setTimer((current) => ({ ...current, courseId: event.target.value }))
              }
            >
              <option value="">No course · personal focus</option>
              {data.study.subjects.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code ? `${course.code} · ` : ''}
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          {notice && (
            <p className="lv-focus-notice" role="status">
              {notice}
            </p>
          )}
          <p className="lv-focus-helper">
            Sessions are saved only when you finish a full timer and confirm. Closing or refreshing
            pauses your timer without awarding XP.
          </p>
        </section>

        <aside className="lv-focus-sidebar">
          <section className="lv-focus-side-card">
            <div className="lv-focus-section-title">
              <Volume2 size={18} />
              <h3>Sounds &amp; music</h3>
            </div>
            <p>Choose natural ambience or a gentle lo-fi background while you work.</p>
            <div className="lv-focus-sounds">
              {(
                [
                  ['off', 'Silence'],
                  ['rain', 'Rain'],
                  ['fire', 'Fireplace'],
                  ['night', 'Night'],
                  ['lofi', 'Lo-fi'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={sound === key ? 'selected' : ''}
                  onClick={() => setSound(key)}
                >
                  {key === 'off' ? (
                    <VolumeX size={15} />
                  ) : key === 'lofi' ? (
                    <Music4 size={15} />
                  ) : (
                    <Headphones size={15} />
                  )}{' '}
                  {label}
                </button>
              ))}
            </div>
            <label className="lv-focus-volume">
              Volume{' '}
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                disabled={sound === 'off'}
              />
              <span>{volume}%</span>
            </label>
          </section>

          <section className="lv-focus-side-card">
            <div className="lv-focus-section-title">
              <CheckCircle2 size={18} />
              <h3>Your progress</h3>
            </div>
            <div className="lv-focus-stats">
              <div>
                <strong>{week.length}</strong>
                <span>sessions this week</span>
              </div>
              <div>
                <strong>{sessions.length}</strong>
                <span>all-time sessions</span>
              </div>
            </div>
            <button
              className="lv-focus-history-toggle"
              type="button"
              onClick={() => setHistoryOpen((value) => !value)}
            >
              {historyOpen ? 'Hide session history' : 'View session history'} →
            </button>
            {historyOpen && (
              <div className="lv-focus-history">
                {sessions.length === 0 ? (
                  <p>No sessions yet. Your completed sessions will appear here.</p>
                ) : (
                  sessions.slice(0, 30).map((session) => (
                    <div key={session.id}>
                      <strong>
                        {session.minutes} min ·{' '}
                        {data.study.subjects.find((course) => course.id === session.courseId)
                          ?.name ?? 'Personal focus'}
                      </strong>
                      <span>{new Date(session.completedAt).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
