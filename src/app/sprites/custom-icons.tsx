"use client";
import React, { useId } from "react";

// ---------------------------------------------------------------------------
// Shared types & wrapper
// ---------------------------------------------------------------------------

export type GameIcon = React.ComponentType<{
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}>;

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Svg: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 24,
  className,
  style,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
  >
    {children}
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// SPELL TYPE ICONS — rich gradient-colored icons for spell identity
// ═══════════════════════════════════════════════════════════════════════════

export const CustomFireballIcon: React.FC<IconProps> = (props) => {
  const u = useId();
  return (
    <Svg {...props}>
      <defs>
        <radialGradient id={`${u}-c`} cx="42%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#fffde0" />
          <stop offset="22%" stopColor="#ffdd00" />
          <stop offset="50%" stopColor="#ff8800" />
          <stop offset="78%" stopColor="#dd3300" />
          <stop offset="100%" stopColor="#881100" />
        </radialGradient>
        <radialGradient id={`${u}-g`}>
          <stop offset="0%" stopColor="#ff8800" stopOpacity=".45" />
          <stop offset="100%" stopColor="#ff2200" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11.5" fill={`url(#${u}-g)`} />
      <path d="M12 1Q14.5 5.5 13 8.5 11 5 12 1Z" fill="#ff6600" opacity=".85" />
      <path d="M6 3.5Q8.5 7 8.5 10 6.5 7 6 3.5Z" fill="#ff7700" opacity=".75" />
      <path d="M18 3.5Q15.5 7 15.5 10 17.5 7 18 3.5Z" fill="#ff7700" opacity=".75" />
      <path d="M3 10Q6 12 8 12 5 14 3 10Z" fill="#ee5500" opacity=".55" />
      <path d="M21 10Q18 12 16 12 19 14 21 10Z" fill="#ee5500" opacity=".55" />
      <path d="M6.5 18Q9 15 10 13 8 16.5 6.5 18Z" fill="#dd4400" opacity=".45" />
      <path d="M17.5 18Q15 15 14 13 16 16.5 17.5 18Z" fill="#dd4400" opacity=".45" />
      <circle cx="12" cy="11.5" r="5.8" fill={`url(#${u}-c)`} />
      <path d="M9.5 10Q12 7.5 14.5 10 12 12 9.5 10Z" fill="#fff" opacity=".2" />
      <ellipse cx="10.3" cy="9.8" rx="2" ry="1.4" fill="#fff" opacity=".65" />
      <circle cx="9.8" cy="9.3" r=".7" fill="#fff" opacity=".95" />
      <circle cx="8" cy="2.8" r=".55" fill="#ffcc00" opacity=".9" />
      <circle cx="16.2" cy="2" r=".4" fill="#ffaa00" opacity=".8" />
      <circle cx="4.2" cy="6.5" r=".35" fill="#ffdd00" opacity=".75" />
      <circle cx="19.8" cy="6.8" r=".35" fill="#ffbb00" opacity=".7" />
      <circle cx="12" cy="20.5" r=".3" fill="#ff6600" opacity=".5" />
    </Svg>
  );
};

export const CustomLightningIcon: React.FC<IconProps> = (props) => {
  const u = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${u}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#bbddff" />
          <stop offset="100%" stopColor="#4488ff" />
        </linearGradient>
        <radialGradient id={`${u}-g`}>
          <stop offset="0%" stopColor="#5599ff" stopOpacity=".35" />
          <stop offset="100%" stopColor="#2255aa" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${u}-g)`} />
      <path d="M13.5 1.5 9 10.5 15.5 11.5 10.5 22.5" stroke="#4488ff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity=".25" />
      <path d="M13.5 1.5 9 10.5 15.5 11.5 10.5 22.5" stroke="#7799ee" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity=".6" />
      <path d="M13.5 1.5 9 10.5 15.5 11.5 10.5 22.5" stroke={`url(#${u}-b)`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 1.5 9 10.5 15.5 11.5 10.5 22.5" stroke="#fff" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10.5 5 8 3.5 11.5" stroke="#88bbff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".65" />
      <path d="M9 10.5 5 8 3.5 11.5" stroke="#fff" strokeWidth=".5" strokeLinecap="round" strokeLinejoin="round" opacity=".45" />
      <path d="M15.5 11.5 19.5 14 20.5 10.5" stroke="#88bbff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".65" />
      <path d="M15.5 11.5 19.5 14 20.5 10.5" stroke="#fff" strokeWidth=".5" strokeLinecap="round" strokeLinejoin="round" opacity=".45" />
      <circle cx="13.5" cy="1.5" r="2.5" fill="#aaccff" opacity=".45" />
      <circle cx="13.5" cy="1.5" r="1" fill="#fff" opacity=".8" />
      <circle cx="10.5" cy="22.5" r="3" fill="#5599ff" opacity=".35" />
      <circle cx="10.5" cy="22.5" r="1.2" fill="#fff" opacity=".65" />
      <line x1="5.5" y1="4.5" x2="7" y2="5.5" stroke="#aaccff" strokeWidth=".6" opacity=".5" />
      <line x1="18" y1="5" x2="19" y2="4" stroke="#aaccff" strokeWidth=".6" opacity=".5" />
      <line x1="4" y1="16" x2="5.5" y2="17" stroke="#88bbff" strokeWidth=".5" opacity=".45" />
      <line x1="19" y1="17" x2="20" y2="16" stroke="#88bbff" strokeWidth=".5" opacity=".45" />
    </Svg>
  );
};

export const CustomFreezeIcon: React.FC<IconProps> = (props) => {
  const u = useId();
  return (
    <Svg {...props}>
      <defs>
        <radialGradient id={`${u}-g`}>
          <stop offset="0%" stopColor="#88eeff" stopOpacity=".35" />
          <stop offset="100%" stopColor="#0088bb" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-c`} cx="45%" cy="42%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#ccffff" />
          <stop offset="70%" stopColor="#44ccee" />
          <stop offset="100%" stopColor="#0088aa" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${u}-g)`} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <g key={a} transform={`rotate(${a} 12 12)`}>
          <line x1="12" y1="12" x2="12" y2="2.5" stroke="#66ddff" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="6.5" x2="9.5" y2="4.5" stroke="#88eeff" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="6.5" x2="14.5" y2="4.5" stroke="#88eeff" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="9" x2="10.2" y2="7.8" stroke="#aaf0ff" strokeWidth=".9" strokeLinecap="round" />
          <line x1="12" y1="9" x2="13.8" y2="7.8" stroke="#aaf0ff" strokeWidth=".9" strokeLinecap="round" />
          <path d="M12 1L11 2.5L12 4L13 2.5Z" fill="#ccffff" opacity=".85" />
        </g>
      ))}
      <polygon points="12,8.5 15,10.25 15,13.75 12,15.5 9,13.75 9,10.25" fill={`url(#${u}-c)`} />
      <circle cx="11.5" cy="11.2" r="1.5" fill="#fff" opacity=".55" />
      <circle cx="11.2" cy="10.8" r=".6" fill="#fff" opacity=".85" />
      <path d="M5 5L4.4 5.6L5 6.2L5.6 5.6Z" fill="#bbf0ff" opacity=".6" />
      <path d="M19.5 6L18.9 6.6L19.5 7.2L20.1 6.6Z" fill="#bbf0ff" opacity=".55" />
      <path d="M4.5 17L3.9 17.6L4.5 18.2L5.1 17.6Z" fill="#99eeff" opacity=".5" />
      <path d="M20 18L19.4 18.6L20 19.2L20.6 18.6Z" fill="#99eeff" opacity=".45" />
    </Svg>
  );
};

