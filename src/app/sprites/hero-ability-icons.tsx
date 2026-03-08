"use client";
import React from "react";
import type { HeroType } from "../types";
import {
  Volume2,
  Music2,
  Shield,
  Mountain,
  Sparkles,
  Swords,
  Crosshair,
  Zap,
} from "lucide-react";

export const HERO_ABILITY_ICON_COLORS: Record<HeroType, string> = {
  tiger: "text-orange-300",
  tenor: "text-purple-300",
  mathey: "text-indigo-300",
  rocky: "text-stone-300",
  scott: "text-teal-300",
  captain: "text-red-300",
  engineer: "text-yellow-300",
};

const HERO_ABILITY_ICONS: Record<HeroType, React.FC<{ size?: number; className?: string }>> = {
  tiger: ({ size = 14, className }) => <Volume2 size={size} className={className} />,
  tenor: ({ size = 14, className }) => <Music2 size={size} className={className} />,
  mathey: ({ size = 14, className }) => <Shield size={size} className={className} />,
  rocky: ({ size = 14, className }) => <Mountain size={size} className={className} />,
  scott: ({ size = 14, className }) => <Sparkles size={size} className={className} />,
  captain: ({ size = 14, className }) => <Swords size={size} className={className} />,
  engineer: ({ size = 14, className }) => <Crosshair size={size} className={className} />,
};

export const HeroAbilityIcon: React.FC<{
  type: HeroType;
  size?: number;
  className?: string;
  useDefaultColor?: boolean;
}> = ({ type, size = 14, className, useDefaultColor = true }) => {
  const IconComponent = HERO_ABILITY_ICONS[type];
  const defaultColor = HERO_ABILITY_ICON_COLORS[type];
  const finalClassName = className || (useDefaultColor ? defaultColor : "");

  if (!IconComponent) {
    return <Zap size={size} className={finalClassName || "text-yellow-300"} />;
  }

  return <IconComponent size={size} className={finalClassName} />;
};

export const getHeroAbilityIcon = (
  heroType: HeroType,
  size: number = 14,
  className?: string
): React.ReactNode => {
  return <HeroAbilityIcon type={heroType} size={size} className={className} useDefaultColor={!className} />;
};
