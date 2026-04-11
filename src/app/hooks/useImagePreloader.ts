"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export interface PreloaderState {
  loaded: number;
  total: number;
  progress: number;
  isComplete: boolean;
}

const INITIAL_STATE: PreloaderState = {
  isComplete: false,
  loaded: 0,
  progress: 0,
  total: 0,
};

const imageCache = new Set<string>();

function preloadSingleImage(src: string): Promise<void> {
  if (imageCache.has(src)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.add(src);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Hook-based preloader: loads all URLs on mount (once).
 * Good for gating initial renders (e.g. world map load).
 */
export function useImagePreloader(urls: string[]): PreloaderState {
  const [state, setState] = useState<PreloaderState>(INITIAL_STATE);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (urls.length === 0 || hasStarted.current) {
      return;
    }
    hasStarted.current = true;

    const total = urls.length;
    let loaded = urls.filter((u) => imageCache.has(u)).length;
    setState({
      isComplete: loaded >= total,
      loaded,
      progress: loaded / total,
      total,
    });

    const uncached = urls.filter((u) => !imageCache.has(u));
    if (uncached.length === 0) {
      return;
    }

    const CONCURRENCY = 6;
    let idx = 0;

    function next(): Promise<void> {
      if (idx >= uncached.length) {
        return Promise.resolve();
      }
      const url = uncached[idx++];
      return preloadSingleImage(url).then(() => {
        loaded++;
        setState({
          isComplete: loaded >= total,
          loaded,
          progress: loaded / total,
          total,
        });
        return next();
      });
    }

    Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, uncached.length) }, () =>
        next()
      )
    );
  }, [urls]);

  return state;
}

/**
 * Imperative preloader with progress callback.
 * Good for transitions (e.g. world map → battle).
 */
export function preloadImagesWithProgress(
  urls: string[],
  onProgress: (loaded: number, total: number) => void
): Promise<void> {
  const total = urls.length;
  if (total === 0) {
    onProgress(0, 0);
    return Promise.resolve();
  }

  const uncached = urls.filter((u) => !imageCache.has(u));
  let loaded = total - uncached.length;
  onProgress(loaded, total);

  if (uncached.length === 0) {
    return Promise.resolve();
  }

  const CONCURRENCY = 6;
  let idx = 0;

  return new Promise((resolve) => {
    function next(): Promise<void> {
      if (idx >= uncached.length) {
        return Promise.resolve();
      }
      const url = uncached[idx++];
      return preloadSingleImage(url).then(() => {
        loaded++;
        onProgress(loaded, total);
        return next();
      });
    }

    Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, uncached.length) }, () =>
        next()
      )
    ).then(() => resolve());
  });
}

/**
 * Convenience hook: preload gate with minimum display time.
 * Returns isReady=true only after both preloading AND min time are done.
 */
export function usePreloadGate(
  urls: string[],
  minDisplayMs = 2000
): PreloaderState & { isReady: boolean } {
  const preloader = useImagePreloader(urls);
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setMinTimePassed(true);
      return;
    }
    const t = setTimeout(() => setMinTimePassed(true), minDisplayMs);
    return () => clearTimeout(t);
  }, [urls.length, minDisplayMs]);

  return {
    ...preloader,
    isReady: preloader.isComplete && minTimePassed,
  };
}

/**
 * Hook for managing battle loading transitions.
 * Returns controls to trigger loading and current state.
 */
/**
 * Progress that smoothly fills over the full display window.
 * Accounts for asset loading AND UI render/initialization time.
 */
function useSyntheticProgress(active: boolean, minDisplayMs: number): number {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }
    startRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const t = Math.min(elapsed / minDisplayMs, 1);
      const eased = 1 - (1 - t) ** 2.2;
      setDisplay(eased);

      if (eased < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(1);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, minDisplayMs]);

  return display;
}

/**
 * Battle loading gate with two visual phases:
 *
 * Phase 1 (blocking): Loading screen visible while assets preload.
 *   gameState stays "menu"/"setup". Lasts until minDisplayMs elapses.
 *
 * Phase 2 (overlay): onReady fires → gameState becomes "playing" →
 *   BattleUI renders behind the still-visible LoadingOverlay.
 *   After a grace period for UI to paint, active→false and overlay fades.
 */
export function useBattleLoadingGate(
  getUrls: () => string[],
  minDisplayMs = 2200,
  onReady: () => void
) {
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const readyCallbackRef = useRef(onReady);
  readyCallbackRef.current = onReady;
  const sessionRef = useRef(0);

  const visualProgress = useSyntheticProgress(active, minDisplayMs);

  const UI_GRACE_MS = 400;

  const trigger = useCallback(() => {
    const session = ++sessionRef.current;
    setActive(true);
    setLoaded(0);
    setTotal(0);

    const urls = getUrls();
    const startTime = Date.now();

    preloadImagesWithProgress(urls, (l, t) => {
      if (sessionRef.current !== session) {
        return;
      }
      setLoaded(l);
      setTotal(t);
    }).then(() => {
      if (sessionRef.current !== session) {
        return;
      }
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);

      // Phase 1 → Phase 2 transition: wait for minDisplayMs
      setTimeout(() => {
        if (sessionRef.current !== session) {
          return;
        }
        readyCallbackRef.current();

        // Phase 2: BattleUI now renders behind overlay. Give it time to paint.
        setTimeout(() => {
          if (sessionRef.current !== session) {
            return;
          }
          setActive(false);
        }, UI_GRACE_MS);
      }, remaining);
    });
  }, [getUrls, minDisplayMs]);

  const cancel = useCallback(() => {
    sessionRef.current++;
    setActive(false);
  }, []);

  return { active, cancel, loaded, progress: visualProgress, total, trigger };
}
