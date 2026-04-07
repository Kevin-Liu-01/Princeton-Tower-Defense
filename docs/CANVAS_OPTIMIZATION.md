# Canvas rendering optimization guide

This doc summarizes the game’s canvas pipeline and the optimizations applied (and possible next steps) to improve FPS without changing how towers, troops, enemies, and heroes look.

## Current rendering pipeline

- **Loop**: `usePrincetonTowerDefenseRuntime` drives a `requestAnimationFrame` loop that calls `updateGameRef.current(deltaTime)` then `renderRef.current()` every frame.
- **Single canvas**: One 2D context; each frame does full clear, then draw order: background gradient → grid → path (road layers, pebbles, wheel tracks) → fog at path ends → hazards → decorations (culled) → entities (depth-sorted: towers, enemies, hero, troops, projectiles, effects, particles) → environment/ambient.
- **Quality**: `renderQualityRef` (high/medium/low) and DPR cap already adapt to frame time; quality affects decoration margin and (after these changes) fog counts.

## Optimizations implemented

### 1. **Batched grid drawing**

- **Before**: 900 cells × (beginPath, moveTo, 4× lineTo, closePath, stroke) plus ~270 fill paths → 900+ stroke calls and many state changes per frame.
- **After**: One `beginPath()`, append all 900 diamond paths, single `stroke()`. Tile fills stay per-cell (different fillStyle per cell) but stroke work is one batched path.
- **Location**: `usePrincetonTowerDefenseRuntime.tsx` (render callback, grid loop).

### 2. **Quality-based fog counts**

- **Before**: Fixed 60 blobs + 10 wisps per path end; each blob/wisp uses `createRadialGradient` + `arc` + `fill`.
- **After**: `getFogBlobCount(quality)` / `getFogWispCount(quality)` — high: 60/10, medium: 40/6, low: 24/4. Fewer gradient/arc draws when quality drops.
- **Location**: Same file; `drawRoadEndFog` uses these counts.

### 3. **Rounded drawing coordinates**

- **Why**: Sub-pixel coordinates force extra work and can look blurry; rounding to integers is a recommended canvas optimization.
- **Change**: `utils/index.ts`: added `worldToScreenRounded()` (same as `worldToScreen` but `Math.round` on x/y). Used for **entity base positions** only (so visuals stay aligned; range circles etc. can stay smooth if desired).
- **Where used**:
  - `rendering/towers/index.ts`: `renderTower` base position.
  - `rendering/enemies/index.ts`: `renderEnemy` base position.
  - `rendering/heroes/index.ts`: `renderHero` base position.
  - `rendering/troops/index.ts`: `renderTroop` base position.

### 4. **Existing performance module**

- **Already in place**: `rendering/performance.ts` — Firefox detection, `setShadowBlur` / `clearShadow` (shadows disabled on Firefox), gradient caching, reduced particles, simplified gradients, fog quality multiplier.
- **Optional**: When `renderQuality === 'low'`, you can call `setPerformanceSettings({ disableShadows: true })` (and restore when medium/high) for extra gain on low-end devices.

### 5. **Cached canvas rect (DOM reflow elimination)**

#### Problem

`getBoundingClientRect()`, `offsetWidth`, `offsetHeight`, `clientWidth`, and `clientHeight` are **synchronous layout queries** — the browser must finish all pending style/layout work before returning the result. This is called **forced synchronous layout** (or layout thrashing) and is one of the most expensive operations in the browser. When called inside high-frequency handlers (pointer move, wheel, gesture change, rAF draw loops), it forces the browser to reflow potentially hundreds of times per second, directly contending with the render pipeline.

#### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  cachedCanvasRect.ts                      │
│                                                           │
│  CachedCanvasRectRef = MutableRefObject<DOMRect | null>   │
│                                                           │
│  getCachedRect(canvas, cacheRef)                          │
│    └─ returns cacheRef.current if non-null (zero cost)    │
│    └─ otherwise: getBoundingClientRect() → cache → return │
│                                                           │
│  invalidateCanvasRect(cacheRef)                           │
│    └─ sets cacheRef.current = null                        │
└─────────────────────────────────────────────────────────┘
```

The cache ref is created once in `usePrincetonTowerDefenseRuntime.tsx`:

```typescript
const cachedCanvasRectRef = useRef<DOMRect | null>(null);
```

#### Invalidation

The cache is invalidated (set to `null`) whenever the canvas position or size could have changed:

| Trigger       | Location                             | Mechanism                                                                     |
| ------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| Window resize | `canvasResize.ts → resizeCanvases()` | Calls `invalidateCanvasRect(cachedCanvasRectRef)` after resizing all canvases |

The next event handler call after invalidation will perform a single fresh `getBoundingClientRect()`, re-populating the cache for all subsequent calls until the next invalidation.

**Why this is safe**: The game canvas is absolutely positioned inside a fixed container (`absolute inset-0`). It does not scroll, and its position only changes on window resize. Resize events always flow through `setupResizeListener` which invalidates the cache.

#### Call sites converted

| File                     | Function                       | Frequency                           | Impact                                                      |
| ------------------------ | ------------------------------ | ----------------------------------- | ----------------------------------------------------------- |
| `canvasEventHandlers.ts` | `handleMouseMoveImpl`          | Every `pointermove` (60+ Hz)        | **Highest** — fires on every mouse movement during gameplay |
| `canvasEventHandlers.ts` | `handlePointerDownImpl`        | Every `pointerdown`                 | Medium — once per click/touch start                         |
| `canvasEventHandlers.ts` | `handleCanvasClickImpl`        | Every `pointerup`                   | Medium — once per click/touch end                           |
| `zoomAndGestures.ts`     | `zoomCameraAtClientPointImpl`  | Every wheel tick / zoom step        | **High** — continuous during scroll-zoom                    |
| `zoomAndGestures.ts`     | `handleGestureChange`          | Every pinch gesture change          | **High** — continuous during trackpad pinch                 |
| `buildDragHandlers.ts`   | `handleBuildTouchDragMoveImpl` | Every `touchmove` during tower drag | **High** — continuous during build drag                     |
| `buildDragHandlers.ts`   | `handleBuildTouchDragEndImpl`  | Once per drag end                   | Low                                                         |

#### Plumbing

The `cachedCanvasRectRef` is threaded through existing parameter interfaces — no new hook or context needed:

- **`CanvasEventParams.cachedCanvasRectRef`** → used by all three pointer handlers
- **`ZoomGestureRefs.cachedCanvasRectRef`** → used by `zoomCameraAtClientPointImpl`
- **`handleGestureChange(…, cachedCanvasRectRef)`** → explicit param (not in a refs bag because the function is called from `attachWheelAndGestureListeners`)
- **`attachWheelAndGestureListeners(…, cachedCanvasRectRef)`** → threads ref to gesture change handler
- **`handleBuildTouchDragMoveImpl(…, cachedCanvasRectRef)`** → explicit param
- **`handleBuildTouchDragEndImpl(…, cachedCanvasRectRef)`** → explicit param
- **`resizeCanvases(…, cachedCanvasRectRef?)`** → optional, invalidates on resize
- **`setupResizeListener(…, cachedCanvasRectRef?)`** → optional, passes through to `resizeCanvases`

Wire-up lives in `usePrincetonTowerDefenseRuntime.tsx` alongside the other cache refs (`cachedStaticMapLayerRef`, etc.).

#### BattlefieldPreviewCanvas — ResizeObserver approach

`BattlefieldPreviewCanvas.tsx` has a self-contained rAF draw loop that was reading `canvas.clientWidth` / `canvas.clientHeight` every frame. Since this component is independent of the game canvas, it uses a different strategy:

- A `ResizeObserver` watches the canvas element and writes CSS dimensions to a `cssSizeRef` ref.
- The rAF draw loop reads from `cssSizeRef.current` instead of querying the DOM.
- Initial dimensions are seeded from `canvas.clientWidth` / `canvas.clientHeight` (one-time DOM read at mount).
- The observer is disconnected on unmount.

This eliminates forced layout from every frame of the menu preview animation.

#### How to add a new consumer

If you add a new event handler or function that needs the canvas screen position:

```typescript
import { getCachedRect, type CachedCanvasRectRef } from "./cachedCanvasRect";

