import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { detectCategory, stripTags, type Category } from '../domain/category';
import { CategoryChip } from './CategoryChip';
import { CategoryPicker } from './CategoryPicker';
import { DueChip } from './DueChip';
import { DuePicker } from './DuePicker';
import { CalendarIcon, PlusIcon, TagIcon } from './icons';
import { useIsPhone } from '../hooks/useMediaQuery';

type Props = {
  now: Date;
  categories: Category[];
  onAdd: (title: string, due: string | null, categoryId: string | null) => void;
  onManageCategories: () => void;
};

const ghostBtn =
  'flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-bold text-[var(--ink-soft)] transition hover:bg-[color-mix(in_oklab,var(--ink)_6%,transparent)] hover:text-[var(--ink)]';
const ghostOpen = 'bg-[color-mix(in_oklab,var(--ink)_6%,transparent)] text-[var(--ink)]';

export const QuickAdd = forwardRef<HTMLInputElement, Props>(function QuickAdd(
  { now, categories, onAdd, onManageCategories },
  ref,
) {
  const [value, setValue] = useState('');
  const [due, setDue] = useState<string | null>(null);
  /** undefined = automática (detectada del texto); string/null = elegida a mano. */
  const [manualCat, setManualCat] = useState<string | null | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!);

  const detected = useMemo(() => detectCategory(value, categories), [value, categories]);
  const categoryId = manualCat !== undefined ? manualCat : (detected?.id ?? null);
  const category = categories.find((c) => c.id === categoryId) ?? null;

  const refocus = () => inputRef.current?.focus();
  // En celular las opciones van a la izquierda: sus menús deben abrirse hacia la derecha.
  const isPhone = useIsPhone();
  const menuAlign = isPhone ? 'left' : 'right';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const title = stripTags(value, categories) || value.trim();
        if (!title) return refocus();
        onAdd(title, due, category?.id ?? null);
        setValue('');
        setDue(null);
        setManualCat(undefined);
        refocus();
      }}
      className="surface group relative z-20 flex items-center gap-1.5 rounded-2xl py-2 pr-2 pl-2 transition-shadow focus-within:shadow-[var(--shadow-lift)] sm:gap-2 sm:pr-3 sm:pl-3"
    >
      {/* En celular: a la derecha, cerca del pulgar. En computador: a la izquierda. */}
      <button
        type="submit"
        aria-label="Agregar tarea"
        title="Agregar tarea"
        // No quitar el foco del campo (en el celular, así no se cierra el teclado)
        onMouseDown={(e) => e.preventDefault()}
        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl text-white transition-transform group-focus-within:rotate-90 hover:brightness-110 active:scale-90 max-sm:order-last sm:mr-1"
        style={{ background: 'var(--wk-accent)' }}
      >
        <PlusIcon />
      </button>
      <input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (!e.target.value.trim()) setManualCat(undefined);
        }}
        onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
        placeholder="¿Qué tienes pendiente?"
        aria-label="Nueva tarea"
        maxLength={200}
        className="min-w-0 flex-1 bg-transparent py-2 text-[17px] font-semibold outline-none placeholder:font-medium placeholder:text-[var(--ink-faint)]"
      />

      <div className="flex items-center gap-1.5 max-sm:order-first sm:gap-2">
        <CategoryPicker
          categories={categories}
          align={menuAlign}
          value={category?.id ?? null}
          onChange={(id) => {
            setManualCat(id);
            refocus();
          }}
          onManage={onManageCategories}
          trigger={(toggle, open) =>
            category ? (
              <CategoryChip
                key={category.id}
                category={category}
                size="md"
                compactOnPhone
                onClick={toggle}
                onRemove={() => {
                  setManualCat(null);
                  refocus();
                }}
              />
            ) : (
              <button
                type="button"
                onClick={toggle}
                aria-label="Elegir categoría"
                title="Elegir categoría (o escribe #categoría)"
                className={`${ghostBtn} ${open ? ghostOpen : ''}`}
              >
                <TagIcon width={17} height={17} />
              </button>
            )
          }
        />

        <DuePicker
          value={due}
          now={now}
          align={menuAlign}
          onChange={(v) => {
            setDue(v);
            refocus();
          }}
          trigger={(toggle, open) =>
            due ? (
              <DueChip dueKey={due} now={now} onClick={toggle} className="py-1.5 text-[13px]" />
            ) : (
              <button
                type="button"
                onClick={toggle}
                aria-label="Agregar fecha límite"
                title="Agregar fecha límite"
                className={`${ghostBtn} ${open ? ghostOpen : ''}`}
              >
                <CalendarIcon width={17} height={17} />
                <span className="hidden sm:inline">Fecha</span>
              </button>
            )
          }
        />
      </div>
      <span className="kbd ml-1 hidden sm:inline">Enter ↵</span>
    </form>
  );
});
