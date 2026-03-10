import {
  SITE_URL,
  SITE_NAME,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  GITHUB_URL,
  GAME_STATS,
  TOWER_NAMES,
  REGION_NAMES,
  HERO_NAMES,
  AUTHOR_URL,
  AUTHOR_GITHUB,
  AUTHOR_TWITTER,
  AUTHOR_LINKEDIN,
  AUTHOR_SAME_AS,
} from "./constants";

const PERSON_ID = `${SITE_URL}/#author`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const GAME_ID = `${SITE_URL}/#game`;

function getPersonSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_AUTHOR,
    url: AUTHOR_URL,
    sameAs: [...AUTHOR_SAME_AS],
    jobTitle: "Software Engineer",
    knowsAbout: [
      "React",
      "Next.js",
      "TypeScript",
      "HTML5 Canvas",
      "Game Development",
      "Tower Defense",
      "Web Development",
      "Isometric Rendering",
    ],
  };
}

function getWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": PERSON_ID },
    inLanguage: "en-US",
  };
}

function getVideoGameSchema() {
  return {
    "@type": "VideoGame",
    "@id": GAME_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    genre: ["Tower Defense", "Strategy", "Casual"],
    gamePlatform: ["Web Browser", "Desktop Browser", "Mobile Browser"],
    applicationCategory: "Game",
    operatingSystem: "Any (Browser-based)",
    datePublished: "2024-12-01",
    dateModified: new Date().toISOString().split("T")[0],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    mainEntityOfPage: { "@id": WEBSITE_ID },
    image: `${SITE_URL}/images/new/gameplay_grounds_ui.png`,
    screenshot: [
      `${SITE_URL}/images/new/gameplay_grounds_ui.png`,
      `${SITE_URL}/images/new/gameplay_desert_ui.png`,
      `${SITE_URL}/images/new/gameplay_swamp_ui.png`,
      `${SITE_URL}/images/new/gameplay_winter_ui.png`,
      `${SITE_URL}/images/new/gameplay_volcano_ui.png`,
      `${SITE_URL}/images/promo/homepage.png`,
    ],
    numberOfPlayers: { "@type": "QuantitativeValue", value: 1 },
    playMode: "SinglePlayer",
    gameItem: TOWER_NAMES.map((tower) => ({
      "@type": "Thing",
      name: tower,
      description: `A buildable tower in ${SITE_NAME} inspired by a Princeton University campus landmark`,
    })),
    characterAttribute: HERO_NAMES.map((hero) => ({
      "@type": "Thing",
      name: hero,
      description: `A playable hero character in ${SITE_NAME} with unique active abilities`,
    })),
    abstract:
      `${SITE_NAME} features ${GAME_STATS.levels} handcrafted levels across ${GAME_STATS.regions} themed regions ` +
      `(${REGION_NAMES.join(", ")}), ${GAME_STATS.towers} upgradeable towers with dual upgrade paths, ` +
      `${GAME_STATS.heroes} hero units, ${GAME_STATS.spells} castable spells, ${GAME_STATS.enemyTypes}+ enemy types, ` +
      `and a full custom level creator with sharing support.`,
    inLanguage: "en",
    isAccessibleForFree: true,
    sameAs: [GITHUB_URL],
  };
}

function getWebApplicationSchema() {
  return {
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and HTML5 Canvas support",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      `${GAME_STATS.towers} unique towers inspired by Princeton campus landmarks, each with 2 upgrade paths`,
      `${GAME_STATS.heroes} summonable hero characters with active abilities`,
      `${GAME_STATS.spells} castable spells with upgrade trees`,
      `${GAME_STATS.levels} levels across ${GAME_STATS.regions} themed regions: ${REGION_NAMES.join(", ")}`,
      `${GAME_STATS.enemyTypes}+ enemy types including bosses, flying, ranged, and swarm enemies`,
      "Custom level creator with path editor, hazard placement, and wave composition",
      "Star-gated world map progression system",
      "Challenge maps with tower restrictions for advanced players",
      "Dual-path levels with split enemy routes",
      "Environmental hazards: lava, quicksand, blizzard zones, poison fog, and more",
      "Isometric HTML5 Canvas rendering with no downloads or plugins required",
    ],
    author: { "@id": PERSON_ID },
  };
}

