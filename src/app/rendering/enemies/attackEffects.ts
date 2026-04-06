import type { EnemyType } from "../../types";
import { ISO_Y_RATIO } from "../../constants";

// ============================================================================
// ATTACK TYPE CLASSIFICATION
// ============================================================================

const HEAVY_GROUND_SLAM_TYPES = new Set<EnemyType>([
  "juggernaut",
  "golem",
  "swamp_troll",
  "yeti",
  "dean",
  "trustee",
  "senior",
  "gradstudent",
  "ember_guard",
  "bog_creature",
  "tiger_fan",
  "centipede",
  "magma_beetle",
  "brood_mother",
  "dire_bear",
  "ancient_ent",
  "forest_troll",
  "marsh_troll",
  "frost_troll",
  "mammoth",
  "lava_golem",
]);

const SLASH_ATTACK_TYPES = new Set<EnemyType>([
  "shadow_knight",
  "berserker",
  "assassin",
  "thornwalker",
  "athlete",
  "fire_imp",
  "snow_goblin",
  "mantis",
]);

const MAGIC_ATTACK_TYPES = new Set<EnemyType>([
  "mage",
  "warlock",
  "necromancer",
  "ice_witch",
  "infernal",
  "banshee",
  "specter",
  "will_o_wisp",
  "cultist",
  "plaguebearer",
  "bombardier_beetle",
  "silk_moth",
  "snow_moth",
  "ash_moth",
  "djinn",
  "phoenix",
  "hexer",
]);

const BITE_ATTACK_TYPES = new Set<EnemyType>([
  "scorpion",
  "sandworm",
  "dragon",
  "wyvern",
  "scarab",
  "magma_spawn",
  "orb_weaver",
  "mosquito",
  "dragonfly",
  "ant_soldier",
  "locust",
  "trapdoor_spider",
  "ice_beetle",
  "frost_tick",
  "fire_ant",
  "timber_wolf",
  "dire_wolf",
  "giant_eagle",
  "swamp_hydra",
  "giant_toad",
  "basilisk",
  "manticore",
  "volcanic_drake",
  "salamander",
]);

// ============================================================================
// PER-ENEMY STYLE DEFINITIONS
// ============================================================================

interface SlamStyle {
  crackRgb: string;
  glowRgb: string;
  debrisRgb: string;
  shockRgb: string;
  intensity: number;
}

interface SlashStyle {
  rgb: string;
  trailRgb: string;
  sparkRgb: string;
  arcWidth: number;
  slashCount: number;
}

interface MagicStyle {
  coreRgb: string;
  glowRgb: string;
  runeRgb: string;
  shape: "burst" | "beam" | "wave" | "vortex";
}

interface BiteStyle {
  jawRgb: string;
  fluidRgb: string;
  teethRgb: string;
  jawScale: number;
}

function getSlamStyle(type: EnemyType): SlamStyle {
  switch (type) {
    case "golem":
      return { crackRgb: "120, 100, 60", glowRgb: "200, 170, 80", debrisRgb: "160, 140, 90", shockRgb: "180, 150, 80", intensity: 1.3 };
    case "swamp_troll":
      return { crackRgb: "40, 80, 30", glowRgb: "80, 180, 60", debrisRgb: "60, 120, 50", shockRgb: "70, 150, 50", intensity: 1.1 };
    case "yeti":
      return { crackRgb: "140, 200, 240", glowRgb: "180, 230, 255", debrisRgb: "200, 230, 255", shockRgb: "160, 210, 245", intensity: 1.2 };
    case "ember_guard":
      return { crackRgb: "255, 80, 20", glowRgb: "255, 140, 40", debrisRgb: "255, 100, 30", shockRgb: "255, 120, 40", intensity: 1.4 };
    case "juggernaut":
      return { crackRgb: "80, 60, 40", glowRgb: "220, 180, 100", debrisRgb: "150, 120, 80", shockRgb: "180, 140, 80", intensity: 1.5 };
    case "dean":
      return { crackRgb: "100, 40, 120", glowRgb: "180, 80, 220", debrisRgb: "140, 60, 180", shockRgb: "160, 70, 200", intensity: 1.2 };
    case "trustee":
      return { crackRgb: "180, 150, 50", glowRgb: "255, 220, 80", debrisRgb: "220, 190, 70", shockRgb: "240, 200, 80", intensity: 1.3 };
    case "bog_creature":
      return { crackRgb: "50, 90, 40", glowRgb: "90, 160, 70", debrisRgb: "70, 130, 55", shockRgb: "80, 140, 60", intensity: 1.0 };
    case "centipede":
      return { crackRgb: "120, 40, 20", glowRgb: "180, 50, 220", debrisRgb: "140, 60, 30", shockRgb: "160, 80, 40", intensity: 1.1 };
    case "magma_beetle":
      return { crackRgb: "255, 60, 10", glowRgb: "255, 120, 30", debrisRgb: "200, 80, 20", shockRgb: "255, 100, 25", intensity: 1.3 };
    case "brood_mother":
      return { crackRgb: "60, 20, 20", glowRgb: "180, 30, 30", debrisRgb: "100, 40, 40", shockRgb: "140, 40, 40", intensity: 1.6 };
    case "dire_bear":
      return { crackRgb: "80, 50, 20", glowRgb: "180, 140, 60", debrisRgb: "120, 90, 50", shockRgb: "150, 120, 60", intensity: 1.4 };
    case "ancient_ent":
      return { crackRgb: "40, 80, 20", glowRgb: "80, 200, 50", debrisRgb: "60, 140, 40", shockRgb: "70, 160, 45", intensity: 1.5 };
    case "forest_troll":
      return { crackRgb: "50, 80, 40", glowRgb: "100, 180, 80", debrisRgb: "70, 130, 60", shockRgb: "80, 150, 70", intensity: 1.2 };
    case "marsh_troll":
      return { crackRgb: "50, 70, 35", glowRgb: "90, 150, 70", debrisRgb: "65, 110, 50", shockRgb: "75, 130, 60", intensity: 1.2 };
    case "frost_troll":
      return { crackRgb: "100, 160, 200", glowRgb: "150, 200, 240", debrisRgb: "130, 180, 220", shockRgb: "140, 190, 230", intensity: 1.3 };
    case "mammoth":
      return { crackRgb: "100, 80, 50", glowRgb: "180, 150, 100", debrisRgb: "140, 110, 70", shockRgb: "160, 130, 90", intensity: 1.8 };
    case "lava_golem":
      return { crackRgb: "255, 80, 0", glowRgb: "255, 150, 30", debrisRgb: "200, 100, 20", shockRgb: "255, 120, 30", intensity: 1.6 };
    default:
      return { crackRgb: "80, 60, 40", glowRgb: "200, 160, 80", debrisRgb: "140, 120, 80", shockRgb: "160, 130, 70", intensity: 1.0 };
  }
}

