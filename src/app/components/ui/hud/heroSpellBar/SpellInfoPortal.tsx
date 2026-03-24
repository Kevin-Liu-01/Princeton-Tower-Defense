"use client";

import React, { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SpellInfoPortalProps {
  anchorEl: HTMLDivElement | null;
  children: React.ReactNode;
}

export const SpellInfoPortal: React.FC<SpellInfoPortalProps> = ({
  anchorEl,
  children,
}) => {
  const [position, setPosition] = useState<{ left: number; bottom: number } | null>(null);

  useLayoutEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const panelWidth = 280;
    let left = centerX - panelWidth / 2;
    if (left < 8) left = 8;
    if (left + panelWidth > window.innerWidth - 8) {
      left = window.innerWidth - 8 - panelWidth;
    }
    setPosition({ left, bottom: window.innerHeight - rect.top + 10 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!position || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed z-[85] pointer-events-none"
      style={{ left: position.left, bottom: position.bottom, width: 280 }}
    >
      {children}
    </div>,
    document.body,
  );
};
