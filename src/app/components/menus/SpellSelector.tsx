"use client";
import React, { useCallback } from "react";
import {
  Zap,
  Clock,
  Coins,
  Star,
  Info,
  Crosshair,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { SpellType, SpellUpgradeLevels } from "../../types";
import {
  SPELL_DATA,
} from "../../constants";
import { SpellSprite } from "../../sprites";
import { SpellOrbIcon, EnchantedAnvilIcon } from "../../sprites/custom-icons";
import { SpellUpgradeModal } from "../ui/SpellUpgradeModal";
import { HudTooltip } from "../ui/HudTooltip";
import { SpellbookModal } from "./SpellbookModal";

const spellOptions: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "payday",
  "reinforcements",
];

const spellAccents: Record<SpellType, string> = {
  fireball: "#ea580c",
  lightning: "#eab308",
  freeze: "#06b6d4",
  payday: "#f59e0b",
  reinforcements: "#10b981",
};

const CIRCLE = 36;
const GAP = 4;
const STEP = CIRCLE + GAP;
const VISIBLE_COUNT = 3;
const VP_W = VISIBLE_COUNT * CIRCLE + (VISIBLE_COUNT - 1) * GAP;
const VP_H = Math.ceil(CIRCLE * 1.15) + 4;
const VP_CX = VP_W / 2;
const VP_CY = VP_H / 2;

function circularDiff(idx: number, center: number, len: number): number {
  const raw = ((idx - center) % len + len) % len;
  return raw > len / 2 ? raw - len : raw;
}

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
  spellAutoAim: Partial<Record<SpellType, boolean>>;
  onToggleSpellAutoAim: (spellType: SpellType) => void;
  onOpenCodex?: () => void;
  compact?: boolean;
}

