"use client";
import React from "react";
import Image from "next/image";
import { LANDING_THEME, GAMEPLAY_SHOWCASE } from "../landingConstants";
import { useCarousel } from "../CarouselControls";
import { SectionFlourish } from "./LoadoutUI";

const T = LANDING_THEME;

const REGION_PALETTES: Record<string, { accent: string; bg: string; mist: string }> = {
  Grasslands:       { accent: "#6ee7b7", bg: "rgba(16,42,28,0.6)",  mist: "rgba(110,231,183,0.04)" },
  "Desert Sands":   { accent: "#fbbf24", bg: "rgba(60,40,10,0.6)",  mist: "rgba(251,191,36,0.05)" },
  "Murky Swamp":    { accent: "#a3e635", bg: "rgba(20,40,12,0.6)",  mist: "rgba(163,230,53,0.04)" },
  "Frozen Wastes":  { accent: "#7dd3fc", bg: "rgba(14,26,50,0.6)",  mist: "rgba(125,211,252,0.05)" },
  "Volcanic Realm": { accent: "#f87171", bg: "rgba(60,14,14,0.6)",  mist: "rgba(248,113,113,0.05)" },
};

export function GameplayShowcase() {
  const { active, next, prev, goTo } = useCarousel(GAMEPLAY_SHOWCASE.length, 5000);
  const current = GAMEPLAY_SHOWCASE[active];
  const palette = REGION_PALETTES[current.label] ?? { accent: T.accent, bg: "rgba(20,16,10,0.6)", mist: "rgba(212,168,74,0.04)" };

  return (
    <section className="relative py-12 sm:py-16">
      <SectionFlourish />

      <div className="text-center mt-8 sm:mt-12 mb-6 sm:mb-8 px-6">
        <p
          className="text-[10px] sm:text-xs font-bold tracking-[0.35em] uppercase mb-3"
          style={{ color: `rgba(${T.accentRgb},0.35)` }}
        >
          5 Regions to Explore
        </p>
        <h2
          className="text-3xl sm:text-5xl font-bold tracking-wide font-cinzel"
          style={{
            color: T.accent,
            textShadow: `0 0 60px rgba(${T.accentRgb},0.3), 0 4px 12px rgba(0,0,0,0.6)`,
          }}
        >
          The Five Kingdoms
        </h2>
      </div>

      {/* Cinematic carousel — full-bleed feel */}
      <div className="relative mx-2 sm:mx-4 lg:mx-8">
        <div
          className="relative aspect-[2.2/1] sm:aspect-[2.5/1] rounded-xl overflow-hidden"
          style={{
            border: `1px solid ${palette.accent}20`,
            boxShadow: `0 0 80px ${palette.accent}08, 0 20px 60px rgba(0,0,0,0.6)`,
            transition: "border-color 0.8s, box-shadow 0.8s",
          }}
        >
          {/* Slides */}
          {GAMEPLAY_SHOWCASE.map((slide, i) => {
            const isActive = i === active;
            return (
              <div
                key={slide.src}
                className="absolute inset-0"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "scale(1.03)" : "scale(1.08)",
                  transition: "opacity 1.4s ease-in-out, transform 12s ease-out",
                }}
              >
                <Image
                  src={slide.src}
                  alt={slide.label}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            );
          })}

          {/* Color atmosphere overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000"
            style={{ background: palette.bg, mixBlendMode: "multiply" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(0,0,0,0.65) 100%)",
            }}
          />

          {/* Bottom gradient with region name */}
          <div
            className="absolute bottom-0 inset-x-0 p-6 sm:p-10"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)",
            }}
          >
            <div className="flex items-end justify-between">
              <div>
                <h3
                  className="text-2xl sm:text-4xl lg:text-5xl font-bold font-cinzel tracking-wide transition-colors duration-700"
                  style={{
                    color: palette.accent,
                    textShadow: `0 0 30px ${palette.accent}50, 0 2px 8px rgba(0,0,0,0.8)`,
                  }}
                >
                  {current.label}
                </h3>
              </div>

              {/* Inline progress strip */}
              <div className="flex gap-1.5 items-end">
                {GAMEPLAY_SHOWCASE.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="transition-all duration-500 rounded-sm cursor-pointer"
                    style={{
                      width: i === active ? 24 : 4,
                      height: i === active ? 4 : 4,
                      background: i === active ? palette.accent : `${palette.accent}30`,
                      boxShadow: i === active ? `0 0 10px ${palette.accent}60` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation zones — large invisible click targets */}
          <button
            onClick={prev}
            className="absolute left-0 top-0 bottom-0 w-1/4 cursor-pointer z-10 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke={palette.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-0 bottom-0 w-1/4 cursor-pointer z-10 group"
          >
            <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke={palette.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </button>

          {/* Inner frame line */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ boxShadow: `inset 0 0 80px rgba(0,0,0,0.5), inset 0 0 2px ${palette.accent}15` }}
          />
        </div>
      </div>
    </section>
  );
}
