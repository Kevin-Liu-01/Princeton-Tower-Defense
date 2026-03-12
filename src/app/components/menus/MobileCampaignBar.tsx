"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Star, Map as MapIcon } from "lucide-react";
import type { LevelStars } from "../../types";
import { GOLD, PANEL } from "../ui/theme";
import { WORLD_LEVELS, DEV_LEVEL_IDS, type LevelNode } from "./worldMapData";
import { RegionIcon } from "../../sprites";

const REGION_ORDER: LevelNode["region"][] = [
  "grassland",
  "swamp",
  "desert",
  "winter",
  "volcanic",
];

const REGION_META: Record<
  LevelNode["region"],
  { displayName: string; accent: string; border: string; bg: string }
> = {
  grassland: {
    displayName: "Princeton Grounds",
    accent: "#4ade80",
    border: "rgba(80,160,60,0.55)",
    bg: "rgba(30,50,25,0.85)",
  },
  swamp: {
    displayName: "Mathey Marshes",
    accent: "#2dd4bf",
    border: "rgba(60,140,130,0.55)",
    bg: "rgba(20,40,38,0.85)",
  },
  desert: {
    displayName: "Stadium Sands",
    accent: "#fbbf24",
    border: "rgba(180,140,50,0.55)",
    bg: "rgba(55,40,18,0.85)",
  },
  winter: {
    displayName: "Frist Frontier",
    accent: "#60a5fa",
    border: "rgba(80,130,200,0.55)",
    bg: "rgba(25,35,50,0.85)",
  },
  volcanic: {
    displayName: "Dormitory Depths",
    accent: "#f87171",
    border: "rgba(180,70,50,0.55)",
    bg: "rgba(50,25,20,0.85)",
  },
};

interface MobileCampaignBarProps {
  levelStars: LevelStars;
  unlockedMaps: string[];
  selectedLevel: string | null;
  onSelectLevel: (levelId: string) => void;
  isDevMode?: boolean;
}

function computeRegionStats(
  region: LevelNode["region"],
  levelStars: LevelStars,
  unlockedSet: Set<string>,
  isDevMode: boolean,
) {
  const levels = WORLD_LEVELS.filter(
    (l) => l.region === region && (isDevMode || !DEV_LEVEL_IDS.has(l.id)),
  );
  const stars = levels.reduce((s, l) => s + (levelStars[l.id] || 0), 0);
  const maxStars = levels.length * 3;
  const completed = levels.filter((l) => (levelStars[l.id] || 0) > 0).length;
  const target =
    levels.find(
      (l) => unlockedSet.has(l.id) && (levelStars[l.id] || 0) < 3,
    ) ?? levels[0];
  return { levels, stars, maxStars, completed, total: levels.length, target };
}

export const MobileCampaignBar: React.FC<MobileCampaignBarProps> = ({
  levelStars,
  unlockedMaps,
  selectedLevel,
  onSelectLevel,
  isDevMode = false,
}) => {
  const unlockedSet = useMemo(() => new Set(unlockedMaps), [unlockedMaps]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalStars = Object.values(levelStars).reduce((a, b) => a + b, 0);
  const maxStars = WORLD_LEVELS.length * 3;
  const progressPct = maxStars > 0 ? (totalStars / maxStars) * 100 : 0;

  const activeRegion = useMemo(() => {
    if (!selectedLevel) return null;
    const level = WORLD_LEVELS.find((l) => l.id === selectedLevel);
    return level?.region ?? null;
  }, [selectedLevel]);

  const regionStats = useMemo(
    () =>
      REGION_ORDER.map((region) => ({
        region,
        ...computeRegionStats(region, levelStars, unlockedSet, isDevMode),
      })),
    [levelStars, unlockedSet, isDevMode],
  );

  useEffect(() => {
    if (!activeRegion || !scrollRef.current) return;
    const idx = REGION_ORDER.indexOf(activeRegion);
    const pill = scrollRef.current.children[idx] as HTMLElement | undefined;
    if (pill) {
      pill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeRegion]);

  return (
    <div
      className="sm:hidden flex-shrink-0 px-2 pt-1.5 pb-1"
      style={{
        background: `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)`,
      }}
    >
      {/* Row 1: CAMPAIGN label + stars + progress bar */}
      <div className="flex items-center gap-2 mb-1.5">
        <MapIcon size={13} className="text-amber-400 shrink-0" />
        <span className="text-[10px] font-bold text-amber-100 tracking-wider uppercase">
          Campaign
        </span>

        {/* Inline progress bar */}
        <div
          className="flex-1 h-2 rounded-full overflow-hidden relative"
          style={{
            background: PANEL.bgDeep,
            border: `1px solid ${GOLD.border25}`,
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background:
                "linear-gradient(90deg, rgba(180,120,20,0.9), rgba(220,170,40,0.95), rgba(180,120,20,0.9))",
              boxShadow: "0 0 6px rgba(220,170,40,0.4)",
            }}
          />
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] font-bold text-amber-300">
            {totalStars}
          </span>
          <span className="text-[9px] text-amber-600">/{maxStars}</span>
        </div>
      </div>

      {/* Row 2: Horizontal scrollable region pills */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {regionStats.map(({ region, stars, maxStars: rMax, completed, total, target }) => {
          const meta = REGION_META[region];
          const isActive = activeRegion === region;
          const pct = rMax > 0 ? (stars / rMax) * 100 : 0;
          const isComplete = stars === rMax;

          return (
            <button
              key={region}
              onClick={() => {
                if (target) onSelectLevel(target.id);
              }}
              className="flex-shrink-0 flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-lg transition-all active:scale-95 relative overflow-hidden"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${meta.bg}, ${meta.bg.replace("0.85", "0.95")})`
                  : `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${isActive ? meta.border : GOLD.border25}`,
                boxShadow: isActive
                  ? `0 0 10px ${meta.border.replace("0.55", "0.2")}, inset 0 0 8px ${meta.border.replace("0.55", "0.1")}`
                  : "none",
              }}
            >
              <RegionIcon type={region} size={18} framed />
              <div className="flex flex-col items-start gap-0.5 min-w-0">
                <span
                  className="text-[9px] font-bold whitespace-nowrap leading-none"
                  style={{ color: isActive ? meta.accent : "rgba(252,211,77,0.8)" }}
                >
                  {meta.displayName}
                </span>
                <div className="flex items-center gap-1">
                  <div
                    className="w-12 h-1 rounded-full overflow-hidden"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: isComplete
                          ? "linear-gradient(90deg, rgba(220,170,40,0.9), rgba(250,200,60,0.95))"
                          : meta.border,
                      }}
                    />
                  </div>
                  <span className="text-[8px] text-amber-400/60 font-medium whitespace-nowrap">
                    {completed}/{total}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
