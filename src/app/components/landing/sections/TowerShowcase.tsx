"use client";
import React, { useState, useCallback } from "react";
import type { TowerType } from "../../../types";
import {
  TOWER_DATA,
  TOWER_CATEGORIES,
  TOWER_ACCENTS,
  TOWER_QUICK_SUMMARY,
} from "../../../constants/towers";
import {
  TOWER_STATS,
  calculateTowerStats,
} from "../../../constants/towerStats";
import { TowerSprite } from "../../../sprites/towers";
import { LANDING_THEME } from "../landingConstants";
import { IsoPlatform } from "./IsoPlatform";
import { SpriteDisplay } from "./SpriteDisplay";
import { CarouselDots, CarouselArrow } from "../CarouselControls";
import { StatBar, PanelCorners, type StatBarData } from "./LoadoutUI";

const T = LANDING_THEME;

const TOWER_ORDER: TowerType[] = [
  "cannon",
  "mortar",
  "library",
  "lab",
  "arch",
  "station",
  "club",
];

const SHOWCASE_VISUAL = 220;
const SHOWCASE_SCALE = 2.4;
const SHOWCASE_CANVAS = Math.round(SHOWCASE_VISUAL * SHOWCASE_SCALE);

const MINI_VISUAL = 36;
const MINI_SCALE = 2.0;
const MINI_CANVAS = Math.round(MINI_VISUAL * MINI_SCALE);

function getTowerBars(
  type: TowerType,
  level: number,
  upgrade?: "A" | "B",
): StatBarData[] {
  const stats = calculateTowerStats(type, level, upgrade);
  const bars: StatBarData[] = [];

  if (stats.damage > 0) {
    bars.push({
      label: "DMG",
      pct: Math.min(1, stats.damage / 160),
      display: `${Math.round(stats.damage)}`,
    });
  }
  if ((stats.slowAmount ?? 0) > 0) {
    bars.push({
      label: "SLOW",
      pct: stats.slowAmount!,
      display: `${Math.round(stats.slowAmount! * 100)}%`,
    });
  }
  if ((stats.income ?? 0) > 0) {
    bars.push({
      label: "INCOME",
      pct: Math.min(1, stats.income! / 45),
      display: `${stats.income} PP`,
    });
  }
  if ((stats.maxTroops ?? 0) > 0 && stats.damage === 0 && !stats.income) {
    bars.push({
      label: "TROOPS",
      pct: Math.min(1, (stats.maxTroops ?? 0) / 4),
      display: `×${stats.maxTroops}`,
    });
  }

  if (stats.range > 0) {
    bars.push({
      label: "RANGE",
      pct: Math.min(1, stats.range / 400),
      display: `${Math.round(stats.range)}`,
    });
  }

  if (stats.attackSpeed > 0) {
    const rate = 1000 / stats.attackSpeed;
    bars.push({
      label: "RATE",
      pct: Math.min(1, rate / 10),
      display: `${rate.toFixed(1)}/s`,
    });
  } else if ((stats.spawnInterval ?? 0) > 0) {
    bars.push({
      label: "SPAWN",
      pct: Math.min(1, 5000 / stats.spawnInterval!),
      display: `${(stats.spawnInterval! / 1000).toFixed(0)}s`,
    });
  } else if ((stats.incomeInterval ?? 0) > 0) {
    bars.push({
      label: "CYCLE",
      pct: Math.min(1, 5000 / stats.incomeInterval!),
      display: `${(stats.incomeInterval! / 1000).toFixed(0)}s`,
    });
  }

  if ((stats.splashRadius ?? 0) > 0) {
    bars.push({
      label: "AOE",
      pct: Math.min(1, stats.splashRadius! / 200),
      display: `${Math.round(stats.splashRadius!)}`,
    });
  }
  if ((stats.chainTargets ?? 0) > 1) {
    bars.push({
      label: "CHAIN",
      pct: Math.min(1, stats.chainTargets! / 10),
      display: `×${stats.chainTargets}`,
    });
  }

  return bars;
}

