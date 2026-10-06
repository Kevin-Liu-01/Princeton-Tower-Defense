"use client";

import {
  PawPrint,
  BrickWallShield,
  GripVertical,
  Grab,
  ChevronUp,
  X,
} from "lucide-react";
import React from "react";

import {
  TOWER_DATA,
  TOWER_ROLE_STYLES,
  TOWER_TAGS,
  TOWER_TAG_DEFS,
} from "../../constants";
import { TowerSprite } from "../../sprites";
import type { TowerType, DraggingTower } from "../../types";
import { OrnateFrame } from "./primitives/OrnateFrame";
import { TagIcon } from "./primitives/TagBadge";
import { useIsTouchDevice, useResponsiveSizes } from "./system/hooks";
import {
  PANEL,
  GOLD,
  DIVIDER,
  SELECTED,
  NEUTRAL,
  panelGradientReversed,
} from "./system/theme";

const BUILD_TOWER_ORDER: TowerType[] = [
  "station",
  "cannon",
  "lab",
  "arch",
  "library",
  "mortar",
  "club",
];

interface BuildMenuProps {
  pawPoints: number;
  buildingTower: TowerType | null;
  setBuildingTower: (tower: TowerType | null) => void;
  setIsBuildDragging: (dragging: boolean) => void;
  setHoveredBuildTower: (tower: TowerType | null) => void;
  hoveredTower: string | null;
  setHoveredTower: (tower: string | null) => void;
  setDraggingTower: (dragging: DraggingTower | null) => void;
  onTouchDragMove: (
    clientX: number,
    clientY: number,
    towerType: TowerType
  ) => void;
  onTouchDragEnd: (clientX: number, clientY: number) => void;
  placedTowers: Record<TowerType, number>;
  allowedTowers?: TowerType[] | null;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  pawPoints,
  buildingTower,
  setBuildingTower,
  setIsBuildDragging,
  setHoveredBuildTower,
  // hoveredTower — kept in props interface for parent but unused here
  setHoveredTower,
  setDraggingTower,
  onTouchDragMove,
  onTouchDragEnd,
  placedTowers,
  allowedTowers,
}) => {
  const isTouchDevice = useIsTouchDevice();
  const sizes = useResponsiveSizes();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pointerDownTowerRef = React.useRef<{
    tower: TowerType;
    wasSelected: boolean;
  } | null>(null);

  return (
    <>
      <div className="pointer-events-none relative h-16 sm:hidden">
        {mobileMenuOpen ? (
          <div
            className="pointer-events-auto absolute bottom-[4.5rem] left-2 right-2 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md"
            style={{
              background:
                "linear-gradient(160deg, rgba(35,25,12,0.98), rgba(14,9,4,0.98))",
              border: `1.5px solid ${GOLD.border35}`,
              boxShadow:
                "0 16px 38px rgba(0,0,0,0.66), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="mb-2 flex min-h-10 items-center justify-between gap-2 pl-1">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-200">
                  <BrickWallShield size={16} /> Build defense
                </div>
                <div className="mt-0.5 text-[9px] text-amber-500/80">
                  Choose a tower, then tap an open tile.
                </div>
              </div>
              <button
                type="button"
                aria-label="Close build menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-amber-300 active:scale-95"
                style={{
                  background: PANEL.bgWarmMid,
                  border: `1px solid ${GOLD.border25}`,
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BUILD_TOWER_ORDER.map((towerType) => {
                const data = TOWER_DATA[towerType];
                const isRestricted =
                  !!allowedTowers && allowedTowers.length > 0
                    ? !allowedTowers.includes(towerType)
                    : false;
                const canAfford = pawPoints >= data.cost;
                const canUse = canAfford && !isRestricted;
                const isSelected = buildingTower === towerType;
                const role = TOWER_ROLE_STYLES[towerType];

                return (
                  <button
                    key={towerType}
                    type="button"
                    disabled={!canUse}
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        setBuildingTower(null);
                        setHoveredBuildTower(null);
                        setHoveredTower(null);
                      } else {
                        setBuildingTower(towerType);
                        setHoveredBuildTower(towerType);
                        setHoveredTower(towerType);
                      }
                      setDraggingTower(null);
                      setIsBuildDragging(false);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl px-1 py-1.5 transition-transform active:scale-95 ${canUse ? "" : "opacity-40"}`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(145deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`
                        : `linear-gradient(145deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                      border: isSelected
                        ? `2px solid ${GOLD.accentBorder50}`
                        : `1.5px solid ${canUse ? role.accent : NEUTRAL.border}`,
                      boxShadow: isSelected
                        ? `0 0 14px ${GOLD.accentGlow10}, inset 0 1px 0 rgba(255,255,255,0.07)`
                        : "inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    <TowerSprite type={towerType} size={34} />
                    <span className="max-w-full truncate text-[9px] font-bold leading-tight text-amber-100">
                      {data.name}
                    </span>
                    <span
                      className={`mt-0.5 flex items-center gap-0.5 text-[9px] font-black ${canAfford ? "text-amber-400" : "text-red-300"}`}
                    >
                      <PawPrint size={9} /> {data.cost}
                    </span>
                    {isRestricted ? (
                      <span className="absolute inset-x-1 top-1 rounded bg-red-950/90 px-1 py-0.5 text-[8px] font-bold text-red-200">
                        Locked
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-label={
            buildingTower
              ? `Change ${TOWER_DATA[buildingTower].name} placement`
              : "Open build menu"
          }
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="pointer-events-auto absolute bottom-2 left-1/2 flex h-14 min-w-[4.5rem] -translate-x-1/2 flex-col items-center justify-center rounded-2xl px-2 text-amber-100 shadow-2xl active:scale-95"
          style={{
            background: buildingTower
              ? `linear-gradient(160deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`
              : "linear-gradient(160deg, rgba(88,55,16,0.98), rgba(34,20,7,0.98))",
            border: buildingTower
              ? `2px solid ${GOLD.accentBorder50}`
              : `2px solid ${GOLD.border35}`,
            boxShadow: buildingTower
              ? `0 0 20px ${GOLD.accentGlow10}, 0 8px 22px rgba(0,0,0,0.55)`
              : "0 8px 22px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {buildingTower ? (
            <TowerSprite type={buildingTower} size={30} />
          ) : (
            <BrickWallShield size={24} className="text-amber-300" />
          )}
          <span className="text-[9px] font-black uppercase tracking-[0.12em]">
            {buildingTower ? "Place" : "Build"}
          </span>
          <ChevronUp
            size={12}
            className={`absolute -top-1 rounded-full bg-amber-950 text-amber-300 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div className="hidden sm:block">
        <OrnateFrame
          className="shadow-xl backdrop-blur-sm"
          style={{ border: `2px solid ${GOLD.border35}` }}
          cornerSize={24}
          cornerVariant="compact"
          sideBorderVariant="compact"
          topBottomBorderVariant="compact"
        >
          <div
            data-tutorial="build-menu"
            className="relative z-20"
            style={{
              background: panelGradientReversed,
            }}
          >
            {/* Top gradient line */}
            <div
              className="h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)`,
              }}
            />

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
                {BUILD_TOWER_ORDER.map((towerType) => {
                  const data = TOWER_DATA[towerType];
                  const isRestricted =
                    !!allowedTowers && allowedTowers.length > 0
                      ? !allowedTowers.includes(towerType)
                      : false;
                  const canAfford = pawPoints >= data.cost;
                  const canUse = canAfford && !isRestricted;
                  const isSelected = buildingTower === towerType;
                  const towerCount = placedTowers[towerType] || 0;
                  const role = TOWER_ROLE_STYLES[towerType];
                  const tags = TOWER_TAGS[towerType];
                  return (
                    <div
                      key={towerType}
                      className="relative flex-1 min-w-[2.75rem] sm:min-w-0"
                    >
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          if (!canUse) {
                            return;
                          }
                          if (e.pointerType === "mouse" && e.button !== 0) {
                            return;
                          }
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
                        onPointerMove={(e) => {
                          if (e.pointerType !== "touch") {
                            return;
                          }
                          onTouchDragMove(e.clientX, e.clientY, towerType);
                        }}
                        onPointerUp={(e) => {
                          if (e.pointerType === "touch") {
                            onTouchDragEnd(e.clientX, e.clientY);
                          }
                          setIsBuildDragging(false);
                        }}
                        onPointerCancel={() => {
                          setIsBuildDragging(false);
                          setDraggingTower(null);
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
                        className={`relative w-full transition-all rounded-xl whitespace-nowrap touch-none ${
                          isSelected
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
                        {/* Role accent — glowing bottom edge */}
                        <div
                          className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${role.accent} 30%, ${role.text} 50%, ${role.accent} 70%, transparent)`,
                          }}
                        />
                        <div
                          className="absolute bottom-0 left-6 right-6 h-[3px] rounded-full blur-[2px]"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${role.accent} 40%, transparent)`,
                          }}
                        />

                        <div
                          className="absolute inset-[2px] rounded-[10px] pointer-events-none"
                          style={{
                            border: isSelected
                              ? `1px solid ${GOLD.accentBorder15}`
                              : canUse
                                ? `1px solid ${GOLD.innerBorder10}`
                                : "none",
                          }}
                        />

                        {isRestricted && (
                          <span className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 bg-red-950/75 border border-red-500/40 text-red-200 text-[7px] sm:text-[8px] px-1 py-[1px] rounded z-10">
                            Locked
                          </span>
                        )}

                        {/* ── Mobile: compact vertical card ── */}
                        <div className="flex sm:hidden flex-col items-center py-1.5 px-1 gap-0.5 relative">
                          <div
                            className="w-6 h-12 flex items-center justify-center relative"
                            style={{
                              height: sizes.towerIcon,
                              width: sizes.towerIcon,
                            }}
                          >
                            <div
                              className="absolute inset-0 rounded-full blur-[6px] opacity-60 z-0"
                              style={{
                                background: `radial-gradient(circle, ${role.accent}, transparent 70%)`,
                              }}
                            />
                            <div className="relative z-10">
                              <TowerSprite
                                type={towerType}
                                size={sizes.towerIcon}
                              />
                            </div>
                          </div>
                          <span className="text-[7px] font-bold text-amber-400 flex items-center gap-0.5 leading-none">
                            <PawPrint size={7} />
                            {data.cost}
                          </span>
                          <div className="flex items-center gap-[2px]">
                            {tags.map((tag) => (
                              <TagIcon key={tag} tag={tag} size={8} />
                            ))}
                          </div>
                        </div>

                        {/* ── Desktop: horizontal detail card ── */}
                        <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-2">
                          <div
                            className="flex-shrink-0 w-10 flex items-center justify-center relative"
                            style={{ height: sizes.towerIcon }}
                          >
                            <div
                              className="absolute inset-[-4px] rounded-full blur-[8px] opacity-50 z-0"
                              style={{
                                background: `radial-gradient(circle, ${role.accent}, transparent 70%)`,
                              }}
                            />
                            <div className="relative z-10">
                              <TowerSprite
                                type={towerType}
                                size={sizes.towerIcon}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <div className="font-bold text-[10px] text-amber-200 leading-tight truncate max-w-full">
                              {data.name}
                            </div>
                            <div className="text-[9px] text-amber-400 flex items-center gap-1">
                              <PawPrint size={10} /> {data.cost} PP
                            </div>
                            <div className="flex items-center gap-[3px] mt-0.5">
                              {tags.map((tag, i) => {
                                const def = TOWER_TAG_DEFS[tag];
                                if (i === 0) {
                                  return (
                                    <span
                                      key={tag}
                                      className={`flex items-center gap-[2px] text-[7px] font-bold uppercase tracking-wider ${def.textClass}
                                rounded-full px-1 py-0.5 border ${def.borderClass}
                                bg-${def.bgClass}
                                text-${def.textClass}
                                
                                `}
                                    >
                                      <TagIcon tag={tag} size={9} />
                                      {def.label}
                                    </span>
                                  );
                                }
                                return (
                                  <span key={tag} title={def.label}>
                                    <TagIcon tag={tag} size={10} />
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <span
                            className="absolute top-1.5 right-1.5 px-1 py-px rounded text-[8px] font-bold tabular-nums z-10"
                            style={{
                              background:
                                towerCount > 0
                                  ? "rgba(120,80,20,0.6)"
                                  : "rgba(50,40,25,0.5)",
                              border: `1px solid ${towerCount > 0 ? "rgba(180,140,60,0.3)" : "rgba(70,55,30,0.2)"}`,
                              color:
                                towerCount > 0
                                  ? "rgb(252,211,77)"
                                  : "rgba(160,140,100,0.5)",
                            }}
                          >
                            x{towerCount}
                          </span>
                          {isSelected ? (
                            <Grab
                              size={18}
                              className="text-amber-400 absolute bottom-1.5 right-1.5"
                            />
                          ) : (
                            <GripVertical
                              size={16}
                              className="text-amber-600/70 absolute bottom-2 right-1"
                            />
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)`,
            }}
          />
        </OrnateFrame>
      </div>
    </>
  );
};
