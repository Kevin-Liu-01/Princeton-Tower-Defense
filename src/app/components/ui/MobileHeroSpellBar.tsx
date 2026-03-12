"use client";

import React from "react";
import { Coins } from "lucide-react";
import type {
  Hero,
  Spell,
  SpellType,
  Enemy,
  SpellUpgradeLevels,
} from "../../types";
import {
  HERO_DATA,
  SPELL_DATA,
  HERO_ABILITY_COOLDOWNS,
} from "../../constants";
import { HeroSprite, SpellSprite, getHeroAbilityIcon } from "../../sprites";

// ── Constants ───────────────────────────────────────────────────────────────

const HERO_CIRCLE_SIZE = 50;
const CIRCLE_SIZE = 44;
const HP_RING_RADIUS = (HERO_CIRCLE_SIZE - 4) / 2;
const HP_RING_CIRCUMFERENCE = 2 * Math.PI * HP_RING_RADIUS;

const SPELL_ACCENT: Record<
  string,
  { border: string; glow: string; bg: string }
> = {
  fireball: {
    border: "#f97316",
    glow: "rgba(249,115,22,0.3)",
    bg: "rgba(124,45,18,0.3)",
  },
  lightning: {
    border: "#eab308",
    glow: "rgba(234,179,8,0.3)",
    bg: "rgba(113,63,18,0.3)",
  },
  freeze: {
    border: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    bg: "rgba(22,78,99,0.3)",
  },
  payday: {
    border: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    bg: "rgba(120,53,15,0.3)",
  },
  reinforcements: {
    border: "#10b981",
    glow: "rgba(16,185,129,0.3)",
    bg: "rgba(6,78,59,0.3)",
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getHpColor(percent: number): string {
  if (percent <= 25) return "#ef4444";
  if (percent <= 50) return "#eab308";
  return "#10b981";
}

function canCastSpell(
  spell: Spell,
  pawPoints: number,
  enemies: Enemy[],
): boolean {
  if (spell.cooldown > 0) return false;
  if (pawPoints < SPELL_DATA[spell.type].cost) return false;
  const requiresEnemies =
    spell.type === "fireball" ||
    spell.type === "lightning" ||
    spell.type === "freeze" ||
    spell.type === "payday";
  if (requiresEnemies && enemies.length === 0) return false;
  return true;
}

// ── Hero Circle ─────────────────────────────────────────────────────────────

function MobileHeroCircle({
  hero,
  onClick,
}: {
  hero: Hero;
  onClick: () => void;
}) {
  const isAlive = !hero.dead;
  const hpPercent = isAlive
    ? Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100))
    : 0;
  const hpColor = getHpColor(hpPercent);
  const heroData = HERO_DATA[hero.type];
  const strokeOffset = HP_RING_CIRCUMFERENCE * (1 - hpPercent / 100);

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center transition-all active:scale-95"
      style={{ width: HERO_CIRCLE_SIZE, height: HERO_CIRCLE_SIZE }}
    >
      {/* SVG HP ring */}
      <svg
        className="absolute inset-0"
        width={HERO_CIRCLE_SIZE}
        height={HERO_CIRCLE_SIZE}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={HERO_CIRCLE_SIZE / 2}
          cy={HERO_CIRCLE_SIZE / 2}
          r={HP_RING_RADIUS}
          fill="none"
          stroke="rgba(80,60,40,0.4)"
          strokeWidth={3}
        />
        {isAlive && (
          <circle
            cx={HERO_CIRCLE_SIZE / 2}
            cy={HERO_CIRCLE_SIZE / 2}
            r={HP_RING_RADIUS}
            fill="none"
            stroke={hpColor}
            strokeWidth={3}
            strokeDasharray={HP_RING_CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        )}
      </svg>

      {/* Inner circle */}
      <div
        className="rounded-full flex items-center justify-center overflow-hidden"
        style={{
          width: HERO_CIRCLE_SIZE - 6,
          height: HERO_CIRCLE_SIZE - 6,
          background: isAlive
            ? `linear-gradient(135deg, ${heroData.color}30, ${heroData.color}10)`
            : "linear-gradient(135deg, rgba(50,40,35,0.95), rgba(30,25,20,0.95))",
          boxShadow: hero.selected
            ? `0 0 12px ${heroData.color}40, inset 0 1px 0 rgba(255,255,255,0.1)`
            : "inset 0 1px 0 rgba(255,255,255,0.06)",
          filter: isAlive ? "none" : "grayscale(0.8)",
        }}
      >
        <HeroSprite type={hero.type} size={30} />
      </div>

      {/* Label */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1 py-px rounded-full text-[6px] font-bold whitespace-nowrap"
        style={{
          background: "rgba(20,16,10,0.92)",
          border: `1px solid ${isAlive ? hpColor + "60" : "rgba(80,60,40,0.4)"}`,
          color: isAlive ? hpColor : "rgba(160,130,90,0.7)",
        }}
      >
        {isAlive
          ? `${Math.round(hpPercent)}%`
          : `${Math.ceil(hero.respawnTimer / 1000)}s`}
      </div>

      {/* Selected glow */}
      {hero.selected && isAlive && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
          style={{ boxShadow: `0 0 16px ${heroData.color}50` }}
        />
      )}
    </button>
  );
}

