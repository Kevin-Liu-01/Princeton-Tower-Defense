"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import type { CodexTabId } from "../components/menus/CodexModal";
import { parseRoute, routeToPath } from "../constants/routes";
import type { RouteTarget } from "../constants/routes";

export interface InitialNavigation {
  level: string | null;
  codex: { open: boolean; tab: CodexTabId };
  creator: boolean;
  credits: boolean;
  settings: boolean;
}

function routeToInitialNav(target: RouteTarget): InitialNavigation {
  const base: InitialNavigation = {
    codex: { open: false, tab: "towers" },
    creator: false,
    credits: false,
    level: null,
    settings: false,
  };

  switch (target.type) {
    case "level": {
      return { ...base, level: target.levelId };
    }
    case "codex": {
      return { ...base, codex: { open: true, tab: target.tab ?? "towers" } };
    }
    case "creator": {
      return { ...base, creator: true };
    }
    case "credits": {
      return { ...base, credits: true };
    }
    case "settings": {
      return { ...base, settings: true };
    }
    default: {
      return base;
    }
  }
}

function pathToSlug(pathname: string): string[] | undefined {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 0 ? segments : undefined;
}

export function useUrlNavigation() {
  const pathname = usePathname();
  const hasAppliedRef = useRef(false);

  const initialNav = useRef<InitialNavigation>(() => {
    const slug = pathToSlug(pathname);
    const route = parseRoute(slug);
    return routeToInitialNav(route ?? { type: "home" });
  });

  const getInitialNavigation = useCallback((): InitialNavigation | null => {
    if (hasAppliedRef.current) {
      return null;
    }
    hasAppliedRef.current = true;
    const val = initialNav.current;
    return typeof val === "function" ? (val as () => InitialNavigation)() : val;
  }, []);

  const updateUrl = useCallback((target: RouteTarget) => {
    const path = routeToPath(target);
    if (window.location.pathname !== path) {
      window.history.replaceState(null, "", path);
    }
  }, []);

  const resetUrl = useCallback(() => {
    if (window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      // nothing needed for now
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return { getInitialNavigation, resetUrl, updateUrl };
}
