"use client";
import React from "react";
import Image from "next/image";
import {
  LANDING_THEME,
  BATTLE_PREVIEW_SLIDES,
  CROSSFADE_INTERVAL_MS,
} from "../landingConstants";
import { useCrossfade } from "../hooks/useCrossfade";

const T = LANDING_THEME;

export function BattlePreview() {
  const activeSlide = useCrossfade(BATTLE_PREVIEW_SLIDES.length, CROSSFADE_INTERVAL_MS);
  const current = BATTLE_PREVIEW_SLIDES[activeSlide];

  return (
    <section className="py-14 sm:py-20 px-6">
      <div className="text-center mb-8 sm:mb-12">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          Explore
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          25+ Unique Battlefields
        </h2>
      </div>

      <div
        className="relative max-w-2xl mx-auto aspect-[16/10] rounded-2xl overflow-hidden"
        style={{
          border: `2px solid rgba(${T.accentDarkRgb},0.25)`,
          boxShadow: `0 0 60px rgba(${T.accentRgb},0.08), 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {BATTLE_PREVIEW_SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0"
            style={{
              opacity: i === activeSlide ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
            }}
          >
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              sizes="(max-width: 768px) 90vw, 672px"
              className="object-cover"
            />
          </div>
        ))}

        {/* Label overlay */}
        <div
          className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex items-end justify-between"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          }}
        >
          <span
            className="text-sm sm:text-base font-bold tracking-wider"
            style={{ color: `rgba(${T.accentRgb},0.85)` }}
          >
            {current?.label}
          </span>

          {/* Slide indicators */}
          <div className="flex gap-1.5">
            {BATTLE_PREVIEW_SLIDES.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                style={{
                  background:
                    i === activeSlide
                      ? T.accent
                      : `rgba(${T.accentRgb},0.2)`,
                  transform: i === activeSlide ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Top edge glow */}
        <div
          className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${T.accentRgb},0.2), transparent)`,
          }}
        />
      </div>
    </section>
  );
}
