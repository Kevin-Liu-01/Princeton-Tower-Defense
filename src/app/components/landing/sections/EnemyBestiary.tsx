"use client";
import React from "react";

import { ENEMY_DATA } from "../../../constants/enemies";
import { EnemySprite } from "../../../sprites/enemies";
import type { EnemyType, MapTheme } from "../../../types";
import { LANDING_THEME } from "../landingConstants";
import { SectionFlourish } from "./LoadoutUI";
import {
  MapSectionHeader,
  MapSectionBg,
  SectionBorderFrame,
} from "./mapElements";
import { SpriteDisplay } from "./SpriteDisplay";

const T = LANDING_THEME;

interface BestiaryEntry {
  type: EnemyType;
  region?: MapTheme;
  threat: "boss" | "elite" | "minion";
}

const ROW_A: BestiaryEntry[] = [
  { region: "desert", threat: "boss", type: "phoenix" },
  { region: "desert", threat: "elite", type: "djinn" },
  { threat: "minion", type: "skeleton_knight" },
  { region: "swamp", threat: "boss", type: "swamp_hydra" },
  { region: "grassland", threat: "elite", type: "ancient_ent" },
  { threat: "boss", type: "lich" },
  { threat: "boss", type: "death_knight" },
  { region: "desert", threat: "elite", type: "basilisk" },
  { threat: "elite", type: "dark_knight" },
  { region: "winter", threat: "boss", type: "frost_colossus" },
  { region: "volcanic", threat: "elite", type: "volcanic_drake" },
  { threat: "boss", type: "skeleton_king" },
];

const ROW_B: BestiaryEntry[] = [
  { region: "grassland", threat: "elite", type: "giant_eagle" },
  { region: "swamp", threat: "minion", type: "marsh_troll" },
  { region: "desert", threat: "elite", type: "manticore" },
  { region: "winter", threat: "elite", type: "wendigo" },
  { region: "volcanic", threat: "elite", type: "lava_golem" },
  { threat: "elite", type: "warlock" },
  { threat: "boss", type: "doom_herald" },
  { region: "grassland", threat: "boss", type: "brood_mother" },
  { region: "winter", threat: "boss", type: "mammoth" },
  { region: "grassland", threat: "elite", type: "dire_bear" },
  { threat: "minion", type: "bone_mage" },
  { threat: "elite", type: "hellhound" },
];

const THREAT = {
  boss: { color: "#ef4444", icon: "\u2620", label: "BOSS" },
  elite: { color: "#f59e0b", icon: "\u2666", label: "ELITE" },
  minion: { color: "#6b7280", icon: "", label: "" },
} as const;

const SPRITE_VIS = 80;
const SPRITE_SCALE = 2.2;
const SPRITE_CANVAS = Math.round(SPRITE_VIS * SPRITE_SCALE);

function CreatureCard({ entry }: { entry: BestiaryEntry }) {
  const data = ENEMY_DATA[entry.type];
  if (!data) {
    return null;
  }

  const threat = THREAT[entry.threat];
  const isBoss = entry.threat === "boss";
  const isElite = entry.threat === "elite";

  return (
    <div
      className="relative flex flex-col items-center gap-2 p-3 sm:p-4 flex-shrink-0 rounded-xl group transition-transform duration-300 hover:scale-[1.06]"
      style={{
        background: `linear-gradient(170deg, ${data.color}10, rgba(8,6,4,0.95) 60%, ${isBoss ? "rgba(60,10,10,0.3)" : "rgba(8,6,4,0.95)"})`,
        border: `1px solid ${data.color}${isBoss ? "35" : "18"}`,
        boxShadow: isBoss
          ? `0 0 20px ${data.color}12, inset 0 0 30px rgba(0,0,0,0.5)`
          : `inset 0 0 20px rgba(0,0,0,0.4)`,
        width: isBoss ? 140 : 120,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          border: `1px solid ${data.color}35`,
          borderRadius: 12,
          boxShadow: `0 0 30px ${data.color}18`,
        }}
      />

      {/* Threat badge */}
      {(isBoss || isElite) && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-wider z-10 animate-landing-threat-pulse"
          style={
            {
              "--threat-color": `${threat.color}35`,
              background: `${threat.color}20`,
              border: `1px solid ${threat.color}40`,
              color: threat.color,
            } as React.CSSProperties
          }
        >
          {threat.icon} {threat.label}
        </div>
      )}

      {/* Sprite with glow */}
      <div className="relative mt-1">
        <div
          className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${data.color}15, transparent 70%)`,
          }}
        />
        <SpriteDisplay visualSize={SPRITE_VIS} canvasScale={SPRITE_SCALE}>
          <EnemySprite
            type={entry.type}
            size={SPRITE_CANVAS}
            region={entry.region}
          />
        </SpriteDisplay>
      </div>

      {/* Name */}
      <div className="flex flex-col items-center gap-0.5">
        <span
          className="text-[7px] sm:text-[8px] font-bold text-center uppercase tracking-wider max-w-[110px] truncate"
          style={{ color: `${data.color}aa` }}
        >
          {data.name}
        </span>
        {isBoss && (
          <div
            className="w-8 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${data.color}40, transparent)`,
            }}
          />
        )}
      </div>
    </div>
  );
}

function MarqueeRow({
  entries,
  reverse,
  speed,
}: {
  entries: BestiaryEntry[];
  reverse?: boolean;
  speed?: number;
}) {
  const doubled = [...entries, ...entries];
  return (
    <div className="w-full" style={{ overflowX: "clip", overflowY: "visible" }}>
      <div
        className={
          reverse
            ? "animate-landing-marquee-reverse"
            : "animate-landing-marquee"
        }
        style={{
          animationDuration: speed ? `${speed}s` : undefined,
          display: "flex",
          gap: "1rem",
          width: "max-content",
          willChange: "transform",
        }}
      >
        {doubled.map((entry, i) => (
          <CreatureCard key={`${entry.type}-${i}`} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export function EnemyBestiary() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <MapSectionBg tint="rgba(80,15,15,0.06)" gridOpacity={0.03} />
      <div className="absolute inset-0 landing-texture-dots pointer-events-none opacity-50" />
      <SectionBorderFrame />

      {/* Fog effect at edges */}
      <div
        className="absolute top-0 inset-x-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${T.bg}, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${T.bg}, transparent)`,
        }}
      />

      <div className="relative z-10">
        <SectionFlourish />
        <MapSectionHeader
          subtitle="100+ Creatures of Darkness"
          title="The Bestiary"
          subtitleColor="rgba(239,68,68,0.35)"
          description="Undead horrors, elemental titans, and dark sorcerers — every region harbors creatures that grow more deadly as you advance"
        />

        {/* Marquee rows */}
        <div className="relative space-y-5 sm:space-y-6 py-3">
          {/* Edge fades */}
          <div
            className="absolute left-0 top-0 bottom-0 w-28 sm:w-44 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${T.bg}, transparent)`,
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-28 sm:w-44 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${T.bg}, transparent)`,
            }}
          />

          <MarqueeRow entries={ROW_A} speed={38} />
          <MarqueeRow entries={ROW_B} reverse speed={44} />
        </div>

        {/* Threat legend */}
        <div className="flex justify-center gap-8 mt-10 sm:mt-12">
          {(["boss", "elite", "minion"] as const).map((t) => {
            const info = THREAT[t];
            return (
              <div key={t} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: info.color,
                    boxShadow: `0 0 8px ${info.color}40`,
                  }}
                />
                <span
                  className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: `${info.color}88` }}
                >
                  {t === "minion" ? "Common" : info.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
