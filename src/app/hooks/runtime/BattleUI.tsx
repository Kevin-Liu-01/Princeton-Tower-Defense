import React from "react";
import type {
  Position,
  Tower,
  Enemy,
  Hero,
  Troop,
  Spell,
  TowerType,
  SpellType,
  HeroType,
  DraggingTower,
  SpecialTower,
  Decoration,
  SpellUpgradeLevels,
} from "../../types";
import {
  INITIAL_LIVES,
  LEVEL_DATA,
} from "../../constants";
import {
  gridToWorld,
  worldToScreen,
} from "../../utils";
import {
  getEnemyPosWithPath,
  vaultPosKey,
} from "../../game/setup";

import { TopHUD, CameraControls, HeroSpellBar, CameraModeOverlay } from "../../components/ui/hud";
import { DevMenu } from "../../components/ui/DevMenu";
import { BuildMenu, TowerUpgradePanel } from "../../components/ui/upgrades";
import { HeroHoverTooltip } from "../../components/ui/tooltips/HeroHoverTooltip";
import { InlineEncounterPanel } from "../../components/ui/tooltips/EncounterTooltip";
import {
  TowerHoverTooltip,
  PlacingTroopIndicator,
  TargetingSpellIndicator,
  MissileTargetingIndicator,
  SentinelTargetingIndicator,
  SpecialBuildingTooltip,
  LandmarkTooltip,
  HazardTooltip,
  DecorationInspectorTooltip,
} from "../../components/ui/Tooltips";
import {
  EnemyInspector,
  EnemyDetailTooltip,
  TroopDetailTooltip,
  HeroDetailTooltip,
} from "../../components/ui/EnemyInspector";
import { VictoryScreen } from "../../components/menus/VictoryScreen";
import { DefeatScreen } from "../../components/menus/DefeatScreen";
import { TutorialOverlay } from "../../components/ui/TutorialOverlay";
import type { EncounterQueueItem } from "../useTutorial";
import type { GameEventLogAPI } from "../useGameEventLog";

export interface BattleUIProps {
  // Canvas refs
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  bgCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  backdropCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isTouchDeviceRef: React.RefObject<boolean>;

  // Canvas dimensions
  width: number;
  height: number;
  dpr: number;

  // Canvas event handlers
  handlePointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  handleCanvasClick: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  handleCanvasPointerLeave: () => void;

  // Visual / theme
  fadeOverlayBackground: string;
  isPanning: boolean;
  repositioningTower: string | null;
  hoveredWaveBubblePathKey: string | null;

  // Game state
  selectedMap: string;
  battleOutcome: "victory" | "defeat" | null;
  pauseLocked: boolean;
  cameraModeActive: boolean;

  // Resources & wave
  pawPoints: number;
  lives: number;
  currentWave: number;
  totalWaves: number;
  gameSpeed: number;
  setGameSpeed: (speed: number) => void;

  // HUD spell indicators
  goldSpellActive: boolean;
  paydayEndTime: number | null;
  paydayPawPointsEarned: number;
  hexWardEndTime: number | null;
  hexWardTargetCount: number;
  hexWardRaiseCap: number;
  hexWardRaisesRemaining: number;
  hexWardDamageAmpPct: number;
  hexWardBlocksHealing: boolean;

  // Income events
  eatingClubIncomeEvents: Array<{ id: string; amount: number }>;
  onEatingClubEventComplete: (id: string) => void;
  bountyIncomeEvents: Array<{ id: string; amount: number; isGoldBoosted: boolean }>;
  onBountyEventComplete: (id: string) => void;
  leakedBountyEvents: Array<{ id: string; amount: number }>;
  onLeakedBountyEventComplete: (id: string) => void;

  // Inspector state
  inspectorActive: boolean;
  setInspectorActive: (v: boolean) => void;
  selectedInspectEnemy: Enemy | null;
  setSelectedInspectEnemy: (e: Enemy | null) => void;
  selectedInspectTroop: Troop | null;
  setSelectedInspectTroop: (t: Troop | null) => void;
  selectedInspectHero: boolean;
  setSelectedInspectHero: (v: boolean) => void;
  hoveredInspectDecoration: Decoration | null;

