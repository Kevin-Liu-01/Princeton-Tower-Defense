"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  PawPrint,
  Heart,
  Timer,
  Zap,
  Construction,
  ArrowUp,
  CircleDollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftCircle,
  ArrowRightCircle,
  ZoomIn,
  ZoomOut,
  Users,
  X,
  Swords,
  Target,
  Coins,
  Gauge,
  Shield,
  Info,
  Crown,
  Pause,
  Play,
  RefreshCcw,
  Crosshair,
  CoinsIcon,
  Snowflake,
  UsersIcon,
  TargetIcon,
  GaugeIcon,
  ShellIcon,
  Wind,
  FastForward,
  Pointer,
  Grab,
  Clock,
  PlusCircle,
  Skull,
  Rewind,
  Lock,
  Activity,
  Home,
  Sparkles,
  Flame,
  TrendingUp,
  // Upgrade path icons
  Radio,
  Music,
  Focus,
  Mountain,
  Landmark,
  UserPlus,
  Repeat,
  CircleDot,
} from "lucide-react";
import type {
  Tower,
  Hero,
  Spell,
  TowerType,
  SpellType,
  Position,
  Enemy,
  DraggingTower,
} from "../../types";
import {
  TOWER_DATA,
  SPELL_DATA,
  HERO_DATA,
  HERO_ABILITY_COOLDOWNS,
  TROOP_DATA,
} from "../../constants";
import {
  calculateTowerStats,
  getUpgradeCost,
  TOWER_STATS,
} from "../../constants/towerStats";
import { TowerSprite, HeroSprite, SpellSprite } from "../../sprites";
import PrincetonTDLogo from "./PrincetonTDLogo";

export { TowerSprite, HeroSprite, SpellSprite };

// =============================================================================
// TOUCH DEVICE DETECTION HOOK
// =============================================================================

const useIsTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();
  }, []);
  
  return isTouchDevice;
};

// =============================================================================
// TOP HUD COMPONENT
// =============================================================================

