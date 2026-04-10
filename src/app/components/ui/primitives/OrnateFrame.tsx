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
    "bottom-left": "rotate(270deg)",
    "bottom-right": "rotate(180deg)",
    "top-left": "rotate(0)",
    "top-right": "rotate(90deg)",
  };

  const positions = {
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
  };

  return (
    <div
      className={`absolute ${positions[position]} pointer-events-none z-30`}
      style={{
        filter: `drop-shadow(0 0 6px ${glowColor}50)`,
        height: size,
        transform: rotations[position],
        width: size,
      }}
    >
      <svg
        viewBox="0 0 70 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
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
        <path
          d="M20 30 Q22 28 24 30 Q22 32 20 30 Z"
          fill={glowColor}
          opacity="0.3"
        />
        <path
          d="M30 20 Q28 22 30 24 Q32 22 30 20 Z"
          fill={glowColor}
          opacity="0.3"
        />
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
    "bottom-left": "rotate(270deg)",
    "bottom-right": "rotate(180deg)",
    "top-left": "rotate(0)",
    "top-right": "rotate(90deg)",
  };

  const positions = {
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
  };

  return (
    <div
      className={`absolute ${positions[position]} pointer-events-none z-30`}
      style={{
        filter: `drop-shadow(0 0 4px ${glowColor}40)`,
        height: size,
        transform: rotations[position],
        width: size,
      }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
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
    bottom: "bottom-0 left-1/2 -translate-x-1/2",
    left: "left-0 top-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 -translate-y-1/2",
    top: "top-0 left-1/2 -translate-x-1/2",
  };

  if (isHorizontal) {
    return (
      <div
        className={`absolute ${positionClasses[position]} pointer-events-none z-20`}
        style={{
          filter: `drop-shadow(0 0 ${4 * scale}px ${glowColor}35)`,
          height: 14 * scale,
          width: "calc(100% - 48px)",
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}b3 8%, ${color}b3 41%, transparent 46%, transparent 54%, ${color}b3 59%, ${color}b3 92%, transparent)`,
            height: Math.max(1, 1.2 * scale),
          }}
        />
        <div
          className="absolute w-full"
          style={{
            background: `linear-gradient(90deg, transparent 4%, ${color}59 12%, ${color}59 39%, transparent 44%, transparent 56%, ${color}59 61%, ${color}59 88%, transparent 96%)`,
            top: 3.5 * scale,
            height: Math.max(0.5, 0.5 * scale),
          }}
        />
        <div
          className="absolute w-full"
          style={{
            background: `linear-gradient(90deg, transparent 8%, ${color}33 15%, ${color}33 39%, transparent 44%, transparent 56%, ${color}33 61%, ${color}33 85%, transparent 92%)`,
            bottom: 3 * scale,
            height: Math.max(0.5, 0.4 * scale),
          }}
        />
        <svg
          viewBox="0 0 60 16"
          fill="none"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: 54 * scale, height: 14 * scale }}
        >
          <path
            d="M15 2 L22 8 L30 0 L38 8 L45 2"
            fill="none"
            stroke={glowColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M15 14 L22 8 L30 16 L38 8 L45 14"
            fill="none"
            stroke={glowColor}
            strokeWidth="1"
            opacity="0.5"
          />
          <circle cx="30" cy="8" r="3" fill={glowColor} opacity="0.9" />
          <circle cx="30" cy="8" r="1.5" fill={color} opacity="0.6" />
          <path d="M8 8 L5 5 L8 2 L11 5 Z" fill={glowColor} opacity="0.5" />
          <path d="M52 8 L49 5 L52 2 L55 5 Z" fill={glowColor} opacity="0.5" />
        </svg>
        <svg
          viewBox="0 0 8 8"
          fill="none"
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: "20%", height: 7 * scale, width: 7 * scale }}
        >
          <path d="M4 1 L2 4 L4 7 L6 4 Z" fill={glowColor} opacity="0.35" />
        </svg>
        <svg
          viewBox="0 0 8 8"
          fill="none"
          className="absolute top-1/2 -translate-y-1/2"
          style={{ right: "20%", height: 7 * scale, width: 7 * scale }}
        >
          <path d="M4 1 L2 4 L4 7 L6 4 Z" fill={glowColor} opacity="0.35" />
        </svg>
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: "10%",
            width: 2.4 * scale,
            height: 2.4 * scale,
            background: glowColor,
            opacity: 0.6,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: "28%",
            width: 2 * scale,
            height: 2 * scale,
            background: glowColor,
            opacity: 0.5,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            right: "28%",
            width: 2 * scale,
            height: 2 * scale,
            background: glowColor,
            opacity: 0.5,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            right: "10%",
            width: 2.4 * scale,
            height: 2.4 * scale,
            background: glowColor,
            opacity: 0.6,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} pointer-events-none z-20`}
      style={{
        filter: `drop-shadow(0 0 ${4 * scale}px ${glowColor}30)`,
        height: "calc(100% - 48px)",
        width: 14 * scale,
      }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 h-full"
        style={{
          background: `linear-gradient(180deg, transparent, ${color}b3 8%, ${color}b3 41%, transparent 46%, transparent 54%, ${color}b3 59%, ${color}b3 92%, transparent)`,
          width: Math.max(1, 1.2 * scale),
        }}
      />
      <div
        className="absolute h-full"
        style={{
          background: `linear-gradient(180deg, transparent 4%, ${color}59 12%, ${color}59 39%, transparent 44%, transparent 56%, ${color}59 61%, ${color}59 88%, transparent 96%)`,
          left: 3.5 * scale,
          width: Math.max(0.5, 0.5 * scale),
        }}
      />
      <div
        className="absolute h-full"
        style={{
          background: `linear-gradient(180deg, transparent 8%, ${color}33 15%, ${color}33 39%, transparent 44%, transparent 56%, ${color}33 61%, ${color}33 85%, transparent 92%)`,
          right: 3 * scale,
          width: Math.max(0.5, 0.4 * scale),
        }}
      />
      <svg
        viewBox="0 0 16 60"
        fill="none"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ height: 54 * scale, width: 14 * scale }}
      >
        <path
          d="M2 15 L8 22 L0 30 L8 38 L2 45"
          fill="none"
          stroke={glowColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M14 15 L8 22 L16 30 L8 38 L14 45"
          fill="none"
          stroke={glowColor}
          strokeWidth="1"
          opacity="0.5"
        />
        <circle cx="8" cy="30" r="3" fill={glowColor} opacity="0.9" />
        <circle cx="8" cy="30" r="1.5" fill={color} opacity="0.6" />
        <path d="M8 5 L5 8 L8 11 L11 8 Z" fill={glowColor} opacity="0.5" />
        <path d="M8 49 L5 52 L8 55 L11 52 Z" fill={glowColor} opacity="0.5" />
      </svg>
      <svg
        viewBox="0 0 8 8"
        fill="none"
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "20%", width: 7 * scale, height: 7 * scale }}
      >
        <path d="M4 1 L2 4 L4 7 L6 4 Z" fill={glowColor} opacity="0.35" />
      </svg>
      <svg
        viewBox="0 0 8 8"
        fill="none"
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "20%", width: 7 * scale, height: 7 * scale }}
      >
        <path d="M4 1 L2 4 L4 7 L6 4 Z" fill={glowColor} opacity="0.35" />
      </svg>
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          top: "10%",
          width: 2.4 * scale,
          height: 2.4 * scale,
          background: glowColor,
          opacity: 0.6,
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          top: "28%",
          width: 2 * scale,
          height: 2 * scale,
          background: glowColor,
          opacity: 0.5,
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: "28%",
          width: 2 * scale,
          height: 2 * scale,
          background: glowColor,
          opacity: 0.5,
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: "10%",
          width: 2.4 * scale,
          height: 2.4 * scale,
          background: glowColor,
          opacity: 0.6,
        }}
      />
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
    bottom: "bottom-0 left-1/2 -translate-x-1/2",
    left: "left-0 top-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 -translate-y-1/2",
    top: "top-0 left-1/2 -translate-x-1/2",
  };

  if (isHorizontal) {
    return (
      <div
        className={`absolute ${positionClasses[position]} pointer-events-none z-20`}
        style={{
          filter: `drop-shadow(0 0 ${3 * scale}px ${glowColor}30)`,
          height: 6 * scale,
          width: "calc(100% - 36px)",
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}99 15%, ${color}99 43%, transparent 48%, transparent 52%, ${color}99 57%, ${color}99 85%, transparent)`,
            height: Math.max(1, scale),
          }}
        />
        <svg
          viewBox="0 0 24 8"
          fill="none"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: 20 * scale, height: 8 * scale }}
        >
          <circle cx="12" cy="4" r="1.5" fill={glowColor} opacity="0.7" />
          <path d="M6 4 L8 2 L10 4 L8 6 Z" fill={glowColor} opacity="0.4" />
          <path d="M14 4 L16 2 L18 4 L16 6 Z" fill={glowColor} opacity="0.4" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} pointer-events-none z-20`}
      style={{
        filter: `drop-shadow(0 0 ${3 * scale}px ${glowColor}25)`,
        height: "calc(100% - 36px)",
        width: 8 * scale,
      }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 h-full"
        style={{
          background: `linear-gradient(180deg, transparent, ${color}99 15%, ${color}99 43%, transparent 48%, transparent 52%, ${color}99 57%, ${color}99 85%, transparent)`,
          width: Math.max(1, scale),
        }}
      />
      <svg
        viewBox="0 0 8 24"
        fill="none"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ height: 20 * scale, width: 8 * scale }}
      >
        <circle cx="4" cy="12" r="1.5" fill={glowColor} opacity="0.7" />
        <path d="M4 6 L2 8 L4 10 L6 8 Z" fill={glowColor} opacity="0.4" />
        <path d="M4 14 L2 16 L4 18 L6 16 Z" fill={glowColor} opacity="0.4" />
      </svg>
    </div>
  );
};

