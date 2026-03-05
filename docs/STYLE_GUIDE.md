# Princeton Tower Defense — Dark Fantasy Isometric Style Guide

This document is the authoritative visual standard for all rendered game elements.
Every tower, troop, enemy, hero, spell effect, hazard, decoration, landmark, and
special building **must** conform to these rules. Deviations are bugs.

---

## 1. 2:1 Isometric Projection — Non-Negotiable

All ground-plane geometry uses **2:1 isometric projection** where tile diamonds
have a **2:1 width-to-height ratio** (~26.57° edge angle). This is the standard
for tile-based isometric games.

| Constant                 | Value               | Purpose                                           |
| ------------------------ | ------------------- | ------------------------------------------------- |
| `ISO_ANGLE`              | atan(0.5) (~26.57°) | The projection angle                              |
| `ISO_COS`                | 2/√5 ≈ 0.894        | Horizontal spread factor for prism shapes         |
| `ISO_SIN`                | 1/√5 ≈ 0.447        | Vertical compression factor for prism shapes      |
| `ISO_TAN`                | 0.5                 | Y-to-X ratio on the ground plane                  |
| `ISO_X_FACTOR`           | 0.5                 | `screenX = (worldX − worldY) × 0.5`               |
| `ISO_Y_FACTOR`           | 0.25                | `screenY = (worldX + worldY) × 0.25`              |
| `ISO_Y_RATIO`            | 0.5                 | Ellipse Y-radius = X-radius × ISO_Y_RATIO         |
| `ISO_TILE_HEIGHT_FACTOR` | 0.5                 | `tileHeight = TILE_SIZE × ISO_TILE_HEIGHT_FACTOR` |
| `ISO_PRISM_W_FACTOR`     | 0.5                 | Prism half-width factor                           |
| `ISO_PRISM_D_FACTOR`     | 0.25                | Prism half-depth factor                           |

All constants live in `src/app/constants/isometric.ts`. **Never hard-code**
projection ratios — always import and use the named constants.

### Rules

1. **World-to-screen**: Use `worldToScreen()` from `utils/`. It already applies 2:1 isometric.
2. **Prisms/Boxes**: Use `drawIsometricPrism()` (helpers or towers variant). Both use `ISO_PRISM_*` factors.
3. **Pyramids**: Use `drawIsometricPyramid()` from helpers. Uses `ISO_COS`/`ISO_SIN`.
4. **Cylinders**: Use `drawIsoCylinder()`. Y-radius = X-radius × `ISO_Y_RATIO`.
5. **Ground ellipses**: Circles on the ground plane project to ellipses with `ry = rx * ISO_Y_RATIO`.
6. **Canvas scale transforms**: `ctx.scale(1, ISO_Y_RATIO)` — never hardcode the ratio.
7. **Face slopes**: Isometric face edges have slope ±`ISO_Y_RATIO`.
8. **Orbit paths**: Y-component of isometric orbits = `sin(angle) * radius * ISO_Y_RATIO`.

### Forbidden Patterns

```typescript
// WRONG — hardcoded magic numbers
const isoY = (x + y) * 0.25;           // use ISO_Y_FACTOR
const depth = width * 0.5;              // use ISO_Y_RATIO (unless it IS half)
ctx.scale(1, 0.5);                      // use ISO_Y_RATIO
ctx.ellipse(x, y, r, r * 0.5, ...);    // use ISO_Y_RATIO

// CORRECT — named constants from isometric.ts
const isoY = (x + y) * ISO_Y_FACTOR;
const depth = width * ISO_Y_RATIO;
ctx.scale(1, ISO_Y_RATIO);
ctx.ellipse(x, y, r, r * ISO_Y_RATIO, ...);
```

---

## 2. Dark Fantasy Aesthetic

The visual identity is **dark fantasy with an ornate, medieval-collegiate feel**.
Think weathered stone, arcane glows, gothic arches, iron and brass, amber light
against deep shadows. Not cartoonish. Not hyper-realistic. Painterly-precise
isometric craft.

### Color Palette Philosophy

