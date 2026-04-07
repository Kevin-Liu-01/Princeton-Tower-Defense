"use client";

import { Swords, Target, Gauge } from "lucide-react";
import React from "react";

import { HERO_DATA } from "../../../constants";
import type { Hero, Position } from "../../../types";
import { PANEL, GOLD, panelGradient } from "../system/theme";

interface HeroHoverTooltipProps {
  hero: Hero;
  position: Position;
}

export const HeroHoverTooltip: React.FC<HeroHoverTooltipProps> = ({
  hero,
  position,
}) => {
  const heroData = HERO_DATA[hero.type];
  const tooltipWidth = 220;

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
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
      style={{
        background: panelGradient,
        border: `1.5px solid ${GOLD.border30}`,
        boxShadow: `0 0 20px ${GOLD.glow07}, inset 0 0 10px ${GOLD.glow04}`,
        left: tooltipX,
        top: tooltipY,
        width: tooltipWidth,
        zIndex: 250,
      }}
    >
      <div
        className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
        style={{ border: `1px solid ${GOLD.innerBorder08}` }}
      />
      <div
        className="px-3 py-1.5 relative z-10"
        style={{
          background: PANEL.bgWarmMid,
          borderBottom: `1px solid ${GOLD.border25}`,
        }}
      >
        <div className="font-bold text-amber-200 text-sm">{heroData.name}</div>
        <div className="text-xs text-red-300">
          HP: {Math.floor(hero.hp)}/{hero.maxHp}
        </div>
      </div>

      <div className="px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
        <div className="flex items-center gap-1">
          <Swords size={11} className="text-red-400" />
          <span className="text-red-300 font-medium">{heroData.damage}</span>
        </div>
        <div className="flex items-center gap-1">
          <Target size={11} className="text-blue-400" />
          <span className="text-blue-300 font-medium">{heroData.range}</span>
        </div>
        <div className="flex items-center gap-1">
          <Gauge size={11} className="text-green-400" />
          <span className="text-green-300 font-medium">{heroData.speed}</span>
        </div>
      </div>
    </div>
  );
};
