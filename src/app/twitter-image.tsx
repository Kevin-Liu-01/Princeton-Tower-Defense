import { ImageResponse } from "next/og";

import { OG_SIZE, OG_ALT, getBaseUrl, renderOGImage } from "./seo/og-renderer";

export const runtime = "edge";
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function TwitterImage() {
  const baseUrl = await getBaseUrl();
  return new ImageResponse(renderOGImage(baseUrl), { ...size });
}
