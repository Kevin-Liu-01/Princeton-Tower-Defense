"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  PawPrint,
  Heart,
  Skull,
  Pause,
  Play,
  RefreshCcw,
  FastForward,
  Rewind,
  Activity,
  Sparkles,
  Landmark,
  Settings,
  Camera,
  Lock,
  TerminalSquare,
  LogOut,
  Shield,
  RotateCcw,
} from "lucide-react";
import {
  getPerformanceSettings,
  setPerformanceSettings,
} from "../../rendering/performance";
import PrincetonTDLogo from "./PrincetonTDLogo";
import { HudSurface } from "./topHud/HudSurface";
import {
  GOLD,
  SELECTED,
} from "./theme";
import { SettingsModal } from "../menus/SettingsModal";
import { useSettings } from "../../hooks/useSettings";
import { HudTooltip } from "./HudTooltip";
import { ConfirmModal } from "./ConfirmModal";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { HexWardNotification, PaydayNotification } from "./PaydayNotification";

// =============================================================================
// LIVES CARD THEME — transitions red → yellow → dark red by health %
// =============================================================================

function getLivesTheme(percent: number, flashing: boolean) {
  if (flashing) {
    return {
      bg: "linear-gradient(135deg, rgba(80,12,12,0.95), rgba(50,8,8,0.95))",
      border: "1.5px solid rgba(248,113,113,0.5)",
      shadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 12px rgba(248,113,113,0.15)",
      innerBorder: "1px solid rgba(248,113,113,0.15)",
      iconClass: "text-red-200 scale-125",
      iconFill: "#fecaca",
      textClass: "text-red-100",
      barColor: "#ef4444",
      subText: "text-red-400/50",
    };
  }
  if (percent > 60) {
    return {
      bg: "linear-gradient(135deg, rgba(28,20,10,0.95), rgba(16,11,6,0.95))",
      border: "1.5px solid rgba(180,140,60,0.4)",
      shadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
      innerBorder: "1px solid rgba(180,140,60,0.15)",
      iconClass: "text-red-400",
      iconFill: "#f87171",
      textClass: "text-red-300",
      barColor: "#f87171",
      subText: "text-red-500/40",
    };
  }
  if (percent > 30) {
    return {
      bg: "linear-gradient(135deg, rgba(35,16,5,0.95), rgba(22,10,3,0.95))",
      border: "1.5px solid rgba(180,90,15,0.35)",
      shadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
      innerBorder: "1px solid rgba(180,90,15,0.12)",
      iconClass: "text-orange-500",
      iconFill: "#ea580c",
      textClass: "text-orange-300",
      barColor: "#ea580c",
      subText: "text-orange-600/50",
    };
  }
  return {
    bg: "linear-gradient(135deg, rgba(50,6,6,0.95), rgba(30,4,4,0.95))",
    border: "1.5px solid rgba(180,30,30,0.45)",
    shadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 10px rgba(180,30,30,0.08)",
    innerBorder: "1px solid rgba(180,30,30,0.15)",
    iconClass: "text-red-300 animate-pulse",
    iconFill: "#ef4444",
    textClass: "text-red-200",
    barColor: "#dc2626",
    subText: "text-red-500/50",
  };
}

const PRESET_SPEEDS = [0.5, 1, 2];

// =============================================================================
// TOP HUD COMPONENT
// =============================================================================

interface TopHUDProps {
  pawPoints: number;
  lives: number;
  maxLives: number;
  currentWave: number;
  totalWaves: number;

  gameSpeed: number;
  setGameSpeed: (speed: number | ((prev: number) => number)) => void;
  retryLevel: () => void;
  quitLevel: () => void;
  goldSpellActive?: boolean;
  paydayEndTime?: number | null;
  paydayPawPointsEarned?: number;
  hexWardEndTime?: number | null;
  hexWardTargetCount?: number;
  hexWardRaiseCap?: number;
  hexWardRaisesRemaining?: number;
  hexWardDamageAmpPct?: number;
  hexWardBlocksHealing?: boolean;
  eatingClubIncomeEvents?: Array<{ id: string; amount: number }>;
  onEatingClubEventComplete?: (id: string) => void;
  bountyIncomeEvents?: Array<{ id: string; amount: number; isGoldBoosted: boolean }>;
  onBountyEventComplete?: (id: string) => void;
  leakedBountyEvents?: Array<{ id: string; amount: number }>;
  onLeakedBountyEventComplete?: (id: string) => void;
  inspectorActive?: boolean;
  setInspectorActive?: (active: boolean) => void;
  setSelectedInspectEnemy?: (enemy: null) => void;
  cameraModeActive?: boolean;
  onTogglePhotoMode?: () => void;
  pauseLocked?: boolean;
  onToggleDevMenu?: () => void;
  devMenuOpen?: boolean;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  pawPoints,
  lives,
  maxLives,
  currentWave,
  totalWaves,

