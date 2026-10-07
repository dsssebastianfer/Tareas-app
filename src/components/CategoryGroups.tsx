import { useRef, useState, type ReactNode } from 'react';
import { Reorder, motion, useDragControls } from 'motion/react';
import type { Task } from '../domain/task';
import { GripIcon } from './icons';

export type Group = { key: string; title: string; emoji: string; tasks: Task[] };

type Props = {
  /** Grupos de categorías, más «Sin categoría» (key 'none') que siempre va al final. */
  groups: Group[];
  editingId: string | null;
  renderTasks: (group: Group) => ReactNode;
  /** Se llama al soltar, con el nuevo orden de las categorías visibles. */
  onReorder: (categoryIds: string[]) => void;
};

/** Vista por categoría: cada grupo se arrastra desde su título para reordenar las categorías. */
export function CategoryGroups({ groups, editingId, renderTasks, onReorder }: Props) {
  const sortable = groups.filter((g) => g.key !== 'none');
  const loose = groups.find((g) => g.key === 'none');

  const [liveIds, setLiveIds] = useState<string[] | null>(null);
  const liveRef = useRef<string[] | null>(null);
  const setLive = (v: string[] | null) => {
    liveRef.current = v;
    setLiveIds(v);
  };

  const byKey = new Map(sortable.map((g) => [g.key, g]));
  const ids = liveIds?.filter((k) => byKey.has(k)) ?? sortable.map((g) => g.key);
  for (const g of sortable) if (!ids.includes(g.key)) ids.push(g.key);

  const isEditing = (g: Group) => g.tasks.some((t) => t.id === editingId);

  return (
    <div className="flex flex-col gap-7">
      <Reorder.Group as="div" axis="y" values={ids} onReorder={setLive} className="flex flex-col gap-7">
        {ids.map((key) => {
          const g = byKey.get(key)!;
          return (
            <SortableGroup
              key={key}
              group={g}
              editing={isEditing(g)}
              onDragStart={() => setLive(sortable.map((x) => x.key))}
              onDragEnd={() => {
                const live = liveRef.current;
                setLive(null);
                if (live && live.join() !== sortable.map((x) => x.key).join()) onReorder(live);
              }}
            >
              {renderTasks(g)}
            </SortableGroup>
          );
        })}
      </Reorder.Group>

      {loose && (
        <motion.section
          layout
          aria-label={loose.title}
          className="relative"
          style={{ zIndex: isEditing(loose) ? 10 : undefined }}
        >
          <GroupTitle group={loose} />
          {renderTasks(loose)}
        </motion.section>
      )}
    </div>
  );
}

function SortableGroup({
  group,
  editing,
  onDragStart,
  onDragEnd,
  children,
}: {
  group: Group;
  editing: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  children: ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="section"
      value={group.key}
      dragListener={false}
      dragControls={controls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileDrag={{ scale: 1.015, filter: 'drop-shadow(0 18px 24px rgb(40 25 10 / 0.22))' }}
      aria-label={group.title}
      // Reorder controla z-index en línea; !z-10 deja la tarjeta abierta por encima.
      className={`group/cat relative ${editing ? '!z-10' : ''}`}
    >
      <GroupTitle
        group={group}
        handle={
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              controls.start(e);
            }}
            aria-label={`Arrastrar para ordenar ${group.title}`}
            title="Arrastrar para ordenar"
            className="-ml-1 grid size-7 cursor-grab touch-none place-items-center rounded-lg text-[var(--ink-faint)] transition group-hover/cat:text-[var(--ink-soft)] hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)] hover:!text-[var(--ink)] active:cursor-grabbing"
          >
            <GripIcon width={18} height={18} />
          </button>
        }
      />
      {children}
    </Reorder.Item>
  );
}

function GroupTitle({ group, handle }: { group: Group; handle?: ReactNode }) {
  return (
    <h3 className="mb-2.5 flex items-center gap-2 text-[15px] font-extrabold">
      {handle ?? <span aria-hidden className="-ml-1 size-7" />}
      <span aria-hidden className="text-base">
        {group.emoji}
      </span>
      {group.title}
      <span className="text-sm font-bold text-[var(--ink-faint)] tabular-nums">{group.tasks.length}</span>
    </h3>
  );
}
