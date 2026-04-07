import type { Dispatch, SetStateAction } from "react";

import {
  HERO_DATA,
  TROOP_DATA,
  HERO_ABILITY_COOLDOWNS,
  HERO_COMBAT_STATS,
  DEFAULT_TROOP_HP,
} from "../../constants";
import { getEnemyPosWithPath } from "../../game/setup";
import { getEnemyDamageTaken } from "../../game/status";
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
import { distance, generateId } from "../../utils";
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
  onEnemyKill: (
    enemy: Enemy,
    pos: Position,
    particleCount?: number,
    cause?: DeathCause
  ) => void;
  addTroopEntities: (troops: Troop[]) => void;
  addTroopEntity: (troop: Troop) => void;
}

function triggerTigerRoar(p: HeroAbilityParams): void {
  const { hero, enemies, selectedMap, setEnemies, setEffects, addParticles } =
    p;
  const roarRadius = 180;
  const nearbyEnemies = enemies.filter(
    (e) => distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) < roarRadius
  );
  nearbyEnemies.forEach((e) => {
    setEnemies((prev) =>
      prev.map((enemy) =>
        enemy.id === e.id
          ? { ...enemy, slowEffect: 0.5, stunUntil: Date.now() + 3000 }
          : enemy
      )
    );
  });
  setEffects((ef) => [
    ...ef,
    {
      id: generateId("roar"),
      pos: hero.pos,
      progress: 0,
      size: roarRadius,
      type: "roar_wave",
    },
  ]);
  addParticles(hero.pos, "spark", 30);
  addParticles(hero.pos, "explosion", 15);
}

function triggerTenorHighNote(p: HeroAbilityParams): void {
  const {
    hero,
    enemies,
    selectedMap,
    setEnemies,
    setTroops,
    setEffects,
    addParticles,
    onEnemyKill,
  } = p;
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
            damageFlash: 200,
            hp: newHp,
            stunUntil: Date.now() + 2000,
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
          healFlash: Date.now(),
          hp: Math.min(t.maxHp, t.hp + healAmount),
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
      progress: 0,
      size: noteRadius,
      type: "high_note",
    },
  ]);
  addParticles(hero.pos, "light", 35);
  addParticles(hero.pos, "heal", 20);
}

function triggerMatheyShield(p: HeroAbilityParams): void {
  const {
    hero,
    enemies,
    selectedMap,
    setHero,
    setEnemies,
    setEffects,
    addParticles,
  } = p;
  const tauntRadius = 150;
  const duration = 10_000;

  setHero((prev) =>
    prev
      ? { ...prev, shieldActive: true, shieldEnd: Date.now() + duration }
      : null
  );

  setEnemies((prev) =>
    prev.map((enemy) => {
      const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
      if (distance(hero.pos, enemyPos) < tauntRadius) {
        return { ...enemy, tauntTarget: hero.id, taunted: true };
      }
      return enemy;
    })
  );

  setEffects((ef) => [
    ...ef,
    {
      duration,
      id: generateId("shield"),
      pos: { ...hero.pos },
      progress: 0,
      size: 80,
      type: "fortress_shield",
    },
  ]);
  addParticles(hero.pos, "glow", 25);
  addParticles(hero.pos, "spark", 15);
}

