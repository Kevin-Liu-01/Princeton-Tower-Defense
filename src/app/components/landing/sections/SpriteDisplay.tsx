"use client";
import React from "react";

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
  const scaleFactor = 1 / canvasScale;

  return (
    <div
      className="relative"
      style={{
        width: visualSize,
        height: visualSize,
        overflow: "visible",
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
