import type { EnemyType, HazardType, SpecialTowerType } from "../types";

// =============================================================================
// TUTORIAL STEP DEFINITIONS
// =============================================================================

export type TutorialStepPosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  highlight?: "build-menu" | "hero-spell-bar" | "top-hud" | "canvas-center";
  position: TutorialStepPosition;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Princeton TD!",
    description:
      "Build towers, command your hero, and cast spells to stop enemy waves from reaching campus.",
    position: "center",
  },
  {
    id: "build-towers",
    title: "Building Towers",
    description:
      "Drag a tower onto any open build spot. Each tower has unique tags showing what it does — look for Attacker, Spawner, Hits Air, and more.",
    highlight: "build-menu",
    position: "bottom-left",
  },
  {
    id: "upgrade-towers",
    title: "Upgrading Towers",
    description:
      "Tap a placed tower to upgrade it. Three stat upgrades, then choose one of two Lv.4 specializations.",
    position: "center",
  },
  {
    id: "move-hero",
    title: "Your Hero",
    description:
      "Click the map to move your hero. They auto-attack and have a special ability. Pick one before each battle:",
    highlight: "hero-spell-bar",
    position: "bottom-center",
  },
  {
    id: "use-spells",
    title: "Casting Spells",
    description:
      "Equip up to 3 spells. They cost Paw Points and recharge on cooldown. Use the spell bar at the bottom of screen.",
    highlight: "hero-spell-bar",
    position: "bottom-center",
  },
  {
    id: "send-waves",
    title: "Sending Waves",
    description:
      "Tap the glowing bubble on the path to send the next wave early, or wait for the countdown.",
    highlight: "canvas-center",
    position: "center",
  },
  {
    id: "settings",
    title: "Settings & Controls",
    description:
      "Gear icon (top-right) for game speed, graphics, audio, and controls.",
    highlight: "top-hud",
    position: "top-right",
  },
  {
    id: "camera-mode",
    title: "Camera Mode",
    description:
      "F2 to pause and scout the map freely. Space for screenshots, Esc to exit.",
    highlight: "top-hud",
    position: "top-right",
  },
  {
    id: "good-luck",
    title: "You're Ready!",
    description:
      "Mix tower combos, position your hero, and time your spells. Every map plays differently — good luck!",
    position: "center",
  },
];

// =============================================================================
// ENCOUNTER DESCRIPTIONS — SPECIAL TOWERS
// =============================================================================

export interface EncounterInfo {
  name: string;
  description: string;
  category: "special_tower" | "hazard" | "enemy";
}

export const SPECIAL_TOWER_ENCOUNTERS: Record<SpecialTowerType, EncounterInfo> = {
  vault: {
    name: "Vault",
    description:
      "This level has a Vault you must protect! Enemies will attack it directly. " +
      "If the Vault's HP reaches zero, you lose. Position towers to intercept enemies before they reach it.",
    category: "special_tower",
  },
  beacon: {
    name: "Beacon Tower",
    description:
      "A Beacon Tower boosts the range of all nearby towers. " +
      "Build your towers close to it to take advantage of the buff!",
    category: "special_tower",
  },
  shrine: {
    name: "Shrine",
    description:
      "A mystic Shrine that provides passive bonuses to your defenses. " +
      "Keep it in mind when planning your tower layout.",
    category: "special_tower",
  },
  barracks: {
    name: "Barracks",
    description:
      "Pre-built Barracks that automatically spawn troops to block enemy paths. " +
      "These soldiers fight for free — support them with nearby towers!",
    category: "special_tower",
  },
  chrono_relay: {
    name: "Chrono Relay",
    description:
      "A Chrono Relay accelerates the attack speed of nearby towers. " +
      "Cluster your damage towers near it for devastating fire rates!",
    category: "special_tower",
  },
  sentinel_nexus: {
    name: "Sentinel Nexus",
    description:
      "The Sentinel Nexus fires lightning bolts at passing enemies on its own. " +
      "It's a powerful ally — build towers nearby to create a kill zone.",
    category: "special_tower",
  },
  sunforge_orrery: {
    name: "Sunforge Orrery",
    description:
      "The Sunforge Orrery fires a devastating beam that deals AoE damage. " +
      "Enemies caught in its path take heavy sustained damage.",
    category: "special_tower",
  },
};

// =============================================================================
// ENCOUNTER DESCRIPTIONS — HAZARDS
// =============================================================================

