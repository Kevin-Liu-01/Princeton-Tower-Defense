"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Shield, Zap, ChevronRight, Swords, X, Crown, Heart, Target,
  Wind, Timer, Sparkles, Crosshair, Flame, Snowflake, Coins,
  Users, Gauge, TrendingUp, Star, Info, Wrench, Volume2,
  Mountain, Building, CircleDot, Check, TrendingDown, Droplets,
  Ban, EyeOff, AlertTriangle, Footprints, Flag
} from "lucide-react";
import type {
  HeroType,
  SpellType,
  LevelStars,
  CodexTab,
  TowerType,
  EnemyType,
  EnemyTrait,
  EnemyCategory,
} from "../../types";
import { OrnateFrame } from "../ui/OrnateFrame";
import { HERO_DATA, SPELL_DATA, TOWER_DATA, ENEMY_DATA, HERO_ABILITY_COOLDOWNS } from "../../constants";

// Import sprite components from GameUI
import { TowerSprite, HeroSprite, SpellSprite, HeroAbilityIcon } from "../ui/GameUI";

// Enemy sprite component for codex
const EnemySprite: React.FC<{ type: EnemyType; size?: number }> = ({
  type,
  size = 40,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const scale = size / 45;
    const enemyData = ENEMY_DATA[type];
    const color = enemyData.color;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 14 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2 * scale, 12 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = type === "boss" || type === "elite" ? "#2a2a2a" : "#3a3a3a";
    ctx.beginPath();
    ctx.arc(cx, cy - 12 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = type === "boss" ? "#ff0000" : "#ff6666";
    ctx.beginPath();
    ctx.arc(cx - 3 * scale, cy - 13 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 3 * scale, cy - 13 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Type-specific features
    if (type === "boss" || type === "elite") {
      // Horns
      ctx.fillStyle = "#4a4a4a";
      ctx.beginPath();
      ctx.moveTo(cx - 8 * scale, cy - 18 * scale);
      ctx.lineTo(cx - 12 * scale, cy - 25 * scale);
      ctx.lineTo(cx - 5 * scale, cy - 20 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 8 * scale, cy - 18 * scale);
      ctx.lineTo(cx + 12 * scale, cy - 25 * scale);
      ctx.lineTo(cx + 5 * scale, cy - 20 * scale);
      ctx.closePath();
      ctx.fill();
    }

    if (type === "armored" || type === "tank") {
      // Armor
      ctx.fillStyle = "#666";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy + 2 * scale,
        10 * scale,
        12 * scale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (type === "fast" || type === "swarm") {
      // Speed lines
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - 15 * scale - i * 3, cy - 5 * scale + i * 5);
        ctx.lineTo(cx - 10 * scale - i * 3, cy - 5 * scale + i * 5);
        ctx.stroke();
      }
    }

    if (enemyData.flying) {
      // Wings
      ctx.fillStyle = "rgba(100,100,100,0.5)";
      ctx.beginPath();
      ctx.ellipse(
        cx - 15 * scale,
        cy - 5 * scale,
        8 * scale,
        4 * scale,
        -0.3,
        0,
        Math.PI * 2
      );
      ctx.ellipse(
        cx + 15 * scale,
        cy - 5 * scale,
        8 * scale,
        4 * scale,
        0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }, [type, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};

// Helper function to get trait icon and info
const getTraitInfo = (trait: EnemyTrait): { icon: React.ReactNode; label: string; color: string; desc: string } => {
  switch (trait) {
    case "flying":
      return { icon: <Wind size={10} />, label: "Flying", color: "text-cyan-400", desc: "Ignores ground obstacles" };
    case "ranged":
      return { icon: <Crosshair size={10} />, label: "Ranged", color: "text-green-400", desc: "Attacks from distance" };
    case "armored":
      return { icon: <Shield size={10} />, label: "Armored", color: "text-amber-400", desc: "Reduces damage" };
    case "fast":
      return { icon: <Footprints size={10} />, label: "Fast", color: "text-yellow-400", desc: "High movement speed" };
    case "boss":
      return { icon: <Crown size={10} />, label: "Boss", color: "text-red-400", desc: "Powerful enemy" };
    case "summoner":
      return { icon: <Users size={10} />, label: "Summoner", color: "text-purple-400", desc: "Spawns minions" };
    case "regenerating":
      return { icon: <Heart size={10} />, label: "Regen", color: "text-green-400", desc: "Heals over time" };
    case "aoe_attack":
      return { icon: <Target size={10} />, label: "AoE", color: "text-orange-400", desc: "Area damage" };
    case "magic_resist":
      return { icon: <Sparkles size={10} />, label: "Magic Resist", color: "text-blue-400", desc: "Magic defense" };
    case "tower_debuffer":
      return { icon: <TrendingDown size={10} />, label: "Debuffer", color: "text-rose-400", desc: "Weakens towers" };
    case "breakthrough":
      return { icon: <Zap size={10} />, label: "Breakthrough", color: "text-sky-400", desc: "Bypasses troops" };
    default:
      return { icon: <Info size={10} />, label: trait, color: "text-gray-400", desc: "Unknown" };
  }
};

// Helper function to get ability icon and color
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

interface SetupScreenProps {
  setGameState: (
    state: "menu" | "setup" | "playing" | "victory" | "defeat"
  ) => void;
  selectedMap: string;
  setSelectedMap: (map: string) => void;
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType | null) => void;
  selectedSpells: SpellType[];
  setSelectedSpells: (spells: SpellType[]) => void;
  unlockedMaps: string[];
  levelStars: LevelStars;
}

export function SetupScreen({
  setGameState,
  selectedMap,
  setSelectedMap,
  selectedHero,
  setSelectedHero,
  selectedSpells,
  setSelectedSpells,
  unlockedMaps,
  levelStars,
}: SetupScreenProps) {
  const [codexTab, setCodexTab] = useState<CodexTab>("towers");
  const [showCodex, setShowCodex] = useState(false);

  const canStart = selectedHero && selectedSpells.length === 3;

  const toggleSpell = (spell: SpellType) => {
    if (selectedSpells.includes(spell)) {
      setSelectedSpells(selectedSpells.filter((s) => s !== spell));
    } else if (selectedSpells.length < 3) {
      setSelectedSpells([...selectedSpells, spell]);
    }
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

  // Hero role data for display
  const heroRoles: Record<string, { role: string; icon: React.ReactNode; color: string }> = {
    tiger: { role: "Melee Fighter", icon: <Swords size={12} />, color: "orange" },
    tenor: { role: "AoE Support", icon: <Volume2 size={12} />, color: "purple" },
    mathey: { role: "Tank", icon: <Shield size={12} />, color: "blue" },
    rocky: { role: "Ranged Artillery", icon: <Target size={12} />, color: "green" },
    scott: { role: "Support Buffer", icon: <TrendingUp size={12} />, color: "cyan" },
    captain: { role: "Summoner", icon: <Users size={12} />, color: "red" },
    engineer: { role: "Turret Builder", icon: <Wrench size={12} />, color: "amber" },
  };

  // Spell type data for display
  const spellInfo: Record<string, { category: string; icon: React.ReactNode; color: string }> = {
    fireball: { category: "Damage", icon: <Flame size={12} />, color: "orange" },
    lightning: { category: "Chain Damage", icon: <Zap size={12} />, color: "yellow" },
    freeze: { category: "Crowd Control", icon: <Snowflake size={12} />, color: "cyan" },
    payday: { category: "Economy", icon: <Coins size={12} />, color: "amber" },
    reinforcements: { category: "Summon", icon: <Users size={12} />, color: "green" },
  };

  const levels = [
    {
      id: "poe",
      name: "Poe Field",
      x: 120,
      y: 200,
      unlocked: unlockedMaps.includes("poe"),
    },
    {
      id: "carnegie",
      name: "Carnegie Lake",
      x: 280,
      y: 120,
      unlocked: unlockedMaps.includes("carnegie"),
    },
    {
      id: "nassau",
      name: "Nassau Hall",
      x: 440,
      y: 200,
      unlocked: unlockedMaps.includes("nassau"),
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-amber-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 text-center py-4 border-b border-amber-900/50 bg-gradient-to-r from-transparent via-amber-950/50 to-transparent">
        <h1 className="text-3xl font-bold text-amber-400 tracking-widest">
          QUEST PREPARATION
        </h1>
        <p className="text-amber-600 text-sm mt-1">
          Select your battlefield, champion, and arcane powers
        </p>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Column - War is Coming + Map */}
        <div className="w-64 flex flex-col gap-4 flex-shrink-0">
          {/* War is Coming Panel */}
          <div className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 rounded-xl border-2 border-amber-800/60 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-amber-900/50 to-transparent border-b border-amber-800/50">
              <div className="flex items-center gap-2 text-amber-400">
                <Crown size={18} className="text-amber-500" />
                <span className="font-bold tracking-wider">WAR IS COMING</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-stone-300 leading-relaxed mb-4">
                The Kingdom of Princeton stands as the last bastion against the invading hordes.
                Ancient towers guard our halls, powered by arcane knowledge.
              </p>
              <div className="flex items-center gap-2 text-amber-500 text-sm">
                <Swords size={16} className="text-amber-400" />
                <span className="font-medium italic">Defend the realm!</span>
              </div>
            </div>
          </div>

          {/* Mini Map */}
          <div className="flex-1 bg-gradient-to-br from-stone-800/80 to-stone-900/80 rounded-xl border-2 border-amber-900/50 overflow-hidden">
            <div className="px-3 py-2 bg-stone-800/50 border-b border-amber-900/30 flex items-center gap-2">
              <Mountain size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-300 tracking-wider">BATTLEFIELD</span>
            </div>
            <svg className="w-full h-full" viewBox="0 0 240 200" preserveAspectRatio="xMidYMid meet">
              <defs>
                <pattern id="grass" patternUnits="userSpaceOnUse" width="15" height="15">
                  <rect width="15" height="15" fill="#2d3a1f" />
                  <circle cx="3" cy="3" r="0.8" fill="#3d4a2f" opacity="0.5" />
                  <circle cx="10" cy="10" r="0.8" fill="#3d4a2f" opacity="0.5" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width="240" height="200" fill="url(#grass)" />

              {/* Connection paths */}
              <path
                d={`M 65 90 Q 90 70 115 60`}
                stroke={unlockedMaps.includes("carnegie") ? "#b8860b" : "#3a3020"}
                strokeWidth="3"
                strokeDasharray={unlockedMaps.includes("carnegie") ? "none" : "6 3"}
                fill="none"
              />
              <path
                d={`M 140 60 Q 165 70 175 90`}
                stroke={unlockedMaps.includes("nassau") ? "#b8860b" : "#3a3020"}
                strokeWidth="3"
                strokeDasharray={unlockedMaps.includes("nassau") ? "none" : "6 3"}
                fill="none"
              />

              {/* Level nodes */}
              {[
                { id: "poe", x: 50, y: 100, name: "Poe Field" },
                { id: "carnegie", x: 120, y: 50, name: "Carnegie" },
                { id: "nassau", x: 190, y: 100, name: "Nassau" },
              ].map((level) => {
                const stars = levelStars[level.id] || 0;
                const isSelected = selectedMap === level.id;
                const isUnlocked = unlockedMaps.includes(level.id);
                const isCompleted = stars > 0;

                return (
                  <g
                    key={level.id}
                    className={isUnlocked ? "cursor-pointer" : "opacity-50"}
                    onClick={() => isUnlocked && setSelectedMap(level.id)}
                  >
                    {isSelected && (
                      <circle cx={level.x} cy={level.y} r="28" fill="none" stroke="#ffd700" strokeWidth="2" filter="url(#glow)" />
                    )}
                    <circle
                      cx={level.x}
                      cy={level.y}
                      r="22"
                      fill={isCompleted ? "#2a4020" : isUnlocked ? "#3a2a1a" : "#1a1510"}
                      stroke={isSelected ? "#ffd700" : isCompleted ? "#4a6030" : "#5a4a3a"}
                      strokeWidth="2"
                    />
                    <circle cx={level.x} cy={level.y} r="16" fill={isUnlocked ? "#4a3a2a" : "#2a2520"} />

                    {/* Level icons */}
                    {level.id === "poe" && (
                      <path d={`M${level.x - 6} ${level.y + 3} L${level.x} ${level.y - 6} L${level.x + 6} ${level.y + 3} Z`} fill="#8b7355" />
                    )}
                    {level.id === "carnegie" && (
                      <ellipse cx={level.x} cy={level.y + 1} rx="8" ry="4" fill="#4a7090" />
                    )}
                    {level.id === "nassau" && (
                      <>
                        <rect x={level.x - 6} y={level.y - 4} width="12" height="8" fill="#8b6914" />
                        <polygon points={`${level.x - 7},${level.y - 4} ${level.x},${level.y - 10} ${level.x + 7},${level.y - 4}`} fill="#a67c00" />
                      </>
                    )}

                    {/* Lock for locked levels */}
                    {!isUnlocked && (
                      <g>
                        <rect x={level.x - 4} y={level.y - 2} width="8" height="7" rx="1" fill="#666" />
                        <path d={`M${level.x - 2} ${level.y - 2} V${level.y - 5} A3 3 0 0 1 ${level.x + 2} ${level.y - 5} V${level.y - 2}`} stroke="#666" strokeWidth="1.5" fill="none" />
                      </g>
                    )}

                    {/* Stars */}
                    {isCompleted && (
                      <g>
                        {[0, 1, 2].map((i) => (
                          <circle key={i} cx={level.x - 8 + i * 8} cy={level.y + 30} r="3" fill={i < stars ? "#ffd700" : "#3a3020"} stroke={i < stars ? "#b8860b" : "#2a2010"} strokeWidth="0.5" />
                        ))}
                      </g>
                    )}

                    <text x={level.x} y={level.y + 40} textAnchor="middle" fill={isUnlocked ? "#d4a574" : "#5a4a3a"} fontSize="8" fontWeight="bold">
                      {level.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Middle Column - Champion Selection */}
        <div className="flex-1 bg-gradient-to-br from-stone-800/70 to-stone-900/70 rounded-xl border-2 border-amber-800/50 overflow-hidden flex flex-col">
          <div className="px-5 py-3 bg-gradient-to-r from-amber-900/40 to-transparent border-b border-amber-800/40 flex items-center gap-3">
            <Shield size={18} className="text-amber-400" />
            <span className="font-bold text-amber-300 tracking-wider">SELECT CHAMPION</span>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            {/* Hero Grid */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {heroOptions.map((heroType) => {
                const hero = HERO_DATA[heroType];
                const isSelected = selectedHero === heroType;
                const roleData = heroRoles[heroType];
                return (
                  <button
                    key={heroType}
                    onClick={() => setSelectedHero(heroType)}
                    className={`relative w-16 h-16 rounded-xl transition-all duration-200 group ${isSelected
                      ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900 scale-110 z-10"
                      : "hover:scale-105"
                      }`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${hero.color}40, ${hero.color}20)`
                        : 'rgba(41, 37, 36, 0.8)',
                      border: `2px solid ${isSelected ? hero.color : 'rgba(120, 113, 108, 0.5)'}`,
                      boxShadow: isSelected ? `0 0 20px ${hero.color}50` : 'none',
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <HeroSprite type={heroType} size={52} />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-stone-900">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    {/* Hover tooltip */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <div className="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-[10px] text-amber-200 whitespace-nowrap">
                        {hero.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Hero Details */}
            {selectedHero ? (
              <div className="flex-1 bg-gradient-to-br from-stone-900/80 to-stone-950/80 rounded-xl border border-stone-700/50 overflow-hidden">
                {/* Hero Header with Role */}
                <div className={`px-4 py-2.5 border-b flex items-center justify-between ${heroRoles[selectedHero]?.color === "orange" ? "bg-orange-950/40 border-orange-800/30" :
                  heroRoles[selectedHero]?.color === "purple" ? "bg-purple-950/40 border-purple-800/30" :
                    heroRoles[selectedHero]?.color === "blue" ? "bg-blue-950/40 border-blue-800/30" :
                      heroRoles[selectedHero]?.color === "green" ? "bg-green-950/40 border-green-800/30" :
                        heroRoles[selectedHero]?.color === "cyan" ? "bg-cyan-950/40 border-cyan-800/30" :
                          heroRoles[selectedHero]?.color === "red" ? "bg-red-950/40 border-red-800/30" :
                            "bg-amber-950/40 border-amber-800/30"
                  }`}>
                  <div className={`flex items-center gap-2 ${heroRoles[selectedHero]?.color === "orange" ? "text-orange-400" :
                    heroRoles[selectedHero]?.color === "purple" ? "text-purple-400" :
                      heroRoles[selectedHero]?.color === "blue" ? "text-blue-400" :
                        heroRoles[selectedHero]?.color === "green" ? "text-green-400" :
                          heroRoles[selectedHero]?.color === "cyan" ? "text-cyan-400" :
                            heroRoles[selectedHero]?.color === "red" ? "text-red-400" :
                              "text-amber-400"
                    }`}>
                    {heroRoles[selectedHero]?.icon}
                    <span className="text-xs font-medium uppercase tracking-wider">{heroRoles[selectedHero]?.role}</span>
                  </div>
                  <span className="text-lg">{HERO_DATA[selectedHero].icon}</span>
                </div>

                <div className="p-4">
                  {/* Hero Name and Sprite */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-20 h-20 rounded-xl border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: HERO_DATA[selectedHero].color,
                        backgroundColor: HERO_DATA[selectedHero].color + "20",
                        boxShadow: `0 0 25px ${HERO_DATA[selectedHero].color}30`,
                      }}
                    >
                      <HeroSprite type={selectedHero} size={68} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-amber-200 mb-1 flex items-center gap-2">
                        {HERO_DATA[selectedHero].name}
                        <Wrench size={14} className="text-stone-500" />
                      </h3>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        {HERO_DATA[selectedHero].description}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    <div className="bg-red-950/50 rounded-lg p-2 text-center border border-red-900/40">
                      <Heart size={14} className="mx-auto text-red-400 mb-1" />
                      <div className="text-[9px] text-red-500">HP</div>
                      <div className="text-red-300 font-bold">{HERO_DATA[selectedHero].hp}</div>
                    </div>
                    <div className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-900/40">
                      <Swords size={14} className="mx-auto text-orange-400 mb-1" />
                      <div className="text-[9px] text-orange-500">DMG</div>
                      <div className="text-orange-300 font-bold">{HERO_DATA[selectedHero].damage}</div>
                    </div>
                    <div className="bg-blue-950/50 rounded-lg p-2 text-center border border-blue-900/40">
                      <Target size={14} className="mx-auto text-blue-400 mb-1" />
                      <div className="text-[9px] text-blue-500">RNG</div>
                      <div className="text-blue-300 font-bold">{HERO_DATA[selectedHero].range}</div>
                    </div>
                    <div className="bg-green-950/50 rounded-lg p-2 text-center border border-green-900/40">
                      <Gauge size={14} className="mx-auto text-green-400 mb-1" />
                      <div className="text-[9px] text-green-500">SPD</div>
                      <div className="text-green-300 font-bold">{HERO_DATA[selectedHero].speed}</div>
                    </div>
                    <div className="bg-purple-950/50 rounded-lg p-2 text-center border border-purple-900/40">
                      <Timer size={14} className="mx-auto text-purple-400 mb-1" />
                      <div className="text-[9px] text-purple-500">CD</div>
                      <div className="text-purple-300 font-bold">{(HERO_ABILITY_COOLDOWNS[selectedHero] || 30000) / 1000}s</div>
                    </div>
                  </div>

                  {/* Ability */}
                  <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <HeroAbilityIcon type={selectedHero} size={14} />
                      <span className="text-sm font-bold text-purple-300">{HERO_DATA[selectedHero].ability}</span>
                    </div>
                    <p className="text-xs text-purple-200/80">{HERO_DATA[selectedHero].abilityDesc}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-stone-900/30 rounded-xl border border-stone-700/30">
                <div className="text-center text-stone-500">
                  <Shield size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Select a champion above</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Spells + Start */}
        <div className="w-80 flex flex-col gap-4 flex-shrink-0">
          {/* Spell Selection */}
          <div className="flex-1 bg-gradient-to-br from-stone-800/70 to-stone-900/70 rounded-xl border-2 border-purple-800/40 overflow-hidden flex flex-col">
            <div className="px-5 py-3 bg-gradient-to-r from-purple-900/40 to-transparent border-b border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-purple-400" />
                <span className="font-bold text-purple-300 tracking-wider">SELECT SPELLS</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedSpells.length === 3
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                }`}>
                {selectedSpells.length}/3 Selected
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              {/* Spell Icons Row */}
              <div className="flex justify-center gap-3 mb-4">
                {spellOptions.map((spellType) => {
                  const spell = SPELL_DATA[spellType];
                  const isSelected = selectedSpells.includes(spellType);
                  const selectionIndex = selectedSpells.indexOf(spellType);
                  const canSelect = isSelected || selectedSpells.length < 3;
                  const info = spellInfo[spellType];

                  return (
                    <button
                      key={spellType}
                      onClick={() => toggleSpell(spellType)}
                      disabled={!canSelect && !isSelected}
                      className={`relative w-16 h-16 rounded-xl transition-all duration-200 group ${isSelected
                        ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-stone-900 scale-110 z-10"
                        : canSelect
                          ? "hover:scale-105"
                          : "opacity-40 cursor-not-allowed"
                        }`}
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(88, 28, 135, 0.2))`
                          : 'rgba(41, 37, 36, 0.8)',
                        border: `2px solid ${isSelected ? '#a855f7' : 'rgba(120, 113, 108, 0.5)'}`,
                        boxShadow: isSelected ? '0 0 20px rgba(147, 51, 234, 0.4)' : 'none',
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <SpellSprite type={spellType} size={48} />
                      </div>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-stone-900 font-bold text-white text-sm">
                          {selectionIndex + 1}
                        </div>
                      )}
                      {/* Hover tooltip */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <div className="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-[10px] text-amber-200 whitespace-nowrap">
                          {spell.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Spells Details */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {selectedSpells.length > 0 ? (
                  selectedSpells.map((spellType, i) => {
                    const spell = SPELL_DATA[spellType];
                    const info = spellInfo[spellType];

                    return (
                      <div
                        key={spellType}
                        className={`rounded-lg border overflow-hidden ${info?.color === "orange" ? "bg-orange-950/30 border-orange-800/40" :
                          info?.color === "yellow" ? "bg-yellow-950/30 border-yellow-800/40" :
                            info?.color === "cyan" ? "bg-cyan-950/30 border-cyan-800/40" :
                              info?.color === "amber" ? "bg-amber-950/30 border-amber-800/40" :
                                info?.color === "green" ? "bg-green-950/30 border-green-800/40" :
                                  "bg-purple-950/30 border-purple-800/40"
                          }`}
                      >
                        <div className="p-3 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg ${info?.color === "orange" ? "bg-orange-500/20 text-orange-400" :
                            info?.color === "yellow" ? "bg-yellow-500/20 text-yellow-400" :
                              info?.color === "cyan" ? "bg-cyan-500/20 text-cyan-400" :
                                info?.color === "amber" ? "bg-amber-500/20 text-amber-400" :
                                  info?.color === "green" ? "bg-green-500/20 text-green-400" :
                                    "bg-purple-500/20 text-purple-400"
                            }`}>
                            {i + 1}
                          </div>
                          <SpellSprite type={spellType} size={36} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-amber-200">{spell.name}</span>
                              <span className="text-lg">{spell.icon}</span>
                            </div>
                            <p className="text-[10px] text-stone-400 truncate">{spell.desc}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${spell.cost > 0 ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"
                              }`}>
                              {spell.cost > 0 ? `${spell.cost} PP` : "FREE"}
                            </span>
                            <span className="text-[10px] text-stone-500 flex items-center gap-1">
                              <Timer size={10} /> {spell.cooldown / 1000}s
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex items-center justify-center h-32">
                    <div className="text-center text-stone-500">
                      <Zap size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Select 3 spells above</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowCodex(true)}
              className="px-4 py-2.5 bg-stone-800/80 border border-amber-700/50 rounded-lg text-amber-400 hover:bg-stone-700/80 hover:border-amber-600/60 transition-all flex items-center justify-center gap-2"
            >
              <Info size={16} />
              <span className="font-medium">View Codex</span>
            </button>
            <button
              onClick={() => canStart && setGameState("playing")}
              disabled={!canStart}
              className={`py-4 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 flex items-center justify-center gap-3 ${canStart
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-900 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60"
                : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700"
                }`}
            >
              <Swords size={22} />
              BEGIN BATTLE
              <ChevronRight size={22} />
            </button>
            {!canStart && (
              <p className="text-center text-xs text-stone-500">
                {!selectedHero && !selectedSpells.length ? "Select a champion and 3 spells" :
                  !selectedHero ? "Select a champion" :
                    `Select ${3 - selectedSpells.length} more spell${3 - selectedSpells.length > 1 ? 's' : ''}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Codex Modal */}
      {showCodex && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-6">
          <OrnateFrame
            className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl border-2 border-amber-700/60 max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            cornerSize={48}
            color="#d97706"
            glowColor="#f59e0b"
          >
            <div className="px-6 py-4 border-b border-amber-800/50 flex items-center justify-between bg-gradient-to-r from-amber-900/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Crown size={22} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-400 tracking-wide">CODEX</h2>
                  <p className="text-xs text-amber-600">Knowledge of the realm</p>
                </div>
              </div>
              <button
                onClick={() => setShowCodex(false)}
                className="w-10 h-10 rounded-lg bg-stone-700/50 hover:bg-red-900/50 text-stone-400 hover:text-red-400 transition-colors flex items-center justify-center"
              >
                <X size={22} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-amber-900/40 bg-stone-800/30">
              {([
                { id: "towers" as CodexTab, icon: <Building size={16} />, label: "Towers" },
                { id: "enemies" as CodexTab, icon: <Target size={16} />, label: "Enemies" },
                { id: "heroes" as CodexTab, icon: <Shield size={16} />, label: "Heroes" },
                { id: "spells" as CodexTab, icon: <Sparkles size={16} />, label: "Spells" },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCodexTab(tab.id)}
                  className={`flex-1 py-3.5 text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${codexTab === tab.id
                    ? "bg-amber-900/40 text-amber-300 border-b-2 border-amber-400"
                    : "text-amber-600 hover:text-amber-400 hover:bg-stone-700/30"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {codexTab === "towers" && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(TOWER_DATA).map(([key, tower]) => {
                    const type = key as TowerType;
                    const colorClass = type === "station" ? "purple" : type === "library" ? "blue" : type === "club" ? "green" : "amber";

                    return (
                      <div
                        key={key}
                        className={`rounded-xl overflow-hidden border transition-all hover:scale-[1.02] ${colorClass === "purple" ? "bg-purple-950/30 border-purple-800/40 hover:border-purple-600/60" :
                          colorClass === "blue" ? "bg-blue-950/30 border-blue-800/40 hover:border-blue-600/60" :
                            colorClass === "green" ? "bg-green-950/30 border-green-800/40 hover:border-green-600/60" :
                              "bg-amber-950/30 border-amber-800/40 hover:border-amber-600/60"
                          }`}
                      >
                        <div className={`px-4 py-2 border-b ${colorClass === "purple" ? "bg-purple-950/50 border-purple-800/30" :
                          colorClass === "blue" ? "bg-blue-950/50 border-blue-800/30" :
                            colorClass === "green" ? "bg-green-950/50 border-green-800/30" :
                              "bg-amber-950/50 border-amber-800/30"
                          }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium uppercase tracking-wider ${colorClass === "purple" ? "text-purple-400" :
                              colorClass === "blue" ? "text-blue-400" :
                                colorClass === "green" ? "text-green-400" :
                                  "text-amber-400"
                              }`}>
                              {type === "station" ? "Troop Spawner" : type === "library" ? "Support" : type === "club" ? "Economy" : "Damage Dealer"}
                            </span>
                            <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                              <Coins size={12} /> {tower.cost} PP
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex items-start gap-4">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClass === "purple" ? "bg-purple-900/30 border-purple-700/40" :
                            colorClass === "blue" ? "bg-blue-900/30 border-blue-700/40" :
                              colorClass === "green" ? "bg-green-900/30 border-green-700/40" :
                                "bg-amber-900/30 border-amber-700/40"
                            }`}>
                            <TowerSprite type={type} size={52} level={1} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-amber-200 text-lg mb-1">{tower.name}</h3>
                            <p className="text-xs text-stone-400 mb-3">{tower.desc}</p>
                            <div className="flex flex-wrap gap-2">
                              {tower.damage > 0 && (
                                <span className="text-[10px] px-2 py-1 bg-red-950/50 rounded text-red-300 border border-red-900/40 flex items-center gap-1">
                                  <Swords size={10} /> {tower.damage} DMG
                                </span>
                              )}
                              {tower.range > 0 && type !== "club" && (
                                <span className="text-[10px] px-2 py-1 bg-blue-950/50 rounded text-blue-300 border border-blue-900/40 flex items-center gap-1">
                                  <Target size={10} /> {tower.range} RNG
                                </span>
                              )}
                              {type === "library" && (
                                <span className="text-[10px] px-2 py-1 bg-cyan-950/50 rounded text-cyan-300 border border-cyan-900/40 flex items-center gap-1">
                                  <Snowflake size={10} /> Slows
                                </span>
                              )}
                              {type === "club" && (
                                <span className="text-[10px] px-2 py-1 bg-amber-950/50 rounded text-amber-300 border border-amber-900/40 flex items-center gap-1">
                                  <Coins size={10} /> Income
                                </span>
                              )}
                              {type === "station" && (
                                <span className="text-[10px] px-2 py-1 bg-purple-950/50 rounded text-purple-300 border border-purple-900/40 flex items-center gap-1">
                                  <Users size={10} /> Troops
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

              {codexTab === "enemies" && (() => {
                const enemyTypes = Object.keys(ENEMY_DATA) as EnemyType[];
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

                              // Determine threat level
                              const getThreatLevel = (hp: number, isBoss?: boolean) => {
                                if (isBoss || hp >= 1000) return { level: "Boss", color: "purple", icon: <Crown size={10} /> };
                                if (hp >= 500) return { level: "Elite", color: "orange", icon: <Star size={10} /> };
                                if (hp >= 200) return { level: "Standard", color: "yellow", icon: <Target size={10} /> };
                                return { level: "Minion", color: "green", icon: <Target size={10} /> };
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
                                  className="bg-gradient-to-br from-stone-900/90 to-stone-950/90 rounded-lg border border-stone-700/50 overflow-hidden hover:border-red-700/50 transition-colors"
                                >
                                  {/* Header */}
                                  <div className={`px-2.5 py-1.5 border-b flex items-center justify-between ${threat.color === "purple" ? "bg-purple-950/50 border-purple-800/30" :
                                    threat.color === "orange" ? "bg-orange-950/50 border-orange-800/30" :
                                      threat.color === "yellow" ? "bg-yellow-950/50 border-yellow-800/30" :
                                        "bg-green-950/50 border-green-800/30"
                                    }`}>
                                    <div className={`flex items-center gap-1.5 ${threat.color === "purple" ? "text-purple-400" :
                                      threat.color === "orange" ? "text-orange-400" :
                                        threat.color === "yellow" ? "text-yellow-400" :
                                          "text-green-400"
                                      }`}>
                                      {threat.icon}
                                      <span className="text-[10px] font-medium uppercase tracking-wider">
                                        {threat.level}
                                      </span>
                                    </div>
                                    <div className={`flex items-center gap-1 text-[10px] ${enemyTypeClass.color === "cyan" ? "text-cyan-400" :
                                      enemyTypeClass.color === "purple" ? "text-purple-400" :
                                        enemyTypeClass.color === "stone" ? "text-stone-400" :
                                          enemyTypeClass.color === "green" ? "text-green-400" :
                                            "text-red-400"
                                      }`}>
                                      {enemyTypeClass.icon}
                                      <span>{enemyTypeClass.type}</span>
                                    </div>
                                  </div>

                                  <div className="p-2.5">
                                    <div className="flex items-start gap-2.5 mb-2">
                                      <div className="w-11 h-11 rounded-lg bg-stone-800/80 border border-red-900/40 flex items-center justify-center flex-shrink-0">
                                        <EnemySprite type={type} size={36} />
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
                                        <p className="text-[9px] text-stone-400 line-clamp-2 mt-0.5">{enemy.desc}</p>
                                      </div>
                                    </div>

                                    {/* Base Stats */}
                                    <div className="grid grid-cols-4 gap-1 mb-1.5">
                                      <div className="bg-red-950/50 rounded px-1 py-0.5 text-center border border-red-900/40">
                                        <div className="text-[8px] text-red-500">HP</div>
                                        <div className="text-red-300 font-bold text-[10px]">{enemy.hp}</div>
                                      </div>
                                      <div className="bg-amber-950/50 rounded px-1 py-0.5 text-center border border-amber-900/40">
                                        <div className="text-[8px] text-amber-500">Bounty</div>
                                        <div className="text-amber-300 font-bold text-[10px]">{enemy.bounty}</div>
                                      </div>
                                      <div className="bg-green-950/50 rounded px-1 py-0.5 text-center border border-green-900/40">
                                        <div className="text-[8px] text-green-500">Speed</div>
                                        <div className="text-green-300 font-bold text-[10px]">{enemy.speed}</div>
                                      </div>
                                      <div className="bg-stone-800/50 rounded px-1 py-0.5 text-center border border-stone-700/40">
                                        <div className="text-[8px] text-stone-500">Armor</div>
                                        <div className="text-stone-300 font-bold text-[10px]">{Math.round(enemy.armor * 100)}%</div>
                                      </div>
                                    </div>

                                    {/* Ranged Stats */}
                                    {enemy.isRanged && (
                                      <div className="grid grid-cols-3 gap-1 mb-1.5">
                                        <div className="bg-purple-950/40 rounded px-1 py-0.5 text-center border border-purple-900/30">
                                          <div className="text-[7px] text-purple-500">Range</div>
                                          <div className="text-purple-300 font-bold text-[9px]">{enemy.range}</div>
                                        </div>
                                        <div className="bg-purple-950/40 rounded px-1 py-0.5 text-center border border-purple-900/30">
                                          <div className="text-[7px] text-purple-500">Atk Spd</div>
                                          <div className="text-purple-300 font-bold text-[9px]">{(enemy.attackSpeed / 1000).toFixed(1)}s</div>
                                        </div>
                                        <div className="bg-purple-950/40 rounded px-1 py-0.5 text-center border border-purple-900/30">
                                          <div className="text-[7px] text-purple-500">Proj Dmg</div>
                                          <div className="text-purple-300 font-bold text-[9px]">{enemy.projectileDamage}</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* AoE Stats */}
                                    {hasAoE && (
                                      <div className="grid grid-cols-2 gap-1 mb-1.5">
                                        <div className="bg-orange-950/40 rounded px-1 py-0.5 text-center border border-orange-900/30">
                                          <div className="text-[7px] text-orange-500">AoE Radius</div>
                                          <div className="text-orange-300 font-bold text-[9px]">{enemy.aoeRadius}</div>
                                        </div>
                                        <div className="bg-orange-950/40 rounded px-1 py-0.5 text-center border border-orange-900/30">
                                          <div className="text-[7px] text-orange-500">AoE Dmg</div>
                                          <div className="text-orange-300 font-bold text-[9px]">{enemy.aoeDamage}</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Flying Troop Attack Stats */}
                                    {enemy.targetsTroops && enemy.troopDamage && (
                                      <div className="grid grid-cols-2 gap-1 mb-1.5">
                                        <div className="bg-cyan-950/40 rounded px-1 py-0.5 text-center border border-cyan-900/30">
                                          <Wind size={10} className="mx-auto text-cyan-400 mb-0.5" />
                                          <div className="text-[7px] text-cyan-500">Swoop</div>
                                          <div className="text-cyan-300 font-bold text-[9px]">{enemy.troopDamage}</div>
                                        </div>
                                        <div className="bg-cyan-950/40 rounded px-1 py-0.5 text-center border border-cyan-900/30">
                                          <Timer size={10} className="mx-auto text-cyan-400 mb-0.5" />
                                          <div className="text-[7px] text-cyan-500">Speed</div>
                                          <div className="text-cyan-300 font-bold text-[9px]">{((enemy.troopAttackSpeed || 2000) / 1000).toFixed(1)}s</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Melee Combat Stats */}
                                    {!enemy.flying && !enemy.breakthrough && !enemy.isRanged && (
                                      <div className="grid grid-cols-2 gap-1 mb-1.5">
                                        <div className="bg-red-950/40 rounded px-1 py-0.5 text-center border border-red-900/30">
                                          <Swords size={10} className="mx-auto text-red-400 mb-0.5" />
                                          <div className="text-[7px] text-red-500">Melee</div>
                                          <div className="text-red-300 font-bold text-[9px]">15</div>
                                        </div>
                                        <div className="bg-red-950/40 rounded px-1 py-0.5 text-center border border-red-900/30">
                                          <Timer size={10} className="mx-auto text-red-400 mb-0.5" />
                                          <div className="text-[7px] text-red-500">Speed</div>
                                          <div className="text-red-300 font-bold text-[9px]">1.0s</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Breakthrough indicator */}
                                    {enemy.breakthrough && (
                                      <div className="mb-1.5">
                                        <div className="bg-sky-950/40 rounded px-1 py-0.5 text-center border border-sky-900/30">
                                          <div className="text-sky-300 font-bold text-[9px] flex items-center justify-center gap-1">
                                            <Zap size={10} className="text-sky-400" />
                                            Bypasses Troops
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Traits */}
                                    {traits.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-1.5">
                                        {traits.map((trait, i) => {
                                          const traitInfo = getTraitInfo(trait);
                                          return (
                                            <span
                                              key={i}
                                              className={`text-[8px] px-1.5 py-0.5 bg-stone-800/60 rounded border border-stone-700/50 flex items-center gap-0.5 ${traitInfo.color}`}
                                              title={traitInfo.desc}
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
                                      <div className="space-y-1 max-h-20 overflow-y-auto">
                                        {abilities.map((ability, i) => {
                                          const abilityInfo = getAbilityInfo(ability.type);
                                          return (
                                            <div
                                              key={i}
                                              className={`p-1 rounded border ${abilityInfo.bgColor}`}
                                            >
                                              <div className="flex items-center gap-1 mb-0.5">
                                                <span className={abilityInfo.color}>{abilityInfo.icon}</span>
                                                <span className="text-[9px] font-bold text-white">{ability.name}</span>
                                                <span className="text-[7px] px-1 py-0.5 bg-black/30 rounded text-white/70 ml-auto">
                                                  {Math.round(ability.chance * 100)}%
                                                </span>
                                              </div>
                                              <div className="flex flex-wrap gap-x-1.5 text-[7px]">
                                                <span className="text-white/50">
                                                  {(ability.duration / 1000).toFixed(1)}s
                                                </span>
                                                {ability.intensity !== undefined && (
                                                  <span className="text-white/50">
                                                    {ability.type === "slow" || ability.type.includes("tower")
                                                      ? `${Math.round(ability.intensity * 100)}%`
                                                      : `${ability.intensity} DPS`}
                                                  </span>
                                                )}
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

              {codexTab === "heroes" && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(HERO_DATA).map(([key, hero]) => {
                    const heroType = key as HeroType;
                    const roleData = heroRoles[heroType];
                    const cooldown = HERO_ABILITY_COOLDOWNS[heroType] || 30000;

                    return (
                      <div
                        key={key}
                        className="rounded-xl overflow-hidden border bg-stone-800/40 border-stone-700/50 transition-all hover:scale-[1.02] hover:border-amber-600/50"
                      >
                        <div className={`px-4 py-2 border-b flex items-center justify-between ${roleData?.color === "orange" ? "bg-orange-950/40 border-orange-800/30" :
                          roleData?.color === "purple" ? "bg-purple-950/40 border-purple-800/30" :
                            roleData?.color === "blue" ? "bg-blue-950/40 border-blue-800/30" :
                              roleData?.color === "green" ? "bg-green-950/40 border-green-800/30" :
                                roleData?.color === "cyan" ? "bg-cyan-950/40 border-cyan-800/30" :
                                  roleData?.color === "red" ? "bg-red-950/40 border-red-800/30" :
                                    "bg-amber-950/40 border-amber-800/30"
                          }`}>
                          <div className={`flex items-center gap-2 ${roleData?.color === "orange" ? "text-orange-400" :
                            roleData?.color === "purple" ? "text-purple-400" :
                              roleData?.color === "blue" ? "text-blue-400" :
                                roleData?.color === "green" ? "text-green-400" :
                                  roleData?.color === "cyan" ? "text-cyan-400" :
                                    roleData?.color === "red" ? "text-red-400" :
                                      "text-amber-400"
                            }`}>
                            {roleData?.icon}
                            <span className="text-xs font-medium uppercase tracking-wider">{roleData?.role}</span>
                          </div>
                          <span className="text-lg">{hero.icon}</span>
                        </div>
                        <div className="p-4 flex items-start gap-4">
                          <div
                            className="w-16 h-16 rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                            style={{
                              borderColor: hero.color,
                              backgroundColor: hero.color + "20",
                            }}
                          >
                            <HeroSprite type={heroType} size={52} color={hero.color} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-amber-200 text-lg mb-1">{hero.name}</h3>
                            <p className="text-xs text-stone-400 mb-2 line-clamp-2">{hero.description}</p>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className="text-[9px] px-1.5 py-0.5 bg-red-950/50 rounded text-red-300 flex items-center gap-1">
                                <Heart size={8} /> {hero.hp}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-orange-950/50 rounded text-orange-300 flex items-center gap-1">
                                <Swords size={8} /> {hero.damage}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-blue-950/50 rounded text-blue-300 flex items-center gap-1">
                                <Target size={8} /> {hero.range}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-green-950/50 rounded text-green-300 flex items-center gap-1">
                                <Gauge size={8} /> {hero.speed}
                              </span>
                            </div>
                            <div className="bg-purple-950/30 rounded px-2 py-1.5 border border-purple-800/30">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-purple-300 font-medium flex items-center gap-1">
                                  <Sparkles size={10} /> {hero.ability}
                                </span>
                                <span className="text-[9px] text-purple-400 flex items-center gap-1">
                                  <Timer size={9} /> {cooldown / 1000}s
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {codexTab === "spells" && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(SPELL_DATA).map(([key, spell]) => {
                    const spellType = key as SpellType;
                    const info = spellInfo[spellType];

                    return (
                      <div
                        key={key}
                        className={`rounded-xl overflow-hidden border transition-all hover:scale-[1.02] ${info?.color === "orange" ? "bg-orange-950/30 border-orange-800/40 hover:border-orange-600/60" :
                          info?.color === "yellow" ? "bg-yellow-950/30 border-yellow-800/40 hover:border-yellow-600/60" :
                            info?.color === "cyan" ? "bg-cyan-950/30 border-cyan-800/40 hover:border-cyan-600/60" :
                              info?.color === "amber" ? "bg-amber-950/30 border-amber-800/40 hover:border-amber-600/60" :
                                info?.color === "green" ? "bg-green-950/30 border-green-800/40 hover:border-green-600/60" :
                                  "bg-purple-950/30 border-purple-800/40 hover:border-purple-600/60"
                          }`}
                      >
                        <div className={`px-4 py-2 border-b flex items-center justify-between ${info?.color === "orange" ? "bg-orange-950/50 border-orange-800/30" :
                          info?.color === "yellow" ? "bg-yellow-950/50 border-yellow-800/30" :
                            info?.color === "cyan" ? "bg-cyan-950/50 border-cyan-800/30" :
                              info?.color === "amber" ? "bg-amber-950/50 border-amber-800/30" :
                                info?.color === "green" ? "bg-green-950/50 border-green-800/30" :
                                  "bg-purple-950/50 border-purple-800/30"
                          }`}>
                          <div className={`flex items-center gap-2 ${info?.color === "orange" ? "text-orange-400" :
                            info?.color === "yellow" ? "text-yellow-400" :
                              info?.color === "cyan" ? "text-cyan-400" :
                                info?.color === "amber" ? "text-amber-400" :
                                  info?.color === "green" ? "text-green-400" :
                                    "text-purple-400"
                            }`}>
                            {info?.icon}
                            <span className="text-xs font-medium uppercase tracking-wider">{info?.category}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${spell.cost > 0 ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"
                            }`}>
                            {spell.cost > 0 ? `${spell.cost} PP` : "FREE"}
                          </span>
                        </div>
                        <div className="p-4 flex items-start gap-4">
                          <div className={`w-16 h-16 rounded-lg border flex items-center justify-center flex-shrink-0 ${info?.color === "orange" ? "bg-orange-900/30 border-orange-700/40" :
                            info?.color === "yellow" ? "bg-yellow-900/30 border-yellow-700/40" :
                              info?.color === "cyan" ? "bg-cyan-900/30 border-cyan-700/40" :
                                info?.color === "amber" ? "bg-amber-900/30 border-amber-700/40" :
                                  info?.color === "green" ? "bg-green-900/30 border-green-700/40" :
                                    "bg-purple-900/30 border-purple-700/40"
                            }`}>
                            <SpellSprite type={spellType} size={52} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-amber-200 text-lg">{spell.name}</h3>
                              <span className="text-xl">{spell.icon}</span>
                            </div>
                            <p className="text-xs text-stone-400 mb-3">{spell.desc}</p>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 ${info?.color === "orange" ? "bg-orange-950/50 text-orange-300 border border-orange-900/40" :
                                info?.color === "yellow" ? "bg-yellow-950/50 text-yellow-300 border border-yellow-900/40" :
                                  info?.color === "cyan" ? "bg-cyan-950/50 text-cyan-300 border border-cyan-900/40" :
                                    info?.color === "amber" ? "bg-amber-950/50 text-amber-300 border border-amber-900/40" :
                                      info?.color === "green" ? "bg-green-950/50 text-green-300 border border-green-900/40" :
                                        "bg-purple-950/50 text-purple-300 border border-purple-900/40"
                                }`}>
                                <Timer size={10} /> {spell.cooldown / 1000}s Cooldown
                              </span>
                            </div>
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
      )}
    </div>
  );
}

export default SetupScreen;
