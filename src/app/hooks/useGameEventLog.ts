import { useState, useCallback, useRef } from "react";

// =============================================================================
// GAME EVENT TYPES
// =============================================================================

export type GameEventType =
  | "wave_started"
  | "wave_completed"
  | "enemy_killed"
  | "enemy_leaked"
  | "tower_built"
  | "tower_sold"
  | "tower_upgraded"
  | "life_lost"
  | "income_earned"
  | "spell_cast"
  | "hero_action"
  | "victory"
  | "defeat"
  | "game_start"
  | "speed_change";

export interface GameEvent {
  id: string;
  timestamp: number;
  gameTime: number;
  type: GameEventType;
  message: string;
  details?: Record<string, unknown>;
}

export const EVENT_COLORS: Record<GameEventType, string> = {
  defeat: "#f87171",
  enemy_killed: "#f87171",
  enemy_leaked: "#ef4444",
  game_start: "#60a5fa",
  hero_action: "#818cf8",
  income_earned: "#34d399",
  life_lost: "#ef4444",
  speed_change: "#94a3b8",
  spell_cast: "#c084fc",
  tower_built: "#fbbf24",
  tower_sold: "#f59e0b",
  tower_upgraded: "#a78bfa",
  victory: "#4ade80",
  wave_completed: "#34d399",
  wave_started: "#60a5fa",
};

export const EVENT_LABELS: Record<GameEventType, string> = {
  defeat: "Defeat",
  enemy_killed: "Kill",
  enemy_leaked: "Leak",
  game_start: "Start",
  hero_action: "Hero",
  income_earned: "Income",
  life_lost: "Life",
  speed_change: "Speed",
  spell_cast: "Spell",
  tower_built: "Build",
  tower_sold: "Sell",
  tower_upgraded: "Upgrade",
  victory: "Victory",
  wave_completed: "Wave",
  wave_started: "Wave",
};

const MAX_EVENTS = 500;

let eventIdCounter = 0;

function generateEventId(): string {
  return `evt_${++eventIdCounter}_${Date.now()}`;
}

// =============================================================================
// HOOK
// =============================================================================

export interface GameEventLogAPI {
  events: GameEvent[];
  log: (
    type: GameEventType,
    message: string,
    details?: Record<string, unknown>
  ) => void;
  clear: () => void;
  stats: EventStats;
}

export interface EventStats {
  enemiesKilled: number;
  totalIncomeEarned: number;
  towersBuilt: number;
  towersSold: number;
  livesLost: number;
  spellsCast: number;
}

export function useGameEventLog(): GameEventLogAPI {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const gameStartTimeRef = useRef(Date.now());
  const statsRef = useRef<EventStats>({
    enemiesKilled: 0,
    livesLost: 0,
    spellsCast: 0,
    totalIncomeEarned: 0,
    towersBuilt: 0,
    towersSold: 0,
  });
  const [stats, setStats] = useState<EventStats>({ ...statsRef.current });

  const log = useCallback(
    (
      type: GameEventType,
      message: string,
      details?: Record<string, unknown>
    ) => {
      const event: GameEvent = {
        details,
        gameTime: (Date.now() - gameStartTimeRef.current) / 1000,
        id: generateEventId(),
        message,
        timestamp: Date.now(),
        type,
      };

      setEvents((prev) => {
        const next = [event, ...prev];
        if (next.length > MAX_EVENTS) {
          next.length = MAX_EVENTS;
        }
        return next;
      });

      const s = statsRef.current;
      switch (type) {
        case "enemy_killed": {
          s.enemiesKilled++;
          break;
        }
        case "income_earned": {
          s.totalIncomeEarned += (details?.amount as number) || 0;
          break;
        }
        case "tower_built": {
          s.towersBuilt++;
          break;
        }
        case "tower_sold": {
          s.towersSold++;
          break;
        }
        case "life_lost": {
          s.livesLost += (details?.amount as number) || 1;
          break;
        }
        case "spell_cast": {
          s.spellsCast++;
          break;
        }
        case "game_start": {
          gameStartTimeRef.current = Date.now();
          statsRef.current = {
            enemiesKilled: 0,
            livesLost: 0,
            spellsCast: 0,
            totalIncomeEarned: 0,
            towersBuilt: 0,
            towersSold: 0,
          };
          break;
        }
      }
      setStats({ ...statsRef.current });
    },
    []
  );

  const clear = useCallback(() => {
    setEvents([]);
    statsRef.current = {
      enemiesKilled: 0,
      livesLost: 0,
      spellsCast: 0,
      totalIncomeEarned: 0,
      towersBuilt: 0,
      towersSold: 0,
    };
    setStats({ ...statsRef.current });
    gameStartTimeRef.current = Date.now();
  }, []);

  return { clear, events, log, stats };
}
