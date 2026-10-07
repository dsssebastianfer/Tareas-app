import { useEffect, useState } from 'react';
import type { ThemePref } from './useSettings';

const media = () => window.matchMedia('(prefers-color-scheme: dark)');

/** Resuelve el tema ('auto' sigue al sistema) y lo aplica en <html data-theme>. */
export function useTheme(pref: ThemePref): 'light' | 'dark' {
  const [systemDark, setSystemDark] = useState(() => media().matches);

  useEffect(() => {
    const m = media();
    const onChange = () => setSystemDark(m.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  const theme = pref === 'auto' ? (systemDark ? 'dark' : 'light') : pref;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', theme === 'dark' ? '#1d1a22' : '#f6efe4'));
  }, [theme]);

  return theme;
}
