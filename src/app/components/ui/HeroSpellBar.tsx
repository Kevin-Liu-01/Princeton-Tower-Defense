"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  Timer,
  Swords,
  Target,
  Gauge,
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
      className="fixed z-[9998] pointer-events-none"
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
      style={{ zIndex: 100 }}
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
      <div className="hidden xl:flex px-3 py-2 items-end justify-between gap-3">
        {/* Hero Section */}
        <div
          role="button"
          tabIndex={0}
          className="flex-shrink-0 pointer-events-auto cursor-pointer"
          onClick={toggleHeroSelection}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && hero) {
              e.preventDefault();
              toggleHeroSelection();
            }
          }}
        >
          {hero && (
            <div className="flex items-stretch gap-2">
              {hero.dead ? (
                <>
                  {/* Dead hero card */}
                  <div className="relative rounded-2xl overflow-hidden" style={{
                    background: `linear-gradient(180deg, ${NEUTRAL.bgLightAlt}, ${NEUTRAL.bgDarkAlt})`,
                    border: `2px solid ${NEUTRAL.borderMid}`,
                    boxShadow: `inset 0 0 20px ${NEUTRAL.glow}`,
                    padding: '10px 14px',
                  }}>
                    <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${NEUTRAL.innerBorderMid}` }} />
                    <div className="relative z-10 flex items-center gap-3 mb-2">
                      <div className="w-14 h-14 rounded-full border-3 border-stone-600 bg-stone-800 flex items-center justify-center overflow-hidden opacity-30 grayscale shrink-0">
                        <HeroSprite type={hero.type} size={40} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-stone-400 uppercase tracking-wider leading-tight">
                          {HERO_DATA[hero.type].name}
                        </div>
                        <div className="flex gap-2 mt-1 text-[9px] opacity-40">
                          <span className="text-stone-500 flex items-center gap-0.5"><Swords size={10} /> {HERO_DATA[hero.type].damage}</span>
                          <span className="text-stone-500 flex items-center gap-0.5"><Target size={10} /> {HERO_DATA[hero.type].range}</span>
                          <span className="text-stone-500 flex items-center gap-0.5"><Gauge size={10} /> {HERO_DATA[hero.type].speed}</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(100,100,100,0.2)' }}>
                        <div className="h-full w-0 rounded-full bg-stone-700" />
                      </div>
                      <div className="flex justify-between items-center mt-1 px-0.5">
                        <span className="text-[9px] font-bold text-stone-500 tabular-nums">0/{hero.maxHp}</span>
                        <span className="text-[8px] text-stone-600">0%</span>
                      </div>
                    </div>
                  </div>
                  {/* Respawn timer */}
                  <HudTooltip label={`Hero respawning in ${Math.ceil(hero.respawnTimer / 1000)}s`} position="top">
                    <div className="relative rounded-2xl flex flex-col items-center justify-center overflow-hidden" style={{
                      background: "linear-gradient(180deg, rgba(55,18,18,0.92), rgba(35,10,10,0.9))",
                      border: `2px solid ${RED_CARD.border25}`,
                      boxShadow: `inset 0 0 20px rgba(239,68,68,0.06), 0 0 12px rgba(239,68,68,0.08)`,
                      padding: '12px 20px',
                    }}>
                      <div className="absolute inset-0 pointer-events-none transition-all duration-300 ease-linear"
                        style={{
                          background: "linear-gradient(0deg, rgba(239,68,68,0.18), rgba(239,68,68,0.04))",
                          clipPath: `inset(${Math.max(0, (hero.respawnTimer / 5000) * 100)}% 0 0 0)`,
                        }}
                      />
                      <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder10}` }} />
                      <div className="relative z-10 flex flex-col items-center">
                        <span className="flex items-center gap-1.5 text-[12px] text-red-300 font-bold">
                          {getHeroAbilityIcon(hero.type, 16, "text-red-400/60")}
                          {HERO_DATA[hero.type].ability}
                        </span>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Timer size={14} className="text-red-400" />
                          <span className="text-[14px] text-red-400 font-black tabular-nums">{Math.ceil(hero.respawnTimer / 1000)}s</span>
                        </div>
                        <span className="text-[8px] text-stone-500 uppercase tracking-widest mt-1">Respawning</span>
                      </div>
                    </div>
                  </HudTooltip>
                </>
              ) : (
                <>
                  {(() => {
                    const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
                    const hpTheme = getHeroHpTheme(hpPercent);
                    const hc = HERO_DATA[hero.type].color;
                    return (
                      <div
                        className="relative rounded-2xl overflow-hidden transition-all"
                        style={{
                          background: hero.selected
                            ? `linear-gradient(180deg, rgba(100,68,18,0.55), rgba(60,40,12,0.5))`
                            : `linear-gradient(180deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: hero.selected
                            ? `2px solid ${GOLD.accentBorder50}`
                            : `2px solid ${GOLD.border30}`,
                          boxShadow: hero.selected
                            ? `inset 0 0 20px ${GOLD.accentGlow08}, 0 0 16px ${GOLD.accentGlow10}`
                            : `inset 0 0 15px ${GOLD.glow04}, 0 0 12px rgba(0,0,0,0.3)`,
                          padding: '10px 14px',
                        }}
                      >
                        <div className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
                          style={{ background: hpTheme.fillGradient, clipPath: `inset(0 ${100 - hpPercent}% 0 0)` }}
                        />
                        <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{
                          border: hero.selected ? `1px solid ${GOLD.accentBorder12}` : `1px solid ${GOLD.innerBorder10}`,
                        }} />
                        <HudTooltip label={hero.selected ? "Click map to move hero" : "Click to select hero"} position="top">
                          <div className="absolute top-0 -right-1 z-20">
                            {hero.selected ? (
                              <Grab size={16} className="text-amber-300 rounded-md p-0.5" style={{ background: 'rgba(180,140,60,0.3)' }} />
                            ) : (
                              <Pointer size={16} className="text-amber-400 rounded-md p-0.5" style={{ background: 'rgba(180,140,60,0.2)' }} />
                            )}
                          </div>
                        </HudTooltip>

                        <div className="relative z-10 flex items-center gap-3 mb-2">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0 pt-0.5"
                            style={{
                              border: `3px solid ${hc}`,
                              background: `radial-gradient(circle at 35% 35%, ${hc}35, ${hc}10)`,
                              boxShadow: `0 0 16px ${hc}25, inset 0 0 10px ${hc}15`,
                              animation: hpTheme.heartbeat ? `heroHeartbeat ${hpTheme.beatSpeed} ease-in-out infinite` : "none",
                            }}
                          >
                            <HeroSprite type={hero.type} size={40} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-amber-200 uppercase tracking-wider leading-tight">
                              {HERO_DATA[hero.type].name}
                            </div>
                            <div className="flex gap-1.5 mt-1">
                              {[
                                { icon: <Swords size={10} />, val: HERO_DATA[hero.type].damage, color: 'text-orange-300', bg: 'rgba(180,80,20,0.2)', border: 'rgba(180,80,20,0.15)' },
                                { icon: <Target size={10} />, val: HERO_DATA[hero.type].range, color: 'text-blue-300', bg: 'rgba(40,80,160,0.2)', border: 'rgba(40,80,160,0.15)' },
                                { icon: <Gauge size={10} />, val: HERO_DATA[hero.type].speed, color: 'text-green-300', bg: 'rgba(20,120,60,0.2)', border: 'rgba(20,120,60,0.15)' },
                              ].map((s, i) => (
                                <span key={i} className={`${s.color} text-[9px] font-semibold flex items-center gap-0.5 px-1.5 py-px rounded-md`}
                                  style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                                  {s.icon} {s.val}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="relative z-10">
                          <div className="w-full h-3 rounded-full overflow-hidden" style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: `1px solid rgba(180,140,60,0.12)`,
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
                          }}>
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${hpTheme.barColor} transition-all duration-300`}
                              style={{
                                width: `${hpPercent}%`,
                                boxShadow: `0 0 8px ${hpTheme.glowColor.replace('shadow-', '').replace('/50', '').replace('/40', '')}40`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-1 px-0.5">
                            <span className={`text-[9px] font-bold tabular-nums ${hpTheme.textColor}`}>
                              {Math.floor(hero.hp)}/{hero.maxHp}
                            </span>
                            <span className="text-[8px] text-amber-500/70 font-medium tabular-nums">{Math.round(hpPercent)}%</span>
                          </div>
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
                          onClick={(e) => { e.stopPropagation(); onUseHeroAbility(); }}
                          disabled={!hero.abilityReady}
                          className="relative transition-all font-bold rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:brightness-110"
                          style={{
                            background: hero.abilityReady
                              ? `linear-gradient(180deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`
                              : `linear-gradient(180deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                            border: hero.abilityReady
                              ? `2px solid ${GOLD.accentBorder50}`
                              : `2px solid ${NEUTRAL.border25}`,
                            boxShadow: hero.abilityReady
                              ? `inset 0 0 16px ${GOLD.accentGlow08}, 0 0 12px ${hexToRgba(hc, 0.2)}`
                              : "inset 0 0 10px rgba(0,0,0,0.2)",
                            cursor: hero.abilityReady ? "pointer" : "not-allowed",
                            padding: '12px 20px',
                          }}
                        >
                          <div className="absolute inset-0 pointer-events-none"
                            style={{
                              background: hero.abilityReady
                                ? `radial-gradient(ellipse at 50% 30%, ${hexToRgba(hc, 0.2)}, ${hexToRgba(hc, 0.04)} 70%, transparent)`
                                : `radial-gradient(ellipse at 50% 70%, ${hexToRgba(hc, 0.08)}, transparent 70%)`,
                            }}
                          />
                          {!hero.abilityReady && (
                            <>
                              <div className="absolute inset-0 pointer-events-none"
                                style={{ background: `linear-gradient(0deg, ${hexToRgba(hc, 0.2)}, rgba(180,140,50,0.08))`, clipPath: `inset(${cdFrac * 100}% 0 0 0)` }}
                              />
                              <div className="absolute inset-0 pointer-events-none"
                                style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.65), rgba(0,0,0,0.45))", clipPath: `inset(${(1 - cdFrac) * 100}% 0 0 0)` }}
                              />
                            </>
                          )}
                          <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{
                            border: hero.abilityReady ? `1px solid ${GOLD.accentBorder12}` : `1px solid ${NEUTRAL.innerBorder}`,
                          }} />
                          {hero.abilityReady ? (
                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <span className="flex items-center gap-1.5 text-[12px] text-amber-200 font-bold leading-tight">
                                {getHeroAbilityIcon(hero.type, 16, "inline")}
                                {HERO_DATA[hero.type].ability}
                              </span>
                              <div className="text-[9px] max-w-28 my-2 text-center text-amber-100/50 leading-snug">
                                {HERO_DATA[hero.type].abilityDesc}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-[10px] text-amber-300/90 uppercase tracking-wider">Ready</span>
                                <span className="w-px h-3" style={{ background: "rgba(180,140,50,0.3)" }} />
                                <span className="flex items-center gap-0.5 text-xs text-amber-400/80 tabular-nums">
                                  <Clock size={9} className="text-amber-400/70" />
                                  {HERO_ABILITY_COOLDOWNS[hero.type] / 1000}s
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <span className="flex items-center gap-1.5 text-[12px] text-stone-400 font-bold leading-tight">
                                {getHeroAbilityIcon(hero.type, 16, "text-stone-500 opacity-60 inline")}
                                {HERO_DATA[hero.type].ability}
                              </span>
                              <div className="text-[9px] max-w-28 my-2 text-center text-stone-500/50 leading-snug">
                                {HERO_DATA[hero.type].abilityDesc}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Timer size={14} className="text-stone-400" />
                                <span className="text-[14px] text-stone-300 font-black tabular-nums">{Math.ceil(hero.abilityCooldown / 1000)}s</span>
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
        <div className="flex items-end gap-3 pointer-events-auto">
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
            const isAimableSpell = spell.type === "fireball" || spell.type === "lightning";
            const hasUnlockedAim = isAimableSpell && spellLevel >= 2;
            const autoAimOn = isAimableSpell && !!spellAutoAim[spell.type];
            const autoAimTooltip = !isAimableSpell
              ? "You can only auto aim meteor or lightning"
              : !hasUnlockedAim
                ? "Unlock auto aiming spells by upgrading"
                : autoAimOn
                  ? "Auto-aim ON. click to switch to manual targeting"
                  : "Auto-aim OFF. click to enable auto targeting";
            const spellAccent = theme?.panelBorder || "rgba(140,80,180,0.5)";
            const ORBS = 72;
            return (
              <div key={spell.type} className="flex flex-col items-center">
                {/* Orb wrapper — badges position relative to this */}
                <div className="relative" ref={getOrbRef(spell.type)}>
                  {/* Auto-aim toggle — on left of border ring */}
                  {isAimableSpell && (
                    <HudTooltip label={autoAimTooltip} position="top">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (hasUnlockedAim) onToggleSpellAutoAim(spell.type); }}
                        className="absolute z-30 flex items-center justify-center rounded-full transition-all"
                        style={{
                          width: 22, height: 22,
                          top: 1, left: -2,
                          background: hasUnlockedAim && autoAimOn ? (theme?.panelBg || "rgba(80,60,20,0.8)") : "rgba(24,22,18,0.9)",
                          border: `2px solid ${hasUnlockedAim && autoAimOn ? spellAccent : hasUnlockedAim ? "rgba(180,140,60,0.3)" : "rgba(60,55,45,0.25)"}`,
                          boxShadow: hasUnlockedAim && autoAimOn ? `0 0 8px ${spellAccent}` : "none",
                          cursor: hasUnlockedAim ? "pointer" : "not-allowed",
                          opacity: hasUnlockedAim ? 1 : 0.35,
                        }}
                      >
                        <Crosshair size={12} className={hasUnlockedAim && autoAimOn ? (theme?.nameColor || "text-amber-200") : "text-stone-500"} />
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
                  {/* Spell orb button */}
                  <button
                    onClick={() => castSpell(spell.type)}
                    disabled={!canCast && !isTargeting}
                    onMouseEnter={() => !isTouchDevice && setHoveredSpell(spell.type)}
                    onMouseLeave={() => !isTouchDevice && setHoveredSpell(null)}
                    className="relative rounded-full overflow-hidden transition-all hover:brightness-115 hover:scale-105 active:scale-95"
                    style={{
                      width: ORBS, height: ORBS,
                      background: (canCast || isTargeting)
                        ? `radial-gradient(circle at 35% 35%, ${theme?.panelBg || 'rgba(50,30,60,0.9)'}, ${PANEL.bgDeep})`
                        : `radial-gradient(circle at 35% 35%, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                      border: isTargeting
                        ? `3px solid ${spellAccent}`
                        : (canCast ? `3px solid ${spellAccent}` : `3px solid ${NEUTRAL.border}`),
                      boxShadow: isTargeting
                        ? `0 0 20px ${spellAccent}, inset 0 0 15px rgba(255,255,255,0.04)`
                        : canCast
                          ? `0 0 12px ${spellAccent.replace('0.5', '0.2')}, inset 0 0 12px rgba(255,255,255,0.03)`
                          : 'inset 0 0 8px rgba(0,0,0,0.3)',
                      opacity: (canCast || isTargeting) ? 1 : 0.45,
                      cursor: (canCast || isTargeting) ? "pointer" : "not-allowed",
                    }}
                  >
                    <div className="absolute inset-[3px] rounded-full pointer-events-none" style={{
                      border: `1px solid ${(canCast || isTargeting) ? 'rgba(255,255,255,0.08)' : 'rgba(80,80,80,0.1)'}`,
                    }} />
                    <div className="relative z-10 flex items-center justify-center w-full h-full">
                      <SpellSprite type={spell.type} size={36} />
                    </div>
                    {spell.cooldown > 0 && (
                      <div className="absolute inset-0 pointer-events-none rounded-full"
                        style={{
                          background: "rgba(0,0,0,0.7)",
                          clipPath: `inset(${100 - (spell.cooldown / spell.maxCooldown) * 100}% 0 0 0)`,
                        }}
                      />
                    )}
                    {isTargeting && (
                      <div className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                        style={{ boxShadow: `inset 0 0 25px ${spellAccent}` }}
                      />
                    )}
                  </button>
                </div>
                {/* Spell name */}
                <div className={`mt-1.5 text-[9px] font-bold uppercase tracking-wider ${(canCast || isTargeting) ? (theme?.nameColor || "text-purple-200") : "text-stone-500"}`}>
                  {spellData.shortName}
                </div>
                {/* Cost / Cooldown row */}
                <div className="flex items-center justify-center gap-1 mt-0.5 h-[16px]">
                  {spell.cooldown > 0 ? (
                    <span className="text-[10px] font-bold text-red-400 tabular-nums">{Math.ceil(spell.cooldown / 1000)}s</span>
                  ) : (
                    <>
                      <span className="text-[9px] font-semibold flex items-center gap-0.5 px-1.5 py-px rounded-md"
                        style={{ background: spellData.cost > 0 ? 'rgba(100,68,18,0.4)' : 'rgba(20,83,45,0.35)', border: '1px solid rgba(180,140,60,0.1)' }}>
                        <Coins size={8} className={spellData.cost > 0 ? "text-amber-400/80" : "text-green-400/80"} />
                        <span className={spellData.cost > 0 ? "text-amber-300" : "text-green-300"}>
                          {spellData.cost > 0 ? spellData.cost : "Free"}
                        </span>
                      </span>
                      <span className="text-[9px] font-semibold flex items-center gap-0.5 px-1.5 py-px rounded-md"
                        style={{ background: 'rgba(30,58,138,0.25)', border: '1px solid rgba(60,100,180,0.1)' }}>
                        <Clock size={8} className="text-blue-400/80" />
                        <span className="text-blue-300">{spellData.cooldown / 1000}s</span>
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
      `}</style>
    </div>
  );
};
