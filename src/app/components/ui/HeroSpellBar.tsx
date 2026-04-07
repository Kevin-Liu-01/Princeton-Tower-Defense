"use client";
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
  Eye,
  Users,
  TrendingUp,
  Crosshair,
} from "lucide-react";
import React, { useRef, useCallback } from "react";

import {
  HERO_DATA,
  SPELL_DATA,
  HERO_ABILITY_COOLDOWNS,
  MAX_SPELL_UPGRADE_LEVEL,
  getSpellActionImagePath,
  getFireballSpellStats,
  getLightningSpellStats,
  getFreezeSpellStats,
  getHexWardSpellStats,
  getPaydaySpellStats,
  getReinforcementSpellStats,
} from "../../constants";
import { HeroSprite, SpellSprite, getHeroAbilityIcon } from "../../sprites";
import type {
  Hero,
  Spell,
  SpellType,
  Enemy,
  SpellUpgradeLevels,
} from "../../types";
import {
  DEG_TO_RAD,
  DESKTOP_ABILITY_SIZE,
  DESKTOP_HERO_RING_C,
  DESKTOP_HERO_RING_R,
  DESKTOP_HERO_SIZE,
  HERO_ORNATE_CX,
  HERO_ORNATE_MID_CIRCUM,
  HERO_ORNATE_MID_R,
  HERO_ORNATE_PAD,
  HERO_ORNATE_SIZE,
  ORNATE_ANGLES_ALL,
  ORNATE_ANGLES_CARDINAL,
  ORNATE_ANGLES_INTERCARDINAL,
  ORNATE_CX,
  ORNATE_FRAME_SIZE,
  ORNATE_GEM_R,
  ORNATE_MID_R,
  ORNATE_OUTER_R,
  ORNATE_PAD,
  ORNATE_RING_CIRCUM,
  ORNATE_TICK_INNER,
  ORNATE_TICK_OUTER,
  SPELL_ORB_SIZE,
  SPELL_ORNATE_CX,
  SPELL_ORNATE_MID_R,
  SPELL_ORNATE_PAD,
  SPELL_ORNATE_RING_CIRCUM,
  SPELL_ORNATE_SIZE,
} from "./hud/heroSpellBar/constants";
import {
  getHeroHpTheme,
  getHpRingColor,
  hexToRgba,
} from "./hud/heroSpellBar/helpers";
import { SpellInfoPortal } from "./hud/heroSpellBar/SpellInfoPortal";
import { MobileHeroSpellBar } from "./MobileHeroSpellBar";
import {
  heroFrameElements,
  spellFrameElements,
} from "./primitives/ornateFrameHelpers";
import { useIsTouchDevice } from "./system/hooks";
import { PANEL, NEUTRAL, OVERLAY, SPELL_THEME } from "./system/theme";
import { HudTooltip } from "./tooltips/HudTooltip";

