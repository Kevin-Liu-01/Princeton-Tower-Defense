"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  Timer,
  Swords,
  Target,
  Shield,
  Pointer,
  Grab,
  Coins,
  Clock,
  Flame,
  Zap,
  Snowflake,
  Sparkles,
  Users,
  TrendingUp,
  Crosshair,
} from "lucide-react";
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
  MAX_SPELL_UPGRADE_LEVEL,
  getFireballSpellStats,
  getLightningSpellStats,
  getFreezeSpellStats,
  getPaydaySpellStats,
  getReinforcementSpellStats,
} from "../../constants";
import { HeroSprite, SpellSprite, getHeroAbilityIcon } from "../../sprites";
import { useIsTouchDevice } from "./hooks";
import { PANEL, NEUTRAL, OVERLAY, SPELL_THEME } from "./theme";
import { HudTooltip } from "./HudTooltip";
import { MobileHeroSpellBar } from "./MobileHeroSpellBar";
import { heroFrameElements, spellFrameElements } from "./ornateFrameHelpers";

// =============================================================================
// HP THEME — transitions green → yellow → red by hero health %
// =============================================================================

function getHpRingColor(percent: number, heroColor: string): string {
  if (percent <= 25) return "#ef4444";
  if (percent <= 50) return "#eab308";
  return heroColor;
}

const DESKTOP_HERO_SIZE = 84;
const DESKTOP_HERO_RING_R = DESKTOP_HERO_SIZE / 2 - 3;
const DESKTOP_HERO_RING_C = 2 * Math.PI * DESKTOP_HERO_RING_R;
const DESKTOP_ABILITY_SIZE = 64;
const ORNATE_FRAME_SIZE = 92;
const ORNATE_PAD = (ORNATE_FRAME_SIZE - DESKTOP_ABILITY_SIZE) / 2;
const ORNATE_CX = ORNATE_FRAME_SIZE / 2;
const ORNATE_OUTER_R = ORNATE_CX - 2;
const ORNATE_MID_R = ORNATE_CX - 5;
const ORNATE_GEM_R = ORNATE_CX - 2;
const ORNATE_TICK_INNER = ORNATE_CX - 8;
const ORNATE_TICK_OUTER = ORNATE_CX - 1;
const ORNATE_RING_CIRCUM = 2 * Math.PI * ORNATE_MID_R;
const DEG_TO_RAD = Math.PI / 180;
const ORNATE_ANGLES_ALL = [0, 45, 90, 135, 180, 225, 270, 315];
const ORNATE_ANGLES_CARDINAL = [0, 90, 180, 270];
const ORNATE_ANGLES_INTERCARDINAL = [45, 135, 225, 315];

const HERO_ORNATE_SIZE = 112;
const HERO_ORNATE_PAD = (HERO_ORNATE_SIZE - DESKTOP_HERO_SIZE) / 2;
const HERO_ORNATE_CX = HERO_ORNATE_SIZE / 2;
const HERO_ORNATE_MID_R = HERO_ORNATE_CX - 5;
const HERO_ORNATE_MID_CIRCUM = 2 * Math.PI * HERO_ORNATE_MID_R;

const SPELL_ORB_SIZE = 72;
const SPELL_ORNATE_SIZE = 96;
const SPELL_ORNATE_PAD = (SPELL_ORNATE_SIZE - SPELL_ORB_SIZE) / 2;
const SPELL_ORNATE_CX = SPELL_ORNATE_SIZE / 2;
const SPELL_ORNATE_MID_R = SPELL_ORNATE_CX - 5;
const SPELL_ORNATE_RING_CIRCUM = 2 * Math.PI * SPELL_ORNATE_MID_R;

function getHeroHpTheme(percent: number) {
  if (percent <= 25) {
    return {
      barColor: "from-red-500 to-red-700",
      glowColor: "shadow-red-500/50",
      textColor: "text-red-400",
      fillGradient: "linear-gradient(90deg, rgba(180,80,60,0.18), rgba(180,80,60,0.06))",
      heartbeat: true,
      beatSpeed: percent <= 10 ? "0.6s" : "0.9s",
    };
  }
  if (percent <= 50) {
    return {
      barColor: "from-yellow-400 to-yellow-600",
      glowColor: "shadow-yellow-500/40",
      textColor: "text-yellow-400",
      fillGradient: "linear-gradient(90deg, rgba(200,160,60,0.14), rgba(200,160,60,0.05))",
      heartbeat: false,
      beatSpeed: "0s",
    };
  }
  return {
    barColor: "from-emerald-400 to-emerald-600",
    glowColor: "shadow-emerald-500/40",
    textColor: "text-emerald-400",
    fillGradient: "linear-gradient(90deg, rgba(180,140,50,0.12), rgba(180,140,50,0.04))",
    heartbeat: false,
    beatSpeed: "0s",
  };
}

// =============================================================================
// HERO ABILITY COLOR OVERLAY — subtle hero-color tint over the amber base
// =============================================================================

function hexToRgba(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// =============================================================================
// HERO AND SPELL BAR COMPONENT - ENHANCED
// =============================================================================
// SPELL INFO PORTAL — renders above the orb via portal to avoid clipping
// =============================================================================

interface SpellInfoPortalProps {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

const SpellInfoPortal: React.FC<SpellInfoPortalProps> = ({ anchorRef, children }) => {
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const panelW = 280;
    let left = cx - panelW / 2;
    if (left < 8) left = 8;
    if (left + panelW > window.innerWidth - 8) left = window.innerWidth - 8 - panelW;
    setPos({ left, bottom: window.innerHeight - rect.top + 10 });
  }, [anchorRef]);

  if (!pos || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed z-[85] pointer-events-none"
      style={{ left: pos.left, bottom: pos.bottom, width: 280 }}
    >
      {children}
    </div>,
    document.body,
  );
};

