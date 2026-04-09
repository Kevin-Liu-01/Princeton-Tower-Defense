"use client";

import {
  Book,
  ChevronLeft,
  ChevronRight,
  Hammer,
  Maximize,
  Minimize,
  Settings,
  Star,
  Swords,
} from "lucide-react";
import Image from "next/image";
import React from "react";

import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import PrincetonTDLogo from "../../ui/primitives/PrincetonTDLogo";
import {
  AMBER_CARD,
  DIVIDER,
  GOLD,
  OVERLAY,
  PANEL,
  panelGradient,
  ORNAMENT,
} from "../../ui/system/theme";
import type { CodexTabId } from "../CodexModal";
import { NavMoreDropdown } from "../NavMoreDropdown";

const PrincetonLogo: React.FC = () => (
  <div className="relative flex items-center gap-1 sm:gap-2">
    <div className="absolute -inset-4 blur-2xl opacity-60">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/40 via-amber-400/50 to-orange-600/40 animate-pulse" />
    </div>
    <PrincetonTDLogo size="h-9 w-9 sm:h-11 sm:w-11" />
    <div className="relative flex flex-col -mt-1">
      <span
        className="text-lg sm:text-2xl font-black tracking-wider"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #fcd34d 0%, #f59e0b 40%, #d97706 70%, #92400e 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        PRINCETON
      </span>
      <div className="flex items-center gap-1 sm:gap-2 -mt-1">
        <Swords
          size={14}
          className="text-orange-400 size-2 sm:size-auto block"
        />
        <span className="text-[7px] text-nowrap sm:text-[8.5px] font-bold tracking-[0.3em] text-amber-500/90">
          TOWER DEFENSE
        </span>
        <Swords
          size={14}
          className="text-orange-400 size-2 sm:size-auto block"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>
    </div>

    <div className="z-[-1] object-bottom object-contain absolute top-[-4.1rem] right-[-26rem] pointer-events-none select-none">
      <Image
        src="/images/new/gameplay_volcano.png"
        alt="Battle Scene"
        width={1200}
        height={700}
        priority
        className="w-full h-full opacity-20 scale-125"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 15%, black 70%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 15%, black 70%, transparent 100%)",
        }}
      />
    </div>
  </div>
);

interface WorldMapTopBarProps {
  totalStars: number;
  maxStars: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenCodex: (tab: CodexTabId) => void;
  onOpenCreator: () => void;
  onOpenSettings: () => void;
  onShowCredits: () => void;
  onPreviousLevel: () => void;
  onNextLevel: () => void;
}