export const CustomPaydayIcon: React.FC<IconProps> = (props) => {
  const u = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${u}-coin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff5b8" />
          <stop offset="25%" stopColor="#ffd700" />
          <stop offset="55%" stopColor="#ffec8b" />
          <stop offset="80%" stopColor="#daa520" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
        <radialGradient id={`${u}-g`}>
          <stop offset="0%" stopColor="#ffcc00" stopOpacity=".35" />
          <stop offset="100%" stopColor="#996600" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${u}-g)`} />
      {/* Bottom coin */}
      <ellipse cx="12" cy="17.5" rx="8.5" ry="3.5" fill="#8b6914" opacity=".6" />
      <ellipse cx="12" cy="16" rx="8.5" ry="3.5" fill={`url(#${u}-coin)`} />
      <ellipse cx="12" cy="16" rx="8.5" ry="3.5" stroke="#8b6914" strokeWidth=".8" fill="none" />
      <ellipse cx="12" cy="16" rx="6" ry="2.5" stroke="#8b6914" strokeWidth=".5" fill="none" opacity=".5" />
      {/* Middle coin */}
      <ellipse cx="12" cy="13.5" rx="8.5" ry="3.5" fill="#a67c00" opacity=".5" />
      <ellipse cx="12" cy="12" rx="8.5" ry="3.5" fill={`url(#${u}-coin)`} />
      <ellipse cx="12" cy="12" rx="8.5" ry="3.5" stroke="#8b6914" strokeWidth=".8" fill="none" />
      <ellipse cx="12" cy="12" rx="6" ry="2.5" stroke="#8b6914" strokeWidth=".5" fill="none" opacity=".5" />
      {/* Top coin */}
      <ellipse cx="12" cy="9.5" rx="8.5" ry="3.5" fill="#a67c00" opacity=".5" />
      <ellipse cx="12" cy="8" rx="8.5" ry="3.5" fill={`url(#${u}-coin)`} />
      <ellipse cx="12" cy="8" rx="8.5" ry="3.5" stroke="#8b6914" strokeWidth=".8" fill="none" />
      <ellipse cx="12" cy="8" rx="6" ry="2.5" stroke="#8b6914" strokeWidth=".5" fill="none" opacity=".5" />
      <text x="12" y="9" textAnchor="middle" dominantBaseline="central" fill="#6b4e12" fontSize="6" fontWeight="bold" fontFamily="Georgia, serif">$</text>
      <ellipse cx="10" cy="7" rx="3" ry="1" fill="#fff" opacity=".3" />
      {/* Sparkles */}
      <path d="M3 6L2.5 7L3 8L3.5 7Z" fill="#ffee88" opacity=".85" />
      <line x1="2" y1="7" x2="4" y2="7" stroke="#ffee88" strokeWidth=".4" opacity=".7" />
      <path d="M21 5L20.5 6L21 7L21.5 6Z" fill="#ffee88" opacity=".8" />
      <line x1="20" y1="6" x2="22" y2="6" stroke="#ffee88" strokeWidth=".4" opacity=".65" />
      <path d="M19 19L18.5 20L19 21L19.5 20Z" fill="#ffdd66" opacity=".7" />
      <line x1="18" y1="20" x2="20" y2="20" stroke="#ffdd66" strokeWidth=".4" opacity=".6" />
      <path d="M5 20L4.5 21L5 22L5.5 21Z" fill="#ffdd66" opacity=".65" />
    </Svg>
  );
};

export const CustomReinforcementsIcon: React.FC<IconProps> = (props) => {
  const u = useId();
  return (
    <Svg {...props}>
      <defs>
        <radialGradient id={`${u}-g`}>
          <stop offset="0%" stopColor="#aa66ff" stopOpacity=".3" />
          <stop offset="100%" stopColor="#5522aa" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-sw`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="50%" stopColor="#c0c0c0" />
          <stop offset="100%" stopColor="#888888" />
        </linearGradient>
        <linearGradient id={`${u}-sh`} x1=".3" y1="0" x2=".7" y2="1">
          <stop offset="0%" stopColor="#bb88ff" />
          <stop offset="50%" stopColor="#8855dd" />
          <stop offset="100%" stopColor="#5533aa" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${u}-g)`} />
      <circle cx="12" cy="12" r="10.5" stroke="#9966ff" strokeWidth="1" opacity=".4" fill="none" />
      <circle cx="12" cy="12" r="9" stroke="#7744cc" strokeWidth=".5" opacity=".25" fill="none" strokeDasharray="2 3" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <circle
            key={a}
            cx={12 + Math.cos(rad) * 10.5}
            cy={12 + Math.sin(rad) * 10.5}
            r="1"
            fill="#bb88ff"
            opacity=".65"
          />
        );
      })}
      {/* Left sword */}
      <line x1="6" y1="5" x2="16" y2="19" stroke={`url(#${u}-sw)`} strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="5" x2="16" y2="19" stroke="#fff" strokeWidth=".5" strokeLinecap="round" opacity=".4" />
      <line x1="14" y1="17" x2="17" y2="15" stroke="#8b4513" strokeWidth="1.8" strokeLinecap="round" />
      {/* Right sword */}
      <line x1="18" y1="5" x2="8" y2="19" stroke={`url(#${u}-sw)`} strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="5" x2="8" y2="19" stroke="#fff" strokeWidth=".5" strokeLinecap="round" opacity=".4" />
      <line x1="10" y1="17" x2="7" y2="15" stroke="#8b4513" strokeWidth="1.8" strokeLinecap="round" />
      {/* Central shield */}
      <path d="M12 7Q16 8 16.5 12Q16 16 12 19Q8 16 7.5 12Q8 8 12 7Z" fill={`url(#${u}-sh)`} stroke="#aa88ee" strokeWidth=".8" />
      <line x1="12" y1="8.5" x2="12" y2="17" stroke="#cc99ff" strokeWidth=".8" opacity=".5" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="#cc99ff" strokeWidth=".8" opacity=".5" />
      <path d="M12 8Q14 9 14.5 12Q14 11 12 8Z" fill="#fff" opacity=".2" />
      <circle cx="5" cy="10" r=".6" fill="#cc99ff" opacity=".6" />
      <circle cx="19" cy="10" r=".5" fill="#cc99ff" opacity=".55" />
      <circle cx="12" cy="3" r=".5" fill="#bb88ff" opacity=".5" />
    </Svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE BUTTON ICONS — detailed gradient icons for mobile world-map buttons
