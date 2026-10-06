import type { DecorationType } from "../../types";

interface FinishParams {
  ctx: CanvasRenderingContext2D;
  time: number;
  type: DecorationType;
  variant: number;
  x: number;
  y: number;
  scale: number;
}

interface StructureFinish {
  accent: string;
  height: number;
  radius: number;
  windows?: readonly (readonly [number, number])[];
}

const STRUCTURE_FINISHES: Readonly<
  Partial<Record<DecorationType, StructureFinish>>
> = {
  dark_barracks: {
    accent: "#a78bfa",
    height: 48,
    radius: 34,
    windows: [
      [-10, -24],
      [9, -19],
    ],
  },
  dark_spire: {
    accent: "#c084fc",
    height: 72,
    radius: 26,
    windows: [[0, -40]],
  },
  frozen_gate: {
    accent: "#a5f3fc",
    height: 46,
    radius: 38,
    windows: [
      [-14, -25],
      [14, -25],
    ],
  },
  gate: {
    accent: "#f5c86b",
    height: 38,
    radius: 36,
    windows: [
      [-12, -22],
      [12, -22],
    ],
  },
  hut: {
    accent: "#f6c96f",
    height: 27,
    radius: 23,
    windows: [[5, -13]],
  },
  obsidian_castle: {
    accent: "#fb7185",
    height: 94,
    radius: 58,
    windows: [
      [-21, -48],
      [0, -61],
      [22, -43],
    ],
  },
  ruined_temple: {
    accent: "#d6c29a",
    height: 42,
    radius: 42,
  },
  tent: {
    accent: "#f6c96f",
    height: 24,
    radius: 25,
  },
  witch_cottage: {
    accent: "#d8b4fe",
    height: 54,
    radius: 36,
    windows: [
      [-9, -25],
      [10, -22],
    ],
  },
};

const PROP_TYPES = new Set<DecorationType>([
  "barrel",
  "bench",
  "cart",
  "demon_statue",
  "fence",
  "gravestone",
  "lamppost",
  "signpost",
  "statue",
  "treasure_chest",
]);

const PRINCETON_BUILDING_TYPES = new Set<DecorationType>([
  "alexander_hall",
  "blair_arch",
  "cleveland_tower",
  "clio_hall",
  "east_pyne",
  "fine_hall",
  "firestone_library",
  "foulke_hall",
  "holder_hall",
  "mccosh_hall",
  "nassau_hall",
  "princeton_chapel",
  "prospect_house",
  "robertson_hall",
  "tiger_stadium",
  "whig_hall",
]);

const FANTASY_LANDMARK_TYPES = new Set<DecorationType>([
  "bone_altar",
  "dark_throne",
  "demon_statue",
  "fortress",
  "frost_citadel",
  "ice_throne",
  "infernal_gate",
  "skull_throne",
  "sun_obelisk",
  "war_monument",
]);

const PRINCETON_BUILDING_FINISH: StructureFinish = {
  accent: "#ead9b7",
  height: 58,
  radius: 39,
};

const FANTASY_LANDMARK_FINISH: StructureFinish = {
  accent: "#c4b5fd",
  height: 64,
  radius: 43,
};