| Category               | Tone                          | Reference                          |
| ---------------------- | ----------------------------- | ---------------------------------- |
| **Backgrounds**        | Deep warm browns, near-blacks | `PANEL.bgDark`, `PANEL.bgDeep`     |
| **Accent / Gold**      | Amber-to-gold, warm brass     | `GOLD.*`, `AMBER[400..700]`        |
| **Building Stone**     | Muted gray-browns, slate      | `#5a5a62`, `#786858`               |
| **Nature / Forest**    | Deep greens, moss, shadow     | `rgba(20,40,25)`, emerald-to-olive |
| **Fire / Lava**        | Orange core, crimson edges    | `#ff6600` → `#8b0000`              |
| **Ice / Winter**       | Cool slate-blue, frost-white  | `rgba(200,220,255)`                |
| **Arcane / Magic**     | Purple-indigo, electric cyan  | `#6020a0`, `#00ccff`               |
| **Death / Corruption** | Sickly green, void-black      | `#44ff44` over `#1a1a1a`           |

### Lighting Model

All 3D shapes use a **consistent 3-tone shading** model:

- **Top face**: Lightest (ambient + overhead light)
- **Left face (front-left)**: Mid-tone (side light)
- **Right face (front-right)**: Darkest (shadow side)

Use `lightenColor()` and `darkenColor()` from helpers for programmatic shade
derivation. Typical offsets: top = base, left = darken(base, 15–25), right = darken(base, 30–50).

Edge strokes:

- Top edge: `rgba(0,0,0,0.2)` — subtle definition
- Left edge: `rgba(0,0,0,0.3–0.4)` — medium definition
- Right edge: `rgba(0,0,0,0.3)` — medium definition
- Back edges: `rgba(0,0,0,0.2)` — faint separation

---

## 3. Detail Level Standards

Every rendered entity must meet a **minimum detail threshold** appropriate to its
category. Detail means: identifiable silhouette, material differentiation, animation
feedback, thematic consistency, and proper isometric construction.

### 3.1 Towers

| Requirement            | Standard                                                       |
| ---------------------- | -------------------------------------------------------------- |
| **Base shape**         | `drawIsometricPrism` with proper 2:1 isometric angles          |
| **Levels 1-2**         | Clean geometric silhouette, 2-3 distinct material zones        |
| **Levels 3-4**         | Added architectural detail (windows, buttresses, trim)         |
| **Upgrade A/B**        | Visually distinct specialization (color shift, added elements) |
| **Attack animation**   | Visible muzzle flash, recoil, or channeling effect             |
| **Turret tracking**    | Smooth rotation toward current target                          |
| **Material hierarchy** | Stone base → metal housing → weapon element (top)              |
| **Shadow**             | Ground-plane shadow ellipse using `ISO_Y_RATIO`                |
| **Scale**              | Consistent with `TILE_SIZE` (64px world units)                 |

### 3.2 Troops

| Requirement          | Standard                                                             |
| -------------------- | -------------------------------------------------------------------- |
| **Silhouette**       | Recognizable humanoid or creature shape from isometric view          |
| **Region theme**     | Troops reflect the deployment tower's theme (forest, etc.)           |
| **Idle animation**   | Subtle breathing or sway cycle                                       |
| **Walk cycle**       | Leg/body movement synced to movement speed                           |
| **Attack animation** | Visible weapon swing, impact frame                                   |
| **Health bar**       | Positioned above unit, green gradient                                |
| **Minimum detail**   | Head, torso, weapon/tool, 2+ color zones                             |
| **Aura effects**     | If buffed, visible ring or particle aura using `ISO_Y_RATIO` ellipse |
| **Aesthetic**        | Epic looking dark fantasy                                            |

### 3.3 Enemies

| Requirement         | Standard                                                                   |
| ------------------- | -------------------------------------------------------------------------- |
| **Silhouette**      | Instantly distinguishable from other enemy types                           |
| **Region variants** | Each region (Forest, Desert, Winter, Volcanic, Swamp) has distinct palette |
| **Size hierarchy**  | Standard < Elite < Boss, clearly communicable through scale                |
| **Damage flash**    | White flash on hit (100ms `damageFlash`)                                   |
| **Status effects**  | Burning: orange particles. Frozen: blue tint. Poisoned: green miasma       |
| **Health bar**      | Red gradient, positioned above unit                                        |
| **Minimum detail**  | 3+ body segments, 2+ color zones, armor/feature differentiation            |
| **Death animation** | Region-themed death effect (lightning, dust, fire, ice, etc.)              |
| **Lane spreading**  | Enemies occupy lanes with `ENEMY_LANE_HALF_SPAN_WORLD`                     |
| **Aesthetic**       | Epic looking dark fantasy                                                  |

