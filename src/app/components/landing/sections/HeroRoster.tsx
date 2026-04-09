"use client";
import React, { useCallback } from "react";

import { HERO_DATA, HERO_ROLES } from "../../../constants/heroes";
import { SPELL_DATA } from "../../../constants/spells";
import { HeroSprite } from "../../../sprites/heroes";
import { SpellSprite } from "../../../sprites/spells";
import type { HeroType, SpellType } from "../../../types";
import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { useCarousel } from "../CarouselControls";
import { LANDING_THEME } from "../landingConstants";
import { SectionFlourish } from "./LoadoutUI";
import {
  MapSectionHeader,
  MapSectionBg,
  BattleBackdrop,
  StatBlock,
} from "./mapElements";
import { SpriteDisplay } from "./SpriteDisplay";

const T = LANDING_THEME;

const HERO_ORDER: HeroType[] = [
  "tiger",
  "mathey",
  "captain",
  "nassau",
  "tenor",
  "rocky",
  "scott",
  "engineer",
  "ivy",
];

const SPELL_ORDER: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "hex_ward",
  "payday",
  "reinforcements",
];

const HERO_BG: Record<HeroType, string> = {
  captain: "/images/new/gameplay_volcano.png",
  engineer: "/images/new/gameplay_desert.png",
  ivy: "/images/new/gameplay_grounds.png",
  mathey: "/images/new/gameplay_winter.png",
  nassau: "/images/new/gameplay_volcano.png",
  rocky: "/images/new/gameplay_grounds.png",
  scott: "/images/new/gameplay_swamp.png",
  tenor: "/images/new/gameplay_swamp.png",
  tiger: "/images/new/gameplay_grounds.png",
};

const HERO_BIG = 280;
const HERO_BIG_SCALE = 2.5;
const HERO_BIG_CANVAS = Math.round(HERO_BIG * HERO_BIG_SCALE);

const PORTRAIT_SIZE = 44;
const PORTRAIT_SCALE = 2;
const PORTRAIT_CANVAS = Math.round(PORTRAIT_SIZE * PORTRAIT_SCALE);

const SPELL_VIS = 56;
const SPELL_SCALE = 2;
const SPELL_CANVAS = Math.round(SPELL_VIS * SPELL_SCALE);

function HeroCard({
  type,
  active,
  onClick,
}: {
  type: HeroType;
  active: boolean;
  onClick: () => void;
}) {
  const data = HERO_DATA[type];
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 group flex-shrink-0"
      style={{
        transform: active ? "scale(1.08) translateY(-4px)" : "scale(1)",
      }}
    >
      <div
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: active
            ? `linear-gradient(180deg, ${data.color}30, ${data.color}12)`
            : "rgba(255,255,255,0.03)",
          border: active
            ? `2px solid ${data.color}`
            : "1.5px solid rgba(255,255,255,0.06)",
          boxShadow: active
            ? `0 0 24px ${data.color}40, 0 4px 12px rgba(0,0,0,0.4)`
            : "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {active && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${data.color}20, transparent 70%)`,
            }}
          />
        )}
        <SpriteDisplay visualSize={PORTRAIT_SIZE} canvasScale={PORTRAIT_SCALE}>
          <HeroSprite type={type} size={PORTRAIT_CANVAS} />
        </SpriteDisplay>
        {!active && (
          <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-200" />
        )}
      </div>
      <span
        className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-200"
        style={{ color: active ? data.color : "rgba(255,255,255,0.2)" }}
      >
        {data.name.split(" ")[0]}
      </span>
      {active && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
          style={{
            background: data.color,
            boxShadow: `0 0 8px ${data.color}80`,
          }}
        />
      )}
    </button>
  );
}

