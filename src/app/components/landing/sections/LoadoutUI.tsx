"use client";
import React from "react";
import { LANDING_THEME } from "../landingConstants";

const T = LANDING_THEME;

export interface StatBarData {
  label: string;
  pct: number;
  display: string;
}

export function StatBar({
  label,
  pct,
  display,
  color,
}: StatBarData & { color: string }) {
  const clamped = Math.max(0, Math.min(100, pct * 100));
  return (
    <div className="flex items-center gap-2.5 group">
      <span
        className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] w-12 text-right flex-shrink-0 transition-colors duration-200"
        style={{ color: `${color}88` }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-[7px] sm:h-[8px] rounded-[3px] overflow-hidden relative"
        style={{
          background: "rgba(255,255,255,0.05)",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="h-full rounded-[3px] transition-all duration-700 ease-out relative animate-landing-stat-glow"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${color}44, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}40, 0 0 2px ${color}60`,
          }}
        >
          <div
            className="absolute inset-0 rounded-[3px] pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute top-0 right-0 w-[3px] h-full rounded-r-[3px]"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.5), ${color})`,
              boxShadow: `0 0 6px ${color}80`,
            }}
          />
        </div>
      </div>
      <span
        className="text-[8px] sm:text-[10px] font-bold tabular-nums w-12 flex-shrink-0 text-right transition-colors duration-200"
        style={{ color: `${color}cc` }}
      >
        {display}
      </span>
    </div>
  );
}

export function accentDividerGradient(color: string): string {
  return `linear-gradient(90deg, transparent 0%, ${color}25 15%, ${color}50 35%, ${color}70 50%, ${color}50 65%, ${color}25 85%, transparent 100%)`;
}

export function SectionFlourish({
  color = T.accent,
  darkColor = T.accentDark,
  brightColor = T.accentBright,
}: {
  color?: string;
  darkColor?: string;
  brightColor?: string;
}) {
  return (
    <div
      className="flex justify-center w-4/5 mx-auto"
      style={{ maxWidth: 360 }}
    >
      <svg
        viewBox="0 0 360 24"
        fill="none"
        className="w-full"
        style={{ height: 24 }}
      >
        <defs>
          <linearGradient id="flourish-line-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={darkColor} stopOpacity="0" />
            <stop offset="100%" stopColor={darkColor} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="flourish-line-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={darkColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={darkColor} stopOpacity="0" />
          </linearGradient>
          <filter id="flourish-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d="M0 12 L130 12" stroke="url(#flourish-line-l)" strokeWidth="1" />
        <path d="M20 9 L120 9" stroke="url(#flourish-line-l)" strokeWidth="0.4" opacity="0.3" />
        <path d="M230 12 L360 12" stroke="url(#flourish-line-r)" strokeWidth="1" />
        <path d="M240 9 L340 9" stroke="url(#flourish-line-r)" strokeWidth="0.4" opacity="0.3" />

        <g filter="url(#flourish-glow)">
          <path
            d="M180 3 L189 12 L180 21 L171 12 Z"
            fill={color}
            opacity="0.2"
            stroke={color}
            strokeWidth="0.8"
          />
          <path
            d="M180 5.5 L186.5 12 L180 18.5 L173.5 12 Z"
            fill="none"
            stroke={brightColor}
            strokeWidth="0.6"
            opacity="0.6"
          />
          <circle cx="180" cy="12" r="3" fill={color} opacity="0.9" />
          <circle cx="180" cy="12" r="1.5" fill={brightColor} opacity="0.7" />
        </g>

        <path d="M150 12 L154 8.5 L158 12 L154 15.5 Z" fill={color} opacity="0.5" />
        <path d="M202 12 L206 8.5 L210 12 L206 15.5 Z" fill={color} opacity="0.5" />

        <path d="M138 12 L140 10 L142 12 L140 14 Z" fill={color} opacity="0.3" />
        <path d="M218 12 L220 10 L222 12 L220 14 Z" fill={color} opacity="0.3" />

        <circle cx="50" cy="12" r="1.5" fill={brightColor} opacity="0.4" />
        <circle cx="90" cy="12" r="1" fill={brightColor} opacity="0.3" />
        <circle cx="270" cy="12" r="1" fill={brightColor} opacity="0.3" />
        <circle cx="310" cy="12" r="1.5" fill={brightColor} opacity="0.4" />

        <circle cx="110" cy="12" r="0.6" fill={color} opacity="0.25" />
        <circle cx="250" cy="12" r="0.6" fill={color} opacity="0.25" />
      </svg>
    </div>
  );
}
