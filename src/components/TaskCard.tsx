import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, Reorder, motion, useAnimationControls } from 'motion/react';
import type { Task } from '../domain/task';
import type { Category } from '../domain/category';
import { colorForWeek, weekVars } from '../domain/palette';
import { quickDueOptions } from '../domain/due';
import { weeksBetween } from '../domain/week';
import { AgeBadge } from './AgeBadge';
import { CategoryChip } from './CategoryChip';
import { CheckCircle } from './CheckCircle';
import { DueChip } from './DueChip';
import { DateField } from './DateField';
import { TrashIcon } from './icons';
import { useLongPressDrag } from '../hooks/useLongPressDrag';

type Props = {
  task: Task;
  now: Date;
  currentWeekKey: string;
  categories: Category[];
  /** En la vista por categoría el grupo ya la indica. */
  showCategory?: boolean;
  editing: boolean;
  /** Recién agregada: brilla un momento. */
  fresh?: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onComplete: (task: Task, origin: Element) => void;
  onRename: (task: Task, title: string) => void;
  onSetDue: (task: Task, due: string | null) => void;
  onSetCategory: (task: Task, categoryId: string | null) => void;
  onDelete: (task: Task) => void;
  /** Arrastrar para reordenar (lo maneja la lista). */
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
};

const COMPLETE_DELAY = 520;