function triggerRockyBoulderStrike(p: HeroAbilityParams): void {
  const {
    hero,
    enemies,
    selectedMap,
    setEnemies,
    setEffects,
    addParticles,
    onEnemyKill,
  } = p;
  const throwRange = 350;
  const boulderDamage = 180;
  const maxBoulders = 5;

  const enemiesInRange = enemies
    .filter(
      (e) =>
        !e.dead &&
        distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) <= throwRange
    )
    .map((e) => ({
      dist: distance(hero.pos, getEnemyPosWithPath(e, selectedMap)),
      enemy: e,
      pos: getEnemyPosWithPath(e, selectedMap),
    }))
    .toSorted((a, b) => a.dist - b.dist)
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
          progress: 0,
          size: 40,
          targetPos: {
            x: hero.pos.x + Math.cos(angle) * dist,
            y: hero.pos.y + Math.sin(angle) * dist,
          },
          type: "boulder_strike",
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
      progress: 0,
      size: 45,
      targetPos: { ...target.pos },
      type: "boulder_strike",
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
            damageFlash: 300,
            hp: newHp,
            stunUntil: Date.now() + 800,
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
      if (t.type === "club") {
        return t;
      }
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
      duration: 8000,
      id: generateId("inspire"),
      pos: hero.pos,
      progress: 0,
      size: 300,
      type: "inspiration",
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
  const newTroops: Troop[] = knightOffsets.map((offset, idx) => {
    const knightPos = { x: hero.pos.x + offset.x, y: hero.pos.y + offset.y };
    return {
      attackAnim: 0,
      facingRight: true,
      hp: summonedKnightHP,
      id: generateId("troop"),
      knightVariant: idx % 3,
      lastAttack: 0,
      maxHp: summonedKnightHP,
      moveRadius: HERO_COMBAT_STATS.captainKnightMoveRadius,
      moving: false,
      ownerId: hero.id,
      ownerType: "hero_summon" as const,
      pos: knightPos,
      rallyPoint: null,
      rotation: 0,
      selected: false,
      spawnPoint: knightPos,
      targetEnemy: null,
      targetPos: undefined,
      type: "knight" as TroopType,
      userTargetPos: knightPos,
    };
  });
  addTroopEntities(newTroops);
  setEffects((ef) => [
    ...ef,
    {
      id: generateId("summon"),
      pos: hero.pos,
      progress: 0,
      size: 80,
      type: "knight_summon",
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
    attackAnim: 0,
    facingRight: true,
    hp: turretHP,
    id: generateId("turret"),
    lastAttack: 0,
    maxHp: turretHP,
    moveRadius: 0,
    moving: false,
    ownerId: hero.id,
    pos: turretPos,
    rallyPoint: null,
    rotation: 0,
    selected: false,
    spawnPoint: turretPos,
    targetEnemy: null,
    targetPos: undefined,
    type: "turret" as TroopType,
  };
  addTroopEntity(newTurret);
  setEffects((ef) => [
    ...ef,
    {
      id: generateId("deploy"),
      pos: turretPos,
      progress: 0,
      size: 60,
      type: "turret_deploy",
    },
  ]);
  addParticles(turretPos, "spark", 30);
  addParticles(turretPos, "smoke", 10);
}

function triggerNassauBlueInferno(p: HeroAbilityParams): void {
  const { hero, setHero, setEffects, addParticles } = p;
  const duration = HERO_COMBAT_STATS.nassauBlueInfernoDuration;

  setHero((prev) =>
    prev
      ? {
          ...prev,
          abilityActive: true,
          abilityEnd: Date.now() + duration,
          shieldActive: true,
          shieldEnd: Date.now() + duration,
        }
      : null
  );

  setEffects((ef) => [
    ...ef,
    {
      color: "#3b82f6",
      id: generateId("blue-inferno"),
      pos: hero.pos,
      progress: 0,
      size: 150,
      type: "fire_nova",
    },
  ]);
  addParticles(hero.pos, "explosion", 30);
  addParticles(hero.pos, "spark", 25);
}

function triggerIvyVerdantColossus(p: HeroAbilityParams): void {
  const { hero, setHero, setEffects, addParticles } = p;
  const MORPH_WINDOW = 1200;

  if (hero.abilityActive) {
    setHero((prev) =>
      prev
        ? {
            ...prev,
            abilityActive: false,
            abilityEnd: Date.now() + MORPH_WINDOW,
          }
        : null
    );
  } else {
    setHero((prev) =>
      prev
        ? {
            ...prev,
            abilityActive: true,
            abilityEnd: Date.now() + MORPH_WINDOW,
            shieldActive: true,
            shieldEnd: Date.now() + 2000,
          }
        : null
    );
  }

  setEffects((ef) => [
    ...ef,
    {
      color: "#059669",
      id: generateId("colossus-transform"),
      pos: hero.pos,
      progress: 0,
      size: 200,
      type: "vine_storm",
    },
  ]);
  addParticles(hero.pos, "glow", 35);
  addParticles(hero.pos, "heal", 25);
  addParticles(hero.pos, "explosion", 15);
}

const HERO_ABILITY_DISPATCH: Record<HeroType, (p: HeroAbilityParams) => void> =
  {
    captain: triggerCaptainRally,
    engineer: triggerEngineerTurret,
    ivy: triggerIvyVerdantColossus,
    mathey: triggerMatheyShield,
    nassau: triggerNassauBlueInferno,
    rocky: triggerRockyBoulderStrike,
    scott: triggerScottInspiration,
    tenor: triggerTenorHighNote,
    tiger: triggerTigerRoar,
  };

export function triggerHeroAbilityImpl(p: HeroAbilityParams): void {
  const { hero, gameSpeed, setHero } = p;
  if (gameSpeed === 0) {
    return;
  }
  if (!hero || !hero.abilityReady || hero.dead) {
    return;
  }

  const dispatch = HERO_ABILITY_DISPATCH[hero.type];
  if (dispatch) {
    dispatch(p);
  }

  setHero((prev) =>
    prev
      ? {
          ...prev,
          abilityCooldown: HERO_ABILITY_COOLDOWNS[hero.type],
          abilityReady: false,
        }
      : null
  );
}
