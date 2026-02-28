"use client";

import React from "react";
import type { Hero, Position } from "../../types";
import { HERO_DATA } from "../../constants";

interface HeroHoverTooltipProps {
  hero: Hero;
  position: Position;
}

export const HeroHoverTooltip: React.FC<HeroHoverTooltipProps> = ({
  hero,
  position,
}) => {
  const heroData = HERO_DATA[hero.type];
  const tooltipWidth = 200;

  let tooltipX = position.x + 20;
  let tooltipY = position.y - 30;

  if (tooltipX + tooltipWidth > window.innerWidth - 10) {
    tooltipX = position.x - tooltipWidth - 20;
  }

  if (tooltipY < 60) {
    tooltipY = 60;
  }

  return (
    <div
      className="fixed pointer-events-none bg-gradient-to-r from-amber-900/95 via-yellow-900/95 to-amber-900/95 border border-amber-500/70 shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{ left: tooltipX, top: tooltipY, zIndex: 250, width: tooltipWidth }}
    >
      <div className="bg-amber-900/40 px-3 py-1.5 border-b border-amber-700/50">
        <div className="font-bold text-amber-200 text-sm">{heroData.name}</div>
        <div className="text-xs text-red-300">
          HP: {Math.floor(hero.hp)}/{hero.maxHp}
        </div>
      </div>

      <div className="px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="text-orange-400">⚔</span>
          <span className="text-orange-300 font-medium">{heroData.damage}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-400">◎</span>
          <span className="text-blue-300 font-medium">{heroData.range}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-green-400">»</span>
          <span className="text-green-300 font-medium">{heroData.speed}</span>
        </div>
      </div>
    </div>
  );
};