// ═══════════════════════════════════════════════════════════════════════════

export const SpellOrbIcon: React.FC<IconProps & { active?: boolean }> = ({
  active = true,
  ...props
}) => {
  const u = useId();
  return (
    <Svg {...props}>
      <defs>
        <radialGradient id={`${u}-orb`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor={active ? "#f5e6ff" : "#c0aad0"} />
          <stop offset="20%" stopColor={active ? "#d8b4fe" : "#9878b0"} />
          <stop offset="48%" stopColor={active ? "#a855f7" : "#6a3a90"} />
          <stop offset="76%" stopColor={active ? "#7c3aed" : "#4a2878"} />
          <stop offset="100%" stopColor={active ? "#4c1d95" : "#2e1258"} />
        </radialGradient>
        <radialGradient id={`${u}-aura`}>
          <stop offset="0%" stopColor="#a855f7" stopOpacity={active ? ".38" : ".10"} />
          <stop offset="55%" stopColor="#7c3aed" stopOpacity={active ? ".14" : ".04"} />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-wisp`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e879f9" stopOpacity=".55" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Aura */}
      <circle cx="12" cy="11.5" r="11.5" fill={`url(#${u}-aura)`} />

      {/* Orbit rings */}
      <ellipse cx="12" cy="11.5" rx="10.5" ry="3.8"
        stroke={active ? "#c084fc" : "#7858a0"} strokeWidth=".45" opacity={active ? ".30" : ".12"}
        fill="none" transform="rotate(-28 12 11.5)" />
      <ellipse cx="12" cy="11.5" rx="11" ry="4.2"
        stroke={active ? "#a855f7" : "#6848a0"} strokeWidth=".35" opacity={active ? ".22" : ".08"}
        fill="none" transform="rotate(38 12 11.5)" />

      {/* Shadow beneath orb */}
      <ellipse cx="12" cy="19.8" rx="4.5" ry="1" fill="#3b0764" opacity={active ? ".30" : ".12"} />

      {/* Main orb */}
      <circle cx="12" cy="11" r="7.8" fill={`url(#${u}-orb)`} />

      {/* Glass rim — double ring */}
      <circle cx="12" cy="11" r="7.8" stroke={active ? "#c084fc" : "#7858a0"} strokeWidth=".7" fill="none" opacity=".55" />
      <circle cx="12" cy="11" r="7.2" stroke={active ? "#e8d5ff" : "#a898c0"} strokeWidth=".28" fill="none" opacity=".20" />

      {/* Inner energy wisps */}
      <path d="M9.5 13Q12 8 14.8 12Q12 15.5 9.5 13Z" fill={`url(#${u}-wisp)`} />
      <path d="M10 9Q14 10.8 11.5 14Q8.5 12 10 9Z" fill={active ? "#e879f9" : "#a060b8"} opacity=".18" />

      {/* Arcane star at orb centre */}
      <path d="M12 7.8L12.7 10.1L15 10.1L13.1 11.4L13.7 13.6L12 12.4L10.3 13.6L10.9 11.4L9 10.1L11.3 10.1Z"
        fill={active ? "#f0e0ff" : "#b8a0d0"} opacity={active ? ".50" : ".20"} />

      {/* Specular highlights */}
      <ellipse cx="10" cy="8.2" rx="3.4" ry="2" fill="white" opacity={active ? ".38" : ".12"} />
      <ellipse cx="9.5" cy="7.6" rx="1.6" ry=".85" fill="white" opacity={active ? ".68" : ".22"} />

      {/* Bottom rim catch-light */}
      <path d="M8.5 16Q12 17.6 15.5 16" stroke={active ? "#c084fc" : "#7858a0"} strokeWidth=".4" fill="none" opacity=".25" />

      {/* Orbiting particles */}
      <circle cx="4.2" cy="7.5" r=".85" fill={active ? "#c084fc" : "#7858a0"} opacity={active ? ".72" : ".26"} />
      <circle cx="19.8" cy="9.5" r=".65" fill={active ? "#e879f9" : "#a060b8"} opacity={active ? ".62" : ".22"} />
      <circle cx="5" cy="16.5" r=".55" fill={active ? "#a855f7" : "#6848a0"} opacity={active ? ".50" : ".18"} />
      <circle cx="18.5" cy="15.8" r=".72" fill={active ? "#d8b4fe" : "#9080b0"} opacity={active ? ".56" : ".20"} />
      <circle cx="6.8" cy="4" r=".48" fill={active ? "#e8d5ff" : "#b0a0c0"} opacity={active ? ".46" : ".16"} />
      <circle cx="17" cy="4.5" r=".52" fill={active ? "#c084fc" : "#7858a0"} opacity={active ? ".42" : ".15"} />

      {/* 4-pointed sparkle accents */}
      <path d="M3.2 12L2.7 13L3.2 14L3.7 13Z" fill={active ? "#e8d5ff" : "#b0a0c0"} opacity={active ? ".62" : ".22"} />
      <path d="M20.8 6.5L20.3 7.5L20.8 8.5L21.3 7.5Z" fill={active ? "#d8b4fe" : "#9080b0"} opacity={active ? ".55" : ".18"} />
      <path d="M15 20L14.5 21L15 22L15.5 21Z" fill={active ? "#c084fc" : "#7858a0"} opacity={active ? ".45" : ".15"} />
    </Svg>
  );
};

export const EnchantedAnvilIcon: React.FC<IconProps & { active?: boolean }> = ({
  active = true,
  ...props
}) => {
  const u = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${u}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={active ? "#d4d4d8" : "#636370"} />
          <stop offset="35%" stopColor={active ? "#a1a1aa" : "#4a4a54"} />
          <stop offset="70%" stopColor={active ? "#71717a" : "#383840"} />
          <stop offset="100%" stopColor={active ? "#52525b" : "#28282e"} />
        </linearGradient>
        <radialGradient id={`${u}-glow`} cx="50%" cy="38%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={active ? ".42" : ".10"} />
          <stop offset="70%" stopColor="#d97706" stopOpacity={active ? ".12" : ".03"} />
          <stop offset="100%" stopColor="#92400e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-star`} cx="45%" cy="40%">
          <stop offset="0%" stopColor={active ? "#fef9c3" : "#8a7520"} />
          <stop offset="40%" stopColor={active ? "#fbbf24" : "#7a6418"} />
          <stop offset="100%" stopColor={active ? "#d97706" : "#5a4810"} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-wood`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={active ? "#92400e" : "#4e2408"} />
          <stop offset="50%" stopColor={active ? "#b45309" : "#6a380c"} />
          <stop offset="100%" stopColor={active ? "#78350f" : "#42200a"} />
        </linearGradient>
      </defs>

      {/* Forge glow backdrop */}
      <circle cx="12" cy="10" r="11" fill={`url(#${u}-glow)`} />

      {/* Anvil pedestal */}
      <path d="M7.5 19H16.5V21C16.5 21.4 16.1 21.8 15.6 21.8H8.4C7.9 21.8 7.5 21.4 7.5 21V19Z"
        fill={`url(#${u}-metal)`} />
      <rect x="7.8" y="19" width="8.4" height=".5" rx=".25" fill={active ? "#d4d4d8" : "#636370"} opacity=".30" />

      {/* Anvil body */}
      <path d="M5.5 15H18.5L17.5 19H6.5L5.5 15Z" fill={`url(#${u}-metal)`} />
      <line x1="7.2" y1="17" x2="16.8" y2="17" stroke={active ? "#52525b" : "#28282e"} strokeWidth=".45" opacity=".35" />

      {/* Anvil working surface */}
      <path d="M4.5 13H19.5L18.5 15H5.5L4.5 13Z" fill={active ? "#a1a1aa" : "#4a4a54"} />
      <path d="M4.5 13H19.5L19 13.7H5L4.5 13Z" fill={active ? "#d4d4d8" : "#636370"} opacity=".50" />

      {/* Left horn */}
      <path d="M2 13.2L4.5 12.5V13.8L2.2 14Z" fill={active ? "#71717a" : "#383840"} />
      <path d="M2.2 13.2L4.5 12.5V13L2.4 13.5Z" fill={active ? "#a1a1aa" : "#4a4a54"} opacity=".40" />

      {/* Right heel */}
      <path d="M22 13.5L19.5 12.5V13.8L21.8 14.2Z" fill={active ? "#71717a" : "#383840"} />

      {/* Impact shockwave rings on anvil surface */}
      <ellipse cx="12" cy="12.8" rx="6" ry="1.5" stroke={active ? "#fde047" : "#7a5c12"} strokeWidth=".5" fill="none" opacity={active ? ".28" : ".08"} />
      <ellipse cx="12" cy="12.8" rx="4" ry="1" stroke={active ? "#fbbf24" : "#7a5c12"} strokeWidth=".5" fill="none" opacity={active ? ".40" : ".12"} />

      {/* Impact energy burst — larger and brighter */}
      <ellipse cx="12" cy="12.5" rx="4.2" ry="2.2" fill={`url(#${u}-star)`} opacity={active ? ".82" : ".24"} />

      {/* Forged star at impact point */}
      <path d="M12 9.8L12.7 11.5L14.8 11.5L13 12.6L13.6 14.5L12 13.4L10.4 14.5L11 12.6L9.2 11.5L11.3 11.5Z"
        fill={active ? "#fef3c7" : "#7a6820"} opacity={active ? ".90" : ".30"} />
      <path d="M12 10.5L12.45 11.5L13.6 11.5L12.6 12.2L13 13.2L12 12.6L11 13.2L11.4 12.2L10.4 11.5L11.55 11.5Z"
        fill={active ? "#fffbeb" : "#8a7828"} opacity={active ? ".55" : ".15"} />

      {/* Hammer — head + handle aligned at 45°, tip touching anvil */}
      <g transform="rotate(45 12 8)">
        {/* Handle */}
        <rect x="11" y="0" width="2" height="8" rx=".9" fill={`url(#${u}-wood)`} />
        <line x1="11.4" y1="1" x2="11.4" y2="7" stroke={active ? "#6b3410" : "#38200a"} strokeWidth=".28" opacity=".40" />
        {/* Head */}
        <rect x="7.5" y="6.8" width="9" height="3.2" rx="1" fill={`url(#${u}-metal)`} />
        <rect x="7.5" y="6.8" width="9" height="3.2" rx="1" stroke={active ? "#52525b" : "#28282e"} strokeWidth=".45" fill="none" opacity=".50" />
        <rect x="8" y="7.1" width="8" height=".85" rx=".42" fill={active ? "#d4d4d8" : "#636370"} opacity=".35" />
      </g>

      {/* Motion / speed lines trailing the swing arc (upper-right) */}
      <path d="M20.5 0Q23 2 23 5.5" stroke={active ? "#fde047" : "#7a5c12"} strokeWidth=".5" fill="none" opacity={active ? ".35" : ".10"} strokeLinecap="round" />
      <path d="M19.5 0.5Q21.5 2.5 21.5 5" stroke={active ? "#fbbf24" : "#7a5c12"} strokeWidth=".45" fill="none" opacity={active ? ".30" : ".08"} strokeLinecap="round" />
      <path d="M18.5 1Q20 2.5 20 4.5" stroke={active ? "#fcd34d" : "#8a7014"} strokeWidth=".4" fill="none" opacity={active ? ".25" : ".07"} strokeLinecap="round" />

      {/* Sparks flying from impact — radiating outward */}
      <circle cx="6" cy="10" r=".7" fill={active ? "#fbbf24" : "#7a5c12"} opacity={active ? ".80" : ".25"} />
      <circle cx="18.5" cy="9.5" r=".6" fill={active ? "#fde047" : "#8a7014"} opacity={active ? ".72" : ".22"} />
      <circle cx="4.5" cy="8" r=".5" fill={active ? "#fcd34d" : "#8a7014"} opacity={active ? ".60" : ".18"} />
      <circle cx="20" cy="7.5" r=".52" fill={active ? "#fbbf24" : "#7a5c12"} opacity={active ? ".55" : ".18"} />
      <circle cx="7" cy="6.5" r=".42" fill={active ? "#fef3c7" : "#7a5c12"} opacity={active ? ".50" : ".15"} />
      <circle cx="17.5" cy="6" r=".45" fill={active ? "#fde047" : "#8a7014"} opacity={active ? ".48" : ".14"} />

      {/* Spark trails radiating from strike */}
      <line x1="10" y1="12" x2="5" y2="8.5" stroke={active ? "#fde047" : "#7a5c12"} strokeWidth=".4" opacity={active ? ".42" : ".12"} strokeLinecap="round" />
      <line x1="14" y1="12" x2="19.5" y2="8" stroke={active ? "#fbbf24" : "#7a5c12"} strokeWidth=".4" opacity={active ? ".38" : ".10"} strokeLinecap="round" />
      <line x1="11" y1="11.5" x2="7" y2="6" stroke={active ? "#fcd34d" : "#8a7014"} strokeWidth=".35" opacity={active ? ".32" : ".09"} strokeLinecap="round" />
      <line x1="13.5" y1="11.5" x2="18" y2="5.5" stroke={active ? "#fcd34d" : "#8a7014"} strokeWidth=".35" opacity={active ? ".28" : ".08"} strokeLinecap="round" />

      {/* 4-pointed sparkle accents */}
      <path d="M2.5 5.5L2 6.5L2.5 7.5L3 6.5Z" fill={active ? "#fef3c7" : "#7a5c12"} opacity={active ? ".65" : ".20"} />
      <line x1="1.5" y1="6.5" x2="3.5" y2="6.5" stroke={active ? "#fef3c7" : "#7a5c12"} strokeWidth=".3" opacity={active ? ".45" : ".14"} />
      <path d="M21 4L20.5 5L21 6L21.5 5Z" fill={active ? "#fcd34d" : "#8a7014"} opacity={active ? ".58" : ".17"} />
      <line x1="20" y1="5" x2="22" y2="5" stroke={active ? "#fcd34d" : "#8a7014"} strokeWidth=".3" opacity={active ? ".40" : ".12"} />
    </Svg>
  );
};

export const HeroHelmetIcon: React.FC<IconProps & { active?: boolean }> = ({
  active = true,
  ...props
}) => {
  const u = useId();
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id={`${u}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={active ? "#e4e4e7" : "#636370"} />
          <stop offset="30%" stopColor={active ? "#a1a1aa" : "#4a4a54"} />
          <stop offset="65%" stopColor={active ? "#71717a" : "#383840"} />
          <stop offset="100%" stopColor={active ? "#3f3f46" : "#1e1e22"} />
        </linearGradient>
        <linearGradient id={`${u}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={active ? "#fde68a" : "#7a6418"} />
          <stop offset="50%" stopColor={active ? "#f59e0b" : "#6a5014"} />
          <stop offset="100%" stopColor={active ? "#b45309" : "#4a3410"} />
        </linearGradient>
        <radialGradient id={`${u}-glow`} cx="50%" cy="30%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={active ? ".30" : ".08"} />
          <stop offset="60%" stopColor="#d97706" stopOpacity={active ? ".10" : ".03"} />
          <stop offset="100%" stopColor="#92400e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-plume`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={active ? "#ef4444" : "#7a2020"} />
          <stop offset="40%" stopColor={active ? "#dc2626" : "#6a1818"} />
          <stop offset="100%" stopColor={active ? "#991b1b" : "#4a1010"} />
        </linearGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="12" cy="11" r="11" fill={`url(#${u}-glow)`} />

      {/* Helmet dome */}
      <path d="M5.5 13C5.5 7.5 8 3.5 12 3.5C16 3.5 18.5 7.5 18.5 13"
        fill={`url(#${u}-steel)`} />

      {/* Central ridge / crest */}
      <path d="M12 3.5V13" stroke={active ? "#d4d4d8" : "#636370"} strokeWidth="1.2" opacity=".45" />
      <path d="M12 3.5L12.6 13H11.4Z" fill={active ? "#e4e4e7" : "#6a6a72"} opacity=".20" />

      {/* Dome highlight */}
      <path d="M8 6Q10 4.5 12 4.2Q10 5 8.5 8Z" fill="white" opacity={active ? ".35" : ".10"} />
      <ellipse cx="9.5" cy="6" rx="1.8" ry="1" fill="white" opacity={active ? ".18" : ".05"} />

      {/* Dome rim shine */}
      <path d="M5.5 13Q12 14 18.5 13" stroke={active ? "#e4e4e7" : "#636370"} strokeWidth=".5" opacity=".30" fill="none" />

      {/* Gold crown band */}
      <path d="M5 12.5H19V14.5H5Z" fill={`url(#${u}-gold)`} />
      <path d="M5 12.5H19V13.2H5Z" fill={active ? "#fde68a" : "#7a6418"} opacity=".40" />

      {/* Band gem — centre diamond */}
      <path d="M12 12.2L13 13.5L12 14.8L11 13.5Z" fill={active ? "#38bdf8" : "#1a5070"} />
      <path d="M12 12.6L12.5 13.5L12 14.2L11.5 13.5Z" fill={active ? "#7dd3fc" : "#2a6080"} opacity=".60" />

      {/* Band rivets */}
      <circle cx="7.5" cy="13.5" r=".55" fill={active ? "#fef3c7" : "#6a5818"} opacity={active ? ".75" : ".25"} />
      <circle cx="16.5" cy="13.5" r=".55" fill={active ? "#fef3c7" : "#6a5818"} opacity={active ? ".75" : ".25"} />

      {/* Visor / face guard */}
      <path d="M6.5 14.5H17.5V16.8C17.5 16.8 16 17.5 12 17.5C8 17.5 6.5 16.8 6.5 16.8V14.5Z"
        fill={active ? "#52525b" : "#28282e"} />

      {/* Eye slit */}
      <path d="M7.5 15.3H16.5V16.2H7.5Z" fill={active ? "#18181b" : "#0e0e10"} />
      <path d="M7.5 15.3H16.5V15.7H7.5Z" fill={active ? "#27272a" : "#18181a"} opacity=".60" />
      {/* Visor brow ridge */}
      <path d="M7 15.1H17" stroke={active ? "#a1a1aa" : "#4a4a54"} strokeWidth=".4" opacity=".45" />

      {/* Eye glow */}
      <ellipse cx="9.5" cy="15.75" rx="1.2" ry=".35" fill={active ? "#fbbf24" : "#5a4410"} opacity={active ? ".70" : ".20"} />
      <ellipse cx="14.5" cy="15.75" rx="1.2" ry=".35" fill={active ? "#fbbf24" : "#5a4410"} opacity={active ? ".70" : ".20"} />

      {/* Nose guard */}
      <line x1="12" y1="14.5" x2="12" y2="17.2" stroke={active ? "#71717a" : "#383840"} strokeWidth=".9" />
      <line x1="12" y1="14.5" x2="12" y2="17.2" stroke={active ? "#a1a1aa" : "#4a4a54"} strokeWidth=".3" opacity=".50" />

      {/* Chainmail curtain below visor */}
      <g opacity={active ? ".50" : ".18"}>
        {[0, 1, 2, 3].map((row) => (
          <g key={row}>
            {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((col) => (
              <circle
                key={col}
                cx={12 + col * 0.95 + (row % 2 ? 0.47 : 0)}
                cy={17.8 + row * 0.8}
                r=".38"
                stroke={active ? "#a1a1aa" : "#4a4a54"}
                strokeWidth=".22"
                fill="none"
              />
            ))}
          </g>
        ))}
      </g>
      {/* Chainmail shadow fade */}
      <path d="M8.5 17.5H15.5V21H8.5Z" fill={active ? "#3f3f46" : "#1e1e22"} opacity=".15" />

      {/* Left cheek guard — layered plate */}
      <path d="M4.2 14H6.5V17.5L5.2 18.5L4.2 17Z" fill={`url(#${u}-steel)`} />
      <path d="M4.2 14H6.5V14.8H4.5Z" fill={active ? "#d4d4d8" : "#636370"} opacity=".30" />
      <path d="M4.5 15.5L6.3 15.5" stroke={active ? "#52525b" : "#28282e"} strokeWidth=".3" opacity=".40" />
      <path d="M4.8 16.8L6.3 16.8" stroke={active ? "#52525b" : "#28282e"} strokeWidth=".3" opacity=".35" />
      <circle cx="5.5" cy="15" r=".35" fill={active ? "#fef3c7" : "#6a5818"} opacity={active ? ".65" : ".20"} />
      <circle cx="5.5" cy="17" r=".3" fill={active ? "#fef3c7" : "#6a5818"} opacity={active ? ".50" : ".15"} />
      {/* Left guard edge highlight */}
      <path d="M4.2 14L4.2 17L5.2 18.5" stroke={active ? "#a1a1aa" : "#4a4a54"} strokeWidth=".3" opacity=".35" fill="none" />

      {/* Right cheek guard — layered plate */}
      <path d="M19.8 14H17.5V17.5L18.8 18.5L19.8 17Z" fill={`url(#${u}-steel)`} />
      <path d="M19.8 14H17.5V14.8H19.5Z" fill={active ? "#d4d4d8" : "#636370"} opacity=".30" />
      <path d="M19.5 15.5L17.7 15.5" stroke={active ? "#52525b" : "#28282e"} strokeWidth=".3" opacity=".40" />
      <path d="M19.2 16.8L17.7 16.8" stroke={active ? "#52525b" : "#28282e"} strokeWidth=".3" opacity=".35" />
      <circle cx="18.5" cy="15" r=".35" fill={active ? "#fef3c7" : "#6a5818"} opacity={active ? ".65" : ".20"} />
      <circle cx="18.5" cy="17" r=".3" fill={active ? "#fef3c7" : "#6a5818"} opacity={active ? ".50" : ".15"} />
      {/* Right guard edge highlight */}
      <path d="M19.8 14L19.8 17L18.8 18.5" stroke={active ? "#a1a1aa" : "#4a4a54"} strokeWidth=".3" opacity=".35" fill="none" />

      {/* Chin guard — curved plate */}
      <path d="M8 17.5Q10 18.5 12 18.8Q14 18.5 16 17.5L15.5 18.5Q12 20 8.5 18.5Z"
        fill={active ? "#52525b" : "#28282e"} />
      <path d="M9 18Q12 19.2 15 18" stroke={active ? "#71717a" : "#383840"} strokeWidth=".35" fill="none" opacity=".50" />

      {/* Plume */}
      <path d="M12 3.5Q13.5 1 16 0.5Q14.5 2 14 3.5Q13.5 1.5 15 0.8Q13 2 12.5 3.5"
        fill={`url(#${u}-plume)`} opacity={active ? ".90" : ".30"} />
      <path d="M12 3.5Q13 1.8 14.5 1.2Q13.2 2.5 13 3.5"
        fill={active ? "#fca5a5" : "#8a3838"} opacity={active ? ".35" : ".10"} />

      {/* Plume wind wisps */}
      <path d="M15 1Q16.5 0.5 18 1" stroke={active ? "#ef4444" : "#5a1818"} strokeWidth=".4" fill="none" opacity={active ? ".45" : ".12"} />
      <path d="M14.5 2Q16 1 17.5 1.5" stroke={active ? "#dc2626" : "#5a1818"} strokeWidth=".35" fill="none" opacity={active ? ".35" : ".10"} />

      {/* Ambient sparkles */}
      <circle cx="4" cy="8" r=".5" fill={active ? "#fde68a" : "#5a4818"} opacity={active ? ".55" : ".15"} />
      <circle cx="20" cy="7" r=".45" fill={active ? "#fbbf24" : "#5a4818"} opacity={active ? ".48" : ".12"} />
      <path d="M3 15L2.5 16L3 17L3.5 16Z" fill={active ? "#fde68a" : "#5a4818"} opacity={active ? ".42" : ".12"} />
      <path d="M21 14L20.5 15L21 16L21.5 15Z" fill={active ? "#fbbf24" : "#5a4818"} opacity={active ? ".38" : ".10"} />
    </Svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// UPGRADE CONCEPT ICONS — currentColor-based, themed for game upgrades
// ═══════════════════════════════════════════════════════════════════════════

export const DamageUpIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 1C12 1 18 8 18 14C18 18 15.5 21 12 23C8.5 21 6 18 6 14C6 8 12 1 12 1Z" fill="currentColor" opacity=".12" />
    <path d="M12 4C12 4 16 9 16 13.5C16 16.5 14 19 12 20C10 19 8 16.5 8 13.5C8 9 12 4 12 4Z" fill="currentColor" />
    <path d="M12 8.5C12 8.5 14 11 14 13C14 14.5 13.2 15.5 12 16C10.8 15.5 10 14.5 10 13C10 11 12 8.5 12 8.5Z" fill="currentColor" opacity=".35" />
    <circle cx="12" cy="11.5" r="1.2" fill="currentColor" opacity=".25" />
  </Svg>
);

export const PrecisionIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" opacity=".25" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" opacity=".6" />
    <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    <line x1="12" y1="1.5" x2="12" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="12" y1="18" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="1.5" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="18" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const DurationIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7 3H17V3L12 12L17 21H7L12 12L7 3Z" fill="currentColor" opacity=".1" />
    <path d="M7 2H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M7 22H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M8 3L8 7.5L12 12L8 16.5L8 21" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M16 3L16 7.5L12 12L16 16.5L16 21" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M9 18L12 14L15 18V20H9V18Z" fill="currentColor" opacity=".45" />
    <path d="M9 4H15V6L12 9L9 6V4Z" fill="currentColor" opacity=".25" />
    <circle cx="12" cy="12" r=".8" fill="currentColor" opacity=".5" />
  </Svg>
);

export const PowerUpIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M13 1L5 13H12L11 23L19 11H12L13 1Z" fill="currentColor" opacity=".12" />
    <path d="M13 2L6 13H12.5L11 22L18 11H11.5L13 2Z" fill="currentColor" />
    <path d="M13.5 4L9 12H12.5L12 18L16 12H13L13.5 4Z" fill="currentColor" opacity=".3" />
    <line x1="4" y1="8" x2="5.5" y2="9" stroke="currentColor" strokeWidth=".8" opacity=".35" />
    <line x1="18.5" y1="15" x2="20" y2="14" stroke="currentColor" strokeWidth=".8" opacity=".35" />
  </Svg>
);

export const MasteryIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 18L5.5 7L9.5 12L12 5L14.5 12L18.5 7L21 18Z" fill="currentColor" opacity=".12" />
    <path d="M3 18L5.5 7L9.5 12L12 5L14.5 12L18.5 7L21 18Z" fill="currentColor" />
    <rect x="3" y="18" width="18" height="3" rx="1" fill="currentColor" />
    <circle cx="12" cy="8" r="1.2" fill="currentColor" opacity=".3" />
    <circle cx="9.5" cy="13" r=".8" fill="currentColor" opacity=".3" />
    <circle cx="14.5" cy="13" r=".8" fill="currentColor" opacity=".3" />
    <line x1="5" y1="19" x2="19" y2="19" stroke="currentColor" strokeWidth=".5" opacity=".3" />
  </Svg>
);

