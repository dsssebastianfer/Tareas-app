import { forwardRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Task } from '../domain/task';
import type { Reminder } from '../domain/reminder';
import { colorForWeek, weekVars } from '../domain/palette';
import { daysBetween, parseDayKey } from '../domain/week';
import { CheckCircle } from './CheckCircle';
import { BellIcon, CloseIcon, PlusIcon } from './icons';

type Props = {
  dayKey: string;
  now: Date;
  tasks: Task[];
  /** Tareas atrasadas: solo se muestran cuando el día elegido es hoy. */
  overdue: Task[];
  reminders: Reminder[];
  onCompleteTask: (task: Task, origin: Element) => void;
  onOpenTask: (task: Task) => void;
  onReopenTask: (task: Task) => void;
  onAddReminder: (title: string, time: string | null) => void;
  onToggleReminder: (reminder: Reminder) => void;
  onDeleteReminder: (reminder: Reminder) => void;
};

export const DayAgenda = forwardRef<HTMLInputElement, Props>(function DayAgenda(
  { dayKey, now, tasks, overdue, reminders, onCompleteTask, onOpenTask, onReopenTask, onAddReminder, onToggleReminder, onDeleteReminder },
  inputRef,
) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const day = parseDayKey(dayKey);
  const diff = daysBetween(now, day);
  const relative =
    diff === 0 ? 'Hoy' : diff === 1 ? 'Mañana' : diff === -1 ? 'Ayer' : diff > 0 ? `En ${diff} días` : `Hace ${-diff} días`;
  const empty = tasks.length === 0 && reminders.length === 0 && overdue.length === 0;

  return (
    <section className="surface rounded-3xl p-4" aria-label="Agenda del día">
      <header className="mb-3 px-1">
        <p className="text-[11px] font-extrabold tracking-wider text-[var(--ink-faint)] uppercase">{relative}</p>
        <h2 className="font-display text-lg leading-tight font-semibold">
          {day.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase())}
        </h2>
      </header>

      {/* key por día: al cambiar de día la lista se reemplaza sin cruzarse con la anterior */}
      <ul key={dayKey} className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {/* Pendientes arriba; lo completado/hecho después, tachado */}
          {overdue.map((t) => (
            <TaskRow key={t.id} task={t} overdue onComplete={onCompleteTask} onOpen={onOpenTask} onReopen={onReopenTask} />
          ))}
          {tasks.filter((t) => !t.completedAt).map((t) => (
            <TaskRow key={t.id} task={t} onComplete={onCompleteTask} onOpen={onOpenTask} onReopen={onReopenTask} />
          ))}
          {reminders.filter((r) => !r.done).map((r) => (
            <ReminderRow key={r.id} reminder={r} onToggle={onToggleReminder} onDelete={onDeleteReminder} />
          ))}
          {tasks.filter((t) => t.completedAt).map((t) => (
            <TaskRow key={t.id} task={t} onComplete={onCompleteTask} onOpen={onOpenTask} onReopen={onReopenTask} />
          ))}
          {reminders.filter((r) => r.done).map((r) => (
            <ReminderRow key={r.id} reminder={r} onToggle={onToggleReminder} onDelete={onDeleteReminder} />
          ))}
        </AnimatePresence>
      </ul>

      {empty && <p className="px-1 pb-1 text-sm text-[var(--ink-soft)]">Nada para este día.</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = title.trim();
          if (!t) return;
          onAddReminder(t, time || null);
          setTitle('');
          setTime('');
        }}
        className="mt-3 flex items-center gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-1.5 pl-3 focus-within:border-[var(--wk-accent)]"
      >
        <BellIcon width={16} height={16} className="shrink-0 text-[var(--ink-faint)]" />
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Recordatorio…"
          aria-label="Nuevo recordatorio"
          maxLength={120}
          className="min-w-0 flex-1 bg-transparent py-1 text-sm font-semibold outline-none placeholder:font-medium placeholder:text-[var(--ink-faint)]"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="Hora (opcional)"
          title="Hora (opcional)"
          className="w-[4.9rem] shrink-0 rounded-lg bg-transparent px-0.5 py-1 text-xs font-bold text-[var(--ink-soft)] outline-none"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          aria-label="Agregar recordatorio"
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-xl text-white transition hover:brightness-110 disabled:cursor-default disabled:opacity-40"
          style={{ background: 'var(--wk-accent)' }}
        >
          <PlusIcon width={16} height={16} />
        </button>
      </form>
    </section>
  );
});

