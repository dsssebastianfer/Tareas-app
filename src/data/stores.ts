import { deleteBackground, loadBackground, saveBackground } from '../lib/imageStore';

/** Dónde se guardan los ajustes (nombre, tema, fondo…). */
export interface SettingsStore {
  load(): Promise<Record<string, unknown>>;
  save(settings: Record<string, unknown>): Promise<void>;
}

/** Dónde se guarda la imagen de fondo propia. */
export interface BackgroundStore {
  load(): Promise<Blob | undefined>;
  save(blob: Blob): Promise<void>;
  remove(): Promise<void>;
}

export const LOCAL_SETTINGS_KEY = 'semanas.settings.v1';

export const localSettingsStore: SettingsStore = {
  async load() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) ?? '{}');
    } catch {
      return {};
    }
  },
  async save(settings) {
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* sin persistencia */
    }
  },
};

export const localBackgroundStore: BackgroundStore = {
  load: loadBackground,
  save: async (blob) => void (await saveBackground(blob)),
  remove: async () => void (await deleteBackground()),
};
