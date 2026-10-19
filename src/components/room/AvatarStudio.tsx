import { useState, type CSSProperties } from 'react';
import { AvatarPreview } from './AvatarPreview';
import { defaultAvatar, type AvatarSettings } from './avatarState';
import './AvatarStudio.css';

export const palettes = {
  hair: ['#24202e', '#67412e', '#c7c8d1', '#d9a45d', '#7940a6'],
  skin: ['#f6d4b5', '#e8b58f', '#c98d65', '#9d6347', '#684331'],
  top: ['#262638', '#2565a9', '#7447a9', '#1c805f', '#ae5363'],
  pants: ['#252938', '#555d70', '#6b5544', '#1e3c50'],
  shoes: ['#f4f0ec', '#292a35', '#bb7777', '#809ec7'],
} as const;
type ColorKey = keyof typeof palettes;
export const avatarPresets: { name: string; mood: string; colors: Partial<AvatarSettings> }[] = [
  { name: 'Midnight', mood: 'The original', colors: { mode: 'original' } },
  {
    name: 'Moonrunner',
    mood: 'Cool streetwear',
    colors: {
      hair: '#24202e',
      skin: '#e8b58f',
      top: '#2565a9',
      pants: '#252938',
      shoes: '#f4f0ec',
    },
  },
  {
    name: 'Forest Path',
    mood: 'Quiet adventurer',
    colors: {
      hair: '#67412e',
      skin: '#c98d65',
      top: '#1c805f',
      pants: '#6b5544',
      shoes: '#292a35',
    },
  },
  {
    name: 'Stardust',
    mood: 'Cosmic colors',
    colors: {
      hair: '#7940a6',
      skin: '#f6d4b5',
      top: '#7447a9',
      pants: '#1e3c50',
      shoes: '#809ec7',
    },
  },
  {
    name: 'Sunset',
    mood: 'Warm tones',
    colors: {
      hair: '#d9a45d',
      skin: '#9d6347',
      top: '#ae5363',
      pants: '#555d70',
      shoes: '#bb7777',
    },
  },
  {
    name: 'Silverlight',
    mood: 'Minimal monochrome',
    colors: {
      hair: '#c7c8d1',
      skin: '#e8b58f',
      top: '#262638',
      pants: '#555d70',
      shoes: '#f4f0ec',
    },
  },
];

export type SavedLook = { id: string; name: string; settings: AvatarSettings };
export const LOOKS_KEY = 'lifeverse-avatar-looks-v1';
export function validateSavedLooks(input: unknown): SavedLook[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 3).flatMap((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return [];
    const look = entry as Record<string, unknown>;
    if (
      typeof look.id !== 'string' ||
      typeof look.name !== 'string' ||
      !look.settings ||
      typeof look.settings !== 'object'
    )
      return [];
    const v = look.settings as Record<string, unknown>;
    if (v.mode !== 'original' && v.mode !== 'custom') return [];
    for (const key of Object.keys(palettes) as ColorKey[])
      if (typeof v[key] !== 'string' || !palettes[key].includes(v[key] as never)) return [];
    return [
      {
        id: look.id.slice(0, 30),
        name: look.name.slice(0, 35),
        settings: {
          ...defaultAvatar,
          mode: v.mode,
          hair: v.hair as string,
          skin: v.skin as string,
          top: v.top as string,
          pants: v.pants as string,
          shoes: v.shoes as string,
        },
      },
    ];
  });
}
export function readLooks(): SavedLook[] {
  try {
    return validateSavedLooks(JSON.parse(localStorage.getItem(LOOKS_KEY) ?? '[]'));
  } catch {
    return [];
  }
}
export function saveLooks(looks: SavedLook[]) {
  try {
    localStorage.setItem(LOOKS_KEY, JSON.stringify(looks));
    return true;
  } catch {
    return false;
  }
}

