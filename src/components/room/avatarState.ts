import { useEffect, useState } from 'react';

export type AvatarSettings = {
  mode: 'custom' | 'original';
  hairstyle: 'messy' | 'curtain' | 'short';
  hair: string;
  skin: string;
  outfit: 'hoodie' | 'jacket' | 'tee';
  top: string;
  pants: string;
  shoes: string;
};

export const defaultAvatar: AvatarSettings = {
  mode: 'original',
  hairstyle: 'messy',
  hair: '#24202e',
  skin: '#e8b58f',
  outfit: 'hoodie',
  top: '#262638',
  pants: '#252938',
  shoes: '#f4f0ec',
};
const KEY = 'lifeverse-avatar-v1';
export function loadAvatar(): AvatarSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultAvatar, ...JSON.parse(raw) };
  } catch {
    /* default on invalid storage */
  }
  return defaultAvatar;
}
export function useAvatar() {
  const [avatar, setAvatar] = useState<AvatarSettings>(loadAvatar);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(avatar));
    } catch {
      /* private mode */
    }
  }, [avatar]);
  return [avatar, setAvatar] as const;
}
