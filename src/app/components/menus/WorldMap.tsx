"use client";
import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Star,
  Swords,
  Play,
  Crown,
  X,
  Skull,
  Flag,
  Heart,
  MapPin,
  ChevronRight,
  Trophy,
  ChevronLeft,
  Clock,
  Book,
  AlertTriangle,
  Hammer,
} from "lucide-react";
import type { GameState, LevelStars, HeroType, SpellType } from "../../types";
import type { LevelStats } from "../../useLocalStorage";
import type {
  CustomLevelDefinition,
  CustomLevelDraftInput,
  CustomLevelUpsertResult,
} from "../../customLevels/types";
import { OrnateFrame } from "../ui/OrnateFrame";
import {
  LEVEL_DATA,
} from "../../constants";
import PrincetonTDLogo from "../ui/PrincetonTDLogo";
import { PANEL, GOLD, AMBER_CARD, RED_CARD, BLUE_CARD, GREEN_CARD, PURPLE_CARD, NEUTRAL, DIVIDER, SELECTED, OVERLAY, panelGradient, dividerGradient } from "../ui/theme";
import { WORLD_LEVELS, MAP_WIDTH, getWaveCount } from "./worldMapData";
import { CodexModal } from "./CodexModal";
import { BattlefieldPreview } from "./BattlefieldPreview";
import { HeroSelector } from "./HeroSelector";
import { SpellSelector } from "./SpellSelector";
import { CustomLevelCreatorModal } from "./CustomLevelCreatorModal";
import { drawWorldMapCanvas } from "./worldMapCanvasRenderer";
import { getWorldLevelById, getWorldMapY } from "./worldMapUtils";

// =============================================================================
// LOGO COMPONENT
// =============================================================================

const PrincetonLogo: React.FC = () => {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => (p + 1) % 100), 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center gap-2">
      <div className="absolute -inset-4 blur-2xl opacity-60">
        <div
          className="absolute inset-0 bg-gradient-to-r from-orange-600/40 via-amber-400/50 to-orange-600/40"
          style={{ transform: `scale(${1 + Math.sin(pulse * 0.1) * 0.1})` }}
        />
      </div>
      <PrincetonTDLogo size="h-11 w-11" />
      <div className="relative flex flex-col">
        <span
          className="text-base sm:text-2xl font-black tracking-wider"
          style={{
            background:
              "linear-gradient(180deg, #fcd34d 0%, #f59e0b 40%, #d97706 70%, #92400e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          PRINCETON
        </span>
        <div className="flex items-center gap-1 sm:gap-2 -mt-0.5">
          <Swords size={14} className="text-orange-400 size-2 sm:size-auto" />
          <span className="text-[6px] text-nowrap sm:text-[8.5px] font-bold tracking-[0.3em] text-amber-500/90">
            TOWER DEFENSE
          </span>
          <Swords
            size={14}
            className="text-orange-400 size-2 sm:size-auto"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
      </div>

      <div className="z-[-1] object-bottom object-contain absolute top-[-4.1rem] right-[-26rem] pointer-events-none select-none">
        <Image
          src="/images/gameplay-latest-zoomed.png"
          alt="Battle Scene"
          width={1200}
          height={700}
          className="w-full h-full opacity-20 scale-125"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 70%, transparent 100%)",
          }}
        />
      </div>

    </div>
  );
};

// =============================================================================
// WORLD MAP COMPONENT
// =============================================================================

interface WorldMapProps {
  setSelectedMap: (map: string) => void;
  setGameState: (state: GameState) => void;
  levelStars: LevelStars;
  levelStats: Record<string, LevelStats>;
  customLevels: CustomLevelDefinition[];
  onSaveCustomLevel: (draft: CustomLevelDraftInput) => CustomLevelUpsertResult;
  onDeleteCustomLevel: (levelId: string) => void;
  unlockedMaps: string[];
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType | null) => void;
  selectedSpells: SpellType[];
  setSelectedSpells: (spells: SpellType[]) => void;
  gameState: GameState;
}

type SelectableLevel = {
  id: string;
  name: string;
  description: string;
  region: (typeof WORLD_LEVELS)[number]["region"];
  difficulty: 1 | 2 | 3;
  isCustom?: boolean;
};

