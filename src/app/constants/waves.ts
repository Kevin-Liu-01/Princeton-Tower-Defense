import type { WaveGroup } from "../types";

// =============================================================================
// LEVEL-SPECIFIC WAVES CONFIGURATION
// =============================================================================
// All timing values are final (no runtime multipliers applied).
// interval = ms between spawns within a group
// delay    = ms gap before this group starts (cumulative from previous group)
//
// Difficulty curve: early waves are gentle (fewer enemies, wider spacing),
// late waves ramp up (more enemies, tighter spacing, group overlap).
// Each wave features a distinct enemy mix - no two adjacent waves share a lead type.
// Previously unused enemies (thornwalker, crossbowman, frostling)
// are now integrated into the rotation.
export const LEVEL_WAVES: Record<string, WaveGroup[][]> = {
  // =====================
  // GRASSLAND REGION
  // Regional: frosh, athlete, tiger_fan
  // =====================
  poe: [
    // Wave 1: Gentle intro
    [
      { count: 5, interval: 850, type: "frosh" },
      { count: 4, delay: 4500, interval: 800, type: "frosh" },
      { count: 3, delay: 4000, interval: 750, type: "athlete" },
    ],
    // Wave 2: Ranged intro
    [
      { count: 3, interval: 800, type: "archer" },
      { count: 3, delay: 4000, interval: 750, type: "tiger_fan" },
      { count: 3, delay: 3500, interval: 750, type: "cultist" },
      { count: 3, delay: 3500, interval: 800, type: "frosh" },
    ],
    // Wave 3: Flying intro
    [
      { count: 3, interval: 850, type: "mascot" },
      { count: 3, delay: 3800, interval: 800, type: "sophomore" },
      { count: 4, delay: 3500, interval: 700, type: "athlete" },
      { count: 3, delay: 3500, interval: 800, type: "hexer" },
      { count: 3, delay: 3500, interval: 700, type: "mosquito" },
    ],
    // Wave 4: Mixed pressure
    [
      { count: 4, interval: 700, type: "tiger_fan" },
      { count: 3, delay: 3200, interval: 750, type: "crossbowman" },
      { count: 5, delay: 3000, interval: 650, type: "frosh" },
      { count: 3, delay: 3200, interval: 800, type: "harpy" },
      { count: 6, delay: 3000, interval: 500, type: "timber_wolf" },
    ],
    // Wave 5: Speed wave
    [
      { count: 4, interval: 700, type: "berserker" },
      { count: 5, delay: 3000, interval: 600, type: "athlete" },
      { count: 3, delay: 3000, interval: 800, type: "specter" },
      { count: 4, delay: 3000, interval: 650, type: "cultist" },
      { count: 3, delay: 3000, interval: 700, type: "centipede" },
    ],
    // Wave 6: Tank challenge
    [
      { count: 3, interval: 1000, type: "junior" },
      { count: 4, delay: 2800, interval: 700, type: "archer" },
      { count: 6, delay: 2800, interval: 600, type: "frosh" },
      { count: 3, delay: 2800, interval: 800, type: "assassin" },
      { count: 3, delay: 2800, interval: 800, type: "giant_eagle" },
    ],
    // Wave 7: Boss intro
    [
      { count: 3, interval: 1400, type: "senior" },
      { count: 5, delay: 2500, interval: 600, type: "tiger_fan" },
      { count: 3, delay: 2500, interval: 800, type: "banshee" },
      { count: 4, delay: 2500, interval: 700, type: "mage" },
    ],
    // Wave 8: FINALE
    [
      { count: 4, interval: 1100, type: "senior" },
      { count: 4, delay: 2200, interval: 650, type: "harpy" },
      { count: 6, delay: 2200, interval: 500, type: "athlete" },
      { count: 4, delay: 2200, interval: 650, type: "hexer" },
      { count: 4, delay: 2200, interval: 600, type: "berserker" },
      { count: 8, delay: 2200, interval: 450, type: "timber_wolf" },
    ],
    // Wave 9: Skeleton march
    [
      { count: 6, interval: 650, type: "skeleton_footman" },
      { count: 4, delay: 3000, interval: 750, type: "zombie_shambler" },
      { count: 3, delay: 2800, interval: 800, type: "skeleton_archer" },
      { count: 4, delay: 2800, interval: 650, type: "athlete" },
    ],
    // Wave 10: Ghoul ambush
    [
      { count: 5, interval: 600, type: "ghoul" },
      { count: 3, delay: 2800, interval: 900, type: "skeleton_knight" },
      { count: 5, delay: 2500, interval: 600, type: "tiger_fan" },
      { count: 2, delay: 2500, interval: 1200, type: "bone_mage" },
      { count: 3, delay: 2500, interval: 800, type: "forest_troll" },
    ],
    // Wave 11: Bug infestation
    [
      { count: 5, interval: 650, type: "ant_soldier" },
      { count: 3, delay: 2800, interval: 850, type: "bombardier_beetle" },
      { count: 4, delay: 2600, interval: 700, type: "centipede" },
      { count: 3, delay: 2500, interval: 900, type: "orb_weaver" },
      { count: 2, delay: 2500, interval: 1000, type: "mantis" },
    ],
    // Wave 12: Brood mother's lair
    [
      { count: 1, interval: 3000, type: "brood_mother" },
      { count: 4, delay: 2800, interval: 700, type: "silk_moth" },
      { count: 5, delay: 2400, interval: 600, type: "locust" },
      { count: 3, delay: 2200, interval: 700, type: "dragonfly" },
      { count: 5, delay: 2200, interval: 550, type: "mosquito" },
    ],
  ],

  carnegie: [
    // Wave 1: Opening
    [
      { count: 5, interval: 800, type: "frosh" },
      { count: 4, delay: 4200, interval: 700, type: "athlete" },
      { count: 3, delay: 4000, interval: 800, type: "hexer" },
    ],
    // Wave 2: Ranged focus
    [
      { count: 3, interval: 800, type: "crossbowman" },
      { count: 4, delay: 3800, interval: 750, type: "frosh" },
      { count: 4, delay: 3500, interval: 700, type: "tiger_fan" },
      { count: 3, delay: 3500, interval: 850, type: "mage" },
    ],
    // Wave 3: Assassin strike (moved up from typical wave 5 position)
    [
      { count: 4, interval: 700, type: "assassin" },
      { count: 4, delay: 3200, interval: 700, type: "berserker" },
      { count: 5, delay: 2800, interval: 600, type: "athlete" },
      { count: 4, delay: 2800, interval: 650, type: "tiger_fan" },
    ],
    // Wave 4: Tank push
    [
      { count: 4, interval: 850, type: "junior" },
      { count: 5, delay: 3200, interval: 650, type: "tiger_fan" },
      { count: 4, delay: 3000, interval: 700, type: "cultist" },
      { count: 4, delay: 3000, interval: 700, type: "berserker" },
    ],
    // Wave 5: Flying ambush (delayed, more dangerous)
    [
      { count: 3, interval: 1100, type: "wyvern" },
      { count: 5, delay: 2800, interval: 600, type: "harpy" },
      { count: 4, delay: 2600, interval: 750, type: "banshee" },
      { count: 4, delay: 2600, interval: 700, type: "specter" },
      { count: 3, delay: 2600, interval: 750, type: "giant_eagle" },
      { count: 3, delay: 2600, interval: 700, type: "dragonfly" },
    ],
    // Wave 6: Plague wave
    [
      { count: 4, interval: 900, type: "plaguebearer" },
      { count: 4, delay: 2800, interval: 800, type: "warlock" },
      { count: 6, delay: 2600, interval: 550, type: "frosh" },
      { count: 3, delay: 2800, interval: 1100, type: "wyvern" },
    ],
    // Wave 7: Boss assault
    [
      { count: 4, interval: 1100, type: "senior" },
      { count: 3, delay: 2600, interval: 1200, type: "shadow_knight" },
      { count: 6, delay: 2500, interval: 550, type: "tiger_fan" },
      { count: 4, delay: 2500, interval: 700, type: "hexer" },
      { count: 4, delay: 2500, interval: 700, type: "forest_troll" },
    ],
    // Wave 8: Necromancer wave
    [
      { count: 3, interval: 1400, type: "necromancer" },
      { count: 4, delay: 2500, interval: 950, type: "infernal" },
      { count: 6, delay: 2400, interval: 500, type: "athlete" },
      { count: 4, delay: 2400, interval: 750, type: "specter" },
    ],
    // Wave 9: Gradstudent boss
    [
      { count: 3, interval: 1800, type: "gradstudent" },
      { count: 4, delay: 2400, interval: 900, type: "senior" },
      { count: 5, delay: 2200, interval: 650, type: "harpy" },
      { count: 7, delay: 2200, interval: 500, type: "frosh" },
      { count: 4, delay: 2200, interval: 750, type: "banshee" },
      { count: 2, delay: 2400, interval: 1200, type: "dire_bear" },
    ],
    // Wave 10: FINALE
    [
      { count: 4, interval: 1400, type: "gradstudent" },
      { count: 4, delay: 2000, interval: 700, type: "assassin" },
      { count: 7, delay: 2000, interval: 500, type: "tiger_fan" },
      { count: 4, delay: 2000, interval: 900, type: "wyvern" },
      { count: 4, delay: 2000, interval: 800, type: "infernal" },
    ],
    // Wave 11: Undead vanguard
    [
      { count: 4, interval: 800, type: "skeleton_knight" },
      { count: 3, delay: 2800, interval: 1000, type: "dark_knight" },
      { count: 3, delay: 2600, interval: 1100, type: "zombie_brute" },
      { count: 6, delay: 2500, interval: 500, type: "frosh" },
      { count: 1, delay: 2600, interval: 1200, type: "ancient_ent" },
    ],
    // Wave 12: Dark sorcery
    [
      { count: 3, interval: 1100, type: "bone_mage" },
      { count: 3, delay: 2600, interval: 1000, type: "dark_priest" },
      { count: 6, delay: 2400, interval: 550, type: "skeleton_footman" },
      { count: 3, delay: 2400, interval: 900, type: "zombie_spitter" },
      { count: 5, delay: 2400, interval: 600, type: "tiger_fan" },
    ],
    // Wave 13: Bug ambush
    [
      { count: 3, interval: 900, type: "mantis" },
      { count: 5, delay: 2800, interval: 600, type: "locust" },
      { count: 3, delay: 2600, interval: 850, type: "bombardier_beetle" },
      { count: 5, delay: 2400, interval: 650, type: "ant_soldier" },
      { count: 4, delay: 2400, interval: 700, type: "centipede" },
    ],
    // Wave 14: Brood mother siege
    [
      { count: 1, interval: 3200, type: "brood_mother" },
      { count: 3, delay: 2600, interval: 900, type: "orb_weaver" },
      { count: 3, delay: 2400, interval: 850, type: "trapdoor_spider" },
      { count: 4, delay: 2200, interval: 700, type: "silk_moth" },
      { count: 5, delay: 2200, interval: 550, type: "mosquito" },
      { count: 3, delay: 2000, interval: 700, type: "dragonfly" },
    ],
  ],

  nassau: [
    // Wave 1: Opening salvo
    [
      { count: 5, interval: 800, type: "frosh" },
      { count: 4, delay: 4000, interval: 700, type: "tiger_fan" },
      { count: 3, delay: 3800, interval: 750, type: "archer" },
    ],
    // Wave 2: Dark magic intro
    [
      { count: 4, interval: 750, type: "cultist" },
      { count: 3, delay: 3800, interval: 800, type: "hexer" },
      { count: 5, delay: 3500, interval: 650, type: "athlete" },
      { count: 3, delay: 3500, interval: 800, type: "sophomore" },
    ],
    // Wave 3: Air dominance
    [
      { count: 4, interval: 750, type: "mascot" },
      { count: 3, delay: 3500, interval: 900, type: "banshee" },
      { count: 4, delay: 3200, interval: 700, type: "harpy" },
      { count: 5, delay: 3200, interval: 650, type: "frosh" },
      { count: 3, delay: 3200, interval: 750, type: "silk_moth" },
    ],
    // Wave 4: Tank siege
    [
      { count: 4, interval: 900, type: "junior" },
      { count: 5, delay: 3200, interval: 650, type: "tiger_fan" },
      { count: 4, delay: 3000, interval: 700, type: "crossbowman" },
      { count: 3, delay: 3000, interval: 800, type: "specter" },
    ],
    // Wave 5: Melee rush
    [
      { count: 5, interval: 650, type: "berserker" },
      { count: 4, delay: 3000, interval: 750, type: "assassin" },
      { count: 6, delay: 2800, interval: 550, type: "frosh" },
      { count: 5, delay: 2800, interval: 600, type: "athlete" },
      { count: 3, delay: 2800, interval: 800, type: "trapdoor_spider" },
    ],
    // Wave 6: Ranged barrage
    [
      { count: 4, interval: 850, type: "mage" },
      { count: 4, delay: 2800, interval: 800, type: "warlock" },
      { count: 5, delay: 2600, interval: 650, type: "archer" },
      { count: 5, delay: 2600, interval: 600, type: "tiger_fan" },
    ],
    // Wave 7: Plaguebearer siege
    [
      { count: 4, interval: 900, type: "plaguebearer" },
      { count: 4, delay: 2600, interval: 950, type: "infernal" },
      { count: 6, delay: 2500, interval: 550, type: "frosh" },
      { count: 3, delay: 2500, interval: 1100, type: "wyvern" },
      { count: 4, delay: 2500, interval: 700, type: "forest_troll" },
    ],
    // Wave 8: Professor arrives
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 4, delay: 2500, interval: 1200, type: "gradstudent" },
      { count: 3, delay: 2400, interval: 1200, type: "shadow_knight" },
      { count: 6, delay: 2400, interval: 500, type: "athlete" },
    ],
    // Wave 9: Necromancer ritual
    [
      { count: 4, interval: 1300, type: "necromancer" },
      { count: 4, delay: 2400, interval: 900, type: "senior" },
      { count: 5, delay: 2200, interval: 650, type: "harpy" },
      { count: 3, delay: 2200, interval: 1400, type: "catapult" },
    ],
    // Wave 10: Juggernaut siege
    [
      { count: 1, interval: 3200, type: "juggernaut" },
      { count: 3, delay: 2200, interval: 1600, type: "professor" },
      { count: 6, delay: 2200, interval: 500, type: "tiger_fan" },
      { count: 5, delay: 2200, interval: 700, type: "banshee" },
      { count: 4, delay: 2200, interval: 800, type: "infernal" },
      { count: 2, delay: 2200, interval: 1000, type: "dire_bear" },
    ],
    // Wave 11: Dean's arrival
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 4, delay: 2000, interval: 1400, type: "professor" },
      { count: 4, delay: 2000, interval: 1100, type: "shadow_knight" },
      { count: 4, delay: 2000, interval: 900, type: "wyvern" },
      { count: 8, delay: 2000, interval: 450, type: "frosh" },
    ],
    // Wave 12: NASSAU FINALE
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 4, delay: 2000, interval: 1200, type: "professor" },
      { count: 1, delay: 2000, interval: 3200, type: "juggernaut" },
      { count: 5, delay: 2000, interval: 600, type: "assassin" },
      { count: 6, delay: 2000, interval: 600, type: "banshee" },
      { count: 5, delay: 2000, interval: 550, type: "berserker" },
      { count: 2, delay: 2000, interval: 1000, type: "ancient_ent" },
    ],
    // Wave 13: Death Knight assault
    [
      { count: 1, interval: 3000, type: "death_knight" },
      { count: 4, delay: 2200, interval: 1000, type: "dark_knight" },
      { count: 3, delay: 2200, interval: 1100, type: "fallen_paladin" },
      { count: 1, delay: 2000, interval: 2800, type: "skeleton_king" },
      { count: 5, delay: 2000, interval: 700, type: "skeleton_knight" },
    ],
    // Wave 14: Legion of the damned
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 1, delay: 2200, interval: 2800, type: "lich" },
      { count: 4, delay: 2200, interval: 800, type: "hellhound" },
      { count: 1, delay: 2000, interval: 3000, type: "doom_herald" },
      { count: 4, delay: 2000, interval: 900, type: "revenant" },
      { count: 6, delay: 2000, interval: 500, type: "athlete" },
      { count: 2, delay: 2200, interval: 1000, type: "dire_bear" },
      { count: 1, delay: 2000, interval: 1200, type: "ancient_ent" },
    ],
    // Wave 15: Bug swarm
    [
      { count: 6, interval: 550, type: "locust" },
      { count: 5, delay: 2400, interval: 650, type: "ant_soldier" },
      { count: 5, delay: 2200, interval: 550, type: "mosquito" },
      { count: 3, delay: 2200, interval: 850, type: "bombardier_beetle" },
      { count: 4, delay: 2000, interval: 700, type: "centipede" },
      { count: 4, delay: 2000, interval: 650, type: "dragonfly" },
    ],
    // Wave 16: Brood mother assault
    [
      { count: 1, interval: 3200, type: "brood_mother" },
      { count: 3, delay: 2400, interval: 900, type: "mantis" },
      { count: 3, delay: 2200, interval: 900, type: "orb_weaver" },
      { count: 3, delay: 2200, interval: 850, type: "trapdoor_spider" },
      { count: 5, delay: 2000, interval: 600, type: "silk_moth" },
      { count: 6, delay: 2000, interval: 500, type: "ant_soldier" },
    ],
    // Wave 17: THE NASSAU COLOSSUS
    [
      { count: 1, interval: 5000, type: "titan_of_nassau" },
      { count: 2, delay: 3000, interval: 1800, type: "death_knight" },
      { count: 6, delay: 2000, interval: 700, type: "skeleton_knight" },
      { count: 4, delay: 2000, interval: 1000, type: "dark_knight" },
      { count: 8, delay: 2000, interval: 450, type: "skeleton_footman" },
    ],
  ],

  // =====================
  // SWAMP REGION
  // Regional: bog_creature, will_o_wisp, swamp_troll
  // =====================
  bog: [
    // Wave 1: Swamp intro
    [
      { count: 5, interval: 850, type: "bog_creature" },
      { count: 4, delay: 4500, interval: 750, type: "will_o_wisp" },
      { count: 3, delay: 4000, interval: 800, type: "cultist" },
    ],
    // Wave 2: Spectral threat
    [
      { count: 3, interval: 850, type: "specter" },
      { count: 3, delay: 4000, interval: 1000, type: "swamp_troll" },
      { count: 3, delay: 3800, interval: 800, type: "hexer" },
      { count: 4, delay: 3500, interval: 700, type: "bog_creature" },
    ],
    // Wave 3: Flying introduction
    [
      { count: 4, interval: 750, type: "harpy" },
      { count: 3, delay: 3500, interval: 900, type: "banshee" },
      { count: 5, delay: 3500, interval: 650, type: "will_o_wisp" },
      { count: 3, delay: 3500, interval: 850, type: "thornwalker" },
      { count: 3, delay: 3500, interval: 700, type: "mosquito" },
    ],
    // Wave 4: Ranged assault
    [
      { count: 4, interval: 750, type: "archer" },
      { count: 3, delay: 3200, interval: 850, type: "mage" },
      { count: 4, delay: 3200, interval: 950, type: "swamp_troll" },
      { count: 5, delay: 3000, interval: 650, type: "bog_creature" },
      { count: 4, delay: 3000, interval: 650, type: "vine_serpent" },
    ],
    // Wave 5: Disease wave
    [
      { count: 3, interval: 900, type: "plaguebearer" },
      { count: 4, delay: 3000, interval: 800, type: "thornwalker" },
      { count: 5, delay: 2800, interval: 600, type: "will_o_wisp" },
      { count: 3, delay: 2800, interval: 800, type: "assassin" },
      { count: 3, delay: 2800, interval: 750, type: "centipede" },
    ],
    // Wave 6: Tank wall
    [
      { count: 4, interval: 950, type: "swamp_troll" },
      { count: 3, delay: 2800, interval: 1100, type: "senior" },
      { count: 6, delay: 2600, interval: 550, type: "bog_creature" },
      { count: 4, delay: 2600, interval: 700, type: "berserker" },
      { count: 3, delay: 2600, interval: 800, type: "giant_toad" },
    ],
    // Wave 7: Necromancer rises
    [
      { count: 3, interval: 1400, type: "necromancer" },
      { count: 4, delay: 2500, interval: 750, type: "specter" },
      { count: 3, delay: 2500, interval: 1200, type: "shadow_knight" },
      { count: 6, delay: 2500, interval: 550, type: "will_o_wisp" },
    ],
    // Wave 8: Air dominance
    [
      { count: 3, interval: 1200, type: "wyvern" },
      { count: 5, delay: 2500, interval: 650, type: "harpy" },
      { count: 4, delay: 2400, interval: 900, type: "swamp_troll" },
      { count: 4, delay: 2400, interval: 900, type: "infernal" },
      { count: 3, delay: 2400, interval: 800, type: "marsh_troll" },
    ],
    // Wave 9: Boss wave
    [
      { count: 3, interval: 1600, type: "gradstudent" },
      { count: 4, delay: 2400, interval: 800, type: "junior" },
      { count: 4, delay: 2200, interval: 750, type: "banshee" },
      { count: 7, delay: 2200, interval: 500, type: "bog_creature" },
      { count: 3, delay: 2200, interval: 800, type: "thornwalker" },
    ],
    // Wave 10: FINALE
    [
      { count: 4, interval: 1400, type: "gradstudent" },
      { count: 5, delay: 2000, interval: 800, type: "swamp_troll" },
      { count: 3, delay: 2000, interval: 1200, type: "necromancer" },
      { count: 4, delay: 2000, interval: 900, type: "wyvern" },
      { count: 7, delay: 2000, interval: 450, type: "will_o_wisp" },
      { count: 3, delay: 2200, interval: 800, type: "giant_toad" },
    ],
    // Wave 9: Shambling horde
    [
      { count: 6, interval: 600, type: "zombie_shambler" },
      { count: 3, delay: 3000, interval: 900, type: "zombie_spitter" },
      { count: 5, delay: 2800, interval: 650, type: "bog_creature" },
      { count: 3, delay: 2800, interval: 800, type: "skeleton_archer" },
    ],
    // Wave 10: Ghoul hunt
    [
      { count: 5, interval: 600, type: "ghoul" },
      { count: 3, delay: 2600, interval: 900, type: "skeleton_knight" },
      { count: 5, delay: 2500, interval: 550, type: "will_o_wisp" },
      { count: 2, delay: 2500, interval: 1200, type: "dark_priest" },
    ],
    // Wave 13: Swamp bugs
    [
      { count: 3, interval: 900, type: "orb_weaver" },
      { count: 4, delay: 2800, interval: 700, type: "centipede" },
      { count: 5, delay: 2600, interval: 550, type: "mosquito" },
      { count: 4, delay: 2400, interval: 700, type: "ant_soldier" },
      { count: 3, delay: 2400, interval: 700, type: "dragonfly" },
    ],
  ],

  witch_hut: [
    // Wave 1: Eerie opening
    [
      { count: 5, interval: 800, type: "will_o_wisp" },
      { count: 3, delay: 4200, interval: 800, type: "hexer" },
      { count: 4, delay: 4000, interval: 750, type: "bog_creature" },
    ],
    // Wave 2: Thornwalker intro
    [
      { count: 4, interval: 800, type: "thornwalker" },
      { count: 3, delay: 3800, interval: 1000, type: "swamp_troll" },
      { count: 3, delay: 3500, interval: 850, type: "specter" },
      { count: 4, delay: 3500, interval: 700, type: "will_o_wisp" },
    ],
    // Wave 3: Flying assault
    [
      { count: 4, interval: 750, type: "harpy" },
      { count: 3, delay: 3500, interval: 900, type: "banshee" },
      { count: 3, delay: 3200, interval: 800, type: "mascot" },
      { count: 5, delay: 3200, interval: 650, type: "bog_creature" },
      { count: 3, delay: 3200, interval: 750, type: "silk_moth" },
    ],
    // Wave 4: Ranged wave
    [
      { count: 4, interval: 850, type: "mage" },
      { count: 4, delay: 3200, interval: 700, type: "archer" },
      { count: 4, delay: 3000, interval: 950, type: "swamp_troll" },
      { count: 3, delay: 3000, interval: 750, type: "crossbowman" },
    ],
    // Wave 5: Assassin strike
    [
      { count: 4, interval: 750, type: "assassin" },
      { count: 4, delay: 3000, interval: 700, type: "berserker" },
      { count: 6, delay: 2800, interval: 550, type: "will_o_wisp" },
      { count: 3, delay: 2800, interval: 800, type: "thornwalker" },
      { count: 4, delay: 2800, interval: 650, type: "vine_serpent" },
    ],
    // Wave 6: Surprise dean - early boss appearance
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 5, delay: 2800, interval: 850, type: "swamp_troll" },
      { count: 7, delay: 2500, interval: 500, type: "bog_creature" },
      { count: 4, delay: 2500, interval: 700, type: "thornwalker" },
    ],
    // Wave 7: Air superiority
    [
      { count: 3, interval: 1200, type: "wyvern" },
      { count: 5, delay: 2600, interval: 650, type: "harpy" },
      { count: 4, delay: 2500, interval: 900, type: "swamp_troll" },
      { count: 4, delay: 2500, interval: 800, type: "warlock" },
      { count: 4, delay: 2500, interval: 700, type: "giant_toad" },
      { count: 3, delay: 2500, interval: 700, type: "dragonfly" },
    ],
    // Wave 8: Necromancer wave
    [
      { count: 4, interval: 1300, type: "necromancer" },
      { count: 5, delay: 2500, interval: 700, type: "specter" },
      { count: 4, delay: 2400, interval: 900, type: "senior" },
      { count: 6, delay: 2400, interval: 500, type: "will_o_wisp" },
    ],
    // Wave 9: Professor boss
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 3, delay: 2400, interval: 1300, type: "gradstudent" },
      { count: 5, delay: 2200, interval: 850, type: "swamp_troll" },
      { count: 4, delay: 2200, interval: 750, type: "banshee" },
    ],
    // Wave 10: Dark convergence
    [
      { count: 4, interval: 1100, type: "shadow_knight" },
      { count: 3, delay: 2200, interval: 1200, type: "necromancer" },
      { count: 4, delay: 2200, interval: 750, type: "thornwalker" },
      { count: 7, delay: 2200, interval: 500, type: "bog_creature" },
      { count: 4, delay: 2200, interval: 700, type: "marsh_troll" },
    ],
    // Wave 11: Dean arrives
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 4, delay: 2200, interval: 900, type: "senior" },
      { count: 4, delay: 2000, interval: 950, type: "wyvern" },
      { count: 4, delay: 2000, interval: 850, type: "infernal" },
      { count: 7, delay: 2000, interval: 450, type: "will_o_wisp" },
    ],
    // Wave 12: Juggernaut push
    [
      { count: 1, interval: 3200, type: "juggernaut" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 5, delay: 2000, interval: 800, type: "swamp_troll" },
      { count: 5, delay: 2000, interval: 650, type: "harpy" },
      { count: 4, delay: 2000, interval: 750, type: "plaguebearer" },
    ],
    // Wave 13: Triple threat
    [
      { count: 3, interval: 1800, type: "professor" },
      { count: 4, delay: 2000, interval: 1000, type: "shadow_knight" },
      { count: 5, delay: 2000, interval: 650, type: "banshee" },
      { count: 8, delay: 2000, interval: 450, type: "bog_creature" },
      { count: 4, delay: 2000, interval: 650, type: "berserker" },
      { count: 1, delay: 2200, interval: 1200, type: "swamp_hydra" },
    ],
    // Wave 14: FINALE
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 3, delay: 2000, interval: 1600, type: "professor" },
      { count: 4, delay: 2000, interval: 1100, type: "necromancer" },
      { count: 6, delay: 2000, interval: 700, type: "swamp_troll" },
      { count: 4, delay: 2000, interval: 850, type: "wyvern" },
      { count: 5, delay: 2000, interval: 700, type: "infernal" },
    ],
    // Wave 15: Dark ritual
    [
      { count: 3, interval: 1100, type: "dark_priest" },
      { count: 3, delay: 2600, interval: 1000, type: "bone_mage" },
      { count: 3, delay: 2500, interval: 1000, type: "wraith" },
      { count: 5, delay: 2400, interval: 800, type: "swamp_troll" },
      { count: 4, delay: 2400, interval: 800, type: "zombie_spitter" },
    ],
    // Wave 16: Black guard siege
    [
      { count: 3, interval: 1200, type: "black_guard" },
      { count: 4, delay: 2400, interval: 1000, type: "zombie_brute" },
      { count: 5, delay: 2200, interval: 750, type: "skeleton_knight" },
      { count: 7, delay: 2200, interval: 450, type: "bog_creature" },
      { count: 4, delay: 2200, interval: 650, type: "ghoul" },
    ],
    // Wave 17: Bug plague
    [
      { count: 3, interval: 900, type: "mantis" },
      { count: 3, delay: 2600, interval: 850, type: "trapdoor_spider" },
      { count: 5, delay: 2400, interval: 650, type: "ant_soldier" },
      { count: 4, delay: 2200, interval: 700, type: "centipede" },
      { count: 3, delay: 2200, interval: 900, type: "orb_weaver" },
      { count: 5, delay: 2000, interval: 550, type: "mosquito" },
    ],
    // Wave 18: Brood mother awakens
    [
      { count: 1, interval: 3200, type: "brood_mother" },
      { count: 4, delay: 2600, interval: 700, type: "silk_moth" },
      { count: 5, delay: 2200, interval: 600, type: "locust" },
      { count: 3, delay: 2200, interval: 850, type: "bombardier_beetle" },
      { count: 4, delay: 2000, interval: 650, type: "dragonfly" },
      { count: 6, delay: 2000, interval: 500, type: "bog_creature" },
    ],
  ],

  sunken_temple: [
    // Wave 1: Temple entrance
    [
      { count: 5, interval: 850, type: "bog_creature" },
      { count: 4, delay: 4500, interval: 750, type: "will_o_wisp" },
      { count: 3, delay: 4000, interval: 850, type: "thornwalker" },
    ],
    // Wave 2: Curse magic
    [
      { count: 4, interval: 800, type: "hexer" },
      { count: 3, delay: 4000, interval: 750, type: "cultist" },
      { count: 3, delay: 3800, interval: 1000, type: "swamp_troll" },
      { count: 3, delay: 3800, interval: 850, type: "specter" },
    ],
    // Wave 3: Flying scouts
    [
      { count: 4, interval: 750, type: "harpy" },
      { count: 3, delay: 3500, interval: 900, type: "banshee" },
      { count: 5, delay: 3500, interval: 650, type: "bog_creature" },
      { count: 3, delay: 3500, interval: 800, type: "mascot" },
      { count: 3, delay: 3500, interval: 700, type: "mosquito" },
    ],
    // Wave 4: Ranged barrage
    [
      { count: 4, interval: 750, type: "archer" },
      { count: 4, delay: 3200, interval: 850, type: "mage" },
      { count: 4, delay: 3200, interval: 950, type: "swamp_troll" },
      { count: 3, delay: 3200, interval: 900, type: "warlock" },
    ],
    // Wave 5: Speed assault
    [
      { count: 4, interval: 750, type: "assassin" },
      { count: 6, delay: 3000, interval: 550, type: "will_o_wisp" },
      { count: 4, delay: 3000, interval: 700, type: "berserker" },
      { count: 3, delay: 3000, interval: 800, type: "thornwalker" },
      { count: 3, delay: 3000, interval: 750, type: "centipede" },
    ],
    // Wave 6: Disease ritual
    [
      { count: 4, interval: 900, type: "plaguebearer" },
      { count: 3, delay: 2800, interval: 1300, type: "necromancer" },
      { count: 4, delay: 2800, interval: 900, type: "swamp_troll" },
      { count: 4, delay: 2800, interval: 750, type: "specter" },
      { count: 4, delay: 2800, interval: 700, type: "giant_toad" },
    ],
    // Wave 7: Tank wall
    [
      { count: 4, interval: 850, type: "junior" },
      { count: 3, delay: 2800, interval: 1100, type: "senior" },
      { count: 6, delay: 2600, interval: 550, type: "bog_creature" },
      { count: 3, delay: 2600, interval: 950, type: "infernal" },
    ],
    // Wave 8: Air dominance
    [
      { count: 3, interval: 1200, type: "wyvern" },
      { count: 5, delay: 2600, interval: 650, type: "harpy" },
      { count: 4, delay: 2600, interval: 700, type: "crossbowman" },
      { count: 6, delay: 2500, interval: 500, type: "will_o_wisp" },
    ],
    // Wave 9: Shadow convergence
    [
      { count: 4, interval: 1100, type: "shadow_knight" },
      { count: 3, delay: 2500, interval: 1200, type: "necromancer" },
      { count: 5, delay: 2400, interval: 850, type: "swamp_troll" },
      { count: 4, delay: 2400, interval: 750, type: "banshee" },
      { count: 4, delay: 2400, interval: 700, type: "marsh_troll" },
    ],
    // Wave 10: Professor boss
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 3, delay: 2400, interval: 1300, type: "gradstudent" },
      { count: 4, delay: 2400, interval: 750, type: "thornwalker" },
      { count: 4, delay: 2400, interval: 800, type: "warlock" },
    ],
    // Wave 11: Berserker charge
    [
      { count: 5, interval: 650, type: "berserker" },
      { count: 4, delay: 2400, interval: 750, type: "assassin" },
      { count: 5, delay: 2200, interval: 850, type: "swamp_troll" },
      { count: 4, delay: 2200, interval: 700, type: "harpy" },
      { count: 6, delay: 2200, interval: 500, type: "bog_creature" },
    ],
    // Wave 12: Dean arrives
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 4, delay: 2200, interval: 900, type: "senior" },
      { count: 4, delay: 2200, interval: 950, type: "wyvern" },
      { count: 4, delay: 2200, interval: 850, type: "infernal" },
      { count: 7, delay: 2200, interval: 450, type: "will_o_wisp" },
    ],
    // Wave 13: Trustee arrival
    [
      { count: 1, interval: 3200, type: "trustee" },
      { count: 3, delay: 2200, interval: 1600, type: "professor" },
      { count: 4, delay: 2000, interval: 800, type: "plaguebearer" },
      { count: 5, delay: 2000, interval: 800, type: "swamp_troll" },
      { count: 5, delay: 2000, interval: 700, type: "specter" },
      { count: 1, delay: 2200, interval: 1200, type: "swamp_hydra" },
    ],
    // Wave 14: Magic barrage
    [
      { count: 5, interval: 800, type: "warlock" },
      { count: 5, delay: 2000, interval: 700, type: "mage" },
      { count: 4, delay: 2000, interval: 700, type: "hexer" },
      { count: 3, delay: 2000, interval: 1200, type: "catapult" },
      { count: 7, delay: 2000, interval: 450, type: "bog_creature" },
    ],
    // Wave 15: Juggernaut push
    [
      { count: 1, interval: 3200, type: "juggernaut" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 4, delay: 2000, interval: 1000, type: "shadow_knight" },
      { count: 4, delay: 2000, interval: 900, type: "wyvern" },
      { count: 5, delay: 2000, interval: 650, type: "thornwalker" },
    ],
    // Wave 16: Dean council
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 3, delay: 2000, interval: 1600, type: "professor" },
      { count: 6, delay: 2000, interval: 750, type: "swamp_troll" },
      { count: 5, delay: 2000, interval: 650, type: "banshee" },
      { count: 4, delay: 2000, interval: 1100, type: "necromancer" },
    ],
    // Wave 17: Double Trustee
    [
      { count: 3, interval: 2600, type: "trustee" },
      { count: 1, delay: 2000, interval: 3200, type: "juggernaut" },
      { count: 5, delay: 2000, interval: 750, type: "infernal" },
      { count: 5, delay: 2000, interval: 600, type: "harpy" },
      { count: 5, delay: 2000, interval: 600, type: "berserker" },
      { count: 2, delay: 2200, interval: 1000, type: "swamp_hydra" },
      { count: 5, delay: 2000, interval: 600, type: "vine_serpent" },
    ],
    // Wave 18: FINALE
    [
      { count: 3, interval: 2200, type: "trustee" },
      { count: 3, delay: 2000, interval: 2000, type: "dean" },
      { count: 5, delay: 2000, interval: 900, type: "shadow_knight" },
      { count: 7, delay: 2000, interval: 650, type: "swamp_troll" },
      { count: 5, delay: 2000, interval: 800, type: "wyvern" },
      { count: 3, delay: 2000, interval: 1400, type: "professor" },
    ],
    // Wave 19: Lich council
    [
      { count: 1, interval: 3000, type: "lich" },
      { count: 2, delay: 2200, interval: 1600, type: "death_knight" },
      { count: 4, delay: 2200, interval: 900, type: "wraith" },
      { count: 3, delay: 2000, interval: 1000, type: "bone_mage" },
      { count: 6, delay: 2000, interval: 700, type: "swamp_troll" },
    ],
    // Wave 20: Abomination unleashed
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 1, delay: 2200, interval: 2800, type: "doom_herald" },
      { count: 4, delay: 2200, interval: 800, type: "hellhound" },
      { count: 3, delay: 2000, interval: 1000, type: "revenant" },
      { count: 4, delay: 2000, interval: 900, type: "zombie_brute" },
      { count: 7, delay: 2000, interval: 450, type: "will_o_wisp" },
    ],
    // Wave 21: THE THESIS HYDRA
    [
      { count: 1, interval: 5000, type: "swamp_leviathan" },
      { count: 2, delay: 3000, interval: 2000, type: "lich" },
      { count: 5, delay: 2000, interval: 850, type: "zombie_brute" },
      { count: 3, delay: 2000, interval: 1000, type: "dark_priest" },
      { count: 8, delay: 2000, interval: 400, type: "zombie_shambler" },
    ],
    // Wave 22: Temple bugs emerge
    [
      { count: 4, interval: 850, type: "orb_weaver" },
      { count: 3, delay: 2400, interval: 900, type: "trapdoor_spider" },
      { count: 5, delay: 2200, interval: 650, type: "ant_soldier" },
      { count: 4, delay: 2000, interval: 700, type: "centipede" },
      { count: 3, delay: 2000, interval: 900, type: "mantis" },
      { count: 5, delay: 2000, interval: 600, type: "locust" },
    ],
    // Wave 23: Brood mother's domain
    [
      { count: 1, interval: 3200, type: "brood_mother" },
      { count: 3, delay: 2600, interval: 850, type: "bombardier_beetle" },
      { count: 5, delay: 2200, interval: 600, type: "silk_moth" },
      { count: 4, delay: 2000, interval: 650, type: "dragonfly" },
      { count: 6, delay: 2000, interval: 500, type: "mosquito" },
      { count: 4, delay: 2000, interval: 800, type: "swamp_troll" },
    ],
  ],

  // =====================
  // DESERT REGION
  // Regional: nomad, scorpion, scarab
  // =====================
  oasis: [
    // Wave 1: Desert intro
    [
      { count: 5, interval: 850, type: "nomad" },
      { count: 4, delay: 4500, interval: 700, type: "scarab" },
      { count: 3, delay: 4000, interval: 800, type: "archer" },
    ],
    // Wave 2: Scorpion tanks
    [
      { count: 3, interval: 1000, type: "scorpion" },
      { count: 4, delay: 4000, interval: 750, type: "nomad" },
      { count: 3, delay: 3800, interval: 750, type: "cultist" },
      { count: 3, delay: 3800, interval: 800, type: "hexer" },
    ],
    // Wave 3: Flying intro
    [
      { count: 4, interval: 750, type: "mascot" },
      { count: 3, delay: 3500, interval: 800, type: "harpy" },
      { count: 5, delay: 3500, interval: 600, type: "scarab" },
      { count: 3, delay: 3500, interval: 750, type: "crossbowman" },
      { count: 4, delay: 3500, interval: 600, type: "locust" },
    ],
    // Wave 4: Ranged focus
    [
      { count: 4, interval: 850, type: "mage" },
      { count: 4, delay: 3200, interval: 700, type: "archer" },
      { count: 4, delay: 3200, interval: 950, type: "scorpion" },
      { count: 3, delay: 3000, interval: 800, type: "specter" },
      { count: 3, delay: 3000, interval: 750, type: "djinn" },
    ],
    // Wave 5: Sandworm terror
    [
      { count: 3, interval: 1200, type: "sandworm" },
      { count: 5, delay: 3000, interval: 600, type: "nomad" },
      { count: 4, delay: 2800, interval: 700, type: "berserker" },
      { count: 5, delay: 2800, interval: 550, type: "scarab" },
      { count: 3, delay: 2800, interval: 800, type: "bombardier_beetle" },
    ],
    // Wave 6: Tank wall
    [
      { count: 3, interval: 1100, type: "senior" },
      { count: 4, delay: 2800, interval: 900, type: "scorpion" },
      { count: 3, delay: 2600, interval: 800, type: "assassin" },
      { count: 3, delay: 2600, interval: 900, type: "plaguebearer" },
      { count: 3, delay: 2600, interval: 800, type: "manticore" },
      { count: 2, delay: 2600, interval: 950, type: "mantis" },
    ],
    // Wave 7: Air assault
    [
      { count: 3, interval: 1200, type: "wyvern" },
      { count: 4, delay: 2500, interval: 750, type: "banshee" },
      { count: 6, delay: 2400, interval: 550, type: "nomad" },
      { count: 3, delay: 2400, interval: 950, type: "infernal" },
    ],
    // Wave 8: Shadow wave
    [
      { count: 3, interval: 1200, type: "shadow_knight" },
      { count: 3, delay: 2400, interval: 1300, type: "necromancer" },
      { count: 5, delay: 2200, interval: 850, type: "scorpion" },
      { count: 6, delay: 2200, interval: 500, type: "scarab" },
      { count: 3, delay: 2400, interval: 750, type: "djinn" },
    ],
    // Wave 9: Boss wave
    [
      { count: 3, interval: 1600, type: "gradstudent" },
      { count: 4, delay: 2200, interval: 900, type: "senior" },
      { count: 3, delay: 2200, interval: 1100, type: "sandworm" },
      { count: 3, delay: 2200, interval: 1000, type: "wyvern" },
      { count: 7, delay: 2200, interval: 450, type: "nomad" },
    ],
    // Wave 10: FINALE
    [
      { count: 4, interval: 1400, type: "gradstudent" },
      { count: 5, delay: 2000, interval: 800, type: "scorpion" },
      { count: 4, delay: 2000, interval: 1000, type: "sandworm" },
      { count: 5, delay: 2000, interval: 650, type: "harpy" },
      { count: 8, delay: 2000, interval: 400, type: "scarab" },
      { count: 3, delay: 2200, interval: 800, type: "manticore" },
    ],
    // Wave 11: Bone legion
    [
      { count: 6, interval: 600, type: "skeleton_footman" },
      { count: 3, delay: 2800, interval: 900, type: "skeleton_knight" },
      { count: 5, delay: 2600, interval: 650, type: "nomad" },
      { count: 4, delay: 2600, interval: 750, type: "skeleton_archer" },
    ],
    // Wave 12: Revenant wrath
    [
      { count: 3, interval: 1000, type: "revenant" },
      { count: 3, delay: 2600, interval: 1100, type: "dark_knight" },
      { count: 7, delay: 2400, interval: 450, type: "scarab" },
      { count: 2, delay: 2400, interval: 1200, type: "zombie_brute" },
    ],
    // Wave 13: Desert bugs
    [
      { count: 6, interval: 550, type: "locust" },
      { count: 3, delay: 2600, interval: 850, type: "bombardier_beetle" },
      { count: 3, delay: 2400, interval: 900, type: "mantis" },
      { count: 5, delay: 2200, interval: 650, type: "ant_soldier" },
      { count: 4, delay: 2200, interval: 700, type: "centipede" },
    ],
  ],

  pyramid: [
    // Wave 1: Pyramid scouts
    [
      { count: 5, interval: 750, type: "scarab" },
      { count: 4, delay: 4200, interval: 800, type: "nomad" },
      { count: 3, delay: 4000, interval: 800, type: "archer" },
    ],
    // Wave 2: Tank intro
    [
      { count: 4, interval: 950, type: "scorpion" },
      { count: 3, delay: 3800, interval: 800, type: "hexer" },
      { count: 5, delay: 3500, interval: 600, type: "scarab" },
      { count: 3, delay: 3500, interval: 750, type: "crossbowman" },
    ],
    // Wave 3: Flying wave
    [
      { count: 4, interval: 750, type: "harpy" },
      { count: 3, delay: 3500, interval: 800, type: "mascot" },
      { count: 5, delay: 3200, interval: 650, type: "nomad" },
      { count: 3, delay: 3200, interval: 900, type: "banshee" },
      { count: 4, delay: 3200, interval: 600, type: "locust" },
    ],
    // Wave 4: Sandworm terror
    [
      { count: 3, interval: 1200, type: "sandworm" },
      { count: 4, delay: 3000, interval: 900, type: "scorpion" },
      { count: 4, delay: 3000, interval: 700, type: "berserker" },
      { count: 5, delay: 2800, interval: 550, type: "scarab" },
      { count: 4, delay: 2800, interval: 700, type: "ant_soldier" },
    ],
    // Wave 5: Ranged barrage
    [
      { count: 4, interval: 850, type: "mage" },
      { count: 4, delay: 2800, interval: 800, type: "warlock" },
      { count: 5, delay: 2800, interval: 650, type: "archer" },
      { count: 5, delay: 2600, interval: 600, type: "nomad" },
      { count: 4, delay: 2600, interval: 700, type: "djinn" },
    ],
    // Wave 6: Assassin strike
    [
      { count: 4, interval: 750, type: "assassin" },
      { count: 3, delay: 2600, interval: 900, type: "plaguebearer" },
      { count: 5, delay: 2500, interval: 850, type: "scorpion" },
      { count: 4, delay: 2500, interval: 750, type: "specter" },
    ],
    // Wave 7: Necromancer ritual
    [
      { count: 4, interval: 1300, type: "necromancer" },
      { count: 3, delay: 2500, interval: 1200, type: "shadow_knight" },
      { count: 6, delay: 2400, interval: 500, type: "scarab" },
      { count: 3, delay: 2400, interval: 950, type: "infernal" },
      { count: 3, delay: 2400, interval: 800, type: "manticore" },
    ],
    // Wave 8: Dean arrives early
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 4, delay: 2400, interval: 900, type: "senior" },
      { count: 4, delay: 2200, interval: 1000, type: "sandworm" },
      { count: 6, delay: 2200, interval: 750, type: "scorpion" },
    ],
    // Wave 9: Professor + catapult barrage
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 3, delay: 2200, interval: 1200, type: "catapult" },
      { count: 8, delay: 2000, interval: 400, type: "scarab" },
      { count: 7, delay: 2000, interval: 450, type: "nomad" },
    ],
    // Wave 10: Air dominance
    [
      { count: 4, interval: 1000, type: "wyvern" },
      { count: 5, delay: 2000, interval: 650, type: "harpy" },
      { count: 3, delay: 2000, interval: 1200, type: "catapult" },
      { count: 8, delay: 2000, interval: 400, type: "scarab" },
      { count: 4, delay: 2000, interval: 800, type: "infernal" },
      { count: 2, delay: 2200, interval: 1000, type: "basilisk" },
    ],
    // Wave 11: Double Dean
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 3, delay: 2000, interval: 1600, type: "professor" },
      { count: 6, delay: 2000, interval: 750, type: "scorpion" },
      { count: 4, delay: 2000, interval: 1000, type: "sandworm" },
      { count: 5, delay: 2000, interval: 600, type: "berserker" },
    ],
    // Wave 12: FINALE
    [
      { count: 3, interval: 2000, type: "dean" },
      { count: 1, delay: 2000, interval: 3200, type: "juggernaut" },
      { count: 6, delay: 2000, interval: 700, type: "scorpion" },
      { count: 5, delay: 2000, interval: 800, type: "wyvern" },
      { count: 4, delay: 2000, interval: 900, type: "shadow_knight" },
      { count: 3, delay: 2000, interval: 1100, type: "catapult" },
      { count: 1, delay: 2200, interval: 1200, type: "phoenix" },
    ],
    // Wave 13: Tomb guardians
    [
      { count: 1, interval: 3000, type: "skeleton_king" },
      { count: 3, delay: 2600, interval: 1000, type: "bone_mage" },
      { count: 3, delay: 2400, interval: 1000, type: "wraith" },
      { count: 5, delay: 2400, interval: 800, type: "scorpion" },
      { count: 5, delay: 2200, interval: 700, type: "skeleton_knight" },
    ],
    // Wave 14: Fallen paladin charge
    [
      { count: 3, interval: 1100, type: "fallen_paladin" },
      { count: 3, delay: 2400, interval: 1200, type: "black_guard" },
      { count: 3, delay: 2200, interval: 1000, type: "dark_priest" },
      { count: 7, delay: 2200, interval: 450, type: "nomad" },
      { count: 6, delay: 2200, interval: 500, type: "scarab" },
    ],
    // Wave 15: Desert bug swarm
    [
      { count: 6, interval: 550, type: "locust" },
      { count: 4, delay: 2400, interval: 800, type: "bombardier_beetle" },
      { count: 4, delay: 2200, interval: 700, type: "centipede" },
      { count: 3, delay: 2200, interval: 900, type: "mantis" },
      { count: 5, delay: 2000, interval: 650, type: "ant_soldier" },
      { count: 6, delay: 2000, interval: 500, type: "nomad" },
    ],
  ],

  sphinx: [
    // Wave 1: Sphinx guardians
    [
      { count: 5, interval: 850, type: "nomad" },
      { count: 3, delay: 4200, interval: 1000, type: "scorpion" },
      { count: 3, delay: 4000, interval: 800, type: "hexer" },
    ],
    // Wave 2: Desert swarm
    [
      { count: 6, interval: 650, type: "scarab" },
      { count: 3, delay: 3800, interval: 750, type: "crossbowman" },
      { count: 4, delay: 3500, interval: 700, type: "nomad" },
      { count: 3, delay: 3500, interval: 750, type: "cultist" },
    ],
    // Wave 3: Flying wave
    [
      { count: 3, interval: 1100, type: "wyvern" },
      { count: 4, delay: 3500, interval: 700, type: "harpy" },
      { count: 3, delay: 3200, interval: 900, type: "banshee" },
      { count: 4, delay: 3200, interval: 950, type: "scorpion" },
    ],
    // Wave 4: Sandworm pack
    [
      { count: 4, interval: 1100, type: "sandworm" },
      { count: 6, delay: 3000, interval: 550, type: "scarab" },
      { count: 4, delay: 3000, interval: 700, type: "berserker" },
      { count: 5, delay: 2800, interval: 600, type: "nomad" },
    ],
    // Wave 5: Ranged assault
    [
      { count: 5, interval: 700, type: "archer" },
      { count: 4, delay: 2800, interval: 800, type: "mage" },
      { count: 4, delay: 2600, interval: 800, type: "warlock" },
      { count: 4, delay: 2600, interval: 900, type: "scorpion" },
    ],
    // Wave 6: Plague wave
    [
      { count: 4, interval: 900, type: "plaguebearer" },
      { count: 4, delay: 2600, interval: 900, type: "infernal" },
      { count: 4, delay: 2500, interval: 750, type: "assassin" },
      { count: 4, delay: 2500, interval: 750, type: "specter" },
      { count: 4, delay: 2500, interval: 700, type: "manticore" },
      { count: 3, delay: 2500, interval: 800, type: "bombardier_beetle" },
    ],
    // Wave 7: Necromancer ritual
    [
      { count: 4, interval: 1300, type: "necromancer" },
      { count: 4, delay: 2500, interval: 1100, type: "shadow_knight" },
      { count: 7, delay: 2400, interval: 450, type: "scarab" },
      { count: 6, delay: 2400, interval: 550, type: "nomad" },
    ],
    // Wave 8: Professor boss
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 4, delay: 2400, interval: 1200, type: "gradstudent" },
      { count: 5, delay: 2200, interval: 850, type: "scorpion" },
      { count: 3, delay: 2200, interval: 1200, type: "catapult" },
    ],
    // Wave 9: Dean arrives
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 5, delay: 2200, interval: 850, type: "senior" },
      { count: 4, delay: 2200, interval: 950, type: "wyvern" },
      { count: 4, delay: 2000, interval: 1000, type: "sandworm" },
      { count: 8, delay: 2000, interval: 400, type: "scarab" },
      { count: 2, delay: 2200, interval: 1000, type: "basilisk" },
    ],
    // Wave 10: Dragon awakens
    [
      { count: 1, interval: 3200, type: "dragon" },
      { count: 3, delay: 2000, interval: 1600, type: "professor" },
      { count: 6, delay: 2000, interval: 750, type: "scorpion" },
      { count: 5, delay: 2000, interval: 650, type: "banshee" },
      { count: 7, delay: 2000, interval: 450, type: "nomad" },
    ],
    // Wave 11: Trustee arrival
    [
      { count: 1, interval: 3200, type: "trustee" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 4, delay: 2000, interval: 1000, type: "shadow_knight" },
      { count: 5, delay: 2000, interval: 750, type: "infernal" },
      { count: 8, delay: 2000, interval: 400, type: "scarab" },
    ],
    // Wave 12: Double Dean
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 1, delay: 2000, interval: 3200, type: "juggernaut" },
      { count: 5, delay: 2000, interval: 850, type: "wyvern" },
      { count: 6, delay: 2000, interval: 700, type: "scorpion" },
      { count: 5, delay: 2000, interval: 600, type: "berserker" },
      { count: 2, delay: 2200, interval: 1000, type: "phoenix" },
    ],
    // Wave 13: Double Trustee
    [
      { count: 3, interval: 2600, type: "trustee" },
      { count: 1, delay: 2000, interval: 2800, type: "dragon" },
      { count: 5, delay: 2000, interval: 900, type: "sandworm" },
      { count: 4, delay: 2000, interval: 1000, type: "necromancer" },
      { count: 8, delay: 2000, interval: 400, type: "nomad" },
    ],
    // Wave 14: FINALE
    [
      { count: 3, interval: 2200, type: "trustee" },
      { count: 3, delay: 2000, interval: 2000, type: "dragon" },
      { count: 3, delay: 2000, interval: 2000, type: "dean" },
      { count: 7, delay: 2000, interval: 600, type: "scorpion" },
      { count: 4, delay: 2000, interval: 1000, type: "catapult" },
      { count: 1, delay: 18_000, interval: 3200, type: "juggernaut" },
    ],
    // Wave 15: Desert death march
    [
      { count: 2, interval: 1800, type: "death_knight" },
      { count: 1, delay: 2200, interval: 2800, type: "lich" },
      { count: 4, delay: 2200, interval: 800, type: "hellhound" },
      { count: 5, delay: 2000, interval: 700, type: "skeleton_knight" },
      { count: 7, delay: 2000, interval: 450, type: "nomad" },
      { count: 2, delay: 2200, interval: 1000, type: "phoenix" },
      { count: 4, delay: 2000, interval: 700, type: "djinn" },
    ],
    // Wave 16: Herald of doom
    [
      { count: 1, interval: 3000, type: "doom_herald" },
      { count: 1, delay: 2200, interval: 3200, type: "abomination" },
      { count: 4, delay: 2200, interval: 900, type: "revenant" },
      { count: 3, delay: 2000, interval: 1100, type: "fallen_paladin" },
      { count: 8, delay: 2000, interval: 400, type: "scarab" },
    ],
    // Wave 17: THE MIDTERM SPHINX
    [
      { count: 1, interval: 5000, type: "sphinx_guardian" },
      { count: 2, delay: 3000, interval: 1800, type: "death_knight" },
      { count: 1, delay: 2000, interval: 2800, type: "skeleton_king" },
      { count: 6, delay: 2000, interval: 700, type: "skeleton_knight" },
      { count: 6, delay: 2000, interval: 700, type: "scorpion" },
    ],
    // Wave 18: Desert bug infestation
    [
      { count: 7, interval: 500, type: "locust" },
      { count: 3, delay: 2400, interval: 900, type: "mantis" },
      { count: 4, delay: 2200, interval: 800, type: "bombardier_beetle" },
      { count: 6, delay: 2000, interval: 600, type: "ant_soldier" },
      { count: 5, delay: 2000, interval: 650, type: "centipede" },
    ],
    // Wave 19: Brood mother's nest
    [
      { count: 1, interval: 3200, type: "brood_mother" },
      { count: 3, delay: 2600, interval: 900, type: "orb_weaver" },
      { count: 3, delay: 2400, interval: 850, type: "trapdoor_spider" },
      { count: 5, delay: 2200, interval: 600, type: "silk_moth" },
      { count: 4, delay: 2000, interval: 650, type: "dragonfly" },
      { count: 6, delay: 2000, interval: 500, type: "mosquito" },
    ],
  ],

  // =====================
  // WINTER REGION
  // Regional: snow_goblin, yeti, ice_witch, frostling
  // =====================
  glacier: [
    // Wave 1: Frozen intro
    [
      { count: 5, interval: 850, type: "snow_goblin" },
      { count: 3, delay: 4500, interval: 800, type: "frostling" },
      { count: 3, delay: 4000, interval: 850, type: "ice_witch" },
    ],
    // Wave 2: Frost rush
    [
      { count: 6, interval: 600, type: "frostling" },
      { count: 5, delay: 3800, interval: 650, type: "snow_goblin" },
      { count: 3, delay: 3500, interval: 750, type: "assassin" },
      { count: 3, delay: 3500, interval: 850, type: "ice_witch" },
      { count: 4, delay: 3500, interval: 650, type: "frost_tick" },
    ],
    // Wave 3: Flying intro
    [
      { count: 4, interval: 750, type: "mascot" },
      { count: 3, delay: 3500, interval: 800, type: "harpy" },
      { count: 4, delay: 3500, interval: 700, type: "frostling" },
      { count: 3, delay: 3500, interval: 850, type: "ice_witch" },
      { count: 3, delay: 3500, interval: 750, type: "snow_moth" },
    ],
    // Wave 4: Ranged barrage
    [
      { count: 4, interval: 750, type: "archer" },
      { count: 3, delay: 3200, interval: 850, type: "mage" },
      { count: 4, delay: 3200, interval: 950, type: "yeti" },
      { count: 3, delay: 3000, interval: 750, type: "crossbowman" },
      { count: 6, delay: 3000, interval: 500, type: "dire_wolf" },
    ],
    // Wave 5: Speed wave
    [
      { count: 3, interval: 800, type: "assassin" },
      { count: 4, delay: 3000, interval: 700, type: "berserker" },
      { count: 5, delay: 2800, interval: 600, type: "snow_goblin" },
      { count: 3, delay: 2800, interval: 800, type: "specter" },
    ],
    // Wave 6: Tank wall
    [
      { count: 3, interval: 1100, type: "senior" },
      { count: 4, delay: 2800, interval: 950, type: "yeti" },
      { count: 3, delay: 2600, interval: 900, type: "plaguebearer" },
      { count: 4, delay: 2600, interval: 800, type: "ice_witch" },
      { count: 3, delay: 2600, interval: 800, type: "frost_troll" },
      { count: 3, delay: 2600, interval: 850, type: "ice_beetle" },
    ],
    // Wave 7: Dark magic
    [
      { count: 3, interval: 1400, type: "necromancer" },
      { count: 3, delay: 2600, interval: 1200, type: "shadow_knight" },
      { count: 5, delay: 2500, interval: 600, type: "frostling" },
      { count: 3, delay: 2500, interval: 850, type: "warlock" },
    ],
    // Wave 8: Air dominance
    [
      { count: 3, interval: 1200, type: "wyvern" },
      { count: 4, delay: 2500, interval: 800, type: "banshee" },
      { count: 4, delay: 2400, interval: 900, type: "yeti" },
      { count: 4, delay: 2400, interval: 700, type: "harpy" },
      { count: 6, delay: 2400, interval: 500, type: "dire_wolf" },
    ],
    // Wave 9: Professor boss
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 3, delay: 2400, interval: 1300, type: "gradstudent" },
      { count: 6, delay: 2200, interval: 500, type: "snow_goblin" },
      { count: 3, delay: 2200, interval: 950, type: "infernal" },
    ],
    // Wave 10: Boss escalation
    [
      { count: 4, interval: 900, type: "senior" },
      { count: 4, delay: 2200, interval: 800, type: "junior" },
      { count: 5, delay: 2200, interval: 700, type: "ice_witch" },
      { count: 4, delay: 2200, interval: 650, type: "berserker" },
      { count: 4, delay: 2200, interval: 700, type: "frost_troll" },
    ],
    // Wave 11: Dean arrives
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 4, delay: 2200, interval: 950, type: "wyvern" },
      { count: 5, delay: 2000, interval: 850, type: "yeti" },
      { count: 5, delay: 2000, interval: 550, type: "frostling" },
      { count: 3, delay: 2000, interval: 1100, type: "shadow_knight" },
    ],
    // Wave 12: FINALE
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 6, delay: 2000, interval: 750, type: "yeti" },
      { count: 4, delay: 2000, interval: 1100, type: "necromancer" },
      { count: 8, delay: 2000, interval: 450, type: "snow_goblin" },
      { count: 5, delay: 2000, interval: 650, type: "banshee" },
      { count: 4, delay: 2000, interval: 700, type: "ice_witch" },
    ],
    // Wave 13: Frozen bones
    [
      { count: 6, interval: 600, type: "skeleton_footman" },
      { count: 4, delay: 2800, interval: 750, type: "zombie_shambler" },
      { count: 5, delay: 2600, interval: 600, type: "snow_goblin" },
      { count: 3, delay: 2600, interval: 800, type: "skeleton_archer" },
    ],
    // Wave 14: Wraith patrol
    [
      { count: 3, interval: 1000, type: "wraith" },
      { count: 3, delay: 2600, interval: 1100, type: "dark_knight" },
      { count: 5, delay: 2400, interval: 550, type: "frostling" },
      { count: 2, delay: 2400, interval: 1200, type: "bone_mage" },
      { count: 4, delay: 2400, interval: 900, type: "yeti" },
    ],
    // Wave 15: Frozen swarm
    [
      { count: 4, interval: 800, type: "ice_beetle" },
      { count: 5, delay: 2600, interval: 600, type: "frost_tick" },
      { count: 4, delay: 2400, interval: 700, type: "snow_moth" },
      { count: 5, delay: 2200, interval: 550, type: "frostling" },
      { count: 6, delay: 2200, interval: 500, type: "snow_goblin" },
    ],
  ],

  fortress: [
    // Wave 1: Fortress defenders
    [
      { count: 5, interval: 850, type: "snow_goblin" },
      { count: 3, delay: 4200, interval: 1000, type: "yeti" },
      { count: 3, delay: 4000, interval: 850, type: "ice_witch" },
    ],
    // Wave 2: Ranged intro
    [
      { count: 4, interval: 750, type: "archer" },
      { count: 4, delay: 3800, interval: 700, type: "frostling" },
      { count: 3, delay: 3500, interval: 750, type: "crossbowman" },
      { count: 4, delay: 3500, interval: 700, type: "snow_goblin" },
      { count: 3, delay: 3500, interval: 650, type: "frost_tick" },
    ],
    // Wave 3: Flying wave
    [
      { count: 4, interval: 750, type: "harpy" },
      { count: 3, delay: 3500, interval: 900, type: "banshee" },
      { count: 3, delay: 3200, interval: 1100, type: "wyvern" },
      { count: 3, delay: 3200, interval: 950, type: "yeti" },
      { count: 3, delay: 3200, interval: 750, type: "snow_moth" },
    ],
    // Wave 4: Blizzard air raid
    [
      { count: 4, interval: 1000, type: "wyvern" },
      { count: 5, delay: 3200, interval: 650, type: "harpy" },
      { count: 4, delay: 3000, interval: 750, type: "banshee" },
      { count: 4, delay: 2800, interval: 800, type: "ice_witch" },
    ],
    // Wave 5: Speed assault
    [
      { count: 4, interval: 750, type: "assassin" },
      { count: 4, delay: 2800, interval: 700, type: "berserker" },
      { count: 5, delay: 2800, interval: 600, type: "frostling" },
      { count: 3, delay: 2800, interval: 800, type: "specter" },
      { count: 6, delay: 2800, interval: 500, type: "dire_wolf" },
    ],
    // Wave 6: Ranged barrage
    [
      { count: 4, interval: 850, type: "mage" },
      { count: 4, delay: 2600, interval: 800, type: "warlock" },
      { count: 5, delay: 2600, interval: 650, type: "archer" },
      { count: 5, delay: 2500, interval: 600, type: "snow_goblin" },
    ],
    // Wave 7: Dark convergence
    [
      { count: 4, interval: 1300, type: "necromancer" },
      { count: 3, delay: 2500, interval: 1200, type: "shadow_knight" },
      { count: 5, delay: 2400, interval: 850, type: "yeti" },
      { count: 3, delay: 2400, interval: 950, type: "infernal" },
      { count: 4, delay: 2400, interval: 700, type: "frost_troll" },
      { count: 3, delay: 2400, interval: 850, type: "ice_beetle" },
    ],
    // Wave 8: Professor boss
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 3, delay: 2400, interval: 1300, type: "gradstudent" },
      { count: 4, delay: 2200, interval: 950, type: "wyvern" },
      { count: 5, delay: 2200, interval: 700, type: "ice_witch" },
    ],
    // Wave 9: Dean arrives
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 5, delay: 2200, interval: 850, type: "senior" },
      { count: 5, delay: 2200, interval: 850, type: "yeti" },
      { count: 4, delay: 2000, interval: 700, type: "banshee" },
      { count: 5, delay: 2000, interval: 550, type: "frostling" },
    ],
    // Wave 10: Shadow convergence
    [
      { count: 4, interval: 1100, type: "shadow_knight" },
      { count: 4, delay: 2200, interval: 1200, type: "necromancer" },
      { count: 5, delay: 2000, interval: 800, type: "yeti" },
      { count: 5, delay: 2000, interval: 700, type: "specter" },
      { count: 7, delay: 2000, interval: 450, type: "snow_goblin" },
      { count: 1, delay: 2200, interval: 1200, type: "mammoth" },
    ],
    // Wave 11: Juggernaut push
    [
      { count: 1, interval: 3200, type: "juggernaut" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 4, delay: 2000, interval: 900, type: "wyvern" },
      { count: 5, delay: 2000, interval: 700, type: "ice_witch" },
      { count: 5, delay: 2000, interval: 600, type: "harpy" },
    ],
    // Wave 12: Double Dean
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 3, delay: 2000, interval: 1600, type: "professor" },
      { count: 6, delay: 2000, interval: 750, type: "yeti" },
      { count: 4, delay: 2000, interval: 800, type: "infernal" },
      { count: 5, delay: 2000, interval: 600, type: "berserker" },
    ],
    // Wave 13: Trustee arrival
    [
      { count: 1, interval: 3200, type: "trustee" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 4, delay: 2000, interval: 1000, type: "shadow_knight" },
      { count: 6, delay: 2000, interval: 500, type: "frostling" },
      { count: 8, delay: 2000, interval: 400, type: "snow_goblin" },
      { count: 2, delay: 2000, interval: 1000, type: "wendigo" },
    ],
    // Wave 14: FINALE
    [
      { count: 3, interval: 2600, type: "trustee" },
      { count: 3, delay: 2000, interval: 2200, type: "dean" },
      { count: 7, delay: 2000, interval: 700, type: "yeti" },
      { count: 1, delay: 2000, interval: 2800, type: "dragon" },
      { count: 4, delay: 2000, interval: 1000, type: "necromancer" },
      { count: 1, delay: 15_000, interval: 3200, type: "juggernaut" },
    ],
    // Wave 15: Undead siege
    [
      { count: 5, interval: 750, type: "skeleton_knight" },
      { count: 3, delay: 2400, interval: 1100, type: "fallen_paladin" },
      { count: 3, delay: 2200, interval: 1000, type: "zombie_brute" },
      { count: 5, delay: 2200, interval: 800, type: "yeti" },
      { count: 3, delay: 2200, interval: 1000, type: "dark_knight" },
    ],
    // Wave 16: Dark convergence
    [
      { count: 1, interval: 2800, type: "lich" },
      { count: 3, delay: 2400, interval: 1000, type: "bone_mage" },
      { count: 3, delay: 2200, interval: 1000, type: "dark_priest" },
      { count: 3, delay: 2200, interval: 1000, type: "revenant" },
      { count: 6, delay: 2000, interval: 500, type: "frostling" },
      { count: 7, delay: 2000, interval: 450, type: "snow_goblin" },
    ],
    // Wave 17: Ice bug swarm
    [
      { count: 4, interval: 800, type: "ice_beetle" },
      { count: 5, delay: 2400, interval: 600, type: "frost_tick" },
      { count: 4, delay: 2200, interval: 700, type: "snow_moth" },
      { count: 3, delay: 2200, interval: 800, type: "ice_witch" },
      { count: 6, delay: 2000, interval: 500, type: "frostling" },
    ],
    // Wave 18: Brood mother of the frost
    [
      { count: 1, interval: 3200, type: "brood_mother" },
      { count: 3, delay: 2600, interval: 850, type: "ice_beetle" },
      { count: 5, delay: 2200, interval: 600, type: "frost_tick" },
      { count: 4, delay: 2000, interval: 700, type: "snow_moth" },
      { count: 4, delay: 2000, interval: 850, type: "yeti" },
    ],
  ],

  peak: [
    // Wave 1: Summit scouts
    [
      { count: 5, interval: 800, type: "frostling" },
      { count: 4, delay: 4500, interval: 750, type: "snow_goblin" },
      { count: 3, delay: 4000, interval: 850, type: "ice_witch" },
    ],
    // Wave 2: Yeti patrol
    [
      { count: 3, interval: 1050, type: "yeti" },
      { count: 3, delay: 4000, interval: 800, type: "hexer" },
      { count: 4, delay: 3800, interval: 700, type: "frostling" },
      { count: 3, delay: 3800, interval: 750, type: "cultist" },
      { count: 3, delay: 3800, interval: 650, type: "frost_tick" },
    ],
    // Wave 3: Flying scouts
    [
      { count: 4, interval: 750, type: "harpy" },
      { count: 3, delay: 3500, interval: 1100, type: "wyvern" },
      { count: 5, delay: 3500, interval: 650, type: "snow_goblin" },
      { count: 3, delay: 3500, interval: 800, type: "mascot" },
      { count: 3, delay: 3500, interval: 700, type: "snow_moth" },
    ],
    // Wave 4: Ranged barrage
    [
      { count: 4, interval: 750, type: "crossbowman" },
      { count: 4, delay: 3200, interval: 800, type: "mage" },
      { count: 4, delay: 3200, interval: 950, type: "yeti" },
      { count: 4, delay: 3000, interval: 700, type: "archer" },
    ],
    // Wave 5: Melee rush
    [
      { count: 4, interval: 700, type: "berserker" },
      { count: 4, delay: 3000, interval: 750, type: "assassin" },
      { count: 4, delay: 2800, interval: 800, type: "ice_witch" },
      { count: 3, delay: 2800, interval: 800, type: "specter" },
      { count: 4, delay: 2800, interval: 700, type: "frost_troll" },
      { count: 3, delay: 2800, interval: 850, type: "ice_beetle" },
    ],
    // Wave 6: Dark magic
    [
      { count: 3, interval: 1400, type: "necromancer" },
      { count: 3, delay: 2800, interval: 1200, type: "shadow_knight" },
      { count: 5, delay: 2600, interval: 600, type: "frostling" },
      { count: 4, delay: 2600, interval: 800, type: "warlock" },
    ],
    // Wave 7: Tank siege
    [
      { count: 4, interval: 1000, type: "senior" },
      { count: 5, delay: 2600, interval: 850, type: "yeti" },
      { count: 3, delay: 2500, interval: 900, type: "plaguebearer" },
      { count: 6, delay: 2500, interval: 550, type: "snow_goblin" },
    ],
    // Wave 8: Professor boss
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 4, delay: 2500, interval: 1200, type: "gradstudent" },
      { count: 4, delay: 2400, interval: 950, type: "wyvern" },
      { count: 3, delay: 2400, interval: 950, type: "infernal" },
    ],
    // Wave 9: Air dominance
    [
      { count: 4, interval: 1000, type: "wyvern" },
      { count: 4, delay: 2400, interval: 800, type: "banshee" },
      { count: 5, delay: 2200, interval: 650, type: "harpy" },
      { count: 5, delay: 2200, interval: 800, type: "yeti" },
      { count: 4, delay: 2200, interval: 750, type: "ice_witch" },
      { count: 8, delay: 2200, interval: 450, type: "dire_wolf" },
      { count: 4, delay: 2000, interval: 700, type: "frost_troll" },
    ],
    // Wave 10: Dean arrives
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 5, delay: 2200, interval: 850, type: "senior" },
      { count: 4, delay: 2200, interval: 1000, type: "shadow_knight" },
      { count: 6, delay: 2000, interval: 500, type: "frostling" },
      { count: 7, delay: 2000, interval: 450, type: "snow_goblin" },
    ],
    // Wave 11: Trustee arrival
    [
      { count: 1, interval: 3200, type: "trustee" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 5, delay: 2000, interval: 800, type: "yeti" },
      { count: 1, delay: 2000, interval: 2800, type: "dragon" },
      { count: 4, delay: 2000, interval: 1100, type: "necromancer" },
    ],
    // Wave 12: Double Dean
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 1, delay: 2000, interval: 3200, type: "juggernaut" },
      { count: 5, delay: 2000, interval: 850, type: "wyvern" },
      { count: 5, delay: 2000, interval: 700, type: "ice_witch" },
      { count: 5, delay: 2000, interval: 600, type: "berserker" },
    ],
    // Wave 13: Golem awakens
    [
      { count: 1, interval: 2600, type: "golem" },
      { count: 3, delay: 2000, interval: 1800, type: "professor" },
      { count: 6, delay: 2000, interval: 750, type: "yeti" },
      { count: 4, delay: 2000, interval: 800, type: "infernal" },
      { count: 5, delay: 2000, interval: 650, type: "specter" },
      { count: 2, delay: 2000, interval: 1000, type: "mammoth" },
    ],
    // Wave 14: Double Trustee
    [
      { count: 3, interval: 2600, type: "trustee" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 5, delay: 2000, interval: 950, type: "shadow_knight" },
      { count: 6, delay: 2000, interval: 500, type: "frostling" },
      { count: 8, delay: 2000, interval: 400, type: "snow_goblin" },
    ],
    // Wave 15: Dragon flight
    [
      { count: 3, interval: 2200, type: "dragon" },
      { count: 1, delay: 2000, interval: 2800, type: "trustee" },
      { count: 7, delay: 2000, interval: 700, type: "yeti" },
      { count: 5, delay: 2000, interval: 800, type: "wyvern" },
      { count: 3, delay: 2000, interval: 1200, type: "catapult" },
    ],
    // Wave 16: FINALE
    [
      { count: 3, interval: 2800, type: "golem" },
      { count: 3, delay: 2000, interval: 2200, type: "trustee" },
      { count: 8, delay: 2000, interval: 650, type: "yeti" },
      { count: 3, delay: 2000, interval: 2000, type: "dragon" },
      { count: 3, delay: 2000, interval: 2000, type: "dean" },
      { count: 3, delay: 15_000, interval: 2400, type: "juggernaut" },
      { count: 2, delay: 2000, interval: 1000, type: "wendigo" },
      { count: 2, delay: 2000, interval: 1000, type: "mammoth" },
    ],
    // Wave 17: Death knight vanguard
    [
      { count: 2, interval: 1800, type: "death_knight" },
      { count: 3, delay: 2200, interval: 1200, type: "black_guard" },
      { count: 3, delay: 2200, interval: 1100, type: "fallen_paladin" },
      { count: 5, delay: 2000, interval: 700, type: "skeleton_knight" },
      { count: 6, delay: 2000, interval: 750, type: "yeti" },
    ],
    // Wave 18: Abomination rampage
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 1, delay: 2200, interval: 2800, type: "doom_herald" },
      { count: 4, delay: 2200, interval: 800, type: "hellhound" },
      { count: 3, delay: 2000, interval: 1000, type: "revenant" },
      { count: 5, delay: 2000, interval: 700, type: "ice_witch" },
      { count: 8, delay: 2000, interval: 400, type: "snow_goblin" },
    ],
    // Wave 19: THE JANUARY TITAN
    [
      { count: 1, interval: 5000, type: "frost_colossus" },
      { count: 2, delay: 3000, interval: 1800, type: "death_knight" },
      { count: 1, delay: 2000, interval: 2800, type: "lich" },
      { count: 6, delay: 2000, interval: 700, type: "skeleton_knight" },
      { count: 8, delay: 2000, interval: 400, type: "frostling" },
    ],
    // Wave 20: Frozen bug plague
    [
      { count: 5, interval: 750, type: "ice_beetle" },
      { count: 6, delay: 2200, interval: 550, type: "frost_tick" },
      { count: 5, delay: 2000, interval: 650, type: "snow_moth" },
      { count: 6, delay: 2000, interval: 500, type: "snow_goblin" },
      { count: 4, delay: 2000, interval: 700, type: "centipede" },
    ],
    // Wave 21: Brood mother of the peaks
    [
      { count: 1, interval: 3200, type: "brood_mother" },
      { count: 4, delay: 2400, interval: 800, type: "ice_beetle" },
      { count: 5, delay: 2200, interval: 600, type: "frost_tick" },
      { count: 4, delay: 2000, interval: 700, type: "snow_moth" },
      { count: 5, delay: 2000, interval: 800, type: "yeti" },
      { count: 6, delay: 2000, interval: 500, type: "dire_wolf" },
    ],
  ],

  // =====================
  // VOLCANIC REGION
  // Regional: magma_spawn, fire_imp, ember_guard
  // =====================
  lava: [
    // Wave 1: Volcanic intro
    [
      { count: 5, interval: 850, type: "fire_imp" },
      { count: 3, delay: 4500, interval: 900, type: "magma_spawn" },
      { count: 3, delay: 4000, interval: 800, type: "cultist" },
    ],
    // Wave 2: Ember guard intro
    [
      { count: 3, interval: 1000, type: "ember_guard" },
      { count: 4, delay: 4000, interval: 750, type: "fire_imp" },
      { count: 3, delay: 3800, interval: 800, type: "hexer" },
      { count: 3, delay: 3800, interval: 900, type: "infernal" },
    ],
    // Wave 3: Berserker rush
    [
      { count: 5, interval: 650, type: "berserker" },
      { count: 4, delay: 3200, interval: 750, type: "assassin" },
      { count: 6, delay: 3000, interval: 550, type: "fire_imp" },
      { count: 4, delay: 3000, interval: 800, type: "magma_spawn" },
      { count: 4, delay: 3000, interval: 650, type: "fire_ant" },
    ],
    // Wave 4: Ranged barrage
    [
      { count: 4, interval: 750, type: "archer" },
      { count: 4, delay: 3200, interval: 850, type: "mage" },
      { count: 4, delay: 3000, interval: 900, type: "ember_guard" },
      { count: 3, delay: 3000, interval: 850, type: "warlock" },
      { count: 6, delay: 3000, interval: 500, type: "salamander" },
      { count: 3, delay: 3000, interval: 850, type: "magma_beetle" },
    ],
    // Wave 5: Berserker charge
    [
      { count: 5, interval: 650, type: "berserker" },
      { count: 3, delay: 3000, interval: 800, type: "assassin" },
      { count: 4, delay: 2800, interval: 800, type: "magma_spawn" },
      { count: 5, delay: 2800, interval: 600, type: "fire_imp" },
    ],
    // Wave 6: Dark forces
    [
      { count: 3, interval: 1400, type: "necromancer" },
      { count: 3, delay: 2800, interval: 1200, type: "shadow_knight" },
      { count: 4, delay: 2600, interval: 750, type: "specter" },
      { count: 4, delay: 2600, interval: 900, type: "ember_guard" },
      { count: 3, delay: 2600, interval: 800, type: "volcanic_drake" },
    ],
    // Wave 7: Professor boss
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 3, delay: 2600, interval: 1300, type: "gradstudent" },
      { count: 3, delay: 2500, interval: 1100, type: "wyvern" },
      { count: 4, delay: 2500, interval: 850, type: "infernal" },
    ],
    // Wave 8: Dean arrives
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 4, delay: 2400, interval: 900, type: "senior" },
      { count: 5, delay: 2400, interval: 800, type: "ember_guard" },
      { count: 3, delay: 2200, interval: 900, type: "plaguebearer" },
      { count: 6, delay: 2200, interval: 500, type: "fire_imp" },
      { count: 8, delay: 2200, interval: 450, type: "salamander" },
    ],
    // Wave 9: Air dominance
    [
      { count: 4, interval: 1000, type: "wyvern" },
      { count: 5, delay: 2200, interval: 650, type: "harpy" },
      { count: 4, delay: 2200, interval: 750, type: "banshee" },
      { count: 5, delay: 2000, interval: 800, type: "magma_spawn" },
      { count: 3, delay: 2000, interval: 700, type: "ash_moth" },
    ],
    // Wave 10: Trustee arrival
    [
      { count: 1, interval: 3200, type: "trustee" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 5, delay: 2000, interval: 800, type: "ember_guard" },
      { count: 1, delay: 2000, interval: 2800, type: "dragon" },
      { count: 4, delay: 2000, interval: 1000, type: "shadow_knight" },
      { count: 3, delay: 2200, interval: 800, type: "volcanic_drake" },
    ],
    // Wave 11: Shadow convergence
    [
      { count: 4, interval: 1100, type: "shadow_knight" },
      { count: 4, delay: 2000, interval: 1200, type: "necromancer" },
      { count: 5, delay: 2000, interval: 750, type: "infernal" },
      { count: 7, delay: 2000, interval: 450, type: "fire_imp" },
      { count: 5, delay: 2000, interval: 650, type: "specter" },
    ],
    // Wave 12: Double Dean
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 1, delay: 2000, interval: 3200, type: "juggernaut" },
      { count: 4, delay: 2000, interval: 900, type: "wyvern" },
      { count: 6, delay: 2000, interval: 700, type: "ember_guard" },
      { count: 6, delay: 2000, interval: 650, type: "magma_spawn" },
    ],
    // Wave 13: Double Trustee
    [
      { count: 3, interval: 2600, type: "trustee" },
      { count: 1, delay: 2000, interval: 2800, type: "dragon" },
      { count: 6, delay: 2000, interval: 700, type: "ember_guard" },
      { count: 5, delay: 2000, interval: 600, type: "berserker" },
      { count: 8, delay: 2000, interval: 400, type: "fire_imp" },
    ],
    // Wave 14: FINALE
    [
      { count: 3, interval: 2200, type: "trustee" },
      { count: 3, delay: 2000, interval: 2000, type: "dragon" },
      { count: 3, delay: 2000, interval: 2000, type: "dean" },
      { count: 7, delay: 2000, interval: 600, type: "ember_guard" },
      { count: 1, delay: 2000, interval: 3200, type: "juggernaut" },
      { count: 1, delay: 18_000, interval: 2600, type: "golem" },
    ],
    // Wave 15: Hellhound pack
    [
      { count: 4, interval: 850, type: "hellhound" },
      { count: 3, delay: 2600, interval: 1000, type: "revenant" },
      { count: 6, delay: 2400, interval: 500, type: "fire_imp" },
      { count: 4, delay: 2400, interval: 800, type: "skeleton_knight" },
    ],
    // Wave 16: Dark knight charge
    [
      { count: 4, interval: 1000, type: "dark_knight" },
      { count: 3, delay: 2400, interval: 1100, type: "fallen_paladin" },
      { count: 5, delay: 2200, interval: 750, type: "ember_guard" },
      { count: 3, delay: 2200, interval: 1000, type: "zombie_brute" },
      { count: 6, delay: 2200, interval: 600, type: "magma_spawn" },
    ],
    // Wave 17: Volcanic bug swarm
    [
      { count: 6, interval: 550, type: "fire_ant" },
      { count: 4, delay: 2400, interval: 800, type: "magma_beetle" },
      { count: 4, delay: 2200, interval: 700, type: "ash_moth" },
      { count: 5, delay: 2000, interval: 550, type: "fire_imp" },
      { count: 5, delay: 2000, interval: 550, type: "salamander" },
    ],
  ],

  crater: [
    // Wave 1: Caldera scouts
    [
      { count: 5, interval: 850, type: "fire_imp" },
      { count: 3, delay: 4200, interval: 950, type: "ember_guard" },
      { count: 3, delay: 4000, interval: 900, type: "infernal" },
    ],
    // Wave 2: Magma threat
    [
      { count: 4, interval: 850, type: "magma_spawn" },
      { count: 3, delay: 3800, interval: 800, type: "hexer" },
      { count: 4, delay: 3500, interval: 700, type: "fire_imp" },
      { count: 3, delay: 3500, interval: 750, type: "cultist" },
    ],
    // Wave 3: Flying assault
    [
      { count: 4, interval: 750, type: "harpy" },
      { count: 3, delay: 3500, interval: 1100, type: "wyvern" },
      { count: 3, delay: 3200, interval: 900, type: "banshee" },
      { count: 4, delay: 3200, interval: 900, type: "ember_guard" },
      { count: 3, delay: 3200, interval: 750, type: "ash_moth" },
    ],
    // Wave 4: Ranged barrage
    [
      { count: 4, interval: 850, type: "mage" },
      { count: 4, delay: 3200, interval: 700, type: "archer" },
      { count: 3, delay: 3000, interval: 850, type: "warlock" },
      { count: 3, delay: 3000, interval: 750, type: "crossbowman" },
    ],
    // Wave 5: Melee rush
    [
      { count: 4, interval: 750, type: "assassin" },
      { count: 5, delay: 2800, interval: 650, type: "berserker" },
      { count: 4, delay: 2800, interval: 800, type: "magma_spawn" },
      { count: 5, delay: 2600, interval: 600, type: "fire_imp" },
      { count: 6, delay: 2600, interval: 500, type: "salamander" },
      { count: 4, delay: 2600, interval: 650, type: "fire_ant" },
    ],
    // Wave 6: Plague and shadow
    [
      { count: 3, interval: 900, type: "plaguebearer" },
      { count: 3, delay: 2600, interval: 1300, type: "necromancer" },
      { count: 3, delay: 2600, interval: 1200, type: "shadow_knight" },
      { count: 4, delay: 2500, interval: 850, type: "infernal" },
    ],
    // Wave 7: Tank wall
    [
      { count: 4, interval: 1000, type: "senior" },
      { count: 5, delay: 2500, interval: 850, type: "ember_guard" },
      { count: 4, delay: 2400, interval: 750, type: "specter" },
      { count: 6, delay: 2400, interval: 500, type: "fire_imp" },
      { count: 4, delay: 2400, interval: 700, type: "volcanic_drake" },
      { count: 3, delay: 2400, interval: 850, type: "magma_beetle" },
    ],
    // Wave 8: Professor boss
    [
      { count: 3, interval: 2000, type: "professor" },
      { count: 4, delay: 2400, interval: 1200, type: "gradstudent" },
      { count: 4, delay: 2200, interval: 950, type: "wyvern" },
      { count: 5, delay: 2200, interval: 800, type: "magma_spawn" },
    ],
    // Wave 9: Dean arrives
    [
      { count: 1, interval: 3200, type: "dean" },
      { count: 5, delay: 2200, interval: 850, type: "senior" },
      { count: 5, delay: 2200, interval: 800, type: "ember_guard" },
      { count: 5, delay: 2000, interval: 650, type: "harpy" },
      { count: 4, delay: 2000, interval: 800, type: "infernal" },
    ],
    // Wave 10: Trustee arrival
    [
      { count: 1, interval: 3200, type: "trustee" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 1, delay: 2000, interval: 2800, type: "dragon" },
      { count: 4, delay: 2000, interval: 1000, type: "shadow_knight" },
      { count: 7, delay: 2000, interval: 450, type: "fire_imp" },
      { count: 1, delay: 2200, interval: 1200, type: "lava_golem" },
    ],
    // Wave 11: Air superiority
    [
      { count: 5, interval: 950, type: "wyvern" },
      { count: 5, delay: 2000, interval: 700, type: "banshee" },
      { count: 5, delay: 2000, interval: 800, type: "ember_guard" },
      { count: 4, delay: 2000, interval: 1100, type: "necromancer" },
      { count: 5, delay: 2000, interval: 700, type: "magma_spawn" },
    ],
    // Wave 12: Juggernaut push
    [
      { count: 1, interval: 3200, type: "juggernaut" },
      { count: 1, delay: 2000, interval: 2600, type: "dean" },
      { count: 3, delay: 2000, interval: 1200, type: "catapult" },
      { count: 5, delay: 2000, interval: 600, type: "berserker" },
      { count: 8, delay: 2000, interval: 400, type: "fire_imp" },
    ],
    // Wave 13: Double Dean
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 3, delay: 2400, interval: 1600, type: "professor" },
      { count: 6, delay: 1800, interval: 700, type: "ember_guard" },
      { count: 5, delay: 2200, interval: 800, type: "wyvern" },
      { count: 5, delay: 1600, interval: 700, type: "infernal" },
      { count: 4, delay: 1800, interval: 700, type: "volcanic_drake" },
    ],
    // Wave 14: Golem awakens
    [
      { count: 1, interval: 2600, type: "golem" },
      { count: 1, delay: 2800, interval: 2800, type: "trustee" },
      { count: 1, delay: 1400, interval: 2800, type: "dragon" },
      { count: 5, delay: 2200, interval: 900, type: "shadow_knight" },
      { count: 6, delay: 1600, interval: 650, type: "magma_spawn" },
    ],
    // Wave 15: Double Trustee
    [
      { count: 3, interval: 2600, type: "trustee" },
      { count: 3, delay: 2000, interval: 2200, type: "dean" },
      { count: 7, delay: 2000, interval: 650, type: "ember_guard" },
      { count: 3, delay: 2000, interval: 2000, type: "dragon" },
      { count: 6, delay: 2000, interval: 600, type: "specter" },
    ],
    // Wave 16: FINALE
    [
      { count: 3, interval: 2200, type: "trustee" },
      { count: 3, delay: 2000, interval: 2000, type: "dragon" },
      { count: 3, delay: 2000, interval: 2800, type: "golem" },
      { count: 8, delay: 2000, interval: 550, type: "ember_guard" },
      { count: 3, delay: 2000, interval: 2000, type: "dean" },
      { count: 1, delay: 18_000, interval: 3200, type: "juggernaut" },
    ],
    // Wave 17: Fallen army
    [
      { count: 3, interval: 1100, type: "fallen_paladin" },
      { count: 2, delay: 2200, interval: 1600, type: "death_knight" },
      { count: 1, delay: 2200, interval: 3200, type: "abomination" },
      { count: 6, delay: 2000, interval: 650, type: "magma_spawn" },
      { count: 4, delay: 2000, interval: 1000, type: "dark_knight" },
    ],
    // Wave 18: Doom herald descent
    [
      { count: 1, interval: 3000, type: "doom_herald" },
      { count: 1, delay: 2200, interval: 2800, type: "lich" },
      { count: 4, delay: 2200, interval: 800, type: "hellhound" },
      { count: 6, delay: 2000, interval: 700, type: "ember_guard" },
      { count: 4, delay: 2000, interval: 900, type: "revenant" },
    ],
    // Wave 19: Volcanic bug infestation
    [
      { count: 6, interval: 550, type: "fire_ant" },
      { count: 4, delay: 2400, interval: 800, type: "magma_beetle" },
      { count: 4, delay: 2200, interval: 700, type: "ash_moth" },
      { count: 3, delay: 2000, interval: 850, type: "bombardier_beetle" },
      { count: 4, delay: 2000, interval: 700, type: "centipede" },
      { count: 4, delay: 2000, interval: 800, type: "ember_guard" },
    ],
    // Wave 20: Brood mother of the caldera
    [
      { count: 1, interval: 3200, type: "brood_mother" },
      { count: 5, delay: 2400, interval: 600, type: "fire_ant" },
      { count: 3, delay: 2200, interval: 850, type: "magma_beetle" },
      { count: 4, delay: 2000, interval: 700, type: "ash_moth" },
      { count: 6, delay: 2000, interval: 500, type: "fire_imp" },
      { count: 5, delay: 2000, interval: 650, type: "magma_spawn" },
    ],
  ],

  throne: [
    // Wave 1: Throne approach
    [
      { count: 5, interval: 850, type: "fire_imp" },
      { count: 3, delay: 4200, interval: 900, type: "magma_spawn" },
      { count: 3, delay: 4000, interval: 900, type: "infernal" },
    ],
    // Wave 2: Ember vanguard
    [
      { count: 4, interval: 900, type: "ember_guard" },
      { count: 3, delay: 3800, interval: 800, type: "hexer" },
      { count: 4, delay: 3500, interval: 700, type: "fire_imp" },
      { count: 3, delay: 3500, interval: 750, type: "cultist" },
    ],
    // Wave 3: Flying wave
    [
      { count: 3, interval: 1100, type: "wyvern" },
      { count: 4, delay: 3500, interval: 700, type: "harpy" },
      { count: 3, delay: 3200, interval: 900, type: "banshee" },
      { count: 4, delay: 3200, interval: 800, type: "magma_spawn" },
      { count: 3, delay: 3200, interval: 750, type: "ash_moth" },
    ],
    // Wave 4: Tank wall
    [
      { count: 4, interval: 1000, type: "senior" },
      { count: 4, delay: 3200, interval: 900, type: "ember_guard" },
      { count: 4, delay: 3000, interval: 800, type: "junior" },
      { count: 4, delay: 3000, interval: 850, type: "infernal" },
      { count: 3, delay: 3000, interval: 900, type: "magma_beetle" },
    ],
    // Wave 5: Ranged barrage
    [
      { count: 5, interval: 700, type: "archer" },
      { count: 5, delay: 2800, interval: 750, type: "mage" },
      { count: 4, delay: 2800, interval: 800, type: "warlock" },
      { count: 3, delay: 2600, interval: 750, type: "crossbowman" },
    ],
    // Wave 6: Speed assault
    [
      { count: 5, interval: 700, type: "assassin" },
      { count: 5, delay: 2600, interval: 650, type: "berserker" },
      { count: 6, delay: 2600, interval: 500, type: "fire_imp" },
      { count: 4, delay: 2500, interval: 750, type: "specter" },
      { count: 8, delay: 2500, interval: 450, type: "salamander" },
      { count: 5, delay: 2500, interval: 600, type: "fire_ant" },
    ],
    // Wave 7: Dark convergence
    [
      { count: 4, interval: 1300, type: "necromancer" },
      { count: 4, delay: 2500, interval: 1100, type: "shadow_knight" },
      { count: 5, delay: 2400, interval: 800, type: "ember_guard" },
      { count: 4, delay: 2400, interval: 800, type: "plaguebearer" },
    ],
    // Wave 8: Professor boss
    [
      { count: 4, interval: 1800, type: "professor" },
      { count: 4, delay: 2400, interval: 1200, type: "gradstudent" },
      { count: 4, delay: 2200, interval: 950, type: "wyvern" },
      { count: 5, delay: 2200, interval: 750, type: "magma_spawn" },
    ],
    // Wave 9: Dean arrives
    [
      { count: 3, interval: 2400, type: "dean" },
      { count: 5, delay: 2200, interval: 850, type: "senior" },
      { count: 1, delay: 2200, interval: 2800, type: "dragon" },
      { count: 5, delay: 2000, interval: 750, type: "ember_guard" },
      { count: 7, delay: 2000, interval: 450, type: "fire_imp" },
      { count: 4, delay: 2000, interval: 700, type: "volcanic_drake" },
    ],
    // Wave 10: Air dominance
    [
      { count: 5, interval: 950, type: "wyvern" },
      { count: 6, delay: 2000, interval: 600, type: "harpy" },
      { count: 5, delay: 2000, interval: 700, type: "banshee" },
      { count: 5, delay: 2000, interval: 750, type: "infernal" },
      { count: 6, delay: 2000, interval: 650, type: "magma_spawn" },
    ],
    // Wave 11: Trustee arrival
    [
      { count: 1, interval: 3200, type: "trustee" },
      { count: 3, delay: 2000, interval: 2200, type: "dean" },
      { count: 3, delay: 2000, interval: 2000, type: "dragon" },
      { count: 4, delay: 2000, interval: 1000, type: "shadow_knight" },
      { count: 6, delay: 2000, interval: 650, type: "ember_guard" },
    ],
    // Wave 12: Golem awakens
    [
      { count: 3, interval: 2800, type: "golem" },
      { count: 1, delay: 2000, interval: 3200, type: "juggernaut" },
      { count: 4, delay: 2000, interval: 1100, type: "necromancer" },
      { count: 3, delay: 2000, interval: 1200, type: "catapult" },
      { count: 8, delay: 2000, interval: 400, type: "fire_imp" },
      { count: 2, delay: 2200, interval: 1000, type: "lava_golem" },
    ],
    // Wave 13: Double Dean
    [
      { count: 3, interval: 2200, type: "dean" },
      { count: 4, delay: 2000, interval: 1400, type: "professor" },
      { count: 5, delay: 2000, interval: 800, type: "wyvern" },
      { count: 5, delay: 2000, interval: 600, type: "berserker" },
      { count: 7, delay: 2000, interval: 550, type: "magma_spawn" },
    ],
    // Wave 14: Double Trustee
    [
      { count: 3, interval: 2600, type: "trustee" },
      { count: 3, delay: 2000, interval: 2000, type: "dragon" },
      { count: 5, delay: 2000, interval: 900, type: "shadow_knight" },
      { count: 7, delay: 2000, interval: 600, type: "ember_guard" },
      { count: 5, delay: 2000, interval: 700, type: "infernal" },
    ],
    // Wave 15: Dragon flight
    [
      { count: 4, interval: 2000, type: "dragon" },
      { count: 1, delay: 2000, interval: 2800, type: "trustee" },
      { count: 5, delay: 2000, interval: 800, type: "wyvern" },
      { count: 1, delay: 2000, interval: 2600, type: "golem" },
      { count: 6, delay: 2000, interval: 600, type: "specter" },
    ],
    // Wave 16: Triple Trustee
    [
      { count: 4, interval: 2200, type: "trustee" },
      { count: 3, delay: 2000, interval: 2800, type: "golem" },
      { count: 8, delay: 2000, interval: 550, type: "ember_guard" },
      { count: 5, delay: 2000, interval: 1000, type: "necromancer" },
      { count: 10, delay: 2000, interval: 350, type: "fire_imp" },
      { count: 2, delay: 2000, interval: 1000, type: "lava_golem" },
      { count: 5, delay: 2000, interval: 700, type: "volcanic_drake" },
    ],
    // Wave 17: Ultimate assault
    [
      { count: 4, interval: 2200, type: "trustee" },
      { count: 3, delay: 2000, interval: 2000, type: "dean" },
      { count: 3, delay: 2000, interval: 2400, type: "juggernaut" },
      { count: 3, delay: 2000, interval: 2000, type: "dragon" },
      { count: 8, delay: 2000, interval: 500, type: "ember_guard" },
    ],
    // Wave 18: THE ULTIMATE FINALE
    [
      { count: 5, interval: 2000, type: "trustee" },
      { count: 4, delay: 2000, interval: 2000, type: "golem" },
      { count: 3, delay: 2000, interval: 2000, type: "dean" },
      { count: 4, delay: 2000, interval: 1800, type: "dragon" },
      { count: 3, delay: 2000, interval: 2400, type: "juggernaut" },
      { count: 10, delay: 2000, interval: 400, type: "ember_guard" },
    ],
    // Wave 19: Infernal legion
    [
      { count: 3, interval: 1600, type: "death_knight" },
      { count: 3, delay: 2200, interval: 1200, type: "black_guard" },
      { count: 5, delay: 2200, interval: 750, type: "hellhound" },
      { count: 4, delay: 2000, interval: 900, type: "revenant" },
      { count: 8, delay: 2000, interval: 500, type: "ember_guard" },
    ],
    // Wave 20: Apocalypse
    [
      { count: 2, interval: 2400, type: "doom_herald" },
      { count: 2, delay: 2200, interval: 2800, type: "abomination" },
      { count: 2, delay: 2200, interval: 2400, type: "lich" },
      { count: 1, delay: 2000, interval: 2800, type: "skeleton_king" },
      { count: 4, delay: 2000, interval: 1000, type: "fallen_paladin" },
      { count: 10, delay: 2000, interval: 350, type: "fire_imp" },
    ],
    // Wave 21: THE BURNOUT WYRM
    [
      { count: 1, interval: 5000, type: "inferno_wyrm" },
      { count: 1, delay: 3000, interval: 3000, type: "doom_herald" },
      { count: 5, delay: 2000, interval: 750, type: "hellhound" },
      { count: 3, delay: 2000, interval: 1400, type: "death_knight" },
      { count: 8, delay: 2000, interval: 500, type: "ember_guard" },
    ],
    // Wave 22: Volcanic bug army
    [
      { count: 8, interval: 480, type: "fire_ant" },
      { count: 5, delay: 2200, interval: 750, type: "magma_beetle" },
      { count: 5, delay: 2000, interval: 650, type: "ash_moth" },
      { count: 4, delay: 2000, interval: 800, type: "bombardier_beetle" },
      { count: 8, delay: 2000, interval: 400, type: "fire_imp" },
    ],
    // Wave 23: Brood mother of the inferno
    [
      { count: 1, interval: 3200, type: "brood_mother" },
      { count: 6, delay: 2400, interval: 550, type: "fire_ant" },
      { count: 4, delay: 2200, interval: 800, type: "magma_beetle" },
      { count: 5, delay: 2000, interval: 650, type: "ash_moth" },
      { count: 3, delay: 2000, interval: 800, type: "volcanic_drake" },
      { count: 8, delay: 2000, interval: 400, type: "salamander" },
    ],
  ],

  // IVY CROSSROADS - "Pincer Siege" (dual-path, alternating pressure)
  ivy_crossroads: [
    // W1: Intro rush from both paths
    [
      { count: 7, interval: 700, type: "athlete" },
      { count: 6, delay: 2800, interval: 680, type: "tiger_fan" },
      { count: 4, delay: 2600, interval: 780, type: "crossbowman" },
    ],
    // W2: Flying screen + caster support
    [
      { count: 5, interval: 650, type: "harpy" },
      { count: 4, delay: 2300, interval: 780, type: "mage" },
      { count: 8, delay: 2100, interval: 520, type: "frosh" },
    ],
    // W3: All-speed blitz - tight intervals, fast enemies
    [
      { count: 6, interval: 550, type: "assassin" },
      { count: 5, delay: 1800, interval: 600, type: "berserker" },
      { count: 10, delay: 1600, interval: 400, type: "athlete" },
    ],
    // W4: Tank wall with ranged backline
    [
      { count: 5, interval: 900, type: "junior" },
      { count: 3, delay: 2400, interval: 1100, type: "skeleton_knight" },
      { count: 6, delay: 2200, interval: 620, type: "crossbowman" },
      { count: 3, delay: 2000, interval: 900, type: "bone_mage" },
      { count: 4, delay: 2200, interval: 700, type: "forest_troll" },
      { count: 3, delay: 2200, interval: 800, type: "orb_weaver" },
    ],
    // W5: Air superiority - all flying, forces anti-air
    [
      { count: 5, interval: 900, type: "wyvern" },
      { count: 6, delay: 2200, interval: 580, type: "harpy" },
      { count: 5, delay: 1900, interval: 650, type: "banshee" },
      { count: 6, delay: 1700, interval: 600, type: "specter" },
    ],
    // W6: Surprise early dean + dark knight vanguard
    [
      { count: 1, interval: 3000, type: "dean" },
      { count: 4, delay: 2600, interval: 950, type: "dark_knight" },
      { count: 3, delay: 2200, interval: 1100, type: "fallen_paladin" },
      { count: 12, delay: 1800, interval: 400, type: "tiger_fan" },
      { count: 3, delay: 2000, interval: 750, type: "giant_eagle" },
    ],
    // W7: Necromantic tide - caster-heavy, healing-disruption
    [
      { count: 1, interval: 2600, type: "lich" },
      { count: 4, delay: 2400, interval: 850, type: "dark_priest" },
      { count: 8, delay: 1800, interval: 480, type: "wraith" },
      { count: 6, delay: 1600, interval: 600, type: "skeleton_archer" },
    ],
    // W8: Breaker wave - one mega-tank + speed flankers
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 14, delay: 2800, interval: 340, type: "hellhound" },
      { count: 6, delay: 1500, interval: 550, type: "revenant" },
      { count: 2, delay: 2000, interval: 1000, type: "dire_bear" },
    ],
    // W9: Full dark fantasy army - balanced and relentless
    [
      { count: 2, interval: 2200, type: "death_knight" },
      { count: 1, delay: 2400, interval: 3000, type: "skeleton_king" },
      { count: 5, delay: 1800, interval: 720, type: "black_guard" },
      { count: 3, delay: 1600, interval: 1200, type: "zombie_brute" },
      { count: 14, delay: 1400, interval: 360, type: "skeleton_footman" },
    ],
    // W10: Doom wave - overlapping bosses
    [
      { count: 2, interval: 2400, type: "doom_herald" },
      { count: 2, delay: 1200, interval: 2000, type: "death_knight" },
      { count: 6, delay: 1800, interval: 700, type: "dark_knight" },
      { count: 20, delay: 1400, interval: 280, type: "athlete" },
      { count: 1, delay: 2000, interval: 1200, type: "ancient_ent" },
      { count: 3, delay: 1800, interval: 900, type: "mantis" },
    ],
    // W11: Bug swarm breach
    [
      { count: 8, interval: 480, type: "ant_soldier" },
      { count: 6, delay: 1800, interval: 520, type: "locust" },
      { count: 5, delay: 1600, interval: 600, type: "centipede" },
      { count: 4, delay: 1400, interval: 750, type: "bombardier_beetle" },
      { count: 5, delay: 1400, interval: 550, type: "dragonfly" },
      { count: 6, delay: 1200, interval: 500, type: "mosquito" },
    ],
    // W12: Desperate defense - everything at once
    [
      { count: 2, interval: 2400, type: "skeleton_king" },
      { count: 2, delay: 1600, interval: 2000, type: "lich" },
      { count: 5, delay: 1400, interval: 800, type: "fallen_paladin" },
      { count: 6, delay: 1200, interval: 580, type: "bone_mage" },
      { count: 20, delay: 1000, interval: 260, type: "zombie_shambler" },
    ],
    // W12: TITAN FINALE - region boss + elite escort
    [
      { count: 1, interval: 3500, type: "titan_of_nassau" },
      { count: 1, delay: 4000, interval: 3000, type: "doom_herald" },
      { count: 1, delay: 2000, interval: 3200, type: "abomination" },
      { count: 3, delay: 1800, interval: 1800, type: "death_knight" },
      { count: 24, delay: 1400, interval: 250, type: "skeleton_footman" },
    ],
  ],

  // BLIGHT BASIN - "Toxic Attrition" (plague/poison grind, tanky swamp waves)
  blight_basin: [
    // W1: Swamp crawlers intro
    [
      { count: 7, interval: 730, type: "bog_creature" },
      { count: 7, delay: 2800, interval: 620, type: "will_o_wisp" },
      { count: 5, delay: 2600, interval: 760, type: "thornwalker" },
    ],
    // W2: Plaguebearer vanguard - poison theme early
    [
      { count: 5, interval: 820, type: "plaguebearer" },
      { count: 4, delay: 2500, interval: 780, type: "zombie_spitter" },
      { count: 10, delay: 2100, interval: 460, type: "bog_creature" },
    ],
    // W3: Troll wall - heavy armor, slow but durable
    [
      { count: 7, interval: 800, type: "swamp_troll" },
      { count: 2, delay: 2600, interval: 1400, type: "zombie_brute" },
      { count: 8, delay: 2200, interval: 600, type: "thornwalker" },
      { count: 5, delay: 2200, interval: 600, type: "vine_serpent" },
      { count: 4, delay: 2200, interval: 650, type: "centipede" },
    ],
    // W4: Spectral swarm - fast ghosts, hard to pin down
    [
      { count: 6, interval: 550, type: "wraith" },
      { count: 7, delay: 1800, interval: 520, type: "specter" },
      { count: 5, delay: 1600, interval: 600, type: "banshee" },
      { count: 10, delay: 1400, interval: 380, type: "will_o_wisp" },
    ],
    // W5: Necromancer council - casters behind meat shields
    [
      { count: 5, interval: 1100, type: "necromancer" },
      { count: 3, delay: 2600, interval: 950, type: "dark_priest" },
      { count: 14, delay: 2000, interval: 350, type: "zombie_shambler" },
      { count: 10, delay: 1600, interval: 420, type: "skeleton_footman" },
      { count: 4, delay: 2000, interval: 700, type: "giant_toad" },
    ],
    // W6: Air ambush after ground-heavy waves
    [
      { count: 6, interval: 850, type: "wyvern" },
      { count: 7, delay: 2000, interval: 550, type: "harpy" },
      { count: 6, delay: 1700, interval: 600, type: "banshee" },
    ],
    // W7: Zombie apocalypse - sheer numbers
    [
      { count: 4, interval: 1100, type: "zombie_brute" },
      { count: 20, delay: 2400, interval: 280, type: "zombie_shambler" },
      { count: 6, delay: 1800, interval: 600, type: "zombie_spitter" },
      { count: 8, delay: 1400, interval: 500, type: "ghoul" },
    ],
    // W8: Dark knight garrison - armored elite push
    [
      { count: 1, interval: 3000, type: "death_knight" },
      { count: 5, delay: 2600, interval: 720, type: "black_guard" },
      { count: 4, delay: 2000, interval: 900, type: "dark_knight" },
      { count: 8, delay: 1600, interval: 650, type: "swamp_troll" },
      { count: 4, delay: 1800, interval: 700, type: "marsh_troll" },
    ],
    // W9: Lich king's court - caster bosses + skeleton army
    [
      { count: 2, interval: 2200, type: "lich" },
      { count: 1, delay: 2800, interval: 3000, type: "skeleton_king" },
      { count: 5, delay: 2000, interval: 680, type: "bone_mage" },
      { count: 6, delay: 1600, interval: 700, type: "skeleton_knight" },
      { count: 16, delay: 1200, interval: 320, type: "bog_creature" },
    ],
    // W10: Double threat - simultaneous boss + swarm
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 1, delay: 800, interval: 3000, type: "doom_herald" },
      { count: 8, delay: 2400, interval: 480, type: "revenant" },
      { count: 10, delay: 1600, interval: 380, type: "hellhound" },
      { count: 1, delay: 2000, interval: 1200, type: "swamp_hydra" },
    ],
    // W11: Swamp bug infestation
    [
      { count: 4, interval: 800, type: "orb_weaver" },
      { count: 8, delay: 2000, interval: 420, type: "mosquito" },
      { count: 5, delay: 1800, interval: 600, type: "centipede" },
      { count: 3, delay: 1600, interval: 850, type: "trapdoor_spider" },
      { count: 5, delay: 1400, interval: 550, type: "dragonfly" },
      { count: 6, delay: 1200, interval: 520, type: "ant_soldier" },
    ],
    // W12: Last stand - everything toxic and undead
    [
      { count: 3, interval: 1800, type: "death_knight" },
      { count: 2, delay: 1400, interval: 2000, type: "lich" },
      { count: 4, delay: 1800, interval: 900, type: "fallen_paladin" },
      { count: 8, delay: 1200, interval: 520, type: "plaguebearer" },
      { count: 20, delay: 1000, interval: 260, type: "will_o_wisp" },
    ],
    // W12: LEVIATHAN FINALE - grinding mega-boss
    [
      { count: 1, interval: 3500, type: "swamp_leviathan" },
      { count: 1, delay: 5000, interval: 3200, type: "abomination" },
      { count: 1, delay: 3000, interval: 3000, type: "doom_herald" },
      { count: 5, delay: 2000, interval: 1000, type: "zombie_brute" },
      { count: 24, delay: 1400, interval: 240, type: "zombie_shambler" },
    ],
  ],

  // SUNSCORCH LABYRINTH - "Sandstorm Blitz" (speed-focused, overwhelming numbers)
  sunscorch_labyrinth: [
    // W1: Desert swarm - fast fodder from the start
    [
      { count: 12, interval: 420, type: "scarab" },
      { count: 8, delay: 2200, interval: 550, type: "nomad" },
    ],
    // W2: Ranged ambush with scorpion tanks
    [
      { count: 6, interval: 650, type: "archer" },
      { count: 6, delay: 2400, interval: 780, type: "scorpion" },
      { count: 4, delay: 2000, interval: 700, type: "skeleton_archer" },
      { count: 10, delay: 1800, interval: 380, type: "scarab" },
    ],
    // W3: Sandworm gauntlet - burrowers demand AoE
    [
      { count: 6, interval: 850, type: "sandworm" },
      { count: 8, delay: 2400, interval: 580, type: "scorpion" },
      { count: 10, delay: 1800, interval: 420, type: "nomad" },
      { count: 4, delay: 2000, interval: 700, type: "djinn" },
      { count: 5, delay: 1800, interval: 550, type: "locust" },
    ],
    // W4: Hellhound stampede - pure speed wave
    [
      { count: 12, interval: 350, type: "hellhound" },
      { count: 6, delay: 1600, interval: 520, type: "assassin" },
      { count: 5, delay: 1400, interval: 550, type: "wraith" },
      { count: 14, delay: 1200, interval: 320, type: "scarab" },
    ],
    // W5: Dark knight caravan - armored column
    [
      { count: 5, interval: 900, type: "dark_knight" },
      { count: 3, delay: 2400, interval: 1100, type: "fallen_paladin" },
      { count: 4, delay: 2000, interval: 800, type: "black_guard" },
      { count: 5, delay: 1600, interval: 900, type: "sandworm" },
      { count: 3, delay: 1800, interval: 800, type: "manticore" },
      { count: 4, delay: 1600, interval: 750, type: "bombardier_beetle" },
    ],
    // W6: Flying sandstorm - all air
    [
      { count: 6, interval: 800, type: "wyvern" },
      { count: 8, delay: 2000, interval: 500, type: "harpy" },
      { count: 6, delay: 1500, interval: 580, type: "banshee" },
    ],
    // W7: Bone mage artillery + meat shield
    [
      { count: 1, interval: 2800, type: "lich" },
      { count: 6, delay: 2400, interval: 600, type: "bone_mage" },
      { count: 4, delay: 2000, interval: 1000, type: "zombie_brute" },
      { count: 16, delay: 1400, interval: 300, type: "skeleton_footman" },
    ],
    // W8: Death knight charge - elite melee
    [
      { count: 2, interval: 2200, type: "death_knight" },
      { count: 1, delay: 2600, interval: 3000, type: "skeleton_king" },
      { count: 8, delay: 1800, interval: 460, type: "revenant" },
      { count: 14, delay: 1400, interval: 340, type: "nomad" },
      { count: 2, delay: 1800, interval: 1000, type: "basilisk" },
    ],
    // W9: Dual-boss ambush
    [
      { count: 1, interval: 3000, type: "doom_herald" },
      { count: 1, delay: 600, interval: 3200, type: "abomination" },
      { count: 5, delay: 2400, interval: 780, type: "dark_knight" },
      { count: 10, delay: 1600, interval: 380, type: "hellhound" },
    ],
    // W10: Endless scarab swarm - survive the flood
    [
      { count: 2, interval: 2000, type: "death_knight" },
      { count: 2, delay: 1800, interval: 2400, type: "skeleton_king" },
      { count: 5, delay: 1400, interval: 800, type: "fallen_paladin" },
      { count: 30, delay: 1000, interval: 200, type: "scarab" },
      { count: 1, delay: 2000, interval: 1200, type: "phoenix" },
    ],
    // W11: Desert bug plague
    [
      { count: 8, interval: 420, type: "locust" },
      { count: 6, delay: 1800, interval: 520, type: "ant_soldier" },
      { count: 4, delay: 1600, interval: 750, type: "bombardier_beetle" },
      { count: 3, delay: 1400, interval: 900, type: "mantis" },
      { count: 5, delay: 1200, interval: 600, type: "centipede" },
      { count: 12, delay: 1000, interval: 350, type: "scarab" },
    ],
    // W12: Dark convergence
    [
      { count: 2, interval: 2000, type: "lich" },
      { count: 2, delay: 1400, interval: 2400, type: "doom_herald" },
      { count: 4, delay: 2000, interval: 800, type: "dark_priest" },
      { count: 6, delay: 1200, interval: 580, type: "bone_mage" },
      { count: 16, delay: 1000, interval: 320, type: "scorpion" },
    ],
    // W12: SPHINX FINALE - guardian + relentless swarm
    [
      { count: 1, interval: 3500, type: "sphinx_guardian" },
      { count: 3, delay: 4000, interval: 1800, type: "death_knight" },
      { count: 1, delay: 2000, interval: 3200, type: "abomination" },
      { count: 20, delay: 1600, interval: 260, type: "skeleton_footman" },
      { count: 26, delay: 1200, interval: 220, type: "scarab" },
    ],
  ],

  // WHITEOUT PASS - "Frozen Fortress" (armored, tanky, endurance test)
  whiteout_pass: [
    // W1: Blizzard scouts
    [
      { count: 9, interval: 620, type: "snow_goblin" },
      { count: 7, delay: 2600, interval: 610, type: "frostling" },
      { count: 4, delay: 2400, interval: 760, type: "ice_witch" },
    ],
    // W2: Yeti vanguard - heavy hitters early
    [
      { count: 6, interval: 850, type: "yeti" },
      { count: 12, delay: 2400, interval: 420, type: "snow_goblin" },
      { count: 3, delay: 2000, interval: 1000, type: "skeleton_knight" },
    ],
    // W3: Ice witch barrage - ranged magic pressure
    [
      { count: 8, interval: 650, type: "ice_witch" },
      { count: 4, delay: 2400, interval: 800, type: "bone_mage" },
      { count: 10, delay: 1800, interval: 430, type: "frostling" },
      { count: 6, delay: 2000, interval: 500, type: "dire_wolf" },
      { count: 5, delay: 1800, interval: 550, type: "frost_tick" },
    ],
    // W4: Surprise speed wave - breaks the tank pattern
    [
      { count: 8, interval: 450, type: "wraith" },
      { count: 6, delay: 1600, interval: 520, type: "assassin" },
      { count: 8, delay: 1200, interval: 400, type: "hellhound" },
    ],
    // W5: Armored column - pure tank test
    [
      { count: 5, interval: 800, type: "black_guard" },
      { count: 4, delay: 2600, interval: 950, type: "dark_knight" },
      { count: 8, delay: 2000, interval: 700, type: "yeti" },
      { count: 3, delay: 1600, interval: 1200, type: "zombie_brute" },
      { count: 4, delay: 1800, interval: 700, type: "frost_troll" },
      { count: 4, delay: 1600, interval: 750, type: "ice_beetle" },
    ],
    // W6: Catapult siege - ranged devastation
    [
      { count: 4, interval: 1200, type: "catapult" },
      { count: 6, delay: 2400, interval: 600, type: "skeleton_archer" },
      { count: 6, delay: 1800, interval: 620, type: "crossbowman" },
      { count: 14, delay: 1400, interval: 360, type: "snow_goblin" },
    ],
    // W7: Death knight frost guard
    [
      { count: 2, interval: 2400, type: "death_knight" },
      { count: 4, delay: 2400, interval: 900, type: "fallen_paladin" },
      { count: 6, delay: 1800, interval: 700, type: "skeleton_knight" },
      { count: 14, delay: 1400, interval: 340, type: "frostling" },
    ],
    // W8: Lich blizzard - casters behind yeti wall
    [
      { count: 2, interval: 2200, type: "lich" },
      { count: 3, delay: 2600, interval: 950, type: "dark_priest" },
      { count: 8, delay: 2000, interval: 680, type: "yeti" },
      { count: 6, delay: 1400, interval: 620, type: "ice_witch" },
      { count: 2, delay: 1800, interval: 1000, type: "mammoth" },
      { count: 4, delay: 1400, interval: 650, type: "snow_moth" },
    ],
    // W9: Frozen bug wave
    [
      { count: 5, interval: 700, type: "ice_beetle" },
      { count: 7, delay: 1800, interval: 480, type: "frost_tick" },
      { count: 5, delay: 1600, interval: 600, type: "snow_moth" },
      { count: 10, delay: 1400, interval: 380, type: "frostling" },
      { count: 5, delay: 1200, interval: 520, type: "dire_wolf" },
    ],
    // W10: Solo mega-boss test
    [
      { count: 2, interval: 2800, type: "skeleton_king" },
      { count: 1, delay: 3000, interval: 3200, type: "abomination" },
      { count: 1, delay: 2000, interval: 3000, type: "doom_herald" },
    ],
    // W10: Frozen horde - massive numbers
    [
      { count: 3, interval: 1800, type: "death_knight" },
      { count: 5, delay: 1600, interval: 780, type: "dark_knight" },
      { count: 18, delay: 1800, interval: 280, type: "skeleton_footman" },
      { count: 20, delay: 1200, interval: 260, type: "snow_goblin" },
      { count: 2, delay: 1600, interval: 1000, type: "wendigo" },
    ],
    // W11: Everything armored, nothing fast
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 5, delay: 2400, interval: 1000, type: "zombie_brute" },
      { count: 6, delay: 1800, interval: 700, type: "black_guard" },
      { count: 5, delay: 1400, interval: 800, type: "fallen_paladin" },
      { count: 10, delay: 1000, interval: 600, type: "yeti" },
    ],
    // W12: COLOSSUS FINALE - frozen titan + armored escort
    [
      { count: 1, interval: 3500, type: "frost_colossus" },
      { count: 2, delay: 4000, interval: 2400, type: "doom_herald" },
      { count: 3, delay: 2000, interval: 1800, type: "death_knight" },
      { count: 2, delay: 1600, interval: 2000, type: "lich" },
      { count: 22, delay: 1200, interval: 260, type: "frostling" },
    ],
  ],

  // ASHEN SPIRAL - "Infernal Gauntlet" (15 waves, escalating boss parade)
  ashen_spiral: [
    // W1: Volcanic vanguard
    [
      { count: 10, interval: 560, type: "fire_imp" },
      { count: 8, delay: 2600, interval: 620, type: "magma_spawn" },
      { count: 5, delay: 2400, interval: 860, type: "ember_guard" },
    ],
    // W2: Infernal charge + warlock support
    [
      { count: 6, interval: 720, type: "infernal" },
      { count: 5, delay: 2300, interval: 760, type: "warlock" },
      { count: 12, delay: 2000, interval: 380, type: "fire_imp" },
    ],
    // W3: All flying - air dominance
    [
      { count: 6, interval: 850, type: "wyvern" },
      { count: 7, delay: 2000, interval: 550, type: "harpy" },
      { count: 6, delay: 1600, interval: 600, type: "banshee" },
      { count: 4, delay: 1800, interval: 700, type: "volcanic_drake" },
      { count: 4, delay: 1600, interval: 650, type: "ash_moth" },
    ],
    // W4: Surprise skeleton army - not volcanic themed
    [
      { count: 5, interval: 900, type: "skeleton_knight" },
      { count: 14, delay: 2200, interval: 340, type: "skeleton_footman" },
      { count: 6, delay: 1800, interval: 600, type: "skeleton_archer" },
      { count: 3, delay: 1400, interval: 900, type: "bone_mage" },
    ],
    // W5: Speed nightmare - fastest possible
    [
      { count: 10, interval: 360, type: "hellhound" },
      { count: 6, delay: 1400, interval: 500, type: "revenant" },
      { count: 8, delay: 1200, interval: 480, type: "assassin" },
      { count: 16, delay: 1000, interval: 280, type: "fire_imp" },
      { count: 8, delay: 1200, interval: 400, type: "salamander" },
      { count: 8, delay: 1000, interval: 380, type: "fire_ant" },
    ],
    // W6: Death knight vanguard - first big boss
    [
      { count: 2, interval: 2400, type: "death_knight" },
      { count: 5, delay: 2600, interval: 800, type: "dark_knight" },
      { count: 4, delay: 2000, interval: 900, type: "fallen_paladin" },
      { count: 8, delay: 1600, interval: 620, type: "ember_guard" },
    ],
    // W7: Lich tower - caster devastation
    [
      { count: 2, interval: 2200, type: "lich" },
      { count: 4, delay: 2400, interval: 850, type: "dark_priest" },
      { count: 6, delay: 1800, interval: 600, type: "bone_mage" },
      { count: 8, delay: 1400, interval: 460, type: "wraith" },
    ],
    // W8: Zombie siege - slow but overwhelming
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 5, delay: 2800, interval: 1000, type: "zombie_brute" },
      { count: 20, delay: 2000, interval: 260, type: "zombie_shambler" },
      { count: 12, delay: 1400, interval: 400, type: "magma_spawn" },
      { count: 2, delay: 1800, interval: 1000, type: "lava_golem" },
      { count: 4, delay: 1600, interval: 750, type: "magma_beetle" },
    ],
    // W9: Volcanic bug swarm
    [
      { count: 10, interval: 360, type: "fire_ant" },
      { count: 5, delay: 1800, interval: 700, type: "magma_beetle" },
      { count: 5, delay: 1600, interval: 600, type: "ash_moth" },
      { count: 4, delay: 1400, interval: 750, type: "bombardier_beetle" },
      { count: 12, delay: 1200, interval: 340, type: "fire_imp" },
    ],
    // W10: Breather... then surprise boss
    [
      { count: 20, interval: 300, type: "fire_imp" },
      { count: 6, delay: 3000, interval: 700, type: "ember_guard" },
      { count: 1, delay: 6000, interval: 3000, type: "doom_herald" },
      { count: 1, delay: 1000, interval: 3000, type: "skeleton_king" },
    ],
    // W10: Dual boss gauntlet
    [
      { count: 3, interval: 1800, type: "death_knight" },
      { count: 2, delay: 2000, interval: 2400, type: "skeleton_king" },
      { count: 6, delay: 2400, interval: 700, type: "black_guard" },
      { count: 6, delay: 1600, interval: 740, type: "dark_knight" },
      { count: 5, delay: 1800, interval: 700, type: "volcanic_drake" },
    ],
    // W11: Abomination rampage
    [
      { count: 2, interval: 2800, type: "abomination" },
      { count: 1, delay: 1200, interval: 3000, type: "doom_herald" },
      { count: 12, delay: 2400, interval: 350, type: "hellhound" },
      { count: 8, delay: 1600, interval: 480, type: "revenant" },
    ],
    // W12: Full dark fantasy war
    [
      { count: 3, interval: 1800, type: "lich" },
      { count: 3, delay: 1200, interval: 1800, type: "death_knight" },
      { count: 6, delay: 2000, interval: 740, type: "fallen_paladin" },
      { count: 18, delay: 1400, interval: 280, type: "skeleton_footman" },
      { count: 20, delay: 1000, interval: 260, type: "fire_imp" },
    ],
    // W13: Triple boss mayhem
    [
      { count: 2, interval: 2400, type: "doom_herald" },
      { count: 1, delay: 1000, interval: 3000, type: "abomination" },
      { count: 2, delay: 800, interval: 2400, type: "skeleton_king" },
      { count: 5, delay: 2200, interval: 1000, type: "zombie_brute" },
      { count: 10, delay: 1400, interval: 540, type: "ember_guard" },
    ],
    // W14: Endgame onslaught - everything at once
    [
      { count: 4, interval: 1600, type: "death_knight" },
      { count: 3, delay: 1000, interval: 1800, type: "lich" },
      { count: 2, delay: 800, interval: 2200, type: "doom_herald" },
      { count: 8, delay: 1600, interval: 640, type: "dark_knight" },
      { count: 20, delay: 1200, interval: 260, type: "magma_spawn" },
    ],
    // W15: WYRM FINALE - inferno titan + army of the damned
    [
      { count: 1, interval: 3500, type: "inferno_wyrm" },
      { count: 2, delay: 5000, interval: 2600, type: "abomination" },
      { count: 2, delay: 3000, interval: 2400, type: "doom_herald" },
      { count: 4, delay: 2000, interval: 1600, type: "death_knight" },
      { count: 14, delay: 1600, interval: 320, type: "hellhound" },
      { count: 28, delay: 1200, interval: 200, type: "fire_imp" },
    ],
  ],

  // CANNON CREST - "All-Out Assault" (surprise early bosses, varied pressure)
  cannon_crest: [
    // W1: Standard grassland intro
    [
      { count: 8, interval: 620, type: "athlete" },
      { count: 7, delay: 2600, interval: 580, type: "tiger_fan" },
      { count: 5, delay: 2400, interval: 720, type: "crossbowman" },
    ],
    // W2: Immediate tank test - no easing in
    [
      { count: 2, interval: 1400, type: "zombie_brute" },
      { count: 4, delay: 2800, interval: 900, type: "skeleton_knight" },
      { count: 10, delay: 2000, interval: 440, type: "athlete" },
    ],
    // W3: All-ranged barrage
    [
      { count: 6, interval: 600, type: "skeleton_archer" },
      { count: 4, delay: 2400, interval: 800, type: "bone_mage" },
      { count: 6, delay: 1800, interval: 620, type: "crossbowman" },
      { count: 5, delay: 1400, interval: 700, type: "mage" },
      { count: 8, delay: 2000, interval: 400, type: "timber_wolf" },
      { count: 3, delay: 1800, interval: 850, type: "mantis" },
    ],
    // W4: Surprise dean + speed flankers
    [
      { count: 1, interval: 3000, type: "dean" },
      { count: 8, delay: 2800, interval: 480, type: "assassin" },
      { count: 7, delay: 2000, interval: 540, type: "berserker" },
    ],
    // W5: Dark knight column
    [
      { count: 4, interval: 950, type: "dark_knight" },
      { count: 3, delay: 2600, interval: 1100, type: "fallen_paladin" },
      { count: 4, delay: 2000, interval: 800, type: "black_guard" },
      { count: 14, delay: 1600, interval: 360, type: "tiger_fan" },
      { count: 3, delay: 2000, interval: 750, type: "giant_eagle" },
    ],
    // W6: Wraith ambush - all-fast ghost wave
    [
      { count: 8, interval: 450, type: "wraith" },
      { count: 10, delay: 1600, interval: 380, type: "hellhound" },
      { count: 6, delay: 1200, interval: 520, type: "revenant" },
    ],
    // W7: Lich + necromancer caster tower
    [
      { count: 2, interval: 2200, type: "lich" },
      { count: 3, delay: 2600, interval: 950, type: "dark_priest" },
      { count: 16, delay: 2000, interval: 320, type: "skeleton_footman" },
      { count: 14, delay: 1400, interval: 380, type: "athlete" },
    ],
    // W8: Double death knight push
    [
      { count: 2, interval: 2400, type: "death_knight" },
      { count: 1, delay: 2800, interval: 3000, type: "skeleton_king" },
      { count: 5, delay: 2000, interval: 780, type: "dark_knight" },
      { count: 6, delay: 1400, interval: 700, type: "skeleton_knight" },
      { count: 4, delay: 1800, interval: 700, type: "forest_troll" },
    ],
    // W9: Boss rush - multiple heavies simultaneous
    [
      { count: 1, interval: 3000, type: "doom_herald" },
      { count: 1, delay: 800, interval: 3200, type: "abomination" },
      { count: 4, delay: 2400, interval: 1000, type: "zombie_brute" },
      { count: 6, delay: 1600, interval: 600, type: "bone_mage" },
    ],
    // W10: Overwhelming swarm + elites
    [
      { count: 3, interval: 1800, type: "death_knight" },
      { count: 5, delay: 1600, interval: 800, type: "fallen_paladin" },
      { count: 20, delay: 2000, interval: 260, type: "skeleton_footman" },
      { count: 20, delay: 1200, interval: 280, type: "tiger_fan" },
      { count: 2, delay: 2000, interval: 1000, type: "dire_bear" },
    ],
    // W11: Bug blitz
    [
      { count: 8, interval: 450, type: "ant_soldier" },
      { count: 7, delay: 1600, interval: 480, type: "locust" },
      { count: 5, delay: 1400, interval: 550, type: "dragonfly" },
      { count: 5, delay: 1200, interval: 600, type: "centipede" },
      { count: 4, delay: 1200, interval: 750, type: "bombardier_beetle" },
      { count: 8, delay: 1000, interval: 400, type: "mosquito" },
    ],
    // W12: Everything undead
    [
      { count: 2, interval: 2400, type: "skeleton_king" },
      { count: 2, delay: 1200, interval: 2000, type: "lich" },
      { count: 1, delay: 1000, interval: 3000, type: "doom_herald" },
      { count: 6, delay: 1800, interval: 700, type: "dark_knight" },
      { count: 12, delay: 1200, interval: 340, type: "hellhound" },
    ],
    // W12: TITAN FINALE
    [
      { count: 1, interval: 3500, type: "titan_of_nassau" },
      { count: 1, delay: 4000, interval: 3200, type: "abomination" },
      { count: 1, delay: 2000, interval: 3000, type: "doom_herald" },
      { count: 3, delay: 1800, interval: 1800, type: "death_knight" },
      { count: 24, delay: 1400, interval: 240, type: "athlete" },
    ],
  ],

  // TRIAD KEEP - "Necromantic Ritual" (caster-heavy, undead summoning theme)
  triad_keep: [
    // W1: Swamp scouts
    [
      { count: 9, interval: 640, type: "bog_creature" },
      { count: 6, delay: 2600, interval: 700, type: "thornwalker" },
      { count: 5, delay: 2400, interval: 760, type: "cultist" },
    ],
    // W2: Troll tanks + plague cloud
    [
      { count: 6, interval: 850, type: "swamp_troll" },
      { count: 5, delay: 2400, interval: 780, type: "plaguebearer" },
      { count: 12, delay: 2000, interval: 430, type: "bog_creature" },
    ],
    // W3: First dark casters appear
    [
      { count: 3, interval: 1000, type: "dark_priest" },
      { count: 3, delay: 2600, interval: 950, type: "bone_mage" },
      { count: 4, delay: 2000, interval: 750, type: "zombie_spitter" },
      { count: 8, delay: 1600, interval: 600, type: "thornwalker" },
      { count: 5, delay: 1800, interval: 600, type: "vine_serpent" },
      { count: 4, delay: 1600, interval: 650, type: "centipede" },
    ],
    // W4: Ghost raid - ethereal enemies only
    [
      { count: 6, interval: 520, type: "wraith" },
      { count: 6, delay: 1800, interval: 550, type: "specter" },
      { count: 5, delay: 1400, interval: 600, type: "banshee" },
      { count: 12, delay: 1200, interval: 380, type: "will_o_wisp" },
    ],
    // W5: Lich arrives with skeleton army
    [
      { count: 1, interval: 2600, type: "lich" },
      { count: 5, delay: 2800, interval: 800, type: "skeleton_knight" },
      { count: 14, delay: 2000, interval: 340, type: "skeleton_footman" },
      { count: 5, delay: 1600, interval: 650, type: "skeleton_archer" },
      { count: 4, delay: 2000, interval: 700, type: "giant_toad" },
      { count: 3, delay: 1800, interval: 800, type: "orb_weaver" },
    ],
    // W6: Zombie flood - pure numbers test
    [
      { count: 3, interval: 1200, type: "zombie_brute" },
      { count: 22, delay: 2400, interval: 250, type: "zombie_shambler" },
      { count: 8, delay: 1600, interval: 480, type: "ghoul" },
    ],
    // W7: Death knight + air support
    [
      { count: 1, interval: 3000, type: "death_knight" },
      { count: 6, delay: 2600, interval: 800, type: "wyvern" },
      { count: 7, delay: 1800, interval: 550, type: "harpy" },
      { count: 4, delay: 1400, interval: 900, type: "dark_knight" },
    ],
    // W8: Necromancer ritual - caster onslaught
    [
      { count: 2, interval: 2200, type: "lich" },
      { count: 4, delay: 2400, interval: 850, type: "dark_priest" },
      { count: 6, delay: 1800, interval: 600, type: "bone_mage" },
      { count: 8, delay: 1400, interval: 460, type: "wraith" },
      { count: 4, delay: 1600, interval: 700, type: "marsh_troll" },
      { count: 6, delay: 1400, interval: 480, type: "mosquito" },
    ],
    // W9: Swamp bug infestation
    [
      { count: 4, interval: 750, type: "orb_weaver" },
      { count: 3, delay: 2000, interval: 850, type: "trapdoor_spider" },
      { count: 8, delay: 1600, interval: 400, type: "mosquito" },
      { count: 5, delay: 1400, interval: 600, type: "centipede" },
      { count: 6, delay: 1200, interval: 520, type: "ant_soldier" },
      { count: 4, delay: 1200, interval: 650, type: "silk_moth" },
    ],
    // W10: Skeleton king + dark knight escort
    [
      { count: 2, interval: 2600, type: "skeleton_king" },
      { count: 4, delay: 2400, interval: 900, type: "fallen_paladin" },
      { count: 5, delay: 1800, interval: 720, type: "black_guard" },
      { count: 16, delay: 1200, interval: 320, type: "bog_creature" },
    ],
    // W10: Abomination + doom herald pair
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 1, delay: 1000, interval: 3000, type: "doom_herald" },
      { count: 10, delay: 2800, interval: 380, type: "hellhound" },
      { count: 8, delay: 1600, interval: 480, type: "revenant" },
      { count: 1, delay: 2000, interval: 1200, type: "swamp_hydra" },
    ],
    // W11: Undead council - all boss casters
    [
      { count: 3, interval: 1800, type: "lich" },
      { count: 2, delay: 1400, interval: 2400, type: "skeleton_king" },
      { count: 3, delay: 1200, interval: 1800, type: "death_knight" },
      { count: 6, delay: 1800, interval: 580, type: "bone_mage" },
      { count: 16, delay: 1000, interval: 340, type: "thornwalker" },
    ],
    // W12: LEVIATHAN FINALE
    [
      { count: 1, interval: 3500, type: "swamp_leviathan" },
      { count: 1, delay: 4000, interval: 3000, type: "doom_herald" },
      { count: 1, delay: 2000, interval: 3200, type: "abomination" },
      { count: 4, delay: 2400, interval: 800, type: "dark_priest" },
      { count: 24, delay: 1400, interval: 240, type: "zombie_shambler" },
    ],
  ],

  // FRIST OUTPOST - "Blizzard Rush" (speed-focused, wraiths + hellhounds)
  frist_outpost: [
    // W1: Blizzard scouts
    [
      { count: 10, interval: 600, type: "snow_goblin" },
      { count: 8, delay: 2600, interval: 580, type: "frostling" },
      { count: 5, delay: 2400, interval: 760, type: "ice_witch" },
    ],
    // W2: Speed rush - everything fast
    [
      { count: 7, interval: 500, type: "assassin" },
      { count: 12, delay: 2000, interval: 380, type: "frostling" },
      { count: 6, delay: 1600, interval: 450, type: "hellhound" },
    ],
    // W3: Yeti fortress + ice witch artillery
    [
      { count: 7, interval: 780, type: "yeti" },
      { count: 6, delay: 2600, interval: 650, type: "ice_witch" },
      { count: 5, delay: 2000, interval: 650, type: "skeleton_archer" },
      { count: 6, delay: 2200, interval: 500, type: "dire_wolf" },
      { count: 5, delay: 2000, interval: 500, type: "frost_tick" },
    ],
    // W4: Wraith swarm - ethereal blitz
    [
      { count: 10, interval: 400, type: "wraith" },
      { count: 6, delay: 1600, interval: 520, type: "specter" },
      { count: 16, delay: 1200, interval: 320, type: "snow_goblin" },
    ],
    // W5: Dark knight frozen march
    [
      { count: 4, interval: 950, type: "dark_knight" },
      { count: 5, delay: 2400, interval: 800, type: "skeleton_knight" },
      { count: 4, delay: 1800, interval: 800, type: "black_guard" },
      { count: 12, delay: 1400, interval: 380, type: "frostling" },
      { count: 4, delay: 1600, interval: 700, type: "frost_troll" },
      { count: 4, delay: 1400, interval: 700, type: "ice_beetle" },
    ],
    // W6: All flying blizzard
    [
      { count: 6, interval: 850, type: "wyvern" },
      { count: 8, delay: 2000, interval: 500, type: "harpy" },
      { count: 7, delay: 1500, interval: 560, type: "banshee" },
    ],
    // W7: Death knight + hellhound pack
    [
      { count: 2, interval: 2400, type: "death_knight" },
      { count: 14, delay: 2600, interval: 320, type: "hellhound" },
      { count: 6, delay: 1800, interval: 520, type: "revenant" },
      { count: 6, delay: 1200, interval: 480, type: "wraith" },
    ],
    // W8: Lich frost ritual
    [
      { count: 2, interval: 2200, type: "lich" },
      { count: 5, delay: 2400, interval: 680, type: "bone_mage" },
      { count: 8, delay: 1800, interval: 680, type: "yeti" },
      { count: 6, delay: 1200, interval: 620, type: "ice_witch" },
      { count: 2, delay: 1600, interval: 1000, type: "mammoth" },
      { count: 4, delay: 1200, interval: 600, type: "snow_moth" },
    ],
    // W9: Frozen bug wave
    [
      { count: 5, interval: 680, type: "ice_beetle" },
      { count: 7, delay: 1800, interval: 460, type: "frost_tick" },
      { count: 5, delay: 1600, interval: 580, type: "snow_moth" },
      { count: 10, delay: 1200, interval: 360, type: "frostling" },
      { count: 8, delay: 1000, interval: 420, type: "snow_goblin" },
    ],
    // W10: Solo mega-tank challenge
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 4, delay: 3000, interval: 1000, type: "zombie_brute" },
      { count: 4, delay: 2000, interval: 900, type: "fallen_paladin" },
    ],
    // W10: Speed massacre - fastest wave
    [
      { count: 16, interval: 300, type: "hellhound" },
      { count: 10, delay: 1200, interval: 380, type: "wraith" },
      { count: 8, delay: 1000, interval: 440, type: "assassin" },
      { count: 16, delay: 800, interval: 300, type: "frostling" },
      { count: 2, delay: 1400, interval: 1000, type: "wendigo" },
    ],
    // W11: Dark convergence
    [
      { count: 2, interval: 2400, type: "doom_herald" },
      { count: 3, delay: 1400, interval: 1800, type: "death_knight" },
      { count: 2, delay: 1200, interval: 2400, type: "skeleton_king" },
      { count: 6, delay: 1800, interval: 700, type: "dark_knight" },
      { count: 18, delay: 1000, interval: 280, type: "snow_goblin" },
    ],
    // W12: COLOSSUS FINALE
    [
      { count: 1, interval: 3500, type: "frost_colossus" },
      { count: 1, delay: 4000, interval: 3200, type: "abomination" },
      { count: 1, delay: 2000, interval: 3000, type: "doom_herald" },
      { count: 14, delay: 2400, interval: 320, type: "hellhound" },
      { count: 20, delay: 1400, interval: 260, type: "frostling" },
    ],
  ],

  // MIRAGE DUNES - "Phantom Skies" (ALL flying enemies vs mortar + arch only)
  mirage_dunes: [
    // W1: Locust scouts — fast desert flyers ease the player in
    [
      { count: 10, interval: 520, type: "locust" },
      { count: 5, delay: 2400, interval: 700, type: "harpy" },
    ],
    // W2: Eagles + mosquitoes — mixed speed pressure
    [
      { count: 5, interval: 800, type: "giant_eagle" },
      { count: 10, delay: 2200, interval: 420, type: "mosquito" },
      { count: 8, delay: 1800, interval: 460, type: "locust" },
    ],
    // W3: Desert hunters — phoenix + manticores
    [
      { count: 2, interval: 1400, type: "phoenix" },
      { count: 3, delay: 2600, interval: 950, type: "manticore" },
      { count: 12, delay: 2000, interval: 380, type: "locust" },
    ],
    // W4: Insect swarm — overwhelming fast flyers
    [
      { count: 12, interval: 340, type: "dragonfly" },
      { count: 14, delay: 1600, interval: 300, type: "locust" },
      { count: 10, delay: 1400, interval: 400, type: "mosquito" },
    ],
    // W5: Debuffer storm — moths cripple your towers
    [
      { count: 5, interval: 700, type: "silk_moth" },
      { count: 4, delay: 2400, interval: 750, type: "snow_moth" },
      { count: 5, delay: 2000, interval: 650, type: "ash_moth" },
      { count: 6, delay: 1600, interval: 550, type: "harpy" },
    ],
    // W6: Armored sky — tanky flyers test raw damage
    [
      { count: 3, interval: 1200, type: "wyvern" },
      { count: 3, delay: 2800, interval: 1100, type: "volcanic_drake" },
      { count: 4, delay: 2200, interval: 850, type: "specter" },
    ],
    // W7: Mega swarm — sky blackens with wings
    [
      { count: 10, interval: 400, type: "harpy" },
      { count: 16, delay: 1400, interval: 280, type: "locust" },
      { count: 10, delay: 1200, interval: 340, type: "dragonfly" },
      { count: 6, delay: 1800, interval: 520, type: "will_o_wisp" },
    ],
    // W8: Ranged flyers — manticores + phoenixes rain down fire
    [
      { count: 5, interval: 850, type: "manticore" },
      { count: 3, delay: 2600, interval: 1200, type: "phoenix" },
      { count: 4, delay: 2000, interval: 700, type: "banshee" },
      { count: 6, delay: 1400, interval: 600, type: "giant_eagle" },
    ],
    // W9: Heavy assault — drakes and specters with moth support
    [
      { count: 4, interval: 1100, type: "wyvern" },
      { count: 4, delay: 2400, interval: 1000, type: "volcanic_drake" },
      { count: 5, delay: 2000, interval: 750, type: "specter" },
      { count: 6, delay: 1600, interval: 550, type: "ash_moth" },
    ],
    // W10: Rebirth wave — phoenixes keep coming back
    [
      { count: 5, interval: 1000, type: "phoenix" },
      { count: 4, delay: 2200, interval: 700, type: "silk_moth" },
      { count: 5, delay: 1800, interval: 650, type: "banshee" },
      { count: 4, delay: 1600, interval: 800, type: "manticore" },
    ],
    // W11: Dragon vanguard — boss flyers lead the charge
    [
      { count: 1, interval: 3000, type: "dragon" },
      { count: 5, delay: 3200, interval: 900, type: "wyvern" },
      { count: 12, delay: 2000, interval: 350, type: "harpy" },
      { count: 3, delay: 1600, interval: 1000, type: "volcanic_drake" },
    ],
    // W12: PHANTOM SKY FINALE — dragon + full aerial armada
    [
      { count: 1, interval: 3500, type: "dragon" },
      { count: 4, delay: 3600, interval: 1000, type: "wyvern" },
      { count: 4, delay: 2800, interval: 900, type: "phoenix" },
      { count: 5, delay: 2000, interval: 750, type: "manticore" },
      { count: 6, delay: 1600, interval: 550, type: "banshee" },
      { count: 20, delay: 1200, interval: 220, type: "locust" },
    ],
  ],

  // SUN OBELISK - "Pyramid Siege" (siege theme, catapults + golems + brutes)
  sun_obelisk: [
    // W1: Desert scouts
    [
      { count: 9, interval: 640, type: "nomad" },
      { count: 8, delay: 2600, interval: 560, type: "scarab" },
      { count: 6, delay: 2400, interval: 660, type: "scorpion" },
    ],
    // W2: Catapult siege - ranged from the start
    [
      { count: 3, interval: 1200, type: "catapult" },
      { count: 6, delay: 2800, interval: 600, type: "archer" },
      { count: 10, delay: 2000, interval: 420, type: "nomad" },
    ],
    // W3: Sandworm ambush
    [
      { count: 6, interval: 850, type: "sandworm" },
      { count: 8, delay: 2400, interval: 600, type: "scorpion" },
      { count: 12, delay: 1800, interval: 380, type: "scarab" },
      { count: 4, delay: 2000, interval: 700, type: "djinn" },
      { count: 5, delay: 1800, interval: 520, type: "locust" },
    ],
    // W4: Skeleton siege engineers
    [
      { count: 5, interval: 850, type: "skeleton_knight" },
      { count: 4, delay: 2600, interval: 800, type: "bone_mage" },
      { count: 12, delay: 2000, interval: 380, type: "skeleton_footman" },
      { count: 5, delay: 1600, interval: 650, type: "skeleton_archer" },
    ],
    // W5: All-air ambush
    [
      { count: 6, interval: 800, type: "wyvern" },
      { count: 7, delay: 2000, interval: 550, type: "harpy" },
      { count: 5, delay: 1600, interval: 620, type: "banshee" },
    ],
    // W6: Zombie brute battering ram
    [
      { count: 5, interval: 1000, type: "zombie_brute" },
      { count: 4, delay: 2800, interval: 950, type: "dark_knight" },
      { count: 3, delay: 2000, interval: 1100, type: "fallen_paladin" },
      { count: 14, delay: 1400, interval: 360, type: "nomad" },
      { count: 3, delay: 1800, interval: 800, type: "manticore" },
      { count: 4, delay: 1600, interval: 720, type: "bombardier_beetle" },
    ],
    // W7: Lich artillery + meat shield
    [
      { count: 2, interval: 2200, type: "lich" },
      { count: 3, delay: 2600, interval: 1200, type: "catapult" },
      { count: 5, delay: 2000, interval: 720, type: "black_guard" },
      { count: 16, delay: 1400, interval: 320, type: "scarab" },
    ],
    // W8: Death knight vanguard
    [
      { count: 2, interval: 2400, type: "death_knight" },
      { count: 1, delay: 2800, interval: 3000, type: "skeleton_king" },
      { count: 5, delay: 2000, interval: 780, type: "dark_knight" },
      { count: 6, delay: 1400, interval: 800, type: "sandworm" },
      { count: 2, delay: 1800, interval: 1000, type: "basilisk" },
    ],
    // W9: Doom herald + golem test
    [
      { count: 1, interval: 3200, type: "doom_herald" },
      { count: 1, delay: 1200, interval: 2800, type: "golem" },
      { count: 4, delay: 2600, interval: 1000, type: "zombie_brute" },
      { count: 16, delay: 1600, interval: 340, type: "scorpion" },
    ],
    // W10: Dark caster barrage
    [
      { count: 2, interval: 2000, type: "lich" },
      { count: 4, delay: 2200, interval: 800, type: "dark_priest" },
      { count: 6, delay: 1600, interval: 580, type: "bone_mage" },
      { count: 8, delay: 1200, interval: 460, type: "wraith" },
      { count: 16, delay: 1000, interval: 320, type: "nomad" },
      { count: 1, delay: 2000, interval: 1200, type: "phoenix" },
    ],
    // W11: Desert bug swarm
    [
      { count: 8, interval: 400, type: "locust" },
      { count: 7, delay: 1600, interval: 480, type: "ant_soldier" },
      { count: 4, delay: 1400, interval: 720, type: "bombardier_beetle" },
      { count: 3, delay: 1200, interval: 850, type: "mantis" },
      { count: 5, delay: 1200, interval: 580, type: "centipede" },
      { count: 14, delay: 1000, interval: 320, type: "scarab" },
    ],
    // W12: Abomination siege
    [
      { count: 2, interval: 2800, type: "abomination" },
      { count: 3, delay: 1600, interval: 1800, type: "death_knight" },
      { count: 5, delay: 2000, interval: 800, type: "fallen_paladin" },
      { count: 10, delay: 1400, interval: 380, type: "hellhound" },
    ],
    // W12: SPHINX FINALE
    [
      { count: 1, interval: 3500, type: "sphinx_guardian" },
      { count: 2, delay: 4000, interval: 2400, type: "doom_herald" },
      { count: 2, delay: 2000, interval: 2400, type: "skeleton_king" },
      { count: 6, delay: 2000, interval: 700, type: "dark_knight" },
      { count: 24, delay: 1400, interval: 220, type: "scarab" },
    ],
  ],

  // INFERNAL GATE - "Apocalypse" (hardest challenge, overlapping bosses)
  infernal_gate: [
    // W1: Volcanic vanguard
    [
      { count: 10, interval: 540, type: "fire_imp" },
      { count: 8, delay: 2500, interval: 600, type: "magma_spawn" },
      { count: 5, delay: 2300, interval: 840, type: "ember_guard" },
    ],
    // W2: Dark knight ambush - skips the normal warmup
    [
      { count: 3, interval: 1000, type: "dark_knight" },
      { count: 4, delay: 2600, interval: 900, type: "skeleton_knight" },
      { count: 12, delay: 2000, interval: 400, type: "fire_imp" },
      { count: 6, delay: 1600, interval: 450, type: "hellhound" },
    ],
    // W3: Caster devastation early
    [
      { count: 1, interval: 2600, type: "lich" },
      { count: 4, delay: 2600, interval: 800, type: "bone_mage" },
      { count: 3, delay: 2000, interval: 950, type: "dark_priest" },
      { count: 10, delay: 1600, interval: 440, type: "magma_spawn" },
      { count: 8, delay: 1800, interval: 400, type: "salamander" },
      { count: 4, delay: 1600, interval: 700, type: "magma_beetle" },
    ],
    // W4: All-speed panic wave
    [
      { count: 12, interval: 340, type: "hellhound" },
      { count: 8, delay: 1400, interval: 420, type: "wraith" },
      { count: 6, delay: 1200, interval: 500, type: "revenant" },
      { count: 8, delay: 1000, interval: 460, type: "assassin" },
    ],
    // W5: Death knight early - first boss at wave 5
    [
      { count: 2, interval: 2400, type: "death_knight" },
      { count: 4, delay: 2600, interval: 900, type: "fallen_paladin" },
      { count: 5, delay: 2000, interval: 720, type: "black_guard" },
      { count: 8, delay: 1400, interval: 620, type: "ember_guard" },
      { count: 4, delay: 1600, interval: 700, type: "volcanic_drake" },
      { count: 6, delay: 1400, interval: 500, type: "fire_ant" },
    ],
    // W6: Air supremacy - flying nightmare
    [
      { count: 7, interval: 780, type: "wyvern" },
      { count: 8, delay: 1800, interval: 500, type: "harpy" },
      { count: 7, delay: 1400, interval: 560, type: "banshee" },
      { count: 1, delay: 3000, interval: 2800, type: "dragon" },
    ],
    // W7: Skeleton king's court
    [
      { count: 2, interval: 2600, type: "skeleton_king" },
      { count: 2, delay: 2000, interval: 2200, type: "lich" },
      { count: 6, delay: 2400, interval: 700, type: "skeleton_knight" },
      { count: 16, delay: 1600, interval: 300, type: "skeleton_footman" },
    ],
    // W8: Abomination vanguard + zombie flood
    [
      { count: 1, interval: 3200, type: "abomination" },
      { count: 5, delay: 2800, interval: 1000, type: "zombie_brute" },
      { count: 18, delay: 2000, interval: 280, type: "zombie_shambler" },
      { count: 16, delay: 1400, interval: 300, type: "fire_imp" },
      { count: 2, delay: 1800, interval: 1000, type: "lava_golem" },
      { count: 5, delay: 1400, interval: 580, type: "ash_moth" },
    ],
    // W9: Volcanic bug apocalypse
    [
      { count: 10, interval: 340, type: "fire_ant" },
      { count: 5, delay: 1600, interval: 680, type: "magma_beetle" },
      { count: 5, delay: 1400, interval: 580, type: "ash_moth" },
      { count: 4, delay: 1200, interval: 720, type: "bombardier_beetle" },
      { count: 6, delay: 1200, interval: 600, type: "ember_guard" },
      { count: 14, delay: 1000, interval: 300, type: "fire_imp" },
    ],
    // W10: Triple boss simultaneous spawn
    [
      { count: 1, interval: 3000, type: "doom_herald" },
      { count: 1, delay: 500, interval: 3000, type: "skeleton_king" },
      { count: 1, delay: 500, interval: 3200, type: "abomination" },
      { count: 6, delay: 3000, interval: 700, type: "dark_knight" },
      { count: 12, delay: 1800, interval: 360, type: "hellhound" },
    ],
    // W10: Everything dark fantasy at once
    [
      { count: 4, interval: 1600, type: "death_knight" },
      { count: 3, delay: 1200, interval: 1800, type: "lich" },
      { count: 6, delay: 1600, interval: 740, type: "fallen_paladin" },
      { count: 6, delay: 1400, interval: 580, type: "bone_mage" },
      { count: 18, delay: 1000, interval: 300, type: "magma_spawn" },
      { count: 5, delay: 1400, interval: 700, type: "volcanic_drake" },
    ],
    // W11: Penultimate - doom heralds + abominations
    [
      { count: 3, interval: 2200, type: "doom_herald" },
      { count: 2, delay: 1200, interval: 2600, type: "abomination" },
      { count: 2, delay: 1000, interval: 2400, type: "skeleton_king" },
      { count: 10, delay: 2000, interval: 420, type: "revenant" },
      { count: 10, delay: 1200, interval: 520, type: "ember_guard" },
    ],
    // W12: WYRM APOCALYPSE - everything burns
    [
      { count: 1, interval: 3500, type: "inferno_wyrm" },
      { count: 2, delay: 4000, interval: 2400, type: "doom_herald" },
      { count: 1, delay: 2000, interval: 3200, type: "abomination" },
      { count: 4, delay: 1800, interval: 1600, type: "death_knight" },
      { count: 8, delay: 1400, interval: 600, type: "dark_knight" },
      { count: 26, delay: 1200, interval: 220, type: "fire_imp" },
    ],
  ],
  // =====================
  // SANDBOX
  // =====================
  sandbox: [
    [{ count: 8, interval: 800, type: "frosh" }],
    [
      { count: 6, interval: 700, type: "sophomore" },
      { count: 4, delay: 2000, interval: 600, type: "frosh" },
    ],
    [
      { count: 5, interval: 800, type: "junior" },
      { count: 5, delay: 2500, interval: 700, type: "sophomore" },
      { count: 6, delay: 3000, interval: 500, type: "timber_wolf" },
    ],
    [
      { count: 4, interval: 900, type: "senior" },
      { count: 4, delay: 2000, interval: 800, type: "junior" },
    ],
    [
      { count: 3, interval: 1000, type: "gradstudent" },
      { count: 5, delay: 2500, interval: 800, type: "senior" },
      { count: 3, delay: 2800, interval: 800, type: "giant_eagle" },
      { count: 2, delay: 2800, interval: 900, type: "mantis" },
    ],
    [
      { count: 2, interval: 1200, type: "professor" },
      { count: 4, delay: 3000, interval: 900, type: "gradstudent" },
    ],
    [
      { count: 15, interval: 400, type: "frosh" },
      { count: 10, delay: 3000, interval: 500, type: "sophomore" },
      { count: 8, delay: 2500, interval: 450, type: "timber_wolf" },
    ],
    [
      { count: 3, interval: 1000, type: "professor" },
      { count: 6, delay: 2000, interval: 700, type: "senior" },
      { count: 8, delay: 4000, interval: 600, type: "junior" },
    ],
    [
      { count: 1, interval: 1000, type: "dean" },
      { count: 4, delay: 3000, interval: 900, type: "professor" },
      { count: 3, delay: 3000, interval: 800, type: "forest_troll" },
      { count: 2, delay: 3000, interval: 900, type: "bombardier_beetle" },
    ],
    [
      { count: 6, interval: 600, type: "ant_soldier" },
      { count: 5, delay: 2800, interval: 550, type: "locust" },
      { count: 4, delay: 2600, interval: 650, type: "centipede" },
      { count: 5, delay: 2400, interval: 500, type: "mosquito" },
      { count: 3, delay: 2400, interval: 700, type: "dragonfly" },
    ],
    [
      { count: 1, interval: 3000, type: "brood_mother" },
      { count: 3, delay: 2600, interval: 850, type: "orb_weaver" },
      { count: 4, delay: 2400, interval: 650, type: "silk_moth" },
      { count: 2, delay: 2200, interval: 900, type: "trapdoor_spider" },
      { count: 4, delay: 2200, interval: 600, type: "fire_ant" },
    ],
    [
      { count: 2, interval: 1200, type: "dean" },
      { count: 6, delay: 2500, interval: 700, type: "gradstudent" },
      { count: 20, delay: 5000, interval: 300, type: "frosh" },
    ],
  ],
  // =====================
  // DEV TEST LEVELS
  // =====================
  dev_building_showcase: [[{ count: 3, interval: 2000, type: "frosh" }]],
  dev_enemy_showcase: [
    // Wave 1: Bugs (all regions + boss)
    [
      { count: 1, interval: 1000, type: "orb_weaver" },
      { count: 1, delay: 3000, interval: 1000, type: "mantis" },
      { count: 1, delay: 3000, interval: 1000, type: "bombardier_beetle" },
      { count: 1, delay: 3000, interval: 1000, type: "mosquito" },
      { count: 1, delay: 3000, interval: 1000, type: "centipede" },
      { count: 1, delay: 3000, interval: 1000, type: "dragonfly" },
      { count: 1, delay: 3000, interval: 1000, type: "silk_moth" },
      { count: 1, delay: 3000, interval: 1000, type: "ant_soldier" },
      { count: 1, delay: 3000, interval: 1000, type: "locust" },
      { count: 1, delay: 3000, interval: 1000, type: "trapdoor_spider" },
      { count: 1, delay: 3000, interval: 1000, type: "ice_beetle" },
      { count: 1, delay: 3000, interval: 1000, type: "frost_tick" },
      { count: 1, delay: 3000, interval: 1000, type: "snow_moth" },
      { count: 1, delay: 3000, interval: 1000, type: "fire_ant" },
      { count: 1, delay: 3000, interval: 1000, type: "magma_beetle" },
      { count: 1, delay: 3000, interval: 1000, type: "ash_moth" },
      { count: 1, delay: 3000, interval: 1000, type: "brood_mother" },
    ],
    // Wave 2: Fantasy Creatures — Forest & Swamp
    [
      { count: 1, interval: 1000, type: "dire_bear" },
      { count: 1, delay: 3000, interval: 1000, type: "ancient_ent" },
      { count: 1, delay: 3000, interval: 1000, type: "forest_troll" },
      { count: 1, delay: 3000, interval: 1000, type: "timber_wolf" },
      { count: 1, delay: 3000, interval: 1000, type: "giant_eagle" },
      { count: 1, delay: 3000, interval: 1000, type: "swamp_hydra" },
      { count: 1, delay: 3000, interval: 1000, type: "giant_toad" },
      { count: 1, delay: 3000, interval: 1000, type: "vine_serpent" },
      { count: 1, delay: 3000, interval: 1000, type: "marsh_troll" },
    ],
    // Wave 3: Fantasy Creatures — Desert, Winter & Volcanic
    [
      { count: 1, interval: 1000, type: "phoenix" },
      { count: 1, delay: 3000, interval: 1000, type: "basilisk" },
      { count: 1, delay: 3000, interval: 1000, type: "djinn" },
      { count: 1, delay: 3000, interval: 1000, type: "manticore" },
      { count: 1, delay: 3000, interval: 1000, type: "frost_troll" },
      { count: 1, delay: 3000, interval: 1000, type: "dire_wolf" },
      { count: 1, delay: 3000, interval: 1000, type: "wendigo" },
      { count: 1, delay: 3000, interval: 1000, type: "mammoth" },
      { count: 1, delay: 3000, interval: 1000, type: "lava_golem" },
      { count: 1, delay: 3000, interval: 1000, type: "volcanic_drake" },
      { count: 1, delay: 3000, interval: 1000, type: "salamander" },
    ],
    // Wave 4: Regional Giant Bosses
    [
      { count: 1, interval: 1000, type: "titan_of_nassau" },
      { count: 1, delay: 3000, interval: 1000, type: "swamp_leviathan" },
      { count: 1, delay: 3000, interval: 1000, type: "sphinx_guardian" },
      { count: 1, delay: 3000, interval: 1000, type: "frost_colossus" },
      { count: 1, delay: 3000, interval: 1000, type: "inferno_wyrm" },
    ],
    // Wave 5: Dark Fantasy — Undead (skeletons + zombies)
    [
      { count: 1, interval: 1000, type: "skeleton_footman" },
      { count: 1, delay: 3000, interval: 1000, type: "skeleton_knight" },
      { count: 1, delay: 3000, interval: 1000, type: "skeleton_archer" },
      { count: 1, delay: 3000, interval: 1000, type: "skeleton_king" },
      { count: 1, delay: 3000, interval: 1000, type: "zombie_shambler" },
      { count: 1, delay: 3000, interval: 1000, type: "zombie_brute" },
      { count: 1, delay: 3000, interval: 1000, type: "zombie_spitter" },
      { count: 1, delay: 3000, interval: 1000, type: "ghoul" },
    ],
    // Wave 6: Dark Fantasy — Knights, Casters & Monsters
    [
      { count: 1, interval: 1000, type: "dark_knight" },
      { count: 1, delay: 3000, interval: 1000, type: "death_knight" },
      { count: 1, delay: 3000, interval: 1000, type: "fallen_paladin" },
      { count: 1, delay: 3000, interval: 1000, type: "black_guard" },
      { count: 1, delay: 3000, interval: 1000, type: "lich" },
      { count: 1, delay: 3000, interval: 1000, type: "wraith" },
      { count: 1, delay: 3000, interval: 1000, type: "bone_mage" },
      { count: 1, delay: 3000, interval: 1000, type: "dark_priest" },
      { count: 1, delay: 3000, interval: 1000, type: "revenant" },
      { count: 1, delay: 3000, interval: 1000, type: "abomination" },
      { count: 1, delay: 3000, interval: 1000, type: "hellhound" },
      { count: 1, delay: 3000, interval: 1000, type: "doom_herald" },
    ],
    // Wave 7: Academic Progression
    [
      { count: 1, interval: 1000, type: "frosh" },
      { count: 1, delay: 3000, interval: 1000, type: "sophomore" },
      { count: 1, delay: 3000, interval: 1000, type: "junior" },
      { count: 1, delay: 3000, interval: 1000, type: "senior" },
      { count: 1, delay: 3000, interval: 1000, type: "gradstudent" },
      { count: 1, delay: 3000, interval: 1000, type: "professor" },
      { count: 1, delay: 3000, interval: 1000, type: "dean" },
      { count: 1, delay: 3000, interval: 1000, type: "trustee" },
    ],
    // Wave 8: Campus & Ranged
    [
      { count: 1, interval: 1000, type: "mascot" },
      { count: 1, delay: 3000, interval: 1000, type: "athlete" },
      { count: 1, delay: 3000, interval: 1000, type: "tiger_fan" },
      { count: 1, delay: 3000, interval: 1000, type: "archer" },
      { count: 1, delay: 3000, interval: 1000, type: "mage" },
      { count: 1, delay: 3000, interval: 1000, type: "catapult" },
      { count: 1, delay: 3000, interval: 1000, type: "warlock" },
      { count: 1, delay: 3000, interval: 1000, type: "crossbowman" },
    ],
    // Wave 9: Swamp Region
    [
      { count: 1, interval: 1000, type: "hexer" },
      { count: 1, delay: 3000, interval: 1000, type: "harpy" },
      { count: 1, delay: 3000, interval: 1000, type: "wyvern" },
      { count: 1, delay: 3000, interval: 1000, type: "specter" },
      { count: 1, delay: 3000, interval: 1000, type: "berserker" },
      { count: 1, delay: 3000, interval: 1000, type: "golem" },
      { count: 1, delay: 3000, interval: 1000, type: "necromancer" },
      { count: 1, delay: 3000, interval: 1000, type: "shadow_knight" },
      { count: 1, delay: 3000, interval: 1000, type: "cultist" },
      { count: 1, delay: 3000, interval: 1000, type: "plaguebearer" },
      { count: 1, delay: 3000, interval: 1000, type: "thornwalker" },
      { count: 1, delay: 3000, interval: 1000, type: "bog_creature" },
      { count: 1, delay: 3000, interval: 1000, type: "will_o_wisp" },
      { count: 1, delay: 3000, interval: 1000, type: "swamp_troll" },
    ],
    // Wave 10: Desert Region
    [
      { count: 1, interval: 1000, type: "sandworm" },
      { count: 1, delay: 3000, interval: 1000, type: "nomad" },
      { count: 1, delay: 3000, interval: 1000, type: "scorpion" },
      { count: 1, delay: 3000, interval: 1000, type: "scarab" },
    ],
    // Wave 11: Winter Region
    [
      { count: 1, interval: 1000, type: "frostling" },
      { count: 1, delay: 3000, interval: 1000, type: "snow_goblin" },
      { count: 1, delay: 3000, interval: 1000, type: "yeti" },
      { count: 1, delay: 3000, interval: 1000, type: "ice_witch" },
    ],
    // Wave 12: Volcanic Region
    [
      { count: 1, interval: 1000, type: "infernal" },
      { count: 1, delay: 3000, interval: 1000, type: "magma_spawn" },
      { count: 1, delay: 3000, interval: 1000, type: "fire_imp" },
      { count: 1, delay: 3000, interval: 1000, type: "ember_guard" },
    ],
    // Wave 13: Boss / Special
    [
      { count: 1, interval: 1000, type: "banshee" },
      { count: 1, delay: 3000, interval: 1000, type: "juggernaut" },
      { count: 1, delay: 3000, interval: 1000, type: "assassin" },
      { count: 1, delay: 3000, interval: 1000, type: "dragon" },
    ],
  ],
};

export const WAVES: WaveGroup[][] = LEVEL_WAVES.poe;
