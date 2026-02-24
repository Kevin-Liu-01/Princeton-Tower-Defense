"use client";

import React from "react";
import {
  Heart,
  Timer,
  Zap,
  Users,
  X,
  Swords,
  Target,
  Coins,
  Gauge,
  Shield,
  Info,
  Crown,
  Crosshair,
  Snowflake,
  Sparkles,
  Flame,
  TrendingDown,
  Eye,
  EyeOff,
  AlertTriangle,
  Footprints,
  Droplets,
  Zap as ZapIcon,
  Ban,
  Wind,
} from "lucide-react";
import type { Enemy, Position, EnemyTrait } from "../../types";
import { ENEMY_DATA } from "../../constants";
import { EnemySprite } from "../../sprites";
import { PANEL, GOLD, OVERLAY, PURPLE_CARD, panelGradient } from "./theme";

// =============================================================================
// ENEMY INSPECTOR COMPONENT
// =============================================================================

interface EnemyInspectorProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  selectedEnemy: Enemy | null;
  setSelectedEnemy: (enemy: Enemy | null) => void;
  enemies: Enemy[];
  setGameSpeed: (speed: number) => void;
  previousGameSpeed: number;
  setPreviousGameSpeed: (speed: number) => void;
  gameSpeed: number;
}

export const EnemyInspector: React.FC<EnemyInspectorProps> = ({
  isActive,
  setIsActive,
  selectedEnemy,
  setSelectedEnemy,
  enemies,
  setGameSpeed,
  previousGameSpeed,
  setPreviousGameSpeed,
  gameSpeed,
}) => {
  const handleToggle = () => {
    if (!isActive) {
      // Activating inspector - pause game
      setPreviousGameSpeed(gameSpeed);
      setGameSpeed(0);
      setIsActive(true);
    } else {
      // Deactivating inspector - resume game
      setGameSpeed(previousGameSpeed > 0 ? previousGameSpeed : 1);
      setIsActive(false);
      setSelectedEnemy(null);
    }
  };

  return (
    <div
      className="absolute top-2 left-2 flex flex-col gap-2"
      style={{ zIndex: 60 }}
    >
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg shadow-lg backdrop-blur-sm transition-all relative"
        style={isActive ? {
          background: `linear-gradient(135deg, ${PURPLE_CARD.bgLight}, ${PURPLE_CARD.bgDark})`,
          border: `1.5px solid ${PURPLE_CARD.border}`,
          boxShadow: `inset 0 0 10px ${PURPLE_CARD.glow}`,
        } : {
          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
          border: `1.5px solid ${GOLD.border25}`,
          boxShadow: `inset 0 0 8px ${GOLD.glow04}`,
        }}
      >
        <div className="absolute inset-[2px] rounded-[6px] pointer-events-none z-10" style={{ border: `1px solid ${isActive ? PURPLE_CARD.innerBorder : GOLD.innerBorder10}` }} />
        {isActive ? (
          <EyeOff size={14} className="text-purple-300" />
        ) : (
          <Eye size={14} className="text-amber-400" />
        )}
        <span className={`text-[9px] font-bold tracking-wider ${isActive ? "text-purple-200" : "text-amber-300"}`}>
          {isActive ? "EXIT" : "INSPECT"}
        </span>
      </button>

      {isActive && (
        <div
          className="p-2 rounded-lg shadow-lg backdrop-blur-sm relative"
          style={{
            background: `linear-gradient(135deg, ${PURPLE_CARD.bgLight}, ${PURPLE_CARD.bgDark})`,
            border: `1.5px solid ${PURPLE_CARD.border}`,
            boxShadow: `inset 0 0 10px ${PURPLE_CARD.glow}`,
          }}
        >
          <div className="absolute inset-[2px] rounded-[6px] pointer-events-none z-10" style={{ border: `1px solid ${PURPLE_CARD.innerBorder}` }} />
          <div className="text-[9px] text-purple-300 mb-1 font-bold text-center tracking-wider flex items-center gap-1 justify-center">
            <AlertTriangle size={10} />
            PAUSED - CLICK ENEMY
          </div>
          <div className="text-[8px] text-purple-400/80 text-center">
            {enemies.length} enemies on field
          </div>
          {selectedEnemy && (
            <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${PURPLE_CARD.border}` }}>
              <div className="text-[9px] text-purple-200 text-center">
                Selected: {ENEMY_DATA[selectedEnemy.type]?.name || selectedEnemy.type}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// ENEMY DETAIL TOOLTIP - Shows when clicking on enemy in inspect mode
// =============================================================================

interface EnemyDetailTooltipProps {
  enemy: Enemy;
  position: Position;
  onClose: () => void;
}

// Helper function to get trait icon and info
const getTraitInfo = (trait: EnemyTrait): { icon: React.ReactNode; label: string; color: string; desc: string } => {
  switch (trait) {
    case "flying":
      return { icon: <Wind size={12} />, label: "Flying", color: "text-cyan-400", desc: "Ignores ground obstacles, only hit by certain towers" };
    case "ranged":
      return { icon: <Crosshair size={12} />, label: "Ranged", color: "text-green-400", desc: "Attacks from a distance" };
    case "armored":
      return { icon: <Shield size={12} />, label: "Armored", color: "text-amber-400", desc: "Reduces incoming damage" };
    case "fast":
      return { icon: <Footprints size={12} />, label: "Fast", color: "text-yellow-400", desc: "Moves faster than normal enemies" };
    case "boss":
      return { icon: <Crown size={12} />, label: "Boss", color: "text-red-400", desc: "Powerful elite enemy with high HP" };
    case "summoner":
      return { icon: <Users size={12} />, label: "Summoner", color: "text-purple-400", desc: "Can summon additional enemies" };
    case "regenerating":
      return { icon: <Heart size={12} />, label: "Regenerating", color: "text-green-400", desc: "Slowly recovers health over time" };
    case "aoe_attack":
      return { icon: <Target size={12} />, label: "AoE Attack", color: "text-orange-400", desc: "Attacks hit multiple targets" };
    case "magic_resist":
      return { icon: <Sparkles size={12} />, label: "Magic Resist", color: "text-blue-400", desc: "Reduced damage from magic attacks" };
    case "tower_debuffer":
      return { icon: <TrendingDown size={12} />, label: "Tower Debuffer", color: "text-rose-400", desc: "Can weaken or disable towers" };
    case "breakthrough":
      return { icon: <Zap size={12} />, label: "Breakthrough", color: "text-sky-400", desc: "Bypasses barracks troops without stopping" };
    default:
      return { icon: <Info size={12} />, label: trait, color: "text-gray-400", desc: "Unknown trait" };
  }
};

// Helper function to get ability icon and color
const getAbilityInfo = (abilityType: string): { icon: React.ReactNode; color: string; bgColor: string } => {
  switch (abilityType) {
    case "burn":
      return { icon: <Flame size={14} />, color: "text-orange-400", bgColor: "bg-orange-950/60 border-orange-800/50" };
    case "slow":
      return { icon: <Snowflake size={14} />, color: "text-cyan-400", bgColor: "bg-cyan-950/60 border-cyan-800/50" };
    case "poison":
      return { icon: <Droplets size={14} />, color: "text-green-400", bgColor: "bg-green-950/60 border-green-800/50" };
    case "stun":
      return { icon: <ZapIcon size={14} />, color: "text-yellow-400", bgColor: "bg-yellow-950/60 border-yellow-800/50" };
    case "tower_slow":
      return { icon: <Timer size={14} />, color: "text-blue-400", bgColor: "bg-blue-950/60 border-blue-800/50" };
    case "tower_weaken":
      return { icon: <TrendingDown size={14} />, color: "text-red-400", bgColor: "bg-red-950/60 border-red-800/50" };
    case "tower_blind":
      return { icon: <EyeOff size={14} />, color: "text-purple-400", bgColor: "bg-purple-950/60 border-purple-800/50" };
    case "tower_disable":
      return { icon: <Ban size={14} />, color: "text-rose-400", bgColor: "bg-rose-950/60 border-rose-800/50" };
    default:
      return { icon: <AlertTriangle size={14} />, color: "text-gray-400", bgColor: "bg-gray-950/60 border-gray-800/50" };
  }
};

export const EnemyDetailTooltip: React.FC<EnemyDetailTooltipProps> = ({
  enemy,
  position,
  onClose,
}) => {
  const eData = ENEMY_DATA[enemy.type];
  if (!eData) return null;

  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const hpColor = hpPercent > 50 ? "bg-green-500" : hpPercent > 25 ? "bg-yellow-500" : "bg-red-500";

  // Get traits and abilities from enemy data
  const traits = eData.traits || [];
  const abilities = eData.abilities || [];
  const hasAoE = eData.aoeRadius && eData.aoeDamage;

  // Position tooltip - center it on screen for better visibility
  const tooltipWidth = 320;
  const tooltipHeight = 450;
  let tooltipX = position.x - tooltipWidth / 2;
  let tooltipY = position.y - tooltipHeight - 40;

  // Keep tooltip on screen
  tooltipX = Math.max(10, Math.min(tooltipX, window.innerWidth - tooltipWidth - 10));
  tooltipY = Math.max(60, tooltipY);
  if (tooltipY + tooltipHeight > window.innerHeight - 10) {
    tooltipY = window.innerHeight - tooltipHeight - 10;
  }

  return (
    <div
      className="fixed pointer-events-auto shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{
        left: tooltipX,
        top: tooltipY,
        zIndex: 300,
        width: tooltipWidth,
        background: panelGradient,
        border: `2px solid ${GOLD.border35}`,
        boxShadow: `0 0 30px ${GOLD.glow07}, inset 0 0 15px ${GOLD.glow04}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-[3px] rounded-[10px] pointer-events-none z-20" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: `linear-gradient(90deg, ${PANEL.bgDark}, ${PANEL.bgLight})`,
          borderBottom: `1px solid ${GOLD.border25}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg border-2 flex items-center justify-center overflow-hidden"
            style={{ borderColor: eData.color, backgroundColor: eData.color + "15" }}
          >
            <EnemySprite type={enemy.type} size={44} animated />
          </div>
          <div>
            <h3 className="font-bold text-lg text-purple-100">{eData.name}</h3>
            <div className="flex items-center gap-2">
              {eData.isBoss && (
                <span className="text-[9px] px-1.5 py-0.5 bg-red-900/60 rounded text-red-300 font-bold">BOSS</span>
              )}
              {eData.flying && (
                <span className="text-[9px] px-1.5 py-0.5 bg-cyan-900/60 rounded text-cyan-300">FLYING</span>
              )}
              {eData.isRanged && (
                <span className="text-[9px] px-1.5 py-0.5 bg-green-900/60 rounded text-green-300">RANGED</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Lives Cost Badge */}
          <div className="flex items-center gap-1 px-2 py-1 bg-rose-950/60 rounded border border-rose-800/50">
            <Heart size={12} className="text-rose-400" />
            <span className="text-rose-300 font-bold text-xs">{eData.liveCost || 1}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all hover:scale-110"
            style={{ background: PANEL.bgWarmMid, border: `1px solid ${GOLD.border25}` }}
          >
            <X size={18} className="text-purple-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {/* Description */}
        <p className="text-[11px] text-purple-300/90 mb-3 italic">{eData.desc}</p>

        {/* HP Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-red-400 font-bold">HP</span>
            <span className="text-white font-mono">{Math.ceil(enemy.hp)} / {enemy.maxHp}</span>
          </div>
          <div className="w-full bg-black/40 h-3 rounded-full border border-white/10 overflow-hidden">
            <div
              className={`h-full ${hpColor} transition-all duration-300`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-red-950/40 p-2 rounded-lg border border-red-900/40 text-center">
            <Heart size={14} className="mx-auto text-red-400 mb-1" />
            <div className="text-[8px] text-red-500">Max HP</div>
            <div className="text-red-200 font-bold text-sm">{eData.hp}</div>
          </div>
          <div className="bg-blue-950/40 p-2 rounded-lg border border-blue-900/40 text-center">
            <Gauge size={14} className="mx-auto text-blue-400 mb-1" />
            <div className="text-[8px] text-blue-500">Speed</div>
            <div className="text-blue-200 font-bold text-sm">{eData.speed}</div>
          </div>
          <div className="bg-amber-950/40 p-2 rounded-lg border border-amber-900/40 text-center">
            <Shield size={14} className="mx-auto text-amber-400 mb-1" />
            <div className="text-[8px] text-amber-500">Armor</div>
            <div className="text-amber-200 font-bold text-sm">{Math.round(eData.armor * 100)}%</div>
          </div>
          <div className="bg-green-950/40 p-2 rounded-lg border border-green-900/40 text-center">
            <Coins size={14} className="mx-auto text-green-400 mb-1" />
            <div className="text-[8px] text-green-500">Bounty</div>
            <div className="text-green-200 font-bold text-sm">{eData.bounty}</div>
          </div>
        </div>

        {/* Ranged Stats (if applicable) */}
        {eData.isRanged && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-purple-950/40 p-1.5 rounded-lg border border-purple-900/40 text-center">
              <div className="text-[8px] text-purple-500">Range</div>
              <div className="text-purple-200 font-bold text-xs">{eData.range}</div>
            </div>
            <div className="bg-purple-950/40 p-1.5 rounded-lg border border-purple-900/40 text-center">
              <div className="text-[8px] text-purple-500">Atk Speed</div>
              <div className="text-purple-200 font-bold text-xs">{(eData.attackSpeed / 1000).toFixed(1)}s</div>
            </div>
            <div className="bg-purple-950/40 p-1.5 rounded-lg border border-purple-900/40 text-center">
              <div className="text-[8px] text-purple-500">Proj Dmg</div>
              <div className="text-purple-200 font-bold text-xs">{eData.projectileDamage}</div>
            </div>
          </div>
        )}

        {/* AoE Stats (if applicable) */}
        {hasAoE && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-orange-950/40 p-1.5 rounded-lg border border-orange-900/40 text-center">
              <div className="text-[8px] text-orange-500">AoE Radius</div>
              <div className="text-orange-200 font-bold text-xs">{eData.aoeRadius}</div>
            </div>
            <div className="bg-orange-950/40 p-1.5 rounded-lg border border-orange-900/40 text-center">
              <div className="text-[8px] text-orange-500">AoE Damage</div>
              <div className="text-orange-200 font-bold text-xs">{eData.aoeDamage}</div>
            </div>
          </div>
        )}

        {/* Flying Troop Attack Stats (if applicable) */}
        {eData.targetsTroops && eData.troopDamage && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-cyan-950/40 p-1.5 rounded-lg border border-cyan-900/40 text-center">
              <Wind size={14} className="mx-auto text-cyan-400 mb-1" />
              <div className="text-[8px] text-cyan-500">Swoop Dmg</div>
              <div className="text-cyan-200 font-bold text-xs">{eData.troopDamage}</div>
            </div>
            <div className="bg-cyan-950/40 p-1.5 rounded-lg border border-cyan-900/40 text-center">
              <Timer size={14} className="mx-auto text-cyan-400 mb-1" />
              <div className="text-[8px] text-cyan-500">Atk Speed</div>
              <div className="text-cyan-200 font-bold text-xs">{((eData.troopAttackSpeed || 2000) / 1000).toFixed(1)}s</div>
            </div>
          </div>
        )}

        {/* Melee Combat Stats (for ground enemies that engage troops) */}
        {!eData.flying && !eData.breakthrough && !eData.isRanged && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-red-950/40 p-1.5 rounded-lg border border-red-900/40 text-center">
              <Swords size={14} className="mx-auto text-red-400 mb-1" />
              <div className="text-[8px] text-red-500">Melee Dmg</div>
              <div className="text-red-200 font-bold text-xs">{eData.troopDamage ?? 22}</div>
            </div>
            <div className="bg-red-950/40 p-1.5 rounded-lg border border-red-900/40 text-center">
              <Timer size={14} className="mx-auto text-red-400 mb-1" />
              <div className="text-[8px] text-red-500">Atk Speed</div>
              <div className="text-red-200 font-bold text-xs">1.0s</div>
            </div>
          </div>
        )}

        {/* Breakthrough indicator + contact damage */}
        {eData.breakthrough && (
          <div className="mb-3">
            <div className="bg-sky-950/40 p-1.5 rounded-lg border border-sky-900/40 text-center">
              <div className="text-sky-200 font-bold text-xs flex items-center justify-center gap-1">
                <Zap size={12} className="text-sky-400" />
                Bypasses Troops
              </div>
              {eData.troopDamage != null && (
                <div className="text-[9px] text-sky-300/90 mt-1">
                  Hero Dmg: <span className="font-bold text-sky-200">{eData.troopDamage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Traits */}
        {traits.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-purple-400 font-bold mb-1.5 flex items-center gap-1">
              <Info size={10} /> TRAITS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {traits.map((trait, i) => {
                const traitInfo = getTraitInfo(trait);
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-1 px-2 py-1 bg-stone-800/60 rounded border border-stone-700/50 ${traitInfo.color}`}
                    title={traitInfo.desc}
                  >
                    {traitInfo.icon}
                    <span className="text-[9px] font-medium">{traitInfo.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Abilities */}
        {abilities.length > 0 && (
          <div>
            <div className="text-[10px] text-purple-400 font-bold mb-1.5 flex items-center gap-1">
              <Zap size={10} /> ABILITIES
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {abilities.map((ability, i) => {
                const abilityInfo = getAbilityInfo(ability.type);
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-lg border ${abilityInfo.bgColor}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={abilityInfo.color}>{abilityInfo.icon}</span>
                      <span className="text-[11px] font-bold text-white">{ability.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-black/30 rounded text-white/70 ml-auto">
                        {Math.round(ability.chance * 100)}% chance
                      </span>
                    </div>
                    <p className="text-[10px] text-white/70 mb-1">{ability.desc}</p>
                    <div className="flex flex-wrap gap-2 text-[9px]">
                      <span className="text-white/60">
                        Duration: <span className="text-white">{(ability.duration / 1000).toFixed(1)}s</span>
                      </span>
                      {ability.intensity !== undefined && (
                        <span className="text-white/60">
                          {ability.type === "slow" || ability.type.includes("tower") ? "Effect: " : "DPS: "}
                          <span className="text-white">
                            {ability.type === "slow" || ability.type.includes("tower")
                              ? `${Math.round(ability.intensity * 100)}%`
                              : ability.intensity}
                          </span>
                        </span>
                      )}
                      {ability.radius && (
                        <span className="text-white/60">
                          Radius: <span className="text-white">{ability.radius}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No abilities message */}
        {abilities.length === 0 && traits.length === 0 && (
          <div className="text-center text-[10px] text-purple-400/60 py-2">
            This enemy has no special abilities or traits.
          </div>
        )}

        {/* Current Status Effects */}
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${GOLD.border25}` }}>
          <div className="text-[10px] text-purple-400 font-bold mb-1.5">CURRENT STATUS</div>
          <div className="flex flex-wrap gap-2">
            {enemy.burning && (
              <span className="flex items-center gap-1 px-2 py-1 bg-orange-900/40 rounded text-orange-300 text-[9px]">
                <Flame size={10} /> Burning
              </span>
            )}
            {enemy.slowed && (
              <span className="flex items-center gap-1 px-2 py-1 bg-cyan-900/40 rounded text-cyan-300 text-[9px]">
                <Snowflake size={10} /> Slowed
              </span>
            )}
            {enemy.frozen && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-900/40 rounded text-blue-300 text-[9px]">
                <Snowflake size={10} /> Frozen
              </span>
            )}
            {enemy.stunUntil > Date.now() && (
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-900/40 rounded text-yellow-300 text-[9px]">
                <ZapIcon size={10} /> Stunned
              </span>
            )}
            {enemy.taunted && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-900/40 rounded text-red-300 text-[9px]">
                <AlertTriangle size={10} /> Taunted
              </span>
            )}
            {!enemy.burning && !enemy.slowed && !enemy.frozen && enemy.stunUntil <= Date.now() && !enemy.taunted && (
              <span className="text-[9px] text-purple-400/60">No active effects</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
