// =============================================================================
// SCREENSHOT CAPTURE UTILITY
// =============================================================================

const DEFAULT_FILENAME_PREFIX = "princeton-td";
const DEFAULT_FORMAT = "image/png";
const JPEG_QUALITY = 0.95;

type ScreenshotFormat = "image/png" | "image/jpeg";

interface ScreenshotOptions {
  format?: ScreenshotFormat;
  filenamePrefix?: string;
}

function buildFilename(prefix: string, format: ScreenshotFormat): string {
  const ext = format === "image/jpeg" ? "jpg" : "png";
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  return `${prefix}_${ts}.${ext}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function captureCanvas(
  canvas: HTMLCanvasElement,
  options: ScreenshotOptions = {}
): Promise<boolean> {
  const format = options.format ?? DEFAULT_FORMAT;
  const prefix = options.filenamePrefix ?? DEFAULT_FILENAME_PREFIX;
  const quality = format === "image/jpeg" ? JPEG_QUALITY : undefined;

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        downloadBlob(blob, buildFilename(prefix, format));
        resolve(true);
      },
      format,
      quality
    );
  });
}
