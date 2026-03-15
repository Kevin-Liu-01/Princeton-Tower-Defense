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
  SPELL_FULL_THEMES,
} from "../../constants";
import { HeroSprite, SpellSprite, getHeroAbilityIcon } from "../../sprites";
import { heroFrameElements, spellFrameElements } from "./ornateFrameHelpers";

// ── Constants ───────────────────────────────────────────────────────────────

const HERO_CIRCLE_SIZE = 50;
const CIRCLE_SIZE = 44;
const HP_RING_RADIUS = (HERO_CIRCLE_SIZE - 4) / 2;
const HP_RING_CIRCUMFERENCE = 2 * Math.PI * HP_RING_RADIUS;

const SPELL_ACCENT: Record<string, { border: string; glow: string; bg: string }> = Object.fromEntries(
  Object.entries(SPELL_FULL_THEMES).map(([k, v]) => [k, { border: v.accent, glow: v.glow, bg: v.bg }])
);

// ── Ornate Frame Constants ──────────────────────────────────────────────────

function hexToRgba(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const DEG_TO_RAD = Math.PI / 180;
const ANGLES_ALL = [0, 45, 90, 135, 180, 225, 270, 315];
const ANGLES_CARDINAL = [0, 90, 180, 270];
const ANGLES_INTERCARDINAL = [45, 135, 225, 315];

const M_HERO_FRAME = 70;
const M_HERO_PAD = (M_HERO_FRAME - HERO_CIRCLE_SIZE) / 2;
const M_HERO_CX = M_HERO_FRAME / 2;
const M_HERO_MID_R = M_HERO_CX - 4;
const M_HERO_MID_CIRCUM = 2 * Math.PI * M_HERO_MID_R;

const M_ORB_FRAME = 62;
const M_ORB_PAD = (M_ORB_FRAME - CIRCLE_SIZE) / 2;
const M_ORB_CX = M_ORB_FRAME / 2;
const M_ORB_OUTER_R = M_ORB_CX - 2;
const M_ORB_MID_R = M_ORB_CX - 4;
const M_ORB_GEM_R = M_ORB_CX - 2;
const M_ORB_TICK_IN = M_ORB_CX - 6;
const M_ORB_TICK_OUT = M_ORB_CX - 1;
const M_ORB_MID_CIRCUM = 2 * Math.PI * M_ORB_MID_R;

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
    spell.type === "freeze";
  if (requiresEnemies && enemies.length === 0) return false;
  return true;
}

