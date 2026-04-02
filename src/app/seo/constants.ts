export const SITE_URL = "https://princetontd.vercel.app";
export const SITE_NAME = "Princeton Tower Defense";
export const SITE_AUTHOR = "Kevin Liu";
export const GITHUB_URL =
  "https://github.com/Kevin-Liu-01/Princeton-Tower-Defense";

export const AUTHOR_URL = "https://www.kevin-liu.tech/";
export const AUTHOR_GITHUB = "https://github.com/Kevin-Liu-01";
export const AUTHOR_TWITTER = "https://x.com/kevskgs";
export const AUTHOR_LINKEDIN =
  "https://www.linkedin.com/in/kevin-liu-princeton/";
export const AUTHOR_DEVPOST = "https://devpost.com/Kevin-Liu-01";
export const AUTHOR_ITCH = "https://kevin-liu-01.itch.io/";

export const AUTHOR_SAME_AS = [
  AUTHOR_URL,
  AUTHOR_GITHUB,
  AUTHOR_TWITTER,
  AUTHOR_LINKEDIN,
  AUTHOR_DEVPOST,
  AUTHOR_ITCH,
] as const;

export const SITE_DESCRIPTION =
  "Princeton Tower Defense is a free browser-based strategy game where you defend Princeton University's campus from waves of academic stress monsters. " +
  "Build 7 unique towers inspired by real campus landmarks (Nassau Cannon, Firestone Library, E-Quad Lab, Blair Arch, Eating Club, Dinky Station, and Palmer Mortar), " +
  "each with dual upgrade paths. Summon heroes, cast spells, and battle through 25+ handcrafted levels across 5 themed regions. " +
  "Includes a custom level creator, sandbox mode, and a full codex of towers, enemies, heroes, and spells.";

export const SITE_DESCRIPTION_SHORT =
  "Free browser tower defense game set at Princeton University. Build campus-themed towers, summon heroes, cast spells, and defend Nassau Hall across 25+ levels and 5 regions. No download required.";

export const OG_DESCRIPTION =
  "Build towers at Princeton landmarks, summon heroes like the Princeton Tiger, and defend campus across 25+ levels in this free browser tower defense game. " +
  "7 towers with dual upgrades, 9 heroes, 5 spells, custom level creator, sandbox mode, and 100+ unique enemies.";

export const KEYWORDS = [
  // Core game terms
  "tower defense",
  "tower defense game",
  "tower defence",
  "tower defence game",
  "TD game",
  "strategy game",
  "browser game",
  "free browser game",
  "online tower defense",
  "online tower defence",
  "HTML5 game",
  "web game",
  "casual strategy game",
  "wave defense game",
  "base defense game",

  // Princeton-specific
  "Princeton",
  "Princeton University",
  "Princeton game",
  "Princeton Tower Defense",
  "Princeton TD",
  "Princeton tower defence",
  "PrincetonTD",
  "Nassau Hall",
  "campus defense",
  "campus defence",
  "college game",
  "university game",
  "Ivy League game",

  // Feature keywords
  "hero tower defense",
  "spell casting game",
  "custom level creator",
  "level editor",
  "map editor",
  "custom maps",
  "sandbox mode",
  "sandbox tower defense",
  "dual path tower defense",
  "dual upgrade tower defense",
  "isometric tower defense",
  "wave defense",
  "tower upgrade paths",
  "codex",
  "bestiary",

  // Tower names (long-tail)
  "Nassau Cannon",
  "Firestone Library tower",
  "Blair Arch tower",
  "E-Quad Lab",
  "Dinky Station",
  "Palmer Mortar",
  "Eating Club tower",

  // Hero names
  "Princeton Tiger hero",
  "Mathey Knight",
  "Acapella Tenor",
  "Rocky Raccoon hero",
  "F. Scott hero",
  "General Mercer hero",
  "BSE Engineer hero",

  // Spell names
  "fireball spell",
  "lightning spell",
  "freeze spell",
  "hex ward spell",
  "payday spell",
  "reinforcements spell",

  // Region keywords
  "grassland tower defense",
  "swamp tower defense",
  "desert tower defense",
  "winter tower defense",
  "volcanic tower defense",
  "lava tower defense",
  "ice tower defense",
  "marsh tower defense",

  // Level names (long-tail discovery)
  "Poe Field level",
  "Carnegie Lake level",
  "Nassau Hall level",
  "Murky Bog level",
  "Sunken Temple level",
  "Desert Oasis level",
  "Pyramid Pass level",
  "Sphinx Gate level",
  "Glacier Path level",
  "Frost Fortress level",
  "Summit Peak level",
  "Lava Fields level",
  "Caldera Basin level",
  "Obsidian Throne level",

  // Comparison / discovery
  "free tower defense game",
  "best browser tower defense",
  "best free tower defense",
  "best tower defense 2024",
  "best tower defense 2025",
  "tower defense no download",
  "play tower defense online",
  "play tower defence online",
  "tower defense online free",
  "tower defence online free",
  "indie tower defense",
  "indie tower defence",
  "indie game",
  "indie browser game",
  "React game",
  "Next.js game",
  "canvas game",
  "TypeScript game",
  "open source game",
  "open source tower defense",

  // Common misspellings & alternate searches
  "tower defens",
  "tower defnse",
  "towerdefense",
  "towerdefence",
  "td game free",
  "td game online",
  "tower defense free no signup",
  "tower defense unblocked",
  "tower defence unblocked",
  "Princeton tower defnse",
  "princeton td game",
  "free td game",

  // Game genre adjacency
  "like Bloons TD",
  "like Kingdom Rush",
  "like Plants vs Zombies",
  "similar to Bloons",
  "similar to Kingdom Rush",
  "tower defense with heroes",
  "tower defense with spells",
  "tower defense with bosses",
  "single player strategy game",
  "casual browser game",
  "no install game",
  "play in browser",

  // Creator / developer
  "Kevin Liu",
  "Kevin Liu game",
  "Kevin Liu Princeton",
  "kevin-liu.tech",
];

