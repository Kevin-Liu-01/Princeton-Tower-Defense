"use client";
import React from "react";
import {
  X,
  Coins,
  Clock,
  Star,
  Flame,
  Zap,
  Snowflake,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import type { SpellType, SpellUpgradeLevels } from "../../types";
import { SPELL_DATA } from "../../constants";
import { SpellSprite } from "../../sprites";
import { SpellOrbIcon, EnchantedAnvilIcon } from "../../sprites/custom-icons";
import { SpellUpgradeModal } from "../ui/SpellUpgradeModal";
import { BaseModal } from "../ui/BaseModal";
import { OrnateFrame } from "../ui/OrnateFrame";
import { PANEL, GOLD, OVERLAY, panelGradient, dividerGradient } from "../ui/theme";

const spellOptions: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "payday",
  "reinforcements",
];

const SPELL_META: Record<
  SpellType,
  {
    nameColor: string;
    accent: string;
    bg: string;
    border: string;
    trait: string;
    icon: React.ReactNode;
  }
> = {
  fireball: {
    nameColor: "text-orange-200",
    accent: "#ea580c",
    bg: "rgba(55,28,12,0.97)",
    border: "rgba(234,88,12,0.5)",
    trait: "AoE Burn",
    icon: <Flame size={14} className="text-orange-400" />,
  },
  lightning: {
    nameColor: "text-yellow-200",
    accent: "#eab308",
    bg: "rgba(48,38,14,0.97)",
    border: "rgba(234,179,8,0.5)",
    trait: "Chain Stun",
    icon: <Zap size={14} className="text-yellow-400" />,
  },
  freeze: {
    nameColor: "text-cyan-200",
    accent: "#06b6d4",
    bg: "rgba(12,28,42,0.98)",
    border: "rgba(6,182,212,0.5)",
    trait: "Global Freeze",
    icon: <Snowflake size={14} className="text-cyan-400" />,
  },
  payday: {
    nameColor: "text-amber-200",
    accent: "#f59e0b",
    bg: "rgba(48,34,12,0.97)",
    border: "rgba(245,158,11,0.5)",
    trait: "Gold Boost",
    icon: <Coins size={14} className="text-amber-400" />,
  },
  reinforcements: {
    nameColor: "text-emerald-200",
    accent: "#10b981",
    bg: "rgba(16,32,22,0.98)",
    border: "rgba(16,185,129,0.5)",
    trait: "Summon Units",
    icon: <Shield size={14} className="text-emerald-400" />,
  },
};

interface SpellbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpells: SpellType[];
  toggleSpell: (spell: SpellType) => void;
  availableSpellStars: number;
  totalSpellStarsEarned: number;
  spentSpellStars: number;
  spellUpgradeLevels: SpellUpgradeLevels;
  upgradeSpell: (spellType: SpellType) => void;
}

