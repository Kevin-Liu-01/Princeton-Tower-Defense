"use client";
import { Swords } from "lucide-react";
import React from "react";

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
      className="group relative px-12 sm:px-16 py-4 sm:py-[1.15rem] rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, #f5c24a 0%, #d89420 42%, #a86818 78%, #7a4a0f 100%)",
        border: `1px solid rgba(${T.accentRgb},0.75)`,
        boxShadow: [
          `0 0 40px rgba(${T.accentRgb},0.28)`,
          `0 0 90px rgba(${T.princetonRgb},0.12)`,
          "0 10px 28px rgba(0,0,0,0.55)",
          "0 2px 0 rgba(0,0,0,0.4)",
          "inset 0 1px 0 rgba(255,240,200,0.55)",
          "inset 0 -1px 0 rgba(60,30,0,0.4)",
          `inset 0 0 0 1px rgba(${T.accentRgb},0.2)`,
        ].join(", "),
      }}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 70px rgba(${T.princetonRgb},0.45), 0 0 140px rgba(${T.accentRgb},0.22)`,
        }}
      />
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            animation: "landing-shimmer 4s ease-in-out infinite",
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,248,220,0.22) 50%, transparent 60%)",
          }}
        />
      </div>
      <div
        className="absolute top-px left-[8%] right-[8%] h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,248,220,0.7), transparent)",
        }}
      />
      <div
        className="absolute bottom-px left-[20%] right-[20%] h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,0,0,0.35), transparent)",
        }}
      />
      <div className="relative flex items-center gap-3">
        <Swords
          size={22}
          strokeWidth={2.2}
          className="text-amber-100 group-hover:text-white transition-colors"
          style={{ filter: "drop-shadow(0 1px 2px rgba(60,30,0,0.5))" }}
        />
        <span
          className="text-base sm:text-lg font-black tracking-[0.22em] uppercase"
          style={{
            color: "#fff8e1",
            textShadow:
              "0 1px 2px rgba(80,40,0,0.6), 0 0 14px rgba(255,220,140,0.25)",
          }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}
