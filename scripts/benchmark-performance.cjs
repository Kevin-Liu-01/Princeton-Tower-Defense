/* Repeatable CPU/canvas benchmark. Run with: node scripts/benchmark-performance.cjs */
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { createCanvas } = require("@napi-rs/canvas");
const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
require("./register-typescript.cjs");
global.document = { createElement: () => createCanvas(1, 1) };
const { renderEnemy } = require(
  path.join(root, "src/app/rendering/enemies/renderEnemy.ts")
);
const { ENEMY_DATA } = require(path.join(root, "src/app/constants/enemies.ts"));
const { refreshShadowCache, setPerformanceSettings } = require(
  path.join(root, "src/app/rendering/performance.ts")
);
setPerformanceSettings({ disableShadows: true });
refreshShadowCache();
const canvas = createCanvas(1400, 900);
const ctx = canvas.getContext("2d");
const types = ["frosh", "sophomore", "junior", "senior", "archer", "mage"];
const enemies = Array.from({ length: 180 }, (_, i) => {
  const type = types[i % types.length];
  return {
    id: `enemy-${i}`,
    type,
    hp: ENEMY_DATA[type].hp,
    maxHp: ENEMY_DATA[type].hp,
    pathIndex: i % 5,
    progress: 0.5,
    spawnProgress: 1,
    damageFlash: 0,
    facingRight: i % 2 === 0,
    laneOffset: 0,
    speed: 1,
  };
});
function measure(label, attack) {
  const samples = [];
  for (let frame = 0; frame < 90; frame++) {
    const now = 10_000 + (frame * 1000) / 60;
    ctx.clearRect(0, 0, 1400, 900);
    const start = performance.now();
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      enemy.lastTroopAttack = attack && i % 4 === 0 ? now - 150 : 0;
      renderEnemy(
        ctx,
        enemy,
        1400,
        900,
        1,
        "poe",
        now,
        "grassland",
        { x: (i % 20) * 5, y: Math.floor(i / 20) * 5 },
        0.8
      );
    }
    if (frame >= 10) {
      samples.push(performance.now() - start);
    }
  }
  samples.sort((a, b) => a - b);
  return {
    label,
    enemies: enemies.length,
    medianMs: +samples[Math.floor(samples.length / 2)].toFixed(2),
    p95Ms: +samples[Math.ceil(samples.length * 0.95) - 1].toFixed(2),
  };
}
console.log(
  JSON.stringify(
    {
      root,
      renderer:
        "CPU canvas; shadows disabled; 60 Hz timestamps; not browser FPS",
      scenarios: [
        measure("Marching wave", false),
        measure("25% attacking", true),
      ],
    },
    null,
    2
  )
);
