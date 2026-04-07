import { LEVEL_WAVES } from "../constants";
import type { EnemyType, WaveGroup } from "../types";

// ---------------------------------------------------------------------------
// Theme definitions — each theme is a curated pool of enemies grouped by tier
// ---------------------------------------------------------------------------

interface SandboxTheme {
  name: string;
  grunts: EnemyType[];
  elites: EnemyType[];
  bosses: EnemyType[];
}

const SANDBOX_THEMES: SandboxTheme[] = [
  {
    bosses: [
      "death_knight",
      "lich",
      "abomination",
      "doom_herald",
      "skeleton_king",
    ],
    elites: [
      "skeleton_knight",
      "zombie_brute",
      "dark_knight",
      "fallen_paladin",
      "black_guard",
      "dark_priest",
      "bone_mage",
      "wraith",
      "revenant",
    ],
    grunts: [
      "skeleton_footman",
      "zombie_shambler",
      "zombie_spitter",
      "ghoul",
      "skeleton_archer",
      "hellhound",
    ],
    name: "Dark Fantasy",
  },
  {
    bosses: ["brood_mother"],
    elites: [
      "mantis",
      "bombardier_beetle",
      "centipede",
      "dragonfly",
      "locust",
      "trapdoor_spider",
      "ice_beetle",
      "magma_beetle",
      "ash_moth",
      "snow_moth",
    ],
    grunts: [
      "orb_weaver",
      "ant_soldier",
      "mosquito",
      "fire_ant",
      "frost_tick",
      "silk_moth",
    ],
    name: "Bug Swarm",
  },
  {
    bosses: ["ancient_ent", "swamp_hydra", "mammoth", "wendigo", "lava_golem"],
    elites: [
      "dire_bear",
      "forest_troll",
      "frost_troll",
      "marsh_troll",
      "swamp_troll",
      "giant_toad",
      "vine_serpent",
      "giant_eagle",
      "volcanic_drake",
    ],
    grunts: ["timber_wolf", "dire_wolf", "bog_creature", "salamander"],
    name: "Beast Horde",
  },
  {
    bosses: ["lich", "banshee", "djinn"],
    elites: [
      "mage",
      "warlock",
      "hexer",
      "necromancer",
      "bone_mage",
      "ice_witch",
      "specter",
    ],
    grunts: ["cultist", "dark_priest", "plaguebearer", "will_o_wisp"],
    name: "Arcane Coven",
  },
  {
    bosses: ["phoenix", "sphinx_guardian", "djinn"],
    elites: ["sandworm", "manticore", "basilisk"],
    grunts: ["nomad", "scarab", "scorpion"],
    name: "Desert Raiders",
  },
  {
    bosses: ["wendigo", "mammoth", "frost_colossus"],
    elites: ["yeti", "ice_witch", "ice_beetle", "frost_troll", "dire_wolf"],
    grunts: ["snow_goblin", "frostling", "frost_tick", "snow_moth"],
    name: "Frost Legion",
  },
  {
    bosses: ["lava_golem", "inferno_wyrm"],
    elites: [
      "ember_guard",
      "infernal",
      "magma_beetle",
      "salamander",
      "volcanic_drake",
    ],
    grunts: ["fire_imp", "magma_spawn", "fire_ant", "ash_moth"],
    name: "Volcanic Fury",
  },
  {
    bosses: ["swamp_hydra", "swamp_leviathan"],
    elites: [
      "swamp_troll",
      "giant_toad",
      "vine_serpent",
      "marsh_troll",
      "centipede",
      "dragonfly",
    ],
    grunts: ["bog_creature", "will_o_wisp", "mosquito", "silk_moth"],
    name: "Swamp Horrors",
  },
  {
    bosses: ["professor", "dean", "trustee", "mascot"],
    elites: ["junior", "senior", "gradstudent", "archer", "crossbowman"],
    grunts: ["frosh", "sophomore", "athlete", "tiger_fan"],
    name: "Academic Gauntlet",
  },
  {
    bosses: ["juggernaut", "assassin", "dragon"],
    elites: ["golem", "shadow_knight", "catapult", "harpy", "wyvern"],
    grunts: ["archer", "crossbowman", "berserker"],
    name: "War Machine",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WAVE_LOOKAHEAD = 10;

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].toSorted(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Theme tracking — avoid repeating the same theme back-to-back
// ---------------------------------------------------------------------------

let lastThemeIndex = -1;

function pickFreshTheme(): SandboxTheme {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * SANDBOX_THEMES.length);
  } while (idx === lastThemeIndex && SANDBOX_THEMES.length > 1);
  lastThemeIndex = idx;
  return SANDBOX_THEMES[idx];
}

