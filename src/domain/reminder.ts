/** Recordatorio de calendario: vive en un día, no en la lista de pendientes. */
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

/** Orden dentro de un día: primero los con hora (por hora), luego el resto por creación. */
export function compareReminders(a: Reminder, b: Reminder): number {
  if (a.time && b.time) return a.time.localeCompare(b.time);
  if (a.time) return -1;
  if (b.time) return 1;
  return a.createdAt.localeCompare(b.createdAt);
}