### 3.4 Heroes

| Requirement          | Standard                                                        |
| -------------------- | --------------------------------------------------------------- |
| **Uniqueness**       | Each hero has a completely distinct silhouette and color scheme |
| **Idle animation**   | Elaborate idle — cape flow, weapon glow, breathing              |
| **Walk cycle**       | Fluid, matching hero's personality/weight                       |
| **Attack animation** | Hero-specific: sword slash, spell cast, etc.                    |
| **Ability visual**   | Dramatic, screen-readable AOE or targeted effect                |
| **Golden selection** | Pulsing gold dashed ellipse (`ISO_Y_RATIO`) when selected       |
| **Minimum detail**   | Full body with distinct head, armor, weapon, accessory          |
| **Respawn**          | Fade-in with particle burst on respawn                          |
| **Aesthetic**        | Epic looking dark fantasy                                       |

### 3.5 Spells

| Requirement          | Standard                                                                        |
| -------------------- | ------------------------------------------------------------------------------- |
| **Ground targeting** | Visible isometric targeting circle using `ISO_Y_RATIO`                          |
| **Cast animation**   | Dramatic buildup with ground glow or sky particle                               |
| **Impact**           | Multi-layer effect: core, ring, particles, screen shake                         |
| **Element theme**    | Fire=orange/red, Lightning=cyan/white, Ice=blue/white, Nature=green, Gold=amber |
| **AOE clarity**      | Affected area clearly delineated with ground effect                             |
| **Duration**         | Visual persists for full effect duration, fades at end                          |

### 3.6 Hazards

| Requirement         | Standard                                              |
| ------------------- | ----------------------------------------------------- |
| **Ground shape**    | Organic blob or isometric ellipse, not perfect circle |
| **Isometric ratio** | All hazard Y-compression uses `ISO_Y_RATIO`           |
| **Poison fog**      | Green translucent cloud with particle drift           |
| **Lava geyser**     | Orange glow base, eruption particles, scorch ring     |
| **Ice sheet**       | Blue-white shimmer, angular crystal edges             |
| **Quicksand**       | Swirling tan/brown surface animation                  |
| **Edge treatment**  | Soft gradient fade at edges, no hard circles          |

### 3.7 Decorations

| Requirement           | Standard                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------- |
| **Isometric prisms**  | All building decorations use 2:1 isometric prism geometry                                    |
| **Region theming**    | Each region has distinct palette and material vocabulary                                     |
| **Scale consistency** | Decorations scaled relative to `TILE_SIZE` and game units                                    |
| **Level of detail**   | Trees: trunk + canopy + shadow. Rocks: faces + highlights. Buildings: walls + roof + windows |
| **Shadow**            | All decorations cast ground-plane shadows                                                    |
| **Variety**           | Use variant parameter for visual diversity within types                                      |
| **No floating**       | Decorations must appear grounded (shadow anchors them)                                       |

### 3.8 Landmarks

| Requirement                | Standard                                                       |
| -------------------------- | -------------------------------------------------------------- |
| **Scale**                  | Larger than standard decorations, significant visual presence  |
| **Isometric construction** | All faces at correct 2:1 isometric angles                      |
| **Detail density**         | Higher than decorations: windows, textures, ornamental detail  |
| **Theme integration**      | Must match the region's material/color vocabulary              |
| **Animation**              | Subtle ambient animation (glowing windows, drifting particles) |

### 3.9 Special Towers (Chrono Relay, Sentinel Nexus, Sunforge Orrery)

| Requirement            | Standard                                                 |
| ---------------------- | -------------------------------------------------------- |
| **Isometric base**     | Correct 2:1 isometric prism/cylinder base                |
| **Scale transforms**   | All `ctx.scale(1, ISO_Y_RATIO)` for ground-plane effects |
| **Unique silhouette**  | Immediately distinguishable from regular towers          |
| **Activation effects** | Dramatic visual when ability triggers                    |
| **Range indicator**    | Proper isometric ellipse range ring                      |
| **Ambient animation**  | Floating elements, rotating gears, energy pulses         |

---

## 4. Region Material Vocabulary

Each map region has a **distinct material language**. Towers, enemies, decorations,
and effects must speak this visual language when deployed in that region.

### Forest (Grassland)