// ── Ability Circle ──────────────────────────────────────────────────────────

function MobileAbilityCircle({
  hero,
  onUseAbility,
}: {
  hero: Hero;
  onUseAbility: () => void;
}) {
  const isReady = hero.abilityReady && !hero.dead;
  const cdTotal = HERO_ABILITY_COOLDOWNS[hero.type];
  const cdFrac = hero.dead
    ? hero.respawnTimer / 5000
    : hero.abilityCooldown / cdTotal;
  const readyAngle = (1 - cdFrac) * 360;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onUseAbility();
      }}
      disabled={!isReady}
      className="relative rounded-full flex items-center justify-center transition-all active:scale-95"
      style={{
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        background: isReady
          ? "linear-gradient(135deg, rgba(120,90,20,0.45), rgba(80,60,15,0.35))"
          : "linear-gradient(135deg, rgba(38,32,24,0.95), rgba(24,20,14,0.95))",
        border: `2px solid ${isReady ? "rgba(250,204,21,0.6)" : "rgba(80,60,40,0.4)"}`,
        boxShadow: isReady
          ? "0 0 16px rgba(250,204,21,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
          : "inset 0 1px 0 rgba(255,255,255,0.05)",
        cursor: isReady ? "pointer" : "not-allowed",
      }}
    >
      {/* Cooldown sweep */}
      {!isReady && cdFrac > 0 && (
        <div
          className="absolute inset-[2px] rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from -90deg, transparent 0deg, transparent ${readyAngle}deg, rgba(0,0,0,0.6) ${readyAngle}deg, rgba(0,0,0,0.6) 360deg)`,
          }}
        />
      )}

      {/* Ability icon */}
      <div className="relative z-10 flex items-center justify-center">
        {getHeroAbilityIcon(hero.type, 20, isReady ? "" : "opacity-50")}
      </div>

      {/* Label */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1 py-px rounded-full text-[6px] font-bold uppercase tracking-wider whitespace-nowrap"
        style={{
          background: "rgba(20,16,10,0.92)",
          border: `1px solid ${isReady ? "rgba(250,204,21,0.5)" : "rgba(80,60,40,0.3)"}`,
          color: isReady ? "#fbbf24" : "rgba(160,140,100,0.6)",
        }}
      >
        {hero.dead
          ? `${Math.ceil(hero.respawnTimer / 1000)}s`
          : isReady
            ? "Ready"
            : `${Math.ceil(hero.abilityCooldown / 1000)}s`}
      </div>

      {/* Ready pulse */}
      {isReady && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
          style={{ boxShadow: "0 0 14px rgba(250,204,21,0.35)" }}
        />
      )}
    </button>
  );
}

// ── Spell Circle ────────────────────────────────────────────────────────────

