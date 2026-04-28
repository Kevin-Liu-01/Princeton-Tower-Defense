import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  buildBotResponse,
  isSocialBot,
  shouldServeBotHtml,
} from "@/app/seo/social-bot-html";

export function middleware(req: NextRequest) {
  if (isSocialBot(req) && shouldServeBotHtml(req.nextUrl.pathname)) {
    return buildBotResponse(req);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|og|sitemap\\.xml|robots\\.txt|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