export const BranchIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity=".15" />
    <circle cx="12" cy="4" r="1.5" fill="currentColor" />
    <line x1="12" y1="6.5" x2="12" y2="14" stroke="currentColor" strokeWidth="2" />
    <path d="M12 14Q12 18 7 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M12 14Q12 18 17 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="7" cy="20" r="1.8" fill="currentColor" opacity=".15" />
    <circle cx="7" cy="20" r="1.2" fill="currentColor" />
    <circle cx="17" cy="20" r="1.8" fill="currentColor" opacity=".15" />
    <circle cx="17" cy="20" r="1.2" fill="currentColor" />
  </Svg>
);

export const ChainLinkIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M10 7H14C16.8 7 19 9.2 19 12C19 14.8 16.8 17 14 17H10" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M14 7H10C7.2 7 5 9.2 5 12C5 14.8 7.2 17 10 17H14" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <circle cx="14.5" cy="12" r="1" fill="currentColor" opacity=".3" />
    <circle cx="9.5" cy="12" r="1" fill="currentColor" opacity=".3" />
    <line x1="10" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1" opacity=".25" />
  </Svg>
);

export const FrostUpIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <g key={a} transform={`rotate(${a} 12 12)`}>
        <line x1="12" y1="12" x2="12" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="6" x2="9.5" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="6" x2="14.5" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    ))}
    <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity=".25" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </Svg>
);

