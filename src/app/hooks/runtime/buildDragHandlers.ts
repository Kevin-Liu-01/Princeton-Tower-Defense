import type { Dispatch, RefObject, SetStateAction } from "react";
import type { DraggingTower, TowerType } from "../../types";

type Setter<T> = Dispatch<SetStateAction<T>>;

export function handleBuildTouchDragMoveImpl(
  clientX: number,
  clientY: number,
  towerType: TowerType,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  setDraggingTower: Setter<DraggingTower | null>,
): void {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  setDraggingTower({ type: towerType, pos: { x: clientX - rect.left, y: clientY - rect.top } });
}

export function handleBuildTouchDragEndImpl(
  clientX: number,
  clientY: number,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  setDraggingTower: Setter<DraggingTower | null>,
): void {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
    canvas.dispatchEvent(
      new PointerEvent("pointerup", {
        clientX,
        clientY,
        pointerType: "touch",
        bubbles: true,
      })
    );
  } else {
    setDraggingTower(null);
  }
}
