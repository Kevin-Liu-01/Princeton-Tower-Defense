"use client";

import React from "react";
import {
  Heart,
  Timer,
  Zap,
  ArrowUp,
  CircleDollarSign,
  Users,
  X,
  Swords,
  Target,
  Gauge,
  Crosshair,
  CoinsIcon,
  Snowflake,
  Sparkles,
  Flame,
  TrendingUp,
  TrendingDown,
  BowArrow,
  Music,
  Focus,
  Mountain,
  Amphora,
  UserPlus,
  Repeat,
  CircleDot,
  Shield,
  Radar,
  EyeOff,
  AlertTriangle,
  Ban,
  Lock,
  Fence,
  Flag,
} from "lucide-react";
import type { Tower, Position } from "../../types";
import { TOWER_DATA, TROOP_DATA } from "../../constants";
import { calculateTowerStats, getUpgradeCost, TOWER_STATS } from "../../constants/towerStats";
import { TowerSprite } from "../../sprites";
import { useResponsiveSizes } from "./hooks";
import { PANEL, GOLD, panelGradient } from "./theme";
import { CircleActionButton } from "./CircleActionButton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TowerUpgradePanelProps {
  tower: Tower;
  screenPos: Position;
  pawPoints: number;
  cameraZoom?: number;
  upgradeTower: (towerId: string, choice?: "A" | "B") => void;
  sellTower: (towerId: string) => void;
  onClose: () => void;
  onRetargetMissile?: (towerId: string) => void;
  onToggleMissileAutoAim?: (towerId: string) => void;
  onRallyTroops?: (towerId: string) => void;
}

