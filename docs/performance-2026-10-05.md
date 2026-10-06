# Gameplay performance pass — October 5, 2026

## Measured results

180 enemies, six enemy types, 90 frames per scenario, first 10 frames discarded. Full enemy renderer (including health bars/effects), native CPU canvas, shadows off, zoom 0.8, synthetic 60 Hz animation timestamps. Median and p95 measure CPU rendering time, **not browser FPS or end-to-end input latency**. These figures exclude simulation, React, map rendering, and browser compositing. Machine load affects absolute results.

| Scenario | Before median | After median | Reduction | Before → after p95 |
| --- | ---: | ---: | ---: | ---: |
| Marching wave | 135.98 ms | 21.27 ms | 84% | 177.12 → 47.5 ms |
| 25% attacking | 152.84 ms | 58.6 ms | 62% | 245.34 → 78.62 ms |

A separate first run measured 152.26 → 15.61 ms for marching enemies and 136.63 → 52.58 ms with 25% attacking. Both runs show the same substantial reduction; the table uses the final run.

## Changes

- Share idle enemy body artwork across matching types at 30 animation frames per second. World position, facing, health bars, auras, attack animation, and damage feedback remain live. Attacking/hurt enemies bypass the cache.
- Reuse each variant's canvas instead of allocating a new canvas for each animation time slice. Bound retained artwork to 96 variants and approximately 16 MiB of RGBA pixels; evict least recently used variants and release buffers when leaving a battle.
- Include exact size, zoom, region, drawing resolution and shadow quality in cache identity. Keep Retina resolution up to 2×.
- Replace insertion sorting of freshly assembled enemy/depth lists with stable native sorting. These arrays were rebuilt each frame, so they did not benefit from insertion sort's nearly-sorted fast path.
- Stop single-target tower, troop and hero searches after the first eligible target. Preserve Tenor's three targets, existing priority order, flying predicates, and separate chain/splash calculations.
- Visit only spatial-hash cells intersecting a query's bounding box.
- Filter tower-debuff-capable enemies once per tick rather than inspecting every enemy's abilities for every tower. Preserve unchanged tower buff objects and avoid rebuilding ready spell cooldowns.
- Update canvas pointer coordinates immediately; publish tooltip position snapshots at most 30 times per second, including the final pointer sample.
- Cap shared decorative UI sprite painting at 30 FPS without changing animation time/speed or the battlefield frame rate.
- Reset the previous-frame timestamp when starting a battle loop.

## Verification

- Four automated regression tests pass: spatial queries versus brute force across negative coordinates/cell boundaries; target limits/order/predicates; sprite reuse/alpha/quality invalidation/memory cleanup; bounds checks for all 108 enemy designs.
- Combat-balance audit passes for 26 levels, 108 enemies, 7 towers, 9 heroes and 13 troops.
- Production webpack build passes. Existing Next configuration skips TypeScript build errors.
- Separate TypeScript check reports the same 80 existing diagnostics as the original working tree, with no new error messages from this pass.
- Scoped Ultracite checks pass with existing warnings in game files; new cache/test/benchmark files pass without errors.
- Browser navigation and inspection repeatedly timed out in the in-app browser. Interactive tower placement/upgrades, mobile gestures, and browser FPS are **not verified**. The temporary development server was stopped.

## Reproduce

```sh
node --test scripts/performance.test.cjs
node scripts/benchmark-performance.cjs
# Compare an earlier checkout with the same installed dependencies:
node scripts/benchmark-performance.cjs /absolute/path/to/baseline-checkout
node scripts/audit-balance.cjs
pnpm exec tsc --noEmit
pnpm build
```

## Remaining performance work

The simulation still publishes React entity state each tick, and attacking/hurt enemies still draw their full vector bodies. Those remain candidates for a future browser-profiled pass. This change substantially reduces measured rendering cost; it does not establish that every subsystem is optimal or guarantee a frame rate on all devices.
