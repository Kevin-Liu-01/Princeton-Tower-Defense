"use client";
import React, { useCallback } from "react";
import type { HeroType, SpellType } from "../../../types";
import { HERO_DATA, HERO_ROLES } from "../../../constants/heroes";
import { SPELL_DATA } from "../../../constants/spells";
import { HeroSprite } from "../../../sprites/heroes";
import { SpellSprite } from "../../../sprites/spells";
import { LANDING_THEME } from "../landingConstants";
import { IsoPlatform } from "./IsoPlatform";
import { SpriteDisplay } from "./SpriteDisplay";
import { useCarousel, CarouselDots, CarouselArrow } from "../CarouselControls";
import {
  StatBar,
  PanelCorners,
  SlotCorners,
  type StatBarData,
} from "./LoadoutUI";

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

const HERO_INITIALS: Record<HeroType, string> = {
  tiger: "T",
  mathey: "M",
  captain: "G",
  nassau: "N",
  tenor: "A",
  rocky: "R",
  scott: "F",
  engineer: "B",
  ivy: "I",
};

const SPELL_ORDER: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "hex_ward",
  "payday",
  "reinforcements",
];

const HERO_BIG_VISUAL = 280;
const HERO_BIG_SCALE = 2.5;
const HERO_BIG_CANVAS = Math.round(HERO_BIG_VISUAL * HERO_BIG_SCALE);

const SPELL_VISUAL = 48;
const SPELL_SCALE = 2.0;
const SPELL_CANVAS = Math.round(SPELL_VISUAL * SPELL_SCALE);

function getHeroBars(
  data: (typeof HERO_DATA)[HeroType],
): StatBarData[] {
  return [
    {
      label: "HP",
      pct: Math.min(1, data.hp / 6000),
      display: `${data.hp}`,
    },
    {
      label: "ATK",
      pct: Math.min(1, data.damage / 100),
      display: `${data.damage}`,
    },
    {
      label: "RNG",
      pct: Math.min(1, data.range / 260),
      display: `${data.range}`,
    },
    {
      label: "SPD",
      pct: Math.min(1, data.speed / 5),
      display: `${data.speed.toFixed(1)}`,
    },
  ];
}

function HeroPortrait({
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
      className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
      style={{
        background: active ? `${data.color}18` : "rgba(255,255,255,0.02)",
        border: active
          ? `1.5px solid ${data.color}55`
          : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
      }}
    >
      <span
        className="text-[10px] sm:text-xs font-bold"
        style={{ color: active ? data.color : "rgba(255,255,255,0.2)" }}
      >
        {HERO_INITIALS[type]}
      </span>
      {active && (
        <div
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ background: data.color }}
        />
      )}
    </button>
  );
}

function SpellSlot({ type }: { type: SpellType }) {
  const data = SPELL_DATA[type];
  return (
    <div
      className="relative flex flex-col items-center gap-2 flex-shrink-0 p-3 sm:p-4 transition-all duration-300 hover:scale-[1.03]"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
        minWidth: 76,
      }}
    >
      <SlotCorners color={T.accent} />
      <SpriteDisplay visualSize={SPELL_VISUAL} canvasScale={SPELL_SCALE}>
        <SpellSprite type={type} size={SPELL_CANVAS} />
      </SpriteDisplay>
      <span
        className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-center max-w-[80px] leading-tight"
        style={{ color: `rgba(${T.accentRgb},0.5)` }}
      >
        {data.name}
      </span>
    </div>
  );
}

