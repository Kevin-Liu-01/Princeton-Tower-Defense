const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { createCanvas } = require("@napi-rs/canvas");
require("./register-typescript.cjs");
const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
global.window = { devicePixelRatio: 1 };
global.document = { createElement: () => createCanvas(1, 1) };
const { drawWorldMapCanvas } = require(
  path.join(
    root,
    "src/app/components/menus/world-map/worldMapCanvasRenderer.ts"
  )
);
const ref = (current) => ({ current });
const canvas = createCanvas(1, 1);
canvas.style = {};
const cache = () => ref({ canvas: null, w: 0, h: 0, timeBucket: -1 });
const params = {
  canvasRef: ref(canvas),
  mapHeight: 650,
  containerWidth: 1400,
  hoveredLevel: null,
  selectedLevel: null,
  levelStars: {},
  unlockedMaps: ["poe"],
  imageCache: ref({}),
  lastCanvasSizeRef: ref({ w: 0, h: 0 }),
  animTimeRef: ref(0),
  staticBgCache: cache(),
  decorationCache: ref({
    groundCanvas: null,
    structureCanvas: null,
    w: 0,
    h: 0,
    timeBucket: -1,
  }),
  fogOverlayCache: cache(),
  pathCache: cache(),
  nodeCache: cache(),
  atmosphereCache: cache(),
  paintKeyRef: ref(""),
};
const samples = [];
for (let frame = 0; frame < 100; frame++) {
  params.animTimeRef.current = frame / 60;
  const t = performance.now();
  drawWorldMapCanvas(params);
  if (frame > 9) {
    samples.push(performance.now() - t);
  }
}
const total = samples.reduce((a, b) => a + b, 0);
samples.sort((a, b) => a - b);
console.log(
  JSON.stringify(
    {
      root,
      scenario: "World map CPU canvas, 60Hz calls, DPR 1; not browser FPS",
      meanMs: total / samples.length,
      medianMs: samples[45],
      p95Ms: samples[85],
    },
    null,
    2
  )
);
