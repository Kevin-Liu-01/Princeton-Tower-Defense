import type { MetadataRoute } from "next";
import { SITE_URL, OG_IMAGES, REGION_OG_IMAGE } from "./seo/constants";
import { WORLD_LEVELS } from "./components/menus/world-map/worldMapData";

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
      url: `${SITE_URL}/${level.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: level.kind === "sandbox" ? 0.6 : 0.5,
      images: [image.url],
    };
  });

  const codexEntries: MetadataRoute.Sitemap = CODEX_TABS.map((tab) => ({
    url: `${SITE_URL}/codex/${tab}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
    images: [OG_IMAGES.primary.url],
  }));

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [
        OG_IMAGES.primary.url,
        OG_IMAGES.desert.url,
        OG_IMAGES.swamp.url,
        OG_IMAGES.winter.url,
        OG_IMAGES.volcano.url,
        OG_IMAGES.homepage.url,
      ],
    },
    {
      url: `${SITE_URL}/codex`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [OG_IMAGES.primary.url],
    },
    ...codexEntries,
    {
      url: `${SITE_URL}/creator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [OG_IMAGES.homepage.url],
    },
    {
      url: `${SITE_URL}/credits`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...levelEntries,
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
