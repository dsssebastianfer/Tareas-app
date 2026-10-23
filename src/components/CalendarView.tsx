import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { isActivity, type Task } from '../domain/task';
import { longDayLabel, monthOf, monthTitle, monthWeeks, shiftMonth, WEEKDAYS_LONG, type MonthRef } from '../domain/calendar';
import { dueInfo } from '../domain/due';
import { colorForWeek, weekVars } from '../domain/palette';
import { getWeekKey, parseDayKey, toDayKey } from '../domain/week';
import { ChevronIcon, PinIcon, PlusIcon } from './icons';
import { DayRing, ringColors } from './DayRing';
import { SortableTaskList } from './SortableTaskList';

type Drag = { onDragStart: (id: string) => void; onDragEnd: () => void };

export type DayItems = { tasks: Task[] };

type Props = {
  now: Date;
  selected: string;
  onSelect: (dayKey: string) => void;
  /** Elegir el día y llevar el foco a «Nueva actividad». */
  onAddOnDay: (dayKey: string) => void;
  items: Map<string, DayItems>;
  /** Actividades pendientes, por fecha: se listan todas bajo el mes. */
  activities: Task[];
  renderActivity: (task: Task, drag: Drag) => ReactNode;
  onMove: (task: Task, order: number) => void;
  /** Agenda del día elegido, bajo el mes (solo en celular; en pantallas grandes va en la columna derecha). */
  agenda: ReactNode;
};

const MAX_ITEMS = 3;

