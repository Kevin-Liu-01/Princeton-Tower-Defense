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
  // Regional: frosh, athlete, protestor
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
      { type: "protestor", count: 3, interval: 750, delay: 4000 },
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
      { type: "protestor", count: 4, interval: 700 },
      { type: "crossbowman", count: 3, interval: 750, delay: 3200 },
      { type: "frosh", count: 5, interval: 650, delay: 3000 },
      { type: "harpy", count: 3, interval: 800, delay: 3200 },
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
    ],
    // Wave 7: Boss intro
    [
      { type: "senior", count: 3, interval: 1400 },
      { type: "protestor", count: 5, interval: 600, delay: 2500 },
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
      { type: "protestor", count: 4, interval: 700, delay: 3500 },
      { type: "mage", count: 3, interval: 850, delay: 3500 },
    ],
    // Wave 3: Flying wave
    [
      { type: "harpy", count: 4, interval: 750 },
      { type: "banshee", count: 3, interval: 900, delay: 3500 },
      { type: "frosh", count: 5, interval: 650, delay: 3200 },
      { type: "specter", count: 3, interval: 800, delay: 3200 },
    ],
    // Wave 4: Tank push
    [
      { type: "junior", count: 4, interval: 850 },
      { type: "protestor", count: 5, interval: 650, delay: 3200 },
      { type: "cultist", count: 4, interval: 700, delay: 3000 },
      { type: "berserker", count: 4, interval: 700, delay: 3000 },
    ],
    // Wave 5: Assassin strike
    [
      { type: "assassin", count: 4, interval: 750 },
      { type: "athlete", count: 5, interval: 600, delay: 3000 },
      { type: "archer", count: 5, interval: 650, delay: 2800 },
      { type: "mascot", count: 4, interval: 700, delay: 2800 },
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
      { type: "protestor", count: 6, interval: 550, delay: 2500 },
      { type: "hexer", count: 4, interval: 700, delay: 2500 },
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
    ],
    // Wave 10: FINALE
    [
      { type: "gradstudent", count: 4, interval: 1400 },
      { type: "assassin", count: 4, interval: 700, delay: 2000 },
      { type: "protestor", count: 7, interval: 500, delay: 2000 },
      { type: "wyvern", count: 4, interval: 900, delay: 2000 },
      { type: "infernal", count: 4, interval: 800, delay: 2000 },
    ],
  ],

  nassau: [
    // Wave 1: Opening salvo
    [
      { type: "frosh", count: 5, interval: 800 },
      { type: "protestor", count: 4, interval: 700, delay: 4000 },
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
      { type: "protestor", count: 5, interval: 650, delay: 3200 },
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
      { type: "protestor", count: 5, interval: 600, delay: 2600 },
    ],
    // Wave 7: Plaguebearer siege
    [
      { type: "plaguebearer", count: 4, interval: 900 },
      { type: "infernal", count: 4, interval: 950, delay: 2600 },
      { type: "frosh", count: 6, interval: 550, delay: 2500 },
      { type: "wyvern", count: 3, interval: 1100, delay: 2500 },
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
      { type: "protestor", count: 6, interval: 500, delay: 2200 },
      { type: "banshee", count: 5, interval: 700, delay: 2200 },
      { type: "infernal", count: 4, interval: 800, delay: 2200 },
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
    ],
    // Wave 6: Plague and shadow
    [
      { type: "plaguebearer", count: 4, interval: 900 },
      { type: "shadow_knight", count: 3, interval: 1200, delay: 2800 },
      { type: "bog_creature", count: 6, interval: 550, delay: 2600 },
      { type: "infernal", count: 3, interval: 950, delay: 2600 },
    ],
    // Wave 7: Air superiority
    [
      { type: "wyvern", count: 3, interval: 1200 },
      { type: "harpy", count: 5, interval: 650, delay: 2600 },
      { type: "swamp_troll", count: 4, interval: 900, delay: 2500 },
      { type: "warlock", count: 4, interval: 800, delay: 2500 },
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
    ],
    // Wave 8: Professor boss
    [
      { type: "professor", count: 3, interval: 2000 },
      { type: "gradstudent", count: 3, interval: 1300, delay: 2400 },
      { type: "wyvern", count: 4, interval: 950, delay: 2200 },
      { type: "sandworm", count: 3, interval: 1100, delay: 2200 },
    ],
    // Wave 9: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 5, interval: 850, delay: 2200 },
      { type: "scorpion", count: 5, interval: 800, delay: 2200 },
      { type: "banshee", count: 4, interval: 700, delay: 2000 },
      { type: "nomad", count: 7, interval: 450, delay: 2000 },
    ],
    // Wave 10: Air dominance
    [
      { type: "wyvern", count: 4, interval: 1000 },
      { type: "harpy", count: 5, interval: 650, delay: 2000 },
      { type: "catapult", count: 3, interval: 1200, delay: 2000 },
      { type: "scarab", count: 8, interval: 400, delay: 2000 },
      { type: "infernal", count: 4, interval: 800, delay: 2000 },
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
    // Wave 2: Yeti tanks
    [
      { type: "yeti", count: 3, interval: 1050 },
      { type: "snow_goblin", count: 4, interval: 750, delay: 4000 },
      { type: "cultist", count: 3, interval: 750, delay: 3800 },
      { type: "hexer", count: 3, interval: 800, delay: 3800 },
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
    // Wave 4: Tank push
    [
      { type: "junior", count: 4, interval: 850 },
      { type: "yeti", count: 4, interval: 950, delay: 3200 },
      { type: "plaguebearer", count: 3, interval: 900, delay: 3000 },
      { type: "ice_witch", count: 4, interval: 800, delay: 3000 },
    ],
    // Wave 5: Speed assault
    [
      { type: "assassin", count: 4, interval: 750 },
      { type: "berserker", count: 4, interval: 700, delay: 2800 },
      { type: "frostling", count: 5, interval: 600, delay: 2800 },
      { type: "specter", count: 3, interval: 800, delay: 2800 },
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
    // Wave 3: Flying wave
    [
      { type: "harpy", count: 4, interval: 750 },
      { type: "banshee", count: 3, interval: 900, delay: 3500 },
      { type: "magma_spawn", count: 4, interval: 800, delay: 3200 },
      { type: "fire_imp", count: 5, interval: 650, delay: 3200 },
    ],
    // Wave 4: Ranged barrage
    [
      { type: "archer", count: 4, interval: 750 },
      { type: "mage", count: 4, interval: 850, delay: 3200 },
      { type: "ember_guard", count: 4, interval: 900, delay: 3000 },
      { type: "warlock", count: 3, interval: 850, delay: 3000 },
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
      { type: "professor", count: 3, interval: 1600, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 700, delay: 2000 },
      { type: "wyvern", count: 5, interval: 800, delay: 2000 },
      { type: "infernal", count: 5, interval: 700, delay: 2000 },
    ],
    // Wave 14: Golem awakens
    [
      { type: "golem", count: 1, interval: 2600 },
      { type: "trustee", count: 1, interval: 2800, delay: 2000 },
      { type: "dragon", count: 1, interval: 2800, delay: 2000 },
      { type: "shadow_knight", count: 5, interval: 900, delay: 2000 },
      { type: "magma_spawn", count: 6, interval: 650, delay: 2000 },
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
  ],

  ivy_crossroads: [
    [
      { type: "athlete", count: 7, interval: 700 },
      { type: "protestor", count: 6, interval: 680, delay: 2800 },
      { type: "crossbowman", count: 4, interval: 780, delay: 2600 },
    ],
    [
      { type: "harpy", count: 4, interval: 700 },
      { type: "frosh", count: 8, interval: 520, delay: 2500 },
      { type: "specter", count: 4, interval: 760, delay: 2300 },
      { type: "mage", count: 4, interval: 780, delay: 2200 },
    ],
    [
      { type: "assassin", count: 5, interval: 680 },
      { type: "junior", count: 4, interval: 900, delay: 2400 },
      { type: "cultist", count: 5, interval: 700, delay: 2200 },
      { type: "banshee", count: 4, interval: 740, delay: 2200 },
    ],
    [
      { type: "hexer", count: 5, interval: 760 },
      { type: "athlete", count: 9, interval: 500, delay: 2300 },
      { type: "harpy", count: 5, interval: 650, delay: 2100 },
      { type: "warlock", count: 4, interval: 840, delay: 2100 },
    ],
    [
      { type: "plaguebearer", count: 4, interval: 860 },
      { type: "shadow_knight", count: 4, interval: 1050, delay: 2200 },
      { type: "protestor", count: 10, interval: 470, delay: 2100 },
      { type: "wyvern", count: 4, interval: 980, delay: 2100 },
    ],
    [
      { type: "necromancer", count: 4, interval: 1250 },
      { type: "senior", count: 5, interval: 900, delay: 2200 },
      { type: "athlete", count: 10, interval: 450, delay: 2000 },
      { type: "assassin", count: 6, interval: 620, delay: 2000 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 1450 },
      { type: "professor", count: 2, interval: 1900, delay: 2200 },
      { type: "banshee", count: 6, interval: 620, delay: 2000 },
      { type: "crossbowman", count: 7, interval: 600, delay: 1900 },
    ],
    [
      { type: "dean", count: 1, interval: 3000 },
      { type: "shadow_knight", count: 5, interval: 900, delay: 2100 },
      { type: "athlete", count: 12, interval: 420, delay: 1900 },
      { type: "infernal", count: 4, interval: 820, delay: 1900 },
    ],
    [
      { type: "dragon", count: 1, interval: 2800 },
      { type: "gradstudent", count: 4, interval: 1200, delay: 2100 },
      { type: "wyvern", count: 5, interval: 860, delay: 1900 },
      { type: "assassin", count: 7, interval: 580, delay: 1800 },
    ],
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 1900 },
      { type: "professor", count: 3, interval: 1500, delay: 1800 },
      { type: "athlete", count: 14, interval: 380, delay: 1700 },
      { type: "harpy", count: 7, interval: 560, delay: 1700 },
    ],
    [
      { type: "golem", count: 1, interval: 2900 },
      { type: "shadow_knight", count: 6, interval: 840, delay: 1800 },
      { type: "banshee", count: 7, interval: 560, delay: 1700 },
      { type: "protestor", count: 16, interval: 360, delay: 1600 },
    ],
    [
      { type: "trustee", count: 2, interval: 2400 },
      { type: "dragon", count: 2, interval: 2200, delay: 1800 },
      { type: "dean", count: 2, interval: 2200, delay: 1700 },
      { type: "assassin", count: 8, interval: 520, delay: 1600 },
      { type: "athlete", count: 18, interval: 340, delay: 1600 },
    ],
  ],

  blight_basin: [
    [
      { type: "bog_creature", count: 7, interval: 730 },
      { type: "will_o_wisp", count: 7, interval: 620, delay: 2800 },
      { type: "thornwalker", count: 5, interval: 760, delay: 2600 },
    ],
    [
      { type: "specter", count: 5, interval: 760 },
      { type: "swamp_troll", count: 5, interval: 900, delay: 2500 },
      { type: "hexer", count: 5, interval: 760, delay: 2300 },
      { type: "harpy", count: 4, interval: 700, delay: 2200 },
    ],
    [
      { type: "plaguebearer", count: 5, interval: 820 },
      { type: "cultist", count: 6, interval: 660, delay: 2300 },
      { type: "bog_creature", count: 10, interval: 460, delay: 2100 },
      { type: "banshee", count: 4, interval: 740, delay: 2100 },
    ],
    [
      { type: "necromancer", count: 4, interval: 1250 },
      { type: "shadow_knight", count: 4, interval: 1050, delay: 2200 },
      { type: "will_o_wisp", count: 12, interval: 430, delay: 2000 },
      { type: "wyvern", count: 4, interval: 980, delay: 2000 },
    ],
    [
      { type: "swamp_troll", count: 6, interval: 840 },
      { type: "thornwalker", count: 7, interval: 680, delay: 2100 },
      { type: "plaguebearer", count: 5, interval: 780, delay: 1900 },
      { type: "assassin", count: 6, interval: 620, delay: 1900 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 1450 },
      { type: "professor", count: 2, interval: 1900, delay: 2200 },
      { type: "specter", count: 7, interval: 560, delay: 1900 },
      { type: "swamp_troll", count: 6, interval: 760, delay: 1800 },
    ],
    [
      { type: "dean", count: 1, interval: 3000 },
      { type: "necromancer", count: 5, interval: 1100, delay: 2000 },
      { type: "will_o_wisp", count: 14, interval: 380, delay: 1800 },
      { type: "banshee", count: 6, interval: 580, delay: 1700 },
    ],
    [
      { type: "dragon", count: 1, interval: 2800 },
      { type: "shadow_knight", count: 6, interval: 820, delay: 1900 },
      { type: "wyvern", count: 6, interval: 860, delay: 1700 },
      { type: "thornwalker", count: 9, interval: 540, delay: 1700 },
    ],
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 1900 },
      { type: "swamp_troll", count: 7, interval: 740, delay: 1700 },
      { type: "plaguebearer", count: 7, interval: 660, delay: 1600 },
      { type: "will_o_wisp", count: 16, interval: 350, delay: 1600 },
    ],
    [
      { type: "golem", count: 1, interval: 2900 },
      { type: "necromancer", count: 5, interval: 950, delay: 1800 },
      { type: "banshee", count: 7, interval: 540, delay: 1600 },
      { type: "specter", count: 9, interval: 500, delay: 1600 },
    ],
    [
      { type: "trustee", count: 2, interval: 2400 },
      { type: "dragon", count: 2, interval: 2200, delay: 1800 },
      { type: "dean", count: 2, interval: 2200, delay: 1700 },
      { type: "shadow_knight", count: 7, interval: 760, delay: 1600 },
      { type: "bog_creature", count: 20, interval: 320, delay: 1600 },
    ],
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "golem", count: 2, interval: 2500, delay: 1800 },
      { type: "necromancer", count: 6, interval: 900, delay: 1700 },
      { type: "wyvern", count: 8, interval: 780, delay: 1600 },
      { type: "will_o_wisp", count: 22, interval: 300, delay: 1500 },
    ],
  ],

  sunscorch_labyrinth: [
    [
      { type: "nomad", count: 8, interval: 660 },
      { type: "scorpion", count: 7, interval: 620, delay: 2700 },
      { type: "scarab", count: 9, interval: 520, delay: 2400 },
    ],
    [
      { type: "archer", count: 6, interval: 700 },
      { type: "crossbowman", count: 5, interval: 720, delay: 2400 },
      { type: "nomad", count: 10, interval: 460, delay: 2200 },
      { type: "harpy", count: 4, interval: 680, delay: 2100 },
    ],
    [
      { type: "sandworm", count: 4, interval: 980 },
      { type: "hexer", count: 5, interval: 740, delay: 2200 },
      { type: "scorpion", count: 10, interval: 440, delay: 2000 },
      { type: "wyvern", count: 4, interval: 940, delay: 2000 },
    ],
    [
      { type: "assassin", count: 6, interval: 620 },
      { type: "mage", count: 5, interval: 760, delay: 2100 },
      { type: "scarab", count: 12, interval: 400, delay: 1900 },
      { type: "banshee", count: 5, interval: 620, delay: 1800 },
    ],
    [
      { type: "plaguebearer", count: 5, interval: 780 },
      { type: "shadow_knight", count: 5, interval: 980, delay: 2100 },
      { type: "sandworm", count: 5, interval: 900, delay: 1900 },
      { type: "nomad", count: 12, interval: 420, delay: 1800 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 1500 },
      { type: "professor", count: 2, interval: 1850, delay: 2100 },
      { type: "scorpion", count: 13, interval: 390, delay: 1800 },
      { type: "harpy", count: 6, interval: 560, delay: 1700 },
    ],
    [
      { type: "dean", count: 1, interval: 3000 },
      { type: "necromancer", count: 5, interval: 1000, delay: 1900 },
      { type: "scarab", count: 16, interval: 340, delay: 1700 },
      { type: "wyvern", count: 6, interval: 820, delay: 1700 },
    ],
    [
      { type: "dragon", count: 1, interval: 2800 },
      { type: "shadow_knight", count: 6, interval: 780, delay: 1800 },
      { type: "assassin", count: 8, interval: 500, delay: 1700 },
      { type: "sandworm", count: 6, interval: 860, delay: 1600 },
    ],
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 1800 },
      { type: "professor", count: 3, interval: 1450, delay: 1700 },
      { type: "nomad", count: 16, interval: 340, delay: 1600 },
      { type: "banshee", count: 7, interval: 540, delay: 1600 },
    ],
    [
      { type: "golem", count: 1, interval: 2900 },
      { type: "necromancer", count: 6, interval: 940, delay: 1700 },
      { type: "dragon", count: 2, interval: 2200, delay: 1600 },
      { type: "scorpion", count: 18, interval: 320, delay: 1500 },
    ],
    [
      { type: "trustee", count: 2, interval: 2400 },
      { type: "golem", count: 2, interval: 2600, delay: 1700 },
      { type: "dean", count: 2, interval: 2200, delay: 1600 },
      { type: "sandworm", count: 7, interval: 780, delay: 1500 },
      { type: "scarab", count: 20, interval: 300, delay: 1500 },
    ],
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dragon", count: 3, interval: 2000, delay: 1700 },
      { type: "golem", count: 2, interval: 2400, delay: 1600 },
      { type: "shadow_knight", count: 8, interval: 720, delay: 1500 },
      { type: "nomad", count: 24, interval: 280, delay: 1500 },
    ],
  ],

  whiteout_pass: [
    [
      { type: "snow_goblin", count: 9, interval: 620 },
      { type: "frostling", count: 7, interval: 610, delay: 2600 },
      { type: "ice_witch", count: 4, interval: 760, delay: 2400 },
    ],
    [
      { type: "yeti", count: 5, interval: 900 },
      { type: "archer", count: 6, interval: 680, delay: 2400 },
      { type: "snow_goblin", count: 12, interval: 420, delay: 2200 },
      { type: "harpy", count: 4, interval: 660, delay: 2100 },
    ],
    [
      { type: "ice_witch", count: 6, interval: 720 },
      { type: "frostling", count: 10, interval: 430, delay: 2200 },
      { type: "crossbowman", count: 5, interval: 700, delay: 2000 },
      { type: "wyvern", count: 4, interval: 930, delay: 2000 },
    ],
    [
      { type: "assassin", count: 6, interval: 620 },
      { type: "yeti", count: 6, interval: 820, delay: 2100 },
      { type: "snow_goblin", count: 14, interval: 380, delay: 1900 },
      { type: "banshee", count: 5, interval: 600, delay: 1800 },
    ],
    [
      { type: "plaguebearer", count: 5, interval: 760 },
      { type: "shadow_knight", count: 5, interval: 980, delay: 2000 },
      { type: "frostling", count: 12, interval: 390, delay: 1800 },
      { type: "ice_witch", count: 7, interval: 660, delay: 1700 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 1500 },
      { type: "professor", count: 2, interval: 1850, delay: 2000 },
      { type: "yeti", count: 7, interval: 780, delay: 1800 },
      { type: "harpy", count: 6, interval: 540, delay: 1700 },
    ],
    [
      { type: "dean", count: 1, interval: 3000 },
      { type: "necromancer", count: 5, interval: 980, delay: 1800 },
      { type: "snow_goblin", count: 18, interval: 320, delay: 1700 },
      { type: "wyvern", count: 6, interval: 780, delay: 1600 },
    ],
    [
      { type: "dragon", count: 1, interval: 2800 },
      { type: "shadow_knight", count: 6, interval: 760, delay: 1700 },
      { type: "assassin", count: 8, interval: 500, delay: 1600 },
      { type: "ice_witch", count: 8, interval: 620, delay: 1500 },
    ],
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 1700 },
      { type: "professor", count: 3, interval: 1400, delay: 1600 },
      { type: "frostling", count: 16, interval: 320, delay: 1500 },
      { type: "banshee", count: 7, interval: 520, delay: 1500 },
    ],
    [
      { type: "golem", count: 1, interval: 2900 },
      { type: "necromancer", count: 6, interval: 920, delay: 1700 },
      { type: "dragon", count: 2, interval: 2200, delay: 1600 },
      { type: "yeti", count: 9, interval: 700, delay: 1500 },
    ],
    [
      { type: "trustee", count: 2, interval: 2400 },
      { type: "golem", count: 2, interval: 2600, delay: 1700 },
      { type: "dean", count: 2, interval: 2200, delay: 1600 },
      { type: "shadow_knight", count: 8, interval: 700, delay: 1500 },
      { type: "snow_goblin", count: 22, interval: 280, delay: 1500 },
    ],
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dragon", count: 3, interval: 2000, delay: 1700 },
      { type: "golem", count: 2, interval: 2400, delay: 1600 },
      { type: "ice_witch", count: 9, interval: 560, delay: 1500 },
      { type: "frostling", count: 24, interval: 260, delay: 1500 },
    ],
  ],

  ashen_spiral: [
    [
      { type: "fire_imp", count: 10, interval: 560 },
      { type: "magma_spawn", count: 8, interval: 620, delay: 2600 },
      { type: "ember_guard", count: 5, interval: 860, delay: 2400 },
    ],
    [
      { type: "infernal", count: 5, interval: 780 },
      { type: "warlock", count: 5, interval: 760, delay: 2300 },
      { type: "fire_imp", count: 12, interval: 380, delay: 2100 },
      { type: "harpy", count: 5, interval: 640, delay: 2000 },
    ],
    [
      { type: "wyvern", count: 5, interval: 900 },
      { type: "banshee", count: 5, interval: 680, delay: 2200 },
      { type: "magma_spawn", count: 10, interval: 420, delay: 2000 },
      { type: "shadow_knight", count: 5, interval: 940, delay: 1900 },
    ],
    [
      { type: "assassin", count: 7, interval: 560 },
      { type: "ember_guard", count: 7, interval: 680, delay: 2100 },
      { type: "plaguebearer", count: 5, interval: 740, delay: 1900 },
      { type: "infernal", count: 6, interval: 720, delay: 1800 },
    ],
    [
      { type: "necromancer", count: 5, interval: 1050 },
      { type: "dragon", count: 1, interval: 2700, delay: 2100 },
      { type: "fire_imp", count: 16, interval: 320, delay: 1800 },
      { type: "wyvern", count: 6, interval: 780, delay: 1700 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 1300 },
      { type: "professor", count: 3, interval: 1600, delay: 2100 },
      { type: "shadow_knight", count: 6, interval: 820, delay: 1800 },
      { type: "magma_spawn", count: 13, interval: 360, delay: 1700 },
    ],
    [
      { type: "dean", count: 2, interval: 2300 },
      { type: "catapult", count: 4, interval: 1150, delay: 1900 },
      { type: "infernal", count: 7, interval: 660, delay: 1700 },
      { type: "fire_imp", count: 18, interval: 300, delay: 1600 },
    ],
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 2, interval: 2200, delay: 1900 },
      { type: "dragon", count: 2, interval: 2200, delay: 1700 },
      { type: "ember_guard", count: 9, interval: 620, delay: 1600 },
      { type: "assassin", count: 9, interval: 500, delay: 1500 },
    ],
    [
      { type: "golem", count: 1, interval: 2900 },
      { type: "juggernaut", count: 1, interval: 3000, delay: 1900 },
      { type: "necromancer", count: 6, interval: 900, delay: 1700 },
      { type: "magma_spawn", count: 15, interval: 330, delay: 1500 },
    ],
    [
      { type: "trustee", count: 2, interval: 2400 },
      { type: "dragon", count: 2, interval: 2100, delay: 1800 },
      { type: "dean", count: 2, interval: 2100, delay: 1700 },
      { type: "shadow_knight", count: 8, interval: 700, delay: 1500 },
      { type: "fire_imp", count: 22, interval: 260, delay: 1500 },
    ],
    [
      { type: "golem", count: 2, interval: 2600 },
      { type: "trustee", count: 2, interval: 2200, delay: 1800 },
      { type: "juggernaut", count: 2, interval: 2600, delay: 1700 },
      { type: "wyvern", count: 8, interval: 720, delay: 1500 },
      { type: "ember_guard", count: 11, interval: 560, delay: 1500 },
    ],
    [
      { type: "trustee", count: 3, interval: 2100 },
      { type: "dragon", count: 3, interval: 1900, delay: 1700 },
      { type: "dean", count: 3, interval: 1900, delay: 1600 },
      { type: "necromancer", count: 7, interval: 820, delay: 1500 },
      { type: "magma_spawn", count: 20, interval: 260, delay: 1500 },
    ],
    [
      { type: "trustee", count: 4, interval: 2000 },
      { type: "golem", count: 2, interval: 2400, delay: 1700 },
      { type: "dragon", count: 3, interval: 1900, delay: 1600 },
      { type: "juggernaut", count: 2, interval: 2400, delay: 1500 },
      { type: "ember_guard", count: 14, interval: 520, delay: 1500 },
    ],
    [
      { type: "trustee", count: 5, interval: 1900 },
      { type: "dragon", count: 4, interval: 1800, delay: 1700 },
      { type: "golem", count: 3, interval: 2200, delay: 1600 },
      { type: "dean", count: 3, interval: 1800, delay: 1500 },
      { type: "magma_spawn", count: 24, interval: 240, delay: 1500 },
      { type: "fire_imp", count: 28, interval: 200, delay: 1450 },
    ],
  ],

  cannon_crest: [
    [
      { type: "athlete", count: 8, interval: 620 },
      { type: "protestor", count: 7, interval: 580, delay: 2600 },
      { type: "crossbowman", count: 5, interval: 720, delay: 2400 },
    ],
    [
      { type: "berserker", count: 6, interval: 620 },
      { type: "frosh", count: 12, interval: 420, delay: 2400 },
      { type: "cultist", count: 6, interval: 700, delay: 2200 },
    ],
    [
      { type: "junior", count: 6, interval: 860 },
      { type: "assassin", count: 7, interval: 560, delay: 2300 },
      { type: "athlete", count: 12, interval: 400, delay: 2100 },
    ],
    [
      { type: "plaguebearer", count: 6, interval: 760 },
      { type: "hexer", count: 7, interval: 640, delay: 2200 },
      { type: "protestor", count: 14, interval: 360, delay: 2000 },
    ],
    [
      { type: "senior", count: 4, interval: 980 },
      { type: "mage", count: 8, interval: 660, delay: 2100 },
      { type: "berserker", count: 9, interval: 520, delay: 1900 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 1500 },
      { type: "assassin", count: 9, interval: 520, delay: 2100 },
      { type: "crossbowman", count: 9, interval: 620, delay: 1900 },
    ],
    [
      { type: "professor", count: 3, interval: 1650 },
      { type: "shadow_knight", count: 6, interval: 780, delay: 2000 },
      { type: "athlete", count: 18, interval: 320, delay: 1800 },
    ],
    [
      { type: "dean", count: 2, interval: 2300 },
      { type: "golem", count: 2, interval: 2500, delay: 1900 },
      { type: "protestor", count: 18, interval: 300, delay: 1700 },
      { type: "assassin", count: 10, interval: 480, delay: 1600 },
    ],
    [
      { type: "trustee", count: 2, interval: 2500 },
      { type: "juggernaut", count: 1, interval: 3000, delay: 1900 },
      { type: "shadow_knight", count: 7, interval: 760, delay: 1700 },
      { type: "frosh", count: 24, interval: 260, delay: 1600 },
    ],
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dean", count: 2, interval: 2100, delay: 1700 },
      { type: "golem", count: 2, interval: 2400, delay: 1600 },
      { type: "athlete", count: 24, interval: 250, delay: 1500 },
      { type: "berserker", count: 12, interval: 460, delay: 1450 },
    ],
  ],

  triad_keep: [
    [
      { type: "bog_creature", count: 9, interval: 640 },
      { type: "thornwalker", count: 6, interval: 700, delay: 2600 },
      { type: "cultist", count: 5, interval: 760, delay: 2400 },
    ],
    [
      { type: "swamp_troll", count: 6, interval: 920 },
      { type: "bog_creature", count: 12, interval: 430, delay: 2400 },
      { type: "hexer", count: 6, interval: 700, delay: 2200 },
    ],
    [
      { type: "plaguebearer", count: 6, interval: 800 },
      { type: "thornwalker", count: 8, interval: 660, delay: 2300 },
      { type: "assassin", count: 6, interval: 560, delay: 2100 },
    ],
    [
      { type: "junior", count: 7, interval: 860 },
      { type: "mage", count: 7, interval: 700, delay: 2200 },
      { type: "bog_creature", count: 16, interval: 360, delay: 2000 },
    ],
    [
      { type: "shadow_knight", count: 5, interval: 900 },
      { type: "swamp_troll", count: 7, interval: 820, delay: 2100 },
      { type: "plaguebearer", count: 7, interval: 700, delay: 1900 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 1500 },
      { type: "thornwalker", count: 10, interval: 600, delay: 2100 },
      { type: "assassin", count: 8, interval: 500, delay: 1900 },
    ],
    [
      { type: "professor", count: 3, interval: 1650 },
      { type: "necromancer", count: 5, interval: 980, delay: 1900 },
      { type: "bog_creature", count: 18, interval: 320, delay: 1800 },
    ],
    [
      { type: "dean", count: 2, interval: 2300 },
      { type: "golem", count: 2, interval: 2500, delay: 1800 },
      { type: "shadow_knight", count: 7, interval: 760, delay: 1700 },
      { type: "thornwalker", count: 12, interval: 480, delay: 1600 },
    ],
    [
      { type: "trustee", count: 2, interval: 2500 },
      { type: "juggernaut", count: 1, interval: 3000, delay: 1800 },
      { type: "swamp_troll", count: 10, interval: 700, delay: 1700 },
      { type: "plaguebearer", count: 10, interval: 560, delay: 1600 },
    ],
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dean", count: 2, interval: 2100, delay: 1700 },
      { type: "golem", count: 2, interval: 2400, delay: 1600 },
      { type: "bog_creature", count: 26, interval: 250, delay: 1500 },
      { type: "shadow_knight", count: 9, interval: 680, delay: 1450 },
    ],
  ],

  frontier_outpost: [
    [
      { type: "snow_goblin", count: 10, interval: 600 },
      { type: "frostling", count: 8, interval: 580, delay: 2600 },
      { type: "ice_witch", count: 5, interval: 760, delay: 2400 },
    ],
    [
      { type: "yeti", count: 6, interval: 900 },
      { type: "snow_goblin", count: 14, interval: 400, delay: 2400 },
      { type: "crossbowman", count: 6, interval: 700, delay: 2200 },
    ],
    [
      { type: "ice_witch", count: 7, interval: 700 },
      { type: "frostling", count: 12, interval: 400, delay: 2300 },
      { type: "assassin", count: 7, interval: 540, delay: 2100 },
    ],
    [
      { type: "swamp_troll", count: 7, interval: 820 },
      { type: "snow_goblin", count: 18, interval: 340, delay: 2200 },
      { type: "plaguebearer", count: 7, interval: 680, delay: 2000 },
    ],
    [
      { type: "shadow_knight", count: 5, interval: 900 },
      { type: "yeti", count: 8, interval: 760, delay: 2100 },
      { type: "ice_witch", count: 8, interval: 620, delay: 1900 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 1500 },
      { type: "frostling", count: 16, interval: 320, delay: 2100 },
      { type: "assassin", count: 9, interval: 500, delay: 1900 },
    ],
    [
      { type: "professor", count: 3, interval: 1600 },
      { type: "necromancer", count: 5, interval: 980, delay: 1900 },
      { type: "snow_goblin", count: 20, interval: 300, delay: 1800 },
    ],
    [
      { type: "dean", count: 2, interval: 2300 },
      { type: "golem", count: 2, interval: 2500, delay: 1800 },
      { type: "shadow_knight", count: 7, interval: 760, delay: 1700 },
      { type: "yeti", count: 11, interval: 680, delay: 1600 },
    ],
    [
      { type: "trustee", count: 2, interval: 2500 },
      { type: "juggernaut", count: 1, interval: 3000, delay: 1800 },
      { type: "ice_witch", count: 11, interval: 560, delay: 1700 },
      { type: "frostling", count: 20, interval: 280, delay: 1600 },
    ],
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dean", count: 2, interval: 2100, delay: 1700 },
      { type: "golem", count: 2, interval: 2400, delay: 1600 },
      { type: "snow_goblin", count: 28, interval: 240, delay: 1500 },
      { type: "shadow_knight", count: 10, interval: 660, delay: 1450 },
    ],
  ],
  // =====================
  // DEV TEST LEVELS
  // =====================
  dev_enemy_showcase: [
    [
      // Academic progression
      { type: "frosh", count: 1, interval: 1000 },
      { type: "sophomore", count: 1, interval: 1000, delay: 3000 },
      { type: "junior", count: 1, interval: 1000, delay: 3000 },
      { type: "senior", count: 1, interval: 1000, delay: 3000 },
      { type: "gradstudent", count: 1, interval: 1000, delay: 3000 },
      { type: "professor", count: 1, interval: 1000, delay: 3000 },
      { type: "dean", count: 1, interval: 1000, delay: 3000 },
      { type: "trustee", count: 1, interval: 1000, delay: 3000 },
      // Campus
      { type: "mascot", count: 1, interval: 1000, delay: 3000 },
      { type: "athlete", count: 1, interval: 1000, delay: 3000 },
      { type: "protestor", count: 1, interval: 1000, delay: 3000 },
      // Ranged
      { type: "archer", count: 1, interval: 1000, delay: 3000 },
      { type: "mage", count: 1, interval: 1000, delay: 3000 },
      { type: "catapult", count: 1, interval: 1000, delay: 3000 },
      { type: "warlock", count: 1, interval: 1000, delay: 3000 },
      { type: "crossbowman", count: 1, interval: 1000, delay: 3000 },
      // Swamp
      { type: "hexer", count: 1, interval: 1000, delay: 3000 },
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
      // Desert
      { type: "sandworm", count: 1, interval: 1000, delay: 3000 },
      { type: "nomad", count: 1, interval: 1000, delay: 3000 },
      { type: "scorpion", count: 1, interval: 1000, delay: 3000 },
      { type: "scarab", count: 1, interval: 1000, delay: 3000 },
      // Winter
      { type: "frostling", count: 1, interval: 1000, delay: 3000 },
      { type: "snow_goblin", count: 1, interval: 1000, delay: 3000 },
      { type: "yeti", count: 1, interval: 1000, delay: 3000 },
      { type: "ice_witch", count: 1, interval: 1000, delay: 3000 },
      // Volcanic
      { type: "infernal", count: 1, interval: 1000, delay: 3000 },
      { type: "magma_spawn", count: 1, interval: 1000, delay: 3000 },
      { type: "fire_imp", count: 1, interval: 1000, delay: 3000 },
      { type: "ember_guard", count: 1, interval: 1000, delay: 3000 },
      // Boss / Special
      { type: "banshee", count: 1, interval: 1000, delay: 3000 },
      { type: "juggernaut", count: 1, interval: 1000, delay: 3000 },
      { type: "assassin", count: 1, interval: 1000, delay: 3000 },
      { type: "dragon", count: 1, interval: 1000, delay: 3000 },
    ],
  ],
};

export const WAVES: WaveGroup[][] = LEVEL_WAVES.poe;
