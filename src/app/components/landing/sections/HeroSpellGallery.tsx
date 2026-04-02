"use client";
import React from "react";
import Image from "next/image";
import {
  LANDING_THEME,
  HERO_GALLERY,
  SPELL_GALLERY,
  type CharacterDisplay,
} from "../landingConstants";

const T = LANDING_THEME;

function HeroPortrait({ hero }: { hero: CharacterDisplay }) {
  return (
    <div className="group flex flex-col items-center gap-2 flex-shrink-0 snap-center">
      <div className="relative">
        {/* Aura ring on hover */}
        <div
          className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{
            background: `conic-gradient(from 0deg, ${hero.color}33, transparent, ${hero.color}33, transparent, ${hero.color}33)`,
            animation: "landing-spin 6s linear infinite",
          }}
        />
        <div
          className="relative w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full overflow-hidden animate-landing-portrait-glow transition-transform duration-300 group-hover:scale-[1.08]"
          style={{
            border: `2.5px solid ${hero.color}`,
            "--glow-color": `${hero.color}55`,
          } as React.CSSProperties}
        >
          <Image
            src={hero.image}
            alt={hero.name}
            fill
            sizes="88px"
            className="object-cover object-top"
          />
        </div>
      </div>
      <span
        className="text-[10px] sm:text-xs font-semibold text-center whitespace-nowrap transition-all duration-300 group-hover:tracking-wider"
        style={{ color: hero.color }}
      >
        {hero.name}
      </span>
    </div>
  );
}

function SpellIcon({ spell }: { spell: CharacterDisplay }) {
  return (
    <div className="group flex flex-col items-center gap-2 flex-shrink-0">
      <div
        className="relative w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:rounded-xl"
        style={{
          border: `2px solid ${spell.color}44`,
          boxShadow: `0 0 16px ${spell.color}22`,
        }}
      >
        <Image
          src={spell.image}
          alt={spell.name}
          fill
          sizes="68px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Hover glow overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px ${spell.color}22` }}
        />
      </div>
      <span
        className="text-[9px] sm:text-[11px] font-semibold text-center max-w-[72px] leading-tight"
        style={{ color: `${spell.color}cc` }}
      >
        {spell.name}
      </span>
    </div>
  );
}

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

export function HeroSpellGallery() {
  return (
    <section className="py-14 sm:py-20 overflow-hidden">
      <SectionDivider />

      {/* Heroes */}
      <div className="text-center mt-10 sm:mt-16 mb-6 sm:mb-10">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          Command
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Legendary Heroes
        </h2>
      </div>

      <div className="flex gap-5 sm:gap-7 overflow-x-auto px-6 pb-2 no-scrollbar snap-x snap-mandatory justify-start sm:justify-center">
        {HERO_GALLERY.map((hero) => (
          <HeroPortrait key={hero.id} hero={hero} />
        ))}
      </div>

      {/* Spells */}
      <div className="text-center mt-12 sm:mt-16 mb-6 sm:mb-10">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          Master
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Powerful Spells
        </h2>
      </div>

      <div className="flex gap-4 sm:gap-6 justify-center flex-wrap px-6">
        {SPELL_GALLERY.map((spell) => (
          <SpellIcon key={spell.id} spell={spell} />
        ))}
      </div>
    </section>
  );
}
