"use client";

import React from "react";
import {
  PawPrint,
  BrickWallShield,
  Swords,
  Info,
  Snowflake,
  CoinsIcon,
  UsersIcon,
  TargetIcon,
  GaugeIcon,
  PlusCircle,
  Grab,
} from "lucide-react";
import type { TowerType, DraggingTower } from "../../types";
import { TOWER_DATA, TROOP_DATA } from "../../constants";
import { TowerSprite } from "../../sprites";
import { OrnateFrame } from "./OrnateFrame";
import { useIsTouchDevice, useResponsiveSizes } from "./hooks";
import { PANEL, GOLD, DIVIDER, SELECTED, NEUTRAL, panelGradientReversed } from "./theme";

const TOWER_ROLES: Record<TowerType, {
  label: string;
  accent: string;
  text: string;
  bg: string;
  border: string;
  statColor: string;
  statIcon: (size: number) => React.ReactNode;
}> = {
  cannon: { label: "DPS", accent: "rgba(239,68,68,0.7)", text: "rgb(252,165,165)", bg: "rgba(127,29,29,0.35)", border: "rgba(153,27,27,0.3)", statColor: "rgb(252,165,165)", statIcon: (s) => <Swords size={s} className="text-red-400" /> },
  mortar: { label: "AoE", accent: "rgba(249,115,22,0.7)", text: "rgb(253,186,116)", bg: "rgba(124,45,18,0.35)", border: "rgba(154,52,18,0.3)", statColor: "rgb(253,186,116)", statIcon: (s) => <TargetIcon size={s} className="text-orange-400" /> },
  lab: { label: "Chain", accent: "rgba(56,189,248,0.7)", text: "rgb(125,211,252)", bg: "rgba(12,74,110,0.35)", border: "rgba(14,116,144,0.3)", statColor: "rgb(125,211,252)", statIcon: (s) => <Swords size={s} className="text-sky-400" /> },
  arch: { label: "Ramp", accent: "rgba(168,85,247,0.7)", text: "rgb(216,180,254)", bg: "rgba(88,28,135,0.35)", border: "rgba(107,33,168,0.3)", statColor: "rgb(216,180,254)", statIcon: (s) => <GaugeIcon size={s} className="text-purple-400" /> },
  station: { label: "Troops", accent: "rgba(192,132,252,0.7)", text: "rgb(216,180,254)", bg: "rgba(88,28,135,0.35)", border: "rgba(107,33,168,0.3)", statColor: "rgb(216,180,254)", statIcon: (s) => <UsersIcon size={s} className="text-purple-400" /> },
  library: { label: "Slow", accent: "rgba(96,165,250,0.7)", text: "rgb(147,197,253)", bg: "rgba(30,58,138,0.35)", border: "rgba(30,64,175,0.3)", statColor: "rgb(147,197,253)", statIcon: (s) => <Snowflake size={s} className="text-blue-400" /> },
  club: { label: "Econ", accent: "rgba(74,222,128,0.7)", text: "rgb(134,239,172)", bg: "rgba(20,83,45,0.35)", border: "rgba(22,101,52,0.3)", statColor: "rgb(134,239,172)", statIcon: (s) => <CoinsIcon size={s} className="text-green-400" /> },
};

function getTowerKeyStat(type: string, data: { damage: number; range: number; attackSpeed: number }): string {
  switch (type) {
    case "station": return `${TROOP_DATA.footsoldier.hp}HP`;
    case "library": return "20%";
    case "club": return "+8PP/8s";
    case "mortar": return `${data.damage}`;
    default:
      if (data.damage > 0) return `${data.damage}`;
      return `${data.range}`;
  }
}

