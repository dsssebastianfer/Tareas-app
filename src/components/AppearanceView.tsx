import { useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { BACKGROUNDS } from '../domain/backgrounds';
import type { ThemePref } from '../hooks/useSettings';
import { CheckIcon, CloseIcon, UploadIcon } from './icons';

type Props = {
  background: string;
  customUrl: string | null;
  onSelectBackground: (id: string) => void;
  onUpload: (file: File) => Promise<void>;
  onRemoveCustom: () => void;
  theme: ThemePref;
  onTheme: (theme: ThemePref) => void;
  glass: number;
  onGlass: (value: number) => void;
  cardGlass: number;
  onCardGlass: (value: number) => void;
};

const THEMES: { value: ThemePref; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'auto', label: 'Automático' },
];

export function AppearanceView(p: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      await p.onUpload(file);
    } catch {
      setError('No se pudo usar esa imagen. Prueba con un JPG o PNG.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <header className="mb-8">
        <p className="mb-1 text-sm font-bold tracking-wide text-[var(--ink-soft)]">Hazla tuya</p>
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] leading-tight font-semibold tracking-tight">Apariencia</h1>
      </header>

      <Section title="Fondo" hint="La app flota sobre la imagen que elijas.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BACKGROUNDS.map((b) => (
            <Tile key={b.id} label={b.name} css={b.thumb} selected={p.background === b.id} onClick={() => p.onSelectBackground(b.id)} />
          ))}
          {p.customUrl && (
            <Tile
              label="Tu imagen"
              css={`url(${p.customUrl}) center / cover`}
              selected={p.background === 'custom'}
              onClick={() => p.onSelectBackground('custom')}
              onRemove={p.onRemoveCustom}
            />
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="grid aspect-[3/2] cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-[var(--ink-faint)] text-[var(--ink-soft)] transition hover:border-[var(--wk-accent)] hover:text-[var(--ink)] disabled:cursor-wait disabled:opacity-60"
          >
            <span className="flex flex-col items-center gap-1.5 text-sm font-bold">
              <UploadIcon width={22} height={22} />
              {busy ? 'Procesando…' : p.customUrl ? 'Cambiar mi imagen' : 'Subir mi imagen'}
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
        </div>
        {error && <p className="mt-2 text-sm font-semibold text-[#b4232b] dark:text-[#ffadb0]">{error}</p>}
      </Section>

      <Section title="Tema" hint="Elige el que se lea mejor sobre tu fondo. Al cambiar de fondo te sugerimos uno.">
        <div role="radiogroup" aria-label="Tema" className="surface inline-flex rounded-xl p-0.5 text-sm font-bold">
          {THEMES.map((t) => {
            const active = t.value === p.theme;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => p.onTheme(t.value)}
                className={`relative cursor-pointer rounded-[10px] px-4 py-1.5 transition-colors ${
                  active ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="theme-pill"
                    className="absolute inset-0 rounded-[10px] shadow-sm"
                    style={{ background: 'var(--surface-strong)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Transparencia" hint="Con fondos muy cargados, más sólido ayuda a leer.">
        <div className="flex max-w-lg flex-col gap-4">
          <Slider
            label="Panel general"
            min={0}
            max={0.92}
            value={p.glass}
            onChange={p.onGlass}
            from="Transparente"
            to="Sólido"
          />
          <Slider
            label="Elementos flotantes"
            detail="Calendario, tareas, progreso y agenda"
            min={0.3}
            max={1}
            value={p.cardGlass}
            onChange={p.onCardGlass}
            from="Más vidrio"
            to="Sólido"
          />
        </div>
      </Section>
    </div>
  );
}

function Slider(p: {
  label: string;
  detail?: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  from: string;
  to: string;
}) {
  return (
    <div className="surface rounded-2xl px-4 py-3">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold">{p.label}</span>
        {p.detail && <span className="truncate text-xs text-[var(--ink-soft)]">{p.detail}</span>}
      </div>
      <div className="flex items-center gap-3 text-xs font-bold text-[var(--ink-soft)]">
        <span className="w-20">{p.from}</span>
        <input
          type="range"
          min={p.min}
          max={p.max}
          step={0.01}
          value={p.value}
          onChange={(e) => p.onChange(Number(e.target.value))}
          aria-label={p.label}
          className="flex-1"
          style={{ accentColor: 'var(--wk-accent)' }}
        />
        <span className="w-12 text-right">{p.to}</span>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mb-3 text-sm text-[var(--ink-soft)]">{hint}</p>
      {children}
    </section>
  );
}

function Tile({
  label,
  css,
  selected,
  onClick,
  onRemove,
}: {
  label: string;
  css: string;
  selected: boolean;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className="group relative block aspect-[3/2] w-full cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:-translate-y-0.5"
        style={{ background: css, boxShadow: selected ? '0 0 0 3px var(--wk-accent), var(--shadow-lift)' : undefined }}
      >
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pt-6 pb-2 text-left text-sm font-bold text-white">
          {label}
        </span>
        {selected && (
          <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full text-white" style={{ background: 'var(--wk-accent)' }}>
            <CheckIcon width={14} height={14} />
          </span>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Quitar mi imagen"
          title="Quitar mi imagen"
          className="absolute top-2 left-2 grid size-6 cursor-pointer place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/70"
        >
          <CloseIcon width={13} height={13} strokeWidth={2.6} />
        </button>
      )}
    </div>
  );
}
