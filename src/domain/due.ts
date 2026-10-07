import { addDays, daysBetween, parseDayKey, toDayKey } from './week';

export type DueTone = 'overdue' | 'today' | 'soon' | 'later';
export type DueInfo = { label: string; tone: DueTone };

const weekday = (d: Date) => d.toLocaleDateString('es-CL', { weekday: 'long' });
const short = (d: Date) =>
  d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function dueInfo(dueKey: string, today: Date): DueInfo {
  const due = parseDayKey(dueKey);
  const diff = daysBetween(today, due);
  if (diff < 0) {
    if (diff === -1) return { label: 'Venció ayer', tone: 'overdue' };
    if (diff >= -6) return { label: `Venció el ${weekday(due)}`, tone: 'overdue' };
    return { label: `Venció hace ${-diff} días`, tone: 'overdue' };
  }
  if (diff === 0) return { label: 'Hoy', tone: 'today' };
  if (diff === 1) return { label: 'Mañana', tone: 'soon' };
  if (diff <= 6) return { label: cap(weekday(due)), tone: 'later' };
  return { label: cap(short(due)), tone: 'later' };
}

/** Atajos del selector: hoy, mañana y los 5 días siguientes. */
export function quickDueOptions(today: Date): { key: string; label: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i);
    const label =
      i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : cap(d.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '')) + ` ${d.getDate()}`;
    return { key: toDayKey(d), label };
  });
}
