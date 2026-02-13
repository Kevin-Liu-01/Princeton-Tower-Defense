"use client";
import React, { useState } from "react";
import {
  Star,
  Book,
  Shield,
  Zap,
  Swords,
  Crown,
  X,
  Skull,
  Flag,
  Heart,
  Target,
  Flame,
  Sparkles,
  ChevronRight,
  Wind,
  ArrowUp,
  Info,
  Timer,
  Coins,
  Gauge,
  Clock,
  Snowflake,
  Users,
  TrendingUp,
  Crosshair,
  CircleDot,
  Banknote,
  Radio,
  Volume2,
  CircleOff,
  TrendingDown,
  Droplets,
  Ban,
  EyeOff,
  AlertTriangle,
  Footprints,
} from "lucide-react";
import type { HeroType, SpellType, EnemyTrait, EnemyCategory, EnemyType } from "../../types";
import { OrnateFrame } from "../ui/OrnateFrame";
import {
  HERO_DATA,
  SPELL_DATA,
  TOWER_DATA,
  ENEMY_DATA,
  HERO_ABILITY_COOLDOWNS,
  TROOP_DATA,
} from "../../constants";
import { calculateTowerStats, TOWER_STATS } from "../../constants/towerStats";
import {
  TowerSprite,
  HeroSprite,
  EnemySprite,
  SpellSprite,
  HeroAbilityIcon,
} from "../../sprites";
import { PANEL, GOLD, AMBER_CARD, RED_CARD, BLUE_CARD, GREEN_CARD, PURPLE_CARD, NEUTRAL, DIVIDER, SELECTED, OVERLAY, panelGradient, dividerGradient } from "../ui/theme";

// =============================================================================
// CODEX HELPER FUNCTIONS
// =============================================================================

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
      return { icon: <Zap size={14} />, color: "text-yellow-400", bgColor: "bg-yellow-950/60 border-yellow-800/50" };
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

// Enemy category display info
const CATEGORY_INFO: Record<EnemyCategory, { name: string; desc: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  academic: { name: "Academic", desc: "Academic progression and milestones", icon: <Book size={16} />, color: "text-purple-400", bgColor: "bg-purple-950/50 border-purple-800/40" },
  campus: { name: "Campus Life", desc: "Campus events and activities", icon: <Flag size={16} />, color: "text-amber-400", bgColor: "bg-amber-950/50 border-amber-800/40" },
  ranged: { name: "Ranged", desc: "Attack from a distance", icon: <Crosshair size={16} />, color: "text-green-400", bgColor: "bg-green-950/50 border-green-800/40" },
  flying: { name: "Flying", desc: "Aerial threats that bypass ground obstacles", icon: <Wind size={16} />, color: "text-cyan-400", bgColor: "bg-cyan-950/50 border-cyan-800/40" },
  boss: { name: "Bosses", desc: "Major threats with devastating power", icon: <Crown size={16} />, color: "text-red-400", bgColor: "bg-red-950/50 border-red-800/40" },
  nature: { name: "Nature", desc: "Environmental and biome creatures", icon: <Sparkles size={16} />, color: "text-emerald-400", bgColor: "bg-emerald-950/50 border-emerald-800/40" },
  swarm: { name: "Swarm", desc: "Fast and numerous, strength in numbers", icon: <Users size={16} />, color: "text-yellow-400", bgColor: "bg-yellow-950/50 border-yellow-800/40" },
};

// Category display order
const CATEGORY_ORDER: EnemyCategory[] = ["academic", "campus", "ranged", "flying", "boss", "nature", "swarm"];

// Group enemies by category
const groupEnemiesByCategory = (enemyTypes: EnemyType[]): Record<EnemyCategory, EnemyType[]> => {
  const grouped: Record<EnemyCategory, EnemyType[]> = {
    academic: [],
    campus: [],
    ranged: [],
    flying: [],
    boss: [],
    nature: [],
    swarm: [],
  };

  enemyTypes.forEach(type => {
    const enemy = ENEMY_DATA[type];
    const category = enemy.category || "campus"; // Default to campus if not specified
    grouped[category].push(type);
  });

  return grouped;
};

// =============================================================================
// CODEX MODAL
// =============================================================================

export interface CodexModalProps {
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<
    "towers" | "heroes" | "enemies" | "spells"
  >("towers");
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [selectedHeroDetail, setSelectedHeroDetail] = useState<string | null>(
    null
  );
  const towerTypes = Object.keys(TOWER_DATA) as (keyof typeof TOWER_DATA)[];
  const heroTypes = Object.keys(HERO_DATA) as HeroType[];
  const enemyTypes = Object.keys(ENEMY_DATA) as (keyof typeof ENEMY_DATA)[];
  const spellTypes = Object.keys(SPELL_DATA) as SpellType[];

  // Get dynamic tower stats using the centralized calculation
  const getDynamicStats = (type: string, level: number, upgrade?: "A" | "B") => {
    return calculateTowerStats(type, level, upgrade, 1, 1);
  };

  // Get tower upgrade costs
  const getUpgradeCost = (type: string, level: number) => {
    const towerDef = TOWER_STATS[type];
    if (!towerDef) return 0;
    if (level <= 3) {
      return towerDef.levels[level as 1 | 2 | 3]?.cost || 0;
    }
    return towerDef.level4Cost; // Level 4 cost from tower definition
  };

  // Get troop for station display
  const getTroopForLevel = (level: number, upgrade?: "A" | "B") => {
    if (level === 1) return TROOP_DATA.footsoldier;
    if (level === 2) return TROOP_DATA.armored;
    if (level === 3) return TROOP_DATA.elite;
    if (level === 4) {
      if (upgrade === "A") return TROOP_DATA.centaur;
      if (upgrade === "B") return TROOP_DATA.cavalry;
      return TROOP_DATA.knight;
    }
    return TROOP_DATA.footsoldier;
  };

  // Tower type icons
  const towerIcons: Record<string, React.ReactNode> = {
    station: <Users size={16} className="text-purple-400" />,
    cannon: <CircleDot size={16} className="text-red-400" />,
    library: <Snowflake size={16} className="text-cyan-400" />,
    lab: <Zap size={16} className="text-yellow-400" />,
    arch: <Volume2 size={16} className="text-blue-400" />,
    club: <Banknote size={16} className="text-amber-400" />,
  };

  // Tower category descriptions
  const towerCategories: Record<string, { category: string; color: string }> = {
    station: { category: "Troop Spawner", color: "purple" },
    cannon: { category: "Heavy Artillery", color: "red" },
    library: { category: "Crowd Control", color: "cyan" },
    lab: { category: "Energy Damage", color: "yellow" },
    arch: { category: "Multi-Target", color: "blue" },
    club: { category: "Economy", color: "amber" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: OVERLAY.black60 }}>
      <div
        className="relative w-full max-w-6xl max-h-[92vh] rounded-2xl overflow-hidden"
        style={{
          background: panelGradient,
          border: `2px solid ${GOLD.border35}`,
          boxShadow: `0 0 40px ${GOLD.glow07}, inset 0 0 30px ${GOLD.glow04}`,
        }}
      >
        <OrnateFrame
          className="relative w-full h-full overflow-hidden"
          cornerSize={48}
          color="#d97706"
          glowColor="#f59e0b"
        >
          {/* Inner ghost border */}
          <div className="absolute inset-[3px] rounded-[14px] pointer-events-none z-20" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
          <img
            src="/images/gameplay-latest-zoomed.png"
            alt="Battle Scene"
            className="w-full h-full z-5 object-bottom object-cover absolute top-0 left-0 opacity-[0.05] pointer-events-none select-none"
          />

