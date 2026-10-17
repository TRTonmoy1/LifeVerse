
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
    <svg
      viewBox="0 0 180 300"
      width="180"
      height="300"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Customizable anime-style character"
    >
      <defs>
        <linearGradient id="hoodieShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".22" />
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity=".35" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="90" cy="287" rx="48" ry="9"
        fill="#08091a" opacity=".35" />

      {/* Cargo pants */}
      <path
        d="M55 168 L125 168 L130 222 L119 272
           L94 272 L90 215 L84 272 L59 272
           L49 222 Z"
        fill="#252938"
        stroke="#111827"
        strokeWidth="3"
      />

      {/* Pants folds */}
      <path d="M62 197 L78 213 L65 231 M116 198 L102 220 L117 236"
        stroke="#465066" strokeWidth="3" fill="none" />

      {/* Cargo pockets */}
      <rect x="49" y="206" width="22" height="28" rx="4"
        fill="#34394b" stroke="#151927" strokeWidth="2" />
      <rect x="110" y="206" width="22" height="28" rx="4"
        fill="#34394b" stroke="#151927" strokeWidth="2" />

      {/* Sneakers */}
      <path d="M58 264 L84 264 L86 281 Q79 289 47 286
               Q42 280 51 272 Z"
        fill="#e9e9f2" stroke="#242637" strokeWidth="3" />
      <path d="M96 264 L122 264 L133 278 Q138 287 126 288
               L96 285 Z"
        fill="#e9e9f2" stroke="#242637" strokeWidth="3" />

      {/* Sneaker details */}
      <path d="M56 277 H79 M102 277 H125"
        stroke="#898da4" strokeWidth="2" />
      <path d="M49 284 H84 M97 285 H132"
        stroke="#35384b" strokeWidth="3" />

      {/* Neck */}
      <rect x="78" y="94" width="24" height="27" rx="8"
        fill={style.skin} stroke="#8a594d" strokeWidth="1.5" />

      {/* Hoodie sleeves */}
      <path d="M61 114 Q43 110 35 131
               L25 179 Q27 191 43 188
               L62 155 Z"
        fill={style.shirt} stroke="#202132" strokeWidth="3" />

      <path d="M119 114 Q137 110 145 131
               L155 179 Q153 191 137 188
               L118 155 Z"
        fill={style.shirt} stroke="#202132" strokeWidth="3" />

      {/* Hands */}
      <ellipse cx="36" cy="183" rx="10" ry="13" fill={style.skin} />
      <ellipse cx="144" cy="183" rx="10" ry="13" fill={style.skin} />

      {/* Hoodie body */}
      <path d="M64 111 Q90 101 116 111
               Q130 132 128 177
               Q91 190 52 177
               Q50 131 64 111 Z"
        fill={style.shirt}
        stroke="#202132"
        strokeWidth="3"
      />

      <path d="M64 111 Q90 101 116 111
               Q130 132 128 177
               Q91 190 52 177
               Q50 131 64 111 Z"
        fill="url(#hoodieShade)"
      />

      {/* Hood and collar */}
      <path d="M64 111 Q90 137 116 111
               L107 128 Q90 143 73 128 Z"
        fill="#292a3a" stroke="#171827" strokeWidth="2" />

      {/* Hoodie strings */}
      <path d="M79 126 L77 153 M101 126 L103 151"
        stroke="#e2ddec" strokeWidth="2.5"
        strokeLinecap="round" />

      {/* Front pocket */}
      <path d="M66 157 Q90 164 114 157
               L118 174 Q90 183 62 174 Z"
        fill="#000000" opacity=".14" />

      {/* Ears */}
      <ellipse cx="53" cy="70" rx="9" ry="13" fill={style.skin} />
      <ellipse cx="127" cy="70" rx="9" ry="13" fill={style.skin} />

      {/* Face */}
      <path d="M55 49 Q58 24 90 24
               Q122 24 125 49
               L123 83 Q118 110 90 113
               Q62 110 57 83 Z"
        fill={style.skin}
        stroke="#82594e"
        strokeWidth="1.5"
      />

      {/* Eyes */}
      <path d="M67 69 Q76 63 84 69 M96 69 Q104 63 113 69"
        fill="none" stroke="#24202b"
        strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="76" cy="73" rx="5" ry="7" fill="#272338" />
      <ellipse cx="104" cy="73" rx="5" ry="7" fill="#272338" />
      <circle cx="78" cy="70" r="1.8" fill="#ffffff" />
      <circle cx="106" cy="70" r="1.8" fill="#ffffff" />

      {/* Nose and smile */}
      <path d="M89 79 L87 84 L92 85"
        stroke="#9d665a" strokeWidth="1.5" fill="none" />
      <path d="M82 94 Q90 98 98 93"
        stroke="#874d4d" strokeWidth="2"
        fill="none" strokeLinecap="round" />

      {/* Messy anime hair */}
      <path
        d="M51 66 L43 50 L53 48 L47 34
           L63 37 L60 22 L76 28
           L84 12 L94 24 L109 15
           L113 30 L130 27 L126 43
           L138 48 L127 64 L119 57
           L112 43 L101 55 L94 41
           L79 59 L76 43 L62 63 Z"
        fill={style.hair}
        stroke="#171827"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Hair highlights */}
      <path d="M63 37 L70 31 M88 25 L95 31 M111 33 L117 40"
        stroke="#ffffff" strokeWidth="3"
        opacity=".18" strokeLinecap="round" />
    </svg>
  );
}
