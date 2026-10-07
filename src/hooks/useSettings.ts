import { useCallback, useEffect, useRef, useState } from 'react';
import type { SettingsStore } from '../data/stores';

export type SortBy = 'week' | 'category';
export type ThemePref = 'light' | 'dark' | 'auto';

export type Settings = {
  name: string;
  sound: boolean;
  sortBy: SortBy;
  theme: ThemePref;
  /** Si el usuario eligió el tema a mano, cambiar de fondo ya no lo cambia. */
  themeLocked: boolean;
  /** Id de un fondo predefinido o 'custom' (imagen propia). */
  background: string;
  /** Opacidad del panel de vidrio, 0 (transparente) a 0.92 (casi sólido). */
  glass: number;
  /** Opacidad de los elementos flotantes (calendario, tarjetas…), 0.3 a 1. Nunca transparente. */
  cardGlass: number;
};

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  sound: true,
  sortBy: 'week',
  theme: 'light',
  themeLocked: false,
  background: 'bosque',
  glass: 0.72,
  cardGlass: 0.75,
};

const SAVE_DELAY = 600;

function readCache(key: string): Partial<Settings> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}');
  } catch {
    return {};
  }
}

function writeCache(key: string, s: Settings) {
  try {
    localStorage.setItem(key, JSON.stringify(s));
  } catch {
    /* sin persistencia */
  }
}

/**
 * Ajustes del usuario. Se pintan al instante desde una copia local y luego se actualizan
 * con lo guardado (en la nube, si hay cuenta). Los cambios se guardan con una pequeña espera,
 * para no enviar cada movimiento de un deslizador.
 */
export function useSettings(store: SettingsStore, cacheKey: string) {
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...readCache(cacheKey) }));
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    store.load().then((remote) => {
      setSettings((prev) => {
        const next = { ...prev, ...(remote as Partial<Settings>) };
        writeCache(cacheKey, next);
        return next;
      });
    });
  }, [store, cacheKey]);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        writeCache(cacheKey, next);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => void store.save(next), SAVE_DELAY);
        return next;
      });
    },
    [store, cacheKey],
  );

  return [settings, update] as const;
}
