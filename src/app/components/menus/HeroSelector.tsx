"use client";
import React from "react";
import {
  Heart,
  Swords,
  Target,
  Gauge,
  Timer,
  Info,
} from "lucide-react";
import type { HeroType } from "../../types";
import { HERO_DATA, HERO_ABILITY_COOLDOWNS } from "../../constants";
import { HeroSprite, HeroAbilityIcon, HeroIcon } from "../../sprites";
import { HeroHelmetIcon } from "../../sprites/custom-icons";

const HERO_ROLES: Record<HeroType, { label: string; color: string; bg: string; border: string }> = {
  tiger: { label: "Brawler", color: "text-orange-300", bg: "rgba(60,25,5,0.85)", border: "rgba(234,88,12,0.35)" },
  tenor: { label: "Mage", color: "text-violet-300", bg: "rgba(35,20,65,0.85)", border: "rgba(139,92,246,0.35)" },
  mathey: { label: "Tank", color: "text-indigo-300", bg: "rgba(25,25,60,0.85)", border: "rgba(99,102,241,0.35)" },
  rocky: { label: "Artillery", color: "text-amber-300", bg: "rgba(45,35,10,0.85)", border: "rgba(138,112,32,0.35)" },
  scott: { label: "Support", color: "text-teal-300", bg: "rgba(8,45,42,0.85)", border: "rgba(20,184,166,0.35)" },
  captain: { label: "Summoner", color: "text-red-300", bg: "rgba(55,12,12,0.85)", border: "rgba(220,38,38,0.35)" },
  engineer: { label: "Builder", color: "text-yellow-300", bg: "rgba(50,38,5,0.85)", border: "rgba(234,179,8,0.35)" },
};

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
  onOpenCodex?: () => void;
  compact?: boolean;
}

