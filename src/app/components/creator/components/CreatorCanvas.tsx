import {
  AlertTriangle,
  Compass,
  Eraser,
  MapPin,
  Paintbrush,
  Redo2,
  Sword,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React from "react";

import { GRID_HEIGHT, GRID_WIDTH } from "../../../constants";
import { LANDMARK_DECORATION_TYPES } from "../../../utils";
import { TOOL_HINTS, TOOL_OPTIONS } from "../constants";
import type {
  CreatorDraftState,
  GridPoint,
  SelectionTarget,
  ToolMode,
} from "../types";
import { formatPointLabel, normalizePathPoint } from "../utils/gridUtils";
import {
  gridFloatToIso,
  getIsoTilePolygon,
  pathToIsoPoints,
  MAP_PLANE_POLYGON,
} from "../utils/isoMath";
import { findSelectionNearPoint, targetMatches } from "../utils/selectionUtils";
import { IsoMarker } from "./IsoMarker";

interface CreatorCanvasProps {
  draft: CreatorDraftState;
  tool: ToolMode;
  zoom: number;
  viewBoxX: number;
  viewBoxY: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  boardRef: React.RefObject<SVGSVGElement>;
  selection: SelectionTarget | null;
  hoverPoint: GridPoint | null;
  isBoardDragOver: boolean;
  undoCount: number;
  redoCount: number;
  decorationCount: number;
  hazardCount: number;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToolSelect: (tool: ToolMode) => void;
  onBoardPointerDown: (event: React.PointerEvent<SVGSVGElement>) => void;
  onBoardPointerMove: (event: React.PointerEvent<SVGSVGElement>) => void;
  onBoardPointerUp: (event: React.PointerEvent<SVGSVGElement>) => void;
  onBoardPointerLeave: () => void;
  onBoardWheel: (event: React.WheelEvent<SVGSVGElement>) => void;
  onDropOnBoard: (event: React.DragEvent<SVGSVGElement>) => void;
  onBoardDragOver: (event: React.DragEvent<SVGSVGElement>) => void;
  onBoardDragLeave: () => void;
  startDragTarget: (target: SelectionTarget, event: React.PointerEvent) => void;
}

export const CreatorCanvas: React.FC<CreatorCanvasProps> = ({
  draft,
  tool,
  zoom,
  viewBoxX,
  viewBoxY,
  viewBoxWidth,
  viewBoxHeight,
  boardRef,
  selection,
  hoverPoint,
  isBoardDragOver,
  undoCount,
  redoCount,
  decorationCount,
  hazardCount,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onToolSelect,
  onBoardPointerDown,
  onBoardPointerMove,
  onBoardPointerUp,
  onBoardPointerLeave,
  onBoardWheel,
  onDropOnBoard,
  onBoardDragOver,
  onBoardDragLeave,
  startDragTarget,
}) => {
  const hoverIsErase = tool === "erase";
  const hoverSelectionTarget = hoverPoint
    ? findSelectionNearPoint(
        tool === "path_primary" || tool === "path_secondary"
          ? normalizePathPoint(hoverPoint)
          : hoverPoint,
        draft,
        tool === "erase" ? 3.6 : 2.3
      )
    : null;
  const primaryPathEmphasized =
    targetMatches(selection, "primary_path") ||
    targetMatches(hoverSelectionTarget, "primary_path");
  const secondaryPathEmphasized =
    targetMatches(selection, "secondary_path") ||
    targetMatches(hoverSelectionTarget, "secondary_path");

  const activeToolHint = TOOL_HINTS[tool] ?? "";
  const ActiveToolIcon = (
    TOOL_OPTIONS.find((entry) => entry.key === tool) ?? TOOL_OPTIONS[0]
  ).icon;

  return (
    <section className="rounded-2xl border border-amber-800/30 bg-black/20 p-2 min-h-0 flex flex-col overflow-hidden">
      {/* Toolbar strip */}
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        {/* Undo / Redo / Erase */}
        <div className="flex items-center gap-0.5 rounded-lg border border-amber-800/25 bg-stone-950/50 p-0.5">
          <button
            onClick={onUndo}
            disabled={undoCount === 0}
            className="inline-flex h-6 w-7 items-center justify-center rounded-md disabled:opacity-30 hover:bg-stone-800/80 transition-colors text-amber-300/80"
            title={`Undo (${undoCount})`}
          >
            <Undo2 size={12} />
          </button>
          <button
            onClick={onRedo}
            disabled={redoCount === 0}
            className="inline-flex h-6 w-7 items-center justify-center rounded-md disabled:opacity-30 hover:bg-stone-800/80 transition-colors text-amber-300/80"
            title={`Redo (${redoCount})`}
          >
            <Redo2 size={12} />
          </button>
          <div className="w-px h-4 bg-amber-800/25" />
          <button
            onClick={() => onToolSelect("erase")}
            className={`inline-flex h-6 w-7 items-center justify-center rounded-md transition-colors ${
              tool === "erase"
                ? "bg-red-600/25 text-red-200"
                : "text-amber-300/80 hover:bg-stone-800/80"
            }`}
            title="Erase tool"
          >
            <Eraser size={12} />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-0.5 rounded-lg border border-amber-800/25 bg-stone-950/50 p-0.5">
          <button
            onClick={onZoomOut}
            className="inline-flex h-6 w-7 items-center justify-center rounded-md hover:bg-stone-800/80 transition-colors text-amber-300/80"
            title="Zoom out"
          >
            <ZoomOut size={12} />
          </button>
          <span className="text-[10px] text-amber-200 tabular-nums w-8 text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="inline-flex h-6 w-7 items-center justify-center rounded-md hover:bg-stone-800/80 transition-colors text-amber-300/80"
            title="Zoom in"
          >
            <ZoomIn size={12} />
          </button>
        </div>

        <div className="flex-1" />

        {/* Stats pills */}
        <div className="flex items-center gap-1 text-[10px]">
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-900/30 bg-stone-950/50 px-1.5 py-0.5 text-amber-300/70">
            <Paintbrush size={10} /> {decorationCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-900/30 bg-stone-950/50 px-1.5 py-0.5 text-amber-300/70">
            <AlertTriangle size={10} /> {hazardCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-900/30 bg-stone-950/50 px-1.5 py-0.5 text-amber-200 tabular-nums font-medium">
            <MapPin size={10} />
            {formatPointLabel(hoverPoint)}
          </span>
        </div>
      </div>

      {/* SVG board */}
      <div className="rounded-xl border border-amber-800/30 bg-stone-950/80 p-1.5 min-h-0 flex flex-col flex-1">
        <div className="relative w-full flex-1 min-h-[560px]">
          <svg
            ref={boardRef}
            viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            onPointerDown={onBoardPointerDown}
            onPointerMove={onBoardPointerMove}
            onPointerUp={onBoardPointerUp}
            onPointerLeave={onBoardPointerLeave}
            onWheel={onBoardWheel}
            onDragEnter={() => {
              /* handled by dragOver */
            }}
            onDragOver={onBoardDragOver}
            onDragLeave={onBoardDragLeave}
            onDrop={onDropOnBoard}
            className="w-full h-full rounded-lg border border-amber-900/40 bg-[#140f09] cursor-crosshair"
          >
            <defs>
              <linearGradient id="isoBoardGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(84,58,24,0.65)" />
                <stop offset="100%" stopColor="rgba(18,10,4,0.95)" />
              </linearGradient>
            </defs>

            {/* Map plane */}
            <polygon
              points={MAP_PLANE_POLYGON}
              fill="url(#isoBoardGradient)"
              stroke="rgba(255,180,90,0.35)"
              strokeWidth={2}
            />

            {/* Grid lines */}
            {Array.from({ length: GRID_WIDTH + 1 }).map((_, x) => {
              const start = gridFloatToIso(x, 0);
              const end = gridFloatToIso(x, GRID_HEIGHT);
              return (
                <line
                  key={`iso-v-${x}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="rgba(255,220,140,0.12)"
                  strokeWidth={1}
                />
              );
            })}
            {Array.from({ length: GRID_HEIGHT + 1 }).map((_, y) => {
              const start = gridFloatToIso(0, y);
              const end = gridFloatToIso(GRID_WIDTH, y);
              return (
                <line
                  key={`iso-h-${y}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="rgba(255,220,140,0.12)"
                  strokeWidth={1}
                />
              );
            })}

            {/* Drop zone highlight */}
            {isBoardDragOver && (
              <polygon
                points={MAP_PLANE_POLYGON}
                fill="rgba(251,191,36,0.06)"
                stroke="rgba(251,191,36,0.9)"
                strokeWidth={2.4}
                strokeDasharray="7 4"
              />
            )}

            {/* Hover tile */}
            {hoverPoint && (
              <>
                <polygon
                  points={getIsoTilePolygon(hoverPoint, 0.08)}
                  fill={
                    hoverIsErase
                      ? "rgba(160, 32, 32, 0.26)"
                      : "rgba(255, 245, 200, 0.18)"
                  }
                  stroke={
                    hoverIsErase
                      ? "rgba(248, 113, 113, 0.98)"
                      : "rgba(255, 255, 255, 0.95)"
                  }
                  strokeWidth={1.6}
                />
                <polygon
                  points={getIsoTilePolygon(hoverPoint, -0.05)}
                  fill="none"
                  stroke={
                    hoverIsErase
                      ? "rgba(252, 165, 165, 0.92)"
                      : "rgba(251, 191, 36, 0.94)"
                  }
                  strokeDasharray={hoverIsErase ? "3 2" : "4 3"}
                  strokeWidth={1.2}
                />
              </>
            )}

            {/* Primary path */}
            {draft.primaryPath.length >= 2 && (
              <>
                <polyline
                  points={pathToIsoPoints(draft.primaryPath)}
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.25)"
                  strokeWidth={primaryPathEmphasized ? 10 : 7.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={pathToIsoPoints(draft.primaryPath)}
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.96)"
                  strokeWidth={primaryPathEmphasized ? 6.4 : 5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Secondary path */}
            {draft.secondaryPath.length >= 2 && (
              <>
                <polyline
                  points={pathToIsoPoints(draft.secondaryPath)}
                  fill="none"
                  stroke="rgba(34, 211, 238, 0.24)"
                  strokeWidth={secondaryPathEmphasized ? 10 : 7.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={pathToIsoPoints(draft.secondaryPath)}
                  fill="none"
                  stroke="rgba(34, 211, 238, 0.96)"
                  strokeWidth={secondaryPathEmphasized ? 6.4 : 5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Primary path markers */}
            {draft.primaryPath.map((point, index) => (
              <IsoMarker
                key={`p-${index}-${point.x}-${point.y}`}
                point={point}
                label={`A${index + 1}`}
                fill="rgba(251, 191, 36, 0.98)"
                stroke="rgba(40, 24, 8, 0.95)"
                selected={targetMatches(selection, "primary_path", index)}
                highlighted={targetMatches(
                  hoverSelectionTarget,
                  "primary_path",
                  index
                )}
                danger={
                  hoverIsErase &&
                  targetMatches(hoverSelectionTarget, "primary_path", index)
                }
                onPointerDown={(event) =>
                  startDragTarget({ index, kind: "primary_path" }, event)
                }
              />
            ))}

            {/* Secondary path markers */}
            {draft.secondaryPath.map((point, index) => (
              <IsoMarker
                key={`s-${index}-${point.x}-${point.y}`}
                point={point}
                label={`B${index + 1}`}
                fill="rgba(34, 211, 238, 0.98)"
                stroke="rgba(7, 41, 52, 0.95)"
                selected={targetMatches(selection, "secondary_path", index)}
                highlighted={targetMatches(
                  hoverSelectionTarget,
                  "secondary_path",
                  index
                )}
                danger={
                  hoverIsErase &&
                  targetMatches(hoverSelectionTarget, "secondary_path", index)
                }
                onPointerDown={(event) =>
                  startDragTarget({ index, kind: "secondary_path" }, event)
                }
              />
            ))}

            {/* Decorations */}
            {draft.decorations.map((deco, index) => {
              const decorationType = deco.type ?? deco.category;
              const isLandmark = Boolean(
                decorationType && LANDMARK_DECORATION_TYPES.has(decorationType)
              );
              return (
                <IsoMarker
                  key={`d-${index}-${deco.pos.x}-${deco.pos.y}`}
                  point={deco.pos}
                  label={isLandmark ? "L" : "D"}
                  fill={
                    isLandmark
                      ? "rgba(125, 211, 252, 0.96)"
                      : "rgba(250, 244, 224, 0.96)"
                  }
                  stroke={
                    isLandmark
                      ? "rgba(8, 47, 73, 0.95)"
                      : "rgba(45, 34, 20, 0.95)"
                  }
                  selected={targetMatches(selection, "decoration", index)}
                  highlighted={targetMatches(
                    hoverSelectionTarget,
                    "decoration",
                    index
                  )}
                  danger={
                    hoverIsErase &&
                    targetMatches(hoverSelectionTarget, "decoration", index)
                  }
                  onPointerDown={(event) =>
                    startDragTarget({ index, kind: "decoration" }, event)
                  }
                />
              );
            })}

            {/* Hazards */}
            {draft.hazards.map((hazard, index) => {
              const point =
                (hazard.pos as GridPoint | undefined) ?? hazard.gridPos;
              if (!point) {
                return null;
              }
              return (
                <IsoMarker
                  key={`h-${index}-${point.x}-${point.y}`}
                  point={point}
                  label="H"
                  fill="rgba(248, 113, 113, 0.96)"
                  stroke="rgba(66, 13, 13, 0.95)"
                  selected={targetMatches(selection, "hazard", index)}
                  highlighted={targetMatches(
                    hoverSelectionTarget,
                    "hazard",
                    index
                  )}
                  danger={
                    hoverIsErase &&
                    targetMatches(hoverSelectionTarget, "hazard", index)
                  }
                  onPointerDown={(event) =>
                    startDragTarget({ index, kind: "hazard" }, event)
                  }
                />
              );
            })}

            {/* Hero spawn */}
            {draft.heroSpawn && (
              <IsoMarker
                point={draft.heroSpawn}
                label="Hero"
                fill="rgba(52, 211, 153, 0.98)"
                stroke="rgba(7, 40, 30, 0.95)"
                selected={targetMatches(selection, "hero_spawn")}
                highlighted={targetMatches(hoverSelectionTarget, "hero_spawn")}
                danger={
                  hoverIsErase &&
                  targetMatches(hoverSelectionTarget, "hero_spawn")
                }
                onPointerDown={(event) =>
                  startDragTarget({ kind: "hero_spawn" }, event)
                }
              />
            )}

            {/* Special towers (objectives) */}
            {draft.specialTowers.map((st, index) => (
              <IsoMarker
                key={`obj-${index}-${st.pos.x}-${st.pos.y}`}
                point={st.pos}
                label={`OBJ${draft.specialTowers.length > 1 ? index + 1 : ""}`}
                fill="rgba(217, 70, 239, 0.98)"
                stroke="rgba(60, 16, 74, 0.95)"
                selected={targetMatches(selection, "special_tower", index)}
                highlighted={targetMatches(
                  hoverSelectionTarget,
                  "special_tower",
                  index
                )}
                danger={
                  hoverIsErase &&
                  targetMatches(hoverSelectionTarget, "special_tower", index)
                }
                onPointerDown={(event) =>
                  startDragTarget({ index, kind: "special_tower" }, event)
                }
              />
            ))}

            {/* Placed towers */}
            {draft.placedTowers.map((t, index) => (
              <IsoMarker
                key={`tw-${index}-${t.pos.x}-${t.pos.y}`}
                point={t.pos}
                label="T"
                fill="rgba(59, 130, 246, 0.98)"
                stroke="rgba(15, 23, 42, 0.95)"
                selected={targetMatches(selection, "tower", index)}
                highlighted={targetMatches(
                  hoverSelectionTarget,
                  "tower",
                  index
                )}
                danger={
                  hoverIsErase &&
                  targetMatches(hoverSelectionTarget, "tower", index)
                }
                onPointerDown={(event) =>
                  startDragTarget({ index, kind: "tower" }, event)
                }
              />
            ))}
          </svg>

          {/* Tool hint overlay */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none inline-flex items-center gap-1.5 rounded-lg border border-amber-700/30 bg-stone-950/85 backdrop-blur-sm px-2 py-1 text-[10px] text-amber-200/90">
            <ActiveToolIcon size={11} />
            {activeToolHint}
          </div>
          <div className="absolute bottom-2 right-2 z-10 pointer-events-none rounded-lg border border-amber-800/20 bg-stone-950/70 px-2 py-0.5 text-[9px] text-amber-400/40">
            scroll to zoom &middot; alt+drag to pan
          </div>
        </div>
      </div>
    </section>
  );
};
