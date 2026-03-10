import React from "react";
import {
  CheckCircle2,
  CircleAlert,
  Compass,
  Target,
} from "lucide-react";
import type { CreatorDraftState, ToolMode, SelectionTarget, GridPoint } from "../types";
import { TOOL_OPTIONS } from "../constants";
import { formatPointLabel } from "../utils/gridUtils";
import { getPointFromSelection } from "../utils/selectionUtils";
import { LANDMARK_DECORATION_TYPES } from "../../../utils";
import { formatAssetName } from "../utils/gridUtils";
import { OBJECTIVE_TYPE_STATS } from "../constants";

interface ToolbeltPanelProps {
  draft: CreatorDraftState;
  tool: ToolMode;
  selection: SelectionTarget | null;
  onToolSelect: (tool: ToolMode) => void;
}

export const ToolbeltPanel: React.FC<ToolbeltPanelProps> = ({
  draft,
  tool,
  selection,
  onToolSelect,
}) => {
  const getToolAnchorPoint = (toolKey: ToolMode): GridPoint | null => {
    if (toolKey === "path_primary") return draft.primaryPath[0] ?? null;
    if (toolKey === "path_secondary") return draft.secondaryPath[0] ?? null;
    if (toolKey === "hero_spawn") return draft.heroSpawn;
    if (toolKey === "special_tower") return draft.specialTowerPos;
    return null;
  };

  const isToolComplete = (toolKey: ToolMode): boolean => {
    if (toolKey === "path_primary") return draft.primaryPath.length >= 4;
    if (toolKey === "path_secondary") {
      return draft.secondaryPath.length === 0 || draft.secondaryPath.length >= 4;
    }
    if (toolKey === "hero_spawn") return Boolean(draft.heroSpawn);
    if (toolKey === "special_tower") {
      return !draft.specialTowerEnabled || Boolean(draft.specialTowerPos);
    }
    return true;
  };

  const selectionSummary = (() => {
    if (!selection) return "none";
    const selectedPoint = getPointFromSelection(selection, draft);
    if (selection.kind === "primary_path") return `Path A #${selection.index + 1}`;
    if (selection.kind === "secondary_path") return `Path B #${selection.index + 1}`;
    if (selection.kind === "hero_spawn") return "Hero Spawn";
    if (selection.kind === "special_tower") return OBJECTIVE_TYPE_STATS[draft.specialTowerType].title;
    if (selection.kind === "hazard") {
      const hazard = draft.hazards[selection.index];
      return hazard?.type ? formatAssetName(hazard.type) : "Hazard";
    }
    const deco = draft.decorations[selection.index];
    const decoType = deco?.type ?? deco?.category;
    return decoType ? formatAssetName(decoType) : "Decoration";
  })();

  return (
    <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2.5">
      <div className="text-xs uppercase tracking-wider text-amber-200 mb-2 inline-flex items-center gap-1.5">
        <Compass size={12} />
        Toolbelt
      </div>
      <div className="space-y-1.5">
        {TOOL_OPTIONS.map((entry) => {
          const Icon = entry.icon;
          const isActive = tool === entry.key;
          const toolComplete = isToolComplete(entry.key);
          const toolAnchorPoint = getToolAnchorPoint(entry.key);
          const hasCoordinates = Boolean(toolAnchorPoint);
          const isPathTool =
            entry.key === "path_primary" || entry.key === "path_secondary";
          const pathNodeCount =
            entry.key === "path_primary"
              ? draft.primaryPath.length
              : entry.key === "path_secondary"
                ? draft.secondaryPath.length
                : 0;
          const pathReady = pathNodeCount >= 4;
          const showPlaced =
            !isPathTool && entry.key !== "select" && toolComplete && hasCoordinates;
          const showRequired = !isPathTool && entry.key !== "select" && !showPlaced;

          return (
            <button
              key={entry.key}
              onClick={() => onToolSelect(entry.key)}
              className={`w-full rounded-lg border px-2.5 py-2 text-xs transition-colors ${isActive
                ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
                : "border-amber-900/60 bg-stone-900/70 text-amber-300/80 hover:bg-stone-800/80"
                }`}
            >
              <span className="inline-flex w-full items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <Icon size={14} />
                  {entry.label}
                </span>
                {entry.key === "select" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/80 truncate max-w-[140px]">
                    <Target size={11} />
                    {selectionSummary}
                  </span>
                ) : isPathTool ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${pathReady
                      ? "border-emerald-500/70 bg-emerald-900/25 text-emerald-200"
                      : "border-orange-500/70 bg-orange-900/30 text-orange-200"
                      }`}
                  >
                    {pathReady ? <CheckCircle2 size={11} /> : <CircleAlert size={11} />}
                    {pathReady ? `${pathNodeCount} nodes` : `${pathNodeCount}/4 nodes`}
                  </span>
                ) : showRequired ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/70 bg-orange-900/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-orange-200">
                    <CircleAlert size={11} />
                    required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-900/25 px-2 py-0.5 text-[10px] text-emerald-200">
                    <CheckCircle2 size={11} />
                    {formatPointLabel(toolAnchorPoint)}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
