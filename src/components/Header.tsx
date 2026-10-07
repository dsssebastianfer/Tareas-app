import { useState } from 'react';
import type { WeekColor } from '../domain/palette';
import { weekRange } from '../domain/week';

type Props = {
  now: Date;
  name: string;
  onRename: (name: string) => void;
  weekKey: string;
  color: WeekColor;
};

function greeting(h: number) {
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function Header(p: Props) {
  const [editing, setEditing] = useState(false);
  const date = p.now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-bold tracking-wide text-[var(--ink-soft)] first-letter:uppercase">{date}</p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,2.6rem)] leading-[1.1] font-semibold tracking-tight">
          {greeting(p.now.getHours())},{' '}
          {editing ? (
            <input
              autoFocus
              defaultValue={p.name}
              size={Math.max(p.name.length, 8)}
              placeholder="tu nombre"
              onBlur={(e) => {
                p.onRename(e.target.value.trim() || p.name);
                setEditing(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="bg-transparent italic outline-none"
              style={{ color: 'var(--wk-accent)' }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              title="Cambiar nombre"
              className={`cursor-text italic ${p.name ? '' : 'opacity-50'}`}
              style={{ color: 'var(--wk-accent)' }}
            >
              {p.name || 'tu nombre'}
            </button>
          )}
        </h1>
        <div className="mt-3 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold"
            style={{ background: 'var(--wk-bg)', borderColor: 'var(--wk-border)', color: 'var(--wk-ink)' }}
          >
            <span className="size-2.5 rounded-full" style={{ background: 'var(--wk-accent)' }} />
            Semana {p.color.name} · {weekRange(p.weekKey)}
          </span>
        </div>
      </div>

    </header>
  );
}
