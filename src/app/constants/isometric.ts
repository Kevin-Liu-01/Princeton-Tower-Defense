// Princeton Tower Defense - 2:1 Isometric Projection Constants
// All rendering MUST use these constants for consistent 2:1 isometric projection.
// 2:1 isometric: tile diamonds have a 2:1 width-to-height ratio (26.57° edge angle).
// This is the standard for tile-based isometric games.

export const ISO_ANGLE = Math.atan(0.5); // ~26.57° in radians

export const ISO_COS = 2 / Math.sqrt(5); // ≈ 0.89443
export const ISO_SIN = 1 / Math.sqrt(5); // ≈ 0.44721
export const ISO_TAN = 0.5;

// World-to-screen projection factors.
// screenX = (worldX - worldY) × ISO_X_FACTOR
// screenY = (worldX + worldY) × ISO_Y_FACTOR
export const ISO_X_FACTOR = 0.5;
export const ISO_Y_FACTOR = 0.25;

// Inverse projection multipliers (screenToWorld).
// worldX - worldY = screenIsoX * ISO_INV_X
// worldX + worldY = screenIsoY * ISO_INV_Y
export const ISO_INV_X = 1 / ISO_X_FACTOR; // 2
export const ISO_INV_Y = 1 / ISO_Y_FACTOR; // 4

// Y-compression ratio for isometric ellipses / circles on the ground plane.
// A circle of radius r on the ground projects to an ellipse with ry = r * ISO_Y_RATIO.
export const ISO_Y_RATIO = ISO_Y_FACTOR / ISO_X_FACTOR; // 0.5

// Tile diamond dimensions (for a TILE_SIZE × TILE_SIZE world tile).
// tileWidth  = TILE_SIZE (horizontal extent of the diamond)
// tileHeight = TILE_SIZE * ISO_TILE_HEIGHT_FACTOR (vertical extent)
export const ISO_TILE_HEIGHT_FACTOR = 2 * ISO_Y_FACTOR; // 0.5

// Prism/box shape factors (used by drawIsometricPrism in towers).
// For a box with screen-space half-width w = size * ISO_PRISM_W_FACTOR,
// the half-depth d = size * ISO_PRISM_D_FACTOR ensures correct 2:1 edge angles.
export const ISO_PRISM_W_FACTOR = 0.5;
export const ISO_PRISM_D_FACTOR = ISO_Y_FACTOR; // 0.25
