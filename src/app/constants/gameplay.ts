import type { TowerType } from "../types";

// Grid settings - 30x30 maps for more strategic depth
export const TILE_SIZE = 64;
export const GRID_WIDTH = 30;
export const GRID_HEIGHT = 30;

// Road/path exclusion zone - how far towers must be from the road center
export const ROAD_EXCLUSION_BUFFER = 42;

// Game constants
export const HERO_PATH_HITBOX_SIZE = 50;
export const TOWER_PLACEMENT_BUFFER = 40;

// Decoration exclusion around paths (world pixels).
// Hard buffer: no decorations within this distance of a path.
export const DECORATION_PATH_HARD_BUFFER = 75;
// Soft radius: decorations are probabilistically culled below this distance.
export const DECORATION_PATH_SOFT_RADIUS = 200;
// Groves (dense tree clusters) must be at least this far from a path.
export const GROVE_PATH_MIN_DISTANCE = 105;

// Off-map placement: cells outside the grid are buildable if within this
// world-pixel distance of any path segment (≈ 4 tiles). Landmarks and path
// buffer still apply.
export const OFF_MAP_PATH_PROXIMITY = TILE_SIZE * 4;
export const OFF_MAP_HARD_MARGIN = 5;

// Tower footprint sizes (in grid cells, centered on tower position)
// Stations are bigger than normal towers
export const TOWER_FOOTPRINTS: Record<
  TowerType,
  { width: number; height: number }
> = {
  arch: { height: 1, width: 1 },
  cannon: { height: 1, width: 1 },
  club: { height: 1, width: 1 },
  lab: { height: 1, width: 1 },
  library: { height: 1, width: 1 },
  mortar: { height: 1, width: 1 },
  station: { height: 1.5, width: 1.5 },
};
export const INITIAL_PAW_POINTS = 300;
export const INITIAL_LIVES = 20;
export const WAVE_TIMER_BASE = 15_000;
export const HERO_RESPAWN_TIME = 15_000;
export const TROOP_SPREAD_RADIUS = 45;
export const ENEMY_SPAWN_FADE_DURATION = 500;
export const ENEMY_DESPAWN_FADE_DURATION = 500;
export const MAX_STATION_TROOPS = 3;
export const SUMMON_COOLDOWN = 8000;
export const SUMMON_CHANNEL_DURATION = 1500;
export const SUMMON_MINION_FADE_DURATION = 600;
