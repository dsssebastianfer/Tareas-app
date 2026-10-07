// PRUEBA: botón para simular el paso de semanas. Quitar este archivo y su uso en App.tsx.
import { getWeekOffset, setWeekOffset } from '../hooks/useToday';

export function DebugTimeTravel() {
  const offset = getWeekOffset();
  return (
    <div className="fixed right-6 bottom-6 z-20 flex items-center gap-1 rounded-2xl border border-dashed border-[var(--ink-faint)] bg-[var(--surface-strong)] p-1 text-sm font-bold shadow-lg">
      <span className="px-2 text-xs text-[var(--ink-soft)]">🧪 {offset ? `+${offset} sem` : 'Hoy'}</span>
      <button
        type="button"
        onClick={() => setWeekOffset(offset + 1)}
        className="cursor-pointer rounded-xl px-3 py-1.5 text-white transition hover:brightness-110"
        style={{ background: 'var(--wk-accent)' }}
      >
        +1 semana
      </button>
      {offset > 0 && (
        <button
          type="button"
          onClick={() => setWeekOffset(0)}
          className="cursor-pointer rounded-xl px-3 py-1.5 text-[var(--ink-soft)] transition hover:bg-black/5 hover:text-[var(--ink)] dark:hover:bg-white/10"
        >
          Volver a hoy
        </button>
      )}
    </div>
  );
}
