import type { AvatarSettings } from './avatarState';
import './AvatarStudio.css';

function AvatarSVG({ settings }: { settings: AvatarSettings }) {
  const { skin, hair, hairstyle, outfit, top, pants, shoes } = settings;
  return <svg viewBox="0 0 180 300" role="img" aria-label="Custom anime-inspired avatar" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lvTopLight" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".2"/><stop offset="1" stopColor="#000" stopOpacity=".28"/></linearGradient>
      <linearGradient id="lvSkinLight" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".16"/><stop offset="1" stopColor="#000" stopOpacity=".12"/></linearGradient>
    </defs>
    <ellipse cx="90" cy="289" rx="42" ry="6" fill="#060611" opacity=".3" />
    <path d="M58 167 L122 167 L127 222 L117 271 L96 271 L90 215 L84 271 L61 271 L53 223 Z" fill={pants} stroke="#141521" strokeWidth="3"/>
    <path d="M62 199 l15 16 -10 15 M115 199 l-14 18 11 13" stroke="#fff" strokeOpacity=".12" strokeWidth="2.5" fill="none"/>
    <path d="M52 207 h21 v27 h-21 z M108 207 h22 v27 h-22 z" fill="#000" opacity=".2"/>
    <path d="M61 264 h24 v20 q-13 8-37 2 l-2-9 z M97 264 h24 l14 14 q4 10-9 10 h-29 z" fill={shoes} stroke="#28293b" strokeWidth="3"/>
    <path d="M48 283 h37 M98 284 h35" stroke="#6c6b81" strokeWidth="2"/>
    <rect x="80" y="96" width="20" height="29" rx="7" fill={skin}/>
    <path d="M62 111 Q43 112 36 133 L27 178 Q29 190 44 185 L64 151 Z M118 111 Q137 112 144 133 L153 178 Q151 190 136 185 L116 151 Z" fill={top} stroke="#171723" strokeWidth="3"/>
    <ellipse cx="36" cy="182" rx="9" ry="12" fill={skin}/><ellipse cx="144" cy="182" rx="9" ry="12" fill={skin}/>
    <path d="M62 111 Q90 101 118 111 Q130 134 126 179 Q90 191 54 179 Q50 134 62 111 Z" fill={top} stroke="#171723" strokeWidth="3"/>
    <path d="M62 111 Q90 101 118 111 Q130 134 126 179 Q90 191 54 179 Q50 134 62 111 Z" fill="url(#lvTopLight)"/>
    {outfit === 'hoodie' && <g><path d="M67 110 Q90 139 113 110 L105 131 Q90 144 75 131 Z" fill="#161923" stroke="#444153" strokeWidth="2"/><path d="M81 129 v25 M99 129 v25" stroke="#d8d4dd" strokeWidth="2"/><path d="M65 157 Q90 163 115 157 L119 174 Q90 182 61 174 Z" fill="#000" opacity=".18"/></g>}
    {outfit === 'jacket' && <g><path d="M89 110 v73" stroke="#c8c8d4" strokeWidth="3"/><path d="M65 111 L88 138 L75 146 L61 122 M115 111 L92 138 L105 146 L119 122" fill="#202434" stroke="#b7adbd" strokeWidth="1.5"/><path d="M60 160 h20 M100 160 h20" stroke="#b7adbd" strokeWidth="2"/></g>}
    {outfit === 'tee' && <g><path d="M69 111 Q90 132 111 111" fill="none" stroke="#181922" strokeWidth="5"/><path d="M70 153 h40" stroke="#fff" strokeOpacity=".16" strokeWidth="2"/></g>}
    <ellipse cx="55" cy="71" rx="8" ry="12" fill={skin}/><ellipse cx="125" cy="71" rx="8" ry="12" fill={skin}/>
    <path d="M56 49 Q58 25 90 25 Q122 25 124 49 L121 82 Q117 109 90 112 Q63 109 59 82 Z" fill={skin} stroke="#684c48" strokeWidth="1.5"/>
    <path d="M56 49 Q58 25 90 25 Q122 25 124 49 L121 82 Q117 109 90 112 Q63 109 59 82 Z" fill="url(#lvSkinLight)"/>
    <path d="M67 69 q9-6 17 0 M96 69 q9-6 17 0" stroke="#22212b" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <ellipse cx="76" cy="74" rx="4" ry="6" fill="#272434"/><ellipse cx="104" cy="74" rx="4" ry="6" fill="#272434"/><circle cx="78" cy="71" r="1.6" fill="white"/><circle cx="106" cy="71" r="1.6" fill="white"/>
    <path d="M89 80 l-2 5 5 1 M83 94 q7 5 14 0" stroke="#855750" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    {hairstyle === 'messy' && <path d="M52 66 L43 49 L54 46 L49 33 L64 37 L61 21 L77 27 L84 12 L95 25 L110 15 L114 29 L130 26 L126 42 L137 48 L126 65 L118 57 L112 42 L101 56 L94 40 L79 59 L76 43 L62 63 Z" fill={hair} stroke="#161620" strokeWidth="3" strokeLinejoin="round"/>}
    {hairstyle === 'curtain' && <path d="M52 76 Q42 39 61 25 Q89 7 116 24 Q137 38 126 76 L114 64 L106 44 Q97 58 91 68 L87 44 Q77 59 65 68 Z" fill={hair} stroke="#161620" strokeWidth="3"/>}
    {hairstyle === 'short' && <path d="M53 61 Q47 37 65 27 Q90 13 116 27 Q132 39 127 61 L117 52 L111 42 L98 47 L89 39 L75 50 L64 47 Z" fill={hair} stroke="#161620" strokeWidth="3"/>}
    <path d="M68 33 l9-5 M93 25 l9 4" stroke="#fff" strokeOpacity=".16" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}
export function AvatarPreview({ settings }: { settings: AvatarSettings }) {
  return settings.mode === 'original'
    ? <img className="lv-avatar-image" src="/characters/anime-avatar.png" alt="Original illustrated anime avatar" draggable={false}/>
    : <AvatarSVG settings={settings}/>;
}

