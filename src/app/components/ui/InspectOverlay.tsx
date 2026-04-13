"use client";

import { X } from "lucide-react";
import React from "react";

import type { Position } from "../../types";
import { PANEL, GOLD, dividerGradient, panelGradient } from "./system/theme";

export interface InspectTheme {
  ringColor: string;
  ringGlow: string;
  ringDash: string;
  ringInner: string;
  cutoutGlow: string;
  panelBorder: string;
  panelShadow: string;
  panelInner: string;
  headerBg: string;
  headerBorder: string;
  dotColor: string;
}

export const ENEMY_INSPECT_THEME: InspectTheme = {
  cutoutGlow: "rgba(239, 68, 68, 0.25)",
  dotColor: "rgba(239, 68, 68, 0.2)",
  headerBg:
    "linear-gradient(90deg, rgba(30, 10, 10, 0.9), rgba(45, 15, 15, 0.7))",
  headerBorder: "rgba(239, 68, 68, 0.25)",
  panelBorder: "rgba(239, 68, 68, 0.35)",
  panelInner: "rgba(239, 68, 68, 0.1)",
  panelShadow:
    "0 0 24px rgba(239, 68, 68, 0.12), inset 0 0 12px rgba(239, 68, 68, 0.05)",
  ringColor: "rgba(239, 68, 68, 0.5)",
  ringDash: "rgba(239, 68, 68, 0.18)",
  ringGlow: "rgba(239, 68, 68, 0.12)",
  ringInner: "rgba(239, 68, 68, 0.1)",
};

export const TROOP_INSPECT_THEME: InspectTheme = {
  cutoutGlow: "rgba(59, 130, 246, 0.25)",
  dotColor: "rgba(59, 130, 246, 0.2)",
  headerBg:
    "linear-gradient(90deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7))",
  headerBorder: "rgba(59, 130, 246, 0.25)",
  panelBorder: "rgba(59, 130, 246, 0.4)",
  panelInner: "rgba(59, 130, 246, 0.12)",
  panelShadow:
    "0 0 24px rgba(59, 130, 246, 0.15), inset 0 0 12px rgba(59, 130, 246, 0.06)",
  ringColor: "rgba(59, 130, 246, 0.5)",
  ringDash: "rgba(59, 130, 246, 0.18)",
  ringGlow: "rgba(59, 130, 246, 0.12)",
  ringInner: "rgba(59, 130, 246, 0.1)",
};

export const HERO_INSPECT_THEME: InspectTheme = {
  cutoutGlow: "rgba(245, 158, 11, 0.25)",
  dotColor: "rgba(245, 158, 11, 0.2)",
  headerBg:
    "linear-gradient(90deg, rgba(30, 20, 10, 0.9), rgba(45, 30, 15, 0.7))",
  headerBorder: "rgba(245, 158, 11, 0.3)",
  panelBorder: "rgba(245, 158, 11, 0.4)",
  panelInner: "rgba(245, 158, 11, 0.12)",
  panelShadow:
    "0 0 24px rgba(245, 158, 11, 0.15), inset 0 0 12px rgba(245, 158, 11, 0.06)",
  ringColor: "rgba(245, 158, 11, 0.5)",
  ringDash: "rgba(245, 158, 11, 0.18)",
  ringGlow: "rgba(245, 158, 11, 0.12)",
  ringInner: "rgba(245, 158, 11, 0.1)",
};

const DEG_TO_RAD = Math.PI / 180;
const RING_RADIUS = 55;

export function InspectRing({
  cx,
  cy,
  theme,
}: {
  cx: number;
  cy: number;
  theme: InspectTheme;
}) {
  const radius = RING_RADIUS;
  const outerR = radius + 10;
  const pad = 4;
  const size = (outerR + pad) * 2;
  const c = size / 2;

  return (
    <svg
      className="fixed pointer-events-none"
      style={{
        height: size,
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        zIndex: 299,
      }}
      viewBox={`0 0 ${size} ${size}`}
    >
      <defs>
        <filter id="inspectRingGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx={c}
        cy={c}
        r={radius}
        fill="none"
        stroke={theme.ringGlow}
        strokeWidth="6"
        filter="url(#inspectRingGlow)"
      />

      <circle
        cx={c}
        cy={c}
        r={outerR}
        fill="none"
        stroke={theme.ringDash}
        strokeWidth="1"
        strokeDasharray="8 5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${c} ${c}`}
          to={`360 ${c} ${c}`}
          dur="25s"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        cx={c}
        cy={c}
        r={radius - 5}
        fill="none"
        stroke={theme.ringInner}
        strokeWidth="0.75"
        strokeDasharray="3 7"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${c} ${c}`}
          to={`0 ${c} ${c}`}
          dur="18s"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        cx={c}
        cy={c}
        r={radius}
        fill="none"
        stroke={theme.ringColor}
        strokeWidth="2"
      />
      <circle
        cx={c}
        cy={c}
        r={radius - 3}
        fill="none"
        stroke={theme.ringInner}
        strokeWidth="0.75"
      />

      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = deg * DEG_TO_RAD;
        return (
          <circle
            key={deg}
            cx={c + Math.cos(rad) * radius}
            cy={c + Math.sin(rad) * radius}
            r={1.2}
            fill={theme.dotColor}
          />
        );
      })}
    </svg>
  );
}

export function InspectCutout({
  cx,
  cy,
  theme,
}: {
  cx: number;
  cy: number;
  theme: InspectTheme;
}) {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at ${cx}px ${cy}px, transparent ${RING_RADIUS - 4}px, ${theme.cutoutGlow} ${RING_RADIUS}px, rgba(0,0,0,0.3) ${RING_RADIUS + 8}px)`,
        zIndex: 298,
      }}
    />
  );
}