function ReminderRow({
  reminder: r,
  onToggle,
  onDelete,
}: {
  reminder: Reminder;
  onToggle: (r: Reminder) => void;
  onDelete: (r: Reminder) => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="group flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 hover:bg-[color-mix(in_oklab,var(--ink)_4%,transparent)]"
    >
      <button
        type="button"
        onClick={() => onToggle(r)}
        aria-pressed={r.done}
        aria-label={r.done ? `Desmarcar «${r.title}»` : `Marcar «${r.title}» como hecho`}
        className={`grid size-6 shrink-0 cursor-pointer place-items-center rounded-lg border-2 transition ${
          r.done ? 'border-transparent bg-[var(--ink-soft)] text-white' : 'border-[var(--ink-faint)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)]'
        }`}
      >
        {r.done ? (
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <BellIcon width={12} height={12} strokeWidth={2.6} />
        )}
      </button>
      <span className={`min-w-0 flex-1 text-sm font-semibold break-words ${r.done ? 'text-[var(--ink-faint)] line-through' : ''}`}>
        {r.time && <span className="mr-1.5 font-bold text-[var(--ink-soft)] tabular-nums">{r.time}</span>}
        {r.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete(r)}
        aria-label={`Eliminar «${r.title}»`}
        className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-[var(--ink-faint)] opacity-0 transition group-hover:opacity-100 hover:bg-black/5 hover:text-[var(--ink)] focus-visible:opacity-100 dark:hover:bg-white/10 [@media(hover:none)]:opacity-70"
      >
        <CloseIcon width={14} height={14} />
      </button>
    </motion.li>
  );
}

function TaskRow({
  task,
  overdue,
  onComplete,
  onOpen,
  onReopen,
}: {
  task: Task;
  overdue?: boolean;
  onComplete: (task: Task, origin: Element) => void;
  onOpen: (task: Task) => void;
  onReopen: (task: Task) => void;
}) {
  const completed = !!task.completedAt;
  const [done, setDone] = useState(completed);
  // Si se reabre (o se completa desde otro lugar), reflejarlo
  useEffect(() => setDone(completed), [completed]);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="wk flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 hover:bg-[color-mix(in_oklab,var(--ink)_4%,transparent)]"
      style={weekVars(colorForWeek(task.weekKey))}
    >
      <span className="origin-left scale-[0.86]">
        <CheckCircle
          checked={done}
          label={completed ? `Volver «${task.title}» a pendientes` : `Completar «${task.title}»`}
          onClick={() => {
            if (completed) return onReopen(task);
            if (done) return;
            setDone(true);
            const el = document.activeElement ?? document.body;
            window.setTimeout(() => onComplete(task, el), 420);
          }}
        />
      </span>
      {completed ? (
        <span className="min-w-0 flex-1 text-sm font-semibold break-words text-[var(--ink-faint)] line-through">{task.title}</span>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(task)}
          title="Abrir tarea"
          className={`min-w-0 flex-1 cursor-pointer text-left text-sm font-semibold break-words transition ${done ? 'text-[var(--ink-faint)] line-through' : 'hover:underline'}`}
        >
          {task.title}
        </button>
      )}
      {overdue && (
        <span className="due-chip due-overdue shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold">Atrasada</span>
      )}
    </motion.li>
  );
}
