"use client";
import React from "react";
import { Swords } from "lucide-react";
import { LANDING_THEME } from "./landingConstants";

const T = LANDING_THEME;

interface LandingCTAProps {
  onClick: () => void;
  disabled: boolean;
  label?: string;
}

export function LandingCTA({
  onClick,
  disabled,
  label = "Enter the Realm",
}: LandingCTAProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative px-10 sm:px-14 py-3.5 sm:py-4.5 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] active:scale-95 disabled:pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, rgba(190,138,30,0.95) 0%, rgba(120,78,15,0.98) 100%)",
        border: `2px solid rgba(${T.accentRgb},0.6)`,
        boxShadow: `0 0 40px rgba(${T.accentRgb},0.2), 0 0 80px rgba(${T.princetonRgb},0.08), 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)`,
      }}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 60px rgba(${T.princetonRgb},0.4), 0 0 120px rgba(${T.accentRgb},0.15)`,
        }}
      />
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
            animation: "landing-shimmer 4s ease-in-out infinite",
          }}
        />
      </div>
      <div
        className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
      />
      <div className="relative flex items-center gap-3">
        <Swords
          size={22}
          className="text-amber-200 group-hover:text-amber-100 transition-colors"
        />
        <span
          className="text-base sm:text-lg font-bold tracking-[0.2em] uppercase"
          style={{
            color: "rgba(255,240,200,0.95)",
            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}
