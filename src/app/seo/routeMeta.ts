import type { Metadata } from "next";
import { parseRoute } from "../constants/routes";
import { WORLD_LEVELS } from "../components/menus/world-map/worldMapData";
import { LEVEL_DATA } from "../constants";
import { SITE_URL, SITE_NAME, OG_IMAGES, REGION_OG_IMAGE } from "./constants";

type OgImageKey = keyof typeof OG_IMAGES;

const REGION_LABEL: Record<string, string> = {
  grassland: "Princeton Grounds",
  swamp: "Murky Marshes",
  desert: "Sahara Sands",
  winter: "Frozen Frontier",
  volcanic: "Volcanic Depths",
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

const KIND_LABEL: Record<string, string> = {
  campaign: "Campaign",
  challenge: "Challenge Map",
  sandbox: "Sandbox Mode",
};

const CODEX_TAB_META: Record<string, { title: string; description: string }> = {
  towers: {
    title: "Tower Codex - All 7 Towers & Upgrade Paths",
    description:
      "Browse every tower in Princeton Tower Defense: Nassau Cannon, Firestone Library, E-Quad Lab, Blair Arch, Eating Club, Dinky Station, and Palmer Mortar. Each with dual upgrade paths, stats, and strategy tips.",
  },
  heroes: {
    title: "Hero Codex - All 9 Heroes & Abilities",
    description:
      "Meet all 9 heroes: Princeton Tiger, Mathey Knight, Acapella Tenor, Rocky Raccoon, F. Scott, General Mercer, BSE Engineer, Nassau Phoenix, and Ivy Warden. View abilities, stats, and roles.",
  },
  enemies: {
    title: "Enemy Codex - 50+ Enemy Types & Bosses",
    description:
      "Explore the full bestiary of 50+ enemies across 5 regions: melee, ranged, flying, shielded, boss, and swarm types. Learn their abilities and weaknesses.",
  },
  spells: {
    title: "Spell Codex - All Spells & Upgrade Trees",
    description:
      "Master all 6 spells: Fireball, Lightning, Freeze, Hex Ward, Payday, and Reinforcements. View upgrade trees, cooldowns, damage, and area of effect.",
  },
  special_towers: {
    title: "Special Towers - Beacons, Shrines, Vaults & Barracks",
    description:
      "Discover special objective structures in Princeton Tower Defense: beacons, shrines, vaults, and barracks. Learn how to capture and defend them on each map.",
  },
  hazards: {
    title: "Hazards Guide - Lava, Quicksand, Blizzards & More",
    description:
      "Learn about environmental hazards across all 5 regions: lava geysers, poison fog, quicksand, blizzard zones, and more. Strategy tips for hazard-heavy maps.",
  },
  guide: {
    title: "Strategy Guide - Tips, Mechanics & Walkthrough",
    description:
      "Complete strategy guide for Princeton Tower Defense. Learn tower placement, hero deployment, spell timing, wave management, and upgrade priorities for every region.",
  },
};

function getLevelMeta(levelId: string): Metadata | null {
  const level = WORLD_LEVELS.find((l) => l.id === levelId);
  if (!level) return null;

  const region = REGION_LABEL[level.region] ?? level.region;
  const difficulty = DIFFICULTY_LABEL[level.difficulty] ?? "Normal";
  const kind = KIND_LABEL[level.kind ?? "campaign"] ?? "Campaign";
  const cleanDesc = level.description.replace(/\n/g, " ");
  const tags = level.tags.join(", ");
  const canonical = `${SITE_URL}/${level.id}`;

  const levelData = LEVEL_DATA[levelId];
  const ogImage = levelData?.previewImage
    ? {
        url: `${SITE_URL}${levelData.previewImage}`,
        width: 800,
        height: 450,
        alt: `${level.name} level preview — ${region} in Princeton Tower Defense`,
      }
    : OG_IMAGES[REGION_OG_IMAGE[level.region] ?? "primary"];

  const title = `Play ${level.name} — ${region} ${kind} | ${SITE_NAME}`;
  const description =
    `Play ${level.name} in Princeton Tower Defense — a ${difficulty.toLowerCase()} ${kind.toLowerCase()} level in the ${region} region. ` +
    `${cleanDesc} Tags: ${tags}. Build towers, summon heroes, and cast spells to survive every wave. Share this link to let anyone try this level!`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [ogImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function getRouteMetadata(slug: string[] | undefined): Metadata {
  const route = parseRoute(slug);
  if (!route) return {};

  switch (route.type) {
    case "home":
      return {};

    case "level":
      return getLevelMeta(route.levelId) ?? {};

    case "codex": {
      const tab = route.tab ?? "towers";
      const meta = CODEX_TAB_META[tab];
      if (!meta) return {};
      const canonical = route.tab
        ? `${SITE_URL}/codex/${route.tab}`
        : `${SITE_URL}/codex`;
      return {
        title: meta.title,
        description: meta.description,
        alternates: { canonical },
        openGraph: {
          title: `${meta.title} | ${SITE_NAME}`,
          description: meta.description,
          url: canonical,
          siteName: SITE_NAME,
          images: [OG_IMAGES.primary],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${meta.title} | ${SITE_NAME}`,
          description: meta.description,
          images: [OG_IMAGES.primary],
        },
      };
    }

    case "creator":
      return {
        title: "Custom Level Creator - Build Your Own Maps",
        description:
          "Design custom tower defense maps in Princeton Tower Defense. Place paths, set enemy waves, add hazards, choose themes, and playtest your creations. 5 themes and full wave editor.",
        alternates: { canonical: `${SITE_URL}/creator` },
        openGraph: {
          title: `Level Creator | ${SITE_NAME}`,
          description:
            "Build custom tower defense maps with the Princeton TD level creator. Design paths, place hazards, compose waves, and share your maps.",
          url: `${SITE_URL}/creator`,
          siteName: SITE_NAME,
          images: [OG_IMAGES.homepage],
          type: "website",
        },
      };

    case "credits":
      return {
        title: "Credits & About",
        description:
          "Princeton Tower Defense was created by Kevin Liu. Built with Next.js, React, TypeScript, and HTML5 Canvas. No game engine — every pixel is hand-rendered.",
        alternates: { canonical: `${SITE_URL}/credits` },
        openGraph: {
          title: `Credits | ${SITE_NAME}`,
          description:
            "Meet the creator of Princeton Tower Defense and learn about the tech stack behind the game.",
          url: `${SITE_URL}/credits`,
          siteName: SITE_NAME,
          images: [OG_IMAGES.homepage],
          type: "website",
        },
      };

    case "settings":
      return {
        title: "Game Settings",
        description:
          "Configure graphics quality, audio, controls, and accessibility options for Princeton Tower Defense.",
        alternates: { canonical: `${SITE_URL}/settings` },
      };
  }
}
