import type { MetadataRoute } from "next";

import { WORLD_LEVELS } from "./components/menus/world-map/worldMapData";
import { SITE_URL, OG_IMAGES, REGION_OG_IMAGE } from "./seo/constants";

type OgImageKey = keyof typeof OG_IMAGES;

const CODEX_TABS = [
  "towers",
  "heroes",
  "enemies",
  "spells",
  "special_towers",
  "hazards",
  "guide",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const levelEntries: MetadataRoute.Sitemap = WORLD_LEVELS.map((level) => {
    const ogKey: OgImageKey = REGION_OG_IMAGE[level.region] ?? "primary";
    const image = OG_IMAGES[ogKey];
    return {
      changeFrequency: "monthly" as const,
      images: [image.url],
      lastModified: now,
      priority: level.kind === "sandbox" ? 0.6 : 0.5,
      url: `${SITE_URL}/${level.id}`,
    };
  });

  const codexEntries: MetadataRoute.Sitemap = CODEX_TABS.map((tab) => ({
    changeFrequency: "monthly" as const,
    images: [OG_IMAGES.primary.url],
    lastModified: now,
    priority: 0.5,
    url: `${SITE_URL}/codex/${tab}`,
  }));

  return [
    {
      changeFrequency: "weekly",
      images: [
        OG_IMAGES.primary.url,
        OG_IMAGES.desert.url,
        OG_IMAGES.swamp.url,
        OG_IMAGES.winter.url,
        OG_IMAGES.volcano.url,
        OG_IMAGES.homepage.url,
      ],
      lastModified: now,
      priority: 1,
      url: SITE_URL,
    },
    {
      changeFrequency: "monthly",
      images: [OG_IMAGES.primary.url],
      lastModified: now,
      priority: 0.7,
      url: `${SITE_URL}/codex`,
    },
    ...codexEntries,
    {
      changeFrequency: "monthly",
      images: [OG_IMAGES.homepage.url],
      lastModified: now,
      priority: 0.7,
      url: `${SITE_URL}/creator`,
    },
    {
      changeFrequency: "monthly",
      lastModified: now,
      priority: 0.3,
      url: `${SITE_URL}/credits`,
    },
    ...levelEntries,
    {
      changeFrequency: "monthly",
      lastModified: now,
      priority: 0.3,
      url: `${SITE_URL}/llms.txt`,
    },
    {
      changeFrequency: "monthly",
      lastModified: now,
      priority: 0.3,
      url: `${SITE_URL}/llms-full.txt`,
    },
  ];
}
