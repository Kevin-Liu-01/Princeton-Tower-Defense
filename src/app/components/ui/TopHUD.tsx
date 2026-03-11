"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  PawPrint,
  Heart,
  Timer,
  Crown,
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
  Skull,
  Swords,
  Shield,
} from "lucide-react";
import {
  getPerformanceSettings,
  setPerformanceSettings,
} from "../../rendering/performance";
import PrincetonTDLogo from "./PrincetonTDLogo";
import { OrnateFrame } from "./OrnateFrame";
import { PANEL, GOLD, AMBER_CARD, RED_CARD, BLUE_CARD, DIVIDER, SELECTED, SPEED, MANA, panelGradient } from "./theme";
import { SettingsModal } from "../menus/SettingsModal";
import { useSettings } from "../../hooks/useSettings";
import type { EventStats } from "../../hooks/useGameEventLog";
import { HudTooltip } from "./HudTooltip";

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
      bg: "linear-gradient(135deg, rgba(60,45,18,0.8), rgba(45,32,12,0.65))",
      border: "1.5px solid rgba(200,160,40,0.45)",
      shadow: "inset 0 0 12px rgba(200,160,40,0.08)",
      innerBorder: "1px solid rgba(200,160,40,0.15)",
      iconClass: "text-yellow-400",
      iconFill: "#fbbf24",
      textClass: "text-yellow-300",
      barColor: "#fbbf24",
      subText: "text-yellow-600/50",
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

// =============================================================================
// TOP HUD COMPONENT
// =============================================================================

interface TopHUDProps {
  pawPoints: number;
  lives: number;
  maxLives: number;
  currentWave: number;
  totalWaves: number;
  nextWaveTimer: number;
  waveInProgress: boolean;
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
  eventStats?: EventStats;
  onToggleDevMenu?: () => void;
  devMenuOpen?: boolean;
  enemyCount?: number;
  towerCount?: number;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  pawPoints,
  lives,
  maxLives,
  currentWave,
  totalWaves,
  nextWaveTimer,
  waveInProgress,
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
  eventStats,
  onToggleDevMenu,
  devMenuOpen = false,
  enemyCount = 0,
  towerCount = 0,
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
  const timerSeconds = Math.ceil(nextWaveTimer / 1000);
  const timerUrgent = timerSeconds <= 5 && !waveInProgress;

  const exitInspectorOnSpeed = () => {
    if (inspectorActive && setInspectorActive) {
      setInspectorActive(false);
      if (setSelectedInspectEnemy) setSelectedInspectEnemy(null);
    }
  };