interface TopHUDProps {
  pawPoints: number;
  lives: number;
  currentWave: number;
  totalWaves: number;
  nextWaveTimer: number;
  gameSpeed: number;
  setGameSpeed: (speed: number) => void;
  retryLevel: () => void;
  quitLevel: () => void;
  // Animation props
  goldSpellActive?: boolean;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  pawPoints,
  lives,
  currentWave,
  totalWaves,
  nextWaveTimer,
  gameSpeed,
  setGameSpeed,
  retryLevel,
  quitLevel,
  goldSpellActive = false,
}) => {
  // Track previous values for animation triggers
  const prevPawPoints = useRef(pawPoints);
  const prevLives = useRef(lives);

  // Animation states
  const [ppGain, setPpGain] = useState<{ amount: number; isGold: boolean } | null>(null);
  const [ppPulse, setPpPulse] = useState(false);
  const [livesShake, setLivesShake] = useState(false);
  const [livesFlash, setLivesFlash] = useState(false);

  // Detect pawPoints changes
  useEffect(() => {
    const diff = pawPoints - prevPawPoints.current;
    if (diff > 0) {
      // Gained money - show floating +X
      setPpGain({ amount: diff, isGold: goldSpellActive });
      setPpPulse(true);

      // Clear after animation
      const timeout1 = setTimeout(() => setPpGain(null), 1000);
      const timeout2 = setTimeout(() => setPpPulse(false), 300);

      prevPawPoints.current = pawPoints;
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
    prevPawPoints.current = pawPoints;
  }, [pawPoints, goldSpellActive]);

  // Detect lives changes
  useEffect(() => {
    if (lives < prevLives.current) {
      // Lost lives - shake and flash
      setLivesShake(true);
      setLivesFlash(true);

      const timeout1 = setTimeout(() => setLivesShake(false), 500);
      const timeout2 = setTimeout(() => setLivesFlash(false), 300);

      prevLives.current = lives;
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
    prevLives.current = lives;
  }, [lives]);

  return (
    <div
      className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-900 px-3 py-1.5 flex flex-col sm:flex-row items-center border-b-2 border-amber-600 shadow-lg relative flex-shrink-0"
      style={{ zIndex: 100 }}
    >
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="flex items-center">
          <PrincetonTDLogo height="h-10" width="w-8" />
          <div className="h-8 border-l border-amber-600 ml-1 sm:ml-3" />
        </div>

        {/* PawPoints with animation */}
        <div
          className={`relative flex items-center gap-1.5 px-2.5 py-1 border shadow-sm rounded-lg transition-all duration-200 ${goldSpellActive
            ? 'bg-yellow-900/80 border-yellow-400 shadow-yellow-500/50 shadow-lg'
            : 'bg-amber-950/60 border-amber-600'
            } ${ppPulse ? 'scale-110' : 'scale-100'}`}
        >
          {/* Floating +X animation */}
          {ppGain && (
            <div
              className={`absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-sm whitespace-nowrap animate-bounce pointer-events-none ${ppGain.isGold ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-green-400'
                }`}
              style={{
                animation: 'floatUp 1s ease-out forwards',
              }}
            >
              +{ppGain.amount}{ppGain.isGold && ' ✨'}
            </div>
          )}
          <PawPrint
            size={18}
            className={`transition-colors ${goldSpellActive ? 'text-yellow-300' : 'text-amber-400'}`}
          />
          <span
            className={`font-bold text-sm sm:text-lg transition-colors ${goldSpellActive ? 'text-yellow-200' : 'text-amber-300'
              }`}
          >
            {pawPoints}
          </span>
          <span className={`text-[10px] sm:ml-0.5 ${goldSpellActive ? 'text-yellow-400' : 'text-amber-500'}`}>PP</span>

          {/* Gold spell glow effect */}
          {goldSpellActive && (
            <div className="absolute inset-0 rounded-lg bg-yellow-400/20 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Lives with animation */}
        <div
          className={`relative flex items-center gap-1.5 px-2.5 py-1 bg-red-950/60 border border-red-800 shadow-sm rounded-lg transition-all ${livesShake ? 'animate-shake' : ''
            } ${livesFlash ? 'bg-red-600/80 border-red-400' : ''}`}
          style={{
            animation: livesShake ? 'shake 0.5s ease-in-out' : 'none',
          }}
        >
          <Heart
            size={18}
            className={`transition-all ${livesFlash ? 'text-red-200 scale-125' : 'text-red-400'}`}
            fill={livesFlash ? "#fecaca" : "#f87171"}
          />
          <span
            className={`font-bold text-sm sm:text-lg transition-colors ${livesFlash ? 'text-red-100' : 'text-red-300'
              }`}
          >
            {lives}
          </span>
          <span className="text-[10px] text-red-500 sm:ml-0.5">Lives</span>

          {/* Flash overlay */}
          {livesFlash && (
            <div className="absolute inset-0 rounded-lg bg-red-500/40 pointer-events-none" />
          )}
        </div>

        {/* Wave indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-amber-950/60 border border-amber-700 shadow-sm rounded-lg">
          <Crown size={16} className="text-amber-400" />
          <span className="text-[10px] text-amber-500">WAVE</span>
          <span className="font-bold text-sm sm:text-base text-amber-300">
            {Math.min(currentWave + 1, totalWaves)}/{totalWaves}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-blue-950/60 border border-blue-800 shadow-sm rounded-lg">
          <Timer size={16} className="text-blue-400" />
          <span className="hidden sm:inline text-[10px] text-blue-500">
            NEXT
          </span>
          <span className="font-bold text-sm sm:text-base text-blue-300">
            {Math.ceil(nextWaveTimer / 1000)}s
          </span>
        </div>
      </div>

      {/* CSS Keyframes for animations */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
      <div className="mt-2 sm:mt-0 flex ml-auto gap-1 sm:gap-3">
        <div
          className="flex items-center gap-1 border 
      border-amber-700 bg-gradient-to-br from-amber-950/70 to-stone-950/70
       px-2.5 py-1.5 rounded-lg shadow-sm"
        >
          <span className="text-[7px] sm:text-[10px] text-amber-500 mr-1">
            SPEED
          </span>
          <button
            onClick={() => {
              setGameSpeed((prev) => Math.max(prev - 0.5, 0));
            }}
            className="px-1.5 py-1 bg-green-950/80 hover:bg-green-900/80 rounded transition-colors border border-green-700 shadow-md"
          >
            <Rewind size={16} className="text-white" />
          </button>
          <span className="px-1.5 w-12 text-center text-xs py-1 bg-green-950/80 hover:bg-green-900/80 rounded transition-colors border border-green-700 shadow-md">
            {Number.isInteger(gameSpeed)
              ? gameSpeed + "x"
              : gameSpeed.toFixed(1) + "x"}
          </span>
          <button
            onClick={() => {
              setGameSpeed((prev) => Math.min(prev + 0.5, 3));
            }}
            className="px-1.5 py-1 bg-green-950/80 hover:bg-green-900/80 rounded transition-colors border border-green-700 shadow-md"
          >
            <FastForward size={16} className="text-white" />
          </button>
          {[0.5, 1, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => setGameSpeed(speed)}
              className={`px-2.5 py-1 border transition-all shadow-sm rounded font-bold text-xs ${gameSpeed === speed
                ? "bg-yellow-600/80 border-yellow-400 text-yellow-100"
                : "bg-blue-950/60 hover:bg-blue-900/60 border-blue-700 text-blue-300"
                }`}
            >
              {speed}x
            </button>
          ))}
        </div>
        <div
          className="flex items-center gap-1 border 
      border-amber-700 bg-gradient-to-br from-amber-950/70 to-stone-950/70
       px-1 py-1 rounded-lg shadow-sm sm:ml-3"
        >
          <button
            onClick={() => {
              if (gameSpeed === 0) {
                setGameSpeed(1);
              } else {
                setGameSpeed(0);
              }
            }}
            className="p-1.5 bg-amber-600/80 rounded-lg hover:bg-amber-600/60 border border-amber-700 shadow-md transition-colors"
          >
            {gameSpeed === 0 ? (
              <Play size={16} className="text-white" />
            ) : (
              <Pause size={16} className="text-white" />
            )}
          </button>
          <button
            onClick={() => {
              retryLevel();
            }}
            className="p-1.5 bg-green-700/80 hover:bg-green-600/80 rounded-lg border border-green-800 shadow-md transition-colors"
          >
            <RefreshCcw size={16} className="text-white" />
          </button>
          <button
            onClick={() => {
              quitLevel();
            }}
            className="p-1.5 bg-red-700/80 hover:bg-red-600/80 rounded-lg border border-red-800 shadow-md transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// CAMERA CONTROLS COMPONENT
// =============================================================================

interface CameraControlsProps {
  setCameraOffset: React.Dispatch<React.SetStateAction<Position>>;
  setCameraZoom: React.Dispatch<React.SetStateAction<number>>;
  defaultOffset?: Position;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  setCameraOffset,
  setCameraZoom,
  defaultOffset = { x: -40, y: -60 },
}) => {
  return (
    <div
      className="absolute top-2 right-2 flex flex-col gap-1"
      style={{ zIndex: 60 }}
    >
      <div className="bg-gradient-to-br from-amber-900/90 to-stone-900/90 p-2 rounded-lg border border-amber-700 shadow-lg backdrop-blur-sm">
        <div className="text-[9px] text-amber-300 mb-1 font-bold text-center tracking-wider">
          CAMERA
        </div>
        <div className="grid grid-cols-3 gap-0.5 bg-amber-950/20 p-1 rounded-lg border border-amber-800">
          <div></div>
          <button
            onClick={() => setCameraOffset((p) => ({ ...p, y: p.y + 30 }))}
            className="p-1 bg-amber-950/80 hover:bg-amber-700/60 rounded transition-colors border border-amber-800"
          >
            <ArrowUpCircle size={12} className="text-amber-400" />
          </button>
          <div></div>
          <button
            onClick={() => setCameraOffset((p) => ({ ...p, x: p.x + 30 }))}
            className="p-1 bg-amber-950/80 hover:bg-amber-700/60 rounded transition-colors border border-amber-800"
          >
            <ArrowLeftCircle size={12} className="text-amber-400" />
          </button>
          <button
            onClick={() => setCameraOffset(defaultOffset)}
            className="p-1 bg-amber-950/80 hover:bg-amber-700/60 rounded transition-colors border border-amber-800 text-amber-400 text-[8px]"
          >
            ●
          </button>
          <button
            onClick={() => setCameraOffset((p) => ({ ...p, x: p.x - 30 }))}
            className="p-1 bg-amber-950/80 hover:bg-amber-700/60 rounded transition-colors border border-amber-800"
          >
            <ArrowRightCircle size={12} className="text-amber-400" />
          </button>
          <div></div>
          <button
            onClick={() => setCameraOffset((p) => ({ ...p, y: p.y - 30 }))}
            className="p-1 bg-amber-950/80 hover:bg-amber-700/60 rounded transition-colors border border-amber-800"
          >
            <ArrowDownCircle size={12} className="text-amber-400" />
          </button>
          <div></div>
        </div>
        <div className="flex gap-0.5 mt-1">
          <button
            onClick={() => setCameraZoom((z) => Math.min(z + 0.15, 2.5))}
            className="flex-1 p-1 bg-amber-950/80 hover:bg-amber-700/60 rounded transition-colors flex items-center justify-center border border-amber-800"
          >
            <ZoomIn size={12} className="text-amber-400" />
          </button>
          <button
            onClick={() => setCameraZoom((z) => Math.max(z - 0.15, 0.6))}
            className="flex-1 p-1 bg-amber-950/80 hover:bg-amber-700/60 rounded transition-colors flex items-center justify-center border border-amber-800"
          >
            <ZoomOut size={12} className="text-amber-400" />
          </button>
        </div>
      </div>
      <div className="hidden sm:inline bg-stone-900/90 text-amber-300 text-[8px] rounded-lg p-2 border border-stone-700 shadow-lg backdrop-blur-sm">
        <div className="font-semibold tracking-wider mb-1 text-center">
          CONTROLS
        </div>
        <div className="flex text-[8px] flex-col gap-1">
          <div>
            <span className="font-mono">WASD</span>: Move Camera
          </div>
          <div>
            <span className="font-mono">+/-</span> : Zoom In / Out
          </div>
          <div>
            <span className="font-mono">ESC</span> : Unselect
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// HERO AND SPELL BAR COMPONENT - ENHANCED
// =============================================================================

interface HeroSpellBarProps {
  hero: Hero | null;
  spells: Spell[];
  pawPoints: number;
  enemies: Enemy[];
  useHeroAbility: () => void;
  castSpell: (spellType: SpellType) => void;
}

export const HeroSpellBar: React.FC<HeroSpellBarProps> = ({
  hero,
  spells,
  pawPoints,
  enemies,
  useHeroAbility,
  castSpell,
}) => {
  const [hoveredSpell, setHoveredSpell] = React.useState<SpellType | null>(
    null
  );
  const isTouchDevice = useIsTouchDevice();

  const spellDetails: Record<string, string> = {
    fireball:
      "Meteor falls from sky dealing 200 AoE damage with falloff. 150 radius. Best vs clustered enemies.",
    lightning:
      "Chains to 5 enemies for 600 total damage split. 0.5s stun per hit.",
    freeze:
      "Freezes ALL enemies on map for 3 seconds. Great for emergency situations.",
    payday:
      "80 PP base + 5 per enemy (max 50 bonus). Use when many enemies are on screen!",
    reinforcements:
      "Summons 3 knights (500 HP, 30 DMG each). Click to place anywhere.",
  };

  return (
    <div
      className="bg-gradient-to-r from-amber-900/95 via-yellow-900/95 to-amber-900/95 px-2 sm:px-3 py-2 flex items-center justify-between border-t border-amber-600 backdrop-blur-sm"
      style={{ zIndex: 100 }}
    >
      {/* Hero Section */}
      <button
        className="flex-1 h-full"
        onClick={() => {
          if (!hero.selected) {
            hero.selected = true;
          } else {
            hero.selected = false;
          }
        }}
      >
        {hero && (
          <div className="flex h-full items-center gap-2 sm:gap-3">
            {hero.dead ? (
              <div className="h-full bg-stone-900/80 animate-pulse pl-2 sm:pl-4 pr-4 sm:pr-8 p-1.5 sm:p-2 border border-stone-700 shadow-md rounded-lg flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 pt-0.5 rounded-lg bg-stone-800 border border-stone-600 flex items-center justify-center opacity-50 overflow-hidden">
                  <HeroSprite type={hero.type} size={28} />
                </div>
                <div className="flex flex-col">
                  <div className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase text-nowrap tracking-wide flex items-center gap-1">
                    <Shield size={10} className="sm:w-3 sm:h-3" /> {HERO_DATA[hero.type].name} <span className="hidden sm:inline">- FALLEN</span>
                  </div>
                  <div className="text-[10px] bg-red-800/30 rounded-lg px-1 mb-0.5 text-red-400 flex items-center mt-0.5">
                    <Timer size={10} className="mr-0.5" />
                    <span>
                      Respawning in{" "}
                      <span className="font-bold">
                        {Math.ceil(hero.respawnTimer / 1000)}s
                      </span>
                    </span>
                  </div>
                  <span className="flex items-center text-nowrap text-stone-500 text-[8px] p-0.5 bg-stone-900/80 px-1 rounded-lg">
                    <Info size={10} className="mr-0.5" />
                    Heroes respawn in 15s.
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={
                    hero.selected
                      ? "bg-amber-950/40 relative p-1.5 sm:p-2 border border-yellow-400 shadow-lg rounded-lg transition-all "
                      : "bg-amber-950/80 relative p-1.5 sm:p-2 border border-amber-600 shadow-md rounded-lg transition-all "
                  }
                >
                  {hero.selected ? (
                    <Grab
                      size={14}
                      className="text-amber-400 rounded p-0.5 bg-amber-900 absolute top-1 right-1 sm:top-2 sm:right-2 sm:w-[18px] sm:h-[18px]"
                    />
                  ) : (
                    <Pointer
                      size={14}
                      className="text-amber-600 rounded p-0.5 bg-amber-900 absolute top-1 right-1 sm:top-2 sm:right-2 sm:w-[18px] sm:h-[18px]"
                    />
                  )}

                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
                    <div
                      className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg pt-0.5 border-2 flex items-center justify-center overflow-hidden"
                      style={{
                        borderColor: HERO_DATA[hero.type].color,
                        backgroundColor: HERO_DATA[hero.type].color + "30",
                      }}
                    >
                      <HeroSprite type={hero.type} size={28} />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1 text-left">
                        {HERO_DATA[hero.type].name}{" "}
                        <span className="hidden sm:inline">
                          {HERO_DATA[hero.type].icon}
                        </span>
                      </div>
                      <div className="text-[8px] text-left text-amber-500">
                        {hero.selected
                          ? "Click map to move hero"
                          : "Click hero to select"}
                      </div>
                      <div className="hidden sm:flex gap-2 mt-0.5 text-[9px]">
                        <span className="text-orange-400">
                          <Swords size={12} className="inline" />{" "}
                          {HERO_DATA[hero.type].damage} DMG
                        </span>
                        <span className="text-blue-400">
                          <Target size={12} className="inline" />{" "}
                          {HERO_DATA[hero.type].range} RNG
                        </span>
                        <span className="text-green-400">
                          <Gauge size={12} className="inline" />{" "}
                          {HERO_DATA[hero.type].speed} SPD
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-stone-800 h-2 sm:h-2.5 border border-stone-700 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all rounded-full"
                      style={{
                        width: `${(hero.hp / hero.maxHp) * 100}%`,
                        background:
                          hero.hp / hero.maxHp > 0.5
                            ? "#22c55e"
                            : hero.hp / hero.maxHp > 0.25
                              ? "#eab308"
                              : "#ef4444",
                      }}
                    />
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-center mt-0.5 font-mono text-amber-400">
                    {Math.floor(hero.hp)}/{hero.maxHp} HP
                  </div>
                </div>
                <button
                  onClick={useHeroAbility}
                  disabled={!hero.abilityReady}
                  className={`px-2 sm:px-3 mr-1 sm:mr-auto py-1.5 sm:py-2.5 h-full relative transition-all font-bold border rounded-lg flex flex-col items-center ${hero.abilityReady
                    ? "bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 border-amber-500"
                    : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                    }`}
                >
                  {hero.abilityReady ? (
                    <div className="h-full flex flex-col py-0.5 sm:py-1 justify-center">
                      <span className="hidden sm:inline text-[7px] bg-amber-800/50 px-1 rounded-lg absolute top-1 right-1 text-amber-400">
                        {HERO_ABILITY_COOLDOWNS[hero.type] / 1000}s Cooldown
                      </span>
                      <span className="flex flex-col sm:flex-row gap-0.5 sm:gap-1 items-center text-[10px] sm:text-[12px] text-amber-200 font-bold">
                        <Zap
                          size={14}
                          className="text-yellow-300 hidden sm:inline mb-0.5"
                        />
                        {HERO_DATA[hero.type].ability}
                      </span>
                      <div className="hidden sm:inline text-[7px] max-w-28 my-0.5">
                        {HERO_DATA[hero.type].abilityDesc}
                      </div>
                      <span className="font-extrabold mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] text-amber-300/80">
                        READY
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full animate-pulse items-center justify-center sm:px-4">
                      <Timer size={14} className="text-stone-400 mb-0.5 sm:w-[18px] sm:h-[18px]" />
                      <span className="text-[9px] sm:text-[11px] text-stone-400">
                        {Math.ceil(hero.abilityCooldown / 1000)}s
                      </span>
                      <span className="text-[7px] sm:text-[8px] text-stone-500">
                        cooldown
                      </span>
                      <div
                        className="
                        text-[8px] sm:text-[10px] max-w-28 my-0.5 text-center text-stone-400
                      "
                      >
                        {HERO_DATA[hero.type].ability}
                      </div>
                    </div>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </button>

      {/* Spell Section */}
      <div className="flex items-center h-full gap-1 sm:gap-2 relative bg-amber-950/70 px-1.5 sm:px-3 py-1.5 sm:py-2 border border-amber-700 rounded-lg shadow-md">
        <span className="hidden sm:flex items-center flex-col text-[9px] text-amber-500 font-bold tracking-wider mr-1">
          <ShellIcon size={12} className="inline mb-0.5" />
          SPELLS <Wind size={12} className="inline ml-0.5 rotate-90" />
        </span>
        {spells.map((spell) => {
          const spellData = SPELL_DATA[spell.type];
          const canCast =
            spell.cooldown <= 0 &&
            pawPoints >= spellData.cost &&
            !(
              (spell.type === "fireball" || spell.type === "lightning") &&
              enemies.length === 0
            );
          const isHovered = hoveredSpell === spell.type;
          return (
            <div key={spell.type} className="relative">
              <button
                onClick={() => castSpell(spell.type)}
                disabled={!canCast}
                onMouseEnter={() => !isTouchDevice && setHoveredSpell(spell.type)}
                onMouseLeave={() => !isTouchDevice && setHoveredSpell(null)}
                className={`relative px-1 sm:px-2.5 py-1 sm:py-2 transition-all border shadow-md rounded-lg overflow-hidden ${canCast
                  ? "bg-gradient-to-b from-purple-700/90 to-purple-900/90 hover:from-purple-600/90 hover:to-purple-800/90 border-purple-500"
                  : "bg-stone-900/90 border-stone-700 opacity-50 cursor-not-allowed"
                  }`}
              >
                <div className="flex flex-col items-center min-w-[32px] sm:min-w-[44px]">
                  <SpellSprite type={spell.type} size={22} />
                  <div className="font-bold uppercase text-[7px] sm:text-[8px] tracking-wide text-purple-200 mt-0.5">
                    {spellData.name.split(" ")[0]}
                  </div>
                  <div className="text-[8px] sm:text-[9px] font-bold">
                    {spell.cooldown > 0 ? (
                      <span className="text-red-400">
                        {Math.ceil(spell.cooldown / 1000)}s
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        {spellData.cost > 0 ? `${spellData.cost}PP` : "FREE"}
                      </span>
                    )}
                  </div>
                </div>
                {spell.cooldown > 0 && (
                  <div
                    className="absolute inset-0 bg-black/70"
                    style={{
                      clipPath: `inset(${100 - (spell.cooldown / spell.maxCooldown) * 100
                        }% 0 0 0)`,
                    }}
                  />
                )}
              </button>
              {isHovered && (
                <div className="hidden sm:block absolute bottom-full left-[100%] -translate-x-[100%] mb-2 w-64 bg-stone-900/90 rounded-lg border border-purple-700/60 p-3 shadow-xl z-50 pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-200 font-bold">
                      {spellData.name}
                    </span>
                    <span className="text-lg">{spellData.icon}</span>
                  </div>
                  <p className="text-xs text-purple-400/90 mb-2">
                    {spellData.desc}
                  </p>
                  <div className="flex gap-2 mb-2 text-[10px]">
                    <span className="px-2 py-0.5 bg-amber-950/60 rounded text-amber-300">
                      💰 {spellData.cost > 0 ? `${spellData.cost} PP` : "FREE"}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-950/60 rounded text-blue-300">
                      ⏱ {spellData.cooldown / 1000}s
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-300/80 border-t border-purple-800/50 pt-2">
                    {spellDetails[spell.type]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// BUILD MENU COMPONENT - ENHANCED
// =============================================================================

interface BuildMenuProps {
  pawPoints: number;
  buildingTower: TowerType | null;
  setBuildingTower: (tower: TowerType | null) => void;
  setHoveredBuildTower: (tower: TowerType | null) => void;
  hoveredTower: string | null;
  setHoveredTower: (tower: string | null) => void;
  setDraggingTower: (dragging: DraggingTower | null) => void;
  placedTowers: Record<TowerType, number>;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  pawPoints,
  buildingTower,
  setBuildingTower,
  setHoveredBuildTower,
  hoveredTower,
  setHoveredTower,
  setDraggingTower,
  placedTowers,
}) => {
  const isTouchDevice = useIsTouchDevice();
  
  const towerStrategies: Record<string, string> = {
    cannon:
      "High single-target damage. Great for taking down tough enemies. Place along main paths.",
    archer:
      "Fast attacks, lower damage. Good for consistent DPS. Can hit flying enemies.",
    station:
      "Spawns troops to block enemies. Essential for creating chokepoints. No direct attack.",
    library:
      "Slows enemies in range. Perfect before high-damage towers. Stacks with multiple libraries.",
    lab: "Deals chain/splash damage. Excellent against swarms. Place where enemies cluster.",
    club: "Generates extra PP over time. Build early for economic advantage. No combat ability.",
  };

  return (
    <div
      className="bg-gradient-to-br from-amber-900/95 to-amber-950/95 px-1.5 sm:px-3 py-1.5 sm:py-2 border-t-2 border-amber-600 shadow-xl overflow-x-auto backdrop-blur-sm"
      style={{ zIndex: 100 }}
    >
      <div className="flex items-center gap-1 sm:gap-2 min-w-max">
        <h3 className="text-[10px] font-bold text-amber-300 tracking-wider hidden sm:flex flex-col justify-center gap-1 whitespace-nowrap px-1">
          <div className="flex items-center gap-1">
            <Construction size={14} /> <div>BUILD TOWERS</div>
          </div>
          <div className="text-[8px] text-amber-500 font-normal">
            (Click to Select / Deselect)
          </div>
        </h3>
        {Object.entries(TOWER_DATA).map(([type, data]) => {
          const towerType = type as TowerType;
          const canAfford = pawPoints >= data.cost;
          const isSelected = buildingTower === towerType;
          const isHovered = hoveredTower === towerType;
          return (
            <div key={type} className="relative w-full">
              <button
                onClick={() => {
                  // if we have a tower selected, deselect it
                  if (isSelected) {
                    setBuildingTower(null);
                    setHoveredBuildTower(null);
                    setHoveredTower(null);
                    setDraggingTower(null);
                  } else {
                    setBuildingTower(towerType);
                    setHoveredBuildTower(towerType);
                    setHoveredTower(towerType);
                    setDraggingTower(null);
                  }
                }}
                onMouseEnter={() => {
                  if (!isTouchDevice) {
                    setHoveredBuildTower(towerType);
                    setHoveredTower(towerType);
                  }
                }}
                onMouseLeave={() => {
                  if (!isTouchDevice) {
                    setHoveredBuildTower(null);
                    setHoveredTower(null);
                  }
                }}
                disabled={!canAfford}
                className={`px-1.5 sm:px-2.5 py-1 sm:py-1.5 w-full transition-all border flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap shadow-md rounded-lg ${isSelected
                  ? "bg-gradient-to-b from-amber-600 to-amber-800 border-amber-400 shadow-amber-500/30 scale-105"
                  : canAfford
                    ? "bg-gradient-to-b from-amber-950/80 to-stone-950/80 hover:from-amber-900/80 hover:to-stone-900/80 border-amber-700 hover:border-amber-500"
                    : "bg-stone-900/60 border-stone-700 opacity-40 cursor-not-allowed"
                  }`}
              >
                <span className="absolute top-1 sm:top-1.5 bg-amber-900 p-0.5 px-1 rounded-md right-1 sm:right-1.5 text-[7px] sm:text-[9px] font-bold text-amber-400">
                  {placedTowers[towerType] > 0
                    ? `x${placedTowers[towerType]}`
                    : "x0"}
                </span>
                <div className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center">
                  <TowerSprite type={towerType} size={26} />
                </div>
                <div className="flex flex-col items-start">
                  <div className="font-bold text-[8px] sm:text-[10px] text-amber-200">
                    {data.name}
                  </div>
                  <div className="text-[7px] sm:text-[9px] text-amber-400 flex items-center gap-0.5 sm:gap-1">
                    <PawPrint size={8} className="sm:w-2.5 sm:h-2.5" /> {data.cost} PP
                  </div>
                  <div className="hidden sm:flex gap-1.5 text-[8px] mt-0.5 flex-wrap">
                    {/* Standard combat towers */}
                    {data.damage > 0 && type !== "library" && (
                      <span className="text-red-400 flex items-center gap-0.5">
                        <Swords size={9} /> {data.damage}
                      </span>
                    )}
                    {data.range > 0 && type !== "station" && type !== "club" && (
                      <span className="text-blue-400 flex items-center gap-0.5">
                        <TargetIcon size={9} /> {data.range}
                      </span>
                    )}
                    {data.attackSpeed > 0 && (
                      <span className="text-green-400 flex items-center gap-0.5">
                        <GaugeIcon size={9} /> {data.attackSpeed}ms
                      </span>
                    )}
                    {/* Dinky Station */}
                    {type === "station" && (
                      <span className="text-purple-300 flex items-center gap-0.5">
                        <UsersIcon size={9} /> {TROOP_DATA.footsoldier.hp}HP / {TROOP_DATA.footsoldier.damage}DMG
                      </span>
                    )}
                    {/* Eating Club */}
                    {type === "club" && (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <CoinsIcon size={9} /> +8 PP/8s
                      </span>
                    )}
                    {/* Firestone Library */}
                    {type === "library" && (
                      <span className="text-purple-400 flex items-center gap-0.5">
                        <Snowflake size={9} /> 20% Slow
                      </span>
                    )}
                  </div>
                </div>
                {isSelected ? (
                  <Grab
                    size={14}
                    className="text-amber-400 rounded p-0.5 absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 sm:w-[18px] sm:h-[18px]"
                  />
                ) : (
                  <PlusCircle
                    size={14}
                    className="text-amber-600 rounded p-0.5 absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 sm:w-[18px] sm:h-[18px]"
                  />
                )}
              </button>

              {/* Enhanced Tooltip - hidden on mobile */}
              {isHovered && (
                <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-stone-900/98 rounded-lg border border-amber-700/60 p-3 shadow-xl z-50 pointer-events-none">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-14 h-14 rounded-lg bg-stone-800 border border-amber-600/50 flex items-center justify-center">
                      <TowerSprite type={towerType} size={48} level={1} />
                    </div>
                    <div>
                      <h4 className="text-amber-200 font-bold text-base">
                        {data.name}
                      </h4>
                      <p className="text-[10px] text-amber-500">{data.desc}</p>
                    </div>
                  </div>

                  {/* Stats Grid - Tower Type Specific */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2 text-[10px]">
                    <div className="bg-amber-950/60 rounded px-2 py-1 text-center border border-amber-800/40">
                      <div className="text-amber-500">Cost</div>
                      <div className="text-amber-300 font-bold">
                        {data.cost}
                      </div>
                    </div>

                    {/* Standard combat towers */}
                    {data.damage > 0 && type !== "library" && (
                      <div className="bg-red-950/60 rounded px-2 py-1 text-center border border-red-800/40">
                        <div className="text-red-500">Damage</div>
                        <div className="text-red-300 font-bold">
                          {data.damage}
                        </div>
                      </div>
                    )}
                    {data.range > 0 && type !== "station" && type !== "club" && (
                      <div className="bg-blue-950/60 rounded px-2 py-1 text-center border border-blue-800/40">
                        <div className="text-blue-500">Range</div>
                        <div className="text-blue-300 font-bold">
                          {data.range}
                        </div>
                      </div>
                    )}
                    {data.attackSpeed > 0 && (
                      <div className="bg-green-950/60 rounded px-2 py-1 text-center border border-green-800/40">
                        <div className="text-green-500">Speed</div>
                        <div className="text-green-300 font-bold">
                          {data.attackSpeed}ms
                        </div>
                      </div>
                    )}

                    {/* Dinky Station - Show troop stats */}
                    {type === "station" && (
                      <>
                        <div className="bg-red-950/60 rounded px-2 py-1 text-center border border-red-800/40">
                          <div className="text-red-500">Troop HP</div>
                          <div className="text-red-300 font-bold">
                            {TROOP_DATA.footsoldier.hp}
                          </div>
                        </div>
                        <div className="bg-orange-950/60 rounded px-2 py-1 text-center border border-orange-800/40">
                          <div className="text-orange-500">Troop DMG</div>
                          <div className="text-orange-300 font-bold">
                            {TROOP_DATA.footsoldier.damage}
                          </div>
                        </div>
                        <div className="bg-purple-950/60 rounded px-2 py-1 text-center border border-purple-800/40">
                          <div className="text-purple-500">Max Troops</div>
                          <div className="text-purple-300 font-bold">1</div>
                        </div>
                      </>
                    )}

                    {/* Firestone Library - Show slow stats */}
                    {type === "library" && (
                      <>
                        <div className="bg-purple-950/60 rounded px-2 py-1 text-center border border-purple-800/40">
                          <div className="text-purple-500">Slow</div>
                          <div className="text-purple-300 font-bold">20%</div>
                        </div>
                        <div className="bg-cyan-950/60 rounded px-2 py-1 text-center border border-cyan-800/40">
                          <div className="text-cyan-500">Duration</div>
                          <div className="text-cyan-300 font-bold">1s</div>
                        </div>
                      </>
                    )}

                    {/* Eating Club - Show income stats */}
                    {type === "club" && (
                      <>
                        <div className="bg-green-950/60 rounded px-2 py-1 text-center border border-green-800/40">
                          <div className="text-green-500">Income</div>
                          <div className="text-green-300 font-bold">+8 PP</div>
                        </div>
                        <div className="bg-cyan-950/60 rounded px-2 py-1 text-center border border-cyan-800/40">
                          <div className="text-cyan-500">Interval</div>
                          <div className="text-cyan-300 font-bold">8s</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Level 1 Description */}
                  <div className="bg-stone-800/50 rounded px-2 py-1.5 mb-2 border border-stone-700/50">
                    <div className="text-[9px] text-amber-500 uppercase tracking-wider mb-0.5">
                      Level 1
                    </div>
                    <p className="text-[10px] text-amber-300/90">
                      {data.levelDesc[1]}
                    </p>
                  </div>

                  {/* Strategy Tip */}
                  <div className="border-t border-amber-800/40 pt-2">
                    <div className="flex items-center gap-1 text-[9px] text-amber-500 mb-1">
                      <Info size={10} /> Strategy
                    </div>
                    <p className="text-[10px] text-amber-400/80">
                      {towerStrategies[type]}
                    </p>
                  </div>

                  {/* Upgrade Preview */}
                  <div className="mt-2 pt-2 border-t border-amber-800/40 flex justify-between items-center text-[9px]">
                    <span className="text-amber-500">
                      Upgrades to Lv.4 with 2 evolution paths
                    </span>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 bg-red-950/50 rounded text-red-400 border border-red-800/40">
                        Path A
                      </span>
                      <span className="px-1.5 py-0.5 bg-blue-950/50 rounded text-blue-400 border border-blue-800/40">
                        Path B
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// TOWER UPGRADE PANEL COMPONENT - ENHANCED
// =============================================================================

interface TowerUpgradePanelProps {
  tower: Tower;
  screenPos: Position;
  pawPoints: number;
  upgradeTower: (towerId: string, choice?: "A" | "B") => void;
  sellTower: (towerId: string) => void;
  onClose: () => void;
}

export const TowerUpgradePanel: React.FC<TowerUpgradePanelProps> = ({
  tower,
  screenPos,
  pawPoints,
  upgradeTower,
  sellTower,
  onClose,
}) => {
  const towerData = TOWER_DATA[tower.type];
  const towerStatsDef = TOWER_STATS[tower.type];

  // Get upgrade cost from towerStats.ts
  const upgradeCost = getUpgradeCost(tower.type, tower.level, tower.upgrade);

  // Calculate sell value based on invested costs
  const baseCost = TOWER_DATA[tower.type].cost;
  const level2Cost = tower.level >= 2 ? (TOWER_STATS[tower.type]?.levels[2]?.cost || 150) : 0;
  const level3Cost = tower.level >= 3 ? (TOWER_STATS[tower.type]?.levels[3]?.cost || 250) : 0;
  const level4Cost = tower.level >= 4 ? 400 : 0;
  const totalInvested = baseCost + level2Cost + level3Cost + level4Cost;
  const sellValue = Math.round(totalInvested * 0.7);

  // Get current stats using calculateTowerStats (without external buffs for base display)
  const baseStats = calculateTowerStats(tower.type, tower.level, tower.upgrade, 1, 1);

  // Apply tower's current buffs for buffed display
  const rangeBoost = tower.rangeBoost || 1;
  const damageBoost = tower.damageBoost || 1;
  const buffedStats = calculateTowerStats(tower.type, tower.level, tower.upgrade, rangeBoost, damageBoost);

  // Get next level stats for comparison
  const nextStats = tower.level < 4
    ? calculateTowerStats(tower.type, tower.level + 1, undefined, 1, 1)
    : null;

  // Get upgrade path stats for level 3 preview
  const upgradeAStats = tower.level === 3 ? calculateTowerStats(tower.type, 4, "A", 1, 1) : null;
  const upgradeBStats = tower.level === 3 ? calculateTowerStats(tower.type, 4, "B", 1, 1) : null;

  // Determine if stats are being buffed
  const hasRangeBuff = rangeBoost > 1;
  const hasDamageBuff = damageBoost > 1;

  // Build dynamic stats array based on what this tower has
  const statsToShow: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    value: number | string;
    buffedValue?: number | string;
    nextValue?: number | string;
    isBoosted?: boolean;
    boostAmount?: number;
    colorClass: string;
    buffColorClass: string;
  }> = [];

  // Damage
  if (baseStats.damage > 0) {
    statsToShow.push({
      key: "damage",
      label: "Damage",
      icon: <Swords size={14} />,
      value: Math.floor(baseStats.damage),
      buffedValue: hasDamageBuff ? Math.floor(buffedStats.damage) : undefined,
      nextValue: nextStats && nextStats.damage > baseStats.damage ? Math.floor(nextStats.damage) : undefined,
      isBoosted: hasDamageBuff,
      boostAmount: hasDamageBuff ? Math.round((damageBoost - 1) * 100) : undefined,
      colorClass: "bg-red-950/60 border-red-800/50 text-red-400",
      buffColorClass: "bg-orange-950/60 border-orange-500/70 text-orange-400",
    });
  }

  // Range  
  if (baseStats.range > 0 && tower.type !== "club") {
    statsToShow.push({
      key: "range",
      label: "Range",
      icon: <Target size={14} />,
      value: Math.floor(baseStats.range),
      buffedValue: hasRangeBuff ? Math.floor(buffedStats.range) : undefined,
      nextValue: nextStats && nextStats.range > baseStats.range ? Math.floor(nextStats.range) : undefined,
      isBoosted: hasRangeBuff,
      boostAmount: hasRangeBuff ? Math.round((rangeBoost - 1) * 100) : undefined,
      colorClass: "bg-blue-950/60 border-blue-800/50 text-blue-400",
      buffColorClass: "bg-cyan-950/60 border-cyan-500/70 text-cyan-400",
    });
  }

  // Attack Speed
  if (baseStats.attackSpeed > 0) {
    statsToShow.push({
      key: "speed",
      label: "Speed",
      icon: <Gauge size={14} />,
      value: `${baseStats.attackSpeed}ms`,
      nextValue: nextStats && nextStats.attackSpeed !== baseStats.attackSpeed && nextStats.attackSpeed > 0
        ? `${Math.floor(nextStats.attackSpeed)}ms` : undefined,
      colorClass: "bg-green-950/60 border-green-800/50 text-green-400",
      buffColorClass: "bg-green-950/60 border-green-500/70 text-green-400",
    });
  }

  // Slow Amount
  if (baseStats.slowAmount && baseStats.slowAmount > 0) {
    statsToShow.push({
      key: "slow",
      label: "Slow",
      icon: <Snowflake size={14} />,
      value: `${Math.round(baseStats.slowAmount * 100)}%`,
      nextValue: nextStats && nextStats.slowAmount && nextStats.slowAmount > baseStats.slowAmount
        ? `${Math.round(nextStats.slowAmount * 100)}%` : undefined,
      colorClass: "bg-purple-950/60 border-purple-800/50 text-purple-400",
      buffColorClass: "bg-purple-950/60 border-purple-500/70 text-purple-400",
    });
  }

  // Chain Targets - Changed to "Targets" with Users icon
  if (baseStats.chainTargets && baseStats.chainTargets > 1) {
    statsToShow.push({
      key: "chain",
      label: "Targets",
      icon: <Users size={14} />,
      value: `${baseStats.chainTargets}`,
      nextValue: nextStats && nextStats.chainTargets && nextStats.chainTargets > baseStats.chainTargets
        ? `${nextStats.chainTargets}` : undefined,
      colorClass: "bg-yellow-950/60 border-yellow-800/50 text-yellow-400",
      buffColorClass: "bg-yellow-950/60 border-yellow-500/70 text-yellow-400",
    });
  }

  // Splash Radius
  if (baseStats.splashRadius && baseStats.splashRadius > 0) {
    statsToShow.push({
      key: "splash",
      label: "Splash",
      icon: <Target size={14} />,
      value: Math.floor(baseStats.splashRadius),
      colorClass: "bg-orange-950/60 border-orange-800/50 text-orange-400",
      buffColorClass: "bg-orange-950/60 border-orange-500/70 text-orange-400",
    });
  }

  // Stun Chance (for towers like Blizzard)
  if (baseStats.stunChance && baseStats.stunChance > 0) {
    statsToShow.push({
      key: "stun",
      label: "Freeze",
      icon: <Snowflake size={14} />,
      value: `${Math.round(baseStats.stunChance * 100)}%`,
      colorClass: "bg-indigo-950/60 border-indigo-800/50 text-indigo-400",
      buffColorClass: "bg-indigo-950/60 border-indigo-500/70 text-indigo-400",
    });
  }

  // Burn Damage (for towers like Flamethrower)
  if (baseStats.burnDamage && baseStats.burnDamage > 0) {
    statsToShow.push({
      key: "burn",
      label: "Burn",
      icon: <Flame size={14} />,
      value: `${baseStats.burnDamage}/s`,
      colorClass: "bg-red-950/60 border-red-800/50 text-red-400",
      buffColorClass: "bg-red-950/60 border-red-500/70 text-red-400",
    });
  }

  // Support tower buffs - Check the active upgrade path for buffs
  const activeUpgradeStats = tower.level === 4 && tower.upgrade ? towerStatsDef?.upgrades?.[tower.upgrade]?.stats : null;

  // For non-club towers, show aura buffs in main stats grid
  // For club towers, we'll show them in the Paw Points Generation box instead
  if (tower.type !== "club") {
    if (activeUpgradeStats?.rangeBuff) {
      statsToShow.push({
        key: "rangeBuff",
        label: "Range Aura",
        icon: <Target size={14} />,
        value: `+${Math.round(activeUpgradeStats.rangeBuff * 100)}%`,
        colorClass: "bg-cyan-950/60 border-cyan-800/50 text-cyan-400",
        buffColorClass: "bg-cyan-950/60 border-cyan-500/70 text-cyan-400",
      });
    }

    if (activeUpgradeStats?.damageBuff) {
      statsToShow.push({
        key: "damageBuff",
        label: "DMG Aura",
        icon: <TrendingUp size={14} />,
        value: `+${Math.round(activeUpgradeStats.damageBuff * 100)}%`,
        colorClass: "bg-orange-950/60 border-orange-800/50 text-orange-400",
        buffColorClass: "bg-orange-950/60 border-orange-500/70 text-orange-400",
      });
    }
  }

  // Determine grid columns based on stat count
  const gridCols = statsToShow.length <= 2 ? 2 : statsToShow.length <= 3 ? 3 : 4;

  // Position panel - shifted down to be closer to tower
  const panelWidth = 280;
  let panelX = screenPos.x - panelWidth / 2;
  panelX = Math.max(10, Math.min(panelX, window.innerWidth - panelWidth - 10));
  let panelY = screenPos.y - 180; // Shifted down from -300
  panelY = Math.max(60, panelY);

  return (
    <div
      className="fixed pointer-events-none"
      style={{ left: panelX, top: panelY, zIndex: 200, width: panelWidth }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-gradient-to-br from-amber-900/98 to-stone-900/98 p-3 border-2 border-amber-500 pointer-events-auto shadow-2xl rounded-xl backdrop-blur-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onClose()}
          className="absolute top-2 right-2 p-0.5 hover:bg-amber-800/50 rounded transition-colors"
        >
          <X size={14} className="text-amber-400" />
        </button>

        {/* Header with tower name, level and description */}
        <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-amber-700/50">
          <div className="w-12 h-12 rounded-lg border border-amber-500/70 bg-amber-950/50 flex items-center justify-center flex-shrink-0">
            <TowerSprite type={tower.type} size={40} level={tower.level} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-300 truncate">{towerData.name}</span>
              <div className="flex">
                {[...Array(tower.level)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-[10px]">★</span>
                ))}
              </div>
            </div>
            {tower.level === 4 && tower.upgrade && (
              <div className="text-[10px] text-amber-400 font-medium">
                {towerData.upgrades[tower.upgrade].name}
              </div>
            )}
            <div className="text-[9px] text-amber-500/80 mt-0.5">
              {tower.level === 4 && tower.upgrade
                ? towerData.upgrades[tower.upgrade].desc
                : towerData.desc}
            </div>
          </div>
        </div>

        {/* Buff Banner with icons */}
        {(hasRangeBuff || hasDamageBuff) && (
          <div className="mb-2 p-1.5 bg-gradient-to-r from-cyan-950/70 to-orange-950/70 rounded-lg border border-yellow-600/40 flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-yellow-400" />
            <span className="text-[9px] text-yellow-300 font-bold">BUFFED</span>
            {hasRangeBuff && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-900/60 rounded text-cyan-300 text-[9px]">
                <Target size={10} /> +{Math.round((rangeBoost - 1) * 100)}% Range
              </span>
            )}
            {hasDamageBuff && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-900/60 rounded text-orange-300 text-[9px]">
                <Swords size={10} /> +{Math.round((damageBoost - 1) * 100)}% Damage
              </span>
            )}
          </div>
        )}

        {/* Dynamic Stats Grid - Combat towers */}
        {statsToShow.length > 0 && (
          <div className={`grid gap-1.5 mb-2`} style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
            {statsToShow.map((stat) => (
              <div
                key={stat.key}
                className={`p-1.5 rounded-lg border text-center ${stat.isBoosted ? stat.buffColorClass : stat.colorClass}`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  {stat.icon}
                </div>
                <div className="flex items-center justify-center gap-1 text-[8px] opacity-80">
                  {stat.label}
                  {stat.isBoosted && <TrendingUp size={10} className="text-yellow-400" />}
                </div>
                {stat.isBoosted && stat.buffedValue ? (
                  <>
                    <div className="font-bold text-lg leading-tight">
                      <span className="text-white/40 line-through text-sm mr-1">{stat.value}</span>
                      <span>{stat.buffedValue}</span>
                    </div>
                    <div className="text-[8px] text-yellow-400">+{stat.boostAmount}% buff</div>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-xs">{stat.value}</div>
                    {stat.nextValue && (
                      <div className="text-green-400 text-[8px]">→ {stat.nextValue}</div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Eating Club Special Display */}
        {tower.type === "club" && (
          <div className="mb-2 bg-amber-950/40 rounded-lg p-2 border border-amber-700/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CoinsIcon size={14} className="text-amber-400" />
              <span className="text-[10px] font-bold text-amber-300">Paw Points Generation</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-1.5">
              <div className="bg-amber-900/40 p-1.5 rounded border border-amber-700/40 text-center">
                <div className="text-[8px] text-amber-500">Paw Points</div>
                <div className="text-amber-300 font-bold text-sm">+{baseStats.income || 8}</div>
                {nextStats && nextStats.income && nextStats.income > (baseStats.income || 0) && (
                  <div className="text-green-400 text-[8px]">→ +{nextStats.income}</div>
                )}
              </div>
              <div className="bg-amber-900/40 p-1.5 rounded border border-amber-700/40 text-center">
                <div className="text-[8px] text-amber-500">Interval</div>
                <div className="text-amber-300 font-bold text-sm">{(baseStats.incomeInterval || 8000) / 1000}s</div>
                {nextStats && nextStats.incomeInterval && nextStats.incomeInterval < (baseStats.incomeInterval || 0) && (
                  <div className="text-green-400 text-[8px]">→ {nextStats.incomeInterval / 1000}s</div>
                )}
              </div>
            </div>
            <div className="text-[8px] text-amber-400/80 text-center mb-1.5">
              Earns <span className="font-bold text-amber-300">+{baseStats.income || 8} PP</span> every <span className="font-bold text-amber-300">{(baseStats.incomeInterval || 8000) / 1000}s</span>
            </div>

            {/* Level 4 Eating Club Aura Stats - shown inside Paw Points box */}
            {tower.level === 4 && tower.upgrade && activeUpgradeStats && (activeUpgradeStats.rangeBuff || activeUpgradeStats.damageBuff) && (
              <div className="pt-1.5 border-t border-amber-700/40">
                <div className="grid grid-cols-1 gap-2">
                  {activeUpgradeStats.rangeBuff && (
                    <div className="bg-cyan-900/40 p-1.5 rounded border border-cyan-700/40 text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Target size={12} className="text-cyan-400" />
                      </div>
                      <div className="text-[8px] text-cyan-500">Range Aura</div>
                      <div className="text-cyan-300 font-bold text-sm">+{Math.round(activeUpgradeStats.rangeBuff * 100)}%</div>
                      <div className="text-[7px] text-cyan-500/80">Nearby towers</div>
                    </div>
                  )}
                  {activeUpgradeStats.damageBuff && (
                    <div className="bg-orange-900/40 p-1.5 rounded border border-orange-700/40 text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <TrendingUp size={12} className="text-orange-400" />
                      </div>
                      <div className="text-[8px] text-orange-500">Damage Aura</div>
                      <div className="text-orange-300 font-bold text-sm">+{Math.round(activeUpgradeStats.damageBuff * 100)}%</div>
                      <div className="text-[7px] text-orange-500/80">Nearby towers</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dinky Station Troop Display with description */}
        {tower.type === "station" && (() => {
          const getTroopKey = () => {
            if (tower.level === 1) return "footsoldier";
            if (tower.level === 2) return "armored";
            if (tower.level === 3) return "elite";
            if (tower.level === 4) {
              if (tower.upgrade === "B") return "cavalry";
              if (tower.upgrade === "A") return "centaur";
              return "knight";
            }
            return "footsoldier";
          };
          const troop = TROOP_DATA[getTroopKey()];
          if (!troop) return null;

          return (
            <div className="mb-2 bg-stone-900/50 rounded-lg p-2 border border-stone-700/40">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Users size={14} className="text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300">Garrison: {troop.name}</span>
                <span className="text-[8px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400 ml-auto">
                  {troop.isMounted ? "Mounted" : troop.isRanged ? "Ranged" : "Infantry"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                <div className="bg-red-950/40 p-1 rounded border border-red-900/30 text-center">
                  <Heart size={12} className="mx-auto text-red-400 mb-0.5" />
                  <div className="text-[7px] text-red-500">Health</div>
                  <span className="text-red-200 font-bold text-xs">{troop.hp}</span>
                </div>
                <div className="bg-orange-950/40 p-1 rounded border border-orange-900/30 text-center">
                  <Swords size={12} className="mx-auto text-orange-400 mb-0.5" />
                  <div className="text-[7px] text-orange-500">Damage</div>
                  <span className="text-orange-200 font-bold text-xs">{troop.damage}</span>
                </div>
                <div className="bg-green-950/40 p-1 rounded border border-green-900/30 text-center">
                  {troop.isRanged ? <Crosshair size={12} className="mx-auto text-green-400 mb-0.5" /> : <Gauge size={12} className="mx-auto text-green-400 mb-0.5" />}
                  <div className="text-[7px] text-green-500">{troop.isRanged ? "Range" : "Speed"}</div>
                  <span className="text-green-200 font-bold text-xs">{troop.isRanged ? troop.range : `${troop.attackSpeed}ms`}</span>
                </div>
              </div>
              <div className="text-[8px] text-stone-400 text-center italic">
                {troop.desc}
              </div>
            </div>
          );
        })()}

        {/* Upgrade buttons */}
        <div className="flex gap-2 mb-2">
          {(tower.level === 1 || tower.level === 2) && (
            <button
              onClick={(e) => { e.stopPropagation(); upgradeTower(tower.id); }}
              disabled={pawPoints < upgradeCost}
              className={`flex-1 py-2 rounded-lg font-bold transition-all border ${pawPoints >= upgradeCost
                ? "bg-gradient-to-b from-green-600 to-green-800 border-green-500 hover:from-green-500 hover:to-green-700"
                : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-[11px]">
                <ArrowUp size={14} />
                <span>Upgrade to Level {tower.level + 1}</span>
              </div>
              <div className="text-[9px] flex items-center justify-center gap-1 mt-0.5 opacity-90">
                <Coins size={10} /> {upgradeCost} PP
              </div>
            </button>
          )}

          {tower.level === 3 && (() => {
            // Unique icons for each tower's upgrade paths
            const upgradeIcons: Record<string, { A: React.ReactNode; B: React.ReactNode }> = {
              cannon: { A: <Repeat size={12} />, B: <Flame size={12} /> },
              arch: { A: <Radio size={12} />, B: <Music size={12} /> },
              lab: { A: <Focus size={12} />, B: <Zap size={12} /> },
              library: { A: <Mountain size={12} />, B: <Snowflake size={12} /> },
              station: { A: <CircleDot size={12} />, B: <Shield size={12} /> },
              club: { A: <Landmark size={12} />, B: <UserPlus size={12} /> },
            };
            const icons = upgradeIcons[tower.type] || { A: <Zap size={12} />, B: <Shield size={12} /> };

            return (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); upgradeTower(tower.id, "A"); }}
                  disabled={pawPoints < upgradeCost}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all border ${pawPoints >= upgradeCost
                    ? "bg-gradient-to-b from-red-600 to-red-800 border-red-500 hover:from-red-500 hover:to-red-700"
                    : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                    }`}
                >
                  <div className="text-[11px] text-red-200 font-bold truncate px-1 flex items-center justify-center gap-1">
                    {icons.A} {towerData.upgrades.A.name}
                  </div>
                  <div className="text-[8px] flex items-center justify-center gap-0.5 mt-0.5 opacity-90">
                    <Coins size={9} /> {upgradeCost} PP
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); upgradeTower(tower.id, "B"); }}
                  disabled={pawPoints < upgradeCost}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all border ${pawPoints >= upgradeCost
                    ? "bg-gradient-to-b from-blue-600 to-blue-800 border-blue-500 hover:from-blue-500 hover:to-blue-700"
                    : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                    }`}
                >
                  <div className="text-[11px] text-blue-200 font-bold truncate px-1 flex items-center justify-center gap-1">
                    {icons.B} {towerData.upgrades.B.name}
                  </div>
                  <div className="text-[8px] flex items-center justify-center gap-0.5 mt-0.5 opacity-90">
                    <Coins size={9} /> {upgradeCost} PP
                  </div>
                </button>
              </>
            );
          })()}

          {tower.level === 4 && (
            <div className="flex-1 py-2 text-center text-amber-400 text-[11px] bg-amber-950/30 rounded-lg border border-amber-700 flex items-center justify-center gap-1.5">
              <Crown size={14} /> Maximum Level
            </div>
          )}
        </div>

        {/* Upgrade Preview for Level 3 */}
        {tower.level === 3 && upgradeAStats && upgradeBStats && (
          <div className="grid grid-cols-2 gap-1.5 text-[8px] mb-2">
            <div className="bg-red-950/40 p-1.5 rounded-lg border border-red-800/40">
              <div className="text-red-300 text-center">{towerData.upgrades.A.effect}</div>
            </div>
            <div className="bg-blue-950/40 p-1.5 rounded-lg border border-blue-800/40">
              <div className="text-blue-300 text-center">{towerData.upgrades.B.effect}</div>
            </div>
          </div>
        )}

        {/* Sell button */}
        <button
          onClick={() => sellTower(tower.id)}
          className="w-full py-1.5 bg-gradient-to-b from-stone-700 to-stone-900 hover:from-red-700 hover:to-red-900 border border-stone-600 hover:border-red-500 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px]"
        >
          <CircleDollarSign size={12} />
          <span>Sell Tower</span>
          <span className="text-amber-400 font-bold">+{sellValue} PP</span>
        </button>

        {/* Arrow pointer */}
        <div
          className="absolute left-1/2 -bottom-2 transform -translate-x-1/2"
          style={{ display: panelY > screenPos.y - 120 ? "none" : "block" }}
        >
          <div className="w-3 h-3 bg-amber-900 border-b border-r border-amber-500 transform rotate-45" />
        </div>
      </div>
    </div>
  );
};

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
      className="fixed pointer-events-none bg-gradient-to-b from-stone-900/98 to-stone-950/98 px-3 py-2 border border-amber-600/80 shadow-2xl rounded-lg max-w-[200px] backdrop-blur-md"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250 }}
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

  const tooltipWidth = 220;
  let tooltipX = position.x + 20;
  let tooltipY = position.y - 30;
  if (tooltipX + tooltipWidth > window.innerWidth - 10)
    tooltipX = position.x - tooltipWidth - 20;
  if (tooltipY < 60) tooltipY = 60;

  return (
    <div
      className="fixed pointer-events-none bg-gradient-to-b from-stone-900/98 to-stone-950/98 border border-amber-500/70 shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250, width: tooltipWidth }}
    >
      {/* Header */}
      <div className="bg-amber-900/40 px-3 py-1.5 border-b border-amber-700/50">
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
        {/* Buff indicator */}
        {(hasRangeBuff || hasDamageBuff) && (
          <div className="flex items-center gap-1 mb-1.5 text-[9px]">
            <Sparkles size={10} className="text-yellow-400" />
            {hasRangeBuff && (
              <span className="text-cyan-400">+{Math.round(((tower.rangeBoost || 1) - 1) * 100)}% Range</span>
            )}
            {hasDamageBuff && (
              <span className="text-orange-400">+{Math.round(((tower.damageBoost || 1) - 1) * 100)}% DMG</span>
            )}
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
              <span className="text-green-300 font-medium">{stats.attackSpeed}ms</span>
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
      className="fixed pointer-events-none bg-gradient-to-b from-stone-900/98 to-stone-950/98 border border-amber-500/70 shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250, width: tooltipWidth }}
    >
      {/* Header */}
      <div className="bg-amber-900/40 px-3 py-1.5 border-b border-amber-700/50 flex items-center justify-between">
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
              <span className="text-green-300 font-medium">{tData.attackSpeed}ms</span>
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
      className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-900/95 to-purple-950/95 px-4 py-2 border border-purple-500 shadow-xl rounded-lg animate-pulse backdrop-blur-sm"
      style={{ zIndex: 150 }}
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
  type: "vault" | "beacon" | "shrine" | "barracks";
  hp: number | null;
  maxHp?: number;
  position: Position;
}

export const SpecialBuildingTooltip: React.FC<SpecialBuildingTooltipProps> = ({
  type,
  hp,
  maxHp,
  position,
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
      desc: "Energy Spire. Emits a resonance field that boosts the range of all nearby towers by 20%.",
      stat: "+20% Range Buff",
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
  }[type];

  return (
    <div
      className={`fixed pointer-events-none bg-gradient-to-br ${info.color} p-4 border-2 ${info.borderColor} shadow-2xl rounded-xl w-64 backdrop-blur-md z-[300]`}
      style={{ left: position.x + 20, top: position.y - 100 }}
    >
      <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
        {info.icon}
        <h4 className="font-bold text-amber-100 uppercase tracking-tight">
          {info.name}
        </h4>
      </div>

      <p className="text-[11px] text-amber-200/80 leading-relaxed mb-3">
        {info.desc}
      </p>

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

      <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded border border-white/5">
        <Activity size={12} className="text-amber-400" />
        <span className="text-[10px] font-bold text-amber-300 uppercase">
          {info.stat}
        </span>
      </div>
    </div>
  );
};
