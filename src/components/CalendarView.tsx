import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { Task } from '../domain/task';
import type { Reminder } from '../domain/reminder';
import { monthOf, monthTitle, monthWeeks, shiftMonth, WEEKDAYS_LONG, type MonthRef } from '../domain/calendar';
import { colorForWeek, weekVars } from '../domain/palette';
import { getWeekKey, parseDayKey, toDayKey } from '../domain/week';
import { BellIcon, ChevronIcon, PlusIcon } from './icons';
import { DayRing, ringColors } from './DayRing';

export type DayItems = { tasks: Task[]; reminders: Reminder[] };

type Props = {
  now: Date;
  selected: string;
  onSelect: (dayKey: string) => void;
  /** Elegir el día y llevar el foco a «Agregar recordatorio». */
  onAddOnDay: (dayKey: string) => void;
  items: Map<string, DayItems>;
};

const MAX_ITEMS = 3;

export function CalendarView({ now, selected, onSelect, onAddOnDay, items }: Props) {
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
                // Pendientes arriba; lo completado/hecho después, tachado
                const tasks = day?.tasks ?? [];
                const rems = day?.reminders ?? [];
                const all = [
                  ...tasks.filter((t) => !t.completedAt).map((t) => ({ kind: 'task' as const, t })),
                  ...rems.filter((r) => !r.done).map((r) => ({ kind: 'reminder' as const, r })),
                  ...tasks.filter((t) => t.completedAt).map((t) => ({ kind: 'task' as const, t })),
                  ...rems.filter((r) => r.done).map((r) => ({ kind: 'reminder' as const, r })),
                ];
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
                            colors={ringColors(
                              day.tasks.filter((t) => !t.completedAt).map((t) => colorForWeek(t.weekKey).light.accent),
                              day.reminders.filter((r) => !r.done).length,
                            )}
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
                        aria-label="Agregar recordatorio este día"
                        title="Agregar recordatorio"
                        className="grid size-6 cursor-pointer place-items-center rounded-lg text-[var(--ink-soft)] opacity-0 transition group-hover:opacity-100 hover:bg-[color-mix(in_oklab,var(--ink)_8%,transparent)] focus-visible:opacity-100"
                      >
                        <PlusIcon width={14} height={14} />
                      </button>
                    </div>

                    <ul className="hidden flex-col gap-0.5 sm:flex">
                      {all.slice(0, MAX_ITEMS).map((it) =>
                        it.kind === 'task' ? (
                          <li
                            key={it.t.id}
                            className={`wk truncate rounded-md px-1.5 py-0.5 text-[11.5px] leading-snug font-bold ${it.t.completedAt ? 'line-through opacity-50' : ''}`}
                            style={{ ...weekVars(colorForWeek(it.t.weekKey)), background: 'var(--wk-bg)', color: 'var(--wk-ink)' }}
                            title={it.t.title}
                          >
                            {it.t.title}
                          </li>
                        ) : (
                          <li
                            key={it.r.id}
                            className={`flex items-center gap-1 truncate rounded-md px-1 py-0.5 text-[11.5px] leading-snug font-semibold ${
                              it.r.done ? 'text-[var(--ink-faint)] line-through' : 'text-[var(--ink-soft)]'
                            }`}
                            title={it.r.title}
                          >
                            <BellIcon width={10} height={10} strokeWidth={2.6} className="shrink-0" />
                            {it.r.time && <span className="tabular-nums">{it.r.time}</span>}
                            <span className="truncate">{it.r.title}</span>
                          </li>
                        ),
                      )}
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
        Las tareas con fecha aparecen solas con el color de su semana. Toca un día para ver su agenda o agregar recordatorios.
      </p>
    </div>
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
