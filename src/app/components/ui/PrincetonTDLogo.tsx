export default function PrincetonTDLogo({
  height = "h-12",
  width = "w-10",
}: {
  height?: string;
  width?: string;
}) {
  return (
    <div className="relative">
      <svg viewBox="0 0 56 68" className={`${width} ${height} drop-shadow-2xl`}>
        <defs>
          <linearGradient id="shieldMain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="shieldInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#292524" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M28 3 L52 14 L52 38 C52 52 28 65 28 65 C28 65 4 52 4 38 L4 14 Z"
          fill="url(#shieldMain)"
          stroke="#fcd34d"
          strokeWidth="2"
          filter="url(#glow)"
        />
        <path
          d="M28 10 L46 18 L46 36 C46 47 28 57 28 57 C28 57 10 47 10 36 L10 18 Z"
          fill="url(#shieldInner)"
        />
        <text
          x="28"
          y="42"
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="28"
          fontWeight="900"
          fontFamily="serif"
          filter="url(#glow)"
        >
          P
        </text>
      </svg>
    </div>
  );
}
