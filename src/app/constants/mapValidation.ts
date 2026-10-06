import type {
  MapDecoration,
  MapHazard,
  Position,
  SpecialTower,
} from "../types";

interface LevelGeometryConfig {
  camera: { offset: Position; zoom: number };
  decorations?: MapDecoration[];
  dualPath?: boolean;
  hazards?: MapHazard[];
  pathKeys?: string[];
  secondaryPath?: string;
  specialTower?: SpecialTower;
  specialTowers?: SpecialTower[];
}

interface MapPathValidationOptions {
  axisAlignedExceptions?: ReadonlySet<string>;
  gridHeight: number;
  gridWidth: number;
}

const isFinitePosition = (position: Position): boolean =>
  Number.isFinite(position.x) && Number.isFinite(position.y);

const HAZARD_PATH_TOLERANCE = 0.3;

const getPointToSegmentDistance = (
  point: Position,
  start: Position,
  end: Position
): number => {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lengthSquared = deltaX ** 2 + deltaY ** 2;
  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }
  const projection = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) /
        lengthSquared
    )
  );
  return Math.hypot(
    point.x - (start.x + projection * deltaX),
    point.y - (start.y + projection * deltaY)
  );
};

const getPointToPathDistance = (point: Position, path: Position[]): number => {
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 1; index < path.length; index += 1) {
    nearestDistance = Math.min(
      nearestDistance,
      getPointToSegmentDistance(point, path[index - 1], path[index])
    );
  }
  return nearestDistance;
};

const isOutsideGrid = (
  position: Position,
  gridWidth: number,
  gridHeight: number
): boolean =>
  position.x < 0 ||
  position.y < 0 ||
  position.x > gridWidth ||
  position.y > gridHeight;

const getCanonicalPathSignature = (path: Position[]): string => {
  const forward = path.map(({ x, y }) => `${x},${y}`).join(";");
  const reverse = [...path]
    .toReversed()
    .map(({ x, y }) => `${x},${y}`)
    .join(";");
  return forward < reverse ? forward : reverse;
};

const getCanonicalPathShapeSignature = (path: Position[]): string => {
  const deltas = path.slice(1).map((point, index) => ({
    x: point.x - path[index].x,
    y: point.y - path[index].y,
  }));
  const forward = deltas.map(({ x, y }) => `${x},${y}`).join(";");
  const reverse = [...deltas]
    .toReversed()
    .map(({ x, y }) => `${-x},${-y}`)
    .join(";");
  return forward < reverse ? forward : reverse;
};

const rangesOverlap = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean =>
  Math.max(Math.min(aStart, aEnd), Math.min(bStart, bEnd)) <=
  Math.min(Math.max(aStart, aEnd), Math.max(bStart, bEnd));

const axisAlignedSegmentsIntersect = (
  aStart: Position,
  aEnd: Position,
  bStart: Position,
  bEnd: Position
): boolean => {
  const aVertical = aStart.x === aEnd.x;
  const bVertical = bStart.x === bEnd.x;

  if (aVertical && bVertical) {
    return (
      aStart.x === bStart.x && rangesOverlap(aStart.y, aEnd.y, bStart.y, bEnd.y)
    );
  }
  if (!(aVertical || bVertical)) {
    return (
      aStart.y === bStart.y && rangesOverlap(aStart.x, aEnd.x, bStart.x, bEnd.x)
    );
  }

  const verticalStart = aVertical ? aStart : bStart;
  const verticalEnd = aVertical ? aEnd : bEnd;
  const horizontalStart = aVertical ? bStart : aStart;
  const horizontalEnd = aVertical ? bEnd : aEnd;
  return (
    rangesOverlap(
      verticalStart.y,
      verticalEnd.y,
      horizontalStart.y,
      horizontalStart.y
    ) &&
    rangesOverlap(
      horizontalStart.x,
      horizontalEnd.x,
      verticalStart.x,
      verticalStart.x
    )
  );
};

const validatePath = (
  pathKey: string,
  path: Position[],
  options: MapPathValidationOptions
): string[] => {
  const errors: string[] = [];
  if (path.length < 2) {
    return [`${pathKey}: path must contain at least two anchors`];
  }

  for (const [index, point] of path.entries()) {
    if (!isFinitePosition(point)) {
      errors.push(`${pathKey}: anchor ${index} is not finite`);
    }
    if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
      errors.push(`${pathKey}: anchor ${index} is not grid-aligned`);
    }
  }

  if (!isOutsideGrid(path[0], options.gridWidth, options.gridHeight)) {
    errors.push(`${pathKey}: entrance must begin outside the battlefield`);
  }
  const finalPoint = path.at(-1);
  if (
    finalPoint &&
    !isOutsideGrid(finalPoint, options.gridWidth, options.gridHeight)
  ) {
    errors.push(`${pathKey}: exit must end outside the battlefield`);
  }

  const permitsDiagonalSegments = options.axisAlignedExceptions?.has(pathKey);
  for (let index = 1; index < path.length; index += 1) {
    const previous = path[index - 1];
    const current = path[index];
    if (previous.x === current.x && previous.y === current.y) {
      errors.push(`${pathKey}: anchors ${index - 1} and ${index} overlap`);
      continue;
    }
    if (
      !permitsDiagonalSegments &&
      previous.x !== current.x &&
      previous.y !== current.y
    ) {
      errors.push(`${pathKey}: segment ${index - 1} is not axis-aligned`);
    }
  }

  if (!permitsDiagonalSegments) {
    for (let first = 0; first < path.length - 1; first += 1) {
      for (let second = first + 2; second < path.length - 1; second += 1) {
        if (
          axisAlignedSegmentsIntersect(
            path[first],
            path[first + 1],
            path[second],
            path[second + 1]
          )
        ) {
          errors.push(
            `${pathKey}: non-adjacent segments ${first} and ${second} intersect`
          );
        }
      }
    }
  }

  return errors;
};

