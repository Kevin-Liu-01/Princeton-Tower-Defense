"use client";

import React from "react";
import type { Position } from "../../types";
import { X } from "lucide-react";
import { PANEL, GOLD, panelGradient } from "./system/theme";

export type InspectTheme = {
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
};

export const ENEMY_INSPECT_THEME: InspectTheme = {
  ringColor: "rgba(239, 68, 68, 0.5)",
  ringGlow: "rgba(239, 68, 68, 0.12)",
  ringDash: "rgba(239, 68, 68, 0.18)",
  ringInner: "rgba(239, 68, 68, 0.1)",
  cutoutGlow: "rgba(239, 68, 68, 0.25)",
  panelBorder: "rgba(239, 68, 68, 0.35)",
  panelShadow: "0 0 24px rgba(239, 68, 68, 0.12), inset 0 0 12px rgba(239, 68, 68, 0.05)",
  panelInner: "rgba(239, 68, 68, 0.1)",
  headerBg: "linear-gradient(90deg, rgba(30, 10, 10, 0.9), rgba(45, 15, 15, 0.7))",
  headerBorder: "rgba(239, 68, 68, 0.25)",
  dotColor: "rgba(239, 68, 68, 0.2)",
};

export const TROOP_INSPECT_THEME: InspectTheme = {
  ringColor: "rgba(59, 130, 246, 0.5)",
  ringGlow: "rgba(59, 130, 246, 0.12)",
  ringDash: "rgba(59, 130, 246, 0.18)",
  ringInner: "rgba(59, 130, 246, 0.1)",
  cutoutGlow: "rgba(59, 130, 246, 0.25)",
  panelBorder: "rgba(59, 130, 246, 0.4)",
  panelShadow: "0 0 24px rgba(59, 130, 246, 0.15), inset 0 0 12px rgba(59, 130, 246, 0.06)",
  panelInner: "rgba(59, 130, 246, 0.12)",
  headerBg: "linear-gradient(90deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7))",
  headerBorder: "rgba(59, 130, 246, 0.25)",
  dotColor: "rgba(59, 130, 246, 0.2)",
};

export const HERO_INSPECT_THEME: InspectTheme = {
  ringColor: "rgba(245, 158, 11, 0.5)",
  ringGlow: "rgba(245, 158, 11, 0.12)",
  ringDash: "rgba(245, 158, 11, 0.18)",
  ringInner: "rgba(245, 158, 11, 0.1)",
  cutoutGlow: "rgba(245, 158, 11, 0.25)",
  panelBorder: "rgba(245, 158, 11, 0.4)",
  panelShadow: "0 0 24px rgba(245, 158, 11, 0.15), inset 0 0 12px rgba(245, 158, 11, 0.06)",
  panelInner: "rgba(245, 158, 11, 0.12)",
  headerBg: "linear-gradient(90deg, rgba(30, 20, 10, 0.9), rgba(45, 30, 15, 0.7))",
  headerBorder: "rgba(245, 158, 11, 0.3)",
  dotColor: "rgba(245, 158, 11, 0.2)",
};

const DEG_TO_RAD = Math.PI / 180;
const RING_RADIUS = 55;

export function InspectRing({ cx, cy, theme }: { cx: number; cy: number; theme: InspectTheme }) {
  const radius = RING_RADIUS;
  const outerR = radius + 10;
  const pad = 4;
  const size = (outerR + pad) * 2;
  const c = size / 2;

  return (
    <svg
      className="fixed pointer-events-none"
      style={{
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
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

      <circle cx={c} cy={c} r={radius} fill="none" stroke={theme.ringGlow} strokeWidth="6" filter="url(#inspectRingGlow)" />

      <circle cx={c} cy={c} r={outerR} fill="none" stroke={theme.ringDash} strokeWidth="1" strokeDasharray="8 5">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${c} ${c}`} to={`360 ${c} ${c}`} dur="25s" repeatCount="indefinite" />
      </circle>

      <circle cx={c} cy={c} r={radius - 5} fill="none" stroke={theme.ringInner} strokeWidth="0.75" strokeDasharray="3 7">
        <animateTransform attributeName="transform" type="rotate" from={`360 ${c} ${c}`} to={`0 ${c} ${c}`} dur="18s" repeatCount="indefinite" />
      </circle>

      <circle cx={c} cy={c} r={radius} fill="none" stroke={theme.ringColor} strokeWidth="2" />
      <circle cx={c} cy={c} r={radius - 3} fill="none" stroke={theme.ringInner} strokeWidth="0.75" />

      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = deg * DEG_TO_RAD;
        return <circle key={deg} cx={c + Math.cos(rad) * radius} cy={c + Math.sin(rad) * radius} r={1.2} fill={theme.dotColor} />;
      })}
    </svg>
  );
}

export function InspectCutout({ cx, cy, theme }: { cx: number; cy: number; theme: InspectTheme }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 298,
        background: `radial-gradient(circle at ${cx}px ${cy}px, transparent ${RING_RADIUS - 4}px, ${theme.cutoutGlow} ${RING_RADIUS}px, rgba(0,0,0,0.3) ${RING_RADIUS + 8}px)`,
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

export function InspectPanel({ unitScreenPos, theme, onClose, header, children }: InspectPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = React.useState(0);

  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      setMeasuredHeight((prev) => (Math.abs(h - prev) > 5 ? h : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const panelWidth = 260;
  const panelGap = 10;
  const cx = unitScreenPos.x;
  const cy = unitScreenPos.y;

  let panelX = cx - panelWidth / 2;
  panelX = Math.max(10, Math.min(panelX, window.innerWidth - panelWidth - 10));

  const aboveY = cy - RING_RADIUS - panelGap - 24;
  const belowY = cy + RING_RADIUS + panelGap + 24;
  const estimatedH = measuredHeight || 260;
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
        style={{ left: panelX, top: panelY, transform: panelTransform, zIndex: 300, width: panelWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-auto rounded-lg backdrop-blur-sm relative"
          style={{
            background: panelGradient,
            border: `2px solid ${theme.panelBorder}`,
            boxShadow: theme.panelShadow,
            maxHeight: maxH,
            overflowY: "auto",
          }}
        >
          <div className="absolute inset-[2px] rounded-[7px] pointer-events-none" style={{ border: `1px solid ${theme.panelInner}` }} />

          <button
            onClick={onClose}
            className="absolute top-1.5 right-1.5 p-0.5 rounded-md transition-all hover:scale-110 z-20"
            style={{ background: PANEL.bgWarmMid, border: `1px solid ${theme.panelBorder}` }}
          >
            <X size={12} className="text-white/70" />
          </button>

          <div className="px-2 pt-2 pb-1" style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.headerBorder}`, borderRadius: "6px 6px 0 0" }}>
            {header}
          </div>

          <div className="px-2 py-1.5">
            {children}
          </div>

          {!flipBelow ? (
            <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2">
              <div className="w-3 h-3 transform rotate-45" style={{ background: PANEL.bgDark, borderBottom: `1px solid ${theme.panelBorder}`, borderRight: `1px solid ${theme.panelBorder}` }} />
            </div>
          ) : (
            <div className="absolute left-1/2 -top-2 transform -translate-x-1/2">
              <div className="w-3 h-3 transform rotate-45" style={{ background: PANEL.bgDark, borderTop: `1px solid ${theme.panelBorder}`, borderLeft: `1px solid ${theme.panelBorder}` }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
