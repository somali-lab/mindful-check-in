// Pure date/key helpers. Entry keys are `YYYY-MM-DD` or `YYYY-MM-DD_HHMMSSmmm`.

export const pad2 = (n: number): string => `0${n}`.slice(-2);

export function formatDate(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function formatTime(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export const todayKey = (): string => formatDate(new Date());

export function timestampKey(): string {
  const n = new Date();
  const ms = `00${n.getMilliseconds()}`.slice(-3);
  return `${formatDate(n)}_${pad2(n.getHours())}${pad2(n.getMinutes())}${pad2(n.getSeconds())}${ms}`;
}

export function dateFromKey(key: string): Date | null {
  if (!key) return null;
  const parts = key.substring(0, 10).split('-');
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return null;
  const d = new Date(y, m - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  if (key.length > 10) {
    const rest = key.substring(11);
    d.setHours(
      Number(rest.substring(0, 2)) || 0,
      Number(rest.substring(2, 4)) || 0,
      Number(rest.substring(4, 6)) || 0,
    );
  }
  return d;
}
