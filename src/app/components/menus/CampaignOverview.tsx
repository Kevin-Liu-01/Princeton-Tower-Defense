"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import {
  Star,
  Swords,
  Heart,
  Trophy,
  Clock,
  ChevronRight,
  MapPin,
  Map,
  Crown,
} from "lucide-react";
import type { LevelStars } from "../../types";
import type { LevelStats } from "../../useLocalStorage";
import { LEVEL_DATA } from "../../constants";
import {
  PANEL,
  GOLD,
  AMBER_CARD,
  RED_CARD,
  BLUE_CARD,
  GREEN_CARD,
  NEUTRAL,
} from "../ui/theme";
import { WORLD_LEVELS, type LevelNode } from "./worldMapData";
import { RegionIcon } from "../../sprites";

interface RegionMeta {
  displayName: string;
  color: string;
  bgLight: string;
  bgDark: string;
  border: string;
  glow: string;
}

const REGION_META: Record<LevelNode["region"], RegionMeta> = {
  grassland: {
    displayName: "Princeton Grounds",
    color: "text-green-400",
    bgLight: "rgba(30,50,25,0.8)",
    bgDark: "rgba(20,35,18,0.65)",
    border: "rgba(80,160,60,0.45)",
    glow: "rgba(80,160,60,0.08)",
  },
  swamp: {
    displayName: "Mathey Marshes",
    color: "text-teal-400",
    bgLight: "rgba(20,40,38,0.8)",
    bgDark: "rgba(15,30,28,0.65)",
    border: "rgba(60,140,130,0.45)",
    glow: "rgba(60,140,130,0.08)",
  },
  desert: {
    displayName: "Stadium Sands",
    color: "text-amber-400",
    bgLight: "rgba(55,40,18,0.8)",
    bgDark: "rgba(40,28,12,0.65)",
    border: "rgba(180,140,50,0.45)",
    glow: "rgba(180,140,50,0.08)",
  },
  winter: {
    displayName: "Frist Frontier",
    color: "text-blue-400",
    bgLight: "rgba(25,35,50,0.8)",
    bgDark: "rgba(18,25,40,0.65)",
    border: "rgba(80,130,200,0.45)",
    glow: "rgba(80,130,200,0.08)",
  },
  volcanic: {
    displayName: "Dormitory Depths",
    color: "text-red-400",
    bgLight: "rgba(50,25,20,0.8)",
    bgDark: "rgba(35,18,15,0.65)",
    border: "rgba(180,70,50,0.45)",
    glow: "rgba(180,70,50,0.08)",
  },
};

const REGION_ORDER: LevelNode["region"][] = [
  "grassland",
  "swamp",
  "desert",
  "winter",
  "volcanic",
];

function getPreviewImage(levelId: string): string | undefined {
  return LEVEL_DATA[levelId]?.previewImage;
}

function MapPreviewBg({ src, fadeColor }: { src: string; fadeColor: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
      <Image
        src={src}
        alt=""
        fill
        sizes="400px"
        className="absolute right-0 top-0 !w-[65%] !left-auto object-cover object-center opacity-30"
        style={{ maskImage: "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, ${fadeColor} 30%, transparent 70%)`,
        }}
      />
    </div>
  );
}

interface CampaignOverviewProps {
  levelStars: LevelStars;
  levelStats: Record<string, LevelStats>;
  unlockedMaps: string[];
  onSelectLevel: (levelId: string) => void;
}

function computeRegionData(
  levelStars: LevelStars,
  unlockedMaps: Set<string>
) {
  return REGION_ORDER.map((region) => {
    const levels = WORLD_LEVELS.filter((l) => l.region === region && l.kind !== "sandbox");
    const stars = levels.reduce((s, l) => s + (levelStars[l.id] || 0), 0);
    const maxStars = levels.length * 3;
    const completed = levels.filter((l) => (levelStars[l.id] || 0) > 0).length;
    const unlocked = levels.filter((l) => unlockedMaps.has(l.id)).length;
    const targetLevel =
      levels.find((l) => unlockedMaps.has(l.id) && (levelStars[l.id] || 0) < 3) ??
      levels[0] ?? null;
    return { region, levels, stars, maxStars, completed, unlocked, total: levels.length, targetLevel };
  });
}

