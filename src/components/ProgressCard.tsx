import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ChevronIcon } from './icons';

type Props = { done: number; pending: number; lastWeek: number; onOpen?: () => void };

const R = 40;
const C = 2 * Math.PI * R;

export function ProgressCard({ done, pending, lastWeek, onOpen }: Props) {
  const total = done + pending;
  const pct = total === 0 ? 0 : done / total;
  const diff = done - lastWeek;
  const trend =
    diff > 0 ? `+${diff} respecto a la semana pasada` : diff < 0 ? `${diff} respecto a la semana pasada` : 'Igual que la semana pasada';

  return (
    <Wrapper
      onClick={onOpen}
      className={`surface group block w-full rounded-3xl p-5 text-left transition ${onOpen ? 'cursor-pointer hover:-translate-y-px' : ''}`}
      label={`Mi progreso: ${done} completadas esta semana${onOpen ? '. Ver completadas' : ''}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Mi progreso</h2>
        {onOpen && (
          <ChevronIcon width={18} height={18} className="text-[var(--ink-faint)] transition group-hover:translate-x-0.5 group-hover:text-[var(--ink)]" />
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="relative grid size-24 shrink-0 place-items-center">
          <svg viewBox="0 0 96 96" className="absolute inset-0 -rotate-90">
            <circle cx="48" cy="48" r={R} fill="none" stroke="var(--line)" strokeWidth="8" />
            <motion.circle
              cx="48"
              cy="48"
              r={R}
              fill="none"
              stroke="var(--wk-accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={false}
              animate={{ strokeDashoffset: C * (1 - pct) }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </svg>
          <span className="relative text-center leading-none">
            <motion.span
              key={done}
              initial={{ scale: 1.5, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="block font-display text-3xl font-bold tabular-nums"
            >
              {done}
            </motion.span>
            <span className="text-xs font-bold text-[var(--ink-soft)]">de {total}</span>
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-sm leading-snug font-bold">
            Completadas
            <br />
            esta semana
          </p>
          <p className="mt-1.5 text-xs leading-snug text-[var(--ink-soft)]">
            {diff > 0 && <span style={{ color: 'var(--wk-accent)' }}>↗ </span>}
            {trend}
          </p>
        </div>
      </div>
    </Wrapper>
  );
}

/** Botón si abre algo; si no (en la pestaña Progreso), un bloque normal. */
function Wrapper({ onClick, className, label, children }: { onClick?: () => void; className: string; label: string; children: ReactNode }) {
  return onClick ? (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      {children}
    </button>
  ) : (
    <section className={className} aria-label={label}>
      {children}
    </section>
  );
}
