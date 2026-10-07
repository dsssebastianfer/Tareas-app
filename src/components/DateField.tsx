import { useEffect, useRef, useState } from 'react';
import { parseDayKey, toDayKey } from '../domain/week';
import { CalendarIcon } from './icons';

type Props = {
  value: string | null;
  onChange: (value: string) => void;
  now: Date;
  /** Aspecto cuando hay una fecha elegida aquí (por ejemplo, resaltada). */
  selected?: boolean;
  className?: string;
};

/**
 * Interpreta «8/10», «08-10», «8.10», «8/10/27» o solo «15».
 * Sin año usa el año actual; sin mes, el mes actual.
 */
export function parseShortDate(text: string, now: Date): string | null {
  const m = text.trim().match(/^(\d{1,2})(?:[/\-. ](\d{1,2})(?:[/\-. ](\d{2}|\d{4}))?)?$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = m[2] ? Number(m[2]) - 1 : now.getMonth();
  let year = m[3] ? Number(m[3]) : now.getFullYear();
  if (year < 100) year += 2000;
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return toDayKey(d);
}

function format(key: string, now: Date): string {
  const d = parseDayKey(key);
  const dm = `${d.getDate()}/${d.getMonth() + 1}`;
  return d.getFullYear() === now.getFullYear() ? dm : `${dm}/${String(d.getFullYear()).slice(2)}`;
}

/** Campo de fecha donde el año es opcional (por defecto, el actual), más un botón al calendario del navegador. */
export function DateField({ value, onChange, now, selected, className = '' }: Props) {
  const [text, setText] = useState(value ? format(value, now) : '');
  const [invalid, setInvalid] = useState(false);
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value ? format(value, now) : '');
  }, [value]);

  const commit = () => {
    if (!text.trim()) return setInvalid(false);
    const key = parseShortDate(text, now);
    if (!key) return setInvalid(true);
    setInvalid(false);
    if (key !== value) onChange(key);
    else setText(format(key, now));
  };

  return (
    <span
      className={`relative inline-flex items-center rounded-full pr-1 pl-2.5 text-xs font-bold ${selected ? 'opt-selected' : 'opt'} ${
        invalid ? 'ring-2 ring-[#e5484d]' : ''
      } ${className}`}
    >
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setInvalid(false);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            commit();
          }
        }}
        placeholder="dd/mm"
        aria-label="Otra fecha (día/mes; el año es opcional)"
        title="Escribe día/mes, por ejemplo 8/10. El año es opcional."
        inputMode="numeric"
        maxLength={10}
        className="w-[3.6rem] bg-transparent py-1 outline-none placeholder:font-semibold placeholder:text-current placeholder:opacity-55"
      />
      <button
        type="button"
        onClick={() => pickerRef.current?.showPicker?.()}
        aria-label="Abrir calendario"
        title="Abrir calendario"
        className="grid size-6 cursor-pointer place-items-center rounded-full opacity-70 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/15"
      >
        <CalendarIcon width={13} height={13} strokeWidth={2.4} />
      </button>
      {/* Calendario nativo, invisible: solo se usa su selector */}
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden
        value={value ?? ''}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="pointer-events-none absolute size-0 opacity-0"
      />
    </span>
  );
}