function findRecommendedLevel(
  levelStars: LevelStars,
  unlockedMaps: Set<string>
): LevelNode | null {
  const campaignLevels = WORLD_LEVELS.filter((l) => l.kind !== "sandbox");
  for (const level of campaignLevels) {
    if (unlockedMaps.has(level.id) && (levelStars[level.id] || 0) === 0) {
      return level;
    }
  }
  for (const level of campaignLevels) {
    if (unlockedMaps.has(level.id) && (levelStars[level.id] || 0) < 3) {
      return level;
    }
  }
  return null;
}

function findLastPlayedLevel(
  levelStats: Record<string, LevelStats>
): { id: string; stats: LevelStats } | null {
  let bestEntry: { id: string; stats: LevelStats } | null = null;
  let bestTimestamp = 0;
  for (const [id, stats] of Object.entries(levelStats)) {
    if (!stats.timesPlayed || stats.timesPlayed <= 0) continue;
    const playedAt = stats.lastPlayedAt ?? 0;
    if (!bestEntry || playedAt > bestTimestamp) {
      bestEntry = { id, stats };
      bestTimestamp = playedAt;
    }
  }
  return bestEntry;
}

export const CampaignOverview: React.FC<CampaignOverviewProps> = ({
  levelStars,
  levelStats,
  unlockedMaps,
  onSelectLevel,
}) => {
  const unlockedSet = useMemo(() => new Set(unlockedMaps), [unlockedMaps]);

  const regionData = useMemo(
    () => computeRegionData(levelStars, unlockedSet),
    [levelStars, unlockedSet]
  );

  const campaignLevels = WORLD_LEVELS.filter((l) => l.kind !== "sandbox");
  const totalStars = campaignLevels.reduce((a, l) => a + (levelStars[l.id] || 0), 0);
  const maxStars = campaignLevels.length * 3;
  const completedLevels = campaignLevels.filter((l) => (levelStars[l.id] || 0) > 0).length;
  const totalLevels = campaignLevels.length;

  const recommended = useMemo(
    () => findRecommendedLevel(levelStars, unlockedSet),
    [levelStars, unlockedSet]
  );

  const totalBattles = Object.values(levelStats).reduce((a, s) => a + (s.timesPlayed || 0), 0);
  const totalWins = Object.values(levelStats).reduce((a, s) => a + (s.timesWon || 0), 0);
  const totalHearts = Object.values(levelStats).reduce((a, s) => a + (s.bestHearts || 0), 0);
  const maxHearts = campaignLevels.length * 20;

  const lastPlayed = useMemo(() => findLastPlayedLevel(levelStats), [levelStats]);
  const lastPlayedLevel = lastPlayed
    ? WORLD_LEVELS.find((l) => l.id === lastPlayed.id)
    : null;

  const progressPct = maxStars > 0 ? (totalStars / maxStars) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-auto relative">
      {/* Decorative top-right corner image with gradient fade */}
      {recommended && getPreviewImage(recommended.id) && (
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none z-0 overflow-hidden">
          <Image
            src={getPreviewImage(recommended.id)!}
            alt=""
            fill
            sizes="192px"
            className="object-cover opacity-20"
            style={{
              maskImage:
                "radial-gradient(ellipse at 100% 0%, black 0%, rgba(0,0,0,0.5) 30%, transparent 65%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 100% 0%, black 0%, rgba(0,0,0,0.5) 30%, transparent 65%)",
            }}
          />
        </div>
      )}

      {/* Top divider */}
      <div
        className="h-px flex-shrink-0 relative z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD.border35} 30%, ${GOLD.bright50} 50%, ${GOLD.border35} 70%, transparent)`,
        }}
      />

      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-3 relative z-10"
        style={{ borderBottom: `1px solid ${GOLD.border25}` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <Map size={22} className="text-amber-400 drop-shadow-lg" />
          </div>
          <h2 className="text-lg font-bold text-amber-100 tracking-wide">
            CAMPAIGN
          </h2>
        </div>

        {/* Overall progress bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">
              Overall Progress
            </span>
            <span className="text-xs font-bold text-amber-200">
              {completedLevels}/{totalLevels} levels
            </span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden relative"
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
                boxShadow: "0 0 8px rgba(220,170,40,0.4)",
              }}
            />
            <div
              className="absolute inset-[1px] rounded-full pointer-events-none"
              style={{ border: `1px solid ${GOLD.innerBorder08}` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-amber-300 font-bold">
                {totalStars}
              </span>
              <span className="text-[10px] text-amber-600">/{maxStars}</span>
            </div>
            <span className="text-[10px] text-amber-500 font-medium">
              {Math.round(progressPct)}% complete
            </span>
          </div>
        </div>

        {/* Quick global stats row */}
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg relative"
            style={{
              background: `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`,
              border: `1px solid ${BLUE_CARD.border}`,
              boxShadow: `inset 0 0 8px ${BLUE_CARD.glow}`,
            }}
          >
            <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${BLUE_CARD.innerBorder}` }} />
            <Swords size={12} className="text-blue-400/80 shrink-0" />
            <span className="text-xs font-bold text-blue-300/90">
              {totalBattles}
            </span>
            <span className="text-[7px] text-blue-500/60 font-bold uppercase tracking-wider">Played</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg relative"
            style={{
              background: `linear-gradient(135deg, ${GREEN_CARD.bgLight}, ${GREEN_CARD.bgDark})`,
              border: `1px solid ${GREEN_CARD.border}`,
              boxShadow: `inset 0 0 8px ${GREEN_CARD.glow}`,
            }}
          >
            <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${GREEN_CARD.innerBorder}` }} />
            <Trophy size={12} className="text-emerald-400/80 shrink-0" />
            <span className="text-xs font-bold text-emerald-300/90">
              {totalWins}
            </span>
            <span className="text-[7px] text-emerald-500/60 font-bold uppercase tracking-wider">Wins</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg relative"
            style={{
              background: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
              border: `1px solid ${RED_CARD.border}`,
              boxShadow: `inset 0 0 8px ${RED_CARD.glow06}`,
            }}
          >
            <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder12}` }} />
            <Heart size={12} className="text-red-400 fill-red-400 shrink-0" />
            <span className="text-xs font-bold text-red-300/90">
              {totalHearts}
            </span>
            <span className="text-[8px] text-red-700 font-semibold">/{maxHearts}</span>
          </div>
        </div>
      </div>

      {/* Continue Campaign CTA */}
      {recommended && (
        <div className="flex-shrink-0 p-4 pb-2">
          <button
            onClick={() => onSelectLevel(recommended.id)}
            className="w-full group relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
            style={{
              background: `linear-gradient(135deg, rgba(170,120,20,0.85), rgba(130,85,15,0.85))`,
              border: `2px solid ${GOLD.accentBorder40}`,
              boxShadow: `0 0 16px ${GOLD.accentGlow10}, inset 0 0 12px ${GOLD.accentGlow08}`,
            }}
          >
            {getPreviewImage(recommended.id) && (
              <MapPreviewBg
                src={getPreviewImage(recommended.id)!}
                fadeColor="rgba(140,95,15,0.95)"
              />
            )}
            <div
              className="absolute inset-[2px] rounded-[10px] pointer-events-none"
              style={{ border: `1px solid ${GOLD.accentBorder15}` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative px-3 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Crown size={12} className="text-amber-300/80" />
                <span className="text-[9px] font-bold text-amber-300/90 uppercase tracking-[0.15em]">
                  Continue Campaign
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <RegionIcon type={recommended.region} size={36} framed />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <div className="text-sm font-bold text-amber-100 leading-tight">
                      {recommended.name}
                    </div>
                    <div className="text-[10px] text-amber-400/70 mt-0.5">
                      {REGION_META[recommended.region]?.displayName} &middot;{" "}
                      {recommended.difficulty === 1
                        ? "Easy"
                        : recommended.difficulty === 2
                          ? "Medium"
                          : "Hard"}
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-amber-300/80 shrink-0" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Region Breakdown */}
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(90deg, ${GOLD.border25}, transparent)`,
            }}
          />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
            Regions
          </span>
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${GOLD.border25})`,
            }}
          />
        </div>

        <div className="space-y-1.5">
          {regionData.map(({ region, stars, maxStars: rMax, completed, total, targetLevel }) => {
            const meta = REGION_META[region];
            const pct = rMax > 0 ? (stars / rMax) * 100 : 0;
            const isFullyComplete = stars === rMax;
            const regionPreview = targetLevel ? getPreviewImage(targetLevel.id) : undefined;
            return (
              <button
                key={region}
                onClick={() => {
                  const firstUnbeaten = WORLD_LEVELS.find(
                    (l) =>
                      l.region === region &&
                      unlockedSet.has(l.id) &&
                      (levelStars[l.id] || 0) < 3
                  );
                  const firstInRegion = WORLD_LEVELS.find(
                    (l) => l.region === region
                  );
                  if (firstUnbeaten) onSelectLevel(firstUnbeaten.id);
                  else if (firstInRegion) onSelectLevel(firstInRegion.id);
                }}
                className="w-full text-left rounded-lg overflow-hidden transition-all hover:brightness-110 relative"
                style={{
                  background: `linear-gradient(135deg, ${meta.bgLight}, ${meta.bgDark})`,
                  border: `1.5px solid ${meta.border}`,
                  boxShadow: `inset 0 0 10px ${meta.glow}`,
                }}
              >
                {regionPreview && (
                  <MapPreviewBg src={regionPreview} fadeColor={meta.bgLight} />
                )}
                <div
                  className="absolute inset-[2px] rounded-[6px] pointer-events-none"
                  style={{
                    border: `1px solid rgba(255,255,255,0.06)`,
                  }}
                />
                <div className="relative px-3 py-2.5 flex items-center gap-2.5">
                  <div className="shrink-0">
                    <RegionIcon type={region} size={32} framed />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-100 truncate">
                        {meta.displayName}
                      </span>
                      <span className="text-[10px] text-amber-400/70 font-medium ml-2 shrink-0">
                        {completed}/{total}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: isFullyComplete
                            ? "linear-gradient(90deg, rgba(220,170,40,0.9), rgba(250,200,60,0.95))"
                            : `linear-gradient(90deg, ${meta.border}, ${meta.border})`,
                          boxShadow: isFullyComplete
                            ? "0 0 6px rgba(220,170,40,0.5)"
                            : undefined,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Star
                      size={11}
                      className={
                        stars > 0
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-stone-600"
                      }
                    />
                    <span className="text-[10px] font-bold text-amber-300/80">
                      {stars}/{rMax}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Last Played */}
        {lastPlayedLevel && lastPlayed && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex-1 h-px"
                style={{
                  background: `linear-gradient(90deg, ${GOLD.border25}, transparent)`,
                }}
              />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Recent
              </span>
              <div
                className="flex-1 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${GOLD.border25})`,
                }}
              />
            </div>
            <button
              onClick={() => onSelectLevel(lastPlayed.id)}
              className="w-full text-left rounded-lg overflow-hidden transition-all hover:brightness-110 relative"
              style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${GOLD.border25}`,
                boxShadow: `inset 0 0 8px ${GOLD.glow04}`,
              }}
            >
              {getPreviewImage(lastPlayed.id) && (
                <MapPreviewBg
                  src={getPreviewImage(lastPlayed.id)!}
                  fadeColor={PANEL.bgWarmLight}
                />
              )}
              <div
                className="absolute inset-[2px] rounded-[6px] pointer-events-none"
                style={{ border: `1px solid ${GOLD.innerBorder08}` }}
              />
              <div className="relative px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-100">
                      {lastPlayedLevel.name}
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          (levelStars[lastPlayed.id] || 0) >= s
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-stone-600"
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  {lastPlayed.stats.bestHearts !== undefined && (
                    <span className="flex items-center gap-1 text-red-300/80">
                      <Heart size={10} className="fill-red-400 text-red-400" />
                      {lastPlayed.stats.bestHearts}/20
                    </span>
                  )}
                  {lastPlayed.stats.bestTime !== undefined && (
                    <span className="flex items-center gap-1 text-blue-300/80">
                      <Clock size={10} />
                      {Math.floor(lastPlayed.stats.bestTime / 60)}m{" "}
                      {lastPlayed.stats.bestTime % 60}s
                    </span>
                  )}
                  {lastPlayed.stats.timesPlayed !== undefined && (
                    <span className="flex items-center gap-1 text-amber-400/70">
                      <Swords size={10} />
                      {lastPlayed.stats.timesPlayed} plays
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Lore flavor at the bottom */}
        <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${GOLD.border25}` }}>
          <p className="text-[9px] text-amber-200/40 leading-relaxed italic text-center">
            &ldquo;The shadows gather at the gates. Ancient towers stand
            resolute, their arcane fires burning eternal against the
            darkness.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
