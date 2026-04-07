"use client";
import React from "react";

import { SPRITE_PAD } from "../../../sprites/hooks";

interface SpriteDisplayProps {
  visualSize: number;
  canvasScale?: number;
  children: React.ReactNode;
}

export function SpriteDisplay({
  visualSize,
  canvasScale = 1.6,
  children,
}: SpriteDisplayProps) {
  const scaleFactor = 1 / (canvasScale * SPRITE_PAD);

  return (
    <div
      className="relative"
      style={{
        height: visualSize,
        overflow: "visible",
        width: visualSize,
      }}
    >
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${scaleFactor})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
