import type { DecorationType, Decoration, DecorationHeightTag } from "../../types";
import { ISO_Y_FACTOR } from "../../constants";
import { getDecorationVolumeSpec } from "../../utils";

export type DecorationRenderLayer = "background" | "default";

const BACKGROUND_DECORATION_TYPES = new Set<DecorationType>([
  "deep_water",
  "lava_pool",
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
  princeton_chapel: 0,
  firestone_library: 0,
  blair_arch: 0,
  whig_hall: 0,
  east_pyne: 0,
  prospect_house: 0,
  clio_hall: 0,
  mccosh_hall: 0,
  robertson_hall: 0,
  holder_hall: 0,
  cleveland_tower: 0,
  alexander_hall: 0,
  fine_hall: 0,
  foulke_hall: 0,
  tiger_stadium: 0,
  pyramid: 6,
  carnegie_lake: 20,
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