interface ActionButtonDef {
  id: string;
  angle: number;
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  onClick: () => void;
  disabled?: boolean;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEG_TO_RAD = Math.PI / 180;

function getUpgradeIcons(towerType: string): { A: React.ReactNode; B: React.ReactNode } {
  const map: Record<string, { A: React.ReactNode; B: React.ReactNode }> = {
    cannon: { A: <Repeat size={18} />, B: <Flame size={18} /> },
    arch: { A: <BowArrow size={18} />, B: <Music size={18} /> },
    lab: { A: <Focus size={18} />, B: <Zap size={18} /> },
    library: { A: <Mountain size={18} />, B: <Snowflake size={18} /> },
    station: { A: <CircleDot size={18} />, B: <Shield size={18} /> },
    club: { A: <Amphora size={18} />, B: <UserPlus size={18} /> },
  };
  return map[towerType] || { A: <Zap size={18} />, B: <Shield size={18} /> };
}

function buildActionButtons(
  tower: Tower,
  towerData: (typeof TOWER_DATA)[keyof typeof TOWER_DATA],
  upgradeCost: number,
  sellValue: number,
  pawPoints: number,
  upgradeTower: (id: string, choice?: "A" | "B") => void,
  sellTower: (id: string) => void,
  onToggleMissileAutoAim?: (id: string) => void,
  onRetargetMissile?: (id: string) => void,
  onRallyTroops?: (id: string) => void,
): ActionButtonDef[] {
  const buttons: ActionButtonDef[] = [];
  const icons = getUpgradeIcons(tower.type);

  // --- Upgrade buttons ---
  if (tower.level <= 2) {
    buttons.push({
      id: "upgrade",
      angle: -90,
      icon: <ArrowUp size={20} className="text-green-200" />,
      label: `Level ${tower.level + 1}`,
      subLabel: `${upgradeCost} PP`,
      onClick: () => upgradeTower(tower.id),
      disabled: pawPoints < upgradeCost,
      borderColor: "rgba(34,197,94,0.7)",
      glowColor: "rgba(34,197,94,0.3)",
      bgGradient: "linear-gradient(180deg, #166534 0%, #14532d 100%)",
    });
  }

  if (tower.level === 3) {
    buttons.push({
      id: "upgradeA",
      angle: -140,
      icon: <span className="text-red-200">{icons.A}</span>,
      label: towerData.upgrades.A.name,
      subLabel: `${upgradeCost} PP`,
      onClick: () => upgradeTower(tower.id, "A"),
      disabled: pawPoints < upgradeCost,
      borderColor: "rgba(239,68,68,0.7)",
      glowColor: "rgba(239,68,68,0.3)",
      bgGradient: "linear-gradient(180deg, #991b1b 0%, #7f1d1d 100%)",
    });
    buttons.push({
      id: "upgradeB",
      angle: -40,
      icon: <span className="text-blue-200">{icons.B}</span>,
      label: towerData.upgrades.B.name,
      subLabel: `${upgradeCost} PP`,
      onClick: () => upgradeTower(tower.id, "B"),
      disabled: pawPoints < upgradeCost,
      borderColor: "rgba(59,130,246,0.7)",
      glowColor: "rgba(59,130,246,0.3)",
      bgGradient: "linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)",
    });
  }

  // --- Mortar special buttons (bottom-right quadrant) ---
  if (tower.type === "mortar" && tower.level === 4 && tower.upgrade === "A") {
    const hasRetarget = onRetargetMissile && !tower.mortarAutoAim;
    if (onToggleMissileAutoAim) {
      buttons.push({
        id: "autoaim",
        angle: hasRetarget ? -60 : 30,
        icon: <Focus size={18} className={tower.mortarAutoAim ? "text-green-300" : "text-amber-300"} />,
        label: tower.mortarAutoAim ? "Auto-Aim" : "Manual",
        onClick: () => onToggleMissileAutoAim(tower.id),
        borderColor: tower.mortarAutoAim ? "rgba(0,200,100,0.6)" : "rgba(180,140,60,0.5)",
        glowColor: tower.mortarAutoAim ? "rgba(0,200,100,0.3)" : "rgba(180,140,60,0.2)",
        bgGradient: tower.mortarAutoAim
          ? "linear-gradient(180deg, #1a3a1a 0%, #0a200a 100%)"
          : "linear-gradient(180deg, #3a2a1a 0%, #1a1008 100%)",
      });
    }
    if (hasRetarget) {
      buttons.push({
        id: "retarget",
        angle: 60,
        icon: <Crosshair size={18} className="text-orange-300" />,
        label: "Retarget",
        onClick: () => onRetargetMissile!(tower.id),
        borderColor: "rgba(255,100,0,0.6)",
        glowColor: "rgba(255,100,0,0.3)",
        bgGradient: "linear-gradient(180deg, #4a2000 0%, #2a1000 100%)",
      });
    }
  }

  // --- Station deploy/rally button (bottom-right) ---
  if (tower.type === "station") {
    buttons.push({
      id: "deploy",
      angle: 30,
      icon: <Flag size={18} className="text-emerald-200" />,
      label: "Deploy",
      onClick: () => onRallyTroops?.(tower.id),
      borderColor: "rgba(52,211,153,0.65)",
      glowColor: "rgba(52,211,153,0.3)",
      bgGradient: "linear-gradient(180deg, #064e3b 0%, #022c22 100%)",
    });
  }

  // --- Sell button (bottom-left) ---
  buttons.push({
    id: "sell",
    angle: 150,
    icon: <CircleDollarSign size={18} className="text-amber-300" />,
    label: "Sell",
    subLabel: `+${sellValue} PP`,
    onClick: () => sellTower(tower.id),
    borderColor: GOLD.border35,
    glowColor: "rgba(180,140,60,0.25)",
    bgGradient: `linear-gradient(180deg, ${PANEL.bgWarmLight} 0%, ${PANEL.bgDark} 100%)`,
  });

  return buttons;
}

// ---------------------------------------------------------------------------
// Elaborate Ring (SVG)
// ---------------------------------------------------------------------------

function ElaborateRing({
  cx,
  cy,
  radius,
  buttons,
}: {
  cx: number;
  cy: number;
  radius: number;
  buttons: ActionButtonDef[];
}) {
  const outerR = radius + 12;
  const pad = 4;
  const size = (outerR + pad) * 2;
  const c = size / 2;

  return (
    <svg
      className="fixed pointer-events-none"
      style={{
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        zIndex: 199,
      }}
      viewBox={`0 0 ${size} ${size}`}
    >
      <defs>
        <filter id="ringGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow halo behind main ring */}
      <circle
        cx={c}
        cy={c}
        r={radius}
        fill="none"
        stroke="rgba(255,215,0,0.12)"
        strokeWidth="8"
        filter="url(#ringGlow)"
      />

      {/* Outer spinning dashed ring */}
      <circle
        cx={c}
        cy={c}
        r={outerR}
        fill="none"
        stroke="rgba(255,215,0,0.18)"
        strokeWidth="1"
        strokeDasharray="10 6"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${c} ${c}`}
          to={`360 ${c} ${c}`}
          dur="30s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Counter-rotating inner dashed ring */}
      <circle
        cx={c}
        cy={c}
        r={radius - 6}
        fill="none"
        stroke="rgba(255,215,0,0.1)"
        strokeWidth="0.75"
        strokeDasharray="4 8"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${c} ${c}`}
          to={`0 ${c} ${c}`}
          dur="20s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Main solid ring */}
      <circle
        cx={c}
        cy={c}
        r={radius}
        fill="none"
        stroke="rgba(255,215,0,0.5)"
        strokeWidth="2.5"
      />

      {/* Inner subtle ring */}
      <circle
        cx={c}
        cy={c}
        r={radius - 4}
        fill="none"
        stroke="rgba(255,215,0,0.15)"
        strokeWidth="1"
      />

      {/* Decorative tick marks at button positions */}
      {buttons.map((btn) => {
        const rad = btn.angle * DEG_TO_RAD;
        const inner = radius - 5;
        const outer = radius + 5;
        return (
          <line
            key={btn.id}
            x1={c + Math.cos(rad) * inner}
            y1={c + Math.sin(rad) * inner}
            x2={c + Math.cos(rad) * outer}
            y2={c + Math.sin(rad) * outer}
            stroke="rgba(255,215,0,0.4)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}

      {/* Small ornamental dots between ticks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = deg * DEG_TO_RAD;
        return (
          <circle
            key={deg}
            cx={c + Math.cos(rad) * radius}
            cy={c + Math.sin(rad) * radius}
            r={1.5}
            fill="rgba(255,215,0,0.2)"
          />
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const TowerUpgradePanel: React.FC<TowerUpgradePanelProps> = ({
  tower,
  screenPos,
  pawPoints,
  cameraZoom = 1,
  upgradeTower,
  sellTower,
  onClose,
  onRetargetMissile,
  onToggleMissileAutoAim,
  onRallyTroops,
}) => {
  const sizes = useResponsiveSizes();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = React.useState(0);

  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      setMeasuredHeight((prev) => (Math.abs(h - prev) > 5 ? h : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const towerData = TOWER_DATA[tower.type];
  const towerStatsDef = TOWER_STATS[tower.type];

  const upgradeCost = getUpgradeCost(tower.type, tower.level, tower.upgrade);

  const baseCost = TOWER_DATA[tower.type].cost;
  const level2Cost = tower.level >= 2 ? (TOWER_STATS[tower.type]?.levels[2]?.cost || 150) : 0;
  const level3Cost = tower.level >= 3 ? (TOWER_STATS[tower.type]?.levels[3]?.cost || 250) : 0;
  const level4Cost = tower.level >= 4 ? (TOWER_STATS[tower.type]?.level4Cost || 400) : 0;
  const totalInvested = baseCost + level2Cost + level3Cost + level4Cost;
  const sellValue = Math.round(totalInvested * 0.7);

  const baseStats = calculateTowerStats(tower.type, tower.level, tower.upgrade, 1, 1);
  const rangeBoost = tower.rangeBoost || 1;
  const damageBoost = tower.damageBoost || 1;
  const attackSpeedBoost = tower.attackSpeedBoost || 1;
  const buffedStats = calculateTowerStats(tower.type, tower.level, tower.upgrade, rangeBoost, damageBoost);
  const nextStats = tower.level < 4
    ? calculateTowerStats(tower.type, tower.level + 1, undefined, 1, 1)
    : null;
  const upgradeAStats = tower.level === 3 ? calculateTowerStats(tower.type, 4, "A", 1, 1) : null;
  const upgradeBStats = tower.level === 3 ? calculateTowerStats(tower.type, 4, "B", 1, 1) : null;

  const hasRangeBuff = rangeBoost > 1;
  const hasDamageBuff = damageBoost > 1;
  const hasAttackSpeedBuff = attackSpeedBoost > 1;

  const now = Date.now();
  const activeDebuffs = tower.debuffs?.filter(d => d.until > now) || [];
  let attackSpeedDebuff = 0;
  let damageDebuff = 0;
  let rangeDebuff = 0;
  for (const debuff of activeDebuffs) {
    switch (debuff.type) {
      case 'slow': attackSpeedDebuff = Math.max(attackSpeedDebuff, debuff.intensity); break;
      case 'weaken': damageDebuff = Math.max(damageDebuff, debuff.intensity); break;
      case 'blind': rangeDebuff = Math.max(rangeDebuff, debuff.intensity); break;
    }
  }
  const hasSpeedDebuff = attackSpeedDebuff > 0;
  const hasDamageDebuff = damageDebuff > 0;
  const hasRangeDebuff = rangeDebuff > 0;

  // ---- Stats array ----
  const statsToShow: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    value: number | string;
    buffedValue?: number | string;
    debuffedValue?: number | string;
    nextValue?: number | string;
    isBoosted?: boolean;
    isDebuffed?: boolean;
    boostAmount?: number;
    debuffAmount?: number;
    colSpan?: number;
    colorClass: string;
    buffColorClass: string;
    debuffColorClass: string;
  }> = [];

  if (baseStats.damage > 0) {
    const debuffedDamage = hasDamageDebuff ? Math.floor(buffedStats.damage * (1 - damageDebuff)) : undefined;
    statsToShow.push({
      key: "damage", label: "Damage", icon: <Swords size={14} />,
      value: Math.floor(baseStats.damage),
      buffedValue: hasDamageBuff ? Math.floor(buffedStats.damage) : undefined,
      debuffedValue: debuffedDamage,
      nextValue: nextStats && nextStats.damage > baseStats.damage ? Math.floor(nextStats.damage) : undefined,
      isBoosted: hasDamageBuff, isDebuffed: hasDamageDebuff,
      boostAmount: hasDamageBuff ? Math.round((damageBoost - 1) * 100) : undefined,
      debuffAmount: hasDamageDebuff ? Math.round(damageDebuff * 100) : undefined,
      colorClass: "bg-red-950/60 border-red-800/50 text-red-400",
      buffColorClass: "bg-orange-950/60 border-orange-500/70 text-orange-400",
      debuffColorClass: "bg-rose-950/60 border-rose-500/70 text-rose-400",
    });
  }

  if (baseStats.range > 0 && tower.type !== "club") {
    const debuffedRange = hasRangeDebuff ? Math.floor(buffedStats.range * (1 - rangeDebuff)) : undefined;
    statsToShow.push({
      key: "range", label: "Range", icon: <Radar size={14} />,
      value: Math.floor(baseStats.range),
      buffedValue: hasRangeBuff ? Math.floor(buffedStats.range) : undefined,
      debuffedValue: debuffedRange,
      nextValue: nextStats && nextStats.range > baseStats.range ? Math.floor(nextStats.range) : undefined,
      isBoosted: hasRangeBuff, isDebuffed: hasRangeDebuff,
      boostAmount: hasRangeBuff ? Math.round((rangeBoost - 1) * 100) : undefined,
      debuffAmount: hasRangeDebuff ? Math.round(rangeDebuff * 100) : undefined,
      colorClass: "bg-blue-950/60 border-blue-800/50 text-blue-400",
      buffColorClass: "bg-cyan-950/60 border-cyan-500/70 text-cyan-400",
      debuffColorClass: "bg-purple-950/60 border-purple-500/70 text-purple-400",
    });
  }

  if (baseStats.attackSpeed > 0) {
    const buffedAttackSpeedMs = hasAttackSpeedBuff
      ? Math.max(60, Math.floor(baseStats.attackSpeed / attackSpeedBoost))
      : undefined;
    const speedBaseForDebuff = buffedAttackSpeedMs ?? baseStats.attackSpeed;
    const debuffedSpeed = hasSpeedDebuff
      ? Math.floor(speedBaseForDebuff / (1 - attackSpeedDebuff))
      : undefined;
    statsToShow.push({
      key: "speed", label: "Speed", icon: <Gauge size={14} />,
      value: `${(baseStats.attackSpeed / 1000).toFixed(1)}s`,
      buffedValue: buffedAttackSpeedMs ? `${(buffedAttackSpeedMs / 1000).toFixed(2)}s` : undefined,
      debuffedValue: debuffedSpeed ? `${(debuffedSpeed / 1000).toFixed(1)}s` : undefined,
      nextValue: nextStats && nextStats.attackSpeed !== baseStats.attackSpeed && nextStats.attackSpeed > 0
        ? `${(nextStats.attackSpeed / 1000).toFixed(1)}s` : undefined,
      isBoosted: hasAttackSpeedBuff, isDebuffed: hasSpeedDebuff,
      boostAmount: hasAttackSpeedBuff ? Math.round((attackSpeedBoost - 1) * 100) : undefined,
      debuffAmount: hasSpeedDebuff ? Math.round(attackSpeedDebuff * 100) : undefined,
      colorClass: "bg-green-950/60 border-green-800/50 text-green-400",
      buffColorClass: "bg-indigo-950/60 border-indigo-500/70 text-indigo-300",
      debuffColorClass: "bg-blue-950/60 border-blue-500/70 text-blue-400",
    });
  }

  if (baseStats.slowAmount && baseStats.slowAmount > 0) {
    statsToShow.push({
      key: "slow", label: "Slow", icon: <Snowflake size={14} />,
      value: `${Math.round(baseStats.slowAmount * 100)}%`,
      nextValue: nextStats && nextStats.slowAmount && nextStats.slowAmount > baseStats.slowAmount
        ? `${Math.round(nextStats.slowAmount * 100)}%` : undefined,
      colorClass: "bg-purple-950/60 border-purple-800/50 text-purple-400",
      buffColorClass: "bg-purple-950/60 border-purple-500/70 text-purple-400",
      debuffColorClass: "bg-rose-950/60 border-rose-500/70 text-rose-400",
    });
  }

  if (baseStats.chainTargets && baseStats.chainTargets > 1) {
    statsToShow.push({
      key: "chain", label: "Targets", icon: <Users size={14} />,
      value: `${baseStats.chainTargets}`,
      nextValue: nextStats && nextStats.chainTargets && nextStats.chainTargets > baseStats.chainTargets
        ? `${nextStats.chainTargets}` : undefined,
      colorClass: "bg-yellow-950/60 border-yellow-800/50 text-yellow-400",
      buffColorClass: "bg-yellow-950/60 border-yellow-500/70 text-yellow-400",
      debuffColorClass: "bg-rose-950/60 border-rose-500/70 text-rose-400",
    });
  }

  if (baseStats.splashRadius && baseStats.splashRadius > 0) {
    statsToShow.push({
      key: "splash", label: "Splash", icon: <Target size={14} />,
      value: Math.floor(baseStats.splashRadius),
      colorClass: "bg-orange-950/60 border-orange-800/50 text-orange-400",
      buffColorClass: "bg-orange-950/60 border-orange-500/70 text-orange-400",
      debuffColorClass: "bg-rose-950/60 border-rose-500/70 text-rose-400",
    });
  }

  if (baseStats.stunChance && baseStats.stunChance > 0) {
    statsToShow.push({
      key: "stun", label: "Freeze", icon: <Snowflake size={14} />,
      value: `${Math.round(baseStats.stunChance * 100)}%`,
      colorClass: "bg-indigo-950/60 border-indigo-800/50 text-indigo-400",
      buffColorClass: "bg-indigo-950/60 border-indigo-500/70 text-indigo-400",
      debuffColorClass: "bg-rose-950/60 border-rose-500/70 text-rose-400",
    });
  }

  if (baseStats.burnDamage && baseStats.burnDamage > 0) {
    statsToShow.push({
      key: "burn", label: "Burn", icon: <Flame size={14} />,
      value: `${baseStats.burnDamage}/s`,
      colorClass: "bg-red-950/60 border-red-800/50 text-red-400",
      buffColorClass: "bg-red-950/60 border-red-500/70 text-red-400",
      debuffColorClass: "bg-rose-950/60 border-rose-500/70 text-rose-400",
    });
  }

  if (tower.type === "station") {
    const baseDeployRange = TOWER_DATA.station.spawnRange || 180;
    const boostedDeployRange = Math.floor(baseDeployRange * rangeBoost);
    statsToShow.push({
      key: "deployRange", label: "Deploy", icon: <Fence size={14} />,
      value: baseDeployRange,
      buffedValue: hasRangeBuff ? boostedDeployRange : undefined,
      isBoosted: hasRangeBuff,
      boostAmount: hasRangeBuff ? Math.round((rangeBoost - 1) * 100) : undefined,
      colSpan: 2,
      colorClass: "bg-orange-950/60 border-orange-800/50 text-orange-400",
      buffColorClass: "bg-cyan-950/60 border-cyan-500/70 text-cyan-400",
      debuffColorClass: "bg-rose-950/60 border-rose-500/70 text-rose-400",
    });
  }

  const activeUpgradeStats = tower.level === 4 && tower.upgrade ? towerStatsDef?.upgrades?.[tower.upgrade]?.stats : null;

  if (tower.type !== "club") {
    if (activeUpgradeStats?.rangeBuff) {
      statsToShow.push({
        key: "rangeBuff", label: "Range Aura", icon: <Radar size={14} />,
        value: `+${Math.round(activeUpgradeStats.rangeBuff * 100)}%`,
        colorClass: "bg-cyan-950/60 border-cyan-800/50 text-cyan-400",
        buffColorClass: "bg-cyan-950/60 border-cyan-500/70 text-cyan-400",
        debuffColorClass: "bg-rose-950/60 border-rose-500/70 text-rose-400",
      });
    }
    if (activeUpgradeStats?.damageBuff) {
      statsToShow.push({
        key: "damageBuff", label: "DMG Aura", icon: <TrendingUp size={14} />,
        value: `+${Math.round(activeUpgradeStats.damageBuff * 100)}%`,
        colorClass: "bg-orange-950/60 border-orange-800/50 text-orange-400",
        buffColorClass: "bg-orange-950/60 border-orange-500/70 text-orange-400",
        debuffColorClass: "bg-rose-950/60 border-rose-500/70 text-rose-400",
      });
    }
  }

  const gridCols = statsToShow.length <= 2 ? 2 : statsToShow.length <= 3 ? 3 : 4;

  // ---- Circle geometry ----
  const towerVisualOffsetY = 35 * cameraZoom;
  const circleCenterX = screenPos.x;
  const circleCenterY = screenPos.y + towerVisualOffsetY;
  const circleRadius = Math.round(70 * cameraZoom);
  const btnOrbitRadius = circleRadius;
  const btnSize = 44;
  const panelCircleGap = 8;

  // ---- Action buttons ----
  const circleButtons = buildActionButtons(
    tower, towerData as (typeof TOWER_DATA)[keyof typeof TOWER_DATA],
    upgradeCost, sellValue, pawPoints,
    upgradeTower, sellTower, onToggleMissileAutoAim, onRetargetMissile, onRallyTroops,
  );

  // ---- Panel positioning ----
  const panelWidth = 235;
  let panelX = screenPos.x - panelWidth / 2;
  panelX = Math.max(10, Math.min(panelX, window.innerWidth - panelWidth - 10));

  const aboveAnchorY = circleCenterY - circleRadius - panelCircleGap - 28;
  const belowAnchorY = circleCenterY + circleRadius + panelCircleGap + 28;
  const estimatedHeight = measuredHeight || 280;
  const fitsAbove = aboveAnchorY - estimatedHeight >= 10;
  const flipBelow = !fitsAbove;
  const panelY = flipBelow ? belowAnchorY : aboveAnchorY;
  const panelTransform = flipBelow ? "none" : "translateY(-100%)";
  const maxPanelH = flipBelow
    ? window.innerHeight - belowAnchorY - 10
    : aboveAnchorY - 10;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <>
      {/* Semi-transparent overlay with circular cutout */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 199,
          background: `radial-gradient(circle at ${circleCenterX}px ${circleCenterY}px, transparent ${circleRadius - 2}px, rgba(0, 0, 0, 0.35) ${circleRadius + 6}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Elaborate SVG ring */}
      <ElaborateRing cx={circleCenterX} cy={circleCenterY} radius={circleRadius} buttons={circleButtons} />

      {/* Circle action buttons */}
      {circleButtons.map((btn) => {
        const rad = btn.angle * DEG_TO_RAD;
        const bx = circleCenterX + Math.cos(rad) * btnOrbitRadius;
        const by = circleCenterY + Math.sin(rad) * btnOrbitRadius;
        return (
          <CircleActionButton
            key={btn.id}
            x={bx}
            y={by}
            size={btnSize}
            icon={btn.icon}
            label={btn.label}
            subLabel={btn.subLabel}
            onClick={btn.onClick}
            disabled={btn.disabled}
            borderColor={btn.borderColor}
            glowColor={btn.glowColor}
            bgGradient={btn.bgGradient}
          />
        );
      })}

      {/* Info panel (stats only) */}
      <div
        ref={panelRef}
        className="fixed pointer-events-none"
        style={{ left: panelX, top: panelY, transform: panelTransform, zIndex: 200, width: panelWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-2 pointer-events-auto rounded-lg backdrop-blur-sm relative"
          style={{
            background: panelGradient,
            border: `2px solid ${GOLD.border35}`,
            boxShadow: `0 0 30px ${GOLD.glow07}, inset 0 0 15px ${GOLD.glow04}`,
            maxHeight: maxPanelH,
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Inner ghost border */}
          <div className="absolute inset-[2px] rounded-[7px] pointer-events-none" style={{ border: '1px solid ' + GOLD.innerBorder10 }} />

          <button
            onClick={() => onClose()}
            className="absolute top-1.5 right-1.5 p-0.5 rounded-md transition-all hover:scale-110 z-20"
            style={{ background: PANEL.bgWarmMid, border: '1px solid ' + GOLD.border25 }}
          >
            <X size={12} className="text-amber-400" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5 pb-1.5" style={{ borderBottom: '1px solid ' + GOLD.border25 }}>
            <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: PANEL.bgDeep, border: '1.5px solid ' + GOLD.border30 }}>
              <TowerSprite type={tower.type} size={sizes.towerIconLarge} level={tower.level} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-300 truncate">{towerData.name}</span>
                <div className="flex">
                  {[...Array(tower.level)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-[9px]">★</span>
                  ))}
                </div>
              </div>
              {tower.level === 4 && tower.upgrade && (
                <div className="text-[9px] text-amber-400 font-medium">
                  {towerData.upgrades[tower.upgrade].name}
                </div>
              )}
              <div className="text-[8px] text-amber-500/80 mt-0.5 line-clamp-2">
                {tower.level === 4 && tower.upgrade
                  ? towerData.upgrades[tower.upgrade].desc
                  : towerData.desc}
              </div>
            </div>
          </div>

          {/* Buff Banner */}
          {(hasRangeBuff || hasDamageBuff || hasAttackSpeedBuff) && (
            <div className="mb-1.5 p-1 bg-gradient-to-r from-cyan-950/70 to-orange-950/70 rounded-md border border-yellow-600/40 flex items-center justify-center gap-1.5 flex-wrap">
              <Sparkles size={10} className="text-yellow-400" />
              <span className="text-[8px] text-yellow-300 font-bold">BUFFED</span>
              {hasRangeBuff && tower.type !== "station" && (
                <span className="flex items-center gap-0.5 px-1 py-0.5 bg-cyan-900/60 rounded text-cyan-300 text-[8px]">
                  <Radar size={9} /> +{Math.round((rangeBoost - 1) * 100)}%
                </span>
              )}
              {hasRangeBuff && tower.type === "station" && (
                <span className="flex items-center gap-0.5 px-1 py-0.5 bg-cyan-900/60 rounded text-cyan-300 text-[8px]">
                  <Fence size={9} /> +{Math.round((rangeBoost - 1) * 100)}%
                </span>
              )}
              {hasDamageBuff && (
                <span className="flex items-center gap-0.5 px-1 py-0.5 bg-orange-900/60 rounded text-orange-300 text-[8px]">
                  <Swords size={9} /> +{Math.round((damageBoost - 1) * 100)}%
                </span>
              )}
              {hasAttackSpeedBuff && (
                <span className="flex items-center gap-0.5 px-1 py-0.5 bg-indigo-900/60 rounded text-indigo-300 text-[8px]">
                  <Timer size={9} /> +{Math.round((attackSpeedBoost - 1) * 100)}%
                </span>
              )}
            </div>
          )}

          {/* Debuff Banner */}
          {tower.debuffs && tower.debuffs.filter(d => d.until > Date.now()).length > 0 && (() => {
            const liveDebuffs = tower.debuffs!.filter(d => d.until > Date.now());
            const disableDebuff = liveDebuffs.find(d => d.type === 'disable');
            const otherDebuffs = liveDebuffs.filter(d => d.type !== 'disable');

            const consolidatedDebuffs = new Map<string, { type: string; intensity: number; until: number }>();
            for (const d of otherDebuffs) {
              const existing = consolidatedDebuffs.get(d.type);
              if (!existing || d.intensity > existing.intensity) {
                consolidatedDebuffs.set(d.type, d);
              }
            }

            const disableThemes = {
              freeze: { icon: <Snowflake size={12} />, label: "FROZEN", bgClass: "bg-gradient-to-r from-cyan-950/80 to-blue-950/80", borderClass: "border-cyan-500/60", headerColor: "text-cyan-300", barGradient: "linear-gradient(90deg, #22d3ee, #3b82f6)", tagClass: "bg-cyan-900/60 text-cyan-200 border-cyan-600/40" },
              petrify: { icon: <Mountain size={12} />, label: "PETRIFIED", bgClass: "bg-gradient-to-r from-stone-900/80 to-gray-900/80", borderClass: "border-stone-400/60", headerColor: "text-stone-300", barGradient: "linear-gradient(90deg, #a8a29e, #78716c)", tagClass: "bg-stone-800/60 text-stone-200 border-stone-600/40" },
              hold: { icon: <Lock size={12} />, label: "ON HOLD", bgClass: "bg-gradient-to-r from-amber-950/80 to-red-950/80", borderClass: "border-amber-500/60", headerColor: "text-amber-300", barGradient: "linear-gradient(90deg, #fbbf24, #f59e0b)", tagClass: "bg-amber-900/60 text-amber-200 border-amber-600/40" },
              stun: { icon: <Zap size={12} />, label: "STUNNED", bgClass: "bg-gradient-to-r from-yellow-950/80 to-orange-950/80", borderClass: "border-yellow-500/60", headerColor: "text-yellow-300", barGradient: "linear-gradient(90deg, #facc15, #f97316)", tagClass: "bg-yellow-900/60 text-yellow-200 border-yellow-600/40" },
            };

            return (
              <>
                {disableDebuff && (() => {
                  const flavor = ((disableDebuff as typeof disableDebuff & { disableFlavor?: string }).disableFlavor || 'stun') as keyof typeof disableThemes;
                  const theme = disableThemes[flavor] || disableThemes.stun;
                  const remaining = Math.max(0, (disableDebuff.until - Date.now()) / 1000);
                  const abilityName = (disableDebuff as typeof disableDebuff & { abilityName?: string }).abilityName;
                  return (
                    <div className={`mb-1.5 p-2 rounded-md border-2 ${theme.bgClass} ${theme.borderClass}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className={`flex items-center gap-1.5 ${theme.headerColor}`}>
                          <div className="animate-pulse">{theme.icon}</div>
                          <div>
                            <div className="text-[10px] font-black tracking-wider">{theme.label}</div>
                            {abilityName && <div className="text-[7px] opacity-60">{abilityName}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/90 font-mono font-bold tabular-nums">
                          <Timer size={10} className="opacity-70" />
                          <span>{remaining.toFixed(1)}s</span>
                        </div>
                      </div>
                      <div className="w-full h-1 rounded-full bg-black/50 overflow-hidden mb-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, remaining / 5 * 100)}%`,
                            background: theme.barGradient,
                            transition: 'width 0.15s linear',
                          }}
                        />
                      </div>
                      <div className={`flex items-center justify-center gap-1 text-[8px] px-1.5 py-0.5 rounded border ${theme.tagClass}`}>
                        <Ban size={8} />
                        <span className="font-medium">Tower disabled</span>
                      </div>
                    </div>
                  );
                })()}

                {consolidatedDebuffs.size > 0 && (
                  <div className="mb-1.5 p-1 bg-gradient-to-r from-red-950/70 to-rose-950/70 rounded-md border border-red-600/50">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <AlertTriangle size={10} className="text-red-400 animate-pulse" />
                      <span className="text-[8px] text-red-300 font-bold">DEBUFFED</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {Array.from(consolidatedDebuffs.values()).map((debuff, i) => {
                        const remaining = Math.ceil((debuff.until - Date.now()) / 1000);
                        const debuffInfo: Record<string, { icon: React.ReactNode; label: string; color: string; desc: string }> = {
                          slow: { icon: <Timer size={9} />, label: "Slowed", color: "bg-blue-900/60 text-blue-300 border-blue-700/50", desc: `-${Math.round(debuff.intensity * 100)}% Atk Spd` },
                          weaken: { icon: <TrendingDown size={9} />, label: "Weakened", color: "bg-red-900/60 text-red-300 border-red-700/50", desc: `-${Math.round(debuff.intensity * 100)}% Damage` },
                          blind: { icon: <EyeOff size={9} />, label: "Blinded", color: "bg-purple-900/60 text-purple-300 border-purple-700/50", desc: `-${Math.round(debuff.intensity * 100)}% Range` },
                        };
                        const info = debuffInfo[debuff.type];
                        if (!info) return null;
                        return (
                          <div key={i} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[8px] ${info.color}`}>
                            {info.icon}
                            <span className="font-medium">{info.desc}</span>
                            <span className="opacity-60">({remaining}s)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Stats Grid */}
          {statsToShow.length > 0 && (
            <div className={`grid gap-1 mb-1.5`} style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
              {statsToShow.map((stat) => {
                const isDebuffed = stat.isDebuffed && stat.debuffedValue !== undefined;
                const isBoosted = stat.isBoosted && stat.buffedValue !== undefined;
                const colorClass = isDebuffed ? stat.debuffColorClass : (isBoosted ? stat.buffColorClass : stat.colorClass);

                return (
                  <div
                    key={stat.key}
                    className={`p-1 rounded-md border text-center ${colorClass}`}
                    style={stat.colSpan ? { gridColumn: `span ${stat.colSpan}` } : undefined}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      {stat.icon}
                      <span className="text-[7px] opacity-80">{stat.label}</span>
                      {isBoosted && !isDebuffed && <TrendingUp size={8} className="text-yellow-400" />}
                      {isDebuffed && <TrendingDown size={8} className="text-red-400" />}
                    </div>
                    {isDebuffed ? (
                      <>
                        <div className="font-bold text-sm leading-tight">
                          <span className="text-white/40 line-through text-xs mr-0.5">
                            {isBoosted ? stat.buffedValue : stat.value}
                          </span>
                          <span className="text-red-300">{stat.debuffedValue}</span>
                        </div>
                        <div className="text-[7px] text-red-400">-{stat.debuffAmount}%</div>
                      </>
                    ) : isBoosted ? (
                      <>
                        <div className="font-bold text-sm leading-tight">
                          <span className="text-white/40 line-through text-xs mr-0.5">{stat.value}</span>
                          <span>{stat.buffedValue}</span>
                        </div>
                        <div className="text-[7px] text-yellow-400">+{stat.boostAmount}%</div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-[11px]">{stat.value}</div>
                        {stat.nextValue && (
                          <div className="text-green-400 text-[7px]">→ {stat.nextValue}</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Eating Club Special Display */}
          {tower.type === "club" && (
            <div className="mb-1.5 bg-amber-950/40 rounded-md p-1.5 border border-amber-700/50">
              <div className="flex items-center gap-1 mb-1">
                <CoinsIcon size={12} className="text-amber-400" />
                <span className="text-[9px] font-bold text-amber-300">Paw Points Generation</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-1">
                <div className="bg-amber-900/40 p-1 rounded border border-amber-700/40 text-center">
                  <div className="text-[7px] text-amber-500">Paw Points</div>
                  <div className="text-amber-300 font-bold text-xs">+{baseStats.income || 8}</div>
                  {nextStats && nextStats.income && nextStats.income > (baseStats.income || 0) && (
                    <div className="text-green-400 text-[8px]">→ +{nextStats.income}</div>
                  )}
                </div>
                <div className="bg-amber-900/40 p-1 rounded border border-amber-700/40 text-center">
                  <div className="text-[7px] text-amber-500">Interval</div>
                  <div className="text-amber-300 font-bold text-xs">{(baseStats.incomeInterval || 8000) / 1000}s</div>
                  {nextStats && nextStats.incomeInterval && nextStats.incomeInterval < (baseStats.incomeInterval || 0) && (
                    <div className="text-green-400 text-[8px]">→ {nextStats.incomeInterval / 1000}s</div>
                  )}
                </div>
              </div>
              <div className="text-[7px] text-amber-400/80 text-center mb-1">
                Earns <span className="font-bold text-amber-300">+{baseStats.income || 8} PP</span> every <span className="font-bold text-amber-300">{(baseStats.incomeInterval || 8000) / 1000}s</span>
              </div>

              {tower.level === 4 && tower.upgrade && activeUpgradeStats && (activeUpgradeStats.rangeBuff || activeUpgradeStats.damageBuff) && (
                <div className="pt-1 border-t border-amber-700/40">
                  <div className="grid grid-cols-1 gap-1.5">
                    {activeUpgradeStats.rangeBuff && (
                      <div className="bg-cyan-900/40 p-1 rounded border border-cyan-700/40 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <Radar size={10} className="text-cyan-400" />
                          <span className="text-[7px] text-cyan-500">Range Aura</span>
                        </div>
                        <div className="text-cyan-300 font-bold text-xs">+{Math.round(activeUpgradeStats.rangeBuff * 100)}%</div>
                      </div>
                    )}
                    {activeUpgradeStats.damageBuff && (
                      <div className="bg-orange-900/40 p-1 rounded border border-orange-700/40 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <TrendingUp size={10} className="text-orange-400" />
                          <span className="text-[7px] text-orange-500">Damage Aura</span>
                        </div>
                        <div className="text-orange-300 font-bold text-xs">+{Math.round(activeUpgradeStats.damageBuff * 100)}%</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dinky Station Troop Display */}
          {tower.type === "station" && (() => {
            const getTroopKey = () => {
              if (tower.level === 1) return "footsoldier";
              if (tower.level === 2) return "armored";
              if (tower.level === 3) return "elite";
              if (tower.level === 4) {
                if (tower.upgrade === "B") return "cavalry";
                if (tower.upgrade === "A") return "centaur";
                return "knight";
              }
              return "footsoldier";
            };
            const troop = TROOP_DATA[getTroopKey()];
            if (!troop) return null;

            return (
              <div className="mb-1.5 bg-stone-900/50 rounded-md p-1.5 border border-stone-700/40">
                <div className="flex items-center gap-1 mb-1">
                  <Users size={12} className="text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-300">Garrison: {troop.name}</span>
                  <span className="text-[7px] bg-stone-800 px-1 py-0.5 rounded text-stone-400 ml-auto">
                    {troop.isMounted ? "Mounted" : troop.isRanged ? "Ranged" : "Infantry"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-1">
                  <div className="bg-red-950/40 p-1 rounded border border-red-900/30 text-center">
                    <Heart size={10} className="mx-auto text-red-400" />
                    <div className="text-[7px] text-red-500">HP</div>
                    <span className="text-red-200 font-bold text-[10px]">{troop.hp}</span>
                  </div>
                  <div className="bg-orange-950/40 p-1 rounded border border-orange-900/30 text-center">
                    <Swords size={10} className="mx-auto text-orange-400" />
                    <div className="text-[7px] text-orange-500">DMG</div>
                    <span className="text-orange-200 font-bold text-[10px]">{troop.damage}</span>
                  </div>
                  <div className="bg-green-950/40 p-1 rounded border border-green-900/30 text-center">
                    {troop.isRanged ? <Crosshair size={10} className="mx-auto text-green-400" /> : <Gauge size={10} className="mx-auto text-green-400" />}
                    <div className="text-[7px] text-green-500">{troop.isRanged ? "Range" : "Speed"}</div>
                    <span className="text-green-200 font-bold text-[10px]">{troop.isRanged ? troop.range : `${(troop.attackSpeed / 1000).toFixed(1)}s`}</span>
                  </div>
                </div>
                <div className="text-[7px] text-stone-400 text-center italic">
                  {troop.desc}
                </div>
              </div>
            );
          })()}

          {/* Upgrade Preview for Level 3 */}
          {tower.level === 3 && upgradeAStats && upgradeBStats && (
            <div className="grid grid-cols-2 gap-1 text-[7px]">
              <div className="bg-red-950/40 p-1 rounded-md border border-red-800/40">
                <div className="text-red-300 text-center">{towerData.upgrades.A.effect}</div>
              </div>
              <div className="bg-blue-950/40 p-1 rounded-md border border-blue-800/40">
                <div className="text-blue-300 text-center">{towerData.upgrades.B.effect}</div>
              </div>
            </div>
          )}

          {/* Arrow pointer */}
          {!flipBelow ? (
            <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2">
              <div className="w-3 h-3 transform rotate-45" style={{ background: PANEL.bgDark, borderBottom: `1px solid ${GOLD.border35}`, borderRight: `1px solid ${GOLD.border35}` }} />
            </div>
          ) : (
            <div className="absolute left-1/2 -top-2 transform -translate-x-1/2">
              <div className="w-3 h-3 transform rotate-45" style={{ background: PANEL.bgDark, borderTop: `1px solid ${GOLD.border35}`, borderLeft: `1px solid ${GOLD.border35}` }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
