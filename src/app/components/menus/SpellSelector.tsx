"use client";
import React from "react";
import {
  Sparkles,
  Zap,
  Clock,
  Coins,
  Flame,
  Snowflake,
  Timer,
  Target,
  Swords,
  Heart,
  Users,
  Shield,
  TrendingUp,
  Star,
  Info,
} from "lucide-react";
import type { SpellType, SpellUpgradeLevels } from "../../types";
import {
  SPELL_DATA,
  MAX_SPELL_UPGRADE_LEVEL,
  getFireballSpellStats,
  getLightningSpellStats,
  getFreezeSpellStats,
  getPaydaySpellStats,
  getReinforcementSpellStats,
} from "../../constants";
import { SpellSprite } from "../../sprites";
import { SpellOrbIcon, EnchantedAnvilIcon } from "../../sprites/custom-icons";
import { SpellUpgradeModal } from "../ui/SpellUpgradeModal";

const spellOptions: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "payday",
  "reinforcements",
];

interface SpellSelectorProps {
  selectedSpells: SpellType[];
  toggleSpell: (spell: SpellType) => void;
  hoveredSpell: SpellType | null;
  setHoveredSpell: (spell: SpellType | null) => void;
  availableSpellStars: number;
  totalSpellStarsEarned: number;
  spentSpellStars: number;
  spellUpgradeLevels: SpellUpgradeLevels;
  upgradeSpell: (spellType: SpellType) => void;
  onOpenCodex?: () => void;
  compact?: boolean;
}

