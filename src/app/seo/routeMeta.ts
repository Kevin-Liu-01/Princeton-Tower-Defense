import type { Metadata } from "next";

import { WORLD_LEVELS } from "../components/menus/world-map/worldMapData";
import { parseRoute } from "../constants/routes";
import { SITE_URL, SITE_NAME } from "./constants";

/**
 * Bump whenever the OG renderer layout changes. Appended to every OG image
 * URL so Vercel's edge cache + external social-platform unfurl caches see a
 * new key and re-fetch the freshly-rendered image. Without this the old
 * layout can stick around for days on Slack / iMessage / Twitter / etc.
 * even after a deploy.
 */
const OG_VERSION = "2";

const HOME_OG = {
  alt: "Princeton Tower Defense - Free Browser Tower Defense Game with 26 Levels, 9 Heroes, and 100+ Enemies",
  height: 630,
  type: "image/png",
  url: `/og.png?v=${OG_VERSION}`,
  width: 1200,
} as const;

function buildLevelOgImage(level: { id: string; name: string }) {
  return {
    alt: `${level.name} — level preview in ${SITE_NAME}`,
    height: 630,
    type: "image/png",
    url: `/og.png?level=${encodeURIComponent(level.id)}&v=${OG_VERSION}`,
    width: 1200,
  } as const;
}

const REGION_LABEL: Record<string, string> = {
  desert: "Sahara Sands",
  grassland: "Princeton Grounds",
  swamp: "Murky Marshes",
  volcanic: "Volcanic Depths",
  winter: "Frozen Frontier",
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
  enemies: {
    description:
      "Explore the full bestiary of 100+ enemies across 5 regions: melee, ranged, flying, shielded, boss, and swarm types. Learn their abilities and weaknesses.",
    title: "Enemy Codex - 100+ Enemy Types & Bosses",
  },
  guide: {
    description:
      "Complete strategy guide for Princeton Tower Defense. Learn tower placement, hero deployment, spell timing, wave management, and upgrade priorities for every region.",
    title: "Strategy Guide - Tips, Mechanics & Walkthrough",
  },
  hazards: {
    description:
      "Learn about environmental hazards across all 5 regions: lava geysers, poison fog, quicksand, blizzard zones, and more. Strategy tips for hazard-heavy maps.",
    title: "Hazards Guide - Lava, Quicksand, Blizzards & More",
  },
  heroes: {
    description:
      "Meet all 9 heroes: Princeton Tiger, Mathey Knight, Acapella Tenor, Rocky Raccoon, F. Scott, General Mercer, BSE Engineer, Nassau Phoenix, and Ivy Warden. View abilities, stats, and roles.",
    title: "Hero Codex - All 9 Heroes & Abilities",
  },
  special_towers: {
    description:
      "Discover special objective structures in Princeton Tower Defense: beacons, shrines, vaults, and barracks. Learn how to capture and defend them on each map.",
    title: "Special Towers - Beacons, Shrines, Vaults & Barracks",
  },
  spells: {
    description:
      "Master all 6 spells: Fireball, Lightning, Freeze, Hex Ward, Payday, and Reinforcements. View upgrade trees, cooldowns, damage, and area of effect.",
    title: "Spell Codex - All Spells & Upgrade Trees",
  },
  towers: {
    description:
      "Browse every tower in Princeton Tower Defense: Nassau Cannon, Firestone Library, E-Quad Lab, Blair Arch, Eating Club, Dinky Station, and Palmer Mortar. Each with dual upgrade paths, stats, and strategy tips.",
    title: "Tower Codex - All 7 Towers & Upgrade Paths",
  },
};

