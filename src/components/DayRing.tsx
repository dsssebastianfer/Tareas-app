import type { Task } from '../domain/task';
import { colorForWeek } from '../domain/palette';

/**
 * Colores del anillo de un día: uno por tarea, con el color de su semana.
 * Primero lo pendiente; lo completado después y desteñido, para que se note que ya se hizo.
 */
export function ringColors(tasks: Task[]): string[] {
  const color = (t: Task) => colorForWeek(t.weekKey).light.accent;
  return [
    ...tasks.filter((t) => !t.completedAt).map(color),
    ...tasks.filter((t) => t.completedAt).map((t) => `color-mix(in oklab, ${color(t)} 30%, transparent)`),
  ].slice(0, 6);
}

const RING_MASK = 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))';

/**
 * Anillo alrededor del número del día cuando tiene actividades.
 * Con varias, se divide en segmentos (con un pequeño espacio entre ellos), uno por actividad.
 */
export function DayRing({ colors, className = '-inset-[3px]' }: { colors: string[]; className?: string }) {
  if (colors.length === 0) return null;
  const step = 360 / colors.length;
  const gap = colors.length > 1 ? 7 : 0;
  const stops = colors
    .map((c, i) => {
      const a = i * step;
      const b = a + step;
      return gap ? `${c} ${a + gap / 2}deg ${b - gap / 2}deg, transparent ${b - gap / 2}deg ${b + gap / 2}deg` : `${c} 0deg 360deg`;
    })
    .join(', ');
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{ background: `conic-gradient(from ${-gap / 2}deg, ${stops})`, WebkitMask: RING_MASK, mask: RING_MASK }}
    />
  );
}
