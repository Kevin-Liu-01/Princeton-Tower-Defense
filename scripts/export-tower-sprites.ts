import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "fs";
import { drawTowerSprite } from "../src/app/rendering/towers";

const TOWERS = [
  "cannon",
  "library",
  "lab",
  "arch",
  "club",
  "station",
  "mortar",
] as const;

const SIZE = 160;
const PAD = 1.25;
const CANVAS_SIZE = Math.ceil(SIZE * PAD);
const OUT_DIR = "public/images/og-thumbs/towers";

mkdirSync(OUT_DIR, { recursive: true });

for (const type of TOWERS) {
  const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;

  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  drawTowerSprite(ctx, cx, cy, SIZE, type, 4, undefined, 0);

  const buffer = canvas.toBuffer("image/png");
  const outPath = `${OUT_DIR}/${type}.png`;
  writeFileSync(outPath, buffer);
  console.log(`Exported ${outPath} (${buffer.length} bytes)`);
}

console.log("Done — all tower sprites exported.");
