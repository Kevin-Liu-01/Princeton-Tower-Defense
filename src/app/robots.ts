import type { MetadataRoute } from "next";

import { SITE_URL } from "./seo/constants";

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "Googlebot",
  "Bingbot",
  "ClaudeBot",
  "Anthropic-AI",
  "PerplexityBot",
  "Applebot-Extended",
  "Amazonbot",
  "FacebookExternalHit",
  "CCBot",
  "Bytespider",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE_URL,
    rules: [
      {
        allow: "/",
        disallow: ["/api/"],
        userAgent: "*",
      },
      ...AI_CRAWLERS.map((bot) => ({
        allow: "/" as const,
        userAgent: bot,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
