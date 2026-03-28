import type { Dispatch, SetStateAction } from "react";
import type {
  Position,
  Enemy,
  Hero,
  Troop,
  Tower,
  Effect,
  Particle,
  TroopType,
  HeroType,
  DeathCause,
} from "../../types";
import {
  HERO_DATA,
  TROOP_DATA,
  HERO_ABILITY_COOLDOWNS,
  HERO_COMBAT_STATS,
  DEFAULT_TROOP_HP,
} from "../../constants";
import {
  distance,
  generateId,
} from "../../utils";
import {
  getEnemyPosWithPath,
} from "../../game/setup";
import {
  getEnemyDamageTaken,
} from "../../game/status";
import { gridToWorld } from "../../utils";
import { isDefined } from "./runtimeConfig";

type Setter<T> = Dispatch<SetStateAction<T>>;

export interface HeroAbilityParams {
  hero: Hero;
  enemies: Enemy[];
  selectedMap: string;
  gameSpeed: number;
  setHero: Setter<Hero | null>;
  setEnemies: Setter<Enemy[]>;
  setTowers: Setter<Tower[]>;
  setTroops: Setter<Troop[]>;
  setEffects: Setter<Effect[]>;
  addParticles: (pos: Position, type: Particle["type"], count: number) => void;
  onEnemyKill: (enemy: Enemy, pos: Position, particleCount?: number, cause?: DeathCause) => void;
  addTroopEntities: (troops: Troop[]) => void;
  addTroopEntity: (troop: Troop) => void;
}

function triggerTigerRoar(p: HeroAbilityParams): void {
  const { hero, enemies, selectedMap, setEnemies, setEffects, addParticles } = p;
  const roarRadius = 180;
  const nearbyEnemies = enemies.filter(
    (e) => distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) < roarRadius
  );
  nearbyEnemies.forEach((e) => {
    setEnemies((prev) =>
      prev.map((enemy) =>
        enemy.id === e.id
          ? { ...enemy, stunUntil: Date.now() + 3000, slowEffect: 0.5 }
          : enemy
      )
    );
  });
  setEffects((ef) => [
    ...ef,
    {
      id: generateId("roar"),
      pos: hero.pos,
      type: "roar_wave",
      progress: 0,
      size: roarRadius,
    },
  ]);
  addParticles(hero.pos, "spark", 30);
  addParticles(hero.pos, "explosion", 15);
}

function triggerTenorHighNote(p: HeroAbilityParams): void {
  const { hero, enemies, selectedMap, setEnemies, setTroops, setEffects, addParticles, onEnemyKill } = p;
  const noteRadius = 250;
  const healRadius = 200;
  const healAmount = 75;

  const nearbyEnemies = enemies.filter(
    (e) => distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) < noteRadius
  );
  setEnemies((prev) =>
    prev
      .map((e) => {
        const isTarget = nearbyEnemies.find((ne) => ne.id === e.id);
        if (isTarget) {
          const newHp = e.hp - getEnemyDamageTaken(e, 80);
          if (newHp <= 0) {
            onEnemyKill(e, getEnemyPosWithPath(e, selectedMap), 8, "sonic");
            return null;
          }
          return {
            ...e,
            hp: newHp,
            stunUntil: Date.now() + 2000,
            damageFlash: 200,
          };
        }
        return e;
      })
      .filter(isDefined)
  );

  setTroops((prev) =>
    prev.map((t) => {
      if (!t.dead && !t.isHexGhost && distance(t.pos, hero.pos) < healRadius) {
        addParticles(t.pos, "heal", 6);
        return {
          ...t,
          hp: Math.min(t.maxHp, t.hp + healAmount),
          healFlash: Date.now(),
        };
      }
      return t;
    })
  );

  setEffects((ef) => [
    ...ef,
    {
      id: generateId("note"),
      pos: hero.pos,
      type: "high_note",
      progress: 0,
      size: noteRadius,
    },
  ]);
  addParticles(hero.pos, "light", 35);
  addParticles(hero.pos, "heal", 20);
}

function triggerMatheyShield(p: HeroAbilityParams): void {
  const { hero, enemies, selectedMap, setHero, setEnemies, setEffects, addParticles } = p;
  const tauntRadius = 150;
  const duration = 10000;

  setHero((prev) =>
    prev
      ? { ...prev, shieldActive: true, shieldEnd: Date.now() + duration }
      : null
  );

  setEnemies((prev) =>
    prev.map((enemy) => {
      const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
      if (distance(hero.pos, enemyPos) < tauntRadius) {
        return { ...enemy, taunted: true, tauntTarget: hero.id };
      }
      return enemy;
    })
  );

  setEffects((ef) => [
    ...ef,
    {
      id: generateId("shield"),
      pos: { ...hero.pos },
      type: "fortress_shield",
      progress: 0,
      size: 80,
      duration,
    },
  ]);
  addParticles(hero.pos, "glow", 25);
  addParticles(hero.pos, "spark", 15);
}

