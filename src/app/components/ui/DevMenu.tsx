"use client";

import {
  ScrollText,
  Trash2,
  Filter,
  Skull,
  Swords,
  Building2,
  Heart,
  Coins,
  Sparkles,
  Trophy,
  X,
  Zap,
  Gauge,
} from "lucide-react";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import type {
  GameEvent,
  GameEventType,
  EventStats,
} from "../../hooks/useGameEventLog";
import { EVENT_COLORS, EVENT_LABELS } from "../../hooks/useGameEventLog";
import { GOLD, panelGradient } from "./system/theme";

// =============================================================================
// CONSTANTS
// =============================================================================

const LOG_HEIGHT = 200;
const LOG_WIDTH = 410;

const EVENT_ICONS: Partial<Record<GameEventType, React.ReactNode>> = {
  defeat: <Skull size={11} />,
  enemy_killed: <Skull size={11} />,
  enemy_leaked: <Heart size={11} />,
  hero_action: <Swords size={11} />,
  income_earned: <Coins size={11} />,
  life_lost: <Heart size={11} />,
  speed_change: <Gauge size={11} />,
  spell_cast: <Sparkles size={11} />,
  tower_built: <Building2 size={11} />,
  tower_sold: <Coins size={11} />,
  tower_upgraded: <Sparkles size={11} />,
  victory: <Trophy size={11} />,
  wave_completed: <Trophy size={11} />,
  wave_started: <Zap size={11} />,
};

const FILTER_GROUPS: { label: string; types: GameEventType[] }[] = [
  { label: "Combat", types: ["enemy_killed", "enemy_leaked", "life_lost"] },
  {
    label: "Economy",
    types: ["tower_built", "tower_sold", "tower_upgraded", "income_earned"],
  },
  { label: "Waves", types: ["wave_started", "wave_completed"] },
  { label: "Abilities", types: ["spell_cast", "hero_action"] },
  { label: "Game", types: ["victory", "defeat", "game_start", "speed_change"] },
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface EventRowProps {
  event: GameEvent;
}

const EventRow: React.FC<EventRowProps> = React.memo(({ event }) => {
  const color = EVENT_COLORS[event.type];
  const label = EVENT_LABELS[event.type];
  const icon = EVENT_ICONS[event.type];
  const minutes = Math.floor(event.gameTime / 60);
  const seconds = Math.floor(event.gameTime % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-start gap-2 px-3 py-1 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04]">
      <span
        className="text-[10px] font-mono tabular-nums shrink-0 pt-0.5"
        style={{ color: "rgba(180,180,180,0.5)" }}
      >
        {timeStr}
      </span>
      <span
        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded"
        style={{
          background: `${color}15`,
          border: `1px solid ${color}25`,
          color,
        }}
      >
        {icon}
        {label}
      </span>
      <span className="text-[11px] text-amber-100/80 leading-snug pt-0.5">
        {event.message}
      </span>
    </div>
  );
});
EventRow.displayName = "EventRow";

interface StatPillProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}

const StatPill: React.FC<StatPillProps> = ({ icon, value, label, color }) => (
  <div className="flex items-center gap-1">
    <span style={{ color }}>{icon}</span>
    <span className="text-[11px] font-bold" style={{ color }}>
      {value}
    </span>
    <span className="text-[9px] uppercase" style={{ color: `${color}88` }}>
      {label}
    </span>
  </div>
);

interface StatsBarProps {
  stats: EventStats;
}

const StatsBar: React.FC<StatsBarProps> = React.memo(({ stats }) => (
  <div
    className="flex items-center gap-3 px-3 py-1.5 border-b shrink-0"
    style={{ borderColor: "rgba(180,140,60,0.15)" }}
  >
    <StatPill
      icon={<Skull size={11} />}
      value={stats.enemiesKilled}
      label="Kills"
      color="#f87171"
    />
    <StatPill
      icon={<Coins size={11} />}
      value={stats.totalIncomeEarned}
      label="Earned"
      color="#34d399"
    />
    <StatPill
      icon={<Building2 size={11} />}
      value={stats.towersBuilt}
      label="Built"
      color="#fbbf24"
    />
    <StatPill
      icon={<Sparkles size={11} />}
      value={stats.spellsCast}
      label="Spells"
      color="#c084fc"
    />
    <StatPill
      icon={<Heart size={11} />}
      value={stats.livesLost}
      label="Lost"
      color="#ef4444"
    />
  </div>
));
StatsBar.displayName = "StatsBar";

