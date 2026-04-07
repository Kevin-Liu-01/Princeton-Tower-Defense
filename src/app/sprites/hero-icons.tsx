"use client";
import {
  Cat,
  Mic,
  Shield,
  Squirrel,
  BookOpen,
  Crown,
  Wrench,
  Zap,
  Bird,
  TreePine,
} from "lucide-react";
import React from "react";

import type { HeroType } from "../types";

export const HERO_ICON_COLORS: Record<HeroType, string> = {
  captain: "text-red-400",
  engineer: "text-yellow-400",
  ivy: "text-emerald-400",
  mathey: "text-indigo-400",
  nassau: "text-amber-400",
  rocky: "text-stone-400",
  scott: "text-teal-400",
  tenor: "text-purple-400",
  tiger: "text-orange-400",
};

const HERO_ICON_MAP: Record<
  HeroType,
  React.FC<{ size?: number; className?: string }>
> = {
  captain: ({ size = 16, className }) => (
    <Crown size={size} className={className} />
  ),
  engineer: ({ size = 16, className }) => (
    <Wrench size={size} className={className} />
  ),
  ivy: ({ size = 16, className }) => (
    <TreePine size={size} className={className} />
  ),
  mathey: ({ size = 16, className }) => (
    <Shield size={size} className={className} />
  ),
  nassau: ({ size = 16, className }) => (
    <Bird size={size} className={className} />
  ),
  rocky: ({ size = 16, className }) => (
    <Squirrel size={size} className={className} />
  ),
  scott: ({ size = 16, className }) => (
    <BookOpen size={size} className={className} />
  ),
  tenor: ({ size = 16, className }) => (
    <Mic size={size} className={className} />
  ),
  tiger: ({ size = 16, className }) => (
    <Cat size={size} className={className} />
  ),
};

export const HeroIcon: React.FC<{
  type: HeroType;
  size?: number;
  className?: string;
  useDefaultColor?: boolean;
}> = ({ type, size = 16, className, useDefaultColor = true }) => {
  const IconComponent = HERO_ICON_MAP[type];
  const defaultColor = HERO_ICON_COLORS[type];
  const finalClassName = className || (useDefaultColor ? defaultColor : "");

  if (!IconComponent) {
    return <Zap size={size} className={finalClassName || "text-yellow-400"} />;
  }

  return <IconComponent size={size} className={finalClassName} />;
};
