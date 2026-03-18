"use client";
import React from "react";

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
        filter: `drop-shadow(0 0 6px ${glowColor}50)`,
      }}
    >
      <svg viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M0 0 L0 52 Q5 47 10 44 Q16 41 22 40 L22 22 L40 22 Q41 16 44 10 Q47 5 52 0 Z"
          fill={`${color}25`}
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M2 2 L2 40 Q7 36 14 34 L14 14 L34 14 Q36 7 40 2 Z"
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.6"
        />
        <path
          d="M5 5 L5 32 Q9 29 14 27 L14 14 L27 14 Q29 9 32 5 Z"
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.3"
        />
        <path
          d="M5 30 Q9 26 16 23 Q23 20 30 18"
          fill="none"
          stroke={glowColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M30 5 Q26 9 23 16 Q20 23 18 30"
          fill="none"
          stroke={glowColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M0 52 Q3 50 7 48 Q12 46 18 45"
          fill="none"
          stroke={glowColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M52 0 Q50 3 48 7 Q46 12 45 18"
          fill="none"
          stroke={glowColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path d="M9 9 L14 3 L19 9 L14 15 Z" fill={glowColor} opacity="0.9" />
        <path
          d="M11 9 L14 5.5 L17 9 L14 12.5 Z"
          fill="none"
          stroke={color}
          strokeWidth="0.6"
          opacity="0.5"
        />
        <path d="M24 6 L26 4 L28 6 L26 8 Z" fill={glowColor} opacity="0.6" />
        <path d="M6 24 L4 26 L6 28 L8 26 Z" fill={glowColor} opacity="0.6" />
        <circle cx="34" cy="10" r="1.5" fill={glowColor} opacity="0.7" />
        <circle cx="10" cy="34" r="1.5" fill={glowColor} opacity="0.7" />
        <circle cx="42" cy="14" r="1" fill={color} opacity="0.5" />
        <circle cx="14" cy="42" r="1" fill={color} opacity="0.5" />
        <circle cx="48" cy="18" r="0.8" fill={color} opacity="0.35" />
        <circle cx="18" cy="48" r="0.8" fill={color} opacity="0.35" />
        <path
          d="M4 42 Q2 36 7 33 Q12 30 15 35 Q18 40 14 42"
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <path
          d="M42 4 Q36 2 33 7 Q30 12 35 15 Q40 18 42 14"
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <path d="M20 30 Q22 28 24 30 Q22 32 20 30 Z" fill={glowColor} opacity="0.3" />
        <path d="M30 20 Q28 22 30 24 Q32 22 30 20 Z" fill={glowColor} opacity="0.3" />
      </svg>
    </div>
  );
};

interface OrnateCornerCompactProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: number;
  color?: string;
  glowColor?: string;
}

const OrnateCornerCompact: React.FC<OrnateCornerCompactProps> = ({
  position,
  size = 24,
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
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M0 0 L0 30 Q3 27 7 25 L7 7 L25 7 Q27 3 30 0 Z"
          fill={`${color}20`}
          stroke={color}
          strokeWidth="1.2"
        />
        <path
          d="M2 2 L2 22 Q5 20 8 18 L8 8 L18 8 Q20 5 22 2 Z"
          fill="none"
          stroke={color}
          strokeWidth="0.7"
          opacity="0.5"
        />
        <path d="M6 6 L9 3 L12 6 L9 9 Z" fill={glowColor} opacity="0.85" />
        <path
          d="M3 20 Q6 17 10 15 Q14 13 18 11"
          fill="none"
          stroke={glowColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M20 3 Q17 6 15 10 Q13 14 11 18"
          fill="none"
          stroke={glowColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="20" cy="6" r="1" fill={glowColor} opacity="0.6" />
        <circle cx="6" cy="20" r="1" fill={glowColor} opacity="0.6" />
      </svg>
    </div>
  );
};

interface OrnateBorderProps {
  position: "top" | "bottom" | "left" | "right";
  color?: string;
  glowColor?: string;
  scale?: number;
}

const OrnateBorder: React.FC<OrnateBorderProps> = ({
  position,
  color = "#d97706",
  glowColor = "#f59e0b",
  scale = 1,
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
          height: 8 * scale,
          filter: `drop-shadow(0 0 ${4 * scale}px ${glowColor}35)`,
        }}
      >
        <svg
          viewBox="0 0 400 16"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ transform: position === "bottom" ? "scaleY(-1)" : undefined }}
        >
          <path d="M0 8 L165 8" fill="none" stroke={color} strokeWidth="1.2" opacity="0.7" />
          <path d="M235 8 L400 8" fill="none" stroke={color} strokeWidth="1.2" opacity="0.7" />
          <path d="M15 5 L155 5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.35" />
          <path d="M245 5 L385 5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.35" />
          <path d="M30 11 L160 11" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" />
          <path d="M240 11 L370 11" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" />
          <path
            d="M185 2 L192 8 L200 0 L208 8 L215 2"
            fill="none"
            stroke={glowColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M185 14 L192 8 L200 16 L208 8 L215 14"
            fill="none"
            stroke={glowColor}
            strokeWidth="1"
            opacity="0.5"
          />
          <circle cx="200" cy="8" r="3" fill={glowColor} opacity="0.9" />
          <circle cx="200" cy="8" r="1.5" fill={color} opacity="0.6" />
          <path d="M170 8 L175 5 L180 8 L175 11 Z" fill={glowColor} opacity="0.5" />
          <path d="M220 8 L225 5 L230 8 L225 11 Z" fill={glowColor} opacity="0.5" />
          <path d="M80 8 L83 6 L86 8 L83 10 Z" fill={glowColor} opacity="0.35" />
          <path d="M314 8 L317 6 L320 8 L317 10 Z" fill={glowColor} opacity="0.35" />
          <circle cx="40" cy="8" r="1.2" fill={glowColor} opacity="0.6" />
          <circle cx="60" cy="8" r="0.8" fill={glowColor} opacity="0.4" />
          <circle cx="110" cy="8" r="1" fill={glowColor} opacity="0.5" />
          <circle cx="140" cy="8" r="0.8" fill={glowColor} opacity="0.4" />
          <circle cx="260" cy="8" r="0.8" fill={glowColor} opacity="0.4" />
          <circle cx="290" cy="8" r="1" fill={glowColor} opacity="0.5" />
          <circle cx="340" cy="8" r="0.8" fill={glowColor} opacity="0.4" />
          <circle cx="360" cy="8" r="1.2" fill={glowColor} opacity="0.6" />
          <path d="M158 6 Q162 4 166 6 Q162 8 158 6 Z" fill={glowColor} opacity="0.3" />
          <path d="M234 6 Q238 4 242 6 Q238 8 234 6 Z" fill={glowColor} opacity="0.3" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} pointer-events-none z-20`}
      style={{
        width: 14 * scale,
        height: "calc(100% - 48px)",
        filter: `drop-shadow(0 0 ${4 * scale}px ${glowColor}30)`,
      }}
    >
      <svg
        viewBox="0 0 16 400"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ transform: position === "right" ? "scaleX(-1)" : undefined }}
      >
        <path d="M8 0 L8 165" fill="none" stroke={color} strokeWidth="1.2" opacity="0.7" />
        <path d="M8 235 L8 400" fill="none" stroke={color} strokeWidth="1.2" opacity="0.7" />
        <path d="M5 15 L5 155" fill="none" stroke={color} strokeWidth="0.5" opacity="0.35" />
        <path d="M5 245 L5 385" fill="none" stroke={color} strokeWidth="0.5" opacity="0.35" />
        <path d="M11 30 L11 160" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" />
        <path d="M11 240 L11 370" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" />
        <path
          d="M2 185 L8 192 L0 200 L8 208 L2 215"
          fill="none"
          stroke={glowColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M14 185 L8 192 L16 200 L8 208 L14 215"
          fill="none"
          stroke={glowColor}
          strokeWidth="1"
          opacity="0.5"
        />
        <circle cx="8" cy="200" r="3" fill={glowColor} opacity="0.9" />
        <circle cx="8" cy="200" r="1.5" fill={color} opacity="0.6" />
        <path d="M8 170 L5 175 L8 180 L11 175 Z" fill={glowColor} opacity="0.5" />
        <path d="M8 220 L5 225 L8 230 L11 225 Z" fill={glowColor} opacity="0.5" />
        <path d="M8 80 L6 83 L8 86 L10 83 Z" fill={glowColor} opacity="0.35" />
        <path d="M8 314 L6 317 L8 320 L10 317 Z" fill={glowColor} opacity="0.35" />
        <circle cx="8" cy="40" r="1.2" fill={glowColor} opacity="0.6" />
        <circle cx="8" cy="60" r="0.8" fill={glowColor} opacity="0.4" />
        <circle cx="8" cy="110" r="1" fill={glowColor} opacity="0.5" />
        <circle cx="8" cy="140" r="0.8" fill={glowColor} opacity="0.4" />
        <circle cx="8" cy="260" r="0.8" fill={glowColor} opacity="0.4" />
        <circle cx="8" cy="290" r="1" fill={glowColor} opacity="0.5" />
        <circle cx="8" cy="340" r="0.8" fill={glowColor} opacity="0.4" />
        <circle cx="8" cy="360" r="1.2" fill={glowColor} opacity="0.6" />
        <path d="M6 158 Q4 162 6 166 Q8 162 6 158 Z" fill={glowColor} opacity="0.3" />
        <path d="M6 234 Q4 238 6 242 Q8 238 6 234 Z" fill={glowColor} opacity="0.3" />
      </svg>
    </div>
  );
};

interface OrnateBorderCompactProps {
  position: "top" | "bottom" | "left" | "right";
  color?: string;
  glowColor?: string;
  scale?: number;
}

const OrnateBorderCompact: React.FC<OrnateBorderCompactProps> = ({
  position,
  color = "#d97706",
  glowColor = "#f59e0b",
  scale = 1,
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
          width: "calc(100% - 36px)",
          height: 6 * scale,
          filter: `drop-shadow(0 0 ${3 * scale}px ${glowColor}30)`,
        }}
      >
        <svg
          viewBox="0 0 400 4"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ transform: position === "bottom" ? "scaleY(-1)" : undefined }}
        >
          <path d="M0 2 L400 2" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" />
          <path d="M20 0.8 L380 0.8" fill="none" stroke={color} strokeWidth="0.3" opacity="0.2" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} pointer-events-none z-20`}
      style={{
        width: 8 * scale,
        height: "calc(100% - 36px)",
        filter: `drop-shadow(0 0 ${3 * scale}px ${glowColor}25)`,
      }}
    >
      <svg
        viewBox="0 0 8 60"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ transform: position === "right" ? "scaleX(-1)" : undefined }}
      >
        <path d="M4 0 L4 22" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
        <path d="M4 38 L4 60" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
        <circle cx="4" cy="30" r="1.5" fill={glowColor} opacity="0.7" />
        <path d="M4 24 L2 26 L4 28 L6 26 Z" fill={glowColor} opacity="0.4" />
        <path d="M4 32 L2 34 L4 36 L6 34 Z" fill={glowColor} opacity="0.4" />
      </svg>
    </div>
  );
};

