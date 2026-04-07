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
    description:
      "Build towers, command your hero, and cast spells to stop enemy waves from reaching campus.",
    id: "welcome",
    position: "center",
    title: "Welcome to Princeton TD!",
  },
  {
    description:
      "Drag a tower onto any open build spot. Each tower has unique tags showing what it does — look for Attacker, Spawner, Hits Air, and more.",
    highlight: "build-menu",
    id: "build-towers",
    position: "bottom-left",
    title: "Building Towers",
  },
  {
    description:
      "Tap a placed tower to upgrade it. Three stat upgrades, then choose one of two Lv.4 specializations.",
    id: "upgrade-towers",
    position: "center",
    title: "Upgrading Towers",
  },
  {
    description:
      "Click the map to move your hero. They auto-attack and have a special ability. Pick one before each battle:",
    highlight: "hero-spell-bar",
    id: "move-hero",
    position: "bottom-center",
    title: "Your Hero",
  },
  {
    description:
      "Equip up to 3 spells. They cost Paw Points and recharge on cooldown. Use the spell bar at the bottom of screen.",
    highlight: "hero-spell-bar",
    id: "use-spells",
    position: "bottom-center",
    title: "Casting Spells",
  },
  {
    description:
      "Tap the glowing bubble on the path to send the next wave early, or wait for the countdown.",
    highlight: "canvas-center",
    id: "send-waves",
    position: "center",
    title: "Sending Waves",
  },
  {
    description:
      "Gear icon (top-right) for game speed, graphics, audio, and controls.",
    highlight: "top-hud",
    id: "settings",
    position: "top-right",
    title: "Settings & Controls",
  },
  {
    description:
      "F2 to pause and scout the map freely. Space for screenshots, Esc to exit.",
    highlight: "top-hud",
    id: "camera-mode",
    position: "top-right",
    title: "Camera Mode",
  },
  {
    description:
      "Mix tower combos, position your hero, and time your spells. Every map plays differently — good luck!",
    id: "good-luck",
    position: "center",
    title: "You're Ready!",
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

export const SPECIAL_TOWER_ENCOUNTERS: Record<SpecialTowerType, EncounterInfo> =
  {
    barracks: {
      category: "special_tower",
      description:
        "Pre-built Barracks that automatically spawn troops to block enemy paths. " +
        "These soldiers fight for free — support them with nearby towers!",
      name: "Barracks",
    },
    beacon: {
      category: "special_tower",
      description:
        "A Beacon Tower boosts the range of all nearby towers. " +
        "Build your towers close to it to take advantage of the buff!",
      name: "Beacon Tower",
    },
    chrono_relay: {
      category: "special_tower",
      description:
        "A Chrono Relay accelerates the attack speed of nearby towers. " +
        "Cluster your damage towers near it for devastating fire rates!",
      name: "Chrono Relay",
    },
    sentinel_nexus: {
      category: "special_tower",
      description:
        "The Sentinel Nexus fires lightning bolts at passing enemies on its own. " +
        "It's a powerful ally — build towers nearby to create a kill zone.",
      name: "Sentinel Nexus",
    },
    shrine: {
      category: "special_tower",
      description:
        "A mystic Shrine that provides passive bonuses to your defenses. " +
        "Keep it in mind when planning your tower layout.",
      name: "Shrine",
    },
    sunforge_orrery: {
      category: "special_tower",
      description:
        "The Sunforge Orrery fires a devastating beam that deals AoE damage. " +
        "Enemies caught in its path take heavy sustained damage.",
      name: "Sunforge Orrery",
    },
    vault: {
      category: "special_tower",
      description:
        "This level has a Vault you must protect! Enemies will attack it directly. " +
        "If the Vault's HP reaches zero, you lose. Position towers to intercept enemies before they reach it.",
      name: "Vault",
    },
  };

// =============================================================================
// ENCOUNTER DESCRIPTIONS — HAZARDS
// =============================================================================

const HAZARD_ENCOUNTER_DATA: Partial<Record<HazardType, EncounterInfo>> = {
  deep_water: {
    category: "hazard",
    description:
      "Deep water zones slow ground movement significantly. " +
      "Flying enemies are unaffected — prepare anti-air defenses!",
    name: "Deep Water",
  },
  ice_sheet: {
    category: "hazard",
    description:
      "Slippery ice speeds up enemies as they slide across. " +
      "Place your strongest towers near the ice to catch fast-moving foes.",
    name: "Ice Sheet",
  },
  ice_spikes: {
    category: "hazard",
    description:
      "Jagged ice spikes damage and slow enemies that pass through. " +
      "A natural chokepoint — reinforce it with towers!",
    name: "Ice Spikes",
  },
  lava: {
    category: "hazard",
    description:
      "Molten lava deals continuous damage to anything that crosses it. " +
      "Keep your hero and troops away from these deadly flows!",
    name: "Lava",
  },
  lava_geyser: {
    category: "hazard",
    description:
      "Periodic lava eruptions deal heavy damage to anything nearby — enemies and your troops alike. " +
      "Time your troop placement carefully around eruptions.",
    name: "Lava Geyser",
  },
  maelstrom: {
    category: "hazard",
    description:
      "A swirling maelstrom that pulls and slows everything caught in its radius. " +
      "Dangerous for troops but great for keeping enemies in tower range.",
    name: "Maelstrom",
  },
  poison_fog: {
    category: "hazard",
    description:
      "Toxic clouds deal damage over time to your troops and hero if they linger in the area. " +
      "Move your hero through quickly or avoid the fog entirely!",
    name: "Poison Fog",
  },
  quicksand: {
    category: "hazard",
    description:
      "Quicksand zones slow down enemies passing through — but also your troops! " +
      "Use towers to take advantage of slowed enemies, but keep your hero clear.",
    name: "Quicksand",
  },
  storm_field: {
    category: "hazard",
    description:
      "Crackling storm energy that periodically damages and disrupts units in the area. " +
      "Both enemies and your troops are affected!",
    name: "Storm Field",
  },
  swamp: {
    category: "hazard",
    description:
      "Murky swamp terrain slows ground movement for both enemies and troops. " +
      "Use ranged towers to capitalize on the slow.",
    name: "Swamp",
  },
  volcano: {
    category: "hazard",
    description:
      "An active volcano that erupts periodically, raining fire on a wide area. " +
      "Watch for eruption warnings and reposition your hero!",
    name: "Volcano",
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
    category: "ranged",
    description:
      "These enemies attack your towers and troops from a distance! " +
      "They hang back and chip away at your defenses. Use fast-attacking towers or spells to eliminate them quickly.",
    members: ["archer", "mage", "catapult", "warlock", "crossbowman", "hexer"],
    title: "Ranged Attackers",
  },
  {
    category: "flying",
    description:
      "Flying enemies soar over the battlefield, ignoring ground troops entirely. " +
      "Only certain towers (Arch, Lab) and spells can target them. Make sure you have anti-air coverage!",
    members: ["harpy", "wyvern", "specter", "banshee"],
    title: "Flying Enemies",
  },
  {
    category: "special",
    description:
      "Berserkers are ferocious melee fighters that deal massive damage to your troops. " +
      "They move fast and hit hard — overwhelm them with tower fire before they reach your barracks.",
    members: ["berserker"],
    title: "Berserker",
  },
  {
    category: "boss",
    description:
      "Golems are massive, heavily armored enemies with enormous HP. " +
      "They're incredibly slow but nearly unstoppable. Focus all your firepower to bring them down!",
    members: ["golem"],
    title: "Golem",
  },
  {
    category: "special",
    description:
      "Necromancers raise fallen enemies as undead minions! " +
      "Kill them quickly before they build an unstoppable zombie horde.",
    members: ["necromancer"],
    title: "Necromancer",
  },
  {
    category: "special",
    description:
      "Shadow Knights are elite warriors with heavy armor and devastating attacks. " +
      "They can disable your towers temporarily — spread your defenses to avoid losing too many at once.",
    members: ["shadow_knight"],
    title: "Shadow Knight",
  },
  {
    category: "special",
    description:
      "Cultists buff nearby enemies, making them stronger and faster. " +
      "Prioritize taking them out before they supercharge the rest of the wave!",
    members: ["cultist"],
    title: "Cultist",
  },
  {
    category: "special",
    description:
      "Plaguebearers spread poison that damages your troops over time. " +
      "Keep your hero and barracks troops at a safe distance when possible.",
    members: ["plaguebearer"],
    title: "Plaguebearer",
  },
  {
    category: "special",
    description:
      "Assassins are fast and stealthy, able to slip past your defenses. " +
      "They deal critical damage and can be hard to catch — use slowing towers!",
    members: ["assassin"],
    title: "Assassin",
  },
  {
    category: "boss",
    description:
      "A Dragon approaches! This flying boss has massive HP, deals AoE fire damage, " +
      "and is resistant to most attacks. Bring your best spells and upgraded towers!",
    members: ["dragon"],
    title: "Dragon",
  },
  {
    category: "boss",
    description:
      "The Juggernaut is an unstoppable siege engine with the highest HP in the game. " +
      "It crushes everything in its path. Layer your defenses deep!",
    members: ["juggernaut"],
    title: "Juggernaut",
  },
  {
    category: "nature_swamp",
    description:
      "Creatures of the swamp emerge! Bog Creatures, Will-o'-Wisps, and Swamp Trolls " +
      "thrive in wetland terrain. Watch for their unique abilities in murky areas.",
    members: ["bog_creature", "will_o_wisp", "swamp_troll"],
    title: "Swamp Creatures",
  },
  {
    category: "nature_desert",
    description:
      "Desert enemies approach! Nomads are swift, Scorpions are venomous, and Scarabs swarm in numbers. " +
      "AoE towers work well against the swarms.",
    members: ["nomad", "scorpion", "scarab"],
    title: "Desert Raiders",
  },
  {
    category: "nature_winter",
    description:
      "Frost enemies have arrived! Snow Goblins are quick, Yetis are tanky, " +
      "and Ice Witches can freeze your towers. Fire-based attacks are especially effective!",
    members: ["snow_goblin", "yeti", "ice_witch"],
    title: "Winter Forces",
  },
  {
    category: "nature_volcanic",
    description:
      "Volcanic enemies are here! Magma Spawns leave burning trails, Fire Imps are fast and explosive, " +
      "and Ember Guards are heavily armored. Use slowing effects to control them.",
    members: ["magma_spawn", "fire_imp", "ember_guard"],
    title: "Volcanic Fiends",
  },
  {
    category: "special",
    description:
      "Thornwalkers regenerate HP over time and damage troops that attack them in melee. " +
      "Use ranged towers and spells to take them down safely.",
    members: ["thornwalker"],
    title: "Thornwalker",
  },
  {
    category: "special",
    description:
      "Sandworms burrow underground and surface near your towers! " +
      "They bypass part of the path — position your defenses further back.",
    members: ["sandworm"],
    title: "Sandworm",
  },
  {
    category: "special",
    description:
      "Frostlings freeze nearby towers on death, creating a temporary dead zone. " +
      "Spread your towers out to avoid chain-freezes!",
    members: ["frostling"],
    title: "Frostling",
  },
  {
    category: "special",
    description:
      "Infernals are demons wreathed in flame that burn everything nearby. " +
      "They deal AoE damage to troops and have fire resistance. Use ice spells!",
    members: ["infernal"],
    title: "Infernal",
  },
];

export function getEnemyEncounterGroup(
  enemyType: EnemyType
): EnemyEncounterGroup | null {
  return (
    ENEMY_ENCOUNTER_GROUPS.find((g) => g.members.includes(enemyType)) ?? null
  );
}
