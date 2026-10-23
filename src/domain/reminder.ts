import type { Task } from './task';
import { getWeekKey } from './week';

/**
 * Recordatorio de calendario (versión anterior). Ahora todo lo que va en un día es una actividad:
 * los recordatorios que queden se convierten solos con `reminderToActivity`.
 */
export type Reminder = {
  id: string;
  title: string;
  /** Día, "YYYY-MM-DD". */
  date: string;
  /** Hora opcional, "HH:MM". */
  time: string | null;
  done: boolean;
  createdAt: string;
};

/** Mismo id: si la conversión se repite (otro dispositivo, recarga), no se duplica. La hora pasa al título. */
export function reminderToActivity(r: Reminder): Task {
  return {
    id: r.id,
    title: r.time ? `${r.time} ${r.title}` : r.title,
    createdAt: r.createdAt,
    weekKey: getWeekKey(new Date(r.createdAt)),
    dueDate: r.date,
    kind: 'activity',
    categoryId: null,
    completedAt: r.done ? r.createdAt : null,
    order: Date.parse(r.createdAt),
  };
}
