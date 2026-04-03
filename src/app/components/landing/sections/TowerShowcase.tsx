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

const T = LANDING_THEME;

const TOWER_ORDER: TowerType[] = [
  "cannon", "mortar", "library", "lab", "arch", "station", "club",
];

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
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 group" style={{ transform: active ? "scale(1.12)" : "scale(1)" }}>
      <div
        className="relative rounded-xl p-1.5 transition-all duration-300"
        style={{
          background: active ? `${accent}18` : "rgba(255,255,255,0.02)",
          border: active ? `2px solid ${accent}` : "1.5px solid rgba(255,255,255,0.06)",
          boxShadow: active ? `0 0 20px ${accent}30, 0 4px 12px rgba(0,0,0,0.3)` : "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {active && (
          <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 30%, ${accent}15, transparent 70%)` }} />
        )}
        <SpriteDisplay visualSize={EVO_VIS} canvasScale={EVO_SCALE}>
          <TowerSprite type={type} size={EVO_CANVAS} level={level} upgrade={upgrade} />
        </SpriteDisplay>
      </div>
      <span className="text-[7px] sm:text-[8px] font-bold tracking-wider text-center leading-tight max-w-[72px]" style={{ color: active ? accent : `${accent}40` }}>
        {label}
      </span>
    </button>
  );
}

function EvoConnector({ accent, lit }: { accent: string; lit: boolean }) {
  return (
    <div className="flex items-center self-start mt-8">
      <div
        className="w-6 sm:w-8 h-0.5 rounded-full relative overflow-hidden"
        style={{ background: `${accent}15` }}
      >
        {lit && (
          <div className="absolute inset-0 rounded-full" style={{
            background: `linear-gradient(90deg, ${accent}50, ${accent}aa, ${accent}50)`,
            backgroundSize: "200% 100%",
            animation: "landing-connector-flow 2s linear infinite",
          }} />
        )}
      </div>
      <div className="w-0 h-0" style={{ borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: `4px solid ${lit ? accent : `${accent}25`}` }} />
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
      {/* Section atmosphere */}
      <div className="absolute inset-0 landing-texture-crosshatch pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none transition-colors duration-700" style={{
        background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${accent}06, transparent 60%)`,
      }} />

      <div className="relative z-10">
        <SectionFlourish />

        <div className="text-center mt-8 sm:mt-12 mb-8 sm:mb-10 px-6">
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.35em] uppercase mb-3" style={{ color: `rgba(${T.accentRgb},0.35)` }}>
            7 Tower Classes
          </p>
          <h2
            className="text-3xl sm:text-5xl font-bold tracking-wide font-cinzel"
            style={{
              color: T.accent,
              textShadow: `0 0 60px rgba(${T.accentRgb},0.3), 0 4px 12px rgba(0,0,0,0.6)`,
            }}
          >
            The Arsenal
          </h2>
        </div>

        <div className="mx-3 sm:mx-6 lg:mx-12">
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
              {/* Left — tower on platform */}
              <div
                key={`tower-${tower}-${sprLv}-${sprUp ?? ""}`}
                className="relative flex flex-col items-center justify-center py-10 sm:py-14 lg:w-[45%]"
                style={{ animation: "landing-hero-reveal 0.4s ease-out" }}
              >
                {/* Platform rings */}
                <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ border: `1px dashed ${accent}12` }} />
                <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-landing-glow-breathe" style={{ background: `radial-gradient(circle, ${accent}12, transparent 70%)` }} />

                <div className="relative z-10">
                  <SpriteDisplay visualSize={SHOWCASE_VIS} canvasScale={SHOWCASE_SCALE}>
                    <TowerSprite type={tower} size={SHOWCASE_CANVAS} level={sprLv} upgrade={sprUp} animated />
                  </SpriteDisplay>
                </div>

                {/* Nav */}
                <button onClick={prevT} className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-20" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${accent}25` }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={nextT} className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-20" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${accent}25` }}>
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
                  className="flex gap-2 flex-wrap"
                  style={{ animation: "landing-tower-enter 0.4s ease-out" }}
                >
                  {stats.map(s => (
                    <div key={s.label} className="flex flex-col items-center px-3.5 py-2.5 rounded-lg min-w-[58px]" style={{ background: `${accent}0a`, border: `1px solid ${accent}15` }}>
                      <span className="text-sm sm:text-base font-black tabular-nums" style={{ color: accent }}>{s.value}</span>
                      <span className="text-[6px] sm:text-[7px] font-bold uppercase tracking-[0.2em] mt-0.5" style={{ color: `${accent}55` }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] sm:text-xs italic leading-relaxed" style={{ color: `rgba(${T.accentRgb},0.3)` }}>{summary}</p>

                {/* Evolution tree */}
                <div className="pt-4" style={{ borderTop: `1px solid ${accent}10` }}>
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: `${accent}35` }}>Evolution Path</p>

                  <div className="flex items-start justify-center gap-0">
                    {([1, 2, 3] as const).map((lv, i) => (
                      <React.Fragment key={lv}>
                        {i > 0 && <EvoConnector accent={accent} lit={selLevel >= lv} />}
                        <EvoNode type={tower} level={lv} active={selLevel === lv} accent={accent} label={`Lv.${lv}`} onClick={() => setSelLevel(lv)} />
                      </React.Fragment>
                    ))}

                    <div className="flex flex-col items-center self-start mt-2 ml-1">
                      <div className="flex items-center">
                        <EvoConnector accent={accent} lit={selLevel === 4 && selUpgrade === "A"} />
                        <EvoNode type={tower} level={4} upgrade="A" active={selLevel === 4 && selUpgrade === "A"} accent={accent} label={data.upgrades.A.name} onClick={() => { setSelLevel(4); setSelUpgrade("A"); }} />
                      </div>
                      <div className="flex items-center mt-2">
                        <EvoConnector accent={accent} lit={selLevel === 4 && selUpgrade === "B"} />
                        <EvoNode type={tower} level={4} upgrade="B" active={selLevel === 4 && selUpgrade === "B"} accent={accent} label={data.upgrades.B.name} onClick={() => { setSelLevel(4); setSelUpgrade("B"); }} />
                      </div>
                    </div>
                  </div>

                  {/* Upgrade desc */}
                  {selLevel === 4 && (
                    <div key={`udesc-${tower}-${selUpgrade}`} className="mt-4 p-3 rounded-lg" style={{ background: `${accent}08`, border: `1px solid ${accent}12`, animation: "landing-tower-enter 0.3s ease-out" }}>
                      <h4 className="text-xs sm:text-sm font-bold" style={{ color: `${accent}bb` }}>{data.upgrades[selUpgrade].name}</h4>
                      <p className="text-[9px] sm:text-[11px] italic mt-0.5" style={{ color: `${accent}50` }}>{data.upgrades[selUpgrade].desc}</p>
                      <p className="text-[9px] sm:text-[11px] mt-1" style={{ color: `rgba(${T.accentRgb},0.35)` }}>{data.upgrades[selUpgrade].effect}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CarouselDots count={TOWER_ORDER.length} active={tIdx} onDot={goT} accent={accent} />
        </div>
      </div>
    </section>
  );
}
