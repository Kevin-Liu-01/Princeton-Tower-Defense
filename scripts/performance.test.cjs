const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createCanvas } = require("@napi-rs/canvas");
require("./register-typescript.cjs");
const {
  buildEnemySpatialHash,
} = require("../src/app/game/enemySpatialHash.ts");
const {
  getPrioritizedEnemiesInRange,
} = require("../src/app/game/targeting.ts");
const {
  drawCachedEnemySprite,
  clearEnemySpriteCache,
} = require("../src/app/rendering/enemies/enemySpriteCache.ts");
const {
  refreshShadowCache,
  setPerformanceSettings,
} = require("../src/app/rendering/performance.ts");

const {
  drawEnemySprite,
} = require("../src/app/rendering/enemies/renderEnemy.ts");
const { ENEMY_DATA } = require("../src/app/constants/enemies.ts");
const predicate = (e) => e.pathIndex % 2 === 0;

const enemies = Array.from({ length: 600 }, (_, i) => ({
  id: `enemy-${i}`,
  hp: i % 17 === 0 ? 0 : 20,
  dead: i % 19 === 0,
  pos: { x: ((i * 97) % 1800) - 900, y: ((i * 163) % 1800) - 900 },
  pathIndex: i % 12,
  progress: (i % 100) / 100,
}));
const getPos = (enemy) => enemy.pos;

test("spatial queries match brute force across negative coordinates and cell boundaries", () => {
  const hash = buildEnemySpatialHash(enemies, getPos);
  for (const x of [-450, -150, -1, 0, 149, 150, 450]) {
    for (const range of [0, 1, 35, 120, 150, 151, 500]) {
      const origin = { x, y: x + 17 };
      const distance = (e) => (e.pos.x - x) ** 2 + (e.pos.y - origin.y) ** 2;
      const expected = enemies.filter(
        (e) => !e.dead && e.hp > 0 && predicate(e) && distance(e) <= range ** 2
      );
      assert.deepEqual(
        hash
          .getInRange(origin, range, predicate)
          .map((e) => e.id)
          .toSorted(),
        expected.map((e) => e.id).toSorted()
      );
      const closest = hash.getClosest(origin, range, predicate);
      if (expected.length === 0) {
        assert.equal(closest, null);
      } else {
        assert.equal(distance(closest), Math.min(...expected.map(distance)));
      }
    }
  }
});

test("limited targeting preserves priority and air-target predicates while stopping early", () => {
  const sorted = [...enemies].toSorted(
    (a, b) => b.pathIndex + b.progress - a.pathIndex - a.progress
  );
  const origin = { x: 0, y: 0 };
  const all = getPrioritizedEnemiesInRange(
    origin,
    1500,
    sorted,
    getPos,
    Infinity,
    predicate
  );
  let positionsRead = 0;
  const result = getPrioritizedEnemiesInRange(
    origin,
    1500,
    sorted,
    (e) => {
      positionsRead++;
      return getPos(e);
    },
    1,
    predicate
  );
  assert.deepEqual(result, all.slice(0, 1));
  assert.equal(positionsRead, 1);
  assert.deepEqual(
    getPrioritizedEnemiesInRange(origin, 1500, sorted, getPos, 3, predicate),
    all.slice(0, 3)
  );
});

test("enemy artwork reuses buffers, updates frames, preserves alpha, and invalidates quality/zoom", () => {
  const allocated = [];
  global.document = {
    createElement: () => {
      const c = createCanvas(1, 1);
      allocated.push(c);
      return c;
    },
  };
  clearEnemySpriteCache();
  setPerformanceSettings({ disableShadows: false, shadowQualityMultiplier: 1 });
  refreshShadowCache();
  const ctx = createCanvas(160, 160).getContext("2d");
  let draws = 0;
  const draw = (c, x, y) => {
    draws++;
    c.fillStyle = "red";
    c.fillRect(x - 5, y - 5, 10, 10);
  };
  const blit = (time = 1, zoom = 1) =>
    drawCachedEnemySprite(
      ctx,
      80,
      80,
      "frosh",
      10,
      zoom,
      time,
      "grassland",
      draw
    );
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 100; i++) {
    ctx.clearRect(0, 0, 160, 160);
    blit();
  }
  assert.equal(draws, 1);
  assert.equal(allocated.length, 1);
  assert.ok(Math.abs(ctx.getImageData(80, 80, 1, 1).data[3] - 128) <= 1);
  blit(1.04);
  assert.equal(draws, 2);
  assert.equal(allocated.length, 1);
  blit(1.04, 1.1);
  assert.equal(draws, 3);
  setPerformanceSettings({ disableShadows: true });
  refreshShadowCache();
  blit(1.04, 1.1);
  assert.equal(draws, 4);
  for (let i = 0; i < 160; i++) {
    blit(2, i + 2);
  }
  // Large Retina sprites exercise the pixel budget independently of entry count.
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  for (let i = 0; i < 12; i++) {
    drawCachedEnemySprite(
      ctx,
      40,
      40,
      `large-${i}`,
      100,
      1,
      2,
      "grassland",
      draw
    );
  }
  const pixels = allocated.reduce((sum, c) => sum + c.width * c.height, 0);
  assert.ok(pixels <= 4 * 1024 * 1024);
  clearEnemySpriteCache();
  assert.ok(allocated.every((c) => c.width === 1 && c.height === 1));
});

test("all enemy body artwork fits inside the shared sprite bounds", () => {
  const ctx = createCanvas(1024, 1024).getContext("2d");
  setPerformanceSettings({ disableShadows: true });
  refreshShadowCache();
  for (const [type, data] of Object.entries(ENEMY_DATA)) {
    ctx.clearRect(0, 0, 1024, 1024);
    drawEnemySprite(
      ctx,
      512,
      512,
      data.size,
      type,
      data.color,
      0,
      1,
      data.flying,
      1,
      0,
      "grassland"
    );
    const padding = Math.ceil(data.size * 4);
    const strips = [
      [0, 0, 1024, 512 - padding],
      [0, 512 + padding, 1024, 512 - padding],
      [0, 512 - padding, 512 - padding, padding * 2],
      [512 + padding, 512 - padding, 512 - padding, padding * 2],
    ];
    for (const [x, y, width, height] of strips) {
      if (width <= 0 || height <= 0) {
        continue;
      }
      const pixels = ctx.getImageData(x, y, width, height).data;
      for (let i = 3; i < pixels.length; i += 4) {
        assert.ok(pixels[i] <= 2, `${type} artwork exceeds cached bounds`);
      }
    }
  }
});