  // HUD callbacks
  quitLevel: () => void;
  retryLevel: () => void;
  onTogglePhotoMode: () => void;
  onToggleDevMenu: () => void;
  devMenuOpen: boolean;

  // Camera
  setCameraOffset: React.Dispatch<React.SetStateAction<Position>>;
  setCameraZoom: React.Dispatch<React.SetStateAction<number>>;
  cameraOffset: Position;
  cameraZoom: number;
  selectedLevelData: (typeof LEVEL_DATA)[string] | undefined;
  handleCameraModeCapture: () => Promise<boolean>;
  exitCameraMode: () => void;

  // Entities
  towers: Tower[];
  setTowers: React.Dispatch<React.SetStateAction<Tower[]>>;
  enemies: Enemy[];
  troops: Troop[];
  setTroops: React.Dispatch<React.SetStateAction<Troop[]>>;
  hero: Hero | null;
  spells: Spell[];
  spellUpgradeLevels: SpellUpgradeLevels;

  // Tower selection / hover
  selectedTower: string | null;
  setSelectedTower: React.Dispatch<React.SetStateAction<string | null>>;
  hoveredTower: string | null;
  setHoveredTower: React.Dispatch<React.SetStateAction<string | null>>;
  hoveredHero: boolean;
  mousePos: Position;

  // Tower upgrade callbacks
  upgradeTower: (towerId: string, path: "A" | "B") => void;
  sellTower: (towerId: string) => void;
  setMissileMortarTargetingId: React.Dispatch<React.SetStateAction<string | null>>;

  // Placement indicators
  placingTroop: boolean;
  targetingSpell: SpellType | null;
  activeSentinelTargetKey: string | null;
  missileMortarTargetingId: string | null;

  // Special towers
  hoveredSpecialTower: SpecialTower | null;
  specialTowerHp: Record<string, number>;
  sentinelTargets: Record<string, Position>;
  getSpecialTowerKey: (tower: Pick<SpecialTower, "type" | "pos">) => string;

  // Environment hover
  hoveredLandmark: string | null;
  hoveredHazardType: string | null;

  // Previous game speed for inspector
  previousGameSpeed: number;
  setPreviousGameSpeed: React.Dispatch<React.SetStateAction<number>>;

  // Encounter system
  showTutorial: boolean;
  encounterQueue: EncounterQueueItem[];
  encounterIndex: number;
  encounterExiting: boolean;
  encounterAutoDismissMs: number;
  handleEncounterAcknowledge: () => void;

  // Dev menu
  devConfigMenu: React.ReactNode;
  gameEventLog: Pick<GameEventLogAPI, "events" | "stats" | "clear">;
  setDevMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Spell bar
  spellAutoAim: Partial<Record<SpellType, boolean>>;
  toggleSpellAutoAim: (spellType: SpellType) => void;
  toggleHeroSelection: () => void;
  triggerHeroAbility: () => void;
  castSpell: (spellType: SpellType) => void;

  // Build menu
  buildingTower: TowerType | null;
  setBuildingTower: React.Dispatch<React.SetStateAction<TowerType | null>>;
  setIsBuildDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setHoveredBuildTower: React.Dispatch<React.SetStateAction<TowerType | null>>;
  setDraggingTower: React.Dispatch<React.SetStateAction<DraggingTower | null>>;
  handleBuildTouchDragMove: (clientX: number, clientY: number, towerType: TowerType) => void;
  handleBuildTouchDragEnd: (clientX: number, clientY: number) => void;
  levelAllowedTowers: TowerType[] | null;

  // Timer
  levelStartTime: number;
  totalPausedTimeRef: React.RefObject<number>;

  // Victory / defeat
  starsEarned: number;
  timeSpent: number;
  currentLevelStats: { bestTime?: number; bestHearts?: number; timesPlayed?: number };
  resetGame: () => void;

  // Tutorial
  handleTutorialComplete: () => void;
  handleTutorialSkip: () => void;
  selectedHero: HeroType | null;
  selectedSpells: SpellType[];
  handleTutorialHeroChange: (heroType: HeroType) => void;
  handleTutorialSpellToggle: (spellType: SpellType) => void;
}

