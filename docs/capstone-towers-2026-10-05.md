# Final towers and defender controls

All fourteen final branches now add distinct animated architecture to their tower family. Battlefield and Codex portraits share the same drawing code and remain inside the existing bounded sprite cache. Bell swings, musical keys, rotary chambers, ember breathing, plasma rings, Tesla arcs, treasury orbits, banners, ice shards, rocket recoil, flames and the parade clock provide branch-specific motion.

The final Firestone A and Eating Club B defenders now use normal tower rally limits. Relocation saves a rally point on their owner; replacement golems and knights return there. Their death queues use the final upgrade's full simulation-time respawn interval, which respects pause and game speed. Station formations also retain their rally position when the last defender dies. The golem has walking animation and a larger, zoom-aware selection target.

Tower panels expose active capacity, effective defender HP/damage/attack interval, rally range, deployment interval, respawn countdown and a relocation button. Station final-tier bonuses are included in displayed defender stats. Codex final upgrades show animated models and effective final combat/defender stats. Circular action buttons now have accessible names and keyboard-focus tooltips.

Validation: 14 automated checks pass across capstone behavior, artwork bounds/animation, spatial targeting and cached rendering. Balance audit passes. Production build passes. TypeScript retains the pre-existing 80 diagnostics; no new diagnostics. Scoped lint has no errors; existing warnings remain in older UI/runtime files.

Browser verification at http://127.0.0.1:3047/sandbox: built Firestone through its A branch and final upgrade; verified 1/1 golem active, 4,200 HP, 105 damage per 1.45s, 280 rally range and 14s interval; used Relocate defenders and observed it walk to a different road position. Combat death/respawn timing is covered by code-path review and simulation-time helper tests rather than a complete browser death cycle.
