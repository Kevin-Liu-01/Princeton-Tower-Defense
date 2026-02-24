"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  Swords,
  ChevronLeft,
  ChevronRight,
  Lock,
  Star,
  MapPin,
  Book,
  Trophy,
  Settings,
  Heart,
  Coins,
  Gauge,
  Shield,
  Wind,
  Crown,
  Target,
  Crosshair,
  Zap,
  Flame,
  Snowflake,
  Timer,
  TrendingDown,
  Droplets,
  Ban,
  EyeOff,
  AlertTriangle,
  Sparkles,
  Users,
  Footprints,
  Info,
  Flag,
} from "lucide-react";
import type { GameState, LevelStars, EnemyType, EnemyTrait, EnemyCategory } from "../../types";
import { OrnateFrame } from "../ui/OrnateFrame";
import { ENEMY_DATA } from "../../constants";
import {
  TowerSprite,
  HeroSprite,
  EnemySprite,
  SpellSprite,
  RegionIcon,
  AnimatedCastle,
  MarchingEnemies,
  HERO_COLORS,
} from "../../sprites";

// =============================================================================
// REGION AND LEVEL DATA
// =============================================================================

export interface LevelInfo {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3;
  waves: number;
}

export interface RegionInfo {
  id: string;
  name: string;
  description: string;
  type: "grassland" | "desert" | "winter" | "volcanic";
  levels: LevelInfo[];
  unlockRequirement: number; // Total stars needed to unlock
}

export const REGIONS: RegionInfo[] = [
  {
    id: "grassland",
    name: "Princeton Grounds",
    description: "The verdant fields surrounding the university",
    type: "grassland",
    unlockRequirement: 0,
    levels: [
      {
        id: "poe",
        name: "Poe Field",
        description: "Training grounds for new defenders",
        difficulty: 1,
        waves: 10,
      },
      {
        id: "carnegie",
        name: "Carnegie Lake",
        description: "Strategic waterfront defense",
        difficulty: 2,
        waves: 12,
      },
      {
        id: "nassau",
        name: "Nassau Hall",
        description: "The heart of campus must be protected",
        difficulty: 3,
        waves: 15,
      },
    ],
  },
  {
    id: "desert",
    name: "Sahara Sands",
    description: "Ancient desert ruins with hidden dangers",
    type: "desert",
    unlockRequirement: 6, // Need 6 stars to unlock
    levels: [
      {
        id: "oasis",
        name: "Desert Oasis",
        description: "A precious water source under siege",
        difficulty: 1,
        waves: 12,
      },
      {
        id: "pyramid",
        name: "Pyramid Pass",
        description: "Navigate the treacherous canyon",
        difficulty: 2,
        waves: 14,
      },
      {
        id: "sphinx",
        name: "Sphinx Gate",
        description: "The ancient guardian's domain",
        difficulty: 3,
        waves: 16,
      },
    ],
  },
  {
    id: "winter",
    name: "Frozen Frontier",
    description: "The harsh northern territories",
    type: "winter",
    unlockRequirement: 12,
    levels: [
      {
        id: "glacier",
        name: "Glacier Path",
        description: "Ice-covered mountain pass",
        difficulty: 1,
        waves: 14,
      },
      {
        id: "fortress",
        name: "Frost Fortress",
        description: "An abandoned stronghold",
        difficulty: 2,
        waves: 16,
      },
      {
        id: "peak",
        name: "Summit Peak",
        description: "The highest point of defense",
        difficulty: 3,
        waves: 18,
      },
    ],
  },
  {
    id: "volcanic",
    name: "Inferno Depths",
    description: "The final battleground in volcanic wastelands",
    type: "volcanic",
    unlockRequirement: 18,
    levels: [
      {
        id: "lava",
        name: "Lava Fields",
        description: "Rivers of molten rock",
        difficulty: 2,
        waves: 16,
      },
      {
        id: "crater",
        name: "Caldera Basin",
        description: "Inside the volcano's heart",
        difficulty: 3,
        waves: 18,
      },
      {
        id: "throne",
        name: "Obsidian Throne",
        description: "The ultimate challenge awaits",
        difficulty: 3,
        waves: 20,
      },
    ],
  },
];