export function CalendarView({ now, selected, onSelect, onAddOnDay, items, activities, renderActivity, onMove, agenda }: Props) {
  const [month, setMonth] = useState<MonthRef>(() => monthOf(parseDayKey(selected)));
  const todayKey = toDayKey(now);
  const weeks = monthWeeks(month);

  useEffect(() => {
    const d = parseDayKey(selected);
    setMonth((m) => (m.year === d.getFullYear() && m.month === d.getMonth() ? m : monthOf(d)));
  }, [selected]);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-bold tracking-wide text-[var(--ink-soft)]">Calendario</p>
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] leading-tight font-semibold tracking-tight">{monthTitle(month)}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMonth(monthOf(now));
              onSelect(todayKey);
            }}
            className="surface cursor-pointer rounded-xl px-3.5 py-2 text-sm font-bold transition hover:-translate-y-px"
          >
            Hoy
          </button>
          <MonthNav dir="left" onClick={() => setMonth((m) => shiftMonth(m, -1))} />
          <MonthNav dir="right" onClick={() => setMonth((m) => shiftMonth(m, 1))} />
        </div>
      </header>

      <div className="surface overflow-hidden rounded-3xl">
        <div className="grid grid-cols-[8px_repeat(7,minmax(0,1fr))] border-b border-[var(--line)]">
          <span />
          {WEEKDAYS_LONG.map((d) => (
            <span key={d} className="px-2 py-2.5 text-xs font-extrabold tracking-wide text-[var(--ink-faint)] uppercase">
              {d}
            </span>
          ))}
        </div>

        {weeks.map((week, wi) => {
          const wk = colorForWeek(getWeekKey(week[0]));
          return (
            <div
              key={toDayKey(week[0])}
              className={`wk grid grid-cols-[8px_repeat(7,minmax(0,1fr))] ${wi < weeks.length - 1 ? 'border-b border-[var(--line)]' : ''}`}
              style={weekVars(wk)}
            >
              {/* Franja con el color de la semana */}
              <span style={{ background: 'var(--wk-accent)', opacity: 0.6 }} title={`Semana ${wk.name}`} />
              {week.map((d, di) => {
                const key = toDayKey(d);
                const inMonth = d.getMonth() === month.month;
                const isToday = key === todayKey;
                const isSelected = key === selected;
                const day = items.get(key);
                // Pendientes arriba; lo completado después, tachado
                const tasks = day?.tasks ?? [];
                const all = [...tasks.filter((t) => !t.completedAt), ...tasks.filter((t) => t.completedAt)];
                const extra = all.length - MAX_ITEMS;
                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(key)}
                    onKeyDown={(e) => e.key === 'Enter' && onSelect(key)}
                    aria-label={d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    aria-pressed={isSelected}
                    className={`group relative min-h-24 cursor-pointer p-1.5 text-left transition-colors sm:min-h-28 ${
                      di < 6 ? 'border-r border-[var(--line)]' : ''
                    } ${isSelected ? 'bg-[color-mix(in_oklab,var(--wk-accent)_10%,transparent)]' : 'hover:bg-[color-mix(in_oklab,var(--ink)_3%,transparent)]'} ${
                      inMonth ? '' : 'opacity-45'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="cal-selected"
                        className="pointer-events-none absolute inset-0"
                        style={{ boxShadow: 'inset 0 0 0 2px var(--wk-accent)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`relative grid size-7 place-items-center rounded-full text-[13px] font-bold tabular-nums ${isToday ? 'text-white' : ''}`}
                        style={isToday ? { background: 'var(--wk-accent)' } : undefined}
                      >
                        {d.getDate()}
                        {day && (
                          <DayRing
                            colors={ringColors(day.tasks.filter((t) => !t.completedAt).map((t) => colorForWeek(t.weekKey).light.accent))}
                            className={isToday ? '-inset-[4px]' : 'inset-0'}
                          />
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddOnDay(key);
                        }}
                        aria-label="Agregar actividad este día"
                        title="Agregar actividad"
                        className="grid size-6 cursor-pointer place-items-center rounded-lg text-[var(--ink-soft)] opacity-0 transition group-hover:opacity-100 hover:bg-[color-mix(in_oklab,var(--ink)_8%,transparent)] focus-visible:opacity-100 max-sm:hidden"
                      >
                        <PlusIcon width={14} height={14} />
                      </button>
                    </div>

                    <ul className="hidden flex-col gap-0.5 sm:flex">
                      {all.slice(0, MAX_ITEMS).map((t) => (
                        <li
                          key={t.id}
                          className={`wk truncate rounded-md px-1.5 py-0.5 text-[11.5px] leading-snug font-bold ${t.completedAt ? 'line-through opacity-50' : ''}`}
                          style={{ ...weekVars(colorForWeek(t.weekKey)), background: 'var(--wk-bg)', color: 'var(--wk-ink)' }}
                          title={t.title}
                        >
                          {isActivity(t) && <PinIcon width={10} height={10} strokeWidth={2.6} className="mr-0.5 inline align-[-1px]" />}
                          {t.title}
                        </li>
                      ))}
                      {extra > 0 && <li className="px-1.5 text-[11px] font-bold text-[var(--ink-soft)]">+{extra} más</li>}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="mt-3 px-1 text-xs text-[var(--ink-soft)]">
        Las tareas con fecha aparecen solas con el color de su semana. Toca un día para ver su agenda o agregarle una actividad.
      </p>

      <div className="mt-5 lg:hidden">{agenda}</div>

      <ActivityList now={now} activities={activities} renderActivity={renderActivity} onMove={onMove} />
    </div>
  );
}

/** Todas las actividades pendientes, agrupadas por día. Las que ya pasaron sin marcarse quedan arriba. */
function ActivityList({ now, activities, renderActivity, onMove }: Pick<Props, 'now' | 'activities' | 'renderActivity' | 'onMove'>) {
  const days: { key: string; tasks: Task[] }[] = [];
  for (const t of activities) {
    const key = t.dueDate ?? '';
    if (days.at(-1)?.key === key) days.at(-1)!.tasks.push(t);
    else days.push({ key, tasks: [t] });
  }
  return (
    <section aria-label="Actividades" className="mt-10">
      <h2 className="mb-1 flex items-center gap-2 px-1 font-display text-lg font-semibold tracking-tight">
        <PinIcon width={18} height={18} className="text-[var(--wk-accent)]" /> Actividades
        <span className="font-sans text-sm font-bold text-[var(--ink-faint)] tabular-nums">{activities.length}</span>
      </h2>
      <p className="mb-5 px-1 text-xs text-[var(--ink-soft)]">
        Lo que se hace un día determinado. Aparecen en Inicio solo el día que les toca.
      </p>
      {days.length === 0 ? (
        <p className="surface rounded-2xl px-4 py-3.5 text-sm text-[var(--ink-soft)]">
          No hay actividades pendientes. Para crear una, abre una tarea y elige <b>Actividad</b>, o márcala así al ponerle fecha.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {days.map(({ key, tasks }) => {
            const info = key ? dueInfo(key, now, true) : null;
            const past = key < toDayKey(now);
            // «Hoy», «Mañana», «Fue ayer»…; el nombre del día ya está en el título
            const relative = info && (past || info.tone !== 'later') ? info.label : null;
            return (
              <section key={key} aria-label={key ? longDayLabel(parseDayKey(key)) : 'Sin día'}>
                <h3 className={`mb-2 flex items-baseline gap-2 px-1 text-[15px] font-extrabold ${past ? 'text-[var(--ink-soft)]' : ''}`}>
                  {key ? longDayLabel(parseDayKey(key)) : 'Sin día'}
                  {relative && <span className="text-xs font-bold text-[var(--ink-faint)]">{relative}</span>}
                </h3>
                <SortableTaskList tasks={tasks} renderCard={renderActivity} onMove={onMove} />
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MonthNav({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'left' ? 'Mes anterior' : 'Mes siguiente'}
      className="surface grid size-9 cursor-pointer place-items-center rounded-xl transition hover:-translate-y-px"
    >
      <ChevronIcon dir={dir} width={18} height={18} />
    </button>
  );
}
