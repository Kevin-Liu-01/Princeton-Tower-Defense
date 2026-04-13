"use client";

import {
  Heart,
  Timer,
  Zap,
  Users,
  X,
  Swords,
  Target,
  Coins,
  Gauge,
  ShieldHalf,
  Info,
  Crown,
  Crosshair,
  Snowflake,
  Sparkles,
  Flame,
  TrendingDown,
  Eye,
  EyeOff,
  AlertTriangle,
  Footprints,
  Droplets,
  Zap as ZapIcon,
  Ban,
  Wind,
} from "lucide-react";
import React from "react";

import {
  DEFAULT_ENEMY_TROOP_ATTACK_SPEED,
  DEFAULT_ENEMY_TROOP_DAMAGE,
  ENEMY_DATA,
  HERO_DATA,
  TROOP_DATA,
  ENEMY_TRAIT_META,
  ENEMY_ABILITY_META,
  deriveEnemyTags,
} from "../../constants";
import { EnemySprite, HeroSprite, TroopSprite } from "../../sprites";
import type { Enemy, Troop, Hero, Position, EnemyTrait } from "../../types";
import {
  InspectPanel,
  ENEMY_INSPECT_THEME,
  TROOP_INSPECT_THEME,
  HERO_INSPECT_THEME,
} from "./InspectOverlay";
import {
  PANEL,
  GOLD,
  PURPLE_CARD,
  dividerGradient,
  panelGradient,
} from "./system/theme";

// =============================================================================
// ENEMY INSPECTOR COMPONENT (toggle button + status)
// =============================================================================

interface EnemyInspectorProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  selectedEnemy: Enemy | null;
  setSelectedEnemy: (enemy: Enemy | null) => void;
  enemies: Enemy[];
  troops: Troop[];
  setGameSpeed: (speed: number) => void;
  previousGameSpeed: number;
  setPreviousGameSpeed: (speed: number) => void;
  gameSpeed: number;
  onDeactivate?: () => void;
}

