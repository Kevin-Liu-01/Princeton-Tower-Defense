import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import {
  TOWER_DATA,
  TROOP_DATA,
  MAP_PATHS,
  DEFAULT_TROOP_HP,
} from "../../constants";
import { getUpgradeCost, TOWER_STATS } from "../../constants/towerStats";
import { getTowerParticleWorldPos } from "../../rendering";
import type { Position, Tower, Troop, TroopType, Particle } from "../../types";
import { gridToWorld } from "../../utils";
import type { GameEventLogAPI } from "../useGameEventLog";

type Setter<T> = Dispatch<SetStateAction<T>>;

export interface UpgradeTowerParams {
  towersRef: MutableRefObject<Tower[]>;
  pawPointsRef: MutableRefObject<number>;
  activeWaveSpawnPaths: string[];
  selectedMap: string;
  gameEventLogRef: MutableRefObject<GameEventLogAPI>;
  setTowers: Setter<Tower[]>;
  setTroops: Setter<Troop[]>;
  setSelectedTower: Setter<string | null>;
  removePawPoints: (amount: number) => void;
  addParticles: (pos: Position, type: Particle["type"], count: number) => void;
}

export function upgradeTowerImpl(
  towerId: string,
  choice: "A" | "B" | undefined,
  p: UpgradeTowerParams
): void {
  const currentTowers = p.towersRef.current;
  const currentPawPoints = p.pawPointsRef.current;

  const tower = currentTowers.find((t) => t.id === towerId);
  if (!tower) {
    return;
  }

  const cost = getUpgradeCost(
    tower.type,
    tower.level,
    tower.upgrade,
    tower.capstone
  );
  if (cost === 0 || currentPawPoints < cost) {
    return;
  }

  if (tower.level === 3 && !choice) {
    return;
  }

  if (tower.level === 4 && tower.upgrade && !tower.capstone) {
    const capstone = TOWER_STATS[tower.type]?.upgrades[tower.upgrade].capstone;
    if (!capstone) {
      return;
    }

    p.setTowers((prev) =>
      prev.map((candidate) =>
        candidate.id === towerId
          ? { ...candidate, capstone: true, lastSpawn: 0 }
          : candidate
      )
    );

    if (tower.type === "station") {
      p.setTroops((prev) =>
        prev.map((troop) => {
          if (troop.ownerId !== towerId) {
            return troop;
          }
          const maxHp = Math.round(troop.maxHp * 1.35);
          return {
            ...troop,
            hp: Math.round((troop.hp / troop.maxHp) * maxHp),
            maxHp,
            overrideDamage: Math.round(
              (troop.overrideDamage ??
                TROOP_DATA[troop.type ?? "elite"].damage) * 1.3
            ),
            visualTier: 5,
          };
        })
      );
    }

    p.removePawPoints(cost);
    p.addParticles(getTowerParticleWorldPos(tower), "glow", 32);
    p.gameEventLogRef.current.log(
      "tower_upgraded",
      `Completed ${capstone.name} for ${cost} PP`,
      { capstone: capstone.name, cost, towerType: tower.type }
    );
    p.setSelectedTower(null);
    return;
  }

  const newLevel = (tower.level + 1) as 2 | 3 | 4;
  const newUpgrade = tower.level === 3 ? choice : tower.upgrade;

  p.setTowers((prev) =>
    prev.map((t) => {
      if (t.id === towerId) {
        const updates: Partial<Tower> = {
          level: newLevel,
          upgrade: newUpgrade,
        };
        if (t.type === "mortar" && newLevel === 4 && newUpgrade === "A") {
          updates.mortarAutoAim = true;
          const defaultPathKey = p.activeWaveSpawnPaths[0] ?? p.selectedMap;
          const path =
            MAP_PATHS[defaultPathKey] ?? MAP_PATHS[p.selectedMap] ?? [];
          if (path.length >= 2) {
            const spawnNode = path[Math.min(2, path.length - 1)];
            updates.mortarTarget = gridToWorld({
              x: spawnNode.x,
              y: spawnNode.y,
            });
          } else {
            updates.mortarTarget = gridToWorld(t.pos);
          }
        }
        return { ...t, ...updates };
      }
      return t;
    })
  );

  if (tower.type === "station") {
    const newTroopType: TroopType =
      newLevel === 2
        ? "armored"
        : newLevel === 3
          ? "elite"
          : newUpgrade === "A"
            ? "centaur"
            : "cavalry";
    const newHP = TROOP_DATA[newTroopType]?.hp || DEFAULT_TROOP_HP;

    p.setTroops((prev) =>
      prev.map((t) => {
        if (t.ownerId === towerId) {
          const hpPercent = t.hp / t.maxHp;
          return {
            ...t,
            hp: Math.round(newHP * hpPercent),
            maxHp: newHP,
            selected: false,
            type: newTroopType,
          };
        }
        return t;
      })
    );
  }

  p.removePawPoints(cost);
  p.addParticles(getTowerParticleWorldPos(tower), "glow", 20);
  p.gameEventLogRef.current.log(
    "tower_upgraded",
    `Upgraded ${TOWER_DATA[tower.type].name} to Lv${newLevel}${newUpgrade ? ` (${newUpgrade})` : ""} for ${cost} PP`,
    { cost, newLevel, towerType: tower.type, upgrade: newUpgrade }
  );
  p.setSelectedTower(null);
}

export interface SellTowerParams {
  towers: Tower[];
  gameEventLogRef: MutableRefObject<GameEventLogAPI>;
  addPawPoints: (amount: number) => void;
  addParticles: (pos: Position, type: Particle["type"], count: number) => void;
  removeTowerEntity: (id: string) => void;
  removeTroopsWhere: (predicate: (troop: Troop) => boolean) => void;
  setSelectedTower: Setter<string | null>;
}

export function sellTowerImpl(towerId: string, p: SellTowerParams): void {
  const tower = p.towers.find((t) => t.id === towerId);
  if (!tower) {
    return;
  }
  const towerDefinition = TOWER_STATS[tower.type];
  let totalInvested = TOWER_DATA[tower.type].cost;
  if (tower.level >= 2) {
    totalInvested += towerDefinition.levels[2].cost;
  }
  if (tower.level >= 3) {
    totalInvested += towerDefinition.levels[3].cost;
  }
  if (tower.level >= 4) {
    totalInvested += towerDefinition.level4Cost;
  }
  if (tower.capstone && tower.upgrade) {
    totalInvested += towerDefinition.upgrades[tower.upgrade].capstone.cost;
  }
  const refund = Math.round(totalInvested * 0.7);
  p.addPawPoints(refund);
  p.addParticles(getTowerParticleWorldPos(tower), "smoke", 15);
  p.removeTowerEntity(towerId);
  p.removeTroopsWhere((troop) => troop.ownerId === towerId);
  p.gameEventLogRef.current.log(
    "tower_sold",
    `Sold ${TOWER_DATA[tower.type].name} Lv${tower.level} for ${refund} PP`,
    { level: tower.level, refund, towerType: tower.type }
  );
  p.setSelectedTower(null);
}