export const SpellbookModal: React.FC<SpellbookModalProps> = ({
  isOpen,
  onClose,
  selectedSpells,
  toggleSpell,
  availableSpellStars,
  totalSpellStarsEarned,
  spentSpellStars,
  spellUpgradeLevels,
  upgradeSpell,
}) => {
  const [focusedSpell, setFocusedSpell] = React.useState<SpellType>("fireball");
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && selectedSpells.length > 0) {
      setFocusedSpell(selectedSpells[0]);
    }
  }, [isOpen, selectedSpells]);

  const spell = SPELL_DATA[focusedSpell];
  const meta = SPELL_META[focusedSpell];
  const isSelected = selectedSpells.includes(focusedSpell);
  const canSelect = isSelected || selectedSpells.length < 3;
  const spellLevel = spellUpgradeLevels[focusedSpell] ?? 0;
  const focusedIdx = spellOptions.indexOf(focusedSpell);

  const navigate = (dir: -1 | 1) => {
    const next = (focusedIdx + dir + spellOptions.length) % spellOptions.length;
    setFocusedSpell(spellOptions[next]);
  };

  return (
    <>
      <BaseModal isOpen={isOpen} onClose={onClose} zClass="z-[200]" backdropBg={OVERLAY.black60}>
        <div
          className="relative w-[92vw] max-w-[840px] max-h-[88vh] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: panelGradient,
            border: `2px solid ${GOLD.border35}`,
            boxShadow: `0 0 40px ${GOLD.glow07}, inset 0 0 30px ${GOLD.glow04}`,
          }}
        >
          <OrnateFrame className="relative w-full h-full overflow-hidden flex flex-col" cornerSize={48} showSideBorders={false}>
            <div className="absolute inset-[3px] rounded-[14px] pointer-events-none z-20" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: PANEL.bgDeep,
                border: `1px solid ${GOLD.border25}`,
              }}
            >
              <X size={16} className="text-amber-400" />
            </button>

            {/* Header */}
            <div
              className="relative px-6 py-4 flex-shrink-0 flex items-center justify-between"
              style={{
                background: "linear-gradient(90deg, rgba(120,60,180,0.18), rgba(80,30,140,0.08), transparent)",
              }}
            >
              <div className="flex items-center gap-3">
                <SpellOrbIcon size={28} />
                <h2 className="text-lg font-bold text-purple-200 tracking-[0.2em] uppercase">
                  Spellbook
                </h2>
                <div className="flex items-center gap-1 ml-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm transition-all duration-300"
                      style={{
                        background: i < selectedSpells.length
                          ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                          : "rgba(60,40,80,0.4)",
                        border: `1px solid ${i < selectedSpells.length
                            ? "rgba(168,85,247,0.6)"
                            : "rgba(100,70,140,0.25)"
                          }`,
                        boxShadow: i < selectedSpells.length ? "0 0 6px rgba(168,85,247,0.4)" : "none",
                      }}
                    />
                  ))}
                  <span className="text-[9px] text-purple-400/60 ml-1 font-medium">
                    {selectedSpells.length}/3
                  </span>
                </div>
              </div>

              {/* Upgrade button */}
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-1.5 rounded-lg border py-1.5 px-3 transition-all hover:brightness-110 hover:scale-105"
                style={{
                  background: "linear-gradient(180deg, rgba(98,72,18,0.85), rgba(72,52,12,0.8))",
                  borderColor: "rgba(250,204,21,0.5)",
                  boxShadow: "inset 0 0 10px rgba(250,204,21,0.15)",
                }}
              >
                <EnchantedAnvilIcon size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-200">
                  Upgrades
                </span>
                <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold text-yellow-100 bg-yellow-950/45 border border-yellow-500/25">
                  <Star size={9} className="fill-yellow-300 text-yellow-300" />
                  {availableSpellStars}
                </span>
              </button>

              <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: dividerGradient }}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col lg:flex-row p-5 gap-5">
                {/* Featured spell showcase */}
                <div
                  className="flex-1 relative rounded-xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${meta.bg}, rgba(14,10,22,0.98))`,
                    border: `1.5px solid ${meta.border}`,
                    minHeight: 340,
                  }}
                >
                  {/* Placeholder action background */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: `url('/images/spells/${focusedSpell}-action.png')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at 50% 30%, ${meta.accent}08, transparent 60%), linear-gradient(0deg, rgba(14,10,22,0.98) 0%, transparent 50%)`,
                    }}
                  />

                  {/* Navigation arrows */}
                  <button
                    onClick={() => navigate(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(140,80,200,0.3)",
                    }}
                  >
                    <ChevronLeft size={20} className="text-purple-400" />
                  </button>
                  <button
                    onClick={() => navigate(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(140,80,200,0.3)",
                    }}
                  >
                    <ChevronRight size={20} className="text-purple-400" />
                  </button>

                  {/* Spell content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full py-8 px-4">
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center mb-5 transition-all duration-300"
                      style={{
                        background: `radial-gradient(circle, ${meta.accent}25, ${meta.accent}08)`,
                        border: `3px solid ${meta.accent}`,
                        boxShadow: `0 0 40px ${meta.accent}25, 0 0 80px ${meta.accent}12, inset 0 0 20px ${meta.accent}08`,
                      }}
                    >
                      <SpellSprite type={focusedSpell} size={60} />
                    </div>

                    {/* Level badge */}
                    <div
                      className="px-2 py-0.5 rounded-md mb-2"
                      style={{
                        background: "rgba(120,80,20,0.35)",
                        border: "1px solid rgba(250,204,21,0.2)",
                      }}
                    >
                      <span className="text-[10px] font-bold text-yellow-200">
                        Level {spellLevel + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      {meta.icon}
                      <h3 className={`text-2xl font-black tracking-wide ${meta.nameColor}`}>
                        {spell.name}
                      </h3>
                    </div>

                    <span
                      className="text-xs font-semibold uppercase tracking-[0.15em] px-3 py-0.5 rounded-full mb-4"
                      style={{
                        background: `${meta.accent}18`,
                        border: `1px solid ${meta.accent}30`,
                        color: meta.accent,
                      }}
                    >
                      {meta.trait}
                    </span>

                    {/* Cost & Cooldown */}
                    <div className="flex gap-3 mb-5">
                      <div
                        className="flex flex-col items-center px-4 py-2 rounded-lg"
                        style={{
                          background: spell.cost > 0 ? "rgba(120,80,20,0.25)" : "rgba(20,83,45,0.25)",
                          border: `1px solid ${spell.cost > 0 ? "rgba(120,80,20,0.2)" : "rgba(20,83,45,0.2)"}`,
                        }}
                      >
                        <Coins size={14} className={spell.cost > 0 ? "text-amber-400" : "text-green-400"} />
                        <span className={`text-sm font-bold mt-1 ${spell.cost > 0 ? "text-amber-200" : "text-green-200"}`}>
                          {spell.cost > 0 ? `${spell.cost} PP` : "Free"}
                        </span>
                        <span className="text-[8px] text-amber-500/60 uppercase font-semibold">
                          Cost
                        </span>
                      </div>
                      <div
                        className="flex flex-col items-center px-4 py-2 rounded-lg"
                        style={{
                          background: "rgba(30,58,138,0.2)",
                          border: "1px solid rgba(30,58,138,0.2)",
                        }}
                      >
                        <Clock size={14} className="text-blue-400" />
                        <span className="text-sm font-bold text-blue-200 mt-1">
                          {spell.cooldown / 1000}s
                        </span>
                        <span className="text-[8px] text-blue-500/60 uppercase font-semibold">
                          Cooldown
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div
                      className="px-5 py-3 rounded-xl max-w-[380px] text-center"
                      style={{
                        background: `${meta.accent}0a`,
                        border: `1px solid ${meta.accent}18`,
                      }}
                    >
                      <p className="text-[11px] text-purple-200/70 leading-relaxed">
                        {spell.desc}
                      </p>
                    </div>

                    {/* Equip button */}
                    <button
                      onClick={() => toggleSpell(focusedSpell)}
                      disabled={!canSelect && !isSelected}
                      className="mt-5 px-8 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{
                        background: isSelected
                          ? "linear-gradient(180deg, rgba(100,40,160,0.9), rgba(60,20,100,0.9))"
                          : "linear-gradient(180deg, rgba(140,70,200,0.85), rgba(90,40,150,0.9))",
                        border: isSelected
                          ? "1.5px solid rgba(168,85,247,0.6)"
                          : "1.5px solid rgba(168,85,247,0.45)",
                        boxShadow: isSelected
                          ? "0 0 20px rgba(168,85,247,0.2)"
                          : "0 0 20px rgba(168,85,247,0.12), inset 0 0 10px rgba(168,85,247,0.08)",
                        color: isSelected ? "#c084fc" : "#e9d5ff",
                      }}
                    >
                      {isSelected ? "✓ Equipped" : canSelect ? "Equip Spell" : "Slots Full"}
                    </button>
                  </div>
                </div>

                {/* Spell roster */}
                <div className="w-full lg:w-[200px] flex flex-col gap-2 flex-shrink-0">
                  <span className="text-[9px] font-bold text-purple-500/60 uppercase tracking-[0.2em] px-1">
                    Grimoire
                  </span>
                  <div className="grid grid-cols-3 lg:grid-cols-1 gap-1.5">
                    {spellOptions.map((st) => {
                      const sd = SPELL_DATA[st];
                      const sm = SPELL_META[st];
                      const isFocused = focusedSpell === st;
                      const isSel = selectedSpells.includes(st);
                      const selIdx = selectedSpells.indexOf(st);
                      return (
                        <button
                          key={st}
                          onClick={() => setFocusedSpell(st)}
                          className={`relative flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ${isFocused
                              ? "scale-[1.02] z-10"
                              : "hover:scale-[1.02] hover:brightness-110"
                            }`}
                          style={{
                            background: isFocused
                              ? `linear-gradient(135deg, ${sm.accent}20, ${sm.accent}08)`
                              : "linear-gradient(135deg, rgba(30,24,38,0.9), rgba(20,16,26,0.9))",
                            border: `1.5px solid ${isFocused ? sm.border : "rgba(80,60,100,0.2)"}`,
                            boxShadow: isFocused
                              ? `0 0 14px ${sm.accent}20`
                              : "none",
                          }}
                        >
                          <SpellSprite type={st} size={32} />
                          <div className="hidden lg:flex flex-col items-start min-w-0">
                            <span className={`text-[10px] font-bold leading-none ${sm.nameColor}`}>
                              {sd.shortName}
                            </span>
                            <span className="text-[8px] text-purple-400/50 mt-0.5">
                              Lv {(spellUpgradeLevels[st] ?? 0) + 1}
                            </span>
                          </div>
                          {isSel && (
                            <div
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold border-[1.5px] border-stone-900"
                              style={{
                                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                                boxShadow: "0 0 6px rgba(168,85,247,0.5)",
                              }}
                            >
                              {selIdx + 1}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Loadout summary */}
                  <div className="mt-auto pt-3">
                    <div
                      className="h-px mb-3"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(140,80,200,0.2) 30%, rgba(140,80,200,0.2) 70%, transparent)",
                      }}
                    />
                    <span className="text-[8px] font-bold text-purple-500/50 uppercase tracking-wider block mb-1.5 px-1">
                      Loadout
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((i) =>
                        i < selectedSpells.length ? (
                          <div
                            key={i}
                            className="flex items-center gap-1 px-2 py-1 rounded-md"
                            style={{
                              background: "rgba(88,28,135,0.15)",
                              border: "1px solid rgba(88,28,135,0.2)",
                            }}
                          >
                            <SpellSprite type={selectedSpells[i]} size={14} />
                            <span className="text-[8px] text-purple-200/70 font-medium">
                              {SPELL_DATA[selectedSpells[i]].shortName}
                            </span>
                          </div>
                        ) : (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-md border border-dashed flex items-center justify-center"
                            style={{ borderColor: "rgba(140,80,200,0.2)" }}
                          >
                            <span className="text-[8px] text-purple-600/30">
                              ?
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    {selectedSpells.length === 3 && (
                      <div className="flex items-center gap-1 mt-2 px-1">
                        <Check size={10} className="text-green-400/70" />
                        <span className="text-[8px] text-green-400/60 font-semibold uppercase tracking-wider">
                          Ready
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </OrnateFrame>
        </div>
      </BaseModal>

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
};
