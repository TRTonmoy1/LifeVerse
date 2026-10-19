import { cameraTargets } from './cameraTargets';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  BookOpen,
  ListChecks,
  Trophy,
  Globe2,
  Dumbbell,
  ClipboardList,
  Headphones,
  Gamepad2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AvatarPreview } from './AvatarPreview';
import type { AvatarSettings } from './avatarState';
import {
  isRoomSoundOn,
  setRoomSoundOn,
  playHoverSound,
  playSelectSound,
  playToggleSound,
} from './roomSound';
import './Room2D.css';

export type RoomZone =
  'desk' | 'fitness' | 'globe' | 'trophies' | 'study' | 'focus' | 'planner' | 'arcade';
type Props = {
  avatar: AvatarSettings;
  activeZone: RoomZone | null;
  onSelectZone: (zone: RoomZone, bounds: DOMRect) => void;
  returning?: boolean;
};
// Hotspots and camera targets are percentages of the Chapter X expanded illustration.
const hotspots: {
  id: RoomZone;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
}[] = [
  { id: 'study', label: 'Open Study Hub', x: 9, y: 24, width: 13, height: 24 },
  { id: 'desk', label: 'Open productivity', x: 26, y: 44, width: 15, height: 26 },
  { id: 'trophies', label: 'Open achievements', x: 81, y: 21, width: 18, height: 20 },
  { id: 'globe', label: 'Explore the world', x: 78, y: 40, width: 13, height: 18 },
  { id: 'fitness', label: 'Open fitness', x: 85, y: 73, width: 28, height: 27 },
  // The real headphones hang beside the left monitor; keep this target above nearby study/desk hit areas.
  {
    id: 'planner',
    label: 'Open Life Planner and Dream Board · inspiration board',
    x: 35.8,
    y: 30.2,
    width: 7.1,
    height: 12.4,
  },
  { id: 'focus', label: 'Open Focus Hub · headphones', x: 18.1, y: 37.5, width: 4.4, height: 11 },
  {
    id: 'arcade',
    label: 'Open Mini Arcade · handheld console on sofa',
    x: 18.0,
    y: 67.8,
    width: 7.5,
    height: 4.6,
    rotate: -17,
  },
];
// Each object gets its own icon and accent colour so the badge says what the object opens.
const hotspotBadges: Record<RoomZone, { Icon: LucideIcon; color: string }> = {
  study: { Icon: BookOpen, color: '#7cc4ff' },
  desk: { Icon: ListChecks, color: '#b79bff' },
  trophies: { Icon: Trophy, color: '#ffd166' },
  globe: { Icon: Globe2, color: '#5eead4' },
  fitness: { Icon: Dumbbell, color: '#ff9f5a' },
  planner: { Icon: ClipboardList, color: '#ff8fc8' },
  focus: { Icon: Headphones, color: '#8c9bff' },
  arcade: { Icon: Gamepad2, color: '#4de1ff' },
};
const HINT_KEY = 'lifeverse-room-hint-seen';
const hotspotTitles: Record<RoomZone, string> = {
  study: 'Study',
  desk: 'Productivity',
  trophies: 'Achievements',
  globe: 'Explore',
  fitness: 'Fitness',
  planner: 'Planner',
  focus: 'Focus',
  arcade: 'Arcade',
};