export const SpellSelector: React.FC<SpellSelectorProps> = ({
  selectedSpells,
  toggleSpell,
  setHoveredSpell,
  availableSpellStars,
  totalSpellStarsEarned,
  spentSpellStars,
  spellUpgradeLevels,
  upgradeSpell,
  spellAutoAim,
  onToggleSpellAutoAim,
  onOpenCodex,
  compact = false,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [showSpellbook, setShowSpellbook] = React.useState(false);
  const [centerIdx, setCenterIdx] = React.useState(0);

  const navigate = useCallback((dir: -1 | 1) => {
    setCenterIdx(prev => (prev + dir + spellOptions.length) % spellOptions.length);
  }, []);

  if (compact) {
    const centeredSpell = spellOptions[centerIdx];
    const centeredData = SPELL_DATA[centeredSpell];

    return (
      <>
        <div
          className="flex-1 relative rounded-xl flex items-center min-w-0 gap-1.5 px-2 py-1"
          style={{
            background: 'linear-gradient(180deg, rgba(30,22,40,0.97), rgba(20,14,30,0.99))',
            border: '1.5px solid rgba(140,80,200,0.35)',
            boxShadow: 'inset 0 0 24px rgba(140,80,200,0.04), 0 4px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(140,80,200,0.08)' }} />

          {/* Spell orb icon — opens Spellbook */}
          <button
            onClick={() => setShowSpellbook(true)}
            className="flex-shrink-0 relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(80,40,120,0.45), rgba(20,14,28,0.8))',
              border: '1.5px solid rgba(140,80,200,0.4)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 8px rgba(140,80,200,0.15)',
            }}
            title="Open Spellbook"
          >
            <SpellOrbIcon size={16} />
          </button>

          {/* Carousel track */}
          <div
            className="relative z-10 flex items-center gap-1 rounded-xl px-1 flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, rgba(16,10,24,0.6), rgba(22,16,30,0.5))',
              border: '1px solid rgba(100,65,140,0.18)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(140,80,200,0.08)',
              padding: '3px 4px',
            }}
          >
            {/* Left arrow */}
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
              style={{ background: 'rgba(140,80,200,0.12)', border: '1px solid rgba(140,80,200,0.2)' }}
            >
              <ChevronLeft size={11} className="text-purple-400/80" />
            </button>

            {/* Wheel viewport */}
            <div
              className="relative overflow-hidden flex-shrink-0"
              style={{ width: VP_W, height: VP_H }}
            >
              {spellOptions.map((spellType, idx) => {
                const accent = spellAccents[spellType];
                const diff = circularDiff(idx, centerIdx, spellOptions.length);
                const absDiff = Math.abs(diff);
                const isCenter = diff === 0;
                const halfVisible = Math.floor(VISIBLE_COUNT / 2);
                const isVisible = absDiff <= halfVisible;
                const isSel = selectedSpells.includes(spellType);
                const canToggle = isSel || selectedSpells.length < 3;
                const scale = isCenter ? 1.15 : 0.82;
                const x = VP_CX + diff * STEP - CIRCLE / 2;
                const y = VP_CY - CIRCLE / 2;

                return (
                  <button
                    key={spellType}
                    onClick={() => {
                      if (isCenter) {
                        if (canToggle || isSel) toggleSpell(spellType);
                      } else {
                        setCenterIdx(idx);
                      }
                    }}
                    disabled={isCenter && !canToggle && !isSel}
                    className="absolute flex items-center justify-center rounded-full"
                    style={{
                      width: CIRCLE,
                      height: CIRCLE,
                      left: 0,
                      top: 0,
                      transform: `translate(${x}px, ${y}px) scale(${scale})`,
                      opacity: isVisible ? (isCenter ? 1 : 0.55) : 0,
                      pointerEvents: isVisible ? 'auto' : 'none',
                      background: isSel
                        ? `radial-gradient(circle at 30% 30%, ${accent}35, ${accent}10)`
                        : isCenter
                          ? `radial-gradient(circle at 30% 30%, ${accent}18, ${accent}06)`
                          : 'radial-gradient(circle at 30% 30%, rgba(36,28,44,0.9), rgba(24,18,30,0.9))',
                      border: `2px solid ${isSel ? accent : isCenter ? `${accent}70` : 'rgba(80,60,100,0.25)'}`,
                      boxShadow: isSel
                        ? `0 0 14px ${accent}30, inset 0 0 8px ${accent}12`
                        : isCenter ? `0 0 10px ${accent}18` : 'none',
                      cursor: isCenter && !canToggle && !isSel ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.35s cubic-bezier(0.4,0,0.15,1), opacity 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
                      zIndex: isCenter ? 3 : 1,
                    }}
                  >
                    <SpellSprite type={spellType} size={isCenter ? 26 : 20} />
                    {isSel && (
                      <div
                        className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[6px] text-white font-bold border-[1.5px] border-stone-900"
                        style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 0 6px rgba(168,85,247,0.5)' }}
                      >
                        {selectedSpells.indexOf(spellType) + 1}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => navigate(1)}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
              style={{ background: 'rgba(140,80,200,0.12)', border: '1px solid rgba(140,80,200,0.2)' }}
            >
              <ChevronRight size={11} className="text-purple-400/80" />
            </button>
          </div>

          {/* Spell info */}
          <div className="relative z-10 flex-1 flex items-center gap-2 min-w-0 ml-1.5 px-2 py-1.5">
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-purple-100 leading-tight truncate drop-shadow-sm">
                {centeredData.shortName}
              </span>
              <div className="flex items-center gap-[3px] mt-0.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-sm transition-all duration-300"
                    style={{
                      background: i < selectedSpells.length ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(60,40,80,0.4)',
                      border: `1px solid ${i < selectedSpells.length ? 'rgba(168,85,247,0.5)' : 'rgba(100,70,140,0.2)'}`,
                    }} />
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowSpellbook(true)}
              className="flex-shrink-0 ml-auto mr-0.5 flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
              title="Spellbook"
            >
              <Info size={14} className="text-purple-400/60 hover:text-purple-400" />
            </button>
          </div>

          {/* Upgrade button — far right */}
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="relative z-10 flex-shrink-0 ml-1 mr-1 flex items-center gap-2 rounded-lg border py-1 px-4 transition-all hover:brightness-115 hover:scale-105"
            style={{
              background: "linear-gradient(180deg, rgba(130,95,20,0.92), rgba(88,62,14,0.9))",
              borderColor: "rgba(250,204,21,0.55)",
              boxShadow: "0 0 16px rgba(250,204,21,0.18), inset 0 0 10px rgba(250,204,21,0.14), 0 2px 8px rgba(0,0,0,0.45)",
            }}
          >
            <EnchantedAnvilIcon size={32} />
            <span className="text-[12px] font-bold text-yellow-200 flex items-center gap-0.5">
              <Star size={12} className="fill-yellow-300 text-yellow-300" />
              {availableSpellStars}
            </span>
          </button>

        </div>

        {showSpellbook && (
          <SpellbookModal
            isOpen
            onClose={() => setShowSpellbook(false)}
            selectedSpells={selectedSpells}
            toggleSpell={toggleSpell}
            availableSpellStars={availableSpellStars}
            totalSpellStarsEarned={totalSpellStarsEarned}
            spentSpellStars={spentSpellStars}
            spellUpgradeLevels={spellUpgradeLevels}
            upgradeSpell={upgradeSpell}
          />
        )}
        <SpellUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          availableStars={availableSpellStars}
          totalStarsEarned={totalSpellStarsEarned}
          spentStars={spentSpellStars}
          spellUpgradeLevels={spellUpgradeLevels}
          onUpgradeSpell={upgradeSpell}
        />
      </>
    );
  }

  /* ── Expanded (old) layout ── */
  return (
    <div className="flex-1 relative rounded-xl flex flex-col min-w-0"
      style={{
        background: 'linear-gradient(180deg, rgba(30,22,40,0.97) 0%, rgba(20,14,30,0.99) 100%)',
        border: '1.5px solid rgba(140,80,200,0.35)',
        boxShadow: 'inset 0 0 24px rgba(140,80,200,0.04), 0 4px 24px rgba(0,0,0,0.5)',
      }}>
      <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(140,80,200,0.08)' }} />
      <div className="px-3 py-2 relative flex items-center justify-between"
        style={{ background: 'linear-gradient(90deg, rgba(120,60,180,0.15), rgba(80,30,140,0.08), transparent)' }}>
        <div className="flex items-center gap-2">
          <SpellOrbIcon size={18} />
          <span className="text-[9px] font-bold text-purple-300/90 tracking-[0.2em] uppercase">
            Select Spells
          </span>
        </div>
        <div className="flex items-center gap-2">
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
                    <div className="absolute top-0.5 left-0.5 rounded border border-yellow-500/35 bg-yellow-900/45 px-1 py-px text-[7px] font-bold text-yellow-200 z-20">
                      Lv {spellLevel + 1}
                    </div>
                    {(() => {
                      const isAimable = spellType === "fireball" || spellType === "lightning";
                      const hasUnlocked = isAimable && spellLevel >= 2;
                      const autoOn = isAimable && !!spellAutoAim[spellType];
                      if (!isAimable) return null;
                      const tooltipLabel = !hasUnlocked
                        ? "Unlock auto-aim by upgrading"
                        : autoOn
                          ? "Auto-aim ON — click to switch to manual"
                          : "Manual targeting — click to enable auto-aim";
                      return (
                        <HudTooltip label={tooltipLabel} position="top">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasUnlocked) onToggleSpellAutoAim(spellType);
                            }}
                            className="absolute top-0.5 right-0.5 z-20 flex items-center justify-center rounded transition-all"
                            style={{
                              width: 16,
                              height: 16,
                              background: hasUnlocked && autoOn
                                ? `${label.borderColor.replace("0.4)", "0.2)")}`
                                : "rgba(40,30,50,0.4)",
                              border: `1px solid ${hasUnlocked && autoOn
                                ? label.borderColor
                                : hasUnlocked
                                  ? "rgba(140,100,60,0.3)"
                                  : "rgba(60,50,70,0.25)"
                                }`,
                              cursor: hasUnlocked ? "pointer" : "not-allowed",
                              opacity: hasUnlocked ? 1 : 0.4,
                            }}
                          >
                            <Crosshair
                              size={9}
                              className={
                                hasUnlocked && autoOn
                                  ? label.nameColor
                                  : "text-stone-500"
                              }
                            />
                          </button>
                        </HudTooltip>
                      );
                    })()}
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