function getFAQSchema() {
  return {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Princeton Tower Defense?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Princeton Tower Defense is a free browser-based tower defense strategy game set at Princeton University. " +
            "Players build towers at iconic campus landmarks like Nassau Hall, Firestone Library, and Blair Arch to defend " +
            "against waves of enemies. The game features 23 levels across 5 themed regions, " +
            "7 upgradeable towers with dual upgrade paths, 7 hero characters, 5 spells, and a custom level creator.",
        },
      },
      {
        "@type": "Question",
        name: "How many towers are in Princeton Tower Defense?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            `There are ${GAME_STATS.towers} towers in Princeton Tower Defense, each inspired by a real Princeton campus landmark: ` +
            `${TOWER_NAMES.join(", ")}. Each tower has two distinct upgrade paths. For example, Nassau Cannon can upgrade into ` +
            "a rapid-fire Gatling Gun or a burn-damage Flamethrower, and Dinky Station can summon ranged Centaurs or tanky Royal Cavalry.",
        },
      },
      {
        "@type": "Question",
        name: "Is Princeton Tower Defense free to play?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes, Princeton Tower Defense is completely free to play in any modern web browser. No download, installation, or account required. " +
            "The game runs on HTML5 Canvas and works on desktop and mobile browsers.",
        },
      },
      {
        "@type": "Question",
        name: "What regions and maps are in Princeton Tower Defense?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            `Princeton Tower Defense has ${GAME_STATS.levels} levels spread across ${GAME_STATS.regions} themed regions: ` +
            "Princeton Grounds (grassland with Poe Field, Carnegie Lake, Nassau Hall), " +
            "Murky Marshes (swamp with Murky Bog, Witch's Domain, Sunken Temple), " +
            "Sahara Sands (desert with Desert Oasis, Pyramid Pass, Sphinx Gate), " +
            "Frozen Frontier (winter with Glacier Path, Frost Fortress, Summit Peak), " +
            "and Volcanic Depths (lava with Lava Fields, Caldera Basin, Obsidian Throne). " +
            "Each region also includes challenge maps with special tower restrictions.",
        },
      },
      {
        "@type": "Question",
        name: "Can I create custom levels in Princeton Tower Defense?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes! Princeton Tower Defense includes a full custom level creator. You can design your own maps with primary and secondary enemy paths, " +
            "place hero spawn points, add special objective structures (beacons, shrines, vaults, barracks), " +
            "set theme-specific decorations and environmental hazards, pre-place towers, and compose custom enemy waves. " +
            "Choose from 5 map themes: grassland, swamp, desert, winter, and volcanic.",
        },
      },
      {
        "@type": "Question",
        name: "What heroes are available in Princeton Tower Defense?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            `Princeton Tower Defense features ${GAME_STATS.heroes} playable heroes: ${HERO_NAMES.join(", ")}. ` +
            "Each hero has unique active abilities and can be deployed on the battlefield to support your tower defenses. " +
            "Heroes gain experience and can turn the tide during difficult waves.",
        },
      },
      {
        "@type": "Question",
        name: "What makes Princeton Tower Defense different from other tower defense games?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Princeton Tower Defense stands out with its Princeton University campus theme. All towers, enemies, and maps reference real " +
            "campus landmarks and student life. It features dual-lane enemy paths, 7 heroes with active abilities, a spell system with upgrades, " +
            "environmental hazards like lava geysers and quicksand, special objective structures, challenge maps with tower restrictions, " +
            "and a full custom level creator. It's built entirely with React and HTML5 Canvas with isometric rendering and no game engine.",
        },
      },
      {
        "@type": "Question",
        name: "What technology is Princeton Tower Defense built with?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Princeton Tower Defense is built with Next.js 14, React 18, TypeScript, and HTML5 Canvas. " +
            "The entire rendering pipeline (isometric terrain, tower animations, projectile arcs, death effects, fog, god rays, and ambient particles) " +
            "is hand-written Canvas 2D with no game engine or sprite sheets. Static layers are cached to offscreen canvases, " +
            "and quality-aware rendering adjusts detail based on runtime performance.",
        },
      },
    ],
  };
}

function getBreadcrumbSchema() {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
    ],
  };
}

function getSoftwareSourceCodeSchema() {
  return {
    "@type": "SoftwareSourceCode",
    name: SITE_NAME,
    codeRepository: GITHUB_URL,
    programmingLanguage: ["TypeScript", "React", "Next.js"],
    runtimePlatform: "Web Browser",
    author: { "@id": PERSON_ID },
    dateCreated: "2024-12-01",
    license: "https://opensource.org/licenses/MIT",
  };
}

export function getEntityGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getPersonSchema(),
      getWebSiteSchema(),
      getVideoGameSchema(),
      getWebApplicationSchema(),
      getFAQSchema(),
      getBreadcrumbSchema(),
      getSoftwareSourceCodeSchema(),
    ],
  };
}

export {
  getVideoGameSchema,
  getWebApplicationSchema,
  getFAQSchema,
  getBreadcrumbSchema,
  getSoftwareSourceCodeSchema,
};