function SpellCard({ type }: { type: SpellType }) {
  const data = SPELL_DATA[type];
  const spellColor = (data as Record<string, unknown>).color as
    | string
    | undefined;
  const accent = spellColor ?? T.accent;

  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <div
        className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
        style={{
          background: `linear-gradient(160deg, ${accent}14, rgba(12,8,4,0.9))`,
          border: `1.5px solid ${accent}25`,
          boxShadow: `0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `0 0 24px ${accent}20, inset 0 0 16px ${accent}08`,
          }}
        />
        <SpriteDisplay visualSize={SPELL_VIS} canvasScale={SPELL_SCALE}>
          <SpellSprite type={type} size={SPELL_CANVAS} />
        </SpriteDisplay>
      </div>
      <span
        className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-center max-w-[80px] leading-tight"
        style={{ color: `${accent}70` }}
      >
        {data.name}
      </span>
    </div>
  );
}

export function HeroRoster() {
  const { active, next, prev, goTo } = useCarousel(HERO_ORDER.length, 4500);
  const hero = HERO_ORDER[active];
  const data = HERO_DATA[hero];
  const role = HERO_ROLES[hero];

  const handleSelect = useCallback((i: number) => goTo(i), [goTo]);

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <MapSectionBg tint={`${data.color}06`} gridOpacity={0.03} />
      <div className="absolute inset-0 landing-texture-dots pointer-events-none" />
      <div className="relative z-10">
        <SectionFlourish />
        <MapSectionHeader
          subtitle="9 Unique Champions"
          title="Choose Your Hero"
        />

        {/* Hero selector strip */}
        <div className="flex justify-center gap-2 sm:gap-3 px-4 mb-8 sm:mb-10 flex-wrap">
          {HERO_ORDER.map((type, i) => (
            <HeroCard
              key={type}
              type={type}
              active={i === active}
              onClick={() => handleSelect(i)}
            />
          ))}
        </div>

        {/* Main hero showcase */}
        <div className="mx-3 sm:mx-6 lg:mx-12">
          <OrnateFrame
            color={data.color}
            glowColor={data.color}
            cornerSize={32}
            cornerVariant="compact"
            showBorders={false}
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: `linear-gradient(170deg, ${data.color}08, rgba(12,8,4,0.97), ${data.color}04)`,
                border: `1px solid ${data.color}20`,
                boxShadow: `0 0 80px ${data.color}08, 0 20px 60px rgba(0,0,0,0.5)`,
                transition: "border-color 0.5s, box-shadow 0.5s",
              }}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Left — dramatic hero display with battle backdrop */}
                <div
                  key={`hero-${hero}`}
                  className="relative flex items-center justify-center py-8 sm:py-12 lg:w-[45%] min-h-[320px]"
                  style={{ animation: "landing-hero-reveal 0.5s ease-out" }}
                >
                  <BattleBackdrop
                    src={HERO_BG[hero]}
                    accent={data.color}
                    intensity={0.4}
                  />

                  {/* Radial glow behind sprite */}
                  <div
                    className="absolute top-1/2 left-1/2 w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 animate-landing-glow-breathe pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${data.color}18, ${data.color}06 40%, transparent 70%)`,
                    }}
                  />

                  {/* Decorative ring */}
                  <div
                    className="absolute top-1/2 left-1/2 w-[160px] h-[160px] rounded-full pointer-events-none"
                    style={{
                      animation: "landing-ring-rotate 30s linear infinite",
                      border: `1px solid ${data.color}15`,
                      translate: "-50% -50%",
                    }}
                  >
                    {[0, 90, 180, 270].map((deg) => (
                      <div
                        key={deg}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          background: `${data.color}40`,
                          boxShadow: `0 0 6px ${data.color}30`,
                          left: "50%",
                          top: "50%",
                          transform: `rotate(${deg}deg) translateY(-80px) translate(-50%, -50%)`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Outer ring */}
                  <div
                    className="absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ border: `0.5px dashed ${data.color}10` }}
                  />

                  <div className="relative z-10">
                    <SpriteDisplay
                      visualSize={HERO_BIG}
                      canvasScale={HERO_BIG_SCALE}
                    >
                      <HeroSprite type={hero} size={HERO_BIG_CANVAS} animated />
                    </SpriteDisplay>
                  </div>

                  {/* Floor reflection */}
                  <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-8 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse, ${data.color}12, transparent 70%)`,
                      filter: "blur(8px)",
                    }}
                  />

                  {/* Nav arrows */}
                  <button
                    onClick={prev}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 z-20"
                    style={{
                      backdropFilter: "blur(8px)",
                      background: "rgba(0,0,0,0.6)",
                      border: `1px solid ${data.color}30`,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M10 3L5 8L10 13"
                        stroke={data.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 z-20"
                    style={{
                      backdropFilter: "blur(8px)",
                      background: "rgba(0,0,0,0.6)",
                      border: `1px solid ${data.color}30`,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6 3L11 8L6 13"
                        stroke={data.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Right — hero info */}
                <div
                  key={`info-${hero}`}
                  className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-5"
                  style={{ animation: "landing-tower-enter 0.45s ease-out" }}
                >
                  {/* Name + role */}
                  <div>
                    <h3
                      className="text-3xl sm:text-4xl font-black font-cinzel tracking-wide"
                      style={{
                        color: data.color,
                        textShadow: `0 0 30px ${data.color}30`,
                      }}
                    >
                      {data.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                      <span
                        className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.25em] px-3 py-1.5 rounded-md"
                        style={{
                          background: `${data.color}15`,
                          border: `1px solid ${data.color}30`,
                          color: data.color,
                        }}
                      >
                        {role.label}
                      </span>
                      {data.isRanged && (
                        <span
                          className="text-[8px] font-semibold uppercase tracking-wider"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          Ranged
                        </span>
                      )}
                      {data.isFlying && (
                        <span
                          className="text-[8px] font-semibold uppercase tracking-wider"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          Flying
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stat blocks */}
                  <div className="flex gap-2.5 sm:gap-3 flex-wrap">
                    <StatBlock
                      label="Health"
                      value={`${data.hp}`}
                      accent={data.color}
                    />
                    <StatBlock
                      label="Attack"
                      value={`${data.damage}`}
                      accent={data.color}
                    />
                    <StatBlock
                      label="Range"
                      value={`${data.range}`}
                      accent={data.color}
                    />
                    <StatBlock
                      label="Speed"
                      value={data.speed.toFixed(1)}
                      accent={data.color}
                    />
                  </div>

                  {/* Ability callout */}
                  <div
                    className="relative p-4 sm:p-5 rounded-xl overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${data.color}0e, rgba(20,16,10,0.8))`,
                      border: `1px solid ${data.color}20`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-2 right-2 h-px"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${data.color}35, transparent)`,
                      }}
                    />
                    <p
                      className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5"
                      style={{ color: `${data.color}50` }}
                    >
                      Special Ability
                    </p>
                    <h4
                      className="text-sm sm:text-base font-bold"
                      style={{ color: `${data.color}dd` }}
                    >
                      {data.ability}
                    </h4>
                    <p
                      className="text-[11px] sm:text-xs mt-1.5 leading-relaxed"
                      style={{ color: `rgba(${T.accentRgb},0.4)` }}
                    >
                      {data.abilityDesc}
                    </p>
                  </div>

                  {/* Lore */}
                  <p
                    className="text-[10px] sm:text-[11px] italic leading-relaxed"
                    style={{ color: `rgba(${T.accentRgb},0.2)` }}
                  >
                    &ldquo;{data.description}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </OrnateFrame>
        </div>

        {/* Spellbook section */}
        <div className="mt-24 sm:mt-28">
          <SectionFlourish />
          <MapSectionHeader
            subtitle="6 Arcane Abilities"
            title="The Spellbook"
          />

          <div className="flex gap-4 sm:gap-6 justify-center flex-wrap px-4 sm:px-8">
            {SPELL_ORDER.map((type) => (
              <SpellCard key={type} type={type} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
