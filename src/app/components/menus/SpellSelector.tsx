"use client";
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
import React, { useCallback } from "react";

import { SPELL_DATA, SPELL_ACCENTS, SPELL_TRAITS } from "../../constants";
import { SpellSprite } from "../../sprites";
import { SpellOrbIcon, EnchantedAnvilIcon } from "../../sprites/custom-icons";
import type { SpellType, SpellUpgradeLevels } from "../../types";
import { spellFrameElements } from "../ui/primitives/ornateFrameHelpers";
import { SpellUpgradeModal } from "../ui/SpellUpgradeModal";
import { HudTooltip } from "../ui/tooltips/HudTooltip";
import { hexToRgba } from "./shared/colorUtils";
import { MENU_SPELL_OPTIONS } from "./shared/loadoutOptions";
import { circularDiff } from "./shared/menuMath";
import { SpellbookModal } from "./SpellbookModal";

const CIRCLE = 42;
const GAP = 6;
const STEP = CIRCLE + GAP;
const VISIBLE_COUNT = 3;
const VP_W = VISIBLE_COUNT * CIRCLE + (VISIBLE_COUNT - 1) * GAP;
const VP_H = CIRCLE + 20;
const VP_CX = VP_W / 2;
const VP_CY = VP_H / 2;

const SEL_FRAME = 58;
const SEL_CX = SEL_FRAME / 2;

