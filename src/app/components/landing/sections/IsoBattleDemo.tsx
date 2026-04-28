"use client";
import React, { useRef, useCallback, useEffect, useState } from "react";

import { ENEMY_DATA } from "../../../constants/enemies";
import { drawEnemySprite } from "../../../rendering/enemies";
import { drawHeroSprite } from "../../../rendering/heroes";
import { drawTowerSprite } from "../../../rendering/towers";
import type { TowerType, EnemyType } from "../../../types";
import { LANDING_THEME } from "../landingConstants";
import { SectionFlourish } from "./LoadoutUI";

const T = LANDING_THEME;

const COLS = 9;
const ROWS = 6;
const TILE_W = 56;
const TILE_H = 28;

const PATH_CELLS: [number, number][] = [
  [0, 2],
  [1, 2],
  [2, 2],
  [2, 3],
  [3, 3],
  [4, 3],
  [4, 2],
  [5, 2],
  [6, 2],
  [6, 3],
  [7, 3],
  [8, 3],
];
const PATH_SET = new Set(PATH_CELLS.map(([c, r]) => `${c},${r}`));

interface PlacedTower {
  col: number;
  row: number;
  type: TowerType;
  level: 1 | 2 | 3 | 4;
}

const TOWERS: PlacedTower[] = [
  { col: 1, level: 3, row: 1, type: "cannon" },
  { col: 3, level: 2, row: 2, type: "library" },
  { col: 5, level: 3, row: 1, type: "lab" },
  { col: 7, level: 2, row: 2, type: "mortar" },
];

interface WalkingEnemy {
  type: EnemyType;
  progress: number;
  speed: number;
}

const ENEMY_TYPES: EnemyType[] = [
  "skeleton_knight",
  "dark_knight",
  "mage",
  "dire_bear",
  "senior",
  "yeti",
];

