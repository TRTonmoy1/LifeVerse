import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  Download,
  Upload,
  Compass,
  Crown,
  Dumbbell,
  Flame,
  Globe2,
  ChartNoAxesCombined,
  CircleHelp,
  Palette,
  Sparkles,
  Trophy,
  UserRound,
  Headphones,
  ClipboardList,
  Gamepad2,
  X,
  Zap,
} from 'lucide-react';
import Room2D, { type RoomZone } from './components/room/Room2D';
import {
  AvatarStudio,
  readLooks,
  saveLooks,
  validateSavedLooks,
} from './components/room/AvatarStudio';
import { useAvatar } from './components/room/avatarState';
import ProductivityHub from './features/productivity/ProductivityHub';
import FitnessHub from './features/fitness/FitnessHub';
import {
  earnedXp,
  levelForXp,
  parseLifeData,
  useLifeData,
  type LifeData,
} from './features/life/lifeData';
import PlayerProfile from './features/life/PlayerProfile';
import { milestones } from './features/life/milestones';
import ExploreHub from './features/explore/ExploreHub';
import InsightsDashboard from './features/life/InsightsDashboard';
import StudyHub from './features/study/StudyHub';
import FocusHub from './features/focus/FocusHub';
import PlannerHub from './features/life/PlannerHub';
import ArcadeHub from './features/arcade/ArcadeHub';
import GuideHub from './features/guide/GuideHub';
import './App.css';
import './features/life/hubs.css';
import './features/life/chapter3.css';

const zoneNames: Record<RoomZone, string> = {
  desk: 'Productivity',
  fitness: 'Fitness',
  globe: 'Explore',
  trophies: 'Achievements',
  study: 'Study',
  focus: 'Focus',
  planner: 'Life Planner',
  arcade: 'Mini Arcade',
};
const zoneSub: Record<RoomZone, string> = {
  desk: 'Own your day',
  fitness: 'Become your strongest self',
  globe: 'A whole world is waiting',
  trophies: 'Every small victory matters',
  study: "A scholar's nook for your courses and notes",
  focus: 'A quieter space for deeper work',
  planner: 'Plans for today, dreams for tomorrow',
  arcade: 'A playful corner for short breaks',
};
const zoneHero: Partial<
  Record<RoomZone, { image: string; eyebrow: string; title: string; text: string }>
