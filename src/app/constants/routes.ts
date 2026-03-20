import type { CodexTabId } from "../components/menus/CodexModal";
import { WORLD_LEVELS, DEV_LEVELS } from "../components/menus/world-map/worldMapData";

export type RouteTarget =
  | { type: "home" }
  | { type: "level"; levelId: string }
  | { type: "codex"; tab?: CodexTabId }
  | { type: "creator" }
  | { type: "credits" }
  | { type: "settings" };

const ALL_LEVEL_IDS: ReadonlySet<string> = new Set([
  ...WORLD_LEVELS.map((l) => l.id),
  ...DEV_LEVELS.map((l) => l.id),
]);

const CODEX_TABS: ReadonlySet<string> = new Set<CodexTabId>([
  "towers",
  "heroes",
  "enemies",
  "spells",
  "special_towers",
  "hazards",
  "guide",
]);

const MODAL_ROUTES: Record<string, RouteTarget> = {
  codex: { type: "codex" },
  creator: { type: "creator" },
  credits: { type: "credits" },
  about: { type: "credits" },
  settings: { type: "settings" },
};

export function parseRoute(slug: string[] | undefined): RouteTarget | null {
  if (!slug || slug.length === 0) return { type: "home" };

  const first = slug[0].toLowerCase();

  if (first === "codex") {
    const tab = slug[1]?.toLowerCase();
    if (tab && !CODEX_TABS.has(tab)) return null;
    return { type: "codex", tab: (tab as CodexTabId) ?? undefined };
  }

  if (first in MODAL_ROUTES) {
    if (slug.length > 1) return null;
    return MODAL_ROUTES[first];
  }

  if (slug.length === 1 && ALL_LEVEL_IDS.has(first)) {
    return { type: "level", levelId: first };
  }

  return null;
}

export function isValidRoute(slug: string[]): boolean {
  return parseRoute(slug) !== null;
}

export function routeToPath(target: RouteTarget): string {
  switch (target.type) {
    case "home":
      return "/";
    case "level":
      return `/${target.levelId}`;
    case "codex":
      return target.tab ? `/codex/${target.tab}` : "/codex";
    case "creator":
      return "/creator";
    case "credits":
      return "/credits";
    case "settings":
      return "/settings";
  }
}
