import type { EffectType } from "../types";

export function getImpactEffect(projType: string): EffectType {
  switch (projType) {
    case "fireball":
    case "infernalFire":
    case "dragonBreath":
    case "ember":
      return "fire_impact";
    case "rock":
      return "rock_impact";
    case "frostBolt":
      return "frost_impact";
    case "poisonBolt":
      return "poison_splash";
    case "magicBolt":
    case "darkBolt":
    case "wyvernBolt":
      return "magic_impact";
    case "arrow":
    case "bolt":
      return "arrow_hit";
    case "mortarShell":
    case "missile":
      return "mortar_impact";
    default:
      return "impact_hit";
  }
}
