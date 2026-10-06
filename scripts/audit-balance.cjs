const fs = require("node:fs");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf-8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  module._compile(output, filename);
};

const {
  ENEMY_DATA,
  getEnemyNativeRegion,
} = require("../src/app/constants/enemies.ts");
const { HERO_DATA } = require("../src/app/constants/heroes.ts");
const { LEVEL_DATA } = require("../src/app/constants/maps.ts");
const {
  calculateTowerStats,
  TOWER_STATS,
} = require("../src/app/constants/towerStats.ts");
const { TROOP_DATA } = require("../src/app/constants/troops.ts");
const {
  getEnemyThreatScore,
  getWaveThreatScore,
  LEVEL_WAVE_THEMES,
} = require("../src/app/constants/waveBalance.ts");
const { LEVEL_WAVES } = require("../src/app/constants/waves.ts");

const errors = [];
const notes = [];
const enemyUsage = new Map();
const excludedLevelIds = new Set(["dev_enemy_showcase", "sandbox"]);

const addError = (message) => {
  errors.push(message);
};

const troopRating = (troop) => {
  const durability = troop.hp * 0.025;
  const damagePerSecond = (troop.damage * 1000) / troop.attackSpeed;
  return durability + damagePerSecond * (troop.isRanged ? 1.2 : 1);
};

const towerRating = (towerType, stats) => {
  let rating = 0;
  if (stats.attackSpeed > 0 && stats.damage > 0) {
    rating = (stats.damage * 1000) / stats.attackSpeed;
  }
  if (towerType === "lab" && (stats.chainTargets ?? 1) > 1) {
    rating *= (stats.chainTargets ?? 1) * 0.7;
  }
  if (towerType === "lab" && (stats.lockOnMaxStacks ?? 0) > 0) {
    rating *=
      1 + (stats.lockOnMaxStacks ?? 0) * (stats.lockOnDamageMult ?? 0) * 0.45;
  }
  if (towerType === "arch" && (stats.crescendoMaxStacks ?? 0) > 0) {
    const stacks = stats.crescendoMaxStacks ?? 0;
    const damageMultiplier = 1 + stacks * (stats.crescendoDamageMult ?? 0);
    const speedMultiplier = (stats.crescendoSpeedMult ?? 1) ** stacks;
    rating *= damageMultiplier / speedMultiplier;
  }
  if (towerType === "mortar") {
    const volleyMultiplier = stats.specialEffect?.includes("missile")
      ? 2.1
      : stats.specialEffect?.includes("ember")
        ? 1.65
        : 1;
    const areaMultiplier = 1 + Math.min(1.5, (stats.splashRadius ?? 0) / 120);
    rating *= volleyMultiplier * areaMultiplier;
  } else if (towerType !== "cannon" && (stats.splashRadius ?? 0) > 0) {
    rating *= 1 + Math.min(1.2, (stats.splashRadius ?? 0) / 140);
  }
  if ((stats.burnDamage ?? 0) > 0) {
    rating += stats.burnDamage ?? 0;
  }
  if ((stats.slowAmount ?? 0) > 0) {
    rating += (stats.slowAmount ?? 0) * 100;
  }
  if ((stats.stunChance ?? 0) > 0) {
    rating *= 1 + (stats.stunChance ?? 0) * ((stats.stunDuration ?? 0) / 1000);
  }
  if ((stats.income ?? 0) > 0 && (stats.incomeInterval ?? 0) > 0) {
    rating += ((stats.income ?? 0) * 18_000) / (stats.incomeInterval ?? 1);
  }
  if (stats.spawnTroopType) {
    rating +=
      troopRating(TROOP_DATA[stats.spawnTroopType]) * (stats.maxTroops ?? 1);
  }
  return rating;
};

for (const [levelId, theme] of Object.entries(LEVEL_WAVE_THEMES)) {
  if (!LEVEL_DATA[levelId]) {
    addError(`Wave profile ${levelId} has no matching level`);
  } else if (LEVEL_DATA[levelId].theme !== theme) {
    addError(
      `${levelId} wave theme ${theme} does not match map theme ${LEVEL_DATA[levelId].theme}`
    );
  }
  if (!LEVEL_WAVES[levelId]?.length) {
    addError(`${levelId} has no waves`);
  }
}

