import type { CSSProperties } from 'react';
import './AvatarStudio.css';
import { AvatarPreview } from './AvatarPreview';
import { defaultAvatar, type AvatarSettings } from './avatarState';

const choices = {
  hair: ['#24202e', '#67412e', '#c7c8d1', '#d9a45d', '#7940a6'],
  skin: ['#f6d4b5', '#e8b58f', '#c98d65', '#9d6347', '#684331'],
  top: ['#262638', '#2565a9', '#7447a9', '#1c805f', '#ae5363'],
  pants: ['#252938', '#555d70', '#6b5544', '#1e3c50'],
  shoes: ['#f4f0ec', '#292a35', '#bb7777', '#809ec7'],
};
export function AvatarStudio({ settings, onChange, onClose }: { settings: AvatarSettings; onChange: (next: AvatarSettings) => void; onClose: () => void }) {
  const set = <K extends keyof AvatarSettings>(key: K, value: AvatarSettings[K]) => onChange({ ...settings, [key]: value });
  return <div className="lv-studio-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="lv-studio" role="dialog" aria-modal="true" aria-label="Avatar Studio">
      <div className="lv-studio-head"><div><h2>Avatar Studio ✦</h2><p>Create your LifeVerse character</p></div><button type="button" onClick={onClose} aria-label="Close avatar studio">✕</button></div>
      <div className="lv-studio-body">
        <div className="lv-studio-preview"><AvatarPreview settings={settings}/><span>{settings.mode === 'original' ? 'Original artwork' : 'Live customizable avatar'}</span></div>
        <div className="lv-studio-controls">
          <label>Character style</label><div className="lv-studio-options"><button className={settings.mode === 'custom' ? 'selected' : ''} onClick={() => set('mode','custom')}>Customizable</button><button className={settings.mode === 'original' ? 'selected' : ''} onClick={() => set('mode','original')}>Original anime art</button></div>
          {settings.mode === 'original' && <p className="lv-studio-note">The original PNG is a single illustration. Select Customizable to edit individual parts.</p>}
          <div className={settings.mode === 'original' ? 'lv-studio-disabled' : ''}>
            <label>Hairstyle</label><div className="lv-studio-options">{(['messy','curtain','short'] as const).map(v => <button key={v} className={settings.hairstyle === v ? 'selected' : ''} onClick={() => set('hairstyle',v)}>{v}</button>)}</div>
            <label>Outfit</label><div className="lv-studio-options">{(['hoodie','jacket','tee'] as const).map(v => <button key={v} className={settings.outfit === v ? 'selected' : ''} onClick={() => set('outfit',v)}>{v}</button>)}</div>
            {(Object.keys(choices) as (keyof typeof choices)[]).map(key => <div key={key}><label>{key === 'top' ? 'Top color' : key === 'hair' ? 'Hair color' : key === 'skin' ? 'Skin tone' : key === 'pants' ? 'Pants color' : 'Shoe color'}</label><div className="lv-studio-swatches">{choices[key].map(color => <button key={color} type="button" title={color} aria-label={`${key} ${color}`} aria-pressed={settings[key] === color} className={settings[key] === color ? 'selected' : ''} style={{ '--swatch': color } as CSSProperties} onClick={() => set(key,color)}/>)}</div></div>)}
          </div>
          <button className="lv-studio-reset" onClick={() => onChange(defaultAvatar)}>Reset avatar</button>
        </div>
      </div>
      <div className="lv-studio-footer"><span>Changes save automatically on this device</span><button onClick={onClose}>Done ✓</button></div>
    </section>
  </div>;
}
