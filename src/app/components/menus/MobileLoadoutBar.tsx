"use client";

import React from "react";
import {
  Shield,
  Sparkles,
  Heart,
  Swords,
  Target,
  Gauge,
  Timer,
  Info,
} from "lucide-react";
import type { HeroType, SpellType } from "../../types";
import { HERO_DATA, HERO_ABILITY_COOLDOWNS, SPELL_DATA } from "../../constants";
import { HeroSprite, HeroAbilityIcon, SpellSprite } from "../../sprites";

const HERO_OPTIONS: HeroType[] = [
  "tiger",
  "tenor",
  "mathey",
  "rocky",
  "scott",
  "captain",
  "engineer",
];

const SPELL_OPTIONS: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "payday",
  "reinforcements",
];

interface MobileLoadoutBarProps {
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType) => void;
  selectedSpells: SpellType[];
  toggleSpell: (spell: SpellType) => void;
  onOpenHeroCodex?: () => void;
  onOpenSpellCodex?: () => void;
}

export const MobileLoadoutBar: React.FC<MobileLoadoutBarProps> = ({
  selectedHero,
  setSelectedHero,
  selectedSpells,
  toggleSpell,
  onOpenHeroCodex,
  onOpenSpellCodex,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {/* Hero Selection */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(38,32,24,0.97) 0%, rgba(24,20,14,0.99) 100%)",
          border: "1.5px solid rgba(180,140,60,0.35)",
          boxShadow:
            "inset 0 0 16px rgba(180,140,60,0.04), 0 4px 16px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-2.5 py-1"
          style={{
            background:
              "linear-gradient(90deg, rgba(180,130,40,0.18), rgba(120,80,20,0.08), transparent)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Shield size={10} className="text-amber-400" />
            <span className="text-[7px] font-bold text-amber-300/90 tracking-[0.15em] uppercase">
              Select Champion
            </span>
          </div>
          {onOpenHeroCodex && (
            <button
              onClick={onOpenHeroCodex}
              className="flex items-center justify-center w-4 h-4 rounded"
              style={{
                background: "rgba(180,140,60,0.12)",
                border: "1px solid rgba(180,140,60,0.2)",
              }}
            >
              <Info size={8} className="text-amber-400/60" />
            </button>
          )}
        </div>

        {/* Hero grid */}
        <div className="px-1.5 pt-1 pb-1.5 flex items-center gap-1">
          {HERO_OPTIONS.map((heroType) => {
            const hero = HERO_DATA[heroType];
            const isSelected = selectedHero === heroType;
            return (
              <button
                key={heroType}
                onClick={() => setSelectedHero(heroType)}
                className="relative flex items-center justify-center rounded-lg transition-all flex-1"
                style={{
                  aspectRatio: "1",
                  background: isSelected
                    ? `linear-gradient(135deg, ${hero.color}30, ${hero.color}12)`
                    : "linear-gradient(135deg, rgba(38,34,30,0.95), rgba(24,20,16,0.95))",
                  border: `1.5px solid ${isSelected ? hero.color : "rgba(80,70,50,0.2)"}`,
                  boxShadow: isSelected
                    ? `0 0 10px ${hero.color}25, inset 0 0 8px ${hero.color}10`
                    : "none",
                  outline: isSelected
                    ? `1.5px solid ${hero.color}50`
                    : "none",
                  outlineOffset: "1px",
                }}
              >
                <HeroSprite type={heroType} size={30} color={hero.color} />
                {isSelected && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-stone-900 flex items-center justify-center"
                    style={{
                      boxShadow: "0 0 4px rgba(245,158,11,0.5)",
                      fontSize: 5,
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected hero info strip */}
        {selectedHero && (
          <SelectedHeroStrip heroType={selectedHero} />
        )}
      </div>

      {/* Spell Selection */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,22,40,0.97) 0%, rgba(20,14,30,0.99) 100%)",
          border: "1.5px solid rgba(140,80,200,0.3)",
          boxShadow:
            "inset 0 0 16px rgba(140,80,200,0.03), 0 4px 16px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-2.5 py-1"
          style={{
            background:
              "linear-gradient(90deg, rgba(100,50,160,0.18), rgba(60,30,100,0.08), transparent)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles size={10} className="text-purple-400" />
            <span className="text-[7px] font-bold text-purple-300/90 tracking-[0.15em] uppercase">
              Spells
            </span>
            <span className="text-[7px] font-bold text-purple-400/50">
              {selectedSpells.length}/3
            </span>
          </div>
          {onOpenSpellCodex && (
            <button
              onClick={onOpenSpellCodex}
              className="flex items-center justify-center w-4 h-4 rounded"
              style={{
                background: "rgba(100,50,160,0.12)",
                border: "1px solid rgba(140,80,200,0.2)",
              }}
            >
              <Info size={8} className="text-purple-400/60" />
            </button>
          )}
        </div>

        {/* Spell grid */}
        <div className="px-1.5 pt-1 pb-1.5 flex items-center gap-1">
          {SPELL_OPTIONS.map((spellType) => {
            const isSelected = selectedSpells.includes(spellType);
            const spell = SPELL_DATA[spellType];
            return (
              <button
                key={spellType}
                onClick={() => toggleSpell(spellType)}
                className="relative flex flex-col items-center justify-center rounded-lg transition-all flex-1 py-1"
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(100,60,180,0.3), rgba(60,30,120,0.15))"
                    : "linear-gradient(135deg, rgba(30,22,38,0.95), rgba(20,14,28,0.95))",
                  border: `1.5px solid ${isSelected ? "rgba(160,100,255,0.5)" : "rgba(70,40,100,0.2)"}`,
                  boxShadow: isSelected
                    ? "0 0 8px rgba(140,80,255,0.2)"
                    : "none",
                  outline: isSelected
                    ? "1.5px solid rgba(160,100,255,0.35)"
                    : "none",
                  outlineOffset: "1px",
                }}
              >
                <SpellSprite type={spellType} size={26} />
                <span className="text-[6px] font-semibold text-purple-200/60 mt-0.5 leading-none">
                  {spell.shortName}
                </span>
                {isSelected && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border border-stone-900 flex items-center justify-center"
                    style={{
                      boxShadow: "0 0 4px rgba(140,80,255,0.5)",
                      fontSize: 5,
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function SelectedHeroStrip({ heroType }: { heroType: HeroType }) {
  const hero = HERO_DATA[heroType];
  const cooldown = HERO_ABILITY_COOLDOWNS[heroType];

  return (
    <div
      className="px-2 pb-1.5"
    >
      <div
        className="flex items-center gap-1.5 rounded-md px-2 py-1"
        style={{
          background:
            "linear-gradient(135deg, rgba(28,24,18,0.8), rgba(20,16,12,0.9))",
          border: "1px solid rgba(120,100,60,0.15)",
        }}
      >
        {/* Name + role badge */}
        <span className="text-[10px] font-bold text-amber-200 whitespace-nowrap">
          {hero.name}
        </span>

        {/* Compact stats */}
        <div className="flex items-center gap-0 flex-1 rounded overflow-hidden min-w-0"
          style={{ border: "1px solid rgba(100,80,50,0.12)" }}
        >
          {[
            { icon: <Heart size={7} className="text-red-400" />, value: hero.hp, bg: "rgba(127,29,29,0.2)" },
            { icon: <Swords size={7} className="text-orange-400" />, value: hero.damage, bg: "rgba(124,45,18,0.2)" },
            { icon: <Target size={7} className="text-blue-400" />, value: hero.range, bg: "rgba(30,58,138,0.2)" },
            { icon: <Gauge size={7} className="text-green-400" />, value: hero.speed, bg: "rgba(20,83,45,0.2)" },
            { icon: <Timer size={7} className="text-purple-400" />, value: `${cooldown / 1000}s`, bg: "rgba(88,28,135,0.2)" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex-1 flex items-center justify-center gap-0.5 py-0.5"
              style={{
                background: stat.bg,
                borderRight:
                  idx < 4 ? "1px solid rgba(100,80,50,0.08)" : "none",
              }}
            >
              {stat.icon}
              <span className="text-[7px] font-bold text-amber-200/80">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ability */}
      <div className="flex items-center gap-1 mt-0.5 px-0.5">
        <HeroAbilityIcon type={heroType} size={8} />
        <span className="text-[7px] font-semibold text-purple-300/80">
          {hero.ability}:
        </span>
        <span className="text-[7px] text-purple-200/50 truncate">
          {hero.abilityDesc}
        </span>
      </div>
    </div>
  );
}
