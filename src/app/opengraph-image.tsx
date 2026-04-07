import { ImageResponse } from "next/og";

import {
  OG_SIZE,
  OG_ALT,
  getBaseUrl,
  getOGFonts,
  renderOGImage,
} from "./seo/og-renderer";

export const runtime = "edge";
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OGImage() {
  const baseUrl = await getBaseUrl();
  const fonts = await getOGFonts(baseUrl);
  return new ImageResponse(renderOGImage(baseUrl), { ...size, fonts });
}