export const FortifyIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 2L20 6V12C20 17 16.5 20.5 12 22C7.5 20.5 4 17 4 12V6L12 2Z" fill="currentColor" opacity=".12" />
    <path d="M12 3L19 6.5V12C19 16.5 16 19.5 12 21C8 19.5 5 16.5 5 12V6.5L12 3Z" fill="currentColor" />
    <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="1" opacity=".3" />
    <line x1="6.5" y1="11" x2="17.5" y2="11" stroke="currentColor" strokeWidth="1" opacity=".3" />
    <path d="M12 4L17 7V11C17 11 16 8 12 4Z" fill="currentColor" opacity=".2" />
  </Svg>
);

export const AreaIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity=".2" />
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M12 1L10.5 3.5H13.5Z" fill="currentColor" opacity=".5" />
    <path d="M12 23L10.5 20.5H13.5Z" fill="currentColor" opacity=".5" />
    <path d="M1 12L3.5 10.5V13.5Z" fill="currentColor" opacity=".5" />
    <path d="M23 12L20.5 10.5V13.5Z" fill="currentColor" opacity=".5" />
  </Svg>
);

export const GoldIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor" opacity=".12" />
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity=".15" />
    <text x="12" y="13" textAnchor="middle" dominantBaseline="central" fill="currentColor" fontSize="7" fontWeight="bold" fontFamily="Georgia,serif">$</text>
    <circle cx="5.5" cy="8" r="1" fill="currentColor" opacity=".3" />
    <circle cx="18.5" cy="8" r="1" fill="currentColor" opacity=".3" />
    <circle cx="5.5" cy="16" r="1" fill="currentColor" opacity=".3" />
    <circle cx="18.5" cy="16" r="1" fill="currentColor" opacity=".3" />
  </Svg>
);

