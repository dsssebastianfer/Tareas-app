import type { SupabaseClient } from '@supabase/supabase-js';
import type { Task } from '../domain/task';
import type { Category } from '../domain/category';
import type { Reminder } from '../domain/reminder';
import type { Repository } from './Repository';
import type { BackgroundStore, SettingsStore } from './stores';
import { reportSyncError } from '../lib/supabase';

type Row = Record<string, unknown>;

/** Repositorio sobre una tabla de Supabase. Las reglas de la base filtran por usuario. */
function createSupabaseRepository<T extends { id: string }>(
  db: SupabaseClient,
  table: string,
  toRow: (item: Partial<T>) => Row,
  fromRow: (row: Row) => T,
): Repository<T> {
  // Las escrituras son optimistas: la pantalla ya cambió; si falla, solo se avisa (no se lanza).
  const run = async (q: PromiseLike<{ error: unknown }>) => {
    try {
      const { error } = await q;
      if (error) reportSyncError(error);
    } catch (e) {
      reportSyncError(e);
    }
  };
  return {
    async list() {
      const { data, error } = await db.from(table).select('*');
      if (error) {
        reportSyncError(error);
        throw error;
      }
      return (data ?? []).map(fromRow);
    },
    add: (item) => run(db.from(table).upsert(toRow(item))),
    update: (id, patch) => run(db.from(table).update(toRow(patch)).eq('id', id)),
    remove: (id) => run(db.from(table).delete().eq('id', id)),
  };
}

/** Solo las claves presentes (un `update` parcial no debe pisar columnas con undefined). */
function pick(row: Row): Row {
  return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
}

const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);

export function supabaseTaskRepository(db: SupabaseClient) {
  return createSupabaseRepository<Task>(
    db,
    'tasks',
    (t) =>
      pick({
        id: t.id,
        title: t.title,
        created_at: t.createdAt,
        week_key: t.weekKey,
        due_date: t.dueDate,
        category_id: t.categoryId,
        completed_at: t.completedAt,
        order: t.order,
      }),
    (r) => ({
      id: r.id as string,
      title: r.title as string,
      createdAt: iso(r.created_at)!,
      weekKey: r.week_key as string,
      dueDate: (r.due_date as string | null) ?? null,
      categoryId: (r.category_id as string | null) ?? null,
      completedAt: iso(r.completed_at),
      order: r.order as number,
    }),
  );
}

export function supabaseCategoryRepository(db: SupabaseClient) {
  return createSupabaseRepository<Category>(
    db,
    'categories',
    (c) => pick({ id: c.id, name: c.name, emoji: c.emoji, keywords: c.keywords, order: c.order }),
    (r) => ({
      id: r.id as string,
      name: r.name as string,
      emoji: r.emoji as string,
      keywords: (r.keywords as string[]) ?? [],
      order: r.order as number,
    }),
  );
}

export function supabaseReminderRepository(db: SupabaseClient) {
  return createSupabaseRepository<Reminder>(
    db,
    'reminders',
    (m) => pick({ id: m.id, title: m.title, date: m.date, time: m.time, done: m.done, created_at: m.createdAt }),
    (r) => ({
      id: r.id as string,
      title: r.title as string,
      date: r.date as string,
      time: (r.time as string | null) ?? null,
      done: r.done as boolean,
      createdAt: iso(r.created_at)!,
    }),
  );
}

/** Ajustes en profiles.settings (jsonb). */
export function supabaseSettingsStore(db: SupabaseClient, userId: string): SettingsStore {
  return {
    async load() {
      const { data, error } = await db.from('profiles').select('settings').eq('id', userId).maybeSingle();
      if (error) {
        reportSyncError(error);
        return {};
      }
      return (data?.settings as Record<string, unknown>) ?? {};
    },
    async save(settings) {
      const { error } = await db.from('profiles').upsert({ id: userId, settings, updated_at: new Date().toISOString() });
      if (error) reportSyncError(error);
    },
  };
}

/** Imagen de fondo propia en Storage: backgrounds/<usuario>/background.webp */
export function supabaseBackgroundStore(db: SupabaseClient, userId: string): BackgroundStore {
  const path = `${userId}/background.webp`;
  const bucket = () => db.storage.from('backgrounds');
  return {
    async load() {
      // Primero ver si existe (descargar algo inexistente deja un error 400 en la consola).
      const { data: files } = await bucket().list(userId, { search: 'background.webp' });
      if (!files?.some((f) => f.name === 'background.webp')) return undefined;
      const { data, error } = await bucket().download(path);
      return error ? undefined : data;
    },
    async save(blob) {
      const { error } = await bucket().upload(path, blob, { upsert: true, contentType: blob.type || 'image/webp' });
      if (error) {
        reportSyncError(error);
        throw error;
      }
    },
    async remove() {
      const { error } = await bucket().remove([path]);
      if (error) reportSyncError(error);
    },
  };
}
