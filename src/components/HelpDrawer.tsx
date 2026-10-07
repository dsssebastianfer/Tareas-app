import type { ReactNode } from 'react';
import { PALETTE, weekVars } from '../domain/palette';
import { AgeBadge } from './AgeBadge';
import { DayRing } from './DayRing';
import { Drawer } from './Drawer';
import { BellIcon, GripIcon } from './icons';

type Props = { open: boolean; onClose: () => void };

/** Panel «Cómo funciona»: explica el método y cada parte de la app, con ejemplos visuales reales. */
export function HelpDrawer({ open, onClose }: Props) {
  return (
    <Drawer open={open} onClose={onClose} title="Cómo funciona">
      <div className="flex-1 overflow-y-auto px-6 pb-12 text-[15px] leading-relaxed">
        <p className="mb-7 text-[var(--ink-soft)]">
          Semanas está inspirada en un método simple con post-its: cada semana anotas tus tareas en un color distinto. Así, de un
          vistazo, ves qué llevas postergando.
        </p>

        <Section emoji="🎨" title="Semanas por colores">
          <p>
            Cada semana tiene su color. Toda tarea que anotes queda <b>para siempre</b> con el color de la semana en que la creaste,
            aunque pasen las semanas.
          </p>
          <div className="my-3 flex flex-col gap-2">
            <ExampleCard color={0} title="Llamar al banco" badge={<AgeBadge weeks={3} />} />
            <ExampleCard color={1} title="Revisar propuesta" badge={<AgeBadge weeks={1} />} />
            <ExampleCard color={2} title="Preparar presentación" />
          </div>
          <p>
            Si una tarea viene de semanas anteriores, muestra cuántas semanas lleva pendiente (⏳). La insignia se intensifica con el
            tiempo, para que lo postergado no se te pierda.
          </p>
        </Section>

        <Section emoji="✅" title="Tareas">
          <Bullets
            items={[
              <>Escribe arriba y presiona <Kbd>Enter</Kbd>. Con 📅 le pones fecha límite: escribe solo día y mes (<b>8/10</b>); el año es el actual.</>,
              <>Toca el <b>círculo</b> para completarla. Si fue un error, usa <b>Deshacer</b> o <Kbd>Ctrl Z</Kbd>.</>,
              <>Toca la <b>tarjeta</b> para editar el texto, la categoría o la fecha, o eliminarla.</>,
              <>Mantén presionada una tarjeta y <b>arrástrala</b> para ordenar a tu gusto.</>,
              <>La fecha se ve con colores: <span className="due-chip due-overdue rounded-full px-2 py-0.5 text-xs font-bold">Venció</span>{' '}
                <span className="wk" style={weekVars(PALETTE[4])}><span className="due-today rounded-full px-2 py-0.5 text-xs font-bold">Hoy</span></span>{' '}
                <span className="wk" style={weekVars(PALETTE[4])}><span className="due-soon rounded-full px-2 py-0.5 text-xs font-bold">Mañana</span></span>.</>,
              <>Lo completado va a <b>Mi progreso</b> (columna derecha): ahí ves tu semana, tu racha y puedes reabrir tareas.</>,
            ]}
          />
        </Section>

        <Section emoji="🏷️" title="Categorías">
          <Bullets
            items={[
              <>Mientras escribes, la app <b>detecta la categoría sola</b>: si pones «coordinar reunión», aparece <Chip>👥 Reuniones</Chip>. Si no corresponde, quítala con la ✕.</>,
              <>También puedes forzarla escribiendo <b>#nombre</b>, por ejemplo <b>#informes</b>.</>,
              <>En la sección <b>Categorías</b> creas las tuyas, eliges su emoji y agregas <b>palabras clave</b> para que se detecten.</>,
              <>Arriba de la lista, cambia entre <b>Semana</b> y <b>Categoría</b> para agrupar tus tareas. Por categoría, arrastra cada grupo desde <GripIcon width={14} height={14} className="inline align-[-2px]" /> para ordenarlos.</>,
            ]}
          />
        </Section>

        <Section emoji="📆" title="Calendario">
          <Bullets
            items={[
              <>Las tareas con fecha aparecen solas en su día, con el color de su semana.</>,
              <>
                Los días con actividades se encierran en un <b>anillo</b>: un segmento por actividad.
                <span className="ml-2 inline-flex gap-2 align-middle">
                  <RingDemo colors={[PALETTE[3].light.accent]} n={8} />
                  <RingDemo colors={[PALETTE[3].light.accent, PALETTE[4].light.accent, 'var(--ink-soft)']} n={9} />
                </span>
              </>,
              <>Toca un día para ver su <b>agenda</b> en la columna derecha. Si es hoy, también verás las tareas <b>atrasadas</b>.</>,
              <>En la agenda puedes agregar <b>recordatorios</b> <BellIcon width={14} height={14} className="inline align-[-2px]" /> con hora opcional: cumpleaños, citas, cosas que no son tareas.</>,
              <>En la sección <b>Calendario</b> ves el mes completo. El botón <b>+</b> de cada día te lleva directo a agregar un recordatorio.</>,
            ]}
          />
        </Section>

        <Section emoji="🖼️" title="Apariencia">
          <p>
            En <b>Apariencia</b> eliges el fondo (o subes tu propia imagen), el tema claro u oscuro, y cuán transparente quieres el panel
            y los elementos.
          </p>
        </Section>

        <Section emoji="⌨️" title="Atajos">
          <ul className="flex flex-col gap-1.5">
            <li><Kbd>N</Kbd> o <Kbd>/</Kbd> — escribir una tarea nueva</li>
            <li><Kbd>Ctrl Z</Kbd> — deshacer lo último</li>
            <li><Kbd>Esc</Kbd> — cerrar paneles o la tarjeta abierta</li>
          </ul>
        </Section>
      </div>
    </Drawer>
  );
}

function Section({ emoji, title, children }: { emoji: string; title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
        <span aria-hidden>{emoji}</span>
        {title}
      </h3>
      <div className="text-[var(--ink)]">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full" style={{ background: 'var(--wk-accent)' }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function ExampleCard({ color, title, badge }: { color: number; title: string; badge?: ReactNode }) {
  return (
    <div className="wk" style={weekVars(PALETTE[color])}>
      <div className="task-card flex items-center gap-3 rounded-xl px-3 py-2">
        <span className="size-5 shrink-0 rounded-full border-2" style={{ borderColor: 'var(--wk-accent)' }} />
        <span className="flex-1 text-sm font-semibold">{title}</span>
        {badge}
        <span className="text-[11px] font-bold opacity-60">Semana {PALETTE[color].name}</span>
      </div>
    </div>
  );
}

function RingDemo({ colors, n }: { colors: string[]; n: number }) {
  return (
    <span className="relative grid size-7 place-items-center text-xs font-bold">
      {n}
      <DayRing colors={colors} className="inset-0" />
    </span>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="cat-chip rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap">{children}</span>;
}

function Kbd({ children }: { children: ReactNode }) {
  return <span className="kbd whitespace-nowrap">{children}</span>;
}