function gridToScreen(
  col: number,
  row: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  return {
    x: offsetX + (col - row) * (TILE_W / 2),
    y: offsetY + (col + row) * (TILE_H / 2),
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getEnemyScreenPos(
  progress: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  const idx = Math.min(
    Math.floor(progress * (PATH_CELLS.length - 1)),
    PATH_CELLS.length - 2
  );
  const frac = progress * (PATH_CELLS.length - 1) - idx;
  const [c1, r1] = PATH_CELLS[idx];
  const [c2, r2] = PATH_CELLS[Math.min(idx + 1, PATH_CELLS.length - 1)];
  const p1 = gridToScreen(c1, r1, offsetX, offsetY);
  const p2 = gridToScreen(c2, r2, offsetX, offsetY);
  return { x: lerp(p1.x, p2.x, frac), y: lerp(p1.y, p2.y, frac) };
}

function drawIsoDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  fill: string,
  stroke?: string
) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.lineTo(cx, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

export function IsoBattleDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enemiesRef = useRef<WalkingEnemy[]>([]);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const initEnemies = useCallback(() => {
    const enemies: WalkingEnemy[] = [];
    for (let i = 0; i < 6; i++) {
      enemies.push({
        progress: -0.1 - i * 0.12,
        speed: 0.018 + (i % 3) * 0.004,
        type: ENEMY_TYPES[i % ENEMY_TYPES.length],
      });
    }
    enemiesRef.current = enemies;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const now = performance.now();
    if (!startRef.current) {
      startRef.current = now;
    }
    const elapsed = (now - startRef.current) / 50;

    const offsetX = cssW / 2 - ((COLS - ROWS) * TILE_W) / 4;
    const offsetY = 30;

    // Draw tiles
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const { x, y } = gridToScreen(c, r, offsetX, offsetY);
        const isPath = PATH_SET.has(`${c},${r}`);
        drawIsoDiamond(
          ctx,
          x,
          y,
          TILE_W - 2,
          TILE_H - 1,
          isPath ? "rgba(90,65,30,0.5)" : "rgba(40,55,30,0.4)",
          isPath ? "rgba(140,100,40,0.3)" : "rgba(60,80,40,0.25)"
        );
      }
    }

    // Collect renderable objects sorted by screen Y
    const renderables: {
      y: number;
      draw: () => void;
    }[] = [];

    // Towers
    for (const t of TOWERS) {
      const { x, y } = gridToScreen(t.col, t.row, offsetX, offsetY);
      renderables.push({
        draw: () => {
          ctx.save();
          drawTowerSprite(
            ctx,
            x,
            y - 8,
            38,
            t.type,
            t.level,
            undefined,
            elapsed
          );
          ctx.restore();
        },
        y,
      });
    }

    // Hero on the field
    const heroPos = gridToScreen(4, 1, offsetX, offsetY);
    renderables.push({
      draw: () => {
        ctx.save();
        const heroSize = 22;
        const zoom = 0.8;
        drawHeroSprite(
          ctx,
          heroPos.x,
          heroPos.y - 6,
          heroSize,
          "tiger",
          "#f97316",
          elapsed * 0.08,
          zoom,
          0
        );
        ctx.restore();
      },
      y: heroPos.y,
    });

    // Enemies
    const enemies = enemiesRef.current;
    for (const enemy of enemies) {
      enemy.progress += enemy.speed * 0.016;
      if (enemy.progress > 1.1) {
        enemy.progress = -0.15;
        enemy.type =
          ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      }

      if (enemy.progress < 0 || enemy.progress > 1) {
        continue;
      }

      const eData = ENEMY_DATA[enemy.type];
      if (!eData) {
        continue;
      }

      const pos = getEnemyScreenPos(enemy.progress, offsetX, offsetY);
      renderables.push({
        draw: () => {
          ctx.save();
          drawEnemySprite(
            ctx,
            pos.x,
            pos.y - 4,
            18,
            enemy.type,
            eData.color,
            0,
            elapsed * 0.08,
            !!eData.flying,
            0.65,
            0,
            "grassland"
          );
          ctx.restore();
        },
        y: pos.y,
      });
    }

    // Sort by Y for proper overlap
    renderables.sort((a, b) => a.y - b.y);
    for (const r of renderables) {
      r.draw();
    }

    // Tower range indicators (subtle)
    ctx.globalAlpha = 0.04;
    for (const t of TOWERS) {
      const { x, y } = gridToScreen(t.col, t.row, offsetX, offsetY);
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fillStyle = "#d4a84a";
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    initEnemies();
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mounted, initEnemies, render]);

  if (!mounted) {
    return (
      <section className="py-14 sm:py-20 px-6">
        <div
          className="max-w-3xl mx-auto aspect-[16/9] rounded-2xl"
          style={{ background: `rgba(${T.accentDarkRgb},0.06)` }}
        />
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-20 px-6 overflow-hidden">
      <SectionFlourish />

      <div className="text-center mt-10 sm:mt-16 mb-8 sm:mb-12">
        <h3
          className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-1.5"
          style={{ color: `rgba(${T.accentRgb},0.3)` }}
        >
          Watch the Action
        </h3>
        <h2
          className="text-xl sm:text-3xl font-bold tracking-wider"
          style={{
            color: T.accent,
            textShadow: `0 0 30px rgba(${T.accentRgb},0.2)`,
          }}
        >
          Isometric Battlefield
        </h2>
      </div>

      <div
        className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(18,14,8,0.95) 0%, rgba(${T.bgRgb},0.98) 100%)`,
          border: `1.5px solid rgba(${T.accentDarkRgb},0.2)`,
          boxShadow: `0 0 60px rgba(${T.accentRgb},0.06), 0 20px 60px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Perspective wrapper for 3D tilt */}
        <div
          style={{
            perspective: "1200px",
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full"
            style={{
              aspectRatio: "16 / 9",
              display: "block",
              transform: "rotateX(2deg)",
              transformOrigin: "center 60%",
            }}
          />
        </div>

        {/* Bottom gradient overlay for polish */}
        <div
          className="absolute bottom-0 inset-x-0 h-12 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(${T.bgRgb},0.8), transparent)`,
          }}
        />

        {/* Top edge glow */}
        <div
          className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${T.accentRgb},0.15), transparent)`,
          }}
        />
      </div>

      <p
        className="text-center text-[10px] sm:text-xs mt-6 italic"
        style={{ color: `rgba(${T.accentRgb},0.2)` }}
      >
        Real-time isometric rendering &mdash; towers, heroes, and enemies drawn
        with the Canvas 2D API
      </p>
    </section>
  );
}
