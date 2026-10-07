import { Fragment, useEffect, useState } from 'react';
import { monthOf, monthTitle, monthWeeks, shiftMonth, WEEKDAYS, type MonthRef } from '../domain/calendar';
import { colorForWeek, weekVars } from '../domain/palette';
import { getWeekKey, parseDayKey, toDayKey } from '../domain/week';
import { ChevronIcon } from './icons';
import { DayRing, ringColors } from './DayRing';

/** Marcas de un día: colores de las tareas (por su semana) y si hay recordatorios. */
export type DayMarks = { taskColors: string[]; reminders: number };

type Props = {
  now: Date;
  selected: string;
  onSelect: (dayKey: string) => void;
  marks: Map<string, DayMarks>;
};

export function MiniCalendar({ now, selected, onSelect, marks }: Props) {
  const [month, setMonth] = useState<MonthRef>(() => monthOf(parseDayKey(selected)));
  const todayKey = toDayKey(now);

  // Si el día elegido cambia a otro mes (por ejemplo, desde el calendario grande), seguirlo.
  useEffect(() => {
    const d = parseDayKey(selected);
    setMonth((m) => (m.year === d.getFullYear() && m.month === d.getMonth() ? m : monthOf(d)));
  }, [selected]);

  return (
    <section className="surface rounded-3xl p-4" aria-label="Calendario del mes">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="font-display text-base font-semibold">{monthTitle(month)}</h2>
        <div className="flex">
          <NavButton dir="left" onClick={() => setMonth((m) => shiftMonth(m, -1))} />
          <NavButton dir="right" onClick={() => setMonth((m) => shiftMonth(m, 1))} />
        </div>
      </div>

      <div className="grid grid-cols-[6px_repeat(7,1fr)] gap-y-0.5 text-center">
        <span />
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 text-[11px] font-bold text-[var(--ink-faint)]">
            {d}
          </span>
        ))}
        {monthWeeks(month).map((week) => (
          <Fragment key={toDayKey(week[0])}>
            {/* Franja con el color de esa semana */}
            <span className="wk my-1 rounded-full" style={{ ...weekVars(colorForWeek(getWeekKey(week[0]))), background: 'var(--wk-accent)', opacity: 0.55 }} />
            {week.map((d) => {
              const key = toDayKey(d);
              const inMonth = d.getMonth() === month.month;
              const isToday = key === todayKey;
              const isSelected = key === selected;
              const m = marks.get(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  aria-label={d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                  aria-pressed={isSelected}
                  className={`relative mx-auto grid size-9 cursor-pointer place-items-center rounded-full text-[13px] font-bold tabular-nums transition ${
                    isSelected
                      ? 'text-white'
                      : isToday
                        ? 'font-extrabold text-[var(--wk-accent)]'
                        : inMonth
                          ? 'hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)]'
                          : 'text-[var(--ink-faint)] opacity-60 hover:opacity-100'
                  }`}
                  style={
                    isSelected
                      ? { background: 'var(--wk-accent)' }
                      : isToday
                        ? { background: 'color-mix(in oklab, var(--wk-accent) 18%, transparent)' }
                        : undefined
                  }
                >
                  {d.getDate()}
                  {m && <DayRing colors={ringColors(m.taskColors, m.reminders)} className={isSelected ? '-inset-[4px]' : 'inset-0'} />}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function NavButton({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'left' ? 'Mes anterior' : 'Mes siguiente'}
      className="grid size-8 cursor-pointer place-items-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)] hover:text-[var(--ink)]"
    >
      <ChevronIcon dir={dir} width={16} height={16} />
    </button>
  );
}
