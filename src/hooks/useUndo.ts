import { useCallback, useRef, useState } from 'react';

export type ToastEntry = { id: number; message: string; undo?: () => void };

const TOAST_MS = 5000;

export function useUndo() {
  const stack = useRef<(() => void)[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const nextId = useRef(1);
  const [toast, setToast] = useState<ToastEntry | null>(null);

  const show = useCallback((entry: ToastEntry) => {
    setToast(entry);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current);
    setToast(null);
  }, []);

  /** Registra una acción reversible y muestra el aviso con «Deshacer». */
  const push = useCallback(
    (message: string, undo: () => void) => {
      stack.current = [...stack.current.slice(-19), undo];
      show({ id: nextId.current++, message, undo });
    },
    [show],
  );

  /** Aviso sin acción. */
  const notify = useCallback((message: string) => show({ id: nextId.current++, message }), [show]);

  const undoLast = useCallback(() => {
    const undo = stack.current.pop();
    if (!undo) return;
    undo();
    dismiss();
  }, [dismiss]);

  return { toast, push, notify, undoLast, dismiss };
}
