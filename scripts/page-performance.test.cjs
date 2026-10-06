const test = require("node:test");
const assert = require("node:assert/strict");
require("./register-typescript.cjs");
const {
  prepareLayer,
} = require("../src/app/components/menus/world-map/rendering/prepareLayer.ts");
const {
  preloadImagesWithProgress,
} = require("../src/app/hooks/useImagePreloader.ts");

test("map layers reuse dimensions and reset drawing state on every redraw", () => {
  let writes = 0,
    resets = 0,
    width = 100,
    height = 50;
  const canvas = {
    get width() {
      return width;
    },
    set width(v) {
      width = v;
      writes++;
    },
    get height() {
      return height;
    },
    set height(v) {
      height = v;
      writes++;
    },
    getContext: () => ({ reset: () => resets++ }),
  };
  for (let i = 0; i < 60; i++) {
    prepareLayer(canvas, 100, 50);
  }
  assert.equal(writes, 0);
  assert.equal(resets, 60);
  prepareLayer(canvas, 200, 100);
  assert.equal(writes, 2);
  assert.equal(canvas.width, 200);
  assert.equal(canvas.height, 100);
});

test("image requests deduplicate URLs, share in-flight decodes, and reuse successful assets", async () => {
  const original = global.Image;
  let decodes = 0;
  global.Image = class {
    complete = true;
    naturalWidth = 20;
    async decode() {
      decodes++;
      await new Promise((resolve) => {
        setTimeout(resolve, 5);
      });
    }
  };
  try {
    const progress = [];
    await Promise.all([
      preloadImagesWithProgress(["one", "one", "two"], (l, t) =>
        progress.push([l, t])
      ),
      preloadImagesWithProgress(["one"], () => {}),
    ]);
    assert.equal(decodes, 2);
    assert.deepEqual(progress.at(-1), [2, 2]);
    await preloadImagesWithProgress(["one", "two"], () => {});
    assert.equal(decodes, 2);
  } finally {
    global.Image = original;
  }
});

test("failed images advance progress and can be retried; empty lists complete", async () => {
  const original = global.Image;
  let attempts = 0;
  let final;
  global.Image = function FailedImage() {
    return {
      decode: () => {
        attempts++;
        return Promise.reject(new Error("missing image"));
      },
    };
  };
  try {
    await preloadImagesWithProgress(["missing"], (l, t) => (final = [l, t]));
    assert.deepEqual(final, [1, 1]);
    await preloadImagesWithProgress(["missing"], () => {});
    assert.equal(attempts, 2);
    await preloadImagesWithProgress([], (l, t) => (final = [l, t]));
    assert.deepEqual(final, [0, 0]);
  } finally {
    global.Image = original;
  }
});