export function AvatarStudio({
  settings,
  onChange,
  onClose,
}: {
  settings: AvatarSettings;
  onChange: (next: AvatarSettings) => void;
  onClose: () => void;
}) {
  const [looks, setLooks] = useState<SavedLook[]>(readLooks);
  const [compare, setCompare] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'looks' | 'colors' | 'wardrobe'>('looks');
  const set = (key: ColorKey, value: string) =>
    onChange({ ...settings, mode: 'custom', [key]: value });
  const applyPreset = (preset: (typeof avatarPresets)[number]) => {
    onChange(
      preset.colors.mode === 'original'
        ? { ...defaultAvatar, mode: 'original' }
        : { ...defaultAvatar, ...preset.colors, mode: 'custom' },
    );
    setNotice(`${preset.name} applied`);
  };
  const remember = (name: string) => {
    const id = `slot-${[1, 2, 3].find((n) => !looks.some((look) => look.id === `slot-${n}`)) ?? 3}`;
    const next = [...looks, { id, name, settings: { ...settings } }];
    if (saveLooks(next)) {
      setLooks(next);
      setNotice(`${name} saved on this device`);
    } else setNotice('Storage unavailable — look not saved');
  };
  const forget = (id: string) => {
    const next = looks.filter((look) => look.id !== id);
    if (saveLooks(next)) {
      setLooks(next);
      setNotice('Saved look removed');
    } else setNotice('Storage unavailable');
  };
  return (
    <div
      className="lv-studio-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="lv-studio lv-studio-v2"
        role="dialog"
        aria-modal="true"
        aria-label="Avatar Studio"
      >
        <div className="lv-studio-head">
          <div>
            <span className="lv-studio-eyebrow">CHAPTER VIII · CHARACTER COLLECTION</span>
            <h2>Avatar Studio 2.0 ✦</h2>
            <p>Find your signature look without losing the original art.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close studio">
            ✕
          </button>
        </div>
        <div className="lv-studio-body">
          <div className="lv-studio-preview">
            <div className="lv-studio-preview-art">
              <AvatarPreview settings={compare ? defaultAvatar : settings} />
            </div>
            <span>{compare ? 'Viewing original avatar' : 'Live character preview'}</span>
            <button
              className="lv-compare"
              type="button"
              onPointerDown={() => setCompare(true)}
              onPointerUp={() => setCompare(false)}
              onPointerLeave={() => setCompare(false)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') setCompare(true);
              }}
              onKeyUp={() => setCompare(false)}
            >
              Hold to compare original
            </button>
            <p>Color layers follow the original illustration. Its silhouette stays untouched.</p>
          </div>
          <div className="lv-studio-controls">
            <div className="lv-studio-tabs" role="group" aria-label="Customization sections">
              <button
                type="button"
                className={tab === 'looks' ? 'active' : ''}
                onClick={() => setTab('looks')}
              >
                Curated looks
              </button>
              <button
                type="button"
                className={tab === 'colors' ? 'active' : ''}
                onClick={() => setTab('colors')}
              >
                Color lab
              </button>
              <button
                type="button"
                className={tab === 'wardrobe' ? 'active' : ''}
                onClick={() => setTab('wardrobe')}
              >
                My looks
              </button>
            </div>
            {tab === 'looks' && (
              <>
                <h3>Choose a mood</h3>
                <p className="lv-studio-sub">
                  Six ready-made combinations. Each can be fine-tuned in Color Lab.
                </p>
                <div className="lv-preset-grid">
                  {avatarPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className={`lv-preset ${preset.colors.mode === 'original' && settings.mode === 'original' ? 'selected' : ''}`}
                      onClick={() => applyPreset(preset)}
                    >
                      <span className="lv-preset-dots">
                        {(['hair', 'top', 'pants'] as ColorKey[]).map((key) => (
                          <i
                            key={key}
                            style={{
                              background: (preset.colors[key] as string) || defaultAvatar[key],
                            }}
                          />
                        ))}
                      </span>
                      <strong>{preset.name}</strong>
                      <small>{preset.mood}</small>
                    </button>
                  ))}
                </div>
              </>
            )}
            {tab === 'colors' && (
              <>
                <h3>Color Lab</h3>
                <div className="lv-studio-options">
                  <button
                    type="button"
                    className={settings.mode === 'custom' ? 'selected' : ''}
                    onClick={() => onChange({ ...settings, mode: 'custom' })}
                  >
                    Custom colors
                  </button>
                  <button
                    type="button"
                    className={settings.mode === 'original' ? 'selected' : ''}
                    onClick={() => onChange({ ...settings, mode: 'original' })}
                  >
                    Original illustration
                  </button>
                </div>
                <div className={settings.mode === 'original' ? 'lv-studio-disabled' : ''}>
                  {(Object.keys(palettes) as ColorKey[]).map((key) => (
                    <div key={key}>
                      <label>
                        {key === 'top'
                          ? 'Hoodie'
                          : key === 'hair'
                            ? 'Hair'
                            : key === 'skin'
                              ? 'Skin'
                              : key === 'pants'
                                ? 'Cargo pants'
                                : 'Sneakers'}
                      </label>
                      <div className="lv-studio-swatches">
                        {palettes[key].map((color) => (
                          <button
                            key={color}
                            type="button"
                            title={color}
                            aria-label={`${key} ${color}`}
                            aria-pressed={settings[key] === color}
                            className={settings[key] === color ? 'selected' : ''}
                            style={{ '--swatch': color } as CSSProperties}
                            onClick={() => set(key, color)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="lv-studio-note">
                  These are carefully aligned color overlays. Changing the cut of the hoodie or the
                  hairstyle would require new matching artwork.
                </p>
              </>
            )}
            {tab === 'wardrobe' && (
              <>
                <h3>
                  Saved outfits <small>{looks.length}/3</small>
                </h3>
                <p className="lv-studio-sub">
                  Store up to three personal color combinations, then switch between them anytime.
                </p>
                <div className="lv-saved-looks">
                  {looks.map((look) => (
                    <div className="lv-saved-look" key={look.id}>
                      <div>
                        <strong>{look.name}</strong>
                        <small>
                          {look.settings.mode === 'original' ? 'Original style' : 'Custom colors'}
                        </small>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            onChange({ ...look.settings });
                            setNotice(`${look.name} equipped`);
                          }}
                        >
                          Wear
                        </button>
                        <button
                          type="button"
                          className="lv-remove-look"
                          onClick={() => forget(look.id)}
                          aria-label={`Delete ${look.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {looks.length < 3 && (
                    <button
                      className="lv-save-look"
                      type="button"
                      onClick={() => remember(`My look ${looks.length + 1}`)}
                    >
                      ＋ Save current look
                    </button>
                  )}
                </div>
              </>
            )}
            <div className="lv-studio-bottom-controls">
              <button
                type="button"
                className="lv-studio-reset"
                onClick={() => {
                  onChange({ ...defaultAvatar });
                  setNotice('Original character restored');
                }}
              >
                Reset to original
              </button>
              {notice && (
                <span role="status" className="lv-studio-status">
                  {notice}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="lv-studio-footer">
          <span>Avatar and saved looks are stored locally</span>
          <button type="button" onClick={onClose}>
            Done ✓
          </button>
        </div>
      </section>
    </div>
  );
}
