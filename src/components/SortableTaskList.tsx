import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, Reorder } from 'motion/react';
import type { Task } from '../domain/task';

type DragHandlers = { onDragStart: (id: string) => void; onDragEnd: () => void };

type Props = {
  tasks: Task[];
  renderCard: (task: Task, drag: DragHandlers) => ReactNode;
  /** Se llama una vez al soltar, con el nuevo valor de orden de la tarea movida. */
  onMove: (task: Task, order: number) => void;
};

/** Lista de tareas que se reordena arrastrando. Mientras se arrastra el orden es local; al soltar se guarda. */
export function SortableTaskList({ tasks, renderCard, onMove }: Props) {
  const [liveIds, setLiveIds] = useState<string[] | null>(null);
  const draggingId = useRef<string | null>(null);
  const liveRef = useRef<string[] | null>(null);
  const setLive = (v: string[] | null) => {
    liveRef.current = v;
    setLiveIds(v);
  };

  const byId = new Map(tasks.map((t) => [t.id, t]));
  const ids = liveIds?.filter((id) => byId.has(id)) ?? tasks.map((t) => t.id);
  // Si apareció una tarea nueva durante el arrastre, va al final.
  for (const t of tasks) if (!ids.includes(t.id)) ids.push(t.id);

  const drag: DragHandlers = {
    onDragStart: (id) => {
      draggingId.current = id;
      setLive(tasks.map((t) => t.id));
    },
    onDragEnd: () => {
      const id = draggingId.current;
      const liveIds = liveRef.current;
      draggingId.current = null;
      setLive(null);
      if (!id || !liveIds) return;
      const index = liveIds.indexOf(id);
      const original = tasks.map((t) => t.id);
      if (index === -1 || original.indexOf(id) === index) return;
      // Nuevo orden: entre los vecinos donde quedó (una sola escritura).
      const prev = index > 0 ? byId.get(liveIds[index - 1]) : undefined;
      const next = index < liveIds.length - 1 ? byId.get(liveIds[index + 1]) : undefined;
      const order =
        prev && next ? (prev.order + next.order) / 2 : prev ? prev.order + 1 : next ? next.order - 1 : byId.get(id)!.order;
      onMove(byId.get(id)!, order);
    },
  };

  return (
    <Reorder.Group as="ul" axis="y" values={ids} onReorder={setLive} className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {ids.map((id) => renderCard(byId.get(id)!, drag))}
      </AnimatePresence>
    </Reorder.Group>
  );
}
