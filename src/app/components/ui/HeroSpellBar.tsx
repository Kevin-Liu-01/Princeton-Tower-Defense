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
import type { Hero, Spell, SpellType, Enemy } from "../../types";
import { HERO_DATA, SPELL_DATA, HERO_ABILITY_COOLDOWNS } from "../../constants";
import { HeroSprite, SpellSprite, getHeroAbilityIcon } from "../../sprites";
import { useIsTouchDevice, useResponsiveSizes } from "./hooks";
import { PANEL, GOLD, NEUTRAL, RED_CARD, SELECTED, OVERLAY, SPELL_THEME } from "./theme";

// =============================================================================
// HERO AND SPELL BAR COMPONENT - ENHANCED
// =============================================================================

interface HeroSpellBarProps {
  hero: Hero | null;
  spells: Spell[];
  pawPoints: number;
  enemies: Enemy[];
  useHeroAbility: () => void;
  castSpell: (spellType: SpellType) => void;
}

export const HeroSpellBar: React.FC<HeroSpellBarProps> = ({
  hero,
  spells,
  pawPoints,
  enemies,
  useHeroAbility,
  castSpell,
}) => {
  const [hoveredSpell, setHoveredSpell] = React.useState<SpellType | null>(
    null
  );
  const isTouchDevice = useIsTouchDevice();
  const sizes = useResponsiveSizes();

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
        { label: "Damage", value: "50×10", color: "text-red-300", bg: "rgba(127,29,29,0.3)", border: "rgba(127,29,29,0.2)", icon: <Swords size={9} className="text-red-400" /> },
        { label: "Radius", value: "150", color: "text-orange-300", bg: "rgba(124,45,18,0.3)", border: "rgba(124,45,18,0.2)", icon: <Target size={9} className="text-orange-400" /> },
        { label: "Burn", value: "4s", color: "text-amber-300", bg: "rgba(120,53,15,0.3)", border: "rgba(120,53,15,0.2)", icon: <Flame size={9} className="text-amber-400" /> },
      ],
      effectBg: "rgba(124,45,18,0.15)", effectLabel: "text-orange-500/80", effectText: "text-orange-200/90",
      effect: "Rains 10 meteors in an area. Each deals 50 AoE damage with falloff and sets enemies ablaze for 4 seconds.",
    },
    lightning: {
      border: "border-yellow-600", bg: "from-yellow-800/90 to-yellow-950/90", activeBg: "from-yellow-700/90 to-yellow-900/90", glow: "shadow-yellow-500/30",
      nameColor: "text-yellow-200", icon: <Zap size={10} className="text-yellow-400" />, accentColor: "text-yellow-300",
      panelBg: SPELL_THEME.lightning.panelBg, panelBorder: "rgba(234,179,8,0.5)", headerBg: "linear-gradient(90deg, rgba(180,140,20,0.25), transparent)",
      stats: [
        { label: "Total DMG", value: "600", color: "text-yellow-300", bg: "rgba(113,63,18,0.3)", border: "rgba(113,63,18,0.2)", icon: <Swords size={9} className="text-yellow-400" /> },
        { label: "Chains", value: "5", color: "text-cyan-300", bg: "rgba(22,78,99,0.3)", border: "rgba(22,78,99,0.2)", icon: <Zap size={9} className="text-cyan-400" /> },
        { label: "Stun", value: "0.5s", color: "text-blue-300", bg: "rgba(30,58,138,0.3)", border: "rgba(30,58,138,0.2)", icon: <Timer size={9} className="text-blue-400" /> },
      ],
      effectBg: "rgba(113,63,18,0.15)", effectLabel: "text-yellow-500/80", effectText: "text-yellow-200/90",
      effect: "Lightning bolt chains between up to 5 enemies, splitting 600 total damage. Each hit stuns for 0.5 seconds.",
    },
    freeze: {
      border: "border-cyan-600", bg: "from-cyan-800/90 to-cyan-950/90", activeBg: "from-cyan-700/90 to-cyan-900/90", glow: "shadow-cyan-500/30",
      nameColor: "text-cyan-200", icon: <Snowflake size={10} className="text-cyan-400" />, accentColor: "text-cyan-300",
      panelBg: SPELL_THEME.ice.panelBg, panelBorder: "rgba(6,182,212,0.5)", headerBg: "linear-gradient(90deg, rgba(20,100,140,0.25), transparent)",
      stats: [
        { label: "Duration", value: "3s", color: "text-cyan-300", bg: "rgba(22,78,99,0.3)", border: "rgba(22,78,99,0.2)", icon: <Timer size={9} className="text-cyan-400" /> },
        { label: "Range", value: "Global", color: "text-blue-300", bg: "rgba(30,58,138,0.3)", border: "rgba(30,58,138,0.2)", icon: <Target size={9} className="text-blue-400" /> },
        { label: "Slow", value: "100%", color: "text-indigo-300", bg: "rgba(49,46,129,0.3)", border: "rgba(49,46,129,0.2)", icon: <Snowflake size={9} className="text-indigo-400" /> },
      ],
      effectBg: "rgba(22,78,99,0.15)", effectLabel: "text-cyan-500/80", effectText: "text-cyan-200/90",
      effect: "Expanding ice wave freezes ALL enemies on the map for 3 full seconds. Great for emergencies.",
    },
    payday: {
      border: "border-amber-600", bg: "from-amber-800/90 to-amber-950/90", activeBg: "from-amber-700/90 to-amber-900/90", glow: "shadow-amber-500/30",
      nameColor: "text-amber-200", icon: <Coins size={10} className="text-amber-400" />, accentColor: "text-amber-300",
      panelBg: SPELL_THEME.gold.panelBg, panelBorder: "rgba(245,158,11,0.5)", headerBg: "linear-gradient(90deg, rgba(160,110,20,0.25), transparent)",
      stats: [
        { label: "Base PP", value: "80", color: "text-amber-300", bg: "rgba(120,53,15,0.3)", border: "rgba(120,53,15,0.2)", icon: <Coins size={9} className="text-amber-400" /> },
        { label: "Per Enemy", value: "+5", color: "text-green-300", bg: "rgba(20,83,45,0.3)", border: "rgba(20,83,45,0.2)", icon: <TrendingUp size={9} className="text-green-400" /> },
        { label: "Max Total", value: "130", color: "text-yellow-300", bg: "rgba(113,63,18,0.3)", border: "rgba(113,63,18,0.2)", icon: <Sparkles size={9} className="text-yellow-400" /> },
      ],
      effectBg: "rgba(120,53,15,0.15)", effectLabel: "text-amber-500/80", effectText: "text-amber-200/90",
      effect: "Grants 80 PP plus 5 PP per enemy on the map (max +50 bonus). Use when the field is crowded!",
    },
    reinforcements: {
      border: "border-emerald-600", bg: "from-emerald-800/90 to-emerald-950/90", activeBg: "from-emerald-700/90 to-emerald-900/90", glow: "shadow-emerald-500/30",
      nameColor: "text-emerald-200", icon: <Shield size={10} className="text-emerald-400" />, accentColor: "text-emerald-300",
      panelBg: SPELL_THEME.nature.panelBg, panelBorder: "rgba(16,185,129,0.5)", headerBg: "linear-gradient(90deg, rgba(20,120,80,0.25), transparent)",
      stats: [
        { label: "Knights", value: "3", color: "text-emerald-300", bg: "rgba(6,78,59,0.3)", border: "rgba(6,78,59,0.2)", icon: <Users size={9} className="text-emerald-400" /> },
        { label: "HP Each", value: "500", color: "text-red-300", bg: "rgba(127,29,29,0.3)", border: "rgba(127,29,29,0.2)", icon: <Heart size={9} className="text-red-400" /> },
        { label: "DMG Each", value: "30", color: "text-orange-300", bg: "rgba(124,45,18,0.3)", border: "rgba(124,45,18,0.2)", icon: <Swords size={9} className="text-orange-400" /> },
      ],
      effectBg: "rgba(6,78,59,0.15)", effectLabel: "text-emerald-500/80", effectText: "text-emerald-200/90",
      effect: "Summons 3 armored knights at a chosen location. They block and fight enemies until defeated.",
    },
  };

  return (
    <div
      className="px-2 sm:px-3 py-2 flex items-center justify-between relative z-20 pointer-events-none"
      style={{ zIndex: 100 }}
    >
      {/* Hero Section */}
      <div
        role="button"
        tabIndex={0}
        className="flex-shrink-0 h-full pointer-events-auto cursor-pointer"
        onClick={() => {
          if (hero) hero.selected = !hero.selected;
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && hero) {
            e.preventDefault();
            hero.selected = !hero.selected;
          }
        }}
      >
        {hero && (
          <div className="flex items-stretch gap-2 sm:gap-3">
            {hero.dead ? (
              <>
                <div className="relative p-1.5 sm:p-2 rounded-xl transition-all animate-pulse" style={{
                  background: `linear-gradient(135deg, ${NEUTRAL.bgLightAlt}, ${NEUTRAL.bgDarkAlt})`,
                  border: `1.5px solid ${NEUTRAL.borderMid}`,
                  boxShadow: `inset 0 0 12px ${NEUTRAL.glow}`,
                }}>
                  <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${NEUTRAL.innerBorderMid}` }} />
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
                    <div
                      className="w-8 h-8 sm:w-12 pt-1 sm:h-12 rounded-lg border-2 border-stone-600 bg-stone-800 flex items-center justify-center overflow-hidden opacity-50"
                    >
                      <HeroSprite type={hero.type} size={sizes.heroIcon} />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wide flex items-center gap-1 text-left">
                        <Shield size={10} className="sm:w-3 sm:h-3 inline" /> {HERO_DATA[hero.type].name}
                      </div>
                      <div className="text-[8px] text-left text-stone-500">
                        Hero has fallen
                      </div>
                      <div className="hidden sm:flex gap-2 mt-0.5 text-[9px] opacity-50">
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
                  <div className="w-full relative">
                    <div className="w-full bg-stone-900 h-3 sm:h-3.5 border border-stone-600 rounded-md overflow-hidden shadow-inner">
                      <div className="h-full w-0 rounded-sm bg-stone-700" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-0.5 px-0.5">
                    <span className="text-[8px] sm:text-[9px] font-bold text-stone-500">
                      0/{hero.maxHp}
                    </span>
                    <span className="text-[7px] sm:text-[8px] text-stone-600 font-medium">
                      0%
                    </span>
                  </div>
                </div>
                <div className="px-2 sm:px-3 mr-1 sm:mr-auto py-1.5 sm:py-2.5 self-stretch relative font-bold rounded-xl flex flex-col items-center justify-center" style={{
                  background: "linear-gradient(135deg, rgba(40,30,30,0.8), rgba(28,20,20,0.6))",
                  border: `1.5px solid ${RED_CARD.border25}`,
                  boxShadow: `inset 0 0 12px ${RED_CARD.glow05}`,
                }}>
                  <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder10}` }} />
                  <Timer size={18} className="text-red-400 mb-1 sm:w-[22px] sm:h-[22px]" />
                  <span className="text-[10px] sm:text-[12px] text-red-400 font-bold">
                    {Math.ceil(hero.respawnTimer / 1000)}s
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-stone-500 uppercase tracking-wide">
                    Respawning
                  </span>
                </div>
              </>
            ) : (
              <>
                <div
                  className="relative p-1.5 sm:p-2 rounded-xl transition-all"
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
                  {/* Inner border */}
                  <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{
                    border: hero.selected ? `1px solid ${GOLD.accentBorder12}` : `1px solid ${GOLD.innerBorder10}`,
                  }} />
                  {hero.selected ? (
                    <Grab
                      size={14}
                      className="text-amber-400 rounded p-0.5 bg-amber-900 absolute top-1 right-1 sm:top-2 sm:right-2 sm:w-[18px] sm:h-[18px]"
                    />
                  ) : (
                    <Pointer
                      size={14}
                      className="text-amber-600 rounded p-0.5 bg-amber-900 absolute top-1 right-1 sm:top-2 sm:right-2 sm:w-[18px] sm:h-[18px]"
                    />
                  )}

                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
                    <div
                      className="w-8 h-8 sm:w-12 pt-1 sm:h-12 rounded-lg border-2 flex items-center justify-center overflow-hidden"
                      style={{
                        borderColor: HERO_DATA[hero.type].color,
                        backgroundColor: HERO_DATA[hero.type].color + "30",
                      }}
                    >
                      <HeroSprite type={hero.type} size={sizes.heroIcon} />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1 text-left">
                        {HERO_DATA[hero.type].name}{" "}

                      </div>
                      <div className="text-[8px] text-left text-amber-500">
                        {hero.selected
                          ? "Click map to move hero"
                          : "Click hero to select"}
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
                  {(() => {
                    const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
                    const isLow = hpPercent <= 25;
                    const isMedium = hpPercent > 25 && hpPercent <= 50;
                    const barColor = isLow
                      ? "from-red-500 to-red-700"
                      : isMedium
                        ? "from-yellow-400 to-yellow-600"
                        : "from-emerald-400 to-emerald-600";
                    const glowColor = isLow
                      ? "shadow-red-500/50"
                      : isMedium
                        ? "shadow-yellow-500/40"
                        : "shadow-emerald-500/40";
                    const textColor = isLow
                      ? "text-red-400"
                      : isMedium
                        ? "text-yellow-400"
                        : "text-emerald-400";
                    return (
                      <>
                        <div className="w-full relative">
                          <div className="w-full bg-stone-900 h-2.5 border border-stone-600 rounded-md overflow-hidden shadow-inner">
                            <div
                              className={`h-full transition-all duration-300 ease-out rounded-sm bg-gradient-to-r ${barColor} ${isLow ? 'animate-pulse' : ''} shadow-md ${glowColor}`}
                              style={{ width: `${hpPercent}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-0.5 px-0.5">
                          <span className={`text-[8px] sm:text-[9px] font-bold ${textColor}`}>
                            {Math.floor(hero.hp)}/{hero.maxHp}
                          </span>
                          <span className="text-[7px] sm:text-[8px] text-amber-500/80 font-medium">
                            {Math.round(hpPercent)}%
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting hero when clicking ability
                    useHeroAbility();
                  }}
                  disabled={!hero.abilityReady}
                  className="px-2 sm:px-3 mr-1 sm:mr-auto py-1.5 sm:py-2.5 self-stretch relative transition-all font-bold rounded-xl flex flex-col items-center justify-center"
                  style={{
                    background: hero.abilityReady
                      ? `linear-gradient(180deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`
                      : `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                    border: hero.abilityReady
                      ? `1.5px solid ${GOLD.accentBorder50}`
                      : `1.5px solid ${NEUTRAL.border25}`,
                    boxShadow: hero.abilityReady
                      ? `inset 0 0 12px ${GOLD.accentGlow08}`
                      : "none",
                    opacity: hero.abilityReady ? 1 : 0.5,
                    cursor: hero.abilityReady ? "pointer" : "not-allowed",
                  }}
                >
                  {/* Inner border */}
                  <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{
                    border: hero.abilityReady ? `1px solid ${GOLD.accentBorder12}` : `1px solid ${NEUTRAL.innerBorder}`,
                  }} />
                  {hero.abilityReady ? (
                    <div className="flex flex-col py-0.5 sm:py-1 justify-center">
                      <span className="hidden sm:inline text-[7px] bg-amber-800/50 px-1 rounded-lg absolute top-1 right-1 text-amber-400">
                        {HERO_ABILITY_COOLDOWNS[hero.type] / 1000}s Cooldown
                      </span>
                      <span className="flex flex-col mx-auto sm:flex-row gap-0.5 sm:gap-1 items-center text-[10px] sm:text-[12px] text-amber-200 font-bold">
                        {getHeroAbilityIcon(hero.type, 14, "inline mb-0.5")}
                        {HERO_DATA[hero.type].ability}
                      </span>
                      <div className="hidden sm:inline text-[7px] max-w-28 my-0.5">
                        {HERO_DATA[hero.type].abilityDesc}
                      </div>
                      <span className="font-extrabold mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] text-amber-300/80">
                        READY
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col animate-pulse items-center justify-center sm:px-4">
                      <Timer size={14} className="text-stone-400 mb-0.5 sm:w-[18px] sm:h-[18px]" />
                      <span className="text-[9px] sm:text-[11px] text-stone-400">
                        {Math.ceil(hero.abilityCooldown / 1000)}s
                      </span>
                      <span className="text-[7px] sm:text-[8px] text-stone-500">
                        cooldown
                      </span>
                      <div className="flex items-center gap-1 text-[8px] sm:text-[10px] max-w-28 my-0.5 text-center text-stone-400">
                        {getHeroAbilityIcon(hero.type, 12, "text-stone-500 opacity-60")}
                        {HERO_DATA[hero.type].ability}
                      </div>
                    </div>
                  )}
                </button>
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
          const theme = spellThemes[spell.type];
          const canCast =
            spell.cooldown <= 0 &&
            pawPoints >= spellData.cost &&
            !(
              (spell.type === "fireball" || spell.type === "lightning" || spell.type === "freeze" || spell.type === "payday") &&
              enemies.length === 0
            );
          const isHovered = hoveredSpell === spell.type;
          return (
            <div key={spell.type} className="relative self-stretch flex">
              <button
                onClick={() => castSpell(spell.type)}
                disabled={!canCast}
                onMouseEnter={() => !isTouchDevice && setHoveredSpell(spell.type)}
                onMouseLeave={() => !isTouchDevice && setHoveredSpell(null)}
                className="relative px-1 sm:px-4 py-1 sm:py-2.5 transition-all rounded-lg sm:rounded-xl overflow-hidden self-stretch hover:brightness-110"
                style={{
                  background: canCast
                    ? (theme ? `linear-gradient(180deg, ${theme.panelBg}, ${PANEL.bgDeep})` : "linear-gradient(135deg, rgba(60,30,70,0.8), rgba(40,20,50,0.6))")
                    : `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                  border: canCast
                    ? `1.5px solid ${theme?.panelBorder || "rgba(140,80,180,0.4)"}`
                    : `1.5px solid ${NEUTRAL.border}`,
                  boxShadow: canCast
                    ? `inset 0 0 12px ${OVERLAY.white03}`
                    : "none",
                  opacity: canCast ? 1 : 0.5,
                  cursor: canCast ? "pointer" : "not-allowed",
                }}
              >
                <div className="flex flex-col items-center justify-center h-full min-w-[28px] sm:min-w-[48px]">
                  <SpellSprite type={spell.type} size={sizes.heroIcon > 36 ? 28 : 20} />
                  <div className={`font-bold uppercase text-[7px] sm:text-[9px] tracking-wide mt-0.5 ${canCast ? (theme?.nameColor || "text-purple-200") : "text-stone-400"}`}>
                    {spellData.name.split(" ")[0]}
                  </div>
                  {/* Cost + Cooldown */}
                  <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                    {spell.cooldown > 0 ? (
                      <span className="text-[8px] sm:text-[10px] font-bold text-red-400">
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
                {spell.cooldown > 0 && (
                  <div
                    className="absolute inset-0 bg-black/70"
                    style={{
                      clipPath: `inset(${100 - (spell.cooldown / spell.maxCooldown) * 100
                        }% 0 0 0)`,
                    }}
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
  );
};
