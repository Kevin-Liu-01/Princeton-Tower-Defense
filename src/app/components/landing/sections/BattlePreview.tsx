"use client";
import Image from "next/image";
import React from "react";

import { useCarousel } from "../CarouselControls";
import { LANDING_THEME, BATTLE_PREVIEW_SLIDES } from "../landingConstants";
import { SectionFlourish } from "./LoadoutUI";
import {
  MapSectionHeader,
  MapSectionBg,
  MapContentPanel,
  SectionBorderFrame,
} from "./mapElements";

const T = LANDING_THEME;

function MapThumbnail({
  src,
  label,
  index,
  active,
  onClick,
}: {
  src: string;
  label: string;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 cursor-pointer transition-all duration-500 group"
      style={{
        border: active
          ? `2px solid rgba(${T.accentRgb},0.5)`
          : "1.5px solid rgba(255,255,255,0.06)",
        borderRadius: active ? 12 : 8,
        boxShadow: active
          ? `0 0 30px rgba(${T.accentRgb},0.15), 0 8px 24px rgba(0,0,0,0.5)`
          : "0 2px 8px rgba(0,0,0,0.3)",
        height: active ? 112 : 72,
        overflow: "hidden",
        transform: active ? "translateY(-4px)" : "translateY(0)",
        width: active ? 180 : 72,
      }}
    >
      <Image
        src={src}
        alt={label}
        fill
        sizes={active ? "180px" : "72px"}
        className="object-cover"
      />

      {!active && (
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-200" />
      )}

      {active && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)",
          }}
        >
          <div className="absolute bottom-2 left-2 right-2">
            <span className="text-[9px] sm:text-[10px] font-bold text-white/90 block truncate">
              {label}
            </span>
          </div>
        </div>
      )}

      {!active && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <span className="text-[7px] font-bold text-white/50">
            {index + 1}
          </span>
        </div>
      )}
    </button>
  );
}

export function BattlePreview() {
  const { active, next, prev, goTo } = useCarousel(
    BATTLE_PREVIEW_SLIDES.length,
    5000
  );
  const current = BATTLE_PREVIEW_SLIDES[active];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <MapSectionBg gridOpacity={0.035} />
      <div className="absolute inset-0 landing-texture-crosshatch pointer-events-none opacity-50" />
      <SectionBorderFrame />

      <div className="relative z-10">
        <SectionFlourish />
        <MapSectionHeader
          subtitle="25+ Hand-Crafted Maps"
          title="The Campaign"
        />

        {/* Main preview image */}
        <div className="mx-3 sm:mx-6 lg:mx-12 mb-6">
          <MapContentPanel>
            <div
              className="relative aspect-[16/9] rounded-2xl overflow-hidden"
              style={{
                border: `1px solid rgba(${T.accentDarkRgb},0.2)`,
                boxShadow: `0 0 80px rgba(${T.accentRgb},0.06), 0 20px 60px rgba(0,0,0,0.5)`,
              }}
            >
              {BATTLE_PREVIEW_SLIDES.map((slide, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={slide.src}
                    className="absolute inset-0"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "scale(1.02)" : "scale(1.06)",
                      transition:
                        "opacity 1.2s ease-in-out, transform 10s ease-out",
                    }}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.label}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                );
              })}

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)",
                }}
              />

              {/* Bottom info */}
              <div
                className="absolute bottom-0 inset-x-0 p-5 sm:p-8"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
                }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <h3
                      className="text-xl sm:text-3xl font-bold font-cinzel tracking-wide"
                      style={{
                        color: T.accent,
                        textShadow: `0 0 20px rgba(${T.accentRgb},0.4)`,
                      }}
                    >
                      {current?.label}
                    </h3>
                    <span
                      className="text-[9px] uppercase tracking-[0.2em] font-medium mt-1 block"
                      style={{ color: `rgba(${T.accentRgb},0.3)` }}
                    >
                      Battle {active + 1} of {BATTLE_PREVIEW_SLIDES.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nav zones */}
              <button
                onClick={prev}
                className="absolute left-0 top-0 bottom-0 w-1/5 cursor-pointer z-10 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-0 bottom-0 w-1/5 cursor-pointer z-10 group"
              >
                <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 60px rgba(0,0,0,0.4)",
                }}
              />
            </div>
          </MapContentPanel>
        </div>

        {/* Map filmstrip */}
        <div className="flex gap-2 sm:gap-3 justify-center items-end px-4 flex-wrap">
          {BATTLE_PREVIEW_SLIDES.map((slide, i) => (
            <MapThumbnail
              key={slide.src}
              src={slide.src}
              label={slide.label}
              index={i}
              active={i === active}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
