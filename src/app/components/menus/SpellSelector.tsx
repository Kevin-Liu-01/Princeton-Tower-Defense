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
} from "lucide-react";
import type { SpellType } from "../../types";
import { SPELL_DATA } from "../../constants";
import { SpellSprite } from "../../sprites";

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
}

export const SpellSelector: React.FC<SpellSelectorProps> = ({
  selectedSpells,
  toggleSpell,
  hoveredSpell,
  setHoveredSpell,
}) => {
  return (
    <div className="flex-1 relative rounded-lg sm:rounded-xl flex flex-col min-w-0"
  style={{
    background: 'linear-gradient(180deg, rgba(30,22,40,0.97) 0%, rgba(20,14,30,0.99) 100%)',
    border: '1.5px solid rgba(140,80,200,0.35)',
    boxShadow: 'inset 0 0 24px rgba(140,80,200,0.04), 0 4px 24px rgba(0,0,0,0.5)',
  }}>
  {/* Inner border glow */}
  <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(140,80,200,0.08)' }} />
  {/* Header */}
  <div className="px-2 sm:px-3 py-1.5 sm:py-2 relative flex items-center justify-between"
    style={{ background: 'linear-gradient(90deg, rgba(120,60,180,0.15), rgba(80,30,140,0.08), transparent)' }}>
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Sparkles size={11} className="text-purple-400 sm:w-[13px] sm:h-[13px]" />
      <span className="text-[8px] sm:text-[9px] font-bold text-purple-300/90 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
        <span className="hidden sm:inline">Select </span>Spells
      </span>
    </div>
    {/* Spell slots indicator */}
    <div className="flex items-center gap-0.5 sm:gap-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm transition-all duration-300"
          style={{
            background: i < selectedSpells.length
              ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
              : 'rgba(60,40,80,0.4)',
            border: `1px solid ${i < selectedSpells.length ? 'rgba(168,85,247,0.6)' : 'rgba(100,70,140,0.25)'}`,
            boxShadow: i < selectedSpells.length ? '0 0 6px rgba(168,85,247,0.4)' : 'none',
          }} />
      ))}
    </div>
    <div className="absolute bottom-0 left-2 sm:left-3 right-2 sm:right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(140,80,200,0.3) 20%, rgba(180,120,255,0.4) 50%, rgba(140,80,200,0.3) 80%, transparent)' }} />
  </div>
  <div className="p-1.5 sm:p-3 flex-1 flex flex-col justify-between">
    {(() => {
      const spellLabels: Record<string, { name: string; brief: string; nameColor: string; briefColor: string; borderColor: string; cost: number; cooldown: number }> = {
        fireball: { name: "Meteor Shower", brief: "Rain fiery meteors, burning all enemies in area", nameColor: "text-orange-300", briefColor: "text-orange-400/50", borderColor: "rgba(234,88,12,0.4)", cost: 50, cooldown: 15 },
        lightning: { name: "Chain Lightning", brief: "Chain lightning stuns and shocks five enemies", nameColor: "text-yellow-300", briefColor: "text-yellow-400/50", borderColor: "rgba(234,179,8,0.4)", cost: 40, cooldown: 12 },
        freeze: { name: "Arctic Blast", brief: "Freeze every enemy on the map for three seconds", nameColor: "text-cyan-300", briefColor: "text-cyan-400/50", borderColor: "rgba(6,182,212,0.4)", cost: 60, cooldown: 20 },
        payday: { name: "Gold Rush", brief: "Earn bonus Paw Points based on alive enemy count", nameColor: "text-amber-300", briefColor: "text-amber-400/50", borderColor: "rgba(245,158,11,0.4)", cost: 0, cooldown: 30 },
        reinforcements: { name: "Knight Squad", brief: "Summon three armored knights to block and fight", nameColor: "text-emerald-300", briefColor: "text-emerald-400/50", borderColor: "rgba(16,185,129,0.4)", cost: 75, cooldown: 25 },
      };
      return (
        <div className="grid grid-cols-3 sm:flex gap-1 sm:gap-1.5">
          {spellOptions.map((spellType) => {
            const isSelected = selectedSpells.includes(spellType);
            const canSelect = isSelected || selectedSpells.length < 3;
            const spellIndex = selectedSpells.indexOf(spellType);
            const label = spellLabels[spellType];
            return (
              <button
                key={spellType}
                onClick={() => toggleSpell(spellType)}
                onMouseEnter={() => setHoveredSpell(spellType)}
                onMouseLeave={() => setHoveredSpell(null)}
                disabled={!canSelect && !isSelected}
                className={`relative w-full p-1 sm:p-1.5 pb-0.5 sm:pb-1 flex flex-col items-center gap-0.5 rounded-md sm:rounded-lg transition-all duration-200 ${isSelected
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
                <div className="scale-75 sm:scale-100">
                  <SpellSprite type={spellType} size={32} />
                </div>
                {label && (
                  <>
                    <span className={`text-[6.5px] sm:text-[8px] font-semibold leading-none ${label.nameColor}`}>{label.name}</span>
                    <span className={`text-[6.5px] leading-tight text-center hidden sm:block ${label.briefColor}`}>{label.brief}</span>
                    {/* Cost & Cooldown at a glance */}
                    <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                      <span className="text-[6px] sm:text-[7px] font-medium px-0.5 sm:px-1 py-px rounded flex items-center gap-0.5"
                        style={{ background: label.cost > 0 ? 'rgba(120,80,20,0.3)' : 'rgba(20,83,45,0.3)', border: `1px solid ${label.cost > 0 ? 'rgba(120,80,20,0.2)' : 'rgba(20,83,45,0.2)'}` }}>
                        <Coins size={6} className={`sm:w-[7px] sm:h-[7px] ${label.cost > 0 ? "text-amber-400/70" : "text-green-400/70"}`} />
                        <span className={label.cost > 0 ? "text-amber-300/80" : "text-green-300/80"}>{label.cost > 0 ? label.cost : "Free"}</span>
                      </span>
                      <span className="text-[6px] sm:text-[7px] font-medium px-0.5 sm:px-1 py-px rounded flex items-center gap-0.5"
                        style={{ background: 'rgba(30,58,138,0.25)', border: '1px solid rgba(30,58,138,0.2)' }}>
                        <Clock size={6} className="text-blue-400/70 sm:w-[7px] sm:h-[7px]" />
                        <span className="text-blue-300/80">{label.cooldown}s</span>
                      </span>
                    </div>
                  </>
                )}
                {isSelected && (
                  <div className="absolute -top-1 sm:-top-1.5 -right-1 sm:-right-1.5 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] text-white font-bold border sm:border-2 border-stone-900"
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
    <div className="hidden sm:block mt-auto pt-2">
      <div className="h-px mb-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(140,80,200,0.2) 30%, rgba(140,80,200,0.2) 70%, transparent)' }} />
      {selectedSpells.length === 3 ? (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md"
          style={{ background: 'rgba(88,28,135,0.12)', border: '1px solid rgba(88,28,135,0.15)' }}>
          <Sparkles size={10} className="text-purple-400/70 flex-shrink-0" />
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {selectedSpells.map((sp, i) => (
              <React.Fragment key={sp}>
                <div className="flex items-center gap-1">
                  <SpellSprite type={sp} size={14} />
                  <span className="text-[8px] text-purple-200/80 font-medium whitespace-nowrap">{SPELL_DATA[sp].name}</span>
                </div>
                {i < 2 && <span className="text-purple-600/40 text-[8px]">·</span>}
              </React.Fragment>
            ))}
          </div>
          <span className="text-[7px] text-green-400/70 font-semibold uppercase tracking-wider flex-shrink-0">Ready</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md"
          style={{ background: 'rgba(60,40,80,0.12)', border: '1px solid rgba(80,50,120,0.12)' }}>
          <Zap size={10} className="text-purple-500/40 flex-shrink-0" />
          <div className="flex items-center gap-1 flex-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1">
                {i < selectedSpells.length ? (
                  <>
                    <SpellSprite type={selectedSpells[i]} size={14} />
                    <span className="text-[8px] text-purple-200/70 font-medium whitespace-nowrap">{SPELL_DATA[selectedSpells[i]].name}</span>
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
    </div>
  </div>
  {hoveredSpell && (() => {
    const spellInfo: Record<string, {
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
          { label: "Damage", value: "50×10", color: "text-red-300", statBg: "rgba(127,29,29,0.3)", statBorder: "rgba(127,29,29,0.2)", icon: <Swords size={10} className="text-red-400" /> },
          { label: "Radius", value: "150", color: "text-orange-300", statBg: "rgba(124,45,18,0.3)", statBorder: "rgba(124,45,18,0.2)", icon: <Target size={10} className="text-orange-400" /> },
          { label: "Burn", value: "4s", color: "text-amber-300", statBg: "rgba(120,53,15,0.3)", statBorder: "rgba(120,53,15,0.2)", icon: <Flame size={10} className="text-amber-400" /> },
        ],
        effectBg: "rgba(124,45,18,0.15)", effectLabel: "text-orange-500/80", effectText: "text-orange-200/90",
        effect: "Rains 10 meteors in an area. Each deals 50 AoE damage with falloff and sets enemies ablaze for 4 seconds.",
      },
      lightning: {
        panelBg: "rgba(36,30,10,0.99)", panelBorder: "rgba(234,179,8,0.5)",
        headerBg: "linear-gradient(90deg, rgba(180,140,20,0.2), rgba(40,120,140,0.08), transparent)",
        icon: <Zap size={16} className="text-yellow-400" />, accentText: "text-yellow-300",
        stats: [
          { label: "Total DMG", value: "600", color: "text-yellow-300", statBg: "rgba(113,63,18,0.3)", statBorder: "rgba(113,63,18,0.2)", icon: <Swords size={10} className="text-yellow-400" /> },
          { label: "Chains", value: "5", color: "text-cyan-300", statBg: "rgba(22,78,99,0.3)", statBorder: "rgba(22,78,99,0.2)", icon: <Zap size={10} className="text-cyan-400" /> },
          { label: "Stun", value: "0.5s", color: "text-blue-300", statBg: "rgba(30,58,138,0.3)", statBorder: "rgba(30,58,138,0.2)", icon: <Timer size={10} className="text-blue-400" /> },
        ],
        effectBg: "rgba(113,63,18,0.15)", effectLabel: "text-yellow-500/80", effectText: "text-yellow-200/90",
        effect: "Lightning bolt chains between up to 5 enemies, splitting 600 total damage. Each hit stuns for 0.5 seconds.",
      },
      freeze: {
        panelBg: "rgba(10,28,40,0.99)", panelBorder: "rgba(6,182,212,0.5)",
        headerBg: "linear-gradient(90deg, rgba(20,100,140,0.2), rgba(20,60,120,0.08), transparent)",
        icon: <Snowflake size={16} className="text-cyan-400" />, accentText: "text-cyan-300",
        stats: [
          { label: "Duration", value: "3s", color: "text-cyan-300", statBg: "rgba(22,78,99,0.3)", statBorder: "rgba(22,78,99,0.2)", icon: <Timer size={10} className="text-cyan-400" /> },
          { label: "Range", value: "Global", color: "text-blue-300", statBg: "rgba(30,58,138,0.3)", statBorder: "rgba(30,58,138,0.2)", icon: <Target size={10} className="text-blue-400" /> },
          { label: "Slow", value: "100%", color: "text-indigo-300", statBg: "rgba(49,46,129,0.3)", statBorder: "rgba(49,46,129,0.2)", icon: <Snowflake size={10} className="text-indigo-400" /> },
        ],
        effectBg: "rgba(22,78,99,0.15)", effectLabel: "text-cyan-500/80", effectText: "text-cyan-200/90",
        effect: "Expanding ice wave freezes ALL enemies on the map for 3 full seconds. Great for emergencies.",
      },
      payday: {
        panelBg: "rgba(36,28,10,0.99)", panelBorder: "rgba(245,158,11,0.5)",
        headerBg: "linear-gradient(90deg, rgba(160,110,20,0.2), rgba(140,120,10,0.08), transparent)",
        icon: <Coins size={16} className="text-amber-400" />, accentText: "text-amber-300",
        stats: [
          { label: "Base PP", value: "80", color: "text-amber-300", statBg: "rgba(120,53,15,0.3)", statBorder: "rgba(120,53,15,0.2)", icon: <Coins size={10} className="text-amber-400" /> },
          { label: "Per Enemy", value: "+5", color: "text-green-300", statBg: "rgba(20,83,45,0.3)", statBorder: "rgba(20,83,45,0.2)", icon: <TrendingUp size={10} className="text-green-400" /> },
          { label: "Max Total", value: "130", color: "text-yellow-300", statBg: "rgba(113,63,18,0.3)", statBorder: "rgba(113,63,18,0.2)", icon: <Sparkles size={10} className="text-yellow-400" /> },
        ],
        effectBg: "rgba(120,53,15,0.15)", effectLabel: "text-amber-500/80", effectText: "text-amber-200/90",
        effect: "Grants 80 PP plus 5 PP per enemy on the map (max +50 bonus). Use when the field is crowded!",
      },
      reinforcements: {
        panelBg: "rgba(16,30,24,0.99)", panelBorder: "rgba(16,185,129,0.5)",
        headerBg: "linear-gradient(90deg, rgba(20,120,80,0.2), rgba(10,80,50,0.08), transparent)",
        icon: <Shield size={16} className="text-emerald-400" />, accentText: "text-emerald-300",
        stats: [
          { label: "Knights", value: "3", color: "text-emerald-300", statBg: "rgba(6,78,59,0.3)", statBorder: "rgba(6,78,59,0.2)", icon: <Users size={10} className="text-emerald-400" /> },
          { label: "HP Each", value: "500", color: "text-red-300", statBg: "rgba(127,29,29,0.3)", statBorder: "rgba(127,29,29,0.2)", icon: <Heart size={10} className="text-red-400" /> },
          { label: "DMG Each", value: "30", color: "text-orange-300", statBg: "rgba(124,45,18,0.3)", statBorder: "rgba(124,45,18,0.2)", icon: <Swords size={10} className="text-orange-400" /> },
        ],
        effectBg: "rgba(6,78,59,0.15)", effectLabel: "text-emerald-500/80", effectText: "text-emerald-200/90",
        effect: "Summons 3 armored knights at a chosen location. They block and fight enemies until defeated.",
      },
    };
    const info = spellInfo[hoveredSpell];
    if (!info) return null;
    const spell = SPELL_DATA[hoveredSpell];
    return (
      <div className="absolute bottom-full right-0 mb-2 w-72 rounded-xl z-50"
        style={{
          background: `linear-gradient(180deg, ${info.panelBg}, rgba(18,14,10,0.99))`,
          border: `1.5px solid ${info.panelBorder}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.02)',
        }}>
        {/* Inner border glow */}
        <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(255,255,255,0.04)' }} />
        {/* Spell-themed header */}
        <div className="px-3 py-2 rounded-t-xl relative" style={{ background: info.headerBg }}>
          <div className="flex items-center gap-2">
            {info.icon}
            <span className={`font-bold text-sm ${info.accentText}`}>{spell.name}</span>
          </div>
          <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent)' }} />
        </div>
        <div className="px-3 py-2.5">
          {/* Cost & Cooldown */}
          <div className="flex gap-1.5 mb-2">
            <div className="rounded-md px-2 py-1 text-center flex-1"
              style={{ background: 'rgba(120,80,20,0.2)', border: '1px solid rgba(120,80,20,0.2)' }}>
              <div className="text-[7px] text-amber-500/70 font-medium uppercase">Cost</div>
              <div className="text-amber-300 font-bold text-[11px]">
                {spell.cost > 0 ? `${spell.cost} PP` : "FREE"}
              </div>
            </div>
            <div className="rounded-md px-2 py-1 text-center flex-1"
              style={{ background: 'rgba(30,58,138,0.2)', border: '1px solid rgba(30,58,138,0.2)' }}>
              <div className="text-[7px] text-blue-500/70 font-medium uppercase">Cooldown</div>
              <div className="text-blue-300 font-bold text-[11px]">{spell.cooldown / 1000}s</div>
            </div>
          </div>
          {/* Spell-specific stats */}
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {info.stats.map((stat) => (
              <div key={stat.label} className="rounded-md px-1.5 py-1 text-center"
                style={{ background: stat.statBg, border: `1px solid ${stat.statBorder}` }}>
                <div className="flex items-center justify-center mb-0.5">{stat.icon}</div>
                <div className="text-[7px] text-stone-500 font-medium">{stat.label}</div>
                <div className={`font-bold text-[11px] ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>
          {/* Ornate divider */}
          <div className="mb-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />
          {/* Effect description */}
          <div className="rounded-md px-2.5 py-2"
            style={{ background: info.effectBg, border: '1px solid rgba(80,60,50,0.12)' }}>
            <div className={`${info.effectLabel} uppercase text-[7px] font-semibold mb-1 tracking-wider flex items-center gap-1`}>
              <Sparkles size={8} className="opacity-60" />
              How it works
            </div>
            <p className={`text-[10px] ${info.effectText} leading-relaxed`}>{info.effect}</p>
          </div>
        </div>
      </div>
    );
  })()}
    </div>
  );
};
