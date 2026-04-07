import type { Enemy } from "../types";

type EnemyMutator = (enemy: Enemy) => Enemy;

/**
 * Collects per-enemy mutations from multiple subsystems and applies
 * them in a single setEnemies pass, eliminating redundant .map() iterations.
 */
export class EnemyMutationBatch {
  private mutators = new Map<string, EnemyMutator[]>();

  /**
   * Queue a simple partial-property merge for an enemy.
   */
  merge(id: string, partial: Partial<Enemy>): void {
    const fns = this.mutators.get(id);
    const fn: EnemyMutator = (e) => ({ ...e, ...partial });
    if (fns) {
      fns.push(fn);
    } else {
      this.mutators.set(id, [fn]);
    }
  }

  /**
   * Queue an arbitrary transform for an enemy.
   * Use for mutations that compute derived values or have conditional logic.
   */
  transform(id: string, fn: EnemyMutator): void {
    const fns = this.mutators.get(id);
    if (fns) {
      fns.push(fn);
    } else {
      this.mutators.set(id, [fn]);
    }
  }

  get size(): number {
    return this.mutators.size;
  }

  /**
   * Apply all batched mutations in a single setEnemies call.
   * Clears the batch afterwards.
   */
  flush(setEnemies: (fn: (prev: Enemy[]) => Enemy[]) => void): void {
    if (this.mutators.size === 0) {
      return;
    }

    const batch = this.mutators;
    setEnemies((prev) =>
      prev.map((enemy) => {
        const fns = batch.get(enemy.id);
        if (!fns) {
          return enemy;
        }
        let result = enemy;
        for (const fn of fns) {
          result = fn(result);
        }
        return result;
      })
    );

    this.mutators = new Map();
  }
}
