import { motion } from 'motion/react';

export function EmptyState({ hasHistory }: { hasHistory: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center py-16 text-center"
    >
      <svg viewBox="0 0 160 120" className="mb-5 w-40" aria-hidden>
        <rect x="46" y="14" width="70" height="70" rx="14" fill="#e6e0fb" transform="rotate(9 81 49)" />
        <rect x="38" y="24" width="70" height="70" rx="14" fill="#d8f1e4" transform="rotate(-5 73 59)" />
        <rect x="44" y="34" width="74" height="74" rx="16" fill="var(--wk-bg)" stroke="var(--wk-border)" strokeWidth="2" />
        <motion.path
          d="M66 72l10 10 20-22"
          fill="none"
          stroke="var(--wk-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        />
        <path d="M124 92c10-14 22-16 30-14-4 12-16 20-30 14z" fill="#3fae7a" opacity=".75" />
        <path d="M124 92c4-10 12-18 22-22" stroke="#1f5b40" strokeWidth="1.5" fill="none" opacity=".5" />
      </svg>
      <p className="font-display text-xl font-semibold">{hasHistory ? 'Nada pendiente. Disfruta 🌿' : 'Tu semana empieza aquí'}</p>
      <p className="mt-1 max-w-xs text-sm text-[var(--ink-soft)]">
        {hasHistory
          ? 'Todo lo que anotes ahora quedará con el color de esta semana.'
          : 'Escribe tu primera tarea arriba y presiona Enter. Cada semana tendrá su propio color.'}
      </p>
    </motion.div>
  );
}