export const GrowthIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 18L9 12L13 15L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M3 18L9 12L13 15L21 6V18H3Z" fill="currentColor" opacity=".1" />
    <path d="M16 6H21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="21" cy="6" r="1.5" fill="currentColor" opacity=".4" />
  </Svg>
);

export const GemIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 3H18L22 9L12 22L2 9L6 3Z" fill="currentColor" opacity=".12" />
    <path d="M6 3H18L22 9L12 22L2 9L6 3Z" fill="currentColor" />
    <path d="M6 3L9 9L12 3L15 9L18 3" stroke="currentColor" strokeWidth=".7" opacity=".3" fill="none" />
    <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth=".7" opacity=".3" />
    <path d="M9 9L12 22L15 9" stroke="currentColor" strokeWidth=".7" opacity=".3" fill="none" />
    <path d="M8 4L10 8L12 4Z" fill="currentColor" opacity=".2" />
  </Svg>
);

export const CombatIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="5" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="14" y1="14.5" x2="17" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="5" y1="3" x2="8" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="5" y1="3" x2="5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="19" y1="3" x2="7" y2="17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="10" y1="14.5" x2="7" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="19" y1="3" x2="16" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="19" y1="3" x2="19" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="10" r="1.5" fill="currentColor" opacity=".25" />
  </Svg>
);

