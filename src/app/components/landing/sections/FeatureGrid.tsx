"use client";
import React from "react";
import {
  LANDING_THEME,
  LANDING_STATS,
  type FeatureStat,
} from "../landingConstants";
import { SlotCorners } from "./LoadoutUI";

const T = LANDING_THEME;

function FeatureCard({ stat, index }: { stat: FeatureStat; index: number }) {
  const Icon = stat.icon;
  return (
    <div
      className="group relative flex flex-col items-center gap-1.5 sm:gap-2.5 p-4 sm:p-5 transition-all duration-300 hover:scale-[1.04]"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <SlotCorners color={T.accent} />

      <div
        className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 20px rgba(${T.accentRgb},0.06), 0 0 20px rgba(${T.accentRgb},0.04)`,
        }}
      />
      <Icon
        size={22}
        style={{ color: `rgba(${T.accentRgb},0.4)` }}
        strokeWidth={1.5}
        className="transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_rgba(212,168,74,0.3)]"
      />
      <span
        className="text-2xl sm:text-3xl font-bold tabular-nums transition-all duration-300"
        style={{ color: T.accent }}
      >
        {stat.value}
      </span>
      <span
        className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color: `rgba(${T.accentRgb},0.35)` }}
      >
        {stat.label}
      </span>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section className="py-14 sm:py-20 px-6">
      <div
        className="h-px mx-auto w-4/5 max-w-xl"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${T.accentDarkRgb},0.25), transparent)`,
        }}
      />

      <div className="text-center mt-10 sm:mt-16 mb-8 sm:mb-12">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          Intel
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Mission Briefing
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-5 max-w-4xl mx-auto">
        {LANDING_STATS.map((stat, i) => (
          <FeatureCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>
    </section>
  );
}
