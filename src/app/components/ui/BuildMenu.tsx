"use client";

import React from "react";
import {
  PawPrint,
  Construction,
  Swords,
  Coins,
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

interface BuildMenuProps {
  pawPoints: number;
  buildingTower: TowerType | null;
  setBuildingTower: (tower: TowerType | null) => void;
  setHoveredBuildTower: (tower: TowerType | null) => void;
  hoveredTower: string | null;
  setHoveredTower: (tower: string | null) => void;
  setDraggingTower: (dragging: DraggingTower | null) => void;
  placedTowers: Record<TowerType, number>;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  pawPoints,
  buildingTower,
  setBuildingTower,
  setHoveredBuildTower,
  hoveredTower,
  setHoveredTower,
  setDraggingTower,
  placedTowers,
}) => {
  const isTouchDevice = useIsTouchDevice();
  const sizes = useResponsiveSizes();

  const towerStrategies: Record<string, string> = {
    cannon:
      "High single-target damage. Great for taking down tough enemies. Place along main paths.",
    archer:
      "Fast attacks, lower damage. Good for consistent DPS. Can hit flying enemies.",
    station:
      "Spawns troops to block enemies. Essential for creating chokepoints. No direct attack.",
    library:
      "Slows enemies in range. Perfect before high-damage towers. Stacks with multiple libraries.",
    lab: "Deals chain/splash damage. Excellent against swarms. Place where enemies cluster.",
    club: "Generates extra PP over time. Build early for economic advantage. No combat ability.",
  };

  return (
    <OrnateFrame
      className="border-t-2 border-amber-700/50 shadow-xl backdrop-blur-sm"
      cornerSize={28}
      showBorders={true}
    >
      <div
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-max">
          <h3 className="text-[10px] font-bold text-amber-300 tracking-wider hidden sm:flex flex-col justify-center gap-1 whitespace-nowrap px-1">
            <div className="flex items-center gap-1">
              <Construction size={14} /> <div>BUILD TOWERS</div>
            </div>
            <div className="text-[8px] text-amber-600 font-normal">
              (Click to Select / Deselect)
            </div>
          </h3>
          {Object.entries(TOWER_DATA).map(([type, data]) => {
            const towerType = type as TowerType;
            const canAfford = pawPoints >= data.cost;
            const isSelected = buildingTower === towerType;
            const isHovered = hoveredTower === towerType;
            return (
              <div key={type} className="relative w-full">
                <button
                  onClick={() => {
                    // if we have a tower selected, deselect it
                    if (isSelected) {
                      setBuildingTower(null);
                      setHoveredBuildTower(null);
                      setHoveredTower(null);
                      setDraggingTower(null);
                    } else {
                      setBuildingTower(towerType);
                      setHoveredBuildTower(towerType);
                      setHoveredTower(towerType);
                      setDraggingTower(null);
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
                  disabled={!canAfford}
                  className={`relative px-2 sm:px-3 py-1.5 sm:py-2 w-full transition-all flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap rounded-xl ${isSelected
                    ? "scale-105"
                    : canAfford
                      ? "hover:brightness-110 hover:scale-[1.02]"
                      : "opacity-40 cursor-not-allowed"
                    }`}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`
                      : canAfford
                        ? `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`
                        : "linear-gradient(135deg, rgba(30,30,30,0.5), rgba(20,20,20,0.3))",
                    border: isSelected
                      ? `1.5px solid ${GOLD.accentBorder50}`
                      : canAfford
                        ? `1.5px solid ${GOLD.border30}`
                        : `1.5px solid ${NEUTRAL.border}`,
                    boxShadow: isSelected
                      ? `inset 0 0 15px ${GOLD.accentGlow10}, 0 0 12px ${GOLD.accentGlow10}`
                      : `inset 0 0 12px ${GOLD.glow04}`,
                  }}
                >
                  {/* Inner border */}
                  <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{
                    border: isSelected ? `1px solid ${GOLD.accentBorder15}` : canAfford ? `1px solid ${GOLD.innerBorder10}` : "none",
                  }} />
                  <span className="absolute top-1 sm:top-1.5 bg-amber-900/80 p-0.5 px-1 rounded-md right-1 sm:right-1.5 text-[7px] sm:text-[9px] font-bold text-amber-400 z-10">
                    {placedTowers[towerType] > 0
                      ? `x${placedTowers[towerType]}`
                      : "x0"}
                  </span>
                  <div className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center">
                    <TowerSprite type={towerType} size={sizes.towerIcon} />
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="font-bold text-[8px] sm:text-[10px] text-amber-200">
                      {data.name}
                    </div>
                    <div className="text-[7px] sm:text-[9px] text-amber-400 flex items-center gap-0.5 sm:gap-1">
                      <PawPrint size={8} className="sm:w-2.5 sm:h-2.5" /> {data.cost} PP
                    </div>
                    <div className="hidden sm:flex gap-1.5 text-[8px] mt-0.5 flex-wrap">
                      {/* Standard combat towers */}
                      {data.damage > 0 && type !== "library" && (
                        <span className="text-red-400 flex items-center gap-0.5">
                          <Swords size={9} /> {data.damage}
                        </span>
                      )}
                      {data.range > 0 && type !== "station" && type !== "club" && (
                        <span className="text-blue-400 flex items-center gap-0.5">
                          <TargetIcon size={9} /> {data.range}
                        </span>
                      )}
                      {data.attackSpeed > 0 && (
                        <span className="text-green-400 flex items-center gap-0.5">
                          <GaugeIcon size={9} /> {(data.attackSpeed / 1000).toFixed(1)}s
                        </span>
                      )}
                      {/* Dinky Station */}
                      {type === "station" && (
                        <span className="text-purple-300 flex items-center gap-0.5">
                          <UsersIcon size={9} /> {TROOP_DATA.footsoldier.hp}HP / {TROOP_DATA.footsoldier.damage}DMG
                        </span>
                      )}
                      {/* Eating Club */}
                      {type === "club" && (
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <CoinsIcon size={9} /> +8 PP/8s
                        </span>
                      )}
                      {/* Firestone Library */}
                      {type === "library" && (
                        <span className="text-purple-400 flex items-center gap-0.5">
                          <Snowflake size={9} /> 20% Slow
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected ? (
                    <Grab
                      size={14}
                      className="text-amber-400 rounded p-0.5 absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 sm:w-[18px] sm:h-[18px]"
                    />
                  ) : (
                    <PlusCircle
                      size={14}
                      className="text-amber-600 rounded p-0.5 absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 sm:w-[18px] sm:h-[18px]"
                    />
                  )}
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
    </OrnateFrame>
  );
};
