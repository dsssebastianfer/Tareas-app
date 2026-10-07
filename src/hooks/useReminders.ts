import { useCallback, useEffect, useState } from 'react';
import type { Reminder } from '../domain/reminder';
import type { Repository } from '../data/Repository';

export function useReminders(repo: Repository<Reminder>) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    repo.list().then(setReminders);
  }, [repo]);

  const add = useCallback(
    (title: string, date: string, time: string | null) => {
      const reminder: Reminder = { id: crypto.randomUUID(), title, date, time, done: false, createdAt: new Date().toISOString() };
      setReminders((prev) => [...prev, reminder]);
      void repo.add(reminder);
      return reminder;
    },
    [repo],
  );

  const update = useCallback(
    (id: string, patch: Partial<Reminder>) => {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      void repo.update(id, patch);
    },
    [repo],
  );

  const remove = useCallback(
    (id: string) => {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      void repo.remove(id);
    },
    [repo],
  );

  const restore = useCallback(
    (reminder: Reminder) => {
      setReminders((prev) => [...prev.filter((r) => r.id !== reminder.id), reminder]);
      void repo.add(reminder);
    },
    [repo],
  );

  return { reminders, add, update, remove, restore };
}
