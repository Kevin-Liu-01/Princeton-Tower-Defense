import type { WorldMapDrawContext } from "./drawContext";
import { drawCamp } from "./grasslandDecorations";
import {
  drawRuins,
  drawWatchTower,
  drawCrater,
} from "./swampDecorations";
import {
  drawSandDune,
  drawGoldenPyramid,
  drawSphinx,
  drawOasis,
  drawCamel,
  drawDesertCamp,
  drawBurningWreck,
} from "./desertDecorations";
import {
  drawSnowMountain,
  drawIceCrystal,
  drawFrozenLake,
  drawIgloo,
  drawMammoth,
} from "./winterDecorations";
import {
  drawVolcano,
  drawLavaPool,
  drawLavaRiver,
  drawDemonStatue,
  drawFireElemental,
} from "./volcanicDecorations";
import {
  drawWagonWheel,
  drawArrow,
  drawFallenShield,
  drawBattleScene,
  drawFlyingBattleScene,
  drawFallenSoldier,
  drawKingdomCastle,
  drawEnemyLair,
  drawCastleLabel,
} from "./structureDecorations";
import { drawOrganicBlobAt } from "../../../../rendering/helpers";
import { MAP_WIDTH } from "../worldMapData";

export function drawStructureLandmarkLayer(dc: WorldMapDrawContext): void {
  const { ctx, width, time, getLevelY, seededRandom } = dc;

  // === ABOVE-PATH STRUCTURES (rendered over connection paths) ===

  drawCamp(dc, 100, 25);
  drawCamp(dc, 180, 42);
  drawCamp(dc, 290, 78);
  drawCamp(dc, 620, 78);
  drawCamp(dc, 540, 21);
  drawCamp(dc, 780, 20);
  drawCamp(dc, 1020, 82);
  drawCamp(dc, 1580, 82);
  drawCamp(dc, 350, 35);
  drawCamp(dc, 470, 38);
  drawCamp(dc, 750, 78);
  drawCamp(dc, 1150, 28);
  drawCamp(dc, 1310, 82);
  drawCamp(dc, 1680, 38);
  drawRuins(dc, 145, 82, 0.5);
  drawRuins(dc, 265, 28, 0.45);
  drawRuins(dc, 345, 80, 0.55);
  drawRuins(dc, 455, 72, 0.5, "#3a4a3a");
  drawRuins(dc, 590, 42, 0.6, "#3a4a3a");
  drawRuins(dc, 680, 72, 0.5, "#3a4a3a");
  drawRuins(dc, 820, 62, 0.5, "#8a7a5a");
  drawRuins(dc, 950, 72, 0.55, "#8a7a5a");
  drawRuins(dc, 1040, 30, 0.45, "#8a7a5a");
  drawRuins(dc, 1160, 72, 0.5, "#6a7a8a");
  drawRuins(dc, 1290, 38, 0.55, "#6a7a8a");
  drawRuins(dc, 1400, 70, 0.5, "#6a7a8a");
  drawRuins(dc, 1510, 42, 0.5, "#4a2a1a");
  drawRuins(dc, 1640, 80, 0.55, "#4a2a1a");
  drawRuins(dc, 1740, 38, 0.45, "#4a2a1a");
  drawWatchTower(dc, 45, 78);
  drawWatchTower(dc, 220, 25);
  drawWatchTower(dc, 240, 78);
  drawWatchTower(dc, 330, 42);
  drawWatchTower(dc, 490, 70);
  drawWatchTower(dc, 860, 33);
  drawWatchTower(dc, 1240, 52);
  drawWatchTower(dc, 1140, 22);
  drawWatchTower(dc, 1620, 30);
  drawWatchTower(dc, 140, 85);
  drawWatchTower(dc, 305, 30);
  drawWatchTower(dc, 640, 48);
  drawWatchTower(dc, 830, 78);
  drawWatchTower(dc, 1000, 28);
  drawWatchTower(dc, 1350, 78);
  drawWatchTower(dc, 1500, 52);
  drawWatchTower(dc, 1710, 80);
  drawCrater(dc, 180, 60, 15);
  drawCrater(dc, 260, 32, 12);
  drawCrater(dc, 320, 80, 10);
  drawCrater(dc, 600, 45, 18);
  drawCrater(dc, 750, 70, 14);
  drawCrater(dc, 920, 30, 11);
  drawCrater(dc, 980, 65, 14);
  drawCrater(dc, 1120, 55, 16);
  drawCrater(dc, 1200, 50, 19);
  drawCrater(dc, 1290, 25, 19);
  drawCrater(dc, 1300, 60, 13);
  drawCrater(dc, 1400, 60, 15);
  drawCrater(dc, 1500, 75, 12);
  drawCrater(dc, 1700, 85, 9);
  drawCrater(dc, 100, 78, 10);
  drawCrater(dc, 215, 42, 11);
  drawCrater(dc, 350, 55, 12);
  drawCrater(dc, 445, 68, 14);
  drawCrater(dc, 530, 30, 10);
  drawCrater(dc, 680, 62, 12);
  drawCrater(dc, 830, 48, 13);
  drawCrater(dc, 1050, 72, 10);
  drawCrater(dc, 1160, 38, 11);
  drawCrater(dc, 1350, 78, 14);
  drawCrater(dc, 1550, 42, 12);
  drawCrater(dc, 1650, 68, 11);
  drawCrater(dc, 1760, 55, 13);
  drawSandDune(dc, 760, 25, 40, 10, "#c49a6c", "#b08a5c", "#9a7a4c");
  drawSandDune(dc, 870, 20, 45, 12, "#c8a070", "#b89060", "#a88050");
  drawSandDune(dc, 980, 28, 35, 9, "#c49a6c", "#b08a5c", "#9a7a4c");
  drawSandDune(dc, 1050, 22, 32, 8, "#c8a070", "#b89060", "#a88050");
  drawSandDune(dc, 730, 18, 30, 8, "#c49a6c", "#b08a5c", "#9a7a4c");
  drawSandDune(dc, 830, 15, 35, 9, "#c8a070", "#b89060", "#a88050");
  drawSandDune(dc, 1070, 18, 28, 7, "#c49a6c", "#b08a5c", "#9a7a4c");
  drawSandDune(dc, 800, 45, 48, 12, "#d4aa7a", "#c49a6a", "#b08a5a");
  drawSandDune(dc, 920, 50, 42, 11, "#d8b080", "#c8a070", "#b89060");
  drawSandDune(dc, 1010, 42, 38, 10, "#d4aa7a", "#c49a6a", "#b08a5a");
  drawSandDune(dc, 740, 55, 36, 9, "#d4aa7a", "#c49a6a", "#b08a5a");
  drawSandDune(dc, 850, 40, 32, 8, "#d8b080", "#c8a070", "#b89060");
  drawSandDune(dc, 1060, 48, 34, 9, "#d4aa7a", "#c49a6a", "#b08a5a");
  drawSandDune(dc, 750, 75, 35, 9, "#e0be8a", "#d0ae7a", "#c09e6a");
  drawSandDune(dc, 860, 80, 40, 10, "#e4c490", "#d4b480", "#c4a470");
  drawSandDune(dc, 960, 78, 32, 8, "#e0be8a", "#d0ae7a", "#c09e6a");
  drawSandDune(dc, 1040, 82, 28, 7, "#e4c490", "#d4b480", "#c4a470");
  drawSandDune(dc, 790, 85, 30, 8, "#e0be8a", "#d0ae7a", "#c09e6a");
  drawSandDune(dc, 910, 72, 38, 10, "#e4c490", "#d4b480", "#c4a470");
  drawSandDune(dc, 1025, 88, 26, 6, "#e0be8a", "#d0ae7a", "#c09e6a");
  drawGoldenPyramid(dc, 770, 66, 27);
  drawGoldenPyramid(dc, 820, 70, 27);
  drawGoldenPyramid(dc, 860, 65, 27);
  drawGoldenPyramid(dc, 850, 50, 25);
  drawGoldenPyramid(dc, 950, 23, 17);
  drawGoldenPyramid(dc, 970, 85, 20);
  drawGoldenPyramid(dc, 960, 35, 28);
  drawGoldenPyramid(dc, 785, 30, 15);
  drawGoldenPyramid(dc, 900, 75, 18);
  drawGoldenPyramid(dc, 1020, 28, 14);
  drawGoldenPyramid(dc, 1045, 55, 16);
  drawSphinx(dc, 965, 43, 0.8);
  drawOasis(dc, 780, 42, 25);
  drawCamel(dc, 880, 72, 0.6, 1);
  drawCamel(dc, 905, 74, 0.55, 1);
  drawCamel(dc, 1010, 50, 0.65, -1);
  drawCamel(dc, 760, 55, 0.5, -1);
  drawCamel(dc, 1050, 42, 0.55, 1);
  drawDesertCamp(dc, 820, 22);
  drawDesertCamp(dc, 1030, 58);
  drawDesertCamp(dc, 920, 82);
  drawDesertCamp(dc, 760, 38);
  drawBurningWreck(dc, 810, 25);
  drawBurningWreck(dc, 960, 75);
  drawBurningWreck(dc, 990, 20);
  drawBurningWreck(dc, 1520, 32);
  drawBurningWreck(dc, 1650, 62);
  drawBurningWreck(dc, 870, 48);
  drawBurningWreck(dc, 1040, 60);
  drawBurningWreck(dc, 1570, 75);
  drawBurningWreck(dc, 1700, 28);
  drawSnowMountain(dc, 1130, 30, 35, 16);
  drawSnowMountain(dc, 1250, 25, 45, 20);
  drawSnowMountain(dc, 1350, 26, 48, 28);
  drawSnowMountain(dc, 1380, 28, 48, 28);
  drawSnowMountain(dc, 1095, 20, 30, 14);
  drawSnowMountain(dc, 1190, 22, 38, 18);
  drawSnowMountain(dc, 1420, 24, 32, 16);
  drawSnowMountain(dc, 1310, 80, 68, 38);
  drawSnowMountain(dc, 1350, 82, 68, 38);
  drawSnowMountain(dc, 1120, 82, 40, 22);
  drawSnowMountain(dc, 1200, 85, 50, 28);
  drawIceCrystal(dc, 1120, 62, 0.8);
  drawIceCrystal(dc, 1270, 48, 1);
  drawIceCrystal(dc, 1350, 72, 0.7);
  drawIceCrystal(dc, 1410, 38, 0.9);
  drawFrozenLake(dc, 1200, 82, 45, 0.35);
  drawFrozenLake(dc, 1340, 58, 35, 0.3);
  drawFrozenLake(dc, 1120, 60, 30, 0.25);
  drawFrozenLake(dc, 1240, 57, 28, 0.3);
  drawIgloo(dc, 1160, 50, 0.8);
  drawIgloo(dc, 1390, 75, 0.7);
  drawIgloo(dc, 1240, 38, 0.65);
  drawIgloo(dc, 1310, 62, 0.6);
  drawMammoth(dc, 1230, 65, 0.5, 1);
  drawMammoth(dc, 1300, 25, 0.4, -1);
  drawIceCrystal(dc, 1095, 45, 0.5);
  drawIceCrystal(dc, 1170, 70, 0.55);
  drawIceCrystal(dc, 1250, 30, 0.45);
  drawIceCrystal(dc, 1320, 55, 0.5);
  drawIceCrystal(dc, 1400, 40, 0.55);
  drawVolcano(dc, 1530, 22, 95, 35);
  drawVolcano(dc, 1700, 21, 85, 30);
  drawVolcano(dc, 1720, 24, 95, 45);
  drawVolcano(dc, 1460, 18, 70, 28);
  drawVolcano(dc, 1600, 23, 80, 32);
  drawVolcano(dc, 1720, 84, 95, 45);
  drawVolcano(dc, 1700, 86, 85, 30);
  drawVolcano(dc, 1460, 88, 75, 30);
  drawVolcano(dc, 1580, 86, 65, 25);
  drawLavaPool(dc, 1500, 65, 30, 0.35);
  drawLavaPool(dc, 1620, 78, 25, 0.3);
  drawLavaPool(dc, 1700, 55, 35, 0.4);
  drawLavaPool(dc, 1760, 75, 28, 0.35);
  drawLavaPool(dc, 1475, 42, 22, 0.3);
  drawLavaPool(dc, 1555, 80, 20, 0.25);
  drawLavaPool(dc, 1660, 35, 26, 0.3);
  drawLavaPool(dc, 1730, 82, 24, 0.35);
  drawLavaRiver(dc, 
    [
      [1460, 72],
      [1478, 67],
      [1500, 65],
      [1520, 68],
      [1545, 63],
      [1568, 65],
      [1590, 68],
    ],
    8,
  );
  drawLavaRiver(dc, 
    [
      [1480, 38],
      [1498, 40],
      [1515, 42],
      [1535, 39],
      [1558, 38],
      [1578, 42],
      [1590, 45],
    ],
    7,
  );
  drawLavaRiver(dc, 
    [
      [1640, 45],
      [1658, 48],
      [1678, 50],
      [1700, 48],
      [1722, 50],
      [1742, 52],
      [1760, 55],
    ],
    8,
  );
  drawLavaRiver(dc, 
    [
      [1470, 55],
      [1495, 52],
      [1520, 55],
      [1545, 50],
    ],
    5,
  );
  drawLavaRiver(dc, 
    [
      [1650, 70],
      [1680, 72],
      [1710, 68],
      [1740, 72],
      [1770, 70],
    ],
    6,
  );
  drawDemonStatue(dc, 1560, 52, 0.8);
  drawDemonStatue(dc, 1720, 28, 0.7);
  drawFireElemental(dc, 1490, 55, 0.6);
  drawFireElemental(dc, 1660, 38, 0.5);
  drawFireElemental(dc, 1750, 62, 0.55);
  drawDemonStatue(dc, 1480, 38, 0.6);
  drawDemonStatue(dc, 1660, 72, 0.65);
  drawFireElemental(dc, 1540, 30, 0.5);
  drawFireElemental(dc, 1710, 45, 0.45);
  drawWagonWheel(dc, 155, 68, 8, 0.5);
  drawWagonWheel(dc, 295, 35, 6, 1.2);
  drawWagonWheel(dc, 485, 72, 7, 0.8);
  drawWagonWheel(dc, 715, 28, 6, 2.1);
  drawWagonWheel(dc, 945, 70, 8, 0.3);
  drawWagonWheel(dc, 1165, 32, 7, 1.8);
  drawWagonWheel(dc, 1395, 68, 6, 0.9);
  drawWagonWheel(dc, 1605, 25, 8, 1.5);
  drawWagonWheel(dc, 85, 50, 6, 0.3);
  drawWagonWheel(dc, 230, 78, 7, 1.7);
  drawWagonWheel(dc, 380, 42, 5, 0.9);
  drawWagonWheel(dc, 555, 55, 7, 2.3);
  drawWagonWheel(dc, 670, 80, 6, 0.6);
  drawWagonWheel(dc, 835, 38, 5, 1.1);
  drawWagonWheel(dc, 1080, 58, 7, 1.4);
  drawWagonWheel(dc, 1285, 42, 6, 2.0);
  drawWagonWheel(dc, 1480, 72, 5, 0.4);
  drawWagonWheel(dc, 1720, 55, 7, 1.6);
  drawWagonWheel(dc, 155, 68, 8, 0.5);
  drawWagonWheel(dc, 295, 35, 6, 1.2);
  drawWagonWheel(dc, 485, 72, 7, 0.8);
  drawWagonWheel(dc, 715, 28, 6, 2.1);
  drawWagonWheel(dc, 945, 70, 8, 0.3);
  drawWagonWheel(dc, 1165, 32, 7, 1.8);
  drawWagonWheel(dc, 1395, 68, 6, 0.9);
  drawWagonWheel(dc, 1605, 25, 8, 1.5);
  drawWagonWheel(dc, 85, 50, 6, 0.3);
  drawWagonWheel(dc, 230, 78, 7, 1.7);
  drawWagonWheel(dc, 380, 42, 5, 0.9);
  drawWagonWheel(dc, 555, 55, 7, 2.3);
  drawWagonWheel(dc, 670, 80, 6, 0.6);
  drawWagonWheel(dc, 835, 38, 5, 1.1);
  drawWagonWheel(dc, 1080, 58, 7, 1.4);
  drawWagonWheel(dc, 1285, 42, 6, 2.0);
  drawWagonWheel(dc, 1480, 72, 5, 0.4);
  drawWagonWheel(dc, 1720, 55, 7, 1.6);
  for (let i = 0; i < 40; i++) {
    const ax = seededRandom(i * 23) * width;
    const ay = 25 + seededRandom(i * 23 + 1) * 55;
    const angle = (seededRandom(i * 23 + 2) - 0.5) * 0.6;
    drawArrow(dc, ax, ay, angle);
  }
  for (let i = 0; i < 25; i++) {
    const sx = seededRandom(i * 31) * width;
    const sy = 30 + seededRandom(i * 31 + 1) * 50;
    drawFallenShield(dc, sx, sy, seededRandom(i * 31 + 2) > 0.5);
  }

  // === ENHANCED BATTLE SCENES ===
  // Fallen soldiers (corpses and debris)
  // Scatter fallen soldiers across the map
  [
    [150, 50, true],
    [200, 62, false],
    [290, 40, true],
    [460, 60, false],
    [530, 40, true],
    [590, 55, true],
    [780, 35, false],
    [870, 68, true],
    [950, 50, false],
    [1100, 65, true],
    [1220, 45, false],
    [1310, 58, true],
    [1480, 40, false],
    [1560, 70, true],
    [1680, 55, false],
    [75, 72, false],
    [120, 35, true],
    [255, 75, false],
    [335, 55, true],
    [415, 38, false],
    [580, 78, true],
    [650, 32, false],
    [730, 62, true],
    [845, 42, false],
    [920, 75, true],
    [1050, 55, false],
    [1170, 78, true],
    [1260, 30, false],
    [1380, 45, true],
    [1540, 55, false],
    [1620, 38, true],
    [1750, 65, false],
  ].forEach(([x, y, isEnemy]) => {
    drawFallenSoldier(dc, x as number, y as number, isEnemy as boolean);
  });

  // Multiple battle scenes across regions (knights, soldiers, cavalry vs dark knights, skeletons, archers)
  drawBattleScene(dc, 165, 42, false, 2);
  drawBattleScene(dc, 310, 72, true, 3);
  drawBattleScene(dc, 480, 35, false, 2);
  drawBattleScene(dc, 610, 68, true, 2);
  drawBattleScene(dc, 840, 55, false, 3);
  drawBattleScene(dc, 1050, 38, true, 2);
  drawBattleScene(dc, 1200, 62, false, 2);
  drawBattleScene(dc, 1340, 68, true, 3);
  drawBattleScene(dc, 1520, 25, false, 2);
  drawBattleScene(dc, 1670, 75, true, 3);
  drawBattleScene(dc, 90, 58, false, 2);
  drawBattleScene(dc, 245, 30, true, 2);
  drawBattleScene(dc, 420, 65, false, 3);
  drawBattleScene(dc, 550, 42, true, 2);
  drawBattleScene(dc, 760, 72, false, 2);
  drawBattleScene(dc, 975, 28, true, 2);
  drawBattleScene(dc, 1150, 45, false, 3);
  drawBattleScene(dc, 1290, 32, true, 2);
  drawBattleScene(dc, 1600, 55, false, 2);
  drawBattleScene(dc, 1740, 35, true, 3);

  // Flying enemies (harpies and wyverns) circling above key battle areas
  drawFlyingBattleScene(dc, 310, 72, true, 2);
  drawFlyingBattleScene(dc, 610, 60, false, 1);
  drawFlyingBattleScene(dc, 840, 48, true, 2);
  drawFlyingBattleScene(dc, 1200, 55, false, 1);
  drawFlyingBattleScene(dc, 1340, 62, true, 3);
  drawFlyingBattleScene(dc, 1670, 68, false, 2);
  drawFlyingBattleScene(dc, 420, 58, true, 1);
  drawFlyingBattleScene(dc, 975, 22, false, 2);
  drawFlyingBattleScene(dc, 1520, 20, true, 1);
  drawFlyingBattleScene(dc, 165, 36, false, 1);

  // === ENHANCED KINGDOM CASTLES ===
  drawKingdomCastle(dc, 70, 50);
  drawEnemyLair(dc, MAP_WIDTH - 70, 50);

  // Kingdom labels under castles
  drawCastleLabel(dc, 70, 50, "YOUR KINGDOM", false);
  drawCastleLabel(dc, MAP_WIDTH - 70, 50, "ENEMY KINGDOM", true);

  // === ABOVE-PATH LANDMARKS (rendered over connection paths) ===

  // === LANDMARK: Carnegie Lake (near Poe Field → Carnegie Lake path) ===
  {
    const lkX = 268,
      lkY = getLevelY(44);
    const lkW = 36,
      lkH = 16;
    // Grassy bank
    ctx.fillStyle = "rgba(50,90,35,0.2)";
    ctx.beginPath();
    ctx.ellipse(lkX, lkY, lkW + 10, lkH + 6, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Soft mud ring
    ctx.fillStyle = "rgba(60,50,30,0.15)";
    ctx.beginPath();
    ctx.ellipse(lkX, lkY, lkW + 5, lkH + 3, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Main water body
    const lakeGrad = ctx.createRadialGradient(
      lkX - 4,
      lkY - 2,
      0,
      lkX,
      lkY,
      lkW,
    );
    lakeGrad.addColorStop(0, "rgba(25,80,130,0.7)");
    lakeGrad.addColorStop(0.3, "rgba(35,100,155,0.6)");
    lakeGrad.addColorStop(0.7, "rgba(50,120,170,0.45)");
    lakeGrad.addColorStop(1, "rgba(80,150,190,0.15)");
    ctx.fillStyle = lakeGrad;
    drawOrganicBlobAt(ctx, lkX, lkY, lkW, lkH, 42.7, 0.12, 20);
    ctx.fill();
    // Depth shading — darker center
    ctx.fillStyle = "rgba(15,50,90,0.2)";
    ctx.beginPath();
    ctx.ellipse(lkX - 2, lkY, lkW * 0.5, lkH * 0.4, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Animated ripples
    for (let rp = 0; rp < 3; rp++) {
      const ripT = (time * 0.8 + rp * 2.1) % 3;
      const ripA = Math.max(0, 0.2 - ripT * 0.07);
      const ripR = 3 + ripT * 6;
      const rpx = lkX - 8 + rp * 10;
      const rpy = lkY - 2 + rp * 3;
      ctx.strokeStyle = `rgba(180,220,255,${ripA})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(rpx, rpy, ripR, ripR * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Shoreline highlight
    ctx.strokeStyle = "rgba(120,190,230,0.2)";
    ctx.lineWidth = 1.2;
    drawOrganicBlobAt(ctx, lkX, lkY, lkW - 2, lkH - 1, 42.7, 0.1, 18);
    ctx.stroke();
    // Small wooden dock
    const dkX = lkX + lkW * 0.6,
      dkY = lkY - lkH * 0.3;
    ctx.fillStyle = "#5a4a30";
    ctx.fillRect(dkX, dkY - 1, 14, 3);
    ctx.fillRect(dkX, dkY - 3, 2, 5);
    ctx.fillRect(dkX + 12, dkY - 3, 2, 5);
    ctx.fillRect(dkX + 6, dkY + 2, 2, 3);
    // Lily pads
    const lilyPositions = [
      [-12, 3],
      [-6, -5],
      [5, 4],
      [14, -2],
      [-18, -1],
      [8, -7],
    ];
    lilyPositions.forEach(([ox, oy], li) => {
      const lpx = lkX + ox,
        lpy = lkY + oy;
      ctx.fillStyle = `rgba(40,110,30,${0.45 + seededRandom(li * 7 + 215) * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(
        lpx,
        lpy,
        3.5,
        2.2,
        seededRandom(li * 3) * 1.5,
        0.2,
        Math.PI * 1.85,
      );
      ctx.fill();
      if (seededRandom(li * 7 + 216) > 0.5) {
        ctx.fillStyle = "#e0a0c0";
        ctx.beginPath();
        ctx.arc(lpx + 1, lpy - 0.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    // Reed clusters around shore
    const reedClusters = [
      [-lkW + 4, 4],
      [-lkW * 0.5, lkH - 2],
      [lkW * 0.4, lkH],
      [lkW - 6, -lkH + 3],
      [-lkW * 0.7, -lkH + 1],
    ];
    reedClusters.forEach(([ox, oy], ri) => {
      for (let r = 0; r < 4; r++) {
        const rx = lkX + ox + (r - 1.5) * 2;
        const ry = lkY + oy;
        const sway = Math.sin(time * 2.2 + ri * 1.5 + r * 0.7) * 1.8;
        ctx.strokeStyle = r % 2 === 0 ? "#3a6a28" : "#4a7a38";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.quadraticCurveTo(rx + sway * 0.5, ry - 5, rx + sway, ry - 9 - r);
        ctx.stroke();
      }
    });
    // Reflection shimmer
    ctx.fillStyle = `rgba(200,230,255,${0.06 + Math.sin(time * 1.5) * 0.03})`;
    ctx.beginPath();
    ctx.ellipse(lkX + 6, lkY - 3, lkW * 0.3, lkH * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // === LANDMARK: Nassau Hall courtyard walls ===
  {
    const nhX = 312,
      nhY = getLevelY(70);
    const s = 1.8;
    // Courtyard floor — flagstones
    ctx.fillStyle = "rgba(90,80,65,0.18)";
    ctx.beginPath();
    ctx.ellipse(nhX, nhY + 4 * s, 18 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let fi = 0; fi < 12; fi++) {
      const fx = nhX + (seededRandom(fi * 7 + 330) - 0.5) * 28 * s;
      const fy = nhY + (seededRandom(fi * 7 + 331) - 0.3) * 8 * s;
      ctx.strokeStyle = "rgba(70,60,45,0.12)";
      ctx.lineWidth = 0.4;
      ctx.strokeRect(
        fx,
        fy,
        3 + seededRandom(fi * 7 + 332) * 4,
        2 + seededRandom(fi * 7 + 333) * 2,
      );
    }
    // Building shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(nhX, nhY + 8 * s, 16 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Main building body
    const bGrad = ctx.createLinearGradient(nhX - 14 * s, 0, nhX + 14 * s, 0);
    bGrad.addColorStop(0, "#5a5048");
    bGrad.addColorStop(0.3, "#7a7068");
    bGrad.addColorStop(0.7, "#6a6058");
    bGrad.addColorStop(1, "#4a4038");
    ctx.fillStyle = bGrad;
    ctx.fillRect(nhX - 14 * s, nhY - 8 * s, 28 * s, 14 * s);
    // Roof
    ctx.fillStyle = "#3a3830";
    ctx.beginPath();
    ctx.moveTo(nhX - 16 * s, nhY - 8 * s);
    ctx.lineTo(nhX, nhY - 16 * s);
    ctx.lineTo(nhX + 16 * s, nhY - 8 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2a2820";
    ctx.fillRect(nhX - 16 * s, nhY - 9 * s, 32 * s, 1.5 * s);
    // Cupola / bell tower
    ctx.fillStyle = "#5a5848";
    ctx.fillRect(nhX - 2.5 * s, nhY - 20 * s, 5 * s, 6 * s);
    ctx.fillStyle = "#7a7868";
    ctx.fillRect(nhX - 3.5 * s, nhY - 21 * s, 7 * s, 2 * s);
    ctx.fillStyle = "#3a3830";
    ctx.beginPath();
    ctx.moveTo(nhX - 3 * s, nhY - 21 * s);
    ctx.lineTo(nhX, nhY - 25 * s);
    ctx.lineTo(nhX + 3 * s, nhY - 21 * s);
    ctx.closePath();
    ctx.fill();
    // Windows (two rows)
    for (let row = 0; row < 2; row++) {
      for (let wi = 0; wi < 5; wi++) {
        const wx = nhX - 11 * s + wi * 5.5 * s;
        const wy = nhY - 6 * s + row * 5.5 * s;
        ctx.fillStyle = "#1a1a18";
        ctx.fillRect(wx, wy, 2.5 * s, 3 * s);
        ctx.fillStyle = `rgba(200,180,100,${0.08 + Math.sin(time * 1.5 + wi + row * 3) * 0.04})`;
        ctx.fillRect(wx + 0.3, wy + 0.3, 1.9 * s, 2.4 * s);
      }
    }
    // Gate — large central arch
    ctx.fillStyle = "#1a1a18";
    ctx.beginPath();
    ctx.moveTo(nhX - 4 * s, nhY + 6 * s);
    ctx.lineTo(nhX - 4 * s, nhY - 1 * s);
    ctx.arc(nhX, nhY - 1 * s, 4 * s, Math.PI, 0);
    ctx.lineTo(nhX + 4 * s, nhY + 6 * s);
    ctx.closePath();
    ctx.fill();
    // Gate pillars
    ctx.fillStyle = "#7a7068";
    ctx.fillRect(nhX - 5 * s, nhY - 2 * s, 1.5 * s, 8 * s);
    ctx.fillRect(nhX + 3.5 * s, nhY - 2 * s, 1.5 * s, 8 * s);
    // Courtyard walls extending outward
    ctx.fillStyle = "#5a5048";
    ctx.fillRect(nhX - 18 * s, nhY + 2 * s, 5 * s, 2 * s);
    ctx.fillRect(nhX + 13 * s, nhY + 2 * s, 5 * s, 2 * s);
    ctx.fillRect(nhX - 18 * s, nhY, 2 * s, 6 * s);
    ctx.fillRect(nhX + 16 * s, nhY, 2 * s, 6 * s);
  }

  // === LANDMARK: Cannon Crest artillery ===
  {
    const ccX = 168,
      ccY = getLevelY(18);
    // Earthwork / berm
    ctx.fillStyle = "rgba(60,50,30,0.25)";
    ctx.beginPath();
    ctx.ellipse(ccX, ccY + 6, 32, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(70,60,35,0.2)";
    ctx.beginPath();
    ctx.moveTo(ccX - 30, ccY + 4);
    ctx.quadraticCurveTo(ccX - 28, ccY - 4, ccX - 20, ccY - 3);
    ctx.lineTo(ccX + 20, ccY - 3);
    ctx.quadraticCurveTo(ccX + 28, ccY - 4, ccX + 30, ccY + 4);
    ctx.closePath();
    ctx.fill();
    // Sandbag wall
    for (let sb = 0; sb < 8; sb++) {
      const sbx = ccX - 22 + sb * 6.5;
      const sby = ccY - 2;
      ctx.fillStyle = sb % 2 === 0 ? "#8a7a58" : "#7a6a48";
      ctx.beginPath();
      ctx.ellipse(sbx, sby, 3.5, 2, 0.1 * ((sb % 3) - 1), 0, Math.PI * 2);
      ctx.fill();
    }
    // Three cannons at different angles
    const cannons: [number, number, number][] = [
      [-18, 1, -0.35],
      [0, -1, -0.15],
      [18, 0, 0.1],
    ];
    cannons.forEach(([ox, oy, rot]) => {
      const cx = ccX + ox,
        cy = ccY + oy;
      // Carriage
      ctx.fillStyle = "#3a2a1a";
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
      // Wheels (pair)
      for (const wside of [-1, 1]) {
        const wx = cx + wside * 5;
        const wy = cy + 3;
        ctx.strokeStyle = "#4a3a2a";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(wx, wy, 5, 0, Math.PI * 2);
        ctx.stroke();
        // Spokes
        for (let sp = 0; sp < 6; sp++) {
          const sa = (sp / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + Math.cos(sa) * 4.5, wy + Math.sin(sa) * 4.5);
          ctx.stroke();
        }
        ctx.fillStyle = "#3a2a1a";
        ctx.beginPath();
        ctx.arc(wx, wy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Barrel
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      const barrelGrad = ctx.createLinearGradient(0, -2.5, 0, 2.5);
      barrelGrad.addColorStop(0, "#2a2a2a");
      barrelGrad.addColorStop(0.5, "#4a4a4a");
      barrelGrad.addColorStop(1, "#2a2a2a");
      ctx.fillStyle = barrelGrad;
      ctx.fillRect(-3, -2.5, 18, 5);
      // Barrel bands
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(2, -3, 1.5, 6);
      ctx.fillRect(8, -3, 1.5, 6);
      // Muzzle
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(14, -3.5, 3, 7);
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.arc(17, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    // Ammo crate
    ctx.fillStyle = "#4a3a20";
    ctx.fillRect(ccX + 8, ccY + 4, 8, 6);
    ctx.fillStyle = "#3a2a18";
    ctx.fillRect(ccX + 8, ccY + 4, 8, 1.2);
    ctx.strokeStyle = "#2a1a10";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(ccX + 8, ccY + 4, 8, 6);
    // Cannonballs
    for (let cb = 0; cb < 4; cb++) {
      ctx.fillStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.arc(ccX - 12 + cb * 3, ccY + 8, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Battle flag
    ctx.fillStyle = "#4a3a28";
    ctx.fillRect(ccX + 24, ccY - 18, 1.5, 22);
    const flagWave = Math.sin(time * 3.5) * 2;
    ctx.fillStyle = "#c84030";
    ctx.beginPath();
    ctx.moveTo(ccX + 25.5, ccY - 17);
    ctx.quadraticCurveTo(
      ccX + 33,
      ccY - 15 + flagWave,
      ccX + 36,
      ccY - 12 + flagWave,
    );
    ctx.lineTo(ccX + 25.5, ccY - 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e8c840";
    ctx.beginPath();
    ctx.arc(ccX + 30, ccY - 13 + flagWave * 0.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // === LANDMARK: Ivy Crossroads arch ===
  {
    const ivX = 380,
      ivY = getLevelY(22);
    const s = 1.8;
    // Cobblestone path beneath
    ctx.fillStyle = "rgba(80,70,55,0.15)";
    ctx.beginPath();
    ctx.ellipse(ivX, ivY + 8 * s, 14 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stone pillar bases
    ctx.fillStyle = "#5a5a4a";
    ctx.fillRect(ivX - 10 * s, ivY + 4 * s, 5 * s, 3 * s);
    ctx.fillRect(ivX + 5 * s, ivY + 4 * s, 5 * s, 3 * s);
    // Stone pillars
    const pillarGradL = ctx.createLinearGradient(
      ivX - 10 * s,
      0,
      ivX - 5 * s,
      0,
    );
    pillarGradL.addColorStop(0, "#4a4a42");
    pillarGradL.addColorStop(0.5, "#6a6a5a");
    pillarGradL.addColorStop(1, "#5a5a4a");
    ctx.fillStyle = pillarGradL;
    ctx.fillRect(ivX - 9 * s, ivY - 10 * s, 4 * s, 14 * s);
    const pillarGradR = ctx.createLinearGradient(
      ivX + 5 * s,
      0,
      ivX + 10 * s,
      0,
    );
    pillarGradR.addColorStop(0, "#5a5a4a");
    pillarGradR.addColorStop(0.5, "#6a6a5a");
    pillarGradR.addColorStop(1, "#4a4a42");
    ctx.fillStyle = pillarGradR;
    ctx.fillRect(ivX + 5 * s, ivY - 10 * s, 4 * s, 14 * s);
    // Pillar caps
    ctx.fillStyle = "#7a7a68";
    ctx.fillRect(ivX - 10.5 * s, ivY - 11 * s, 6 * s, 2 * s);
    ctx.fillRect(ivX + 4.5 * s, ivY - 11 * s, 6 * s, 2 * s);
    // Stone arch
    ctx.strokeStyle = "#6a6a5a";
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.arc(ivX, ivY - 10 * s, 9 * s, Math.PI, 0);
    ctx.stroke();
    // Keystone at top of arch
    ctx.fillStyle = "#7a7a68";
    ctx.beginPath();
    ctx.moveTo(ivX - 2 * s, ivY - 18 * s);
    ctx.lineTo(ivX, ivY - 20 * s);
    ctx.lineTo(ivX + 2 * s, ivY - 18 * s);
    ctx.lineTo(ivX + 1.5 * s, ivY - 16 * s);
    ctx.lineTo(ivX - 1.5 * s, ivY - 16 * s);
    ctx.closePath();
    ctx.fill();
    // Ivy vines covering the arch — thick clusters
    for (let iv = 0; iv < 16; iv++) {
      const a = Math.PI + (iv / 16) * Math.PI;
      const ivR = 9 * s + (seededRandom(iv * 5 + 365) - 0.5) * 3;
      const vx = ivX + Math.cos(a) * ivR;
      const vy = ivY - 10 * s + Math.sin(a) * ivR;
      ctx.fillStyle =
        seededRandom(iv * 5 + 366) > 0.3
          ? "rgba(35,95,25,0.55)"
          : "rgba(50,120,35,0.5)";
      const leafSize = 2.5 * s + seededRandom(iv * 5 + 367) * 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(vx, vy, leafSize, leafSize * 0.65, a + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Ivy on pillars — hanging tendrils
    for (const px of [-7.5 * s, 6.5 * s]) {
      for (let t = 0; t < 5; t++) {
        const ty = ivY - 8 * s + t * 3.5 * s;
        const sway = Math.sin(time * 1.8 + t * 0.9 + px) * 1.2;
        ctx.fillStyle = t < 3 ? "rgba(40,105,28,0.5)" : "rgba(50,120,35,0.4)";
        ctx.beginPath();
        ctx.ellipse(ivX + px + sway, ty, 3 * s, 1.8 * s, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Hanging ivy tendrils from arch bottom
    for (let h = 0; h < 6; h++) {
      const hx = ivX - 7 * s + h * 3 * s;
      const tendrilLen = 4 + seededRandom(h * 3 + 370) * 6;
      ctx.strokeStyle = "rgba(30,80,20,0.4)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(
        hx,
        ivY - 10 * s + Math.sqrt(Math.max(0, (9 * s) ** 2 - (hx - ivX) ** 2)),
      );
      ctx.quadraticCurveTo(
        hx + Math.sin(time * 2 + h) * 1.5,
        ivY - 5 * s + tendrilLen * 0.5,
        hx + Math.sin(time * 2.5 + h) * 2,
        ivY - 5 * s + tendrilLen,
      );
      ctx.stroke();
    }
    // Signpost at base
    ctx.fillStyle = "#4a3a28";
    ctx.fillRect(ivX + 12 * s, ivY - 4 * s, 1.5 * s, 10 * s);
    ctx.fillStyle = "#6a5a40";
    ctx.save();
    ctx.translate(ivX + 13 * s, ivY - 3 * s);
    ctx.rotate(-0.1);
    ctx.fillRect(0, 0, 8 * s, 2.5 * s);
    ctx.restore();
    ctx.save();
    ctx.translate(ivX + 13 * s, ivY - 0.5 * s);
    ctx.rotate(0.12);
    ctx.fillRect(0, 0, 7 * s, 2.5 * s);
    ctx.restore();
  }

  // === LANDMARK: Witch's Domain hut (near x:535, y:33) ===
  {
    const whX = 481,
      whY = getLevelY(30);
    const s = 1.6;
    // Ground — dead grass and moss
    ctx.fillStyle = "rgba(25,40,20,0.25)";
    ctx.beginPath();
    ctx.ellipse(whX, whY + 8 * s, 22 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Scattered bones/skulls around
    for (let b = 0; b < 5; b++) {
      const bx = whX + (seededRandom(b * 7 + 525) - 0.5) * 35 * s;
      const by = whY + 4 * s + seededRandom(b * 7 + 526) * 6 * s;
      ctx.fillStyle = "#c8c0a8";
      ctx.beginPath();
      ctx.ellipse(
        bx,
        by,
        1.5,
        1,
        seededRandom(b * 7 + 527) * 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Crooked fence
    for (let f = 0; f < 7; f++) {
      const fx = whX - 20 * s + f * 6.5 * s;
      const fy = whY + 5 * s + Math.sin(f * 1.3) * 2;
      const lean = (seededRandom(f * 3 + 530) - 0.5) * 0.3;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(lean);
      ctx.fillStyle = "#2a2218";
      ctx.fillRect(-0.8, -6 * s, 1.6, 8 * s);
      ctx.fillStyle = "#3a3228";
      ctx.beginPath();
      ctx.moveTo(-1.2, -6 * s);
      ctx.lineTo(0, -7.5 * s);
      ctx.lineTo(1.2, -6 * s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // Crossbeams on fence
    ctx.strokeStyle = "#2a2218";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(whX - 20 * s, whY + 1 * s);
    ctx.lineTo(whX + 18 * s, whY + 2 * s);
    ctx.stroke();
    // Hut body — crooked, larger
    const hutGrad = ctx.createLinearGradient(
      whX - 12 * s,
      0,
      whX + 12 * s,
      0,
    );
    hutGrad.addColorStop(0, "#1a1810");
    hutGrad.addColorStop(0.5, "#2a2820");
    hutGrad.addColorStop(1, "#201e16");
    ctx.fillStyle = hutGrad;
    ctx.beginPath();
    ctx.moveTo(whX - 12 * s, whY + 5 * s);
    ctx.lineTo(whX - 10 * s, whY - 6 * s);
    ctx.lineTo(whX + 11 * s, whY - 7 * s);
    ctx.lineTo(whX + 13 * s, whY + 5 * s);
    ctx.closePath();
    ctx.fill();
    // Plank texture on hut
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.4;
    for (let pl = 0; pl < 5; pl++) {
      const px = whX - 10 * s + pl * 4.5 * s;
      ctx.beginPath();
      ctx.moveTo(px, whY - 6 * s + pl * 0.2);
      ctx.lineTo(px + 0.5, whY + 5 * s);
      ctx.stroke();
    }
    // Crooked roof — larger, with overhang
    ctx.fillStyle = "#1a1a12";
    ctx.beginPath();
    ctx.moveTo(whX - 15 * s, whY - 5 * s);
    ctx.lineTo(whX + 1 * s, whY - 20 * s);
    ctx.lineTo(whX + 16 * s, whY - 6 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#121210";
    ctx.fillRect(whX - 14 * s, whY - 6 * s, 29 * s, 1.5 * s);
    // Door — arched, with glow
    ctx.fillStyle = "#0a0a08";
    ctx.beginPath();
    ctx.moveTo(whX - 3 * s, whY + 5 * s);
    ctx.lineTo(whX - 3 * s, whY - 1 * s);
    ctx.arc(whX, whY - 1 * s, 3 * s, Math.PI, 0);
    ctx.lineTo(whX + 3 * s, whY + 5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(80,200,40,${0.08 + Math.sin(time * 1.5) * 0.04})`;
    ctx.fill();
    // Windows with eerie glow
    for (const wx of [-7 * s, 6 * s]) {
      ctx.fillStyle = "#0a0a08";
      ctx.fillRect(whX + wx, whY - 4 * s, 4 * s, 3.5 * s);
      ctx.fillStyle = `rgba(100,255,50,${0.35 + Math.sin(time * 2 + wx) * 0.15})`;
      ctx.fillRect(whX + wx + 0.4, whY - 3.6 * s, 3.2 * s, 2.7 * s);
      // Window glow halo
      const wGlow = ctx.createRadialGradient(
        whX + wx + 2 * s,
        whY - 2.5 * s,
        0,
        whX + wx + 2 * s,
        whY - 2.5 * s,
        8 * s,
      );
      wGlow.addColorStop(
        0,
        `rgba(80,200,40,${0.12 + Math.sin(time * 2.5 + wx) * 0.06})`,
      );
      wGlow.addColorStop(1, "rgba(60,150,30,0)");
      ctx.fillStyle = wGlow;
      ctx.beginPath();
      ctx.arc(whX + wx + 2 * s, whY - 2.5 * s, 8 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    // Chimney with green smoke
    ctx.fillStyle = "#2a2418";
    ctx.save();
    ctx.translate(whX + 8 * s, whY - 19 * s);
    ctx.rotate(0.12);
    ctx.fillRect(0, 0, 3 * s, 10 * s);
    ctx.restore();
    for (let sm = 0; sm < 5; sm++) {
      const smokeY = whY - 22 * s - sm * 5 * s - ((time * 8 + sm * 5) % 18);
      const smokeX = whX + 9.5 * s + Math.sin(time * 1.5 + sm * 0.8) * 3;
      ctx.fillStyle = `rgba(70,180,50,${0.18 - sm * 0.03})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, (2.5 + sm * 1.2) * s, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cauldron in front
    ctx.fillStyle = "#1a1a18";
    ctx.beginPath();
    ctx.ellipse(whX - 14 * s, whY + 3 * s, 4 * s, 3 * s, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = `rgba(60,200,30,${0.3 + Math.sin(time * 3) * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(whX - 14 * s, whY + 1 * s, 3 * s, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bubbles from cauldron
    for (let bub = 0; bub < 3; bub++) {
      const bubPhase = (time * 2.5 + bub * 1.3) % 2;
      const bubY = whY - bubPhase * 6 * s;
      const bubA = Math.max(0, 0.3 - bubPhase * 0.15);
      ctx.fillStyle = `rgba(80,220,50,${bubA})`;
      ctx.beginPath();
      ctx.arc(
        whX - 14 * s + Math.sin(time * 3 + bub) * 2,
        bubY,
        1.2 * s,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Hanging bottles from roof
    for (let bt = 0; bt < 4; bt++) {
      const btx = whX - 10 * s + bt * 6 * s;
      const bty = whY - 5 * s;
      ctx.strokeStyle = "#3a3a30";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(btx, bty);
      ctx.lineTo(btx, bty + 3 * s);
      ctx.stroke();
      ctx.fillStyle =
        seededRandom(bt + 540) > 0.5
          ? "rgba(80,160,40,0.5)"
          : "rgba(140,60,180,0.4)";
      ctx.beginPath();
      ctx.ellipse(btx, bty + 4 * s, 1 * s, 1.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LANDMARK: Sunken Temple ruins (near x:650, y:56) ===
  {
    const stX = 666,
      stY = getLevelY(68);
    const s = 1.7;
    // Flooded base — large murky pool
    ctx.fillStyle = "rgba(20,45,35,0.3)";
    ctx.beginPath();
    ctx.ellipse(stX, stY + 6 * s, 28 * s, 10 * s, -0.05, 0, Math.PI * 2);
    ctx.fill();
    // Water surface
    const waterGrad = ctx.createRadialGradient(
      stX,
      stY + 4 * s,
      0,
      stX,
      stY + 4 * s,
      24 * s,
    );
    waterGrad.addColorStop(0, "rgba(25,60,50,0.35)");
    waterGrad.addColorStop(0.6, "rgba(35,75,60,0.25)");
    waterGrad.addColorStop(1, "rgba(50,90,70,0.1)");
    ctx.fillStyle = waterGrad;
    drawOrganicBlobAt(ctx, stX, stY + 4 * s, 25 * s, 9 * s, 650.3, 0.1, 18);
    ctx.fill();
    // Water ripples
    for (let rp = 0; rp < 3; rp++) {
      const ripT = (time * 0.6 + rp * 1.8) % 2.5;
      const ripA = Math.max(0, 0.15 - ripT * 0.06);
      ctx.strokeStyle = `rgba(120,180,150,${ripA})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(
        stX + (rp - 1) * 8 * s,
        stY + 3 * s,
        4 + ripT * 5,
        1.5 + ripT * 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    // Crumbling stone steps leading into water
    for (let step = 0; step < 4; step++) {
      const sx = stX + 16 * s + step * 3 * s;
      const sy = stY + (4 - step) * 2 * s;
      ctx.fillStyle = step < 2 ? "rgba(60,70,55,0.4)" : "#4a5a4a";
      ctx.fillRect(sx, sy, 6 * s, 2 * s);
    }
    // Broken columns — 6 total at various heights
    const colPositions: [number, number, number][] = [
      [-18, 2, 0.8],
      [-10, -1, 1.0],
      [-3, -3, 0.6],
      [5, -2, 1.0],
      [13, 0, 0.9],
      [20, 2, 0.5],
    ];
    colPositions.forEach(([ox, oy, hFactor], ci) => {
      const colH = (12 + seededRandom(ci * 7 + 650) * 14) * s * hFactor;
      const colW = 2.5 * s;
      // Column shadow in water
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.beginPath();
      ctx.ellipse(
        stX + ox * s + 1,
        stY + oy * s + 2,
        colW + 1,
        colW * 0.4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Column body with gradient
      const colGrad = ctx.createLinearGradient(
        stX + ox * s - colW,
        0,
        stX + ox * s + colW,
        0,
      );
      colGrad.addColorStop(0, "#3a4a3a");
      colGrad.addColorStop(0.5, "#5a6a5a");
      colGrad.addColorStop(1, "#4a5a4a");
      ctx.fillStyle = colGrad;
      ctx.fillRect(stX + ox * s - colW, stY + oy * s - colH, colW * 2, colH);
      // Fluted detail
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 0.4;
      for (let fl = 0; fl < 3; fl++) {
        const flx = stX + ox * s - colW + (fl + 0.5) * colW * 0.7;
        ctx.beginPath();
        ctx.moveTo(flx, stY + oy * s);
        ctx.lineTo(flx, stY + oy * s - colH);
        ctx.stroke();
      }
      // Column capital
      if (colH > 10 * s) {
        ctx.fillStyle = "#5a6a5a";
        ctx.fillRect(
          stX + ox * s - colW - 1.5,
          stY + oy * s - colH - 2 * s,
          colW * 2 + 3,
          2.5 * s,
        );
        ctx.fillRect(
          stX + ox * s - colW - 0.5,
          stY + oy * s - colH - 3.5 * s,
          colW * 2 + 1,
          1.5 * s,
        );
      }
      // Jagged broken top (if shorter)
      if (colH <= 10 * s) {
        ctx.fillStyle = "#4a5a4a";
        for (let j = 0; j < 3; j++) {
          const jx = stX + ox * s - colW + j * colW * 0.7;
          const jh = seededRandom(ci * 3 + j + 660) * 3 * s;
          ctx.fillRect(jx, stY + oy * s - colH - jh, colW * 0.5, jh);
        }
      }
      // Moss growth
      ctx.fillStyle = "rgba(35,80,30,0.35)";
      ctx.beginPath();
      ctx.ellipse(
        stX + ox * s,
        stY + oy * s - colH * 0.35,
        colW + 2,
        2.5 * s,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
    // Stone lintel spanning two columns (tilted, cracked)
    ctx.save();
    ctx.translate(stX - 6 * s, stY - 18 * s);
    ctx.rotate(-0.1);
    ctx.fillStyle = "#4a5a4a";
    ctx.fillRect(0, 0, 16 * s, 3 * s);
    // Crack in lintel
    ctx.strokeStyle = "#2a3a2a";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(6 * s, 0);
    ctx.lineTo(7 * s, 1.5 * s);
    ctx.lineTo(8 * s, 0.5 * s);
    ctx.lineTo(9 * s, 3 * s);
    ctx.stroke();
    ctx.restore();
    // Fallen pediment triangle
    ctx.fillStyle = "#3a4a3a";
    ctx.save();
    ctx.translate(stX + 8 * s, stY + 2 * s);
    ctx.rotate(0.6);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8 * s, 0);
    ctx.lineTo(4 * s, -4 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Scattered rubble in water
    for (let rb = 0; rb < 8; rb++) {
      const rbx = stX + (seededRandom(rb * 5 + 670) - 0.5) * 40 * s;
      const rby = stY + 2 * s + seededRandom(rb * 5 + 671) * 8 * s;
      ctx.fillStyle =
        seededRandom(rb * 5 + 672) > 0.5 ? "#4a5a4a" : "#3a4a3a";
      ctx.beginPath();
      ctx.ellipse(
        rbx,
        rby,
        2 + seededRandom(rb * 5 + 673) * 2,
        1 + seededRandom(rb * 5 + 674) * 1.5,
        seededRandom(rb * 5 + 675),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Water shimmer
    ctx.fillStyle = `rgba(100,180,150,${0.08 + Math.sin(time * 2.5) * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(stX - 4 * s, stY + 3 * s, 18 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // === LANDMARK: Blight Basin poison pools (near x:540, y:70) ===
  {
    const bbX = 550,
      bbY = getLevelY(58);
    const s = 1.6;
    // Tainted ground
    ctx.fillStyle = "rgba(30,40,15,0.2)";
    ctx.beginPath();
    ctx.ellipse(bbX, bbY + 2 * s, 24 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Dead trees around the basin
    for (let dt = 0; dt < 3; dt++) {
      const dtx = bbX + (dt - 1) * 16 * s;
      const dty = bbY - 2 * s + (seededRandom(dt * 5 + 540) - 0.5) * 8;
      ctx.strokeStyle = "#2a2018";
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.moveTo(dtx, dty + 4 * s);
      ctx.quadraticCurveTo(
        dtx + (seededRandom(dt + 541) - 0.5) * 3,
        dty - 4 * s,
        dtx + (seededRandom(dt + 542) - 0.5) * 4,
        dty - 10 * s,
      );
      ctx.stroke();
      // Bare branches
      for (let br = 0; br < 3; br++) {
        const brt = 0.3 + br * 0.25;
        const brx = dtx + (seededRandom(dt + 542) - 0.5) * 4 * brt;
        const bry = dty + 4 * s - (4 + 10 * brt) * s;
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(brx, bry);
        ctx.lineTo(
          brx + (seededRandom(dt * 3 + br + 543) - 0.5) * 8 * s,
          bry - 4 * s,
        );
        ctx.stroke();
      }
    }
    // Poison pools — 5, interconnected look
    const pools: [number, number, number][] = [
      [-12, 2, 8],
      [-4, -3, 10],
      [6, 1, 9],
      [14, -1, 7],
      [0, 5, 6],
    ];
    pools.forEach(([ox, oy, pr], p) => {
      const px = bbX + ox * s,
        py = bbY + oy * s;
      const prs = pr * s;
      const poisonGrad = ctx.createRadialGradient(px, py, 0, px, py, prs);
      poisonGrad.addColorStop(
        0,
        `rgba(70,210,25,${0.3 + Math.sin(time * 2 + p * 0.8) * 0.12})`,
      );
      poisonGrad.addColorStop(
        0.5,
        `rgba(50,160,15,${0.2 + Math.sin(time * 2.2 + p) * 0.06})`,
      );
      poisonGrad.addColorStop(1, "rgba(30,100,10,0)");
      ctx.fillStyle = poisonGrad;
      drawOrganicBlobAt(ctx, px, py, prs, prs * 0.5, p * 4.3, 0.18, 14);
      ctx.fill();
      // Bubbles rising from each pool
      for (let bub = 0; bub < 2; bub++) {
        const bubPhase = (time * 1.5 + p * 1.1 + bub * 0.7) % 2;
        const bubA = Math.max(0, 0.25 - bubPhase * 0.13);
        ctx.fillStyle = `rgba(100,230,40,${bubA})`;
        ctx.beginPath();
        ctx.arc(
          px + Math.sin(time * 3 + p + bub) * 2,
          py - bubPhase * 5 * s,
          (1 + bub * 0.5) * s,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    });
    // Toxic mushroom clusters
    const mushrooms: [number, number, number][] = [
      [-16, -4, 1.0],
      [-8, 6, 0.8],
      [2, -5, 1.1],
      [10, 4, 0.9],
      [18, -2, 0.7],
      [-12, 0, 0.6],
      [6, 7, 0.85],
      [16, 1, 0.75],
    ];
    mushrooms.forEach(([ox, oy, ms], m) => {
      const mx = bbX + ox * s,
        my = bbY + oy * s;
      const mscale = ms * s;
      // Stem
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(mx - 0.6 * mscale, my, 1.2 * mscale, 4.5 * mscale);
      // Cap
      ctx.fillStyle = `rgba(120,200,40,${0.65 + Math.sin(time * 3 + m * 0.7) * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(mx, my, 3 * mscale, 2 * mscale, 0, Math.PI, 0);
      ctx.fill();
      // Spots on cap
      ctx.fillStyle = "rgba(200,255,100,0.35)";
      ctx.beginPath();
      ctx.arc(
        mx - 0.8 * mscale,
        my - 0.8 * mscale,
        0.6 * mscale,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        mx + 1 * mscale,
        my - 0.5 * mscale,
        0.4 * mscale,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Spore glow
      if (seededRandom(m * 7 + 555) > 0.5) {
        ctx.fillStyle = `rgba(100,255,50,${0.06 + Math.sin(time * 2.5 + m) * 0.03})`;
        ctx.beginPath();
        ctx.arc(mx, my - 1 * mscale, 5 * mscale, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    // Poison mist hovering over basin
    for (let mist = 0; mist < 4; mist++) {
      const mistX =
        bbX +
        (seededRandom(mist * 3 + 560) - 0.5) * 30 * s +
        Math.sin(time * 0.8 + mist) * 4;
      const mistY = bbY - 4 * s + Math.sin(time * 0.6 + mist * 1.5) * 2;
      ctx.fillStyle = `rgba(80,180,40,${0.06 + Math.sin(time * 1.2 + mist) * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(mistX, mistY, 8 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LANDMARK: Triad Keep fortified structure (near x:640, y:28) ===
  {
    const tkX = 618,
      tkY = getLevelY(25);
    const s = 1.7;
    // Moat
    ctx.fillStyle = "rgba(20,40,30,0.25)";
    ctx.beginPath();
    ctx.ellipse(tkX, tkY + 8 * s, 22 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(30,60,45,0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(tkX, tkY + 8 * s, 20 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Keep shadow
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(tkX, tkY + 7 * s, 16 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Outer walls
    const wallGrad = ctx.createLinearGradient(
      tkX - 16 * s,
      0,
      tkX + 16 * s,
      0,
    );
    wallGrad.addColorStop(0, "#2a3a28");
    wallGrad.addColorStop(0.3, "#3a4a38");
    wallGrad.addColorStop(0.7, "#3a4a38");
    wallGrad.addColorStop(1, "#2a3a28");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(tkX - 14 * s, tkY - 4 * s, 28 * s, 10 * s);
    // Wall top / parapet
    ctx.fillStyle = "#2a3a2a";
    ctx.fillRect(tkX - 15 * s, tkY - 5 * s, 30 * s, 2 * s);
    // Battlements on outer wall
    for (let b = 0; b < 7; b++) {
      ctx.fillStyle = "#3a4a38";
      ctx.fillRect(tkX - 15 * s + b * 4.5 * s, tkY - 8 * s, 3 * s, 4 * s);
    }
    // Central keep tower — taller
    const towerGrad = ctx.createLinearGradient(
      tkX - 6 * s,
      0,
      tkX + 6 * s,
      0,
    );
    towerGrad.addColorStop(0, "#2a3a28");
    towerGrad.addColorStop(0.5, "#3a4a38");
    towerGrad.addColorStop(1, "#2a3a28");
    ctx.fillStyle = towerGrad;
    ctx.fillRect(tkX - 6 * s, tkY - 18 * s, 12 * s, 22 * s);
    ctx.fillStyle = "#2a3a2a";
    ctx.fillRect(tkX - 7 * s, tkY - 19 * s, 14 * s, 2 * s);
    // Tower battlements
    for (let b = 0; b < 4; b++) {
      ctx.fillStyle = "#3a4a38";
      ctx.fillRect(tkX - 7 * s + b * 4 * s, tkY - 22 * s, 2.5 * s, 4 * s);
    }
    // Tower windows
    for (let tw = 0; tw < 3; tw++) {
      const twy = tkY - 16 * s + tw * 5 * s;
      ctx.fillStyle = "#0a0a08";
      ctx.fillRect(tkX - 2 * s, twy, 4 * s, 3 * s);
      ctx.fillStyle = `rgba(200,180,80,${0.06 + Math.sin(time * 1.5 + tw) * 0.03})`;
      ctx.fillRect(tkX - 1.5 * s, twy + 0.3, 3 * s, 2.4 * s);
    }
    // Gate — arched with portcullis
    ctx.fillStyle = "#0a0a08";
    ctx.beginPath();
    ctx.moveTo(tkX - 4 * s, tkY + 6 * s);
    ctx.lineTo(tkX - 4 * s, tkY - 1 * s);
    ctx.arc(tkX, tkY - 1 * s, 4 * s, Math.PI, 0);
    ctx.lineTo(tkX + 4 * s, tkY + 6 * s);
    ctx.closePath();
    ctx.fill();
    // Portcullis bars
    ctx.strokeStyle = "#2a2a20";
    ctx.lineWidth = 0.6 * s;
    for (let pg = 0; pg < 4; pg++) {
      const pgx = tkX - 3 * s + pg * 2 * s;
      ctx.beginPath();
      ctx.moveTo(pgx, tkY + 6 * s);
      ctx.lineTo(
        pgx,
        tkY -
          1 * s +
          Math.sqrt(Math.max(0, (4 * s) ** 2 - (pgx - tkX) ** 2)) * -1,
      );
      ctx.stroke();
    }
    // Corner turrets
    for (const cx of [-14 * s, 14 * s]) {
      ctx.fillStyle = "#2a3a28";
      ctx.fillRect(tkX + cx - 3 * s, tkY - 10 * s, 6 * s, 16 * s);
      ctx.fillStyle = "#3a4a38";
      ctx.fillRect(tkX + cx - 3.5 * s, tkY - 11 * s, 7 * s, 2 * s);
      // Turret cone top
      ctx.fillStyle = "#2a3a28";
      ctx.beginPath();
      ctx.moveTo(tkX + cx - 3 * s, tkY - 11 * s);
      ctx.lineTo(tkX + cx, tkY - 15 * s);
      ctx.lineTo(tkX + cx + 3 * s, tkY - 11 * s);
      ctx.closePath();
      ctx.fill();
    }
    // Banners on turrets
    for (const bx of [-14 * s, 14 * s]) {
      ctx.fillStyle = "#2a5a2a";
      ctx.fillRect(tkX + bx - 0.5, tkY - 20 * s, 1.2 * s, 8 * s);
      const bwave = Math.sin(time * 3 + bx) * 1.5;
      ctx.fillStyle = "#4a8a30";
      ctx.beginPath();
      ctx.moveTo(tkX + bx + 0.8, tkY - 19 * s);
      ctx.quadraticCurveTo(
        tkX + bx + 5 * s,
        tkY - 17.5 * s + bwave,
        tkX + bx + 6 * s,
        tkY - 15 * s + bwave,
      );
      ctx.lineTo(tkX + bx + 0.8, tkY - 13 * s);
      ctx.closePath();
      ctx.fill();
    }
    // Drawbridge
    ctx.fillStyle = "#3a2a18";
    ctx.fillRect(tkX - 5 * s, tkY + 4 * s, 10 * s, 5 * s);
    ctx.strokeStyle = "#2a1a10";
    ctx.lineWidth = 0.4;
    for (let db = 0; db < 4; db++) {
      ctx.beginPath();
      ctx.moveTo(tkX - 5 * s + db * 3 * s, tkY + 4 * s);
      ctx.lineTo(tkX - 5 * s + db * 3 * s, tkY + 9 * s);
      ctx.stroke();
    }
  }

  // === LANDMARK: Sunscorch Labyrinth maze walls (near x:1000, y:67) ===
  {
    const lbX = 910,
      lbY = getLevelY(63);
    const s = 1.7;
    const wallC = "#9a8050";
    const wallD = "#6a5a30";
    const wallH = "#b09060";
    // Sand floor
    ctx.fillStyle = "rgba(180,150,100,0.15)";
    ctx.beginPath();
    ctx.ellipse(lbX, lbY + 3 * s, 28 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Maze wall fragments — larger network
    const mazeWalls: [number, number, number, number, number][] = [
      [-22, -10, 14, 3, 0],
      [-22, -10, 3, 18, 0],
      [-10, -12, 3, 14, 0],
      [-10, -12, 12, 3, 0.03],
      [2, -14, 3, 10, 0],
      [2, -14, 16, 3, -0.02],
      [18, -12, 3, 14, 0],
      [18, 0, -14, 3, 0],
      [6, -4, 3, 12, 0],
      [-6, 0, 12, 3, 0.04],
      [-18, 6, 14, 3, 0],
      [10, 4, 3, 10, 0],
      [-8, 8, 18, 3, -0.02],
      [18, 4, 3, 10, 0],
    ];
    mazeWalls.forEach(([ox, oy, w, h, rot], wi) => {
      ctx.save();
      ctx.translate(lbX + ox * s, lbY + oy * s);
      ctx.rotate(rot);
      // Wall gradient for depth
      const wGrad = ctx.createLinearGradient(0, 0, 0, Math.abs(h) * s);
      wGrad.addColorStop(0, wallH);
      wGrad.addColorStop(0.3, wallC);
      wGrad.addColorStop(1, wallD);
      ctx.fillStyle = wGrad;
      ctx.fillRect(0, 0, w * s, h * s);
      // Top edge highlight
      ctx.fillStyle = wallH;
      ctx.fillRect(0, 0, w * s, 0.8 * s);
      // Shadow at base
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, (h - 0.5) * s, w * s, 0.5 * s);
      // Brick lines
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 0.3;
      const brickCount = Math.floor(Math.abs(w) / 3);
      for (let bi = 1; bi < brickCount; bi++) {
        const bx =
          bi * 3 * s + (seededRandom(wi * 5 + bi + 1000) - 0.5) * 0.5;
        ctx.beginPath();
        ctx.moveTo(bx, 0);
        ctx.lineTo(bx, h * s);
        ctx.stroke();
      }
      ctx.restore();
    });
    // Sand drifts against walls
    for (let sd = 0; sd < 6; sd++) {
      const sdx = lbX + (seededRandom(sd * 7 + 1010) - 0.5) * 36 * s;
      const sdy = lbY + (seededRandom(sd * 7 + 1011) - 0.3) * 16 * s;
      ctx.fillStyle = "rgba(200,170,120,0.2)";
      ctx.beginPath();
      ctx.ellipse(
        sdx,
        sdy,
        5 * s,
        2 * s,
        seededRandom(sd * 7 + 1012) * 1.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Skeleton near entrance
    ctx.fillStyle = "#d0c8b0";
    ctx.beginPath();
    ctx.arc(lbX - 18 * s, lbY + 10 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c8c0a0";
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(lbX - 18 * s, lbY + 12 * s);
    ctx.lineTo(lbX - 16 * s, lbY + 16 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lbX - 17 * s, lbY + 13 * s);
    ctx.lineTo(lbX - 20 * s, lbY + 15 * s);
    ctx.stroke();
    // Eye sockets
    ctx.fillStyle = "#1a1a10";
    ctx.beginPath();
    ctx.arc(lbX - 18.8 * s, lbY + 9.5 * s, 0.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lbX - 17.2 * s, lbY + 9.5 * s, 0.5 * s, 0, Math.PI * 2);
    ctx.fill();
    // Heat shimmer over labyrinth
    ctx.fillStyle = `rgba(220,190,130,${0.04 + Math.sin(time * 1.8) * 0.02})`;
    ctx.beginPath();
    ctx.ellipse(
      lbX,
      lbY - 4 * s + Math.sin(time * 0.5) * 2,
      22 * s,
      6 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === LANDMARK: Frost Fortress walls (near x:1268, y:67) ===
  {
    const ffX = 1200,
      ffY = getLevelY(76);
    const s = 1.8;
    const stoneC = "#6a7a8a";
    const stoneD = "#4a5a6a";
    const stoneH = "#8a9aaa";
    const iceC = "rgba(200,230,255,0.35)";
    // Snow ground around fortress
    ctx.fillStyle = "rgba(220,235,248,0.15)";
    ctx.beginPath();
    ctx.ellipse(ffX, ffY + 8 * s, 30 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fortress shadow
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(ffX, ffY + 6 * s, 24 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Main curtain wall
    const cwGrad = ctx.createLinearGradient(ffX - 20 * s, 0, ffX + 20 * s, 0);
    cwGrad.addColorStop(0, stoneD);
    cwGrad.addColorStop(0.3, stoneC);
    cwGrad.addColorStop(0.7, stoneC);
    cwGrad.addColorStop(1, stoneD);
    ctx.fillStyle = cwGrad;
    ctx.fillRect(ffX - 18 * s, ffY - 8 * s, 36 * s, 14 * s);
    // Wall cap
    ctx.fillStyle = stoneH;
    ctx.fillRect(ffX - 19 * s, ffY - 9 * s, 38 * s, 2 * s);
    // Battlements on wall
    for (let b = 0; b < 9; b++) {
      ctx.fillStyle = stoneC;
      ctx.fillRect(ffX - 19 * s + b * 4.5 * s, ffY - 12 * s, 3 * s, 4 * s);
      ctx.fillStyle = iceC;
      ctx.fillRect(ffX - 19 * s + b * 4.5 * s, ffY - 12 * s, 3 * s, 1 * s);
    }
    // Ice coating on wall top
    ctx.fillStyle = iceC;
    ctx.fillRect(ffX - 19 * s, ffY - 9 * s, 38 * s, 1.5 * s);
    // Gate — large arched
    ctx.fillStyle = "#1a2030";
    ctx.beginPath();
    ctx.moveTo(ffX - 5 * s, ffY + 6 * s);
    ctx.lineTo(ffX - 5 * s, ffY - 2 * s);
    ctx.arc(ffX, ffY - 2 * s, 5 * s, Math.PI, 0);
    ctx.lineTo(ffX + 5 * s, ffY + 6 * s);
    ctx.closePath();
    ctx.fill();
    // Portcullis
    ctx.strokeStyle = "#3a4050";
    ctx.lineWidth = 0.6 * s;
    for (let pg = 0; pg < 5; pg++) {
      const pgx = ffX - 4 * s + pg * 2 * s;
      ctx.beginPath();
      ctx.moveTo(pgx, ffY + 6 * s);
      ctx.lineTo(
        pgx,
        ffY -
          2 * s +
          Math.sqrt(Math.max(0, (5 * s) ** 2 - (pgx - ffX) ** 2)) * -1,
      );
      ctx.stroke();
    }
    for (let ph = 0; ph < 3; ph++) {
      ctx.beginPath();
      ctx.moveTo(ffX - 4.5 * s, ffY + 4 * s - ph * 3 * s);
      ctx.lineTo(ffX + 4.5 * s, ffY + 4 * s - ph * 3 * s);
      ctx.stroke();
    }
    // Corner towers (pair)
    for (const tx of [-18 * s, 18 * s]) {
      const tGrad = ctx.createLinearGradient(
        ffX + tx - 4 * s,
        0,
        ffX + tx + 4 * s,
        0,
      );
      tGrad.addColorStop(0, stoneD);
      tGrad.addColorStop(0.5, stoneC);
      tGrad.addColorStop(1, stoneD);
      ctx.fillStyle = tGrad;
      ctx.fillRect(ffX + tx - 4 * s, ffY - 16 * s, 8 * s, 22 * s);
      // Tower cap
      ctx.fillStyle = stoneH;
      ctx.fillRect(ffX + tx - 5 * s, ffY - 17 * s, 10 * s, 2 * s);
      // Conical roof
      ctx.fillStyle = "#4a5868";
      ctx.beginPath();
      ctx.moveTo(ffX + tx - 5 * s, ffY - 17 * s);
      ctx.lineTo(ffX + tx, ffY - 24 * s);
      ctx.lineTo(ffX + tx + 5 * s, ffY - 17 * s);
      ctx.closePath();
      ctx.fill();
      // Snow on roof
      ctx.fillStyle = "rgba(230,240,252,0.5)";
      ctx.beginPath();
      ctx.moveTo(ffX + tx - 4 * s, ffY - 18 * s);
      ctx.lineTo(ffX + tx, ffY - 23 * s);
      ctx.lineTo(ffX + tx + 4 * s, ffY - 18 * s);
      ctx.closePath();
      ctx.fill();
      // Tower windows
      for (let tw = 0; tw < 2; tw++) {
        ctx.fillStyle = "#1a2030";
        ctx.fillRect(
          ffX + tx - 1.5 * s,
          ffY - 14 * s + tw * 5 * s,
          3 * s,
          2.5 * s,
        );
        ctx.fillStyle = `rgba(180,200,240,${0.06 + Math.sin(time * 1.5 + tw + tx) * 0.03})`;
        ctx.fillRect(
          ffX + tx - 1 * s,
          ffY - 13.5 * s + tw * 5 * s,
          2 * s,
          1.8 * s,
        );
      }
      // Ice on tower
      ctx.fillStyle = iceC;
      ctx.fillRect(ffX + tx - 5 * s, ffY - 17 * s, 10 * s, 1 * s);
    }
    // Central keep tower
    ctx.fillStyle = stoneD;
    ctx.fillRect(ffX - 5 * s, ffY - 20 * s, 10 * s, 14 * s);
    ctx.fillStyle = stoneH;
    ctx.fillRect(ffX - 6 * s, ffY - 21 * s, 12 * s, 2 * s);
    ctx.fillStyle = "#4a5868";
    ctx.beginPath();
    ctx.moveTo(ffX - 5 * s, ffY - 21 * s);
    ctx.lineTo(ffX, ffY - 28 * s);
    ctx.lineTo(ffX + 5 * s, ffY - 21 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(230,240,252,0.45)";
    ctx.beginPath();
    ctx.moveTo(ffX - 4 * s, ffY - 22 * s);
    ctx.lineTo(ffX, ffY - 27 * s);
    ctx.lineTo(ffX + 4 * s, ffY - 22 * s);
    ctx.closePath();
    ctx.fill();
    // Banner on central keep
    ctx.fillStyle = "#3a4a60";
    ctx.fillRect(ffX - 0.5, ffY - 34 * s, 1.2 * s, 8 * s);
    const bfw = Math.sin(time * 3) * 2;
    ctx.fillStyle = "#5a8ac0";
    ctx.beginPath();
    ctx.moveTo(ffX + 0.8, ffY - 33 * s);
    ctx.quadraticCurveTo(
      ffX + 7 * s,
      ffY - 31 * s + bfw,
      ffX + 9 * s,
      ffY - 28 * s + bfw,
    );
    ctx.lineTo(ffX + 0.8, ffY - 26 * s);
    ctx.closePath();
    ctx.fill();
    // Snowflake emblem on banner
    ctx.fillStyle = "rgba(230,240,255,0.6)";
    ctx.beginPath();
    ctx.arc(ffX + 4.5 * s, ffY - 30 * s + bfw * 0.5, 1.2 * s, 0, Math.PI * 2);
    ctx.fill();
    // Icicles along wall edge
    for (let ic = 0; ic < 12; ic++) {
      const icx = ffX - 18 * s + ic * 3.2 * s;
      const icLen = 2 + seededRandom(ic * 3 + 1268) * 4;
      ctx.fillStyle = "rgba(180,210,240,0.35)";
      ctx.beginPath();
      ctx.moveTo(icx - 0.8, ffY - 7 * s);
      ctx.lineTo(icx, ffY - 7 * s + icLen * s);
      ctx.lineTo(icx + 0.8, ffY - 7 * s);
      ctx.closePath();
      ctx.fill();
    }
  }

  // === LANDMARK: Frist Outpost palisade (near x:1332, y:28) ===
  {
    const foX = 1340,
      foY = getLevelY(42);
    const s = 1.6;
    // Cleared ground around outpost
    ctx.fillStyle = "rgba(200,215,230,0.12)";
    ctx.beginPath();
    ctx.ellipse(foX, foY + 5 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wooden palisade ring — larger, more posts
    const palisadeR = 16 * s;
    const palisadeH = 4 * s;
    const postCount = 16;
    for (let p = 0; p < postCount; p++) {
      const pa = (p / postCount) * Math.PI * 2;
      const px = foX + Math.cos(pa) * palisadeR;
      const py = foY + Math.sin(pa) * palisadeH;
      const logH = (10 + seededRandom(p * 3 + 1332) * 5) * s;
      const lean = (seededRandom(p * 3 + 1333) - 0.5) * 0.08;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(lean);
      // Log
      ctx.fillStyle =
        seededRandom(p * 3 + 1334) > 0.5 ? "#3a2a18" : "#3e2e1c";
      ctx.fillRect(-1.2 * s, -logH, 2.4 * s, logH);
      // Bark texture
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -logH);
      ctx.stroke();
      // Pointed top
      ctx.fillStyle = "#4a3a28";
      ctx.beginPath();
      ctx.moveTo(-1.5 * s, -logH);
      ctx.lineTo(0, -logH - 3 * s);
      ctx.lineTo(1.5 * s, -logH);
      ctx.closePath();
      ctx.fill();
      // Snow cap
      ctx.fillStyle = "rgba(230,240,250,0.55)";
      ctx.beginPath();
      ctx.ellipse(0, -logH - 2.5 * s, 2 * s, 1.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Horizontal reinforcing beams
    ctx.strokeStyle = "#3a2a18";
    ctx.lineWidth = 1.2 * s;
    for (const beamH of [0.3, 0.6]) {
      ctx.beginPath();
      for (let p = 0; p <= postCount; p++) {
        const pa = (p / postCount) * Math.PI * 2;
        const px = foX + Math.cos(pa) * palisadeR;
        const py = foY + Math.sin(pa) * palisadeH;
        const logH = (10 + seededRandom((p % postCount) * 3 + 1332) * 5) * s;
        const bx = px,
          by = py - logH * beamH;
        if (p === 0) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
    // Gate opening (front, bottom of palisade)
    ctx.fillStyle = "rgba(60,50,30,0.2)";
    ctx.fillRect(foX - 4 * s, foY + palisadeH - 2 * s, 8 * s, 6 * s);
    // Central watchtower — taller, with platform
    const twGrad = ctx.createLinearGradient(foX - 3 * s, 0, foX + 3 * s, 0);
    twGrad.addColorStop(0, "#2a1a10");
    twGrad.addColorStop(0.5, "#3a2a18");
    twGrad.addColorStop(1, "#2a1a10");
    ctx.fillStyle = twGrad;
    ctx.fillRect(foX - 2.5 * s, foY - 20 * s, 5 * s, 24 * s);
    // Platform
    ctx.fillStyle = "#4a3a28";
    ctx.fillRect(foX - 6 * s, foY - 22 * s, 12 * s, 3 * s);
    // Railing on platform
    ctx.strokeStyle = "#3a2a18";
    ctx.lineWidth = 0.8 * s;
    ctx.strokeRect(foX - 6 * s, foY - 26 * s, 12 * s, 4 * s);
    // Roof over platform
    ctx.fillStyle = "#2a1a10";
    ctx.beginPath();
    ctx.moveTo(foX - 7 * s, foY - 26 * s);
    ctx.lineTo(foX, foY - 30 * s);
    ctx.lineTo(foX + 7 * s, foY - 26 * s);
    ctx.closePath();
    ctx.fill();
    // Snow on roof
    ctx.fillStyle = "rgba(230,240,252,0.5)";
    ctx.beginPath();
    ctx.moveTo(foX - 6 * s, foY - 27 * s);
    ctx.lineTo(foX, foY - 29 * s);
    ctx.lineTo(foX + 6 * s, foY - 27 * s);
    ctx.closePath();
    ctx.fill();
    // Campfire inside compound
    const cfX = foX + 6 * s,
      cfY = foY + 1 * s;
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(cfX, cfY + 2, 4 * s, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fire stones
    for (let fs = 0; fs < 6; fs++) {
      const fsa = (fs / 6) * Math.PI * 2;
      ctx.fillStyle = "#4a4040";
      ctx.beginPath();
      ctx.arc(
        cfX + Math.cos(fsa) * 2.5 * s,
        cfY + Math.sin(fsa) * 1.2 * s,
        1 * s,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Fire
    const fireH = 4 + Math.sin(time * 6) * 1.5;
    const fireGlow = ctx.createRadialGradient(
      cfX,
      cfY - 1,
      0,
      cfX,
      cfY - 1,
      6 * s,
    );
    fireGlow.addColorStop(
      0,
      `rgba(255,150,30,${0.15 + Math.sin(time * 4) * 0.05})`,
    );
    fireGlow.addColorStop(1, "rgba(255,80,10,0)");
    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(cfX, cfY - 1, 6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,120,20,${0.6 + Math.sin(time * 5) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(cfX - 1.5 * s, cfY);
    ctx.quadraticCurveTo(
      cfX + Math.sin(time * 7) * 1.5,
      cfY - fireH * s * 0.6,
      cfX,
      cfY - fireH * s,
    );
    ctx.quadraticCurveTo(
      cfX - Math.sin(time * 8) * 1.5,
      cfY - fireH * s * 0.6,
      cfX + 1.5 * s,
      cfY,
    );
    ctx.closePath();
    ctx.fill();
    // Smoke
    for (let sm = 0; sm < 3; sm++) {
      const smY =
        cfY - (fireH + 3 + sm * 4) * s - ((time * 10 + sm * 4) % 12);
      const smX = cfX + Math.sin(time * 1.5 + sm) * 2;
      ctx.fillStyle = `rgba(150,160,170,${0.12 - sm * 0.03})`;
      ctx.beginPath();
      ctx.arc(smX, smY, (1.5 + sm * 0.8) * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LANDMARK: Glacier formations (near x:1142, y:48) ===
  {
    const glX = 1125,
      glY = getLevelY(36);
    const s = 1.8;
    // Glacier base — wide ice sheet
    ctx.fillStyle = "rgba(160,200,230,0.15)";
    ctx.beginPath();
    ctx.ellipse(glX, glY + 4 * s, 24 * s, 8 * s, -0.05, 0, Math.PI * 2);
    ctx.fill();
    // Main glacier body
    const iceGrad = ctx.createLinearGradient(
      glX - 18 * s,
      glY - 22 * s,
      glX + 10 * s,
      glY + 4 * s,
    );
    iceGrad.addColorStop(0, "rgba(130,190,230,0.55)");
    iceGrad.addColorStop(0.3, "rgba(150,210,240,0.5)");
    iceGrad.addColorStop(0.7, "rgba(120,180,220,0.4)");
    iceGrad.addColorStop(1, "rgba(180,220,245,0.25)");
    ctx.fillStyle = iceGrad;
    ctx.beginPath();
    ctx.moveTo(glX - 18 * s, glY + 4 * s);
    ctx.lineTo(glX - 14 * s, glY - 8 * s);
    ctx.lineTo(glX - 10 * s, glY - 5 * s);
    ctx.lineTo(glX - 6 * s, glY - 16 * s);
    ctx.lineTo(glX - 1 * s, glY - 12 * s);
    ctx.lineTo(glX + 3 * s, glY - 22 * s);
    ctx.lineTo(glX + 8 * s, glY - 14 * s);
    ctx.lineTo(glX + 12 * s, glY - 18 * s);
    ctx.lineTo(glX + 16 * s, glY - 10 * s);
    ctx.lineTo(glX + 20 * s, glY + 4 * s);
    ctx.closePath();
    ctx.fill();
    // Crevasse lines — deep blue cracks
    ctx.strokeStyle = "rgba(60,100,160,0.3)";
    ctx.lineWidth = 0.8 * s;
    const crevasses: [number, number, number, number][] = [
      [-12, -4, -8, -14],
      [-4, -8, 0, -20],
      [4, -6, 8, -16],
      [10, -4, 14, -12],
      [-2, 0, 2, -8],
    ];
    crevasses.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(glX + x1 * s, glY + y1 * s);
      ctx.quadraticCurveTo(
        glX + (x1 + x2) * 0.5 * s + seededRandom(x1 + y1 + 1135) * 3,
        glY + (y1 + y2) * 0.5 * s,
        glX + x2 * s,
        glY + y2 * s,
      );
      ctx.stroke();
    });
    // Sheen highlights — bright reflective patches
    ctx.fillStyle = "rgba(220,240,255,0.28)";
    ctx.beginPath();
    ctx.moveTo(glX - 8 * s, glY - 10 * s);
    ctx.lineTo(glX - 4 * s, glY - 6 * s);
    ctx.lineTo(glX + 1 * s, glY - 18 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(230,245,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(glX + 6 * s, glY - 10 * s);
    ctx.lineTo(glX + 10 * s, glY - 6 * s);
    ctx.lineTo(glX + 13 * s, glY - 14 * s);
    ctx.closePath();
    ctx.fill();
    // Separate ice spires to the right
    const spireGrad = ctx.createLinearGradient(
      glX + 22 * s,
      glY - 10 * s,
      glX + 28 * s,
      glY + 2 * s,
    );
    spireGrad.addColorStop(0, "rgba(140,200,235,0.45)");
    spireGrad.addColorStop(1, "rgba(170,215,240,0.25)");
    ctx.fillStyle = spireGrad;
    ctx.beginPath();
    ctx.moveTo(glX + 22 * s, glY + 3 * s);
    ctx.lineTo(glX + 24 * s, glY - 8 * s);
    ctx.lineTo(glX + 27 * s, glY - 4 * s);
    ctx.lineTo(glX + 29 * s, glY - 12 * s);
    ctx.lineTo(glX + 32 * s, glY + 3 * s);
    ctx.closePath();
    ctx.fill();
    // Frozen waterfall effect on left side
    ctx.fillStyle = "rgba(160,210,240,0.3)";
    ctx.beginPath();
    ctx.moveTo(glX - 16 * s, glY - 4 * s);
    ctx.quadraticCurveTo(
      glX - 20 * s,
      glY + 2 * s,
      glX - 18 * s,
      glY + 6 * s,
    );
    ctx.quadraticCurveTo(
      glX - 22 * s,
      glY + 4 * s,
      glX - 20 * s,
      glY - 2 * s,
    );
    ctx.closePath();
    ctx.fill();
    // Icicles along bottom edge
    for (let ic = 0; ic < 8; ic++) {
      const icx = glX - 14 * s + ic * 4.5 * s;
      const icy = glY + 3 * s;
      const icLen = (2 + seededRandom(ic * 3 + 1135) * 4) * s;
      ctx.fillStyle = "rgba(180,215,245,0.35)";
      ctx.beginPath();
      ctx.moveTo(icx - 0.8, icy);
      ctx.lineTo(icx, icy + icLen);
      ctx.lineTo(icx + 0.8, icy);
      ctx.closePath();
      ctx.fill();
    }
    // Sparkle effect
    for (let sp = 0; sp < 4; sp++) {
      const spPhase = (time * 2 + sp * 1.5) % 3;
      const spA =
        spPhase < 1 ? spPhase * 0.3 : Math.max(0, 0.3 - (spPhase - 1) * 0.15);
      const spx = glX + (seededRandom(sp * 7 + 1140) - 0.4) * 30 * s;
      const spy = glY + (seededRandom(sp * 7 + 1141) - 0.7) * 20 * s;
      ctx.fillStyle = `rgba(255,255,255,${spA})`;
      ctx.beginPath();
      ctx.arc(spx, spy, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LANDMARK: Obsidian Throne (near x:1702, y:59) ===
  {
    const otX = 1738,
      otY = getLevelY(70);
    const s = 1.8;
    // Lava moat ring
    const moatGlow = ctx.createRadialGradient(
      otX,
      otY + 6 * s,
      16 * s,
      otX,
      otY + 6 * s,
      22 * s,
    );
    moatGlow.addColorStop(0, "rgba(200,50,10,0)");
    moatGlow.addColorStop(
      0.4,
      `rgba(220,60,15,${0.12 + Math.sin(time * 1.5) * 0.06})`,
    );
    moatGlow.addColorStop(
      0.7,
      `rgba(255,80,20,${0.18 + Math.sin(time * 2) * 0.08})`,
    );
    moatGlow.addColorStop(1, "rgba(180,30,5,0)");
    ctx.fillStyle = moatGlow;
    ctx.beginPath();
    ctx.ellipse(otX, otY + 6 * s, 22 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Obsidian platform (raised dais)
    ctx.fillStyle = "#0a0808";
    ctx.beginPath();
    ctx.ellipse(otX, otY + 6 * s, 16 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Dais steps
    for (let step = 0; step < 3; step++) {
      const stepR = (14 - step * 3) * s;
      const stepH = (5 - step * 1.2) * s;
      ctx.fillStyle = step % 2 === 0 ? "#1a1018" : "#140e14";
      ctx.beginPath();
      ctx.ellipse(otX, otY + stepH, stepR, stepR * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Skull decorations on dais edge
    for (let sk = 0; sk < 6; sk++) {
      const ska = (sk / 6) * Math.PI * 2;
      const skx = otX + Math.cos(ska) * 12 * s;
      const sky = otY + Math.sin(ska) * 4.5 * s + 2 * s;
      ctx.fillStyle = "#c8b8a0";
      ctx.beginPath();
      ctx.arc(skx, sky, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a0a08";
      ctx.beginPath();
      ctx.arc(skx - 0.5 * s, sky - 0.3 * s, 0.4 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(skx + 0.5 * s, sky - 0.3 * s, 0.4 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    // Throne back — tall, imposing, angular with spikes
    const throneGrad = ctx.createLinearGradient(
      otX - 8 * s,
      otY - 28 * s,
      otX + 8 * s,
      otY,
    );
    throneGrad.addColorStop(0, "#1a1018");
    throneGrad.addColorStop(0.3, "#2a2028");
    throneGrad.addColorStop(0.7, "#1a1418");
    throneGrad.addColorStop(1, "#0a0808");
    ctx.fillStyle = throneGrad;
    ctx.beginPath();
    ctx.moveTo(otX - 8 * s, otY + 2 * s);
    ctx.lineTo(otX - 7 * s, otY - 16 * s);
    ctx.lineTo(otX - 5 * s, otY - 22 * s);
    ctx.lineTo(otX - 3 * s, otY - 28 * s);
    ctx.lineTo(otX - 1 * s, otY - 24 * s);
    ctx.lineTo(otX, otY - 30 * s);
    ctx.lineTo(otX + 1 * s, otY - 24 * s);
    ctx.lineTo(otX + 3 * s, otY - 28 * s);
    ctx.lineTo(otX + 5 * s, otY - 22 * s);
    ctx.lineTo(otX + 7 * s, otY - 16 * s);
    ctx.lineTo(otX + 8 * s, otY + 2 * s);
    ctx.closePath();
    ctx.fill();
    // Obsidian sheen on throne
    ctx.fillStyle = "rgba(60,50,80,0.15)";
    ctx.beginPath();
    ctx.moveTo(otX - 3 * s, otY - 20 * s);
    ctx.lineTo(otX - 1 * s, otY - 10 * s);
    ctx.lineTo(otX + 2 * s, otY - 24 * s);
    ctx.closePath();
    ctx.fill();
    // Throne seat
    ctx.fillStyle = "#2a1a20";
    ctx.fillRect(otX - 6 * s, otY - 4 * s, 12 * s, 5 * s);
    // Armrests with claw tips
    for (const arm of [-1, 1]) {
      ctx.fillStyle = "#1a1018";
      ctx.fillRect(otX + arm * 7 * s, otY - 7 * s, 2.5 * s, 10 * s);
      // Claw/skull at armrest end
      ctx.fillStyle = "#2a2028";
      ctx.beginPath();
      ctx.arc(otX + arm * 8.2 * s, otY - 8 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,40,10,${0.3 + Math.sin(time * 2.5 + arm) * 0.15})`;
      ctx.beginPath();
      ctx.arc(otX + arm * 8.2 * s, otY - 8.5 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    // Glowing runes on throne back — more, pulsing
    const runeA = 0.35 + Math.sin(time * 2) * 0.15;
    ctx.fillStyle = `rgba(255,60,20,${runeA})`;
    const runePositions = [
      [0, -26],
      [-2, -20],
      [2, -20],
      [-4, -14],
      [4, -14],
      [0, -18],
      [-1, -12],
      [1, -12],
      [0, -8],
    ];
    runePositions.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(otX + rx * s, otY + ry * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
    });
    // Rune connecting lines
    ctx.strokeStyle = `rgba(255,50,15,${runeA * 0.5})`;
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(otX - 4 * s, otY - 14 * s);
    ctx.lineTo(otX, otY - 18 * s);
    ctx.lineTo(otX + 4 * s, otY - 14 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(otX, otY - 26 * s);
    ctx.lineTo(otX - 2 * s, otY - 20 * s);
    ctx.lineTo(otX + 2 * s, otY - 20 * s);
    ctx.closePath();
    ctx.stroke();
    // Pulsing power aura
    const auraGrad = ctx.createRadialGradient(
      otX,
      otY - 12 * s,
      0,
      otX,
      otY - 12 * s,
      24 * s,
    );
    auraGrad.addColorStop(
      0,
      `rgba(200,40,10,${0.1 + Math.sin(time * 1.5) * 0.05})`,
    );
    auraGrad.addColorStop(
      0.5,
      `rgba(180,30,8,${0.05 + Math.sin(time * 1.5) * 0.03})`,
    );
    auraGrad.addColorStop(1, "rgba(150,20,5,0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(otX, otY - 12 * s, 24 * s, 0, Math.PI * 2);
    ctx.fill();
    // Floating embers around throne
    for (let em = 0; em < 6; em++) {
      const emPhase = (time * 1.2 + em * 1.1) % 4;
      const emA = Math.sin((emPhase * Math.PI) / 4) * 0.5;
      const emX = otX + Math.sin(time * 0.8 + em * 1.5) * 12 * s;
      const emY = otY - 10 * s - emPhase * 6 * s;
      ctx.fillStyle = `rgba(255,100,20,${emA})`;
      ctx.beginPath();
      ctx.arc(emX, emY, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LANDMARK: Ashen Spiral geyser vents (near x:1612, y:72) ===
  {
    const gsX = 1580,
      gsY = getLevelY(61);
    const s = 1.6;
    // Scorched spiral crack pattern on ground
    ctx.strokeStyle = "rgba(180,60,10,0.15)";
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.15) {
      const spiralR = 4 * s + a * 3 * s;
      const sx = gsX + Math.cos(a) * spiralR;
      const sy = gsY + Math.sin(a) * spiralR * 0.4;
      if (a === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    // Inner glow of spiral
    ctx.strokeStyle = `rgba(255,80,20,${0.06 + Math.sin(time * 1.2) * 0.03})`;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 3; a += 0.2) {
      const spiralR = 3 * s + a * 2.5 * s;
      const sx = gsX + Math.cos(a) * spiralR;
      const sy = gsY + Math.sin(a) * spiralR * 0.4;
      if (a === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    // 6 geyser vents along the spiral
    for (let g = 0; g < 6; g++) {
      const gAngle = g * 1.2;
      const gR = 5 * s + gAngle * 2.8 * s;
      const gx = gsX + Math.cos(gAngle) * gR;
      const gy = gsY + Math.sin(gAngle) * gR * 0.4;
      // Vent mound
      ctx.fillStyle = "#2a1a08";
      ctx.beginPath();
      ctx.ellipse(gx, gy, 5 * s, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Vent hole
      ctx.fillStyle = "#1a0a05";
      ctx.beginPath();
      ctx.ellipse(gx, gy, 3.5 * s, 1.8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Rim glow
      const rimA = 0.3 + Math.sin(time * 3 + g * 1.2) * 0.15;
      ctx.strokeStyle = `rgba(255,80,20,${rimA})`;
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 4 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Fire/steam burst — staggered timing
      const burstPhase = (time * 1.8 + g * 1.3) % 5;
      if (burstPhase < 2) {
        const burstH = burstPhase * 12 * s;
        const burstA = 0.4 * (1 - burstPhase / 2);
        const burstW = (2 + burstPhase * 1.5) * s;
        // Fire core
        ctx.fillStyle = `rgba(255,180,50,${burstA})`;
        ctx.beginPath();
        ctx.moveTo(gx - burstW * 0.5, gy);
        ctx.quadraticCurveTo(
          gx + Math.sin(time * 6 + g) * 2 * s,
          gy - burstH * 0.5,
          gx,
          gy - burstH,
        );
        ctx.quadraticCurveTo(
          gx - Math.sin(time * 7 + g) * 2 * s,
          gy - burstH * 0.5,
          gx + burstW * 0.5,
          gy,
        );
        ctx.closePath();
        ctx.fill();
        // Outer fire
        ctx.fillStyle = `rgba(255,80,20,${burstA * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(gx - burstW, gy);
        ctx.quadraticCurveTo(
          gx + Math.sin(time * 5 + g) * 3 * s,
          gy - burstH * 0.4,
          gx,
          gy - burstH * 0.8,
        );
        ctx.quadraticCurveTo(
          gx - Math.sin(time * 5.5 + g) * 3 * s,
          gy - burstH * 0.4,
          gx + burstW,
          gy,
        );
        ctx.closePath();
        ctx.fill();
        // Sparks
        for (let sp = 0; sp < 3; sp++) {
          const spY = gy - burstH * (0.3 + sp * 0.2);
          const spX = gx + Math.sin(time * 8 + sp + g) * 4 * s;
          ctx.fillStyle = `rgba(255,200,80,${burstA * 0.8})`;
          ctx.beginPath();
          ctx.arc(spX, spY, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Residual heat haze
      const hazeA = 0.04 + Math.sin(time * 1.5 + g * 0.8) * 0.02;
      ctx.fillStyle = `rgba(200,100,40,${hazeA})`;
      ctx.beginPath();
      ctx.ellipse(gx, gy - 6 * s, 5 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LANDMARK: Caldera Basin vent (near x:1592, y:37) ===
  {
    const cbX = 1584,
      cbY = getLevelY(30);
    const s = 1.7;
    // Outer rocky rim
    ctx.fillStyle = "#2a1a08";
    ctx.beginPath();
    ctx.ellipse(cbX, cbY + 2 * s, 20 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Rocky rim detail — jagged boulders around edge
    for (let rb = 0; rb < 10; rb++) {
      const rba = (rb / 10) * Math.PI * 2;
      const rbx = cbX + Math.cos(rba) * 17 * s;
      const rby = cbY + Math.sin(rba) * 6.5 * s + 2 * s;
      const rbs = (2 + seededRandom(rb * 5 + 1585) * 3) * s;
      ctx.fillStyle =
        seededRandom(rb * 5 + 1586) > 0.5 ? "#3a2a14" : "#2a1a0c";
      ctx.beginPath();
      ctx.ellipse(
        rbx,
        rby,
        rbs,
        rbs * 0.6,
        seededRandom(rb * 5 + 1587) * 1.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Inner caldera depression
    ctx.fillStyle = "#1a0a04";
    ctx.beginPath();
    ctx.ellipse(cbX, cbY + 1 * s, 14 * s, 5.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Lava surface
    const lavaGrad = ctx.createRadialGradient(
      cbX - 2 * s,
      cbY,
      0,
      cbX,
      cbY,
      12 * s,
    );
    lavaGrad.addColorStop(
      0,
      `rgba(255,120,30,${0.4 + Math.sin(time * 1.8) * 0.15})`,
    );
    lavaGrad.addColorStop(
      0.3,
      `rgba(255,80,20,${0.3 + Math.sin(time * 2) * 0.1})`,
    );
    lavaGrad.addColorStop(
      0.7,
      `rgba(200,40,10,${0.15 + Math.sin(time * 1.8) * 0.08})`,
    );
    lavaGrad.addColorStop(1, "rgba(120,20,5,0)");
    ctx.fillStyle = lavaGrad;
    ctx.beginPath();
    ctx.ellipse(cbX, cbY + 1 * s, 12 * s, 4.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Dark cooled crust patches on lava
    for (let cr = 0; cr < 5; cr++) {
      const crx = cbX + (seededRandom(cr * 7 + 1590) - 0.5) * 16 * s;
      const cry = cbY + (seededRandom(cr * 7 + 1591) - 0.5) * 4 * s;
      ctx.fillStyle = `rgba(30,10,5,${0.3 + Math.sin(time * 0.8 + cr * 1.5) * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(
        crx,
        cry,
        (3 + seededRandom(cr * 7 + 1592) * 3) * s,
        (1 + seededRandom(cr * 7 + 1593) * 1.5) * s,
        seededRandom(cr * 7 + 1594),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Bubbles in lava
    for (let bub = 0; bub < 4; bub++) {
      const bubPhase = (time * 1.2 + bub * 1.3) % 2.5;
      const bubA = Math.sin((bubPhase * Math.PI) / 2.5) * 0.35;
      const bubR = (1.5 + bubPhase * 1.5) * s;
      const bubX = cbX + (seededRandom(bub * 3 + 1595) - 0.5) * 14 * s;
      const bubY = cbY + (seededRandom(bub * 3 + 1596) - 0.5) * 4 * s;
      ctx.fillStyle = `rgba(255,150,40,${bubA})`;
      ctx.beginPath();
      ctx.arc(bubX, bubY, bubR, 0, Math.PI * 2);
      ctx.fill();
    }
    // Heat shimmer / steam rising
    for (let st = 0; st < 4; st++) {
      const stPhase = (time * 0.6 + st * 0.8) % 3;
      const stA = Math.max(0, 0.12 - stPhase * 0.04);
      const stx =
        cbX +
        (seededRandom(st * 5 + 1598) - 0.5) * 12 * s +
        Math.sin(time * 1.2 + st) * 3;
      const sty = cbY - 4 * s - stPhase * 8 * s;
      ctx.fillStyle = `rgba(180,100,50,${stA})`;
      ctx.beginPath();
      ctx.ellipse(
        stx,
        sty,
        (3 + stPhase * 2) * s,
        (1.5 + stPhase) * s,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Ambient glow
    const ambGlow = ctx.createRadialGradient(cbX, cbY, 0, cbX, cbY, 22 * s);
    ambGlow.addColorStop(
      0,
      `rgba(255,80,20,${0.06 + Math.sin(time * 1.5) * 0.03})`,
    );
    ambGlow.addColorStop(1, "rgba(200,40,10,0)");
    ctx.fillStyle = ambGlow;
    ctx.beginPath();
    ctx.arc(cbX, cbY, 22 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}
