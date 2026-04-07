import type { Tower, TowerType, TowerUpgrade } from "../types";
import { TOWER_DATA } from "./towers";

const ALL_TOWER_TYPES: TowerType[] = [
  "cannon",
  "library",
  "lab",
  "arch",
  "club",
  "station",
  "mortar",
];

interface TowerVariant {
  level: 1 | 2 | 3 | 4;
  upgrade?: TowerUpgrade;
  label: string;
}

const UPGRADE_ROWS: TowerVariant[] = [
  { label: "L1", level: 1 },
  { label: "L2", level: 2 },
  { label: "L3", level: 3 },
  { label: "L4A", level: 4, upgrade: "A" },
  { label: "L4B", level: 4, upgrade: "B" },
];

const GRID_START_X = 3;
const GRID_START_Y = 7;
const COL_SPACING = 3.5;
const ROW_SPACING = 3.5;

let showcaseIdCounter = 0;

function makeShowcaseId(type: TowerType, variant: TowerVariant): string {
  showcaseIdCounter++;
  return `showcase-${type}-${variant.label}-${showcaseIdCounter}`;
}

export function buildShowcaseTowers(): Tower[] {
  showcaseIdCounter = 0;
  const towers: Tower[] = [];

  for (let col = 0; col < ALL_TOWER_TYPES.length; col++) {
    const type = ALL_TOWER_TYPES[col];
    const x = GRID_START_X + col * COL_SPACING;

    for (let row = 0; row < UPGRADE_ROWS.length; row++) {
      const variant = UPGRADE_ROWS[row];
      const y = GRID_START_Y + row * ROW_SPACING;

      const isStation = type === "station";
      const tower: Tower = {
        id: makeShowcaseId(type, variant),
        lastAttack: 0,
        level: variant.level,
        occupiedSpawnSlots: isStation ? [false, false, false] : undefined,
        pendingRespawns: isStation ? [] : undefined,
        pos: { x, y },
        rotation:
          type === "cannon"
            ? Math.PI * 0.75
            : type === "mortar"
              ? -Math.PI / 2
              : 0,
        spawnRange: isStation ? TOWER_DATA.station.spawnRange : undefined,
        type,
        upgrade: variant.upgrade,
      };

      towers.push(tower);
    }
  }

  return towers;
}
