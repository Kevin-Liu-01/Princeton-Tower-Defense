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

import { SpriteDisplay } from "./SpriteDisplay";
import { CarouselDots } from "../CarouselControls";
import { SectionFlourish } from "./LoadoutUI";
import {
  MapSectionHeader,
  MapSectionBg,
  MapContentPanel,
  BattleBackdrop,
  StatBlock,
} from "./mapElements";

const T = LANDING_THEME;

const TOWER_ORDER: TowerType[] = [
  "cannon", "mortar", "library", "lab", "arch", "station", "club",
];

const TOWER_BG: Record<TowerType, string> = {
  cannon: "/images/new/gameplay_volcano.png",
  mortar: "/images/new/gameplay_desert.png",
  library: "/images/new/gameplay_winter.png",
  lab: "/images/new/gameplay_swamp.png",
  arch: "/images/new/gameplay_grounds.png",
  station: "/images/new/gameplay_grounds.png",
  club: "/images/new/gameplay_desert.png",
};

const SHOWCASE_VIS = 240;
const SHOWCASE_SCALE = 2.4;
const SHOWCASE_CANVAS = Math.round(SHOWCASE_VIS * SHOWCASE_SCALE);

const EVO_VIS = 48;
const EVO_SCALE = 2.0;
const EVO_CANVAS = Math.round(EVO_VIS * EVO_SCALE);

interface StatEntry {
  label: string;
  value: string;
}

function getTowerStats(type: TowerType, level: number, upgrade?: "A" | "B"): StatEntry[] {
  const stats = calculateTowerStats(type, level, upgrade);
  const out: StatEntry[] = [];

  if (stats.damage > 0) out.push({ label: "DMG", value: `${Math.round(stats.damage)}` });
  if ((stats.slowAmount ?? 0) > 0) out.push({ label: "SLOW", value: `${Math.round(stats.slowAmount! * 100)}%` });
  if ((stats.income ?? 0) > 0) out.push({ label: "INCOME", value: `${stats.income} PP` });
  if ((stats.maxTroops ?? 0) > 0 && stats.damage === 0 && !stats.income) out.push({ label: "TROOPS", value: `×${stats.maxTroops}` });
  if (stats.range > 0) out.push({ label: "RANGE", value: `${Math.round(stats.range)}` });

  if (stats.attackSpeed > 0) {
    out.push({ label: "RATE", value: `${(1000 / stats.attackSpeed).toFixed(1)}/s` });
  } else if ((stats.spawnInterval ?? 0) > 0) {
    out.push({ label: "SPAWN", value: `${(stats.spawnInterval! / 1000).toFixed(0)}s` });
  } else if ((stats.incomeInterval ?? 0) > 0) {
    out.push({ label: "CYCLE", value: `${(stats.incomeInterval! / 1000).toFixed(0)}s` });
  }

  if ((stats.splashRadius ?? 0) > 0) out.push({ label: "AOE", value: `${Math.round(stats.splashRadius!)}` });
  if ((stats.chainTargets ?? 0) > 1) out.push({ label: "CHAIN", value: `×${stats.chainTargets}` });

  return out;
}

