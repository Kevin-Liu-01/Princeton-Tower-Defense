"use client";
import React from "react";
import { LANDING_THEME, LANDING_STATS, type FeatureStat } from "../landingConstants";

const T = LANDING_THEME;

function FeatureCard({ stat }: { stat: FeatureStat }) {
  const Icon = stat.icon;
  return (
    <div
      className="flex flex-col items-center gap-1.5 sm:gap-2.5 p-4 sm:p-5 rounded-xl transition-colors duration-300"
      style={{
        background: `rgba(${T.accentDarkRgb},0.06)`,
        border: `1px solid rgba(${T.accentDarkRgb},0.12)`,
      }}
    >
      <Icon size={22} style={{ color: `rgba(${T.accentRgb},0.4)` }} strokeWidth={1.5} />
      <span
        className="text-2xl sm:text-3xl font-bold tabular-nums"
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
      <div className="text-center mb-8 sm:mb-12">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          What Awaits
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Your Arsenal
        </h2>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 max-w-3xl mx-auto">
        {LANDING_STATS.map((stat) => (
          <FeatureCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
