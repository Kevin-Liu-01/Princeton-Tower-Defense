"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Star,
  Book,
  Shield,
  Zap,
  Swords,
  Play,
  Crown,
  X,
  Skull,
  Flag,
  Heart,
  Target,
  Flame,
  Sparkles,
  MapPin,
  ChevronRight,
  Trophy,
  Wind,
  ArrowUp,
  Info,
  Timer,
  Coins,
  Gauge,
  ChevronLeft,
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
} from "lucide-react";
import type { GameState, LevelStars, HeroType, SpellType } from "../../types";
import {
  HERO_DATA,
  SPELL_DATA,
  TOWER_DATA,
  ENEMY_DATA,
  LEVEL_WAVES,
  LEVEL_DATA,
  HERO_ABILITY_COOLDOWNS,
  TROOP_DATA,
} from "../../constants";
import { calculateTowerStats, TOWER_STATS } from "../../constants/towerStats";
import {
  TowerSprite,
  HeroSprite,
  EnemySprite,
  SpellSprite,
} from "../../sprites";
import PrincetonTDLogo from "../ui/PrincetonTDLogo";

// =============================================================================
// LEVEL DATA
// =============================================================================

interface LevelNode {
  id: string;
  name: string;
  description: string;
  region: "grassland" | "swamp" | "desert" | "winter" | "volcanic";
  difficulty: 1 | 2 | 3;
  x: number;
  y: number;
  connectsTo: string[];
}

const WORLD_LEVELS: LevelNode[] = [
  {
    id: "poe",
    name: "Poe Field",
    description: LEVEL_DATA["poe"].description,
    region: "grassland",
    difficulty: 1,
    x: 100,
    y: 70,
    connectsTo: ["carnegie"],
  },
  {
    id: "carnegie",
    name: "Carnegie Lake",
    description: "Strategic waterfront defense",
    region: "grassland",
    difficulty: 2,
    x: 200,
    y: 35,
    connectsTo: ["nassau"],
  },
  {
    id: "nassau",
    name: "Nassau Hall",
    description: "The heart of campus",
    region: "grassland",
    difficulty: 3,
    x: 310,
    y: 60,
    connectsTo: ["bog"],
  },
  // Swamp - Murky Marshes
  {
    id: "bog",
    name: "Murky Bog",
    description: "Treacherous wetlands",
    region: "swamp",
    difficulty: 1,
    x: 440,
    y: 39,
    connectsTo: ["witch_hut"],
  },
  {
    id: "witch_hut",
    name: "Witch's Domain",
    description: "Dark magic festers here",
    region: "swamp",
    difficulty: 2,
    x: 540,
    y: 65,
    connectsTo: ["sunken_temple"],
  },
  {
    id: "sunken_temple",
    name: "Sunken Temple",
    description: "Ancient ruins submerged",
    region: "swamp",
    difficulty: 3,
    x: 650,
    y: 32,
    connectsTo: ["oasis"],
  },
  // Desert
  {
    id: "oasis",
    name: "Desert Oasis",
    description: "A precious water source",
    region: "desert",
    difficulty: 1,
    x: 780,
    y: 42,
    connectsTo: ["pyramid"],
  },
  {
    id: "pyramid",
    name: "Pyramid Pass",
    description: "Ancient canyon passage",
    region: "desert",
    difficulty: 2,
    x: 900,
    y: 41,
    connectsTo: ["sphinx"],
  },
  {
    id: "sphinx",
    name: "Sphinx Gate",
    description: "The guardian's domain",
    region: "desert",
    difficulty: 3,
    x: 1000,
    y: 60,
    connectsTo: ["glacier"],
  },
  // Winter
  {
    id: "glacier",
    name: "Glacier Path",
    description: "Ice-covered mountain pass",
    region: "winter",
    difficulty: 1,
    x: 1140,
    y: 40,
    connectsTo: ["fortress"],
  },
  {
    id: "fortress",
    name: "Frost Fortress",
    description: "An abandoned stronghold",
    region: "winter",
    difficulty: 2,
    x: 1270,
    y: 36,
    connectsTo: ["peak"],
  },
  {
    id: "peak",
    name: "Summit Peak",
    description: "The highest defense point",
    region: "winter",
    difficulty: 3,
    x: 1360,
    y: 52,
    connectsTo: ["lava"],
  },
  // Volcanic
  {
    id: "lava",
    name: "Lava Fields",
    description: "Rivers of molten rock",
    region: "volcanic",
    difficulty: 2,
    x: 1520,
    y: 60,
    connectsTo: ["crater"],
  },
  {
    id: "crater",
    name: "Caldera Basin",
    description: "Inside the volcano's heart",
    region: "volcanic",
    difficulty: 3,
    x: 1590,
    y: 35,
    connectsTo: ["throne"],
  },
  {
    id: "throne",
    name: "Obsidian Throne",
    description: "The ultimate challenge",
    region: "volcanic",
    difficulty: 3,
    x: 1700,
    y: 62,
    connectsTo: [],
  },
];

const MAP_WIDTH = 1800;

const getWaveCount = (levelId: string): number => {
  const waves = LEVEL_WAVES[levelId];
  return waves ? waves.length : 0;
};

// =============================================================================
// LOGO COMPONENT
// =============================================================================

const PrincetonLogo: React.FC = () => {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => (p + 1) % 100), 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      <div className="absolute -inset-4 blur-2xl opacity-60">
        <div
          className="absolute inset-0 bg-gradient-to-r from-orange-600/40 via-amber-400/50 to-orange-600/40"
          style={{ transform: `scale(${1 + Math.sin(pulse * 0.1) * 0.1})` }}
        />
      </div>
      <PrincetonTDLogo />
      <div className="relative flex flex-col">
        <span
          className="text-base sm:text-2xl font-black tracking-wider"
          style={{
            background:
              "linear-gradient(180deg, #fcd34d 0%, #f59e0b 40%, #d97706 70%, #92400e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          PRINCETON
        </span>
        <div className="flex items-center gap-1 sm:gap-2 -mt-0.5">
          <Swords size={14} className="text-orange-400 size-2 sm:size-auto" />
          <span className="text-[6px] text-nowrap sm:text-[8.5px] font-bold tracking-[0.3em] text-amber-500/90">
            TOWER DEFENSE
          </span>
          <Swords
            size={14}
            className="text-orange-400 size-2 sm:size-auto"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
      </div>

      <img
        src="/images/gameplay-cropped.png"
        alt="Battle Scene"
        className="w-full h-80 object-bottom object-contain absolute top-[-14rem] right-[-10rem] opacity-10 pointer-events-none select-none"
      />
    </div>
  );
};

// =============================================================================
// CODEX MODAL
// =============================================================================

interface CodexModalProps {
  onClose: () => void;
}

