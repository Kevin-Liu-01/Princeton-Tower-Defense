"use client";

import {
  Eye,
  Shield,
  Sparkles,
  Heart,
  Swords,
  Target,
  Gauge,
  Timer,
  Check,
  Coins,
  Clock,
  Flame,
  Zap,
  Snowflake,
  Users,
  TrendingUp,
} from "lucide-react";
import React, { memo, useState } from "react";

import {
  HERO_DATA,
  HERO_ABILITY_COOLDOWNS,
  SPELL_DATA,
  getFireballSpellStats,
  getLightningSpellStats,
  getFreezeSpellStats,
  getHexWardSpellStats,
  getPaydaySpellStats,
  getReinforcementSpellStats,
  HERO_ROLES,
  SPELL_FULL_THEMES,
} from "../../constants";
import { HeroSprite, HeroAbilityIcon, SpellSprite } from "../../sprites";
import { SpellOrbIcon, EnchantedAnvilIcon } from "../../sprites/custom-icons";
import type { HeroType, SpellType, SpellUpgradeLevels } from "../../types";
import {
  heroFrameElements,
  spellFrameElements,
} from "../ui/primitives/ornateFrameHelpers";
import { SpellUpgradeModal } from "../ui/SpellUpgradeModal";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { hexToRgba } from "./shared/colorUtils";
import { HERO_OPTIONS, MENU_SPELL_OPTIONS } from "./shared/loadoutOptions";

const getHeroRoleLabel = (type: HeroType): string => HERO_ROLES[type].label;

const HERO_STAT_CONFIG = [
  { bg: "rgba(127,29,29,0.2)", Icon: Heart, iconClass: "text-red-400" },
  { bg: "rgba(124,45,18,0.2)", Icon: Swords, iconClass: "text-orange-400" },
  { bg: "rgba(30,58,138,0.2)", Icon: Target, iconClass: "text-blue-400" },
  { bg: "rgba(20,83,45,0.2)", Icon: Gauge, iconClass: "text-green-400" },
  { bg: "rgba(88,28,135,0.2)", Icon: Timer, iconClass: "text-purple-400" },
] as const;

interface MobileLoadoutBarProps {
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType) => void;
  selectedSpells: SpellType[];
  toggleSpell: (spell: SpellType) => void;
  availableSpellStars: number;
  totalSpellStarsEarned: number;
  spentSpellStars: number;
  spellUpgradeLevels: SpellUpgradeLevels;
  upgradeSpell: (spellType: SpellType) => void;
  downgradeSpell: (spellType: SpellType) => void;
}

export const MobileLoadoutBar = memo(function MobileLoadoutBar({
  selectedHero,
  setSelectedHero,
  selectedSpells,
  toggleSpell,
  availableSpellStars,
  totalSpellStarsEarned,
  spentSpellStars,
  spellUpgradeLevels,
  upgradeSpell,
  downgradeSpell,
}: MobileLoadoutBarProps) {
  const [showHeroSheet, setShowHeroSheet] = useState(false);
  const [showSpellSheet, setShowSpellSheet] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <>
      {/* Floating circle buttons */}
      <div className="flex items-end justify-between w-full px-3 pb-3">
        {/* Left: Hero circle */}
        <HeroCircleButton
          selectedHero={selectedHero}
          onClick={() => setShowHeroSheet(true)}
        />

        {/* Right: Spells + Upgrades */}
        <div className="flex items-end gap-2.5">
          <SpellCircleButton
            selectedCount={selectedSpells.length}
            onClick={() => setShowSpellSheet(true)}
          />
          <UpgradeCircleButton
            availableStars={availableSpellStars}
            onClick={() => setShowUpgradeModal(true)}
          />
        </div>
      </div>

      {/* Hero Selection Sheet */}
      <MobileBottomSheet
        isOpen={showHeroSheet}
        onClose={() => setShowHeroSheet(false)}
        title="Choose Champion"
        titleIcon={<Shield size={14} className="text-amber-400" />}
        accentColor="rgba(180,140,60,0.4)"
      >
        <HeroSelectionContent
          selectedHero={selectedHero}
          setSelectedHero={(hero) => {
            setSelectedHero(hero);
            setShowHeroSheet(false);
          }}
        />
      </MobileBottomSheet>

      {/* Spell Selection Sheet */}
      <MobileBottomSheet
        isOpen={showSpellSheet}
        onClose={() => setShowSpellSheet(false)}
        title="Arcane Spells"
        titleIcon={<Sparkles size={14} className="text-purple-400" />}
        accentColor="rgba(140,80,200,0.4)"
      >
        <SpellSelectionContent
          selectedSpells={selectedSpells}
          toggleSpell={toggleSpell}
          spellUpgradeLevels={spellUpgradeLevels}
        />
      </MobileBottomSheet>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <SpellUpgradeModal
          isOpen
          onClose={() => setShowUpgradeModal(false)}
          availableStars={availableSpellStars}
          totalStarsEarned={totalSpellStarsEarned}
          spentStars={spentSpellStars}
          spellUpgradeLevels={spellUpgradeLevels}
          onUpgradeSpell={upgradeSpell}
          onDowngradeSpell={downgradeSpell}
        />
      )}
    </>
  );
});

