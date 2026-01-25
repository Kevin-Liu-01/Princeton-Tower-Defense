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
            KINGDOM DEFENSE
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {towerTypes.map((type) => {
                const tower = TOWER_DATA[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedTower(type)}
                    className="flex items-start flex-col bg-gradient-to-br from-amber-950/40 to-stone-900/60 rounded-xl border border-amber-800/40 p-4 hover:border-amber-500/60 hover:scale-[1.02] text-left group transition-all"
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
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {tower.upgrades.A && (
                        <div className="mb-2 border rounded-lg border-amber-800/30 p-2">
                          <span className="text-amber-400 text-sm font-semibold">
                            {tower.upgrades.A.name}
                          </span>
                          <p className="text-amber-600 text-xs">
                            {tower.upgrades.A.effect}
                          </p>
                        </div>
                      )}
                      {tower.upgrades.B && (
                        <div className="mb-2 border rounded-lg border-amber-800/30 p-2">
                          <span className="text-amber-400 text-sm font-semibold">
                            {tower.upgrades.B.name}
                          </span>
                          <p className="text-amber-600 text-xs">
                            {tower.upgrades.B.effect}
                          </p>
                        </div>
                      )}
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                              className={`p-3 rounded-lg border ${level === 4
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
                      <div className="grid sm:grid-cols-2 gap-4">
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
            <div className="grid sm:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
            <div className="grid sm:grid-cols-3 gap-4">
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
        <div className="size-20 sm:size-24 rounded-full bg-amber-900/50 border-2 border-amber-700/60 flex items-center justify-center mb-4 backdrop-blur-sm">
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
        colors: ["#d4a574", "#b8956a"],
        labelColor: "#ffd700",
      },
      {
        name: "FROZEN FRONTIER",
        x: 1080,
        w: 360,
        colors: ["#a8c8e8", "#7aa8d8"],
        labelColor: "#e0f4ff",
      },
      {
        name: "INFERNO DEPTHS",
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
      ctx.font = "bold 11px 'Cinzel', serif";
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

      // Tooltip with Preview Image - smart positioning based on Y position
      if ((isHovered || isSelected) && isUnlocked) {
        // Setup dimensions for the card
        const cardWidth = 150;
        const cardHeight = 110;
        const cardX = x - cardWidth / 2;

        // Determine if tooltip should appear above or below based on level Y position
        // If level is in upper 40% of map, show tooltip below; otherwise show above
        const showBelow = level.y < 50;
        const cardY = showBelow
          ? y + size + 12 // Below the level node
          : y - size - cardHeight - 12; // Above the level node

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

  // Drag-to-scroll handlers
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
          {/* total hearts */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-red-900/70 to-stone-900/80 rounded-xl border border-red-600/60 shadow-lg">
            <div className="relative">
              <Heart size={20} className="text-red-400 fill-red-400" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Heart size={20} className="text-red-400 fill-red-400" />
              </div>
            </div>
            <span className="font-bold text-sm sm:text-xl text-red-300">
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

          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-900/70 to-stone-900/80 rounded-xl border border-amber-600/60 shadow-lg">
            <div className="relative">
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <span className="font-bold text-sm sm:text-xl text-yellow-300">
              {totalStars}
            </span>
            <span className="hidden sm:inline text-yellow-600 text-sm">
              / {maxStars}
            </span>
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
                  <p className="text-amber-500/80 text-sm italic mb-3">
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
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
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
                              <span className="hidden xl:inline text-purple-300 flex-1 truncate">
                                {spell.desc}
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
