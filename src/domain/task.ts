export type TaskKind = 'task' | 'activity';

export type Task = {
  id: string;
  title: string;
  createdAt: string;
  /** Lunes de la semana de creación, "YYYY-MM-DD". Define el color de la tarea para siempre. */
  weekKey: string;
  /** Fecha límite opcional, "YYYY-MM-DD". En una actividad, el día en que se hace. */
  dueDate?: string | null;
  /**
   * «activity»: algo que se hace un día determinado (vive en el Calendario y sale en Inicio solo ese día).
   * Sin valor o «task»: tarea normal, con o sin plazo.
   */
  kind?: TaskKind;
  /** Categoría opcional. Si la categoría se borra, la tarea queda «sin categoría». */
  categoryId?: string | null;
  completedAt: string | null;
  order: number;
};

export const isActivity = (t: Pick<Task, 'kind'>) => t.kind === 'activity';
