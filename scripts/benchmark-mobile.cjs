/* Native canvas workload, not a phone FPS estimate. Compare identical map scenes. */
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { createCanvas } = require("@napi-rs/canvas");
require("./register-typescript.cjs");
const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
global.window = {
  devicePixelRatio: 3,
  innerWidth: 390,
  matchMedia: () => ({ matches: true }),
};
const allocated = [];
global.document = {
  createElement: () => {
    const canvas = createCanvas(1, 1);
    canvas.style = {};
    allocated.push(canvas);
    return canvas;
  },
};
const { drawWorldMapCanvas } = require(
  path.join(
    root,
    "src/app/components/menus/world-map/worldMapCanvasRenderer.ts"
  )
);
const ref = (current) => ({ current });
const canvas = document.createElement("canvas");
const params = {
  canvasRef: ref(canvas),
  mapHeight: 760,
  containerWidth: 390,
  hoveredLevel: null,
  selectedLevel: null,
  levelStars: {},
  unlockedMaps: ["poe"],
  imageCache: ref({}),
  lastCanvasSizeRef: ref({ w: 0, h: 0 }),
  animTimeRef: ref(0),
  isMobile: true,
  staticBgCache: ref({}),
  decorationCache: ref({}),
  fogOverlayCache: ref({}),
  pathCache: ref({}),
  nodeCache: ref({}),
  atmosphereCache: ref({}),
  paintKeyRef: ref(""),
  heroType: "tiger",
  heroMapPos: ref({ x: 160, y: 500 }),
  heroMoving: ref(false),
  heroFacingRight: ref(true),
};
const samples = [];
for (let i = 0; i < 60; i++) {
  params.animTimeRef.current = i / 30;
  const start = performance.now();
  drawWorldMapCanvas(params);
  if (i > 3) {
    samples.push(performance.now() - start);
  }
}
samples.sort((a, b) => a - b);
console.log(
  JSON.stringify(
    {
      frames: samples.length,
      averageMs: samples.reduce((a, b) => a + b, 0) / samples.length,
      p95Ms: samples[Math.ceil(samples.length * 0.95) - 1],
      backingPixels: allocated.reduce((n, c) => n + c.width * c.height, 0),
      canvasCount: allocated.length,
    },
    null,
    2
  )
);
