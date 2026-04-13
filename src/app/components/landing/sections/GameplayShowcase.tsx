"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { CardFrame } from "../CardFrame";
import { LANDING_THEME, GAMEPLAY_SHOWCASE } from "../landingConstants";
import { SectionFlourish } from "./LoadoutUI";
import { MapSectionHeader, MapSectionBg } from "./mapElements";

const T = LANDING_THEME;

const REGION_PALETTES: Record<string, { accent: string; bg: string }> = {
  "Desert Sands": { accent: "#fbbf24", bg: "rgba(60,40,10,0.55)" },
  "Frozen Wastes": { accent: "#7dd3fc", bg: "rgba(14,26,50,0.55)" },
  Grasslands: { accent: "#6ee7b7", bg: "rgba(16,42,28,0.55)" },
  "Murky Swamp": { accent: "#a3e635", bg: "rgba(20,40,12,0.55)" },
  "Volcanic Realm": { accent: "#f87171", bg: "rgba(60,14,14,0.55)" },
};

function RegionTile({
  src,
  label,
  featured,
  href,
  onHover,
}: {
  src: string;
  label: string;
  featured: boolean;
  href: string;
  onHover: () => void;
}) {
  const palette = REGION_PALETTES[label] ?? {
    accent: T.accent,
    bg: "rgba(20,16,10,0.55)",
  };

  return (
    <CardFrame
      accent={palette.accent}
      glow={featured ? `${palette.accent}20` : undefined}
      className={`transition-all duration-500 ${featured ? "scale-[1.02]" : ""}`}
    >
      <Link
        href={href}
        onMouseEnter={onHover}
        onFocus={onHover}
        className="relative rounded overflow-hidden cursor-pointer group block"
      >
        <div className="aspect-[16/10] relative">
          <Image
            src={src}
            alt={label}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: palette.bg,
              mixBlendMode: "multiply",
              opacity: featured ? 0.3 : 0.5,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              boxShadow: `inset 0 0 30px rgba(0,0,0,0.4), inset 0 0 1px ${palette.accent}15`,
              opacity: featured ? 1 : 0.5,
            }}
          />

          <div
            className="absolute bottom-0 inset-x-0 px-3 py-2.5 sm:px-4 sm:py-3"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
            }}
          >
            <h3
              className="text-sm sm:text-base lg:text-lg font-bold font-cinzel tracking-wide transition-colors duration-500"
              style={{
                color: featured ? palette.accent : `${palette.accent}90`,
                textShadow: `0 0 16px ${palette.accent}40, 0 1px 4px rgba(0,0,0,0.8)`,
              }}
            >
              {label}
            </h3>
          </div>

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 20px ${palette.accent}15`,
            }}
          />
        </div>
      </Link>
    </CardFrame>
  );
}

export function GameplayShowcase() {
  const [featured, setFeatured] = useState(0);

  return (
    <section className="relative py-12 sm:py-16">
      <MapSectionBg />
      <div className="absolute inset-0 landing-texture-crosshatch pointer-events-none opacity-40" />
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <OrnateFrame
          className="w-full h-full"
          cornerSize={40}
          borderVariant="compact"
        >
          <div className="w-full h-full" />
        </OrnateFrame>
      </div>
      <div className="relative z-10">
        <SectionFlourish />
        <MapSectionHeader title="Battle Across 6 Regions" />
      </div>

      <div className="relative mx-4 sm:mx-8 lg:mx-16 z-10">
        {/* Top row: 3 tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
          {GAMEPLAY_SHOWCASE.slice(0, 3).map((slide, i) => (
            <RegionTile
              key={slide.src}
              src={slide.src}
              label={slide.label}
              featured={featured === i}
              href={`/${slide.levelId}`}
              onHover={() => setFeatured(i)}
            />
          ))}
        </div>

        {/* Bottom row: 3 tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {GAMEPLAY_SHOWCASE.slice(3).map((slide, i) => (
            <RegionTile
              key={slide.src}
              src={slide.src}
              label={slide.label}
              featured={featured === i + 3}
              href={`/${slide.levelId}`}
              onHover={() => setFeatured(i + 3)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
