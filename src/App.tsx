import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Palette, Sparkles } from "lucide-react";
import Room2D, { type RoomZone } from "./components/room/Room2D";
import { AvatarStudio } from "./components/room/AvatarStudio";
import { useAvatar } from "./components/room/avatarState";
import "./App.css";

const zoneNames: Record<RoomZone, string> = {
  desk: "Productivity Zone",
  fitness: "Fitness Corner",
  globe: "World Explorer",
  trophies: "Achievements",
};

export default function App() {
  const [avatar, setAvatar] = useAvatar();
  const [activeZone, setActiveZone] = useState<RoomZone | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);


  useEffect(() => {
    if (!activeZone) return;

    const timeout = window.setTimeout(() => {
      setShowDashboard(true);
    }, 720);

    return () => window.clearTimeout(timeout);
  }, [activeZone]);

  function returnToRoom() {
    setShowDashboard(false);
    setActiveZone(null);
  }

  return (
    <main className="lifeverse">
      <header className="topbar">
        <div>
          <h1>LifeVerse <Sparkles size={22} /></h1>
          <p>Your space. Your goals. Your universe.</p>
        </div>

        <button
          className="customize-button"
          onClick={() => setShowCustomizer(true)}
          disabled={activeZone !== null}
        >
          <Palette size={18} />
          Customize
        </button>
      </header>

      <section className="room-container">
        <Room2D
          avatar={avatar}
          activeZone={activeZone}
          onSelectZone={(zone) => {
            if (activeZone) return;
            setShowCustomizer(false);
            setActiveZone(zone);
          }}
        />

        <AnimatePresence>
          {showDashboard && activeZone && (
            <motion.div
              className="dashboard-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="dashboard-card"
                initial={{ opacity: 0, y: 35, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
              >
                <button className="back-button" onClick={returnToRoom}>
                  <ArrowLeft size={18} />
                  Back to room
                </button>

                <h2>{zoneNames[activeZone]}</h2>
                <p>
                  Welcome to your {zoneNames[activeZone].toLowerCase()}.
                </p>

                <div className="dashboard-placeholder">
                  This zone is ready for its interactive features!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <p className="room-hint">
        Hover over an object and click it to explore your universe.
      </p>

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
