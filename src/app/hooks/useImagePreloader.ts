"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export interface PreloaderState {
  loaded: number;
  total: number;
  progress: number;
  isComplete: boolean;
}

const imageCache = new Set<string>();
const pendingImages = new Map<string, Promise<void>>();
const IMAGE_LOAD_TIMEOUT_MS = 8000;

function preloadSingleImage(src: string): Promise<void> {
  if (imageCache.has(src)) {
    return Promise.resolve();
  }
  const pending = pendingImages.get(src);
  if (pending) {
    return pending;
  }
  const request = (async () => {
    const image = new Image();
    image.src = src;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        image.decode(),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, IMAGE_LOAD_TIMEOUT_MS);
        }),
      ]);
      if (image.complete && image.naturalWidth > 0) {
        imageCache.add(src);
      }
    } catch {
      // Missing artwork must not block navigation.
    } finally {
      clearTimeout(timer);
    }
  })();
  pendingImages.set(src, request);
  void request.finally(() => pendingImages.delete(src));
  return request;
}

/** Share in-flight decodes between pages and limit concurrent image work. */
export async function preloadImagesWithProgress(
  urls: string[],
  onProgress: (loaded: number, total: number) => void
): Promise<void> {
  const unique = [...new Set(urls)];
  const total = unique.length;
  const uncached = unique.filter((url) => !imageCache.has(url));
  let loaded = total - uncached.length;
  let index = 0;
  onProgress(loaded, total);
  await Promise.all(
    Array.from({ length: Math.min(6, uncached.length) }, async () => {
      while (index < uncached.length) {
        const url = uncached[index++];
        await preloadSingleImage(url);
        onProgress(++loaded, total);
      }
    })
  );
}

export function useImagePreloader(urls: string[]): PreloaderState {
  // A value key prevents fresh but equivalent URL arrays from restarting work.
  const key = JSON.stringify([...new Set(urls)]);
  const [state, setState] = useState<PreloaderState>({
    loaded: 0,
    total: 0,
    progress: 0,
    isComplete: false,
  });
  useEffect(() => {
    let cancelled = false;
    void preloadImagesWithProgress(
      JSON.parse(key) as string[],
      (loaded, total) => {
        if (!cancelled) {
          setState({
            loaded,
            total,
            progress: total ? loaded / total : 1,
            isComplete: loaded === total,
          });
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [key]);
  return state;
}

/** Ready as soon as assets finish; the deadline only bounds slow requests. */
export function usePreloadGate(
  urls: string[],
  maxWaitMs = 2000
): PreloaderState & { isReady: boolean } {
  const preloader = useImagePreloader(urls);
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDeadlinePassed(true), maxWaitMs);
    return () => clearTimeout(timer);
  }, [maxWaitMs]);
  return { ...preloader, isReady: preloader.isComplete || deadlinePassed };
}

/** Asset-driven handoff with a bounded deadline and one paint before reveal. */
export function useBattleLoadingGate(
  getUrls: () => string[],
  maxWaitMs = 2200,
  onReady: () => void
) {
  const [active, setActive] = useState(false);
  const [counts, setCounts] = useState({ loaded: 0, total: 0 });
  const readyCallbackRef = useRef(onReady);
  readyCallbackRef.current = onReady;
  const sessionRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef(0);
  const clearPending = useCallback(() => {
    sessionRef.current++;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    cancelAnimationFrame(frameRef.current);
  }, []);
  useEffect(() => clearPending, [clearPending]);

  const trigger = useCallback(() => {
    clearPending();
    const session = sessionRef.current;
    setActive(true);
    setCounts({ loaded: 0, total: 0 });
    let handedOff = false;
    const finish = () => {
      if (sessionRef.current !== session || handedOff) {
        return;
      }
      handedOff = true;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      readyCallbackRef.current();
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = requestAnimationFrame(() => {
          if (sessionRef.current === session) {
            setActive(false);
          }
        });
      });
    };
    timerRef.current = setTimeout(finish, maxWaitMs);
    void preloadImagesWithProgress(getUrls(), (loaded, total) => {
      if (sessionRef.current === session) {
        setCounts({ loaded, total });
      }
    }).then(finish);
  }, [clearPending, getUrls, maxWaitMs]);

  const cancel = useCallback(() => {
    clearPending();
    setActive(false);
  }, [clearPending]);
  return {
    active,
    cancel,
    ...counts,
    progress: counts.total ? counts.loaded / counts.total : 0,
    trigger,
  };
}
