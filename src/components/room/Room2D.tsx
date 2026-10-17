
import { motion } from "motion/react";
import { Monitor, Dumbbell, Globe2, Trophy } from "lucide-react";
import Character, { type CharacterStyle } from "./Character";

export type RoomZone = "desk" | "fitness" | "globe" | "trophies";

type Props = {
  character: CharacterStyle;
  activeZone: RoomZone | null;
  onSelectZone: (zone: RoomZone) => void;
};

const objects = [
  { id: "desk", label: "Productivity", Icon: Monitor, x: 24, y: 44 },
  { id: "fitness", label: "Fitness", Icon: Dumbbell, x: 77, y: 70 },
  { id: "globe", label: "Explore", Icon: Globe2, x: 75, y: 28 },
  { id: "trophies", label: "Achievements", Icon: Trophy, x: 25, y: 19 },
] as const;

export default function Room2D({
  character,
  activeZone,
  onSelectZone,
}: Props) {
  const focused = objects.find((item) => item.id === activeZone);

  return (
    <div className="room-viewport">
      <motion.div
        className="room-scene"
        animate={
          focused
            ? {
                scale: 2.1,
                x: `${(50 - focused.x) * 1.2}%`,
                y: `${(50 - focused.y) * 1.2}%`,
              }
            : { scale: 1, x: "0%", y: "0%" }
        }
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="room-back-wall" />
        <div className="room-floor" />
        <div className="room-window">
          <div className="room-moon" />
        </div>
        <div className="room-rug" />

        <motion.div
          className="room-character"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Character style={character} />
        </motion.div>

        {objects.map(({ id, label, Icon, x, y }) => (
          <motion.button
            key={id}
            type="button"
            className={`room-object room-object-${id}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            whileHover={{ scale: 1.12, y: -7 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectZone(id)}
            aria-label={`Open ${label}`}
          >
            <Icon size={36} strokeWidth={1.7} />
            <span className="room-object-label">{label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
