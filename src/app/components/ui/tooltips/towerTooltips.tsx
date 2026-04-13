"use client";

import {
  AlertTriangle,
  Ban,
  Coins,
  CoinsIcon,
  EyeOff,
  Fence,
  Gauge,
  Mountain,
  Music,
  Snowflake,
  Sparkles,
  Swords,
  Target,
  Timer,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";
import React from "react";

import {
  STATION_TROOP_RANGE,
  TOWER_DATA,
  TOWER_TAGS,
} from "../../../constants";
import { calculateTowerStats } from "../../../constants/towerStats";
import { TowerSprite } from "../../../sprites";
import type { Position, Tower, TowerType } from "../../../types";
import { TagBadge } from "../primitives/TagBadge";
import { GOLD, PANEL, dividerGradient, panelGradient } from "../system/theme";
import { getTooltipPosition } from "./tooltipPositioning";

interface TooltipProps {
  content: React.ReactNode;
  position: Position;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, position }) => {
  const coords = getTooltipPosition(position, { height: 80, width: 200 });

  return (
    <div
      className="fixed pointer-events-none px-3 py-2 shadow-2xl rounded-lg max-w-[200px] backdrop-blur-md"
      style={{
        background: panelGradient,
        border: `1.5px solid ${GOLD.border30}`,
        boxShadow: `0 0 20px ${GOLD.glow07}`,
        left: coords.left,
        top: coords.top,
        zIndex: 250,
      }}
    >
      {content}
    </div>
  );
};

interface TowerHoverTooltipProps {
  tower: Tower;
  position: Position;
}