interface HeroSpellBarProps {
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

export const HeroSpellBar: React.FC<HeroSpellBarProps> = ({
  hero,
  spells,
  pawPoints,
  enemies,
  spellUpgradeLevels,
  targetingSpell,
  placingTroop,
  spellAutoAim,
  onToggleSpellAutoAim,
  toggleHeroSelection,
  onUseHeroAbility,
  castSpell,
}) => {
  const [hoveredSpell, setHoveredSpell] = React.useState<SpellType | null>(null);
  const [heroHovered, setHeroHovered] = React.useState(false);
  const [abilityHovered, setAbilityHovered] = React.useState(false);
  const orbRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const getOrbRef = useCallback((type: string) => (el: HTMLDivElement | null) => { orbRefs.current[type] = el; }, []);
  const isTouchDevice = useIsTouchDevice();
  const fireballStats = getFireballSpellStats(spellUpgradeLevels.fireball);
  const lightningStats = getLightningSpellStats(spellUpgradeLevels.lightning);
  const freezeStats = getFreezeSpellStats(spellUpgradeLevels.freeze);
  const paydayStats = getPaydaySpellStats(spellUpgradeLevels.payday);
  const reinforcementStats = getReinforcementSpellStats(
    spellUpgradeLevels.reinforcements
  );

  const spellThemes: Record<string, {
    border: string; bg: string; activeBg: string; glow: string;
    nameColor: string; icon: React.ReactNode; accentColor: string;
    panelBg: string; panelBorder: string; headerBg: string;
    stats: Array<{ label: string; value: string; color: string; bg: string; border: string; icon: React.ReactNode }>;
    effectBg: string; effectLabel: string; effectText: string; effect: string;
  }> = {
    fireball: {
      border: "border-orange-600", bg: "from-orange-800/90 to-orange-950/90", activeBg: "from-orange-700/90 to-orange-900/90", glow: "shadow-orange-500/30",
      nameColor: "text-orange-200", icon: <Flame size={10} className="text-orange-400" />, accentColor: "text-orange-300",
      panelBg: SPELL_THEME.fire.panelBg, panelBorder: "rgba(234,88,12,0.5)", headerBg: "linear-gradient(90deg, rgba(180,80,20,0.25), transparent)",
      stats: [
        { label: "Damage", value: `${fireballStats.damagePerMeteor}×${fireballStats.meteorCount}`, color: "text-red-300", bg: "rgba(127,29,29,0.3)", border: "rgba(127,29,29,0.2)", icon: <Swords size={9} className="text-red-400" /> },
        { label: "Radius", value: `${fireballStats.impactRadius}`, color: "text-orange-300", bg: "rgba(124,45,18,0.3)", border: "rgba(124,45,18,0.2)", icon: <Target size={9} className="text-orange-400" /> },
        { label: "Burn", value: `${(fireballStats.burnDurationMs / 1000).toFixed(1)}s`, color: "text-amber-300", bg: "rgba(120,53,15,0.3)", border: "rgba(120,53,15,0.2)", icon: <Flame size={9} className="text-amber-400" /> },
      ],
      effectBg: "rgba(124,45,18,0.15)", effectLabel: "text-orange-500/80", effectText: "text-orange-200/90",
      effect: `Rains ${fireballStats.meteorCount} meteors in an area. Each deals ${fireballStats.damagePerMeteor} AoE damage with falloff and sets enemies ablaze for ${(fireballStats.burnDurationMs / 1000).toFixed(1)} seconds.${spellUpgradeLevels.fireball >= 2 ? " Click to choose target location." : ""}`,
    },
    lightning: {
      border: "border-yellow-600", bg: "from-yellow-800/90 to-yellow-950/90", activeBg: "from-yellow-700/90 to-yellow-900/90", glow: "shadow-yellow-500/30",
      nameColor: "text-yellow-200", icon: <Zap size={10} className="text-yellow-400" />, accentColor: "text-yellow-300",
      panelBg: SPELL_THEME.lightning.panelBg, panelBorder: "rgba(234,179,8,0.5)", headerBg: "linear-gradient(90deg, rgba(180,140,20,0.25), transparent)",
      stats: [
        { label: "Total DMG", value: `${lightningStats.totalDamage}`, color: "text-yellow-300", bg: "rgba(113,63,18,0.3)", border: "rgba(113,63,18,0.2)", icon: <Swords size={9} className="text-yellow-400" /> },
        { label: "Chains", value: `${lightningStats.chainCount}`, color: "text-cyan-300", bg: "rgba(22,78,99,0.3)", border: "rgba(22,78,99,0.2)", icon: <Zap size={9} className="text-cyan-400" /> },
        { label: "Stun", value: `${(lightningStats.stunDurationMs / 1000).toFixed(2)}s`, color: "text-blue-300", bg: "rgba(30,58,138,0.3)", border: "rgba(30,58,138,0.2)", icon: <Timer size={9} className="text-blue-400" /> },
      ],
      effectBg: "rgba(113,63,18,0.15)", effectLabel: "text-yellow-500/80", effectText: "text-yellow-200/90",
      effect: `Lightning chains between up to ${lightningStats.chainCount} enemies, splitting ${lightningStats.totalDamage} total damage. Each hit stuns for ${(lightningStats.stunDurationMs / 1000).toFixed(2)} seconds.${spellUpgradeLevels.lightning >= 2 ? " Click to choose target location." : ""}`,
    },
    freeze: {
      border: "border-cyan-600", bg: "from-cyan-800/90 to-cyan-950/90", activeBg: "from-cyan-700/90 to-cyan-900/90", glow: "shadow-cyan-500/30",
      nameColor: "text-cyan-200", icon: <Snowflake size={10} className="text-cyan-400" />, accentColor: "text-cyan-300",
      panelBg: SPELL_THEME.ice.panelBg, panelBorder: "rgba(6,182,212,0.5)", headerBg: "linear-gradient(90deg, rgba(20,100,140,0.25), transparent)",
      stats: [
        { label: "Duration", value: `${(freezeStats.freezeDurationMs / 1000).toFixed(1)}s`, color: "text-cyan-300", bg: "rgba(22,78,99,0.3)", border: "rgba(22,78,99,0.2)", icon: <Timer size={9} className="text-cyan-400" /> },
        { label: "Range", value: "Global", color: "text-blue-300", bg: "rgba(30,58,138,0.3)", border: "rgba(30,58,138,0.2)", icon: <Target size={9} className="text-blue-400" /> },
        { label: "Slow", value: "100%", color: "text-indigo-300", bg: "rgba(49,46,129,0.3)", border: "rgba(49,46,129,0.2)", icon: <Snowflake size={9} className="text-indigo-400" /> },
      ],
      effectBg: "rgba(22,78,99,0.15)", effectLabel: "text-cyan-500/80", effectText: "text-cyan-200/90",
      effect: `Expanding ice wave freezes ALL enemies on the map for ${(freezeStats.freezeDurationMs / 1000).toFixed(1)} seconds. Great for emergencies.`,
    },
    payday: {
      border: "border-amber-600", bg: "from-amber-800/90 to-amber-950/90", activeBg: "from-amber-700/90 to-amber-900/90", glow: "shadow-amber-500/30",
      nameColor: "text-amber-200", icon: <Coins size={10} className="text-amber-400" />, accentColor: "text-amber-300",
      panelBg: SPELL_THEME.gold.panelBg, panelBorder: "rgba(245,158,11,0.5)", headerBg: "linear-gradient(90deg, rgba(160,110,20,0.25), transparent)",
      stats: [
        { label: "Base PP", value: `${paydayStats.basePayout}`, color: "text-amber-300", bg: "rgba(120,53,15,0.3)", border: "rgba(120,53,15,0.2)", icon: <Coins size={9} className="text-amber-400" /> },
        { label: "Per Enemy", value: `+${paydayStats.bonusPerEnemy}`, color: "text-green-300", bg: "rgba(20,83,45,0.3)", border: "rgba(20,83,45,0.2)", icon: <TrendingUp size={9} className="text-green-400" /> },
        { label: "Max Total", value: `${paydayStats.basePayout + paydayStats.maxBonus}`, color: "text-yellow-300", bg: "rgba(113,63,18,0.3)", border: "rgba(113,63,18,0.2)", icon: <Sparkles size={9} className="text-yellow-400" /> },
      ],
      effectBg: "rgba(120,53,15,0.15)", effectLabel: "text-amber-500/80", effectText: "text-amber-200/90",
      effect: `Grants ${paydayStats.basePayout} PP plus ${paydayStats.bonusPerEnemy} PP per enemy on the map (max +${paydayStats.maxBonus} bonus). Aura lasts ${(paydayStats.auraDurationMs / 1000).toFixed(0)} seconds.`,
    },
    reinforcements: {
      border: "border-emerald-600", bg: "from-emerald-800/90 to-emerald-950/90", activeBg: "from-emerald-700/90 to-emerald-900/90", glow: "shadow-emerald-500/30",
      nameColor: "text-emerald-200", icon: <Shield size={10} className="text-emerald-400" />, accentColor: "text-emerald-300",
      panelBg: SPELL_THEME.nature.panelBg, panelBorder: "rgba(16,185,129,0.5)", headerBg: "linear-gradient(90deg, rgba(20,120,80,0.25), transparent)",
      stats: [
        { label: "Units", value: `${reinforcementStats.knightCount}`, color: "text-emerald-300", bg: "rgba(6,78,59,0.3)", border: "rgba(6,78,59,0.2)", icon: <Users size={9} className="text-emerald-400" /> },
        { label: "HP Each", value: `${reinforcementStats.knightHp}`, color: "text-red-300", bg: "rgba(127,29,29,0.3)", border: "rgba(127,29,29,0.2)", icon: <Heart size={9} className="text-red-400" /> },
        { label: "DMG Each", value: `${reinforcementStats.knightDamage}`, color: "text-orange-300", bg: "rgba(124,45,18,0.3)", border: "rgba(124,45,18,0.2)", icon: <Swords size={9} className="text-orange-400" /> },
      ],
      effectBg: "rgba(6,78,59,0.15)", effectLabel: "text-emerald-500/80", effectText: "text-emerald-200/90",
      effect: reinforcementStats.rangedUnlocked
        ? `Summons ${reinforcementStats.knightCount} veteran reinforcements with tier-${reinforcementStats.visualTier} armor. They fight in melee and fire ranged volleys.`
        : `Summons ${reinforcementStats.knightCount} armored reinforcements at a chosen location. They block and fight enemies until defeated.`,
    },
  };

  return (
    <div
      data-tutorial="hero-spell-bar"
      className="relative z-20 pointer-events-none"
    >
      {/* Mobile/Tablet: Compact circle layout */}
      <div className="flex xl:hidden">
        <MobileHeroSpellBar
          hero={hero}
          spells={spells}
          pawPoints={pawPoints}
          enemies={enemies}
          spellUpgradeLevels={spellUpgradeLevels}
          targetingSpell={targetingSpell}
          placingTroop={placingTroop}
          spellAutoAim={spellAutoAim}
          onToggleSpellAutoAim={onToggleSpellAutoAim}
          toggleHeroSelection={toggleHeroSelection}
          onUseHeroAbility={onUseHeroAbility}
          castSpell={castSpell}
        />
      </div>

      {/* Desktop: Full card layout */}
      <div className="hidden xl:flex p-2 pl-4 pr-5 items-end justify-between gap-6">
        {/* Hero Section — circle aesthetic matching spell orbs */}
        <div className="flex-shrink-0 pointer-events-auto">
          {hero && (() => {
            const isAlive = !hero.dead;
            const hc = HERO_DATA[hero.type].color;
            const heroData = HERO_DATA[hero.type];
            const hpPercent = isAlive ? Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100)) : 0;
            const hpRingColor = getHpRingColor(hpPercent, hc);
            const hpTheme = getHeroHpTheme(hpPercent);
            const hpStrokeOffset = DESKTOP_HERO_RING_C * (1 - hpPercent / 100);
            const isReady = hero.abilityReady && isAlive;
            const cdTotal = HERO_ABILITY_COOLDOWNS[hero.type];
            const cdFrac = hero.dead ? hero.respawnTimer / 5000 : hero.abilityCooldown / cdTotal;
            const readyAngle = (1 - cdFrac) * 360;

            return (
              <div className="flex items-end sm:ml-2 gap-8">
                {/* Hero Portrait Circle — Ornate */}
                <div className="flex flex-col items-center">
                  <HudTooltip label={hero.selected ? "Click map to move hero" : "Click to select hero"} position="top">
                    <div className="relative" style={{ width: DESKTOP_HERO_SIZE, height: DESKTOP_HERO_SIZE }}>
                      {/* ─── Ornate SVG portrait frame ─── */}
                      <svg
                        className="absolute pointer-events-none"
                        style={{
                          top: -HERO_ORNATE_PAD,
                          left: -HERO_ORNATE_PAD,
                          transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
                          transform: heroHovered && isAlive
                            ? "rotate(45deg) scale(1.06)"
                            : "rotate(0deg) scale(1)",
                          filter: heroHovered && isAlive
                            ? `drop-shadow(0 0 6px ${hexToRgba(hc, 0.4)})`
                            : "none",
                        }}
                        width={HERO_ORNATE_SIZE}
                        height={HERO_ORNATE_SIZE}
                        overflow="visible"
                      >
                        <defs>
                          <filter id="heroGemGlow">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {heroFrameElements({
                          cx: HERO_ORNATE_CX,
                          outerR: HERO_ORNATE_CX - 2,
                          midR: HERO_ORNATE_MID_R,
                          color: isAlive
                            ? hexToRgba(hc, heroHovered ? 0.4 : 0.25)
                            : "rgba(110,110,110,0.18)",
                          dimColor: isAlive
                            ? hexToRgba(hc, heroHovered ? 0.2 : 0.12)
                            : "rgba(110,110,110,0.09)",
                          prefix: "hp",
                          glowFilter: isAlive && (hero.selected || heroHovered) ? "url(#heroGemGlow)" : undefined,
                        })}

                        {/* HP progress arc on outer ring */}
                        {isAlive && (
                          <circle
                            cx={HERO_ORNATE_CX} cy={HERO_ORNATE_CX} r={HERO_ORNATE_MID_R}
                            fill="none"
                            stroke={hpRingColor}
                            strokeWidth={2.5}
                            strokeDasharray={HERO_ORNATE_MID_CIRCUM}
                            strokeDashoffset={HERO_ORNATE_MID_CIRCUM * (1 - hpPercent / 100)}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${HERO_ORNATE_CX} ${HERO_ORNATE_CX})`}
                            className="transition-all duration-300"
                            opacity={0.4}
                          />
                        )}

                        {/* Hover: soft glowing ring */}
                        {heroHovered && isAlive && !hero.selected && (
                          <circle
                            cx={HERO_ORNATE_CX} cy={HERO_ORNATE_CX} r={HERO_ORNATE_MID_R}
                            fill="none"
                            stroke={hexToRgba(hc, 0.2)}
                            strokeWidth={1.5}
                            filter="url(#heroGemGlow)"
                          />
                        )}

                        {/* Selected: full glowing outer ring */}
                        {hero.selected && isAlive && (
                          <circle
                            cx={HERO_ORNATE_CX} cy={HERO_ORNATE_CX} r={HERO_ORNATE_MID_R}
                            fill="none"
                            stroke={hexToRgba(hc, 0.25)}
                            strokeWidth={2}
                            filter="url(#heroGemGlow)"
                          />
                        )}
                      </svg>

                      {/* ─── Main hero portrait button ─── */}
                      <button
                        onClick={toggleHeroSelection}
                        onMouseEnter={() => !isTouchDevice && setHeroHovered(true)}
                        onMouseLeave={() => setHeroHovered(false)}
                        className="absolute inset-0 rounded-full flex items-center justify-center transition-all active:scale-95"
                      >
                        {/* SVG HP ring */}
                        <svg className="absolute inset-0" width={DESKTOP_HERO_SIZE} height={DESKTOP_HERO_SIZE} overflow="visible" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx={DESKTOP_HERO_SIZE / 2} cy={DESKTOP_HERO_SIZE / 2} r={DESKTOP_HERO_RING_R} fill="none" stroke="rgba(80,60,40,0.35)" strokeWidth={4} />
                          {isAlive && (
                            <circle
                              cx={DESKTOP_HERO_SIZE / 2} cy={DESKTOP_HERO_SIZE / 2} r={DESKTOP_HERO_RING_R}
                              fill="none" stroke={hpRingColor} strokeWidth={4}
                              strokeDasharray={DESKTOP_HERO_RING_C} strokeDashoffset={hpStrokeOffset}
                              strokeLinecap="round" className="transition-all duration-300"
                              style={{ filter: `drop-shadow(0 0 5px ${hpRingColor})` }}
                            />
                          )}
                        </svg>

                        {/* Bevel ring — top bright, bottom dark for 3D emboss */}
                        <div className="absolute inset-[2px] rounded-full pointer-events-none" style={{
                          borderTop: `1px solid ${isAlive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)"}`,
                          borderBottom: `1px solid ${isAlive ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)"}`,
                          borderLeft: "1px solid transparent",
                          borderRight: "1px solid transparent",
                        }} />

                        {/* Hero color border ring */}
                        <div className="absolute inset-[4px] rounded-full pointer-events-none transition-all duration-300" style={{
                          border: `2.5px solid ${hero.selected ? hc + "90" : isAlive ? hc + "45" : "rgba(80,60,40,0.3)"}`,
                          boxShadow: hero.selected
                            ? `0 0 20px ${hc}40, inset 0 0 10px ${hc}15`
                            : isAlive ? `inset 0 0 4px ${hc}10` : "none",
                        }} />

                        {/* Portrait area */}
                        <div className="absolute inset-[7px] rounded-full overflow-hidden" style={{
                          background: isAlive
                            ? `radial-gradient(circle at 32% 32%, ${hc}35, ${hc}12)`
                            : "linear-gradient(135deg, rgba(50,40,35,0.95), rgba(30,25,20,0.95))",
                          filter: isAlive ? "none" : "grayscale(0.8) brightness(0.5)",
                        }}>
                          <div className="absolute inset-0 rounded-full bg-cover bg-center" style={{
                            backgroundImage: `url(/images/heroes/${hero.type}-action.png)`,
                            opacity: isAlive ? 0.6 : 0.2,
                          }} />
                          {/* Enhanced vignette */}
                          <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                            background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 10%, ${hc}22 35%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.7) 100%)`,
                          }} />
                          {/* Specular highlight on portrait */}
                          {isAlive && (
                            <div className="absolute rounded-full pointer-events-none" style={{
                              top: 3, left: 5, width: '44%', height: '38%',
                              background: "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.12), transparent 55%)",
                              filter: "blur(2px)",
                            }} />
                          )}
                          <div className="relative z-10 flex items-center justify-center h-full">
                            <HeroSprite type={hero.type} size={54} />
                          </div>
                        </div>

                        {/* Engraved inner ring */}
                        <div className="absolute inset-[9px] rounded-full pointer-events-none" style={{
                          border: `1px solid ${isAlive ? hexToRgba(hc, 0.1) : "rgba(80,60,40,0.05)"}`,
                        }} />

                        {/* Selection indicator badge */}
                        <div className="absolute top-0.5 right-0.5 z-20 rounded-full flex items-center justify-center" style={{
                          width: 22, height: 22,
                          background: hero.selected
                            ? "linear-gradient(135deg, rgba(130,100,25,0.92), rgba(90,68,15,0.92))"
                            : "rgba(20,16,10,0.88)",
                          border: `2px solid ${hero.selected ? "rgba(250,204,21,0.55)" : "rgba(80,60,40,0.4)"}`,
                          boxShadow: hero.selected ? "0 0 8px rgba(250,204,21,0.2)" : "none",
                        }}>
                          {hero.selected ? <Grab size={11} className="text-amber-300" /> : <Pointer size={11} className="text-amber-500/70" />}
                        </div>

                        {/* Selected glow pulse */}
                        {hero.selected && isAlive && (
                          <div className="absolute inset-0 rounded-full pointer-events-none animate-pulse" style={{ boxShadow: `0 0 26px ${hc}45, 0 0 52px ${hc}15` }} />
                        )}

                        {/* Low-HP heartbeat */}
                        {isAlive && hpTheme.heartbeat && (
                          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ animation: `heroHeartbeat ${hpTheme.beatSpeed} ease-in-out infinite` }} />
                        )}
                      </button>

                      {/* Name tag */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider whitespace-nowrap" style={{
                        background: isAlive
                          ? `linear-gradient(180deg, ${hexToRgba(hc, 0.15)}, rgba(20,16,10,0.92))`
                          : "rgba(20,16,10,0.92)",
                        border: `1px solid ${isAlive ? hc + "55" : "rgba(80,60,40,0.35)"}`,
                        color: isAlive ? "#fde68a" : "rgba(160,140,100,0.6)",
                        boxShadow: isAlive ? `0 0 6px ${hc}15` : "none",
                      }}>
                        {heroData.name}
                      </div>
                    </div>
                  </HudTooltip>

                  {isAlive ? (
                    <>
                      <div className="text-[8px] font-bold tabular-nums mt-4" style={{ color: hpRingColor }}>
                        {Math.floor(hero.hp)}/{hero.maxHp}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 mt-4">
                      <Timer size={10} className="text-red-400" />
                      <span className="text-[9px] text-red-400 font-bold tabular-nums">{Math.ceil(hero.respawnTimer / 1000)}s</span>
                      <span className="text-[7px] text-stone-600 uppercase tracking-wider">respawn</span>
                    </div>
                  )}
                </div>

                {/* Ability Circle — Ornate */}
                <div className="flex flex-col items-center">
                  <HudTooltip
                    label={isReady
                      ? `${heroData.ability} — Ready! Click to activate`
                      : hero.dead
                        ? `${heroData.ability} — Hero is dead`
                        : `${heroData.ability} — ${Math.ceil(hero.abilityCooldown / 1000)}s cooldown`
                    }
                    position="top"
                  >
                    <div className="relative" style={{ width: DESKTOP_ABILITY_SIZE, height: DESKTOP_ABILITY_SIZE }}>
                      {/* ─── Ornate SVG frame ─── */}
                      <svg
                        className="absolute pointer-events-none"
                        style={{
                          top: -ORNATE_PAD,
                          left: -ORNATE_PAD,
                          transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
                          transform: abilityHovered
                            ? "rotate(45deg) scale(1.07)"
                            : "rotate(0deg) scale(1)",
                          filter: abilityHovered && isReady
                            ? "drop-shadow(0 0 8px rgba(250,204,21,0.4))"
                            : abilityHovered
                              ? "drop-shadow(0 0 4px rgba(140,140,140,0.2))"
                              : "none",
                        }}
                        width={ORNATE_FRAME_SIZE}
                        height={ORNATE_FRAME_SIZE}
                        overflow="visible"
                      >
                        <defs>
                          <filter id="abilityGemGlow">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <linearGradient id="ornateTickGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isReady ? "rgba(250,204,21,0.5)" : abilityHovered ? "rgba(130,130,130,0.3)" : "rgba(110,110,110,0.18)"} />
                            <stop offset="100%" stopColor={isReady ? "rgba(250,204,21,0.15)" : abilityHovered ? "rgba(130,130,130,0.12)" : "rgba(110,110,110,0.07)"} />
                          </linearGradient>
                        </defs>

                        {/* Outermost decorative dashed ring */}
                        <circle
                          cx={ORNATE_CX} cy={ORNATE_CX} r={ORNATE_OUTER_R}
                          fill="none"
                          stroke={isReady ? "rgba(250,204,21,0.22)" : abilityHovered ? "rgba(130,130,130,0.18)" : "rgba(110,110,110,0.14)"}
                          strokeWidth={1}
                          strokeDasharray="2 4 6 4"
                        />

                        {/* Secondary thin solid ring */}
                        <circle
                          cx={ORNATE_CX} cy={ORNATE_CX} r={ORNATE_MID_R}
                          fill="none"
                          stroke={isReady ? "rgba(250,204,21,0.14)" : abilityHovered ? "rgba(130,130,130,0.1)" : "rgba(110,110,110,0.07)"}
                          strokeWidth={0.5}
                        />

                        {/* 8 tick marks at 45° intervals */}
                        {ORNATE_ANGLES_ALL.map((deg) => {
                          const rad = (deg - 90) * DEG_TO_RAD;
                          const cos = Math.cos(rad);
                          const sin = Math.sin(rad);
                          const isCard = deg % 90 === 0;
                          return (
                            <line
                              key={`tick-${deg}`}
                              x1={ORNATE_CX + ORNATE_TICK_INNER * cos}
                              y1={ORNATE_CX + ORNATE_TICK_INNER * sin}
                              x2={ORNATE_CX + ORNATE_TICK_OUTER * cos}
                              y2={ORNATE_CX + ORNATE_TICK_OUTER * sin}
                              stroke="url(#ornateTickGrad)"
                              strokeWidth={isCard ? 2.5 : 1}
                              strokeLinecap="round"
                            />
                          );
                        })}

                        {/* 4 cardinal diamond gems */}
                        {ORNATE_ANGLES_CARDINAL.map((deg) => {
                          const rad = (deg - 90) * DEG_TO_RAD;
                          const cx = ORNATE_CX + ORNATE_GEM_R * Math.cos(rad);
                          const cy = ORNATE_CX + ORNATE_GEM_R * Math.sin(rad);
                          return (
                            <rect
                              key={`gem-${deg}`}
                              x={cx - 3.5} y={cy - 3.5} width={7} height={7}
                              rx={1}
                              transform={`rotate(45 ${cx} ${cy})`}
                              fill={isReady ? hexToRgba(hc, 0.85) : abilityHovered ? "rgba(120,120,120,0.45)" : "rgba(100,100,100,0.3)"}
                              stroke={isReady ? "rgba(250,204,21,0.7)" : abilityHovered ? "rgba(130,130,130,0.3)" : "rgba(110,110,110,0.2)"}
                              strokeWidth={1}
                              filter={isReady || abilityHovered ? "url(#abilityGemGlow)" : undefined}
                            />
                          );
                        })}

                        {/* 4 intercardinal small dot ornaments */}
                        {ORNATE_ANGLES_INTERCARDINAL.map((deg) => {
                          const rad = (deg - 90) * DEG_TO_RAD;
                          return (
                            <circle
                              key={`dot-${deg}`}
                              cx={ORNATE_CX + ORNATE_GEM_R * Math.cos(rad)}
                              cy={ORNATE_CX + ORNATE_GEM_R * Math.sin(rad)}
                              r={1.8}
                              fill={isReady ? "rgba(250,204,21,0.45)" : abilityHovered ? "rgba(130,130,130,0.22)" : "rgba(110,110,110,0.12)"}
                            />
                          );
                        })}

                        {/* Cooldown progress arc on outer ring */}
                        {!isReady && cdFrac > 0 && (
                          <circle
                            cx={ORNATE_CX} cy={ORNATE_CX} r={ORNATE_MID_R}
                            fill="none"
                            stroke="rgba(250,204,21,0.25)"
                            strokeWidth={2}
                            strokeDasharray={ORNATE_RING_CIRCUM}
                            strokeDashoffset={ORNATE_RING_CIRCUM * cdFrac}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${ORNATE_CX} ${ORNATE_CX})`}
                            className="transition-all duration-300"
                          />
                        )}

                        {/* Hover: soft glowing ring */}
                        {abilityHovered && !isReady && (
                          <circle
                            cx={ORNATE_CX} cy={ORNATE_CX} r={ORNATE_MID_R}
                            fill="none"
                            stroke="rgba(140,140,140,0.12)"
                            strokeWidth={1.5}
                            filter="url(#abilityGemGlow)"
                          />
                        )}

                        {/* Ready state: full glowing outer ring */}
                        {isReady && (
                          <circle
                            cx={ORNATE_CX} cy={ORNATE_CX} r={ORNATE_MID_R}
                            fill="none"
                            stroke="rgba(250,204,21,0.3)"
                            strokeWidth={2}
                            strokeLinecap="round"
                            filter="url(#abilityGemGlow)"
                          />
                        )}
                      </svg>

                      {/* ─── Main ability button ─── */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onUseHeroAbility(); }}
                        disabled={!isReady}
                        onMouseEnter={() => !isTouchDevice && setAbilityHovered(true)}
                        onMouseLeave={() => setAbilityHovered(false)}
                        className="absolute inset-0 rounded-full flex items-center justify-center transition-all active:scale-95 hover:brightness-110"
                        style={{
                          background: isReady
                            ? `radial-gradient(ellipse 90% 90% at 38% 32%, rgba(150,115,30,0.6), rgba(100,75,20,0.45) 45%, rgba(55,40,14,0.5) 100%)`
                            : `radial-gradient(ellipse 90% 90% at 38% 32%, rgba(45,38,28,0.95), rgba(30,26,20,0.95) 45%, rgba(22,18,14,0.95) 100%)`,
                          border: `2.5px solid ${isReady ? "rgba(250,204,21,0.65)" : "rgba(80,60,40,0.4)"}`,
                          boxShadow: isReady
                            ? `0 0 24px rgba(250,204,21,0.3), 0 0 48px rgba(250,204,21,0.08), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3)`
                            : "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.2)",
                          cursor: isReady ? "pointer" : "not-allowed",
                        }}
                      >
                        {/* Hero color tint */}
                        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                          background: isReady
                            ? `radial-gradient(ellipse at 50% 30%, ${hexToRgba(hc, 0.3)}, ${hexToRgba(hc, 0.08)} 55%, transparent 80%)`
                            : `radial-gradient(ellipse at 50% 65%, ${hexToRgba(hc, 0.12)}, transparent 70%)`,
                        }} />

                        {/* Vignette — darkened edges for jewel-like depth */}
                        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                          background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.5) 100%)",
                        }} />

                        {/* Specular highlight — top-left gem gleam */}
                        <div className="absolute rounded-full pointer-events-none" style={{
                          top: 4, left: 6, width: '42%', height: '38%',
                          background: isReady
                            ? "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.2), rgba(255,255,255,0.05) 55%, transparent 100%)"
                            : "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.06), transparent 55%)",
                          filter: "blur(1px)",
                        }} />

                        {/* Bevel ring — top bright, bottom dark */}
                        <div className="absolute inset-[3px] rounded-full pointer-events-none" style={{
                          borderTop: `1px solid ${isReady ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)"}`,
                          borderBottom: `1px solid ${isReady ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.12)"}`,
                          borderLeft: "1px solid transparent",
                          borderRight: "1px solid transparent",
                        }} />

                        {/* Engraved inner ring */}
                        <div className="absolute inset-[7px] rounded-full pointer-events-none" style={{
                          border: `1px solid ${isReady ? "rgba(250,204,21,0.12)" : "rgba(80,60,40,0.06)"}`,
                          boxShadow: isReady ? "inset 0 0 6px rgba(250,204,21,0.06)" : "none",
                        }} />

                        {/* Innermost rune-like dashed ring */}
                        <div className="absolute inset-[11px] rounded-full pointer-events-none" style={{
                          border: `1px dashed ${isReady ? "rgba(250,204,21,0.08)" : "rgba(80,60,40,0.04)"}`,
                        }} />

                        {/* Cooldown conic sweep */}
                        {!isReady && cdFrac > 0 && (
                          <div className="absolute inset-[2px] rounded-full pointer-events-none" style={{
                            background: `conic-gradient(from -90deg, transparent 0deg, transparent ${readyAngle}deg, rgba(0,0,0,0.6) ${readyAngle}deg, rgba(0,0,0,0.6) 360deg)`,
                          }} />
                        )}

                        {/* Rotating shimmer (ready only) */}
                        {isReady && (
                          <div className="absolute inset-[2px] rounded-full pointer-events-none" style={{
                            background: "conic-gradient(from 0deg, transparent 0deg, rgba(250,204,21,0.1) 12deg, transparent 24deg, transparent 120deg, rgba(250,204,21,0.07) 132deg, transparent 144deg, transparent 240deg, rgba(250,204,21,0.07) 252deg, transparent 264deg, transparent 360deg)",
                            animation: "abilityShimmer 5s linear infinite",
                          }} />
                        )}

                        {/* Ability icon */}
                        <div className="relative z-10 flex items-center justify-center" style={{
                          filter: isReady ? `drop-shadow(0 0 6px ${hexToRgba(hc, 0.5)})` : "none",
                        }}>
                          {getHeroAbilityIcon(hero.type, 26, isReady ? "" : "opacity-40")}
                        </div>

                        {/* Ready pulse glow */}
                        {isReady && (
                          <div className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                            style={{ boxShadow: `0 0 24px rgba(250,204,21,0.45), 0 0 10px ${hexToRgba(hc, 0.25)}` }} />
                        )}
                      </button>

                      {/* Ability name tag */}
                      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-wider text-center leading-tight max-w-[76px]" style={{
                        background: isReady
                          ? "linear-gradient(180deg, rgba(65,48,16,0.95), rgba(32,24,8,0.95))"
                          : "rgba(20,16,10,0.92)",
                        border: `1px solid ${isReady ? "rgba(250,204,21,0.5)" : "rgba(80,60,40,0.35)"}`,
                        color: isReady ? "#fbbf24" : "rgba(160,140,100,0.6)",
                        boxShadow: isReady ? "0 0 8px rgba(250,204,21,0.15)" : "none",
                      }}>
                        {heroData.ability}
                      </div>
                    </div>
                  </HudTooltip>
                  {/* Cooldown tag */}
                  <div className="flex items-center justify-center gap-1 mt-4 px-2 py-0.5 rounded-full" style={{
                    background: hero.dead
                      ? "rgba(127,29,29,0.35)"
                      : isReady
                        ? "linear-gradient(135deg, rgba(120,90,20,0.45), rgba(80,60,15,0.35))"
                        : "rgba(30,30,30,0.7)",
                    border: `1px solid ${hero.dead ? "rgba(239,68,68,0.3)" : isReady ? "rgba(250,204,21,0.4)" : "rgba(80,60,40,0.25)"}`,
                    boxShadow: isReady ? "0 0 6px rgba(250,204,21,0.08)" : "none",
                  }}>
                    <Clock size={9} className={hero.dead ? "text-red-400" : isReady ? "text-amber-400" : "text-stone-400"} />
                    <span className={`text-[10px] font-bold tabular-nums ${hero.dead ? "text-red-400" : isReady ? "text-amber-300" : "text-stone-300"}`}>
                      {hero.dead
                        ? `${Math.ceil(hero.respawnTimer / 1000)}s`
                        : isReady
                          ? `${cdTotal / 1000}s`
                          : `${Math.ceil(hero.abilityCooldown / 1000)}s`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Spell Section */}
        <div className="flex items-end gap-5 pointer-events-auto">
          {spells.map((spell) => {
            const spellData = SPELL_DATA[spell.type];
            const spellLevel = spellUpgradeLevels[spell.type] ?? 0;
            const theme = spellThemes[spell.type];
            const canCast =
              spell.cooldown <= 0 &&
              pawPoints >= spellData.cost &&
              !(
                (spell.type === "fireball" || spell.type === "lightning" || spell.type === "freeze") &&
                enemies.length === 0
              );
            const isHovered = hoveredSpell === spell.type;
            const isTargeting = targetingSpell === spell.type || (spell.type === "reinforcements" && placingTroop);
            const isAimableSpell = spell.type === "fireball" || spell.type === "lightning";
            const hasUnlockedAim = isAimableSpell && spellLevel >= 2;
            const manualAimOn = hasUnlockedAim && !spellAutoAim[spell.type];
            const aimTooltip = !isAimableSpell
              ? ""
              : !hasUnlockedAim
                ? "Unlock manual targeting by upgrading"
                : manualAimOn
                  ? "Manual targeting ON — click to switch to auto-aim"
                  : "Auto-aim ON — click for manual targeting";
            const spellAccent = theme?.panelBorder || "rgba(140,80,180,0.5)";
            return (
              <div key={spell.type} className="flex flex-col items-center">
                {/* Orb wrapper — badges position relative to this */}
                <div className="relative" ref={getOrbRef(spell.type)}>
                  {/* Auto-aim toggle — on left of border ring */}
                  {isAimableSpell && (
                    <HudTooltip label={aimTooltip} position="top">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (hasUnlockedAim) onToggleSpellAutoAim(spell.type); }}
                        className="absolute z-30 flex items-center justify-center rounded-full transition-all"
                        style={{
                          width: 22, height: 22,
                          top: 1, left: -2,
                          background: manualAimOn ? (theme?.panelBg || "rgba(80,60,20,0.8)") : "rgba(24,22,18,0.9)",
                          border: `2px solid ${manualAimOn ? spellAccent : hasUnlockedAim ? "rgba(180,140,60,0.3)" : "rgba(60,55,45,0.25)"}`,
                          boxShadow: manualAimOn ? `0 0 8px ${spellAccent}` : "none",
                          cursor: hasUnlockedAim ? "pointer" : "not-allowed",
                          opacity: hasUnlockedAim ? 1 : 0.35,
                        }}
                      >
                        <Crosshair size={12} className={manualAimOn ? (theme?.nameColor || "text-amber-200") : "text-stone-500"} />
                      </button>
                    </HudTooltip>
                  )}
                  {/* Level badge — on right of border ring */}
                  {spellLevel > 0 && (
                    <div className="absolute z-30 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-yellow-100 border-2 border-stone-900"
                      style={{ top: 1, right: -2, background: 'linear-gradient(135deg, #d97706, #92400e)', boxShadow: '0 0 6px rgba(217,119,6,0.5)' }}>
                      {spellLevel}
                    </div>
                  )}
                  {/* ─── Ornate SVG frame for spell ─── */}
                  <svg
                    className="absolute pointer-events-none"
                    style={{
                      top: -SPELL_ORNATE_PAD,
                      left: -SPELL_ORNATE_PAD,
                      transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
                      transform: isHovered && (canCast || isTargeting)
                        ? "rotate(45deg) scale(1.08)"
                        : "rotate(0deg) scale(1)",
                      filter: isHovered && (canCast || isTargeting)
                        ? `drop-shadow(0 0 6px ${spellAccent.replace("0.5)", "0.35)")})`
                        : "none",
                    }}
                    width={SPELL_ORNATE_SIZE}
                    height={SPELL_ORNATE_SIZE}
                    overflow="visible"
                  >
                    <defs>
                      <filter id={`spellGlow-${spell.type}`}>
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {spellFrameElements({
                      cx: SPELL_ORNATE_CX,
                      outerR: SPELL_ORNATE_CX - 2,
                      midR: SPELL_ORNATE_MID_R,
                      color: (canCast || isTargeting)
                        ? spellAccent.replace("0.5)", isHovered ? "0.45)" : "0.25)")
                        : "rgba(110,110,110,0.16)",
                      dimColor: (canCast || isTargeting)
                        ? spellAccent.replace("0.5)", isHovered ? "0.25)" : "0.12)")
                        : "rgba(110,110,110,0.08)",
                      prefix: `sp-${spell.type}`,
                      glowFilter: (canCast || isTargeting) ? `url(#spellGlow-${spell.type})` : undefined,
                    })}

                    {/* Cooldown progress arc on outer ring */}
                    {spell.cooldown > 0 && (
                      <circle
                        cx={SPELL_ORNATE_CX} cy={SPELL_ORNATE_CX} r={SPELL_ORNATE_MID_R}
                        fill="none"
                        stroke={spellAccent.replace("0.5)", "0.25)")}
                        strokeWidth={2}
                        strokeDasharray={SPELL_ORNATE_RING_CIRCUM}
                        strokeDashoffset={SPELL_ORNATE_RING_CIRCUM * (spell.cooldown / spell.maxCooldown)}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${SPELL_ORNATE_CX} ${SPELL_ORNATE_CX})`}
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Hover: soft glowing ring */}
                    {isHovered && (canCast || isTargeting) && !isTargeting && (
                      <circle
                        cx={SPELL_ORNATE_CX} cy={SPELL_ORNATE_CX} r={SPELL_ORNATE_MID_R}
                        fill="none"
                        stroke={spellAccent.replace("0.5)", "0.2)")}
                        strokeWidth={1.5}
                        filter={`url(#spellGlow-${spell.type})`}
                      />
                    )}

                    {/* Targeting: full glowing ring */}
                    {isTargeting && (
                      <circle
                        cx={SPELL_ORNATE_CX} cy={SPELL_ORNATE_CX} r={SPELL_ORNATE_MID_R}
                        fill="none"
                        stroke={spellAccent.replace("0.5)", "0.35)")}
                        strokeWidth={2}
                        filter={`url(#spellGlow-${spell.type})`}
                      />
                    )}
                  </svg>

                  {/* Spell orb button */}
                  <button
                    onClick={() => castSpell(spell.type)}
                    disabled={!canCast && !isTargeting}
                    onMouseEnter={() => !isTouchDevice && setHoveredSpell(spell.type)}
                    onMouseLeave={() => !isTouchDevice && setHoveredSpell(null)}
                    className="relative rounded-full overflow-hidden transition-all hover:brightness-115 hover:scale-105 active:scale-95"
                    style={{
                      width: SPELL_ORB_SIZE, height: SPELL_ORB_SIZE,
                      background: (canCast || isTargeting)
                        ? `radial-gradient(ellipse 90% 90% at 34% 32%, ${theme?.panelBg || 'rgba(50,30,60,0.9)'}, ${PANEL.bgDeep})`
                        : `radial-gradient(ellipse 90% 90% at 34% 32%, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                      border: isTargeting
                        ? `3px solid ${spellAccent}`
                        : (canCast ? `3px solid ${spellAccent}` : `3px solid ${NEUTRAL.border}`),
                      boxShadow: isTargeting
                        ? `0 0 24px ${spellAccent}, 0 0 48px ${spellAccent.replace('0.5', '0.1')}, inset 0 1px 0 rgba(255,255,255,0.1)`
                        : canCast
                          ? `0 0 16px ${spellAccent.replace('0.5', '0.2')}, inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)`
                          : 'inset 0 0 8px rgba(0,0,0,0.3)',
                      opacity: (canCast || isTargeting) ? 1 : 0.45,
                      cursor: (canCast || isTargeting) ? "pointer" : "not-allowed",
                    }}
                  >
                    {/* Spell action BG image */}
                    <div
                      className="absolute inset-0 rounded-full bg-cover bg-center opacity-40"
                      style={{
                        backgroundImage: (canCast || isTargeting) ? `url(/images/spells/${spell.type}-action.png)` : undefined,
                      }}
                    />

                    {/* Vignette — dark edges for depth */}
                    <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                      background: (canCast || isTargeting)
                        ? "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 18%, rgba(0,0,0,0.3) 52%, rgba(0,0,0,0.6) 100%)"
                        : undefined,
                    }} />

                    {/* Specular highlight — top-left gleam */}
                    {(canCast || isTargeting) && (
                      <div className="absolute rounded-full pointer-events-none" style={{
                        top: 4, left: 5, width: '40%', height: '35%',
                        background: "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 55%, transparent 100%)",
                        filter: "blur(1px)",
                      }} />
                    )}

                    {/* Bevel ring — top bright, bottom dark */}
                    <div className="absolute inset-[3px] rounded-full pointer-events-none" style={{
                      borderTop: `1px solid ${(canCast || isTargeting) ? 'rgba(255,255,255,0.1)' : 'rgba(80,80,80,0.04)'}`,
                      borderBottom: `1px solid ${(canCast || isTargeting) ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'}`,
                      borderLeft: "1px solid transparent",
                      borderRight: "1px solid transparent",
                    }} />

                    {/* Engraved inner ring */}
                    <div className="absolute inset-[6px] rounded-full pointer-events-none" style={{
                      border: `1px solid ${(canCast || isTargeting) ? 'rgba(255,255,255,0.06)' : 'rgba(80,80,80,0.03)'}`,
                    }} />

                    {/* Spell icon */}
                    <div className="relative z-10 flex items-center justify-center w-full h-full" style={{
                      filter: (canCast || isTargeting) ? `drop-shadow(0 0 4px ${spellAccent.replace('0.5', '0.4')})` : "none",
                    }}>
                      <SpellSprite type={spell.type} size={36} />
                    </div>

                    {/* Cooldown overlay */}
                    {spell.cooldown > 0 && (
                      <div className="absolute inset-0 pointer-events-none rounded-full"
                        style={{
                          background: "rgba(0,0,0,0.7)",
                          clipPath: `inset(${100 - (spell.cooldown / spell.maxCooldown) * 100}% 0 0 0)`,
                        }}
                      />
                    )}

                    {/* Targeting effects */}
                    {isTargeting && (
                      <>
                        <div className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                          style={{ boxShadow: `inset 0 0 25px ${spellAccent}` }}
                        />
                        <div className="absolute inset-[2px] rounded-full pointer-events-none" style={{
                          background: `conic-gradient(from 0deg, transparent 0deg, ${spellAccent.replace("0.5)", "0.08)")} 15deg, transparent 30deg, transparent 180deg, ${spellAccent.replace("0.5)", "0.06)")} 195deg, transparent 210deg, transparent 360deg)`,
                          animation: "abilityShimmer 5s linear infinite",
                        }} />
                      </>
                    )}
                  </button>

                  {/* Spell name tag */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 px-2 py-px rounded-full text-[7px] font-black uppercase tracking-wider whitespace-nowrap" style={{
                    background: (canCast || isTargeting)
                      ? `linear-gradient(180deg, ${theme?.panelBg || 'rgba(50,30,60,0.9)'}, rgba(20,16,10,0.92))`
                      : "rgba(20,16,10,0.92)",
                    border: `1px solid ${(canCast || isTargeting) ? spellAccent.replace("0.5)", "0.5)") : "rgba(80,60,40,0.3)"}`,
                    color: (canCast || isTargeting) ? (theme?.panelBorder?.replace("0.5)", "1)") || "#d4d4d4") : "rgba(160,140,100,0.5)",
                    boxShadow: (canCast || isTargeting) ? `0 0 6px ${spellAccent.replace("0.5)", "0.1)")}` : "none",
                  }}>
                    {spellData.shortName}
                  </div>
                </div>
                {/* Cost / Cooldown tag */}
                <div className="flex items-center justify-center gap-1 mt-3 px-1.5 py-0.5 rounded-full" style={{
                  background: spell.cooldown > 0 ? "rgba(127,29,29,0.3)" : spellData.cost > 0 ? "rgba(100,68,18,0.35)" : "rgba(20,83,45,0.3)",
                  border: `1px solid ${spell.cooldown > 0 ? "rgba(239,68,68,0.3)" : spellData.cost > 0 ? "rgba(180,140,60,0.2)" : "rgba(34,197,94,0.2)"}`,
                }}>
                  {spell.cooldown > 0 ? (
                    <>
                      <Timer size={8} className="text-red-400" />
                      <span className="text-[9px] font-bold text-red-400 tabular-nums">{Math.ceil(spell.cooldown / 1000)}s</span>
                    </>
                  ) : (
                    <>
                      <Coins size={8} className={spellData.cost > 0 ? "text-amber-400/80" : "text-green-400/80"} />
                      <span className={`text-[9px] font-bold ${spellData.cost > 0 ? "text-amber-300" : "text-green-300"}`}>
                        {spellData.cost > 0 ? spellData.cost : "Free"}
                      </span>
                    </>
                  )}
                </div>
                {/* Hover tooltip panel — portal-based */}
                {isHovered && !isTouchDevice && theme && (
                  <SpellInfoPortal anchorRef={{ current: orbRefs.current[spell.type] ?? null }}>
                    <div className="hidden [@media(hover:hover)]:block rounded-2xl overflow-hidden"
                      style={{
                        background: `linear-gradient(180deg, ${PANEL.bgLight}, ${PANEL.bgDark})`,
                        border: `2px solid ${theme.panelBorder}`,
                        boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 20px ${theme.panelBorder.replace('0.5', '0.15')}, inset 0 0 20px ${OVERLAY.white02}`,
                      }}>
                      <div className="absolute inset-[3px] rounded-[13px] pointer-events-none z-10" style={{ border: `1px solid ${OVERLAY.white04}` }} />
                      {/* Header */}
                      <div className="relative px-4 py-2.5" style={{ background: theme.headerBg }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{
                            background: theme.panelBg, border: `1.5px solid ${theme.panelBorder}`,
                          }}>
                            {theme.icon}
                          </div>
                          <span className={`font-black text-sm tracking-wide ${theme.accentColor}`}>{spellData.name}</span>
                          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(120,90,20,0.4)', border: '1px solid rgba(250,204,21,0.25)', color: '#fde68a' }}>
                            LV {spellLevel + 1}/{MAX_SPELL_UPGRADE_LEVEL + 1}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.panelBorder} 30%, ${theme.panelBorder} 70%, transparent)` }} />
                      </div>
                      {/* Body */}
                      <div className="px-4 py-3">
                        {/* Cost & Cooldown */}
                        <div className="flex gap-2 mb-3">
                          <div className="rounded-lg px-3 py-1.5 text-center flex-1"
                            style={{ background: 'rgba(100,68,18,0.25)', border: `1px solid rgba(180,140,60,0.15)` }}>
                            <div className="text-[8px] text-amber-500/70 font-semibold uppercase tracking-wider">Cost</div>
                            <div className="text-amber-200 font-black text-sm mt-0.5">
                              {spellData.cost > 0 ? `${spellData.cost} PP` : "FREE"}
                            </div>
                          </div>
                          <div className="rounded-lg px-3 py-1.5 text-center flex-1"
                            style={{ background: 'rgba(30,58,138,0.15)', border: '1px solid rgba(60,100,180,0.12)' }}>
                            <div className="text-[8px] text-blue-400/70 font-semibold uppercase tracking-wider">Cooldown</div>
                            <div className="text-blue-200 font-black text-sm mt-0.5">{spellData.cooldown / 1000}s</div>
                          </div>
                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {theme.stats.map((stat) => (
                            <div key={stat.label} className="rounded-lg px-2 py-1.5 text-center"
                              style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                              <div className="flex items-center justify-center mb-1">{stat.icon}</div>
                              <div className="text-[8px] text-stone-400 font-medium uppercase">{stat.label}</div>
                              <div className={`font-black text-sm ${stat.color}`}>{stat.value}</div>
                            </div>
                          ))}
                        </div>
                        {/* Divider */}
                        <div className="mb-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.panelBorder.replace('0.5', '0.3')} 50%, transparent)` }} />
                        {/* Effect */}
                        <div className="rounded-lg px-3 py-2.5"
                          style={{ background: theme.effectBg, border: `1px solid ${theme.effectBg.replace('0.15', '0.2')}` }}>
                          <div className={`${theme.effectLabel} uppercase text-[8px] font-bold mb-1.5 tracking-wider flex items-center gap-1`}>
                            <Sparkles size={9} className="opacity-70" />
                            How it works
                          </div>
                          <p className={`text-[11px] ${theme.effectText} leading-relaxed`}>{theme.effect}</p>
                        </div>
                      </div>
                    </div>
                  </SpellInfoPortal>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes heroHeartbeat {
          0%, 100% { transform: scale(1); }
          12% { transform: scale(1.08); }
          24% { transform: scale(1); }
          36% { transform: scale(1.05); }
          48% { transform: scale(1); }
        }
        @keyframes abilityShimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