const ACT_FRAME = 54;
const ACT_CX = ACT_FRAME / 2;

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
  downgradeSpell: (spellType: SpellType) => void;
  spellAutoAim: Partial<Record<SpellType, boolean>>;
  onToggleSpellAutoAim: (spellType: SpellType) => void;
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
  downgradeSpell,
  spellAutoAim,
  onToggleSpellAutoAim,
  onOpenCodex,
  compact = false,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [showSpellbook, setShowSpellbook] = React.useState(false);
  const [spellbookInitialSpell, setSpellbookInitialSpell] = React.useState<
    SpellType | undefined
  >();
  const [centerIdx, setCenterIdx] = React.useState(0);
  const [sbHovered, setSbHovered] = React.useState(false);
  const [ugHovered, setUgHovered] = React.useState(false);

  const navigate = useCallback((dir: -1 | 1) => {
    setCenterIdx(
      (prev) =>
        (prev + dir + MENU_SPELL_OPTIONS.length) % MENU_SPELL_OPTIONS.length
    );
  }, []);

  if (compact) {
    const centeredSpell = MENU_SPELL_OPTIONS[centerIdx];
    const centeredData = SPELL_DATA[centeredSpell];

    return (
      <>
        <div
          className="flex-1 relative rounded-xl flex items-center min-w-0 gap-1.5 p-2 pr-3 py-1"
          style={{
            background:
              "linear-gradient(180deg, rgba(30,22,40,0.97), rgba(20,14,30,0.99))",
            border: "1.5px solid rgba(140,80,200,0.35)",
            boxShadow:
              "inset 0 0 24px rgba(140,80,200,0.04), 0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="absolute inset-[3px] rounded-[10px] pointer-events-none"
            style={{ border: "1px solid rgba(140,80,200,0.08)" }}
          />

          {/* Carousel track */}
          <div
            className="relative z-10 flex flex-col items-center rounded-xl flex-shrink-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(16,10,24,0.6), rgba(22,16,30,0.5))",
              border: "1px solid rgba(100,65,140,0.18)",
              boxShadow:
                "inset 0 1px 4px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(140,80,200,0.08)",
              padding: "3px 4px 2px",
            }}
          >
            <div className="flex items-center gap-1">
              {/* Left arrow */}
              <button
                onClick={() => navigate(-1)}
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
                style={{
                  background: "rgba(140,80,200,0.12)",
                  border: "1px solid rgba(140,80,200,0.2)",
                }}
              >
                <ChevronLeft size={11} className="text-purple-400/80" />
              </button>

              {/* Wheel viewport */}
              <div
                className="relative overflow-hidden flex-shrink-0"
                style={{ height: VP_H, width: VP_W }}
              >
                {MENU_SPELL_OPTIONS.map((spellType, idx) => {
                  const accent = SPELL_ACCENTS[spellType];
                  const diff = circularDiff(
                    idx,
                    centerIdx,
                    MENU_SPELL_OPTIONS.length
                  );
                  const absDiff = Math.abs(diff);
                  const isCenter = diff === 0;
                  const halfVisible = Math.floor(VISIBLE_COUNT / 2);
                  const isVisible = absDiff <= halfVisible;
                  const isSel = selectedSpells.includes(spellType);
                  const scale = isCenter ? 1.15 : 0.82;
                  const x = VP_CX + diff * STEP - CIRCLE / 2;
                  const y = VP_CY - CIRCLE / 2;

                  return (
                    <button
                      key={spellType}
                      onMouseEnter={() => setHoveredSpell(spellType)}
                      onMouseLeave={() => setHoveredSpell(null)}
                      onClick={() => {
                        if (isCenter) {
                          toggleSpell(spellType);
                        } else {
                          setCenterIdx(idx);
                        }
                      }}
                      title={`${SPELL_DATA[spellType].shortName}${isSel ? ` (Slot ${selectedSpells.indexOf(spellType) + 1})` : ""}`}
                      className="absolute flex items-center justify-center rounded-full"
                      style={{
                        background: isSel
                          ? `radial-gradient(circle at 30% 30%, ${accent}35, ${accent}10)`
                          : isCenter
                            ? `radial-gradient(circle at 30% 30%, ${accent}18, ${accent}06)`
                            : "radial-gradient(circle at 30% 30%, rgba(36,28,44,0.9), rgba(24,18,30,0.9))",
                        border: `2px solid ${isSel ? accent : isCenter ? `${accent}70` : "rgba(80,60,100,0.25)"}`,
                        boxShadow: isSel
                          ? `0 0 14px ${accent}30, inset 0 0 8px ${accent}12`
                          : isCenter
                            ? `0 0 10px ${accent}18`
                            : "none",
                        cursor: "pointer",
                        height: CIRCLE,
                        left: 0,
                        opacity: isVisible ? (isCenter ? 1 : 0.55) : 0,
                        pointerEvents: isVisible ? "auto" : "none",
                        top: 0,
                        transform: `translate(${x}px, ${y}px) scale(${scale})`,
                        transition:
                          "transform 0.35s cubic-bezier(0.4,0,0.15,1), opacity 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease",
                        width: CIRCLE,
                        zIndex: isCenter ? 3 : 1,
                      }}
                    >
                      {/* Spell frame */}
                      <svg
                        className="absolute pointer-events-none z-0"
                        style={{
                          filter:
                            hoveredSpell === spellType
                              ? `drop-shadow(0 0 5px ${hexToRgba(accent, 0.35)})`
                              : "none",
                          left: "50%",
                          top: "50%",
                          transform: `translate(-50%, -50%)${hoveredSpell === spellType ? " rotate(45deg) scale(1.06)" : ""}`,
                          transition:
                            "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
                        }}
                        width={SEL_FRAME}
                        height={SEL_FRAME}
                        overflow="visible"
                      >
                        {spellFrameElements({
                          color: hexToRgba(
                            accent,
                            hoveredSpell === spellType
                              ? 0.45
                              : isSel
                                ? 0.3
                                : isCenter
                                  ? 0.2
                                  : 0.14
                          ),
                          cx: SEL_CX,
                          dimColor: hexToRgba(
                            accent,
                            hoveredSpell === spellType
                              ? 0.22
                              : isSel
                                ? 0.15
                                : isCenter
                                  ? 0.1
                                  : 0.07
                          ),
                          midR: SEL_CX - 4,
                          outerR: SEL_CX - 2,
                          prefix: `sc-${spellType}`,
                        })}
                      </svg>
                      <div
                        className="absolute inset-[1px] rounded-full pointer-events-none z-[1]"
                        style={{
                          borderBottom: `1px solid rgba(0,0,0,${isSel || isCenter ? "0.12" : "0.05"})`,
                          borderLeft: "1px solid transparent",
                          borderRight: "1px solid transparent",
                          borderTop: `1px solid rgba(255,255,255,${isSel || isCenter ? "0.08" : "0.03"})`,
                        }}
                      />
                      {isCenter && (
                        <div
                          className="absolute rounded-full pointer-events-none z-[1]"
                          style={{
                            background: `radial-gradient(ellipse at 50% 60%, rgba(255,255,255,${isSel ? "0.1" : "0.06"}), transparent 55%)`,
                            filter: "blur(1px)",
                            height: "30%",
                            left: 3,
                            top: 2,
                            width: "36%",
                          }}
                        />
                      )}
                      <SpellSprite type={spellType} size={isCenter ? 30 : 22} />
                      {(spellUpgradeLevels[spellType] ?? 0) > 0 && (
                        <div
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-[1px] rounded-full px-[5px] py-[1px] text-[7px] font-bold text-yellow-100 z-20 whitespace-nowrap"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(146,64,14,0.95), rgba(120,53,15,0.9))",
                            border: "1px solid rgba(250,190,60,0.5)",
                            boxShadow:
                              "0 1px 4px rgba(0,0,0,0.5), 0 0 6px rgba(217,119,6,0.3)",
                          }}
                        >
                          <Star
                            size={7}
                            className="fill-yellow-300 text-yellow-300 flex-shrink-0"
                          />
                          {spellUpgradeLevels[spellType]}
                        </div>
                      )}
                      {isSel && (
                        <div
                          className="absolute -top-1 -right-1 w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] text-white font-black border-[1.5px] border-stone-900 z-20"
                          style={{
                            background:
                              "linear-gradient(135deg, #a855f7, #7c3aed)",
                            boxShadow:
                              "0 0 8px rgba(168,85,247,0.6), 0 0 3px rgba(168,85,247,0.8)",
                          }}
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
                style={{
                  background: "rgba(140,80,200,0.12)",
                  border: "1px solid rgba(140,80,200,0.2)",
                }}
              >
                <ChevronRight size={11} className="text-purple-400/80" />
              </button>
            </div>

            {/* Slot indicators removed — now under upgrade button */}
          </div>

          {/* Spell info + upgrade */}
          <div className="relative z-10 flex-1 flex items-center gap-1.5 min-w-0 px-1 py-1.5">
            <div className="flex flex-col justify-center gap-[3px] min-w-0 flex-1 overflow-hidden">
              {/* Row 1: Name */}
              <span
                className="text-[11px] font-bold leading-tight truncate drop-shadow-sm"
                style={{ color: SPELL_ACCENTS[centeredSpell] }}
              >
                {centeredData.shortName}
              </span>

              {/* Row 2: Trait */}
              <div className="flex items-center min-w-0">
                <span
                  className="text-[7px] font-semibold px-1 py-[1px] rounded"
                  style={{
                    background: SPELL_TRAITS[centeredSpell].bg,
                    border: `1px solid ${SPELL_TRAITS[centeredSpell].border}`,
                  }}
                >
                  <span className={SPELL_TRAITS[centeredSpell].color}>
                    {SPELL_TRAITS[centeredSpell].trait}
                  </span>
                </span>
              </div>

              {/* Row 3: Cost + Cooldown */}
              <div className="flex items-center gap-[3px]">
                <span
                  className="flex items-center gap-[2px] text-[7px] font-semibold rounded px-1 py-[1px]"
                  style={{
                    background:
                      centeredData.cost > 0
                        ? "rgba(120,80,20,0.2)"
                        : "rgba(20,83,45,0.2)",
                    border: `1px solid ${centeredData.cost > 0 ? "rgba(120,80,20,0.15)" : "rgba(20,83,45,0.15)"}`,
                  }}
                >
                  <Coins
                    size={7}
                    className={
                      centeredData.cost > 0
                        ? "text-amber-400"
                        : "text-green-400"
                    }
                  />
                  <span
                    className={
                      centeredData.cost > 0
                        ? "text-amber-300/90"
                        : "text-green-300/90"
                    }
                  >
                    {centeredData.cost > 0 ? `${centeredData.cost}` : "Free"}
                  </span>
                </span>
                <span
                  className="flex items-center gap-[2px] text-[7px] font-semibold rounded px-1 py-[1px]"
                  style={{
                    background: "rgba(30,58,138,0.2)",
                    border: "1px solid rgba(30,58,138,0.15)",
                  }}
                >
                  <Clock size={7} className="text-blue-400" />
                  <span className="text-blue-300/90">
                    {centeredData.cooldown / 1000}s
                  </span>
                </span>
              </div>
            </div>

            {/* Spellbook button — ornate circle with slot-fill ring */}
            {(() => {
              const SIZE = 38;
              const STROKE = 2.5;
              const R = (SIZE - STROKE) / 2;
              const C = 2 * Math.PI * R;
              const fillFrac = selectedSpells.length / 3;
              return (
                <HudTooltip label="Spellbook" position="top">
                  <button
                    type="button"
                    onMouseEnter={() => setSbHovered(true)}
                    onMouseLeave={() => setSbHovered(false)}
                    onClick={() => {
                      setSpellbookInitialSpell(centeredSpell);
                      setShowSpellbook(true);
                    }}
                    className="flex-shrink-0 ml-auto relative transition-all hover:scale-110 hover:brightness-110"
                    style={{ height: SIZE, width: SIZE }}
                  >
                    {/* Spell frame */}
                    <svg
                      className="absolute pointer-events-none"
                      style={{
                        filter: sbHovered
                          ? "drop-shadow(0 0 6px rgba(140,80,200,0.35))"
                          : "none",
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%)${sbHovered ? " rotate(45deg) scale(1.07)" : ""}`,
                        transition:
                          "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
                      }}
                      width={ACT_FRAME}
                      height={ACT_FRAME}
                      overflow="visible"
                    >
                      {spellFrameElements({
                        color: sbHovered
                          ? "rgba(140,80,200,0.4)"
                          : "rgba(140,80,200,0.25)",
                        cx: ACT_CX,
                        dimColor: sbHovered
                          ? "rgba(140,80,200,0.2)"
                          : "rgba(140,80,200,0.12)",
                        midR: ACT_CX - 4,
                        outerR: ACT_CX - 2,
                        prefix: "sb",
                      })}
                    </svg>
                    {/* Slot-fill ring */}
                    <svg
                      className="absolute inset-0 -rotate-90"
                      width={SIZE}
                      height={SIZE}
                    >
                      <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={R}
                        fill="none"
                        stroke="rgba(60,30,100,0.35)"
                        strokeWidth={STROKE}
                      />
                      <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={R}
                        fill="none"
                        stroke="url(#spellbookSlotGrad)"
                        strokeWidth={STROKE}
                        strokeDasharray={`${C * fillFrac} ${C * (1 - fillFrac)}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient
                          id="spellbookSlotGrad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Inner circle */}
                    <div
                      className="absolute rounded-full flex items-center justify-center overflow-hidden"
                      style={{
                        background:
                          "radial-gradient(circle at 32% 28%, rgba(130,65,190,0.95), rgba(75,32,125,0.9))",
                        border: "1.5px solid rgba(168,85,247,0.5)",
                        boxShadow:
                          "0 0 12px rgba(168,85,247,0.12), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)",
                        inset: STROKE + 1,
                      }}
                    >
                      <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.12), transparent 55%)",
                          filter: "blur(1px)",
                          height: "38%",
                          left: 2,
                          top: 1,
                          width: "45%",
                        }}
                      />
                      <SpellOrbIcon size={22} />
                    </div>
                  </button>
                </HudTooltip>
              );
            })()}

            {/* Upgrade button — ornate golden aura ring */}
            {(() => {
              const SIZE = 38;
              const STROKE = 2.5;
              const R = (SIZE - STROKE) / 2;
              return (
                <HudTooltip
                  label={`Spell Upgrades — ${availableSpellStars} stars available`}
                  position="top"
                >
                  <button
                    type="button"
                    onMouseEnter={() => setUgHovered(true)}
                    onMouseLeave={() => setUgHovered(false)}
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex-shrink-0 relative transition-all hover:scale-110 hover:brightness-110"
                    style={{ height: SIZE, width: SIZE }}
                  >
                    {/* Spell frame */}
                    <svg
                      className="absolute pointer-events-none"
                      style={{
                        filter: ugHovered
                          ? "drop-shadow(0 0 6px rgba(180,140,60,0.35))"
                          : "none",
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%)${ugHovered ? " rotate(45deg) scale(1.07)" : ""}`,
                        transition:
                          "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
                      }}
                      width={ACT_FRAME}
                      height={ACT_FRAME}
                      overflow="visible"
                    >
                      {spellFrameElements({
                        color: ugHovered
                          ? "rgba(180,140,60,0.4)"
                          : "rgba(180,140,60,0.25)",
                        cx: ACT_CX,
                        dimColor: ugHovered
                          ? "rgba(180,140,60,0.2)"
                          : "rgba(180,140,60,0.12)",
                        midR: ACT_CX - 4,
                        outerR: ACT_CX - 2,
                        prefix: "ug",
                      })}
                    </svg>
                    {/* Aura ring */}
                    <svg
                      className="absolute inset-0"
                      width={SIZE}
                      height={SIZE}
                    >
                      <defs>
                        <linearGradient
                          id="upgradeAuraGrad"
                          gradientTransform="rotate(75)"
                        >
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="40%" stopColor="#f59e0b" />
                          <stop offset="70%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={R}
                        fill="none"
                        stroke="url(#upgradeAuraGrad)"
                        strokeWidth={STROKE}
                        opacity={0.7}
                      />
                    </svg>
                    {/* Inner circle */}
                    <div
                      className="absolute rounded-full flex items-center justify-center overflow-hidden"
                      style={{
                        background:
                          "radial-gradient(circle at 32% 28%, rgba(170,125,35,0.95), rgba(95,68,16,0.9))",
                        border: "1.5px solid rgba(250,204,21,0.5)",
                        boxShadow:
                          "0 0 12px rgba(250,204,21,0.12), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)",
                        inset: STROKE + 1,
                      }}
                    >
                      <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.14), transparent 55%)",
                          filter: "blur(1px)",
                          height: "38%",
                          left: 2,
                          top: 1,
                          width: "45%",
                        }}
                      />
                      <EnchantedAnvilIcon size={24} />
                    </div>
                    {/* Star count badge */}
                    <div
                      className="absolute -top-1 -right-1 flex items-center gap-[1px] rounded-full px-[4px] py-[1px] text-[7px] font-bold text-yellow-100 z-20"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(120,80,10,0.95), rgba(90,60,8,0.9))",
                        border: "1.5px solid rgba(250,204,21,0.6)",
                        boxShadow:
                          "0 1px 4px rgba(0,0,0,0.5), 0 0 6px rgba(250,204,21,0.25)",
                      }}
                    >
                      <Star
                        size={7}
                        className="fill-yellow-300 text-yellow-300"
                      />
                      {availableSpellStars}
                    </div>
                  </button>
                </HudTooltip>
              );
            })()}
          </div>
        </div>

        {showSpellbook && (
          <SpellbookModal
            isOpen
            onClose={() => {
              setShowSpellbook(false);
              setSpellbookInitialSpell(undefined);
            }}
            selectedSpells={selectedSpells}
            toggleSpell={toggleSpell}
            availableSpellStars={availableSpellStars}
            totalSpellStarsEarned={totalSpellStarsEarned}
            spentSpellStars={spentSpellStars}
            spellUpgradeLevels={spellUpgradeLevels}
            upgradeSpell={upgradeSpell}
            downgradeSpell={downgradeSpell}
            initialSpell={spellbookInitialSpell}
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
          onDowngradeSpell={downgradeSpell}
        />
      </>
    );
  }

  /* ── Expanded (old) layout ── */
  return (
    <div
      className="flex-1 relative rounded-xl flex flex-col min-w-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(30,22,40,0.97) 0%, rgba(20,14,30,0.99) 100%)",
        border: "1.5px solid rgba(140,80,200,0.35)",
        boxShadow:
          "inset 0 0 24px rgba(140,80,200,0.04), 0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="absolute inset-[3px] rounded-[10px] pointer-events-none"
        style={{ border: "1px solid rgba(140,80,200,0.08)" }}
      />
      <div
        className="px-3 py-2 relative flex items-center justify-between"
        style={{
          background:
            "linear-gradient(90deg, rgba(120,60,180,0.15), rgba(80,30,140,0.08), transparent)",
        }}
      >
        <div className="flex items-center gap-2">
          <SpellOrbIcon size={18} />
          <span className="text-[9px] font-bold text-purple-300/90 tracking-[0.2em] uppercase">
            Select Spells
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-sm transition-all duration-300"
                style={{
                  background:
                    i < selectedSpells.length
                      ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                      : "rgba(60,40,80,0.4)",
                  border: `1px solid ${i < selectedSpells.length ? "rgba(168,85,247,0.6)" : "rgba(100,70,140,0.25)"}`,
                  boxShadow:
                    i < selectedSpells.length
                      ? "0 0 6px rgba(168,85,247,0.4)"
                      : "none",
                }}
              />
            ))}
          </div>
          {onOpenCodex && (
            <button
              onClick={onOpenCodex}
              className="flex items-center justify-center w-5 h-5 rounded-md transition-all hover:scale-110 hover:brightness-125"
              style={{
                background: "rgba(140,80,200,0.12)",
                border: "1px solid rgba(140,80,200,0.25)",
              }}
              title="View in Codex"
            >
              <Info size={10} className="text-purple-400/70" />
            </button>
          )}
        </div>
        <div
          className="absolute bottom-0 left-3 right-3 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(140,80,200,0.3) 20%, rgba(180,120,255,0.4) 50%, rgba(140,80,200,0.3) 80%, transparent)",
          }}
        />
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        {(() => {
          const spellLabelExtras: Record<
            SpellType,
            { nameColor: string; borderColor: string }
          > = {
            fireball: {
              borderColor: "rgba(234,88,12,0.4)",
              nameColor: "text-orange-300",
            },
            freeze: {
              borderColor: "rgba(6,182,212,0.4)",
              nameColor: "text-cyan-300",
            },
            hex_ward: {
              borderColor: "rgba(168,85,247,0.4)",
              nameColor: "text-fuchsia-300",
            },
            lightning: {
              borderColor: "rgba(234,179,8,0.4)",
              nameColor: "text-yellow-300",
            },
            payday: {
              borderColor: "rgba(245,158,11,0.4)",
              nameColor: "text-amber-300",
            },
            reinforcements: {
              borderColor: "rgba(16,185,129,0.4)",
              nameColor: "text-emerald-300",
            },
          };
          return (
            <div className="flex gap-1.5">
              {MENU_SPELL_OPTIONS.map((spellType) => {
                const isSelected = selectedSpells.includes(spellType);
                const spellIndex = selectedSpells.indexOf(spellType);
                const label = {
                  ...spellLabelExtras[spellType],
                  ...SPELL_TRAITS[spellType],
                };
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
                    className={`relative w-full p-1.5 pb-1 flex flex-col items-center gap-0.5 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "z-10"
                        : "hover:scale-105 hover:brightness-110"
                    }`}
                    style={{
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(120,50,200,0.25), rgba(80,20,150,0.15))"
                        : "linear-gradient(135deg, rgba(36,28,44,0.95), rgba(24,18,30,0.95))",
                      border: `1.5px solid ${isSelected ? label?.borderColor || "#a855f7" : "rgba(80,60,100,0.25)"}`,
                      boxShadow: isSelected
                        ? `0 0 14px rgba(168,85,247,0.25), inset 0 0 12px rgba(168,85,247,0.08), inset 0 1px 0 rgba(255,255,255,0.06)`
                        : "inset 0 1px 0 rgba(255,255,255,0.03)",
                      outline: isSelected
                        ? `2px solid ${label?.borderColor || "rgba(168,85,247,0.5)"}`
                        : "none",
                      outlineOffset: "1px",
                    }}
                  >
                    <div className="absolute top-0.5 left-0.5 rounded border border-yellow-500/35 bg-yellow-900/45 px-1 py-px text-[7px] font-bold text-yellow-200 z-20">
                      Lv {spellLevel + 1}
                    </div>
                    {(() => {
                      const isAimable =
                        spellType === "fireball" || spellType === "lightning";
                      const hasUnlocked = isAimable && spellLevel >= 2;
                      const manualOn = hasUnlocked && !spellAutoAim[spellType];
                      if (!isAimable) {
                        return null;
                      }
                      const tooltipLabel = !hasUnlocked
                        ? "Unlock manual targeting by upgrading"
                        : manualOn
                          ? "Manual targeting ON — click to switch to auto-aim"
                          : "Auto-aim ON — click for manual targeting";
                      return (
                        <HudTooltip label={tooltipLabel} position="top">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasUnlocked) {
                                onToggleSpellAutoAim(spellType);
                              }
                            }}
                            className="absolute top-0.5 right-0.5 z-20 flex items-center justify-center rounded transition-all"
                            style={{
                              background: manualOn
                                ? `${label.borderColor.replace("0.4)", "0.2)")}`
                                : "rgba(40,30,50,0.4)",
                              border: `1px solid ${
                                manualOn
                                  ? label.borderColor
                                  : hasUnlocked
                                    ? "rgba(140,100,60,0.3)"
                                    : "rgba(60,50,70,0.25)"
                              }`,
                              cursor: hasUnlocked ? "pointer" : "not-allowed",
                              height: 16,
                              opacity: hasUnlocked ? 1 : 0.4,
                              width: 16,
                            }}
                          >
                            <Crosshair
                              size={9}
                              className={
                                manualOn ? label.nameColor : "text-stone-500"
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
                        <span
                          className={`text-[8px] font-semibold leading-none ${label.nameColor}`}
                        >
                          {spellData?.shortName ?? spellType}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className="text-[7px] font-medium px-1 py-px rounded flex items-center gap-0.5"
                            style={{
                              background:
                                spellCost > 0
                                  ? "rgba(120,80,20,0.3)"
                                  : "rgba(20,83,45,0.3)",
                              border: `1px solid ${spellCost > 0 ? "rgba(120,80,20,0.2)" : "rgba(20,83,45,0.2)"}`,
                            }}
                          >
                            <Coins
                              size={7}
                              className={
                                spellCost > 0
                                  ? "text-amber-400/70"
                                  : "text-green-400/70"
                              }
                            />
                            <span
                              className={
                                spellCost > 0
                                  ? "text-amber-300/80"
                                  : "text-green-300/80"
                              }
                            >
                              {spellCost > 0 ? spellCost : "Free"}
                            </span>
                          </span>
                          <span
                            className="text-[7px] font-medium px-1 py-px rounded flex items-center gap-0.5"
                            style={{
                              background: "rgba(30,58,138,0.25)",
                              border: "1px solid rgba(30,58,138,0.2)",
                            }}
                          >
                            <Clock size={7} className="text-blue-400/70" />
                            <span className="text-blue-300/80">
                              {spellCooldownSeconds}s
                            </span>
                          </span>
                        </div>
                        <span
                          className="text-[7px] font-semibold px-1.5 py-px rounded mt-0.5 inline-block"
                          style={{
                            background: label.bg,
                            border: `1px solid ${label.border}`,
                          }}
                        >
                          <span className={label.color}>{label.trait}</span>
                        </span>
                      </>
                    )}
                    {isSelected && (
                      <div
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-stone-900"
                        style={{
                          background:
                            "linear-gradient(135deg, #a855f7, #7c3aed)",
                          boxShadow: "0 0 6px rgba(168,85,247,0.5)",
                        }}
                      >
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
          <div
            className="h-px mb-2"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(140,80,200,0.2) 30%, rgba(140,80,200,0.2) 70%, transparent)",
            }}
          />
          <div className="flex items-center gap-2">
            {selectedSpells.length === 3 ? (
              <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-md flex-1 min-w-0"
                style={{
                  background: "rgba(88,28,135,0.12)",
                  border: "1px solid rgba(88,28,135,0.15)",
                }}
              >
                <SpellOrbIcon size={14} className="flex-shrink-0" />
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {selectedSpells.map((sp, i) => (
                    <React.Fragment key={sp}>
                      <div className="flex items-center gap-1">
                        <SpellSprite type={sp} size={14} />
                        <span className="text-[8px] text-purple-200/80 font-medium whitespace-nowrap">
                          {SPELL_DATA[sp].shortName}
                        </span>
                      </div>
                      {i < 2 && (
                        <span className="text-purple-600/40 text-[8px]">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <span className="text-[7px] text-green-400/70 font-semibold uppercase tracking-wider flex-shrink-0">
                  Ready
                </span>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-md flex-1 min-w-0"
                style={{
                  background: "rgba(60,40,80,0.12)",
                  border: "1px solid rgba(80,50,120,0.12)",
                }}
              >
                <Zap size={10} className="text-purple-500/40 flex-shrink-0" />
                <div className="flex items-center gap-1 flex-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-1">
                      {i < selectedSpells.length ? (
                        <>
                          <SpellSprite type={selectedSpells[i]} size={14} />
                          <span className="text-[8px] text-purple-200/70 font-medium whitespace-nowrap">
                            {SPELL_DATA[selectedSpells[i]].shortName}
                          </span>
                        </>
                      ) : (
                        <>
                          <div
                            className="w-3.5 h-3.5 rounded border border-dashed flex items-center justify-center"
                            style={{ borderColor: "rgba(140,80,200,0.25)" }}
                          >
                            <span className="text-[7px] text-purple-600/40">
                              ?
                            </span>
                          </div>
                          <span className="text-[8px] text-purple-600/30 italic">
                            Empty
                          </span>
                        </>
                      )}
                      {i < 2 && (
                        <span className="text-purple-600/30 text-[8px] mx-0.5">
                          ·
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-[7px] text-purple-500/40 font-medium flex-shrink-0">
                  {3 - selectedSpells.length} left
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex ml-auto items-center gap-1 rounded-md border py-1 px-2 transition-all hover:brightness-110 flex-shrink-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(98,72,18,0.82), rgba(72,52,12,0.78))",
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
        onDowngradeSpell={downgradeSpell}
      />
    </div>
  );
};
