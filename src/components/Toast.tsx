import { AnimatePresence, motion } from 'motion/react';
import type { ToastEntry } from '../hooks/useUndo';

type Props = { toast: ToastEntry | null; onUndo: () => void };

export function Toast({ toast, onUndo }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            role="status"
            className="pointer-events-auto flex items-center gap-4 rounded-2xl py-2.5 pr-2.5 pl-4 text-sm font-semibold shadow-xl"
            style={{ background: 'var(--ink)', color: 'var(--bg)' }}
          >
            <span>{toast.message}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={onUndo}
                className="cursor-pointer rounded-xl px-3 py-1.5 font-bold transition hover:bg-white/15 dark:hover:bg-black/10"
                style={{ color: 'var(--wk-accent)' }}
              >
                Deshacer <span className="ml-1 text-xs opacity-60">Ctrl Z</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
