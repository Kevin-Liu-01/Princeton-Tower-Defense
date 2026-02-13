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
  const [mapHeight, setMapHeight] = useState(500);
  const [hoveredHero, setHoveredHero] = useState<HeroType | null>(null);
  const [hoveredSpell, setHoveredSpell] = useState<SpellType | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});

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

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.minHeight = `${height}px`;
    ctx.scale(dpr, dpr);

    const time = animTime;

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

      // Text glow
      ctx.shadowColor = r.labelGlow;
      ctx.shadowBlur = 8;
      ctx.fillStyle = r.labelColor;
      ctx.fillText(r.name, labelX, labelY + 4);
      ctx.shadowBlur = 0;

      // Text shadow for depth
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillText(r.name, labelX + 0.5, labelY + 4.5);

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

    // === GRASSLAND DETAILS ===
    // Enhanced 3D Isometric Trees with more detail
    const drawTree = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);

      // Ground shadow with depth
      const shadowGrad = ctx.createRadialGradient(x + 3, y + 6, 0, x + 3, y + 6, 14 * scale);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(x + 3, y + 6, 14 * scale, 5 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Tree trunk with bark texture
      const trunkGrad = ctx.createLinearGradient(x - 4 * scale, 0, x + 4 * scale, 0);
      trunkGrad.addColorStop(0, "#3a2010");
      trunkGrad.addColorStop(0.3, "#5a4030");
      trunkGrad.addColorStop(0.7, "#4a3020");
      trunkGrad.addColorStop(1, "#2a1008");
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(x - 4 * scale, y + 5);
      ctx.quadraticCurveTo(x - 5 * scale, y - 6 * scale, x - 3 * scale, y - 14 * scale);
      ctx.lineTo(x + 3 * scale, y - 14 * scale);
      ctx.quadraticCurveTo(x + 5 * scale, y - 6 * scale, x + 4 * scale, y + 5);
      ctx.closePath();
      ctx.fill();

      // Bark detail lines
      ctx.strokeStyle = "#2a1808";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + (i - 1) * 2 * scale, y + 3);
        ctx.lineTo(x + (i - 1) * 1.5 * scale, y - 10 * scale);
        ctx.stroke();
      }

      // Main foliage - multiple layered leaves for depth
      // Back layer (darker)
      ctx.fillStyle = "#1d4a0f";
      ctx.beginPath();
      ctx.arc(x - 2 * scale, y - 22 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.arc(x + 6 * scale, y - 20 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Middle layer
      ctx.fillStyle = "#2d5a1f";
      ctx.beginPath();
      ctx.arc(x, y - 20 * scale, 13 * scale, 0, Math.PI * 2);
      ctx.arc(x - 6 * scale, y - 16 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.arc(x + 5 * scale, y - 16 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Front layer (lighter - highlights)
      ctx.fillStyle = "#3d7a2f";
      ctx.beginPath();
      ctx.arc(x - 3 * scale, y - 18 * scale, 7 * scale, 0, Math.PI * 2);
      ctx.arc(x + 4 * scale, y - 22 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Leaf details / texture
      ctx.fillStyle = "#4d8a3f";
      for (let i = 0; i < 6; i++) {
        const lx = x + (seededRandom(x + i * 7) - 0.5) * 16 * scale;
        const ly = y - 16 * scale - seededRandom(x + i * 7 + 1) * 10 * scale;
        ctx.beginPath();
        ctx.arc(lx, ly, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle light dappling
      ctx.fillStyle = "rgba(100, 180, 80, 0.15)";
      ctx.beginPath();
      ctx.arc(x + 2 * scale, y - 24 * scale, 5 * scale, 0, Math.PI * 2);
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

    // Enhanced Military camp with isometric detail
    const drawCamp = (cx: number, cyPct: number) => {
      const cy = getY(cyPct);

      // Ground patch / cleared area
      ctx.fillStyle = "rgba(80, 60, 40, 0.4)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 35, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tent shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main tent body with 3D shading
      const tentGrad = ctx.createLinearGradient(cx - 20, cy, cx + 20, cy);
      tentGrad.addColorStop(0, "#4a3a2a");
      tentGrad.addColorStop(0.4, "#6a5a4a");
      tentGrad.addColorStop(0.6, "#5a4a3a");
      tentGrad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = tentGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 22, cy + 6);
      ctx.lineTo(cx - 22, cy + 6);
      ctx.closePath();
      ctx.fill();

      // Tent opening (dark)
      ctx.fillStyle = "#1a1008";
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 6);
      ctx.lineTo(cx, cy - 5);
      ctx.lineTo(cx + 5, cy + 6);
      ctx.closePath();
      ctx.fill();

      // Tent seams
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx, cy + 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx - 11, cy - 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx + 11, cy - 7);
      ctx.stroke();

      // Flag pole with shadow
      ctx.fillStyle = "#3a2010";
      ctx.fillRect(cx + 19, cy - 26, 3, 34);
      // Flag with wave animation
      ctx.fillStyle = "#f59e0b";
      const fw = Math.sin(time * 3 + cx) * 3;
      const fw2 = Math.sin(time * 3.5 + cx) * 2;
      ctx.beginPath();
      ctx.moveTo(cx + 22, cy - 24);
      ctx.quadraticCurveTo(cx + 30, cy - 20 + fw, cx + 38, cy - 16 + fw2);
      ctx.quadraticCurveTo(cx + 30, cy - 12 + fw, cx + 22, cy - 8);
      ctx.closePath();
      ctx.fill();
      // Flag detail (stripes)
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 24, cy - 16 + fw * 0.5);
      ctx.quadraticCurveTo(cx + 30, cy - 14 + fw * 0.7, cx + 36, cy - 12 + fw2 * 0.8);
      ctx.stroke();

      // Campfire with detailed flames
      // Fire glow
      const glowGrad = ctx.createRadialGradient(cx - 12, cy + 2, 0, cx - 12, cy + 2, 12);
      glowGrad.addColorStop(0, `rgba(255, 150, 50, ${0.4 + Math.sin(time * 6) * 0.2})`);
      glowGrad.addColorStop(1, "rgba(255, 100, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx - 12, cy + 2, 12, 0, Math.PI * 2);
      ctx.fill();

      // Fire stones
      ctx.fillStyle = "#4a4040";
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const fx = cx - 12 + Math.cos(angle) * 5;
        const fy = cy + 4 + Math.sin(angle) * 2;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fire flames
      for (let f = 0; f < 3; f++) {
        const fh = 6 + Math.sin(time * 8 + f * 2) * 3;
        const fx = cx - 14 + f * 3;
        ctx.fillStyle = f === 1 ? "#ffcc00" : "#ff6600";
        ctx.globalAlpha = 0.8 + Math.sin(time * 7 + f) * 0.2;
        ctx.beginPath();
        ctx.moveTo(fx - 2, cy + 3);
        ctx.quadraticCurveTo(fx, cy - fh, fx + 2, cy + 3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Smoke particles with better animation
      for (let i = 0; i < 4; i++) {
        const sy = cy - 8 - ((time * 18 + i * 10) % 25);
        const sx = cx - 12 + Math.sin(time * 1.5 + i * 1.2) * 4;
        const sAlpha = 0.35 - ((time * 18 + i * 10) % 25) / 70;
        if (sAlpha > 0) {
          ctx.globalAlpha = sAlpha;
          ctx.fillStyle = "#888";
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5 + i * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Supply crates
      ctx.fillStyle = "#5a4030";
      ctx.fillRect(cx + 25, cy + 1, 8, 6);
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(cx + 26, cy - 4, 6, 5);
      // Crate detail lines
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(cx + 25, cy + 1, 8, 6);

      // Weapon rack
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(cx - 28, cy, 2, 10);
      ctx.fillRect(cx - 22, cy, 2, 10);
      ctx.fillRect(cx - 29, cy - 2, 10, 2);
      // Spears
      ctx.strokeStyle = "#6a6a6a";
      ctx.lineWidth = 1;
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        ctx.moveTo(cx - 28 + s * 3, cy - 1);
        ctx.lineTo(cx - 28 + s * 3, cy - 12);
        ctx.stroke();
        ctx.fillStyle = "#8a8a8a";
        ctx.beginPath();
        ctx.moveTo(cx - 29 + s * 3, cy - 12);
        ctx.lineTo(cx - 27 + s * 3, cy - 15);
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

    // Enhanced Watch tower with 3D isometric detail
    const drawWatchTower = (tx: number, tyPct: number) => {
      const ty = getY(tyPct);

      // Tower shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(tx + 4, ty + 8, 14, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Base stones
      ctx.fillStyle = "#3a3030";
      ctx.beginPath();
      ctx.moveTo(tx - 12, ty + 5);
      ctx.lineTo(tx + 12, ty + 5);
      ctx.lineTo(tx + 10, ty - 2);
      ctx.lineTo(tx - 10, ty - 2);
      ctx.closePath();
      ctx.fill();

      // Main tower body with 3D shading
      const towerGrad = ctx.createLinearGradient(tx - 10, 0, tx + 10, 0);
      towerGrad.addColorStop(0, "#4a3a2a");
      towerGrad.addColorStop(0.3, "#6a5a4a");
      towerGrad.addColorStop(0.7, "#5a4a3a");
      towerGrad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = towerGrad;
      ctx.fillRect(tx - 9, ty - 38, 18, 40);

      // Stone texture lines
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      for (let row = 0; row < 8; row++) {
        const ry = ty - 35 + row * 5;
        ctx.beginPath();
        ctx.moveTo(tx - 9, ry);
        ctx.lineTo(tx + 9, ry);
        ctx.stroke();
        // Vertical brick lines (offset each row)
        for (let col = 0; col < 3; col++) {
          const offset = row % 2 === 0 ? 0 : 3;
          ctx.beginPath();
          ctx.moveTo(tx - 9 + col * 6 + offset, ry);
          ctx.lineTo(tx - 9 + col * 6 + offset, ry + 5);
          ctx.stroke();
        }
      }

      // Platform
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(tx - 14, ty - 45, 28, 10);
      // Platform rim (3D effect)
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(tx - 14, ty - 45, 28, 3);

      // Crenellations with 3D depth
      for (let i = 0; i < 5; i++) {
        const cx = tx - 12 + i * 7;
        // Back face
        ctx.fillStyle = "#3a2a1a";
        ctx.fillRect(cx, ty - 52, 5, 8);
        // Front face
        ctx.fillStyle = "#5a4a3a";
        ctx.fillRect(cx, ty - 52, 4, 7);
        // Top face (lighter)
        ctx.fillStyle = "#6a5a4a";
        ctx.fillRect(cx, ty - 52, 4, 2);
      }

      // Window with warm light glow
      const windowGlow = ctx.createRadialGradient(tx, ty - 25, 0, tx, ty - 25, 8);
      windowGlow.addColorStop(0, `rgba(255, 200, 100, ${0.6 + Math.sin(time * 2 + tx) * 0.3})`);
      windowGlow.addColorStop(1, "rgba(255, 150, 50, 0)");
      ctx.fillStyle = windowGlow;
      ctx.beginPath();
      ctx.arc(tx, ty - 25, 8, 0, Math.PI * 2);
      ctx.fill();

      // Window frame
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(tx - 4, ty - 32, 8, 12);
      // Window light
      ctx.fillStyle = `rgba(255, 200, 100, ${0.5 + Math.sin(time * 2 + tx) * 0.25})`;
      ctx.fillRect(tx - 3, ty - 31, 6, 10);
      // Window cross
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(tx - 0.5, ty - 31, 1, 10);
      ctx.fillRect(tx - 3, ty - 27, 6, 1);

      // Roof / beacon
      ctx.fillStyle = "#5a3020";
      ctx.beginPath();
      ctx.moveTo(tx, ty - 58);
      ctx.lineTo(tx + 8, ty - 48);
      ctx.lineTo(tx - 8, ty - 48);
      ctx.closePath();
      ctx.fill();

      // Beacon fire (flickering)
      const beaconFlicker = Math.sin(time * 6 + tx) * 0.3;
      ctx.fillStyle = `rgba(255, 100, 0, ${0.6 + beaconFlicker})`;
      ctx.beginPath();
      ctx.arc(tx, ty - 48, 3 + beaconFlicker * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 200, 50, ${0.4 + beaconFlicker})`;
      ctx.beginPath();
      ctx.arc(tx, ty - 48, 2, 0, Math.PI * 2);
      ctx.fill();

      // Door
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.moveTo(tx - 4, ty + 5);
      ctx.lineTo(tx - 4, ty - 5);
      ctx.arc(tx, ty - 5, 4, Math.PI, 0);
      ctx.lineTo(tx + 4, ty + 5);
      ctx.closePath();
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

    // Crater (war damage)
    const drawCrater = (cx: number, cyPct: number, size: number) => {
      const cy = getY(cyPct);
      ctx.fillStyle = "#2a2015";
      ctx.beginPath();
      ctx.ellipse(cx, cy, size * 1.2, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a3025";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2, size * 0.8, size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      // Scorched edges
      ctx.strokeStyle = "#1a1005";
      ctx.lineWidth = 2;
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
    // Enhanced gnarled swamp trees with more atmosphere
    const drawWillowTree = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);

      // Murky water reflection shadow
      ctx.fillStyle = "rgba(20, 40, 20, 0.4)";
      ctx.beginPath();
      ctx.ellipse(x + 5, y + 4, 16 * scale, 6 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Exposed roots
      ctx.strokeStyle = "#1a1612";
      ctx.lineWidth = 2 * scale;
      for (let r = 0; r < 4; r++) {
        const rx = x + (r - 1.5) * 6 * scale;
        ctx.beginPath();
        ctx.moveTo(x + (r - 1.5) * 2 * scale, y - 2);
        ctx.quadraticCurveTo(rx - 2, y + 2, rx + seededRandom(x + r) * 4, y + 4);
        ctx.stroke();
      }

      // Twisted trunk with bark texture
      const trunkGrad = ctx.createLinearGradient(x - 5 * scale, 0, x + 5 * scale, 0);
      trunkGrad.addColorStop(0, "#0a0a08");
      trunkGrad.addColorStop(0.3, "#1a1a14");
      trunkGrad.addColorStop(0.7, "#141410");
      trunkGrad.addColorStop(1, "#080806");
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(x - 4 * scale, y);
      ctx.quadraticCurveTo(x - 7 * scale, y - 8 * scale, x - 3 * scale, y - 18 * scale);
      ctx.quadraticCurveTo(x - 5 * scale, y - 25 * scale, x, y - 30 * scale);
      ctx.quadraticCurveTo(x + 5 * scale, y - 25 * scale, x + 3 * scale, y - 18 * scale);
      ctx.quadraticCurveTo(x + 7 * scale, y - 8 * scale, x + 4 * scale, y);
      ctx.closePath();
      ctx.fill();

      // Bark knots
      ctx.fillStyle = "#0a0806";
      ctx.beginPath();
      ctx.ellipse(x - 1 * scale, y - 12 * scale, 2 * scale, 3 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 2 * scale, y - 22 * scale, 1.5 * scale, 2 * scale, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Drooping canopy - back layer
      ctx.fillStyle = "#1a2a1a";
      ctx.beginPath();
      ctx.arc(x - 4 * scale, y - 32 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.arc(x + 8 * scale, y - 30 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Middle layer
      ctx.fillStyle = "#2a3a2a";
      ctx.beginPath();
      ctx.arc(x, y - 34 * scale, 16 * scale, 0, Math.PI * 2);
      ctx.arc(x - 12 * scale, y - 26 * scale, 11 * scale, 0, Math.PI * 2);
      ctx.arc(x + 12 * scale, y - 26 * scale, 11 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Front layer (highlights)
      ctx.fillStyle = "#3a4a3a";
      ctx.beginPath();
      ctx.arc(x + 4 * scale, y - 36 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.arc(x - 6 * scale, y - 28 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Spanish moss / hanging vines
      ctx.lineWidth = 1.2 * scale;
      for (let i = 0; i < 8; i++) {
        const vx = x - 14 * scale + i * 4 * scale;
        const vy = y - 24 * scale + seededRandom(x + i * 3) * 8 * scale;
        const len = 18 * scale + Math.sin(time * 1.5 + i + x) * 4 + seededRandom(x + i) * 10;

        // Vine with gradient (darker at bottom)
        const vineGrad = ctx.createLinearGradient(vx, vy, vx, vy + len);
        vineGrad.addColorStop(0, "#2a3a2a");
        vineGrad.addColorStop(1, "#1a2a1a");
        ctx.strokeStyle = vineGrad;

        ctx.beginPath();
        ctx.moveTo(vx, vy);
        const sway = Math.sin(time * 1.2 + i * 0.8) * 3;
        ctx.bezierCurveTo(
          vx + sway * 0.5, vy + len * 0.3,
          vx + sway, vy + len * 0.7,
          vx + sway * 0.3, vy + len
        );
        ctx.stroke();

        // Small leaves on vines
        if (i % 2 === 0) {
          ctx.fillStyle = "#2a4a2a";
          ctx.beginPath();
          ctx.ellipse(vx + sway * 0.5, vy + len * 0.5, 1.5 * scale, 2.5 * scale, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Glowing fungus on trunk
      ctx.fillStyle = `rgba(100, 200, 100, ${0.3 + Math.sin(time * 2 + x) * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(x + 3 * scale, y - 8 * scale, 2 * scale, 1.5 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();
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

    // Swamp pools/puddles
    const drawSwampPool = (px: number, pyPct: number, psize: number) => {
      const py = getY(pyPct);
      // Dark water
      const poolGrad = ctx.createRadialGradient(px, py, 0, px, py, psize);
      poolGrad.addColorStop(0, "rgba(20, 40, 30, 0.7)");
      poolGrad.addColorStop(0.7, "rgba(30, 50, 35, 0.5)");
      poolGrad.addColorStop(1, "rgba(40, 60, 40, 0.2)");
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, psize * 1.3, psize * 0.5, seededRandom(px) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Surface reflection
      ctx.fillStyle = `rgba(100, 150, 100, ${0.1 + Math.sin(time * 1.5 + px) * 0.05})`;
      ctx.beginPath();
      ctx.ellipse(px - psize * 0.3, py - psize * 0.1, psize * 0.4, psize * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawSwampPool(425, 50, 20);
    drawSwampPool(515, 65, 25);
    drawSwampPool(605, 50, 18);
    drawSwampPool(660, 40, 22);

    // Swamp Gas Bubbles
    const drawSwampGas = (x: number, yPct: number) => {
      const y = getY(yPct);
      const tOffset = x * 0.1;
      const bubbleY = y - ((time * 20 + tOffset * 50) % 30);
      const opacity = 1 - ((time * 20 + tOffset * 50) % 30) / 30;

      ctx.fillStyle = `rgba(100, 255, 100, ${opacity * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, bubbleY, 2 + Math.sin(time * 5 + x) * 1, 0, Math.PI * 2);
      ctx.fill();
    };
    for (let i = 0; i < 15; i++) {
      drawSwampGas(
        400 + seededRandom(i * 55) * 300,
        30 + seededRandom(i * 22) * 60
      );
    }

    // Fireflies
    const drawFireflies = (xBase: number, yPct: number) => {
      const yBase = getY(yPct);
      const x = xBase + Math.sin(time * 0.5 + xBase) * 20;
      const y = yBase + Math.cos(time * 0.7 + xBase) * 10;
      const glow = 0.5 + Math.sin(time * 5 + xBase) * 0.5;

      ctx.fillStyle = `rgba(200, 255, 100, ${glow})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    };
    for (let i = 0; i < 10; i++) {
      drawFireflies(
        400 + seededRandom(i * 99) * 320,
        20 + seededRandom(i * 88) * 70
      );
    }

    // Low Mist - dense swamp fog with layers
    for (let layer = 0; layer < 3; layer++) {
      const mistAlpha = 0.04 + layer * 0.02;
      const mistColor = layer === 0 ? "rgba(120, 180, 140," : layer === 1 ? "rgba(150, 200, 160," : "rgba(180, 220, 200,";
      for (let i = 0; i < 6; i++) {
        const mx = 370 + Math.sin(time * (0.15 + layer * 0.05) + i * 1.2 + layer * 0.7) * (40 + layer * 15) + i * 50;
        const my = getY(55 + layer * 8 + Math.cos(time * (0.2 + layer * 0.08) + i * 0.8) * 8);
        const mw = 50 + layer * 20 + seededRandom(i + layer * 20) * 30;
        const mh = 15 + layer * 5 + seededRandom(i + layer * 20 + 1) * 8;
        ctx.fillStyle = mistColor + mistAlpha + ")";
        ctx.beginPath();
        ctx.ellipse(mx, my, mw, mh, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // === SAHARA SANDS DETAILS === (Enhanced Desert Environment)

    // Isometric 3D sand dune with depth
    const drawSandDune = (dx: number, dyPct: number, width: number, heightPx: number, colorLight: string, colorMid: string, colorDark: string) => {
      const dy = getY(dyPct);
      const isoDepth = heightPx * 0.4; // Isometric depth for 3D effect

      // Shadow underneath
      ctx.fillStyle = "rgba(80, 60, 40, 0.2)";
      ctx.beginPath();
      ctx.ellipse(dx + width * 0.1, dy + isoDepth * 0.3, width * 0.55, isoDepth * 0.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Back face (darker, shadowed side)
      ctx.fillStyle = colorDark;
      ctx.beginPath();
      ctx.moveTo(dx + width * 0.1, dy - heightPx); // Peak (offset for isometric)
      ctx.quadraticCurveTo(dx + width * 0.4, dy - heightPx * 0.5, dx + width * 0.5, dy);
      ctx.lineTo(dx + width * 0.5, dy + isoDepth * 0.3);
      ctx.quadraticCurveTo(dx + width * 0.3, dy + isoDepth * 0.5, dx + width * 0.1, dy + isoDepth * 0.3);
      ctx.lineTo(dx + width * 0.1, dy - heightPx);
      ctx.closePath();
      ctx.fill();

      // Front face (lit side) with gradient
      const duneGrad = ctx.createLinearGradient(dx - width * 0.4, dy - heightPx, dx + width * 0.2, dy + isoDepth);
      duneGrad.addColorStop(0, colorLight);
      duneGrad.addColorStop(0.5, colorMid);
      duneGrad.addColorStop(1, colorDark);
      ctx.fillStyle = duneGrad;
      ctx.beginPath();
      ctx.moveTo(dx + width * 0.1, dy - heightPx); // Peak
      ctx.quadraticCurveTo(dx - width * 0.2, dy - heightPx * 0.6, dx - width * 0.4, dy);
      ctx.lineTo(dx - width * 0.4, dy + isoDepth * 0.3);
      ctx.quadraticCurveTo(dx - width * 0.1, dy + isoDepth * 0.5, dx + width * 0.1, dy + isoDepth * 0.3);
      ctx.lineTo(dx + width * 0.1, dy - heightPx);
      ctx.closePath();
      ctx.fill();

      // Top ridge highlight
      ctx.strokeStyle = `rgba(255, 248, 220, ${0.4 + Math.sin(time * 0.5 + dx * 0.01) * 0.15})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(dx - width * 0.15, dy - heightPx * 0.7);
      ctx.quadraticCurveTo(dx, dy - heightPx + 1, dx + width * 0.2, dy - heightPx * 0.6);
      ctx.stroke();

      // Wind ripples on front face
      ctx.strokeStyle = `rgba(180, 150, 100, 0.2)`;
      ctx.lineWidth = 0.5;
      for (let r = 0; r < 3; r++) {
        const rippleY = dy - heightPx * 0.3 + r * (heightPx * 0.2);
        ctx.beginPath();
        ctx.moveTo(dx - width * 0.3 + r * 3, rippleY);
        ctx.quadraticCurveTo(dx - width * 0.1, rippleY - 2, dx + width * 0.05, rippleY + 1);
        ctx.stroke();
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

    // Majestic Golden Pyramid with hieroglyphics
    const drawGoldenPyramid = (px: number, pyPct: number, size: number) => {
      const py = getY(pyPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(px + size * 0.3, py + 8, size * 1.2, size * 0.3, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Pyramid body with gradient
      const pyrGrad = ctx.createLinearGradient(px - size, py, px + size * 0.5, py - size * 1.5);
      pyrGrad.addColorStop(0, "#8b7355");
      pyrGrad.addColorStop(0.3, "#c9a86c");
      pyrGrad.addColorStop(0.5, "#e8d4a0");
      pyrGrad.addColorStop(0.7, "#c9a86c");
      pyrGrad.addColorStop(1, "#8b7355");
      ctx.fillStyle = pyrGrad;
      ctx.beginPath();
      ctx.moveTo(px, py - size * 1.5);
      ctx.lineTo(px + size, py + 5);
      ctx.lineTo(px - size, py + 5);
      ctx.closePath();
      ctx.fill();
      // Golden capstone
      ctx.fillStyle = `rgba(255, 215, 0, ${0.7 + Math.sin(time * 2) * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(px, py - size * 1.5);
      ctx.lineTo(px + size * 0.15, py - size * 1.25);
      ctx.lineTo(px - size * 0.15, py - size * 1.25);
      ctx.closePath();
      ctx.fill();

      // Stone block lines
      ctx.strokeStyle = "rgba(90, 74, 58, 0.3)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        const lineY = py + 5 - i * (size * 0.25);
        const lineHalfWidth = size * (1 - i * 0.16);
        ctx.beginPath();
        ctx.moveTo(px - lineHalfWidth, lineY);
        ctx.lineTo(px + lineHalfWidth, lineY);
        ctx.stroke();
      }
    };
    drawGoldenPyramid(770, 66, 27);
    drawGoldenPyramid(820, 70, 27);
    drawGoldenPyramid(860, 65, 27);
    drawGoldenPyramid(850, 50, 25);
    drawGoldenPyramid(950, 23, 17);

    drawGoldenPyramid(970, 85, 20);


    drawGoldenPyramid(960, 35, 28);

    // Sphinx statue
    const drawSphinx = (sx: number, syPct: number, scale: number) => {
      const sy = getY(syPct);
      // Body shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(sx + 5 * scale, sy + 8 * scale, 25 * scale, 6 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lion body
      const bodyGrad = ctx.createLinearGradient(sx - 20 * scale, sy, sx + 20 * scale, sy);
      bodyGrad.addColorStop(0, "#a08060");
      bodyGrad.addColorStop(0.5, "#c8a878");
      bodyGrad.addColorStop(1, "#a08060");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 22 * scale, 10 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Paws
      ctx.fillStyle = "#b89868";
      ctx.beginPath();
      ctx.ellipse(sx + 18 * scale, sy + 4 * scale, 8 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Human head
      const headGrad = ctx.createRadialGradient(sx - 15 * scale, sy - 10 * scale, 0, sx - 15 * scale, sy - 10 * scale, 12 * scale);
      headGrad.addColorStop(0, "#d8b888");
      headGrad.addColorStop(1, "#a08060");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(sx - 15 * scale, sy - 8 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Headdress (Nemes)
      ctx.fillStyle = "#c9a050";
      ctx.beginPath();
      ctx.moveTo(sx - 24 * scale, sy - 4 * scale);
      ctx.lineTo(sx - 18 * scale, sy - 18 * scale);
      ctx.lineTo(sx - 8 * scale, sy - 18 * scale);
      ctx.lineTo(sx - 6 * scale, sy - 4 * scale);
      ctx.closePath();
      ctx.fill();
      // Face details
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.arc(sx - 17 * scale, sy - 10 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.arc(sx - 12 * scale, sy - 10 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawSphinx(920, 68, 0.8);

    // Palm tree oasis
    const drawPalmTree = (tx: number, tyPct: number, scale: number) => {
      const ty = getY(tyPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(tx + 8 * scale, ty + 4 * scale, 15 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Curved trunk
      const trunkGrad = ctx.createLinearGradient(tx - 4 * scale, ty, tx + 4 * scale, ty);
      trunkGrad.addColorStop(0, "#5a4020");
      trunkGrad.addColorStop(0.5, "#8a6840");
      trunkGrad.addColorStop(1, "#5a4020");
      ctx.strokeStyle = trunkGrad;
      ctx.lineWidth = 6 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + 8 * scale, ty - 20 * scale, tx + 4 * scale, ty - 40 * scale);
      ctx.stroke();
      // Trunk rings
      ctx.strokeStyle = "#4a3015";
      ctx.lineWidth = 1;
      for (let r = 0; r < 6; r++) {
        const ringY = ty - 5 * scale - r * 6 * scale;
        ctx.beginPath();
        ctx.arc(tx + 2 * scale + r * scale * 0.5, ringY, 3 * scale, 0, Math.PI);
        ctx.stroke();
      }
      // Palm fronds
      const frondColors = ["#1d6b2c", "#2d8b3c", "#1d6b2c", "#2d8b3c", "#1d6b2c"];
      const frondAngles = [-0.8, -0.3, 0.2, 0.7, 1.1];
      frondAngles.forEach((angle, i) => {
        ctx.save();
        ctx.translate(tx + 4 * scale, ty - 40 * scale);
        ctx.rotate(angle + Math.sin(time * 1.5 + i) * 0.05);
        ctx.fillStyle = frondColors[i];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(15 * scale, -8 * scale, 30 * scale, 5 * scale);
        ctx.quadraticCurveTo(15 * scale, -2 * scale, 0, 0);
        ctx.fill();
        // Frond details
        ctx.strokeStyle = "#0d4b1c";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(2 * scale, 0);
        ctx.quadraticCurveTo(15 * scale, -5 * scale, 28 * scale, 3 * scale);
        ctx.stroke();
        ctx.restore();
      });
      // Coconuts
      ctx.fillStyle = "#5a4030";
      ctx.beginPath();
      ctx.arc(tx + 3 * scale, ty - 38 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.arc(tx + 7 * scale, ty - 37 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    };

    // Oasis water pool
    const drawOasis = (ox: number, oyPct: number, size: number) => {
      const oy = getY(oyPct);
      // Water with shimmer
      const waterGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);
      waterGrad.addColorStop(0, `rgba(64, 164, 200, ${0.7 + Math.sin(time * 2) * 0.1})`);
      waterGrad.addColorStop(0.7, `rgba(40, 120, 160, ${0.8 + Math.sin(time * 2.5) * 0.1})`);
      waterGrad.addColorStop(1, "rgba(30, 90, 120, 0.6)");
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.ellipse(ox, oy, size, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Water sparkles
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(time * 4) * 0.2})`;
      for (let s = 0; s < 4; s++) {
        const sparkX = ox - size * 0.5 + seededRandom(ox + s) * size;
        const sparkY = oy - size * 0.1 + seededRandom(ox + s + 10) * size * 0.2;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Grass border
      ctx.fillStyle = "#4a8a3a";
      for (let g = 0; g < 12; g++) {
        const gAngle = (g / 12) * Math.PI * 2;
        const gx = ox + Math.cos(gAngle) * size * 1.1;
        const gy = oy + Math.sin(gAngle) * size * 0.45;
        ctx.beginPath();
        ctx.moveTo(gx - 2, gy + 2);
        ctx.lineTo(gx, gy - 6 - Math.sin(time * 3 + g) * 2);
        ctx.lineTo(gx + 2, gy + 2);
        ctx.fill();
      }
    };
    drawOasis(780, 42, 25);
    drawPalmTree(765, 40, 0.7);
    drawPalmTree(795, 44, 0.6);
    drawPalmTree(778, 38, 0.8);

    // Detailed cactus with flowers
    const drawDesertCactus = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(x + 3 * scale, y + 3 * scale, 8 * scale, 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Main stem with gradient
      const cactusGrad = ctx.createLinearGradient(x - 5 * scale, y, x + 5 * scale, y);
      cactusGrad.addColorStop(0, "#1a5a2a");
      cactusGrad.addColorStop(0.3, "#3a8a4a");
      cactusGrad.addColorStop(0.7, "#2a7a3a");
      cactusGrad.addColorStop(1, "#1a5a2a");
      ctx.fillStyle = cactusGrad;
      // Main body
      ctx.beginPath();
      ctx.moveTo(x - 5 * scale, y);
      ctx.quadraticCurveTo(x - 6 * scale, y - 15 * scale, x - 4 * scale, y - 30 * scale);
      ctx.quadraticCurveTo(x, y - 33 * scale, x + 4 * scale, y - 30 * scale);
      ctx.quadraticCurveTo(x + 6 * scale, y - 15 * scale, x + 5 * scale, y);
      ctx.closePath();
      ctx.fill();
      // Left arm
      ctx.beginPath();
      ctx.moveTo(x - 4 * scale, y - 18 * scale);
      ctx.quadraticCurveTo(x - 14 * scale, y - 18 * scale, x - 14 * scale, y - 26 * scale);
      ctx.quadraticCurveTo(x - 14 * scale, y - 30 * scale, x - 10 * scale, y - 30 * scale);
      ctx.quadraticCurveTo(x - 8 * scale, y - 26 * scale, x - 4 * scale, y - 22 * scale);
      ctx.fill();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(x + 4 * scale, y - 12 * scale);
      ctx.quadraticCurveTo(x + 12 * scale, y - 12 * scale, x + 12 * scale, y - 20 * scale);
      ctx.quadraticCurveTo(x + 12 * scale, y - 24 * scale, x + 8 * scale, y - 24 * scale);
      ctx.quadraticCurveTo(x + 6 * scale, y - 18 * scale, x + 4 * scale, y - 16 * scale);
      ctx.fill();
      // Ridges
      ctx.strokeStyle = "#1a4a1a";
      ctx.lineWidth = 0.5;
      for (let r = -2; r <= 2; r++) {
        ctx.beginPath();
        ctx.moveTo(x + r * 1.5 * scale, y - 2 * scale);
        ctx.lineTo(x + r * 1.2 * scale, y - 28 * scale);
        ctx.stroke();
      }
      // Pink flower on top
      ctx.fillStyle = "#ff6b9d";
      ctx.beginPath();
      ctx.arc(x, y - 32 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffb6c1";
      ctx.beginPath();
      ctx.arc(x, y - 32 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    [
      [840, 60], [890, 25], [950, 75], [1000, 40], [1040, 65], [1060, 30],
    ].forEach(([x, yPct], i) => {
      drawDesertCactus(x, yPct, 0.6 + seededRandom(i + 200) * 0.3);
    });

    // Camel caravan
    const drawCamel = (cx: number, cyPct: number, scale: number, facing: number) => {
      const cy = getY(cyPct);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(facing, 1);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 8 * scale, 18 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Body
      const camelGrad = ctx.createLinearGradient(-15 * scale, -10 * scale, 15 * scale, 10 * scale);
      camelGrad.addColorStop(0, "#c4a070");
      camelGrad.addColorStop(0.5, "#d8b888");
      camelGrad.addColorStop(1, "#b89060");
      ctx.fillStyle = camelGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16 * scale, 10 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hump
      ctx.beginPath();
      ctx.arc(-2 * scale, -12 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Neck
      ctx.beginPath();
      ctx.moveTo(12 * scale, -4 * scale);
      ctx.quadraticCurveTo(20 * scale, -10 * scale, 18 * scale, -22 * scale);
      ctx.quadraticCurveTo(16 * scale, -10 * scale, 10 * scale, -2 * scale);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.ellipse(18 * scale, -24 * scale, 6 * scale, 4 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Legs
      ctx.fillStyle = "#a88050";
      ctx.fillRect(-10 * scale, 6 * scale, 3 * scale, 12 * scale);
      ctx.fillRect(-4 * scale, 6 * scale, 3 * scale, 12 * scale);
      ctx.fillRect(4 * scale, 6 * scale, 3 * scale, 12 * scale);
      ctx.fillRect(10 * scale, 6 * scale, 3 * scale, 12 * scale);
      // Eye
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.arc(20 * scale, -25 * scale, 1 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawCamel(880, 72, 0.6, 1);
    drawCamel(905, 74, 0.55, 1);
    drawCamel(1010, 50, 0.65, -1);

    // Desert camp with ornate tent
    const drawDesertCamp = (cx: number, cyPct: number) => {
      const cy = getY(cyPct);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tent base with gradient
      const tentGrad = ctx.createLinearGradient(cx - 22, cy - 20, cx + 22, cy + 5);
      tentGrad.addColorStop(0, "#f5e6c8");
      tentGrad.addColorStop(0.5, "#e8d4b0");
      tentGrad.addColorStop(1, "#c8b090");
      ctx.fillStyle = tentGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.lineTo(cx + 24, cy + 5);
      ctx.lineTo(cx - 24, cy + 5);
      ctx.closePath();
      ctx.fill();
      // Tent stripes
      ctx.fillStyle = "#b8432f";
      for (let s = 0; s < 3; s++) {
        const stripeY = cy - 15 + s * 8;
        ctx.beginPath();
        ctx.moveTo(cx - 18 + s * 6, stripeY);
        ctx.lineTo(cx - 15 + s * 6, stripeY + 3);
        ctx.lineTo(cx + 15 - s * 6, stripeY + 3);
        ctx.lineTo(cx + 18 - s * 6, stripeY);
        ctx.fill();
      }
      // Tent opening
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 5);
      ctx.lineTo(cx, cy - 8);
      ctx.lineTo(cx + 5, cy + 5);
      ctx.closePath();
      ctx.fill();
      // Golden finial
      ctx.fillStyle = `rgba(255, 200, 50, ${0.8 + Math.sin(time * 3) * 0.2})`;
      ctx.beginPath();
      ctx.arc(cx, cy - 24, 3, 0, Math.PI * 2);
      ctx.fill();
      // Campfire with animated flames
      const fireX = cx + 30;
      const fireY = cy;
      // Fire pit
      ctx.fillStyle = "#3a3030";
      ctx.beginPath();
      ctx.ellipse(fireX, fireY + 3, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Animated flames
      for (let f = 0; f < 5; f++) {
        const fh = 12 + Math.sin(time * 8 + f * 1.3) * 5;
        const fw = 3 + Math.sin(time * 6 + f * 0.7) * 1;
        const fx = fireX - 6 + f * 3;
        ctx.fillStyle = `rgba(255, ${100 + f * 30}, 20, ${0.8 - f * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(fx - fw, fireY);
        ctx.quadraticCurveTo(fx, fireY - fh, fx + fw, fireY);
        ctx.fill();
      }
      // Fire glow
      const glowGrad = ctx.createRadialGradient(fireX, fireY - 5, 0, fireX, fireY - 5, 20);
      glowGrad.addColorStop(0, "rgba(255, 150, 50, 0.3)");
      glowGrad.addColorStop(1, "rgba(255, 100, 20, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(fireX, fireY - 5, 20, 0, Math.PI * 2);
      ctx.fill();
    };
    drawDesertCamp(820, 22);
    drawDesertCamp(1030, 58);

    // Swirling sand/dust particles
    ctx.fillStyle = "rgba(210, 180, 140, 0.3)";
    for (let p = 0; p < 25; p++) {
      const px = 720 + seededRandom(p * 23) * 360;
      const py = height * 0.3 + seededRandom(p * 31) * height * 0.5;
      const drift = Math.sin(time * 2 + p * 0.5) * 15;
      ctx.beginPath();
      ctx.arc(px + drift, py, 1 + seededRandom(p) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heat shimmer effect at horizon
    ctx.save();
    ctx.globalAlpha = 0.05 + Math.sin(time * 3) * 0.02;
    for (let h = 0; h < 5; h++) {
      const shimmerY = getY(15 + h * 5);
      ctx.fillStyle = "#fff8dc";
      ctx.beginPath();
      for (let sx = 720; sx < 1080; sx += 8) {
        const shimmerOffset = Math.sin(time * 4 + sx * 0.05 + h) * 3;
        if (sx === 720) ctx.moveTo(sx, shimmerY + shimmerOffset);
        else ctx.lineTo(sx, shimmerY + shimmerOffset);
      }
      ctx.lineTo(1080, shimmerY + 8);
      ctx.lineTo(720, shimmerY + 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Burning wreckage
    const drawBurningWreck = (wx: number, wyPct: number) => {
      const wy = getY(wyPct);
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(wx - 12, wy - 5, 24, 10);
      ctx.fillRect(wx - 8, wy - 10, 16, 5);
      // Flames
      for (let i = 0; i < 3; i++) {
        const fx = wx - 6 + i * 6;
        const fh = 10 + Math.sin(time * 7 + i * 2) * 4;
        ctx.fillStyle = `rgba(255, ${100 + i * 30}, 0, ${0.7 + Math.sin(time * 5 + i) * 0.2
          })`;
        ctx.beginPath();
        ctx.moveTo(fx - 3, wy - 10);
        ctx.quadraticCurveTo(fx, wy - 10 - fh, fx + 3, wy - 10);
        ctx.fill();
      }
    };
    drawBurningWreck(810, 25);
    drawBurningWreck(960, 75);
    drawBurningWreck(990, 20);
    drawBurningWreck(1520, 32);
    drawBurningWreck(1650, 62);

    // === FROZEN FRONTIER DETAILS === (Enhanced Winter Environment)

    // Aurora Borealis effect at the top
    ctx.save();
    for (let a = 0; a < 4; a++) {
      const auroraY = 15 + a * 12;
      const auroraGrad = ctx.createLinearGradient(1080, 0, 1440, 0);
      const hueShift = (time * 20 + a * 30) % 360;
      auroraGrad.addColorStop(0, `hsla(${120 + hueShift * 0.2}, 80%, 60%, 0)`);
      auroraGrad.addColorStop(0.3, `hsla(${150 + hueShift * 0.3}, 70%, 55%, ${0.15 + Math.sin(time * 0.8 + a) * 0.05})`);
      auroraGrad.addColorStop(0.5, `hsla(${180 + hueShift * 0.2}, 75%, 60%, ${0.2 + Math.sin(time * 1.2 + a * 0.5) * 0.08})`);
      auroraGrad.addColorStop(0.7, `hsla(${200 + hueShift * 0.3}, 70%, 55%, ${0.15 + Math.sin(time * 0.9 + a * 0.3) * 0.05})`);
      auroraGrad.addColorStop(1, `hsla(${220 + hueShift * 0.2}, 80%, 60%, 0)`);
      ctx.fillStyle = auroraGrad;
      ctx.beginPath();
      ctx.moveTo(1080, auroraY);
      for (let ax = 1080; ax <= 1440; ax += 20) {
        const waveY = auroraY + Math.sin(time * 0.5 + ax * 0.02 + a * 0.5) * 8;
        ctx.lineTo(ax, waveY);
      }
      ctx.lineTo(1440, auroraY + 25);
      ctx.lineTo(1080, auroraY + 25);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Snow-covered mountains in background
    const drawSnowMountain = (mx: number, myPct: number, width: number, heightPx: number) => {
      const my = getY(myPct);
      const isoDepth = heightPx * 0.35; // Isometric depth

      // Shadow underneath
      ctx.fillStyle = "rgba(40, 60, 80, 0.25)";
      ctx.beginPath();
      ctx.ellipse(mx + width * 0.08, my + isoDepth * 0.4, width * 0.5, isoDepth * 0.4, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Back face (shadowed right side)
      const backGrad = ctx.createLinearGradient(mx, my - heightPx, mx + width * 0.5, my);
      backGrad.addColorStop(0, "#8a9aaa");
      backGrad.addColorStop(0.5, "#6a7a8a");
      backGrad.addColorStop(1, "#5a6a7a");
      ctx.fillStyle = backGrad;
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx); // Peak (offset for isometric)
      ctx.lineTo(mx + width * 0.45, my);
      ctx.lineTo(mx + width * 0.45, my + isoDepth * 0.4);
      ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
      ctx.closePath();
      ctx.fill();

      // Front face (lit left side) with gradient
      const mtGrad = ctx.createLinearGradient(mx - width * 0.4, my - heightPx, mx + width * 0.1, my + isoDepth);
      mtGrad.addColorStop(0, "#f0f8ff");
      mtGrad.addColorStop(0.25, "#e0eef8");
      mtGrad.addColorStop(0.5, "#c0d8e8");
      mtGrad.addColorStop(0.75, "#9aacbc");
      mtGrad.addColorStop(1, "#7a8a9a");
      ctx.fillStyle = mtGrad;
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx); // Peak
      ctx.lineTo(mx - width * 0.4, my);
      ctx.lineTo(mx - width * 0.4, my + isoDepth * 0.4);
      ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
      ctx.closePath();
      ctx.fill();

      // Isometric base edge
      ctx.fillStyle = "#6a7a8a";
      ctx.beginPath();
      ctx.moveTo(mx - width * 0.4, my + isoDepth * 0.4);
      ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
      ctx.lineTo(mx + width * 0.45, my + isoDepth * 0.4);
      ctx.quadraticCurveTo(mx + width * 0.1, my + isoDepth * 0.55, mx - width * 0.4, my + isoDepth * 0.4);
      ctx.fill();

      // Snow cap with 3D effect
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx);
      ctx.lineTo(mx + width * 0.18, my - heightPx * 0.65);
      ctx.lineTo(mx + width * 0.05, my - heightPx * 0.6);
      ctx.lineTo(mx - width * 0.1, my - heightPx * 0.68);
      ctx.closePath();
      ctx.fill();

      // Snow highlight on front face
      ctx.fillStyle = "#e8f4fc";
      ctx.beginPath();
      ctx.moveTo(mx + width * 0.05, my - heightPx);
      ctx.lineTo(mx - width * 0.15, my - heightPx * 0.6);
      ctx.lineTo(mx - width * 0.08, my - heightPx * 0.55);
      ctx.lineTo(mx - width * 0.2, my - heightPx * 0.4);
      ctx.lineTo(mx - width * 0.12, my - heightPx * 0.35);
      ctx.lineTo(mx + width * 0.02, my - heightPx * 0.55);
      ctx.closePath();
      ctx.fill();

      // Rocky texture lines on front face
      ctx.strokeStyle = "rgba(90, 100, 110, 0.3)";
      ctx.lineWidth = 0.5;
      for (let r = 0; r < 3; r++) {
        const lineY = my - heightPx * (0.25 + r * 0.12);
        ctx.beginPath();
        ctx.moveTo(mx - width * 0.35 + r * 5, lineY);
        ctx.lineTo(mx - width * 0.1 + r * 3, lineY - heightPx * 0.08);
        ctx.stroke();
      }
    };
    drawSnowMountain(1130, 30, 35, 16);
    drawSnowMountain(1250, 25, 45, 20);
    drawSnowMountain(1350, 26, 48, 28);
    drawSnowMountain(1380, 28, 48, 28);

    drawSnowMountain(1310, 80, 68, 38);
    drawSnowMountain(1350, 82, 68, 38);

    // Detailed snow-covered pine trees
    const drawFrostedPine = (x: number, yPct: number, scale: number) => {
      const y = getY(yPct);
      // Shadow
      ctx.fillStyle = "rgba(40, 60, 80, 0.2)";
      ctx.beginPath();
      ctx.ellipse(x + 4 * scale, y + 4 * scale, 12 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      const trunkGrad = ctx.createLinearGradient(x - 3 * scale, y, x + 3 * scale, y);
      trunkGrad.addColorStop(0, "#3a2820");
      trunkGrad.addColorStop(0.5, "#5a4838");
      trunkGrad.addColorStop(1, "#3a2820");
      ctx.fillStyle = trunkGrad;
      ctx.fillRect(x - 3 * scale, y - 6 * scale, 6 * scale, 14 * scale);
      // Tree layers (3 tiers)
      const tiers = [
        { y: -8, w: 16, h: 18 },
        { y: -20, w: 13, h: 16 },
        { y: -30, w: 9, h: 14 },
      ];
      tiers.forEach((tier) => {
        // Green foliage
        const treeGrad = ctx.createLinearGradient(x, y + tier.y * scale - tier.h * scale, x, y + tier.y * scale);
        treeGrad.addColorStop(0, "#1a4a3a");
        treeGrad.addColorStop(1, "#2a5a4a");
        ctx.fillStyle = treeGrad;
        ctx.beginPath();
        ctx.moveTo(x, y + tier.y * scale - tier.h * scale);
        ctx.lineTo(x + tier.w * scale, y + tier.y * scale);
        ctx.lineTo(x - tier.w * scale, y + tier.y * scale);
        ctx.closePath();
        ctx.fill();
        // Snow on branches
        ctx.fillStyle = "#f0f8ff";
        ctx.beginPath();
        ctx.moveTo(x, y + tier.y * scale - tier.h * scale);
        ctx.lineTo(x + tier.w * 0.7 * scale, y + tier.y * scale - tier.h * 0.3 * scale);
        ctx.quadraticCurveTo(x + tier.w * 0.4 * scale, y + tier.y * scale - tier.h * 0.4 * scale, x, y + tier.y * scale - tier.h * 0.6 * scale);
        ctx.quadraticCurveTo(x - tier.w * 0.4 * scale, y + tier.y * scale - tier.h * 0.4 * scale, x - tier.w * 0.7 * scale, y + tier.y * scale - tier.h * 0.3 * scale);
        ctx.closePath();
        ctx.fill();
      });
      // Snow pile at base
      ctx.fillStyle = "#e8f0f8";
      ctx.beginPath();
      ctx.ellipse(x, y + 2 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    [
      [1095, 72], [1115, 55], [1140, 78], [1165, 42], [1185, 68],
      [1220, 75], [1255, 38], [1280, 62], [1305, 48], [1325, 72],
      [1355, 35], [1375, 58], [1400, 45], [1420, 68],
    ].forEach(([x, yPct], i) => {
      drawFrostedPine(x, yPct, 0.6 + seededRandom(i + 300) * 0.25);
    });

    // Ice crystal formations
    const drawIceCrystal = (cx: number, cyPct: number, scale: number) => {
      const cy = getY(cyPct);
      // Crystal glow
      const glowGrad = ctx.createRadialGradient(cx, cy - 15 * scale, 0, cx, cy - 15 * scale, 25 * scale);
      glowGrad.addColorStop(0, `rgba(150, 220, 255, ${0.2 + Math.sin(time * 2 + cx) * 0.1})`);
      glowGrad.addColorStop(1, "rgba(150, 220, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 15 * scale, 25 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Main crystal spire
      const crystalGrad = ctx.createLinearGradient(cx - 8 * scale, cy, cx + 8 * scale, cy - 35 * scale);
      crystalGrad.addColorStop(0, "rgba(180, 220, 255, 0.9)");
      crystalGrad.addColorStop(0.5, "rgba(220, 240, 255, 0.95)");
      crystalGrad.addColorStop(1, "rgba(255, 255, 255, 1)");
      ctx.fillStyle = crystalGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 35 * scale);
      ctx.lineTo(cx + 6 * scale, cy - 10 * scale);
      ctx.lineTo(cx + 4 * scale, cy + 2 * scale);
      ctx.lineTo(cx - 4 * scale, cy + 2 * scale);
      ctx.lineTo(cx - 6 * scale, cy - 10 * scale);
      ctx.closePath();
      ctx.fill();
      // Side crystals
      ctx.fillStyle = "rgba(200, 230, 255, 0.8)";
      ctx.beginPath();
      ctx.moveTo(cx - 4 * scale, cy - 8 * scale);
      ctx.lineTo(cx - 15 * scale, cy - 20 * scale);
      ctx.lineTo(cx - 6 * scale, cy - 5 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 4 * scale, cy - 12 * scale);
      ctx.lineTo(cx + 12 * scale, cy - 25 * scale);
      ctx.lineTo(cx + 6 * scale, cy - 8 * scale);
      ctx.closePath();
      ctx.fill();
      // Sparkle
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 4 + cx) * 0.4})`;
      ctx.beginPath();
      ctx.arc(cx, cy - 30 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawIceCrystal(1120, 62, 0.8);
    drawIceCrystal(1270, 48, 1);
    drawIceCrystal(1350, 72, 0.7);
    drawIceCrystal(1410, 38, 0.9);

    // Frozen lake with reflection
    const drawFrozenLake = (lx: number, lyPct: number, width: number, heightRatio: number) => {
      const ly = getY(lyPct);
      // Ice surface
      const iceGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, width);
      iceGrad.addColorStop(0, "rgba(200, 230, 255, 0.7)");
      iceGrad.addColorStop(0.5, "rgba(170, 210, 240, 0.8)");
      iceGrad.addColorStop(1, "rgba(140, 180, 220, 0.6)");
      ctx.fillStyle = iceGrad;
      ctx.beginPath();
      ctx.ellipse(lx, ly, width, width * heightRatio, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ice cracks
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      for (let c = 0; c < 5; c++) {
        const startAngle = seededRandom(lx + c) * Math.PI * 2;
        const crackLen = 15 + seededRandom(lx + c + 10) * 20;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(
          lx + Math.cos(startAngle) * crackLen,
          ly + Math.sin(startAngle) * crackLen * heightRatio
        );
        ctx.stroke();
      }
      // Shimmer spots
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 3) * 0.2})`;
      for (let s = 0; s < 3; s++) {
        const sx = lx - width * 0.4 + seededRandom(lx + s * 7) * width * 0.8;
        const sy = ly - width * heightRatio * 0.3 + seededRandom(lx + s * 11) * width * heightRatio * 0.6;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawFrozenLake(1200, 82, 45, 0.35);
    drawFrozenLake(1340, 58, 35, 0.3);

    // Igloo
    const drawIgloo = (ix: number, iyPct: number, scale: number) => {
      const iy = getY(iyPct);
      // Shadow
      ctx.fillStyle = "rgba(60, 80, 100, 0.2)";
      ctx.beginPath();
      ctx.ellipse(ix + 3 * scale, iy + 5 * scale, 22 * scale, 7 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dome
      const domeGrad = ctx.createRadialGradient(ix - 5 * scale, iy - 10 * scale, 0, ix, iy, 20 * scale);
      domeGrad.addColorStop(0, "#ffffff");
      domeGrad.addColorStop(0.5, "#e8f4fc");
      domeGrad.addColorStop(1, "#c8d8e8");
      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.arc(ix, iy - 2 * scale, 18 * scale, Math.PI, 0);
      ctx.lineTo(ix + 18 * scale, iy + 2 * scale);
      ctx.lineTo(ix - 18 * scale, iy + 2 * scale);
      ctx.closePath();
      ctx.fill();
      // Ice block lines
      ctx.strokeStyle = "rgba(150, 180, 200, 0.4)";
      ctx.lineWidth = 1;
      for (let row = 0; row < 3; row++) {
        const rowRadius = 18 * scale * Math.cos(row * 0.3);
        ctx.beginPath();
        ctx.arc(ix, iy - 2 * scale, rowRadius, Math.PI, 0);
        ctx.stroke();
      }
      // Entrance tunnel
      ctx.fillStyle = "#2a3a4a";
      ctx.beginPath();
      ctx.ellipse(ix + 18 * scale, iy - 2 * scale, 6 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d8e8f0";
      ctx.beginPath();
      ctx.arc(ix + 18 * scale, iy - 2 * scale, 6 * scale, Math.PI, 0);
      ctx.lineTo(ix + 26 * scale, iy + 2 * scale);
      ctx.lineTo(ix + 10 * scale, iy + 2 * scale);
      ctx.closePath();
      ctx.fill();
    };
    drawIgloo(1160, 50, 0.8);
    drawIgloo(1390, 75, 0.7);

    // Woolly mammoth
    const drawMammoth = (mx: number, myPct: number, scale: number, facing: number) => {
      const my = getY(myPct);
      ctx.save();
      ctx.translate(mx, my);
      ctx.scale(facing, 1);
      // Shadow
      ctx.fillStyle = "rgba(40, 60, 80, 0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 10 * scale, 25 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Body fur
      const furGrad = ctx.createLinearGradient(-20 * scale, -15 * scale, 20 * scale, 10 * scale);
      furGrad.addColorStop(0, "#5a4030");
      furGrad.addColorStop(0.5, "#6a5040");
      furGrad.addColorStop(1, "#4a3020");
      ctx.fillStyle = furGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22 * scale, 14 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fur texture
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 1;
      for (let f = 0; f < 8; f++) {
        const fx = -15 * scale + f * 4 * scale;
        ctx.beginPath();
        ctx.moveTo(fx, -8 * scale);
        ctx.quadraticCurveTo(fx + 2 * scale, 5 * scale, fx, 12 * scale);
        ctx.stroke();
      }
      // Head
      ctx.fillStyle = "#5a4030";
      ctx.beginPath();
      ctx.ellipse(18 * scale, -5 * scale, 12 * scale, 10 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      ctx.fillStyle = "#4a3020";
      ctx.beginPath();
      ctx.moveTo(26 * scale, -2 * scale);
      ctx.quadraticCurveTo(35 * scale, 5 * scale, 30 * scale, 15 * scale);
      ctx.quadraticCurveTo(28 * scale, 18 * scale, 25 * scale, 15 * scale);
      ctx.quadraticCurveTo(28 * scale, 8 * scale, 24 * scale, 0);
      ctx.fill();
      // Tusks
      ctx.fillStyle = "#f8f0e8";
      ctx.beginPath();
      ctx.moveTo(22 * scale, 2 * scale);
      ctx.quadraticCurveTo(35 * scale, -5 * scale, 40 * scale, 5 * scale);
      ctx.quadraticCurveTo(38 * scale, 8 * scale, 35 * scale, 5 * scale);
      ctx.quadraticCurveTo(30 * scale, 0, 22 * scale, 4 * scale);
      ctx.fill();
      // Eye
      ctx.fillStyle = "#1a0a00";
      ctx.beginPath();
      ctx.arc(24 * scale, -8 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Legs
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(-12 * scale, 10 * scale, 6 * scale, 14 * scale);
      ctx.fillRect(-4 * scale, 10 * scale, 6 * scale, 14 * scale);
      ctx.fillRect(6 * scale, 10 * scale, 6 * scale, 14 * scale);
      ctx.fillRect(14 * scale, 10 * scale, 6 * scale, 14 * scale);
      // Snow on back
      ctx.fillStyle = "#f0f8ff";
      ctx.beginPath();
      ctx.ellipse(-2 * scale, -12 * scale, 15 * scale, 4 * scale, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawMammoth(1230, 65, 0.5, 1);
    drawMammoth(1300, 25, 0.4, -1);

    // Enhanced snowfall with depth
    for (let layer = 0; layer < 3; layer++) {
      const speed = 20 + layer * 15;
      const size = 1 + layer * 0.8;
      const opacity = 0.3 + layer * 0.15;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      for (let i = 0; i < 20; i++) {
        const sx = 1080 + seededRandom(i * 7 + layer * 100) * 360;
        const baseY = seededRandom(i * 11 + layer * 50) * height;
        const sy = (time * speed + baseY) % height;
        const drift = Math.sin(time * 2 + i * 0.3 + layer) * (3 + layer * 2);
        ctx.beginPath();
        ctx.arc(sx + drift, sy, size, 0, Math.PI * 2);
        ctx.fill();
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

    // Hellish sky gradient overlay
    ctx.save();
    const skyGrad = ctx.createLinearGradient(1440, 0, 1440, height * 0.4);
    skyGrad.addColorStop(0, `rgba(80, 20, 10, ${0.3 + Math.sin(time * 0.5) * 0.05})`);
    skyGrad.addColorStop(0.5, `rgba(120, 40, 20, ${0.2 + Math.sin(time * 0.7) * 0.05})`);
    skyGrad.addColorStop(1, "rgba(60, 15, 8, 0)");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(1440, 0, 380, height * 0.5);
    ctx.restore();

    // Massive volcano in background
    const drawVolcano = (vx: number, vyPct: number, width: number, heightPx: number) => {
      const vy = getY(vyPct);
      // Volcano body with gradient
      const volcGrad = ctx.createLinearGradient(vx, vy - heightPx, vx, vy + 10);
      volcGrad.addColorStop(0, "#3a2020");
      volcGrad.addColorStop(0.3, "#4a2828");
      volcGrad.addColorStop(0.6, "#2a1515");
      volcGrad.addColorStop(1, "#1a0a0a");
      ctx.fillStyle = volcGrad;
      ctx.beginPath();
      ctx.moveTo(vx - width / 2, vy + 10);
      ctx.lineTo(vx - width * 0.15, vy - heightPx);
      ctx.lineTo(vx + width * 0.15, vy - heightPx);
      ctx.lineTo(vx + width / 2, vy + 10);
      ctx.closePath();
      ctx.fill();
      // Crater
      ctx.fillStyle = "#1a0808";
      ctx.beginPath();
      ctx.ellipse(vx, vy - heightPx + 5, width * 0.18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lava glow in crater
      const craterGlow = ctx.createRadialGradient(vx, vy - heightPx + 5, 0, vx, vy - heightPx + 5, width * 0.2);
      craterGlow.addColorStop(0, `rgba(255, 150, 50, ${0.6 + Math.sin(time * 3) * 0.2})`);
      craterGlow.addColorStop(0.5, `rgba(255, 80, 20, ${0.4 + Math.sin(time * 2.5) * 0.15})`);
      craterGlow.addColorStop(1, "rgba(200, 50, 10, 0)");
      ctx.fillStyle = craterGlow;
      ctx.beginPath();
      ctx.arc(vx, vy - heightPx + 5, width * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Lava streaks down the side
      ctx.strokeStyle = `rgba(255, 100, 30, ${0.5 + Math.sin(time * 2) * 0.2})`;
      ctx.lineWidth = 3;
      for (let streak = 0; streak < 4; streak++) {
        const startX = vx - width * 0.1 + streak * (width * 0.07);
        ctx.beginPath();
        ctx.moveTo(startX, vy - heightPx + 8);
        ctx.quadraticCurveTo(
          startX + (streak - 1.5) * 15,
          vy - heightPx * 0.5,
          startX + (streak - 1.5) * 25,
          vy
        );
        ctx.stroke();
      }
      // Smoke plumes from crater
      for (let s = 0; s < 5; s++) {
        const smokeTime = (time * 15 + s * 20) % 60;
        const smokeY = vy - heightPx - smokeTime;
        const smokeX = vx + Math.sin(time * 1.5 + s * 2) * (5 + smokeTime * 0.3);
        const smokeSize = 8 + smokeTime * 0.4;
        const smokeAlpha = Math.max(0, 0.4 - smokeTime / 80);
        ctx.fillStyle = `rgba(60, 50, 50, ${smokeAlpha})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawVolcano(1530, 22, 95, 35);
    drawVolcano(1700, 21, 85, 30);

    drawVolcano(1720, 24, 95, 45);

    drawVolcano(1720, 84, 95, 45);
    drawVolcano(1700, 86, 85, 30);

    // Lava pools with bubbling effect
    const drawLavaPool = (px: number, pyPct: number, width: number, heightRatio: number) => {
      const py = getY(pyPct);
      // Outer glow
      const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, width * 1.5);
      glowGrad.addColorStop(0, `rgba(255, 100, 30, ${0.25 + Math.sin(time * 2) * 0.1})`);
      glowGrad.addColorStop(0.5, `rgba(255, 60, 20, ${0.15 + Math.sin(time * 2.5) * 0.05})`);
      glowGrad.addColorStop(1, "rgba(200, 40, 10, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, width * 1.5, width * heightRatio * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pool edge (cooled lava)
      ctx.fillStyle = "#2a1a15";
      ctx.beginPath();
      ctx.ellipse(px, py, width + 4, width * heightRatio + 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Main lava surface
      const lavaGrad = ctx.createRadialGradient(px - width * 0.2, py - width * heightRatio * 0.2, 0, px, py, width);
      lavaGrad.addColorStop(0, "#ffcc44");
      lavaGrad.addColorStop(0.3, "#ff8822");
      lavaGrad.addColorStop(0.7, "#ee4411");
      lavaGrad.addColorStop(1, "#aa2200");
      ctx.fillStyle = lavaGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, width, width * heightRatio, 0, 0, Math.PI * 2);
      ctx.fill();
      // Bubbles
      for (let b = 0; b < 4; b++) {
        const bubblePhase = (time * 3 + b * 1.5 + px * 0.1) % 2;
        if (bubblePhase < 1.5) {
          const bx = px - width * 0.5 + seededRandom(px + b) * width;
          const by = py - width * heightRatio * 0.3 + seededRandom(px + b + 10) * width * heightRatio * 0.6;
          const bSize = 2 + bubblePhase * 2;
          ctx.fillStyle = `rgba(255, 200, 100, ${0.6 - bubblePhase * 0.3})`;
          ctx.beginPath();
          ctx.arc(bx, by, bSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Surface shimmer
      ctx.strokeStyle = `rgba(255, 220, 150, ${0.3 + Math.sin(time * 4) * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(px - width * 0.3, py - width * heightRatio * 0.2, width * 0.3, width * heightRatio * 0.2, 0.3, 0, Math.PI);
      ctx.stroke();
    };
    drawLavaPool(1500, 65, 30, 0.35);
    drawLavaPool(1620, 78, 25, 0.3);
    drawLavaPool(1700, 55, 35, 0.4);
    drawLavaPool(1760, 75, 28, 0.35);

    // Enhanced lava rivers with glow
    const drawLavaRiver = (points: number[][]) => {
      // Outer glow
      ctx.save();
      ctx.strokeStyle = `rgba(255, 100, 30, ${0.2 + Math.sin(time * 2) * 0.1})`;
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0][0], getY(points[0][1]));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], getY(points[i][1]));
      }
      ctx.stroke();
      // Main lava flow
      ctx.strokeStyle = `rgba(255, 80, 0, ${0.7 + Math.sin(time * 3) * 0.2})`;
      ctx.lineWidth = 8;
      ctx.stroke();
      // Hot center
      ctx.strokeStyle = `rgba(255, 200, 100, ${0.6 + Math.sin(time * 4) * 0.2})`;
      ctx.lineWidth = 3;
      ctx.stroke();
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

    // Obsidian spires with glowing cracks
    const drawObsidianSpire = (sx: number, syPct: number, scale: number) => {
      const sy = getY(syPct);
      // Shadow
      ctx.fillStyle = "rgba(20, 10, 10, 0.3)";
      ctx.beginPath();
      ctx.ellipse(sx + 5 * scale, sy + 4 * scale, 12 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Spire body
      const spireGrad = ctx.createLinearGradient(sx - 10 * scale, sy, sx + 10 * scale, sy - 40 * scale);
      spireGrad.addColorStop(0, "#1a1015");
      spireGrad.addColorStop(0.3, "#2a1a20");
      spireGrad.addColorStop(0.6, "#1a1015");
      spireGrad.addColorStop(1, "#0a0508");
      ctx.fillStyle = spireGrad;
      ctx.beginPath();
      ctx.moveTo(sx - 10 * scale, sy + 2 * scale);
      ctx.lineTo(sx - 6 * scale, sy - 25 * scale);
      ctx.lineTo(sx - 2 * scale, sy - 40 * scale);
      ctx.lineTo(sx + 3 * scale, sy - 35 * scale);
      ctx.lineTo(sx + 8 * scale, sy - 18 * scale);
      ctx.lineTo(sx + 10 * scale, sy + 2 * scale);
      ctx.closePath();
      ctx.fill();
      // Glass-like reflection
      ctx.fillStyle = "rgba(80, 60, 70, 0.3)";
      ctx.beginPath();
      ctx.moveTo(sx - 7 * scale, sy - 5 * scale);
      ctx.lineTo(sx - 4 * scale, sy - 30 * scale);
      ctx.lineTo(sx - 2 * scale, sy - 28 * scale);
      ctx.lineTo(sx - 5 * scale, sy - 5 * scale);
      ctx.closePath();
      ctx.fill();
      // Glowing magma cracks
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
    };
    [
      [1475, 48], [1530, 72], [1580, 35], [1640, 62],
      [1690, 42], [1740, 68], [1780, 38],
    ].forEach(([x, yPct], i) => {
      drawObsidianSpire(x, yPct, 0.7 + seededRandom(i + 400) * 0.4);
    });

    // Demon statue/idol
    const drawDemonStatue = (dx: number, dyPct: number, scale: number) => {
      const dy = getY(dyPct);
      // Pedestal
      ctx.fillStyle = "#2a1a18";
      ctx.fillRect(dx - 12 * scale, dy - 5 * scale, 24 * scale, 10 * scale);
      ctx.fillStyle = "#3a2a28";
      ctx.fillRect(dx - 10 * scale, dy - 8 * scale, 20 * scale, 5 * scale);
      // Body
      const statueGrad = ctx.createLinearGradient(dx - 8 * scale, dy - 40 * scale, dx + 8 * scale, dy - 8 * scale);
      statueGrad.addColorStop(0, "#2a2025");
      statueGrad.addColorStop(0.5, "#3a2a30");
      statueGrad.addColorStop(1, "#1a1015");
      ctx.fillStyle = statueGrad;
      ctx.beginPath();
      ctx.moveTo(dx - 8 * scale, dy - 8 * scale);
      ctx.lineTo(dx - 6 * scale, dy - 25 * scale);
      ctx.lineTo(dx - 4 * scale, dy - 32 * scale);
      ctx.lineTo(dx + 4 * scale, dy - 32 * scale);
      ctx.lineTo(dx + 6 * scale, dy - 25 * scale);
      ctx.lineTo(dx + 8 * scale, dy - 8 * scale);
      ctx.closePath();
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.arc(dx, dy - 36 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Horns
      ctx.fillStyle = "#1a1015";
      ctx.beginPath();
      ctx.moveTo(dx - 4 * scale, dy - 40 * scale);
      ctx.lineTo(dx - 10 * scale, dy - 50 * scale);
      ctx.lineTo(dx - 6 * scale, dy - 42 * scale);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dx + 4 * scale, dy - 40 * scale);
      ctx.lineTo(dx + 10 * scale, dy - 50 * scale);
      ctx.lineTo(dx + 6 * scale, dy - 42 * scale);
      ctx.fill();
      // Glowing eyes
      ctx.fillStyle = `rgba(255, 50, 20, ${0.7 + Math.sin(time * 4 + dx) * 0.3})`;
      ctx.beginPath();
      ctx.arc(dx - 2 * scale, dy - 37 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.arc(dx + 2 * scale, dy - 37 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Eye glow
      const eyeGlow = ctx.createRadialGradient(dx, dy - 37 * scale, 0, dx, dy - 37 * scale, 10 * scale);
      eyeGlow.addColorStop(0, `rgba(255, 50, 20, ${0.2 + Math.sin(time * 3) * 0.1})`);
      eyeGlow.addColorStop(1, "rgba(255, 50, 20, 0)");
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(dx, dy - 37 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawDemonStatue(1560, 52, 0.8);
    drawDemonStatue(1720, 28, 0.7);

    // Fire elemental/spirit
    const drawFireElemental = (fx: number, fyPct: number, scale: number) => {
      const fy = getY(fyPct);
      const bob = Math.sin(time * 3 + fx) * 3;
      // Glow aura
      const auraGrad = ctx.createRadialGradient(fx, fy - 15 * scale + bob, 0, fx, fy - 15 * scale + bob, 25 * scale);
      auraGrad.addColorStop(0, `rgba(255, 150, 50, ${0.3 + Math.sin(time * 4 + fx) * 0.1})`);
      auraGrad.addColorStop(0.5, `rgba(255, 80, 20, ${0.15 + Math.sin(time * 3) * 0.05})`);
      auraGrad.addColorStop(1, "rgba(255, 50, 10, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(fx, fy - 15 * scale + bob, 25 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Body flames
      for (let f = 0; f < 5; f++) {
        const flameHeight = 20 + Math.sin(time * 6 + f * 1.2) * 8;
        const flameWidth = 8 - f * 0.8;
        const flamex = fx - 8 * scale + f * 4 * scale;
        const flamey = fy + bob;
        ctx.fillStyle = `rgba(${255 - f * 20}, ${100 + f * 30}, ${20 + f * 10}, ${0.8 - f * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(flamex - flameWidth * scale * 0.5, flamey);
        ctx.quadraticCurveTo(flamex, flamey - flameHeight * scale, flamex + flameWidth * scale * 0.5, flamey);
        ctx.fill();
      }
      // Face/eyes
      ctx.fillStyle = "#ffff88";
      ctx.beginPath();
      ctx.arc(fx - 4 * scale, fy - 12 * scale + bob, 2 * scale, 0, Math.PI * 2);
      ctx.arc(fx + 4 * scale, fy - 12 * scale + bob, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawFireElemental(1490, 55, 0.6);
    drawFireElemental(1660, 38, 0.5);
    drawFireElemental(1750, 62, 0.55);

    // Destroyed/burning fortress
    const drawBurningRuins = (rx: number, ryPct: number, scale: number) => {
      const ry = getY(ryPct);
      // Rubble base
      ctx.fillStyle = "#2a2020";
      for (let r = 0; r < 8; r++) {
        const rubX = rx - 25 * scale + seededRandom(rx + r) * 50 * scale;
        const rubY = ry + seededRandom(rx + r + 10) * 8 * scale;
        const rubSize = 4 + seededRandom(rx + r + 20) * 6;
        ctx.beginPath();
        ctx.arc(rubX, rubY, rubSize * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Standing wall sections
      const wallGrad = ctx.createLinearGradient(rx - 20 * scale, ry - 35 * scale, rx + 20 * scale, ry);
      wallGrad.addColorStop(0, "#3a2a28");
      wallGrad.addColorStop(1, "#2a1a18");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(rx - 22 * scale, ry - 30 * scale, 12 * scale, 35 * scale);
      ctx.fillRect(rx + 5 * scale, ry - 22 * scale, 14 * scale, 27 * scale);
      // Broken edges
      ctx.fillStyle = "#2a1a18";
      ctx.beginPath();
      ctx.moveTo(rx - 22 * scale, ry - 30 * scale);
      ctx.lineTo(rx - 18 * scale, ry - 35 * scale);
      ctx.lineTo(rx - 14 * scale, ry - 28 * scale);
      ctx.lineTo(rx - 10 * scale, ry - 32 * scale);
      ctx.lineTo(rx - 10 * scale, ry - 30 * scale);
      ctx.lineTo(rx - 22 * scale, ry - 30 * scale);
      ctx.fill();
      // Flames from windows/top
      for (let flame = 0; flame < 3; flame++) {
        const flameX = rx - 16 * scale + flame * 15 * scale;
        const flameY = ry - 20 * scale - flame * 5 * scale;
        const fh = 15 + Math.sin(time * 7 + flame * 1.5) * 6;
        ctx.fillStyle = `rgba(255, ${80 + flame * 40}, 20, ${0.8 - flame * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(flameX - 4 * scale, flameY);
        ctx.quadraticCurveTo(flameX, flameY - fh * scale, flameX + 4 * scale, flameY);
        ctx.fill();
      }
      // Smoke
      for (let s = 0; s < 4; s++) {
        const smokePhase = (time * 20 + s * 15) % 50;
        const smokeX = rx - 10 * scale + s * 8 * scale + Math.sin(time + s) * 5;
        const smokeY = ry - 35 * scale - smokePhase;
        const smokeSize = 6 + smokePhase * 0.3;
        ctx.fillStyle = `rgba(50, 40, 40, ${Math.max(0, 0.35 - smokePhase / 80)})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawBurningRuins(1600, 68, 0.8);

    // Ash/ember particles rising
    for (let i = 0; i < 40; i++) {
      const ex = 1440 + seededRandom(i * 13) * 380;
      const baseY = height * 0.9 - seededRandom(i * 17) * height * 0.3;
      const riseSpeed = 30 + seededRandom(i * 23) * 20;
      const ey = baseY - ((time * riseSpeed) % (height * 0.8));
      if (ey > 10 && ey < height - 10) {
        const drift = Math.sin(time * 2 + i * 0.5) * (8 + seededRandom(i) * 5);
        const size = 1.5 + seededRandom(i * 7) * 2;
        const brightness = 150 + seededRandom(i * 11) * 105;
        ctx.fillStyle = `rgba(255, ${brightness}, 50, ${0.5 + Math.sin(time * 4 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(ex + drift, ey, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Heat distortion effect overlay
    ctx.save();
    ctx.globalAlpha = 0.03 + Math.sin(time * 2) * 0.01;
    for (let h = 0; h < 8; h++) {
      const heatY = height * 0.3 + h * 15;
      ctx.fillStyle = "#ff4400";
      ctx.beginPath();
      for (let hx = 1440; hx < 1820; hx += 10) {
        const distort = Math.sin(time * 5 + hx * 0.03 + h * 0.5) * 2;
        if (hx === 1440) ctx.moveTo(hx, heatY + distort);
        else ctx.lineTo(hx, heatY + distort);
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

      // Bridge planks with wood grain
      const plankWidth = 7;
      for (let p = 0; p < length / plankWidth; p++) {
        const px = p * plankWidth + 2;
        const plankY = Math.sin(p * 0.3) * 1.5;
        // Plank shadow
        ctx.fillStyle = "#2a1a0a";
        ctx.fillRect(px, plankY - 3 + 1, plankWidth - 1.5, 7);
        // Main plank with gradient
        const plankGrad = ctx.createLinearGradient(px, plankY - 3, px, plankY + 4);
        plankGrad.addColorStop(0, p % 2 === 0 ? "#7a6040" : "#6a5030");
        plankGrad.addColorStop(0.3, p % 2 === 0 ? "#6a5030" : "#5a4020");
        plankGrad.addColorStop(1, p % 2 === 0 ? "#5a4020" : "#4a3010");
        ctx.fillStyle = plankGrad;
        ctx.fillRect(px, plankY - 3, plankWidth - 1.5, 6);
        // Highlight edge
        ctx.fillStyle = "rgba(255,220,160,0.12)";
        ctx.fillRect(px, plankY - 3, plankWidth - 1.5, 1);
        // Wood grain line
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(px + 1, plankY - 2);
        ctx.lineTo(px + plankWidth - 3, plankY - 2);
        ctx.stroke();
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

    // Dirt road paths (worn into the ground) - enhanced with edges
    const drawRoadSegment = (points: [number, number][]) => {
      if (points.length < 2) return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Road trench shadow (deep)
      ctx.strokeStyle = "rgba(15, 10, 5, 0.35)";
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(points[0][0], getY(points[0][1]));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], getY(points[i][1]));
      }
      ctx.stroke();

      // Road bed (darker edges)
      ctx.strokeStyle = "rgba(50, 35, 20, 0.3)";
      ctx.lineWidth = 16;
      ctx.stroke();

      // Main road surface
      ctx.strokeStyle = "rgba(90, 70, 45, 0.28)";
      ctx.lineWidth = 12;
      ctx.stroke();

      // Road wear (lighter center)
      ctx.strokeStyle = "rgba(110, 85, 55, 0.2)";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Subtle center highlight
      ctx.strokeStyle = "rgba(140, 110, 70, 0.1)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wheel ruts (dashed lines)
      ctx.setLineDash([3, 8]);
      ctx.strokeStyle = "rgba(40, 25, 12, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(points[0][0] - 3, getY(points[0][1]));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0] - 3, getY(points[i][1]));
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(points[0][0] + 3, getY(points[0][1]));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0] + 3, getY(points[i][1]));
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Main travel routes
    drawRoadSegment([[50, 50], [100, 50], [150, 45], [200, 48]]);
    drawRoadSegment([[200, 48], [250, 52], [310, 55]]);
    drawRoadSegment([[440, 50], [500, 55], [560, 52], [620, 48]]);
    drawRoadSegment([[780, 50], [850, 55], [920, 52], [980, 50]]);
    drawRoadSegment([[1140, 50], [1200, 48], [1270, 52], [1340, 55]]);
    drawRoadSegment([[1520, 55], [1580, 52], [1650, 55], [1720, 50]]);

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
      const color1 = isEnemy ? "#4a2020" : "#5a4a3a";
      const color2 = isEnemy ? "#3a1010" : "#4a3a2a";
      const color3 = isEnemy ? "#2a0808" : "#3a2a1a";
      const accent = isEnemy ? "#8b0000" : "#f59e0b";
      const accentGlow = isEnemy ? "#ff4400" : "#ffcc00";

      // Large ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(x + 8, y + 15, 55, 18, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Castle moat/trench
      ctx.fillStyle = isEnemy ? "rgba(100, 20, 0, 0.3)" : "rgba(60, 80, 100, 0.3)";
      ctx.beginPath();
      ctx.ellipse(x, y + 12, 48, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer walls (3D effect)
      const wallGrad = ctx.createLinearGradient(x - 45, 0, x + 45, 0);
      wallGrad.addColorStop(0, color3);
      wallGrad.addColorStop(0.2, color2);
      wallGrad.addColorStop(0.5, color1);
      wallGrad.addColorStop(0.8, color2);
      wallGrad.addColorStop(1, color3);
      ctx.fillStyle = wallGrad;
      ctx.fillRect(x - 42, y - 30, 84, 40);

      // Wall stone texture
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.5;
      for (let row = 0; row < 6; row++) {
        const wy = y - 28 + row * 7;
        ctx.beginPath();
        ctx.moveTo(x - 42, wy);
        ctx.lineTo(x + 42, wy);
        ctx.stroke();
        for (let col = 0; col < 10; col++) {
          const offset = row % 2 === 0 ? 0 : 4;
          ctx.beginPath();
          ctx.moveTo(x - 42 + col * 9 + offset, wy);
          ctx.lineTo(x - 42 + col * 9 + offset, wy + 7);
          ctx.stroke();
        }
      }

      // Left tower with 3D shading
      const leftTowerGrad = ctx.createLinearGradient(x - 48, 0, x - 26, 0);
      leftTowerGrad.addColorStop(0, color3);
      leftTowerGrad.addColorStop(0.4, color2);
      leftTowerGrad.addColorStop(1, color1);
      ctx.fillStyle = leftTowerGrad;
      ctx.fillRect(x - 48, y - 65, 22, 75);

      // Right tower
      const rightTowerGrad = ctx.createLinearGradient(x + 26, 0, x + 48, 0);
      rightTowerGrad.addColorStop(0, color1);
      rightTowerGrad.addColorStop(0.6, color2);
      rightTowerGrad.addColorStop(1, color3);
      ctx.fillStyle = rightTowerGrad;
      ctx.fillRect(x + 26, y - 65, 22, 75);

      // Tower battlements (3D)
      for (let i = 0; i < 4; i++) {
        // Left tower
        ctx.fillStyle = color2;
        ctx.fillRect(x - 48 + i * 6, y - 73, 5, 9);
        ctx.fillStyle = color1;
        ctx.fillRect(x - 48 + i * 6, y - 73, 4, 8);
        // Right tower
        ctx.fillStyle = color2;
        ctx.fillRect(x + 26 + i * 6, y - 73, 5, 9);
        ctx.fillStyle = color1;
        ctx.fillRect(x + 26 + i * 6, y - 73, 4, 8);
      }

      // Tower roofs
      ctx.fillStyle = isEnemy ? "#3a1515" : "#4a3520";
      ctx.beginPath();
      ctx.moveTo(x - 37, y - 85);
      ctx.lineTo(x - 50, y - 70);
      ctx.lineTo(x - 24, y - 70);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 37, y - 85);
      ctx.lineTo(x + 24, y - 70);
      ctx.lineTo(x + 50, y - 70);
      ctx.closePath();
      ctx.fill();

      // Main keep (central tower)
      const keepGrad = ctx.createLinearGradient(x - 18, 0, x + 18, 0);
      keepGrad.addColorStop(0, color2);
      keepGrad.addColorStop(0.3, color1);
      keepGrad.addColorStop(0.7, color1);
      keepGrad.addColorStop(1, color2);
      ctx.fillStyle = keepGrad;
      ctx.fillRect(x - 18, y - 85, 36, 95);

      // Keep battlements
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = color2;
        ctx.fillRect(x - 18 + i * 6, y - 93, 5, 9);
        ctx.fillStyle = color1;
        ctx.fillRect(x - 18 + i * 6, y - 93, 4, 8);
      }

      // Flag pole and banner
      ctx.fillStyle = "#4a3020";
      ctx.fillRect(x - 1.5, y - 118, 3, 28);
      ctx.fillStyle = accent;
      const fw1 = Math.sin(time * 3 + x) * 4;
      const fw2 = Math.sin(time * 3.3 + x) * 3;
      ctx.beginPath();
      ctx.moveTo(x + 1.5, y - 116);
      ctx.quadraticCurveTo(x + 14, y - 110 + fw1, x + 26, y - 104 + fw2);
      ctx.quadraticCurveTo(x + 14, y - 98 + fw1, x + 1.5, y - 92);
      ctx.closePath();
      ctx.fill();
      // Banner emblem
      ctx.fillStyle = isEnemy ? "#1a0000" : "#1a1a00";
      ctx.beginPath();
      ctx.arc(x + 12, y - 104 + fw1 * 0.5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x + 12, y - 104 + fw1 * 0.5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Windows with warm light
      const windowGlowIntensity = 0.5 + Math.sin(time * 2 + x) * 0.25;
      ctx.fillStyle = accentGlow;
      ctx.globalAlpha = windowGlowIntensity;

      // Keep windows
      ctx.fillRect(x - 8, y - 70, 16, 20);
      // Cross dividers
      ctx.globalAlpha = 1;
      ctx.fillStyle = color2;
      ctx.fillRect(x - 0.5, y - 70, 1, 20);
      ctx.fillRect(x - 8, y - 61, 16, 1);

      // Tower windows
      ctx.fillStyle = accentGlow;
      ctx.globalAlpha = windowGlowIntensity * 0.8;
      ctx.fillRect(x - 42, y - 50, 10, 14);
      ctx.fillRect(x + 32, y - 50, 10, 14);
      ctx.globalAlpha = 1;

      // Window glow effect
      const glowGrad = ctx.createRadialGradient(x, y - 60, 0, x, y - 60, 30);
      glowGrad.addColorStop(0, `${accentGlow}40`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y - 60, 30, 0, Math.PI * 2);
      ctx.fill();

      // Main gate (arched door)
      ctx.fillStyle = "#1a0a0a";
      ctx.beginPath();
      ctx.moveTo(x - 14, y + 10);
      ctx.lineTo(x - 14, y - 12);
      ctx.arc(x, y - 12, 14, Math.PI, 0);
      ctx.lineTo(x + 14, y + 10);
      ctx.closePath();
      ctx.fill();

      // Gate portcullis (iron bars)
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 5, y - 20);
        ctx.lineTo(x + i * 5, y + 8);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 5);
      ctx.lineTo(x + 12, y - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 12, y + 3);
      ctx.lineTo(x + 12, y + 3);
      ctx.stroke();

      // Smoke from chimneys
      for (let c = 0; c < 2; c++) {
        const cx = x + (c === 0 ? -37 : 37);
        for (let s = 0; s < 3; s++) {
          const sy = y - 85 - ((time * 12 + s * 8 + c * 20) % 25);
          const sx = cx + Math.sin(time * 1.5 + s + c) * 3;
          ctx.globalAlpha = 0.25 - ((time * 12 + s * 8 + c * 20) % 25) / 80;
          ctx.fillStyle = "#666";
          ctx.beginPath();
          ctx.arc(sx, sy, 3 + s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Guards on towers
      for (let g = 0; g < 2; g++) {
        const gx = x + (g === 0 ? -37 : 37);
        const sway = Math.sin(time * 0.5 + g * 2) * 1;
        ctx.fillStyle = isEnemy ? "#8b0000" : "#f59e0b";
        ctx.beginPath();
        ctx.arc(gx + sway, y - 77, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isEnemy ? "#5a0000" : "#b45309";
        ctx.fillRect(gx - 2 + sway, y - 74, 4, 6);
        // Spear
        ctx.strokeStyle = "#6a6a6a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx + 3 + sway, y - 78);
        ctx.lineTo(gx + 3 + sway, y - 90);
        ctx.stroke();
        ctx.fillStyle = "#9a9a9a";
        ctx.beginPath();
        ctx.moveTo(gx + 1 + sway, y - 90);
        ctx.lineTo(gx + 3 + sway, y - 95);
        ctx.lineTo(gx + 5 + sway, y - 90);
        ctx.fill();
      }

      // Ambient castle glow aura
      const castleAura = ctx.createRadialGradient(x, y - 40, 10, x, y - 40, 80);
      castleAura.addColorStop(0, `${accentGlow}${isEnemy ? "18" : "15"}`);
      castleAura.addColorStop(0.5, `${accentGlow}08`);
      castleAura.addColorStop(1, `${accentGlow}00`);
      ctx.fillStyle = castleAura;
      ctx.beginPath();
      ctx.arc(x, y - 40, 80, 0, Math.PI * 2);
      ctx.fill();

      // Torch flames on gate sides
      for (let t = 0; t < 2; t++) {
        const torchX = x + (t === 0 ? -18 : 18);
        const torchY = y - 5;
        // Torch bracket
        ctx.fillStyle = "#3a2a1a";
        ctx.fillRect(torchX - 1, torchY - 2, 2, 8);
        // Flame
        const flameH = 6 + Math.sin(time * 8 + t * 2 + x) * 3;
        ctx.fillStyle = `rgba(255, 200, 80, ${0.8 + Math.sin(time * 6 + t) * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(torchX - 2, torchY - 2);
        ctx.quadraticCurveTo(torchX, torchY - 2 - flameH, torchX + 2, torchY - 2);
        ctx.fill();
        // Flame glow
        const torchGlow = ctx.createRadialGradient(torchX, torchY - 4, 0, torchX, torchY - 4, 10);
        torchGlow.addColorStop(0, `rgba(255, 180, 50, ${0.25 + Math.sin(time * 7 + t) * 0.1})`);
        torchGlow.addColorStop(1, "rgba(255, 150, 30, 0)");
        ctx.fillStyle = torchGlow;
        ctx.beginPath();
        ctx.arc(torchX, torchY - 4, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // (castle labels removed for cleaner look)
    };

    drawKingdomCastle(70, 50, false);
    drawKingdomCastle(MAP_WIDTH - 70, 50, true);

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

      // Glow
      if (isSelected) {
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 30;
      } else if (isHovered && isUnlocked) {
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur = 20;
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
      ctx.shadowBlur = 0;

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

    // === GOD RAYS / LIGHT BEAMS ===
    ctx.save();
    for (let ray = 0; ray < 5; ray++) {
      const rayX = 120 + ray * (width / 5) + Math.sin(time * 0.3 + ray * 1.5) * 30;
      const rayW = 20 + seededRandom(ray * 41) * 40;
      const rayAlpha = 0.02 + Math.sin(time * 0.5 + ray * 0.9) * 0.015;

      // Determine ray color based on region
      let rayColor = "255,240,200";
      if (rayX > 1440) rayColor = "255,120,60";
      else if (rayX > 1080) rayColor = "180,210,255";
      else if (rayX > 720) rayColor = "255,220,150";
      else if (rayX > 380) rayColor = "150,220,130";

      const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + rayW * 1.5, height);
      rayGrad.addColorStop(0, `rgba(${rayColor},${rayAlpha + 0.03})`);
      rayGrad.addColorStop(0.3, `rgba(${rayColor},${rayAlpha})`);
      rayGrad.addColorStop(0.7, `rgba(${rayColor},${rayAlpha * 0.5})`);
      rayGrad.addColorStop(1, `rgba(${rayColor},0)`);
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rayX, 0);
      ctx.lineTo(rayX + rayW, 0);
      ctx.lineTo(rayX + rayW * 2, height);
      ctx.lineTo(rayX + rayW * 0.5, height);
      ctx.closePath();
      ctx.fill();
    }
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
    animTime,
    seededRandom,
    getY,
    isLevelUnlocked,
    getLevelById,
  ]);

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const animate = (timestamp: number) => {
      if (timestamp - lastTime > 35) {
        setAnimTime(timestamp / 1000);
        lastTime = timestamp;
      }
      drawMap();
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
                style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
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
                  className="block"
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
