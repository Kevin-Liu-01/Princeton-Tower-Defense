"use client";
import React from "react";
import Image from "next/image";
import { LANDING_THEME, GAMEPLAY_SHOWCASE } from "../landingConstants";

const T = LANDING_THEME;

function SectionDivider() {
  return (
    <div
      className="h-px mx-auto w-4/5 max-w-xl"
      style={{
        background: `linear-gradient(90deg, transparent, rgba(${T.accentDarkRgb},0.25), transparent)`,
      }}
    />
  );
}

function ShowcaseCard({ src, label }: { src: string; label: string }) {
  return (
    <div
      className="relative w-[260px] sm:w-[340px] md:w-[400px] aspect-video rounded-xl overflow-hidden flex-shrink-0"
      style={{
        border: `1px solid rgba(${T.accentDarkRgb},0.2)`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(${T.accentRgb},0.05)`,
      }}
    >
      <Image
        src={src}
        alt={label}
        fill
        sizes="(max-width: 640px) 260px, (max-width: 768px) 340px, 400px"
        className="object-cover"
      />
      <div
        className="absolute bottom-0 inset-x-0 p-3 sm:p-4"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
      >
        <span
          className="text-xs sm:text-sm font-bold tracking-[0.15em] uppercase"
          style={{ color: `rgba(${T.accentRgb},0.85)` }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export function GameplayShowcase() {
  const items = GAMEPLAY_SHOWCASE;
  const doubled = [...items, ...items];

  return (
    <section className="py-14 sm:py-20 overflow-hidden">
      <SectionDivider />

      <div className="text-center mt-10 sm:mt-16 mb-8 sm:mb-12">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          Battle Across
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Five Unique Regions
        </h2>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Side fade masks */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${T.bg}, transparent)` }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${T.bg}, transparent)` }}
        />

        {/* Scrollable on mobile, marquee on desktop */}
        <div className="overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory">
          <div
            className="flex gap-4 sm:gap-6 px-6 md:px-0 md:animate-landing-marquee"
            style={{ width: "max-content" }}
          >
            {doubled.map((slide, i) => (
              <div key={`${slide.label}-${i}`} className="snap-center">
                <ShowcaseCard src={slide.src} label={slide.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
