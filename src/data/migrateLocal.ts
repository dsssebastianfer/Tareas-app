// Subir a la cuenta lo que se anotó en este navegador antes de tener cuenta (modo local).
import type { Task } from '../domain/task';
import type { Category } from '../domain/category';
import type { Reminder } from '../domain/reminder';
import { normalize } from '../domain/category';
import type { Backend } from './backend';
import { LOCAL_SETTINGS_KEY, localBackgroundStore } from './stores';

const KEYS = { tasks: 'semanas.tasks.v1', categories: 'semanas.categories.v1', reminders: 'semanas.reminders.v1' };
/** Marca que la migración ya se resolvió en este navegador (subida o descartada). */
const DONE_KEY = 'semanas.migration.done';

function readLocal<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

export function localDataSummary() {
  if (localStorage.getItem(DONE_KEY)) return null;
  const tasks = readLocal<Task>(KEYS.tasks).length;
  const reminders = readLocal<Reminder>(KEYS.reminders).length;
  return tasks + reminders > 0 ? { tasks, reminders } : null;
}

export function dismissMigration() {
  localStorage.setItem(DONE_KEY, 'descartada');
}

/** Sube en paralelo de a pocos, para no saturar la conexión. */
async function inChunks<T>(items: T[], fn: (item: T) => Promise<void>, size = 8) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(fn));
}

export async function migrateLocalData(backend: Backend) {
  // Las escrituras no lanzan errores (solo avisan); aquí se cuentan para no marcar como «subida» algo incompleto.
  let failures = 0;
  const onError = () => failures++;
  window.addEventListener('semanas:sync-error', onError);
  try {
    await migrate(backend);
  } finally {
    window.removeEventListener('semanas:sync-error', onError);
  }
  if (failures > 0) throw new Error(`${failures} elementos no se pudieron subir`);
  localStorage.setItem(DONE_KEY, 'subida');
}

async function migrate(backend: Backend) {
  const localCats = readLocal<Category>(KEYS.categories);
  const localTasks = readLocal<Task>(KEYS.tasks);
  const localReminders = readLocal<Reminder>(KEYS.reminders);

  // Categorías: las que ya existen en la cuenta con el mismo nombre se reutilizan (sin duplicar).
  const cloudCats = await backend.categories.list();
  const idMap = new Map<string, string>();
  let nextOrder = Math.max(-1, ...cloudCats.map((c) => c.order)) + 1;
  for (const c of [...localCats].sort((a, b) => a.order - b.order)) {
    const match = cloudCats.find((x) => normalize(x.name) === normalize(c.name));
    if (match) {
      idMap.set(c.id, match.id);
      const extra = c.keywords.filter((k) => !match.keywords.some((m) => normalize(m) === normalize(k)));
      if (extra.length) await backend.categories.update(match.id, { keywords: [...match.keywords, ...extra] });
    } else {
      await backend.categories.add({ ...c, order: nextOrder++ });
      idMap.set(c.id, c.id);
    }
  }

  await inChunks(localTasks, (t) =>
    backend.tasks.add({ ...t, dueDate: t.dueDate ?? null, categoryId: t.categoryId ? (idMap.get(t.categoryId) ?? null) : null }),
  );
  await inChunks(localReminders, (r) => backend.reminders.add(r));

  // Ajustes de apariencia y nombre (el nombre de la cuenta manda si ya existe).
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) ?? '{}');
    const cloud = await backend.settings.load();
    await backend.settings.save({ ...local, ...cloud, ...pickAppearance(local), name: cloud.name || local.name || '' });
    if (local.background === 'custom') {
      const blob = await localBackgroundStore.load();
      if (blob) await backend.background.save(blob);
    }
  } catch {
    /* los ajustes son opcionales */
  }

}

function pickAppearance(s: Record<string, unknown>) {
  const keys = ['theme', 'themeLocked', 'background', 'glass', 'cardGlass', 'sortBy', 'sound'];
  return Object.fromEntries(Object.entries(s).filter(([k]) => keys.includes(k)));
}
