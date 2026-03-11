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
  Eye,
  BarChart3,
  ChessRook,
  Map as MapIcon,
  Sparkles,
  ChessKnight,
  Settings,
  Maximize,
  Minimize,
} from "lucide-react";
import type {
  GameState,
  LevelStars,
  HeroType,
  SpellType,
  SpellUpgradeLevels,
} from "../../types";
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
import { PANEL, GOLD, AMBER_CARD, RED_CARD, BLUE_CARD, GREEN_CARD, NEUTRAL, DIVIDER, SELECTED, OVERLAY, panelGradient, dividerGradient } from "../ui/theme";
import { WORLD_LEVELS, MAP_WIDTH, getWaveCount, DEV_LEVELS, DEV_LEVEL_IDS } from "./worldMapData";
import { CodexModal, type CodexTabId } from "./CodexModal";
import { CampaignOverview } from "./CampaignOverview";
import { BattlefieldPreview } from "./BattlefieldPreview";
import { RegionIcon } from "../../sprites";
import { HeroSelector } from "./HeroSelector";
import { SpellSelector } from "./SpellSelector";
import { MobileLoadoutBar } from "./MobileLoadoutBar";
import { CreatorModal } from "../creator";
import { drawWorldMapCanvas } from "./worldMapCanvasRenderer";
import { getWorldLevelById, getWorldMapY } from "./worldMapUtils";
import { SettingsModal } from "./SettingsModal";
import { useSettings } from "../../hooks/useSettings";
import { CreditsModal } from "./CreditsModal";
import { NavMoreDropdown } from "./NavMoreDropdown";

const REGION_ORDER = ["grassland", "swamp", "desert", "winter", "volcanic"] as const;

// =============================================================================
// LOGO COMPONENT
// =============================================================================

