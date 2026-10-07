import type { ReactNode } from 'react';
import { quickDueOptions } from '../domain/due';
import { Popover } from './Popover';
import { DateField } from './DateField';

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  now: Date;
  trigger: (toggle: () => void, open: boolean) => ReactNode;
  onOpenChange?: (open: boolean) => void;
  align?: 'left' | 'right';
};

export function DuePicker({ value, onChange, now, trigger, onOpenChange, align }: Props) {
  const options = quickDueOptions(now);
  return (
    <Popover trigger={trigger} onOpenChange={onOpenChange} align={align}>
      {(close) => {
        const pick = (v: string | null) => {
          onChange(v);
          close();
        };
        return (
          <>
            <p className="mb-2 px-1 text-xs font-extrabold tracking-wider text-[var(--ink-faint)] uppercase">Fecha límite</p>
            <div className="grid grid-cols-3 gap-1.5">
              {options.map((o) => {
                const selected = o.key === value;
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => pick(o.key)}
                    className={`cursor-pointer rounded-xl px-2 py-2 text-sm font-bold transition ${
                      selected ? 'text-white' : 'hover:bg-[color-mix(in_oklab,var(--wk-accent)_16%,transparent)]'
                    }`}
                    style={selected ? { background: 'var(--wk-accent)' } : { background: 'color-mix(in oklab, var(--ink) 4%, transparent)' }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            <label className="mt-3 flex items-center justify-between gap-2 px-1 text-sm font-semibold text-[var(--ink-soft)]">
              Otra fecha
              <DateField
                value={value}
                now={now}
                onChange={pick}
                selected={!!value && !options.some((o) => o.key === value)}
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => pick(null)}
                className="mt-2 w-full cursor-pointer rounded-xl px-2 py-1.5 text-sm font-bold text-[var(--ink-soft)] transition hover:bg-black/5 hover:text-[var(--ink)] dark:hover:bg-white/10"
              >
                Quitar fecha
              </button>
            )}
          </>
        );
      }}
    </Popover>
  );
}
