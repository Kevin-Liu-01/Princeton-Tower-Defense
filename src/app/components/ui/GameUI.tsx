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
import { TOWER_DATA, SPELL_DATA, HERO_DATA } from "../../constants";
import {
  TowerSprite,
  HeroSprite,
  SpellSprite,
  HERO_COLORS,
} from "../../sprites";

// Re-export sprites for backward compatibility
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
}

export const TopHUD: React.FC<TopHUDProps> = ({
  pawPoints,
  lives,
  currentWave,
  totalWaves,
  nextWaveTimer,
  gameSpeed,
  setGameSpeed,
}) => {
  return (
    <div
      className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-900 px-3 py-1.5 flex items-center justify-between border-b-2 border-amber-600 shadow-lg relative flex-shrink-0"
      style={{ zIndex: 100 }}
    >
      <div className="flex items-center gap-3">
        {/* Paw Points */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-950/60 border border-amber-600 shadow-sm rounded-lg">
          <PawPrint size={16} className="text-amber-400" />
          <span className="font-bold text-base text-amber-300">
            {pawPoints}
          </span>
          <span className="text-[10px] text-amber-500">PP</span>
        </div>
        {/* Lives */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-950/60 border border-red-800 shadow-sm rounded-lg">
          <Heart size={16} className="text-red-400" fill="#f87171" />
          <span className="font-bold text-base text-red-300">{lives}</span>
        </div>
        {/* Wave Counter */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-950/60 border border-amber-700 shadow-sm rounded-lg">
          <span className="text-[10px] text-amber-500">WAVE</span>
          <span className="font-bold text-sm text-amber-300">
            {currentWave}/{totalWaves}
          </span>
        </div>
        {/* Next Wave Timer */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-950/60 border border-blue-800 shadow-sm rounded-lg">
          <Timer size={14} className="text-blue-400" />
          <span className="font-bold text-sm text-blue-300">
            {Math.ceil(nextWaveTimer / 1000)}s
          </span>
        </div>
      </div>
      {/* Game Speed */}
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((speed) => (
          <button
            key={speed}
            onClick={() => setGameSpeed(speed)}
            className={`px-2 py-1 border transition-all shadow-sm rounded font-bold text-xs ${
              gameSpeed === speed
                ? "bg-yellow-600/80 border-yellow-400 text-yellow-100"
                : "bg-blue-950/60 hover:bg-blue-900/60 border-blue-700 text-blue-300"
            }`}
          >
            {speed}x
          </button>
        ))}
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
          CAM
        </div>
        <div className="grid grid-cols-3 gap-0.5">
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
// HERO AND SPELL BAR COMPONENT
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
  return (
    <div
      className="bg-gradient-to-r from-amber-900/95 via-yellow-900/95 to-amber-900/95 px-2 py-1.5 flex items-center justify-between border-t border-amber-600 backdrop-blur-sm"
      style={{ zIndex: 100 }}
    >
      {/* Hero Section */}
      <div className="flex-1">
        {hero && (
          <div className="flex items-center gap-2">
            {hero.dead ? (
              <div className="bg-stone-900/80 p-1.5 border border-stone-700 shadow-md rounded-lg flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center opacity-50 overflow-hidden">
                  <HeroSprite type={hero.type} size={36} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                    {HERO_DATA[hero.type].name} - FALLEN
                  </div>
                  <div className="text-[9px] text-red-400 flex items-center gap-1">
                    <Timer size={10} />
                    Respawning in {Math.ceil(hero.respawnTimer / 1000)}s
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-amber-950/80 p-1.5 border border-amber-600 shadow-md rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden"
                      style={{
                        borderColor: HERO_DATA[hero.type].color,
                        backgroundColor: HERO_DATA[hero.type].color + "30",
                      }}
                    >
                      <HeroSprite type={hero.type} size={36} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                        {HERO_DATA[hero.type].name}
                      </div>
                      <div className="text-[8px] text-amber-500">
                        {hero.selected ? "✓ SELECTED" : "Click to select"}
                      </div>
                    </div>
                  </div>
                  <div className="w-28 bg-stone-800 h-2 border border-stone-700 rounded-full overflow-hidden">
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
                  <div className="text-[8px] text-center mt-0.5 font-mono text-amber-400">
                    {Math.floor(hero.hp)}/{hero.maxHp}
                  </div>
                </div>
                <button
                  onClick={useHeroAbility}
                  disabled={!hero.abilityReady}
                  className={`px-2 py-2 transition-all text-[10px] font-bold border rounded-lg ${
                    hero.abilityReady
                      ? "bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 border-amber-500"
                      : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {hero.abilityReady ? (
                    <span className="flex flex-col items-center gap-0.5">
                      <Zap size={14} className="text-yellow-300" />
                      <span className="text-[8px]">
                        {HERO_DATA[hero.type].ability}
                      </span>
                    </span>
                  ) : (
                    <span className="flex flex-col items-center gap-0.5 text-stone-400">
                      <Timer size={14} />
                      <span className="text-[8px]">
                        {Math.ceil(hero.abilityCooldown / 1000)}s
                      </span>
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {/* Spell Section */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-amber-500 font-bold tracking-wider">
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
          return (
            <button
              key={spell.type}
              onClick={() => castSpell(spell.type)}
              disabled={!canCast}
              className={`relative px-2 py-1.5 transition-all border shadow-md rounded-lg overflow-hidden ${
                canCast
                  ? "bg-gradient-to-b from-purple-700/90 to-purple-900/90 hover:from-purple-600/90 hover:to-purple-800/90 border-purple-500"
                  : "bg-stone-900/90 border-stone-700 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex flex-col items-center min-w-[40px]">
                <SpellSprite type={spell.type} size={24} />
                <div className="font-bold uppercase text-[7px] tracking-wide text-purple-200">
                  {spell.type === "reinforcements"
                    ? "REINF"
                    : spell.type.slice(0, 5)}
                </div>
                <div className="text-[8px] text-amber-400">
                  {spell.cooldown > 0 ? (
                    <span className="text-red-400">
                      {Math.ceil(spell.cooldown / 1000)}s
                    </span>
                  ) : (
                    <span>
                      {spellData.cost > 0 ? `${spellData.cost}` : "FREE"}
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
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// BUILD MENU COMPONENT
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
  return (
    <div
      className="bg-gradient-to-b from-amber-900/95 to-amber-950/95 px-2 py-1.5 border-t-2 border-amber-600 shadow-xl overflow-x-auto backdrop-blur-sm"
      style={{ zIndex: 100 }}
    >
      <div className="flex items-center gap-2 min-w-max">
        <h3 className="text-[10px] font-bold text-amber-300 tracking-wider flex items-center gap-1 whitespace-nowrap px-1">
          <Construction size={14} /> BUILD
        </h3>
        {Object.entries(TOWER_DATA).map(([type, data]) => {
          const towerType = type as TowerType;
          const canAfford = pawPoints >= data.cost;
          const isSelected = buildingTower === towerType;
          return (
            <button
              key={type}
              onClick={() => setBuildingTower(isSelected ? null : towerType)}
              onMouseEnter={() => setHoveredBuildTower(towerType)}
              onMouseLeave={() => setHoveredBuildTower(null)}
              disabled={!canAfford}
              className={`px-2 py-1 transition-all border flex items-center gap-2 whitespace-nowrap shadow-md rounded-lg ${
                isSelected
                  ? "bg-gradient-to-b from-amber-600 to-amber-800 border-amber-400 shadow-amber-500/30 scale-105"
                  : canAfford
                  ? "bg-gradient-to-b from-amber-950/80 to-stone-950/80 hover:from-amber-900/80 hover:to-stone-900/80 border-amber-700 hover:border-amber-500"
                  : "bg-stone-900/60 border-stone-700 opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <TowerSprite type={towerType} size={32} />
              </div>
              <div className="flex flex-col items-start">
                <div className="font-bold text-[9px] text-amber-200">
                  {data.name}
                </div>
                <div className="text-[8px] text-amber-400 flex items-center gap-0.5">
                  <PawPrint size={8} /> {data.cost}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// TOWER UPGRADE PANEL COMPONENT
// =============================================================================

interface TowerUpgradePanelProps {
  tower: Tower;
  screenPos: Position;
  pawPoints: number;
  upgradeTower: (towerId: string, choice?: "A" | "B") => void;
  sellTower: (towerId: string) => void;
  onClose?: () => void;
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

  // Calculate panel position - center above tower, clamped to viewport
  const panelWidth = 280;
  const panelHeight = tower.level === 3 ? 340 : 280;

  // Center horizontally on tower, clamp to viewport
  let panelX = screenPos.x - panelWidth / 2;
  panelX = Math.max(10, Math.min(panelX, window.innerWidth - panelWidth - 10));

  // Position above tower, but ensure it's visible
  let panelY = screenPos.y - panelHeight - 60;
  panelY = Math.max(60, panelY); // Don't go above HUD

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: panelX,
        top: panelY,
        zIndex: 200,
        width: panelWidth,
      }}
    >
      <div className="bg-gradient-to-br from-amber-900/98 to-stone-900/98 p-3 border-2 border-amber-500 pointer-events-auto shadow-2xl rounded-xl backdrop-blur-sm relative">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-1 right-1 p-1 hover:bg-amber-800/50 rounded transition-colors"
          >
            <X size={14} className="text-amber-400" />
          </button>
        )}

        {/* Header with tower sprite */}
        <div className="flex items-center gap-3 mb-2 pb-2 border-b border-amber-700">
          <div className="w-12 h-12 rounded-lg border border-amber-500 bg-amber-950/50 flex items-center justify-center">
            <TowerSprite type={tower.type} size={44} level={tower.level} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-amber-300">
              {towerData.name}
            </div>
            <div className="text-[10px] text-amber-500">
              {tower.level === 3 && tower.upgrade
                ? `Path ${tower.upgrade}: ${
                    towerData.upgrades[tower.upgrade].name
                  }`
                : `Level ${tower.level}`}
            </div>
          </div>
          <div className="flex">
            {[...Array(tower.level)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm">
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px]">
          {towerData.attackSpeed > 0 && (
            <>
              <div className="bg-amber-950/60 p-1.5 rounded border border-amber-800">
                <span className="text-amber-500">DMG:</span>
                <span className="text-amber-300 ml-1 font-bold">
                  {Math.floor(
                    towerData.damage *
                      (tower.level === 1 ? 1 : tower.level === 2 ? 1.5 : 2)
                  )}
                </span>
              </div>
              <div className="bg-amber-950/60 p-1.5 rounded border border-amber-800">
                <span className="text-amber-500">RNG:</span>
                <span className="text-amber-300 ml-1 font-bold">
                  {towerData.range}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Level description */}
        <div className="bg-amber-950/40 p-1.5 rounded text-[9px] text-amber-400 mb-2 border border-amber-800/50">
          {levelDesc}
        </div>

        {/* Upgrade buttons */}
        <div className="flex gap-1.5">
          {(tower.level === 1 || tower.level === 2) && (
            <button
              onClick={() => upgradeTower(tower.id)}
              disabled={pawPoints < upgradeCost}
              className={`flex-1 py-2 rounded-lg font-bold transition-all border text-xs ${
                pawPoints >= upgradeCost
                  ? "bg-gradient-to-b from-green-600 to-green-800 border-green-500 hover:from-green-500 hover:to-green-700"
                  : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <ArrowUp size={14} />
                <span>Lv.{tower.level + 1}</span>
              </div>
              <div className="text-[9px] mt-0.5">{upgradeCost}PP</div>
            </button>
          )}

          {tower.level === 3 && (
            <>
              <button
                onClick={() => upgradeTower(tower.id, "A")}
                disabled={pawPoints < upgradeCost}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all border text-[10px] ${
                  pawPoints >= upgradeCost
                    ? "bg-gradient-to-b from-red-600 to-red-800 border-red-500 hover:from-red-500 hover:to-red-700"
                    : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="text-sm text-red-200">A</div>
                <div className="text-[8px] text-red-300">
                  {towerData.upgrades.A.name}
                </div>
                <div className="text-[9px] mt-0.5">{upgradeCost}PP</div>
              </button>
              <button
                onClick={() => upgradeTower(tower.id, "B")}
                disabled={pawPoints < upgradeCost}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all border text-[10px] ${
                  pawPoints >= upgradeCost
                    ? "bg-gradient-to-b from-blue-600 to-blue-800 border-blue-500 hover:from-blue-500 hover:to-blue-700"
                    : "bg-stone-800 border-stone-600 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="text-sm text-blue-200">B</div>
                <div className="text-[8px] text-blue-300">
                  {towerData.upgrades.B.name}
                </div>
                <div className="text-[9px] mt-0.5">{upgradeCost}PP</div>
              </button>
            </>
          )}

          {tower.level === 4 && (
            <div className="flex-1 py-1.5 text-center text-amber-400 text-[10px] bg-amber-950/30 rounded-lg border border-amber-700">
              ✓ Maximum Level
            </div>
          )}
        </div>

        {/* Upgrade descriptions for level 3 */}
        {tower.level === 3 && (
          <div className="grid grid-cols-2 gap-1 mt-1.5 text-[8px]">
            <div className="bg-red-950/40 p-1 rounded border border-red-800/50">
              <div className="text-red-300 font-bold">
                {towerData.upgrades.A.name}
              </div>
              <div className="text-red-400">{towerData.upgrades.A.effect}</div>
            </div>
            <div className="bg-blue-950/40 p-1 rounded border border-blue-800/50">
              <div className="text-blue-300 font-bold">
                {towerData.upgrades.B.name}
              </div>
              <div className="text-blue-400">{towerData.upgrades.B.effect}</div>
            </div>
          </div>
        )}

        {/* Sell button */}
        <button
          onClick={() => sellTower(tower.id)}
          className="w-full mt-2 py-1.5 bg-gradient-to-b from-stone-700 to-stone-900 hover:from-red-700 hover:to-red-900 border border-stone-600 hover:border-red-500 rounded-lg transition-all flex items-center justify-center gap-1 text-[10px]"
        >
          <CircleDollarSign size={12} />
          <span>Sell for {sellValue}PP</span>
        </button>

        {/* Arrow pointing to tower */}
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

  // Clamp to viewport
  let tooltipX = position.x + 15;
  let tooltipY = position.y - 40;

  if (tooltipX + tooltipWidth > window.innerWidth - 10) {
    tooltipX = position.x - tooltipWidth - 15;
  }
  if (tooltipY < 60) {
    tooltipY = 60;
  }
  if (tooltipY + tooltipHeight > window.innerHeight - 10) {
    tooltipY = window.innerHeight - tooltipHeight - 10;
  }

  return (
    <div
      className="fixed pointer-events-none bg-gradient-to-br from-amber-950/98 to-stone-950/98 p-2 border border-amber-600 shadow-xl rounded-lg max-w-[180px] backdrop-blur-sm text-[10px]"
      style={{
        left: tooltipX,
        top: tooltipY,
        zIndex: 250,
      }}
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
        <span className="text-purple-100">Click to Deploy</span>
        <span className="text-purple-400 text-xs">(3 Knights)</span>
      </div>
    </div>
  );
};