function triggerRockyBoulderStrike(p: HeroAbilityParams): void {
  const { hero, enemies, selectedMap, setEnemies, setEffects, addParticles, onEnemyKill } = p;
  const throwRange = 350;
  const boulderDamage = 180;
  const maxBoulders = 5;

  const enemiesInRange = enemies
    .filter((e) => !e.dead && distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) <= throwRange)
    .map((e) => ({
      enemy: e,
      dist: distance(hero.pos, getEnemyPosWithPath(e, selectedMap)),
      pos: getEnemyPosWithPath(e, selectedMap),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, maxBoulders);

  if (enemiesInRange.length === 0) {
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 150 + Math.random() * 100;
      setEffects((ef) => [
        ...ef,
        {
          id: generateId("boulder"),
          pos: { ...hero.pos },
          type: "boulder_strike",
          progress: 0,
          size: 40,
          targetPos: {
            x: hero.pos.x + Math.cos(angle) * dist,
            y: hero.pos.y + Math.sin(angle) * dist,
          },
        },
      ]);
    }
    addParticles(hero.pos, "smoke", 10);
    return;
  }

  const newEffects: Effect[] = [];
  enemiesInRange.forEach((target, idx) => {
    newEffects.push({
      id: generateId(`boulder-${idx}`),
      pos: { ...hero.pos },
      type: "boulder_strike",
      progress: 0,
      size: 45,
      targetPos: { ...target.pos },
    });
  });

  setEffects((ef) => [...ef, ...newEffects]);

  setEnemies((prev) =>
    prev
      .map((e) => {
        const isTarget = enemiesInRange.find((t) => t.enemy.id === e.id);
        if (isTarget) {
          const newHp = e.hp - getEnemyDamageTaken(e, boulderDamage);
          if (newHp <= 0) {
            onEnemyKill(e, getEnemyPosWithPath(e, selectedMap), 12);
            return null;
          }
          return {
            ...e,
            hp: newHp,
            stunUntil: Date.now() + 800,
            damageFlash: 300,
          };
        }
        return e;
      })
      .filter(isDefined)
  );

  addParticles(hero.pos, "smoke", 15);
  addParticles(hero.pos, "explosion", 8);
}

function triggerScottInspiration(p: HeroAbilityParams): void {
  const { hero, setTowers, setEffects, addParticles } = p;
  const boostRadius = 450;
  setTowers((prev) =>
    prev.map((t) => {
      if (t.type === "club") return t;
      const tWorldPos = gridToWorld(t.pos);
      if (distance(hero.pos, tWorldPos) <= boostRadius) {
        return {
          ...t,
          boostEnd: Date.now() + 8000,
          isBuffed: true,
        };
      }
      return t;
    })
  );
  setEffects((ef) => [
    ...ef,
    {
      id: generateId("inspire"),
      pos: hero.pos,
      type: "inspiration",
      progress: 0,
      size: 300,
      duration: 8000,
    },
  ]);
  addParticles(hero.pos, "light", 30);
  addParticles(hero.pos, "gold", 20);
}

function triggerCaptainRally(p: HeroAbilityParams): void {
  const { hero, setEffects, addParticles, addTroopEntities } = p;
  const summonedKnightHP = HERO_COMBAT_STATS.captainKnightHp;
  const knightOffsets = [
    { x: -35, y: -20 },
    { x: 35, y: -20 },
    { x: 0, y: 35 },
  ];
  const newTroops: Troop[] = knightOffsets.map((offset) => {
    const knightPos = { x: hero.pos.x + offset.x, y: hero.pos.y + offset.y };
    return {
      id: generateId("troop"),
      ownerId: hero.id,
      ownerType: "hero_summon" as const,
      type: "knight" as TroopType,
      pos: knightPos,
      hp: summonedKnightHP,
      maxHp: summonedKnightHP,
      moving: false,
      targetPos: undefined,
      targetEnemy: null,
      rallyPoint: null,
      selected: false,
      lastAttack: 0,
      rotation: 0,
      facingRight: true,
      attackAnim: 0,
      spawnPoint: knightPos,
      moveRadius: HERO_COMBAT_STATS.captainKnightMoveRadius,
      userTargetPos: knightPos,
    };
  });
  addTroopEntities(newTroops);
  setEffects((ef) => [
    ...ef,
    {
      id: generateId("summon"),
      pos: hero.pos,
      type: "knight_summon",
      progress: 0,
      size: 80,
    },
  ]);
  addParticles(hero.pos, "spark", 25);
  addParticles(hero.pos, "gold", 15);
}

function triggerEngineerTurret(p: HeroAbilityParams): void {
  const { hero, setEffects, addParticles, addTroopEntity } = p;
  const turretPos = { x: hero.pos.x + 40, y: hero.pos.y };
  const turretHP = HERO_COMBAT_STATS.engineerTurretHp;
  const newTurret: Troop = {
    id: generateId("turret"),
    ownerId: hero.id,
    type: "turret" as TroopType,
    pos: turretPos,
    hp: turretHP,
    maxHp: turretHP,
    moving: false,
    targetPos: undefined,
    targetEnemy: null,
    rallyPoint: null,
    selected: false,
    lastAttack: 0,
    rotation: 0,
    facingRight: true,
    attackAnim: 0,
    spawnPoint: turretPos,
    moveRadius: 0,
  };
  addTroopEntity(newTurret);
  setEffects((ef) => [
    ...ef,
    {
      id: generateId("deploy"),
      pos: turretPos,
      type: "turret_deploy",
      progress: 0,
      size: 60,
    },
  ]);
  addParticles(turretPos, "spark", 30);
  addParticles(turretPos, "smoke", 10);
}

