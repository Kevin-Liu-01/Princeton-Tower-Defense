"use client";
import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import {
  getPerformanceSettings,
  setPerformanceSettings,
} from "../../rendering/performance";
import PrincetonTDLogo from "./PrincetonTDLogo";
import { OrnateFrame } from "./OrnateFrame";
import { PANEL, GOLD, AMBER_CARD, RED_CARD, BLUE_CARD, DIVIDER, SELECTED, SPEED, MANA, OVERLAY, panelGradient, dividerGradient } from "./theme";

// =============================================================================
// TOP HUD COMPONENT
// =============================================================================

interface TopHUDProps {
  pawPoints: number;
  lives: number;
  currentWave: number;
  totalWaves: number;
  nextWaveTimer: number;
  gameSpeed: number;
  setGameSpeed: (speed: number | ((prev: number) => number)) => void;
  retryLevel: () => void;
  quitLevel: () => void;
  // Animation props
  goldSpellActive?: boolean;
  // Eating club income events for stacking floaters
  eatingClubIncomeEvents?: Array<{ id: string; amount: number }>;
  onEatingClubEventComplete?: (id: string) => void;
  // Bounty income events (from enemy kills)
  bountyIncomeEvents?: Array<{ id: string; amount: number; isGoldBoosted: boolean }>;
  onBountyEventComplete?: (id: string) => void;
  // Inspector integration
  inspectorActive?: boolean;
  setInspectorActive?: (active: boolean) => void;
  setSelectedInspectEnemy?: (enemy: null) => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  pawPoints,
  lives,
  currentWave,
  totalWaves,
  nextWaveTimer,
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
}) => {
  // Performance mode state - starts based on browser detection
  const [performanceMode, setPerformanceMode] = useState(() => {
    const settings = getPerformanceSettings();
    return settings.disableShadows;
  });

  // FPS tracking for auto-toggle
  const [currentFps, setCurrentFps] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const autoToggleCooldownRef = useRef(0);

  // FPS monitoring effect
  useEffect(() => {
    let animationFrameId: number;

    const measureFps = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Keep last 30 frame times for averaging
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift();
      }

      // Calculate average FPS every 15 frames
      if (frameTimesRef.current.length >= 15 && frameTimesRef.current.length % 15 === 0) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const fps = Math.round(1000 / avgFrameTime);
        setCurrentFps(fps);

        // Auto-toggle performance mode if FPS drops below 45 for sustained period
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

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [performanceMode]);

  // Toggle performance mode manually
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

  // Track previous values for animation triggers
  const prevPawPoints = useRef(pawPoints);
  const prevLives = useRef(lives);

  // Animation states
  const [ppPulse, setPpPulse] = useState(false);
  const [livesShake, setLivesShake] = useState(false);
  const [livesFlash, setLivesFlash] = useState(false);

  // Stacking eating club floaters
  const [activeEatingClubFloaters, setActiveEatingClubFloaters] = useState<Array<{ id: string; amount: number; startTime: number }>>([]);
  const [eatingClubFlash, setEatingClubFlash] = useState(false);
  const processedEatingClubEventsRef = useRef<Set<string>>(new Set());

  // Stacking bounty floaters (from enemy kills)
  const [activeBountyFloaters, setActiveBountyFloaters] = useState<Array<{ id: string; amount: number; isGoldBoosted: boolean; startTime: number }>>([]);
  const processedBountyEventsRef = useRef<Set<string>>(new Set());

  // Process new eating club income events
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
        return {
          id: event.id,
          amount: event.amount,
          startTime: now + idx * 80,
        };
      });

      setActiveEatingClubFloaters(prev => [...prev, ...newFloaters]);
    }
  }, [eatingClubIncomeEvents]);

  // Clean up eating club floaters after animation completes
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

  // Process new bounty income events
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
        return {
          id: event.id,
          amount: event.amount,
          isGoldBoosted: event.isGoldBoosted,
          startTime: now + idx * 50,
        };
      });

      setActiveBountyFloaters(prev => [...prev, ...newFloaters]);
    }
  }, [bountyIncomeEvents]);

  // Clean up bounty floaters after animation completes
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

  // Update previous pawPoints ref
  useEffect(() => {
    prevPawPoints.current = pawPoints;
  }, [pawPoints]);

  // Detect lives changes
  useEffect(() => {
    if (lives < prevLives.current) {
      setLivesShake(true);
      setLivesFlash(true);

      const timeout1 = setTimeout(() => setLivesShake(false), 500);
      const timeout2 = setTimeout(() => setLivesFlash(false), 300);

      prevLives.current = lives;
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
    prevLives.current = lives;
  }, [lives]);

  return (
    <OrnateFrame
      className="border-b-2 border-amber-700/50 shadow-xl relative flex-shrink-0"
      cornerSize={28}
      showBorders={true}
      showTopBottomBorders={false}
    >
      <div
        className="relative z-20"
        style={{
          background: panelGradient,
        }}
      >
        {/* Top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25}, transparent)` }} />

        <div
          className="px-3 sm:px-6 py-2 flex flex-col sm:flex-row items-center relative z-20"
          style={{ zIndex: 100 }}
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="hidden sm:flex items-center">
              <PrincetonTDLogo height="h-10" width="w-10" />
              <div className="w-px h-7 ml-2 sm:ml-3" style={{ background: `linear-gradient(180deg, transparent, ${GOLD.border35}, transparent)` }} />
            </div>

            {/* PawPoints with animation */}
            <div
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl transition-all duration-200 ${ppPulse ? 'scale-110' : 'scale-100'}`}
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
              {/* Inner border */}
              <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{
                border: goldSpellActive
                  ? "1px solid rgba(250,204,21,0.15)"
                  : eatingClubFlash
                    ? "1px solid rgba(52,211,153,0.15)"
                    : `1px solid ${AMBER_CARD.innerBorder}`,
              }} />

              {/* Stacking bounty floaters (from enemy kills) */}
              {activeBountyFloaters.map((floater, index) => (
                <div
                  key={floater.id}
                  className="absolute left-1/2 font-bold text-sm whitespace-nowrap pointer-events-none"
                  style={{
                    animation: 'bountyFloat 1s ease-out forwards',
                    animationDelay: `${index * 30}ms`,
                    bottom: -8,
                    zIndex: 100 - index,
                  }}
                >
                  <span className={floater.isGoldBoosted
                    ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]'
                    : 'text-amber-300 drop-shadow-[0_0_6px_rgba(217,119,6,0.7)]'}>
                    +{floater.amount}
                  </span>
                  {floater.isGoldBoosted && <Sparkles size={12} className="text-yellow-300 ml-0.5 inline-block" />}
                </div>
              ))}

              {/* Stacking eating club floaters */}
              {activeEatingClubFloaters.map((floater, index) => (
                <div
                  key={floater.id}
                  className="absolute left-1/2 font-bold text-sm whitespace-nowrap pointer-events-none"
                  style={{
                    animation: 'eatingClubFloat 1.2s ease-out forwards',
                    animationDelay: `${index * 50}ms`,
                    bottom: -8,
                    zIndex: 90 - index,
                  }}
                >
                  <span className="text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">
                    +{floater.amount}
                  </span>
                  <Landmark size={12} className="text-emerald-400 ml-0.5 inline-block" />
                </div>
              ))}

              <PawPrint
                size={16}
                className={`shrink-0 transition-colors duration-200 ${goldSpellActive ? 'text-yellow-300' : eatingClubFlash ? 'text-emerald-300' : 'text-amber-400'}`}
              />
              <span
                className={`font-black text-sm sm:text-lg transition-colors duration-200 ${goldSpellActive ? 'text-yellow-200' : eatingClubFlash ? 'text-emerald-200' : 'text-amber-300'
                  }`}
              >
                {pawPoints}
              </span>
              <span className={`text-[9px] font-semibold transition-colors duration-200 ${goldSpellActive ? 'text-yellow-500' : eatingClubFlash ? 'text-emerald-500' : 'text-amber-600'}`}>PP</span>

              {/* Gold spell glow effect */}
              {goldSpellActive && (
                <div className="absolute inset-0 rounded-xl bg-yellow-400/15 animate-pulse pointer-events-none" />
              )}

              {/* Eating club flash glow effect */}
              {eatingClubFlash && (
                <div className="absolute inset-0 rounded-xl bg-emerald-400/25 pointer-events-none" style={{ animation: 'eatingClubGlow 0.4s ease-out forwards' }} />
              )}
            </div>

            {/* Lives with animation */}
            <div
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl transition-all`}
              style={{
                background: livesFlash
                  ? "linear-gradient(135deg, rgba(180,30,30,0.7), rgba(120,20,20,0.5))"
                  : `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
                border: livesFlash
                  ? "1.5px solid rgba(248,113,113,0.5)"
                  : `1.5px solid ${RED_CARD.border}`,
                boxShadow: livesFlash
                  ? "inset 0 0 15px rgba(248,113,113,0.15)"
                  : `inset 0 0 12px ${RED_CARD.glow06}`,
                animation: livesShake ? 'shake 0.5s ease-in-out' : 'none',
              }}
            >
              {/* Inner border */}
              <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder12}` }} />
              <Heart
                size={16}
                className={`shrink-0 transition-all ${livesFlash ? 'text-red-200 scale-125' : 'text-red-400'}`}
                fill={livesFlash ? "#fecaca" : "#f87171"}
              />
              <span
                className={`font-black text-sm sm:text-lg transition-colors ${livesFlash ? 'text-red-100' : 'text-red-300'
                  }`}
              >
                {lives}
              </span>
              <span className="text-[9px] text-red-700 font-semibold">Lives</span>

              {/* Flash overlay */}
              {livesFlash && (
                <div className="absolute inset-0 rounded-xl bg-red-500/30 pointer-events-none" />
              )}
            </div>

            {/* Wave indicator */}
            <div className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl" style={{
              background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
              border: `1.5px solid ${AMBER_CARD.border}`,
              boxShadow: `inset 0 0 12px ${AMBER_CARD.glow}`,
            }}>
              <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
              <Crown size={15} className="text-amber-400 shrink-0" />
              <span className="text-[9px] text-amber-600 font-semibold uppercase">Wave</span>
              <span className="font-black text-sm sm:text-base text-amber-300">
                {Math.min(currentWave + 1, totalWaves)}/{totalWaves}
              </span>
            </div>

            {/* Next wave timer */}
            <div className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl" style={{
              background: `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`,
              border: `1.5px solid ${BLUE_CARD.border}`,
              boxShadow: `inset 0 0 12px ${BLUE_CARD.glow}`,
            }}>
              <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${BLUE_CARD.innerBorder}` }} />
              <Timer size={15} className="text-blue-400 shrink-0" />
              <span className="hidden sm:inline text-[9px] text-blue-600 font-semibold uppercase">
                Next
              </span>
              <span className="font-black text-sm sm:text-base text-blue-300">
                {Math.ceil(nextWaveTimer / 1000)}s
              </span>
            </div>
          </div>

          {/* CSS Keyframes for animations */}
          <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }
        @keyframes bountyFloat {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0) scale(0.5);
          }
          15% {
            opacity: 1;
            transform: translateX(-50%) translateY(-18px) scale(1.15);
          }
          30% {
            transform: translateX(-50%) translateY(-24px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-45px) scale(0.85);
          }
        }
        @keyframes eatingClubFloat {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0) scale(0.6);
          }
          12% {
            opacity: 1;
            transform: translateX(-50%) translateY(-20px) scale(1.2);
          }
          25% {
            transform: translateX(-50%) translateY(-28px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-55px) scale(0.9);
          }
        }
        @keyframes eatingClubGlow {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
          <div className="mt-2 sm:mt-0 flex sm:ml-auto gap-2 sm:gap-2.5">
            {/* Speed controls */}
            <div className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl" style={{
              background: "linear-gradient(135deg, rgba(35,40,20,0.7), rgba(25,30,12,0.5))",
              border: "1.5px solid rgba(120,140,60,0.3)",
              boxShadow: "inset 0 0 12px rgba(120,140,60,0.05)",
            }}>
              <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: "1px solid rgba(120,140,60,0.1)" }} />
              <span className="text-[7px] sm:text-[9px] text-amber-300/70 mr-0.5 font-bold tracking-wider uppercase">
                Speed
              </span>
              <button
                onClick={() => {
                  setGameSpeed((prev) => Math.max(prev - 0.25, 0));
                  if (inspectorActive && setInspectorActive) {
                    setInspectorActive(false);
                    if (setSelectedInspectEnemy) {
                      setSelectedInspectEnemy(null);
                    }
                  }
                }}
                title="Decrease game speed (-0.25x)"
                className="relative z-10 p-1 rounded-lg transition-colors hover:bg-green-800/40"
                style={{ border: "1px solid rgba(80,120,60,0.3)" }}
              >
                <Rewind size={14} className="text-green-300/80" />
              </button>
              <span
                title="Current game speed"
                className="relative z-10 px-1.5 w-10 text-center text-[11px] font-black py-1 rounded-lg cursor-default text-green-300/90"
                style={{
                  background: MANA.fill,
                  border: "1px solid rgba(80,120,60,0.25)",
                }}
              >
                {Number.isInteger(gameSpeed)
                  ? gameSpeed + "x"
                  : gameSpeed % 0.5 === 0
                    ? gameSpeed.toFixed(1) + "x"
                    : gameSpeed.toFixed(2) + "x"}
              </span>
              <button
                onClick={() => {
                  setGameSpeed((prev) => Math.min(prev + 0.25, 5));
                  if (inspectorActive && setInspectorActive) {
                    setInspectorActive(false);
                    if (setSelectedInspectEnemy) {
                      setSelectedInspectEnemy(null);
                    }
                  }
                }}
                title="Increase game speed (+0.25x)"
                className="relative z-10 p-1 rounded-lg transition-colors hover:bg-green-800/40"
                style={{ border: "1px solid rgba(80,120,60,0.3)" }}
              >
                <FastForward size={14} className="text-green-300/80" />
              </button>
              {[0.5, 1, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setGameSpeed(speed);
                    if (inspectorActive && setInspectorActive) {
                      setInspectorActive(false);
                      if (setSelectedInspectEnemy) {
                        setSelectedInspectEnemy(null);
                      }
                    }
                  }}
                  title={`Set game speed to ${speed}x`}
                  className="relative z-10 px-2 py-1 rounded-lg font-black text-[11px] transition-all"
                  style={{
                    background: gameSpeed === speed
                      ? `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`
                      : SPEED.bg,
                    border: gameSpeed === speed
                      ? `1px solid ${GOLD.accentBorder40}`
                      : "1px solid rgba(80,100,140,0.2)",
                    color: gameSpeed === speed ? "#fde68a" : "rgba(147,197,253,0.7)",
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="relative flex items-center gap-1 px-2 py-1.5 rounded-xl" style={{
              background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
              border: `1.5px solid ${GOLD.border25}`,
              boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
            }}>
              <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
              <button
                onClick={() => {
                  if (gameSpeed === 0) {
                    setGameSpeed(1);
                    if (inspectorActive && setInspectorActive) {
                      setInspectorActive(false);
                      if (setSelectedInspectEnemy) {
                        setSelectedInspectEnemy(null);
                      }
                    }
                  } else {
                    setGameSpeed(0);
                  }
                }}
                title={gameSpeed === 0 ? "Resume game (Spacebar)" : "Pause game (Spacebar)"}
                className="relative z-10 p-1.5 rounded-lg transition-colors hover:brightness-125"
                style={{
                  background: `linear-gradient(135deg, ${SELECTED.bgLight}, ${SELECTED.bgDark})`,
                  border: `1px solid ${GOLD.border35}`,
                }}
              >
                {gameSpeed === 0 ? (
                  <Play size={15} className="text-amber-300" />
                ) : (
                  <Pause size={15} className="text-amber-300" />
                )}
              </button>
              <button
                onClick={togglePerformanceMode}
                title={`Performance Mode: ${performanceMode ? "ON" : "OFF"} | FPS: ${currentFps} | ${performanceMode ? "Reduced effects for better FPS" : "Full visual effects"} | Auto-enables below 45 FPS`}
                className={`relative z-10 p-1.5 hidden sm:flex items-center justify-center rounded-lg transition-colors hover:brightness-125 ${currentFps < 45 && !performanceMode ? 'animate-pulse' : ''}`}
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
                <Activity size={15} className={performanceMode ? "text-cyan-300" : currentFps < 45 ? "text-red-300" : "text-purple-300"} />
                <span className={`absolute -bottom-1 -right-1 text-[7px] font-bold px-0.5 rounded ${currentFps >= 55 ? "bg-green-700 text-green-100" :
                  currentFps >= 45 ? "bg-yellow-700 text-yellow-100" :
                    "bg-red-700 text-red-100"
                  }`}>
                  {currentFps}
                </span>
              </button>
              <button
                onClick={() => {
                  retryLevel();
                }}
                title="Restart current level from the beginning"
                className="relative z-10 p-1.5 rounded-lg transition-colors hover:brightness-125"
                style={{
                  background: "linear-gradient(135deg, rgba(20,80,40,0.5), rgba(10,55,25,0.3))",
                  border: "1px solid rgba(60,140,80,0.35)",
                }}
              >
                <RefreshCcw size={15} className="text-emerald-300" />
              </button>
              <button
                onClick={() => {
                  quitLevel();
                }}
                title="Quit to world map (progress will be lost)"
                className="relative z-10 p-1.5 rounded-lg transition-colors hover:brightness-125"
                style={{
                  background: "linear-gradient(135deg, rgba(100,20,20,0.5), rgba(70,10,10,0.3))",
                  border: `1px solid ${RED_CARD.accent35}`,
                }}
              >
                <X size={15} className="text-red-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)` }} />
      </div>
    </OrnateFrame>
  );
};