  return (
    <>
      <OrnateFrame
        className="border-2 border-amber-700/50 shadow-xl relative flex-shrink-0 z-[70]"
        cornerSize={28}
        showBorders={true}
        showTopBottomBorders={false}
      >
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)` }} />

        <div
          data-tutorial="top-hud"
          className="relative z-20"
          style={{ background: panelGradient }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25}, transparent)` }} />

          <div
            className="px-2 sm:px-5 py-1 sm:py-1.5 flex items-center justify-between gap-1 sm:gap-0 relative z-20"
            style={{ zIndex: 100 }}
          >
            {/* Left: Logo + core stats */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink">
              <div className="hidden sm:flex items-center shrink-0">
                <PrincetonTDLogo size="h-10 w-10" />
                <div className="w-px h-7 ml-2" style={{ background: `linear-gradient(180deg, transparent, ${GOLD.border35}, transparent)` }} />
              </div>

              {/* PawPoints */}
              <div
                className={`relative flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 shrink-0 min-w-[60px] sm:min-w-[88px] h-8 sm:h-10 ${ppPulse ? 'scale-110' : 'scale-100'}`}
                style={{
                  background: goldSpellActive
                    ? `linear-gradient(135deg, rgba(140,100,20,0.7), rgba(100,68,15,0.5))`
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
                <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{
                  border: goldSpellActive
                    ? "1px solid rgba(250,204,21,0.15)"
                    : eatingClubFlash
                      ? "1px solid rgba(52,211,153,0.15)"
                      : `1px solid ${AMBER_CARD.innerBorder}`,
                }} />

                {/* Bounty floaters */}
                {activeBountyFloaters.map((floater, index) => (
                  <div
                    key={floater.id}
                    className="absolute left-1/2 font-bold text-xs sm:text-sm whitespace-nowrap pointer-events-none"
                    style={{ animation: 'bountyFloat 1s ease-out forwards', animationDelay: `${index * 30}ms`, bottom: -8, zIndex: 100 - index }}
                  >
                    <span className={floater.isGoldBoosted
                      ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]'
                      : 'text-amber-300 drop-shadow-[0_0_6px_rgba(217,119,6,0.7)]'}>
                      +{floater.amount}
                    </span>
                    {floater.isGoldBoosted && <Sparkles size={10} className="text-yellow-300 ml-0.5 inline-block" />}
                  </div>
                ))}

                {/* Eating club floaters */}
                {activeEatingClubFloaters.map((floater, index) => (
                  <div
                    key={floater.id}
                    className="absolute left-1/2 font-bold text-xs sm:text-sm whitespace-nowrap pointer-events-none"
                    style={{ animation: 'eatingClubFloat 1.2s ease-out forwards', animationDelay: `${index * 50}ms`, bottom: -8, zIndex: 90 - index }}
                  >
                    <span className="text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">+{floater.amount}</span>
                    <Landmark size={10} className="text-emerald-400 ml-0.5 inline-block" />
                  </div>
                ))}

                <PawPrint
                  size={14}
                  className={`shrink-0 transition-colors duration-200 ${goldSpellActive ? 'text-yellow-300' : eatingClubFlash ? 'text-emerald-300' : 'text-amber-400'}`}
                />
                <span className={`font-black text-sm sm:text-base tabular-nums transition-colors duration-200 ${goldSpellActive ? 'text-yellow-200' : eatingClubFlash ? 'text-emerald-200' : 'text-amber-200'}`}>
                  {Math.round(pawPoints)}
                </span>

                {goldSpellActive && <div className="absolute inset-0 rounded-lg bg-yellow-400/15 animate-pulse pointer-events-none" />}
                {eatingClubFlash && <div className="absolute inset-0 rounded-lg bg-emerald-400/25 pointer-events-none" style={{ animation: 'eatingClubGlow 0.4s ease-out forwards' }} />}
              </div>

              {/* Lives — red themed with health-based color transitions */}
              <div
                className="relative flex items-center justify-center rounded-lg transition-all shrink-0 min-w-[60px] sm:min-w-[88px] h-8 sm:h-10 overflow-hidden"
                style={{
                  background: livesTheme.bg,
                  border: livesTheme.border,
                  boxShadow: livesTheme.shadow,
                  animation: livesShake ? 'shake 0.5s ease-in-out' : 'none',
                }}
              >
                {/* Fill bar — drains from right as health drops */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    background: `linear-gradient(90deg, ${livesTheme.barColor}25, ${livesTheme.barColor}15)`,
                    clipPath: `inset(0 ${100 - livesPercent}% 0 0)`,
                  }}
                />
                <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: livesTheme.innerBorder }} />
                <div className="relative z-10 flex items-center justify-center gap-1.5">
                  <Heart
                    size={14}
                    className={`shrink-0 ${livesTheme.iconClass}`}
                    fill={livesTheme.iconFill}
                    style={{
                      animation: livesPercent <= 60
                        ? `heartbeat ${livesPercent <= 15 ? '0.6s' : livesPercent <= 30 ? '0.9s' : '1.4s'} ease-in-out infinite`
                        : 'none',
                    }}
                  />
                  <span className={`font-black text-sm sm:text-base leading-none tabular-nums transition-colors ${livesTheme.textClass}`}>
                    {lives}
                  </span>
                  <span className={`hidden sm:inline text-[8px] sm:text-[9px] font-medium ${livesTheme.subText}`}>/{maxLives}</span>
                </div>
                {livesFlash && <div className="absolute inset-0 bg-red-500/30 pointer-events-none" />}
              </div>

              {/* Wave indicator */}
              <div className="relative flex items-center justify-center rounded-lg shrink-0 min-w-[60px] sm:min-w-[88px] h-8 sm:h-10 overflow-hidden" style={{
                background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                border: `1.5px solid ${AMBER_CARD.border}`,
                boxShadow: `inset 0 0 12px ${AMBER_CARD.glow}`,
              }}>
                {/* Fill bar — grows from left as waves complete */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
                  style={{
                    background: "linear-gradient(90deg, rgba(251,191,36,0.2), rgba(245,158,11,0.12))",
                    clipPath: `inset(0 ${100 - waveProgress}% 0 0)`,
                  }}
                />
                <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
                <div className="relative z-10 flex items-center justify-center gap-1.5">
                  <Crown size={13} className="text-amber-400 shrink-0" />
                  <span className="font-black text-sm sm:text-base text-amber-200 tabular-nums leading-none">
                    {Math.min(currentWave + 1, totalWaves)}
                  </span>
                  <span className="hidden sm:inline text-[9px] sm:text-[10px] text-amber-500/50 font-medium">/ {totalWaves}</span>
                </div>
              </div>

              {/* Next wave timer — hidden on mobile */}
              <div
                className={`relative hidden sm:flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg transition-all shrink-0 sm:min-w-[88px] sm:h-10 ${timerUrgent ? 'animate-pulse' : ''}`}
                style={{
                  background: timerUrgent
                    ? "linear-gradient(135deg, rgba(80,30,15,0.8), rgba(55,20,10,0.6))"
                    : waveInProgress
                      ? "linear-gradient(135deg, rgba(20,45,25,0.8), rgba(12,32,15,0.6))"
                      : `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`,
                  border: timerUrgent
                    ? "1.5px solid rgba(239,68,68,0.4)"
                    : waveInProgress
                      ? "1.5px solid rgba(52,211,153,0.35)"
                      : `1.5px solid ${BLUE_CARD.border}`,
                  boxShadow: timerUrgent
                    ? "inset 0 0 12px rgba(239,68,68,0.1)"
                    : `inset 0 0 12px ${BLUE_CARD.glow}`,
                }}
              >
                <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${BLUE_CARD.innerBorder}` }} />
                <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5">
                  <Timer size={13} className={`shrink-0 ${waveInProgress ? 'text-emerald-400' : timerUrgent ? 'text-red-400' : 'text-blue-400'}`} />
                  {waveInProgress ? (
                    <span className="font-bold text-[10px] sm:text-xs text-emerald-300 uppercase tracking-wide">Active</span>
                  ) : (
                    <span className={`font-black text-sm sm:text-base tabular-nums ${timerUrgent ? 'text-red-300' : 'text-blue-200'}`}>
                      {timerSeconds}s
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Center: Live field stats */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 rounded-lg h-9 sm:h-10 shrink-0" style={{
              background: "rgba(20,20,20,0.4)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <HudTooltip label={`${enemyCount} enemies alive`}>
                <div className="flex items-center gap-1">
                  <Skull size={11} className="text-red-400/70" />
                  <span className="text-[11px] font-bold text-red-300/80 tabular-nums">{enemyCount}</span>
                </div>
              </HudTooltip>
              <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.08)" }} />
              <HudTooltip label={`${towerCount} towers placed`}>
                <div className="flex items-center gap-1">
                  <Shield size={11} className="text-amber-400/70" />
                  <span className="text-[11px] font-bold text-amber-300/80 tabular-nums">{towerCount}</span>
                </div>
              </HudTooltip>
              {eventStats && (
                <>
                  <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <HudTooltip label={`${eventStats.enemiesKilled} total kills`}>
                    <div className="flex items-center gap-1">
                      <Swords size={11} className="text-orange-400/70" />
                      <span className="text-[11px] font-bold text-orange-300/80 tabular-nums">{eventStats.enemiesKilled}</span>
                    </div>
                  </HudTooltip>
                </>
              )}
            </div>

            {/* CSS Keyframes */}
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

            {/* Right: Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Speed controls */}
              <div className="relative flex items-center gap-0.5 px-1 sm:px-2 rounded-lg h-8 sm:h-10" style={{
                background: "linear-gradient(135deg, rgba(35,40,20,0.7), rgba(25,30,12,0.5))",
                border: "1.5px solid rgba(120,140,60,0.3)",
                boxShadow: "inset 0 0 12px rgba(120,140,60,0.05)",
              }}>
                <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: "1px solid rgba(120,140,60,0.1)" }} />
                <HudTooltip label={pauseLocked ? "Speed locked" : "Decrease speed"}>
                  <button
                    onClick={() => { if (pauseLocked) return; setGameSpeed((prev) => Math.max(prev - 0.25, 0)); exitInspectorOnSpeed(); }}
                    disabled={pauseLocked}
                    className={`relative z-10 p-0.5 sm:p-1 rounded-md transition-colors ${pauseLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-green-800/40"}`}
                    style={{ border: "1px solid rgba(80,120,60,0.3)" }}
                  >
                    <Rewind size={12} className="text-green-300/80" />
                  </button>
                </HudTooltip>
                <HudTooltip label="Current game speed">
                  <span
                    className="relative z-10 px-1 sm:px-1.5 w-7 sm:w-9 text-center text-[10px] sm:text-[11px] font-black py-0.5 rounded-md cursor-default text-green-300/90 tabular-nums"
                    style={{ background: MANA.fill, border: "1px solid rgba(80,120,60,0.25)" }}
                  >
                    {Number.isInteger(gameSpeed) ? gameSpeed + "x" : gameSpeed % 0.5 === 0 ? gameSpeed.toFixed(1) + "x" : gameSpeed.toFixed(2) + "x"}
                  </span>
                </HudTooltip>
                <HudTooltip label={pauseLocked ? "Speed locked" : "Increase speed"}>
                  <button
                    onClick={() => { if (pauseLocked) return; setGameSpeed((prev) => Math.min(prev + 0.25, 5)); exitInspectorOnSpeed(); }}
                    disabled={pauseLocked}
                    className={`relative z-10 p-0.5 sm:p-1 rounded-md transition-colors ${pauseLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-green-800/40"}`}
                    style={{ border: "1px solid rgba(80,120,60,0.3)" }}
                  >
                    <FastForward size={12} className="text-green-300/80" />
                  </button>
                </HudTooltip>
                {[0.5, 1, 2].map((speed) => (
                  <HudTooltip key={speed} label={pauseLocked ? "Speed locked" : `Set speed to ${speed}x`}>
                    <button
                      onClick={() => { if (pauseLocked) return; setGameSpeed(speed); exitInspectorOnSpeed(); }}
                      disabled={pauseLocked}
                      className={`relative z-10 hidden sm:block px-1.5 py-0.5 rounded-md font-black text-[10px] transition-all ${pauseLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                      style={{
                        background: gameSpeed === speed ? `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})` : SPEED.bg,
                        border: gameSpeed === speed ? `1px solid ${GOLD.accentBorder40}` : "1px solid rgba(80,100,140,0.2)",
                        color: gameSpeed === speed ? "#fde68a" : "rgba(147,197,253,0.7)",
                      }}
                    >
                      {speed}x
                    </button>
                  </HudTooltip>
                ))}
              </div>

              {/* Utility buttons (settings, perf, photo, log) */}
              <div className="relative hidden sm:flex items-center gap-0.5 px-1 sm:px-1.5 rounded-lg h-8 sm:h-10" style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${GOLD.border25}`,
                boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
              }}>
                <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                <HudTooltip label={`Performance mode: ${performanceMode ? "ON" : "OFF"} · ${currentFps} FPS`}>
                  <button
                    onClick={togglePerformanceMode}
                    className={`relative z-10 p-1 sm:p-1.5 flex items-center justify-center rounded-md transition-colors hover:brightness-125 ${currentFps < 45 && !performanceMode ? 'animate-pulse' : ''}`}
                    style={{
                      background: performanceMode ? "linear-gradient(135deg, rgba(20,120,120,0.5), rgba(10,80,80,0.3))" : currentFps < 45 ? "linear-gradient(135deg, rgba(120,30,30,0.5), rgba(80,15,15,0.3))" : "linear-gradient(135deg, rgba(60,30,80,0.5), rgba(40,20,55,0.3))",
                      border: performanceMode ? "1px solid rgba(34,211,238,0.4)" : currentFps < 45 ? "1px solid rgba(248,113,113,0.4)" : "1px solid rgba(140,80,180,0.3)",
                    }}
                  >
                    <Activity size={13} className={performanceMode ? "text-cyan-300" : currentFps < 45 ? "text-red-300" : "text-purple-300"} />
                    {gameSettings.ui.showFpsCounter && (
                      <span className={`absolute -bottom-1 -right-1 text-[7px] font-bold px-0.5 rounded ${currentFps >= 55 ? "bg-green-700 text-green-100" : currentFps >= 45 ? "bg-yellow-700 text-yellow-100" : "bg-red-700 text-red-100"}`}>
                        {currentFps}
                      </span>
                    )}
                  </button>
                </HudTooltip>
                <HudTooltip label="Game settings">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="relative z-10 p-1 sm:p-1.5 flex items-center justify-center rounded-md transition-colors hover:brightness-125"
                    style={{ background: "linear-gradient(135deg, rgba(140,70,10,0.5), rgba(95,45,5,0.3))", border: "1px solid rgba(217,119,6,0.4)" }}
                  >
                    <Settings size={13} className="text-orange-300" />
                  </button>
                </HudTooltip>
                {onTogglePhotoMode && (
                  <HudTooltip label={cameraModeActive ? "Exit photo mode (F2)" : "Photo mode (F2)"}>
                    <button
                      onClick={onTogglePhotoMode}
                      className="relative z-10 p-1 sm:p-1.5 rounded-md transition-colors hover:brightness-125 flex items-center justify-center"
                      style={{
                        background: cameraModeActive ? "linear-gradient(135deg, rgba(100,80,180,0.6), rgba(70,50,140,0.4))" : "linear-gradient(135deg, rgba(60,60,100,0.5), rgba(35,35,70,0.3))",
                        border: cameraModeActive ? "1px solid rgba(160,140,255,0.5)" : "1px solid rgba(120,120,200,0.35)",
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
                      className="relative z-10 p-1 sm:p-1.5 rounded-md transition-colors hover:brightness-125 flex items-center justify-center"
                      style={{
                        background: devMenuOpen ? "linear-gradient(135deg, rgba(30,70,120,0.6), rgba(20,50,90,0.4))" : "linear-gradient(135deg, rgba(30,50,80,0.5), rgba(20,35,60,0.3))",
                        border: devMenuOpen ? "1px solid rgba(96,165,250,0.5)" : "1px solid rgba(80,120,200,0.35)",
                        boxShadow: devMenuOpen ? "0 0 8px rgba(96,165,250,0.2)" : "none",
                      }}
                    >
                      <TerminalSquare size={13} className={devMenuOpen ? "text-blue-200" : "text-blue-300"} />
                    </button>
                  </HudTooltip>
                )}
              </div>

              {/* Game controls (pause, restart, quit) */}
              <div className="relative flex items-center gap-0.5 px-0.5 sm:px-1.5 rounded-lg h-8 sm:h-10" style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${GOLD.border25}`,
                boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
              }}>
                <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                <HudTooltip label={pauseLocked ? "Locked — exit photo/inspect mode first" : gameSpeed === 0 ? "Resume game (Space)" : "Pause game (Space)"}>
                  <button
                    onClick={() => {
                      if (pauseLocked) return;
                      if (gameSpeed === 0) { setGameSpeed(1); exitInspectorOnSpeed(); } else { setGameSpeed(0); }
                    }}
                    disabled={pauseLocked}
                    className={`relative z-10 p-1 sm:p-1.5 rounded-md transition-colors ${pauseLocked ? "opacity-40 cursor-not-allowed" : "hover:brightness-125"}`}
                    style={{ background: `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`, border: `1px solid ${GOLD.border35}` }}
                  >
                    {pauseLocked ? <Lock size={13} className="text-amber-300/60" /> : gameSpeed === 0 ? <Play size={13} className="text-amber-300" /> : <Pause size={13} className="text-amber-300" />}
                  </button>
                </HudTooltip>
                <HudTooltip label="Restart level">
                  <button
                    onClick={retryLevel}
                    className="relative z-10 p-1 sm:p-1.5 rounded-md transition-colors hover:brightness-125"
                    style={{ background: "linear-gradient(135deg, rgba(20,80,40,0.5), rgba(10,55,25,0.3))", border: "1px solid rgba(60,140,80,0.35)" }}
                  >
                    <RefreshCcw size={13} className="text-emerald-300" />
                  </button>
                </HudTooltip>
                <HudTooltip label="Quit to world map">
                  <button
                    onClick={quitLevel}
                    className="relative z-10 p-1 sm:p-1.5 rounded-md transition-colors hover:brightness-125"
                    style={{ background: "linear-gradient(135deg, rgba(100,20,20,0.5), rgba(70,10,10,0.3))", border: `1px solid ${RED_CARD.accent35}` }}
                  >
                    <X size={13} className="text-red-300" />
                  </button>
                </HudTooltip>
              </div>
            </div>
          </div>

          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)` }} />
        </div>
      </OrnateFrame>

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
