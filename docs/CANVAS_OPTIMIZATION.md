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
