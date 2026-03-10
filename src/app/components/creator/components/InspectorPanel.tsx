import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  MousePointer2,
  Paintbrush,
  Save,
  Play,
  Plus,
  Settings2,
  Sparkles,
  Sword,
  Swords,
  Target,
  Trash2,
  Upload,
} from "lucide-react";
import type { CreatorDraftState, SelectionTarget, ToolMode, GridPoint } from "../types";
import { TOOL_HINTS, OBJECTIVE_TYPE_STATS, TOOL_OPTIONS, TOWER_DISPLAY_NAMES } from "../constants";
import { formatPointLabel, formatAssetName } from "../utils/gridUtils";
import { getPointFromSelection } from "../utils/selectionUtils";
import { LANDMARK_DECORATION_TYPES } from "../../../utils";
import type { TowerType } from "../../../types";

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
  onExportMap: () => void;
  onImportMap: () => void;
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
  onExportMap,
  onImportMap,
  onUpdateDecorationSize,
  onUpdateHazardRadius,
}) => {
  const selectedPoint = selection ? getPointFromSelection(selection, draft) : null;
  const selectedDecoration =
    selection?.kind === "decoration" ? draft.decorations[selection.index] : null;
  const selectedHazard =
    selection?.kind === "hazard" ? draft.hazards[selection.index] : null;
  const selectedObjective =
    selection?.kind === "special_tower" ? draft.specialTowers[selection.index] : null;
  const selectedTower =
    selection?.kind === "tower" ? draft.placedTowers[selection.index] : null;

  const activeToolHint = TOOL_HINTS[tool] ?? "";

  const selectionSummary = (() => {
    if (!selection) return null;
    if (selection.kind === "primary_path") return `Path A node ${selection.index + 1}`;
    if (selection.kind === "secondary_path") return `Path B node ${selection.index + 1}`;
    if (selection.kind === "hero_spawn") return "Hero Spawn";
    if (selection.kind === "special_tower") {
      return selectedObjective
        ? OBJECTIVE_TYPE_STATS[selectedObjective.type].title
        : "Objective";
    }
    if (selection.kind === "tower") {
      return selectedTower ? TOWER_DISPLAY_NAMES[selectedTower.type as TowerType] ?? formatAssetName(selectedTower.type) : "Tower";
    }
    if (selection.kind === "hazard") {
      return selectedHazard?.type ? formatAssetName(selectedHazard.type) : "Hazard";
    }
    const decoType = selectedDecoration?.type ?? selectedDecoration?.category;
    const isLandmark = Boolean(decoType && LANDMARK_DECORATION_TYPES.has(decoType));
    return decoType ? formatAssetName(decoType) : isLandmark ? "Landmark" : "Decoration";
  })();

  return (
    <aside className="rounded-2xl border border-amber-800/30 bg-gradient-to-b from-stone-900/50 to-stone-950/70 p-3 overflow-y-auto space-y-3">
      {/* Inspector */}
      <div className="rounded-xl border border-amber-800/25 bg-stone-900/50 p-2.5 text-xs">
        <div className="text-amber-200/90 font-medium mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <Settings2 size={13} />
          Inspector
        </div>

        {/* Current tool + cursor */}
        <div className="flex items-start gap-1.5 mb-2 text-[11px]">
          <div className="rounded-md border border-amber-800/30 bg-stone-950/60 px-2 py-1 text-amber-300/80 min-w-0 flex-1 break-words">
            {activeToolHint}
          </div>
          <div className="rounded-md border border-amber-800/30 bg-stone-950/60 px-2 py-1 text-amber-200 tabular-nums whitespace-nowrap shrink-0">
            {hoverPoint ? `${hoverPoint.x},${hoverPoint.y}` : "--,--"}
          </div>
        </div>

        {/* Selection details */}
        {selection && selectionSummary ? (
          <div className="space-y-2">
            <div className="rounded-lg border border-amber-500/25 bg-amber-900/10 px-2.5 py-2">
              <div className="text-amber-100 font-medium inline-flex items-center gap-1.5 text-[12px]">
                <Target size={12} className="text-amber-400" />
                {selectionSummary}
              </div>
              {selectedPoint && (
                <div className="text-amber-400/60 text-[10px] mt-0.5">
                  Position: {selectedPoint.x}, {selectedPoint.y}
                </div>
              )}
            </div>

            {selection.kind === "decoration" && selectedDecoration && (
              <label className="flex items-center gap-2 px-0.5">
                <span className="text-amber-300/70 text-[11px] w-8">Size</span>
                <input
                  type="range"
                  min={0.5}
                  max={8}
                  step={0.1}
                  value={selectedDecoration.size ?? 1}
                  onChange={(event) =>
                    onUpdateDecorationSize(selection.index, Number(event.target.value))
                  }
                  className="flex-1 accent-amber-500 h-1"
                />
                <span className="text-amber-200 text-[10px] w-7 text-right tabular-nums">
                  {(selectedDecoration.size ?? 1).toFixed(1)}
                </span>
              </label>
            )}

            {selection.kind === "hazard" && selectedHazard && (
              <label className="flex items-center gap-2 px-0.5">
                <span className="text-amber-300/70 text-[11px] w-10">Radius</span>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={selectedHazard.radius ?? 1.5}
                  onChange={(event) =>
                    onUpdateHazardRadius(selection.index, Number(event.target.value))
                  }
                  className="flex-1 accent-amber-500 h-1"
                />
                <span className="text-amber-200 text-[10px] w-7 text-right tabular-nums">
                  {(selectedHazard.radius ?? 1.5).toFixed(1)}
                </span>
              </label>
            )}

            {selection.kind === "special_tower" && selectedObjective && (
              <div className="text-[10px] text-amber-400/60 px-0.5">
                {OBJECTIVE_TYPE_STATS[selectedObjective.type].effect}
              </div>
            )}

            {selection.kind === "tower" && selectedTower && (
              <div className="text-[10px] text-amber-400/60 px-0.5 inline-flex items-center gap-1">
                <Sword size={9} /> Pre-placed {TOWER_DISPLAY_NAMES[selectedTower.type as TowerType] ?? selectedTower.type}
              </div>
            )}

            <button
              onClick={onEraseSelection}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-700/40 bg-red-900/15 px-2.5 py-1.5 text-[11px] text-red-300/90 hover:bg-red-800/25 transition-colors font-medium"
            >
              <Trash2 size={11} />
              Remove
            </button>
          </div>
        ) : (
          <div className="text-amber-500/40 inline-flex items-center gap-1.5 text-[11px]">
            <MousePointer2 size={11} />
            Nothing selected
          </div>
        )}
      </div>

      {/* Messages */}
      {(errors.length > 0 || notice) && (
        <div className="space-y-2">
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-700/40 bg-red-950/30 p-2.5 text-xs text-red-200/90">
              <div className="inline-flex items-center gap-1 mb-1 font-medium text-red-300">
                <AlertTriangle size={12} />
                Issues
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {notice && (
            <div className="rounded-lg border border-emerald-700/40 bg-emerald-950/30 p-2.5 text-xs text-emerald-200 inline-flex items-center gap-1.5">
              <Sparkles size={12} />
              {notice}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="rounded-xl border border-amber-800/25 bg-stone-900/50 p-2.5 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber-200/90 font-medium inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Swords size={13} />
            Actions
          </span>
          {validationStatus.length === 0 ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 size={10} />
              Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
              <AlertTriangle size={10} />
              {validationStatus.length}
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <button
            onClick={onSave}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-600/15 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/25 transition-colors font-medium"
          >
            <Save size={14} />
            Save Map
          </button>
          <button
            onClick={onPlaytest}
            disabled={!draft.id}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-600/15 px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/25 disabled:opacity-40 disabled:pointer-events-none transition-colors font-medium"
          >
            <Play size={14} />
            Playtest
          </button>
          <div className="flex gap-1.5">
            <button
              onClick={onNewMap}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-700/40 bg-amber-900/15 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-800/25 transition-colors"
            >
              <Plus size={12} />
              New
            </button>
            <button
              onClick={onDelete}
              disabled={!draft.id}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-700/40 bg-red-900/15 px-3 py-1.5 text-xs text-red-200 hover:bg-red-800/25 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={onExportMap}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-700/40 bg-cyan-900/15 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-800/25 transition-colors"
              title="Export this map as a .ptd.json file"
            >
              <Download size={12} />
              Export
            </button>
            <button
              onClick={onImportMap}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-700/40 bg-cyan-900/15 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-800/25 transition-colors"
              title="Import a map from a .ptd.json file"
            >
              <Upload size={12} />
              Import
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
