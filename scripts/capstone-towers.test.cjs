const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createCanvas } = require("@napi-rs/canvas");
require("./register-typescript.cjs");
const { drawTowerSprite } = require("../src/app/rendering/towers/index.ts");
const {
  getTowerGarrison,
  advanceSummonRespawns,
} = require("../src/app/game/towerGarrison.ts");
const {
  issueTroopFormationMoveCommandImpl,
} = require("../src/app/hooks/runtime/unitCommandHelpers.ts");
const { getTroopMoveInfo, gridToWorld } = require("../src/app/utils/index.ts");
const { TOWER_STATS } = require("../src/app/constants/towerStats.ts");
const tower = {
  id: "guardian",
  type: "library",
  level: 4,
  upgrade: "A",
  capstone: true,
  pos: { x: 12, y: 7 },
  lastAttack: 0,
  rotation: 0,
};

test("all 14 final models are distinct, animate, and fit their portraits", () => {
  const fingerprints = new Set();
  for (const type of Object.keys(TOWER_STATS)) {
    for (const upgrade of ["A", "B"]) {
      const frames = [];
      for (const time of [0, 0.7, 2.3]) {
        const canvas = createCanvas(180, 180);
        const ctx = canvas.getContext("2d");
        drawTowerSprite(ctx, 90, 90, 160, type, 4, upgrade, time, true);
        const { data } = ctx.getImageData(0, 0, 180, 180);
        let pixels = 0;
        for (let y = 0; y < 180; y++) {
          for (let x = 0; x < 180; x++) {
            if (data[(y * 180 + x) * 4 + 3] > 8) {
              pixels++;
              assert.ok(
                x > 1 && x < 178 && y > 1 && y < 178,
                `${type}${upgrade} clips at ${x},${y}`
              );
            }
          }
        }
        assert.ok(pixels > 400, `${type}${upgrade} is visible`);
        frames.push(canvas.toBuffer("image/png").toString("base64"));
      }
      assert.notEqual(frames[0], frames[1], `${type}${upgrade} must animate`);
      fingerprints.add(frames[0]);
    }
  }
  assert.equal(fingerprints.size, 14);
});

test("golem and knight use the normal tower rally range and persist relocation", () => {
  for (const type of ["library", "club", "station"]) {
    const owner = { ...tower, type, upgrade: type === "club" ? "B" : "A" };
    const profile = getTowerGarrison(owner);
    assert.ok(profile);
    let troops = [
      {
        id: "unit",
        ownerId: owner.id,
        type: profile.type,
        pos: { x: 10, y: 20 },
        spawnPoint: { x: 10, y: 20 },
        selected: true,
      },
    ];
    let towers = [owner];
    const destination = { x: 140, y: 220 };
    const moveInfo = getTroopMoveInfo(troops[0], towers);
    assert.deepEqual(moveInfo.anchorPos, gridToWorld(owner.pos));
    assert.equal(moveInfo.moveRadius, profile.moveRadius);
    issueTroopFormationMoveCommandImpl(
      owner.id,
      destination,
      towers,
      (fn) => {
        troops = fn(troops);
      },
      () => {},
      (fn) => {
        towers = fn(towers);
      }
    );
    assert.deepEqual(towers[0].rallyPoint, destination);
    assert.deepEqual(troops[0].spawnPoint, troops[0].targetPos);
    assert.deepEqual(troops[0].userTargetPos, troops[0].targetPos);
    assert.equal(troops[0].moving, true);
    assert.equal(troops[0].selected, false);
  }
});

test("summon cooldown consumes simulation time and never goes negative", () => {
  const pending = {
    ...tower,
    pendingRespawns: [
      {
        slot: 0,
        timer: 14_000,
        troopType: "campus_golem",
        respawnPos: { x: 2, y: 3 },
      },
    ],
  };
  assert.equal(advanceSummonRespawns(pending, 0)[0].timer, 14_000);
  assert.equal(advanceSummonRespawns(pending, 3000)[0].timer, 11_000);
  assert.equal(advanceSummonRespawns(pending, 20_000)[0].timer, 0);
  assert.equal(pending.pendingRespawns[0].timer, 14_000);
  const golem = getTowerGarrison(tower);
  assert.equal(golem.hp, 4200);
  assert.equal(golem.damage, 105);
  assert.equal(golem.spawnInterval, 14_000);
  assert.equal(getTowerGarrison({ ...tower, capstone: false }), null);
});
