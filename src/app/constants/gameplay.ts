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

// Tower footprint sizes (in grid cells, centered on tower position)
// Stations are bigger than normal towers
export const TOWER_FOOTPRINTS: Record<
  TowerType,
  { width: number; height: number }
> = {
  cannon: { width: 1, height: 1 },
  library: { width: 1, height: 1 },
  lab: { width: 1, height: 1 },
  arch: { width: 1, height: 1 },
  club: { width: 1, height: 1 },
  station: { width: 1.5, height: 1.5 },
  mortar: { width: 1, height: 1 },
};
export const INITIAL_PAW_POINTS = 300;
export const INITIAL_LIVES = 20;
export const WAVE_TIMER_BASE = 15000;
export const HERO_RESPAWN_TIME = 15000;
export const TROOP_SPREAD_RADIUS = 45;
export const ENEMY_SPAWN_FADE_DURATION = 500;
export const ENEMY_DESPAWN_FADE_DURATION = 500;
export const MAX_STATION_TROOPS = 3;
export const SUMMON_COOLDOWN = 8000;
export const SUMMON_CHANNEL_DURATION = 1500;
export const SUMMON_MINION_FADE_DURATION = 600;
