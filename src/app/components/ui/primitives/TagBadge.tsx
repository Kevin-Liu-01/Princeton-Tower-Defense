"use client";

import {
  Swords,
  Flame,
  UsersIcon,
  CoinsIcon,
  Snowflake,
  HeartPulse,
  Feather,
  Footprints,
  CircleDot,
  Crosshair,
  Zap,
  TrendingUp,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React from "react";

import { TOWER_TAG_DEFS } from "../../../constants";
import type { TowerTag } from "../../../constants/towers";

const TAG_ICON_MAP: Record<string, LucideIcon> = {
  "circle-dot": CircleDot,
  coins: CoinsIcon,
  crosshair: Crosshair,
  feather: Feather,
  flame: Flame,
  footprints: Footprints,
  "heart-pulse": HeartPulse,
  shield: Shield,
  snowflake: Snowflake,
  swords: Swords,
  "trending-up": TrendingUp,
  users: UsersIcon,
  zap: Zap,
};

export function TagIcon({ tag, size }: { tag: TowerTag; size: number }) {
  const definition = TOWER_TAG_DEFS[tag];
  const Icon = TAG_ICON_MAP[definition.icon];
  if (!Icon) {
    return null;
  }
  return <Icon size={size} className={definition.textClass} />;
}

export function TagBadge({ tag, size = 8 }: { tag: TowerTag; size?: number }) {
  const definition = TOWER_TAG_DEFS[tag];
  return (
    <span
      className={`inline-flex items-center gap-[2px] text-[7px] sm:text-[8px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-[1px] rounded border ${definition.textClass} ${definition.bgClass} ${definition.borderClass}`}
    >
      <TagIcon tag={tag} size={size} />
      {definition.label}
    </span>
  );
}
