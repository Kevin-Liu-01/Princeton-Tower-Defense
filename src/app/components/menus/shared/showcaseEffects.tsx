"use client";

import React from "react";

interface FloatingParticlesProps {
  color: string;
  count?: number;
}

export function FloatingParticles({
  color,
  count = 6,
}: FloatingParticlesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="absolute w-1 h-1 rounded-full animate-float-particle"
          style={{
            background: color,
            left: `${15 + (index * 70) / count}%`,
            bottom: `${10 + (index % 3) * 15}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${2.5 + (index % 3) * 0.5}s`,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      ))}
    </div>
  );
}

interface RuneBackgroundProps {
  patternId: string;
  width?: number;
  height?: number;
  children: React.ReactNode;
}

export function RuneBackground({
  patternId,
  width = 60,
  height = 60,
  children,
}: RuneBackgroundProps) {
  return (
    <div className="absolute inset-0 pointer-events-none animate-rune-fade overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} x="0" y="0" width={width} height={height} patternUnits="userSpaceOnUse">
            {children}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