          {/* Header */}
          <div className="sticky top-0 z-10 backdrop-blur px-9 py-4 flex items-center justify-between" style={{
            background: `linear-gradient(90deg, ${PANEL.bgDark}, ${PANEL.bgLight}, ${PANEL.bgDark})`,
            borderBottom: `2px solid ${GOLD.border30}`,
            boxShadow: `0 2px 12px ${OVERLAY.black40}`
          }}>
            <div className="flex items-center gap-3">
              <Book className="text-amber-400 drop-shadow-lg" size={28} />
              <h2 className="text-3xl font-bold text-amber-100 drop-shadow-lg tracking-wide">CODEX</h2>
              <span className="text-xs text-amber-400/60 ml-2 font-medium tracking-wider uppercase">
                Battle Encyclopedia
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:scale-110"
              style={{ background: PANEL.bgWarmMid, border: `1px solid ${GOLD.border25}` }}
            >
              <X size={20} className="text-amber-400" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex z-10 overflow-scroll relative" style={{
            background: PANEL.bgDeep,
            borderBottom: `1px solid ${GOLD.border25}`,
          }}>
            {[
              {
                id: "towers",
                label: "Towers",
                icon: <Crown size={16} />,
                count: towerTypes.length,
              },
              {
                id: "heroes",
                label: "Heroes",
                icon: <Shield size={16} />,
                count: heroTypes.length,
              },
              {
                id: "enemies",
                label: "Enemies",
                icon: <Skull size={16} />,
                count: enemyTypes.length,
              },
              {
                id: "spells",
                label: "Spells",
                icon: <Zap size={16} />,
                count: spellTypes.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setSelectedTower(null);
                  setSelectedHeroDetail(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all font-medium relative"
                style={activeTab === tab.id ? {
                  background: `linear-gradient(180deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                  color: "rgb(252,211,77)",
                  borderBottom: `2px solid ${GOLD.accentBorder50}`,
                  boxShadow: `inset 0 -4px 12px ${GOLD.accentGlow08}`
                } : {
                  color: "rgba(180,140,60,0.5)",
                }}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-[2px] rounded-sm pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                )}
                {tab.icon}
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{
                  background: activeTab === tab.id ? PANEL.bgDeep : PANEL.bgWarmMid,
                  color: activeTab === tab.id ? "rgb(252,211,77)" : "rgba(180,140,60,0.6)",
                  border: `1px solid ${activeTab === tab.id ? GOLD.border25 : "transparent"}`
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="p-6 z-10 overflow-y-auto max-h-[calc(92vh-140px)]">
            {activeTab === "towers" && !selectedTower && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {towerTypes.map((type) => {
                  const tower = TOWER_DATA[type];
                  const stats = getDynamicStats(type, 1);
                  const towerDef = TOWER_STATS[type];
                  const cat = towerCategories[type];

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedTower(type)}
                      className="rounded-xl hover:scale-[1.02] text-left group transition-all overflow-hidden relative"
                      style={{
                        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${GOLD.border25}`,
                        boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                      }}
                    >
                      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                      {/* Header with category */}
                      <div className={`px-4 py-2 border-b flex items-center justify-between relative z-10 ${type === "station" ? "bg-purple-950/50 border-purple-800/30" :
                        type === "cannon" ? "bg-red-950/50 border-red-800/30" :
                          type === "library" ? "bg-cyan-950/50 border-cyan-800/30" :
                            type === "lab" ? "bg-yellow-950/50 border-yellow-800/30" :
                              type === "arch" ? "bg-blue-950/50 border-blue-800/30" :
                                type === "club" ? "bg-amber-950/50 border-amber-800/30" :
                                  "bg-stone-950/50 border-stone-800/30"
                        }`}>
                        <div className="flex items-center gap-2">
                          {towerIcons[type]}
                          <span className={`text-xs font-medium uppercase tracking-wider ${type === "station" ? "text-purple-400" :
                            type === "cannon" ? "text-red-400" :
                              type === "library" ? "text-cyan-400" :
                                type === "lab" ? "text-yellow-400" :
                                  type === "arch" ? "text-blue-400" :
                                    type === "club" ? "text-amber-400" :
                                      "text-stone-400"
                            }`}>
                            {cat.category}
                          </span>
                        </div>
                        <span className="text-amber-400 flex items-center gap-1 text-xs">
                          <Coins size={12} /> {tower.cost} PP
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="w-16 h-16 rounded-lg flex items-center justify-center group-hover:border-amber-500/50 transition-colors" style={{
                            background: PANEL.bgDeep,
                            border: `1.5px solid ${GOLD.border25}`,
                          }}>
                            <TowerSprite type={type} size={52} level={1} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-amber-200 group-hover:text-amber-100 truncate">
                              {tower.name}
                            </h3>
                            <p className="text-xs text-stone-400 line-clamp-2 mt-1">
                              {tower.desc}
                            </p>
                          </div>
                          <ChevronRight
                            size={20}
                            className="text-stone-600 group-hover:text-amber-400 transition-colors flex-shrink-0"
                          />
                        </div>

                        {/* Base stats */}
                        <div className="flex flex-wrap gap-2 mb-3 text-xs">
                          {stats.damage > 0 && (
                            <span className="px-2 py-1 bg-red-950/50 rounded border border-red-900/40 text-red-300 flex items-center gap-1">
                              <Swords size={11} /> {Math.floor(stats.damage)}
                            </span>
                          )}
                          {stats.range > 0 && (
                            <span className="px-2 py-1 bg-blue-950/50 rounded border border-blue-900/40 text-blue-300 flex items-center gap-1">
                              <Target size={11} /> {Math.floor(stats.range)}
                            </span>
                          )}
                          {stats.slowAmount && stats.slowAmount > 0 && (
                            <span className="px-2 py-1 bg-cyan-950/50 rounded border border-cyan-900/40 text-cyan-300 flex items-center gap-1">
                              <Snowflake size={11} /> {Math.round(stats.slowAmount * 100)}%
                            </span>
                          )}
                          {stats.income && stats.income > 0 && (
                            <span className="px-2 py-1 bg-amber-950/50 rounded border border-amber-900/40 text-amber-300 flex items-center gap-1">
                              <Banknote size={11} /> +{stats.income} PP
                            </span>
                          )}
                          {type === "station" && (
                            <span className="px-2 py-1 bg-purple-950/50 rounded border border-purple-900/40 text-purple-300 flex items-center gap-1">
                              <Users size={11} /> {TROOP_DATA.footsoldier.hp} HP
                            </span>
                          )}
                        </div>

                        {/* Level 4 upgrade previews */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="px-2 py-1.5 bg-red-950/30 rounded border border-red-900/30">
                            <div className="text-[9px] text-red-500/70 uppercase mb-0.5">Path A</div>
                            <div className="text-xs text-red-300 font-medium truncate">{tower.upgrades.A.name}</div>
                          </div>
                          <div className="px-2 py-1.5 bg-blue-950/30 rounded border border-blue-900/30">
                            <div className="text-[9px] text-blue-500/70 uppercase mb-0.5">Path B</div>
                            <div className="text-xs text-blue-300 font-medium truncate">{tower.upgrades.B.name}</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === "towers" &&
              selectedTower &&
              (() => {
                const tower = TOWER_DATA[selectedTower as keyof typeof TOWER_DATA];
                const towerDef = TOWER_STATS[selectedTower]; // Used in renderUniqueFeatures
                const cat = towerCategories[selectedTower];
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                void towerDef; // Explicitly mark as used in closure

                // Render unique features for a tower upgrade
                const renderUniqueFeatures = (stats: ReturnType<typeof getDynamicStats>, path: "A" | "B", type: string) => {
                  const features: React.ReactNode[] = [];
                  const upgradeStats = towerDef?.upgrades?.[path]?.stats;

                  // Combat stats
                  if (stats.damage > 0) {
                    features.push(
                      <div key="dmg" className="bg-red-950/50 rounded-lg p-2 text-center border border-red-800/40">
                        <Swords size={14} className="mx-auto text-red-400 mb-1" />
                        <div className="text-[9px] text-red-500">Damage</div>
                        <div className="text-red-300 font-bold">{Math.floor(stats.damage)}</div>
                      </div>
                    );
                  }

                  if (stats.range > 0 && type !== "club") {
                    features.push(
                      <div key="rng" className="bg-blue-950/50 rounded-lg p-2 text-center border border-blue-800/40">
                        <Target size={14} className="mx-auto text-blue-400 mb-1" />
                        <div className="text-[9px] text-blue-500">Range</div>
                        <div className="text-blue-300 font-bold">{Math.floor(stats.range)}</div>
                      </div>
                    );
                  }

                  if (stats.attackSpeed > 0) {
                    features.push(
                      <div key="spd" className="bg-green-950/50 rounded-lg p-2 text-center border border-green-800/40">
                        <Gauge size={14} className="mx-auto text-green-400 mb-1" />
                        <div className="text-[9px] text-green-500">Speed</div>
                        <div className="text-green-300 font-bold">{(stats.attackSpeed / 1000).toFixed(1)}s</div>
                      </div>
                    );
                  }

                  // Unique features
                  if (stats.chainTargets && stats.chainTargets > 1) {
                    features.push(
                      <div key="chain" className="bg-yellow-950/50 rounded-lg p-2 text-center border border-yellow-800/40">
                        <Users size={14} className="mx-auto text-yellow-400 mb-1" />
                        <div className="text-[9px] text-yellow-500">Targets</div>
                        <div className="text-yellow-300 font-bold">{stats.chainTargets}</div>
                      </div>
                    );
                  }

                  if (stats.splashRadius && stats.splashRadius > 0) {
                    features.push(
                      <div key="splash" className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-800/40">
                        <Radio size={14} className="mx-auto text-orange-400 mb-1" />
                        <div className="text-[9px] text-orange-500">Splash</div>
                        <div className="text-orange-300 font-bold">{stats.splashRadius}</div>
                      </div>
                    );
                  }

                  if (stats.slowAmount && stats.slowAmount > 0) {
                    features.push(
                      <div key="slow" className="bg-cyan-950/50 rounded-lg p-2 text-center border border-cyan-800/40">
                        <Snowflake size={14} className="mx-auto text-cyan-400 mb-1" />
                        <div className="text-[9px] text-cyan-500">Slow</div>
                        <div className="text-cyan-300 font-bold">{Math.round(stats.slowAmount * 100)}%</div>
                      </div>
                    );
                  }

                  if (stats.stunChance && stats.stunChance > 0) {
                    features.push(
                      <div key="stun" className="bg-indigo-950/50 rounded-lg p-2 text-center border border-indigo-800/40">
                        <CircleOff size={14} className="mx-auto text-indigo-400 mb-1" />
                        <div className="text-[9px] text-indigo-500">Freeze</div>
                        <div className="text-indigo-300 font-bold">{Math.round(stats.stunChance * 100)}%</div>
                      </div>
                    );
                  }

                  if (stats.burnDamage && stats.burnDamage > 0) {
                    features.push(
                      <div key="burn" className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-800/40">
                        <Flame size={14} className="mx-auto text-orange-400 mb-1" />
                        <div className="text-[9px] text-orange-500">Burn</div>
                        <div className="text-orange-300 font-bold">{stats.burnDamage}/s</div>
                      </div>
                    );
                  }

                  // Economy features
                  if (stats.income && stats.income > 0) {
                    features.push(
                      <div key="income" className="bg-amber-950/50 rounded-lg p-2 text-center border border-amber-800/40">
                        <Banknote size={14} className="mx-auto text-amber-400 mb-1" />
                        <div className="text-[9px] text-amber-500">Income</div>
                        <div className="text-amber-300 font-bold">+{stats.income} PP</div>
                      </div>
                    );
                  }

                  if (stats.incomeInterval && stats.incomeInterval > 0) {
                    features.push(
                      <div key="interval" className="bg-amber-950/50 rounded-lg p-2 text-center border border-amber-800/40">
                        <Timer size={14} className="mx-auto text-amber-400 mb-1" />
                        <div className="text-[9px] text-amber-500">Interval</div>
                        <div className="text-amber-300 font-bold">{stats.incomeInterval / 1000}s</div>
                      </div>
                    );
                  }

                  // Aura features
                  if (upgradeStats?.rangeBuff) {
                    features.push(
                      <div key="rangeAura" className="bg-cyan-950/50 rounded-lg p-2 text-center border border-cyan-800/40">
                        <TrendingUp size={14} className="mx-auto text-cyan-400 mb-1" />
                        <div className="text-[9px] text-cyan-500">Range Aura</div>
                        <div className="text-cyan-300 font-bold">+{Math.round(upgradeStats.rangeBuff * 100)}%</div>
                      </div>
                    );
                  }

                  if (upgradeStats?.damageBuff) {
                    features.push(
                      <div key="dmgAura" className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-800/40">
                        <TrendingUp size={14} className="mx-auto text-orange-400 mb-1" />
                        <div className="text-[9px] text-orange-500">DMG Aura</div>
                        <div className="text-orange-300 font-bold">+{Math.round(upgradeStats.damageBuff * 100)}%</div>
                      </div>
                    );
                  }

                  return features;
                };

                return (
                  <div>
                    <button
                      onClick={() => setSelectedTower(null)}
                      className="flex items-center gap-2 text-amber-300 hover:text-amber-100 mb-4 transition-all font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: PANEL.bgWarmMid, border: `1px solid ${GOLD.border25}` }}
                    >
                      <ChevronRight size={16} className="rotate-180" />
                      <span>Back to all towers</span>
                    </button>

                    <div className="space-y-6">
                      {/* Header Section */}
                      <div className="rounded-xl overflow-hidden relative" style={{
                        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${GOLD.border30}`,
                        boxShadow: `inset 0 0 12px ${GOLD.glow04}`,
                      }}>
                        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                        <div className={`px-6 py-3 border-b flex items-center gap-3 ${selectedTower === "station" ? "bg-purple-950/50 border-purple-800/30" :
                          selectedTower === "cannon" ? "bg-red-950/50 border-red-800/30" :
                            selectedTower === "library" ? "bg-cyan-950/50 border-cyan-800/30" :
                              selectedTower === "lab" ? "bg-yellow-950/50 border-yellow-800/30" :
                                selectedTower === "arch" ? "bg-blue-950/50 border-blue-800/30" :
                                  selectedTower === "club" ? "bg-amber-950/50 border-amber-800/30" :
                                    "bg-stone-950/50 border-stone-800/30"
                          }`}>
                          {towerIcons[selectedTower]}
                          <span className={`text-sm font-medium uppercase tracking-wider ${selectedTower === "station" ? "text-purple-400" :
                            selectedTower === "cannon" ? "text-red-400" :
                              selectedTower === "library" ? "text-cyan-400" :
                                selectedTower === "lab" ? "text-yellow-400" :
                                  selectedTower === "arch" ? "text-blue-400" :
                                    selectedTower === "club" ? "text-amber-400" :
                                      "text-stone-400"
                            }`}>
                            {cat.category}
                          </span>
                        </div>
                        <div className="p-6 flex items-start gap-6">
                          <div className="w-28 h-28 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                            background: PANEL.bgDeep,
                            border: `2px solid ${GOLD.border30}`,
                            boxShadow: `inset 0 0 15px ${OVERLAY.black40}`,
                          }}>
                            <TowerSprite
                              type={selectedTower as keyof typeof TOWER_DATA}
                              size={96}
                              level={4}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-3xl font-bold text-amber-200 mb-2">
                              {tower.name}
                            </h3>
                            <p className="text-stone-400 mb-4">{tower.desc}</p>
                            <div className="flex flex-wrap gap-3">
                              <div className="px-4 py-2 bg-amber-950/50 rounded-lg border border-amber-800/40">
                                <div className="text-xs text-amber-500">Base Cost</div>
                                <div className="text-amber-300 font-bold text-lg">{tower.cost} PP</div>
                              </div>
                              {getDynamicStats(selectedTower, 1).damage > 0 && (
                                <div className="px-4 py-2 bg-red-950/50 rounded-lg border border-red-800/40">
                                  <div className="text-xs text-red-500">Base Damage</div>
                                  <div className="text-red-300 font-bold text-lg">{Math.floor(getDynamicStats(selectedTower, 1).damage)}</div>
                                </div>
                              )}
                              {getDynamicStats(selectedTower, 1).range > 0 && selectedTower !== "club" && (
                                <div className="px-4 py-2 bg-blue-950/50 rounded-lg border border-blue-800/40">
                                  <div className="text-xs text-blue-500">Base Range</div>
                                  <div className="text-blue-300 font-bold text-lg">{Math.floor(getDynamicStats(selectedTower, 1).range)}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Level Progression */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border25}, transparent)` }} />
                          <h4 className="text-lg font-bold text-amber-200 flex items-center gap-2">
                            <ArrowUp size={18} className="text-amber-400" />
                            Level Progression
                          </h4>
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25})` }} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((level) => {
                            const stats = getDynamicStats(selectedTower, level);
                            const cost = getUpgradeCost(selectedTower, level);
                            const isStation = selectedTower === "station";
                            const troop = isStation ? getTroopForLevel(level) : null;

                            return (
                              <div
                                key={level}
                                className={`rounded-xl border overflow-hidden ${level === 4
                                  ? "bg-gradient-to-br from-purple-950/60 to-stone-950 border-purple-700/50"
                                  : "bg-stone-900/80 border-stone-700/40"
                                  }`}
                              >
                                <div className={`px-3 py-2 flex items-center justify-between ${level === 4 ? "bg-purple-900/30" : "bg-stone-800/50"}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(level)].map((_, i) => (
                                        <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                                      ))}
                                    </div>
                                    <span className={`font-bold ${level === 4 ? "text-purple-300" : "text-amber-300"}`}>
                                      Lvl {level}
                                    </span>
                                  </div>
                                  <span className="text-amber-400 text-xs flex items-center gap-1">
                                    <Coins size={10} /> {cost} PP
                                  </span>
                                </div>
                                <div className="p-3">
                                  {/* Level 4 shows both upgrade paths */}
                                  {level === 4 ? (
                                    <div className="space-y-2">
                                      {(["A", "B"] as const).map((path) => {
                                        const pathStats = getDynamicStats(selectedTower, 4, path);
                                        const pathTroop = isStation ? getTroopForLevel(4, path) : null;

                                        return (
                                          <div
                                            key={path}
                                            className={`rounded-lg border overflow-hidden ${path === "A"
                                              ? "bg-red-950/30 border-red-800/40"
                                              : "bg-blue-950/30 border-blue-800/40"
                                              }`}
                                          >
                                            {/* Path header */}
                                            <div className={`px-2 py-1 text-[10px] font-bold ${path === "A" ? "text-red-300 bg-red-900/30" : "text-blue-300 bg-blue-900/30"
                                              }`}>
                                              {tower.upgrades[path].name}
                                            </div>

                                            {/* Path stats */}
                                            <div className="p-1.5">
                                              {/* Station shows troop stats for each path */}
                                              {isStation && pathTroop && (
                                                <div className="grid grid-cols-3 gap-1 text-[9px]">
                                                  <div className="bg-red-950/50 rounded p-1 text-center border border-red-900/30">
                                                    <div className="text-red-500 text-[7px]">HP</div>
                                                    <div className="text-red-300 font-bold">{pathTroop.hp}</div>
                                                  </div>
                                                  <div className="bg-orange-950/50 rounded p-1 text-center border border-orange-900/30">
                                                    <div className="text-orange-500 text-[7px]">DMG</div>
                                                    <div className="text-orange-300 font-bold">{pathTroop.damage}</div>
                                                  </div>
                                                  <div className="bg-green-950/50 rounded p-1 text-center border border-green-900/30">
                                                    <div className="text-green-500 text-[7px]">SPD</div>
                                                    <div className="text-green-300 font-bold">{(pathTroop.attackSpeed / 1000).toFixed(1)}s</div>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Combat towers show damage/range/speed for each path */}
                                              {!isStation && selectedTower !== "club" && (
                                                <div className="grid grid-cols-3 gap-1 text-[9px]">
                                                  {pathStats.damage > 0 && (
                                                    <div className="bg-red-950/50 rounded p-1 text-center border border-red-900/30">
                                                      <div className="text-red-500 text-[7px]">DMG</div>
                                                      <div className="text-red-300 font-bold">{Math.floor(pathStats.damage)}</div>
                                                    </div>
                                                  )}
                                                  {pathStats.range > 0 && (
                                                    <div className="bg-blue-950/50 rounded p-1 text-center border border-blue-900/30">
                                                      <div className="text-blue-500 text-[7px]">RNG</div>
                                                      <div className="text-blue-300 font-bold">{Math.floor(pathStats.range)}</div>
                                                    </div>
                                                  )}
                                                  {pathStats.attackSpeed > 0 && (
                                                    <div className="bg-green-950/50 rounded p-1 text-center border border-green-900/30">
                                                      <div className="text-green-500 text-[7px]">SPD</div>
                                                      <div className="text-green-300 font-bold">{(pathStats.attackSpeed / 1000).toFixed(1)}s</div>
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                              {/* Club shows income for each path */}
                                              {selectedTower === "club" && (
                                                <div className="grid grid-cols-2 gap-1 text-[9px]">
                                                  <div className="bg-amber-950/50 rounded p-1 text-center border border-amber-900/30">
                                                    <div className="text-amber-500 text-[7px]">Income</div>
                                                    <div className="text-amber-300 font-bold">+{pathStats.income} PP</div>
                                                  </div>
                                                  <div className="bg-amber-950/50 rounded p-1 text-center border border-amber-900/30">
                                                    <div className="text-amber-500 text-[7px]">Interval</div>
                                                    <div className="text-amber-300 font-bold">{(pathStats.incomeInterval || 8000) / 1000}s</div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-xs text-stone-400 mb-3 line-clamp-2">
                                        {tower.levelDesc[level as 1 | 2 | 3]}
                                      </p>

                                      {/* Station shows troop stats */}
                                      {isStation && troop && (
                                        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                                          <div className="bg-red-950/50 rounded p-1.5 text-center border border-red-900/30">
                                            <Heart size={10} className="mx-auto text-red-400 mb-0.5" />
                                            <div className="text-red-300 font-bold">{troop.hp}</div>
                                          </div>
                                          <div className="bg-orange-950/50 rounded p-1.5 text-center border border-orange-900/30">
                                            <Swords size={10} className="mx-auto text-orange-400 mb-0.5" />
                                            <div className="text-orange-300 font-bold">{troop.damage}</div>
                                          </div>
                                          <div className="bg-green-950/50 rounded p-1.5 text-center border border-green-900/30">
                                            <Gauge size={10} className="mx-auto text-green-400 mb-0.5" />
                                            <div className="text-green-300 font-bold">{(troop.attackSpeed / 1000).toFixed(1)}s</div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Combat towers show damage/range/speed */}
                                      {!isStation && selectedTower !== "club" && (
                                        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                                          {stats.damage > 0 && (
                                            <div className="bg-red-950/50 rounded p-1.5 text-center border border-red-900/30">
                                              <div className="text-red-500 text-[8px]">DMG</div>
                                              <div className="text-red-300 font-bold">{Math.floor(stats.damage)}</div>
                                            </div>
                                          )}
                                          {stats.range > 0 && (
                                            <div className="bg-blue-950/50 rounded p-1.5 text-center border border-blue-900/30">
                                              <div className="text-blue-500 text-[8px]">RNG</div>
                                              <div className="text-blue-300 font-bold">{Math.floor(stats.range)}</div>
                                            </div>
                                          )}
                                          {stats.attackSpeed > 0 && (
                                            <div className="bg-green-950/50 rounded p-1.5 text-center border border-green-900/30">
                                              <div className="text-green-500 text-[8px]">SPD</div>
                                              <div className="text-green-300 font-bold">{(stats.attackSpeed / 1000).toFixed(1)}s</div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Club shows income */}
                                      {selectedTower === "club" && (
                                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                          <div className="bg-amber-950/50 rounded p-1.5 text-center border border-amber-900/30">
                                            <div className="text-amber-500 text-[8px]">Income</div>
                                            <div className="text-amber-300 font-bold">+{stats.income} PP</div>
                                          </div>
                                          <div className="bg-amber-950/50 rounded p-1.5 text-center border border-amber-900/30">
                                            <div className="text-amber-500 text-[8px]">Interval</div>
                                            <div className="text-amber-300 font-bold">{(stats.incomeInterval || 8000) / 1000}s</div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Library shows slow */}
                                      {selectedTower === "library" && (
                                        <div className="mt-1.5 text-[10px] text-cyan-400 flex items-center justify-center gap-1 bg-cyan-950/30 rounded p-1 border border-cyan-900/30">
                                          <Snowflake size={10} /> {Math.round((stats.slowAmount || 0) * 100)}% slow
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Evolution Paths */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border25}, transparent)` }} />
                          <h4 className="text-lg font-bold text-amber-200 flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-400" />
                            Evolution Paths (Level 4)
                          </h4>
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25})` }} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                          {(["A", "B"] as const).map((path) => {
                            const upgrade = tower.upgrades[path];
                            const stats = getDynamicStats(selectedTower, 4, path);
                            const isStation = selectedTower === "station";
                            const troop = isStation ? getTroopForLevel(4, path) : null;
                            const pathLabel = path === "A" ? "Offensive" : "Utility";

                            return (
                              <div
                                key={path}
                                className={`rounded-xl border overflow-hidden ${path === "A"
                                  ? "bg-gradient-to-br from-red-950/40 to-stone-950 border-red-700/50"
                                  : "bg-gradient-to-br from-blue-950/40 to-stone-950 border-blue-700/50"
                                  }`}
                              >
                                {/* Path header */}
                                <div className={`px-4 py-3 ${path === "A" ? "bg-red-900/30" : "bg-blue-900/30"} flex items-center gap-4`}>
                                  <div className={`w-14 h-14 rounded-lg ${path === "A" ? "bg-red-950/60 border-red-700/50" : "bg-blue-950/60 border-blue-700/50"} border flex items-center justify-center`}>
                                    <TowerSprite
                                      type={selectedTower as keyof typeof TOWER_DATA}
                                      size={48}
                                      level={4}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className={`text-[10px] uppercase tracking-wider ${path === "A" ? "text-red-400" : "text-blue-400"}`}>
                                      Path {path} • {pathLabel}
                                    </div>
                                    <h5 className={`text-xl font-bold ${path === "A" ? "text-red-200" : "text-blue-200"}`}>
                                      {upgrade.name}
                                    </h5>
                                  </div>
                                </div>

                                <div className="p-4 space-y-4">
                                  {/* Description */}
                                  <p className="text-stone-400 text-sm">{upgrade.desc}</p>

                                  {/* Special Effect Box */}
                                  <div className={`rounded-lg p-3 ${path === "A" ? "bg-red-950/40 border border-red-800/40" : "bg-blue-950/40 border border-blue-800/40"}`}>
                                    <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${path === "A" ? "text-red-400" : "text-blue-400"}`}>
                                      <Sparkles size={12} />
                                      Special Effect
                                    </div>
                                    <p className={`text-sm ${path === "A" ? "text-red-200" : "text-blue-200"}`}>
                                      {upgrade.effect}
                                    </p>
                                  </div>

                                  {/* Troop info for Station */}
                                  {isStation && troop && (
                                    <div className="bg-stone-800/50 rounded-lg p-3 border border-stone-700/40">
                                      <div className="text-xs text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Users size={12} />
                                        Troop: {troop.name}
                                      </div>
                                      <p className="text-xs text-stone-400 mb-2">{troop.desc}</p>
                                      <div className="grid grid-cols-4 gap-2 text-[10px]">
                                        <div className="bg-red-950/50 rounded p-1.5 text-center border border-red-900/30">
                                          <Heart size={12} className="mx-auto text-red-400 mb-0.5" />
                                          <div className="text-red-300 font-bold">{troop.hp}</div>
                                        </div>
                                        <div className="bg-orange-950/50 rounded p-1.5 text-center border border-orange-900/30">
                                          <Swords size={12} className="mx-auto text-orange-400 mb-0.5" />
                                          <div className="text-orange-300 font-bold">{troop.damage}</div>
                                        </div>
                                        <div className="bg-green-950/50 rounded p-1.5 text-center border border-green-900/30">
                                          <Gauge size={12} className="mx-auto text-green-400 mb-0.5" />
                                          <div className="text-green-300 font-bold">{(troop.attackSpeed / 1000).toFixed(1)}s</div>
                                        </div>
                                        {troop.isRanged && (
                                          <div className="bg-blue-950/50 rounded p-1.5 text-center border border-blue-900/30">
                                            <Crosshair size={12} className="mx-auto text-blue-400 mb-0.5" />
                                            <div className="text-blue-300 font-bold">{troop.range}</div>
                                          </div>
                                        )}
                                      </div>
                                      {(troop.isMounted || troop.isRanged || troop.canTargetFlying) && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {troop.isMounted && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-900/50 rounded text-amber-300 border border-amber-700/50">
                                              🐴 Mounted
                                            </span>
                                          )}
                                          {troop.isRanged && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-900/50 rounded text-blue-300 border border-blue-700/50">
                                              🏹 Ranged
                                            </span>
                                          )}
                                          {troop.canTargetFlying && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-cyan-900/50 rounded text-cyan-300 border border-cyan-700/50">
                                              ✈️ Anti-Air
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-4 gap-2">
                                    {renderUniqueFeatures(stats, path, selectedTower)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {activeTab === "heroes" && !selectedHeroDetail && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroTypes.map((type) => {
                  const hero = HERO_DATA[type];
                  const cooldown = HERO_ABILITY_COOLDOWNS[type];

                  // Hero role icons and colors
                  const heroRoles: Record<string, { role: string; icon: React.ReactNode; color: string }> = {
                    tiger: { role: "Brawler", icon: <Swords size={12} />, color: "orange" },
                    tenor: { role: "Support", icon: <Volume2 size={12} />, color: "purple" },
                    mathey: { role: "Tank", icon: <Shield size={12} />, color: "blue" },
                    rocky: { role: "Artillery", icon: <Target size={12} />, color: "red" },
                    scott: { role: "Buffer", icon: <TrendingUp size={12} />, color: "yellow" },
                    captain: { role: "Summoner", icon: <Users size={12} />, color: "green" },
                    engineer: { role: "Builder", icon: <CircleDot size={12} />, color: "amber" },
                  };
                  const roleInfo = heroRoles[type] || { role: "Hero", icon: <Shield size={12} />, color: "amber" };

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedHeroDetail(type)}
                      className="rounded-xl hover:scale-[1.02] text-left group transition-all overflow-hidden relative"
                      style={{
                        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${GOLD.border25}`,
                        boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                      }}
                    >
                      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                      {/* Role header */}
                      <div className={`px-4 py-2 border-b flex items-center justify-between ${roleInfo.color === "orange" ? "bg-orange-950/50 border-orange-800/30" :
                        roleInfo.color === "purple" ? "bg-purple-950/50 border-purple-800/30" :
                          roleInfo.color === "blue" ? "bg-blue-950/50 border-blue-800/30" :
                            roleInfo.color === "red" ? "bg-red-950/50 border-red-800/30" :
                              roleInfo.color === "yellow" ? "bg-yellow-950/50 border-yellow-800/30" :
                                roleInfo.color === "green" ? "bg-green-950/50 border-green-800/30" :
                                  "bg-amber-950/50 border-amber-800/30"
                        }`}>
                        <div className={`flex items-center gap-2 ${roleInfo.color === "orange" ? "text-orange-400" :
                          roleInfo.color === "purple" ? "text-purple-400" :
                            roleInfo.color === "blue" ? "text-blue-400" :
                              roleInfo.color === "red" ? "text-red-400" :
                                roleInfo.color === "yellow" ? "text-yellow-400" :
                                  roleInfo.color === "green" ? "text-green-400" :
                                    "text-amber-400"
                          }`}>
                          {roleInfo.icon}
                          <span className="text-xs font-medium uppercase tracking-wider">
                            {roleInfo.role}
                          </span>
                        </div>
                        <span className="text-xl">{hero.icon}</span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-4 mb-3">
                          <div
                            className="w-16 h-16 rounded-lg border-2 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                            style={{
                              borderColor: hero.color,
                              backgroundColor: hero.color + "20",
                              boxShadow: `0 0 20px ${hero.color}30`,
                            }}
                          >
                            <HeroSprite type={type} size={52} color={hero.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-amber-200 group-hover:text-amber-100 truncate">
                              {hero.name}
                            </h3>
                            <p className="text-xs text-stone-400 line-clamp-2 mt-1">
                              {hero.description}
                            </p>
                          </div>
                          <ChevronRight
                            size={20}
                            className="text-stone-600 group-hover:text-amber-400 transition-colors flex-shrink-0"
                          />
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-4 gap-1.5 mb-3">
                          <div className="bg-red-950/50 rounded p-1.5 text-center border border-red-900/40">
                            <Heart size={12} className="mx-auto text-red-400 mb-0.5" />
                            <div className="text-red-300 font-bold text-xs">{hero.hp}</div>
                          </div>
                          <div className="bg-orange-950/50 rounded p-1.5 text-center border border-orange-900/40">
                            <Swords size={12} className="mx-auto text-orange-400 mb-0.5" />
                            <div className="text-orange-300 font-bold text-xs">{hero.damage}</div>
                          </div>
                          <div className="bg-blue-950/50 rounded p-1.5 text-center border border-blue-900/40">
                            <Target size={12} className="mx-auto text-blue-400 mb-0.5" />
                            <div className="text-blue-300 font-bold text-xs">{hero.range}</div>
                          </div>
                          <div className="bg-cyan-950/50 rounded p-1.5 text-center border border-cyan-900/40">
                            <Wind size={12} className="mx-auto text-cyan-400 mb-0.5" />
                            <div className="text-cyan-300 font-bold text-xs">{hero.speed}</div>
                          </div>
                        </div>

                        {/* Ability preview */}
                        <div className="bg-purple-950/40 rounded-lg p-2 border border-purple-800/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Sparkles size={12} className="text-purple-400" />
                              <span className="text-xs font-medium text-purple-300">{hero.ability}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-purple-400">
                              <Timer size={10} />
                              <span>{cooldown / 1000}s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === "heroes" &&
              selectedHeroDetail &&
              (() => {
                const hero = HERO_DATA[selectedHeroDetail as HeroType];
                const cooldown = HERO_ABILITY_COOLDOWNS[selectedHeroDetail as HeroType];

                const heroInfo: Record<string, {
                  role: string;
                  roleIcon: React.ReactNode;
                  roleColor: string;
                  strengths: string[];
                  weaknesses: string[];
                  abilityDetails: string[];
                  strategy: string;
                  synergies: string[];
                }> = {
                  tiger: {
                    role: "Frontline Brawler",
                    roleIcon: <Swords size={16} />,
                    roleColor: "orange",
                    strengths: ["High melee damage", "Powerful crowd control", "Good survivability"],
                    weaknesses: ["Short range", "Vulnerable during cooldowns", "Can get overwhelmed"],
                    abilityDetails: [
                      "Stuns ALL enemies within 180 range for 3 seconds",
                      "Applies 50% slow effect after stun ends",
                      "Creates orange fear shockwave visual effect",
                    ],
                    strategy: "Dive into enemy formations when clustered. Use Mighty Roar to stun groups, then retreat while they're slowed.",
                    synergies: ["Pairs well with AoE towers", "Use with Freeze spell for extended CC"],
                  },
                  tenor: {
                    role: "AoE Support",
                    roleIcon: <Volume2 size={16} />,
                    roleColor: "purple",
                    strengths: ["Large AoE damage", "Heals allied troops", "Good stun duration"],
                    weaknesses: ["Lower single-target damage", "Moderate HP", "Needs positioning"],
                    abilityDetails: [
                      "Deals 80 damage to all enemies within 250 range",
                      "Stuns affected enemies for 2 seconds",
                      "Heals nearby troops for 75 HP",
                    ],
                    strategy: "Position near chokepoints to maximize damage. Sonic Boom both damages enemies and heals your troops.",
                    synergies: ["Great with Dinky Station troops", "Combos with slow towers"],
                  },
                  mathey: {
                    role: "Tank / Protector",
                    roleIcon: <Shield size={16} />,
                    roleColor: "blue",
                    strengths: ["Highest HP in game", "Invincibility ability", "Draws enemy fire"],
                    weaknesses: ["Low damage output", "Slow movement", "Long ability cooldown"],
                    abilityDetails: [
                      "Hero becomes invincible for 5 seconds",
                      "Taunts all nearby enemies within 150 range",
                      "Enemies forced to target the hero",
                    ],
                    strategy: "Use Fortress Shield when overwhelmed to draw all enemy fire and protect your towers and troops.",
                    synergies: ["Protects squishy troops", "Pairs with high DPS towers"],
                  },
                  rocky: {
                    role: "Ranged Artillery",
                    roleIcon: <Target size={16} />,
                    roleColor: "green",
                    strengths: ["Massive ranged damage", "Large AoE", "Safe positioning"],
                    weaknesses: ["Vulnerable in melee", "Slow attack speed", "Ability has delay"],
                    abilityDetails: [
                      "Massive AoE damage in target area",
                      "Damage falls off from center of impact",
                      "Ground crater with dust cloud effect",
                    ],
                    strategy: "Position Rocky behind your front line. Use Boulder Bash on clustered enemies for devastating damage.",
                    synergies: ["Use with Dinky Station troops", "Combos with Firestone Library"],
                  },
                  scott: {
                    role: "Support Buffer",
                    roleIcon: <TrendingUp size={16} />,
                    roleColor: "cyan",
                    strengths: ["Global tower buff", "Huge DPS increase", "Low risk positioning"],
                    weaknesses: ["No direct damage ability", "Relies on towers", "Low personal DPS"],
                    abilityDetails: [
                      "Boosts ALL tower damage by 50% for 8 seconds",
                      "Golden light rays emanate from hero",
                      "Affects every tower on the map",
                    ],
                    strategy: "F. Scott is a pure support. Save Inspiration for critical waves or boss enemies to maximize tower damage.",
                    synergies: ["Best with many towers built", "Combos with high-damage towers"],
                  },
                  captain: {
                    role: "Summoner",
                    roleIcon: <Users size={16} />,
                    roleColor: "red",
                    strengths: ["Extra troops on demand", "Flexible positioning", "Good for blocking"],
                    weaknesses: ["Knights are temporary", "Moderate personal stats", "Cooldown dependent"],
                    abilityDetails: [
                      "Summons 3 knight troops near the hero",
                      "Knights have 500 HP and 30 damage each",
                      "Summoning circle with energy pillars effect",
                    ],
                    strategy: "Use Rally Knights to plug leaks in your defense or create additional blocking points.",
                    synergies: ["Works with troop-healing effects", "Pairs with high DPS towers"],
                  },
                  engineer: {
                    role: "Tactical Builder",
                    roleIcon: <CircleDot size={16} />,
                    roleColor: "amber",
                    strengths: ["Free turret placement", "Extends tower coverage", "Good DPS"],
                    weaknesses: ["Turret is fragile", "Needs good placement", "Moderate stats"],
                    abilityDetails: [
                      "Deploys a turret nearby",
                      "Turret does not self-destruct",
                      "Can spawn multiple turrets",
                    ],
                    strategy: "Place turrets strategically to cover weak points or extend your defensive line.",
                    synergies: ["Covers areas without towers", "Good for emergency defense"],
                  },
                };
                const info = heroInfo[selectedHeroDetail] || heroInfo.tiger;

                return (
                  <div>
                    <button
                      onClick={() => setSelectedHeroDetail(null)}
                      className="flex items-center gap-2 text-amber-300 hover:text-amber-100 mb-4 transition-all font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: PANEL.bgWarmMid, border: `1px solid ${GOLD.border25}` }}
                    >
                      <ChevronRight size={16} className="rotate-180" />
                      <span>Back to all heroes</span>
                    </button>

                    <div className="space-y-6">
                      {/* Hero Header */}
                      <div className="rounded-xl overflow-hidden relative" style={{
                        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${GOLD.border30}`,
                        boxShadow: `inset 0 0 12px ${GOLD.glow04}`,
                      }}>
                        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                        <div className={`px-6 py-3 border-b flex items-center gap-3 ${info.roleColor === "orange" ? "bg-orange-950/50 border-orange-800/30" :
                          info.roleColor === "purple" ? "bg-purple-950/50 border-purple-800/30" :
                            info.roleColor === "blue" ? "bg-blue-950/50 border-blue-800/30" :
                              info.roleColor === "red" ? "bg-red-950/50 border-red-800/30" :
                                info.roleColor === "yellow" ? "bg-yellow-950/50 border-yellow-800/30" :
                                  info.roleColor === "green" ? "bg-green-950/50 border-green-800/30" :
                                    "bg-amber-950/50 border-amber-800/30"
                          }`}>
                          <span className={`${info.roleColor === "orange" ? "text-orange-400" :
                            info.roleColor === "purple" ? "text-purple-400" :
                              info.roleColor === "blue" ? "text-blue-400" :
                                info.roleColor === "red" ? "text-red-400" :
                                  info.roleColor === "yellow" ? "text-yellow-400" :
                                    info.roleColor === "green" ? "text-green-400" :
                                      "text-amber-400"
                            }`}>
                            {info.roleIcon}
                          </span>
                          <span className={`text-sm font-medium uppercase tracking-wider ${info.roleColor === "orange" ? "text-orange-400" :
                            info.roleColor === "purple" ? "text-purple-400" :
                              info.roleColor === "blue" ? "text-blue-400" :
                                info.roleColor === "red" ? "text-red-400" :
                                  info.roleColor === "yellow" ? "text-yellow-400" :
                                    info.roleColor === "green" ? "text-green-400" :
                                      "text-amber-400"
                            }`}>
                            {info.role}
                          </span>
                        </div>

                        <div className="p-6 flex items-start gap-6">
                          <div
                            className="w-28 h-28 rounded-xl border-2 flex items-center justify-center flex-shrink-0"
                            style={{
                              borderColor: hero.color,
                              backgroundColor: hero.color + "25",
                              boxShadow: `0 0 30px ${hero.color}40`,
                            }}
                          >
                            <HeroSprite
                              type={selectedHeroDetail as HeroType}
                              size={96}
                              color={hero.color}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-3xl font-bold text-amber-200">
                                {hero.name}
                              </h3>
                              <span className="text-2xl">{hero.icon}</span>
                            </div>
                            <p className="text-stone-400 mb-4">
                              {hero.description}
                            </p>
                            <div className="grid grid-cols-5 gap-3">
                              <div className="bg-red-950/50 rounded-lg p-2.5 text-center border border-red-800/40">
                                <Heart size={16} className="mx-auto text-red-400 mb-1" />
                                <div className="text-[10px] text-red-500">Health</div>
                                <div className="text-red-300 font-bold text-lg">{hero.hp}</div>
                              </div>
                              <div className="bg-orange-950/50 rounded-lg p-2.5 text-center border border-orange-800/40">
                                <Swords size={16} className="mx-auto text-orange-400 mb-1" />
                                <div className="text-[10px] text-orange-500">Damage</div>
                                <div className="text-orange-300 font-bold text-lg">{hero.damage}</div>
                              </div>
                              <div className="bg-blue-950/50 rounded-lg p-2.5 text-center border border-blue-800/40">
                                <Target size={16} className="mx-auto text-blue-400 mb-1" />
                                <div className="text-[10px] text-blue-500">Range</div>
                                <div className="text-blue-300 font-bold text-lg">{hero.range}</div>
                              </div>
                              <div className="bg-green-950/50 rounded-lg p-2.5 text-center border border-green-800/40">
                                <Gauge size={16} className="mx-auto text-green-400 mb-1" />
                                <div className="text-[10px] text-green-500">Atk Speed</div>
                                <div className="text-green-300 font-bold text-lg">{(hero.attackSpeed / 1000).toFixed(1)}s</div>
                              </div>
                              <div className="bg-cyan-950/50 rounded-lg p-2.5 text-center border border-cyan-800/40">
                                <Wind size={16} className="mx-auto text-cyan-400 mb-1" />
                                <div className="text-[10px] text-cyan-500">Move</div>
                                <div className="text-cyan-300 font-bold text-lg">{hero.speed}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ability Section */}
                      <div className="bg-gradient-to-br from-purple-950/40 to-stone-950 rounded-xl border border-purple-700/50 overflow-hidden">
                        <div className="px-5 py-3 bg-purple-900/30 border-b border-purple-800/40 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <HeroAbilityIcon type={selectedHeroDetail as HeroType} size={18} />
                            <span className="text-sm text-purple-400 font-medium uppercase tracking-wider">Special Ability</span>
                          </div>
                          <div className="flex items-center gap-2 bg-purple-950/50 px-3 py-1.5 rounded-lg border border-purple-700/50">
                            <Timer size={14} className="text-purple-400" />
                            <span className="text-purple-300 font-bold text-sm">{cooldown / 1000}s Cooldown</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-2xl font-bold text-purple-200 mb-2 flex items-center gap-2">
                            <HeroAbilityIcon type={selectedHeroDetail as HeroType} size={24} />
                            {hero.ability}
                          </h4>
                          <p className="text-purple-300 mb-4">{hero.abilityDesc}</p>
                          <div className="bg-purple-950/40 rounded-lg p-4 border border-purple-800/30">
                            <div className="text-xs text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Info size={10} /> Ability Details
                            </div>
                            <ul className="text-sm text-purple-300 space-y-1.5">
                              {info.abilityDetails.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-0.5">•</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-green-950/30 rounded-xl border border-green-800/40 p-4">
                          <h4 className="text-green-300 font-bold mb-3 flex items-center gap-2">
                            <TrendingUp size={16} /> Strengths
                          </h4>
                          <ul className="text-sm text-green-200/80 space-y-1.5">
                            {info.strengths.map((s, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-red-950/30 rounded-xl border border-red-800/40 p-4">
                          <h4 className="text-red-300 font-bold mb-3 flex items-center gap-2">
                            <CircleOff size={16} /> Weaknesses
                          </h4>
                          <ul className="text-sm text-red-200/80 space-y-1.5">
                            {info.weaknesses.map((w, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-red-400">✗</span> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Strategy & Synergies */}
                      <div className="rounded-xl p-5 relative" style={{
                        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${GOLD.border25}`,
                        boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                      }}>
                        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                        <h4 className="text-amber-200 font-bold mb-3 flex items-center gap-2 relative z-10">
                          <Info size={16} className="text-amber-400" /> Combat Strategy
                        </h4>
                        <p className="text-stone-300 mb-4">{info.strategy}</p>
                        <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-800/30">
                          <div className="text-xs text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Sparkles size={10} /> Synergies
                          </div>
                          <ul className="text-sm text-amber-200/80 space-y-1">
                            {info.synergies.map((s, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-amber-400">★</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {activeTab === "enemies" && (() => {
              const groupedEnemies = groupEnemiesByCategory(enemyTypes);

              return (
                <div className="space-y-6">
                  {CATEGORY_ORDER.map(category => {
                    const categoryEnemies = groupedEnemies[category];
                    if (categoryEnemies.length === 0) return null;

                    const catInfo = CATEGORY_INFO[category];

                    return (
                      <div key={category}>
                        {/* Category Header */}
                        <div className="flex items-center gap-3 mb-3 pb-3" style={{ borderBottom: `1px solid ${GOLD.border25}` }}>
                          <div className={`p-2 rounded-lg ${catInfo.bgColor}`} style={{ border: `1px solid ${GOLD.border25}` }}>
                            {catInfo.icon}
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${catInfo.color}`}>{catInfo.name}</h3>
                            <p className="text-xs text-amber-400/50">{catInfo.desc}</p>
                          </div>
                          <div className="ml-auto text-xs font-bold px-2.5 py-1 rounded-md" style={{
                            background: PANEL.bgWarmMid,
                            color: "rgb(252,211,77)",
                            border: `1px solid ${GOLD.border25}`,
                          }}>
                            {categoryEnemies.length} {categoryEnemies.length === 1 ? "enemy" : "enemies"}
                          </div>
                        </div>

                        {/* Category Enemies Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryEnemies.map((type) => {
                            const enemy = ENEMY_DATA[type];
                            const traits = enemy.traits || [];
                            const abilities = enemy.abilities || [];
                            const hasAoE = enemy.aoeRadius && enemy.aoeDamage;

                            // Determine threat level based on HP and boss status
                            const getThreatLevel = (hp: number, isBoss?: boolean) => {
                              if (isBoss || hp >= 1000) return { level: "Boss", color: "purple", icon: <Crown size={12} /> };
                              if (hp >= 500) return { level: "Elite", color: "orange", icon: <Star size={12} /> };
                              if (hp >= 200) return { level: "Standard", color: "yellow", icon: <Skull size={12} /> };
                              return { level: "Minion", color: "green", icon: <Skull size={12} /> };
                            };
                            const threat = getThreatLevel(enemy.hp, enemy.isBoss);

                            // Enemy type classification
                            const getEnemyTypeClassification = () => {
                              if (enemy.flying) return { type: "Flying", icon: <Wind size={12} />, color: "cyan" };
                              if (enemy.isRanged) return { type: "Ranged", icon: <Crosshair size={12} />, color: "purple" };
                              if (enemy.armor > 0.2) return { type: "Armored", icon: <Shield size={12} />, color: "stone" };
                              if (enemy.speed > 0.4) return { type: "Fast", icon: <Gauge size={12} />, color: "green" };
                              return { type: "Ground", icon: <Flag size={12} />, color: "red" };
                            };
                            const enemyTypeClass = getEnemyTypeClassification();

                            return (
                              <div
                                key={type}
                                className="rounded-xl overflow-hidden hover:border-red-700/50 transition-colors relative"
                                style={{
                                  background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                                  border: `1.5px solid ${GOLD.border25}`,
                                  boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                                }}
                              >
                                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                                {/* Header with threat level */}
                                <div className={`px-4 py-2 border-b flex items-center justify-between ${threat.color === "purple" ? "bg-purple-950/50 border-purple-800/30" :
                                  threat.color === "orange" ? "bg-orange-950/50 border-orange-800/30" :
                                    threat.color === "yellow" ? "bg-yellow-950/50 border-yellow-800/30" :
                                      "bg-green-950/50 border-green-800/30"
                                  }`}>
                                  <div className={`flex items-center gap-2 ${threat.color === "purple" ? "text-purple-400" :
                                    threat.color === "orange" ? "text-orange-400" :
                                      threat.color === "yellow" ? "text-yellow-400" :
                                        "text-green-400"
                                    }`}>
                                    {threat.icon}
                                    <span className="text-xs font-medium uppercase tracking-wider">
                                      {threat.level}
                                    </span>
                                  </div>
                                  <div className={`flex items-center gap-1.5 text-xs ${enemyTypeClass.color === "cyan" ? "text-cyan-400" :
                                    enemyTypeClass.color === "purple" ? "text-purple-400" :
                                      enemyTypeClass.color === "stone" ? "text-stone-400" :
                                        enemyTypeClass.color === "green" ? "text-green-400" :
                                          "text-red-400"
                                    }`}>
                                    {enemyTypeClass.icon}
                                    <span>{enemyTypeClass.type}</span>
                                  </div>
                                </div>

                                <div className="p-4">
                                  <div className="flex items-start gap-4 mb-3">
                                    <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{
                                      background: PANEL.bgDeep,
                                      border: `1.5px solid ${RED_CARD.border25}`,
                                    }}>
                                      <EnemySprite type={type} size={52} animated />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-lg font-bold text-red-200 truncate">
                                          {enemy.name}
                                        </h3>
                                        {/* Lives Cost Badge - Top Right */}
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-950/60 rounded border border-rose-800/50 flex-shrink-0">
                                          <Heart size={12} className="text-rose-400" />
                                          <span className="text-rose-300 font-bold text-xs">{enemy.liveCost || 1}</span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-stone-400 line-clamp-2 mt-1">
                                        {enemy.desc}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Base Stats grid */}
                                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                                    <div className="bg-red-950/50 rounded p-1.5 text-center border border-red-900/40">
                                      <Heart size={12} className="mx-auto text-red-400 mb-0.5" />
                                      <div className="text-[9px] text-red-500">HP</div>
                                      <div className="text-red-300 font-bold text-xs">{enemy.hp}</div>
                                    </div>
                                    <div className="bg-amber-950/50 rounded p-1.5 text-center border border-amber-900/40">
                                      <Coins size={12} className="mx-auto text-amber-400 mb-0.5" />
                                      <div className="text-[9px] text-amber-500">Bounty</div>
                                      <div className="text-amber-300 font-bold text-xs">{enemy.bounty}</div>
                                    </div>
                                    <div className="bg-green-950/50 rounded p-1.5 text-center border border-green-900/40">
                                      <Gauge size={12} className="mx-auto text-green-400 mb-0.5" />
                                      <div className="text-[9px] text-green-500">Speed</div>
                                      <div className="text-green-300 font-bold text-xs">{enemy.speed}</div>
                                    </div>
                                    <div className="bg-stone-800/50 rounded p-1.5 text-center border border-stone-700/40">
                                      <Shield size={12} className="mx-auto text-stone-400 mb-0.5" />
                                      <div className="text-[9px] text-stone-500">Armor</div>
                                      <div className="text-stone-300 font-bold text-xs">{Math.round(enemy.armor * 100)}%</div>
                                    </div>
                                  </div>

                                  {/* Ranged Stats (if applicable) */}
                                  {enemy.isRanged && (
                                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                                      <div className="bg-purple-950/40 rounded p-1 text-center border border-purple-900/30">
                                        <div className="text-[8px] text-purple-500">Range</div>
                                        <div className="text-purple-300 font-bold text-[10px]">{enemy.range}</div>
                                      </div>
                                      <div className="bg-purple-950/40 rounded p-1 text-center border border-purple-900/30">
                                        <div className="text-[8px] text-purple-500">Atk Speed</div>
                                        <div className="text-purple-300 font-bold text-[10px]">{(enemy.attackSpeed / 1000).toFixed(1)}s</div>
                                      </div>
                                      <div className="bg-purple-950/40 rounded p-1 text-center border border-purple-900/30">
                                        <div className="text-[8px] text-purple-500">Proj Dmg</div>
                                        <div className="text-purple-300 font-bold text-[10px]">{enemy.projectileDamage}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* AoE Stats (if applicable) */}
                                  {hasAoE && (
                                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                                      <div className="bg-orange-950/40 rounded p-1 text-center border border-orange-900/30">
                                        <div className="text-[8px] text-orange-500">AoE Radius</div>
                                        <div className="text-orange-300 font-bold text-[10px]">{enemy.aoeRadius}</div>
                                      </div>
                                      <div className="bg-orange-950/40 rounded p-1 text-center border border-orange-900/30">
                                        <div className="text-[8px] text-orange-500">AoE Damage</div>
                                        <div className="text-orange-300 font-bold text-[10px]">{enemy.aoeDamage}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Flying Troop Attack Stats (if applicable) */}
                                  {enemy.targetsTroops && enemy.troopDamage && (
                                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                                      <div className="bg-cyan-950/40 rounded p-1 text-center border border-cyan-900/30">
                                        <Wind size={12} className="mx-auto text-cyan-400 mb-0.5" />
                                        <div className="text-[8px] text-cyan-500">Swoop Dmg</div>
                                        <div className="text-cyan-300 font-bold text-[10px]">{enemy.troopDamage}</div>
                                      </div>
                                      <div className="bg-cyan-950/40 rounded p-1 text-center border border-cyan-900/30">
                                        <Timer size={12} className="mx-auto text-cyan-400 mb-0.5" />
                                        <div className="text-[8px] text-cyan-500">Atk Speed</div>
                                        <div className="text-cyan-300 font-bold text-[10px]">{((enemy.troopAttackSpeed || 2000) / 1000).toFixed(1)}s</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Melee Combat Stats (for ground enemies that engage troops) */}
                                  {!enemy.flying && !enemy.breakthrough && !enemy.isRanged && (
                                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                                      <div className="bg-red-950/40 rounded p-1 text-center border border-red-900/30">
                                        <Swords size={12} className="mx-auto text-red-400 mb-0.5" />
                                        <div className="text-[8px] text-red-500">Melee Dmg</div>
                                        <div className="text-red-300 font-bold text-[10px]">15</div>
                                      </div>
                                      <div className="bg-red-950/40 rounded p-1 text-center border border-red-900/30">
                                        <Timer size={12} className="mx-auto text-red-400 mb-0.5" />
                                        <div className="text-[8px] text-red-500">Atk Speed</div>
                                        <div className="text-red-300 font-bold text-[10px]">1.0s</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Breakthrough indicator */}
                                  {enemy.breakthrough && (
                                    <div className="mb-2">
                                      <div className="bg-sky-950/40 rounded p-1 text-center border border-sky-900/30">
                                        <div className="text-sky-300 font-bold text-[10px] flex items-center justify-center gap-1">
                                          <Zap size={10} className="text-sky-400" />
                                          Bypasses Troops
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Dynamic Traits */}
                                  {traits.length > 0 && (
                                    <div className="mb-2">
                                      <div className="text-[9px] text-stone-500 uppercase font-bold mb-1">Traits</div>
                                      <div className="flex flex-wrap gap-1">
                                        {traits.map((trait, i) => {
                                          const traitInfo = getTraitInfo(trait);
                                          return (
                                            <span
                                              key={i}
                                              className={`text-[9px] px-1.5 py-0.5 bg-stone-800/60 rounded border border-stone-700/50 flex items-center gap-1 ${traitInfo.color}`}
                                              title={traitInfo.desc}
                                            >
                                              {traitInfo.icon}
                                              <span>{traitInfo.label}</span>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Abilities */}
                                  {abilities.length > 0 && (
                                    <div>
                                      <div className="text-[9px] text-stone-500 uppercase font-bold mb-1 flex items-center gap-1">
                                        <Zap size={10} /> Abilities
                                      </div>
                                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                        {abilities.map((ability, i) => {
                                          const abilityInfo = getAbilityInfo(ability.type);
                                          return (
                                            <div
                                              key={i}
                                              className={`p-1.5 rounded border ${abilityInfo.bgColor}`}
                                            >
                                              <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className={abilityInfo.color}>{abilityInfo.icon}</span>
                                                <span className="text-[10px] font-bold text-white">{ability.name}</span>
                                                <span className="text-[8px] px-1 py-0.5 bg-black/30 rounded text-white/70 ml-auto">
                                                  {Math.round(ability.chance * 100)}%
                                                </span>
                                              </div>
                                              <p className="text-[9px] text-white/60 mb-1">{ability.desc}</p>
                                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[8px]">
                                                <span className="text-white/50">
                                                  Duration: <span className="text-white/80">{(ability.duration / 1000).toFixed(1)}s</span>
                                                </span>
                                                {ability.intensity !== undefined && (
                                                  <span className="text-white/50">
                                                    {ability.type === "slow" || ability.type.includes("tower") ? "Effect: " : "DPS: "}
                                                    <span className="text-white/80">
                                                      {ability.type === "slow" || ability.type.includes("tower")
                                                        ? `${Math.round(ability.intensity * 100)}%`
                                                        : ability.intensity}
                                                    </span>
                                                  </span>
                                                )}
                                                {ability.radius && (
                                                  <span className="text-white/50">
                                                    Radius: <span className="text-white/80">{ability.radius}</span>
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* No abilities/traits message */}
                                  {abilities.length === 0 && traits.length === 0 && (
                                    <div className="text-center text-[9px] text-stone-500 py-1">
                                      Standard enemy - no special abilities
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {activeTab === "spells" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {spellTypes.map((type) => {
                  const spell = SPELL_DATA[type];

                  // Spell type info
                  const spellInfo: Record<string, {
                    category: string;
                    color: string;
                    icon: React.ReactNode;
                    stats: { label: string; value: string; icon: React.ReactNode }[];
                    details: string[];
                    tip: string;
                  }> = {
                    fireball: {
                      category: "Damage",
                      color: "orange",
                      icon: <Flame size={14} />,
                      stats: [
                        { label: "Damage", value: "200", icon: <Swords size={12} /> },
                        { label: "Radius", value: "150", icon: <Radio size={12} /> },
                        { label: "Delay", value: "1s", icon: <Timer size={12} /> },
                      ],
                      details: [
                        "Meteor falls from sky with visual warning",
                        "Maximum damage at center, 50% at edge",
                        "Creates fire explosion effect",
                      ],
                      tip: "Best against clustered enemies at chokepoints",
                    },
                    lightning: {
                      category: "Chain",
                      color: "yellow",
                      icon: <Zap size={14} />,
                      stats: [
                        { label: "Total DMG", value: "600", icon: <Swords size={12} /> },
                        { label: "Targets", value: "5", icon: <Users size={12} /> },
                        { label: "Stun", value: "0.5s", icon: <CircleOff size={12} /> },
                      ],
                      details: [
                        "Chains between up to 5 enemies",
                        "Damage split among all targets",
                        "Each strike stuns briefly",
                      ],
                      tip: "Great for picking off multiple weakened enemies",
                    },
                    freeze: {
                      category: "Control",
                      color: "cyan",
                      icon: <Snowflake size={14} />,
                      stats: [
                        { label: "Duration", value: "3s", icon: <Timer size={12} /> },
                        { label: "Range", value: "Global", icon: <Radio size={12} /> },
                        { label: "Targets", value: "All", icon: <Users size={12} /> },
                      ],
                      details: [
                        "Freezes ALL enemies on the map",
                        "Enemies completely immobilized",
                        "Expanding ice wave visual effect",
                      ],
                      tip: "Emergency button when overwhelmed",
                    },
                    payday: {
                      category: "Economy",
                      color: "amber",
                      icon: <Banknote size={14} />,
                      stats: [
                        { label: "Base", value: "80 PP", icon: <Coins size={12} /> },
                        { label: "Per Enemy", value: "+5 PP", icon: <TrendingUp size={12} /> },
                        { label: "Max Bonus", value: "+50 PP", icon: <Star size={12} /> },
                      ],
                      details: [
                        "Base payout plus bonus per enemy",
                        "Maximum possible: 130 PP",
                        "Gold aura effect on all enemies",
                      ],
                      tip: "Use when many enemies are on screen for max value",
                    },
                    reinforcements: {
                      category: "Summon",
                      color: "green",
                      icon: <Users size={14} />,
                      stats: [
                        { label: "Knights", value: "3", icon: <Users size={12} /> },
                        { label: "Knight HP", value: "500", icon: <Heart size={12} /> },
                        { label: "Knight DMG", value: "30", icon: <Swords size={12} /> },
                      ],
                      details: [
                        "Summons 3 armored knight troops",
                        "Click to place anywhere on map",
                        "Knights fight independently",
                      ],
                      tip: "Great for blocking leaks or supporting weak points",
                    },
                  };
                  const info = spellInfo[type] || { category: "Spell", color: "purple", icon: <Sparkles size={14} />, stats: [], details: [], tip: "" };

                  return (
                    <div
                      key={type}
                      className="rounded-xl overflow-hidden hover:border-purple-700/50 transition-colors relative"
                      style={{
                        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${GOLD.border25}`,
                        boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                      }}
                    >
                      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                      {/* Header */}
                      <div className={`px-4 py-2.5 border-b flex items-center justify-between ${info.color === "orange" ? "bg-orange-950/50 border-orange-800/30" :
                        info.color === "yellow" ? "bg-yellow-950/50 border-yellow-800/30" :
                          info.color === "cyan" ? "bg-cyan-950/50 border-cyan-800/30" :
                            info.color === "amber" ? "bg-amber-950/50 border-amber-800/30" :
                              info.color === "green" ? "bg-green-950/50 border-green-800/30" :
                                "bg-purple-950/50 border-purple-800/30"
                        }`}>
                        <div className={`flex items-center gap-2 ${info.color === "orange" ? "text-orange-400" :
                          info.color === "yellow" ? "text-yellow-400" :
                            info.color === "cyan" ? "text-cyan-400" :
                              info.color === "amber" ? "text-amber-400" :
                                info.color === "green" ? "text-green-400" :
                                  "text-purple-400"
                          }`}>
                          {info.icon}
                          <span className="text-xs font-medium uppercase tracking-wider">
                            {info.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-400 flex items-center gap-1 text-xs">
                            <Coins size={12} />
                            {spell.cost > 0 ? `${spell.cost} PP` : "FREE"}
                          </span>
                          <span className="text-blue-400 flex items-center gap-1 text-xs">
                            <Timer size={12} />
                            {spell.cooldown / 1000}s
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-18 h-18 rounded-xl border-2 flex items-center justify-center p-2 flex-shrink-0 ${info.color === "orange" ? "bg-orange-950/40 border-orange-700/50" :
                            info.color === "yellow" ? "bg-yellow-950/40 border-yellow-700/50" :
                              info.color === "cyan" ? "bg-cyan-950/40 border-cyan-700/50" :
                                info.color === "amber" ? "bg-amber-950/40 border-amber-700/50" :
                                  info.color === "green" ? "bg-green-950/40 border-green-700/50" :
                                    "bg-purple-950/40 border-purple-700/50"
                            }`}>
                            <SpellSprite type={type} size={56} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-bold text-purple-200">
                                {spell.name}
                              </h3>
                              <span className="text-xl">{spell.icon}</span>
                            </div>
                            <p className="text-sm text-stone-400">{spell.desc}</p>
                          </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {info.stats.map((stat, i) => (
                            <div key={i} className={`rounded-lg p-2 text-center border ${info.color === "orange" ? "bg-orange-950/40 border-orange-800/30" :
                              info.color === "yellow" ? "bg-yellow-950/40 border-yellow-800/30" :
                                info.color === "cyan" ? "bg-cyan-950/40 border-cyan-800/30" :
                                  info.color === "amber" ? "bg-amber-950/40 border-amber-800/30" :
                                    info.color === "green" ? "bg-green-950/40 border-green-800/30" :
                                      "bg-purple-950/40 border-purple-800/30"
                              }`}>
                              <div className={`flex items-center justify-center mb-1 ${info.color === "orange" ? "text-orange-400" :
                                info.color === "yellow" ? "text-yellow-400" :
                                  info.color === "cyan" ? "text-cyan-400" :
                                    info.color === "amber" ? "text-amber-400" :
                                      info.color === "green" ? "text-green-400" :
                                        "text-purple-400"
                                }`}>
                                {stat.icon}
                              </div>
                              <div className="text-[9px] text-stone-500">{stat.label}</div>
                              <div className={`font-bold text-sm ${info.color === "orange" ? "text-orange-300" :
                                info.color === "yellow" ? "text-yellow-300" :
                                  info.color === "cyan" ? "text-cyan-300" :
                                    info.color === "amber" ? "text-amber-300" :
                                      info.color === "green" ? "text-green-300" :
                                        "text-purple-300"
                                }`}>{stat.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Details */}
                        <div className="bg-stone-800/40 rounded-lg p-3 border border-stone-700/40 mb-3">
                          <div className="text-xs text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Info size={10} /> Details
                          </div>
                          <ul className="text-xs text-stone-300 space-y-1">
                            {info.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tip */}
                        <div className={`rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${info.color === "orange" ? "bg-orange-950/30 border border-orange-800/30 text-orange-300" :
                          info.color === "yellow" ? "bg-yellow-950/30 border border-yellow-800/30 text-yellow-300" :
                            info.color === "cyan" ? "bg-cyan-950/30 border border-cyan-800/30 text-cyan-300" :
                              info.color === "amber" ? "bg-amber-950/30 border border-amber-800/30 text-amber-300" :
                                info.color === "green" ? "bg-green-950/30 border border-green-800/30 text-green-300" :
                                  "bg-purple-950/30 border border-purple-800/30 text-purple-300"
                          }`}>
                          <Sparkles size={12} />
                          <span className="font-medium">Pro Tip:</span>
                          <span className="text-stone-400">{info.tip}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
};

