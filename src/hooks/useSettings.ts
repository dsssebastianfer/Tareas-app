import { useCallback, useState } from 'react';

export type SortBy = 'week' | 'category';
export type ThemePref = 'light' | 'dark' | 'auto';

type Settings = {
  name: string;
  sound: boolean;
  sortBy: SortBy;
  theme: ThemePref;
  /** Si el usuario eligió el tema a mano, cambiar de fondo ya no lo cambia. */
  themeLocked: boolean;
  /** Id de un fondo predefinido o 'custom' (imagen propia en IndexedDB). */
  background: string;
  /** Opacidad del panel de vidrio, 0 (transparente) a 0.92 (casi sólido). */
  glass: number;
  /** Opacidad de los elementos flotantes (calendario, tarjetas…), 0.3 a 1. Nunca transparente. */
  cardGlass: number;
};

const KEY = 'semanas.settings.v1';
const DEFAULTS: Settings = {
  name: 'Sebastián',
  sound: true,
  sortBy: 'week',
  theme: 'light',
  themeLocked: false,
  background: 'bosque',
  glass: 0.72,
  cardGlass: 0.75,
};

function read(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(read);
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* sin persistencia */
      }
      return next;
    });
  }, []);
  return [settings, update] as const;
}