// =============================================================================
// HP THEME — transitions green → yellow → red by hero health %
// =============================================================================

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
  const [hoveredSpell, setHoveredSpell] = React.useState<SpellType | null>(
    null
  );
  const [heroHovered, setHeroHovered] = React.useState(false);
  const [abilityHovered, setAbilityHovered] = React.useState(false);
  const orbRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const getOrbRef = useCallback(
    (type: string) => (el: HTMLDivElement | null) => {
      orbRefs.current[type] = el;
    },
    []
  );
  const isTouchDevice = useIsTouchDevice();
  const fireballStats = getFireballSpellStats(spellUpgradeLevels.fireball);
  const lightningStats = getLightningSpellStats(spellUpgradeLevels.lightning);
  const freezeStats = getFreezeSpellStats(spellUpgradeLevels.freeze);
  const hexWardStats = getHexWardSpellStats(spellUpgradeLevels.hex_ward);
  const paydayStats = getPaydaySpellStats(spellUpgradeLevels.payday);
  const reinforcementStats = getReinforcementSpellStats(
    spellUpgradeLevels.reinforcements
  );

  const spellThemes: Record<
    string,
    {
      border: string;
      bg: string;
      activeBg: string;
      glow: string;
      nameColor: string;
      icon: React.ReactNode;
      accentColor: string;
      panelBg: string;
      panelBorder: string;
      headerBg: string;
      stats: {
        label: string;
        value: string;
        color: string;
        bg: string;
        border: string;
        icon: React.ReactNode;
      }[];
      effectBg: string;
      effectLabel: string;
      effectText: string;
      effect: string;
    }
  > = {
    fireball: {
      accentColor: "text-orange-300",
      activeBg: "from-orange-700/90 to-orange-900/90",
      bg: "from-orange-800/90 to-orange-950/90",
      border: "border-orange-600",
      effect: `Rains ${fireballStats.meteorCount} meteors in an area. Each deals ${fireballStats.damagePerMeteor} AoE damage with falloff and sets enemies ablaze for ${(fireballStats.burnDurationMs / 1000).toFixed(1)} seconds.${spellUpgradeLevels.fireball >= 2 ? " Click to choose target location." : ""}`,
      effectBg: "rgba(124,45,18,0.15)",
      effectLabel: "text-orange-500/80",
      effectText: "text-orange-200/90",
      glow: "shadow-orange-500/30",
      headerBg: "linear-gradient(90deg, rgba(180,80,20,0.25), transparent)",
      icon: <Flame size={10} className="text-orange-400" />,
      nameColor: "text-orange-200",
      panelBg: SPELL_THEME.fire.panelBg,
      panelBorder: "rgba(234,88,12,0.5)",
      stats: [
        {
          bg: "rgba(127,29,29,0.3)",
          border: "rgba(127,29,29,0.2)",
          color: "text-red-300",
          icon: <Swords size={9} className="text-red-400" />,
          label: "Damage",
          value: `${fireballStats.damagePerMeteor}×${fireballStats.meteorCount}`,
        },
        {
          bg: "rgba(124,45,18,0.3)",
          border: "rgba(124,45,18,0.2)",
          color: "text-orange-300",
          icon: <Target size={9} className="text-orange-400" />,
          label: "Radius",
          value: `${fireballStats.impactRadius}`,
        },
        {
          bg: "rgba(120,53,15,0.3)",
          border: "rgba(120,53,15,0.2)",
          color: "text-amber-300",
          icon: <Flame size={9} className="text-amber-400" />,
          label: "Burn",
          value: `${(fireballStats.burnDurationMs / 1000).toFixed(1)}s`,
        },
      ],
    },
    freeze: {
      accentColor: "text-cyan-300",
      activeBg: "from-cyan-700/90 to-cyan-900/90",
      bg: "from-cyan-800/90 to-cyan-950/90",
      border: "border-cyan-600",
      effect: freezeStats.isGlobal
        ? `Expanding ice wave freezes ALL enemies on the map for ${(freezeStats.freezeDurationMs / 1000).toFixed(1)} seconds. Great for emergencies.`
        : `Expanding ice wave freezes up to ${freezeStats.maxTargets} enemies for ${(freezeStats.freezeDurationMs / 1000).toFixed(1)} seconds, prioritizing the most advanced threats.`,
      effectBg: "rgba(22,78,99,0.15)",
      effectLabel: "text-cyan-500/80",
      effectText: "text-cyan-200/90",
      glow: "shadow-cyan-500/30",
      headerBg: "linear-gradient(90deg, rgba(20,100,140,0.25), transparent)",
      icon: <Snowflake size={10} className="text-cyan-400" />,
      nameColor: "text-cyan-200",
      panelBg: SPELL_THEME.ice.panelBg,
      panelBorder: "rgba(6,182,212,0.5)",
      stats: [
        {
          bg: "rgba(22,78,99,0.3)",
          border: "rgba(22,78,99,0.2)",
          color: "text-cyan-300",
          icon: <Timer size={9} className="text-cyan-400" />,
          label: "Duration",
          value: `${(freezeStats.freezeDurationMs / 1000).toFixed(1)}s`,
        },
        {
          bg: "rgba(30,58,138,0.3)",
          border: "rgba(30,58,138,0.2)",
          color: "text-blue-300",
          icon: <Target size={9} className="text-blue-400" />,
          label: "Targets",
          value: freezeStats.isGlobal ? "Global" : `${freezeStats.maxTargets}`,
        },
        {
          bg: "rgba(49,46,129,0.3)",
          border: "rgba(49,46,129,0.2)",
          color: "text-indigo-300",
          icon: <Snowflake size={9} className="text-indigo-400" />,
          label: "Slow",
          value: "100%",
        },
      ],
    },
    hex_ward: {
      accentColor: "text-fuchsia-300",
      activeBg: "from-fuchsia-700/90 to-purple-900/90",
      bg: "from-fuchsia-800/90 to-purple-950/90",
      border: "border-fuchsia-600",
      effect: `Marks ${hexWardStats.maxTargets} dangerous enemies for ${(hexWardStats.durationMs / 1000).toFixed(0)} seconds and can reanimate up to ${hexWardStats.maxReanimations} fallen units as controllable ghosts.${hexWardStats.damageAmp > 0 ? ` Hexed enemies also take +${Math.round(hexWardStats.damageAmp * 100)}% damage.` : ""}${hexWardStats.blocksHealing ? " Hexed enemies also cannot heal." : ""}`,
      effectBg: "rgba(88,28,135,0.15)",
      effectLabel: "text-fuchsia-500/80",
      effectText: "text-fuchsia-200/90",
      glow: "shadow-fuchsia-500/30",
      headerBg: "linear-gradient(90deg, rgba(126,34,206,0.25), transparent)",
      icon: <Eye size={10} className="text-fuchsia-400" />,
      nameColor: "text-fuchsia-200",
      panelBg:
        "linear-gradient(135deg, rgba(88,28,135,0.25), rgba(49,18,73,0.15))",
      panelBorder: "rgba(192,132,252,0.5)",
      stats: [
        {
          bg: "rgba(88,28,135,0.3)",
          border: "rgba(88,28,135,0.2)",
          color: "text-fuchsia-300",
          icon: <Users size={9} className="text-fuchsia-400" />,
          label: "Raises",
          value: `${hexWardStats.maxReanimations}`,
        },
        {
          bg: "rgba(76,29,149,0.3)",
          border: "rgba(76,29,149,0.2)",
          color: "text-purple-300",
          icon: <Eye size={9} className="text-purple-400" />,
          label: "Marked",
          value: `${hexWardStats.maxTargets}`,
        },
        {
          bg: "rgba(91,33,182,0.3)",
          border: "rgba(91,33,182,0.2)",
          color: "text-violet-300",
          icon: <Timer size={9} className="text-violet-400" />,
          label: "Duration",
          value: `${(hexWardStats.durationMs / 1000).toFixed(0)}s`,
        },
      ],
    },
    lightning: {
      accentColor: "text-yellow-300",
      activeBg: "from-yellow-700/90 to-yellow-900/90",
      bg: "from-yellow-800/90 to-yellow-950/90",
      border: "border-yellow-600",
      effect: `Lightning chains between up to ${lightningStats.chainCount} enemies, splitting ${lightningStats.totalDamage} total damage. Each hit stuns for ${(lightningStats.stunDurationMs / 1000).toFixed(2)} seconds.${spellUpgradeLevels.lightning >= 2 ? " Click to choose target location." : ""}`,
      effectBg: "rgba(113,63,18,0.15)",
      effectLabel: "text-yellow-500/80",
      effectText: "text-yellow-200/90",
      glow: "shadow-yellow-500/30",
      headerBg: "linear-gradient(90deg, rgba(180,140,20,0.25), transparent)",
      icon: <Zap size={10} className="text-yellow-400" />,
      nameColor: "text-yellow-200",
      panelBg: SPELL_THEME.lightning.panelBg,
      panelBorder: "rgba(234,179,8,0.5)",
      stats: [
        {
          bg: "rgba(113,63,18,0.3)",
          border: "rgba(113,63,18,0.2)",
          color: "text-yellow-300",
          icon: <Swords size={9} className="text-yellow-400" />,
          label: "Total DMG",
          value: `${lightningStats.totalDamage}`,
        },
        {
          bg: "rgba(22,78,99,0.3)",
          border: "rgba(22,78,99,0.2)",
          color: "text-cyan-300",
          icon: <Zap size={9} className="text-cyan-400" />,
          label: "Chains",
          value: `${lightningStats.chainCount}`,
        },
        {
          bg: "rgba(30,58,138,0.3)",
          border: "rgba(30,58,138,0.2)",
          color: "text-blue-300",
          icon: <Timer size={9} className="text-blue-400" />,
          label: "Stun",
          value: `${(lightningStats.stunDurationMs / 1000).toFixed(2)}s`,
        },
      ],
    },
    payday: {
      accentColor: "text-amber-300",
      activeBg: "from-amber-700/90 to-amber-900/90",
      bg: "from-amber-800/90 to-amber-950/90",
      border: "border-amber-600",
      effect: `Grants ${paydayStats.basePayout} PP plus ${paydayStats.bonusPerEnemy} PP per enemy on the map (max +${paydayStats.maxBonus} bonus). Aura lasts ${(paydayStats.auraDurationMs / 1000).toFixed(0)} seconds.`,
      effectBg: "rgba(120,53,15,0.15)",
      effectLabel: "text-amber-500/80",
      effectText: "text-amber-200/90",
      glow: "shadow-amber-500/30",
      headerBg: "linear-gradient(90deg, rgba(160,110,20,0.25), transparent)",
      icon: <Coins size={10} className="text-amber-400" />,
      nameColor: "text-amber-200",
      panelBg: SPELL_THEME.gold.panelBg,
      panelBorder: "rgba(245,158,11,0.5)",
      stats: [
        {
          bg: "rgba(120,53,15,0.3)",
          border: "rgba(120,53,15,0.2)",
          color: "text-amber-300",
          icon: <Coins size={9} className="text-amber-400" />,
          label: "Base PP",
          value: `${paydayStats.basePayout}`,
        },
        {
          bg: "rgba(20,83,45,0.3)",
          border: "rgba(20,83,45,0.2)",
          color: "text-green-300",
          icon: <TrendingUp size={9} className="text-green-400" />,
          label: "Per Enemy",
          value: `+${paydayStats.bonusPerEnemy}`,
        },
        {
          bg: "rgba(113,63,18,0.3)",
          border: "rgba(113,63,18,0.2)",
          color: "text-yellow-300",
          icon: <Sparkles size={9} className="text-yellow-400" />,
          label: "Max Total",
          value: `${paydayStats.basePayout + paydayStats.maxBonus}`,
        },
      ],
    },
    reinforcements: {
      accentColor: "text-emerald-300",
      activeBg: "from-emerald-700/90 to-emerald-900/90",
      bg: "from-emerald-800/90 to-emerald-950/90",
      border: "border-emerald-600",
      effect: reinforcementStats.rangedUnlocked
        ? `Summons ${reinforcementStats.knightCount} veteran reinforcements with tier-${reinforcementStats.visualTier} armor. They fight in melee and fire ranged volleys.`
        : `Summons ${reinforcementStats.knightCount} armored reinforcements at a chosen location. They block and fight enemies until defeated.`,
      effectBg: "rgba(6,78,59,0.15)",
      effectLabel: "text-emerald-500/80",
      effectText: "text-emerald-200/90",
      glow: "shadow-emerald-500/30",
      headerBg: "linear-gradient(90deg, rgba(20,120,80,0.25), transparent)",
      icon: <Shield size={10} className="text-emerald-400" />,
      nameColor: "text-emerald-200",
      panelBg: SPELL_THEME.nature.panelBg,
      panelBorder: "rgba(16,185,129,0.5)",
      stats: [
        {
          bg: "rgba(6,78,59,0.3)",
          border: "rgba(6,78,59,0.2)",
          color: "text-emerald-300",
          icon: <Users size={9} className="text-emerald-400" />,
          label: "Units",
          value: `${reinforcementStats.knightCount}`,
        },
        {
          bg: "rgba(127,29,29,0.3)",
          border: "rgba(127,29,29,0.2)",
          color: "text-red-300",
          icon: <Heart size={9} className="text-red-400" />,
          label: "HP Each",
          value: `${reinforcementStats.knightHp}`,
        },
        {
          bg: "rgba(124,45,18,0.3)",
          border: "rgba(124,45,18,0.2)",
          color: "text-orange-300",
          icon: <Swords size={9} className="text-orange-400" />,
          label: "DMG Each",
          value: `${reinforcementStats.knightDamage}`,
        },
      ],
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
          {hero &&
            (() => {
              const isAlive = !hero.dead;
              const hc = HERO_DATA[hero.type].color;
              const heroData = HERO_DATA[hero.type];
              const hpPercent = isAlive
                ? Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100))
                : 0;
              const hpRingColor = getHpRingColor(hpPercent, hc);
              const hpTheme = getHeroHpTheme(hpPercent);
              const hpStrokeOffset =
                DESKTOP_HERO_RING_C * (1 - hpPercent / 100);
              const isReady = hero.abilityReady && isAlive;
              const cdTotal = HERO_ABILITY_COOLDOWNS[hero.type];
              const cdFrac = hero.dead
                ? hero.respawnTimer / 5000
                : hero.abilityCooldown / cdTotal;
              const readyAngle = (1 - cdFrac) * 360;

              return (
                <div className="flex items-end sm:ml-2 gap-8">
                  {/* Hero Portrait Circle — Ornate */}
                  <div className="flex flex-col items-center">
                    <HudTooltip
                      label={
                        hero.selected
                          ? "Click map to move hero"
                          : "Click to select hero"
                      }
                      position="top"
                    >
                      <div
                        className="relative"
                        style={{
                          height: DESKTOP_HERO_SIZE,
                          width: DESKTOP_HERO_SIZE,
                        }}
                      >
                        {/* ─── Ornate SVG portrait frame ─── */}
                        <svg
                          className="absolute pointer-events-none"
                          style={{
                            filter:
                              heroHovered && isAlive
                                ? `drop-shadow(0 0 6px ${hexToRgba(hc, 0.4)})`
                                : "none",
                            left: -HERO_ORNATE_PAD,
                            top: -HERO_ORNATE_PAD,
                            transform:
                              heroHovered && isAlive
                                ? "rotate(45deg) scale(1.06)"
                                : "rotate(0deg) scale(1)",
                            transition:
                              "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
                          }}
                          width={HERO_ORNATE_SIZE}
                          height={HERO_ORNATE_SIZE}
                          overflow="visible"
                        >
                          <defs>
                            <filter id="heroGemGlow">
                              <feGaussianBlur
                                stdDeviation="2.5"
                                result="blur"
                              />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          {heroFrameElements({
                            color: isAlive
                              ? hexToRgba(hc, heroHovered ? 0.4 : 0.25)
                              : "rgba(110,110,110,0.18)",
                            cx: HERO_ORNATE_CX,
                            dimColor: isAlive
                              ? hexToRgba(hc, heroHovered ? 0.2 : 0.12)
                              : "rgba(110,110,110,0.09)",
                            glowFilter:
                              isAlive && (hero.selected || heroHovered)
                                ? "url(#heroGemGlow)"
                                : undefined,
                            midR: HERO_ORNATE_MID_R,
                            outerR: HERO_ORNATE_CX - 2,
                            prefix: "hp",
                          })}

                          {/* HP progress arc on outer ring */}
                          {isAlive && (
                            <circle
                              cx={HERO_ORNATE_CX}
                              cy={HERO_ORNATE_CX}
                              r={HERO_ORNATE_MID_R}
                              fill="none"
                              stroke={hpRingColor}
                              strokeWidth={2.5}
                              strokeDasharray={HERO_ORNATE_MID_CIRCUM}
                              strokeDashoffset={
                                HERO_ORNATE_MID_CIRCUM * (1 - hpPercent / 100)
                              }
                              strokeLinecap="round"
                              transform={`rotate(-90 ${HERO_ORNATE_CX} ${HERO_ORNATE_CX})`}
                              className="transition-all duration-300"
                              opacity={0.4}
                            />
                          )}

                          {/* Hover: soft glowing ring */}
                          {heroHovered && isAlive && !hero.selected && (
                            <circle
                              cx={HERO_ORNATE_CX}
                              cy={HERO_ORNATE_CX}
                              r={HERO_ORNATE_MID_R}
                              fill="none"
                              stroke={hexToRgba(hc, 0.2)}
                              strokeWidth={1.5}
                              filter="url(#heroGemGlow)"
                            />
                          )}

                          {/* Selected: full glowing outer ring */}
                          {hero.selected && isAlive && (
                            <circle
                              cx={HERO_ORNATE_CX}
                              cy={HERO_ORNATE_CX}
                              r={HERO_ORNATE_MID_R}
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
                          onMouseEnter={() =>
                            !isTouchDevice && setHeroHovered(true)
                          }
                          onMouseLeave={() => setHeroHovered(false)}
                          className="absolute inset-0 rounded-full flex items-center justify-center transition-all active:scale-95"
                        >
                          {/* SVG HP ring */}
                          <svg
                            className="absolute inset-0"
                            width={DESKTOP_HERO_SIZE}
                            height={DESKTOP_HERO_SIZE}
                            overflow="visible"
                            style={{ transform: "rotate(-90deg)" }}
                          >
                            <circle
                              cx={DESKTOP_HERO_SIZE / 2}
                              cy={DESKTOP_HERO_SIZE / 2}
                              r={DESKTOP_HERO_RING_R}
                              fill="none"
                              stroke="rgba(80,60,40,0.35)"
                              strokeWidth={4}
                            />
                            {isAlive && (
                              <circle
                                cx={DESKTOP_HERO_SIZE / 2}
                                cy={DESKTOP_HERO_SIZE / 2}
                                r={DESKTOP_HERO_RING_R}
                                fill="none"
                                stroke={hpRingColor}
                                strokeWidth={4}
                                strokeDasharray={DESKTOP_HERO_RING_C}
                                strokeDashoffset={hpStrokeOffset}
                                strokeLinecap="round"
                                className="transition-all duration-300"
                                style={{
                                  filter: `drop-shadow(0 0 5px ${hpRingColor})`,
                                }}
                              />
                            )}
                          </svg>

                          {/* Bevel ring — top bright, bottom dark for 3D emboss */}
                          <div
                            className="absolute inset-[2px] rounded-full pointer-events-none"
                            style={{
                              borderBottom: `1px solid ${isAlive ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)"}`,
                              borderLeft: "1px solid transparent",
                              borderRight: "1px solid transparent",
                              borderTop: `1px solid ${isAlive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)"}`,
                            }}
                          />

                          {/* Hero color border ring */}
                          <div
                            className="absolute inset-[4px] rounded-full pointer-events-none transition-all duration-300"
                            style={{
                              border: `2.5px solid ${hero.selected ? hc + "90" : isAlive ? hc + "45" : "rgba(80,60,40,0.3)"}`,
                              boxShadow: hero.selected
                                ? `0 0 20px ${hc}40, inset 0 0 10px ${hc}15`
                                : isAlive
                                  ? `inset 0 0 4px ${hc}10`
                                  : "none",
                            }}
                          />

                          {/* Portrait area */}
                          <div
                            className="absolute inset-[7px] rounded-full overflow-hidden"
                            style={{
                              background: isAlive
                                ? `radial-gradient(circle at 32% 32%, ${hc}35, ${hc}12)`
                                : "linear-gradient(135deg, rgba(50,40,35,0.95), rgba(30,25,20,0.95))",
                              filter: isAlive
                                ? "none"
                                : "grayscale(0.8) brightness(0.5)",
                            }}
                          >
                            <div
                              className="absolute inset-0 rounded-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(/images/heroes/${hero.type}-action.png)`,
                                opacity: isAlive ? 0.6 : 0.2,
                              }}
                            />
                            {/* Enhanced vignette */}
                            <div
                              className="absolute inset-0 rounded-full pointer-events-none"
                              style={{
                                background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 10%, ${hc}22 35%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.7) 100%)`,
                              }}
                            />
                            {/* Specular highlight on portrait */}
                            {isAlive && (
                              <div
                                className="absolute rounded-full pointer-events-none"
                                style={{
                                  background:
                                    "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.12), transparent 55%)",
                                  filter: "blur(2px)",
                                  height: "38%",
                                  left: 5,
                                  top: 3,
                                  width: "44%",
                                }}
                              />
                            )}
                            <div className="relative z-10 flex items-center justify-center h-full">
                              <HeroSprite type={hero.type} size={54} />
                            </div>
                          </div>

                          {/* Engraved inner ring */}
                          <div
                            className="absolute inset-[9px] rounded-full pointer-events-none"
                            style={{
                              border: `1px solid ${isAlive ? hexToRgba(hc, 0.1) : "rgba(80,60,40,0.05)"}`,
                            }}
                          />

                          {/* Selection indicator badge */}
                          <div
                            className="absolute top-0.5 right-0.5 z-20 rounded-full flex items-center justify-center"
                            style={{
                              background: hero.selected
                                ? "linear-gradient(135deg, rgba(130,100,25,0.92), rgba(90,68,15,0.92))"
                                : "rgba(20,16,10,0.88)",
                              border: `2px solid ${hero.selected ? "rgba(250,204,21,0.55)" : "rgba(80,60,40,0.4)"}`,
                              boxShadow: hero.selected
                                ? "0 0 8px rgba(250,204,21,0.2)"
                                : "none",
                              height: 22,
                              width: 22,
                            }}
                          >
                            {hero.selected ? (
                              <Grab size={11} className="text-amber-300" />
                            ) : (
                              <Pointer
                                size={11}
                                className="text-amber-500/70"
                              />
                            )}
                          </div>

                          {/* Selected glow pulse */}
                          {hero.selected && isAlive && (
                            <div
                              className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                              style={{
                                boxShadow: `0 0 26px ${hc}45, 0 0 52px ${hc}15`,
                              }}
                            />
                          )}

                          {/* Low-HP heartbeat */}
                          {isAlive && hpTheme.heartbeat && (
                            <div
                              className="absolute inset-0 rounded-full pointer-events-none"
                              style={{
                                animation: `heroHeartbeat ${hpTheme.beatSpeed} ease-in-out infinite`,
                              }}
                            />
                          )}
                        </button>

                        {/* Name tag */}
                        <div
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider whitespace-nowrap"
                          style={{
                            background: isAlive
                              ? `linear-gradient(180deg, ${hexToRgba(hc, 0.45)}, rgba(20,16,10,0.92))`
                              : "rgba(20,16,10,0.92)",
                            border: `1px solid ${isAlive ? hc + "55" : "rgba(80,60,40,0.35)"}`,
                            boxShadow: isAlive ? `0 0 6px ${hc}15` : "none",
                            color: isAlive
                              ? "#fde68a"
                              : "rgba(160,140,100,0.6)",
                          }}
                        >
                          {heroData.name}
                        </div>
                      </div>
                    </HudTooltip>

                    {isAlive ? (
                      <>
                        <div
                          className="text-[8px] font-bold tabular-nums mt-4"
                          style={{ color: hpRingColor }}
                        >
                          {Math.floor(hero.hp)}/{hero.maxHp}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 mt-4">
                        <Timer size={10} className="text-red-400" />
                        <span className="text-[9px] text-red-400 font-bold tabular-nums">
                          {Math.ceil(hero.respawnTimer / 1000)}s
                        </span>
                        <span className="text-[7px] text-stone-600 uppercase tracking-wider">
                          respawn
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ability Circle — Ornate */}
                  <div className="flex flex-col items-center">
                    <HudTooltip
                      label={
                        isReady
                          ? `${heroData.ability} — Ready! Click to activate`
                          : hero.dead
                            ? `${heroData.ability} — Hero is dead`
                            : `${heroData.ability} — ${Math.ceil(hero.abilityCooldown / 1000)}s cooldown`
                      }
                      position="top"
                    >
                      <div
                        className="relative"
                        style={{
                          height: DESKTOP_ABILITY_SIZE,
                          width: DESKTOP_ABILITY_SIZE,
                        }}
                      >
                        {/* ─── Ornate SVG frame ─── */}
                        <svg
                          className="absolute pointer-events-none"
                          style={{
                            filter:
                              abilityHovered && isReady
                                ? "drop-shadow(0 0 8px rgba(250,204,21,0.4))"
                                : abilityHovered
                                  ? "drop-shadow(0 0 4px rgba(140,140,140,0.2))"
                                  : "none",
                            left: -ORNATE_PAD,
                            top: -ORNATE_PAD,
                            transform: abilityHovered
                              ? "rotate(45deg) scale(1.07)"
                              : "rotate(0deg) scale(1)",
                            transition:
                              "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
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
                            <linearGradient
                              id="ornateTickGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={
                                  isReady
                                    ? "rgba(250,204,21,0.5)"
                                    : abilityHovered
                                      ? "rgba(130,130,130,0.3)"
                                      : "rgba(110,110,110,0.18)"
                                }
                              />
                              <stop
                                offset="100%"
                                stopColor={
                                  isReady
                                    ? "rgba(250,204,21,0.15)"
                                    : abilityHovered
                                      ? "rgba(130,130,130,0.12)"
                                      : "rgba(110,110,110,0.07)"
                                }
                              />
                            </linearGradient>
                          </defs>

                          {/* Outermost decorative dashed ring */}
                          <circle
                            cx={ORNATE_CX}
                            cy={ORNATE_CX}
                            r={ORNATE_OUTER_R}
                            fill="none"
                            stroke={
                              isReady
                                ? "rgba(250,204,21,0.22)"
                                : abilityHovered
                                  ? "rgba(130,130,130,0.18)"
                                  : "rgba(110,110,110,0.14)"
                            }
                            strokeWidth={1}
                            strokeDasharray="2 4 6 4"
                          />

                          {/* Secondary thin solid ring */}
                          <circle
                            cx={ORNATE_CX}
                            cy={ORNATE_CX}
                            r={ORNATE_MID_R}
                            fill="none"
                            stroke={
                              isReady
                                ? "rgba(250,204,21,0.14)"
                                : abilityHovered
                                  ? "rgba(130,130,130,0.1)"
                                  : "rgba(110,110,110,0.07)"
                            }
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
                                x={cx - 3.5}
                                y={cy - 3.5}
                                width={7}
                                height={7}
                                rx={1}
                                transform={`rotate(45 ${cx} ${cy})`}
                                fill={
                                  isReady
                                    ? hexToRgba(hc, 0.85)
                                    : abilityHovered
                                      ? "rgba(120,120,120,0.45)"
                                      : "rgba(100,100,100,0.3)"
                                }
                                stroke={
                                  isReady
                                    ? "rgba(250,204,21,0.7)"
                                    : abilityHovered
                                      ? "rgba(130,130,130,0.3)"
                                      : "rgba(110,110,110,0.2)"
                                }
                                strokeWidth={1}
                                filter={
                                  isReady || abilityHovered
                                    ? "url(#abilityGemGlow)"
                                    : undefined
                                }
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
                                fill={
                                  isReady
                                    ? "rgba(250,204,21,0.45)"
                                    : abilityHovered
                                      ? "rgba(130,130,130,0.22)"
                                      : "rgba(110,110,110,0.12)"
                                }
                              />
                            );
                          })}

                          {/* Cooldown progress arc on outer ring */}
                          {!isReady && cdFrac > 0 && (
                            <circle
                              cx={ORNATE_CX}
                              cy={ORNATE_CX}
                              r={ORNATE_MID_R}
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
                              cx={ORNATE_CX}
                              cy={ORNATE_CX}
                              r={ORNATE_MID_R}
                              fill="none"
                              stroke="rgba(140,140,140,0.12)"
                              strokeWidth={1.5}
                              filter="url(#abilityGemGlow)"
                            />
                          )}

                          {/* Ready state: full glowing outer ring */}
                          {isReady && (
                            <circle
                              cx={ORNATE_CX}
                              cy={ORNATE_CX}
                              r={ORNATE_MID_R}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onUseHeroAbility();
                          }}
                          disabled={!isReady}
                          onMouseEnter={() =>
                            !isTouchDevice && setAbilityHovered(true)
                          }
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
                          <div
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{
                              background: isReady
                                ? `radial-gradient(ellipse at 50% 30%, ${hexToRgba(hc, 0.3)}, ${hexToRgba(hc, 0.08)} 55%, transparent 80%)`
                                : `radial-gradient(ellipse at 50% 65%, ${hexToRgba(hc, 0.12)}, transparent 70%)`,
                            }}
                          />

                          {/* Vignette — darkened edges for jewel-like depth */}
                          <div
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.5) 100%)",
                            }}
                          />

                          {/* Specular highlight — top-left gem gleam */}
                          <div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                              background: isReady
                                ? "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.2), rgba(255,255,255,0.05) 55%, transparent 100%)"
                                : "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.06), transparent 55%)",
                              filter: "blur(1px)",
                              height: "38%",
                              left: 6,
                              top: 4,
                              width: "42%",
                            }}
                          />

                          {/* Bevel ring — top bright, bottom dark */}
                          <div
                            className="absolute inset-[3px] rounded-full pointer-events-none"
                            style={{
                              borderBottom: `1px solid ${isReady ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.12)"}`,
                              borderLeft: "1px solid transparent",
                              borderRight: "1px solid transparent",
                              borderTop: `1px solid ${isReady ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)"}`,
                            }}
                          />

                          {/* Engraved inner ring */}
                          <div
                            className="absolute inset-[7px] rounded-full pointer-events-none"
                            style={{
                              border: `1px solid ${isReady ? "rgba(250,204,21,0.12)" : "rgba(80,60,40,0.06)"}`,
                              boxShadow: isReady
                                ? "inset 0 0 6px rgba(250,204,21,0.06)"
                                : "none",
                            }}
                          />

                          {/* Innermost rune-like dashed ring */}
                          <div
                            className="absolute inset-[11px] rounded-full pointer-events-none"
                            style={{
                              border: `1px dashed ${isReady ? "rgba(250,204,21,0.08)" : "rgba(80,60,40,0.04)"}`,
                            }}
                          />

                          {/* Cooldown conic sweep */}
                          {!isReady && cdFrac > 0 && (
                            <div
                              className="absolute inset-[2px] rounded-full pointer-events-none"
                              style={{
                                background: `conic-gradient(from -90deg, transparent 0deg, transparent ${readyAngle}deg, rgba(0,0,0,0.6) ${readyAngle}deg, rgba(0,0,0,0.6) 360deg)`,
                              }}
                            />
                          )}

                          {/* Rotating shimmer (ready only) */}
                          {isReady && (
                            <div
                              className="absolute inset-[2px] rounded-full pointer-events-none"
                              style={{
                                animation: "abilityShimmer 5s linear infinite",
                                background:
                                  "conic-gradient(from 0deg, transparent 0deg, rgba(250,204,21,0.1) 12deg, transparent 24deg, transparent 120deg, rgba(250,204,21,0.07) 132deg, transparent 144deg, transparent 240deg, rgba(250,204,21,0.07) 252deg, transparent 264deg, transparent 360deg)",
                              }}
                            />
                          )}

                          {/* Ability icon */}
                          <div
                            className="relative z-10 flex items-center justify-center"
                            style={{
                              filter: isReady
                                ? `drop-shadow(0 0 6px ${hexToRgba(hc, 0.5)})`
                                : "none",
                            }}
                          >
                            {getHeroAbilityIcon(
                              hero.type,
                              26,
                              isReady ? "" : "opacity-40"
                            )}
                          </div>

                          {/* Ready pulse glow */}
                          {isReady && (
                            <div
                              className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                              style={{
                                boxShadow: `0 0 24px rgba(250,204,21,0.45), 0 0 10px ${hexToRgba(hc, 0.25)}`,
                              }}
                            />
                          )}
                        </button>

                        {/* Ability name tag */}
                        <div
                          className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-wider text-center leading-tight max-w-[76px]"
                          style={{
                            background: isReady
                              ? "linear-gradient(180deg, rgba(65,48,16,0.95), rgba(32,24,8,0.95))"
                              : "rgba(20,16,10,0.92)",
                            border: `1px solid ${isReady ? "rgba(250,204,21,0.5)" : "rgba(80,60,40,0.35)"}`,
                            boxShadow: isReady
                              ? "0 0 8px rgba(250,204,21,0.15)"
                              : "none",
                            color: isReady
                              ? "#fbbf24"
                              : "rgba(160,140,100,0.6)",
                          }}
                        >
                          {heroData.ability}
                        </div>
                      </div>
                    </HudTooltip>
                    {/* Cooldown tag */}
                    <div
                      className="flex items-center justify-center gap-1 mt-4 px-2 py-0.5 rounded-full"
                      style={{
                        background: hero.dead
                          ? "rgba(127,29,29,0.35)"
                          : isReady
                            ? "linear-gradient(135deg, rgba(120,90,20,0.45), rgba(80,60,15,0.35))"
                            : "rgba(30,30,30,0.7)",
                        border: `1px solid ${hero.dead ? "rgba(239,68,68,0.3)" : isReady ? "rgba(250,204,21,0.4)" : "rgba(80,60,40,0.25)"}`,
                        boxShadow: isReady
                          ? "0 0 6px rgba(250,204,21,0.08)"
                          : "none",
                      }}
                    >
                      <Clock
                        size={9}
                        className={
                          hero.dead
                            ? "text-red-400"
                            : isReady
                              ? "text-amber-400"
                              : "text-stone-400"
                        }
                      />
                      <span
                        className={`text-[10px] font-bold tabular-nums ${hero.dead ? "text-red-400" : isReady ? "text-amber-300" : "text-stone-300"}`}
                      >
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
                (spell.type === "fireball" ||
                  spell.type === "lightning" ||
                  spell.type === "freeze" ||
                  spell.type === "hex_ward") &&
                enemies.length === 0
              );
            const isHovered = hoveredSpell === spell.type;
            const isTargeting =
              targetingSpell === spell.type ||
              (spell.type === "reinforcements" && placingTroop);
            const isAimableSpell =
              spell.type === "fireball" || spell.type === "lightning";
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasUnlockedAim) {
                            onToggleSpellAutoAim(spell.type);
                          }
                        }}
                        className="absolute z-30 flex items-center justify-center rounded-full transition-all"
                        style={{
                          background: manualAimOn
                            ? theme?.panelBg || "rgba(80,60,20,0.8)"
                            : "rgba(24,22,18,0.9)",
                          border: `2px solid ${manualAimOn ? spellAccent : hasUnlockedAim ? "rgba(180,140,60,0.3)" : "rgba(60,55,45,0.25)"}`,
                          boxShadow: manualAimOn
                            ? `0 0 8px ${spellAccent}`
                            : "none",
                          cursor: hasUnlockedAim ? "pointer" : "not-allowed",
                          height: 22,
                          left: -2,
                          opacity: hasUnlockedAim ? 1 : 0.35,
                          top: 1,
                          width: 22,
                        }}
                      >
                        <Crosshair
                          size={12}
                          className={
                            manualAimOn
                              ? theme?.nameColor || "text-amber-200"
                              : "text-stone-500"
                          }
                        />
                      </button>
                    </HudTooltip>
                  )}
                  {/* Level badge — on right of border ring */}
                  <div
                    className="absolute z-30 flex items-center gap-[2px] rounded-full px-[5px] py-[1px] text-[8px] font-bold text-yellow-100 border-2 border-stone-900"
                    style={{
                      background: "linear-gradient(135deg, #d97706, #92400e)",
                      boxShadow: "0 0 6px rgba(217,119,6,0.5)",
                      right: -8,
                      top: -3,
                    }}
                  >
                    <span className="text-[6px] font-semibold text-yellow-300/70 uppercase tracking-wide">
                      Lv
                    </span>
                    {spellLevel + 1}
                  </div>
                  {/* ─── Ornate SVG frame for spell ─── */}
                  <svg
                    className="absolute pointer-events-none"
                    style={{
                      filter:
                        isHovered && (canCast || isTargeting)
                          ? `drop-shadow(0 0 6px ${spellAccent.replace("0.5)", "0.35)")})`
                          : "none",
                      left: -SPELL_ORNATE_PAD,
                      top: -SPELL_ORNATE_PAD,
                      transform:
                        isHovered && (canCast || isTargeting)
                          ? "rotate(45deg) scale(1.08)"
                          : "rotate(0deg) scale(1)",
                      transition:
                        "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
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
                      color:
                        canCast || isTargeting
                          ? spellAccent.replace(
                              "0.5)",
                              isHovered ? "0.45)" : "0.25)"
                            )
                          : "rgba(110,110,110,0.16)",
                      cx: SPELL_ORNATE_CX,
                      dimColor:
                        canCast || isTargeting
                          ? spellAccent.replace(
                              "0.5)",
                              isHovered ? "0.25)" : "0.12)"
                            )
                          : "rgba(110,110,110,0.08)",
                      glowFilter:
                        canCast || isTargeting
                          ? `url(#spellGlow-${spell.type})`
                          : undefined,
                      midR: SPELL_ORNATE_MID_R,
                      outerR: SPELL_ORNATE_CX - 2,
                      prefix: `sp-${spell.type}`,
                    })}

                    {/* Cooldown progress arc on outer ring */}
                    {spell.cooldown > 0 && (
                      <circle
                        cx={SPELL_ORNATE_CX}
                        cy={SPELL_ORNATE_CX}
                        r={SPELL_ORNATE_MID_R}
                        fill="none"
                        stroke={spellAccent.replace("0.5)", "0.25)")}
                        strokeWidth={2}
                        strokeDasharray={SPELL_ORNATE_RING_CIRCUM}
                        strokeDashoffset={
                          SPELL_ORNATE_RING_CIRCUM *
                          (spell.cooldown / spell.maxCooldown)
                        }
                        strokeLinecap="round"
                        transform={`rotate(-90 ${SPELL_ORNATE_CX} ${SPELL_ORNATE_CX})`}
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Hover: soft glowing ring */}
                    {isHovered && (canCast || isTargeting) && !isTargeting && (
                      <circle
                        cx={SPELL_ORNATE_CX}
                        cy={SPELL_ORNATE_CX}
                        r={SPELL_ORNATE_MID_R}
                        fill="none"
                        stroke={spellAccent.replace("0.5)", "0.2)")}
                        strokeWidth={1.5}
                        filter={`url(#spellGlow-${spell.type})`}
                      />
                    )}

                    {/* Targeting: full glowing ring */}
                    {isTargeting && (
                      <circle
                        cx={SPELL_ORNATE_CX}
                        cy={SPELL_ORNATE_CX}
                        r={SPELL_ORNATE_MID_R}
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
                    onMouseEnter={() =>
                      !isTouchDevice && setHoveredSpell(spell.type)
                    }
                    onMouseLeave={() => !isTouchDevice && setHoveredSpell(null)}
                    className="relative rounded-full overflow-hidden transition-all hover:brightness-115 hover:scale-105 active:scale-95"
                    style={{
                      background:
                        canCast || isTargeting
                          ? `radial-gradient(ellipse 90% 90% at 34% 32%, ${theme?.panelBg || "rgba(50,30,60,0.9)"}, ${PANEL.bgDeep})`
                          : `radial-gradient(ellipse 90% 90% at 34% 32%, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                      border: isTargeting
                        ? `3px solid ${spellAccent}`
                        : canCast
                          ? `3px solid ${spellAccent}`
                          : `3px solid ${NEUTRAL.border}`,
                      boxShadow: isTargeting
                        ? `0 0 24px ${spellAccent}, 0 0 48px ${spellAccent.replace("0.5", "0.1")}, inset 0 1px 0 rgba(255,255,255,0.1)`
                        : canCast
                          ? `0 0 16px ${spellAccent.replace("0.5", "0.2")}, inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)`
                          : "inset 0 0 8px rgba(0,0,0,0.3)",
                      cursor:
                        canCast || isTargeting ? "pointer" : "not-allowed",
                      height: SPELL_ORB_SIZE,
                      opacity: canCast || isTargeting ? 1 : 0.45,
                      width: SPELL_ORB_SIZE,
                    }}
                  >
                    {/* Spell action BG image */}
                    <div
                      className="absolute inset-0 rounded-full bg-cover bg-center opacity-40"
                      style={{
                        backgroundImage:
                          canCast || isTargeting
                            ? `url(${getSpellActionImagePath(spell.type)})`
                            : undefined,
                      }}
                    />

                    {/* Vignette — dark edges for depth */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background:
                          canCast || isTargeting
                            ? "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 18%, rgba(0,0,0,0.3) 52%, rgba(0,0,0,0.6) 100%)"
                            : undefined,
                      }}
                    />

                    {/* Specular highlight — top-left gleam */}
                    {(canCast || isTargeting) && (
                      <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 55%, transparent 100%)",
                          filter: "blur(1px)",
                          height: "35%",
                          left: 5,
                          top: 4,
                          width: "40%",
                        }}
                      />
                    )}

                    {/* Bevel ring — top bright, bottom dark */}
                    <div
                      className="absolute inset-[3px] rounded-full pointer-events-none"
                      style={{
                        borderBottom: `1px solid ${canCast || isTargeting ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.08)"}`,
                        borderLeft: "1px solid transparent",
                        borderRight: "1px solid transparent",
                        borderTop: `1px solid ${canCast || isTargeting ? "rgba(255,255,255,0.1)" : "rgba(80,80,80,0.04)"}`,
                      }}
                    />

                    {/* Engraved inner ring */}
                    <div
                      className="absolute inset-[6px] rounded-full pointer-events-none"
                      style={{
                        border: `1px solid ${canCast || isTargeting ? "rgba(255,255,255,0.06)" : "rgba(80,80,80,0.03)"}`,
                      }}
                    />

                    {/* Spell icon */}
                    <div
                      className="relative z-10 flex items-center justify-center w-full h-full"
                      style={{
                        filter:
                          canCast || isTargeting
                            ? `drop-shadow(0 0 4px ${spellAccent.replace("0.5", "0.4")})`
                            : "none",
                      }}
                    >
                      <SpellSprite type={spell.type} size={36} />
                    </div>

                    {/* Cooldown overlay */}
                    {spell.cooldown > 0 && (
                      <div
                        className="absolute inset-0 pointer-events-none rounded-full"
                        style={{
                          background: "rgba(0,0,0,0.7)",
                          clipPath: `inset(${100 - (spell.cooldown / spell.maxCooldown) * 100}% 0 0 0)`,
                        }}
                      />
                    )}

                    {/* Targeting effects */}
                    {isTargeting && (
                      <>
                        <div
                          className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                          style={{ boxShadow: `inset 0 0 25px ${spellAccent}` }}
                        />
                        <div
                          className="absolute inset-[2px] rounded-full pointer-events-none"
                          style={{
                            animation: "abilityShimmer 5s linear infinite",
                            background: `conic-gradient(from 0deg, transparent 0deg, ${spellAccent.replace("0.5)", "0.08)")} 15deg, transparent 30deg, transparent 180deg, ${spellAccent.replace("0.5)", "0.06)")} 195deg, transparent 210deg, transparent 360deg)`,
                          }}
                        />
                      </>
                    )}
                  </button>

                  {/* Spell name tag */}
                  <div
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 px-2 py-px rounded-full text-[7px] font-black uppercase tracking-wider whitespace-nowrap"
                    style={{
                      background:
                        canCast || isTargeting
                          ? `linear-gradient(180deg, ${theme?.panelBg || "rgba(50,30,60,0.9)"}, rgba(20,16,10,0.92))`
                          : "rgba(20,16,10,0.92)",
                      border: `1px solid ${canCast || isTargeting ? spellAccent.replace("0.5)", "0.5)") : "rgba(80,60,40,0.3)"}`,
                      boxShadow:
                        canCast || isTargeting
                          ? `0 0 6px ${spellAccent.replace("0.5)", "0.1)")}`
                          : "none",
                      color:
                        canCast || isTargeting
                          ? theme?.panelBorder?.replace("0.5)", "1)") ||
                            "#d4d4d4"
                          : "rgba(160,140,100,0.5)",
                    }}
                  >
                    {spellData.shortName}
                  </div>
                </div>
                {/* Cost / Cooldown tag */}
                <div
                  className="flex items-center justify-center gap-1 mt-3 px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      spell.cooldown > 0
                        ? "rgba(127,29,29,0.3)"
                        : spellData.cost > 0
                          ? "rgba(100,68,18,0.35)"
                          : "rgba(20,83,45,0.3)",
                    border: `1px solid ${spell.cooldown > 0 ? "rgba(239,68,68,0.3)" : spellData.cost > 0 ? "rgba(180,140,60,0.2)" : "rgba(34,197,94,0.2)"}`,
                  }}
                >
                  {spell.cooldown > 0 ? (
                    <>
                      <Timer size={8} className="text-red-400" />
                      <span className="text-[9px] font-bold text-red-400 tabular-nums">
                        {Math.ceil(spell.cooldown / 1000)}s
                      </span>
                    </>
                  ) : (
                    <>
                      <Coins
                        size={8}
                        className={
                          spellData.cost > 0
                            ? "text-amber-400/80"
                            : "text-green-400/80"
                        }
                      />
                      <span
                        className={`text-[9px] font-bold ${spellData.cost > 0 ? "text-amber-300" : "text-green-300"}`}
                      >
                        {spellData.cost > 0 ? spellData.cost : "Free"}
                      </span>
                    </>
                  )}
                </div>
                {/* Hover tooltip panel — portal-based */}
                {isHovered && !isTouchDevice && theme && (
                  <SpellInfoPortal
                    anchorEl={orbRefs.current[spell.type] ?? null}
                  >
                    <div
                      className="hidden [@media(hover:hover)]:block rounded-2xl overflow-hidden"
                      style={{
                        background: `linear-gradient(180deg, ${PANEL.bgLight}, ${PANEL.bgDark})`,
                        border: `2px solid ${theme.panelBorder}`,
                        boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 20px ${theme.panelBorder.replace("0.5", "0.15")}, inset 0 0 20px ${OVERLAY.white02}`,
                      }}
                    >
                      <div
                        className="absolute inset-[3px] rounded-[13px] pointer-events-none z-10"
                        style={{ border: `1px solid ${OVERLAY.white04}` }}
                      />
                      {/* Header */}
                      <div
                        className="relative px-4 py-2.5"
                        style={{ background: theme.headerBg }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{
                              background: theme.panelBg,
                              border: `1.5px solid ${theme.panelBorder}`,
                            }}
                          >
                            {theme.icon}
                          </div>
                          <span
                            className={`font-black text-sm tracking-wide ${theme.accentColor}`}
                          >
                            {spellData.name}
                          </span>
                          <span
                            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(120,90,20,0.4)",
                              border: "1px solid rgba(250,204,21,0.25)",
                              color: "#fde68a",
                            }}
                          >
                            LV {spellLevel + 1}/{MAX_SPELL_UPGRADE_LEVEL + 1}
                          </span>
                        </div>
                        <div
                          className="absolute bottom-0 left-0 right-0 h-px"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${theme.panelBorder} 30%, ${theme.panelBorder} 70%, transparent)`,
                          }}
                        />
                      </div>
                      {/* Body */}
                      <div className="px-4 py-3">
                        {/* Cost & Cooldown */}
                        <div className="flex gap-2 mb-3">
                          <div
                            className="rounded-lg px-3 py-1.5 text-center flex-1"
                            style={{
                              background: "rgba(100,68,18,0.25)",
                              border: `1px solid rgba(180,140,60,0.15)`,
                            }}
                          >
                            <div className="text-[8px] text-amber-500/70 font-semibold uppercase tracking-wider">
                              Cost
                            </div>
                            <div className="text-amber-200 font-black text-sm mt-0.5">
                              {spellData.cost > 0
                                ? `${spellData.cost} PP`
                                : "FREE"}
                            </div>
                          </div>
                          <div
                            className="rounded-lg px-3 py-1.5 text-center flex-1"
                            style={{
                              background: "rgba(30,58,138,0.15)",
                              border: "1px solid rgba(60,100,180,0.12)",
                            }}
                          >
                            <div className="text-[8px] text-blue-400/70 font-semibold uppercase tracking-wider">
                              Cooldown
                            </div>
                            <div className="text-blue-200 font-black text-sm mt-0.5">
                              {spellData.cooldown / 1000}s
                            </div>
                          </div>
                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {theme.stats.map((stat) => (
                            <div
                              key={stat.label}
                              className="rounded-lg px-2 py-1.5 text-center"
                              style={{
                                background: stat.bg,
                                border: `1px solid ${stat.border}`,
                              }}
                            >
                              <div className="flex items-center justify-center mb-1">
                                {stat.icon}
                              </div>
                              <div className="text-[8px] text-stone-400 font-medium uppercase">
                                {stat.label}
                              </div>
                              <div
                                className={`font-black text-sm ${stat.color}`}
                              >
                                {stat.value}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Divider */}
                        <div
                          className="mb-3 h-px"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${theme.panelBorder.replace("0.5", "0.3")} 50%, transparent)`,
                          }}
                        />
                        {/* Effect */}
                        <div
                          className="rounded-lg px-3 py-2.5"
                          style={{
                            background: theme.effectBg,
                            border: `1px solid ${theme.effectBg.replace("0.15", "0.2")}`,
                          }}
                        >
                          <div
                            className={`${theme.effectLabel} uppercase text-[8px] font-bold mb-1.5 tracking-wider flex items-center gap-1`}
                          >
                            <Sparkles size={9} className="opacity-70" />
                            How it works
                          </div>
                          <p
                            className={`text-[11px] ${theme.effectText} leading-relaxed`}
                          >
                            {theme.effect}
                          </p>
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
          0%,
          100% {
            transform: scale(1);
          }
          12% {
            transform: scale(1.08);
          }
          24% {
            transform: scale(1);
          }
          36% {
            transform: scale(1.05);
          }
          48% {
            transform: scale(1);
          }
        }
        @keyframes abilityShimmer {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
