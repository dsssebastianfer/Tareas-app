import { HourglassIcon } from './icons';

/** Cuántas semanas lleva postergada una tarea. Se intensifica con el tiempo. */
export function AgeBadge({ weeks }: { weeks: number }) {
  if (weeks <= 0) return null;
  const level = Math.min(weeks, 3);
  const styles = {
    1: { background: 'color-mix(in oklab, var(--wk-accent) 16%, transparent)', color: 'var(--wk-ink)' },
    2: { background: 'color-mix(in oklab, var(--wk-accent) 32%, transparent)', color: 'var(--wk-ink)' },
    3: { background: 'var(--wk-accent)', color: '#fff' },
  }[level as 1 | 2 | 3];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap"
      style={styles}
      title="Semanas que lleva pendiente"
    >
      <HourglassIcon />
      {weeks === 1 ? '1 semana' : `${weeks} semanas`}
    </span>
  );
}