- **Stone**: Warm gray fieldstone, mossy joints
- **Wood**: Dark oak, weathered planks
- **Metal**: Tarnished bronze, copper-green patina
- **Accent**: Emerald green, amber gold
- **Atmosphere**: Firefly particles, dappled light, golden hour warmth

### Desert

- **Stone**: Sandstone, sun-bleached limestone
- **Metal**: Polished brass, gold leaf
- **Fabric**: Deep indigo, burgundy, sand-beige
- **Accent**: Turquoise, burnt sienna
- **Atmosphere**: Heat shimmer, dust motes, harsh shadows

### Winter

- **Stone**: Blue-gray granite, ice-crusted
- **Wood**: Frost-silver birch
- **Metal**: Polished steel, pale silver
- **Accent**: Ice-blue, arctic white, faint aurora tints
- **Atmosphere**: Snowflakes, frost crystals, cold breath mist

### Volcanic

- **Stone**: Black obsidian, cracked basalt with lava veins
- **Metal**: Dark iron, ember-red hot metal
- **Accent**: Molten orange, crimson, sulfur yellow
- **Atmosphere**: Ember particles, heat distortion, smoke plumes

### Swamp

- **Stone**: Slick dark stone, algae-covered
- **Wood**: Gnarled black wood, hanging moss
- **Metal**: Corroded iron, verdigris copper
- **Accent**: Sickly green, murky purple, fungal bioluminescence
- **Atmosphere**: Fog tendrils, floating spores, wet reflections

---

## 5. Animation Standards

### Frame Budget

- **Idle animations**: Smooth sine-wave cycles, 1–3 second period
- **Attack animations**: 100–300ms impulse, sharp start, ease-out decay
- **Movement**: Interpolated position, no teleporting
- **Particles**: 3–8 particle count for subtle effects, 15–30 for dramatic
- **Performance**: All animations respect `PerformanceSettings` (reduced particles, simplified gradients)

### Timing Conventions

- `Date.now() / 1000` for second-scale time
- `Math.sin(time * N)` where N controls speed: 1–2 = slow pulse, 3–5 = medium, 6+ = rapid
- Attack flash duration: 100–200ms
- Death animation: 300–800ms

---

## 6. Rendering Order & Depth Sorting

Entities are sorted by **isoY** (`(worldX + worldY) * ISO_Y_FACTOR`) for painter's
algorithm depth ordering. Lower isoY renders first (farther from camera).

| Layer              | Priority               | Notes                               |
| ------------------ | ---------------------- | ----------------------------------- |
| Static map (tiles) | Bottom                 | Pre-rendered to offscreen canvas    |
| Ground effects     | Below entities         | Hazard zones, ground circles        |
| Decorations        | By height tag          | `ground` < `mid` < `tall` < `sky`   |
| Towers             | By isoY                | Same depth as other entities        |
| Enemies            | By isoY + micro-offset | Stable sort via ID hash             |
| Troops             | By isoY                |                                     |
| Heroes             | By isoY                |                                     |
| Projectiles        | By isoY                |                                     |
| Effects            | By isoY                |                                     |
| Sky decorations    | Above entities         | Clouds, high-altitude elements      |
| UI overlays        | Top                    | Health bars, range indicators, text |

---

## 7. Performance Guidelines

- **Firefox mode**: Respect `isFirefox()` — disable heavy shadows, reduce particle count
- **Shadows**: Use `setShadowBlur()` / `clearShadow()` — never raw `ctx.shadowBlur`
- **Gradients**: Cache gradients where possible (see `performance.ts`)
- **Sub-pixel avoidance**: Use `worldToScreenRounded()` in hot drawing paths
- **Culling**: Skip rendering for entities outside visible viewport + margin
- **Offscreen canvas**: Static map layer renders to cached canvas, redrawn only on camera change

---

## 8. Code Organization Rules

1. **Isometric constants**: Always import from `constants/isometric.ts`
2. **Shared primitives**: `drawIsometricPrism`, `drawIsometricPyramid`, etc. in `rendering/helpers.ts`
3. **No nested functions**: All drawing helpers are top-level module functions
4. **No imports inside functions**: All imports at file top
5. **Domain separation**: Towers in `towers/`, enemies in `enemies/`, etc.
6. **Constants**: Domain-level constants in `constants/` directory
7. **Reusable base classes**: Common behavior in helpers, extended per-domain
8. **Async parallelization**: Where applicable (not typically in rendering)