function EvoNode({
  type, level, upgrade, active, accent, label, onClick,
}: {
  type: TowerType; level: 1 | 2 | 3 | 4; upgrade?: "A" | "B";
  active: boolean; accent: string; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0 cursor-pointer transition-all duration-300 group"
      style={{ transform: active ? "scale(1.1)" : "scale(1)" }}
    >
      <div className="relative">
        {active && (
          <div
            className="absolute -inset-3 rounded-full animate-landing-glow-breathe pointer-events-none"
            style={{ background: `radial-gradient(circle, ${accent}25, transparent 70%)` }}
          />
        )}
        <div
          className="relative w-[60px] h-[60px] sm:w-[66px] sm:h-[66px] rounded-full flex items-center justify-center overflow-hidden transition-all duration-300"
          style={{
            background: active
              ? `radial-gradient(circle at 40% 35%, ${accent}20, ${accent}0a)`
              : "rgba(255,255,255,0.03)",
            border: active ? `2px solid ${accent}` : "1.5px solid rgba(255,255,255,0.08)",
            boxShadow: active
              ? `0 0 24px ${accent}30, 0 0 48px ${accent}10, inset 0 0 20px ${accent}0a`
              : "0 2px 8px rgba(0,0,0,0.3), inset 0 0 12px rgba(0,0,0,0.2)",
          }}
        >
          {active && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 30%, ${accent}15, transparent 70%)` }}
            />
          )}
          <SpriteDisplay visualSize={EVO_VIS} canvasScale={EVO_SCALE}>
            <TowerSprite type={type} size={EVO_CANVAS} level={level} upgrade={upgrade} />
          </SpriteDisplay>
        </div>
        {active && (
          <div
            className="absolute -inset-1 rounded-full pointer-events-none"
            style={{
              border: `1px solid ${accent}20`,
              animation: "landing-ring-rotate 12s linear infinite",
            }}
          >
            {[0, 120, 240].map((deg) => (
              <div
                key={deg}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  top: "50%", left: "50%",
                  transform: `rotate(${deg}deg) translateY(-${32}px) translate(-50%, -50%)`,
                  background: `${accent}60`,
                  boxShadow: `0 0 4px ${accent}40`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      <span
        className="text-[8px] sm:text-[9px] font-bold tracking-wider text-center leading-tight max-w-[80px] mt-2 transition-colors duration-200"
        style={{ color: active ? accent : `${accent}40` }}
      >
        {label}
      </span>
    </button>
  );
}

function EvoConnector({ accent, lit }: { accent: string; lit: boolean }) {
  return (
    <div className="flex items-center self-center mx-0.5">
      <div
        className="relative w-6 sm:w-10 h-[3px] rounded-full overflow-hidden"
        style={{ background: `${accent}10` }}
      >
        {lit && (
          <div className="absolute inset-0 rounded-full" style={{
            background: `linear-gradient(90deg, ${accent}50, ${accent}aa, ${accent}50)`,
            backgroundSize: "200% 100%",
            animation: "landing-connector-flow 2s linear infinite",
          }} />
        )}
      </div>
      <svg width="7" height="12" viewBox="0 0 7 12" className="-ml-0.5">
        <path d="M0,0 L7,6 L0,12" fill={lit ? `${accent}70` : `${accent}15`} />
      </svg>
    </div>
  );
}

function BranchFork({ accent, litA, litB }: { accent: string; litA: boolean; litB: boolean }) {
  const anyLit = litA || litB;
  return (
    <div className="flex flex-col items-center self-center mx-1">
      <div className="flex items-center">
        <div
          className="w-4 sm:w-6 h-[3px] rounded-l-full"
          style={{ background: anyLit ? `${accent}50` : `${accent}10` }}
        />
        <div className="relative flex flex-col items-start" style={{ gap: "22px" }}>
          <div className="flex items-center">
            <div
              className="w-3 sm:w-4 h-[3px] rounded-r-full"
              style={{ background: litA ? `${accent}50` : `${accent}10` }}
            />
            <svg width="6" height="10" viewBox="0 0 6 10" className="-ml-px">
              <path d="M0,0 L6,5 L0,10" fill={litA ? `${accent}70` : `${accent}15`} />
            </svg>
          </div>
          <div
            className="absolute left-0 h-full w-[3px] rounded-full"
            style={{
              background: anyLit ? `${accent}30` : `${accent}08`,
              top: "1px",
            }}
          />
          <div className="flex items-center">
            <div
              className="w-3 sm:w-4 h-[3px] rounded-r-full"
              style={{ background: litB ? `${accent}50` : `${accent}10` }}
            />
            <svg width="6" height="10" viewBox="0 0 6 10" className="-ml-px">
              <path d="M0,0 L6,5 L0,10" fill={litB ? `${accent}70` : `${accent}15`} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TowerShowcase() {
  const [tIdx, setTIdx] = useState(0);
  const [selLevel, setSelLevel] = useState(1);
  const [selUpgrade, setSelUpgrade] = useState<"A" | "B">("A");

  const tower = TOWER_ORDER[tIdx];
  const data = TOWER_DATA[tower];
  const accent = TOWER_ACCENTS[tower];
  const cat = TOWER_CATEGORIES[tower];
  const summary = TOWER_QUICK_SUMMARY[tower];

  const sprLv = (selLevel <= 3 ? selLevel : 4) as 1 | 2 | 3 | 4;
  const sprUp = selLevel === 4 ? selUpgrade : undefined;
  const stats = getTowerStats(tower, sprLv, sprUp);
  const cost = TOWER_STATS[tower].levels[1].cost;

  const nextT = useCallback(() => { setTIdx(p => (p + 1) % TOWER_ORDER.length); setSelLevel(1); setSelUpgrade("A"); }, []);
  const prevT = useCallback(() => { setTIdx(p => (p - 1 + TOWER_ORDER.length) % TOWER_ORDER.length); setSelLevel(1); setSelUpgrade("A"); }, []);
  const goT = useCallback((i: number) => { setTIdx(i); setSelLevel(1); setSelUpgrade("A"); }, []);

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <MapSectionBg tint={`${accent}06`} gridOpacity={0.035} />
      <div className="absolute inset-0 landing-texture-crosshatch pointer-events-none" />

      <div className="relative z-10">
        <SectionFlourish />
        <MapSectionHeader subtitle="7 Tower Classes" title="The Arsenal" />

        <div className="mx-3 sm:mx-6 lg:mx-12">
          <MapContentPanel accent={accent}>
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(170deg, ${accent}06, rgba(12,8,4,0.98), ${accent}03)`,
              border: `1px solid ${accent}18`,
              boxShadow: `0 0 80px ${accent}06, 0 20px 60px rgba(0,0,0,0.5)`,
              transition: "border-color 0.5s, box-shadow 0.5s",
            }}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left — tower on battle scene */}
              <div
                key={`tower-${tower}-${sprLv}-${sprUp ?? ""}`}
                className="relative flex flex-col items-center justify-center py-10 sm:py-14 lg:w-[45%] min-h-[320px]"
                style={{ animation: "landing-hero-reveal 0.4s ease-out" }}
              >
                <BattleBackdrop src={TOWER_BG[tower]} accent={accent} intensity={0.4} />

                {/* Platform glow rings */}
                <div className="absolute top-1/2 left-1/2 w-56 h-56 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ border: `1px dashed ${accent}15` }} />
                <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-landing-glow-breathe" style={{ background: `radial-gradient(circle, ${accent}18, transparent 70%)` }} />
                <div className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ border: `0.5px solid ${accent}08` }} />

                <div className="relative z-10">
                  <SpriteDisplay visualSize={SHOWCASE_VIS} canvasScale={SHOWCASE_SCALE}>
                    <TowerSprite type={tower} size={SHOWCASE_CANVAS} level={sprLv} upgrade={sprUp} animated />
                  </SpriteDisplay>
                </div>

                {/* Floor reflection */}
                <div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-8 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse, ${accent}12, transparent 70%)`,
                    filter: "blur(6px)",
                  }}
                />

                {/* Nav */}
                <button onClick={prevT} className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-20" style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${accent}30`, backdropFilter: "blur(8px)" }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={nextT} className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-20" style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${accent}30`, backdropFilter: "blur(8px)" }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {/* Right — info */}
              <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-5" style={{ animation: "landing-tower-enter 0.4s ease-out" }}>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black font-cinzel tracking-wide transition-colors duration-300" style={{ color: accent, textShadow: `0 0 24px ${accent}25` }}>
                    {data.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.25em] px-3 py-1.5 rounded-md" style={{ color: accent, background: `${accent}12`, border: `1px solid ${accent}28` }}>
                      {cat.label}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: `rgba(${T.accentRgb},0.25)` }}>{cost} PP</span>
                  </div>
                </div>

                {/* Stat blocks */}
                <div
                  key={`stats-${tower}-${sprLv}-${sprUp ?? ""}`}
                  className="flex gap-2.5 flex-wrap"
                  style={{ animation: "landing-tower-enter 0.4s ease-out" }}
                >
                  {stats.map(s => (
                    <StatBlock key={s.label} label={s.label} value={s.value} accent={accent} />
                  ))}
                </div>

                <p className="text-[10px] sm:text-xs italic leading-relaxed" style={{ color: `rgba(${T.accentRgb},0.3)` }}>{summary}</p>

                {/* Evolution tree */}
                <div className="pt-5" style={{ borderTop: `1px solid ${accent}10` }}>
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] mb-5" style={{ color: `${accent}35` }}>Evolution Path</p>

                  <div className="flex items-center justify-center">
                    {([1, 2, 3] as const).map((lv, i) => (
                      <React.Fragment key={lv}>
                        {i > 0 && <EvoConnector accent={accent} lit={selLevel >= lv} />}
                        <EvoNode type={tower} level={lv} active={selLevel === lv} accent={accent} label={`Lv.${lv}`} onClick={() => setSelLevel(lv)} />
                      </React.Fragment>
                    ))}

                    <BranchFork
                      accent={accent}
                      litA={selLevel === 4 && selUpgrade === "A"}
                      litB={selLevel === 4 && selUpgrade === "B"}
                    />

                    <div className="flex flex-col" style={{ gap: "6px" }}>
                      <EvoNode type={tower} level={4} upgrade="A" active={selLevel === 4 && selUpgrade === "A"} accent={accent} label={data.upgrades.A.name} onClick={() => { setSelLevel(4); setSelUpgrade("A"); }} />
                      <EvoNode type={tower} level={4} upgrade="B" active={selLevel === 4 && selUpgrade === "B"} accent={accent} label={data.upgrades.B.name} onClick={() => { setSelLevel(4); setSelUpgrade("B"); }} />
                    </div>
                  </div>

                  {/* Upgrade desc */}
                  {selLevel === 4 && (
                    <div
                      key={`udesc-${tower}-${selUpgrade}`}
                      className="mt-5 relative p-4 rounded-xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${accent}0e, rgba(20,16,10,0.8))`,
                        border: `1px solid ${accent}18`,
                        animation: "landing-tower-enter 0.3s ease-out",
                      }}
                    >
                      <div className="absolute top-0 left-2 right-2 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}35, transparent)` }} />
                      <h4 className="text-sm sm:text-base font-bold" style={{ color: `${accent}cc` }}>{data.upgrades[selUpgrade].name}</h4>
                      <p className="text-[10px] sm:text-[11px] italic mt-1" style={{ color: `${accent}55` }}>{data.upgrades[selUpgrade].desc}</p>
                      <p className="text-[10px] sm:text-[11px] mt-1.5 leading-relaxed" style={{ color: `rgba(${T.accentRgb},0.35)` }}>{data.upgrades[selUpgrade].effect}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </MapContentPanel>

          <CarouselDots count={TOWER_ORDER.length} active={tIdx} onDot={goT} accent={accent} />
        </div>
      </div>
    </section>
  );
}
