/** Punto único de acceso a datos. Hoy: localStorage. Mañana: Supabase con usuarios. */
export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  add(item: T): Promise<void>;
  update(id: string, patch: Partial<T>): Promise<void>;
  remove(id: string): Promise<void>;
}

/** Repositorio sobre localStorage. `seed` se usa solo si la clave aún no existe. */
export function createLocalRepository<T extends { id: string }>(key: string, seed: () => T[] = () => []): Repository<T> {
  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        const initial = seed();
        write(initial);
        return initial;
      }
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  };

  const write = (items: T[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* almacenamiento lleno o bloqueado: la sesión sigue en memoria */
    }
  };

  return {
    async list() {
      return read();
    },
    async add(item) {
      write([item, ...read().filter((t) => t.id !== item.id)]);
    },
    async update(id, patch) {
      write(read().map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    async remove(id) {
      write(read().filter((t) => t.id !== id));
    },
  };
}
