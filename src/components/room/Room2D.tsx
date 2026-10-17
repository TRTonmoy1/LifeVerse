import { motion, useReducedMotion } from 'motion/react';
import type { CharacterStyle } from './Character';
import './Room2D.css';

export type RoomZone = 'desk' | 'fitness' | 'globe' | 'trophies';

type Props = {
  character: CharacterStyle;
  activeZone: RoomZone | null;
  onSelectZone: (zone: RoomZone) => void;
};

// Coordinates are percentages of the full 16:9 room artwork.
// Keep interaction locations separate from the background asset.
const hotspots: { id: RoomZone; label: string; x: number; y: number; width: number; height: number }[] = [
  { id: 'desk', label: 'Open productivity', x: 17, y: 43, width: 29, height: 37 },
  { id: 'trophies', label: 'Open achievements', x: 82, y: 20, width: 23, height: 22 },
  { id: 'globe', label: 'Explore the world', x: 76, y: 39, width: 15, height: 23 },
  { id: 'fitness', label: 'Open fitness', x: 79, y: 73, width: 28, height: 28 },
];

export default function Room2D({ character: _character, activeZone, onSelectZone }: Props) {
  const reduceMotion = useReducedMotion();
  const selected = hotspots.find(h => h.id === activeZone);
  const zoom = 1.9;
  // Center the selected object using normalized room coordinates.
  const panX = selected ? `${(50 - selected.x) * zoom}%` : '0%';
  const panY = selected ? `${(50 - selected.y) * zoom}%` : '0%';
  return (
    <div className="lv-room-viewport" aria-label="Interactive LifeVerse room">
      <motion.div
        className="lv-room-scene"
        style={{ transformOrigin: '50% 50%' }}
        animate={{ scale: selected && !reduceMotion ? zoom : 1, x: selected && !reduceMotion ? panX : "0%", y: selected && !reduceMotion ? panY : "0%" }}
        transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src="/images/lifeverse-room-temp.png" alt="Cozy illustrated LifeVerse room" className="lv-room-art" draggable={false} />
        {hotspots.map(h => (
          <button
            type="button"
            key={h.id}
            className="lv-room-hotspot"
            aria-label={h.label}
            disabled={activeZone !== null}
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.width}%`, height: `${h.height}%` }}
            onClick={() => onSelectZone(h.id)}
          >
            <span className="lv-room-tooltip">{h.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