export const WorldMap: React.FC<WorldMapProps> = ({
  setSelectedMap,
  setGameState,
  levelStars,
  levelStats,
  customLevels,
  onSaveCustomLevel,
  onDeleteCustomLevel,
  unlockedMaps,
  selectedHero,
  setSelectedHero,
  selectedSpells,
  setSelectedSpells,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showCodex, setShowCodex] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [animTime, setAnimTime] = useState(0);
  const animTimeRef = useRef(0);
  const [mapHeight, setMapHeight] = useState(500);
  const [hoveredHero, setHoveredHero] = useState<HeroType | null>(null);
  const [hoveredSpell, setHoveredSpell] = useState<SpellType | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const lastCanvasSizeRef = useRef({ w: 0, h: 0 });
  const dragRef = useRef({
    hasDragged: false,
    dragStartX: 0,
    scrollStartLeft: 0,
    resetTimeoutId: 0 as number | undefined,
  });

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current)
        setMapHeight(Math.max(300, containerRef.current.clientHeight));
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const totalStars = Object.values(levelStars).reduce((a, b) => a + b, 0);
  const maxStars = WORLD_LEVELS.length * 3;
  const unlockedMapSet = useMemo(() => new Set(unlockedMaps), [unlockedMaps]);
  const customLevelById = useMemo(
    () => new Map(customLevels.map((level) => [level.id, level])),
    [customLevels]
  );
  const isCustomLevel = useCallback(
    (levelId: string) => customLevelById.has(levelId),
    [customLevelById]
  );
  const isLevelUnlocked = useCallback(
    (levelId: string) => isCustomLevel(levelId) || unlockedMapSet.has(levelId),
    [isCustomLevel, unlockedMapSet]
  );
  const getLevelById = useCallback(
    (id: string): SelectableLevel | undefined => {
      const campaignLevel = getWorldLevelById(id);
      if (campaignLevel) return campaignLevel;

      const customLevel = customLevelById.get(id);
      if (!customLevel) return undefined;
      return {
        id: customLevel.id,
        name: customLevel.name,
        description: customLevel.description,
        region: customLevel.theme,
        difficulty: customLevel.difficulty,
        isCustom: true,
      };
    },
    [customLevelById]
  );
  const getY = useCallback(
    (pct: number) => getWorldMapY(pct, mapHeight),
    [mapHeight]
  );
  const handleLevelClick = (levelId: string) => {
    if (isLevelUnlocked(levelId)) {
      setSelectedLevel(levelId);
      setSelectedMap(levelId);
      setHoveredLevel(null); // Clear hover state to prevent duplicate tooltip on mobile
    }
  };
  const handleCustomLevelPlaytest = useCallback(
    (levelId: string) => {
      if (!customLevelById.has(levelId)) return;
      setSelectedLevel(levelId);
      setSelectedMap(levelId);
      setHoveredLevel(null);
      setShowCreator(false);
    },
    [customLevelById, setSelectedMap]
  );
  const startGame = () => {
    if (selectedLevel && selectedHero && selectedSpells.length === 3)
      setGameState("playing");
  };
  const toggleSpell = (spell: SpellType) => {
    if (selectedSpells.includes(spell))
      setSelectedSpells(selectedSpells.filter((s) => s !== spell));
    else if (selectedSpells.length < 3)
      setSelectedSpells([...selectedSpells, spell]);
  };

  const drawMapRef = useRef<() => void>(() => {
    // Initialized by render below.
  });

  drawMapRef.current = () => {
    drawWorldMapCanvas({
      canvasRef,
      mapHeight,
      hoveredLevel,
      selectedLevel,
      levelStars,
      unlockedMaps,
      imageCache,
      lastCanvasSizeRef,
      animTimeRef,
    });
  };

  useEffect(() => {
    if (selectedLevel && !getLevelById(selectedLevel)) {
      setSelectedLevel(null);
    }
  }, [selectedLevel, getLevelById]);

  useEffect(() => {
    const dragState = dragRef.current;
    return () => {
      if (dragState.resetTimeoutId) {
        window.clearTimeout(dragState.resetTimeoutId);
      }
    };
  }, []);

  useEffect(() => {
    let animationId: number;
    let lastDrawTime = 0;
    let lastStateTime = 0;
    const animate = (timestamp: number) => {
      // Canvas drawing throttled to ~50fps (20ms)
      if (timestamp - lastDrawTime > 20) {
        animTimeRef.current = timestamp / 1000;
        lastDrawTime = timestamp;
        drawMapRef.current();
      }
      // React state update throttled (~10fps) for BattlefieldPreview.
      if (timestamp - lastStateTime > 20) {
        setAnimTime(timestamp / 1000);
        lastStateTime = timestamp;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate(0);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = mapHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let nextHoveredLevel: string | null = null;
    for (const level of WORLD_LEVELS) {
      const ly = getY(level.y);
      const distSq = (mouseX - level.x) ** 2 + (mouseY - ly) ** 2;
      if (distSq < 28 * 28) {
        nextHoveredLevel = level.id;
        break;
      }
    }
    setHoveredLevel((prev) => (prev === nextHoveredLevel ? prev : nextHoveredLevel));
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't process click if we were actually dragging (moved more than threshold)
    if (dragRef.current.hasDragged) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = mapHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    for (const level of WORLD_LEVELS) {
      const ly = getY(level.y);
      const distSq = (mouseX - level.x) ** 2 + (mouseY - ly) ** 2;
      if (distSq < 28 * 28) {
        handleLevelClick(level.id);
        return;
      }
    }
    setSelectedLevel(null);
  };

  // Drag-to-scroll handlers (mouse)
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    dragRef.current.hasDragged = false;
    dragRef.current.dragStartX = e.pageX - container.offsetLeft;
    dragRef.current.scrollStartLeft = container.scrollLeft;
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragRef.current.dragStartX) * 1.5; // Multiply for faster scrolling
    // Only consider it a drag if moved more than 5 pixels
    if (Math.abs(x - dragRef.current.dragStartX) > 5) {
      dragRef.current.hasDragged = true;
    }
    container.scrollLeft = dragRef.current.scrollStartLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragRef.current.resetTimeoutId) {
      window.clearTimeout(dragRef.current.resetTimeoutId);
    }
    // Reset drag marker after a short delay to allow click handler to check it.
    dragRef.current.resetTimeoutId = window.setTimeout(() => {
      dragRef.current.hasDragged = false;
      dragRef.current.resetTimeoutId = undefined;
    }, 50);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;
    setIsDragging(true);
    dragRef.current.hasDragged = false;
    dragRef.current.dragStartX = e.touches[0].pageX - container.offsetLeft;
    dragRef.current.scrollStartLeft = container.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - dragRef.current.dragStartX) * 1.5;
    if (Math.abs(x - dragRef.current.dragStartX) > 5) {
      dragRef.current.hasDragged = true;
    }
    container.scrollLeft = dragRef.current.scrollStartLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragRef.current.resetTimeoutId) {
      window.clearTimeout(dragRef.current.resetTimeoutId);
    }
    dragRef.current.resetTimeoutId = window.setTimeout(() => {
      dragRef.current.hasDragged = false;
      dragRef.current.resetTimeoutId = undefined;
    }, 50);
  };

  const canStart = selectedLevel && selectedHero && selectedSpells.length === 3;
  const currentLevel = selectedLevel ? getLevelById(selectedLevel) : null;
  const isCurrentCustomLevel = Boolean(currentLevel?.isCustom);
  const waveCount = selectedLevel ? getWaveCount(selectedLevel) : 0;
  const currentLevelPreviewImage = currentLevel
    ? LEVEL_DATA[currentLevel.id]?.previewImage
    : undefined;

  function goToNextLevel() {
    // If no level is selected, go to level 1
    if (!currentLevel || isCurrentCustomLevel) {
      handleLevelClick(WORLD_LEVELS[0].id);
      return;
    }
    const unlockedLevels = WORLD_LEVELS.filter((lvl) =>
      isLevelUnlocked(lvl.id)
    ).map((lvl) => lvl.id);
    const currentIndex = unlockedLevels.indexOf(currentLevel.id);
    if (currentIndex === unlockedLevels.length - 1) {
      const firstLevelId = unlockedLevels[0];
      handleLevelClick(firstLevelId);
      return;
    }
    if (currentIndex < unlockedLevels.length - 1) {
      const nextLevelId = unlockedLevels[currentIndex + 1];
      handleLevelClick(nextLevelId);
    }
  }
  function goToPreviousLevel() {
    // If no level is selected, go to level 1
    if (!currentLevel || isCurrentCustomLevel) {
      handleLevelClick(WORLD_LEVELS[0].id);
      return;
    }
    if (currentLevel.id === WORLD_LEVELS[0].id) {
      const unlockedLevels = WORLD_LEVELS.filter((lvl) =>
        isLevelUnlocked(lvl.id)
      ).map((lvl) => lvl.id);
      const lastLevelId = unlockedLevels[unlockedLevels.length - 1];
      handleLevelClick(lastLevelId);
      return;
    }
    const unlockedLevels = WORLD_LEVELS.filter((lvl) =>
      isLevelUnlocked(lvl.id)
    ).map((lvl) => lvl.id);
    const currentIndex = unlockedLevels.indexOf(currentLevel.id);
    if (currentIndex > 0) {
      const prevLevelId = unlockedLevels[currentIndex - 1];
      handleLevelClick(prevLevelId);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col text-amber-100 overflow-hidden" style={{ background: `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)`, borderRight: `2px solid ${GOLD.border30}` }}
    >
      {/* TOP BAR */}
      <OrnateFrame
        className="flex-shrink-0 overflow-hidden rounded-xl mx-2 sm:mx-3 mt-3 border-2 border-amber-700/50 shadow-xl"
        cornerSize={25}
        showBorders={true}
        showSideBorders={true}
        showTopBottomBorders={false}
      >
        <div
          className="relative sm:px-1 z-20"
          style={{
            background: panelGradient,
          }}
        >
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-0 right-0 h-px opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)` }} />

          <div className="px-3 sm:px-5 py-2 flex items-center justify-between gap-2">
            {/* Left: Logo */}
            <PrincetonLogo />

            {/* Right: Stats strip */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Hearts stat */}
              <div className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl" style={{
                background: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
                border: `1.5px solid ${RED_CARD.border}`,
                boxShadow: `inset 0 0 12px ${RED_CARD.glow06}`,
              }}>
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder12}` }} />
                <Heart size={15} className="text-red-400 fill-red-400 shrink-0" />
                <span className="font-black text-sm text-red-300">
                  {levelStats
                    ? Object.values(levelStats).reduce(
                      (acc, stats) => acc + (stats.bestHearts || 0),
                      0
                    )
                    : 0}
                </span>
                <span className="hidden sm:inline text-[9px] text-red-700 font-semibold">/300</span>
              </div>

              {/* Stars stat */}
              <div className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl" style={{
                background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                border: `1.5px solid ${AMBER_CARD.border}`,
                boxShadow: `inset 0 0 12px ${AMBER_CARD.glow}`,
              }}>
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
                <Star size={15} className="text-yellow-400 fill-yellow-400 shrink-0" />
                <span className="font-black text-sm text-yellow-300">{totalStars}</span>
                <span className="hidden sm:inline text-[9px] text-yellow-700 font-semibold">/{maxStars}</span>
              </div>

              {/* Total Battles */}
              <div className="hidden md:flex relative items-center gap-2 px-3 sm:px-4 py-2 rounded-xl" style={{
                background: `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`,
                border: `1.5px solid ${BLUE_CARD.border}`,
                boxShadow: `inset 0 0 12px ${BLUE_CARD.glow}`,
              }}>
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${BLUE_CARD.innerBorder}` }} />
                <Swords size={14} className="text-blue-400/70 shrink-0" />
                <span className="font-black text-sm text-blue-300/80">
                  {levelStats
                    ? Object.values(levelStats).reduce(
                      (acc, stats) => acc + (stats.timesPlayed || 0),
                      0
                    )
                    : 0}
                </span>
                <span className="text-[8px] text-blue-500/50 font-bold tracking-wider uppercase">Battles</span>
              </div>

              {/* Victories */}
              <div className="hidden lg:flex relative items-center gap-2 px-3 sm:px-4 py-2 rounded-xl" style={{
                background: `linear-gradient(135deg, ${GREEN_CARD.bgLight}, ${GREEN_CARD.bgDark})`,
                border: `1.5px solid ${GREEN_CARD.border}`,
                boxShadow: `inset 0 0 12px ${GREEN_CARD.glow}`,
              }}>
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GREEN_CARD.innerBorder}` }} />
                <Trophy size={14} className="text-emerald-400/70 shrink-0" />
                <span className="font-black text-sm text-emerald-300/80">
                  {levelStats
                    ? Object.values(levelStats).reduce(
                      (acc, stats) => acc + (stats.timesWon || 0),
                      0
                    )
                    : 0}
                </span>
                <span className="text-[8px] text-emerald-600/50 font-bold tracking-wider uppercase">Wins</span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-7" style={{ background: `linear-gradient(180deg, transparent, ${GOLD.border35}, transparent)` }} />

              {/* Codex */}
              <button
                onClick={() => setShowCodex(true)}
                className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:brightness-110"
                style={{
                  background: `linear-gradient(135deg, ${PURPLE_CARD.bgLight}, ${PURPLE_CARD.bgDark})`,
                  border: `1.5px solid ${PURPLE_CARD.border}`,
                  boxShadow: `inset 0 0 12px ${PURPLE_CARD.glow}`,
                }}
              >
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${PURPLE_CARD.innerBorder}` }} />
                <Book size={15} className="text-purple-400/80 shrink-0" />
                <span className="hidden sm:inline text-sm text-purple-300/70 font-bold tracking-wider uppercase">Codex</span>
              </button>

              {/* Creator */}
              <button
                onClick={() => setShowCreator(true)}
                className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:brightness-110"
                style={{
                  background: `linear-gradient(135deg, rgba(120, 95, 20, 0.42), rgba(80, 60, 10, 0.42))`,
                  border: `1.5px solid ${GOLD.border35}`,
                  boxShadow: `inset 0 0 12px ${GOLD.glow04}`,
                }}
              >
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                <Hammer size={15} className="text-amber-300/90 shrink-0" />
                <span className="hidden sm:inline text-sm text-amber-200/90 font-bold tracking-wider uppercase">Creator</span>
              </button>

              {/* Nav arrows — grouped pill */}
              <div className="hidden sm:flex relative items-center rounded-xl overflow-hidden" style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${GOLD.border25}`,
                boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
              }}>
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                <button
                  onClick={() => goToPreviousLevel()}
                  className="relative z-10 px-2.5 py-2.5 flex items-center transition-colors duration-150 hover:bg-amber-700/20"
                >
                  <ChevronLeft size={16} className="text-amber-500/70" />
                </button>
                <div className="w-px h-5" style={{ background: "rgba(180,140,60,0.2)" }} />
                <button
                  onClick={() => goToNextLevel()}
                  className="relative z-10 px-2.5 py-2.5 flex items-center transition-colors duration-150 hover:bg-amber-700/20"
                >
                  <ChevronRight size={16} className="text-amber-500/70" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom gradient line */}
          <div className="h-px opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)` }} />
        </div>
      </OrnateFrame>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-y-hidden overflow-x-auto min-h-0">
        {/* LEFT SIDEBAR - Fixed height on mobile to prevent map from shifting */}
        <div className="h-[40vh] sm:h-auto sm:w-80 flex-shrink-0 flex flex-col overflow-hidden" style={{ background: `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)` }}>
          {selectedLevel && currentLevel ? (
            <div className="flex-1 flex flex-col h-full overflow-auto">
              <div className="flex-shrink-0 relative overflow-hidden">
                {/* Top gold divider line */}
                <div className="h-px" style={{ background: dividerGradient }} />
                <div className="relative p-4" style={{ borderBottom: `1px solid ${GOLD.border25}` }}>
                  {/* Inner glow border */}
                  <div className="absolute inset-[2px] rounded-sm pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />

                  {/* Level name + close button */}
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <MapPin size={20} className="text-amber-400 drop-shadow-lg" />
                        <div className="absolute inset-0 animate-ping opacity-30">
                          <MapPin size={20} className="text-amber-400" />
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-amber-100 drop-shadow-lg tracking-wide">
                        {currentLevel.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedLevel(null)}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ background: PANEL.bgWarmMid, border: `1px solid ${GOLD.border25}` }}
                    >
                      <X size={16} className="text-amber-400" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="hidden sm:block text-amber-400/80 text-sm italic mb-3 relative z-10">
                    &ldquo;{currentLevel.description}&rdquo;
                  </p>

                  {/* Difficulty + Waves + Stars row */}
                  <div className="flex items-center gap-2 sm:mb-3 relative z-10 flex-wrap">
                    {/* Difficulty card */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{
                      background: `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                      border: `1.5px solid ${NEUTRAL.border}`,
                      boxShadow: `inset 0 0 8px ${NEUTRAL.glow}`
                    }}>
                      <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${NEUTRAL.innerBorder}` }} />
                      <Skull size={14} className="text-amber-400" />
                      <div className="flex gap-1">
                        {[1, 2, 3].map((d) => (
                          <div
                            key={d}
                            className={`w-3 h-3 rounded-full transition-all ${d <= currentLevel.difficulty
                              ? `${currentLevel.difficulty === 1
                                ? "bg-green-500 shadow-green-500/50"
                                : currentLevel.difficulty === 2
                                  ? "bg-yellow-500 shadow-yellow-500/50"
                                  : "bg-red-500 shadow-red-500/50"
                              } shadow-lg`
                              : "bg-stone-700"
                              }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Waves card */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg relative" style={{
                      background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                      border: `1.5px solid ${AMBER_CARD.border}`,
                      boxShadow: `inset 0 0 8px ${AMBER_CARD.glow}`
                    }}>
                      <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
                      <Flag size={14} className="text-amber-300" />
                      <span className="text-amber-200 font-bold text-sm">
                        {waveCount} Waves
                      </span>
                    </div>

                    {/* Stars (mobile) */}
                    <div className="flex sm:hidden items-center gap-2 px-2.5 py-1.5 rounded-lg relative" style={{
                      background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                      border: `1.5px solid ${AMBER_CARD.border}`,
                      boxShadow: `inset 0 0 8px ${AMBER_CARD.glow}`
                    }}>
                      <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
                      <Trophy size={14} className="text-yellow-500" />
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            className={`transition-all ${(levelStars[currentLevel.id] || 0) >= s
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                              : "text-stone-600"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Best Stars (desktop) */}
                  <div className="hidden sm:flex items-center gap-3 p-2.5 rounded-lg relative" style={{
                    background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                    border: `1.5px solid ${AMBER_CARD.border}`,
                    boxShadow: `inset 0 0 10px ${AMBER_CARD.glow}`
                  }}>
                    <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
                    <Trophy size={18} className="text-yellow-500" />
                    <span className="text-amber-400 text-sm font-medium">Best:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          className={`transition-all ${(levelStars[currentLevel.id] || 0) >= s
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                            : "text-stone-600"
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stats cards (hearts + time) */}
                  {levelStats[currentLevel.id] && (
                    <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg relative" style={{
                        background: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
                        border: `1.5px solid ${RED_CARD.border}`,
                        boxShadow: `inset 0 0 10px ${RED_CARD.glow06}`
                      }}>
                        <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder12}` }} />
                        <Heart size={16} className="text-red-400 fill-red-400" />
                        <div className="text-sm text-red-200 font-mono font-bold">
                          {levelStats[currentLevel.id]?.bestHearts}/20
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-lg relative" style={{
                        background: `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`,
                        border: `1.5px solid ${BLUE_CARD.border}`,
                        boxShadow: `inset 0 0 10px ${BLUE_CARD.glow}`
                      }}>
                        <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid ${BLUE_CARD.innerBorder}` }} />
                        <Clock size={16} className="text-blue-400" />
                        <span className="text-blue-200 text-sm font-mono font-bold">
                          {levelStats[currentLevel.id]?.bestTime
                            ? `${Math.floor(
                              levelStats[currentLevel.id]!.bestTime! / 60
                            )}m ${levelStats[currentLevel.id]!.bestTime! % 60
                            }s`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 sm:flex-none p-2 sm:p-4 flex flex-col min-h-0" style={{ borderBottom: `1px solid ${GOLD.border25}` }}>
                <div className="hidden sm:flex items-center gap-2 mb-2">
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border25}, transparent)` }} />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Battlefield Preview</span>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25})` }} />
                </div>
                <div className="relative flex-1 sm:flex-none sm:aspect-video rounded-2xl overflow-hidden" style={{
                  background: PANEL.bgDeep,
                  border: `2px solid ${GOLD.border30}`,
                  boxShadow: `0 0 30px ${GOLD.glow07}, inset 0 0 15px ${OVERLAY.black40}`
                }}>
                  <div className="absolute inset-[3px] rounded-[14px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                  {currentLevelPreviewImage ? (
                    <Image
                      src={currentLevelPreviewImage}
                      alt={`${currentLevel.name} preview`}
                      fill
                      sizes="(max-width: 640px) 100vw, 520px"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : null}
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${currentLevelPreviewImage
                      ? "opacity-0"
                      : "opacity-100"
                      }`}
                  >
                    <div
                      className={`w-full h-full ${currentLevel.region === "grassland"
                        ? "bg-gradient-to-br from-green-900/80 via-green-800/60 to-amber-900/40"
                        : currentLevel.region === "swamp"
                          ? "bg-gradient-to-br from-emerald-900/80 via-teal-900/65 to-stone-900/45"
                          : currentLevel.region === "desert"
                            ? "bg-gradient-to-br from-amber-800/80 via-yellow-900/60 to-orange-900/40"
                            : currentLevel.region === "winter"
                              ? "bg-gradient-to-br from-blue-900/80 via-slate-700/60 to-cyan-900/40"
                              : "bg-gradient-to-br from-red-900/80 via-orange-900/60 to-stone-900/40"
                        } flex items-center justify-center`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {currentLevel.region === "grassland"
                            ? "🌲"
                            : currentLevel.region === "swamp"
                              ? "🦆"
                              : currentLevel.region === "desert"
                                ? "🏜️"
                                : currentLevel.region === "winter"
                                  ? "❄️"
                                  : "🌋"}
                        </div>
                        <span className="text-amber-400/60 text-xs font-medium tracking-wide">
                          Preview Coming
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{
                    background: PANEL.bgDark,
                    color: "rgb(252,211,77)",
                    border: `1px solid ${GOLD.border30}`,
                    boxShadow: `0 2px 6px ${OVERLAY.black40}`
                  }}>
                    {currentLevel.region}
                  </div>
                </div>
              </div>

              <div className="hidden sm:inline flex-1 p-4 overflow-y-auto">
                {/* Section title with decorative lines */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border25}, transparent)` }} />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Region Campaign</span>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25})` }} />
                </div>
                {(() => {
                  if (isCurrentCustomLevel) {
                    return (
                      <div className="space-y-2">
                        <div className="rounded-lg border border-amber-700/40 bg-amber-900/15 p-2.5">
                          <div className="text-xs uppercase tracking-widest text-amber-400/90 mb-1">
                            Custom Sandbox
                          </div>
                          <div className="text-xs text-amber-200/80 mb-2">
                            this map lives in your local creator sandbox. open creator to edit paths, landmarks, hazards, and objectives.
                          </div>
                          <button
                            onClick={() => setShowCreator(true)}
                            className="rounded-md border border-amber-600/60 bg-amber-700/20 px-2.5 py-1 text-xs hover:bg-amber-700/30"
                          >
                            Open Creator
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          {customLevels.map((level) => (
                            <button
                              key={level.id}
                              onClick={() => handleCustomLevelPlaytest(level.id)}
                              className="w-full text-left rounded-lg border border-amber-800/50 bg-stone-900/70 px-2.5 py-2 hover:bg-stone-800/80 transition-colors"
                            >
                              <div className="text-sm font-medium text-amber-100 truncate">
                                {level.name}
                              </div>
                              <div className="text-[11px] text-amber-400/70">
                                {level.theme} • diff {level.difficulty}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const regionLevels = WORLD_LEVELS.filter(
                    (l) => l.region === currentLevel.region
                  );
                  const regionStars = regionLevels.reduce(
                    (sum, l) => sum + (levelStars[l.id] || 0),
                    0
                  );
                  const maxRegionStars = regionLevels.length * 3;
                  return (
                    <div className="space-y-1.5">
                      {regionLevels.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer relative"
                          style={{
                            background: l.id === selectedLevel
                              ? `linear-gradient(135deg, ${SELECTED.warmBgLight}, ${SELECTED.warmBgDark})`
                              : `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                            border: l.id === selectedLevel
                              ? `1.5px solid ${GOLD.accentBorder40}`
                              : `1.5px solid ${GOLD.border25}`,
                            boxShadow: l.id === selectedLevel
                              ? `inset 0 0 10px ${GOLD.accentGlow08}`
                              : `inset 0 0 8px ${GOLD.glow04}`
                          }}
                          onClick={() => handleLevelClick(l.id)}
                        >
                          <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{
                            border: `1px solid ${l.id === selectedLevel ? GOLD.accentBorder15 : GOLD.innerBorder08}`
                          }} />
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg relative"
                            style={{
                              background: isLevelUnlocked(l.id) ? PANEL.bgDeep : NEUTRAL.bgDark,
                              border: `1px solid ${isLevelUnlocked(l.id) ? GOLD.border25 : NEUTRAL.border}`
                            }}
                          >
                            {isLevelUnlocked(l.id)
                              ? l.region === "grassland"
                                ? "🌲"
                                : l.region === "swamp"
                                  ? "🦆"
                                  : l.region === "desert"
                                    ? "🏜️"
                                    : l.region === "winter"
                                      ? "❄️"
                                      : "🌋"
                              : "🔒"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${l.id === selectedLevel ? "text-amber-100" : "text-amber-200/90"}`}>
                              {l.name}
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                className={
                                  (levelStars[l.id] || 0) >= s
                                    ? "text-yellow-400 fill-yellow-400 drop-shadow"
                                    : "text-stone-600"
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      {/* Region Progress footer */}
                      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${GOLD.border25}` }}>
                        <span className="text-amber-400 text-sm font-medium">
                          Region Progress:
                        </span>
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md" style={{
                          background: PANEL.bgWarmMid,
                          border: `1px solid ${GOLD.border25}`
                        }}>
                          <Star
                            size={14}
                            className="text-yellow-400 fill-yellow-400"
                          />
                          <span className="text-amber-200 font-bold text-sm">
                            {regionStars}/{maxRegionStars}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex-shrink-0 p-2 sm:p-4" style={{ borderTop: `1px solid ${GOLD.border25}`, background: `linear-gradient(180deg, transparent 0%, ${PANEL.bgDark} 100%)` }}>
                {/* Warning messages - show prominently when not ready */}
                {!canStart && (
                  <div className="mb-2 p-2 sm:p-3 rounded-xl relative" style={{
                    background: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
                    border: `1.5px solid ${RED_CARD.border25}`,
                    boxShadow: `inset 0 0 10px ${RED_CARD.glow06}`
                  }}>
                    <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder10}` }} />
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-orange-300 relative z-10">
                      <AlertTriangle size={16} className="text-orange-400 animate-pulse" />
                      {!selectedHero && !selectedSpells.length && (
                        <span>Select a Champion & 3 Spells</span>
                      )}
                      {!selectedHero && selectedSpells.length > 0 && (
                        <span>Select a Champion</span>
                      )}
                      {selectedHero && selectedSpells.length < 3 && (
                        <span>Select {3 - selectedSpells.length} more Spell{3 - selectedSpells.length > 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                )}
                <button
                  onClick={startGame}
                  disabled={!canStart}
                  className="w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all relative overflow-hidden group"
                  style={canStart ? {
                    background: `linear-gradient(135deg, rgba(170,120,20,0.95), rgba(140,90,15,0.95))`,
                    border: `2px solid ${GOLD.accentBorder50}`,
                    boxShadow: `0 0 20px ${GOLD.accentGlow10}, inset 0 0 15px ${GOLD.accentGlow08}`,
                    color: "#1a1000",
                  } : {
                    background: `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                    border: `1.5px solid ${NEUTRAL.border}`,
                    color: "rgb(120,113,108)",
                    cursor: "not-allowed"
                  }}
                >
                  {canStart && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.accentBorder15}` }} />
                    </>
                  )}
                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    <Swords size={20} className="sm:w-6 sm:h-6" />
                    <span className="tracking-wider">{canStart ? "BATTLE" : "Waiting..."}</span>
                    {canStart && <Play size={18} className="sm:w-5 sm:h-5" />}
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <BattlefieldPreview
              animTime={animTime}
              onSelectFarthestLevel={() => {
                // Find the farthest unlocked level
                const unlockedLevelsList = WORLD_LEVELS.filter(l => isLevelUnlocked(l.id));
                if (unlockedLevelsList.length > 0) {
                  const farthestLevel = unlockedLevelsList[unlockedLevelsList.length - 1];
                  handleLevelClick(farthestLevel.id);
                }
              }}
            />
          )}
        </div>
        {/* RIGHT: Map */}
        <div className="relative flex-1 flex flex-col min-w-0 pl-3 sm:pl-0 py-3 pr-3 overflow-x-auto" style={{ background: `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)` }}>
          <div className="z-20 sm:hidden absolute flex top-4 right-8  items-center gap-1 px-1.5 py-1.5 rounded-xl">
            <button
              onClick={() => goToPreviousLevel()}
              className="p-0.5 bg-amber-800/30 hover:bg-amber-800/70 rounded-lg border border-amber-700/50 transition-colors text-amber-400 hover:text-amber-200"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goToNextLevel()}
              className="p-0.5 bg-amber-800/30 hover:bg-amber-800/70 rounded-lg border border-amber-700/50 transition-colors text-amber-400 hover:text-amber-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <OrnateFrame
            className="flex-1 relative bg-gradient-to-br from-stone-900 to-stone-950 rounded-2xl border-2 border-amber-600/50 sm:overflow-hidden shadow-2xl min-h-0"
            cornerSize={28}
            showBorders={true}
          >
            <div
              ref={containerRef}
              className="absolute inset-0"
            >
              <div
                ref={scrollContainerRef}
                className="absolute h-full inset-0 overflow-x-auto overflow-y-hidden z-10"
                style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'pan-y', background: '#0a0806' }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <canvas
                  ref={canvasRef}
                  className="block mx-auto"
                  style={{ minWidth: `${MAP_WIDTH}px`, height: "100%", cursor: isDragging ? 'grabbing' : 'grab' }}
                  onMouseMove={handleMouseMove}
                  onClick={handleClick}
                />
              </div>

              {/* HERO & SPELL SELECTION OVERLAY */}
              <div className="absolute w-full flex bottom-0 left-0 right-0 p-1.5 sm:p-3 pointer-events-none h-full overflow-x-auto z-20" style={{
                background: `linear-gradient(180deg, transparent 0%, transparent 40%, rgba(18,12,6,0.4) 65%, rgba(18,12,6,0.92) 85%, rgba(18,12,6,0.98) 100%)`
              }}>
                <div className="flex w-full mt-auto gap-1.5 sm:gap-3 pointer-events-auto items-stretch">
                  {/* --- War is Coming Panel --- */}
                  <div className="hidden sm:flex sm:flex-col w-44 flex-shrink-0 relative rounded-xl"
                    style={{
                      background: 'linear-gradient(180deg, rgba(41,32,20,0.97) 0%, rgba(28,22,15,0.99) 100%)',
                      border: '1.5px solid rgba(180,140,60,0.45)',
                      boxShadow: 'inset 0 0 20px rgba(180,140,60,0.06), 0 4px 24px rgba(0,0,0,0.5)',
                    }}>
                    {/* Inner border glow */}
                    <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(180,140,60,0.12)' }} />
                    {/* Header */}
                    <div className="px-3 py-2 relative"
                      style={{ background: 'linear-gradient(90deg, rgba(180,130,40,0.2), rgba(120,80,20,0.1), transparent)' }}>
                      <div className="flex items-center gap-2">
                        <Crown size={13} className="text-amber-500" />
                        <span className="text-[9px] font-bold text-amber-400/90 tracking-[0.2em] uppercase">
                          War is Coming
                        </span>
                      </div>
                      {/* Ornate divider */}
                      <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,140,60,0.4) 20%, rgba(255,200,80,0.5) 50%, rgba(180,140,60,0.4) 80%, transparent)' }} />
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] text-amber-200/60 leading-relaxed italic">
                          &ldquo;The shadows gather at the gates. Ancient towers
                          stand resolute, their arcane fires burning eternal
                          against the darkness.&rdquo;
                        </p>
                        <div className="my-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,140,60,0.25), transparent)' }} />
                        <p className="text-[8px] text-stone-400/70 leading-relaxed">
                          Choose your champion and ready your spells. The horde approaches.
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                        style={{
                          background: 'linear-gradient(135deg, rgba(120,80,20,0.2), rgba(80,50,10,0.15))',
                          border: '1px solid rgba(180,140,60,0.2)',
                          boxShadow: 'inset 0 1px 0 rgba(255,200,80,0.05)',
                        }}>
                        <Swords size={11} className="text-amber-500/80" />
                        <span className="text-[9px] font-semibold text-amber-400/80 tracking-wider uppercase">Defend the Realm</span>
                      </div>
                    </div>
                  </div>
                  {/* --- Hero Panel --- */}
                  <HeroSelector
                    selectedHero={selectedHero}
                    setSelectedHero={setSelectedHero}
                    hoveredHero={hoveredHero}
                    setHoveredHero={setHoveredHero}
                  />

                  {/* --- Spell Panel --- */}
                  <SpellSelector
                    selectedSpells={selectedSpells}
                    toggleSpell={toggleSpell}
                    hoveredSpell={hoveredSpell}
                    setHoveredSpell={setHoveredSpell}
                  />
                </div>
              </div>
            </div>
          </OrnateFrame>
        </div>
      </div>

      {showCodex && <CodexModal onClose={() => setShowCodex(false)} />}
      {showCreator && (
        <CustomLevelCreatorModal
          isOpen={showCreator}
          onClose={() => setShowCreator(false)}
          customLevels={customLevels}
          onSaveLevel={onSaveCustomLevel}
          onDeleteLevel={onDeleteCustomLevel}
          onPlayLevel={handleCustomLevelPlaytest}
        />
      )}
    </div >
  );
};

export default WorldMap;