interface BuildMenuProps {
  pawPoints: number;
  buildingTower: TowerType | null;
  setBuildingTower: (tower: TowerType | null) => void;
  setIsBuildDragging: (dragging: boolean) => void;
  setHoveredBuildTower: (tower: TowerType | null) => void;
  hoveredTower: string | null;
  setHoveredTower: (tower: string | null) => void;
  setDraggingTower: (dragging: DraggingTower | null) => void;
  placedTowers: Record<TowerType, number>;
  allowedTowers?: TowerType[] | null;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  pawPoints,
  buildingTower,
  setBuildingTower,
  setIsBuildDragging,
  setHoveredBuildTower,
  hoveredTower,
  setHoveredTower,
  setDraggingTower,
  placedTowers,
  allowedTowers,
}) => {
  const isTouchDevice = useIsTouchDevice();
  const sizes = useResponsiveSizes();
  const pointerDownTowerRef = React.useRef<{
    tower: TowerType;
    wasSelected: boolean;
  } | null>(null);

  const towerStrategies: Record<string, string> = {
    cannon:
      "High single-target damage. Great for taking down tough enemies. Place along main paths.",
    archer:
      "Fast attacks, lower damage. Good for consistent DPS. Can hit flying enemies.",
    station:
      "Spawns troops to block enemies. Essential for creating chokepoints. No direct attack.",
    library:
      "Slows enemies in range. Perfect before high-damage towers. Stacks with multiple libraries.",
    lab: "Chain lightning bounces between enemies. Excellent against swarms. Chains extend beyond tower range.",
    arch: "Sonic crescendo builds attack speed with each hit. Place on sustained-traffic lanes for maximum ramp.",
    club: "Generates extra PP over time. Build early for economic advantage. No combat ability.",
    mortar:
      "Slow but devastating AoE. Shells arc high and explode on impact. Ideal against grouped enemies.",
  };

  return (
    <OrnateFrame
      className="border-2 border-amber-700/50 shadow-xl backdrop-blur-sm"
      cornerSize={28}
      showTopBottomBorders={false}
    >
      <div
        data-tutorial="build-menu"
        className="relative z-20"
        style={{
          background: panelGradientReversed,
        }}
      >
        {/* Top gradient line */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)` }} />

        <div
          className="px-1.5 sm:px-3 py-2 overflow-x-auto relative z-20"
          style={{ zIndex: 100 }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 w-full">
            <h3 className="text-[10px] font-bold text-amber-300 tracking-wider hidden sm:flex flex-col justify-center gap-1 whitespace-nowrap px-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <BrickWallShield size={14} /> <div>BUILD TOWERS</div>
              </div>
              <div className="ml-auto text-[8px] text-amber-600 font-normal">
                (Select, Click, or Drag!)
              </div>
            </h3>
            {Object.entries(TOWER_DATA).map(([type, data]) => {
              const towerType = type as TowerType;
              const isRestricted =
                !!allowedTowers && allowedTowers.length > 0
                  ? !allowedTowers.includes(towerType)
                  : false;
              const canAfford = pawPoints >= data.cost;
              const canUse = canAfford && !isRestricted;
              const isSelected = buildingTower === towerType;
              const isHovered = hoveredTower === towerType;
              const towerCount = placedTowers[towerType] || 0;
              const role = TOWER_ROLES[towerType];
              return (
                <div key={type} className="relative flex-1 min-w-[2.75rem] sm:min-w-0">
                  <button
                    onPointerDown={(e) => {
                      if (!canUse) return;
                      if (e.pointerType === "mouse" && e.button !== 0) return;
                      pointerDownTowerRef.current = {
                        tower: towerType,
                        wasSelected: isSelected,
                      };
                      if (!isSelected) {
                        setBuildingTower(towerType);
                        setHoveredBuildTower(towerType);
                        setHoveredTower(towerType);
                        setDraggingTower(null);
                      }
                      setIsBuildDragging(true);
                    }}
                    onPointerUp={() => {
                      setIsBuildDragging(false);
                    }}
                    onPointerCancel={() => {
                      setIsBuildDragging(false);
                      pointerDownTowerRef.current = null;
                    }}
                    onClick={() => {
                      const pointerDownMeta = pointerDownTowerRef.current;
                      if (pointerDownMeta?.tower === towerType) {
                        pointerDownTowerRef.current = null;
                        if (pointerDownMeta.wasSelected) {
                          setBuildingTower(null);
                          setHoveredBuildTower(null);
                          setHoveredTower(null);
                          setDraggingTower(null);
                          setIsBuildDragging(false);
                        }
                        return;
                      }
                      if (isSelected) {
                        setBuildingTower(null);
                        setHoveredBuildTower(null);
                        setHoveredTower(null);
                        setDraggingTower(null);
                        setIsBuildDragging(false);
                      } else {
                        setBuildingTower(towerType);
                        setHoveredBuildTower(towerType);
                        setHoveredTower(towerType);
                        setDraggingTower(null);
                        setIsBuildDragging(false);
                      }
                    }}
                    onMouseEnter={() => {
                      if (!isTouchDevice) {
                        setHoveredBuildTower(towerType);
                        setHoveredTower(towerType);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isTouchDevice) {
                        setHoveredBuildTower(null);
                        setHoveredTower(null);
                      }
                    }}
                    disabled={!canUse}
                    className={`relative w-full transition-all rounded-xl whitespace-nowrap ${isSelected
                      ? "scale-105"
                      : canUse
                        ? "hover:brightness-110 hover:scale-[1.02]"
                        : "opacity-40 cursor-not-allowed"
                      }`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`
                        : canUse
                          ? `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`
                          : "linear-gradient(135deg, rgba(30,30,30,0.5), rgba(20,20,20,0.3))",
                      border: isSelected
                        ? `1.5px solid ${GOLD.accentBorder50}`
                        : canUse
                          ? `1.5px solid ${GOLD.border30}`
                          : `1.5px solid ${NEUTRAL.border}`,
                      boxShadow: isSelected
                        ? `inset 0 0 15px ${GOLD.accentGlow10}, 0 0 12px ${GOLD.accentGlow10}`
                        : `inset 0 0 12px ${GOLD.glow04}`,
                    }}
                  >
                    {/* Role accent — thin colored bottom strip */}
                    <div className="absolute bottom-0 left-[10px] right-[10px] h-[2px] rounded-b-full" style={{ background: role.accent }} />

                    <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{
                      border: isSelected ? `1px solid ${GOLD.accentBorder15}` : canUse ? `1px solid ${GOLD.innerBorder10}` : "none",
                    }} />

                    {isRestricted && (
                      <span className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 bg-red-950/75 border border-red-500/40 text-red-200 text-[7px] sm:text-[8px] px-1 py-[1px] rounded z-10">
                        Locked
                      </span>
                    )}

                    {/* ── Mobile: compact vertical card ── */}
                    <div className="flex sm:hidden flex-col items-center py-1.5 px-1 gap-0.5 relative">
                      <div className="w-7 h-7 flex items-center justify-center">
                        <TowerSprite type={towerType} size={sizes.towerIcon} />
                      </div>
                      <span className="text-[7px] font-bold text-amber-400 flex items-center gap-0.5 leading-none">
                        <PawPrint size={7} />{data.cost}
                      </span>
                      <span className="text-[6px] font-bold uppercase tracking-wide leading-none px-1 py-px rounded"
                        style={{ color: role.text, background: role.bg, border: `1px solid ${role.border}` }}>
                        {role.label}
                      </span>
                    </div>

                    {/* ── Desktop: horizontal detail card ── */}
                    <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-2">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                        <TowerSprite type={towerType} size={sizes.towerIcon} />
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <div className="font-bold text-[10px] text-amber-200 leading-tight truncate max-w-full">
                          {data.name}
                        </div>
                        <div className="text-[9px] text-amber-400 flex items-center gap-1">
                          <PawPrint size={10} /> {data.cost} PP
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[7px] font-bold uppercase tracking-wider px-1 py-px rounded"
                            style={{ color: role.text, background: role.bg, border: `1px solid ${role.border}` }}>
                            {role.label}
                          </span>
                          <span className="flex items-center gap-[2px] text-[8px] font-semibold" style={{ color: role.statColor }}>
                            {role.statIcon(8)}{getTowerKeyStat(type, data)}
                          </span>
                        </div>
                      </div>
                      <span className="absolute top-1.5 right-1.5 px-1 py-px rounded text-[8px] font-bold tabular-nums z-10"
                        style={{
                          background: towerCount > 0 ? "rgba(120,80,20,0.6)" : "rgba(50,40,25,0.5)",
                          color: towerCount > 0 ? "rgb(252,211,77)" : "rgba(160,140,100,0.5)",
                          border: `1px solid ${towerCount > 0 ? "rgba(180,140,60,0.3)" : "rgba(70,55,30,0.2)"}`,
                        }}
                      >
                        x{towerCount}
                      </span>
                      {isSelected ? (
                        <Grab size={18} className="text-amber-400 absolute bottom-1.5 right-1.5" />
                      ) : (
                        <PlusCircle size={18} className="text-amber-600 absolute bottom-1.5 right-1.5" />
                      )}
                    </div>
                  </button>

                  {/* Enhanced Tooltip - hidden on touch devices */}
                  {isHovered && !isTouchDevice && (
                    <div className="hidden [@media(hover:hover)]:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-stone-900/98 rounded-lg border border-amber-700/60 p-3 shadow-xl z-50 pointer-events-none">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-14 h-14 rounded-lg bg-stone-800 border border-amber-600/50 flex items-center justify-center">
                          <TowerSprite type={towerType} size={sizes.towerIconLarge} level={1} />
                        </div>
                        <div>
                          <h4 className="text-amber-200 font-bold text-base">
                            {data.name}
                          </h4>
                          <p className="text-[10px] text-amber-500">{data.desc}</p>
                        </div>
                      </div>

                      {isRestricted && (
                        <div className="mb-2 rounded-md border border-red-700/50 bg-red-950/40 px-2 py-1 text-[10px] text-red-200">
                          Restricted in this challenge.
                        </div>
                      )}

                      {/* Stats Grid - Tower Type Specific */}
                      <div className="grid grid-cols-4 gap-1.5 mb-2 text-[10px]">
                        <div className="bg-amber-950/60 rounded px-2 py-1 text-center border border-amber-800/40">
                          <div className="text-amber-500">Cost</div>
                          <div className="text-amber-300 font-bold">
                            {data.cost}
                          </div>
                        </div>

                        {/* Standard combat towers */}
                        {data.damage > 0 && type !== "library" && (
                          <div className="bg-red-950/60 rounded px-2 py-1 text-center border border-red-800/40">
                            <div className="text-red-500">Damage</div>
                            <div className="text-red-300 font-bold">
                              {data.damage}
                            </div>
                          </div>
                        )}
                        {data.range > 0 && type !== "station" && type !== "club" && (
                          <div className="bg-blue-950/60 rounded px-2 py-1 text-center border border-blue-800/40">
                            <div className="text-blue-500">Range</div>
                            <div className="text-blue-300 font-bold">
                              {data.range}
                            </div>
                          </div>
                        )}
                        {data.attackSpeed > 0 && (
                          <div className="bg-green-950/60 rounded px-2 py-1 text-center border border-green-800/40">
                            <div className="text-green-500">Speed</div>
                            <div className="text-green-300 font-bold">
                              {(data.attackSpeed / 1000).toFixed(1)}s
                            </div>
                          </div>
                        )}

                        {/* Dinky Station - Show troop stats */}
                        {type === "station" && (
                          <>
                            <div className="bg-red-950/60 rounded px-2 py-1 text-center border border-red-800/40">
                              <div className="text-red-500">Troop HP</div>
                              <div className="text-red-300 font-bold">
                                {TROOP_DATA.footsoldier.hp}
                              </div>
                            </div>
                            <div className="bg-orange-950/60 rounded px-2 py-1 text-center border border-orange-800/40">
                              <div className="text-orange-500">Troop DMG</div>
                              <div className="text-orange-300 font-bold">
                                {TROOP_DATA.footsoldier.damage}
                              </div>
                            </div>
                            <div className="bg-purple-950/60 rounded px-2 py-1 text-center border border-purple-800/40">
                              <div className="text-purple-500">Max Troops</div>
                              <div className="text-purple-300 font-bold">1</div>
                            </div>
                          </>
                        )}

                        {/* Firestone Library - Show slow stats */}
                        {type === "library" && (
                          <>
                            <div className="bg-purple-950/60 rounded px-2 py-1 text-center border border-purple-800/40">
                              <div className="text-purple-500">Slow</div>
                              <div className="text-purple-300 font-bold">20%</div>
                            </div>
                            <div className="bg-cyan-950/60 rounded px-2 py-1 text-center border border-cyan-800/40">
                              <div className="text-cyan-500">Duration</div>
                              <div className="text-cyan-300 font-bold">1s</div>
                            </div>
                          </>
                        )}

                        {/* Eating Club - Show income stats */}
                        {type === "club" && (
                          <>
                            <div className="bg-green-950/60 rounded px-2 py-1 text-center border border-green-800/40">
                              <div className="text-green-500">Income</div>
                              <div className="text-green-300 font-bold">+8 PP</div>
                            </div>
                            <div className="bg-cyan-950/60 rounded px-2 py-1 text-center border border-cyan-800/40">
                              <div className="text-cyan-500">Interval</div>
                              <div className="text-cyan-300 font-bold">8s</div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Level 1 Description */}
                      <div className="bg-stone-800/50 rounded px-2 py-1.5 mb-2 border border-stone-700/50">
                        <div className="text-[9px] text-amber-500 uppercase tracking-wider mb-0.5">
                          Level 1
                        </div>
                        <p className="text-[10px] text-amber-300/90">
                          {data.levelDesc[1]}
                        </p>
                      </div>

                      {/* Strategy Tip */}
                      <div className="border-t border-amber-800/40 pt-2">
                        <div className="flex items-center gap-1 text-[9px] text-amber-500 mb-1">
                          <Info size={10} /> Strategy
                        </div>
                        <p className="text-[10px] text-amber-400/80">
                          {towerStrategies[type]}
                        </p>
                      </div>

                      {/* Upgrade Preview */}
                      <div className="mt-2 pt-2 border-t border-amber-800/40 flex justify-between items-center text-[9px]">
                        <span className="text-amber-500">
                          Upgrades to Lv.4 with 2 evolution paths
                        </span>
                        <div className="flex gap-1">
                          <span className="px-1.5 py-0.5 bg-red-950/50 rounded text-red-400 border border-red-800/40">
                            Path A
                          </span>
                          <span className="px-1.5 py-0.5 bg-blue-950/50 rounded text-blue-400 border border-blue-800/40">
                            Path B
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)` }} />

    </OrnateFrame>
  );
};
