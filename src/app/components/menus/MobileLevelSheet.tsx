"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  Star,
  Swords,
  Play,
  Heart,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Clock,
  Flag,
  Skull,
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
  NEUTRAL,
  SELECTED,
} from "../ui/theme";
import {
  WORLD_LEVELS,
  DEV_LEVEL_IDS,
  getWaveCount,
  type LevelNode,
} from "./worldMapData";
import { RegionIcon } from "../../sprites";
import { MobileBottomSheet } from "./MobileBottomSheet";

const CHALLENGE_BADGE_STYLES: Record<LevelNode["region"], React.CSSProperties> = {
  grassland: {
    background: "linear-gradient(135deg, rgba(41,110,59,0.9), rgba(22,68,36,0.95))",
    border: "1px solid rgba(160,242,168,0.55)",
    color: "rgb(230,255,218)",
  },
  swamp: {
    background: "linear-gradient(135deg, rgba(28,98,94,0.9), rgba(12,60,58,0.95))",
    border: "1px solid rgba(146,232,217,0.55)",
    color: "rgb(224,255,248)",
  },
  desert: {
    background: "linear-gradient(135deg, rgba(133,99,41,0.9), rgba(84,56,21,0.95))",
    border: "1px solid rgba(255,216,132,0.55)",
    color: "rgb(255,242,206)",
  },
  winter: {
    background: "linear-gradient(135deg, rgba(47,87,129,0.9), rgba(28,56,92,0.95))",
    border: "1px solid rgba(169,213,255,0.55)",
    color: "rgb(231,246,255)",
  },
  volcanic: {
    background: "linear-gradient(135deg, rgba(145,38,20,0.9), rgba(90,18,10,0.95))",
    border: "1px solid rgba(255,170,90,0.55)",
    color: "rgb(255,225,170)",
  },
};

interface LevelInfo {
  id: string;
  name: string;
  description: string;
  region: LevelNode["region"];
  difficulty: 1 | 2 | 3;
  kind?: "campaign" | "challenge" | "custom";
  tags: string[];
  isCustom?: boolean;
}

interface MobileLevelSheetProps {
  level: LevelInfo | null;
  levelStars: LevelStars;
  levelStats: Record<string, LevelStats>;
  unlockedMaps: string[];
  canStart: boolean;
  onClose: () => void;
  onBattle: () => void;
  onBattleRandom: () => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
  onSelectLevel: (id: string) => void;
  isDevMode?: boolean;
}

function DifficultyDots({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  const colorMap = { 1: "bg-green-500", 2: "bg-yellow-500", 3: "bg-red-500" };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((d) => (
        <div
          key={d}
          className={`w-2.5 h-2.5 rounded-full ${d <= difficulty ? colorMap[difficulty] : "bg-stone-700"}`}
        />
      ))}
    </div>
  );
}

function StarRow({ earned, total = 3 }: { earned: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < earned
              ? "text-yellow-400 fill-yellow-400"
              : "text-stone-600"
          }
        />
      ))}
    </div>
  );
}

