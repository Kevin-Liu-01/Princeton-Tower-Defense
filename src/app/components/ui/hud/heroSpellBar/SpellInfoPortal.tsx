"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SpellInfoPortalProps {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export const SpellInfoPortal: React.FC<SpellInfoPortalProps> = ({
  anchorRef,
  children,
}) => {
  const [position, setPosition] = useState<{ left: number; bottom: number } | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const panelWidth = 280;
    let left = centerX - panelWidth / 2;
    if (left < 8) left = 8;
    if (left + panelWidth > window.innerWidth - 8) {
      left = window.innerWidth - 8 - panelWidth;
    }
    setPosition({ left, bottom: window.innerHeight - rect.top + 10 });
  }, [anchorRef]);

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
