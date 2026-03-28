import type {
  Position,
  Tower,
  Enemy,
  Hero,
  Troop,
  Effect,
  Particle,
  TowerType,
  SpellType,
  DraggingTower,
  Decoration,
  SpecialTower,
  SpellUpgradeLevels,
} from "../../types";
import type { TroopMoveInfo } from "../../utils";
import type { WaveStartBubbleScreenData } from "../../rendering/ui/waveStartBubble";
import type { WaveStartConfirmState } from "./waveStartBubbles";
import type { DraggingUnitState } from "./renderScene";
import type { RuntimeDecoration } from "../../rendering/decorations/decorationHelpers";
import type { GameEventLogAPI } from "../useGameEventLog";
import {
  gridToWorld,
  worldToScreen,
  screenToWorld,
  screenToGrid,
  distance,
  isValidBuildPosition,
  generateId,
  findClosestPathPoint,
  findClosestPathPointWithinRadius,
  getTroopMoveInfo,
  LANDMARK_DECORATION_TYPES,
  LANDMARK_HITBOX_Y_OFFSET,
  getMapDecorationWorldPos,
  resolveMapDecorationRuntimePlacement,
} from "../../utils";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TOWER_DATA,
  ENEMY_DATA,
  HERO_PATH_HITBOX_SIZE,
  TOWER_PLACEMENT_BUFFER,
  WAVE_TIMER_BASE,
  LEVEL_DATA,
  getReinforcementSpellStats,
} from "../../constants";
import {
  getEnemyPosWithPath,
  getTowerHitboxRadius,
  getLevelSpecialTowers,
  getLevelAllowedTowers,
} from "../../game/setup";
import {
  findWaveStartBubbleAtPoint,
  isWaveStartConfirmForBubble,
  getHoveredWaveStartBubblePath,
} from "./waveStartBubbles";
import { getInspectorHoverResult } from "./inspectorHitTesting";
import { getCachedRect, type CachedCanvasRectRef } from "./cachedCanvasRect";

// ---------------------------------------------------------------------------
// Shared parameter interface
// ---------------------------------------------------------------------------

export interface CanvasEventParams {
  // Refs
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cachedCanvasRectRef: CachedCanvasRectRef;
  isTouchDeviceRef: React.MutableRefObject<boolean>;
  lastTouchTimeRef: React.MutableRefObject<number>;
  executeTargetedSpellRef: React.MutableRefObject<
    (spellType: SpellType, pos: Position) => void
  >;
  sentinelTargetsRef: React.MutableRefObject<Record<string, Position>>;
  missileAutoAimRef: React.MutableRefObject<Map<string, Position>>;
  cachedDecorationsRef: React.MutableRefObject<{
    mapKey: string;
    decorations: RuntimeDecoration[];
  } | null>;
  gameEventLogRef: React.MutableRefObject<GameEventLogAPI>;

  // Camera
  cameraOffset: Position;
  cameraZoom: number;

  // Game state values
  buildingTower: TowerType | null;
  draggingTower: DraggingTower | null;
  placingTroop: boolean;
  targetingSpell: SpellType | null;
  activeSentinelTargetKey: string | null;
  inspectorActive: boolean;
  gameSpeed: number;
  selectedTower: string | null;
  selectedMap: string;
  repositioningTower: string | null;
  repositionPreviewPos: Position | null;
  missileMortarTargetingId: string | null;
  isPanning: boolean;
  panStart: Position | null;
  panStartOffset: Position | null;
  isBuildDragging: boolean;
  draggingUnit: DraggingUnitState | null;
  unitDragStart: Position | null;
  unitDragMoved: boolean;
  blockedPositions: Set<string>;
  waveStartConfirm: WaveStartConfirmState | null;
  currentWave: number;
  spellUpgradeLevels: SpellUpgradeLevels;
  moveTargetPos: Position | null;
  moveTargetValid: boolean;
  selectedUnitMoveInfo: TroopMoveInfo | null;

  // Entity collections
  towers: Tower[];
  enemies: Enemy[];
  hero: Hero | null;
  troops: Troop[];

  // Derived / callbacks
  getCanvasDimensions: () => { width: number; height: number; dpr: number };
  getWaveStartBubblesScreenData: (
    w: number,
    h: number,
    dpr: number,
  ) => WaveStartBubbleScreenData[];
  canAffordPawPoints: (amount: number) => boolean;
  spendPawPoints: (amount: number) => boolean;
  addParticles: (pos: Position, type: Particle["type"], count: number) => void;
  addTowerEntity: (tower: Tower) => void;
  addTroopEntities: (troops: Troop[]) => void;
  startWave: () => void;
  getSpecialTowerKey: (tower: Pick<SpecialTower, "type" | "pos">) => string;
  clampWorldToMapBounds: (pos: Position) => Position;
  resolveHeroCommandTarget: (pos: Position) => Position | null;
  resolveTroopCommandTarget: (pos: Position, moveInfo: TroopMoveInfo) => Position | null;
  issueHeroMoveCommand: (heroId: string, pos: Position) => void;
  issueTroopFormationMoveCommand: (ownerId: string, pos: Position) => void;
  clearUnitMoveInteraction: () => void;

