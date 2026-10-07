export type Task = {
  id: string;
  title: string;
  createdAt: string;
  /** Lunes de la semana de creación, "YYYY-MM-DD". Define el color de la tarea para siempre. */
  weekKey: string;
  /** Fecha límite opcional, "YYYY-MM-DD". */
  dueDate?: string | null;
  /** Categoría opcional. Si la categoría se borra, la tarea queda «sin categoría». */
  categoryId?: string | null;
  completedAt: string | null;
  order: number;
};
