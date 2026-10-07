/** Colores del anillo de un día: uno por tarea (color de su semana) y gris por cada recordatorio pendiente. */
export function ringColors(taskColors: string[], reminders: number): string[] {
  return [...taskColors, ...Array<string>(reminders).fill('var(--ink-soft)')].slice(0, 6);
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