  // State setters
  setIsBuildDragging: (v: boolean) => void;
  setDraggingTower: (v: DraggingTower | null) => void;
  setBuildingTower: (v: TowerType | null) => void;
  setIsPanning: (v: boolean) => void;
  setPanStart: (v: Position | null) => void;
  setPanStartOffset: (v: Position | null) => void;
  setDraggingUnit: (v: DraggingUnitState | null) => void;
  setUnitDragStart: (v: Position | null) => void;
  setUnitDragMoved: (v: boolean) => void;
  setSelectedInspectEnemy: (v: Enemy | null) => void;
  setSelectedInspectTroop: (v: Troop | null) => void;
  setSelectedInspectHero: (v: boolean) => void;
  setNextWaveTimer: (v: number) => void;
  setWaveStartConfirm: (v: WaveStartConfirmState | null) => void;
  setRepositioningTower: (v: string | null) => void;
  setRepositionPreviewPos: (v: Position | null) => void;
  setTowers: React.Dispatch<React.SetStateAction<Tower[]>>;
  setTroops: React.Dispatch<React.SetStateAction<Troop[]>>;
  setSpells: React.Dispatch<React.SetStateAction<import("../../types").Spell[]>>;
  setHero: React.Dispatch<React.SetStateAction<Hero | null>>;
  setSelectedTower: (v: string | null) => void;
  setActiveSentinelTargetKey: (v: string | null) => void;
  setSentinelTargets: React.Dispatch<
    React.SetStateAction<Record<string, Position>>
  >;
  setEffects: React.Dispatch<React.SetStateAction<Effect[]>>;
  setPlacingTroop: (v: boolean) => void;
  setTargetingSpell: (v: SpellType | null) => void;
  setMissileMortarTargetingId: (v: string | null) => void;
  setMousePos: (v: Position) => void;
  setMoveTargetPos: (v: Position | null) => void;
  setMoveTargetValid: (v: boolean) => void;
  setSelectedUnitMoveInfo: (v: TroopMoveInfo | null) => void;
  setCameraOffset: (v: Position) => void;
  setHoveredTower: (v: string | null) => void;
  setHoveredHero: (v: boolean) => void;
  setHoveredSpecialTower: (v: SpecialTower | null) => void;
  setHoveredLandmark: (v: string | null) => void;
  setHoveredHazardType: (v: string | null) => void;
  setHoveredWaveBubblePathKey: (v: string | null) => void;
  setHoveredInspectEnemy: (v: string | null) => void;
  setHoveredInspectTroop: (v: string | null) => void;
  setHoveredInspectHero: (v: boolean) => void;
  setHoveredInspectDecoration: (v: Decoration | null) => void;
}

const MAX_EFFECTS = 80;

// ---------------------------------------------------------------------------
// handlePointerDown
// ---------------------------------------------------------------------------

export function handlePointerDownImpl(
  p: CanvasEventParams,
  e: React.PointerEvent<HTMLCanvasElement>,
): void {
  const isTouch = e.pointerType === "touch";

  if (isTouch) {
    p.isTouchDeviceRef.current = true;
    p.lastTouchTimeRef.current = Date.now();
  }

  const canvas = p.canvasRef.current;
  if (!canvas) return;
  const rect = getCachedRect(canvas, p.cachedCanvasRectRef);
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const clickPos = { x, y };
  const { width, height, dpr } = p.getCanvasDimensions();

  if (p.buildingTower || p.draggingTower) {
    const towerType = p.draggingTower?.type || p.buildingTower;
    if (towerType) {
      p.setIsBuildDragging(true);
      p.setDraggingTower({ type: towerType, pos: clickPos });
    }
    return;
  }

  if (p.placingTroop || p.targetingSpell) return;

  const waveStartBubbles = p.getWaveStartBubblesScreenData(width, height, dpr);
  const clickedWaveBubble = findWaveStartBubbleAtPoint(waveStartBubbles, clickPos);
  if (clickedWaveBubble) return;

  if (p.activeSentinelTargetKey) return;

  const isInspecting = p.inspectorActive && p.gameSpeed === 0 && !p.buildingTower && !p.draggingTower;

  if (isInspecting) {
    p.setIsPanning(true);
    p.setPanStart(clickPos);
    p.setPanStartOffset({ ...p.cameraOffset });
    return;
  }

  if (p.selectedTower) {
    const tower = p.towers.find((t) => t.id === p.selectedTower);
    if (tower) {
      const worldPos = gridToWorld(tower.pos);
      const screenPos = worldToScreen(worldPos, width, height, dpr, p.cameraOffset, p.cameraZoom);
      const hitboxRadius = getTowerHitboxRadius(tower, p.cameraZoom);
      if (distance(clickPos, screenPos) < hitboxRadius) return;
    }
  }

  const clickedTower = p.towers.find((t) => {
    const worldPos = gridToWorld(t.pos);
    const screenPos = worldToScreen(worldPos, width, height, dpr, p.cameraOffset, p.cameraZoom);
    const hitboxRadius = getTowerHitboxRadius(t, p.cameraZoom);
    return distance(clickPos, screenPos) < hitboxRadius;
  });

  let clickedHero = false;
  if (p.hero && !p.hero.dead) {
    const heroScreen = worldToScreen(p.hero.pos, width, height, dpr, p.cameraOffset, p.cameraZoom);
    clickedHero = distance(clickPos, heroScreen) < 28;
  }

  const clickedTroop = p.troops.find((t) => {
    const troopScreen = worldToScreen(t.pos, width, height, dpr, p.cameraOffset, p.cameraZoom);
    return distance(clickPos, troopScreen) < 22;
  });

  if (clickedHero && p.hero && !p.hero.dead) {
    p.setDraggingUnit({ kind: "hero", heroId: p.hero.id });
    p.setUnitDragStart(clickPos);
    p.setUnitDragMoved(false);
    return;
  }

  if (clickedTroop && !isTouch) {
    p.setDraggingUnit({
      kind: "troop",
      troopId: clickedTroop.id,
      ownerId: clickedTroop.ownerId,
    });
    p.setUnitDragStart(clickPos);
    p.setUnitDragMoved(false);
    return;
  }

  if (!clickedTower && !clickedHero && !clickedTroop) {
    p.setIsPanning(true);
    p.setPanStart(clickPos);
    p.setPanStartOffset({ ...p.cameraOffset });
  }
}

// ---------------------------------------------------------------------------
// handleCanvasClick
// ---------------------------------------------------------------------------

