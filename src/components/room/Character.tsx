
export type CharacterStyle = {
  skin: string;
  shirt: string;
  hair: string;
};

type Props = {
  style: CharacterStyle;
};

export default function Character({ style }: Props) {
  return (
    <svg viewBox="0 0 120 200" width="120" height="200"
      xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="60" cy="190" rx="36" ry="8" fill="#000" opacity=".25" />

      {/* Legs */}
      <rect x="37" y="120" width="20" height="58" rx="8" fill="#26364d" />
      <rect x="63" y="120" width="20" height="58" rx="8" fill="#26364d" />

      {/* Shoes */}
      <rect x="32" y="171" width="28" height="13" rx="6" fill="#fff" />
      <rect x="61" y="171" width="28" height="13" rx="6" fill="#fff" />

      {/* Body */}
      <rect x="28" y="73" width="64" height="65" rx="18" fill={style.shirt} />

      {/* Arms */}
      <rect x="15" y="82" width="16" height="52" rx="8" fill={style.skin} />
      <rect x="89" y="82" width="16" height="52" rx="8" fill={style.skin} />

      {/* Face */}
      <ellipse cx="60" cy="48" rx="30" ry="35" fill={style.skin} />

      {/* Hair */}
      <path d="M30 45 Q23 5 60 10 Q100 5 90 45
               L84 30 Q60 15 36 34 Z" fill={style.hair} />

      {/* Eyes */}
      <circle cx="49" cy="49" r="3" fill="#172033" />
      <circle cx="71" cy="49" r="3" fill="#172033" />

      {/* Smile */}
      <path d="M51 64 Q60 71 69 64" stroke="#55382f"
        strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
