import { forwardRef } from 'react';
import { motion } from 'motion/react';

type Props = { checked: boolean; onClick: () => void; label: string };

export const CheckCircle = forwardRef<HTMLButtonElement, Props>(function CheckCircle(
  { checked, onClick, label },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // no abrir la edición de la tarjeta
        onClick();
      }}
      aria-label={label}
      aria-pressed={checked}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.88 }}
      className="group relative grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-colors"
      style={{
        borderColor: 'var(--wk-accent)',
        background: checked ? 'var(--wk-accent)' : 'color-mix(in oklab, var(--wk-accent) 8%, transparent)',
      }}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke={checked ? '#fff' : 'var(--wk-accent)'}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        />
      </svg>
      {!checked && (
        <svg viewBox="0 0 24 24" className="absolute size-4 opacity-0 transition-opacity group-hover:opacity-50" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="var(--wk-accent)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </motion.button>
  );
});
