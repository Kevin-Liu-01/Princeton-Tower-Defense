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
  X,
  Sparkles,
  Landmark,
  Settings,
  Camera,
  Lock,
  TerminalSquare,
} from "lucide-react";
import {
  getPerformanceSettings,
  setPerformanceSettings,
} from "../../rendering/performance";
import PrincetonTDLogo from "./PrincetonTDLogo";
import { HudSurface } from "./topHud/HudSurface";
import {
  PANEL,
  GOLD,
  AMBER_CARD,
  RED_CARD,

  SELECTED,
  SPEED,
  MANA,
} from "./theme";
import { SettingsModal } from "../menus/SettingsModal";
import { useSettings } from "../../hooks/useSettings";
import { HudTooltip } from "./HudTooltip";
import { useMediaQuery } from "../../hooks/useMediaQuery";

// =============================================================================
// LIVES CARD THEME — transitions red → yellow → dark red by health %
// =============================================================================

function getLivesTheme(percent: number, flashing: boolean) {
  if (flashing) {
    return {
      bg: "linear-gradient(135deg, rgba(180,30,30,0.8), rgba(120,20,20,0.6))",
      border: "1.5px solid rgba(248,113,113,0.6)",
      shadow: "inset 0 0 15px rgba(248,113,113,0.2)",
      innerBorder: "1px solid rgba(248,113,113,0.2)",
      iconClass: "text-red-200 scale-125",
      iconFill: "#fecaca",
      textClass: "text-red-100",
      barColor: "#ef4444",
      subText: "text-red-400/50",
    };
  }
  if (percent > 60) {
    return {
      bg: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
      border: `1.5px solid ${RED_CARD.border}`,
      shadow: `inset 0 0 12px ${RED_CARD.glow06}`,
      innerBorder: `1px solid ${RED_CARD.innerBorder12}`,
      iconClass: "text-red-400",
      iconFill: "#f87171",
      textClass: "text-red-300",
      barColor: "#f87171",
      subText: "text-red-500/40",
    };
  }
  if (percent > 30) {
    return {
      bg: "linear-gradient(135deg, rgba(65,30,10,0.8), rgba(50,22,8,0.65))",
      border: "1.5px solid rgba(234,120,20,0.45)",
      shadow: "inset 0 0 12px rgba(234,120,20,0.08)",
      innerBorder: "1px solid rgba(234,120,20,0.15)",
      iconClass: "text-orange-500",
      iconFill: "#ea580c",
      textClass: "text-orange-300",
      barColor: "#ea580c",
      subText: "text-orange-600/50",
    };
  }
  return {
    bg: "linear-gradient(135deg, rgba(90,15,15,0.85), rgba(60,8,8,0.7))",
    border: "1.5px solid rgba(220,38,38,0.55)",
    shadow: "inset 0 0 15px rgba(220,38,38,0.12)",
    innerBorder: "1px solid rgba(220,38,38,0.2)",
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
  eatingClubIncomeEvents?: Array<{ id: string; amount: number }>;
  onEatingClubEventComplete?: (id: string) => void;
  bountyIncomeEvents?: Array<{ id: string; amount: number; isGoldBoosted: boolean }>;
  onBountyEventComplete?: (id: string) => void;
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
  eatingClubIncomeEvents = [],
  onEatingClubEventComplete,
  bountyIncomeEvents = [],
  onBountyEventComplete,
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

  const [activeEatingClubFloaters, setActiveEatingClubFloaters] = useState<Array<{ id: string; amount: number; startTime: number }>>([]);
  const [eatingClubFlash, setEatingClubFlash] = useState(false);
  const processedEatingClubEventsRef = useRef<Set<string>>(new Set());

  const [activeBountyFloaters, setActiveBountyFloaters] = useState<Array<{ id: string; amount: number; isGoldBoosted: boolean; startTime: number }>>([]);
  const processedBountyEventsRef = useRef<Set<string>>(new Set());

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

  useEffect(() => { prevPawPoints.current = pawPoints; }, [pawPoints]);

  useEffect(() => {
    if (lives < prevLives.current) {
      setLivesShake(true);
      setLivesFlash(true);
      const t1 = setTimeout(() => setLivesShake(false), 500);
      const t2 = setTimeout(() => setLivesFlash(false), 300);
      prevLives.current = lives;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    prevLives.current = lives;
  }, [lives]);

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

  const leftStatsContent = (
    <>
      <div
        className={`relative flex h-8 min-w-[60px] shrink-0 items-center justify-center gap-1 rounded-lg px-2 py-1.5 transition-all duration-200 sm:h-9 sm:min-w-[88px] sm:gap-1.5 sm:px-3 ${ppPulse ? "scale-110" : "scale-100"}`}
        style={{
          background: goldSpellActive
            ? "linear-gradient(135deg, rgba(140,100,20,0.7), rgba(100,68,15,0.5))"
            : eatingClubFlash
              ? "linear-gradient(135deg, rgba(10,60,30,0.8), rgba(5,45,20,0.6))"
              : `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
          border: goldSpellActive
            ? "1.5px solid rgba(250,204,21,0.5)"
            : eatingClubFlash
              ? "1.5px solid rgba(52,211,153,0.5)"
              : `1.5px solid ${AMBER_CARD.border}`,
          boxShadow: goldSpellActive
            ? "inset 0 0 15px rgba(250,204,21,0.1), 0 0 12px rgba(250,204,21,0.15)"
            : eatingClubFlash
              ? "inset 0 0 15px rgba(52,211,153,0.1)"
              : `inset 0 0 12px ${AMBER_CARD.glow}`,
        }}
      >
        <div
          className="absolute inset-[2px] rounded-[6px] pointer-events-none"
          style={{
            border: goldSpellActive
              ? "1px solid rgba(250,204,21,0.15)"
              : eatingClubFlash
                ? "1px solid rgba(52,211,153,0.15)"
                : `1px solid ${AMBER_CARD.innerBorder}`,
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
        <PawPrint
          size={14}
          className={`shrink-0 transition-colors duration-200 ${goldSpellActive
            ? "text-yellow-300"
            : eatingClubFlash
              ? "text-emerald-300"
              : "text-amber-400"
            }`}
        />
        <span
          className={`text-sm font-black tabular-nums transition-colors duration-200 sm:text-base ${goldSpellActive
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
        className="relative flex h-8 min-w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-lg transition-all sm:h-9 sm:min-w-[88px]"
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
        <div
          className="absolute inset-[2px] rounded-[6px] pointer-events-none"
          style={{ border: livesTheme.innerBorder }}
        />
        <div className="relative z-10 flex items-center justify-center gap-1.5">
          <Heart
            size={14}
            className={`shrink-0 ${livesTheme.iconClass}`}
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
          <span
            className={`text-sm font-black leading-none tabular-nums transition-colors sm:text-base ${livesTheme.textClass}`}
          >
            {lives}
          </span>
          <span
            className={`hidden text-[8px] font-medium sm:inline sm:text-[9px] ${livesTheme.subText}`}
          >
            /{maxLives}
          </span>
        </div>
        {livesFlash && (
          <div className="absolute inset-0 bg-red-500/30 pointer-events-none" />
        )}
      </div>

      <div
        className="relative flex h-8 min-w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-9 sm:min-w-[88px]"
        style={{
          background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
          border: `1.5px solid ${AMBER_CARD.border}`,
          boxShadow: `inset 0 0 12px ${AMBER_CARD.glow}`,
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
          style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }}
        />
        <div className="relative z-10 flex items-center justify-center gap-1.5">
          <Skull size={13} className="shrink-0 text-amber-400" />
          <span className="text-sm font-black leading-none tabular-nums text-amber-200 sm:text-base">
            {Math.min(currentWave + 1, totalWaves)}
          </span>
          <span className="hidden text-[9px] font-medium text-amber-500/50 sm:inline sm:text-[10px]">
            / {totalWaves}
          </span>
        </div>
      </div>

    </>
  );

  const rightControlsContent = (
    <>
      <div
        className="relative flex h-8 items-center gap-0.5 rounded-lg px-1 sm:h-10 sm:px-2"
        style={{
          background:
            "linear-gradient(135deg, rgba(35,40,20,0.7), rgba(25,30,12,0.5))",
          border: "1.5px solid rgba(120,140,60,0.3)",
          boxShadow: "inset 0 0 12px rgba(120,140,60,0.05)",
        }}
      >
        <div
          className="absolute inset-[2px] rounded-[6px] pointer-events-none"
          style={{ border: "1px solid rgba(120,140,60,0.1)" }}
        />
        <HudTooltip label={pauseLocked ? "Speed locked" : "Decrease speed"}>
          <button
            onClick={() => {
              if (pauseLocked) return;
              setGameSpeed((prev) => Math.max(prev - 0.25, 0));
              exitInspectorOnSpeed();
            }}
            disabled={pauseLocked}
            className={`relative z-10 rounded-md p-0.5 transition-colors sm:p-1 ${pauseLocked
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-green-800/40"
              }`}
            style={{ border: "1px solid rgba(80,120,60,0.3)" }}
          >
            <Rewind size={12} className="text-green-300/80" />
          </button>
        </HudTooltip>
        <HudTooltip label="Current game speed">
          <span
            className="relative z-10 w-7 cursor-default rounded-md px-1 py-0.5 text-center text-[10px] font-black tabular-nums text-green-300/90 sm:w-9 sm:px-1.5 sm:text-[11px]"
            style={{ background: MANA.fill, border: "1px solid rgba(80,120,60,0.25)" }}
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
            className={`relative z-10 rounded-md p-0.5 transition-colors sm:p-1 ${pauseLocked
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-green-800/40"
              }`}
            style={{ border: "1px solid rgba(80,120,60,0.3)" }}
          >
            <FastForward size={12} className="text-green-300/80" />
          </button>
        </HudTooltip>
        <div className="hidden sm:contents">
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
                className={`relative z-10 rounded-md px-1.5 py-0.5 text-[10px] font-black transition-all ${pauseLocked ? "cursor-not-allowed opacity-40" : ""
                  }`}
                style={{
                  background:
                    gameSpeed === speed
                      ? `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`
                      : SPEED.bg,
                  border:
                    gameSpeed === speed
                      ? `1px solid ${GOLD.accentBorder40}`
                      : "1px solid rgba(80,100,140,0.2)",
                  color:
                    gameSpeed === speed
                      ? "#fde68a"
                      : "rgba(147,197,253,0.7)",
                }}
              >
                {speed}x
              </button>
            </HudTooltip>
          ))}
        </div>
      </div>

      <div
        className="relative hidden h-8 items-center gap-0.5 rounded-lg px-1 sm:flex sm:h-10 sm:px-1.5"
        style={{
          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
          border: `1.5px solid ${GOLD.border25}`,
          boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
        }}
      >
        <div
          className="absolute inset-[2px] rounded-[6px] pointer-events-none"
          style={{ border: `1px solid ${GOLD.innerBorder08}` }}
        />
        <HudTooltip label={`Performance mode: ${performanceMode ? "ON" : "OFF"} · ${currentFps} FPS`}>
          <button
            onClick={togglePerformanceMode}
            className={`relative z-10 flex items-center justify-center rounded-md p-1 transition-colors hover:brightness-125 sm:p-1.5 ${currentFps < 45 && !performanceMode ? "animate-pulse" : ""
              }`}
            style={{
              background: performanceMode
                ? "linear-gradient(135deg, rgba(20,120,120,0.5), rgba(10,80,80,0.3))"
                : currentFps < 45
                  ? "linear-gradient(135deg, rgba(120,30,30,0.5), rgba(80,15,15,0.3))"
                  : "linear-gradient(135deg, rgba(60,30,80,0.5), rgba(40,20,55,0.3))",
              border: performanceMode
                ? "1px solid rgba(34,211,238,0.4)"
                : currentFps < 45
                  ? "1px solid rgba(248,113,113,0.4)"
                  : "1px solid rgba(140,80,180,0.3)",
            }}
          >
            <Activity
              size={13}
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
                className={`absolute -bottom-1 -right-1 rounded px-0.5 text-[7px] font-bold ${currentFps >= 55
                  ? "bg-green-700 text-green-100"
                  : currentFps >= 45
                    ? "bg-yellow-700 text-yellow-100"
                    : "bg-red-700 text-red-100"
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
            className="relative z-10 flex items-center justify-center rounded-md p-1 transition-colors hover:brightness-125 sm:p-1.5"
            style={{
              background:
                "linear-gradient(135deg, rgba(140,70,10,0.5), rgba(95,45,5,0.3))",
              border: "1px solid rgba(217,119,6,0.4)",
            }}
          >
            <Settings size={13} className="text-orange-300" />
          </button>
        </HudTooltip>
        {onTogglePhotoMode && (
          <HudTooltip label={cameraModeActive ? "Exit photo mode (F2)" : "Photo mode (F2)"}>
            <button
              onClick={onTogglePhotoMode}
              className="relative z-10 flex items-center justify-center rounded-md p-1 transition-colors hover:brightness-125 sm:p-1.5"
              style={{
                background: cameraModeActive
                  ? "linear-gradient(135deg, rgba(100,80,180,0.6), rgba(70,50,140,0.4))"
                  : "linear-gradient(135deg, rgba(60,60,100,0.5), rgba(35,35,70,0.3))",
                border: cameraModeActive
                  ? "1px solid rgba(160,140,255,0.5)"
                  : "1px solid rgba(120,120,200,0.35)",
                boxShadow: cameraModeActive ? "0 0 8px rgba(140,120,255,0.3)" : "none",
              }}
            >
              <Camera size={13} className={cameraModeActive ? "text-indigo-200" : "text-indigo-300"} />
            </button>
          </HudTooltip>
        )}
        {onToggleDevMenu && (
          <HudTooltip label={devMenuOpen ? "Close event log" : "Event log"}>
            <button
              onClick={onToggleDevMenu}
              className="relative z-10 flex items-center justify-center rounded-md p-1 transition-colors hover:brightness-125 sm:p-1.5"
              style={{
                background: devMenuOpen
                  ? "linear-gradient(135deg, rgba(30,70,120,0.6), rgba(20,50,90,0.4))"
                  : "linear-gradient(135deg, rgba(30,50,80,0.5), rgba(20,35,60,0.3))",
                border: devMenuOpen
                  ? "1px solid rgba(96,165,250,0.5)"
                  : "1px solid rgba(80,120,200,0.35)",
                boxShadow: devMenuOpen ? "0 0 8px rgba(96,165,250,0.2)" : "none",
              }}
            >
              <TerminalSquare
                size={13}
                className={devMenuOpen ? "text-blue-200" : "text-blue-300"}
              />
            </button>
          </HudTooltip>
        )}
      </div>

      <div
        className="relative flex h-8 items-center gap-0.5 rounded-lg px-0.5 sm:h-10 sm:px-1.5"
        style={{
          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
          border: `1.5px solid ${GOLD.border25}`,
          boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
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
            className={`relative z-10 rounded-md p-1 transition-colors sm:p-1.5 ${pauseLocked ? "cursor-not-allowed opacity-40" : "hover:brightness-125"
              }`}
            style={{
              background: `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`,
              border: `1px solid ${GOLD.border35}`,
            }}
          >
            {pauseLocked ? (
              <Lock size={13} className="text-amber-300/60" />
            ) : gameSpeed === 0 ? (
              <Play size={13} className="text-amber-300" />
            ) : (
              <Pause size={13} className="text-amber-300" />
            )}
          </button>
        </HudTooltip>
        <HudTooltip label="Restart level">
          <button
            onClick={retryLevel}
            className="relative z-10 rounded-md p-1 transition-colors hover:brightness-125 sm:p-1.5"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,80,40,0.5), rgba(10,55,25,0.3))",
              border: "1px solid rgba(60,140,80,0.35)",
            }}
          >
            <RefreshCcw size={13} className="text-emerald-300" />
          </button>
        </HudTooltip>
        <HudTooltip label="Quit to world map">
          <button
            onClick={quitLevel}
            className="relative z-10 rounded-md p-1 transition-colors hover:brightness-125 sm:p-1.5"
            style={{
              background:
                "linear-gradient(135deg, rgba(100,20,20,0.5), rgba(70,10,10,0.3))",
              border: `1px solid ${RED_CARD.accent35}`,
            }}
          >
            <X size={13} className="text-red-300" />
          </button>
        </HudTooltip>
      </div>
    </>
  );

  return (
    <>
      <div
        data-tutorial="top-hud"
        className="pointer-events-none relative z-[70]"
      >
        {isDesktop ? (
          <div className="flex items-start justify-between gap-3">
            <HudSurface
              className="min-w-0"
              contentClassName="relative px-3 py-2 rounded-br-xl"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center shrink-0">
                  <PrincetonTDLogo size="h-10 w-10" />
                  <div
                    className="ml-2 h-7 w-px"
                    style={{
                      background: `linear-gradient(180deg, transparent, ${GOLD.border35}, transparent)`,
                    }}
                  />
                </div>
                {leftStatsContent}
              </div>
            </HudSurface>
            <HudSurface contentClassName="px-2 py-2">
              <div className="flex items-center gap-1.5 shrink-0">
                {rightControlsContent}
              </div>
            </HudSurface>
          </div>
        ) : (
          <HudSurface contentClassName="relative px-2 py-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0 flex-shrink">
                {leftStatsContent}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {rightControlsContent}
              </div>
            </div>
          </HudSurface>
        )}

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
    </>
  );
};
