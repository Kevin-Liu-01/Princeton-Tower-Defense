"use client";
import React from "react";

// =============================================================================
// ORNATE FRAME COMPONENTS
// =============================================================================

interface OrnateCornerProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: number;
  color?: string;
  glowColor?: string;
}

const OrnateCorner: React.FC<OrnateCornerProps> = ({
  position,
  size = 40,
  color = "#d97706",
  glowColor = "#f59e0b",
}) => {
  const rotations = {
    "top-left": "rotate(0)",
    "top-right": "rotate(90deg)",
    "bottom-right": "rotate(180deg)",
    "bottom-left": "rotate(270deg)",
  };

  const positions = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <div
      className={`absolute ${positions[position]} pointer-events-none z-30`}
      style={{
        width: size,
        height: size,
        transform: rotations[position],
        filter: `drop-shadow(0 0 4px ${glowColor}40)`,
      }}
    >
      <svg
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer decorative flourish */}
        <path
          d="M0 0 L0 45 Q5 40 10 38 Q15 36 20 35 L20 20 L35 20 Q36 15 38 10 Q40 5 45 0 Z"
          fill={`${color}30`}
          stroke={color}
          strokeWidth="1.5"
        />
        {/* Inner corner bracket */}
        <path
          d="M2 2 L2 35 Q6 32 12 30 L12 12 L30 12 Q32 6 35 2 Z"
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.7"
        />
        {/* Decorative curl */}
        <path
          d="M5 25 Q8 22 14 20 Q20 18 25 16"
          fill="none"
          stroke={glowColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M25 5 Q22 8 20 14 Q18 20 16 25"
          fill="none"
          stroke={glowColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Corner diamond accent */}
        <path
          d="M8 8 L12 4 L16 8 L12 12 Z"
          fill={glowColor}
          opacity="0.9"
        />
        {/* Small accent dots */}
        <circle cx="22" cy="8" r="1.5" fill={glowColor} opacity="0.7" />
        <circle cx="8" cy="22" r="1.5" fill={glowColor} opacity="0.7" />
        <circle cx="28" cy="12" r="1" fill={color} opacity="0.5" />
        <circle cx="12" cy="28" r="1" fill={color} opacity="0.5" />
        {/* Flourish spirals */}
        <path
          d="M4 35 Q2 30 6 28 Q10 26 12 30"
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.6"
        />
        <path
          d="M35 4 Q30 2 28 6 Q26 10 30 12"
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};

interface OrnateBorderProps {
  position: "top" | "bottom" | "left" | "right";
  color?: string;
  glowColor?: string;
}

const OrnateBorder: React.FC<OrnateBorderProps> = ({
  position,
  color = "#d97706",
  glowColor = "#f59e0b",
}) => {
  const isHorizontal = position === "top" || position === "bottom";

  const positionClasses = {
    top: "top-0 left-1/2 -translate-x-1/2",
    bottom: "bottom-0 left-1/2 -translate-x-1/2",
    left: "left-0 top-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 -translate-y-1/2",
  };

  if (isHorizontal) {
    return (
      <div
        className={`absolute ${positionClasses[position]} pointer-events-none z-20`}
        style={{
          width: "calc(100% - 48px)",
          height: 5,
          filter: `drop-shadow(0 0 3px ${glowColor}30)`,
        }}
      >
        <svg
          viewBox="0 0 200 12"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ transform: position === "bottom" ? "scaleY(-1)" : undefined }}
        >
          {/* Center medallion */}
          <path
            d="M90 0 L95 6 L100 0 L105 6 L110 0"
            fill="none"
            stroke={glowColor}
            strokeWidth="1.5"
          />
          <circle cx="100" cy="3" r="2" fill={glowColor} />
          {/* Left flourish - flat lines */}
          <path
            d="M0 6 L85 6"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.7"
          />
          <path
            d="M10 4 L80 4"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            opacity="0.4"
          />
          {/* Right flourish - flat lines */}
          <path
            d="M115 6 L200 6"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.7"
          />
          <path
            d="M120 4 L190 4"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            opacity="0.4"
          />
          {/* Accent dots */}
          <circle cx="25" cy="6" r="1" fill={glowColor} opacity="0.6" />
          <circle cx="50" cy="6" r="0.8" fill={glowColor} opacity="0.5" />
          <circle cx="150" cy="6" r="0.8" fill={glowColor} opacity="0.5" />
          <circle cx="175" cy="6" r="1" fill={glowColor} opacity="0.6" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} pointer-events-none z-20`}
      style={{
        width: 12,
        height: "40%",
        filter: `drop-shadow(0 0 3px ${glowColor}30)`,
      }}
    >
      <svg
        viewBox="0 0 12 100"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ transform: position === "right" ? "scaleX(-1)" : undefined }}
      >
        {/* Vertical decorative line */}
        <path
          d="M6 0 Q4 25 6 50 Q8 75 6 100"
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.6"
        />
        <circle cx="6" cy="20" r="1.5" fill={glowColor} opacity="0.5" />
        <circle cx="6" cy="50" r="2" fill={glowColor} opacity="0.7" />
        <circle cx="6" cy="80" r="1.5" fill={glowColor} opacity="0.5" />
      </svg>
    </div>
  );
};

export interface OrnateFrameProps {
  children: React.ReactNode;
  className?: string;
  cornerSize?: number;
  showBorders?: boolean;
  color?: string;
  glowColor?: string;
}

export const OrnateFrame: React.FC<OrnateFrameProps> = ({
  children,
  className = "",
  cornerSize = 36,
  showBorders = true,
  color = "#d97706",
  glowColor = "#f59e0b",
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Corner ornaments */}
      <OrnateCorner position="top-left" size={cornerSize} color={color} glowColor={glowColor} />
      <OrnateCorner position="top-right" size={cornerSize} color={color} glowColor={glowColor} />
      <OrnateCorner position="bottom-left" size={cornerSize} color={color} glowColor={glowColor} />
      <OrnateCorner position="bottom-right" size={cornerSize} color={color} glowColor={glowColor} />

      {/* Border decorations */}
      {showBorders && (
        <>
          <OrnateBorder position="top" color={color} glowColor={glowColor} />
          <OrnateBorder position="bottom" color={color} glowColor={glowColor} />
        </>
      )}

      {/* Inner glow effect */}
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] z-10"
        style={{
          boxShadow: `inset 0 0 20px ${glowColor}10, inset 0 0 40px ${color}05`,
        }}
      />

      {children}
    </div>
  );
};

// Also export individual components for more granular use
export { OrnateCorner, OrnateBorder };
export type { OrnateCornerProps, OrnateBorderProps };

export default OrnateFrame;
