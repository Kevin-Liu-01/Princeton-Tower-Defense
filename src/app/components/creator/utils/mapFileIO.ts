import type { CreatorDraftState } from "../types";
import { createEmptyDraft } from "./draftUtils";

const FILE_FORMAT_VERSION = 1;
const FILE_TYPE_MARKER = "princeton-td-map";
const FILE_EXTENSION = ".ptd.json";

interface MapFileEnvelope {
  version: number;
  type: string;
  exportedAt: string;
  draft: Omit<CreatorDraftState, "id">;
}

function sanitizeDraftForExport(draft: CreatorDraftState): Omit<CreatorDraftState, "id"> {
  const { id, ...rest } = draft;
  return rest;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateImportedDraft(raw: unknown): CreatorDraftState | string {
  if (!isPlainObject(raw)) return "Draft data is not an object.";

  const template = createEmptyDraft();
  const requiredKeys: (keyof CreatorDraftState)[] = [
    "slug",
    "name",
    "theme",
    "difficulty",
    "startingPawPoints",
    "waveTemplate",
    "primaryPath",
    "decorations",
    "hazards",
  ];

  for (const key of requiredKeys) {
    if (!(key in raw)) return `Missing required field: "${key}".`;
  }

  if (typeof raw.name !== "string") return '"name" must be a string.';
  if (typeof raw.theme !== "string") return '"theme" must be a string.';
  if (typeof raw.difficulty !== "number" || ![1, 2, 3].includes(raw.difficulty as number)) {
    return '"difficulty" must be 1, 2, or 3.';
  }
  if (typeof raw.startingPawPoints !== "number") return '"startingPawPoints" must be a number.';
  if (!Array.isArray(raw.primaryPath)) return '"primaryPath" must be an array.';
  if (!Array.isArray(raw.decorations)) return '"decorations" must be an array.';
  if (!Array.isArray(raw.hazards)) return '"hazards" must be an array.';

  const draft: CreatorDraftState = {
    ...template,
    slug: typeof raw.slug === "string" ? raw.slug : "",
    name: raw.name as string,
    description: typeof raw.description === "string" ? raw.description : "",
    theme: raw.theme as CreatorDraftState["theme"],
    difficulty: raw.difficulty as 1 | 2 | 3,
    startingPawPoints: raw.startingPawPoints as number,
    waveTemplate: typeof raw.waveTemplate === "string" ? raw.waveTemplate : "default",
    customWaves: Array.isArray(raw.customWaves) ? raw.customWaves as CreatorDraftState["customWaves"] : [],
    primaryPath: raw.primaryPath as CreatorDraftState["primaryPath"],
    secondaryPath: Array.isArray(raw.secondaryPath) ? raw.secondaryPath as CreatorDraftState["secondaryPath"] : [],
    heroSpawn: isPlainObject(raw.heroSpawn) ? raw.heroSpawn as CreatorDraftState["heroSpawn"] : null,
    specialTowers: Array.isArray(raw.specialTowers) ? raw.specialTowers as CreatorDraftState["specialTowers"] : [],
    placedTowers: Array.isArray(raw.placedTowers) ? raw.placedTowers as CreatorDraftState["placedTowers"] : [],
    allowedTowers: Array.isArray(raw.allowedTowers) ? raw.allowedTowers as CreatorDraftState["allowedTowers"] : [],
    decorations: raw.decorations as CreatorDraftState["decorations"],
    hazards: raw.hazards as CreatorDraftState["hazards"],
  };

  return draft;
}

export function exportMapToFile(draft: CreatorDraftState): void {
  const envelope: MapFileEnvelope = {
    version: FILE_FORMAT_VERSION,
    type: FILE_TYPE_MARKER,
    exportedAt: new Date().toISOString(),
    draft: sanitizeDraftForExport(draft),
  };

  const json = JSON.stringify(envelope, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const filename = (draft.name.trim() || "untitled-map")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}${FILE_EXTENSION}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function importMapFromFile(): Promise<CreatorDraftState> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.ptd.json";

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error("No file selected."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);

          if (!isPlainObject(parsed)) {
            reject(new Error("File does not contain valid JSON object."));
            return;
          }

          let draftData: unknown;
          if (parsed.type === FILE_TYPE_MARKER && isPlainObject(parsed.draft)) {
            draftData = parsed.draft;
          } else if ("primaryPath" in parsed && "theme" in parsed) {
            draftData = parsed;
          } else {
            reject(new Error("Unrecognized file format. Expected a Princeton TD map file."));
            return;
          }

          const result = validateImportedDraft(draftData);
          if (typeof result === "string") {
            reject(new Error(result));
            return;
          }

          resolve(result);
        } catch (err) {
          reject(new Error(`Failed to parse file: ${err instanceof Error ? err.message : String(err)}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsText(file);
    });

    input.click();
  });
}
