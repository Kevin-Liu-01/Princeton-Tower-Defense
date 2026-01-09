"use client";
import React from "react";
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
  Sparkles,
  Shield,
  Info,
  Crown,
  Wind,
  Pause,
  Play,
  RefreshCcw,
  Crosshair,
  CoinsIcon,
  Snowflake,
} from "lucide-react";
import type {
  Tower,
  Hero,
  Spell,
  TowerType,
  SpellType,
  Position,
  Enemy,
} from "../../types";
import {
  TOWER_DATA,
  SPELL_DATA,
  HERO_DATA,
  HERO_ABILITY_COOLDOWNS,
  TROOP_DATA,
} from "../../constants";
import {
  TowerSprite,
  HeroSprite,
  SpellSprite,
  HERO_COLORS,
} from "../../sprites";
import PrincetonTDLogo from "./PrincetonTDLogo";

export { TowerSprite, HeroSprite, SpellSprite };

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
}) => {
  return (
    <div
      className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-900 px-3 py-1.5 flex items-center border-b-2 border-amber-600 shadow-lg relative flex-shrink-0"
      style={{ zIndex: 100 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <PrincetonTDLogo height="h-10" width="w-8" />
          <div className="h-8 border-l border-amber-600 ml-3" />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-600 shadow-sm rounded-lg">
          <PawPrint size={18} className="text-amber-400" />
          <span className="font-bold text-lg text-amber-300">{pawPoints}</span>
          <span className="text-[10px] text-amber-500 ml-0.5">PP</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/60 border border-red-800 shadow-sm rounded-lg">
          <Heart size={18} className="text-red-400" fill="#f87171" />
          <span className="font-bold text-lg text-red-300">{lives}</span>
          <span className="text-[10px] text-red-500 ml-0.5">Lives</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/60 border border-amber-700 shadow-sm rounded-lg">
          <Crown size={16} className="text-amber-400" />
          <span className="text-[10px] text-amber-500">WAVE</span>
          <span className="font-bold text-base text-amber-300">
            {currentWave}/{totalWaves}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-950/60 border border-blue-800 shadow-sm rounded-lg">
          <Timer size={16} className="text-blue-400" />
          <span className="text-[10px] text-blue-500">NEXT</span>
          <span className="font-bold text-base text-blue-300">
            {Math.ceil(nextWaveTimer / 1000)}s
          </span>
        </div>
      </div>
      <div
        className="flex ml-auto items-center gap-1 border 
      border-amber-700 bg-gradient-to-br from-amber-950/70 to-stone-950/70
       px-2.5 py-1.5 rounded-lg shadow-sm"
      >
        <span className="text-[10px] text-amber-500 mr-1">SPEED</span>
        {[1, 2, 3].map((speed) => (
          <button
            key={speed}
            onClick={() => setGameSpeed(speed)}
            className={`px-2.5 py-1 border transition-all shadow-sm rounded font-bold text-xs ${
              gameSpeed === speed
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
       px-1 py-1 rounded-lg shadow-sm ml-3"
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
  );
};

// =============================================================================
// CAMERA CONTROLS COMPONENT
// =============================================================================

interface CameraControlsProps {
  setCameraOffset: React.Dispatch<React.SetStateAction<Position>>;
  setCameraZoom: React.Dispatch<React.SetStateAction<number>>;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  setCameraOffset,
  setCameraZoom,
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
            onClick={() => setCameraOffset({ x: -40, y: -60 })}
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
      className="bg-gradient-to-r from-amber-900/95 via-yellow-900/95 to-amber-900/95 px-3 py-2 flex items-center justify-between border-t border-amber-600 backdrop-blur-sm"
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
          <div className="flex h-full items-center gap-3">
            {hero.dead ? (
              <div className="h-full bg-stone-900/80 px-4 p-2 border border-stone-700 shadow-md rounded-lg flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center opacity-50 overflow-hidden">
                  <HeroSprite type={hero.type} size={40} />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wide flex items-center gap-1">
                    <Shield size={12} /> {HERO_DATA[hero.type].name} - FALLEN
                  </div>
                  <div className="text-[10px] text-red-400 flex items-center gap-1 mt-0.5">
                    <Timer size={10} />
                    <span>
                      Respawning in{" "}
                      <span className="font-bold">
                        {Math.ceil(hero.respawnTimer / 1000)}s
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={
                    hero.selected
                      ? "bg-amber-950/40 p-2 border border-yellow-400 shadow-lg rounded-lg transition-all "
                      : "bg-amber-950/80 p-2 border border-amber-600 shadow-md rounded-lg transition-all "
                  }
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <div
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden"
                      style={{
                        borderColor: HERO_DATA[hero.type].color,
                        backgroundColor: HERO_DATA[hero.type].color + "30",
                      }}
                    >
                      <HeroSprite type={hero.type} size={40} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1">
                        {HERO_DATA[hero.type].name} {HERO_DATA[hero.type].icon}
                      </div>
                      <div className="text-[8px] text-left text-amber-500">
                        {hero.selected
                          ? "Click map to move hero"
                          : "Click hero to select"}
                      </div>
                      <div className="flex gap-2 mt-0.5 text-[9px]">
                        <span className="text-orange-400 ">
                          ⚔ {HERO_DATA[hero.type].damage} dmg
                        </span>
                        <span className="text-blue-400">
                          ◎ {HERO_DATA[hero.type].range} px
                        </span>
                        <span className="text-green-400">
                          ♦ {HERO_DATA[hero.type].speed} ms
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-stone-800 h-2.5 border border-stone-700 rounded-full overflow-hidden">
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
                  <div className="text-[9px] text-center mt-0.5 font-mono text-amber-400">
                    {Math.floor(hero.hp)}/{hero.maxHp} HP
                  </div>
                </div>
                <button
                  onClick={useHeroAbility}
                  disabled={!hero.abilityReady}
                  className={`px-3 py-2.5 h-full relative transition-all font-bold border rounded-lg flex flex-col items-center ${
                    hero.abilityReady
                      ? "bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 border-amber-500"
                      : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {hero.abilityReady ? (
                    <div className="h-full flex flex-col py-1 justify-center">
                      <span className="text-[7px] bg-amber-800/50 px-1 rounded-lg absolute top-1 right-1 text-amber-400">
                        {HERO_ABILITY_COOLDOWNS[hero.type] / 1000}s Cooldown
                      </span>
                      <span className="flex flex-row gap-1 items-center text-[12px] text-amber-200 font-bold">
                        <Zap size={18} className="text-yellow-300 mb-0.5" />
                        {HERO_DATA[hero.type].ability}
                      </span>
                      <div className="text-[7px] max-w-28 my-0.5">
                        {HERO_DATA[hero.type].abilityDesc}
                      </div>
                      <span className="font-extrabold mt-1 text-[10px] text-amber-300/80">
                        READY
                      </span>
                    </div>
                  ) : (
                    <>
                      <Timer size={18} className="text-stone-400 mb-0.5" />
                      <span className="text-[9px] text-stone-400">
                        {Math.ceil(hero.abilityCooldown / 1000)}s
                      </span>
                      <span className="text-[8px] text-stone-500">
                        cooldown
                      </span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </button>

      {/* Spell Section */}
      <div className="flex items-center h-full gap-2 relative bg-amber-950/70 px-3 py-2 border border-amber-700 rounded-lg shadow-md">
        <span className="text-[9px] text-amber-500 font-bold tracking-wider mr-1">
          SPELLS
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
                onMouseEnter={() => setHoveredSpell(spell.type)}
                onMouseLeave={() => setHoveredSpell(null)}
                className={`relative px-2.5 py-2 transition-all border shadow-md rounded-lg overflow-hidden ${
                  canCast
                    ? "bg-gradient-to-b from-purple-700/90 to-purple-900/90 hover:from-purple-600/90 hover:to-purple-800/90 border-purple-500"
                    : "bg-stone-900/90 border-stone-700 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex flex-col items-center min-w-[44px]">
                  <SpellSprite type={spell.type} size={28} />
                  <div className="font-bold uppercase text-[8px] tracking-wide text-purple-200 mt-0.5">
                    {spellData.name.split(" ")[0]}
                  </div>
                  <div className="text-[9px] font-bold">
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
                      clipPath: `inset(${
                        100 - (spell.cooldown / spell.maxCooldown) * 100
                      }% 0 0 0)`,
                    }}
                  />
                )}
              </button>
              {isHovered && (
                <div className="absolute bottom-full left-[100%] -translate-x-[100%] mb-2 w-64 bg-stone-900/90 rounded-lg border border-purple-700/60 p-3 shadow-xl z-50 pointer-events-none">
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
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  pawPoints,
  buildingTower,
  setBuildingTower,
  setHoveredBuildTower,
}) => {
  const [hoveredTower, setHoveredTower] = React.useState<TowerType | null>(
    null
  );

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
      className="bg-gradient-to-br from-amber-900/95 to-amber-950/95 px-3 py-2 border-t-2 border-amber-600 shadow-xl overflow-x-auto backdrop-blur-sm"
      style={{ zIndex: 100 }}
    >
      <div className="flex items-center gap-2 min-w-max">
        <h3 className="text-[10px] font-bold text-amber-300 tracking-wider flex items-center gap-1 whitespace-nowrap px-1">
          <Construction size={14} /> BUILD TOWERS
        </h3>
        {Object.entries(TOWER_DATA).map(([type, data]) => {
          const towerType = type as TowerType;
          const canAfford = pawPoints >= data.cost;
          const isSelected = buildingTower === towerType;
          const isHovered = hoveredTower === towerType;
          return (
            <div key={type} className="relative">
              <button
                onClick={() => setBuildingTower(isSelected ? null : towerType)}
                onMouseEnter={() => {
                  setHoveredBuildTower(towerType);
                  setHoveredTower(towerType);
                }}
                onMouseLeave={() => {
                  setHoveredBuildTower(null);
                  setHoveredTower(null);
                }}
                disabled={!canAfford}
                className={`px-2.5 py-1.5 transition-all border flex items-center gap-2.5 whitespace-nowrap shadow-md rounded-lg ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-600 to-amber-800 border-amber-400 shadow-amber-500/30 scale-105"
                    : canAfford
                    ? "bg-gradient-to-b from-amber-950/80 to-stone-950/80 hover:from-amber-900/80 hover:to-stone-900/80 border-amber-700 hover:border-amber-500"
                    : "bg-stone-900/60 border-stone-700 opacity-40 cursor-not-allowed"
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <TowerSprite type={towerType} size={36} />
                </div>
                <div className="flex flex-col items-start">
                  <div className="font-bold text-[10px] text-amber-200">
                    {data.name}
                  </div>
                  <div className="text-[9px] text-amber-400 flex items-center gap-1">
                    <PawPrint size={10} /> {data.cost} PP
                  </div>
                  <div className="flex gap-1.5 text-[8px] mt-0.5">
                    {data.damage > 0 && (
                      <span className="text-red-400">⚔{data.damage}</span>
                    )}
                    <span className="text-blue-400">◎{data.range}</span>
                  </div>
                </div>
              </button>

              {/* Enhanced Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-stone-900/98 rounded-lg border border-amber-700/60 p-3 shadow-xl z-50 pointer-events-none">
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

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2 text-[10px]">
                    <div className="bg-amber-950/60 rounded px-2 py-1 text-center border border-amber-800/40">
                      <div className="text-amber-500">Cost</div>
                      <div className="text-amber-300 font-bold">
                        {data.cost}
                      </div>
                    </div>
                    {data.damage > 0 && (
                      <div className="bg-red-950/60 rounded px-2 py-1 text-center border border-red-800/40">
                        <div className="text-red-500">DMG</div>
                        <div className="text-red-300 font-bold">
                          {data.damage}
                        </div>
                      </div>
                    )}
                    <div className="bg-blue-950/60 rounded px-2 py-1 text-center border border-blue-800/40">
                      <div className="text-blue-500">Range</div>
                      <div className="text-blue-300 font-bold">
                        {data.range}
                      </div>
                    </div>
                    {data.attackSpeed > 0 && (
                      <div className="bg-green-950/60 rounded px-2 py-1 text-center border border-green-800/40">
                        <div className="text-green-500">Speed</div>
                        <div className="text-green-300 font-bold">
                          {data.attackSpeed}ms
                        </div>
                      </div>
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
  const upgradeCost = tower.level === 1 ? 200 : 300;
  const sellValue = Math.floor(towerData.cost * 0.7);
  const levelDesc = towerData.levelDesc[tower.level] || "";

  // Calculate current stats
  const getCurrentStats = () => {
    let damage = towerData.damage;
    let range = towerData.range;
    if (tower.level >= 2) {
      damage = Math.floor(damage * 1.5);
      range += 15;
    }
    if (tower.level >= 3) {
      damage = Math.floor(damage * 1.47);
      range += 15;
    }
    if (tower.level >= 4) {
      damage = Math.floor(damage * 1.36);
      range += 20;
    }
    return { damage, range, attackSpeed: towerData.attackSpeed };
  };

  const getNextLevelStats = () => {
    let damage = towerData.damage;
    let range = towerData.range;
    const nextLevel = tower.level + 1;
    if (nextLevel >= 2) {
      damage = Math.floor(damage * 1.5);
      range += 15;
    }
    if (nextLevel >= 3) {
      damage = Math.floor(damage * 1.47);
      range += 15;
    }
    if (nextLevel >= 4) {
      damage = Math.floor(damage * 1.36);
      range += 20;
    }
    return { damage, range };
  };

  const currentStats = getCurrentStats();
  const nextStats = tower.level < 4 ? getNextLevelStats() : null;

  const panelWidth = 300;
  const panelHeight = tower.level === 3 ? 400 : 320;
  let panelX = screenPos.x - panelWidth / 2;
  panelX = Math.max(10, Math.min(panelX, window.innerWidth - panelWidth - 10));
  let panelY = screenPos.y - panelHeight - 60;
  panelY = Math.max(60, panelY);

  return (
    <div
      className="fixed pointer-events-none"
      style={{ left: panelX, top: panelY, zIndex: 200, width: panelWidth }}
    >
      <div className="bg-gradient-to-br from-amber-900/98 to-stone-900/98 p-3 border-2 border-amber-500 pointer-events-auto shadow-2xl rounded-xl backdrop-blur-sm relative">
        <button
          onClick={() => onClose()}
          className="absolute top-2 right-2 p-1 hover:bg-amber-800/50 rounded-lg transition-colors"
        >
          <X size={14} className="text-amber-400" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3 pb-2 border-b border-amber-700">
          <div className="w-14 h-14 rounded-lg border border-amber-500 bg-amber-950/50 flex items-center justify-center">
            <TowerSprite type={tower.type} size={48} level={tower.level} />
          </div>
          <div className="flex-1">
            <div className="text-base font-bold text-amber-300">
              {towerData.name}
            </div>
            <div className="text-[10px] text-amber-500">
              {tower.level === 4 && tower.upgrade
                ? `Path ${tower.upgrade}: ${
                    towerData.upgrades[tower.upgrade].name
                  }`
                : `Level ${tower.level}`}
            </div>
            <div className="flex mt-0.5">
              {[...Array(tower.level)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]">
          {towerData.damage > 0 && (
            <div className="bg-red-950/60 p-2 rounded border border-red-800/50 text-center">
              <Swords size={14} className="mx-auto text-red-400 mb-0.5" />
              <div className="text-red-500">Damage</div>
              <div className="text-red-300 font-bold text-sm">
                {currentStats.damage}
              </div>
              {nextStats && (
                <div className="text-green-400 text-[9px]">
                  → {nextStats.damage}
                </div>
              )}
            </div>
          )}
          {towerData.name === "Firestone Library" && (
            <>
              {tower.level >= 3 && (
                <div className="bg-red-950/60 p-2 rounded border border-red-800/50 text-center">
                  <Swords size={14} className="mx-auto text-red-400 mb-0.5" />
                  <div className="text-red-500">Damage</div>

                  <div className="text-red-300 text-sm font-bold">
                    {tower.level === 3
                      ? "8"
                      : tower.level === 4 && tower.upgrade === "A"
                      ? "35"
                      : "0"}
                  </div>
                </div>
              )}
              <div className="col-span-1 bg-purple-950/60 p-2 rounded border border-purple-800/50 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <Snowflake size={14} className="text-purple-400" />
                  <span className="text-purple-500 ">Slow Effect</span>
                </div>
                <div className="text-purple-300 text-sm font-bold">
                  {tower.level === 1
                    ? "30%"
                    : tower.level === 2
                    ? "45%"
                    : tower.level === 3
                    ? "60%"
                    : tower.level === 4 && tower.upgrade === "A"
                    ? "80%"
                    : tower.level === 4 && tower.upgrade === "B"
                    ? "70%"
                    : "0%"}
                </div>
                <div className="text-[9px] text-purple-400 mt-1">
                  Reduces enemy speed within range.
                </div>
              </div>
            </>
          )}
          {towerData.range > 0 && (
            <div className="bg-blue-950/60 p-2 rounded border border-blue-800/50 text-center">
              <Target size={14} className="mx-auto text-blue-400 mb-0.5" />
              <div className="text-blue-500">Range</div>
              <div className="text-blue-300 font-bold text-sm">
                {currentStats.range}
              </div>
              {nextStats && (
                <div className="text-green-400 text-[9px]">
                  → {nextStats.range}
                </div>
              )}
            </div>
          )}
          {towerData.attackSpeed > 0 && (
            <div className="bg-green-950/60 p-2 rounded border border-green-800/50 text-center">
              <Gauge size={14} className="mx-auto text-green-400 mb-0.5" />
              <div className="text-green-500">Speed</div>
              <div className="text-green-300 font-bold text-sm">
                {currentStats.attackSpeed}ms
              </div>
            </div>
          )}

          {towerData.name === "Dinky Station" &&
            (() => {
              // 1. Determine which key to use from TROOP_DATA based on level/upgrade
              const getTroopKey = () => {
                if (tower.level === 1) return "footsoldier";
                if (tower.level === 2) return "armored";
                if (tower.level === 3) return "elite";
                if (tower.level === 4) {
                  if (tower.upgrade === "B") return "cavalry";
                  if (tower.upgrade === "A") return "centaur";
                  return "knight"; // Fallback for base level 4
                }
                return "footsoldier";
              };

              const key = getTroopKey();
              const troop = TROOP_DATA[key];

              if (!troop) return null;

              return (
                <div className="col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={12} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                      Garrison Unit
                    </span>
                  </div>

                  <div className="bg-stone-900/60 rounded-lg p-2 border border-stone-700/50 flex flex-col gap-2">
                    {/* Name and Type Badge */}
                    <div className="flex justify-between items-center border-b border-stone-800 pb-1">
                      <span
                        className="text-xs font-bold"
                        style={{ color: troop.color }} // Uses the hex code from TROOP_DATA
                      >
                        {troop.name}
                      </span>
                      <span className="text-[9px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">
                        {troop.isMounted
                          ? "Mounted"
                          : troop.isRanged
                          ? "Ranged"
                          : "Infantry"}
                      </span>
                    </div>

                    {/* Troop Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* HP */}
                      <div className="bg-red-950/30 p-1 rounded border border-red-900/20 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 text-red-400/80 mb-0.5">
                          <Heart size={10} />
                          <span className="text-[9px]">HP</span>
                        </div>
                        <span className="text-red-200 font-bold text-xs">
                          {troop.hp}
                        </span>
                      </div>

                      {/* Damage */}
                      <div className="bg-orange-950/30 p-1 rounded border border-orange-900/20 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 text-orange-400/80 mb-0.5">
                          <Swords size={10} />
                          <span className="text-[9px]">DMG</span>
                        </div>
                        <span className="text-orange-200 font-bold text-xs">
                          {troop.damage}
                        </span>
                      </div>

                      {/* Speed/Range */}
                      <div className="bg-green-950/30 p-1 rounded border border-green-900/20 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 text-green-400/80 mb-0.5">
                          {troop.isRanged ? (
                            <Crosshair size={10} />
                          ) : (
                            <Gauge size={10} />
                          )}
                          <span className="text-[9px]">
                            {troop.isRanged ? "RNG" : "SPD"}
                          </span>
                        </div>
                        <span className="text-green-200 font-bold text-xs">
                          {troop.isRanged
                            ? troop.range
                            : `${troop.attackSpeed}ms`}
                        </span>
                      </div>
                    </div>

                    {/* Description (Optional, fits nice at bottom) */}
                    <div className="text-[9px] text-stone-500 italic text-center">
                      {troop.desc}
                    </div>
                  </div>
                </div>
              );
            })()}

          {towerData.name === "Eating Club" && (
            <div className="col-span-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                  <CoinsIcon size={12} /> PP Generation
                </span>
              </div>
              <div className="bg-stone-900/60 rounded-lg p-2 border border-stone-700/50 flex flex-col gap-2">
                <div className="text-[9px] text-amber-400">
                  Generates a certain amount of{" "}
                  <span className="font-bold"> PP</span> per cycle to help fund
                  your defenses. Build early to maximize your economy!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Level description */}
        <div className="bg-amber-950/40 p-2 rounded text-[10px] text-amber-400 mb-3 border border-amber-800/50">
          <div className="text-amber-500 uppercase text-[9px] tracking-wider mb-0.5">
            {tower.level < 4
              ? TOWER_DATA[tower.type].desc
              : tower.upgrade
              ? towerData.upgrades[tower.upgrade].desc
              : ""}
          </div>
          {tower.level < 4
            ? levelDesc
            : tower.upgrade
            ? towerData.upgrades[tower.upgrade].effect
            : ""}
        </div>

        {/* Upgrade buttons */}
        <div className="flex gap-2">
          {(tower.level === 1 || tower.level === 2) && (
            <button
              onClick={() => upgradeTower(tower.id)}
              disabled={pawPoints < upgradeCost}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all border text-xs ${
                pawPoints >= upgradeCost
                  ? "bg-gradient-to-b from-green-600 to-green-800 border-green-500 hover:from-green-500 hover:to-green-700"
                  : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <ArrowUp size={16} />
                <span>Upgrade to Lv.{tower.level + 1}</span>
              </div>
              <div className="text-[10px] mt-0.5 flex items-center justify-center gap-1">
                <Coins size={10} />
                {upgradeCost} PP
              </div>
            </button>
          )}

          {tower.level === 3 && (
            <>
              <button
                onClick={() => upgradeTower(tower.id, "A")}
                disabled={pawPoints < upgradeCost}
                className={`flex-1 py-2 rounded-lg font-bold transition-all border text-[10px] ${
                  pawPoints >= upgradeCost
                    ? "bg-gradient-to-b from-red-600 to-red-800 border-red-500 hover:from-red-500 hover:to-red-700"
                    : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="text-sm text-red-200 font-bold">Path A</div>
                <div className="text-[9px] text-red-300">
                  {towerData.upgrades.A.name}
                </div>
                <div className="text-[10px] mt-0.5">{upgradeCost} PP</div>
              </button>
              <button
                onClick={() => upgradeTower(tower.id, "B")}
                disabled={pawPoints < upgradeCost}
                className={`flex-1 py-2 rounded-lg font-bold transition-all border text-[10px] ${
                  pawPoints >= upgradeCost
                    ? "bg-gradient-to-b from-blue-600 to-blue-800 border-blue-500 hover:from-blue-500 hover:to-blue-700"
                    : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="text-sm text-blue-200 font-bold">Path B</div>
                <div className="text-[9px] text-blue-300">
                  {towerData.upgrades.B.name}
                </div>
                <div className="text-[10px] mt-0.5">{upgradeCost} PP</div>
              </button>
            </>
          )}

          {tower.level === 4 && (
            <div className="flex-1 py-2 text-center text-amber-400 text-xs bg-amber-950/30 rounded-lg border border-amber-700 flex items-center justify-center gap-1">
              <Crown size={14} /> Maximum Level Reached
            </div>
          )}
        </div>

        {/* Upgrade descriptions for level 3 */}
        {tower.level === 3 && (
          <div className="grid grid-cols-2 gap-2 mt-2 text-[9px]">
            <div className="bg-red-950/40 p-2 rounded border border-red-800/50">
              <div className="text-red-300 font-bold mb-0.5">
                {towerData.upgrades.A.name}
              </div>
              <div className="text-red-400/80">
                {towerData.upgrades.A.effect}
              </div>
            </div>
            <div className="bg-blue-950/40 p-2 rounded border border-blue-800/50">
              <div className="text-blue-300 font-bold mb-0.5">
                {towerData.upgrades.B.name}
              </div>
              <div className="text-blue-400/80">
                {towerData.upgrades.B.effect}
              </div>
            </div>
          </div>
        )}

        {/* Sell button */}
        <button
          onClick={() => sellTower(tower.id)}
          className="w-full mt-2 py-2 bg-gradient-to-b from-stone-700 to-stone-900 hover:from-red-700 hover:to-red-900 border border-stone-600 hover:border-red-500 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[10px]"
        >
          <CircleDollarSign size={14} />
          <span>Sell Tower</span>
          <span className="text-amber-400 font-bold">+{sellValue} PP</span>
        </button>

        {/* Arrow */}
        <div
          className="absolute left-1/2 -bottom-2 transform -translate-x-1/2"
          style={{
            display: panelY > screenPos.y - panelHeight - 40 ? "none" : "block",
          }}
        >
          <div className="w-4 h-4 bg-amber-900 border-b border-r border-amber-500 transform rotate-45" />
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
  const tooltipWidth = 180;
  const tooltipHeight = 80;
  let tooltipX = position.x + 15;
  let tooltipY = position.y - 40;
  if (tooltipX + tooltipWidth > window.innerWidth - 10)
    tooltipX = position.x - tooltipWidth - 15;
  if (tooltipY < 60) tooltipY = 60;
  if (tooltipY + tooltipHeight > window.innerHeight - 10)
    tooltipY = window.innerHeight - tooltipHeight - 10;

  return (
    <div
      className="fixed pointer-events-none bg-gradient-to-br from-amber-950/98 to-stone-950/98 p-2 border border-amber-600 shadow-xl rounded-lg max-w-[180px] backdrop-blur-sm text-[10px]"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250 }}
    >
      {content}
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
