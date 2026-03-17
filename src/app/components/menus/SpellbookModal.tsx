"use client";
import React from "react";
import {
  X,
  Coins,
  Clock,
  Star,
  Eye,
  Flame,
  Zap,
  Snowflake,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import type { SpellType, SpellUpgradeLevels } from "../../types";
import {
  SPELL_DATA,
  SPELL_ACCENTS,
  SPELL_TRAITS,
  MAX_SPELL_UPGRADE_LEVEL,
  SPELL_OPTIONS,
  getSpellActionImagePath,
} from "../../constants";
import { SpellSprite } from "../../sprites";
import { SpellOrbIcon, EnchantedAnvilIcon } from "../../sprites/custom-icons";
import { SpellUpgradeModal } from "../ui/SpellUpgradeModal";
import { BaseModal } from "../ui/BaseModal";
import { OrnateFrame } from "../ui/OrnateFrame";
import { PANEL, GOLD, OVERLAY, panelGradient, dividerGradient } from "../ui/theme";
import { spellFrameElements } from "../ui/ornateFrameHelpers";

function hexToRgba(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const SHOWCASE_FRAME = 152;
const SHOWCASE_CX = SHOWCASE_FRAME / 2;
const SHOWCASE_MID_R = SHOWCASE_CX - 5;

const ROSTER_FRAME = 50;
const ROSTER_CX = ROSTER_FRAME / 2;

const SPELL_META: Record<
  SpellType,
  {
    nameColor: string;
    accent: string;
    bg: string;
    border: string;
    trait: string;
    icon: React.ReactNode;
    element: string;
    auraGradient: string;
  }
> = {
  fireball: {
    nameColor: "text-orange-200",
    accent: SPELL_ACCENTS.fireball,
    bg: "rgba(55,28,12,0.97)",
    border: "rgba(234,88,12,0.5)",
    trait: SPELL_TRAITS.fireball.trait,
    icon: <Flame size={14} className="text-orange-400" />,
    element: "Fire",
    auraGradient: "conic-gradient(from 0deg, transparent, rgba(234,88,12,0.2), transparent, rgba(249,115,22,0.15), transparent)",
  },
  lightning: {
    nameColor: "text-yellow-200",
    accent: SPELL_ACCENTS.lightning,
    bg: "rgba(48,38,14,0.97)",
    border: "rgba(234,179,8,0.5)",
    trait: SPELL_TRAITS.lightning.trait,
    icon: <Zap size={14} className="text-yellow-400" />,
    element: "Lightning",
    auraGradient: "conic-gradient(from 0deg, transparent, rgba(234,179,8,0.2), transparent, rgba(250,204,21,0.15), transparent)",
  },
  freeze: {
    nameColor: "text-cyan-200",
    accent: SPELL_ACCENTS.freeze,
    bg: "rgba(12,28,42,0.98)",
    border: "rgba(6,182,212,0.5)",
    trait: SPELL_TRAITS.freeze.trait,
    icon: <Snowflake size={14} className="text-cyan-400" />,
    element: "Ice",
    auraGradient: "conic-gradient(from 0deg, transparent, rgba(6,182,212,0.2), transparent, rgba(34,211,238,0.15), transparent)",
  },
  hex_ward: {
    nameColor: "text-fuchsia-200",
    accent: SPELL_ACCENTS.hex_ward,
    bg: "rgba(34,16,46,0.98)",
    border: "rgba(168,85,247,0.5)",
    trait: SPELL_TRAITS.hex_ward.trait,
    icon: <Eye size={14} className="text-fuchsia-400" />,
    element: "Shadow",
    auraGradient: "conic-gradient(from 0deg, transparent, rgba(168,85,247,0.22), transparent, rgba(232,121,249,0.16), transparent)",
  },
  payday: {
    nameColor: "text-amber-200",
    accent: SPELL_ACCENTS.payday,
    bg: "rgba(48,34,12,0.97)",
    border: "rgba(245,158,11,0.5)",
    trait: SPELL_TRAITS.payday.trait,
    icon: <Coins size={14} className="text-amber-400" />,
    element: "Gold",
    auraGradient: "conic-gradient(from 0deg, transparent, rgba(245,158,11,0.2), transparent, rgba(251,191,36,0.15), transparent)",
  },
  reinforcements: {
    nameColor: "text-emerald-200",
    accent: SPELL_ACCENTS.reinforcements,
    bg: "rgba(16,32,22,0.98)",
    border: "rgba(16,185,129,0.5)",
    trait: SPELL_TRAITS.reinforcements.trait,
    icon: <Shield size={14} className="text-emerald-400" />,
    element: "Nature",
    auraGradient: "conic-gradient(from 0deg, transparent, rgba(16,185,129,0.2), transparent, rgba(52,211,153,0.15), transparent)",
  },
};

function FloatingParticles({ color, count = 6 }: { color: string; count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-float-particle"
          style={{
            background: color,
            left: `${15 + (i * 70) / count}%`,
            bottom: `${10 + (i % 3) * 15}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2.5 + (i % 3) * 0.5}s`,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      ))}
    </div>
  );
}

function RuneBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none animate-rune-fade overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="spell-rune-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="8" stroke="rgba(140,80,200,0.25)" strokeWidth="0.3" fill="none" />
            <circle cx="25" cy="25" r="3" stroke="rgba(140,80,200,0.2)" strokeWidth="0.3" fill="none" />
            <path d="M25 17 L25 33 M17 25 L33 25" stroke="rgba(140,80,200,0.15)" strokeWidth="0.3" fill="none" />
            <path d="M19 19 L31 31 M31 19 L19 31" stroke="rgba(140,80,200,0.1)" strokeWidth="0.3" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#spell-rune-grid)" />
      </svg>
    </div>
  );
}

