"use client";

import React from "react";
import {
  Timer,
  Zap,
  Users,
  Swords,
  Target,
  Coins,
  Gauge,
  Shield,
  Crown,
  CoinsIcon,
  Snowflake,
  Lock,
  Activity,
  Home,
  Sparkles,
  Flame,
  TrendingUp,
  TrendingDown,
  Mountain,
  Landmark,
  Eye,
  EyeOff,
  AlertTriangle,
  Wind,
  Ban,
  Diamond,
  Fence,
  Skull,
} from "lucide-react";
import type { Tower, TowerType, Position } from "../../types";
import { TOWER_DATA } from "../../constants";
import { calculateTowerStats } from "../../constants/towerStats";
import { PANEL, GOLD, RED_CARD, panelGradient } from "./theme";

// =============================================================================
// TOOLTIP COMPONENT
// =============================================================================

interface TooltipProps {
  content: React.ReactNode;
  position: Position;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, position }) => {
  const tooltipWidth = 200;
  const tooltipHeight = 80;
  let tooltipX = position.x + 20;
  let tooltipY = position.y - 30;
  if (tooltipX + tooltipWidth > window.innerWidth - 10)
    tooltipX = position.x - tooltipWidth - 20;
  if (tooltipY < 60) tooltipY = 60;
  if (tooltipY + tooltipHeight > window.innerHeight - 10)
    tooltipY = window.innerHeight - tooltipHeight - 10;

  return (
    <div
      className="fixed pointer-events-none px-3 py-2 shadow-2xl rounded-lg max-w-[200px] backdrop-blur-md"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250, background: panelGradient, border: '1.5px solid ' + GOLD.border30, boxShadow: '0 0 20px ' + GOLD.glow07 }}
    >
      {content}
    </div>
  );
};

// Tower Hover Tooltip - specialized for tower hover display
interface TowerHoverTooltipProps {
  tower: Tower;
  position: Position;
}

