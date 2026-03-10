import { useCallback, useState } from "react";
import type { BoardRenderMetrics } from "../types";
import {
  ISO_VIEWBOX_WIDTH,
  ISO_VIEWBOX_HEIGHT,
} from "../utils/isoMath";
import { clamp } from "../utils/gridUtils";

export interface CreatorCameraState {
  zoom: number;
  pan: { x: number; y: number };
  viewBoxX: number;
  viewBoxY: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  cameraDrag: {
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
  } | null;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setCameraDrag: React.Dispatch<React.SetStateAction<CreatorCameraState["cameraDrag"]>>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetCamera: () => void;
  getBoardRenderMetrics: (board: SVGSVGElement | null) => BoardRenderMetrics | null;
}

export function useCreatorCamera(): CreatorCameraState {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cameraDrag, setCameraDrag] = useState<CreatorCameraState["cameraDrag"]>(null);

  const viewBoxWidth = ISO_VIEWBOX_WIDTH / zoom;
  const viewBoxHeight = ISO_VIEWBOX_HEIGHT / zoom;
  const viewBoxX = (ISO_VIEWBOX_WIDTH - viewBoxWidth) / 2 + pan.x;
  const viewBoxY = (ISO_VIEWBOX_HEIGHT - viewBoxHeight) / 2 + pan.y;

  const zoomIn = useCallback(() => {
    setZoom((prev) => clamp(Number((prev + 0.1).toFixed(2)), 0.55, 2.5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => clamp(Number((prev - 0.1).toFixed(2)), 0.55, 2.5));
  }, []);

  const resetCamera = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCameraDrag(null);
  }, []);

  const getBoardRenderMetrics = useCallback(
    (board: SVGSVGElement | null): BoardRenderMetrics | null => {
      if (!board) return null;
      const rect = board.getBoundingClientRect();
      const rectRatio = rect.width / rect.height;
      const viewRatio = viewBoxWidth / viewBoxHeight;

      if (rectRatio > viewRatio) {
        const renderHeight = rect.height;
        const renderWidth = renderHeight * viewRatio;
        return {
          rect,
          renderWidth,
          renderHeight,
          offsetX: (rect.width - renderWidth) / 2,
          offsetY: 0,
        };
      }

      const renderWidth = rect.width;
      const renderHeight = renderWidth / viewRatio;
      return {
        rect,
        renderWidth,
        renderHeight,
        offsetX: 0,
        offsetY: (rect.height - renderHeight) / 2,
      };
    },
    [viewBoxWidth, viewBoxHeight]
  );

  return {
    zoom,
    pan,
    viewBoxX,
    viewBoxY,
    viewBoxWidth,
    viewBoxHeight,
    cameraDrag,
    setZoom,
    setPan,
    setCameraDrag,
    zoomIn,
    zoomOut,
    resetCamera,
    getBoardRenderMetrics,
  };
}