export const SpellSelector: React.FC<SpellSelectorProps> = ({
  selectedSpells,
  toggleSpell,
  hoveredSpell,
  setHoveredSpell,
  availableSpellStars,
  totalSpellStarsEarned,
  spentSpellStars,
  spellUpgradeLevels,
  upgradeSpell,
  onOpenCodex,
  compact = false,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const fireballStats = getFireballSpellStats(spellUpgradeLevels.fireball);
  const lightningStats = getLightningSpellStats(spellUpgradeLevels.lightning);
  const freezeStats = getFreezeSpellStats(spellUpgradeLevels.freeze);
  const paydayStats = getPaydaySpellStats(spellUpgradeLevels.payday);
  const reinforcementStats = getReinforcementSpellStats(
    spellUpgradeLevels.reinforcements
  );

  const spellBorderColors: Record<SpellType, string> = {
    fireball: "rgba(234,88,12,0.5)",
    lightning: "rgba(234,179,8,0.5)",
    freeze: "rgba(6,182,212,0.5)",
    payday: "rgba(245,158,11,0.5)",
    reinforcements: "rgba(16,185,129,0.5)",
  };

  if (compact) {
    return (
      <div className="flex-1 relative rounded-xl flex flex-col min-w-0"
        style={{
          background: 'linear-gradient(180deg, rgba(30,22,40,0.97) 0%, rgba(20,14,30,0.99) 100%)',
          border: '1.5px solid rgba(140,80,200,0.35)',
          boxShadow: 'inset 0 0 24px rgba(140,80,200,0.04), 0 4px 24px rgba(0,0,0,0.5)',
        }}>
        <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(140,80,200,0.08)' }} />
        <div className="px-3 py-1.5 relative flex items-center justify-between"
          style={{ background: 'linear-gradient(90deg, rgba(120,60,180,0.15), rgba(80,30,140,0.08), transparent)' }}>
          <div className="flex items-center gap-1.5">
            <SpellOrbIcon size={14} />
            <span className="text-[8px] font-bold text-purple-300/90 tracking-[0.15em] uppercase">Spells</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-sm transition-all duration-300"
                  style={{
                    background: i < selectedSpells.length ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(60,40,80,0.4)',
                    border: `1px solid ${i < selectedSpells.length ? 'rgba(168,85,247,0.6)' : 'rgba(100,70,140,0.25)'}`,
                  }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-0.5 rounded border py-0.5 px-1.5 transition-all hover:brightness-110"
              style={{ background: "linear-gradient(180deg, rgba(98,72,18,0.82), rgba(72,52,12,0.78))", borderColor: "rgba(250,204,21,0.45)" }}>
              <EnchantedAnvilIcon size={10} />
              <span className="text-[7px] font-bold text-yellow-200 flex items-center gap-0.5">
                <Star size={7} className="fill-yellow-300 text-yellow-300" />{availableSpellStars}
              </span>
            </button>
            {onOpenCodex && (
              <button onClick={onOpenCodex} className="flex items-center justify-center w-4 h-4 rounded transition-all hover:scale-110 hover:brightness-125"
                style={{ background: 'rgba(140,80,200,0.12)', border: '1px solid rgba(140,80,200,0.25)' }} title="View in Codex">
                <Info size={8} className="text-purple-400/70" />
              </button>
            )}
          </div>
          <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(140,80,200,0.3) 20%, rgba(180,120,255,0.4) 50%, rgba(140,80,200,0.3) 80%, transparent)' }} />
        </div>
        <div className="px-2 py-2 flex items-center gap-1.5 justify-center">
          {spellOptions.map((spellType) => {
            const isSelected = selectedSpells.includes(spellType);
            const canSelect = isSelected || selectedSpells.length < 3;
            const spellIndex = selectedSpells.indexOf(spellType);
            const borderColor = spellBorderColors[spellType];
            return (
              <button
                key={spellType}
                onClick={() => toggleSpell(spellType)}
                onMouseEnter={() => setHoveredSpell(spellType)}
                onMouseLeave={() => setHoveredSpell(null)}
                disabled={!canSelect && !isSelected}
                className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${isSelected ? "scale-115 z-10" : canSelect ? "hover:scale-110 hover:brightness-110" : "opacity-35 cursor-not-allowed"}`}
                style={{
                  width: 38, height: 38,
                  background: isSelected
                    ? 'radial-gradient(circle at 30% 30%, rgba(120,50,200,0.3), rgba(60,20,100,0.2))'
                    : 'radial-gradient(circle at 30% 30%, rgba(40,30,50,0.95), rgba(20,14,28,0.95))',
                  border: `2px solid ${isSelected ? borderColor : 'rgba(80,60,100,0.3)'}`,
                  boxShadow: isSelected ? `0 0 12px ${borderColor}, inset 0 0 8px rgba(168,85,247,0.1)` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  outline: isSelected ? `2px solid ${borderColor}` : 'none',
                  outlineOffset: '1px',
                }}
              >
                <SpellSprite type={spellType} size={24} />
                {isSelected && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white font-bold border-[1.5px] border-stone-900"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 0 6px rgba(168,85,247,0.5)' }}>
                    {spellIndex + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <SpellUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          availableStars={availableSpellStars}
          totalStarsEarned={totalSpellStarsEarned}
          spentStars={spentSpellStars}
          spellUpgradeLevels={spellUpgradeLevels}
          onUpgradeSpell={upgradeSpell}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 relative rounded-xl flex flex-col min-w-0"
      style={{
        background: 'linear-gradient(180deg, rgba(30,22,40,0.97) 0%, rgba(20,14,30,0.99) 100%)',
        border: '1.5px solid rgba(140,80,200,0.35)',
        boxShadow: 'inset 0 0 24px rgba(140,80,200,0.04), 0 4px 24px rgba(0,0,0,0.5)',
      }}>
      {/* Inner border glow */}
      <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(140,80,200,0.08)' }} />
      {/* Header */}
      <div className="px-3 py-2 relative flex items-center justify-between"
        style={{ background: 'linear-gradient(90deg, rgba(120,60,180,0.15), rgba(80,30,140,0.08), transparent)' }}>
        <div className="flex items-center gap-2">
          <SpellOrbIcon size={18} />
          <span className="text-[9px] font-bold text-purple-300/90 tracking-[0.2em] uppercase">
            Select Spells
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Spell slots indicator */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-sm transition-all duration-300"
                style={{
                  background: i < selectedSpells.length
                    ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                    : 'rgba(60,40,80,0.4)',
                  border: `1px solid ${i < selectedSpells.length ? 'rgba(168,85,247,0.6)' : 'rgba(100,70,140,0.25)'}`,
                  boxShadow: i < selectedSpells.length ? '0 0 6px rgba(168,85,247,0.4)' : 'none',
                }} />
            ))}
          </div>
          {onOpenCodex && (
            <button
              onClick={onOpenCodex}
              className="flex items-center justify-center w-5 h-5 rounded-md transition-all hover:scale-110 hover:brightness-125"
              style={{
                background: 'rgba(140,80,200,0.12)',
                border: '1px solid rgba(140,80,200,0.25)',
              }}
              title="View in Codex"
            >
              <Info size={10} className="text-purple-400/70" />
            </button>
          )}
        </div>
        <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(140,80,200,0.3) 20%, rgba(180,120,255,0.4) 50%, rgba(140,80,200,0.3) 80%, transparent)' }} />
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        {(() => {
          const spellLabels: Record<SpellType, { nameColor: string; borderColor: string; trait: string; traitColor: string; traitBg: string; traitBorder: string }> = {
            fireball: { nameColor: "text-orange-300", borderColor: "rgba(234,88,12,0.4)", trait: "AoE Burn", traitColor: "text-red-300/80", traitBg: "rgba(127,29,29,0.25)", traitBorder: "rgba(127,29,29,0.2)" },
            lightning: { nameColor: "text-yellow-300", borderColor: "rgba(234,179,8,0.4)", trait: "Chain Stun", traitColor: "text-cyan-300/80", traitBg: "rgba(22,78,99,0.25)", traitBorder: "rgba(22,78,99,0.2)" },
            freeze: { nameColor: "text-cyan-300", borderColor: "rgba(6,182,212,0.4)", trait: "Global Freeze", traitColor: "text-indigo-300/80", traitBg: "rgba(49,46,129,0.25)", traitBorder: "rgba(49,46,129,0.2)" },
            payday: { nameColor: "text-amber-300", borderColor: "rgba(245,158,11,0.4)", trait: "Gold Boost", traitColor: "text-yellow-300/80", traitBg: "rgba(113,63,18,0.25)", traitBorder: "rgba(113,63,18,0.2)" },
            reinforcements: { nameColor: "text-emerald-300", borderColor: "rgba(16,185,129,0.4)", trait: "Summon Units", traitColor: "text-emerald-300/80", traitBg: "rgba(6,78,59,0.25)", traitBorder: "rgba(6,78,59,0.2)" },
          };
          return (
            <div className="flex gap-1.5">
              {spellOptions.map((spellType) => {
                const isSelected = selectedSpells.includes(spellType);
                const canSelect = isSelected || selectedSpells.length < 3;
                const spellIndex = selectedSpells.indexOf(spellType);
                const label = spellLabels[spellType];
                const spellData = SPELL_DATA[spellType];
                const spellCost = spellData?.cost ?? 0;
                const spellCooldownSeconds = (spellData?.cooldown ?? 0) / 1000;
                const spellLevel = spellUpgradeLevels[spellType] ?? 0;
                return (
                  <button
                    key={spellType}
                    onClick={() => toggleSpell(spellType)}
                    onMouseEnter={() => setHoveredSpell(spellType)}
                    onMouseLeave={() => setHoveredSpell(null)}
                    disabled={!canSelect && !isSelected}
                    className={`relative w-full p-1.5 pb-1 flex flex-col items-center gap-0.5 rounded-lg transition-all duration-200 ${isSelected
                      ? "z-10"
                      : canSelect
                        ? "hover:scale-105 hover:brightness-110"
                        : "opacity-35 cursor-not-allowed"
                      }`}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(120,50,200,0.25), rgba(80,20,150,0.15))'
                        : !canSelect
                          ? 'linear-gradient(135deg, rgba(24,18,30,0.6), rgba(16,12,22,0.6))'
                          : 'linear-gradient(135deg, rgba(36,28,44,0.95), rgba(24,18,30,0.95))',
                      border: `1.5px solid ${isSelected ? (label?.borderColor || '#a855f7') : 'rgba(80,60,100,0.25)'}`,
                      boxShadow: isSelected
                        ? `0 0 14px rgba(168,85,247,0.25), inset 0 0 12px rgba(168,85,247,0.08), inset 0 1px 0 rgba(255,255,255,0.06)`
                        : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                      outline: isSelected ? `2px solid ${label?.borderColor || 'rgba(168,85,247,0.5)'}` : 'none',
                      outlineOffset: '1px',
                    }}
                  >
                    <div className="absolute top-0.5 left-0.5 rounded border border-yellow-500/35 bg-yellow-900/45 px-1 py-px text-[7px] font-bold text-yellow-200">
                      Lv {spellLevel + 1}
                    </div>
                    <div>
                      <SpellSprite type={spellType} size={32} />
                    </div>
                    {label && (
                      <>
                        <span className={`text-[8px] font-semibold leading-none ${label.nameColor}`}>{spellData?.shortName ?? spellType}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[7px] font-medium px-1 py-px rounded flex items-center gap-0.5"
                            style={{ background: spellCost > 0 ? 'rgba(120,80,20,0.3)' : 'rgba(20,83,45,0.3)', border: `1px solid ${spellCost > 0 ? 'rgba(120,80,20,0.2)' : 'rgba(20,83,45,0.2)'}` }}>
                            <Coins size={7} className={spellCost > 0 ? "text-amber-400/70" : "text-green-400/70"} />
                            <span className={spellCost > 0 ? "text-amber-300/80" : "text-green-300/80"}>{spellCost > 0 ? spellCost : "Free"}</span>
                          </span>
                          <span className="text-[7px] font-medium px-1 py-px rounded flex items-center gap-0.5"
                            style={{ background: 'rgba(30,58,138,0.25)', border: '1px solid rgba(30,58,138,0.2)' }}>
                            <Clock size={7} className="text-blue-400/70" />
                            <span className="text-blue-300/80">{spellCooldownSeconds}s</span>
                          </span>
                        </div>
                        <span className="text-[7px] font-semibold px-1.5 py-px rounded mt-0.5 inline-block"
                          style={{ background: label.traitBg, border: `1px solid ${label.traitBorder}` }}>
                          <span className={label.traitColor}>{label.trait}</span>
                        </span>
                      </>
                    )}
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-stone-900"
                        style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 0 6px rgba(168,85,247,0.5)' }}>
                        {spellIndex + 1}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })()}
        {/* Spell loadout summary */}
        <div className="mt-auto pt-2">
          <div className="h-px mb-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(140,80,200,0.2) 30%, rgba(140,80,200,0.2) 70%, transparent)' }} />
          <div className="flex items-center gap-2">
            {selectedSpells.length === 3 ? (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md flex-1 min-w-0"
                style={{ background: 'rgba(88,28,135,0.12)', border: '1px solid rgba(88,28,135,0.15)' }}>
                <SpellOrbIcon size={14} className="flex-shrink-0" />
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {selectedSpells.map((sp, i) => (
                    <React.Fragment key={sp}>
                      <div className="flex items-center gap-1">
                        <SpellSprite type={sp} size={14} />
                        <span className="text-[8px] text-purple-200/80 font-medium whitespace-nowrap">{SPELL_DATA[sp].shortName}</span>
                      </div>
                      {i < 2 && <span className="text-purple-600/40 text-[8px]">·</span>}
                    </React.Fragment>
                  ))}
                </div>
                <span className="text-[7px] text-green-400/70 font-semibold uppercase tracking-wider flex-shrink-0">Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md flex-1 min-w-0"
                style={{ background: 'rgba(60,40,80,0.12)', border: '1px solid rgba(80,50,120,0.12)' }}>
                <Zap size={10} className="text-purple-500/40 flex-shrink-0" />
                <div className="flex items-center gap-1 flex-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-1">
                      {i < selectedSpells.length ? (
                        <>
                          <SpellSprite type={selectedSpells[i]} size={14} />
                          <span className="text-[8px] text-purple-200/70 font-medium whitespace-nowrap">{SPELL_DATA[selectedSpells[i]].shortName}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3.5 h-3.5 rounded border border-dashed flex items-center justify-center"
                            style={{ borderColor: 'rgba(140,80,200,0.25)' }}>
                            <span className="text-[7px] text-purple-600/40">?</span>
                          </div>
                          <span className="text-[8px] text-purple-600/30 italic">Empty</span>
                        </>
                      )}
                      {i < 2 && <span className="text-purple-600/30 text-[8px] mx-0.5">·</span>}
                    </div>
                  ))}
                </div>
                <span className="text-[7px] text-purple-500/40 font-medium flex-shrink-0">{3 - selectedSpells.length} left</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex ml-auto items-center gap-1 rounded-md border py-1 px-2 transition-all hover:brightness-110 flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, rgba(98,72,18,0.82), rgba(72,52,12,0.78))",
                borderColor: "rgba(250,204,21,0.45)",
                boxShadow: "inset 0 0 10px rgba(250,204,21,0.15)",
              }}
            >
              <EnchantedAnvilIcon size={16} />
              <span className="text-[8px] font-bold uppercase tracking-wide text-yellow-200">
                Upgrades
              </span>
              <span className="inline-flex items-center gap-0.5 rounded px-1 py-px text-[8px] font-semibold text-yellow-100 bg-yellow-950/45 border border-yellow-500/25">
                <Star size={8} className="fill-yellow-300 text-yellow-300" />
                {availableSpellStars}
              </span>
            </button>
          </div>
        </div>
      </div>
      {hoveredSpell && (() => {
        const spellInfo: Record<SpellType, {
          panelBg: string; panelBorder: string; headerBg: string;
          icon: React.ReactNode; accentText: string;
          stats: Array<{ label: string; value: string; color: string; statBg: string; statBorder: string; icon: React.ReactNode }>;
          effectBg: string; effectLabel: string; effectText: string; effect: string;
        }> = {
          fireball: {
            panelBg: "rgba(40,24,10,0.99)", panelBorder: "rgba(234,88,12,0.5)",
            headerBg: "linear-gradient(90deg, rgba(180,80,20,0.2), rgba(120,40,10,0.1), transparent)",
            icon: <Flame size={16} className="text-orange-400" />, accentText: "text-orange-300",
            stats: [
              { label: "Damage", value: `${fireballStats.damagePerMeteor}×${fireballStats.meteorCount}`, color: "text-red-300", statBg: "rgba(127,29,29,0.3)", statBorder: "rgba(127,29,29,0.2)", icon: <Swords size={10} className="text-red-400" /> },
              { label: "Radius", value: `${fireballStats.impactRadius}`, color: "text-orange-300", statBg: "rgba(124,45,18,0.3)", statBorder: "rgba(124,45,18,0.2)", icon: <Target size={10} className="text-orange-400" /> },
              { label: "Burn", value: `${(fireballStats.burnDurationMs / 1000).toFixed(1)}s`, color: "text-amber-300", statBg: "rgba(120,53,15,0.3)", statBorder: "rgba(120,53,15,0.2)", icon: <Flame size={10} className="text-amber-400" /> },
            ],
            effectBg: "rgba(124,45,18,0.15)", effectLabel: "text-orange-500/80", effectText: "text-orange-200/90",
            effect: `Rains ${fireballStats.meteorCount} meteors in an area. Each deals ${fireballStats.damagePerMeteor} AoE damage with falloff and sets enemies ablaze for ${(fireballStats.burnDurationMs / 1000).toFixed(1)} seconds.`,
          },
          lightning: {
            panelBg: "rgba(36,30,10,0.99)", panelBorder: "rgba(234,179,8,0.5)",
            headerBg: "linear-gradient(90deg, rgba(180,140,20,0.2), rgba(40,120,140,0.08), transparent)",
            icon: <Zap size={16} className="text-yellow-400" />, accentText: "text-yellow-300",
            stats: [
              { label: "Total DMG", value: `${lightningStats.totalDamage}`, color: "text-yellow-300", statBg: "rgba(113,63,18,0.3)", statBorder: "rgba(113,63,18,0.2)", icon: <Swords size={10} className="text-yellow-400" /> },
              { label: "Chains", value: `${lightningStats.chainCount}`, color: "text-cyan-300", statBg: "rgba(22,78,99,0.3)", statBorder: "rgba(22,78,99,0.2)", icon: <Zap size={10} className="text-cyan-400" /> },
              { label: "Stun", value: `${(lightningStats.stunDurationMs / 1000).toFixed(2)}s`, color: "text-blue-300", statBg: "rgba(30,58,138,0.3)", statBorder: "rgba(30,58,138,0.2)", icon: <Timer size={10} className="text-blue-400" /> },
            ],
            effectBg: "rgba(113,63,18,0.15)", effectLabel: "text-yellow-500/80", effectText: "text-yellow-200/90",
            effect: `Lightning chains between up to ${lightningStats.chainCount} enemies, splitting ${lightningStats.totalDamage} total damage. Each hit stuns for ${(lightningStats.stunDurationMs / 1000).toFixed(2)} seconds.`,
          },
          freeze: {
            panelBg: "rgba(10,28,40,0.99)", panelBorder: "rgba(6,182,212,0.5)",
            headerBg: "linear-gradient(90deg, rgba(20,100,140,0.2), rgba(20,60,120,0.08), transparent)",
            icon: <Snowflake size={16} className="text-cyan-400" />, accentText: "text-cyan-300",
            stats: [
              { label: "Duration", value: `${(freezeStats.freezeDurationMs / 1000).toFixed(1)}s`, color: "text-cyan-300", statBg: "rgba(22,78,99,0.3)", statBorder: "rgba(22,78,99,0.2)", icon: <Timer size={10} className="text-cyan-400" /> },
              { label: "Range", value: "Global", color: "text-blue-300", statBg: "rgba(30,58,138,0.3)", statBorder: "rgba(30,58,138,0.2)", icon: <Target size={10} className="text-blue-400" /> },
              { label: "Slow", value: "100%", color: "text-indigo-300", statBg: "rgba(49,46,129,0.3)", statBorder: "rgba(49,46,129,0.2)", icon: <Snowflake size={10} className="text-indigo-400" /> },
            ],
            effectBg: "rgba(22,78,99,0.15)", effectLabel: "text-cyan-500/80", effectText: "text-cyan-200/90",
            effect: `Expanding ice wave freezes ALL enemies on the map for ${(freezeStats.freezeDurationMs / 1000).toFixed(1)} seconds.`,
          },
          payday: {
            panelBg: "rgba(36,28,10,0.99)", panelBorder: "rgba(245,158,11,0.5)",
            headerBg: "linear-gradient(90deg, rgba(160,110,20,0.2), rgba(140,120,10,0.08), transparent)",
            icon: <Coins size={16} className="text-amber-400" />, accentText: "text-amber-300",
            stats: [
              { label: "Base PP", value: `${paydayStats.basePayout}`, color: "text-amber-300", statBg: "rgba(120,53,15,0.3)", statBorder: "rgba(120,53,15,0.2)", icon: <Coins size={10} className="text-amber-400" /> },
              { label: "Per Enemy", value: `+${paydayStats.bonusPerEnemy}`, color: "text-green-300", statBg: "rgba(20,83,45,0.3)", statBorder: "rgba(20,83,45,0.2)", icon: <TrendingUp size={10} className="text-green-400" /> },
              { label: "Max Total", value: `${paydayStats.basePayout + paydayStats.maxBonus}`, color: "text-yellow-300", statBg: "rgba(113,63,18,0.3)", statBorder: "rgba(113,63,18,0.2)", icon: <Sparkles size={10} className="text-yellow-400" /> },
            ],
            effectBg: "rgba(120,53,15,0.15)", effectLabel: "text-amber-500/80", effectText: "text-amber-200/90",
            effect: `Grants ${paydayStats.basePayout} PP plus ${paydayStats.bonusPerEnemy} PP per enemy on the map (max +${paydayStats.maxBonus} bonus). Aura lasts ${(paydayStats.auraDurationMs / 1000).toFixed(0)} seconds.`,
          },
          reinforcements: {
            panelBg: "rgba(16,30,24,0.99)", panelBorder: "rgba(16,185,129,0.5)",
            headerBg: "linear-gradient(90deg, rgba(20,120,80,0.2), rgba(10,80,50,0.08), transparent)",
            icon: <Shield size={16} className="text-emerald-400" />, accentText: "text-emerald-300",
            stats: [
              { label: "Units", value: `${reinforcementStats.knightCount}`, color: "text-emerald-300", statBg: "rgba(6,78,59,0.3)", statBorder: "rgba(6,78,59,0.2)", icon: <Users size={10} className="text-emerald-400" /> },
              { label: "HP Each", value: `${reinforcementStats.knightHp}`, color: "text-red-300", statBg: "rgba(127,29,29,0.3)", statBorder: "rgba(127,29,29,0.2)", icon: <Heart size={10} className="text-red-400" /> },
              { label: "DMG Each", value: `${reinforcementStats.knightDamage}`, color: "text-orange-300", statBg: "rgba(124,45,18,0.3)", statBorder: "rgba(124,45,18,0.2)", icon: <Swords size={10} className="text-orange-400" /> },
            ],
            effectBg: "rgba(6,78,59,0.15)", effectLabel: "text-emerald-500/80", effectText: "text-emerald-200/90",
            effect: reinforcementStats.rangedUnlocked
              ? `Summons ${reinforcementStats.knightCount} veteran reinforcements with tier-${reinforcementStats.visualTier} armor. They fight in melee and fire ranged volleys.`
              : `Summons ${reinforcementStats.knightCount} armored reinforcements at a chosen location. They block and fight enemies until defeated.`,
          },
        };
        const info = spellInfo[hoveredSpell];
        if (!info) return null;
        const spell = SPELL_DATA[hoveredSpell];
        const spellLevel = spellUpgradeLevels[hoveredSpell] ?? 0;
        return (
          <div className="absolute bottom-full right-0 mb-2 w-80 rounded-xl z-50"
            style={{
              background: `linear-gradient(180deg, ${info.panelBg}, rgba(18,14,10,0.99))`,
              border: `1.5px solid ${info.panelBorder}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.7), inset 0 0 20px rgba(255,255,255,0.02)',
            }}>
            <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(255,255,255,0.04)' }} />
            <div className="px-3.5 py-2.5 rounded-t-xl relative" style={{ background: info.headerBg }}>
              <div className="flex items-center gap-2.5">
                {info.icon}
                <span className={`font-bold text-sm ${info.accentText}`}>{spell.name}</span>
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/20 bg-yellow-800/20 text-yellow-200">
                  LV {spellLevel + 1}/{MAX_SPELL_UPGRADE_LEVEL + 1}
                </span>
              </div>
              <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent)' }} />
            </div>
            <div className="px-3.5 py-3">
              <div className="flex gap-2 mb-3">
                <div className="rounded-lg px-2.5 py-1.5 text-center flex-1"
                  style={{ background: 'rgba(120,80,20,0.2)', border: '1px solid rgba(120,80,20,0.2)' }}>
                  <div className="text-[8px] text-amber-500/70 font-medium uppercase tracking-wide">Cost</div>
                  <div className="text-amber-300 font-bold text-xs">
                    {spell.cost > 0 ? `${spell.cost} PP` : "FREE"}
                  </div>
                </div>
                <div className="rounded-lg px-2.5 py-1.5 text-center flex-1"
                  style={{ background: 'rgba(30,58,138,0.2)', border: '1px solid rgba(30,58,138,0.2)' }}>
                  <div className="text-[8px] text-blue-500/70 font-medium uppercase tracking-wide">Cooldown</div>
                  <div className="text-blue-300 font-bold text-xs">{spell.cooldown / 1000}s</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {info.stats.map((stat) => (
                  <div key={stat.label} className="rounded-lg px-2 py-1.5 text-center"
                    style={{ background: stat.statBg, border: `1px solid ${stat.statBorder}` }}>
                    <div className="flex items-center justify-center mb-0.5">{stat.icon}</div>
                    <div className="text-[8px] text-stone-500 font-medium">{stat.label}</div>
                    <div className={`font-bold text-xs ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="mb-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />
              <div className="rounded-lg px-3 py-2.5"
                style={{ background: info.effectBg, border: '1px solid rgba(80,60,50,0.12)' }}>
                <div className={`${info.effectLabel} uppercase text-[8px] font-semibold mb-1 tracking-wider flex items-center gap-1`}>
                  <Sparkles size={9} className="opacity-60" />
                  How it works
                </div>
                <p className={`text-[11px] ${info.effectText} leading-relaxed`}>{info.effect}</p>
              </div>
            </div>
          </div>
        );
      })()}
      <SpellUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        availableStars={availableSpellStars}
        totalStarsEarned={totalSpellStarsEarned}
        spentStars={spentSpellStars}
        spellUpgradeLevels={spellUpgradeLevels}
        onUpgradeSpell={upgradeSpell}
      />
    </div>
  );
};
