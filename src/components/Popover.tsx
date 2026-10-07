import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type Props = {
  /** Dibuja el botón que abre el menú. */
  trigger: (toggle: () => void, open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  onOpenChange?: (open: boolean) => void;
  align?: 'left' | 'right';
  className?: string;
};

/** Menú flotante que se cierra al hacer clic fuera o con Escape. */
export function Popover({ trigger, children, onOpenChange, align = 'right', className = 'w-64' }: Props) {
  const [open, setOpenState] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const setOpen = (v: boolean) => {
    setOpenState(v);
    onOpenChangeRef.current?.(v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpenState(false);
      onOpenChangeRef.current?.(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      {trigger(() => setOpen(!open), open)}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
            className={`absolute top-full z-30 mt-2 rounded-2xl border border-[var(--line)] p-3 shadow-xl ${
              align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
            } ${className}`}
            style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