const throwValidationErrors = (label: string, errors: string[]): void => {
  if (errors.length === 0) {
    return;
  }
  throw new Error(`${label} validation failed:\n- ${errors.join("\n- ")}`);
};

export const assertValidMapPaths = (
  paths: Record<string, Position[]>,
  options: MapPathValidationOptions
): void => {
  const errors: string[] = [];
  const signatureOwners = new Map<string, string>();
  const shapeSignatureOwners = new Map<string, string>();

  for (const [pathKey, path] of Object.entries(paths)) {
    errors.push(...validatePath(pathKey, path, options));
    const signature = getCanonicalPathSignature(path);
    const existingPath = signatureOwners.get(signature);
    if (existingPath) {
      errors.push(`${pathKey}: duplicates the geometry of ${existingPath}`);
    } else {
      signatureOwners.set(signature, pathKey);
    }

    const shapeSignature = getCanonicalPathShapeSignature(path);
    const existingShapePath = shapeSignatureOwners.get(shapeSignature);
    if (existingShapePath) {
      errors.push(
        `${pathKey}: duplicates the translated geometry of ${existingShapePath}`
      );
    } else {
      shapeSignatureOwners.set(shapeSignature, pathKey);
    }
  }

  throwValidationErrors("Map path", errors);
};

const validateOptionalPosition = (
  errors: string[],
  levelKey: string,
  label: string,
  position?: Position
): void => {
  if (position && !isFinitePosition(position)) {
    errors.push(`${levelKey}: ${label} position is not finite`);
  }
};

export const assertValidLevelGeometry = (
  paths: Record<string, Position[]>,
  levels: Record<string, LevelGeometryConfig>
): void => {
  const errors: string[] = [];

  for (const [levelKey, level] of Object.entries(levels)) {
    if (!paths[levelKey]) {
      errors.push(`${levelKey}: primary path is missing`);
    }
    if (!Number.isFinite(level.camera.zoom) || level.camera.zoom <= 0) {
      errors.push(`${levelKey}: camera zoom must be positive and finite`);
    }
    validateOptionalPosition(
      errors,
      levelKey,
      "camera offset",
      level.camera.offset
    );

    const referencedPaths = [
      ...(level.pathKeys ?? []),
      ...(level.secondaryPath ? [level.secondaryPath] : []),
    ];
    for (const pathKey of referencedPaths) {
      if (!paths[pathKey]) {
        errors.push(`${levelKey}: referenced path ${pathKey} is missing`);
      }
    }
    if (level.dualPath && referencedPaths.length === 0) {
      errors.push(`${levelKey}: dual-path level has no secondary path`);
    }

    for (const [index, decoration] of (level.decorations ?? []).entries()) {
      validateOptionalPosition(
        errors,
        levelKey,
        `decoration ${index}`,
        decoration.pos
      );
      const decorationScale = decoration.scale ?? decoration.size ?? 1;
      if (!Number.isFinite(decorationScale) || decorationScale < 0) {
        errors.push(`${levelKey}: decoration ${index} has an invalid scale`);
      }
      if (!(decoration.type || decoration.category)) {
        errors.push(`${levelKey}: decoration ${index} has no type`);
      }
    }

    for (const [index, hazard] of (level.hazards ?? []).entries()) {
      const hazardPosition = hazard.pos ?? hazard.gridPos;
      validateOptionalPosition(
        errors,
        levelKey,
        `hazard ${index}`,
        hazardPosition
      );
      const radius = hazard.radius ?? hazard.size ?? 1;
      if (!Number.isFinite(radius) || radius <= 0) {
        errors.push(`${levelKey}: hazard ${index} has an invalid radius`);
      }
      if (!hazardPosition) {
        errors.push(`${levelKey}: hazard ${index} has no position`);
        continue;
      }
      const levelPathKeys = [levelKey, ...referencedPaths];
      const nearestPathDistance = Math.min(
        ...levelPathKeys.map((pathKey) =>
          getPointToPathDistance(hazardPosition, paths[pathKey] ?? [])
        )
      );
      if (nearestPathDistance > radius + HAZARD_PATH_TOLERANCE) {
        errors.push(
          `${levelKey}: hazard ${index} cannot interact with any path (${nearestPathDistance.toFixed(1)} grid units away)`
        );
      }
    }

    const specialTowers = [
      ...(level.specialTowers ?? []),
      ...(level.specialTower ? [level.specialTower] : []),
    ];
    for (const [index, tower] of specialTowers.entries()) {
      validateOptionalPosition(
        errors,
        levelKey,
        `special tower ${index}`,
        tower.pos
      );
      if (
        tower.hp !== undefined &&
        (!Number.isFinite(tower.hp) || tower.hp <= 0)
      ) {
        errors.push(`${levelKey}: special tower ${index} has invalid HP`);
      }
    }
  }

  throwValidationErrors("Level geometry", errors);
};
