import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  MousePointer2,
  Paintbrush,
  Save,
  Play,
  Plus,
  Settings2,
  Sparkles,
  Swords,
  Target,
  Trash2,
} from "lucide-react";
import type { CreatorDraftState, SelectionTarget, ToolMode, GridPoint } from "../types";
import { TOOL_HINTS, OBJECTIVE_TYPE_STATS, TOOL_OPTIONS } from "../constants";
import { formatPointLabel, formatAssetName } from "../utils/gridUtils";
import { getPointFromSelection } from "../utils/selectionUtils";
import { LANDMARK_DECORATION_TYPES } from "../../../utils";

interface InspectorPanelProps {
  draft: CreatorDraftState;
  tool: ToolMode;
  hoverPoint: GridPoint | null;
  selection: SelectionTarget | null;
  validationStatus: string[];
  errors: string[];
  notice: string | null;
  onSave: () => void;
  onPlaytest: () => void;
  onDelete: () => void;
  onEraseSelection: () => void;
  onNewMap: () => void;
  onUpdateDecorationSize: (index: number, size: number) => void;
  onUpdateHazardRadius: (index: number, radius: number) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  draft,
  tool,
  hoverPoint,
  selection,
  validationStatus,
  errors,
  notice,
  onSave,
  onPlaytest,
  onDelete,
  onEraseSelection,
  onNewMap,
  onUpdateDecorationSize,
  onUpdateHazardRadius,
}) => {
  const selectedPoint = selection ? getPointFromSelection(selection, draft) : null;
  const selectedDecoration =
    selection?.kind === "decoration" ? draft.decorations[selection.index] : null;
  const selectedHazard =
    selection?.kind === "hazard" ? draft.hazards[selection.index] : null;

  const activeToolEntry = TOOL_OPTIONS.find((entry) => entry.key === tool) ?? TOOL_OPTIONS[0];
  const ActiveToolIcon = activeToolEntry.icon;

  const selectionSummary = (() => {
    if (!selection) return null;
    if (selection.kind === "primary_path") return `Path A node ${selection.index + 1}`;
    if (selection.kind === "secondary_path") return `Path B node ${selection.index + 1}`;
    if (selection.kind === "hero_spawn") {
      return selectedPoint ? `Hero Spawn ${formatPointLabel(selectedPoint)}` : "Hero Spawn";
    }
    if (selection.kind === "special_tower") {
      const objectiveName = OBJECTIVE_TYPE_STATS[draft.specialTowerType].title;
      return selectedPoint
        ? `${objectiveName} ${formatPointLabel(selectedPoint)}`
        : objectiveName;
    }
    if (selection.kind === "hazard") {
      const point =
        (selectedHazard?.pos as GridPoint | undefined) ??
        selectedHazard?.gridPos ??
        selectedPoint;
      const hazardName = selectedHazard?.type
        ? formatAssetName(selectedHazard.type)
        : "Hazard";
      return point ? `${hazardName} ${formatPointLabel(point)}` : hazardName;
    }
    const decoType = selectedDecoration?.type ?? selectedDecoration?.category;
    const isLandmark = Boolean(decoType && LANDMARK_DECORATION_TYPES.has(decoType));
    const decorationName = decoType
      ? formatAssetName(decoType)
      : isLandmark
        ? "Landmark"
        : "Decoration";
    return selectedPoint
      ? `${decorationName} ${formatPointLabel(selectedPoint)}`
      : decorationName;
  })();

  return (
    <aside className="rounded-2xl border border-amber-900/60 bg-black/25 p-3 overflow-y-auto space-y-3">
      {/* State + Inspector */}
      <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2.5 text-xs">
        <div className="text-amber-200 font-medium mb-2 inline-flex items-center gap-1.5">
          <Settings2 size={12} />
          Inspector
        </div>
        <div className="grid grid-cols-2 gap-1 text-[11px] mb-2">
          <div className="rounded border border-amber-900/70 bg-black/25 px-2 py-1 inline-flex items-center gap-1.5">
            <ActiveToolIcon size={11} />
            {tool}
          </div>
          <div className="rounded border border-amber-900/70 bg-black/25 px-2 py-1">
            tile: {hoverPoint ? `${hoverPoint.x},${hoverPoint.y}` : "--,--"}
          </div>
          <div className="rounded border border-amber-900/70 bg-black/25 px-2 py-1 col-span-2 text-amber-300/80">
            {TOOL_HINTS[tool]}
          </div>
        </div>

        {selection && selectionSummary ? (
          <div className="space-y-2">
            <div className="rounded-md border border-amber-600/40 bg-amber-900/15 px-2 py-1.5">
              <div className="text-amber-200 mb-1 inline-flex items-center gap-1.5 font-medium">
                <Target size={11} />
                {selectionSummary}
              </div>
              {selectedPoint && (
                <div className="text-amber-400/75 text-[10px]">
                  x:{selectedPoint.x}, y:{selectedPoint.y}
                </div>
              )}
            </div>

            {selection.kind === "decoration" && selectedDecoration && (
              <div className="space-y-1.5">
                <div className="text-amber-300/80 inline-flex items-center gap-1.5">
                  <Paintbrush size={11} />
                  {selectedDecoration.type ?? selectedDecoration.category}
                </div>
                <label className="flex items-center gap-2">
                  <span className="text-amber-300/80 text-[11px]">size</span>
                  <input
                    type="range"
                    min={0.5}
                    max={8}
                    step={0.1}
                    value={selectedDecoration.size ?? 1}
                    onChange={(event) =>
                      onUpdateDecorationSize(selection.index, Number(event.target.value))
                    }
                    className="flex-1 accent-amber-500"
                  />
                  <span className="text-amber-200 text-[10px] w-8 text-right tabular-nums">
                    {(selectedDecoration.size ?? 1).toFixed(1)}
                  </span>
                </label>
              </div>
            )}

            {selection.kind === "hazard" && selectedHazard && (
              <div className="space-y-1.5">
                <div className="text-amber-300/80 inline-flex items-center gap-1.5">
                  <AlertTriangle size={11} />
                  {selectedHazard.type}
                </div>
                <label className="flex items-center gap-2">
                  <span className="text-amber-300/80 text-[11px]">radius</span>
                  <input
                    type="range"
                    min={0.5}
                    max={10}
                    step={0.1}
                    value={selectedHazard.radius ?? 1.5}
                    onChange={(event) =>
                      onUpdateHazardRadius(selection.index, Number(event.target.value))
                    }
                    className="flex-1 accent-amber-500"
                  />
                  <span className="text-amber-200 text-[10px] w-8 text-right tabular-nums">
                    {(selectedHazard.radius ?? 1.5).toFixed(1)}
                  </span>
                </label>
              </div>
            )}

            <button
              onClick={onEraseSelection}
              className="inline-flex items-center gap-1 rounded-md border border-red-700/60 bg-red-900/25 px-2 py-1 text-[11px] hover:bg-red-800/30 transition-colors"
            >
              <Trash2 size={12} />
              Remove
            </button>
          </div>
        ) : (
          <div className="text-amber-400/70 inline-flex items-center gap-1.5">
            <MousePointer2 size={11} />
            nothing selected
          </div>
        )}
      </div>

      {/* Messages */}
      {(errors.length > 0 || notice) && (
        <div className="space-y-2">
          {errors.length > 0 && (
            <div className="rounded-md border border-red-700/60 bg-red-900/20 p-2 text-xs text-red-200">
              <div className="inline-flex items-center gap-1 mb-1 font-medium">
                <AlertTriangle size={13} />
                Validation
              </div>
              <ul className="list-disc pl-4 space-y-0.5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {notice && (
            <div className="rounded-md border border-emerald-700/60 bg-emerald-900/20 p-2 text-xs text-emerald-200 inline-flex items-center gap-1.5">
              <Sparkles size={12} />
              {notice}
            </div>
          )}
        </div>
      )}

      {/* Build Actions */}
      <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2.5 text-xs">
        <div className="text-amber-200 font-medium mb-1 inline-flex items-center gap-1.5">
          <Swords size={12} />
          Actions
        </div>
        <div className="mb-2 inline-flex items-center gap-1.5">
          {validationStatus.length === 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-300/90">
              <CheckCircle2 size={12} />
              ready to save
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-orange-300/90">
              <AlertTriangle size={12} />
              {validationStatus.length} issue(s)
            </span>
          )}
        </div>
        <div className="space-y-2">
          <button
            onClick={onSave}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600/70 bg-emerald-700/25 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-600/30 transition-colors"
          >
            <Save size={14} />
            Save Map
          </button>
          <button
            onClick={onPlaytest}
            disabled={!draft.id}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600/70 bg-blue-700/25 px-3 py-2 text-sm text-blue-100 hover:bg-blue-600/30 disabled:opacity-50 transition-colors"
          >
            <Play size={14} />
            Playtest
          </button>
          <div className="flex gap-2">
            <button
              onClick={onNewMap}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-700/60 bg-amber-900/25 px-3 py-2 text-xs hover:bg-amber-800/35 transition-colors"
            >
              <Plus size={13} />
              New
            </button>
            <button
              onClick={onDelete}
              disabled={!draft.id}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-700/70 bg-red-900/25 px-3 py-2 text-xs text-red-100 hover:bg-red-800/30 disabled:opacity-50 transition-colors"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
