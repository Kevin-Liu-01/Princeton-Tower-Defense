"use client";
import { useState, useEffect } from "react";

export const useIsTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches
    );
  });

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    if (isTouch) {
      setIsTouchDevice(true);
      return;
    }

    const onFirstTouch = () => {
      setIsTouchDevice(true);
      window.removeEventListener("touchstart", onFirstTouch);
      window.removeEventListener("pointerdown", onFirstPointerTouch);
    };
    window.addEventListener("touchstart", onFirstTouch, { passive: true });

    const onFirstPointerTouch = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        setIsTouchDevice(true);
        window.removeEventListener("touchstart", onFirstTouch);
        window.removeEventListener("pointerdown", onFirstPointerTouch);
      }
    };
    window.addEventListener("pointerdown", onFirstPointerTouch, {
      passive: true,
    });

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsTouchDevice(true);
      }
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      window.removeEventListener("touchstart", onFirstTouch);
      window.removeEventListener("pointerdown", onFirstPointerTouch);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isTouchDevice;
};

export interface ResponsiveSizes {
  heroIcon: number;
  heroIconLarge: number;
  towerIcon: number;
  towerIconLarge: number;
  spellIcon: number;
}

export const useResponsiveSizes = (): ResponsiveSizes => {
  const [sizes, setSizes] = useState<ResponsiveSizes>({
    heroIcon: 28,
    heroIconLarge: 48,
    towerIcon: 34,
    towerIconLarge: 48,
    spellIcon: 24,
  });

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;

      if (width >= 1536) {
        setSizes({
          heroIcon: 48,
          heroIconLarge: 72,
          towerIcon: 56,
          towerIconLarge: 72,
          spellIcon: 40,
        });
      } else if (width >= 1280) {
        setSizes({
          heroIcon: 42,
          heroIconLarge: 64,
          towerIcon: 50,
          towerIconLarge: 64,
          spellIcon: 36,
        });
      } else if (width >= 1024) {
        setSizes({
          heroIcon: 36,
          heroIconLarge: 60,
          towerIcon: 44,
          towerIconLarge: 60,
          spellIcon: 32,
        });
      } else if (width >= 768) {
        setSizes({
          heroIcon: 32,
          heroIconLarge: 56,
          towerIcon: 40,
          towerIconLarge: 56,
          spellIcon: 28,
        });
      } else if (width >= 640) {
        setSizes({
          heroIcon: 28,
          heroIconLarge: 52,
          towerIcon: 34,
          towerIconLarge: 52,
          spellIcon: 24,
        });
      } else {
        setSizes({
          heroIcon: 24,
          heroIconLarge: 48,
          towerIcon: 30,
          towerIconLarge: 48,
          spellIcon: 20,
        });
      }
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  return sizes;
};
