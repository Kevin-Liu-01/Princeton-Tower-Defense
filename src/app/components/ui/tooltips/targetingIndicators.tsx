"use client";

import { Crosshair, Flame, Rocket, Target, Users, Zap } from "lucide-react";
import React from "react";

import type { MapTheme } from "../../../constants/maps";
import { getSentinelPalette } from "../../../rendering/towers/sentinelTheme";
import type { SpellType } from "../../../types";
import { GOLD, panelGradient } from "../system/theme";

const INDICATOR_TOP_BASE = 80;
const INDICATOR_TOP_PAYDAY_OFFSET = 68;
const INDICATOR_CLASS =
  "absolute left-1/2 transform -translate-x-1/2 px-4 py-2 shadow-xl rounded-lg animate-pulse backdrop-blur-sm";

function getIndicatorTop(paydayActive: boolean): number {
  return paydayActive
    ? INDICATOR_TOP_BASE + INDICATOR_TOP_PAYDAY_OFFSET
    : INDICATOR_TOP_BASE;
}

export const PlacingTroopIndicator: React.FC<{ paydayActive?: boolean }> = ({
  paydayActive = false,
}) => (
  <div
    className={INDICATOR_CLASS}
    style={{
      background: panelGradient,
      border: `1.5px solid ${GOLD.border30}`,
      boxShadow: `0 0 20px ${GOLD.glow07}`,
      top: getIndicatorTop(paydayActive),
      zIndex: 150,
    }}
  >
    <div className="text-sm font-bold flex items-center gap-2 tracking-wide">
      <Users size={16} className="text-purple-400" />
      <span className="text-purple-100">Click to Deploy Reinforce</span>
      <span className="text-purple-400 text-xs">
        (3 Knights with 500 HP each)
      </span>
    </div>
  </div>
);

const SPELL_TARGET_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
    borderColor: string;
    bgGrad: string;
    glowColor: string;
  }
> = {
  fireball: {
    bgGrad: "linear-gradient(135deg, rgba(120,50,10,0.92), rgba(60,25,5,0.88))",
    borderColor: "rgba(234,88,12,0.6)",
    color: "text-orange-100",
    glowColor: "0 0 20px rgba(234,88,12,0.4)",
    icon: <Flame size={16} className="text-orange-400" />,
    label: "Click to Target Meteor Shower",
  },
  lightning: {
    bgGrad:
      "linear-gradient(135deg, rgba(120,100,10,0.92), rgba(60,50,5,0.88))",
    borderColor: "rgba(234,179,8,0.6)",
    color: "text-yellow-100",
    glowColor: "0 0 20px rgba(234,179,8,0.4)",
    icon: <Zap size={16} className="text-yellow-400" />,
    label: "Click to Target Chain Lightning",
  },
};

export const TargetingSpellIndicator: React.FC<{
  spellType: SpellType;
  paydayActive?: boolean;
}> = ({ spellType, paydayActive = false }) => {
  const config = SPELL_TARGET_CONFIG[spellType];
  if (!config) {
    return null;
  }

  return (
    <div
      className={INDICATOR_CLASS}
      style={{
        background: config.bgGrad,
        border: `1.5px solid ${config.borderColor}`,
        boxShadow: config.glowColor,
        top: getIndicatorTop(paydayActive),
        zIndex: 150,
      }}
    >
      <div className="text-sm font-bold flex items-center gap-2 tracking-wide">
        {config.icon}
        <span className={config.color}>{config.label}</span>
        <Target size={14} className="text-stone-400" />
      </div>
    </div>
  );
};

export const MissileTargetingIndicator: React.FC<{
  paydayActive?: boolean;
}> = ({ paydayActive = false }) => (
  <div
    className={INDICATOR_CLASS}
    style={{
      background:
        "linear-gradient(135deg, rgba(120,55,0,0.94), rgba(60,28,0,0.9))",
      border: "1.5px solid rgba(255,140,0,0.6)",
      boxShadow:
        "0 0 24px rgba(255,100,0,0.35), inset 0 0 12px rgba(255,140,0,0.08)",
      top: getIndicatorTop(paydayActive),
      zIndex: 150,
    }}
  >
    <div className="text-sm font-bold flex items-center gap-2 tracking-wide">
      <Rocket size={16} className="text-orange-400" />
      <span className="text-orange-100">Select Strike Zone</span>
      <span className="text-orange-400/70 text-[10px] font-medium ml-1">
        Click to confirm target
      </span>
      <Crosshair size={14} className="text-orange-500/60" />
    </div>
  </div>
);

export const SentinelTargetingIndicator: React.FC<{
  paydayActive?: boolean;
  mapTheme?: MapTheme;
}> = ({ paydayActive = false, mapTheme }) => {
  const pal = getSentinelPalette(mapTheme);
  const { crystalR: r, crystalG: g, crystalB: b } = pal;
  const bgDark = `rgba(${Math.round(r * 0.39)},${Math.round(g * 0.09)},${Math.round(b * 0.12)},0.94)`;
  const bgDeep = `rgba(${Math.round(r * 0.22)},${Math.round(g * 0.05)},${Math.round(b * 0.06)},0.9)`;
  const border = `rgba(${r},${g},${b},0.6)`;
  const shadow = `0 0 24px rgba(${r},${g},${b},0.35), inset 0 0 12px rgba(${r},${g},${b},0.08)`;
  const iconColor = { color: `rgb(${r},${g},${b})` };
  const textColor = {
    color: `rgba(${Math.min(255, r + 60)},${Math.min(255, g + 60)},${Math.min(255, b + 60)},1)`,
  };
  const subtextColor = { color: `rgba(${r},${g},${b},0.7)` };
  const crosshairColor = { color: `rgba(${r},${g},${b},0.6)` };

  return (
    <div
      className={INDICATOR_CLASS}
      style={{
        background: `linear-gradient(135deg, ${bgDark}, ${bgDeep})`,
        border: `1.5px solid ${border}`,
        boxShadow: shadow,
        top: getIndicatorTop(paydayActive),
        zIndex: 150,
      }}
    >
      <div className="text-sm font-bold flex items-center gap-2 tracking-wide">
        <Target size={16} style={iconColor} />
        <span style={textColor}>Lock Sentinel Strike Point</span>
        <span className="text-[10px] font-medium ml-1" style={subtextColor}>
          Click to set coordinates
        </span>
        <Crosshair size={14} style={crosshairColor} />
      </div>
    </div>
  );
};
