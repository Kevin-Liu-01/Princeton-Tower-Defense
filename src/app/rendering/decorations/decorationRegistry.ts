import type { DecorationRenderParams } from "./renderDecorationItem";

/**
 * Signature for an individual decoration renderer extracted from the
 * monolithic switch/case in `renderDecorationItem`.
 *
 * Each function receives the full `DecorationRenderParams` so it has
 * access to everything the original case block had.
 */
export type DecorationRenderFn = (params: DecorationRenderParams) => void;

const DECORATION_RENDERERS = new Map<string, DecorationRenderFn>();

/**
 * Register a renderer for a decoration type.
 *
 * Once registered, the renderer will be invoked by `renderDecorationItem`
 * instead of the corresponding switch/case branch, allowing cases to be
 * migrated one-at-a-time without a big-bang rewrite.
 */
export function registerDecorationRenderer(
  type: string,
  renderer: DecorationRenderFn
): void {
  if (DECORATION_RENDERERS.has(type)) {
    console.warn(
      `[decorationRegistry] Overwriting existing renderer for "${type}"`
    );
  }
  DECORATION_RENDERERS.set(type, renderer);
}

/**
 * Look up a registered renderer for the given decoration type.
 * Returns `undefined` when no renderer has been registered (the caller
 * should fall through to the legacy switch/case).
 */
export function getDecorationRenderer(
  type: string
): DecorationRenderFn | undefined {
  return DECORATION_RENDERERS.get(type);
}