interface InspectPanelProps {
  unitScreenPos: Position;
  theme: InspectTheme;
  onClose: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function InspectPanel({
  unitScreenPos,
  theme,
  onClose,
  header,
  children,
}: InspectPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = React.useState(0);

  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      setMeasuredHeight((prev) => (Math.abs(h - prev) > 5 ? h : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const panelWidth = 280;
  const panelGap = 10;
  const cx = unitScreenPos.x;
  const cy = unitScreenPos.y;

  let panelX = cx - panelWidth / 2;
  panelX = Math.max(10, Math.min(panelX, window.innerWidth - panelWidth - 10));

  const aboveY = cy - RING_RADIUS - panelGap - 24;
  const belowY = cy + RING_RADIUS + panelGap + 24;
  const estimatedH = measuredHeight || 280;
  const fitsAbove = aboveY - estimatedH >= 10;
  const flipBelow = !fitsAbove;
  const panelY = flipBelow ? belowY : aboveY;
  const panelTransform = flipBelow ? "none" : "translateY(-100%)";
  const maxH = flipBelow ? window.innerHeight - belowY - 10 : aboveY - 10;

  return (
    <>
      <InspectCutout cx={cx} cy={cy} theme={theme} />
      <InspectRing cx={cx} cy={cy} theme={theme} />

      <div
        ref={panelRef}
        className="fixed pointer-events-none"
        style={{
          left: panelX,
          top: panelY,
          transform: panelTransform,
          width: panelWidth,
          zIndex: 300,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-auto rounded-xl backdrop-blur-md relative overflow-hidden"
          style={{
            background: panelGradient,
            border: `2px solid ${theme.panelBorder}`,
            boxShadow: `${theme.panelShadow}, 0 8px 32px rgba(0,0,0,0.4)`,
            maxHeight: maxH,
            overflowY: "auto",
          }}
        >
          <div
            className="h-[3px] w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.panelBorder.replace(/[\d.]+\)$/, "0.7)")}, transparent)`,
            }}
          />

          <div
            className="absolute inset-[2px] rounded-[10px] pointer-events-none"
            style={{ border: `1px solid ${theme.panelInner}` }}
          />

          <button
            onClick={onClose}
            className="absolute top-2.5 right-2 p-1 rounded-lg transition-all hover:scale-110 hover:brightness-125 z-20"
            style={{
              background: PANEL.bgDeep,
              border: `1px solid ${theme.panelBorder}`,
              boxShadow: `0 0 8px rgba(0,0,0,0.3)`,
            }}
          >
            <X size={12} className="text-white/70" />
          </button>

          <div
            className="px-3 pt-2.5 pb-1.5"
            style={{
              background: theme.headerBg,
              borderBottom: `1px solid ${theme.headerBorder}`,
            }}
          >
            {header}
          </div>

          <div className="px-3 py-2">{children}</div>

          {!flipBelow ? (
            <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2">
              <div
                className="w-3 h-3 transform rotate-45"
                style={{
                  background: PANEL.bgDark,
                  borderBottom: `1px solid ${theme.panelBorder}`,
                  borderRight: `1px solid ${theme.panelBorder}`,
                }}
              />
            </div>
          ) : (
            <div className="absolute left-1/2 -top-2 transform -translate-x-1/2">
              <div
                className="w-3 h-3 transform rotate-45"
                style={{
                  background: PANEL.bgDark,
                  borderLeft: `1px solid ${theme.panelBorder}`,
                  borderTop: `1px solid ${theme.panelBorder}`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