const PrincetonLogo: React.FC = () => {
  return (
    <div className="relative flex items-center gap-1 sm:gap-2">
      <div className="absolute -inset-4 blur-2xl opacity-60">
        <div
          className="absolute inset-0 bg-gradient-to-r from-orange-600/40 via-amber-400/50 to-orange-600/40 animate-pulse"
        />
      </div>
      <PrincetonTDLogo size="h-9 w-9 sm:h-11 sm:w-11" />
      <div className="relative flex flex-col -mt-1">
        <span
          className="text-lg sm:text-2xl font-black tracking-wider"
          style={{
            background:
              "linear-gradient(180deg, #fcd34d 0%, #f59e0b 40%, #d97706 70%, #92400e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          PRINCETON
        </span>
        <div className="flex items-center gap-1 sm:gap-2 -mt-1">
          <Swords size={14} className="text-orange-400 size-2 sm:size-auto block" />
          <span className="text-[7px] text-nowrap sm:text-[8.5px] font-bold tracking-[0.3em] text-amber-500/90">
            TOWER DEFENSE
          </span>
          <Swords
            size={14}
            className="text-orange-400 size-2 sm:size-auto block"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
      </div>

      <div className="z-[-1] object-bottom object-contain absolute top-[-4.1rem] right-[-26rem] pointer-events-none select-none">
        <Image
          src="/images/new/gameplay_volcano.png"
          alt="Battle Scene"
          width={1200}
          height={700}
          priority
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
  availableSpellStars: number;
  totalSpellStarsEarned: number;
  spentSpellStars: number;
  spellUpgradeLevels: SpellUpgradeLevels;
  upgradeSpell: (spellType: SpellType) => void;
  gameState: GameState;
  /** When Battle is clicked without hero/spells selected, run this to pick random loadout and start */
  onStartWithRandomLoadout?: () => void;
  isDevMode?: boolean;
  onDevModeChange?: (enabled: boolean) => void;
}

type SelectableLevel = {
  id: string;
  name: string;
  description: string;
  region: (typeof WORLD_LEVELS)[number]["region"];
  difficulty: 1 | 2 | 3;
  kind?: "campaign" | "challenge" | "custom";
  tags: string[];
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
  availableSpellStars,
  totalSpellStarsEarned,
  spentSpellStars,
  spellUpgradeLevels,
  upgradeSpell,
  onStartWithRandomLoadout,
  isDevMode,
  onDevModeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [showCodex, setShowCodex] = useState(false);
  const [codexTab, setCodexTab] = useState<CodexTabId>("towers");
  const [showCreator, setShowCreator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { settings, updateCategory, applyPreset, resetToDefaults, resetCategory } = useSettings();
  const [showBattlefieldPreview, setShowBattlefieldPreview] = useState<boolean | null>(null);
  const [animTime, setAnimTime] = useState(0);
  const animTimeRef = useRef(0);
  const [mapHeight, setMapHeight] = useState(500);
  const [containerWidth, setContainerWidth] = useState(MAP_WIDTH);
  const [hoveredHero, setHoveredHero] = useState<HeroType | null>(null);
  const [hoveredSpell, setHoveredSpell] = useState<SpellType | null>(null);
  const [isMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const lastCanvasSizeRef = useRef({ w: 0, h: 0 });
  const staticBgCacheRef = useRef<{
    canvas: HTMLCanvasElement | null;
    w: number;
    h: number;
  }>({ canvas: null, w: 0, h: 0 });
  const dragRef = useRef({
    hasDragged: false,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    scrollStartLeft: 0,
    scrollStartTop: 0,
    resetTimeoutId: 0 as number | undefined,
  });

  // Drag cursor style — only the cursor visual needs React state; all other
  // drag logic reads from `dragRef.current.isDragging` to avoid re-renders on
  // every mouse-move.
  const [dragCursor, setDragCursor] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const panelH = bottomPanelRef.current?.offsetHeight ?? 0;
      const overlayPad = 24;
      const scale = Math.max(1.0, Math.min(1.5, cw / MAP_WIDTH));
      const minMapH = MAP_WIDTH * 0.29;
      const desiredMapH = (ch - panelH - overlayPad) / scale;
      setContainerWidth(cw);
      setMapHeight(Math.max(minMapH, desiredMapH));
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    const panelEl = bottomPanelRef.current;
    let ro: ResizeObserver | undefined;
    if (panelEl) {
      ro = new ResizeObserver(updateDimensions);
      ro.observe(panelEl);
    }
    return () => {
      window.removeEventListener("resize", updateDimensions);
      ro?.disconnect();
    };
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
  const visibleWorldLevels = useMemo(
    () => (isDevMode ? [...WORLD_LEVELS, ...DEV_LEVELS] : WORLD_LEVELS),
    [isDevMode]
  );
  const isLevelUnlocked = useCallback(
    (levelId: string) =>
      isCustomLevel(levelId) ||
      unlockedMapSet.has(levelId) ||
      (isDevMode === true && DEV_LEVEL_IDS.has(levelId)),
    [isCustomLevel, unlockedMapSet, isDevMode]
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
        kind: "custom",
        tags: ["Custom"],
        isCustom: true,
      };
    },
    [customLevelById]
  );
  const mapScale = Math.max(1.0, Math.min(1.5, containerWidth / MAP_WIDTH));
  const displayW = Math.round(MAP_WIDTH * mapScale);
  const displayH = Math.round(mapHeight * mapScale);

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

  const drawMapRef = useRef<() => void>(() => { });

  drawMapRef.current = () => {
    drawWorldMapCanvas({
      canvasRef,
      mapHeight,
      containerWidth,
      hoveredLevel,
      selectedLevel,
      levelStars,
      unlockedMaps,
      imageCache,
      lastCanvasSizeRef,
      animTimeRef,
      levels: visibleWorldLevels,
      isMobile,
      staticBgCache: staticBgCacheRef,
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

  // Track whether the preview overlay needs animTime state updates.
  // Reading a ref inside rAF avoids coupling the effect to React state.
  // (assigned after showPreview is derived, below)
  const showPreviewRef = useRef(false);

  useEffect(() => {
    let animationId: number;
    let lastDrawTime = 0;
    let lastPreviewTime = 0;
    const frameInterval = isMobile ? 33 : 20; // 30fps mobile, 50fps desktop

    const animate = (timestamp: number) => {
      if (timestamp - lastDrawTime > frameInterval) {
        animTimeRef.current = timestamp / 1000;
        lastDrawTime = timestamp;
        drawMapRef.current();
      }

      // React state for BattlefieldPreview (~10fps)
      if (showPreviewRef.current && timestamp - lastPreviewTime > 100) {
        setAnimTime(timestamp / 1000);
        lastPreviewTime = timestamp;
      }

      animationId = requestAnimationFrame(animate);
    };
    animate(0);
    return () => cancelAnimationFrame(animationId);
  }, [isMobile]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = mapHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let nextHoveredLevel: string | null = null;
    for (const level of visibleWorldLevels) {
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

    for (const level of visibleWorldLevels) {
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
    dragRef.current.isDragging = true;
    dragRef.current.hasDragged = false;
    dragRef.current.dragStartX = e.pageX - container.offsetLeft;
    dragRef.current.dragStartY = e.pageY - container.offsetTop;
    dragRef.current.scrollStartLeft = container.scrollLeft;
    dragRef.current.scrollStartTop = container.scrollTop;
    setDragCursor(true);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = (x - dragRef.current.dragStartX) * 1.5;
    const walkY = (y - dragRef.current.dragStartY) * 1.5;
    if (Math.abs(x - dragRef.current.dragStartX) > 5 || Math.abs(y - dragRef.current.dragStartY) > 5) {
      dragRef.current.hasDragged = true;
    }
    container.scrollLeft = dragRef.current.scrollStartLeft - walkX;
    container.scrollTop = dragRef.current.scrollStartTop - walkY;
  };

  const handleDragEnd = () => {
    dragRef.current.isDragging = false;
    setDragCursor(false);
    if (dragRef.current.resetTimeoutId) {
      window.clearTimeout(dragRef.current.resetTimeoutId);
    }
    dragRef.current.resetTimeoutId = window.setTimeout(() => {
      dragRef.current.hasDragged = false;
      dragRef.current.resetTimeoutId = undefined;
    }, 50);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;
    dragRef.current.isDragging = true;
    dragRef.current.hasDragged = false;
    dragRef.current.dragStartX = e.touches[0].pageX - container.offsetLeft;
    dragRef.current.dragStartY = e.touches[0].pageY - container.offsetTop;
    dragRef.current.scrollStartLeft = container.scrollLeft;
    dragRef.current.scrollStartTop = container.scrollTop;
    setDragCursor(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const y = e.touches[0].pageY - container.offsetTop;
    const walkX = (x - dragRef.current.dragStartX) * 1.5;
    const walkY = (y - dragRef.current.dragStartY) * 1.5;
    if (Math.abs(x - dragRef.current.dragStartX) > 5 || Math.abs(y - dragRef.current.dragStartY) > 5) {
      dragRef.current.hasDragged = true;
    }
    container.scrollLeft = dragRef.current.scrollStartLeft - walkX;
    container.scrollTop = dragRef.current.scrollStartTop - walkY;
  };

  const handleTouchEnd = () => {
    dragRef.current.isDragging = false;
    setDragCursor(false);
    if (dragRef.current.resetTimeoutId) {
      window.clearTimeout(dragRef.current.resetTimeoutId);
    }
    dragRef.current.resetTimeoutId = window.setTimeout(() => {
      dragRef.current.hasDragged = false;
      dragRef.current.resetTimeoutId = undefined;
    }, 50);
  };

  const openCodexTo = useCallback((tab: CodexTabId) => {
    setCodexTab(tab);
    setShowCodex(true);
  }, []);

  const hasBattles = useMemo(
    () => Object.values(levelStats).some((s) => (s.timesPlayed || 0) > 0),
    [levelStats]
  );

  // Wait for localStorage hydration before trusting hasBattles.
  // useLocalStorage initialises with DEFAULT (levelStats: {}) and hydrates
  // via an effect, so hasBattles is unreliable on the very first render.
  // The ref flips to true inside the same micro-task as the hydration effect,
  // meaning the next render that has real data will also see postHydration=true.
  const postHydrationRef = useRef(false);
  useEffect(() => { postHydrationRef.current = true; }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const showPreview = !selectedLevel && (
    showBattlefieldPreview !== null
      ? showBattlefieldPreview
      : postHydrationRef.current && !hasBattles
  );
  showPreviewRef.current = showPreview;

  const canStart = selectedLevel && selectedHero && selectedSpells.length === 3;
  const currentLevel = selectedLevel ? getLevelById(selectedLevel) : null;
  const isCurrentCustomLevel = Boolean(currentLevel?.isCustom);
  const isCurrentChallengeLevel =
    Boolean(currentLevel?.kind === "challenge") && !isCurrentCustomLevel;
  const challengeBadgeStyle: React.CSSProperties =
    currentLevel?.region === "grassland"
      ? {
        background:
          "linear-gradient(135deg, rgba(41,110,59,0.9), rgba(22,68,36,0.95))",
        border: "1px solid rgba(160,242,168,0.55)",
        color: "rgb(230,255,218)",
      }
      : currentLevel?.region === "swamp"
        ? {
          background:
            "linear-gradient(135deg, rgba(28,98,94,0.9), rgba(12,60,58,0.95))",
          border: "1px solid rgba(146,232,217,0.55)",
          color: "rgb(224,255,248)",
        }
        : currentLevel?.region === "desert"
          ? {
            background:
              "linear-gradient(135deg, rgba(133,99,41,0.9), rgba(84,56,21,0.95))",
            border: "1px solid rgba(255,216,132,0.55)",
            color: "rgb(255,242,206)",
          }
          : currentLevel?.region === "winter"
            ? {
              background:
                "linear-gradient(135deg, rgba(47,87,129,0.9), rgba(28,56,92,0.95))",
              border: "1px solid rgba(169,213,255,0.55)",
              color: "rgb(231,246,255)",
            }
            : {
              background:
                "linear-gradient(135deg, rgba(145,38,20,0.9), rgba(90,18,10,0.95))",
              border: "1px solid rgba(255,170,90,0.55)",
              color: "rgb(255,225,170)",
            };
  const waveCount = selectedLevel ? getWaveCount(selectedLevel) : 0;
  const currentLevelPreviewImage = currentLevel
    ? LEVEL_DATA[currentLevel.id]?.previewImage
    : undefined;
  const fallbackPreviewImage = currentLevel && !currentLevelPreviewImage
    ? visibleWorldLevels
      .filter(l => l.region === currentLevel.region)
      .map(l => LEVEL_DATA[l.id]?.previewImage)
      .find(Boolean) ?? LEVEL_DATA.poe?.previewImage
    : undefined;

  function goToNextLevel() {
    // If no level is selected, go to level 1
    if (!currentLevel || isCurrentCustomLevel) {
      handleLevelClick(visibleWorldLevels[0].id);
      return;
    }
    const unlockedLevels = visibleWorldLevels.filter((lvl) =>
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
      handleLevelClick(visibleWorldLevels[0].id);
      return;
    }
    if (currentLevel.id === visibleWorldLevels[0].id) {
      const unlockedLevels = visibleWorldLevels.filter((lvl) =>
        isLevelUnlocked(lvl.id)
      ).map((lvl) => lvl.id);
      const lastLevelId = unlockedLevels[unlockedLevels.length - 1];
      handleLevelClick(lastLevelId);
      return;
    }
    const unlockedLevels = visibleWorldLevels.filter((lvl) =>
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
        className="flex-shrink-0 overflow-hidden rounded-xl mx-1.5 sm:mx-3 mt-1.5 sm:mt-3 border-2 border-amber-700/50 shadow-xl"
        cornerSize={25}
        showBorders={true}
        showSideBorders={true}
        showTopBottomBorders={false}
      >
        <div
          className="relative sm:px-1 z-20 overflow-hidden"
          style={{
            background: panelGradient,
          }}
        >
          {/* Right-side background image */}
          <div className="absolute top-[-2rem] right-0 w-[28rem] h-[calc(100%+4rem)] pointer-events-none select-none z-0">
            <Image
              src="/images/new/gameplay_winter.png"
              alt=""
              width={1200}
              height={700}
              priority
              className="w-full h-full object-cover opacity-15 scale-110"
              style={{
                maskImage: "linear-gradient(to left, black 0%, black 30%, transparent 80%)",
                WebkitMaskImage: "linear-gradient(to left, black 0%, black 30%, transparent 80%)",
              }}
            />
          </div>

          <div className="absolute top-0 left-0 right-0 h-px opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)` }} />

          <div className="relative px-4 sm:pl-3 sm:pr-5 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 z-10">
            {/* Left: Logo + Stars badge */}
            <div className="flex items-center gap-2 sm:gap-4">
              <PrincetonLogo />

              <div className="hidden sm:block w-px h-8 opacity-60" style={{ background: `linear-gradient(180deg, transparent, ${GOLD.border35}, transparent)` }} />

              {/* Stars badge - desktop */}
              <div className="hidden sm:flex relative items-center gap-2 px-4 py-1.5 rounded-xl" style={{
                background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                border: `1.5px solid ${AMBER_CARD.border}`,
                boxShadow: `inset 0 0 12px ${AMBER_CARD.glow}, 0 0 10px rgba(180,140,50,0.08)`,
              }}>
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
                <Star size={15} className="text-yellow-400 fill-yellow-400 shrink-0" />
                <span className="font-black text-sm text-yellow-300">{totalStars}</span>
                <span className="text-[9px] text-yellow-700 font-semibold">/{maxStars}</span>
              </div>


            </div>

            {/* Center: Navigation buttons in a unified pill group */}
            <div className="flex items-center">
              <div className="relative flex items-center rounded-xl overflow-hidden" style={{
                background: `linear-gradient(180deg, rgba(55,38,20,0.85), rgba(38,26,14,0.85))`,
                border: `1.5px solid ${GOLD.border30}`,
                boxShadow: `inset 0 1px 0 ${OVERLAY.white06}, inset 0 0 16px ${GOLD.glow04}`,
              }}>
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />

                <button
                  onClick={() => openCodexTo("towers")}
                  className="relative z-10 flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-150 hover:bg-amber-600/15"
                >
                  <Book size={14} className="text-amber-400 shrink-0" />
                  <span className="hidden sm:inline text-xs text-amber-200/80 font-bold tracking-wider uppercase">Codex</span>
                </button>

                <div className="w-px h-4 sm:h-5 shrink-0" style={{ background: `rgba(180,140,60,0.18)` }} />

                <button
                  onClick={() => setShowCreator(true)}
                  className="relative z-10 flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-150 hover:bg-amber-600/15"
                >
                  <Hammer size={14} className="text-amber-400 shrink-0" />
                  <span className="hidden sm:inline text-xs text-amber-200/80 font-bold tracking-wider uppercase">Creator</span>
                </button>

                <div className="w-px h-4 sm:h-5 shrink-0" style={{ background: `rgba(180,140,60,0.18)` }} />

                <button
                  onClick={() => setShowSettings(true)}
                  className="relative z-10 flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-150 hover:bg-amber-600/15"
                >
                  <Settings size={14} className="text-amber-400 shrink-0" />
                  <span className="hidden sm:inline text-xs text-amber-200/80 font-bold tracking-wider uppercase">Settings</span>
                </button>
              </div>
            </div>

            {/* Right: Fullscreen + More dropdown + Nav arrows */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Fullscreen toggle */}
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    document.documentElement.requestFullscreen();
                  }
                }}
                className="hidden sm:flex relative items-center px-3 py-2 rounded-xl transition-all duration-150 hover:bg-amber-600/15"
                style={{
                  background: `linear-gradient(180deg, rgba(55,38,20,0.85), rgba(38,26,14,0.85))`,
                  border: `1.5px solid ${GOLD.border30}`,
                  boxShadow: `inset 0 1px 0 ${OVERLAY.white06}, inset 0 0 16px ${GOLD.glow04}`,
                }}
                title="Toggle Fullscreen"
              >
                {isFullscreen
                  ? <Minimize size={15} className="text-amber-300/70 shrink-0" />
                  : <Maximize size={15} className="text-amber-300/70 shrink-0" />}
              </button>

              {/* More dropdown (portal-based, no overflow clipping) */}
              <NavMoreDropdown onShowCredits={() => setShowCredits(true)} />

              {/* Nav arrows */}
              <div className="hidden sm:flex relative items-center rounded-xl overflow-hidden" style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1.5px solid ${GOLD.border25}`,
                boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
              }}>
                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                <button
                  onClick={() => goToPreviousLevel()}
                  className="relative z-10 px-3 py-2 flex items-center transition-colors duration-150 hover:bg-amber-700/20"
                >
                  <ChevronLeft size={16} className="text-amber-500/70" />
                </button>
                <div className="w-px h-5" style={{ background: "rgba(180,140,60,0.2)" }} />
                <button
                  onClick={() => goToNextLevel()}
                  className="relative z-10 px-3 py-2 flex items-center transition-colors duration-150 hover:bg-amber-700/20"
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
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">

        {/* MOBILE: Campaign / Level detail panel above map */}
        <div className="sm:hidden h-[28vh] flex-shrink-0 flex flex-col overflow-hidden px-1.5 pt-1 pb-0.5" style={{ background: `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)` }}>
          <div className="flex-1 flex flex-col overflow-hidden rounded-lg relative" style={{ background: panelGradient, border: `1.5px solid ${GOLD.border25}`, boxShadow: `inset 0 0 12px ${GOLD.glow04}` }}>
            <div className="absolute inset-[2px] rounded-[6px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
            {selectedLevel && currentLevel ? (() => {
              const previewImg = LEVEL_DATA[currentLevel.id]?.previewImage ?? fallbackPreviewImage;
              return (
                <div className="flex-1 flex flex-col overflow-hidden relative">
                  {previewImg && (
                    <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                      <Image src={previewImg} alt="" fill unoptimized className={`absolute right-0 top-0 !h-full !w-[60%] !left-auto object-cover ${LEVEL_DATA[currentLevel.id]?.previewImage ? "opacity-25" : "opacity-40 blur-[1px]"}`} style={{ maskImage: "linear-gradient(to right, transparent 0%, black 40%, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 40%, black 70%, transparent 100%)" }} />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${PANEL.bgDark} 35%, transparent 75%)` }} />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col overflow-auto p-2 pb-1 relative z-10 min-h-0">
                    {/* Row 1: Icon + Name + nav + close */}
                    <div className="flex items-center gap-2 mb-1">
                      <RegionIcon type={currentLevel.region} size={22} framed challenge={isCurrentChallengeLevel} />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-amber-100 truncate">{currentLevel.name}</h2>
                        <p className="text-[9px] text-amber-400/60 italic truncate leading-tight">&ldquo;{currentLevel.description}&rdquo;</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => goToPreviousLevel()} className="p-0.5 rounded border transition-colors" style={{ background: PANEL.bgWarmMid, borderColor: GOLD.border25 }}>
                          <ChevronLeft size={14} className="text-amber-400" />
                        </button>
                        <button onClick={() => goToNextLevel()} className="p-0.5 rounded border transition-colors" style={{ background: PANEL.bgWarmMid, borderColor: GOLD.border25 }}>
                          <ChevronRight size={14} className="text-amber-400" />
                        </button>
                        <button onClick={() => setSelectedLevel(null)} className="p-0.5 rounded border transition-colors ml-0.5" style={{ background: PANEL.bgWarmMid, borderColor: GOLD.border25 }}>
                          <X size={14} className="text-amber-400" />
                        </button>
                      </div>
                    </div>
                    {/* Row 2: Tags + difficulty + waves */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {isCurrentChallengeLevel && (
                        <span className="text-[8px] font-bold px-1.5 py-px rounded tracking-wider uppercase" style={challengeBadgeStyle}>Challenge</span>
                      )}
                      {currentLevel.tags.map((tag) => (
                        <span key={tag} className="text-[8px] font-semibold px-1.5 py-px rounded tracking-wide" style={{ background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`, border: `1px solid ${GOLD.border25}`, color: "rgba(252,211,77,0.8)" }}>{tag}</span>
                      ))}
                      <div className="flex items-center gap-0.5 px-1.5 py-px rounded" style={{ background: `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`, border: `1px solid ${NEUTRAL.border}` }}>
                        <Skull size={10} className="text-amber-400" />
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((d) => (
                            <div key={d} className={`w-2 h-2 rounded-full ${d <= currentLevel.difficulty ? currentLevel.difficulty === 1 ? "bg-green-500" : currentLevel.difficulty === 2 ? "bg-yellow-500" : "bg-red-500" : "bg-stone-700"}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 px-1.5 py-px rounded" style={{ background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`, border: `1px solid ${AMBER_CARD.border}` }}>
                        <Flag size={10} className="text-amber-300" />
                        <span className="text-amber-200 font-bold text-[9px]">{waveCount}W</span>
                      </div>
                    </div>
                    {/* Row 3: Stars + hearts + time */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <div className="flex items-center gap-0.5 px-1.5 py-px rounded" style={{ background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`, border: `1px solid ${AMBER_CARD.border}` }}>
                        <Trophy size={10} className="text-yellow-500" />
                        <div className="flex gap-px">
                          {[1, 2, 3].map((s) => (
                            <Star key={s} size={10} className={`${(levelStars[currentLevel.id] || 0) >= s ? "text-yellow-400 fill-yellow-400" : "text-stone-600"}`} />
                          ))}
                        </div>
                      </div>
                      {levelStats[currentLevel.id] && (
                        <>
                          <div className="flex items-center gap-0.5 px-1.5 py-px rounded" style={{ background: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`, border: `1px solid ${RED_CARD.border}` }}>
                            <Heart size={10} className="text-red-400 fill-red-400" />
                            <span className="text-red-200 font-mono font-bold text-[9px]">{levelStats[currentLevel.id]?.bestHearts}/20</span>
                          </div>
                          <div className="flex items-center gap-0.5 px-1.5 py-px rounded" style={{ background: `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`, border: `1px solid ${BLUE_CARD.border}` }}>
                            <Clock size={10} className="text-blue-400" />
                            <span className="text-blue-200 font-mono font-bold text-[9px]">{levelStats[currentLevel.id]?.bestTime ? `${Math.floor(levelStats[currentLevel.id]!.bestTime! / 60)}m${levelStats[currentLevel.id]!.bestTime! % 60}s` : "—"}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {/* Row 4: Region levels */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border25}, transparent)` }} />
                        <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Region</span>
                        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25})` }} />
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {visibleWorldLevels.filter((l) => l.region === currentLevel.region && !DEV_LEVEL_IDS.has(l.id)).map((l) => (
                          <button
                            key={l.id}
                            onClick={() => handleLevelClick(l.id)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded transition-all text-left"
                            style={{
                              background: l.id === selectedLevel ? `linear-gradient(135deg, ${SELECTED.warmBgLight}, ${SELECTED.warmBgDark})` : `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                              border: `1px solid ${l.id === selectedLevel ? GOLD.accentBorder40 : GOLD.border25}`,
                            }}
                          >
                            <span className={`text-[9px] font-medium truncate ${l.id === selectedLevel ? "text-amber-100" : "text-amber-200/80"}`}>{l.name}</span>
                            <div className="flex gap-px flex-shrink-0">
                              {[1, 2, 3].map((s) => (
                                <Star key={s} size={8} className={(levelStars[l.id] || 0) >= s ? "text-yellow-400 fill-yellow-400" : "text-stone-600"} />
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Battle button pinned at bottom */}
                  <div className="flex-shrink-0 px-2 pb-1.5 pt-1 relative z-10" style={{ borderTop: `1px solid ${GOLD.border25}` }}>
                    <button
                      onClick={canStart ? startGame : onStartWithRandomLoadout}
                      className="w-full py-3 rounded-lg font-black text-sm transition-all relative overflow-hidden group uppercase"
                      style={{
                        background: `linear-gradient(180deg, rgba(200,150,30,0.97) 0%, rgba(160,105,15,0.97) 50%, rgba(130,80,10,0.97) 100%)`,
                        border: `2px solid rgba(255,210,80,0.7)`,
                        boxShadow: `0 0 18px rgba(255,180,40,0.35), 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,240,160,0.4), inset 0 -1px 0 rgba(80,50,10,0.4)`,
                        color: "rgba(253,230,138,0.9)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.6), 0 0 10px rgba(255,200,60,0.3)",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                      <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid rgba(255,230,140,0.2)` }} />
                      <div className="relative flex items-center justify-center gap-2">
                        <Swords size={16} />
                        <span className="tracking-widest">BATTLE</span>
                        <Play size={14} />
                      </div>
                    </button>
                  </div>
                </div>
              );
            })() : (
              <div className="flex-1 flex flex-col overflow-auto p-2 relative z-10">
                {/* Campaign header + progress */}
                <div className="flex items-center gap-2 mb-1.5">
                  <MapIcon size={14} className="text-amber-400" />
                  <span className="text-xs font-bold text-amber-100 tracking-wide">Campaign</span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-amber-300">{totalStars}/{maxStars}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => goToPreviousLevel()} className="p-0.5 rounded border transition-colors" style={{ background: PANEL.bgWarmMid, borderColor: GOLD.border25 }}>
                      <ChevronLeft size={14} className="text-amber-400" />
                    </button>
                    <button onClick={() => goToNextLevel()} className="p-0.5 rounded border transition-colors" style={{ background: PANEL.bgWarmMid, borderColor: GOLD.border25 }}>
                      <ChevronRight size={14} className="text-amber-400" />
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full overflow-hidden mb-2 relative" style={{ background: PANEL.bgDeep, border: `1px solid ${GOLD.border25}` }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${maxStars > 0 ? (totalStars / maxStars) * 100 : 0}%`, background: "linear-gradient(90deg, rgba(180,120,20,0.9), rgba(220,170,40,0.95), rgba(180,120,20,0.9))", boxShadow: "0 0 8px rgba(220,170,40,0.4)" }} />
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="relative flex items-center gap-1 px-1.5 py-1 rounded" style={{ background: `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`, border: `1px solid ${BLUE_CARD.border}` }}>
                    <div className="absolute inset-[1.5px] rounded-[3px] pointer-events-none" style={{ border: `1px solid ${BLUE_CARD.innerBorder}` }} />
                    <Swords size={10} className="text-blue-400/80" />
                    <span className="text-[9px] font-bold text-blue-300/90">{Object.values(levelStats).reduce((a, s) => a + (s.timesPlayed || 0), 0)}</span>
                    <span className="text-[7px] text-blue-500/60 font-bold uppercase tracking-wider">Games</span>
                  </div>
                  <div className="relative flex items-center gap-1 px-1.5 py-1 rounded" style={{ background: `linear-gradient(135deg, ${GREEN_CARD.bgLight}, ${GREEN_CARD.bgDark})`, border: `1px solid ${GREEN_CARD.border}` }}>
                    <div className="absolute inset-[1.5px] rounded-[3px] pointer-events-none" style={{ border: `1px solid ${GREEN_CARD.innerBorder}` }} />
                    <Trophy size={10} className="text-emerald-400/80" />
                    <span className="text-[9px] font-bold text-emerald-300/90">{Object.values(levelStats).reduce((a, s) => a + (s.timesWon || 0), 0)}</span>
                    <span className="text-[7px] text-emerald-500/60 font-bold uppercase tracking-wider">Wins</span>
                  </div>
                  <div className="relative flex items-center gap-1 px-1.5 py-1 rounded" style={{ background: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`, border: `1px solid ${RED_CARD.border}` }}>
                    <div className="absolute inset-[1.5px] rounded-[3px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder12}` }} />
                    <Heart size={10} className="text-red-400 fill-red-400" />
                    <span className="text-[9px] font-bold text-red-300/90">{Object.values(levelStats).reduce((a, s) => a + (s.bestHearts || 0), 0)}</span>
                    <span className="text-[7px] text-red-700 font-semibold">/{visibleWorldLevels.length * 20}</span>
                  </div>
                </div>
                {/* Region list with icons and preview gradients */}
                <div className="flex-1 overflow-y-auto space-y-1">
                  {REGION_ORDER.map((region) => {
                    const levels = visibleWorldLevels.filter((l) => l.region === region && !DEV_LEVEL_IDS.has(l.id));
                    const stars = levels.reduce((s, l) => s + (levelStars[l.id] || 0), 0);
                    const rMax = levels.length * 3;
                    const completed = levels.filter((l) => (levelStars[l.id] || 0) > 0).length;
                    const pct = rMax > 0 ? (stars / rMax) * 100 : 0;
                    const regionMeta: Record<string, { name: string; color: string; border: string; bgLight: string; bgDark: string }> = {
                      grassland: { name: "Princeton Grounds", color: "text-green-400", border: "rgba(80,160,60,0.45)", bgLight: "rgba(30,50,25,0.8)", bgDark: "rgba(20,35,18,0.65)" },
                      swamp: { name: "Mathey Marshes", color: "text-teal-400", border: "rgba(60,140,130,0.45)", bgLight: "rgba(20,40,38,0.8)", bgDark: "rgba(15,30,28,0.65)" },
                      desert: { name: "Stadium Sands", color: "text-amber-400", border: "rgba(180,140,50,0.45)", bgLight: "rgba(55,40,18,0.8)", bgDark: "rgba(40,28,12,0.65)" },
                      winter: { name: "Frist Frontier", color: "text-blue-400", border: "rgba(80,130,200,0.45)", bgLight: "rgba(25,35,50,0.8)", bgDark: "rgba(18,25,40,0.65)" },
                      volcanic: { name: "Dormitory Depths", color: "text-red-400", border: "rgba(180,70,50,0.45)", bgLight: "rgba(50,25,20,0.8)", bgDark: "rgba(35,18,15,0.65)" },
                    };
                    const meta = regionMeta[region] ?? { name: region, color: "text-amber-400", border: GOLD.border25, bgLight: PANEL.bgWarmLight, bgDark: PANEL.bgWarmMid };
                    const targetLevel = levels.find((l) => unlockedMapSet.has(l.id) && (levelStars[l.id] || 0) < 3) ?? levels[0];
                    const previewImg = targetLevel ? LEVEL_DATA[targetLevel.id]?.previewImage : undefined;
                    return (
                      <button
                        key={region}
                        onClick={() => { if (targetLevel) handleLevelClick(targetLevel.id); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded overflow-hidden transition-all hover:brightness-110 relative"
                        style={{ background: `linear-gradient(135deg, ${meta.bgLight}, ${meta.bgDark})`, border: `1px solid ${meta.border}`, boxShadow: `inset 0 0 8px ${meta.border.replace('0.45', '0.08')}` }}
                      >
                        {previewImg && (
                          <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                            <Image src={previewImg} alt="" fill unoptimized className="absolute right-0 top-0 !h-full !w-[55%] !left-auto object-cover opacity-20" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 35%, black 65%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 35%, black 65%, transparent 100%)" }} />
                          </div>
                        )}
                        <div className="absolute inset-[1px] rounded-[3px] pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.05)" }} />
                        <div className="relative flex-shrink-0">
                          <RegionIcon type={region} size={20} framed />
                        </div>
                        <div className="relative flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-[9px] font-bold truncate ${meta.color}`}>{meta.name}</span>
                            <span className="text-[8px] text-amber-400/60 font-medium ml-1 flex-shrink-0">{completed}/{levels.length}</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.border }} />
                          </div>
                        </div>
                        <div className="relative flex items-center gap-px flex-shrink-0">
                          <Star size={9} className={stars > 0 ? "text-yellow-400 fill-yellow-400" : "text-stone-600"} />
                          <span className="text-[8px] font-bold text-amber-300/70">{stars}/{rMax}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP: LEFT SIDEBAR */}
        <div className="hidden sm:flex sm:h-auto sm:w-80 flex-shrink-0 flex-col overflow-hidden pl-3 py-3" style={{ background: `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)` }}>
          <OrnateFrame
            className="flex-1 flex flex-col overflow-hidden rounded-2xl border-2 border-amber-600/50 shadow-2xl"
            cornerSize={24}
            showBorders={true}
            showSideBorders={true}
            showTopBottomBorders={true}
            borderScale={0.4}
          >
            <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: panelGradient, boxShadow: `0 0 30px ${GOLD.glow07}, inset 0 0 20px ${GOLD.glow04}` }}>
              {selectedLevel && currentLevel ? (
                <div className="flex-1 flex flex-col h-full overflow-auto">
                  <div className="flex-shrink-0 relative overflow-hidden">
                    {/* Top gold divider line */}
                    <div className="h-px" style={{ background: dividerGradient }} />
                    <div className="relative p-4" style={{ borderBottom: `1px solid ${GOLD.border25}` }}>
                      {/* Inner glow border */}
                      <div className="absolute inset-[2px] rounded-sm pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />

                      {/* Level name + close button */}
                      <div className="flex items-start justify-between mb-1 relative z-10">
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
                          className="p-1.5 rounded-lg transition-all hover:scale-110 shrink-0"
                          style={{ background: PANEL.bgWarmMid, border: `1px solid ${GOLD.border25}` }}
                        >
                          <X size={16} className="text-amber-400" />
                        </button>
                      </div>

                      {/* Tags row */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2 relative z-10">
                        {isCurrentChallengeLevel && (
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase"
                            style={challengeBadgeStyle}
                          >
                            Challenge
                          </span>
                        )}
                        {currentLevel.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-md tracking-wide"
                            style={{
                              background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                              border: `1px solid ${GOLD.border25}`,
                              color: "rgba(252,211,77,0.8)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="whitespace-pre-line text-amber-400/80 text-sm italic mb-3 relative z-10">
                        &ldquo;{currentLevel.description}&rdquo;
                      </p>

                      {/* Difficulty + Waves + Stars row */}
                      <div className="flex items-center gap-1.5 sm:mb-2 relative z-10 flex-wrap">
                        {/* Difficulty card */}
                        <div className="relative flex items-center gap-1.5 px-2 py-1.5 rounded-md" style={{
                          background: `linear-gradient(135deg, ${NEUTRAL.bgLight}, ${NEUTRAL.bgDark})`,
                          border: `1px solid ${NEUTRAL.border}`,
                          boxShadow: `inset 0 0 6px ${NEUTRAL.glow}`
                        }}>
                          <div className="absolute inset-[2px] rounded-[4px] pointer-events-none" style={{ border: `1px solid ${NEUTRAL.innerBorder}` }} />
                          <Skull size={12} className="text-amber-400" />
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((d) => (
                              <div
                                key={d}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${d <= currentLevel.difficulty
                                  ? `${currentLevel.difficulty === 1
                                    ? "bg-green-500 shadow-green-500/50"
                                    : currentLevel.difficulty === 2
                                      ? "bg-yellow-500 shadow-yellow-500/50"
                                      : "bg-red-500 shadow-red-500/50"
                                  } shadow-md`
                                  : "bg-stone-700"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Waves card */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md relative" style={{
                          background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                          border: `1px solid ${AMBER_CARD.border}`,
                          boxShadow: `inset 0 0 6px ${AMBER_CARD.glow}`
                        }}>
                          <div className="absolute inset-[2px] rounded-[4px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
                          <Flag size={12} className="text-amber-300" />
                          <span className="text-amber-200 font-bold text-xs">
                            {waveCount} Waves
                          </span>
                        </div>

                        {/* Stars (mobile) */}
                        <div className="flex sm:hidden items-center gap-1.5 px-2 py-1 rounded-md relative" style={{
                          background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                          border: `1px solid ${AMBER_CARD.border}`,
                          boxShadow: `inset 0 0 6px ${AMBER_CARD.glow}`
                        }}>
                          <div className="absolute inset-[2px] rounded-[4px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
                          <Trophy size={12} className="text-yellow-500" />
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                size={14}
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
                      <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md relative" style={{
                        background: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
                        border: `1px solid ${AMBER_CARD.border}`,
                        boxShadow: `inset 0 0 8px ${AMBER_CARD.glow}`
                      }}>
                        <div className="absolute inset-[2px] rounded-[4px] pointer-events-none" style={{ border: `1px solid ${AMBER_CARD.innerBorder}` }} />
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="text-amber-400 text-xs font-medium">Best:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              size={15}
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
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5 relative z-10">
                          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md relative" style={{
                            background: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
                            border: `1px solid ${RED_CARD.border}`,
                            boxShadow: `inset 0 0 8px ${RED_CARD.glow06}`
                          }}>
                            <div className="absolute inset-[2px] rounded-[4px] pointer-events-none" style={{ border: `1px solid ${RED_CARD.innerBorder12}` }} />
                            <Heart size={13} className="text-red-400 fill-red-400" />
                            <div className="text-xs text-red-200 font-mono font-bold">
                              {levelStats[currentLevel.id]?.bestHearts}/20
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md relative" style={{
                            background: `linear-gradient(135deg, ${BLUE_CARD.bgLight}, ${BLUE_CARD.bgDark})`,
                            border: `1px solid ${BLUE_CARD.border}`,
                            boxShadow: `inset 0 0 8px ${BLUE_CARD.glow}`
                          }}>
                            <div className="absolute inset-[2px] rounded-[4px] pointer-events-none" style={{ border: `1px solid ${BLUE_CARD.innerBorder}` }} />
                            <Clock size={13} className="text-blue-400" />
                            <span className="text-blue-200 text-xs font-mono font-bold">
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
                    <div className="flex items-center gap-2 mb-2">
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
                      ) : fallbackPreviewImage ? (
                        <>
                          <Image
                            src={fallbackPreviewImage}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, 520px"
                            className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[1px]"
                          />
                          <div className="absolute inset-0" style={{
                            background: currentLevel.region === "grassland"
                              ? "linear-gradient(135deg, rgba(20,40,15,0.55), rgba(30,50,20,0.4))"
                              : currentLevel.region === "swamp"
                                ? "linear-gradient(135deg, rgba(15,35,32,0.55), rgba(20,40,35,0.4))"
                                : currentLevel.region === "desert"
                                  ? "linear-gradient(135deg, rgba(50,35,12,0.55), rgba(40,28,10,0.4))"
                                  : currentLevel.region === "winter"
                                    ? "linear-gradient(135deg, rgba(20,30,45,0.55), rgba(15,25,40,0.4))"
                                    : "linear-gradient(135deg, rgba(45,20,15,0.55), rgba(35,15,10,0.4))"
                          }} />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <RegionIcon type={currentLevel.region} size={56} framed challenge={isCurrentChallengeLevel} />
                            <p className="mt-2 text-amber-300/70 text-[10px] font-bold uppercase tracking-widest drop-shadow-lg">
                              {currentLevel.name}
                            </p>
                          </div>
                        </>
                      ) : null}
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

                  <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
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

                      const regionLevels = visibleWorldLevels.filter(
                        (l) => l.region === currentLevel.region && !DEV_LEVEL_IDS.has(l.id)
                      );
                      const regionStars = regionLevels.reduce(
                        (sum, l) => sum + (levelStars[l.id] || 0),
                        0
                      );
                      const maxRegionStars = regionLevels.length * 3;
                      return (
                        <div className="space-y-1.5">
                          {regionLevels.map((l) => {
                            const levelPreview = LEVEL_DATA[l.id]?.previewImage;
                            const fadeColor = l.id === selectedLevel ? SELECTED.warmBgLight : PANEL.bgWarmLight;
                            return (
                              <div
                                key={l.id}
                                className="flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer relative overflow-hidden"
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
                                {levelPreview && (
                                  <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                                    <Image src={levelPreview} alt="" fill unoptimized className="absolute right-0 top-0 !h-full !w-[60%] !left-auto object-cover object-center opacity-25" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)" }} />
                                    <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${fadeColor} 30%, transparent 70%)` }} />
                                  </div>
                                )}
                                <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{
                                  border: `1px solid ${l.id === selectedLevel ? GOLD.accentBorder15 : GOLD.innerBorder08}`
                                }} />
                                <div className="relative z-10 w-8 h-8 flex items-center justify-center">
                                  {isLevelUnlocked(l.id)
                                    ? <RegionIcon type={l.region} size={32} framed challenge={l.kind === "challenge"} />
                                    : <RegionIcon type={l.region} size={32} framed locked challenge={l.kind === "challenge"} />
                                  }
                                </div>
                                <div className="relative z-10 flex-1 min-w-0">
                                  <div className={`text-sm font-medium truncate ${l.id === selectedLevel ? "text-amber-100" : "text-amber-200/90"}`}>
                                    {l.name}
                                    {l.kind === "challenge" ? " • Challenge" : ""}
                                  </div>
                                </div>
                                <div className="relative z-10 flex gap-0.5">
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
                            );
                          })}
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
                        color: "rgba(253, 230, 138, 0.9)",
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
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
                <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                  {/* CampaignOverview always renders as the base layer */}
                  <CampaignOverview
                    levelStars={levelStars}
                    levelStats={levelStats}
                    unlockedMaps={unlockedMaps}
                    onSelectLevel={handleLevelClick}
                  />

                  {/* BattlefieldPreview overlays on top (first-time users or manual toggle) */}
                  {showPreview && (
                    <div className="absolute h-full inset-0 z-20 bg-[#0a0806]">
                      <BattlefieldPreview
                        animTime={animTime}
                        onSelectFarthestLevel={() => {
                          const unlockedLevelsList = visibleWorldLevels.filter(l => isLevelUnlocked(l.id));
                          if (unlockedLevelsList.length > 0) {
                            const farthestLevel = unlockedLevelsList[unlockedLevelsList.length - 1];
                            handleLevelClick(farthestLevel.id);
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Toggle button */}
                  <button
                    onClick={() => setShowBattlefieldPreview(!showPreview)}
                    className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 hover:brightness-110"
                    style={{
                      background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                      border: `1px solid ${GOLD.border25}`,
                      boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
                    }}
                    title={showPreview ? "Show Campaign Stats" : "Show Battle Scene"}
                  >
                    {showPreview
                      ? <><BarChart3 size={12} className="text-amber-400/80" /><span className="text-[9px] font-bold text-amber-300/80 uppercase tracking-wider">Stats</span></>
                      : <><Eye size={12} className="text-amber-400/80" /><span className="text-[9px] font-bold text-amber-300/80 uppercase tracking-wider">Preview</span></>
                    }
                  </button>
                </div>
              )}
            </div>
          </OrnateFrame>
        </div>
        {/* RIGHT: Map */}
        <div className="relative flex-1 flex flex-col min-w-0 min-h-0 py-1 sm:py-3 px-1.5 sm:px-3 overflow-hidden" style={{ background: `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)` }}>
          <OrnateFrame
            className="flex-1 relative bg-gradient-to-br from-stone-900 to-stone-950 rounded-2xl border-2 border-amber-600/50 overflow-hidden shadow-2xl min-h-0"
            cornerSize={28}
            showBorders={true}
          >
            <div
              ref={containerRef}
              className="absolute inset-0"
            >
              <div
                ref={scrollContainerRef}
                className="absolute h-full inset-0 overflow-auto z-10"
                style={{ cursor: dragCursor ? 'grabbing' : 'grab', touchAction: 'none', background: '#0a0806' }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  ref={canvasWrapperRef}
                  className="relative game-start-fade"
                  style={{
                    width: `${displayW}px`,
                    height: `${displayH}px`,
                    margin: displayW <= containerWidth ? '0 auto' : undefined,
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    className="block"
                    style={{ cursor: dragCursor ? 'grabbing' : 'grab' }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredLevel(null)}
                    onClick={handleClick}
                  />
                  {selectedLevel && (() => {
                    const worldLevel = visibleWorldLevels.find((l) => l.id === selectedLevel);
                    if (!worldLevel) return null;
                    const scale = mapScale;
                    const yMap = getY(worldLevel.y);
                    const nodeSize = 28;
                    const btnWidth = 120;
                    const btnHeight = 38;
                    const gap = 8;
                    const tooltipBelow = worldLevel.y < 50;
                    const centerXPx = worldLevel.x * scale;
                    const btnTopPx = tooltipBelow
                      ? (yMap - nodeSize - gap - btnHeight) * scale
                      : (yMap + nodeSize + gap) * scale;
                    const shieldPad = 14;
                    const handleBattleClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (canStart) startGame();
                      else onStartWithRandomLoadout?.();
                    };
                    return (
                      <div
                        className="absolute z-40 pointer-events-auto"
                        style={{
                          left: `${centerXPx - (btnWidth * scale) / 2 - shieldPad}px`,
                          top: `${btnTopPx - shieldPad}px`,
                          width: `${btnWidth * scale + shieldPad * 2}px`,
                          height: `${btnHeight * scale + shieldPad * 2}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={handleBattleClick}
                          className="absolute rounded-lg font-bold transition-all overflow-hidden group hover:brightness-125 hover:scale-105 active:scale-95"
                          style={{
                            left: `${shieldPad}px`,
                            top: `${shieldPad}px`,
                            width: `${btnWidth * scale}px`,
                            height: `${btnHeight * scale}px`,
                            background: `linear-gradient(180deg, rgba(200,150,30,0.97) 0%, rgba(160,105,15,0.97) 50%, rgba(130,80,10,0.97) 100%)`,
                            border: `2px solid rgba(255,210,80,0.7)`,
                            borderRadius: '8px',
                            boxShadow: `0 0 18px rgba(255,180,40,0.35), 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,240,160,0.4), inset 0 -1px 0 rgba(80,50,10,0.4)`,
                            color: "rgba(253,230,138,0.9)",
                            textShadow: "0 1px 4px rgba(0,0,0,0.6), 0 0 10px rgba(255,200,60,0.3)",
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                          <div className="absolute inset-[2px] rounded-[6px] pointer-events-none" style={{ border: `1px solid rgba(255,230,140,0.2)` }} />
                          <span className="flex items-center justify-center gap-1.5 relative z-10 text-xs font-black tracking-widest uppercase">
                            <Swords size={13} />
                            BATTLE
                            <ChevronRight size={14} className="-ml-0.5" />
                          </span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* HERO & SPELL SELECTION OVERLAY (desktop only) */}
              <div className="hidden sm:flex absolute w-full bottom-0 left-0 right-0 p-3 pointer-events-none h-full overflow-x-auto z-20" style={{
                background: `linear-gradient(180deg, transparent 0%, transparent 40%, rgba(18,12,6,0.4) 65%, rgba(18,12,6,0.92) 85%, rgba(18,12,6,0.98) 100%)`
              }}>
                <div ref={bottomPanelRef} className="flex w-full mt-auto gap-3 pointer-events-auto items-stretch">
                  {/* --- Flavor / Battle Summary Panel --- */}
                  <div className="hidden sm:flex sm:flex-col w-44 flex-shrink-0 relative rounded-xl"
                    style={{
                      background: 'linear-gradient(180deg, rgba(41,32,20,0.97) 0%, rgba(28,22,15,0.99) 100%)',
                      border: '1.5px solid rgba(180,140,60,0.45)',
                      boxShadow: 'inset 0 0 20px rgba(180,140,60,0.06), 0 4px 24px rgba(0,0,0,0.5)',
                    }}>
                    <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(180,140,60,0.12)' }} />
                    <div className="px-2 sm:px-3 py-2  relative"
                      style={{ background: 'linear-gradient(90deg, rgba(180,130,40,0.22), rgba(120,80,20,0.1), transparent)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChessKnight size={13} className="text-amber-400 shrink-0" />
                          <span className="text-[9px] sm:text-[10px] text-nowrap font-bold text-amber-300 tracking-[0.2em] uppercase">
                            Guide
                          </span>
                        </div>
                        <button
                          onClick={() => openCodexTo("guide")}
                          className="flex items-center justify-center w-5 h-5 rounded-md text-blue-300/80 transition-all hover:brightness-150 hover:scale-110"
                          style={{
                            background: 'rgba(30,50,100,0.3)',
                            border: '1px solid rgba(80,120,200,0.25)',
                          }}
                          title="Guide"
                        >
                          <Book size={10} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-2 sm:left-3 right-2 sm:right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,140,60,0.35) 20%, rgba(255,200,80,0.45) 50%, rgba(180,140,60,0.35) 80%, transparent)' }} />
                    </div>
                    <div className="p-1.5 sm:p-2 flex-1 flex flex-col justify-between gap-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        {([
                          { label: "Towers", tab: "towers" as CodexTabId, icon: <ChessRook size={11} />, color: "text-amber-300", bg: "rgba(120,85,20,0.3)", border: "rgba(180,140,60,0.22)" },
                          { label: "Heroes", tab: "heroes" as CodexTabId, icon: <Crown size={11} />, color: "text-amber-300", bg: "rgba(120,85,20,0.3)", border: "rgba(180,140,60,0.22)" },
                          { label: "Spells", tab: "spells" as CodexTabId, icon: <Sparkles size={11} />, color: "text-purple-300", bg: "rgba(80,40,120,0.25)", border: "rgba(140,80,200,0.22)" },
                          { label: "Enemies", tab: "enemies" as CodexTabId, icon: <Skull size={11} />, color: "text-red-300", bg: "rgba(100,30,30,0.25)", border: "rgba(180,60,60,0.22)" },
                          { label: "Special", tab: "special_towers" as CodexTabId, icon: <Star size={11} />, color: "text-yellow-300", bg: "rgba(100,80,20,0.25)", border: "rgba(200,160,40,0.22)" },
                          { label: "Hazards", tab: "hazards" as CodexTabId, icon: <AlertTriangle size={11} />, color: "text-orange-300", bg: "rgba(100,50,15,0.25)", border: "rgba(200,100,30,0.22)" },
                        ]).map((item) => (
                          <button
                            key={item.tab}
                            onClick={() => openCodexTo(item.tab)}
                            className={`flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md text-[8px] font-semibold ${item.color} tracking-wide uppercase transition-all hover:brightness-130 hover:scale-105`}
                            style={{
                              background: `linear-gradient(135deg, ${item.bg}, rgba(30,22,12,0.2))`,
                              border: `1px solid ${item.border}`,
                            }}
                          >
                            <span className="shrink-0 flex items-center justify-center w-[11px] h-[11px]">{item.icon}</span>
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <div className="w-full h-px my-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,140,60,0.25) 20%, rgba(255,200,80,0.3) 50%, rgba(180,140,60,0.25) 80%, transparent)' }} />
                      <button
                        onClick={() => {
                          const unlockedLevelsList = visibleWorldLevels.filter(l => isLevelUnlocked(l.id));
                          if (unlockedLevelsList.length > 0) {
                            const farthestLevel = unlockedLevelsList[unlockedLevelsList.length - 1];
                            handleLevelClick(farthestLevel.id);
                          }
                        }}
                        className="flex items-center justify-center gap-2 rounded-lg px-2.5 py-2.5 transition-all hover:brightness-125 hover:scale-[1.03] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, rgba(160,110,25,0.55), rgba(120,75,15,0.45))',
                          border: '1px solid rgba(200,160,60,0.4)',
                          boxShadow: 'inset 0 1px 0 rgba(255,210,100,0.12), 0 2px 8px rgba(0,0,0,0.3)',
                        }}>
                        <Swords size={13} className="text-amber-400 shrink-0" />
                        <span className="text-[9px] font-bold text-amber-200 tracking-wider uppercase">Defend the Realm</span>
                      </button>
                    </div>
                  </div>

                  {/* --- Hero Panel --- */}
                  <HeroSelector
                    selectedHero={selectedHero}
                    setSelectedHero={setSelectedHero}
                    hoveredHero={hoveredHero}
                    setHoveredHero={setHoveredHero}
                    onOpenCodex={() => openCodexTo("heroes")}
                  />

                  {/* --- Spell Panel --- */}
                  <SpellSelector
                    selectedSpells={selectedSpells}
                    toggleSpell={toggleSpell}
                    hoveredSpell={hoveredSpell}
                    setHoveredSpell={setHoveredSpell}
                    availableSpellStars={availableSpellStars}
                    totalSpellStarsEarned={totalSpellStarsEarned}
                    spentSpellStars={spentSpellStars}
                    spellUpgradeLevels={spellUpgradeLevels}
                    upgradeSpell={upgradeSpell}
                    onOpenCodex={() => openCodexTo("spells")}
                  />
                </div>
              </div>

              {/* MOBILE HERO & SPELL FLOATING CIRCLES */}
              <div className="flex sm:hidden absolute w-full bottom-0 left-0 right-0 pointer-events-none z-20">
                <div className="w-full pointer-events-auto">
                  <MobileLoadoutBar
                    selectedHero={selectedHero}
                    setSelectedHero={setSelectedHero}
                    selectedSpells={selectedSpells}
                    toggleSpell={toggleSpell}
                    onOpenHeroCodex={() => openCodexTo("heroes")}
                    onOpenSpellCodex={() => openCodexTo("spells")}
                    availableSpellStars={availableSpellStars}
                    totalSpellStarsEarned={totalSpellStarsEarned}
                    spentSpellStars={spentSpellStars}
                    spellUpgradeLevels={spellUpgradeLevels}
                    upgradeSpell={upgradeSpell}
                  />
                </div>
              </div>
            </div>
          </OrnateFrame>
        </div>
      </div>

      {showCodex && <CodexModal onClose={() => setShowCodex(false)} defaultTab={codexTab} />}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          settings={settings}
          updateCategory={updateCategory}
          applyPreset={applyPreset}
          resetToDefaults={resetToDefaults}
          resetCategory={resetCategory}
          onDevModeChange={onDevModeChange}
        />
      )}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
      {showCreator && (
        <CreatorModal
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
