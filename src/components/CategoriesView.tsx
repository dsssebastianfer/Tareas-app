import { useRef, useState } from 'react';
import { AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { EMOJIS, normalize, type Category } from '../domain/category';
import { Popover } from './Popover';
import { CloseIcon, GripIcon, PlusIcon, TrashIcon } from './icons';

type Props = {
  categories: Category[];
  counts: Map<string, number>;
  onCreate: (name: string, emoji: string) => void;
  onUpdate: (id: string, patch: Partial<Category>) => void;
  onDelete: (category: Category) => void;
};

export function CategoriesView({ categories, counts, onCreate, onUpdate, onDelete }: Props) {
  const nextEmoji = EMOJIS.find((e) => !categories.some((c) => c.emoji === e)) ?? '📌';
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string | null>(null);
  const exists = categories.some((c) => normalize(c.name) === normalize(name));

  // Orden en vivo mientras se arrastra; al soltar se guarda.
  const [liveIds, setLiveIds] = useState<string[] | null>(null);
  const liveRef = useRef<string[] | null>(null);
  const setLive = (v: string[] | null) => {
    liveRef.current = v;
    setLiveIds(v);
  };
  const byId = new Map(categories.map((c) => [c.id, c]));
  const ids = liveIds?.filter((id) => byId.has(id)) ?? categories.map((c) => c.id);
  const commitOrder = () => {
    const live = liveRef.current;
    setLive(null);
    live?.forEach((id, i) => {
      if (byId.get(id)?.order !== i) onUpdate(id, { order: i });
    });
  };

  const create = () => {
    const n = name.trim();
    if (!n || exists) return;
    onCreate(n, emoji ?? nextEmoji);
    setName('');
    setEmoji(null);
  };

  return (
    <div>
      <header className="mb-6">
        <p className="mb-1 text-sm font-bold tracking-wide text-[var(--ink-soft)]">Organiza tus temas</p>
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] leading-tight font-semibold tracking-tight">Categorías</h1>
      </header>
      <div className="pb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
          className="surface flex items-center gap-2 rounded-2xl p-2"
        >
          <EmojiPicker value={emoji ?? nextEmoji} onChange={setEmoji} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nueva categoría"
            aria-label="Nombre de la nueva categoría"
            maxLength={40}
            className="min-w-0 flex-1 bg-transparent py-1.5 text-[15px] font-semibold outline-none placeholder:font-medium placeholder:text-[var(--ink-faint)]"
          />
          <button
            type="submit"
            disabled={!name.trim() || exists}
            className="flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-default disabled:opacity-40"
            style={{ background: 'var(--wk-accent)' }}
          >
            <PlusIcon width={15} height={15} /> Crear
          </button>
        </form>
        <p className="mt-2 px-1 text-xs text-[var(--ink-soft)]">
          {exists
            ? 'Ya existe una categoría con ese nombre.'
            : 'Una tarea se clasifica sola si contiene el nombre o una palabra clave de la categoría. También puedes escribir #categoría.'}
        </p>
      </div>

      <div className="pb-10">
        {categories.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--ink-soft)]">Aún no tienes categorías. Crea la primera arriba.</p>
        )}
        <Reorder.Group as="ul" axis="y" values={ids} onReorder={setLive} className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {ids.map((id) => (
              <CategoryItem
                key={id}
                category={byId.get(id)!}
                count={counts.get(id) ?? 0}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onDragStart={() => setLive(categories.map((c) => c.id))}
                onDragEnd={commitOrder}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
}

function CategoryItem({
  category,
  onDragStart,
  onDragEnd,
  ...rest
}: {
  category: Category;
  count: number;
  onUpdate: Props['onUpdate'];
  onDelete: Props['onDelete'];
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={category.id}
      dragListener={false}
      dragControls={controls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      whileDrag={{ scale: 1.02, boxShadow: '0 16px 32px -12px rgb(40 25 10 / 0.3)' }}
      className="surface relative rounded-2xl p-3 pl-1.5"
    >
      <div className="flex">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
          }}
          aria-label={`Arrastrar para ordenar ${category.name}`}
          title="Arrastrar para ordenar"
          className="mr-1 grid w-7 shrink-0 cursor-grab touch-none place-items-center self-start rounded-lg py-2 text-[var(--ink-soft)] transition hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)] hover:text-[var(--ink)] active:cursor-grabbing"
        >
          <GripIcon width={20} height={20} />
        </button>
        <div className="min-w-0 flex-1">
          <CategoryRow category={category} {...rest} />
        </div>
      </div>
    </Reorder.Item>
  );
}

function CategoryRow({
  category: c,
  count,
  onUpdate,
  onDelete,
}: {
  category: Category;
  count: number;
  onUpdate: Props['onUpdate'];
  onDelete: Props['onDelete'];
}) {
  const [name, setName] = useState(c.name);
  const [keyword, setKeyword] = useState('');

  const saveName = () => {
    const n = name.trim();
    if (n && n !== c.name) onUpdate(c.id, { name: n });
    else setName(c.name);
  };

  const addKeywords = (raw: string) => {
    const fresh = raw
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k && !c.keywords.some((x) => normalize(x) === normalize(k)));
    if (fresh.length) onUpdate(c.id, { keywords: [...c.keywords, ...fresh] });
    setKeyword('');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <EmojiPicker value={c.emoji} onChange={(emoji) => onUpdate(c.id, { emoji })} />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          aria-label="Nombre de la categoría"
          maxLength={40}
          className="min-w-0 flex-1 rounded-lg bg-transparent px-1 py-1 text-[15px] font-bold outline-none focus:bg-[color-mix(in_oklab,var(--ink)_5%,transparent)]"
        />
        <span className="text-xs font-bold whitespace-nowrap text-[var(--ink-faint)]">
          {count === 1 ? '1 pendiente' : `${count} pendientes`}
        </span>
        <button
          type="button"
          onClick={() => onDelete(c)}
          aria-label={`Eliminar categoría ${c.name}`}
          title="Eliminar categoría"
          className="grid size-8 cursor-pointer place-items-center rounded-lg text-[var(--ink-soft)] transition hover:bg-black/5 hover:text-[var(--ink)] dark:hover:bg-white/10"
        >
          <TrashIcon width={16} height={16} />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-11">
        {c.keywords.map((k) => (
          <span key={k} className="cat-chip inline-flex items-center gap-0.5 rounded-full py-0.5 pr-1 pl-2.5 text-xs font-bold">
            {k}
            <button
              type="button"
              onClick={() => onUpdate(c.id, { keywords: c.keywords.filter((x) => x !== k) })}
              aria-label={`Quitar palabra clave ${k}`}
              className="grid size-4.5 cursor-pointer place-items-center rounded-full opacity-50 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/15"
            >
              <CloseIcon width={11} height={11} strokeWidth={2.6} />
            </button>
          </span>
        ))}
        <input
          value={keyword}
          onChange={(e) => {
            if (e.target.value.endsWith(',')) addKeywords(e.target.value);
            else setKeyword(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addKeywords(keyword);
            }
          }}
          onBlur={() => keyword.trim() && addKeywords(keyword)}
          placeholder="+ palabra clave"
          aria-label={`Agregar palabra clave a ${c.name}`}
          className="w-32 min-w-0 rounded-full bg-transparent px-2 py-0.5 text-xs font-semibold outline-none placeholder:text-[var(--ink-faint)] focus:bg-[color-mix(in_oklab,var(--ink)_5%,transparent)]"
        />
      </div>
    </>
  );
}

function EmojiPicker({ value, onChange }: { value: string; onChange: (emoji: string) => void }) {
  return (
    <Popover
      align="left"
      className="w-60"
      trigger={(toggle) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Cambiar ícono"
          title="Cambiar ícono"
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl text-lg transition hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)]"
          style={{ background: 'color-mix(in oklab, var(--ink) 4%, transparent)' }}
        >
          {value}
        </button>
      )}
    >
      {(close) => (
        <div className="grid grid-cols-6 gap-1">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onChange(e);
                close();
              }}
              className={`grid size-8 cursor-pointer place-items-center rounded-lg text-lg transition hover:bg-[color-mix(in_oklab,var(--ink)_8%,transparent)] ${
                e === value ? 'bg-[color-mix(in_oklab,var(--wk-accent)_25%,transparent)]' : ''
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
