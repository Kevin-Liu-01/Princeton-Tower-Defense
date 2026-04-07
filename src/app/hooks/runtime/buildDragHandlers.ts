import type { Dispatch, RefObject, SetStateAction } from "react";

import type { DraggingTower, TowerType } from "../../types";
import { getCachedRect } from "./cachedCanvasRect";
import type { CachedCanvasRectRef } from "./cachedCanvasRect";

type Setter<T> = Dispatch<SetStateAction<T>>;

export function handleBuildTouchDragMoveImpl(
  clientX: number,
  clientY: number,
  towerType: TowerType,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  setDraggingTower: Setter<DraggingTower | null>,
  cachedCanvasRectRef: CachedCanvasRectRef
): void {
  const canvas = canvasRef.current;
  if (!canvas) {
    return;
  }
  const rect = getCachedRect(canvas, cachedCanvasRectRef);
  setDraggingTower({
    pos: { x: clientX - rect.left, y: clientY - rect.top },
    type: towerType,
  });
}

export function handleBuildTouchDragEndImpl(
  clientX: number,
  clientY: number,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  setDraggingTower: Setter<DraggingTower | null>,
  cachedCanvasRectRef: CachedCanvasRectRef
): void {
  const canvas = canvasRef.current;
  if (!canvas) {
    return;
  }
  const rect = getCachedRect(canvas, cachedCanvasRectRef);
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
    canvas.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        clientX,
        clientY,
        pointerType: "touch",
      })
    );
  } else {
    setDraggingTower(null);
  }
}
