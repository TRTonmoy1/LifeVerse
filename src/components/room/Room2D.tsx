import { motion, useReducedMotion } from 'motion/react';
import { AvatarPreview } from './AvatarPreview';
import type { AvatarSettings } from './avatarState';
import './Room2D.css';

export type RoomZone = 'desk' | 'fitness' | 'globe' | 'trophies';
type Props = { avatar: AvatarSettings; activeZone: RoomZone | null; onSelectZone: (zone: RoomZone) => void };
const hotspots: { id: RoomZone; label: string; x: number; y: number; width: number; height: number }[] = [
  { id: 'desk', label: 'Open productivity', x: 17, y: 43, width: 29, height: 37 },
  { id: 'trophies', label: 'Open achievements', x: 82, y: 20, width: 23, height: 22 },
  { id: 'globe', label: 'Explore the world', x: 76, y: 39, width: 15, height: 23 },
  { id: 'fitness', label: 'Open fitness', x: 79, y: 73, width: 28, height: 28 },
];
export default function Room2D({ avatar, activeZone, onSelectZone }: Props) {
  const reduceMotion = useReducedMotion();
  const selected = hotspots.find(h => h.id === activeZone);
  const zoom = 1.9;
  const panX = selected ? `${(50 - selected.x) * zoom}%` : '0%';
  const panY = selected ? `${(50 - selected.y) * zoom}%` : '0%';
  return <div className="lv-room-viewport" aria-label="Interactive LifeVerse room">
    <motion.div className="lv-room-scene" style={{ transformOrigin: '50% 50%' }}
      animate={{ scale: selected && !reduceMotion ? zoom : 1, x: selected && !reduceMotion ? panX : '0%', y: selected && !reduceMotion ? panY : '0%' }}
      transition={{ duration: reduceMotion ? 0 : .72, ease: [0.22, 1, .36, 1] }}>
      <img src="/images/lifeverse-room-clean.png" alt="Cozy illustrated LifeVerse room" className="lv-room-art" draggable={false}/>
      <div className="lv-character-layer">
        <motion.div className="lv-character-animated" animate={reduceMotion ? { y: 0 } : { y: [0, -5, 0] }} transition={{ duration: 3, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}>
          <AvatarPreview settings={avatar}/>
        </motion.div>
      </div>
      {hotspots.map(h => <button type="button" key={h.id} className="lv-room-hotspot" aria-label={h.label} disabled={activeZone !== null}
        style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.width}%`, height: `${h.height}%` }} onClick={() => onSelectZone(h.id)}>
        <span className="lv-room-tooltip">{h.label}</span>
      </button>)}
    </motion.div>
  </div>;
}
