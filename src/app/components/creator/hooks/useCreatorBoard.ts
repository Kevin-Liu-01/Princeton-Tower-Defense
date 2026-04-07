import { useCallback, useRef, useState } from "react";

import type {
  DecorationCategory,
  HazardType,
  SpecialTowerType,
  TowerType,
} from "../../../types";
import type {
  CreatorDraftState,
  GridPoint,
  PaletteDragPayload,
  SelectionTarget,
  ToolMode,
} from "../types";
import {
  isInsideMap,
  normalizeMapPoint,
  normalizePathPoint,
  samePoint,
  PATH_MARGIN_TILES,
  clamp,
} from "../utils/gridUtils";
import { isoToGridFloat } from "../utils/isoMath";
import {
  findSelectionNearPoint,
  removeSelection,
  applySelectionPointUpdate,
} from "../utils/selectionUtils";
import type { CreatorCameraState } from "./useCreatorCamera";
import type { CreatorDraftActions } from "./useCreatorDraft";

export interface CreatorBoardState {
  boardRef: React.RefObject<SVGSVGElement>;
  selection: SelectionTarget | null;
  setSelection: React.Dispatch<React.SetStateAction<SelectionTarget | null>>;
  dragTarget: SelectionTarget | null;
  hoverPoint: GridPoint | null;
  isBoardDragOver: boolean;
  handleBoardPointerDown: (event: React.PointerEvent<SVGSVGElement>) => void;
  handleBoardPointerMove: (event: React.PointerEvent<SVGSVGElement>) => void;
  handleBoardPointerUp: (event: React.PointerEvent<SVGSVGElement>) => void;
  handleBoardPointerLeave: () => void;
  handleBoardWheel: (event: React.WheelEvent<SVGSVGElement>) => void;
  handleDropOnBoard: (event: React.DragEvent<SVGSVGElement>) => void;
  handleBoardDragOver: (event: React.DragEvent<SVGSVGElement>) => void;
  handleBoardDragLeave: () => void;
  startDragTarget: (target: SelectionTarget, event: React.PointerEvent) => void;
  clearSelection: () => void;
}