export function WorldMapTopBar({
  totalStars,
  maxStars,
  isFullscreen,
  onToggleFullscreen,
  onOpenCodex,
  onOpenCreator,
  onOpenSettings,
  onShowCredits,
  onPreviousLevel,
  onNextLevel,
}: WorldMapTopBarProps) {
  return (
    <OrnateFrame
      className="flex-shrink-0 overflow-hidden rounded-xl shadow-xl"
      style={{ border: `2px solid ${GOLD.border35}` }}
      cornerSize={22}
      borderVariant="compact"
      showBorders={true}
      showSideBorders={true}
      showTopBottomBorders={false}
    >
      <div
        className="relative sm:px-1 z-20 py-0.5 overflow-hidden"
        style={{
          background: panelGradient,
        }}
      >
        {/* Right-side background image */}
        <div className="absolute top-[-2rem] right-0 w-[28rem] h-[calc(100%+4rem)] pointer-events-none select-none z-0">
          <Image
            src="/images/new/gameplay_winter.png"
            alt=""
            width={1200}
            height={700}
            priority
            className="w-full h-full object-cover opacity-15 scale-110"
            style={{
              WebkitMaskImage:
                "linear-gradient(to left, black 0%, black 30%, transparent 80%)",
              maskImage:
                "linear-gradient(to left, black 0%, black 30%, transparent 80%)",
            }}
          />
        </div>

        <div
          className="absolute top-0 left-0 right-0 h-px opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)`,
          }}
        />

        <div className="relative px-4 sm:pl-3 sm:pr-5 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <PrincetonLogo />

            <div
              className="hidden sm:block w-px h-8 opacity-60"
              style={{
                background: `linear-gradient(180deg, transparent, ${GOLD.border35}, transparent)`,
              }}
            />

            <div
              className="hidden sm:flex relative items-center gap-2 px-4 py-1.5 rounded-xl animate-wm-star-breathe"
              style={{
                background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                border: `1.5px solid ${AMBER_CARD.border}`,
                boxShadow: `inset 0 0 12px ${AMBER_CARD.glow}, 0 0 10px rgba(180,140,50,0.08)`,
              }}
            >
              <div
                className="absolute inset-[2px] rounded-[10px] pointer-events-none"
                style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }}
              />
              <Star
                size={15}
                className="text-yellow-400 fill-yellow-400 shrink-0"
              />
              <span className="font-black text-sm text-yellow-300">
                {totalStars}
              </span>
              <span className="text-[9px] text-yellow-700 font-semibold">
                /{maxStars}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className="relative flex items-center rounded-xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(55,38,20,0.85), rgba(38,26,14,0.85))",
                border: `1.5px solid ${GOLD.border30}`,
                boxShadow: `inset 0 1px 0 ${OVERLAY.white06}, inset 0 0 16px ${GOLD.glow04}`,
              }}
            >
              <div
                className="absolute inset-[2px] rounded-[10px] pointer-events-none"
                style={{ border: `1px solid ${GOLD.innerBorder08}` }}
              />

              <button
                onClick={() => onOpenCodex("towers")}
                className="relative z-10 flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 hover:bg-amber-600/15 hover:shadow-[inset_0_0_12px_rgba(180,140,60,0.12)]"
              >
                <Book
                  size={14}
                  className="text-amber-400 shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <span className="hidden sm:inline text-xs text-amber-200/80 font-bold tracking-wider uppercase">
                  Codex
                </span>
              </button>

              <div
                className="w-px h-4 sm:h-5 shrink-0"
                style={{ background: "rgba(180,140,60,0.18)" }}
              />

              <button
                onClick={onOpenCreator}
                className="relative z-10 flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 hover:bg-amber-600/15 hover:shadow-[inset_0_0_12px_rgba(180,140,60,0.12)]"
              >
                <Hammer size={14} className="text-amber-400 shrink-0" />
                <span className="hidden sm:inline text-xs text-amber-200/80 font-bold tracking-wider uppercase">
                  Creator
                </span>
              </button>

              <div
                className="w-px h-4 sm:h-5 shrink-0"
                style={{ background: "rgba(180,140,60,0.18)" }}
              />

              <button
                onClick={onOpenSettings}
                className="relative z-10 flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 hover:bg-amber-600/15 hover:shadow-[inset_0_0_12px_rgba(180,140,60,0.12)]"
              >
                <Settings size={14} className="text-amber-400 shrink-0" />
                <span className="hidden sm:inline text-xs text-amber-200/80 font-bold tracking-wider uppercase">
                  Settings
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={onToggleFullscreen}
              className="hidden sm:flex relative items-center px-3 py-2 rounded-xl transition-all duration-150 hover:bg-amber-600/15"
              style={{
                background:
                  "linear-gradient(180deg, rgba(55,38,20,0.85), rgba(38,26,14,0.85))",
                border: `1.5px solid ${GOLD.border30}`,
                boxShadow: `inset 0 1px 0 ${OVERLAY.white06}, inset 0 0 16px ${GOLD.glow04}`,
              }}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize size={15} className="text-amber-300/70 shrink-0" />
              ) : (
                <Maximize size={15} className="text-amber-300/70 shrink-0" />
              )}
            </button>

            <NavMoreDropdown onShowCredits={onShowCredits} />

            <div
              className="hidden sm:flex relative items-center rounded-xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${GOLD.border25}`,
                boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
              }}
            >
              <div
                className="absolute inset-[2px] rounded-[10px] pointer-events-none"
                style={{ border: `1px solid ${GOLD.innerBorder08}` }}
              />
              <button
                onClick={onPreviousLevel}
                className="relative z-10 px-3 py-2 flex items-center transition-colors duration-150 hover:bg-amber-700/20"
              >
                <ChevronLeft size={16} className="text-amber-500/70" />
              </button>
              <div
                className="w-px h-5"
                style={{ background: "rgba(180,140,60,0.2)" }}
              />
              <button
                onClick={onNextLevel}
                className="relative z-10 px-3 py-2 flex items-center transition-colors duration-150 hover:bg-amber-700/20"
              >
                <ChevronRight size={16} className="text-amber-500/70" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div
          className="h-px opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)`,
          }}
        />
      </div>
    </OrnateFrame>
  );
}
