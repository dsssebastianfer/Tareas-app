import type { SupabaseClient } from '@supabase/supabase-js';
import type { Task } from '../domain/task';
import type { Category } from '../domain/category';
import type { Reminder } from '../domain/reminder';
import type { Repository } from './Repository';
import { LOCAL_SETTINGS_KEY, localBackgroundStore, localSettingsStore, type BackgroundStore, type SettingsStore } from './stores';
import { localTaskRepository } from './localTaskRepository';
import { localCategoryRepository } from './localCategoryRepository';
import { localReminderRepository } from './localReminderRepository';
import {
  supabaseBackgroundStore,
  supabaseCategoryRepository,
  supabaseReminderRepository,
  supabaseSettingsStore,
  supabaseTaskRepository,
} from './supabaseRepositories';

/** Todo lo que la app necesita para guardar datos. Local (este navegador) o nube (Supabase, por usuario). */
export type Backend = {
  kind: 'local' | 'cloud';
  tasks: Repository<Task>;
  categories: Repository<Category>;
  reminders: Repository<Reminder>;
  settings: SettingsStore;
  background: BackgroundStore;
  /** Copia local de los ajustes, para pintar la app al instante (tema, fondo) antes de que lleguen de la nube. */
  settingsCacheKey: string;
};

export const localBackend: Backend = {
  kind: 'local',
  tasks: localTaskRepository,
  categories: localCategoryRepository,
  reminders: localReminderRepository,
  settings: localSettingsStore,
  background: localBackgroundStore,
  settingsCacheKey: LOCAL_SETTINGS_KEY,
};

export function cloudBackend(db: SupabaseClient, userId: string): Backend {
  return {
    kind: 'cloud',
    tasks: supabaseTaskRepository(db),
    categories: supabaseCategoryRepository(db),
    reminders: supabaseReminderRepository(db),
    settings: supabaseSettingsStore(db, userId),
    background: supabaseBackgroundStore(db, userId),
    settingsCacheKey: `semanas.settings.cache.${userId}`,
  };
}