MobileLoadoutBar.displayName = "MobileLoadoutBar";

// ── Circle Buttons ─────────────────────────────────────────────────────────

const CIRCLE_SIZE = 56;
const FRAME_SIZE = CIRCLE_SIZE + 20;
const FRAME_PAD = (FRAME_SIZE - CIRCLE_SIZE) / 2;
const FRAME_CX = FRAME_SIZE / 2;
const FRAME_OUTER_R = FRAME_CX - 2;
const FRAME_MID_R = FRAME_CX - 4;

function HeroCircleButton({
  selectedHero,
  onClick,
}: {
  selectedHero: HeroType | null;
  onClick: () => void;
}) {
  const hero = selectedHero ? HERO_DATA[selectedHero] : null;
  const hc = hero ? hero.color : "#b4a04a";

  return (
    <div
      className="relative"
      style={{ height: CIRCLE_SIZE, width: CIRCLE_SIZE }}
    >
      <svg
        className="absolute pointer-events-none"
        style={{ left: -FRAME_PAD, top: -FRAME_PAD }}
        width={FRAME_SIZE}
        height={FRAME_SIZE}
        overflow="visible"
      >
        {heroFrameElements({
          color: hexToRgba(hc, 0.3),
          cx: FRAME_CX,
          dimColor: hexToRgba(hc, 0.12),
          midR: FRAME_MID_R,
          outerR: FRAME_OUTER_R,
          prefix: "lh",
        })}
      </svg>

      <button
        onClick={onClick}
        className="absolute inset-0 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{
          background: hero
            ? `radial-gradient(circle at 32% 32%, ${hc}35, ${hc}12)`
            : "linear-gradient(135deg, rgba(38,32,24,0.95), rgba(24,20,14,0.95))",
          border: `2px solid ${hexToRgba(hc, 0.5)}`,
          boxShadow: `0 0 16px ${hexToRgba(hc, 0.15)}, 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        {selectedHero ? (
          <HeroSprite type={selectedHero} size={38} />
        ) : (
          <Shield size={24} className="text-amber-400/60" />
        )}
      </button>

      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full text-[6px] font-bold uppercase tracking-wider whitespace-nowrap z-20"
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(hc, 0.1)}, rgba(20,16,10,0.92))`,
          border: `1px solid ${hexToRgba(hc, 0.35)}`,
          color: hc,
        }}
      >
        {selectedHero ? getHeroRoleLabel(selectedHero) : "Hero"}
      </div>
    </div>
  );
}

