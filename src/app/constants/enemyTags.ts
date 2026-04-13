import type { EnemyType } from "../types";
import { ENEMY_DATA } from "./enemies";

export type EnemyTagId =
  | "flying"
  | "armored"
  | "swift"
  | "breach"
  | "ranged"
  | "summoner"
  | "regen"
  | "arcane"
  | "aoe"
  | "saboteur"
  | "burn"
  | "venom"
  | "stun"
  | "undead"
  | "insect";

export interface EnemyTagDef {
  id: EnemyTagId;
  label: string;
  color: string;
}

export const ENEMY_TAG_DEFS: EnemyTagDef[] = [
  { color: "#38bdf8", id: "flying", label: "Flying" },
  { color: "#94a3b8", id: "armored", label: "Armored" },
  { color: "#facc15", id: "swift", label: "Swift" },
  { color: "#22d3ee", id: "breach", label: "Breach" },
  { color: "#4ade80", id: "ranged", label: "Ranged" },
  { color: "#c084fc", id: "summoner", label: "Summoner" },
  { color: "#84cc16", id: "regen", label: "Regen" },
  { color: "#2dd4bf", id: "arcane", label: "Arcane" },
  { color: "#fb923c", id: "aoe", label: "AoE" },
  { color: "#f43f5e", id: "saboteur", label: "Saboteur" },
  { color: "#ef4444", id: "burn", label: "Burn" },
  { color: "#a3e635", id: "venom", label: "Venom" },
  { color: "#eab308", id: "stun", label: "Stun" },
  { color: "#d1d5db", id: "undead", label: "Undead" },
  { color: "#bef264", id: "insect", label: "Insect" },
];

const TAG_MAP = Object.fromEntries(
  ENEMY_TAG_DEFS.map((t) => [t.id, t])
) as Record<EnemyTagId, EnemyTagDef>;

const TAG_PRIORITY: EnemyTagId[] = [
  "flying",
  "summoner",
  "breach",
  "ranged",
  "regen",
  "arcane",
  "saboteur",
  "aoe",
  "burn",
  "venom",
  "swift",
  "stun",
  "armored",
  "undead",
  "insect",
];

export function deriveEnemyTags(type: EnemyType): EnemyTagDef[] {
  const d = ENEMY_DATA[type];
  if (!d) {
    return [];
  }
  const ids = new Set<EnemyTagId>();
  if (d.flying) {
    ids.add("flying");
  }
  if (d.traits?.includes("armored")) {
    ids.add("armored");
  }
  if (d.traits?.includes("fast")) {
    ids.add("swift");
  }
  if (d.traits?.includes("breakthrough") || d.breakthrough) {
    ids.add("breach");
  }
  if (d.isRanged || d.traits?.includes("ranged")) {
    ids.add("ranged");
  }
  if (d.summonType) {
    ids.add("summoner");
  }
  if (d.traits?.includes("regenerating")) {
    ids.add("regen");
  }
  if (d.traits?.includes("magic_resist")) {
    ids.add("arcane");
  }
  if (d.traits?.includes("aoe_attack")) {
    ids.add("aoe");
  }
  if (d.traits?.includes("tower_debuffer")) {
    ids.add("saboteur");
  }
  if (d.abilities?.some((a) => a.type === "burn")) {
    ids.add("burn");
  }
  if (d.abilities?.some((a) => a.type === "poison")) {
    ids.add("venom");
  }
  if (d.abilities?.some((a) => a.type === "stun")) {
    ids.add("stun");
  }
  if (d.category === "dark_fantasy") {
    ids.add("undead");
  }
  if (d.category === "insectoid") {
    ids.add("insect");
  }
  return TAG_PRIORITY.filter((id) => ids.has(id)).map((id) => TAG_MAP[id]);
}
