"use client";
import { useState, useEffect } from "react";

// =============================================================================
// TOUCH DEVICE DETECTION HOOK
// =============================================================================

export const useIsTouchDevice = () => {
  // Initialize with immediate check (safe for SSR with typeof check)
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  });

  useEffect(() => {
    // Double-check on mount
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;

    if (isTouch) {
      setIsTouchDevice(true);
      return;
    }

    // Listen for first touch event - immediately switch to touch mode
    const onFirstTouch = () => {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', onFirstTouch);
      window.removeEventListener('pointerdown', onFirstPointerTouch);
    };
    window.addEventListener('touchstart', onFirstTouch, { passive: true });

    // BROWSER FIX: Also listen for pointer events with touch type
    // This catches Chrome on mobile which may not fire touchstart reliably
    const onFirstPointerTouch = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        setIsTouchDevice(true);
        window.removeEventListener('touchstart', onFirstTouch);
        window.removeEventListener('pointerdown', onFirstPointerTouch);
      }
    };
    window.addEventListener('pointerdown', onFirstPointerTouch, { passive: true });

    // Listen for pointer media query changes
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsTouchDevice(true);
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      window.removeEventListener('touchstart', onFirstTouch);
      window.removeEventListener('pointerdown', onFirstPointerTouch);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isTouchDevice;
};

// =============================================================================
// RESPONSIVE SPRITE SIZE HOOK
// =============================================================================

export interface ResponsiveSizes {
  heroIcon: number;      // Hero icon in HeroSpellBar
  heroIconLarge: number; // Hero icon in tooltips/larger contexts
  towerIcon: number;     // Tower icon in BuildMenu
  towerIconLarge: number; // Tower icon in tooltips/panels
  spellIcon: number;     // Spell icons
}

export const useResponsiveSizes = (): ResponsiveSizes => {
  const [sizes, setSizes] = useState<ResponsiveSizes>({
    heroIcon: 28,
    heroIconLarge: 40,
    towerIcon: 26,
    towerIconLarge: 40,
    spellIcon: 24,
  });

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;

      if (width >= 1536) {
        // 2xl screens
        setSizes({
          heroIcon: 48,
          heroIconLarge: 64,
          towerIcon: 44,
          towerIconLarge: 60,
          spellIcon: 40,
        });
      } else if (width >= 1280) {
        // xl screens
        setSizes({
          heroIcon: 42,
          heroIconLarge: 56,
          towerIcon: 38,
          towerIconLarge: 52,
          spellIcon: 36,
        });
      } else if (width >= 1024) {
        // lg screens
        setSizes({
          heroIcon: 36,
          heroIconLarge: 48,
          towerIcon: 34,
          towerIconLarge: 48,
          spellIcon: 32,
        });
      } else if (width >= 768) {
        // md screens
        setSizes({
          heroIcon: 32,
          heroIconLarge: 44,
          towerIcon: 30,
          towerIconLarge: 44,
          spellIcon: 28,
        });
      } else if (width >= 640) {
        // sm screens
        setSizes({
          heroIcon: 28,
          heroIconLarge: 40,
          towerIcon: 26,
          towerIconLarge: 40,
          spellIcon: 24,
        });
      } else {
        // xs screens (mobile)
        setSizes({
          heroIcon: 24,
          heroIconLarge: 36,
          towerIcon: 22,
          towerIconLarge: 36,
          spellIcon: 20,
        });
      }
    };

    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, []);

  return sizes;
};
