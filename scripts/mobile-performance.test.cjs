const assert = require("node:assert/strict");
const { test } = require("node:test");
require("./register-typescript.cjs");
const { startGameLoop } = require("../src/app/hooks/runtime/gameLoop.ts");
const ref = (current) => ({ current });
const {
  needsMobileBudget,
  getBattleResolutionCap,
  createFramePacer,
} = require("../src/app/rendering/deviceProfile.ts");

test("phones, tablets and constrained devices receive a smaller render budget", () => {
  assert.equal(
    needsMobileBudget({ coarsePointer: true, narrowScreen: false, cores: 8 }),
    true
  );
  assert.equal(
    needsMobileBudget({ coarsePointer: false, narrowScreen: true, cores: 8 }),
    true
  );
  assert.equal(
    needsMobileBudget({ coarsePointer: false, narrowScreen: false, cores: 4 }),
    true
  );
  assert.equal(
    needsMobileBudget({
      coarsePointer: false,
      narrowScreen: false,
      cores: 8,
      memoryGb: 4,
    }),
    true
  );
  assert.equal(
    needsMobileBudget({
      coarsePointer: false,
      narrowScreen: false,
      cores: 8,
      memoryGb: 16,
    }),
    false
  );
  assert.deepEqual(
    [2, 1.75, 1.5].map((cap) => getBattleResolutionCap(cap, true)),
    [1.5, 1.25, 1]
  );
  assert.equal(getBattleResolutionCap(2, false), 2);
});

test("60Hz pacing preserves elapsed time on 60, 90, 120 and 144Hz screens", () => {
  for (const hz of [60, 90, 120, 144]) {
    const pacer = createFramePacer(60);
    let draws = 0,
      last = 0,
      elapsed = 0;
    for (let frame = 0; frame < hz * 10; frame++) {
      const now = (frame * 1000) / hz;
      if (pacer.shouldDraw(now)) {
        draws++;
        elapsed += now - last;
        last = now;
      }
    }
    assert.ok(draws >= 598 && draws <= 601, `${hz}Hz: ${draws} frames`);
    assert.ok(elapsed > 9950 && elapsed <= 10_000);
  }
});

test("a long stall does not burst catch-up frames; resuming starts immediately", () => {
  const pacer = createFramePacer(60);
  assert.equal(pacer.shouldDraw(0), true);
  assert.equal(pacer.shouldDraw(8), false);
  assert.equal(pacer.shouldDraw(30_000), true);
  assert.equal(pacer.shouldDraw(30_001), false);
  pacer.reset();
  assert.equal(pacer.shouldDraw(30_002), true);
});

test("battle loop stops in the background and resumes without a simulation jump", () => {
  const oldWindow = global.window,
    oldDocument = global.document,
    oldRaf = global.requestAnimationFrame,
    oldCancel = global.cancelAnimationFrame;
  const callbacks = new Map(),
    listeners = new Map();
  let nextId = 0;
  const updates = [];
  global.window = { innerWidth: 390, matchMedia: () => ({ matches: true }) };
  global.document = {
    hidden: false,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  global.requestAnimationFrame = (fn) => {
    callbacks.set(++nextId, fn);
    return nextId;
  };
  global.cancelAnimationFrame = (id) => callbacks.delete(id);
  const refs = {
    lastTimeRef: ref(0),
    gameLoopRef: ref(undefined),
    rollingFrameMsRef: ref(16.7),
    qualityLastChangedAtRef: ref(0),
    qualityThresholdSustainedSinceRef: ref(0),
    qualityCooldownMsRef: ref(2000),
    renderQualityRef: ref("medium"),
    gameSpeedRef: ref(1),
    devPerfEnabledRef: ref(false),
    devPerfLastPublishedAtRef: ref(0),
    devPerfUpdateMsRef: ref(0),
    devPerfRenderMsRef: ref(0),
    entityCountsRef: ref({}),
    updateGameRef: ref((dt) => updates.push(dt)),
    renderRef: ref(() => {}),
    flushParticleQueueRef: ref(() => {}),
  };
  const tick = (now) => {
    const entry = callbacks.entries().next().value;
    assert.ok(entry);
    callbacks.delete(entry[0]);
    entry[1](now);
  };
  let cleanup;
  try {
    cleanup = startGameLoop(
      refs,
      () => {},
      () => {}
    );
    for (let i = 0; i < 120; i++) {
      tick(100 + (i * 1000) / 120);
    }
    assert.equal(updates.length, 60);
    assert.ok(updates.slice(1).every((dt) => Math.abs(dt - 1000 / 60) < 0.01));
    refs.gameSpeedRef.current = 0;
    const pausedUpdates = updates.length;
    tick(1200);
    assert.equal(updates.length, pausedUpdates);
    refs.gameSpeedRef.current = 1;
    document.hidden = true;
    listeners.get("visibilitychange")();
    assert.equal(callbacks.size, 0);
    document.hidden = false;
    listeners.get("visibilitychange")();
    tick(60_000);
    assert.equal(updates.at(-1), 0);
    cleanup();
    cleanup = undefined;
    assert.equal(callbacks.size, 0);
    assert.equal(listeners.size, 0);
  } finally {
    cleanup?.();
    global.window = oldWindow;
    global.document = oldDocument;
    global.requestAnimationFrame = oldRaf;
    global.cancelAnimationFrame = oldCancel;
  }
});
