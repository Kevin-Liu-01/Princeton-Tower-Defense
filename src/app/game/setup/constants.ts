import type { Position } from "../../types";

export const TROOP_RESPAWN_TIME = 5000;
export const TROOP_SEPARATION_DIST = 35;
export const TROOP_SIGHT_RANGE = 180;
export const TROOP_RANGED_SIGHT_RANGE = 280;
export const HERO_SIGHT_RANGE = 150;
export const HERO_RANGED_SIGHT_RANGE = 220;
export const COMBAT_RANGE = 50;
export const MELEE_RANGE = 60;
export const FORMATION_SPACING = 30;
export const ALLY_ALERT_RANGE = 150;
export const ENEMY_SPEED_MODIFIER = 1.25;
export const MAX_TROOP_PATH_DISTANCE = 30;
export const MAX_HERO_PATH_DISTANCE = 45;
export const UNIT_SETTLE_DISTANCE = 15;

export const DEFAULT_CAMERA_OFFSET: Position = {
  x: -40,
  y: -60,
};

export const DEFAULT_CAMERA_ZOOM = 1.5;