for (const [levelId, waves] of Object.entries(LEVEL_WAVES)) {
  if (excludedLevelIds.has(levelId)) {
    continue;
  }
  if (!waves.length) {
    addError(`${levelId} has an empty wave list`);
    continue;
  }

  const theme = LEVEL_WAVE_THEMES[levelId];
  let previousThreat = 0;
  let previousWasRegionalBoss = false;
  let regionalBossWaveIndex = -1;

  for (const [waveIndex, wave] of waves.entries()) {
    if (!wave.length) {
      addError(`${levelId} wave ${waveIndex + 1} is empty`);
      continue;
    }
    const threat = getWaveThreatScore(wave);
    const isRegionalBossWave = wave.some(
      (group) => ENEMY_DATA[group.type].category === "region_boss"
    );
    if (isRegionalBossWave) {
      regionalBossWaveIndex = waveIndex;
    }
    if (
      previousThreat > 0 &&
      threat + 1 < previousThreat &&
      !isRegionalBossWave &&
      !previousWasRegionalBoss
    ) {
      addError(
        `${levelId} wave ${waveIndex + 1} drops from ${Math.round(previousThreat)} to ${Math.round(threat)} threat`
      );
    }
    previousThreat = threat;
    previousWasRegionalBoss = isRegionalBossWave;

    for (const group of wave) {
      const enemy = ENEMY_DATA[group.type];
      if (!enemy) {
        addError(`${levelId} references unknown enemy ${group.type}`);
        continue;
      }
      if (!Number.isInteger(group.count) || group.count < 1) {
        addError(`${levelId} has invalid ${group.type} count ${group.count}`);
      }
      if (group.interval < 200 || group.interval > 5000) {
        addError(
          `${levelId} has invalid ${group.type} interval ${group.interval}`
        );
      }
      if ((group.delay ?? 0) < 0 || (group.delay ?? 0) > 20_000) {
        addError(`${levelId} has invalid ${group.type} delay ${group.delay}`);
      }
      enemyUsage.set(
        group.type,
        (enemyUsage.get(group.type) ?? 0) + group.count
      );
      const nativeRegion = getEnemyNativeRegion(group.type);
      if (nativeRegion && theme && nativeRegion !== theme) {
        addError(
          `${levelId} (${theme}) uses native ${nativeRegion} enemy ${group.type}`
        );
      }
    }
  }

  if (
    regionalBossWaveIndex >= 0 &&
    regionalBossWaveIndex !== waves.length - 1
  ) {
    addError(`${levelId} regional boss is not the final wave`);
  }
}

for (const [enemyType, enemy] of Object.entries(ENEMY_DATA)) {
  if (!enemyUsage.has(enemyType)) {
    addError(`${enemyType} is unused outside sandbox/showcase`);
  }
  const threat = getEnemyThreatScore(enemy);
  const rewardRatio = enemy.bounty / threat;
  if (rewardRatio < 0.01 || rewardRatio > 0.15) {
    addError(
      `${enemyType} bounty/threat ratio ${rewardRatio.toFixed(3)} is outside 0.010-0.150`
    );
  }
  if (enemy.isBoss && (enemy.liveCost ?? 1) < 2) {
    addError(`${enemyType} is a boss but costs fewer than 2 lives`);
  }
}

for (const [towerType, definition] of Object.entries(TOWER_STATS)) {
  const levelRatings = [1, 2, 3].map((level) =>
    towerRating(towerType, calculateTowerStats(towerType, level))
  );
  for (let index = 1; index < levelRatings.length; index += 1) {
    if (levelRatings[index] + 1 < levelRatings[index - 1]) {
      addError(
        `${towerType} level ${index + 1} rating ${levelRatings[index].toFixed(1)} is below its prior level`
      );
    }
  }
  for (const path of ["A", "B"]) {
    const pathRating = towerRating(
      towerType,
      calculateTowerStats(towerType, 4, path)
    );
    const capstoneRating = towerRating(
      towerType,
      calculateTowerStats(towerType, 4, path, 1, 1, true)
    );
    if (capstoneRating < pathRating * 1.12) {
      addError(
        `${towerType} ${path} capstone only improves ${((capstoneRating / pathRating - 1) * 100).toFixed(0)}%`
      );
    }
  }
  notes.push(
    `${definition.name}: ${levelRatings.map((rating) => rating.toFixed(0)).join(" → ")}`
  );
}

for (const [heroType, hero] of Object.entries(HERO_DATA)) {
  const baseDps = (hero.damage * 1000) / hero.attackSpeed;
  const targetMultiplier =
    heroType === "tenor"
      ? 3
      : ["ivy", "mathey", "nassau", "scott"].includes(heroType)
        ? 1.5
        : 1;
  const abilityContribution = heroType === "nassau" ? 12 : 0;
  const roleRating =
    hero.hp * 0.02 + baseDps * targetMultiplier + abilityContribution;
  if (roleRating < 110 || roleRating > 230) {
    addError(
      `${heroType} role rating ${roleRating.toFixed(0)} is outside 110-230`
    );
  }
}

for (const [troopType, troop] of Object.entries(TROOP_DATA)) {
  const rating = troopRating(troop);
  if (rating < 30 || rating > 210) {
    addError(
      `${troopType} troop rating ${rating.toFixed(0)} is outside 30-210`
    );
  }
}

const report = [
  `Balance audit: ${Object.keys(LEVEL_WAVE_THEMES).length} levels, ${Object.keys(ENEMY_DATA).length} enemies, ${Object.keys(TOWER_STATS).length} towers, ${Object.keys(HERO_DATA).length} heroes, ${Object.keys(TROOP_DATA).length} troops`,
  `Tower level ratings: ${notes.join(" | ")}`,
];

if (errors.length > 0) {
  report.push(
    `${errors.length} error(s):`,
    ...errors.map((error) => `- ${error}`)
  );
  process.stderr.write(`${report.join("\n")}\n`);
  process.exitCode = 1;
} else {
  report.push(
    "All usage, theme, progression, reward, and combat invariants pass."
  );
  process.stdout.write(`${report.join("\n")}\n`);
}