export function HeroRoster() {
  const { active, next, prev, goTo } = useCarousel(HERO_ORDER.length, 4000);
  const currentType = HERO_ORDER[active];
  const currentData = HERO_DATA[currentType];
  const currentRole = HERO_ROLES[currentType];
  const heroBars = getHeroBars(currentData);

  const handlePortraitClick = useCallback(
    (i: number) => goTo(i),
    [goTo],
  );

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
          Barracks
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Operator Select
        </h2>
      </div>

      <div className="relative mx-3 sm:mx-6 lg:mx-12">
        <CarouselArrow
          direction="left"
          onClick={prev}
          accent={currentData.color}
        />
        <CarouselArrow
          direction="right"
          onClick={next}
          accent={currentData.color}
        />

        <div
          className="relative rounded-lg"
          style={{
            background:
              "linear-gradient(170deg, rgba(18,16,22,0.95), rgba(10,8,14,0.98))",
            border: "1px solid rgba(255,255,255,0.05)",
            borderLeft: `2px solid ${currentData.color}44`,
          }}
        >
          <PanelCorners color={currentData.color} />

          <div className="flex flex-col md:flex-row">
            {/* Left — large hero sprite fills column */}
            <div
              key={`hero-${currentType}`}
              className="flex flex-col items-center justify-center p-4 sm:p-6 md:w-[45%] md:border-r md:min-h-[360px]"
              style={{
                animation: "landing-tower-enter 0.35s ease-out",
                borderRightColor: "rgba(255,255,255,0.04)",
                background: `radial-gradient(ellipse at 50% 40%, ${currentData.color}08, transparent 70%)`,
              }}
            >
              <SpriteDisplay
                visualSize={HERO_BIG_VISUAL}
                canvasScale={HERO_BIG_SCALE}
              >
                <HeroSprite
                  type={currentType}
                  size={HERO_BIG_CANVAS}
                  animated
                />
              </SpriteDisplay>
              <div className="-mt-3">
                <IsoPlatform
                  width={130}
                  depth={5}
                  color={currentData.color}
                />
              </div>
            </div>

            {/* Right — details */}
            <div
              key={`details-${currentType}`}
              className="flex-1 p-5 sm:p-7 flex flex-col gap-3 sm:gap-4 justify-center"
              style={{ animation: "landing-tower-enter 0.4s ease-out" }}
            >
              <div>
                <h3
                  className="text-xl sm:text-2xl font-bold tracking-wider"
                  style={{ color: currentData.color }}
                >
                  {currentData.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm"
                    style={{
                      color: `${currentData.color}cc`,
                      background: `${currentData.color}12`,
                      border: `1px solid ${currentData.color}25`,
                    }}
                  >
                    {currentRole.label}
                  </span>
                  {currentData.isRanged && (
                    <span
                      className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-wider"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      Ranged
                    </span>
                  )}
                  {currentData.isFlying && (
                    <span
                      className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-wider"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      Flying
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:gap-2.5">
                {heroBars.map((bar) => (
                  <StatBar
                    key={bar.label}
                    label={bar.label}
                    pct={bar.pct}
                    display={bar.display}
                    color={currentData.color}
                  />
                ))}
              </div>

              <div
                className="relative p-3 sm:p-4 rounded-md"
                style={{
                  background: `${currentData.color}08`,
                  border: `1px solid ${currentData.color}18`,
                }}
              >
                <span
                  className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider block"
                  style={{ color: `${currentData.color}aa` }}
                >
                  {currentData.ability}
                </span>
                <p
                  className="text-[10px] sm:text-xs mt-1 leading-relaxed"
                  style={{ color: `rgba(${T.accentRgb},0.4)` }}
                >
                  {currentData.abilityDesc}
                </p>
              </div>

              <p
                className="text-[9px] sm:text-[11px] italic leading-relaxed"
                style={{ color: `rgba(${T.accentRgb},0.25)` }}
              >
                {currentData.description}
              </p>
            </div>
          </div>

          <div
            className="h-px w-full"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />

          <div className="p-3 sm:p-4 flex items-center justify-center gap-1.5 sm:gap-2">
            {HERO_ORDER.map((type, i) => (
              <HeroPortrait
                key={type}
                type={type}
                active={i === active}
                onClick={() => handlePortraitClick(i)}
              />
            ))}
          </div>
        </div>

        <CarouselDots
          count={HERO_ORDER.length}
          active={active}
          onDot={goTo}
          accent={currentData.color}
        />
      </div>

      {/* Spell loadout */}
      <div className="text-center mt-16 sm:mt-20 mb-6 sm:mb-10">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          Arsenal
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Spell Loadout
        </h2>
      </div>

      <div className="flex gap-2 sm:gap-4 justify-center flex-wrap px-4 sm:px-6">
        {SPELL_ORDER.map((type) => (
          <SpellSlot key={type} type={type} />
        ))}
      </div>
    </section>
  );
}
