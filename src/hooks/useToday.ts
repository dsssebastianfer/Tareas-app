import { useEffect, useState } from 'react';

// --- PRUEBA: simular el paso de semanas (quitar junto con DebugTimeTravel) ---
const OFFSET_KEY = 'semanas.debug.weekOffset';
let weekOffset = import.meta.env.DEV ? Number(localStorage.getItem(OFFSET_KEY) ?? 0) || 0 : 0;
const listeners = new Set<() => void>();

export function getWeekOffset() {
  return weekOffset;
}

export function setWeekOffset(n: number) {
  weekOffset = Math.max(0, n);
  localStorage.setItem(OFFSET_KEY, String(weekOffset));
  listeners.forEach((l) => l());
}
// --- fin PRUEBA ---

/** Fecha actual. En desarrollo, `?hoy=2026-10-20` simula otro día para probar el cambio de semana. */
export function currentDate(): Date {
  let now = new Date();
  if (import.meta.env.DEV) {
    const p = new URLSearchParams(location.search).get('hoy');
    const m = p?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      now = new Date(+m[1], +m[2] - 1, +m[3], now.getHours(), now.getMinutes(), now.getSeconds());
    }
  }
  if (weekOffset) now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + weekOffset * 7, now.getHours(), now.getMinutes(), now.getSeconds());
  return now;
}

export function useToday(): Date {
  const [now, setNow] = useState(currentDate);
  useEffect(() => {
    const tick = () => setNow(currentDate());
    const id = window.setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    listeners.add(tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      listeners.delete(tick);
    };
  }, []);
  return now;
}