export const BattleUI: React.FC<BattleUIProps> = ({
  canvasRef,
  bgCanvasRef,
  backdropCanvasRef,
  containerRef,
  isTouchDeviceRef,
  width,
  height,
  dpr,
  handlePointerDown,
  handleCanvasClick,
  handleMouseMove,
  handleCanvasPointerLeave,
  fadeOverlayBackground,
  isPanning,
  repositioningTower,
  hoveredWaveBubblePathKey,
  selectedMap,
  battleOutcome,
  pauseLocked,
  cameraModeActive,
  pawPoints,
  lives,
  currentWave,
  totalWaves,
  gameSpeed,
  setGameSpeed,
  goldSpellActive,
  paydayEndTime,
  paydayPawPointsEarned,
  hexWardEndTime,
  hexWardTargetCount,
  hexWardRaiseCap,
  hexWardRaisesRemaining,
  hexWardDamageAmpPct,
  hexWardBlocksHealing,
  eatingClubIncomeEvents,
  onEatingClubEventComplete,
  bountyIncomeEvents,
  onBountyEventComplete,
  leakedBountyEvents,
  onLeakedBountyEventComplete,
  inspectorActive,
  setInspectorActive,
  selectedInspectEnemy,
  setSelectedInspectEnemy,
  selectedInspectTroop,
  setSelectedInspectTroop,
  selectedInspectHero,
  setSelectedInspectHero,
  hoveredInspectDecoration,
  quitLevel,
  retryLevel,
  onTogglePhotoMode,
  onToggleDevMenu,
  devMenuOpen,
  setCameraOffset,
  setCameraZoom,
  cameraOffset,
  cameraZoom,
  selectedLevelData,
  handleCameraModeCapture,
  exitCameraMode,
  towers,
  setTowers,
  enemies,
  troops,
  setTroops,
  hero,
  spells,
  spellUpgradeLevels,
  selectedTower,
  setSelectedTower,
  hoveredTower,
  setHoveredTower,
  hoveredHero,
  mousePos,
  upgradeTower,
  sellTower,
  setMissileMortarTargetingId,
  placingTroop,
  targetingSpell,
  activeSentinelTargetKey,
  missileMortarTargetingId,
  hoveredSpecialTower,
  specialTowerHp,
  sentinelTargets,
  getSpecialTowerKey,
  hoveredLandmark,
  hoveredHazardType,
  previousGameSpeed,
  setPreviousGameSpeed,
  showTutorial,
  encounterQueue,
  encounterIndex,
  encounterExiting,
  encounterAutoDismissMs,
  handleEncounterAcknowledge,
  devConfigMenu,
  gameEventLog,
  setDevMenuOpen,
  spellAutoAim,
  toggleSpellAutoAim,
  toggleHeroSelection,
  triggerHeroAbility,
  castSpell,
  buildingTower,
  setBuildingTower,
  setIsBuildDragging,
  setHoveredBuildTower,
  setDraggingTower,
  handleBuildTouchDragMove,
  handleBuildTouchDragEnd,
  levelAllowedTowers,
  levelStartTime,
  totalPausedTimeRef,
  starsEarned,
  timeSpent,
  currentLevelStats,
  resetGame,
  handleTutorialComplete,
  handleTutorialSkip,
  selectedHero,
  selectedSpells,
  handleTutorialHeroChange,
  handleTutorialSpellToggle,
}) => {
  const isVictory = battleOutcome === "victory";
  const isDefeat = battleOutcome === "defeat";
  const isAnySpellActive = goldSpellActive || (hexWardEndTime !== null && hexWardEndTime > Date.now());

  return (
    <div className="w-full h-[100dvh] flex flex-col text-amber-100 overflow-hidden relative" style={{ paddingBottom: "env(safe-area-inset-bottom)", background: fadeOverlayBackground }}>
      {!cameraModeActive && devConfigMenu}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-hidden"
          style={{ background: fadeOverlayBackground }}
        >
          <canvas
            ref={backdropCanvasRef}
            className="absolute pointer-events-none game-start-fade"
            style={{ top: 0, left: 0, willChange: "transform" }}
          />
          <canvas
            ref={bgCanvasRef}
            className="absolute pointer-events-none game-start-fade"
            style={{ top: 0, left: 0, willChange: "transform" }}
          />
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handleCanvasClick}
            onPointerMove={handleMouseMove}
            onPointerLeave={handleCanvasPointerLeave}
            className={`absolute inset-0 w-full h-full touch-none game-start-fade ${isPanning ? 'cursor-grabbing' :
              repositioningTower ? 'cursor-move' :
                hoveredWaveBubblePathKey ? 'cursor-pointer' : 'cursor-crosshair'
              }`}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[80] battle-ui-fade">
            <TopHUD
              pawPoints={pawPoints}
              lives={lives}
              maxLives={INITIAL_LIVES}
              currentWave={currentWave}
              totalWaves={totalWaves}
              isSandbox={LEVEL_DATA[selectedMap]?.levelKind === "sandbox"}
              gameSpeed={gameSpeed}
              setGameSpeed={(nextSpeed) => {
                if (battleOutcome || pauseLocked) return;
                setGameSpeed(nextSpeed);
              }}
              goldSpellActive={goldSpellActive}
              paydayEndTime={paydayEndTime}
              paydayPawPointsEarned={paydayPawPointsEarned}
              hexWardEndTime={hexWardEndTime}
              hexWardTargetCount={hexWardTargetCount}
              hexWardRaiseCap={hexWardRaiseCap}
              hexWardRaisesRemaining={hexWardRaisesRemaining}
              hexWardDamageAmpPct={hexWardDamageAmpPct}
              hexWardBlocksHealing={hexWardBlocksHealing}
              eatingClubIncomeEvents={eatingClubIncomeEvents}
              onEatingClubEventComplete={onEatingClubEventComplete}
              bountyIncomeEvents={bountyIncomeEvents}
              onBountyEventComplete={onBountyEventComplete}
              leakedBountyEvents={leakedBountyEvents}
              onLeakedBountyEventComplete={onLeakedBountyEventComplete}
              inspectorActive={inspectorActive}
              setInspectorActive={setInspectorActive}
              setSelectedInspectEnemy={setSelectedInspectEnemy}
              quitLevel={quitLevel}
              retryLevel={retryLevel}
              cameraModeActive={cameraModeActive}
              onTogglePhotoMode={onTogglePhotoMode}
              pauseLocked={pauseLocked}
              onToggleDevMenu={onToggleDevMenu}
              devMenuOpen={devMenuOpen}
              levelStartTime={levelStartTime}
              totalPausedTimeRef={totalPausedTimeRef}
            />
            {!cameraModeActive && (
              <div className="mt-2 flex px-2 items-start justify-between gap-2 sm:gap-3">
                <EnemyInspector
                  isActive={inspectorActive}
                  setIsActive={setInspectorActive}
                  selectedEnemy={selectedInspectEnemy}
                  setSelectedEnemy={setSelectedInspectEnemy}
                  enemies={enemies}
                  troops={troops}
                  setGameSpeed={(nextSpeed) => {
                    if (battleOutcome) return;
                    setGameSpeed(nextSpeed);
                  }}
                  previousGameSpeed={previousGameSpeed}
                  setPreviousGameSpeed={setPreviousGameSpeed}
                  gameSpeed={gameSpeed}
                  onDeactivate={() => {
                    setSelectedInspectTroop(null);
                    setSelectedInspectHero(false);
                  }}
                />
                <CameraControls
                  setCameraOffset={setCameraOffset}
                  setCameraZoom={setCameraZoom}
                  defaultOffset={selectedLevelData?.camera?.offset}
                />
              </div>
            )}
          </div>
          {cameraModeActive && (
            <CameraModeOverlay
              onCapture={handleCameraModeCapture}
              onExit={exitCameraMode}
            />
          )}
          {!cameraModeActive && (
            <>
              {!isTouchDeviceRef.current && hoveredTower && !selectedTower &&
                (() => {
                  const tower = towers.find((t) => t.id === hoveredTower);
                  if (!tower) return null;
                  return <TowerHoverTooltip tower={tower} position={mousePos} />;
                })()}
              {!isTouchDeviceRef.current && hoveredHero && !hoveredTower && hero && !hero.dead && (
                <HeroHoverTooltip hero={hero} position={mousePos} />
              )}
              {selectedTower &&
                (() => {
                  const tower = towers.find((t) => t.id === selectedTower);
                  if (!tower) return null;
                  const worldPos = gridToWorld(tower.pos);
                  const screenPos = worldToScreen(
                    worldPos,
                    width,
                    height,
                    dpr,
                    cameraOffset,
                    cameraZoom
                  );
                  return (
                    <TowerUpgradePanel
                      tower={tower}
                      screenPos={screenPos}
                      pawPoints={pawPoints}
                      cameraZoom={cameraZoom}
                      upgradeTower={upgradeTower}
                      sellTower={sellTower}
                      onClose={() => setSelectedTower(null)}
                      onRetargetMissile={(towerId) => {
                        setMissileMortarTargetingId(towerId);
                        setSelectedTower(null);
                      }}
                      onToggleMissileAutoAim={(towerId) => {
                        const tow = towers.find((t) => t.id === towerId);
                        const switchingToManual = tow?.mortarAutoAim !== false;
                        setTowers((prev) =>
                          prev.map((t) =>
                            t.id === towerId
                              ? { ...t, mortarAutoAim: t.mortarAutoAim === false ? true : false }
                              : t
                          )
                        );
                        if (switchingToManual) {
                          setMissileMortarTargetingId(towerId);
                          setSelectedTower(null);
                        }
                      }}
                      onRallyTroops={(towerId) => {
                        setTroops((prev) =>
                          prev.map((t) => ({
                            ...t,
                            selected: t.ownerId === towerId,
                          }))
                        );
                        setSelectedTower(null);
                      }}
                    />
                  );
                })()}
              {placingTroop && <PlacingTroopIndicator paydayActive={isAnySpellActive} />}
              {targetingSpell && <TargetingSpellIndicator spellType={targetingSpell} paydayActive={isAnySpellActive} />}
              {activeSentinelTargetKey && <SentinelTargetingIndicator paydayActive={isAnySpellActive} mapTheme={LEVEL_DATA[selectedMap]?.theme} />}
              {missileMortarTargetingId && <MissileTargetingIndicator paydayActive={isAnySpellActive} />}
              {!isTouchDeviceRef.current && hoveredSpecialTower && !hoveredTower && !hoveredHero && (
                <SpecialBuildingTooltip
                  type={hoveredSpecialTower.type}
                  hp={hoveredSpecialTower.type === "vault" ? (specialTowerHp[vaultPosKey(hoveredSpecialTower.pos)] ?? null) : null}
                  maxHp={hoveredSpecialTower.hp}
                  position={mousePos}
                  sentinelTarget={
                    hoveredSpecialTower.type === "sentinel_nexus"
                      ? sentinelTargets[
                      getSpecialTowerKey(hoveredSpecialTower)
                      ] ?? null
                      : undefined
                  }
                  sentinelTargeting={
                    hoveredSpecialTower.type === "sentinel_nexus" &&
                    activeSentinelTargetKey ===
                    getSpecialTowerKey(hoveredSpecialTower)
                  }
                  mapTheme={LEVEL_DATA[selectedMap]?.theme || "grassland"}
                />
              )}
              {!isTouchDeviceRef.current && hoveredLandmark && !hoveredTower && !hoveredHero && !hoveredSpecialTower && !selectedTower && (
                <LandmarkTooltip landmarkType={hoveredLandmark} position={mousePos} />
              )}
              {!isTouchDeviceRef.current && hoveredHazardType && !hoveredTower && !hoveredHero && !hoveredSpecialTower && !hoveredLandmark && !selectedTower && (
                <HazardTooltip hazardType={hoveredHazardType} position={mousePos} />
              )}
              {inspectorActive && hoveredInspectDecoration && (
                <DecorationInspectorTooltip decoration={hoveredInspectDecoration} position={mousePos} />
              )}
              {inspectorActive && selectedInspectEnemy && (() => {
                const enemyPos = getEnemyPosWithPath(selectedInspectEnemy, selectedMap);
                const screenPos = worldToScreen(
                  enemyPos,
                  width,
                  height,
                  dpr,
                  cameraOffset,
                  cameraZoom
                );
                return (
                  <EnemyDetailTooltip
                    enemy={selectedInspectEnemy}
                    position={screenPos}
                    onClose={() => setSelectedInspectEnemy(null)}
                  />
                );
              })()}
              {inspectorActive && selectedInspectTroop && (() => {
                const liveTroop = troops.find(t => t.id === selectedInspectTroop.id);
                if (!liveTroop) return null;
                const screenPos = worldToScreen(
                  liveTroop.pos,
                  width,
                  height,
                  dpr,
                  cameraOffset,
                  cameraZoom
                );
                return (
                  <TroopDetailTooltip
                    troop={liveTroop}
                    position={screenPos}
                    onClose={() => setSelectedInspectTroop(null)}
                  />
                );
              })()}
              {inspectorActive && selectedInspectHero && hero && (() => {
                const screenPos = worldToScreen(
                  hero.pos,
                  width,
                  height,
                  dpr,
                  cameraOffset,
                  cameraZoom
                );
                return (
                  <HeroDetailTooltip
                    hero={hero}
                    position={screenPos}
                    onClose={() => setSelectedInspectHero(false)}
                  />
                );
              })()}
              {!showTutorial && encounterQueue.length > 0 && (
                <div className="absolute left-2 pointer-events-none" style={{ zIndex: 110, bottom: 140 }}>
                  <InlineEncounterPanel
                    encounters={encounterQueue}
                    currentIndex={encounterIndex}
                    onAcknowledge={handleEncounterAcknowledge}
                    autoDismissMs={encounterAutoDismissMs}
                    exiting={encounterExiting}
                  />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none battle-ui-fade" style={{ zIndex: 100 }}>
                <div className="flex justify-end items-end px-0">
                  <div className="flex-shrink-0">
                    {devMenuOpen && (
                      <DevMenu
                        events={gameEventLog.events}
                        stats={gameEventLog.stats}
                        onClear={gameEventLog.clear}
                        onClose={() => setDevMenuOpen(false)}
                      />
                    )}
                  </div>
                </div>
                <HeroSpellBar
                  hero={hero}
                  spells={spells}
                  pawPoints={pawPoints}
                  enemies={enemies}
                  spellUpgradeLevels={spellUpgradeLevels}
                  targetingSpell={targetingSpell}
                  placingTroop={placingTroop}
                  spellAutoAim={spellAutoAim}
                  onToggleSpellAutoAim={toggleSpellAutoAim}
                  toggleHeroSelection={toggleHeroSelection}
                  onUseHeroAbility={triggerHeroAbility}
                  castSpell={castSpell}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {!cameraModeActive && (
        <div className="flex flex-col flex-shrink-0 battle-ui-fade">
          <BuildMenu
            pawPoints={pawPoints}
            buildingTower={buildingTower}
            setBuildingTower={setBuildingTower}
            setIsBuildDragging={setIsBuildDragging}
            setHoveredBuildTower={setHoveredBuildTower}
            hoveredTower={hoveredTower}
            setHoveredTower={setHoveredTower}
            setDraggingTower={setDraggingTower}
            onTouchDragMove={handleBuildTouchDragMove}
            onTouchDragEnd={handleBuildTouchDragEnd}
            placedTowers={towers.reduce((acc, t) => {
              acc[t.type] = (acc[t.type] || 0) + 1;
              return acc;
            }, {} as Record<TowerType, number>)}
            allowedTowers={levelAllowedTowers}
          />
        </div>
      )}
      {!cameraModeActive && isVictory && (
        <VictoryScreen
          starsEarned={starsEarned}
          lives={lives}
          timeSpent={timeSpent}
          bestTime={currentLevelStats.bestTime}
          bestHearts={currentLevelStats.bestHearts}
          levelName={LEVEL_DATA[selectedMap]?.name || selectedMap}
          resetGame={resetGame}
          totalWaves={totalWaves}
          overlay
        />
      )}
      {!cameraModeActive && isDefeat && (
        <DefeatScreen
          resetGame={retryLevel}
          onBackToMap={quitLevel}
          timeSpent={timeSpent}
          waveReached={Math.min(currentWave + 1, totalWaves)}
          totalWaves={totalWaves}
          levelName={LEVEL_DATA[selectedMap]?.name || selectedMap}
          bestTime={currentLevelStats.bestTime}
          timesPlayed={currentLevelStats.timesPlayed || 1}
          overlay
        />
      )}
      {showTutorial && (
        <TutorialOverlay
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          selectedHero={selectedHero}
          selectedSpells={selectedSpells}
          onHeroChange={handleTutorialHeroChange}
          onSpellToggle={handleTutorialSpellToggle}
        />
      )}
    </div>
  );
};
