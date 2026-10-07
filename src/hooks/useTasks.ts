import { useCallback, useEffect, useState } from 'react';
import type { Task } from '../domain/task';
import type { TaskRepository } from '../data/TaskRepository';
import { getWeekKey } from '../domain/week';

export function useTasks(repo: TaskRepository) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    repo.list().then((list) => {
      setTasks(list);
      setLoaded(true);
    });
  }, [repo]);

  const add = useCallback(
    (title: string, now: Date, dueDate: string | null = null, categoryId: string | null = null) => {
      const task: Task = {
        id: crypto.randomUUID(),
        title,
        createdAt: now.toISOString(),
        weekKey: getWeekKey(now),
        dueDate,
        categoryId,
        completedAt: null,
        order: Date.now(),
      };
      setTasks((prev) => [task, ...prev]);
      void repo.add(task);
      return task;
    },
    [repo],
  );

  const update = useCallback(
    (id: string, patch: Partial<Task>) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      void repo.update(id, patch);
    },
    [repo],
  );

  const remove = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      void repo.remove(id);
    },
    [repo],
  );

  const restore = useCallback(
    (task: Task) => {
      setTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
      void repo.add(task);
    },
    [repo],
  );

  return { tasks, loaded, add, update, remove, restore };
}