const drawContactDetails = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  radius: number,
  variant: number
): void => {
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "rgba(8, 12, 14, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    x + 2 * scale,
    y + 2 * scale,
    radius * scale,
    radius * 0.22 * scale,
    -0.06,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const stoneColors = ["#6f6b5e", "#928b78", "#55554f"] as const;
  for (let index = 0; index < 5; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const distance = radius * (0.5 + ((index * 17 + variant * 7) % 30) / 100);
    const stoneX = x + side * distance * scale;
    const stoneY = y + (1 + (index % 3) * 1.4) * scale;
    ctx.fillStyle = stoneColors[(index + variant) % stoneColors.length];
    ctx.beginPath();
    ctx.ellipse(
      stoneX,
      stoneY,
      (1.4 + (index % 2) * 0.7) * scale,
      (0.7 + (index % 3) * 0.2) * scale,
      side * 0.18,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.restore();
};

const drawWindowGlow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  accent: string,
  pulse: number
): void => {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.28 + pulse * 0.08;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(x, y, 4.2 * scale, 2.6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#fff4c4";
  ctx.beginPath();
  ctx.rect(x - 0.75 * scale, y - 1.5 * scale, 1.5 * scale, 3 * scale);
  ctx.fill();
  ctx.restore();
};

const drawStructureFinish = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
  variant: number,
  finish: StructureFinish
): void => {
  drawContactDetails(ctx, x, y, scale, finish.radius, variant);

  ctx.strokeStyle = finish.accent;
  ctx.globalAlpha = 0.32;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(0.75, 0.85 * scale);
  ctx.beginPath();
  ctx.moveTo(
    x - finish.radius * 0.58 * scale,
    y - finish.height * 0.42 * scale
  );
  ctx.lineTo(
    x - finish.radius * 0.12 * scale,
    y - finish.height * 0.72 * scale
  );
  ctx.lineTo(
    x + finish.radius * 0.26 * scale,
    y - finish.height * 0.56 * scale
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  const pulse = (Math.sin(time * 1.7 + variant) + 1) / 2;
  for (const [windowX, windowY] of finish.windows ?? []) {
    drawWindowGlow(
      ctx,
      x + windowX * scale,
      y + windowY * scale,
      scale,
      finish.accent,
      pulse
    );
  }
};

const drawPropFinish = (
  ctx: CanvasRenderingContext2D,
  type: DecorationType,
  x: number,
  y: number,
  scale: number,
  time: number,
  variant: number
): void => {
  const radius = type === "fence" ? 22 : type === "cart" ? 17 : 10;
  drawContactDetails(ctx, x, y, scale, radius, variant);

  if (type === "lamppost") {
    const pulse = 0.72 + Math.sin(time * 2.1) * 0.08;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = pulse * 0.34;
    ctx.fillStyle = "#ffd878";
    ctx.beginPath();
    ctx.arc(x, y - 43 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (type === "statue" || type === "demon_statue") {
    ctx.strokeStyle = type === "demon_statue" ? "#fb7185" : "#d8d5c8";
    ctx.globalAlpha = 0.42;
    ctx.lineWidth = Math.max(0.7, scale);
    ctx.beginPath();
    ctx.moveTo(x - 5 * scale, y - 22 * scale);
    ctx.quadraticCurveTo(
      x - 9 * scale,
      y - 13 * scale,
      x - 6 * scale,
      y - 5 * scale
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }

  if (type === "barrel" || type === "treasure_chest") {
    ctx.strokeStyle = "rgba(255, 226, 155, 0.55)";
    ctx.lineWidth = Math.max(0.55, 0.7 * scale);
    ctx.beginPath();
    ctx.arc(x - 1.5 * scale, y - 8 * scale, 5 * scale, 3.7, 5.3);
    ctx.stroke();
    ctx.fillStyle = "#f7d77d";
    ctx.beginPath();
    ctx.arc(x + 4 * scale, y - 5 * scale, 0.8 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
};

export function drawDecorationMasterworkFinish({
  ctx,
  time,
  type,
  variant,
  x,
  y,
  scale,
}: FinishParams): void {
  const structureFinish =
    STRUCTURE_FINISHES[type] ??
    (PRINCETON_BUILDING_TYPES.has(type)
      ? PRINCETON_BUILDING_FINISH
      : undefined) ??
    (FANTASY_LANDMARK_TYPES.has(type) ? FANTASY_LANDMARK_FINISH : undefined);
  if (structureFinish) {
    drawStructureFinish(ctx, x, y, scale, time, variant, structureFinish);
    return;
  }
  if (PROP_TYPES.has(type)) {
    drawPropFinish(ctx, type, x, y, scale, time, variant);
  }
}