const CodexModal: React.FC<CodexModalProps> = ({ onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-2xl border-2 border-amber-700/60 shadow-2xl overflow-hidden">
        <img
          src="/images/gameplay-cropped.png"
          alt="Battle Scene"
          className="w-full h-full z-5 object-bottom object-cover absolute top-0 left-0 opacity-[0.03] pointer-events-none select-none"
        />
        <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-900/90 via-stone-800/90 to-amber-900/90 backdrop-blur px-6 py-4 border-b-2 border-amber-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="text-amber-400" size={28} />
            <h2 className="text-3xl font-bold text-amber-300">Codex</h2>
            <span className="text-xs text-amber-500/70 ml-2">
              Complete Battle Encyclopedia
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-amber-800/50 transition-colors text-amber-400 hover:text-amber-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex z-10 overflow-scroll relative border-b border-amber-800/40 bg-stone-900/50">
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
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all font-medium ${activeTab === tab.id
                ? "bg-amber-900/50 text-amber-300 border-b-2 border-amber-500"
                : "text-amber-600 hover:text-amber-400 hover:bg-stone-800/50"
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-800/60 text-amber-500">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

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
                    className="bg-gradient-to-br from-stone-900/90 to-stone-950/90 rounded-xl border border-stone-700/50 hover:border-amber-500/60 hover:scale-[1.02] text-left group transition-all overflow-hidden"
                  >
                    {/* Header with category */}
                    <div className={`px-4 py-2 border-b flex items-center justify-between ${type === "station" ? "bg-purple-950/50 border-purple-800/30" :
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
                        <div className="w-16 h-16 rounded-lg bg-stone-800/80 border border-stone-600/50 flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
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
                      <div className="text-green-300 font-bold">{stats.attackSpeed}ms</div>
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
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-4 transition-colors"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    <span>Back to all towers</span>
                  </button>

                  <div className="space-y-6">
                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-stone-900 to-stone-950 rounded-xl border border-stone-700/50 overflow-hidden">
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
                        <div className="w-28 h-28 rounded-xl bg-stone-800/80 border-2 border-amber-600/50 flex items-center justify-center flex-shrink-0">
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
                      <h4 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                        <ArrowUp size={18} />
                        Level Progression
                      </h4>
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
                                                  <div className="text-green-300 font-bold">{pathTroop.attackSpeed}ms</div>
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
                                                    <div className="text-green-300 font-bold">{pathStats.attackSpeed}ms</div>
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
                                          <div className="text-green-300 font-bold">{troop.attackSpeed}ms</div>
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
                                            <div className="text-green-300 font-bold">{stats.attackSpeed}ms</div>
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
                      <h4 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                        <Sparkles size={18} />
                        Evolution Paths (Level 4)
                      </h4>
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
                                        <div className="text-green-300 font-bold">{troop.attackSpeed}ms</div>
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
                    className="bg-gradient-to-br from-stone-900/90 to-stone-950/90 rounded-xl border border-stone-700/50 hover:border-amber-500/60 hover:scale-[1.02] text-left group transition-all overflow-hidden"
                  >
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
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-4 transition-colors"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    <span>Back to all heroes</span>
                  </button>

                  <div className="space-y-6">
                    {/* Hero Header */}
                    <div className="bg-gradient-to-br from-stone-900 to-stone-950 rounded-xl border border-stone-700/50 overflow-hidden">
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
                              <div className="text-green-300 font-bold text-lg">{hero.attackSpeed}ms</div>
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
                          <Sparkles size={18} className="text-purple-400" />
                          <span className="text-sm text-purple-400 font-medium uppercase tracking-wider">Special Ability</span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-950/50 px-3 py-1.5 rounded-lg border border-purple-700/50">
                          <Timer size={14} className="text-purple-400" />
                          <span className="text-purple-300 font-bold text-sm">{cooldown / 1000}s Cooldown</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="text-2xl font-bold text-purple-200 mb-2">{hero.ability}</h4>
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
                    <div className="bg-stone-800/50 rounded-xl border border-stone-700/50 p-5">
                      <h4 className="text-amber-300 font-bold mb-3 flex items-center gap-2">
                        <Info size={16} /> Combat Strategy
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

          {activeTab === "enemies" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enemyTypes.map((type) => {
                const enemy = ENEMY_DATA[type];

                // Determine threat level based on HP
                const getThreatLevel = (hp: number) => {
                  if (hp >= 1000) return { level: "Boss", color: "purple", icon: <Crown size={12} /> };
                  if (hp >= 500) return { level: "Elite", color: "orange", icon: <Star size={12} /> };
                  if (hp >= 200) return { level: "Standard", color: "yellow", icon: <Skull size={12} /> };
                  return { level: "Minion", color: "green", icon: <Skull size={12} /> };
                };
                const threat = getThreatLevel(enemy.hp);

                // Enemy type classification
                const getEnemyType = () => {
                  if (enemy.flying) return { type: "Flying", icon: <Wind size={12} />, color: "cyan" };
                  if ((enemy as any).isRanged) return { type: "Ranged", icon: <Crosshair size={12} />, color: "purple" };
                  if (enemy.armor > 0.2) return { type: "Armored", icon: <Shield size={12} />, color: "stone" };
                  if (enemy.speed > 80) return { type: "Fast", icon: <Gauge size={12} />, color: "green" };
                  return { type: "Ground", icon: <Flag size={12} />, color: "red" };
                };
                const enemyType = getEnemyType();

                return (
                  <div
                    key={type}
                    className="bg-gradient-to-br from-stone-900/90 to-stone-950/90 rounded-xl border border-stone-700/50 overflow-hidden hover:border-red-700/50 transition-colors"
                  >
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
                      <div className={`flex items-center gap-1.5 text-xs ${enemyType.color === "cyan" ? "text-cyan-400" :
                        enemyType.color === "purple" ? "text-purple-400" :
                          enemyType.color === "stone" ? "text-stone-400" :
                            enemyType.color === "green" ? "text-green-400" :
                              "text-red-400"
                        }`}>
                        {enemyType.icon}
                        <span>{enemyType.type}</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-16 h-16 rounded-lg bg-stone-800/80 border border-red-900/40 flex items-center justify-center flex-shrink-0">
                          <EnemySprite type={type} size={52} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-red-200 truncate">
                            {enemy.name}
                          </h3>
                          <p className="text-xs text-stone-400 line-clamp-2 mt-1">
                            {enemy.desc}
                          </p>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-4 gap-1.5 mb-3">
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

                      {/* Special traits */}
                      <div className="flex flex-wrap gap-1.5">
                        {enemy.flying && (
                          <span className="text-[10px] px-2 py-1 bg-cyan-950/50 rounded-full text-cyan-300 border border-cyan-800/40 flex items-center gap-1">
                            <Wind size={10} /> Flies over obstacles
                          </span>
                        )}
                        {(enemy as any).isRanged && (
                          <span className="text-[10px] px-2 py-1 bg-purple-950/50 rounded-full text-purple-300 border border-purple-800/40 flex items-center gap-1">
                            <Crosshair size={10} /> Ranged attacks
                          </span>
                        )}
                        {enemy.armor > 0.3 && (
                          <span className="text-[10px] px-2 py-1 bg-stone-800/50 rounded-full text-stone-300 border border-stone-700/40 flex items-center gap-1">
                            <Shield size={10} /> Heavy armor
                          </span>
                        )}
                        {enemy.speed > 100 && (
                          <span className="text-[10px] px-2 py-1 bg-green-950/50 rounded-full text-green-300 border border-green-800/40 flex items-center gap-1">
                            <Gauge size={10} /> Very fast
                          </span>
                        )}
                        {enemy.hp >= 1000 && (
                          <span className="text-[10px] px-2 py-1 bg-purple-950/50 rounded-full text-purple-300 border border-purple-800/40 flex items-center gap-1">
                            <Crown size={10} /> Boss enemy
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
                    className="bg-gradient-to-br from-stone-900/90 to-stone-950/90 rounded-xl border border-stone-700/50 overflow-hidden hover:border-purple-700/50 transition-colors"
                  >
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
      </div>
    </div>
  );
};

// =============================================================================
// BATTLEFIELD PREVIEW
// =============================================================================

const BattlefieldPreview: React.FC<{ animTime: number }> = ({ animTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentScene, setCurrentScene] = useState(0);

  // Cycle through scenes every 6 seconds for more viewing time
  useEffect(() => {
    const sceneIndex = Math.floor(animTime / 6) % 6;
    setCurrentScene(sceneIndex);
  }, [animTime]);

  // Draw battle scene on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const t = animTime;

    // Scene configurations inspired by game regions
    const scenes = [
      {
        name: "Nassau Campus",
        bg1: "#1a2810", bg2: "#0d1408",
        groundColor: "#2d4a1f",
        accent: "#f97316", // Princeton orange
        secondary: "#000000",
        skyGlow: "#f9731620",
        particles: "leaves",
        weather: "clear"
      },
      {
        name: "Volcanic Caldera",
        bg1: "#3d1a0a", bg2: "#1a0805",
        groundColor: "#4a1a10",
        accent: "#ef4444",
        secondary: "#fbbf24",
        skyGlow: "#ef444440",
        particles: "embers",
        weather: "smoke"
      },
      {
        name: "Frozen Glacier",
        bg1: "#1a2a3a", bg2: "#0d151d",
        groundColor: "#3a5a6a",
        accent: "#60a5fa",
        secondary: "#e0f2fe",
        skyGlow: "#60a5fa30",
        particles: "snow",
        weather: "blizzard"
      },
      {
        name: "Desert Sphinx",
        bg1: "#4a3a20", bg2: "#2a2010",
        groundColor: "#8a7050",
        accent: "#fbbf24",
        secondary: "#d97706",
        skyGlow: "#fbbf2420",
        particles: "sand",
        weather: "sandstorm"
      },
      {
        name: "Murky Bog",
        bg1: "#1a2a1a", bg2: "#0d150d",
        groundColor: "#2a3a2a",
        accent: "#4ade80",
        secondary: "#a855f7",
        skyGlow: "#4ade8020",
        particles: "fireflies",
        weather: "fog"
      },
      {
        name: "Night Siege",
        bg1: "#15102a", bg2: "#08051a",
        groundColor: "#2a2a4a",
        accent: "#a855f7",
        secondary: "#f97316",
        skyGlow: "#a855f730",
        particles: "magic",
        weather: "starry"
      },
    ];
    const scene = scenes[currentScene];

    // === BACKGROUND LAYERS ===

    // Sky gradient with atmospheric glow
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, scene.bg1);
    bgGrad.addColorStop(0.4, scene.bg2);
    bgGrad.addColorStop(1, scene.groundColor);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Atmospheric glow orbs
    for (let i = 0; i < 3; i++) {
      const glowX = width * (0.2 + i * 0.3) + Math.sin(t * 0.3 + i * 2) * 30;
      const glowY = height * 0.25 + Math.cos(t * 0.2 + i) * 20;
      const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 80);
      glowGrad.addColorStop(0, scene.skyGlow);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Stars for night scenes
    if (scene.weather === "starry") {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 30; i++) {
        const starX = (i * 37 + Math.sin(i * 123) * 100) % width;
        const starY = (i * 23 + Math.cos(i * 87) * 50) % (height * 0.5);
        const twinkle = 0.3 + Math.sin(t * 3 + i) * 0.7;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(starX, starY, 1 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // === DISTANT MOUNTAINS / STRUCTURES ===

    // Mountain silhouettes
    ctx.fillStyle = scene.bg2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    for (let x = 0; x <= width; x += 30) {
      const mountainHeight = Math.sin(x * 0.02) * 30 + Math.sin(x * 0.05) * 20 + Math.sin(x * 0.01) * 40;
      ctx.lineTo(x, height * 0.45 - mountainHeight);
    }
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(0, height * 0.7);
    ctx.closePath();
    ctx.fill();

    // === GROUND WITH TEXTURE ===

    const groundY = height * 0.65;

    // Main ground with wavy top
    ctx.fillStyle = scene.groundColor;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= width; x += 10) {
      ctx.lineTo(x, groundY + Math.sin(x * 0.03 + t * 0.5) * 4);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Ground texture pattern
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 20; i++) {
      const gx = (i * 47 + t * 5) % width;
      const gy = groundY + 15 + (i % 3) * 25;
      ctx.fillStyle = i % 2 === 0 ? scene.accent : scene.secondary;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 3 + (i % 4), 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // === PATH / ROAD ===

    // Winding battle path
    ctx.strokeStyle = "#3a3020";
    ctx.lineWidth = 25;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-20, groundY + 40);
    ctx.bezierCurveTo(
      width * 0.25, groundY + 50,
      width * 0.4, groundY + 20,
      width * 0.6, groundY + 45
    );
    ctx.bezierCurveTo(
      width * 0.8, groundY + 70,
      width * 0.9, groundY + 30,
      width + 20, groundY + 40
    );
    ctx.stroke();

    // Path highlight
    ctx.strokeStyle = "#4a4030";
    ctx.lineWidth = 15;
    ctx.stroke();

    // === BATTLEFIELD DECORATIONS & ENVIRONMENT ===

    // Distant castle silhouette (background)
    ctx.fillStyle = "#1a1510";
    ctx.beginPath();
    ctx.moveTo(width * 0.85, groundY - 20);
    ctx.lineTo(width * 0.83, groundY - 60);
    ctx.lineTo(width * 0.81, groundY - 55);
    ctx.lineTo(width * 0.81, groundY - 80);
    ctx.lineTo(width * 0.79, groundY - 75);
    ctx.lineTo(width * 0.79, groundY - 65);
    ctx.lineTo(width * 0.77, groundY - 70);
    ctx.lineTo(width * 0.75, groundY - 50);
    ctx.lineTo(width * 0.73, groundY - 55);
    ctx.lineTo(width * 0.71, groundY - 20);
    ctx.closePath();
    ctx.fill();

    // War banners on poles
    const drawBanner = (bx: number, by: number, color1: string, color2: string, waveOffset: number) => {
      const wave = Math.sin(t * 4 + waveOffset) * 5;

      // Pole
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(bx - 2, by - 50, 4, 55);
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(bx, by - 52, 4, 0, Math.PI * 2);
      ctx.fill();

      // Banner fabric with wave
      const bannerGrad = ctx.createLinearGradient(bx, by - 48, bx + 20, by - 20);
      bannerGrad.addColorStop(0, color1);
      bannerGrad.addColorStop(1, color2);
      ctx.fillStyle = bannerGrad;
      ctx.beginPath();
      ctx.moveTo(bx + 2, by - 48);
      ctx.quadraticCurveTo(bx + 15 + wave, by - 42, bx + 22, by - 35 + wave * 0.5);
      ctx.quadraticCurveTo(bx + 15 + wave * 0.5, by - 28, bx + 20, by - 20 + wave * 0.3);
      ctx.lineTo(bx + 2, by - 25);
      ctx.closePath();
      ctx.fill();

      // Banner emblem
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(bx + 10 + wave * 0.3, by - 36, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    drawBanner(width * 0.08, groundY + 5, "#f97316", "#c2410c", 0);
    drawBanner(width * 0.92, groundY + 5, "#f97316", "#c2410c", 1.5);

    // Scattered rocks and boulders
    const drawRock = (rx: number, ry: number, size: number) => {
      const rockGrad = ctx.createLinearGradient(rx - size, ry - size, rx + size, ry + size);
      rockGrad.addColorStop(0, "#6b6560");
      rockGrad.addColorStop(0.5, "#57534e");
      rockGrad.addColorStop(1, "#3a3530");
      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(rx - size, ry + size * 0.3);
      ctx.quadraticCurveTo(rx - size * 0.8, ry - size * 0.6, rx - size * 0.2, ry - size * 0.8);
      ctx.quadraticCurveTo(rx + size * 0.3, ry - size * 0.9, rx + size * 0.7, ry - size * 0.4);
      ctx.quadraticCurveTo(rx + size, ry + size * 0.2, rx + size * 0.5, ry + size * 0.5);
      ctx.quadraticCurveTo(rx, ry + size * 0.6, rx - size, ry + size * 0.3);
      ctx.fill();

      // Rock highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.ellipse(rx - size * 0.3, ry - size * 0.4, size * 0.3, size * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    drawRock(width * 0.05, groundY + 35, 12);
    drawRock(width * 0.18, groundY + 50, 8);
    drawRock(width * 0.42, groundY + 55, 10);
    drawRock(width * 0.65, groundY + 48, 7);
    drawRock(width * 0.88, groundY + 40, 14);

    // Dead trees / burnt stumps
    const drawDeadTree = (tx: number, ty: number, scale: number) => {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);

      // Trunk
      ctx.fillStyle = "#2a2520";
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-4, -35);
      ctx.lineTo(4, -35);
      ctx.lineTo(6, 0);
      ctx.closePath();
      ctx.fill();

      // Dead branches
      ctx.strokeStyle = "#2a2520";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-3, -30);
      ctx.lineTo(-15, -45);
      ctx.moveTo(2, -28);
      ctx.lineTo(12, -42);
      ctx.moveTo(0, -35);
      ctx.lineTo(-5, -50);
      ctx.stroke();

      ctx.restore();
    };

    drawDeadTree(width * 0.02, groundY + 15, 0.6);
    drawDeadTree(width * 0.95, groundY + 20, 0.7);

    // === BATTLE DAMAGE & DEBRIS ===

    // Bomb craters
    const drawCrater = (cx: number, cy: number, size: number) => {
      // Outer dirt ring
      ctx.fillStyle = "#3a3025";
      ctx.beginPath();
      ctx.ellipse(cx, cy, size * 1.5, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner crater
      const craterGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
      craterGrad.addColorStop(0, "#1a1510");
      craterGrad.addColorStop(0.6, "#2a2520");
      craterGrad.addColorStop(1, "#3a3530");
      ctx.fillStyle = craterGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, size, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Scorched edge
      ctx.strokeStyle = "#1a1510";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 1, size * 1.2, size * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    };

    drawCrater(width * 0.25, groundY + 55, 15);
    drawCrater(width * 0.58, groundY + 60, 12);
    drawCrater(width * 0.82, groundY + 52, 10);

    // Scattered debris and broken weapons
    const drawDebris = (dx: number, dy: number, type: number) => {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(type * 0.8);

      if (type % 3 === 0) {
        // Broken sword
        ctx.fillStyle = "#8a8a8a";
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(5, -1);
        ctx.lineTo(6, 1);
        ctx.lineTo(-8, 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#5a4a3a";
        ctx.fillRect(-12, -3, 5, 6);
      } else if (type % 3 === 1) {
        // Broken shield piece
        ctx.fillStyle = "#6a5a4a";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#c9a227";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else {
        // Arrow
        ctx.strokeStyle = "#5a4a3a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(12, -3);
        ctx.lineTo(12, 3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    for (let d = 0; d < 8; d++) {
      const debrisX = width * (0.1 + d * 0.1 + Math.sin(d * 2.5) * 0.05);
      const debrisY = groundY + 45 + (d % 3) * 8;
      drawDebris(debrisX, debrisY, d);
    }

    // Burn marks / scorch marks on ground
    for (let burn = 0; burn < 5; burn++) {
      const bx = width * (0.15 + burn * 0.18);
      const by = groundY + 35 + (burn % 2) * 20;
      ctx.fillStyle = "rgba(30, 20, 15, 0.4)";
      ctx.beginPath();
      ctx.ellipse(bx, by, 20 + burn * 3, 8 + burn, burn * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smoke columns from damage
    for (let smoke = 0; smoke < 3; smoke++) {
      const smokeX = width * (0.2 + smoke * 0.3);
      for (let puff = 0; puff < 4; puff++) {
        const puffAge = (t * 0.8 + smoke * 0.5 + puff * 0.3) % 2;
        const puffY = groundY + 30 - puffAge * 50;
        const puffSize = 8 + puffAge * 15;
        const puffAlpha = 0.2 - puffAge * 0.08;
        if (puffAlpha > 0) {
          ctx.fillStyle = `rgba(60, 55, 50, ${puffAlpha})`;
          ctx.beginPath();
          ctx.arc(smokeX + Math.sin(t * 2 + puff) * 10, puffY, puffSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Defensive barricades / wooden barriers
    const drawBarricade = (bx: number, by: number) => {
      // Wooden stakes
      ctx.fillStyle = "#5a4a3a";
      for (let stake = 0; stake < 4; stake++) {
        ctx.save();
        ctx.translate(bx + stake * 8 - 12, by);
        ctx.rotate(-0.2 + stake * 0.15);
        ctx.fillRect(-2, -20, 4, 22);
        // Stake point
        ctx.beginPath();
        ctx.moveTo(-2, -20);
        ctx.lineTo(0, -28);
        ctx.lineTo(2, -20);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Crossbar
      ctx.fillStyle = "#4a3a2a";
      ctx.save();
      ctx.translate(bx, by - 10);
      ctx.rotate(0.1);
      ctx.fillRect(-18, -2, 36, 4);
      ctx.restore();

      // Battle damage on barricade
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx - 5, by - 15);
      ctx.lineTo(bx - 3, by - 8);
      ctx.stroke();
    };

    drawBarricade(width * 0.28, groundY + 38);
    drawBarricade(width * 0.62, groundY + 42);

    // === EPIC TOWERS WITH FULL DETAIL ===

    // Helper: Draw isometric shadow
    const drawTowerShadow = (x: number, y: number, w: number, h: number) => {
      const shadowGrad = ctx.createRadialGradient(x, y + h * 0.3, 0, x, y + h * 0.3, w * 1.2);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.5)");
      shadowGrad.addColorStop(0.5, "rgba(0,0,0,0.25)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(x, y + h * 0.3, w * 1.1, h * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    // NASSAU CANNON TOWER - Heavy Artillery Platform with mechanical detail
    const drawCannonTower = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 10, 35, 20);

      // Isometric base platform with beveled edges
      const baseGrad = ctx.createLinearGradient(-30, 0, 30, 15);
      baseGrad.addColorStop(0, "#5a5a62");
      baseGrad.addColorStop(0.3, "#4a4a52");
      baseGrad.addColorStop(0.7, "#3a3a42");
      baseGrad.addColorStop(1, "#2a2a32");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(28, 0);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();

      // Platform edge highlight
      ctx.strokeStyle = "#6a6a72";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, -12);
      ctx.lineTo(28, 0);
      ctx.stroke();

      // Main tower body - mechanical fortress
      const towerGrad = ctx.createLinearGradient(-22, -70, 22, 0);
      towerGrad.addColorStop(0, "#5a5a62");
      towerGrad.addColorStop(0.2, "#4a4a52");
      towerGrad.addColorStop(0.5, "#3a3a42");
      towerGrad.addColorStop(0.8, "#4a4a52");
      towerGrad.addColorStop(1, "#2a2a32");
      ctx.fillStyle = towerGrad;
      ctx.beginPath();
      ctx.moveTo(-22, -5);
      ctx.lineTo(-22, -55);
      ctx.lineTo(-18, -60);
      ctx.lineTo(18, -60);
      ctx.lineTo(22, -55);
      ctx.lineTo(22, -5);
      ctx.closePath();
      ctx.fill();

      // Armor plates with rivets
      ctx.strokeStyle = "#2a2a32";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-20, -20);
      ctx.lineTo(20, -20);
      ctx.moveTo(-20, -40);
      ctx.lineTo(20, -40);
      ctx.stroke();

      // Decorative rivets
      ctx.fillStyle = "#6a6a72";
      for (let row = 0; row < 3; row++) {
        for (let col = -2; col <= 2; col++) {
          ctx.beginPath();
          ctx.arc(col * 8, -15 - row * 20, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Tech glow strips
      const glowPulse = 0.5 + Math.sin(t * 3) * 0.3;
      ctx.fillStyle = `rgba(255, 102, 0, ${glowPulse})`;
      ctx.fillRect(-20, -52, 3, 45);
      ctx.fillRect(17, -52, 3, 45);

      // Crenellations with shadow
      for (let i = 0; i < 5; i++) {
        const crenX = -16 + i * 8;
        ctx.fillStyle = "#4a4a52";
        ctx.fillRect(crenX, -72, 6, 14);
        ctx.fillStyle = "#5a5a62";
        ctx.fillRect(crenX, -72, 6, 3);
      }

      // Rotating turret platform
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.ellipse(0, -60, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tech ring glow
      ctx.strokeStyle = `rgba(255, 102, 0, ${glowPulse * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -60, 16, 8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Heavy cannon assembly
      const cannonAngle = Math.sin(t * 1.5) * 0.2 - 0.15;
      ctx.save();
      ctx.translate(0, -65);
      ctx.rotate(cannonAngle);

      // Cannon housing
      const cannonGrad = ctx.createLinearGradient(0, -8, 0, 8);
      cannonGrad.addColorStop(0, "#4a4a52");
      cannonGrad.addColorStop(0.5, "#3a3a42");
      cannonGrad.addColorStop(1, "#2a2a32");
      ctx.fillStyle = cannonGrad;
      ctx.beginPath();
      ctx.arc(-5, 0, 10, Math.PI * 0.5, Math.PI * 1.5);
      ctx.lineTo(35, -6);
      ctx.lineTo(40, -4);
      ctx.lineTo(40, 4);
      ctx.lineTo(35, 6);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fill();

      // Barrel detail rings
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(8 + i * 8, -5);
        ctx.lineTo(8 + i * 8, 5);
        ctx.stroke();
      }

      // Muzzle
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.ellipse(40, 0, 4, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Muzzle flash & smoke
      const firePhase = (t * 2) % 3;
      if (firePhase < 0.3) {
        const flashSize = 1 - firePhase / 0.3;
        // Fire flash
        const flashGrad = ctx.createRadialGradient(35, -70, 0, 35, -70, 25 * flashSize);
        flashGrad.addColorStop(0, `rgba(255, 255, 200, ${flashSize})`);
        flashGrad.addColorStop(0.3, `rgba(255, 150, 50, ${flashSize * 0.8})`);
        flashGrad.addColorStop(0.6, `rgba(255, 80, 0, ${flashSize * 0.5})`);
        flashGrad.addColorStop(1, "transparent");
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(35, -70, 25 * flashSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Smoke particles
      ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
      for (let i = 0; i < 5; i++) {
        const smokeAge = (t * 1.5 + i * 0.4) % 2;
        if (smokeAge < 1.5) {
          const sx = 30 + smokeAge * 15 + Math.sin(t * 3 + i) * 5;
          const sy = -75 - smokeAge * 25;
          const sr = 4 + smokeAge * 6;
          ctx.globalAlpha = 0.4 - smokeAge * 0.25;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Glowing windows
      for (let i = 0; i < 2; i++) {
        const winGlow = 0.5 + Math.sin(t * 2 + i) * 0.3;
        ctx.fillStyle = `rgba(255, 180, 100, ${winGlow})`;
        ctx.fillRect(-8 + i * 10, -35, 6, 10);
        // Window frame
        ctx.strokeStyle = "#2a2a32";
        ctx.lineWidth = 1;
        ctx.strokeRect(-8 + i * 10, -35, 6, 10);
      }

      ctx.restore();
    };

    // E-QUAD LAB TOWER - High-tech Tesla Facility
    const drawLabTower = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 10, 35, 20);

      // Isometric base
      const baseGrad = ctx.createLinearGradient(-30, 0, 30, 15);
      baseGrad.addColorStop(0, "#4a5a6a");
      baseGrad.addColorStop(0.5, "#3a4a5a");
      baseGrad.addColorStop(1, "#2a3a4a");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(28, 0);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();

      // Main lab building - modern angular design
      const labGrad = ctx.createLinearGradient(-25, -80, 25, 0);
      labGrad.addColorStop(0, "#5a6a7a");
      labGrad.addColorStop(0.3, "#4a5a6a");
      labGrad.addColorStop(0.6, "#3a4a5a");
      labGrad.addColorStop(1, "#2a3a4a");
      ctx.fillStyle = labGrad;
      ctx.beginPath();
      ctx.moveTo(-24, -5);
      ctx.lineTo(-24, -60);
      ctx.lineTo(-20, -68);
      ctx.lineTo(0, -75);
      ctx.lineTo(20, -68);
      ctx.lineTo(24, -60);
      ctx.lineTo(24, -5);
      ctx.closePath();
      ctx.fill();

      // Tech panel lines
      ctx.strokeStyle = "#2a3a4a";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-22, -15 - i * 15);
        ctx.lineTo(22, -15 - i * 15);
        ctx.stroke();
      }

      // Vertical accent strips
      ctx.fillStyle = "#5a6a7a";
      ctx.fillRect(-22, -60, 3, 55);
      ctx.fillRect(19, -60, 3, 55);

      // Energy core glow
      const corePulse = 0.6 + Math.sin(t * 4) * 0.4;
      const coreGrad = ctx.createRadialGradient(0, -40, 0, 0, -40, 20);
      coreGrad.addColorStop(0, `rgba(96, 165, 250, ${corePulse})`);
      coreGrad.addColorStop(0.5, `rgba(59, 130, 246, ${corePulse * 0.5})`);
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, -40, 20, 0, Math.PI * 2);
      ctx.fill();

      // Central viewing window
      ctx.fillStyle = `rgba(96, 165, 250, ${0.4 + corePulse * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(-10, -50);
      ctx.lineTo(-10, -30);
      ctx.lineTo(10, -30);
      ctx.lineTo(10, -50);
      ctx.lineTo(0, -55);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3a4a5a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tesla coils - dual spires
      for (let side = -1; side <= 1; side += 2) {
        const coilX = side * 18;

        // Coil base
        ctx.fillStyle = "#5a6a7a";
        ctx.beginPath();
        ctx.moveTo(coilX - 5, -68);
        ctx.lineTo(coilX - 4, -95);
        ctx.lineTo(coilX + 4, -95);
        ctx.lineTo(coilX + 5, -68);
        ctx.closePath();
        ctx.fill();

        // Coil rings
        ctx.strokeStyle = "#7a8a9a";
        ctx.lineWidth = 2;
        for (let ring = 0; ring < 4; ring++) {
          ctx.beginPath();
          ctx.ellipse(coilX, -72 - ring * 6, 5 - ring * 0.5, 2, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Energy sphere
        const spherePulse = 0.7 + Math.sin(t * 6 + side * 2) * 0.3;
        const sphereGrad = ctx.createRadialGradient(coilX, -100, 0, coilX, -100, 10);
        sphereGrad.addColorStop(0, `rgba(200, 220, 255, ${spherePulse})`);
        sphereGrad.addColorStop(0.4, `rgba(96, 165, 250, ${spherePulse * 0.8})`);
        sphereGrad.addColorStop(1, `rgba(59, 130, 246, 0)`);
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(coilX, -100, 10, 0, Math.PI * 2);
        ctx.fill();

        // Electric arcs
        const arcPhase = (t * 5 + side * 3) % 1;
        if (arcPhase < 0.7) {
          ctx.strokeStyle = `rgba(150, 200, 255, ${0.8 - arcPhase})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(coilX, -100);

          // Jagged lightning path
          let lx = coilX;
          let ly = -100;
          const targetX = side * 45 + Math.sin(t * 8) * 20;
          const targetY = -70 + Math.cos(t * 6) * 15;
          for (let seg = 0; seg < 4; seg++) {
            lx += (targetX - coilX) / 4 + (Math.random() - 0.5) * 15;
            ly += (targetY + 100) / 4 + (Math.random() - 0.5) * 10;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();

          // Secondary arc
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.moveTo(coilX, -100);
          ctx.lineTo(coilX + side * 12, -85);
          ctx.lineTo(coilX + side * 25, -75);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Arc glow at connection point
        if (arcPhase < 0.5) {
          const arcGlow = ctx.createRadialGradient(coilX + side * 35, -70, 0, coilX + side * 35, -70, 15);
          arcGlow.addColorStop(0, `rgba(150, 200, 255, ${0.5 - arcPhase})`);
          arcGlow.addColorStop(1, "transparent");
          ctx.fillStyle = arcGlow;
          ctx.beginPath();
          ctx.arc(coilX + side * 35, -70, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Floating energy particles
      for (let p = 0; p < 8; p++) {
        const pAngle = (t * 2 + p * Math.PI * 0.25) % (Math.PI * 2);
        const pDist = 25 + Math.sin(t * 3 + p) * 5;
        const px = Math.cos(pAngle) * pDist;
        const py = -75 + Math.sin(pAngle) * 8;
        ctx.fillStyle = `rgba(150, 200, 255, ${0.4 + Math.sin(t * 5 + p) * 0.3})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // BLAIR ARCH TOWER - Gothic Architecture with Sonic Waves
    const drawArchTower = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 10, 35, 20);

      // Isometric base
      const baseGrad = ctx.createLinearGradient(-30, 0, 30, 15);
      baseGrad.addColorStop(0, "#7a6a5a");
      baseGrad.addColorStop(0.5, "#6a5a4a");
      baseGrad.addColorStop(1, "#5a4a3a");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(28, 0);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();

      // Gothic columns with fluting
      for (let side = -1; side <= 1; side += 2) {
        const colX = side * 20;

        // Column shaft
        const colGrad = ctx.createLinearGradient(colX - 6, 0, colX + 6, 0);
        colGrad.addColorStop(0, "#5a4a3a");
        colGrad.addColorStop(0.3, "#7a6a5a");
        colGrad.addColorStop(0.5, "#8a7a6a");
        colGrad.addColorStop(0.7, "#7a6a5a");
        colGrad.addColorStop(1, "#5a4a3a");
        ctx.fillStyle = colGrad;
        ctx.fillRect(colX - 6, -60, 12, 65);

        // Column fluting (vertical lines)
        ctx.strokeStyle = "#4a3a2a";
        ctx.lineWidth = 1;
        for (let f = -2; f <= 2; f++) {
          ctx.beginPath();
          ctx.moveTo(colX + f * 2, -55);
          ctx.lineTo(colX + f * 2, 0);
          ctx.stroke();
        }

        // Capital (top decoration)
        ctx.fillStyle = "#8a7a6a";
        ctx.beginPath();
        ctx.moveTo(colX - 8, -60);
        ctx.lineTo(colX - 10, -65);
        ctx.lineTo(colX + 10, -65);
        ctx.lineTo(colX + 8, -60);
        ctx.closePath();
        ctx.fill();

        // Base molding
        ctx.fillStyle = "#6a5a4a";
        ctx.beginPath();
        ctx.moveTo(colX - 8, 0);
        ctx.lineTo(colX - 10, 5);
        ctx.lineTo(colX + 10, 5);
        ctx.lineTo(colX + 8, 0);
        ctx.closePath();
        ctx.fill();
      }

      // Gothic arch with keystone
      ctx.strokeStyle = "#8a7a6a";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, -55, 26, Math.PI, 0);
      ctx.stroke();

      // Inner arch
      ctx.strokeStyle = "#6a5a4a";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -55, 20, Math.PI, 0);
      ctx.stroke();

      // Keystone
      ctx.fillStyle = "#9a8a7a";
      ctx.beginPath();
      ctx.moveTo(-6, -82);
      ctx.lineTo(0, -88);
      ctx.lineTo(6, -82);
      ctx.lineTo(4, -75);
      ctx.lineTo(-4, -75);
      ctx.closePath();
      ctx.fill();

      // Ornate spires
      for (let side = -1; side <= 1; side += 2) {
        const spireX = side * 24;
        ctx.fillStyle = "#7a6a5a";
        ctx.beginPath();
        ctx.moveTo(spireX - 4, -65);
        ctx.lineTo(spireX, -95);
        ctx.lineTo(spireX + 4, -65);
        ctx.closePath();
        ctx.fill();

        // Spire orb
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(spireX, -98, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central rose window (glowing)
      const rosePulse = 0.5 + Math.sin(t * 2) * 0.3;
      const roseGrad = ctx.createRadialGradient(0, -55, 0, 0, -55, 15);
      roseGrad.addColorStop(0, `rgba(200, 150, 255, ${rosePulse})`);
      roseGrad.addColorStop(0.5, `rgba(168, 85, 247, ${rosePulse * 0.7})`);
      roseGrad.addColorStop(1, `rgba(139, 92, 246, ${rosePulse * 0.3})`);
      ctx.fillStyle = roseGrad;
      ctx.beginPath();
      ctx.arc(0, -55, 14, 0, Math.PI * 2);
      ctx.fill();

      // Rose window spokes
      ctx.strokeStyle = "#4a3a2a";
      ctx.lineWidth = 1.5;
      for (let spoke = 0; spoke < 8; spoke++) {
        const angle = spoke * Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(0, -55);
        ctx.lineTo(Math.cos(angle) * 12, -55 + Math.sin(angle) * 12);
        ctx.stroke();
      }

      // Sonic wave emissions - purple concentric rings
      const waveSpeed = t * 4;
      for (let wave = 0; wave < 5; wave++) {
        const wavePhase = ((waveSpeed + wave * 1.2) % 6) / 6;
        const waveRadius = 15 + wavePhase * 70;
        const waveAlpha = (1 - wavePhase) * 0.6;

        if (waveAlpha > 0.05) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${waveAlpha})`;
          ctx.lineWidth = 3 - wavePhase * 2;
          ctx.beginPath();
          ctx.arc(0, -55, waveRadius, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();

          // Wave distortion effect
          ctx.strokeStyle = `rgba(200, 150, 255, ${waveAlpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, -55, waveRadius - 3, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    // DINKY STATION - Train depot with animated locomotive
    const drawDinkyStation = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      drawTowerShadow(0, 15, 50, 25);

      // Platform base
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(-45, 5, 90, 12);
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(-45, 5, 90, 4);

      // Station building - Victorian style
      const stationGrad = ctx.createLinearGradient(-35, -55, 35, 0);
      stationGrad.addColorStop(0, "#6a5a4a");
      stationGrad.addColorStop(0.3, "#5a4a3a");
      stationGrad.addColorStop(0.7, "#4a3a2a");
      stationGrad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = stationGrad;
      ctx.fillRect(-35, -45, 70, 50);

      // Decorative trim
      ctx.fillStyle = "#7a6a5a";
      ctx.fillRect(-38, -48, 76, 5);
      ctx.fillRect(-38, -5, 76, 5);

      // Windows with warm glow
      const windowGlow = 0.5 + Math.sin(t * 1.5) * 0.2;
      for (let w = 0; w < 3; w++) {
        ctx.fillStyle = `rgba(255, 200, 120, ${windowGlow})`;
        ctx.fillRect(-25 + w * 20, -35, 12, 18);
        ctx.strokeStyle = "#3a2a1a";
        ctx.lineWidth = 2;
        ctx.strokeRect(-25 + w * 20, -35, 12, 18);
        // Window cross
        ctx.beginPath();
        ctx.moveTo(-19 + w * 20, -35);
        ctx.lineTo(-19 + w * 20, -17);
        ctx.moveTo(-25 + w * 20, -26);
        ctx.lineTo(-13 + w * 20, -26);
        ctx.stroke();
      }

      // Peaked roof
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.moveTo(-40, -48);
      ctx.lineTo(0, -68);
      ctx.lineTo(40, -48);
      ctx.closePath();
      ctx.fill();

      // Roof tiles pattern
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1;
      for (let tile = 0; tile < 6; tile++) {
        ctx.beginPath();
        ctx.moveTo(-35 + tile * 14, -48);
        ctx.lineTo(-28 + tile * 14, -55);
        ctx.stroke();
      }

      // Clock tower
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(-8, -85, 16, 37);
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.moveTo(-10, -85);
      ctx.lineTo(0, -95);
      ctx.lineTo(10, -85);
      ctx.closePath();
      ctx.fill();

      // Clock face
      ctx.fillStyle = "#f5f5f0";
      ctx.beginPath();
      ctx.arc(0, -70, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Clock hands
      const hourAngle = t * 0.1;
      const minAngle = t * 1.2;
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(Math.sin(hourAngle) * 3, -70 - Math.cos(hourAngle) * 3);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(Math.sin(minAngle) * 5, -70 - Math.cos(minAngle) * 5);
      ctx.stroke();

      // Train tracks
      ctx.strokeStyle = "#5a5a5a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-50, 15);
      ctx.lineTo(50, 15);
      ctx.stroke();
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-50, 13);
      ctx.lineTo(50, 13);
      ctx.moveTo(-50, 17);
      ctx.lineTo(50, 17);
      ctx.stroke();

      // Track ties
      ctx.fillStyle = "#4a3a2a";
      for (let tie = 0; tie < 12; tie++) {
        ctx.fillRect(-48 + tie * 8, 12, 4, 8);
      }

      // Animated Princeton Dinky train
      const trainX = Math.sin(t * 0.6) * 35;
      const trainBounce = Math.abs(Math.sin(t * 8)) * 1;

      // Train shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(trainX, 18, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Locomotive body
      const trainGrad = ctx.createLinearGradient(trainX - 15, -5, trainX + 15, 10);
      trainGrad.addColorStop(0, "#ff8833");
      trainGrad.addColorStop(0.5, "#f97316");
      trainGrad.addColorStop(1, "#ea580c");
      ctx.fillStyle = trainGrad;
      ctx.fillRect(trainX - 15, -8 - trainBounce, 30, 18);

      // Cabin
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(trainX - 12, -18 - trainBounce, 12, 12);

      // Cabin window
      ctx.fillStyle = `rgba(255, 200, 120, ${0.6 + Math.sin(t * 2) * 0.2})`;
      ctx.fillRect(trainX - 10, -16 - trainBounce, 8, 6);

      // Smokestack
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(trainX + 5, -22 - trainBounce, 6, 14);

      // Wheels with rotation
      const wheelRot = t * 8;
      ctx.fillStyle = "#1a1a1a";
      for (let wheel = 0; wheel < 3; wheel++) {
        const wx = trainX - 10 + wheel * 10;
        ctx.beginPath();
        ctx.arc(wx, 8, 5, 0, Math.PI * 2);
        ctx.fill();
        // Wheel spokes
        ctx.strokeStyle = "#3a3a3a";
        ctx.lineWidth = 1;
        for (let spoke = 0; spoke < 4; spoke++) {
          const spokeAngle = wheelRot + spoke * Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(wx, 8);
          ctx.lineTo(wx + Math.cos(spokeAngle) * 4, 8 + Math.sin(spokeAngle) * 4);
          ctx.stroke();
        }
      }

      // Steam puffs
      for (let puff = 0; puff < 5; puff++) {
        const puffAge = (t * 2 + puff * 0.5) % 2.5;
        if (puffAge < 2) {
          const px = trainX + 8 + puffAge * 8 + Math.sin(t * 4 + puff) * 4;
          const py = -25 - trainBounce - puffAge * 15;
          const pSize = 3 + puffAge * 5;
          ctx.fillStyle = `rgba(220, 220, 220, ${0.5 - puffAge * 0.2})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Princeton P logo on train
      ctx.fillStyle = "#000000";
      ctx.font = "bold 10px serif";
      ctx.textAlign = "center";
      ctx.fillText("P", trainX, 2 - trainBounce);

      ctx.restore();
    };

    // === BLAIR ARCH LANDMARK (background decoration) ===
    const drawBlairArchLandmark = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Gothic stone base platform
      ctx.fillStyle = "#3a3530";
      ctx.beginPath();
      ctx.moveTo(-50, 10);
      ctx.lineTo(-45, 0);
      ctx.lineTo(45, 0);
      ctx.lineTo(50, 10);
      ctx.lineTo(-50, 10);
      ctx.closePath();
      ctx.fill();

      // Left tower
      const towerGrad = ctx.createLinearGradient(-45, -120, -25, 0);
      towerGrad.addColorStop(0, "#5a5048");
      towerGrad.addColorStop(0.3, "#6a6058");
      towerGrad.addColorStop(0.7, "#5a5048");
      towerGrad.addColorStop(1, "#4a4038");
      ctx.fillStyle = towerGrad;
      ctx.fillRect(-45, -100, 20, 100);

      // Left tower crenellations
      ctx.fillStyle = "#5a5048";
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(-44 + c * 7, -110, 5, 12);
      }

      // Left tower spire
      ctx.fillStyle = "#4a4038";
      ctx.beginPath();
      ctx.moveTo(-35, -110);
      ctx.lineTo(-35, -135);
      ctx.lineTo(-25, -100);
      ctx.lineTo(-45, -100);
      ctx.closePath();
      ctx.fill();

      // Right tower
      ctx.fillStyle = towerGrad;
      ctx.fillRect(25, -100, 20, 100);

      // Right tower crenellations
      ctx.fillStyle = "#5a5048";
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(26 + c * 7, -110, 5, 12);
      }

      // Right tower spire
      ctx.fillStyle = "#4a4038";
      ctx.beginPath();
      ctx.moveTo(35, -110);
      ctx.lineTo(35, -135);
      ctx.lineTo(45, -100);
      ctx.lineTo(25, -100);
      ctx.closePath();
      ctx.fill();

      // Main archway
      const archGrad = ctx.createLinearGradient(-35, -80, 35, 0);
      archGrad.addColorStop(0, "#6a6058");
      archGrad.addColorStop(0.5, "#5a5048");
      archGrad.addColorStop(1, "#4a4038");
      ctx.fillStyle = archGrad;
      ctx.fillRect(-35, -70, 70, 70);

      // Gothic arch opening
      ctx.fillStyle = "#1a1815";
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-22, -40);
      ctx.quadraticCurveTo(-22, -60, 0, -65);
      ctx.quadraticCurveTo(22, -60, 22, -40);
      ctx.lineTo(22, 0);
      ctx.closePath();
      ctx.fill();

      // Arch detail - stone outline
      ctx.strokeStyle = "#7a7068";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-22, -40);
      ctx.quadraticCurveTo(-22, -58, 0, -63);
      ctx.quadraticCurveTo(22, -58, 22, -40);
      ctx.lineTo(22, 0);
      ctx.stroke();

      // Keystone
      ctx.fillStyle = "#7a7068";
      ctx.beginPath();
      ctx.moveTo(-5, -62);
      ctx.lineTo(0, -70);
      ctx.lineTo(5, -62);
      ctx.lineTo(3, -58);
      ctx.lineTo(-3, -58);
      ctx.closePath();
      ctx.fill();

      // Connecting wall section
      ctx.fillStyle = "#5a5048";
      ctx.fillRect(-35, -75, 70, 8);

      // Battlements on top
      for (let b = 0; b < 5; b++) {
        ctx.fillStyle = "#5a5048";
        ctx.fillRect(-30 + b * 14, -82, 8, 10);
      }

      // Window details on towers
      ctx.fillStyle = `rgba(255, 200, 120, ${0.3 + Math.sin(t * 1.5) * 0.15})`;
      ctx.fillRect(-40, -80, 8, 12);
      ctx.fillRect(-40, -55, 8, 12);
      ctx.fillRect(32, -80, 8, 12);
      ctx.fillRect(32, -55, 8, 12);

      // Window frames
      ctx.strokeStyle = "#3a3530";
      ctx.lineWidth = 1;
      ctx.strokeRect(-40, -80, 8, 12);
      ctx.strokeRect(-40, -55, 8, 12);
      ctx.strokeRect(32, -80, 8, 12);
      ctx.strokeRect(32, -55, 8, 12);

      // "BLAIR" text suggestion on arch
      ctx.fillStyle = "#7a7068";
      ctx.font = "bold 6px serif";
      ctx.textAlign = "center";
      ctx.fillText("BLAIR", 0, -72);

      ctx.restore();
    };

    // Draw Blair Arch in background
    drawBlairArchLandmark(width * 0.88, groundY - 25, 0.65);

    // Draw towers at different positions with layered depth - TALLER AND MORE PROMINENT
    drawDinkyStation(width * 0.10, groundY - 15, 0.75);
    drawCannonTower(width * 0.30, groundY - 5, 1.1);
    drawLabTower(width * 0.50, groundY - 15, 1.15);
    drawArchTower(width * 0.70, groundY - 5, 1.0);

    // === EPIC HERO - ARMORED WAR TIGER ===

    const drawHeroTiger = (x: number, y: number) => {
      const breathe = Math.sin(t * 1.8) * 2;
      const isAttacking = Math.sin(t * 2) > 0.6;
      const clawSwipe = isAttacking ? Math.sin(t * 8) * 0.8 : 0;
      const bodyLean = isAttacking ? Math.sin(t * 4) * 0.1 : 0;
      const attackIntensity = isAttacking ? Math.abs(Math.sin(t * 4)) : 0;

      ctx.save();
      ctx.translate(x, y);

      // Multi-layered infernal aura
      const auraIntensity = isAttacking ? 0.5 : 0.25;
      const auraPulse = 0.85 + Math.sin(t * 3) * 0.15;
      for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
        const layerOffset = auraLayer * 0.08;
        const auraGrad = ctx.createRadialGradient(0, 0, 5 + layerOffset * 20, 0, 0, 45 + layerOffset * 15);
        auraGrad.addColorStop(0, `rgba(255, 100, 0, ${auraIntensity * auraPulse * (0.4 - auraLayer * 0.08)})`);
        auraGrad.addColorStop(0.5, `rgba(255, 60, 0, ${auraIntensity * auraPulse * (0.2 - auraLayer * 0.04)})`);
        auraGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 45 + auraLayer * 8, 30 + auraLayer * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating flame particles
      for (let p = 0; p < 12; p++) {
        const pAngle = (t * 1.5 + p * Math.PI * 0.17) % (Math.PI * 2);
        const pDist = 35 + Math.sin(t * 2 + p * 0.5) * 8;
        const px = Math.cos(pAngle) * pDist;
        const py = Math.sin(pAngle) * pDist * 0.6 - Math.abs(Math.sin(t * 4 + p)) * 8;
        const pAlpha = 0.5 + Math.sin(t * 4 + p * 0.4) * 0.3;
        ctx.fillStyle = p % 3 === 0 ? `rgba(255, 200, 50, ${pAlpha})` : `rgba(255, 100, 0, ${pAlpha})`;
        ctx.beginPath();
        ctx.moveTo(px, py + 3);
        ctx.quadraticCurveTo(px - 2, py, px, py - 4);
        ctx.quadraticCurveTo(px + 2, py, px, py + 3);
        ctx.fill();
      }

      // Deep shadow
      const shadowGrad = ctx.createRadialGradient(0, 25, 0, 0, 25, 40);
      shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
      shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 25, 40, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(bodyLean);

      // Massive muscular tiger body
      const bodyGrad = ctx.createRadialGradient(0, breathe * 0.5, 0, 0, breathe * 0.5, 35);
      bodyGrad.addColorStop(0, "#ffaa44");
      bodyGrad.addColorStop(0.3, "#ff8822");
      bodyGrad.addColorStop(0.6, "#dd5500");
      bodyGrad.addColorStop(1, "#aa3300");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, breathe * 0.5, 28, 22 + breathe * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavy war armor - chest plate
      const chestArmorGrad = ctx.createLinearGradient(-20, -15, 20, 15);
      chestArmorGrad.addColorStop(0, "#2a2218");
      chestArmorGrad.addColorStop(0.3, "#4a3a28");
      chestArmorGrad.addColorStop(0.5, "#5a4a38");
      chestArmorGrad.addColorStop(0.7, "#4a3a28");
      chestArmorGrad.addColorStop(1, "#2a2218");
      ctx.fillStyle = chestArmorGrad;
      ctx.beginPath();
      ctx.moveTo(-18, -12);
      ctx.quadraticCurveTo(-22, 0, -16, 14);
      ctx.lineTo(-6, 18);
      ctx.quadraticCurveTo(0, 20, 6, 18);
      ctx.lineTo(16, 14);
      ctx.quadraticCurveTo(22, 0, 18, -12);
      ctx.quadraticCurveTo(0, -18, -18, -12);
      ctx.closePath();
      ctx.fill();

      // Armor border
      ctx.strokeStyle = "#1a1510";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gold trim on armor
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, -10);
      ctx.quadraticCurveTo(0, -16, 16, -10);
      ctx.stroke();

      // Central tiger emblem on armor
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-6, 4);
      ctx.lineTo(0, 10);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fill();

      // Emblem gem
      const gemPulse = 0.7 + Math.sin(t * 2.5) * 0.3;
      ctx.fillStyle = "#ff3300";
      ctx.beginPath();
      ctx.arc(0, 2, 3, 0, Math.PI * 2);
      ctx.fill();
      // Gem glow
      const gemGlow = ctx.createRadialGradient(0, 2, 0, 0, 2, 8);
      gemGlow.addColorStop(0, `rgba(255, 100, 0, ${gemPulse * 0.6})`);
      gemGlow.addColorStop(1, "transparent");
      ctx.fillStyle = gemGlow;
      ctx.beginPath();
      ctx.arc(0, 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Dark tiger stripes (on exposed fur)
      ctx.strokeStyle = "#050202";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let i = 0; i < 4; i++) {
        const stripeY = -8 + i * 7 + breathe * 0.3;
        // Left side stripes
        ctx.beginPath();
        ctx.moveTo(-28, stripeY);
        ctx.quadraticCurveTo(-24, stripeY - 3, -20, stripeY + 1);
        ctx.stroke();
        // Right side stripes
        ctx.beginPath();
        ctx.moveTo(28, stripeY);
        ctx.quadraticCurveTo(24, stripeY - 3, 20, stripeY + 1);
        ctx.stroke();
      }

      // Armored shoulders with spikes
      for (let side = -1; side <= 1; side += 2) {
        const shoulderX = side * 26;
        const armOffset = isAttacking ? clawSwipe * 8 * side : 0;

        // Massive arm/shoulder muscle
        const armGrad = ctx.createRadialGradient(shoulderX + armOffset, -5, 0, shoulderX + armOffset, -5, 18);
        armGrad.addColorStop(0, "#ff9944");
        armGrad.addColorStop(0.5, "#dd5500");
        armGrad.addColorStop(1, "#aa3300");
        ctx.fillStyle = armGrad;
        ctx.beginPath();
        ctx.ellipse(shoulderX + armOffset, -5, 14, 18, side * -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Arm stripes
        ctx.strokeStyle = "#050202";
        ctx.lineWidth = 1.5;
        for (let stripe = 0; stripe < 4; stripe++) {
          const stripeOffset = -12 + stripe * 6;
          ctx.beginPath();
          ctx.moveTo(shoulderX + armOffset + side * 12, -5 + stripeOffset);
          ctx.quadraticCurveTo(shoulderX + armOffset + side * 8, -5 + stripeOffset - 2, shoulderX + armOffset + side * 4, -5 + stripeOffset);
          ctx.stroke();
        }

        // Heavy shoulder pauldron
        const pauldronGrad = ctx.createRadialGradient(shoulderX + armOffset, -12, 0, shoulderX + armOffset, -12, 12);
        pauldronGrad.addColorStop(0, "#5a4a38");
        pauldronGrad.addColorStop(0.6, "#4a3a28");
        pauldronGrad.addColorStop(1, "#2a2218");
        ctx.fillStyle = pauldronGrad;
        ctx.beginPath();
        ctx.ellipse(shoulderX + armOffset, -10, 10, 8, side * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Pauldron spike
        ctx.fillStyle = "#3a3028";
        ctx.beginPath();
        ctx.moveTo(shoulderX + armOffset - 3, -12);
        ctx.lineTo(shoulderX + armOffset + side * 8, -25);
        ctx.lineTo(shoulderX + armOffset + 3, -12);
        ctx.closePath();
        ctx.fill();

        // Deadly claws
        ctx.fillStyle = "#f5f5f0";
        for (let claw = 0; claw < 3; claw++) {
          const clawX = shoulderX + armOffset + side * 18;
          const clawY = 8 + claw * 4;
          ctx.beginPath();
          ctx.moveTo(clawX, clawY);
          ctx.lineTo(clawX + side * 10, clawY - 2);
          ctx.lineTo(clawX, clawY + 2);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Powerful tiger head
      const headGrad = ctx.createRadialGradient(22, -8, 0, 22, -8, 18);
      headGrad.addColorStop(0, "#ffaa44");
      headGrad.addColorStop(0.5, "#ff8822");
      headGrad.addColorStop(1, "#dd5500");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(22, -8, 16, 14, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Head stripes
      ctx.strokeStyle = "#050202";
      ctx.lineWidth = 2;
      for (let hs = 0; hs < 3; hs++) {
        ctx.beginPath();
        ctx.moveTo(16 + hs * 4, -20);
        ctx.quadraticCurveTo(18 + hs * 4, -12, 16 + hs * 4, -4);
        ctx.stroke();
      }

      // Muzzle
      ctx.fillStyle = "#fff8e0";
      ctx.beginPath();
      ctx.ellipse(30, -4, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fierce eyes
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(18, -12, 4, 3, -0.2, 0, Math.PI * 2);
      ctx.ellipse(26, -12, 4, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff6600";
      ctx.beginPath();
      ctx.arc(18, -12, 2, 0, Math.PI * 2);
      ctx.arc(26, -12, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(18, -12, 1, 0, Math.PI * 2);
      ctx.arc(26, -12, 1, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.ellipse(32, -6, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fierce ears
      for (let ear = -1; ear <= 1; ear += 2) {
        ctx.fillStyle = "#ff8822";
        ctx.beginPath();
        ctx.moveTo(16 + ear * 6, -18);
        ctx.lineTo(14 + ear * 10, -30);
        ctx.lineTo(20 + ear * 4, -20);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffccaa";
        ctx.beginPath();
        ctx.moveTo(16 + ear * 6, -19);
        ctx.lineTo(15 + ear * 8, -26);
        ctx.lineTo(19 + ear * 4, -20);
        ctx.closePath();
        ctx.fill();
      }

      // Animated tail
      ctx.strokeStyle = "#ff8822";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-28, 5);
      const tailWave = Math.sin(t * 5) * 12;
      ctx.quadraticCurveTo(-38, -5 + tailWave, -48, 0 + tailWave * 0.5);
      ctx.stroke();
      // Tail stripes
      ctx.strokeStyle = "#050202";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-35, 0 + tailWave * 0.3);
      ctx.lineTo(-38, -2 + tailWave * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-42, 2 + tailWave * 0.6);
      ctx.lineTo(-46, 0 + tailWave * 0.5);
      ctx.stroke();

      ctx.restore();

      // Attack effect - Devastating claw swipe arcs
      if (isAttacking) {
        for (let arc = 0; arc < 4; arc++) {
          const arcPhase = (t * 12 + arc * 0.8) % 2;
          if (arcPhase < 1) {
            const arcAlpha = (1 - arcPhase) * 0.8 * attackIntensity;
            ctx.strokeStyle = `rgba(255, 200, 50, ${arcAlpha})`;
            ctx.lineWidth = 4 - arcPhase * 3;
            ctx.beginPath();
            ctx.arc(35, 0, 15 + arcPhase * 30, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();
          }
        }
      }

      // Mighty Roar shockwave (periodic)
      const roarPhase = (t * 0.4) % 4;
      if (roarPhase < 1.5) {
        for (let wave = 0; wave < 5; wave++) {
          const waveTime = roarPhase - wave * 0.2;
          if (waveTime > 0 && waveTime < 1) {
            const waveRadius = 25 + waveTime * 80;
            const waveAlpha = (1 - waveTime) * 0.5;
            ctx.strokeStyle = `rgba(255, 150, 50, ${waveAlpha})`;
            ctx.lineWidth = 4 - waveTime * 3;
            ctx.beginPath();
            ctx.arc(22, -8, waveRadius, -Math.PI * 0.35, Math.PI * 0.35);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    };


    // === EPIC ENEMIES ===

    // Writing Sem - Haunted Academic Tome
    const drawWritingSem = (x: number, y: number, index: number) => {
      const float = Math.sin(t * 3 + index) * 6;
      const wobble = Math.sin(t * 5 + index * 2) * 0.1;
      ctx.save();
      ctx.translate(x, y + float);
      ctx.rotate(wobble);

      // Eerie glow
      const bookGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      bookGlow.addColorStop(0, "rgba(74, 222, 128, 0.3)");
      bookGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bookGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 18 - float, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Book cover with gradient
      const coverGrad = ctx.createLinearGradient(-10, -15, 10, 15);
      coverGrad.addColorStop(0, "#22c55e");
      coverGrad.addColorStop(0.5, "#4ade80");
      coverGrad.addColorStop(1, "#16a34a");
      ctx.fillStyle = coverGrad;
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(10, -14);
      ctx.lineTo(12, -12);
      ctx.lineTo(12, 14);
      ctx.lineTo(-10, 14);
      ctx.closePath();
      ctx.fill();

      // Spine
      ctx.fillStyle = "#15803d";
      ctx.fillRect(-12, -12, 3, 26);

      // Pages
      ctx.fillStyle = "#f0fdf4";
      ctx.fillRect(-8, -12, 18, 24);

      // Page lines (text)
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 0.5;
      for (let line = 0; line < 6; line++) {
        ctx.beginPath();
        ctx.moveTo(-6, -8 + line * 4);
        ctx.lineTo(8, -8 + line * 4);
        ctx.stroke();
      }

      // Evil eyes
      const eyePulse = 0.7 + Math.sin(t * 6 + index) * 0.3;
      ctx.fillStyle = `rgba(220, 38, 38, ${eyePulse})`;
      ctx.beginPath();
      ctx.arc(-2, -2, 3, 0, Math.PI * 2);
      ctx.arc(5, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(-2, -2, 1.5, 0, Math.PI * 2);
      ctx.arc(5, -2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Floating letters/symbols
      ctx.fillStyle = `rgba(74, 222, 128, ${0.3 + Math.sin(t * 4 + index) * 0.2})`;
      ctx.font = "8px serif";
      for (let sym = 0; sym < 4; sym++) {
        const symAngle = t * 2 + sym * Math.PI * 0.5;
        const symDist = 18 + Math.sin(t * 3 + sym) * 3;
        ctx.fillText("∑", Math.cos(symAngle) * symDist, -5 + Math.sin(symAngle) * symDist * 0.5);
      }

      ctx.restore();
    };

    // Nassau Lion - Legendary Stone Golem Boss
    const drawNassauLion = (x: number, y: number) => {
      const stomp = Math.abs(Math.sin(t * 1.5)) * 3;
      const breathe = Math.sin(t * 1.2) * 2;
      ctx.save();
      ctx.translate(x, y + stomp);

      // Massive shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(0, 25, 35, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing eye trail effect
      const eyeGlow = ctx.createRadialGradient(0, -45, 0, 0, -45, 50);
      eyeGlow.addColorStop(0, `rgba(234, 179, 8, ${0.3 + Math.sin(t * 3) * 0.15})`);
      eyeGlow.addColorStop(1, "transparent");
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(0, -45, 50, 0, Math.PI * 2);
      ctx.fill();

      // Massive stone body
      const bodyGrad = ctx.createLinearGradient(-30, -50, 30, 20);
      bodyGrad.addColorStop(0, "#78716c");
      bodyGrad.addColorStop(0.3, "#57534e");
      bodyGrad.addColorStop(0.6, "#44403c");
      bodyGrad.addColorStop(1, "#292524");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(-28, -35);
      ctx.lineTo(-32, 15);
      ctx.lineTo(32, 15);
      ctx.lineTo(28, -35);
      ctx.closePath();
      ctx.fill();

      // Stone texture cracks
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-15, -30);
      ctx.lineTo(-18, -10);
      ctx.lineTo(-12, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, -25);
      ctx.lineTo(15, -5);
      ctx.lineTo(8, 10);
      ctx.stroke();

      // Massive legs
      for (let leg = -1; leg <= 1; leg += 2) {
        ctx.fillStyle = "#44403c";
        ctx.fillRect(leg * 12 - 8, 10, 16, 15);
        ctx.fillStyle = "#292524";
        ctx.fillRect(leg * 12 - 10, 22, 20, 8);
      }

      // Colossal head
      const headGrad = ctx.createRadialGradient(0, -50, 0, 0, -50, 28);
      headGrad.addColorStop(0, "#78716c");
      headGrad.addColorStop(0.6, "#57534e");
      headGrad.addColorStop(1, "#44403c");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(0, -50 + breathe, 24, 0, Math.PI * 2);
      ctx.fill();

      // Majestic stone mane
      for (let maneRow = 0; maneRow < 2; maneRow++) {
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2 - Math.PI * 0.5;
          const maneX = Math.cos(angle) * (28 + maneRow * 8);
          const maneY = -50 + breathe + Math.sin(angle) * (28 + maneRow * 8);
          const manePulse = Math.sin(t * 2 + i * 0.5) * 2;
          ctx.fillStyle = maneRow === 0 ? "#a8a29e" : "#78716c";
          ctx.beginPath();
          ctx.ellipse(maneX, maneY + manePulse, 8 - maneRow * 2, 10 - maneRow * 2, angle, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Face details
      ctx.fillStyle = "#292524";
      ctx.beginPath();
      ctx.ellipse(0, -42 + breathe, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing fierce eyes
      const eyeIntensity = 0.7 + Math.sin(t * 4) * 0.3;
      for (let eye = -1; eye <= 1; eye += 2) {
        // Eye glow
        const singleEyeGlow = ctx.createRadialGradient(eye * 10, -55 + breathe, 0, eye * 10, -55 + breathe, 10);
        singleEyeGlow.addColorStop(0, `rgba(234, 179, 8, ${eyeIntensity})`);
        singleEyeGlow.addColorStop(0.5, `rgba(251, 191, 36, ${eyeIntensity * 0.5})`);
        singleEyeGlow.addColorStop(1, "transparent");
        ctx.fillStyle = singleEyeGlow;
        ctx.beginPath();
        ctx.arc(eye * 10, -55 + breathe, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eye core
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.ellipse(eye * 10, -55 + breathe, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(eye * 10, -55 + breathe, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crown/horn decorations
      ctx.fillStyle = "#c9a227";
      for (let horn = -1; horn <= 1; horn += 2) {
        ctx.beginPath();
        ctx.moveTo(horn * 15, -72 + breathe);
        ctx.lineTo(horn * 20, -85 + breathe);
        ctx.lineTo(horn * 12, -70 + breathe);
        ctx.closePath();
        ctx.fill();
      }

      // Ground crack effect when stomping
      if (stomp > 2) {
        ctx.strokeStyle = "#44403c";
        ctx.lineWidth = 2;
        for (let crack = 0; crack < 6; crack++) {
          const crackAngle = crack * Math.PI / 3;
          ctx.beginPath();
          ctx.moveTo(0, 28);
          ctx.lineTo(Math.cos(crackAngle) * 25, 28 + Math.sin(crackAngle) * 8);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    // Tiger Transit Wyvern - MASSIVE TERRIFYING DRAGON
    const drawWyvern = (x: number, y: number, index: number, scale: number = 0.75) => {
      const wingFlap = Math.sin(t * 5 + index) * 0.6;
      const bodyWave = Math.sin(t * 3 + index) * 4;
      const breathPulse = Math.sin(t * 6 + index) * 2;
      const aggressiveTilt = Math.sin(t * 2 + index) * 0.08;
      ctx.save();
      ctx.translate(x, y + bodyWave);
      ctx.scale(scale, scale);
      ctx.rotate(aggressiveTilt);

      // MASSIVE DARK AURA - ominous presence
      for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
        const auraGrad = ctx.createRadialGradient(0, 0, 10 + auraLayer * 15, 0, 0, 90 + auraLayer * 20);
        auraGrad.addColorStop(0, `rgba(180, 60, 30, ${0.25 - auraLayer * 0.05})`);
        auraGrad.addColorStop(0.5, `rgba(100, 30, 20, ${0.15 - auraLayer * 0.03})`);
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 90 + auraLayer * 20, 60 + auraLayer * 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }


      // Deadly spiked tail
      ctx.strokeStyle = "#4a2020";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-22, 15);
      ctx.quadraticCurveTo(-55, 22 + Math.sin(t * 5) * 12, -85, 8 + Math.sin(t * 4) * 15);
      ctx.stroke();
      ctx.strokeStyle = "#3a1515";
      ctx.lineWidth = 5;
      ctx.stroke();
      // Deadly tail spikes
      ctx.fillStyle = "#2a1010";
      for (let spike = 0; spike < 6; spike++) {
        const sx = -30 - spike * 10;
        const sy = 18 + Math.sin(t * 5 + spike) * 8;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 5, sy - 14);
        ctx.lineTo(sx + 5, sy);
        ctx.closePath();
        ctx.fill();
      }
      // Tail blade at end
      ctx.fillStyle = "#5a3030";
      ctx.beginPath();
      ctx.moveTo(-82, 8);
      ctx.lineTo(-100, -5);
      ctx.lineTo(-95, 8);
      ctx.lineTo(-100, 20);
      ctx.closePath();
      ctx.fill();

      // COLOSSAL wings
      for (let side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.scale(side, 1);
        ctx.rotate(wingFlap * side * 1.3);

        // Wing membrane - dark and leathery
        const wingGrad = ctx.createLinearGradient(0, 0, 70, -50);
        wingGrad.addColorStop(0, "#5a2020");
        wingGrad.addColorStop(0.3, "#4a1818");
        wingGrad.addColorStop(0.7, "#3a1010");
        wingGrad.addColorStop(1, "#2a0808");
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(18, -8);
        ctx.quadraticCurveTo(45, -60, 80, -50);
        ctx.lineTo(90, -35);
        ctx.quadraticCurveTo(85, -15, 75, 0);
        ctx.quadraticCurveTo(55, 12, 22, 10);
        ctx.closePath();
        ctx.fill();

        // Wing bone structure
        ctx.strokeStyle = "#6a3030";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(18, -8);
        ctx.lineTo(75, -45);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(78, -30);
        ctx.moveTo(22, 6);
        ctx.lineTo(72, -15);
        ctx.moveTo(22, 10);
        ctx.lineTo(65, 0);
        ctx.stroke();

        // Wing claws - razor sharp
        ctx.fillStyle = "#e0d8c0";
        ctx.beginPath();
        ctx.moveTo(80, -50);
        ctx.lineTo(95, -60);
        ctx.lineTo(85, -48);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(90, -35);
        ctx.lineTo(105, -42);
        ctx.lineTo(92, -32);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(75, 0);
        ctx.lineTo(88, -5);
        ctx.lineTo(78, 3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Massive muscular body
      const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      bodyGrad.addColorStop(0, "#6a3030");
      bodyGrad.addColorStop(0.4, "#5a2525");
      bodyGrad.addColorStop(0.8, "#4a1818");
      bodyGrad.addColorStop(1, "#3a1010");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0 + breathPulse * 0.3, 28, 22 + breathPulse * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Armored scales pattern
      ctx.fillStyle = "#4a1818";
      for (let scale = 0; scale < 8; scale++) {
        ctx.beginPath();
        ctx.arc(-14 + scale * 5, 6, 5, 0, Math.PI);
        ctx.fill();
      }
      // Belly scales
      ctx.fillStyle = "#5a3030";
      ctx.beginPath();
      ctx.ellipse(0, 8, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Massive dragon head
      ctx.fillStyle = "#5a2525";
      ctx.beginPath();
      ctx.ellipse(28, -8, 18, 15, 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Long snout
      ctx.fillStyle = "#4a1818";
      ctx.beginPath();
      ctx.ellipse(45, -5, 12, 9, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Nostrils with smoke
      ctx.fillStyle = "#2a0a0a";
      ctx.beginPath();
      ctx.ellipse(52, -3, 2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(52, -7, 2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nostril smoke
      for (let smoke = 0; smoke < 3; smoke++) {
        const smokeX = 55 + smoke * 4 + Math.sin(t * 8 + smoke) * 3;
        const smokeY = -5 - smoke * 3;
        ctx.fillStyle = `rgba(80, 80, 80, ${0.3 - smoke * 0.08})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 3 - smoke * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // TERRIFYING GLOWING EYES
      const eyePulse = 0.85 + Math.sin(t * 7 + index) * 0.15;
      // Eye glow effect
      const eyeGlow = ctx.createRadialGradient(32, -14, 0, 32, -14, 20);
      eyeGlow.addColorStop(0, `rgba(255, 200, 50, ${eyePulse})`);
      eyeGlow.addColorStop(0.5, `rgba(255, 100, 0, ${eyePulse * 0.5})`);
      eyeGlow.addColorStop(1, "transparent");
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(32, -14, 20, 0, Math.PI * 2);
      ctx.fill();

      // Eye - large and menacing
      ctx.fillStyle = "#ffc020";
      ctx.beginPath();
      ctx.ellipse(32, -14, 7, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff6600";
      ctx.beginPath();
      ctx.ellipse(33, -14, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(34, -14, 1.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // MASSIVE horns - crown of terror
      ctx.fillStyle = "#3a1515";
      // Main horns
      ctx.beginPath();
      ctx.moveTo(22, -18);
      ctx.quadraticCurveTo(15, -35, 5, -48);
      ctx.lineTo(12, -45);
      ctx.quadraticCurveTo(18, -32, 26, -20);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(35, -22);
      ctx.quadraticCurveTo(42, -38, 48, -52);
      ctx.lineTo(52, -48);
      ctx.quadraticCurveTo(44, -35, 38, -22);
      ctx.closePath();
      ctx.fill();
      // Secondary horns
      ctx.fillStyle = "#2a1010";
      ctx.beginPath();
      ctx.moveTo(28, -20);
      ctx.lineTo(30, -38);
      ctx.lineTo(34, -20);
      ctx.closePath();
      ctx.fill();

      // Jaw spikes
      ctx.fillStyle = "#3a1515";
      for (let jaw = 0; jaw < 3; jaw++) {
        ctx.beginPath();
        ctx.moveTo(40 + jaw * 6, 2);
        ctx.lineTo(42 + jaw * 6, 12);
        ctx.lineTo(44 + jaw * 6, 2);
        ctx.closePath();
        ctx.fill();
      }

      // Sharp teeth visible
      ctx.fillStyle = "#f0e8d0";
      ctx.beginPath();
      ctx.moveTo(50, -1);
      ctx.lineTo(52, 5);
      ctx.lineTo(54, -1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(54, 0);
      ctx.lineTo(56, 6);
      ctx.lineTo(58, 0);
      ctx.closePath();
      ctx.fill();

      // DEVASTATING fire breath effect (more frequent and bigger)
      if (Math.sin(t * 2.5 + index) > 0.3) {
        // Fire core
        for (let flame = 0; flame < 8; flame++) {
          const flameX = 58 + flame * 12;
          const flameY = -2 + Math.sin(t * 12 + flame * 0.5) * 6;
          const flameSize = 12 - flame * 1.2;
          const flameAlpha = 0.85 - flame * 0.1;

          // Flame glow
          const flameGlow = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize * 1.5);
          flameGlow.addColorStop(0, `rgba(255, 255, 150, ${flameAlpha})`);
          flameGlow.addColorStop(0.3, `rgba(255, 200, 50, ${flameAlpha * 0.8})`);
          flameGlow.addColorStop(0.6, `rgba(255, 100, 0, ${flameAlpha * 0.5})`);
          flameGlow.addColorStop(1, "transparent");
          ctx.fillStyle = flameGlow;
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Flame core
          ctx.fillStyle = `rgba(255, 200, 100, ${flameAlpha})`;
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ember particles
        for (let ember = 0; ember < 10; ember++) {
          const emberAge = (t * 3 + ember * 0.4) % 2;
          const emberX = 60 + emberAge * 50 + Math.sin(t * 10 + ember * 2) * 15;
          const emberY = -2 + Math.sin(emberAge * Math.PI) * 20 - emberAge * 10;
          ctx.fillStyle = `rgba(255, 150, 50, ${0.8 - emberAge * 0.4})`;
          ctx.beginPath();
          ctx.arc(emberX, emberY, 2 - emberAge * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Clawed feet hanging below
      for (let foot = -1; foot <= 1; foot += 2) {
        ctx.fillStyle = "#4a1818";
        ctx.beginPath();
        ctx.ellipse(foot * 12, 20, 6, 8, foot * 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Talons
        ctx.fillStyle = "#e0d8c0";
        for (let talon = 0; talon < 3; talon++) {
          ctx.beginPath();
          ctx.moveTo(foot * 12 - 4 + talon * 4, 26);
          ctx.lineTo(foot * 12 - 5 + talon * 4, 38);
          ctx.lineTo(foot * 12 - 2 + talon * 4, 26);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.restore();
    };

    // Sophomore Slump - Heavy armored enemy
    const drawSophomoreEnemy = (x: number, y: number, index: number) => {
      const walk = Math.sin(t * 3 + index) * 2;
      ctx.save();
      ctx.translate(x, y + Math.abs(walk));

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 12, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavy body
      const bodyGrad = ctx.createLinearGradient(-12, -20, 12, 10);
      bodyGrad.addColorStop(0, "#93c5fd");
      bodyGrad.addColorStop(0.5, "#60a5fa");
      bodyGrad.addColorStop(1, "#3b82f6");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(-14, 10);
      ctx.lineTo(-16, -10);
      ctx.quadraticCurveTo(-14, -22, 0, -25);
      ctx.quadraticCurveTo(14, -22, 16, -10);
      ctx.lineTo(14, 10);
      ctx.closePath();
      ctx.fill();

      // Armor plates
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, -5);
      ctx.lineTo(12, -5);
      ctx.moveTo(-10, 5);
      ctx.lineTo(10, 5);
      ctx.stroke();

      // Helmet
      ctx.fillStyle = "#1e40af";
      ctx.beginPath();
      ctx.arc(0, -22, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-10, -22, 20, 5);

      // Visor slit (glowing eyes)
      ctx.fillStyle = `rgba(239, 68, 68, ${0.6 + Math.sin(t * 5) * 0.3})`;
      ctx.fillRect(-6, -20, 12, 3);

      // Heavy mace weapon
      ctx.save();
      ctx.translate(14, -5);
      ctx.rotate(walk * 0.1);
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(0, -25, 4, 30);
      // Mace head
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.arc(2, -28, 8, 0, Math.PI * 2);
      ctx.fill();
      // Spikes
      for (let spike = 0; spike < 6; spike++) {
        const sAngle = spike * Math.PI / 3;
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.moveTo(2 + Math.cos(sAngle) * 6, -28 + Math.sin(sAngle) * 6);
        ctx.lineTo(2 + Math.cos(sAngle) * 12, -28 + Math.sin(sAngle) * 12);
        ctx.lineTo(2 + Math.cos(sAngle + 0.3) * 6, -28 + Math.sin(sAngle + 0.3) * 6);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    };

    // Flying Rival Mascot - MENACING DEMONIC HARPY
    const drawFlyingMascot = (x: number, y: number, index: number, scale: number = 0.7) => {
      const wingFlap = Math.sin(t * 10 + index) * 0.7;
      const hover = Math.sin(t * 4 + index) * 8;
      const aggressiveTilt = Math.sin(t * 6 + index) * 0.15;
      const breathPulse = Math.sin(t * 8 + index) * 2;
      ctx.save();
      ctx.translate(x, y + hover);
      ctx.scale(scale, scale);
      ctx.rotate(aggressiveTilt);

      // MASSIVE threatening dark aura with pulsing energy
      const auraIntensity = 0.4 + Math.sin(t * 5 + index) * 0.2;
      for (let layer = 0; layer < 3; layer++) {
        const auraGrad = ctx.createRadialGradient(0, 0, 5 + layer * 8, 0, 0, 55 + layer * 10);
        auraGrad.addColorStop(0, `rgba(180, 50, 50, ${auraIntensity * (0.3 - layer * 0.08)})`);
        auraGrad.addColorStop(0.5, `rgba(100, 20, 60, ${auraIntensity * (0.2 - layer * 0.05)})`);
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 55 + layer * 10, 40 + layer * 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }


      // Electric crackling particles around body
      for (let p = 0; p < 6; p++) {
        const pAngle = (t * 3 + p * Math.PI / 3 + index) % (Math.PI * 2);
        const pDist = 30 + Math.sin(t * 8 + p) * 8;
        const px = Math.cos(pAngle) * pDist;
        const py = Math.sin(pAngle) * pDist * 0.6;
        ctx.fillStyle = `rgba(255, 100, 100, ${0.6 + Math.sin(t * 12 + p) * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, 2 + Math.sin(t * 10 + p) * 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // MASSIVE razor-sharp wings
      for (let side = -1; side <= 1; side += 2) {
        ctx.save();
        ctx.scale(side, 1);
        ctx.rotate(wingFlap * side * 1.2);

        // Outer wing membrane - darker, more sinister
        const wingGrad = ctx.createLinearGradient(0, 0, 50, -30);
        wingGrad.addColorStop(0, "#1a4a4a");
        wingGrad.addColorStop(0.5, "#0d3535");
        wingGrad.addColorStop(1, "#062020");
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.quadraticCurveTo(30, -35, 55, -25);
        ctx.lineTo(60, -15);
        ctx.quadraticCurveTo(45, 5, 15, 10);
        ctx.closePath();
        ctx.fill();

        // Wing bone structure - sharp and angular
        ctx.strokeStyle = "#2a6a6a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(50, -22);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 3);
        ctx.lineTo(55, -12);
        ctx.moveTo(15, 6);
        ctx.lineTo(52, -3);
        ctx.stroke();

        // Sharp wing claws at tips
        ctx.fillStyle = "#f5f0e0";
        ctx.beginPath();
        ctx.moveTo(55, -25);
        ctx.lineTo(65, -30);
        ctx.lineTo(58, -22);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(60, -15);
        ctx.lineTo(70, -18);
        ctx.lineTo(62, -12);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Muscular armored body
      const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
      bodyGrad.addColorStop(0, "#2a5858");
      bodyGrad.addColorStop(0.5, "#1a4040");
      bodyGrad.addColorStop(1, "#0d2525");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0 + breathPulse * 0.5, 14, 20 + breathPulse * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Armored chest plate markings
      ctx.strokeStyle = "#3a7070";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.quadraticCurveTo(0, -12, 8, -8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();

      // Fierce head with angular features
      const headGrad = ctx.createRadialGradient(0, -18, 0, 0, -18, 14);
      headGrad.addColorStop(0, "#2a5858");
      headGrad.addColorStop(0.7, "#1a3a3a");
      headGrad.addColorStop(1, "#0d2020");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(0, -18, 12, 0, Math.PI * 2);
      ctx.fill();

      // Sharp deadly beak
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.lineTo(22, -16);
      ctx.lineTo(6, -14);
      ctx.closePath();
      ctx.fill();
      // Beak highlight
      ctx.fillStyle = "#fcd34d";
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.lineTo(18, -17);
      ctx.lineTo(6, -16);
      ctx.closePath();
      ctx.fill();

      // MASSIVE GLOWING DEMONIC EYES
      const eyePulse = 0.8 + Math.sin(t * 8 + index) * 0.2;
      // Eye glow
      for (let eye = -1; eye <= 1; eye += 2) {
        const eyeGlow = ctx.createRadialGradient(eye * 4, -20, 0, eye * 4, -20, 12);
        eyeGlow.addColorStop(0, `rgba(255, 50, 50, ${eyePulse * 0.8})`);
        eyeGlow.addColorStop(0.5, `rgba(255, 0, 0, ${eyePulse * 0.4})`);
        eyeGlow.addColorStop(1, "transparent");
        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(eye * 4, -20, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      // Eye whites (yellowed)
      ctx.fillStyle = "#fff0c0";
      ctx.beginPath();
      ctx.ellipse(-4, -20, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, -20, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fierce red irises
      ctx.fillStyle = `rgba(220, 30, 30, ${eyePulse})`;
      ctx.beginPath();
      ctx.arc(-4, -20, 3, 0, Math.PI * 2);
      ctx.arc(4, -20, 3, 0, Math.PI * 2);
      ctx.fill();
      // Slit pupils
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(-4, -20, 1, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(4, -20, 1, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Menacing head crests/horns
      ctx.fillStyle = "#1a3535";
      ctx.beginPath();
      ctx.moveTo(-5, -28);
      ctx.lineTo(-8, -42);
      ctx.lineTo(-2, -30);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(5, -28);
      ctx.lineTo(8, -42);
      ctx.lineTo(2, -30);
      ctx.closePath();
      ctx.fill();
      // Center crest
      ctx.beginPath();
      ctx.moveTo(-2, -28);
      ctx.lineTo(0, -48);
      ctx.lineTo(2, -28);
      ctx.closePath();
      ctx.fill();

      // Sharp talons hanging below
      for (let talon = -1; talon <= 1; talon += 2) {
        ctx.fillStyle = "#f5f0e0";
        ctx.beginPath();
        ctx.moveTo(talon * 6, 18);
        ctx.lineTo(talon * 4, 30);
        ctx.lineTo(talon * 8, 28);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(talon * 8, 20);
        ctx.lineTo(talon * 6, 32);
        ctx.lineTo(talon * 10, 30);
        ctx.closePath();
        ctx.fill();
      }

      // Tail feathers - longer and more threatening
      ctx.fillStyle = "#0d2525";
      for (let tf = 0; tf < 5; tf++) {
        ctx.beginPath();
        ctx.moveTo(-6 + tf * 3, 18);
        ctx.quadraticCurveTo(-10 + tf * 4, 38 + Math.sin(t * 5 + tf) * 5, -4 + tf * 3, 45);
        ctx.quadraticCurveTo(-2 + tf * 3, 38, 0 + tf * 3, 18);
        ctx.fill();
      }

      ctx.restore();
    };

    // Draw enemies marching - varied types
    for (let i = 0; i < 4; i++) {
      const enemyX = ((width * 0.3 + t * 22 + i * 80) % (width * 0.85)) + width * 0.08;
      drawWritingSem(enemyX, groundY + 40, i);
    }

    // Sophomore enemies (heavier)
    for (let i = 0; i < 2; i++) {
      const sophX = ((width * 0.15 + t * 18 + i * 120) % (width * 0.8)) + width * 0.1;
      drawSophomoreEnemy(sophX, groundY + 35, i);
    }

    // Nassau Lion (boss) - moved to better position
    drawNassauLion(width * 0.72, groundY + 20);

    // Flying mascots with targeting effects
    for (let i = 0; i < 4; i++) {
      const mascotX = ((width * 0.05 + t * 32 + i * 110) % (width * 1.4)) - width * 0.2;
      const mascotY = height * (0.22 + i * 0.08) + Math.sin(t * 2.5 + i * 2.5) * 20;

      // Check if this mascot is being hit (periodic)
      const hitPhase = (t * 1.2 + i * 1.5) % 4;
      const isBeingHit = hitPhase < 0.5;

      if (!isBeingHit || hitPhase > 0.3) {
        drawFlyingMascot(mascotX, mascotY, i);
      }

      // Targeting laser from tower
      if (hitPhase > 3 && hitPhase < 4) {
        const targetAlpha = (hitPhase - 3);
        ctx.strokeStyle = `rgba(255, 100, 100, ${targetAlpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(width * 0.55, groundY - 80);
        ctx.lineTo(mascotX, mascotY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target reticle
        ctx.strokeStyle = `rgba(255, 50, 50, ${targetAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mascotX, mascotY, 20 + (1 - targetAlpha) * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mascotX - 25, mascotY);
        ctx.lineTo(mascotX - 12, mascotY);
        ctx.moveTo(mascotX + 12, mascotY);
        ctx.lineTo(mascotX + 25, mascotY);
        ctx.moveTo(mascotX, mascotY - 25);
        ctx.lineTo(mascotX, mascotY - 12);
        ctx.moveTo(mascotX, mascotY + 12);
        ctx.lineTo(mascotX, mascotY + 25);
        ctx.stroke();
      }

      // Explosion when hit
      if (isBeingHit) {
        const explosionProgress = hitPhase / 0.5;
        const explosionSize = explosionProgress * 40;
        const explosionAlpha = 1 - explosionProgress;

        // Multi-layer explosion
        for (let layer = 0; layer < 3; layer++) {
          const layerSize = explosionSize * (1 - layer * 0.2);
          const expGrad = ctx.createRadialGradient(mascotX, mascotY, 0, mascotX, mascotY, layerSize);
          expGrad.addColorStop(0, `rgba(255, 255, 200, ${explosionAlpha * (1 - layer * 0.3)})`);
          expGrad.addColorStop(0.4, `rgba(255, 150, 50, ${explosionAlpha * 0.7 * (1 - layer * 0.3)})`);
          expGrad.addColorStop(0.7, `rgba(255, 80, 0, ${explosionAlpha * 0.4 * (1 - layer * 0.3)})`);
          expGrad.addColorStop(1, "transparent");
          ctx.fillStyle = expGrad;
          ctx.beginPath();
          ctx.arc(mascotX, mascotY, layerSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Feather debris
        for (let debris = 0; debris < 8; debris++) {
          const debrisAngle = debris * Math.PI / 4 + explosionProgress * 3;
          const debrisDist = explosionProgress * 35;
          const dx = mascotX + Math.cos(debrisAngle) * debrisDist;
          const dy = mascotY + Math.sin(debrisAngle) * debrisDist - explosionProgress * 20;
          ctx.fillStyle = `rgba(34, 211, 211, ${explosionAlpha})`;
          ctx.save();
          ctx.translate(dx, dy);
          ctx.rotate(debrisAngle + explosionProgress * 5);
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Arrows targeting mascots
      const arrowHitPhase = (t * 1.5 + i * 2) % 2.5;
      if (arrowHitPhase < 1.5) {
        const arrowProgress = arrowHitPhase / 1.5;
        const startX = width * 0.15;
        const startY = groundY + 25;
        const arrowX = startX + (mascotX - startX) * arrowProgress;
        const arrowY = startY + (mascotY - startY) * arrowProgress - Math.sin(arrowProgress * Math.PI) * 30;

        ctx.save();
        ctx.translate(arrowX, arrowY);
        const angle = Math.atan2(mascotY - startY, mascotX - startX);
        ctx.rotate(angle);
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(8, -2);
        ctx.lineTo(8, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Wyvern (large flying enemy) with attack effects
    const wyvernX = ((width * 0.4 + t * 20) % (width * 1.5)) - width * 0.25;
    const wyvernY = height * 0.18 + Math.sin(t * 1.5) * 20;

    // Wyvern hit check
    const wyvernHitPhase = (t * 0.8) % 5;
    const wyvernIsHit = wyvernHitPhase > 4 && wyvernHitPhase < 4.6;

    if (!wyvernIsHit || wyvernHitPhase < 4.3) {
      drawWyvern(wyvernX, wyvernY, 0);
    }

    // Lightning strike targeting wyvern
    if (wyvernHitPhase > 3.5 && wyvernHitPhase < 4) {
      const strikeAlpha = (wyvernHitPhase - 3.5) * 2;
      ctx.strokeStyle = `rgba(150, 200, 255, ${strikeAlpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width * 0.52, groundY - 85);
      let lx = width * 0.52;
      let ly = groundY - 85;
      const segments = 6;
      for (let seg = 0; seg < segments; seg++) {
        lx += (wyvernX - width * 0.52) / segments + (Math.random() - 0.5) * 20;
        ly += (wyvernY - groundY + 85) / segments + (Math.random() - 0.5) * 15;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();

      // Pre-hit glow on wyvern
      const glowGrad = ctx.createRadialGradient(wyvernX, wyvernY, 0, wyvernX, wyvernY, 50);
      glowGrad.addColorStop(0, `rgba(150, 200, 255, ${strikeAlpha * 0.5})`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(wyvernX, wyvernY, 50, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wyvern explosion
    if (wyvernIsHit) {
      const wyvernExpProgress = (wyvernHitPhase - 4) / 0.6;
      const wyvernExpSize = wyvernExpProgress * 70;
      const wyvernExpAlpha = 1 - wyvernExpProgress;

      // Large explosion
      for (let layer = 0; layer < 4; layer++) {
        const layerSize = wyvernExpSize * (1 - layer * 0.15);
        const expGrad = ctx.createRadialGradient(wyvernX, wyvernY, 0, wyvernX, wyvernY, layerSize);
        expGrad.addColorStop(0, `rgba(255, 255, 220, ${wyvernExpAlpha * (1 - layer * 0.2)})`);
        expGrad.addColorStop(0.3, `rgba(100, 200, 255, ${wyvernExpAlpha * 0.8 * (1 - layer * 0.2)})`);
        expGrad.addColorStop(0.6, `rgba(50, 150, 255, ${wyvernExpAlpha * 0.5 * (1 - layer * 0.2)})`);
        expGrad.addColorStop(1, "transparent");
        ctx.fillStyle = expGrad;
        ctx.beginPath();
        ctx.arc(wyvernX, wyvernY, layerSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Electric arcs
      ctx.strokeStyle = `rgba(150, 200, 255, ${wyvernExpAlpha})`;
      ctx.lineWidth = 2;
      for (let arc = 0; arc < 8; arc++) {
        const arcAngle = arc * Math.PI / 4 + wyvernExpProgress * 2;
        const arcDist = wyvernExpProgress * 50;
        ctx.beginPath();
        ctx.moveTo(wyvernX, wyvernY);
        ctx.lineTo(
          wyvernX + Math.cos(arcAngle) * arcDist + (Math.random() - 0.5) * 10,
          wyvernY + Math.sin(arcAngle) * arcDist + (Math.random() - 0.5) * 10
        );
        ctx.stroke();
      }

      // Scale debris
      for (let scale = 0; scale < 12; scale++) {
        const scaleAngle = scale * Math.PI / 6 + wyvernExpProgress * 2;
        const scaleDist = wyvernExpProgress * 60;
        const scaleX = wyvernX + Math.cos(scaleAngle) * scaleDist;
        const scaleY = wyvernY + Math.sin(scaleAngle) * scaleDist - wyvernExpProgress * 30;
        ctx.fillStyle = `rgba(16, 185, 129, ${wyvernExpAlpha})`;
        ctx.beginPath();
        ctx.arc(scaleX, scaleY, 4 - wyvernExpProgress * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Cannon ball targeting wyvern
    const cannonToWyvernPhase = (t * 0.6 + 1) % 4;
    if (cannonToWyvernPhase < 2) {
      const cannonProgress = cannonToWyvernPhase / 2;
      const startX = width * 0.32;
      const startY = groundY - 40;
      const cbX = startX + (wyvernX - startX) * cannonProgress;
      const cbY = startY + (wyvernY - startY) * cannonProgress - Math.sin(cannonProgress * Math.PI) * 80;

      // Cannon ball
      const ballGrad = ctx.createRadialGradient(cbX - 2, cbY - 2, 0, cbX, cbY, 8);
      ballGrad.addColorStop(0, "#5a5a5a");
      ballGrad.addColorStop(0.5, "#3a3a3a");
      ballGrad.addColorStop(1, "#1a1a1a");
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(cbX, cbY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Trail
      ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
      for (let trail = 1; trail <= 4; trail++) {
        ctx.beginPath();
        ctx.arc(cbX - trail * 8, cbY + trail * 4, 3 + trail, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // === ENHANCED SKY BATTLE EFFECTS ===

    // Multiple cannon shots at flying enemies
    for (let shot = 0; shot < 3; shot++) {
      const shotPhase = (t * 0.9 + shot * 1.3) % 3;
      if (shotPhase < 1.8) {
        const shotProgress = shotPhase / 1.8;
        const cannonX = width * 0.30;
        const cannonY = groundY - 60;
        const targetX = width * (0.3 + shot * 0.2) + Math.sin(t + shot) * 50;
        const targetY = height * (0.15 + shot * 0.1);

        const projX = cannonX + (targetX - cannonX) * shotProgress;
        const projY = cannonY + (targetY - cannonY) * shotProgress - Math.sin(shotProgress * Math.PI) * 60;

        // Flaming cannon ball
        const fireGrad = ctx.createRadialGradient(projX, projY, 0, projX, projY, 10);
        fireGrad.addColorStop(0, "#ffff80");
        fireGrad.addColorStop(0.3, "#ff8800");
        fireGrad.addColorStop(0.6, "#ff4400");
        fireGrad.addColorStop(1, "rgba(100, 50, 0, 0.5)");
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(projX, projY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Fire trail
        for (let ft = 1; ft <= 6; ft++) {
          const trailX = projX - ft * 6 * (targetX - cannonX > 0 ? 1 : -1);
          const trailY = projY + ft * 3;
          ctx.fillStyle = `rgba(255, ${150 - ft * 20}, 0, ${0.6 - ft * 0.08})`;
          ctx.beginPath();
          ctx.arc(trailX + Math.sin(t * 15 + ft) * 3, trailY, 5 - ft * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Lab tower lightning bolts at flying targets
    for (let bolt = 0; bolt < 4; bolt++) {
      const boltPhase = (t * 1.2 + bolt * 0.8) % 2;
      if (boltPhase < 0.4) {
        const boltAlpha = 1 - boltPhase / 0.4;
        const labX = width * 0.50;
        const labY = groundY - 100;
        const targetX = width * (0.2 + bolt * 0.2);
        const targetY = height * (0.18 + Math.sin(bolt) * 0.1);

        // Main lightning bolt
        ctx.strokeStyle = `rgba(100, 200, 255, ${boltAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(labX, labY);
        let lx = labX, ly = labY;
        for (let seg = 0; seg < 8; seg++) {
          lx += (targetX - labX) / 8 + (Math.random() - 0.5) * 25;
          ly += (targetY - labY) / 8 + (Math.random() - 0.5) * 15;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();

        // Secondary branch
        ctx.strokeStyle = `rgba(150, 220, 255, ${boltAlpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(labX + (targetX - labX) * 0.4, labY + (targetY - labY) * 0.4);
        for (let seg = 0; seg < 4; seg++) {
          ctx.lineTo(
            labX + (targetX - labX) * (0.4 + seg * 0.15) + (Math.random() - 0.5) * 30,
            labY + (targetY - labY) * (0.4 + seg * 0.15) - 20 + (Math.random() - 0.5) * 20
          );
        }
        ctx.stroke();

        // Impact flash
        const flashGrad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 30);
        flashGrad.addColorStop(0, `rgba(200, 230, 255, ${boltAlpha * 0.8})`);
        flashGrad.addColorStop(0.5, `rgba(100, 180, 255, ${boltAlpha * 0.4})`);
        flashGrad.addColorStop(1, "transparent");
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Arch tower sonic waves targeting sky
    for (let wave = 0; wave < 3; wave++) {
      const wavePhase = (t * 2 + wave * 1.5) % 4;
      if (wavePhase < 3) {
        const archX = width * 0.70;
        const archY = groundY - 55;
        const waveRadius = wavePhase * 80;
        const waveAlpha = (1 - wavePhase / 3) * 0.5;

        // Expanding sonic ring toward sky
        ctx.strokeStyle = `rgba(168, 85, 247, ${waveAlpha})`;
        ctx.lineWidth = 4 - wavePhase;
        ctx.beginPath();
        ctx.arc(archX, archY - wavePhase * 30, waveRadius, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();

        // Secondary ring
        ctx.strokeStyle = `rgba(200, 150, 255, ${waveAlpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(archX, archY - wavePhase * 35, waveRadius * 0.8, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
      }
    }

    // Sky environmental effects - wind streaks
    ctx.strokeStyle = "rgba(200, 220, 255, 0.15)";
    ctx.lineWidth = 1;
    for (let streak = 0; streak < 15; streak++) {
      const streakX = ((t * 80 + streak * 60) % (width * 1.2)) - width * 0.1;
      const streakY = height * (0.08 + (streak % 5) * 0.08);
      const streakLen = 30 + (streak % 3) * 20;
      ctx.beginPath();
      ctx.moveTo(streakX, streakY);
      ctx.lineTo(streakX + streakLen, streakY + 2);
      ctx.stroke();
    }

    // Floating embers and sparks rising from battle
    for (let ember = 0; ember < 20; ember++) {
      const emberAge = (t * 0.8 + ember * 0.3) % 3;
      const emberX = width * (0.1 + (ember % 10) * 0.08) + Math.sin(t * 2 + ember) * 15;
      const emberY = groundY - emberAge * 80 - ember * 5;
      const emberAlpha = 0.7 - emberAge * 0.2;

      if (emberY > height * 0.05 && emberAlpha > 0) {
        ctx.fillStyle = ember % 3 === 0
          ? `rgba(255, 200, 50, ${emberAlpha})`
          : `rgba(255, 100, 50, ${emberAlpha})`;
        ctx.beginPath();
        ctx.arc(emberX, emberY, 2 + Math.sin(t * 8 + ember) * 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Drifting smoke clouds in upper atmosphere
    for (let cloud = 0; cloud < 6; cloud++) {
      const cloudX = ((t * 15 + cloud * 100) % (width * 1.3)) - width * 0.15;
      const cloudY = height * (0.08 + (cloud % 3) * 0.06);
      const cloudAlpha = 0.12 + Math.sin(t + cloud) * 0.05;

      ctx.fillStyle = `rgba(80, 80, 90, ${cloudAlpha})`;
      ctx.beginPath();
      ctx.ellipse(cloudX, cloudY, 40 + cloud * 5, 15 + cloud * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloudX + 25, cloudY - 5, 30, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloudX - 20, cloudY + 3, 25, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Magic missiles from Dinky station
    for (let missile = 0; missile < 3; missile++) {
      const missilePhase = (t * 1.5 + missile * 1.2) % 2.5;
      if (missilePhase < 2) {
        const missileProgress = missilePhase / 2;
        const startX = width * 0.10;
        const startY = groundY - 30;
        const targetX = width * (0.4 + missile * 0.15);
        const targetY = height * (0.20 + missile * 0.05);

        const mx = startX + (targetX - startX) * missileProgress;
        const my = startY + (targetY - startY) * missileProgress - Math.sin(missileProgress * Math.PI) * 40;

        // Orange magic orb
        const orbGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 8);
        orbGrad.addColorStop(0, "#fff8e0");
        orbGrad.addColorStop(0.3, "#f97316");
        orbGrad.addColorStop(0.7, "#c2410c");
        orbGrad.addColorStop(1, "transparent");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle trail
        for (let sparkle = 1; sparkle <= 5; sparkle++) {
          const sx = mx - sparkle * 8;
          const sy = my + sparkle * 4;
          ctx.fillStyle = `rgba(249, 115, 22, ${0.5 - sparkle * 0.08})`;
          ctx.beginPath();
          ctx.arc(sx + Math.sin(t * 12 + sparkle) * 3, sy, 3 - sparkle * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Anti-air tracer rounds
    for (let tracer = 0; tracer < 8; tracer++) {
      const tracerPhase = (t * 3 + tracer * 0.4) % 1.5;
      if (tracerPhase < 1) {
        const tracerProgress = tracerPhase / 1;
        const startX = width * (0.2 + (tracer % 4) * 0.15);
        const startY = groundY + 20;
        const targetX = startX + (tracer % 2 === 0 ? 50 : -30);
        const targetY = height * 0.1;

        const tx = startX + (targetX - startX) * tracerProgress;
        const ty = startY + (targetY - startY) * tracerProgress;

        // Tracer bullet
        ctx.fillStyle = `rgba(255, 255, 150, ${1 - tracerProgress})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tracer line
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.4 - tracerProgress * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - (targetX - startX) * 0.1, ty - (targetY - startY) * 0.1);
        ctx.stroke();
      }
    }

    // Explosions in the sky (from missed shots)
    for (let skyExp = 0; skyExp < 2; skyExp++) {
      const expPhase = (t * 0.7 + skyExp * 2) % 3;
      if (expPhase < 0.8) {
        const expProgress = expPhase / 0.8;
        const expX = width * (0.3 + skyExp * 0.35) + Math.sin(skyExp * 5) * 30;
        const expY = height * (0.12 + skyExp * 0.08);
        const expSize = expProgress * 50;
        const expAlpha = 1 - expProgress;

        // Explosion flash
        const skyExpGrad = ctx.createRadialGradient(expX, expY, 0, expX, expY, expSize);
        skyExpGrad.addColorStop(0, `rgba(255, 255, 200, ${expAlpha})`);
        skyExpGrad.addColorStop(0.3, `rgba(255, 180, 80, ${expAlpha * 0.8})`);
        skyExpGrad.addColorStop(0.6, `rgba(255, 100, 30, ${expAlpha * 0.5})`);
        skyExpGrad.addColorStop(1, "transparent");
        ctx.fillStyle = skyExpGrad;
        ctx.beginPath();
        ctx.arc(expX, expY, expSize, 0, Math.PI * 2);
        ctx.fill();

        // Shrapnel
        for (let shrap = 0; shrap < 6; shrap++) {
          const shrapAngle = shrap * Math.PI / 3 + expProgress * 2;
          const shrapDist = expProgress * 40;
          ctx.fillStyle = `rgba(150, 150, 150, ${expAlpha})`;
          ctx.beginPath();
          ctx.arc(
            expX + Math.cos(shrapAngle) * shrapDist,
            expY + Math.sin(shrapAngle) * shrapDist,
            2,
            0, Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Energy beams from towers
    const beamPhase = (t * 0.5) % 2;
    if (beamPhase < 0.3) {
      const beamAlpha = 1 - beamPhase / 0.3;

      // Lab tower energy beam
      ctx.strokeStyle = `rgba(100, 180, 255, ${beamAlpha * 0.8})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(width * 0.50, groundY - 100);
      ctx.lineTo(width * 0.50, height * 0.05);
      ctx.stroke();

      ctx.strokeStyle = `rgba(200, 230, 255, ${beamAlpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Beam glow
      const beamGlow = ctx.createLinearGradient(width * 0.50 - 30, 0, width * 0.50 + 30, 0);
      beamGlow.addColorStop(0, "transparent");
      beamGlow.addColorStop(0.5, `rgba(100, 180, 255, ${beamAlpha * 0.3})`);
      beamGlow.addColorStop(1, "transparent");
      ctx.fillStyle = beamGlow;
      ctx.fillRect(width * 0.50 - 30, height * 0.05, 60, groundY - 100 - height * 0.05);
    }

    // === DETAILED TROOPS (Defenders) ===

    // Elite Knight - Heavy armored defender
    const drawKnight = (x: number, y: number, index: number, facing: number) => {
      const stance = Math.sin(t * 4 + index) * 2;
      const swordSwing = Math.sin(t * 6 + index) * 0.6;

      ctx.save();
      ctx.translate(x, y + Math.abs(stance * 0.5));
      ctx.scale(facing, 1);

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 15, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cape
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(-6, -15);
      ctx.quadraticCurveTo(-15, 5 + stance, -12, 18);
      ctx.lineTo(-4, 12);
      ctx.closePath();
      ctx.fill();

      // Legs with armor
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(-5, 5, 4, 12);
      ctx.fillRect(1, 5, 4, 12);
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(-5, 10, 4, 3);
      ctx.fillRect(1, 10, 4, 3);

      // Body armor
      const armorGrad = ctx.createLinearGradient(-8, -15, 8, 8);
      armorGrad.addColorStop(0, "#d1d5db");
      armorGrad.addColorStop(0.3, "#9ca3af");
      armorGrad.addColorStop(0.6, "#6b7280");
      armorGrad.addColorStop(1, "#4b5563");
      ctx.fillStyle = armorGrad;
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(-10, -5);
      ctx.lineTo(-8, -15);
      ctx.lineTo(8, -15);
      ctx.lineTo(10, -5);
      ctx.lineTo(8, 8);
      ctx.closePath();
      ctx.fill();

      // Armor detail lines
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(6, -10);
      ctx.moveTo(-5, -3);
      ctx.lineTo(5, -3);
      ctx.stroke();

      // Princeton emblem on chest
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(-4, -5);
      ctx.lineTo(0, 0);
      ctx.lineTo(4, -5);
      ctx.closePath();
      ctx.fill();

      // Helmet
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath();
      ctx.arc(0, -20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.arc(0, -20, 8, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.fill();

      // Helmet plume
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(-2, -26);
      ctx.quadraticCurveTo(0, -35 + stance * 0.5, 5, -32);
      ctx.quadraticCurveTo(2, -28, 0, -26);
      ctx.fill();

      // Visor
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(-5, -22, 10, 4);

      // Sword arm
      ctx.save();
      ctx.translate(10, -8);
      ctx.rotate(swordSwing);

      // Arm
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(0, -2, 12, 5);

      // Sword
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(10, -1, 20, 3);
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(10, 0, 20, 1);
      // Hilt
      ctx.fillStyle = "#78350f";
      ctx.fillRect(6, -3, 5, 7);
      // Crossguard
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(5, -1, 2, 3);
      ctx.fillRect(11, -1, 2, 3);

      ctx.restore();

      // Shield arm
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(-12, -10, 5, 12);

      // Shield
      const shieldGrad = ctx.createLinearGradient(-18, -15, -12, 5);
      shieldGrad.addColorStop(0, "#f97316");
      shieldGrad.addColorStop(0.5, "#ea580c");
      shieldGrad.addColorStop(1, "#c2410c");
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.moveTo(-14, -18);
      ctx.lineTo(-22, -12);
      ctx.lineTo(-22, 2);
      ctx.lineTo(-18, 8);
      ctx.lineTo(-14, 2);
      ctx.lineTo(-14, -18);
      ctx.fill();

      // Shield emblem
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-18, -10);
      ctx.lineTo(-18, -2);
      ctx.moveTo(-20, -6);
      ctx.lineTo(-16, -6);
      ctx.stroke();

      ctx.restore();
    };

    // Archer troop
    const drawArcher = (x: number, y: number, index: number) => {
      const drawPhase = (t * 2 + index) % 3;
      const pullBack = drawPhase < 1.5 ? drawPhase / 1.5 : 0;

      ctx.save();
      ctx.translate(x, y);

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 12, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cloak
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.moveTo(-5, -10);
      ctx.quadraticCurveTo(-10, 5, -8, 12);
      ctx.lineTo(8, 12);
      ctx.quadraticCurveTo(10, 5, 5, -10);
      ctx.closePath();
      ctx.fill();

      // Body
      ctx.fillStyle = "#15803d";
      ctx.fillRect(-4, -8, 8, 15);

      // Head
      ctx.fillStyle = "#d6d3d1";
      ctx.beginPath();
      ctx.arc(0, -14, 6, 0, Math.PI * 2);
      ctx.fill();

      // Hood
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.arc(0, -14, 7, Math.PI, 0);
      ctx.fill();

      // Bow
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-10, -5, 15, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();

      // Bowstring
      ctx.strokeStyle = "#a8a29e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-10 + Math.cos(-Math.PI * 0.4) * 15, -5 + Math.sin(-Math.PI * 0.4) * 15);
      ctx.lineTo(-10 - pullBack * 8, -5);
      ctx.lineTo(-10 + Math.cos(Math.PI * 0.4) * 15, -5 + Math.sin(Math.PI * 0.4) * 15);
      ctx.stroke();

      // Arrow
      if (pullBack > 0.3) {
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10 - pullBack * 8, -5);
        ctx.lineTo(5, -5);
        ctx.stroke();
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.moveTo(5, -5);
        ctx.lineTo(10, -7);
        ctx.lineTo(10, -3);
        ctx.closePath();
        ctx.fill();
      }

      // Quiver
      ctx.fillStyle = "#78350f";
      ctx.fillRect(5, -12, 5, 15);
      ctx.strokeStyle = "#a8a29e";
      ctx.lineWidth = 1;
      for (let arrow = 0; arrow < 4; arrow++) {
        ctx.beginPath();
        ctx.moveTo(6 + arrow, -12);
        ctx.lineTo(6 + arrow, -18);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw detailed troop battles - spread MASSIVELY across entire battlefield
    const knightPositions = [
      { x: 0.12, y: 20, facing: 1 },
      { x: 0.22, y: 85, facing: -1 },
      { x: 0.35, y: 28, facing: 1 },
      { x: 0.48, y: 105, facing: -1 },
      { x: 0.58, y: 35, facing: 1 },
      { x: 0.68, y: 95, facing: -1 },
      { x: 0.78, y: 22, facing: 1 },
      { x: 0.40, y: 65, facing: -1 },
      { x: 0.28, y: 50, facing: 1 },
      { x: 0.52, y: 78, facing: -1 },
      { x: 0.85, y: 110, facing: 1 },
    ];

    for (let i = 0; i < knightPositions.length; i++) {
      const pos = knightPositions[i];
      const kx = width * pos.x;
      const ky = groundY + pos.y;
      drawKnight(kx, ky, i, pos.facing);

      // Combat clash effects
      if (Math.sin(t * 5 + i * 1.5) > 0.7) {
        // Metal clash sparks
        for (let spark = 0; spark < 8; spark++) {
          const sparkAngle = Math.random() * Math.PI * 2;
          const sparkDist = Math.random() * 18;
          ctx.fillStyle = `rgba(255, 215, 0, ${0.9 - spark * 0.1})`;
          ctx.beginPath();
          ctx.arc(
            kx + pos.facing * 15 + Math.cos(sparkAngle) * sparkDist,
            ky - 10 + Math.sin(sparkAngle) * sparkDist,
            2.5 - spark * 0.2,
            0, Math.PI * 2
          );
          ctx.fill();
        }

        // Impact shockwave
        const shockPhase = (t * 8 + i) % 1;
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.5 - shockPhase * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(kx + pos.facing * 12, ky - 8, 5 + shockPhase * 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    drawHeroTiger(width * 0.22, groundY + 30);


    // Archers spread across back lines at different heights - MAXIMUM SPREAD
    const archerPositions = [
      { x: 0.04, y: 20 },
      { x: 0.08, y: 75 },
      { x: 0.14, y: 35 },
      { x: 0.06, y: 95 },
      { x: 0.18, y: 55 },
      { x: 0.75, y: 25 },
      { x: 0.82, y: 85 },
      { x: 0.88, y: 45 },
      { x: 0.92, y: 110 },
    ];

    for (let i = 0; i < archerPositions.length; i++) {
      const pos = archerPositions[i];
      const ax = width * pos.x;
      const ay = groundY + pos.y;
      drawArcher(ax, ay, i);

      // Flying arrows at different targets
      const arrowPhase = (t * 1.8 + i * 0.6) % 2.5;
      if (arrowPhase > 0.5 && arrowPhase < 2) {
        const arrowProgress = (arrowPhase - 0.5) / 1.5;
        // Target varies - some at ground enemies, some at flying
        const targetIsFlying = i % 2 === 0;
        const targetX = ax + 120 + i * 30;
        const targetY = targetIsFlying ? height * 0.35 : groundY + 40;

        const arrowX = ax + (targetX - ax) * arrowProgress;
        const arrowY = ay - 10 + (targetY - ay + 10) * arrowProgress - Math.sin(arrowProgress * Math.PI) * (targetIsFlying ? 60 : 35);

        ctx.save();
        ctx.translate(arrowX, arrowY);
        const arrowAngle = Math.atan2(
          targetY - ay + Math.cos(arrowProgress * Math.PI) * (targetIsFlying ? 60 : 35),
          targetX - ax
        );
        ctx.rotate(arrowAngle);
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(10, -2);
        ctx.lineTo(10, 2);
        ctx.closePath();
        ctx.fill();
        // Arrow trail glow
        ctx.strokeStyle = "rgba(255, 200, 100, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-25, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Additional foot soldiers scattered around - EVERYWHERE ON BATTLEFIELD
    const soldierPositions = [
      { x: 0.55, y: 100 },
      { x: 0.62, y: 30 },
      { x: 0.72, y: 90 },
      { x: 0.24, y: 105 },
      { x: 0.38, y: 40 },
      { x: 0.82, y: 35 },
      { x: 0.10, y: 110 },
      { x: 0.46, y: 95 },
      { x: 0.32, y: 60 },
      { x: 0.65, y: 50 },
      { x: 0.90, y: 85 },
      { x: 0.18, y: 70 },
    ];

    for (let i = 0; i < soldierPositions.length; i++) {
      const pos = soldierPositions[i];
      const sx = width * pos.x;
      const sy = groundY + pos.y;
      const bounce = Math.sin(t * 5 + i * 1.5) * 2;
      const swing = Math.sin(t * 6 + i * 2) * 0.5;

      ctx.save();
      ctx.translate(sx, sy + bounce);

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 10, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = "#6b8e23";
      ctx.fillRect(-4, -12, 8, 14);

      // Armor vest
      ctx.fillStyle = "#4a5a2a";
      ctx.fillRect(-5, -10, 10, 10);

      // Head with helmet
      ctx.fillStyle = "#708090";
      ctx.beginPath();
      ctx.arc(0, -16, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a6a80";
      ctx.beginPath();
      ctx.arc(0, -16, 5, Math.PI, 0);
      ctx.fill();

      // Sword
      ctx.save();
      ctx.rotate(swing);
      ctx.strokeStyle = "#c0c0c0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(4, -8);
      ctx.lineTo(18, -10);
      ctx.stroke();
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(3, -10, 3, 5);
      ctx.restore();

      // Shield
      const shieldGrad = ctx.createLinearGradient(-10, -10, -4, 0);
      shieldGrad.addColorStop(0, "#f97316");
      shieldGrad.addColorStop(1, "#c2410c");
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(-7, -5, 6, Math.PI * 0.4, Math.PI * 1.6);
      ctx.fill();

      ctx.restore();
    }

    // === EPIC PROJECTILES & COMBAT EFFECTS ===

    // Heavy Artillery - Cannon balls with explosive impact
    for (let i = 0; i < 3; i++) {
      const projPhase = (t * 1.8 + i * 1.2) % 3.5;
      if (projPhase < 2.5) {
        const startX = width * 0.35;
        const startY = groundY - 50;
        const endX = width * 0.68;
        const endY = groundY + 25;

        const progress = projPhase / 2.5;
        const px = startX + (endX - startX) * progress;
        const py = startY + (endY - startY) * progress - Math.sin(progress * Math.PI) * 60;

        // Cannon ball with metallic sheen
        const ballGrad = ctx.createRadialGradient(px - 2, py - 2, 0, px, py, 8);
        ballGrad.addColorStop(0, "#5a5a5a");
        ballGrad.addColorStop(0.3, "#3a3a3a");
        ballGrad.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();

        // Glowing heat effect
        ctx.fillStyle = `rgba(255, 150, 50, ${0.4 + Math.sin(t * 10) * 0.2})`;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        // Smoke trail with gradient
        for (let trail = 1; trail <= 6; trail++) {
          const trailAlpha = 0.4 - trail * 0.06;
          const trailX = px - trail * 10 * (1 - progress * 0.3);
          const trailY = py + trail * 4;
          ctx.fillStyle = `rgba(80, 80, 80, ${trailAlpha})`;
          ctx.beginPath();
          ctx.arc(trailX + Math.sin(t * 5 + trail) * 3, trailY, 4 + trail * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Impact prediction ring
        if (progress > 0.7) {
          const ringAlpha = (progress - 0.7) / 0.3;
          ctx.strokeStyle = `rgba(255, 100, 0, ${ringAlpha * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(endX, endY + 5, 15, 8, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Explosion on impact
      const impactPhase = (projPhase - 2.5);
      if (impactPhase > 0 && impactPhase < 0.8) {
        const endX = width * 0.68;
        const endY = groundY + 25;
        const explosionSize = impactPhase * 60;
        const explosionAlpha = 1 - impactPhase / 0.8;

        // Multi-layer explosion
        for (let layer = 0; layer < 3; layer++) {
          const layerSize = explosionSize * (1 - layer * 0.2);
          const layerAlpha = explosionAlpha * (1 - layer * 0.25);
          const expGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, layerSize);
          expGrad.addColorStop(0, `rgba(255, 255, 200, ${layerAlpha})`);
          expGrad.addColorStop(0.3, `rgba(255, 150, 50, ${layerAlpha * 0.8})`);
          expGrad.addColorStop(0.6, `rgba(255, 80, 0, ${layerAlpha * 0.5})`);
          expGrad.addColorStop(1, "transparent");
          ctx.fillStyle = expGrad;
          ctx.beginPath();
          ctx.arc(endX, endY, layerSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Debris particles
        for (let debris = 0; debris < 8; debris++) {
          const debrisAngle = debris * Math.PI / 4 + impactPhase * 2;
          const debrisDist = impactPhase * 50;
          const dx = endX + Math.cos(debrisAngle) * debrisDist;
          const dy = endY + Math.sin(debrisAngle) * debrisDist * 0.6 - impactPhase * 30;
          ctx.fillStyle = `rgba(100, 80, 60, ${explosionAlpha})`;
          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Chain Lightning from Lab Tower - Multi-target electric arcs
    const lightningPhase = (t * 1.5) % 2;
    if (lightningPhase < 0.8) {
      const lightningAlpha = lightningPhase < 0.4 ? 1 : 1 - (lightningPhase - 0.4) / 0.4;

      // Main bolt
      ctx.strokeStyle = `rgba(150, 200, 255, ${lightningAlpha})`;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const startX = width * 0.54;
      const startY = groundY - 85;

      // Primary target
      const target1X = width * 0.62;
      const target1Y = groundY + 35;

      // Draw jagged lightning
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      let lx = startX;
      let ly = startY;
      const segments = 8;
      for (let seg = 0; seg < segments; seg++) {
        const progress = (seg + 1) / segments;
        const targetX = startX + (target1X - startX) * progress;
        const targetY = startY + (target1Y - startY) * progress;
        const jitter = (1 - progress) * 20;
        lx = targetX + (Math.random() - 0.5) * jitter;
        ly = targetY + (Math.random() - 0.5) * jitter * 0.5;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();

      // Secondary branches
      ctx.strokeStyle = `rgba(100, 180, 255, ${lightningAlpha * 0.7})`;
      ctx.lineWidth = 2;
      for (let branch = 0; branch < 3; branch++) {
        const branchStart = 3 + branch;
        const branchProgress = branchStart / segments;
        const bx = startX + (target1X - startX) * branchProgress;
        const by = startY + (target1Y - startY) * branchProgress;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + (Math.random() - 0.5) * 40, by + Math.random() * 30);
        ctx.stroke();
      }

      // Impact glow at target
      const impactGlow = ctx.createRadialGradient(target1X, target1Y, 0, target1X, target1Y, 25);
      impactGlow.addColorStop(0, `rgba(150, 200, 255, ${lightningAlpha * 0.8})`);
      impactGlow.addColorStop(0.5, `rgba(100, 150, 255, ${lightningAlpha * 0.4})`);
      impactGlow.addColorStop(1, "transparent");
      ctx.fillStyle = impactGlow;
      ctx.beginPath();
      ctx.arc(target1X, target1Y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Electric sparks
      for (let spark = 0; spark < 6; spark++) {
        const sparkAngle = spark * Math.PI / 3 + t * 10;
        const sparkDist = 15 + Math.sin(t * 20 + spark) * 8;
        ctx.fillStyle = `rgba(200, 230, 255, ${lightningAlpha})`;
        ctx.beginPath();
        ctx.arc(
          target1X + Math.cos(sparkAngle) * sparkDist,
          target1Y + Math.sin(sparkAngle) * sparkDist * 0.6,
          2, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Sonic Shockwaves from Blair Arch - Expanding purple rings
    for (let wave = 0; wave < 5; wave++) {
      const wavePhase = (t * 3 + wave * 0.8) % 4;
      if (wavePhase < 3) {
        const waveProgress = wavePhase / 3;
        const waveX = width * 0.75;
        const waveY = groundY - 10;
        const waveRadius = 20 + waveProgress * 100;
        const waveAlpha = (1 - waveProgress) * 0.5;

        // Main wave ring
        ctx.strokeStyle = `rgba(168, 85, 247, ${waveAlpha})`;
        ctx.lineWidth = 4 - waveProgress * 3;
        ctx.beginPath();
        ctx.arc(waveX, waveY, waveRadius, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();

        // Inner resonance ring
        ctx.strokeStyle = `rgba(200, 150, 255, ${waveAlpha * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(waveX, waveY, waveRadius * 0.85, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();

        // Distortion ripples
        ctx.strokeStyle = `rgba(139, 92, 246, ${waveAlpha * 0.3})`;
        ctx.lineWidth = 1;
        for (let ripple = 0; ripple < 3; ripple++) {
          ctx.beginPath();
          ctx.arc(waveX, waveY, waveRadius + ripple * 5, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.stroke();
        }
      }
    }

    // === EPIC SPELL EFFECTS ===

    // Devastating Meteor Strike
    const meteorCycle = (t * 0.25) % 5;
    const meteorX = width * 0.58;

    if (meteorCycle < 1.5) {
      // Meteor descent
      const meteorProgress = meteorCycle / 1.5;
      const meteorStartY = -50;
      const meteorEndY = groundY + 20;
      const meteorY = meteorStartY + (meteorEndY - meteorStartY) * meteorProgress;

      // Meteor body with rocky texture
      const meteorSize = 18 + Math.sin(t * 10) * 2;
      const meteorGrad = ctx.createRadialGradient(meteorX - 3, meteorY - 3, 0, meteorX, meteorY, meteorSize);
      meteorGrad.addColorStop(0, "#fbbf24");
      meteorGrad.addColorStop(0.3, "#f97316");
      meteorGrad.addColorStop(0.6, "#dc2626");
      meteorGrad.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = meteorGrad;
      ctx.beginPath();
      ctx.arc(meteorX, meteorY, meteorSize, 0, Math.PI * 2);
      ctx.fill();

      // Rocky surface detail
      ctx.fillStyle = "#991b1b";
      for (let rock = 0; rock < 5; rock++) {
        const rockAngle = rock * Math.PI * 0.4 + t * 2;
        ctx.beginPath();
        ctx.arc(
          meteorX + Math.cos(rockAngle) * meteorSize * 0.5,
          meteorY + Math.sin(rockAngle) * meteorSize * 0.5,
          4, 0, Math.PI * 2
        );
        ctx.fill();
      }

      // Massive fire trail
      for (let flame = 0; flame < 8; flame++) {
        const flameProgress = flame / 8;
        const flameY = meteorY - 15 - flame * 15;
        const flameX = meteorX + Math.sin(t * 15 + flame * 2) * (5 + flame * 2);
        const flameSize = meteorSize * (1 - flameProgress * 0.7);
        const flameAlpha = 0.8 - flameProgress * 0.6;

        const flameGrad = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
        flameGrad.addColorStop(0, `rgba(255, 255, 150, ${flameAlpha})`);
        flameGrad.addColorStop(0.4, `rgba(255, 150, 50, ${flameAlpha * 0.7})`);
        flameGrad.addColorStop(1, "transparent");
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Trailing sparks
      for (let spark = 0; spark < 12; spark++) {
        const sparkAge = (t * 8 + spark * 0.5) % 1;
        const sparkX = meteorX + (Math.random() - 0.5) * 30;
        const sparkY = meteorY - 20 - sparkAge * 80;
        ctx.fillStyle = `rgba(255, 200, 100, ${1 - sparkAge})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warning indicator on ground
      const warningAlpha = 0.3 + Math.sin(t * 10) * 0.2;
      ctx.strokeStyle = `rgba(255, 50, 50, ${warningAlpha})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.ellipse(meteorX, meteorEndY + 10, 35, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

    } else if (meteorCycle < 2.5) {
      // Catastrophic impact explosion
      const impactProgress = (meteorCycle - 1.5);
      const impactAlpha = 1 - impactProgress;
      const impactY = groundY + 20;

      // Multi-layer explosion dome
      for (let layer = 0; layer < 4; layer++) {
        const layerDelay = layer * 0.1;
        const layerProgress = Math.max(0, impactProgress - layerDelay);
        const layerSize = layerProgress * 120 * (1 - layer * 0.15);
        const layerAlpha = impactAlpha * (1 - layer * 0.2);

        const expGrad = ctx.createRadialGradient(meteorX, impactY, 0, meteorX, impactY, layerSize);
        expGrad.addColorStop(0, `rgba(255, 255, 220, ${layerAlpha})`);
        expGrad.addColorStop(0.2, `rgba(255, 200, 50, ${layerAlpha * 0.9})`);
        expGrad.addColorStop(0.5, `rgba(255, 100, 0, ${layerAlpha * 0.6})`);
        expGrad.addColorStop(0.8, `rgba(200, 50, 0, ${layerAlpha * 0.3})`);
        expGrad.addColorStop(1, "transparent");
        ctx.fillStyle = expGrad;
        ctx.beginPath();
        ctx.arc(meteorX, impactY, layerSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shockwave ring
      const shockSize = impactProgress * 150;
      ctx.strokeStyle = `rgba(255, 150, 50, ${impactAlpha * 0.6})`;
      ctx.lineWidth = 5 - impactProgress * 4;
      ctx.beginPath();
      ctx.ellipse(meteorX, impactY + 10, shockSize, shockSize * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Flying debris and rocks
      for (let debris = 0; debris < 15; debris++) {
        const debrisAngle = debris * Math.PI * 2 / 15;
        const debrisDist = impactProgress * 80 + Math.sin(debris * 3) * 20;
        const debrisHeight = Math.sin(impactProgress * Math.PI) * 60 * (1 + Math.sin(debris) * 0.3);
        const dx = meteorX + Math.cos(debrisAngle) * debrisDist;
        const dy = impactY - debrisHeight + Math.sin(debrisAngle) * debrisDist * 0.3;

        ctx.fillStyle = `rgba(80, 60, 40, ${impactAlpha})`;
        ctx.beginPath();
        ctx.arc(dx, dy, 3 + (debris % 3), 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground crack marks
      ctx.strokeStyle = `rgba(50, 30, 20, ${impactAlpha})`;
      ctx.lineWidth = 2;
      for (let crack = 0; crack < 8; crack++) {
        const crackAngle = crack * Math.PI / 4;
        const crackLen = 30 + Math.sin(crack * 2) * 15;
        ctx.beginPath();
        ctx.moveTo(meteorX, impactY + 10);
        ctx.lineTo(
          meteorX + Math.cos(crackAngle) * crackLen,
          impactY + 10 + Math.sin(crackAngle) * crackLen * 0.4
        );
        ctx.stroke();
      }
    }

    // Arctic Freeze Spell (periodic)
    const freezePhase = (t * 0.2 + 2) % 5;
    if (freezePhase < 1.5) {
      const freezeX = width * 0.4;
      const freezeY = groundY + 30;
      const freezeProgress = freezePhase / 1.5;
      const freezeRadius = freezeProgress * 80;
      const freezeAlpha = 1 - freezeProgress * 0.5;

      // Ice expansion
      const iceGrad = ctx.createRadialGradient(freezeX, freezeY, 0, freezeX, freezeY, freezeRadius);
      iceGrad.addColorStop(0, `rgba(200, 230, 255, ${freezeAlpha * 0.6})`);
      iceGrad.addColorStop(0.5, `rgba(150, 200, 255, ${freezeAlpha * 0.4})`);
      iceGrad.addColorStop(1, "transparent");
      ctx.fillStyle = iceGrad;
      ctx.beginPath();
      ctx.arc(freezeX, freezeY, freezeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ice crystals
      ctx.strokeStyle = `rgba(200, 240, 255, ${freezeAlpha})`;
      ctx.lineWidth = 2;
      for (let crystal = 0; crystal < 8; crystal++) {
        const crystalAngle = crystal * Math.PI / 4 + freezeProgress * 2;
        const crystalLen = freezeRadius * 0.7;
        ctx.beginPath();
        ctx.moveTo(freezeX, freezeY);
        ctx.lineTo(
          freezeX + Math.cos(crystalAngle) * crystalLen,
          freezeY + Math.sin(crystalAngle) * crystalLen * 0.5
        );
        ctx.stroke();

        // Crystal branches
        const branchX = freezeX + Math.cos(crystalAngle) * crystalLen * 0.6;
        const branchY = freezeY + Math.sin(crystalAngle) * crystalLen * 0.3;
        ctx.beginPath();
        ctx.moveTo(branchX, branchY);
        ctx.lineTo(branchX + Math.cos(crystalAngle + 0.5) * 15, branchY + Math.sin(crystalAngle + 0.5) * 8);
        ctx.moveTo(branchX, branchY);
        ctx.lineTo(branchX + Math.cos(crystalAngle - 0.5) * 15, branchY + Math.sin(crystalAngle - 0.5) * 8);
        ctx.stroke();
      }

      // Floating ice particles
      for (let ice = 0; ice < 20; ice++) {
        const iceAngle = ice * Math.PI / 10 + t * 2;
        const iceDist = freezeRadius * (0.3 + Math.sin(ice) * 0.5);
        const iceSize = 2 + Math.sin(t * 5 + ice) * 1;
        ctx.fillStyle = `rgba(200, 240, 255, ${freezeAlpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(
          freezeX + Math.cos(iceAngle) * iceDist,
          freezeY + Math.sin(iceAngle) * iceDist * 0.5 - Math.sin(t * 4 + ice) * 10,
          iceSize, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    // === ENHANCED WEATHER PARTICLES ===

    if (scene.particles === "leaves") {
      // Autumn leaves with rotation and varied colors
      const leafColors = ["#4ade80", "#22c55e", "#84cc16", "#eab308"];
      for (let i = 0; i < 25; i++) {
        const lx = ((t * 35 + i * 50) % (width + 150)) - 75;
        const ly = ((t * 25 + i * 35 + Math.sin(t + i) * 30) % (height * 0.85));
        const leafColor = leafColors[i % leafColors.length];
        const leafAlpha = 0.4 + Math.sin(t * 2 + i) * 0.2;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(t * 3 + i * 0.5);
        ctx.fillStyle = leafColor + Math.floor(leafAlpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Leaf vein
        ctx.strokeStyle = leafColor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.restore();
      }
    } else if (scene.particles === "embers") {
      // Volcanic embers with glow trails
      for (let i = 0; i < 35; i++) {
        const ex = (i * 37 + Math.sin(t * 0.8 + i) * 40) % width;
        const ey = height - ((t * 50 + i * 25) % (height * 0.9));
        const emberPulse = 0.5 + Math.sin(t * 8 + i * 2) * 0.5;

        // Glow
        const emberGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
        emberGlow.addColorStop(0, `rgba(255, 200, 50, ${emberPulse * 0.6})`);
        emberGlow.addColorStop(0.5, `rgba(255, 100, 0, ${emberPulse * 0.3})`);
        emberGlow.addColorStop(1, "transparent");
        ctx.fillStyle = emberGlow;
        ctx.beginPath();
        ctx.arc(ex, ey, 8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(255, 220, 100, ${emberPulse})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (scene.particles === "snow") {
      // Detailed snowflakes with drift
      for (let i = 0; i < 50; i++) {
        const drift = Math.sin(t * 0.5 + i * 0.3) * 30;
        const sx = (i * 31 + drift + t * 10) % (width + 60) - 30;
        const sy = ((t * 30 + i * 20) % (height + 30)) - 15;
        const snowSize = 1.5 + (i % 3);
        const snowAlpha = 0.5 + Math.sin(i) * 0.3;

        ctx.fillStyle = `rgba(255, 255, 255, ${snowAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, snowSize, 0, Math.PI * 2);
        ctx.fill();

        // Snowflake sparkle
        if (i % 5 === 0) {
          ctx.fillStyle = `rgba(200, 230, 255, ${snowAlpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(sx, sy, snowSize * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (scene.particles === "sand") {
      // Sandstorm with wind streaks
      for (let i = 0; i < 40; i++) {
        const sx = ((t * 80 + i * 35) % (width + 120)) - 60;
        const sy = height * 0.3 + (i % 12) * 25 + Math.sin(t * 2 + i) * 15;
        const sandAlpha = 0.2 + Math.sin(t + i * 0.5) * 0.15;

        // Sand particle
        ctx.fillStyle = `rgba(251, 191, 36, ${sandAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Wind streak
        ctx.strokeStyle = `rgba(251, 191, 36, ${sandAlpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 20, sy + 2);
        ctx.stroke();
      }
    } else if (scene.particles === "fireflies") {
      // Bioluminescent fireflies with pulsing glow
      for (let i = 0; i < 20; i++) {
        const fx = (i * 57 + Math.sin(t * 0.6 + i) * 50) % width;
        const fy = height * 0.35 + (i % 6) * 35 + Math.cos(t * 0.4 + i) * 25;
        const glowPhase = (t * 2 + i * 0.7) % 2;
        const glow = glowPhase < 1 ? Math.sin(glowPhase * Math.PI) : 0;

        if (glow > 0.1) {
          // Glow aura
          const fireflyGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
          fireflyGlow.addColorStop(0, `rgba(150, 255, 150, ${glow * 0.8})`);
          fireflyGlow.addColorStop(0.5, `rgba(100, 220, 100, ${glow * 0.4})`);
          fireflyGlow.addColorStop(1, "transparent");
          ctx.fillStyle = fireflyGlow;
          ctx.beginPath();
          ctx.arc(fx, fy, 12, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgba(200, 255, 200, ${glow})`;
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (scene.particles === "magic") {
      // Mystical arcane particles with trails
      for (let i = 0; i < 30; i++) {
        const mx = (i * 43 + Math.sin(t * 1.2 + i) * 35) % width;
        const my = ((height - t * 40 - i * 30) % (height + 80)) + 40;
        const magicHue = (t * 60 + i * 25) % 360;
        const magicAlpha = 0.6 + Math.sin(t * 3 + i) * 0.3;

        // Magic glow
        const magicGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 8);
        magicGlow.addColorStop(0, `hsla(${magicHue}, 90%, 70%, ${magicAlpha})`);
        magicGlow.addColorStop(0.5, `hsla(${magicHue}, 80%, 50%, ${magicAlpha * 0.5})`);
        magicGlow.addColorStop(1, "transparent");
        ctx.fillStyle = magicGlow;
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.strokeStyle = `hsla(${magicHue}, 80%, 60%, ${magicAlpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx - Math.sin(t + i) * 15, my + 20);
        ctx.stroke();
      }
    }

    // === CINEMATIC FOG / ATMOSPHERE ===

    // Layered atmospheric fog
    const fogGrad = ctx.createLinearGradient(0, 0, 0, height);
    fogGrad.addColorStop(0, "rgba(28, 25, 23, 0.45)");
    fogGrad.addColorStop(0.3, "rgba(28, 25, 23, 0.15)");
    fogGrad.addColorStop(0.6, "rgba(28, 25, 23, 0.1)");
    fogGrad.addColorStop(0.85, "rgba(28, 25, 23, 0.25)");
    fogGrad.addColorStop(1, "rgba(28, 25, 23, 0.65)");
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, width, height);

    // Volumetric fog wisps
    for (let layer = 0; layer < 3; layer++) {
      const layerAlpha = 0.08 - layer * 0.02;
      ctx.fillStyle = `rgba(100, 90, 80, ${layerAlpha})`;
      for (let wisp = 0; wisp < 3; wisp++) {
        const wx = ((t * (12 - layer * 3) + wisp * 200 + layer * 100) % (width + 400)) - 200;
        const wy = height * (0.2 + layer * 0.15 + wisp * 0.1);
        const ww = 150 + layer * 30;
        const wh = 40 + layer * 10;
        ctx.beginPath();
        ctx.ellipse(wx, wy, ww, wh, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dramatic vignette
    const vignetteGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.15,
      width / 2,
      height / 2,
      width * 0.8
    );
    vignetteGrad.addColorStop(0, "transparent");
    vignetteGrad.addColorStop(0.5, "rgba(28, 25, 23, 0.45)");
    vignetteGrad.addColorStop(0.75, "rgba(28, 25, 23, 0.5)");
    vignetteGrad.addColorStop(1, "rgba(20, 18, 16, 0.9)");
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, width, height);
  }, [animTime, currentScene]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Canvas Battle Scene */}
      <div className="opacity-40">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="size-20 sm:size-24 rounded-full bg-gradient-to-br from-amber-800/60 to-orange-900/60 border-2 border-amber-600/70 flex items-center justify-center mb-4 backdrop-blur-sm shadow-lg shadow-amber-500/20">
          <MapPin size={40} className="text-amber-400 drop-shadow-lg" />
        </div>

        <h3 className="text-xl font-bold text-amber-200 mb-2 drop-shadow-lg tracking-wide">
          Select a Battlefield
        </h3>
        <p className="text-amber-400/90 text-sm max-w-xs drop-shadow-md leading-relaxed">
          Click on any unlocked location on the map to view battle details and
          begin your campaign
        </p>
        <div className="mt-6 flex items-center gap-3 text-xs text-amber-300">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-500/70 to-orange-600/70 border border-amber-400/80 shadow-lg shadow-amber-500/40 animate-pulse" />
          <span className="font-medium tracking-wide">= Unlocked Location</span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// WORLD MAP COMPONENT
// =============================================================================

interface WorldMapProps {
  setSelectedMap: (map: string) => void;
  setGameState: (state: GameState) => void;
  levelStars: LevelStars;
  levelStats: Record<string, any>;
  unlockedMaps: string[];
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType | null) => void;
  selectedSpells: SpellType[];
  setSelectedSpells: (spells: SpellType[]) => void;
  gameState: GameState;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  setSelectedMap,
  setGameState,
  levelStars,
  levelStats,
  unlockedMaps,
  selectedHero,
  setSelectedHero,
  selectedSpells,
  setSelectedSpells,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showCodex, setShowCodex] = useState(false);
  const [animTime, setAnimTime] = useState(0);
  const [mapHeight, setMapHeight] = useState(500);
  const [hoveredHero, setHoveredHero] = useState<HeroType | null>(null);
  const [hoveredSpell, setHoveredSpell] = useState<SpellType | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current)
        setMapHeight(Math.max(300, containerRef.current.clientHeight));
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const totalStars = Object.values(levelStars).reduce((a, b) => a + b, 0);
  const maxStars = WORLD_LEVELS.length * 3;
  const isLevelUnlocked = useCallback(
    (levelId: string) => unlockedMaps.includes(levelId),
    [unlockedMaps]
  );
  const getLevelById = useCallback(
    (id: string) => WORLD_LEVELS.find((l) => l.id === id),
    []
  );
  const getY = useCallback(
    (pct: number) => {
      const usableHeight = mapHeight - 70; // Leave 60px top for labels, 40px bottom for overlay
      return (pct / 100) * usableHeight - 50;
    },
    [mapHeight]
  );
  const handleLevelClick = (levelId: string) => {
    if (isLevelUnlocked(levelId)) {
      setSelectedLevel(levelId);
      setSelectedMap(levelId);
    }
  };
  const startGame = () => {
    if (selectedLevel && selectedHero && selectedSpells.length === 3)
      setGameState("playing");
  };
  const toggleSpell = (spell: SpellType) => {
    if (selectedSpells.includes(spell))
      setSelectedSpells(selectedSpells.filter((s) => s !== spell));
    else if (selectedSpells.length < 3)
      setSelectedSpells([...selectedSpells, spell]);
  };
  const seededRandom = useCallback((seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  }, []);

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = MAP_WIDTH;
    const height = mapHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.minHeight = `${height}px`;
    ctx.scale(dpr, dpr);

    const time = animTime;

    // Background with war atmosphere - enhanced with richer gradient
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width
    );
    bgGrad.addColorStop(0, "#4a3a2a");
    bgGrad.addColorStop(0.3, "#3d2d1d");
    bgGrad.addColorStop(0.6, "#3a2a1a");
    bgGrad.addColorStop(1, "#2a1a0a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // === ENHANCED GROUND TEXTURES ===
    // Layer 1: Large terrain patches for depth
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 80; i++) {
      const px = seededRandom(i * 7) * width;
      const py = seededRandom(i * 7 + 1) * height;
      const psize = 30 + seededRandom(i * 7 + 2) * 60;
      const hue = seededRandom(i * 7 + 3) > 0.5 ? "#5a4a3a" : "#3a2a1a";
      ctx.fillStyle = hue;
      ctx.beginPath();
      // Organic blob shape
      ctx.moveTo(px + psize * 0.5, py);
      for (let a = 0; a < Math.PI * 2; a += 0.3) {
        const r = psize * (0.4 + seededRandom(i + a * 100) * 0.3);
        ctx.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r * 0.5);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layer 2: Dirt/soil texture with isometric perspective
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 500; i++) {
      const dx = seededRandom(i * 11) * width;
      const dy = seededRandom(i * 11 + 1) * height;
      const dw = 3 + seededRandom(i * 11 + 2) * 10;
      const dh = dw * 0.4; // Isometric flattening
      ctx.fillStyle = seededRandom(i * 11 + 3) > 0.6 ? "#6a5a4a" : "#2a1a0a";
      ctx.beginPath();
      ctx.ellipse(dx, dy, dw, dh, seededRandom(i) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layer 3: Small pebbles and debris
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 400; i++) {
      const sx = seededRandom(i * 13) * width;
      const sy = seededRandom(i * 13 + 1) * height;
      const ss = 1 + seededRandom(i * 13 + 2) * 3;
      ctx.fillStyle = ["#5a4a3a", "#7a6a5a", "#3a2a1a", "#4a3a2a"][
        Math.floor(seededRandom(i * 13 + 3) * 4)
      ];
      ctx.beginPath();
      ctx.ellipse(sx, sy, ss, ss * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layer 4: Grass tufts in isometric style (scattered across map)
    const drawGrassTuft = (gx: number, gy: number, scale: number, color: string) => {
      ctx.fillStyle = color;
      const blades = 3 + Math.floor(seededRandom(gx + gy) * 4);
      for (let b = 0; b < blades; b++) {
        const bx = gx + (b - blades / 2) * 2 * scale;
        const bh = (6 + seededRandom(gx + b) * 6) * scale;
        const sway = Math.sin(time * 2 + gx * 0.1 + b) * 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, gy);
        ctx.quadraticCurveTo(bx + sway, gy - bh * 0.6, bx + sway * 1.5, gy - bh);
        ctx.quadraticCurveTo(bx + sway * 0.5, gy - bh * 0.4, bx, gy);
        ctx.fill();
      }
    };
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 300; i++) {
      const gx = seededRandom(i * 17) * width;
      const gy = seededRandom(i * 17 + 1) * height;
      // Determine grass color based on region
      let grassColor = "#3a5a2a";
      if (gx > 1440) grassColor = "#3a2020"; // volcanic - dead grass
      else if (gx > 1080) grassColor = "#4a5a5a"; // winter - frosty
      else if (gx > 720) grassColor = "#6a5a3a"; // desert - dry
      else if (gx > 380) grassColor = "#2a4a2a"; // swamp - dark green

      drawGrassTuft(gx, gy, 0.5 + seededRandom(i * 17 + 2) * 0.5, grassColor);
    }
    ctx.globalAlpha = 1;

    // Layer 5: Cracks and weathering lines
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#1a0a00";
    ctx.lineWidth = 1;
    for (let i = 0; i < 100; i++) {
      const cx = seededRandom(i * 19) * width;
      const cy = seededRandom(i * 19 + 1) * height;
      const clen = 15 + seededRandom(i * 19 + 2) * 40;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      let px = cx, py = cy;
      for (let j = 0; j < 4; j++) {
        const nx = px + (seededRandom(i * 19 + j * 3) - 0.5) * clen * 0.5;
        const ny = py + seededRandom(i * 19 + j * 3 + 1) * clen * 0.3;
        ctx.lineTo(nx, ny);
        px = nx; py = ny;
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Layer 6: Enhanced parchment texture overlay
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 400; i++) {
      const x = seededRandom(i * 3) * width;
      const y = seededRandom(i * 3 + 1) * height;
      const size = 2 + seededRandom(i * 3 + 2) * 10;
      ctx.fillStyle = seededRandom(i) > 0.5 ? "#6a5a4a" : "#2a1a0a";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // --- RUGGED REGION BORDERS ---
    const drawRuggedBorder = (
      x: number,
      region1Color: string,
      region2Color: string
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y <= height; y += 8) {
        const offset =
          Math.sin(y * 0.15 + x * 0.01) * 15 +
          Math.sin(y * 0.08) * 10 +
          seededRandom(y + x) * 12 -
          6;
        ctx.lineTo(x + offset, y);
      }
      ctx.lineTo(x + 30, height);
      ctx.lineTo(x - 30, height);
      ctx.lineTo(x - 30, 0);
      ctx.closePath();

      const borderGrad = ctx.createLinearGradient(x - 30, 0, x + 30, 0);
      borderGrad.addColorStop(0, region1Color + "00");
      borderGrad.addColorStop(0.3, region1Color + "80");
      borderGrad.addColorStop(0.5, "#2a1a0a");
      borderGrad.addColorStop(0.7, region2Color + "80");
      borderGrad.addColorStop(1, region2Color + "00");
      ctx.fillStyle = borderGrad;
      ctx.fill();
      ctx.restore();
    };

    // Region backgrounds with gradient fills
    const regions = [
      {
        name: "PRINCETON GROUNDS",
        x: 0,
        w: 380,
        colors: ["#3d5a2f", "#2d4a1f"],
        labelColor: "#6abe30",
      },
      {
        name: "MATHEY MARSHES",
        x: 380,
        w: 340,
        colors: ["#2a3a2a", "#1a2a1a"],
        labelColor: "#4a8a4a",
      },
      {
        name: "STADIUM SANDS",
        x: 720,
        w: 360,
        colors: ["#d4a574", "#b8956a"],
        labelColor: "#ffd700",
      },
      {

        name: "FRIST FRONTIER",
        x: 1080,
        w: 360,
        colors: ["#a8c8e8", "#7aa8d8"],
        labelColor: "#e0f4ff",
      },
      {
        name: "DORMITORY DEPTHS",
        x: 1440,
        w: 380,
        colors: ["#4a1a1a", "#2a0808"],
        labelColor: "#ff6644",
      },
    ];

    regions.forEach((r, idx) => {
      const grad = ctx.createLinearGradient(r.x, 0, r.x + r.w, height);
      grad.addColorStop(0, r.colors[0]);
      grad.addColorStop(1, r.colors[1]);
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = grad;
      ctx.fillRect(r.x, 0, r.w, height);
      ctx.globalAlpha = 1;

      // Region label with shadow
      ctx.save();
      ctx.font = "bold 13px 'bc-novatica-cyr', serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "3px";
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillText(r.name, r.x + r.w / 2 + 1, 24);
      ctx.fillStyle = r.labelColor;
      ctx.fillText(r.name, r.x + r.w / 2, 23);
      ctx.restore();
    });

    // Draw rugged borders between regions
    drawRuggedBorder(380, "#3d5a2f", "#2a3a2a");
    drawRuggedBorder(720, "#2a3a2a", "#9a8060");
    drawRuggedBorder(1080, "#9a8060", "#5a6a7a");
    drawRuggedBorder(1450, "#5a6a7a", "#5a3030");

    // === GRASSLAND DETAILS ===
    // Enhanced 3D Isometric Trees with more detail
    const drawTree = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);

      // Ground shadow with depth
      const shadowGrad = ctx.createRadialGradient(x + 3, y + 6, 0, x + 3, y + 6, 14 * scale);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(x + 3, y + 6, 14 * scale, 5 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Tree trunk with bark texture
      const trunkGrad = ctx.createLinearGradient(x - 4 * scale, 0, x + 4 * scale, 0);
      trunkGrad.addColorStop(0, "#3a2010");
      trunkGrad.addColorStop(0.3, "#5a4030");
      trunkGrad.addColorStop(0.7, "#4a3020");
      trunkGrad.addColorStop(1, "#2a1008");
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(x - 4 * scale, y + 5);
      ctx.quadraticCurveTo(x - 5 * scale, y - 6 * scale, x - 3 * scale, y - 14 * scale);
      ctx.lineTo(x + 3 * scale, y - 14 * scale);
      ctx.quadraticCurveTo(x + 5 * scale, y - 6 * scale, x + 4 * scale, y + 5);
      ctx.closePath();
      ctx.fill();

      // Bark detail lines
      ctx.strokeStyle = "#2a1808";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + (i - 1) * 2 * scale, y + 3);
        ctx.lineTo(x + (i - 1) * 1.5 * scale, y - 10 * scale);
        ctx.stroke();
      }

      // Main foliage - multiple layered leaves for depth
      // Back layer (darker)
      ctx.fillStyle = "#1d4a0f";
      ctx.beginPath();
      ctx.arc(x - 2 * scale, y - 22 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.arc(x + 6 * scale, y - 20 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Middle layer
      ctx.fillStyle = "#2d5a1f";
      ctx.beginPath();
      ctx.arc(x, y - 20 * scale, 13 * scale, 0, Math.PI * 2);
      ctx.arc(x - 6 * scale, y - 16 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.arc(x + 5 * scale, y - 16 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Front layer (lighter - highlights)
      ctx.fillStyle = "#3d7a2f";
      ctx.beginPath();
      ctx.arc(x - 3 * scale, y - 18 * scale, 7 * scale, 0, Math.PI * 2);
      ctx.arc(x + 4 * scale, y - 22 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Leaf details / texture
      ctx.fillStyle = "#4d8a3f";
      for (let i = 0; i < 6; i++) {
        const lx = x + (seededRandom(x + i * 7) - 0.5) * 16 * scale;
        const ly = y - 16 * scale - seededRandom(x + i * 7 + 1) * 10 * scale;
        ctx.beginPath();
        ctx.arc(lx, ly, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle light dappling
      ctx.fillStyle = "rgba(100, 180, 80, 0.15)";
      ctx.beginPath();
      ctx.arc(x + 2 * scale, y - 24 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    [
      [50, 30],
      [80, 82],
      [150, 22],
      [170, 75],
      [140, 33],
      [238, 55],
      [270, 41],
      [270, 85],
      [320, 25],
      [350, 68],
      [45, 65],
      [130, 90],
      [190, 38],
      [280, 60],
      [360, 45],
    ].forEach(([x, yPct], i) => {
      drawTree(x, yPct, 0.6 + seededRandom(i + 100) * 0.4);
    });

    // Enhanced Military camp with isometric detail
    const drawCamp = (cx: number, cyPct: number) => {
      const cy = getY(cyPct);

      // Ground patch / cleared area
      ctx.fillStyle = "rgba(80, 60, 40, 0.4)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 35, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tent shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main tent body with 3D shading
      const tentGrad = ctx.createLinearGradient(cx - 20, cy, cx + 20, cy);
      tentGrad.addColorStop(0, "#4a3a2a");
      tentGrad.addColorStop(0.4, "#6a5a4a");
      tentGrad.addColorStop(0.6, "#5a4a3a");
      tentGrad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = tentGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 22, cy + 6);
      ctx.lineTo(cx - 22, cy + 6);
      ctx.closePath();
      ctx.fill();

      // Tent opening (dark)
      ctx.fillStyle = "#1a1008";
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 6);
      ctx.lineTo(cx, cy - 5);
      ctx.lineTo(cx + 5, cy + 6);
      ctx.closePath();
      ctx.fill();

      // Tent seams
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx, cy + 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx - 11, cy - 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 11, cy - 7);
      ctx.stroke();

      // Flag pole with shadow
      ctx.fillStyle = "#3a2010";
      ctx.fillRect(cx + 19, cy - 26, 3, 34);
      // Flag with wave animation
      ctx.fillStyle = "#f59e0b";
      const fw = Math.sin(time * 3 + cx) * 3;
      const fw2 = Math.sin(time * 3.5 + cx) * 2;
      ctx.beginPath();
      ctx.moveTo(cx + 22, cy - 24);
      ctx.quadraticCurveTo(cx + 30, cy - 20 + fw, cx + 38, cy - 16 + fw2);
      ctx.quadraticCurveTo(cx + 30, cy - 12 + fw, cx + 22, cy - 8);
      ctx.closePath();
      ctx.fill();
      // Flag detail (stripes)
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 24, cy - 16 + fw * 0.5);
      ctx.quadraticCurveTo(cx + 30, cy - 14 + fw * 0.7, cx + 36, cy - 12 + fw2 * 0.8);
      ctx.stroke();

      // Campfire with detailed flames
      // Fire glow
      const glowGrad = ctx.createRadialGradient(cx - 12, cy + 2, 0, cx - 12, cy + 2, 12);
      glowGrad.addColorStop(0, `rgba(255, 150, 50, ${0.4 + Math.sin(time * 6) * 0.2})`);
      glowGrad.addColorStop(1, "rgba(255, 100, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx - 12, cy + 2, 12, 0, Math.PI * 2);
      ctx.fill();

      // Fire stones
      ctx.fillStyle = "#4a4040";
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const fx = cx - 12 + Math.cos(angle) * 5;
        const fy = cy + 4 + Math.sin(angle) * 2;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fire flames
      for (let f = 0; f < 3; f++) {
        const fh = 6 + Math.sin(time * 8 + f * 2) * 3;
        const fx = cx - 14 + f * 3;
        ctx.fillStyle = f === 1 ? "#ffcc00" : "#ff6600";
        ctx.globalAlpha = 0.8 + Math.sin(time * 7 + f) * 0.2;
        ctx.beginPath();
        ctx.moveTo(fx - 2, cy + 3);
        ctx.quadraticCurveTo(fx, cy - fh, fx + 2, cy + 3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Smoke particles with better animation
      for (let i = 0; i < 4; i++) {
        const sy = cy - 8 - ((time * 18 + i * 10) % 25);
        const sx = cx - 12 + Math.sin(time * 1.5 + i * 1.2) * 4;
        const sAlpha = 0.35 - ((time * 18 + i * 10) % 25) / 70;
        if (sAlpha > 0) {
          ctx.globalAlpha = sAlpha;
          ctx.fillStyle = "#888";
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5 + i * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Supply crates
      ctx.fillStyle = "#5a4030";
      ctx.fillRect(cx + 25, cy + 1, 8, 6);
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(cx + 26, cy - 4, 6, 5);
      // Crate detail lines
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(cx + 25, cy + 1, 8, 6);

      // Weapon rack
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(cx - 28, cy, 2, 10);
      ctx.fillRect(cx - 22, cy, 2, 10);
      ctx.fillRect(cx - 29, cy - 2, 10, 2);
      // Spears
      ctx.strokeStyle = "#6a6a6a";
      ctx.lineWidth = 1;
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        ctx.moveTo(cx - 28 + s * 3, cy - 1);
        ctx.lineTo(cx - 28 + s * 3, cy - 12);
        ctx.stroke();
        ctx.fillStyle = "#8a8a8a";
        ctx.beginPath();
        ctx.moveTo(cx - 29 + s * 3, cy - 12);
        ctx.lineTo(cx - 27 + s * 3, cy - 15);
        ctx.lineTo(cx - 25 + s * 3, cy - 12);
        ctx.fill();
      }
    };
    drawCamp(100, 25);
    drawCamp(180, 55);
    drawCamp(290, 78);
    drawCamp(620, 78);
    drawCamp(540, 28);
    drawCamp(860, 34);
    drawCamp(1020, 75);
    drawCamp(1580, 82);

    // Enhanced Watch tower with 3D isometric detail
    const drawWatchTower = (tx: number, tyPct: number) => {
      const ty = getY(tyPct);

      // Tower shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(tx + 4, ty + 8, 14, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Base stones
      ctx.fillStyle = "#3a3030";
      ctx.beginPath();
      ctx.moveTo(tx - 12, ty + 5);
      ctx.lineTo(tx + 12, ty + 5);
      ctx.lineTo(tx + 10, ty - 2);
      ctx.lineTo(tx - 10, ty - 2);
      ctx.closePath();
      ctx.fill();

      // Main tower body with 3D shading
      const towerGrad = ctx.createLinearGradient(tx - 10, 0, tx + 10, 0);
      towerGrad.addColorStop(0, "#4a3a2a");
      towerGrad.addColorStop(0.3, "#6a5a4a");
      towerGrad.addColorStop(0.7, "#5a4a3a");
      towerGrad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = towerGrad;
      ctx.fillRect(tx - 9, ty - 38, 18, 40);

      // Stone texture lines
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      for (let row = 0; row < 8; row++) {
        const ry = ty - 35 + row * 5;
        ctx.beginPath();
        ctx.moveTo(tx - 9, ry);
        ctx.lineTo(tx + 9, ry);
        ctx.stroke();
        // Vertical brick lines (offset each row)
        for (let col = 0; col < 3; col++) {
          const offset = row % 2 === 0 ? 0 : 3;
          ctx.beginPath();
          ctx.moveTo(tx - 9 + col * 6 + offset, ry);
          ctx.lineTo(tx - 9 + col * 6 + offset, ry + 5);
          ctx.stroke();
        }
      }

      // Platform
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(tx - 14, ty - 45, 28, 10);
      // Platform rim (3D effect)
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(tx - 14, ty - 45, 28, 3);

      // Crenellations with 3D depth
      for (let i = 0; i < 5; i++) {
        const cx = tx - 12 + i * 7;
        // Back face
        ctx.fillStyle = "#3a2a1a";
        ctx.fillRect(cx, ty - 52, 5, 8);
        // Front face
        ctx.fillStyle = "#5a4a3a";
        ctx.fillRect(cx, ty - 52, 4, 7);
        // Top face (lighter)
        ctx.fillStyle = "#6a5a4a";
        ctx.fillRect(cx, ty - 52, 4, 2);
      }

      // Window with warm light glow
      const windowGlow = ctx.createRadialGradient(tx, ty - 25, 0, tx, ty - 25, 8);
      windowGlow.addColorStop(0, `rgba(255, 200, 100, ${0.6 + Math.sin(time * 2 + tx) * 0.3})`);
      windowGlow.addColorStop(1, "rgba(255, 150, 50, 0)");
      ctx.fillStyle = windowGlow;
      ctx.beginPath();
      ctx.arc(tx, ty - 25, 8, 0, Math.PI * 2);
      ctx.fill();

      // Window frame
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(tx - 4, ty - 32, 8, 12);
      // Window light
      ctx.fillStyle = `rgba(255, 200, 100, ${0.5 + Math.sin(time * 2 + tx) * 0.25})`;
      ctx.fillRect(tx - 3, ty - 31, 6, 10);
      // Window cross
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(tx - 0.5, ty - 31, 1, 10);
      ctx.fillRect(tx - 3, ty - 27, 6, 1);

      // Roof / beacon
      ctx.fillStyle = "#5a3020";
      ctx.beginPath();
      ctx.moveTo(tx, ty - 58);
      ctx.lineTo(tx + 8, ty - 48);
      ctx.lineTo(tx - 8, ty - 48);
      ctx.closePath();
      ctx.fill();

      // Beacon fire (flickering)
      const beaconFlicker = Math.sin(time * 6 + tx) * 0.3;
      ctx.fillStyle = `rgba(255, 100, 0, ${0.6 + beaconFlicker})`;
      ctx.beginPath();
      ctx.arc(tx, ty - 48, 3 + beaconFlicker * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 200, 50, ${0.4 + beaconFlicker})`;
      ctx.beginPath();
      ctx.arc(tx, ty - 48, 2, 0, Math.PI * 2);
      ctx.fill();

      // Door
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.moveTo(tx - 4, ty + 5);
      ctx.lineTo(tx - 4, ty - 5);
      ctx.arc(tx, ty - 5, 4, Math.PI, 0);
      ctx.lineTo(tx + 4, ty + 5);
      ctx.closePath();
      ctx.fill();
    };
    drawWatchTower(55, 66);
    drawWatchTower(220, 25);
    drawWatchTower(230, 70);
    drawWatchTower(330, 42);
    drawWatchTower(490, 70);
    drawWatchTower(867, 33);
    drawWatchTower(1240, 52);
    drawWatchTower(1180, 25);
    drawWatchTower(1620, 30);

    // Crater (war damage)
    const drawCrater = (cx: number, cyPct: number, size: number) => {
      const cy = getY(cyPct);
      ctx.fillStyle = "#2a2015";
      ctx.beginPath();
      ctx.ellipse(cx, cy, size * 1.2, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a3025";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2, size * 0.8, size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      // Scorched edges
      ctx.strokeStyle = "#1a1005";
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    drawCrater(180, 60, 15);
    drawCrater(260, 32, 12);
    drawCrater(320, 80, 10);
    drawCrater(600, 45, 18);
    drawCrater(750, 70, 14);
    drawCrater(920, 30, 11);
    drawCrater(980, 65, 14);
    drawCrater(1120, 55, 16);
    drawCrater(1200, 50, 19);
    drawCrater(1290, 25, 19);
    drawCrater(1300, 60, 13);
    drawCrater(1400, 60, 15);
    drawCrater(1500, 75, 12);
    drawCrater(1700, 85, 9);

    // === SWAMP DETAILS ===
    // Enhanced gnarled swamp trees with more atmosphere
    const drawWillowTree = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);

      // Murky water reflection shadow
      ctx.fillStyle = "rgba(20, 40, 20, 0.4)";
      ctx.beginPath();
      ctx.ellipse(x + 5, y + 4, 16 * scale, 6 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Exposed roots
      ctx.strokeStyle = "#1a1612";
      ctx.lineWidth = 2 * scale;
      for (let r = 0; r < 4; r++) {
        const rx = x + (r - 1.5) * 6 * scale;
        ctx.beginPath();
        ctx.moveTo(x + (r - 1.5) * 2 * scale, y - 2);
        ctx.quadraticCurveTo(rx - 2, y + 2, rx + seededRandom(x + r) * 4, y + 4);
        ctx.stroke();
      }

      // Twisted trunk with bark texture
      const trunkGrad = ctx.createLinearGradient(x - 5 * scale, 0, x + 5 * scale, 0);
      trunkGrad.addColorStop(0, "#0a0a08");
      trunkGrad.addColorStop(0.3, "#1a1a14");
      trunkGrad.addColorStop(0.7, "#141410");
      trunkGrad.addColorStop(1, "#080806");
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(x - 4 * scale, y);
      ctx.quadraticCurveTo(x - 7 * scale, y - 8 * scale, x - 3 * scale, y - 18 * scale);
      ctx.quadraticCurveTo(x - 5 * scale, y - 25 * scale, x, y - 30 * scale);
      ctx.quadraticCurveTo(x + 5 * scale, y - 25 * scale, x + 3 * scale, y - 18 * scale);
      ctx.quadraticCurveTo(x + 7 * scale, y - 8 * scale, x + 4 * scale, y);
      ctx.closePath();
      ctx.fill();

      // Bark knots
      ctx.fillStyle = "#0a0806";
      ctx.beginPath();
      ctx.ellipse(x - 1 * scale, y - 12 * scale, 2 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 2 * scale, y - 22 * scale, 1.5 * scale, 2 * scale, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Drooping canopy - back layer
      ctx.fillStyle = "#1a2a1a";
      ctx.beginPath();
      ctx.arc(x - 4 * scale, y - 32 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.arc(x + 8 * scale, y - 30 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Middle layer
      ctx.fillStyle = "#2a3a2a";
      ctx.beginPath();
      ctx.arc(x, y - 34 * scale, 16 * scale, 0, Math.PI * 2);
      ctx.arc(x - 12 * scale, y - 26 * scale, 11 * scale, 0, Math.PI * 2);
      ctx.arc(x + 12 * scale, y - 26 * scale, 11 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Front layer (highlights)
      ctx.fillStyle = "#3a4a3a";
      ctx.beginPath();
      ctx.arc(x + 4 * scale, y - 36 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.arc(x - 6 * scale, y - 28 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Spanish moss / hanging vines
      ctx.lineWidth = 1.2 * scale;
      for (let i = 0; i < 8; i++) {
        const vx = x - 14 * scale + i * 4 * scale;
        const vy = y - 24 * scale + seededRandom(x + i * 3) * 8 * scale;
        const len = 18 * scale + Math.sin(time * 1.5 + i + x) * 4 + seededRandom(x + i) * 10;

        // Vine with gradient (darker at bottom)
        const vineGrad = ctx.createLinearGradient(vx, vy, vx, vy + len);
        vineGrad.addColorStop(0, "#2a3a2a");
        vineGrad.addColorStop(1, "#1a2a1a");
        ctx.strokeStyle = vineGrad;

        ctx.beginPath();
        ctx.moveTo(vx, vy);
        const sway = Math.sin(time * 1.2 + i * 0.8) * 3;
        ctx.bezierCurveTo(
          vx + sway * 0.5, vy + len * 0.3,
          vx + sway, vy + len * 0.7,
          vx + sway * 0.3, vy + len
        );
        ctx.stroke();

        // Small leaves on vines
        if (i % 2 === 0) {
          ctx.fillStyle = "#2a4a2a";
          ctx.beginPath();
          ctx.ellipse(vx + sway * 0.5, vy + len * 0.5, 1.5 * scale, 2.5 * scale, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Glowing fungus on trunk
      ctx.fillStyle = `rgba(100, 200, 100, ${0.3 + Math.sin(time * 2 + x) * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(x + 3 * scale, y - 8 * scale, 2 * scale, 1.5 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    [
      [410, 30],
      [430, 60],
      [420, 70],
      [450, 80],
      [480, 25],
      [500, 20],
      [640, 55],
      [550, 85],
      [540, 45],
      [580, 35],
      [600, 40],
      [630, 75],
      [680, 75],
      [395, 55],
      [465, 45],
      [570, 75],
      [695, 50],
    ].forEach(([x, yPct], i) => {
      drawWillowTree(x, yPct, 0.7 + seededRandom(i + 500) * 0.4);
    });

    // Swamp pools/puddles
    const drawSwampPool = (px: number, pyPct: number, psize: number) => {
      const py = getY(pyPct);
      // Dark water
      const poolGrad = ctx.createRadialGradient(px, py, 0, px, py, psize);
      poolGrad.addColorStop(0, "rgba(20, 40, 30, 0.7)");
      poolGrad.addColorStop(0.7, "rgba(30, 50, 35, 0.5)");
      poolGrad.addColorStop(1, "rgba(40, 60, 40, 0.2)");
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, psize * 1.3, psize * 0.5, seededRandom(px) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Surface reflection
      ctx.fillStyle = `rgba(100, 150, 100, ${0.1 + Math.sin(time * 1.5 + px) * 0.05})`;
      ctx.beginPath();
      ctx.ellipse(px - psize * 0.3, py - psize * 0.1, psize * 0.4, psize * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawSwampPool(425, 50, 20);
    drawSwampPool(515, 65, 25);
    drawSwampPool(605, 50, 18);
    drawSwampPool(660, 40, 22);

    // Swamp Gas Bubbles
    const drawSwampGas = (x: number, yPct: number) => {
      const y = getY(yPct);
      const tOffset = x * 0.1;
      const bubbleY = y - ((time * 20 + tOffset * 50) % 30);
      const opacity = 1 - ((time * 20 + tOffset * 50) % 30) / 30;

      ctx.fillStyle = `rgba(100, 255, 100, ${opacity * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, bubbleY, 2 + Math.sin(time * 5 + x) * 1, 0, Math.PI * 2);
      ctx.fill();
    };
    for (let i = 0; i < 15; i++) {
      drawSwampGas(
        400 + seededRandom(i * 55) * 300,
        30 + seededRandom(i * 22) * 60
      );
    }

    // Fireflies
    const drawFireflies = (xBase: number, yPct: number) => {
      const yBase = getY(yPct);
      const x = xBase + Math.sin(time * 0.5 + xBase) * 20;
      const y = yBase + Math.cos(time * 0.7 + xBase) * 10;
      const glow = 0.5 + Math.sin(time * 5 + xBase) * 0.5;

      ctx.fillStyle = `rgba(200, 255, 100, ${glow})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    };
    for (let i = 0; i < 10; i++) {
      drawFireflies(
        400 + seededRandom(i * 99) * 320,
        20 + seededRandom(i * 88) * 70
      );
    }

    // Low Mist
    ctx.fillStyle = "rgba(180, 220, 200, 0.05)";
    for (let i = 0; i < 5; i++) {
      const mx = 380 + Math.sin(time * 0.2 + i) * 50 + i * 60;
      const my = getY(60 + Math.cos(time * 0.3 + i) * 10);
      ctx.beginPath();
      ctx.ellipse(mx, my, 60, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // === SAHARA SANDS DETAILS === (Enhanced Desert Environment)

    // Isometric 3D sand dune with depth
    const drawSandDune = (dx: number, dyPct: number, width: number, heightPx: number, colorLight: string, colorMid: string, colorDark: string) => {
      const dy = getY(dyPct);
      const isoDepth = heightPx * 0.4; // Isometric depth for 3D effect

      // Shadow underneath
      ctx.fillStyle = "rgba(80, 60, 40, 0.2)";
      ctx.beginPath();
      ctx.ellipse(dx + width * 0.1, dy + isoDepth * 0.3, width * 0.55, isoDepth * 0.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Back face (darker, shadowed side)
      ctx.fillStyle = colorDark;
      ctx.beginPath();
      ctx.moveTo(dx + width * 0.1, dy - heightPx); // Peak (offset for isometric)
      ctx.quadraticCurveTo(dx + width * 0.4, dy - heightPx * 0.5, dx + width * 0.5, dy);
      ctx.lineTo(dx + width * 0.5, dy + isoDepth * 0.3);
      ctx.quadraticCurveTo(dx + width * 0.3, dy + isoDepth * 0.5, dx + width * 0.1, dy + isoDepth * 0.3);
      ctx.lineTo(dx + width * 0.1, dy - heightPx);
      ctx.closePath();
      ctx.fill();

      // Front face (lit side) with gradient
      const duneGrad = ctx.createLinearGradient(dx - width * 0.4, dy - heightPx, dx + width * 0.2, dy + isoDepth);
      duneGrad.addColorStop(0, colorLight);
      duneGrad.addColorStop(0.5, colorMid);
      duneGrad.addColorStop(1, colorDark);
      ctx.fillStyle = duneGrad;
      ctx.beginPath();
      ctx.moveTo(dx + width * 0.1, dy - heightPx); // Peak
      ctx.quadraticCurveTo(dx - width * 0.2, dy - heightPx * 0.6, dx - width * 0.4, dy);
      ctx.lineTo(dx - width * 0.4, dy + isoDepth * 0.3);
      ctx.quadraticCurveTo(dx - width * 0.1, dy + isoDepth * 0.5, dx + width * 0.1, dy + isoDepth * 0.3);
      ctx.lineTo(dx + width * 0.1, dy - heightPx);
      ctx.closePath();
      ctx.fill();

      // Top ridge highlight
      ctx.strokeStyle = `rgba(255, 248, 220, ${0.4 + Math.sin(time * 0.5 + dx * 0.01) * 0.15})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(dx - width * 0.15, dy - heightPx * 0.7);
      ctx.quadraticCurveTo(dx, dy - heightPx + 1, dx + width * 0.2, dy - heightPx * 0.6);
      ctx.stroke();

      // Wind ripples on front face
      ctx.strokeStyle = `rgba(180, 150, 100, 0.2)`;
      ctx.lineWidth = 0.5;
      for (let r = 0; r < 3; r++) {
        const rippleY = dy - heightPx * 0.3 + r * (heightPx * 0.2);
        ctx.beginPath();
        ctx.moveTo(dx - width * 0.3 + r * 3, rippleY);
        ctx.quadraticCurveTo(dx - width * 0.1, rippleY - 2, dx + width * 0.05, rippleY + 1);
        ctx.stroke();
      }
    };

    // Back dunes (darker, distant)
    drawSandDune(760, 25, 40, 10, "#c49a6c", "#b08a5c", "#9a7a4c");
    drawSandDune(870, 20, 45, 12, "#c8a070", "#b89060", "#a88050");
    drawSandDune(980, 28, 35, 9, "#c49a6c", "#b08a5c", "#9a7a4c");
    drawSandDune(1050, 22, 32, 8, "#c8a070", "#b89060", "#a88050");
    // Mid dunes
    drawSandDune(800, 45, 48, 12, "#d4aa7a", "#c49a6a", "#b08a5a");
    drawSandDune(920, 50, 42, 11, "#d8b080", "#c8a070", "#b89060");
    drawSandDune(1010, 42, 38, 10, "#d4aa7a", "#c49a6a", "#b08a5a");
    // Front dunes (lighter, closer)
    drawSandDune(750, 75, 35, 9, "#e0be8a", "#d0ae7a", "#c09e6a");
    drawSandDune(860, 80, 40, 10, "#e4c490", "#d4b480", "#c4a470");
    drawSandDune(960, 78, 32, 8, "#e0be8a", "#d0ae7a", "#c09e6a");
    drawSandDune(1040, 82, 28, 7, "#e4c490", "#d4b480", "#c4a470");

    // Majestic Golden Pyramid with hieroglyphics
    const drawGoldenPyramid = (px: number, pyPct: number, size: number) => {
      const py = getY(pyPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(px + size * 0.3, py + 8, size * 1.2, size * 0.3, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Pyramid body with gradient
      const pyrGrad = ctx.createLinearGradient(px - size, py, px + size * 0.5, py - size * 1.5);
      pyrGrad.addColorStop(0, "#8b7355");
      pyrGrad.addColorStop(0.3, "#c9a86c");
      pyrGrad.addColorStop(0.5, "#e8d4a0");
      pyrGrad.addColorStop(0.7, "#c9a86c");
      pyrGrad.addColorStop(1, "#8b7355");
      ctx.fillStyle = pyrGrad;
      ctx.beginPath();
      ctx.moveTo(px, py - size * 1.5);
      ctx.lineTo(px + size, py + 5);
      ctx.lineTo(px - size, py + 5);
      ctx.closePath();
      ctx.fill();
      // Golden capstone
      ctx.fillStyle = `rgba(255, 215, 0, ${0.7 + Math.sin(time * 2) * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(px, py - size * 1.5);
      ctx.lineTo(px + size * 0.15, py - size * 1.25);
      ctx.lineTo(px - size * 0.15, py - size * 1.25);
      ctx.closePath();
      ctx.fill();

      // Stone block lines
      ctx.strokeStyle = "rgba(90, 74, 58, 0.3)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        const lineY = py + 5 - i * (size * 0.25);
        const lineHalfWidth = size * (1 - i * 0.16);
        ctx.beginPath();
        ctx.moveTo(px - lineHalfWidth, lineY);
        ctx.lineTo(px + lineHalfWidth, lineY);
        ctx.stroke();
      }
    };
    drawGoldenPyramid(770, 66, 27);
    drawGoldenPyramid(820, 70, 27);
    drawGoldenPyramid(860, 65, 27);
    drawGoldenPyramid(850, 50, 25);
    drawGoldenPyramid(950, 23, 17);

    drawGoldenPyramid(970, 85, 20);


    drawGoldenPyramid(960, 35, 28);

    // Sphinx statue
    const drawSphinx = (sx: number, syPct: number, scale: number) => {
      const sy = getY(syPct);
      // Body shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(sx + 5 * scale, sy + 8 * scale, 25 * scale, 6 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lion body
      const bodyGrad = ctx.createLinearGradient(sx - 20 * scale, sy, sx + 20 * scale, sy);
      bodyGrad.addColorStop(0, "#a08060");
      bodyGrad.addColorStop(0.5, "#c8a878");
      bodyGrad.addColorStop(1, "#a08060");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 22 * scale, 10 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Paws
      ctx.fillStyle = "#b89868";
      ctx.beginPath();
      ctx.ellipse(sx + 18 * scale, sy + 4 * scale, 8 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Human head
      const headGrad = ctx.createRadialGradient(sx - 15 * scale, sy - 10 * scale, 0, sx - 15 * scale, sy - 10 * scale, 12 * scale);
      headGrad.addColorStop(0, "#d8b888");
      headGrad.addColorStop(1, "#a08060");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(sx - 15 * scale, sy - 8 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Headdress (Nemes)
      ctx.fillStyle = "#c9a050";
      ctx.beginPath();
      ctx.moveTo(sx - 24 * scale, sy - 4 * scale);
      ctx.lineTo(sx - 18 * scale, sy - 18 * scale);
      ctx.lineTo(sx - 8 * scale, sy - 18 * scale);
      ctx.lineTo(sx - 6 * scale, sy - 4 * scale);
      ctx.closePath();
      ctx.fill();
      // Face details
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.arc(sx - 17 * scale, sy - 10 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.arc(sx - 12 * scale, sy - 10 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawSphinx(920, 68, 0.8);

    // Palm tree oasis
    const drawPalmTree = (tx: number, tyPct: number, scale: number) => {
      const ty = getY(tyPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(tx + 8 * scale, ty + 4 * scale, 15 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Curved trunk
      const trunkGrad = ctx.createLinearGradient(tx - 4 * scale, ty, tx + 4 * scale, ty);
      trunkGrad.addColorStop(0, "#5a4020");
      trunkGrad.addColorStop(0.5, "#8a6840");
      trunkGrad.addColorStop(1, "#5a4020");
      ctx.strokeStyle = trunkGrad;
      ctx.lineWidth = 6 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + 8 * scale, ty - 20 * scale, tx + 4 * scale, ty - 40 * scale);
      ctx.stroke();
      // Trunk rings
      ctx.strokeStyle = "#4a3015";
      ctx.lineWidth = 1;
      for (let r = 0; r < 6; r++) {
        const ringY = ty - 5 * scale - r * 6 * scale;
        ctx.beginPath();
        ctx.arc(tx + 2 * scale + r * scale * 0.5, ringY, 3 * scale, 0, Math.PI);
        ctx.stroke();
      }
      // Palm fronds
      const frondColors = ["#1d6b2c", "#2d8b3c", "#1d6b2c", "#2d8b3c", "#1d6b2c"];
      const frondAngles = [-0.8, -0.3, 0.2, 0.7, 1.1];
      frondAngles.forEach((angle, i) => {
        ctx.save();
        ctx.translate(tx + 4 * scale, ty - 40 * scale);
        ctx.rotate(angle + Math.sin(time * 1.5 + i) * 0.05);
        ctx.fillStyle = frondColors[i];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(15 * scale, -8 * scale, 30 * scale, 5 * scale);
        ctx.quadraticCurveTo(15 * scale, -2 * scale, 0, 0);
        ctx.fill();
        // Frond details
        ctx.strokeStyle = "#0d4b1c";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(2 * scale, 0);
        ctx.quadraticCurveTo(15 * scale, -5 * scale, 28 * scale, 3 * scale);
        ctx.stroke();
        ctx.restore();
      });
      // Coconuts
      ctx.fillStyle = "#5a4030";
      ctx.beginPath();
      ctx.arc(tx + 3 * scale, ty - 38 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.arc(tx + 7 * scale, ty - 37 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    };

    // Oasis water pool
    const drawOasis = (ox: number, oyPct: number, size: number) => {
      const oy = getY(oyPct);
      // Water with shimmer
      const waterGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);
      waterGrad.addColorStop(0, `rgba(64, 164, 200, ${0.7 + Math.sin(time * 2) * 0.1})`);
      waterGrad.addColorStop(0.7, `rgba(40, 120, 160, ${0.8 + Math.sin(time * 2.5) * 0.1})`);
      waterGrad.addColorStop(1, "rgba(30, 90, 120, 0.6)");
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.ellipse(ox, oy, size, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Water sparkles
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(time * 4) * 0.2})`;
      for (let s = 0; s < 4; s++) {
        const sparkX = ox - size * 0.5 + seededRandom(ox + s) * size;
        const sparkY = oy - size * 0.1 + seededRandom(ox + s + 10) * size * 0.2;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Grass border
      ctx.fillStyle = "#4a8a3a";
      for (let g = 0; g < 12; g++) {
        const gAngle = (g / 12) * Math.PI * 2;
        const gx = ox + Math.cos(gAngle) * size * 1.1;
        const gy = oy + Math.sin(gAngle) * size * 0.45;
        ctx.beginPath();
        ctx.moveTo(gx - 2, gy + 2);
        ctx.lineTo(gx, gy - 6 - Math.sin(time * 3 + g) * 2);
        ctx.lineTo(gx + 2, gy + 2);
        ctx.fill();
      }
    };
    drawOasis(780, 42, 25);
    drawPalmTree(765, 40, 0.7);
    drawPalmTree(795, 44, 0.6);
    drawPalmTree(778, 38, 0.8);

    // Detailed cactus with flowers
    const drawDesertCactus = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(x + 3 * scale, y + 3 * scale, 8 * scale, 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Main stem with gradient
      const cactusGrad = ctx.createLinearGradient(x - 5 * scale, y, x + 5 * scale, y);
      cactusGrad.addColorStop(0, "#1a5a2a");
      cactusGrad.addColorStop(0.3, "#3a8a4a");
      cactusGrad.addColorStop(0.7, "#2a7a3a");
      cactusGrad.addColorStop(1, "#1a5a2a");
      ctx.fillStyle = cactusGrad;
      // Main body
      ctx.beginPath();
      ctx.moveTo(x - 5 * scale, y);
      ctx.quadraticCurveTo(x - 6 * scale, y - 15 * scale, x - 4 * scale, y - 30 * scale);
      ctx.quadraticCurveTo(x, y - 33 * scale, x + 4 * scale, y - 30 * scale);
      ctx.quadraticCurveTo(x + 6 * scale, y - 15 * scale, x + 5 * scale, y);
      ctx.closePath();
      ctx.fill();
      // Left arm
      ctx.beginPath();
      ctx.moveTo(x - 4 * scale, y - 18 * scale);
      ctx.quadraticCurveTo(x - 14 * scale, y - 18 * scale, x - 14 * scale, y - 26 * scale);
      ctx.quadraticCurveTo(x - 14 * scale, y - 30 * scale, x - 10 * scale, y - 30 * scale);
      ctx.quadraticCurveTo(x - 8 * scale, y - 26 * scale, x - 4 * scale, y - 22 * scale);
      ctx.fill();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(x + 4 * scale, y - 12 * scale);
      ctx.quadraticCurveTo(x + 12 * scale, y - 12 * scale, x + 12 * scale, y - 20 * scale);
      ctx.quadraticCurveTo(x + 12 * scale, y - 24 * scale, x + 8 * scale, y - 24 * scale);
      ctx.quadraticCurveTo(x + 6 * scale, y - 18 * scale, x + 4 * scale, y - 16 * scale);
      ctx.fill();
      // Ridges
      ctx.strokeStyle = "#1a4a1a";
      ctx.lineWidth = 0.5;
      for (let r = -2; r <= 2; r++) {
        ctx.beginPath();
        ctx.moveTo(x + r * 1.5 * scale, y - 2 * scale);
        ctx.lineTo(x + r * 1.2 * scale, y - 28 * scale);
        ctx.stroke();
      }
      // Pink flower on top
      ctx.fillStyle = "#ff6b9d";
      ctx.beginPath();
      ctx.arc(x, y - 32 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffb6c1";
      ctx.beginPath();
      ctx.arc(x, y - 32 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    [
      [840, 60], [890, 25], [950, 75], [1000, 40], [1040, 65], [1060, 30],
    ].forEach(([x, yPct], i) => {
      drawDesertCactus(x, yPct, 0.6 + seededRandom(i + 200) * 0.3);
    });

    // Camel caravan
    const drawCamel = (cx: number, cyPct: number, scale: number, facing: number) => {
      const cy = getY(cyPct);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(facing, 1);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 8 * scale, 18 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Body
      const camelGrad = ctx.createLinearGradient(-15 * scale, -10 * scale, 15 * scale, 10 * scale);
      camelGrad.addColorStop(0, "#c4a070");
      camelGrad.addColorStop(0.5, "#d8b888");
      camelGrad.addColorStop(1, "#b89060");
      ctx.fillStyle = camelGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16 * scale, 10 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hump
      ctx.beginPath();
      ctx.arc(-2 * scale, -12 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Neck
      ctx.beginPath();
      ctx.moveTo(12 * scale, -4 * scale);
      ctx.quadraticCurveTo(20 * scale, -10 * scale, 18 * scale, -22 * scale);
      ctx.quadraticCurveTo(16 * scale, -10 * scale, 10 * scale, -2 * scale);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.ellipse(18 * scale, -24 * scale, 6 * scale, 4 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Legs
      ctx.fillStyle = "#a88050";
      ctx.fillRect(-10 * scale, 6 * scale, 3 * scale, 12 * scale);
      ctx.fillRect(-4 * scale, 6 * scale, 3 * scale, 12 * scale);
      ctx.fillRect(4 * scale, 6 * scale, 3 * scale, 12 * scale);
      ctx.fillRect(10 * scale, 6 * scale, 3 * scale, 12 * scale);
      // Eye
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.arc(20 * scale, -25 * scale, 1 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawCamel(880, 72, 0.6, 1);
    drawCamel(905, 74, 0.55, 1);
    drawCamel(1010, 50, 0.65, -1);

    // Desert camp with ornate tent
    const drawDesertCamp = (cx: number, cyPct: number) => {
      const cy = getY(cyPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tent base with gradient
      const tentGrad = ctx.createLinearGradient(cx - 22, cy - 20, cx + 22, cy + 5);
      tentGrad.addColorStop(0, "#f5e6c8");
      tentGrad.addColorStop(0.5, "#e8d4b0");
      tentGrad.addColorStop(1, "#c8b090");
      ctx.fillStyle = tentGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.lineTo(cx + 24, cy + 5);
      ctx.lineTo(cx - 24, cy + 5);
      ctx.closePath();
      ctx.fill();
      // Tent stripes
      ctx.fillStyle = "#b8432f";
      for (let s = 0; s < 3; s++) {
        const stripeY = cy - 15 + s * 8;
        ctx.beginPath();
        ctx.moveTo(cx - 18 + s * 6, stripeY);
        ctx.lineTo(cx - 15 + s * 6, stripeY + 3);
        ctx.lineTo(cx + 15 - s * 6, stripeY + 3);
        ctx.lineTo(cx + 18 - s * 6, stripeY);
        ctx.fill();
      }
      // Tent opening
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 5);
      ctx.lineTo(cx, cy - 8);
      ctx.lineTo(cx + 5, cy + 5);
      ctx.closePath();
      ctx.fill();
      // Golden finial
      ctx.fillStyle = `rgba(255, 200, 50, ${0.8 + Math.sin(time * 3) * 0.2})`;
      ctx.beginPath();
      ctx.arc(cx, cy - 24, 3, 0, Math.PI * 2);
      ctx.fill();
      // Campfire with animated flames
      const fireX = cx + 30;
      const fireY = cy;
      // Fire pit
      ctx.fillStyle = "#3a3030";
      ctx.beginPath();
      ctx.ellipse(fireX, fireY + 3, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Animated flames
      for (let f = 0; f < 5; f++) {
        const fh = 12 + Math.sin(time * 8 + f * 1.3) * 5;
        const fw = 3 + Math.sin(time * 6 + f * 0.7) * 1;
        const fx = fireX - 6 + f * 3;
        ctx.fillStyle = `rgba(255, ${100 + f * 30}, 20, ${0.8 - f * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(fx - fw, fireY);
        ctx.quadraticCurveTo(fx, fireY - fh, fx + fw, fireY);
        ctx.fill();
      }
      // Fire glow
      const glowGrad = ctx.createRadialGradient(fireX, fireY - 5, 0, fireX, fireY - 5, 20);
      glowGrad.addColorStop(0, "rgba(255, 150, 50, 0.3)");
      glowGrad.addColorStop(1, "rgba(255, 100, 20, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(fireX, fireY - 5, 20, 0, Math.PI * 2);
      ctx.fill();
    };
    drawDesertCamp(820, 22);
    drawDesertCamp(1030, 58);

    // Swirling sand/dust particles
    ctx.fillStyle = "rgba(210, 180, 140, 0.3)";
    for (let p = 0; p < 25; p++) {
      const px = 720 + seededRandom(p * 23) * 360;
      const py = height * 0.3 + seededRandom(p * 31) * height * 0.5;
      const drift = Math.sin(time * 2 + p * 0.5) * 15;
      ctx.beginPath();
      ctx.arc(px + drift, py, 1 + seededRandom(p) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heat shimmer effect at horizon
    ctx.save();
    ctx.globalAlpha = 0.05 + Math.sin(time * 3) * 0.02;
    for (let h = 0; h < 5; h++) {
      const shimmerY = getY(15 + h * 5);
      ctx.fillStyle = "#fff8dc";
      ctx.beginPath();
      for (let sx = 720; sx < 1080; sx += 8) {
        const shimmerOffset = Math.sin(time * 4 + sx * 0.05 + h) * 3;
        if (sx === 720) ctx.moveTo(sx, shimmerY + shimmerOffset);
        else ctx.lineTo(sx, shimmerY + shimmerOffset);
      }
      ctx.lineTo(1080, shimmerY + 8);
      ctx.lineTo(720, shimmerY + 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Burning wreckage
    const drawBurningWreck = (wx: number, wyPct: number) => {
      const wy = getY(wyPct);
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(wx - 12, wy - 5, 24, 10);
      ctx.fillRect(wx - 8, wy - 10, 16, 5);
      // Flames
      for (let i = 0; i < 3; i++) {
        const fx = wx - 6 + i * 6;
        const fh = 10 + Math.sin(time * 7 + i * 2) * 4;
        ctx.fillStyle = `rgba(255, ${100 + i * 30}, 0, ${0.7 + Math.sin(time * 5 + i) * 0.2
          })`;
        ctx.beginPath();
        ctx.moveTo(fx - 3, wy - 10);
        ctx.quadraticCurveTo(fx, wy - 10 - fh, fx + 3, wy - 10);
        ctx.fill();
      }
    };
    drawBurningWreck(810, 25);
    drawBurningWreck(960, 75);
    drawBurningWreck(990, 20);
    drawBurningWreck(1520, 32);
    drawBurningWreck(1650, 62);

    // === FROZEN FRONTIER DETAILS === (Enhanced Winter Environment)

    // Aurora Borealis effect at the top
    ctx.save();
    for (let a = 0; a < 4; a++) {
      const auroraY = 15 + a * 12;
      const auroraGrad = ctx.createLinearGradient(1080, 0, 1440, 0);
      const hueShift = (time * 20 + a * 30) % 360;
      auroraGrad.addColorStop(0, `hsla(${120 + hueShift * 0.2}, 80%, 60%, 0)`);
      auroraGrad.addColorStop(0.3, `hsla(${150 + hueShift * 0.3}, 70%, 55%, ${0.15 + Math.sin(time * 0.8 + a) * 0.05})`);
      auroraGrad.addColorStop(0.5, `hsla(${180 + hueShift * 0.2}, 75%, 60%, ${0.2 + Math.sin(time * 1.2 + a * 0.5) * 0.08})`);
      auroraGrad.addColorStop(0.7, `hsla(${200 + hueShift * 0.3}, 70%, 55%, ${0.15 + Math.sin(time * 0.9 + a * 0.3) * 0.05})`);
      auroraGrad.addColorStop(1, `hsla(${220 + hueShift * 0.2}, 80%, 60%, 0)`);
      ctx.fillStyle = auroraGrad;
      ctx.beginPath();
      ctx.moveTo(1080, auroraY);
      for (let ax = 1080; ax <= 1440; ax += 20) {
        const waveY = auroraY + Math.sin(time * 0.5 + ax * 0.02 + a * 0.5) * 8;
        ctx.lineTo(ax, waveY);
      }
      ctx.lineTo(1440, auroraY + 25);
      ctx.lineTo(1080, auroraY + 25);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Snow-covered mountains in background
    const drawSnowMountain = (mx: number, myPct: number, width: number, heightPx: number) => {
      const my = getY(myPct);
      const isoDepth = heightPx * 0.35; // Isometric depth

      // Shadow underneath
      ctx.fillStyle = "rgba(40, 60, 80, 0.25)";
      ctx.beginPath();
      ctx.ellipse(mx + width * 0.08, my + isoDepth * 0.4, width * 0.5, isoDepth * 0.4, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Back face (shadowed right side)
      const backGrad = ctx.createLinearGradient(mx, my - heightPx, mx + width * 0.5, my);
      backGrad.addColorStop(0, "#8a9aaa");
      backGrad.addColorStop(0.5, "#6a7a8a");
      backGrad.addColorStop(1, "#5a6a7a");
      ctx.fillStyle = backGrad;
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx); // Peak (offset for isometric)
      ctx.lineTo(mx + width * 0.45, my);
      ctx.lineTo(mx + width * 0.45, my + isoDepth * 0.4);
      ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
      ctx.closePath();
      ctx.fill();

      // Front face (lit left side) with gradient
      const mtGrad = ctx.createLinearGradient(mx - width * 0.4, my - heightPx, mx + width * 0.1, my + isoDepth);
      mtGrad.addColorStop(0, "#f0f8ff");
      mtGrad.addColorStop(0.25, "#e0eef8");
      mtGrad.addColorStop(0.5, "#c0d8e8");
      mtGrad.addColorStop(0.75, "#9aacbc");
      mtGrad.addColorStop(1, "#7a8a9a");
      ctx.fillStyle = mtGrad;
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx); // Peak
      ctx.lineTo(mx - width * 0.4, my);
      ctx.lineTo(mx - width * 0.4, my + isoDepth * 0.4);
      ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
      ctx.closePath();
      ctx.fill();

      // Isometric base edge
      ctx.fillStyle = "#6a7a8a";
      ctx.beginPath();
      ctx.moveTo(mx - width * 0.4, my + isoDepth * 0.4);
      ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
      ctx.lineTo(mx + width * 0.45, my + isoDepth * 0.4);
      ctx.quadraticCurveTo(mx + width * 0.1, my + isoDepth * 0.55, mx - width * 0.4, my + isoDepth * 0.4);
      ctx.fill();

      // Snow cap with 3D effect
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx);
      ctx.lineTo(mx + width * 0.18, my - heightPx * 0.65);
      ctx.lineTo(mx + width * 0.05, my - heightPx * 0.6);
      ctx.lineTo(mx - width * 0.1, my - heightPx * 0.68);
      ctx.closePath();
      ctx.fill();

      // Snow highlight on front face
      ctx.fillStyle = "#e8f4fc";
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx);
      ctx.lineTo(mx - width * 0.15, my - heightPx * 0.6);
      ctx.lineTo(mx - width * 0.08, my - heightPx * 0.55);
      ctx.lineTo(mx - width * 0.2, my - heightPx * 0.4);
      ctx.lineTo(mx - width * 0.12, my - heightPx * 0.35);
      ctx.lineTo(mx + width * 0.02, my - heightPx * 0.55);
      ctx.closePath();
      ctx.fill();

      // Rocky texture lines on front face
      ctx.strokeStyle = "rgba(90, 100, 110, 0.3)";
      ctx.lineWidth = 0.5;
      for (let r = 0; r < 3; r++) {
        const lineY = my - heightPx * (0.25 + r * 0.12);
        ctx.beginPath();
        ctx.moveTo(mx - width * 0.35 + r * 5, lineY);
        ctx.lineTo(mx - width * 0.1 + r * 3, lineY - heightPx * 0.08);
        ctx.stroke();
      }
    };
    drawSnowMountain(1130, 30, 35, 16);
    drawSnowMountain(1250, 25, 45, 20);
    drawSnowMountain(1350, 26, 48, 28);
    drawSnowMountain(1380, 28, 48, 28);

    drawSnowMountain(1310, 80, 68, 38);
    drawSnowMountain(1350, 82, 68, 38);

    // Detailed snow-covered pine trees
    const drawFrostedPine = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      // Shadow
      ctx.fillStyle = "rgba(40, 60, 80, 0.2)";
      ctx.beginPath();
      ctx.ellipse(x + 4 * scale, y + 4 * scale, 12 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      const trunkGrad = ctx.createLinearGradient(x - 3 * scale, y, x + 3 * scale, y);
      trunkGrad.addColorStop(0, "#3a2820");
      trunkGrad.addColorStop(0.5, "#5a4838");
      trunkGrad.addColorStop(1, "#3a2820");
      ctx.fillStyle = trunkGrad;
      ctx.fillRect(x - 3 * scale, y - 6 * scale, 6 * scale, 14 * scale);
      // Tree layers (3 tiers)
      const tiers = [
        { y: -8, w: 16, h: 18 },
        { y: -20, w: 13, h: 16 },
        { y: -30, w: 9, h: 14 },
      ];
      tiers.forEach((tier) => {
        // Green foliage
        const treeGrad = ctx.createLinearGradient(x, y + tier.y * scale - tier.h * scale, x, y + tier.y * scale);
        treeGrad.addColorStop(0, "#1a4a3a");
        treeGrad.addColorStop(1, "#2a5a4a");
        ctx.fillStyle = treeGrad;
        ctx.beginPath();
        ctx.moveTo(x, y + tier.y * scale - tier.h * scale);
        ctx.lineTo(x + tier.w * scale, y + tier.y * scale);
        ctx.lineTo(x - tier.w * scale, y + tier.y * scale);
        ctx.closePath();
        ctx.fill();
        // Snow on branches
        ctx.fillStyle = "#f0f8ff";
        ctx.beginPath();
        ctx.moveTo(x, y + tier.y * scale - tier.h * scale);
        ctx.lineTo(x + tier.w * 0.7 * scale, y + tier.y * scale - tier.h * 0.3 * scale);
        ctx.quadraticCurveTo(x + tier.w * 0.4 * scale, y + tier.y * scale - tier.h * 0.4 * scale, x, y + tier.y * scale - tier.h * 0.6 * scale);
        ctx.quadraticCurveTo(x - tier.w * 0.4 * scale, y + tier.y * scale - tier.h * 0.4 * scale, x - tier.w * 0.7 * scale, y + tier.y * scale - tier.h * 0.3 * scale);
        ctx.closePath();
        ctx.fill();
      });
      // Snow pile at base
      ctx.fillStyle = "#e8f0f8";
      ctx.beginPath();
      ctx.ellipse(x, y + 2 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    [
      [1095, 72], [1115, 55], [1140, 78], [1165, 42], [1185, 68],
      [1220, 75], [1255, 38], [1280, 62], [1305, 48], [1325, 72],
      [1355, 35], [1375, 58], [1400, 45], [1420, 68],
    ].forEach(([x, yPct], i) => {
      drawFrostedPine(x, yPct, 0.6 + seededRandom(i + 300) * 0.25);
    });

    // Ice crystal formations
    const drawIceCrystal = (cx: number, cyPct: number, scale: number) => {
      const cy = getY(cyPct);
      // Crystal glow
      const glowGrad = ctx.createRadialGradient(cx, cy - 15 * scale, 0, cx, cy - 15 * scale, 25 * scale);
      glowGrad.addColorStop(0, `rgba(150, 220, 255, ${0.2 + Math.sin(time * 2 + cx) * 0.1})`);
      glowGrad.addColorStop(1, "rgba(150, 220, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 15 * scale, 25 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Main crystal spire
      const crystalGrad = ctx.createLinearGradient(cx - 8 * scale, cy, cx + 8 * scale, cy - 35 * scale);
      crystalGrad.addColorStop(0, "rgba(180, 220, 255, 0.9)");
      crystalGrad.addColorStop(0.5, "rgba(220, 240, 255, 0.95)");
      crystalGrad.addColorStop(1, "rgba(255, 255, 255, 1)");
      ctx.fillStyle = crystalGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 35 * scale);
      ctx.lineTo(cx + 6 * scale, cy - 10 * scale);
      ctx.lineTo(cx + 4 * scale, cy + 2 * scale);
      ctx.lineTo(cx - 4 * scale, cy + 2 * scale);
      ctx.lineTo(cx - 6 * scale, cy - 10 * scale);
      ctx.closePath();
      ctx.fill();
      // Side crystals
      ctx.fillStyle = "rgba(200, 230, 255, 0.8)";
      ctx.beginPath();
      ctx.moveTo(cx - 4 * scale, cy - 8 * scale);
      ctx.lineTo(cx - 15 * scale, cy - 20 * scale);
      ctx.lineTo(cx - 6 * scale, cy - 5 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 4 * scale, cy - 12 * scale);
      ctx.lineTo(cx + 12 * scale, cy - 25 * scale);
      ctx.lineTo(cx + 6 * scale, cy - 8 * scale);
      ctx.closePath();
      ctx.fill();
      // Sparkle
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 4 + cx) * 0.4})`;
      ctx.beginPath();
      ctx.arc(cx, cy - 30 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawIceCrystal(1120, 62, 0.8);
    drawIceCrystal(1270, 48, 1);
    drawIceCrystal(1350, 72, 0.7);
    drawIceCrystal(1410, 38, 0.9);

    // Frozen lake with reflection
    const drawFrozenLake = (lx: number, lyPct: number, width: number, heightRatio: number) => {
      const ly = getY(lyPct);
      // Ice surface
      const iceGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, width);
      iceGrad.addColorStop(0, "rgba(200, 230, 255, 0.7)");
      iceGrad.addColorStop(0.5, "rgba(170, 210, 240, 0.8)");
      iceGrad.addColorStop(1, "rgba(140, 180, 220, 0.6)");
      ctx.fillStyle = iceGrad;
      ctx.beginPath();
      ctx.ellipse(lx, ly, width, width * heightRatio, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ice cracks
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      for (let c = 0; c < 5; c++) {
        const startAngle = seededRandom(lx + c) * Math.PI * 2;
        const crackLen = 15 + seededRandom(lx + c + 10) * 20;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(
          lx + Math.cos(startAngle) * crackLen,
          ly + Math.sin(startAngle) * crackLen * heightRatio
        );
        ctx.stroke();
      }
      // Shimmer spots
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 3) * 0.2})`;
      for (let s = 0; s < 3; s++) {
        const sx = lx - width * 0.4 + seededRandom(lx + s * 7) * width * 0.8;
        const sy = ly - width * heightRatio * 0.3 + seededRandom(lx + s * 11) * width * heightRatio * 0.6;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawFrozenLake(1200, 82, 45, 0.35);
    drawFrozenLake(1340, 58, 35, 0.3);

    // Igloo
    const drawIgloo = (ix: number, iyPct: number, scale: number) => {
      const iy = getY(iyPct);
      // Shadow
      ctx.fillStyle = "rgba(60, 80, 100, 0.2)";
      ctx.beginPath();
      ctx.ellipse(ix + 3 * scale, iy + 5 * scale, 22 * scale, 7 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dome
      const domeGrad = ctx.createRadialGradient(ix - 5 * scale, iy - 10 * scale, 0, ix, iy, 20 * scale);
      domeGrad.addColorStop(0, "#ffffff");
      domeGrad.addColorStop(0.5, "#e8f4fc");
      domeGrad.addColorStop(1, "#c8d8e8");
      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.arc(ix, iy - 2 * scale, 18 * scale, Math.PI, 0);
      ctx.lineTo(ix + 18 * scale, iy + 2 * scale);
      ctx.lineTo(ix - 18 * scale, iy + 2 * scale);
      ctx.closePath();
      ctx.fill();
      // Ice block lines
      ctx.strokeStyle = "rgba(150, 180, 200, 0.4)";
      ctx.lineWidth = 1;
      for (let row = 0; row < 3; row++) {
        const rowRadius = 18 * scale * Math.cos(row * 0.3);
        ctx.beginPath();
        ctx.arc(ix, iy - 2 * scale, rowRadius, Math.PI, 0);
        ctx.stroke();
      }
      // Entrance tunnel
      ctx.fillStyle = "#2a3a4a";
      ctx.beginPath();
      ctx.ellipse(ix + 18 * scale, iy - 2 * scale, 6 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d8e8f0";
      ctx.beginPath();
      ctx.arc(ix + 18 * scale, iy - 2 * scale, 6 * scale, Math.PI, 0);
      ctx.lineTo(ix + 26 * scale, iy + 2 * scale);
      ctx.lineTo(ix + 10 * scale, iy + 2 * scale);
      ctx.closePath();
      ctx.fill();
    };
    drawIgloo(1160, 50, 0.8);
    drawIgloo(1390, 75, 0.7);

    // Woolly mammoth
    const drawMammoth = (mx: number, myPct: number, scale: number, facing: number) => {
      const my = getY(myPct);
      ctx.save();
      ctx.translate(mx, my);
      ctx.scale(facing, 1);
      // Shadow
      ctx.fillStyle = "rgba(40, 60, 80, 0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 10 * scale, 25 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Body fur
      const furGrad = ctx.createLinearGradient(-20 * scale, -15 * scale, 20 * scale, 10 * scale);
      furGrad.addColorStop(0, "#5a4030");
      furGrad.addColorStop(0.5, "#6a5040");
      furGrad.addColorStop(1, "#4a3020");
      ctx.fillStyle = furGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22 * scale, 14 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fur texture
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 1;
      for (let f = 0; f < 8; f++) {
        const fx = -15 * scale + f * 4 * scale;
        ctx.beginPath();
        ctx.moveTo(fx, -8 * scale);
        ctx.quadraticCurveTo(fx + 2 * scale, 5 * scale, fx, 12 * scale);
        ctx.stroke();
      }
      // Head
      ctx.fillStyle = "#5a4030";
      ctx.beginPath();
      ctx.ellipse(18 * scale, -5 * scale, 12 * scale, 10 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      ctx.fillStyle = "#4a3020";
      ctx.beginPath();
      ctx.moveTo(26 * scale, -2 * scale);
      ctx.quadraticCurveTo(35 * scale, 5 * scale, 30 * scale, 15 * scale);
      ctx.quadraticCurveTo(28 * scale, 18 * scale, 25 * scale, 15 * scale);
      ctx.quadraticCurveTo(28 * scale, 8 * scale, 24 * scale, 0);
      ctx.fill();
      // Tusks
      ctx.fillStyle = "#f8f0e8";
      ctx.beginPath();
      ctx.moveTo(22 * scale, 2 * scale);
      ctx.quadraticCurveTo(35 * scale, -5 * scale, 40 * scale, 5 * scale);
      ctx.quadraticCurveTo(38 * scale, 8 * scale, 35 * scale, 5 * scale);
      ctx.quadraticCurveTo(30 * scale, 0, 22 * scale, 4 * scale);
      ctx.fill();
      // Eye
      ctx.fillStyle = "#1a0a00";
      ctx.beginPath();
      ctx.arc(24 * scale, -8 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Legs
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(-12 * scale, 10 * scale, 6 * scale, 14 * scale);
      ctx.fillRect(-4 * scale, 10 * scale, 6 * scale, 14 * scale);
      ctx.fillRect(6 * scale, 10 * scale, 6 * scale, 14 * scale);
      ctx.fillRect(14 * scale, 10 * scale, 6 * scale, 14 * scale);
      // Snow on back
      ctx.fillStyle = "#f0f8ff";
      ctx.beginPath();
      ctx.ellipse(-2 * scale, -12 * scale, 15 * scale, 4 * scale, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawMammoth(1230, 65, 0.5, 1);
    drawMammoth(1300, 25, 0.4, -1);

    // Enhanced snowfall with depth
    for (let layer = 0; layer < 3; layer++) {
      const speed = 20 + layer * 15;
      const size = 1 + layer * 0.8;
      const opacity = 0.3 + layer * 0.15;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      for (let i = 0; i < 20; i++) {
        const sx = 1080 + seededRandom(i * 7 + layer * 100) * 360;
        const baseY = seededRandom(i * 11 + layer * 50) * height;
        const sy = (time * speed + baseY) % height;
        const drift = Math.sin(time * 2 + i * 0.3 + layer) * (3 + layer * 2);
        ctx.beginPath();
        ctx.arc(sx + drift, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Frost overlay at edges
    ctx.save();
    const frostGrad = ctx.createLinearGradient(1080, 0, 1100, 0);
    frostGrad.addColorStop(0, "rgba(200, 230, 255, 0.15)");
    frostGrad.addColorStop(1, "rgba(200, 230, 255, 0)");
    ctx.fillStyle = frostGrad;
    ctx.fillRect(1080, 0, 40, height);
    const frostGrad2 = ctx.createLinearGradient(1420, 0, 1440, 0);
    frostGrad2.addColorStop(0, "rgba(200, 230, 255, 0)");
    frostGrad2.addColorStop(1, "rgba(200, 230, 255, 0.15)");
    ctx.fillStyle = frostGrad2;
    ctx.fillRect(1400, 0, 40, height);
    ctx.restore()

    // === INFERNO DEPTHS DETAILS === (Enhanced Volcanic Environment)

    // Hellish sky gradient overlay
    ctx.save();
    const skyGrad = ctx.createLinearGradient(1440, 0, 1440, height * 0.4);
    skyGrad.addColorStop(0, `rgba(80, 20, 10, ${0.3 + Math.sin(time * 0.5) * 0.05})`);
    skyGrad.addColorStop(0.5, `rgba(120, 40, 20, ${0.2 + Math.sin(time * 0.7) * 0.05})`);
    skyGrad.addColorStop(1, "rgba(60, 15, 8, 0)");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(1440, 0, 380, height * 0.5);
    ctx.restore();

    // Massive volcano in background
    const drawVolcano = (vx: number, vyPct: number, width: number, heightPx: number) => {
      const vy = getY(vyPct);
      // Volcano body with gradient
      const volcGrad = ctx.createLinearGradient(vx, vy - heightPx, vx, vy + 10);
      volcGrad.addColorStop(0, "#3a2020");
      volcGrad.addColorStop(0.3, "#4a2828");
      volcGrad.addColorStop(0.6, "#2a1515");
      volcGrad.addColorStop(1, "#1a0a0a");
      ctx.fillStyle = volcGrad;
      ctx.beginPath();
      ctx.moveTo(vx - width / 2, vy + 10);
      ctx.lineTo(vx - width * 0.15, vy - heightPx);
      ctx.lineTo(vx + width * 0.15, vy - heightPx);
      ctx.lineTo(vx + width / 2, vy + 10);
      ctx.closePath();
      ctx.fill();
      // Crater
      ctx.fillStyle = "#1a0808";
      ctx.beginPath();
      ctx.ellipse(vx, vy - heightPx + 5, width * 0.18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lava glow in crater
      const craterGlow = ctx.createRadialGradient(vx, vy - heightPx + 5, 0, vx, vy - heightPx + 5, width * 0.2);
      craterGlow.addColorStop(0, `rgba(255, 150, 50, ${0.6 + Math.sin(time * 3) * 0.2})`);
      craterGlow.addColorStop(0.5, `rgba(255, 80, 20, ${0.4 + Math.sin(time * 2.5) * 0.15})`);
      craterGlow.addColorStop(1, "rgba(200, 50, 10, 0)");
      ctx.fillStyle = craterGlow;
      ctx.beginPath();
      ctx.arc(vx, vy - heightPx + 5, width * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Lava streaks down the side
      ctx.strokeStyle = `rgba(255, 100, 30, ${0.5 + Math.sin(time * 2) * 0.2})`;
      ctx.lineWidth = 3;
      for (let streak = 0; streak < 4; streak++) {
        const startX = vx - width * 0.1 + streak * (width * 0.07);
        ctx.beginPath();
        ctx.moveTo(startX, vy - heightPx + 8);
        ctx.quadraticCurveTo(
          startX + (streak - 1.5) * 15,
          vy - heightPx * 0.5,
          startX + (streak - 1.5) * 25,
          vy
        );
        ctx.stroke();
      }
      // Smoke plumes from crater
      for (let s = 0; s < 5; s++) {
        const smokeTime = (time * 15 + s * 20) % 60;
        const smokeY = vy - heightPx - smokeTime;
        const smokeX = vx + Math.sin(time * 1.5 + s * 2) * (5 + smokeTime * 0.3);
        const smokeSize = 8 + smokeTime * 0.4;
        const smokeAlpha = Math.max(0, 0.4 - smokeTime / 80);
        ctx.fillStyle = `rgba(60, 50, 50, ${smokeAlpha})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawVolcano(1530, 22, 95, 35);
    drawVolcano(1700, 21, 85, 30);

    drawVolcano(1720, 24, 95, 45);

    drawVolcano(1720, 84, 95, 45);
    drawVolcano(1700, 86, 85, 30);

    // Lava pools with bubbling effect
    const drawLavaPool = (px: number, pyPct: number, width: number, heightRatio: number) => {
      const py = getY(pyPct);
      // Outer glow
      const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, width * 1.5);
      glowGrad.addColorStop(0, `rgba(255, 100, 30, ${0.25 + Math.sin(time * 2) * 0.1})`);
      glowGrad.addColorStop(0.5, `rgba(255, 60, 20, ${0.15 + Math.sin(time * 2.5) * 0.05})`);
      glowGrad.addColorStop(1, "rgba(200, 40, 10, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, width * 1.5, width * heightRatio * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pool edge (cooled lava)
      ctx.fillStyle = "#2a1a15";
      ctx.beginPath();
      ctx.ellipse(px, py, width + 4, width * heightRatio + 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Main lava surface
      const lavaGrad = ctx.createRadialGradient(px - width * 0.2, py - width * heightRatio * 0.2, 0, px, py, width);
      lavaGrad.addColorStop(0, "#ffcc44");
      lavaGrad.addColorStop(0.3, "#ff8822");
      lavaGrad.addColorStop(0.7, "#ee4411");
      lavaGrad.addColorStop(1, "#aa2200");
      ctx.fillStyle = lavaGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, width, width * heightRatio, 0, 0, Math.PI * 2);
      ctx.fill();
      // Bubbles
      for (let b = 0; b < 4; b++) {
        const bubblePhase = (time * 3 + b * 1.5 + px * 0.1) % 2;
        if (bubblePhase < 1.5) {
          const bx = px - width * 0.5 + seededRandom(px + b) * width;
          const by = py - width * heightRatio * 0.3 + seededRandom(px + b + 10) * width * heightRatio * 0.6;
          const bSize = 2 + bubblePhase * 2;
          ctx.fillStyle = `rgba(255, 200, 100, ${0.6 - bubblePhase * 0.3})`;
          ctx.beginPath();
          ctx.arc(bx, by, bSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Surface shimmer
      ctx.strokeStyle = `rgba(255, 220, 150, ${0.3 + Math.sin(time * 4) * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(px - width * 0.3, py - width * heightRatio * 0.2, width * 0.3, width * heightRatio * 0.2, 0.3, 0, Math.PI);
      ctx.stroke();
    };
    drawLavaPool(1500, 65, 30, 0.35);
    drawLavaPool(1620, 78, 25, 0.3);
    drawLavaPool(1700, 55, 35, 0.4);
    drawLavaPool(1760, 75, 28, 0.35);

    // Enhanced lava rivers with glow
    const drawLavaRiver = (points: number[][]) => {
      // Outer glow
      ctx.save();
      ctx.strokeStyle = `rgba(255, 100, 30, ${0.2 + Math.sin(time * 2) * 0.1})`;
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0][0], getY(points[0][1]));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], getY(points[i][1]));
      }
      ctx.stroke();
      // Main lava flow
      ctx.strokeStyle = `rgba(255, 80, 0, ${0.7 + Math.sin(time * 3) * 0.2})`;
      ctx.lineWidth = 8;
      ctx.stroke();
      // Hot center
      ctx.strokeStyle = `rgba(255, 200, 100, ${0.6 + Math.sin(time * 4) * 0.2})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    };
    drawLavaRiver([
      [1460, 72], [1490, 65], [1520, 68], [1560, 62], [1590, 68],
    ]);
    drawLavaRiver([
      [1480, 38], [1510, 42], [1550, 38], [1590, 45],
    ]);
    drawLavaRiver([
      [1640, 45], [1680, 50], [1720, 48], [1760, 55],
    ]);

    // Obsidian spires with glowing cracks
    const drawObsidianSpire = (sx: number, syPct: number, scale: number) => {
      const sy = getY(syPct);
      // Shadow
      ctx.fillStyle = "rgba(20, 10, 10, 0.3)";
      ctx.beginPath();
      ctx.ellipse(sx + 5 * scale, sy + 4 * scale, 12 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Spire body
      const spireGrad = ctx.createLinearGradient(sx - 10 * scale, sy, sx + 10 * scale, sy - 40 * scale);
      spireGrad.addColorStop(0, "#1a1015");
      spireGrad.addColorStop(0.3, "#2a1a20");
      spireGrad.addColorStop(0.6, "#1a1015");
      spireGrad.addColorStop(1, "#0a0508");
      ctx.fillStyle = spireGrad;
      ctx.beginPath();
      ctx.moveTo(sx - 10 * scale, sy + 2 * scale);
      ctx.lineTo(sx - 6 * scale, sy - 25 * scale);
      ctx.lineTo(sx - 2 * scale, sy - 40 * scale);
      ctx.lineTo(sx + 3 * scale, sy - 35 * scale);
      ctx.lineTo(sx + 8 * scale, sy - 18 * scale);
      ctx.lineTo(sx + 10 * scale, sy + 2 * scale);
      ctx.closePath();
      ctx.fill();
      // Glass-like reflection
      ctx.fillStyle = "rgba(80, 60, 70, 0.3)";
      ctx.beginPath();
      ctx.moveTo(sx - 7 * scale, sy - 5 * scale);
      ctx.lineTo(sx - 4 * scale, sy - 30 * scale);
      ctx.lineTo(sx - 2 * scale, sy - 28 * scale);
      ctx.lineTo(sx - 5 * scale, sy - 5 * scale);
      ctx.closePath();
      ctx.fill();
      // Glowing magma cracks
      ctx.strokeStyle = `rgba(255, 100, 30, ${0.6 + Math.sin(time * 3 + sx) * 0.3})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(sx - 4 * scale, sy - 5 * scale);
      ctx.lineTo(sx - 2 * scale, sy - 18 * scale);
      ctx.lineTo(sx + 2 * scale, sy - 25 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + 3 * scale, sy - 8 * scale);
      ctx.lineTo(sx + 5 * scale, sy - 20 * scale);
      ctx.stroke();
    };
    [
      [1475, 48], [1530, 72], [1580, 35], [1640, 62],
      [1690, 42], [1740, 68], [1780, 38],
    ].forEach(([x, yPct], i) => {
      drawObsidianSpire(x, yPct, 0.7 + seededRandom(i + 400) * 0.4);
    });

    // Demon statue/idol
    const drawDemonStatue = (dx: number, dyPct: number, scale: number) => {
      const dy = getY(dyPct);
      // Pedestal
      ctx.fillStyle = "#2a1a18";
      ctx.fillRect(dx - 12 * scale, dy - 5 * scale, 24 * scale, 10 * scale);
      ctx.fillStyle = "#3a2a28";
      ctx.fillRect(dx - 10 * scale, dy - 8 * scale, 20 * scale, 5 * scale);
      // Body
      const statueGrad = ctx.createLinearGradient(dx - 8 * scale, dy - 40 * scale, dx + 8 * scale, dy - 8 * scale);
      statueGrad.addColorStop(0, "#2a2025");
      statueGrad.addColorStop(0.5, "#3a2a30");
      statueGrad.addColorStop(1, "#1a1015");
      ctx.fillStyle = statueGrad;
      ctx.beginPath();
      ctx.moveTo(dx - 8 * scale, dy - 8 * scale);
      ctx.lineTo(dx - 6 * scale, dy - 25 * scale);
      ctx.lineTo(dx - 4 * scale, dy - 32 * scale);
      ctx.lineTo(dx + 4 * scale, dy - 32 * scale);
      ctx.lineTo(dx + 6 * scale, dy - 25 * scale);
      ctx.lineTo(dx + 8 * scale, dy - 8 * scale);
      ctx.closePath();
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.arc(dx, dy - 36 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Horns
      ctx.fillStyle = "#1a1015";
      ctx.beginPath();
      ctx.moveTo(dx - 4 * scale, dy - 40 * scale);
      ctx.lineTo(dx - 10 * scale, dy - 50 * scale);
      ctx.lineTo(dx - 6 * scale, dy - 42 * scale);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dx + 4 * scale, dy - 40 * scale);
      ctx.lineTo(dx + 10 * scale, dy - 50 * scale);
      ctx.lineTo(dx + 6 * scale, dy - 42 * scale);
      ctx.fill();
      // Glowing eyes
      ctx.fillStyle = `rgba(255, 50, 20, ${0.7 + Math.sin(time * 4 + dx) * 0.3})`;
      ctx.beginPath();
      ctx.arc(dx - 2 * scale, dy - 37 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.arc(dx + 2 * scale, dy - 37 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Eye glow
      const eyeGlow = ctx.createRadialGradient(dx, dy - 37 * scale, 0, dx, dy - 37 * scale, 10 * scale);
      eyeGlow.addColorStop(0, `rgba(255, 50, 20, ${0.2 + Math.sin(time * 3) * 0.1})`);
      eyeGlow.addColorStop(1, "rgba(255, 50, 20, 0)");
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(dx, dy - 37 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawDemonStatue(1560, 52, 0.8);
    drawDemonStatue(1720, 28, 0.7);

    // Fire elemental/spirit
    const drawFireElemental = (fx: number, fyPct: number, scale: number) => {
      const fy = getY(fyPct);
      const bob = Math.sin(time * 3 + fx) * 3;
      // Glow aura
      const auraGrad = ctx.createRadialGradient(fx, fy - 15 * scale + bob, 0, fx, fy - 15 * scale + bob, 25 * scale);
      auraGrad.addColorStop(0, `rgba(255, 150, 50, ${0.3 + Math.sin(time * 4 + fx) * 0.1})`);
      auraGrad.addColorStop(0.5, `rgba(255, 80, 20, ${0.15 + Math.sin(time * 3) * 0.05})`);
      auraGrad.addColorStop(1, "rgba(255, 50, 10, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(fx, fy - 15 * scale + bob, 25 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Body flames
      for (let f = 0; f < 5; f++) {
        const flameHeight = 20 + Math.sin(time * 6 + f * 1.2) * 8;
        const flameWidth = 8 - f * 0.8;
        const flamex = fx - 8 * scale + f * 4 * scale;
        const flamey = fy + bob;
        ctx.fillStyle = `rgba(${255 - f * 20}, ${100 + f * 30}, ${20 + f * 10}, ${0.8 - f * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(flamex - flameWidth * scale * 0.5, flamey);
        ctx.quadraticCurveTo(flamex, flamey - flameHeight * scale, flamex + flameWidth * scale * 0.5, flamey);
        ctx.fill();
      }
      // Face/eyes
      ctx.fillStyle = "#ffff88";
      ctx.beginPath();
      ctx.arc(fx - 4 * scale, fy - 12 * scale + bob, 2 * scale, 0, Math.PI * 2);
      ctx.arc(fx + 4 * scale, fy - 12 * scale + bob, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawFireElemental(1490, 55, 0.6);
    drawFireElemental(1660, 38, 0.5);
    drawFireElemental(1750, 62, 0.55);

    // Destroyed/burning fortress
    const drawBurningRuins = (rx: number, ryPct: number, scale: number) => {
      const ry = getY(ryPct);
      // Rubble base
      ctx.fillStyle = "#2a2020";
      for (let r = 0; r < 8; r++) {
        const rubX = rx - 25 * scale + seededRandom(rx + r) * 50 * scale;
        const rubY = ry + seededRandom(rx + r + 10) * 8 * scale;
        const rubSize = 4 + seededRandom(rx + r + 20) * 6;
        ctx.beginPath();
        ctx.arc(rubX, rubY, rubSize * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Standing wall sections
      const wallGrad = ctx.createLinearGradient(rx - 20 * scale, ry - 35 * scale, rx + 20 * scale, ry);
      wallGrad.addColorStop(0, "#3a2a28");
      wallGrad.addColorStop(1, "#2a1a18");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(rx - 22 * scale, ry - 30 * scale, 12 * scale, 35 * scale);
      ctx.fillRect(rx + 5 * scale, ry - 22 * scale, 14 * scale, 27 * scale);
      // Broken edges
      ctx.fillStyle = "#2a1a18";
      ctx.beginPath();
      ctx.moveTo(rx - 22 * scale, ry - 30 * scale);
      ctx.lineTo(rx - 18 * scale, ry - 35 * scale);
      ctx.lineTo(rx - 14 * scale, ry - 28 * scale);
      ctx.lineTo(rx - 10 * scale, ry - 32 * scale);
      ctx.lineTo(rx - 10 * scale, ry - 30 * scale);
      ctx.lineTo(rx - 22 * scale, ry - 30 * scale);
      ctx.fill();
      // Flames from windows/top
      for (let flame = 0; flame < 3; flame++) {
        const flameX = rx - 16 * scale + flame * 15 * scale;
        const flameY = ry - 20 * scale - flame * 5 * scale;
        const fh = 15 + Math.sin(time * 7 + flame * 1.5) * 6;
        ctx.fillStyle = `rgba(255, ${80 + flame * 40}, 20, ${0.8 - flame * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(flameX - 4 * scale, flameY);
        ctx.quadraticCurveTo(flameX, flameY - fh * scale, flameX + 4 * scale, flameY);
        ctx.fill();
      }
      // Smoke
      for (let s = 0; s < 4; s++) {
        const smokePhase = (time * 20 + s * 15) % 50;
        const smokeX = rx - 10 * scale + s * 8 * scale + Math.sin(time + s) * 5;
        const smokeY = ry - 35 * scale - smokePhase;
        const smokeSize = 6 + smokePhase * 0.3;
        ctx.fillStyle = `rgba(50, 40, 40, ${Math.max(0, 0.35 - smokePhase / 80)})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawBurningRuins(1600, 68, 0.8);

    // Ash/ember particles rising
    for (let i = 0; i < 40; i++) {
      const ex = 1440 + seededRandom(i * 13) * 380;
      const baseY = height * 0.9 - seededRandom(i * 17) * height * 0.3;
      const riseSpeed = 30 + seededRandom(i * 23) * 20;
      const ey = baseY - ((time * riseSpeed) % (height * 0.8));
      if (ey > 10 && ey < height - 10) {
        const drift = Math.sin(time * 2 + i * 0.5) * (8 + seededRandom(i) * 5);
        const size = 1.5 + seededRandom(i * 7) * 2;
        const brightness = 150 + seededRandom(i * 11) * 105;
        ctx.fillStyle = `rgba(255, ${brightness}, 50, ${0.5 + Math.sin(time * 4 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(ex + drift, ey, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Heat distortion effect overlay
    ctx.save();
    ctx.globalAlpha = 0.03 + Math.sin(time * 2) * 0.01;
    for (let h = 0; h < 8; h++) {
      const heatY = height * 0.3 + h * 15;
      ctx.fillStyle = "#ff4400";
      ctx.beginPath();
      for (let hx = 1440; hx < 1820; hx += 10) {
        const distort = Math.sin(time * 5 + hx * 0.03 + h * 0.5) * 2;
        if (hx === 1440) ctx.moveTo(hx, heatY + distort);
        else ctx.lineTo(hx, heatY + distort);
      }
      ctx.lineTo(1820, heatY + 10);
      ctx.lineTo(1440, heatY + 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Hellfire border glow at edges
    const fireGlowLeft = ctx.createLinearGradient(1440, 0, 1470, 0);
    fireGlowLeft.addColorStop(0, `rgba(255, 60, 20, ${0.15 + Math.sin(time * 2) * 0.05})`);
    fireGlowLeft.addColorStop(1, "rgba(255, 60, 20, 0)");
    ctx.fillStyle = fireGlowLeft;
    ctx.fillRect(1440, 0, 50, height);

    const fireGlowRight = ctx.createLinearGradient(1790, 0, 1820, 0);
    fireGlowRight.addColorStop(0, "rgba(255, 60, 20, 0)");
    fireGlowRight.addColorStop(1, `rgba(255, 60, 20, ${0.2 + Math.sin(time * 2.5) * 0.05})`);
    ctx.fillStyle = fireGlowRight;
    ctx.fillRect(1770, 0, 50, height)

    // === ENVIRONMENTAL DETAILS - ROADS, BRIDGES, DEBRIS ===

    // Isometric wooden bridges between regions
    const drawBridge = (bx: number, byPct: number, length: number, angle: number) => {
      const by = getY(byPct);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angle);

      // Bridge shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(length / 2, 6, length / 2 + 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bridge planks
      const plankWidth = 8;
      for (let p = 0; p < length / plankWidth; p++) {
        const px = p * plankWidth;
        const plankY = Math.sin(p * 0.3) * 1; // Slight wave
        ctx.fillStyle = p % 2 === 0 ? "#5a4030" : "#4a3020";
        ctx.fillRect(px, plankY - 3, plankWidth - 1, 6);
        // Plank edge highlight
        ctx.fillStyle = "#6a5040";
        ctx.fillRect(px, plankY - 3, plankWidth - 1, 1);
      }

      // Bridge railings
      ctx.fillStyle = "#3a2510";
      ctx.fillRect(0, -6, length, 2);
      ctx.fillRect(0, 4, length, 2);
      // Railing posts
      for (let post = 0; post <= length; post += 15) {
        ctx.fillRect(post - 1, -8, 2, 4);
        ctx.fillRect(post - 1, 4, 2, 4);
      }

      ctx.restore();
    };

    // Bridges at region borders
    drawBridge(375, 58, 50, -0.1);
    drawBridge(715, 48, 45, 0.05);
    drawBridge(1075, 55, 50, 0.08);
    drawBridge(1445, 52, 48, -0.05);

    // Dirt road paths (worn into the ground)
    const drawRoadSegment = (points: [number, number][]) => {
      if (points.length < 2) return;

      // Road shadow/depth
      ctx.strokeStyle = "rgba(30, 20, 10, 0.3)";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0][0], getY(points[0][1]));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], getY(points[i][1]));
      }
      ctx.stroke();

      // Main road surface
      ctx.strokeStyle = "rgba(80, 60, 40, 0.25)";
      ctx.lineWidth = 14;
      ctx.stroke();

      // Road wear (center line)
      ctx.strokeStyle = "rgba(60, 45, 30, 0.2)";
      ctx.lineWidth = 6;
      ctx.stroke();
    };

    // Main travel routes
    drawRoadSegment([[50, 50], [100, 50], [150, 45], [200, 48]]);
    drawRoadSegment([[200, 48], [250, 52], [310, 55]]);
    drawRoadSegment([[440, 50], [500, 55], [560, 52], [620, 48]]);
    drawRoadSegment([[780, 50], [850, 55], [920, 52], [980, 50]]);
    drawRoadSegment([[1140, 50], [1200, 48], [1270, 52], [1340, 55]]);
    drawRoadSegment([[1520, 55], [1580, 52], [1650, 55], [1720, 50]]);

    // Scattered rocks and boulders
    const drawBoulder = (bx: number, byPct: number, size: number) => {
      const by = getY(byPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(bx + 2, by + size * 0.3, size * 1.2, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Boulder body with 3D shading
      const boulderGrad = ctx.createRadialGradient(bx - size * 0.2, by - size * 0.3, 0, bx, by, size);
      boulderGrad.addColorStop(0, "#6a5a4a");
      boulderGrad.addColorStop(0.6, "#4a3a2a");
      boulderGrad.addColorStop(1, "#2a1a0a");
      ctx.fillStyle = boulderGrad;
      ctx.beginPath();
      ctx.ellipse(bx, by, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = "rgba(120, 100, 80, 0.3)";
      ctx.beginPath();
      ctx.ellipse(bx - size * 0.3, by - size * 0.2, size * 0.3, size * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    // Scatter boulders across the map
    [
      [60, 85, 8], [130, 18, 6], [210, 72, 7], [280, 28, 5],
      [400, 85, 6], [470, 18, 8], [590, 82, 5], [660, 22, 7],
      [740, 80, 6], [820, 25, 5], [910, 78, 7], [1030, 22, 6],
      [1100, 82, 5], [1180, 80, 7], [1250, 28, 6], [1380, 75, 5],
      [1460, 22, 8], [1550, 85, 6], [1640, 25, 7], [1710, 80, 5],
    ].forEach(([x, y, size]) => {
      drawBoulder(x, y, size);
    });

    // Wagon wheels and debris (signs of battle and travel)
    const drawWagonWheel = (wx: number, wyPct: number, size: number, rotation: number) => {
      const wy = getY(wyPct);
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(rotation);
      // Wheel rim
      ctx.strokeStyle = "#4a3020";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.stroke();
      // Spokes
      for (let s = 0; s < 8; s++) {
        const angle = (s / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size * 0.5);
        ctx.stroke();
      }
      // Hub
      ctx.fillStyle = "#3a2010";
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Broken wagon wheels scattered around
    drawWagonWheel(155, 68, 8, 0.5);
    drawWagonWheel(295, 35, 6, 1.2);
    drawWagonWheel(485, 72, 7, 0.8);
    drawWagonWheel(715, 28, 6, 2.1);
    drawWagonWheel(945, 70, 8, 0.3);
    drawWagonWheel(1165, 32, 7, 1.8);
    drawWagonWheel(1395, 68, 6, 0.9);
    drawWagonWheel(1605, 25, 8, 1.5);

    // Scattered arrows in the ground
    const drawArrow = (ax: number, ayPct: number, angle: number) => {
      const ay = getY(ayPct);
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(angle);
      // Arrow shaft sticking up from ground
      ctx.strokeStyle = "#5a4030";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -12);
      ctx.stroke();
      // Fletching
      ctx.fillStyle = "#3a2010";
      ctx.beginPath();
      ctx.moveTo(-2, -10);
      ctx.lineTo(0, -12);
      ctx.lineTo(2, -10);
      ctx.lineTo(0, -8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Arrows scattered across battlefields
    for (let i = 0; i < 40; i++) {
      const ax = seededRandom(i * 23) * width;
      const ay = 25 + seededRandom(i * 23 + 1) * 55;
      const angle = (seededRandom(i * 23 + 2) - 0.5) * 0.6;
      drawArrow(ax, ay, angle);
    }

    // Shields and helmets on ground
    const drawFallenShield = (sx: number, syPct: number, isEnemy: boolean) => {
      const sy = getY(syPct);
      ctx.fillStyle = isEnemy ? "#5a1010" : "#8a6a20";
      ctx.beginPath();
      ctx.ellipse(sx, sy, 5, 3, seededRandom(sx) * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isEnemy ? "#8a0000" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(sx, sy - 0.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    };

    for (let i = 0; i < 25; i++) {
      const sx = seededRandom(i * 31) * width;
      const sy = 30 + seededRandom(i * 31 + 1) * 50;
      drawFallenShield(sx, sy, seededRandom(i * 31 + 2) > 0.5);
    }

    // === ENHANCED BATTLE SCENES ===
    const drawBattleScene = (
      x: number,
      yPct: number,
      flip: boolean,
      intensity: number
    ) => {
      const y = getY(yPct);
      const t = time * 4 + x;

      // Battle dust cloud
      ctx.fillStyle = "rgba(100, 80, 60, 0.15)";
      ctx.beginPath();
      ctx.ellipse(x, y + 4, 25 + intensity * 8, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let s = 0; s < intensity; s++) {
        const offset = s * 20 * (flip ? -1 : 1);
        const combatSway = Math.sin(t + s * 1.5) * 3;

        // Friendly soldier (orange) - more detailed
        const sx1 = x + offset + (flip ? 10 : -10) + combatSway;
        const bob1 = Math.sin(t * 2 + s) * 1.5;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(sx1, y + 6, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.ellipse(sx1, y + bob1, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(sx1, y - 9 + bob1, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.arc(sx1, y - 11 + bob1, 4, Math.PI, 0);
        ctx.fill();

        // Face details
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(sx1 + (flip ? -1.5 : 1.5), y - 9 + bob1, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Shield
        ctx.fillStyle = "#92400e";
        const shieldX = sx1 + (flip ? 5 : -5);
        ctx.beginPath();
        ctx.ellipse(shieldX, y - 2 + bob1, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(shieldX, y - 2 + bob1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Sword with swing animation
        const swordAngle = Math.sin(t * 3 + s) * 0.8;
        ctx.save();
        ctx.translate(sx1 + (flip ? -4 : 4), y - 4 + bob1);
        ctx.rotate(swordAngle * (flip ? -1 : 1));
        ctx.fillStyle = "#c0c0c0";
        ctx.fillRect(-1, -12, 2, 12);
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(-1.5, -2, 3, 3);
        ctx.restore();

        // Enemy soldier (red) - more detailed
        const sx2 = x + offset + (flip ? -10 : 10) + Math.sin(t + 1 + s) * 2;
        const bob2 = Math.sin(t * 2 + s + 1) * 1.5;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(sx2, y + 6, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = "#991b1b";
        ctx.beginPath();
        ctx.ellipse(sx2, y + bob2, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(sx2, y - 9 + bob2, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Horned helmet
        ctx.fillStyle = "#450a0a";
        ctx.beginPath();
        ctx.arc(sx2, y - 11 + bob2, 4, Math.PI, 0);
        ctx.fill();
        // Horns
        ctx.fillStyle = "#1a0a0a";
        ctx.beginPath();
        ctx.moveTo(sx2 - 4, y - 13 + bob2);
        ctx.lineTo(sx2 - 6, y - 18 + bob2);
        ctx.lineTo(sx2 - 2, y - 13 + bob2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx2 + 4, y - 13 + bob2);
        ctx.lineTo(sx2 + 6, y - 18 + bob2);
        ctx.lineTo(sx2 + 2, y - 13 + bob2);
        ctx.fill();

        // Glowing red eyes
        ctx.fillStyle = "#ff0000";
        ctx.globalAlpha = 0.8 + Math.sin(t * 5) * 0.2;
        ctx.beginPath();
        ctx.arc(sx2 + (flip ? 1.5 : -1.5), y - 9 + bob2, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Enemy weapon (axe/spear)
        const weaponAngle = Math.sin(t * 3 + s + 1.5) * 0.6;
        ctx.save();
        ctx.translate(sx2 + (flip ? 4 : -4), y - 4 + bob2);
        ctx.rotate(weaponAngle * (flip ? 1 : -1));
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(-1, -14, 2, 14);
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.moveTo(-4, -14);
        ctx.lineTo(0, -18);
        ctx.lineTo(4, -14);
        ctx.lineTo(0, -12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Sparks from clashing weapons
      const sparkIntensity = Math.sin(t * 3);
      if (sparkIntensity > 0.2) {
        ctx.fillStyle = "#ffd700";
        for (let i = 0; i < 5; i++) {
          const sparkX = x + (seededRandom(x + i + Math.floor(t)) - 0.5) * 20;
          const sparkY = y - 5 + (seededRandom(x + i + 10 + Math.floor(t)) - 0.5) * 15;
          const sparkSize = 1 + seededRandom(i + x) * 1.5;
          ctx.globalAlpha = sparkIntensity * 0.8;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Blood splatters (subtle)
      ctx.fillStyle = "rgba(139, 0, 0, 0.15)";
      for (let i = 0; i < 3; i++) {
        const bx = x + (seededRandom(x + i * 7) - 0.5) * 30;
        const by = y + 4 + seededRandom(x + i * 7 + 1) * 4;
        ctx.beginPath();
        ctx.ellipse(bx, by, 2 + seededRandom(i) * 3, 1, seededRandom(i) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Fallen soldiers (corpses and debris)
    const drawFallenSoldier = (fx: number, fyPct: number, isEnemy: boolean) => {
      const fy = getY(fyPct);
      ctx.fillStyle = isEnemy ? "rgba(139, 0, 0, 0.5)" : "rgba(180, 100, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(fx, fy, 6, 3, seededRandom(fx) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      // Dropped weapon
      ctx.strokeStyle = "#5a5a5a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(fx - 4, fy + 1);
      ctx.lineTo(fx + 8, fy - 2);
      ctx.stroke();
    };
    // Scatter fallen soldiers across the map
    [
      [150, 50, true], [200, 62, false], [290, 40, true],
      [460, 60, false], [530, 40, true], [590, 55, true],
      [780, 35, false], [870, 68, true], [950, 50, false],
      [1100, 65, true], [1220, 45, false], [1310, 58, true],
      [1480, 40, false], [1560, 70, true], [1680, 55, false],
    ].forEach(([x, y, isEnemy]) => {
      drawFallenSoldier(x as number, y as number, isEnemy as boolean);
    });

    // Multiple battle scenes across regions
    drawBattleScene(165, 42, false, 2);
    drawBattleScene(310, 72, true, 3);
    drawBattleScene(480, 35, false, 2);
    drawBattleScene(610, 68, true, 2);
    drawBattleScene(840, 55, false, 3);
    drawBattleScene(1050, 38, true, 2);
    drawBattleScene(1200, 62, false, 2);
    drawBattleScene(1340, 68, true, 3);
    drawBattleScene(1520, 25, false, 2);
    drawBattleScene(1670, 75, true, 3);

    // === ENHANCED KINGDOM CASTLES ===
    const drawKingdomCastle = (x: number, yPct: number, isEnemy: boolean) => {
      const y = getY(yPct);
      const color1 = isEnemy ? "#4a2020" : "#5a4a3a";
      const color2 = isEnemy ? "#3a1010" : "#4a3a2a";
      const color3 = isEnemy ? "#2a0808" : "#3a2a1a";
      const accent = isEnemy ? "#8b0000" : "#f59e0b";
      const accentGlow = isEnemy ? "#ff4400" : "#ffcc00";

      // Large ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(x + 8, y + 15, 55, 18, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Castle moat/trench
      ctx.fillStyle = isEnemy ? "rgba(100, 20, 0, 0.3)" : "rgba(60, 80, 100, 0.3)";
      ctx.beginPath();
      ctx.ellipse(x, y + 12, 48, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer walls (3D effect)
      const wallGrad = ctx.createLinearGradient(x - 45, 0, x + 45, 0);
      wallGrad.addColorStop(0, color3);
      wallGrad.addColorStop(0.2, color2);
      wallGrad.addColorStop(0.5, color1);
      wallGrad.addColorStop(0.8, color2);
      wallGrad.addColorStop(1, color3);
      ctx.fillStyle = wallGrad;
      ctx.fillRect(x - 42, y - 30, 84, 40);

      // Wall stone texture
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.5;
      for (let row = 0; row < 6; row++) {
        const wy = y - 28 + row * 7;
        ctx.beginPath();
        ctx.moveTo(x - 42, wy);
        ctx.lineTo(x + 42, wy);
        ctx.stroke();
        for (let col = 0; col < 10; col++) {
          const offset = row % 2 === 0 ? 0 : 4;
          ctx.beginPath();
          ctx.moveTo(x - 42 + col * 9 + offset, wy);
          ctx.lineTo(x - 42 + col * 9 + offset, wy + 7);
          ctx.stroke();
        }
      }

      // Left tower with 3D shading
      const leftTowerGrad = ctx.createLinearGradient(x - 48, 0, x - 26, 0);
      leftTowerGrad.addColorStop(0, color3);
      leftTowerGrad.addColorStop(0.4, color2);
      leftTowerGrad.addColorStop(1, color1);
      ctx.fillStyle = leftTowerGrad;
      ctx.fillRect(x - 48, y - 65, 22, 75);

      // Right tower
      const rightTowerGrad = ctx.createLinearGradient(x + 26, 0, x + 48, 0);
      rightTowerGrad.addColorStop(0, color1);
      rightTowerGrad.addColorStop(0.6, color2);
      rightTowerGrad.addColorStop(1, color3);
      ctx.fillStyle = rightTowerGrad;
      ctx.fillRect(x + 26, y - 65, 22, 75);

      // Tower battlements (3D)
      for (let i = 0; i < 4; i++) {
        // Left tower
        ctx.fillStyle = color2;
        ctx.fillRect(x - 48 + i * 6, y - 73, 5, 9);
        ctx.fillStyle = color1;
        ctx.fillRect(x - 48 + i * 6, y - 73, 4, 8);
        // Right tower
        ctx.fillStyle = color2;
        ctx.fillRect(x + 26 + i * 6, y - 73, 5, 9);
        ctx.fillStyle = color1;
        ctx.fillRect(x + 26 + i * 6, y - 73, 4, 8);
      }

      // Tower roofs
      ctx.fillStyle = isEnemy ? "#3a1515" : "#4a3520";
      ctx.beginPath();
      ctx.moveTo(x - 37, y - 85);
      ctx.lineTo(x - 50, y - 70);
      ctx.lineTo(x - 24, y - 70);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 37, y - 85);
      ctx.lineTo(x + 24, y - 70);
      ctx.lineTo(x + 50, y - 70);
      ctx.closePath();
      ctx.fill();

      // Main keep (central tower)
      const keepGrad = ctx.createLinearGradient(x - 18, 0, x + 18, 0);
      keepGrad.addColorStop(0, color2);
      keepGrad.addColorStop(0.3, color1);
      keepGrad.addColorStop(0.7, color1);
      keepGrad.addColorStop(1, color2);
      ctx.fillStyle = keepGrad;
      ctx.fillRect(x - 18, y - 85, 36, 95);

      // Keep battlements
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = color2;
        ctx.fillRect(x - 18 + i * 6, y - 93, 5, 9);
        ctx.fillStyle = color1;
        ctx.fillRect(x - 18 + i * 6, y - 93, 4, 8);
      }

      // Flag pole and banner
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(x - 1.5, y - 118, 3, 28);
      ctx.fillStyle = accent;
      const fw1 = Math.sin(time * 3 + x) * 4;
      const fw2 = Math.sin(time * 3.3 + x) * 3;
      ctx.beginPath();
      ctx.moveTo(x + 1.5, y - 116);
      ctx.quadraticCurveTo(x + 14, y - 110 + fw1, x + 26, y - 104 + fw2);
      ctx.quadraticCurveTo(x + 14, y - 98 + fw1, x + 1.5, y - 92);
      ctx.closePath();
      ctx.fill();
      // Banner emblem
      ctx.fillStyle = isEnemy ? "#1a0000" : "#1a1a00";
      ctx.beginPath();
      ctx.arc(x + 12, y - 104 + fw1 * 0.5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x + 12, y - 104 + fw1 * 0.5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Windows with warm light
      const windowGlowIntensity = 0.5 + Math.sin(time * 2 + x) * 0.25;
      ctx.fillStyle = accentGlow;
      ctx.globalAlpha = windowGlowIntensity;

      // Keep windows
      ctx.fillRect(x - 8, y - 70, 16, 20);
      // Cross dividers
      ctx.globalAlpha = 1;
      ctx.fillStyle = color2;
      ctx.fillRect(x - 0.5, y - 70, 1, 20);
      ctx.fillRect(x - 8, y - 61, 16, 1);

      // Tower windows
      ctx.fillStyle = accentGlow;
      ctx.globalAlpha = windowGlowIntensity * 0.8;
      ctx.fillRect(x - 42, y - 50, 10, 14);
      ctx.fillRect(x + 32, y - 50, 10, 14);
      ctx.globalAlpha = 1;

      // Window glow effect
      const glowGrad = ctx.createRadialGradient(x, y - 60, 0, x, y - 60, 30);
      glowGrad.addColorStop(0, `${accentGlow}40`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y - 60, 30, 0, Math.PI * 2);
      ctx.fill();

      // Main gate (arched door)
      ctx.fillStyle = "#1a0a0a";
      ctx.beginPath();
      ctx.moveTo(x - 14, y + 10);
      ctx.lineTo(x - 14, y - 12);
      ctx.arc(x, y - 12, 14, Math.PI, 0);
      ctx.lineTo(x + 14, y + 10);
      ctx.closePath();
      ctx.fill();

      // Gate portcullis (iron bars)
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 5, y - 20);
        ctx.lineTo(x + i * 5, y + 8);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 5);
      ctx.lineTo(x + 12, y - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 12, y + 3);
      ctx.lineTo(x + 12, y + 3);
      ctx.stroke();

      // Smoke from chimneys
      for (let c = 0; c < 2; c++) {
        const cx = x + (c === 0 ? -37 : 37);
        for (let s = 0; s < 3; s++) {
          const sy = y - 85 - ((time * 12 + s * 8 + c * 20) % 25);
          const sx = cx + Math.sin(time * 1.5 + s + c) * 3;
          ctx.globalAlpha = 0.25 - ((time * 12 + s * 8 + c * 20) % 25) / 80;
          ctx.fillStyle = "#666";
          ctx.beginPath();
          ctx.arc(sx, sy, 3 + s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Guards on towers
      for (let g = 0; g < 2; g++) {
        const gx = x + (g === 0 ? -37 : 37);
        const sway = Math.sin(time * 0.5 + g * 2) * 1;
        ctx.fillStyle = isEnemy ? "#8b0000" : "#f59e0b";
        ctx.beginPath();
        ctx.arc(gx + sway, y - 77, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isEnemy ? "#5a0000" : "#b45309";
        ctx.fillRect(gx - 2 + sway, y - 74, 4, 6);
        // Spear
        ctx.strokeStyle = "#6a6a6a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx + 3 + sway, y - 78);
        ctx.lineTo(gx + 3 + sway, y - 90);
        ctx.stroke();
        ctx.fillStyle = "#9a9a9a";
        ctx.beginPath();
        ctx.moveTo(gx + 1 + sway, y - 90);
        ctx.lineTo(gx + 3 + sway, y - 95);
        ctx.lineTo(gx + 5 + sway, y - 90);
        ctx.fill();
      }

      // Castle name label with shadow
      ctx.font = "bold 11px 'bc-novatica-cyr', serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillText(
        isEnemy ? "ENEMY STRONGHOLD" : "YOUR KINGDOM",
        x + 1,
        y + 32
      );
      ctx.fillStyle = accent;
      ctx.fillText(isEnemy ? "ENEMY STRONGHOLD" : "YOUR KINGDOM", x, y + 31);
    };

    drawKingdomCastle(70, 50, false);
    drawKingdomCastle(MAP_WIDTH - 70, 50, true);

    // --- PATH CONNECTIONS ---
    WORLD_LEVELS.forEach((level) => {
      const fromX = level.x;
      const fromY = getY(level.y);

      level.connectsTo.forEach((toId) => {
        const toLevel = getLevelById(toId);
        if (!toLevel) return;
        const toX = toLevel.x;
        const toY = getY(toLevel.y);
        const isUnlocked = isLevelUnlocked(level.id) && isLevelUnlocked(toId);
        const isPartial = isLevelUnlocked(level.id) || isLevelUnlocked(toId);

        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2 - 12;

        // Shadow
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 9;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fromX + 2, fromY + 2);
        ctx.quadraticCurveTo(midX + 2, midY + 2, toX + 2, toY + 2);
        ctx.stroke();

        // Path
        ctx.strokeStyle = isUnlocked
          ? "#c9a227"
          : isPartial
            ? "#6a5a4a"
            : "#3a3020";
        ctx.lineWidth = isUnlocked ? 7 : 5;
        ctx.setLineDash(isUnlocked ? [] : [7, 5]);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.quadraticCurveTo(midX, midY, toX, toY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Marching dots
        if (isUnlocked) {
          const dotPos = (time * 0.5) % 1;
          const dx = fromX + (toX - fromX) * dotPos;
          const dy =
            fromY + (toY - fromY) * dotPos - Math.sin(dotPos * Math.PI) * 12;
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });

    // --- LEVEL NODES ---
    WORLD_LEVELS.forEach((level) => {
      const x = level.x;
      const y = getY(level.y);
      const isUnlocked = isLevelUnlocked(level.id);
      const isHovered = hoveredLevel === level.id;
      const isSelected = selectedLevel === level.id;
      const stars = levelStars[level.id] || 0;
      const size = isHovered || isSelected ? 28 : 24;

      // Glow
      if (isSelected) {
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 25;
      } else if (isHovered && isUnlocked) {
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur = 15;
      }

      // Victory flag
      if (stars > 0) {
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(x - 2, y - 42, 4, 22);
        const flagColor =
          level.region === "grassland"
            ? "#228b22"
            : level.region === "swamp"
              ? "#5f9ea0"
              : level.region === "desert"
                ? "#daa520"
                : level.region === "winter"
                  ? "#4682b4"
                  : "#8b0000";
        ctx.fillStyle = flagColor;
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 40);
        ctx.lineTo(x + 16, y - 34);
        ctx.lineTo(x + 2, y - 26);
        ctx.closePath();
        ctx.fill();
      }

      // Node shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, size + 2, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      const ringGrad = ctx.createRadialGradient(x, y, size - 4, x, y, size + 1);
      if (isUnlocked) {
        ringGrad.addColorStop(0, stars > 0 ? "#5a7040" : "#6a5a4a");
        ringGrad.addColorStop(1, stars > 0 ? "#3a5020" : "#4a3a2a");
      } else {
        ringGrad.addColorStop(0, "#3a3a3a");
        ringGrad.addColorStop(1, "#2a2a2a");
      }
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = ringGrad;
      ctx.fill();
      ctx.strokeStyle = isSelected
        ? "#ffd700"
        : isHovered
          ? "#ffcc00"
          : isUnlocked
            ? "#8b7355"
            : "#4a4a4a";
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner circle
      ctx.beginPath();
      ctx.arc(x, y, size - 6, 0, Math.PI * 2);
      ctx.fillStyle = isUnlocked
        ? stars > 0
          ? "#4a6030"
          : "#5a4a3a"
        : "#2a2520";
      ctx.fill();

      // Region icon
      if (isUnlocked) {
        ctx.fillStyle =
          level.region === "grassland"
            ? "#6abe30"
            : level.region === "swamp"
              ? "#5f9ea0"
              : level.region === "desert"
                ? "#e8a838"
                : level.region === "winter"
                  ? "#88c8e8"
                  : level.region === "volcanic"
                    ? "#e84848"
                    : "#e84848";
        ctx.globalAlpha = 0.8;
        if (level.region === "grassland") {
          ctx.beginPath();
          ctx.moveTo(x, y - 8);
          ctx.lineTo(x + 7, y + 5);
          ctx.lineTo(x - 7, y + 5);
          ctx.closePath();
          ctx.fill();
        } else if (level.region === "swamp") {
          ctx.beginPath();
          ctx.ellipse(x, y, 6, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (level.region === "desert") {
          ctx.beginPath();
          ctx.moveTo(x, y - 7);
          ctx.lineTo(x + 8, y + 5);
          ctx.lineTo(x - 8, y + 5);
          ctx.closePath();
          ctx.fill();
        } else if (level.region === "winter") {
          for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((i * Math.PI) / 3);
            ctx.fillRect(-1.5, -8, 3, 16);
            ctx.restore();
          }
        } else if (level.region === "volcanic") {
          ctx.beginPath();
          ctx.moveTo(x, y - 8);
          ctx.lineTo(x + 5, y + 5);
          ctx.lineTo(x - 5, y + 5);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(x, y - 8);
          ctx.quadraticCurveTo(x + 7, y - 2, x + 5, y + 5);
          ctx.quadraticCurveTo(x, y + 2, x - 5, y + 5);
          ctx.quadraticCurveTo(x - 7, y - 2, x, y - 8);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Difficulty dots
        for (let d = 0; d < 3; d++) {
          ctx.beginPath();
          ctx.arc(x - 6 + d * 6, y + size + 6, 2.5, 0, Math.PI * 2);
          ctx.fillStyle =
            d < level.difficulty
              ? level.difficulty === 1
                ? "#4ade80"
                : level.difficulty === 2
                  ? "#fbbf24"
                  : "#ef4444"
              : "#4a4a4a";
          ctx.fill();
        }

        // Stars
        for (let s = 0; s < 3; s++) {
          const sx = x - 10 + s * 10;
          const sy = y + size + 16;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const px = sx + Math.cos(angle) * 4.5;
            const py = sy + Math.sin(angle) * 4.5;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = stars > s ? "#ffd700" : "#3a3020";
          ctx.fill();
        }
      } else {
        // Lock icon
        ctx.fillStyle = "#5a5a5a";
        ctx.fillRect(x - 5, y, 10, 8);
        ctx.strokeStyle = "#5a5a5a";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y - 2, 4, Math.PI, 0);
        ctx.stroke();
      }

    });

    // --- MARCHING ENEMIES near selected level ---
    if (selectedLevel) {
      const level = getLevelById(selectedLevel);
      if (level) {
        const lx = level.x;
        const ly = getY(level.y);

        for (let i = 0; i < 5; i++) {
          const offset = i * 16;
          const ex = lx + 50 + offset + Math.sin(time * 3 + i) * 3;
          const ey = ly + 6 + Math.sin(time * 2 + i * 0.7) * 2;
          const bobble = Math.sin(time * 6 + i * 2) * 2;

          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(ex, ey + 10, 5, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = ["#4a1515", "#3a1010", "#5a2020"][i % 3];
          ctx.beginPath();
          ctx.ellipse(ex, ey + bobble, 6, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex, ey - 11 + bobble, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ff3333";
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(ex - 2, ey - 12 + bobble, 1.5, 0, Math.PI * 2);
          ctx.arc(ex + 2, ey - 12 + bobble, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.font = "bold 10px 'bc-novatica-cyr', serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(180, 20, 20, 0.9)";
        ctx.fillText("⚔ ENEMIES APPROACH!", lx + 45, ly - 24);
      }
    }

    // Tooltip with Preview Image - only show on hover (drawn after enemies so it's on top)
    if (hoveredLevel) {
      const level = getLevelById(hoveredLevel);
      if (level && isLevelUnlocked(level.id)) {
        const x = level.x;
        const y = getY(level.y);
        const size = 28;

        const cardWidth = 150;
        const cardHeight = 110;
        const cardX = x - cardWidth / 2;

        // Determine if tooltip should appear above or below based on level Y position
        const showBelow = level.y < 50;
        const cardY = showBelow
          ? y + size + 12
          : y - size - cardHeight - 12;

        // Draw Background
        ctx.save();
        ctx.fillStyle = "rgba(12, 10, 8, 0.95)";
        ctx.strokeStyle = "#a0824d";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 6);
        ctx.fill();
        ctx.stroke();

        // Draw Image
        const lvlData = LEVEL_DATA[level.id];
        if (lvlData?.previewImage) {
          if (!imageCache.current[level.id]) {
            const img = new Image();
            img.src = lvlData.previewImage;
            imageCache.current[level.id] = img;
          }
          const img = imageCache.current[level.id];

          if (img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(
              cardX + 2,
              cardY + 2,
              cardWidth - 4,
              cardHeight - 24,
              [4, 4, 0, 0]
            );
            ctx.clip();
            ctx.drawImage(
              img,
              cardX + 2,
              cardY + 2,
              cardWidth - 4,
              cardHeight - 24
            );
            ctx.restore();
          } else {
            ctx.fillStyle = "#222";
            ctx.fillRect(cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 24);
          }
        }

        // Draw Text
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.font = "bold 11px 'bc-novatica-cyr', serif";
        ctx.fillText(level.name, x, cardY + cardHeight - 8);

        ctx.restore();
      }
    }

    // Fog edges
    const leftFog = ctx.createLinearGradient(0, 0, 50, 0);
    leftFog.addColorStop(0, "rgba(25, 15, 5, 0.95)");
    leftFog.addColorStop(1, "rgba(25, 15, 5, 0)");
    ctx.fillStyle = leftFog;
    ctx.fillRect(0, 0, 50, height);

    const rightFog = ctx.createLinearGradient(width - 50, 0, width, 0);
    rightFog.addColorStop(0, "rgba(25, 15, 5, 0)");
    rightFog.addColorStop(1, "rgba(25, 15, 5, 0.95)");
    ctx.fillStyle = rightFog;
    ctx.fillRect(width - 50, 0, 50, height);

    const bottomFog = ctx.createLinearGradient(0, height - 35, 0, height);
    bottomFog.addColorStop(0, "rgba(25, 15, 5, 0)");
    bottomFog.addColorStop(1, "rgba(25, 15, 5, 0.9)");
    ctx.fillStyle = bottomFog;
    ctx.fillRect(0, height - 35, width, 35);
  }, [
    mapHeight,
    hoveredLevel,
    selectedLevel,
    levelStars,
    animTime,
    seededRandom,
    getY,
    isLevelUnlocked,
    getLevelById,
  ]);

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const animate = (timestamp: number) => {
      if (timestamp - lastTime > 35) {
        setAnimTime(timestamp / 1000);
        lastTime = timestamp;
      }
      drawMap();
      animationId = requestAnimationFrame(animate);
    };
    animate(0);
    return () => cancelAnimationFrame(animationId);
  }, [drawMap]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = mapHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let found = false;
    for (const level of WORLD_LEVELS) {
      const ly = getY(level.y);
      const dist = Math.sqrt((mouseX - level.x) ** 2 + (mouseY - ly) ** 2);
      if (dist < 28) {
        setHoveredLevel(level.id);
        found = true;
        break;
      }
    }
    if (!found) setHoveredLevel(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't process click if we were actually dragging (moved more than threshold)
    if (hasDragged) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = mapHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    for (const level of WORLD_LEVELS) {
      const ly = getY(level.y);
      const dist = Math.sqrt((mouseX - level.x) ** 2 + (mouseY - ly) ** 2);
      if (dist < 28) {
        handleLevelClick(level.id);
        return;
      }
    }
    setSelectedLevel(null);
  };

  // Drag-to-scroll handlers (mouse)
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStartX(e.pageX - container.offsetLeft);
    setScrollStartLeft(container.scrollLeft);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragStartX) * 1.5; // Multiply for faster scrolling
    // Only consider it a drag if moved more than 5 pixels
    if (Math.abs(x - dragStartX) > 5) {
      setHasDragged(true);
    }
    container.scrollLeft = scrollStartLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Reset hasDragged after a short delay to allow click handler to check it
    setTimeout(() => setHasDragged(false), 50);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStartX(e.touches[0].pageX - container.offsetLeft);
    setScrollStartLeft(container.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    if (Math.abs(x - dragStartX) > 5) {
      setHasDragged(true);
    }
    container.scrollLeft = scrollStartLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => setHasDragged(false), 50);
  };

  const heroOptions: HeroType[] = [
    "tiger",
    "tenor",
    "mathey",
    "rocky",
    "scott",
    "captain",
    "engineer",
  ];
  const spellOptions: SpellType[] = [
    "fireball",
    "lightning",
    "freeze",
    "payday",
    "reinforcements",
  ];
  const canStart = selectedLevel && selectedHero && selectedSpells.length === 3;
  const currentLevel = selectedLevel ? getLevelById(selectedLevel) : null;
  const waveCount = selectedLevel ? getWaveCount(selectedLevel) : 0;

  function goToNextLevel() {
    // If no level is selected, go to level 1
    if (!currentLevel) {
      handleLevelClick(WORLD_LEVELS[0].id);
      return;
    }
    const unlockedLevels = WORLD_LEVELS.filter((lvl) =>
      isLevelUnlocked(lvl.id)
    ).map((lvl) => lvl.id);
    const currentIndex = unlockedLevels.indexOf(currentLevel.id);
    if (currentIndex === unlockedLevels.length - 1) {
      const firstLevelId = unlockedLevels[0];
      handleLevelClick(firstLevelId);
      return;
    }
    if (currentIndex < unlockedLevels.length - 1) {
      const nextLevelId = unlockedLevels[currentIndex + 1];
      handleLevelClick(nextLevelId);
    }
  }
  function goToPreviousLevel() {
    // If no level is selected, go to level 1
    if (!currentLevel) {
      handleLevelClick(WORLD_LEVELS[0].id);
      return;
    }
    if (currentLevel.id === WORLD_LEVELS[0].id) {
      const unlockedLevels = WORLD_LEVELS.filter((lvl) =>
        isLevelUnlocked(lvl.id)
      ).map((lvl) => lvl.id);
      const lastLevelId = unlockedLevels[unlockedLevels.length - 1];
      handleLevelClick(lastLevelId);
      return;
    }
    const unlockedLevels = WORLD_LEVELS.filter((lvl) =>
      isLevelUnlocked(lvl.id)
    ).map((lvl) => lvl.id);
    const currentIndex = unlockedLevels.indexOf(currentLevel.id);
    if (currentIndex > 0) {
      const prevLevelId = unlockedLevels[currentIndex - 1];
      handleLevelClick(prevLevelId);
    }
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex flex-col text-amber-100 overflow-hidden">
      {/* TOP BAR */}
      <div className="flex-shrink-0 overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 px-3 sm:px-5 py-3 flex items-center justify-between border-b-2 border-amber-700/50 shadow-xl">
        <PrincetonLogo />

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowCodex(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-900/60 to-stone-900/80 hover:from-purple-800/70 rounded-xl border border-purple-600/50 transition-all hover:scale-105 shadow-lg"
          >
            <Book size={18} className="text-purple-400" />
            <span className="hidden sm:inline text-purple-300 font-medium text-lg">
              Codex
            </span>
          </button>
          <div className="flex items-center  bg-gradient-to-br from-amber-900/70 to-stone-900/80 rounded-xl border border-amber-600/60 p-1.5">
            {/* total hearts */}
            <div className="flex items-center gap-2 px-4 py-0.5 bg-gradient-to-br from-red-900/70 to-stone-900/80 rounded-l-lg border border-red-600/60 shadow-lg">
              <div className="relative">
                <Heart size={20} className="text-red-400 fill-red-400" />
                <div className="absolute inset-0 animate-ping opacity-30">
                  <Heart size={20} className="text-red-400 fill-red-400" />
                </div>
              </div>
              <span className="font-bold text-sm sm:text-lg text-red-300">
                {/* iterate through every level in levelStats and sum up hearts*/}
                {levelStats
                  ? Object.values(levelStats).reduce(
                    (acc, stats) => acc + (stats.bestHearts || 0),
                    0
                  )
                  : 0}
              </span>
              <span className="hidden sm:inline text-red-600 text-sm">/300</span>
            </div>
            {/* total stars */}

            <div className="flex items-center gap-2 px-4 py-0.5 bg-gradient-to-br from-amber-900/70 to-stone-900/80 rounded-r-lg border border-amber-600/60 shadow-lg">
              <div className="relative">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                <div className="absolute inset-0 animate-ping opacity-30">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <span className="font-bold text-sm sm:text-lg text-yellow-300">
                {totalStars}
              </span>
              <span className="hidden sm:inline text-yellow-600 text-sm">
                / {maxStars}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 bg-gradient-to-br from-amber-900/70 to-stone-900/80 px-1.5 py-1.5 rounded-xl border border-amber-600/60">
            <button
              onClick={() => goToPreviousLevel()}
              className="p-1 bg-amber-800/30 hover:bg-amber-800/70 rounded-lg border border-amber-700/50 transition-colors text-amber-400 hover:text-amber-200"
            >
              <ChevronLeft size={23} />
            </button>
            <button
              onClick={() => goToNextLevel()}
              className="p-1 bg-amber-800/30 hover:bg-amber-800/70 rounded-lg border border-amber-700/50 transition-colors text-amber-400 hover:text-amber-200"
            >
              <ChevronRight size={23} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-y-hidden overflow-x-auto min-h-0">
        {/* LEFT SIDEBAR */}
        <div className="sm:w-80 flex-shrink-0 bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 border-r-2 border-amber-800/50 flex flex-col">
          {selectedLevel && currentLevel ? (
            <div className="flex-1 flex flex-col h-full overflow-auto">
              <div className="flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent animate-pulse" />
                <div className="relative p-4 border-b border-amber-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <MapPin size={20} className="text-amber-400" />
                        <div className="absolute inset-0 animate-ping opacity-30">
                          <MapPin size={20} className="text-amber-400" />
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-amber-200">
                        {currentLevel.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedLevel(null)}
                      className="p-1.5 hover:bg-amber-900/40 rounded-lg transition-colors text-amber-500 hover:text-amber-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="hidden sm:block text-amber-500/80 text-sm italic mb-3">
                    &ldquo;{currentLevel.description}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 sm:mb-3">
                    <div className="flex items-center gap-2 px-2 py-1 bg-stone-800/60 rounded-lg border border-stone-700/50">
                      <Skull size={14} className="text-amber-500" />
                      <div className="flex gap-1">
                        {[1, 2, 3].map((d) => (
                          <div
                            key={d}
                            className={`w-3 h-3 rounded-full transition-all ${d <= currentLevel.difficulty
                              ? `${currentLevel.difficulty === 1
                                ? "bg-green-500 shadow-green-500/50"
                                : currentLevel.difficulty === 2
                                  ? "bg-yellow-500 shadow-yellow-500/50"
                                  : "bg-red-500 shadow-red-500/50"
                              } shadow-lg`
                              : "bg-stone-700"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-900/40 rounded-lg border border-amber-700/50">
                      <Flag size={14} className="text-amber-400" />
                      <span className="text-amber-200 font-bold">
                        {waveCount} Waves
                      </span>
                    </div>
                    <div className="flex sm:hidden items-center gap-3 p-2 bg-stone-800/50 rounded-lg border border-amber-800/40">
                      <Trophy size={18} className="text-yellow-500" />
                      <span className="text-amber-500 text-sm"></span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            size={18}
                            className={`transition-all ${(levelStars[currentLevel.id] || 0) >= s
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                              : "text-stone-600"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 p-2 bg-stone-800/50 rounded-lg border border-amber-800/40">
                    <Trophy size={18} className="text-yellow-500" />
                    <span className="text-amber-500 text-sm">Best Stars:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          className={`transition-all ${(levelStars[currentLevel.id] || 0) >= s
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                            : "text-stone-600"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  {levelStats[currentLevel.id] && (
                    <div className=" grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 mt-2 p-2 bg-stone-800/50 rounded-lg border border-red-800/40">
                        <Heart
                          size={18}
                          className="text-red-500 fill-red-500"
                        />
                        <div className="text-sm text-red-300 font-mono">
                          {levelStats[currentLevel.id]?.bestHearts}/20
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 p-2 bg-stone-800/50 rounded-lg border border-blue-800/40">
                        <Clock size={18} className="text-blue-400" />
                        <span className="text-blue-300 text-sm font-mono">
                          {levelStats[currentLevel.id]?.bestTime
                            ? `${Math.floor(
                              levelStats[currentLevel.id]!.bestTime! / 60
                            )}m ${levelStats[currentLevel.id]!.bestTime! % 60
                            }s`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden sm:inline flex-shrink-0 p-4 border-b border-amber-800/30">
                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                  Battlefield Preview
                </div>
                <div className="relative aspect-video bg-stone-900/80 rounded-xl border border-amber-800/40 overflow-hidden">
                  {LEVEL_DATA[currentLevel.id]?.previewImage ? (
                    <img
                      src={LEVEL_DATA[currentLevel.id].previewImage}
                      alt={`${currentLevel.name} preview`}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${LEVEL_DATA[currentLevel.id]?.previewImage
                      ? "opacity-0"
                      : "opacity-100"
                      }`}
                  >
                    <div
                      className={`w-full h-full ${currentLevel.region === "grassland"
                        ? "bg-gradient-to-br from-green-900/80 via-green-800/60 to-amber-900/40"
                        : currentLevel.region === "desert"
                          ? "bg-gradient-to-br from-amber-800/80 via-yellow-900/60 to-orange-900/40"
                          : currentLevel.region === "winter"
                            ? "bg-gradient-to-br from-blue-900/80 via-slate-700/60 to-cyan-900/40"
                            : "bg-gradient-to-br from-red-900/80 via-orange-900/60 to-stone-900/40"
                        } flex items-center justify-center`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {currentLevel.region === "grassland"
                            ? "🌲"
                            : currentLevel.region === "swamp"
                              ? "🦆"
                              : currentLevel.region === "desert"
                                ? "🏜️"
                                : currentLevel.region === "winter"
                                  ? "❄️"
                                  : "🌋"}
                        </div>
                        <span className="text-amber-400/70 text-xs">
                          Preview Coming
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-stone-900/90 text-amber-300 border border-amber-700/60">
                    {currentLevel.region}
                  </div>
                </div>
              </div>

              <div className="hidden sm:inline flex-1 p-4 overflow-y-auto">
                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">
                  Region Campaign
                </div>
                {(() => {
                  const regionLevels = WORLD_LEVELS.filter(
                    (l) => l.region === currentLevel.region
                  );
                  const regionStars = regionLevels.reduce(
                    (sum, l) => sum + (levelStars[l.id] || 0),
                    0
                  );
                  const maxRegionStars = regionLevels.length * 3;
                  return (
                    <div className="space-y-2">
                      {regionLevels.map((l) => (
                        <div
                          key={l.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${l.id === selectedLevel
                            ? "bg-amber-900/40 border border-amber-600/60"
                            : "bg-stone-800/40 border border-stone-700/30 hover:bg-stone-800/60"
                            }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${isLevelUnlocked(l.id)
                              ? "bg-amber-900/50"
                              : "bg-stone-800"
                              }`}
                          >
                            {isLevelUnlocked(l.id)
                              ? l.region === "grassland"
                                ? "🌲"
                                : l.region === "swamp"
                                  ? "🦆"
                                  : l.region === "desert"
                                    ? "🏜️"
                                    : l.region === "winter"
                                      ? "❄️"
                                      : "🌋"
                              : "🔒"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-amber-200 font-medium truncate">
                              {l.name}
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                className={
                                  (levelStars[l.id] || 0) >= s
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-stone-600"
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="mt-3 pt-3 border-t border-amber-800/40 flex items-center justify-between">
                        <span className="text-amber-500 text-sm">
                          Region Progress:
                        </span>
                        <div className="flex items-center gap-2">
                          <Star
                            size={16}
                            className="text-yellow-400 fill-yellow-400"
                          />
                          <span className="text-amber-200 font-bold">
                            {regionStars}/{maxRegionStars}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex-shrink-0 p-4 border-t border-amber-800/50 bg-gradient-to-t from-stone-950 to-transparent">
                <button
                  onClick={startGame}
                  disabled={!canStart}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden group ${canStart
                    ? "bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-500 hover:via-amber-400 hover:to-orange-500 text-stone-900 shadow-xl shadow-amber-500/30 hover:scale-[1.02]"
                    : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700"
                    }`}
                >
                  {canStart && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                  <div className="relative flex items-center justify-center gap-3">
                    <Swords
                      size={24}
                      className={canStart ? "animate-pulse" : ""}
                    />
                    <span>{canStart ? "BATTLE" : "Prepare Your Forces"}</span>
                    {canStart && <Play size={20} />}
                  </div>
                </button>
                {!canStart && (
                  <div className="mt-2 text-center text-xs text-amber-600">
                    {!selectedLevel && "Select a battlefield"}
                    {selectedLevel && !selectedHero && "Choose your champion"}
                    {selectedLevel &&
                      selectedHero &&
                      selectedSpells.length < 3 &&
                      `Select ${3 - selectedSpells.length} more spell${3 - selectedSpells.length > 1 ? "s" : ""
                      }`}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <BattlefieldPreview animTime={animTime} />
          )}
        </div>
        {/* RIGHT: Map */}
        <div className="relative flex-1 flex flex-col min-w-0 p-3 overflow-x-auto">
          <div className="z-20 sm:hidden absolute flex top-4 right-4  items-center gap-1 px-1.5 py-1.5 rounded-xl">
            <button
              onClick={() => goToPreviousLevel()}
              className="p-0.5 bg-amber-800/30 hover:bg-amber-800/70 rounded-lg border border-amber-700/50 transition-colors text-amber-400 hover:text-amber-200"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goToNextLevel()}
              className="p-0.5 bg-amber-800/30 hover:bg-amber-800/70 rounded-lg border border-amber-700/50 transition-colors text-amber-400 hover:text-amber-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div
            ref={containerRef}
            className="flex-1 relative  bg-gradient-to-br from-stone-900 to-stone-950 rounded-2xl border-2 border-amber-800/50 sm:overflow-hidden shadow-2xl min-h-0"
          >
            <div
              ref={scrollContainerRef}
              className="absolute h-full inset-0 overflow-x-auto overflow-y-hidden z-10"
              style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <canvas
                ref={canvasRef}
                className="block"
                style={{ minWidth: `${MAP_WIDTH}px`, height: "100%", cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
              />
            </div>

            {/* HERO & SPELL SELECTION OVERLAY */}
            <div className="absolute w-full flex bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-stone-950/98 via-stone-900/35 to-transparent pointer-events-none h-full overflow-x-auto z-20">
              <div className="flex w-full mt-auto gap-3 pointer-events-auto">
                <div className="hidden sm:inline bg-gradient-to-br from-stone-900/95 to-stone-950/98 rounded-xl border border-amber-800/50 p-3 shadow-xl backdrop-blur-sm w-40 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={14} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 tracking-wide">
                      WAR IS COMING
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-200/80 leading-relaxed space-y-1.5">
                    <p>
                      The Kingdom of Princeton stands as the last bastion
                      against the invading hordes. Ancient towers guard our
                      halls, powered by arcane knowledge.
                    </p>
                    {/* <p className="text-amber-400/70 italic">
                      Select your champion wisely, arm yourself with powerful
                      spells, and lead the Tiger forces to victory!
                    </p> */}
                  </div>
                  <div className="mt-2 pt-2 border-t border-amber-800/30 flex items-center gap-2 text-[9px] text-amber-500">
                    <Swords size={10} />
                    <span>Defend the realm!</span>
                  </div>
                </div>
                {/* Hero Panel */}
                <div className="bg-gradient-to-br from-amber-950/95 to-stone-900/98 rounded-xl border border-amber-700/60 p-3 shadow-xl backdrop-blur-sm flex-1 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={14} className="text-amber-400" />
                    <span className="text-xs text-nowrap font-bold text-amber-300 tracking-wide">
                      SELECT CHAMPION
                    </span>
                  </div>
                  <div className="grid-cols-4 grid sm:flex gap-1.5 mb-2 w-full">
                    {heroOptions.map((heroType) => {
                      const hero = HERO_DATA[heroType];
                      const isSelected = selectedHero === heroType;
                      return (
                        <button
                          key={heroType}
                          onClick={() => setSelectedHero(heroType)}
                          onMouseEnter={() => setHoveredHero(heroType)}
                          onMouseLeave={() => setHoveredHero(null)}
                          className={`relative px-4s sm:px-1 pt-1.5 flex justify-center w-full p-1 pb-0.5 rounded-lg transition-all ${isSelected
                            ? "bg-gradient-to-br from-amber-600 to-orange-700 border-2 border-amber-300 scale-110 shadow-lg shadow-amber-500/40 z-10"
                            : "bg-stone-800/80 border border-stone-600/50 hover:border-amber-500/60 hover:scale-105"
                            }`}
                        >
                          <HeroSprite
                            type={heroType}
                            size={36}
                            color={hero.color}
                          />
                          {isSelected && (
                            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-green-300 text-[8px] text-white font-bold">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedHero ? (
                    <div className="hidden sm:block bg-stone-900/60 rounded-lg p-2 border border-amber-800/40">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-amber-200">
                          {HERO_DATA[selectedHero].name}
                        </span>
                        <span className="text-lg">
                          {HERO_DATA[selectedHero].icon}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 mb-1.5 text-[9px]">
                        <div className="bg-red-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-red-500">HP</div>
                          <div className="text-red-300 font-bold">
                            {HERO_DATA[selectedHero].hp}
                          </div>
                        </div>
                        <div className="bg-orange-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-orange-500">DMG</div>
                          <div className="text-orange-300 font-bold">
                            {HERO_DATA[selectedHero].damage}
                          </div>
                        </div>
                        <div className="bg-blue-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-blue-500">RNG</div>
                          <div className="text-blue-300 font-bold">
                            {HERO_DATA[selectedHero].range}
                          </div>
                        </div>
                        <div className="bg-green-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-green-500">SPD</div>
                          <div className="text-green-300 font-bold">
                            {HERO_DATA[selectedHero].speed}
                          </div>
                        </div>
                        <div className="bg-purple-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-purple-500">CD</div>
                          <div className="text-purple-300 font-bold">
                            {HERO_ABILITY_COOLDOWNS[selectedHero] / 1000}s
                          </div>
                        </div>
                      </div>
                      <div className="text-[9px] text-purple-300 flex items-center gap-1 bg-purple-900/40 px-2 py-1 rounded">
                        <Sparkles size={10} className="text-purple-400" />
                        <span className="font-semibold text-purple-200">
                          {HERO_DATA[selectedHero].ability}:
                        </span>
                        <span className="text-purple-300/80 truncate">
                          {HERO_DATA[selectedHero].abilityDesc}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-amber-600/60 text-[10px] text-center py-2">
                      ← Choose your champion
                    </div>
                  )}
                  {hoveredHero && hoveredHero !== selectedHero && (
                    <div className="absolute bg-gradient-to-br from-amber-950 to-stone-900 bottom-full left-0 mb-2 w-72 rounded-lg border border-amber-700/60 p-3 shadow-xl z-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-200 font-bold">
                          {HERO_DATA[hoveredHero].name}
                        </span>
                        <span>{HERO_DATA[hoveredHero].icon}</span>
                      </div>
                      <p className="text-xs text-amber-500/80 mb-2">
                        {HERO_DATA[hoveredHero].description}
                      </p>
                      <div className="grid grid-cols-5 gap-1 text-[9px] mb-2">
                        <div className="bg-red-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-red-500">HP</div>
                          <div className="text-red-300 font-bold">
                            {HERO_DATA[hoveredHero].hp}
                          </div>
                        </div>
                        <div className="bg-orange-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-orange-500">DMG</div>
                          <div className="text-orange-300 font-bold">
                            {HERO_DATA[hoveredHero].damage}
                          </div>
                        </div>
                        <div className="bg-blue-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-blue-500">RNG</div>
                          <div className="text-blue-300 font-bold">
                            {HERO_DATA[hoveredHero].range}
                          </div>
                        </div>
                        <div className="bg-green-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-green-500">SPD</div>
                          <div className="text-green-300 font-bold">
                            {HERO_DATA[hoveredHero].speed}
                          </div>
                        </div>
                        <div className="bg-purple-950/60 rounded px-1 py-0.5 text-center">
                          <div className="text-purple-500">CD</div>
                          <div className="text-purple-300 font-bold">
                            {HERO_ABILITY_COOLDOWNS[hoveredHero] / 1000}s
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-purple-300 bg-purple-900/40 px-2 py-1 rounded">
                        <span className="font-semibold text-purple-200">
                          {HERO_DATA[hoveredHero].ability}:
                        </span>{" "}
                        {HERO_DATA[hoveredHero].abilityDesc}
                      </div>
                    </div>
                  )}
                </div>

                {/* Spell Panel */}
                <div className="bg-gradient-to-br from-purple-950/95 to-stone-900/98 rounded-xl border border-purple-700/60 p-3 shadow-xl backdrop-blur-sm flex-1 relative">
                  <div className="flex items-center justify-between -mt-0.5 mb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-purple-400" />
                      <span className="text-xs font-bold text-amber-300 tracking-wide">
                        <span className="hidden sm:inline">SELECT</span> SPELLS
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${selectedSpells.length === 3
                        ? "bg-green-900/60 text-green-300 border border-green-700/50"
                        : "bg-purple-900/60 text-purple-300 border border-purple-700/50"
                        }`}
                    >
                      {selectedSpells.length}/3{" "}
                      <span className="hidden sm:inline">Selected</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:flex gap-1.5 mb-2">
                    {spellOptions.map((spellType) => {
                      const isSelected = selectedSpells.includes(spellType);
                      const canSelect = isSelected || selectedSpells.length < 3;
                      const spellIndex = selectedSpells.indexOf(spellType);
                      return (
                        <button
                          key={spellType}
                          onClick={() => toggleSpell(spellType)}
                          onMouseEnter={() => setHoveredSpell(spellType)}
                          onMouseLeave={() => setHoveredSpell(null)}
                          disabled={!canSelect && !isSelected}
                          className={`relative w-full p-1.5 flex justify-center rounded-lg transition-all ${isSelected
                            ? "bg-gradient-to-br from-purple-600 to-violet-700 border-2 border-purple-300 shadow-lg shadow-purple-500/40"
                            : canSelect
                              ? "bg-stone-800/80 border border-stone-600/50 hover:border-purple-500/60 hover:scale-105"
                              : "bg-stone-900/60 border border-stone-800/40 opacity-40 cursor-not-allowed"
                            }`}
                        >
                          <SpellSprite type={spellType} size={32} />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-purple-300">
                              {spellIndex + 1}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSpells.length > 0 ? (
                    <div className="hidden sm:block bg-stone-900/60 rounded-lg w-full p-2 border border-purple-800/40">
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSpells.map((sp, i) => {
                          const spell = SPELL_DATA[sp];
                          return (
                            <div
                              key={sp}
                              className="flex w-full items-center gap-1.5 text-[9px] bg-purple-950/60 px-2 py-1 rounded border border-purple-800/40"
                            >
                              <span className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                                {i + 1}
                              </span>
                              <span className="text-purple-200 font-medium">
                                {spell.name}
                              </span>

                              <span className="ml-auto text-purple-500">|</span>

                              <span className="text-amber-400 flex items-center gap-0.5">
                                <Coins size={8} />
                                {spell.cost > 0 ? spell.cost : "FREE"}
                              </span>
                              <span className="text-blue-400 flex items-center gap-0.5">
                                <Timer size={8} />
                                {spell.cooldown / 1000}s
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {selectedSpells.length < 3 && (
                        <div className="hidden sm:inline text-[8px] text-purple-500/60 mt-1">
                          Select {3 - selectedSpells.length} more spell
                          {3 - selectedSpells.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="hidden sm:inline text-purple-600/60 text-[10px] text-center py-2">
                      ← Select 3 spells for battle
                    </div>
                  )}
                  {hoveredSpell && (
                    <div className="absolute bottom-full right-0 mb-2 w-80 bg-gradient-to-br from-purple-950 to-stone-900 rounded-lg border border-purple-700/60 p-3 shadow-xl z-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-200 font-bold text-lg">
                          {SPELL_DATA[hoveredSpell].name}
                        </span>
                        <span className="text-xl">
                          {SPELL_DATA[hoveredSpell].icon}
                        </span>
                      </div>
                      <p className="text-xs text-purple-400/80 mb-3">
                        {SPELL_DATA[hoveredSpell].desc}
                      </p>
                      <div className="flex gap-3 mb-3">
                        <div className="bg-amber-950/60 rounded px-3 py-1.5 text-center">
                          <div className="text-[9px] text-amber-500">Cost</div>
                          <div className="text-amber-300 font-bold">
                            {SPELL_DATA[hoveredSpell].cost > 0
                              ? `${SPELL_DATA[hoveredSpell].cost} PP`
                              : "FREE"}
                          </div>
                        </div>
                        <div className="bg-blue-950/60 rounded px-3 py-1.5 text-center">
                          <div className="text-[9px] text-blue-500">
                            Cooldown
                          </div>
                          <div className="text-blue-300 font-bold">
                            {SPELL_DATA[hoveredSpell].cooldown / 1000}s
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-purple-300 bg-purple-900/40 px-2 py-2 rounded border border-purple-800/40">
                        <div className="text-purple-500 uppercase text-[8px] mb-1">
                          Effect Details
                        </div>
                        {hoveredSpell === "fireball" &&
                          "Meteor falls from sky (1s delay), 200 AoE damage with falloff, 150 radius"}
                        {hoveredSpell === "lightning" &&
                          "Chains to 5 enemies, 600 total damage split, 0.5s stun each"}
                        {hoveredSpell === "freeze" &&
                          "Freezes ALL enemies for 3 seconds, expanding ice wave"}
                        {hoveredSpell === "payday" &&
                          "80 base + 5 per enemy (max 50 bonus) = up to 130 PP"}
                        {hoveredSpell === "reinforcements" &&
                          "Summons 3 knights (500 HP, 30 DMG each), click to place"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCodex && <CodexModal onClose={() => setShowCodex(false)} />}
    </div>
  );
};

export default WorldMap;
