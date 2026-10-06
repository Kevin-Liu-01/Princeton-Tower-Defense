import { usesMobileRenderBudget } from "../../../../rendering/deviceProfile";
import { interceptShadows } from "../../../../rendering/performance";
/** Reuse backing storage; assigning canvas dimensions reallocates its bitmap. */
export function prepareLayer(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const pixelWidth = Math.round(width);
  const pixelHeight = Math.round(height);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  if (typeof ctx.reset === "function") {
    ctx.reset();
  } else {
    // Older browsers need the dimension reset to clear all drawing state.
    canvas.width = pixelWidth;
  }
  if (usesMobileRenderBudget()) {
    interceptShadows(ctx);
  }
  return ctx;
}