function MobileSpellCircle({
  spell,
  spellLevel,
  canCast,
  isTargeting,
  onClick,
}: {
  spell: Spell;
  spellLevel: number;
  canCast: boolean;
  isTargeting: boolean;
  onClick: () => void;
}) {
  const accent = SPELL_ACCENT[spell.type] ?? SPELL_ACCENT.fireball;
  const spellData = SPELL_DATA[spell.type];
  const onCooldown = spell.cooldown > 0;
  const cdFrac = onCooldown ? spell.cooldown / spell.maxCooldown : 0;
  const readyAngle = (1 - cdFrac) * 360;
  const active = canCast || isTargeting;

  return (
    <button
      onClick={onClick}
      disabled={!active}
      className="relative rounded-full flex items-center justify-center transition-all active:scale-95"
      style={{
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        background: active
          ? `linear-gradient(135deg, ${accent.bg}, ${accent.bg.replace("0.3)", "0.15)")})`
          : "linear-gradient(135deg, rgba(38,32,28,0.95), rgba(24,20,16,0.95))",
        border: `2px solid ${isTargeting ? accent.border : active ? accent.border + "90" : "rgba(80,60,40,0.3)"}`,
        boxShadow: isTargeting
          ? `0 0 16px ${accent.glow}, 0 0 0 2px ${accent.border}60`
          : active
            ? `0 0 10px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`
            : "inset 0 1px 0 rgba(255,255,255,0.05)",
        opacity: active ? 1 : 0.45,
        cursor: active ? "pointer" : "not-allowed",
      }}
    >
      {/* Cooldown sweep */}
      {onCooldown && (
        <div
          className="absolute inset-[2px] rounded-full pointer-events-none z-10"
          style={{
            background: `conic-gradient(from -90deg, transparent 0deg, transparent ${readyAngle}deg, rgba(0,0,0,0.6) ${readyAngle}deg, rgba(0,0,0,0.6) 360deg)`,
          }}
        />
      )}

      {/* Spell icon */}
      <div className="relative z-[5] flex items-center justify-center">
        <SpellSprite type={spell.type} size={22} />
      </div>

      {/* Level badge */}
      <div
        className="absolute -top-0.5 -right-0.5 px-1 py-px rounded-full text-[7px] font-bold z-20"
        style={{
          background: "rgba(80,60,15,0.9)",
          border: "1px solid rgba(250,204,21,0.3)",
          color: "#fde047",
        }}
      >
        {spellLevel + 1}
      </div>

      {/* Bottom label: cost or cooldown */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-px px-1 py-px rounded-full text-[6px] font-bold whitespace-nowrap z-20"
        style={{
          background: "rgba(20,16,10,0.92)",
          border: `1px solid ${onCooldown ? "rgba(239,68,68,0.4)" : accent.border + "50"}`,
          color: onCooldown
            ? "#f87171"
            : active
              ? accent.border
              : "rgba(120,100,80,0.5)",
        }}
      >
        {onCooldown ? (
          `${Math.ceil(spell.cooldown / 1000)}s`
        ) : spellData.cost > 0 ? (
          <>
            <Coins size={6} className="opacity-70" />
            {spellData.cost}
          </>
        ) : (
          "Free"
        )}
      </div>

      {/* Targeting pulse */}
      {isTargeting && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
          style={{ boxShadow: `0 0 14px ${accent.glow}` }}
        />
      )}
    </button>
  );
}

// ── Main Mobile Bar ─────────────────────────────────────────────────────────

interface MobileHeroSpellBarProps {
  hero: Hero | null;
  spells: Spell[];
  pawPoints: number;
  enemies: Enemy[];
  spellUpgradeLevels: SpellUpgradeLevels;
  targetingSpell: SpellType | null;
  placingTroop: boolean;
  spellAutoAim: Partial<Record<SpellType, boolean>>;
  onToggleSpellAutoAim: (spellType: SpellType) => void;
  toggleHeroSelection: () => void;
  onUseHeroAbility: () => void;
  castSpell: (spellType: SpellType) => void;
}

export const MobileHeroSpellBar: React.FC<MobileHeroSpellBarProps> = ({
  hero,
  spells,
  pawPoints,
  enemies,
  spellUpgradeLevels,
  targetingSpell,
  placingTroop,
  spellAutoAim: _spellAutoAim,
  onToggleSpellAutoAim: _onToggleSpellAutoAim,
  toggleHeroSelection,
  onUseHeroAbility,
  castSpell,
}) => {
  if (!hero) return null;

  return (
    <div className="flex items-end justify-between w-full px-2 pb-3">
      {/* Left: Hero + Ability */}
      <div className="flex items-end gap-1.5 pointer-events-auto">
        <MobileHeroCircle hero={hero} onClick={toggleHeroSelection} />
        <MobileAbilityCircle hero={hero} onUseAbility={onUseHeroAbility} />
      </div>

      {/* Right: Spells */}
      <div className="flex items-end gap-1.5 pointer-events-auto">
        {spells.map((spell) => {
          const isTargeting =
            targetingSpell === spell.type ||
            (spell.type === "reinforcements" && placingTroop);
          return (
            <MobileSpellCircle
              key={spell.type}
              spell={spell}
              spellLevel={spellUpgradeLevels[spell.type] ?? 0}
              canCast={canCastSpell(spell, pawPoints, enemies)}
              isTargeting={isTargeting}
              onClick={() => castSpell(spell.type)}
            />
          );
        })}
      </div>
    </div>
  );
};