// ---------------------------------------------------------------------------
// Single wave generator
// ---------------------------------------------------------------------------

function generateSandboxWave(waveIndex: number): WaveGroup[] {
  const waveNum = waveIndex + 1;

  const isChaosWave = waveNum % 10 === 0;
  const isBossWave = waveNum % 5 === 0;
  const isMixedWave = !isChaosWave && waveNum % 3 === 0;

  let themes: SandboxTheme[];
  if (isChaosWave) {
    themes = pickRandomN(SANDBOX_THEMES, 3);
  } else if (isMixedWave) {
    themes = pickRandomN(SANDBOX_THEMES, 2);
  } else {
    themes = [pickFreshTheme()];
  }

  const difficultyMult = 1 + waveNum * 0.12;
  const groupCount = clamp(2 + Math.floor(waveNum / 4), 2, 7);

  const wave: WaveGroup[] = [];

  for (let g = 0; g < groupCount; g++) {
    const theme = themes[g % themes.length];

    let pool: EnemyType[];
    let baseCount: number;
    let baseInterval: number;

    if (isBossWave && g === 0) {
      pool = theme.bosses;
      baseCount = clamp(1 + Math.floor(waveNum / 15), 1, 4);
      baseInterval = clamp(3000 - waveNum * 30, 1200, 3500);
    } else if (isChaosWave && g <= 1) {
      pool = [...theme.elites, ...theme.bosses];
      baseCount = clamp(Math.ceil(4 * difficultyMult), 2, 30);
      baseInterval = clamp(600 - waveNum * 5, 200, 800);
    } else if (waveNum > 8 && g < Math.ceil(groupCount / 2)) {
      pool = theme.elites;
      baseCount = Math.ceil(3 * difficultyMult);
      baseInterval = clamp(700 - waveNum * 8, 250, 900);
    } else {
      pool = theme.grunts;
      baseCount = Math.ceil(5 * difficultyMult);
      baseInterval = clamp(600 - waveNum * 10, 180, 800);
    }

    const enemyType = pickRandom(pool);
    const count = Math.max(
      1,
      Math.round(baseCount * (0.8 + Math.random() * 0.4))
    );
    const interval = Math.max(
      120,
      Math.round(baseInterval * (0.85 + Math.random() * 0.3))
    );

    const delay = g === 0 ? 0 : clamp(2200 - waveNum * 25, 600, 2800);

    wave.push({
      count,
      interval,
      type: enemyType,
      ...(delay > 0 ? { delay } : {}),
    });
  }

  return wave;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function resetSandboxWaves(): void {
  lastThemeIndex = -1;
  const waves: WaveGroup[][] = [];
  for (let i = 0; i < WAVE_LOOKAHEAD; i++) {
    waves.push(generateSandboxWave(i));
  }
  LEVEL_WAVES.sandbox = waves;
}

export function ensureSandboxWaves(currentWave: number): void {
  const waves = LEVEL_WAVES.sandbox;
  if (!waves) {
    resetSandboxWaves();
    return;
  }
  while (waves.length <= currentWave + WAVE_LOOKAHEAD) {
    waves.push(generateSandboxWave(waves.length));
  }
}

export function isSandboxLevel(levelId: string): boolean {
  return levelId === "sandbox";
}

export function getSandboxThemeName(waveIndex: number): string | null {
  if (waveIndex < 0) {
    return null;
  }
  const waveNum = waveIndex + 1;
  if (waveNum % 10 === 0) {
    return "Chaos";
  }
  if (waveNum % 5 === 0) {
    return "Boss Rush";
  }
  return null;
}