export const MobileLevelSheet: React.FC<MobileLevelSheetProps> = ({
  level,
  levelStars,
  levelStats,
  unlockedMaps,
  canStart,
  onClose,
  onBattle,
  onBattleRandom,
  onNavigateNext,
  onNavigatePrev,
  onSelectLevel,
  isDevMode = false,
}) => {
  const unlockedSet = useMemo(() => new Set(unlockedMaps), [unlockedMaps]);

  const isChallenge =
    Boolean(level?.kind === "challenge") && !level?.isCustom;

  const waveCount = level ? getWaveCount(level.id) : 0;
  const stars = level ? levelStars[level.id] || 0 : 0;
  const stats = level ? levelStats[level.id] : undefined;

  const previewImage = level
    ? LEVEL_DATA[level.id]?.previewImage
    : undefined;

  const regionSiblings = useMemo(() => {
    if (!level) return [];
    return WORLD_LEVELS.filter(
      (l) =>
        l.region === level.region &&
        (isDevMode || !DEV_LEVEL_IDS.has(l.id)),
    );
  }, [level, isDevMode]);

  return (
    <MobileBottomSheet
      isOpen={!!level}
      onClose={onClose}
      title={level?.name ?? "Level"}
      titleIcon={
        level ? (
          <RegionIcon
            type={level.region}
            size={18}
            framed
            challenge={isChallenge}
          />
        ) : undefined
      }
      accentColor={
        level
          ? CHALLENGE_BADGE_STYLES[level.region].border?.toString().replace("1px solid ", "") ?? GOLD.border35
          : GOLD.border35
      }
    >
      {level && (
        <div className="flex flex-col gap-3">
          {/* Preview image + description */}
          <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 80 }}>
            {previewImage && (
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src={previewImage}
                  alt=""
                  fill
                  sizes="400px"
                  className="object-cover opacity-30"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
                  }}
                />
              </div>
            )}
            <div className="relative px-3 py-3">
              <p className="text-[11px] text-amber-300/60 italic leading-relaxed">
                &ldquo;{level.description}&rdquo;
              </p>
            </div>
          </div>

          {/* Tags + badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isChallenge && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase"
                style={CHALLENGE_BADGE_STYLES[level.region]}
              >
                Challenge
              </span>
            )}
            {level.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-semibold px-2 py-0.5 rounded-md tracking-wide"
                style={{
                  background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                  border: `1px solid ${GOLD.border25}`,
                  color: "rgba(252,211,77,0.8)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* Difficulty */}
            <div
              className="flex flex-col items-center gap-1 py-2 rounded-lg relative"
              style={{
                background: `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                border: `1px solid ${NEUTRAL.border}`,
              }}
            >
              <Skull size={14} className="text-amber-400" />
              <DifficultyDots difficulty={level.difficulty} />
              <span className="text-[7px] text-amber-500/60 font-bold uppercase tracking-wider">
                Difficulty
              </span>
            </div>

            {/* Waves */}
            <div
              className="flex flex-col items-center gap-1 py-2 rounded-lg relative"
              style={{
                background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                border: `1px solid ${AMBER_CARD.border}`,
              }}
            >
              <Flag size={14} className="text-amber-300" />
              <span className="text-sm font-bold text-amber-200">
                {waveCount}
              </span>
              <span className="text-[7px] text-amber-500/60 font-bold uppercase tracking-wider">
                Waves
              </span>
            </div>

            {/* Stars */}
            <div
              className="flex flex-col items-center gap-1 py-2 rounded-lg relative"
              style={{
                background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                border: `1px solid ${AMBER_CARD.border}`,
              }}
            >
              <Trophy size={14} className="text-yellow-500" />
              <StarRow earned={stars} />
              <span className="text-[7px] text-amber-500/60 font-bold uppercase tracking-wider">
                Stars
              </span>
            </div>

            {/* Hearts */}
            <div
              className="flex flex-col items-center gap-1 py-2 rounded-lg relative"
              style={{
                background: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
                border: `1px solid ${RED_CARD.border}`,
              }}
            >
              <Heart size={14} className="text-red-400 fill-red-400" />
              <span className="text-sm font-bold text-red-200">
                {stats?.bestHearts ?? "—"}
              </span>
              <span className="text-[7px] text-red-500/60 font-bold uppercase tracking-wider">
                Hearts
              </span>
            </div>
          </div>

          {/* Best time if available */}
          {stats?.bestTime !== undefined && (
            <div
              className="flex items-center justify-center gap-2 py-1.5 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`,
                border: `1px solid ${BLUE_CARD.border}`,
              }}
            >
              <Clock size={12} className="text-blue-400" />
              <span className="text-xs font-bold text-blue-200">
                Best: {Math.floor(stats.bestTime / 60)}m {stats.bestTime % 60}s
              </span>
            </div>
          )}

          {/* Region siblings — horizontal scroll */}
          {regionSiblings.length > 1 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex-1 h-px"
                  style={{
                    background: `linear-gradient(90deg, ${GOLD.border25}, transparent)`,
                  }}
                />
                <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">
                  Region Levels
                </span>
                <div
                  className="flex-1 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${GOLD.border25})`,
                  }}
                />
              </div>
              <div
                className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {regionSiblings.map((l) => {
                  const isSelected = l.id === level.id;
                  const lStars = levelStars[l.id] || 0;
                  const isUnlocked = unlockedSet.has(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => isUnlocked && onSelectLevel(l.id)}
                      disabled={!isUnlocked}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 ${!isUnlocked ? "opacity-40" : ""}`}
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${SELECTED.warmBgLight}, ${SELECTED.warmBgDark})`
                          : `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${isSelected ? GOLD.accentBorder40 : GOLD.border25}`,
                        boxShadow: isSelected
                          ? `0 0 8px ${GOLD.accentGlow10}`
                          : "none",
                      }}
                    >
                      <span
                        className={`text-[10px] font-semibold whitespace-nowrap ${isSelected ? "text-amber-100" : "text-amber-200/80"}`}
                      >
                        {l.name}
                      </span>
                      <div className="flex gap-px">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            size={9}
                            className={
                              lStars >= s
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-stone-600"
                            }
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation + Battle */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onNavigatePrev}
              className="p-2.5 rounded-lg border transition-all active:scale-95"
              style={{
                background: PANEL.bgWarmMid,
                borderColor: GOLD.border25,
              }}
            >
              <ChevronLeft size={18} className="text-amber-400" />
            </button>

            <button
              onClick={canStart ? onBattle : onBattleRandom}
              className="flex-1 py-3.5 rounded-xl font-black text-sm transition-all relative overflow-hidden group uppercase active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(200,150,30,0.97) 0%, rgba(160,105,15,0.97) 50%, rgba(130,80,10,0.97) 100%)",
                border: "2px solid rgba(255,210,80,0.7)",
                boxShadow:
                  "0 0 18px rgba(255,180,40,0.35), 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,240,160,0.4), inset 0 -1px 0 rgba(80,50,10,0.4)",
                color: "rgba(253,230,138,0.9)",
                textShadow:
                  "0 1px 4px rgba(0,0,0,0.6), 0 0 10px rgba(255,200,60,0.3)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <div
                className="absolute inset-[2px] rounded-[10px] pointer-events-none"
                style={{ border: "1px solid rgba(255,230,140,0.2)" }}
              />
              <div className="relative flex items-center justify-center gap-2">
                <Swords size={16} />
                <span className="tracking-widest">BATTLE</span>
                <Play size={14} />
              </div>
            </button>

            <button
              onClick={onNavigateNext}
              className="p-2.5 rounded-lg border transition-all active:scale-95"
              style={{
                background: PANEL.bgWarmMid,
                borderColor: GOLD.border25,
              }}
            >
              <ChevronRight size={18} className="text-amber-400" />
            </button>
          </div>
        </div>
      )}
    </MobileBottomSheet>
  );
};
