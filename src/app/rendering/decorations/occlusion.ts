import type { Position } from "../../types";
import type { RuntimeDecoration } from "./decorationHelpers";
import type { DecorationSprite } from "./spriteCache";

export interface CachedVisibleDecoration {
  decoration: RuntimeDecoration;
  screenPos: Position;
  isoY: number;
  shadowOnly?: boolean;
  /** Pre-rendered sprite for fast per-frame drawing (depth-sensitive decorations) */
  sprite?: DecorationSprite;
  /** Separate shadow-only sprite for background shadow pass */
  shadowSprite?: DecorationSprite;
}

export interface OcclusionAnchor {
  source: CachedVisibleDecoration;
  heightTag: string;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  isoY: number;
  frontDepthPadding: number;
}

export function getOcclusionState(
  entry: CachedVisibleDecoration,
  occlusionAnchors: OcclusionAnchor[]
): { isInsideOccluder: boolean; clampIsoY?: number } {
  let isInsideOccluder = false;
  let clampIsoY: number | undefined;
  for (const anchor of occlusionAnchors) {
    if (anchor.source === entry) {
      continue;
    }
    const dx = entry.screenPos.x - anchor.centerX;
    const dy = entry.screenPos.y - anchor.centerY;
    const norm =
      (dx * dx) / (anchor.radiusX * anchor.radiusX) +
      (dy * dy) / (anchor.radiusY * anchor.radiusY);
    if (norm > 1) {
      continue;
    }

    isInsideOccluder = true;
    const isClearlyInFrontByScreenY =
      entry.screenPos.y > anchor.centerY + anchor.radiusY * 0.22;
    const isClearlyInFrontByDepth =
      entry.isoY - anchor.isoY > anchor.frontDepthPadding;
    const isClearlyInFront =
      isClearlyInFrontByScreenY || isClearlyInFrontByDepth;
    if (!isClearlyInFront) {
      const occludedIsoY = anchor.isoY - 0.02;
      clampIsoY =
        clampIsoY === undefined
          ? occludedIsoY
          : Math.min(clampIsoY, occludedIsoY);
    }
  }
  return { clampIsoY, isInsideOccluder };
}
