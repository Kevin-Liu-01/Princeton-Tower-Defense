"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChessRook,
  Crown,
  Info,
  Skull,
  Sparkles,
  Swords,
} from "lucide-react";
import type { HeroType, SpellType, SpellUpgradeLevels } from "../../../types";
import { GOLD, dividerGradient, panelGradient } from "../../ui/system/theme";
import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { HeroSelector } from "../HeroSelector";
import { SpellSelector } from "../SpellSelector";
import type { CodexTabId } from "../CodexModal";

interface WorldMapDesktopLoadoutProps {
  loadoutCompact: boolean;
  setLoadoutCompact: (compact: boolean) => void;
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType | null) => void;
  hoveredHero: HeroType | null;
  setHoveredHero: (hero: HeroType | null) => void;
  selectedSpells: SpellType[];
  toggleSpell: (spell: SpellType) => void;
  hoveredSpell: SpellType | null;
  setHoveredSpell: (spell: SpellType | null) => void;
  availableSpellStars: number;
  totalSpellStarsEarned: number;
  spentSpellStars: number;
  spellUpgradeLevels: SpellUpgradeLevels;
  upgradeSpell: (spellType: SpellType) => void;
  downgradeSpell: (spellType: SpellType) => void;
  spellAutoAim: Partial<Record<SpellType, boolean>>;
  onToggleSpellAutoAim: (spellType: SpellType) => void;
  onOpenCodex: (tab: CodexTabId) => void;
  onSelectBattleShortcut: () => void;
}

const COMPACT_ACTIONS: Array<{
  label: string;
  tab: CodexTabId | null;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  glow: string;
}> = [
  { label: "Towers", tab: "towers", icon: <ChessRook size={13} />, color: "#fcd34d", bg: "rgba(120,85,20,0.45)", border: "rgba(180,140,60,0.35)", glow: "rgba(180,140,60,0.2)" },
  { label: "Heroes", tab: "heroes", icon: <Crown size={13} />, color: "#fcd34d", bg: "rgba(120,85,20,0.45)", border: "rgba(180,140,60,0.35)", glow: "rgba(180,140,60,0.2)" },
  { label: "Spells", tab: "spells", icon: <Sparkles size={13} />, color: "#d8b4fe", bg: "rgba(80,40,120,0.4)", border: "rgba(140,80,200,0.35)", glow: "rgba(140,80,200,0.2)" },
  { label: "Enemies", tab: "enemies", icon: <Skull size={13} />, color: "#fca5a5", bg: "rgba(100,30,30,0.4)", border: "rgba(180,60,60,0.35)", glow: "rgba(180,60,60,0.2)" },
  { label: "FAQ", tab: "guide", icon: <Info size={13} />, color: "#93c5fd", bg: "rgba(30,60,120,0.4)", border: "rgba(60,100,200,0.35)", glow: "rgba(60,100,200,0.2)" },
  { label: "Battle", tab: null, icon: <Swords size={13} />, color: "#fbbf24", bg: "rgba(160,110,25,0.6)", border: "rgba(200,160,60,0.5)", glow: "rgba(200,160,60,0.2)" },
];

const EXPANDED_ACTIONS = COMPACT_ACTIONS.filter((action) => action.tab !== null);

function QuickActionButton({
  label,
  color,
  bg,
  border,
  glow,
  icon,
  onClick,
  showTooltip = false,
}: {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  icon: React.ReactNode;
  onClick: () => void;
  showTooltip?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative group flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-115 hover:brightness-130 ${showTooltip ? "" : ""}`}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${bg}, rgba(20,16,10,0.8))`,
        border: `1.5px solid ${border}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.4), 0 0 8px ${glow}`,
        color,
      }}
      title={label}
    >
      {icon}
      {showTooltip && (
        <span
          className="absolute left-full ml-2 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
          style={{ background: "rgba(20,16,10,0.95)", border: `1px solid ${border}`, color }}
        >
          {label}
        </span>
      )}
    </button>
  );
}