export const TaskCard = forwardRef<HTMLLIElement, Props>(function TaskCard(
  {
    task,
    now,
    currentWeekKey,
    categories,
    showCategory = true,
    editing,
    fresh,
    onStartEdit,
    onStopEdit,
    onComplete,
    onRename,
    onSetDue,
    onSetCategory,
    onDelete,
    onDragStart,
    onDragEnd,
  },
  ref,
) {
  const [done, setDone] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const cardRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  /** Si hubo arrastre, el clic que sigue no abre la edición. */
  const dragged = useRef(false);
  const controls = useAnimationControls();
  // En el celular hay que mantener presionado para arrastrar; así deslizar hace scroll.
  const longPress = useLongPressDrag({
    enabled: !editing && !done,
    onArm: () => {
      dragged.current = true; // soltar sin moverse no abre la edición
      void controls.start({ scale: 1.03, transition: { type: 'spring', stiffness: 500, damping: 25 } });
    },
    onRelease: () => void controls.start({ scale: 1 }),
  });
  const age = weeksBetween(task.weekKey, currentWeekKey);
  const due = task.dueDate ?? null;
  const category = categories.find((c) => c.id === task.categoryId) ?? null;
  const chipCategory = showCategory ? category : null;

  // Al cerrar la edición (por cualquier vía) se guarda el título.
  const wasEditing = useRef(editing);
  const latest = useRef({ draft, task, onRename });
  latest.current = { draft, task, onRename };
  useEffect(() => {
    if (wasEditing.current && !editing) {
      const { draft, task, onRename } = latest.current;
      const title = draft.trim();
      if (title && title !== task.title) onRename(task, title);
      else setDraft(task.title);
    }
    wasEditing.current = editing;
  }, [editing]);

  // Clic fuera de la tarjeta: cerrar.
  useEffect(() => {
    if (!editing) return;
    const onDown = (e: MouseEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) onStopEdit();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [editing, onStopEdit]);

  const complete = () => {
    if (done) return;
    setDone(true);
    if (editing) onStopEdit();
    void controls.start({ scale: [1, 1.035, 1], transition: { duration: 0.35 } });
    window.setTimeout(() => onComplete(task, checkRef.current ?? document.body), COMPLETE_DELAY);
  };

  const cancel = () => {
    setDraft(task.title);
    onStopEdit();
  };

  const options = quickDueOptions(now);

  return (
    <Reorder.Item
      ref={ref}
      value={task.id}
      dragListener={false}
      dragControls={longPress.dragControls}
      {...longPress.handlers}
      onPointerDown={(e) => {
        dragged.current = false;
        longPress.handlers.onPointerDown(e);
      }}
      onDragStart={() => {
        dragged.current = true;
        onDragStart?.(task.id);
      }}
      onDragEnd={() => {
        longPress.release();
        onDragEnd?.();
      }}
      whileDrag={{ scale: 1.025, filter: 'drop-shadow(0 16px 20px rgb(40 25 10 / 0.22))' }}
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.94, transition: { duration: 0.28, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      // Reorder controla z-index en línea; !z-10 deja la tarjeta abierta por encima.
      className={`wk relative list-none ${editing ? '!z-10' : ''}`}
      style={weekVars(colorForWeek(task.weekKey))}
    >
      {/* Tarjeta normal: siempre ocupa su lugar en la lista */}
      <motion.div
        animate={controls}
        role="button"
        tabIndex={editing ? -1 : 0}
        aria-label={`Editar «${task.title}»`}
        aria-hidden={editing || undefined}
        onClick={() => {
          if (dragged.current) return;
          if (!done) onStartEdit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target === e.currentTarget) onStartEdit();
        }}
        className={`task-card cursor-pointer rounded-2xl py-3 pr-3 pl-3.5 ${fresh ? 'task-fresh' : ''}`}
        style={editing ? { visibility: 'hidden' } : undefined}
      >
        <div className="flex items-center gap-3">
          <CheckCircle ref={checkRef} checked={done} onClick={complete} label={`Completar «${task.title}»`} />
          <div className="min-w-0 flex-1">
            <span data-done={done} className="task-title block text-[15px] leading-snug font-semibold break-words">
              {task.title}
            </span>
            {(due || chipCategory || age > 0) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {due && <DueChip dueKey={due} now={now} />}
                {chipCategory && <CategoryChip category={chipCategory} />}
                <AgeBadge weeks={age} />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tarjeta abierta: flota sobre las siguientes sin empujarlas */}
      <AnimatePresence>
        {editing && (
          <motion.div
            key="editor"
            ref={cardRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 36 }}
            className="task-card task-card-editing absolute inset-x-0 top-0 origin-top rounded-2xl py-3 pr-3 pl-3.5"
          >
            <div className="flex items-center gap-3">
              <CheckCircle checked={false} onClick={complete} label={`Completar «${task.title}»`} />
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onStopEdit();
                  if (e.key === 'Escape') {
                    e.stopPropagation();
                    cancel();
                  }
                }}
                aria-label="Título de la tarea"
                maxLength={200}
                className="min-w-0 flex-1 rounded-lg bg-white/55 px-2 py-1 text-[15px] font-semibold outline-none dark:bg-black/20"
              />
            </div>
          <div className="mt-3 flex flex-col gap-3 border-t pt-3 pl-10" style={{ borderColor: 'var(--wk-border)' }}>
            {categories.length > 0 && (
              <Field label="Categoría">
                {categories.map((c) => {
                  const selected = c.id === task.categoryId;
                  return (
                    <Option
                      key={c.id}
                      selected={selected}
                      onClick={() => onSetCategory(task, selected ? null : c.id)}
                      title={selected ? 'Quitar categoría' : undefined}
                    >
                      <span aria-hidden>{c.emoji}</span> {c.name}
                    </Option>
                  );
                })}
              </Field>
            )}

            <Field label="Fecha límite">
              {options.map((o) => {
                const selected = o.key === due;
                return (
                  <Option
                    key={o.key}
                    selected={selected}
                    onClick={() => onSetDue(task, selected ? null : o.key)}
                    title={selected ? 'Quitar fecha' : undefined}
                  >
                    {o.label}
                  </Option>
                );
              })}
              <DateField
                value={due}
                now={now}
                onChange={(v) => onSetDue(task, v)}
                selected={!!due && !options.some((o) => o.key === due)}
              />
            </Field>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-bold opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
              >
                <TrashIcon width={15} height={15} /> Eliminar
              </button>
              <button
                type="button"
                onClick={onStopEdit}
                className="cursor-pointer rounded-xl px-4 py-1.5 text-sm font-bold text-white transition hover:brightness-110"
                style={{ background: 'var(--wk-accent)' }}
              >
                Listo
              </button>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
});

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-extrabold tracking-wider uppercase opacity-60">{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function Option({
  selected,
  onClick,
  title,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={selected}
      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition ${selected ? 'opt-selected' : 'opt'}`}
    >
      {children}
    </button>
  );
}
