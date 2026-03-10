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

export const AUTHOR_SAME_AS = [
  AUTHOR_URL,
  AUTHOR_GITHUB,
  AUTHOR_TWITTER,
  AUTHOR_LINKEDIN,
] as const;

export const SITE_DESCRIPTION =
  "Princeton Tower Defense is a free browser-based strategy game where you defend Princeton University's campus from waves of academic stress monsters. " +
  "Build 7 unique towers inspired by real campus landmarks (Nassau Cannon, Firestone Library, E-Quad Lab, Blair Arch, Eating Club, Dinky Station, and Palmer Mortar), " +
  "each with dual upgrade paths. Summon heroes, cast spells, and battle through 23 handcrafted levels across 5 themed regions.";

export const SITE_DESCRIPTION_SHORT =
  "Free browser tower defense game set at Princeton University. Build campus-themed towers, summon heroes, cast spells, and defend Nassau Hall across 23 levels and 5 regions.";

export const OG_DESCRIPTION =
  "Build towers at Princeton landmarks, summon heroes like the Princeton Tiger, and defend campus across 23 levels in this free browser tower defense game. " +
  "7 towers with dual upgrades, 5 spells, custom level creator, and 50+ unique enemies.";

export const KEYWORDS = [
  // Core game terms
  "tower defense",
  "tower defense game",
  "TD game",
  "strategy game",
  "browser game",
  "free browser game",
  "online tower defense",
  "HTML5 game",
  "web game",

  // Princeton-specific
  "Princeton",
  "Princeton University",
  "Princeton game",
  "Princeton Tower Defense",
  "Nassau Hall",
  "campus defense",
  "college game",

  // Feature keywords
  "hero tower defense",
  "spell casting game",
  "custom level creator",
  "map editor",
  "dual path tower defense",
  "isometric tower defense",
  "wave defense",

  // Tower names (for long-tail)
  "Nassau Cannon",
  "Firestone Library tower",
  "Blair Arch tower",
  "E-Quad Lab",
  "Dinky Station",
  "Palmer Mortar",
  "Eating Club tower",

  // Region keywords
  "grassland tower defense",
  "swamp tower defense",
  "desert tower defense",
  "winter tower defense",
  "volcanic tower defense",

  // Comparison / discovery
  "free tower defense game",
  "best browser tower defense",
  "tower defense no download",
  "play tower defense online",
  "indie tower defense",
  "React game",
  "Next.js game",
  "canvas game",
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
] as const;

export const GAME_STATS = {
  levels: 23,
  towers: 7,
  heroes: 7,
  spells: 5,
  regions: 5,
  enemyTypes: 50,
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