export function handleCanvasClickImpl(
  p: CanvasEventParams,
  e: React.PointerEvent<HTMLCanvasElement>,
): void {
  const isTouch = e.pointerType === "touch";

  if (isTouch) {
    p.isTouchDeviceRef.current = true;
    p.lastTouchTimeRef.current = Date.now();
  }

  const canvas = p.canvasRef.current;
  if (!canvas) return;
  const rect = getCachedRect(canvas, p.cachedCanvasRectRef);
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const clickPos = { x: clickX, y: clickY };
  const { width, height, dpr } = p.getCanvasDimensions();

  if (p.isBuildDragging) {
    p.setIsBuildDragging(false);
  }

  // ========== STOP PANNING ==========
  if (p.isPanning) {
    const wasPanning =
      p.panStart &&
      (Math.abs(clickX - p.panStart.x) > 5 || Math.abs(clickY - p.panStart.y) > 5);
    p.setIsPanning(false);
    p.setPanStart(null);
    p.setPanStartOffset(null);
    if (wasPanning) {
      if (p.inspectorActive) {
        p.setSelectedInspectEnemy(null);
        p.setSelectedInspectTroop(null);
        p.setSelectedInspectHero(false);
      }
      return;
    }
  }

  // ========== HERO/TROOP DRAG RELOCATION ==========
  if (p.draggingUnit) {
    const movedEnough =
      p.unitDragMoved ||
      (!!p.unitDragStart &&
        (Math.abs(clickX - p.unitDragStart.x) > 4 ||
          Math.abs(clickY - p.unitDragStart.y) > 4));

    if (movedEnough) {
      const clickWorldPos = screenToWorld(clickPos, width, height, dpr, p.cameraOffset, p.cameraZoom);
      const barracksSpecialTowers = getLevelSpecialTowers(p.selectedMap);

      if (
        p.draggingUnit.kind === "hero" &&
        p.hero &&
        !p.hero.dead &&
        p.hero.id === p.draggingUnit.heroId
      ) {
        const targetPos = p.resolveHeroCommandTarget(clickWorldPos);
        if (targetPos) {
          p.issueHeroMoveCommand(p.draggingUnit.heroId, targetPos);
        }
      } else if (p.draggingUnit.kind === "troop") {
        const draggedTroop = p.troops.find((t) => t.id === p.draggingUnit!.troopId);
        if (draggedTroop) {
          const moveInfo = getTroopMoveInfo(draggedTroop, p.towers, barracksSpecialTowers);
          const targetPos = p.resolveTroopCommandTarget(clickWorldPos, moveInfo);
          if (targetPos) {
            p.issueTroopFormationMoveCommand(p.draggingUnit.ownerId, targetPos);
          }
        }
      }

      p.clearUnitMoveInteraction();
      return;
    }

    p.setDraggingUnit(null);
    p.setUnitDragStart(null);
    p.setUnitDragMoved(false);
  }

  const waveStartBubbles = p.getWaveStartBubblesScreenData(width, height, dpr);
  const clickedWaveBubble = findWaveStartBubbleAtPoint(waveStartBubbles, clickPos);

  if (clickedWaveBubble) {
    const isSecondClickConfirm = isWaveStartConfirmForBubble(
      p.waveStartConfirm,
      clickedWaveBubble,
      p.selectedMap,
      p.currentWave,
    );

    if (isSecondClickConfirm) {
      p.startWave();
      p.setNextWaveTimer(WAVE_TIMER_BASE);
      p.setWaveStartConfirm(null);
      p.addParticles(clickedWaveBubble.worldPos, "spark", 14);
      p.addParticles(clickedWaveBubble.worldPos, "glow", 8);
    } else {
      p.setWaveStartConfirm({
        mapId: p.selectedMap,
        waveIndex: p.currentWave,
        pathKey: clickedWaveBubble.pathKey,
        openedAt: Date.now(),
      });
      p.addParticles(clickedWaveBubble.worldPos, "glow", 7);
    }
    return;
  }
  if (p.waveStartConfirm) {
    p.setWaveStartConfirm(null);
  }

  // ========== TOWER REPOSITIONING ==========
  if (p.repositioningTower && p.repositionPreviewPos) {
    const tower = p.towers.find((t) => t.id === p.repositioningTower);
    if (tower) {
      const newGridPos = screenToGrid(
        p.repositionPreviewPos,
        width,
        height,
        dpr,
        p.cameraOffset,
        p.cameraZoom,
      );
      const otherTowers = p.towers.filter((t) => t.id !== p.repositioningTower);
      const isValid = isValidBuildPosition(
        newGridPos,
        p.selectedMap,
        otherTowers,
        GRID_WIDTH,
        GRID_HEIGHT,
        TOWER_PLACEMENT_BUFFER,
        p.blockedPositions,
        tower.type,
      );
      if (isValid) {
        p.setTowers((prev) =>
          prev.map((t) =>
            t.id === p.repositioningTower ? { ...t, pos: newGridPos } : t,
          ),
        );
        p.addParticles(gridToWorld(newGridPos), "spark", 8);
      }
    }
    p.setRepositioningTower(null);
    p.setRepositionPreviewPos(null);
    return;
  }

  // ========== INSPECTOR MODE ==========
  if (p.inspectorActive && p.gameSpeed === 0 && !p.draggingTower && !p.buildingTower) {
    const worldPos = screenToWorld(clickPos, width, height, dpr, p.cameraOffset, p.cameraZoom);

    const FRIENDLY_BIAS = 12;
    let closestType: "enemy" | "troop" | "hero" | null = null;
    let closestDist = Infinity;
    let closestEnemy: Enemy | null = null;
    let closestTroop: Troop | null = null;
    const clickRadius = 40 / p.cameraZoom;

    for (const enemy of p.enemies) {
      const enemyPos = getEnemyPosWithPath(enemy, p.selectedMap);
      const eData = ENEMY_DATA[enemy.type];
      const flyingOffset = eData.flying ? 35 : 0;
      const adjustedEnemyPos = { x: enemyPos.x, y: enemyPos.y - flyingOffset };
      const dist = distance(worldPos, adjustedEnemyPos);
      const hitRadius = (eData?.size || 20) * 1.5;
      if (dist < hitRadius + clickRadius && dist < closestDist) {
        closestDist = dist;
        closestType = "enemy";
        closestEnemy = enemy;
        closestTroop = null;
      }
    }

    if (p.hero && !p.hero.dead) {
      const dist = distance(worldPos, p.hero.pos);
      if (dist < 30 + clickRadius && dist - FRIENDLY_BIAS < closestDist) {
        closestDist = dist;
        closestType = "hero";
        closestEnemy = null;
        closestTroop = null;
      }
    }

    for (const troop of p.troops) {
      if (troop.dead) continue;
      const dist = distance(worldPos, troop.pos);
      if (dist < 22 + clickRadius && dist - FRIENDLY_BIAS < closestDist) {
        closestDist = dist;
        closestType = "troop";
        closestEnemy = null;
        closestTroop = troop;
      }
    }

    p.setSelectedInspectEnemy(null);
    p.setSelectedInspectTroop(null);
    p.setSelectedInspectHero(false);

    if (closestType === "enemy" && closestEnemy) {
      p.setSelectedInspectEnemy(closestEnemy);
    } else if (closestType === "hero") {
      p.setSelectedInspectHero(true);
    } else if (closestType === "troop" && closestTroop) {
      p.setSelectedInspectTroop(closestTroop);
    }
    return;
  }

  // ========== TOWER PLACEMENT ==========
  const towerToPlace =
    p.draggingTower ||
    (p.buildingTower ? { type: p.buildingTower, pos: clickPos } : null);

  if (towerToPlace) {
    const allowedTowersForLevel = getLevelAllowedTowers(p.selectedMap);
    if (allowedTowersForLevel && !allowedTowersForLevel.includes(towerToPlace.type)) {
      p.setDraggingTower(null);
      p.setBuildingTower(null);
      p.setIsBuildDragging(false);
      return;
    }

    const gridPos = screenToGrid(clickPos, width, height, dpr, p.cameraOffset, p.cameraZoom);
    const towerCost = TOWER_DATA[towerToPlace.type].cost;
    if (
      p.canAffordPawPoints(towerCost) &&
      isValidBuildPosition(
        gridPos,
        p.selectedMap,
        p.towers,
        GRID_WIDTH,
        GRID_HEIGHT,
        TOWER_PLACEMENT_BUFFER,
        p.blockedPositions,
        towerToPlace.type,
      )
    ) {
      const defaultRotation =
        towerToPlace.type === "cannon"
          ? Math.PI * 0.75
          : towerToPlace.type === "mortar"
            ? -Math.PI / 2
            : 0;
      const newTower: Tower = {
        id: generateId("tower"),
        type: towerToPlace.type,
        pos: gridPos,
        level: 1,
        lastAttack: 0,
        rotation: defaultRotation,
        spawnRange:
          towerToPlace.type === "station" ? TOWER_DATA.station.spawnRange : undefined,
        occupiedSpawnSlots:
          towerToPlace.type === "station" ? [false, false, false] : undefined,
        pendingRespawns: towerToPlace.type === "station" ? [] : undefined,
      };
      if (!p.spendPawPoints(towerCost)) {
        p.setDraggingTower(null);
        p.setBuildingTower(null);
        p.setIsBuildDragging(false);
        return;
      }
      p.addTowerEntity(newTower);
      p.addParticles(gridToWorld(gridPos), "spark", 12);
      p.gameEventLogRef.current.log(
        "tower_built",
        `Built ${TOWER_DATA[towerToPlace.type].name} for ${towerCost} PP`,
        { towerType: towerToPlace.type, cost: towerCost },
      );
    }
    p.setDraggingTower(null);
    p.setBuildingTower(null);
    p.setIsBuildDragging(false);
    return;
  }

  if (p.placingTroop) {
    const worldPos = screenToWorld(clickPos, width, height, dpr, p.cameraOffset, p.cameraZoom);
    const reinforcementStats = getReinforcementSpellStats(
      p.spellUpgradeLevels.reinforcements,
    );

    const pathSnap = findClosestPathPoint(worldPos, p.selectedMap);
    if (!pathSnap || pathSnap.distance > HERO_PATH_HITBOX_SIZE * 2.5) return;
    const castCenter = pathSnap.point;
    const castGroupId = generateId("spell");

    const troopOffsets = [
      { x: 0, y: -25 },
      { x: -25, y: 20 },
      { x: 25, y: 20 },
      { x: -48, y: -4 },
      { x: 48, y: -4 },
    ].slice(0, reinforcementStats.knightCount);
    const newTroops: Troop[] = troopOffsets.map((offset, i) => {
      const troopPos = { x: castCenter.x + offset.x, y: castCenter.y + offset.y };
      return {
        id: generateId("troop"),
        ownerId: castGroupId,
        ownerType: "spell" as const,
        pos: troopPos,
        hp: reinforcementStats.knightHp,
        maxHp: reinforcementStats.knightHp,
        moving: false,
        lastAttack: 0,
        type: "reinforcement" as const,
        overrideDamage: reinforcementStats.knightDamage,
        overrideAttackSpeed: reinforcementStats.knightAttackSpeedMs,
        overrideIsRanged: reinforcementStats.rangedUnlocked,
        overrideRange: reinforcementStats.rangedUnlocked
          ? reinforcementStats.rangedRange
          : undefined,
        overrideCanTargetFlying: reinforcementStats.rangedUnlocked,
        overrideHybridMelee: reinforcementStats.rangedUnlocked,
        visualTier: reinforcementStats.visualTier,
        rotation: 0,
        facingRight: true,
        attackAnim: 0,
        selected: false,
        spawnPoint: troopPos,
        moveRadius: reinforcementStats.moveRadius,
        spawnSlot: i,
        userTargetPos: troopPos,
      };
    });
    p.addTroopEntities(newTroops);
    p.addParticles(castCenter, "glow", 20);
    p.addParticles({ x: castCenter.x - 20, y: castCenter.y + 15 }, "spark", 8);
    p.addParticles({ x: castCenter.x + 20, y: castCenter.y + 15 }, "spark", 8);
    p.setSpells((prev) =>
      prev.map((s) =>
        s.type === "reinforcements" ? { ...s, cooldown: s.maxCooldown } : s,
      ),
    );
    p.setPlacingTroop(false);
    return;
  }

  if (p.targetingSpell) {
    const worldPos = screenToWorld(clickPos, width, height, dpr, p.cameraOffset, p.cameraZoom);
    const castType = p.targetingSpell;
    p.executeTargetedSpellRef.current(p.targetingSpell, worldPos);
    p.setSpells((prev) =>
      prev.map((s) => (s.type === castType ? { ...s, cooldown: s.maxCooldown } : s)),
    );
    p.setTargetingSpell(null);
    return;
  }

  // ========== PRIORITIZED SELECTION LOGIC ==========
  const selectedTroopUnit = p.troops.find((t) => t.selected);
  const heroIsSelected = p.hero && !p.hero.dead && p.hero.selected;
  const levelSpecialTowers = getLevelSpecialTowers(p.selectedMap);

  const clickWorldPos = screenToWorld(clickPos, width, height, dpr, p.cameraOffset, p.cameraZoom);
  const clickedSpecialTower =
    levelSpecialTowers.find(
      (tower) => distance(clickWorldPos, gridToWorld(tower.pos)) < 140,
    ) ?? null;
  const clickedSentinelNexus =
    clickedSpecialTower?.type === "sentinel_nexus" ? clickedSpecialTower : null;

  // Missile mortar targeting mode
  if (p.missileMortarTargetingId) {
    const targetPos = p.clampWorldToMapBounds(clickWorldPos);
    p.setTowers((prev) =>
      prev.map((t) =>
        t.id === p.missileMortarTargetingId ? { ...t, mortarTarget: targetPos } : t,
      ),
    );
    p.setMissileMortarTargetingId(null);
    p.addParticles(targetPos, "fire", 10);
    p.addParticles(targetPos, "spark", 6);
    return;
  }

  if (p.activeSentinelTargetKey) {
    if (clickedSentinelNexus) {
      p.setActiveSentinelTargetKey(p.getSpecialTowerKey(clickedSentinelNexus));
      p.addParticles(gridToWorld(clickedSentinelNexus.pos), "spark", 6);
      return;
    }
    const lockedTarget = p.clampWorldToMapBounds(clickWorldPos);
    p.setSentinelTargets((prev) => ({
      ...prev,
      [p.activeSentinelTargetKey!]: lockedTarget,
    }));
    p.setActiveSentinelTargetKey(null);
    p.setEffects((prev) => {
      const next = [
        ...prev,
        {
          id: generateId("sentinel_lockon"),
          pos: lockedTarget,
          type: "sentinel_lockon" as const,
          progress: 0,
          size: 72,
          duration: 460,
        },
      ];
      return next.length > MAX_EFFECTS ? next.slice(next.length - MAX_EFFECTS) : next;
    });
    p.addParticles(lockedTarget, "light", 12);
    p.addParticles(lockedTarget, "spark", 8);
    return;
  }

  if (clickedSentinelNexus) {
    const sentinelKey = p.getSpecialTowerKey(clickedSentinelNexus);
    p.setActiveSentinelTargetKey(sentinelKey);
    p.setSelectedTower(null);
    p.setHero((prev) => (prev ? { ...prev, selected: false } : null));
    p.setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
    const existingTarget = p.sentinelTargetsRef.current[sentinelKey];
    if (existingTarget) {
      p.setEffects((prev) => {
        const next = [
          ...prev,
          {
            id: generateId("sentinel_lockon"),
            pos: existingTarget,
            type: "sentinel_lockon" as const,
            progress: 0,
            size: 72,
            duration: 460,
          },
        ];
        return next.length > MAX_EFFECTS ? next.slice(next.length - MAX_EFFECTS) : next;
      });
    }
    p.addParticles(gridToWorld(clickedSentinelNexus.pos), "spark", 10);
    return;
  }

  // ---------- HERO SELECTED MODE ----------
  if (heroIsSelected) {
    const heroScreen = worldToScreen(
      p.hero!.pos,
      width,
      height,
      dpr,
      p.cameraOffset,
      p.cameraZoom,
    );

    if (distance(clickPos, heroScreen) < 28) {
      p.setHero((prev) => (prev ? { ...prev, selected: false } : null));
      return;
    }

    if (p.moveTargetPos && p.moveTargetValid) {
      p.issueHeroMoveCommand(p.hero!.id, p.moveTargetPos);
      return;
    }

    if (isTouch) {
      const touchTarget = p.resolveHeroCommandTarget(clickWorldPos);
      if (touchTarget) {
        p.issueHeroMoveCommand(p.hero!.id, touchTarget);
        return;
      }
    }

    p.setHero((prev) => (prev ? { ...prev, selected: false } : null));
    return;
  }

  // ---------- TROOP SELECTED MODE ----------
  if (selectedTroopUnit) {
    const troopScreen = worldToScreen(
      selectedTroopUnit.pos,
      width,
      height,
      dpr,
      p.cameraOffset,
      p.cameraZoom,
    );
    if (distance(clickPos, troopScreen) < 22) {
      p.setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
      return;
    }

    if (p.moveTargetPos && p.moveTargetValid && p.selectedUnitMoveInfo) {
      p.issueTroopFormationMoveCommand(selectedTroopUnit.ownerId, p.moveTargetPos);
      return;
    }

    if (isTouch) {
      const moveInfo = getTroopMoveInfo(selectedTroopUnit, p.towers, levelSpecialTowers);
      const touchTarget = p.resolveTroopCommandTarget(clickWorldPos, moveInfo);
      if (touchTarget) {
        p.issueTroopFormationMoveCommand(selectedTroopUnit.ownerId, touchTarget);
        return;
      }
    }

    p.setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
    return;
  }

  // ========== RETICLE CLICK ==========
  const RETICLE_HIT_RADIUS = 52;

  for (const tower of p.towers) {
    if (
      tower.type === "mortar" &&
      tower.level === 4 &&
      tower.upgrade === "A" &&
      tower.mortarAutoAim === false &&
      tower.mortarTarget
    ) {
      const reticleScreen = worldToScreen(
        tower.mortarTarget,
        width,
        height,
        dpr,
        p.cameraOffset,
        p.cameraZoom,
      );
      if (distance(clickPos, reticleScreen) < RETICLE_HIT_RADIUS * p.cameraZoom) {
        p.setMissileMortarTargetingId(tower.id);
        p.setSelectedTower(null);
        return;
      }
    }
  }

  for (const tower of p.towers) {
    if (tower.type !== "mortar" || tower.level !== 4 || tower.upgrade !== "A") continue;
    if (tower.mortarAutoAim === false) continue;
    const aimPos = p.missileAutoAimRef.current.get(tower.id);
    if (!aimPos) continue;
    const reticleScreen = worldToScreen(
      aimPos,
      width,
      height,
      dpr,
      p.cameraOffset,
      p.cameraZoom,
    );
    if (distance(clickPos, reticleScreen) < RETICLE_HIT_RADIUS * p.cameraZoom) {
      p.setTowers((prev) =>
        prev.map((t) =>
          t.id === tower.id
            ? { ...t, mortarAutoAim: false, mortarTarget: { ...aimPos } }
            : t,
        ),
      );
      p.setMissileMortarTargetingId(tower.id);
      p.setSelectedTower(null);
      return;
    }
  }

  for (const spec of levelSpecialTowers) {
    if (spec.type !== "sentinel_nexus") continue;
    const key = p.getSpecialTowerKey(spec);
    const targetPos = p.sentinelTargetsRef.current[key];
    if (!targetPos) continue;
    const reticleScreen = worldToScreen(
      targetPos,
      width,
      height,
      dpr,
      p.cameraOffset,
      p.cameraZoom,
    );
    if (distance(clickPos, reticleScreen) < RETICLE_HIT_RADIUS * p.cameraZoom) {
      p.setActiveSentinelTargetKey(key);
      p.setSelectedTower(null);
      p.setHero((prev) => (prev ? { ...prev, selected: false } : null));
      p.setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
      p.addParticles(gridToWorld(spec.pos), "spark", 6);
      return;
    }
  }

  // ========== NORMAL SELECTION MODE ==========
  const clickedTower = p.towers.find((t) => {
    const worldPos = gridToWorld(t.pos);
    const screenPos = worldToScreen(worldPos, width, height, dpr, p.cameraOffset, p.cameraZoom);
    const hitboxRadius = getTowerHitboxRadius(t, p.cameraZoom);
    return distance(clickPos, screenPos) < hitboxRadius;
  });
  if (clickedTower) {
    const isDeselecting = p.selectedTower === clickedTower.id;
    p.setSelectedTower(isDeselecting ? null : clickedTower.id);
    p.setHero((prev) => (prev ? { ...prev, selected: false } : null));
    p.setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
    return;
  }

  if (p.hero && !p.hero.dead) {
    const heroScreen = worldToScreen(
      p.hero.pos,
      width,
      height,
      dpr,
      p.cameraOffset,
      p.cameraZoom,
    );
    if (distance(clickPos, heroScreen) < 28) {
      p.setHero((prev) => (prev ? { ...prev, selected: true } : null));
      p.setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
      p.setSelectedTower(null);
      return;
    }
  }

  for (const troop of p.troops) {
    const troopScreen = worldToScreen(
      troop.pos,
      width,
      height,
      dpr,
      p.cameraOffset,
      p.cameraZoom,
    );
    if (distance(clickPos, troopScreen) < 22) {
      p.setTroops((prev) =>
        prev.map((t) => ({ ...t, selected: t.id === troop.id })),
      );
      p.setHero((prev) => (prev ? { ...prev, selected: false } : null));
      p.setSelectedTower(null);
      return;
    }
  }

  // Deselect all
  p.setSelectedTower(null);
  p.setHero((prev) => (prev ? { ...prev, selected: false } : null));
  p.setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
}

