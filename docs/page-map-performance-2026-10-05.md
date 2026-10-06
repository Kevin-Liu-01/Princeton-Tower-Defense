# Page and world-map performance — October 5, 2026

This pass extends the enemy/combat optimizations to initial navigation, the world map, menu loading, and battle transitions. Existing artwork and gameplay changes were preserved.

## Measured results

| Measurement | Before | After |
| --- | ---: | ---: |
| Landing HTML's initial script payload, individually gzip-compressed | 1,691,653 bytes | 538,869 bytes |
| Map CPU draw time, mean per simulated 60 Hz call | 463.87 ms | 123.83 ms |
| Map CPU draw time, 95th percentile | 1,576.51 ms | 629.43 ms |

Initial script payload dropped 68.1%. This counts script URLs in the production HTML, not later lazy chunks, images, total session downloads, or time-to-interactive.

The repeatable map benchmark (`node scripts/benchmark-map.cjs [checkout]`) uses a native CPU Canvas implementation, DPR 1, 1400px container, 650px map height, no selected level or hero, and 90 measured calls after 10 warmup calls. Mean draw cost fell 73.3%. Browser GPU rendering differs and the machine had other active workloads; these numbers are not browser FPS or a guarantee for every device. Cached frames intentionally skip drawing. Ambient decoration/path/effect cadence is reduced, while moving heroes can still draw at 60 Hz.

## Changes

- Separate the game runtime from the landing bundle; warm it on Play hover, focus, or click.
- Disable speculative route prefetch for repeated landing map cards; lazy-load their thumbnails.
- Load Codex, Creator, Settings, and Credits code when opened.
- Reuse world-map canvas backing stores instead of reallocating layers each update. Reset drawing state safely, including a legacy-browser fallback.
- Invalidate all map caches on resolution/DPR changes.
- Update ambient map artwork at 15 Hz on desktop and selected layers at 8 Hz on mobile. Idle composition is capped at 30 Hz, with 60 Hz movement updates.
- Stop map animation behind the four main menus and while the document is hidden. Clamp elapsed movement time on resume.
- Shorten landing exit from 700 ms to 200 ms and map entrance staging from 700 ms to 160 ms.
- Replace fixed loading waits with asset completion and a bounded slow-network deadline. Reveal battle after a paint opportunity instead of a fixed extra 400 ms.
- Remove the synthetic per-frame React loading-progress loop; display asset progress.
- Share in-flight image decodes, deduplicate URLs, clean up loading timers and animation callbacks, and ignore cancelled progress callbacks.

## Verification

- Production webpack build and all 45 generated pages passed.
- Balance audit passed: 26 levels, 108 enemies, 7 towers, 9 heroes, 13 troops.
- Seven performance regression tests passed, covering enemy artwork bounds/cache behavior, spatial queries, map buffer reuse, and image loading deduplication/retry.
- Scoped lint: zero errors; existing/style warnings remain.
- Typecheck: the same 80 pre-existing errors; no new diagnostics. The existing Next configuration skips type validation during builds, so the independent comparison matters.
- Desktop browser: landing to map, map selection and preview, expanded loadout and three-spell selection, battle entry, cannon placement, cannon interaction panel, quit confirmation, return to map, all eight Codex tabs, all seven Settings tabs, Creator opening/closing, and Credits.

Mobile-specific pacing is implemented but has not been verified on a physical mobile device. This is not exhaustive playthrough coverage of every level or every possible game transition.