function triggerNassauInferno(p: HeroAbilityParams): void {
  const { hero, enemies, selectedMap, setHero, setEnemies, setEffects, addParticles, onEnemyKill } = p;
  const diveRadius = HERO_COMBAT_STATS.nassauDiveRadius;
  const diveDamage = HERO_COMBAT_STATS.nassauDiveDamage;
  const burnDuration = HERO_COMBAT_STATS.nassauBurnDuration;

  const nearbyEnemies = enemies.filter(
    (e) => !e.dead && distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) <= diveRadius
  );

  setEnemies((prev) =>
    prev
      .map((e) => {
        const isTarget = nearbyEnemies.find((ne) => ne.id === e.id);
        if (isTarget) {
          const actualDmg = getEnemyDamageTaken(e, diveDamage);
          const newHp = e.hp - actualDmg;
          if (newHp <= 0) {
            onEnemyKill(e, getEnemyPosWithPath(e, selectedMap), 15, "fire");
            return null;
          }
          return {
            ...e,
            hp: newHp,
            burning: true,
            burnDamage: HERO_COMBAT_STATS.nassauBurnDps,
            burnUntil: Date.now() + burnDuration,
            stunUntil: Date.now() + 500,
            damageFlash: 300,
          };
        }
        return e;
      })
      .filter(isDefined)
  );

  setHero((prev) =>
    prev
      ? { ...prev, shieldActive: true, shieldEnd: Date.now() + 1500 }
      : null
  );

  setEffects((ef) => [
    ...ef,
    {
      id: generateId("phoenix-dive"),
      pos: hero.pos,
      type: "phoenix_dive",
      progress: 0,
      size: diveRadius,
    },
    {
      id: generateId("phoenix-fire"),
      pos: hero.pos,
      type: "fire_nova",
      progress: 0,
      size: diveRadius * 0.8,
    },
  ]);
  addParticles(hero.pos, "explosion", 30);
  addParticles(hero.pos, "spark", 25);
  addParticles(hero.pos, "smoke", 15);
}

function triggerIvyVineStorm(p: HeroAbilityParams): void {
  const { hero, enemies, selectedMap, setEnemies, setEffects, addParticles, onEnemyKill } = p;
  const vineRadius = HERO_COMBAT_STATS.ivyVineRadius;
  const vineDamage = HERO_COMBAT_STATS.ivyVineDamage;
  const rootDuration = HERO_COMBAT_STATS.ivyRootDuration;

  const nearbyEnemies = enemies.filter(
    (e) => !e.dead && distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) <= vineRadius
  );

  setEnemies((prev) =>
    prev
      .map((e) => {
        const isTarget = nearbyEnemies.find((ne) => ne.id === e.id);
        if (isTarget) {
          const actualDmg = getEnemyDamageTaken(e, vineDamage);
          const newHp = e.hp - actualDmg;
          if (newHp <= 0) {
            onEnemyKill(e, getEnemyPosWithPath(e, selectedMap), 10);
            return null;
          }
          return {
            ...e,
            hp: newHp,
            stunUntil: Date.now() + rootDuration,
            slowEffect: 0.7,
            damageFlash: 250,
          };
        }
        return e;
      })
      .filter(isDefined)
  );

  setEffects((ef) => [
    ...ef,
    {
      id: generateId("vine-storm"),
      pos: hero.pos,
      type: "vine_storm",
      progress: 0,
      size: vineRadius,
      duration: rootDuration,
    },
  ]);
  addParticles(hero.pos, "glow", 30);
  addParticles(hero.pos, "heal", 20);
}

const HERO_ABILITY_DISPATCH: Record<HeroType, (p: HeroAbilityParams) => void> = {
  tiger: triggerTigerRoar,
  tenor: triggerTenorHighNote,
  mathey: triggerMatheyShield,
  rocky: triggerRockyBoulderStrike,
  scott: triggerScottInspiration,
  captain: triggerCaptainRally,
  engineer: triggerEngineerTurret,
  nassau: triggerNassauInferno,
  ivy: triggerIvyVineStorm,
};

export function triggerHeroAbilityImpl(p: HeroAbilityParams): void {
  const { hero, gameSpeed, setHero } = p;
  if (gameSpeed === 0) return;
  if (!hero || !hero.abilityReady || hero.dead) return;

  const dispatch = HERO_ABILITY_DISPATCH[hero.type];
  if (dispatch) dispatch(p);

  setHero((prev) =>
    prev
      ? {
        ...prev,
        abilityReady: false,
        abilityCooldown: HERO_ABILITY_COOLDOWNS[hero.type],
      }
      : null
  );
}