export const TowerHoverTooltip: React.FC<TowerHoverTooltipProps> = ({
  tower,
  position,
}) => {
  const towerData = TOWER_DATA[tower.type];
  const stats = calculateTowerStats(
    tower.type,
    tower.level,
    tower.upgrade,
    tower.rangeBoost || 1,
    tower.damageBoost || 1
  );

  const hasRangeBuff = (tower.rangeBoost || 1) > 1;
  const hasDamageBuff = (tower.damageBoost || 1) > 1;
  const hasAttackSpeedBuff = (tower.attackSpeedBoost || 1) > 1;
  const coords = getTooltipPosition(position, { height: 360, width: 260 });

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{
        background: panelGradient,
        border: `1.5px solid ${GOLD.border30}`,
        boxShadow: `0 0 24px ${GOLD.glow07}, inset 0 1px 0 ${GOLD.innerBorder08}`,
        left: coords.left,
        top: coords.top,
        width: 260,
        zIndex: 250,
      }}
    >
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD.bright45}, transparent)`,
        }}
      />
      <div
        className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
        style={{ border: `1px solid ${GOLD.innerBorder08}` }}
      />
      <div
        className="px-3 py-2 relative z-10"
        style={{
          background: PANEL.bgWarmMid,
          borderBottom: `1px solid ${GOLD.border25}`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="shrink-0">
            <TowerSprite
              type={tower.type}
              size={36}
              level={tower.level}
              upgrade={tower.upgrade}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-amber-200 text-sm leading-tight truncate">
                {towerData.name}
              </span>
              <div className="flex items-center gap-px shrink-0">
                {[...Array(tower.level)].map((_, index) => (
                  <span key={index} className="text-yellow-400 text-[10px]">
                    ★
                  </span>
                ))}
              </div>
            </div>
            {tower.level === 4 && tower.upgrade && (
              <div className="text-[9px] text-amber-400/80 font-medium">
                {towerData.upgrades[tower.upgrade].name}
              </div>
            )}
            <div className="flex flex-wrap gap-0.5 mt-1">
              {TOWER_TAGS[tower.type].map((tag) => (
                <TagBadge key={tag} tag={tag} size={8} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-2">
        {tower.debuffs &&
          tower.debuffs.some((debuff) => debuff.until > Date.now()) &&
          (() => {
            const activeDebuffs = tower.debuffs.filter(
              (debuff) => debuff.until > Date.now()
            );
            const disableDebuff = activeDebuffs.find(
              (debuff) => debuff.type === "disable"
            );
            const otherDebuffs = activeDebuffs.filter(
              (debuff) => debuff.type !== "disable"
            );

            const consolidatedDebuffs = new Map<
              string,
              { type: string; intensity: number; until: number }
            >();
            for (const debuff of otherDebuffs) {
              const existing = consolidatedDebuffs.get(debuff.type);
              if (!existing || debuff.intensity > existing.intensity) {
                consolidatedDebuffs.set(debuff.type, debuff);
              }
            }

            const disableThemes = {
              freeze: {
                bgClass: "bg-gradient-to-r from-cyan-950/80 to-blue-950/80",
                borderClass: "border-cyan-500/60",
                headerColor: "text-cyan-300",
                icon: <Snowflake size={12} />,
                label: "FROZEN",
                tagClass: "bg-cyan-900/60 text-cyan-200 border-cyan-600/40",
              },
              hold: {
                bgClass: "bg-gradient-to-r from-amber-950/80 to-red-950/80",
                borderClass: "border-amber-600/60",
                headerColor: "text-amber-300",
                icon: <Ban size={12} />,
                label: "ON HOLD",
                tagClass: "bg-amber-900/60 text-amber-200 border-amber-600/40",
              },
              petrify: {
                bgClass: "bg-gradient-to-r from-stone-900/80 to-gray-900/80",
                borderClass: "border-stone-500/60",
                headerColor: "text-stone-300",
                icon: <Mountain size={12} />,
                label: "PETRIFIED",
                tagClass: "bg-stone-800/60 text-stone-200 border-stone-600/40",
              },
              stun: {
                bgClass: "bg-gradient-to-r from-yellow-950/80 to-orange-950/80",
                borderClass: "border-yellow-500/60",
                headerColor: "text-yellow-300",
                icon: <Zap size={12} />,
                label: "STUNNED",
                tagClass:
                  "bg-yellow-900/60 text-yellow-200 border-yellow-600/40",
              },
            } as const;

            return (
              <>
                {disableDebuff &&
                  (() => {
                    const flavor = ((
                      disableDebuff as typeof disableDebuff & {
                        disableFlavor?: string;
                      }
                    ).disableFlavor ?? "stun") as keyof typeof disableThemes;
                    const theme = disableThemes[flavor] || disableThemes.stun;
                    const remaining = Math.max(
                      0,
                      (disableDebuff.until - Date.now()) / 1000
                    );
                    const { abilityName } =
                      disableDebuff as typeof disableDebuff & {
                        abilityName?: string;
                      };

                    return (
                      <div
                        className={`mb-2 p-2 rounded-lg border ${theme.bgClass} ${theme.borderClass}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div
                            className={`flex items-center gap-1.5 ${theme.headerColor}`}
                          >
                            {theme.icon}
                            <span className="text-[10px] font-black tracking-wider">
                              {theme.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-white/80 font-mono">
                            <Timer size={10} className="opacity-70" />
                            <span>{remaining.toFixed(1)}s</span>
                          </div>
                        </div>
                        {abilityName && (
                          <div className="text-[8px] text-white/50 mb-1">
                            {abilityName}
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border w-fit ${theme.tagClass}`}
                        >
                          <Ban size={9} />
                          <span>Cannot attack</span>
                        </div>
                      </div>
                    );
                  })()}

                {consolidatedDebuffs.size > 0 && (
                  <div className="mb-2 p-1.5 bg-red-950/60 rounded border border-red-800/50">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertTriangle size={10} className="text-red-400" />
                      <span className="text-[9px] font-bold text-red-300">
                        DEBUFFED
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[...consolidatedDebuffs.values()].map(
                        (debuff, index) => {
                          const remaining = Math.ceil(
                            (debuff.until - Date.now()) / 1000
                          );
                          const debuffInfo: Record<
                            string,
                            {
                              icon: React.ReactNode;
                              desc: string;
                              color: string;
                            }
                          > = {
                            blind: {
                              color: "text-purple-400",
                              desc: `-${Math.round(debuff.intensity * 100)}% Range`,
                              icon: <EyeOff size={10} />,
                            },
                            slow: {
                              color: "text-blue-400",
                              desc: `-${Math.round(debuff.intensity * 100)}% Atk Spd`,
                              icon: <Timer size={10} />,
                            },
                            weaken: {
                              color: "text-red-400",
                              desc: `-${Math.round(debuff.intensity * 100)}% DMG`,
                              icon: <TrendingDown size={10} />,
                            },
                          };
                          const info = debuffInfo[debuff.type];
                          if (!info) {
                            return null;
                          }
                          return (
                            <div
                              key={index}
                              className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 ${info.color}`}
                            >
                              {info.icon}
                              <span>{info.desc}</span>
                              <span className="text-white/50">
                                ({remaining}s)
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

        {(hasRangeBuff || hasDamageBuff || hasAttackSpeedBuff) && (
          <div className="mb-2 p-1.5 bg-emerald-950/60 rounded border border-emerald-700/50">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles size={10} className="text-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-300">
                BUFFED
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {hasRangeBuff && tower.type !== "station" && (
                <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-cyan-400">
                  <Target size={10} />
                  <span>
                    +{Math.round(((tower.rangeBoost || 1) - 1) * 100)}% Range
                  </span>
                </div>
              )}
              {hasRangeBuff && tower.type === "station" && (
                <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-cyan-400">
                  <Fence size={10} />
                  <span>
                    +{Math.round(((tower.rangeBoost || 1) - 1) * 100)}% Deploy
                  </span>
                </div>
              )}
              {hasDamageBuff && (
                <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-orange-400">
                  <Swords size={10} />
                  <span>
                    +{Math.round(((tower.damageBoost || 1) - 1) * 100)}% DMG
                  </span>
                </div>
              )}
              {hasAttackSpeedBuff && (
                <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-indigo-300">
                  <Timer size={10} />
                  <span>
                    +{Math.round(((tower.attackSpeedBoost || 1) - 1) * 100)}%
                    Atk Spd
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className="rounded-lg px-2.5 py-2"
          style={{
            background: PANEL.bgDeep,
            border: `1px solid ${GOLD.innerBorder08}`,
            boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
          }}
        >
          <div className="text-[8px] text-amber-500/50 uppercase tracking-[0.15em] font-bold mb-1.5">
            Stats
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
            {stats.damage > 0 && (
              <div className="flex items-center gap-1">
                <Swords size={11} className="text-red-400" />
                <span className="text-red-300 font-medium">
                  {Math.floor(stats.damage)}
                </span>
              </div>
            )}
            {stats.range > 0 && tower.type !== "club" && (
              <div className="flex items-center gap-1">
                <Target size={11} className="text-blue-400" />
                <span className="text-blue-300 font-medium">
                  {Math.floor(stats.range)}
                </span>
              </div>
            )}
            {stats.attackSpeed > 0 && (
              <div className="flex items-center gap-1">
                <Gauge size={11} className="text-green-400" />
                <span className="text-green-300 font-medium">
                  {(stats.attackSpeed / 1000).toFixed(1)}s
                </span>
              </div>
            )}
            {stats.slowAmount && stats.slowAmount > 0 && (
              <div className="flex items-center gap-1">
                <Snowflake size={11} className="text-purple-400" />
                <span className="text-purple-300 font-medium">
                  {Math.round(stats.slowAmount * 100)}%
                </span>
              </div>
            )}
            {stats.chainTargets && stats.chainTargets > 1 && (
              <div className="flex items-center gap-1">
                {tower.type === "lab" ? (
                  <Zap size={11} className="text-cyan-400" />
                ) : (
                  <Users size={11} className="text-yellow-400" />
                )}
                <span
                  className={
                    tower.type === "lab"
                      ? "text-cyan-300 font-medium"
                      : "text-yellow-300 font-medium"
                  }
                >
                  {stats.chainTargets}
                </span>
              </div>
            )}
            {stats.crescendoMaxStacks && stats.crescendoMaxStacks > 0 && (
              <div className="flex items-center gap-1">
                <Music size={11} className="text-emerald-400" />
                <span className="text-emerald-300 font-medium">
                  {tower.crescendoStacks || 0}/{stats.crescendoMaxStacks}
                </span>
              </div>
            )}
            {tower.type === "club" && stats.income && (
              <div className="flex items-center gap-1">
                <CoinsIcon size={11} className="text-amber-400" />
                <span className="text-amber-300 font-medium">
                  +{stats.income} PP/{(stats.incomeInterval || 8000) / 1000}s
                </span>
              </div>
            )}
            {tower.type === "station" &&
              (() => {
                const baseDeployRange =
                  TOWER_DATA.station.spawnRange || STATION_TROOP_RANGE;
                const boostedDeployRange = Math.floor(
                  baseDeployRange * (tower.rangeBoost || 1)
                );
                const isDeployBoosted = (tower.rangeBoost || 1) > 1;
                return (
                  <div className="flex items-center gap-1">
                    <Fence
                      size={11}
                      className={
                        isDeployBoosted ? "text-cyan-400" : "text-orange-400"
                      }
                    />
                    <span
                      className={
                        isDeployBoosted
                          ? "text-cyan-300 font-medium"
                          : "text-orange-300 font-medium"
                      }
                    >
                      {isDeployBoosted ? boostedDeployRange : baseDeployRange}
                    </span>
                    <span className="text-stone-500 text-[9px]">deploy</span>
                  </div>
                );
              })()}
          </div>
        </div>

        {tower.type === "club" && tower.level === 4 && tower.upgrade && (
          <>
            <div
              className="my-2 h-px"
              style={{ background: dividerGradient }}
            />
            <div
              className="rounded-lg px-2.5 py-1.5"
              style={{
                background: PANEL.bgDeep,
                border: `1px solid ${GOLD.innerBorder08}`,
              }}
            >
              {tower.upgrade === "A" && (
                <div className="flex items-center gap-1 text-[10px]">
                  <Target size={11} className="text-cyan-400" />
                  <span className="text-cyan-300 font-medium">+15% Range</span>
                  <span className="text-cyan-500/70 text-[9px]">
                    to nearby towers
                  </span>
                </div>
              )}
              {tower.upgrade === "B" && (
                <div className="flex items-center gap-1 text-[10px]">
                  <Swords size={11} className="text-orange-400" />
                  <span className="text-orange-300 font-medium">
                    +15% Damage
                  </span>
                  <span className="text-orange-500/70 text-[9px]">
                    to nearby towers
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {tower.type === "station" && (
          <div className="flex items-center gap-1 mt-2 text-[10px]">
            <Users size={11} className="text-amber-400" />
            <span className="text-amber-300">
              Troops: {tower.currentTroopCount || 0}/3
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface BuildTowerTooltipProps {
  towerType: TowerType;
  position: Position;
}

export const BuildTowerTooltip: React.FC<BuildTowerTooltipProps> = ({
  towerType,
  position,
}) => {
  const towerData = TOWER_DATA[towerType];
  const coords = getTooltipPosition(position, { height: 160, width: 260 });

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{
        background: panelGradient,
        border: `1.5px solid ${GOLD.border30}`,
        boxShadow: `0 0 24px ${GOLD.glow07}, inset 0 1px 0 ${GOLD.innerBorder08}`,
        left: coords.left,
        top: coords.top,
        width: 260,
        zIndex: 250,
      }}
    >
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD.bright45}, transparent)`,
        }}
      />
      <div
        className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
        style={{ border: `1px solid ${GOLD.innerBorder08}` }}
      />
      <div
        className="px-3 py-2 flex items-center gap-2.5 relative z-10"
        style={{
          background: PANEL.bgWarmMid,
          borderBottom: `1px solid ${GOLD.border25}`,
        }}
      >
        <div className="shrink-0">
          <TowerSprite type={towerType} size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-amber-200 text-sm leading-tight block truncate">
            {towerData.name}
          </span>
          <div className="text-[8px] text-amber-500/60 uppercase tracking-[0.2em] mt-0.5 font-semibold">
            Tower
          </div>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-md shrink-0"
          style={{
            background: PANEL.bgDeep,
            border: `1px solid ${GOLD.innerBorder12}`,
          }}
        >
          <Coins size={12} className="text-amber-400" />
          <span className="text-amber-300 text-xs font-bold">
            {towerData.cost}
          </span>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[11px] text-amber-100/70 leading-relaxed mb-2.5">
          {towerData.desc}
        </p>
        <div
          className="rounded-lg px-2.5 py-2"
          style={{
            background: PANEL.bgDeep,
            border: `1px solid ${GOLD.innerBorder08}`,
            boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
          }}
        >
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
            {towerData.damage > 0 && (
              <div className="flex items-center gap-1">
                <Swords size={11} className="text-red-400" />
                <span className="text-red-300 font-medium">
                  {towerData.damage}
                </span>
              </div>
            )}
            {towerData.range > 0 && (
              <div className="flex items-center gap-1">
                <Target size={11} className="text-blue-400" />
                <span className="text-blue-300 font-medium">
                  {towerData.range}
                </span>
              </div>
            )}
            {towerData.attackSpeed > 0 && (
              <div className="flex items-center gap-1">
                <Gauge size={11} className="text-green-400" />
                <span className="text-green-300 font-medium">
                  {(towerData.attackSpeed / 1000).toFixed(1)}s
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
