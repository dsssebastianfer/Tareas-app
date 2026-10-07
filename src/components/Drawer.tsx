import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CloseIcon } from './icons';

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode };

/** Panel lateral derecho con fondo difuminado. */
export function Drawer({ open, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 right-0 z-30 flex w-[min(440px,100%)] flex-col border-l border-[var(--line)] shadow-2xl"
            style={{ background: 'var(--bg)' }}
            aria-label={title}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="grid size-9 cursor-pointer place-items-center rounded-xl text-[var(--ink-soft)] transition hover:bg-[var(--surface)] hover:text-[var(--ink)]"
              >
                <CloseIcon />
              </button>
            </div>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
