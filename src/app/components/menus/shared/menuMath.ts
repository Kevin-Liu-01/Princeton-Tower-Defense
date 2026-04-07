export function circularDiff(
  index: number,
  center: number,
  length: number
): number {
  const raw = (((index - center) % length) + length) % length;
  return raw > length / 2 ? raw - length : raw;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