> = {
  desk: {
    image: '/images/hubs/productivity-hero.png',
    eyebrow: 'COMMAND YOUR DAY',
    title: 'Turn intentions into momentum.',
    text: 'A focused space for tasks, habits, and goals—designed to make progress feel inviting.',
  },
  fitness: {
    image: '/images/hubs/fitness-hero.png',
    eyebrow: 'MOVE WITH PURPOSE',
    title: 'Build strength in your own rhythm.',
    text: 'Step into a calmer training corner where consistency, energy, and recovery all belong.',
  },
  globe: {
    image: '/images/hubs/explore-hero.png',
    eyebrow: 'CHASE CURIOSITY',
    title: 'Let your world feel bigger tonight.',
    text: 'Maps, memories, and wonder come together in a hub made for discovery and exploration.',
  },
  trophies: {
    image: '/images/hubs/achievements-hero.png',
    eyebrow: 'CELEBRATE MILESTONES',
    title: 'Every small victory deserves a place to shine.',
    text: 'A warmer showcase for the progress, rewards, and personal growth you have already earned.',
  },
  study: {
    image: '/images/hubs/study-hero.png',
    eyebrow: 'ENTER STUDY MODE',
    title: 'A calmer corner for learning.',
    text: 'Keep your courses, notes, and reflections in a study space that feels focused instead of overwhelming.',
  },
  focus: {
    image: '/images/hubs/focus-hero.png',
    eyebrow: 'DEEP WORK AHEAD',
    title: 'Find your quiet and stay there a little longer.',
    text: 'Settle into a peaceful flow with timers, ambience, and a visual mood that supports concentration.',
  },
  planner: {
    image: '/images/hubs/planner-hero.png',
    eyebrow: 'PLANS & DREAMS',
    title: 'Shape today while keeping tomorrow in sight.',
    text: 'Bring your plans, inspiration, and dream board together in one creative, reflective space.',
  },
};
export default function App() {
  const [avatar, setAvatar] = useAvatar();
  const [data, setData] = useLifeData();
  const [activeZone, setActiveZone] = useState<RoomZone | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [portalOrigin, setPortalOrigin] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    size: 100,
  });
  const [returning, setReturning] = useState(false);
  const [cameraRetreat, setCameraRetreat] = useState(false);
  const retreatTimer = useRef<number | null>(null);
  const returnTimer = useRef<number | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState<'start' | 'map'>('start');
  const [xpToast, setXpToast] = useState('');
  const previousProgress = useRef<{ xp: number; medals: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const backupFile = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState('');
  const portalX = portalOrigin.x - window.innerWidth / 2;
  const portalY = portalOrigin.y - window.innerHeight / 2;
  const portalScale = Math.max(
    0.12,
    Math.min(0.32, portalOrigin.size / Math.min(window.innerWidth, 900)),
  );
  const portalPose = {
    x: portalX,
    y: portalY,
    scale: portalScale,
    opacity: 0.18,
    borderRadius: 42,
    filter: 'blur(9px)',
  };
  const settledPose = { x: 0, y: 0, scale: 1, opacity: 1, borderRadius: 22, filter: 'blur(0px)' };
  const xp = earnedXp(data).total;
  const lvl = levelForXp(xp);
  const medalCount = milestones(data).filter((m) => m.achieved).length;
  useEffect(() => {
    const before = previousProgress.current;
    previousProgress.current = { xp, medals: medalCount };
    if (!before) return;
    const delta = xp - before.xp;
    if (delta > 0 || medalCount > before.medals) {
      const newLevel = levelForXp(xp).level;
      const oldLevel = levelForXp(before.xp).level;
      setXpToast(
        newLevel > oldLevel
          ? `✦ LEVEL UP! You're now Level ${newLevel}`
          : medalCount > before.medals
            ? '✦ Milestone unlocked!'
            : `+${delta} XP · Keep going!`,
      );
    }
  }, [xp, medalCount]);
  useEffect(() => {
    if (!xpToast) return;
    const timer = window.setTimeout(() => setXpToast(''), 3800);
    return () => window.clearTimeout(timer);
  }, [xpToast]);

  const returnToRoom = useCallback(() => {
    if (returnTimer.current !== null) window.clearTimeout(returnTimer.current);
    if (retreatTimer.current !== null) window.clearTimeout(retreatTimer.current);
    setShowDashboard(false);
    setReturning(true);
    setShowProfile(false);
    // Let the hub fold toward its entry point before the room camera retreats.
    retreatTimer.current = window.setTimeout(
      () => {
        setCameraRetreat(true);
        retreatTimer.current = null;
      },
      reduceMotion ? 0 : 135,
    );
    returnTimer.current = window.setTimeout(
      () => {
        setActiveZone(null);
        setReturning(false);
        setCameraRetreat(false);
        returnTimer.current = null;
      },
      reduceMotion ? 0 : 1390,
    );
  }, [reduceMotion]);
  useEffect(() => {
    if (!activeZone || returning) return;
    const timeout = window.setTimeout(() => setShowDashboard(true), reduceMotion ? 0 : 650);
    return () => window.clearTimeout(timeout);
  }, [activeZone, reduceMotion, returning]);
  useEffect(() => {
    if (!showDashboard) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') returnToRoom();
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [showDashboard, returnToRoom]);
  useEffect(() => {
    if (!showDashboard && !showCustomizer && !showProfile && !showInsights && !showGuide) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [showDashboard, showCustomizer, showProfile, showInsights, showGuide]);
  useEffect(() => {
    if (!showGuide) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuide(false);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [showGuide]);

  useEffect(
    () => () => {
      if (returnTimer.current !== null) window.clearTimeout(returnTimer.current);
      if (retreatTimer.current !== null) window.clearTimeout(retreatTimer.current);
    },
    [],
  );
  function exportBackup() {
    const payload = {
      app: 'LifeVerse',
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
      avatar,
      avatarLooks: readLooks(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `lifeverse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupMessage('Backup downloaded');
  }
  async function importBackup(file: File | undefined) {
    if (!file) return;
    if (file.size > 5_000_000) {
      setBackupMessage('Backup is too large (max 5 MB)');
      return;
    }
    try {
      const incoming: unknown = JSON.parse(await file.text());
      if (
        !incoming ||
        typeof incoming !== 'object' ||
        !('app' in incoming) ||
        incoming.app !== 'LifeVerse' ||
        !('data' in incoming)
      )
        throw new Error('Invalid LifeVerse backup');
      const next = parseLifeData(incoming.data) as LifeData | null;
      if (!next) throw new Error('Invalid backup structure');
      if (
        !window.confirm(
          'Replace your current LifeVerse progress with the backup? This cannot be undone.',
        )
      )
        return;
      setData(next);
      if ('avatar' in incoming && incoming.avatar && typeof incoming.avatar === 'object') {
        const proposed = incoming.avatar as Record<string, unknown>;
        if (proposed.mode === 'original' || proposed.mode === 'custom') {
          const nextAvatar = { ...avatar };
          for (const key of ['hair', 'skin', 'top', 'pants', 'shoes'] as const)
            if (typeof proposed[key] === 'string' && /^#[0-9a-fA-F]{6}$/.test(proposed[key]))
              nextAvatar[key] = proposed[key];
          nextAvatar.mode = proposed.mode;
          setAvatar(nextAvatar);
        }
      }
      if ('avatarLooks' in incoming) saveLooks(validateSavedLooks(incoming.avatarLooks));
      setBackupMessage('Backup restored');
    } catch {
      setBackupMessage('Could not read this backup file');
    }
  }
  return (
    <main className="lifeverse">
      <header className="topbar">
        <div className="lv-brand">
          <div className="lv-brand-mark">
            <Sparkles size={22} />
          </div>
          <div>
            <h1>
              LifeVerse <span>✦</span>
            </h1>
            <p>Your space. Your goals. Your universe.</p>
          </div>
        </div>
        <div className="lv-tour-slot">
          <button
            type="button"
            className="lv-tour-open"
            onClick={() => {
              setGuideTab('map');
              setShowGuide(true);
            }}
            disabled={activeZone !== null}
          >
            <Compass size={17} />
            <span>Take a room tour</span>
          </button>
        </div>
        <div className="lv-top-actions">
          <div
            className="lv-level-badge"
            title={`${lvl.current} / 250 XP toward level ${lvl.level + 1}`}
          >
            <span className="lv-level-icon">
              <Zap size={16} />
            </span>
            <div>
              <b>LVL {lvl.level}</b>
              <small>{xp.toLocaleString()} XP</small>
            </div>
            <div className="lv-level-mini">
              <span style={{ width: `${(lvl.current / lvl.toNext) * 100}%` }} />
            </div>
          </div>
          <button
            type="button"
            className="lv-profile-open lv-guide-open"
            onClick={() => {
              setGuideTab('start');
              setShowGuide(true);
            }}
            disabled={activeZone !== null}
            title="How LifeVerse works"
            aria-label="Open the LifeVerse guide"
          >
            <CircleHelp size={17} />
            <span>Guide</span>
          </button>
          <button
            type="button"
            className="lv-profile-open"
            onClick={() => setShowInsights(true)}
            disabled={activeZone !== null}
          >
            <ChartNoAxesCombined size={17} />
            <span>Insights</span>
          </button>
          <button
            type="button"
            className="lv-profile-open"
            onClick={() => setShowProfile(true)}
            disabled={activeZone !== null}
          >
            <UserRound size={17} />
            <span>Player profile</span>
          </button>
          <button
            type="button"
            className="customize-button"
            onClick={() => setShowCustomizer(true)}
            disabled={activeZone !== null}
          >
            <Palette size={18} />
            <span>Avatar Studio</span>
          </button>
        </div>
      </header>
      <section className="room-container">
        <Room2D
          avatar={avatar}
          activeZone={activeZone}
          returning={cameraRetreat}
          onSelectZone={(zone, bounds) => {
            if (activeZone || returning) return;
            setPortalOrigin({
              x: bounds.left + bounds.width / 2,
              y: bounds.top + bounds.height / 2,
              size: Math.min(bounds.width, bounds.height),
            });
            setShowCustomizer(false);
            setCameraRetreat(false);
            setActiveZone(zone);
          }}
        />
      </section>
      <AnimatePresence>
        {activeZone && !reduceMotion && (
          <motion.div
            key={`energy-${activeZone}`}
            className={`lv-energy-field lv-transition-${activeZone}`}
            aria-hidden="true"
            style={
              {
                '--energy-x': `${portalOrigin.x}px`,
                '--energy-y': `${portalOrigin.y}px`,
              } as React.CSSProperties
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: returning ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="lv-energy-anchor">
              <motion.div
                className="lv-energy-halo"
                initial={{ scale: 0.18, opacity: 0 }}
                animate={
                  returning
                    ? { scale: 0.24, opacity: 0 }
                    : { scale: [0.18, 0.66, 1.6], opacity: [0, 0.92, 0] }
                }
                transition={{
                  duration: returning ? 0.6 : 1.12,
                  times: [0, 0.4, 1],
                  ease: [0.19, 0.75, 0.18, 1],
                }}
              />
              <motion.div
                className="lv-energy-ring"
                initial={{ scale: 0.15, opacity: 0 }}
                animate={
                  returning
                    ? { scale: 0.12, opacity: 0 }
                    : { scale: [0.15, 0.75, 2], opacity: [0, 0.85, 0] }
                }
                transition={{
                  duration: returning ? 0.56 : 1.16,
                  times: [0, 0.35, 1],
                  ease: 'easeOut',
                }}
              />
              <motion.div
                className="lv-energy-spark"
                initial={{ scale: 0.25, opacity: 0 }}
                animate={
                  returning
                    ? { scale: 0.2, opacity: 0 }
                    : { scale: [0.25, 1.5, 0.7], opacity: [0, 1, 0] }
                }
                transition={{ duration: returning ? 0.45 : 0.9, times: [0, 0.3, 1] }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="lv-bottom-strip">
        <div>
          <span className="lv-live-dot" /> YOUR UNIVERSE AWAITS
        </div>
        <p>Click an object in your room to enter its hub</p>
        <div>
          <Flame size={15} /> Progress at your pace
        </div>
      </div>
      <AnimatePresence mode="sync">
        {showDashboard && activeZone && (
          <motion.div
            key={activeZone}
            className={`lv-dashboard-overlay lv-cinematic-overlay lv-transition-${activeZone} lv-shared-portal`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.46, ease: [0.2, 0.72, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`${zoneNames[activeZone]} hub`}
            style={
              {
                '--lv-origin-x': `${portalOrigin.x}px`,
                '--lv-origin-y': `${portalOrigin.y}px`,
              } as React.CSSProperties
            }
          >
            <motion.div
              className="lv-dashboard-window lv-portal-window"
              initial={reduceMotion ? settledPose : portalPose}
              animate={settledPose}
              exit={reduceMotion ? settledPose : portalPose}
              transition={{ duration: reduceMotion ? 0 : 0.68, ease: [0.22, 1, 0.24, 1] }}
              style={{ transformOrigin: 'center center' }}
            >
              <motion.div
                aria-hidden="true"
                className="lv-portal-flash"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: reduceMotion ? 0 : 0.5 }}
              />
              <div className="lv-dashboard-bar">
                <div className="lv-dashboard-identity">
                  <div className={`lv-hub-icon ${activeZone}`}>
                    {activeZone === 'desk' ? (
                      <Compass size={22} />
                    ) : activeZone === 'fitness' ? (
                      <Dumbbell size={22} />
                    ) : activeZone === 'globe' ? (
                      <Globe2 size={22} />
                    ) : activeZone === 'study' ? (
                      <BookOpen size={22} />
                    ) : activeZone === 'focus' ? (
                      <Headphones size={22} />
                    ) : activeZone === 'planner' ? (
                      <ClipboardList size={22} />
                    ) : activeZone === 'arcade' ? (
                      <Gamepad2 size={22} />
                    ) : (
                      <Trophy size={22} />
                    )}
                  </div>
                  <div>
                    <h2>
                      {zoneNames[activeZone]} <span>HUB</span>
                    </h2>
                    <p>{zoneSub[activeZone]}</p>
                  </div>
                </div>
                <div className="lv-dashboard-actions">
                  <div className="lv-hub-xp">
                    <Zap size={15} /> Level {lvl.level} <span>· {xp.toLocaleString()} XP</span>
                  </div>
                  <button type="button" className="lv-back-button" onClick={returnToRoom}>
                    <ArrowLeft size={17} />
                    <span>Back to room</span>
                  </button>
                  <button
                    type="button"
                    className="lv-close-button"
                    title="Close hub"
                    aria-label="Close hub"
                    onClick={returnToRoom}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="lv-dashboard-scroll" key={activeZone}>
                <div className="lv-dashboard-content">
                  {activeZone !== 'arcade' && zoneHero[activeZone] && (
                    <section
                      className="lv-dashboard-hero"
                      aria-label={`${zoneNames[activeZone]} hub highlight`}
                    >
                      <img src={zoneHero[activeZone]!.image} alt="" />
                      <div className="lv-dashboard-hero-overlay">
                        <span className="lv-dashboard-hero-eyebrow">
                          {zoneHero[activeZone]!.eyebrow}
                        </span>
                        <h3>{zoneHero[activeZone]!.title}</h3>
                        <p>{zoneHero[activeZone]!.text}</p>
                      </div>
                    </section>
                  )}
                  {activeZone === 'desk' ? (
                    <ProductivityHub data={data} setData={setData} />
                  ) : activeZone === 'fitness' ? (
                    <FitnessHub data={data} setData={setData} />
                  ) : activeZone === 'trophies' ? (
                    <PlayerProfile data={data} avatar={avatar} setData={setData} />
                  ) : activeZone === 'study' ? (
                    <StudyHub data={data} setData={setData} />
                  ) : activeZone === 'focus' ? (
                    <FocusHub data={data} setData={setData} />
                  ) : activeZone === 'planner' ? (
                    <PlannerHub data={data} setData={setData} />
                  ) : activeZone === 'arcade' ? (
                    <ArcadeHub data={data} setData={setData} />
                  ) : (
                    <ExploreHub data={data} setData={setData} />
                  )}
                </div>
              </div>
              <div className="lv-dashboard-bottom">
                <span>✦ LifeVerse · Build your own story</span>
                <div className="lv-backup-actions">
                  <span className="lv-status-dot" /> {backupMessage || 'Auto-saved locally'}{' '}
                  <button
                    type="button"
                    onClick={exportBackup}
                    title="Download a backup of your LifeVerse data and avatar"
                  >
                    <Download size={13} /> Backup
                  </button>
                  <button
                    type="button"
                    onClick={() => backupFile.current?.click()}
                    title="Restore a LifeVerse JSON backup"
                  >
                    <Upload size={13} /> Restore
                  </button>
                  <input
                    ref={backupFile}
                    type="file"
                    accept=".json,application/json"
                    hidden
                    onChange={(e) => {
                      void importBackup(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {xpToast && (
          <motion.div
            className="lv-xp-toast"
            role="status"
            initial={{ opacity: 0, y: 22, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
          >
            <Sparkles size={21} />
            <span>{xpToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showProfile && (
          <motion.div
            className="lv-profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Player profile"
          >
            <motion.div
              className="lv-profile-window"
              initial={{ scale: 0.97, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 12 }}
            >
              <header>
                <div>
                  <Crown size={21} />
                  <h2>Player profile</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfile(false)}
                  aria-label="Close player profile"
                >
                  <X size={20} />
                </button>
              </header>
              <div className="lv-profile-scroll">
                <PlayerProfile data={data} avatar={avatar} setData={setData} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showGuide && (
          <motion.div
            className="lv-profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="LifeVerse Guide"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowGuide(false);
            }}
          >
            <motion.div
              className="lv-profile-window lv-guide-modal"
              initial={{ scale: 0.97, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 12 }}
            >
              <header>
                <div>
                  <CircleHelp size={21} />
                  <h2>LifeVerse Guide</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Close guide"
                  autoFocus
                >
                  <X size={20} />
                </button>
              </header>
              <div className="lv-profile-scroll">
                <GuideHub initialTab={guideTab} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInsights && (
          <motion.div
            className="lv-profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="LifeVerse Insights"
          >
            <motion.div
              className="lv-profile-window lv-insights-modal"
              initial={{ scale: 0.97, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 12 }}
            >
              <header>
                <div>
                  <ChartNoAxesCombined size={21} />
                  <h2>LifeVerse Insights</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInsights(false)}
                  aria-label="Close Insights"
                >
                  <X size={20} />
                </button>
              </header>
              <div className="lv-profile-scroll">
                <InsightsDashboard data={data} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showCustomizer && (
        <AvatarStudio
          settings={avatar}
          onChange={setAvatar}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </main>
  );
}
