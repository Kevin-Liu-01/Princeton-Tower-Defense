"use client";
import React from "react";
import {
  Heart,
  Timer,
  Swords,
  Target,
  Gauge,
  Shield,
  Pointer,
  Grab,
  Wind,
  ShellIcon,
  Coins,
  Clock,
  Flame,
  Zap,
  Snowflake,
  Sparkles,
  Users,
  TrendingUp,
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
import { useIsTouchDevice, useResponsiveSizes } from "./hooks";
import { PANEL, GOLD, NEUTRAL, RED_CARD, SELECTED, OVERLAY, SPELL_THEME } from "./theme";
import { HudTooltip } from "./HudTooltip";
import { MobileHeroSpellBar } from "./MobileHeroSpellBar";

// =============================================================================
// HP THEME — transitions green → yellow → red by hero health %
// =============================================================================

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

interface HeroSpellBarProps {
  hero: Hero | null;
  spells: Spell[];
  pawPoints: number;
  enemies: Enemy[];
  spellUpgradeLevels: SpellUpgradeLevels;
  targetingSpell: SpellType | null;
  placingTroop: boolean;
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
  toggleHeroSelection,
  onUseHeroAbility,
  castSpell,
}) => {
  const [hoveredSpell, setHoveredSpell] = React.useState<SpellType | null>(
    null
  );
  const isTouchDevice = useIsTouchDevice();
  const sizes = useResponsiveSizes();
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
      style={{ zIndex: 100 }}
    >
      {/* Mobile: Compact circle layout */}
      <div className="flex sm:hidden">
        <MobileHeroSpellBar
          hero={hero}
          spells={spells}
          pawPoints={pawPoints}
          enemies={enemies}
          spellUpgradeLevels={spellUpgradeLevels}
          targetingSpell={targetingSpell}
          placingTroop={placingTroop}
          toggleHeroSelection={toggleHeroSelection}
          onUseHeroAbility={onUseHeroAbility}
          castSpell={castSpell}
        />
      </div>

      {/* Desktop: Full card layout */}
      <div className="hidden sm:flex px-3 py-2 items-center justify-between">
      {/* Hero Section */}
      <div
        role="button"
        tabIndex={0}
        className="flex-shrink-0 h-full pointer-events-auto cursor-pointer"
        onClick={toggleHeroSelection}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && hero) {
            e.preventDefault();
            toggleHeroSelection();
          }
        }}
      >
        {hero && (
          <div className="flex items-stretch gap-1.5 sm:gap-3">
            {hero.dead ? (
              <>
                {/* Dead hero card — matches alive card structure */}
                <div className="relative p-1.5 sm:p-2 rounded-xl transition-all overflow-hidden" style={{
                  background: `linear-gradient(135deg, ${NEUTRAL.bgLightAlt}, ${NEUTRAL.bgDarkAlt})`,
                  border: `1.5px solid ${NEUTRAL.borderMid}`,
                  boxShadow: `inset 0 0 12px ${NEUTRAL.glow}`,
                }}>
                  <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${NEUTRAL.innerBorderMid}` }} />
                  <div className="relative z-10 flex items-center gap-1.5 sm:gap-3 mb-1 sm:mb-1.5">
                    <div
                      className="w-8 h-8 sm:w-12 pt-1 sm:h-12 rounded-lg border-2 border-stone-600 bg-stone-800 flex items-center justify-center overflow-hidden opacity-40 grayscale shrink-0"
                    >
                      <HeroSprite type={hero.type} size={sizes.heroIcon} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] sm:text-xs font-bold text-stone-400 uppercase tracking-wide flex items-center gap-1 text-left leading-tight max-w-[60px] sm:max-w-none">
                        {HERO_DATA[hero.type].name}
                      </div>
                      <div className="hidden sm:flex gap-2 mt-0.5 text-[9px] opacity-40">
                        <span className="text-stone-500">
                          <Swords size={12} className="inline" />{" "}
                          {HERO_DATA[hero.type].damage} DMG
                        </span>
                        <span className="text-stone-500">
                          <Target size={12} className="inline" />{" "}
                          {HERO_DATA[hero.type].range} RNG
                        </span>
                        <span className="text-stone-500">
                          <Gauge size={12} className="inline" />{" "}
                          {HERO_DATA[hero.type].speed} SPD
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 w-full">
                    <div className="w-full bg-stone-900 h-2.5 border border-stone-600 rounded-md overflow-hidden shadow-inner">
                      <div className="h-full w-0 rounded-sm bg-stone-700" />
                    </div>
                  </div>
                  <div className="relative z-10 flex justify-between items-center mt-0.5 px-0.5">
                    <span className="text-[8px] sm:text-[9px] font-bold text-stone-500">
                      0/{hero.maxHp}
                    </span>
                    <span className="text-[7px] sm:text-[8px] text-stone-600 font-medium">
                      0%
                    </span>
                  </div>
                </div>
                {/* Respawn timer — matches ability button dimensions */}
                <HudTooltip label={`Hero respawning in ${Math.ceil(hero.respawnTimer / 1000)}s`} position="top">
                  <div className="px-1.5 sm:px-3 py-1 sm:py-2.5 h-full relative font-bold rounded-xl flex flex-col items-center justify-center overflow-hidden max-w-[72px] sm:max-w-none" style={{
                    background: "linear-gradient(135deg, rgba(50,20,20,0.85), rgba(35,12,12,0.7))",
                    border: `1.5px solid ${RED_CARD.border25}`,
                    boxShadow: `inset 0 0 12px ${RED_CARD.glow05}`,
                  }}>
                    {/* Respawn fill bar — fills upward as respawn completes */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-300 ease-linear"
                      style={{
                        background: "linear-gradient(0deg, rgba(239,68,68,0.18), rgba(239,68,68,0.04))",
                        clipPath: `inset(${Math.max(0, (hero.respawnTimer / 5000) * 100)}% 0 0 0)`,
                      }}
                    />
                    <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder10}` }} />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <span className="flex flex-col sm:flex-row gap-0.5 sm:gap-1 items-center text-[9px] sm:text-[12px] text-red-300 font-bold text-center leading-tight">
                        {getHeroAbilityIcon(hero.type, 14, "text-red-400/60 inline mb-0.5")}
                        {HERO_DATA[hero.type].ability}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                        <Timer size={12} className="text-red-400 sm:w-[14px] sm:h-[14px]" />
                        <span className="text-[11px] sm:text-[13px] text-red-400 font-black tabular-nums">
                          {Math.ceil(hero.respawnTimer / 1000)}s
                        </span>
                      </div>
                      <span className="text-[7px] sm:text-[8px] text-stone-500 uppercase tracking-wider mt-0.5">
                        Respawning
                      </span>
                    </div>
                  </div>
                </HudTooltip>
              </>
            ) : (
              <>
                {(() => {
                  const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
                  const hpTheme = getHeroHpTheme(hpPercent);
                  return (
                    <div
                      className="relative p-1.5 sm:p-2 rounded-xl transition-all overflow-hidden"
                      style={{
                        background: hero.selected
                          ? `linear-gradient(135deg, rgba(100,68,18,0.55), rgba(72,48,14,0.4))`
                          : `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: hero.selected
                          ? `1.5px solid ${GOLD.accentBorder50}`
                          : `1.5px solid ${GOLD.border30}`,
                        boxShadow: hero.selected
                          ? `inset 0 0 15px ${GOLD.accentGlow08}, 0 0 12px ${GOLD.accentGlow10}`
                          : `inset 0 0 12px ${GOLD.glow04}`,
                      }}
                    >
                      {/* HP gradient fill bar behind entire hero card */}
                      <div
                        className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
                        style={{
                          background: hpTheme.fillGradient,
                          clipPath: `inset(0 ${100 - hpPercent}% 0 0)`,
                        }}
                      />
                      {/* Inner border */}
                      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{
                        border: hero.selected ? `1px solid ${GOLD.accentBorder12}` : `1px solid ${GOLD.innerBorder10}`,
                      }} />
                      <HudTooltip label={hero.selected ? "Click map to move hero" : "Click to select hero"} position="top">
                        <div className="absolute top-1 right-1 z-20">
                          {hero.selected ? (
                            <Grab size={14} className="text-amber-300/90 rounded p-0.5 bg-amber-500/50 sm:w-[18px] sm:h-[18px]" />
                          ) : (
                            <Pointer size={14} className="text-amber-400/90 rounded p-0.5 bg-amber-500/50 sm:w-[18px] sm:h-[18px]" />
                          )}
                        </div>
                      </HudTooltip>

                      <div className="relative z-10 flex items-center gap-1.5 sm:gap-3 mb-1 sm:mb-1.5">
                        <div
                          className="w-8 h-8 sm:w-12 pt-1 sm:h-12 rounded-lg border-2 flex items-center justify-center overflow-hidden shrink-0"
                          style={{
                            borderColor: HERO_DATA[hero.type].color,
                            backgroundColor: HERO_DATA[hero.type].color + "30",
                            animation: hpTheme.heartbeat ? `heroHeartbeat ${hpTheme.beatSpeed} ease-in-out infinite` : "none",
                          }}
                        >
                          <HeroSprite type={hero.type} size={sizes.heroIcon} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] sm:text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1 text-left leading-tight max-w-[60px] sm:max-w-none">
                            {HERO_DATA[hero.type].name}
                          </div>
                          <div className="hidden sm:flex gap-2 mt-0.5 text-[9px]">
                            <span className="text-orange-400">
                              <Swords size={12} className="inline" />{" "}
                              {HERO_DATA[hero.type].damage} DMG
                            </span>
                            <span className="text-blue-400">
                              <Target size={12} className="inline" />{" "}
                              {HERO_DATA[hero.type].range} RNG
                            </span>
                            <span className="text-green-400">
                              <Gauge size={12} className="inline" />{" "}
                              {HERO_DATA[hero.type].speed} SPD
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="relative z-10 w-full">
                        <div className="w-full bg-stone-900 h-2.5 border border-stone-600 rounded-md overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-sm bg-gradient-to-r ${hpTheme.barColor} shadow-md ${hpTheme.glowColor} transition-all duration-300`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="relative z-10 flex justify-between items-center mt-0.5 px-0.5">
                        <span className={`text-[8px] sm:text-[9px] font-bold ${hpTheme.textColor}`}>
                          {Math.floor(hero.hp)}/{hero.maxHp}
                        </span>
                        <span className="text-[7px] sm:text-[8px] text-amber-500/80 font-medium">
                          {Math.round(hpPercent)}%
                        </span>
                      </div>
                    </div>
                  );
                })()}
                {(() => {
                  const hc = HERO_DATA[hero.type].color;
                  const cdFrac = hero.abilityCooldown / HERO_ABILITY_COOLDOWNS[hero.type];
                  return (
                <HudTooltip
                  label={hero.abilityReady
                    ? `${HERO_DATA[hero.type].ability} — Ready! Click to activate`
                    : `${HERO_DATA[hero.type].ability} — ${Math.ceil(hero.abilityCooldown / 1000)}s cooldown`
                  }
                  position="top"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUseHeroAbility();
                    }}
                    disabled={!hero.abilityReady}
                    className="px-1.5 sm:px-3 py-1 sm:py-2.5 h-full relative transition-all font-bold rounded-xl flex flex-col items-center justify-center overflow-hidden hover:brightness-110 max-w-[72px] sm:max-w-none"
                    style={{
                      background: hero.abilityReady
                        ? `linear-gradient(180deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`
                        : `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                      border: hero.abilityReady
                        ? `1.5px solid ${GOLD.accentBorder50}`
                        : `1.5px solid ${NEUTRAL.border25}`,
                      boxShadow: hero.abilityReady
                        ? `inset 0 0 12px ${GOLD.accentGlow08}, 0 0 8px ${hexToRgba(hc, 0.15)}`
                        : "none",
                      cursor: hero.abilityReady ? "pointer" : "not-allowed",
                    }}
                  >
                    {/* Hero color tint overlay — subtle wash over the amber base */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: hero.abilityReady
                          ? `radial-gradient(ellipse at 50% 30%, ${hexToRgba(hc, 0.18)}, ${hexToRgba(hc, 0.04)} 70%, transparent)`
                          : `radial-gradient(ellipse at 50% 70%, ${hexToRgba(hc, 0.1)}, transparent 70%)`,
                      }}
                    />
                    {/* Cooldown sweep overlay — amber fill rising + dark sweep receding */}
                    {!hero.abilityReady && (
                      <>
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(0deg, ${hexToRgba(hc, 0.2)}, rgba(180,140,50,0.08))`,
                            clipPath: `inset(${cdFrac * 100}% 0 0 0)`,
                          }}
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: "linear-gradient(0deg, rgba(0,0,0,0.65), rgba(0,0,0,0.45))",
                            clipPath: `inset(${(1 - cdFrac) * 100}% 0 0 0)`,
                          }}
                        />
                      </>
                    )}
                    {/* Inner border */}
                    <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{
                      border: hero.abilityReady ? `1px solid ${GOLD.accentBorder12}` : `1px solid ${NEUTRAL.innerBorder}`,
                    }} />
                    {hero.abilityReady ? (
                      <div className="relative z-10 flex flex-col items-center justify-center px-0.5 sm:px-2">
                        <span className="flex flex-col sm:flex-row gap-0.5 sm:gap-1.5 items-center text-[9px] sm:text-[12px] text-amber-200 font-bold text-center leading-tight">
                          {getHeroAbilityIcon(hero.type, 14, "inline mb-0.5")}
                          {HERO_DATA[hero.type].ability}
                        </span>
                        <div className="hidden sm:block text-[7px] max-w-28 my-0.5 text-center text-amber-100/60 leading-snug">
                          {HERO_DATA[hero.type].abilityDesc}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                          <span className="font-extrabold text-[7px] sm:text-[10px] text-amber-300/80 uppercase tracking-wider">
                            Ready
                          </span>
                          <span className="hidden sm:inline w-px h-2.5" style={{ background: "rgba(180,140,50,0.3)" }} />
                          <span className="hidden sm:flex items-center gap-0.5 text-xs text-amber-400/80 tabular-nums">
                            <Clock size={9} className="text-amber-400/70" />
                            {HERO_ABILITY_COOLDOWNS[hero.type] / 1000}s
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center justify-center px-0.5 sm:px-2">
                        <span className="flex flex-col sm:flex-row gap-0.5 sm:gap-1.5 items-center text-[9px] sm:text-[12px] text-stone-400 font-bold text-center leading-tight">
                          {getHeroAbilityIcon(hero.type, 14, "text-stone-500 opacity-60 inline mb-0.5")}
                          {HERO_DATA[hero.type].ability}
                        </span>
                        <div className="hidden sm:block text-[7px] max-w-28 my-0.5 text-center text-stone-500/60 leading-snug">
                          {HERO_DATA[hero.type].abilityDesc}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                          <Timer size={11} className="text-stone-400 sm:w-[14px] sm:h-[14px]" />
                          <span className="text-[10px] sm:text-[13px] text-stone-300 font-black tabular-nums">
                            {Math.ceil(hero.abilityCooldown / 1000)}s
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                </HudTooltip>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>

      {/* Spell Section */}
      <div className="flex ml-1.5 sm:ml-3 items-center self-stretch gap-1 sm:gap-2.5 relative px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl pointer-events-auto" style={{
        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
        border: `1.5px solid ${GOLD.border30}`,
        boxShadow: `inset 0 0 15px ${GOLD.glow04}`,
      }}>
        {/* Inner border */}
        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
        <span className="hidden px-2 sm:flex items-center flex-col text-[9px] text-amber-500/70 font-bold tracking-wider mr-1">
          <ShellIcon size={12} className="inline mb-0.5" />
          SPELLS <Wind size={12} className="inline ml-0.5 rotate-90" />
        </span>
        {spells.map((spell) => {
          const spellData = SPELL_DATA[spell.type];
          const spellLevel = spellUpgradeLevels[spell.type] ?? 0;
          const theme = spellThemes[spell.type];
          const canCast =
            spell.cooldown <= 0 &&
            pawPoints >= spellData.cost &&
            !(
              (spell.type === "fireball" || spell.type === "lightning" || spell.type === "freeze" || spell.type === "payday") &&
              enemies.length === 0
            );
          const isHovered = hoveredSpell === spell.type;
          const isTargeting = targetingSpell === spell.type || (spell.type === "reinforcements" && placingTroop);
          return (
            <div key={spell.type} className="relative self-stretch flex">
              <button
                onClick={() => castSpell(spell.type)}
                disabled={!canCast && !isTargeting}
                onMouseEnter={() => !isTouchDevice && setHoveredSpell(spell.type)}
                onMouseLeave={() => !isTouchDevice && setHoveredSpell(null)}
                className={`relative px-1 sm:px-4 py-1 sm:py-2.5 transition-all rounded-lg sm:rounded-xl overflow-hidden self-stretch hover:brightness-110 ${isTargeting ? "ring-2 ring-offset-1 ring-offset-transparent" : ""}`}
                style={{
                  background: isTargeting
                    ? (theme ? `linear-gradient(180deg, ${theme.panelBg}, ${PANEL.bgDeep})` : "linear-gradient(135deg, rgba(60,30,70,0.8), rgba(40,20,50,0.6))")
                    : canCast
                      ? (theme ? `linear-gradient(180deg, ${theme.panelBg}, ${PANEL.bgDeep})` : "linear-gradient(135deg, rgba(60,30,70,0.8), rgba(40,20,50,0.6))")
                      : `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                  border: isTargeting
                    ? `1.5px solid ${theme?.panelBorder || "rgba(140,80,180,0.8)"}`
                    : canCast
                      ? `1.5px solid ${theme?.panelBorder || "rgba(140,80,180,0.4)"}`
                      : `1.5px solid ${NEUTRAL.border}`,
                  boxShadow: isTargeting
                    ? `inset 0 0 20px ${OVERLAY.white03}, 0 0 15px ${theme?.panelBorder || "rgba(140,80,180,0.4)"}, 0 0 0 1px ${theme?.panelBorder || "rgba(140,80,180,0.6)"}`
                    : canCast
                      ? `inset 0 0 12px ${OVERLAY.white03}`
                      : "none",
                  ...(isTargeting ? { ringColor: theme?.panelBorder } : {}),
                  opacity: (canCast || isTargeting) ? 1 : 0.5,
                  cursor: (canCast || isTargeting) ? "pointer" : "not-allowed",
                }}
              >
                <div
                  className={`absolute top-1 right-1 px-1 py-px rounded text-[8px] font-bold z-20 ${canCast ? "text-yellow-200" : "text-stone-300"}`}
                  style={{
                    background: canCast ? "rgba(120,90,20,0.5)" : "rgba(50,50,50,0.5)",
                    border: "1px solid rgba(250,204,21,0.18)",
                  }}
                >
                  Lv {spellLevel + 1}
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full w-[36px] sm:w-[64px]">
                  <SpellSprite type={spell.type} size={sizes.heroIcon > 36 ? 28 : 20} />
                  <div className={`font-bold uppercase text-[7px] sm:text-[9px] tracking-wide mt-0.5 ${canCast ? (theme?.nameColor || "text-purple-200") : "text-stone-400"}`}>
                    {spellData.shortName}
                  </div>
                  {/* Cost + Cooldown — fixed layout */}
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-0.5 h-[14px] sm:h-[18px]">
                    {spell.cooldown > 0 ? (
                      <span className="text-[8px] sm:text-[10px] font-bold text-red-400 tabular-nums">
                        {Math.ceil(spell.cooldown / 1000)}s
                      </span>
                    ) : (
                      <>
                        <span className="text-[7px] sm:text-[9px] font-semibold flex items-center gap-0.5 px-0.5 sm:px-1 py-px rounded"
                          style={{ background: spellData.cost > 0 ? SELECTED.warmBgLight : 'rgba(20,83,45,0.35)' }}>
                          <Coins size={8} className={`sm:w-[9px] sm:h-[9px] ${spellData.cost > 0 ? "text-amber-400/80" : "text-green-400/80"}`} />
                          <span className={spellData.cost > 0 ? "text-amber-300" : "text-green-300"}>
                            {spellData.cost > 0 ? spellData.cost : "Free"}
                          </span>
                        </span>
                        <span className="hidden sm:flex text-[8px] sm:text-[9px] font-semibold items-center gap-0.5 px-1 py-px rounded"
                          style={{ background: 'rgba(30,58,138,0.3)' }}>
                          <Clock size={9} className="text-blue-400/80" />
                          <span className="text-blue-300">{spellData.cooldown / 1000}s</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* Cooldown overlay with gradient sweep */}
                {spell.cooldown > 0 && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(0deg, rgba(0,0,0,0.75), rgba(0,0,0,0.55))",
                      clipPath: `inset(${100 - (spell.cooldown / spell.maxCooldown) * 100}% 0 0 0)`,
                    }}
                  />
                )}
                {/* Targeting pulse ring */}
                {isTargeting && (
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl pointer-events-none animate-pulse"
                    style={{ boxShadow: `inset 0 0 20px ${theme?.panelBorder || "rgba(140,80,180,0.4)"}` }}
                  />
                )}
              </button>
              {isHovered && !isTouchDevice && theme && (
                <div className="hidden [@media(hover:hover)]:block absolute bottom-full left-[100%] -translate-x-[100%] mb-2 w-64 rounded-xl z-50 pointer-events-none"
                  style={{
                    background: `linear-gradient(180deg, ${theme.panelBg}, ${PANEL.bgDeepSolid})`,
                    border: `1.5px solid ${theme.panelBorder}`,
                    boxShadow: `0 8px 32px ${OVERLAY.black60}, inset 0 0 20px ${OVERLAY.white02}`,
                  }}>
                  {/* Inner glow */}
                  <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${OVERLAY.white04}` }} />
                  {/* Header */}
                  <div className="px-3 py-2 rounded-t-xl relative" style={{ background: theme.headerBg }}>
                    <div className="flex items-center gap-2">
                      {theme.icon}
                      <span className={`font-bold text-sm ${theme.accentColor}`}>{spellData.name}</span>
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-px rounded border border-yellow-500/20 bg-yellow-800/20 text-yellow-200">
                        LV {spellLevel + 1}/{MAX_SPELL_UPGRADE_LEVEL + 1}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${OVERLAY.white10} 50%, transparent)` }} />
                  </div>
                  <div className="px-3 py-2.5">
                    {/* Cost & Cooldown */}
                    <div className="flex gap-1.5 mb-2">
                      <div className="rounded-md px-2 py-1 text-center flex-1"
                        style={{ background: SELECTED.warmBgDark, border: `1px solid ${SELECTED.warmBgDark}` }}>
                        <div className="text-[7px] text-amber-500/70 font-medium uppercase">Cost</div>
                        <div className="text-amber-300 font-bold text-[11px]">
                          {spellData.cost > 0 ? `${spellData.cost} PP` : "FREE"}
                        </div>
                      </div>
                      <div className="rounded-md px-2 py-1 text-center flex-1"
                        style={{ background: 'rgba(30,58,138,0.2)', border: '1px solid rgba(30,58,138,0.2)' }}>
                        <div className="text-[7px] text-blue-500/70 font-medium uppercase">Cooldown</div>
                        <div className="text-blue-300 font-bold text-[11px]">{spellData.cooldown / 1000}s</div>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      {theme.stats.map((stat) => (
                        <div key={stat.label} className="rounded-md px-1.5 py-1 text-center"
                          style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                          <div className="flex items-center justify-center mb-0.5">{stat.icon}</div>
                          <div className="text-[7px] text-stone-500 font-medium">{stat.label}</div>
                          <div className={`font-bold text-[11px] ${stat.color}`}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                    {/* Divider */}
                    <div className="mb-2 h-px" style={{ background: `linear-gradient(90deg, transparent, ${OVERLAY.white06} 50%, transparent)` }} />
                    {/* Effect */}
                    <div className="rounded-md px-2.5 py-2"
                      style={{ background: theme.effectBg, border: '1px solid rgba(80,60,50,0.12)' }}>
                      <div className={`${theme.effectLabel} uppercase text-[7px] font-semibold mb-1 tracking-wider flex items-center gap-1`}>
                        <Sparkles size={8} className="opacity-60" />
                        How it works
                      </div>
                      <p className={`text-[10px] ${theme.effectText} leading-relaxed`}>{theme.effect}</p>
                    </div>
                  </div>
                </div>
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
      `}</style>
    </div>
  );
};