export type OrnateVariant = "standard" | "compact";

export interface OrnateFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
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
  /** Extra classes on the decoration wrapper (corners, borders, glow). Use e.g. "hidden lg:block" to hide on mobile. */
  decorationClassName?: string;
}

const CORNER_COMPONENTS: Record<
  OrnateVariant,
  React.FC<OrnateCornerProps | OrnateCornerCompactProps>
> = {
  compact: OrnateCornerCompact,
  standard: OrnateCorner,
};

const BORDER_COMPONENTS: Record<
  OrnateVariant,
  React.FC<OrnateBorderProps | OrnateBorderCompactProps>
> = {
  compact: OrnateBorderCompact,
  standard: OrnateBorder,
};

export const OrnateFrame: React.FC<OrnateFrameProps> = ({
  children,
  className = "",
  style,
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
  color = "#b48c3c",
  glowColor = "#d4a84a",
  decorationClassName,
}) => {
  const CornerComponent = CORNER_COMPONENTS[cornerVariant];
  const SideBorderComponent =
    BORDER_COMPONENTS[sideBorderVariant ?? borderVariant];
  const TopBottomBorderComponent =
    BORDER_COMPONENTS[topBottomBorderVariant ?? borderVariant];

  const decorations = (
    <>
      <CornerComponent
        position="top-left"
        size={cornerSize}
        color={color}
        glowColor={glowColor}
      />
      <CornerComponent
        position="top-right"
        size={cornerSize}
        color={color}
        glowColor={glowColor}
      />
      <CornerComponent
        position="bottom-left"
        size={cornerSize}
        color={color}
        glowColor={glowColor}
      />
      <CornerComponent
        position="bottom-right"
        size={cornerSize}
        color={color}
        glowColor={glowColor}
      />

      {showBorders && (
        <>
          {showTopBottomBorders && (
            <>
              <TopBottomBorderComponent
                position="top"
                color={color}
                glowColor={glowColor}
                scale={topBottomBorderScale ?? borderScale}
              />
              <TopBottomBorderComponent
                position="bottom"
                color={color}
                glowColor={glowColor}
                scale={topBottomBorderScale ?? borderScale}
              />
            </>
          )}
          {showSideBorders && (
            <>
              <SideBorderComponent
                position="left"
                color={color}
                glowColor={glowColor}
                scale={sideBorderScale ?? borderScale}
              />
              <SideBorderComponent
                position="right"
                color={color}
                glowColor={glowColor}
                scale={sideBorderScale ?? borderScale}
              />
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
    </>
  );

  return (
    <div className={`relative ${className}`} style={style}>
      {children}
      {decorationClassName ? (
        <div className={decorationClassName}>{decorations}</div>
      ) : (
        decorations
      )}
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
