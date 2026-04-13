"use client";

import {
  Activity,
  Flame,
  Home,
  Lock,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import React from "react";

import type { MapTheme } from "../../../constants/maps";
import {
  getSentinelName,
  getSentinelPalette,
} from "../../../rendering/towers/sentinelTheme";
import { SpecialTowerSprite } from "../../../sprites";
import type { Position } from "../../../types";
import { GOLD, PANEL, dividerGradient, panelGradient } from "../system/theme";
import { getTooltipPosition } from "./tooltipPositioning";

interface SpecialBuildingTooltipProps {
  type:
    | "vault"
    | "beacon"
    | "shrine"
    | "barracks"
    | "chrono_relay"
    | "sentinel_nexus"
    | "sunforge_orrery";
  hp: number | null;
  maxHp?: number;
  position: Position;
  sentinelTarget?: Position | null;
  sentinelTargeting?: boolean;
  mapTheme?: MapTheme;
}

interface SpecialTheme {
  border: string;
  glow: string;
  headerBg: string;
  accentLine: string;
  statBorder: string;
  statGlow: string;
  nameClass: string;
  labelClass: string;
}

const SPECIAL_THEMES: Record<string, SpecialTheme> = {
  barracks: {
    accentLine: "rgba(248,113,113,0.6)",
    border: "rgba(248,113,113,0.45)",
    glow: "rgba(248,113,113,0.1)",
    headerBg: "rgba(50,15,15,0.25)",
    labelClass: "text-red-400/60",
    nameClass: "text-red-200",
    statBorder: "rgba(248,113,113,0.25)",
    statGlow: "rgba(248,113,113,0.06)",
  },
  beacon: {
    accentLine: "rgba(34,211,238,0.6)",
    border: "rgba(34,211,238,0.45)",
    glow: "rgba(34,211,238,0.1)",
    headerBg: "rgba(10,40,50,0.25)",
    labelClass: "text-cyan-400/60",
    nameClass: "text-cyan-200",
    statBorder: "rgba(34,211,238,0.25)",
    statGlow: "rgba(34,211,238,0.06)",
  },
  chrono_relay: {
    accentLine: "rgba(165,180,252,0.6)",
    border: "rgba(165,180,252,0.45)",
    glow: "rgba(165,180,252,0.1)",
    headerBg: "rgba(25,20,50,0.25)",
    labelClass: "text-indigo-400/60",
    nameClass: "text-indigo-200",
    statBorder: "rgba(165,180,252,0.25)",
    statGlow: "rgba(165,180,252,0.06)",
  },
  shrine: {
    accentLine: "rgba(74,222,128,0.6)",
    border: "rgba(74,222,128,0.45)",
    glow: "rgba(74,222,128,0.1)",
    headerBg: "rgba(10,45,20,0.25)",
    labelClass: "text-green-400/60",
    nameClass: "text-green-200",
    statBorder: "rgba(74,222,128,0.25)",
    statGlow: "rgba(74,222,128,0.06)",
  },
  sunforge_orrery: {
    accentLine: "rgba(251,146,60,0.6)",
    border: "rgba(251,146,60,0.45)",
    glow: "rgba(251,146,60,0.1)",
    headerBg: "rgba(50,25,10,0.25)",
    labelClass: "text-orange-400/60",
    nameClass: "text-orange-200",
    statBorder: "rgba(251,146,60,0.25)",
    statGlow: "rgba(251,146,60,0.06)",
  },
  vault: {
    accentLine: "rgba(234,179,8,0.6)",
    border: "rgba(234,179,8,0.45)",
    glow: "rgba(234,179,8,0.1)",
    headerBg: "rgba(60,45,10,0.25)",
    labelClass: "text-yellow-400/60",
    nameClass: "text-yellow-200",
    statBorder: "rgba(234,179,8,0.25)",
    statGlow: "rgba(234,179,8,0.06)",
  },
};

function getSentinelTheme(mapTheme?: MapTheme): SpecialTheme {
  const sp = getSentinelPalette(mapTheme);
  const { crystalR: r, crystalG: g, crystalB: b } = sp;
  return {
    accentLine: `rgba(${r},${g},${b},0.6)`,
    border: `rgba(${r},${g},${b},0.45)`,
    glow: `rgba(${r},${g},${b},0.1)`,
    headerBg: `rgba(${Math.round(r * 0.1)},${Math.round(g * 0.1)},${Math.round(b * 0.1)},0.25)`,
    labelClass: "text-amber-400/60",
    nameClass: "text-amber-200",
    statBorder: `rgba(${r},${g},${b},0.25)`,
    statGlow: `rgba(${r},${g},${b},0.06)`,
  };
}

export const SpecialBuildingTooltip: React.FC<SpecialBuildingTooltipProps> = ({
  type,
  hp,
  maxHp,
  position,
  sentinelTarget,
  sentinelTargeting,
  mapTheme,
}) => {
  const theme =
    type === "sentinel_nexus"
      ? getSentinelTheme(mapTheme)
      : SPECIAL_THEMES[type] || SPECIAL_THEMES.vault;

  const info = {
    barracks: {
      desc: "Automated Garrison. Periodically deploys up to 3 armored knights to defend the road.",
      icon: <Home className="text-red-400" size={16} />,
      label: "Garrison",
      name: "Frontier Barracks",
      stat: "3x Knights Cap",
    },
    beacon: {
      desc: "Energy Spire. Emits a resonance field that boosts the range of all nearby towers and troop deployment range by 20%.",
      icon: <Zap className="text-cyan-400" size={16} />,
      label: "Aura Tower",
      name: "Ancient Beacon",
      stat: "+20% Range & Deploy Buff",
    },
    chrono_relay: {
      desc: "Temporal crystal lattice. Nearby towers lock to its cadence and fire faster.",
      icon: <Timer className="text-indigo-300" size={16} />,
      label: "Temporal Aura",
      name: "Arcane Time Crystal",
      stat: "+Attack Speed Aura",
    },
    sentinel_nexus: (() => {
      const sp = getSentinelPalette(mapTheme);
      return {
        desc: "Ancient laser-guided strike core. Periodically calls lightning at a locked map coordinate.",
        icon: <Activity style={{ color: `rgb(${sp.hotRgb})` }} size={16} />,
        label: "Strike Beacon",
        name: getSentinelName(mapTheme),
        stat: "Retargetable Strike Beacon",
      };
    })(),
    shrine: {
      desc: "Restoration Point. Periodically emits an arcane pulse that heals the Hero and nearby Troops.",
      icon: <Sparkles className="text-green-400" size={16} />,
      label: "Healing Structure",
      name: "Eldritch Shrine",
      stat: "Healing Aura",
    },
    sunforge_orrery: {
      desc: "Offensive astral furnace. Periodically computes enemy density and launches tri-plasma barrages.",
      icon: <Flame className="text-orange-300" size={16} />,
      label: "Siege Weapon",
      name: "Sunforge Orrery",
      stat: "Cluster Erasure Barrage",
    },
    vault: {
      desc: "Critical Objective. If destroyed, you lose 10 lives instantly. Enemies will prioritize attacking this!",
      icon: <Lock className="text-yellow-400" size={16} />,
      label: "Objective",
      name: "Treasury Vault",
      stat: "Protect at all costs",
    },
  }[type];

  const coords = getTooltipPosition(position, {
    height: 240,
    offsetX: 24,
    offsetY: -40,
    width: 300,
  });

  const hpPercent = hp !== null && maxHp ? (hp / maxHp) * 100 : 100;
  const hpBarClass =
    hpPercent > 66
      ? "from-emerald-600 to-emerald-400"
      : hpPercent > 33
        ? "from-amber-600 to-amber-400"
        : "from-red-600 to-red-400";

  return (
    <div
      className="fixed pointer-events-none shadow-2xl rounded-xl backdrop-blur-md z-[300] overflow-hidden"
      style={{
        background: panelGradient,
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 0 28px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        left: coords.left,
        top: coords.top,
        width: 300,
      }}
    >
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.accentLine}, transparent)`,
        }}
      />

      <div
        className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
        style={{
          border: `1px solid ${theme.border.replace("0.45)", "0.12)")}`,
        }}
      />

      <div
        className="flex items-center gap-3 px-3.5 py-2.5 relative z-10"
        style={{
          background: theme.headerBg,
          borderBottom: `1px solid ${theme.border.replace("0.45)", "0.2)")}`,
        }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{
            background: `linear-gradient(135deg, ${theme.border.replace("0.45)", "0.15)")}, ${theme.glow})`,
            border: `1px solid ${theme.border.replace("0.45)", "0.25)")}`,
          }}
        >
          {info.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`font-bold ${theme.nameClass} text-sm uppercase tracking-tight leading-tight truncate`}
          >
            {info.name}
          </h4>
          <div
            className={`text-[8px] ${theme.labelClass} uppercase tracking-[0.2em] mt-0.5 font-semibold`}
          >
            {info.label}
          </div>
        </div>
        <div className="shrink-0">
          <SpecialTowerSprite type={type} size={44} />
        </div>
      </div>

      <div className="px-3.5 py-2.5 relative z-10">
        <p className="text-[11px] text-amber-200/80 leading-relaxed">
          {info.desc}
        </p>

        {type === "sentinel_nexus" &&
          (() => {
            const sp = getSentinelPalette(mapTheme);
            const { crystalR: sr, crystalG: sg, crystalB: sb } = sp;
            return (
              <>
                <div
                  className="my-2 h-px"
                  style={{ background: dividerGradient }}
                />
                <div
                  className="rounded-lg px-3 py-2"
                  style={{
                    background: `rgba(${Math.round(sr * 0.12)},${Math.round(sg * 0.08)},${Math.round(sb * 0.1)},0.3)`,
                    border: `1px solid rgba(${sr},${sg},${sb},0.3)`,
                    boxShadow: `inset 0 0 10px rgba(${sr},${sg},${sb},0.06)`,
                  }}
                >
                  <div
                    className="text-[8px] uppercase tracking-[0.2em] mb-1 font-bold"
                    style={{ color: `rgba(${sr},${sg},${sb},0.7)` }}
                  >
                    Strike Target
                  </div>
                  <div
                    className="text-[11px] font-medium"
                    style={{
                      color: `rgba(${Math.min(255, sr + 60)},${Math.min(255, sg + 60)},${Math.min(255, sb + 60)},1)`,
                    }}
                  >
                    {sentinelTarget
                      ? `(${Math.round(sentinelTarget.x)}, ${Math.round(sentinelTarget.y)})`
                      : "Acquiring random target..."}
                  </div>
                  <div
                    className="text-[9px] mt-1"
                    style={{
                      color: `rgba(${Math.min(255, sr + 30)},${Math.min(255, sg + 30)},${Math.min(255, sb + 30)},0.6)`,
                    }}
                  >
                    {sentinelTargeting
                      ? "Click map to set strike target."
                      : "Click nexus, then click map to retarget."}
                  </div>
                </div>
              </>
            );
          })()}

        {hp !== null && maxHp && (
          <>
            <div
              className="my-2 h-px"
              style={{ background: dividerGradient }}
            />
            <div>
              <div className="flex justify-between text-[10px] mb-1.5 font-mono">
                <span className={theme.labelClass.replace("/60", "/80")}>
                  INTEGRITY
                </span>
                <span className="text-white/90">
                  {Math.ceil(hp)} / {maxHp}
                </span>
              </div>
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{
                  background: PANEL.bgDeep,
                  border: `1px solid ${theme.border.replace("0.45)", "0.15)")}`,
                }}
              >
                <div
                  className={`h-full bg-gradient-to-r ${hpBarClass} transition-all duration-300 rounded-full`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </>
        )}

        <div className="my-2 h-px" style={{ background: dividerGradient }} />

        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{
            background: PANEL.bgDeep,
            border: `1px solid ${theme.statBorder}`,
            boxShadow: `inset 0 0 10px ${theme.statGlow}`,
          }}
        >
          <Activity size={11} className={theme.nameClass} />
          <span
            className={`text-[10px] font-bold ${theme.nameClass} uppercase tracking-wide`}
          >
            {info.stat}
          </span>
        </div>
      </div>
    </div>
  );
};