function getSlashStyle(type: EnemyType): SlashStyle {
  switch (type) {
    case "shadow_knight":
      return { rgb: "160, 80, 255", trailRgb: "100, 40, 200", sparkRgb: "200, 140, 255", arcWidth: 1.4, slashCount: 2 };
    case "berserker":
      return { rgb: "255, 60, 40", trailRgb: "200, 30, 20", sparkRgb: "255, 150, 100", arcWidth: 1.3, slashCount: 2 };
    case "assassin":
      return { rgb: "100, 255, 140", trailRgb: "60, 200, 100", sparkRgb: "160, 255, 180", arcWidth: 0.7, slashCount: 3 };
    case "hexer":
      return { rgb: "200, 80, 255", trailRgb: "150, 40, 200", sparkRgb: "230, 160, 255", arcWidth: 1.1, slashCount: 1 };
    case "thornwalker":
      return { rgb: "80, 200, 60", trailRgb: "50, 150, 40", sparkRgb: "140, 230, 100", arcWidth: 1.3, slashCount: 1 };
    case "mantis":
      return { rgb: "120, 200, 30", trailRgb: "80, 160, 20", sparkRgb: "180, 240, 80", arcWidth: 0.6, slashCount: 4 };
    case "wendigo":
      return { rgb: "100, 140, 180", trailRgb: "60, 100, 140", sparkRgb: "180, 220, 255", arcWidth: 1.2, slashCount: 2 };
    case "vine_serpent":
      return { rgb: "60, 180, 60", trailRgb: "40, 140, 40", sparkRgb: "120, 220, 100", arcWidth: 1.3, slashCount: 1 };
    case "athlete":
      return { rgb: "255, 210, 50", trailRgb: "230, 180, 30", sparkRgb: "255, 240, 150", arcWidth: 0.9, slashCount: 1 };
    case "fire_imp":
      return { rgb: "255, 140, 30", trailRgb: "255, 80, 10", sparkRgb: "255, 200, 100", arcWidth: 1.0, slashCount: 1 };
    case "snow_goblin":
      return { rgb: "130, 210, 255", trailRgb: "80, 180, 240", sparkRgb: "200, 235, 255", arcWidth: 0.9, slashCount: 1 };
    default:
      return { rgb: "255, 230, 180", trailRgb: "200, 180, 130", sparkRgb: "255, 250, 220", arcWidth: 1.0, slashCount: 1 };
  }
}

function getMagicStyle(type: EnemyType): MagicStyle {
  switch (type) {
    case "mage":
      return { coreRgb: "100, 60, 255", glowRgb: "150, 120, 255", runeRgb: "180, 150, 255", shape: "burst" };
    case "warlock":
      return { coreRgb: "80, 20, 160", glowRgb: "120, 50, 200", runeRgb: "160, 80, 240", shape: "vortex" };
    case "necromancer":
      return { coreRgb: "60, 200, 100", glowRgb: "80, 255, 130", runeRgb: "100, 230, 150", shape: "wave" };
    case "ice_witch":
      return { coreRgb: "100, 200, 255", glowRgb: "150, 225, 255", runeRgb: "200, 240, 255", shape: "burst" };
    case "infernal":
      return { coreRgb: "255, 80, 20", glowRgb: "255, 140, 50", runeRgb: "255, 180, 80", shape: "burst" };
    case "banshee":
      return { coreRgb: "180, 255, 200", glowRgb: "200, 255, 220", runeRgb: "220, 255, 230", shape: "wave" };
    case "specter":
      return { coreRgb: "200, 240, 255", glowRgb: "220, 245, 255", runeRgb: "230, 250, 255", shape: "wave" };
    case "will_o_wisp":
      return { coreRgb: "100, 255, 80", glowRgb: "140, 255, 120", runeRgb: "180, 255, 160", shape: "burst" };
    case "cultist":
      return { coreRgb: "80, 20, 120", glowRgb: "120, 40, 170", runeRgb: "160, 60, 220", shape: "vortex" };
    case "plaguebearer":
      return { coreRgb: "120, 180, 30", glowRgb: "150, 210, 50", runeRgb: "180, 230, 80", shape: "burst" };
    case "bombardier_beetle":
      return { coreRgb: "255, 120, 20", glowRgb: "255, 160, 50", runeRgb: "255, 200, 80", shape: "burst" };
    case "silk_moth":
      return { coreRgb: "180, 160, 240", glowRgb: "200, 185, 255", runeRgb: "220, 210, 255", shape: "wave" };
    case "snow_moth":
      return { coreRgb: "200, 235, 255", glowRgb: "220, 245, 255", runeRgb: "240, 250, 255", shape: "wave" };
    case "ash_moth":
      return { coreRgb: "255, 140, 30", glowRgb: "255, 180, 60", runeRgb: "255, 210, 100", shape: "burst" };
    case "djinn":
      return { coreRgb: "106, 58, 170", glowRgb: "150, 100, 220", runeRgb: "200, 160, 255", shape: "vortex" };
    case "phoenix":
      return { coreRgb: "255, 200, 50", glowRgb: "255, 140, 30", runeRgb: "255, 100, 0", shape: "burst" };
    default:
      return { coreRgb: "150, 100, 255", glowRgb: "180, 140, 255", runeRgb: "210, 180, 255", shape: "burst" };
  }
}

