import type {
  Enemy,
  Hero,
  MapHazard,
  Particle,
  Position,
  SlowSourceType,
  Troop,
} from "../../types";

export interface HazardEffect {
  poisonDamage: number;
  lavaDamage: number;
  environmentalSlow: number;
  environmentalSlowSource?: SlowSourceType;
  environmentalSpeed: number;
  fireParticlePos?: Position;
}

export interface HazardParticle {
  pos: Position;
  type: Particle["type"];
  count: number;
}

export interface IceSpikeCycleState {
  extend: number;
  active: boolean;
  burst: boolean;
}

export interface HazardData extends MapHazard {
  worldPos: Position;
  radius: number;
  iceSpikeCycle?: IceSpikeCycleState;
  particleBudget?: number;
}

export interface HazardCalculationResult {
  effects: Map<string, HazardEffect>;
  particles: HazardParticle[];
}

export interface FriendlyHazardResult {
  troopEffects: Map<string, HazardEffect>;
  heroEffect: HazardEffect | null;
  particles: HazardParticle[];
}

export interface HazardEffectTargetState {
  hp: number;
  dead: boolean;
  lastCombatTime: number;
  healFlash?: number;
  slowed?: boolean;
  slowUntil?: number;
  slowIntensity?: number;
}

export type HazardEnemyTarget = Enemy;
export type HazardTroopTarget = Troop;
export type HazardHeroTarget = Hero;
