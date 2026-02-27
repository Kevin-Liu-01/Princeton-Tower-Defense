export default function PrincetonTDLogo({
  height = "h-12",
  width = "w-10",
}: {
  height?: string;
  width?: string;
}) {
  return (
    <div className="relative">
      <svg viewBox="0 0 68 76" className={`${width} ${height}`} style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
        <defs>
          {/* Shield body gradient - rich metallic gold */}
          <linearGradient id="shieldMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="20%" stopColor="#fbbf24" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          {/* Inner shield dark field */}
          <linearGradient id="shieldInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a1e10" />
            <stop offset="50%" stopColor="#1a120a" />
            <stop offset="100%" stopColor="#221811" />
          </linearGradient>
          {/* Inner trim gradient */}
          <linearGradient id="innerTrim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          {/* Letter gradient */}
          <linearGradient id="letterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="30%" stopColor="#fcd34d" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          {/* Top highlight gradient */}
          <linearGradient id="topHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
          </linearGradient>
          {/* Radial inner glow */}
          <radialGradient id="innerGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          {/* Subtle glow filter */}
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* === Outer shield shape with thick ornate border === */}
        <path
          d="M36 4 L64 17 L64 44 C64 60 36 76 36 76 C36 76 8 60 8 44 L8 17 Z"
          fill="url(#shieldMain)"
          stroke="#fcd34d"
          strokeWidth="2.5"
        />

        {/* Inner border trim line */}
        <path
          d="M36 9 L59 20 L59 43 C59 56 36 70 36 70 C36 70 13 56 13 43 L13 20 Z"
          fill="none"
          stroke="url(#innerTrim)"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Dark inner field */}
        <path
          d="M36 12 L56 22 L56 42 C56 54 36 66 36 66 C36 66 16 54 16 42 L16 22 Z"
          fill="url(#shieldInner)"
        />

        {/* Inner ambient glow */}
        <path
          d="M36 12 L56 22 L56 42 C56 54 36 66 36 66 C36 66 16 54 16 42 L16 22 Z"
          fill="url(#innerGlow)"
        />

        {/* Ghost inner border */}
        <path
          d="M36 15 L53 24 L53 41 C53 52 36 62 36 62 C36 62 19 52 19 41 L19 24 Z"
          fill="none"
          stroke="#d97706"
          strokeWidth="0.5"
          opacity="0.25"
        />

        {/* Top highlight sheen */}
        <path
          d="M36 12 L56 22 L56 30 C48 28 24 28 16 30 L16 22 Z"
          fill="url(#topHighlight)"
        />

        {/* === Decorative cross lines inside shield === */}
        <line x1="20" y1="28" x2="52" y2="28" stroke="#d97706" strokeWidth="0.4" opacity="0.2" />
        <line x1="18" y1="52" x2="54" y2="52" stroke="#d97706" strokeWidth="0.4" opacity="0.15" />

        {/* === Corner rivets on the trim === */}
        <circle cx="36" cy="10" r="2" fill="#fcd34d" opacity="0.8" />
        <circle cx="36" cy="10" r="1" fill="#f59e0b" opacity="0.5" />
        <circle cx="14" cy="22" r="1.5" fill="#fcd34d" opacity="0.6" />
        <circle cx="58" cy="22" r="1.5" fill="#fcd34d" opacity="0.6" />
        <circle cx="12" cy="38" r="1.2" fill="#fcd34d" opacity="0.5" />
        <circle cx="60" cy="38" r="1.2" fill="#fcd34d" opacity="0.5" />
        <circle cx="36" cy="70" r="1.5" fill="#fcd34d" opacity="0.6" />

        {/* === The "P" letter with glow === */}
        <text
          x="36"
          y="50"
          textAnchor="middle"
          fill="url(#letterGrad)"
          fontSize="34"
          fontWeight="900"
          fontFamily="serif"
          filter="url(#strongGlow)"
        >
          P
        </text>

        {/* === Decorative accents flanking the letter === */}
        {/* Left decorative curl */}
        <path
          d="M20 36 Q22 33 25 35 Q22 37 20 36 Z"
          fill="#f59e0b"
          opacity="0.5"
        />
        <path
          d="M20 48 Q22 45 25 47 Q22 49 20 48 Z"
          fill="#f59e0b"
          opacity="0.4"
        />
        {/* Right decorative curl */}
        <path
          d="M52 36 Q50 33 47 35 Q50 37 52 36 Z"
          fill="#f59e0b"
          opacity="0.5"
        />
        <path
          d="M52 48 Q50 45 47 47 Q50 49 52 48 Z"
          fill="#f59e0b"
          opacity="0.4"
        />

        {/* Small diamond above letter */}
        <path
          d="M36 22 L38 20 L36 18 L34 20 Z"
          fill="#fcd34d"
          opacity="0.7"
          filter="url(#softGlow)"
        />

        {/* Tiny accent dots near letter */}
        <circle cx="25" cy="42" r="0.8" fill="#fcd34d" opacity="0.4" />
        <circle cx="47" cy="42" r="0.8" fill="#fcd34d" opacity="0.4" />



        {/* === Bottom point accent === */}
        <path
          d="M32 72 L36 78 L40 72"
          fill="none"
          stroke="#d97706"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="36" cy="78" r="1" fill="#fbbf24" opacity="0.5" />


      </svg>
    </div>
  );
}