function getBiteStyle(type: EnemyType): BiteStyle {
  switch (type) {
    case "scorpion":
      return { jawRgb: "60, 80, 40", fluidRgb: "100, 255, 100", teethRgb: "200, 220, 180", jawScale: 1.0 };
    case "sandworm":
      return { jawRgb: "160, 130, 80", fluidRgb: "180, 160, 100", teethRgb: "240, 230, 200", jawScale: 1.6 };
    case "dragon":
      return { jawRgb: "200, 50, 20", fluidRgb: "255, 140, 30", teethRgb: "255, 240, 200", jawScale: 1.4 };
    case "wyvern":
      return { jawRgb: "100, 60, 30", fluidRgb: "255, 180, 60", teethRgb: "240, 230, 210", jawScale: 1.2 };
    case "scarab":
      return { jawRgb: "40, 80, 40", fluidRgb: "140, 200, 80", teethRgb: "200, 210, 180", jawScale: 0.8 };
    case "magma_spawn":
      return { jawRgb: "255, 80, 20", fluidRgb: "255, 160, 40", teethRgb: "255, 220, 150", jawScale: 1.1 };
    case "orb_weaver":
      return { jawRgb: "60, 40, 30", fluidRgb: "120, 200, 80", teethRgb: "180, 160, 140", jawScale: 1.1 };
    case "mosquito":
      return { jawRgb: "80, 30, 50", fluidRgb: "200, 40, 40", teethRgb: "160, 130, 120", jawScale: 0.7 };
    case "dragonfly":
      return { jawRgb: "14, 130, 200", fluidRgb: "40, 180, 240", teethRgb: "200, 220, 240", jawScale: 0.6 };
    case "ant_soldier":
      return { jawRgb: "100, 50, 10", fluidRgb: "160, 120, 40", teethRgb: "200, 180, 150", jawScale: 1.2 };
    case "locust":
      return { jawRgb: "120, 120, 30", fluidRgb: "160, 160, 50", teethRgb: "200, 200, 160", jawScale: 0.7 };
    case "trapdoor_spider":
      return { jawRgb: "80, 50, 20", fluidRgb: "160, 200, 60", teethRgb: "180, 160, 140", jawScale: 1.3 };
    case "ice_beetle":
      return { jawRgb: "60, 180, 220", fluidRgb: "140, 230, 255", teethRgb: "220, 245, 255", jawScale: 1.0 };
    case "frost_tick":
      return { jawRgb: "100, 200, 240", fluidRgb: "165, 243, 252", teethRgb: "230, 250, 255", jawScale: 0.8 };
    case "fire_ant":
      return { jawRgb: "180, 30, 10", fluidRgb: "255, 100, 30", teethRgb: "255, 200, 150", jawScale: 1.2 };
    case "timber_wolf":
      return { jawRgb: "80, 80, 80", fluidRgb: "200, 50, 50", teethRgb: "240, 240, 230", jawScale: 0.9 };
    case "dire_wolf":
      return { jawRgb: "60, 60, 70", fluidRgb: "150, 200, 255", teethRgb: "240, 245, 255", jawScale: 1.0 };
    case "giant_eagle":
      return { jawRgb: "180, 150, 60", fluidRgb: "200, 180, 100", teethRgb: "255, 240, 200", jawScale: 0.8 };
    case "swamp_hydra":
      return { jawRgb: "40, 70, 40", fluidRgb: "80, 200, 60", teethRgb: "200, 220, 180", jawScale: 1.5 };
    case "giant_toad":
      return { jawRgb: "60, 90, 40", fluidRgb: "120, 180, 60", teethRgb: "200, 210, 180", jawScale: 1.3 };
    case "basilisk":
      return { jawRgb: "80, 80, 40", fluidRgb: "100, 255, 80", teethRgb: "220, 220, 200", jawScale: 1.4 };
    case "manticore":
      return { jawRgb: "120, 60, 20", fluidRgb: "180, 80, 200", teethRgb: "240, 230, 210", jawScale: 1.2 };
    case "volcanic_drake":
      return { jawRgb: "200, 50, 0", fluidRgb: "255, 140, 30", teethRgb: "255, 230, 180", jawScale: 1.3 };
    case "salamander":
      return { jawRgb: "200, 60, 0", fluidRgb: "255, 120, 20", teethRgb: "255, 220, 160", jawScale: 0.9 };
    default:
      return { jawRgb: "180, 80, 60", fluidRgb: "200, 200, 255", teethRgb: "240, 240, 240", jawScale: 1.0 };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function stableNoise(seed: number): number {
  const wave = Math.sin(seed * 12.9898) * 43758.5453;
  return wave - Math.floor(wave);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// ============================================================================
// GROUND SLAM ATTACK
// ============================================================================

function renderGroundSlam(
  ctx: CanvasRenderingContext2D,
  type: EnemyType,
  x: number,
  y: number,
  size: number,
  phase: number,
  time: number,
  zoom: number,
  seed: number,
): void {
  const style = getSlamStyle(type);
  const pulse = Math.sin(phase * Math.PI);
  const intensity = style.intensity;

  // Impact point is slightly forward (left in local coords)
  const impactX = x - size * 0.15;
  const impactY = y + size * 0.4;

  // DIRECTIONAL SHOCKWAVE - expands more toward target (left)
  if (phase < 0.85) {
    const shockProgress = easeOutCubic(1 - phase / 0.85);
    const baseRadius = size * (0.3 + shockProgress * 0.9) * intensity;

    // Isometric ground-plane shockwave (slightly biased forward)
    ctx.save();
    ctx.translate(impactX, impactY);
    ctx.scale(1.15, ISO_Y_RATIO);

    // Outer shockwave ring
    const shockAlpha = phase * 0.6;
    ctx.strokeStyle = `rgba(${style.shockRgb}, ${shockAlpha})`;
    ctx.lineWidth = (4 - shockProgress * 2) * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner shockwave
    if (shockProgress < 0.6) {
      ctx.strokeStyle = `rgba(${style.glowRgb}, ${shockAlpha * 0.7})`;
      ctx.lineWidth = (2.5 - shockProgress * 1.5) * zoom;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // GROUND CRACKS - radiate forward from impact
  if (phase > 0.2) {
    const crackExtend = easeOutCubic(1 - (phase - 0.2) / 0.8);
    ctx.strokeStyle = `rgba(${style.crackRgb}, ${phase * 0.8})`;

    const crackCount = 5 + Math.floor(intensity * 2);
    for (let i = 0; i < crackCount; i++) {
      // Bias cracks toward forward direction (left, centered around PI)
      const spreadAngle = ((i / crackCount) - 0.5) * Math.PI * 1.2;
      const baseAngle = Math.PI + spreadAngle;
      const crackLen = size * (0.4 + crackExtend * 0.7) * intensity;

      ctx.lineWidth = (2.5 - crackExtend * 1.5) * zoom;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);

      let cx = impactX;
      let cy = impactY;
      const segments = 3;
      for (let j = 1; j <= segments; j++) {
        const jitter = stableNoise(seed + i * 7.3 + j * 3.1) * 0.25 - 0.125;
        cx += Math.cos(baseAngle + jitter) * (crackLen / segments);
        cy += Math.sin(baseAngle + jitter) * (crackLen / segments) * ISO_Y_RATIO;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Branch crack at end for larger enemies
      if (intensity > 1.0 && crackExtend > 0.5 && i % 2 === 0) {
        const branchAngle = baseAngle + (stableNoise(seed + i * 11) > 0.5 ? 0.5 : -0.5);
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(branchAngle) * crackLen * 0.25,
          cy + Math.sin(branchAngle) * crackLen * 0.25 * ISO_Y_RATIO,
        );
        ctx.stroke();
      }
    }
  }

  // IMPACT GLOW at center
  if (pulse > 0.1) {
    const glowRadius = size * 0.5 * pulse * intensity;
    const grad = ctx.createRadialGradient(impactX, impactY, 0, impactX, impactY, glowRadius);
    grad.addColorStop(0, `rgba(${style.glowRgb}, ${pulse * 0.5})`);
    grad.addColorStop(0.4, `rgba(${style.glowRgb}, ${pulse * 0.25})`);
    grad.addColorStop(1, `rgba(${style.crackRgb}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(impactX, impactY, glowRadius, glowRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // DEBRIS PARTICLES flying forward
  if (phase < 0.7) {
    const debrisProgress = 1 - phase / 0.7;
    const debrisCount = 6 + Math.floor(intensity * 3);
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.PI + (stableNoise(seed + i * 5.7) - 0.5) * Math.PI * 0.9;
      const dist = size * (0.2 + debrisProgress * 0.8) * intensity;
      const arcHeight = Math.sin(debrisProgress * Math.PI) * size * 0.4;

      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist * ISO_Y_RATIO - arcHeight;
      const debrisSize = size * 0.03 * (1 - debrisProgress * 0.6);
      const alpha = (1 - debrisProgress) * 0.7;

      ctx.fillStyle = `rgba(${style.debrisRgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(impactX + dx, impactY + dy, debrisSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // DUST CLOUD lingering
  if (phase < 0.4) {
    const dustAlpha = phase / 0.4 * 0.15;
    ctx.fillStyle = `rgba(${style.debrisRgb}, ${dustAlpha})`;
    ctx.beginPath();
    ctx.ellipse(impactX - size * 0.1, impactY, size * 0.5 * intensity, size * 0.5 * intensity * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// SLASH ATTACK
// ============================================================================

function renderSlashAttack(
  ctx: CanvasRenderingContext2D,
  type: EnemyType,
  x: number,
  y: number,
  size: number,
  phase: number,
  time: number,
  zoom: number,
  seed: number,
): void {
  const style = getSlashStyle(type);
  const pulse = Math.sin(phase * Math.PI);

  // Slash sweeps forward (toward left in local coords)
  // Arc center is offset forward, sweep goes from upper-back to lower-front
  const slashRadius = size * 0.65 * style.arcWidth;
  const arcCenterX = x - size * 0.1;
  const arcCenterY = y - size * 0.05;

  for (let s = 0; s < style.slashCount; s++) {
    const slashOffset = s * 0.15;
    const slashPhase = Math.max(0, Math.min(1, (phase - slashOffset) / (1 - slashOffset)));
    if (slashPhase <= 0) continue;

    const slashPulse = Math.sin(slashPhase * Math.PI);
    const progress = easeOutCubic(1 - slashPhase);

    // Sweep from upper-right to lower-left (forward direction)
    const startAngle = -Math.PI * 0.85 + s * 0.25;
    const endAngle = Math.PI * 0.35 + s * 0.15;
    const currentAngle = startAngle + (endAngle - startAngle) * progress;

    const trailLength = 0.9 - progress * 0.3;
    const arcStart = currentAngle - trailLength;
    const arcEnd = currentAngle;

    const offsetR = slashRadius * (1 - s * 0.12);

    // Outer glow (widest, most diffuse)
    ctx.strokeStyle = `rgba(${style.trailRgb}, ${slashPulse * 0.25})`;
    ctx.lineWidth = (8 - s * 2) * zoom * style.arcWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(arcCenterX, arcCenterY, offsetR * 1.05, arcStart, arcEnd);
    ctx.stroke();

    // Main slash arc
    ctx.strokeStyle = `rgba(${style.rgb}, ${slashPulse * 0.7})`;
    ctx.lineWidth = (4.5 - s * 1) * zoom * style.arcWidth;
    ctx.beginPath();
    ctx.arc(arcCenterX, arcCenterY, offsetR, arcStart + 0.1, arcEnd);
    ctx.stroke();

    // Inner bright core
    ctx.strokeStyle = `rgba(255, 255, 255, ${slashPulse * 0.6})`;
    ctx.lineWidth = (2 - s * 0.3) * zoom;
    ctx.beginPath();
    ctx.arc(arcCenterX, arcCenterY, offsetR, arcStart + 0.2, arcEnd);
    ctx.stroke();

    // Leading edge glow point
    const tipX = arcCenterX + Math.cos(currentAngle) * offsetR;
    const tipY = arcCenterY + Math.sin(currentAngle) * offsetR;
    const tipGlowSize = size * 0.12 * slashPulse;
    const tipGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, tipGlowSize);
    tipGrad.addColorStop(0, `rgba(255, 255, 255, ${slashPulse * 0.8})`);
    tipGrad.addColorStop(0.4, `rgba(${style.rgb}, ${slashPulse * 0.5})`);
    tipGrad.addColorStop(1, `rgba(${style.rgb}, 0)`);
    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.arc(tipX, tipY, tipGlowSize, 0, Math.PI * 2);
    ctx.fill();

    // Trail particles along the arc
    const particleCount = 4;
    for (let i = 0; i < particleCount; i++) {
      const pAngle = arcStart + (i / particleCount) * (arcEnd - arcStart);
      const pDist = offsetR + (stableNoise(seed + i * 3.7 + s * 11) - 0.5) * size * 0.08;
      const px = arcCenterX + Math.cos(pAngle) * pDist;
      const py = arcCenterY + Math.sin(pAngle) * pDist;
      const pAlpha = slashPulse * 0.5 * (1 - i / particleCount);
      ctx.fillStyle = `rgba(${style.sparkRgb}, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // IMPACT SPARKS at the end of the slash
  if (phase < 0.35) {
    const sparkProgress = phase / 0.35;
    const sparkCount = 5;
    for (let i = 0; i < sparkCount; i++) {
      const baseAngle = Math.PI * 0.35 + (stableNoise(seed + i * 7) - 0.5) * Math.PI * 0.4;
      const dist = slashRadius * (0.8 + (1 - sparkProgress) * 0.5);
      const sx = arcCenterX + Math.cos(baseAngle) * dist;
      const sy = arcCenterY + Math.sin(baseAngle) * dist;
      ctx.fillStyle = `rgba(${style.sparkRgb}, ${sparkProgress * 0.6})`;
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.025 * sparkProgress, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Speed lines behind the slash (emphasize motion)
  if (pulse > 0.3) {
    const lineAlpha = (pulse - 0.3) * 0.4;
    ctx.strokeStyle = `rgba(${style.rgb}, ${lineAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    for (let i = 0; i < 3; i++) {
      const lineY = y - size * 0.2 + i * size * 0.15;
      const lineStartX = x + size * 0.2 + i * size * 0.05;
      const lineEndX = x + size * 0.5 + i * size * 0.1;
      ctx.beginPath();
      ctx.moveTo(lineStartX, lineY);
      ctx.lineTo(lineEndX, lineY);
      ctx.stroke();
    }
  }
}

// ============================================================================
// MAGIC ATTACK
// ============================================================================

function renderMagicAttack(
  ctx: CanvasRenderingContext2D,
  type: EnemyType,
  x: number,
  y: number,
  size: number,
  phase: number,
  time: number,
  zoom: number,
  seed: number,
): void {
  const style = getMagicStyle(type);
  const pulse = Math.sin(phase * Math.PI);

  // Casting origin is at the hands (slightly forward and up)
  const castX = x - size * 0.2;
  const castY = y - size * 0.15;

  // CASTING GLOW at origin
  if (phase > 0.4) {
    const chargePhase = (phase - 0.4) / 0.6;
    const chargeSize = size * 0.2 * easeInOutSine(chargePhase);
    const grad = ctx.createRadialGradient(castX, castY, 0, castX, castY, chargeSize);
    grad.addColorStop(0, `rgba(255, 255, 255, ${chargePhase * 0.7})`);
    grad.addColorStop(0.3, `rgba(${style.coreRgb}, ${chargePhase * 0.6})`);
    grad.addColorStop(1, `rgba(${style.glowRgb}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(castX, castY, chargeSize, 0, Math.PI * 2);
    ctx.fill();
  }

  if (style.shape === "burst" || style.shape === "vortex") {
    // DIRECTIONAL ENERGY BURST toward target
    if (phase < 0.8) {
      const burstProgress = easeOutCubic(1 - phase / 0.8);
      const burstDist = size * burstProgress * 0.8;
      const burstX = castX - burstDist;
      const burstRadius = size * (0.15 + pulse * 0.2);

      const burstGrad = ctx.createRadialGradient(burstX, castY, 0, burstX, castY, burstRadius);
      burstGrad.addColorStop(0, `rgba(${style.coreRgb}, ${phase * 0.6})`);
      burstGrad.addColorStop(0.5, `rgba(${style.glowRgb}, ${phase * 0.3})`);
      burstGrad.addColorStop(1, `rgba(${style.glowRgb}, 0)`);
      ctx.fillStyle = burstGrad;
      ctx.beginPath();
      ctx.arc(burstX, castY, burstRadius, 0, Math.PI * 2);
      ctx.fill();

      // Energy trail connecting cast point to burst
      if (burstDist > size * 0.1) {
        ctx.strokeStyle = `rgba(${style.coreRgb}, ${phase * 0.4})`;
        ctx.lineWidth = 2 * zoom * (phase);
        ctx.beginPath();
        ctx.moveTo(castX, castY);
        ctx.quadraticCurveTo(
          castX - burstDist * 0.5, castY - size * 0.05 * Math.sin(time * 8),
          burstX, castY,
        );
        ctx.stroke();
      }
    }

    // MAGIC PARTICLES streaming forward
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      const pPhase = ((time * 3 + i * 1.2) % 1);
      const pDist = size * pPhase * 0.6;
      const pSpread = Math.sin(time * 5 + i * 2.3) * size * 0.08;
      const pAlpha = (1 - pPhase) * pulse * 0.5;
      if (pAlpha < 0.02) continue;
      ctx.fillStyle = `rgba(${style.coreRgb}, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(castX - pDist, castY + pSpread, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style.shape === "wave") {
    // WAVE EFFECT (banshee scream, necro wave) - cone expanding forward
    if (phase < 0.85) {
      const waveProgress = easeOutCubic(1 - phase / 0.85);
      const waveLength = size * waveProgress * 1.2;
      const waveHeight = size * (0.2 + waveProgress * 0.4);

      ctx.save();
      ctx.globalAlpha = phase * 0.5;

      // Multiple wave arcs expanding forward — isometric ground projection
      for (let w = 0; w < 3; w++) {
        const wOffset = w * 0.15;
        const wPhase = Math.max(0, waveProgress - wOffset);
        if (wPhase <= 0) continue;

        const wDist = size * wPhase * 1.0;
        const wArcR = wDist * 0.5 + w * size * 0.05;
        const wAlpha = (1 - wPhase) * 0.6;
        ctx.strokeStyle = `rgba(${style.coreRgb}, ${wAlpha})`;
        ctx.lineWidth = (3 - w) * zoom;
        ctx.beginPath();
        ctx.ellipse(
          castX - wDist * 0.3, castY,
          wArcR, wArcR * ISO_Y_RATIO,
          0,
          -Math.PI * 0.4, Math.PI * 0.4,
        );
        ctx.stroke();
      }
      ctx.restore();

      // Forward-moving glow — isometric ellipse
      const glowX = castX - waveLength * 0.4;
      const glowRx = waveHeight * 1.3;
      const glowGrad = ctx.createRadialGradient(glowX, castY, 0, glowX, castY, glowRx);
      glowGrad.addColorStop(0, `rgba(${style.coreRgb}, ${phase * 0.3})`);
      glowGrad.addColorStop(1, `rgba(${style.glowRgb}, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(glowX, castY, glowRx, glowRx * ISO_Y_RATIO, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (style.shape === "vortex") {
    // Additional vortex swirl around the cast point
    const swirlCount = 4;
    for (let i = 0; i < swirlCount; i++) {
      const sAngle = time * 6 + (i / swirlCount) * Math.PI * 2;
      const sDist = size * 0.2 * pulse;
      const sx = castX + Math.cos(sAngle) * sDist;
      const sy = castY + Math.sin(sAngle) * sDist * ISO_Y_RATIO;
      ctx.fillStyle = `rgba(${style.runeRgb}, ${pulse * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy, size * 0.025, size * 0.025 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // RUNE CIRCLE beneath caster
  if (pulse > 0.2) {
    const runeAlpha = (pulse - 0.2) * 0.4;
    ctx.strokeStyle = `rgba(${style.runeRgb}, ${runeAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    const runeRadius = size * 0.35;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.35, runeRadius, runeRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rune markers on the circle
    const markerCount = 4;
    for (let i = 0; i < markerCount; i++) {
      const mAngle = (i / markerCount) * Math.PI * 2 + time * 1.5;
      const mx = x + Math.cos(mAngle) * runeRadius;
      const my = y + size * 0.35 + Math.sin(mAngle) * runeRadius * ISO_Y_RATIO;
      ctx.fillStyle = `rgba(${style.runeRgb}, ${runeAlpha * 1.5})`;
      ctx.beginPath();
      ctx.moveTo(mx, my - size * 0.03);
      ctx.lineTo(mx + size * 0.02, my);
      ctx.lineTo(mx, my + size * 0.03);
      ctx.lineTo(mx - size * 0.02, my);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ============================================================================
// BITE/SNAP ATTACK
// ============================================================================

function renderBiteAttack(
  ctx: CanvasRenderingContext2D,
  type: EnemyType,
  x: number,
  y: number,
  size: number,
  phase: number,
  time: number,
  zoom: number,
  seed: number,
): void {
  const style = getBiteStyle(type);
  const pulse = Math.sin(phase * Math.PI);
  const jawSize = size * 0.4 * style.jawScale;

  // Bite target is forward (left in local coords)
  const biteX = x - size * 0.3;
  const biteY = y;

  // JAW ANIMATION - open wide then snap shut
  // phase 1→0: Open jaws (phase > 0.5) then snap (phase < 0.5)
  const jawOpen = phase > 0.5
    ? easeOutCubic((phase - 0.5) * 2) * 0.45
    : easeOutCubic(1 - phase * 2) * 0.1;

  // Upper jaw
  ctx.strokeStyle = `rgba(${style.jawRgb}, ${pulse * 0.8})`;
  ctx.lineWidth = 3.5 * zoom * style.jawScale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(
    biteX, biteY,
    jawSize,
    Math.PI - jawOpen - 0.3,
    Math.PI + jawOpen + 0.3,
  );
  ctx.stroke();

  // Lower jaw
  ctx.beginPath();
  ctx.arc(
    biteX, biteY,
    jawSize,
    -jawOpen - 0.3,
    jawOpen + 0.3,
  );
  ctx.stroke();

  // TEETH along jaws
  if (pulse > 0.3) {
    ctx.fillStyle = `rgba(${style.teethRgb}, ${pulse * 0.7})`;
    const teethCount = 4 + Math.floor(style.jawScale);
    for (let i = 0; i < teethCount; i++) {
      // Upper teeth
      const tAngle = Math.PI - jawOpen + (i / teethCount) * (jawOpen * 2 + 0.6) - 0.3;
      const outerR = jawSize * 1.05;
      const innerR = jawSize * 0.85;
      const tx = biteX + Math.cos(tAngle) * outerR;
      const ty = biteY + Math.sin(tAngle) * outerR;
      const tix = biteX + Math.cos(tAngle) * innerR;
      const tiy = biteY + Math.sin(tAngle) * innerR;

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tix, tiy);
      ctx.lineTo(tx + size * 0.015, ty + size * 0.01);
      ctx.closePath();
      ctx.fill();

      // Lower teeth (mirrored)
      const bAngle = -jawOpen + (i / teethCount) * (jawOpen * 2 + 0.6) - 0.3;
      const bx = biteX + Math.cos(bAngle) * outerR;
      const by = biteY + Math.sin(bAngle) * outerR;
      const bix = biteX + Math.cos(bAngle) * innerR;
      const biy = biteY + Math.sin(bAngle) * innerR;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bix, biy);
      ctx.lineTo(bx + size * 0.015, by - size * 0.01);
      ctx.closePath();
      ctx.fill();
    }
  }

  // SNAP IMPACT FLASH when jaws close
  if (phase < 0.45 && phase > 0.1) {
    const snapIntensity = 1 - Math.abs(phase - 0.25) / 0.2;
    if (snapIntensity > 0) {
      const flashGrad = ctx.createRadialGradient(biteX, biteY, 0, biteX, biteY, jawSize * 0.5);
      flashGrad.addColorStop(0, `rgba(255, 255, 255, ${snapIntensity * 0.5})`);
      flashGrad.addColorStop(0.5, `rgba(${style.fluidRgb}, ${snapIntensity * 0.3})`);
      flashGrad.addColorStop(1, `rgba(${style.fluidRgb}, 0)`);
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(biteX, biteY, jawSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // DRAGON FIRE BREATH (special for dragon type)
  if (type === "dragon" && phase < 0.7) {
    const breathProgress = easeOutCubic(1 - phase / 0.7);
    const breathLen = size * breathProgress * 1.0;
    const breathWidth = size * 0.15 * (1 + breathProgress * 0.5);

    ctx.save();
    ctx.translate(biteX, biteY);

    const fireGrad = ctx.createLinearGradient(0, 0, -breathLen, 0);
    fireGrad.addColorStop(0, `rgba(255, 200, 50, ${phase * 0.5})`);
    fireGrad.addColorStop(0.4, `rgba(255, 100, 20, ${phase * 0.4})`);
    fireGrad.addColorStop(1, `rgba(255, 50, 10, 0)`);
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.moveTo(0, -breathWidth * 0.3);
    ctx.quadraticCurveTo(-breathLen * 0.5, -breathWidth, -breathLen, -breathWidth * 0.5);
    ctx.lineTo(-breathLen, breathWidth * 0.5);
    ctx.quadraticCurveTo(-breathLen * 0.5, breathWidth, 0, breathWidth * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // FLUID DROPLETS after bite
  if (phase < 0.3) {
    const dripProgress = 1 - phase / 0.3;
    for (let i = 0; i < 4; i++) {
      const dAngle = Math.PI + (stableNoise(seed + i * 5) - 0.5) * Math.PI * 0.6;
      const dDist = jawSize * (0.3 + dripProgress * 0.6);
      const gravity = dripProgress * dripProgress * size * 0.3;
      const dx = biteX + Math.cos(dAngle) * dDist;
      const dy = biteY + Math.sin(dAngle) * dDist + gravity;
      const dAlpha = (1 - dripProgress) * 0.5;

      ctx.fillStyle = `rgba(${style.fluidRgb}, ${dAlpha})`;
      ctx.beginPath();
      ctx.ellipse(dx, dy, size * 0.015, size * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============================================================================
// DEFAULT MELEE ATTACK
// ============================================================================

function renderDefaultMelee(
  ctx: CanvasRenderingContext2D,
  type: EnemyType,
  x: number,
  y: number,
  size: number,
  phase: number,
  time: number,
  zoom: number,
  seed: number,
  enemyColor: string,
): void {
  const pulse = Math.sin(phase * Math.PI);

  // Per-type color customization for default melee
  let impactRgb = "255, 230, 180";
  let sparkRgb = "255, 250, 220";
  switch (type) {
    case "frosh": case "sophomore": case "junior":
      impactRgb = "100, 200, 255"; sparkRgb = "180, 230, 255"; break;
    case "mascot":
      impactRgb = "255, 160, 50"; sparkRgb = "255, 200, 100"; break;
    case "harpy":
      impactRgb = "200, 150, 255"; sparkRgb = "230, 200, 255"; break;
    case "frostling":
      impactRgb = "130, 210, 255"; sparkRgb = "200, 235, 255"; break;
    case "nomad":
      impactRgb = "220, 180, 100"; sparkRgb = "240, 220, 170"; break;
    case "archer": case "crossbowman":
      impactRgb = "180, 140, 80"; sparkRgb = "220, 200, 150"; break;
    case "professor":
      impactRgb = "200, 80, 80"; sparkRgb = "240, 150, 150"; break;
  }

  // Impact point forward of enemy
  const hitX = x - size * 0.35;
  const hitY = y - size * 0.05;

  // FORWARD STRIKE ARC
  const strikeProgress = easeOutCubic(1 - phase);
  const arcRadius = size * 0.5;
  const arcStart = -Math.PI * 0.6 + strikeProgress * Math.PI * 0.8;
  const trailLen = 0.7 * phase;

  // Glow trail
  ctx.strokeStyle = `rgba(${impactRgb}, ${pulse * 0.3})`;
  ctx.lineWidth = 6 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(hitX, hitY, arcRadius, arcStart - trailLen, arcStart);
  ctx.stroke();

  // Main strike line
  ctx.strokeStyle = `rgba(${impactRgb}, ${pulse * 0.7})`;
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.arc(hitX, hitY, arcRadius, arcStart - trailLen * 0.7, arcStart);
  ctx.stroke();

  // White core
  ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(hitX, hitY, arcRadius, arcStart - trailLen * 0.4, arcStart);
  ctx.stroke();

  // IMPACT STAR at strike point
  if (phase < 0.5 && phase > 0.1) {
    const starIntensity = 1 - Math.abs(phase - 0.3) / 0.2;
    if (starIntensity > 0) {
      const starSize = size * 0.15 * starIntensity;
      const starX = hitX + Math.cos(arcStart) * arcRadius;
      const starY = hitY + Math.sin(arcStart) * arcRadius;

      // Star glow
      const starGrad = ctx.createRadialGradient(starX, starY, 0, starX, starY, starSize);
      starGrad.addColorStop(0, `rgba(255, 255, 255, ${starIntensity * 0.7})`);
      starGrad.addColorStop(0.4, `rgba(${impactRgb}, ${starIntensity * 0.4})`);
      starGrad.addColorStop(1, `rgba(${impactRgb}, 0)`);
      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
      ctx.fill();

      // Star rays
      ctx.strokeStyle = `rgba(255, 255, 255, ${starIntensity * 0.5})`;
      ctx.lineWidth = 1.5 * zoom;
      for (let i = 0; i < 4; i++) {
        const rayAngle = (i / 4) * Math.PI * 2 + time * 2;
        ctx.beginPath();
        ctx.moveTo(
          starX + Math.cos(rayAngle) * starSize * 0.3,
          starY + Math.sin(rayAngle) * starSize * 0.3,
        );
        ctx.lineTo(
          starX + Math.cos(rayAngle) * starSize * 1.2,
          starY + Math.sin(rayAngle) * starSize * 1.2,
        );
        ctx.stroke();
      }
    }
  }

  // SPEED LINES behind the strike (in the backward direction = right in local coords)
  if (pulse > 0.3) {
    const lineAlpha = (pulse - 0.3) * 0.35;
    ctx.strokeStyle = `rgba(${sparkRgb}, ${lineAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    for (let i = 0; i < 3; i++) {
      const yOff = (i - 1) * size * 0.12;
      ctx.beginPath();
      ctx.moveTo(x + size * 0.15 + i * size * 0.03, y + yOff);
      ctx.lineTo(x + size * 0.4 + i * size * 0.05, y + yOff);
      ctx.stroke();
    }
  }

  // IMPACT PARTICLES scattering
  if (phase < 0.3) {
    const scatterProgress = 1 - phase / 0.3;
    for (let i = 0; i < 4; i++) {
      const pAngle = Math.PI + (stableNoise(seed + i * 4.3) - 0.5) * Math.PI * 0.8;
      const pDist = size * (0.15 + scatterProgress * 0.35);
      const px = hitX + Math.cos(pAngle) * pDist;
      const py = hitY + Math.sin(pAngle) * pDist - scatterProgress * size * 0.1;
      const pAlpha = (1 - scatterProgress) * 0.5;

      ctx.fillStyle = `rgba(${sparkRgb}, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.02 * (1 - scatterProgress * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============================================================================
// MAIN DISPATCHER
// ============================================================================

export function renderEnemyAttackEffect(
  ctx: CanvasRenderingContext2D,
  enemyType: EnemyType,
  x: number,
  y: number,
  size: number,
  attackPhase: number,
  time: number,
  zoom: number,
  isFlying: boolean,
  enemyColor: string,
  seedValue: number,
): void {
  if (HEAVY_GROUND_SLAM_TYPES.has(enemyType) && !isFlying) {
    renderGroundSlam(ctx, enemyType, x, y, size, attackPhase, time, zoom, seedValue);
  } else if (SLASH_ATTACK_TYPES.has(enemyType)) {
    renderSlashAttack(ctx, enemyType, x, y, size, attackPhase, time, zoom, seedValue);
  } else if (MAGIC_ATTACK_TYPES.has(enemyType)) {
    renderMagicAttack(ctx, enemyType, x, y, size, attackPhase, time, zoom, seedValue);
  } else if (BITE_ATTACK_TYPES.has(enemyType)) {
    renderBiteAttack(ctx, enemyType, x, y, size, attackPhase, time, zoom, seedValue);
  } else {
    renderDefaultMelee(ctx, enemyType, x, y, size, attackPhase, time, zoom, seedValue, enemyColor);
  }
}
