"use client";
import React from "react";
import Image from "next/image";
import { LANDING_THEME, BATTLE_PREVIEW_SLIDES } from "../landingConstants";
import { useCarousel, CarouselDots, CarouselArrow } from "../CarouselControls";

const T = LANDING_THEME;

export function BattlePreview() {
  const { active, next, prev, goTo } = useCarousel(
    BATTLE_PREVIEW_SLIDES.length,
    5000,
  );
  const current = BATTLE_PREVIEW_SLIDES[active];

  return (
    <section className="py-16 sm:py-24 overflow-hidden">
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
          Operations
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Mission Select
        </h2>
      </div>

      <div className="relative mx-3 sm:mx-6 lg:mx-12">
        <CarouselArrow direction="left" onClick={prev} />
        <CarouselArrow direction="right" onClick={next} />

        <div
          className="relative aspect-[16/9] rounded-2xl overflow-hidden"
          style={{
            boxShadow: `0 0 60px rgba(${T.accentRgb},0.05), 0 16px 48px rgba(0,0,0,0.5)`,
          }}
        >
          {BATTLE_PREVIEW_SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              className="absolute inset-0"
              style={{
                opacity: i === active ? 1 : 0,
                transition: "opacity 1s ease-in-out",
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
          ))}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)",
            }}
          />

          <div
            className="absolute bottom-0 inset-x-0 p-5 sm:p-8 flex items-end justify-between"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4) 60%, transparent)",
            }}
          >
            <div>
              <span
                className="text-lg sm:text-xl font-bold tracking-wider block"
                style={{ color: `rgba(${T.accentRgb},0.9)` }}
              >
                {current?.label}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] font-medium"
                style={{ color: `rgba(${T.accentRgb},0.35)` }}
              >
                Map {active + 1} of {BATTLE_PREVIEW_SLIDES.length}
              </span>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: `1.5px solid rgba(${T.accentDarkRgb},0.15)` }}
          />
        </div>

        <CarouselDots
          count={BATTLE_PREVIEW_SLIDES.length}
          active={active}
          onDot={goTo}
        />
      </div>
    </section>
  );
}