function getLevelMeta(levelId: string): Metadata | null {
  const level = WORLD_LEVELS.find((l) => l.id === levelId);
  if (!level) {
    return null;
  }

  const region = REGION_LABEL[level.region] ?? level.region;
  const difficulty = DIFFICULTY_LABEL[level.difficulty] ?? "Normal";
  const kind = KIND_LABEL[level.kind ?? "campaign"] ?? "Campaign";
  const cleanDesc = level.description.replaceAll("\n", " ");
  const tags = level.tags.join(", ");
  const canonical = `${SITE_URL}/${level.id}`;

  const title = `Play ${level.name} — ${region} ${kind} | ${SITE_NAME}`;
  const description =
    `Play ${level.name} in Princeton Tower Defense — a ${difficulty.toLowerCase()} ${kind.toLowerCase()} level in the ${region} region. ` +
    `${cleanDesc} Tags: ${tags}. Build towers, summon heroes, and cast spells to survive every wave. Share this link to let anyone try this level!`;

  const ogImage = buildLevelOgImage(level);

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: [ogImage],
      siteName: SITE_NAME,
      title,
      type: "website",
      url: canonical,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [ogImage],
      title,
    },
  };
}

export function getRouteMetadata(slug: string[] | undefined): Metadata {
  const route = parseRoute(slug);
  if (!route) {
    return {};
  }

  switch (route.type) {
    case "home": {
      return {};
    }

    case "level": {
      return getLevelMeta(route.levelId) ?? {};
    }

    case "codex": {
      const tab = route.tab ?? "towers";
      const meta = CODEX_TAB_META[tab];
      if (!meta) {
        return {};
      }
      const canonical = route.tab
        ? `${SITE_URL}/codex/${route.tab}`
        : `${SITE_URL}/codex`;
      return {
        alternates: { canonical },
        description: meta.description,
        openGraph: {
          description: meta.description,
          images: [HOME_OG],
          siteName: SITE_NAME,
          title: `${meta.title} | ${SITE_NAME}`,
          type: "website",
          url: canonical,
        },
        title: meta.title,
        twitter: {
          card: "summary_large_image",
          description: meta.description,
          images: [HOME_OG],
          title: `${meta.title} | ${SITE_NAME}`,
        },
      };
    }

    case "creator": {
      const desc =
        "Design custom tower defense maps in Princeton Tower Defense. Place paths, set enemy waves, add hazards, choose themes, and playtest your creations. 5 themes and full wave editor.";
      const ogDesc =
        "Build custom tower defense maps with the Princeton TD level creator. Design paths, place hazards, compose waves, and share your maps.";
      const title = `Level Creator | ${SITE_NAME}`;
      return {
        alternates: { canonical: `${SITE_URL}/creator` },
        description: desc,
        openGraph: {
          description: ogDesc,
          images: [HOME_OG],
          siteName: SITE_NAME,
          title,
          type: "website",
          url: `${SITE_URL}/creator`,
        },
        title: "Custom Level Creator - Build Your Own Maps",
        twitter: {
          card: "summary_large_image",
          description: ogDesc,
          images: [HOME_OG],
          title,
        },
      };
    }

    case "credits": {
      const desc =
        "Princeton Tower Defense was created by Kevin Liu. Built with Next.js, React, TypeScript, and HTML5 Canvas. No game engine — every pixel is hand-rendered.";
      const ogDesc =
        "Meet the creator of Princeton Tower Defense and learn about the tech stack behind the game.";
      const title = `Credits | ${SITE_NAME}`;
      return {
        alternates: { canonical: `${SITE_URL}/credits` },
        description: desc,
        openGraph: {
          description: ogDesc,
          images: [HOME_OG],
          siteName: SITE_NAME,
          title,
          type: "website",
          url: `${SITE_URL}/credits`,
        },
        title: "Credits & About",
        twitter: {
          card: "summary_large_image",
          description: ogDesc,
          images: [HOME_OG],
          title,
        },
      };
    }

    case "settings": {
      const desc =
        "Configure graphics quality, audio, controls, and accessibility options for Princeton Tower Defense.";
      const title = `Game Settings | ${SITE_NAME}`;
      return {
        alternates: { canonical: `${SITE_URL}/settings` },
        description: desc,
        openGraph: {
          description: desc,
          images: [HOME_OG],
          siteName: SITE_NAME,
          title,
          type: "website",
          url: `${SITE_URL}/settings`,
        },
        title: "Game Settings",
        twitter: {
          card: "summary_large_image",
          description: desc,
          images: [HOME_OG],
          title,
        },
      };
    }
  }
}