function LevelPreview({
  type,
  level,
  upgrade,
  active,
  accent,
  label,
  onClick,
}: {
  type: TowerType;
  level: 1 | 2 | 3 | 4;
  upgrade?: "A" | "B";
  active: boolean;
  accent: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all duration-300 flex-shrink-0"
      style={{
        background: active
          ? `linear-gradient(170deg, ${accent}14, ${accent}0a)`
          : "rgba(255,255,255,0.02)",
        border: active
          ? `1.5px solid ${accent}44`
          : `1px solid rgba(255,255,255,0.04)`,
        boxShadow: active ? `0 0 14px ${accent}18` : "none",
        transform: active ? "scale(1.08)" : "scale(1)",
      }}
    >
      <SpriteDisplay visualSize={MINI_VISUAL} canvasScale={MINI_SCALE}>
        <TowerSprite
          type={type}
          size={MINI_CANVAS}
          level={level}
          upgrade={upgrade}
        />
      </SpriteDisplay>
      <span
        className="text-[7px] sm:text-[8px] font-bold tracking-wider text-center leading-tight max-w-[64px]"
        style={{ color: active ? accent : `${accent}40` }}
      >
        {label}
      </span>
    </button>
  );
}

function LevelConnector({ accent }: { accent: string }) {
  return (
    <div
      className="w-3 sm:w-5 h-px flex-shrink-0"
      style={{ background: `${accent}22` }}
    />
  );
}