// =============================================================================
// DEV MENU COMPONENT
// =============================================================================

interface DevMenuProps {
  events: GameEvent[];
  stats: EventStats;
  onClear: () => void;
  onClose: () => void;
}

export const DevMenu: React.FC<DevMenuProps> = ({
  events,
  stats,
  onClear,
  onClose,
}) => {
  const [activeFilters, setActiveFilters] = useState<Set<GameEventType>>(
    new Set()
  );
  const [showFilters, setShowFilters] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredEvents = useMemo(() => {
    const source =
      activeFilters.size === 0
        ? events
        : events.filter((e) => activeFilters.has(e.type));
    return [...source].toReversed();
  }, [events, activeFilters]);

  const toggleFilterGroup = useCallback((types: GameEventType[]) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      const allActive = types.every((t) => next.has(t));
      if (allActive) {
        types.forEach((t) => next.delete(t));
      } else {
        types.forEach((t) => next.add(t));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredEvents.length, autoScroll]);

  return (
    <div
      className="flex flex-col pointer-events-auto mr-2 mb-1 rounded-lg overflow-hidden ml-auto"
      style={{
        background: panelGradient,
        border: `1.5px solid ${GOLD.border25}`,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
        height: LOG_HEIGHT,
        maxWidth: "calc(100vw - 16px)",
        width: LOG_WIDTH,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${GOLD.border25}` }}
      >
        <div className="flex items-center gap-2">
          <ScrollText size={13} className="text-blue-400" />
          <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
            Event Log
          </span>
          <span className="text-[10px] text-amber-500/60 font-mono tabular-nums">
            ({filteredEvents.length}
            {activeFilters.size > 0 ? `/${events.length}` : ""})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${showFilters ? "text-blue-200" : "text-amber-400/60 hover:text-amber-300"}`}
            style={{
              background: showFilters ? "rgba(60,100,200,0.2)" : "transparent",
              border: showFilters
                ? "1px solid rgba(80,120,200,0.3)"
                : "1px solid transparent",
            }}
          >
            <Filter size={10} />
            Filter
            {activeFilters.size > 0 && (
              <span className="px-1 bg-blue-500/30 text-blue-200 rounded text-[9px]">
                {activeFilters.size}
              </span>
            )}
          </button>
          <button
            onClick={() => setAutoScroll((p) => !p)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${autoScroll ? "text-green-300 bg-green-500/15 border border-green-500/25" : "text-amber-400/50 hover:text-amber-300 border border-transparent"}`}
          >
            Auto
          </button>
          <button
            onClick={onClear}
            className="p-0.5 rounded hover:bg-red-500/15 text-red-400/50 hover:text-red-300 transition-colors"
            title="Clear all events"
          >
            <Trash2 size={11} />
          </button>
          <button
            onClick={onClose}
            className="p-0.5 rounded hover:bg-white/5 text-amber-400/50 hover:text-amber-200 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div
          className="px-3 py-1.5 flex flex-wrap gap-1 shrink-0"
          style={{ borderBottom: `1px solid rgba(180,140,60,0.1)` }}
        >
          {FILTER_GROUPS.map((group) => {
            const allActive = group.types.every((t) => activeFilters.has(t));
            const someActive = group.types.some((t) => activeFilters.has(t));
            return (
              <button
                key={group.label}
                onClick={() => toggleFilterGroup(group.types)}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all"
                style={{
                  background: allActive
                    ? "rgba(60,100,200,0.25)"
                    : someActive
                      ? "rgba(60,100,200,0.12)"
                      : "rgba(255,255,255,0.04)",
                  border: allActive
                    ? "1px solid rgba(80,130,220,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: allActive
                    ? "#93c5fd"
                    : someActive
                      ? "#93c5fd80"
                      : "rgba(200,180,140,0.5)",
                }}
              >
                {group.label}
              </button>
            );
          })}
          {activeFilters.size > 0 && (
            <button
              onClick={() => setActiveFilters(new Set())}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-red-400/60 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Stats summary */}
      <StatsBar stats={stats} />

      {/* Event list — scrolls, newest at bottom */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-amber-500/40 text-xs">
            {events.length === 0
              ? "No events yet — start a game!"
              : "No events match current filters"}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <EventRow key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
};