const HAZARD_ENCOUNTER_DATA: Partial<Record<HazardType, EncounterInfo>> = {
  poison_fog: {
    name: "Poison Fog",
    description:
      "Toxic clouds deal damage over time to your troops and hero if they linger in the area. " +
      "Move your hero through quickly or avoid the fog entirely!",
    category: "hazard",
  },
  quicksand: {
    name: "Quicksand",
    description:
      "Quicksand zones slow down enemies passing through — but also your troops! " +
      "Use towers to take advantage of slowed enemies, but keep your hero clear.",
    category: "hazard",
  },
  ice_sheet: {
    name: "Ice Sheet",
    description:
      "Slippery ice speeds up enemies as they slide across. " +
      "Place your strongest towers near the ice to catch fast-moving foes.",
    category: "hazard",
  },
  ice_spikes: {
    name: "Ice Spikes",
    description:
      "Jagged ice spikes damage and slow enemies that pass through. " +
      "A natural chokepoint — reinforce it with towers!",
    category: "hazard",
  },
  lava_geyser: {
    name: "Lava Geyser",
    description:
      "Periodic lava eruptions deal heavy damage to anything nearby — enemies and your troops alike. " +
      "Time your troop placement carefully around eruptions.",
    category: "hazard",
  },
  deep_water: {
    name: "Deep Water",
    description:
      "Deep water zones slow ground movement significantly. " +
      "Flying enemies are unaffected — prepare anti-air defenses!",
    category: "hazard",
  },
  maelstrom: {
    name: "Maelstrom",
    description:
      "A swirling maelstrom that pulls and slows everything caught in its radius. " +
      "Dangerous for troops but great for keeping enemies in tower range.",
    category: "hazard",
  },
  storm_field: {
    name: "Storm Field",
    description:
      "Crackling storm energy that periodically damages and disrupts units in the area. " +
      "Both enemies and your troops are affected!",
    category: "hazard",
  },
  swamp: {
    name: "Swamp",
    description:
      "Murky swamp terrain slows ground movement for both enemies and troops. " +
      "Use ranged towers to capitalize on the slow.",
    category: "hazard",
  },
  lava: {
    name: "Lava",
    description:
      "Molten lava deals continuous damage to anything that crosses it. " +
      "Keep your hero and troops away from these deadly flows!",
    category: "hazard",
  },
  volcano: {
    name: "Volcano",
    description:
      "An active volcano that erupts periodically, raining fire on a wide area. " +
      "Watch for eruption warnings and reposition your hero!",
    category: "hazard",
  },
};

export function getHazardEncounter(type: HazardType): EncounterInfo | null {
  return HAZARD_ENCOUNTER_DATA[type] ?? null;
}

// =============================================================================
// ENCOUNTER DESCRIPTIONS — ENEMIES
// =============================================================================

type EnemyEncounterCategory =
  | "academic"
  | "ranged"
  | "flying"
  | "boss"
  | "nature_swamp"
  | "nature_desert"
  | "nature_winter"
  | "nature_volcanic"
  | "campus"
  | "undead"
  | "special";

interface EnemyEncounterGroup {
  title: string;
  description: string;
  category: EnemyEncounterCategory;
  members: EnemyType[];
}

