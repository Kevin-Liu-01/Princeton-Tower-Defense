"use client";

import React from "react";
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
import type { TowerTag } from "../../../constants/towers";
import { TOWER_TAG_DEFS } from "../../../constants";

const TAG_ICON_MAP: Record<string, LucideIcon> = {
  swords: Swords,
  flame: Flame,
  users: UsersIcon,
  coins: CoinsIcon,
  snowflake: Snowflake,
  "heart-pulse": HeartPulse,
  feather: Feather,
  footprints: Footprints,
  "circle-dot": CircleDot,
  crosshair: Crosshair,
  zap: Zap,
  "trending-up": TrendingUp,
  shield: Shield,
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
    <span className={`inline-flex items-center gap-[2px] text-[7px] sm:text-[8px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-[1px] rounded border ${definition.textClass} ${definition.bgClass} ${definition.borderClass}`}>
      <TagIcon tag={tag} size={size} />
      {definition.label}
    </span>
  );
}
