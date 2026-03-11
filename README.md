<div align="center">

<img src="public/images/logos/princeton-td-logo.svg" alt="Princeton TD Logo" width="80" />

# Princeton Tower Defense

A full-featured tower defense game built entirely in the browser with React, Canvas, and Next.js.

Defend Princeton-inspired battlefields across 5 hand-crafted regions with branching tower upgrades, 7 playable heroes, tactical spells, and dual-lane pressure maps that actually require you to think.

**[Play Now](https://princetontd.vercel.app/)** · **[Report Bug](https://github.com/Kevin-Liu-01/Princeton-Tower-Defense/issues)** · **[Portfolio](https://www.kevin-liu.tech/)**

</div>

---

![Volcanic Battlefield](public/images/new/gameplay_volcano_ui.png)

## What Makes This Different

Most browser TD games are simple click-and-place loops. Princeton TD is closer to a desktop-quality experience: isometric visuals rendered entirely on HTML5 Canvas, a real upgrade economy, hero units with active abilities, and map-specific hazards that change how every level plays.

Everything (towers, enemies, terrain, effects, UI) is drawn and animated in code. No sprite sheets, no game engine. Just a `requestAnimationFrame` loop and a lot of geometry.

<div align="center">

| | | |
|:---:|:---:|:---:|
| ![Grounds](public/images/new/gameplay_grounds.png) | ![Swamp](public/images/new/gameplay_swamp.png) | ![Desert](public/images/new/gameplay_desert.png) |
| *Princeton Grounds - Grassland* | *Murky Marshes - Swamp* | *Sahara Sands - Desert* |
| ![Winter](public/images/new/gameplay_winter.png) | ![Volcanic](public/images/new/gameplay_volcano.png) | ![All Towers](public/images/new/all_towers.png) |
| *Frozen Frontier - Winter* | *Volcanic Depths - Lava* | *All 7 Campus Towers* |

</div>

### Combat in Action

<div align="center">

| | | |
|:---:|:---:|:---:|
| ![Missile Barrage 1](public/images/new/gameplay_missile1.png) | ![Missile Barrage 2](public/images/new/gameplay_missile2.png) | ![Missile Barrage 3](public/images/new/gameplay_missile3.png) |
| ![Winter Missile](public/images/new/gameplay_winter_missile.png) | ![Volcano Missile](public/images/new/gameplay_volcano_missile.png) | ![Desert Missile](public/images/new/gameplay_desert_missile.png) |

</div>

## Features

### 🏰 23 Levels Across 5 Regions

Campaign and challenge maps spanning grasslands, swamps, deserts, frozen tundra, and volcanic depths. Each region introduces new enemy types, environmental hazards, and visual identities, all rendered procedurally on Canvas.

### ⚔️ 7 Towers with Branching Upgrades

Each tower has a distinct role and two final upgrade paths that change its behavior.

| Tower | Role | Upgrade Paths |
| :--- | :--- | :--- |
| **Nassau Cannon** | Heavy artillery | Gatling Gun · Flamethrower |
| **Firestone Library** | Slow + control | EQ Smasher · Blizzard |
| **E-Quad Lab** | Chain magic DPS | Focused Beam · Chain Lightning |
| **Blair Arch** | Sonic crescendo | Shockwave Siren · Symphony Hall |
| **Eating Club** | Economy | Investment Bank · Recruitment Center |
| **Dinky Station** | Troop summons | Centaur Archers · Heavy Cavalry |
| **Palmer Mortar** | Siege AoE | Missile Battery · Ember Foundry |

**Blair Arch's crescendo system** is worth calling out: consecutive hits build stacks that increase both attack speed and damage. Stacks decay when idle, so positioning matters — keep it in a busy lane and it snowballs. Shockwave Siren adds a 35% stun chance at max stacks, while Symphony Hall pushes to 12 stacks with stronger per-stack scaling and slower decay.

### 🐅 7 Playable Heroes

Heroes are persistent units you place on the field. Each has unique stats, a combat identity, and an active ability on cooldown.

| Hero | Style | Ability |
| :--- | :--- | :--- |
| **Princeton Tiger** | Melee brawler | *Mighty Roar* - AoE stun + fear |
| **Acapella Tenor** | Ranged support | *High Note* - sonic blast + ally heal |
| **Mathey Knight** | Tank | *Fortress Shield* - invincibility + taunt |
| **Rocky Raccoon** | Ranged artillery | *Boulder Bash* - massive AoE damage |
| **F. Scott** | Buffer | *Inspiration Cheer* - tower damage/range boost |
| **General Mercer** | Commander | *Rally Knights* - summon 3 armored knights |
| **BSE Engineer** | Utility | *Deploy Turret* - automated defense turret |

### ✨ Spells, Hazards & Challenge Rules

- **5 castable spells** including Fireball, Lightning, Freeze, Payday, and Reinforce, each upgradeable with earned stars.
- **Map hazards** like lava pools, quicksand, blizzard zones, and special structures (vaults, shrines, barracks, beacons) that add layer-specific objectives.
- **Challenge maps** with tower restrictions and multi-objective scoring that force non-standard strategies.

### 🗺️ World Map & Progression

A fully interactive world map with region nodes, star-gated progression, and a campaign overview. Stars earned from levels unlock new regions, challenge maps, and spell upgrades.

### 🎨 Custom Level Creator

A built-in map editor lets you design and play your own levels. Define paths, place towers, set wave compositions, and share creations.

---

## Built With

| | |
| :--- | :--- |
| **Framework** | Next.js 14 + React 18 |
| **Rendering** | HTML5 Canvas (no game engine, all custom) |
| **UI** | Tailwind CSS + Lucide icons + Radix |
| **Animation** | `requestAnimationFrame` game loop with delta-time |
| **State** | React hooks + localStorage persistence |
| **Hosting** | Vercel |

The entire rendering pipeline (isometric terrain, tower animations, projectile arcs, death effects, fog, god rays, ambient particles) is hand-written Canvas 2D. Static layers are cached to offscreen canvases, and quality-aware rendering adjusts detail based on runtime performance.

## Architecture

```
src/app/
├── hooks/          # Game loop, runtime, settings
├── constants/      # Maps, waves, towers, heroes, combat tuning
├── rendering/      # Canvas draw calls for towers, enemies, effects, terrain, UI
├── components/     # React UI including menus, HUD, modals, world map
├── sprites/        # SVG/component-based sprite definitions
├── game/           # Combat logic helpers
└── types/          # TypeScript interfaces
```

Key entry points:
- **Game loop**: `hooks/usePrincetonTowerDefenseRuntime.tsx` - simulation tick + render dispatch
- **Map data**: `constants/maps.ts` - path geometry, metadata, hazards, tower restrictions
- **Wave data**: `constants/waves.ts` - per-level enemy schedules and compositions
- **Rendering**: `rendering/` - modular draw functions for every game element

## Getting Started

```bash
git clone https://github.com/Kevin-Liu-01/Princeton-Tower-Defense.git
cd Princeton-Tower-Defense
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start playing.

## Deployment

Deployed on [Vercel](https://vercel.com). Push to `main` to auto-deploy.

```bash
npm run build   # Verify production build locally
```

---

<div align="center">

**[Play Princeton TD](https://princetontd.vercel.app/)** · Built by [Kevin Liu](https://www.kevin-liu.tech/)

</div>