function myHandler(
  canvas: HTMLCanvasElement,
  cachedCanvasRectRef: CachedCanvasRectRef,
  e: PointerEvent
): void {
  const rect = getCachedRect(canvas, cachedCanvasRectRef);
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // ...
}
```

If you add a new canvas that moves or resizes independently, create a separate `useRef<DOMRect | null>(null)` for it and invalidate on its resize.

#### Call sites intentionally NOT converted

These use `getBoundingClientRect()` at low frequency and don't benefit from caching:

| File                  | Context                 | Why left as-is                         |
| --------------------- | ----------------------- | -------------------------------------- |
| `HudTooltip.tsx`      | Tooltip position calc   | Runs once when tooltip becomes visible |
| `SpellInfoPortal.tsx` | `useLayoutEffect`       | Runs once on mount                     |
| `TutorialOverlay.tsx` | Tutorial step highlight | Runs once per step change              |
| `NavMoreDropdown.tsx` | Dropdown position       | Runs once on menu open                 |
| `WorldMap.tsx`        | Canvas click/hover      | User-initiated, not in game loop       |
| `useCreatorCamera.ts` | Board metrics           | Infrequent recalculation               |
| `canvasResize.ts`     | Container rect          | Resize handler — necessarily reads DOM |

#### Rules

1. **Never call `getBoundingClientRect()` on the game canvas in a hot path.** Use `getCachedRect()`.
2. **Always invalidate** when the canvas could have moved (resize, fullscreen toggle, scroll — though the game canvas doesn't scroll).
3. **One cache per canvas element.** The game canvas and `BattlefieldPreviewCanvas` have separate cache strategies.
4. **Low-frequency call sites** (tooltips, menus, one-shot effects) should use `getBoundingClientRect()` directly — caching adds complexity for no measurable gain.

## Further optimizations (not yet done)

These keep the same look but require more refactor or new architecture:

1. **Offscreen static layer (largest potential win)**  
   Pre-render **background gradient + grid + path** (and optionally path fog) to an `OffscreenCanvas` at a fixed view (e.g. 1920×960, zoom 1, offset 0). Each frame: `drawImage(offscreen, srcRect, 0, 0, width, height)` with `srcRect` computed from camera. Rebuild buffer when `selectedMap` or theme changes. Removes ~900 grid ops + hundreds of path draws per frame.

2. **Layered canvases**  
   Split into 2–3 stacked canvases (e.g. static background, dynamic game, UI). Clear/redraw only the layers that change. Complements the offscreen static layer.

3. **Dirty rectangles**  
   Track a bounding rect of moving/changed entities; clear and redraw only that region of the game layer (plus overlap for correctness). More complex with isometric + camera; easier if the game layer is separate.

4. **More batching**
   - Path: batch road layers by fillStyle where possible (e.g. one path per style).
   - Decorations: batch by type or texture if they share state.

5. **Reduce work at low quality**
   - Skip or simplify grid (e.g. draw every 2nd tile).
   - Fewer path subdivisions or road detail.
   - Lower decoration count or distance.

6. **Web Workers**  
   Offload heavy non-drawing work (e.g. pathfinding, wave/balance math) so the main thread stays free for the render loop.

7. **ImageData / direct pixel**  
   For very dense, uniform drawing (e.g. grid or procedural effects), `getImageData`/`putImageData` can be faster than many 2D API calls; only where it fits the art style.

## Profiling

- Use Chrome DevTools → Performance to record a few seconds of gameplay and see time in `render`, `clearRect`, and draw calls.
- Check “Rendering” → “Frame Rendering Stats” and “Paint flashing” to see what is redrawn each frame.
- Compare FPS with quality forced to low and with the new fog counts to validate gains.

## References

- [MDN: Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [web.dev: Canvas performance](https://web.dev/articles/canvas-performance)
- Use `requestAnimationFrame` (already in use); avoid floating-point coords where possible; minimize state changes; consider offscreen and layered canvases and dirty rects for the game layer.
