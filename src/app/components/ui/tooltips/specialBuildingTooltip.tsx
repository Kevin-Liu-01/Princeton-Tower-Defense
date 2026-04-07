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
import type { Position } from "../../../types";
import { GOLD, PANEL, panelGradient } from "../system/theme";

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

export const SpecialBuildingTooltip: React.FC<SpecialBuildingTooltipProps> = ({
  type,
  hp,
  maxHp,
  position,
  sentinelTarget,
  sentinelTargeting,
  mapTheme,
}) => {
  const info = {
    barracks: {
      desc: "Automated Garrison. Periodically deploys up to 3 armored knights to defend the road.",
      icon: <Home className="text-red-400" size={18} />,
      name: "Frontier Barracks",
      stat: "3x Knights Cap",
    },
    beacon: {
      desc: "Energy Spire. Emits a resonance field that boosts the range of all nearby towers and troop deployment range by 20%.",
      icon: <Zap className="text-cyan-400" size={18} />,
      name: "Ancient Beacon",
      stat: "+20% Range & Deploy Buff",
    },
    chrono_relay: {
      desc: "Temporal crystal lattice. Nearby towers lock to its cadence and fire faster.",
      icon: <Timer className="text-indigo-300" size={18} />,
      name: "Arcane Time Crystal",
      stat: "+Attack Speed Aura",
    },
    sentinel_nexus: (() => {
      const sp = getSentinelPalette(mapTheme);
      return {
        desc: "Ancient laser-guided strike core. Periodically calls lightning at a locked map coordinate.",
        icon: <Activity style={{ color: `rgb(${sp.hotRgb})` }} size={18} />,
        name: getSentinelName(mapTheme),
        stat: "Retargetable Strike Beacon",
      };
    })(),
    shrine: {
      desc: "Restoration Point. Periodically emits an arcane pulse that heals the Hero and nearby Troops.",
      icon: <Sparkles className="text-green-400" size={18} />,
      name: "Eldritch Shrine",
      stat: "Healing Aura",
    },
    sunforge_orrery: {
      desc: "Offensive astral furnace. Periodically computes enemy density and launches tri-plasma barrages.",
      icon: <Flame className="text-orange-300" size={18} />,
      name: "Sunforge Orrery",
      stat: "Cluster Erasure Barrage",
    },
    vault: {
      desc: "Critical Objective. If destroyed, you lose 10 lives instantly. Enemies will prioritize attacking this!",
      icon: <Lock className="text-yellow-400" size={18} />,
      name: "Treasury Vault",
      stat: "Objective",
    },
  }[type];

  return (
    <div
      className="fixed pointer-events-none p-4 shadow-2xl rounded-xl w-64 backdrop-blur-md z-[300] overflow-hidden"
      style={{
        background: panelGradient,
        border: `2px solid ${GOLD.border35}`,
        boxShadow: `0 0 25px ${GOLD.glow07}, inset 0 0 15px ${GOLD.glow04}`,
        left: position.x + 20,
        top: position.y - 100,
      }}
    >
      <div
        className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
        style={{ border: `1px solid ${GOLD.innerBorder08}` }}
      />
      <div
        className="flex items-center gap-2 mb-2 pb-2"
        style={{ borderBottom: `1px solid ${GOLD.border25}` }}
      >
        {info.icon}
        <h4 className="font-bold text-amber-100 uppercase tracking-tight">
          {info.name}
        </h4>
      </div>

      <p className="text-[11px] text-amber-200/80 leading-relaxed mb-3">
        {info.desc}
      </p>

      {type === "sentinel_nexus" &&
        (() => {
          const sp = getSentinelPalette(mapTheme);
          const { crystalR: sr, crystalG: sg, crystalB: sb } = sp;
          return (
            <div
              className="mb-2 rounded-md px-2 py-1.5"
              style={{
                background: `rgba(${Math.round(sr * 0.15)},${Math.round(sg * 0.1)},${Math.round(sb * 0.12)},0.3)`,
                border: `1px solid rgba(${sr},${sg},${sb},0.4)`,
              }}
            >
              <div
                className="text-[9px] uppercase tracking-wider mb-1"
                style={{ color: `rgba(${sr},${sg},${sb},0.8)` }}
              >
                Target
              </div>
              <div
                className="text-[10px]"
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
                  color: `rgba(${Math.min(255, sr + 30)},${Math.min(255, sg + 30)},${Math.min(255, sb + 30)},0.7)`,
                }}
              >
                {sentinelTargeting
                  ? "Click map to set strike target."
                  : "Click nexus, then click map to retarget."}
              </div>
            </div>
          );
        })()}

      {hp !== null && maxHp && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] mb-1 font-mono">
            <span className="text-amber-400">INTEGRITY</span>
            <span className="text-white">
              {Math.ceil(hp)} / {maxHp}
            </span>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full border border-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-300"
              style={{ width: `${(hp / maxHp) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded"
        style={{
          background: PANEL.bgDeep,
          border: `1px solid ${GOLD.border25}`,
        }}
      >
        <Activity size={12} className="text-amber-400" />
        <span className="text-[10px] font-bold text-amber-300 uppercase">
          {info.stat}
        </span>
      </div>
    </div>
  );
};
