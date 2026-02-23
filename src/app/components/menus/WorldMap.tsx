"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import type { GameState, LevelStars, HeroType, SpellType } from "../../types";
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
    <div className="relative flex items-center gap-2 sm:gap-3">
      <div className="absolute -inset-4 blur-2xl opacity-60">
        <div
          className="absolute inset-0 bg-gradient-to-r from-orange-600/40 via-amber-400/50 to-orange-600/40"
          style={{ transform: `scale(${1 + Math.sin(pulse * 0.1) * 0.1})` }}
        />
      </div>
      <PrincetonTDLogo height="h-10" width="w-8" />
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

      <img
        src="/images/gameplay-cropped.png"
        alt="Battle Scene"
        className="w-full h-80 object-bottom object-contain absolute top-[-14rem] right-[-10rem] opacity-10 pointer-events-none select-none"
      />
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
  levelStats: Record<string, any>;
  unlockedMaps: string[];
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType | null) => void;
  selectedSpells: SpellType[];
  setSelectedSpells: (spells: SpellType[]) => void;
  gameState: GameState;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  setSelectedMap,
  setGameState,
  levelStars,
  levelStats,
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
  const [animTime, setAnimTime] = useState(0);
  const animTimeRef = useRef(0);
  const [mapHeight, setMapHeight] = useState(500);
  const [hoveredHero, setHoveredHero] = useState<HeroType | null>(null);
  const [hoveredSpell, setHoveredSpell] = useState<SpellType | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const lastCanvasSizeRef = useRef({ w: 0, h: 0 });

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);

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
  const isLevelUnlocked = useCallback(
    (levelId: string) => unlockedMaps.includes(levelId),
    [unlockedMaps]
  );
  const getLevelById = useCallback(
    (id: string) => WORLD_LEVELS.find((l) => l.id === id),
    []
  );
  const getY = useCallback(
    (pct: number) => {
      const usableHeight = mapHeight - 70; // Leave 60px top for labels, 40px bottom for overlay
      return (pct / 100) * usableHeight - 50;
    },
    [mapHeight]
  );
  const handleLevelClick = (levelId: string) => {
    if (isLevelUnlocked(levelId)) {
      setSelectedLevel(levelId);
      setSelectedMap(levelId);
      setHoveredLevel(null); // Clear hover state to prevent duplicate tooltip on mobile
    }
  };
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
  const seededRandom = useCallback((seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  }, []);

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = MAP_WIDTH;
    const height = mapHeight;

    // Only resize canvas when dimensions actually change (expensive operation)
    const needsResize = lastCanvasSizeRef.current.w !== width || lastCanvasSizeRef.current.h !== height;
    if (needsResize) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.minHeight = `${height}px`;
      lastCanvasSizeRef.current = { w: width, h: height };
    }

    // Use ref-based time to avoid React re-renders on every frame
    const time = animTimeRef.current;

    // Clear canvas (cheaper than resizing)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background with rich war atmosphere - deep layered gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
    bgGrad.addColorStop(0, "#2d3a1f");    // greenish for grassland
    bgGrad.addColorStop(0.21, "#1f2a18"); // transition
    bgGrad.addColorStop(0.22, "#1a2a1a"); // swamp
    bgGrad.addColorStop(0.39, "#2a2818"); // transition
    bgGrad.addColorStop(0.41, "#4a3a22"); // desert
    bgGrad.addColorStop(0.59, "#3a3020"); // transition
    bgGrad.addColorStop(0.61, "#2a3848"); // winter
    bgGrad.addColorStop(0.78, "#1a2838"); // transition
    bgGrad.addColorStop(0.80, "#3a1a1a"); // volcanic
    bgGrad.addColorStop(1, "#2a0a0a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Vertical atmosphere gradient (darker at edges, lighter in middle)
    const vGrad = ctx.createLinearGradient(0, 0, 0, height);
    vGrad.addColorStop(0, "rgba(0,0,0,0.35)");
    vGrad.addColorStop(0.3, "rgba(0,0,0,0.05)");
    vGrad.addColorStop(0.5, "rgba(0,0,0,0)");
    vGrad.addColorStop(0.7, "rgba(0,0,0,0.05)");
    vGrad.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial warm vignette
    const vigGrad = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, width);
    vigGrad.addColorStop(0, "rgba(60,40,20,0)");
    vigGrad.addColorStop(0.7, "rgba(20,10,5,0.15)");
    vigGrad.addColorStop(1, "rgba(10,5,2,0.45)");
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // === ENHANCED GROUND TEXTURES ===
    // Layer 1: Large region-aware terrain patches for depth
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 100; i++) {
      const px = seededRandom(i * 7) * width;
      const py = seededRandom(i * 7 + 1) * height;
      const psize = 30 + seededRandom(i * 7 + 2) * 70;

      // Region-specific terrain colors
      let hue1 = "#5a4a3a"; let hue2 = "#3a2a1a";
      if (px > 1440) { hue1 = "#4a2020"; hue2 = "#2a0a0a"; }
      else if (px > 1080) { hue1 = "#5a6a7a"; hue2 = "#3a4a5a"; }
      else if (px > 720) { hue1 = "#8a7a5a"; hue2 = "#6a5a3a"; }
      else if (px > 380) { hue1 = "#2a4a2a"; hue2 = "#1a3a1a"; }
      else { hue1 = "#3a5a2a"; hue2 = "#2a4a1a"; }

      ctx.fillStyle = seededRandom(i * 7 + 3) > 0.5 ? hue1 : hue2;
      ctx.beginPath();
      // Organic blob shape
      ctx.moveTo(px + psize * 0.5, py);
      for (let a = 0; a < Math.PI * 2; a += 0.25) {
        const r = psize * (0.35 + seededRandom(i + a * 100) * 0.35);
        ctx.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r * 0.5);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layer 2: Region-aware dirt/soil texture with isometric perspective
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 600; i++) {
      const dx = seededRandom(i * 11) * width;
      const dy = seededRandom(i * 11 + 1) * height;
      const dw = 3 + seededRandom(i * 11 + 2) * 12;
      const dh = dw * 0.4;

      let soilLight = "#6a5a4a"; let soilDark = "#2a1a0a";
      if (dx > 1440) { soilLight = "#5a2a1a"; soilDark = "#1a0505"; }
      else if (dx > 1080) { soilLight = "#8a9aaa"; soilDark = "#4a5a6a"; }
      else if (dx > 720) { soilLight = "#b8a080"; soilDark = "#6a5a40"; }
      else if (dx > 380) { soilLight = "#3a5a3a"; soilDark = "#1a2a1a"; }
      else { soilLight = "#5a6a3a"; soilDark = "#2a3a1a"; }

      ctx.fillStyle = seededRandom(i * 11 + 3) > 0.6 ? soilLight : soilDark;
      ctx.beginPath();
      ctx.ellipse(dx, dy, dw, dh, seededRandom(i) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layer 3: Region-aware small pebbles and debris
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 500; i++) {
      const sx = seededRandom(i * 13) * width;
      const sy = seededRandom(i * 13 + 1) * height;
      const ss = 1 + seededRandom(i * 13 + 2) * 3.5;

      let pebbleColors = ["#5a4a3a", "#7a6a5a", "#3a2a1a", "#4a3a2a"];
      if (sx > 1440) pebbleColors = ["#4a2020", "#3a1010", "#5a2a1a", "#2a0a0a"];
      else if (sx > 1080) pebbleColors = ["#8a9aa8", "#b0c0d0", "#6a7a88", "#a0b0c0"];
      else if (sx > 720) pebbleColors = ["#a0905a", "#c0b080", "#8a7a4a", "#b0a070"];
      else if (sx > 380) pebbleColors = ["#2a4a2a", "#3a5a3a", "#1a3a1a", "#2a5a2a"];
      else pebbleColors = ["#4a5a2a", "#5a6a3a", "#3a4a1a", "#4a5a2a"];

      ctx.fillStyle = pebbleColors[Math.floor(seededRandom(i * 13 + 3) * 4)];
      ctx.beginPath();
      ctx.ellipse(sx, sy, ss, ss * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layer 4: Grass tufts in isometric style (scattered across map)
    const drawGrassTuft = (gx: number, gy: number, scale: number, color: string) => {
      ctx.fillStyle = color;
      const blades = 3 + Math.floor(seededRandom(gx + gy) * 4);
      for (let b = 0; b < blades; b++) {
        const bx = gx + (b - blades / 2) * 2 * scale;
        const bh = (6 + seededRandom(gx + b) * 6) * scale;
        const sway = Math.sin(time * 2 + gx * 0.1 + b) * 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, gy);
        ctx.quadraticCurveTo(bx + sway, gy - bh * 0.6, bx + sway * 1.5, gy - bh);
        ctx.quadraticCurveTo(bx + sway * 0.5, gy - bh * 0.4, bx, gy);
        ctx.fill();
      }
    };
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 300; i++) {
      const gx = seededRandom(i * 17) * width;
      const gy = seededRandom(i * 17 + 1) * height;
      // Determine grass color based on region
      let grassColor = "#3a5a2a";
      if (gx > 1440) grassColor = "#3a2020"; // volcanic - dead grass
      else if (gx > 1080) grassColor = "#4a5a5a"; // winter - frosty
      else if (gx > 720) grassColor = "#6a5a3a"; // desert - dry
      else if (gx > 380) grassColor = "#2a4a2a"; // swamp - dark green

      drawGrassTuft(gx, gy, 0.5 + seededRandom(i * 17 + 2) * 0.5, grassColor);
    }
    ctx.globalAlpha = 1;

    // Layer 5: Cracks and weathering lines (region-aware)
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 1;
    for (let i = 0; i < 120; i++) {
      const cx = seededRandom(i * 19) * width;
      const cy = seededRandom(i * 19 + 1) * height;
      const clen = 15 + seededRandom(i * 19 + 2) * 50;

      // Region-aware crack color
      if (cx > 1440) ctx.strokeStyle = "#2a0500";
      else if (cx > 1080) ctx.strokeStyle = "#2a3a4a";
      else if (cx > 720) ctx.strokeStyle = "#3a2a10";
      else if (cx > 380) ctx.strokeStyle = "#0a1a0a";
      else ctx.strokeStyle = "#1a2a00";

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      let cpx = cx, cpy = cy;
      for (let j = 0; j < 5; j++) {
        const nx = cpx + (seededRandom(i * 19 + j * 3) - 0.5) * clen * 0.5;
        const ny = cpy + seededRandom(i * 19 + j * 3 + 1) * clen * 0.3;
        ctx.lineTo(nx, ny);
        cpx = nx; cpy = ny;
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Layer 6: Enhanced parchment/texture overlay (region-aware)
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 500; i++) {
      const ptx = seededRandom(i * 3) * width;
      const pty = seededRandom(i * 3 + 1) * height;
      const ptSize = 2 + seededRandom(i * 3 + 2) * 12;

      let ptColor1 = "#6a5a4a"; let ptColor2 = "#2a1a0a";
      if (ptx > 1440) { ptColor1 = "#5a2020"; ptColor2 = "#1a0505"; }
      else if (ptx > 1080) { ptColor1 = "#8a9ab0"; ptColor2 = "#4a5a70"; }
      else if (ptx > 720) { ptColor1 = "#a09060"; ptColor2 = "#5a4a30"; }
      else if (ptx > 380) { ptColor1 = "#3a5a3a"; ptColor2 = "#1a3a1a"; }
      else { ptColor1 = "#5a6a3a"; ptColor2 = "#2a3a1a"; }

      ctx.fillStyle = seededRandom(i) > 0.5 ? ptColor1 : ptColor2;
      ctx.beginPath();
      ctx.arc(ptx, pty, ptSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // --- NATURAL FADING REGION TRANSITIONS (jagged but smooth) ---
    const drawRuggedBorder = (
      x: number,
      region1Color: string,
      region2Color: string
    ) => {
      ctx.save();

      // Build jagged path points
      const pathPoints: { x: number; y: number }[] = [];
      for (let y = 0; y <= height; y += 4) {
        const offset =
          Math.sin(y * 0.12 + x * 0.008) * 20 +
          Math.sin(y * 0.06 + x * 0.02) * 14 +
          Math.sin(y * 0.25 + x * 0.04) * 8 +
          seededRandom(y + x) * 16 - 8;
        pathPoints.push({ x: x + offset, y });
      }

      // Multiple soft fade layers from wide to narrow for a natural blended transition
      // Each layer uses a clipping region on one side of the jagged edge

      const fadeWidths = [90, 65, 45, 28, 16];
      const fadeAlphas = [0.06, 0.09, 0.12, 0.16, 0.2];

      // LEFT SIDE: region1 color fading into region2
      for (let layer = 0; layer < fadeWidths.length; layer++) {
        const fw = fadeWidths[layer];
        const alpha = fadeAlphas[layer];

        ctx.save();
        // Clip to the left side of the jagged border
        ctx.beginPath();
        ctx.moveTo(x - fw - 10, 0);
        pathPoints.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(x - fw - 10, height);
        ctx.closePath();
        ctx.clip();

        // Horizontal gradient fading region1 color from left toward the border
        const leftGrad = ctx.createLinearGradient(x - fw, 0, x + 5, 0);
        leftGrad.addColorStop(0, region1Color + "00");
        leftGrad.addColorStop(0.4, region1Color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
        leftGrad.addColorStop(1, region1Color + "00");
        ctx.fillStyle = leftGrad;
        ctx.fillRect(x - fw - 10, 0, fw + 20, height);
        ctx.restore();
      }

      // RIGHT SIDE: region2 color fading into region1
      for (let layer = 0; layer < fadeWidths.length; layer++) {
        const fw = fadeWidths[layer];
        const alpha = fadeAlphas[layer];

        ctx.save();
        // Clip to the right side of the jagged border
        ctx.beginPath();
        pathPoints.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.lineTo(x + fw + 10, height);
        ctx.lineTo(x + fw + 10, 0);
        ctx.closePath();
        ctx.clip();

        // Horizontal gradient fading region2 color from right toward the border
        const rightGrad = ctx.createLinearGradient(x - 5, 0, x + fw, 0);
        rightGrad.addColorStop(0, region2Color + "00");
        rightGrad.addColorStop(0.6, region2Color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
        rightGrad.addColorStop(1, region2Color + "00");
        ctx.fillStyle = rightGrad;
        ctx.fillRect(x - 10, 0, fw + 20, height);
        ctx.restore();
      }

      // Very subtle dark seam at the exact border edge (thin, low opacity)
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, 0);
      pathPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Even subtler lighter edge on top for depth
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, 0);
      pathPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    // Region backgrounds with rich multi-layered fills
    const regions = [
      {
        name: "PRINCETON GROUNDS",
        x: 0,
        w: 380,
        colors: ["#3d5a2f", "#2d4a1f", "#1a3010"],
        labelColor: "#8ade50",
        labelGlow: "#4a8020",
        accentTop: "rgba(100,180,60,0.12)",
        accentBot: "rgba(40,80,20,0.15)",
      },
      {
        name: "MATHEY MARSHES",
        x: 380,
        w: 340,
        colors: ["#2a3a2a", "#1a2a1a", "#0a1a0a"],
        labelColor: "#6aaa6a",
        labelGlow: "#2a5a2a",
        accentTop: "rgba(60,120,80,0.1)",
        accentBot: "rgba(20,60,30,0.15)",
      },
      {
        name: "STADIUM SANDS",
        x: 720,
        w: 360,
        colors: ["#c49a6c", "#a88050", "#7a6040"],
        labelColor: "#ffe060",
        labelGlow: "#aa8020",
        accentTop: "rgba(220,180,120,0.15)",
        accentBot: "rgba(120,90,50,0.12)",
      },
      {
        name: "FRIST FRONTIER",
        x: 1080,
        w: 360,
        colors: ["#8ab0d0", "#6a90b8", "#4a6888"],
        labelColor: "#d0f0ff",
        labelGlow: "#5090c0",
        accentTop: "rgba(150,200,240,0.12)",
        accentBot: "rgba(60,100,150,0.15)",
      },
      {
        name: "DORMITORY DEPTHS",
        x: 1440,
        w: 380,
        colors: ["#5a2020", "#3a1010", "#1a0505"],
        labelColor: "#ff8855",
        labelGlow: "#aa3010",
        accentTop: "rgba(200,60,30,0.12)",
        accentBot: "rgba(80,20,10,0.15)",
      },
    ];

    regions.forEach((r) => {
      // Multi-layered region fill
      const grad = ctx.createLinearGradient(r.x, 0, r.x + r.w, height);
      grad.addColorStop(0, r.colors[0]);
      grad.addColorStop(0.5, r.colors[1]);
      grad.addColorStop(1, r.colors[2]);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = grad;
      ctx.fillRect(r.x, 0, r.w, height);

      // Top atmospheric glow
      const topGlow = ctx.createLinearGradient(r.x, 0, r.x, height * 0.4);
      topGlow.addColorStop(0, r.accentTop);
      topGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = topGlow;
      ctx.fillRect(r.x, 0, r.w, height * 0.4);

      // Bottom atmospheric depth
      const botGlow = ctx.createLinearGradient(r.x, height * 0.6, r.x, height);
      botGlow.addColorStop(0, "rgba(0,0,0,0)");
      botGlow.addColorStop(1, r.accentBot);
      ctx.fillStyle = botGlow;
      ctx.fillRect(r.x, height * 0.6, r.w, height * 0.4);

      // Soft inner radial atmosphere
      const regionCx = r.x + r.w / 2;
      const regionCy = height / 2;
      const innerGlow = ctx.createRadialGradient(regionCx, regionCy, 0, regionCx, regionCy, r.w * 0.6);
      innerGlow.addColorStop(0, r.accentTop);
      innerGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.ellipse(regionCx, regionCy, r.w * 0.55, height * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // --- Ornate Region Label Banner (auto-sized) ---
      const labelX = r.x + r.w / 2;
      const labelY = 22;

      ctx.save();
      ctx.font = "bold 11px 'bc-novatica-cyr', serif";
      ctx.textAlign = "center";
      (ctx as unknown as Record<string, string>).letterSpacing = "3px";

      // Measure text to auto-size banner
      const textMetrics = ctx.measureText(r.name);
      const bannerW = textMetrics.width + 30;
      const bannerH = 20;
      const bx = labelX - bannerW / 2;
      const by = labelY - bannerH / 2 - 1;

      // Banner shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.moveTo(bx - 12, by + 2);
      ctx.lineTo(bx + 4, by + 2);
      ctx.lineTo(bx + 4, by + bannerH + 2);
      ctx.lineTo(bx - 12, by + bannerH * 0.65 + 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx + bannerW - 4 + 12, by + 2);
      ctx.lineTo(bx + bannerW - 4, by + 2);
      ctx.lineTo(bx + bannerW - 4, by + bannerH + 2);
      ctx.lineTo(bx + bannerW - 4 + 12, by + bannerH * 0.65 + 2);
      ctx.closePath();
      ctx.fill();

      // Left ribbon tail
      const ribbonGrad1 = ctx.createLinearGradient(bx - 10, by, bx + 5, by);
      ribbonGrad1.addColorStop(0, r.colors[2]);
      ribbonGrad1.addColorStop(1, r.colors[1]);
      ctx.fillStyle = ribbonGrad1;
      ctx.beginPath();
      ctx.moveTo(bx - 10, by + 1);
      ctx.lineTo(bx + 5, by + 1);
      ctx.lineTo(bx + 5, by + bannerH - 1);
      ctx.lineTo(bx - 10, by + bannerH * 0.6);
      ctx.closePath();
      ctx.fill();

      // Right ribbon tail
      const ribbonGrad2 = ctx.createLinearGradient(bx + bannerW - 5, by, bx + bannerW + 10, by);
      ribbonGrad2.addColorStop(0, r.colors[1]);
      ribbonGrad2.addColorStop(1, r.colors[2]);
      ctx.fillStyle = ribbonGrad2;
      ctx.beginPath();
      ctx.moveTo(bx + bannerW - 5, by + 1);
      ctx.lineTo(bx + bannerW + 10, by + 1);
      ctx.lineTo(bx + bannerW + 10, by + bannerH * 0.6);
      ctx.lineTo(bx + bannerW - 5, by + bannerH - 1);
      ctx.closePath();
      ctx.fill();

      // Main banner body
      const bannerGrad = ctx.createLinearGradient(bx, by, bx, by + bannerH);
      bannerGrad.addColorStop(0, r.colors[0]);
      bannerGrad.addColorStop(0.3, r.colors[1]);
      bannerGrad.addColorStop(0.7, r.colors[1]);
      bannerGrad.addColorStop(1, r.colors[2]);
      ctx.fillStyle = bannerGrad;
      ctx.fillRect(bx + 2, by, bannerW - 4, bannerH);

      // Banner top highlight edge
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(bx + 2, by, bannerW - 4, 2);

      // Banner bottom shadow edge
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(bx + 2, by + bannerH - 2, bannerW - 4, 2);

      // Gold trim lines
      ctx.strokeStyle = r.labelGlow + "80";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bx + 4, by + 2, bannerW - 8, bannerH - 4);

      // Decorative diamond studs at corners
      const drawDiamond = (dx: number, dy: number, ds: number) => {
        ctx.fillStyle = r.labelColor + "90";
        ctx.beginPath();
        ctx.moveTo(dx, dy - ds);
        ctx.lineTo(dx + ds, dy);
        ctx.lineTo(dx, dy + ds);
        ctx.lineTo(dx - ds, dy);
        ctx.closePath();
        ctx.fill();
      };
      drawDiamond(bx + 8, labelY, 2.5);
      drawDiamond(bx + bannerW - 8, labelY, 2.5);

      // Text glow (use multiple draws instead of expensive shadowBlur)
      ctx.fillStyle = r.labelGlow;
      ctx.globalAlpha = 0.3;
      ctx.fillText(r.name, labelX - 1, labelY + 4);
      ctx.fillText(r.name, labelX + 1, labelY + 4);
      ctx.fillText(r.name, labelX, labelY + 3);
      ctx.fillText(r.name, labelX, labelY + 5);
      ctx.globalAlpha = 1;

      // Text shadow for depth
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillText(r.name, labelX + 0.5, labelY + 4.5);

      // Main text
      ctx.fillStyle = r.labelColor;
      ctx.fillText(r.name, labelX, labelY + 4);

      // Main text
      ctx.fillStyle = r.labelColor;
      ctx.fillText(r.name, labelX, labelY + 4);

      ctx.restore();
    });

    // Draw natural fading borders between regions
    drawRuggedBorder(380, "#3d5a2f", "#2a3a2a");
    drawRuggedBorder(720, "#2a3a2a", "#9a8060");
    drawRuggedBorder(1080, "#9a8060", "#5a6a7a");
    drawRuggedBorder(1450, "#5a6a7a", "#5a3030");

    // === ROADS (drawn early so region details layer on top) ===
    const drawRoadSegment = (points: [number, number][]) => {
      if (points.length < 2) return;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Smooth bezier path helper
      const tracePath = (ox: number, oy: number) => {
        ctx.beginPath();
        const pts = points.map((p) => [p[0] + ox, getY(p[1]) + oy]);
        ctx.moveTo(pts[0][0], pts[0][1]);
        if (pts.length === 2) {
          ctx.lineTo(pts[1][0], pts[1][1]);
        } else {
          for (let i = 1; i < pts.length - 1; i++) {
            const cpx = (pts[i][0] + pts[i + 1][0]) / 2;
            const cpy = (pts[i][1] + pts[i + 1][1]) / 2;
            ctx.quadraticCurveTo(pts[i][0], pts[i][1], cpx, cpy);
          }
          ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
        }
      };

      // Region-aware dirt colors
      const avgX = points.reduce((s, p) => s + p[0], 0) / points.length;
      let dirtLight: string, dirtMid: string, dirtDark: string;
      if (avgX < 380) {
        dirtLight = "rgba(105, 85, 55, 0.28)"; dirtMid = "rgba(85, 70, 40, 0.32)";
        dirtDark = "rgba(55, 45, 25, 0.35)";
      } else if (avgX < 720) {
        dirtLight = "rgba(80, 70, 50, 0.3)"; dirtMid = "rgba(60, 55, 38, 0.35)";
        dirtDark = "rgba(40, 35, 22, 0.38)";
      } else if (avgX < 1080) {
        dirtLight = "rgba(130, 105, 65, 0.3)"; dirtMid = "rgba(110, 85, 50, 0.32)";
        dirtDark = "rgba(80, 60, 30, 0.35)";
      } else if (avgX < 1440) {
        dirtLight = "rgba(90, 85, 80, 0.28)"; dirtMid = "rgba(70, 65, 60, 0.32)";
        dirtDark = "rgba(45, 42, 38, 0.35)";
      } else {
        dirtLight = "rgba(70, 45, 35, 0.3)"; dirtMid = "rgba(55, 30, 22, 0.35)";
        dirtDark = "rgba(35, 18, 12, 0.38)";
      }

      // Ground shadow
      tracePath(2, 3);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
      ctx.lineWidth = 16;
      ctx.stroke();

      // Road bed (dark border)
      tracePath(0, 0);
      ctx.strokeStyle = dirtDark;
      ctx.lineWidth = 13;
      ctx.stroke();

      // Main surface (flat color instead of gradient)
      tracePath(0, 0);
      ctx.strokeStyle = dirtMid;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Worn center highlight
      tracePath(0, 0);
      ctx.strokeStyle = dirtLight;
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.restore();
    };

    // Winding roads with interesting shapes — S-curves, switchbacks, terrain-following
    // Grassland: gentle rolling curves from castle to bridge 1
    drawRoadSegment([
      [70, 50], [95, 47], [125, 42], [160, 38], [195, 40],
      [230, 46], [260, 53], [285, 58], [310, 62], [340, 60], [375, 58],
    ]);
    // Swamp: winding path through marshland, bridge1 end to bridge2
    drawRoadSegment([
      [425, 57], [450, 60], [475, 65], [500, 62], [525, 55],
      [555, 48], [580, 42], [610, 40], [640, 44], [670, 48], [715, 48],
    ]);
    // Desert: sweeping dune-hugging curves, bridge2 end to bridge3
    drawRoadSegment([
      [760, 49], [790, 45], [815, 40], [845, 38], [875, 42],
      [910, 50], [940, 58], [965, 62], [995, 58], [1030, 52], [1075, 55],
    ]);
    // Winter: switchback through mountain pass, bridge3 end to bridge4
    drawRoadSegment([
      [1125, 55], [1155, 50], [1180, 44], [1210, 40], [1240, 44],
      [1270, 52], [1300, 58], [1330, 62], [1360, 58], [1395, 52], [1445, 52],
    ]);
    // Volcanic: treacherous path through lava fields, bridge4 end to enemy castle
    drawRoadSegment([
      [1493, 52], [1515, 48], [1540, 42], [1565, 38], [1590, 42],
      [1620, 50], [1650, 55], [1680, 52], [1710, 46], [1740, 48], [MAP_WIDTH - 70, 50],
    ]);

    // === GRASSLAND DETAILS ===
    // Lush volumetric trees with radial gradient canopies and animated details
    const drawTree = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);

      // Soft ground shadow with depth falloff
      const shadowGrad = ctx.createRadialGradient(x + 4, y + 7, 0, x + 4, y + 7, 18 * scale);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
      shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(x + 4, y + 7, 18 * scale, 6 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Small flowers and mushrooms at the base
      for (let fi = 0; fi < 4; fi++) {
        const fx = x + (seededRandom(x + fi * 13) - 0.5) * 22 * scale;
        const fy = y + 3 + seededRandom(x + fi * 17) * 4;
        const ft = seededRandom(x + fi * 29);
        if (ft < 0.5) {
          ctx.fillStyle = ft < 0.25 ? "#e8e050" : "#e06080";
          ctx.beginPath();
          ctx.arc(fx, fy, 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#2a6a10";
          ctx.fillRect(fx - 0.3, fy, 0.6, 3 * scale);
        } else {
          ctx.fillStyle = "#8a6040";
          ctx.fillRect(fx - 0.5, fy - 1, 1, 2.5 * scale);
          ctx.fillStyle = ft < 0.75 ? "#c04030" : "#d0a050";
          ctx.beginPath();
          ctx.ellipse(fx, fy - 1.5 * scale, 2 * scale, 1.2 * scale, 0, Math.PI, Math.PI * 2);
          ctx.fill();
          if (ft < 0.75) {
            ctx.fillStyle = "#f0e0c0";
            ctx.beginPath();
            ctx.arc(fx - 0.5 * scale, fy - 2 * scale, 0.4 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Rich bark trunk with deep gradient
      const trunkGrad = ctx.createLinearGradient(x - 5 * scale, 0, x + 5 * scale, 0);
      trunkGrad.addColorStop(0, "#2a1008");
      trunkGrad.addColorStop(0.2, "#4a3020");
      trunkGrad.addColorStop(0.5, "#5a4030");
      trunkGrad.addColorStop(0.8, "#3a2518");
      trunkGrad.addColorStop(1, "#1a0a04");
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(x - 4.5 * scale, y + 5);
      ctx.quadraticCurveTo(x - 6 * scale, y - 4 * scale, x - 3.5 * scale, y - 14 * scale);
      ctx.lineTo(x + 3.5 * scale, y - 14 * scale);
      ctx.quadraticCurveTo(x + 6 * scale, y - 4 * scale, x + 4.5 * scale, y + 5);
      ctx.closePath();
      ctx.fill();

      // Bark lines and knot details
      ctx.strokeStyle = "rgba(20,10,0,0.4)";
      ctx.lineWidth = 0.6;
      for (let bi = 0; bi < 4; bi++) {
        const bx = x + (seededRandom(x + bi * 41) - 0.5) * 6 * scale;
        ctx.beginPath();
        ctx.moveTo(bx, y + 4);
        ctx.quadraticCurveTo(bx + (seededRandom(x + bi * 43) - 0.5) * 2 * scale, y - 7 * scale, bx - 1 * scale, y - 12 * scale);
        ctx.stroke();
      }
      ctx.fillStyle = "#2a1808";
      ctx.beginPath();
      ctx.ellipse(x + 1 * scale, y - 4 * scale, 1.5 * scale, 2 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1a0a00";
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Moss patch on trunk
      ctx.fillStyle = "rgba(60,120,40,0.5)";
      ctx.beginPath();
      ctx.ellipse(x - 3 * scale, y - 2 * scale, 2.5 * scale, 3.5 * scale, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Visible branch structure between trunk and canopy
      ctx.strokeStyle = "#3a2515";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(x - 1 * scale, y - 12 * scale);
      ctx.quadraticCurveTo(x - 8 * scale, y - 16 * scale, x - 10 * scale, y - 20 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 1 * scale, y - 13 * scale);
      ctx.quadraticCurveTo(x + 7 * scale, y - 15 * scale, x + 9 * scale, y - 19 * scale);
      ctx.stroke();
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(x, y - 14 * scale);
      ctx.quadraticCurveTo(x + 2 * scale, y - 18 * scale, x + 1 * scale, y - 23 * scale);
      ctx.stroke();

      // Canopy layer 1 - deepest / darkest
      const c1 = ctx.createRadialGradient(x - 3 * scale, y - 22 * scale, 0, x - 3 * scale, y - 22 * scale, 14 * scale);
      c1.addColorStop(0, "#1a4a0a");
      c1.addColorStop(1, "#0d3006");
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.arc(x - 3 * scale, y - 22 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.arc(x + 7 * scale, y - 20 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Canopy layer 2
      const c2 = ctx.createRadialGradient(x, y - 20 * scale, 2 * scale, x, y - 20 * scale, 14 * scale);
      c2.addColorStop(0, "#2d6a18");
      c2.addColorStop(1, "#1a4a0c");
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.arc(x, y - 20 * scale, 14 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Canopy layer 3 - side clusters
      const c3 = ctx.createRadialGradient(x - 7 * scale, y - 17 * scale, 0, x - 7 * scale, y - 17 * scale, 10 * scale);
      c3.addColorStop(0, "#2a6015");
      c3.addColorStop(1, "#1d4a0f");
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.arc(x - 7 * scale, y - 17 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.arc(x + 6 * scale, y - 17 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Canopy layer 4 - highlight clusters
      const c4 = ctx.createRadialGradient(x - 2 * scale, y - 20 * scale, 0, x - 2 * scale, y - 20 * scale, 8 * scale);
      c4.addColorStop(0, "#4a8a30");
      c4.addColorStop(1, "#2d6a18");
      ctx.fillStyle = c4;
      ctx.beginPath();
      ctx.arc(x - 3 * scale, y - 19 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.arc(x + 5 * scale, y - 23 * scale, 7 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Canopy layer 5 - swaying top highlights
      const sway = Math.sin(time * 1.2 + x * 0.1) * 1.5 * scale;
      const c5 = ctx.createRadialGradient(x + sway, y - 24 * scale, 0, x + sway, y - 24 * scale, 6 * scale);
      c5.addColorStop(0, "#5ca040");
      c5.addColorStop(1, "rgba(70,140,45,0)");
      ctx.fillStyle = c5;
      ctx.beginPath();
      ctx.arc(x + sway, y - 24 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Leaf texture with subtle sway animation
      ctx.fillStyle = "#5a9a40";
      for (let li = 0; li < 10; li++) {
        const lSway = Math.sin(time * 1.5 + li * 0.8 + x * 0.05) * 1.0 * scale;
        const lx = x + (seededRandom(x + li * 7) - 0.5) * 20 * scale + lSway;
        const ly = y - 15 * scale - seededRandom(x + li * 7 + 1) * 14 * scale;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 2.2 * scale, 1.4 * scale, seededRandom(x + li * 11) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dappled sunlight spots with animated shimmer
      for (let di = 0; di < 5; di++) {
        const dx = x + (seededRandom(x + di * 23) - 0.5) * 16 * scale;
        const dy = y - 18 * scale - seededRandom(x + di * 29) * 10 * scale;
        const shimmer = 0.12 + Math.sin(time * 2.5 + di * 1.7 + x * 0.1) * 0.08;
        ctx.fillStyle = `rgba(160, 220, 100, ${shimmer})`;
        ctx.beginPath();
        ctx.arc(dx, dy, (2 + seededRandom(x + di * 31)) * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Top highlight rim
      ctx.fillStyle = "rgba(120, 200, 80, 0.1)";
      ctx.beginPath();
      ctx.arc(x + sway * 0.5, y - 26 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    [
      [50, 30],
      [80, 82],
      [150, 22],
      [170, 75],
      [140, 33],
      [238, 55],
      [270, 41],
      [270, 85],
      [320, 25],
      [350, 68],
      [45, 65],
      [130, 90],
      [190, 38],
      [280, 60],
      [360, 45],
    ].forEach(([x, yPct], i) => {
      drawTree(x, yPct, 0.6 + seededRandom(i + 100) * 0.4);
    });

    // Enhanced military camp with canvas texture, campfire embers, and cooking details
    const drawCamp = (cx: number, cyPct: number) => {
      const cy = getY(cyPct);

      // Ground patch / cleared area with radial falloff
      const groundGrad = ctx.createRadialGradient(cx, cy + 8, 0, cx, cy + 8, 38);
      groundGrad.addColorStop(0, "rgba(90, 65, 40, 0.5)");
      groundGrad.addColorStop(0.7, "rgba(70, 55, 35, 0.3)");
      groundGrad.addColorStop(1, "rgba(60, 45, 30, 0)");
      ctx.fillStyle = groundGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 38, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tent shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main tent body with 3D shading
      const tentGrad = ctx.createLinearGradient(cx - 22, cy, cx + 22, cy);
      tentGrad.addColorStop(0, "#3a2a1a");
      tentGrad.addColorStop(0.3, "#6a5a4a");
      tentGrad.addColorStop(0.5, "#7a6a58");
      tentGrad.addColorStop(0.7, "#5a4a3a");
      tentGrad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = tentGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 24, cy + 6);
      ctx.lineTo(cx - 24, cy + 6);
      ctx.closePath();
      ctx.fill();

      // Canvas cross-hatch texture on tent
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 24, cy + 6);
      ctx.lineTo(cx - 24, cy + 6);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 0.4;
      for (let hi = -30; hi < 30; hi += 3) {
        ctx.beginPath();
        ctx.moveTo(cx + hi, cy - 25);
        ctx.lineTo(cx + hi + 15, cy + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + hi, cy - 25);
        ctx.lineTo(cx + hi - 15, cy + 10);
        ctx.stroke();
      }
      ctx.restore();

      // Tent opening with warm inner glow
      const openingGlow = ctx.createRadialGradient(cx, cy + 1, 0, cx, cy + 1, 12);
      openingGlow.addColorStop(0, "rgba(255, 180, 80, 0.3)");
      openingGlow.addColorStop(1, "rgba(255, 120, 40, 0)");
      ctx.fillStyle = openingGlow;
      ctx.beginPath();
      ctx.arc(cx, cy + 1, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1a1008";
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 6);
      ctx.lineTo(cx, cy - 6);
      ctx.lineTo(cx + 6, cy + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255, 160, 60, 0.15)";
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 6);
      ctx.lineTo(cx, cy - 2);
      ctx.lineTo(cx + 4, cy + 6);
      ctx.closePath();
      ctx.fill();

      // Tent seams (ridge + sides)
      ctx.strokeStyle = "rgba(40,25,10,0.5)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx, cy + 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx - 12, cy - 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 12, cy - 7);
      ctx.stroke();

      // Flag pole
      ctx.fillStyle = "#3a2010";
      ctx.fillRect(cx + 20, cy - 28, 2.5, 36);
      // Flag with wave animation
      const fw = Math.sin(time * 3 + cx) * 3;
      const fw2 = Math.sin(time * 3.5 + cx) * 2;
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(cx + 22, cy - 26);
      ctx.quadraticCurveTo(cx + 30, cy - 22 + fw, cx + 38, cy - 18 + fw2);
      ctx.quadraticCurveTo(cx + 30, cy - 14 + fw, cx + 22, cy - 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 24, cy - 18 + fw * 0.5);
      ctx.quadraticCurveTo(cx + 30, cy - 16 + fw * 0.7, cx + 36, cy - 14 + fw2 * 0.8);
      ctx.stroke();
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      ctx.arc(cx + 29, cy - 18 + fw * 0.4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Log seats around fire
      for (let li = 0; li < 3; li++) {
        const logAngle = (li / 3) * Math.PI * 2 + 0.5;
        const lx = cx - 12 + Math.cos(logAngle) * 10;
        const ly = cy + 4 + Math.sin(logAngle) * 4;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(logAngle + Math.PI / 2);
        const logGrad = ctx.createLinearGradient(0, -1.5, 0, 1.5);
        logGrad.addColorStop(0, "#5a4030");
        logGrad.addColorStop(0.5, "#6a5040");
        logGrad.addColorStop(1, "#3a2818");
        ctx.fillStyle = logGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.3;
        ctx.stroke();
        ctx.restore();
      }

      // Campfire ground glow
      const glowGrad = ctx.createRadialGradient(cx - 12, cy + 2, 0, cx - 12, cy + 2, 16);
      glowGrad.addColorStop(0, `rgba(255, 150, 50, ${0.5 + Math.sin(time * 6) * 0.2})`);
      glowGrad.addColorStop(0.5, `rgba(255, 100, 20, ${0.15 + Math.sin(time * 5) * 0.05})`);
      glowGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx - 12, cy + 2, 16, 0, Math.PI * 2);
      ctx.fill();

      // Fire stone ring with individual gradients
      for (let si = 0; si < 7; si++) {
        const angle = (si / 7) * Math.PI * 2;
        const sx = cx - 12 + Math.cos(angle) * 5;
        const sy = cy + 4 + Math.sin(angle) * 2.2;
        const stoneGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 2.5);
        stoneGrad.addColorStop(0, "#5a5050");
        stoneGrad.addColorStop(1, "#3a3030");
        ctx.fillStyle = stoneGrad;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2.8, 1.6, angle * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layered fire flames
      const flameColors = ["#ff4400", "#ff6600", "#ffaa00", "#ffcc00"];
      for (let f = 0; f < 4; f++) {
        const fh = 7 + Math.sin(time * 9 + f * 2.3) * 3;
        const fx = cx - 15 + f * 2.5;
        ctx.fillStyle = flameColors[f];
        ctx.globalAlpha = 0.7 + Math.sin(time * 8 + f * 1.5) * 0.3;
        ctx.beginPath();
        ctx.moveTo(fx - 2, cy + 3);
        ctx.quadraticCurveTo(fx + Math.sin(time * 7 + f) * 1.5, cy - fh, fx + 2, cy + 3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Rising ember particles
      for (let ei = 0; ei < 6; ei++) {
        const age = ((time * 22 + ei * 15) % 35);
        const ey = cy - 2 - age;
        const ex = cx - 12 + Math.sin(time * 2 + ei * 2.1) * (3 + age * 0.15);
        const eAlpha = Math.max(0, 0.8 - age / 35);
        const eSize = Math.max(0.3, 1.2 - age / 40);
        if (eAlpha > 0) {
          ctx.globalAlpha = eAlpha;
          ctx.fillStyle = age < 10 ? "#ffcc00" : "#ff6600";
          ctx.beginPath();
          ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Smoke particles
      for (let si = 0; si < 4; si++) {
        const smokeY = cy - 10 - ((time * 16 + si * 10) % 28);
        const smokeX = cx - 12 + Math.sin(time * 1.3 + si * 1.4) * 5;
        const smokeA = 0.3 - ((time * 16 + si * 10) % 28) / 80;
        if (smokeA > 0) {
          ctx.globalAlpha = smokeA;
          ctx.fillStyle = "#999";
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, 2.5 + si * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Cooking tripod with hanging pot
      ctx.strokeStyle = "#3a2818";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy + 5);
      ctx.lineTo(cx - 12, cy - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 5);
      ctx.lineTo(cx - 12, cy - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 5);
      ctx.lineTo(cx - 12, cy - 8);
      ctx.stroke();
      ctx.fillStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.arc(cx - 12, cy - 3, 3, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(cx - 12, cy - 5, 2.5, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Supply crates with metal bands
      const crateGrad1 = ctx.createLinearGradient(cx + 24, cy + 1, cx + 34, cy + 7);
      crateGrad1.addColorStop(0, "#6a5038");
      crateGrad1.addColorStop(1, "#4a3020");
      ctx.fillStyle = crateGrad1;
      ctx.fillRect(cx + 24, cy + 1, 10, 7);
      ctx.strokeStyle = "#8a8070";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx + 24, cy + 3);
      ctx.lineTo(cx + 34, cy + 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 24, cy + 6);
      ctx.lineTo(cx + 34, cy + 6);
      ctx.stroke();
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(cx + 24, cy + 1, 10, 7);
      // Stacked crate
      const crateGrad2 = ctx.createLinearGradient(cx + 25, cy - 4, cx + 33, cy + 1);
      crateGrad2.addColorStop(0, "#5a4028");
      crateGrad2.addColorStop(1, "#3a2518");
      ctx.fillStyle = crateGrad2;
      ctx.fillRect(cx + 25, cy - 4, 8, 5);
      ctx.strokeStyle = "#8a8070";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(cx + 25, cy - 2);
      ctx.lineTo(cx + 33, cy - 2);
      ctx.stroke();
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(cx + 25, cy - 4, 8, 5);

      // Weapon rack
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(cx - 30, cy, 2, 10);
      ctx.fillRect(cx - 22, cy, 2, 10);
      ctx.fillRect(cx - 31, cy - 2, 12, 2);
      // Spears with metallic heads
      ctx.strokeStyle = "#6a6a6a";
      ctx.lineWidth = 1;
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        ctx.moveTo(cx - 28 + s * 3, cy - 1);
        ctx.lineTo(cx - 28 + s * 3, cy - 12);
        ctx.stroke();
        const spearGrad = ctx.createLinearGradient(cx - 29 + s * 3, cy - 16, cx - 25 + s * 3, cy - 12);
        spearGrad.addColorStop(0, "#b0b0b0");
        spearGrad.addColorStop(1, "#707070");
        ctx.fillStyle = spearGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 29 + s * 3, cy - 12);
        ctx.lineTo(cx - 27 + s * 3, cy - 16);
        ctx.lineTo(cx - 25 + s * 3, cy - 12);
        ctx.fill();
      }
    };
    drawCamp(100, 25);
    drawCamp(180, 55);
    drawCamp(290, 78);
    drawCamp(620, 78);
    drawCamp(540, 28);
    drawCamp(860, 34);
    drawCamp(1020, 75);
    drawCamp(1580, 82);

    // Cylindrical watch tower with ivy, pennant flag, and multi-level windows
    const drawWatchTower = (tx: number, tyPct: number) => {
      const ty = getY(tyPct);

      // Tower shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(tx + 5, ty + 9, 16, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Wide stone foundation
      const baseGrad = ctx.createLinearGradient(tx - 14, ty, tx + 14, ty);
      baseGrad.addColorStop(0, "#2a2020");
      baseGrad.addColorStop(0.5, "#4a3a30");
      baseGrad.addColorStop(1, "#2a2020");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(tx - 14, ty + 6);
      ctx.lineTo(tx + 14, ty + 6);
      ctx.lineTo(tx + 11, ty - 2);
      ctx.lineTo(tx - 11, ty - 2);
      ctx.closePath();
      ctx.fill();

      // Cylindrical tower body with rounded shading
      const towerGrad = ctx.createLinearGradient(tx - 10, 0, tx + 10, 0);
      towerGrad.addColorStop(0, "#3a2a1a");
      towerGrad.addColorStop(0.15, "#4a3a2a");
      towerGrad.addColorStop(0.4, "#6a5a4a");
      towerGrad.addColorStop(0.6, "#7a6a58");
      towerGrad.addColorStop(0.85, "#4a3a2a");
      towerGrad.addColorStop(1, "#2a1a0a");
      ctx.fillStyle = towerGrad;
      ctx.beginPath();
      ctx.moveTo(tx - 10, ty + 2);
      ctx.quadraticCurveTo(tx - 11, ty - 18, tx - 10, ty - 38);
      ctx.lineTo(tx + 10, ty - 38);
      ctx.quadraticCurveTo(tx + 11, ty - 18, tx + 10, ty + 2);
      ctx.closePath();
      ctx.fill();

      // Curved stone mortar lines
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.5;
      for (let row = 0; row < 8; row++) {
        const ry = ty - 35 + row * 5;
        ctx.beginPath();
        ctx.moveTo(tx - 10, ry);
        ctx.quadraticCurveTo(tx, ry + 0.5, tx + 10, ry);
        ctx.stroke();
        for (let col = 0; col < 3; col++) {
          const offset = row % 2 === 0 ? 0 : 3;
          ctx.beginPath();
          ctx.moveTo(tx - 9 + col * 6 + offset, ry);
          ctx.lineTo(tx - 9 + col * 6 + offset, ry + 5);
          ctx.stroke();
        }
      }

      // Ivy / moss growing up left side
      ctx.fillStyle = "rgba(40,100,30,0.6)";
      for (let iv = 0; iv < 10; iv++) {
        const ivyY = ty + 2 - iv * 4.2;
        const ivyX = tx - 9 + Math.sin(iv * 1.3) * 2;
        ctx.beginPath();
        ctx.ellipse(ivyX, ivyY, 3 + Math.sin(iv * 0.7) * 1.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(50,120,35,0.4)";
      for (let iv = 0; iv < 6; iv++) {
        const ivyY = ty - 2 - iv * 6;
        const ivyX = tx - 8 + Math.sin(iv * 1.5 + 0.3) * 2.5;
        ctx.beginPath();
        ctx.ellipse(ivyX - 2, ivyY, 2, 1.2, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(ivyX + 1, ivyY + 1, 1.8, 1, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Platform with 3D overhang
      const platGrad = ctx.createLinearGradient(tx - 14, ty - 45, tx - 14, ty - 38);
      platGrad.addColorStop(0, "#5a4a3a");
      platGrad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = platGrad;
      ctx.fillRect(tx - 14, ty - 45, 28, 10);
      ctx.fillStyle = "#6a5a48";
      ctx.fillRect(tx - 14, ty - 45, 28, 3);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(tx - 14, ty - 38, 28, 2);

      // Crenellations with depth
      for (let ci = 0; ci < 4; ci++) {
        const bx = tx - 13.5 + ci * 7;
        ctx.fillStyle = "#2a1a0a";
        ctx.fillRect(bx + 1, ty - 49, 5, 9);
        const crenGrad = ctx.createLinearGradient(bx, ty - 49, bx + 5, ty - 49);
        crenGrad.addColorStop(0, "#5a4a3a");
        crenGrad.addColorStop(1, "#4a3a2a");
        ctx.fillStyle = crenGrad;
        ctx.fillRect(bx, ty - 49, 4, 8);
        ctx.fillStyle = "#7a6a58";
        ctx.fillRect(bx, ty - 49, 4, 2);
      }

      // Lower window (level 1) with warm flickering glow
      const winGlow1 = ctx.createRadialGradient(tx, ty - 12, 0, tx, ty - 12, 8);
      winGlow1.addColorStop(0, `rgba(255, 200, 100, ${0.5 + Math.sin(time * 2.3 + tx) * 0.25})`);
      winGlow1.addColorStop(1, "rgba(255, 150, 50, 0)");
      ctx.fillStyle = winGlow1;
      ctx.beginPath();
      ctx.arc(tx, ty - 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(tx - 3, ty - 18, 6, 10);
      ctx.fillStyle = `rgba(255, 190, 90, ${0.45 + Math.sin(time * 2.3 + tx) * 0.2})`;
      ctx.fillRect(tx - 2, ty - 17, 4, 8);
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(tx - 0.4, ty - 17, 0.8, 8);
      ctx.fillRect(tx - 2, ty - 13.5, 4, 0.8);

      // Upper window (level 2) with spiral staircase hint
      const winGlow2 = ctx.createRadialGradient(tx, ty - 28, 0, tx, ty - 28, 7);
      winGlow2.addColorStop(0, `rgba(255, 200, 100, ${0.4 + Math.sin(time * 1.8 + tx + 1) * 0.2})`);
      winGlow2.addColorStop(1, "rgba(255, 150, 50, 0)");
      ctx.fillStyle = winGlow2;
      ctx.beginPath();
      ctx.arc(tx, ty - 28, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(tx - 2.5, ty - 33, 5, 8);
      ctx.fillStyle = `rgba(255, 180, 80, ${0.4 + Math.sin(time * 1.8 + tx + 1) * 0.2})`;
      ctx.fillRect(tx - 1.5, ty - 32, 3, 6);
      ctx.strokeStyle = `rgba(180, 120, 50, ${0.2 + Math.sin(time * 1.8 + tx + 1) * 0.1})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(tx, ty - 29, 1.5, 0, Math.PI * 1.3);
      ctx.stroke();

      // Conical roof with shading
      const roofGrad = ctx.createLinearGradient(tx - 10, ty - 62, tx + 10, ty - 48);
      roofGrad.addColorStop(0, "#6a3020");
      roofGrad.addColorStop(0.5, "#8a4030");
      roofGrad.addColorStop(1, "#4a2018");
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 62);
      ctx.lineTo(tx + 12, ty - 48);
      ctx.lineTo(tx - 12, ty - 48);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#9a5040";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 62);
      ctx.lineTo(tx - 12, ty - 48);
      ctx.stroke();

      // Pennant flag at top
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(tx - 0.8, ty - 70, 1.6, 12);
      const pfw = Math.sin(time * 3.5 + tx * 0.5) * 2;
      const pfw2 = Math.sin(time * 4 + tx * 0.5) * 1.5;
      ctx.fillStyle = "#cc3030";
      ctx.beginPath();
      ctx.moveTo(tx + 1, ty - 69);
      ctx.quadraticCurveTo(tx + 8, ty - 67 + pfw, tx + 14, ty - 65 + pfw2);
      ctx.lineTo(tx + 1, ty - 61);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#aa2020";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(tx + 3, ty - 65 + pfw * 0.3);
      ctx.quadraticCurveTo(tx + 8, ty - 64 + pfw * 0.5, tx + 12, ty - 63 + pfw2 * 0.6);
      ctx.stroke();

      // Arched door with wood texture
      ctx.fillStyle = "#1a0a00";
      ctx.beginPath();
      ctx.moveTo(tx - 5, ty + 5);
      ctx.lineTo(tx - 5, ty - 5);
      ctx.arc(tx, ty - 5, 5, Math.PI, 0);
      ctx.lineTo(tx + 5, ty + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#2a1a0a";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(tx - 2, ty + 5);
      ctx.lineTo(tx - 2, ty - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx + 2, ty + 5);
      ctx.lineTo(tx + 2, ty - 4);
      ctx.stroke();
      ctx.fillStyle = "#8a7a60";
      ctx.beginPath();
      ctx.arc(tx + 3, ty - 1, 0.8, 0, Math.PI * 2);
      ctx.fill();
    };
    drawWatchTower(55, 66);
    drawWatchTower(220, 25);
    drawWatchTower(230, 70);
    drawWatchTower(330, 42);
    drawWatchTower(490, 70);
    drawWatchTower(867, 33);
    drawWatchTower(1240, 52);
    drawWatchTower(1180, 25);
    drawWatchTower(1620, 30);

    // Crater with layered depth, scorch marks, pulsing embers, and debris
    const drawCrater = (cx: number, cyPct: number, size: number) => {
      const cy = getY(cyPct);

      // Cracked earth lines radiating outward
      ctx.strokeStyle = "rgba(20,15,5,0.3)";
      ctx.lineWidth = 0.8;
      for (let ci = 0; ci < 8; ci++) {
        const angle = (ci / 8) * Math.PI * 2 + seededRandom(cx + ci * 7) * 0.4;
        const len = size * 1.5 + seededRandom(cx + ci * 11) * size * 0.8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * size * 0.6, cy + Math.sin(angle) * size * 0.25);
        ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len * 0.4);
        ctx.stroke();
        if (seededRandom(cx + ci * 19) > 0.4) {
          const branchAngle = angle + (seededRandom(cx + ci * 23) - 0.5) * 0.8;
          const midX = cx + Math.cos(angle) * len * 0.7;
          const midY = cy + Math.sin(angle) * len * 0.28;
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX + Math.cos(branchAngle) * size * 0.5, midY + Math.sin(branchAngle) * size * 0.2);
          ctx.stroke();
        }
      }

      // Scorch marks radiating outward
      for (let si = 0; si < 6; si++) {
        const angle = (si / 6) * Math.PI * 2 + seededRandom(cx + si * 3) * 0.5;
        const dist = size * 0.9 + seededRandom(cx + si * 5) * size * 0.5;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist * 0.4;
        const scorchGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 0.4);
        scorchGrad.addColorStop(0, "rgba(15,10,5,0.25)");
        scorchGrad.addColorStop(1, "rgba(15,10,5,0)");
        ctx.fillStyle = scorchGrad;
        ctx.beginPath();
        ctx.ellipse(sx, sy, size * 0.4, size * 0.18, angle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer rim (raised edge)
      const rimGrad = ctx.createRadialGradient(cx, cy, size * 0.7, cx, cy, size * 1.3);
      rimGrad.addColorStop(0, "rgba(50,40,25,0)");
      rimGrad.addColorStop(0.5, "rgba(55,42,28,0.5)");
      rimGrad.addColorStop(1, "rgba(40,30,20,0)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, size * 1.3, size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mid ring
      ctx.fillStyle = "#2e2218";
      ctx.beginPath();
      ctx.ellipse(cx, cy, size * 1.0, size * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner ring (deeper)
      ctx.fillStyle = "#221a10";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 1, size * 0.65, size * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Center (darkest, deepest)
      const centerGrad = ctx.createRadialGradient(cx, cy - 1, 0, cx, cy - 1, size * 0.4);
      centerGrad.addColorStop(0, "#0a0805");
      centerGrad.addColorStop(1, "#1a1208");
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 1, size * 0.35, size * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing embers in center that pulse
      const emberPulse = 0.3 + Math.sin(time * 3 + cx * 0.5) * 0.2;
      const emberGrad = ctx.createRadialGradient(cx, cy - 1, 0, cx, cy - 1, size * 0.3);
      emberGrad.addColorStop(0, `rgba(255, 80, 20, ${emberPulse})`);
      emberGrad.addColorStop(0.5, `rgba(200, 50, 10, ${emberPulse * 0.4})`);
      emberGrad.addColorStop(1, "rgba(150, 30, 0, 0)");
      ctx.fillStyle = emberGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 1, size * 0.3, size * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Small pulsing ember dots
      for (let ei = 0; ei < 3; ei++) {
        const edx = cx + (seededRandom(cx + ei * 37) - 0.5) * size * 0.4;
        const edy = cy - 1 + (seededRandom(cx + ei * 41) - 0.5) * size * 0.15;
        const ePulse = 0.5 + Math.sin(time * 4 + ei * 2 + cx * 0.3) * 0.3;
        ctx.fillStyle = `rgba(255, 120, 30, ${ePulse})`;
        ctx.beginPath();
        ctx.arc(edx, edy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Debris / rocks scattered around the rim
      for (let di = 0; di < 6; di++) {
        const dAngle = (di / 6) * Math.PI * 2 + seededRandom(cx + di * 47) * 0.6;
        const dDist = size * 0.9 + seededRandom(cx + di * 53) * size * 0.4;
        const dx = cx + Math.cos(dAngle) * dDist;
        const dy = cy + Math.sin(dAngle) * dDist * 0.42;
        const dSize = 1 + seededRandom(cx + di * 59) * 2;
        const rockGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dSize);
        rockGrad.addColorStop(0, "#5a4a3a");
        rockGrad.addColorStop(1, "#3a2a1a");
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.ellipse(dx, dy, dSize, dSize * 0.7, seededRandom(cx + di * 61) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rim highlight (top edge catching light)
      ctx.strokeStyle = "rgba(80,65,45,0.3)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 1, size * 1.0, size * 0.42, 0, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    };
    drawCrater(180, 60, 15);
    drawCrater(260, 32, 12);
    drawCrater(320, 80, 10);
    drawCrater(600, 45, 18);
    drawCrater(750, 70, 14);
    drawCrater(920, 30, 11);
    drawCrater(980, 65, 14);
    drawCrater(1120, 55, 16);
    drawCrater(1200, 50, 19);
    drawCrater(1290, 25, 19);
    drawCrater(1300, 60, 13);
    drawCrater(1400, 60, 15);
    drawCrater(1500, 75, 12);
    drawCrater(1700, 85, 9);

    // === SWAMP DETAILS ===
    // Dramatically enhanced swamp environment with rich atmosphere
    const drawWillowTree = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);

      // --- Base fog / mist around tree base ---
      for (let f = 0; f < 4; f++) {
        const fogX = x + Math.sin(time * 0.3 + f * 1.7 + x) * 8 * scale;
        const fogY = y + 2 + f * 2 * scale;
        const fogW = 18 * scale + f * 6 * scale;
        const fogH = 4 * scale + f * 2 * scale;
        const fogAlpha = 0.06 - f * 0.012;
        ctx.fillStyle = `rgba(140, 190, 150, ${fogAlpha})`;
        ctx.beginPath();
        ctx.ellipse(fogX, fogY, fogW, fogH, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Murky water reflection shadow ---
      ctx.fillStyle = "rgba(20, 40, 20, 0.4)";
      ctx.beginPath();
      ctx.ellipse(x + 5, y + 4, 16 * scale, 6 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // --- Exposed root system spreading into water with moss ---
      for (let r = 0; r < 7; r++) {
        const rSeed = seededRandom(x * 7 + r * 13);
        const rAngle = ((r - 3) / 3) * 1.1;
        const rLen = (8 + rSeed * 10) * scale;
        const rx1 = x + Math.cos(rAngle - 0.3) * 3 * scale;
        const ry1 = y - 2;
        const rx2 = x + Math.cos(rAngle) * rLen * 0.6;
        const ry2 = y + 2 + rSeed * 3;
        const rx3 = x + Math.cos(rAngle + 0.1) * rLen;
        const ry3 = y + 3 + rSeed * 5;

        // Root stroke
        ctx.strokeStyle = r % 2 === 0 ? "#1a1612" : "#15120e";
        ctx.lineWidth = (2.5 - r * 0.15) * scale;
        ctx.beginPath();
        ctx.moveTo(x + (r - 3) * 1.5 * scale, y - 2);
        ctx.bezierCurveTo(rx1, ry1, rx2, ry2, rx3, ry3);
        ctx.stroke();

        // Moss on roots
        if (r % 2 === 0) {
          ctx.fillStyle = `rgba(60, 110, 50, ${0.35 + rSeed * 0.15})`;
          ctx.beginPath();
          ctx.ellipse(rx2, ry2 - 1, 2.5 * scale, 1.2 * scale, rAngle, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Gnarled, twisted trunk with visible wood grain via bezier curves ---
      const trunkGrad = ctx.createLinearGradient(x - 6 * scale, 0, x + 6 * scale, 0);
      trunkGrad.addColorStop(0, "#080805");
      trunkGrad.addColorStop(0.2, "#161410");
      trunkGrad.addColorStop(0.4, "#1e1c16");
      trunkGrad.addColorStop(0.6, "#141210");
      trunkGrad.addColorStop(0.8, "#0e0d0a");
      trunkGrad.addColorStop(1, "#060604");
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(x - 4 * scale, y);
      ctx.bezierCurveTo(
        x - 8 * scale, y - 6 * scale,
        x - 6 * scale, y - 14 * scale,
        x - 3 * scale, y - 18 * scale
      );
      ctx.bezierCurveTo(
        x - 6 * scale, y - 22 * scale,
        x - 4 * scale, y - 27 * scale,
        x, y - 30 * scale
      );
      ctx.bezierCurveTo(
        x + 4 * scale, y - 27 * scale,
        x + 6 * scale, y - 22 * scale,
        x + 3 * scale, y - 18 * scale
      );
      ctx.bezierCurveTo(
        x + 6 * scale, y - 14 * scale,
        x + 8 * scale, y - 6 * scale,
        x + 4 * scale, y
      );
      ctx.closePath();
      ctx.fill();

      // Wood grain lines along trunk
      ctx.lineWidth = 0.5 * scale;
      for (let g = 0; g < 6; g++) {
        const gx = x + (g - 2.5) * 1.2 * scale;
        const grainAlpha = 0.08 + seededRandom(x + g * 17) * 0.06;
        ctx.strokeStyle = `rgba(255, 240, 200, ${grainAlpha})`;
        ctx.beginPath();
        ctx.moveTo(gx, y - 2 * scale);
        ctx.bezierCurveTo(
          gx - 1.5 * scale, y - 10 * scale,
          gx + 1.5 * scale, y - 20 * scale,
          gx - 0.5 * scale, y - 28 * scale
        );
        ctx.stroke();
      }

      // Bark knots (larger, more detailed)
      const drawKnot = (kx: number, ky: number, kr: number, kAngle: number) => {
        ctx.fillStyle = "#0a0806";
        ctx.beginPath();
        ctx.ellipse(kx, ky, kr * 1.2 * scale, kr * 1.8 * scale, kAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(40, 35, 25, 0.4)";
        ctx.lineWidth = 0.4 * scale;
        ctx.beginPath();
        ctx.ellipse(kx, ky, kr * 0.6 * scale, kr * scale, kAngle, 0, Math.PI * 2);
        ctx.stroke();
      };
      drawKnot(x - 1 * scale, y - 12 * scale, 2, 0.3);
      drawKnot(x + 2 * scale, y - 22 * scale, 1.5, -0.2);
      drawKnot(x - 2 * scale, y - 6 * scale, 1.2, 0.5);

      // --- Bioluminescent mushroom clusters on trunk (simplified, no per-mushroom gradients) ---
      const drawMushroom = (mx: number, my: number, mScale: number, seed: number) => {
        const glowPhase = Math.sin(time * 2.2 + seed * 3.1) * 0.5 + 0.5;
        // Glow halo (flat color)
        ctx.fillStyle = `rgba(80, 220, 120, ${0.08 + glowPhase * 0.1})`;
        ctx.beginPath();
        ctx.arc(mx, my, 5 * mScale * scale, 0, Math.PI * 2);
        ctx.fill();
        // Mushroom stem
        ctx.fillStyle = `rgba(180, 200, 170, ${0.5 + glowPhase * 0.2})`;
        ctx.fillRect(mx - 0.5 * mScale * scale, my, 1 * mScale * scale, 3 * mScale * scale);
        // Mushroom cap
        ctx.fillStyle = `rgba(100, 230, 130, ${0.5 + glowPhase * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(mx, my, 2.5 * mScale * scale, 1.5 * mScale * scale, 0, Math.PI, Math.PI * 2);
        ctx.fill();
      };
      // Cluster of mushrooms at various heights on trunk
      drawMushroom(x + 3.5 * scale, y - 7 * scale, 1.0, x + 1);
      drawMushroom(x + 4.5 * scale, y - 9 * scale, 0.7, x + 2);
      drawMushroom(x - 3 * scale, y - 15 * scale, 0.9, x + 3);
      drawMushroom(x - 4 * scale, y - 13 * scale, 0.6, x + 4);
      drawMushroom(x + 2 * scale, y - 20 * scale, 0.5, x + 5);

      // --- Heavy drooping canopy with 6 layered depth shade layers ---
      // Layer 1 (deepest/darkest back)
      ctx.fillStyle = "#0e1a0e";
      ctx.beginPath();
      ctx.arc(x - 6 * scale, y - 30 * scale, 14 * scale, 0, Math.PI * 2);
      ctx.arc(x + 10 * scale, y - 28 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.arc(x, y - 26 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2
      ctx.fillStyle = "#152215";
      ctx.beginPath();
      ctx.arc(x - 4 * scale, y - 32 * scale, 13 * scale, 0, Math.PI * 2);
      ctx.arc(x + 8 * scale, y - 30 * scale, 11 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Layer 3
      ctx.fillStyle = "#1a2a1a";
      ctx.beginPath();
      ctx.arc(x - 14 * scale, y - 27 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.arc(x + 14 * scale, y - 27 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Layer 4
      ctx.fillStyle = "#243524";
      ctx.beginPath();
      ctx.arc(x, y - 34 * scale, 16 * scale, 0, Math.PI * 2);
      ctx.arc(x - 12 * scale, y - 26 * scale, 11 * scale, 0, Math.PI * 2);
      ctx.arc(x + 12 * scale, y - 26 * scale, 11 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Layer 5 (mid-highlight)
      ctx.fillStyle = "#2e422e";
      ctx.beginPath();
      ctx.arc(x + 2 * scale, y - 36 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.arc(x - 8 * scale, y - 30 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.arc(x + 10 * scale, y - 32 * scale, 7 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Layer 6 (top highlights)
      ctx.fillStyle = "#3a4e3a";
      ctx.beginPath();
      ctx.arc(x + 4 * scale, y - 38 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.arc(x - 6 * scale, y - 34 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // --- Spider webs between branches ---
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 0.3 * scale;
      // Web 1 (left side)
      const webCx1 = x - 10 * scale;
      const webCy1 = y - 28 * scale;
      for (let s = 0; s < 5; s++) {
        const angle = -0.3 + s * 0.35;
        ctx.beginPath();
        ctx.moveTo(webCx1, webCy1);
        ctx.lineTo(webCx1 + Math.cos(angle) * 7 * scale, webCy1 + Math.sin(angle) * 7 * scale);
        ctx.stroke();
      }
      // Web radial rings
      for (let ring = 1; ring <= 3; ring++) {
        ctx.beginPath();
        for (let s = 0; s <= 5; s++) {
          const angle = -0.3 + s * 0.35;
          const rr = ring * 2.2 * scale;
          const px = webCx1 + Math.cos(angle) * rr;
          const py = webCy1 + Math.sin(angle) * rr;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      // Web 2 (right side)
      const webCx2 = x + 9 * scale;
      const webCy2 = y - 26 * scale;
      for (let s = 0; s < 4; s++) {
        const angle = 0.5 + s * 0.4;
        ctx.beginPath();
        ctx.moveTo(webCx2, webCy2);
        ctx.lineTo(webCx2 + Math.cos(angle) * 5 * scale, webCy2 + Math.sin(angle) * 5 * scale);
        ctx.stroke();
      }
      for (let ring = 1; ring <= 2; ring++) {
        ctx.beginPath();
        for (let s = 0; s <= 4; s++) {
          const angle = 0.5 + s * 0.4;
          const rr = ring * 2 * scale;
          const px = webCx2 + Math.cos(angle) * rr;
          const py = webCy2 + Math.sin(angle) * rr;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // --- Much longer, more numerous hanging moss/vines with leaf clusters ---
      ctx.lineWidth = 1.0 * scale;
      for (let i = 0; i < 14; i++) {
        const vx = x - 18 * scale + i * 2.8 * scale;
        const vy = y - 22 * scale + seededRandom(x + i * 3) * 10 * scale;
        const len = 22 * scale + Math.sin(time * 1.5 + i + x) * 5 + seededRandom(x + i) * 14;
        const sway = Math.sin(time * 1.0 + i * 0.6 + x * 0.01) * (3 + i * 0.3);

        // Vine with flat color (was per-vine gradient)
        ctx.strokeStyle = "#1e2e1e";
        ctx.lineWidth = (1.2 - i * 0.04) * scale;

        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.bezierCurveTo(
          vx + sway * 0.3, vy + len * 0.25,
          vx + sway * 0.8, vy + len * 0.55,
          vx + sway * 0.2, vy + len
        );
        ctx.stroke();

        // Leaf clusters at the ends and midpoint
        if (i % 2 === 0) {
          // Mid-vine leaf
          const mlx = vx + sway * 0.55;
          const mly = vy + len * 0.5;
          ctx.fillStyle = "#264a26";
          ctx.beginPath();
          ctx.ellipse(mlx - 1, mly, 1.5 * scale, 2.8 * scale, 0.4 + sway * 0.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#1e3e1e";
          ctx.beginPath();
          ctx.ellipse(mlx + 1.5, mly + 1, 1.2 * scale, 2.2 * scale, -0.3 + sway * 0.03, 0, Math.PI * 2);
          ctx.fill();
        }
        // End leaf cluster
        const elx = vx + sway * 0.2;
        const ely = vy + len;
        ctx.fillStyle = "#2a4a2a";
        ctx.beginPath();
        ctx.ellipse(elx, ely, 2 * scale, 3 * scale, 0.3 + sway * 0.02, 0, Math.PI * 2);
        ctx.fill();
        if (i % 3 === 0) {
          ctx.fillStyle = "#224422";
          ctx.beginPath();
          ctx.ellipse(elx + 1.5, ely - 1, 1.5 * scale, 2.5 * scale, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#1c3a1c";
          ctx.beginPath();
          ctx.ellipse(elx - 1.5, ely + 1, 1.3 * scale, 2 * scale, 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    [
      [410, 30],
      [430, 60],
      [420, 70],
      [450, 80],
      [480, 25],
      [500, 20],
      [640, 55],
      [550, 85],
      [540, 45],
      [580, 35],
      [600, 40],
      [630, 75],
      [680, 75],
      [395, 55],
      [465, 45],
      [570, 75],
      [695, 50],
    ].forEach(([x, yPct], i) => {
      drawWillowTree(x, yPct, 0.7 + seededRandom(i + 500) * 0.4);
    });

    // Swamp pools/puddles — murky water with animated ripples, lily pads, algae, reflections, fish
    const drawSwampPool = (px: number, pyPct: number, psize: number) => {
      const py = getY(pyPct);
      const poolAngle = seededRandom(px) * 0.3;

      // --- Dark murky water base ---
      const poolGrad = ctx.createRadialGradient(px, py, 0, px, py, psize * 1.4);
      poolGrad.addColorStop(0, "rgba(12, 30, 20, 0.75)");
      poolGrad.addColorStop(0.4, "rgba(20, 42, 30, 0.65)");
      poolGrad.addColorStop(0.7, "rgba(30, 52, 35, 0.45)");
      poolGrad.addColorStop(1, "rgba(40, 60, 40, 0.15)");
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, psize * 1.3, psize * 0.5, poolAngle, 0, Math.PI * 2);
      ctx.fill();

      // --- Algae patches (green-yellow tint) ---
      for (let a = 0; a < 3; a++) {
        const ax = px + (seededRandom(px + a * 31) - 0.5) * psize * 1.6;
        const ay = py + (seededRandom(px + a * 47) - 0.5) * psize * 0.3;
        const aw = psize * (0.2 + seededRandom(px + a * 19) * 0.25);
        const ah = aw * 0.4;
        ctx.fillStyle = `rgba(90, 140, 40, ${0.12 + seededRandom(px + a * 53) * 0.08})`;
        ctx.beginPath();
        ctx.ellipse(ax, ay, aw, ah, seededRandom(px + a * 7) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Animated ripple rings expanding outward ---
      for (let r = 0; r < 3; r++) {
        const ripplePhase = ((time * 0.6 + r * 2.1 + px * 0.05) % 4) / 4;
        const rippleR = psize * 0.3 + ripplePhase * psize * 0.8;
        const rippleAlpha = (1 - ripplePhase) * 0.15;
        const rippleCx = px + (seededRandom(px + r * 71) - 0.5) * psize * 0.6;
        const rippleCy = py + (seededRandom(px + r * 37) - 0.5) * psize * 0.15;
        ctx.strokeStyle = `rgba(120, 180, 130, ${rippleAlpha})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.ellipse(rippleCx, rippleCy, rippleR, rippleR * 0.38, poolAngle, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- Reflected tree silhouettes in water (dark, inverted) ---
      ctx.fillStyle = "rgba(10, 20, 10, 0.12)";
      for (let t = 0; t < 2; t++) {
        const tx = px + (t === 0 ? -psize * 0.35 : psize * 0.3);
        const ty = py;
        ctx.beginPath();
        ctx.moveTo(tx - 1.5, ty);
        ctx.lineTo(tx + 1.5, ty);
        ctx.lineTo(tx + 0.5, ty + psize * 0.3);
        ctx.lineTo(tx - 0.5, ty + psize * 0.3);
        ctx.closePath();
        ctx.fill();
        // Reflected canopy blob
        ctx.beginPath();
        ctx.ellipse(tx, ty + psize * 0.05, 4 + t, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Lily pads floating on surface ---
      for (let lp = 0; lp < 3; lp++) {
        const lpSeed = seededRandom(px * 3 + lp * 97);
        const lpx = px + (lpSeed - 0.5) * psize * 1.4;
        const lpy = py + (seededRandom(px + lp * 61) - 0.5) * psize * 0.25;
        const lpR = (2.5 + lpSeed * 2) * (psize / 20);
        const lpAngle = seededRandom(px + lp * 41) * Math.PI * 2;

        // Pad body (circle with notch)
        ctx.fillStyle = `rgba(40, ${100 + Math.floor(lpSeed * 40)}, 45, 0.7)`;
        ctx.beginPath();
        ctx.moveTo(lpx + lpR * Math.cos(lpAngle), lpy + lpR * 0.4 * Math.sin(lpAngle));
        for (let a = 0.15; a <= 1.85; a += 0.05) {
          const angle = lpAngle + a * Math.PI;
          ctx.lineTo(lpx + lpR * Math.cos(angle), lpy + lpR * 0.4 * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
        // Highlight vein
        ctx.strokeStyle = "rgba(80, 160, 70, 0.3)";
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(lpx, lpy);
        ctx.lineTo(lpx + lpR * 0.7 * Math.cos(lpAngle + Math.PI), lpy + lpR * 0.28 * Math.sin(lpAngle + Math.PI));
        ctx.stroke();

        // Tiny flower on some lily pads
        if (lp === 0) {
          const flx = lpx + Math.cos(lpAngle + 1) * lpR * 0.3;
          const fly = lpy + Math.sin(lpAngle + 1) * lpR * 0.12;
          // Petals
          for (let p = 0; p < 5; p++) {
            const pa = (p / 5) * Math.PI * 2;
            ctx.fillStyle = "rgba(255, 220, 240, 0.6)";
            ctx.beginPath();
            ctx.ellipse(
              flx + Math.cos(pa) * 1.2, fly + Math.sin(pa) * 0.5,
              1.0, 0.5, pa, 0, Math.PI * 2
            );
            ctx.fill();
          }
          // Center
          ctx.fillStyle = "rgba(255, 230, 80, 0.7)";
          ctx.beginPath();
          ctx.arc(flx, fly, 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Occasional fish shadow moving under surface ---
      const fishPhase = (time * 0.4 + px * 0.02) % 6;
      if (fishPhase < 4) {
        const fishProgress = fishPhase / 4;
        const fishX = px - psize * 0.8 + fishProgress * psize * 1.6;
        const fishY = py + Math.sin(fishProgress * Math.PI * 2) * psize * 0.08;
        const fishAlpha = Math.sin(fishProgress * Math.PI) * 0.18;
        ctx.fillStyle = `rgba(15, 30, 20, ${fishAlpha})`;
        ctx.beginPath();
        ctx.ellipse(fishX, fishY, 3.5, 1.2, fishProgress * 0.3 - 0.15, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(fishX - 3.5, fishY);
        ctx.lineTo(fishX - 5.5, fishY - 1.5);
        ctx.lineTo(fishX - 5.5, fishY + 1.5);
        ctx.closePath();
        ctx.fill();
      }

      // --- Surface reflection highlight ---
      ctx.fillStyle = `rgba(100, 160, 110, ${0.08 + Math.sin(time * 1.5 + px) * 0.04})`;
      ctx.beginPath();
      ctx.ellipse(px - psize * 0.3, py - psize * 0.1, psize * 0.4, psize * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawSwampPool(425, 50, 20);
    drawSwampPool(515, 65, 25);
    drawSwampPool(605, 50, 18);
    drawSwampPool(660, 40, 22);

    // Swamp Gas Bubbles — multiple sizes, toxic glow, pop animation
    const drawSwampGas = (x: number, yPct: number) => {
      const y = getY(yPct);
      const tOffset = x * 0.1;

      // Draw 3 bubbles per source at different phases
      for (let b = 0; b < 3; b++) {
        const bSeed = seededRandom(x + b * 77);
        const speed = 18 + b * 6;
        const cycleLen = 35 + b * 10;
        const phase = ((time * speed + tOffset * 50 + b * 40) % cycleLen) / cycleLen;
        const bubbleY = y - phase * 32;
        const bubbleX = x + Math.sin(time * 3 + b * 2.1 + x) * 2;
        const bubbleR = (1.2 + bSeed * 2.5) * (1 - phase * 0.3);
        const opacity = (1 - phase);

        // Pop splash at the top
        if (phase > 0.9) {
          const popProgress = (phase - 0.9) / 0.1;
          const popAlpha = (1 - popProgress) * 0.35;
          ctx.strokeStyle = `rgba(120, 255, 140, ${popAlpha})`;
          ctx.lineWidth = 0.4;
          for (let sp = 0; sp < 4; sp++) {
            const spAngle = (sp / 4) * Math.PI * 2 + time;
            const spR = popProgress * 5;
            ctx.beginPath();
            ctx.moveTo(bubbleX + Math.cos(spAngle) * spR * 0.3, bubbleY + Math.sin(spAngle) * spR * 0.3);
            ctx.lineTo(bubbleX + Math.cos(spAngle) * spR, bubbleY + Math.sin(spAngle) * spR);
            ctx.stroke();
          }
        }

        // Greenish toxic glow halo around bubble
        const glowGrad = ctx.createRadialGradient(bubbleX, bubbleY, 0, bubbleX, bubbleY, bubbleR * 3.5);
        glowGrad.addColorStop(0, `rgba(100, 255, 120, ${opacity * 0.2})`);
        glowGrad.addColorStop(0.5, `rgba(80, 220, 100, ${opacity * 0.08})`);
        glowGrad.addColorStop(1, "rgba(60, 180, 80, 0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleR * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Bubble body
        if (phase < 0.92) {
          ctx.fillStyle = `rgba(100, 255, 120, ${opacity * 0.3})`;
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, bubbleR, 0, Math.PI * 2);
          ctx.fill();
          // Bubble highlight
          ctx.fillStyle = `rgba(180, 255, 200, ${opacity * 0.25})`;
          ctx.beginPath();
          ctx.arc(bubbleX - bubbleR * 0.3, bubbleY - bubbleR * 0.3, bubbleR * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    for (let i = 0; i < 15; i++) {
      drawSwampGas(
        400 + seededRandom(i * 55) * 300,
        30 + seededRandom(i * 22) * 60
      );
    }

    // Fireflies — figure-8 flight, trailing light, warm glow halos
    const drawFireflies = (xBase: number, yPct: number) => {
      const yBase = getY(yPct);
      const t = time * 0.8 + xBase * 0.1;

      // Figure-8 flight pattern (lemniscate)
      const loopScale = 18;
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const fx = xBase + (loopScale * Math.cos(t)) / denom;
      const fy = yBase + (loopScale * Math.sin(t) * Math.cos(t)) / denom * 0.6;

      const glow = 0.5 + Math.sin(time * 4.5 + xBase * 0.3) * 0.5;

      // Fading trail behind the firefly
      for (let trail = 1; trail <= 5; trail++) {
        const tPast = t - trail * 0.12;
        const denomP = 1 + Math.sin(tPast) * Math.sin(tPast);
        const tx = xBase + (loopScale * Math.cos(tPast)) / denomP;
        const ty = yBase + (loopScale * Math.sin(tPast) * Math.cos(tPast)) / denomP * 0.6;
        const trailAlpha = glow * (1 - trail / 6) * 0.35;
        ctx.fillStyle = `rgba(210, 255, 120, ${trailAlpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.2 - trail * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warm glow halo
      const haloGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 6);
      haloGrad.addColorStop(0, `rgba(220, 255, 120, ${glow * 0.5})`);
      haloGrad.addColorStop(0.4, `rgba(200, 240, 100, ${glow * 0.15})`);
      haloGrad.addColorStop(1, "rgba(180, 220, 80, 0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Firefly body
      ctx.fillStyle = `rgba(220, 255, 120, ${glow})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    };
    for (let i = 0; i < 10; i++) {
      drawFireflies(
        400 + seededRandom(i * 99) * 320,
        20 + seededRandom(i * 88) * 70
      );
    }

    // Low Mist — subtle wisps hugging the ground
    for (let layer = 0; layer < 3; layer++) {
      const layerSpeed = 0.08 + layer * 0.03;
      const layerDrift = layer % 2 === 0 ? 1 : -1;
      const mistAlpha = 0.012 + layer * 0.006;

      for (let i = 0; i < 5; i++) {
        const drift = Math.sin(time * layerSpeed * layerDrift + i * 1.3 + layer * 0.9) * (20 + layer * 8);
        const mx = 380 + drift + i * 55;
        const yOffset = Math.cos(time * (layerSpeed * 1.4) + i * 0.7 + layer * 0.5) * 4;
        const my = getY(55 + layer * 10 + yOffset);
        const mw = 30 + layer * 10 + seededRandom(i + layer * 20) * 20;
        const mh = 6 + layer * 2 + seededRandom(i + layer * 20 + 1) * 4;

        ctx.fillStyle = `rgba(130, 170, 140, ${mistAlpha})`;
        ctx.beginPath();
        ctx.ellipse(mx, my, mw, mh, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // === SAHARA SANDS DETAILS === (Enhanced Desert Environment)

    // Smooth flowing sand dune with wind-carved ridgeline, grain texture, and footprint trails
    const drawSandDune = (dx: number, dyPct: number, width: number, heightPx: number, colorLight: string, colorMid: string, colorDark: string) => {
      const dy = getY(dyPct);
      const isoDepth = heightPx * 0.4;

      // Soft shadow underneath
      ctx.save();
      ctx.fillStyle = "rgba(80, 60, 40, 0.25)";
      ctx.beginPath();
      ctx.ellipse(dx + width * 0.1, dy + isoDepth * 0.4, width * 0.6, isoDepth * 0.6, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Back face (lee side) with deep shadow gradient
      const leeShadow = ctx.createLinearGradient(dx + width * 0.1, dy - heightPx, dx + width * 0.5, dy + isoDepth);
      leeShadow.addColorStop(0, colorDark);
      leeShadow.addColorStop(0.4, colorMid);
      leeShadow.addColorStop(1, "rgba(90, 70, 50, 0.8)");
      ctx.fillStyle = leeShadow;
      ctx.beginPath();
      ctx.moveTo(dx + width * 0.1, dy - heightPx);
      ctx.bezierCurveTo(dx + width * 0.25, dy - heightPx * 0.7, dx + width * 0.4, dy - heightPx * 0.3, dx + width * 0.5, dy);
      ctx.lineTo(dx + width * 0.5, dy + isoDepth * 0.3);
      ctx.bezierCurveTo(dx + width * 0.35, dy + isoDepth * 0.45, dx + width * 0.2, dy + isoDepth * 0.5, dx + width * 0.1, dy + isoDepth * 0.3);
      ctx.lineTo(dx + width * 0.1, dy - heightPx);
      ctx.closePath();
      ctx.fill();

      // Front face (lit side) with smooth flowing gradient
      const duneGrad = ctx.createLinearGradient(dx - width * 0.4, dy - heightPx, dx + width * 0.2, dy + isoDepth);
      duneGrad.addColorStop(0, colorLight);
      duneGrad.addColorStop(0.3, colorLight);
      duneGrad.addColorStop(0.6, colorMid);
      duneGrad.addColorStop(1, colorDark);
      ctx.fillStyle = duneGrad;
      ctx.beginPath();
      ctx.moveTo(dx + width * 0.1, dy - heightPx);
      ctx.bezierCurveTo(dx - width * 0.05, dy - heightPx * 0.75, dx - width * 0.25, dy - heightPx * 0.4, dx - width * 0.4, dy);
      ctx.lineTo(dx - width * 0.4, dy + isoDepth * 0.3);
      ctx.bezierCurveTo(dx - width * 0.2, dy + isoDepth * 0.45, dx, dy + isoDepth * 0.5, dx + width * 0.1, dy + isoDepth * 0.3);
      ctx.lineTo(dx + width * 0.1, dy - heightPx);
      ctx.closePath();
      ctx.fill();

      // Wind-carved ridgeline with glowing highlight
      const ridgeAlpha = 0.5 + Math.sin(time * 0.5 + dx * 0.01) * 0.15;
      ctx.strokeStyle = `rgba(255, 250, 230, ${ridgeAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dx - width * 0.2, dy - heightPx * 0.65);
      ctx.bezierCurveTo(dx - width * 0.08, dy - heightPx * 0.85, dx + width * 0.05, dy - heightPx * 1.02, dx + width * 0.2, dy - heightPx * 0.6);
      ctx.stroke();
      // Secondary thinner ridge highlight
      ctx.strokeStyle = `rgba(255, 245, 210, ${ridgeAlpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dx - width * 0.18, dy - heightPx * 0.58);
      ctx.bezierCurveTo(dx - width * 0.06, dy - heightPx * 0.78, dx + width * 0.06, dy - heightPx * 0.92, dx + width * 0.18, dy - heightPx * 0.52);
      ctx.stroke();

      // Wind ripples (flowing curves on front face)
      ctx.strokeStyle = "rgba(180, 150, 100, 0.18)";
      ctx.lineWidth = 0.7;
      for (let r = 0; r < 5; r++) {
        const rippleY = dy - heightPx * 0.4 + r * (heightPx * 0.15);
        const wavePhase = Math.sin(time * 0.8 + r * 0.5 + dx * 0.02) * 1.5;
        ctx.beginPath();
        ctx.moveTo(dx - width * 0.32 + r * 2, rippleY + wavePhase);
        ctx.bezierCurveTo(
          dx - width * 0.15, rippleY - 2 + wavePhase,
          dx, rippleY + 1 + wavePhase,
          dx + width * 0.08 - r * 1.5, rippleY - 0.5 + wavePhase
        );
        ctx.stroke();
      }

      // Sand grain texture (tiny dots scattered across surface)
      ctx.fillStyle = "rgba(200, 170, 120, 0.25)";
      for (let g = 0; g < 12; g++) {
        const gx = dx - width * 0.3 + seededRandom(dx + g * 7) * width * 0.6;
        const gy = dy - heightPx * 0.6 + seededRandom(dx + g * 13) * heightPx * 0.8;
        ctx.beginPath();
        ctx.arc(gx, gy, 0.5 + seededRandom(dx + g * 17) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wind-blown sand particles streaming off crest
      const windAlpha = 0.15 + Math.sin(time * 1.5 + dx * 0.03) * 0.08;
      ctx.fillStyle = `rgba(220, 195, 150, ${windAlpha})`;
      for (let w = 0; w < 4; w++) {
        const windPhase = (time * 3 + w * 1.7 + dx * 0.05) % 6;
        const wx = dx + width * 0.1 + windPhase * width * 0.08;
        const wy = dy - heightPx + windPhase * 1.5 + Math.sin(windPhase * 2) * 2;
        ctx.beginPath();
        ctx.arc(wx, wy, 0.8 + seededRandom(dx + w) * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Footprint trail in sand (small dots in a winding line)
      ctx.fillStyle = "rgba(140, 115, 80, 0.2)";
      for (let f = 0; f < 6; f++) {
        const fpx = dx - width * 0.25 + f * width * 0.08;
        const fpy = dy - heightPx * 0.15 + Math.sin(f * 0.8) * 1.5;
        ctx.beginPath();
        ctx.ellipse(fpx, fpy, 1.2, 0.7, f * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Back dunes (darker, distant)
    drawSandDune(760, 25, 40, 10, "#c49a6c", "#b08a5c", "#9a7a4c");
    drawSandDune(870, 20, 45, 12, "#c8a070", "#b89060", "#a88050");
    drawSandDune(980, 28, 35, 9, "#c49a6c", "#b08a5c", "#9a7a4c");
    drawSandDune(1050, 22, 32, 8, "#c8a070", "#b89060", "#a88050");
    // Mid dunes
    drawSandDune(800, 45, 48, 12, "#d4aa7a", "#c49a6a", "#b08a5a");
    drawSandDune(920, 50, 42, 11, "#d8b080", "#c8a070", "#b89060");
    drawSandDune(1010, 42, 38, 10, "#d4aa7a", "#c49a6a", "#b08a5a");
    // Front dunes (lighter, closer)
    drawSandDune(750, 75, 35, 9, "#e0be8a", "#d0ae7a", "#c09e6a");
    drawSandDune(860, 80, 40, 10, "#e4c490", "#d4b480", "#c4a470");
    drawSandDune(960, 78, 32, 8, "#e0be8a", "#d0ae7a", "#c09e6a");
    drawSandDune(1040, 82, 28, 7, "#e4c490", "#d4b480", "#c4a470");

    // Majestic Golden Pyramid with stone blocks, hieroglyphics, and light rays
    const drawGoldenPyramid = (px: number, pyPct: number, size: number) => {
      const py = getY(pyPct);
      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(px + size * 0.3, py + 8, size * 1.3, size * 0.35, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Sand accumulated at base
      const sandBaseGrad = ctx.createRadialGradient(px, py + 5, 0, px, py + 5, size * 1.1);
      sandBaseGrad.addColorStop(0, "rgba(210, 180, 130, 0.5)");
      sandBaseGrad.addColorStop(1, "rgba(210, 180, 130, 0)");
      ctx.fillStyle = sandBaseGrad;
      ctx.beginPath();
      ctx.ellipse(px, py + 6, size * 1.1, size * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right face (shadow side)
      const rightGrad = ctx.createLinearGradient(px, py - size * 1.5, px + size, py + 5);
      rightGrad.addColorStop(0, "#a08050");
      rightGrad.addColorStop(0.5, "#8b7040");
      rightGrad.addColorStop(1, "#6b5530");
      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.moveTo(px, py - size * 1.5);
      ctx.lineTo(px + size, py + 5);
      ctx.lineTo(px, py + 5);
      ctx.closePath();
      ctx.fill();

      // Left face (lit side) with gradient
      const leftGrad = ctx.createLinearGradient(px - size, py + 5, px, py - size * 1.5);
      leftGrad.addColorStop(0, "#9a7a50");
      leftGrad.addColorStop(0.3, "#c9a86c");
      leftGrad.addColorStop(0.6, "#e8d4a0");
      leftGrad.addColorStop(1, "#d4b878");
      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.moveTo(px, py - size * 1.5);
      ctx.lineTo(px, py + 5);
      ctx.lineTo(px - size, py + 5);
      ctx.closePath();
      ctx.fill();

      // Stone block pattern with mortar lines (horizontal rows)
      ctx.strokeStyle = "rgba(70, 55, 40, 0.35)";
      ctx.lineWidth = 0.8;
      for (let i = 1; i < 7; i++) {
        const lineY = py + 5 - i * (size * 0.22);
        const widthFrac = 1 - i * 0.14;
        const leftEdge = px - size * widthFrac;
        const rightEdge = px + size * widthFrac;
        // Horizontal mortar line
        ctx.beginPath();
        ctx.moveTo(leftEdge, lineY);
        ctx.lineTo(rightEdge, lineY);
        ctx.stroke();
        // Vertical mortar joints (offset each row)
        const blockCount = Math.max(2, Math.floor(6 - i * 0.7));
        const rowWidth = rightEdge - leftEdge;
        const offsetShift = (i % 2 === 0) ? 0 : rowWidth / (blockCount * 2);
        for (let j = 1; j < blockCount; j++) {
          const jx = leftEdge + offsetShift + j * (rowWidth / blockCount);
          if (jx > leftEdge && jx < rightEdge) {
            ctx.beginPath();
            ctx.moveTo(jx, lineY);
            ctx.lineTo(jx, lineY + size * 0.22);
            ctx.stroke();
          }
        }
      }

      // Hieroglyphic details on the left face (small symbolic marks)
      ctx.strokeStyle = "rgba(60, 45, 30, 0.25)";
      ctx.lineWidth = 0.6;
      const glyphSeeds = [px * 3, px * 7, px * 11, px * 17, px * 23];
      for (let g = 0; g < 5; g++) {
        const glyY = py - size * 0.3 + seededRandom(glyphSeeds[g]) * size * 0.6;
        const glyX = px - size * 0.55 + seededRandom(glyphSeeds[g] + 1) * size * 0.4;
        const glyType = Math.floor(seededRandom(glyphSeeds[g] + 2) * 4);
        ctx.beginPath();
        if (glyType === 0) {
          // Eye of Horus style
          ctx.arc(glyX, glyY, 2, 0, Math.PI * 2);
          ctx.moveTo(glyX + 2, glyY);
          ctx.lineTo(glyX + 4, glyY + 2);
        } else if (glyType === 1) {
          // Ankh style
          ctx.ellipse(glyX, glyY - 2, 1.5, 2, 0, 0, Math.PI * 2);
          ctx.moveTo(glyX, glyY);
          ctx.lineTo(glyX, glyY + 4);
          ctx.moveTo(glyX - 2, glyY + 1.5);
          ctx.lineTo(glyX + 2, glyY + 1.5);
        } else if (glyType === 2) {
          // Bird silhouette
          ctx.moveTo(glyX - 2, glyY);
          ctx.lineTo(glyX, glyY - 2);
          ctx.lineTo(glyX + 2, glyY);
          ctx.lineTo(glyX + 3, glyY + 1);
          ctx.moveTo(glyX, glyY);
          ctx.lineTo(glyX, glyY + 3);
        } else {
          // Wavy water lines
          ctx.moveTo(glyX - 3, glyY);
          ctx.bezierCurveTo(glyX - 1, glyY - 1.5, glyX + 1, glyY + 1.5, glyX + 3, glyY);
          ctx.moveTo(glyX - 3, glyY + 2);
          ctx.bezierCurveTo(glyX - 1, glyY + 0.5, glyX + 1, glyY + 3.5, glyX + 3, glyY + 2);
        }
        ctx.stroke();
      }

      // Golden capstone with animated sparkle/gleam
      const capGlow = 0.75 + Math.sin(time * 2.5) * 0.25;
      const capGrad = ctx.createLinearGradient(px - size * 0.15, py - size * 1.5, px + size * 0.15, py - size * 1.2);
      capGrad.addColorStop(0, `rgba(255, 230, 80, ${capGlow})`);
      capGrad.addColorStop(0.5, `rgba(255, 215, 0, ${capGlow})`);
      capGrad.addColorStop(1, `rgba(200, 170, 0, ${capGlow * 0.8})`);
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.moveTo(px, py - size * 1.5);
      ctx.lineTo(px + size * 0.18, py - size * 1.2);
      ctx.lineTo(px - size * 0.18, py - size * 1.2);
      ctx.closePath();
      ctx.fill();

      // Capstone sparkle star
      const sparkleAlpha = Math.max(0, Math.sin(time * 4 + px * 0.1) * 0.7);
      if (sparkleAlpha > 0.05) {
        ctx.strokeStyle = `rgba(255, 255, 220, ${sparkleAlpha})`;
        ctx.lineWidth = 1;
        const spX = px;
        const spY = py - size * 1.45;
        const spLen = 3 + sparkleAlpha * 4;
        ctx.beginPath();
        ctx.moveTo(spX - spLen, spY); ctx.lineTo(spX + spLen, spY);
        ctx.moveTo(spX, spY - spLen); ctx.lineTo(spX, spY + spLen);
        ctx.moveTo(spX - spLen * 0.6, spY - spLen * 0.6); ctx.lineTo(spX + spLen * 0.6, spY + spLen * 0.6);
        ctx.moveTo(spX + spLen * 0.6, spY - spLen * 0.6); ctx.lineTo(spX - spLen * 0.6, spY + spLen * 0.6);
        ctx.stroke();
      }

      // Light ray emanating from capstone
      const rayAlpha = 0.04 + Math.sin(time * 1.5 + px * 0.05) * 0.025;
      const rayGrad = ctx.createLinearGradient(px, py - size * 1.5, px, py - size * 2.5);
      rayGrad.addColorStop(0, `rgba(255, 230, 100, ${rayAlpha * 2})`);
      rayGrad.addColorStop(1, `rgba(255, 230, 100, 0)`);
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(px - 2, py - size * 1.5);
      ctx.lineTo(px - size * 0.15, py - size * 2.5);
      ctx.lineTo(px + size * 0.15, py - size * 2.5);
      ctx.lineTo(px + 2, py - size * 1.5);
      ctx.closePath();
      ctx.fill();
    };
    drawGoldenPyramid(770, 66, 27);
    drawGoldenPyramid(820, 70, 27);
    drawGoldenPyramid(860, 65, 27);
    drawGoldenPyramid(850, 50, 25);
    drawGoldenPyramid(950, 23, 17);

    drawGoldenPyramid(970, 85, 20);


    drawGoldenPyramid(960, 35, 28);

    // Sphinx statue — weathered, detailed, sand-buried paws
    const drawSphinx = (sx: number, syPct: number, scale: number) => {
      const sy = getY(syPct);
      // Body shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(sx + 5 * scale, sy + 10 * scale, 28 * scale, 7 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sand burying the paws
      const sandBury = ctx.createRadialGradient(sx + 10 * scale, sy + 6 * scale, 0, sx + 10 * scale, sy + 6 * scale, 22 * scale);
      sandBury.addColorStop(0, "rgba(210, 180, 130, 0.6)");
      sandBury.addColorStop(1, "rgba(210, 180, 130, 0)");
      ctx.fillStyle = sandBury;
      ctx.beginPath();
      ctx.ellipse(sx + 10 * scale, sy + 6 * scale, 22 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lion body with detailed gradient
      const bodyGrad = ctx.createLinearGradient(sx - 22 * scale, sy - 8 * scale, sx + 22 * scale, sy + 8 * scale);
      bodyGrad.addColorStop(0, "#8a6a48");
      bodyGrad.addColorStop(0.3, "#c8a878");
      bodyGrad.addColorStop(0.6, "#b89868");
      bodyGrad.addColorStop(1, "#8a6a48");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 22 * scale, 10 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Weathered texture lines (cracks on body)
      ctx.strokeStyle = "rgba(70, 55, 40, 0.2)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c < 5; c++) {
        const cx0 = sx - 15 * scale + seededRandom(sx + c * 7) * 30 * scale;
        const cy0 = sy - 5 * scale + seededRandom(sx + c * 11) * 10 * scale;
        ctx.beginPath();
        ctx.moveTo(cx0, cy0);
        ctx.lineTo(cx0 + (seededRandom(sx + c * 13) - 0.5) * 8 * scale, cy0 + seededRandom(sx + c * 17) * 6 * scale);
        ctx.stroke();
      }

      // Paws (partially buried in sand)
      ctx.fillStyle = "#b89868";
      ctx.beginPath();
      ctx.ellipse(sx + 20 * scale, sy + 4 * scale, 9 * scale, 4.5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Paw detail lines
      ctx.strokeStyle = "rgba(80, 60, 40, 0.3)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(sx + 15 * scale, sy + 4 * scale);
      ctx.lineTo(sx + 25 * scale, sy + 4 * scale);
      ctx.stroke();

      // Human head with better proportions
      const headGrad = ctx.createRadialGradient(sx - 16 * scale, sy - 12 * scale, 0, sx - 16 * scale, sy - 10 * scale, 12 * scale);
      headGrad.addColorStop(0, "#dcc090");
      headGrad.addColorStop(0.7, "#b89868");
      headGrad.addColorStop(1, "#907850");
      ctx.fillStyle = headGrad;
      // Neck connecting head to body
      ctx.beginPath();
      ctx.moveTo(sx - 10 * scale, sy - 4 * scale);
      ctx.quadraticCurveTo(sx - 14 * scale, sy - 8 * scale, sx - 16 * scale, sy - 6 * scale);
      ctx.lineTo(sx - 18 * scale, sy - 2 * scale);
      ctx.closePath();
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.arc(sx - 16 * scale, sy - 10 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Headdress (Nemes) - more detailed with stripes
      ctx.fillStyle = "#c9a050";
      ctx.beginPath();
      ctx.moveTo(sx - 26 * scale, sy - 2 * scale);
      ctx.lineTo(sx - 20 * scale, sy - 20 * scale);
      ctx.lineTo(sx - 8 * scale, sy - 20 * scale);
      ctx.lineTo(sx - 6 * scale, sy - 2 * scale);
      ctx.closePath();
      ctx.fill();
      // Headdress stripes
      ctx.strokeStyle = "rgba(100, 80, 40, 0.4)";
      ctx.lineWidth = 0.7;
      for (let hs = 0; hs < 3; hs++) {
        const hsX = sx - 22 * scale + hs * 5 * scale;
        ctx.beginPath();
        ctx.moveTo(hsX, sy - 3 * scale);
        ctx.lineTo(hsX + 3 * scale, sy - 18 * scale);
        ctx.stroke();
      }

      // Face — eyes and missing nose area
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.arc(sx - 18 * scale, sy - 12 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx - 13 * scale, sy - 12 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Missing nose — small weathered indent
      ctx.fillStyle = "rgba(100, 80, 55, 0.5)";
      ctx.beginPath();
      ctx.ellipse(sx - 15.5 * scale, sy - 9.5 * scale, 1.5 * scale, 1 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Mouth line
      ctx.strokeStyle = "rgba(80, 60, 40, 0.4)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(sx - 19 * scale, sy - 7 * scale);
      ctx.quadraticCurveTo(sx - 15.5 * scale, sy - 6 * scale, sx - 12 * scale, sy - 7 * scale);
      ctx.stroke();

      // Weathering cracks on head
      ctx.strokeStyle = "rgba(80, 60, 40, 0.25)";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(sx - 20 * scale, sy - 8 * scale);
      ctx.lineTo(sx - 17 * scale, sy - 6 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx - 11 * scale, sy - 14 * scale);
      ctx.lineTo(sx - 13 * scale, sy - 11 * scale);
      ctx.stroke();
    };
    drawSphinx(920, 68, 0.8);

    // Palm tree — curved trunk with ring segments, individual swaying fronds, coconuts, fallen fronds
    const drawPalmTree = (tx: number, tyPct: number, scale: number) => {
      const ty = getY(tyPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(tx + 10 * scale, ty + 5 * scale, 18 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Fallen palm fronds on ground
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = "#4a7a30";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(tx - 8 * scale, ty + 3 * scale);
      ctx.quadraticCurveTo(tx - 2 * scale, ty + 1 * scale, tx + 6 * scale, ty + 4 * scale);
      ctx.stroke();
      ctx.strokeStyle = "#3a6a25";
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(tx + 12 * scale, ty + 2 * scale);
      ctx.quadraticCurveTo(tx + 18 * scale, ty + 0, tx + 22 * scale, ty + 3 * scale);
      ctx.stroke();
      ctx.restore();

      // Curved trunk with gradient
      const trunkGrad = ctx.createLinearGradient(tx - 4 * scale, ty, tx + 4 * scale, ty);
      trunkGrad.addColorStop(0, "#4a3518");
      trunkGrad.addColorStop(0.3, "#8a6840");
      trunkGrad.addColorStop(0.7, "#6a5030");
      trunkGrad.addColorStop(1, "#4a3518");
      ctx.strokeStyle = trunkGrad;
      ctx.lineWidth = 6 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.bezierCurveTo(tx + 4 * scale, ty - 12 * scale, tx + 10 * scale, ty - 25 * scale, tx + 4 * scale, ty - 40 * scale);
      ctx.stroke();

      // Distinct ring segments on trunk
      ctx.strokeStyle = "#3a2510";
      ctx.lineWidth = 1.2;
      for (let r = 0; r < 8; r++) {
        const t = r / 8;
        const ringX = tx + (1 - t) * 0 + t * 4 * scale + Math.sin(t * Math.PI) * 6 * scale;
        const ringY = ty - t * 40 * scale;
        const ringW = (3.5 - t * 0.8) * scale;
        ctx.beginPath();
        ctx.arc(ringX, ringY, ringW, 0, Math.PI);
        ctx.stroke();
        // Lighter highlight on ring
        ctx.strokeStyle = "rgba(160, 130, 80, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(ringX, ringY, ringW, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#3a2510";
        ctx.lineWidth = 1.2;
      }

      // Palm fronds — individual fronds that sway independently
      const frondColors = ["#1d6b2c", "#2d8b3c", "#1a6028", "#2d8b3c", "#1d6b2c", "#258533"];
      const frondAngles = [-1.0, -0.5, -0.1, 0.3, 0.7, 1.2];
      const frondLengths = [1.0, 1.1, 0.9, 1.05, 1.0, 0.85];
      frondAngles.forEach((angle, i) => {
        const sway = Math.sin(time * 1.2 + i * 1.1) * 0.06 + Math.sin(time * 2.5 + i * 0.7) * 0.03;
        ctx.save();
        ctx.translate(tx + 4 * scale, ty - 40 * scale);
        ctx.rotate(angle + sway);
        const len = 30 * scale * frondLengths[i];
        // Frond midrib
        ctx.strokeStyle = "#1a5020";
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(len * 0.5, -6 * scale, len, 4 * scale);
        ctx.stroke();
        // Frond leaf shape
        ctx.fillStyle = frondColors[i];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(len * 0.3, -9 * scale, len, 3 * scale);
        ctx.quadraticCurveTo(len * 0.3, -1 * scale, 0, 0);
        ctx.fill();
        // Individual leaflet notches
        ctx.strokeStyle = "rgba(10, 50, 15, 0.3)";
        ctx.lineWidth = 0.4;
        for (let n = 0; n < 5; n++) {
          const nt = (n + 1) / 6;
          const nx = nt * len * 0.9;
          const ny = -6 * scale * (1 - nt) + 3 * scale * nt;
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(nx + 3 * scale, ny - 3 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(nx + 3 * scale, ny + 2 * scale);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Coconut cluster with shadow
      ctx.fillStyle = "#3a2a18";
      ctx.beginPath();
      ctx.arc(tx + 3 * scale, ty - 38 * scale, 3.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4a3520";
      ctx.beginPath();
      ctx.arc(tx + 7 * scale, ty - 37 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a4028";
      ctx.beginPath();
      ctx.arc(tx + 5 * scale, ty - 39.5 * scale, 2.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Coconut highlights
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.arc(tx + 2.5 * scale, ty - 39 * scale, 1 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx + 6.5 * scale, ty - 38 * scale, 1 * scale, 0, Math.PI * 2);
      ctx.fill();
    };

    // Oasis — crystal clear water with depth gradient, sparkles, reeds, birds
    const drawOasis = (ox: number, oyPct: number, size: number) => {
      const oy = getY(oyPct);

      // Mud/dirt rim around oasis
      const rimGrad = ctx.createRadialGradient(ox, oy, size * 0.85, ox, oy, size * 1.25);
      rimGrad.addColorStop(0, "rgba(120, 95, 60, 0.5)");
      rimGrad.addColorStop(1, "rgba(120, 95, 60, 0)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.ellipse(ox, oy, size * 1.25, size * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();

      // Grass/vegetation border ring
      ctx.fillStyle = "#4a8a3a";
      for (let g = 0; g < 18; g++) {
        const gAngle = (g / 18) * Math.PI * 2;
        const gx = ox + Math.cos(gAngle) * size * 1.08;
        const gy = oy + Math.sin(gAngle) * size * 0.44;
        ctx.beginPath();
        ctx.moveTo(gx - 2, gy + 2);
        ctx.lineTo(gx + Math.sin(time * 2.5 + g * 0.8) * 1.5, gy - 7 - Math.sin(time * 3 + g) * 2);
        ctx.lineTo(gx + 2, gy + 2);
        ctx.fill();
      }

      // Water with crystal-clear depth gradient
      const waterGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);
      waterGrad.addColorStop(0, `rgba(30, 100, 140, ${0.85 + Math.sin(time * 2) * 0.05})`);
      waterGrad.addColorStop(0.3, `rgba(40, 140, 180, ${0.8 + Math.sin(time * 2.2) * 0.05})`);
      waterGrad.addColorStop(0.7, `rgba(60, 170, 200, ${0.7 + Math.sin(time * 2.5) * 0.05})`);
      waterGrad.addColorStop(1, `rgba(100, 200, 220, 0.4)`);
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.ellipse(ox, oy, size, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shallow edge highlight
      ctx.strokeStyle = "rgba(150, 220, 240, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ox, oy, size * 0.92, size * 0.37, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Animated water sparkles (twinkling)
      for (let s = 0; s < 8; s++) {
        const sparkPhase = Math.sin(time * 5 + s * 1.7 + ox * 0.1);
        const sparkAlpha = Math.max(0, sparkPhase * 0.5 + 0.1);
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha})`;
        const sparkX = ox - size * 0.6 + seededRandom(ox + s) * size * 1.2;
        const sparkY = oy - size * 0.15 + seededRandom(ox + s + 10) * size * 0.3;
        const sparkSize = 1 + sparkAlpha * 2;
        // Star-shaped sparkle
        ctx.beginPath();
        ctx.moveTo(sparkX - sparkSize, sparkY);
        ctx.lineTo(sparkX, sparkY - sparkSize * 0.6);
        ctx.lineTo(sparkX + sparkSize, sparkY);
        ctx.lineTo(sparkX, sparkY + sparkSize * 0.6);
        ctx.closePath();
        ctx.fill();
      }

      // Reeds/cattails at edges swaying
      for (let r = 0; r < 6; r++) {
        const rAngle = (r / 6) * Math.PI + 0.3;
        const rx = ox + Math.cos(rAngle) * size * 0.95;
        const ry = oy + Math.sin(rAngle) * size * 0.38;
        const reedSway = Math.sin(time * 2 + r * 1.2) * 2;
        // Reed stem
        ctx.strokeStyle = "#3a6a28";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.quadraticCurveTo(rx + reedSway, ry - 10, rx + reedSway * 1.3, ry - 16);
        ctx.stroke();
        // Cattail head
        ctx.fillStyle = "#5a3a1a";
        ctx.beginPath();
        ctx.ellipse(rx + reedSway * 1.3, ry - 17, 1.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Small birds drinking at water edge
      const birdTime = time * 0.8;
      for (let b = 0; b < 2; b++) {
        const bAngle = b * 2.5 + 0.5;
        const bx = ox + Math.cos(bAngle) * size * 0.8;
        const by = oy + Math.sin(bAngle) * size * 0.32;
        const headDip = Math.sin(birdTime + b * 3) * 2;
        ctx.fillStyle = "#5a4a3a";
        // Bird body
        ctx.beginPath();
        ctx.ellipse(bx, by - 2, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head (dipping to drink)
        ctx.beginPath();
        ctx.arc(bx + 2.5, by - 2 + Math.max(0, headDip), 1.2, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.strokeStyle = "#8a6a30";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(bx + 3.5, by - 2 + Math.max(0, headDip));
        ctx.lineTo(bx + 5, by - 1 + Math.max(0, headDip));
        ctx.stroke();
      }
    };
    drawOasis(780, 42, 25);
    drawPalmTree(765, 40, 0.7);
    drawPalmTree(795, 44, 0.6);
    drawPalmTree(778, 38, 0.8);

    // Saguaro cactus — better proportioned, visible spines, multiple bloom flowers
    const drawDesertCactus = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.ellipse(x + 4 * scale, y + 3 * scale, 10 * scale, 3.5 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Main stem with cylindrical gradient
      const cactusGrad = ctx.createLinearGradient(x - 5 * scale, y, x + 5 * scale, y);
      cactusGrad.addColorStop(0, "#1a5a2a");
      cactusGrad.addColorStop(0.25, "#2a7a38");
      cactusGrad.addColorStop(0.5, "#3a8a4a");
      cactusGrad.addColorStop(0.75, "#2a7a38");
      cactusGrad.addColorStop(1, "#1a5a2a");
      ctx.fillStyle = cactusGrad;

      // Main body — rounder saguaro shape
      ctx.beginPath();
      ctx.moveTo(x - 5 * scale, y);
      ctx.bezierCurveTo(x - 6 * scale, y - 10 * scale, x - 5.5 * scale, y - 22 * scale, x - 4 * scale, y - 30 * scale);
      ctx.quadraticCurveTo(x, y - 34 * scale, x + 4 * scale, y - 30 * scale);
      ctx.bezierCurveTo(x + 5.5 * scale, y - 22 * scale, x + 6 * scale, y - 10 * scale, x + 5 * scale, y);
      ctx.closePath();
      ctx.fill();

      // Left arm — better proportioned
      const armGradL = ctx.createLinearGradient(x - 14 * scale, y - 18 * scale, x - 8 * scale, y - 18 * scale);
      armGradL.addColorStop(0, "#1a5a2a");
      armGradL.addColorStop(0.5, "#2d7a3a");
      armGradL.addColorStop(1, "#1a5a2a");
      ctx.fillStyle = armGradL;
      ctx.beginPath();
      ctx.moveTo(x - 4 * scale, y - 17 * scale);
      ctx.quadraticCurveTo(x - 12 * scale, y - 16 * scale, x - 13 * scale, y - 22 * scale);
      ctx.bezierCurveTo(x - 14 * scale, y - 28 * scale, x - 12 * scale, y - 31 * scale, x - 10 * scale, y - 30 * scale);
      ctx.quadraticCurveTo(x - 9 * scale, y - 27 * scale, x - 8 * scale, y - 22 * scale);
      ctx.quadraticCurveTo(x - 7 * scale, y - 19 * scale, x - 4 * scale, y - 21 * scale);
      ctx.closePath();
      ctx.fill();

      // Right arm — better proportioned
      const armGradR = ctx.createLinearGradient(x + 8 * scale, y - 12 * scale, x + 14 * scale, y - 12 * scale);
      armGradR.addColorStop(0, "#1a5a2a");
      armGradR.addColorStop(0.5, "#2d7a3a");
      armGradR.addColorStop(1, "#1a5a2a");
      ctx.fillStyle = armGradR;
      ctx.beginPath();
      ctx.moveTo(x + 4 * scale, y - 11 * scale);
      ctx.quadraticCurveTo(x + 10 * scale, y - 10 * scale, x + 11 * scale, y - 16 * scale);
      ctx.bezierCurveTo(x + 12 * scale, y - 22 * scale, x + 10 * scale, y - 25 * scale, x + 8 * scale, y - 24 * scale);
      ctx.quadraticCurveTo(x + 7 * scale, y - 20 * scale, x + 6 * scale, y - 16 * scale);
      ctx.quadraticCurveTo(x + 5 * scale, y - 13 * scale, x + 4 * scale, y - 15 * scale);
      ctx.closePath();
      ctx.fill();

      // Ridges on main body
      ctx.strokeStyle = "rgba(15, 60, 20, 0.3)";
      ctx.lineWidth = 0.5;
      for (let r = -2; r <= 2; r++) {
        ctx.beginPath();
        ctx.moveTo(x + r * 1.5 * scale, y - 1 * scale);
        ctx.bezierCurveTo(x + r * 1.4 * scale, y - 10 * scale, x + r * 1.2 * scale, y - 20 * scale, x + r * 0.8 * scale, y - 29 * scale);
        ctx.stroke();
      }

      // Visible spines — small lines radiating outward
      ctx.strokeStyle = "rgba(220, 210, 180, 0.5)";
      ctx.lineWidth = 0.4;
      for (let sp = 0; sp < 16; sp++) {
        const spY = y - 3 * scale - sp * 1.9 * scale;
        const bodyWidth = 5 * scale * (1 - Math.abs((sp * 1.9 * scale) - 15 * scale) / (16 * scale));
        // Left spines
        ctx.beginPath();
        ctx.moveTo(x - bodyWidth, spY);
        ctx.lineTo(x - bodyWidth - 2.5 * scale, spY - 0.5 * scale);
        ctx.stroke();
        // Right spines
        ctx.beginPath();
        ctx.moveTo(x + bodyWidth, spY);
        ctx.lineTo(x + bodyWidth + 2.5 * scale, spY - 0.5 * scale);
        ctx.stroke();
      }
      // Spines on arms
      for (let sp = 0; sp < 4; sp++) {
        const lspY = y - 19 * scale - sp * 3 * scale;
        ctx.beginPath();
        ctx.moveTo(x - 12 * scale, lspY);
        ctx.lineTo(x - 14.5 * scale, lspY - 1 * scale);
        ctx.stroke();
        const rspY = y - 13 * scale - sp * 3 * scale;
        ctx.beginPath();
        ctx.moveTo(x + 10 * scale, rspY);
        ctx.lineTo(x + 12.5 * scale, rspY - 1 * scale);
        ctx.stroke();
      }

      // Multiple bloom flowers in different colors
      const flowerColors = [
        { outer: "#ff6b9d", inner: "#ffcc00" },
        { outer: "#ff9f43", inner: "#ffe066" },
        { outer: "#ee5a80", inner: "#ffb6c1" },
      ];
      // Top flower
      const fc0 = flowerColors[Math.floor(seededRandom(x + 1) * 3)];
      for (let p = 0; p < 5; p++) {
        const pAngle = (p / 5) * Math.PI * 2 + time * 0.3;
        ctx.fillStyle = fc0.outer;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(pAngle) * 2.5 * scale, y - 32 * scale + Math.sin(pAngle) * 2 * scale, 2 * scale, 1.2 * scale, pAngle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = fc0.inner;
      ctx.beginPath();
      ctx.arc(x, y - 32 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Left arm flower
      const fc1 = flowerColors[Math.floor(seededRandom(x + 5) * 3)];
      for (let p = 0; p < 4; p++) {
        const pAngle = (p / 4) * Math.PI * 2 + time * 0.2;
        ctx.fillStyle = fc1.outer;
        ctx.beginPath();
        ctx.ellipse(x - 10 * scale + Math.cos(pAngle) * 2 * scale, y - 31 * scale + Math.sin(pAngle) * 1.5 * scale, 1.8 * scale, 1 * scale, pAngle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = fc1.inner;
      ctx.beginPath();
      ctx.arc(x - 10 * scale, y - 31 * scale, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Right arm flower
      const fc2 = flowerColors[Math.floor(seededRandom(x + 9) * 3)];
      for (let p = 0; p < 4; p++) {
        const pAngle = (p / 4) * Math.PI * 2 - time * 0.25;
        ctx.fillStyle = fc2.outer;
        ctx.beginPath();
        ctx.ellipse(x + 8 * scale + Math.cos(pAngle) * 1.8 * scale, y - 25 * scale + Math.sin(pAngle) * 1.3 * scale, 1.5 * scale, 0.9 * scale, pAngle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = fc2.inner;
      ctx.beginPath();
      ctx.arc(x + 8 * scale, y - 25 * scale, 1 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    [
      [840, 60], [890, 25], [950, 75], [1000, 40], [1040, 65], [1060, 30],
    ].forEach(([x, yPct], i) => {
      drawDesertCactus(x, yPct, 0.6 + seededRandom(i + 200) * 0.3);
    });

    // Camel — better anatomy, saddle/cargo, rope lead between caravan
    const drawCamel = (cx: number, cyPct: number, scale: number, facing: number) => {
      const cy = getY(cyPct);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(facing, 1);

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.beginPath();
      ctx.ellipse(0, 12 * scale, 20 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs (back pair, darker)
      ctx.fillStyle = "#9a7048";
      ctx.beginPath();
      ctx.moveTo(-9 * scale, 6 * scale);
      ctx.lineTo(-10 * scale, 16 * scale);
      ctx.lineTo(-7 * scale, 16 * scale);
      ctx.lineTo(-6 * scale, 6 * scale);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-3 * scale, 6 * scale);
      ctx.lineTo(-4 * scale, 15 * scale);
      ctx.lineTo(-1 * scale, 15 * scale);
      ctx.lineTo(0, 6 * scale);
      ctx.fill();
      // Legs (front pair)
      ctx.fillStyle = "#a88050";
      ctx.beginPath();
      ctx.moveTo(5 * scale, 6 * scale);
      ctx.lineTo(4 * scale, 16 * scale);
      ctx.lineTo(7 * scale, 16 * scale);
      ctx.lineTo(8 * scale, 6 * scale);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10 * scale, 5 * scale);
      ctx.lineTo(10 * scale, 15 * scale);
      ctx.lineTo(13 * scale, 15 * scale);
      ctx.lineTo(13 * scale, 5 * scale);
      ctx.fill();
      // Hooves
      ctx.fillStyle = "#4a3520";
      for (const hx of [-10, -4, 4, 10]) {
        ctx.beginPath();
        ctx.ellipse(hx * scale + 1.5 * scale, 16 * scale, 2 * scale, 1 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Body with detailed fur gradient
      const camelGrad = ctx.createLinearGradient(-14 * scale, -8 * scale, 14 * scale, 8 * scale);
      camelGrad.addColorStop(0, "#b89060");
      camelGrad.addColorStop(0.3, "#d4b888");
      camelGrad.addColorStop(0.7, "#c8a878");
      camelGrad.addColorStop(1, "#a88050");
      ctx.fillStyle = camelGrad;
      ctx.beginPath();
      ctx.moveTo(-14 * scale, 2 * scale);
      ctx.bezierCurveTo(-16 * scale, -4 * scale, -12 * scale, -8 * scale, -6 * scale, -8 * scale);
      ctx.lineTo(10 * scale, -6 * scale);
      ctx.bezierCurveTo(14 * scale, -5 * scale, 16 * scale, 0, 14 * scale, 6 * scale);
      ctx.lineTo(-12 * scale, 6 * scale);
      ctx.bezierCurveTo(-15 * scale, 5 * scale, -15 * scale, 3 * scale, -14 * scale, 2 * scale);
      ctx.closePath();
      ctx.fill();

      // Hump — distinct shape
      ctx.fillStyle = "#c4a070";
      ctx.beginPath();
      ctx.moveTo(-8 * scale, -8 * scale);
      ctx.bezierCurveTo(-6 * scale, -18 * scale, 2 * scale, -18 * scale, 4 * scale, -8 * scale);
      ctx.closePath();
      ctx.fill();
      // Hump highlight
      ctx.fillStyle = "rgba(220, 190, 140, 0.3)";
      ctx.beginPath();
      ctx.bezierCurveTo(-4 * scale, -16 * scale, 0, -16 * scale, 2 * scale, -10 * scale);
      ctx.closePath();
      ctx.fill();

      // Belly fur texture
      ctx.strokeStyle = "rgba(160, 120, 70, 0.2)";
      ctx.lineWidth = 0.4;
      for (let bf = 0; bf < 4; bf++) {
        const bfx = -8 * scale + bf * 5 * scale;
        ctx.beginPath();
        ctx.moveTo(bfx, 4 * scale);
        ctx.lineTo(bfx + 1 * scale, 6 * scale);
        ctx.stroke();
      }

      // Neck — curved and natural
      ctx.fillStyle = "#c8a878";
      ctx.beginPath();
      ctx.moveTo(12 * scale, -4 * scale);
      ctx.bezierCurveTo(16 * scale, -8 * scale, 20 * scale, -16 * scale, 18 * scale, -24 * scale);
      ctx.lineTo(15 * scale, -24 * scale);
      ctx.bezierCurveTo(16 * scale, -16 * scale, 14 * scale, -8 * scale, 10 * scale, -2 * scale);
      ctx.closePath();
      ctx.fill();

      // Head — elongated camel head shape
      const headGrad = ctx.createLinearGradient(14 * scale, -28 * scale, 24 * scale, -22 * scale);
      headGrad.addColorStop(0, "#d0b080");
      headGrad.addColorStop(1, "#b89868");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.moveTo(15 * scale, -24 * scale);
      ctx.bezierCurveTo(14 * scale, -28 * scale, 20 * scale, -30 * scale, 24 * scale, -26 * scale);
      ctx.bezierCurveTo(25 * scale, -24 * scale, 22 * scale, -22 * scale, 18 * scale, -22 * scale);
      ctx.closePath();
      ctx.fill();

      // Snout/mouth
      ctx.fillStyle = "#a88060";
      ctx.beginPath();
      ctx.ellipse(24 * scale, -25 * scale, 3 * scale, 2 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Nostril
      ctx.fillStyle = "#5a4030";
      ctx.beginPath();
      ctx.arc(25.5 * scale, -24.5 * scale, 0.6 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Eye
      ctx.fillStyle = "#1a0a00";
      ctx.beginPath();
      ctx.arc(20 * scale, -27 * scale, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Eye highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(20.3 * scale, -27.3 * scale, 0.4 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Ear
      ctx.fillStyle = "#b89060";
      ctx.beginPath();
      ctx.ellipse(17 * scale, -29 * scale, 1.5 * scale, 3 * scale, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Saddle/cargo bags on hump
      ctx.fillStyle = "#8b3a3a";
      ctx.beginPath();
      ctx.moveTo(-6 * scale, -14 * scale);
      ctx.lineTo(2 * scale, -14 * scale);
      ctx.lineTo(3 * scale, -10 * scale);
      ctx.lineTo(-7 * scale, -10 * scale);
      ctx.closePath();
      ctx.fill();
      // Saddle blanket pattern
      ctx.fillStyle = "#c46030";
      ctx.fillRect(-5 * scale, -13 * scale, 6 * scale, 2 * scale);
      ctx.fillStyle = "#e8b830";
      ctx.fillRect(-4 * scale, -12.5 * scale, 4 * scale, 1 * scale);
      // Cargo bags (hanging on sides)
      ctx.fillStyle = "#6a4a2a";
      ctx.beginPath();
      ctx.moveTo(-7 * scale, -10 * scale);
      ctx.lineTo(-9 * scale, -4 * scale);
      ctx.lineTo(-6 * scale, -4 * scale);
      ctx.lineTo(-5 * scale, -10 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2 * scale, -10 * scale);
      ctx.lineTo(4 * scale, -4 * scale);
      ctx.lineTo(1 * scale, -4 * scale);
      ctx.lineTo(0, -10 * scale);
      ctx.closePath();
      ctx.fill();
      // Bag strap detail
      ctx.strokeStyle = "#4a3018";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-7 * scale, -7 * scale);
      ctx.lineTo(-5 * scale, -7 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1 * scale, -7 * scale);
      ctx.lineTo(3 * scale, -7 * scale);
      ctx.stroke();

      // Rope lead (halter) from nose
      ctx.strokeStyle = "#6a5030";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24 * scale, -24 * scale);
      ctx.quadraticCurveTo(28 * scale, -18 * scale, 26 * scale, -10 * scale);
      ctx.stroke();

      // Tail
      ctx.strokeStyle = "#9a7048";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-14 * scale, 0);
      ctx.quadraticCurveTo(-18 * scale, -2 * scale, -20 * scale, 2 * scale);
      ctx.stroke();
      // Tail tuft
      ctx.fillStyle = "#7a5838";
      ctx.beginPath();
      ctx.arc(-20 * scale, 2 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };
    drawCamel(880, 72, 0.6, 1);
    drawCamel(905, 74, 0.55, 1);
    drawCamel(1010, 50, 0.65, -1);

    // Ornate Bedouin tent with colorful patterns, hanging lanterns, carpet
    const drawDesertCamp = (cx: number, cyPct: number) => {
      const cy = getY(cyPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 32, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Carpet/rug in front of entrance
      const carpetGrad = ctx.createLinearGradient(cx - 18, cy + 5, cx + 18, cy + 12);
      carpetGrad.addColorStop(0, "#8b2020");
      carpetGrad.addColorStop(0.5, "#a83030");
      carpetGrad.addColorStop(1, "#8b2020");
      ctx.fillStyle = carpetGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy + 5);
      ctx.lineTo(cx + 16, cy + 5);
      ctx.lineTo(cx + 18, cy + 12);
      ctx.lineTo(cx - 18, cy + 12);
      ctx.closePath();
      ctx.fill();
      // Carpet patterns — intricate geometric
      ctx.strokeStyle = "#d4a030";
      ctx.lineWidth = 0.7;
      // Border lines
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + 6.5);
      ctx.lineTo(cx + 14, cy + 6.5);
      ctx.moveTo(cx - 15, cy + 10.5);
      ctx.lineTo(cx + 15, cy + 10.5);
      ctx.stroke();
      // Diamond pattern in center
      ctx.strokeStyle = "#e8c050";
      ctx.lineWidth = 0.5;
      for (let d = 0; d < 4; d++) {
        const ddx = cx - 9 + d * 6;
        const ddy = cy + 8.5;
        ctx.beginPath();
        ctx.moveTo(ddx, ddy - 1.5);
        ctx.lineTo(ddx + 2, ddy);
        ctx.lineTo(ddx, ddy + 1.5);
        ctx.lineTo(ddx - 2, ddy);
        ctx.closePath();
        ctx.stroke();
      }

      // Tent body — ornate Bedouin shape with side drapes
      const tentGrad = ctx.createLinearGradient(cx - 24, cy - 22, cx + 24, cy + 5);
      tentGrad.addColorStop(0, "#f5e6c8");
      tentGrad.addColorStop(0.3, "#eddcb8");
      tentGrad.addColorStop(0.7, "#e0ccA0");
      tentGrad.addColorStop(1, "#c8b090");
      ctx.fillStyle = tentGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 24);
      ctx.bezierCurveTo(cx + 8, cy - 20, cx + 20, cy - 8, cx + 26, cy + 5);
      ctx.lineTo(cx - 26, cy + 5);
      ctx.bezierCurveTo(cx - 20, cy - 8, cx - 8, cy - 20, cx, cy - 24);
      ctx.closePath();
      ctx.fill();

      // Tent colorful stripe bands — woven pattern
      const stripeColors = ["#b8432f", "#2a6a8a", "#d4a030", "#6a3a7a"];
      for (let s = 0; s < 4; s++) {
        const stripeY = cy - 17 + s * 6;
        const sw = 20 - s * 3;
        ctx.fillStyle = stripeColors[s];
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(cx - sw, stripeY);
        ctx.lineTo(cx + sw, stripeY);
        ctx.lineTo(cx + sw - 1, stripeY + 2);
        ctx.lineTo(cx - sw + 1, stripeY + 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Zigzag decorative line on tent
      ctx.strokeStyle = "#d4a030";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let z = 0; z < 8; z++) {
        const zx = cx - 14 + z * 4;
        const zy = cy - 5 + (z % 2 === 0 ? 0 : 2);
        if (z === 0) ctx.moveTo(zx, zy);
        else ctx.lineTo(zx, zy);
      }
      ctx.stroke();

      // Tent opening — dark interior with fabric drapes
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 5);
      ctx.quadraticCurveTo(cx - 3, cy - 6, cx, cy - 10);
      ctx.quadraticCurveTo(cx + 3, cy - 6, cx + 6, cy + 5);
      ctx.closePath();
      ctx.fill();
      // Fabric drape on opening edges
      ctx.strokeStyle = "#c8a870";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 5);
      ctx.quadraticCurveTo(cx - 3, cy - 5, cx, cy - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy + 5);
      ctx.quadraticCurveTo(cx + 3, cy - 5, cx, cy - 10);
      ctx.stroke();

      // Golden finial at peak
      ctx.fillStyle = `rgba(255, 200, 50, ${0.85 + Math.sin(time * 3) * 0.15})`;
      ctx.beginPath();
      ctx.arc(cx, cy - 26, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 240, 180, 0.5)";
      ctx.beginPath();
      ctx.arc(cx, cy - 26, 2, 0, Math.PI * 2);
      ctx.fill();

      // Hanging lanterns with warm glow
      const lanternPositions = [
        { x: cx - 18, y: cy - 8 },
        { x: cx + 18, y: cy - 8 },
        { x: cx - 10, y: cy - 15 },
        { x: cx + 10, y: cy - 15 },
      ];
      lanternPositions.forEach((lp, li) => {
        // Rope/string to tent
        ctx.strokeStyle = "#6a5030";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y - 4);
        ctx.lineTo(lp.x, lp.y - 7);
        ctx.stroke();
        // Lantern body
        ctx.fillStyle = "#c8a050";
        ctx.beginPath();
        ctx.moveTo(lp.x - 2, lp.y - 4);
        ctx.lineTo(lp.x + 2, lp.y - 4);
        ctx.lineTo(lp.x + 1.5, lp.y + 1);
        ctx.lineTo(lp.x - 1.5, lp.y + 1);
        ctx.closePath();
        ctx.fill();
        // Lantern glass/glow
        const lanternGlow = 0.5 + Math.sin(time * 4 + li * 1.5) * 0.2;
        ctx.fillStyle = `rgba(255, 200, 80, ${lanternGlow})`;
        ctx.beginPath();
        ctx.ellipse(lp.x, lp.y - 1.5, 1.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Warm glow aura
        const auraGrad = ctx.createRadialGradient(lp.x, lp.y - 1, 0, lp.x, lp.y - 1, 8);
        auraGrad.addColorStop(0, `rgba(255, 180, 60, ${lanternGlow * 0.3})`);
        auraGrad.addColorStop(1, "rgba(255, 150, 40, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(lp.x, lp.y - 1, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Campfire with animated flames (larger, more vivid)
      const fireX = cx + 32;
      const fireY = cy + 2;
      // Fire pit stones
      ctx.fillStyle = "#4a3a30";
      for (let st = 0; st < 8; st++) {
        const stAngle = (st / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(fireX + Math.cos(stAngle) * 7, fireY + 3 + Math.sin(stAngle) * 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Ember bed
      ctx.fillStyle = "rgba(200, 80, 20, 0.6)";
      ctx.beginPath();
      ctx.ellipse(fireX, fireY + 3, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Animated flames — multi-layered
      for (let f = 0; f < 7; f++) {
        const fh = 14 + Math.sin(time * 9 + f * 1.4) * 6;
        const fw = 2.5 + Math.sin(time * 7 + f * 0.8) * 1;
        const fx = fireX - 7 + f * 2.2;
        const red = 255;
        const green = Math.floor(80 + f * 25 + Math.sin(time * 6 + f) * 20);
        ctx.fillStyle = `rgba(${red}, ${green}, 15, ${0.85 - f * 0.08})`;
        ctx.beginPath();
        ctx.moveTo(fx - fw, fireY + 1);
        ctx.bezierCurveTo(fx - fw * 0.5, fireY - fh * 0.4, fx + fw * 0.5, fireY - fh * 0.7, fx, fireY - fh);
        ctx.bezierCurveTo(fx + fw * 0.3, fireY - fh * 0.5, fx + fw, fireY - fh * 0.2, fx + fw, fireY + 1);
        ctx.closePath();
        ctx.fill();
      }
      // Sparks rising
      for (let sp = 0; sp < 4; sp++) {
        const sparkLife = (time * 3 + sp * 2.1) % 4;
        const sparkAlpha = Math.max(0, 1 - sparkLife * 0.3);
        ctx.fillStyle = `rgba(255, ${150 + sp * 20}, 40, ${sparkAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(
          fireX - 3 + seededRandom(sp + 50) * 6 + Math.sin(time * 2 + sp) * 3,
          fireY - 10 - sparkLife * 8,
          0.8,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      // Fire glow
      const glowGrad = ctx.createRadialGradient(fireX, fireY - 6, 0, fireX, fireY - 6, 25);
      glowGrad.addColorStop(0, "rgba(255, 140, 40, 0.35)");
      glowGrad.addColorStop(0.5, "rgba(255, 100, 20, 0.1)");
      glowGrad.addColorStop(1, "rgba(255, 80, 10, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(fireX, fireY - 6, 25, 0, Math.PI * 2);
      ctx.fill();
    };
    drawDesertCamp(820, 22);
    drawDesertCamp(1030, 58);

    // Dramatic swirling sand/dust particles — varied sizes, some streaking
    for (let p = 0; p < 40; p++) {
      const px = 720 + seededRandom(p * 23) * 360;
      const py = height * 0.25 + seededRandom(p * 31) * height * 0.55;
      const drift = Math.sin(time * 2.5 + p * 0.5) * 18 + Math.cos(time * 1.2 + p * 0.3) * 6;
      const pSize = 0.8 + seededRandom(p) * 2.5;
      const pAlpha = 0.15 + seededRandom(p * 3) * 0.25;
      ctx.fillStyle = `rgba(210, 180, 140, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px + drift, py, pSize, 0, Math.PI * 2);
      ctx.fill();
      // Sand streak trail for some particles
      if (p % 3 === 0) {
        ctx.strokeStyle = `rgba(210, 180, 140, ${pAlpha * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(px + drift, py);
        ctx.lineTo(px + drift - 8, py + 1);
        ctx.stroke();
      }
    }

    // Dramatic heat shimmer effect — multiple layered bands with stronger distortion
    ctx.save();
    for (let h = 0; h < 7; h++) {
      const shimmerY = getY(12 + h * 4);
      const shimmerAlpha = 0.04 + Math.sin(time * 3 + h * 0.7) * 0.025;
      ctx.globalAlpha = shimmerAlpha;
      ctx.fillStyle = h % 2 === 0 ? "#fff8dc" : "#ffe8b0";
      ctx.beginPath();
      for (let sx = 720; sx < 1080; sx += 5) {
        const shimmerOffset = Math.sin(time * 5 + sx * 0.06 + h * 1.2) * 4 + Math.cos(time * 3 + sx * 0.03) * 2;
        if (sx === 720) ctx.moveTo(sx, shimmerY + shimmerOffset);
        else ctx.lineTo(sx, shimmerY + shimmerOffset);
      }
      ctx.lineTo(1080, shimmerY + 10);
      ctx.lineTo(720, shimmerY + 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Dramatic burning wreckage — charred structure, multi-color flames, smoke, embers
    const drawBurningWreck = (wx: number, wyPct: number) => {
      const wy = getY(wyPct);

      // Scorch mark on ground
      ctx.fillStyle = "rgba(30, 20, 10, 0.25)";
      ctx.beginPath();
      ctx.ellipse(wx, wy + 8, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Charred base structure
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.moveTo(wx - 13, wy + 4);
      ctx.lineTo(wx - 10, wy - 6);
      ctx.lineTo(wx + 10, wy - 5);
      ctx.lineTo(wx + 13, wy + 4);
      ctx.closePath();
      ctx.fill();
      // Upper debris
      ctx.fillStyle = "#3a2815";
      ctx.beginPath();
      ctx.moveTo(wx - 9, wy - 5);
      ctx.lineTo(wx - 6, wy - 12);
      ctx.lineTo(wx + 7, wy - 11);
      ctx.lineTo(wx + 9, wy - 5);
      ctx.closePath();
      ctx.fill();
      // Broken beam
      ctx.fillStyle = "#1a0e05";
      ctx.save();
      ctx.translate(wx + 5, wy - 8);
      ctx.rotate(0.3);
      ctx.fillRect(-1.5, -8, 3, 10);
      ctx.restore();

      // Multi-color flames (orange core, yellow tips, red base)
      for (let i = 0; i < 5; i++) {
        const fx = wx - 8 + i * 4;
        const fh = 12 + Math.sin(time * 8 + i * 2.1) * 5;
        const fhInner = fh * 0.7;
        // Red base flame
        ctx.fillStyle = `rgba(200, 50, 10, ${0.6 + Math.sin(time * 6 + i * 1.3) * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(fx - 3.5, wy - 10);
        ctx.bezierCurveTo(fx - 2, wy - 10 - fh * 0.5, fx + 2, wy - 10 - fh * 0.7, fx, wy - 10 - fh);
        ctx.bezierCurveTo(fx + 2, wy - 10 - fh * 0.5, fx + 3.5, wy - 10 - fh * 0.3, fx + 3.5, wy - 10);
        ctx.closePath();
        ctx.fill();
        // Orange middle
        ctx.fillStyle = `rgba(255, ${120 + i * 25}, 20, ${0.7 + Math.sin(time * 7 + i) * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(fx - 2.5, wy - 10);
        ctx.bezierCurveTo(fx - 1, wy - 10 - fhInner * 0.5, fx + 1, wy - 10 - fhInner * 0.8, fx, wy - 10 - fhInner);
        ctx.bezierCurveTo(fx + 1, wy - 10 - fhInner * 0.4, fx + 2.5, wy - 10 - fhInner * 0.2, fx + 2.5, wy - 10);
        ctx.closePath();
        ctx.fill();
        // Yellow tip
        const tipH = fh * 0.35;
        ctx.fillStyle = `rgba(255, 255, 80, ${0.5 + Math.sin(time * 9 + i * 1.7) * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(fx - 1, wy - 10 - fh * 0.5);
        ctx.quadraticCurveTo(fx, wy - 10 - fh - tipH * 0.3, fx + 1, wy - 10 - fh * 0.5);
        ctx.fill();
      }

      // Rising smoke
      for (let s = 0; s < 3; s++) {
        const smokeLife = (time * 1.5 + s * 1.8) % 5;
        const smokeAlpha = Math.max(0, 0.2 - smokeLife * 0.04);
        const smokeSize = 3 + smokeLife * 3;
        ctx.fillStyle = `rgba(80, 70, 60, ${smokeAlpha})`;
        ctx.beginPath();
        ctx.arc(
          wx - 2 + Math.sin(time + s * 2) * 5 + s * 2,
          wy - 22 - smokeLife * 10,
          smokeSize,
          0, Math.PI * 2
        );
        ctx.fill();
      }

      // Floating embers
      for (let e = 0; e < 4; e++) {
        const emberLife = (time * 4 + e * 1.6) % 3;
        const emberAlpha = Math.max(0, 0.8 - emberLife * 0.3);
        ctx.fillStyle = `rgba(255, ${100 + e * 40}, 20, ${emberAlpha})`;
        ctx.beginPath();
        ctx.arc(
          wx - 5 + seededRandom(wx + e) * 10 + Math.sin(time * 3 + e) * 4,
          wy - 14 - emberLife * 12,
          0.8,
          0, Math.PI * 2
        );
        ctx.fill();
      }

      // Heat distortion glow around wreck
      const heatGlow = ctx.createRadialGradient(wx, wy - 8, 0, wx, wy - 8, 22);
      heatGlow.addColorStop(0, `rgba(255, 120, 30, ${0.12 + Math.sin(time * 3) * 0.04})`);
      heatGlow.addColorStop(1, "rgba(255, 80, 10, 0)");
      ctx.fillStyle = heatGlow;
      ctx.beginPath();
      ctx.arc(wx, wy - 8, 22, 0, Math.PI * 2);
      ctx.fill();
    };
    drawBurningWreck(810, 25);
    drawBurningWreck(960, 75);
    drawBurningWreck(990, 20);
    drawBurningWreck(1520, 32);
    drawBurningWreck(1650, 62);

    // === FROZEN FRONTIER DETAILS === (Enhanced Winter Environment)

    // Aurora Borealis - vivid curtain-like ribbons with full spectrum color shifting
    ctx.save();
    for (let a = 0; a < 6; a++) {
      const auroraY = 8 + a * 10;
      const hueShift = (time * 25 + a * 45) % 360;
      const auroraGrad = ctx.createLinearGradient(1080, 0, 1440, 0);
      auroraGrad.addColorStop(0, `hsla(${120 + hueShift * 0.3}, 90%, 65%, 0)`);
      auroraGrad.addColorStop(0.12, `hsla(${140 + hueShift * 0.4}, 85%, 60%, ${0.06 + Math.sin(time * 0.6 + a * 0.8) * 0.03})`);
      auroraGrad.addColorStop(0.3, `hsla(${170 + hueShift * 0.35}, 90%, 58%, ${0.16 + Math.sin(time * 1.1 + a * 0.5) * 0.08})`);
      auroraGrad.addColorStop(0.5, `hsla(${210 + hueShift * 0.25}, 92%, 62%, ${0.22 + Math.sin(time * 1.4 + a * 0.3) * 0.1})`);
      auroraGrad.addColorStop(0.7, `hsla(${250 + hueShift * 0.35}, 85%, 58%, ${0.14 + Math.sin(time * 0.9 + a * 0.6) * 0.06})`);
      auroraGrad.addColorStop(0.88, `hsla(${290 + hueShift * 0.3}, 80%, 60%, ${0.08 + Math.sin(time * 1.2 + a * 0.4) * 0.04})`);
      auroraGrad.addColorStop(1, `hsla(${310 + hueShift * 0.2}, 90%, 65%, 0)`);
      ctx.fillStyle = auroraGrad;
      ctx.beginPath();
      ctx.moveTo(1080, auroraY);
      for (let ax = 1080; ax <= 1440; ax += 6) {
        const wave1 = Math.sin(time * 0.4 + ax * 0.015 + a * 0.7) * 10;
        const wave2 = Math.sin(time * 0.7 + ax * 0.025 + a * 1.2) * 5;
        const wave3 = Math.sin(time * 1.1 + ax * 0.04 + a * 0.3) * 3;
        const curtainDroop = Math.sin(ax * 0.01 + a * 0.5) * 4;
        ctx.lineTo(ax, auroraY + wave1 + wave2 + wave3 + curtainDroop);
      }
      const bottomBand = 22 + Math.sin(time * 0.3 + a * 0.8) * 5;
      ctx.lineTo(1440, auroraY + bottomBand);
      for (let ax = 1440; ax >= 1080; ax -= 10) {
        const bwave = Math.sin(time * 0.5 + ax * 0.018 + a * 0.9) * 6;
        ctx.lineTo(ax, auroraY + bottomBand + bwave);
      }
      ctx.closePath();
      ctx.fill();
    }
    // Aurora shimmer star highlights
    for (let s = 0; s < 18; s++) {
      const sx = 1095 + seededRandom(s * 31) * 330;
      const sy = 12 + seededRandom(s * 37) * 55;
      const shimmerAlpha = 0.12 + Math.sin(time * 3.5 + s * 1.7) * 0.1;
      if (shimmerAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${shimmerAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5 + Math.sin(time * 2.5 + s) * 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Snow-covered mountains with jagged peaks, rock strata, avalanche cascading
    const drawSnowMountain = (mx: number, myPct: number, width: number, heightPx: number) => {
      const my = getY(myPct);
      const isoDepth = heightPx * 0.35;

      // Shadow underneath
      ctx.fillStyle = "rgba(30, 50, 70, 0.3)";
      ctx.beginPath();
      ctx.ellipse(mx + width * 0.08, my + isoDepth * 0.4, width * 0.55, isoDepth * 0.45, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Back face (shadowed right side) with strata
      const backGrad = ctx.createLinearGradient(mx, my - heightPx, mx + width * 0.5, my);
      backGrad.addColorStop(0, "#7a8a9a");
      backGrad.addColorStop(0.3, "#6a7a8a");
      backGrad.addColorStop(0.6, "#5a6a7a");
      backGrad.addColorStop(1, "#4a5a6a");
      ctx.fillStyle = backGrad;
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx);
      ctx.lineTo(mx + width * 0.12, my - heightPx * 0.88);
      ctx.lineTo(mx + width * 0.18, my - heightPx * 0.92);
      ctx.lineTo(mx + width * 0.25, my - heightPx * 0.75);
      ctx.lineTo(mx + width * 0.35, my - heightPx * 0.4);
      ctx.lineTo(mx + width * 0.45, my);
      ctx.lineTo(mx + width * 0.45, my + isoDepth * 0.4);
      ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
      ctx.closePath();
      ctx.fill();

      // Front face (lit left side) with detailed gradient
      const mtGrad = ctx.createLinearGradient(mx - width * 0.4, my - heightPx, mx + width * 0.1, my + isoDepth);
      mtGrad.addColorStop(0, "#f0f8ff");
      mtGrad.addColorStop(0.15, "#e8f2fc");
      mtGrad.addColorStop(0.3, "#d0e4f0");
      mtGrad.addColorStop(0.5, "#b0c8d8");
      mtGrad.addColorStop(0.7, "#90a8b8");
      mtGrad.addColorStop(1, "#708898");
      ctx.fillStyle = mtGrad;
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx);
      ctx.lineTo(mx - width * 0.02, my - heightPx * 0.9);
      ctx.lineTo(mx - width * 0.08, my - heightPx * 0.95);
      ctx.lineTo(mx - width * 0.18, my - heightPx * 0.7);
      ctx.lineTo(mx - width * 0.25, my - heightPx * 0.5);
      ctx.lineTo(mx - width * 0.35, my - heightPx * 0.25);
      ctx.lineTo(mx - width * 0.4, my);
      ctx.lineTo(mx - width * 0.4, my + isoDepth * 0.4);
      ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
      ctx.closePath();
      ctx.fill();

      // Visible rock strata layers on front face
      ctx.save();
      ctx.globalAlpha = 0.25;
      for (let s = 0; s < 5; s++) {
        const strataY = my - heightPx * (0.15 + s * 0.14);
        const strataColor = s % 2 === 0 ? "rgba(90, 105, 120, 0.4)" : "rgba(70, 85, 100, 0.3)";
        ctx.fillStyle = strataColor;
        ctx.beginPath();
        const leftX = mx - width * (0.38 - s * 0.03);
        const rightX = mx + width * 0.04;
        ctx.moveTo(leftX, strataY);
        ctx.lineTo(rightX, strataY - heightPx * 0.03);
        ctx.lineTo(rightX, strataY + heightPx * 0.04);
        ctx.lineTo(leftX, strataY + heightPx * 0.05);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Isometric base edge
      ctx.fillStyle = "#5a6a7a";
      ctx.beginPath();
      ctx.moveTo(mx - width * 0.4, my + isoDepth * 0.4);
      ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
      ctx.lineTo(mx + width * 0.45, my + isoDepth * 0.4);
      ctx.quadraticCurveTo(mx + width * 0.1, my + isoDepth * 0.55, mx - width * 0.4, my + isoDepth * 0.4);
      ctx.fill();

      // Snow cap with multiple sculpted layers
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx);
      ctx.lineTo(mx + width * 0.12, my - heightPx * 0.88);
      ctx.lineTo(mx + width * 0.2, my - heightPx * 0.7);
      ctx.quadraticCurveTo(mx + width * 0.15, my - heightPx * 0.72, mx + width * 0.1, my - heightPx * 0.68);
      ctx.lineTo(mx + width * 0.05, my - heightPx * 0.65);
      ctx.quadraticCurveTo(mx - width * 0.02, my - heightPx * 0.75, mx - width * 0.08, my - heightPx * 0.72);
      ctx.lineTo(mx - width * 0.12, my - heightPx * 0.68);
      ctx.closePath();
      ctx.fill();

      // Snow drip cascading on front face
      ctx.fillStyle = "#f0f8ff";
      ctx.beginPath();
      ctx.moveTo(mx - width * 0.02, my - heightPx * 0.9);
      ctx.lineTo(mx - width * 0.15, my - heightPx * 0.65);
      ctx.quadraticCurveTo(mx - width * 0.12, my - heightPx * 0.6, mx - width * 0.08, my - heightPx * 0.58);
      ctx.lineTo(mx - width * 0.2, my - heightPx * 0.48);
      ctx.quadraticCurveTo(mx - width * 0.18, my - heightPx * 0.45, mx - width * 0.14, my - heightPx * 0.42);
      ctx.lineTo(mx + width * 0.02, my - heightPx * 0.6);
      ctx.closePath();
      ctx.fill();

      // Wind-blown snow at summit (animated wisps)
      const windPhase = time * 1.5;
      ctx.save();
      ctx.globalAlpha = 0.4 + Math.sin(time * 2) * 0.15;
      ctx.strokeStyle = "rgba(230, 240, 255, 0.6)";
      ctx.lineWidth = 1.5;
      for (let w = 0; w < 3; w++) {
        const windX = mx + width * 0.05 + w * 4;
        const windY = my - heightPx + w * 3;
        ctx.beginPath();
        ctx.moveTo(windX, windY);
        const windLen = 15 + w * 5 + Math.sin(windPhase + w) * 8;
        ctx.quadraticCurveTo(
          windX + windLen * 0.5, windY - 3 + Math.sin(windPhase + w * 0.5) * 2,
          windX + windLen, windY - 1 + Math.sin(windPhase * 1.3 + w) * 3
        );
        ctx.stroke();
      }
      ctx.restore();

      // Icicles hanging from outcrops
      ctx.fillStyle = "rgba(200, 230, 255, 0.7)";
      for (let ic = 0; ic < 4; ic++) {
        const icX = mx - width * 0.25 + ic * width * 0.12;
        const icY = my - heightPx * (0.5 + ic * 0.08);
        const icLen = 4 + seededRandom(mx + ic * 7) * 6;
        ctx.beginPath();
        ctx.moveTo(icX - 1.5, icY);
        ctx.lineTo(icX, icY + icLen);
        ctx.lineTo(icX + 1.5, icY);
        ctx.closePath();
        ctx.fill();
      }

      // Avalanche snow cascading (animated particles on slope)
      const avalancheActive = Math.sin(time * 0.3 + mx * 0.1) > 0.3;
      if (avalancheActive) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        for (let av = 0; av < 6; av++) {
          const avProgress = ((time * 30 + av * 12 + mx) % 60) / 60;
          const avX = mx - width * 0.1 + avProgress * width * 0.3;
          const avY = my - heightPx * (0.7 - avProgress * 0.5);
          const avSize = 2 + avProgress * 3;
          ctx.fillStyle = `rgba(240, 248, 255, ${0.6 - avProgress * 0.5})`;
          ctx.beginPath();
          ctx.arc(avX, avY, avSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };
    drawSnowMountain(1130, 30, 35, 16);
    drawSnowMountain(1250, 25, 45, 20);
    drawSnowMountain(1350, 26, 48, 28);
    drawSnowMountain(1380, 28, 48, 28);

    drawSnowMountain(1310, 80, 68, 38);
    drawSnowMountain(1350, 82, 68, 38);

    // Detailed frosted pine trees with individual branch layers
    const drawFrostedPine = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      // Shadow
      ctx.fillStyle = "rgba(30, 50, 70, 0.2)";
      ctx.beginPath();
      ctx.ellipse(x + 5 * scale, y + 5 * scale, 14 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Detailed trunk with bark texture
      const trunkGrad = ctx.createLinearGradient(x - 3 * scale, y, x + 3 * scale, y);
      trunkGrad.addColorStop(0, "#2a1a12");
      trunkGrad.addColorStop(0.3, "#4a3828");
      trunkGrad.addColorStop(0.5, "#5a4838");
      trunkGrad.addColorStop(0.7, "#4a3828");
      trunkGrad.addColorStop(1, "#2a1a12");
      ctx.fillStyle = trunkGrad;
      ctx.fillRect(x - 3 * scale, y - 6 * scale, 6 * scale, 14 * scale);
      // Bark texture lines
      ctx.strokeStyle = "rgba(30, 20, 10, 0.4)";
      ctx.lineWidth = 0.5;
      for (let b = 0; b < 5; b++) {
        const barkY = y - 4 * scale + b * 3 * scale;
        ctx.beginPath();
        ctx.moveTo(x - 2.5 * scale, barkY);
        ctx.quadraticCurveTo(x, barkY - 1, x + 2.5 * scale, barkY + 0.5);
        ctx.stroke();
      }

      // Branch layers (6 tiers of individual branches instead of triangles)
      const branchTiers = [
        { y: -4, spread: 16, droop: 3 },
        { y: -10, spread: 14, droop: 2.5 },
        { y: -16, spread: 12, droop: 2 },
        { y: -22, spread: 10, droop: 1.5 },
        { y: -27, spread: 7, droop: 1 },
        { y: -31, spread: 4, droop: 0.5 },
      ];
      branchTiers.forEach((tier, ti) => {
        const baseY = y + tier.y * scale;
        for (let side = -1; side <= 1; side += 2) {
          // Main branch with foliage (flat color instead of per-branch gradient)
          ctx.fillStyle = ti < 3 ? "#1a5a3a" : "#1a4a2a";
          ctx.beginPath();
          ctx.moveTo(x, baseY - 1.5 * scale);
          ctx.quadraticCurveTo(x + side * tier.spread * 0.6 * scale, baseY - 1 * scale, x + side * tier.spread * scale, baseY + tier.droop * scale);
          ctx.lineTo(x + side * tier.spread * scale, baseY + tier.droop * scale + 2 * scale);
          ctx.quadraticCurveTo(x + side * tier.spread * 0.5 * scale, baseY + 1.5 * scale, x, baseY + 1 * scale);
          ctx.closePath();
          ctx.fill();

          // Needle texture
          ctx.strokeStyle = "rgba(10, 50, 25, 0.3)";
          ctx.lineWidth = 0.5;
          for (let n = 0; n < 3; n++) {
            const nx = x + side * tier.spread * (0.3 + n * 0.25) * scale;
            const ny = baseY + tier.droop * (n * 0.3) * scale;
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(nx + side * 2 * scale, ny + 2 * scale);
            ctx.stroke();
          }

          // Heavy snow load bending branches
          ctx.fillStyle = "rgba(240, 248, 255, 0.9)";
          ctx.beginPath();
          ctx.moveTo(x + side * 2 * scale, baseY - 1.5 * scale);
          ctx.quadraticCurveTo(
            x + side * tier.spread * 0.5 * scale,
            baseY - 2.5 * scale + Math.sin(ti * 0.5) * scale,
            x + side * tier.spread * 0.85 * scale,
            baseY + tier.droop * 0.5 * scale
          );
          ctx.lineTo(x + side * tier.spread * 0.7 * scale, baseY + tier.droop * 0.3 * scale);
          ctx.quadraticCurveTo(x + side * tier.spread * 0.4 * scale, baseY - 1 * scale, x + side * 2 * scale, baseY - 0.5 * scale);
          ctx.closePath();
          ctx.fill();

          // Icicles hanging from snow-laden branches
          if (ti < 4) {
            ctx.fillStyle = "rgba(200, 230, 255, 0.6)";
            const icicleX = x + side * tier.spread * 0.6 * scale;
            const icicleY = baseY + tier.droop * 0.5 * scale;
            const icicleLen = (2 + ti * 0.5) * scale;
            ctx.beginPath();
            ctx.moveTo(icicleX - 0.8 * scale, icicleY);
            ctx.lineTo(icicleX, icicleY + icicleLen);
            ctx.lineTo(icicleX + 0.8 * scale, icicleY);
            ctx.closePath();
            ctx.fill();
          }
        }
      });

      // Visible pinecones
      ctx.fillStyle = "#5a3a20";
      for (let p = 0; p < 2; p++) {
        const pcX = x + (p === 0 ? -5 : 4) * scale;
        const pcY = y + (-6 - p * 8) * scale;
        ctx.beginPath();
        ctx.ellipse(pcX, pcY, 1.8 * scale, 3 * scale, 0.2 * (p === 0 ? 1 : -1), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(40, 25, 10, 0.5)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(pcX - 1 * scale, pcY - 1 * scale);
        ctx.lineTo(pcX + 1 * scale, pcY + 1 * scale);
        ctx.stroke();
      }

      // Snow pile at base with drift
      const snowGrad = ctx.createRadialGradient(x, y + 2 * scale, 0, x, y + 2 * scale, 12 * scale);
      snowGrad.addColorStop(0, "#f4f8ff");
      snowGrad.addColorStop(0.7, "#e0ecf8");
      snowGrad.addColorStop(1, "rgba(220, 235, 248, 0)");
      ctx.fillStyle = snowGrad;
      ctx.beginPath();
      ctx.ellipse(x + 2 * scale, y + 2 * scale, 12 * scale, 5 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Natural snow cap at treetop
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y - 33 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    [
      [1095, 72], [1115, 55], [1140, 78], [1165, 42], [1185, 68],
      [1220, 75], [1255, 38], [1280, 62], [1305, 48], [1325, 72],
      [1355, 35], [1375, 58], [1400, 45], [1420, 68],
    ].forEach(([x, yPct], i) => {
      drawFrostedPine(x, yPct, 0.6 + seededRandom(i + 300) * 0.25);
    });

    // Hexagonal faceted ice crystal formations with rainbow refraction
    const drawIceCrystal = (cx: number, cyPct: number, scale: number) => {
      const cy = getY(cyPct);
      const pulse = Math.sin(time * 2 + cx * 0.1) * 0.15;

      // Frost patterns radiating from base
      ctx.save();
      ctx.strokeStyle = "rgba(180, 220, 255, 0.25)";
      ctx.lineWidth = 0.8;
      for (let f = 0; f < 8; f++) {
        const angle = (f / 8) * Math.PI * 2;
        const frostLen = 18 + seededRandom(cx + f * 3) * 12;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 2 * scale);
        const endX = cx + Math.cos(angle) * frostLen * scale;
        const endY = cy + 2 * scale + Math.sin(angle) * frostLen * scale * 0.4;
        const midX = cx + Math.cos(angle) * frostLen * 0.5 * scale;
        const midY = cy + 2 * scale + Math.sin(angle) * frostLen * 0.5 * scale * 0.4;
        ctx.lineTo(midX, midY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        // Sub-branches
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX + Math.cos(angle + 0.5) * frostLen * 0.3 * scale, midY + Math.sin(angle + 0.5) * frostLen * 0.3 * scale * 0.4);
        ctx.stroke();
      }
      ctx.restore();

      // Outer glow pulsing
      const glowGrad = ctx.createRadialGradient(cx, cy - 15 * scale, 0, cx, cy - 15 * scale, 30 * scale);
      glowGrad.addColorStop(0, `rgba(150, 220, 255, ${0.25 + pulse})`);
      glowGrad.addColorStop(0.5, `rgba(120, 200, 255, ${0.1 + pulse * 0.5})`);
      glowGrad.addColorStop(1, "rgba(150, 220, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 15 * scale, 30 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Main hexagonal crystal spire
      const crystalGrad = ctx.createLinearGradient(cx - 8 * scale, cy, cx + 8 * scale, cy - 38 * scale);
      crystalGrad.addColorStop(0, "rgba(160, 210, 255, 0.85)");
      crystalGrad.addColorStop(0.3, "rgba(200, 230, 255, 0.9)");
      crystalGrad.addColorStop(0.6, "rgba(230, 245, 255, 0.95)");
      crystalGrad.addColorStop(1, "rgba(255, 255, 255, 1)");
      ctx.fillStyle = crystalGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 38 * scale);
      ctx.lineTo(cx + 5 * scale, cy - 28 * scale);
      ctx.lineTo(cx + 7 * scale, cy - 15 * scale);
      ctx.lineTo(cx + 5 * scale, cy + 2 * scale);
      ctx.lineTo(cx, cy + 4 * scale);
      ctx.lineTo(cx - 5 * scale, cy + 2 * scale);
      ctx.lineTo(cx - 7 * scale, cy - 15 * scale);
      ctx.lineTo(cx - 5 * scale, cy - 28 * scale);
      ctx.closePath();
      ctx.fill();

      // Hexagonal facet lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 38 * scale);
      ctx.lineTo(cx, cy + 4 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 7 * scale, cy - 15 * scale);
      ctx.lineTo(cx + 7 * scale, cy - 15 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 5 * scale, cy - 28 * scale);
      ctx.lineTo(cx + 5 * scale, cy + 2 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 5 * scale, cy - 28 * scale);
      ctx.lineTo(cx - 5 * scale, cy + 2 * scale);
      ctx.stroke();

      // Rainbow light refraction (prismatic effect)
      ctx.save();
      ctx.globalAlpha = 0.2 + pulse * 0.5;
      const prismColors = ["#ff6666", "#ffaa44", "#ffff66", "#66ff88", "#6688ff", "#aa66ff"];
      prismColors.forEach((color, i) => {
        const refractAngle = (i / 6) * Math.PI + time * 0.3;
        const refractDist = 10 + Math.sin(time * 1.5 + i) * 3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(refractAngle) * refractDist * scale,
          cy - 15 * scale + Math.sin(refractAngle) * refractDist * scale * 0.6,
          2.5 * scale, 0, Math.PI * 2
        );
        ctx.fill();
      });
      ctx.restore();

      // Inner glow pulsing
      const innerGlow = ctx.createRadialGradient(cx, cy - 18 * scale, 0, cx, cy - 18 * scale, 12 * scale);
      innerGlow.addColorStop(0, `rgba(200, 240, 255, ${0.3 + pulse})`);
      innerGlow.addColorStop(1, "rgba(200, 240, 255, 0)");
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy - 18 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Side crystals (smaller hexagonal)
      ctx.fillStyle = "rgba(190, 225, 255, 0.75)";
      ctx.beginPath();
      ctx.moveTo(cx - 5 * scale, cy - 10 * scale);
      ctx.lineTo(cx - 16 * scale, cy - 24 * scale);
      ctx.lineTo(cx - 14 * scale, cy - 22 * scale);
      ctx.lineTo(cx - 8 * scale, cy - 8 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 5 * scale, cy - 14 * scale);
      ctx.lineTo(cx + 14 * scale, cy - 28 * scale);
      ctx.lineTo(cx + 12 * scale, cy - 26 * scale);
      ctx.lineTo(cx + 7 * scale, cy - 12 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 2 * scale, cy - 5 * scale);
      ctx.lineTo(cx + 10 * scale, cy - 15 * scale);
      ctx.lineTo(cx + 8 * scale, cy - 13 * scale);
      ctx.lineTo(cx + 3 * scale, cy - 4 * scale);
      ctx.closePath();
      ctx.fill();

      // Sparkle star at tip
      const sparkle = 0.5 + Math.sin(time * 5 + cx * 0.5) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${sparkle})`;
      const sparkSize = 2 + sparkle * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 38 * scale - sparkSize * scale);
      ctx.lineTo(cx + sparkSize * 0.4 * scale, cy - 38 * scale);
      ctx.lineTo(cx, cy - 38 * scale + sparkSize * 0.6 * scale);
      ctx.lineTo(cx - sparkSize * 0.4 * scale, cy - 38 * scale);
      ctx.closePath();
      ctx.fill();
    };
    drawIceCrystal(1120, 62, 0.8);
    drawIceCrystal(1270, 48, 1);
    drawIceCrystal(1350, 72, 0.7);
    drawIceCrystal(1410, 38, 0.9);

    // Frozen lake with visible depth, trapped bubbles, skating scratches
    const drawFrozenLake = (lx: number, lyPct: number, width: number, heightRatio: number) => {
      const ly = getY(lyPct);

      // Snow drifts along edges
      ctx.fillStyle = "rgba(230, 240, 250, 0.6)";
      ctx.beginPath();
      ctx.ellipse(lx, ly, width + 6, width * heightRatio + 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep water underneath (visible depth through translucent ice)
      const depthGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, width);
      depthGrad.addColorStop(0, "rgba(30, 60, 100, 0.5)");
      depthGrad.addColorStop(0.5, "rgba(40, 80, 130, 0.4)");
      depthGrad.addColorStop(1, "rgba(50, 90, 140, 0.3)");
      ctx.fillStyle = depthGrad;
      ctx.beginPath();
      ctx.ellipse(lx, ly, width, width * heightRatio, 0, 0, Math.PI * 2);
      ctx.fill();

      // Translucent ice surface
      const iceGrad = ctx.createRadialGradient(lx - width * 0.2, ly - width * heightRatio * 0.2, 0, lx, ly, width);
      iceGrad.addColorStop(0, "rgba(210, 235, 255, 0.6)");
      iceGrad.addColorStop(0.3, "rgba(185, 215, 245, 0.65)");
      iceGrad.addColorStop(0.7, "rgba(160, 195, 230, 0.7)");
      iceGrad.addColorStop(1, "rgba(130, 170, 210, 0.5)");
      ctx.fillStyle = iceGrad;
      ctx.beginPath();
      ctx.ellipse(lx, ly, width, width * heightRatio, 0, 0, Math.PI * 2);
      ctx.fill();

      // Branching ice cracks
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 0.8;
      for (let c = 0; c < 6; c++) {
        const startAngle = seededRandom(lx + c) * Math.PI * 2;
        const crackLen = 12 + seededRandom(lx + c + 10) * 25;
        const midX = lx + Math.cos(startAngle) * crackLen * 0.5;
        const midY = ly + Math.sin(startAngle) * crackLen * heightRatio * 0.5;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(midX, midY);
        ctx.lineTo(
          lx + Math.cos(startAngle) * crackLen,
          ly + Math.sin(startAngle) * crackLen * heightRatio
        );
        ctx.stroke();
        // Branch crack
        if (c < 4) {
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          const branchAngle = startAngle + (seededRandom(lx + c + 30) > 0.5 ? 0.6 : -0.6);
          ctx.lineTo(
            midX + Math.cos(branchAngle) * crackLen * 0.4,
            midY + Math.sin(branchAngle) * crackLen * heightRatio * 0.4
          );
          ctx.stroke();
        }
      }

      // Trapped air bubbles under ice
      ctx.fillStyle = "rgba(200, 230, 255, 0.35)";
      for (let b = 0; b < 8; b++) {
        const bx = lx - width * 0.6 + seededRandom(lx + b * 13) * width * 1.2;
        const by = ly - width * heightRatio * 0.5 + seededRandom(lx + b * 17) * width * heightRatio;
        const bSize = 1.5 + seededRandom(lx + b * 23) * 3;
        const dx = (bx - lx) / width;
        const dy = (by - ly) / (width * heightRatio);
        if (dx * dx + dy * dy < 0.8) {
          ctx.beginPath();
          ctx.arc(bx, by, bSize, 0, Math.PI * 2);
          ctx.fill();
          // Bubble highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.beginPath();
          ctx.arc(bx - bSize * 0.3, by - bSize * 0.3, bSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(200, 230, 255, 0.35)";
        }
      }

      // Skating scratch marks
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 0.6;
      for (let sc = 0; sc < 4; sc++) {
        const scX = lx - width * 0.4 + seededRandom(lx + sc * 41) * width * 0.8;
        const scY = ly - width * heightRatio * 0.2 + seededRandom(lx + sc * 43) * width * heightRatio * 0.4;
        const scLen = 8 + seededRandom(lx + sc * 47) * 12;
        const scAngle = seededRandom(lx + sc * 51) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(scX, scY);
        ctx.lineTo(scX + Math.cos(scAngle) * scLen, scY + Math.sin(scAngle) * scLen * heightRatio);
        ctx.stroke();
        // Paired scratch
        ctx.beginPath();
        ctx.moveTo(scX + 2, scY + 1);
        ctx.lineTo(scX + Math.cos(scAngle) * scLen + 2, scY + Math.sin(scAngle) * scLen * heightRatio + 1);
        ctx.stroke();
      }

      // Surface shimmer spots
      ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + Math.sin(time * 3) * 0.15})`;
      for (let s = 0; s < 4; s++) {
        const sx = lx - width * 0.5 + seededRandom(lx + s * 7) * width;
        const sy = ly - width * heightRatio * 0.3 + seededRandom(lx + s * 11) * width * heightRatio * 0.6;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 5 + Math.sin(time * 2 + s) * 2, 2, seededRandom(lx + s * 19) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawFrozenLake(1200, 82, 45, 0.35);
    drawFrozenLake(1340, 58, 35, 0.3);

    // Igloo with visible ice block construction and warm interior glow
    const drawIgloo = (ix: number, iyPct: number, scale: number) => {
      const iy = getY(iyPct);

      // Shadow
      ctx.fillStyle = "rgba(50, 70, 90, 0.25)";
      ctx.beginPath();
      ctx.ellipse(ix + 3 * scale, iy + 6 * scale, 24 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snow drift accumulation around base
      ctx.fillStyle = "rgba(235, 245, 255, 0.7)";
      ctx.beginPath();
      ctx.ellipse(ix, iy + 3 * scale, 26 * scale, 10 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main dome with gradient
      const domeGrad = ctx.createRadialGradient(ix - 5 * scale, iy - 12 * scale, 0, ix, iy, 22 * scale);
      domeGrad.addColorStop(0, "#ffffff");
      domeGrad.addColorStop(0.3, "#f0f8ff");
      domeGrad.addColorStop(0.6, "#e0eef8");
      domeGrad.addColorStop(1, "#c0d4e4");
      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.arc(ix, iy - 2 * scale, 18 * scale, Math.PI, 0);
      ctx.lineTo(ix + 18 * scale, iy + 2 * scale);
      ctx.lineTo(ix - 18 * scale, iy + 2 * scale);
      ctx.closePath();
      ctx.fill();

      // Visible ice block construction lines (rows and vertical dividers)
      ctx.strokeStyle = "rgba(140, 170, 195, 0.5)";
      ctx.lineWidth = 0.8;
      for (let row = 0; row < 4; row++) {
        // Horizontal row arcs
        ctx.beginPath();
        ctx.arc(ix, iy - 2 * scale, 18 * scale - row * 2 * scale, Math.PI, 0);
        ctx.stroke();
        // Vertical block dividers
        const blocksInRow = 5 - row;
        for (let b = 0; b < blocksInRow; b++) {
          const blockAngle = Math.PI + ((b + 0.5) / blocksInRow) * Math.PI;
          const bx1 = ix + Math.cos(blockAngle) * (18 * scale - row * 2 * scale);
          const by1 = iy - 2 * scale - Math.sin(blockAngle) * (18 * scale - row * 2 * scale);
          const bx2 = ix + Math.cos(blockAngle) * (18 * scale - (row + 1) * 2 * scale);
          const by2 = iy - 2 * scale - Math.sin(blockAngle) * (18 * scale - (row + 1) * 2 * scale);
          ctx.beginPath();
          ctx.moveTo(bx1, by1);
          ctx.lineTo(bx2, by2);
          ctx.stroke();
        }
      }

      // Entrance tunnel (dark interior)
      ctx.fillStyle = "#1a2a38";
      ctx.beginPath();
      ctx.ellipse(ix + 18 * scale, iy - 1 * scale, 7 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Warm interior glow from entrance
      const warmGlow = ctx.createRadialGradient(ix + 18 * scale, iy - 1 * scale, 0, ix + 18 * scale, iy - 1 * scale, 12 * scale);
      warmGlow.addColorStop(0, `rgba(255, 180, 80, ${0.4 + Math.sin(time * 2) * 0.1})`);
      warmGlow.addColorStop(0.4, `rgba(255, 140, 50, ${0.2 + Math.sin(time * 1.5) * 0.05})`);
      warmGlow.addColorStop(1, "rgba(255, 100, 30, 0)");
      ctx.fillStyle = warmGlow;
      ctx.beginPath();
      ctx.arc(ix + 18 * scale, iy - 1 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Tunnel arch
      ctx.fillStyle = "#d0e0ec";
      ctx.beginPath();
      ctx.arc(ix + 18 * scale, iy - 1 * scale, 7 * scale, Math.PI, 0);
      ctx.lineTo(ix + 27 * scale, iy + 2 * scale);
      ctx.lineTo(ix + 9 * scale, iy + 2 * scale);
      ctx.closePath();
      ctx.fill();

      // Smoke hole at top
      ctx.fillStyle = "rgba(20, 30, 40, 0.4)";
      ctx.beginPath();
      ctx.ellipse(ix - 2 * scale, iy - 19 * scale, 2.5 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rising smoke wisps from hole
      for (let sm = 0; sm < 3; sm++) {
        const smokePhase = (time * 12 + sm * 8) % 30;
        const smokeY = iy - 20 * scale - smokePhase;
        const smokeX = ix - 2 * scale + Math.sin(time * 1.5 + sm) * (2 + smokePhase * 0.1);
        const smokeSize = 2 + smokePhase * 0.15;
        const smokeAlpha = Math.max(0, 0.3 - smokePhase / 40);
        ctx.fillStyle = `rgba(200, 210, 220, ${smokeAlpha})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawIgloo(1160, 50, 0.8);
    drawIgloo(1390, 75, 0.7);

    // Woolly mammoth with shaggy fur, curved tusks, expressive eye
    const drawMammoth = (mx: number, myPct: number, scale: number, facing: number) => {
      const my = getY(myPct);
      ctx.save();
      ctx.translate(mx, my);
      ctx.scale(facing, 1);

      // Shadow
      ctx.fillStyle = "rgba(30, 50, 70, 0.25)";
      ctx.beginPath();
      ctx.ellipse(0, 12 * scale, 28 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Back legs
      ctx.fillStyle = "#3a2418";
      ctx.fillRect(-14 * scale, 8 * scale, 7 * scale, 16 * scale);
      ctx.fillRect(8 * scale, 8 * scale, 7 * scale, 16 * scale);
      // Back leg fur fringe
      ctx.fillStyle = "#4a3020";
      for (let lf = 0; lf < 2; lf++) {
        const lfx = lf === 0 ? -14 * scale : 8 * scale;
        for (let f = 0; f < 4; f++) {
          ctx.beginPath();
          ctx.moveTo(lfx + f * 2 * scale, 20 * scale);
          ctx.lineTo(lfx + f * 2 * scale + 1 * scale, 25 * scale);
          ctx.lineTo(lfx + f * 2 * scale + 2 * scale, 20 * scale);
          ctx.fill();
        }
      }

      // Body with rich fur gradient
      const furGrad = ctx.createRadialGradient(-2 * scale, -4 * scale, 0, 0, 0, 24 * scale);
      furGrad.addColorStop(0, "#6a5040");
      furGrad.addColorStop(0.5, "#5a4030");
      furGrad.addColorStop(1, "#3a2418");
      ctx.fillStyle = furGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24 * scale, 15 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shaggy fur texture (layered strands)
      ctx.strokeStyle = "#2a1810";
      ctx.lineWidth = 0.8;
      for (let f = 0; f < 14; f++) {
        const fx = -18 * scale + f * 3 * scale;
        const furLen = 10 + seededRandom(mx + f * 3) * 8;
        ctx.beginPath();
        ctx.moveTo(fx, -8 * scale + seededRandom(mx + f * 7) * 4 * scale);
        ctx.quadraticCurveTo(fx + 1 * scale, 4 * scale, fx - 1 * scale, furLen * scale);
        ctx.stroke();
      }
      // Long belly fur
      ctx.strokeStyle = "#4a3828";
      ctx.lineWidth = 1;
      for (let bf = 0; bf < 8; bf++) {
        const bfx = -12 * scale + bf * 3.5 * scale;
        ctx.beginPath();
        ctx.moveTo(bfx, 10 * scale);
        ctx.quadraticCurveTo(bfx + 0.5 * scale, 16 * scale, bfx - 0.5 * scale, 20 * scale);
        ctx.stroke();
      }

      // Front legs
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(-6 * scale, 10 * scale, 7 * scale, 16 * scale);
      ctx.fillRect(1 * scale, 10 * scale, 7 * scale, 16 * scale);
      // Front leg fur fringe
      for (let lf = 0; lf < 2; lf++) {
        const lfx = lf === 0 ? -6 * scale : 1 * scale;
        ctx.fillStyle = "#5a4030";
        for (let f = 0; f < 4; f++) {
          ctx.beginPath();
          ctx.moveTo(lfx + f * 2 * scale, 22 * scale);
          ctx.lineTo(lfx + f * 2 * scale + 1 * scale, 26 * scale);
          ctx.lineTo(lfx + f * 2 * scale + 2 * scale, 22 * scale);
          ctx.fill();
        }
      }

      // Head with fur
      const headGrad = ctx.createRadialGradient(18 * scale, -6 * scale, 0, 18 * scale, -6 * scale, 14 * scale);
      headGrad.addColorStop(0, "#6a5040");
      headGrad.addColorStop(1, "#4a3020");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(18 * scale, -5 * scale, 13 * scale, 11 * scale, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Head fur tuft
      ctx.fillStyle = "#5a4030";
      ctx.beginPath();
      ctx.moveTo(14 * scale, -14 * scale);
      ctx.quadraticCurveTo(18 * scale, -20 * scale, 22 * scale, -14 * scale);
      ctx.quadraticCurveTo(18 * scale, -16 * scale, 14 * scale, -14 * scale);
      ctx.fill();

      // Trunk with segmented detail
      ctx.fillStyle = "#4a3020";
      ctx.beginPath();
      ctx.moveTo(27 * scale, -2 * scale);
      ctx.quadraticCurveTo(36 * scale, 4 * scale, 33 * scale, 14 * scale);
      ctx.quadraticCurveTo(31 * scale, 20 * scale, 28 * scale, 18 * scale);
      ctx.quadraticCurveTo(30 * scale, 12 * scale, 26 * scale, 6 * scale);
      ctx.quadraticCurveTo(25 * scale, 2 * scale, 25 * scale, 0);
      ctx.fill();
      // Trunk segment lines
      ctx.strokeStyle = "rgba(30, 18, 8, 0.4)";
      ctx.lineWidth = 0.6;
      for (let ts = 0; ts < 5; ts++) {
        const tsy = 0 + ts * 4 * scale;
        const tsx = 27 * scale + Math.sin(ts * 0.8) * 3 * scale;
        ctx.beginPath();
        ctx.arc(tsx, tsy, 3 * scale, -0.5, 1.5);
        ctx.stroke();
      }

      // Curved tusks with ivory detail and ridges
      const tuskGrad = ctx.createLinearGradient(22 * scale, 4 * scale, 42 * scale, -2 * scale);
      tuskGrad.addColorStop(0, "#f8f0e0");
      tuskGrad.addColorStop(0.5, "#fff8f0");
      tuskGrad.addColorStop(1, "#f0e8d8");
      ctx.fillStyle = tuskGrad;
      ctx.beginPath();
      ctx.moveTo(22 * scale, 3 * scale);
      ctx.quadraticCurveTo(34 * scale, -8 * scale, 42 * scale, -2 * scale);
      ctx.quadraticCurveTo(44 * scale, 2 * scale, 42 * scale, 5 * scale);
      ctx.quadraticCurveTo(36 * scale, -3 * scale, 24 * scale, 5 * scale);
      ctx.closePath();
      ctx.fill();
      // Tusk ridges
      ctx.strokeStyle = "rgba(180, 160, 130, 0.3)";
      ctx.lineWidth = 0.5;
      for (let tr = 0; tr < 4; tr++) {
        const trX = 28 * scale + tr * 4 * scale;
        ctx.beginPath();
        ctx.moveTo(trX, 0);
        ctx.lineTo(trX + 1 * scale, -4 * scale);
        ctx.stroke();
      }

      // Expressive eye with detail
      ctx.fillStyle = "#f0e8e0";
      ctx.beginPath();
      ctx.ellipse(24 * scale, -8 * scale, 3.5 * scale, 2.5 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2a1a08";
      ctx.beginPath();
      ctx.arc(24.5 * scale, -8 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0a0400";
      ctx.beginPath();
      ctx.arc(25 * scale, -8 * scale, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Eye highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(24 * scale, -9 * scale, 0.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Eyelid/brow
      ctx.strokeStyle = "#2a1810";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(24 * scale, -8 * scale, 3.5 * scale, Math.PI + 0.3, -0.3);
      ctx.stroke();

      // Snow clinging to fur
      ctx.fillStyle = "rgba(240, 248, 255, 0.8)";
      ctx.beginPath();
      ctx.ellipse(-2 * scale, -13 * scale, 16 * scale, 4 * scale, -0.1, 0, Math.PI * 2);
      ctx.fill();
      // Scattered snow clumps
      for (let sc = 0; sc < 6; sc++) {
        const scx = -15 * scale + sc * 6 * scale;
        const scy = -6 * scale + seededRandom(mx + sc * 11) * 10 * scale;
        ctx.beginPath();
        ctx.arc(scx, scy, (1.5 + seededRandom(mx + sc * 13)) * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ear
      ctx.fillStyle = "#5a4030";
      ctx.beginPath();
      ctx.ellipse(12 * scale, -10 * scale, 5 * scale, 8 * scale, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4a3020";
      ctx.beginPath();
      ctx.ellipse(12 * scale, -10 * scale, 3.5 * scale, 6 * scale, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };
    drawMammoth(1230, 65, 0.5, 1);
    drawMammoth(1300, 25, 0.4, -1);

    // Enhanced snowfall with different flake sizes, tumbling rotation, wind gusts
    for (let layer = 0; layer < 3; layer++) {
      const speed = 18 + layer * 18;
      const baseSize = 1 + layer * 1;
      const opacity = 0.25 + layer * 0.2;
      for (let i = 0; i < 25; i++) {
        const sx = 1080 + seededRandom(i * 7 + layer * 100) * 360;
        const baseY = seededRandom(i * 11 + layer * 50) * height;
        const sy = (time * speed + baseY) % height;
        const windGust = Math.sin(time * 0.8 + i * 0.2) * (5 + layer * 3);
        const drift = Math.sin(time * 2 + i * 0.3 + layer) * (3 + layer * 2) + windGust;
        const flakeSize = baseSize * (0.6 + seededRandom(i * 3 + layer * 70) * 0.8);
        const tumble = time * 3 + i * 1.7 + layer * 0.5;
        ctx.save();
        ctx.translate(sx + drift, sy);
        ctx.rotate(tumble);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        if (layer === 2 && seededRandom(i * 9 + layer) > 0.5) {
          // Larger flakes: draw 6-pointed star shape
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          for (let p = 0; p < 6; p++) {
            const angle = (p / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * flakeSize * 1.5, Math.sin(angle) * flakeSize * 1.5);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(0, 0, flakeSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, flakeSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Frost overlay at edges
    ctx.save();
    const frostGrad = ctx.createLinearGradient(1080, 0, 1100, 0);
    frostGrad.addColorStop(0, "rgba(200, 230, 255, 0.15)");
    frostGrad.addColorStop(1, "rgba(200, 230, 255, 0)");
    ctx.fillStyle = frostGrad;
    ctx.fillRect(1080, 0, 40, height);
    const frostGrad2 = ctx.createLinearGradient(1420, 0, 1440, 0);
    frostGrad2.addColorStop(0, "rgba(200, 230, 255, 0)");
    frostGrad2.addColorStop(1, "rgba(200, 230, 255, 0.15)");
    ctx.fillStyle = frostGrad2;
    ctx.fillRect(1400, 0, 40, height);
    ctx.restore()

    // === INFERNO DEPTHS DETAILS === (Enhanced Volcanic Environment)

    // Hellish sky gradient overlay with pulsing intensity
    ctx.save();
    const skyGrad = ctx.createLinearGradient(1440, 0, 1440, height * 0.5);
    skyGrad.addColorStop(0, `rgba(80, 20, 10, ${0.35 + Math.sin(time * 0.5) * 0.08})`);
    skyGrad.addColorStop(0.3, `rgba(120, 40, 20, ${0.25 + Math.sin(time * 0.7) * 0.06})`);
    skyGrad.addColorStop(0.6, `rgba(90, 25, 12, ${0.15 + Math.sin(time * 0.9) * 0.04})`);
    skyGrad.addColorStop(1, "rgba(60, 15, 8, 0)");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(1440, 0, 380, height * 0.5);
    ctx.restore();

    // Massive volcano with layered rock strata, branching lava flows, ash/lightning plume
    const drawVolcano = (vx: number, vyPct: number, vw: number, heightPx: number) => {
      const vy = getY(vyPct);
      const hw = vw / 2;

      // --- Ambient lava glow underneath ---
      const ambientGlow = ctx.createRadialGradient(vx, vy, hw * 0.3, vx, vy - heightPx * 0.3, hw * 1.4);
      ambientGlow.addColorStop(0, `rgba(200, 60, 10, ${0.12 + Math.sin(time * 1.5 + vx) * 0.04})`);
      ambientGlow.addColorStop(0.5, `rgba(120, 30, 5, ${0.06 + Math.sin(time * 2 + vx) * 0.02})`);
      ambientGlow.addColorStop(1, "rgba(80, 20, 5, 0)");
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.ellipse(vx, vy - heightPx * 0.2, hw * 1.3, heightPx * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- Ground shadow ---
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(vx + 4, vy + 8, hw * 0.7, heightPx * 0.15, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // --- BACK SLOPE (shadowed right side for 3D) ---
      const backGrad = ctx.createLinearGradient(vx, vy - heightPx, vx + hw * 0.6, vy);
      backGrad.addColorStop(0, "#2a1510");
      backGrad.addColorStop(0.4, "#1e0e0a");
      backGrad.addColorStop(1, "#140808");
      ctx.fillStyle = backGrad;
      ctx.beginPath();
      ctx.moveTo(vx + hw * 0.12, vy - heightPx);
      // Organic rocky right edge using bezier curves
      ctx.bezierCurveTo(
        vx + hw * 0.22, vy - heightPx * 0.7,
        vx + hw * 0.38, vy - heightPx * 0.4,
        vx + hw * 0.55, vy + 6
      );
      ctx.lineTo(vx + hw * 0.12, vy + 6);
      ctx.closePath();
      ctx.fill();

      // --- FRONT SLOPE (lit left side) ---
      const frontGrad = ctx.createLinearGradient(vx - hw * 0.6, vy - heightPx, vx + hw * 0.1, vy);
      frontGrad.addColorStop(0, "#4a2a20");
      frontGrad.addColorStop(0.15, "#583028");
      frontGrad.addColorStop(0.35, "#4a2520");
      frontGrad.addColorStop(0.55, "#3a1a15");
      frontGrad.addColorStop(0.75, "#2a1210");
      frontGrad.addColorStop(1, "#1a0a08");
      ctx.fillStyle = frontGrad;
      ctx.beginPath();
      ctx.moveTo(vx - hw * 0.12, vy - heightPx);
      // Organic rocky left edge
      ctx.bezierCurveTo(
        vx - hw * 0.25, vy - heightPx * 0.65,
        vx - hw * 0.42, vy - heightPx * 0.3,
        vx - hw * 0.55, vy + 6
      );
      ctx.lineTo(vx + hw * 0.12, vy + 6);
      ctx.lineTo(vx + hw * 0.12, vy - heightPx);
      ctx.closePath();
      ctx.fill();

      // --- Rocky ridge details on front face ---
      ctx.save();
      for (let r = 0; r < 5; r++) {
        const ridgeY = vy - heightPx * (0.15 + r * 0.15);
        const ridgeW = hw * (0.5 - r * 0.06);
        const ridgeLight = 30 + r * 8;
        ctx.strokeStyle = `rgba(${ridgeLight + 20}, ${ridgeLight}, ${ridgeLight - 5}, 0.25)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(vx - ridgeW, ridgeY + seededRandom(vx + r) * 4);
        ctx.quadraticCurveTo(
          vx - ridgeW * 0.3, ridgeY - 2 + seededRandom(vx + r + 1) * 3,
          vx + ridgeW * 0.4, ridgeY + 1 + seededRandom(vx + r + 2) * 3
        );
        ctx.stroke();
      }
      ctx.restore();

      // --- Surface rock texture (small marks) ---
      ctx.save();
      ctx.globalAlpha = 0.15;
      for (let t = 0; t < 12; t++) {
        const tx = vx + (seededRandom(vx + t * 13) - 0.5) * hw * 0.8;
        const ty = vy - seededRandom(vx + t * 13 + 1) * heightPx * 0.85;
        const ts = 1.5 + seededRandom(vx + t * 13 + 2) * 3;
        ctx.fillStyle = seededRandom(t + vx) > 0.5 ? "#5a3a2a" : "#1a0a06";
        ctx.beginPath();
        ctx.ellipse(tx, ty, ts, ts * 0.4, seededRandom(t) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // --- LAVA FLOWS (winding rivers, not straight lines) ---
      for (let f = 0; f < 3; f++) {
        const seed = seededRandom(vx + f * 17);
        const flowStartX = vx - hw * 0.08 + f * hw * 0.08;
        const flowEndX = vx + (f - 1) * hw * 0.35 + seed * hw * 0.15;
        const flowMid1X = flowStartX + (flowEndX - flowStartX) * 0.3 + (seed - 0.5) * 12;
        const flowMid1Y = vy - heightPx * 0.65;
        const flowMid2X = flowStartX + (flowEndX - flowStartX) * 0.65 + (seed - 0.5) * 18;
        const flowMid2Y = vy - heightPx * 0.3;
        const flowPulse = 0.55 + Math.sin(time * 2.2 + f * 1.8 + vx * 0.01) * 0.2;

        // Outer glow (wide, dim)
        ctx.strokeStyle = `rgba(180, 40, 5, ${flowPulse * 0.3})`;
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(flowStartX, vy - heightPx + 7);
        ctx.bezierCurveTo(flowMid1X, flowMid1Y, flowMid2X, flowMid2Y, flowEndX, vy + 2);
        ctx.stroke();

        // Main lava body
        ctx.strokeStyle = `rgba(220, 80, 15, ${flowPulse * 0.7})`;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Bright core
        ctx.strokeStyle = `rgba(255, 180, 60, ${flowPulse * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Hot white center
        ctx.strokeStyle = `rgba(255, 240, 180, ${flowPulse * 0.25})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // --- CRATER ---
      // Crater rim (dark rock ring)
      const craterW = hw * 0.28;
      const craterH = heightPx * 0.12;
      const craterY = vy - heightPx + 2;

      // Rim shadow
      ctx.fillStyle = "#0a0404";
      ctx.beginPath();
      ctx.ellipse(vx, craterY + 3, craterW + 2, craterH + 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rim rock with gradient
      const rimGrad = ctx.createRadialGradient(vx - craterW * 0.3, craterY - 2, 0, vx, craterY, craterW + 4);
      rimGrad.addColorStop(0, "#5a3020");
      rimGrad.addColorStop(0.5, "#3a1a12");
      rimGrad.addColorStop(1, "#1a0a06");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.ellipse(vx, craterY, craterW + 3, craterH + 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crater pit (deep dark)
      ctx.fillStyle = "#080303";
      ctx.beginPath();
      ctx.ellipse(vx, craterY + 1, craterW - 1, craterH - 1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lava glow from crater (pulsing)
      const lavaGlow = ctx.createRadialGradient(vx, craterY + 1, 0, vx, craterY + 1, craterW * 1.8);
      const glowPulse = 0.6 + Math.sin(time * 2.8 + vx * 0.02) * 0.25;
      lavaGlow.addColorStop(0, `rgba(255, 220, 100, ${glowPulse})`);
      lavaGlow.addColorStop(0.2, `rgba(255, 140, 40, ${glowPulse * 0.7})`);
      lavaGlow.addColorStop(0.5, `rgba(200, 60, 10, ${glowPulse * 0.3})`);
      lavaGlow.addColorStop(1, "rgba(120, 30, 5, 0)");
      ctx.fillStyle = lavaGlow;
      ctx.beginPath();
      ctx.arc(vx, craterY + 1, craterW * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Rim highlight (hot edge glint)
      ctx.strokeStyle = `rgba(255, 130, 40, ${0.3 + Math.sin(time * 3 + vx) * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(vx, craterY, craterW + 1, craterH + 1, 0, Math.PI + 0.5, Math.PI * 2 - 0.5);
      ctx.stroke();

      // --- SMOKE PLUME ---
      for (let s = 0; s < 6; s++) {
        const smokeAge = (time * 10 + s * 14) % 55;
        const smokeY2 = craterY - smokeAge * 1.1;
        const drift = Math.sin(time * 0.8 + s * 2.2) * (4 + smokeAge * 0.25);
        const smokeR = 6 + smokeAge * 0.45;
        const alpha = Math.max(0, 0.35 - smokeAge / 70);
        if (alpha <= 0) continue;

        // Ash/smoke puff
        ctx.fillStyle = `rgba(45, 35, 30, ${alpha})`;
        ctx.beginPath();
        ctx.arc(vx + drift, smokeY2, smokeR, 0, Math.PI * 2);
        ctx.fill();
        // Second blob for volume
        ctx.fillStyle = `rgba(55, 45, 38, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(vx + drift + smokeR * 0.4, smokeY2 - smokeR * 0.3, smokeR * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Hot underlit glow on fresh smoke
        if (smokeAge < 18) {
          ctx.fillStyle = `rgba(160, 60, 15, ${alpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(vx + drift, smokeY2 + smokeR * 0.3, smokeR * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Scattered embers from crater ---
      for (let e = 0; e < 4; e++) {
        const eAge = (time * 25 + e * 20 + vx) % 40;
        const eX = vx + Math.sin(time * 3 + e * 2.5 + vx) * (3 + eAge * 0.3);
        const eY = craterY - eAge * 0.8;
        const eAlpha = Math.max(0, 0.8 - eAge / 30);
        if (eAlpha > 0) {
          ctx.fillStyle = `rgba(255, ${150 + Math.floor(seededRandom(e + vx) * 80)}, 30, ${eAlpha})`;
          ctx.beginPath();
          ctx.arc(eX, eY, 1 + seededRandom(e + vx) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    drawVolcano(1530, 22, 95, 35);
    drawVolcano(1700, 21, 85, 30);

    drawVolcano(1720, 24, 95, 45);

    drawVolcano(1720, 84, 95, 45);
    drawVolcano(1700, 86, 85, 30);

    // Lava pools with crusted surface, bubbles forming/popping, heat shimmer
    const drawLavaPool = (px: number, pyPct: number, width: number, heightRatio: number) => {
      const py = getY(pyPct);

      // Heat distortion shimmer above pool
      ctx.save();
      ctx.globalAlpha = 0.04 + Math.sin(time * 3 + px) * 0.02;
      for (let h = 0; h < 4; h++) {
        const heatY = py - width * heightRatio - 5 - h * 6;
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        for (let hx = px - width; hx < px + width; hx += 4) {
          const distort = Math.sin(time * 6 + hx * 0.08 + h * 0.7) * 2;
          if (hx === px - width) ctx.moveTo(hx, heatY + distort);
          else ctx.lineTo(hx, heatY + distort);
        }
        ctx.lineTo(px + width, heatY + 4);
        ctx.lineTo(px - width, heatY + 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Outer glow
      const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, width * 1.6);
      glowGrad.addColorStop(0, `rgba(255, 100, 30, ${0.28 + Math.sin(time * 2) * 0.1})`);
      glowGrad.addColorStop(0.4, `rgba(255, 60, 20, ${0.15 + Math.sin(time * 2.5) * 0.06})`);
      glowGrad.addColorStop(1, "rgba(200, 40, 10, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, width * 1.6, width * heightRatio * 1.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pool edge (cooled lava crust)
      ctx.fillStyle = "#2a1a12";
      ctx.beginPath();
      ctx.ellipse(px, py, width + 5, width * heightRatio + 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Crust detail on edge
      ctx.strokeStyle = "rgba(60, 30, 15, 0.5)";
      ctx.lineWidth = 1;
      for (let ec = 0; ec < 8; ec++) {
        const angle = (ec / 8) * Math.PI * 2;
        const edgeX = px + Math.cos(angle) * (width + 2);
        const edgeY = py + Math.sin(angle) * (width * heightRatio + 2);
        ctx.beginPath();
        ctx.arc(edgeX, edgeY, 3 + seededRandom(px + ec) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Main lava surface
      const lavaGrad = ctx.createRadialGradient(px - width * 0.2, py - width * heightRatio * 0.2, 0, px, py, width);
      lavaGrad.addColorStop(0, "#ffdd55");
      lavaGrad.addColorStop(0.2, "#ffaa22");
      lavaGrad.addColorStop(0.5, "#ee5511");
      lavaGrad.addColorStop(0.8, "#cc2200");
      lavaGrad.addColorStop(1, "#881100");
      ctx.fillStyle = lavaGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, width, width * heightRatio, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crusted dark surface patches with bright cracks
      ctx.save();
      ctx.globalAlpha = 0.35;
      for (let cr = 0; cr < 5; cr++) {
        const crX = px - width * 0.5 + seededRandom(px + cr * 19) * width;
        const crY = py - width * heightRatio * 0.3 + seededRandom(px + cr * 23) * width * heightRatio * 0.6;
        const crSize = 4 + seededRandom(px + cr * 29) * 8;
        const crDx = (crX - px) / width;
        const crDy = (crY - py) / (width * heightRatio);
        if (crDx * crDx + crDy * crDy < 0.7) {
          // Dark crust patch
          ctx.fillStyle = "rgba(30, 15, 10, 0.6)";
          ctx.beginPath();
          ctx.ellipse(crX, crY, crSize, crSize * 0.6, seededRandom(px + cr) * 1.5, 0, Math.PI * 2);
          ctx.fill();
          // Bright crack around patch
          ctx.strokeStyle = `rgba(255, 180, 60, ${0.4 + Math.sin(time * 3 + cr) * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(crX, crY, crSize + 1, crSize * 0.6 + 1, seededRandom(px + cr) * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Bubbles forming and popping with splashes
      for (let b = 0; b < 6; b++) {
        const bubbleCycle = (time * 2.5 + b * 1.2 + px * 0.1) % 2.5;
        const bx = px - width * 0.5 + seededRandom(px + b) * width;
        const by = py - width * heightRatio * 0.3 + seededRandom(px + b + 10) * width * heightRatio * 0.6;
        const bDx = (bx - px) / width;
        const bDy = (by - py) / (width * heightRatio);
        if (bDx * bDx + bDy * bDy < 0.7) {
          if (bubbleCycle < 1.8) {
            // Growing bubble
            const bSize = 1.5 + bubbleCycle * 2.5;
            ctx.fillStyle = `rgba(255, 200, 100, ${0.5 - bubbleCycle * 0.2})`;
            ctx.beginPath();
            ctx.arc(bx, by, bSize, 0, Math.PI * 2);
            ctx.fill();
            // Bubble highlight
            ctx.fillStyle = `rgba(255, 240, 180, ${0.3 - bubbleCycle * 0.1})`;
            ctx.beginPath();
            ctx.arc(bx - bSize * 0.3, by - bSize * 0.3, bSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
          } else if (bubbleCycle < 2.1) {
            // Pop splash
            const popPhase = (bubbleCycle - 1.8) / 0.3;
            ctx.fillStyle = `rgba(255, 180, 60, ${0.6 - popPhase * 0.6})`;
            for (let sp = 0; sp < 4; sp++) {
              const spAngle = (sp / 4) * Math.PI * 2 + b;
              const spDist = 3 + popPhase * 6;
              ctx.beginPath();
              ctx.arc(bx + Math.cos(spAngle) * spDist, by + Math.sin(spAngle) * spDist * 0.5, 1.5 - popPhase, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Surface shimmer lines
      ctx.strokeStyle = `rgba(255, 220, 150, ${0.3 + Math.sin(time * 4) * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(px - width * 0.3, py - width * heightRatio * 0.2, width * 0.3, width * heightRatio * 0.2, 0.3, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(px + width * 0.15, py + width * heightRatio * 0.1, width * 0.2, width * heightRatio * 0.15, -0.2, 0, Math.PI);
      ctx.stroke();
    };
    drawLavaPool(1500, 65, 30, 0.35);
    drawLavaPool(1620, 78, 25, 0.3);
    drawLavaPool(1700, 55, 35, 0.4);
    drawLavaPool(1760, 75, 28, 0.35);

    // Lava rivers — organic bezier paths with layered glow, crusted banks, embers
    const drawLavaRiver = (points: number[][]) => {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Helper: draw smooth bezier through points
      const tracePath = (offsetX: number, offsetY: number) => {
        const pts = points.map((p) => [p[0] + offsetX, getY(p[1]) + offsetY]);
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        if (pts.length === 2) {
          ctx.lineTo(pts[1][0], pts[1][1]);
        } else {
          for (let i = 1; i < pts.length - 1; i++) {
            const cpx = (pts[i][0] + pts[i + 1][0]) / 2;
            const cpy = (pts[i][1] + pts[i + 1][1]) / 2;
            ctx.quadraticCurveTo(pts[i][0], pts[i][1], cpx, cpy);
          }
          ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
        }
      };

      const pulse = 0.5 + Math.sin(time * 2) * 0.5;

      // Ambient glow (combined outer layers)
      tracePath(0, 0);
      ctx.strokeStyle = `rgba(255, 60, 0, ${0.08 + pulse * 0.04})`;
      ctx.lineWidth = 28;
      ctx.stroke();

      // Cooled rock bank edges (dark crust)
      tracePath(0, 0);
      ctx.strokeStyle = "rgba(30, 15, 8, 0.85)";
      ctx.lineWidth = 14;
      ctx.stroke();

      // Main molten lava body (flat animated color instead of gradient)
      tracePath(0, 0);
      ctx.strokeStyle = `rgba(255, ${100 + pulse * 40}, ${10 + pulse * 20}, 0.9)`;
      ctx.lineWidth = 7;
      ctx.stroke();

      // Bright hot vein
      tracePath(0, 0);
      ctx.strokeStyle = `rgba(255, 200, 80, ${0.55 + pulse * 0.25})`;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // White-hot core
      tracePath(0, 0);
      ctx.strokeStyle = `rgba(255, 240, 180, ${0.25 + pulse * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Surface texture — dark cooled patches drifting along
      for (let r = 0; r < 5; r++) {
        const speed = 6 + seededRandom(r + points[0][0] * 0.01) * 4;
        const raftProgress = ((time * speed + r * 20 + points[0][0] * 0.1) % 100) / 100;
        const segIdx = Math.min(Math.floor(raftProgress * (points.length - 1)), points.length - 2);
        const segT = (raftProgress * (points.length - 1)) - segIdx;
        const raftX = points[segIdx][0] + (points[segIdx + 1][0] - points[segIdx][0]) * segT;
        const raftYPct = points[segIdx][1] + (points[segIdx + 1][1] - points[segIdx][1]) * segT;
        const raftY = getY(raftYPct);
        const raftSize = 1.5 + seededRandom(points[0][0] + r * 11) * 2.5;
        // Dark crust chunk
        ctx.fillStyle = `rgba(35, 18, 10, ${0.5 + seededRandom(r * 7) * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(raftX, raftY, raftSize, raftSize * 0.5, seededRandom(r + points[0][0]) * 2, 0, Math.PI * 2);
        ctx.fill();
        // Hot edge on chunk
        ctx.strokeStyle = `rgba(255, 120, 30, ${0.2 + pulse * 0.15})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Rising embers along the river
      for (let e = 0; e < 4; e++) {
        const eAge = (time * 12 + e * 18 + points[0][0] * 0.3) % 35;
        const eIdx = Math.floor(e * (points.length - 1) / 4);
        const ex = points[eIdx][0] + Math.sin(time * 2 + e * 3) * 6;
        const ey = getY(points[eIdx][1]) - eAge * 1.5;
        const eAlpha = Math.max(0, 0.7 - eAge / 25);
        if (eAlpha > 0) {
          const eSize = 1.2 - eAge * 0.025;
          if (eSize > 0.3) {
            ctx.fillStyle = `rgba(255, ${180 - eAge * 4}, ${50 - eAge}, ${eAlpha})`;
            ctx.beginPath();
            ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Steam wisps at junction points
      for (let i = 1; i < points.length - 1; i++) {
        for (let s = 0; s < 2; s++) {
          const sAge = (time * 6 + s * 12 + i * 8) % 20;
          const sx = points[i][0] + Math.sin(time * 1.5 + s + i) * 5 + (s === 0 ? -6 : 6);
          const sy = getY(points[i][1]) - 4 - sAge * 1.2;
          const sAlpha = Math.max(0, 0.15 - sAge / 30);
          if (sAlpha > 0) {
            ctx.fillStyle = `rgba(200, 190, 180, ${sAlpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 2 + sAge * 0.25, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    };
    drawLavaRiver([
      [1460, 72], [1490, 65], [1520, 68], [1560, 62], [1590, 68],
    ]);
    drawLavaRiver([
      [1480, 38], [1510, 42], [1550, 38], [1590, 45],
    ]);
    drawLavaRiver([
      [1640, 45], [1680, 50], [1720, 48], [1760, 55],
    ]);

    // Obsidian spires with reflective glass surface, geometric fractures, magical glow
    const drawObsidianSpire = (sx: number, syPct: number, scale: number) => {
      const sy = getY(syPct);

      // Shadow
      ctx.fillStyle = "rgba(20, 10, 10, 0.35)";
      ctx.beginPath();
      ctx.ellipse(sx + 5 * scale, sy + 4 * scale, 14 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Purple/blue magical glow at base
      const magicGlow = ctx.createRadialGradient(sx, sy - 15 * scale, 0, sx, sy - 15 * scale, 20 * scale);
      magicGlow.addColorStop(0, `rgba(120, 80, 200, ${0.15 + Math.sin(time * 2 + sx) * 0.08})`);
      magicGlow.addColorStop(0.5, `rgba(80, 60, 180, ${0.08 + Math.sin(time * 1.5 + sx) * 0.04})`);
      magicGlow.addColorStop(1, "rgba(60, 40, 150, 0)");
      ctx.fillStyle = magicGlow;
      ctx.beginPath();
      ctx.arc(sx, sy - 15 * scale, 20 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Main spire body
      const spireGrad = ctx.createLinearGradient(sx - 10 * scale, sy, sx + 10 * scale, sy - 42 * scale);
      spireGrad.addColorStop(0, "#1a1018");
      spireGrad.addColorStop(0.3, "#2a1a25");
      spireGrad.addColorStop(0.5, "#18101a");
      spireGrad.addColorStop(0.7, "#100a12");
      spireGrad.addColorStop(1, "#0a050a");
      ctx.fillStyle = spireGrad;
      ctx.beginPath();
      ctx.moveTo(sx - 10 * scale, sy + 2 * scale);
      ctx.lineTo(sx - 8 * scale, sy - 12 * scale);
      ctx.lineTo(sx - 6 * scale, sy - 25 * scale);
      ctx.lineTo(sx - 3 * scale, sy - 36 * scale);
      ctx.lineTo(sx - 2 * scale, sy - 42 * scale);
      ctx.lineTo(sx + 1 * scale, sy - 38 * scale);
      ctx.lineTo(sx + 3 * scale, sy - 35 * scale);
      ctx.lineTo(sx + 6 * scale, sy - 22 * scale);
      ctx.lineTo(sx + 8 * scale, sy - 18 * scale);
      ctx.lineTo(sx + 10 * scale, sy + 2 * scale);
      ctx.closePath();
      ctx.fill();

      // Reflective glass-like surface highlight (specular band)
      ctx.save();
      ctx.globalAlpha = 0.25;
      const reflectGrad = ctx.createLinearGradient(sx - 6 * scale, sy, sx - 2 * scale, sy - 40 * scale);
      reflectGrad.addColorStop(0, "rgba(120, 100, 140, 0)");
      reflectGrad.addColorStop(0.3, "rgba(140, 120, 160, 0.5)");
      reflectGrad.addColorStop(0.5, "rgba(180, 160, 200, 0.6)");
      reflectGrad.addColorStop(0.7, "rgba(140, 120, 160, 0.3)");
      reflectGrad.addColorStop(1, "rgba(120, 100, 140, 0)");
      ctx.fillStyle = reflectGrad;
      ctx.beginPath();
      ctx.moveTo(sx - 7 * scale, sy - 5 * scale);
      ctx.lineTo(sx - 4 * scale, sy - 32 * scale);
      ctx.lineTo(sx - 2 * scale, sy - 30 * scale);
      ctx.lineTo(sx - 5 * scale, sy - 5 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Colored highlight reflections (blue/purple)
      ctx.fillStyle = `rgba(100, 80, 200, ${0.12 + Math.sin(time * 1.5 + sx * 0.3) * 0.06})`;
      ctx.beginPath();
      ctx.moveTo(sx + 4 * scale, sy - 10 * scale);
      ctx.lineTo(sx + 6 * scale, sy - 20 * scale);
      ctx.lineTo(sx + 7 * scale, sy - 18 * scale);
      ctx.lineTo(sx + 5 * scale, sy - 8 * scale);
      ctx.closePath();
      ctx.fill();

      // Geometric fracture patterns
      ctx.strokeStyle = "rgba(80, 60, 100, 0.35)";
      ctx.lineWidth = 0.8;
      // Diagonal fractures
      ctx.beginPath();
      ctx.moveTo(sx - 8 * scale, sy - 8 * scale);
      ctx.lineTo(sx - 3 * scale, sy - 20 * scale);
      ctx.lineTo(sx + 2 * scale, sy - 15 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + 5 * scale, sy - 5 * scale);
      ctx.lineTo(sx + 2 * scale, sy - 18 * scale);
      ctx.lineTo(sx - 1 * scale, sy - 30 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx - 5 * scale, sy - 15 * scale);
      ctx.lineTo(sx + 4 * scale, sy - 25 * scale);
      ctx.stroke();

      // Glowing magma cracks (brighter)
      ctx.strokeStyle = `rgba(255, 100, 30, ${0.6 + Math.sin(time * 3 + sx) * 0.3})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(sx - 4 * scale, sy - 5 * scale);
      ctx.lineTo(sx - 2 * scale, sy - 18 * scale);
      ctx.lineTo(sx + 2 * scale, sy - 25 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + 3 * scale, sy - 8 * scale);
      ctx.lineTo(sx + 5 * scale, sy - 20 * scale);
      ctx.stroke();

      // Crack glow aura
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(time * 2.5 + sx) * 0.08;
      ctx.strokeStyle = "rgba(255, 120, 60, 0.4)";
      ctx.lineWidth = 5 * scale;
      ctx.beginPath();
      ctx.moveTo(sx - 4 * scale, sy - 5 * scale);
      ctx.lineTo(sx - 2 * scale, sy - 18 * scale);
      ctx.lineTo(sx + 2 * scale, sy - 25 * scale);
      ctx.stroke();
      ctx.restore();
    };
    [
      [1475, 48], [1530, 72], [1580, 35], [1640, 62],
      [1690, 42], [1740, 68], [1780, 38],
    ].forEach(([x, yPct], i) => {
      drawObsidianSpire(x, yPct, 0.7 + seededRandom(i + 400) * 0.4);
    });

    // Demon statue with wings, runic inscriptions, ritual circle
    const drawDemonStatue = (dx: number, dyPct: number, scale: number) => {
      const dy = getY(dyPct);

      // Ritual circle at base (glowing runes)
      ctx.save();
      const circleRadius = 18 * scale;
      // Outer circle glow
      const ritualGlow = ctx.createRadialGradient(dx, dy, circleRadius * 0.5, dx, dy, circleRadius * 1.3);
      ritualGlow.addColorStop(0, `rgba(180, 40, 20, ${0.1 + Math.sin(time * 1.5) * 0.05})`);
      ritualGlow.addColorStop(1, "rgba(150, 30, 15, 0)");
      ctx.fillStyle = ritualGlow;
      ctx.beginPath();
      ctx.arc(dx, dy, circleRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      // Circle line
      ctx.strokeStyle = `rgba(200, 60, 30, ${0.4 + Math.sin(time * 2) * 0.15})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(dx, dy, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Inner circle
      ctx.beginPath();
      ctx.arc(dx, dy, circleRadius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      // Runic symbols around circle
      for (let r = 0; r < 8; r++) {
        const runeAngle = (r / 8) * Math.PI * 2 + time * 0.2;
        const runeX = dx + Math.cos(runeAngle) * circleRadius * 0.85;
        const runeY = dy + Math.sin(runeAngle) * circleRadius * 0.85 * 0.5;
        ctx.fillStyle = `rgba(255, 80, 30, ${0.5 + Math.sin(time * 3 + r) * 0.3})`;
        ctx.beginPath();
        ctx.arc(runeX, runeY, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Pedestal (stepped)
      ctx.fillStyle = "#2a1a18";
      ctx.fillRect(dx - 14 * scale, dy - 5 * scale, 28 * scale, 10 * scale);
      ctx.fillStyle = "#3a2a28";
      ctx.fillRect(dx - 12 * scale, dy - 9 * scale, 24 * scale, 6 * scale);
      ctx.fillStyle = "#352520";
      ctx.fillRect(dx - 10 * scale, dy - 12 * scale, 20 * scale, 5 * scale);

      // Body (wider torso)
      const statueGrad = ctx.createLinearGradient(dx - 10 * scale, dy - 42 * scale, dx + 10 * scale, dy - 12 * scale);
      statueGrad.addColorStop(0, "#2a2025");
      statueGrad.addColorStop(0.3, "#3a2a30");
      statueGrad.addColorStop(0.6, "#2a2025");
      statueGrad.addColorStop(1, "#1a1015");
      ctx.fillStyle = statueGrad;
      ctx.beginPath();
      ctx.moveTo(dx - 9 * scale, dy - 12 * scale);
      ctx.lineTo(dx - 8 * scale, dy - 22 * scale);
      ctx.lineTo(dx - 10 * scale, dy - 28 * scale);
      ctx.lineTo(dx - 7 * scale, dy - 34 * scale);
      ctx.lineTo(dx - 5 * scale, dy - 38 * scale);
      ctx.lineTo(dx + 5 * scale, dy - 38 * scale);
      ctx.lineTo(dx + 7 * scale, dy - 34 * scale);
      ctx.lineTo(dx + 10 * scale, dy - 28 * scale);
      ctx.lineTo(dx + 8 * scale, dy - 22 * scale);
      ctx.lineTo(dx + 9 * scale, dy - 12 * scale);
      ctx.closePath();
      ctx.fill();

      // Wings (spread outward)
      ctx.fillStyle = "#1a1018";
      // Left wing
      ctx.beginPath();
      ctx.moveTo(dx - 7 * scale, dy - 30 * scale);
      ctx.quadraticCurveTo(dx - 22 * scale, dy - 45 * scale, dx - 28 * scale, dy - 38 * scale);
      ctx.quadraticCurveTo(dx - 25 * scale, dy - 32 * scale, dx - 18 * scale, dy - 28 * scale);
      ctx.quadraticCurveTo(dx - 22 * scale, dy - 26 * scale, dx - 24 * scale, dy - 20 * scale);
      ctx.quadraticCurveTo(dx - 18 * scale, dy - 22 * scale, dx - 8 * scale, dy - 24 * scale);
      ctx.closePath();
      ctx.fill();
      // Right wing
      ctx.beginPath();
      ctx.moveTo(dx + 7 * scale, dy - 30 * scale);
      ctx.quadraticCurveTo(dx + 22 * scale, dy - 45 * scale, dx + 28 * scale, dy - 38 * scale);
      ctx.quadraticCurveTo(dx + 25 * scale, dy - 32 * scale, dx + 18 * scale, dy - 28 * scale);
      ctx.quadraticCurveTo(dx + 22 * scale, dy - 26 * scale, dx + 24 * scale, dy - 20 * scale);
      ctx.quadraticCurveTo(dx + 18 * scale, dy - 22 * scale, dx + 8 * scale, dy - 24 * scale);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.fillStyle = "#2a2025";
      ctx.beginPath();
      ctx.arc(dx, dy - 42 * scale, 7 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Horns (curved and detailed)
      ctx.fillStyle = "#1a1015";
      ctx.beginPath();
      ctx.moveTo(dx - 4 * scale, dy - 46 * scale);
      ctx.quadraticCurveTo(dx - 14 * scale, dy - 55 * scale, dx - 12 * scale, dy - 48 * scale);
      ctx.lineTo(dx - 6 * scale, dy - 44 * scale);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dx + 4 * scale, dy - 46 * scale);
      ctx.quadraticCurveTo(dx + 14 * scale, dy - 55 * scale, dx + 12 * scale, dy - 48 * scale);
      ctx.lineTo(dx + 6 * scale, dy - 44 * scale);
      ctx.fill();

      // Glowing runic inscriptions on body
      ctx.strokeStyle = `rgba(255, 80, 30, ${0.4 + Math.sin(time * 3 + dx) * 0.25})`;
      ctx.lineWidth = 1;
      // Rune lines on torso
      ctx.beginPath();
      ctx.moveTo(dx - 3 * scale, dy - 18 * scale);
      ctx.lineTo(dx, dy - 22 * scale);
      ctx.lineTo(dx + 3 * scale, dy - 18 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dx - 4 * scale, dy - 26 * scale);
      ctx.lineTo(dx, dy - 30 * scale);
      ctx.lineTo(dx + 4 * scale, dy - 26 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dx, dy - 16 * scale);
      ctx.lineTo(dx, dy - 32 * scale);
      ctx.stroke();

      // Glowing eyes
      ctx.fillStyle = `rgba(255, 50, 20, ${0.8 + Math.sin(time * 4 + dx) * 0.2})`;
      ctx.beginPath();
      ctx.arc(dx - 2.5 * scale, dy - 43 * scale, 1.8 * scale, 0, Math.PI * 2);
      ctx.arc(dx + 2.5 * scale, dy - 43 * scale, 1.8 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Eye glow aura
      const eyeGlow = ctx.createRadialGradient(dx, dy - 43 * scale, 0, dx, dy - 43 * scale, 12 * scale);
      eyeGlow.addColorStop(0, `rgba(255, 50, 20, ${0.25 + Math.sin(time * 3) * 0.1})`);
      eyeGlow.addColorStop(1, "rgba(255, 50, 20, 0)");
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(dx, dy - 43 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawDemonStatue(1560, 52, 0.8);
    drawDemonStatue(1720, 28, 0.7);

    // Fire elemental with face features, trailing particles, heat distortion
    const drawFireElemental = (fx: number, fyPct: number, scale: number) => {
      const fy = getY(fyPct);
      const bob = Math.sin(time * 3 + fx) * 3;

      // Heat wave distortion ring
      ctx.save();
      ctx.globalAlpha = 0.04 + Math.sin(time * 3 + fx) * 0.02;
      for (let ring = 0; ring < 3; ring++) {
        const ringSize = 18 + ring * 8;
        ctx.strokeStyle = "#ff6600";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const distort = Math.sin(time * 5 + a * 3 + ring) * 2;
          const rx = fx + Math.cos(a) * (ringSize + distort) * scale;
          const ry = fy - 12 * scale + bob + Math.sin(a) * (ringSize * 0.6 + distort) * scale;
          if (a === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      // Glow aura
      const auraGrad = ctx.createRadialGradient(fx, fy - 15 * scale + bob, 0, fx, fy - 15 * scale + bob, 28 * scale);
      auraGrad.addColorStop(0, `rgba(255, 160, 60, ${0.35 + Math.sin(time * 4 + fx) * 0.12})`);
      auraGrad.addColorStop(0.3, `rgba(255, 100, 30, ${0.2 + Math.sin(time * 3) * 0.08})`);
      auraGrad.addColorStop(0.6, `rgba(255, 60, 15, ${0.1 + Math.sin(time * 2.5) * 0.04})`);
      auraGrad.addColorStop(1, "rgba(255, 40, 10, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(fx, fy - 15 * scale + bob, 28 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Body flames (layered for better shape)
      for (let layer = 0; layer < 3; layer++) {
        for (let f = 0; f < 6; f++) {
          const flameHeight = (22 - layer * 4) + Math.sin(time * 7 + f * 1.1 + layer * 0.5) * (8 - layer * 2);
          const flameWidth = (9 - layer * 1.5) - f * 0.6;
          const flamex = fx - 10 * scale + f * 4 * scale;
          const flamey = fy + bob + layer * 2 * scale;
          const r = Math.max(0, 255 - f * 15 - layer * 20);
          const g = Math.max(0, 80 + f * 30 + layer * 30);
          const b = Math.max(0, 10 + f * 8 + layer * 15);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.75 - layer * 0.15 - f * 0.05})`;
          ctx.beginPath();
          ctx.moveTo(flamex - flameWidth * scale * 0.5, flamey);
          ctx.quadraticCurveTo(
            flamex - flameWidth * scale * 0.2, flamey - flameHeight * scale * 0.6,
            flamex, flamey - flameHeight * scale
          );
          ctx.quadraticCurveTo(
            flamex + flameWidth * scale * 0.2, flamey - flameHeight * scale * 0.6,
            flamex + flameWidth * scale * 0.5, flamey
          );
          ctx.fill();
        }
      }

      // Face features
      // Eyes (bright yellow with dark slits)
      ctx.fillStyle = "#ffff66";
      ctx.beginPath();
      ctx.ellipse(fx - 4 * scale, fy - 14 * scale + bob, 2.5 * scale, 2 * scale, -0.1, 0, Math.PI * 2);
      ctx.ellipse(fx + 4 * scale, fy - 14 * scale + bob, 2.5 * scale, 2 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Pupils (menacing slits)
      ctx.fillStyle = "#cc4400";
      ctx.fillRect(fx - 4.5 * scale, fy - 15 * scale + bob, 1 * scale, 3 * scale);
      ctx.fillRect(fx + 3.5 * scale, fy - 15 * scale + bob, 1 * scale, 3 * scale);
      // Mouth (jagged grin)
      ctx.strokeStyle = `rgba(255, 220, 80, ${0.6 + Math.sin(time * 3) * 0.2})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(fx - 5 * scale, fy - 8 * scale + bob);
      ctx.lineTo(fx - 3 * scale, fy - 7 * scale + bob);
      ctx.lineTo(fx - 1 * scale, fy - 9 * scale + bob);
      ctx.lineTo(fx + 1 * scale, fy - 7 * scale + bob);
      ctx.lineTo(fx + 3 * scale, fy - 9 * scale + bob);
      ctx.lineTo(fx + 5 * scale, fy - 8 * scale + bob);
      ctx.stroke();

      // Trailing fire particles behind
      for (let tp = 0; tp < 8; tp++) {
        const trailAge = (time * 25 + tp * 8 + fx) % 30;
        const trailX = fx + Math.sin(time * 2 + tp * 1.5) * (4 + trailAge * 0.3) * scale;
        const trailY = fy + bob + trailAge * 0.8;
        const trailSize = (2.5 - trailAge * 0.06) * scale;
        if (trailSize > 0.3 && trailAge < 25) {
          const trailAlpha = Math.max(0, 0.6 - trailAge / 30);
          ctx.fillStyle = `rgba(255, ${120 + trailAge * 3}, ${30 + trailAge * 2}, ${trailAlpha})`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    drawFireElemental(1490, 55, 0.6);
    drawFireElemental(1660, 38, 0.5);
    drawFireElemental(1750, 62, 0.55);

    // Burning ruins with collapsed arches, standing columns, scattered debris
    const drawBurningRuins = (rx: number, ryPct: number, scale: number) => {
      const ry = getY(ryPct);

      // Scattered debris and rubble base
      ctx.fillStyle = "#2a2020";
      for (let r = 0; r < 12; r++) {
        const rubX = rx - 30 * scale + seededRandom(rx + r) * 60 * scale;
        const rubY = ry + seededRandom(rx + r + 10) * 10 * scale;
        const rubSize = 3 + seededRandom(rx + r + 20) * 7;
        ctx.fillStyle = r % 3 === 0 ? "#2a2020" : r % 3 === 1 ? "#332828" : "#241818";
        ctx.beginPath();
        ctx.arc(rubX, rubY, rubSize * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Standing columns (3 at varying heights)
      const columnPositions = [
        { x: -20, h: 35, w: 5 },
        { x: -5, h: 28, w: 6 },
        { x: 15, h: 22, w: 5 },
      ];
      columnPositions.forEach((col) => {
        const colGrad = ctx.createLinearGradient(rx + col.x * scale, ry - col.h * scale, rx + (col.x + col.w) * scale, ry);
        colGrad.addColorStop(0, "#3a2a28");
        colGrad.addColorStop(0.5, "#2a1a18");
        colGrad.addColorStop(1, "#221515");
        ctx.fillStyle = colGrad;
        ctx.fillRect(rx + col.x * scale, ry - col.h * scale, col.w * scale, (col.h + 5) * scale);

        // Column top (broken/jagged)
        ctx.fillStyle = "#2a1a18";
        ctx.beginPath();
        ctx.moveTo(rx + col.x * scale, ry - col.h * scale);
        ctx.lineTo(rx + (col.x + 1) * scale, ry - (col.h + 4) * scale);
        ctx.lineTo(rx + (col.x + 2.5) * scale, ry - (col.h + 1) * scale);
        ctx.lineTo(rx + (col.x + 4) * scale, ry - (col.h + 3) * scale);
        ctx.lineTo(rx + (col.x + col.w) * scale, ry - col.h * scale);
        ctx.closePath();
        ctx.fill();

        // Column texture lines
        ctx.strokeStyle = "rgba(80, 55, 45, 0.3)";
        ctx.lineWidth = 0.6;
        for (let cl = 0; cl < 3; cl++) {
          const lineX = rx + (col.x + 1.5 + cl * 1) * scale;
          ctx.beginPath();
          ctx.moveTo(lineX, ry - col.h * scale);
          ctx.lineTo(lineX, ry + 2 * scale);
          ctx.stroke();
        }
      });

      // Collapsed arch between first two columns
      ctx.strokeStyle = "#3a2a28";
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(rx - 18 * scale, ry - 32 * scale);
      ctx.quadraticCurveTo(rx - 10 * scale, ry - 40 * scale, rx - 3 * scale, ry - 26 * scale);
      ctx.stroke();

      // Fallen arch pieces on ground
      ctx.fillStyle = "#2a1a18";
      ctx.beginPath();
      ctx.ellipse(rx - 12 * scale, ry + 3 * scale, 8 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(rx + 8 * scale, ry + 5 * scale, 6 * scale, 2.5 * scale, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Multiple fire sources
      const firePositions = [
        { x: -18, y: -28, size: 1 },
        { x: -3, y: -22, size: 0.8 },
        { x: 16, y: -18, size: 0.9 },
        { x: -10, y: -8, size: 0.6 },
        { x: 8, y: -5, size: 0.5 },
      ];
      firePositions.forEach((fire, fi) => {
        const flameX = rx + fire.x * scale;
        const flameY = ry + fire.y * scale;
        const fSize = fire.size;

        // Fire glow
        const fGlow = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, 10 * scale * fSize);
        fGlow.addColorStop(0, `rgba(255, 120, 30, ${0.2 + Math.sin(time * 4 + fi) * 0.1})`);
        fGlow.addColorStop(1, "rgba(255, 60, 10, 0)");
        ctx.fillStyle = fGlow;
        ctx.beginPath();
        ctx.arc(flameX, flameY, 10 * scale * fSize, 0, Math.PI * 2);
        ctx.fill();

        // Flame tongues
        for (let ft = 0; ft < 3; ft++) {
          const fh = (12 + Math.sin(time * 8 + fi * 2.5 + ft * 1.3) * 5) * fSize;
          const fw = (3 + ft * 0.8) * fSize;
          const ftx = flameX + (ft - 1) * 3 * scale * fSize;
          ctx.fillStyle = `rgba(${255 - ft * 25}, ${80 + ft * 50}, ${20 + ft * 10}, ${0.85 - ft * 0.15})`;
          ctx.beginPath();
          ctx.moveTo(ftx - fw * scale, flameY);
          ctx.quadraticCurveTo(ftx, flameY - fh * scale, ftx + fw * scale, flameY);
          ctx.fill();
        }
      });

      // Thick smoke rising
      for (let s = 0; s < 6; s++) {
        const smokePhase = (time * 18 + s * 12) % 55;
        const smokeX = rx - 15 * scale + s * 7 * scale + Math.sin(time * 0.8 + s) * 6;
        const smokeY = ry - 30 * scale - smokePhase;
        const smokeSize = 7 + smokePhase * 0.35;
        ctx.fillStyle = `rgba(45, 35, 35, ${Math.max(0, 0.4 - smokePhase / 70)})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawBurningRuins(1600, 68, 0.8);

    // Ember particles with spiral rising patterns, varying brightness, spark trails
    for (let i = 0; i < 45; i++) {
      const ex = 1440 + seededRandom(i * 13) * 380;
      const baseY = height * 0.9 - seededRandom(i * 17) * height * 0.3;
      const riseSpeed = 28 + seededRandom(i * 23) * 25;
      const ey = baseY - ((time * riseSpeed) % (height * 0.85));
      if (ey > 8 && ey < height - 8) {
        // Spiral rising pattern
        const spiralAngle = time * 2 + i * 0.7;
        const spiralRadius = 6 + seededRandom(i * 3) * 8;
        const drift = Math.sin(spiralAngle) * spiralRadius;
        const size = 1.5 + seededRandom(i * 7) * 2;
        const brightness = 120 + seededRandom(i * 11) * 135;
        const flicker = 0.4 + Math.sin(time * 6 + i * 2.3) * 0.35;

        // Spark trail (small line behind)
        const trailLen = 3 + size;
        ctx.strokeStyle = `rgba(255, ${brightness}, 50, ${flicker * 0.3})`;
        ctx.lineWidth = size * 0.5;
        ctx.beginPath();
        ctx.moveTo(ex + drift, ey);
        ctx.lineTo(ex + drift - Math.sin(spiralAngle - 0.3) * 2, ey + trailLen);
        ctx.stroke();

        // Ember particle
        ctx.fillStyle = `rgba(255, ${brightness}, 50, ${flicker})`;
        ctx.beginPath();
        ctx.arc(ex + drift, ey, size, 0, Math.PI * 2);
        ctx.fill();

        // Bright core for larger embers
        if (size > 2.5) {
          ctx.fillStyle = `rgba(255, 255, 180, ${flicker * 0.5})`;
          ctx.beginPath();
          ctx.arc(ex + drift, ey, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Heat distortion effect overlay
    ctx.save();
    ctx.globalAlpha = 0.03 + Math.sin(time * 2) * 0.01;
    for (let h = 0; h < 10; h++) {
      const heatY = height * 0.2 + h * 12;
      ctx.fillStyle = "#ff4400";
      ctx.beginPath();
      for (let hx = 1440; hx < 1820; hx += 8) {
        const distort = Math.sin(time * 5 + hx * 0.03 + h * 0.5) * 2.5;
        const distort2 = Math.sin(time * 3 + hx * 0.05 + h * 0.3) * 1.5;
        if (hx === 1440) ctx.moveTo(hx, heatY + distort + distort2);
        else ctx.lineTo(hx, heatY + distort + distort2);
      }
      ctx.lineTo(1820, heatY + 10);
      ctx.lineTo(1440, heatY + 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Hellfire border glow at edges
    const fireGlowLeft = ctx.createLinearGradient(1440, 0, 1470, 0);
    fireGlowLeft.addColorStop(0, `rgba(255, 60, 20, ${0.15 + Math.sin(time * 2) * 0.05})`);
    fireGlowLeft.addColorStop(1, "rgba(255, 60, 20, 0)");
    ctx.fillStyle = fireGlowLeft;
    ctx.fillRect(1440, 0, 50, height);

    const fireGlowRight = ctx.createLinearGradient(1790, 0, 1820, 0);
    fireGlowRight.addColorStop(0, "rgba(255, 60, 20, 0)");
    fireGlowRight.addColorStop(1, `rgba(255, 60, 20, ${0.2 + Math.sin(time * 2.5) * 0.05})`);
    ctx.fillStyle = fireGlowRight;
    ctx.fillRect(1770, 0, 50, height)

    // === ENVIRONMENTAL DETAILS - ROADS, BRIDGES, DEBRIS ===

    // Isometric wooden bridges between regions - ornate with rope & stone
    const drawBridge = (bx: number, byPct: number, length: number, angle: number) => {
      const by = getY(byPct);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angle);

      // Bridge shadow (deeper, wider)
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(length / 2, 8, length / 2 + 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone anchor blocks at each end
      const drawAnchor = (ax: number) => {
        const anchorGrad = ctx.createLinearGradient(ax - 8, -8, ax + 8, 8);
        anchorGrad.addColorStop(0, "#6a5a4a");
        anchorGrad.addColorStop(0.5, "#4a3a2a");
        anchorGrad.addColorStop(1, "#3a2a1a");
        ctx.fillStyle = anchorGrad;
        ctx.fillRect(ax - 7, -7, 14, 14);
        // Stone lines
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(ax - 7, -1); ctx.lineTo(ax + 7, -1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax - 7, 4); ctx.lineTo(ax + 7, 4); ctx.stroke();
        // Top cap
        ctx.fillStyle = "#5a4a3a";
        ctx.fillRect(ax - 8, -9, 16, 3);
      };
      drawAnchor(0);
      drawAnchor(length);

      // Bridge planks with wood grain (use flat colors instead of per-plank gradients)
      const plankWidth = 7;
      for (let p = 0; p < length / plankWidth; p++) {
        const px = p * plankWidth + 2;
        const plankY = Math.sin(p * 0.3) * 1.5;
        // Plank shadow
        ctx.fillStyle = "#2a1a0a";
        ctx.fillRect(px, plankY - 3 + 1, plankWidth - 1.5, 7);
        // Main plank (flat color, alternating for variation)
        ctx.fillStyle = p % 2 === 0 ? "#6a5030" : "#5a4020";
        ctx.fillRect(px, plankY - 3, plankWidth - 1.5, 6);
        // Highlight edge
        ctx.fillStyle = "rgba(255,220,160,0.12)";
        ctx.fillRect(px, plankY - 3, plankWidth - 1.5, 1);
      }

      // Rope railings
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      // Top rope with sag
      ctx.strokeStyle = "#6a5a40";
      ctx.beginPath();
      ctx.moveTo(3, -7);
      for (let rx = 0; rx <= length; rx += 3) {
        const sag = Math.sin((rx / length) * Math.PI) * 3;
        ctx.lineTo(rx, -7 + sag);
      }
      ctx.stroke();
      // Bottom rope
      ctx.beginPath();
      ctx.moveTo(3, 7);
      for (let rx = 0; rx <= length; rx += 3) {
        const sag = Math.sin((rx / length) * Math.PI) * 3;
        ctx.lineTo(rx, 7 + sag);
      }
      ctx.stroke();

      // Rope highlight
      ctx.strokeStyle = "rgba(160,140,100,0.25)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(3, -8);
      for (let rx = 0; rx <= length; rx += 3) {
        const sag = Math.sin((rx / length) * Math.PI) * 3;
        ctx.lineTo(rx, -8 + sag);
      }
      ctx.stroke();

      // Railing posts (vertical ropes/supports)
      ctx.strokeStyle = "#5a4a30";
      ctx.lineWidth = 1.5;
      for (let post = 8; post < length; post += 12) {
        const topSag = Math.sin((post / length) * Math.PI) * 3;
        const botSag = Math.sin((post / length) * Math.PI) * 3;
        ctx.beginPath();
        ctx.moveTo(post, -7 + topSag);
        ctx.lineTo(post, 7 + botSag);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Bridges at region borders
    drawBridge(375, 58, 50, -0.1);
    drawBridge(715, 48, 45, 0.05);
    drawBridge(1075, 55, 50, 0.08);
    drawBridge(1445, 52, 48, -0.05);

    // (Roads drawn earlier, before region details)

    // Scattered rocks and boulders
    const drawBoulder = (bx: number, byPct: number, size: number) => {
      const by = getY(byPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(bx + 2, by + size * 0.3, size * 1.2, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Boulder body with 3D shading
      const boulderGrad = ctx.createRadialGradient(bx - size * 0.2, by - size * 0.3, 0, bx, by, size);
      boulderGrad.addColorStop(0, "#6a5a4a");
      boulderGrad.addColorStop(0.6, "#4a3a2a");
      boulderGrad.addColorStop(1, "#2a1a0a");
      ctx.fillStyle = boulderGrad;
      ctx.beginPath();
      ctx.ellipse(bx, by, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = "rgba(120, 100, 80, 0.3)";
      ctx.beginPath();
      ctx.ellipse(bx - size * 0.3, by - size * 0.2, size * 0.3, size * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    // Scatter boulders across the map
    [
      [60, 85, 8], [130, 18, 6], [210, 72, 7], [280, 28, 5],
      [400, 85, 6], [470, 18, 8], [590, 82, 5], [660, 22, 7],
      [740, 80, 6], [820, 25, 5], [910, 78, 7], [1030, 22, 6],
      [1100, 82, 5], [1180, 80, 7], [1250, 28, 6], [1380, 75, 5],
      [1460, 22, 8], [1550, 85, 6], [1640, 25, 7], [1710, 80, 5],
    ].forEach(([x, y, size]) => {
      drawBoulder(x, y, size);
    });

    // Wagon wheels and debris (signs of battle and travel)
    const drawWagonWheel = (wx: number, wyPct: number, size: number, rotation: number) => {
      const wy = getY(wyPct);
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(rotation);
      // Wheel rim
      ctx.strokeStyle = "#4a3020";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.stroke();
      // Spokes
      for (let s = 0; s < 8; s++) {
        const angle = (s / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size * 0.5);
        ctx.stroke();
      }
      // Hub
      ctx.fillStyle = "#3a2010";
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Broken wagon wheels scattered around
    drawWagonWheel(155, 68, 8, 0.5);
    drawWagonWheel(295, 35, 6, 1.2);
    drawWagonWheel(485, 72, 7, 0.8);
    drawWagonWheel(715, 28, 6, 2.1);
    drawWagonWheel(945, 70, 8, 0.3);
    drawWagonWheel(1165, 32, 7, 1.8);
    drawWagonWheel(1395, 68, 6, 0.9);
    drawWagonWheel(1605, 25, 8, 1.5);

    // Scattered arrows in the ground
    const drawArrow = (ax: number, ayPct: number, angle: number) => {
      const ay = getY(ayPct);
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(angle);
      // Arrow shaft sticking up from ground
      ctx.strokeStyle = "#5a4030";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -12);
      ctx.stroke();
      // Fletching
      ctx.fillStyle = "#3a2010";
      ctx.beginPath();
      ctx.moveTo(-2, -10);
      ctx.lineTo(0, -12);
      ctx.lineTo(2, -10);
      ctx.lineTo(0, -8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Arrows scattered across battlefields
    for (let i = 0; i < 40; i++) {
      const ax = seededRandom(i * 23) * width;
      const ay = 25 + seededRandom(i * 23 + 1) * 55;
      const angle = (seededRandom(i * 23 + 2) - 0.5) * 0.6;
      drawArrow(ax, ay, angle);
    }

    // Shields and helmets on ground
    const drawFallenShield = (sx: number, syPct: number, isEnemy: boolean) => {
      const sy = getY(syPct);
      ctx.fillStyle = isEnemy ? "#5a1010" : "#8a6a20";
      ctx.beginPath();
      ctx.ellipse(sx, sy, 5, 3, seededRandom(sx) * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isEnemy ? "#8a0000" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(sx, sy - 0.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    };

    for (let i = 0; i < 25; i++) {
      const sx = seededRandom(i * 31) * width;
      const sy = 30 + seededRandom(i * 31 + 1) * 50;
      drawFallenShield(sx, sy, seededRandom(i * 31 + 2) > 0.5);
    }

    // === ENHANCED BATTLE SCENES ===
    const drawBattleScene = (
      x: number,
      yPct: number,
      flip: boolean,
      intensity: number
    ) => {
      const y = getY(yPct);
      const t = time * 4 + x;

      // Battle dust cloud
      ctx.fillStyle = "rgba(100, 80, 60, 0.15)";
      ctx.beginPath();
      ctx.ellipse(x, y + 4, 25 + intensity * 8, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let s = 0; s < intensity; s++) {
        const offset = s * 20 * (flip ? -1 : 1);
        const combatSway = Math.sin(t + s * 1.5) * 3;

        // Friendly soldier (orange) - more detailed
        const sx1 = x + offset + (flip ? 10 : -10) + combatSway;
        const bob1 = Math.sin(t * 2 + s) * 1.5;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(sx1, y + 6, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.ellipse(sx1, y + bob1, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(sx1, y - 9 + bob1, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.arc(sx1, y - 11 + bob1, 4, Math.PI, 0);
        ctx.fill();

        // Face details
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(sx1 + (flip ? -1.5 : 1.5), y - 9 + bob1, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Shield
        ctx.fillStyle = "#92400e";
        const shieldX = sx1 + (flip ? 5 : -5);
        ctx.beginPath();
        ctx.ellipse(shieldX, y - 2 + bob1, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(shieldX, y - 2 + bob1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Sword with swing animation
        const swordAngle = Math.sin(t * 3 + s) * 0.8;
        ctx.save();
        ctx.translate(sx1 + (flip ? -4 : 4), y - 4 + bob1);
        ctx.rotate(swordAngle * (flip ? -1 : 1));
        ctx.fillStyle = "#c0c0c0";
        ctx.fillRect(-1, -12, 2, 12);
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(-1.5, -2, 3, 3);
        ctx.restore();

        // Enemy soldier (red) - more detailed
        const sx2 = x + offset + (flip ? -10 : 10) + Math.sin(t + 1 + s) * 2;
        const bob2 = Math.sin(t * 2 + s + 1) * 1.5;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(sx2, y + 6, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = "#991b1b";
        ctx.beginPath();
        ctx.ellipse(sx2, y + bob2, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(sx2, y - 9 + bob2, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Horned helmet
        ctx.fillStyle = "#450a0a";
        ctx.beginPath();
        ctx.arc(sx2, y - 11 + bob2, 4, Math.PI, 0);
        ctx.fill();
        // Horns
        ctx.fillStyle = "#1a0a0a";
        ctx.beginPath();
        ctx.moveTo(sx2 - 4, y - 13 + bob2);
        ctx.lineTo(sx2 - 6, y - 18 + bob2);
        ctx.lineTo(sx2 - 2, y - 13 + bob2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx2 + 4, y - 13 + bob2);
        ctx.lineTo(sx2 + 6, y - 18 + bob2);
        ctx.lineTo(sx2 + 2, y - 13 + bob2);
        ctx.fill();

        // Glowing red eyes
        ctx.fillStyle = "#ff0000";
        ctx.globalAlpha = 0.8 + Math.sin(t * 5) * 0.2;
        ctx.beginPath();
        ctx.arc(sx2 + (flip ? 1.5 : -1.5), y - 9 + bob2, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Enemy weapon (axe/spear)
        const weaponAngle = Math.sin(t * 3 + s + 1.5) * 0.6;
        ctx.save();
        ctx.translate(sx2 + (flip ? 4 : -4), y - 4 + bob2);
        ctx.rotate(weaponAngle * (flip ? 1 : -1));
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(-1, -14, 2, 14);
        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.moveTo(-4, -14);
        ctx.lineTo(0, -18);
        ctx.lineTo(4, -14);
        ctx.lineTo(0, -12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Sparks from clashing weapons
      const sparkIntensity = Math.sin(t * 3);
      if (sparkIntensity > 0.2) {
        ctx.fillStyle = "#ffd700";
        for (let i = 0; i < 5; i++) {
          const sparkX = x + (seededRandom(x + i + Math.floor(t)) - 0.5) * 20;
          const sparkY = y - 5 + (seededRandom(x + i + 10 + Math.floor(t)) - 0.5) * 15;
          const sparkSize = 1 + seededRandom(i + x) * 1.5;
          ctx.globalAlpha = sparkIntensity * 0.8;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Blood splatters (subtle)
      ctx.fillStyle = "rgba(139, 0, 0, 0.15)";
      for (let i = 0; i < 3; i++) {
        const bx = x + (seededRandom(x + i * 7) - 0.5) * 30;
        const by = y + 4 + seededRandom(x + i * 7 + 1) * 4;
        ctx.beginPath();
        ctx.ellipse(bx, by, 2 + seededRandom(i) * 3, 1, seededRandom(i) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Fallen soldiers (corpses and debris)
    const drawFallenSoldier = (fx: number, fyPct: number, isEnemy: boolean) => {
      const fy = getY(fyPct);
      ctx.fillStyle = isEnemy ? "rgba(139, 0, 0, 0.5)" : "rgba(180, 100, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(fx, fy, 6, 3, seededRandom(fx) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      // Dropped weapon
      ctx.strokeStyle = "#5a5a5a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(fx - 4, fy + 1);
      ctx.lineTo(fx + 8, fy - 2);
      ctx.stroke();
    };
    // Scatter fallen soldiers across the map
    [
      [150, 50, true], [200, 62, false], [290, 40, true],
      [460, 60, false], [530, 40, true], [590, 55, true],
      [780, 35, false], [870, 68, true], [950, 50, false],
      [1100, 65, true], [1220, 45, false], [1310, 58, true],
      [1480, 40, false], [1560, 70, true], [1680, 55, false],
    ].forEach(([x, y, isEnemy]) => {
      drawFallenSoldier(x as number, y as number, isEnemy as boolean);
    });

    // Multiple battle scenes across regions
    drawBattleScene(165, 42, false, 2);
    drawBattleScene(310, 72, true, 3);
    drawBattleScene(480, 35, false, 2);
    drawBattleScene(610, 68, true, 2);
    drawBattleScene(840, 55, false, 3);
    drawBattleScene(1050, 38, true, 2);
    drawBattleScene(1200, 62, false, 2);
    drawBattleScene(1340, 68, true, 3);
    drawBattleScene(1520, 25, false, 2);
    drawBattleScene(1670, 75, true, 3);

    // === ENHANCED KINGDOM CASTLES ===
    const drawKingdomCastle = (x: number, yPct: number, isEnemy: boolean) => {
      const y = getY(yPct);
      // Rich color palette
      const stoneLight = isEnemy ? "#5a2828" : "#6a5a48";
      const stoneMid = isEnemy ? "#3e1818" : "#504030";
      const stoneDark = isEnemy ? "#280a0a" : "#3a2a1a";
      const stoneDeep = isEnemy ? "#1a0505" : "#2a1a0c";
      const accent = isEnemy ? "#cc2200" : "#f5a623";
      const accentBright = isEnemy ? "#ff5530" : "#ffd060";
      const accentGlow = isEnemy ? "#ff4400" : "#ffcc00";
      const roofColor1 = isEnemy ? "#4a1818" : "#5a4020";
      const roofColor2 = isEnemy ? "#2a0808" : "#3a2810";
      const moatColor = isEnemy ? "rgba(120, 20, 0, 0.35)" : "rgba(40, 70, 110, 0.4)";

      ctx.save();

      // === AMBIENT CASTLE GLOW (draw first, behind everything) ===
      const auraR = 95;
      const castleAura = ctx.createRadialGradient(x, y - 45, 8, x, y - 45, auraR);
      castleAura.addColorStop(0, `${accentGlow}20`);
      castleAura.addColorStop(0.4, `${accentGlow}0a`);
      castleAura.addColorStop(1, `${accentGlow}00`);
      ctx.fillStyle = castleAura;
      ctx.beginPath();
      ctx.arc(x, y - 45, auraR, 0, Math.PI * 2);
      ctx.fill();

      // === GROUND SHADOW ===
      const shadowGrad = ctx.createRadialGradient(x + 6, y + 16, 0, x + 6, y + 16, 60);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(x + 6, y + 16, 60, 20, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // === MOAT ===
      ctx.fillStyle = moatColor;
      ctx.beginPath();
      ctx.ellipse(x, y + 13, 54, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      // Moat water shimmer
      ctx.strokeStyle = isEnemy ? "rgba(200, 60, 20, 0.1)" : "rgba(120, 170, 220, 0.12)";
      ctx.lineWidth = 0.8;
      for (let m = 0; m < 3; m++) {
        const mx = x - 30 + m * 25 + Math.sin(time * 1.5 + m) * 5;
        ctx.beginPath();
        ctx.ellipse(mx, y + 13, 8, 2.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // === OUTER CURTAIN WALL ===
      const wallGrad = ctx.createLinearGradient(x - 50, 0, x + 50, 0);
      wallGrad.addColorStop(0, stoneDeep);
      wallGrad.addColorStop(0.15, stoneDark);
      wallGrad.addColorStop(0.35, stoneMid);
      wallGrad.addColorStop(0.5, stoneLight);
      wallGrad.addColorStop(0.65, stoneMid);
      wallGrad.addColorStop(0.85, stoneDark);
      wallGrad.addColorStop(1, stoneDeep);
      ctx.fillStyle = wallGrad;
      ctx.fillRect(x - 48, y - 28, 96, 38);
      // Wall top highlight
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x - 48, y - 28, 96, 2);
      // Wall bottom shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(x - 48, y + 8, 96, 2);

      // Stone brick pattern on wall
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.5;
      for (let row = 0; row < 5; row++) {
        const wy = y - 26 + row * 7;
        ctx.beginPath(); ctx.moveTo(x - 48, wy); ctx.lineTo(x + 48, wy); ctx.stroke();
        for (let col = 0; col < 12; col++) {
          const boff = row % 2 === 0 ? 0 : 4;
          ctx.beginPath();
          ctx.moveTo(x - 48 + col * 8 + boff, wy);
          ctx.lineTo(x - 48 + col * 8 + boff, wy + 7);
          ctx.stroke();
        }
      }
      // Highlight mortar on lit side
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      for (let row = 0; row < 5; row++) {
        const wy = y - 26 + row * 7;
        ctx.beginPath(); ctx.moveTo(x - 20, wy + 1); ctx.lineTo(x + 20, wy + 1); ctx.stroke();
      }

      // Wall crenellations
      for (let i = 0; i < 12; i++) {
        const cx = x - 47 + i * 8;
        if (i % 2 === 0) {
          ctx.fillStyle = stoneMid;
          ctx.fillRect(cx, y - 35, 7, 8);
          ctx.fillStyle = stoneLight;
          ctx.fillRect(cx, y - 35, 6, 7);
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(cx, y - 35, 6, 1.5);
        }
      }

      // === FLANKING ROUND TOWERS ===
      const drawRoundTower = (tx: number, isLeft: boolean) => {
        const tGrad = ctx.createLinearGradient(tx - 14, 0, tx + 14, 0);
        if (isLeft) {
          tGrad.addColorStop(0, stoneDeep);
          tGrad.addColorStop(0.3, stoneDark);
          tGrad.addColorStop(0.7, stoneMid);
          tGrad.addColorStop(1, stoneLight);
        } else {
          tGrad.addColorStop(0, stoneLight);
          tGrad.addColorStop(0.3, stoneMid);
          tGrad.addColorStop(0.7, stoneDark);
          tGrad.addColorStop(1, stoneDeep);
        }
        // Tower body (slightly wider at base for taper)
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.moveTo(tx - 13, y + 10);
        ctx.lineTo(tx - 12, y - 68);
        ctx.lineTo(tx + 12, y - 68);
        ctx.lineTo(tx + 13, y + 10);
        ctx.closePath();
        ctx.fill();

        // Cylindrical stone lines
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 0.5;
        for (let r = 0; r < 12; r++) {
          const ry = y - 65 + r * 6;
          ctx.beginPath();
          ctx.moveTo(tx - 12, ry);
          ctx.quadraticCurveTo(tx, ry - 1, tx + 12, ry);
          ctx.stroke();
        }

        // Tower crenellations
        for (let c = 0; c < 4; c++) {
          const bx = tx - 12 + c * 7;
          ctx.fillStyle = stoneMid;
          ctx.fillRect(bx, y - 76, 5.5, 9);
          ctx.fillStyle = stoneLight;
          ctx.fillRect(bx, y - 76, 5, 8);
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.fillRect(bx, y - 76, 5, 1.5);
        }

        // Conical roof with gradient
        const roofGrad = ctx.createLinearGradient(tx - 16, y - 92, tx + 16, y - 72);
        roofGrad.addColorStop(0, roofColor2);
        roofGrad.addColorStop(0.4, roofColor1);
        roofGrad.addColorStop(1, roofColor2);
        ctx.fillStyle = roofGrad;
        ctx.beginPath();
        ctx.moveTo(tx, y - 92);
        ctx.lineTo(tx + 16, y - 72);
        ctx.lineTo(tx - 16, y - 72);
        ctx.closePath();
        ctx.fill();
        // Roof highlight edge
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(tx, y - 92);
        ctx.lineTo(tx - 14, y - 73);
        ctx.stroke();

        // Roof finial (gold/red ball)
        ctx.fillStyle = accentBright;
        ctx.beginPath();
        ctx.arc(tx, y - 93, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(tx - 0.8, y - 94, 1, 0, Math.PI * 2);
        ctx.fill();

        // Tower windows (arched, 2 levels)
        const drawTowerWindow = (wy: number) => {
          const wGlow = 0.45 + Math.sin(time * 2.2 + tx + wy * 0.1) * 0.25;
          // Window glow halo
          const wGlowGrad = ctx.createRadialGradient(tx, wy, 0, tx, wy, 10);
          wGlowGrad.addColorStop(0, `rgba(${isEnemy ? "255,100,30" : "255,200,80"},${wGlow * 0.35})`);
          wGlowGrad.addColorStop(1, `rgba(${isEnemy ? "255,60,10" : "255,150,40"},0)`);
          ctx.fillStyle = wGlowGrad;
          ctx.beginPath();
          ctx.arc(tx, wy, 10, 0, Math.PI * 2);
          ctx.fill();
          // Window frame
          ctx.fillStyle = stoneDeep;
          ctx.beginPath();
          ctx.moveTo(tx - 4, wy + 5);
          ctx.lineTo(tx - 4, wy - 2);
          ctx.arc(tx, wy - 2, 4, Math.PI, 0);
          ctx.lineTo(tx + 4, wy + 5);
          ctx.closePath();
          ctx.fill();
          // Window light
          ctx.fillStyle = accentGlow;
          ctx.globalAlpha = wGlow;
          ctx.beginPath();
          ctx.moveTo(tx - 3, wy + 4);
          ctx.lineTo(tx - 3, wy - 1);
          ctx.arc(tx, wy - 1, 3, Math.PI, 0);
          ctx.lineTo(tx + 3, wy + 4);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
          // Window cross
          ctx.fillStyle = stoneDeep;
          ctx.fillRect(tx - 0.4, wy - 4, 0.8, 9);
          ctx.fillRect(tx - 3, wy + 0.5, 6, 0.8);
        };
        drawTowerWindow(y - 52);
        drawTowerWindow(y - 35);

        // Guard on tower
        const sway = Math.sin(time * 0.5 + tx * 0.1) * 1.2;
        // Guard body
        ctx.fillStyle = isEnemy ? "#6a1010" : "#8a6830";
        ctx.fillRect(tx - 2.5 + sway, y - 74, 5, 7);
        // Guard head
        ctx.fillStyle = isEnemy ? "#cc2200" : "#d4a040";
        ctx.beginPath();
        ctx.arc(tx + sway, y - 78, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Helmet
        ctx.fillStyle = isEnemy ? "#4a0a0a" : "#7a6530";
        ctx.beginPath();
        ctx.arc(tx + sway, y - 80, 3.2, Math.PI, 0);
        ctx.fill();
        // Spear
        ctx.strokeStyle = "#8a8a8a";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tx + 4 + sway, y - 78);
        ctx.lineTo(tx + 4 + sway, y - 96);
        ctx.stroke();
        // Spearhead
        ctx.fillStyle = "#b0b0b0";
        ctx.beginPath();
        ctx.moveTo(tx + 2.5 + sway, y - 96);
        ctx.lineTo(tx + 4 + sway, y - 101);
        ctx.lineTo(tx + 5.5 + sway, y - 96);
        ctx.closePath();
        ctx.fill();
      };
      drawRoundTower(x - 40, true);
      drawRoundTower(x + 40, false);

      // === CENTRAL KEEP (main tall tower) ===
      const keepW = 22;
      const keepGrad = ctx.createLinearGradient(x - keepW, 0, x + keepW, 0);
      keepGrad.addColorStop(0, stoneDark);
      keepGrad.addColorStop(0.2, stoneMid);
      keepGrad.addColorStop(0.4, stoneLight);
      keepGrad.addColorStop(0.6, stoneLight);
      keepGrad.addColorStop(0.8, stoneMid);
      keepGrad.addColorStop(1, stoneDark);
      ctx.fillStyle = keepGrad;
      ctx.fillRect(x - keepW, y - 90, keepW * 2, 100);

      // Keep stone texture
      ctx.strokeStyle = "rgba(0,0,0,0.07)";
      ctx.lineWidth = 0.5;
      for (let row = 0; row < 15; row++) {
        const ky = y - 88 + row * 6;
        ctx.beginPath(); ctx.moveTo(x - keepW, ky); ctx.lineTo(x + keepW, ky); ctx.stroke();
        for (let col = 0; col < 6; col++) {
          const koff = row % 2 === 0 ? 0 : 4;
          ctx.beginPath();
          ctx.moveTo(x - keepW + col * 8 + koff, ky);
          ctx.lineTo(x - keepW + col * 8 + koff, ky + 6);
          ctx.stroke();
        }
      }

      // Keep crenellations
      for (let i = 0; i < 8; i++) {
        const bx = x - keepW + i * 6;
        if (i % 2 === 0) {
          ctx.fillStyle = stoneMid;
          ctx.fillRect(bx, y - 97, 5, 8);
          ctx.fillStyle = stoneLight;
          ctx.fillRect(bx, y - 97, 4.5, 7);
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.fillRect(bx, y - 97, 4.5, 1.5);
        }
      }

      // Keep roof (larger, steeper)
      const keepRoofGrad = ctx.createLinearGradient(x - keepW - 4, y - 115, x + keepW + 4, y - 93);
      keepRoofGrad.addColorStop(0, roofColor2);
      keepRoofGrad.addColorStop(0.35, roofColor1);
      keepRoofGrad.addColorStop(0.7, roofColor2);
      keepRoofGrad.addColorStop(1, stoneDeep);
      ctx.fillStyle = keepRoofGrad;
      ctx.beginPath();
      ctx.moveTo(x, y - 118);
      ctx.lineTo(x + keepW + 5, y - 93);
      ctx.lineTo(x - keepW - 5, y - 93);
      ctx.closePath();
      ctx.fill();
      // Roof highlight
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y - 118);
      ctx.lineTo(x - keepW - 3, y - 94);
      ctx.stroke();

      // Keep roof finial
      ctx.fillStyle = accentBright;
      ctx.beginPath();
      ctx.arc(x, y - 119, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(x - 1, y - 120, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // === FLAG POLE + BANNER ===
      // Pole
      const poleGrad = ctx.createLinearGradient(x - 1.5, 0, x + 1.5, 0);
      poleGrad.addColorStop(0, "#3a2510");
      poleGrad.addColorStop(0.5, "#6a5030");
      poleGrad.addColorStop(1, "#3a2510");
      ctx.fillStyle = poleGrad;
      ctx.fillRect(x - 1.2, y - 142, 2.4, 26);
      // Pole finial ball
      ctx.fillStyle = accentBright;
      ctx.beginPath();
      ctx.arc(x, y - 143, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Waving banner
      const w1 = Math.sin(time * 3.2 + x * 0.05) * 4;
      const w2 = Math.sin(time * 3.6 + x * 0.05) * 3;
      const w3 = Math.sin(time * 4 + x * 0.05) * 2.5;
      // Banner shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.moveTo(x + 1.2, y - 140 + 1);
      ctx.bezierCurveTo(x + 10, y - 136 + w1 + 1, x + 18, y - 132 + w2 + 1, x + 28, y - 128 + w3 + 1);
      ctx.bezierCurveTo(x + 18, y - 124 + w2 + 1, x + 10, y - 120 + w1 + 1, x + 1.2, y - 116 + 1);
      ctx.closePath();
      ctx.fill();
      // Banner body
      const bannerGrad = ctx.createLinearGradient(x, y - 140, x + 28, y - 128);
      bannerGrad.addColorStop(0, accent);
      bannerGrad.addColorStop(0.5, accentBright);
      bannerGrad.addColorStop(1, accent);
      ctx.fillStyle = bannerGrad;
      ctx.beginPath();
      ctx.moveTo(x + 1.2, y - 140);
      ctx.bezierCurveTo(x + 10, y - 136 + w1, x + 18, y - 132 + w2, x + 28, y - 128 + w3);
      ctx.bezierCurveTo(x + 18, y - 124 + w2, x + 10, y - 120 + w1, x + 1.2, y - 116);
      ctx.closePath();
      ctx.fill();
      // Banner stripe
      ctx.strokeStyle = isEnemy ? "#1a0000" : "#8a6010";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 3, y - 128 + w1 * 0.5);
      ctx.bezierCurveTo(x + 10, y - 128 + w1, x + 18, y - 128 + w2, x + 26, y - 128 + w3);
      ctx.stroke();
      // Banner emblem (shield/skull)
      const embX = x + 13;
      const embY = y - 128 + w1 * 0.5;
      ctx.fillStyle = isEnemy ? "#1a0000" : "#2a1a00";
      ctx.beginPath();
      ctx.arc(embX, embY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accentBright;
      // Star emblem
      for (let p = 0; p < 5; p++) {
        const a = (p * Math.PI * 2) / 5 - Math.PI / 2;
        const px = embX + Math.cos(a) * 2.5;
        const py = embY + Math.sin(a) * 2.5;
        ctx.beginPath();
        ctx.arc(px, py, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // === GRAND ARCHED GATE ===
      // Gate recess shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.moveTo(x - 15, y + 10);
      ctx.lineTo(x - 15, y - 13);
      ctx.arc(x, y - 13, 15, Math.PI, 0);
      ctx.lineTo(x + 15, y + 10);
      ctx.closePath();
      ctx.fill();
      // Gate arch stones
      ctx.fillStyle = stoneDark;
      ctx.beginPath();
      ctx.moveTo(x - 14, y + 10);
      ctx.lineTo(x - 14, y - 12);
      ctx.arc(x, y - 12, 14, Math.PI, 0);
      ctx.lineTo(x + 14, y + 10);
      ctx.closePath();
      ctx.fill();
      // Keystone at arch top
      ctx.fillStyle = stoneMid;
      ctx.beginPath();
      ctx.moveTo(x - 3, y - 25);
      ctx.lineTo(x, y - 28);
      ctx.lineTo(x + 3, y - 25);
      ctx.lineTo(x + 2, y - 22);
      ctx.lineTo(x - 2, y - 22);
      ctx.closePath();
      ctx.fill();
      // Gate interior (dark)
      ctx.fillStyle = "#0a0404";
      ctx.beginPath();
      ctx.moveTo(x - 11, y + 10);
      ctx.lineTo(x - 11, y - 10);
      ctx.arc(x, y - 10, 11, Math.PI, 0);
      ctx.lineTo(x + 11, y + 10);
      ctx.closePath();
      ctx.fill();

      // Portcullis (iron grate)
      ctx.strokeStyle = "#4a4a4a";
      ctx.lineWidth = 1.2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 4.5, y - 18);
        ctx.lineTo(x + i * 4.5, y + 8);
        ctx.stroke();
      }
      for (let h = 0; h < 3; h++) {
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 12 + h * 8);
        ctx.lineTo(x + 10, y - 12 + h * 8);
        ctx.stroke();
      }
      // Portcullis highlight
      ctx.strokeStyle = "rgba(200,200,200,0.08)";
      ctx.lineWidth = 0.5;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 4.5 - 0.5, y - 18);
        ctx.lineTo(x + i * 4.5 - 0.5, y + 8);
        ctx.stroke();
      }

      // === KEEP WINDOWS (large arched, multi-paned) ===
      const drawKeepWindow = (wx: number, wy: number, ww: number, wh: number) => {
        const wGlow = 0.5 + Math.sin(time * 2 + wx * 0.1 + wy * 0.05) * 0.25;
        // Glow halo
        const haloGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, ww * 2);
        haloGrad.addColorStop(0, `rgba(${isEnemy ? "255,80,20" : "255,200,80"},${wGlow * 0.3})`);
        haloGrad.addColorStop(1, `rgba(${isEnemy ? "200,40,10" : "200,150,50"},0)`);
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(wx, wy, ww * 2, 0, Math.PI * 2);
        ctx.fill();
        // Window frame (arched)
        ctx.fillStyle = stoneDeep;
        ctx.beginPath();
        ctx.moveTo(wx - ww, wy + wh);
        ctx.lineTo(wx - ww, wy - wh * 0.3);
        ctx.arc(wx, wy - wh * 0.3, ww, Math.PI, 0);
        ctx.lineTo(wx + ww, wy + wh);
        ctx.closePath();
        ctx.fill();
        // Window light
        ctx.fillStyle = accentGlow;
        ctx.globalAlpha = wGlow;
        ctx.beginPath();
        ctx.moveTo(wx - ww + 1, wy + wh - 1);
        ctx.lineTo(wx - ww + 1, wy - wh * 0.2);
        ctx.arc(wx, wy - wh * 0.2, ww - 1, Math.PI, 0);
        ctx.lineTo(wx + ww - 1, wy + wh - 1);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        // Window mullions (cross)
        ctx.fillStyle = stoneDeep;
        ctx.fillRect(wx - 0.5, wy - wh * 0.5, 1, wh * 1.4);
        ctx.fillRect(wx - ww + 1, wy + 1, ww * 2 - 2, 0.8);
      };
      // Two rows of keep windows
      drawKeepWindow(x - 10, y - 68, 6, 9);
      drawKeepWindow(x + 10, y - 68, 6, 9);
      drawKeepWindow(x, y - 48, 5, 7);

      // === TORCHES (4 total — gate sides + wall ends) ===
      const drawTorch = (tx2: number, ty2: number, tscale: number) => {
        // Bracket
        ctx.fillStyle = "#3a2a18";
        ctx.fillRect(tx2 - 1, ty2, 2, 6 * tscale);
        // Flame
        const fh = (5 + Math.sin(time * 9 + tx2 * 0.3) * 2.5) * tscale;
        const flicker = 0.8 + Math.sin(time * 7 + tx2) * 0.2;
        // Flame glow
        const tGlow = ctx.createRadialGradient(tx2, ty2 - fh * 0.5, 0, tx2, ty2 - fh * 0.5, 10 * tscale);
        tGlow.addColorStop(0, `rgba(255, 180, 50, ${0.3 * flicker})`);
        tGlow.addColorStop(1, "rgba(255, 120, 20, 0)");
        ctx.fillStyle = tGlow;
        ctx.beginPath();
        ctx.arc(tx2, ty2 - fh * 0.5, 10 * tscale, 0, Math.PI * 2);
        ctx.fill();
        // Outer flame
        ctx.fillStyle = `rgba(255, 120, 20, ${flicker * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(tx2 - 2.5 * tscale, ty2);
        ctx.quadraticCurveTo(tx2, ty2 - fh, tx2 + 2.5 * tscale, ty2);
        ctx.fill();
        // Inner flame
        ctx.fillStyle = `rgba(255, 220, 80, ${flicker * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(tx2 - 1.5 * tscale, ty2);
        ctx.quadraticCurveTo(tx2, ty2 - fh * 0.8, tx2 + 1.5 * tscale, ty2);
        ctx.fill();
      };
      drawTorch(x - 18, y - 5, 1);
      drawTorch(x + 18, y - 5, 1);
      drawTorch(x - 45, y - 30, 0.8);
      drawTorch(x + 45, y - 30, 0.8);

      // === CHIMNEY SMOKE ===
      for (let ch = 0; ch < 2; ch++) {
        const chx = x + (ch === 0 ? -10 : 10);
        for (let s = 0; s < 4; s++) {
          const sAge = (time * 10 + s * 9 + ch * 22) % 30;
          const sy = y - 118 - sAge * 1.2;
          const sx = chx + Math.sin(time * 1.2 + s * 1.5 + ch) * (3 + sAge * 0.15);
          const sAlpha = Math.max(0, 0.2 - sAge / 40);
          if (sAlpha > 0) {
            ctx.fillStyle = `rgba(100, 90, 80, ${sAlpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 2.5 + sAge * 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    };

    drawKingdomCastle(70, 50, false);
    drawKingdomCastle(MAP_WIDTH - 70, 50, true);

    // Kingdom labels under castles
    const drawCastleLabel = (cx: number, cyPct: number, label: string, isEnemy: boolean) => {
      const cy = getY(cyPct);
      const labelY = cy + 22;
      ctx.save();
      ctx.font = "bold 9px 'bc-novatica-cyr', serif";
      const tw = ctx.measureText(label).width;
      // Text shadow
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.textAlign = "center";
      ctx.fillText(label, cx + 0.8, labelY + 0.8);
      // Main text
      ctx.fillStyle = isEnemy ? "#cc4030" : "#d4a848";
      ctx.fillText(label, cx, labelY);
      // Underline accent
      ctx.strokeStyle = isEnemy ? "rgba(200,50,30,0.35)" : "rgba(210,170,70,0.35)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - tw * 0.55, labelY + 3);
      ctx.lineTo(cx + tw * 0.55, labelY + 3);
      ctx.stroke();
      ctx.restore();
    };
    drawCastleLabel(70, 50, "YOUR KINGDOM", false);
    drawCastleLabel(MAP_WIDTH - 70, 50, "ENEMY KINGDOM", true);

    // --- PATH CONNECTIONS ---
    WORLD_LEVELS.forEach((level) => {
      const fromX = level.x;
      const fromY = getY(level.y);

      level.connectsTo.forEach((toId) => {
        const toLevel = getLevelById(toId);
        if (!toLevel) return;
        const toX = toLevel.x;
        const toY = getY(toLevel.y);
        const isUnlocked = isLevelUnlocked(level.id) && isLevelUnlocked(toId);
        const isPartial = isLevelUnlocked(level.id) || isLevelUnlocked(toId);

        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2 - 15;

        // Shadow
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fromX + 2, fromY + 3);
        ctx.quadraticCurveTo(midX + 2, midY + 3, toX + 2, toY + 3);
        ctx.stroke();

        if (isUnlocked) {
          // Outer border (dark golden)
          ctx.strokeStyle = "#8B6914";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.quadraticCurveTo(midX, midY, toX, toY);
          ctx.stroke();
          // Main road (bright gold)
          ctx.strokeStyle = "#D4A828";
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.quadraticCurveTo(midX, midY, toX, toY);
          ctx.stroke();
          // Center highlight
          ctx.strokeStyle = "#F0C840";
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.quadraticCurveTo(midX, midY, toX, toY);
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Animated marching orbs (3 orbs spaced apart)
          for (let orb = 0; orb < 3; orb++) {
            const dotPos = ((time * 0.4) + orb * 0.33) % 1;
            const t = dotPos;
            const mt = 1 - t;
            // Quadratic bezier interpolation
            const dx = mt * mt * fromX + 2 * mt * t * midX + t * t * toX;
            const dy = mt * mt * fromY + 2 * mt * t * midY + t * t * toY;
            // Glow
            ctx.fillStyle = "#ffd700";
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(dx, dy, 6, 0, Math.PI * 2);
            ctx.fill();
            // Orb
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = "#FFE060";
            ctx.beginPath();
            ctx.arc(dx, dy, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#FFFAC0";
            ctx.beginPath();
            ctx.arc(dx - 0.5, dy - 0.5, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        } else {
          // Locked/partial path
          ctx.strokeStyle = isPartial ? "#6a5a4a" : "#3a3020";
          ctx.lineWidth = isPartial ? 6 : 4;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.quadraticCurveTo(midX, midY, toX, toY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    });

    // --- LEVEL NODES ---
    WORLD_LEVELS.forEach((level) => {
      const x = level.x;
      const y = getY(level.y);
      const isUnlocked = isLevelUnlocked(level.id);
      const isHovered = hoveredLevel === level.id;
      const isSelected = selectedLevel === level.id;
      const stars = levelStars[level.id] || 0;
      const size = isHovered || isSelected ? 28 : 24;

      // Glow (use radial gradient instead of expensive shadowBlur)
      if (isSelected || (isHovered && isUnlocked)) {
        const glowRadius = isSelected ? 40 : 32;
        const glowColor = isSelected ? "rgba(255,215,0," : "rgba(255,170,0,";
        const glow = ctx.createRadialGradient(x, y, size * 0.5, x, y, glowRadius);
        glow.addColorStop(0, glowColor + "0.4)");
        glow.addColorStop(0.5, glowColor + "0.15)");
        glow.addColorStop(1, glowColor + "0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Victory flag (upgraded: ornate pole with waving banner)
      if (stars > 0) {
        const flagPoleX = x + 1;
        const flagPoleTop = y - size - 22;
        const flagPoleBot = y - size + 4;
        // Pole shadow
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(flagPoleX - 1, flagPoleTop + 2, 4, flagPoleBot - flagPoleTop);
        // Pole
        const poleGrad = ctx.createLinearGradient(flagPoleX - 1.5, 0, flagPoleX + 1.5, 0);
        poleGrad.addColorStop(0, "#6B4520");
        poleGrad.addColorStop(0.4, "#C89050");
        poleGrad.addColorStop(0.6, "#A87040");
        poleGrad.addColorStop(1, "#5A3818");
        ctx.fillStyle = poleGrad;
        ctx.fillRect(flagPoleX - 1.5, flagPoleTop, 3, flagPoleBot - flagPoleTop);
        // Finial (gold ornament on top)
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(flagPoleX, flagPoleTop - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFF0A0";
        ctx.beginPath();
        ctx.arc(flagPoleX - 0.5, flagPoleTop - 2.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#B8960A";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(flagPoleX, flagPoleTop - 2, 3, 0, Math.PI * 2);
        ctx.stroke();
        // Flag colors per region
        const flagPrimary =
          level.region === "grassland" ? "#30A830"
            : level.region === "swamp" ? "#6ABCB0"
              : level.region === "desert" ? "#E8B020"
                : level.region === "winter" ? "#5090C8"
                  : "#C83030";
        const flagSecondary =
          level.region === "grassland" ? "#50D050"
            : level.region === "swamp" ? "#90E0D0"
              : level.region === "desert" ? "#FFD850"
                : level.region === "winter" ? "#80C0F0"
                  : "#FF5050";
        // Waving flag shape
        const wave = Math.sin(time * 3 + x * 0.05) * 2;
        const wave2 = Math.sin(time * 3 + x * 0.05 + 1) * 1.5;
        ctx.fillStyle = flagPrimary;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 1.5, flagPoleTop);
        ctx.quadraticCurveTo(flagPoleX + 10, flagPoleTop + 3 + wave, flagPoleX + 18, flagPoleTop + 2 + wave2);
        ctx.lineTo(flagPoleX + 17, flagPoleTop + 7 + wave2);
        ctx.quadraticCurveTo(flagPoleX + 9, flagPoleTop + 8 + wave, flagPoleX + 1.5, flagPoleTop + 14);
        ctx.closePath();
        ctx.fill();
        // Flag highlight stripe
        ctx.fillStyle = flagSecondary;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 1.5, flagPoleTop + 2);
        ctx.quadraticCurveTo(flagPoleX + 8, flagPoleTop + 4 + wave * 0.7, flagPoleX + 14, flagPoleTop + 3.5 + wave2 * 0.7);
        ctx.lineTo(flagPoleX + 13, flagPoleTop + 5.5 + wave2 * 0.7);
        ctx.quadraticCurveTo(flagPoleX + 7, flagPoleTop + 6 + wave * 0.7, flagPoleX + 1.5, flagPoleTop + 6);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        // Flag outline
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 1.5, flagPoleTop);
        ctx.quadraticCurveTo(flagPoleX + 10, flagPoleTop + 3 + wave, flagPoleX + 18, flagPoleTop + 2 + wave2);
        ctx.lineTo(flagPoleX + 17, flagPoleTop + 7 + wave2);
        ctx.quadraticCurveTo(flagPoleX + 9, flagPoleTop + 8 + wave, flagPoleX + 1.5, flagPoleTop + 14);
        ctx.closePath();
        ctx.stroke();
        // Small star emblem on flag
        ctx.fillStyle = "#FFE870";
        ctx.globalAlpha = 0.8;
        const embX = flagPoleX + 8;
        const embY = flagPoleTop + 5.5 + wave * 0.5;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = embX + Math.cos(a) * 2.5;
          const py = embY + Math.sin(a) * 2.5;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Node shadow (deeper, offset)
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.arc(x + 2, y + 3, size + 2, 0, Math.PI * 2);
      ctx.fill();

      // Outer decorative ring (metallic beveled)
      const outerRing = ctx.createRadialGradient(x - 3, y - 3, size - 6, x, y, size + 2);
      if (isUnlocked) {
        if (stars > 0) {
          outerRing.addColorStop(0, "#8AA858");
          outerRing.addColorStop(0.5, "#5A7838");
          outerRing.addColorStop(1, "#3A5020");
        } else {
          outerRing.addColorStop(0, "#8A7A60");
          outerRing.addColorStop(0.5, "#6A5A48");
          outerRing.addColorStop(1, "#4A3A28");
        }
      } else {
        outerRing.addColorStop(0, "#4A4A4A");
        outerRing.addColorStop(0.5, "#3A3A3A");
        outerRing.addColorStop(1, "#2A2A2A");
      }
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = outerRing;
      ctx.fill();

      // Metallic border strokes (double ring for bevel effect)
      ctx.strokeStyle = isSelected
        ? "#FFE060"
        : isHovered
          ? "#FFD040"
          : isUnlocked
            ? stars > 0 ? "#A0B868" : "#9A8A68"
            : "#505050";
      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();
      // Inner bright edge (bevel highlight)
      ctx.strokeStyle = isUnlocked
        ? stars > 0 ? "rgba(180,220,120,0.3)" : "rgba(180,160,120,0.25)"
        : "rgba(100,100,100,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, size - 2, 0, Math.PI * 2);
      ctx.stroke();
      // Outer dark edge (bevel shadow)
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, size + 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Ornamental notches (8 evenly spaced around ring)
      if (isUnlocked) {
        ctx.fillStyle = isSelected ? "#FFE060" : stars > 0 ? "#90A850" : "#807058";
        for (let n = 0; n < 8; n++) {
          const na = (n * Math.PI) / 4;
          const nx = x + Math.cos(na) * (size - 0.5);
          const ny = y + Math.sin(na) * (size - 0.5);
          ctx.beginPath();
          ctx.arc(nx, ny, isSelected ? 2.5 : 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Inner circle (recessed)
      const innerGrad = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, size - 5);
      if (isUnlocked) {
        if (stars > 0) {
          innerGrad.addColorStop(0, "#5A7838");
          innerGrad.addColorStop(1, "#3A5020");
        } else {
          innerGrad.addColorStop(0, "#6A5A48");
          innerGrad.addColorStop(1, "#4A3A28");
        }
      } else {
        innerGrad.addColorStop(0, "#333028");
        innerGrad.addColorStop(1, "#201D18");
      }
      ctx.beginPath();
      ctx.arc(x, y, size - 6, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();
      // Inner recess shadow ring
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, size - 6, 0, Math.PI * 2);
      ctx.stroke();

      // Region icon
      if (isUnlocked) {
        // Dark vignette behind icon for consistent contrast
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.arc(x, y, size - 7, 0, Math.PI * 2);
        ctx.fill();

        // All icons drawn centered at origin via translate
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = 1;

        if (level.region === "grassland") {
          // --- Centered Oak Tree ---
          // Trunk
          ctx.fillStyle = "#A07040";
          ctx.beginPath();
          ctx.moveTo(-2, 2); ctx.lineTo(-1.5, 10); ctx.lineTo(1.5, 10); ctx.lineTo(2, 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#C89858";
          ctx.lineWidth = 0.8;
          ctx.stroke();
          // Trunk highlight
          ctx.fillStyle = "#C89050";
          ctx.fillRect(-0.3, 2.5, 1.2, 6);
          // Canopy - layered bright circles
          ctx.fillStyle = "#38A838";
          ctx.beginPath(); ctx.arc(0, -1, 9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#48C848";
          ctx.beginPath(); ctx.arc(-3, -3, 6.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(3.5, -1, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#60E060";
          ctx.beginPath(); ctx.arc(-1, -4.5, 5.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(2, -3.5, 4.5, 0, Math.PI * 2); ctx.fill();
          // Bright highlight spots
          ctx.fillStyle = "#90FF80";
          ctx.beginPath(); ctx.arc(-2, -6, 2.8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#80FF70";
          ctx.beginPath(); ctx.arc(3, -5, 2, 0, Math.PI * 2); ctx.fill();
          // Canopy edge glow
          ctx.strokeStyle = "#80FF68";
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.4;
          ctx.beginPath(); ctx.arc(0, -1, 9, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;

        } else if (level.region === "swamp") {
          // --- Centered Poison Mushroom ---
          // Murky water puddle
          ctx.fillStyle = "#2a6858";
          ctx.globalAlpha = 0.7;
          ctx.beginPath(); ctx.ellipse(0, 8, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          // Stem
          ctx.fillStyle = "#D8C8B0";
          ctx.beginPath();
          ctx.moveTo(-2.5, 3); ctx.lineTo(-2, -2); ctx.lineTo(2, -2); ctx.lineTo(2.5, 3);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#E8D8C0";
          ctx.lineWidth = 0.6;
          ctx.stroke();
          // Stem highlight
          ctx.fillStyle = "#F0E0D0";
          ctx.fillRect(-0.5, -1, 1, 4);
          // Cap - large centered dome
          ctx.fillStyle = "#C040E8";
          ctx.beginPath(); ctx.ellipse(0, -2.6, 10, 8, 0, Math.PI, 0); ctx.fill();
          // Cap shading - darker underside
          ctx.fillStyle = "#A030C8";
          ctx.beginPath(); ctx.ellipse(0, -2.5, 9, 2.5, 0, 0, Math.PI); ctx.fill();
          // Cap bright spots
          ctx.fillStyle = "#E8A0FF";
          ctx.beginPath(); ctx.arc(-4, -6, 1.8, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(2, -7, 1.3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(5, -4.5, 1, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#F0C8FF";
          ctx.beginPath(); ctx.arc(-1, -8, 1, 0, Math.PI * 2); ctx.fill();
          // Cap outline for pop
          ctx.strokeStyle = "#D868FF";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(0, -3.5, 10, 7, 0, Math.PI, 0); ctx.stroke();
          // Glowing bubbles
          ctx.fillStyle = "#80FFD0";
          ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.arc(-6, 5, 1.6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#70FFBB";
          ctx.beginPath(); ctx.arc(5, 6, 1.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#90FFE0";
          ctx.beginPath(); ctx.arc(-2, 7, 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          // Toxic drip from cap
          ctx.fillStyle = "#B050E0";
          ctx.globalAlpha = 0.7;
          ctx.beginPath(); ctx.ellipse(-5, -0.5, 1, 2, 0.2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(6, 0, 0.8, 1.5, -0.2, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;

        } else if (level.region === "desert") {
          // --- Centered Sun Icon ---
          // Outer glow
          ctx.fillStyle = "#FFD700";
          ctx.globalAlpha = 0.2;
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          // Sun rays (8 bold rays)
          ctx.strokeStyle = "#FFB800";
          ctx.lineWidth = 2.5;
          ctx.lineCap = "round";
          for (let r = 0; r < 8; r++) {
            const a = (r * Math.PI) / 4 + Math.PI / 8;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
            ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
            ctx.stroke();
          }
          // Ray tips (bright flare)
          ctx.strokeStyle = "#FFD860";
          ctx.lineWidth = 1.2;
          for (let r = 0; r < 8; r++) {
            const a = (r * Math.PI) / 4 + Math.PI / 8;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
            ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
            ctx.stroke();
          }
          // Sun body
          ctx.fillStyle = "#FFAA00";
          ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, Math.PI * 2); ctx.fill();
          // Sun body gradient ring
          ctx.fillStyle = "#FFC830";
          ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
          // Bright core
          ctx.fillStyle = "#FFE870";
          ctx.beginPath(); ctx.arc(0, -0.5, 3.5, 0, Math.PI * 2); ctx.fill();
          // White-hot center
          ctx.fillStyle = "#FFF8D0";
          ctx.beginPath(); ctx.arc(0, -1, 2, 0, Math.PI * 2); ctx.fill();
          // Subtle face-like warmth (two small eye dots for character)
          ctx.fillStyle = "#CC8800";
          ctx.globalAlpha = 0.35;
          ctx.beginPath(); ctx.arc(-1.5, -0.5, 0.6, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(1.5, -0.5, 0.6, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;

        } else if (level.region === "winter") {
          // --- Centered Crystal Snowflake ---
          // Outer glow
          ctx.fillStyle = "#88d0ff";
          ctx.globalAlpha = 0.25;
          ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          // Six main branches
          for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI) / 3);
            // Main branch - white
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(-1.2, 0); ctx.lineTo(-0.5, -9.5); ctx.lineTo(0.5, -9.5); ctx.lineTo(1.2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#a0d8ff";
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // Diamond tip
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(0, -12); ctx.lineTo(-2, -9.5); ctx.lineTo(0, -8); ctx.lineTo(2, -9.5);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#b0e0ff";
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // Lower sub-branches
            ctx.fillStyle = "#d0f0ff";
            ctx.beginPath();
            ctx.moveTo(0, -4); ctx.lineTo(-4.5, -7); ctx.lineTo(-3.5, -5.5); ctx.lineTo(0, -3.2);
            ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, -4); ctx.lineTo(4.5, -7); ctx.lineTo(3.5, -5.5); ctx.lineTo(0, -3.2);
            ctx.closePath(); ctx.fill();
            // Upper sub-branches
            ctx.fillStyle = "#e0f4ff";
            ctx.beginPath();
            ctx.moveTo(0, -6.5); ctx.lineTo(-3, -8.5); ctx.lineTo(-2.2, -7.5); ctx.lineTo(0, -6);
            ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, -6.5); ctx.lineTo(3, -8.5); ctx.lineTo(2.2, -7.5); ctx.lineTo(0, -6);
            ctx.closePath(); ctx.fill();
            ctx.restore();
          }
          // Center crystal
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#d8f0ff";
          ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, Math.PI * 2); ctx.fill();

        } else if (level.region === "volcanic") {
          // --- Centered Flame Icon ---
          // Outer fire glow
          ctx.fillStyle = "#ff4400";
          ctx.globalAlpha = 0.25;
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          // Main flame body (outer - dark red)
          ctx.fillStyle = "#DD2200";
          ctx.beginPath();
          ctx.moveTo(0, -12);
          ctx.quadraticCurveTo(5, -8, 7, -3);
          ctx.quadraticCurveTo(9, 2, 6, 6);
          ctx.quadraticCurveTo(3, 10, 0, 10);
          ctx.quadraticCurveTo(-3, 10, -6, 6);
          ctx.quadraticCurveTo(-9, 2, -7, -3);
          ctx.quadraticCurveTo(-5, -8, 0, -12);
          ctx.fill();
          // Flame left tendril
          ctx.fillStyle = "#EE4400";
          ctx.beginPath();
          ctx.moveTo(-3, -5);
          ctx.quadraticCurveTo(-7, -9, -4, -11);
          ctx.quadraticCurveTo(-2, -8, -1, -6);
          ctx.closePath();
          ctx.fill();
          // Flame right tendril
          ctx.beginPath();
          ctx.moveTo(3, -4);
          ctx.quadraticCurveTo(6, -7, 5, -10);
          ctx.quadraticCurveTo(3, -7, 2, -5);
          ctx.closePath();
          ctx.fill();
          // Middle layer (orange)
          ctx.fillStyle = "#FF6600";
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.quadraticCurveTo(3.5, -5, 5, -1);
          ctx.quadraticCurveTo(6, 3, 4, 6);
          ctx.quadraticCurveTo(2, 9, 0, 9);
          ctx.quadraticCurveTo(-2, 9, -4, 6);
          ctx.quadraticCurveTo(-6, 3, -5, -1);
          ctx.quadraticCurveTo(-3.5, -5, 0, -9);
          ctx.fill();
          // Inner layer (bright orange-yellow)
          ctx.fillStyle = "#FFAA00";
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.quadraticCurveTo(2.5, -3, 3, 1);
          ctx.quadraticCurveTo(3.5, 5, 0, 7);
          ctx.quadraticCurveTo(-3.5, 5, -3, 1);
          ctx.quadraticCurveTo(-2.5, -3, 0, -6);
          ctx.fill();
          // Core (bright yellow)
          ctx.fillStyle = "#FFD800";
          ctx.beginPath();
          ctx.moveTo(0, -3);
          ctx.quadraticCurveTo(1.5, -1, 1.8, 2);
          ctx.quadraticCurveTo(2, 5, 0, 6);
          ctx.quadraticCurveTo(-2, 5, -1.8, 2);
          ctx.quadraticCurveTo(-1.5, -1, 0, -3);
          ctx.fill();
          // White-hot center
          ctx.fillStyle = "#FFF4B0";
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(0.8, 1, 0.8, 3);
          ctx.quadraticCurveTo(0.5, 5, 0, 5);
          ctx.quadraticCurveTo(-0.5, 5, -0.8, 3);
          ctx.quadraticCurveTo(-0.8, 1, 0, 0);
          ctx.fill();
          ctx.globalAlpha = 1;
          // Animated spark particles
          const bob = Math.sin(time * 4) * 1.5;
          ctx.fillStyle = "#FFDD00";
          ctx.beginPath(); ctx.arc(-3, -10 + bob, 1.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#FF8800";
          ctx.beginPath(); ctx.arc(3.5, -9 - bob * 0.6, 0.9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#FFCC00";
          ctx.beginPath(); ctx.arc(0.5, -12 + bob * 0.4, 0.7, 0, Math.PI * 2); ctx.fill();

        } else {
          // Fallback - bright gem
          ctx.fillStyle = "#FFB840";
          ctx.beginPath();
          ctx.moveTo(0, -8); ctx.lineTo(6, 0); ctx.lineTo(0, 8); ctx.lineTo(-6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#FFD870";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = "#FFE880";
          ctx.beginPath();
          ctx.moveTo(0, -5); ctx.lineTo(3, 0); ctx.lineTo(0, 5); ctx.lineTo(-3, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
        ctx.globalAlpha = 1;

        // Difficulty skulls/pips
        const diffColors = level.difficulty === 1 ? ["#50E080", "#30A858"] : level.difficulty === 2 ? ["#FFD040", "#D0A020"] : ["#FF5050", "#C83030"];
        for (let d = 0; d < 3; d++) {
          const dx = x - 7 + d * 7;
          const dy = y + size + 7;
          if (d < level.difficulty) {
            // Glow
            ctx.fillStyle = diffColors[0];
            ctx.globalAlpha = 0.25;
            ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            // Filled pip
            ctx.fillStyle = diffColors[0];
            ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();
            // Highlight
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = 0.4;
            ctx.beginPath(); ctx.arc(dx - 0.5, dy - 0.8, 1.2, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            // Ring
            ctx.strokeStyle = diffColors[1];
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.stroke();
          } else {
            // Empty pip
            ctx.fillStyle = "#2A2520";
            ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#4a4540";
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2); ctx.stroke();
          }
        }

        // Stars (proper 10-point stars with inner/outer radius)
        for (let s = 0; s < 3; s++) {
          const sx = x - 11 + s * 11;
          const sy = y + size + 18;
          const earned = stars > s;
          const outerR = 5.5;
          const innerR = 2.2;

          // Star glow for earned
          if (earned) {
            ctx.fillStyle = "#ffd700";
            ctx.globalAlpha = 0.3;
            ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
          }
          // Star shape (10 points: alternating outer/inner)
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const px = sx + Math.cos(angle) * r;
            const py = sy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          if (earned) {
            ctx.fillStyle = "#FFD700";
            ctx.fill();
            // Star highlight
            ctx.fillStyle = "#FFF0A0";
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
              const angle = (i * Math.PI) / 5 - Math.PI / 2;
              const r = (i % 2 === 0 ? outerR : innerR) * 0.55;
              const px = sx - 0.5 + Math.cos(angle) * r;
              const py = sy - 0.5 + Math.sin(angle) * r;
              if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
            // Gold outline
            ctx.strokeStyle = "#B89A10";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
              const angle = (i * Math.PI) / 5 - Math.PI / 2;
              const r = i % 2 === 0 ? outerR : innerR;
              const px = sx + Math.cos(angle) * r;
              const py = sy + Math.sin(angle) * r;
              if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          } else {
            // Unearned: dark with subtle outline
            ctx.fillStyle = "#2A2520";
            ctx.fill();
            ctx.strokeStyle = "#4a4030";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      } else {
        // Lock icon (detailed padlock)
        ctx.save();
        ctx.translate(x, y);
        // Lock body shadow
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath(); ctx.roundRect(-6, 0.5, 12, 10, 2); ctx.fill();
        // Lock body
        const lockGrad = ctx.createLinearGradient(-6, 0, 6, 0);
        lockGrad.addColorStop(0, "#5A5858");
        lockGrad.addColorStop(0.4, "#787878");
        lockGrad.addColorStop(0.6, "#686868");
        lockGrad.addColorStop(1, "#4A4848");
        ctx.fillStyle = lockGrad;
        ctx.beginPath(); ctx.roundRect(-6, -1, 12, 10, 2); ctx.fill();
        // Lock body border
        ctx.strokeStyle = "#888888";
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.roundRect(-6, -1, 12, 10, 2); ctx.stroke();
        // Lock body highlight
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.roundRect(-5, -0.5, 10, 3, [2, 2, 0, 0]); ctx.fill();
        // Shackle
        ctx.strokeStyle = "#808080";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, -2, 5, Math.PI, 0);
        ctx.stroke();
        // Shackle highlight
        ctx.strokeStyle = "#A0A0A0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -2, 4, Math.PI + 0.3, -0.3);
        ctx.stroke();
        // Keyhole
        ctx.fillStyle = "#2A2828";
        ctx.beginPath(); ctx.arc(0, 3, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(-1, 3.5, 2, 3);
        // Keyhole highlight
        ctx.fillStyle = "#404040";
        ctx.beginPath(); ctx.arc(0, 2.5, 1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

    });

    // --- MARCHING ENEMIES near selected level ---
    if (selectedLevel) {
      const level = getLevelById(selectedLevel);
      if (level) {
        const lx = level.x;
        const ly = getY(level.y);

        for (let i = 0; i < 5; i++) {
          const offset = i * 16;
          const ex = lx + 50 + offset + Math.sin(time * 3 + i) * 3;
          const ey = ly + 6 + Math.sin(time * 2 + i * 0.7) * 2;
          const bobble = Math.sin(time * 6 + i * 2) * 2;

          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(ex, ey + 10, 5, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = ["#4a1515", "#3a1010", "#5a2020"][i % 3];
          ctx.beginPath();
          ctx.ellipse(ex, ey + bobble, 6, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex, ey - 11 + bobble, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ff3333";
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(ex - 2, ey - 12 + bobble, 1.5, 0, Math.PI * 2);
          ctx.arc(ex + 2, ey - 12 + bobble, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.font = "bold 10px 'bc-novatica-cyr', serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(180, 20, 20, 0.9)";
        ctx.fillText("⚔ ENEMIES APPROACH!", lx + 45, ly - 24);
      }
    }

    // Tooltip with Preview Image - only show on hover, not for the already-selected level
    if (hoveredLevel && hoveredLevel !== selectedLevel) {
      const level = getLevelById(hoveredLevel);
      if (level && isLevelUnlocked(level.id)) {
        const x = level.x;
        const y = getY(level.y);
        const size = 28;

        const cardWidth = 150;
        const cardHeight = 110;
        const cardX = x - cardWidth / 2;

        // Determine if tooltip should appear above or below based on level Y position
        const showBelow = level.y < 50;
        const cardY = showBelow
          ? y + size + 12
          : y - size - cardHeight - 12;

        // Draw Background
        ctx.save();
        ctx.fillStyle = "rgba(12, 10, 8, 0.95)";
        ctx.strokeStyle = "#a0824d";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 6);
        ctx.fill();
        ctx.stroke();

        // Draw Image
        const lvlData = LEVEL_DATA[level.id];
        if (lvlData?.previewImage) {
          if (!imageCache.current[level.id]) {
            const img = new Image();
            img.src = lvlData.previewImage;
            imageCache.current[level.id] = img;
          }
          const img = imageCache.current[level.id];

          if (img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(
              cardX + 2,
              cardY + 2,
              cardWidth - 4,
              cardHeight - 24,
              [4, 4, 0, 0]
            );
            ctx.clip();
            ctx.drawImage(
              img,
              cardX + 2,
              cardY + 2,
              cardWidth - 4,
              cardHeight - 24
            );
            ctx.restore();
          } else {
            ctx.fillStyle = "#222";
            ctx.fillRect(cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 24);
          }
        }

        // Draw Text
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.font = "bold 11px 'bc-novatica-cyr', serif";
        ctx.fillText(level.name, x, cardY + cardHeight - 8);

        ctx.restore();
      }
    }

    // === ATMOSPHERIC CLOUD LAYER ===
    ctx.save();
    for (let c = 0; c < 12; c++) {
      const cloudBaseX = seededRandom(c * 37) * width + Math.sin(time * 0.15 + c * 2) * 40;
      const cloudBaseY = 30 + seededRandom(c * 37 + 1) * (height * 0.25);
      const cloudW = 60 + seededRandom(c * 37 + 2) * 80;
      const cloudH = 12 + seededRandom(c * 37 + 3) * 15;

      // Determine cloud color based on region position
      let cloudTint = "rgba(80,70,60,";
      if (cloudBaseX > 1440) cloudTint = "rgba(60,30,20,";
      else if (cloudBaseX > 1080) cloudTint = "rgba(140,160,180,";
      else if (cloudBaseX > 720) cloudTint = "rgba(160,140,100,";
      else if (cloudBaseX > 380) cloudTint = "rgba(80,100,80,";

      ctx.globalAlpha = 0.06 + seededRandom(c * 37 + 4) * 0.06;
      ctx.fillStyle = cloudTint + "1)";

      // Cloud is several overlapping ellipses
      for (let blob = 0; blob < 4; blob++) {
        const blobX = cloudBaseX + (blob - 1.5) * cloudW * 0.25;
        const blobY = cloudBaseY + Math.sin(blob * 1.5) * cloudH * 0.3;
        const blobW = cloudW * (0.3 + seededRandom(c + blob * 7) * 0.25);
        const blobH = cloudH * (0.6 + seededRandom(c + blob * 11) * 0.4);
        ctx.beginPath();
        ctx.ellipse(blobX, blobY, blobW, blobH, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // === FLYING CREATURES ===
    // Birds in grassland/swamp, bats in volcanic
    ctx.save();
    for (let b = 0; b < 8; b++) {
      const birdBaseX = seededRandom(b * 53) * width;
      const birdBaseY = 15 + seededRandom(b * 53 + 1) * 35;
      const birdX = birdBaseX + Math.sin(time * 0.8 + b * 2.3) * 60 + time * (4 + seededRandom(b) * 3);
      const birdY = getY(birdBaseY) + Math.sin(time * 1.5 + b * 1.7) * 8;
      const wrappedX = ((birdX % (width + 100)) + width + 100) % (width + 100) - 50;

      const wingFlap = Math.sin(time * 8 + b * 3) * 0.6;
      const wingSpan = 4 + seededRandom(b * 53 + 2) * 3;

      // Color based on region
      let birdColor = "#2a2a20";
      if (wrappedX > 1440) birdColor = "#1a0808"; // bats
      else if (wrappedX > 1080) birdColor = "#4a5a6a";
      else if (wrappedX > 720) birdColor = "#5a4a30";

      ctx.strokeStyle = birdColor;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(wrappedX - wingSpan, birdY + wingFlap * wingSpan);
      ctx.quadraticCurveTo(wrappedX - wingSpan * 0.3, birdY - Math.abs(wingFlap) * 2, wrappedX, birdY);
      ctx.quadraticCurveTo(wrappedX + wingSpan * 0.3, birdY - Math.abs(wingFlap) * 2, wrappedX + wingSpan, birdY + wingFlap * wingSpan);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // === ANIMATED DUST MOTES / PARTICLES ===
    ctx.save();
    for (let d = 0; d < 30; d++) {
      const dustX = seededRandom(d * 67) * width + Math.sin(time * 0.4 + d * 1.3) * 20;
      const dustY = seededRandom(d * 67 + 1) * height + Math.cos(time * 0.3 + d * 0.9) * 15;
      const dustSize = 0.8 + seededRandom(d * 67 + 2) * 1.5;
      const dustAlpha = 0.15 + Math.sin(time * 2 + d * 0.7) * 0.1;

      // Color by region
      let dustColor = "200,180,140";
      if (dustX > 1440) dustColor = "255,120,50";
      else if (dustX > 1080) dustColor = "200,220,240";
      else if (dustX > 720) dustColor = "220,200,150";
      else if (dustX > 380) dustColor = "120,200,120";

      ctx.fillStyle = `rgba(${dustColor},${dustAlpha})`;
      ctx.beginPath();
      ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // === ENHANCED FOG EDGES ===
    // Left fog - deep green tint for grassland
    const leftFog = ctx.createLinearGradient(0, 0, 70, 0);
    leftFog.addColorStop(0, "rgba(15, 20, 8, 0.98)");
    leftFog.addColorStop(0.4, "rgba(20, 25, 10, 0.6)");
    leftFog.addColorStop(0.7, "rgba(25, 30, 12, 0.25)");
    leftFog.addColorStop(1, "rgba(25, 30, 12, 0)");
    ctx.fillStyle = leftFog;
    ctx.fillRect(0, 0, 70, height);

    // Right fog - red/volcanic tint
    const rightFog = ctx.createLinearGradient(width - 70, 0, width, 0);
    rightFog.addColorStop(0, "rgba(30, 10, 5, 0)");
    rightFog.addColorStop(0.3, "rgba(35, 12, 5, 0.25)");
    rightFog.addColorStop(0.6, "rgba(40, 15, 8, 0.6)");
    rightFog.addColorStop(1, "rgba(30, 8, 3, 0.98)");
    ctx.fillStyle = rightFog;
    ctx.fillRect(width - 70, 0, 70, height);

    // Top fog - dark atmospheric
    const topFog = ctx.createLinearGradient(0, 0, 0, 45);
    topFog.addColorStop(0, "rgba(10, 5, 2, 0.85)");
    topFog.addColorStop(0.5, "rgba(15, 8, 4, 0.35)");
    topFog.addColorStop(1, "rgba(20, 10, 5, 0)");
    ctx.fillStyle = topFog;
    ctx.fillRect(0, 0, width, 45);

    // Bottom fog - deep ground shadow
    const bottomFog = ctx.createLinearGradient(0, height - 50, 0, height);
    bottomFog.addColorStop(0, "rgba(15, 8, 3, 0)");
    bottomFog.addColorStop(0.3, "rgba(15, 8, 3, 0.2)");
    bottomFog.addColorStop(0.6, "rgba(12, 6, 2, 0.55)");
    bottomFog.addColorStop(1, "rgba(10, 5, 2, 0.95)");
    ctx.fillStyle = bottomFog;
    ctx.fillRect(0, height - 50, width, 50);

    // Corner darkening for frame effect
    const cornerSize = 120;
    // Top-left
    const tlGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cornerSize);
    tlGrad.addColorStop(0, "rgba(5,3,1,0.5)");
    tlGrad.addColorStop(1, "rgba(5,3,1,0)");
    ctx.fillStyle = tlGrad;
    ctx.fillRect(0, 0, cornerSize, cornerSize);
    // Top-right
    const trGrad = ctx.createRadialGradient(width, 0, 0, width, 0, cornerSize);
    trGrad.addColorStop(0, "rgba(5,3,1,0.5)");
    trGrad.addColorStop(1, "rgba(5,3,1,0)");
    ctx.fillStyle = trGrad;
    ctx.fillRect(width - cornerSize, 0, cornerSize, cornerSize);
    // Bottom-left
    const blGrad = ctx.createRadialGradient(0, height, 0, 0, height, cornerSize);
    blGrad.addColorStop(0, "rgba(5,3,1,0.5)");
    blGrad.addColorStop(1, "rgba(5,3,1,0)");
    ctx.fillStyle = blGrad;
    ctx.fillRect(0, height - cornerSize, cornerSize, cornerSize);
    // Bottom-right
    const brGrad = ctx.createRadialGradient(width, height, 0, width, height, cornerSize);
    brGrad.addColorStop(0, "rgba(5,3,1,0.5)");
    brGrad.addColorStop(1, "rgba(5,3,1,0)");
    ctx.fillStyle = brGrad;
    ctx.fillRect(width - cornerSize, height - cornerSize, cornerSize, cornerSize);
  }, [
    mapHeight,
    hoveredLevel,
    selectedLevel,
    levelStars,
    seededRandom,
    getY,
    isLevelUnlocked,
    getLevelById,
  ]);

  useEffect(() => {
    let animationId: number;
    let lastDrawTime = 0;
    let lastStateTime = 0;
    const animate = (timestamp: number) => {
      // Canvas drawing throttled to ~50fps (20ms)
      if (timestamp - lastDrawTime > 20) {
        animTimeRef.current = timestamp / 1000;
        lastDrawTime = timestamp;
        drawMap();
      }
      // React state update throttled further (~10fps) for BattlefieldPreview
      if (timestamp - lastStateTime > 100) {
        setAnimTime(timestamp / 1000);
        lastStateTime = timestamp;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate(0);
    return () => cancelAnimationFrame(animationId);
  }, [drawMap]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = mapHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let found = false;
    for (const level of WORLD_LEVELS) {
      const ly = getY(level.y);
      const dist = Math.sqrt((mouseX - level.x) ** 2 + (mouseY - ly) ** 2);
      if (dist < 28) {
        setHoveredLevel(level.id);
        found = true;
        break;
      }
    }
    if (!found) setHoveredLevel(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't process click if we were actually dragging (moved more than threshold)
    if (hasDragged) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = mapHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    for (const level of WORLD_LEVELS) {
      const ly = getY(level.y);
      const dist = Math.sqrt((mouseX - level.x) ** 2 + (mouseY - ly) ** 2);
      if (dist < 28) {
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
    setHasDragged(false);
    setDragStartX(e.pageX - container.offsetLeft);
    setScrollStartLeft(container.scrollLeft);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragStartX) * 1.5; // Multiply for faster scrolling
    // Only consider it a drag if moved more than 5 pixels
    if (Math.abs(x - dragStartX) > 5) {
      setHasDragged(true);
    }
    container.scrollLeft = scrollStartLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Reset hasDragged after a short delay to allow click handler to check it
    setTimeout(() => setHasDragged(false), 50);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStartX(e.touches[0].pageX - container.offsetLeft);
    setScrollStartLeft(container.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container || e.touches.length !== 1) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    if (Math.abs(x - dragStartX) > 5) {
      setHasDragged(true);
    }
    container.scrollLeft = scrollStartLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => setHasDragged(false), 50);
  };

  const canStart = selectedLevel && selectedHero && selectedSpells.length === 3;
  const currentLevel = selectedLevel ? getLevelById(selectedLevel) : null;
  const waveCount = selectedLevel ? getWaveCount(selectedLevel) : 0;

  function goToNextLevel() {
    // If no level is selected, go to level 1
    if (!currentLevel) {
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
    if (!currentLevel) {
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
      >
        <div
          className="relative sm:px-2 z-20"
          style={{
            background: panelGradient,
          }}
        >
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25}, transparent)` }} />

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
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${DIVIDER.gold40} 20%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 80%, transparent)` }} />
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
                  {LEVEL_DATA[currentLevel.id]?.previewImage ? (
                    <img
                      src={LEVEL_DATA[currentLevel.id].previewImage}
                      alt={`${currentLevel.name} preview`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : null}
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${LEVEL_DATA[currentLevel.id]?.previewImage
                      ? "opacity-0"
                      : "opacity-100"
                      }`}
                  >
                    <div
                      className={`w-full h-full ${currentLevel.region === "grassland"
                        ? "bg-gradient-to-br from-green-900/80 via-green-800/60 to-amber-900/40"
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
            className="flex-1 relative bg-gradient-to-br from-stone-900 to-stone-950 rounded-2xl border-2 border-amber-800/50 sm:overflow-hidden shadow-2xl min-h-0"
            cornerSize={44}
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
    </div>
  );
};

export default WorldMap;
