"use client";
import React from "react";
import {
  Shield,
  Heart,
  Swords,
  Target,
  Gauge,
  Timer,
} from "lucide-react";
import type { HeroType } from "../../types";
import { HERO_DATA, HERO_ABILITY_COOLDOWNS } from "../../constants";
import { HeroSprite, HeroAbilityIcon } from "../../sprites";

const heroOptions: HeroType[] = [
  "tiger",
  "tenor",
  "mathey",
  "rocky",
  "scott",
  "captain",
  "engineer",
];

interface HeroSelectorProps {
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType) => void;
  hoveredHero: HeroType | null;
  setHoveredHero: (hero: HeroType | null) => void;
}

export const HeroSelector: React.FC<HeroSelectorProps> = ({
  selectedHero,
  setSelectedHero,
  hoveredHero,
  setHoveredHero,
}) => {
  return (
    <div className="flex-1 relative rounded-lg sm:rounded-xl flex flex-col min-w-0"
  style={{
    background: 'linear-gradient(180deg, rgba(38,32,24,0.97) 0%, rgba(24,20,14,0.99) 100%)',
    border: '1.5px solid rgba(180,140,60,0.4)',
    boxShadow: 'inset 0 0 24px rgba(180,140,60,0.05), 0 4px 24px rgba(0,0,0,0.5)',
  }}>
  {/* Inner border glow */}
  <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(180,140,60,0.1)' }} />
  {/* Header */}
  <div className="px-2 sm:px-3 py-1.5 sm:py-2 relative"
    style={{ background: 'linear-gradient(90deg, rgba(180,130,40,0.18), rgba(120,80,20,0.08), transparent)' }}>
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Shield size={11} className="text-amber-400 sm:w-[13px] sm:h-[13px]" />
      <span className="text-[8px] sm:text-[9px] text-nowrap font-bold text-amber-300/90 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
        Select Champion
      </span>
    </div>
    <div className="absolute bottom-0 left-2 sm:left-3 right-2 sm:right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,140,60,0.35) 20%, rgba(255,200,80,0.45) 50%, rgba(180,140,60,0.35) 80%, transparent)' }} />
  </div>
  <div className="p-1.5 sm:p-3 flex-1 flex flex-col justify-between">
    <div className="grid-cols-4 grid sm:flex gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 w-full">
      {heroOptions.map((heroType) => {
        const hero = HERO_DATA[heroType];
        const isSelected = selectedHero === heroType;
        return (
          <button
            key={heroType}
            onClick={() => setSelectedHero(heroType)}
            onMouseEnter={() => setHoveredHero(heroType)}
            onMouseLeave={() => setHoveredHero(null)}
            className={`relative flex justify-center w-full p-0.5 sm:p-1 pt-1 sm:pt-1.5 pb-0.5 rounded-md sm:rounded-lg transition-all duration-200 ${isSelected
              ? "scale-105 sm:scale-110 z-10"
              : "hover:scale-105 hover:brightness-110"
              }`}
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${hero.color}35, ${hero.color}15)`
                : 'linear-gradient(135deg, rgba(38, 34, 30, 0.95), rgba(24, 20, 16, 0.95))',
              border: `1.5px solid ${isSelected ? hero.color : 'rgba(100, 90, 70, 0.25)'}`,
              boxShadow: isSelected
                ? `0 0 14px ${hero.color}30, inset 0 0 12px ${hero.color}10, inset 0 1px 0 rgba(255,255,255,0.08)`
                : 'inset 0 1px 0 rgba(255,255,255,0.04)',
              outline: isSelected ? `2px solid ${hero.color}60` : 'none',
              outlineOffset: '1px',
            }}
          >
            <div className="scale-75 sm:scale-100">
              <HeroSprite
                type={heroType}
                size={36}
                color={hero.color}
              />
            </div>
            {isSelected && (
              <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-amber-500 rounded-full flex items-center justify-center border sm:border-2 border-stone-900 text-[6px] sm:text-[8px] text-white font-bold"
                style={{ boxShadow: '0 0 6px rgba(245,158,11,0.5)' }}>
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
    {selectedHero ? (
      <div className="hidden sm:block rounded-lg p-1.5 relative"
        style={{
          background: 'linear-gradient(180deg, rgba(28,24,18,0.8), rgba(20,16,12,0.9))',
          border: '1px solid rgba(120,100,60,0.2)',
        }}>
        {/* Hero name/icon + stats — all on one row */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[11px] font-bold text-amber-200 whitespace-nowrap">
              {HERO_DATA[selectedHero].name}
            </span>
            <span className="text-sm">
              {HERO_DATA[selectedHero].icon}
            </span>
          </div>
          {/* Stat strip inline */}
          <div className="flex items-center gap-0 rounded-md overflow-hidden flex-1 min-w-0"
            style={{ border: '1px solid rgba(100,80,50,0.15)' }}>
            {[
              { icon: <Heart size={8} className="text-red-400" />, value: HERO_DATA[selectedHero].hp, color: "text-red-300", bg: "rgba(127,29,29,0.2)" },
              { icon: <Swords size={8} className="text-orange-400" />, value: HERO_DATA[selectedHero].damage, color: "text-orange-300", bg: "rgba(124,45,18,0.2)" },
              { icon: <Target size={8} className="text-blue-400" />, value: HERO_DATA[selectedHero].range, color: "text-blue-300", bg: "rgba(30,58,138,0.2)" },
              { icon: <Gauge size={8} className="text-green-400" />, value: HERO_DATA[selectedHero].speed, color: "text-green-300", bg: "rgba(20,83,45,0.2)" },
              { icon: <Timer size={8} className="text-purple-400" />, value: `${HERO_ABILITY_COOLDOWNS[selectedHero] / 1000}s`, color: "text-purple-300", bg: "rgba(88,28,135,0.2)" },
            ].map((stat, idx) => (
              <div key={idx} className="flex-1 flex items-center justify-center gap-1 py-1"
                style={{ background: stat.bg, borderRight: idx < 4 ? '1px solid rgba(100,80,50,0.1)' : 'none' }}>
                {stat.icon}
                <span className={`text-[9px] font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Hero description */}
        <p className="text-[8px] text-stone-400/70 leading-relaxed mb-1 px-0.5">
          {HERO_DATA[selectedHero].description}
        </p>
        {/* Ability */}
        <div className="text-[8px] text-purple-300 flex items-center gap-1 px-1.5 py-1 rounded-md"
          style={{ background: 'rgba(88,28,135,0.12)', border: '1px solid rgba(88,28,135,0.15)' }}>
          <HeroAbilityIcon type={selectedHero} size={9} />
          <span className="font-semibold text-purple-200">
            {HERO_DATA[selectedHero].ability}:
          </span>
          <span className="text-purple-300/80 truncate">
            {HERO_DATA[selectedHero].abilityDesc}
          </span>
        </div>
      </div>
    ) : (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-[10px] text-amber-600/50 italic">Choose your champion...</span>
      </div>
    )}
  </div>
  {hoveredHero && hoveredHero !== selectedHero && (
    <div className="absolute bottom-full left-0 mb-2 w-72 rounded-xl z-50"
      style={{
        background: 'linear-gradient(180deg, rgba(38,32,24,0.99), rgba(24,20,14,0.99))',
        border: '1.5px solid rgba(180,140,60,0.5)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.6), inset 0 0 20px rgba(180,140,60,0.04)',
      }}>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-200 font-bold">
            {HERO_DATA[hoveredHero].name}
          </span>
          <span>{HERO_DATA[hoveredHero].icon}</span>
        </div>
        <p className="text-[10px] text-stone-400/80 mb-2 leading-relaxed">
          {HERO_DATA[hoveredHero].description}
        </p>
        {/* Compact inline stat strip */}
        <div className="flex items-center gap-0 rounded-md overflow-hidden mb-2"
          style={{ border: '1px solid rgba(100,80,50,0.2)' }}>
          {[
            { icon: <Heart size={8} className="text-red-400" />, value: HERO_DATA[hoveredHero].hp, color: "text-red-300", bg: "rgba(127,29,29,0.25)" },
            { icon: <Swords size={8} className="text-orange-400" />, value: HERO_DATA[hoveredHero].damage, color: "text-orange-300", bg: "rgba(124,45,18,0.25)" },
            { icon: <Target size={8} className="text-blue-400" />, value: HERO_DATA[hoveredHero].range, color: "text-blue-300", bg: "rgba(30,58,138,0.25)" },
            { icon: <Gauge size={8} className="text-green-400" />, value: HERO_DATA[hoveredHero].speed, color: "text-green-300", bg: "rgba(20,83,45,0.25)" },
            { icon: <Timer size={8} className="text-purple-400" />, value: `${HERO_ABILITY_COOLDOWNS[hoveredHero] / 1000}s`, color: "text-purple-300", bg: "rgba(88,28,135,0.25)" },
          ].map((stat, idx) => (
            <div key={idx} className="flex-1 flex items-center justify-center gap-1 py-1"
              style={{ background: stat.bg, borderRight: idx < 4 ? '1px solid rgba(100,80,50,0.12)' : 'none' }}>
              {stat.icon}
              <span className={`text-[9px] font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-purple-300 flex items-center gap-1 px-2 py-1.5 rounded-md"
          style={{ background: 'rgba(88,28,135,0.15)', border: '1px solid rgba(88,28,135,0.15)' }}>
          <HeroAbilityIcon type={hoveredHero} size={10} />
          <span className="font-semibold text-purple-200">
            {HERO_DATA[hoveredHero].ability}:
          </span>{" "}
          {HERO_DATA[hoveredHero].abilityDesc}
        </div>
      </div>
    </div>
  )}
    </div>
  );
};
