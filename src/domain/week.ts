const DAY = 86_400_000;

const pad = (n: number) => String(n).padStart(2, '0');

export function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfWeek(d: Date): Date {
  const offset = (d.getDay() + 6) % 7; // lunes = 0
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

export function getWeekKey(d: Date): string {
  return toDayKey(startOfWeek(d));
}

/** Índice absoluto de semana (lunes a domingo), estable entre años y horario de verano. */
export function weekIndex(key: string): number {
  const d = parseDayKey(key);
  const days = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY;
  return Math.floor((days + 3) / 7);
}

export function weeksBetween(fromKey: string, toKey: string): number {
  return weekIndex(toKey) - weekIndex(fromKey);
}

export function weekLabel(key: string, currentKey: string): string {
  const diff = weeksBetween(key, currentKey);
  if (diff <= 0) return 'Esta semana';
  if (diff === 1) return 'Semana pasada';
  return `Hace ${diff} semanas`;
}

const month = (d: Date) =>
  d.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '');

export function weekRange(key: string): string {
  const start = parseDayKey(key);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${month(end)}`;
  }
  return `${start.getDate()} ${month(start)} – ${end.getDate()} ${month(end)}`;
}

export function dayLabel(d: Date, today: Date): string {
  const diff = Math.round(
    (parseDayKey(toDayKey(today)).getTime() - parseDayKey(toDayKey(d)).getTime()) / DAY,
  );
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  const wd = d.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '');
  return `${wd} ${d.getDate()} ${month(d)}`;
}

/** Días calendario de `a` a `b` (positivo si `b` es posterior). */
export function daysBetween(a: Date, b: Date): number {
  const utc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((utc(b) - utc(a)) / DAY);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