export function WorldMapDesktopLoadout({
  loadoutCompact,
  setLoadoutCompact,
  selectedHero,
  setSelectedHero,
  hoveredHero,
  setHoveredHero,
  selectedSpells,
  toggleSpell,
  hoveredSpell,
  setHoveredSpell,
  availableSpellStars,
  totalSpellStarsEarned,
  spentSpellStars,
  spellUpgradeLevels,
  upgradeSpell,
  downgradeSpell,
  spellAutoAim,
  onToggleSpellAutoAim,
  onOpenCodex,
  onSelectBattleShortcut,
}: WorldMapDesktopLoadoutProps) {
  return (
    <div className="hidden xl:block flex-shrink-0 px-1.5 sm:px-3 pb-1.5 sm:pb-3">
      <OrnateFrame
        className="rounded-xl border-2 border-amber-600/50 shadow-xl overflow-hidden"
        cornerSize={20}
        borderVariant="compact"
        showBorders={true}
        showSideBorders={true}
        showTopBottomBorders={false}
      >
        <div
          className="relative"
          style={{
            background: panelGradient,
            boxShadow: `inset 0 0 20px ${GOLD.glow04}`,
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px opacity-50" style={{ background: dividerGradient }} />

          {loadoutCompact ? (
            <div className="flex items-stretch gap-2 px-3 py-2">
              <div className="grid grid-cols-3 gap-1.5 flex-shrink-0 self-center overflow-visible">
                {COMPACT_ACTIONS.map((item) => (
                  <QuickActionButton
                    key={item.label}
                    {...item}
                    onClick={() => {
                      if (item.tab) {
                        onOpenCodex(item.tab);
                        return;
                      }
                      onSelectBattleShortcut();
                    }}
                  />
                ))}
              </div>

              <div className="w-px h-8 flex-shrink-0 self-center" style={{ background: "linear-gradient(180deg, transparent, rgba(180,140,60,0.3), transparent)" }} />

              <HeroSelector
                selectedHero={selectedHero}
                setSelectedHero={(hero) => setSelectedHero(hero)}
                hoveredHero={hoveredHero}
                setHoveredHero={setHoveredHero}
                onOpenCodex={() => onOpenCodex("heroes")}
                compact
              />

              <div className="w-px h-8 flex-shrink-0 self-center" style={{ background: "linear-gradient(180deg, transparent, rgba(140,80,200,0.3), transparent)" }} />

              <SpellSelector
                selectedSpells={selectedSpells}
                toggleSpell={toggleSpell}
                hoveredSpell={hoveredSpell}
                setHoveredSpell={setHoveredSpell}
                availableSpellStars={availableSpellStars}
                totalSpellStarsEarned={totalSpellStarsEarned}
                spentSpellStars={spentSpellStars}
                spellUpgradeLevels={spellUpgradeLevels}
                upgradeSpell={upgradeSpell}
                downgradeSpell={downgradeSpell}
                spellAutoAim={spellAutoAim}
                onToggleSpellAutoAim={onToggleSpellAutoAim}
                onOpenCodex={() => onOpenCodex("spells")}
                compact
              />

              <button
                onClick={() => setLoadoutCompact(false)}
                className="absolute bottom-0 right-0 flex-shrink-0 self-center p-1 pr-2 pb-2 rounded-tl-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:brightness-125"
                style={{
                  background: "radial-gradient(circle at 30% 30%, rgba(120,85,20,0.4), rgba(20,16,10,0.8))",
                  border: "1.5px solid rgba(180,140,60,0.35)",
                  boxShadow: "0 0 6px rgba(180,140,60,0.12)",
                }}
                title="Expand loadout"
              >
                <ChevronLeft size={12} className="text-amber-400/70" />
              </button>
            </div>
          ) : (
            <div className="flex items-stretch gap-2 pl-3 py-2">
              <div className="flex flex-col flex-shrink-0 relative">
                <div className="flex flex-col items-center gap-1.5 py-1">
                  {EXPANDED_ACTIONS.map((item) => (
                    <QuickActionButton
                      key={item.label}
                      {...item}
                      onClick={() => onOpenCodex(item.tab!)}
                      showTooltip
                    />
                  ))}
                  <QuickActionButton
                    label="Battle"
                    color="#fbbf24"
                    bg="rgba(160,110,25,0.6)"
                    border="rgba(200,160,60,0.5)"
                    glow="rgba(200,160,60,0.2)"
                    icon={<Swords size={13} />}
                    onClick={onSelectBattleShortcut}
                    showTooltip
                  />
                </div>
              </div>

              <HeroSelector
                selectedHero={selectedHero}
                setSelectedHero={(hero) => setSelectedHero(hero)}
                hoveredHero={hoveredHero}
                setHoveredHero={setHoveredHero}
                onOpenCodex={() => onOpenCodex("heroes")}
              />

              <SpellSelector
                selectedSpells={selectedSpells}
                toggleSpell={toggleSpell}
                hoveredSpell={hoveredSpell}
                setHoveredSpell={setHoveredSpell}
                availableSpellStars={availableSpellStars}
                totalSpellStarsEarned={totalSpellStarsEarned}
                spentSpellStars={spentSpellStars}
                spellUpgradeLevels={spellUpgradeLevels}
                upgradeSpell={upgradeSpell}
                downgradeSpell={downgradeSpell}
                spellAutoAim={spellAutoAim}
                onToggleSpellAutoAim={onToggleSpellAutoAim}
                onOpenCodex={() => onOpenCodex("spells")}
              />

              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <button
                  onClick={() => setLoadoutCompact(true)}
                  className="absolute bottom-0 right-0 flex-shrink-0 self-center p-1 pr-2 pb-2 rounded-tl-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:brightness-125"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(60,50,35,0.5), rgba(20,16,10,0.8))",
                    border: "1.5px solid rgba(100,80,50,0.3)",
                  }}
                  title="Compact loadout"
                >
                  <ChevronRight size={12} className="text-amber-400/60" />
                </button>
              </div>
            </div>
          )}

          <div className="h-px opacity-40" style={{ background: dividerGradient }} />
        </div>
      </OrnateFrame>
    </div>
  );
}