export function TowerShowcase() {
  const [towerIndex, setTowerIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedUpgrade, setSelectedUpgrade] = useState<"A" | "B">("A");

  const selectedTower = TOWER_ORDER[towerIndex];

  const nextTower = useCallback(() => {
    setTowerIndex((p) => (p + 1) % TOWER_ORDER.length);
    setSelectedLevel(1);
    setSelectedUpgrade("A");
  }, []);

  const prevTower = useCallback(() => {
    setTowerIndex(
      (p) => (p - 1 + TOWER_ORDER.length) % TOWER_ORDER.length,
    );
    setSelectedLevel(1);
    setSelectedUpgrade("A");
  }, []);

  const goToTower = useCallback((i: number) => {
    setTowerIndex(i);
    setSelectedLevel(1);
    setSelectedUpgrade("A");
  }, []);

  const handleLevelSelect = useCallback((level: number) => {
    setSelectedLevel(level);
  }, []);

  const handleUpgradeSelect = useCallback((upgrade: "A" | "B") => {
    setSelectedLevel(4);
    setSelectedUpgrade(upgrade);
  }, []);

  const data = TOWER_DATA[selectedTower];
  const accent = TOWER_ACCENTS[selectedTower];
  const cat = TOWER_CATEGORIES[selectedTower];
  const summary = TOWER_QUICK_SUMMARY[selectedTower];

  const spriteLevel = (selectedLevel <= 3 ? selectedLevel : 4) as
    | 1
    | 2
    | 3
    | 4;
  const spriteUpgrade = selectedLevel === 4 ? selectedUpgrade : undefined;
  const statBars = getTowerBars(selectedTower, spriteLevel, spriteUpgrade);
  const baseCost = TOWER_STATS[selectedTower].levels[1].cost;

  return (
    <section className="py-16 sm:py-24 overflow-hidden">
      <div
        className="h-px mx-auto w-4/5 max-w-xl"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${T.accentDarkRgb},0.25), transparent)`,
        }}
      />

      <div className="text-center mt-10 sm:mt-16 mb-8 sm:mb-12">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          Armory
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Tower Loadout
        </h2>
      </div>

      <div className="relative mx-3 sm:mx-6 lg:mx-12">
        <CarouselArrow
          direction="left"
          onClick={prevTower}
          accent={accent}
        />
        <CarouselArrow
          direction="right"
          onClick={nextTower}
          accent={accent}
        />

        <div
          className="relative rounded-lg"
          style={{
            background:
              "linear-gradient(170deg, rgba(18,16,22,0.95), rgba(10,8,14,0.98))",
            border: "1px solid rgba(255,255,255,0.05)",
            borderLeft: `2px solid ${accent}44`,
          }}
        >
          <PanelCorners color={accent} />

          <div className="flex flex-col md:flex-row">
            {/* Left — large sprite fills column */}
            <div
              key={`sprite-${selectedTower}-${spriteLevel}-${spriteUpgrade ?? ""}`}
              className="flex flex-col items-center justify-center p-4 sm:p-6 md:w-[45%] md:border-r md:min-h-[320px]"
              style={{
                animation: "landing-tower-enter 0.35s ease-out",
                borderRightColor: "rgba(255,255,255,0.04)",
                background: `radial-gradient(ellipse at 50% 40%, ${accent}08, transparent 70%)`,
              }}
            >
              <SpriteDisplay
                visualSize={SHOWCASE_VISUAL}
                canvasScale={SHOWCASE_SCALE}
              >
                <TowerSprite
                  type={selectedTower}
                  size={SHOWCASE_CANVAS}
                  level={spriteLevel}
                  upgrade={spriteUpgrade}
                  animated
                />
              </SpriteDisplay>
              <div className="-mt-3">
                <IsoPlatform width={110} depth={5} color={accent} />
              </div>
            </div>

            {/* Right — details */}
            <div className="flex-1 p-5 sm:p-7 flex flex-col gap-3 sm:gap-4 justify-center">
              <div>
                <h3
                  className="text-lg sm:text-2xl font-bold tracking-wider transition-colors duration-300"
                  style={{ color: accent }}
                >
                  {data.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm"
                    style={{
                      color: `${accent}cc`,
                      background: `${accent}12`,
                      border: `1px solid ${accent}25`,
                    }}
                  >
                    {cat.label}
                  </span>
                  <span
                    className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: `rgba(${T.accentRgb},0.25)` }}
                  >
                    {baseCost} PP
                  </span>
                </div>
              </div>

              <div
                key={`bars-${selectedTower}-${spriteLevel}-${spriteUpgrade ?? ""}`}
                className="flex flex-col gap-2 sm:gap-2.5"
                style={{ animation: "landing-tower-enter 0.4s ease-out" }}
              >
                {statBars.map((bar) => (
                  <StatBar
                    key={bar.label}
                    label={bar.label}
                    pct={bar.pct}
                    display={bar.display}
                    color={accent}
                  />
                ))}
              </div>

              <p
                className="text-[10px] sm:text-xs italic leading-relaxed"
                style={{ color: `rgba(${T.accentRgb},0.3)` }}
              >
                {summary}
              </p>
            </div>
          </div>

          <div
            className="h-px w-full"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />

          <div className="p-4 sm:p-6 flex flex-col items-center gap-2.5">
            <div className="flex items-center justify-center gap-0.5">
              {([1, 2, 3] as const).map((level, i) => (
                <React.Fragment key={level}>
                  {i > 0 && <LevelConnector accent={accent} />}
                  <LevelPreview
                    type={selectedTower}
                    level={level}
                    active={selectedLevel === level}
                    accent={accent}
                    label={`Lv.${level}`}
                    onClick={() => handleLevelSelect(level)}
                  />
                </React.Fragment>
              ))}
            </div>

            <span
              className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: `${accent}25` }}
            >
              Choose Upgrade
            </span>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <LevelPreview
                type={selectedTower}
                level={4}
                upgrade="A"
                active={selectedLevel === 4 && selectedUpgrade === "A"}
                accent={accent}
                label={data.upgrades.A.name}
                onClick={() => handleUpgradeSelect("A")}
              />
              <span
                className="text-[8px] font-medium"
                style={{ color: `${accent}20` }}
              >
                or
              </span>
              <LevelPreview
                type={selectedTower}
                level={4}
                upgrade="B"
                active={selectedLevel === 4 && selectedUpgrade === "B"}
                accent={accent}
                label={data.upgrades.B.name}
                onClick={() => handleUpgradeSelect("B")}
              />
            </div>

            <div
              key={`desc-${selectedTower}-${selectedLevel}-${selectedUpgrade}`}
              className="text-center w-full pt-3 max-w-md"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.04)",
                animation: "landing-tower-enter 0.3s ease-out",
              }}
            >
              {selectedLevel <= 3 ? (
                <p
                  className="text-[10px] sm:text-sm leading-relaxed max-w-sm mx-auto"
                  style={{ color: `rgba(${T.accentRgb},0.4)` }}
                >
                  {data.levelDesc[selectedLevel]}
                </p>
              ) : (
                <div className="max-w-sm mx-auto">
                  <h4
                    className="text-[11px] sm:text-sm font-bold tracking-wide"
                    style={{ color: `${accent}88` }}
                  >
                    {data.upgrades[selectedUpgrade].name}
                  </h4>
                  <p
                    className="text-[9px] sm:text-xs italic mt-0.5"
                    style={{ color: `${accent}55` }}
                  >
                    {data.upgrades[selectedUpgrade].desc}
                  </p>
                  <p
                    className="text-[9px] sm:text-xs mt-1"
                    style={{ color: `rgba(${T.accentRgb},0.4)` }}
                  >
                    {data.upgrades[selectedUpgrade].effect}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <CarouselDots
          count={TOWER_ORDER.length}
          active={towerIndex}
          onDot={goToTower}
          accent={accent}
        />
      </div>
    </section>
  );
}
