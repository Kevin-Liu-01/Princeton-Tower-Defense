"use client";

import React from "react";
import { OrnateFrame } from "../OrnateFrame";

interface HudSurfaceProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const OVERLAY_SURFACE_STYLE = {
  background:
    "linear-gradient(180deg, rgba(52,36,20,0.78) 0%, rgba(24,16,9,0.9) 100%)",
  boxShadow:
    "0 14px 36px rgba(0,0,0,0.34), inset 0 0 22px rgba(245,158,11,0.06)",
  backdropFilter: "blur(10px)",
} as const;

export function HudSurface({
  children,
  className = "",
  contentClassName = "",
}: HudSurfaceProps) {
  return (
    <OrnateFrame
      className={`pointer-events-auto border border-amber-700/35 shadow-xl ${className}`}
      cornerSize={22}
      cornerVariant="compact"
      sideBorderVariant="compact"
      topBottomBorderVariant="compact"
      showBorders={true}
      showTopBottomBorders={true}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300/35 to-transparent" />
      <div className={contentClassName} style={OVERLAY_SURFACE_STYLE}>
        {children}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300/35 to-transparent" />
    </OrnateFrame>
  );
}