// ── Hero Circle — Ornate ────────────────────────────────────────────────────

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
  const hc = heroData.color;
  const strokeOffset = HP_RING_CIRCUMFERENCE * (1 - hpPercent / 100);

  return (
    <div className="relative" style={{ width: HERO_CIRCLE_SIZE, height: HERO_CIRCLE_SIZE }}>
      {/* ─── Ornate SVG frame ─── */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: -M_HERO_PAD, left: -M_HERO_PAD }}
        width={M_HERO_FRAME}
        height={M_HERO_FRAME}
        overflow="visible"
      >
        <defs>
          <filter id="mHeroGemGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {heroFrameElements({
          cx: M_HERO_CX,
          outerR: M_HERO_CX - 2,
          midR: M_HERO_MID_R,
          color: isAlive ? hexToRgba(hc, 0.22) : "rgba(110,110,110,0.16)",
          dimColor: isAlive ? hexToRgba(hc, 0.1) : "rgba(110,110,110,0.08)",
          prefix: "mh",
          glowFilter: isAlive && hero.selected ? "url(#mHeroGemGlow)" : undefined,
        })}

        {isAlive && (
          <circle
            cx={M_HERO_CX} cy={M_HERO_CX} r={M_HERO_MID_R}
            fill="none"
            stroke={hpColor}
            strokeWidth={2}
            strokeDasharray={M_HERO_MID_CIRCUM}
            strokeDashoffset={M_HERO_MID_CIRCUM * (1 - hpPercent / 100)}
            strokeLinecap="round"
            transform={`rotate(-90 ${M_HERO_CX} ${M_HERO_CX})`}
            className="transition-all duration-300"
            opacity={0.35}
          />
        )}

        {hero.selected && isAlive && (
          <circle
            cx={M_HERO_CX} cy={M_HERO_CX} r={M_HERO_MID_R}
            fill="none"
            stroke={hexToRgba(hc, 0.2)}
            strokeWidth={1.5}
            filter="url(#mHeroGemGlow)"
          />
        )}
      </svg>

      {/* ─── Main hero button ─── */}
      <button
        onClick={onClick}
        className="absolute inset-0 rounded-full flex items-center justify-center transition-all active:scale-95"
      >
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
              style={{ filter: `drop-shadow(0 0 3px ${hpColor})` }}
            />
          )}
        </svg>

        <div className="absolute inset-[1px] rounded-full pointer-events-none" style={{
          borderTop: `1px solid ${isAlive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)"}`,
          borderBottom: `1px solid ${isAlive ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.06)"}`,
          borderLeft: "1px solid transparent",
          borderRight: "1px solid transparent",
        }} />

        <div
          className="relative rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: HERO_CIRCLE_SIZE - 6,
            height: HERO_CIRCLE_SIZE - 6,
            background: isAlive
              ? `radial-gradient(circle at 32% 32%, ${hc}35, ${hc}12)`
              : "linear-gradient(135deg, rgba(50,40,35,0.95), rgba(30,25,20,0.95))",
            boxShadow: hero.selected
              ? `0 0 14px ${hc}45, inset 0 1px 0 rgba(255,255,255,0.12)`
              : "inset 0 1px 0 rgba(255,255,255,0.06)",
            filter: isAlive ? "none" : "grayscale(0.8)",
          }}
        >
          {isAlive && (
            <>
              <div
                className="absolute inset-0 rounded-full bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(/images/heroes/${hero.type}-action.png)` }}
              />
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 10%, ${hc}22 35%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.65) 100%)`,
                }}
              />
              <div className="absolute rounded-full pointer-events-none" style={{
                top: 2, left: 3, width: '40%', height: '34%',
                background: "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.1), transparent 55%)",
                filter: "blur(1px)",
              }} />
            </>
          )}
          <div className="relative z-10 flex items-center justify-center">
            <HeroSprite type={hero.type} size={30} />
          </div>
        </div>
      </button>

      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full text-[6px] font-bold whitespace-nowrap z-20"
        style={{
          background: isAlive
            ? `linear-gradient(180deg, ${hexToRgba(hc, 0.1)}, rgba(20,16,10,0.92))`
            : "rgba(20,16,10,0.92)",
          border: `1px solid ${isAlive ? hpColor + "60" : "rgba(80,60,40,0.4)"}`,
          color: isAlive ? hpColor : "rgba(160,130,90,0.7)",
          boxShadow: isAlive ? `0 0 4px ${hpColor}12` : "none",
        }}
      >
        {isAlive
          ? `${Math.round(hpPercent)}%`
          : `${Math.ceil(hero.respawnTimer / 1000)}s`}
      </div>

      {hero.selected && isAlive && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
          style={{ boxShadow: `0 0 20px ${hc}50` }}
        />
      )}
    </div>
  );
}

// ── Ability Circle — Ornate ─────────────────────────────────────────────────

function MobileAbilityCircle({
  hero,
  onUseAbility,
}: {
  hero: Hero;
  onUseAbility: () => void;
}) {
  const isReady = hero.abilityReady && !hero.dead;
  const hc = HERO_DATA[hero.type].color;
  const cdTotal = HERO_ABILITY_COOLDOWNS[hero.type];
  const cdFrac = hero.dead
    ? hero.respawnTimer / 5000
    : hero.abilityCooldown / cdTotal;
  const readyAngle = (1 - cdFrac) * 360;

  return (
    <div className="relative" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
      {/* ─── Ornate SVG frame ─── */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: -M_ORB_PAD, left: -M_ORB_PAD }}
        width={M_ORB_FRAME}
        height={M_ORB_FRAME}
        overflow="visible"
      >
        <defs>
          <filter id="mAbilityGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={M_ORB_CX} cy={M_ORB_CX} r={M_ORB_OUTER_R}
          fill="none"
          stroke={isReady ? "rgba(250,204,21,0.2)" : "rgba(110,110,110,0.12)"}
          strokeWidth={0.8}
          strokeDasharray="2 3 4 3"
        />
        <circle
          cx={M_ORB_CX} cy={M_ORB_CX} r={M_ORB_MID_R}
          fill="none"
          stroke={isReady ? "rgba(250,204,21,0.1)" : "rgba(110,110,110,0.06)"}
          strokeWidth={0.5}
        />

        {ANGLES_ALL.map((deg) => {
          const rad = (deg - 90) * DEG_TO_RAD;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const isCard = deg % 90 === 0;
          return (
            <line
              key={`mat-${deg}`}
              x1={M_ORB_CX + M_ORB_TICK_IN * cos}
              y1={M_ORB_CX + M_ORB_TICK_IN * sin}
              x2={M_ORB_CX + M_ORB_TICK_OUT * cos}
              y2={M_ORB_CX + M_ORB_TICK_OUT * sin}
              stroke={isReady ? "rgba(250,204,21,0.28)" : "rgba(110,110,110,0.1)"}
              strokeWidth={isCard ? 1.8 : 0.6}
              strokeLinecap="round"
            />
          );
        })}

        {ANGLES_CARDINAL.map((deg) => {
          const rad = (deg - 90) * DEG_TO_RAD;
          const cx = M_ORB_CX + M_ORB_GEM_R * Math.cos(rad);
          const cy = M_ORB_CX + M_ORB_GEM_R * Math.sin(rad);
          return (
            <rect
              key={`mag-${deg}`}
              x={cx - 2.5} y={cy - 2.5} width={5} height={5}
              rx={0.7}
              transform={`rotate(45 ${cx} ${cy})`}
              fill={isReady ? hexToRgba(hc, 0.75) : "rgba(100,100,100,0.25)"}
              stroke={isReady ? "rgba(250,204,21,0.55)" : "rgba(110,110,110,0.16)"}
              strokeWidth={0.7}
              filter={isReady ? "url(#mAbilityGlow)" : undefined}
            />
          );
        })}

        {ANGLES_INTERCARDINAL.map((deg) => {
          const rad = (deg - 90) * DEG_TO_RAD;
          return (
            <circle
              key={`mad-${deg}`}
              cx={M_ORB_CX + M_ORB_GEM_R * Math.cos(rad)}
              cy={M_ORB_CX + M_ORB_GEM_R * Math.sin(rad)}
              r={1.2}
              fill={isReady ? "rgba(250,204,21,0.35)" : "rgba(110,110,110,0.1)"}
            />
          );
        })}

        {!isReady && cdFrac > 0 && (
          <circle
            cx={M_ORB_CX} cy={M_ORB_CX} r={M_ORB_MID_R}
            fill="none"
            stroke="rgba(250,204,21,0.2)"
            strokeWidth={1.5}
            strokeDasharray={M_ORB_MID_CIRCUM}
            strokeDashoffset={M_ORB_MID_CIRCUM * cdFrac}
            strokeLinecap="round"
            transform={`rotate(-90 ${M_ORB_CX} ${M_ORB_CX})`}
            className="transition-all duration-300"
          />
        )}

        {isReady && (
          <circle
            cx={M_ORB_CX} cy={M_ORB_CX} r={M_ORB_MID_R}
            fill="none"
            stroke="rgba(250,204,21,0.22)"
            strokeWidth={1.5}
            filter="url(#mAbilityGlow)"
          />
        )}
      </svg>

      {/* ─── Main ability button ─── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUseAbility();
        }}
        disabled={!isReady}
        className="absolute inset-0 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{
          background: isReady
            ? `radial-gradient(ellipse 90% 90% at 38% 32%, rgba(140,105,25,0.5), rgba(80,60,15,0.4) 50%, rgba(45,34,12,0.45) 100%)`
            : `radial-gradient(ellipse 90% 90% at 38% 32%, rgba(42,36,28,0.95), rgba(28,24,18,0.95) 50%, rgba(20,16,12,0.95) 100%)`,
          border: `2px solid ${isReady ? "rgba(250,204,21,0.6)" : "rgba(80,60,40,0.4)"}`,
          boxShadow: isReady
            ? `0 0 18px rgba(250,204,21,0.25), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.25)`
            : "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.12)",
          cursor: isReady ? "pointer" : "not-allowed",
        }}
      >
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
          background: isReady
            ? `radial-gradient(ellipse at 50% 30%, ${hexToRgba(hc, 0.22)}, transparent 65%)`
            : `radial-gradient(ellipse at 50% 60%, ${hexToRgba(hc, 0.08)}, transparent 60%)`,
        }} />

        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
          background: "radial-gradient(circle at 50% 50%, transparent 28%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.4) 100%)",
        }} />

        <div className="absolute rounded-full pointer-events-none" style={{
          top: 3, left: 4, width: '38%', height: '32%',
          background: isReady
            ? "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.15), transparent 55%)"
            : "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.04), transparent 50%)",
          filter: "blur(1px)",
        }} />

        <div className="absolute inset-[2px] rounded-full pointer-events-none" style={{
          borderTop: `1px solid ${isReady ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)"}`,
          borderBottom: `1px solid ${isReady ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.08)"}`,
          borderLeft: "1px solid transparent",
          borderRight: "1px solid transparent",
        }} />

        <div className="absolute inset-[5px] rounded-full pointer-events-none" style={{
          border: `1px solid ${isReady ? "rgba(250,204,21,0.08)" : "rgba(80,60,40,0.04)"}`,
        }} />

        {!isReady && cdFrac > 0 && (
          <div
            className="absolute inset-[2px] rounded-full pointer-events-none"
            style={{
              background: `conic-gradient(from -90deg, transparent 0deg, transparent ${readyAngle}deg, rgba(0,0,0,0.6) ${readyAngle}deg, rgba(0,0,0,0.6) 360deg)`,
            }}
          />
        )}

        {isReady && (
          <div className="absolute inset-[2px] rounded-full pointer-events-none" style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(250,204,21,0.09) 12deg, transparent 24deg, transparent 120deg, rgba(250,204,21,0.06) 132deg, transparent 144deg, transparent 240deg, rgba(250,204,21,0.06) 252deg, transparent 264deg, transparent 360deg)",
            animation: "mobileShimmer 5s linear infinite",
          }} />
        )}

        <div className="relative z-10 flex items-center justify-center" style={{
          filter: isReady ? `drop-shadow(0 0 4px ${hexToRgba(hc, 0.4)})` : "none",
        }}>
          {getHeroAbilityIcon(hero.type, 20, isReady ? "" : "opacity-40")}
        </div>

        {isReady && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
            style={{ boxShadow: `0 0 16px rgba(250,204,21,0.35), 0 0 6px ${hexToRgba(hc, 0.2)}` }}
          />
        )}
      </button>

      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full text-[6px] font-bold uppercase tracking-wider whitespace-nowrap z-20"
        style={{
          background: isReady
            ? "linear-gradient(180deg, rgba(55,42,14,0.95), rgba(22,18,6,0.95))"
            : "rgba(20,16,10,0.92)",
          border: `1px solid ${isReady ? "rgba(250,204,21,0.45)" : "rgba(80,60,40,0.3)"}`,
          color: isReady ? "#fbbf24" : "rgba(160,140,100,0.6)",
          boxShadow: isReady ? "0 0 5px rgba(250,204,21,0.1)" : "none",
        }}
      >
        {hero.dead
          ? `${Math.ceil(hero.respawnTimer / 1000)}s`
          : isReady
            ? "Ready"
            : `${Math.ceil(hero.abilityCooldown / 1000)}s`}
      </div>
    </div>
  );
}

