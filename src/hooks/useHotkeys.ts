import { useEffect, useRef } from 'react';

type Handlers = {
  focusInput: () => void;
  undo: () => void;
  escape: () => void;
};

function isTyping(el: EventTarget | null) {
  const node = el as HTMLElement | null;
  return !!node && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.isContentEditable);
}

export function useHotkeys(handlers: Handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ref.current.escape();
        return;
      }
      if (isTyping(e.target)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        ref.current.undo();
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'n' || e.key === 'N' || e.key === '/')) {
        e.preventDefault();
        ref.current.focusInput();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
