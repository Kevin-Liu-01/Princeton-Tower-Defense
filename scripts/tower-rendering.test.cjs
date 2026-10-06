const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createCanvas } = require("@napi-rs/canvas");
require("./register-typescript.cjs");
const {
  drawCachedTowerSprite,
  clearTowerSpriteCache,
  canCacheTowerSprite,
} = require("../src/app/rendering/towers/towerSpriteCache.ts");
const { drawTowerSprite } = require("../src/app/rendering/towers/index.ts");
const { TOWER_COLORS } = require("../src/app/constants/index.ts");
const {
  setPerformanceSettings,
  refreshShadowCache,
} = require("../src/app/rendering/performance.ts");
setPerformanceSettings({ disableShadows: true });
refreshShadowCache();
const {
  renderLibraryTower,
} = require("../src/app/rendering/towers/library.ts");
const { renderClubTower } = require("../src/app/rendering/towers/club.ts");
const {
  renderStationTower,
} = require("../src/app/rendering/towers/station.ts");
const { renderMortarTower } = require("../src/app/rendering/towers/mortar.ts");
const towerRenderers = {
  library: renderLibraryTower,
  club: renderClubTower,
  station: renderStationTower,
  mortar: renderMortarTower,
};
const types = ["cannon", "library", "lab", "arch", "club", "station", "mortar"];
const variants = [[1], [2], [3], [4, "A"], [4, "B"]];

function bounds(canvas) {
  const { width, height } = canvas;
  const { data } = canvas.getContext("2d").getImageData(0, 0, width, height);
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

test("tower cache preserves exact zoom, animates at 30Hz, retains Retina resolution and bounds memory", () => {
  const original = global.document;
  const canvases = [];
  global.document = {
    createElement: () => {
      const canvas = createCanvas(1, 1);
      canvases.push(canvas);
      return canvas;
    },
  };
  const ctx = createCanvas(500, 500).getContext("2d");
  let draws = 0;
  const draw = (target, x, y) => {
    draws++;
    target.fillStyle = "red";
    target.fillRect(x - 5, y - 160, 10, 160);
  };
  const render = (zoom, time = 1) =>
    drawCachedTowerSprite(
      ctx,
      250,
      250,
      "library",
      4,
      "A",
      0,
      zoom,
      time,
      draw
    );
  try {
    render(1);
    render(1);
    assert.equal(draws, 1);
    render(1, 1.04);
    assert.equal(draws, 2);
    assert.equal(canvases.length, 1);
    render(1.01);
    assert.equal(draws, 3);
    assert.equal(canvases.length, 2);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    render(1);
    assert.equal(canvases.at(-1).width, 512);
    for (let i = 0; i < 100; i++) {
      render(0.5 + i / 40);
    }
    assert.ok(
      canvases.reduce((sum, canvas) => sum + canvas.width * canvas.height, 0) <=
        8 * 1024 * 1024 + canvases.length
    );
    clearTowerSpriteCache();
    assert.ok(
      canvases.every((canvas) => canvas.width === 1 && canvas.height === 1)
    );
  } finally {
    clearTowerSpriteCache();
    global.document = original;
  }
});

test("attacks, spawning, selection markers and arch portal anchors bypass shared artwork", () => {
  const tower = { type: "station", lastAttack: 0 };
  const now = 10_000;
  assert.equal(canCacheTowerSprite(tower, now), true);
  for (const state of [
    { lastAttack: now - 100 },
    { spawnEffect: 500 },
    { selected: true },
    { showSpawnMarkers: true },
    { type: "arch" },
    { type: "cannon" },
    { type: "lab" },
  ]) {
    assert.equal(
      canCacheTowerSprite({ ...tower, ...state }, now),
      false,
      JSON.stringify(state)
    );
  }
});

test("every tower portrait and upgrade fits its nominal frame throughout idle animation", () => {
  const canvas = createCanvas(200, 200),
    ctx = canvas.getContext("2d");
  for (const type of types) {
    for (const [level, upgrade] of variants) {
      for (const time of [0, 1, 3.7]) {
        ctx.clearRect(0, 0, 200, 200);
        drawTowerSprite(ctx, 100, 100, 100, type, level, upgrade, time);
        const b = bounds(canvas);
        assert.ok(
          b.minX >= 50 && b.minY >= 50 && b.maxX < 150 && b.maxY < 150,
          `${type} ${level}${upgrade ?? ""} ${time}: ${JSON.stringify(b)}`
        );
      }
    }
  }
});

test("cached tower envelopes contain full-size upgrade artwork including roofs and smoke", () => {
  const canvas = createCanvas(650, 650),
    ctx = canvas.getContext("2d");
  for (const type of ["library", "club", "station", "mortar"]) {
    const render = towerRenderers[type];
    for (const [level, upgrade] of variants) {
      for (const time of [0, 2.4]) {
        ctx.clearRect(0, 0, 650, 650);
        render(
          ctx,
          { x: 325, y: 325 },
          { id: "bounds", type, level, upgrade, lastAttack: 0, rotation: 2.4 },
          1,
          time,
          TOWER_COLORS[type]
        );
        const b = bounds(canvas);
        assert.ok(
          b.minX > 325 - 128 &&
            b.maxX < 325 + 128 &&
            b.minY > 325 - 224 &&
            b.maxY < 325 + 96,
          `${type} ${level}${upgrade ?? ""}: ${JSON.stringify(b)}`
        );
      }
    }
  }
});
