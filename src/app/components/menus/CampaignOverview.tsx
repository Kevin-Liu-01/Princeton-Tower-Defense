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
  Eye,
} from "lucide-react";
import type { LevelStars } from "../../types";
import type { LevelStats } from "../../hooks/useLocalStorage";
import { LEVEL_DATA } from "../../constants";
import {
  PANEL,
  GOLD,
} from "../ui/system/theme";
import { WORLD_LEVELS } from "./world-map/worldMapData";
import { RegionIcon } from "../../sprites";
import {
  REGION_META,
  findLastPlayedLevel,
  findRecommendedLevel,
  getCampaignLevels,
  getRegionProgressList,
} from "./shared/worldMapRegions";

function getPreviewImage(levelId: string): string | undefined {
  return LEVEL_DATA[levelId]?.previewImage;
}

function MapPreviewBg({ src, fadeColor }: { src: string; fadeColor: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute right-0 top-0 h-full w-[65%] object-cover object-center opacity-30"
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

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(90deg, ${GOLD.border25}, transparent)`,
        }}
      />
      <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-[0.2em]">
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD.border25})`,
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
  onTogglePreview?: () => void;
}

export const CampaignOverview: React.FC<CampaignOverviewProps> = ({
  levelStars,
  levelStats,
  unlockedMaps,
  onSelectLevel,
  onTogglePreview,
}) => {
  const unlockedSet = useMemo(() => new Set(unlockedMaps), [unlockedMaps]);

  const regionData = useMemo(
    () => getRegionProgressList(levelStars, unlockedSet),
    [levelStars, unlockedSet]
  );

  const campaignLevels = getCampaignLevels();
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

  const lastPlayed = useMemo(() => findLastPlayedLevel(levelStats), [levelStats]);
  const lastPlayedLevel = lastPlayed
    ? WORLD_LEVELS.find((l) => l.id === lastPlayed.id)
    : null;

  const progressPct = maxStars > 0 ? (totalStars / maxStars) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-auto relative">

      {/* Top divider */}
      <div
        className="h-px flex-shrink-0 relative z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD.border35} 30%, ${GOLD.bright50} 50%, ${GOLD.border35} 70%, transparent)`,
        }}
      />

      {/* ═══════════════════════════════════════════════════
          HEADER: Campaign title + star badge + progress
          ═══════════════════════════════════════════════════ */}
      <div
        className="flex-shrink-0 px-3.5 pt-3 pb-2.5 relative z-10 overflow-hidden"
        style={{ borderBottom: `1px solid ${GOLD.border25}` }}
      >
        {/* Faint missile background image */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <Image
            src="/images/new/gameplay_missile1.png"
            alt=""
            fill
            sizes="300px"
            className="object-cover opacity-[0.09] scale-110"
            style={{
              objectPosition: "center 40%",
              maskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
            }}
          />
        </div>
        {/* Title row */}
        <div className="flex items-center gap-2 mb-2.5 relative z-10">
          <Map size={18} className="text-amber-400 drop-shadow-lg" />
          <h2
            className="text-sm font-extrabold tracking-wider uppercase"
            style={{
              background: "linear-gradient(180deg, #f5d060 0%, #d4a84a 40%, #a07830 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
            }}
          >
            Campaign
          </h2>
          {onTogglePreview && (
            <button
              onClick={onTogglePreview}
              className="ml-auto p-1.5 rounded-lg transition-all hover:scale-110 hover:brightness-125"
              style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1px solid ${GOLD.border25}`,
              }}
              title="Show Battle Scene"
            >
              <Eye size={14} className="text-amber-400/70" />
            </button>
          )}
        </div>

        {/* Progress section */}
        <div className="mb-1.5 relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest">
              Overall Progress
            </span>
            <span className="text-[11px] font-semibold text-amber-300/90 tabular-nums">
              {completedLevels}/{totalLevels} levels
            </span>
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden relative"
            style={{
              background: PANEL.bgDeep,
              border: `1px solid ${GOLD.border25}`,
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
              style={{
                width: `${progressPct}%`,
                background:
                  "linear-gradient(90deg, rgba(160,110,20,0.9), rgba(220,170,40,0.95), rgba(160,110,20,0.9))",
                boxShadow: "0 0 10px rgba(220,170,40,0.35)",
              }}
            >
              <div
                className="absolute inset-0 animate-wm-progress-shimmer"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                  width: "40%",
                }}
              />
            </div>
            <div
              className="absolute inset-[1px] rounded-full pointer-events-none"
              style={{ border: `1px solid ${GOLD.innerBorder08}` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-amber-300 font-bold tabular-nums">
                {totalStars}
              </span>
              <span className="text-[10px] text-amber-600">/{maxStars}</span>
            </div>
            <span className="text-[10px] text-amber-500 font-medium">
              {Math.round(progressPct)}% complete
            </span>
          </div>
        </div>

        {/* Compact stats row */}
        <div
          className="flex items-center justify-between mt-2.5 px-2.5 py-1.5 rounded-lg relative z-10"
          style={{
            background: `linear-gradient(135deg, rgba(40,28,14,0.7), rgba(30,20,10,0.55))`,
            border: `1px solid ${GOLD.border25}`,
          }}
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Swords size={11} className="text-blue-400/80 shrink-0" />
            <span className="text-blue-300 font-bold tabular-nums">{totalBattles}</span>
            <span className="text-amber-600/70 text-[9px] uppercase tracking-wider">Played</span>
          </span>
          <span className="text-amber-700/40 text-[10px]">|</span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <Trophy size={11} className="text-emerald-400/80 shrink-0" />
            <span className="text-emerald-300 font-bold tabular-nums">{totalWins}</span>
            <span className="text-amber-600/70 text-[9px] uppercase tracking-wider">Wins</span>
          </span>
          <span className="text-amber-700/40 text-[10px]">|</span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <Heart size={11} className="text-red-400 fill-red-400 shrink-0" />
            <span className="text-red-300 font-bold tabular-nums">{totalHearts}</span>
            <span className="text-amber-600/70 text-[9px] uppercase tracking-wider">Lives</span>
          </span>
        </div>

        {/* Ornate bottom accent */}
        <div className="flex items-center justify-center gap-2 mt-2.5 relative z-10">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25})` }} />
          <div className="w-1.5 h-1.5 rotate-45 rounded-[1px]" style={{ background: GOLD.border35 }} />
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border25}, transparent)` }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          CONTINUE CAMPAIGN CTA
          ═══════════════════════════════════════════════════ */}
      {recommended && (
        <div className="flex-shrink-0 px-3.5 pt-2.5 pb-1">
          <button
            onClick={() => onSelectLevel(recommended.id)}
            className="w-full group relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.99] animate-wm-cta-glow"
            style={{
              background: `linear-gradient(135deg, rgba(170,120,20,0.85), rgba(120,78,12,0.85))`,
              border: `2px solid ${GOLD.accentBorder40}`,
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
            <div className="relative px-3.5 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Crown size={11} className="text-amber-300/80" />
                <span className="text-[9px] font-bold text-amber-300/90 uppercase tracking-[0.15em]">
                  Continue Campaign
                </span>
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0">
                    <RegionIcon type={recommended.region} size={32} framed />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <div className="text-[13px] font-bold text-amber-100 leading-tight truncate w-full">
                      {recommended.name}
                    </div>
                    <div className="text-[10px] text-amber-400/60 mt-0.5">
                      {REGION_META[recommended.region]?.displayName} &middot;{" "}
                      {recommended.difficulty === 1
                        ? "Easy"
                        : recommended.difficulty === 2
                          ? "Medium"
                          : "Hard"}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-amber-300/60 shrink-0 group-hover:text-amber-200 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          REGIONS LIST
          ═══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-2.5 pb-3">
        <div className="mb-2.5">
          <SectionDivider label="Regions" />
        </div>

        <div className="space-y-2">
          {regionData.map(({ region, stars, maxStars: rMax, completed, total, targetLevel }, idx) => {
            const meta = REGION_META[region];
            const pct = rMax > 0 ? (stars / rMax) * 100 : 0;
            const isFullyComplete = stars === rMax && rMax > 0;
            const regionPreview = targetLevel ? getPreviewImage(targetLevel.id) : undefined;
            return (
              <button
                key={region}
                onClick={() => {
                  if (targetLevel) onSelectLevel(targetLevel.id);
                }}
                className="w-full text-left py-1 px-0.5 rounded-xl overflow-hidden transition-all hover:brightness-125 hover:scale-[1.02] active:scale-[0.99] relative"
                style={{
                  background: `linear-gradient(135deg, ${meta.bgLight}, ${meta.bgDark})`,
                  border: `1.5px solid ${isFullyComplete ? "rgba(220,170,40,0.55)" : meta.border}`,
                  boxShadow: isFullyComplete
                    ? `inset 0 0 12px ${meta.glow}, 0 0 14px rgba(220,170,40,0.15)`
                    : `inset 0 0 12px ${meta.glow}`,
                  animation: `wm-fade-in 0.4s ease-out ${idx * 70}ms both`,
                }}
              >
                {regionPreview && (
                  <MapPreviewBg src={regionPreview} fadeColor={meta.bgLight} />
                )}
                <div
                  className="absolute inset-[2px] rounded-[10px] pointer-events-none"
                  style={{
                    border: `1px solid rgba(255,255,255,0.06)`,
                  }}
                />
                <div className="relative px-2.5 py-2 flex items-center gap-2">
                  <div className="shrink-0">
                    <RegionIcon type={region} size={28} framed />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-bold text-amber-100 leading-tight">
                        {meta.displayName}
                      </span>
                      <span className={`flex items-center gap-1 shrink-0 ml-1.5 ${isFullyComplete ? "animate-wm-star-breathe" : ""}`}>
                        <Star
                          size={10}
                          className={
                            stars > 0
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-stone-600"
                          }
                        />
                        <span className="text-[9px] font-bold text-amber-300/70 tabular-nums">
                          {stars}/{rMax}
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{
                        background: "rgba(0,0,0,0.45)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: isFullyComplete
                            ? "linear-gradient(90deg, rgba(220,170,40,0.9), rgba(250,200,60,0.95))"
                            : `linear-gradient(90deg, ${meta.accent}cc, ${meta.accent}99)`,
                          boxShadow: isFullyComplete
                            ? "0 0 6px rgba(220,170,40,0.5)"
                            : `0 0 4px ${meta.accent}44`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════
            RECENT / LAST PLAYED
            ═══════════════════════════════════════════════════ */}
        {lastPlayedLevel && lastPlayed && (
          <div className="mt-4">
            <div className="mb-2.5">
              <SectionDivider label="Recent" />
            </div>
            <button
              onClick={() => onSelectLevel(lastPlayed.id)}
              className="w-full text-left rounded-xl overflow-hidden transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] relative"
              style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${GOLD.border25}`,
                boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
              }}
            >
              {getPreviewImage(lastPlayed.id) && (
                <MapPreviewBg
                  src={getPreviewImage(lastPlayed.id)!}
                  fadeColor={PANEL.bgWarmLight}
                />
              )}
              <div
                className="absolute inset-[2px] rounded-[10px] pointer-events-none"
                style={{ border: `1px solid ${GOLD.innerBorder08}` }}
              />
              <div className="relative px-3.5 py-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={14} className="text-amber-400/80 shrink-0" />
                    <span className="text-[13px] font-bold text-amber-100 truncate min-w-0">
                      {lastPlayedLevel.name}
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={13}
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
                    <span className="flex items-center gap-1 text-red-300/70">
                      <Heart size={10} className="fill-red-400 text-red-400" />
                      {lastPlayed.stats.bestHearts}/20
                    </span>
                  )}
                  {lastPlayed.stats.bestTime !== undefined && (
                    <span className="flex items-center gap-1 text-blue-300/70">
                      <Clock size={10} />
                      {Math.floor(lastPlayed.stats.bestTime / 60)}m{" "}
                      {lastPlayed.stats.bestTime % 60}s
                    </span>
                  )}
                  {lastPlayed.stats.timesPlayed !== undefined && (
                    <span className="flex items-center gap-1 text-amber-400/60">
                      <Swords size={10} />
                      {lastPlayed.stats.timesPlayed} plays
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Bottom lore */}
        <div
          className="mt-4 pt-3 pb-1"
          style={{
            animation: "wm-fade-in 0.6s ease-out 0.5s both",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25})` }} />
            <div className="w-1 h-1 rotate-45 rounded-[1px]" style={{ background: GOLD.border25 }} />
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border25}, transparent)` }} />
          </div>
          <p
            className="text-[9px] leading-relaxed italic text-center px-2"
            style={{ color: "rgba(217,183,130,0.35)" }}
          >
            &ldquo;The shadows gather at the gates. Ancient towers stand
            resolute, their arcane fires burning eternal against the
            darkness.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
