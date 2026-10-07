import { motion } from 'motion/react';
import type { SortBy } from '../hooks/useSettings';

const OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'category', label: 'Categoría' },
];

export function SortToggle({ value, onChange }: { value: SortBy; onChange: (v: SortBy) => void }) {
  return (
    <div role="radiogroup" aria-label="Ordenar por" className="surface flex rounded-xl p-0.5 text-sm font-bold">
      {OPTIONS.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative cursor-pointer rounded-[10px] px-3 py-1 transition-colors ${
              active ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            {active && (
              <motion.span
                layoutId="sort-pill"
                className="absolute inset-0 rounded-[10px] shadow-sm"
                style={{ background: 'var(--surface-strong)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