export const ENEMY_ENCOUNTER_GROUPS: EnemyEncounterGroup[] = [
  {
    title: "Ranged Attackers",
    description:
      "These enemies attack your towers and troops from a distance! " +
      "They hang back and chip away at your defenses. Use fast-attacking towers or spells to eliminate them quickly.",
    category: "ranged",
    members: ["archer", "mage", "catapult", "warlock", "crossbowman", "hexer"],
  },
  {
    title: "Flying Enemies",
    description:
      "Flying enemies soar over the battlefield, ignoring ground troops entirely. " +
      "Only certain towers (Arch, Lab) and spells can target them. Make sure you have anti-air coverage!",
    category: "flying",
    members: ["harpy", "wyvern", "specter", "banshee"],
  },
  {
    title: "Berserker",
    description:
      "Berserkers are ferocious melee fighters that deal massive damage to your troops. " +
      "They move fast and hit hard — overwhelm them with tower fire before they reach your barracks.",
    category: "special",
    members: ["berserker"],
  },
  {
    title: "Golem",
    description:
      "Golems are massive, heavily armored enemies with enormous HP. " +
      "They're incredibly slow but nearly unstoppable. Focus all your firepower to bring them down!",
    category: "boss",
    members: ["golem"],
  },
  {
    title: "Necromancer",
    description:
      "Necromancers raise fallen enemies as undead minions! " +
      "Kill them quickly before they build an unstoppable zombie horde.",
    category: "special",
    members: ["necromancer"],
  },
  {
    title: "Shadow Knight",
    description:
      "Shadow Knights are elite warriors with heavy armor and devastating attacks. " +
      "They can disable your towers temporarily — spread your defenses to avoid losing too many at once.",
    category: "special",
    members: ["shadow_knight"],
  },
  {
    title: "Cultist",
    description:
      "Cultists buff nearby enemies, making them stronger and faster. " +
      "Prioritize taking them out before they supercharge the rest of the wave!",
    category: "special",
    members: ["cultist"],
  },
  {
    title: "Plaguebearer",
    description:
      "Plaguebearers spread poison that damages your troops over time. " +
      "Keep your hero and barracks troops at a safe distance when possible.",
    category: "special",
    members: ["plaguebearer"],
  },
  {
    title: "Assassin",
    description:
      "Assassins are fast and stealthy, able to slip past your defenses. " +
      "They deal critical damage and can be hard to catch — use slowing towers!",
    category: "special",
    members: ["assassin"],
  },
  {
    title: "Dragon",
    description:
      "A Dragon approaches! This flying boss has massive HP, deals AoE fire damage, " +
      "and is resistant to most attacks. Bring your best spells and upgraded towers!",
    category: "boss",
    members: ["dragon"],
  },
  {
    title: "Juggernaut",
    description:
      "The Juggernaut is an unstoppable siege engine with the highest HP in the game. " +
      "It crushes everything in its path. Layer your defenses deep!",
    category: "boss",
    members: ["juggernaut"],
  },
  {
    title: "Swamp Creatures",
    description:
      "Creatures of the swamp emerge! Bog Creatures, Will-o'-Wisps, and Swamp Trolls " +
      "thrive in wetland terrain. Watch for their unique abilities in murky areas.",
    category: "nature_swamp",
    members: ["bog_creature", "will_o_wisp", "swamp_troll"],
  },
  {
    title: "Desert Raiders",
    description:
      "Desert enemies approach! Nomads are swift, Scorpions are venomous, and Scarabs swarm in numbers. " +
      "AoE towers work well against the swarms.",
    category: "nature_desert",
    members: ["nomad", "scorpion", "scarab"],
  },
  {
    title: "Winter Forces",
    description:
      "Frost enemies have arrived! Snow Goblins are quick, Yetis are tanky, " +
      "and Ice Witches can freeze your towers. Fire-based attacks are especially effective!",
    category: "nature_winter",
    members: ["snow_goblin", "yeti", "ice_witch"],
  },
  {
    title: "Volcanic Fiends",
    description:
      "Volcanic enemies are here! Magma Spawns leave burning trails, Fire Imps are fast and explosive, " +
      "and Ember Guards are heavily armored. Use slowing effects to control them.",
    category: "nature_volcanic",
    members: ["magma_spawn", "fire_imp", "ember_guard"],
  },
  {
    title: "Thornwalker",
    description:
      "Thornwalkers regenerate HP over time and damage troops that attack them in melee. " +
      "Use ranged towers and spells to take them down safely.",
    category: "special",
    members: ["thornwalker"],
  },
  {
    title: "Sandworm",
    description:
      "Sandworms burrow underground and surface near your towers! " +
      "They bypass part of the path — position your defenses further back.",
    category: "special",
    members: ["sandworm"],
  },
  {
    title: "Frostling",
    description:
      "Frostlings freeze nearby towers on death, creating a temporary dead zone. " +
      "Spread your towers out to avoid chain-freezes!",
    category: "special",
    members: ["frostling"],
  },
  {
    title: "Infernal",
    description:
      "Infernals are demons wreathed in flame that burn everything nearby. " +
      "They deal AoE damage to troops and have fire resistance. Use ice spells!",
    category: "special",
    members: ["infernal"],
  },
];

export function getEnemyEncounterGroup(enemyType: EnemyType): EnemyEncounterGroup | null {
  return ENEMY_ENCOUNTER_GROUPS.find((g) => g.members.includes(enemyType)) ?? null;
}