export const TowerHoverTooltip: React.FC<TowerHoverTooltipProps> = ({ tower, position }) => {
  const tData = TOWER_DATA[tower.type];
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

  const tooltipWidth = 220;
  let tooltipX = position.x + 20;
  let tooltipY = position.y - 30;
  if (tooltipX + tooltipWidth > window.innerWidth - 10)
    tooltipX = position.x - tooltipWidth - 20;
  if (tooltipY < 60) tooltipY = 60;

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250, width: tooltipWidth, background: panelGradient, border: '1.5px solid ' + GOLD.border30, boxShadow: '0 0 20px ' + GOLD.glow07 + ', inset 0 0 10px ' + GOLD.glow04 }}
    >
      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: '1px solid ' + GOLD.innerBorder08 }} />
      {/* Header */}
      <div className="px-3 py-1.5 relative z-10" style={{ background: PANEL.bgWarmMid, borderBottom: '1px solid ' + GOLD.border25 }}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-amber-200 text-sm">{tData.name}</span>
          <div className="flex items-center gap-0.5">
            {[...Array(tower.level)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-[10px]">★</span>
            ))}
          </div>
        </div>
        {tower.level === 4 && tower.upgrade && (
          <div className="text-[9px] text-amber-400">{tData.upgrades[tower.upgrade].name}</div>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        {/* Debuff indicator - show active debuffs from enemies */}
        {tower.debuffs && tower.debuffs.filter(d => d.until > Date.now()).length > 0 && (() => {
          const activeDebuffs = tower.debuffs.filter(d => d.until > Date.now());
          const disableDebuff = activeDebuffs.find(d => d.type === 'disable');
          const otherDebuffs = activeDebuffs.filter(d => d.type !== 'disable');

          // Consolidate non-disable debuffs by type
          const consolidatedDebuffs = new Map<string, { type: string; intensity: number; until: number }>();
          for (const d of otherDebuffs) {
            const existing = consolidatedDebuffs.get(d.type);
            if (!existing || d.intensity > existing.intensity) {
              consolidatedDebuffs.set(d.type, d);
            }
          }

          const disableThemes = {
            freeze: { icon: <Snowflake size={12} />, label: "FROZEN", bgClass: "bg-gradient-to-r from-cyan-950/80 to-blue-950/80", borderClass: "border-cyan-500/60", headerColor: "text-cyan-300", tagClass: "bg-cyan-900/60 text-cyan-200 border-cyan-600/40", desc: "Tower frozen solid" },
            petrify: { icon: <Mountain size={12} />, label: "PETRIFIED", bgClass: "bg-gradient-to-r from-stone-900/80 to-gray-900/80", borderClass: "border-stone-500/60", headerColor: "text-stone-300", tagClass: "bg-stone-800/60 text-stone-200 border-stone-600/40", desc: "Turned to stone" },
            hold: { icon: <Lock size={12} />, label: "ON HOLD", bgClass: "bg-gradient-to-r from-amber-950/80 to-red-950/80", borderClass: "border-amber-600/60", headerColor: "text-amber-300", tagClass: "bg-amber-900/60 text-amber-200 border-amber-600/40", desc: "Administratively held" },
            stun: { icon: <Zap size={12} />, label: "STUNNED", bgClass: "bg-gradient-to-r from-yellow-950/80 to-orange-950/80", borderClass: "border-yellow-500/60", headerColor: "text-yellow-300", tagClass: "bg-yellow-900/60 text-yellow-200 border-yellow-600/40", desc: "Stunned into inaction" },
          };

          return (
            <>
              {/* Full-width disable banner when tower is disabled */}
              {disableDebuff && (() => {
                const flavor = (disableDebuff as typeof disableDebuff & { disableFlavor?: string }).disableFlavor as keyof typeof disableThemes || 'stun';
                const theme = disableThemes[flavor] || disableThemes.stun;
                const remaining = Math.max(0, (disableDebuff.until - Date.now()) / 1000);
                const abilityName = (disableDebuff as typeof disableDebuff & { abilityName?: string }).abilityName;
                return (
                  <div className={`mb-2 p-2 rounded-lg border ${theme.bgClass} ${theme.borderClass}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`flex items-center gap-1.5 ${theme.headerColor}`}>
                        {theme.icon}
                        <span className="text-[10px] font-black tracking-wider">{theme.label}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-white/80 font-mono">
                        <Timer size={10} className="opacity-70" />
                        <span>{remaining.toFixed(1)}s</span>
                      </div>
                    </div>
                    {abilityName && (
                      <div className="text-[8px] text-white/50 mb-1">{abilityName}</div>
                    )}
                    <div className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border w-fit ${theme.tagClass}`}>
                      <Ban size={9} />
                      <span>Cannot attack</span>
                    </div>
                  </div>
                );
              })()}

              {/* Other debuffs (slow/weaken/blind) */}
              {consolidatedDebuffs.size > 0 && (
                <div className="mb-2 p-1.5 bg-red-950/60 rounded border border-red-800/50">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle size={10} className="text-red-400" />
                    <span className="text-[9px] font-bold text-red-300">DEBUFFED</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(consolidatedDebuffs.values()).map((debuff, i) => {
                      const remaining = Math.ceil((debuff.until - Date.now()) / 1000);
                      const debuffInfo: Record<string, { icon: React.ReactNode; label: string; color: string; desc: string }> = {
                        slow: { icon: <Timer size={10} />, label: "Slowed", color: "text-blue-400", desc: `-${Math.round(debuff.intensity * 100)}% Atk Spd` },
                        weaken: { icon: <TrendingDown size={10} />, label: "Weakened", color: "text-red-400", desc: `-${Math.round(debuff.intensity * 100)}% DMG` },
                        blind: { icon: <EyeOff size={10} />, label: "Blinded", color: "text-purple-400", desc: `-${Math.round(debuff.intensity * 100)}% Range` },
                      };
                      const info = debuffInfo[debuff.type];
                      if (!info) return null;
                      return (
                        <div key={i} className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 ${info.color}`}>
                          {info.icon}
                          <span>{info.desc}</span>
                          <span className="text-white/50">({remaining}s)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* Buff indicator - styled similar to debuff box but with positive colors */}
        {(hasRangeBuff || hasDamageBuff || hasAttackSpeedBuff) && (
          <div className="mb-2 p-1.5 bg-emerald-950/60 rounded border border-emerald-700/50">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles size={10} className="text-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-300">BUFFED</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {hasRangeBuff && tower.type !== "station" && (
                <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-cyan-400">
                  <Target size={10} />
                  <span>+{Math.round(((tower.rangeBoost || 1) - 1) * 100)}% Range</span>
                </div>
              )}
              {hasRangeBuff && tower.type === "station" && (
                <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-cyan-400">
                  <Fence size={10} />
                  <span>+{Math.round(((tower.rangeBoost || 1) - 1) * 100)}% Deploy</span>
                </div>
              )}
              {hasDamageBuff && (
                <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-orange-400">
                  <Swords size={10} />
                  <span>+{Math.round(((tower.damageBoost || 1) - 1) * 100)}% DMG</span>
                </div>
              )}
              {hasAttackSpeedBuff && (
                <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-indigo-300">
                  <Timer size={10} />
                  <span>+{Math.round(((tower.attackSpeedBoost || 1) - 1) * 100)}% Atk Spd</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          {stats.damage > 0 && (
            <div className="flex items-center gap-1">
              <Swords size={11} className="text-red-400" />
              <span className="text-red-300 font-medium">{Math.floor(stats.damage)}</span>
            </div>
          )}
          {stats.range > 0 && tower.type !== "club" && (
            <div className="flex items-center gap-1">
              <Target size={11} className="text-blue-400" />
              <span className="text-blue-300 font-medium">{Math.floor(stats.range)}</span>
            </div>
          )}
          {stats.attackSpeed > 0 && (
            <div className="flex items-center gap-1">
              <Gauge size={11} className="text-green-400" />
              <span className="text-green-300 font-medium">{(stats.attackSpeed / 1000).toFixed(1)}s</span>
            </div>
          )}
          {stats.slowAmount && stats.slowAmount > 0 && (
            <div className="flex items-center gap-1">
              <Snowflake size={11} className="text-purple-400" />
              <span className="text-purple-300 font-medium">{Math.round(stats.slowAmount * 100)}%</span>
            </div>
          )}
          {stats.chainTargets && stats.chainTargets > 1 && (
            <div className="flex items-center gap-1">
              <Users size={11} className="text-yellow-400" />
              <span className="text-yellow-300 font-medium">{stats.chainTargets}</span>
            </div>
          )}
          {tower.type === "club" && stats.income && (
            <div className="flex items-center gap-1">
              <CoinsIcon size={11} className="text-amber-400" />
              <span className="text-amber-300 font-medium">+{stats.income} PP/{(stats.incomeInterval || 8000) / 1000}s</span>
            </div>
          )}
          {tower.type === "station" && (() => {
            const baseDeployRange = TOWER_DATA.station.spawnRange || 180;
            const boostedDeployRange = Math.floor(baseDeployRange * (tower.rangeBoost || 1));
            const isDeployBoosted = (tower.rangeBoost || 1) > 1;
            return (
              <div className="flex items-center gap-1">
                <Fence size={11} className={isDeployBoosted ? "text-cyan-400" : "text-orange-400"} />
                <span className={isDeployBoosted ? "text-cyan-300 font-medium" : "text-orange-300 font-medium"}>
                  {isDeployBoosted ? boostedDeployRange : baseDeployRange}
                </span>
                <span className="text-stone-500 text-[9px]">deploy</span>
              </div>
            );
          })()}
        </div>

        {/* Level 4 Eating Club Aura Buffs */}
        {tower.type === "club" && tower.level === 4 && tower.upgrade && (
          <div className="mt-2 pt-2 border-t border-amber-700/40">

            {tower.upgrade === "A" && (
              <div className="flex items-center gap-1 text-[10px]">
                <Target size={11} className="text-cyan-400" />
                <span className="text-cyan-300 font-medium">+15% Range</span>
                <span className="text-cyan-500/70 text-[9px]">to nearby towers</span>
              </div>
            )}
            {tower.upgrade === "B" && (
              <div className="flex items-center gap-1 text-[10px]">
                <Swords size={11} className="text-orange-400" />
                <span className="text-orange-300 font-medium">+15% Damage</span>
                <span className="text-orange-500/70 text-[9px]">to nearby towers</span>
              </div>
            )}
          </div>
        )}

        {/* Station troops */}
        {tower.type === "station" && (
          <div className="flex items-center gap-1 mt-1.5 text-[10px]">
            <Users size={11} className="text-amber-400" />
            <span className="text-amber-300">Troops: {tower.currentTroopCount || 0}/3</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Build Tower Tooltip - for hovering over build menu items  
interface BuildTowerTooltipProps {
  towerType: TowerType;
  position: Position;
}

export const BuildTowerTooltip: React.FC<BuildTowerTooltipProps> = ({ towerType, position }) => {
  const tData = TOWER_DATA[towerType];

  const tooltipWidth = 220;
  let tooltipX = position.x + 20;
  let tooltipY = position.y - 30;
  if (tooltipX + tooltipWidth > window.innerWidth - 10)
    tooltipX = position.x - tooltipWidth - 20;
  if (tooltipY < 60) tooltipY = 60;

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250, width: tooltipWidth, background: panelGradient, border: '1.5px solid ' + GOLD.border30, boxShadow: '0 0 20px ' + GOLD.glow07 + ', inset 0 0 10px ' + GOLD.glow04 }}
    >
      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: '1px solid ' + GOLD.innerBorder08 }} />
      {/* Header */}
      <div className="px-3 py-1.5 flex items-center justify-between relative z-10" style={{ background: PANEL.bgWarmMid, borderBottom: '1px solid ' + GOLD.border25 }}>
        <span className="font-bold text-amber-200 text-sm">{tData.name}</span>
        <span className="flex items-center gap-1 text-amber-300 text-xs font-bold">
          <Coins size={12} /> {tData.cost}
        </span>
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        <div className="text-[10px] text-stone-300 mb-2">{tData.desc}</div>

        {/* Stats */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          {tData.damage > 0 && (
            <div className="flex items-center gap-1">
              <Swords size={11} className="text-red-400" />
              <span className="text-red-300 font-medium">{tData.damage}</span>
            </div>
          )}
          {tData.range > 0 && (
            <div className="flex items-center gap-1">
              <Target size={11} className="text-blue-400" />
              <span className="text-blue-300 font-medium">{tData.range}</span>
            </div>
          )}
          {tData.attackSpeed > 0 && (
            <div className="flex items-center gap-1">
              <Gauge size={11} className="text-green-400" />
              <span className="text-green-300 font-medium">{(tData.attackSpeed / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PLACING TROOP INDICATOR
// =============================================================================

export const PlacingTroopIndicator: React.FC = () => {
  return (
    <div
      className="absolute top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 shadow-xl rounded-lg animate-pulse backdrop-blur-sm"
      style={{ zIndex: 150, background: panelGradient, border: '1.5px solid ' + GOLD.border30, boxShadow: '0 0 20px ' + GOLD.glow07 }}
    >
      <div className="text-sm font-bold flex items-center gap-2 tracking-wide">
        <Users size={16} className="text-purple-400" />
        <span className="text-purple-100">Click to Deploy Reinforcements</span>
        <span className="text-purple-400 text-xs">
          (3 Knights with 500 HP each)
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// SPECIAL BUILDING TOOLTIP
// =============================================================================

interface SpecialBuildingTooltipProps {
  type:
    | "vault"
    | "beacon"
    | "shrine"
    | "barracks"
    | "chrono_relay"
    | "sentinel_nexus"
    | "sunforge_orrery";
  hp: number | null;
  maxHp?: number;
  position: Position;
  sentinelTarget?: Position | null;
  sentinelTargeting?: boolean;
}

export const SpecialBuildingTooltip: React.FC<SpecialBuildingTooltipProps> = ({
  type,
  hp,
  maxHp,
  position,
  sentinelTarget,
  sentinelTargeting,
}) => {
  const info = {
    vault: {
      name: "Treasury Vault",
      icon: <Lock className="text-yellow-400" size={18} />,
      desc: "Critical Objective. If destroyed, you lose 10 lives instantly. Enemies will prioritize attacking this!",
      stat: "Objective",
      color: "from-yellow-900/90 to-amber-950/90",
      borderColor: "border-yellow-500",
    },
    beacon: {
      name: "Ancient Beacon",
      icon: <Zap className="text-cyan-400" size={18} />,
      desc: "Energy Spire. Emits a resonance field that boosts the range of all nearby towers and troop deployment range by 20%.",
      stat: "+20% Range & Deploy Buff",
      color: "from-cyan-900/90 to-slate-950/90",
      borderColor: "border-cyan-500",
    },
    shrine: {
      name: "Eldritch Shrine",
      icon: <Sparkles className="text-green-400" size={18} />,
      desc: "Restoration Point. Periodically emits an arcane pulse that heals the Hero and nearby Troops.",
      stat: "Healing Aura",
      color: "from-green-900/90 to-emerald-950/90",
      borderColor: "border-green-500",
    },
    barracks: {
      name: "Frontier Barracks",
      icon: <Home className="text-red-400" size={18} />,
      desc: "Automated Garrison. Periodically deploys up to 3 armored knights to defend the road.",
      stat: "3x Knights Cap",
      color: "from-red-900/90 to-stone-950/90",
      borderColor: "border-red-500",
    },
    chrono_relay: {
      name: "Arcane Time Crystal",
      icon: <Timer className="text-indigo-300" size={18} />,
      desc: "Temporal crystal lattice. Nearby towers lock to its cadence and fire faster.",
      stat: "+Attack Speed Aura",
      color: "from-indigo-900/90 to-slate-950/90",
      borderColor: "border-indigo-400",
    },
    sentinel_nexus: {
      name: "Imperial Red Sentinel",
      icon: <Activity className="text-rose-300" size={18} />,
      desc: "Ancient laser-guided strike core. Every 10s it calls lightning at a locked map coordinate.",
      stat: "Retargetable Strike Beacon",
      color: "from-rose-900/90 to-red-950/90",
      borderColor: "border-rose-400",
    },
    sunforge_orrery: {
      name: "Sunforge Orrery",
      icon: <Flame className="text-orange-300" size={18} />,
      desc: "Offensive astral furnace. Periodically computes enemy density and launches tri-plasma barrages.",
      stat: "Cluster Erasure Barrage",
      color: "from-orange-900/90 to-amber-950/90",
      borderColor: "border-orange-400",
    },
  }[type];

  return (
    <div
      className="fixed pointer-events-none p-4 shadow-2xl rounded-xl w-64 backdrop-blur-md z-[300] overflow-hidden"
      style={{ left: position.x + 20, top: position.y - 100, background: panelGradient, border: '2px solid ' + GOLD.border35, boxShadow: '0 0 25px ' + GOLD.glow07 + ', inset 0 0 15px ' + GOLD.glow04 }}
    >
      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: '1px solid ' + GOLD.innerBorder08 }} />
      <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid ' + GOLD.border25 }}>
        {info.icon}
        <h4 className="font-bold text-amber-100 uppercase tracking-tight">
          {info.name}
        </h4>
      </div>

      <p className="text-[11px] text-amber-200/80 leading-relaxed mb-3">
        {info.desc}
      </p>

      {type === "sentinel_nexus" && (
        <div className="mb-2 rounded-md border border-rose-700/40 bg-rose-950/30 px-2 py-1.5">
          <div className="text-[9px] text-rose-300/80 uppercase tracking-wider mb-1">Target</div>
          <div className="text-[10px] text-rose-100">
            {sentinelTarget
              ? `(${Math.round(sentinelTarget.x)}, ${Math.round(sentinelTarget.y)})`
              : "Acquiring random target..."}
          </div>
          <div className="text-[9px] text-rose-200/70 mt-1">
            {sentinelTargeting
              ? "Click map to set strike target."
              : "Click nexus, then click map to retarget."}
          </div>
        </div>
      )}

      {hp !== null && maxHp && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] mb-1 font-mono">
            <span className="text-amber-400">INTEGRITY</span>
            <span className="text-white">
              {Math.ceil(hp)} / {maxHp}
            </span>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full border border-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-300"
              style={{ width: `${(hp / maxHp) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: PANEL.bgDeep, border: '1px solid ' + GOLD.border25 }}>
        <Activity size={12} className="text-amber-400" />
        <span className="text-[10px] font-bold text-amber-300 uppercase">
          {info.stat}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// LANDMARK TOOLTIP
// =============================================================================

interface LandmarkTooltipProps {
  landmarkType: string;
  position: Position;
}

const LANDMARK_INFO: Record<string, { name: string; icon: React.ReactNode; desc: string; lore: string }> = {
  pyramid: {
    name: "Ancient Pyramid",
    icon: <Landmark className="text-amber-400" size={16} />,
    desc: "A towering stone monument from a forgotten civilization.",
    lore: "Legend says it was built by scholars who discovered the secrets of geometry long before anyone else.",
  },
  sphinx: {
    name: "Sphinx",
    icon: <Eye className="text-amber-400" size={16} />,
    desc: "A mythical guardian carved from living stone.",
    lore: "It asks riddles of all who pass. Most enemies are too dumb to answer correctly.",
  },
  giant_sphinx: {
    name: "Great Sphinx",
    icon: <Eye className="text-amber-400" size={16} />,
    desc: "An enormous sphinx watching over the desert sands.",
    lore: "Its gaze is said to pierce through illusions. Even the bravest foes feel uneasy in its shadow.",
  },
  nassau_hall: {
    name: "Nassau Hall",
    icon: <Home className="text-amber-400" size={16} />,
    desc: "The historic heart of Princeton University, est. 1756.",
    lore: "Once served as the capitol of the United States. Now it serves as the last bastion against the dark horde.",
  },
  ice_fortress: {
    name: "Ice Fortress",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A crystalline citadel forged from eternal frost.",
    lore: "Built during the Great Frost by ice mages who froze an entire river to create its foundations.",
  },
  obsidian_castle: {
    name: "Obsidian Castle",
    icon: <Shield className="text-purple-400" size={16} />,
    desc: "A dark stronghold hewn from volcanic glass.",
    lore: "The castle absorbs light itself. Torches flicker and die within its walls without magical protection.",
  },
  witch_cottage: {
    name: "Witch's Cottage",
    icon: <Sparkles className="text-green-400" size={16} />,
    desc: "A crooked dwelling reeking of potions and old magic.",
    lore: "The witch left years ago, but her cauldron still bubbles. Nobody dares taste what's inside.",
  },
  ruined_temple: {
    name: "Ruined Temple",
    icon: <Landmark className="text-stone-400" size={16} />,
    desc: "Crumbling remains of an ancient place of worship.",
    lore: "The old gods may be gone, but faint hymns can still be heard at midnight.",
  },
  sunken_pillar: {
    name: "Sunken Pillar",
    icon: <Mountain className="text-stone-400" size={16} />,
    desc: "A massive column half-buried in the earth.",
    lore: "Part of a bridge that once connected two kingdoms. The other half was never found.",
  },
  statue: {
    name: "Stone Statue",
    icon: <Crown className="text-amber-400" size={16} />,
    desc: "A weathered statue of a forgotten hero.",
    lore: "Students used to rub its nose for good luck on exams. The nose is very shiny.",
  },
  demon_statue: {
    name: "Demon Statue",
    icon: <Swords className="text-red-400" size={16} />,
    desc: "A menacing effigy radiating dark energy.",
    lore: "Carved by a mad sculptor who claimed the stone 'told him what shape it wanted to be.'",
  },
  obelisk: {
    name: "Ancient Obelisk",
    icon: <TrendingUp className="text-amber-400" size={16} />,
    desc: "A tall monolith inscribed with arcane symbols.",
    lore: "The inscriptions are a pizza recipe in a dead language. Scholars are still debating the toppings.",
  },
  cobra_statue: {
    name: "Cobra Statue",
    icon: <Diamond className="text-green-400" size={16} />,
    desc: "A menacing effigy radiating dark energy.",
    lore: "Carved by a mad sculptor who claimed the stone 'told him what shape it wanted to be.'",
  },
  frozen_waterfall: {

    name: "Frozen Waterfall",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A frozen waterfall that flows through the battlefield.",
    lore: "The waterfall is frozen solid and cannot be passed through.",
  },
  frozen_gate: {
    name: "Frozen Gate",
    icon: <Fence className="text-cyan-400" size={16} />,
    desc: "A frozen gate that defends the battlefield.",
    lore: "The gate doesn't seem to be very sturdy.",
  },
  aurora_crystal: {
    name: "Aurora Crystal",
    icon: <Sparkles className="text-purple-400" size={16} />,
    desc: "A crystal that emits a radiant energy.",
    lore: "The crystal is said to be the source of the aurora borealis.",
  },
  lava_fall: {
    name: "Lava Fall",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "A lava fall that flows through the battlefield.",
    lore: "The lava is hot and cannot be passed through.",
  },
  obsidian_pillar: {
    name: "Obsidian Pillar",
    icon: <Shield className="text-purple-400" size={16} />,
    desc: "A pillar of obsidian that stands in the battlefield.",
    lore: "Combined with a crystal, it could heal a dragon.",
  },
  skull_throne: {
    name: "Skull Throne",
    icon: <Skull className="text-red-400" size={16} />,
    desc: "A throne made of skulls that stands in the battlefield.",
    lore: "How many souls does it take to get some seating?",
  },
  volcano_rim: {
    name: "Volcano Rim",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "A rim of lava that surrounds the battlefield.",
    lore: "The precipice of eternal fire.",
  },
  idol_statue: {
    name: "Idol Statue",
    icon: <Landmark className="text-amber-400" size={16} />,
    desc: "A statue of an idol that stands in the battlefield.",
    lore: "A less impressive statue of a less impressive idol.",
  },
  gate: {
    name: "Gate",
    icon: <Fence className="text-cyan-400" size={16} />,
    desc: "A gate that defends the battlefield.",
    lore: "The gate doesn't seem to be very sturdy.",
  },
};

export const LandmarkTooltip: React.FC<LandmarkTooltipProps> = ({ landmarkType, position }) => {
  const info = LANDMARK_INFO[landmarkType] || {
    name: landmarkType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    icon: <Landmark className="text-amber-400" size={16} />,
    desc: "A notable landmark on the battlefield.",
    lore: "Its origins are shrouded in mystery.",
  };

  const tooltipWidth = 240;
  let tooltipX = position.x + 20;
  let tooltipY = position.y - 30;
  if (tooltipX + tooltipWidth > window.innerWidth - 10)
    tooltipX = position.x - tooltipWidth - 20;
  if (tooltipY < 60) tooltipY = 60;
  if (tooltipY + 140 > window.innerHeight - 10)
    tooltipY = window.innerHeight - 150;

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250, width: tooltipWidth, background: panelGradient, border: '1.5px solid ' + GOLD.border30, boxShadow: '0 0 20px ' + GOLD.glow07 }}
    >
      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: '1px solid ' + GOLD.innerBorder08 }} />
      {/* Header */}
      <div className="px-3 py-1.5 relative z-10" style={{ background: PANEL.bgWarmMid, borderBottom: '1px solid ' + GOLD.border25 }}>
        <div className="flex items-center gap-2">
          {info.icon}
          <span className="font-bold text-amber-200 text-sm">{info.name}</span>
        </div>
        <div className="text-[9px] text-amber-500/70 uppercase tracking-wider mt-0.5 flex items-center gap-1">
          <Landmark size={8} />
          Landmark
        </div>
      </div>
      {/* Description */}
      <div className="px-3 py-2">
        <p className="text-[11px] text-amber-100/80 leading-relaxed">{info.desc}</p>
        <p className="text-[10px] text-amber-400/60 leading-relaxed mt-1.5 italic pt-1.5" style={{ borderTop: '1px solid ' + GOLD.innerBorder08 }}>
          &quot;{info.lore}&quot;
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// HAZARD TOOLTIP
// =============================================================================

interface HazardTooltipProps {
  hazardType: string;
  position: Position;
}

const HAZARD_INFO: Record<string, { name: string; icon: React.ReactNode; desc: string; effect: string; effectColor: string }> = {
  poison_fog: {
    name: "Poison Fog",
    icon: <Wind className="text-green-400" size={16} />,
    desc: "A thick, noxious cloud of toxic gas lingers over this area.",
    effect: "Deals damage to ENEMY troops passing through",
    effectColor: "text-green-400",
  },
  deep_water: {
    name: "Deep Water",
    icon: <Activity className="text-blue-400" size={16} />,
    desc: "Dark water with strong undertow and almost no footing.",
    effect: "Slows enemies and deals steady drown damage",
    effectColor: "text-blue-300",
  },
  maelstrom: {
    name: "Maelstrom",
    icon: <Wind className="text-cyan-300" size={16} />,
    desc: "A rotating vortex that drags everything toward its crushing center.",
    effect: "Heavy slow and high damage over time",
    effectColor: "text-cyan-300",
  },
  storm_field: {
    name: "Storm Field",
    icon: <Zap className="text-sky-300" size={16} />,
    desc: "Ionized storm air that supercharges movement but shreds armor.",
    effect: "Enemies move faster but take constant lightning damage",
    effectColor: "text-sky-300",
  },
  quicksand: {
    name: "Quicksand",
    icon: <TrendingDown className="text-yellow-400" size={16} />,
    desc: "Treacherous ground that swallows anything that steps on it.",
    effect: "Slows enemies that walk through by 50%",
    effectColor: "text-yellow-400",
  },
  ice_sheet: {
    name: "Ice Sheet",
    icon: <Snowflake className="text-cyan-400" size={16} />,
    desc: "A slick expanse of frozen ground that accelerates movement.",
    effect: "Enemies move 60% FASTER through this zone",
    effectColor: "text-cyan-400",
  },
  ice_spikes: {
    name: "Ice Spikes",
    icon: <Mountain className="text-cyan-300" size={16} />,
    desc: "Razor-sharp crystal growths burst from the frozen ground.",
    effect: "Shoots up in cycles, damaging and slowing enemies",
    effectColor: "text-cyan-300",
  },
  spikes: {
    name: "Ice Spikes",
    icon: <Mountain className="text-cyan-300" size={16} />,
    desc: "Razor-sharp crystal growths burst from the frozen ground.",
    effect: "Shoots up in cycles, damaging and slowing enemies",
    effectColor: "text-cyan-300",
  },

  lava_geyser: {
    name: "Lava Geyser",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "Periodic eruptions of molten rock from deep underground.",
    effect: "Random eruptions deal 5 fire damage to enemies (and troops!) nearby",
    effectColor: "text-orange-400",
  },
  eruption_zone: {
    name: "Lava Geyser",
    icon: <Flame className="text-orange-400" size={16} />,
    desc: "Periodic eruptions of molten rock from deep underground.",
    effect: "Random eruptions deal 5 fire damage to enemies (and troops!) nearby",
    effectColor: "text-orange-400",
  },

};

export const HazardTooltip: React.FC<HazardTooltipProps> = ({ hazardType, position }) => {
  const info = HAZARD_INFO[hazardType] || {
    name: hazardType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    icon: <AlertTriangle className="text-red-400" size={16} />,
    desc: "A dangerous environmental hazard.",
    effect: "Applies an unknown effect to units in the area",
    effectColor: "text-red-400",
  };

  const tooltipWidth = 250;
  let tooltipX = position.x + 20;
  let tooltipY = position.y - 30;
  if (tooltipX + tooltipWidth > window.innerWidth - 10)
    tooltipX = position.x - tooltipWidth - 20;
  if (tooltipY < 60) tooltipY = 60;
  if (tooltipY + 140 > window.innerHeight - 10)
    tooltipY = window.innerHeight - 150;

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250, width: tooltipWidth, background: panelGradient, border: '1.5px solid ' + RED_CARD.border, boxShadow: '0 0 20px ' + RED_CARD.glow06 }}
    >
      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: '1px solid ' + RED_CARD.innerBorder12 }} />
      {/* Header */}
      <div className="px-3 py-1.5 relative z-10" style={{ background: RED_CARD.bgLight, borderBottom: '1px solid ' + RED_CARD.border25 }}>
        <div className="flex items-center gap-2">
          {info.icon}
          <span className="font-bold text-red-200 text-sm">{info.name}</span>
        </div>
        <div className="text-[9px] text-red-400/70 uppercase tracking-wider mt-0.5 flex items-center gap-1">
          <AlertTriangle size={9} />
          Environmental Hazard
        </div>
      </div>
      {/* Description */}
      <div className="px-3 py-2">
        <p className="text-[11px] text-stone-300/80 leading-relaxed">{info.desc}</p>
        {/* Effect callout */}
        <div className="mt-2 rounded-lg px-2.5 py-1.5" style={{ background: PANEL.bgDeep, border: '1px solid ' + RED_CARD.border25 }}>
          <div className="text-[9px] text-red-400/60 uppercase tracking-wider mb-0.5 font-semibold">Effect</div>
          <p className={`text-[11px] font-medium leading-snug ${info.effectColor}`}>
            {info.effect}
          </p>
        </div>
      </div>
    </div>
  );
};