// =============================================================================
// MAIN MENU COMPONENT
// =============================================================================

interface MainMenuProps {
  setGameState: (state: GameState) => void;
  setSelectedMap: (map: string) => void;
  levelStars: LevelStars;
  unlockedMaps: string[];
}

export const MainMenu: React.FC<MainMenuProps> = ({
  setGameState,
  setSelectedMap,
  levelStars,
  unlockedMaps,
}) => {
  const [currentRegion, setCurrentRegion] = useState(0);
  const [showCodex, setShowCodex] = useState(false);
  const [codexTab, setCodexTab] = useState<
    "towers" | "heroes" | "enemies" | "spells"
  >("towers");

  // Calculate total stars
  const totalStars = levelStars
    ? Object?.values(levelStars)?.reduce((sum, stars) => sum + stars, 0)
    : 0;

  // Check if region is unlocked
  const isRegionUnlocked = (region: RegionInfo) =>
    totalStars >= region.unlockRequirement;

  // Check if level is unlocked
  const isLevelUnlocked = (levelId: string) => unlockedMaps.includes(levelId);

  // Navigate regions
  const prevRegion = () => setCurrentRegion((r) => Math.max(0, r - 1));
  const nextRegion = () =>
    setCurrentRegion((r) => Math.min(REGIONS.length - 1, r + 1));

  // Select level and start
  const selectLevel = (levelId: string) => {
    if (isLevelUnlocked(levelId)) {
      setSelectedMap(levelId);
      setGameState("setup");
    }
  };

  const region = REGIONS[currentRegion];
  const regionUnlocked = isRegionUnlocked(region);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex flex-col text-amber-100 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="relative z-10 bg-gradient-to-r from-amber-900/90 via-amber-800/90 to-amber-900/90 px-6 py-3 flex items-center justify-between border-b-2 border-amber-600 shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-amber-300 tracking-wider">
            PRINCETON
          </h1>
          <span className="text-lg text-amber-500">Kingdom Defense</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Total stars */}
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/60 rounded-lg border border-amber-700">
            <Trophy size={18} className="text-yellow-400" />
            <span className="font-bold text-yellow-300">{totalStars}</span>
            <span className="text-amber-500 text-sm">Stars</span>
          </div>

          {/* Codex button */}
          <button
            onClick={() => setShowCodex(true)}
            className="px-4 py-2 bg-purple-900/60 hover:bg-purple-800/60 rounded-lg border border-purple-600 flex items-center gap-2 transition-colors"
          >
            <Book size={18} className="text-purple-300" />
            <span className="text-purple-200">Codex</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Region selector */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={prevRegion}
            disabled={currentRegion === 0}
            className={`p-3 rounded-full transition-all ${
              currentRegion === 0
                ? "bg-stone-800/50 text-stone-600 cursor-not-allowed"
                : "bg-amber-900/80 hover:bg-amber-800 text-amber-300 border border-amber-600"
            }`}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Region cards */}
          <div className="flex gap-4">
            {REGIONS.map((r, i) => {
              const unlocked = isRegionUnlocked(r);
              const isActive = i === currentRegion;
              const regionStars = r.levels.reduce(
                (sum, l) => sum + (levelStars[l?.id] || 0),
                0
              );
              const maxStars = r.levels.length * 3;

              return (
                <button
                  key={r.id}
                  onClick={() => setCurrentRegion(i)}
                  className={`relative p-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-amber-800/80 border-2 border-amber-400 scale-110 shadow-xl"
                      : unlocked
                      ? "bg-stone-800/80 border border-stone-600 hover:border-amber-600"
                      : "bg-stone-900/80 border border-stone-700 opacity-60"
                  }`}
                >
                  <RegionIcon type={r.type} size={50} locked={!unlocked} />
                  {unlocked && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {[...Array(3)].map((_, s) => (
                        <Star
                          key={s}
                          size={10}
                          className={
                            regionStars > s * (maxStars / 3)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-stone-600"
                          }
                        />
                      ))}
                    </div>
                  )}
                  {!unlocked && (
                    <div className="absolute -top-1 -right-1 bg-stone-700 rounded-full p-1">
                      <Lock size={12} className="text-stone-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={nextRegion}
            disabled={currentRegion === REGIONS.length - 1}
            className={`p-3 rounded-full transition-all ${
              currentRegion === REGIONS.length - 1
                ? "bg-stone-800/50 text-stone-600 cursor-not-allowed"
                : "bg-amber-900/80 hover:bg-amber-800 text-amber-300 border border-amber-600"
            }`}
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Region info */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-300 mb-2">
            {region.name}
          </h2>
          <p className="text-amber-500">{region.description}</p>
          {!regionUnlocked && (
            <p className="text-red-400 mt-2 flex items-center justify-center gap-2">
              <Lock size={16} />
              Requires {region.unlockRequirement} stars to unlock ({totalStars}/
              {region.unlockRequirement})
            </p>
          )}
        </div>

        {/* Level cards */}
        <div className="flex gap-6 mb-8">
          {region.levels.map((level, i) => {
            const unlocked = regionUnlocked && isLevelUnlocked(level.id);
            const stars = levelStars[level.id] || 0;
            const isFirst = i === 0;
            const prevLevel = i > 0 ? region.levels[i - 1] : null;
            const prevUnlocked = prevLevel
              ? isLevelUnlocked(prevLevel.id)
              : true;
            const canUnlock =
              regionUnlocked &&
              (isFirst ||
                (prevUnlocked && (levelStars[prevLevel!.id] || 0) > 0));

            return (
              <div
                key={level.id}
                onClick={() => (unlocked || canUnlock) && selectLevel(level.id)}
                className={`relative w-48 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                  unlocked
                    ? "bg-gradient-to-b from-amber-800/90 to-amber-900/90 border-2 border-amber-500 hover:scale-105 hover:shadow-xl"
                    : canUnlock
                    ? "bg-gradient-to-b from-stone-700/90 to-stone-800/90 border-2 border-stone-500 hover:border-amber-600"
                    : "bg-stone-900/80 border border-stone-700 opacity-50 cursor-not-allowed"
                }`}
              >
                {/* Level number */}
                <div
                  className={`absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    unlocked
                      ? "bg-amber-600 text-amber-100"
                      : "bg-stone-700 text-stone-400"
                  }`}
                >
                  {i + 1}
                </div>

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-3">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      size={20}
                      className={
                        stars >= s
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-stone-600"
                      }
                    />
                  ))}
                </div>

                {/* Level name */}
                <h3
                  className={`text-lg font-bold text-center mb-2 ${
                    unlocked ? "text-amber-200" : "text-stone-400"
                  }`}
                >
                  {level.name}
                </h3>

                {/* Description */}
                <p
                  className={`text-xs text-center mb-3 ${
                    unlocked ? "text-amber-400" : "text-stone-500"
                  }`}
                >
                  {level.description}
                </p>

                {/* Difficulty */}
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3].map((d) => (
                    <div
                      key={d}
                      className={`w-3 h-3 rounded-full ${
                        d <= level.difficulty
                          ? level.difficulty === 1
                            ? "bg-green-500"
                            : level.difficulty === 2
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          : "bg-stone-700"
                      }`}
                    />
                  ))}
                </div>

                {/* Waves */}
                <p
                  className={`text-xs text-center ${
                    unlocked ? "text-amber-500" : "text-stone-500"
                  }`}
                >
                  {level.waves} Waves
                </p>

                {/* Lock overlay */}
                {!unlocked && !canUnlock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-900/60 rounded-xl">
                    <Lock size={32} className="text-stone-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Animated elements */}
        <div className="flex items-center gap-8">
          <AnimatedCastle size={120} />
          <div className="text-center">
            <p className="text-amber-400 mb-2">Enemies approach...</p>
            <MarchingEnemies size={200} />
          </div>
          <AnimatedCastle size={120} />
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-amber-950/50 px-6 py-3 flex items-center justify-between border-t border-amber-800">
        <span className="text-amber-600/60 text-sm">Est. 1746</span>
        <span className="text-amber-600/60 text-sm">v2.0</span>
      </div>

      {/* Codex Modal */}
      {showCodex && (
        <CodexModal
          activeTab={codexTab}
          setActiveTab={setCodexTab}
          onClose={() => setShowCodex(false)}
        />
      )}
    </div>
  );
};

// =============================================================================
// CODEX MODAL
// =============================================================================

// Helper function to get trait icon and info for Codex
const getTraitInfo = (trait: EnemyTrait): { icon: React.ReactNode; label: string; color: string } => {
  switch (trait) {
    case "flying":
      return { icon: <Wind size={10} />, label: "Flying", color: "text-cyan-400" };
    case "ranged":
      return { icon: <Crosshair size={10} />, label: "Ranged", color: "text-green-400" };
    case "armored":
      return { icon: <Shield size={10} />, label: "Armored", color: "text-amber-400" };
    case "fast":
      return { icon: <Footprints size={10} />, label: "Fast", color: "text-yellow-400" };
    case "boss":
      return { icon: <Crown size={10} />, label: "Boss", color: "text-red-400" };
    case "summoner":
      return { icon: <Users size={10} />, label: "Summoner", color: "text-purple-400" };
    case "regenerating":
      return { icon: <Heart size={10} />, label: "Regen", color: "text-green-400" };
    case "aoe_attack":
      return { icon: <Target size={10} />, label: "AoE", color: "text-orange-400" };
    case "magic_resist":
      return { icon: <Sparkles size={10} />, label: "Magic Resist", color: "text-blue-400" };
    case "tower_debuffer":
      return { icon: <TrendingDown size={10} />, label: "Debuffer", color: "text-rose-400" };
    case "breakthrough":
      return { icon: <Zap size={10} />, label: "Breakthrough", color: "text-sky-400" };
    default:
      return { icon: <Info size={10} />, label: trait, color: "text-gray-400" };
  }
};

// Helper function to get ability icon and color for Codex
const getAbilityInfo = (abilityType: string): { icon: React.ReactNode; color: string; bgColor: string } => {
  switch (abilityType) {
    case "burn":
      return { icon: <Flame size={12} />, color: "text-orange-400", bgColor: "bg-orange-950/60 border-orange-800/50" };
    case "slow":
      return { icon: <Snowflake size={12} />, color: "text-cyan-400", bgColor: "bg-cyan-950/60 border-cyan-800/50" };
    case "poison":
      return { icon: <Droplets size={12} />, color: "text-green-400", bgColor: "bg-green-950/60 border-green-800/50" };
    case "stun":
      return { icon: <Zap size={12} />, color: "text-yellow-400", bgColor: "bg-yellow-950/60 border-yellow-800/50" };
    case "tower_slow":
      return { icon: <Timer size={12} />, color: "text-blue-400", bgColor: "bg-blue-950/60 border-blue-800/50" };
    case "tower_weaken":
      return { icon: <TrendingDown size={12} />, color: "text-red-400", bgColor: "bg-red-950/60 border-red-800/50" };
    case "tower_blind":
      return { icon: <EyeOff size={12} />, color: "text-purple-400", bgColor: "bg-purple-950/60 border-purple-800/50" };
    case "tower_disable":
      return { icon: <Ban size={12} />, color: "text-rose-400", bgColor: "bg-rose-950/60 border-rose-800/50" };
    default:
      return { icon: <AlertTriangle size={12} />, color: "text-gray-400", bgColor: "bg-gray-950/60 border-gray-800/50" };
  }
};

// Enemy category display info
const CATEGORY_INFO: Record<EnemyCategory, { name: string; desc: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  academic: { name: "Academic", desc: "Academic progression and milestones", icon: <Target size={16} />, color: "text-purple-400", bgColor: "bg-purple-950/50 border-purple-800/40" },
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

interface CodexModalProps {
  activeTab: "towers" | "heroes" | "enemies" | "spells";
  setActiveTab: (tab: "towers" | "heroes" | "enemies" | "spells") => void;
  onClose: () => void;
}

const CodexModal: React.FC<CodexModalProps> = ({
  activeTab,
  setActiveTab,
  onClose,
}) => {
  const towers = [
    {
      type: "cannon" as const,
      name: "Nassau Cannon",
      desc: "Heavy artillery that fires explosive shells. Effective against grouped enemies.",
    },
    {
      type: "library" as const,
      name: "Firestone Library",
      desc: "Magical tower that fires energy bolts. Slows enemies hit.",
    },
    {
      type: "lab" as const,
      name: "E-Quad Lab",
      desc: "Tesla tower that chains lightning between enemies.",
    },
    {
      type: "arch" as const,
      name: "Blair Arch",
      desc: "Musical tower that damages multiple enemies with sound waves.",
    },
    {
      type: "club" as const,
      name: "Eating Club",
      desc: "Economic tower that generates bonus gold and buffs nearby towers.",
    },
    {
      type: "station" as const,
      name: "Dinky Station",
      desc: "Spawns knight troops that engage enemies in melee combat.",
    },
  ];

  const heroes = [
    {
      type: "tiger" as const,
      name: "Princeton Tiger",
      desc: "Fierce melee fighter with Pounce ability that stuns enemies.",
      ability: "Pounce",
    },
    {
      type: "mathey" as const,
      name: "Mathey Knight",
      desc: "Armored warrior with Shield Wall that blocks damage.",
      ability: "Shield Wall",
    },
    {
      type: "rocky" as const,
      name: "Rocky the Lion",
      desc: "Ranged attacker who throws boulders at enemies.",
      ability: "Boulder Throw",
    },
    {
      type: "tenor" as const,
      name: "Nassoon Tenor",
      desc: "Support hero that heals allies with singing.",
      ability: "Healing Song",
    },
    {
      type: "scott" as const,
      name: "F. Scott",
      desc: "Intellectual hero that inspires towers for bonus damage.",
      ability: "Inspire",
    },
  ];

  const enemyTypes = Object.keys(ENEMY_DATA) as EnemyType[];

  const spells = [
    {
      type: "fireball" as const,
      name: "Fireball",
      desc: "Launches a fireball that explodes on impact, dealing area damage.",
      cost: 50,
    },
    {
      type: "lightning" as const,
      name: "Lightning",
      desc: "Strikes the strongest enemy with chain lightning.",
      cost: 75,
    },
    {
      type: "freeze" as const,
      name: "Freeze",
      desc: "Freezes all enemies in an area, stopping movement.",
      cost: 60,
    },
    {
      type: "payday" as const,
      name: "Payday",
      desc: "Instantly grants bonus gold.",
      cost: 0,
    },
    {
      type: "reinforcements" as const,
      name: "Reinforcements",
      desc: "Summons 3 knight troops at target location.",
      cost: 100,
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <OrnateFrame
          className="bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl border-2 border-amber-600 shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          cornerSize={48}
          color="#d97706"
          glowColor="#f59e0b"
        >
        {/* Header */}
        <div className="bg-amber-900/80 px-6 py-4 flex items-center justify-between border-b border-amber-700">
          <h2 className="text-2xl font-bold text-amber-300 flex items-center gap-3">
            <Book size={28} />
            Codex
          </h2>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-200 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-700">
          {(["towers", "heroes", "enemies", "spells"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "bg-amber-900/60 text-amber-300 border-b-2 border-amber-400"
                  : "text-stone-400 hover:text-amber-300 hover:bg-stone-800/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {activeTab === "towers" && (
            <div className="grid grid-cols-2 gap-4">
              {towers.map((t) => (
                <div
                  key={t.type}
                  className="bg-stone-800/60 rounded-xl p-4 border border-stone-700 flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <TowerSprite type={t.type} size={64} animated />
                  </div>
                  <div>
                    <h3 className="text-amber-300 font-bold mb-1">{t.name}</h3>
                    <p className="text-stone-400 text-sm">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "heroes" && (
            <div className="grid grid-cols-2 gap-4">
              {heroes.map((h) => (
                <div
                  key={h.type}
                  className="bg-stone-800/60 rounded-xl p-4 border border-stone-700 flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <HeroSprite type={h.type} size={64} animated />
                  </div>
                  <div>
                    <h3 className="text-amber-300 font-bold mb-1">{h.name}</h3>
                    <p className="text-stone-400 text-sm mb-2">{h.desc}</p>
                    <span className="text-purple-400 text-xs bg-purple-900/40 px-2 py-1 rounded">
                      Ability: {h.ability}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "enemies" && (() => {
            const groupedEnemies = groupEnemiesByCategory(enemyTypes);
            
            return (
              <div className="space-y-4">
                {CATEGORY_ORDER.map(category => {
                  const categoryEnemies = groupedEnemies[category];
                  if (categoryEnemies.length === 0) return null;
                  
                  const catInfo = CATEGORY_INFO[category];
                  
                  return (
                    <div key={category}>
                      {/* Category Header */}
                      <div className={`flex items-center gap-2 mb-2 pb-1.5 border-b ${catInfo.bgColor.replace('bg-', 'border-')}`}>
                        <div className={`p-1.5 rounded ${catInfo.bgColor}`}>
                          {catInfo.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold text-sm ${catInfo.color}`}>{catInfo.name}</h3>
                          <p className="text-[9px] text-stone-400">{catInfo.desc}</p>
                        </div>
                        <span className="text-[9px] text-stone-500 bg-stone-800/50 px-1.5 py-0.5 rounded">
                          {categoryEnemies.length}
                        </span>
                      </div>
                      
                      {/* Category Enemies Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryEnemies.map((type) => {
                          const enemy = ENEMY_DATA[type];
                          const traits = enemy.traits || [];
                          const abilities = enemy.abilities || [];
                          const hasAoE = enemy.aoeRadius && enemy.aoeDamage;

                          // Threat level
                          const getThreatLevel = (hp: number, isBoss?: boolean) => {
                            if (isBoss || hp >= 1000) return { level: "Boss", color: "purple" };
                            if (hp >= 500) return { level: "Elite", color: "orange" };
                            if (hp >= 200) return { level: "Standard", color: "yellow" };
                            return { level: "Minion", color: "green" };
                          };
                          const threat = getThreatLevel(enemy.hp, enemy.isBoss);

                          // Enemy type classification
                          const getEnemyTypeClass = () => {
                            if (enemy.flying) return { type: "Flying", icon: <Wind size={10} />, color: "cyan" };
                            if (enemy.isRanged) return { type: "Ranged", icon: <Crosshair size={10} />, color: "purple" };
                            if (enemy.armor > 0.2) return { type: "Armored", icon: <Shield size={10} />, color: "stone" };
                            if (enemy.speed > 0.4) return { type: "Fast", icon: <Gauge size={10} />, color: "green" };
                            return { type: "Ground", icon: <Flag size={10} />, color: "red" };
                          };
                          const enemyTypeClass = getEnemyTypeClass();

                          return (
                            <div
                              key={type}
                              className="bg-gradient-to-br from-stone-800/80 to-stone-900/80 rounded-xl border border-stone-700/50 overflow-hidden hover:border-red-700/50 transition-colors"
                            >
                              {/* Header */}
                              <div className={`px-3 py-1.5 border-b flex items-center justify-between ${
                                threat.color === "purple" ? "bg-purple-950/50 border-purple-800/30" :
                                threat.color === "orange" ? "bg-orange-950/50 border-orange-800/30" :
                                threat.color === "yellow" ? "bg-yellow-950/50 border-yellow-800/30" :
                                "bg-green-950/50 border-green-800/30"
                              }`}>
                                <div className={`flex items-center gap-1.5 ${
                                  threat.color === "purple" ? "text-purple-400" :
                                  threat.color === "orange" ? "text-orange-400" :
                                  threat.color === "yellow" ? "text-yellow-400" :
                                  "text-green-400"
                                }`}>
                                  {threat.color === "purple" ? <Crown size={10} /> : 
                                   threat.color === "orange" ? <Star size={10} /> : 
                                   <Target size={10} />}
                                  <span className="text-[10px] font-medium uppercase">{threat.level}</span>
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] ${
                                  enemyTypeClass.color === "cyan" ? "text-cyan-400" :
                                  enemyTypeClass.color === "purple" ? "text-purple-400" :
                                  enemyTypeClass.color === "stone" ? "text-stone-400" :
                                  enemyTypeClass.color === "green" ? "text-green-400" :
                                  "text-red-400"
                                }`}>
                                  {enemyTypeClass.icon}
                                  <span>{enemyTypeClass.type}</span>
                                </div>
                              </div>

                              <div className="p-3">
                                <div className="flex items-start gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-lg bg-stone-800/80 border border-red-900/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    <EnemySprite type={type} size={44} animated />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <h3 className="font-bold text-red-200 text-sm truncate">{enemy.name}</h3>
                                      {/* Lives Cost Badge */}
                                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-950/60 rounded border border-rose-800/50 flex-shrink-0">
                                        <Heart size={10} className="text-rose-400" />
                                        <span className="text-rose-300 font-bold text-[9px]">{enemy.liveCost || 1}</span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5">{enemy.desc}</p>
                                  </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-1 mb-2">
                                  <div className="bg-red-950/50 rounded px-1 py-0.5 text-center border border-red-900/40">
                                    <Heart size={10} className="mx-auto text-red-400 mb-0.5" />
                                    <div className="text-red-300 font-bold text-[10px]">{enemy.hp}</div>
                                  </div>
                                  <div className="bg-amber-950/50 rounded px-1 py-0.5 text-center border border-amber-900/40">
                                    <Coins size={10} className="mx-auto text-amber-400 mb-0.5" />
                                    <div className="text-amber-300 font-bold text-[10px]">{enemy.bounty}</div>
                                  </div>
                                  <div className="bg-green-950/50 rounded px-1 py-0.5 text-center border border-green-900/40">
                                    <Gauge size={10} className="mx-auto text-green-400 mb-0.5" />
                                    <div className="text-green-300 font-bold text-[10px]">{enemy.speed}</div>
                                  </div>
                                  <div className="bg-stone-800/50 rounded px-1 py-0.5 text-center border border-stone-700/40">
                                    <Shield size={10} className="mx-auto text-stone-400 mb-0.5" />
                                    <div className="text-stone-300 font-bold text-[10px]">{Math.round(enemy.armor * 100)}%</div>
                                  </div>
                                </div>

                                {/* Ranged Stats */}
                                {enemy.isRanged && (
                                  <div className="grid grid-cols-3 gap-1 mb-2">
                                    <div className="bg-purple-950/40 rounded px-1 py-0.5 text-center border border-purple-900/30">
                                      <div className="text-[8px] text-purple-500">Range</div>
                                      <div className="text-purple-300 font-bold text-[9px]">{enemy.range}</div>
                                    </div>
                                    <div className="bg-purple-950/40 rounded px-1 py-0.5 text-center border border-purple-900/30">
                                      <div className="text-[8px] text-purple-500">Atk Spd</div>
                                      <div className="text-purple-300 font-bold text-[9px]">{(enemy.attackSpeed / 1000).toFixed(1)}s</div>
                                    </div>
                                    <div className="bg-purple-950/40 rounded px-1 py-0.5 text-center border border-purple-900/30">
                                      <div className="text-[8px] text-purple-500">Dmg</div>
                                      <div className="text-purple-300 font-bold text-[9px]">{enemy.projectileDamage}</div>
                                    </div>
                                  </div>
                                )}

                                {/* AoE Stats */}
                                {hasAoE && (
                                  <div className="grid grid-cols-2 gap-1 mb-2">
                                    <div className="bg-orange-950/40 rounded px-1 py-0.5 text-center border border-orange-900/30">
                                      <div className="text-[8px] text-orange-500">AoE Radius</div>
                                      <div className="text-orange-300 font-bold text-[9px]">{enemy.aoeRadius}</div>
                                    </div>
                                    <div className="bg-orange-950/40 rounded px-1 py-0.5 text-center border border-orange-900/30">
                                      <div className="text-[8px] text-orange-500">AoE Dmg</div>
                                      <div className="text-orange-300 font-bold text-[9px]">{enemy.aoeDamage}</div>
                                    </div>
                                  </div>
                                )}

                                {/* Flying Troop Attack Stats */}
                                {enemy.targetsTroops && enemy.troopDamage && (
                                  <div className="grid grid-cols-2 gap-1 mb-2">
                                    <div className="bg-cyan-950/40 rounded px-1 py-0.5 text-center border border-cyan-900/30">
                                      <Wind size={10} className="mx-auto text-cyan-400 mb-0.5" />
                                      <div className="text-[8px] text-cyan-500">Swoop</div>
                                      <div className="text-cyan-300 font-bold text-[9px]">{enemy.troopDamage}</div>
                                    </div>
                                    <div className="bg-cyan-950/40 rounded px-1 py-0.5 text-center border border-cyan-900/30">
                                      <Timer size={10} className="mx-auto text-cyan-400 mb-0.5" />
                                      <div className="text-[8px] text-cyan-500">Speed</div>
                                      <div className="text-cyan-300 font-bold text-[9px]">{((enemy.troopAttackSpeed || 2000) / 1000).toFixed(1)}s</div>
                                    </div>
                                  </div>
                                )}

                                {/* Melee Combat Stats */}
                                {!enemy.flying && !enemy.breakthrough && !enemy.isRanged && (
                                  <div className="grid grid-cols-2 gap-1 mb-2">
                                    <div className="bg-red-950/40 rounded px-1 py-0.5 text-center border border-red-900/30">
                                      <Swords size={10} className="mx-auto text-red-400 mb-0.5" />
                                      <div className="text-[8px] text-red-500">Melee</div>
                                      <div className="text-red-300 font-bold text-[9px]">{enemy.troopDamage ?? 22}</div>
                                    </div>
                                    <div className="bg-red-950/40 rounded px-1 py-0.5 text-center border border-red-900/30">
                                      <Timer size={10} className="mx-auto text-red-400 mb-0.5" />
                                      <div className="text-[8px] text-red-500">Speed</div>
                                      <div className="text-red-300 font-bold text-[9px]">1.0s</div>
                                    </div>
                                  </div>
                                )}

                                {/* Breakthrough indicator */}
                                {enemy.breakthrough && (
                                  <div className="mb-2">
                                    <div className="bg-sky-950/40 rounded px-1 py-0.5 text-center border border-sky-900/30">
                                      <div className="text-sky-300 font-bold text-[9px] flex items-center justify-center gap-1">
                                        <Zap size={10} className="text-sky-400" />
                                        Bypasses Troops
                                      </div>
                                      {enemy.troopDamage != null && (
                                        <div className="text-[8px] text-sky-300/90">Hero: {enemy.troopDamage}</div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Traits */}
                                {traits.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {traits.map((trait, i) => {
                                      const traitInfo = getTraitInfo(trait);
                                      return (
                                        <span
                                          key={i}
                                          className={`text-[8px] px-1.5 py-0.5 bg-stone-800/60 rounded border border-stone-700/50 flex items-center gap-0.5 ${traitInfo.color}`}
                                        >
                                          {traitInfo.icon}
                                          <span>{traitInfo.label}</span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Abilities */}
                                {abilities.length > 0 && (
                                  <div className="space-y-1 max-h-16 overflow-y-auto">
                                    {abilities.map((ability, i) => {
                                      const abilityInfo = getAbilityInfo(ability.type);
                                      return (
                                        <div
                                          key={i}
                                          className={`p-1 rounded border ${abilityInfo.bgColor}`}
                                        >
                                          <div className="flex items-center gap-1">
                                            <span className={abilityInfo.color}>{abilityInfo.icon}</span>
                                            <span className="text-[9px] font-bold text-white">{ability.name}</span>
                                            <span className="text-[7px] px-1 bg-black/30 rounded text-white/70 ml-auto">
                                              {Math.round(ability.chance * 100)}%
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
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
            <div className="grid grid-cols-2 gap-4">
              {spells.map((s) => (
                <div
                  key={s.type}
                  className="bg-stone-800/60 rounded-xl p-4 border border-stone-700 flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <SpellSprite type={s.type} size={56} animated />
                  </div>
                  <div>
                    <h3 className="text-purple-300 font-bold mb-1">{s.name}</h3>
                    <p className="text-stone-400 text-sm mb-2">{s.desc}</p>
                    <span className="text-amber-400 text-xs">
                      Cost: {s.cost > 0 ? `${s.cost} PP` : "Free"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </OrnateFrame>
      </div>
    </div>
  );
};

export default MainMenu;