export const EnemyInspector: React.FC<EnemyInspectorProps> = ({
  isActive,
  setIsActive,
  selectedEnemy,
  setSelectedEnemy,
  enemies,
  troops,
  setGameSpeed,
  previousGameSpeed,
  setPreviousGameSpeed,
  gameSpeed,
  onDeactivate,
}) => {
  const handleToggle = () => {
    if (!isActive) {
      setPreviousGameSpeed(gameSpeed);
      setGameSpeed(0);
      setIsActive(true);
    } else {
      setGameSpeed(previousGameSpeed > 0 ? previousGameSpeed : 1);
      setIsActive(false);
      setSelectedEnemy(null);
      onDeactivate?.();
    }
  };

  const liveTroops = troops.filter((t) => !t.dead).length;

  return (
    <div className="pointer-events-auto flex flex-col gap-2">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-lg backdrop-blur-sm transition-all relative"
        style={
          isActive
            ? {
                background: `linear-gradient(135deg, ${PURPLE_CARD.bgLight}, ${PURPLE_CARD.bgDark})`,
                border: `1.5px solid ${PURPLE_CARD.border}`,
                boxShadow: `0 0 12px ${PURPLE_CARD.glow}, inset 0 0 10px ${PURPLE_CARD.glow}`,
              }
            : {
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${GOLD.border25}`,
                boxShadow: `inset 0 0 8px ${GOLD.glow04}`,
              }
        }
      >
        <div
          className="absolute inset-[2px] rounded-[6px] pointer-events-none z-10"
          style={{
            border: `1px solid ${isActive ? PURPLE_CARD.innerBorder : GOLD.innerBorder10}`,
          }}
        />
        {isActive ? (
          <EyeOff size={14} className="text-purple-300" />
        ) : (
          <Eye size={14} className="text-amber-400" />
        )}
        <span
          className={`text-[10px] font-bold tracking-wider ${isActive ? "text-purple-200" : "text-amber-300"}`}
        >
          {isActive ? "EXIT INSPECT" : "INSPECT"}
        </span>
      </button>

      {isActive && (
        <div
          className="p-2.5 rounded-lg shadow-lg backdrop-blur-md relative min-w-[160px]"
          style={{
            background: `linear-gradient(135deg, ${PURPLE_CARD.bgLight}, ${PURPLE_CARD.bgDark})`,
            border: `1.5px solid ${PURPLE_CARD.border}`,
            boxShadow: `0 0 16px ${PURPLE_CARD.glow}, inset 0 0 10px ${PURPLE_CARD.glow}`,
          }}
        >
          <div
            className="absolute inset-[2px] rounded-[6px] pointer-events-none z-10"
            style={{ border: `1px solid ${PURPLE_CARD.innerBorder}` }}
          />
          <div className="text-[10px] text-purple-200 mb-2 font-bold text-center tracking-wider flex items-center gap-1.5 justify-center">
            <Crosshair size={12} className="text-purple-400" />
            CLICK ANY UNIT
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                Enemies
              </span>
              <span className="text-red-300 font-bold">{enemies.length}</span>
            </div>
            {liveTroops > 0 && (
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-blue-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                  Troops
                </span>
                <span className="text-blue-300 font-bold">{liveTroops}</span>
              </div>
            )}
          </div>
          {selectedEnemy && (
            <div
              className="mt-2 pt-2"
              style={{ borderTop: `1px solid ${PURPLE_CARD.border}` }}
            >
              <div className="text-[9px] text-purple-200 text-center font-medium">
                {ENEMY_DATA[selectedEnemy.type]?.name || selectedEnemy.type}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SHARED HELPERS
// =============================================================================

const TRAIT_ICONS: Record<EnemyTrait, (size: number) => React.ReactNode> = {
  aoe_attack: (s) => <Target size={s} />,
  armored: (s) => <ShieldHalf size={s} />,
  boss: (s) => <Crown size={s} />,
  breakthrough: (s) => <Zap size={s} />,
  fast: (s) => <Footprints size={s} />,
  flying: (s) => <Wind size={s} />,
  magic_resist: (s) => <Sparkles size={s} />,
  ranged: (s) => <Crosshair size={s} />,
  regenerating: (s) => <Heart size={s} />,
  summoner: (s) => <Users size={s} />,
  tower_debuffer: (s) => <TrendingDown size={s} />,
};

function getTraitInfo(trait: EnemyTrait, iconSize = 10) {
  const meta = ENEMY_TRAIT_META[trait] ?? {
    color: "text-gray-400",
    desc: "Unknown trait",
    label: trait,
    pillColor: "",
  };
  const iconFn = TRAIT_ICONS[trait];
  return {
    ...meta,
    icon: iconFn ? iconFn(iconSize) : <Info size={iconSize} />,
  };
}

const ABILITY_ICONS: Record<string, (size: number) => React.ReactNode> = {
  burn: (s) => <Flame size={s} />,
  poison: (s) => <Droplets size={s} />,
  slow: (s) => <Snowflake size={s} />,
  stun: (s) => <ZapIcon size={s} />,
  tower_blind: (s) => <EyeOff size={s} />,
  tower_disable: (s) => <Ban size={s} />,
  tower_slow: (s) => <Timer size={s} />,
  tower_weaken: (s) => <TrendingDown size={s} />,
};

function getAbilityInfo(abilityType: string, iconSize = 12) {
  const meta =
    ENEMY_ABILITY_META[abilityType as keyof typeof ENEMY_ABILITY_META] ??
    ENEMY_ABILITY_META.default;
  const iconFn = ABILITY_ICONS[abilityType];
  return {
    ...meta,
    icon: iconFn ? iconFn(iconSize) : <AlertTriangle size={iconSize} />,
  };
}

function CompactHpBar({ current, max }: { current: number; max: number }) {
  const pct = (current / max) * 100;
  const barClass =
    pct > 66
      ? "from-emerald-600 to-emerald-400"
      : pct > 33
        ? "from-amber-600 to-amber-400"
        : "from-red-600 to-red-400";
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[9px] mb-1">
        <span className="text-red-400/80 font-bold flex items-center gap-0.5 uppercase tracking-wider text-[8px]">
          <Heart size={9} /> HP
        </span>
        <span className="text-white/90 font-mono text-[8px]">
          {Math.ceil(current)} / {max}
        </span>
      </div>
      <div
        className="w-full h-2.5 rounded-full overflow-hidden"
        style={{
          background: PANEL.bgDeep,
          border: `1px solid ${GOLD.innerBorder08}`,
        }}
      >
        <div
          className={`h-full bg-gradient-to-r ${barClass} transition-all duration-300 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadges({
  unit,
  isEnemy,
}: {
  unit: Enemy | Troop | Hero;
  isEnemy?: boolean;
}) {
  const now = Date.now();
  const enemy = isEnemy ? (unit as Enemy) : null;
  const friendly = !isEnemy ? (unit as Troop | Hero) : null;

  const badges: React.ReactNode[] = [];

  if (enemy) {
    if (enemy.burning) {
      badges.push(
        <StatusBadge
          key="burn"
          icon={<Flame size={8} />}
          label="Burning"
          className="bg-orange-900/40 text-orange-300"
        />
      );
    }
    if (enemy.slowed) {
      badges.push(
        <StatusBadge
          key="slow"
          icon={<Snowflake size={8} />}
          label="Slowed"
          className="bg-cyan-900/40 text-cyan-300"
        />
      );
    }
    if (enemy.frozen) {
      badges.push(
        <StatusBadge
          key="freeze"
          icon={<Snowflake size={8} />}
          label="Frozen"
          className="bg-blue-900/40 text-blue-300"
        />
      );
    }
    if (enemy.stunUntil > now) {
      badges.push(
        <StatusBadge
          key="stun"
          icon={<ZapIcon size={8} />}
          label="Stunned"
          className="bg-yellow-900/40 text-yellow-300"
        />
      );
    }
    if (enemy.taunted) {
      badges.push(
        <StatusBadge
          key="taunt"
          icon={<AlertTriangle size={8} />}
          label="Taunted"
          className="bg-red-900/40 text-red-300"
        />
      );
    }
    if (enemy.hexWard && enemy.hexWardUntil && enemy.hexWardUntil > now) {
      badges.push(
        <StatusBadge
          key="hex"
          icon={<Sparkles size={8} />}
          label={`Hexed${enemy.hexWardDamageAmp ? ` +${Math.round(enemy.hexWardDamageAmp * 100)}%` : ""}`}
          className="bg-fuchsia-950/50 text-fuchsia-300"
        />
      );
    }
  }

  if (friendly) {
    const f = friendly as unknown as Record<string, unknown>;
    if (f.burning && f.burnUntil && (f.burnUntil as number) > now) {
      badges.push(
        <StatusBadge
          key="burn"
          icon={<Flame size={8} />}
          label="Burning"
          className="bg-orange-900/40 text-orange-300"
        />
      );
    }
    if (f.slowed && f.slowUntil && (f.slowUntil as number) > now) {
      badges.push(
        <StatusBadge
          key="slow"
          icon={<Snowflake size={8} />}
          label="Slowed"
          className="bg-cyan-900/40 text-cyan-300"
        />
      );
    }
    if (f.poisoned && f.poisonUntil && (f.poisonUntil as number) > now) {
      badges.push(
        <StatusBadge
          key="poison"
          icon={<Droplets size={8} />}
          label="Poisoned"
          className="bg-green-900/40 text-green-300"
        />
      );
    }
    if (f.stunned && f.stunUntil && (f.stunUntil as number) > now) {
      badges.push(
        <StatusBadge
          key="stun"
          icon={<ZapIcon size={8} />}
          label="Stunned"
          className="bg-yellow-900/40 text-yellow-300"
        />
      );
    }
  }

  if (badges.length === 0) {
    return null;
  }
  return (
    <div className="mt-2">
      <div className="mb-1.5 h-px" style={{ background: dividerGradient }} />
      <div className="text-[8px] text-purple-400/70 font-bold mb-1 uppercase tracking-[0.15em]">
        Status
      </div>
      <div className="flex flex-wrap gap-1">{badges}</div>
    </div>
  );
}

function StatusBadge({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className: string;
}) {
  return (
    <span
      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] ${className}`}
    >
      {icon} {label}
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className: string;
}) {
  return (
    <div className={`p-1.5 rounded-lg border text-center ${className}`}>
      <div className="flex items-center justify-center gap-0.5 mb-0.5">
        {icon}
        <span className="text-[7px] opacity-70 uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <div className="font-bold text-[11px] leading-tight">{value}</div>
    </div>
  );
}

// =============================================================================
// ENEMY DETAIL TOOLTIP (compact with glowing circle overlay)
// =============================================================================

interface EnemyDetailTooltipProps {
  enemy: Enemy;
  position: Position;
  onClose: () => void;
}

export const EnemyDetailTooltip: React.FC<EnemyDetailTooltipProps> = ({
  enemy,
  position,
  onClose,
}) => {
  const eData = ENEMY_DATA[enemy.type];
  if (!eData) {
    return null;
  }

  const traits = eData.traits || [];
  const abilities = eData.abilities || [];
  const hasAoE = eData.aoeRadius && eData.aoeDamage;

  const header = (
    <div className="flex items-center gap-2">
      <div
        className="w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden relative"
        style={{
          background: eData.color + "15",
          border: `1.5px solid ${eData.color}55`,
        }}
      >
        <div
          className="absolute inset-0 rounded-md blur-[6px] opacity-60 z-0"
          style={{
            background: `radial-gradient(circle, ${eData.color}99, transparent 70%)`,
          }}
        />
        <div className="relative z-10">
          <EnemySprite type={enemy.type} size={48} animated />
        </div>
      </div>
      <div className="flex-1 min-w-0 pr-5">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-red-100 truncate">
            {eData.name}
          </span>
          <div className="flex items-center gap-0.5 px-1 py-0.5 bg-rose-950/60 rounded border border-rose-800/50">
            <Heart size={9} className="text-rose-400" />
            <span className="text-rose-300 font-bold text-[8px]">
              {eData.liveCost || 1}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {deriveEnemyTags(enemy.type)
            .slice(0, 4)
            .map((tag) => (
              <span
                key={tag.id}
                className="text-[8px] font-bold uppercase tracking-wide px-1 py-0.5 rounded leading-none"
                style={{
                  color: tag.color,
                  background: `${tag.color}15`,
                }}
              >
                {tag.label}
              </span>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <InspectPanel
      unitScreenPos={position}
      theme={ENEMY_INSPECT_THEME}
      onClose={onClose}
      header={header}
    >
      <CompactHpBar current={enemy.hp} max={enemy.maxHp} />

      <div className="grid grid-cols-4 gap-1 mb-1.5">
        <StatTile
          icon={<Heart size={10} className="text-red-400" />}
          label="HP"
          value={eData.hp}
          className="bg-red-950/40 border-red-900/40 text-red-400"
        />
        <StatTile
          icon={<Gauge size={10} className="text-blue-400" />}
          label="Speed"
          value={eData.speed}
          className="bg-blue-950/40 border-blue-900/40 text-blue-400"
        />
        <StatTile
          icon={<ShieldHalf size={10} className="text-amber-400" />}
          label="Armor"
          value={`${Math.round(eData.armor * 100)}%`}
          className="bg-amber-950/40 border-amber-900/40 text-amber-400"
        />
        <StatTile
          icon={<Coins size={10} className="text-green-400" />}
          label="Bounty"
          value={eData.bounty}
          className="bg-green-950/40 border-green-900/40 text-green-400"
        />
      </div>

      {eData.isRanged && (
        <div className="grid grid-cols-3 gap-1 mb-1.5">
          <StatTile
            icon={<Target size={9} className="text-purple-400" />}
            label="Range"
            value={eData.range ?? "—"}
            className="bg-purple-950/40 border-purple-900/40 text-purple-400"
          />
          <StatTile
            icon={<Timer size={9} className="text-purple-400" />}
            label="Atk Spd"
            value={`${((eData.attackSpeed ?? 1000) / 1000).toFixed(1)}s`}
            className="bg-purple-950/40 border-purple-900/40 text-purple-400"
          />
          <StatTile
            icon={<Swords size={9} className="text-purple-400" />}
            label="Proj Dmg"
            value={eData.projectileDamage ?? "—"}
            className="bg-purple-950/40 border-purple-900/40 text-purple-400"
          />
        </div>
      )}

      {hasAoE && (
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          <StatTile
            icon={<Target size={9} className="text-orange-400" />}
            label="AoE Rad"
            value={eData.aoeRadius ?? 0}
            className="bg-orange-950/40 border-orange-900/40 text-orange-400"
          />
          <StatTile
            icon={<Swords size={9} className="text-orange-400" />}
            label="AoE Dmg"
            value={eData.aoeDamage ?? 0}
            className="bg-orange-950/40 border-orange-900/40 text-orange-400"
          />
        </div>
      )}

      {eData.targetsTroops && eData.troopDamage && (
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          <StatTile
            icon={<Wind size={9} className="text-cyan-400" />}
            label="Swoop"
            value={eData.troopDamage}
            className="bg-cyan-950/40 border-cyan-900/40 text-cyan-400"
          />
          <StatTile
            icon={<Timer size={9} className="text-cyan-400" />}
            label="Atk Spd"
            value={`${((eData.troopAttackSpeed || DEFAULT_ENEMY_TROOP_ATTACK_SPEED) / 1000).toFixed(1)}s`}
            className="bg-cyan-950/40 border-cyan-900/40 text-cyan-400"
          />
        </div>
      )}

      {!eData.flying && !eData.breakthrough && !eData.isRanged && (
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          <StatTile
            icon={<Swords size={9} className="text-red-400" />}
            label="Melee"
            value={eData.troopDamage ?? DEFAULT_ENEMY_TROOP_DAMAGE}
            className="bg-red-950/40 border-red-900/40 text-red-400"
          />
          <StatTile
            icon={<Timer size={9} className="text-red-400" />}
            label="Atk Spd"
            value="1.0s"
            className="bg-red-950/40 border-red-900/40 text-red-400"
          />
        </div>
      )}

      {eData.breakthrough && (
        <div className="mb-1.5 bg-sky-950/40 p-1 rounded-md border border-sky-900/40 text-center">
          <div className="text-sky-200 font-bold text-[9px] flex items-center justify-center gap-1">
            <Zap size={10} className="text-sky-400" /> Bypasses Troops
          </div>
          {eData.troopDamage != null && (
            <div className="text-[8px] text-sky-300/90">
              Hero Dmg:{" "}
              <span className="font-bold text-sky-200">
                {eData.troopDamage}
              </span>
            </div>
          )}
        </div>
      )}

      {traits.length > 0 && (
        <div className="mb-2">
          <div
            className="mb-1.5 h-px"
            style={{ background: dividerGradient }}
          />
          <div className="text-[8px] text-purple-400/70 font-bold mb-1 flex items-center gap-0.5 uppercase tracking-[0.15em]">
            <Info size={8} /> Traits
          </div>
          <div className="flex flex-wrap gap-1">
            {traits.map((trait, i) => {
              const info = getTraitInfo(trait);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 bg-stone-800/60 rounded border border-stone-700/50 ${info.color}`}
                  title={info.desc}
                >
                  {info.icon}
                  <span className="text-[8px] font-medium">{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {abilities.length > 0 && (
        <div className="mb-1.5">
          <div
            className="mb-1.5 h-px"
            style={{ background: dividerGradient }}
          />
          <div className="text-[8px] text-purple-400/70 font-bold mb-1 flex items-center gap-0.5 uppercase tracking-[0.15em]">
            <Zap size={8} /> Abilities
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {abilities.map((ability, i) => {
              const info = getAbilityInfo(ability.type);
              return (
                <div
                  key={i}
                  className={`p-1.5 rounded-md border ${info.bgColor}`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={info.color}>{info.icon}</span>
                    <span className="text-[9px] font-bold text-white">
                      {ability.name}
                    </span>
                    <span className="text-[7px] px-1 py-0.5 bg-black/30 rounded text-white/70 ml-auto">
                      {Math.round(ability.chance * 100)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[8px]">
                    <span className="text-white/60">
                      Dur:{" "}
                      <span className="text-white">
                        {(ability.duration / 1000).toFixed(1)}s
                      </span>
                    </span>
                    {ability.intensity !== undefined && (
                      <span className="text-white/60">
                        {ability.type === "slow" ||
                        ability.type.includes("tower")
                          ? "Eff: "
                          : "DPS: "}
                        <span className="text-white">
                          {ability.type === "slow" ||
                          ability.type.includes("tower")
                            ? `${Math.round(ability.intensity * 100)}%`
                            : ability.intensity}
                        </span>
                      </span>
                    )}
                    {ability.radius && (
                      <span className="text-white/60">
                        Rad:{" "}
                        <span className="text-white">{ability.radius}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <StatusBadges unit={enemy} isEnemy />
    </InspectPanel>
  );
};

// =============================================================================
// TROOP DETAIL TOOLTIP (compact with glowing circle + real sprite)
// =============================================================================

interface TroopDetailTooltipProps {
  troop: Troop;
  position: Position;
  onClose: () => void;
}

export const TroopDetailTooltip: React.FC<TroopDetailTooltipProps> = ({
  troop,
  position,
  onClose,
}) => {
  const troopType = troop.type || "footsoldier";
  const tData = TROOP_DATA[troopType];
  if (!tData) {
    return null;
  }

  const damage = troop.overrideDamage ?? tData.damage;
  const atkSpeed = troop.overrideAttackSpeed ?? tData.attackSpeed;

  const header = (
    <div className="flex items-center gap-2">
      <div
        className="w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden relative"
        style={{
          background: "rgba(59, 130, 246, 0.12)",
          border: "1.5px solid rgba(59, 130, 246, 0.4)",
        }}
      >
        <div
          className="absolute inset-0 rounded-md blur-[6px] opacity-60 z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.6), transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <TroopSprite type={troopType} size={48} animated />
        </div>
      </div>
      <div className="flex-1 min-w-0 pr-5">
        <span className="text-xs font-bold text-blue-100 truncate block">
          {tData.name}
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[8px] px-1 py-0.5 bg-blue-900/60 rounded text-blue-300 font-bold">
            TROOP
          </span>
          {troop.ownerType && (
            <span className="text-[8px] px-1 py-0.5 bg-slate-800/60 rounded text-slate-300">
              {troop.ownerType.toUpperCase()}
            </span>
          )}
          {troop.isHexGhost && (
            <span className="text-[8px] px-1 py-0.5 bg-fuchsia-950/60 rounded text-fuchsia-300 font-bold">
              HEX
            </span>
          )}
          {(troop.overrideIsRanged || tData.isRanged) && (
            <span className="text-[8px] px-1 py-0.5 bg-green-900/60 rounded text-green-300">
              RANGED
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <InspectPanel
      unitScreenPos={position}
      theme={TROOP_INSPECT_THEME}
      onClose={onClose}
      header={header}
    >
      <CompactHpBar current={troop.hp} max={troop.maxHp} />

      <div className="grid grid-cols-3 gap-1 mb-1">
        <StatTile
          icon={<Swords size={10} className="text-red-400" />}
          label="DMG"
          value={damage}
          className="bg-red-950/40 border-red-900/40 text-red-400"
        />
        <StatTile
          icon={<Timer size={10} className="text-blue-400" />}
          label="Atk Spd"
          value={`${(atkSpeed / 1000).toFixed(1)}s`}
          className="bg-blue-950/40 border-blue-900/40 text-blue-400"
        />
        <StatTile
          icon={<Heart size={10} className="text-green-400" />}
          label="Max HP"
          value={troop.maxHp}
          className="bg-green-950/40 border-green-900/40 text-green-400"
        />
      </div>

      <div className="mb-1.5 h-px" style={{ background: dividerGradient }} />
      <div className="text-[9px] text-stone-400/80 italic text-center mb-1.5 leading-relaxed">
        {tData.desc}
      </div>

      <StatusBadges unit={troop} />
    </InspectPanel>
  );
};

// =============================================================================
// HERO DETAIL TOOLTIP (compact with glowing circle + real sprite)
// =============================================================================

interface HeroDetailTooltipProps {
  hero: Hero;
  position: Position;
  onClose: () => void;
}

export const HeroDetailTooltip: React.FC<HeroDetailTooltipProps> = ({
  hero,
  position,
  onClose,
}) => {
  const hData = HERO_DATA[hero.type];
  if (!hData) {
    return null;
  }

  const header = (
    <div className="flex items-center gap-2">
      <div
        className="w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden relative"
        style={{
          background: "rgba(245, 158, 11, 0.12)",
          border: "1.5px solid rgba(245, 158, 11, 0.4)",
        }}
      >
        <div
          className="absolute inset-0 rounded-md blur-[6px] opacity-60 z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(245, 158, 11, 0.6), transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <HeroSprite type={hero.type} size={48} animated />
        </div>
      </div>
      <div className="flex-1 min-w-0 pr-5">
        <span className="text-xs font-bold text-amber-100 truncate block">
          {hData.name}
        </span>
        <span className="text-[8px] px-1 py-0.5 bg-amber-900/60 rounded text-amber-300 font-bold">
          HERO
        </span>
      </div>
    </div>
  );

  return (
    <InspectPanel
      unitScreenPos={position}
      theme={HERO_INSPECT_THEME}
      onClose={onClose}
      header={header}
    >
      <CompactHpBar current={hero.hp} max={hero.maxHp} />

      <div className="grid grid-cols-4 gap-1 mb-1.5">
        <StatTile
          icon={<Swords size={10} className="text-red-400" />}
          label="DMG"
          value={hData.damage}
          className="bg-red-950/40 border-red-900/40 text-red-400"
        />
        <StatTile
          icon={<Target size={10} className="text-blue-400" />}
          label="Range"
          value={hData.range}
          className="bg-blue-950/40 border-blue-900/40 text-blue-400"
        />
        <StatTile
          icon={<Timer size={10} className="text-amber-400" />}
          label="Atk Spd"
          value={`${(hData.attackSpeed / 1000).toFixed(1)}s`}
          className="bg-amber-950/40 border-amber-900/40 text-amber-400"
        />
        <StatTile
          icon={<Gauge size={10} className="text-green-400" />}
          label="Speed"
          value={hData.speed}
          className="bg-green-950/40 border-green-900/40 text-green-400"
        />
      </div>

      <div className="mb-1.5 h-px" style={{ background: dividerGradient }} />
      <div
        className="p-2 rounded-lg border mb-1.5"
        style={{
          background: "rgba(139, 92, 246, 0.08)",
          borderColor: "rgba(139, 92, 246, 0.25)",
          boxShadow: "inset 0 0 10px rgba(139, 92, 246, 0.05)",
        }}
      >
        <div className="text-[8px] text-purple-400/70 font-bold mb-1 flex items-center gap-0.5 uppercase tracking-[0.15em]">
          <Sparkles size={8} /> Ability
        </div>
        <div className="text-[9px] text-purple-200 leading-relaxed">
          {hData.ability}
        </div>
      </div>

      <StatusBadges unit={hero} />
    </InspectPanel>
  );
};
