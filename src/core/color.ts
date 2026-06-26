/** True when a hex color is light enough to need dark text on top (luminance > 170). */
export function hasLightBackground(hexColor: string): boolean {
  const hex = String(hexColor).replace('#', '');
  if (hex.length !== 6) return false;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 170;
}
