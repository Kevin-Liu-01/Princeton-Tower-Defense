import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import {
  findLevelById,
  getBaseUrl,
  getOGFonts,
  OG_SIZE,
  renderLevelOGImage,
  renderOGImage,
} from "../seo/og-renderer";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const baseUrl = await getBaseUrl();
  const fonts = await getOGFonts(baseUrl);

  const levelId = request.nextUrl.searchParams.get("level")?.toLowerCase();
  const level = levelId ? findLevelById(levelId) : null;

  const element = level
    ? renderLevelOGImage(baseUrl, level)
    : renderOGImage(baseUrl);

  return new ImageResponse(element, {
    ...OG_SIZE,
    fonts,
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "image/png",
    },
  });
}
