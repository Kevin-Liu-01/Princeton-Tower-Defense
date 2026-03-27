"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Swords, ChevronLeft, AlertTriangle, MapPin, Shield, Star } from "lucide-react";
import { LEVEL_DATA } from "../../constants";
import { WORLD_LEVELS } from "./world-map/worldMapData";
import { OrnateFrame } from "../ui/primitives/OrnateFrame";
import { resolveLoadingTheme, type LoadingTheme } from "../../constants/loadingAssets";
import { RegionIcon, type RegionType } from "../../sprites";

const REGION_LABEL: Record<string, string> = {
  grassland: "Princeton Grounds",
  swamp: "Murky Marshes",
  desert: "Sahara Sands",
  winter: "Frozen Frontier",
  volcanic: "Volcanic Depths",
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

const DIFFICULTY_COLOR: Record<number, string> = {
  1: "rgba(80,200,120,0.85)",
  2: "rgba(240,180,40,0.85)",
  3: "rgba(220,80,60,0.85)",
};

interface FreeplayDisclaimerProps {
  levelId: string;
  isFreeplay: boolean;
  onStart: () => void;
  onBack: () => void;
}

export function FreeplayDisclaimer({ levelId, isFreeplay, onStart, onBack }: FreeplayDisclaimerProps) {
  const levelData = LEVEL_DATA[levelId];
  const worldLevel = WORLD_LEVELS.find((l) => l.id === levelId);
  const theme = resolveLoadingTheme(levelData?.theme, levelData?.levelKind);
  const previewImage = levelData?.previewImage;
  const levelName = levelData?.name ?? worldLevel?.name ?? levelId;
  const region = (worldLevel?.region ?? levelData?.region ?? "grassland") as RegionType;
  const regionLabel = REGION_LABEL[region] ?? region;
  const difficulty = worldLevel?.difficulty ?? levelData?.difficulty ?? 1;
  const difficultyLabel = DIFFICULTY_LABEL[difficulty];
  const difficultyColor = DIFFICULTY_COLOR[difficulty];
  const description = worldLevel?.description?.replace(/\n/g, " ") ?? levelData?.description ?? "";
  const tags = worldLevel?.tags ?? [];
  const kind = worldLevel?.kind ?? "campaign";

  const [stageVisible, setStageVisible] = useState([false, false, false, false, false]);

  useEffect(() => {
    const delays = [80, 280, 480, 700, 950];
    const timers = delays.map((delay, i) =>
      setTimeout(() => {
        setStageVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <OrnateFrame
      className="fixed inset-0 h-screen z-[9999]"
      cornerSize={52}
      cornerVariant="standard"
      borderVariant="standard"
      sideBorderVariant="standard"
      topBottomBorderVariant="standard"
      borderScale={1.1}
      color={theme.frameColor}
      glowColor={theme.frameGlow}
    >
      <div
        className="w-full h-full flex flex-col items-center justify-center overflow-y-auto"
        style={{ background: theme.bg }}
      >
        <BackgroundLayer theme={theme} previewImage={previewImage} />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer"
          style={{
            background: `linear-gradient(135deg, rgba(${theme.bgRgb},0.85) 0%, rgba(${theme.bgRgb},0.7) 100%)`,
            border: `1px solid rgba(${theme.accentDarkRgb},0.3)`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <ChevronLeft
            size={16}
            style={{ color: `rgba(${theme.accentRgb},0.7)` }}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: `rgba(${theme.accentRgb},0.6)` }}
          >
            Campaign
          </span>
        </button>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 w-full max-w-lg">
          {/* Region icon + Level name */}
          <div
            className="flex flex-col items-center gap-2 transition-all duration-700 ease-out"
            style={{
              opacity: stageVisible[0] ? 1 : 0,
              transform: stageVisible[0] ? "translateY(0)" : "translateY(14px)",
            }}
          >
            <RegionIcon type={region} size={48} framed challenge={kind === "challenge"} />
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-center"
              style={{
                color: theme.accent,
                textShadow: `0 0 30px rgba(${theme.accentRgb},0.35), 0 2px 4px rgba(0,0,0,0.6)`,
              }}
            >
              {levelName}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span
                className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider"
                style={{ color: `rgba(${theme.accentRgb},0.55)` }}
              >
                <MapPin size={12} />
                {regionLabel}
              </span>
              <span
                className="w-px h-3"
                style={{ background: `rgba(${theme.accentRgb},0.2)` }}
              />
              <span
                className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: difficultyColor }}
              >
                <Star size={12} />
                {difficultyLabel}
              </span>
              {kind === "challenge" && (
                <>
                  <span
                    className="w-px h-3"
                    style={{ background: `rgba(${theme.accentRgb},0.2)` }}
                  />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(196,64,88,0.85)" }}
                  >
                    Challenge
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Preview image in ornate frame */}
          {previewImage && (
            <div
              className="w-full max-w-sm transition-all duration-700 ease-out"
              style={{
                opacity: stageVisible[1] ? 1 : 0,
                transform: stageVisible[1] ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
              }}
            >
              <OrnateFrame
                className="rounded-lg"
                cornerSize={28}
                cornerVariant="standard"
                borderVariant="standard"
                color={theme.frameColor}
                glowColor={theme.frameGlow}
              >
                <div
                  className="aspect-video relative overflow-hidden rounded-sm"
                  style={{
                    boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 40px rgba(${theme.accentRgb},0.08)`,
                  }}
                >
                  <Image
                    src={previewImage}
                    alt={`${levelName} preview`}
                    fill
                    sizes="(max-width: 640px) 90vw, 400px"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, transparent 60%, rgba(${theme.bgRgb},0.4) 100%)`,
                    }}
                  />
                </div>
              </OrnateFrame>
            </div>
          )}

          {/* Description + tags */}
          <div
            className="flex flex-col items-center gap-2 transition-all duration-700 ease-out"
            style={{
              opacity: stageVisible[2] ? 1 : 0,
              transform: stageVisible[2] ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <p
              className="text-center text-sm leading-relaxed max-w-xs"
              style={{ color: `rgba(${theme.accentRgb},0.5)` }}
            >
              {description}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      color: `rgba(${theme.accentRgb},0.5)`,
                      background: `rgba(${theme.accentDarkRgb},0.15)`,
                      border: `1px solid rgba(${theme.accentDarkRgb},0.2)`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer (only for locked levels) */}
          {isFreeplay && (
            <div
              className="w-full max-w-sm transition-all duration-700 ease-out"
              style={{
                opacity: stageVisible[3] ? 1 : 0,
                transform: stageVisible[3] ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, rgba(${theme.accentDarkRgb},0.12) 0%, rgba(${theme.accentDarkRgb},0.06) 100%)`,
                  border: `1px solid rgba(${theme.accentDarkRgb},0.2)`,
                }}
              >
                <AlertTriangle
                  size={16}
                  className="shrink-0 mt-0.5"
                  style={{ color: `rgba(${theme.accentRgb},0.5)` }}
                />
                <div className="flex flex-col gap-1">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: `rgba(${theme.accentRgb},0.6)` }}
                  >
                    Freeplay Mode
                  </p>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: `rgba(${theme.accentRgb},0.4)` }}
                  >
                    This is not part of the campaign — just a way to enjoy every level!
                    Victories here won&apos;t unlock new levels or save progress toward your campaign.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Let's Battle button */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: stageVisible[4] ? 1 : 0,
              transform: stageVisible[4] ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <button
              onClick={onStart}
              className="group relative flex items-center gap-2.5 px-8 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, rgba(${theme.accentDarkRgb},0.5) 0%, rgba(${theme.accentDarkRgb},0.3) 100%)`,
                border: `1.5px solid rgba(${theme.accentRgb},0.4)`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 30px rgba(${theme.accentRgb},0.1), inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
            >
              <Swords
                size={18}
                style={{ color: theme.accent }}
                className="transition-transform duration-200 group-hover:rotate-12"
              />
              <span
                className="text-sm font-bold uppercase tracking-[0.2em]"
                style={{
                  color: theme.accent,
                  textShadow: `0 0 16px rgba(${theme.accentRgb},0.4)`,
                }}
              >
                Let&apos;s Battle
              </span>
              <Shield
                size={16}
                style={{ color: `rgba(${theme.accentRgb},0.5)` }}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </button>
          </div>
        </div>
      </div>
    </OrnateFrame>
  );
}

function BackgroundLayer({ theme, previewImage }: { theme: LoadingTheme; previewImage?: string }) {
  const bgSrc = previewImage ?? theme.bgImage;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-[-8%]"
        style={{
          width: "116%",
          height: "116%",
          animation: "kenBurns 28s ease-in-out infinite alternate",
        }}
      >
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          sizes="120vw"
          className="object-cover"
          style={{ opacity: 0.28, filter: "blur(2px) saturate(0.6)" }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(${theme.washRgb},0.25) 0%, rgba(${theme.washRgb},0.15) 40%, rgba(${theme.bgRgb},0.3) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at center 42%, transparent 0%, rgba(${theme.bgRgb},0.5) 40%, rgba(${theme.bgRgb},0.95) 75%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-2/5"
        style={{
          background: `linear-gradient(to top, rgba(${theme.bgRgb},0.98) 0%, rgba(${theme.bgRgb},0.6) 50%, transparent 100%)`,
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-1/5"
        style={{
          background: `linear-gradient(to bottom, rgba(${theme.bgRgb},0.7) 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}