export const VitalityIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 21C12 21 3 15 3 9C3 6 5 4 7.5 4C9.5 4 11 5 12 7C13 5 14.5 4 16.5 4C19 4 21 6 21 9C21 15 12 21 12 21Z" fill="currentColor" opacity=".12" />
    <path d="M12 20C12 20 4 14.5 4 9.5C4 7 5.5 5 7.5 5C9.3 5 10.8 6 12 8C13.2 6 14.7 5 16.5 5C18.5 5 20 7 20 9.5C20 14.5 12 20 12 20Z" fill="currentColor" />
    <path d="M6 11.5L9 11.5L10.5 9L12 14L13.5 11.5L18 11.5" stroke="currentColor" strokeWidth="1" opacity=".3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7C9 6 10 7 10 8C9 7 8 7 8 7Z" fill="currentColor" opacity=".25" />
  </Svg>
);

export const RallyIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="5" y1="2" x2="5" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 3H19L15 8.5L19 14H5V3Z" fill="currentColor" opacity=".12" />
    <path d="M5 3H19L15 8.5L19 14H5V3Z" fill="currentColor" />
    <path d="M5 3Q10 5 15 3" stroke="currentColor" strokeWidth=".5" opacity=".3" fill="none" />
    <path d="M5 8.5Q10 10 16 8" stroke="currentColor" strokeWidth=".5" opacity=".25" fill="none" />
    <circle cx="5" cy="22" r="1.5" fill="currentColor" opacity=".4" />
  </Svg>
);

