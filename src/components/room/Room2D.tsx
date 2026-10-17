
import { motion, useReducedMotion } from 'motion/react';
import type { CharacterStyle } from './Character';
import './Room2D.css';

export type RoomZone = 'desk' | 'fitness' | 'globe' | 'trophies';

type Props = {
  character: CharacterStyle;
  activeZone: RoomZone | null;
  onSelectZone: (zone: RoomZone) => void;
};

const hotspots: {
  id: RoomZone;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}[] = [
  {
    id: 'desk',
    label: 'Open Productivity',
    x: 17,
    y: 37,
    width: 29,
    height: 36,
  },
  {
    id: 'trophies',
    label: 'View Achievements',
    x: 85,
    y: 17,
    width: 23,
    height: 23,
  },
  {
    id: 'globe',
    label: 'Explore the World',
    x: 81,
    y: 37,
    width: 16,
    height: 23,
  },
  {
    id: 'fitness',
    label: 'Open Fitness',
    x: 85,
    y: 75,
    width: 28,
    height: 30,
  },
];

export default function Room2D({
  character: _character,
  activeZone,
  onSelectZone,
}: Props) {
  const reduceMotion = useReducedMotion();
  const selected = hotspots.find((h) => h.id === activeZone);

  const zoom = 1.9;

  const panX = selected
    ? `${(50 - selected.x) * zoom}%`
    : '0%';

  const panY = selected
    ? `${(50 - selected.y) * zoom}%`
    : '0%';

  return (
    <div
      className="lv-room-viewport"
      aria-label="Interactive LifeVerse room"
    >
      <motion.div
        className="lv-room-scene"
        style={{ transformOrigin: '50% 50%' }}
        animate={{
          scale: selected && !reduceMotion ? zoom : 1,
          x: selected && !reduceMotion ? panX : '0%',
          y: selected && !reduceMotion ? panY : '0%',
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.72,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Background */}
        <img
          src="/images/lifeverse-room-clean.png"
          alt="Cozy illustrated LifeVerse room"
          className="lv-room-art"
          draggable={false}
        />

        {/* Customizable character */}
        
<div className="lv-character-layer">
  <motion.div
    className="lv-character-animated"
    animate={reduceMotion ? { y: 0 } : { y: [0, -5, 0] }}
    transition={{
      duration: 3,
      repeat: reduceMotion ? 0 : Infinity,
      ease: 'easeInOut',
    }}
  >
    
  
    <img
      src="/characters/anime-avatar.png"
      alt="LifeVerse anime character"
      className="lv-anime-avatar"
      draggable={false}
    />
  </motion.div>
</div>


        {/* Interactive furniture */}
        {hotspots.map((h) => (
          <button
            type="button"
            key={h.id}
            className="lv-room-hotspot"
            aria-label={h.label}
            disabled={activeZone !== null}
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              width: `${h.width}%`,
              height: `${h.height}%`,
            }}
            onClick={() => onSelectZone(h.id)}
          >
            <span className="lv-room-tooltip">
              {h.label}
            </span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
