import type { ComponentType, SVGProps } from 'react';
import { motion } from 'motion/react';
import { CalendarIcon, HomeIcon, InfoIcon, LogoutIcon, PaletteIcon, SoundIcon, TagIcon } from './icons';

export type View = 'home' | 'calendar' | 'categories' | 'appearance';

const NAV: { view: View; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { view: 'home', label: 'Inicio', Icon: HomeIcon },
  { view: 'calendar', label: 'Calendario', Icon: CalendarIcon },
  { view: 'categories', label: 'Categorías', Icon: TagIcon },
  { view: 'appearance', label: 'Apariencia', Icon: PaletteIcon },
];

type Props = {
  view: View;
  onNavigate: (view: View) => void;
  name: string;
  sound: boolean;
  onToggleSound: () => void;
  /** Con cuenta: correo y cerrar sesión. */
  account?: { email: string; onSignOut: () => void };
  onOpenHelp: () => void;
};

/**
 * Menú. Escritorio ancho: columna con textos. Escritorio angosto: solo íconos.
 * Pantallas chicas: barra superior horizontal.
 */
export function Sidebar({ view, onNavigate, name, sound, onToggleSound, account, onOpenHelp }: Props) {
  const label = name || account?.email.split('@')[0] || 'Tú';
  return (
    <aside className="sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--line)] bg-[rgb(var(--glass-rgb)/0.75)] px-3 py-2 backdrop-blur-md lg:h-full lg:flex-col lg:bg-transparent lg:backdrop-blur-none lg:items-stretch lg:gap-1 lg:border-r lg:border-b-0 lg:px-3 lg:py-6 xl:px-4">
      <div className="flex items-center gap-3 lg:mb-8 lg:justify-center lg:px-1 xl:justify-start xl:px-2">
        <img src="/icons/logo.png" alt="" className="size-10 lg:size-11" />
        <div className="hidden leading-tight xl:block">
          <p className="font-display text-lg font-semibold">Semanas</p>
          <p className="text-xs text-[var(--ink-soft)]">Tu semana de colores</p>
        </div>
      </div>

      <nav className="ml-auto flex gap-1 lg:ml-0 lg:flex-col" aria-label="Secciones">
        {NAV.map(({ view: v, label, Icon }) => {
          const active = v === view;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onNavigate(v)}
              aria-current={active ? 'page' : undefined}
              title={label}
              className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold transition-colors lg:justify-center xl:justify-start ${
                active ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'color-mix(in oklab, var(--wk-accent) 16%, var(--surface-strong))' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <Icon width={20} height={20} className="relative" style={active ? { color: 'var(--wk-accent)' } : undefined} />
              <span className="relative hidden sm:inline lg:hidden xl:inline">{label}</span>
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onOpenHelp}
        title="Cómo funciona"
        aria-label="Cómo funciona"
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] lg:mt-auto lg:justify-center xl:justify-start"
      >
        <InfoIcon width={20} height={20} />
        <span className="hidden xl:inline">Cómo funciona</span>
      </button>

      <div className="hidden items-center gap-2 lg:mt-2 lg:flex lg:flex-col xl:flex-row xl:rounded-2xl xl:border xl:border-[var(--line)] xl:bg-[var(--surface)] xl:p-2">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full font-display text-base font-bold text-white"
          style={{ background: 'var(--wk-accent)' }}
          aria-hidden
        >
          {label.charAt(0).toUpperCase()}
        </span>
        <span className="hidden min-w-0 flex-1 leading-tight xl:block" title={account?.email}>
          <span className="block truncate text-sm font-bold">{label}</span>
          {account && <span className="block truncate text-[11px] text-[var(--ink-soft)]">{account.email}</span>}
        </span>
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={sound ? 'Silenciar sonidos' : 'Activar sonidos'}
          title={sound ? 'Silenciar sonidos' : 'Activar sonidos'}
          className="grid size-9 cursor-pointer place-items-center rounded-xl text-[var(--ink-soft)] transition hover:bg-[var(--surface)] hover:text-[var(--ink)]"
        >
          <SoundIcon on={sound} />
        </button>
        {account && (
          <button
            type="button"
            onClick={account.onSignOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="grid size-9 cursor-pointer place-items-center rounded-xl text-[var(--ink-soft)] transition hover:bg-[var(--surface)] hover:text-[var(--ink)]"
          >
            <LogoutIcon width={18} height={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