export const TOWER_NAMES = [
  "Nassau Cannon",
  "Firestone Library",
  "E-Quad Lab",
  "Blair Arch",
  "Eating Club",
  "Dinky Station",
  "Palmer Mortar",
] as const;

export const REGION_NAMES = [
  "Princeton Grounds",
  "Murky Marshes",
  "Sahara Sands",
  "Frozen Frontier",
  "Volcanic Depths",
] as const;

export const HERO_NAMES = [
  "Princeton Tiger",
  "Mathey Knight",
  "Acapella Tenor",
  "Rocky Raccoon",
  "F. Scott",
  "General Mercer",
  "BSE Engineer",
  "Nassau Phoenix",
  "Ivy Warden",
] as const;

export const SPELL_NAMES = [
  "Fireball",
  "Lightning",
  "Freeze",
  "Hex Ward",
  "Payday",
  "Reinforcements",
] as const;

export const GAME_STATS = {
  levels: 25,
  towers: 7,
  heroes: 9,
  spells: 6,
  regions: 5,
  enemyTypes: 100,
  upgradePaths: 2,
} as const;

export const OG_IMAGES = {
  primary: {
    url: `${SITE_URL}/images/new/gameplay_grounds_ui.png`,
    width: 1200,
    height: 630,
    alt: "Princeton Tower Defense gameplay - isometric campus map with towers defending against waves of enemies near Nassau Hall",
  },
  desert: {
    url: `${SITE_URL}/images/new/gameplay_desert_ui.png`,
    width: 1200,
    height: 630,
    alt: "Princeton Tower Defense desert region - Sahara Sands with pyramid and oasis levels",
  },
  winter: {
    url: `${SITE_URL}/images/new/gameplay_winter_ui.png`,
    width: 1200,
    height: 630,
    alt: "Princeton Tower Defense winter region - Frozen Frontier with glacier and fortress levels",
  },
  volcano: {
    url: `${SITE_URL}/images/new/gameplay_volcano_ui.png`,
    width: 1200,
    height: 630,
    alt: "Princeton Tower Defense volcanic region - Volcanic Depths with lava fields and caldera levels",
  },
  swamp: {
    url: `${SITE_URL}/images/new/gameplay_swamp_ui.png`,
    width: 1200,
    height: 630,
    alt: "Princeton Tower Defense swamp region - Murky Marshes with bog and sunken temple levels",
  },
  homepage: {
    url: `${SITE_URL}/images/promo/homepage.png`,
    width: 1200,
    height: 630,
    alt: "Princeton Tower Defense main menu with world map showing 5 themed regions",
  },
} as const;

export const REGION_OG_IMAGE: Record<string, keyof typeof OG_IMAGES> = {
  grassland: "primary",
  swamp: "swamp",
  desert: "desert",
  winter: "winter",
  volcanic: "volcano",
} as const;
