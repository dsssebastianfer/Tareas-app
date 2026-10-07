import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Backend } from '../data/backend';
import { dismissMigration, localDataSummary, migrateLocalData } from '../data/migrateLocal';
import { UploadIcon } from './icons';

/** Ofrece subir a la cuenta lo que se anotó en este equipo antes de tener cuenta. */
export function MigrationBanner({ backend }: { backend: Backend }) {
  const [summary, setSummary] = useState(() => (backend.kind === 'cloud' ? localDataSummary() : null));
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');

  const parts = summary
    ? [
        summary.tasks && `${summary.tasks} ${summary.tasks === 1 ? 'tarea' : 'tareas'}`,
        summary.reminders && `${summary.reminders} ${summary.reminders === 1 ? 'recordatorio' : 'recordatorios'}`,
      ].filter(Boolean)
    : [];

  return (
    <AnimatePresence>
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="surface mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-4"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: 'var(--wk-accent)' }}>
            <UploadIcon width={20} height={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Tienes {parts.join(' y ')} en este equipo</p>
            <p className="text-xs text-[var(--ink-soft)]">
              {state === 'error'
                ? 'No se pudo subir todo. Revisa tu conexión e inténtalo de nuevo (no se duplicará nada).'
                : 'Son de antes de crear tu cuenta. ¿Las subimos para tenerlas en todos tus equipos?'}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={state === 'busy'}
              onClick={() => {
                dismissMigration();
                setSummary(null);
              }}
              className="cursor-pointer rounded-xl px-3 py-2 text-sm font-bold text-[var(--ink-soft)] transition hover:bg-black/5 hover:text-[var(--ink)] disabled:opacity-50 dark:hover:bg-white/10"
            >
              Ahora no
            </button>
            <button
              type="button"
              disabled={state === 'busy'}
              onClick={async () => {
                setState('busy');
                try {
                  await migrateLocalData(backend);
                  location.reload();
                } catch {
                  setState('error');
                }
              }}
              className="cursor-pointer rounded-xl px-3.5 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
              style={{ background: 'var(--wk-accent)' }}
            >
              {state === 'busy' ? 'Subiendo…' : 'Subir a mi cuenta'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