// ── Spell Circle — Ornate ───────────────────────────────────────────────────

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
    <div className="relative" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
      {/* ─── Ornate SVG frame ─── */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: -M_ORB_PAD, left: -M_ORB_PAD }}
        width={M_ORB_FRAME}
        height={M_ORB_FRAME}
        overflow="visible"
      >
        <defs>
          <filter id={`mSpellGlow-${spell.type}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {spellFrameElements({
          cx: M_ORB_CX,
          outerR: M_ORB_CX - 2,
          midR: M_ORB_MID_R,
          color: active ? hexToRgba(accent.border, 0.22) : "rgba(110,110,110,0.16)",
          dimColor: active ? hexToRgba(accent.border, 0.1) : "rgba(110,110,110,0.08)",
          prefix: `ms-${spell.type}`,
          glowFilter: active ? `url(#mSpellGlow-${spell.type})` : undefined,
        })}

        {onCooldown && (
          <circle
            cx={M_ORB_CX} cy={M_ORB_CX} r={M_ORB_MID_R}
            fill="none"
            stroke={hexToRgba(accent.border, 0.2)}
            strokeWidth={1.5}
            strokeDasharray={M_ORB_MID_CIRCUM}
            strokeDashoffset={M_ORB_MID_CIRCUM * cdFrac}
            strokeLinecap="round"
            transform={`rotate(-90 ${M_ORB_CX} ${M_ORB_CX})`}
            className="transition-all duration-300"
          />
        )}

        {isTargeting && (
          <circle
            cx={M_ORB_CX} cy={M_ORB_CX} r={M_ORB_MID_R}
            fill="none"
            stroke={hexToRgba(accent.border, 0.28)}
            strokeWidth={1.5}
            filter={`url(#mSpellGlow-${spell.type})`}
          />
        )}
      </svg>

      {/* ─── Main spell button ─── */}
      <button
        onClick={onClick}
        disabled={!active}
        className="absolute inset-0 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{
          opacity: active ? 1 : 0.45,
          cursor: active ? "pointer" : "not-allowed",
        }}
      >
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: active
              ? `radial-gradient(ellipse 90% 90% at 34% 32%, ${accent.bg}, ${accent.bg.replace("0.3)", "0.12)")})`
              : "radial-gradient(ellipse 90% 90% at 34% 32%, rgba(38,32,28,0.95), rgba(24,20,16,0.95))",
            border: `2px solid ${isTargeting ? accent.border : active ? accent.border + "90" : "rgba(80,60,40,0.3)"}`,
            boxShadow: isTargeting
              ? `0 0 18px ${accent.glow}, 0 0 0 2px ${accent.border}50`
              : active
                ? `0 0 12px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.15)`
                : "inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {active && (
            <>
              <div
                className="absolute inset-0 rounded-full bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url(/images/spells/${spell.type}-action.png)` }}
              />
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 16%, rgba(0,0,0,0.3) 48%, rgba(0,0,0,0.6) 100%)",
                }}
              />
              <div className="absolute rounded-full pointer-events-none" style={{
                top: 3, left: 3, width: '36%', height: '30%',
                background: "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.11), transparent 55%)",
                filter: "blur(1px)",
              }} />
            </>
          )}

          <div className="absolute inset-[2px] rounded-full pointer-events-none" style={{
            borderTop: `1px solid ${active ? 'rgba(255,255,255,0.07)' : 'rgba(80,80,80,0.03)'}`,
            borderBottom: `1px solid ${active ? 'rgba(0,0,0,0.14)' : 'rgba(0,0,0,0.05)'}`,
            borderLeft: "1px solid transparent",
            borderRight: "1px solid transparent",
          }} />

          {onCooldown && (
            <div
              className="absolute inset-[2px] rounded-full pointer-events-none z-10"
              style={{
                background: `conic-gradient(from -90deg, transparent 0deg, transparent ${readyAngle}deg, rgba(0,0,0,0.6) ${readyAngle}deg, rgba(0,0,0,0.6) 360deg)`,
              }}
            />
          )}
        </div>

        <div className="relative z-[5] flex items-center justify-center" style={{
          filter: active ? `drop-shadow(0 0 3px ${accent.glow})` : "none",
        }}>
          <SpellSprite type={spell.type} size={22} />
        </div>
      </button>

      {/* Level badge */}
      <div
        className="absolute -top-0.5 -right-0.5 px-1 py-px rounded-full text-[7px] font-bold z-20"
        style={{
          background: active
            ? "linear-gradient(135deg, rgba(100,75,18,0.92), rgba(60,45,10,0.92))"
            : "rgba(80,60,15,0.9)",
          border: `1px solid ${active ? hexToRgba(accent.border, 0.35) : "rgba(250,204,21,0.2)"}`,
          color: "#fde047",
          boxShadow: active ? `0 0 4px ${accent.glow}` : "none",
        }}
      >
        {spellLevel + 1}
      </div>

      {/* Bottom label */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-px px-1.5 py-px rounded-full text-[6px] font-bold whitespace-nowrap z-20"
        style={{
          background: active && !onCooldown
            ? `linear-gradient(180deg, ${accent.bg.replace("0.3)", "0.18)")}, rgba(20,16,10,0.92))`
            : "rgba(20,16,10,0.92)",
          border: `1px solid ${onCooldown ? "rgba(239,68,68,0.4)" : active ? accent.border + "50" : "rgba(80,60,40,0.25)"}`,
          color: onCooldown
            ? "#f87171"
            : active
              ? accent.border
              : "rgba(120,100,80,0.5)",
          boxShadow: active && !onCooldown ? `0 0 4px ${accent.glow}` : "none",
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

      {isTargeting && (
        <>
          <div
            className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
            style={{ boxShadow: `0 0 16px ${accent.glow}` }}
          />
          <div className="absolute inset-[1px] rounded-full pointer-events-none" style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${hexToRgba(accent.border, 0.07)} 15deg, transparent 30deg, transparent 180deg, ${hexToRgba(accent.border, 0.05)} 195deg, transparent 210deg, transparent 360deg)`,
            animation: "mobileShimmer 5s linear infinite",
          }} />
        </>
      )}
    </div>
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
    <>
    <div className="flex items-end justify-between w-full px-2 pb-3">
      {/* Left: Hero + Ability */}
      <div className="flex items-end gap-3 pointer-events-auto">
        <MobileHeroCircle hero={hero} onClick={toggleHeroSelection} />
        <MobileAbilityCircle hero={hero} onUseAbility={onUseHeroAbility} />
      </div>

      {/* Right: Spells */}
      <div className="flex items-end gap-3 pointer-events-auto">
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
    <style>{`@keyframes mobileShimmer { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </>
  );
};
