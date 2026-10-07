import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Category } from '../domain/category';
import type { Repository } from '../data/Repository';

export function useCategories(repo: Repository<Category>) {
  const [items, setItems] = useState<Category[]>([]);

  useEffect(() => {
    repo.list().then(setItems).catch(() => {});
  }, [repo]);

  const categories = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const add = useCallback(
    (name: string, emoji: string) => {
      const cat: Category = {
        id: crypto.randomUUID(),
        name,
        emoji,
        keywords: [],
        order: Math.max(-1, ...items.map((c) => c.order)) + 1,
      };
      setItems((prev) => [...prev, cat]);
      void repo.add(cat);
      return cat;
    },
    [repo, items],
  );

  const update = useCallback(
    (id: string, patch: Partial<Category>) => {
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      void repo.update(id, patch);
    },
    [repo],
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((c) => c.id !== id));
      void repo.remove(id);
    },
    [repo],
  );

  const restore = useCallback(
    (cat: Category) => {
      setItems((prev) => [...prev.filter((c) => c.id !== cat.id), cat]);
      void repo.add(cat);
    },
    [repo],
  );

  return { categories, add, update, remove, restore };
}
