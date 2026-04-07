import { LEVEL_DATA, MAP_PATHS } from "./maps";

interface PathNode {
  x: number;
  y: number;
}

export interface ResolvedMapPath {
  key: string;
  points: PathNode[];
}

export interface ResolvedMapPathSegment {
  pathKey: string;
  start: PathNode;
  end: PathNode;
}

const SEGMENT_COORD_PRECISION = 4;

const toNodeSignature = (node: PathNode): string =>
  `${node.x.toFixed(SEGMENT_COORD_PRECISION)},${node.y.toFixed(SEGMENT_COORD_PRECISION)}`;

const toUndirectedSegmentSignature = (
  start: PathNode,
  end: PathNode
): string => {
  const a = toNodeSignature(start);
  const b = toNodeSignature(end);
  return a <= b ? `${a}|${b}` : `${b}|${a}`;
};

const isUsablePath = (pathKey: string): boolean =>
  Boolean(MAP_PATHS[pathKey] && MAP_PATHS[pathKey].length >= 2);

export function getLevelPathKeys(mapKey: string): string[] {
  const levelData = LEVEL_DATA[mapKey];
  const candidates: string[] = [];

  // Primary path always goes first when available.
  candidates.push(mapKey);

  // New multi-path config.
  if (levelData?.pathKeys && levelData.pathKeys.length > 0) {
    candidates.push(...levelData.pathKeys);
  }

  // Legacy dual-path config.
  if (levelData?.secondaryPath) {
    candidates.push(levelData.secondaryPath);
  }

  // Backward/forward-compatible suffix discovery (e.g. map_b, map_c, map_d).
  const suffixPrefix = `${mapKey}_`;
  const discoveredSuffixKeys = Object.keys(MAP_PATHS)
    .filter((key) => key.startsWith(suffixPrefix))
    .toSorted((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  candidates.push(...discoveredSuffixKeys);

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const pathKey of candidates) {
    if (seen.has(pathKey)) {
      continue;
    }
    if (!isUsablePath(pathKey)) {
      continue;
    }
    seen.add(pathKey);
    deduped.push(pathKey);
  }

  if (deduped.length > 0) {
    return deduped;
  }
  return isUsablePath("poe") ? ["poe"] : [];
}

export function getLevelPaths(mapKey: string): ResolvedMapPath[] {
  return getLevelPathKeys(mapKey)
    .map((key) => {
      const points = MAP_PATHS[key];
      if (!points || points.length < 2) {
        return null;
      }
      return { key, points };
    })
    .filter((path): path is ResolvedMapPath => Boolean(path));
}

export function getDefaultLevelPathKey(mapKey: string): string | null {
  const pathKeys = getLevelPathKeys(mapKey);
  return pathKeys[0] ?? null;
}

export function getPathSpawnNode(pathKey: string): PathNode | null {
  const path = MAP_PATHS[pathKey];
  if (!path || path.length === 0) {
    return null;
  }
  return path[0] ?? null;
}

export function getPathEndNode(pathKey: string): PathNode | null {
  const path = MAP_PATHS[pathKey];
  if (!path || path.length === 0) {
    return null;
  }
  return path.at(-1) ?? null;
}

export function getLevelSpawnNode(
  mapKey: string,
  pathKey?: string
): PathNode | null {
  const resolvedPathKey = pathKey ?? getDefaultLevelPathKey(mapKey);
  return resolvedPathKey ? getPathSpawnNode(resolvedPathKey) : null;
}

export function getLevelEndNode(
  mapKey: string,
  pathKey?: string
): PathNode | null {
  const resolvedPathKey = pathKey ?? getDefaultLevelPathKey(mapKey);
  return resolvedPathKey ? getPathEndNode(resolvedPathKey) : null;
}

export function getLevelUniquePathSegments(
  mapKey: string
): ResolvedMapPathSegment[] {
  const segments: ResolvedMapPathSegment[] = [];
  const seenSegments = new Set<string>();

  for (const { key, points } of getLevelPaths(mapKey)) {
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      if (!start || !end) {
        continue;
      }

      const signature = toUndirectedSegmentSignature(start, end);
      if (seenSegments.has(signature)) {
        continue;
      }
      seenSegments.add(signature);

      segments.push({
        end,
        pathKey: key,
        start,
      });
    }
  }

  return segments;
}
