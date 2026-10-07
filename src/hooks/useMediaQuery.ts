import { useEffect, useState } from 'react';

/** true mientras la media query se cumpla (por ejemplo, pantalla de celular). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Mismo corte que el prefijo `sm:` de Tailwind (640 px). */
export const useIsPhone = () => useMediaQuery('(max-width: 639px)');
