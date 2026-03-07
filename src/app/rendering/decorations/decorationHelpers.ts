import type { DecorationType, Decoration, DecorationHeightTag } from "../../types";
import { ISO_Y_FACTOR } from "../../constants";
import { getDecorationVolumeSpec } from "../../utils";

export type DecorationRenderLayer = "background" | "default";

const BACKGROUND_DECORATION_TYPES = new Set<DecorationType>([
  "deep_water",
  "lava_pool",
  "carnegie_lake",
]);

export interface RuntimeDecoration extends Decoration {
  source?: "generated" | "manual";
  manualOrder?: number;
  renderLayer?: DecorationRenderLayer;
}

export function getDecorationRenderLayer(
  decoration: Pick<RuntimeDecoration, "type" | "renderLayer">
): DecorationRenderLayer {
  return (
    decoration.renderLayer ??
    (BACKGROUND_DECORATION_TYPES.has(decoration.type)
      ? "background"
      : "default")
  );
}

const DECORATION_ISO_Y_OFFSETS: Partial<Record<DecorationType, number>> = {
  nassau_hall: 12,
  pyramid: 6,
  carnegie_lake: 0,
};

export function getDecorationIsoY(
  decoration: Pick<RuntimeDecoration, "type" | "x" | "y" | "scale">
): number {
  return (
    (decoration.x + decoration.y) * ISO_Y_FACTOR +
    (DECORATION_ISO_Y_OFFSETS[decoration.type] ?? 0) * decoration.scale
  );
}

export function getRuntimeDecorationHeightTag(
  decoration: Pick<RuntimeDecoration, "type" | "heightTag">
): DecorationHeightTag {
  return getDecorationVolumeSpec(decoration.type, decoration.heightTag)
    .heightTag;
}

export function getLayerPriority(decoration: RuntimeDecoration): number {
  return getDecorationRenderLayer(decoration) === "background" ? 0 : 1;
}

export function getSourcePriority(decoration: RuntimeDecoration): number {
  return decoration.source === "manual" ? 1 : 0;
}