// ---------------------------------------------------------------------------
// handleMouseMove
// ---------------------------------------------------------------------------

export function handleMouseMoveImpl(
  p: CanvasEventParams,
  e: React.PointerEvent<HTMLCanvasElement>,
): void {
  const isTouch = e.pointerType === "touch";

  if (isTouch) {
    p.isTouchDeviceRef.current = true;
    p.setHoveredWaveBubblePathKey(null);
  }

  if (!isTouch && Date.now() - p.lastTouchTimeRef.current < 500) return;

  const canvas = p.canvasRef.current;
  if (!canvas) return;
  const rect = getCachedRect(canvas, p.cachedCanvasRectRef);
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  p.setMousePos({ x, y });

  if (!isTouch && (e.buttons & 1) === 0) {
    if (p.isBuildDragging) {
      p.setIsBuildDragging(false);
      p.setDraggingTower(null);
    }
    if (p.draggingUnit) {
      p.setDraggingUnit(null);
      p.setUnitDragStart(null);
      p.setUnitDragMoved(false);
      p.setMoveTargetPos(null);
      p.setMoveTargetValid(false);
      p.setSelectedUnitMoveInfo(null);
    }
  }

  const { width, height, dpr } = p.getCanvasDimensions();
  const hoveredWaveBubblePath =
    !isTouch &&
    !p.isPanning &&
    !p.repositioningTower &&
    !p.draggingUnit &&
    (e.buttons & 1) === 0
      ? getHoveredWaveStartBubblePath(
          p.getWaveStartBubblesScreenData(width, height, dpr),
          { x, y },
        )
      : null;
  p.setHoveredWaveBubblePathKey(hoveredWaveBubblePath);

  if (isTouch && p.draggingUnit?.kind === "troop") {
    p.setDraggingUnit(null);
    p.setUnitDragStart(null);
    p.setUnitDragMoved(false);
    p.setMoveTargetPos(null);
    p.setMoveTargetValid(false);
    p.setSelectedUnitMoveInfo(null);
  }

  // ========== CANVAS PANNING ==========
  if (p.isPanning && p.panStart && p.panStartOffset) {
    const dx = (x - p.panStart.x) / p.cameraZoom;
    const dy = (y - p.panStart.y) / p.cameraZoom;
    p.setCameraOffset({ x: p.panStartOffset.x + dx, y: p.panStartOffset.y + dy });
    return;
  }

  // ========== TOWER REPOSITIONING ==========
  if (p.repositioningTower) {
    p.setRepositionPreviewPos({ x, y });
    return;
  }

  // ========== HERO/TROOP DRAG TARGETING ==========
  if (p.draggingUnit && p.unitDragStart) {
    if (
      !p.unitDragMoved &&
      (Math.abs(x - p.unitDragStart.x) > 4 || Math.abs(y - p.unitDragStart.y) > 4)
    ) {
      p.setUnitDragMoved(true);
    }

    const mouseWorldPos = screenToWorld({ x, y }, width, height, dpr, p.cameraOffset, p.cameraZoom);
    const pointerMoveSpecialTowers = getLevelSpecialTowers(p.selectedMap);

    if (p.draggingUnit.kind === "hero") {
      p.setSelectedUnitMoveInfo({
        anchorPos: p.hero?.pos || mouseWorldPos,
        moveRadius: Infinity,
        canMoveAnywhere: true,
        ownerType: "hero",
        ownerId: p.draggingUnit.heroId,
      });

      const pathResult = findClosestPathPoint(mouseWorldPos, p.selectedMap);
      if (pathResult && pathResult.distance < HERO_PATH_HITBOX_SIZE * 2) {
        p.setMoveTargetPos(pathResult.point);
        p.setMoveTargetValid(true);
      } else {
        p.setMoveTargetPos(null);
        p.setMoveTargetValid(false);
      }
    } else {
      const draggedTroop = p.troops.find((t) => t.id === p.draggingUnit!.troopId);
      if (!draggedTroop) {
        p.setDraggingUnit(null);
        p.setUnitDragStart(null);
        p.setUnitDragMoved(false);
        p.setMoveTargetPos(null);
        p.setMoveTargetValid(false);
        p.setSelectedUnitMoveInfo(null);
        return;
      }

      const moveInfo = getTroopMoveInfo(draggedTroop, p.towers, pointerMoveSpecialTowers);
      p.setSelectedUnitMoveInfo(moveInfo);
      const pathResult = findClosestPathPointWithinRadius(
        mouseWorldPos,
        moveInfo.anchorPos,
        moveInfo.moveRadius,
        p.selectedMap,
      );

      if (pathResult) {
        const pathPoint = findClosestPathPoint(mouseWorldPos, p.selectedMap);
        const isNearPath = !!pathPoint && pathPoint.distance < HERO_PATH_HITBOX_SIZE * 2;
        p.setMoveTargetPos(pathResult.point);
        p.setMoveTargetValid(pathResult.isValid && isNearPath);
      } else {
        p.setMoveTargetPos(null);
        p.setMoveTargetValid(false);
      }
    }

    return;
  }

  // For touch: only handle tower dragging, panning, and repositioning
  if (isTouch) {
    if (p.isPanning && p.panStart && p.panStartOffset) {
      const dx = (x - p.panStart.x) / p.cameraZoom;
      const dy = (y - p.panStart.y) / p.cameraZoom;
      p.setCameraOffset({ x: p.panStartOffset.x + dx, y: p.panStartOffset.y + dy });
      return;
    }

    if (p.repositioningTower) {
      p.setRepositionPreviewPos({ x, y });
      return;
    }

    if (p.isBuildDragging && p.buildingTower && !p.draggingTower) {
      p.setDraggingTower({ type: p.buildingTower, pos: { x, y } });
    } else if (p.isBuildDragging && p.draggingTower) {
      p.setDraggingTower({ type: p.draggingTower.type, pos: { x, y } });
    }
    return;
  }

  // ========== INSPECTOR MODE - Handle unit hover ==========
  if (p.inspectorActive) {
    const hoverResult = getInspectorHoverResult({
      screenPos: { x, y },
      width,
      height,
      dpr,
      cameraOffset: p.cameraOffset,
      cameraZoom: p.cameraZoom,
      enemies: p.enemies,
      getEnemyPosWithPath,
      selectedMap: p.selectedMap,
      hero: p.hero,
      troops: p.troops,
      decorations: p.cachedDecorationsRef.current?.decorations,
    });

    p.setHoveredInspectEnemy(hoverResult.hoveredEnemy?.id || null);
    p.setHoveredInspectTroop(hoverResult.hoveredTroop?.id || null);
    p.setHoveredInspectHero(hoverResult.hoveredHero);
    p.setHoveredInspectDecoration(hoverResult.hoveredDecoration);

    if (p.gameSpeed === 0 && !p.draggingTower && !p.buildingTower) return;
  }

  // Tower drag preview
  if (p.buildingTower && !p.draggingTower) {
    p.setDraggingTower({ type: p.buildingTower, pos: { x, y } });
  } else if (p.draggingTower) {
    p.setDraggingTower({ type: p.draggingTower.type, pos: { x, y } });
  }

  const mouseWorldPos = screenToWorld({ x, y }, width, height, dpr, p.cameraOffset, p.cameraZoom);

  // ========== HOVER DETECTION ==========
  // Priority: Tower/Troop > Hero > Special Building > Landmark > Hazard

  const hoveredT = p.towers.find((t) => {
    const worldPos = gridToWorld(t.pos);
    const screenPos = worldToScreen(worldPos, width, height, dpr, p.cameraOffset, p.cameraZoom);
    const hitboxRadius = getTowerHitboxRadius(t, p.cameraZoom);
    return distance({ x, y }, screenPos) < hitboxRadius;
  });

  let hoveredTroopOwnerId: string | null = null;
  if (!hoveredT) {
    const hoveredTroop = p.troops.find((t) => {
      const screenPos = worldToScreen(t.pos, width, height, dpr, p.cameraOffset, p.cameraZoom);
      return distance({ x, y }, screenPos) < 22;
    });
    if (hoveredTroop && !hoveredTroop.ownerId.startsWith("spell")) {
      hoveredTroopOwnerId = hoveredTroop.ownerId;
    }
  }

  let isHeroHovered = false;
  if (p.hero && !p.hero.dead) {
    const heroScreen = worldToScreen(
      p.hero.pos,
      width,
      height,
      dpr,
      p.cameraOffset,
      p.cameraZoom,
    );
    isHeroHovered = distance({ x, y }, heroScreen) < 28;
  }

  const specialTowers = getLevelSpecialTowers(p.selectedMap);
  let hoveredSpecial: SpecialTower | null = null;
  let nearestSpecialDist = Infinity;
  for (const tower of specialTowers) {
    const towerWorldPos = gridToWorld(tower.pos);
    const towerScreenPos = worldToScreen(
      towerWorldPos,
      width,
      height,
      dpr,
      p.cameraOffset,
      p.cameraZoom,
    );
    const dist = distance({ x, y }, towerScreenPos);
    if (dist < 80 && dist < nearestSpecialDist) {
      hoveredSpecial = tower;
      nearestSpecialDist = dist;
    }
  }

  let foundLandmark: string | null = null;
  const levelData = LEVEL_DATA[p.selectedMap];
  if (levelData?.decorations) {
    for (const deco of levelData.decorations) {
      const decoType = deco.category || deco.type;
      if (
        decoType &&
        (LANDMARK_DECORATION_TYPES.has(decoType) ||
          decoType === "statue" ||
          decoType === "demon_statue" ||
          decoType === "obelisk")
      ) {
        const resolvedPlacement = resolveMapDecorationRuntimePlacement(deco);
        const decoWorldPos = getMapDecorationWorldPos(deco);
        const decoScreen = worldToScreen(
          decoWorldPos,
          width,
          height,
          dpr,
          p.cameraOffset,
          p.cameraZoom,
        );
        const scale = (resolvedPlacement?.scale ?? (deco.size || 1)) * p.cameraZoom;
        const hitRadius = scale * 35;
        const yOffset = (LANDMARK_HITBOX_Y_OFFSET[decoType] ?? 0) * scale;
        const hitCenter = { x: decoScreen.x, y: decoScreen.y - yOffset };
        if (distance({ x, y }, hitCenter) < hitRadius) {
          foundLandmark = decoType;
          break;
        }
      }
    }
  }

  let foundHazard: string | null = null;
  if (levelData?.hazards) {
    for (const haz of levelData.hazards) {
      if (haz.pos) {
        const hazWorldPos = gridToWorld(haz.pos);
        const hazScreen = worldToScreen(
          hazWorldPos,
          width,
          height,
          dpr,
          p.cameraOffset,
          p.cameraZoom,
        );
        const hitRadius = (haz.radius || 2) * 24 * p.cameraZoom;
        if (distance({ x, y }, hazScreen) < hitRadius) {
          foundHazard = haz.type;
          break;
        }
      }
    }
  }

  const hasTowerOrTroop = !!(hoveredT || hoveredTroopOwnerId);
  p.setHoveredTower(hoveredT?.id || hoveredTroopOwnerId || null);

  if (hasTowerOrTroop) {
    p.setHoveredHero(false);
    p.setHoveredSpecialTower(null);
    p.setHoveredLandmark(null);
    p.setHoveredHazardType(null);
  } else if (isHeroHovered) {
    p.setHoveredHero(true);
    p.setHoveredSpecialTower(null);
    p.setHoveredLandmark(null);
    p.setHoveredHazardType(null);
  } else if (hoveredSpecial) {
    p.setHoveredHero(false);
    p.setHoveredSpecialTower(hoveredSpecial);
    p.setHoveredLandmark(null);
    p.setHoveredHazardType(null);
  } else if (foundLandmark) {
    p.setHoveredHero(false);
    p.setHoveredSpecialTower(null);
    p.setHoveredLandmark(foundLandmark);
    p.setHoveredHazardType(null);
  } else if (foundHazard) {
    p.setHoveredHero(false);
    p.setHoveredSpecialTower(null);
    p.setHoveredLandmark(null);
    p.setHoveredHazardType(foundHazard);
  } else {
    p.setHoveredHero(false);
    p.setHoveredSpecialTower(null);
    p.setHoveredLandmark(null);
    p.setHoveredHazardType(null);
  }

  // ========== MOVEMENT TARGET INDICATOR CALCULATION ==========
  const selectedTroop = p.troops.find((t) => t.selected);
  const heroIsSelected = p.hero && !p.hero.dead && p.hero.selected;
  const hoverSpecialTowers = getLevelSpecialTowers(p.selectedMap);

  if (selectedTroop) {
    const moveInfo = getTroopMoveInfo(selectedTroop, p.towers, hoverSpecialTowers);
    p.setSelectedUnitMoveInfo(moveInfo);

    const pathResult = findClosestPathPointWithinRadius(
      mouseWorldPos,
      moveInfo.anchorPos,
      moveInfo.moveRadius,
      p.selectedMap,
    );

    if (pathResult) {
      const pathPoint = findClosestPathPoint(mouseWorldPos, p.selectedMap);
      const isNearPath = !!pathPoint && pathPoint.distance < HERO_PATH_HITBOX_SIZE * 2;
      p.setMoveTargetPos(pathResult.point);
      p.setMoveTargetValid(pathResult.isValid && isNearPath);
    } else {
      p.setMoveTargetPos(null);
      p.setMoveTargetValid(false);
    }
  } else if (heroIsSelected) {
    p.setSelectedUnitMoveInfo({
      anchorPos: p.hero!.pos,
      moveRadius: Infinity,
      canMoveAnywhere: true,
      ownerType: "hero",
      ownerId: p.hero!.id,
    });

    const pathResult = findClosestPathPoint(mouseWorldPos, p.selectedMap);
    if (pathResult && pathResult.distance < HERO_PATH_HITBOX_SIZE * 2) {
      p.setMoveTargetPos(pathResult.point);
      p.setMoveTargetValid(true);
    } else {
      p.setMoveTargetPos(null);
      p.setMoveTargetValid(false);
    }
  } else {
    p.setMoveTargetPos(null);
    p.setMoveTargetValid(false);
    p.setSelectedUnitMoveInfo(null);
  }
}
