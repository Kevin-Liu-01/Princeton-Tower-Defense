"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export interface PreloaderState {
  loaded: number;
  total: number;
  progress: number;
  isComplete: boolean;
}

const INITIAL_STATE: PreloaderState = {
  loaded: 0,
  total: 0,
  progress: 0,
  isComplete: false,
};

const imageCache = new Set<string>();

function preloadSingleImage(src: string): Promise<void> {
  if (imageCache.has(src)) return Promise.resolve();
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
    if (urls.length === 0 || hasStarted.current) return;
    hasStarted.current = true;

    const total = urls.length;
    let loaded = urls.filter((u) => imageCache.has(u)).length;
    setState({ loaded, total, progress: loaded / total, isComplete: loaded >= total });

    const uncached = urls.filter((u) => !imageCache.has(u));
    if (uncached.length === 0) return;

    const CONCURRENCY = 6;
    let idx = 0;

    function next(): Promise<void> {
      if (idx >= uncached.length) return Promise.resolve();
      const url = uncached[idx++];
      return preloadSingleImage(url).then(() => {
        loaded++;
        setState({ loaded, total, progress: loaded / total, isComplete: loaded >= total });
        return next();
      });
    }

    Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, uncached.length) }, () => next()),
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
  onProgress: (loaded: number, total: number) => void,
): Promise<void> {
  const total = urls.length;
  if (total === 0) {
    onProgress(0, 0);
    return Promise.resolve();
  }

  const uncached = urls.filter((u) => !imageCache.has(u));
  let loaded = total - uncached.length;
  onProgress(loaded, total);

  if (uncached.length === 0) return Promise.resolve();

  const CONCURRENCY = 6;
  let idx = 0;

  return new Promise((resolve) => {
    function next(): Promise<void> {
      if (idx >= uncached.length) return Promise.resolve();
      const url = uncached[idx++];
      return preloadSingleImage(url).then(() => {
        loaded++;
        onProgress(loaded, total);
        return next();
      });
    }

    Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, uncached.length) }, () => next()),
    ).then(() => resolve());
  });
}

/**
 * Convenience hook: preload gate with minimum display time.
 * Returns isReady=true only after both preloading AND min time are done.
 */
export function usePreloadGate(
  urls: string[],
  minDisplayMs = 2000,
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
export function useBattleLoadingGate(
  getUrls: () => string[],
  minDisplayMs = 2200,
  onReady: () => void,
) {
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState(0);
  const readyCallbackRef = useRef(onReady);
  readyCallbackRef.current = onReady;

  const trigger = useCallback(() => {
    setActive(true);
    setLoaded(0);
    setTotal(0);
    setProgress(0);

    const urls = getUrls();
    const startTime = Date.now();

    preloadImagesWithProgress(urls, (l, t) => {
      setLoaded(l);
      setTotal(t);
      setProgress(t > 0 ? l / t : 1);
    }).then(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);
      setTimeout(() => {
        readyCallbackRef.current();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setActive(false);
          });
        });
      }, remaining);
    });
  }, [getUrls, minDisplayMs]);

  return { active, loaded, total, progress, trigger };
}
