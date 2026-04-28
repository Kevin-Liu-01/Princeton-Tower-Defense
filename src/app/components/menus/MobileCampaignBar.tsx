"use client";

import { Star, Map as MapIcon } from "lucide-react";
import React, { memo, useMemo, useRef, useEffect } from "react";

import { RegionIcon } from "../../sprites";
import type { LevelStars } from "../../types";
import { GOLD, PANEL } from "../ui/system/theme";
import {
  REGION_META,
  REGION_ORDER,
  getCampaignLevels,
  getRegionProgressList,
} from "./shared/worldMapRegions";
import { WORLD_LEVELS } from "./world-map/worldMapData";

interface MobileCampaignBarProps {
  levelStars: LevelStars;
  unlockedMaps: string[];
  selectedLevel: string | null;
  onSelectLevel: (levelId: string) => void;
  isDevMode?: boolean;
}

export const MobileCampaignBar = memo(function MobileCampaignBar({
  levelStars,
  unlockedMaps,
  selectedLevel,
  onSelectLevel,
  isDevMode = false,
}: MobileCampaignBarProps) {
  const unlockedSet = useMemo(() => new Set(unlockedMaps), [unlockedMaps]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const campaignLevels = useMemo(
    () => getCampaignLevels(isDevMode),
    [isDevMode]
  );
  const totalStars = useMemo(
    () => campaignLevels.reduce((a, l) => a + (levelStars[l.id] || 0), 0),
    [campaignLevels, levelStars]
  );
  const maxStars = campaignLevels.length * 3;
  const progressPct = maxStars > 0 ? (totalStars / maxStars) * 100 : 0;

  const activeRegion = useMemo(() => {
    if (!selectedLevel) {
      return null;
    }
    const level = WORLD_LEVELS.find((l) => l.id === selectedLevel);
    return level?.region ?? null;
  }, [selectedLevel]);

  const regionStats = useMemo(
    () => getRegionProgressList(levelStars, unlockedSet, isDevMode),
    [levelStars, unlockedSet, isDevMode]
  );

  useEffect(() => {
    if (!activeRegion || !scrollRef.current) {
      return;
    }
    const idx = REGION_ORDER.indexOf(activeRegion);
    const pill = scrollRef.current.children[idx] as HTMLElement | undefined;
    if (pill) {
      pill.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
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
              background:
                "linear-gradient(90deg, rgba(180,120,20,0.9), rgba(220,170,40,0.95), rgba(180,120,20,0.9))",
              boxShadow: "0 0 6px rgba(220,170,40,0.4)",
              width: `${progressPct}%`,
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
        {regionStats.map(
          ({
            region,
            stars,
            maxStars: rMax,
            completed,
            total,
            targetLevel,
          }) => {
            const meta = REGION_META[region];
            const isActive = activeRegion === region;
            const pct = rMax > 0 ? (stars / rMax) * 100 : 0;
            const isComplete = stars === rMax;

            return (
              <button
                key={region}
                onClick={() => {
                  if (targetLevel) {
                    onSelectLevel(targetLevel.id);
                  }
                }}
                className="flex-shrink-0 flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-lg transition-all active:scale-95 relative overflow-hidden"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${meta.bg}, ${meta.bgDark})`
                    : `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                  border: `1.5px solid ${isActive ? meta.border : GOLD.border25}`,
                  boxShadow: isActive
                    ? `0 0 10px ${meta.glow}, inset 0 0 8px ${meta.glow}`
                    : "none",
                }}
              >
                <RegionIcon type={region} size={18} framed />
                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <span
                    className="text-[9px] font-bold whitespace-nowrap leading-none"
                    style={{
                      color: isActive ? meta.accent : "rgba(252,211,77,0.8)",
                    }}
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
                          background: isComplete
                            ? "linear-gradient(90deg, rgba(220,170,40,0.9), rgba(250,200,60,0.95))"
                            : meta.border,
                          width: `${pct}%`,
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
          }
        )}
      </div>
    </div>
  );
});

MobileCampaignBar.displayName = "MobileCampaignBar";
