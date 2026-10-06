# Mobile performance pass

Phone-width, touch-primary and constrained devices now start with a medium rendering budget. Battle canvas resolution uses 1.25 pixels per CSS pixel initially, and can adapt between 1 and 1.5. DOM text and controls retain native resolution. Desktop canvas budgets are unchanged.

- Mobile world-map scenery, paths and atmosphere reuse retained layers instead of repainting continuously. Hero movement and level selection remain live; map idle composition runs at 12Hz and movement at 30Hz.
- Mobile map canvases use DPR 1 rather than 2. Menu portraits cap DPR at 1.5 and decorative portrait animation at 20Hz.
- Mobile battle simulation/rendering is paced at up to 60Hz, preventing 90/120/144Hz displays from multiplying game work. Elapsed simulation time is preserved.
- Paused battles stop simulation updates; hidden tabs suspend the loop and resume without a large elapsed-time step.
- Mobile disables blurred canvas shadows and large ambient glows, removes panel backdrop blur, limits particles to 100 live / 24 per burst flush, and reduces decorative effects earlier under load.
- Troop sight queries use the existing enemy spatial index rather than scanning every enemy. Damage, movement, range and attack timing are unchanged.

## Reproducible measurement

Run `node scripts/benchmark-mobile.cjs [checkout-root]`. The workload renders the same 1800 × 760 world map with a 390px phone viewport, DPR 3 device signal, cached layers and a hero, at 60 sample timestamps. Measurements exclude the first four cold frames.

| Native canvas workload     |     Before |     After |
| -------------------------- | ---------: | --------: |
| Mean drawing work per call |    95.98ms |    8.46ms |
| p95 drawing work per call  |   295.27ms |   28.14ms |
| Canvas backing pixels      | 38,304,000 | 8,208,000 |

About 91% less average drawing work and 79% fewer backing pixels in this local benchmark. These are desktop-run native canvas measurements, not phone FPS estimates. Actual device/browser performance still needs hardware testing.

## Verification

15 automated tests pass, including 60/90/120/144Hz pacing, elapsed-time preservation, stall recovery, paused and background-tab behavior, spatial targeting, artwork bounds and reusable canvas storage. Balance audit and production build pass. TypeScript retains the existing 80 errors with no additions; scoped lint has no errors (older files retain warnings).

Browser checked in a 390 × 760 iframe viewport: sandbox loading, mobile build tray, cannon placement, paused tower selection, upgrade and resume. The HUD confirmed the medium budget. This verifies responsive UI behavior, not touch hardware or mobile GPU speed.

## Campaign entry follow-up

A phone screenshot revealed a blank campaign map that the original sandbox-only
browser check missed. The campaign and battle canvases shared a CSS rule that
started at opacity zero, waited one second, and then faded in over five seconds.
The campaign eventually appeared in the 390 × 760 browser reproduction. Removed
this delayed fade from both screens so painted content is visible on entry.
The campaign now observes its container dimensions with ResizeObserver and ignores
transient zero-size measurements during layout changes.

Verified the rebuilt production app in a 390 × 760 same-origin phone preview:
campaign scenery and level nodes appeared on entry; selecting Poe Field opened
its mobile detail sheet; Battle entered a visible battlefield. All 18 existing
checks passed, production build passed, and focused lint reported zero errors
(18 existing warnings). Physical-device performance remains unmeasured.
