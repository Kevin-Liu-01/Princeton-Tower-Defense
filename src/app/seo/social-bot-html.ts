import type { NextRequest } from "next/server";

import { WORLD_LEVELS } from "../components/menus/world-map/worldMapData";
import { SITE_NAME, SITE_DESCRIPTION_SHORT, SITE_URL } from "./constants";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const STATIC_OG_IMAGE_PATH = "/og.png";
const TWITTER_SITE_HANDLE = "@kevskgs";
const TWITTER_CREATOR_HANDLE = "@kevskgs";

export const SOCIAL_BOT_RE =
  /Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Applebot|Pinterestbot/i;

const BOT_BYPASS_PREFIXES = ["/api/", "/og"];

export function isSocialBot(req: NextRequest): boolean {
  return SOCIAL_BOT_RE.test(req.headers.get("user-agent") ?? "");
}

export function shouldServeBotHtml(pathname: string): boolean {
  return !BOT_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

interface PageMeta {
  title: string;
  description: string;
  ogImagePath: string;
  ogImageAlt: string;
  ogType: string;
  canonicalPath: string;
}

function resolvePageMeta(pathname: string): PageMeta {
  const slug = pathname.replace(/^\/+/, "").replace(/\/+$/, "");

  const level = slug ? WORLD_LEVELS.find((l) => l.id === slug) : null;
  if (level) {
    return {
      canonicalPath: `/${level.id}`,
      description: level.description.replaceAll("\n", " "),
      ogImageAlt: `${level.name} — level preview in ${SITE_NAME}`,
      ogImagePath: `/og.png?level=${encodeURIComponent(level.id)}`,
      ogType: "website",
      title: `Play ${level.name} | ${SITE_NAME}`,
    };
  }

  if (slug.startsWith("codex")) {
    return {
      canonicalPath: `/${slug}`,
      description: `Browse the ${SITE_NAME} codex — towers, heroes, enemies, spells, and more.`,
      ogImageAlt: `${SITE_NAME} Codex`,
      ogImagePath: STATIC_OG_IMAGE_PATH,
      ogType: "website",
      title: `Codex | ${SITE_NAME}`,
    };
  }

  if (slug === "creator") {
    return {
      canonicalPath: "/creator",
      description:
        "Design custom tower defense maps. Place paths, set enemy waves, add hazards, and playtest your creations.",
      ogImageAlt: `${SITE_NAME} Level Creator`,
      ogImagePath: STATIC_OG_IMAGE_PATH,
      ogType: "website",
      title: `Level Creator | ${SITE_NAME}`,
    };
  }

  return {
    canonicalPath: "/",
    description: SITE_DESCRIPTION_SHORT,
    ogImageAlt: `${SITE_NAME} - Free browser tower defense game`,
    ogImagePath: STATIC_OG_IMAGE_PATH,
    ogType: "website",
    title: `${SITE_NAME} | Free Browser Tower Defense Game`,
  };
}

export function buildBotResponse(req: NextRequest): Response {
  const meta = resolvePageMeta(req.nextUrl.pathname);
  const image = `${SITE_URL}${meta.ogImagePath}`;
  const url = `${SITE_URL}${meta.canonicalPath}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}" />
<meta property="og:title" content="${esc(meta.title)}" />
<meta property="og:description" content="${esc(meta.description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="${OG_WIDTH}" />
<meta property="og:image:height" content="${OG_HEIGHT}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:alt" content="${esc(meta.ogImageAlt)}" />
<meta property="og:type" content="${meta.ogType}" />
<meta property="og:site_name" content="${esc(SITE_NAME)}" />
<meta property="og:locale" content="en_US" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="${TWITTER_SITE_HANDLE}" />
<meta name="twitter:creator" content="${TWITTER_CREATOR_HANDLE}" />
<meta name="twitter:title" content="${esc(meta.title)}" />
<meta name="twitter:description" content="${esc(meta.description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<meta name="twitter:image:alt" content="${esc(meta.ogImageAlt)}" />
<meta name="twitter:image:type" content="image/png" />
<meta name="twitter:image:width" content="${OG_WIDTH}" />
<meta name="twitter:image:height" content="${OG_HEIGHT}" />
<link rel="icon" href="/favicon.ico" />
</head>
<body></body>
</html>`;

  const body = new TextEncoder().encode(html);

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Content-Length": String(body.byteLength),
      "Content-Type": "text/html; charset=utf-8",
      Vary: "User-Agent",
    },
    status: 200,
  });
}

function esc(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
