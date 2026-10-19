import './AnimeAvatar.css';
import type { AvatarSettings } from './avatarState';
import './AvatarStudio.css';
const palettes = {
  hair: ['#24202e', '#67412e', '#c7c8d1', '#d9a45d', '#7940a6'],
  top: ['#262638', '#2565a9', '#7447a9', '#1c805f', '#ae5363'],
  pants: ['#252938', '#555d70', '#6b5544', '#1e3c50'],
  shoes: ['#f4f0ec', '#292a35', '#bb7777', '#809ec7'],
  skin: ['#f6d4b5', '#e8b58f', '#c98d65', '#9d6347', '#684331'],
};
export function AvatarPreview({ settings }: { settings: AvatarSettings }) {
  const colors = ['hair', 'skin', 'top', 'pants', 'shoes'] as const;
  const baseSrc = '/characters/anime-avatar.png';
  return (
    <div
      className="lv-detailed-avatar"
      role="img"
      aria-label="Detailed anime avatar with customizable color accents"
    >
      <img src={baseSrc} alt="" draggable={false} />
      {settings.mode === 'custom' &&
        colors.map((key) => {
          const index = Math.max(0, palettes[key].indexOf(settings[key]));
          return (
            <img
              key={key}
              src={`/characters/layers/${key}-${index}.png`}
              alt=""
              draggable={false}
            />
          );
        })}
    </div>
  );
}