export function useCreatorBoard(
  tool: ToolMode,
  selectedDecorationType: DecorationCategory,
  selectedLandmarkType: DecorationCategory,
  selectedHazardType: HazardType,
  selectedObjectiveType: SpecialTowerType,
  selectedTowerType: TowerType,
  draftActions: CreatorDraftActions,
  camera: CreatorCameraState
): CreatorBoardState {
  const boardRef = useRef<SVGSVGElement>(null);
  const [selection, setSelection] = useState<SelectionTarget | null>(null);
  const [dragTarget, setDragTarget] = useState<SelectionTarget | null>(null);
  const [hoverPoint, setHoverPoint] = useState<GridPoint | null>(null);
  const [isBoardDragOver, setIsBoardDragOver] = useState(false);

  const { draftRef, applyDraftUpdate, clearMessages } = draftActions;
  const {
    viewBoxX,
    viewBoxY,
    viewBoxWidth,
    viewBoxHeight,
    cameraDrag,
    setCameraDrag,
    setZoom,
    setPan,
    getBoardRenderMetrics,
  } = camera;

  const updateHoverPoint = useCallback((point: GridPoint | null): void => {
    setHoverPoint((prev) => {
      if (!prev && !point) {
        return prev;
      }
      if (samePoint(prev, point)) {
        return prev;
      }
      return point;
    });
  }, []);

  const getGridPointFromClient = useCallback(
    (clientX: number, clientY: number): GridPoint | null => {
      const metrics = getBoardRenderMetrics(boardRef.current);
      if (!metrics) {
        return null;
      }
      const { rect, renderWidth, renderHeight, offsetX, offsetY } = metrics;

      const localX = clientX - rect.left - offsetX;
      const localY = clientY - rect.top - offsetY;
      if (
        localX < 0 ||
        localX > renderWidth ||
        localY < 0 ||
        localY > renderHeight
      ) {
        return null;
      }

      const svgX = viewBoxX + (localX / renderWidth) * viewBoxWidth;
      const svgY = viewBoxY + (localY / renderHeight) * viewBoxHeight;
      const mapped = isoToGridFloat(svgX, svgY);
      if (
        mapped.x < -PATH_MARGIN_TILES - 1 ||
        mapped.x > 30 + PATH_MARGIN_TILES ||
        mapped.y < -PATH_MARGIN_TILES - 1 ||
        mapped.y > 30 + PATH_MARGIN_TILES
      ) {
        return null;
      }
      return {
        x: Math.floor(mapped.x),
        y: Math.floor(mapped.y),
      };
    },
    [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight, getBoardRenderMetrics]
  );

  const placeAtPoint = useCallback(
    (point: GridPoint): void => {
      const mapPoint = normalizeMapPoint(point);
      const pathPoint = normalizePathPoint(point);
      clearMessages();
      applyDraftUpdate((prev) => {
        if (tool === "path_primary") {
          return { ...prev, primaryPath: [...prev.primaryPath, pathPoint] };
        }
        if (tool === "path_secondary") {
          return { ...prev, secondaryPath: [...prev.secondaryPath, pathPoint] };
        }
        if (tool === "hero_spawn") {
          if (!isInsideMap(point)) {
            return prev;
          }
          return { ...prev, heroSpawn: mapPoint };
        }
        if (tool === "special_tower") {
          if (!isInsideMap(point)) {
            return prev;
          }
          return {
            ...prev,
            specialTowers: [
              ...prev.specialTowers,
              { pos: mapPoint, type: selectedObjectiveType },
            ],
          };
        }
        if (tool === "tower") {
          if (!isInsideMap(point)) {
            return prev;
          }
          return {
            ...prev,
            placedTowers: [
              ...prev.placedTowers,
              { pos: mapPoint, type: selectedTowerType },
            ],
          };
        }
        if (tool === "decoration") {
          if (!isInsideMap(point)) {
            return prev;
          }
          return {
            ...prev,
            decorations: [
              ...prev.decorations,
              { pos: mapPoint, type: selectedDecorationType, variant: 0 },
            ],
          };
        }
        if (tool === "landmark") {
          if (!isInsideMap(point)) {
            return prev;
          }
          return {
            ...prev,
            decorations: [
              ...prev.decorations,
              {
                pos: mapPoint,
                size: 1.6,
                type: selectedLandmarkType,
                variant: 0,
              },
            ],
          };
        }
        if (tool === "hazard") {
          if (!isInsideMap(point)) {
            return prev;
          }
          return {
            ...prev,
            hazards: [
              ...prev.hazards,
              { pos: mapPoint, radius: 1.5, type: selectedHazardType },
            ],
          };
        }
        if (tool === "erase") {
          const target = findSelectionNearPoint(pathPoint, prev, 3.6);
          if (!target) {
            return prev;
          }
          return removeSelection(prev, target);
        }
        return prev;
      });

      if (tool === "select") {
        const currentDraft = draftRef.current;
        if (!currentDraft) {
          return;
        }
        const pathPoint2 = normalizePathPoint(point);
        const target = findSelectionNearPoint(pathPoint2, currentDraft, 2.3);
        setSelection(target);
        return;
      }
      if (tool === "special_tower") {
        const currentDraft = draftRef.current;
        if (currentDraft) {
          setSelection({
            index: currentDraft.specialTowers.length - 1,
            kind: "special_tower",
          });
        }
        return;
      }
      if (tool === "tower") {
        const currentDraft = draftRef.current;
        if (currentDraft) {
          setSelection({
            index: currentDraft.placedTowers.length - 1,
            kind: "tower",
          });
        }
        return;
      }
      if (tool === "hero_spawn") {
        setSelection({ kind: "hero_spawn" });
      }
    },
    [
      tool,
      selectedDecorationType,
      selectedLandmarkType,
      selectedHazardType,
      selectedObjectiveType,
      selectedTowerType,
      draftRef,
      applyDraftUpdate,
      clearMessages,
    ]
  );

  const handleBoardPointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>): void => {
      if (event.button === 1 || event.altKey) {
        event.preventDefault();
        setCameraDrag({
          pointerId: event.pointerId,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startPanX: camera.pan.x,
          startPanY: camera.pan.y,
        });
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }

      if (event.button !== 0) {
        return;
      }

      const point = getGridPointFromClient(event.clientX, event.clientY);
      if (!point) {
        return;
      }
      updateHoverPoint(point);

      if (tool === "select") {
        const currentDraft = draftRef.current;
        if (!currentDraft) {
          return;
        }
        const target = findSelectionNearPoint(point, currentDraft, 2.3);
        setSelection(target);
        return;
      }

      placeAtPoint(point);
    },
    [
      tool,
      camera.pan,
      setCameraDrag,
      getGridPointFromClient,
      updateHoverPoint,
      draftRef,
      placeAtPoint,
    ]
  );

  const handleBoardPointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>): void => {
      if (cameraDrag && event.pointerId === cameraDrag.pointerId) {
        const metrics = getBoardRenderMetrics(boardRef.current);
        if (!metrics) {
          return;
        }
        const deltaX = event.clientX - cameraDrag.startClientX;
        const deltaY = event.clientY - cameraDrag.startClientY;
        const panDeltaX = -(deltaX / metrics.renderWidth) * viewBoxWidth;
        const panDeltaY = -(deltaY / metrics.renderHeight) * viewBoxHeight;
        setPan({
          x: cameraDrag.startPanX + panDeltaX,
          y: cameraDrag.startPanY + panDeltaY,
        });
        return;
      }

      const point = getGridPointFromClient(event.clientX, event.clientY);
      updateHoverPoint(point);
      if (!dragTarget || !point) {
        return;
      }

      applyDraftUpdate((prev) =>
        applySelectionPointUpdate(prev, dragTarget, point)
      );
    },
    [
      cameraDrag,
      dragTarget,
      viewBoxWidth,
      viewBoxHeight,
      getBoardRenderMetrics,
      setPan,
      getGridPointFromClient,
      updateHoverPoint,
      applyDraftUpdate,
    ]
  );

  const handleBoardPointerUp = useCallback(
    (event: React.PointerEvent<SVGSVGElement>): void => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setCameraDrag(null);
      setDragTarget(null);
    },
    [setCameraDrag]
  );

  const handleBoardPointerLeave = useCallback((): void => {
    setCameraDrag(null);
    setDragTarget(null);
    updateHoverPoint(null);
  }, [setCameraDrag, updateHoverPoint]);

  const handleBoardWheel = useCallback(
    (event: React.WheelEvent<SVGSVGElement>): void => {
      event.preventDefault();
      const zoomDelta = event.deltaY > 0 ? -0.08 : 0.08;
      setZoom((prev) =>
        clamp(Number((prev + zoomDelta).toFixed(2)), 0.55, 2.5)
      );
    },
    [setZoom]
  );

  const handleDropOnBoard = useCallback(
    (event: React.DragEvent<SVGSVGElement>): void => {
      event.preventDefault();
      setIsBoardDragOver(false);
      const point = getGridPointFromClient(event.clientX, event.clientY);
      if (!point) {
        return;
      }
      updateHoverPoint(point);

      const rawPayload = event.dataTransfer.getData(
        "application/princeton-td-asset"
      );
      if (!rawPayload) {
        return;
      }

      let payload: PaletteDragPayload | null = null;
      try {
        payload = JSON.parse(rawPayload) as PaletteDragPayload;
      } catch {
        payload = null;
      }
      if (!payload) {
        return;
      }

      clearMessages();
      applyDraftUpdate((prev) => {
        if (!isInsideMap(point)) {
          return prev;
        }
        const mapPoint = normalizeMapPoint(point);
        if (payload.kind === "decoration") {
          return {
            ...prev,
            decorations: [
              ...prev.decorations,
              {
                pos: mapPoint,
                type: payload.value as DecorationCategory,
                variant: 0,
              },
            ],
          };
        }
        if (payload.kind === "landmark") {
          return {
            ...prev,
            decorations: [
              ...prev.decorations,
              {
                pos: mapPoint,
                size: 1.6,
                type: payload.value as DecorationCategory,
                variant: 0,
              },
            ],
          };
        }
        if (payload.kind === "objective") {
          return {
            ...prev,
            specialTowers: [
              ...prev.specialTowers,
              { pos: mapPoint, type: payload.value as SpecialTowerType },
            ],
          };
        }
        if (payload.kind === "tower") {
          return {
            ...prev,
            placedTowers: [
              ...prev.placedTowers,
              { pos: mapPoint, type: payload.value as TowerType },
            ],
          };
        }
        return {
          ...prev,
          hazards: [
            ...prev.hazards,
            { pos: mapPoint, radius: 1.5, type: payload.value as HazardType },
          ],
        };
      });

      if (payload.kind === "objective") {
        const currentDraft = draftRef.current;
        if (currentDraft) {
          setSelection({
            index: currentDraft.specialTowers.length - 1,
            kind: "special_tower",
          });
        }
      } else if (payload.kind === "tower") {
        const currentDraft = draftRef.current;
        if (currentDraft) {
          setSelection({
            index: currentDraft.placedTowers.length - 1,
            kind: "tower",
          });
        }
      }
    },
    [
      getGridPointFromClient,
      updateHoverPoint,
      clearMessages,
      applyDraftUpdate,
      draftRef,
    ]
  );

  const handleBoardDragOver = useCallback(
    (event: React.DragEvent<SVGSVGElement>): void => {
      event.preventDefault();
      if (!isBoardDragOver) {
        setIsBoardDragOver(true);
      }
      const point = getGridPointFromClient(event.clientX, event.clientY);
      updateHoverPoint(point);
    },
    [isBoardDragOver, getGridPointFromClient, updateHoverPoint]
  );

  const handleBoardDragLeave = useCallback((): void => {
    setIsBoardDragOver(false);
  }, []);

  const startDragTarget = useCallback(
    (target: SelectionTarget, event: React.PointerEvent): void => {
      event.stopPropagation();
      setSelection(target);
      setDragTarget(target);
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  return {
    boardRef,
    clearSelection,
    dragTarget,
    handleBoardDragLeave,
    handleBoardDragOver,
    handleBoardPointerDown,
    handleBoardPointerLeave,
    handleBoardPointerMove,
    handleBoardPointerUp,
    handleBoardWheel,
    handleDropOnBoard,
    hoverPoint,
    isBoardDragOver,
    selection,
    setSelection,
    startDragTarget,
  };
}
