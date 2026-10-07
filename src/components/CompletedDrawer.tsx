import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Task } from '../domain/task';
import { colorForWeek, weekVars } from '../domain/palette';
import { addDays, dayLabel, getWeekKey, toDayKey, weeksBetween } from '../domain/week';
import { Drawer } from './Drawer';
import { ReopenIcon } from './icons';

type ContentProps = {
  completed: Task[];
  now: Date;
  onReopen: (task: Task) => void;
};

function streak(completed: Task[], now: Date): number {
  const days = new Set(completed.map((t) => toDayKey(new Date(t.completedAt!))));
  let d = days.has(toDayKey(now)) ? now : addDays(now, -1);
  let n = 0;
  while (days.has(toDayKey(d))) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

function closedIn(task: Task): string {
  const w = weeksBetween(task.weekKey, getWeekKey(new Date(task.completedAt!)));
  if (w <= 0) return 'cerrada la misma semana';
  return w === 1 ? 'cerrada en 1 semana' : `cerrada en ${w} semanas`;
}

function useCompletedData(completed: Task[], now: Date) {
  const weekKey = getWeekKey(now);
  return useMemo(() => {
    const sorted = [...completed].sort((a, b) => b.completedAt!.localeCompare(a.completedAt!));
    const map = new Map<string, Task[]>();
    for (const t of sorted) {
      const key = toDayKey(new Date(t.completedAt!));
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return {
      groups: [...map.entries()],
      thisWeek: completed.filter((t) => getWeekKey(new Date(t.completedAt!)) === weekKey).length,
      days: streak(completed, now),
    };
  }, [completed, now, weekKey]);
}

/** Cifras (completadas esta semana, racha) y lista de completadas por día. */
export function CompletedContent({ completed, now, onReopen, padded = false }: ContentProps & { padded?: boolean }) {
  const { groups, thisWeek, days } = useCompletedData(completed, now);
  const px = padded ? 'px-6' : '';
  return (
    <>
      <div className={`grid grid-cols-2 gap-3 pb-5 ${px}`}>
        <Stat value={thisWeek} label="esta semana" />
        <Stat value={days} label={days === 1 ? 'día de racha' : 'días de racha'} />
      </div>

      <div className={padded ? 'flex-1 overflow-y-auto px-6 pb-10' : ''}>
        {groups.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--ink-soft)]">Aún no completas tareas. La primera siempre se siente bien ✨</p>
        )}
        {groups.map(([day, tasks]) => (
          <section key={day} className="mb-6">
            <h3 className="mb-2 text-xs font-extrabold tracking-wider text-[var(--ink-faint)] uppercase">
              {dayLabel(new Date(tasks[0].completedAt!), now)}
            </h3>
            <ul className="flex flex-col gap-1.5">
              <AnimatePresence initial={false}>
                {tasks.map((t) => (
                  <motion.li
                    key={t.id}
                    layout
                    exit={{ opacity: 0, x: -30 }}
                    className="wk group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--surface)]"
                    style={weekVars(colorForWeek(t.weekKey))}
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full" style={{ background: 'var(--wk-accent)' }}>
                      <svg viewBox="0 0 24 24" className="size-3" fill="none">
                        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{t.title}</span>
                      <span className="block text-xs text-[var(--ink-soft)]">{closedIn(t)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onReopen(t)}
                      title="Volver a pendientes"
                      aria-label={`Reabrir «${t.title}»`}
                      // Con mouse aparece al pasar por encima; en pantallas táctiles siempre visible
                      className="grid size-8 cursor-pointer place-items-center rounded-lg text-[var(--ink-soft)] opacity-0 transition group-hover:opacity-100 hover:bg-black/5 hover:text-[var(--ink)] focus-visible:opacity-100 dark:hover:bg-white/10 [@media(hover:none)]:opacity-70"
                    >
                      <ReopenIcon width={16} height={16} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

export function CompletedDrawer({ open, onClose, ...content }: ContentProps & { open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="Completadas">
      <CompletedContent {...content} padded />
    </Drawer>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="surface rounded-2xl px-4 py-3">
      <div className="font-display text-3xl font-bold tabular-nums" style={{ color: 'var(--wk-accent)' }}>
        {value}
      </div>
      <div className="text-xs font-bold text-[var(--ink-soft)]">{label}</div>
    </div>
  );
}