export default function Room2D({ avatar, activeZone, onSelectZone, returning = false }: Props) {
  const reduceMotion = useReducedMotion();
  const [showAll, setShowAll] = useState(false);
  const [soundOn, setSoundOn] = useState(isRoomSoundOn);
  const [hintSeen, setHintSeen] = useState(() => {
    try {
      return localStorage.getItem(HINT_KEY) === '1';
    } catch {
      return true;
    }
  });
  const dismissHint = () => {
    setHintSeen(true);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      /* storage unavailable */
    }
  };
  const viewportRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const update = () => setDimensions({ width: node.clientWidth, height: node.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const target = activeZone && !returning && !reduceMotion ? cameraTargets[activeZone] : null;
  // Fill the viewport with one illustrated scene. Use proportional cover scaling:
  // the art never stretches, and all hotspots remain aligned with it.
  // Some vertical edges can be cropped on unusually wide viewports.
  const naturalRatio = 1672 / 941;
  const imageWidth = Math.max(dimensions.width, dimensions.height * naturalRatio);
  const imageHeight = imageWidth / naturalRatio;
  const offsetX = (dimensions.width - imageWidth) / 2;
  const offsetY = (dimensions.height - imageHeight) / 2;
  const destX = target ? offsetX + (imageWidth * target.x) / 100 : dimensions.width / 2;
  const destY = target ? offsetY + (imageHeight * target.y) / 100 : dimensions.height / 2;
  const scale = target?.scale ?? 1;
  const x = target ? (dimensions.width / 2 - destX) * scale : 0;
  const y = target ? (dimensions.height / 2 - destY) * scale : 0;
  return (
    <div
      ref={viewportRef}
      className={`lv-room-viewport ${showAll ? 'lv-show-hotspots' : ''}`}
      aria-label="Interactive LifeVerse room"
    >
      <motion.div
        className="lv-room-scene"
        style={{ transformOrigin: '50% 50%' }}
        animate={{
          scale,
          x,
          y,
          filter: target ? 'brightness(.78) saturate(1.17)' : 'brightness(1) saturate(1)',
        }}
        transition={{ duration: reduceMotion ? 0 : 1.22, ease: [0.32, 0.02, 0.14, 1] }}
      >
        <div
          className="lv-scene-image"
          style={{
            width: imageWidth || '100%',
            height: imageHeight || '100%',
            left: offsetX,
            top: offsetY,
            ['--badge-size' as never]: `${Math.round(Math.min(42, Math.max(26, imageWidth * 0.03)))}px`,
          }}
        >
          <img
            src="/images/lifeverse-room-expanded.png"
            alt="Cozy illustrated LifeVerse room"
            className="lv-room-art"
            draggable={false}
          />
          <div className="lv-character-layer">
            <motion.div
              className="lv-character-animated"
              animate={reduceMotion ? { y: 0 } : { y: [0, -3, 0] }}
              transition={{ duration: 3.2, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
            >
              <AvatarPreview settings={avatar} />
            </motion.div>
          </div>
          {hotspots.map((h, i) => {
            const { Icon, color } = hotspotBadges[h.id];
            return (
              <button
                type="button"
                key={h.id}
                className={`lv-room-hotspot ${h.id === 'arcade' ? 'lv-room-hotspot-arcade' : ''}`}
                aria-label={h.label}
                disabled={activeZone !== null}
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${h.width}%`,
                  height: `${h.height}%`,
                  ['--hotspot-rotation' as never]: `${h.rotate ?? 0}deg`,
                  transform: `translate(-50%,-50%) rotate(${h.rotate ?? 0}deg)`,
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') playHoverSound(i);
                }}
                onClick={(event) => {
                  dismissHint();
                  playSelectSound(i);
                  onSelectZone(h.id, event.currentTarget.getBoundingClientRect());
                }}
              >
                <span
                  className="lv-room-badge"
                  aria-hidden="true"
                  style={{
                    ['--badge-color' as never]: color,
                    ['--badge-delay' as never]: `${i * 0.45}s`,
                  }}
                >
                  <span className="lv-badge-halo" />
                  <span className="lv-badge-spark lv-badge-spark-a" />
                  <span className="lv-badge-spark lv-badge-spark-b" />
                  <span className="lv-badge-core">
                    <Icon size={21} strokeWidth={2.2} />
                  </span>
                </span>
                <span className="lv-room-tooltip" aria-hidden="true">
                  {hotspotTitles[h.id]}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
      <motion.div
        className="lv-room-lens"
        aria-hidden="true"
        animate={{ opacity: target ? 1 : 0, scale: target ? 1.05 : 0.7 }}
        transition={{ duration: reduceMotion ? 0 : 1.15 }}
      />
      {activeZone === null && (
        <>
          <div className="lv-room-controls">
            <button
              type="button"
              className="lv-hotspot-toggle"
              aria-pressed={showAll}
              onClick={() => {
                setShowAll((v) => !v);
                dismissHint();
                playToggleSound();
              }}
            >
              <span className="lv-toggle-long">
                {showAll ? 'Hide labels' : '✦ Show clickable objects'}
              </span>
              <span className="lv-toggle-short">{showAll ? 'Hide' : '✦ Labels'}</span>
            </button>
            <button
              type="button"
              className="lv-hotspot-toggle lv-sound-toggle"
              aria-pressed={!soundOn}
              aria-label={soundOn ? 'Mute room sounds' : 'Unmute room sounds'}
              onClick={() => {
                const next = !soundOn;
                setSoundOn(next);
                setRoomSoundOn(next);
                if (next) playToggleSound();
              }}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
          {!hintSeen && (
            <div className="lv-room-hint" role="status">
              Tap the glowing icons to explore your room
            </div>
          )}
        </>
      )}
    </div>
  );
}