  gameSpeed,
  setGameSpeed,
  retryLevel,
  quitLevel,
  goldSpellActive = false,
  paydayEndTime = null,
  paydayPawPointsEarned = 0,
  hexWardEndTime = null,
  hexWardTargetCount = 0,
  hexWardRaiseCap = 0,
  hexWardRaisesRemaining = 0,
  hexWardDamageAmpPct = 0,
  hexWardBlocksHealing = false,
  eatingClubIncomeEvents = [],
  onEatingClubEventComplete,
  bountyIncomeEvents = [],
  onBountyEventComplete,
  leakedBountyEvents = [],
  onLeakedBountyEventComplete,
  inspectorActive = false,
  setInspectorActive,
  setSelectedInspectEnemy,
  cameraModeActive = false,
  onTogglePhotoMode,
  pauseLocked = false,
  onToggleDevMenu,
  devMenuOpen = false,
}) => {
  const [performanceMode, setPerformanceMode] = useState(() => {
    const settings = getPerformanceSettings();
    return settings.disableShadows;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"restart" | "quit" | null>(null);
  const { settings: gameSettings, updateCategory, applyPreset, resetToDefaults, resetCategory } = useSettings();

  const [currentFps, setCurrentFps] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const autoToggleCooldownRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const measureFps = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift();
      }

      if (frameTimesRef.current.length >= 15 && frameTimesRef.current.length % 15 === 0) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const fps = Math.round(1000 / avgFrameTime);
        setCurrentFps(fps);

        if (fps < 45 && !performanceMode && autoToggleCooldownRef.current <= 0) {
          setPerformanceMode(true);
          setPerformanceSettings({
            disableShadows: true,
            reducedParticles: true,
            simplifiedGradients: true,
            reducedFogQuality: true,
          });
          autoToggleCooldownRef.current = 10000;
        }

        if (autoToggleCooldownRef.current > 0) {
          autoToggleCooldownRef.current -= avgFrameTime * 15;
        }
      }

      animationFrameId = requestAnimationFrame(measureFps);
    };

    animationFrameId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animationFrameId);
  }, [performanceMode]);

  const togglePerformanceMode = () => {
    const newMode = !performanceMode;
    setPerformanceMode(newMode);
    setPerformanceSettings({
      disableShadows: newMode,
      reducedParticles: newMode,
      simplifiedGradients: newMode,
      reducedFogQuality: newMode,
    });
    autoToggleCooldownRef.current = 5000;
  };

  const prevPawPoints = useRef(pawPoints);
  const prevLives = useRef(lives);

  const [ppPulse, setPpPulse] = useState(false);
  const [livesShake, setLivesShake] = useState(false);
  const [livesFlash, setLivesFlash] = useState(false);
  const livesShakeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const livesFlashTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [activeEatingClubFloaters, setActiveEatingClubFloaters] = useState<Array<{ id: string; amount: number; startTime: number }>>([]);
  const [eatingClubFlash, setEatingClubFlash] = useState(false);
  const processedEatingClubEventsRef = useRef<Set<string>>(new Set());

  const [activeBountyFloaters, setActiveBountyFloaters] = useState<Array<{ id: string; amount: number; isGoldBoosted: boolean; startTime: number }>>([]);
  const processedBountyEventsRef = useRef<Set<string>>(new Set());

  const [activeLeakedFloaters, setActiveLeakedFloaters] = useState<Array<{ id: string; amount: number; startTime: number }>>([]);
  const processedLeakedEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(eatingClubIncomeEvents.map(e => e.id));
    Array.from(processedEatingClubEventsRef.current).forEach(id => {
      if (!currentIds.has(id)) processedEatingClubEventsRef.current.delete(id);
    });

    const newEvents = eatingClubIncomeEvents.filter(e => !processedEatingClubEventsRef.current.has(e.id));

    if (newEvents.length > 0) {
      setEatingClubFlash(true);
      setTimeout(() => setEatingClubFlash(false), 400);

      const now = Date.now();
      const newFloaters = newEvents.map((event, idx) => {
        processedEatingClubEventsRef.current.add(event.id);
        return { id: event.id, amount: event.amount, startTime: now + idx * 80 };
      });
      setActiveEatingClubFloaters(prev => [...prev, ...newFloaters]);
    }
  }, [eatingClubIncomeEvents]);

  useEffect(() => {
    if (activeEatingClubFloaters.length === 0) return;
    const timers = activeEatingClubFloaters.map(floater => {
      const elapsed = Date.now() - floater.startTime;
      const remaining = Math.max(0, 1200 - elapsed);
      return setTimeout(() => {
        setActiveEatingClubFloaters(prev => prev.filter(f => f.id !== floater.id));
        onEatingClubEventComplete?.(floater.id);
      }, remaining);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [activeEatingClubFloaters, onEatingClubEventComplete]);

  useEffect(() => {
    const currentIds = new Set(bountyIncomeEvents.map(e => e.id));
    Array.from(processedBountyEventsRef.current).forEach(id => {
      if (!currentIds.has(id)) processedBountyEventsRef.current.delete(id);
    });

    const newEvents = bountyIncomeEvents.filter(e => !processedBountyEventsRef.current.has(e.id));

    if (newEvents.length > 0) {
      setPpPulse(true);
      setTimeout(() => setPpPulse(false), 300);

      const now = Date.now();
      const newFloaters = newEvents.map((event, idx) => {
        processedBountyEventsRef.current.add(event.id);
        return { id: event.id, amount: event.amount, isGoldBoosted: event.isGoldBoosted, startTime: now + idx * 50 };
      });
      setActiveBountyFloaters(prev => [...prev, ...newFloaters]);
    }
  }, [bountyIncomeEvents]);

  useEffect(() => {
    if (activeBountyFloaters.length === 0) return;
    const timers = activeBountyFloaters.map(floater => {
      const elapsed = Date.now() - floater.startTime;
      const remaining = Math.max(0, 1000 - elapsed);
      return setTimeout(() => {
        setActiveBountyFloaters(prev => prev.filter(f => f.id !== floater.id));
        onBountyEventComplete?.(floater.id);
      }, remaining);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [activeBountyFloaters, onBountyEventComplete]);

  useEffect(() => {
    const currentIds = new Set(leakedBountyEvents.map(e => e.id));
    Array.from(processedLeakedEventsRef.current).forEach(id => {
      if (!currentIds.has(id)) processedLeakedEventsRef.current.delete(id);
    });

    const newEvents = leakedBountyEvents.filter(e => !processedLeakedEventsRef.current.has(e.id));

    if (newEvents.length > 0) {
      setPpPulse(true);
      setTimeout(() => setPpPulse(false), 300);

      const now = Date.now();
      const newFloaters = newEvents.map((event, idx) => {
        processedLeakedEventsRef.current.add(event.id);
        return { id: event.id, amount: event.amount, startTime: now + idx * 50 };
      });
      setActiveLeakedFloaters(prev => [...prev, ...newFloaters]);
    }
  }, [leakedBountyEvents]);

  useEffect(() => {
    if (activeLeakedFloaters.length === 0) return;
    const timers = activeLeakedFloaters.map(floater => {
      const elapsed = Date.now() - floater.startTime;
      const remaining = Math.max(0, 1200 - elapsed);
      return setTimeout(() => {
        setActiveLeakedFloaters(prev => prev.filter(f => f.id !== floater.id));
        onLeakedBountyEventComplete?.(floater.id);
      }, remaining);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [activeLeakedFloaters, onLeakedBountyEventComplete]);

  useEffect(() => { prevPawPoints.current = pawPoints; }, [pawPoints]);

  useEffect(() => {
    if (lives < prevLives.current) {
      setLivesShake(true);
      setLivesFlash(true);
      clearTimeout(livesShakeTimerRef.current);
      clearTimeout(livesFlashTimerRef.current);
      livesShakeTimerRef.current = setTimeout(() => setLivesShake(false), 500);
      livesFlashTimerRef.current = setTimeout(() => setLivesFlash(false), 300);
    }
    prevLives.current = lives;
  }, [lives]);

  useEffect(() => {
    return () => {
      clearTimeout(livesShakeTimerRef.current);
      clearTimeout(livesFlashTimerRef.current);
    };
  }, []);

  const livesPercent = maxLives > 0 ? (lives / maxLives) * 100 : 100;
  const livesTheme = useMemo(() => getLivesTheme(livesPercent, livesFlash), [livesPercent, livesFlash]);

  const waveProgress = totalWaves > 0 ? ((currentWave) / totalWaves) * 100 : 0;

  const isDesktop = useMediaQuery("(min-width: 640px)");

  const exitInspectorOnSpeed = () => {
    if (inspectorActive && setInspectorActive) {
      setInspectorActive(false);
      if (setSelectedInspectEnemy) setSelectedInspectEnemy(null);
    }
  };

  const ICON_BADGE_BASE = "absolute left-0 top-1/2 z-20 flex h-7 w-7 -translate-x-1/3 -translate-y-1/2 items-center justify-center rounded-full sm:h-8 sm:w-8";
  const ICON_BADGE_SHADOW = "0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)";

  const leftStatsContent = (
    <div className="flex items-center gap-4 min-w-0 shrink-0">
      {/* Paw Points */}
      <div className={`relative shrink-0 transition-transform duration-200 ${ppPulse ? "scale-110" : "scale-100"}`}>
        <div
          className="relative flex h-9 items-center gap-1.5 rounded-lg pl-6 pr-3 sm:h-10 sm:pl-7 sm:pr-4"
          style={{
            background: goldSpellActive
              ? "linear-gradient(135deg, rgba(90,65,10,0.95), rgba(60,40,5,0.95))"
              : eatingClubFlash
                ? "linear-gradient(135deg, rgba(6,35,18,0.95), rgba(3,25,12,0.95))"
                : "linear-gradient(135deg, rgba(28,20,10,0.95), rgba(16,11,6,0.95))",
            border: goldSpellActive
              ? "1.5px solid rgba(250,204,21,0.5)"
              : eatingClubFlash
                ? "1.5px solid rgba(52,211,153,0.5)"
                : `1.5px solid ${GOLD.border25}`,
            boxShadow: goldSpellActive
              ? "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 15px rgba(250,204,21,0.1)"
              : eatingClubFlash
                ? "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 15px rgba(52,211,153,0.1)"
                : "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
          }}
        >
          <div
            className="absolute inset-[2px] rounded-[6px] pointer-events-none"
            style={{
              border: goldSpellActive
                ? "1px solid rgba(250,204,21,0.15)"
                : eatingClubFlash
                  ? "1px solid rgba(52,211,153,0.15)"
                  : `1px solid ${GOLD.innerBorder08}`,
            }}
          />
          {activeBountyFloaters.map((floater, index) => (
            <div
              key={floater.id}
              className="absolute left-1/2 whitespace-nowrap font-bold text-xs sm:text-sm pointer-events-none"
              style={{
                animation: "bountyFloat 1s ease-out forwards",
                animationDelay: `${index * 30}ms`,
                bottom: -8,
                zIndex: 100 - index,
              }}
            >
              <span
                className={
                  floater.isGoldBoosted
                    ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]"
                    : "text-amber-300 drop-shadow-[0_0_6px_rgba(217,119,6,0.7)]"
                }
              >
                +{floater.amount}
              </span>
              {floater.isGoldBoosted && (
                <Sparkles size={10} className="ml-0.5 inline-block text-yellow-300" />
              )}
            </div>
          ))}
          {activeEatingClubFloaters.map((floater, index) => (
            <div
              key={floater.id}
              className="absolute left-1/2 whitespace-nowrap font-bold text-xs sm:text-sm pointer-events-none"
              style={{
                animation: "eatingClubFloat 1.2s ease-out forwards",
                animationDelay: `${index * 50}ms`,
                bottom: -8,
                zIndex: 90 - index,
              }}
            >
              <span className="text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">
                +{floater.amount}
              </span>
              <Landmark size={10} className="ml-0.5 inline-block text-emerald-400" />
            </div>
          ))}
          {activeLeakedFloaters.map((floater, index) => (
            <div
              key={floater.id}
              className="absolute left-1/2 whitespace-nowrap font-bold text-xs sm:text-sm pointer-events-none"
              style={{
                animation: "leakedFloat 1.2s ease-out forwards",
                animationDelay: `${index * 40}ms`,
                bottom: -8,
                zIndex: 80 - index,
              }}
            >
              <span className="text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]">
                +{floater.amount}
              </span>
              <Skull size={10} className="ml-0.5 inline-block text-red-400" />
            </div>
          ))}
          <span
            className={`relative z-10 text-sm font-black tabular-nums transition-colors duration-200 sm:text-base ${goldSpellActive
              ? "text-yellow-200"
              : eatingClubFlash
                ? "text-emerald-200"
                : "text-amber-200"
              }`}
          >
            {Math.round(pawPoints)}
          </span>
          {goldSpellActive && (
            <div className="absolute inset-0 rounded-lg bg-yellow-400/15 pointer-events-none animate-pulse" />
          )}
          {eatingClubFlash && (
            <div
              className="absolute inset-0 rounded-lg bg-emerald-400/25 pointer-events-none"
              style={{ animation: "eatingClubGlow 0.4s ease-out forwards" }}
            />
          )}
        </div>
        <div
          className={ICON_BADGE_BASE}
          style={{
            background: goldSpellActive
              ? "linear-gradient(135deg, rgba(120,90,20,0.98), rgba(80,58,10,0.98))"
              : eatingClubFlash
                ? "linear-gradient(135deg, rgba(10,60,35,0.98), rgba(5,40,22,0.98))"
                : "linear-gradient(135deg, rgba(48,35,16,0.98), rgba(30,22,10,0.98))",
            border: goldSpellActive
              ? "2px solid rgba(250,204,21,0.6)"
              : eatingClubFlash
                ? "2px solid rgba(52,211,153,0.6)"
                : "2px solid rgba(180,140,60,0.5)",
            boxShadow: ICON_BADGE_SHADOW,
          }}
        >
          <PawPrint
            size={14}
            className={`transition-colors duration-200 ${goldSpellActive
              ? "text-yellow-300"
              : eatingClubFlash
                ? "text-emerald-300"
                : "text-amber-400"
              }`}
          />
        </div>
      </div>

      {/* Lives */}
      <div
        className="relative shrink-0"
        style={{ animation: livesShake ? "shake 0.5s ease-in-out" : "none" }}
      >
        <div
          className="relative flex h-9 items-center gap-1 overflow-hidden rounded-lg pl-6 pr-3 sm:h-10 sm:pl-7 sm:pr-4"
          style={{
            background: livesTheme.bg,
            border: livesTheme.border,
            boxShadow: livesTheme.shadow,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
            style={{
              background: `linear-gradient(90deg, ${livesTheme.barColor}25, ${livesTheme.barColor}15)`,
              clipPath: `inset(0 ${100 - livesPercent}% 0 0)`,
            }}
          />
          <div
            className="absolute inset-[2px] rounded-[6px] pointer-events-none"
            style={{ border: livesTheme.innerBorder }}
          />
          <div className="relative z-10 flex items-center gap-1">
            <span
              className={`text-sm font-black leading-none tabular-nums transition-colors sm:text-base ${livesTheme.textClass}`}
            >
              {lives}
            </span>
            <span
              className={`text-[9px] font-medium sm:text-[10px] ${livesTheme.subText}`}
            >
              /{maxLives}
            </span>
          </div>
          {livesFlash && (
            <div className="absolute inset-0 bg-red-500/30 pointer-events-none" />
          )}
        </div>
        <div
          className={ICON_BADGE_BASE}
          style={{
            background: "linear-gradient(135deg, rgba(55,16,16,0.98), rgba(35,10,10,0.98))",
            border: `2px solid ${livesTheme.iconFill}88`,
            boxShadow: ICON_BADGE_SHADOW,
          }}
        >
          <Heart
            size={14}
            className={livesTheme.iconClass}
            fill={livesTheme.iconFill}
            style={{
              animation:
                livesPercent <= 60
                  ? `heartbeat ${livesPercent <= 15
                    ? "0.6s"
                    : livesPercent <= 30
                      ? "0.9s"
                      : "1.4s"
                  } ease-in-out infinite`
                  : "none",
            }}
          />
        </div>
      </div>

      {/* Wave */}
      <div className="relative shrink-0">
        <div
          className="relative flex h-9 items-center gap-1 overflow-hidden rounded-lg pl-6 pr-3 sm:h-10 sm:pl-7 sm:pr-4"
          style={{
            background: "linear-gradient(135deg, rgba(28,20,10,0.95), rgba(16,11,6,0.95))",
            border: `1.5px solid ${GOLD.border25}`,
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
            style={{
              background:
                "linear-gradient(90deg, rgba(251,191,36,0.2), rgba(245,158,11,0.12))",
              clipPath: `inset(0 ${100 - waveProgress}% 0 0)`,
            }}
          />
          <div
            className="absolute inset-[2px] rounded-[6px] pointer-events-none"
            style={{ border: `1px solid ${GOLD.innerBorder08}` }}
          />
          <div className="relative z-10 flex items-center gap-1">
            <span className="text-sm font-black leading-none tabular-nums text-amber-200 sm:text-base">
              {Math.min(currentWave + 1, totalWaves)}
            </span>
            <span className="text-[9px] font-medium text-amber-500/50 sm:text-[10px]">
              / {totalWaves}
            </span>
          </div>
        </div>
        <div
          className={ICON_BADGE_BASE}
          style={{
            background: "linear-gradient(135deg, rgba(48,35,16,0.98), rgba(30,22,10,0.98))",
            border: "2px solid rgba(180,140,60,0.5)",
            boxShadow: ICON_BADGE_SHADOW,
          }}
        >
          <Skull size={13} className="text-amber-400" />
        </div>
      </div>
    </div>
  );

  const speedControlsContent = (
    <div
      className="relative flex h-9 items-center gap-1 rounded-lg px-2 sm:h-10 sm:gap-1.5 sm:px-2.5"
      style={{
        background:
          "linear-gradient(135deg, rgba(18,22,10,0.95), rgba(12,14,6,0.95))",
        border: "1.5px solid rgba(90,110,40,0.3)",
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
      }}
    >
      <div
        className="absolute inset-[2px] rounded-[6px] pointer-events-none"
        style={{ border: "1px solid rgba(90,110,40,0.08)" }}
      />
      <HudTooltip label={pauseLocked ? "Speed locked" : "Decrease speed"}>
        <button
          onClick={() => {
            if (pauseLocked) return;
            setGameSpeed((prev) => Math.max(prev - 0.25, 0));
            exitInspectorOnSpeed();
          }}
          disabled={pauseLocked}
          className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all sm:h-7 sm:w-7 ${pauseLocked
            ? "cursor-not-allowed opacity-40"
            : "hover:brightness-125 active:scale-95"
            }`}
          style={{
            background: "linear-gradient(135deg, rgba(40,55,25,0.8), rgba(25,35,15,0.6))",
            border: "1px solid rgba(80,120,60,0.35)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          <Rewind size={11} className="text-green-300/90" />
        </button>
      </HudTooltip>
      <HudTooltip label="Current game speed">
        <span
          className="relative z-10 min-w-[32px] cursor-default rounded-md px-2 py-1 text-center text-[11px] font-black tabular-nums text-green-200 sm:min-w-[36px] sm:text-xs"
          style={{
            background: "linear-gradient(135deg, rgba(30,45,15,0.7), rgba(18,28,8,0.5))",
            border: "1px solid rgba(80,120,60,0.3)",
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.3), 0 0 6px rgba(100,140,60,0.08)",
          }}
        >
          {Number.isInteger(gameSpeed)
            ? gameSpeed + "x"
            : gameSpeed % 0.5 === 0
              ? gameSpeed.toFixed(1) + "x"
              : gameSpeed.toFixed(2) + "x"}
        </span>
      </HudTooltip>
      <HudTooltip label={pauseLocked ? "Speed locked" : "Increase speed"}>
        <button
          onClick={() => {
            if (pauseLocked) return;
            setGameSpeed((prev) => Math.min(prev + 0.25, 5));
            exitInspectorOnSpeed();
          }}
          disabled={pauseLocked}
          className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all sm:h-7 sm:w-7 ${pauseLocked
            ? "cursor-not-allowed opacity-40"
            : "hover:brightness-125 active:scale-95"
            }`}
          style={{
            background: "linear-gradient(135deg, rgba(40,55,25,0.8), rgba(25,35,15,0.6))",
            border: "1px solid rgba(80,120,60,0.35)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          <FastForward size={11} className="text-green-300/90" />
        </button>
      </HudTooltip>
      <div className="hidden sm:contents">
        <div
          className="mx-0.5 h-5 w-px"
          style={{ background: "linear-gradient(180deg, transparent, rgba(90,110,40,0.3), transparent)" }}
        />
        {PRESET_SPEEDS.map((speed) => (
          <HudTooltip
            key={speed}
            label={pauseLocked ? "Speed locked" : `Set speed to ${speed}x`}
          >
            <button
              onClick={() => {
                if (pauseLocked) return;
                setGameSpeed(speed);
                exitInspectorOnSpeed();
              }}
              disabled={pauseLocked}
              className={`relative z-10 rounded-md px-2 py-0.5 text-[10px] font-black transition-all ${pauseLocked ? "cursor-not-allowed opacity-40" : "hover:brightness-125 active:scale-95"
                }`}
              style={{
                background:
                  gameSpeed === speed
                    ? "linear-gradient(135deg, rgba(80,110,30,0.7), rgba(55,75,20,0.5))"
                    : "rgba(20,26,12,0.6)",
                border:
                  gameSpeed === speed
                    ? "1px solid rgba(130,180,50,0.5)"
                    : "1px solid rgba(60,80,30,0.25)",
                color:
                  gameSpeed === speed
                    ? "#bef264"
                    : "rgba(163,230,53,0.5)",
                boxShadow:
                  gameSpeed === speed
                    ? "0 0 6px rgba(130,180,50,0.15)"
                    : "none",
              }}
            >
              {speed}x
            </button>
          </HudTooltip>
        ))}
      </div>
    </div>
  );

  const CIRCLE_BTN = "relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all hover:brightness-130 active:scale-95";
  const CIRCLE_BTN_SHADOW = "0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)";

  const utilityControlsContent = (
    <div
      className="relative hidden h-9 items-center gap-1.5 rounded-lg px-2 sm:flex sm:h-10"
      style={{
        background: "linear-gradient(135deg, rgba(28,20,10,0.95), rgba(16,11,6,0.95))",
        border: `1.5px solid ${GOLD.border25}`,
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
      }}
    >
      <div
        className="absolute inset-[2px] rounded-[6px] pointer-events-none"
        style={{ border: `1px solid ${GOLD.innerBorder08}` }}
      />
      <HudTooltip label={`Performance mode: ${performanceMode ? "ON" : "OFF"} · ${currentFps} FPS`}>
        <button
          onClick={togglePerformanceMode}
          className={`${CIRCLE_BTN} ${currentFps < 45 && !performanceMode ? "animate-pulse" : ""}`}
          style={{
            background: performanceMode
              ? "linear-gradient(180deg, rgba(30,140,140,0.6), rgba(15,90,90,0.4))"
              : currentFps < 45
                ? "linear-gradient(180deg, rgba(140,35,35,0.6), rgba(90,18,18,0.4))"
                : "linear-gradient(180deg, rgba(65,35,90,0.6), rgba(42,22,60,0.4))",
            border: performanceMode
              ? "1.5px solid rgba(34,211,238,0.45)"
              : currentFps < 45
                ? "1.5px solid rgba(248,113,113,0.45)"
                : "1.5px solid rgba(140,80,180,0.35)",
            boxShadow: CIRCLE_BTN_SHADOW,
          }}
        >
          <Activity
            size={14}
            className={
              performanceMode
                ? "text-cyan-300"
                : currentFps < 45
                  ? "text-red-300"
                  : "text-purple-300"
            }
          />
          {gameSettings.ui.showFpsCounter && (
            <span
              className={`absolute -bottom-1 -right-1 rounded-full px-1 text-[7px] font-bold leading-tight ${currentFps >= 55
                ? "bg-green-700/90 text-green-100"
                : currentFps >= 45
                  ? "bg-yellow-700/90 text-yellow-100"
                  : "bg-red-700/90 text-red-100"
                }`}
            >
              {currentFps}
            </span>
          )}
        </button>
      </HudTooltip>
      <HudTooltip label="Game settings">
        <button
          onClick={() => setShowSettings(true)}
          className={CIRCLE_BTN}
          style={{
            background: "linear-gradient(180deg, rgba(150,75,12,0.6), rgba(100,48,6,0.4))",
            border: "1.5px solid rgba(217,119,6,0.45)",
            boxShadow: CIRCLE_BTN_SHADOW,
          }}
        >
          <Settings size={14} className="text-orange-300" />
        </button>
      </HudTooltip>
      {onTogglePhotoMode && (
        <HudTooltip label={cameraModeActive ? "Exit photo mode (F2)" : "Photo mode (F2)"}>
          <button
            onClick={onTogglePhotoMode}
            className={CIRCLE_BTN}
            style={{
              background: cameraModeActive
                ? "linear-gradient(180deg, rgba(110,90,200,0.65), rgba(75,55,150,0.45))"
                : "linear-gradient(180deg, rgba(60,60,110,0.55), rgba(38,38,75,0.4))",
              border: cameraModeActive
                ? "1.5px solid rgba(160,140,255,0.5)"
                : "1.5px solid rgba(120,120,200,0.35)",
              boxShadow: cameraModeActive
                ? `${CIRCLE_BTN_SHADOW}, 0 0 10px rgba(140,120,255,0.25)`
                : CIRCLE_BTN_SHADOW,
            }}
          >
            <Camera size={14} className={cameraModeActive ? "text-indigo-200" : "text-indigo-300"} />
          </button>
        </HudTooltip>
      )}
      {onToggleDevMenu && (
        <HudTooltip label={devMenuOpen ? "Close event log" : "Event log"}>
          <button
            onClick={onToggleDevMenu}
            className={CIRCLE_BTN}
            style={{
              background: devMenuOpen
                ? "linear-gradient(180deg, rgba(35,80,135,0.65), rgba(22,55,100,0.45))"
                : "linear-gradient(180deg, rgba(32,55,90,0.55), rgba(22,38,65,0.4))",
              border: devMenuOpen
                ? "1.5px solid rgba(96,165,250,0.5)"
                : "1.5px solid rgba(80,120,200,0.35)",
              boxShadow: devMenuOpen
                ? `${CIRCLE_BTN_SHADOW}, 0 0 10px rgba(96,165,250,0.2)`
                : CIRCLE_BTN_SHADOW,
            }}
          >
            <TerminalSquare
              size={14}
              className={devMenuOpen ? "text-blue-200" : "text-blue-300"}
            />
          </button>
        </HudTooltip>
      )}
    </div>
  );

  const gameControlsContent = (
    <div
      className="relative flex h-9 items-center gap-1.5 rounded-lg px-2 sm:h-10"
      style={{
        background: "linear-gradient(135deg, rgba(28,20,10,0.95), rgba(16,11,6,0.95))",
        border: `1.5px solid ${GOLD.border25}`,
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
      }}
    >
      <div
        className="absolute inset-[2px] rounded-[6px] pointer-events-none"
        style={{ border: `1px solid ${GOLD.innerBorder08}` }}
      />
      <HudTooltip label={pauseLocked ? "Locked — exit photo/inspect mode first" : gameSpeed === 0 ? "Resume game (Space)" : "Pause game (Space)"}>
        <button
          onClick={() => {
            if (pauseLocked) return;
            if (gameSpeed === 0) {
              setGameSpeed(1);
              exitInspectorOnSpeed();
            } else {
              setGameSpeed(0);
            }
          }}
          disabled={pauseLocked}
          className={`${CIRCLE_BTN} ${pauseLocked ? "cursor-not-allowed opacity-40" : ""}`}
          style={{
            background: `linear-gradient(180deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`,
            border: `1.5px solid ${GOLD.border35}`,
            boxShadow: `${CIRCLE_BTN_SHADOW}, 0 0 8px rgba(180,140,60,0.1)`,
          }}
        >
          {pauseLocked ? (
            <Lock size={14} className="text-amber-300/60" />
          ) : gameSpeed === 0 ? (
            <Play size={14} className="text-amber-300" />
          ) : (
            <Pause size={14} className="text-amber-300" />
          )}
        </button>
      </HudTooltip>
      <HudTooltip label="Restart level">
        <button
          onClick={() => setConfirmAction("restart")}
          className={CIRCLE_BTN}
          style={{
            background: "linear-gradient(180deg, rgba(25,95,48,0.6), rgba(12,60,28,0.4))",
            border: "1.5px solid rgba(60,140,80,0.4)",
            boxShadow: CIRCLE_BTN_SHADOW,
          }}
        >
          <RefreshCcw size={14} className="text-emerald-300" />
        </button>
      </HudTooltip>
      <HudTooltip label="Quit to world map">
        <button
          onClick={() => setConfirmAction("quit")}
          className={CIRCLE_BTN}
          style={{
            background: "linear-gradient(180deg, rgba(110,22,22,0.6), rgba(75,12,12,0.4))",
            border: "1.5px solid rgba(200,60,60,0.45)",
            boxShadow: CIRCLE_BTN_SHADOW,
          }}
        >
          <LogOut size={14} className="text-red-300" />
        </button>
      </HudTooltip>
    </div>
  );

  return (
    <>
      <div
        data-tutorial="top-hud"
        className="pointer-events-none relative z-[70]"
      >
        {isDesktop ? (
          <HudSurface contentClassName="relative px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 shrink-0 pl-1">
                <div className="flex items-center shrink-0">
                  <PrincetonTDLogo size="h-10 w-10" />
                  <div
                    className="ml-1.5 mr-2 h-7 w-px"
                    style={{
                      background: `linear-gradient(180deg, transparent, ${GOLD.border35}, transparent)`,
                    }}
                  />
                </div>
                {leftStatsContent}
              </div>
              <div className="flex items-center gap-1.5">
                {speedControlsContent}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {utilityControlsContent}
                {gameControlsContent}
              </div>
            </div>
          </HudSurface>
        ) : (
          <HudSurface contentClassName="relative px-2 py-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0 flex-shrink">
                {/* Paw Points — compact */}
                <div
                  className={`relative flex h-8 min-w-[52px] shrink-0 items-center justify-center gap-1 rounded-lg px-2 py-1 transition-all duration-200 ${ppPulse ? "scale-110" : "scale-100"}`}
                  style={{
                    background: goldSpellActive
                      ? "linear-gradient(135deg, rgba(90,65,10,0.95), rgba(60,40,5,0.95))"
                      : eatingClubFlash
                        ? "linear-gradient(135deg, rgba(6,35,18,0.95), rgba(3,25,12,0.95))"
                        : "linear-gradient(135deg, rgba(28,20,10,0.95), rgba(16,11,6,0.95))",
                    border: `1.5px solid ${GOLD.border25}`,
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {activeBountyFloaters.map((floater, index) => (
                    <div
                      key={floater.id}
                      className="absolute left-1/2 whitespace-nowrap font-bold text-xs pointer-events-none"
                      style={{ animation: "bountyFloat 1s ease-out forwards", animationDelay: `${index * 30}ms`, bottom: -8, zIndex: 100 - index }}
                    >
                      <span className={floater.isGoldBoosted ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]" : "text-amber-300 drop-shadow-[0_0_6px_rgba(217,119,6,0.7)]"}>+{floater.amount}</span>
                    </div>
                  ))}
                  {activeEatingClubFloaters.map((floater, index) => (
                    <div
                      key={floater.id}
                      className="absolute left-1/2 whitespace-nowrap font-bold text-xs pointer-events-none"
                      style={{ animation: "eatingClubFloat 1.2s ease-out forwards", animationDelay: `${index * 50}ms`, bottom: -8, zIndex: 90 - index }}
                    >
                      <span className="text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">+{floater.amount}</span>
                    </div>
                  ))}
                  {activeLeakedFloaters.map((floater, index) => (
                    <div
                      key={floater.id}
                      className="absolute left-1/2 whitespace-nowrap font-bold text-xs pointer-events-none"
                      style={{ animation: "leakedFloat 1.2s ease-out forwards", animationDelay: `${index * 40}ms`, bottom: -8, zIndex: 80 - index }}
                    >
                      <span className="text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]">+{floater.amount}</span>
                      <Skull size={9} className="ml-0.5 inline-block text-red-400" />
                    </div>
                  ))}
                  <PawPrint size={12} className={`shrink-0 ${goldSpellActive ? "text-yellow-300" : eatingClubFlash ? "text-emerald-300" : "text-amber-400"}`} />
                  <span className={`text-sm font-black tabular-nums ${goldSpellActive ? "text-yellow-200" : eatingClubFlash ? "text-emerald-200" : "text-amber-200"}`}>
                    {Math.round(pawPoints)}
                  </span>
                </div>
                {/* Lives — compact */}
                <div
                  className="relative flex h-8 min-w-[48px] shrink-0 items-center justify-center gap-1 overflow-hidden rounded-lg px-2 py-1"
                  style={{
                    background: livesTheme.bg,
                    border: livesTheme.border,
                    boxShadow: livesTheme.shadow,
                    animation: livesShake ? "shake 0.5s ease-in-out" : "none",
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
                    style={{
                      background: `linear-gradient(90deg, ${livesTheme.barColor}25, ${livesTheme.barColor}15)`,
                      clipPath: `inset(0 ${100 - livesPercent}% 0 0)`,
                    }}
                  />
                  <Heart size={12} className={`relative z-10 shrink-0 ${livesTheme.iconClass}`} fill={livesTheme.iconFill} />
                  <span className={`relative z-10 text-sm font-black tabular-nums ${livesTheme.textClass}`}>{lives}</span>
                  {livesFlash && <div className="absolute inset-0 bg-red-500/30 pointer-events-none" />}
                </div>
                {/* Wave — compact */}
                <div
                  className="relative flex h-8 min-w-[48px] shrink-0 items-center justify-center gap-1 overflow-hidden rounded-lg px-2 py-1"
                  style={{
                    background: "linear-gradient(135deg, rgba(28,20,10,0.95), rgba(16,11,6,0.95))",
                    border: `1.5px solid ${GOLD.border25}`,
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
                    style={{
                      background: "linear-gradient(90deg, rgba(251,191,36,0.2), rgba(245,158,11,0.12))",
                      clipPath: `inset(0 ${100 - waveProgress}% 0 0)`,
                    }}
                  />
                  <Skull size={11} className="relative z-10 shrink-0 text-amber-400" />
                  <span className="relative z-10 text-sm font-black tabular-nums text-amber-200">{Math.min(currentWave + 1, totalWaves)}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {/* Speed — compact */}
                <div
                  className="relative flex h-8 items-center gap-0.5 rounded-lg px-1"
                  style={{
                    background: "linear-gradient(135deg, rgba(18,22,10,0.95), rgba(12,14,6,0.95))",
                    border: "1.5px solid rgba(90,110,40,0.3)",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <button
                    onClick={() => { if (!pauseLocked) { setGameSpeed((prev) => Math.max(prev - 0.25, 0)); exitInspectorOnSpeed(); } }}
                    disabled={pauseLocked}
                    className={`relative z-10 rounded-md p-0.5 transition-colors ${pauseLocked ? "cursor-not-allowed opacity-40" : "hover:bg-green-800/40"}`}
                    style={{ border: "1px solid rgba(80,120,60,0.3)" }}
                  >
                    <Rewind size={10} className="text-green-300/80" />
                  </button>
                  <span
                    className="relative z-10 w-7 cursor-default rounded-md px-1 py-0.5 text-center text-[10px] font-black tabular-nums text-green-300/90"
                    style={{ background: "rgba(28,22,14,0.6)", border: "1px solid rgba(80,120,60,0.25)" }}
                  >
                    {Number.isInteger(gameSpeed) ? gameSpeed + "x" : gameSpeed % 0.5 === 0 ? gameSpeed.toFixed(1) + "x" : gameSpeed.toFixed(2) + "x"}
                  </span>
                  <button
                    onClick={() => { if (!pauseLocked) { setGameSpeed((prev) => Math.min(prev + 0.25, 5)); exitInspectorOnSpeed(); } }}
                    disabled={pauseLocked}
                    className={`relative z-10 rounded-md p-0.5 transition-colors ${pauseLocked ? "cursor-not-allowed opacity-40" : "hover:bg-green-800/40"}`}
                    style={{ border: "1px solid rgba(80,120,60,0.3)" }}
                  >
                    <FastForward size={10} className="text-green-300/80" />
                  </button>
                </div>
                {/* Game controls — compact */}
                <div
                  className="relative flex h-8 items-center gap-0.5 rounded-lg px-0.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(28,20,10,0.95), rgba(16,11,6,0.95))",
                    border: `1.5px solid ${GOLD.border25}`,
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <button
                    onClick={() => { if (pauseLocked) return; if (gameSpeed === 0) { setGameSpeed(1); exitInspectorOnSpeed(); } else { setGameSpeed(0); } }}
                    disabled={pauseLocked}
                    className={`relative z-10 rounded-md p-1 transition-colors ${pauseLocked ? "cursor-not-allowed opacity-40" : "hover:brightness-125"}`}
                    style={{ background: `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`, border: `1px solid ${GOLD.border35}` }}
                  >
                    {pauseLocked ? <Lock size={12} className="text-amber-300/60" /> : gameSpeed === 0 ? <Play size={12} className="text-amber-300" /> : <Pause size={12} className="text-amber-300" />}
                  </button>
                  <button
                    onClick={() => setConfirmAction("restart")}
                    className="relative z-10 rounded-md p-1 transition-colors hover:brightness-125"
                    style={{ background: "linear-gradient(135deg, rgba(20,80,40,0.5), rgba(10,55,25,0.3))", border: "1px solid rgba(60,140,80,0.35)" }}
                  >
                    <RefreshCcw size={12} className="text-emerald-300" />
                  </button>
                  <button
                    onClick={() => setConfirmAction("quit")}
                    className="relative z-10 rounded-md p-1 transition-colors hover:brightness-125"
                    style={{ background: "linear-gradient(135deg, rgba(100,20,20,0.5), rgba(70,10,10,0.3))", border: "1px solid rgba(200,60,60,0.45)" }}
                  >
                    <LogOut size={12} className="text-red-300" />
                  </button>
                </div>
              </div>
            </div>
          </HudSurface>
        )}

        <div className="absolute left-0 right-0 top-full z-[70] pt-3">
          <PaydayNotification
            active={goldSpellActive}
            endTime={paydayEndTime}
            pawPointsEarned={paydayPawPointsEarned}
          />
          <HexWardNotification
            endTime={hexWardEndTime}
            targetCount={hexWardTargetCount}
            raiseCap={hexWardRaiseCap}
            raisesRemaining={hexWardRaisesRemaining}
            damageAmpPct={hexWardDamageAmpPct}
            blocksHealing={hexWardBlocksHealing}
          />
        </div>

        <style jsx>{`
          @keyframes floatUp {
            0% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          }
          @keyframes bountyFloat {
            0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.5); }
            15% { opacity: 1; transform: translateX(-50%) translateY(-18px) scale(1.15); }
            30% { transform: translateX(-50%) translateY(-24px) scale(1); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-45px) scale(0.85); }
          }
          @keyframes eatingClubFloat {
            0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.6); }
            12% { opacity: 1; transform: translateX(-50%) translateY(-20px) scale(1.2); }
            25% { transform: translateX(-50%) translateY(-28px) scale(1); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-55px) scale(0.9); }
          }
          @keyframes leakedFloat {
            0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.5); }
            12% { opacity: 1; transform: translateX(-50%) translateY(-16px) scale(1.2); }
            25% { transform: translateX(-50%) translateY(-22px) scale(1); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-50px) scale(0.85); }
          }
          @keyframes eatingClubGlow {
            0% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
            100% { opacity: 0; transform: scale(1); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
            20%, 40%, 60%, 80% { transform: translateX(3px); }
          }
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            12% { transform: scale(1.25); }
            24% { transform: scale(1); }
            36% { transform: scale(1.15); }
            48% { transform: scale(1); }
          }
        `}</style>
      </div>


      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          settings={gameSettings}
          updateCategory={updateCategory}
          applyPreset={applyPreset}
          resetToDefaults={resetToDefaults}
          resetCategory={resetCategory}
        />
      )}

      <ConfirmModal
        isOpen={confirmAction === "restart"}
        onClose={() => setConfirmAction(null)}
        onConfirm={retryLevel}
        title="Restart Level?"
        description="All progress on this level will be lost. Are you sure you want to restart?"
        confirmLabel="Restart"
        cancelLabel="Cancel"
        variant="warning"
        titleIcon={RotateCcw}
        confirmIcon={RefreshCcw}
        cancelIcon={Shield}
      />

      <ConfirmModal
        isOpen={confirmAction === "quit"}
        onClose={() => setConfirmAction(null)}
        onConfirm={quitLevel}
        title="Quit to World Map?"
        description="You will lose all progress on this level and return to the world map."
        confirmLabel="Quit"
        cancelLabel="Continue"
        variant="danger"
        titleIcon={LogOut}
        confirmIcon={LogOut}
        cancelIcon={Play}
      />
    </>
  );
};