function UpgradeStarPips({ level, maxLevel, accent }: { level: number; maxLevel: number; accent: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxLevel }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < level ? "fill-current" : "opacity-25"}
          style={{ color: i < level ? accent : "rgba(200,200,200,0.3)" }}
        />
      ))}
    </div>
  );
}

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
  downgradeSpell: (spellType: SpellType) => void;
  initialSpell?: SpellType;
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
  downgradeSpell,
  initialSpell,
}) => {
  const [focusedSpell, setFocusedSpell] = React.useState<SpellType>("fireball");
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (initialSpell) {
        setFocusedSpell(initialSpell);
      } else if (selectedSpells.length > 0) {
        setFocusedSpell(selectedSpells[0]);
      }
    }
  }, [isOpen, initialSpell, selectedSpells]);

  const spell = SPELL_DATA[focusedSpell];
  const meta = SPELL_META[focusedSpell];
  const isSelected = selectedSpells.includes(focusedSpell);
  const spellLevel = spellUpgradeLevels[focusedSpell] ?? 0;
  const focusedIdx = SPELL_OPTIONS.indexOf(focusedSpell);

  const navigate = (dir: -1 | 1) => {
    const next = (focusedIdx + dir + SPELL_OPTIONS.length) % SPELL_OPTIONS.length;
    setFocusedSpell(SPELL_OPTIONS[next]);
  };

  return (
    <>
      <BaseModal isOpen={isOpen} onClose={onClose} zClass="z-[200]" backdropBg={OVERLAY.black60}>
        <div
          className="relative w-[92vw] max-w-[880px] max-h-[88dvh] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: panelGradient,
            border: `2px solid ${GOLD.border35}`,
            boxShadow: `0 0 60px ${GOLD.glow07}, 0 0 120px rgba(140,80,200,0.04), inset 0 0 30px ${GOLD.glow04}`,
          }}
        >
          <OrnateFrame className="relative w-full h-full overflow-hidden flex flex-col" cornerSize={52} showSideBorders={false}>
            <div className="absolute inset-[3px] rounded-[14px] pointer-events-none z-20" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
            <RuneBackground />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:rotate-90 duration-300"
              style={{ background: PANEL.bgDeep, border: `1px solid ${GOLD.border25}` }}
            >
              <X size={16} className="text-amber-400" />
            </button>

            {/* Header */}
            <div
              className="relative px-6 pr-14 py-4 flex-shrink-0 flex items-center justify-between"
              style={{ background: "linear-gradient(90deg, rgba(120,60,180,0.18), rgba(80,30,140,0.08), transparent)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <SpellOrbIcon size={30} />
                  <div className="absolute -inset-1 rounded-full animate-badge-glow" style={{ "--glow-color": "rgba(140,80,200,0.3)" } as React.CSSProperties} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-purple-200 tracking-[0.2em] uppercase font-cinzel">
                    Spellbook
                  </h2>
                  <p className="text-[9px] text-purple-500/40 tracking-[0.15em] uppercase mt-0.5">
                    Arcane arsenal &middot; {selectedSpells.length}/3 equipped
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-3.5 h-3.5 rounded-sm transition-all duration-300 relative"
                      style={{
                        background: i < selectedSpells.length
                          ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                          : "rgba(60,40,80,0.4)",
                        border: `1px solid ${i < selectedSpells.length ? "rgba(168,85,247,0.6)" : "rgba(100,70,140,0.25)"}`,
                        boxShadow: i < selectedSpells.length ? "0 0 8px rgba(168,85,247,0.4)" : "none",
                      }}
                    >
                      {i < selectedSpells.length && (
                        <Sparkles size={7} className="absolute inset-0 m-auto text-purple-200" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade button */}
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-2 rounded-lg border py-2 px-3.5 transition-all hover:brightness-110 hover:scale-105 duration-200 group relative overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, rgba(98,72,18,0.85), rgba(72,52,12,0.8))",
                  borderColor: "rgba(250,204,21,0.5)",
                  boxShadow: "inset 0 0 12px rgba(250,204,21,0.15), 0 0 12px rgba(250,204,21,0.08)",
                }}
              >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.08), transparent)" }} />
                </div>
                <EnchantedAnvilIcon size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-200">
                  Upgrades
                </span>
                <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold text-yellow-100 bg-yellow-950/45 border border-yellow-500/25">
                  <Star size={9} className="fill-yellow-300 text-yellow-300" />
                  {availableSpellStars}
                </span>
              </button>

              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: dividerGradient }} />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="flex flex-col lg:flex-row p-5 gap-5">
                {/* Featured spell showcase */}
                <div
                  className="flex-1 relative rounded-xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${meta.bg}, rgba(14,10,22,0.98))`,
                    border: `1.5px solid ${meta.border}`,
                    minHeight: 420,
                  }}
                >
                  {/* Background layers */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: `url('${getSpellActionImagePath(focusedSpell)}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at 50% 25%, ${meta.accent}10, transparent 55%), linear-gradient(0deg, rgba(14,10,22,0.99) 0%, rgba(14,10,22,0.7) 30%, transparent 60%)`,
                    }}
                  />

                  <FloatingParticles color={meta.accent} count={8} />

                  {/* Navigation arrows */}
                  {(["left", "right"] as const).map((side) => (
                    <button
                      key={side}
                      onClick={() => navigate(side === "left" ? -1 : 1)}
                      className={`absolute ${side === "left" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-black/70 duration-200 group`}
                      style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${meta.accent}40` }}
                    >
                      {side === "left"
                        ? <ChevronLeft size={20} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                        : <ChevronRight size={20} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                      }
                    </button>
                  ))}

                  {/* Spell content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full py-8 px-4">
                    {/* Spell orb with animated elemental aura */}
                    <div className="relative mb-6">
                      {/* Outer spinning elemental aura */}
                      <div
                        className="absolute -inset-7 rounded-full animate-aura-spin"
                        style={{ background: meta.auraGradient }}
                      />
                      {/* Pulsing elemental glow */}
                      <div
                        className="absolute -inset-5 rounded-full animate-spell-orb"
                        style={{ background: `radial-gradient(circle, ${meta.accent}18, transparent 70%)` }}
                      />
                      {/* Orb circle */}
                      <div
                        className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center transition-all duration-500"
                        style={{
                          background: `radial-gradient(circle at 40% 35%, ${meta.accent}30, ${meta.accent}08)`,
                          border: `3px solid ${meta.accent}`,
                          boxShadow: `0 0 40px ${meta.accent}25, 0 0 80px ${meta.accent}12, inset 0 0 25px ${meta.accent}08`,
                        }}
                      >
                        <svg className="absolute pointer-events-none" style={{
                          top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }} width={SHOWCASE_FRAME} height={SHOWCASE_FRAME} overflow="visible">
                          {spellFrameElements({
                            cx: SHOWCASE_CX, outerR: SHOWCASE_CX - 2, midR: SHOWCASE_MID_R,
                            color: hexToRgba(meta.accent, 0.3),
                            dimColor: hexToRgba(meta.accent, 0.15),
                            prefix: "sb-show",
                          })}
                        </svg>
                        <SpellSprite type={focusedSpell} size={64} />
                      </div>
                      {/* Equipped badge */}
                      {isSelected && (
                        <div
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-purple-200 animate-badge-glow z-20"
                          style={{
                            background: "linear-gradient(135deg, rgba(88,28,135,0.95), rgba(55,15,90,0.95))",
                            border: "1px solid rgba(168,85,247,0.5)",
                            "--glow-color": "rgba(168,85,247,0.3)",
                          } as React.CSSProperties}
                        >
                          Slot {selectedSpells.indexOf(focusedSpell) + 1}
                        </div>
                      )}
                    </div>

                    {/* Level + Upgrade Progress */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="px-2.5 py-0.5 rounded-md"
                        style={{ background: "rgba(120,80,20,0.35)", border: "1px solid rgba(250,204,21,0.2)" }}
                      >
                        <span className="text-[10px] font-bold text-yellow-200">
                          Level {spellLevel + 1}
                        </span>
                      </div>
                      <UpgradeStarPips level={spellLevel + 1} maxLevel={MAX_SPELL_UPGRADE_LEVEL + 1} accent={meta.accent} />
                    </div>

                    {/* Name + Element */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${meta.accent}20`, border: `1px solid ${meta.accent}30` }}>
                        {meta.icon}
                      </div>
                      <h3 className={`text-2xl font-black tracking-wide font-cinzel ${meta.nameColor}`}>
                        {spell.name}
                      </h3>
                    </div>

                    {/* Element + Trait badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full"
                        style={{ background: `${meta.accent}12`, border: `1px solid ${meta.accent}25`, color: meta.accent }}
                      >
                        {meta.element}
                      </span>
                      <span
                        className="text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full"
                        style={{ background: `${meta.accent}18`, border: `1px solid ${meta.accent}30`, color: meta.accent }}
                      >
                        {meta.trait}
                      </span>
                    </div>

                    {/* Ornate divider */}
                    <div className="w-48 h-px mb-5" style={{ background: `linear-gradient(90deg, transparent, ${meta.accent}40, transparent)` }} />

                    {/* Cost & Cooldown */}
                    <div className="flex gap-3 mb-5">
                      <div
                        className="flex flex-col items-center px-5 py-2.5 rounded-lg min-w-[80px] relative overflow-hidden"
                        style={{
                          background: spell.cost > 0 ? "rgba(120,80,20,0.25)" : "rgba(20,83,45,0.25)",
                          border: `1px solid ${spell.cost > 0 ? "rgba(120,80,20,0.25)" : "rgba(20,83,45,0.25)"}`,
                        }}
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                          style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 5px)" }}
                        />
                        <Coins size={15} className={spell.cost > 0 ? "text-amber-400" : "text-green-400"} />
                        <span className={`text-sm font-bold mt-1.5 tabular-nums ${spell.cost > 0 ? "text-amber-200" : "text-green-200"}`}>
                          {spell.cost > 0 ? `${spell.cost} PP` : "Free"}
                        </span>
                        <span className="text-[7px] text-amber-500/50 uppercase font-bold tracking-wider">
                          Cost
                        </span>
                      </div>
                      <div
                        className="flex flex-col items-center px-5 py-2.5 rounded-lg min-w-[80px] relative overflow-hidden"
                        style={{ background: "rgba(30,58,138,0.2)", border: "1px solid rgba(30,58,138,0.25)" }}
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                          style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 5px)" }}
                        />
                        <Clock size={15} className="text-blue-400" />
                        <span className="text-sm font-bold text-blue-200 mt-1.5 tabular-nums">
                          {spell.cooldown / 1000}s
                        </span>
                        <span className="text-[7px] text-blue-500/50 uppercase font-bold tracking-wider">
                          Cooldown
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div
                      className="relative px-5 py-3.5 rounded-xl max-w-[400px] text-center overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${meta.accent}0c, ${meta.accent}04)`,
                        border: `1px solid ${meta.accent}1a`,
                      }}
                    >
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 animate-shimmer" style={{ background: `linear-gradient(90deg, transparent, ${meta.accent}06, transparent)` }} />
                      </div>
                      <p className="relative text-[11px] text-purple-200/60 leading-relaxed">
                        {spell.desc}
                      </p>
                    </div>

                    {/* Equip button */}
                    <button
                      onClick={() => toggleSpell(focusedSpell)}
                      className="mt-6 px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 hover:brightness-110 duration-200 relative overflow-hidden group"
                      style={{
                        background: isSelected
                          ? "linear-gradient(180deg, rgba(100,40,160,0.9), rgba(60,20,100,0.9))"
                          : "linear-gradient(180deg, rgba(140,70,200,0.85), rgba(90,40,150,0.9))",
                        border: isSelected
                          ? "1.5px solid rgba(168,85,247,0.6)"
                          : "1.5px solid rgba(168,85,247,0.45)",
                        boxShadow: isSelected
                          ? "0 0 25px rgba(168,85,247,0.2)"
                          : "0 0 25px rgba(168,85,247,0.12), inset 0 0 12px rgba(168,85,247,0.08)",
                        color: isSelected ? "#c084fc" : "#e9d5ff",
                      }}
                    >
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
                      </div>
                      <span className="relative z-10">
                        {isSelected ? "Unequip" : "Equip Spell"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Spell roster (Grimoire) */}
                <div className="w-full lg:w-[230px] flex flex-col gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <span className="text-[9px] font-bold text-purple-500/50 uppercase tracking-[0.2em]">
                      Grimoire
                    </span>
                    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(140,80,200,0.15), transparent)" }} />
                    <span className="text-[8px] text-purple-600/30 font-medium">{SPELL_OPTIONS.length} spells</span>
                  </div>

                  <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                    {SPELL_OPTIONS.map((st) => {
                      const sd = SPELL_DATA[st];
                      const sm = SPELL_META[st];
                      const isFocused = focusedSpell === st;
                      const isSel = selectedSpells.includes(st);
                      const selIdx = selectedSpells.indexOf(st);
                      const lvl = spellUpgradeLevels[st] ?? 0;
                      return (
                        <button
                          key={st}
                          onClick={() => setFocusedSpell(st)}
                          className={`relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${isFocused ? "scale-[1.02] z-10" : "hover:scale-[1.02] hover:brightness-110"}`}
                          style={{
                            background: isFocused
                              ? `linear-gradient(135deg, ${sm.accent}20, ${sm.accent}08)`
                              : "linear-gradient(135deg, rgba(30,24,38,0.9), rgba(20,16,26,0.9))",
                            border: `1.5px solid ${isFocused ? sm.border : "rgba(80,60,100,0.2)"}`,
                            boxShadow: isFocused ? `0 0 18px ${sm.accent}20, inset 0 0 10px ${sm.accent}05` : "none",
                          }}
                        >
                          {/* Inner hover glow */}
                          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 30% 50%, ${sm.accent}08, transparent 70%)` }} />
                          </div>

                          <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 38, height: 38 }}>
                            <svg className="absolute pointer-events-none" style={{
                              top: '50%', left: '50%',
                              transform: 'translate(-50%, -50%)',
                            }} width={ROSTER_FRAME} height={ROSTER_FRAME} overflow="visible">
                              {spellFrameElements({
                                cx: ROSTER_CX, outerR: ROSTER_CX - 2, midR: ROSTER_CX - 4,
                                color: hexToRgba(sm.accent, isFocused ? 0.35 : isSel ? 0.22 : 0.12),
                                dimColor: hexToRgba(sm.accent, isFocused ? 0.18 : isSel ? 0.1 : 0.06),
                                prefix: `sr-${st}`,
                              })}
                            </svg>
                            <SpellSprite type={st} size={34} />
                            {isFocused && (
                              <div className="absolute -inset-1 rounded-full" style={{ boxShadow: `0 0 10px ${sm.accent}25` }} />
                            )}
                          </div>
                          <div className="hidden lg:flex flex-col items-start min-w-0 flex-1">
                            <span className={`text-[10px] font-bold leading-none ${sm.nameColor}`}>
                              {sd.shortName}
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[8px] font-medium" style={{ color: `${sm.accent}90` }}>
                                Lv {lvl + 1}
                              </span>
                              <div className="flex gap-px">
                                {Array.from({ length: MAX_SPELL_UPGRADE_LEVEL }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-1 h-1 rounded-full"
                                    style={{ background: i < lvl ? sm.accent : "rgba(200,200,200,0.15)" }}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[7px] text-purple-400/30 mt-0.5">
                              {sm.trait}
                            </span>
                          </div>
                          {isSel && (
                            <div
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold border-[1.5px] border-stone-900"
                              style={{
                                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                                boxShadow: "0 0 8px rgba(168,85,247,0.5)",
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
                    <div className="h-px mb-3" style={{ background: "linear-gradient(90deg, transparent, rgba(140,80,200,0.15) 30%, rgba(140,80,200,0.15) 70%, transparent)" }} />
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <span className="text-[8px] font-bold text-purple-500/40 uppercase tracking-wider">
                        Loadout
                      </span>
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(140,80,200,0.1), transparent)" }} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((i) =>
                        i < selectedSpells.length ? (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${SPELL_META[selectedSpells[i]].accent}12, rgba(88,28,135,0.1))`,
                              border: `1px solid ${SPELL_META[selectedSpells[i]].accent}25`,
                            }}
                          >
                            <SpellSprite type={selectedSpells[i]} size={16} />
                            <span className="text-[8px] text-purple-200/60 font-medium">
                              {SPELL_DATA[selectedSpells[i]].shortName}
                            </span>
                          </div>
                        ) : (
                          <div
                            key={i}
                            className="w-9 h-9 rounded-lg border border-dashed flex items-center justify-center animate-loadout-idle"
                            style={{ borderColor: "rgba(140,80,200,0.2)", background: "rgba(88,28,135,0.05)" }}
                          >
                            <span className="text-[10px] text-purple-600/25">?</span>
                          </div>
                        )
                      )}
                    </div>
                    {selectedSpells.length === 3 && (
                      <div className="flex items-center gap-1.5 mt-2.5 px-1">
                        <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}>
                          <Check size={8} className="text-green-400" />
                        </div>
                        <span className="text-[8px] text-green-400/50 font-semibold uppercase tracking-wider">
                          Loadout Complete
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
        onDowngradeSpell={downgradeSpell}
      />
    </>
  );
};