export type OrnateVariant = "standard" | "compact";

export interface OrnateFrameProps {
  children: React.ReactNode;
  className?: string;
  cornerSize?: number;
  cornerVariant?: OrnateVariant;
  borderVariant?: OrnateVariant;
  sideBorderVariant?: OrnateVariant;
  topBottomBorderVariant?: OrnateVariant;
  showBorders?: boolean;
  showSideBorders?: boolean;
  showTopBottomBorders?: boolean;
  borderScale?: number;
  sideBorderScale?: number;
  topBottomBorderScale?: number;
  color?: string;
  glowColor?: string;
}

const CORNER_COMPONENTS: Record<
  OrnateVariant,
  React.FC<OrnateCornerProps | OrnateCornerCompactProps>
> = {
  standard: OrnateCorner,
  compact: OrnateCornerCompact,
};

const BORDER_COMPONENTS: Record<
  OrnateVariant,
  React.FC<OrnateBorderProps | OrnateBorderCompactProps>
> = {
  standard: OrnateBorder,
  compact: OrnateBorderCompact,
};

export const OrnateFrame: React.FC<OrnateFrameProps> = ({
  children,
  className = "",
  cornerSize = 36,
  cornerVariant = "standard",
  borderVariant = "standard",
  sideBorderVariant,
  topBottomBorderVariant,
  showBorders = true,
  showSideBorders = true,
  showTopBottomBorders = true,
  borderScale = 1,
  sideBorderScale,
  topBottomBorderScale,
  color = "#d97706",
  glowColor = "#f59e0b",
}) => {
  const CornerComponent = CORNER_COMPONENTS[cornerVariant];
  const SideBorderComponent = BORDER_COMPONENTS[sideBorderVariant ?? borderVariant];
  const TopBottomBorderComponent = BORDER_COMPONENTS[topBottomBorderVariant ?? borderVariant];

  return (
    <div className={`relative ${className}`}>
      {children}

      <CornerComponent position="top-left" size={cornerSize} color={color} glowColor={glowColor} />
      <CornerComponent position="top-right" size={cornerSize} color={color} glowColor={glowColor} />
      <CornerComponent position="bottom-left" size={cornerSize} color={color} glowColor={glowColor} />
      <CornerComponent position="bottom-right" size={cornerSize} color={color} glowColor={glowColor} />

      {showBorders && (
        <>
          {showTopBottomBorders && (
            <>
              <TopBottomBorderComponent position="top" color={color} glowColor={glowColor} scale={topBottomBorderScale ?? borderScale} />
              <TopBottomBorderComponent position="bottom" color={color} glowColor={glowColor} scale={topBottomBorderScale ?? borderScale} />
            </>
          )}
          {showSideBorders && (
            <>
              <SideBorderComponent position="left" color={color} glowColor={glowColor} scale={sideBorderScale ?? borderScale} />
              <SideBorderComponent position="right" color={color} glowColor={glowColor} scale={sideBorderScale ?? borderScale} />
            </>
          )}
        </>
      )}

      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] z-10"
        style={{
          boxShadow: `inset 0 0 25px ${glowColor}12, inset 0 0 50px ${color}08`,
        }}
      />
    </div>
  );
};

export { OrnateCorner, OrnateCornerCompact, OrnateBorder, OrnateBorderCompact };
export type {
  OrnateCornerProps,
  OrnateCornerCompactProps,
  OrnateBorderProps,
  OrnateBorderCompactProps,
};

export default OrnateFrame;
