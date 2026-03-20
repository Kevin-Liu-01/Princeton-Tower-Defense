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
      { type: "frosh", count: 5, interval: 850 },
      { type: "frosh", count: 4, interval: 800, delay: 4500 },
      { type: "athlete", count: 3, interval: 750, delay: 4000 },
    ],
    // Wave 2: Ranged intro
    [
      { type: "archer", count: 3, interval: 800 },
      { type: "tiger_fan", count: 3, interval: 750, delay: 4000 },
      { type: "cultist", count: 3, interval: 750, delay: 3500 },
      { type: "frosh", count: 3, interval: 800, delay: 3500 },
    ],
    // Wave 3: Flying intro
    [
      { type: "mascot", count: 3, interval: 850 },
      { type: "sophomore", count: 3, interval: 800, delay: 3800 },
      { type: "athlete", count: 4, interval: 700, delay: 3500 },
      { type: "hexer", count: 3, interval: 800, delay: 3500 },
    ],
    // Wave 4: Mixed pressure
    [
      { type: "tiger_fan", count: 4, interval: 700 },
      { type: "crossbowman", count: 3, interval: 750, delay: 3200 },
      { type: "frosh", count: 5, interval: 650, delay: 3000 },
      { type: "harpy", count: 3, interval: 800, delay: 3200 },
      { type: "timber_wolf", count: 6, interval: 500, delay: 3000 },
    ],
    // Wave 5: Speed wave
    [
      { type: "berserker", count: 4, interval: 700 },
      { type: "athlete", count: 5, interval: 600, delay: 3000 },
      { type: "specter", count: 3, interval: 800, delay: 3000 },
      { type: "cultist", count: 4, interval: 650, delay: 3000 },
    ],
    // Wave 6: Tank challenge
    [
      { type: "junior", count: 3, interval: 1000 },
      { type: "archer", count: 4, interval: 700, delay: 2800 },
      { type: "frosh", count: 6, interval: 600, delay: 2800 },
      { type: "assassin", count: 3, interval: 800, delay: 2800 },
      { type: "giant_eagle", count: 3, interval: 800, delay: 2800 },
    ],
    // Wave 7: Boss intro
    [
      { type: "senior", count: 3, interval: 1400 },
      { type: "tiger_fan", count: 5, interval: 600, delay: 2500 },
      { type: "banshee", count: 3, interval: 800, delay: 2500 },
      { type: "mage", count: 4, interval: 700, delay: 2500 },
    ],
    // Wave 8: FINALE
    [
      { type: "senior", count: 4, interval: 1100 },
      { type: "harpy", count: 4, interval: 650, delay: 2200 },
      { type: "athlete", count: 6, interval: 500, delay: 2200 },
      { type: "hexer", count: 4, interval: 650, delay: 2200 },
      { type: "berserker", count: 4, interval: 600, delay: 2200 },
      { type: "timber_wolf", count: 8, interval: 450, delay: 2200 },
    ],
    // Wave 9: Skeleton march
    [
      { type: "skeleton_footman", count: 6, interval: 650 },
      { type: "zombie_shambler", count: 4, interval: 750, delay: 3000 },
      { type: "skeleton_archer", count: 3, interval: 800, delay: 2800 },
      { type: "athlete", count: 4, interval: 650, delay: 2800 },
    ],
    // Wave 10: Ghoul ambush
    [
      { type: "ghoul", count: 5, interval: 600 },
      { type: "skeleton_knight", count: 3, interval: 900, delay: 2800 },
      { type: "tiger_fan", count: 5, interval: 600, delay: 2500 },
      { type: "bone_mage", count: 2, interval: 1200, delay: 2500 },
      { type: "forest_troll", count: 3, interval: 800, delay: 2500 },
    ],
  ],

  carnegie: [
    // Wave 1: Opening
    [
      { type: "frosh", count: 5, interval: 800 },
      { type: "athlete", count: 4, interval: 700, delay: 4200 },
      { type: "hexer", count: 3, interval: 800, delay: 4000 },
    ],
    // Wave 2: Ranged focus
    [
      { type: "crossbowman", count: 3, interval: 800 },
      { type: "frosh", count: 4, interval: 750, delay: 3800 },
      { type: "tiger_fan", count: 4, interval: 700, delay: 3500 },
      { type: "mage", count: 3, interval: 850, delay: 3500 },
    ],
    // Wave 3: Assassin strike (moved up from typical wave 5 position)
    [
      { type: "assassin", count: 4, interval: 700 },
      { type: "berserker", count: 4, interval: 700, delay: 3200 },
      { type: "athlete", count: 5, interval: 600, delay: 2800 },
      { type: "tiger_fan", count: 4, interval: 650, delay: 2800 },
    ],
    // Wave 4: Tank push
    [
      { type: "junior", count: 4, interval: 850 },
      { type: "tiger_fan", count: 5, interval: 650, delay: 3200 },
      { type: "cultist", count: 4, interval: 700, delay: 3000 },
      { type: "berserker", count: 4, interval: 700, delay: 3000 },
    ],
    // Wave 5: Flying ambush (delayed, more dangerous)
    [
      { type: "wyvern", count: 3, interval: 1100 },
      { type: "harpy", count: 5, interval: 600, delay: 2800 },
      { type: "banshee", count: 4, interval: 750, delay: 2600 },
      { type: "specter", count: 4, interval: 700, delay: 2600 },
      { type: "giant_eagle", count: 3, interval: 750, delay: 2600 },
    ],
    // Wave 6: Plague wave
    [
      { type: "plaguebearer", count: 4, interval: 900 },
      { type: "warlock", count: 4, interval: 800, delay: 2800 },
      { type: "frosh", count: 6, interval: 550, delay: 2600 },
      { type: "wyvern", count: 3, interval: 1100, delay: 2800 },
    ],
    // Wave 7: Boss assault
    [
      { type: "senior", count: 4, interval: 1100 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2600 },
      { type: "tiger_fan", count: 6, interval: 550, delay: 2500 },
      { type: "hexer", count: 4, interval: 700, delay: 2500 },
      { type: "forest_troll", count: 4, interval: 700, delay: 2500 },
    ],
    // Wave 8: Necromancer wave
    [
      { type: "necromancer", count: 3, interval: 1400 },
      { type: "infernal", count: 4, interval: 950, delay: 2500 },
      { type: "athlete", count: 6, interval: 500, delay: 2400 },
      { type: "specter", count: 4, interval: 750, delay: 2400 },
    ],
    // Wave 9: Gradstudent boss
    [
      { type: "gradstudent", count: 3, interval: 1800 },
      { type: "senior", count: 4, interval: 900, delay: 2400 },
      { type: "harpy", count: 5, interval: 650, delay: 2200 },
      { type: "frosh", count: 7, interval: 500, delay: 2200 },
      { type: "banshee", count: 4, interval: 750, delay: 2200 },
      { type: "dire_bear", count: 2, interval: 1200, delay: 2400 },
    ],
    // Wave 10: FINALE
    [
      { type: "gradstudent", count: 4, interval: 1400 },
      { type: "assassin", count: 4, interval: 700, delay: 2000 },
      { type: "tiger_fan", count: 7, interval: 500, delay: 2000 },
      { type: "wyvern", count: 4, interval: 900, delay: 2000 },
      { type: "infernal", count: 4, interval: 800, delay: 2000 },
    ],
    // Wave 11: Undead vanguard
    [
      { type: "skeleton_knight", count: 4, interval: 800 },
      { type: "dark_knight", count: 3, interval: 1000, delay: 2800 },
      { type: "zombie_brute", count: 3, interval: 1100, delay: 2600 },
      { type: "frosh", count: 6, interval: 500, delay: 2500 },
      { type: "ancient_ent", count: 1, interval: 1200, delay: 2600 },
    ],
    // Wave 12: Dark sorcery
    [
      { type: "bone_mage", count: 3, interval: 1100 },
      { type: "dark_priest", count: 3, interval: 1000, delay: 2600 },
      { type: "skeleton_footman", count: 6, interval: 550, delay: 2400 },
      { type: "zombie_spitter", count: 3, interval: 900, delay: 2400 },
      { type: "tiger_fan", count: 5, interval: 600, delay: 2400 },
    ],
  ],

  nassau: [
    // Wave 1: Opening salvo
    [
      { type: "frosh", count: 5, interval: 800 },
      { type: "tiger_fan", count: 4, interval: 700, delay: 4000 },
      { type: "archer", count: 3, interval: 750, delay: 3800 },
    ],
    // Wave 2: Dark magic intro
    [
      { type: "cultist", count: 4, interval: 750 },
      { type: "hexer", count: 3, interval: 800, delay: 3800 },
      { type: "athlete", count: 5, interval: 650, delay: 3500 },
      { type: "sophomore", count: 3, interval: 800, delay: 3500 },
    ],
    // Wave 3: Air dominance
    [
      { type: "mascot", count: 4, interval: 750 },
      { type: "banshee", count: 3, interval: 900, delay: 3500 },
      { type: "harpy", count: 4, interval: 700, delay: 3200 },
      { type: "frosh", count: 5, interval: 650, delay: 3200 },
    ],
    // Wave 4: Tank siege
    [
      { type: "junior", count: 4, interval: 900 },
      { type: "tiger_fan", count: 5, interval: 650, delay: 3200 },
      { type: "crossbowman", count: 4, interval: 700, delay: 3000 },
      { type: "specter", count: 3, interval: 800, delay: 3000 },
    ],
    // Wave 5: Melee rush
    [
      { type: "berserker", count: 5, interval: 650 },
      { type: "assassin", count: 4, interval: 750, delay: 3000 },
      { type: "frosh", count: 6, interval: 550, delay: 2800 },
      { type: "athlete", count: 5, interval: 600, delay: 2800 },
    ],
    // Wave 6: Ranged barrage
    [
      { type: "mage", count: 4, interval: 850 },
      { type: "warlock", count: 4, interval: 800, delay: 2800 },
      { type: "archer", count: 5, interval: 650, delay: 2600 },
      { type: "tiger_fan", count: 5, interval: 600, delay: 2600 },
    ],
    // Wave 7: Plaguebearer siege
    [
      { type: "plaguebearer", count: 4, interval: 900 },
      { type: "infernal", count: 4, interval: 950, delay: 2600 },
      { type: "frosh", count: 6, interval: 550, delay: 2500 },
      { type: "wyvern", count: 3, interval: 1100, delay: 2500 },
      { type: "forest_troll", count: 4, interval: 700, delay: 2500 },
    ],
    // Wave 8: Professor arrives
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 4, interval: 1200, delay: 2500 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2400 },
      { type: "athlete", count: 6, interval: 500, delay: 2400 },
    ],
    // Wave 9: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1300 },
      { type: "senior", count: 4, interval: 900, delay: 2400 },
      { type: "harpy", count: 5, interval: 650, delay: 2200 },
      { type: "catapult", count: 3, interval: 1400, delay: 2200 },
    ],
    // Wave 10: Juggernaut siege
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "professor", count: 3, interval: 1600, delay: 2200 },
      { type: "tiger_fan", count: 6, interval: 500, delay: 2200 },
      { type: "banshee", count: 5, interval: 700, delay: 2200 },
      { type: "infernal", count: 4, interval: 800, delay: 2200 },
      { type: "dire_bear", count: 2, interval: 1000, delay: 2200 },
    ],
    // Wave 11: Dean's arrival
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "professor", count: 4, interval: 1400, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1100, delay: 2000 },
      { type: "wyvern", count: 4, interval: 900, delay: 2000 },
      { type: "frosh", count: 8, interval: 450, delay: 2000 },
    ],
    // Wave 12: NASSAU FINALE
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 4, interval: 1200, delay: 2000 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "assassin", count: 5, interval: 600, delay: 2000 },
      { type: "banshee", count: 6, interval: 600, delay: 2000 },
      { type: "berserker", count: 5, interval: 550, delay: 2000 },
      { type: "ancient_ent", count: 2, interval: 1000, delay: 2000 },
    ],
    // Wave 13: Death Knight assault
    [
      { type: "death_knight", count: 1, interval: 3000 },
      { type: "dark_knight", count: 4, interval: 1000, delay: 2200 },
      { type: "fallen_paladin", count: 3, interval: 1100, delay: 2200 },
      { type: "skeleton_king", count: 1, interval: 2800, delay: 2000 },
      { type: "skeleton_knight", count: 5, interval: 700, delay: 2000 },
    ],
    // Wave 14: Legion of the damned
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "lich", count: 1, interval: 2800, delay: 2200 },
      { type: "hellhound", count: 4, interval: 800, delay: 2200 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 2000 },
      { type: "revenant", count: 4, interval: 900, delay: 2000 },
      { type: "athlete", count: 6, interval: 500, delay: 2000 },
      { type: "dire_bear", count: 2, interval: 1000, delay: 2200 },
      { type: "ancient_ent", count: 1, interval: 1200, delay: 2000 },
    ],
    // Wave 15: THE NASSAU COLOSSUS
    [
      { type: "titan_of_nassau", count: 1, interval: 5000 },
      { type: "death_knight", count: 2, interval: 1800, delay: 3000 },
      { type: "skeleton_knight", count: 6, interval: 700, delay: 2000 },
      { type: "dark_knight", count: 4, interval: 1000, delay: 2000 },
      { type: "skeleton_footman", count: 8, interval: 450, delay: 2000 },
    ],
  ],

  // =====================
  // SWAMP REGION
  // Regional: bog_creature, will_o_wisp, swamp_troll
  // =====================
  bog: [
    // Wave 1: Swamp intro
    [
      { type: "bog_creature", count: 5, interval: 850 },
      { type: "will_o_wisp", count: 4, interval: 750, delay: 4500 },
      { type: "cultist", count: 3, interval: 800, delay: 4000 },
    ],
    // Wave 2: Spectral threat
    [
      { type: "specter", count: 3, interval: 850 },
      { type: "swamp_troll", count: 3, interval: 1000, delay: 4000 },
      { type: "hexer", count: 3, interval: 800, delay: 3800 },
      { type: "bog_creature", count: 4, interval: 700, delay: 3500 },
    ],
    // Wave 3: Flying introduction
    [
      { type: "harpy", count: 4, interval: 750 },
      { type: "banshee", count: 3, interval: 900, delay: 3500 },
      { type: "will_o_wisp", count: 5, interval: 650, delay: 3500 },
      { type: "thornwalker", count: 3, interval: 850, delay: 3500 },
    ],
    // Wave 4: Ranged assault
    [
      { type: "archer", count: 4, interval: 750 },
      { type: "mage", count: 3, interval: 850, delay: 3200 },
      { type: "swamp_troll", count: 4, interval: 950, delay: 3200 },
      { type: "bog_creature", count: 5, interval: 650, delay: 3000 },
      { type: "vine_serpent", count: 4, interval: 650, delay: 3000 },
    ],
    // Wave 5: Disease wave
    [
      { type: "plaguebearer", count: 3, interval: 900 },
      { type: "thornwalker", count: 4, interval: 800, delay: 3000 },
      { type: "will_o_wisp", count: 5, interval: 600, delay: 2800 },
      { type: "assassin", count: 3, interval: 800, delay: 2800 },
    ],
    // Wave 6: Tank wall
    [
      { type: "swamp_troll", count: 4, interval: 950 },
      { type: "senior", count: 3, interval: 1100, delay: 2800 },
      { type: "bog_creature", count: 6, interval: 550, delay: 2600 },
      { type: "berserker", count: 4, interval: 700, delay: 2600 },
      { type: "giant_toad", count: 3, interval: 800, delay: 2600 },
    ],
    // Wave 7: Necromancer rises
    [
      { type: "necromancer", count: 3, interval: 1400 },
      { type: "specter", count: 4, interval: 750, delay: 2500 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2500 },
      { type: "will_o_wisp", count: 6, interval: 550, delay: 2500 },
    ],
    // Wave 8: Air dominance
    [
      { type: "wyvern", count: 3, interval: 1200 },
      { type: "harpy", count: 5, interval: 650, delay: 2500 },
      { type: "swamp_troll", count: 4, interval: 900, delay: 2400 },
      { type: "infernal", count: 4, interval: 900, delay: 2400 },
      { type: "marsh_troll", count: 3, interval: 800, delay: 2400 },
    ],
    // Wave 9: Boss wave
    [
      { type: "gradstudent", count: 3, interval: 1600 },
      { type: "junior", count: 4, interval: 800, delay: 2400 },
      { type: "banshee", count: 4, interval: 750, delay: 2200 },
      { type: "bog_creature", count: 7, interval: 500, delay: 2200 },
      { type: "thornwalker", count: 3, interval: 800, delay: 2200 },
    ],
    // Wave 10: FINALE
    [
      { type: "gradstudent", count: 4, interval: 1400 },
      { type: "swamp_troll", count: 5, interval: 800, delay: 2000 },
      { type: "necromancer", count: 3, interval: 1200, delay: 2000 },
      { type: "wyvern", count: 4, interval: 900, delay: 2000 },
      { type: "will_o_wisp", count: 7, interval: 450, delay: 2000 },
      { type: "giant_toad", count: 3, interval: 800, delay: 2200 },
    ],
    // Wave 9: Shambling horde
    [
      { type: "zombie_shambler", count: 6, interval: 600 },
      { type: "zombie_spitter", count: 3, interval: 900, delay: 3000 },
      { type: "bog_creature", count: 5, interval: 650, delay: 2800 },
      { type: "skeleton_archer", count: 3, interval: 800, delay: 2800 },
    ],
    // Wave 10: Ghoul hunt
    [
      { type: "ghoul", count: 5, interval: 600 },
      { type: "skeleton_knight", count: 3, interval: 900, delay: 2600 },
      { type: "will_o_wisp", count: 5, interval: 550, delay: 2500 },
      { type: "dark_priest", count: 2, interval: 1200, delay: 2500 },
    ],
  ],

  witch_hut: [
    // Wave 1: Eerie opening
    [
      { type: "will_o_wisp", count: 5, interval: 800 },
      { type: "hexer", count: 3, interval: 800, delay: 4200 },
      { type: "bog_creature", count: 4, interval: 750, delay: 4000 },
    ],
    // Wave 2: Thornwalker intro
    [
      { type: "thornwalker", count: 4, interval: 800 },
      { type: "swamp_troll", count: 3, interval: 1000, delay: 3800 },
      { type: "specter", count: 3, interval: 850, delay: 3500 },
      { type: "will_o_wisp", count: 4, interval: 700, delay: 3500 },
    ],
    // Wave 3: Flying assault
    [
      { type: "harpy", count: 4, interval: 750 },
      { type: "banshee", count: 3, interval: 900, delay: 3500 },
      { type: "mascot", count: 3, interval: 800, delay: 3200 },
      { type: "bog_creature", count: 5, interval: 650, delay: 3200 },
    ],
    // Wave 4: Ranged wave
    [
      { type: "mage", count: 4, interval: 850 },
      { type: "archer", count: 4, interval: 700, delay: 3200 },
      { type: "swamp_troll", count: 4, interval: 950, delay: 3000 },
      { type: "crossbowman", count: 3, interval: 750, delay: 3000 },
    ],
    // Wave 5: Assassin strike
    [
      { type: "assassin", count: 4, interval: 750 },
      { type: "berserker", count: 4, interval: 700, delay: 3000 },
      { type: "will_o_wisp", count: 6, interval: 550, delay: 2800 },
      { type: "thornwalker", count: 3, interval: 800, delay: 2800 },
      { type: "vine_serpent", count: 4, interval: 650, delay: 2800 },
    ],
    // Wave 6: Surprise dean - early boss appearance
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "swamp_troll", count: 5, interval: 850, delay: 2800 },
      { type: "bog_creature", count: 7, interval: 500, delay: 2500 },
      { type: "thornwalker", count: 4, interval: 700, delay: 2500 },
    ],
    // Wave 7: Air superiority
    [
      { type: "wyvern", count: 3, interval: 1200 },
      { type: "harpy", count: 5, interval: 650, delay: 2600 },
      { type: "swamp_troll", count: 4, interval: 900, delay: 2500 },
      { type: "warlock", count: 4, interval: 800, delay: 2500 },
      { type: "giant_toad", count: 4, interval: 700, delay: 2500 },
    ],
    // Wave 8: Necromancer wave
    [
      { type: "necromancer", count: 4, interval: 1300 },
      { type: "specter", count: 5, interval: 700, delay: 2500 },
      { type: "senior", count: 4, interval: 900, delay: 2400 },
      { type: "will_o_wisp", count: 6, interval: 500, delay: 2400 },
    ],
    // Wave 9: Professor boss
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 3, interval: 1300, delay: 2400 },
      { type: "swamp_troll", count: 5, interval: 850, delay: 2200 },
      { type: "banshee", count: 4, interval: 750, delay: 2200 },
    ],
    // Wave 10: Dark convergence
    [
      { type: "shadow_knight", count: 4, interval: 1100 },
      { type: "necromancer", count: 3, interval: 1200, delay: 2200 },
      { type: "thornwalker", count: 4, interval: 750, delay: 2200 },
      { type: "bog_creature", count: 7, interval: 500, delay: 2200 },
      { type: "marsh_troll", count: 4, interval: 700, delay: 2200 },
    ],
    // Wave 11: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 4, interval: 900, delay: 2200 },
      { type: "wyvern", count: 4, interval: 950, delay: 2000 },
      { type: "infernal", count: 4, interval: 850, delay: 2000 },
      { type: "will_o_wisp", count: 7, interval: 450, delay: 2000 },
    ],
    // Wave 12: Juggernaut push
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "swamp_troll", count: 5, interval: 800, delay: 2000 },
      { type: "harpy", count: 5, interval: 650, delay: 2000 },
      { type: "plaguebearer", count: 4, interval: 750, delay: 2000 },
    ],
    // Wave 13: Triple threat
    [
      { type: "professor", count: 3, interval: 1800 },
      { type: "shadow_knight", count: 4, interval: 1000, delay: 2000 },
      { type: "banshee", count: 5, interval: 650, delay: 2000 },
      { type: "bog_creature", count: 8, interval: 450, delay: 2000 },
      { type: "berserker", count: 4, interval: 650, delay: 2000 },
      { type: "swamp_hydra", count: 1, interval: 1200, delay: 2200 },
    ],
    // Wave 14: FINALE
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 3, interval: 1600, delay: 2000 },
      { type: "necromancer", count: 4, interval: 1100, delay: 2000 },
      { type: "swamp_troll", count: 6, interval: 700, delay: 2000 },
      { type: "wyvern", count: 4, interval: 850, delay: 2000 },
      { type: "infernal", count: 5, interval: 700, delay: 2000 },
    ],
    // Wave 15: Dark ritual
    [
      { type: "dark_priest", count: 3, interval: 1100 },
      { type: "bone_mage", count: 3, interval: 1000, delay: 2600 },
      { type: "wraith", count: 3, interval: 1000, delay: 2500 },
      { type: "swamp_troll", count: 5, interval: 800, delay: 2400 },
      { type: "zombie_spitter", count: 4, interval: 800, delay: 2400 },
    ],
    // Wave 16: Black guard siege
    [
      { type: "black_guard", count: 3, interval: 1200 },
      { type: "zombie_brute", count: 4, interval: 1000, delay: 2400 },
      { type: "skeleton_knight", count: 5, interval: 750, delay: 2200 },
      { type: "bog_creature", count: 7, interval: 450, delay: 2200 },
      { type: "ghoul", count: 4, interval: 650, delay: 2200 },
    ],
  ],

  sunken_temple: [
    // Wave 1: Temple entrance
    [
      { type: "bog_creature", count: 5, interval: 850 },
      { type: "will_o_wisp", count: 4, interval: 750, delay: 4500 },
      { type: "thornwalker", count: 3, interval: 850, delay: 4000 },
    ],
    // Wave 2: Curse magic
    [
      { type: "hexer", count: 4, interval: 800 },
      { type: "cultist", count: 3, interval: 750, delay: 4000 },
      { type: "swamp_troll", count: 3, interval: 1000, delay: 3800 },
      { type: "specter", count: 3, interval: 850, delay: 3800 },
    ],
    // Wave 3: Flying scouts
    [
      { type: "harpy", count: 4, interval: 750 },
      { type: "banshee", count: 3, interval: 900, delay: 3500 },
      { type: "bog_creature", count: 5, interval: 650, delay: 3500 },
      { type: "mascot", count: 3, interval: 800, delay: 3500 },
    ],
    // Wave 4: Ranged barrage
    [
      { type: "archer", count: 4, interval: 750 },
      { type: "mage", count: 4, interval: 850, delay: 3200 },
      { type: "swamp_troll", count: 4, interval: 950, delay: 3200 },
      { type: "warlock", count: 3, interval: 900, delay: 3200 },
    ],
    // Wave 5: Speed assault
    [
      { type: "assassin", count: 4, interval: 750 },
      { type: "will_o_wisp", count: 6, interval: 550, delay: 3000 },
      { type: "berserker", count: 4, interval: 700, delay: 3000 },
      { type: "thornwalker", count: 3, interval: 800, delay: 3000 },
    ],
    // Wave 6: Disease ritual
    [
      { type: "plaguebearer", count: 4, interval: 900 },
      { type: "necromancer", count: 3, interval: 1300, delay: 2800 },
      { type: "swamp_troll", count: 4, interval: 900, delay: 2800 },
      { type: "specter", count: 4, interval: 750, delay: 2800 },
      { type: "giant_toad", count: 4, interval: 700, delay: 2800 },
    ],
    // Wave 7: Tank wall
    [
      { type: "junior", count: 4, interval: 850 },
      { type: "senior", count: 3, interval: 1100, delay: 2800 },
      { type: "bog_creature", count: 6, interval: 550, delay: 2600 },
      { type: "infernal", count: 3, interval: 950, delay: 2600 },
    ],
    // Wave 8: Air dominance
    [
      { type: "wyvern", count: 3, interval: 1200 },
      { type: "harpy", count: 5, interval: 650, delay: 2600 },
      { type: "crossbowman", count: 4, interval: 700, delay: 2600 },
      { type: "will_o_wisp", count: 6, interval: 500, delay: 2500 },
    ],
    // Wave 9: Shadow convergence
    [
      { type: "shadow_knight", count: 4, interval: 1100 },
      { type: "necromancer", count: 3, interval: 1200, delay: 2500 },
      { type: "swamp_troll", count: 5, interval: 850, delay: 2400 },
      { type: "banshee", count: 4, interval: 750, delay: 2400 },
      { type: "marsh_troll", count: 4, interval: 700, delay: 2400 },
    ],
    // Wave 10: Professor boss
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 3, interval: 1300, delay: 2400 },
      { type: "thornwalker", count: 4, interval: 750, delay: 2400 },
      { type: "warlock", count: 4, interval: 800, delay: 2400 },
    ],
    // Wave 11: Berserker charge
    [
      { type: "berserker", count: 5, interval: 650 },
      { type: "assassin", count: 4, interval: 750, delay: 2400 },
      { type: "swamp_troll", count: 5, interval: 850, delay: 2200 },
      { type: "harpy", count: 4, interval: 700, delay: 2200 },
      { type: "bog_creature", count: 6, interval: 500, delay: 2200 },
    ],
    // Wave 12: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 4, interval: 900, delay: 2200 },
      { type: "wyvern", count: 4, interval: 950, delay: 2200 },
      { type: "infernal", count: 4, interval: 850, delay: 2200 },
      { type: "will_o_wisp", count: 7, interval: 450, delay: 2200 },
    ],
    // Wave 13: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "professor", count: 3, interval: 1600, delay: 2200 },
      { type: "plaguebearer", count: 4, interval: 800, delay: 2000 },
      { type: "swamp_troll", count: 5, interval: 800, delay: 2000 },
      { type: "specter", count: 5, interval: 700, delay: 2000 },
      { type: "swamp_hydra", count: 1, interval: 1200, delay: 2200 },
    ],
    // Wave 14: Magic barrage
    [
      { type: "warlock", count: 5, interval: 800 },
      { type: "mage", count: 5, interval: 700, delay: 2000 },
      { type: "hexer", count: 4, interval: 700, delay: 2000 },
      { type: "catapult", count: 3, interval: 1200, delay: 2000 },
      { type: "bog_creature", count: 7, interval: 450, delay: 2000 },
    ],
    // Wave 15: Juggernaut push
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1000, delay: 2000 },
      { type: "wyvern", count: 4, interval: 900, delay: 2000 },
      { type: "thornwalker", count: 5, interval: 650, delay: 2000 },
    ],
    // Wave 16: Dean council
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 3, interval: 1600, delay: 2000 },
      { type: "swamp_troll", count: 6, interval: 750, delay: 2000 },
      { type: "banshee", count: 5, interval: 650, delay: 2000 },
      { type: "necromancer", count: 4, interval: 1100, delay: 2000 },
    ],
    // Wave 17: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "infernal", count: 5, interval: 750, delay: 2000 },
      { type: "harpy", count: 5, interval: 600, delay: 2000 },
      { type: "berserker", count: 5, interval: 600, delay: 2000 },
      { type: "swamp_hydra", count: 2, interval: 1000, delay: 2200 },
      { type: "vine_serpent", count: 5, interval: 600, delay: 2000 },
    ],
    // Wave 18: FINALE
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dean", count: 3, interval: 2000, delay: 2000 },
      { type: "shadow_knight", count: 5, interval: 900, delay: 2000 },
      { type: "swamp_troll", count: 7, interval: 650, delay: 2000 },
      { type: "wyvern", count: 5, interval: 800, delay: 2000 },
      { type: "professor", count: 3, interval: 1400, delay: 2000 },
    ],
    // Wave 19: Lich council
    [
      { type: "lich", count: 1, interval: 3000 },
      { type: "death_knight", count: 2, interval: 1600, delay: 2200 },
      { type: "wraith", count: 4, interval: 900, delay: 2200 },
      { type: "bone_mage", count: 3, interval: 1000, delay: 2000 },
      { type: "swamp_troll", count: 6, interval: 700, delay: 2000 },
    ],
    // Wave 20: Abomination unleashed
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "doom_herald", count: 1, interval: 2800, delay: 2200 },
      { type: "hellhound", count: 4, interval: 800, delay: 2200 },
      { type: "revenant", count: 3, interval: 1000, delay: 2000 },
      { type: "zombie_brute", count: 4, interval: 900, delay: 2000 },
      { type: "will_o_wisp", count: 7, interval: 450, delay: 2000 },
    ],
    // Wave 21: THE THESIS HYDRA
    [
      { type: "swamp_leviathan", count: 1, interval: 5000 },
      { type: "lich", count: 2, interval: 2000, delay: 3000 },
      { type: "zombie_brute", count: 5, interval: 850, delay: 2000 },
      { type: "dark_priest", count: 3, interval: 1000, delay: 2000 },
      { type: "zombie_shambler", count: 8, interval: 400, delay: 2000 },
    ],
  ],

  // =====================
  // DESERT REGION
  // Regional: nomad, scorpion, scarab
  // =====================
  oasis: [
    // Wave 1: Desert intro
    [
      { type: "nomad", count: 5, interval: 850 },
      { type: "scarab", count: 4, interval: 700, delay: 4500 },
      { type: "archer", count: 3, interval: 800, delay: 4000 },
    ],
    // Wave 2: Scorpion tanks
    [
      { type: "scorpion", count: 3, interval: 1000 },
      { type: "nomad", count: 4, interval: 750, delay: 4000 },
      { type: "cultist", count: 3, interval: 750, delay: 3800 },
      { type: "hexer", count: 3, interval: 800, delay: 3800 },
    ],
    // Wave 3: Flying intro
    [
      { type: "mascot", count: 4, interval: 750 },
      { type: "harpy", count: 3, interval: 800, delay: 3500 },
      { type: "scarab", count: 5, interval: 600, delay: 3500 },
      { type: "crossbowman", count: 3, interval: 750, delay: 3500 },
    ],
    // Wave 4: Ranged focus
    [
      { type: "mage", count: 4, interval: 850 },
      { type: "archer", count: 4, interval: 700, delay: 3200 },
      { type: "scorpion", count: 4, interval: 950, delay: 3200 },
      { type: "specter", count: 3, interval: 800, delay: 3000 },
      { type: "djinn", count: 3, interval: 750, delay: 3000 },
    ],
    // Wave 5: Sandworm terror
    [
      { type: "sandworm", count: 3, interval: 1200 },
      { type: "nomad", count: 5, interval: 600, delay: 3000 },
      { type: "berserker", count: 4, interval: 700, delay: 2800 },
      { type: "scarab", count: 5, interval: 550, delay: 2800 },
    ],
    // Wave 6: Tank wall
    [
      { type: "senior", count: 3, interval: 1100 },
      { type: "scorpion", count: 4, interval: 900, delay: 2800 },
      { type: "assassin", count: 3, interval: 800, delay: 2600 },
      { type: "plaguebearer", count: 3, interval: 900, delay: 2600 },
      { type: "manticore", count: 3, interval: 800, delay: 2600 },
    ],
    // Wave 7: Air assault
    [
      { type: "wyvern", count: 3, interval: 1200 },
      { type: "banshee", count: 4, interval: 750, delay: 2500 },
      { type: "nomad", count: 6, interval: 550, delay: 2400 },
      { type: "infernal", count: 3, interval: 950, delay: 2400 },
    ],
    // Wave 8: Shadow wave
    [
      { type: "shadow_knight", count: 3, interval: 1200 },
      { type: "necromancer", count: 3, interval: 1300, delay: 2400 },
      { type: "scorpion", count: 5, interval: 850, delay: 2200 },
      { type: "scarab", count: 6, interval: 500, delay: 2200 },
      { type: "djinn", count: 3, interval: 750, delay: 2400 },
    ],
    // Wave 9: Boss wave
    [
      { type: "gradstudent", count: 3, interval: 1600 },
      { type: "senior", count: 4, interval: 900, delay: 2200 },
      { type: "sandworm", count: 3, interval: 1100, delay: 2200 },
      { type: "wyvern", count: 3, interval: 1000, delay: 2200 },
      { type: "nomad", count: 7, interval: 450, delay: 2200 },
    ],
    // Wave 10: FINALE
    [
      { type: "gradstudent", count: 4, interval: 1400 },
      { type: "scorpion", count: 5, interval: 800, delay: 2000 },
      { type: "sandworm", count: 4, interval: 1000, delay: 2000 },
      { type: "harpy", count: 5, interval: 650, delay: 2000 },
      { type: "scarab", count: 8, interval: 400, delay: 2000 },
      { type: "manticore", count: 3, interval: 800, delay: 2200 },
    ],
    // Wave 11: Bone legion
    [
      { type: "skeleton_footman", count: 6, interval: 600 },
      { type: "skeleton_knight", count: 3, interval: 900, delay: 2800 },
      { type: "nomad", count: 5, interval: 650, delay: 2600 },
      { type: "skeleton_archer", count: 4, interval: 750, delay: 2600 },
    ],
    // Wave 12: Revenant wrath
    [
      { type: "revenant", count: 3, interval: 1000 },
      { type: "dark_knight", count: 3, interval: 1100, delay: 2600 },
      { type: "scarab", count: 7, interval: 450, delay: 2400 },
      { type: "zombie_brute", count: 2, interval: 1200, delay: 2400 },
    ],
  ],

  pyramid: [
    // Wave 1: Pyramid scouts
    [
      { type: "scarab", count: 5, interval: 750 },
      { type: "nomad", count: 4, interval: 800, delay: 4200 },
      { type: "archer", count: 3, interval: 800, delay: 4000 },
    ],
    // Wave 2: Tank intro
    [
      { type: "scorpion", count: 4, interval: 950 },
      { type: "hexer", count: 3, interval: 800, delay: 3800 },
      { type: "scarab", count: 5, interval: 600, delay: 3500 },
      { type: "crossbowman", count: 3, interval: 750, delay: 3500 },
    ],
    // Wave 3: Flying wave
    [
      { type: "harpy", count: 4, interval: 750 },
      { type: "mascot", count: 3, interval: 800, delay: 3500 },
      { type: "nomad", count: 5, interval: 650, delay: 3200 },
      { type: "banshee", count: 3, interval: 900, delay: 3200 },
    ],
    // Wave 4: Sandworm terror
    [
      { type: "sandworm", count: 3, interval: 1200 },
      { type: "scorpion", count: 4, interval: 900, delay: 3000 },
      { type: "berserker", count: 4, interval: 700, delay: 3000 },
      { type: "scarab", count: 5, interval: 550, delay: 2800 },
    ],
    // Wave 5: Ranged barrage
    [
      { type: "mage", count: 4, interval: 850 },
      { type: "warlock", count: 4, interval: 800, delay: 2800 },
      { type: "archer", count: 5, interval: 650, delay: 2800 },
      { type: "nomad", count: 5, interval: 600, delay: 2600 },
      { type: "djinn", count: 4, interval: 700, delay: 2600 },
    ],
    // Wave 6: Assassin strike
    [
      { type: "assassin", count: 4, interval: 750 },
      { type: "plaguebearer", count: 3, interval: 900, delay: 2600 },
      { type: "scorpion", count: 5, interval: 850, delay: 2500 },
      { type: "specter", count: 4, interval: 750, delay: 2500 },
    ],
    // Wave 7: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1300 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2500 },
      { type: "scarab", count: 6, interval: 500, delay: 2400 },
      { type: "infernal", count: 3, interval: 950, delay: 2400 },
      { type: "manticore", count: 3, interval: 800, delay: 2400 },
    ],
    // Wave 8: Dean arrives early
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 4, interval: 900, delay: 2400 },
      { type: "sandworm", count: 4, interval: 1000, delay: 2200 },
      { type: "scorpion", count: 6, interval: 750, delay: 2200 },
    ],
    // Wave 9: Professor + catapult barrage
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "catapult", count: 3, interval: 1200, delay: 2200 },
      { type: "scarab", count: 8, interval: 400, delay: 2000 },
      { type: "nomad", count: 7, interval: 450, delay: 2000 },
    ],
    // Wave 10: Air dominance
    [
      { type: "wyvern", count: 4, interval: 1000 },
      { type: "harpy", count: 5, interval: 650, delay: 2000 },
      { type: "catapult", count: 3, interval: 1200, delay: 2000 },
      { type: "scarab", count: 8, interval: 400, delay: 2000 },
      { type: "infernal", count: 4, interval: 800, delay: 2000 },
      { type: "basilisk", count: 2, interval: 1000, delay: 2200 },
    ],
    // Wave 11: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 3, interval: 1600, delay: 2000 },
      { type: "scorpion", count: 6, interval: 750, delay: 2000 },
      { type: "sandworm", count: 4, interval: 1000, delay: 2000 },
      { type: "berserker", count: 5, interval: 600, delay: 2000 },
    ],
    // Wave 12: FINALE
    [
      { type: "dean", count: 3, interval: 2000 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "scorpion", count: 6, interval: 700, delay: 2000 },
      { type: "wyvern", count: 5, interval: 800, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 900, delay: 2000 },
      { type: "catapult", count: 3, interval: 1100, delay: 2000 },
      { type: "phoenix", count: 1, interval: 1200, delay: 2200 },
    ],
    // Wave 13: Tomb guardians
    [
      { type: "skeleton_king", count: 1, interval: 3000 },
      { type: "bone_mage", count: 3, interval: 1000, delay: 2600 },
      { type: "wraith", count: 3, interval: 1000, delay: 2400 },
      { type: "scorpion", count: 5, interval: 800, delay: 2400 },
      { type: "skeleton_knight", count: 5, interval: 700, delay: 2200 },
    ],
    // Wave 14: Fallen paladin charge
    [
      { type: "fallen_paladin", count: 3, interval: 1100 },
      { type: "black_guard", count: 3, interval: 1200, delay: 2400 },
      { type: "dark_priest", count: 3, interval: 1000, delay: 2200 },
      { type: "nomad", count: 7, interval: 450, delay: 2200 },
      { type: "scarab", count: 6, interval: 500, delay: 2200 },
    ],
  ],

  sphinx: [
    // Wave 1: Sphinx guardians
    [
      { type: "nomad", count: 5, interval: 850 },
      { type: "scorpion", count: 3, interval: 1000, delay: 4200 },
      { type: "hexer", count: 3, interval: 800, delay: 4000 },
    ],
    // Wave 2: Desert swarm
    [
      { type: "scarab", count: 6, interval: 650 },
      { type: "crossbowman", count: 3, interval: 750, delay: 3800 },
      { type: "nomad", count: 4, interval: 700, delay: 3500 },
      { type: "cultist", count: 3, interval: 750, delay: 3500 },
    ],
    // Wave 3: Flying wave
    [
      { type: "wyvern", count: 3, interval: 1100 },
      { type: "harpy", count: 4, interval: 700, delay: 3500 },
      { type: "banshee", count: 3, interval: 900, delay: 3200 },
      { type: "scorpion", count: 4, interval: 950, delay: 3200 },
    ],
    // Wave 4: Sandworm pack
    [
      { type: "sandworm", count: 4, interval: 1100 },
      { type: "scarab", count: 6, interval: 550, delay: 3000 },
      { type: "berserker", count: 4, interval: 700, delay: 3000 },
      { type: "nomad", count: 5, interval: 600, delay: 2800 },
    ],
    // Wave 5: Ranged assault
    [
      { type: "archer", count: 5, interval: 700 },
      { type: "mage", count: 4, interval: 800, delay: 2800 },
      { type: "warlock", count: 4, interval: 800, delay: 2600 },
      { type: "scorpion", count: 4, interval: 900, delay: 2600 },
    ],
    // Wave 6: Plague wave
    [
      { type: "plaguebearer", count: 4, interval: 900 },
      { type: "infernal", count: 4, interval: 900, delay: 2600 },
      { type: "assassin", count: 4, interval: 750, delay: 2500 },
      { type: "specter", count: 4, interval: 750, delay: 2500 },
      { type: "manticore", count: 4, interval: 700, delay: 2500 },
    ],
    // Wave 7: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1300 },
      { type: "shadow_knight", count: 4, interval: 1100, delay: 2500 },
      { type: "scarab", count: 7, interval: 450, delay: 2400 },
      { type: "nomad", count: 6, interval: 550, delay: 2400 },
    ],
    // Wave 8: Professor boss
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 4, interval: 1200, delay: 2400 },
      { type: "scorpion", count: 5, interval: 850, delay: 2200 },
      { type: "catapult", count: 3, interval: 1200, delay: 2200 },
    ],
    // Wave 9: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 5, interval: 850, delay: 2200 },
      { type: "wyvern", count: 4, interval: 950, delay: 2200 },
      { type: "sandworm", count: 4, interval: 1000, delay: 2000 },
      { type: "scarab", count: 8, interval: 400, delay: 2000 },
      { type: "basilisk", count: 2, interval: 1000, delay: 2200 },
    ],
    // Wave 10: Dragon awakens
    [
      { type: "dragon", count: 1, interval: 3200 },
      { type: "professor", count: 3, interval: 1600, delay: 2000 },
      { type: "scorpion", count: 6, interval: 750, delay: 2000 },
      { type: "banshee", count: 5, interval: 650, delay: 2000 },
      { type: "nomad", count: 7, interval: 450, delay: 2000 },
    ],
    // Wave 11: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1000, delay: 2000 },
      { type: "infernal", count: 5, interval: 750, delay: 2000 },
      { type: "scarab", count: 8, interval: 400, delay: 2000 },
    ],
    // Wave 12: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "wyvern", count: 5, interval: 850, delay: 2000 },
      { type: "scorpion", count: 6, interval: 700, delay: 2000 },
      { type: "berserker", count: 5, interval: 600, delay: 2000 },
      { type: "phoenix", count: 2, interval: 1000, delay: 2200 },
    ],
    // Wave 13: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dragon", count: 1, interval: 2800, delay: 2000 },
      { type: "sandworm", count: 5, interval: 900, delay: 2000 },
      { type: "necromancer", count: 4, interval: 1000, delay: 2000 },
      { type: "nomad", count: 8, interval: 400, delay: 2000 },
    ],
    // Wave 14: FINALE
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dragon", count: 3, interval: 2000, delay: 2000 },
      { type: "dean", count: 3, interval: 2000, delay: 2000 },
      { type: "scorpion", count: 7, interval: 600, delay: 2000 },
      { type: "catapult", count: 4, interval: 1000, delay: 2000 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 18000 },
    ],
    // Wave 15: Desert death march
    [
      { type: "death_knight", count: 2, interval: 1800 },
      { type: "lich", count: 1, interval: 2800, delay: 2200 },
      { type: "hellhound", count: 4, interval: 800, delay: 2200 },
      { type: "skeleton_knight", count: 5, interval: 700, delay: 2000 },
      { type: "nomad", count: 7, interval: 450, delay: 2000 },
      { type: "phoenix", count: 2, interval: 1000, delay: 2200 },
      { type: "djinn", count: 4, interval: 700, delay: 2000 },
    ],
    // Wave 16: Herald of doom
    [
      { type: "doom_herald", count: 1, interval: 3000 },
      { type: "abomination", count: 1, interval: 3200, delay: 2200 },
      { type: "revenant", count: 4, interval: 900, delay: 2200 },
      { type: "fallen_paladin", count: 3, interval: 1100, delay: 2000 },
      { type: "scarab", count: 8, interval: 400, delay: 2000 },
    ],
    // Wave 17: THE MIDTERM SPHINX
    [
      { type: "sphinx_guardian", count: 1, interval: 5000 },
      { type: "death_knight", count: 2, interval: 1800, delay: 3000 },
      { type: "skeleton_king", count: 1, interval: 2800, delay: 2000 },
      { type: "skeleton_knight", count: 6, interval: 700, delay: 2000 },
      { type: "scorpion", count: 6, interval: 700, delay: 2000 },
    ],
  ],

  // =====================
  // WINTER REGION
  // Regional: snow_goblin, yeti, ice_witch, frostling
  // =====================
  glacier: [
    // Wave 1: Frozen intro
    [
      { type: "snow_goblin", count: 5, interval: 850 },
      { type: "frostling", count: 3, interval: 800, delay: 4500 },
      { type: "ice_witch", count: 3, interval: 850, delay: 4000 },
    ],
    // Wave 2: Frost rush
    [
      { type: "frostling", count: 6, interval: 600 },
      { type: "snow_goblin", count: 5, interval: 650, delay: 3800 },
      { type: "assassin", count: 3, interval: 750, delay: 3500 },
      { type: "ice_witch", count: 3, interval: 850, delay: 3500 },
    ],
    // Wave 3: Flying intro
    [
      { type: "mascot", count: 4, interval: 750 },
      { type: "harpy", count: 3, interval: 800, delay: 3500 },
      { type: "frostling", count: 4, interval: 700, delay: 3500 },
      { type: "ice_witch", count: 3, interval: 850, delay: 3500 },
    ],
    // Wave 4: Ranged barrage
    [
      { type: "archer", count: 4, interval: 750 },
      { type: "mage", count: 3, interval: 850, delay: 3200 },
      { type: "yeti", count: 4, interval: 950, delay: 3200 },
      { type: "crossbowman", count: 3, interval: 750, delay: 3000 },
      { type: "dire_wolf", count: 6, interval: 500, delay: 3000 },
    ],
    // Wave 5: Speed wave
    [
      { type: "assassin", count: 3, interval: 800 },
      { type: "berserker", count: 4, interval: 700, delay: 3000 },
      { type: "snow_goblin", count: 5, interval: 600, delay: 2800 },
      { type: "specter", count: 3, interval: 800, delay: 2800 },
    ],
    // Wave 6: Tank wall
    [
      { type: "senior", count: 3, interval: 1100 },
      { type: "yeti", count: 4, interval: 950, delay: 2800 },
      { type: "plaguebearer", count: 3, interval: 900, delay: 2600 },
      { type: "ice_witch", count: 4, interval: 800, delay: 2600 },
      { type: "frost_troll", count: 3, interval: 800, delay: 2600 },
    ],
    // Wave 7: Dark magic
    [
      { type: "necromancer", count: 3, interval: 1400 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2600 },
      { type: "frostling", count: 5, interval: 600, delay: 2500 },
      { type: "warlock", count: 3, interval: 850, delay: 2500 },
    ],
    // Wave 8: Air dominance
    [
      { type: "wyvern", count: 3, interval: 1200 },
      { type: "banshee", count: 4, interval: 800, delay: 2500 },
      { type: "yeti", count: 4, interval: 900, delay: 2400 },
      { type: "harpy", count: 4, interval: 700, delay: 2400 },
      { type: "dire_wolf", count: 6, interval: 500, delay: 2400 },
    ],
    // Wave 9: Professor boss
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 3, interval: 1300, delay: 2400 },
      { type: "snow_goblin", count: 6, interval: 500, delay: 2200 },
      { type: "infernal", count: 3, interval: 950, delay: 2200 },
    ],
    // Wave 10: Boss escalation
    [
      { type: "senior", count: 4, interval: 900 },
      { type: "junior", count: 4, interval: 800, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 700, delay: 2200 },
      { type: "berserker", count: 4, interval: 650, delay: 2200 },
      { type: "frost_troll", count: 4, interval: 700, delay: 2200 },
    ],
    // Wave 11: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "wyvern", count: 4, interval: 950, delay: 2200 },
      { type: "yeti", count: 5, interval: 850, delay: 2000 },
      { type: "frostling", count: 5, interval: 550, delay: 2000 },
      { type: "shadow_knight", count: 3, interval: 1100, delay: 2000 },
    ],
    // Wave 12: FINALE
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "yeti", count: 6, interval: 750, delay: 2000 },
      { type: "necromancer", count: 4, interval: 1100, delay: 2000 },
      { type: "snow_goblin", count: 8, interval: 450, delay: 2000 },
      { type: "banshee", count: 5, interval: 650, delay: 2000 },
      { type: "ice_witch", count: 4, interval: 700, delay: 2000 },
    ],
    // Wave 13: Frozen bones
    [
      { type: "skeleton_footman", count: 6, interval: 600 },
      { type: "zombie_shambler", count: 4, interval: 750, delay: 2800 },
      { type: "snow_goblin", count: 5, interval: 600, delay: 2600 },
      { type: "skeleton_archer", count: 3, interval: 800, delay: 2600 },
    ],
    // Wave 14: Wraith patrol
    [
      { type: "wraith", count: 3, interval: 1000 },
      { type: "dark_knight", count: 3, interval: 1100, delay: 2600 },
      { type: "frostling", count: 5, interval: 550, delay: 2400 },
      { type: "bone_mage", count: 2, interval: 1200, delay: 2400 },
      { type: "yeti", count: 4, interval: 900, delay: 2400 },
    ],
  ],

  fortress: [
    // Wave 1: Fortress defenders
    [
      { type: "snow_goblin", count: 5, interval: 850 },
      { type: "yeti", count: 3, interval: 1000, delay: 4200 },
      { type: "ice_witch", count: 3, interval: 850, delay: 4000 },
    ],
    // Wave 2: Ranged intro
    [
      { type: "archer", count: 4, interval: 750 },
      { type: "frostling", count: 4, interval: 700, delay: 3800 },
      { type: "crossbowman", count: 3, interval: 750, delay: 3500 },
      { type: "snow_goblin", count: 4, interval: 700, delay: 3500 },
    ],
    // Wave 3: Flying wave
    [
      { type: "harpy", count: 4, interval: 750 },
      { type: "banshee", count: 3, interval: 900, delay: 3500 },
      { type: "wyvern", count: 3, interval: 1100, delay: 3200 },
      { type: "yeti", count: 3, interval: 950, delay: 3200 },
    ],
    // Wave 4: Blizzard air raid
    [
      { type: "wyvern", count: 4, interval: 1000 },
      { type: "harpy", count: 5, interval: 650, delay: 3200 },
      { type: "banshee", count: 4, interval: 750, delay: 3000 },
      { type: "ice_witch", count: 4, interval: 800, delay: 2800 },
    ],
    // Wave 5: Speed assault
    [
      { type: "assassin", count: 4, interval: 750 },
      { type: "berserker", count: 4, interval: 700, delay: 2800 },
      { type: "frostling", count: 5, interval: 600, delay: 2800 },
      { type: "specter", count: 3, interval: 800, delay: 2800 },
      { type: "dire_wolf", count: 6, interval: 500, delay: 2800 },
    ],
    // Wave 6: Ranged barrage
    [
      { type: "mage", count: 4, interval: 850 },
      { type: "warlock", count: 4, interval: 800, delay: 2600 },
      { type: "archer", count: 5, interval: 650, delay: 2600 },
      { type: "snow_goblin", count: 5, interval: 600, delay: 2500 },
    ],
    // Wave 7: Dark convergence
    [
      { type: "necromancer", count: 4, interval: 1300 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2500 },
      { type: "yeti", count: 5, interval: 850, delay: 2400 },
      { type: "infernal", count: 3, interval: 950, delay: 2400 },
      { type: "frost_troll", count: 4, interval: 700, delay: 2400 },
    ],
    // Wave 8: Professor boss
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 3, interval: 1300, delay: 2400 },
      { type: "wyvern", count: 4, interval: 950, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 700, delay: 2200 },
    ],
    // Wave 9: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 5, interval: 850, delay: 2200 },
      { type: "yeti", count: 5, interval: 850, delay: 2200 },
      { type: "banshee", count: 4, interval: 700, delay: 2000 },
      { type: "frostling", count: 5, interval: 550, delay: 2000 },
    ],
    // Wave 10: Shadow convergence
    [
      { type: "shadow_knight", count: 4, interval: 1100 },
      { type: "necromancer", count: 4, interval: 1200, delay: 2200 },
      { type: "yeti", count: 5, interval: 800, delay: 2000 },
      { type: "specter", count: 5, interval: 700, delay: 2000 },
      { type: "snow_goblin", count: 7, interval: 450, delay: 2000 },
      { type: "mammoth", count: 1, interval: 1200, delay: 2200 },
    ],
    // Wave 11: Juggernaut push
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "wyvern", count: 4, interval: 900, delay: 2000 },
      { type: "ice_witch", count: 5, interval: 700, delay: 2000 },
      { type: "harpy", count: 5, interval: 600, delay: 2000 },
    ],
    // Wave 12: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 3, interval: 1600, delay: 2000 },
      { type: "yeti", count: 6, interval: 750, delay: 2000 },
      { type: "infernal", count: 4, interval: 800, delay: 2000 },
      { type: "berserker", count: 5, interval: 600, delay: 2000 },
    ],
    // Wave 13: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1000, delay: 2000 },
      { type: "frostling", count: 6, interval: 500, delay: 2000 },
      { type: "snow_goblin", count: 8, interval: 400, delay: 2000 },
      { type: "wendigo", count: 2, interval: 1000, delay: 2000 },
    ],
    // Wave 14: FINALE
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dean", count: 3, interval: 2200, delay: 2000 },
      { type: "yeti", count: 7, interval: 700, delay: 2000 },
      { type: "dragon", count: 1, interval: 2800, delay: 2000 },
      { type: "necromancer", count: 4, interval: 1000, delay: 2000 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 15000 },
    ],
    // Wave 15: Undead siege
    [
      { type: "skeleton_knight", count: 5, interval: 750 },
      { type: "fallen_paladin", count: 3, interval: 1100, delay: 2400 },
      { type: "zombie_brute", count: 3, interval: 1000, delay: 2200 },
      { type: "yeti", count: 5, interval: 800, delay: 2200 },
      { type: "dark_knight", count: 3, interval: 1000, delay: 2200 },
    ],
    // Wave 16: Dark convergence
    [
      { type: "lich", count: 1, interval: 2800 },
      { type: "bone_mage", count: 3, interval: 1000, delay: 2400 },
      { type: "dark_priest", count: 3, interval: 1000, delay: 2200 },
      { type: "revenant", count: 3, interval: 1000, delay: 2200 },
      { type: "frostling", count: 6, interval: 500, delay: 2000 },
      { type: "snow_goblin", count: 7, interval: 450, delay: 2000 },
    ],
  ],

  peak: [
    // Wave 1: Summit scouts
    [
      { type: "frostling", count: 5, interval: 800 },
      { type: "snow_goblin", count: 4, interval: 750, delay: 4500 },
      { type: "ice_witch", count: 3, interval: 850, delay: 4000 },
    ],
    // Wave 2: Yeti patrol
    [
      { type: "yeti", count: 3, interval: 1050 },
      { type: "hexer", count: 3, interval: 800, delay: 4000 },
      { type: "frostling", count: 4, interval: 700, delay: 3800 },
      { type: "cultist", count: 3, interval: 750, delay: 3800 },
    ],
    // Wave 3: Flying scouts
    [
      { type: "harpy", count: 4, interval: 750 },
      { type: "wyvern", count: 3, interval: 1100, delay: 3500 },
      { type: "snow_goblin", count: 5, interval: 650, delay: 3500 },
      { type: "mascot", count: 3, interval: 800, delay: 3500 },
    ],
    // Wave 4: Ranged barrage
    [
      { type: "crossbowman", count: 4, interval: 750 },
      { type: "mage", count: 4, interval: 800, delay: 3200 },
      { type: "yeti", count: 4, interval: 950, delay: 3200 },
      { type: "archer", count: 4, interval: 700, delay: 3000 },
    ],
    // Wave 5: Melee rush
    [
      { type: "berserker", count: 4, interval: 700 },
      { type: "assassin", count: 4, interval: 750, delay: 3000 },
      { type: "ice_witch", count: 4, interval: 800, delay: 2800 },
      { type: "specter", count: 3, interval: 800, delay: 2800 },
      { type: "frost_troll", count: 4, interval: 700, delay: 2800 },
    ],
    // Wave 6: Dark magic
    [
      { type: "necromancer", count: 3, interval: 1400 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2800 },
      { type: "frostling", count: 5, interval: 600, delay: 2600 },
      { type: "warlock", count: 4, interval: 800, delay: 2600 },
    ],
    // Wave 7: Tank siege
    [
      { type: "senior", count: 4, interval: 1000 },
      { type: "yeti", count: 5, interval: 850, delay: 2600 },
      { type: "plaguebearer", count: 3, interval: 900, delay: 2500 },
      { type: "snow_goblin", count: 6, interval: 550, delay: 2500 },
    ],
    // Wave 8: Professor boss
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 4, interval: 1200, delay: 2500 },
      { type: "wyvern", count: 4, interval: 950, delay: 2400 },
      { type: "infernal", count: 3, interval: 950, delay: 2400 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 4, interval: 1000 },
      { type: "banshee", count: 4, interval: 800, delay: 2400 },
      { type: "harpy", count: 5, interval: 650, delay: 2200 },
      { type: "yeti", count: 5, interval: 800, delay: 2200 },
      { type: "ice_witch", count: 4, interval: 750, delay: 2200 },
      { type: "dire_wolf", count: 8, interval: 450, delay: 2200 },
      { type: "frost_troll", count: 4, interval: 700, delay: 2000 },
    ],
    // Wave 10: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 5, interval: 850, delay: 2200 },
      { type: "shadow_knight", count: 4, interval: 1000, delay: 2200 },
      { type: "frostling", count: 6, interval: 500, delay: 2000 },
      { type: "snow_goblin", count: 7, interval: 450, delay: 2000 },
    ],
    // Wave 11: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "yeti", count: 5, interval: 800, delay: 2000 },
      { type: "dragon", count: 1, interval: 2800, delay: 2000 },
      { type: "necromancer", count: 4, interval: 1100, delay: 2000 },
    ],
    // Wave 12: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "wyvern", count: 5, interval: 850, delay: 2000 },
      { type: "ice_witch", count: 5, interval: 700, delay: 2000 },
      { type: "berserker", count: 5, interval: 600, delay: 2000 },
    ],
    // Wave 13: Golem awakens
    [
      { type: "golem", count: 1, interval: 2600 },
      { type: "professor", count: 3, interval: 1800, delay: 2000 },
      { type: "yeti", count: 6, interval: 750, delay: 2000 },
      { type: "infernal", count: 4, interval: 800, delay: 2000 },
      { type: "specter", count: 5, interval: 650, delay: 2000 },
      { type: "mammoth", count: 2, interval: 1000, delay: 2000 },
    ],
    // Wave 14: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "shadow_knight", count: 5, interval: 950, delay: 2000 },
      { type: "frostling", count: 6, interval: 500, delay: 2000 },
      { type: "snow_goblin", count: 8, interval: 400, delay: 2000 },
    ],
    // Wave 15: Dragon flight
    [
      { type: "dragon", count: 3, interval: 2200 },
      { type: "trustee", count: 1, interval: 2800, delay: 2000 },
      { type: "yeti", count: 7, interval: 700, delay: 2000 },
      { type: "wyvern", count: 5, interval: 800, delay: 2000 },
      { type: "catapult", count: 3, interval: 1200, delay: 2000 },
    ],
    // Wave 16: FINALE
    [
      { type: "golem", count: 3, interval: 2800 },
      { type: "trustee", count: 3, interval: 2200, delay: 2000 },
      { type: "yeti", count: 8, interval: 650, delay: 2000 },
      { type: "dragon", count: 3, interval: 2000, delay: 2000 },
      { type: "dean", count: 3, interval: 2000, delay: 2000 },
      { type: "juggernaut", count: 3, interval: 2400, delay: 15000 },
      { type: "wendigo", count: 2, interval: 1000, delay: 2000 },
      { type: "mammoth", count: 2, interval: 1000, delay: 2000 },
    ],
    // Wave 17: Death knight vanguard
    [
      { type: "death_knight", count: 2, interval: 1800 },
      { type: "black_guard", count: 3, interval: 1200, delay: 2200 },
      { type: "fallen_paladin", count: 3, interval: 1100, delay: 2200 },
      { type: "skeleton_knight", count: 5, interval: 700, delay: 2000 },
      { type: "yeti", count: 6, interval: 750, delay: 2000 },
    ],
    // Wave 18: Abomination rampage
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "doom_herald", count: 1, interval: 2800, delay: 2200 },
      { type: "hellhound", count: 4, interval: 800, delay: 2200 },
      { type: "revenant", count: 3, interval: 1000, delay: 2000 },
      { type: "ice_witch", count: 5, interval: 700, delay: 2000 },
      { type: "snow_goblin", count: 8, interval: 400, delay: 2000 },
    ],
    // Wave 19: THE JANUARY TITAN
    [
      { type: "frost_colossus", count: 1, interval: 5000 },
      { type: "death_knight", count: 2, interval: 1800, delay: 3000 },
      { type: "lich", count: 1, interval: 2800, delay: 2000 },
      { type: "skeleton_knight", count: 6, interval: 700, delay: 2000 },
      { type: "frostling", count: 8, interval: 400, delay: 2000 },
    ],
  ],

  // =====================
  // VOLCANIC REGION
  // Regional: magma_spawn, fire_imp, ember_guard
  // =====================
  lava: [
    // Wave 1: Volcanic intro
    [
      { type: "fire_imp", count: 5, interval: 850 },
      { type: "magma_spawn", count: 3, interval: 900, delay: 4500 },
      { type: "cultist", count: 3, interval: 800, delay: 4000 },
    ],
    // Wave 2: Ember guard intro
    [
      { type: "ember_guard", count: 3, interval: 1000 },
      { type: "fire_imp", count: 4, interval: 750, delay: 4000 },
      { type: "hexer", count: 3, interval: 800, delay: 3800 },
      { type: "infernal", count: 3, interval: 900, delay: 3800 },
    ],
    // Wave 3: Berserker rush
    [
      { type: "berserker", count: 5, interval: 650 },
      { type: "assassin", count: 4, interval: 750, delay: 3200 },
      { type: "fire_imp", count: 6, interval: 550, delay: 3000 },
      { type: "magma_spawn", count: 4, interval: 800, delay: 3000 },
    ],
    // Wave 4: Ranged barrage
    [
      { type: "archer", count: 4, interval: 750 },
      { type: "mage", count: 4, interval: 850, delay: 3200 },
      { type: "ember_guard", count: 4, interval: 900, delay: 3000 },
      { type: "warlock", count: 3, interval: 850, delay: 3000 },
      { type: "salamander", count: 6, interval: 500, delay: 3000 },
    ],
    // Wave 5: Berserker charge
    [
      { type: "berserker", count: 5, interval: 650 },
      { type: "assassin", count: 3, interval: 800, delay: 3000 },
      { type: "magma_spawn", count: 4, interval: 800, delay: 2800 },
      { type: "fire_imp", count: 5, interval: 600, delay: 2800 },
    ],
    // Wave 6: Dark forces
    [
      { type: "necromancer", count: 3, interval: 1400 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2800 },
      { type: "specter", count: 4, interval: 750, delay: 2600 },
      { type: "ember_guard", count: 4, interval: 900, delay: 2600 },
      { type: "volcanic_drake", count: 3, interval: 800, delay: 2600 },
    ],
    // Wave 7: Professor boss
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 3, interval: 1300, delay: 2600 },
      { type: "wyvern", count: 3, interval: 1100, delay: 2500 },
      { type: "infernal", count: 4, interval: 850, delay: 2500 },
    ],
    // Wave 8: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 4, interval: 900, delay: 2400 },
      { type: "ember_guard", count: 5, interval: 800, delay: 2400 },
      { type: "plaguebearer", count: 3, interval: 900, delay: 2200 },
      { type: "fire_imp", count: 6, interval: 500, delay: 2200 },
      { type: "salamander", count: 8, interval: 450, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 4, interval: 1000 },
      { type: "harpy", count: 5, interval: 650, delay: 2200 },
      { type: "banshee", count: 4, interval: 750, delay: 2200 },
      { type: "magma_spawn", count: 5, interval: 800, delay: 2000 },
    ],
    // Wave 10: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "ember_guard", count: 5, interval: 800, delay: 2000 },
      { type: "dragon", count: 1, interval: 2800, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1000, delay: 2000 },
      { type: "volcanic_drake", count: 3, interval: 800, delay: 2200 },
    ],
    // Wave 11: Shadow convergence
    [
      { type: "shadow_knight", count: 4, interval: 1100 },
      { type: "necromancer", count: 4, interval: 1200, delay: 2000 },
      { type: "infernal", count: 5, interval: 750, delay: 2000 },
      { type: "fire_imp", count: 7, interval: 450, delay: 2000 },
      { type: "specter", count: 5, interval: 650, delay: 2000 },
    ],
    // Wave 12: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "wyvern", count: 4, interval: 900, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 700, delay: 2000 },
      { type: "magma_spawn", count: 6, interval: 650, delay: 2000 },
    ],
    // Wave 13: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dragon", count: 1, interval: 2800, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 700, delay: 2000 },
      { type: "berserker", count: 5, interval: 600, delay: 2000 },
      { type: "fire_imp", count: 8, interval: 400, delay: 2000 },
    ],
    // Wave 14: FINALE
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dragon", count: 3, interval: 2000, delay: 2000 },
      { type: "dean", count: 3, interval: 2000, delay: 2000 },
      { type: "ember_guard", count: 7, interval: 600, delay: 2000 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "golem", count: 1, interval: 2600, delay: 18000 },
    ],
    // Wave 15: Hellhound pack
    [
      { type: "hellhound", count: 4, interval: 850 },
      { type: "revenant", count: 3, interval: 1000, delay: 2600 },
      { type: "fire_imp", count: 6, interval: 500, delay: 2400 },
      { type: "skeleton_knight", count: 4, interval: 800, delay: 2400 },
    ],
    // Wave 16: Dark knight charge
    [
      { type: "dark_knight", count: 4, interval: 1000 },
      { type: "fallen_paladin", count: 3, interval: 1100, delay: 2400 },
      { type: "ember_guard", count: 5, interval: 750, delay: 2200 },
      { type: "zombie_brute", count: 3, interval: 1000, delay: 2200 },
      { type: "magma_spawn", count: 6, interval: 600, delay: 2200 },
    ],
  ],

  crater: [
    // Wave 1: Caldera scouts
    [
      { type: "fire_imp", count: 5, interval: 850 },
      { type: "ember_guard", count: 3, interval: 950, delay: 4200 },
      { type: "infernal", count: 3, interval: 900, delay: 4000 },
    ],
    // Wave 2: Magma threat
    [
      { type: "magma_spawn", count: 4, interval: 850 },
      { type: "hexer", count: 3, interval: 800, delay: 3800 },
      { type: "fire_imp", count: 4, interval: 700, delay: 3500 },
      { type: "cultist", count: 3, interval: 750, delay: 3500 },
    ],
    // Wave 3: Flying assault
    [
      { type: "harpy", count: 4, interval: 750 },
      { type: "wyvern", count: 3, interval: 1100, delay: 3500 },
      { type: "banshee", count: 3, interval: 900, delay: 3200 },
      { type: "ember_guard", count: 4, interval: 900, delay: 3200 },
    ],
    // Wave 4: Ranged barrage
    [
      { type: "mage", count: 4, interval: 850 },
      { type: "archer", count: 4, interval: 700, delay: 3200 },
      { type: "warlock", count: 3, interval: 850, delay: 3000 },
      { type: "crossbowman", count: 3, interval: 750, delay: 3000 },
    ],
    // Wave 5: Melee rush
    [
      { type: "assassin", count: 4, interval: 750 },
      { type: "berserker", count: 5, interval: 650, delay: 2800 },
      { type: "magma_spawn", count: 4, interval: 800, delay: 2800 },
      { type: "fire_imp", count: 5, interval: 600, delay: 2600 },
      { type: "salamander", count: 6, interval: 500, delay: 2600 },
    ],
    // Wave 6: Plague and shadow
    [
      { type: "plaguebearer", count: 3, interval: 900 },
      { type: "necromancer", count: 3, interval: 1300, delay: 2600 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2600 },
      { type: "infernal", count: 4, interval: 850, delay: 2500 },
    ],
    // Wave 7: Tank wall
    [
      { type: "senior", count: 4, interval: 1000 },
      { type: "ember_guard", count: 5, interval: 850, delay: 2500 },
      { type: "specter", count: 4, interval: 750, delay: 2400 },
      { type: "fire_imp", count: 6, interval: 500, delay: 2400 },
      { type: "volcanic_drake", count: 4, interval: 700, delay: 2400 },
    ],
    // Wave 8: Professor boss
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 4, interval: 1200, delay: 2400 },
      { type: "wyvern", count: 4, interval: 950, delay: 2200 },
      { type: "magma_spawn", count: 5, interval: 800, delay: 2200 },
    ],
    // Wave 9: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 5, interval: 850, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 800, delay: 2200 },
      { type: "harpy", count: 5, interval: 650, delay: 2000 },
      { type: "infernal", count: 4, interval: 800, delay: 2000 },
    ],
    // Wave 10: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "dragon", count: 1, interval: 2800, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1000, delay: 2000 },
      { type: "fire_imp", count: 7, interval: 450, delay: 2000 },
      { type: "lava_golem", count: 1, interval: 1200, delay: 2200 },
    ],
    // Wave 11: Air superiority
    [
      { type: "wyvern", count: 5, interval: 950 },
      { type: "banshee", count: 5, interval: 700, delay: 2000 },
      { type: "ember_guard", count: 5, interval: 800, delay: 2000 },
      { type: "necromancer", count: 4, interval: 1100, delay: 2000 },
      { type: "magma_spawn", count: 5, interval: 700, delay: 2000 },
    ],
    // Wave 12: Juggernaut push
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "catapult", count: 3, interval: 1200, delay: 2000 },
      { type: "berserker", count: 5, interval: 600, delay: 2000 },
      { type: "fire_imp", count: 8, interval: 400, delay: 2000 },
    ],
    // Wave 13: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 3, interval: 1600, delay: 2400 },
      { type: "ember_guard", count: 6, interval: 700, delay: 1800 },
      { type: "wyvern", count: 5, interval: 800, delay: 2200 },
      { type: "infernal", count: 5, interval: 700, delay: 1600 },
      { type: "volcanic_drake", count: 4, interval: 700, delay: 1800 },
    ],
    // Wave 14: Golem awakens
    [
      { type: "golem", count: 1, interval: 2600 },
      { type: "trustee", count: 1, interval: 2800, delay: 2800 },
      { type: "dragon", count: 1, interval: 2800, delay: 1400 },
      { type: "shadow_knight", count: 5, interval: 900, delay: 2200 },
      { type: "magma_spawn", count: 6, interval: 650, delay: 1600 },
    ],
    // Wave 15: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dean", count: 3, interval: 2200, delay: 2000 },
      { type: "ember_guard", count: 7, interval: 650, delay: 2000 },
      { type: "dragon", count: 3, interval: 2000, delay: 2000 },
      { type: "specter", count: 6, interval: 600, delay: 2000 },
    ],
    // Wave 16: FINALE
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dragon", count: 3, interval: 2000, delay: 2000 },
      { type: "golem", count: 3, interval: 2800, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 550, delay: 2000 },
      { type: "dean", count: 3, interval: 2000, delay: 2000 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 18000 },
    ],
    // Wave 17: Fallen army
    [
      { type: "fallen_paladin", count: 3, interval: 1100 },
      { type: "death_knight", count: 2, interval: 1600, delay: 2200 },
      { type: "abomination", count: 1, interval: 3200, delay: 2200 },
      { type: "magma_spawn", count: 6, interval: 650, delay: 2000 },
      { type: "dark_knight", count: 4, interval: 1000, delay: 2000 },
    ],
    // Wave 18: Doom herald descent
    [
      { type: "doom_herald", count: 1, interval: 3000 },
      { type: "lich", count: 1, interval: 2800, delay: 2200 },
      { type: "hellhound", count: 4, interval: 800, delay: 2200 },
      { type: "ember_guard", count: 6, interval: 700, delay: 2000 },
      { type: "revenant", count: 4, interval: 900, delay: 2000 },
    ],
  ],

  throne: [
    // Wave 1: Throne approach
    [
      { type: "fire_imp", count: 5, interval: 850 },
      { type: "magma_spawn", count: 3, interval: 900, delay: 4200 },
      { type: "infernal", count: 3, interval: 900, delay: 4000 },
    ],
    // Wave 2: Ember vanguard
    [
      { type: "ember_guard", count: 4, interval: 900 },
      { type: "hexer", count: 3, interval: 800, delay: 3800 },
      { type: "fire_imp", count: 4, interval: 700, delay: 3500 },
      { type: "cultist", count: 3, interval: 750, delay: 3500 },
    ],
    // Wave 3: Flying wave
    [
      { type: "wyvern", count: 3, interval: 1100 },
      { type: "harpy", count: 4, interval: 700, delay: 3500 },
      { type: "banshee", count: 3, interval: 900, delay: 3200 },
      { type: "magma_spawn", count: 4, interval: 800, delay: 3200 },
    ],
    // Wave 4: Tank wall
    [
      { type: "senior", count: 4, interval: 1000 },
      { type: "ember_guard", count: 4, interval: 900, delay: 3200 },
      { type: "junior", count: 4, interval: 800, delay: 3000 },
      { type: "infernal", count: 4, interval: 850, delay: 3000 },
    ],
    // Wave 5: Ranged barrage
    [
      { type: "archer", count: 5, interval: 700 },
      { type: "mage", count: 5, interval: 750, delay: 2800 },
      { type: "warlock", count: 4, interval: 800, delay: 2800 },
      { type: "crossbowman", count: 3, interval: 750, delay: 2600 },
    ],
    // Wave 6: Speed assault
    [
      { type: "assassin", count: 5, interval: 700 },
      { type: "berserker", count: 5, interval: 650, delay: 2600 },
      { type: "fire_imp", count: 6, interval: 500, delay: 2600 },
      { type: "specter", count: 4, interval: 750, delay: 2500 },
      { type: "salamander", count: 8, interval: 450, delay: 2500 },
    ],
    // Wave 7: Dark convergence
    [
      { type: "necromancer", count: 4, interval: 1300 },
      { type: "shadow_knight", count: 4, interval: 1100, delay: 2500 },
      { type: "ember_guard", count: 5, interval: 800, delay: 2400 },
      { type: "plaguebearer", count: 4, interval: 800, delay: 2400 },
    ],
    // Wave 8: Professor boss
    [
      { type: "professor", count: 4, interval: 1800 },
      { type: "gradstudent", count: 4, interval: 1200, delay: 2400 },
      { type: "wyvern", count: 4, interval: 950, delay: 2200 },
      { type: "magma_spawn", count: 5, interval: 750, delay: 2200 },
    ],
    // Wave 9: Dean arrives
    [
      { type: "dean", count: 3, interval: 2400 },
      { type: "senior", count: 5, interval: 850, delay: 2200 },
      { type: "dragon", count: 1, interval: 2800, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 750, delay: 2000 },
      { type: "fire_imp", count: 7, interval: 450, delay: 2000 },
      { type: "volcanic_drake", count: 4, interval: 700, delay: 2000 },
    ],
    // Wave 10: Air dominance
    [
      { type: "wyvern", count: 5, interval: 950 },
      { type: "harpy", count: 6, interval: 600, delay: 2000 },
      { type: "banshee", count: 5, interval: 700, delay: 2000 },
      { type: "infernal", count: 5, interval: 750, delay: 2000 },
      { type: "magma_spawn", count: 6, interval: 650, delay: 2000 },
    ],
    // Wave 11: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 3, interval: 2200, delay: 2000 },
      { type: "dragon", count: 3, interval: 2000, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1000, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 650, delay: 2000 },
    ],
    // Wave 12: Golem awakens
    [
      { type: "golem", count: 3, interval: 2800 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "necromancer", count: 4, interval: 1100, delay: 2000 },
      { type: "catapult", count: 3, interval: 1200, delay: 2000 },
      { type: "fire_imp", count: 8, interval: 400, delay: 2000 },
      { type: "lava_golem", count: 2, interval: 1000, delay: 2200 },
    ],
    // Wave 13: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 4, interval: 1400, delay: 2000 },
      { type: "wyvern", count: 5, interval: 800, delay: 2000 },
      { type: "berserker", count: 5, interval: 600, delay: 2000 },
      { type: "magma_spawn", count: 7, interval: 550, delay: 2000 },
    ],
    // Wave 14: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dragon", count: 3, interval: 2000, delay: 2000 },
      { type: "shadow_knight", count: 5, interval: 900, delay: 2000 },
      { type: "ember_guard", count: 7, interval: 600, delay: 2000 },
      { type: "infernal", count: 5, interval: 700, delay: 2000 },
    ],
    // Wave 15: Dragon flight
    [
      { type: "dragon", count: 4, interval: 2000 },
      { type: "trustee", count: 1, interval: 2800, delay: 2000 },
      { type: "wyvern", count: 5, interval: 800, delay: 2000 },
      { type: "golem", count: 1, interval: 2600, delay: 2000 },
      { type: "specter", count: 6, interval: 600, delay: 2000 },
    ],
    // Wave 16: Triple Trustee
    [
      { type: "trustee", count: 4, interval: 2200 },
      { type: "golem", count: 3, interval: 2800, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 550, delay: 2000 },
      { type: "necromancer", count: 5, interval: 1000, delay: 2000 },
      { type: "fire_imp", count: 10, interval: 350, delay: 2000 },
      { type: "lava_golem", count: 2, interval: 1000, delay: 2000 },
      { type: "volcanic_drake", count: 5, interval: 700, delay: 2000 },
    ],
    // Wave 17: Ultimate assault
    [
      { type: "trustee", count: 4, interval: 2200 },
      { type: "dean", count: 3, interval: 2000, delay: 2000 },
      { type: "juggernaut", count: 3, interval: 2400, delay: 2000 },
      { type: "dragon", count: 3, interval: 2000, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 500, delay: 2000 },
    ],
    // Wave 18: THE ULTIMATE FINALE
    [
      { type: "trustee", count: 5, interval: 2000 },
      { type: "golem", count: 4, interval: 2000, delay: 2000 },
      { type: "dean", count: 3, interval: 2000, delay: 2000 },
      { type: "dragon", count: 4, interval: 1800, delay: 2000 },
      { type: "juggernaut", count: 3, interval: 2400, delay: 2000 },
      { type: "ember_guard", count: 10, interval: 400, delay: 2000 },
    ],
    // Wave 19: Infernal legion
    [
      { type: "death_knight", count: 3, interval: 1600 },
      { type: "black_guard", count: 3, interval: 1200, delay: 2200 },
      { type: "hellhound", count: 5, interval: 750, delay: 2200 },
      { type: "revenant", count: 4, interval: 900, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 500, delay: 2000 },
    ],
    // Wave 20: Apocalypse
    [
      { type: "doom_herald", count: 2, interval: 2400 },
      { type: "abomination", count: 2, interval: 2800, delay: 2200 },
      { type: "lich", count: 2, interval: 2400, delay: 2200 },
      { type: "skeleton_king", count: 1, interval: 2800, delay: 2000 },
      { type: "fallen_paladin", count: 4, interval: 1000, delay: 2000 },
      { type: "fire_imp", count: 10, interval: 350, delay: 2000 },
    ],
    // Wave 21: THE BURNOUT WYRM
    [
      { type: "inferno_wyrm", count: 1, interval: 5000 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 3000 },
      { type: "hellhound", count: 5, interval: 750, delay: 2000 },
      { type: "death_knight", count: 3, interval: 1400, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 500, delay: 2000 },
    ],
  ],

  // IVY CROSSROADS - "Pincer Siege" (dual-path, alternating pressure)
  ivy_crossroads: [
    // W1: Intro rush from both paths
    [
      { type: "athlete", count: 7, interval: 700 },
      { type: "tiger_fan", count: 6, interval: 680, delay: 2800 },
      { type: "crossbowman", count: 4, interval: 780, delay: 2600 },
    ],
    // W2: Flying screen + caster support
    [
      { type: "harpy", count: 5, interval: 650 },
      { type: "mage", count: 4, interval: 780, delay: 2300 },
      { type: "frosh", count: 8, interval: 520, delay: 2100 },
    ],
    // W3: All-speed blitz - tight intervals, fast enemies
    [
      { type: "assassin", count: 6, interval: 550 },
      { type: "berserker", count: 5, interval: 600, delay: 1800 },
      { type: "athlete", count: 10, interval: 400, delay: 1600 },
    ],
    // W4: Tank wall with ranged backline
    [
      { type: "junior", count: 5, interval: 900 },
      { type: "skeleton_knight", count: 3, interval: 1100, delay: 2400 },
      { type: "crossbowman", count: 6, interval: 620, delay: 2200 },
      { type: "bone_mage", count: 3, interval: 900, delay: 2000 },
      { type: "forest_troll", count: 4, interval: 700, delay: 2200 },
    ],
    // W5: Air superiority - all flying, forces anti-air
    [
      { type: "wyvern", count: 5, interval: 900 },
      { type: "harpy", count: 6, interval: 580, delay: 2200 },
      { type: "banshee", count: 5, interval: 650, delay: 1900 },
      { type: "specter", count: 6, interval: 600, delay: 1700 },
    ],
    // W6: Surprise early dean + dark knight vanguard
    [
      { type: "dean", count: 1, interval: 3000 },
      { type: "dark_knight", count: 4, interval: 950, delay: 2600 },
      { type: "fallen_paladin", count: 3, interval: 1100, delay: 2200 },
      { type: "tiger_fan", count: 12, interval: 400, delay: 1800 },
      { type: "giant_eagle", count: 3, interval: 750, delay: 2000 },
    ],
    // W7: Necromantic tide - caster-heavy, healing-disruption
    [
      { type: "lich", count: 1, interval: 2600 },
      { type: "dark_priest", count: 4, interval: 850, delay: 2400 },
      { type: "wraith", count: 8, interval: 480, delay: 1800 },
      { type: "skeleton_archer", count: 6, interval: 600, delay: 1600 },
    ],
    // W8: Breaker wave - one mega-tank + speed flankers
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "hellhound", count: 14, interval: 340, delay: 2800 },
      { type: "revenant", count: 6, interval: 550, delay: 1500 },
      { type: "dire_bear", count: 2, interval: 1000, delay: 2000 },
    ],
    // W9: Full dark fantasy army - balanced and relentless
    [
      { type: "death_knight", count: 2, interval: 2200 },
      { type: "skeleton_king", count: 1, interval: 3000, delay: 2400 },
      { type: "black_guard", count: 5, interval: 720, delay: 1800 },
      { type: "zombie_brute", count: 3, interval: 1200, delay: 1600 },
      { type: "skeleton_footman", count: 14, interval: 360, delay: 1400 },
    ],
    // W10: Doom wave - overlapping bosses
    [
      { type: "doom_herald", count: 2, interval: 2400 },
      { type: "death_knight", count: 2, interval: 2000, delay: 1200 },
      { type: "dark_knight", count: 6, interval: 700, delay: 1800 },
      { type: "athlete", count: 20, interval: 280, delay: 1400 },
      { type: "ancient_ent", count: 1, interval: 1200, delay: 2000 },
    ],
    // W11: Desperate defense - everything at once
    [
      { type: "skeleton_king", count: 2, interval: 2400 },
      { type: "lich", count: 2, interval: 2000, delay: 1600 },
      { type: "fallen_paladin", count: 5, interval: 800, delay: 1400 },
      { type: "bone_mage", count: 6, interval: 580, delay: 1200 },
      { type: "zombie_shambler", count: 20, interval: 260, delay: 1000 },
    ],
    // W12: TITAN FINALE - region boss + elite escort
    [
      { type: "titan_of_nassau", count: 1, interval: 3500 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 4000 },
      { type: "abomination", count: 1, interval: 3200, delay: 2000 },
      { type: "death_knight", count: 3, interval: 1800, delay: 1800 },
      { type: "skeleton_footman", count: 24, interval: 250, delay: 1400 },
    ],
  ],

  // BLIGHT BASIN - "Toxic Attrition" (plague/poison grind, tanky swamp waves)
  blight_basin: [
    // W1: Swamp crawlers intro
    [
      { type: "bog_creature", count: 7, interval: 730 },
      { type: "will_o_wisp", count: 7, interval: 620, delay: 2800 },
      { type: "thornwalker", count: 5, interval: 760, delay: 2600 },
    ],
    // W2: Plaguebearer vanguard - poison theme early
    [
      { type: "plaguebearer", count: 5, interval: 820 },
      { type: "zombie_spitter", count: 4, interval: 780, delay: 2500 },
      { type: "bog_creature", count: 10, interval: 460, delay: 2100 },
    ],
    // W3: Troll wall - heavy armor, slow but durable
    [
      { type: "swamp_troll", count: 7, interval: 800 },
      { type: "zombie_brute", count: 2, interval: 1400, delay: 2600 },
      { type: "thornwalker", count: 8, interval: 600, delay: 2200 },
      { type: "vine_serpent", count: 5, interval: 600, delay: 2200 },
    ],
    // W4: Spectral swarm - fast ghosts, hard to pin down
    [
      { type: "wraith", count: 6, interval: 550 },
      { type: "specter", count: 7, interval: 520, delay: 1800 },
      { type: "banshee", count: 5, interval: 600, delay: 1600 },
      { type: "will_o_wisp", count: 10, interval: 380, delay: 1400 },
    ],
    // W5: Necromancer council - casters behind meat shields
    [
      { type: "necromancer", count: 5, interval: 1100 },
      { type: "dark_priest", count: 3, interval: 950, delay: 2600 },
      { type: "zombie_shambler", count: 14, interval: 350, delay: 2000 },
      { type: "skeleton_footman", count: 10, interval: 420, delay: 1600 },
      { type: "giant_toad", count: 4, interval: 700, delay: 2000 },
    ],
    // W6: Air ambush after ground-heavy waves
    [
      { type: "wyvern", count: 6, interval: 850 },
      { type: "harpy", count: 7, interval: 550, delay: 2000 },
      { type: "banshee", count: 6, interval: 600, delay: 1700 },
    ],
    // W7: Zombie apocalypse - sheer numbers
    [
      { type: "zombie_brute", count: 4, interval: 1100 },
      { type: "zombie_shambler", count: 20, interval: 280, delay: 2400 },
      { type: "zombie_spitter", count: 6, interval: 600, delay: 1800 },
      { type: "ghoul", count: 8, interval: 500, delay: 1400 },
    ],
    // W8: Dark knight garrison - armored elite push
    [
      { type: "death_knight", count: 1, interval: 3000 },
      { type: "black_guard", count: 5, interval: 720, delay: 2600 },
      { type: "dark_knight", count: 4, interval: 900, delay: 2000 },
      { type: "swamp_troll", count: 8, interval: 650, delay: 1600 },
      { type: "marsh_troll", count: 4, interval: 700, delay: 1800 },
    ],
    // W9: Lich king's court - caster bosses + skeleton army
    [
      { type: "lich", count: 2, interval: 2200 },
      { type: "skeleton_king", count: 1, interval: 3000, delay: 2800 },
      { type: "bone_mage", count: 5, interval: 680, delay: 2000 },
      { type: "skeleton_knight", count: 6, interval: 700, delay: 1600 },
      { type: "bog_creature", count: 16, interval: 320, delay: 1200 },
    ],
    // W10: Double threat - simultaneous boss + swarm
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 800 },
      { type: "revenant", count: 8, interval: 480, delay: 2400 },
      { type: "hellhound", count: 10, interval: 380, delay: 1600 },
      { type: "swamp_hydra", count: 1, interval: 1200, delay: 2000 },
    ],
    // W11: Last stand - everything toxic and undead
    [
      { type: "death_knight", count: 3, interval: 1800 },
      { type: "lich", count: 2, interval: 2000, delay: 1400 },
      { type: "fallen_paladin", count: 4, interval: 900, delay: 1800 },
      { type: "plaguebearer", count: 8, interval: 520, delay: 1200 },
      { type: "will_o_wisp", count: 20, interval: 260, delay: 1000 },
    ],
    // W12: LEVIATHAN FINALE - grinding mega-boss
    [
      { type: "swamp_leviathan", count: 1, interval: 3500 },
      { type: "abomination", count: 1, interval: 3200, delay: 5000 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 3000 },
      { type: "zombie_brute", count: 5, interval: 1000, delay: 2000 },
      { type: "zombie_shambler", count: 24, interval: 240, delay: 1400 },
    ],
  ],

  // SUNSCORCH LABYRINTH - "Sandstorm Blitz" (speed-focused, overwhelming numbers)
  sunscorch_labyrinth: [
    // W1: Desert swarm - fast fodder from the start
    [
      { type: "scarab", count: 12, interval: 420 },
      { type: "nomad", count: 8, interval: 550, delay: 2200 },
    ],
    // W2: Ranged ambush with scorpion tanks
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "scorpion", count: 6, interval: 780, delay: 2400 },
      { type: "skeleton_archer", count: 4, interval: 700, delay: 2000 },
      { type: "scarab", count: 10, interval: 380, delay: 1800 },
    ],
    // W3: Sandworm gauntlet - burrowers demand AoE
    [
      { type: "sandworm", count: 6, interval: 850 },
      { type: "scorpion", count: 8, interval: 580, delay: 2400 },
      { type: "nomad", count: 10, interval: 420, delay: 1800 },
      { type: "djinn", count: 4, interval: 700, delay: 2000 },
    ],
    // W4: Hellhound stampede - pure speed wave
    [
      { type: "hellhound", count: 12, interval: 350 },
      { type: "assassin", count: 6, interval: 520, delay: 1600 },
      { type: "wraith", count: 5, interval: 550, delay: 1400 },
      { type: "scarab", count: 14, interval: 320, delay: 1200 },
    ],
    // W5: Dark knight caravan - armored column
    [
      { type: "dark_knight", count: 5, interval: 900 },
      { type: "fallen_paladin", count: 3, interval: 1100, delay: 2400 },
      { type: "black_guard", count: 4, interval: 800, delay: 2000 },
      { type: "sandworm", count: 5, interval: 900, delay: 1600 },
      { type: "manticore", count: 3, interval: 800, delay: 1800 },
    ],
    // W6: Flying sandstorm - all air
    [
      { type: "wyvern", count: 6, interval: 800 },
      { type: "harpy", count: 8, interval: 500, delay: 2000 },
      { type: "banshee", count: 6, interval: 580, delay: 1500 },
    ],
    // W7: Bone mage artillery + meat shield
    [
      { type: "lich", count: 1, interval: 2800 },
      { type: "bone_mage", count: 6, interval: 600, delay: 2400 },
      { type: "zombie_brute", count: 4, interval: 1000, delay: 2000 },
      { type: "skeleton_footman", count: 16, interval: 300, delay: 1400 },
    ],
    // W8: Death knight charge - elite melee
    [
      { type: "death_knight", count: 2, interval: 2200 },
      { type: "skeleton_king", count: 1, interval: 3000, delay: 2600 },
      { type: "revenant", count: 8, interval: 460, delay: 1800 },
      { type: "nomad", count: 14, interval: 340, delay: 1400 },
      { type: "basilisk", count: 2, interval: 1000, delay: 1800 },
    ],
    // W9: Dual-boss ambush
    [
      { type: "doom_herald", count: 1, interval: 3000 },
      { type: "abomination", count: 1, interval: 3200, delay: 600 },
      { type: "dark_knight", count: 5, interval: 780, delay: 2400 },
      { type: "hellhound", count: 10, interval: 380, delay: 1600 },
    ],
    // W10: Endless scarab swarm - survive the flood
    [
      { type: "death_knight", count: 2, interval: 2000 },
      { type: "skeleton_king", count: 2, interval: 2400, delay: 1800 },
      { type: "fallen_paladin", count: 5, interval: 800, delay: 1400 },
      { type: "scarab", count: 30, interval: 200, delay: 1000 },
      { type: "phoenix", count: 1, interval: 1200, delay: 2000 },
    ],
    // W11: Dark convergence
    [
      { type: "lich", count: 2, interval: 2000 },
      { type: "doom_herald", count: 2, interval: 2400, delay: 1400 },
      { type: "dark_priest", count: 4, interval: 800, delay: 2000 },
      { type: "bone_mage", count: 6, interval: 580, delay: 1200 },
      { type: "scorpion", count: 16, interval: 320, delay: 1000 },
    ],
    // W12: SPHINX FINALE - guardian + relentless swarm
    [
      { type: "sphinx_guardian", count: 1, interval: 3500 },
      { type: "death_knight", count: 3, interval: 1800, delay: 4000 },
      { type: "abomination", count: 1, interval: 3200, delay: 2000 },
      { type: "skeleton_footman", count: 20, interval: 260, delay: 1600 },
      { type: "scarab", count: 26, interval: 220, delay: 1200 },
    ],
  ],

  // WHITEOUT PASS - "Frozen Fortress" (armored, tanky, endurance test)
  whiteout_pass: [
    // W1: Blizzard scouts
    [
      { type: "snow_goblin", count: 9, interval: 620 },
      { type: "frostling", count: 7, interval: 610, delay: 2600 },
      { type: "ice_witch", count: 4, interval: 760, delay: 2400 },
    ],
    // W2: Yeti vanguard - heavy hitters early
    [
      { type: "yeti", count: 6, interval: 850 },
      { type: "snow_goblin", count: 12, interval: 420, delay: 2400 },
      { type: "skeleton_knight", count: 3, interval: 1000, delay: 2000 },
    ],
    // W3: Ice witch barrage - ranged magic pressure
    [
      { type: "ice_witch", count: 8, interval: 650 },
      { type: "bone_mage", count: 4, interval: 800, delay: 2400 },
      { type: "frostling", count: 10, interval: 430, delay: 1800 },
      { type: "dire_wolf", count: 6, interval: 500, delay: 2000 },
    ],
    // W4: Surprise speed wave - breaks the tank pattern
    [
      { type: "wraith", count: 8, interval: 450 },
      { type: "assassin", count: 6, interval: 520, delay: 1600 },
      { type: "hellhound", count: 8, interval: 400, delay: 1200 },
    ],
    // W5: Armored column - pure tank test
    [
      { type: "black_guard", count: 5, interval: 800 },
      { type: "dark_knight", count: 4, interval: 950, delay: 2600 },
      { type: "yeti", count: 8, interval: 700, delay: 2000 },
      { type: "zombie_brute", count: 3, interval: 1200, delay: 1600 },
      { type: "frost_troll", count: 4, interval: 700, delay: 1800 },
    ],
    // W6: Catapult siege - ranged devastation
    [
      { type: "catapult", count: 4, interval: 1200 },
      { type: "skeleton_archer", count: 6, interval: 600, delay: 2400 },
      { type: "crossbowman", count: 6, interval: 620, delay: 1800 },
      { type: "snow_goblin", count: 14, interval: 360, delay: 1400 },
    ],
    // W7: Death knight frost guard
    [
      { type: "death_knight", count: 2, interval: 2400 },
      { type: "fallen_paladin", count: 4, interval: 900, delay: 2400 },
      { type: "skeleton_knight", count: 6, interval: 700, delay: 1800 },
      { type: "frostling", count: 14, interval: 340, delay: 1400 },
    ],
    // W8: Lich blizzard - casters behind yeti wall
    [
      { type: "lich", count: 2, interval: 2200 },
      { type: "dark_priest", count: 3, interval: 950, delay: 2600 },
      { type: "yeti", count: 8, interval: 680, delay: 2000 },
      { type: "ice_witch", count: 6, interval: 620, delay: 1400 },
      { type: "mammoth", count: 2, interval: 1000, delay: 1800 },
    ],
    // W9: Solo mega-boss test
    [
      { type: "skeleton_king", count: 2, interval: 2800 },
      { type: "abomination", count: 1, interval: 3200, delay: 3000 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 2000 },
    ],
    // W10: Frozen horde - massive numbers
    [
      { type: "death_knight", count: 3, interval: 1800 },
      { type: "dark_knight", count: 5, interval: 780, delay: 1600 },
      { type: "skeleton_footman", count: 18, interval: 280, delay: 1800 },
      { type: "snow_goblin", count: 20, interval: 260, delay: 1200 },
      { type: "wendigo", count: 2, interval: 1000, delay: 1600 },
    ],
    // W11: Everything armored, nothing fast
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "zombie_brute", count: 5, interval: 1000, delay: 2400 },
      { type: "black_guard", count: 6, interval: 700, delay: 1800 },
      { type: "fallen_paladin", count: 5, interval: 800, delay: 1400 },
      { type: "yeti", count: 10, interval: 600, delay: 1000 },
    ],
    // W12: COLOSSUS FINALE - frozen titan + armored escort
    [
      { type: "frost_colossus", count: 1, interval: 3500 },
      { type: "doom_herald", count: 2, interval: 2400, delay: 4000 },
      { type: "death_knight", count: 3, interval: 1800, delay: 2000 },
      { type: "lich", count: 2, interval: 2000, delay: 1600 },
      { type: "frostling", count: 22, interval: 260, delay: 1200 },
    ],
  ],

  // ASHEN SPIRAL - "Infernal Gauntlet" (15 waves, escalating boss parade)
  ashen_spiral: [
    // W1: Volcanic vanguard
    [
      { type: "fire_imp", count: 10, interval: 560 },
      { type: "magma_spawn", count: 8, interval: 620, delay: 2600 },
      { type: "ember_guard", count: 5, interval: 860, delay: 2400 },
    ],
    // W2: Infernal charge + warlock support
    [
      { type: "infernal", count: 6, interval: 720 },
      { type: "warlock", count: 5, interval: 760, delay: 2300 },
      { type: "fire_imp", count: 12, interval: 380, delay: 2000 },
    ],
    // W3: All flying - air dominance
    [
      { type: "wyvern", count: 6, interval: 850 },
      { type: "harpy", count: 7, interval: 550, delay: 2000 },
      { type: "banshee", count: 6, interval: 600, delay: 1600 },
      { type: "volcanic_drake", count: 4, interval: 700, delay: 1800 },
    ],
    // W4: Surprise skeleton army - not volcanic themed
    [
      { type: "skeleton_knight", count: 5, interval: 900 },
      { type: "skeleton_footman", count: 14, interval: 340, delay: 2200 },
      { type: "skeleton_archer", count: 6, interval: 600, delay: 1800 },
      { type: "bone_mage", count: 3, interval: 900, delay: 1400 },
    ],
    // W5: Speed nightmare - fastest possible
    [
      { type: "hellhound", count: 10, interval: 360 },
      { type: "revenant", count: 6, interval: 500, delay: 1400 },
      { type: "assassin", count: 8, interval: 480, delay: 1200 },
      { type: "fire_imp", count: 16, interval: 280, delay: 1000 },
      { type: "salamander", count: 8, interval: 400, delay: 1200 },
    ],
    // W6: Death knight vanguard - first big boss
    [
      { type: "death_knight", count: 2, interval: 2400 },
      { type: "dark_knight", count: 5, interval: 800, delay: 2600 },
      { type: "fallen_paladin", count: 4, interval: 900, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 620, delay: 1600 },
    ],
    // W7: Lich tower - caster devastation
    [
      { type: "lich", count: 2, interval: 2200 },
      { type: "dark_priest", count: 4, interval: 850, delay: 2400 },
      { type: "bone_mage", count: 6, interval: 600, delay: 1800 },
      { type: "wraith", count: 8, interval: 460, delay: 1400 },
    ],
    // W8: Zombie siege - slow but overwhelming
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "zombie_brute", count: 5, interval: 1000, delay: 2800 },
      { type: "zombie_shambler", count: 20, interval: 260, delay: 2000 },
      { type: "magma_spawn", count: 12, interval: 400, delay: 1400 },
      { type: "lava_golem", count: 2, interval: 1000, delay: 1800 },
    ],
    // W9: Breather... then surprise boss
    [
      { type: "fire_imp", count: 20, interval: 300 },
      { type: "ember_guard", count: 6, interval: 700, delay: 3000 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 6000 },
      { type: "skeleton_king", count: 1, interval: 3000, delay: 1000 },
    ],
    // W10: Dual boss gauntlet
    [
      { type: "death_knight", count: 3, interval: 1800 },
      { type: "skeleton_king", count: 2, interval: 2400, delay: 2000 },
      { type: "black_guard", count: 6, interval: 700, delay: 2400 },
      { type: "dark_knight", count: 6, interval: 740, delay: 1600 },
      { type: "volcanic_drake", count: 5, interval: 700, delay: 1800 },
    ],
    // W11: Abomination rampage
    [
      { type: "abomination", count: 2, interval: 2800 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 1200 },
      { type: "hellhound", count: 12, interval: 350, delay: 2400 },
      { type: "revenant", count: 8, interval: 480, delay: 1600 },
    ],
    // W12: Full dark fantasy war
    [
      { type: "lich", count: 3, interval: 1800 },
      { type: "death_knight", count: 3, interval: 1800, delay: 1200 },
      { type: "fallen_paladin", count: 6, interval: 740, delay: 2000 },
      { type: "skeleton_footman", count: 18, interval: 280, delay: 1400 },
      { type: "fire_imp", count: 20, interval: 260, delay: 1000 },
    ],
    // W13: Triple boss mayhem
    [
      { type: "doom_herald", count: 2, interval: 2400 },
      { type: "abomination", count: 1, interval: 3000, delay: 1000 },
      { type: "skeleton_king", count: 2, interval: 2400, delay: 800 },
      { type: "zombie_brute", count: 5, interval: 1000, delay: 2200 },
      { type: "ember_guard", count: 10, interval: 540, delay: 1400 },
    ],
    // W14: Endgame onslaught - everything at once
    [
      { type: "death_knight", count: 4, interval: 1600 },
      { type: "lich", count: 3, interval: 1800, delay: 1000 },
      { type: "doom_herald", count: 2, interval: 2200, delay: 800 },
      { type: "dark_knight", count: 8, interval: 640, delay: 1600 },
      { type: "magma_spawn", count: 20, interval: 260, delay: 1200 },
    ],
    // W15: WYRM FINALE - inferno titan + army of the damned
    [
      { type: "inferno_wyrm", count: 1, interval: 3500 },
      { type: "abomination", count: 2, interval: 2600, delay: 5000 },
      { type: "doom_herald", count: 2, interval: 2400, delay: 3000 },
      { type: "death_knight", count: 4, interval: 1600, delay: 2000 },
      { type: "hellhound", count: 14, interval: 320, delay: 1600 },
      { type: "fire_imp", count: 28, interval: 200, delay: 1200 },
    ],
  ],

  // CANNON CREST - "All-Out Assault" (surprise early bosses, varied pressure)
  cannon_crest: [
    // W1: Standard grassland intro
    [
      { type: "athlete", count: 8, interval: 620 },
      { type: "tiger_fan", count: 7, interval: 580, delay: 2600 },
      { type: "crossbowman", count: 5, interval: 720, delay: 2400 },
    ],
    // W2: Immediate tank test - no easing in
    [
      { type: "zombie_brute", count: 2, interval: 1400 },
      { type: "skeleton_knight", count: 4, interval: 900, delay: 2800 },
      { type: "athlete", count: 10, interval: 440, delay: 2000 },
    ],
    // W3: All-ranged barrage
    [
      { type: "skeleton_archer", count: 6, interval: 600 },
      { type: "bone_mage", count: 4, interval: 800, delay: 2400 },
      { type: "crossbowman", count: 6, interval: 620, delay: 1800 },
      { type: "mage", count: 5, interval: 700, delay: 1400 },
      { type: "timber_wolf", count: 8, interval: 400, delay: 2000 },
    ],
    // W4: Surprise dean + speed flankers
    [
      { type: "dean", count: 1, interval: 3000 },
      { type: "assassin", count: 8, interval: 480, delay: 2800 },
      { type: "berserker", count: 7, interval: 540, delay: 2000 },
    ],
    // W5: Dark knight column
    [
      { type: "dark_knight", count: 4, interval: 950 },
      { type: "fallen_paladin", count: 3, interval: 1100, delay: 2600 },
      { type: "black_guard", count: 4, interval: 800, delay: 2000 },
      { type: "tiger_fan", count: 14, interval: 360, delay: 1600 },
      { type: "giant_eagle", count: 3, interval: 750, delay: 2000 },
    ],
    // W6: Wraith ambush - all-fast ghost wave
    [
      { type: "wraith", count: 8, interval: 450 },
      { type: "hellhound", count: 10, interval: 380, delay: 1600 },
      { type: "revenant", count: 6, interval: 520, delay: 1200 },
    ],
    // W7: Lich + necromancer caster tower
    [
      { type: "lich", count: 2, interval: 2200 },
      { type: "dark_priest", count: 3, interval: 950, delay: 2600 },
      { type: "skeleton_footman", count: 16, interval: 320, delay: 2000 },
      { type: "athlete", count: 14, interval: 380, delay: 1400 },
    ],
    // W8: Double death knight push
    [
      { type: "death_knight", count: 2, interval: 2400 },
      { type: "skeleton_king", count: 1, interval: 3000, delay: 2800 },
      { type: "dark_knight", count: 5, interval: 780, delay: 2000 },
      { type: "skeleton_knight", count: 6, interval: 700, delay: 1400 },
      { type: "forest_troll", count: 4, interval: 700, delay: 1800 },
    ],
    // W9: Boss rush - multiple heavies simultaneous
    [
      { type: "doom_herald", count: 1, interval: 3000 },
      { type: "abomination", count: 1, interval: 3200, delay: 800 },
      { type: "zombie_brute", count: 4, interval: 1000, delay: 2400 },
      { type: "bone_mage", count: 6, interval: 600, delay: 1600 },
    ],
    // W10: Overwhelming swarm + elites
    [
      { type: "death_knight", count: 3, interval: 1800 },
      { type: "fallen_paladin", count: 5, interval: 800, delay: 1600 },
      { type: "skeleton_footman", count: 20, interval: 260, delay: 2000 },
      { type: "tiger_fan", count: 20, interval: 280, delay: 1200 },
      { type: "dire_bear", count: 2, interval: 1000, delay: 2000 },
    ],
    // W11: Everything undead
    [
      { type: "skeleton_king", count: 2, interval: 2400 },
      { type: "lich", count: 2, interval: 2000, delay: 1200 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 1000 },
      { type: "dark_knight", count: 6, interval: 700, delay: 1800 },
      { type: "hellhound", count: 12, interval: 340, delay: 1200 },
    ],
    // W12: TITAN FINALE
    [
      { type: "titan_of_nassau", count: 1, interval: 3500 },
      { type: "abomination", count: 1, interval: 3200, delay: 4000 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 2000 },
      { type: "death_knight", count: 3, interval: 1800, delay: 1800 },
      { type: "athlete", count: 24, interval: 240, delay: 1400 },
    ],
  ],

  // TRIAD KEEP - "Necromantic Ritual" (caster-heavy, undead summoning theme)
  triad_keep: [
    // W1: Swamp scouts
    [
      { type: "bog_creature", count: 9, interval: 640 },
      { type: "thornwalker", count: 6, interval: 700, delay: 2600 },
      { type: "cultist", count: 5, interval: 760, delay: 2400 },
    ],
    // W2: Troll tanks + plague cloud
    [
      { type: "swamp_troll", count: 6, interval: 850 },
      { type: "plaguebearer", count: 5, interval: 780, delay: 2400 },
      { type: "bog_creature", count: 12, interval: 430, delay: 2000 },
    ],
    // W3: First dark casters appear
    [
      { type: "dark_priest", count: 3, interval: 1000 },
      { type: "bone_mage", count: 3, interval: 950, delay: 2600 },
      { type: "zombie_spitter", count: 4, interval: 750, delay: 2000 },
      { type: "thornwalker", count: 8, interval: 600, delay: 1600 },
      { type: "vine_serpent", count: 5, interval: 600, delay: 1800 },
    ],
    // W4: Ghost raid - ethereal enemies only
    [
      { type: "wraith", count: 6, interval: 520 },
      { type: "specter", count: 6, interval: 550, delay: 1800 },
      { type: "banshee", count: 5, interval: 600, delay: 1400 },
      { type: "will_o_wisp", count: 12, interval: 380, delay: 1200 },
    ],
    // W5: Lich arrives with skeleton army
    [
      { type: "lich", count: 1, interval: 2600 },
      { type: "skeleton_knight", count: 5, interval: 800, delay: 2800 },
      { type: "skeleton_footman", count: 14, interval: 340, delay: 2000 },
      { type: "skeleton_archer", count: 5, interval: 650, delay: 1600 },
      { type: "giant_toad", count: 4, interval: 700, delay: 2000 },
    ],
    // W6: Zombie flood - pure numbers test
    [
      { type: "zombie_brute", count: 3, interval: 1200 },
      { type: "zombie_shambler", count: 22, interval: 250, delay: 2400 },
      { type: "ghoul", count: 8, interval: 480, delay: 1600 },
    ],
    // W7: Death knight + air support
    [
      { type: "death_knight", count: 1, interval: 3000 },
      { type: "wyvern", count: 6, interval: 800, delay: 2600 },
      { type: "harpy", count: 7, interval: 550, delay: 1800 },
      { type: "dark_knight", count: 4, interval: 900, delay: 1400 },
    ],
    // W8: Necromancer ritual - caster onslaught
    [
      { type: "lich", count: 2, interval: 2200 },
      { type: "dark_priest", count: 4, interval: 850, delay: 2400 },
      { type: "bone_mage", count: 6, interval: 600, delay: 1800 },
      { type: "wraith", count: 8, interval: 460, delay: 1400 },
      { type: "marsh_troll", count: 4, interval: 700, delay: 1600 },
    ],
    // W9: Skeleton king + dark knight escort
    [
      { type: "skeleton_king", count: 2, interval: 2600 },
      { type: "fallen_paladin", count: 4, interval: 900, delay: 2400 },
      { type: "black_guard", count: 5, interval: 720, delay: 1800 },
      { type: "bog_creature", count: 16, interval: 320, delay: 1200 },
    ],
    // W10: Abomination + doom herald pair
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 1000 },
      { type: "hellhound", count: 10, interval: 380, delay: 2800 },
      { type: "revenant", count: 8, interval: 480, delay: 1600 },
      { type: "swamp_hydra", count: 1, interval: 1200, delay: 2000 },
    ],
    // W11: Undead council - all boss casters
    [
      { type: "lich", count: 3, interval: 1800 },
      { type: "skeleton_king", count: 2, interval: 2400, delay: 1400 },
      { type: "death_knight", count: 3, interval: 1800, delay: 1200 },
      { type: "bone_mage", count: 6, interval: 580, delay: 1800 },
      { type: "thornwalker", count: 16, interval: 340, delay: 1000 },
    ],
    // W12: LEVIATHAN FINALE
    [
      { type: "swamp_leviathan", count: 1, interval: 3500 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 4000 },
      { type: "abomination", count: 1, interval: 3200, delay: 2000 },
      { type: "dark_priest", count: 4, interval: 800, delay: 2400 },
      { type: "zombie_shambler", count: 24, interval: 240, delay: 1400 },
    ],
  ],

  // FRONTIER OUTPOST - "Blizzard Rush" (speed-focused, wraiths + hellhounds)
  frontier_outpost: [
    // W1: Blizzard scouts
    [
      { type: "snow_goblin", count: 10, interval: 600 },
      { type: "frostling", count: 8, interval: 580, delay: 2600 },
      { type: "ice_witch", count: 5, interval: 760, delay: 2400 },
    ],
    // W2: Speed rush - everything fast
    [
      { type: "assassin", count: 7, interval: 500 },
      { type: "frostling", count: 12, interval: 380, delay: 2000 },
      { type: "hellhound", count: 6, interval: 450, delay: 1600 },
    ],
    // W3: Yeti fortress + ice witch artillery
    [
      { type: "yeti", count: 7, interval: 780 },
      { type: "ice_witch", count: 6, interval: 650, delay: 2600 },
      { type: "skeleton_archer", count: 5, interval: 650, delay: 2000 },
      { type: "dire_wolf", count: 6, interval: 500, delay: 2200 },
    ],
    // W4: Wraith swarm - ethereal blitz
    [
      { type: "wraith", count: 10, interval: 400 },
      { type: "specter", count: 6, interval: 520, delay: 1600 },
      { type: "snow_goblin", count: 16, interval: 320, delay: 1200 },
    ],
    // W5: Dark knight frozen march
    [
      { type: "dark_knight", count: 4, interval: 950 },
      { type: "skeleton_knight", count: 5, interval: 800, delay: 2400 },
      { type: "black_guard", count: 4, interval: 800, delay: 1800 },
      { type: "frostling", count: 12, interval: 380, delay: 1400 },
      { type: "frost_troll", count: 4, interval: 700, delay: 1600 },
    ],
    // W6: All flying blizzard
    [
      { type: "wyvern", count: 6, interval: 850 },
      { type: "harpy", count: 8, interval: 500, delay: 2000 },
      { type: "banshee", count: 7, interval: 560, delay: 1500 },
    ],
    // W7: Death knight + hellhound pack
    [
      { type: "death_knight", count: 2, interval: 2400 },
      { type: "hellhound", count: 14, interval: 320, delay: 2600 },
      { type: "revenant", count: 6, interval: 520, delay: 1800 },
      { type: "wraith", count: 6, interval: 480, delay: 1200 },
    ],
    // W8: Lich frost ritual
    [
      { type: "lich", count: 2, interval: 2200 },
      { type: "bone_mage", count: 5, interval: 680, delay: 2400 },
      { type: "yeti", count: 8, interval: 680, delay: 1800 },
      { type: "ice_witch", count: 6, interval: 620, delay: 1200 },
      { type: "mammoth", count: 2, interval: 1000, delay: 1600 },
    ],
    // W9: Solo mega-tank challenge
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "zombie_brute", count: 4, interval: 1000, delay: 3000 },
      { type: "fallen_paladin", count: 4, interval: 900, delay: 2000 },
    ],
    // W10: Speed massacre - fastest wave
    [
      { type: "hellhound", count: 16, interval: 300 },
      { type: "wraith", count: 10, interval: 380, delay: 1200 },
      { type: "assassin", count: 8, interval: 440, delay: 1000 },
      { type: "frostling", count: 16, interval: 300, delay: 800 },
      { type: "wendigo", count: 2, interval: 1000, delay: 1400 },
    ],
    // W11: Dark convergence
    [
      { type: "doom_herald", count: 2, interval: 2400 },
      { type: "death_knight", count: 3, interval: 1800, delay: 1400 },
      { type: "skeleton_king", count: 2, interval: 2400, delay: 1200 },
      { type: "dark_knight", count: 6, interval: 700, delay: 1800 },
      { type: "snow_goblin", count: 18, interval: 280, delay: 1000 },
    ],
    // W12: COLOSSUS FINALE
    [
      { type: "frost_colossus", count: 1, interval: 3500 },
      { type: "abomination", count: 1, interval: 3200, delay: 4000 },
      { type: "doom_herald", count: 1, interval: 3000, delay: 2000 },
      { type: "hellhound", count: 14, interval: 320, delay: 2400 },
      { type: "frostling", count: 20, interval: 260, delay: 1400 },
    ],
  ],

  // SUN OBELISK - "Pyramid Siege" (siege theme, catapults + golems + brutes)
  sun_obelisk: [
    // W1: Desert scouts
    [
      { type: "nomad", count: 9, interval: 640 },
      { type: "scarab", count: 8, interval: 560, delay: 2600 },
      { type: "scorpion", count: 6, interval: 660, delay: 2400 },
    ],
    // W2: Catapult siege - ranged from the start
    [
      { type: "catapult", count: 3, interval: 1200 },
      { type: "archer", count: 6, interval: 600, delay: 2800 },
      { type: "nomad", count: 10, interval: 420, delay: 2000 },
    ],
    // W3: Sandworm ambush
    [
      { type: "sandworm", count: 6, interval: 850 },
      { type: "scorpion", count: 8, interval: 600, delay: 2400 },
      { type: "scarab", count: 12, interval: 380, delay: 1800 },
      { type: "djinn", count: 4, interval: 700, delay: 2000 },
    ],
    // W4: Skeleton siege engineers
    [
      { type: "skeleton_knight", count: 5, interval: 850 },
      { type: "bone_mage", count: 4, interval: 800, delay: 2600 },
      { type: "skeleton_footman", count: 12, interval: 380, delay: 2000 },
      { type: "skeleton_archer", count: 5, interval: 650, delay: 1600 },
    ],
    // W5: All-air ambush
    [
      { type: "wyvern", count: 6, interval: 800 },
      { type: "harpy", count: 7, interval: 550, delay: 2000 },
      { type: "banshee", count: 5, interval: 620, delay: 1600 },
    ],
    // W6: Zombie brute battering ram
    [
      { type: "zombie_brute", count: 5, interval: 1000 },
      { type: "dark_knight", count: 4, interval: 950, delay: 2800 },
      { type: "fallen_paladin", count: 3, interval: 1100, delay: 2000 },
      { type: "nomad", count: 14, interval: 360, delay: 1400 },
      { type: "manticore", count: 3, interval: 800, delay: 1800 },
    ],
    // W7: Lich artillery + meat shield
    [
      { type: "lich", count: 2, interval: 2200 },
      { type: "catapult", count: 3, interval: 1200, delay: 2600 },
      { type: "black_guard", count: 5, interval: 720, delay: 2000 },
      { type: "scarab", count: 16, interval: 320, delay: 1400 },
    ],
    // W8: Death knight vanguard
    [
      { type: "death_knight", count: 2, interval: 2400 },
      { type: "skeleton_king", count: 1, interval: 3000, delay: 2800 },
      { type: "dark_knight", count: 5, interval: 780, delay: 2000 },
      { type: "sandworm", count: 6, interval: 800, delay: 1400 },
      { type: "basilisk", count: 2, interval: 1000, delay: 1800 },
    ],
    // W9: Doom herald + golem test
    [
      { type: "doom_herald", count: 1, interval: 3200 },
      { type: "golem", count: 1, interval: 2800, delay: 1200 },
      { type: "zombie_brute", count: 4, interval: 1000, delay: 2600 },
      { type: "scorpion", count: 16, interval: 340, delay: 1600 },
    ],
    // W10: Dark caster barrage
    [
      { type: "lich", count: 2, interval: 2000 },
      { type: "dark_priest", count: 4, interval: 800, delay: 2200 },
      { type: "bone_mage", count: 6, interval: 580, delay: 1600 },
      { type: "wraith", count: 8, interval: 460, delay: 1200 },
      { type: "nomad", count: 16, interval: 320, delay: 1000 },
      { type: "phoenix", count: 1, interval: 1200, delay: 2000 },
    ],
    // W11: Abomination siege
    [
      { type: "abomination", count: 2, interval: 2800 },
      { type: "death_knight", count: 3, interval: 1800, delay: 1600 },
      { type: "fallen_paladin", count: 5, interval: 800, delay: 2000 },
      { type: "hellhound", count: 10, interval: 380, delay: 1400 },
    ],
    // W12: SPHINX FINALE
    [
      { type: "sphinx_guardian", count: 1, interval: 3500 },
      { type: "doom_herald", count: 2, interval: 2400, delay: 4000 },
      { type: "skeleton_king", count: 2, interval: 2400, delay: 2000 },
      { type: "dark_knight", count: 6, interval: 700, delay: 2000 },
      { type: "scarab", count: 24, interval: 220, delay: 1400 },
    ],
  ],

  // INFERNAL GATE - "Apocalypse" (hardest challenge, overlapping bosses)
  infernal_gate: [
    // W1: Volcanic vanguard
    [
      { type: "fire_imp", count: 10, interval: 540 },
      { type: "magma_spawn", count: 8, interval: 600, delay: 2500 },
      { type: "ember_guard", count: 5, interval: 840, delay: 2300 },
    ],
    // W2: Dark knight ambush - skips the normal warmup
    [
      { type: "dark_knight", count: 3, interval: 1000 },
      { type: "skeleton_knight", count: 4, interval: 900, delay: 2600 },
      { type: "fire_imp", count: 12, interval: 400, delay: 2000 },
      { type: "hellhound", count: 6, interval: 450, delay: 1600 },
    ],
    // W3: Caster devastation early
    [
      { type: "lich", count: 1, interval: 2600 },
      { type: "bone_mage", count: 4, interval: 800, delay: 2600 },
      { type: "dark_priest", count: 3, interval: 950, delay: 2000 },
      { type: "magma_spawn", count: 10, interval: 440, delay: 1600 },
      { type: "salamander", count: 8, interval: 400, delay: 1800 },
    ],
    // W4: All-speed panic wave
    [
      { type: "hellhound", count: 12, interval: 340 },
      { type: "wraith", count: 8, interval: 420, delay: 1400 },
      { type: "revenant", count: 6, interval: 500, delay: 1200 },
      { type: "assassin", count: 8, interval: 460, delay: 1000 },
    ],
    // W5: Death knight early - first boss at wave 5
    [
      { type: "death_knight", count: 2, interval: 2400 },
      { type: "fallen_paladin", count: 4, interval: 900, delay: 2600 },
      { type: "black_guard", count: 5, interval: 720, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 620, delay: 1400 },
      { type: "volcanic_drake", count: 4, interval: 700, delay: 1600 },
    ],
    // W6: Air supremacy - flying nightmare
    [
      { type: "wyvern", count: 7, interval: 780 },
      { type: "harpy", count: 8, interval: 500, delay: 1800 },
      { type: "banshee", count: 7, interval: 560, delay: 1400 },
      { type: "dragon", count: 1, interval: 2800, delay: 3000 },
    ],
    // W7: Skeleton king's court
    [
      { type: "skeleton_king", count: 2, interval: 2600 },
      { type: "lich", count: 2, interval: 2200, delay: 2000 },
      { type: "skeleton_knight", count: 6, interval: 700, delay: 2400 },
      { type: "skeleton_footman", count: 16, interval: 300, delay: 1600 },
    ],
    // W8: Abomination vanguard + zombie flood
    [
      { type: "abomination", count: 1, interval: 3200 },
      { type: "zombie_brute", count: 5, interval: 1000, delay: 2800 },
      { type: "zombie_shambler", count: 18, interval: 280, delay: 2000 },
      { type: "fire_imp", count: 16, interval: 300, delay: 1400 },
      { type: "lava_golem", count: 2, interval: 1000, delay: 1800 },
    ],
    // W9: Triple boss simultaneous spawn
    [
      { type: "doom_herald", count: 1, interval: 3000 },
      { type: "skeleton_king", count: 1, interval: 3000, delay: 500 },
      { type: "abomination", count: 1, interval: 3200, delay: 500 },
      { type: "dark_knight", count: 6, interval: 700, delay: 3000 },
      { type: "hellhound", count: 12, interval: 360, delay: 1800 },
    ],
    // W10: Everything dark fantasy at once
    [
      { type: "death_knight", count: 4, interval: 1600 },
      { type: "lich", count: 3, interval: 1800, delay: 1200 },
      { type: "fallen_paladin", count: 6, interval: 740, delay: 1600 },
      { type: "bone_mage", count: 6, interval: 580, delay: 1400 },
      { type: "magma_spawn", count: 18, interval: 300, delay: 1000 },
      { type: "volcanic_drake", count: 5, interval: 700, delay: 1400 },
    ],
    // W11: Penultimate - doom heralds + abominations
    [
      { type: "doom_herald", count: 3, interval: 2200 },
      { type: "abomination", count: 2, interval: 2600, delay: 1200 },
      { type: "skeleton_king", count: 2, interval: 2400, delay: 1000 },
      { type: "revenant", count: 10, interval: 420, delay: 2000 },
      { type: "ember_guard", count: 10, interval: 520, delay: 1200 },
    ],
    // W12: WYRM APOCALYPSE - everything burns
    [
      { type: "inferno_wyrm", count: 1, interval: 3500 },
      { type: "doom_herald", count: 2, interval: 2400, delay: 4000 },
      { type: "abomination", count: 1, interval: 3200, delay: 2000 },
      { type: "death_knight", count: 4, interval: 1600, delay: 1800 },
      { type: "dark_knight", count: 8, interval: 600, delay: 1400 },
      { type: "fire_imp", count: 26, interval: 220, delay: 1200 },
    ],
  ],
  // =====================
  // SANDBOX
  // =====================
  sandbox: [
    [{ type: "frosh", count: 8, interval: 800 }],
    [
      { type: "sophomore", count: 6, interval: 700 },
      { type: "frosh", count: 4, interval: 600, delay: 2000 },
    ],
    [
      { type: "junior", count: 5, interval: 800 },
      { type: "sophomore", count: 5, interval: 700, delay: 2500 },
      { type: "timber_wolf", count: 6, interval: 500, delay: 3000 },
    ],
    [
      { type: "senior", count: 4, interval: 900 },
      { type: "junior", count: 4, interval: 800, delay: 2000 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 1000 },
      { type: "senior", count: 5, interval: 800, delay: 2500 },
      { type: "giant_eagle", count: 3, interval: 800, delay: 2800 },
    ],
    [
      { type: "professor", count: 2, interval: 1200 },
      { type: "gradstudent", count: 4, interval: 900, delay: 3000 },
    ],
    [
      { type: "frosh", count: 15, interval: 400 },
      { type: "sophomore", count: 10, interval: 500, delay: 3000 },
      { type: "timber_wolf", count: 8, interval: 450, delay: 2500 },
    ],
    [
      { type: "professor", count: 3, interval: 1000 },
      { type: "senior", count: 6, interval: 700, delay: 2000 },
      { type: "junior", count: 8, interval: 600, delay: 4000 },
    ],
    [
      { type: "dean", count: 1, interval: 1000 },
      { type: "professor", count: 4, interval: 900, delay: 3000 },
      { type: "forest_troll", count: 3, interval: 800, delay: 3000 },
    ],
    [
      { type: "dean", count: 2, interval: 1200 },
      { type: "gradstudent", count: 6, interval: 700, delay: 2500 },
      { type: "frosh", count: 20, interval: 300, delay: 5000 },
    ],
  ],
  // =====================
  // DEV TEST LEVELS
  // =====================
  dev_enemy_showcase: [
    // Wave 1: Bugs (all regions + boss)
    [
      { type: "orb_weaver", count: 1, interval: 1000 },
      { type: "mantis", count: 1, interval: 1000, delay: 3000 },
      { type: "bombardier_beetle", count: 1, interval: 1000, delay: 3000 },
      { type: "mosquito", count: 1, interval: 1000, delay: 3000 },
      { type: "centipede", count: 1, interval: 1000, delay: 3000 },
      { type: "dragonfly", count: 1, interval: 1000, delay: 3000 },
      { type: "silk_moth", count: 1, interval: 1000, delay: 3000 },
      { type: "ant_soldier", count: 1, interval: 1000, delay: 3000 },
      { type: "locust", count: 1, interval: 1000, delay: 3000 },
      { type: "trapdoor_spider", count: 1, interval: 1000, delay: 3000 },
      { type: "ice_beetle", count: 1, interval: 1000, delay: 3000 },
      { type: "frost_tick", count: 1, interval: 1000, delay: 3000 },
      { type: "snow_moth", count: 1, interval: 1000, delay: 3000 },
      { type: "fire_ant", count: 1, interval: 1000, delay: 3000 },
      { type: "magma_beetle", count: 1, interval: 1000, delay: 3000 },
      { type: "ash_moth", count: 1, interval: 1000, delay: 3000 },
      { type: "brood_mother", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 2: Fantasy Creatures — Forest & Swamp
    [
      { type: "dire_bear", count: 1, interval: 1000 },
      { type: "ancient_ent", count: 1, interval: 1000, delay: 3000 },
      { type: "forest_troll", count: 1, interval: 1000, delay: 3000 },
      { type: "timber_wolf", count: 1, interval: 1000, delay: 3000 },
      { type: "giant_eagle", count: 1, interval: 1000, delay: 3000 },
      { type: "swamp_hydra", count: 1, interval: 1000, delay: 3000 },
      { type: "giant_toad", count: 1, interval: 1000, delay: 3000 },
      { type: "vine_serpent", count: 1, interval: 1000, delay: 3000 },
      { type: "marsh_troll", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 3: Fantasy Creatures — Desert, Winter & Volcanic
    [
      { type: "phoenix", count: 1, interval: 1000 },
      { type: "basilisk", count: 1, interval: 1000, delay: 3000 },
      { type: "djinn", count: 1, interval: 1000, delay: 3000 },
      { type: "manticore", count: 1, interval: 1000, delay: 3000 },
      { type: "frost_troll", count: 1, interval: 1000, delay: 3000 },
      { type: "dire_wolf", count: 1, interval: 1000, delay: 3000 },
      { type: "wendigo", count: 1, interval: 1000, delay: 3000 },
      { type: "mammoth", count: 1, interval: 1000, delay: 3000 },
      { type: "lava_golem", count: 1, interval: 1000, delay: 3000 },
      { type: "volcanic_drake", count: 1, interval: 1000, delay: 3000 },
      { type: "salamander", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 4: Regional Giant Bosses
    [
      { type: "titan_of_nassau", count: 1, interval: 1000 },
      { type: "swamp_leviathan", count: 1, interval: 1000, delay: 3000 },
      { type: "sphinx_guardian", count: 1, interval: 1000, delay: 3000 },
      { type: "frost_colossus", count: 1, interval: 1000, delay: 3000 },
      { type: "inferno_wyrm", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 5: Dark Fantasy — Undead (skeletons + zombies)
    [
      { type: "skeleton_footman", count: 1, interval: 1000 },
      { type: "skeleton_knight", count: 1, interval: 1000, delay: 3000 },
      { type: "skeleton_archer", count: 1, interval: 1000, delay: 3000 },
      { type: "skeleton_king", count: 1, interval: 1000, delay: 3000 },
      { type: "zombie_shambler", count: 1, interval: 1000, delay: 3000 },
      { type: "zombie_brute", count: 1, interval: 1000, delay: 3000 },
      { type: "zombie_spitter", count: 1, interval: 1000, delay: 3000 },
      { type: "ghoul", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 6: Dark Fantasy — Knights, Casters & Monsters
    [
      { type: "dark_knight", count: 1, interval: 1000 },
      { type: "death_knight", count: 1, interval: 1000, delay: 3000 },
      { type: "fallen_paladin", count: 1, interval: 1000, delay: 3000 },
      { type: "black_guard", count: 1, interval: 1000, delay: 3000 },
      { type: "lich", count: 1, interval: 1000, delay: 3000 },
      { type: "wraith", count: 1, interval: 1000, delay: 3000 },
      { type: "bone_mage", count: 1, interval: 1000, delay: 3000 },
      { type: "dark_priest", count: 1, interval: 1000, delay: 3000 },
      { type: "revenant", count: 1, interval: 1000, delay: 3000 },
      { type: "abomination", count: 1, interval: 1000, delay: 3000 },
      { type: "hellhound", count: 1, interval: 1000, delay: 3000 },
      { type: "doom_herald", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 7: Academic Progression
    [
      { type: "frosh", count: 1, interval: 1000 },
      { type: "sophomore", count: 1, interval: 1000, delay: 3000 },
      { type: "junior", count: 1, interval: 1000, delay: 3000 },
      { type: "senior", count: 1, interval: 1000, delay: 3000 },
      { type: "gradstudent", count: 1, interval: 1000, delay: 3000 },
      { type: "professor", count: 1, interval: 1000, delay: 3000 },
      { type: "dean", count: 1, interval: 1000, delay: 3000 },
      { type: "trustee", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 8: Campus & Ranged
    [
      { type: "mascot", count: 1, interval: 1000 },
      { type: "athlete", count: 1, interval: 1000, delay: 3000 },
      { type: "tiger_fan", count: 1, interval: 1000, delay: 3000 },
      { type: "archer", count: 1, interval: 1000, delay: 3000 },
      { type: "mage", count: 1, interval: 1000, delay: 3000 },
      { type: "catapult", count: 1, interval: 1000, delay: 3000 },
      { type: "warlock", count: 1, interval: 1000, delay: 3000 },
      { type: "crossbowman", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 9: Swamp Region
    [
      { type: "hexer", count: 1, interval: 1000 },
      { type: "harpy", count: 1, interval: 1000, delay: 3000 },
      { type: "wyvern", count: 1, interval: 1000, delay: 3000 },
      { type: "specter", count: 1, interval: 1000, delay: 3000 },
      { type: "berserker", count: 1, interval: 1000, delay: 3000 },
      { type: "golem", count: 1, interval: 1000, delay: 3000 },
      { type: "necromancer", count: 1, interval: 1000, delay: 3000 },
      { type: "shadow_knight", count: 1, interval: 1000, delay: 3000 },
      { type: "cultist", count: 1, interval: 1000, delay: 3000 },
      { type: "plaguebearer", count: 1, interval: 1000, delay: 3000 },
      { type: "thornwalker", count: 1, interval: 1000, delay: 3000 },
      { type: "bog_creature", count: 1, interval: 1000, delay: 3000 },
      { type: "will_o_wisp", count: 1, interval: 1000, delay: 3000 },
      { type: "swamp_troll", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 10: Desert Region
    [
      { type: "sandworm", count: 1, interval: 1000 },
      { type: "nomad", count: 1, interval: 1000, delay: 3000 },
      { type: "scorpion", count: 1, interval: 1000, delay: 3000 },
      { type: "scarab", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 11: Winter Region
    [
      { type: "frostling", count: 1, interval: 1000 },
      { type: "snow_goblin", count: 1, interval: 1000, delay: 3000 },
      { type: "yeti", count: 1, interval: 1000, delay: 3000 },
      { type: "ice_witch", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 12: Volcanic Region
    [
      { type: "infernal", count: 1, interval: 1000 },
      { type: "magma_spawn", count: 1, interval: 1000, delay: 3000 },
      { type: "fire_imp", count: 1, interval: 1000, delay: 3000 },
      { type: "ember_guard", count: 1, interval: 1000, delay: 3000 },
    ],
    // Wave 13: Boss / Special
    [
      { type: "banshee", count: 1, interval: 1000 },
      { type: "juggernaut", count: 1, interval: 1000, delay: 3000 },
      { type: "assassin", count: 1, interval: 1000, delay: 3000 },
      { type: "dragon", count: 1, interval: 1000, delay: 3000 },
    ],
  ],
};

export const WAVES: WaveGroup[][] = LEVEL_WAVES.poe;