function SpellCircleButton({
  selectedCount,
  onClick,
}: {
  selectedCount: number;
  onClick: () => void;
}) {
  const isFull = selectedCount === 3;
  const sc = "#a855f7";

  return (
    <div
      className="relative"
      style={{ height: CIRCLE_SIZE, width: CIRCLE_SIZE }}
    >
      <svg
        className="absolute pointer-events-none"
        style={{ left: -FRAME_PAD, top: -FRAME_PAD }}
        width={FRAME_SIZE}
        height={FRAME_SIZE}
        overflow="visible"
      >
        {spellFrameElements({
          color: isFull ? hexToRgba(sc, 0.35) : hexToRgba(sc, 0.18),
          cx: FRAME_CX,
          dimColor: isFull ? hexToRgba(sc, 0.15) : hexToRgba(sc, 0.08),
          midR: FRAME_MID_R,
          outerR: FRAME_OUTER_R,
          prefix: "ls",
        })}
      </svg>

      <button
        onClick={onClick}
        className="absolute inset-0 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{
          background: isFull
            ? "radial-gradient(ellipse 90% 90% at 34% 32%, rgba(120,50,200,0.25), rgba(80,20,150,0.15))"
            : "radial-gradient(ellipse 90% 90% at 34% 32%, rgba(30,22,40,0.95), rgba(20,14,30,0.95))",
          border: `2px solid ${isFull ? "rgba(168,85,247,0.6)" : "rgba(140,80,200,0.4)"}`,
          boxShadow: `0 0 16px rgba(140,80,200,0.15), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        <SpellOrbIcon size={30} active={isFull} />
      </button>

      <div
        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 z-20"
        style={{
          background: isFull
            ? "linear-gradient(135deg, #22c55e, #16a34a)"
            : "linear-gradient(135deg, #a855f7, #7c3aed)",
          borderColor: "rgba(20,14,30,0.9)",
          boxShadow: isFull
            ? "0 0 8px rgba(34,197,94,0.5)"
            : "0 0 8px rgba(168,85,247,0.5)",
          color: "white",
        }}
      >
        {selectedCount}
      </div>

      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full text-[6px] font-bold uppercase tracking-wider whitespace-nowrap z-20"
        style={{
          background: isFull
            ? `linear-gradient(180deg, rgba(120,50,200,0.15), rgba(20,14,30,0.92))`
            : "rgba(20,14,30,0.92)",
          border: `1px solid ${isFull ? "rgba(168,85,247,0.45)" : "rgba(140,80,200,0.3)"}`,
          color: isFull ? "#a855f7" : "rgba(168,85,247,0.6)",
        }}
      >
        Spells
      </div>
    </div>
  );
}

function UpgradeCircleButton({
  availableStars,
  onClick,
}: {
  availableStars: number;
  onClick: () => void;
}) {
  const hasStars = availableStars > 0;
  const gc = "#facc15";

  return (
    <div
      className="relative"
      style={{ height: CIRCLE_SIZE, width: CIRCLE_SIZE }}
    >
      <svg
        className="absolute pointer-events-none"
        style={{ left: -FRAME_PAD, top: -FRAME_PAD }}
        width={FRAME_SIZE}
        height={FRAME_SIZE}
        overflow="visible"
      >
        {spellFrameElements({
          color: hasStars ? hexToRgba(gc, 0.3) : "rgba(180,150,60,0.14)",
          cx: FRAME_CX,
          dimColor: hasStars ? hexToRgba(gc, 0.12) : "rgba(180,150,60,0.06)",
          midR: FRAME_MID_R,
          outerR: FRAME_OUTER_R,
          prefix: "lu",
        })}
      </svg>

      <button
        onClick={onClick}
        className="absolute inset-0 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{
          background: hasStars
            ? "radial-gradient(ellipse 90% 90% at 34% 32%, rgba(98,72,18,0.45), rgba(72,52,12,0.35))"
            : "radial-gradient(ellipse 90% 90% at 34% 32%, rgba(38,34,20,0.95), rgba(24,20,12,0.95))",
          border: `2px solid ${hasStars ? "rgba(250,204,21,0.5)" : "rgba(180,150,60,0.3)"}`,
          boxShadow: hasStars
            ? "0 0 16px rgba(250,204,21,0.15), 0 4px 16px rgba(0,0,0,0.5), inset 0 0 12px rgba(250,204,21,0.08)"
            : "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <EnchantedAnvilIcon size={28} active={hasStars} />
      </button>

      {hasStars && (
        <div
          className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 z-20"
          style={{
            background: "linear-gradient(135deg, #fbbf24, #d97706)",
            borderColor: "rgba(38,34,20,0.9)",
            boxShadow: "0 0 8px rgba(251,191,36,0.5)",
            color: "white",
          }}
        >
          {availableStars}
        </div>
      )}

      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full text-[6px] font-bold uppercase tracking-wider whitespace-nowrap z-20"
        style={{
          background: hasStars
            ? "linear-gradient(180deg, rgba(98,72,18,0.15), rgba(24,20,12,0.92))"
            : "rgba(24,20,12,0.9)",
          border: `1px solid ${hasStars ? "rgba(250,204,21,0.4)" : "rgba(180,150,60,0.25)"}`,
          color: hasStars ? "#fbbf24" : "rgba(180,150,60,0.5)",
        }}
      >
        Upgrade
      </div>
    </div>
  );
}

// ── Sheet Content Components ───────────────────────────────────────────────

function HeroSelectionContent({
  selectedHero,
  setSelectedHero,
}: {
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType) => void;
}) {
  return (
    <div className="space-y-2">
      {HERO_OPTIONS.map((heroType) => {
        const hero = HERO_DATA[heroType];
        const isSelected = selectedHero === heroType;
        const cooldown = HERO_ABILITY_COOLDOWNS[heroType];

        return (
          <button
            key={heroType}
            onClick={() => setSelectedHero(heroType)}
            className="w-full rounded-xl p-2.5 flex items-center gap-3 transition-all active:scale-[0.98]"
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${hero.color}25, ${hero.color}10)`
                : "linear-gradient(135deg, rgba(38,34,30,0.6), rgba(24,20,16,0.6))",
              border: `1.5px solid ${isSelected ? hero.color : "rgba(80,70,50,0.2)"}`,
              boxShadow: isSelected
                ? `0 0 12px ${hero.color}20, inset 0 0 8px ${hero.color}08`
                : "none",
            }}
          >
            {/* Hero sprite */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${hero.color}20, ${hero.color}08)`,
                border: `1.5px solid ${hero.color}40`,
              }}
            >
              <HeroSprite type={heroType} size={36} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-amber-200">
                  {hero.name}
                </span>
                <span
                  className="text-[7px] font-semibold px-1.5 py-px rounded-full uppercase tracking-wider"
                  style={{
                    background: `${hero.color}20`,
                    border: `1px solid ${hero.color}30`,
                    color: hero.color,
                  }}
                >
                  {getHeroRoleLabel(heroType)}
                </span>
              </div>

              {/* Stats strip */}
              <div
                className="flex items-center gap-0 mt-1 rounded overflow-hidden"
                style={{ border: "1px solid rgba(100,80,50,0.12)" }}
              >
                {HERO_STAT_CONFIG.map((cfg, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex items-center justify-center gap-0.5 py-0.5"
                    style={{
                      background: cfg.bg,
                      borderRight:
                        idx < 4 ? "1px solid rgba(100,80,50,0.08)" : "none",
                    }}
                  >
                    <cfg.Icon size={7} className={cfg.iconClass} />
                    <span className="text-[7px] font-bold text-amber-200/80">
                      {
                        [
                          hero.hp,
                          hero.damage,
                          hero.range,
                          hero.speed,
                          `${cooldown / 1000}s`,
                        ][idx]
                      }
                    </span>
                  </div>
                ))}
              </div>

              {/* Ability */}
              <div className="flex items-center gap-1 mt-1">
                <HeroAbilityIcon type={heroType} size={8} />
                <span className="text-[7px] font-semibold text-purple-300/80">
                  {hero.ability}:
                </span>
                <span className="text-[7px] text-purple-200/50 truncate">
                  {hero.abilityDesc}
                </span>
              </div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${hero.color}, ${hero.color}cc)`,
                  boxShadow: `0 0 8px ${hero.color}50`,
                }}
              >
                <Check size={14} className="text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SpellSelectionContent({
  selectedSpells,
  toggleSpell,
  spellUpgradeLevels,
}: {
  selectedSpells: SpellType[];
  toggleSpell: (spell: SpellType) => void;
  spellUpgradeLevels: SpellUpgradeLevels;
}) {
  return (
    <div className="space-y-2">
      {/* Slot indicator */}
      <div className="flex items-center justify-center gap-2 mb-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm transition-all"
            style={{
              background:
                i < selectedSpells.length
                  ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                  : "rgba(60,40,80,0.4)",
              border: `1px solid ${
                i < selectedSpells.length
                  ? "rgba(168,85,247,0.6)"
                  : "rgba(100,70,140,0.25)"
              }`,
              boxShadow:
                i < selectedSpells.length
                  ? "0 0 6px rgba(168,85,247,0.4)"
                  : "none",
            }}
          />
        ))}
        <span className="text-[9px] font-bold text-purple-300/60 ml-1">
          {selectedSpells.length}/3 Selected
        </span>
      </div>

      {MENU_SPELL_OPTIONS.map((spellType) => {
        const spell = SPELL_DATA[spellType];
        const isSelected = selectedSpells.includes(spellType);
        const selectionIndex = selectedSpells.indexOf(spellType);
        const colors = SPELL_FULL_THEMES[spellType];
        const spellLevel = spellUpgradeLevels[spellType] ?? 0;
        const stats = getSpellStatsForType(spellType, spellLevel);

        return (
          <button
            key={spellType}
            onClick={() => toggleSpell(spellType)}
            className="w-full rounded-xl p-2.5 transition-all active:scale-[0.98] text-left"
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${colors.bg}, ${colors.bg})`
                : "linear-gradient(135deg, rgba(30,22,38,0.6), rgba(20,14,28,0.6))",
              border: `1.5px solid ${isSelected ? colors.border : "rgba(70,40,100,0.2)"}`,
              boxShadow: isSelected ? `0 0 12px ${colors.accent}15` : "none",
            }}
          >
            {/* Top row: sprite + name + level + selection */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: colors.bg,
                  border: `1.5px solid ${colors.border}`,
                }}
              >
                <SpellSprite type={spellType} size={30} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-200">
                    {spell.name}
                  </span>
                  <span
                    className="text-[7px] font-bold px-1 py-px rounded border"
                    style={{
                      background: "rgba(113,63,18,0.3)",
                      borderColor: "rgba(250,204,21,0.25)",
                      color: "#fde047",
                    }}
                  >
                    Lv {spellLevel + 1}
                  </span>
                </div>
                <p className="text-[8px] text-stone-400/80 leading-snug mt-0.5">
                  {spell.desc}
                </p>
              </div>

              {isSelected ? (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                    boxShadow: "0 0 8px rgba(168,85,247,0.5)",
                  }}
                >
                  {selectionIndex + 1}
                </div>
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border border-dashed"
                  style={{ borderColor: "rgba(140,80,200,0.3)" }}
                >
                  <span className="text-[8px] text-purple-500/40">+</span>
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div
              className="flex items-center gap-0 rounded overflow-hidden"
              style={{ border: "1px solid rgba(100,70,140,0.12)" }}
            >
              {/* Cost */}
              <div
                className="flex-1 flex items-center justify-center gap-0.5 py-1"
                style={{
                  background:
                    spell.cost > 0
                      ? "rgba(120,80,20,0.2)"
                      : "rgba(20,83,45,0.2)",
                  borderRight: "1px solid rgba(100,70,140,0.08)",
                }}
              >
                <Coins
                  size={8}
                  className={
                    spell.cost > 0 ? "text-amber-400/70" : "text-green-400/70"
                  }
                />
                <span
                  className={`text-[8px] font-bold ${spell.cost > 0 ? "text-amber-300/80" : "text-green-300/80"}`}
                >
                  {spell.cost > 0 ? `${spell.cost} PP` : "Free"}
                </span>
              </div>
              {/* Cooldown */}
              <div
                className="flex-1 flex items-center justify-center gap-0.5 py-1"
                style={{
                  background: "rgba(30,58,138,0.15)",
                  borderRight: "1px solid rgba(100,70,140,0.08)",
                }}
              >
                <Clock size={8} className="text-blue-400/70" />
                <span className="text-[8px] font-bold text-blue-300/80">
                  {spell.cooldown / 1000}s
                </span>
              </div>
              {/* Spell-specific stats */}
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex items-center justify-center gap-0.5 py-1"
                  style={{
                    background: stat.bg,
                    borderRight:
                      idx < stats.length - 1
                        ? "1px solid rgba(100,70,140,0.08)"
                        : "none",
                  }}
                >
                  <stat.Icon size={8} className={stat.iconClass} />
                  <span className={`text-[8px] font-bold ${stat.textColor}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface SpellStatDisplay {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  value: string;
  textColor: string;
  bg: string;
}

function getSpellStatsForType(
  spellType: SpellType,
  level: number
): SpellStatDisplay[] {
  switch (spellType) {
    case "fireball": {
      const s = getFireballSpellStats(level);
      return [
        {
          Icon: Flame,
          iconClass: "text-orange-400/70",
          bg: "rgba(124,45,18,0.15)",
          textColor: "text-orange-300/80",
          value: `${s.damagePerMeteor}×${s.meteorCount}`,
        },
        {
          Icon: Target,
          iconClass: "text-red-400/70",
          bg: "rgba(127,29,29,0.15)",
          textColor: "text-red-300/80",
          value: `${s.impactRadius}`,
        },
        {
          Icon: Timer,
          iconClass: "text-amber-400/70",
          bg: "rgba(120,53,15,0.15)",
          textColor: "text-amber-300/80",
          value: `${(s.burnDurationMs / 1000).toFixed(1)}s`,
        },
      ];
    }
    case "lightning": {
      const s = getLightningSpellStats(level);
      return [
        {
          Icon: Zap,
          iconClass: "text-yellow-400/70",
          bg: "rgba(113,63,18,0.15)",
          textColor: "text-yellow-300/80",
          value: `${s.totalDamage}`,
        },
        {
          Icon: TrendingUp,
          iconClass: "text-cyan-400/70",
          bg: "rgba(22,78,99,0.15)",
          textColor: "text-cyan-300/80",
          value: `${s.chainCount}ch`,
        },
        {
          Icon: Timer,
          iconClass: "text-blue-400/70",
          bg: "rgba(30,58,138,0.15)",
          textColor: "text-blue-300/80",
          value: `${(s.stunDurationMs / 1000).toFixed(2)}s`,
        },
      ];
    }
    case "freeze": {
      const s = getFreezeSpellStats(level);
      return [
        {
          Icon: Snowflake,
          iconClass: "text-cyan-400/70",
          bg: "rgba(22,78,99,0.15)",
          textColor: "text-cyan-300/80",
          value: `${(s.freezeDurationMs / 1000).toFixed(1)}s`,
        },
        {
          Icon: Target,
          iconClass: "text-indigo-400/70",
          bg: "rgba(49,46,129,0.15)",
          textColor: "text-indigo-300/80",
          value: s.isGlobal ? "Global" : `${s.maxTargets} max`,
        },
      ];
    }
    case "hex_ward": {
      const s = getHexWardSpellStats(level);
      return [
        {
          Icon: Users,
          iconClass: "text-fuchsia-400/70",
          bg: "rgba(88,28,135,0.15)",
          textColor: "text-fuchsia-300/80",
          value: `${s.maxReanimations} raise`,
        },
        {
          Icon: Eye,
          iconClass: "text-purple-400/70",
          bg: "rgba(76,29,149,0.15)",
          textColor: "text-purple-300/80",
          value: `${s.maxTargets} mark`,
        },
        {
          Icon: Timer,
          iconClass: "text-violet-400/70",
          bg: "rgba(91,33,182,0.15)",
          textColor: "text-violet-300/80",
          value: `${(s.durationMs / 1000).toFixed(0)}s`,
        },
      ];
    }
    case "payday": {
      const s = getPaydaySpellStats(level);
      return [
        {
          Icon: Coins,
          iconClass: "text-amber-400/70",
          bg: "rgba(120,53,15,0.15)",
          textColor: "text-amber-300/80",
          value: `${s.basePayout}`,
        },
        {
          Icon: TrendingUp,
          iconClass: "text-green-400/70",
          bg: "rgba(20,83,45,0.15)",
          textColor: "text-green-300/80",
          value: `+${s.bonusPerEnemy}/e`,
        },
        {
          Icon: Timer,
          iconClass: "text-yellow-400/70",
          bg: "rgba(113,63,18,0.15)",
          textColor: "text-yellow-300/80",
          value: `${s.auraDurationMs / 1000}s`,
        },
      ];
    }
    case "reinforcements": {
      const s = getReinforcementSpellStats(level);
      return [
        {
          Icon: Users,
          iconClass: "text-emerald-400/70",
          bg: "rgba(6,78,59,0.15)",
          textColor: "text-emerald-300/80",
          value: `×${s.knightCount}`,
        },
        {
          Icon: Heart,
          iconClass: "text-red-400/70",
          bg: "rgba(127,29,29,0.15)",
          textColor: "text-red-300/80",
          value: `${s.knightHp}`,
        },
        {
          Icon: Swords,
          iconClass: "text-orange-400/70",
          bg: "rgba(124,45,18,0.15)",
          textColor: "text-orange-300/80",
          value: `${s.knightDamage}`,
        },
      ];
    }
  }
}