export const HeroSelector: React.FC<HeroSelectorProps> = ({
  selectedHero,
  setSelectedHero,
  hoveredHero,
  setHoveredHero,
  onOpenCodex,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex-1 relative rounded-xl flex flex-col min-w-0"
        style={{
          background: 'linear-gradient(180deg, rgba(38,32,24,0.97) 0%, rgba(24,20,14,0.99) 100%)',
          border: '1.5px solid rgba(180,140,60,0.4)',
          boxShadow: 'inset 0 0 24px rgba(180,140,60,0.05), 0 4px 24px rgba(0,0,0,0.5)',
        }}>
        <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(180,140,60,0.1)' }} />
        <div className="px-3 py-1.5 relative flex items-center justify-between"
          style={{ background: 'linear-gradient(90deg, rgba(180,130,40,0.18), rgba(120,80,20,0.08), transparent)' }}>
          <div className="flex items-center gap-1.5">
            <HeroHelmetIcon size={14} />
            <span className="text-[8px] font-bold text-amber-300/90 tracking-[0.15em] uppercase">Champion</span>
          </div>
          {onOpenCodex && (
            <button onClick={onOpenCodex} className="flex items-center justify-center w-4 h-4 rounded transition-all hover:scale-110 hover:brightness-125"
              style={{ background: 'rgba(180,140,60,0.12)', border: '1px solid rgba(180,140,60,0.25)' }} title="View in Codex">
              <Info size={8} className="text-amber-400/70" />
            </button>
          )}
          <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,140,60,0.35) 20%, rgba(255,200,80,0.45) 50%, rgba(180,140,60,0.35) 80%, transparent)' }} />
        </div>
        <div className="px-2 py-2 flex items-center gap-1.5 justify-center">
          {heroOptions.map((heroType) => {
            const hero = HERO_DATA[heroType];
            const isSelected = selectedHero === heroType;
            return (
              <button
                key={heroType}
                onClick={() => setSelectedHero(heroType)}
                onMouseEnter={() => setHoveredHero(heroType)}
                onMouseLeave={() => setHoveredHero(null)}
                className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${isSelected ? "scale-115 z-10" : "hover:scale-110 hover:brightness-110"}`}
                style={{
                  width: 38, height: 38,
                  background: isSelected
                    ? `radial-gradient(circle at 30% 30%, ${hero.color}40, ${hero.color}15)`
                    : 'radial-gradient(circle at 30% 30%, rgba(50,44,36,0.95), rgba(24,20,16,0.95))',
                  border: `2px solid ${isSelected ? hero.color : 'rgba(100,90,70,0.3)'}`,
                  boxShadow: isSelected ? `0 0 12px ${hero.color}35, inset 0 0 8px ${hero.color}15` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  outline: isSelected ? `2px solid ${hero.color}50` : 'none',
                  outlineOffset: '1px',
                }}
              >
                <HeroSprite type={heroType} size={26} />
                {isSelected && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center border-[1.5px] border-stone-900 text-[7px] text-white font-bold"
                    style={{ boxShadow: '0 0 6px rgba(245,158,11,0.5)' }}>
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {hoveredHero && hoveredHero !== selectedHero && (
          <div className="absolute bottom-full left-0 mb-2 w-80 rounded-xl z-50"
            style={{
              background: 'linear-gradient(180deg, rgba(38,32,24,0.99), rgba(24,20,14,0.99))',
              border: '1.5px solid rgba(180,140,60,0.5)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7), inset 0 0 20px rgba(180,140,60,0.04)',
            }}>
            <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(180,140,60,0.08)' }} />
            <div className="p-3.5">
              <div className="flex items-center gap-2.5 mb-2">
                <HeroIcon type={hoveredHero} size={20} />
                <span className="text-amber-200 font-bold text-sm">{HERO_DATA[hoveredHero].name}</span>
              </div>
              <p className="text-xs text-stone-400/90 mb-2 leading-relaxed">{HERO_DATA[hoveredHero].description}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 relative rounded-xl flex flex-col min-w-0"
      style={{
        background: 'linear-gradient(180deg, rgba(38,32,24,0.97) 0%, rgba(24,20,14,0.99) 100%)',
        border: '1.5px solid rgba(180,140,60,0.4)',
        boxShadow: 'inset 0 0 24px rgba(180,140,60,0.05), 0 4px 24px rgba(0,0,0,0.5)',
      }}>
      {/* Inner border glow */}
      <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(180,140,60,0.1)' }} />
      {/* Header */}
      <div className="px-3 py-2 relative flex items-center justify-between"
        style={{ background: 'linear-gradient(90deg, rgba(180,130,40,0.18), rgba(120,80,20,0.08), transparent)' }}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <HeroHelmetIcon size={18} />
          <span className="text-[9px] text-nowrap font-bold text-amber-300/90 tracking-[0.2em] uppercase">
            Select Champion
          </span>
        </div>
        {onOpenCodex && (
          <button
            onClick={onOpenCodex}
            className="flex items-center justify-center w-5 h-5 rounded-md transition-all hover:scale-110 hover:brightness-125"
            style={{
              background: 'rgba(180,140,60,0.12)',
              border: '1px solid rgba(180,140,60,0.25)',
            }}
            title="View in Codex"
          >
            <Info size={10} className="text-amber-400/70" />
          </button>
        )}
        <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,140,60,0.35) 20%, rgba(255,200,80,0.45) 50%, rgba(180,140,60,0.35) 80%, transparent)' }} />
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="flex gap-1.5 mb-2 w-full">
          {heroOptions.map((heroType) => {
            const hero = HERO_DATA[heroType];
            const isSelected = selectedHero === heroType;
            return (
              <button
                key={heroType}
                onClick={() => setSelectedHero(heroType)}
                onMouseEnter={() => setHoveredHero(heroType)}
                onMouseLeave={() => setHoveredHero(null)}
                className={`relative flex flex-col items-center w-full p-2.5 rounded-lg transition-all duration-200 ${isSelected
                  ? "scale-110 z-10"
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
                <div>
                  <HeroSprite
                    type={heroType}
                    size={36}
                  />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-semibold px-1.5 py-px rounded inline-block whitespace-nowrap"
                  style={{ background: HERO_ROLES[heroType].bg, border: `1px solid ${HERO_ROLES[heroType].border}` }}>
                  <span className={HERO_ROLES[heroType].color}>{HERO_ROLES[heroType].label}</span>
                </span>
                {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-stone-900 text-[8px] text-white font-bold"
                    style={{ boxShadow: '0 0 6px rgba(245,158,11,0.5)' }}>
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selectedHero ? (
          <div className="rounded-lg p-1.5 relative"
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
                <HeroIcon type={selectedHero} size={14} />
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
            {/* Ability */}
            <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-md"
              style={{ background: 'rgba(88,28,135,0.12)', border: '1px solid rgba(88,28,135,0.15)' }}>
              <HeroAbilityIcon type={selectedHero} size={10} />
              <span className="text-[9px] font-semibold text-purple-200">
                {HERO_DATA[selectedHero].ability}:
              </span>
              <span className="text-[9px] text-purple-300/80 truncate">
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
        <div className="absolute bottom-full left-0 mb-2 w-80 rounded-xl z-50"
          style={{
            background: 'linear-gradient(180deg, rgba(38,32,24,0.99), rgba(24,20,14,0.99))',
            border: '1.5px solid rgba(180,140,60,0.5)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7), inset 0 0 20px rgba(180,140,60,0.04)',
          }}>
          <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(180,140,60,0.08)' }} />
          <div className="p-3.5">
            <div className="flex items-center gap-2.5 mb-2.5">
              <HeroIcon type={hoveredHero} size={20} />
              <span className="text-amber-200 font-bold text-sm">
                {HERO_DATA[hoveredHero].name}
              </span>
            </div>
            <p className="text-xs text-stone-400/90 mb-3 leading-relaxed">
              {HERO_DATA[hoveredHero].description}
            </p>
            <div className="flex items-center gap-0 rounded-lg overflow-hidden mb-3"
              style={{ border: '1px solid rgba(100,80,50,0.2)' }}>
              {[
                { icon: <Heart size={10} className="text-red-400" />, value: HERO_DATA[hoveredHero].hp, color: "text-red-300", bg: "rgba(127,29,29,0.25)" },
                { icon: <Swords size={10} className="text-orange-400" />, value: HERO_DATA[hoveredHero].damage, color: "text-orange-300", bg: "rgba(124,45,18,0.25)" },
                { icon: <Target size={10} className="text-blue-400" />, value: HERO_DATA[hoveredHero].range, color: "text-blue-300", bg: "rgba(30,58,138,0.25)" },
                { icon: <Gauge size={10} className="text-green-400" />, value: HERO_DATA[hoveredHero].speed, color: "text-green-300", bg: "rgba(20,83,45,0.25)" },
                { icon: <Timer size={10} className="text-purple-400" />, value: `${HERO_ABILITY_COOLDOWNS[hoveredHero] / 1000}s`, color: "text-purple-300", bg: "rgba(88,28,135,0.25)" },
              ].map((stat, idx) => (
                <div key={idx} className="flex-1 flex items-center justify-center gap-1 py-1.5"
                  style={{ background: stat.bg, borderRight: idx < 4 ? '1px solid rgba(100,80,50,0.12)' : 'none' }}>
                  {stat.icon}
                  <span className={`text-[11px] font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg"
              style={{ background: 'rgba(88,28,135,0.15)', border: '1px solid rgba(88,28,135,0.18)' }}>
              <HeroAbilityIcon type={hoveredHero} size={14} />
              <div>
                <span className="text-xs font-semibold text-purple-200">
                  {HERO_DATA[hoveredHero].ability}
                </span>
                <p className="text-[11px] text-purple-300/90 leading-relaxed mt-0.5">
                  {HERO_DATA[hoveredHero].abilityDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
