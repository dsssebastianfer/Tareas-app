import { useCallback, useRef, type PointerEvent } from 'react';
import { useDragControls } from 'motion/react';

const LONG_PRESS_MS = 300;
/** Si el dedo se mueve más que esto antes de tiempo, es un scroll: no se arrastra. */
const MOVE_TOLERANCE = 8;

// Mientras se arrastra con el dedo, bloquear el scroll de la página.
let scrollLocked = false;
let lockInstalled = false;
function installScrollLock() {
  if (lockInstalled) return;
  lockInstalled = true;
  document.addEventListener(
    'touchmove',
    (e) => {
      if (scrollLocked && e.cancelable) e.preventDefault();
    },
    { passive: false },
  );
}

/**
 * Arrastre para reordenar:
 *  - Mouse: inmediato, como siempre.
 *  - Dedo: hay que mantener presionado un momento; un deslizamiento rápido hace scroll.
 */
export function useLongPressDrag({ enabled, onArm, onRelease }: { enabled: boolean; onArm?: () => void; onRelease?: () => void }) {
  const dragControls = useDragControls();
  const press = useRef<{ timer: number; x: number; y: number } | null>(null);
  const armed = useRef(false);

  const cancelPress = () => {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  };

  const release = useCallback(() => {
    cancelPress();
    scrollLocked = false;
    if (armed.current) {
      armed.current = false;
      onRelease?.();
    }
  }, [onRelease]);

  const handlers = {
    onPointerDown: (e: PointerEvent) => {
      if (!enabled) return;
      if (e.pointerType === 'mouse') {
        dragControls.start(e);
        return;
      }
      installScrollLock();
      const native = e.nativeEvent;
      cancelPress();
      press.current = {
        x: e.clientX,
        y: e.clientY,
        timer: window.setTimeout(() => {
          press.current = null;
          armed.current = true;
          scrollLocked = true;
          navigator.vibrate?.(12);
          onArm?.();
          dragControls.start(native);
          window.addEventListener('pointerup', release, { once: true });
          window.addEventListener('pointercancel', release, { once: true });
        }, LONG_PRESS_MS),
      };
    },
    onPointerMove: (e: PointerEvent) => {
      const p = press.current;
      if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_TOLERANCE) cancelPress();
    },
    onPointerUp: () => cancelPress(),
    onPointerCancel: () => cancelPress(),
  };

  return { dragControls, handlers, release };
}
