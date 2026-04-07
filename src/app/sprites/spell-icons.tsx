"use client";
import { Eye, Flame, Zap, Snowflake, Coins, Swords } from "lucide-react";
import React from "react";

import type { SpellType } from "../types";

export const SPELL_ICON_COLORS: Record<SpellType, string> = {
  fireball: "text-orange-400",
  freeze: "text-cyan-400",
  hex_ward: "text-fuchsia-400",
  lightning: "text-yellow-400",
  payday: "text-amber-400",
  reinforcements: "text-purple-400",
};

const SPELL_ICON_MAP: Record<
  SpellType,
  React.FC<{ size?: number; className?: string }>
> = {
  fireball: ({ size = 16, className }) => (
    <Flame size={size} className={className} />
  ),
  freeze: ({ size = 16, className }) => (
    <Snowflake size={size} className={className} />
  ),
  hex_ward: ({ size = 16, className }) => (
    <Eye size={size} className={className} />
  ),
  lightning: ({ size = 16, className }) => (
    <Zap size={size} className={className} />
  ),
  payday: ({ size = 16, className }) => (
    <Coins size={size} className={className} />
  ),
  reinforcements: ({ size = 16, className }) => (
    <Swords size={size} className={className} />
  ),
};

export const SpellIcon: React.FC<{
  type: SpellType;
  size?: number;
  className?: string;
  useDefaultColor?: boolean;
}> = ({ type, size = 16, className, useDefaultColor = true }) => {
  const IconComponent = SPELL_ICON_MAP[type];
  const defaultColor = SPELL_ICON_COLORS[type];
  const finalClassName = className || (useDefaultColor ? defaultColor : "");

  if (!IconComponent) {
    return <Zap size={size} className={finalClassName || "text-yellow-400"} />;
  }

  return <IconComponent size={size} className={finalClassName} />;
};
