"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  LANDING_THEME,
  HERO_GALLERY,
  type CharacterDisplay,
} from "../landingConstants";

const T = LANDING_THEME;

const LEFT_HEROES = [
  HERO_GALLERY[0], // Tiger
  HERO_GALLERY[2], // Mathey
  HERO_GALLERY[5], // Captain
];

const RIGHT_HEROES = [
  HERO_GALLERY[7], // Nassau
  HERO_GALLERY[1], // Tenor
  HERO_GALLERY[6], // Engineer
];

interface BattlerProps {
  hero: CharacterDisplay;
  side: "left" | "right";
  row: number;
}

function Battler({ hero, side, row }: BattlerProps) {
  const delay = row * 0.15;
  const isLeft = side === "left";

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        animation: `landing-battle-bob 2.4s ease-in-out ${delay}s infinite`,
      }}
    >
      {/* Glow beneath sprite */}
      <div
        className="absolute -bottom-2 w-16 h-4 sm:w-20 sm:h-5 rounded-full blur-md"
        style={{
          background: `radial-gradient(ellipse, ${hero.color}55, transparent)`,
          animation: `landing-battle-glow 2.4s ease-in-out ${delay}s infinite`,
        }}
      />

      {/* Sprite container */}
      <div
        className="relative w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] md:w-[88px] md:h-[88px] rounded-full overflow-hidden"
        style={{
          border: `2.5px solid ${hero.color}`,
          boxShadow: `0 0 20px ${hero.color}44, 0 0 40px ${hero.color}18`,
          transform: isLeft ? "none" : "scaleX(-1)",
          animation: `landing-battle-surge-${side} 3.2s ease-in-out ${delay}s infinite`,
        }}
      >
        <Image
          src={hero.image}
          alt={hero.name}
          fill
          sizes="88px"
          className="object-cover object-top"
        />
      </div>

      {/* Name tag */}
      <span
        className="mt-1.5 text-[8px] sm:text-[10px] font-bold tracking-wider uppercase whitespace-nowrap"
        style={{
          color: `${hero.color}cc`,
          textShadow: `0 0 8px ${hero.color}44`,
        }}
      >
        {hero.name}
      </span>
    </div>
  );
}

function ClashEffect() {
  return (
    <div className="relative flex items-center justify-center w-16 sm:w-24 md:w-28">
      {/* Central clash burst */}
      <div
        className="absolute w-10 h-10 sm:w-14 sm:h-14"
        style={{
          animation: "landing-clash-burst 3.2s ease-in-out infinite",
        }}
      >
        <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
          {/* Star burst */}
          {[0, 45, 90, 135].map((deg) => (
            <line
              key={deg}
              x1="30"
              y1="30"
              x2={30 + 22 * Math.cos((deg * Math.PI) / 180)}
              y2={30 + 22 * Math.sin((deg * Math.PI) / 180)}
              stroke={T.accentBright}
              strokeWidth="1.5"
              opacity="0.6"
              strokeLinecap="round"
            />
          ))}
          <circle cx="30" cy="30" r="6" fill={T.accent} opacity="0.5" />
          <circle cx="30" cy="30" r="3" fill={T.accentBright} opacity="0.8" />
        </svg>
      </div>

      {/* Spark particles */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * 360;
        const sparkDelay = i * 0.5;
        return (
          <div
            key={i}
            className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full"
            style={{
              background: i % 2 === 0 ? T.accentBright : T.accent,
              animation: `landing-spark ${2 + (i % 3) * 0.4}s ease-out ${sparkDelay}s infinite`,
              "--spark-angle": `${angle}deg`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* "VS" or crossed swords indicator */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{ animation: "landing-clash-pulse 3.2s ease-in-out infinite" }}
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6 sm:w-8 sm:h-8">
          {/* Crossed swords */}
          <path
            d="M6 6 L22 22 M18 6 L22 10 M6 22 L10 18"
            stroke={T.accentBright}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M26 6 L10 22 M6 6 L10 10 M26 22 L22 18"
            stroke={T.accent}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}

function BattleParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 10 }, (_, i) => {
        const left = 20 + (i * 7) % 60;
        const delay = i * 1.1;
        const duration = 3 + (i % 4);
        const size = 1.5 + (i % 3);
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: "50%",
              width: size,
              height: size,
              background: i % 2 === 0 ? T.accentBright : T.princeton,
              opacity: 0,
              animation: `landing-battle-particle ${duration}s ease-out ${delay}s infinite`,
            }}
          />
        );
      })}
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

export function SpriteBattle() {
  return (
    <section className="py-14 sm:py-20 px-6 overflow-hidden">
      <SectionDivider />

      <div className="text-center mt-10 sm:mt-16 mb-8 sm:mb-12">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          Witness
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Heroes Clash
        </h2>
      </div>

      {/* Battle arena */}
      <div
        className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden py-8 sm:py-12"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(${T.accentDarkRgb},0.12) 0%, transparent 70%)`,
          border: `1px solid rgba(${T.accentDarkRgb},0.12)`,
        }}
      >
        <BattleParticles />

        {/* Ground line */}
        <div
          className="absolute bottom-[28%] inset-x-[10%] h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${T.accentDarkRgb},0.2), rgba(${T.accentRgb},0.15), rgba(${T.accentDarkRgb},0.2), transparent)`,
          }}
        />

        <div className="relative flex items-center justify-center gap-2 sm:gap-4">
          {/* Left team */}
          <div className="flex flex-col items-end gap-3 sm:gap-5">
            {LEFT_HEROES.map((hero, i) => (
              <Battler key={hero.id} hero={hero} side="left" row={i} />
            ))}
          </div>

          {/* Clash center */}
          <ClashEffect />

          {/* Right team */}
          <div className="flex flex-col items-start gap-3 sm:gap-5">
            {RIGHT_HEROES.map((hero, i) => (
              <Battler key={hero.id} hero={hero} side="right" row={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Flavor text */}
      <p
        className="text-center text-[10px] sm:text-xs mt-6 italic"
        style={{ color: `rgba(${T.accentRgb},0.25)` }}
      >
        Command your heroes against Princeton&apos;s mightiest champions
      </p>
    </section>
  );
}
