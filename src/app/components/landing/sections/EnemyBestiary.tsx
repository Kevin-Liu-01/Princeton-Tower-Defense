"use client";
import React from "react";
import type { EnemyType, MapTheme } from "../../../types";
import { ENEMY_DATA } from "../../../constants/enemies";
import { EnemySprite } from "../../../sprites/enemies";
import { LANDING_THEME } from "../landingConstants";
import { SpriteDisplay } from "./SpriteDisplay";
import { SlotCorners } from "./LoadoutUI";

const T = LANDING_THEME;

interface EnemyShowcaseEntry {
  type: EnemyType;
  region?: MapTheme;
}

const ENEMIES: EnemyShowcaseEntry[] = [
  { type: "skeleton_knight" },
  { type: "phoenix", region: "volcanic" },
  { type: "frost_giant", region: "winter" },
  { type: "djinn", region: "desert" },
  { type: "dark_knight" },
  { type: "swamp_hydra", region: "swamp" },
  { type: "ancient_ent" },
  { type: "lich" },
  { type: "death_knight" },
  { type: "basilisk", region: "desert" },
  { type: "giant_eagle" },
  { type: "marsh_troll", region: "swamp" },
  { type: "manticore" },
  { type: "frost_elemental", region: "winter" },
  { type: "fire_elemental", region: "volcanic" },
  { type: "warlock" },
];

const ENEMY_VISUAL = 64;
const ENEMY_CANVAS_SCALE = 2.2;
const ENEMY_CANVAS = Math.round(ENEMY_VISUAL * ENEMY_CANVAS_SCALE);

function EnemyCard({ entry }: { entry: EnemyShowcaseEntry }) {
  const data = ENEMY_DATA[entry.type];
  if (!data) return null;

  return (
    <div
      className="relative flex flex-col items-center gap-2 p-3 sm:p-4 transition-all duration-300 hover:scale-[1.05]"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 6,
        width: 96,
      }}
    >
      <SlotCorners color={data.color} />
      <SpriteDisplay
        visualSize={ENEMY_VISUAL}
        canvasScale={ENEMY_CANVAS_SCALE}
      >
        <EnemySprite
          type={entry.type}
          size={ENEMY_CANVAS}
          region={entry.region}
        />
      </SpriteDisplay>
      <span
        className="text-[7px] sm:text-[8px] font-bold text-center whitespace-nowrap max-w-[84px] truncate uppercase tracking-wider"
        style={{ color: `${data.color}88` }}
      >
        {data.name}
      </span>
    </div>
  );
}

export function EnemyBestiary() {
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
          Enemy Intel
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          100+ Enemies
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 px-4 sm:px-8 max-w-4xl mx-auto">
        {ENEMIES.map((entry) => (
          <EnemyCard key={entry.type} entry={entry} />
        ))}
      </div>

      <p
        className="text-center text-[10px] sm:text-xs mt-8 italic"
        style={{ color: `rgba(${T.accentRgb},0.2)` }}
      >
        Undead, elementals, beasts, dark knights, academics &mdash; every
        region brings new threats
      </p>
    </section>
  );
}
