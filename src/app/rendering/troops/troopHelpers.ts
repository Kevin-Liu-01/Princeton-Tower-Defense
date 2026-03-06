export {
  normalizeSignedAngle,
  resolveWeaponRotation,
  WEAPON_LIMITS,
} from "../weaponRotation";

export interface TroopMasterworkStyle {
  rimLight: string;
  aura: string;
  rune: string;
  metalSheen: string;
  crest: string;
}

export const TROOP_MASTERWORK_STYLES: Record<
  | "soldier"
  | "armored"
  | "elite"
  | "cavalry"
  | "centaur"
  | "thesis"
  | "rowing"
  | "knight"
  | "turret",
  TroopMasterworkStyle
> = {
  soldier: {
    rimLight: "rgba(255, 190, 120, 0.65)",
    aura: "rgba(255, 126, 40, ",
    rune: "rgba(255, 181, 116, ",
    metalSheen: "rgba(255, 240, 220, ",
    crest: "#f27f2f",
  },
  armored: {
    rimLight: "rgba(180, 206, 230, 0.68)",
    aura: "rgba(126, 180, 228, ",
    rune: "rgba(168, 214, 255, ",
    metalSheen: "rgba(225, 239, 255, ",
    crest: "#7ab4e0",
  },
  elite: {
    rimLight: "rgba(255, 227, 162, 0.72)",
    aura: "rgba(255, 163, 74, ",
    rune: "rgba(255, 213, 143, ",
    metalSheen: "rgba(255, 244, 213, ",
    crest: "#f5b04b",
  },
  cavalry: {
    rimLight: "rgba(255, 215, 148, 0.72)",
    aura: "rgba(247, 145, 52, ",
    rune: "rgba(255, 213, 136, ",
    metalSheen: "rgba(255, 240, 198, ",
    crest: "#f7aa42",
  },
  centaur: {
    rimLight: "rgba(242, 210, 158, 0.66)",
    aura: "rgba(210, 143, 74, ",
    rune: "rgba(246, 212, 168, ",
    metalSheen: "rgba(255, 229, 204, ",
    crest: "#d79f56",
  },
  thesis: {
    rimLight: "rgba(219, 182, 255, 0.75)",
    aura: "rgba(184, 121, 250, ",
    rune: "rgba(221, 186, 255, ",
    metalSheen: "rgba(241, 224, 255, ",
    crest: "#ba84ff",
  },
  rowing: {
    rimLight: "rgba(255, 194, 132, 0.72)",
    aura: "rgba(247, 130, 52, ",
    rune: "rgba(255, 205, 148, ",
    metalSheen: "rgba(255, 232, 205, ",
    crest: "#ff9548",
  },
  knight: {
    rimLight: "rgba(170, 212, 255, 0.62)",
    aura: "rgba(86, 141, 224, ",
    rune: "rgba(181, 220, 255, ",
    metalSheen: "rgba(231, 242, 255, ",
    crest: "#78b2ff",
  },
  turret: {
    rimLight: "rgba(255, 194, 122, 0.58)",
    aura: "rgba(255, 117, 54, ",
    rune: "rgba(255, 213, 152, ",
    metalSheen: "rgba(255, 233, 203, ",
    crest: "#ff8e4d",
  },
};

export function drawTroopFinishMotes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  glowColor: string,
  count: number,
  spreadX: number,
  rise: number,
) {
  for (let mote = 0; mote < count; mote++) {
    const phase = (time * 0.7 + mote * 0.19) % 1;
    const drift = Math.sin(time * 2.1 + mote * 1.7) * spreadX;
    const moteX = x + drift * (0.4 + phase * 0.7);
    const moteY = y - phase * rise + Math.cos(time * 2.8 + mote) * size * 0.015;
    const alpha = (1 - phase) * 0.28;
    ctx.fillStyle = `${glowColor}${alpha})`;
    ctx.beginPath();
    ctx.arc(moteX, moteY, size * (0.012 + mote * 0.0015), 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawTroopMasterworkFinish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  style: TroopMasterworkStyle,
  options: { mounted?: boolean; scholar?: boolean; vanguard?: boolean } = {},
) {
  const pulse = 0.58 + Math.sin(time * 4.1) * 0.18;
  const shimmer = 0.52 + Math.sin(time * 6.3 + 0.5) * 0.22;
  const shoulderY = y - size * (options.mounted ? 0.06 : 0.03);
  const shoulderSpan = size * (options.mounted ? 0.24 : 0.16);
  const chestY = y + size * (options.mounted ? 0.03 : 0.06);
  const chestWidth = size * (options.mounted ? 0.12 : 0.09);
  const runeY = y + size * (options.mounted ? 0.12 : 0.08);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Subtle cold rim accents sharpen the silhouette without adding large overlays.
  ctx.strokeStyle = style.rimLight;
  ctx.lineWidth = 1.2 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * shoulderSpan, shoulderY);
    ctx.quadraticCurveTo(
      x + side * shoulderSpan * 0.72,
      shoulderY - size * 0.06,
      x + side * chestWidth,
      chestY - size * 0.02,
    );
    ctx.stroke();
  }

  // Chest and belt-line sheen keeps the armor readable at small scales.
  ctx.strokeStyle = `${style.metalSheen}${0.14 + shimmer * 0.18})`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - chestWidth, chestY);
  ctx.lineTo(x, chestY + size * 0.04);
  ctx.lineTo(x + chestWidth, chestY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - chestWidth * 0.82, chestY + size * 0.11);
  ctx.lineTo(x + chestWidth * 0.82, chestY + size * 0.11);
  ctx.stroke();

  // Tiny crest gem adds a focal point without brightening the whole sprite.
  ctx.fillStyle = style.crest;
  ctx.globalAlpha = 0.55 + pulse * 0.18;
  ctx.beginPath();
  ctx.moveTo(x, chestY - size * 0.03);
  ctx.lineTo(x - size * 0.018, chestY + size * 0.002);
  ctx.lineTo(x, chestY + size * 0.03);
  ctx.lineTo(x + size * 0.018, chestY + size * 0.002);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Vanguard units get harsher slash motifs; scholars get cleaner runic marks.
  ctx.strokeStyle = `${style.rune}${0.18 + pulse * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  if (options.vanguard) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.11, chestY + size * 0.02);
      ctx.lineTo(x + side * size * 0.07, chestY + size * 0.11);
      ctx.moveTo(x + side * size * 0.085, chestY + size * 0.01);
      ctx.lineTo(x + side * size * 0.045, chestY + size * 0.1);
      ctx.stroke();
    }
  }
  if (options.scholar) {
    for (let rune = 0; rune < 3; rune++) {
      const runeX = x - size * 0.06 + rune * size * 0.06;
      const runeLift = Math.sin(time * 3.5 + rune) * size * 0.008;
      ctx.beginPath();
      ctx.moveTo(runeX, runeY + runeLift);
      ctx.lineTo(runeX + size * 0.014, runeY - size * 0.02 + runeLift);
      ctx.lineTo(runeX + size * 0.028, runeY + size * 0.01 + runeLift);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.06, runeY);
    ctx.quadraticCurveTo(x, runeY - size * 0.028, x + size * 0.06, runeY);
    ctx.stroke();
  }

  drawTroopFinishMotes(
    ctx,
    x,
    y + size * 0.16,
    size,
    time,
    style.rune,
    options.mounted ? 4 : 3,
    size * (options.mounted ? 0.14 : 0.09),
    size * (options.mounted ? 0.18 : 0.12),
  );
  ctx.restore();
}
