import { addDays, startOfWeek } from './week';

export const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
export const WEEKDAYS_LONG = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** Mes visible: año y mes (0-11). */
export type MonthRef = { year: number; month: number };

export function monthOf(d: Date): MonthRef {
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const d = new Date(year, month + delta, 1);
  return monthOf(d);
}

/** Semanas (lunes a domingo) que cubren el mes. Entre 4 y 6 filas de 7 días. */
export function monthWeeks({ year, month }: MonthRef): Date[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const weeks: Date[][] = [];
  for (let start = startOfWeek(first); start <= last; start = addDays(start, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(start, i)));
  }
  return weeks;
}

export function monthTitle({ year, month }: MonthRef): string {
  const s = new Date(year, month, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1).replace(' de ', ' ');
}

/** «Miércoles 7 de octubre». */
export function longDayLabel(d: Date): string {
  const s = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
