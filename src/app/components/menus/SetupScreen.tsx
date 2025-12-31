"use client";
import React, { useState, useRef, useEffect } from "react";
import { Shield, Zap, ChevronRight, Swords, X } from "lucide-react";
import type {
  HeroType,
  SpellType,
  LevelStars,
  CodexTab,
  TowerType,
  EnemyType,
} from "../../types";
import { HERO_DATA, SPELL_DATA, TOWER_DATA, ENEMY_DATA } from "../../constants";

// Import sprite components from GameUI
import { TowerSprite, HeroSprite, SpellSprite } from "../ui/GameUI";

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
  ];
  const spellOptions: SpellType[] = [
    "fireball",
    "lightning",
    "freeze",
    "payday",
    "reinforcements",
  ];

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
    <div
      className="w-full h-screen flex flex-col bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-amber-100 overflow-hidden"
      style={{ fontFamily: "'Cinzel', serif" }}
    >
      {/* Header */}
      <div className="flex-shrink-0 text-center py-4 border-b border-amber-900/50 bg-gradient-to-r from-transparent via-amber-950/50 to-transparent">
        <h1 className="text-3xl font-bold text-amber-400 tracking-widest">
          QUEST PREPARATION
        </h1>
        <p className="text-amber-600 text-sm mt-1">
          Select your battlefield, champion, and arcane powers
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Map */}
        <div className="w-1/2 p-4 flex flex-col">
          <h2 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
            <Swords className="w-5 h-5" />
            BATTLEFIELD
          </h2>
          <div className="flex-1 relative bg-gradient-to-br from-stone-800/80 to-stone-900/80 rounded-xl border-2 border-amber-900/50 overflow-hidden">
            {/* Map SVG */}
            <svg className="w-full h-full" viewBox="0 0 560 320">
              <defs>
                <pattern
                  id="grass"
                  patternUnits="userSpaceOnUse"
                  width="20"
                  height="20"
                >
                  <rect width="20" height="20" fill="#2d3a1f" />
                  <circle cx="5" cy="5" r="1" fill="#3d4a2f" opacity="0.5" />
                  <circle cx="15" cy="15" r="1" fill="#3d4a2f" opacity="0.5" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width="560" height="320" fill="url(#grass)" />

              {/* Battle craters */}
              {[
                { x: 60, y: 280, r: 15 },
                { x: 200, y: 80, r: 12 },
                { x: 350, y: 250, r: 18 },
                { x: 500, y: 100, r: 10 },
                { x: 150, y: 180, r: 8 },
                { x: 380, y: 150, r: 14 },
              ].map((crater, i) => (
                <g key={i}>
                  <ellipse
                    cx={crater.x}
                    cy={crater.y}
                    rx={crater.r}
                    ry={crater.r * 0.6}
                    fill="#1a1510"
                  />
                  <ellipse
                    cx={crater.x}
                    cy={crater.y - 2}
                    rx={crater.r * 0.8}
                    ry={crater.r * 0.4}
                    fill="#2a2520"
                  />
                </g>
              ))}

              {/* Connection paths */}
              <path
                d={`M ${levels[0].x + 30} ${levels[0].y} Q 200 160 ${
                  levels[1].x - 10
                } ${levels[1].y + 20}`}
                stroke={
                  unlockedMaps.includes("carnegie") ? "#b8860b" : "#3a3020"
                }
                strokeWidth="4"
                strokeDasharray={
                  unlockedMaps.includes("carnegie") ? "none" : "8 4"
                }
                fill="none"
              />
              <path
                d={`M ${levels[1].x + 30} ${levels[1].y + 20} Q 360 160 ${
                  levels[2].x - 30
                } ${levels[2].y}`}
                stroke={unlockedMaps.includes("nassau") ? "#b8860b" : "#3a3020"}
                strokeWidth="4"
                strokeDasharray={
                  unlockedMaps.includes("nassau") ? "none" : "8 4"
                }
                fill="none"
              />

              {/* Level nodes */}
              {levels.map((level) => {
                const stars = levelStars[level.id] || 0;
                const isSelected = selectedMap === level.id;
                const isCompleted = stars > 0;

                return (
                  <g
                    key={level.id}
                    className={level.unlocked ? "cursor-pointer" : "opacity-50"}
                    onClick={() => level.unlocked && setSelectedMap(level.id)}
                  >
                    {isSelected && (
                      <circle
                        cx={level.x}
                        cy={level.y}
                        r="45"
                        fill="none"
                        stroke="#ffd700"
                        strokeWidth="3"
                        filter="url(#glow)"
                      />
                    )}
                    <circle
                      cx={level.x}
                      cy={level.y}
                      r="35"
                      fill={
                        isCompleted
                          ? "#2a4020"
                          : level.unlocked
                          ? "#3a2a1a"
                          : "#1a1510"
                      }
                      stroke={
                        isSelected
                          ? "#ffd700"
                          : isCompleted
                          ? "#4a6030"
                          : "#5a4a3a"
                      }
                      strokeWidth="3"
                    />
                    <circle
                      cx={level.x}
                      cy={level.y}
                      r="25"
                      fill={level.unlocked ? "#4a3a2a" : "#2a2520"}
                    />

                    {/* Level icons */}
                    {level.id === "poe" && (
                      <path
                        d={`M${level.x - 10} ${level.y + 5} L${level.x} ${
                          level.y - 10
                        } L${level.x + 10} ${level.y + 5} Z`}
                        fill="#8b7355"
                      />
                    )}
                    {level.id === "carnegie" && (
                      <>
                        <ellipse
                          cx={level.x}
                          cy={level.y + 3}
                          rx="12"
                          ry="6"
                          fill="#4a7090"
                        />
                        <path
                          d={`M${level.x - 8} ${level.y - 5} Q${level.x} ${
                            level.y - 12
                          } ${level.x + 8} ${level.y - 5}`}
                          stroke="#6090b0"
                          strokeWidth="2"
                          fill="none"
                        />
                      </>
                    )}
                    {level.id === "nassau" && (
                      <>
                        <rect
                          x={level.x - 10}
                          y={level.y - 8}
                          width="20"
                          height="16"
                          fill="#8b6914"
                        />
                        <polygon
                          points={`${level.x - 12},${level.y - 8} ${level.x},${
                            level.y - 18
                          } ${level.x + 12},${level.y - 8}`}
                          fill="#a67c00"
                        />
                      </>
                    )}

                    {/* Lock icon */}
                    {!level.unlocked && (
                      <g>
                        <rect
                          x={level.x - 6}
                          y={level.y - 3}
                          width="12"
                          height="10"
                          rx="2"
                          fill="#666"
                        />
                        <path
                          d={`M${level.x - 4} ${level.y - 3} V${
                            level.y - 7
                          } A4 4 0 0 1 ${level.x + 4} ${level.y - 7} V${
                            level.y - 3
                          }`}
                          stroke="#666"
                          strokeWidth="2"
                          fill="none"
                        />
                      </g>
                    )}

                    {/* Stars */}
                    {isCompleted && (
                      <g>
                        {[0, 1, 2].map((i) => (
                          <polygon
                            key={i}
                            points={`${level.x - 15 + i * 15},${level.y + 28} ${
                              level.x - 13 + i * 15
                            },${level.y + 33} ${level.x - 18 + i * 15},${
                              level.y + 35
                            } ${level.x - 14 + i * 15},${level.y + 38} ${
                              level.x - 16 + i * 15
                            },${level.y + 43} ${level.x - 10 + i * 15},${
                              level.y + 40
                            } ${level.x - 4 + i * 15},${level.y + 43} ${
                              level.x - 6 + i * 15
                            },${level.y + 38} ${level.x - 2 + i * 15},${
                              level.y + 35
                            } ${level.x - 7 + i * 15},${level.y + 33}`}
                            fill={i < stars ? "#ffd700" : "#3a3020"}
                            stroke={i < stars ? "#b8860b" : "#2a2010"}
                            strokeWidth="1"
                          />
                        ))}
                      </g>
                    )}

                    <text
                      x={level.x}
                      y={level.y + 55}
                      textAnchor="middle"
                      fill={level.unlocked ? "#d4a574" : "#5a4a3a"}
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {level.name}
                    </text>
                  </g>
                );
              })}

              {/* Trees */}
              {[
                { x: 30, y: 50 },
                { x: 530, y: 280 },
                { x: 50, y: 250 },
                { x: 510, y: 50 },
                { x: 180, y: 280 },
                { x: 400, y: 80 },
              ].map((tree, i) => (
                <g key={`tree-${i}`}>
                  <rect
                    x={tree.x - 3}
                    y={tree.y - 5}
                    width="6"
                    height="15"
                    fill="#4a3020"
                  />
                  <circle cx={tree.x} cy={tree.y - 12} r="12" fill="#2d4a1f" />
                  <circle
                    cx={tree.x - 5}
                    cy={tree.y - 8}
                    r="8"
                    fill="#3d5a2f"
                  />
                  <circle
                    cx={tree.x + 5}
                    cy={tree.y - 10}
                    r="9"
                    fill="#2d4a1f"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right Side - Selection */}
        <div className="w-1/2 p-4 flex flex-col gap-4">
          {/* Hero Selection */}
          <div className="flex-1 bg-gradient-to-br from-stone-800/60 to-stone-900/60 rounded-xl border border-amber-900/50 p-4">
            <h2 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              CHOOSE YOUR CHAMPION
            </h2>
            <div className="grid grid-cols-5 gap-2">
              {heroOptions.map((heroType) => {
                const hero = HERO_DATA[heroType];
                const isSelected = selectedHero === heroType;
                return (
                  <button
                    key={heroType}
                    onClick={() => setSelectedHero(heroType)}
                    className={`relative p-2 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-400 shadow-lg shadow-amber-500/30 scale-105"
                        : "bg-stone-800/80 border border-stone-700 hover:border-amber-600 hover:bg-stone-700/80"
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      <div
                        className="rounded-full border-2 overflow-hidden"
                        style={{
                          borderColor: isSelected ? "#ffd700" : hero.color,
                          boxShadow: isSelected
                            ? `0 0 15px ${hero.color}`
                            : "none",
                        }}
                      >
                        <HeroSprite
                          type={heroType}
                          size={48}
                          color={hero.color}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-amber-200 truncate">
                        {hero.name}
                      </div>
                      <div className="text-[9px] text-amber-500 truncate">
                        {hero.ability}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-stone-900">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected hero details */}
            {selectedHero && (
              <div className="mt-3 p-3 bg-stone-900/50 rounded-lg border border-amber-900/30">
                <div className="flex items-center gap-3">
                  <HeroSprite
                    type={selectedHero}
                    size={45}
                    color={HERO_DATA[selectedHero].color}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-amber-200">
                      {HERO_DATA[selectedHero].name}
                    </div>
                    <div className="text-xs text-amber-500">
                      {HERO_DATA[selectedHero].abilityDesc}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-red-400">
                      HP: {HERO_DATA[selectedHero].hp}
                    </div>
                    <div className="text-orange-400">
                      DMG: {HERO_DATA[selectedHero].damage}
                    </div>
                    <div className="text-blue-400">
                      RNG: {HERO_DATA[selectedHero].range}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spell Selection */}
          <div className="flex-1 bg-gradient-to-br from-stone-800/60 to-stone-900/60 rounded-xl border border-amber-900/50 p-4">
            <h2 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              SELECT 3 SPELLS
              <span className="text-sm font-normal text-amber-600">
                ({selectedSpells.length}/3)
              </span>
            </h2>
            <div className="grid grid-cols-5 gap-2">
              {spellOptions.map((spellType) => {
                const spell = SPELL_DATA[spellType];
                const isSelected = selectedSpells.includes(spellType);
                const canSelect = isSelected || selectedSpells.length < 3;
                return (
                  <button
                    key={spellType}
                    onClick={() => toggleSpell(spellType)}
                    disabled={!canSelect && !isSelected}
                    className={`relative p-2 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-br from-purple-700 to-purple-900 border-2 border-purple-400 shadow-lg shadow-purple-500/30"
                        : canSelect
                        ? "bg-stone-800/80 border border-stone-700 hover:border-purple-600 hover:bg-stone-700/80"
                        : "bg-stone-900/50 border border-stone-800 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      <SpellSprite type={spellType} size={40} />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-amber-200 truncate">
                        {spell.name}
                      </div>
                      <div className="text-[9px] text-amber-500">
                        {spell.cost > 0 ? `${spell.cost} PP` : "Free"}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">
                          {selectedSpells.indexOf(spellType) + 1}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected spells summary */}
            {selectedSpells.length > 0 && (
              <div className="mt-3 flex gap-2">
                {selectedSpells.map((spellType, i) => (
                  <div
                    key={spellType}
                    className="flex-1 p-2 bg-purple-900/30 rounded-lg border border-purple-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 text-xs">{i + 1}.</span>
                      <SpellSprite type={spellType} size={24} />
                      <span className="text-xs text-amber-200">
                        {SPELL_DATA[spellType].name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Button */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowCodex(true)}
              className="px-6 py-3 bg-stone-800 border border-amber-800 rounded-lg text-amber-400 hover:bg-stone-700 transition-colors"
            >
              View Codex
            </button>
            <button
              onClick={() => canStart && setGameState("playing")}
              disabled={!canStart}
              className={`flex-1 py-4 rounded-xl font-bold text-lg tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
                canStart
                  ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-900 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/30"
                  : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700"
              }`}
            >
              <Swords className="w-6 h-6" />
              BEGIN BATTLE
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Codex Modal */}
      {showCodex && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl border-2 border-amber-700 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-amber-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-400">CODEX</h2>
              <button
                onClick={() => setShowCodex(false)}
                className="text-amber-500 hover:text-amber-300 p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-amber-900/50">
              {(["towers", "enemies", "heroes", "spells"] as CodexTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setCodexTab(tab)}
                    className={`flex-1 py-3 text-sm font-bold uppercase transition-colors ${
                      codexTab === tab
                        ? "bg-amber-900/30 text-amber-300 border-b-2 border-amber-400"
                        : "text-amber-600 hover:text-amber-400"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {codexTab === "towers" && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(TOWER_DATA).map(([key, tower]) => (
                    <div
                      key={key}
                      className="bg-stone-800/50 rounded-lg p-3 border border-stone-700"
                    >
                      <div className="flex items-center gap-3">
                        <TowerSprite type={key as TowerType} size={56} />
                        <div className="flex-1">
                          <div className="font-bold text-amber-200">
                            {tower.name}
                          </div>
                          <div className="text-xs text-amber-500">
                            {tower.desc}
                          </div>
                          <div className="text-xs text-amber-600 mt-1">
                            Cost: {tower.cost} PP
                            {tower.damage > 0 && ` | DMG: ${tower.damage}`}
                            {tower.range > 0 && ` | RNG: ${tower.range}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {codexTab === "enemies" && (
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(ENEMY_DATA).map(([key, enemy]) => (
                    <div
                      key={key}
                      className="bg-stone-800/50 rounded-lg p-3 border border-stone-700"
                    >
                      <div className="flex items-center gap-3">
                        <EnemySprite type={key as EnemyType} size={45} />
                        <div className="flex-1">
                          <div className="font-bold text-amber-200 text-sm">
                            {enemy.name}
                          </div>
                          <div className="text-xs text-amber-500">
                            HP: {enemy.hp} | SPD: {enemy.speed}
                          </div>
                          <div className="text-xs text-amber-600">
                            Bounty: {enemy.bounty} PP
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {codexTab === "heroes" && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(HERO_DATA).map(([key, hero]) => (
                    <div
                      key={key}
                      className="bg-stone-800/50 rounded-lg p-3 border border-stone-700"
                    >
                      <div className="flex items-center gap-3">
                        <HeroSprite type={key} size={55} color={hero.color} />
                        <div className="flex-1">
                          <div className="font-bold text-amber-200">
                            {hero.name}
                          </div>
                          <div className="text-xs text-amber-500">
                            {hero.ability}: {hero.abilityDesc}
                          </div>
                          <div className="text-xs text-amber-600 mt-1">
                            HP: {hero.hp} | DMG: {hero.damage} | RNG:{" "}
                            {hero.range}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {codexTab === "spells" && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(SPELL_DATA).map(([key, spell]) => (
                    <div
                      key={key}
                      className="bg-stone-800/50 rounded-lg p-3 border border-stone-700"
                    >
                      <div className="flex items-center gap-3">
                        <SpellSprite type={key as SpellType} size={50} />
                        <div className="flex-1">
                          <div className="font-bold text-amber-200">
                            {spell.name}
                          </div>
                          <div className="text-xs text-amber-500">
                            {spell.desc}
                          </div>
                          <div className="text-xs text-amber-600 mt-1">
                            Cost: {spell.cost > 0 ? `${spell.cost} PP` : "Free"}{" "}
                            | CD: {spell.cooldown / 1000}s
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SetupScreen;
