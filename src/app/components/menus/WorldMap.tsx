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
  Crosshair,
  Users,
  Coins,
  Gauge,
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
} from "../../constants";
import {
  TowerSprite,
  HeroSprite,
  EnemySprite,
  SpellSprite,
} from "../../sprites";

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
    description: "Training grounds for new defenders",
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
    <div className="relative flex items-center gap-4">
      <div className="absolute -inset-4 blur-2xl opacity-60">
        <div
          className="absolute inset-0 bg-gradient-to-r from-orange-600/40 via-amber-400/50 to-orange-600/40"
          style={{ transform: `scale(${1 + Math.sin(pulse * 0.1) * 0.1})` }}
        />
      </div>
      <div className="relative">
        <svg viewBox="0 0 56 68" className="w-10 h-12 drop-shadow-2xl">
          <defs>
            <linearGradient id="shieldMain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="shieldInner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="100%" stopColor="#292524" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M28 3 L52 14 L52 38 C52 52 28 65 28 65 C28 65 4 52 4 38 L4 14 Z"
            fill="url(#shieldMain)"
            stroke="#fcd34d"
            strokeWidth="2"
            filter="url(#glow)"
          />
          <path
            d="M28 10 L46 18 L46 36 C46 47 28 57 28 57 C28 57 10 47 10 36 L10 18 Z"
            fill="url(#shieldInner)"
          />
          <text
            x="28"
            y="42"
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="28"
            fontWeight="900"
            fontFamily="serif"
            filter="url(#glow)"
          >
            P
          </text>
        </svg>
      </div>
      <div className="relative flex flex-col">
        <span
          className="text-2xl font-black tracking-wider"
          style={{
            background:
              "linear-gradient(180deg, #fcd34d 0%, #f59e0b 40%, #d97706 70%, #92400e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          PRINCETON
        </span>
        <div className="flex items-center gap-2 -mt-0.5">
          <Swords size={14} className="text-orange-400" />
          <span className="text-xs font-bold tracking-[0.3em] text-amber-500/90">
            KINGDOM DEFENSE
          </span>
          <Swords
            size={14}
            className="text-orange-400"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
      </div>
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

  const getTowerStats = (
    type: keyof typeof TOWER_DATA,
    level: number,
    upgrade?: "A" | "B"
  ) => {
    const base = TOWER_DATA[type];
    let damage = base.damage;
    let range = base.range;
    let attackSpeed = base.attackSpeed;
    if (level >= 2) {
      damage = Math.floor(damage * 1.5);
      range += 15;
    }
    if (level >= 3) {
      damage = Math.floor(damage * 1.47);
      range += 15;
    }
    if (level >= 4) {
      damage = Math.floor(damage * 1.36);
      range += 20;
    }
    if (upgrade === "A" && type === "cannon") {
      attackSpeed = Math.floor(attackSpeed / 8);
      damage = Math.floor(damage * 0.4);
    }
    if (upgrade === "B" && type === "lab") {
      damage = Math.floor(damage * 0.7);
    }
    return { damage, range, attackSpeed };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-2xl border-2 border-amber-700/60 shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-900/90 via-stone-800/90 to-amber-900/90 backdrop-blur px-6 py-4 border-b-2 border-amber-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="text-amber-400" size={28} />
            <h2 className="text-3xl font-bold text-amber-300">War Codex</h2>
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

        <div className="flex border-b border-amber-800/40 bg-stone-900/50">
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
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all font-medium ${
                activeTab === tab.id
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

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-140px)]">
          {activeTab === "towers" && !selectedTower && (
            <div className="grid grid-cols-3 gap-4">
              {towerTypes.map((type) => {
                const tower = TOWER_DATA[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedTower(type)}
                    className="bg-gradient-to-br from-amber-950/40 to-stone-900/60 rounded-xl border border-amber-800/40 p-4 hover:border-amber-500/60 hover:scale-[1.02] text-left group transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-stone-800 border border-amber-700/50 flex items-center justify-center group-hover:border-amber-500">
                        <TowerSprite type={type} size={52} level={1} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-amber-300 group-hover:text-amber-200">
                          {tower.name}
                        </h3>
                        <p className="text-xs text-amber-500/80 mb-2 line-clamp-2">
                          {tower.desc}
                        </p>
                        <div className="flex gap-3 text-xs">
                          <span className="text-red-400 flex items-center gap-1">
                            <Swords size={10} /> {tower.damage}
                          </span>
                          <span className="text-blue-400 flex items-center gap-1">
                            <Target size={10} /> {tower.range}
                          </span>
                          <span className="text-amber-400 flex items-center gap-1">
                            <Coins size={10} /> {tower.cost}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-amber-600 group-hover:text-amber-400 mt-2"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "towers" &&
            selectedTower &&
            (() => {
              const tower =
                TOWER_DATA[selectedTower as keyof typeof TOWER_DATA];
              return (
                <div>
                  <button
                    onClick={() => setSelectedTower(null)}
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-4"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    <span>Back to all towers</span>
                  </button>
                  <div className="space-y-6">
                    <div className="flex items-start gap-6 p-4 bg-amber-950/30 rounded-xl border border-amber-800/40">
                      <div className="w-24 h-24 rounded-xl bg-stone-800 border-2 border-amber-600 flex items-center justify-center">
                        <TowerSprite
                          type={selectedTower as keyof typeof TOWER_DATA}
                          size={80}
                          level={4}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-amber-200 mb-1">
                          {tower.name}
                        </h3>
                        <p className="text-amber-500 mb-3">{tower.desc}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="px-3 py-1.5 bg-amber-900/50 rounded-lg border border-amber-700/50">
                            <span className="text-amber-500">Base Cost:</span>
                            <span className="text-amber-300 font-bold ml-2">
                              {tower.cost} PP
                            </span>
                          </div>
                          {tower.damage > 0 && (
                            <div className="px-3 py-1.5 bg-red-900/30 rounded-lg border border-red-800/40">
                              <span className="text-red-500">Base Damage:</span>
                              <span className="text-red-300 font-bold ml-2">
                                {tower.damage}
                              </span>
                            </div>
                          )}
                          <div className="px-3 py-1.5 bg-blue-900/30 rounded-lg border border-blue-800/40">
                            <span className="text-blue-500">Range:</span>
                            <span className="text-blue-300 font-bold ml-2">
                              {tower.range}
                            </span>
                          </div>
                          {tower.attackSpeed > 0 && (
                            <div className="px-3 py-1.5 bg-green-900/30 rounded-lg border border-green-800/40">
                              <span className="text-green-500">
                                Attack Speed:
                              </span>
                              <span className="text-green-300 font-bold ml-2">
                                {tower.attackSpeed}ms
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                        <ArrowUp size={18} />
                        Level Progression
                      </h4>
                      <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((level) => {
                          const stats = getTowerStats(
                            selectedTower as keyof typeof TOWER_DATA,
                            level
                          );
                          const upgradeCost =
                            level === 1
                              ? tower.cost
                              : level === 2
                              ? 60
                              : level === 3
                              ? 90
                              : 150;
                          return (
                            <div
                              key={level}
                              className={`p-3 rounded-lg border ${
                                level === 4
                                  ? "bg-purple-950/40 border-purple-700/50"
                                  : "bg-stone-800/50 border-stone-700/40"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(level)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      className="text-yellow-400 fill-yellow-400"
                                    />
                                  ))}
                                </div>
                                <span className="text-amber-300 font-bold">
                                  Level {level}
                                </span>
                              </div>
                              <p className="text-xs text-amber-500 mb-2">
                                {tower.levelDesc[level as 1 | 2 | 3 | 4]}
                              </p>
                              <div className="space-y-1 text-[10px]">
                                {tower.damage > 0 && (
                                  <div className="text-red-400 flex items-center gap-1">
                                    <Swords size={10} /> Damage: {stats.damage}
                                  </div>
                                )}
                                <div className="text-blue-400 flex items-center gap-1">
                                  <Target size={10} /> Range: {stats.range}
                                </div>
                                {tower.attackSpeed > 0 && (
                                  <div className="text-green-400 flex items-center gap-1">
                                    <Gauge size={10} /> Speed:{" "}
                                    {stats.attackSpeed}ms
                                  </div>
                                )}
                                <div className="text-amber-400 mt-1 pt-1 border-t border-amber-800/30 flex items-center gap-1">
                                  <Coins size={10} /> Cost: {upgradeCost} PP
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                        <Flame size={18} />
                        Evolution Paths (Level 4)
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {(["A", "B"] as const).map((path) => {
                          const upgrade = tower.upgrades[path];
                          const color = path == "A" ? "red" : "blue";
                          const stats = getTowerStats(
                            selectedTower as keyof typeof TOWER_DATA,
                            4,
                            path
                          );
                          return (
                            <div
                              key={path}
                              className={`bg-gradient-to-br from-${color}-950/50 to-stone-900/60 rounded-xl border-amber-700 border p-4`}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div
                                  className={`w-16 h-16 rounded-lg bg-${color}-900/30 border border-stone-700 flex items-center justify-center`}
                                >
                                  <TowerSprite
                                    type={
                                      selectedTower as keyof typeof TOWER_DATA
                                    }
                                    size={52}
                                    level={4}
                                  />
                                </div>
                                <div>
                                  <div
                                    className={`text-xs text-${color}-400 uppercase tracking-wider`}
                                  >
                                    Path {path} -{" "}
                                    {path === "A" ? "Offensive" : "Utility"}
                                  </div>
                                  <h5
                                    className={`text-xl font-bold text-${color}-300`}
                                  >
                                    {upgrade.name}
                                  </h5>
                                </div>
                              </div>
                              <p
                                className={`text-sm text-${color}-400/80 mb-3`}
                              >
                                {upgrade.desc}
                              </p>
                              <div
                                className={`bg-${color}-950/50 rounded-lg p-3 border border-${color}-800/40`}
                              >
                                <div
                                  className={`text-xs text-${color}-500 uppercase tracking-wider mb-1 flex items-center gap-1`}
                                >
                                  <Sparkles size={12} /> Special Effect
                                </div>
                                <p className={`text-sm text-${color}-200`}>
                                  {upgrade.effect}
                                </p>
                              </div>
                              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                                {tower.damage > 0 && (
                                  <div className="bg-stone-800/50 rounded p-1.5 text-center">
                                    <div className="text-red-400">DMG</div>
                                    <div className="text-red-300 font-bold">
                                      {stats.damage}
                                    </div>
                                  </div>
                                )}
                                <div className="bg-stone-800/50 rounded p-1.5 text-center">
                                  <div className="text-blue-400">RNG</div>
                                  <div className="text-blue-300 font-bold">
                                    {stats.range}
                                  </div>
                                </div>
                                {tower.attackSpeed > 0 && (
                                  <div className="bg-stone-800/50 rounded p-1.5 text-center">
                                    <div className="text-green-400">SPD</div>
                                    <div className="text-green-300 font-bold">
                                      {stats.attackSpeed}ms
                                    </div>
                                  </div>
                                )}
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
            <div className="grid grid-cols-2 gap-4">
              {heroTypes.map((type) => {
                const hero = HERO_DATA[type];
                const cooldown = HERO_ABILITY_COOLDOWNS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedHeroDetail(type)}
                    className="bg-gradient-to-br from-amber-950/40 to-stone-900/60 rounded-xl border border-amber-800/40 p-4 hover:border-amber-500/60 text-left group transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-20 h-20 rounded-xl border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor: hero.color,
                          backgroundColor: hero.color + "20",
                        }}
                      >
                        <HeroSprite type={type} size={64} color={hero.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-amber-300 group-hover:text-amber-200">
                          {hero.name} {hero.icon}
                        </h3>
                        <p className="text-xs text-amber-500/70 mb-2 line-clamp-2">
                          {hero.description}
                        </p>
                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                          <div className="bg-red-950/50 rounded px-1.5 py-1 text-center border border-red-800/40">
                            <div className="text-[9px] text-red-500">HP</div>
                            <div className="text-red-300 font-bold text-xs">
                              {hero.hp}
                            </div>
                          </div>
                          <div className="bg-orange-950/50 rounded px-1.5 py-1 text-center border border-orange-800/40">
                            <div className="text-[9px] text-orange-500">
                              DMG
                            </div>
                            <div className="text-orange-300 font-bold text-xs">
                              {hero.damage}
                            </div>
                          </div>
                          <div className="bg-blue-950/50 rounded px-1.5 py-1 text-center border border-blue-800/40">
                            <div className="text-[9px] text-blue-500">RNG</div>
                            <div className="text-blue-300 font-bold text-xs">
                              {hero.range}
                            </div>
                          </div>
                          <div className="bg-green-950/50 rounded px-1.5 py-1 text-center border border-green-800/40">
                            <div className="text-[9px] text-green-500">SPD</div>
                            <div className="text-green-300 font-bold text-xs">
                              {hero.speed}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-purple-400 flex items-center gap-1 bg-purple-900/30 px-2 py-1 rounded border border-purple-700/40">
                          <Sparkles size={10} />
                          <span className="font-medium">{hero.ability}</span>
                          <span className="text-purple-500">|</span>
                          <Timer size={10} />
                          <span className="text-purple-300">
                            {cooldown / 1000}s
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-amber-600 group-hover:text-amber-400 mt-2"
                      />
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
              const cooldown =
                HERO_ABILITY_COOLDOWNS[selectedHeroDetail as HeroType];
              const abilityDetails: Record<string, string[]> = {
                tiger: [
                  "Stuns ALL enemies within 180 range for 3 seconds",
                  "Applies 50% slow effect after stun ends",
                  "Creates orange fear shockwave visual effect",
                ],
                tenor: [
                  "Deals 80 damage to all enemies within 250 range",
                  "Stuns affected enemies for 2 seconds",
                  "Purple sonic waves with musical notes",
                ],
                mathey: [
                  "Hero becomes invincible for 5 seconds",
                  "Taunts all nearby enemies within 150 range",
                  "Enemies forced to target the hero",
                  "Hexagonal blue shield with rotating runes",
                ],
                rocky: [
                  "Massive AoE damage in target area",
                  "Damage falls off from center of impact",
                  "Ground crater with dust cloud effect",
                ],
                scott: [
                  "Boosts ALL tower damage by 50% for 8 seconds",
                  "Golden light rays emanate from hero",
                  "Affects every tower on the map",
                ],
                captain: [
                  "Summons 3 knight troops near the hero",
                  "Knights have 500 HP and 30 damage each",
                  "Summoning circle with energy pillars effect",
                ],
                engineer: [
                  "Deploys a Level 2 Cannon turret nearby",
                  "Turret lasts for 20 seconds",
                  "Construction sparks and build effect",
                ],
              };
              const roleInfo: Record<
                string,
                { role: string; strategy: string }
              > = {
                tiger: {
                  role: "Frontline Brawler / Crowd Controller",
                  strategy:
                    "The Tiger excels at diving into enemy formations. Use Mighty Roar when enemies are clustered.",
                },
                tenor: {
                  role: "Area Damage / Support",
                  strategy:
                    "The Tenor provides excellent AoE damage. Position near chokepoints to maximize damage output.",
                },
                mathey: {
                  role: "Tank / Protector",
                  strategy:
                    "Use Fortress Shield when overwhelmed to draw enemy fire and protect towers. Highest HP in the game.",
                },
                rocky: {
                  role: "Ranged Artillery",
                  strategy:
                    "Rocky provides devastating ranged damage. Position him behind your front line.",
                },
                scott: {
                  role: "Support / Buffer",
                  strategy:
                    "F. Scott is a pure support hero. Use Inspiration during critical waves to boost tower damage.",
                },
                captain: {
                  role: "Summoner / Commander",
                  strategy:
                    "The Captain summons reinforcements. Use Rally Knights when you need extra bodies on the field.",
                },
                engineer: {
                  role: "Tactical Support",
                  strategy:
                    "The Engineer provides additional tower coverage. Place turrets strategically to cover weak points.",
                },
              };
              return (
                <div>
                  <button
                    onClick={() => setSelectedHeroDetail(null)}
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-4"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    <span>Back to all heroes</span>
                  </button>
                  <div className="space-y-6">
                    <div className="flex items-start gap-6 p-5 bg-gradient-to-br from-amber-950/40 to-stone-900/60 rounded-xl border border-amber-800/40">
                      <div
                        className="w-28 h-28 rounded-xl border-3 flex items-center justify-center flex-shrink-0"
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
                        <p className="text-amber-500 text-sm mb-4">
                          {hero.description}
                        </p>
                        <div className="grid grid-cols-5 gap-3">
                          <div className="bg-red-950/50 rounded-lg p-3 text-center border border-red-800/40">
                            <Heart
                              size={18}
                              className="mx-auto text-red-400 mb-1"
                            />
                            <div className="text-xs text-red-500">Health</div>
                            <div className="text-red-300 font-bold text-xl">
                              {hero.hp}
                            </div>
                          </div>
                          <div className="bg-orange-950/50 rounded-lg p-3 text-center border border-orange-800/40">
                            <Swords
                              size={18}
                              className="mx-auto text-orange-400 mb-1"
                            />
                            <div className="text-xs text-orange-500">
                              Damage
                            </div>
                            <div className="text-orange-300 font-bold text-xl">
                              {hero.damage}
                            </div>
                          </div>
                          <div className="bg-blue-950/50 rounded-lg p-3 text-center border border-blue-800/40">
                            <Target
                              size={18}
                              className="mx-auto text-blue-400 mb-1"
                            />
                            <div className="text-xs text-blue-500">Range</div>
                            <div className="text-blue-300 font-bold text-xl">
                              {hero.range}
                            </div>
                          </div>
                          <div className="bg-green-950/50 rounded-lg p-3 text-center border border-green-800/40">
                            <Gauge
                              size={18}
                              className="mx-auto text-green-400 mb-1"
                            />
                            <div className="text-xs text-green-500">
                              Atk Speed
                            </div>
                            <div className="text-green-300 font-bold text-xl">
                              {hero.attackSpeed}ms
                            </div>
                          </div>
                          <div className="bg-cyan-950/50 rounded-lg p-3 text-center border border-cyan-800/40">
                            <Wind
                              size={18}
                              className="mx-auto text-cyan-400 mb-1"
                            />
                            <div className="text-xs text-cyan-500">
                              Move Speed
                            </div>
                            <div className="text-cyan-300 font-bold text-xl">
                              {hero.speed}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-950/50 to-stone-900/60 rounded-xl border-2 border-purple-700/50 p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-800/50 border border-purple-600/50 flex items-center justify-center">
                          <Sparkles size={24} className="text-purple-300" />
                        </div>
                        <div>
                          <div className="text-xs text-purple-400 uppercase tracking-wider">
                            Special Ability
                          </div>
                          <h4 className="text-2xl font-bold text-purple-200">
                            {hero.ability}
                          </h4>
                        </div>
                        <div className="ml-auto flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded-lg border border-purple-700/50">
                          <Timer size={16} className="text-purple-400" />
                          <span className="text-purple-300 font-bold">
                            {cooldown / 1000}s Cooldown
                          </span>
                        </div>
                      </div>
                      <p className="text-purple-200 text-lg mb-4">
                        {hero.abilityDesc}
                      </p>
                      <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-800/40">
                        <div className="text-xs text-purple-500 uppercase tracking-wider mb-2">
                          Ability Details
                        </div>
                        <ul className="text-sm text-purple-300 space-y-1">
                          {abilityDetails[selectedHeroDetail]?.map(
                            (detail, i) => (
                              <li key={i}>• {detail}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-stone-800/50 rounded-xl border border-stone-700/50 p-4">
                      <h4 className="text-amber-300 font-bold mb-3 flex items-center gap-2">
                        <Info size={16} /> Combat Role & Strategy
                      </h4>
                      <div className="text-amber-500/80 text-sm space-y-2">
                        <p>
                          <strong className="text-amber-300">Role:</strong>{" "}
                          {roleInfo[selectedHeroDetail]?.role}
                        </p>
                        <p>{roleInfo[selectedHeroDetail]?.strategy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          {activeTab === "enemies" && (
            <div className="grid grid-cols-3 gap-4">
              {enemyTypes.map((type) => {
                const enemy = ENEMY_DATA[type];
                return (
                  <div
                    key={type}
                    className="bg-gradient-to-br from-red-950/30 to-stone-900/60 rounded-xl border border-red-800/30 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-stone-800 border border-red-700/40 flex items-center justify-center flex-shrink-0">
                        <EnemySprite type={type} size={52} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-red-300">
                          {enemy.name}
                        </h3>
                        <p className="text-xs text-red-400/70 mb-2 line-clamp-2">
                          {enemy.desc}
                        </p>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          <div className="bg-red-950/50 rounded px-1.5 py-1 text-center">
                            <div className="text-red-500">HP</div>
                            <div className="text-red-300 font-bold">
                              {enemy.hp}
                            </div>
                          </div>
                          <div className="bg-amber-950/50 rounded px-1.5 py-1 text-center">
                            <div className="text-amber-500">💰</div>
                            <div className="text-amber-300 font-bold">
                              {enemy.bounty}
                            </div>
                          </div>
                          <div className="bg-green-950/50 rounded px-1.5 py-1 text-center">
                            <div className="text-green-500">SPD</div>
                            <div className="text-green-300 font-bold">
                              {enemy.speed}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {enemy.armor > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-stone-700/50 rounded text-stone-300 border border-stone-600/50">
                              🛡️ {Math.round(enemy.armor * 100)}% Armor
                            </span>
                          )}
                          {enemy.flying && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-cyan-900/50 rounded text-cyan-300 border border-cyan-700/50">
                              ✈️ Flying
                            </span>
                          )}
                          {(enemy as any).isRanged && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-purple-900/50 rounded text-purple-300 border border-purple-700/50">
                              🏹 Ranged
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "spells" && (
            <div className="grid grid-cols-1 gap-4">
              {spellTypes.map((type) => {
                const spell = SPELL_DATA[type];
                const spellDetails: Record<string, string[]> = {
                  fireball: [
                    "Meteor falls from sky with 1 second delay",
                    "200 base damage at center",
                    "Damage falls off with distance (50% at edge)",
                    "150 unit AoE radius",
                    "Best against clustered enemies",
                  ],
                  lightning: [
                    "Chains to up to 5 different enemies",
                    "600 total damage split among targets",
                    "Each strike stuns for 0.5 seconds",
                    "200ms delay between each chain",
                    "Best for picking off multiple targets",
                  ],
                  freeze: [
                    "Freezes ALL enemies on the map",
                    "Enemies completely immobilized for 3 seconds",
                    "Creates expanding ice wave effect",
                    "Best when you need breathing room",
                  ],
                  payday: [
                    "Base payout: 80 Paw Points",
                    "Bonus: +5 PP per enemy on screen (max +50)",
                    "Maximum possible: 130 PP",
                    "Gold aura effect on all enemies",
                    "Best used when many enemies present",
                  ],
                  reinforcements: [
                    "Summons 3 armored knight troops",
                    "Each knight has 500 HP and 30 damage",
                    "Click to place them anywhere on the map",
                    "Knights fight independently",
                    "Best for blocking or supporting weak points",
                  ],
                };
                return (
                  <div
                    key={type}
                    className="bg-gradient-to-br from-purple-950/40 to-stone-900/60 rounded-xl border border-purple-800/40 p-5"
                  >
                    <div className="flex items-start gap-5">
                      <div className="w-20 h-20 rounded-xl bg-purple-900/50 border-2 border-purple-600/50 flex items-center justify-center p-2 flex-shrink-0">
                        <SpellSprite type={type} size={64} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-purple-300">
                            {spell.name}
                          </h3>
                          <span className="text-2xl">{spell.icon}</span>
                        </div>
                        <p className="text-purple-400/80 mb-4">{spell.desc}</p>
                        <div className="flex gap-4 mb-4">
                          <div className="bg-amber-950/50 rounded-lg px-4 py-2 border border-amber-800/40">
                            <div className="text-xs text-amber-500">Cost</div>
                            <div className="text-amber-300 font-bold text-xl flex items-center gap-1">
                              <Coins size={16} />
                              {spell.cost > 0 ? `${spell.cost} PP` : "FREE"}
                            </div>
                          </div>
                          <div className="bg-blue-950/50 rounded-lg px-4 py-2 border border-blue-800/40">
                            <div className="text-xs text-blue-500">
                              Cooldown
                            </div>
                            <div className="text-blue-300 font-bold text-xl flex items-center gap-1">
                              <Timer size={16} />
                              {spell.cooldown / 1000}s
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
                          <div className="text-xs text-purple-500 uppercase tracking-wider mb-2">
                            Effect Details
                          </div>
                          <ul className="text-sm text-purple-300 space-y-1">
                            {spellDetails[type]?.map((detail, i) => (
                              <li key={i}>• {detail}</li>
                            ))}
                          </ul>
                        </div>
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

  // Cycle through scenes every 4 seconds
  useEffect(() => {
    const sceneIndex = Math.floor(animTime / 4) % 5;
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

    // Scene backgrounds based on region
    const scenes = [
      { bg1: "#2d4a1f", bg2: "#1a2a0f", accent: "#4ade80" }, // Grassland
      { bg1: "#4a5a2a", bg2: "#2a3a1a", accent: "#4ade80" }, // Swamp
      { bg1: "#8a7050", bg2: "#5a4a30", accent: "#fbbf24" }, // Desert
      { bg1: "#4a5a6a", bg2: "#2a3a4a", accent: "#60a5fa" }, // Winter
      { bg1: "#4a2020", bg2: "#2a1010", accent: "#ef4444" }, // Volcanic
      { bg1: "#3a3a5a", bg2: "#1a1a2a", accent: "#a855f7" }, // Night battle
    ];
    const scene = scenes[currentScene];

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, scene.bg1);
    bgGrad.addColorStop(1, scene.bg2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ground
    ctx.fillStyle = scene.bg2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    for (let x = 0; x <= width; x += 20) {
      ctx.lineTo(x, height * 0.7 + Math.sin(x * 0.05 + t) * 5);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Draw towers
    const drawTower = (x: number, y: number, scale: number) => {
      ctx.fillStyle = "#5a5a5a";
      ctx.fillRect(x - 15 * scale, y - 40 * scale, 30 * scale, 45 * scale);
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(x - 20 * scale, y - 50 * scale, 40 * scale, 15 * scale);
      // Crenellations
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(
          x - 18 * scale + i * 12 * scale,
          y - 58 * scale,
          8 * scale,
          10 * scale
        );
      }
      // Window glow
      ctx.fillStyle = `rgba(255, 200, 100, ${0.4 + Math.sin(t * 2 + x) * 0.2})`;
      ctx.fillRect(x - 5 * scale, y - 30 * scale, 10 * scale, 12 * scale);
    };

    drawTower(width * 0.15, height * 0.7, 0.8);
    drawTower(width * 0.4, height * 0.65, 1);
    drawTower(width * 0.7, height * 0.72, 0.7);

    // Draw soldiers fighting
    const drawSoldier = (
      x: number,
      y: number,
      friendly: boolean,
      swingPhase: number
    ) => {
      const color = friendly ? "#f59e0b" : "#dc2626";
      const bounce = Math.sin(t * 4 + x) * 2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y - 10 + bounce, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 3, y - 5 + bounce, 6, 12);
      // Sword
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + (friendly ? 3 : -3), y - 3 + bounce);
      ctx.lineTo(
        x + (friendly ? 12 : -12) + Math.sin(t * 5 + swingPhase) * 6,
        y - 6 + bounce
      );
      ctx.stroke();
    };

    // Battle clusters
    for (let i = 0; i < 4; i++) {
      const bx = width * (0.25 + i * 0.18);
      const by = height * 0.75 + Math.sin(i * 2) * 15;
      drawSoldier(bx - 10, by, true, i);
      drawSoldier(bx + 10, by, false, i + 1);
      // Sparks
      if (Math.sin(t * 3 + i) > 0.3) {
        ctx.fillStyle = "#ffd700";
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.arc(
            bx + Math.sin(j * 3 + t) * 8,
            by - 8 + Math.cos(j * 2 + t) * 5,
            2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Projectiles
    for (let i = 0; i < 3; i++) {
      const px =
        ((width * 0.2 + t * 80 + i * 100) % (width * 0.8)) + width * 0.1;
      const py = height * 0.5 + Math.sin(px * 0.02) * 30;
      ctx.fillStyle = scene.accent;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      // Trail
      ctx.strokeStyle = scene.accent + "60";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - 20, py + 5);
      ctx.stroke();
    }

    // Fog overlay
    const fogGrad = ctx.createLinearGradient(0, 0, 0, height);
    fogGrad.addColorStop(0, "rgba(28, 25, 23, 0.6)");
    fogGrad.addColorStop(0.5, "rgba(28, 25, 23, 0.3)");
    fogGrad.addColorStop(1, "rgba(28, 25, 23, 0.8)");
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, width, height);

    // Fog wisps
    ctx.fillStyle = "rgba(100, 90, 80, 0.15)";
    for (let i = 0; i < 3; i++) {
      const wx = ((t * 20 + i * 150) % (width + 200)) - 100;
      const wy = height * (0.3 + i * 0.2);
      ctx.beginPath();
      ctx.ellipse(wx, wy, 100, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vignette
    const vignetteGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width * 0.7
    );
    vignetteGrad.addColorStop(0, "transparent");
    vignetteGrad.addColorStop(0.7, "rgba(28, 25, 23, 0.4)");
    vignetteGrad.addColorStop(1, "rgba(28, 25, 23, 0.9)");
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, width, height);
  }, [animTime, currentScene]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Canvas Battle Scene */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-amber-900/50 border-2 border-amber-700/60 flex items-center justify-center mb-4 backdrop-blur-sm">
          <MapPin size={40} className="text-amber-500" />
        </div>

        <h3 className="text-xl font-bold text-amber-300 mb-2 drop-shadow-lg">
          Select a Battlefield
        </h3>
        <p className="text-amber-500 text-sm max-w-xs drop-shadow-md">
          Click on any unlocked location on the map to view battle details and
          begin your campaign
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-amber-400">
          <div className="w-4 h-4 rounded-full bg-amber-600/60 border border-amber-500/70 shadow-lg shadow-amber-500/30" />
          <span>= Unlocked Location</span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// WORLD MAP COMPONENT
// =============================================================================

interface WorldMapProps {
  selectedMap: string;
  setSelectedMap: (map: string) => void;
  setGameState: (state: GameState) => void;
  levelStars: LevelStars;
  unlockedMaps: string[];
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType | null) => void;
  selectedSpells: SpellType[];
  setSelectedSpells: (spells: SpellType[]) => void;
  unlockLevel: (levelId: string) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  selectedMap,
  setSelectedMap,
  setGameState,
  levelStars,
  unlockedMaps,
  selectedHero,
  setSelectedHero,
  selectedSpells,
  setSelectedSpells,
  unlockLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showCodex, setShowCodex] = useState(false);
  const [animTime, setAnimTime] = useState(0);
  const [mapHeight, setMapHeight] = useState(500);
  const [hoveredHero, setHoveredHero] = useState<HeroType | null>(null);
  const [hoveredSpell, setHoveredSpell] = useState<SpellType | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});

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

    // Background with war atmosphere
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width
    );
    bgGrad.addColorStop(0, "#4a3a2a");
    bgGrad.addColorStop(0.5, "#3a2a1a");
    bgGrad.addColorStop(1, "#2a1a0a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Parchment texture
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 300; i++) {
      const x = seededRandom(i * 3) * width;
      const y = seededRandom(i * 3 + 1) * height;
      const size = 2 + seededRandom(i * 3 + 2) * 8;
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
        name: "MURKY MARSHES",
        x: 380,
        w: 340,
        colors: ["#2a3a2a", "#1a2a1a"],
        labelColor: "#4a8a4a",
      },
      {
        name: "SAHARA SANDS",
        x: 720,
        w: 360,
        colors: ["#9a8060", "#8a7050"],
        labelColor: "#e8a838",
      },
      {
        name: "FROZEN FRONTIER",
        x: 1080,
        w: 360,
        colors: ["#5a6a7a", "#4a5a6a"],
        labelColor: "#88c8e8",
      },
      {
        name: "INFERNO DEPTHS",
        x: 1440,
        w: 380,
        colors: ["#5a3030", "#4a2020"],
        labelColor: "#e84848",
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
      ctx.font = "bold 13px 'Cinzel', serif";
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
    // Trees
    const drawTree = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(x + 2, y + 5, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(x - 3 * scale, y - 12 * scale, 6 * scale, 17 * scale);
      ctx.fillStyle = "#2d5a1f";
      ctx.beginPath();
      ctx.arc(x, y - 18 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3d6a2f";
      ctx.beginPath();
      ctx.arc(x - 4 * scale, y - 14 * scale, 8 * scale, 0, Math.PI * 2);
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
    ].forEach(([x, yPct], i) => {
      drawTree(x, yPct, 0.6 + seededRandom(i + 100) * 0.4);
    });

    // Military camp (grassland)
    const drawCamp = (cx: number, cyPct: number) => {
      const cy = getY(cyPct);
      // Tent
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 18);
      ctx.lineTo(cx + 20, cy + 6);
      ctx.lineTo(cx - 20, cy + 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Flag
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(cx + 18, cy - 20, 2, 26);
      ctx.fillStyle = "#f59e0b";
      const fw = Math.sin(time * 3 + cx) * 2;
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - 18);
      ctx.quadraticCurveTo(cx + 28, cy - 14 + fw, cx + 32, cy - 12);
      ctx.quadraticCurveTo(cx + 28, cy - 10 + fw, cx + 20, cy - 6);
      ctx.closePath();
      ctx.fill();
      // Campfire with animated glow
      ctx.fillStyle = `rgba(255, 100, 0, ${0.5 + Math.sin(time * 5) * 0.3})`;
      ctx.beginPath();
      ctx.arc(cx - 10, cy + 4, 4, 0, Math.PI * 2);
      ctx.fill();
      // Smoke particles
      for (let i = 0; i < 3; i++) {
        const sy = cy - 5 - ((time * 15 + i * 8) % 20);
        const sx = cx - 10 + Math.sin(time * 2 + i) * 3;
        ctx.globalAlpha = 0.3 - ((time * 15 + i * 8) % 20) / 60;
        ctx.fillStyle = "#888";
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + i, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    drawCamp(100, 25);
    drawCamp(180, 55);
    drawCamp(290, 78);
    drawCamp(620, 78);
    drawCamp(540, 28);
    drawCamp(860, 34);

    // Watch tower
    const drawWatchTower = (tx: number, tyPct: number) => {
      const ty = getY(tyPct);
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(tx - 8, ty - 35, 16, 40);
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(tx - 12, ty - 40, 24, 8);
      // Crenellations
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(tx - 12 + i * 6, ty - 46, 4, 6);
      }
      // Window with light
      ctx.fillStyle = `rgba(255, 200, 100, ${
        0.4 + Math.sin(time * 2 + tx) * 0.2
      })`;
      ctx.fillRect(tx - 3, ty - 30, 6, 8);
    };
    drawWatchTower(55, 66);
    drawWatchTower(220, 25);
    drawWatchTower(230, 70);
    drawWatchTower(330, 42);
    drawWatchTower(490, 70);
    drawWatchTower(867, 33);
    drawWatchTower(1290, 52);

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
    const drawWillowTree = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(x + 5, y + 2, 12 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Twisted Trunk
      ctx.fillStyle = "#1a1614";
      ctx.beginPath();
      ctx.moveTo(x - 2 * scale, y);
      ctx.quadraticCurveTo(x - 5 * scale, y - 10 * scale, x, y - 25 * scale);
      ctx.quadraticCurveTo(x + 5 * scale, y - 10 * scale, x + 4 * scale, y);
      ctx.fill();

      // Drooping Canopy
      ctx.fillStyle = "#2a3a2a";
      ctx.beginPath();
      ctx.arc(x, y - 28 * scale, 15 * scale, 0, Math.PI * 2);
      ctx.arc(x - 10 * scale, y - 22 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.arc(x + 10 * scale, y - 22 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Vines (hanging)
      ctx.strokeStyle = "#1a2a1a";
      ctx.lineWidth = 1 * scale;
      for (let i = 0; i < 5; i++) {
        const vx = x - 10 * scale + i * 5 * scale;
        const vy = y - 20 * scale;
        const len = 15 * scale + Math.sin(time * 2 + i + x) * 3;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.quadraticCurveTo(
          vx + Math.sin(time + i) * 2,
          vy + len / 2,
          vx,
          vy + len
        );
        ctx.stroke();
      }
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
    ].forEach(([x, yPct], i) => {
      drawWillowTree(x, yPct, 0.7 + seededRandom(i + 500) * 0.4);
    });

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

    // === DESERT DETAILS === (Coordinates Shifted Right)
    // Cacti
    const drawCactus = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      ctx.fillStyle = "#2d5a1e";
      ctx.fillRect(x - 4 * scale, y - 25 * scale, 8 * scale, 30 * scale);
      ctx.fillRect(x - 12 * scale, y - 18 * scale, 8 * scale, 4 * scale);
      ctx.fillRect(x - 12 * scale, y - 24 * scale, 4 * scale, 10 * scale);
      ctx.fillRect(x + 4 * scale, y - 10 * scale, 8 * scale, 4 * scale);
      ctx.fillRect(x + 8 * scale, y - 18 * scale, 4 * scale, 12 * scale);
    };
    [
      [760, 20],
      [750, 35],
      [800, 60],
      [820, 72],
      [840, 50],
      [880, 20],
      [900, 70],
      [940, 82],
      [970, 55],
      [1000, 45],
      [1030, 75],
    ].forEach(([x, yPct], i) => {
      drawCactus(x, yPct, 0.5 + seededRandom(i + 200) * 0.3);
    });

    // Pyramid ruins
    const drawPyramidRuin = (px: number, pyPct: number) => {
      const py = getY(pyPct);
      ctx.fillStyle = "#8a7a5a";
      ctx.beginPath();
      ctx.moveTo(px, py - 30);
      ctx.lineTo(px + 25, py + 5);
      ctx.lineTo(px - 25, py + 5);
      ctx.closePath();
      ctx.fill();
      // Damage/cracks
      ctx.strokeStyle = "#6a5a3a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px - 5, py - 15);
      ctx.lineTo(px + 5, py - 5);
      ctx.lineTo(px - 3, py + 2);
      ctx.stroke();
    };
    drawPyramidRuin(850, 65);
    drawPyramidRuin(900, 70);
    drawPyramidRuin(920, 60);

    drawPyramidRuin(980, 38);

    // Desert camp with fire
    const drawDesertCamp = (cx: number, cyPct: number) => {
      const cy = getY(cyPct);
      // Tent (different style)
      ctx.fillStyle = "#9a8060";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx + 18, cy + 5);
      ctx.lineTo(cx - 18, cy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#6a5a3a";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Fire
      const fireHeight = 8 + Math.sin(time * 6) * 3;
      ctx.fillStyle = `rgba(255, 150, 50, ${0.6 + Math.sin(time * 8) * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(cx + 22, cy + 3);
      ctx.quadraticCurveTo(cx + 24, cy - fireHeight, cx + 26, cy + 3);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 80, 20, ${0.8})`;
      ctx.beginPath();
      ctx.moveTo(cx + 23, cy + 2);
      ctx.quadraticCurveTo(cx + 24, cy - fireHeight * 0.6, cx + 25, cy + 2);
      ctx.fill();
    };
    drawDesertCamp(800, 58);
    drawDesertCamp(920, 22);
    drawDesertCamp(810, 82);
    drawDesertCamp(1020, 32);

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
        ctx.fillStyle = `rgba(255, ${100 + i * 30}, 0, ${
          0.7 + Math.sin(time * 5 + i) * 0.2
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

    // === WINTER DETAILS === (Coordinates Shifted Right)
    // Snow trees
    const drawSnowTree = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      ctx.fillStyle = "#3a3530";
      ctx.fillRect(x - 2 * scale, y - 4 * scale, 4 * scale, 12 * scale);
      ctx.fillStyle = "#4a6a5a";
      ctx.beginPath();
      ctx.moveTo(x, y - 28 * scale);
      ctx.lineTo(x + 14 * scale, y + 4 * scale);
      ctx.lineTo(x - 14 * scale, y + 4 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e8e8e8";
      ctx.beginPath();
      ctx.moveTo(x, y - 28 * scale);
      ctx.lineTo(x + 9 * scale, y - 12 * scale);
      ctx.lineTo(x - 9 * scale, y - 12 * scale);
      ctx.closePath();
      ctx.fill();
    };
    [
      [1200, 25],
      [1020, 80],
      [1120, 65],
      [1140, 28],
      [1150, 72],
      [1160, 72],
      [1190, 78],
      [1240, 48],
      [1230, 50],
      [1230, 42],
      [1250, 60],
      [1280, 72],
      [1300, 38],
      [1320, 32],
      [1340, 42],
      [1350, 65],
      [1360, 50],
      [1380, 22],
    ].forEach(([x, yPct], i) => {
      drawSnowTree(x, yPct, 0.5 + seededRandom(i + 300) * 0.3);
    });

    // Ice fortress ruins
    const drawIceRuin = (rx: number, ryPct: number) => {
      const ry = getY(ryPct);
      ctx.fillStyle = "#8a9aaa";
      ctx.fillRect(rx - 15, ry - 25, 12, 30);
      ctx.fillRect(rx + 3, ry - 18, 12, 23);
      // Ice sparkle
      ctx.fillStyle = `rgba(200, 230, 255, ${
        0.4 + Math.sin(time * 3 + rx) * 0.3
      })`;
      ctx.beginPath();
      ctx.arc(rx - 9, ry - 18, 3, 0, Math.PI * 2);
      ctx.fill();
      // Snow pile
      ctx.fillStyle = "#e0e8f0";
      ctx.beginPath();
      ctx.ellipse(rx, ry + 3, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawIceRuin(1150, 58);
    drawIceRuin(1210, 33);
    drawIceRuin(1290, 78);
    drawIceRuin(1390, 67);
    drawIceRuin(1400, 42);

    // Frozen soldiers
    const drawFrozenSoldier = (sx: number, syPct: number) => {
      const sy = getY(syPct);
      ctx.fillStyle = "#7a8a9a";
      ctx.beginPath();
      ctx.ellipse(sx, sy, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx, sy - 10, 4, 0, Math.PI * 2);
      ctx.fill();
      // Ice crystals
      ctx.strokeStyle = "#a0c0e0";
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(sx, sy - 5);
        ctx.lineTo(sx + Math.cos(i * 2.1) * 8, sy - 5 + Math.sin(i * 2.1) * 8);
        ctx.stroke();
      }
    };
    drawFrozenSoldier(1125, 50);
    drawFrozenSoldier(1180, 70);
    drawFrozenSoldier(1260, 55);
    drawFrozenSoldier(1330, 28);
    drawFrozenSoldier(1350, 42);

    // Snowfall particles
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 30; i++) {
      const sx = 1080 + seededRandom(i * 7) * 360;
      const sy = (time * 30 + seededRandom(i * 11) * height) % height;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // === VOLCANIC DETAILS ===
    // Lava rivers
    const drawLavaRiver = (points: number[][]) => {
      ctx.strokeStyle = `rgba(255, 80, 0, ${0.6 + Math.sin(time * 2) * 0.2})`;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(points[0][0], getY(points[0][1]));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], getY(points[i][1]));
      }
      ctx.stroke();
      // Glow
      ctx.strokeStyle = `rgba(255, 200, 100, ${
        0.3 + Math.sin(time * 3) * 0.15
      })`;
      ctx.lineWidth = 12;
      ctx.stroke();
    };
    drawLavaRiver([
      [1480, 75],
      [1510, 68],
      [1540, 72],
      [1580, 65],
    ]);
    drawLavaRiver([
      [1490, 31],
      [1520, 35],
      [1540, 33],
      [1570, 35],
    ]);
    drawLavaRiver([
      [1590, 20],
      [1620, 28],
      [1660, 25],
      [1700, 30],
    ]);
    drawLavaRiver([
      [1650, 80],
      [1680, 82],
      [1710, 78],
      [1740, 70],
    ]);

    // Obsidian rocks
    const drawObsidianRock = (rx: number, ryPct: number, scale: number) => {
      const ry = getY(ryPct);
      ctx.fillStyle = "#2a1a1a";
      ctx.beginPath();
      ctx.moveTo(rx - 12 * scale, ry + 4 * scale);
      ctx.lineTo(rx - 8 * scale, ry - 16 * scale);
      ctx.lineTo(rx + 4 * scale, ry - 20 * scale);
      ctx.lineTo(rx + 12 * scale, ry - 8 * scale);
      ctx.lineTo(rx + 12 * scale, ry + 4 * scale);
      ctx.closePath();
      ctx.fill();
      // Lava glow cracks
      ctx.strokeStyle = `rgba(255, 68, 0, ${
        0.5 + Math.sin(time * 3 + rx) * 0.3
      })`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(rx - 4 * scale, ry);
      ctx.lineTo(rx + 2 * scale, ry - 10 * scale);
      ctx.stroke();
    };
    [
      [1490, 42],
      [1540, 78],
      [1610, 58],
      [1650, 38],
      [1700, 72],
    ].forEach(([x, yPct], i) => {
      drawObsidianRock(x, yPct, 0.6 + seededRandom(i + 400) * 0.4);
    });

    // Volcanic vents with smoke
    const drawVolcanicVent = (vx: number, vyPct: number) => {
      const vy = getY(vyPct);
      ctx.fillStyle = "#3a2020";
      ctx.beginPath();
      ctx.ellipse(vx, vy, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 100, 50, ${
        0.3 + Math.sin(time * 4 + vx) * 0.2
      })`;
      ctx.beginPath();
      ctx.ellipse(vx, vy - 2, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Smoke/steam
      for (let i = 0; i < 4; i++) {
        const smokeY = vy - 10 - ((time * 25 + i * 12) % 35);
        const smokeX = vx + Math.sin(time * 2 + i * 1.5) * 5;
        ctx.globalAlpha = 0.25 - ((time * 25 + i * 12) % 35) / 100;
        ctx.fillStyle = "#555";
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 4 + i * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    drawVolcanicVent(1500, 52);
    drawVolcanicVent(1600, 70);
    drawVolcanicVent(1660, 45);

    // Destroyed fortress
    const drawDestroyedFortress = (fx: number, fyPct: number) => {
      const fy = getY(fyPct);
      ctx.fillStyle = "#3a2a2a";
      ctx.fillRect(fx - 20, fy - 20, 15, 25);
      ctx.fillRect(fx + 5, fy - 12, 15, 17);
      // Rubble
      ctx.fillStyle = "#4a3a3a";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
          fx - 10 + i * 8 + seededRandom(i + fx) * 6,
          fy + 3,
          3 + seededRandom(i) * 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      // Fire
      const fh = 12 + Math.sin(time * 6) * 4;
      ctx.fillStyle = `rgba(255, 120, 30, ${0.7 + Math.sin(time * 7) * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(fx - 5, fy - 20);
      ctx.quadraticCurveTo(fx, fy - 20 - fh, fx + 5, fy - 20);
      ctx.fill();
    };
    drawDestroyedFortress(1590, 48);

    // Ember particles in volcanic region
    for (let i = 0; i < 20; i++) {
      const ex = 1450 + seededRandom(i * 13) * 350;
      const baseY = seededRandom(i * 17) * height * 0.8;
      const ey =
        baseY - ((time * 40 + seededRandom(i * 19) * 50) % (height * 0.6));
      if (ey > 0) {
        ctx.fillStyle = `rgba(255, ${150 + seededRandom(i) * 100}, 50, ${
          0.6 + Math.sin(time * 4 + i) * 0.3
        })`;
        ctx.beginPath();
        ctx.arc(ex + Math.sin(time * 2 + i) * 3, ey, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // === BATTLE SCENES ===
    const drawBattleScene = (
      x: number,
      yPct: number,
      flip: boolean,
      intensity: number
    ) => {
      const y = getY(yPct);
      const t = time * 4 + x;

      for (let s = 0; s < intensity; s++) {
        const offset = s * 18 * (flip ? -1 : 1);

        // Friendly soldier (orange)
        const sx1 = x + offset + (flip ? 8 : -8) + Math.sin(t + s) * 2;
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(sx1, y - 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(sx1 - 2.5, y - 3, 5, 8);
        // Sword
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx1 + (flip ? -3 : 3), y - 4);
        ctx.lineTo(sx1 + (flip ? -10 : 10) + Math.sin(t * 2 + s) * 4, y - 7);
        ctx.stroke();

        // Enemy soldier (red)
        const sx2 = x + offset + (flip ? -8 : 8) + Math.sin(t + 1 + s) * 2;
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(sx2, y - 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(sx2 - 2.5, y - 3, 5, 8);
        ctx.beginPath();
        ctx.moveTo(sx2 + (flip ? 3 : -3), y - 4);
        ctx.lineTo(
          sx2 + (flip ? 10 : -10) + Math.sin(t * 2 + 2 + s) * 4,
          y - 7
        );
        ctx.stroke();
      }

      // Sparks
      if (Math.sin(t * 3) > 0.3) {
        ctx.fillStyle = "#ffd700";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(
            x + seededRandom(x + i) * 16 - 8,
            y - 5 + seededRandom(x + i + 10) * 10 - 5,
            1.5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    };

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

    // === KINGDOM CASTLES ===
    const drawKingdomCastle = (x: number, yPct: number, isEnemy: boolean) => {
      const y = getY(yPct);
      const color1 = isEnemy ? "#4a2020" : "#5a4a3a";
      const color2 = isEnemy ? "#3a1010" : "#4a3a2a";
      const accent = isEnemy ? "#8b0000" : "#f59e0b";

      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(x, y + 10, 40, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color1;
      ctx.fillRect(x - 30, y - 35, 60, 45);
      ctx.fillStyle = color2;
      ctx.fillRect(x - 38, y - 58, 18, 68);
      ctx.fillRect(x + 20, y - 58, 18, 68);

      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x - 38 + i * 5.5, y - 65, 4, 7);
        ctx.fillRect(x + 20 + i * 5.5, y - 65, 4, 7);
      }

      ctx.fillStyle = color1;
      ctx.fillRect(x - 14, y - 75, 28, 85);
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(x - 14 + i * 6, y - 82, 4, 7);
      }

      ctx.fillStyle = "#4a3020";
      ctx.fillRect(x - 1, y - 100, 3, 25);
      ctx.fillStyle = accent;
      const flagWave = Math.sin(time * 3 + x) * 4;
      ctx.beginPath();
      ctx.moveTo(x + 2, y - 98);
      ctx.quadraticCurveTo(x + 14, y - 93 + flagWave, x + 22, y - 88);
      ctx.quadraticCurveTo(x + 14, y - 83 + flagWave, x + 2, y - 78);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = isEnemy ? "#ff4400" : "#ffcc00";
      ctx.globalAlpha = 0.6 + Math.sin(time * 2 + x) * 0.25;
      ctx.fillRect(x - 6, y - 58, 12, 16);
      ctx.fillRect(x - 32, y - 40, 7, 10);
      ctx.fillRect(x + 25, y - 40, 7, 10);
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#1a0a0a";
      ctx.beginPath();
      ctx.moveTo(x - 12, y + 10);
      ctx.lineTo(x - 12, y - 10);
      ctx.arc(x, y - 10, 12, Math.PI, 0);
      ctx.lineTo(x + 12, y + 10);
      ctx.closePath();
      ctx.fill();

      ctx.font = "bold 10px 'Cinzel', serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillText(
        isEnemy ? "ENEMY STRONGHOLD" : "YOUR KINGDOM",
        x + 1,
        y + 28
      );
      ctx.fillStyle = accent;
      ctx.fillText(isEnemy ? "ENEMY STRONGHOLD" : "YOUR KINGDOM", x, y + 27);
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
            : level.region === "desert"
            ? "#e8a838"
            : level.region === "winter"
            ? "#88c8e8"
            : level.region === "volcanic"
            ? "#e84848"
            : level.region === "swamp"
            ? "#5f9ea0"
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

      // Tooltip with Preview Image
      if ((isHovered || isSelected) && isUnlocked) {
        // Setup dimensions for the card
        const cardWidth = 150;
        const cardHeight = 110;
        const cardX = x - cardWidth / 2;
        const cardY = y - size - cardHeight - 12;

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
            // Clip to top rounded corners
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
            // Draw image filling the top area
            ctx.drawImage(
              img,
              cardX + 2,
              cardY + 2,
              cardWidth - 4,
              cardHeight - 24
            );
            ctx.restore();
          } else {
            // Placeholder while loading or if missing
            ctx.fillStyle = "#222";
            ctx.fillRect(cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 24);
          }
        }

        // Draw Text
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.font = "bold 11px 'Cinzel', serif";
        ctx.fillText(level.name, x, cardY + cardHeight - 8);

        ctx.restore();
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

        ctx.font = "bold 10px 'Cinzel', serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(180, 20, 20, 0.9)";
        ctx.fillText("⚔ ENEMIES APPROACH!", lx + 45, ly - 24);
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

  return (
    <div className="w-full h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex flex-col text-amber-100 overflow-hidden">
      {/* TOP BAR */}
      <div className="flex-shrink-0 bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 px-5 py-3 flex items-center justify-between border-b-2 border-amber-700/50 shadow-xl">
        <PrincetonLogo />
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCodex(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-900/60 to-stone-900/80 hover:from-purple-800/70 rounded-xl border border-purple-600/50 transition-all hover:scale-105 shadow-lg"
          >
            <Book size={18} className="text-purple-400" />
            <span className="text-purple-300 font-medium text-lg">
              War Codex
            </span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-900/70 to-stone-900/80 rounded-xl border border-amber-600/60 shadow-lg">
            <div className="relative">
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <span className="font-bold text-xl text-yellow-300">
              {totalStars}
            </span>
            <span className="text-yellow-600 text-sm">/ {maxStars}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT: Map */}
        {/* RIGHT SIDEBAR */}
        <div className="w-80 flex-shrink-0 bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 border-r-2 border-amber-800/50 flex flex-col overflow-hidden">
          {selectedLevel && currentLevel ? (
            <div className="flex-1 flex flex-col overflow-hidden">
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
                  <p className="text-amber-500/80 text-sm italic mb-3">
                    &ldquo;{currentLevel.description}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 px-2 py-1 bg-stone-800/60 rounded-lg border border-stone-700/50">
                      <Skull size={14} className="text-amber-500" />
                      <div className="flex gap-1">
                        {[1, 2, 3].map((d) => (
                          <div
                            key={d}
                            className={`w-3 h-3 rounded-full transition-all ${
                              d <= currentLevel.difficulty
                                ? `${
                                    currentLevel.difficulty === 1
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
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-stone-800/50 rounded-lg border border-amber-800/40">
                    <Trophy size={18} className="text-yellow-500" />
                    <span className="text-amber-500 text-sm">Best Score:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          className={`transition-all ${
                            (levelStars[currentLevel.id] || 0) >= s
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                              : "text-stone-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 p-4 border-b border-amber-800/30">
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
                    className={`absolute inset-0 flex items-center justify-center ${
                      LEVEL_DATA[currentLevel.id]?.previewImage
                        ? "opacity-0"
                        : "opacity-100"
                    }`}
                  >
                    <div
                      className={`w-full h-full ${
                        currentLevel.region === "grassland"
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

              <div className="flex-1 p-4 overflow-y-auto">
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
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                            l.id === selectedLevel
                              ? "bg-amber-900/40 border border-amber-600/60"
                              : "bg-stone-800/40 border border-stone-700/30 hover:bg-stone-800/60"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                              isLevelUnlocked(l.id)
                                ? "bg-amber-900/50"
                                : "bg-stone-800"
                            }`}
                          >
                            {isLevelUnlocked(l.id)
                              ? l.region === "grassland"
                                ? "🌲"
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
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden group ${
                    canStart
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
                    <span>{canStart ? "BATTLE!" : "Prepare Your Forces"}</span>
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
                      `Select ${3 - selectedSpells.length} more spell${
                        3 - selectedSpells.length > 1 ? "s" : ""
                      }`}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <BattlefieldPreview animTime={animTime} />
          )}
        </div>
        <div className="flex-1 flex flex-col min-w-0 p-4">
          <div
            ref={containerRef}
            className="flex-1 relative bg-gradient-to-br from-stone-900 to-stone-950 rounded-2xl border-2 border-amber-800/50 overflow-hidden shadow-2xl min-h-0"
          >
            <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
              <canvas
                ref={canvasRef}
                className="block cursor-pointer"
                style={{ minWidth: `${MAP_WIDTH}px`, height: "100%" }}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
              />
            </div>

            {/* HERO & SPELL SELECTION OVERLAY */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-stone-950/98 via-stone-900/95 to-transparent pointer-events-none">
              <div className="flex gap-3 pointer-events-auto">
                <div className="bg-gradient-to-br from-stone-900/95 to-stone-950/98 rounded-xl border border-amber-800/50 p-3 shadow-xl backdrop-blur-sm w-40 flex-shrink-0">
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
                    <span className="text-xs font-bold text-amber-300 tracking-wide">
                      SELECT CHAMPION
                    </span>
                  </div>
                  <div className="flex gap-1.5 mb-2">
                    {heroOptions.map((heroType) => {
                      const hero = HERO_DATA[heroType];
                      const isSelected = selectedHero === heroType;
                      return (
                        <button
                          key={heroType}
                          onClick={() => setSelectedHero(heroType)}
                          onMouseEnter={() => setHoveredHero(heroType)}
                          onMouseLeave={() => setHoveredHero(null)}
                          className={`relative p-1 rounded-lg transition-all ${
                            isSelected
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
                    <div className="bg-stone-900/60 rounded-lg p-2 border border-amber-800/40">
                      <div className="flex items-center gap-2 mb-1">
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-purple-400" />
                      <span className="text-xs font-bold text-amber-300 tracking-wide">
                        SELECT SPELLS
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        selectedSpells.length === 3
                          ? "bg-green-900/60 text-green-300 border border-green-700/50"
                          : "bg-purple-900/60 text-purple-300 border border-purple-700/50"
                      }`}
                    >
                      {selectedSpells.length}/3 Selected
                    </span>
                  </div>
                  <div className="flex gap-1.5 mb-2">
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
                          className={`relative p-1.5 rounded-lg transition-all ${
                            isSelected
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
                    <div className="bg-stone-900/60 rounded-lg p-2 border border-purple-800/40">
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSpells.map((sp, i) => {
                          const spell = SPELL_DATA[sp];
                          return (
                            <div
                              key={sp}
                              className="flex items-center gap-1.5 text-[9px] bg-purple-950/60 px-2 py-1 rounded border border-purple-800/40"
                            >
                              <span className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                                {i + 1}
                              </span>
                              <span className="text-purple-200 font-medium">
                                {spell.name}
                              </span>
                              <span className="text-purple-500">|</span>
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
                        <div className="text-[8px] text-purple-500/60 mt-1">
                          Select {3 - selectedSpells.length} more spell
                          {3 - selectedSpells.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-purple-600/60 text-[10px] text-center py-2">
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