export const BullseyeIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity=".25" fill="none" />
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" opacity=".45" fill="none" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" opacity=".65" fill="none" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <line x1="17" y1="3" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".6" />
    <path d="M17 3L19.5 1.5L20.5 4.5Z" fill="currentColor" opacity=".7" />
  </Svg>
);

export const SparkleIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 2L13.5 9L20 10L13.5 11.5L12 19L10.5 11.5L4 10L10.5 9Z" fill="currentColor" />
    <path d="M19 2L19.5 4.5L22 5L19.5 5.5L19 8L18.5 5.5L16 5L18.5 4.5Z" fill="currentColor" opacity=".6" />
    <path d="M5 16L5.5 18L8 18.5L5.5 19L5 21L4.5 19L2 18.5L4.5 18Z" fill="currentColor" opacity=".5" />
    <circle cx="17" cy="16" r=".8" fill="currentColor" opacity=".35" />
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// TOWER UPGRADE ICONS — currentColor-based, themed for tower specializations
// ═══════════════════════════════════════════════════════════════════════════

export const RapidFireIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M21 8C21 8 19 4 14 4H10C6 4 3 7 3 11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M3 16C3 16 5 20 10 20H14C18 20 21 17 21 13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M21 8L23 5L19 5Z" fill="currentColor" />
    <path d="M3 16L1 19L5 19Z" fill="currentColor" />
    <line x1="10" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1" opacity=".3" strokeLinecap="round" />
    <line x1="10" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1" opacity=".3" strokeLinecap="round" />
  </Svg>
);

export const BowStrikeIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M18 3C18 3 6 6 6 12C6 18 18 21 18 21" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="18" y1="3" x2="18" y2="21" stroke="currentColor" strokeWidth="1" opacity=".4" />
    <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M21 12L18.5 10V14Z" fill="currentColor" />
    <path d="M9 12L7 10.5V13.5Z" fill="currentColor" opacity=".5" />
  </Svg>
);

export const MelodyIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="9" y1="4" x2="9" y2="17" stroke="currentColor" strokeWidth="1.8" />
    <line x1="17" y1="2" x2="17" y2="15" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 4H17V2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M9 8H17V6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".5" />
    <ellipse cx="7" cy="18" rx="2.5" ry="2" transform="rotate(-20 7 18)" fill="currentColor" />
    <ellipse cx="15" cy="16" rx="2.5" ry="2" transform="rotate(-20 15 16)" fill="currentColor" />
    <path d="M2 22Q6 20 10 22Q14 24 18 22" stroke="currentColor" strokeWidth=".8" opacity=".3" fill="none" />
  </Svg>
);

export const LaserFocusIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" fill="currentColor" opacity=".15" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M3 8V3H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 8V3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 16V21H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 16V21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="3" x2="12" y2="8" stroke="currentColor" strokeWidth="1" opacity=".25" strokeDasharray="1.5 1.5" />
    <line x1="12" y1="16" x2="12" y2="21" stroke="currentColor" strokeWidth="1" opacity=".25" strokeDasharray="1.5 1.5" />
    <line x1="3" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1" opacity=".25" strokeDasharray="1.5 1.5" />
    <line x1="16" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1" opacity=".25" strokeDasharray="1.5 1.5" />
  </Svg>
);

export const EarthForceIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M2 20L8 6L12 12L16 4L22 20H2Z" fill="currentColor" opacity=".08" />
    <path d="M13 20L16 4L22 20H13Z" fill="currentColor" opacity=".5" />
    <path d="M2 20L8 6L14 20H2Z" fill="currentColor" />
    <path d="M8 6L6.5 10L9.5 10Z" fill="currentColor" opacity=".3" />
    <path d="M16 4L14.5 8L17.5 8Z" fill="currentColor" opacity=".2" />
    <line x1="1" y1="20" x2="23" y2="20" stroke="currentColor" strokeWidth="1.5" opacity=".3" />
  </Svg>
);

export const TrackingIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity=".25" fill="none" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" opacity=".45" fill="none" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    <line x1="12" y1="12" x2="12" y2="2" stroke="currentColor" strokeWidth="1" opacity=".3" />
    <path d="M12 2A10 10 0 0 1 20 8" stroke="currentColor" strokeWidth="1.5" opacity=".5" fill="none" />
    <circle cx="16" cy="7" r=".8" fill="currentColor" opacity=".5" />
    <circle cx="8" cy="16" r=".6" fill="currentColor" opacity=".35" />
  </Svg>
);

export const AlchemyIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M9 10V5H15V10L20 19C20 20.5 18 22 15 22H9C6 22 4 20.5 4 19L9 10Z" fill="currentColor" opacity=".1" />
    <path d="M9 10V5H15V10L20 19C20 20.5 18 22 15 22H9C6 22 4 20.5 4 19L9 10Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M7 16H17L19 19C19 20 17.5 21 15 21H9C6.5 21 5 20 5 19L7 16Z" fill="currentColor" opacity=".4" />
    <rect x="8" y="3" width="8" height="2" rx="1" fill="currentColor" opacity=".6" />
    <circle cx="10" cy="18" r="1" fill="currentColor" opacity=".25" />
    <circle cx="13" cy="17" r=".7" fill="currentColor" opacity=".2" />
    <circle cx="11" cy="15.5" r=".5" fill="currentColor" opacity=".15" />
  </Svg>
);

export const RecruitIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="10" cy="7" r="4" fill="currentColor" opacity=".15" />
    <circle cx="10" cy="7" r="3" fill="currentColor" />
    <path d="M2 21C2 17 5.5 14 10 14C14.5 14 18 17 18 21" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M4 20C4 17.5 6.5 15.5 10 15.5C13.5 15.5 16 17.5 16 20" fill="currentColor" opacity=".15" />
    <line x1="19" y1="8" x2="19" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="15" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);
