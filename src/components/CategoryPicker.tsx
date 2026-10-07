import type { ReactNode } from 'react';
import type { Category } from '../domain/category';
import { Popover } from './Popover';
import { CheckIcon } from './icons';

type Props = {
  categories: Category[];
  value: string | null;
  onChange: (id: string | null) => void;
  onManage: () => void;
  trigger: (toggle: () => void, open: boolean) => ReactNode;
  onOpenChange?: (open: boolean) => void;
  align?: 'left' | 'right';
};

const row =
  'flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-bold transition hover:bg-[color-mix(in_oklab,var(--ink)_6%,transparent)]';

export function CategoryPicker({ categories, value, onChange, onManage, trigger, onOpenChange, align }: Props) {
  return (
    <Popover trigger={trigger} onOpenChange={onOpenChange} align={align} className="w-60">
      {(close) => {
        const pick = (id: string | null) => {
          onChange(id);
          close();
        };
        return (
          <>
            <p className="mb-1 px-1 text-xs font-extrabold tracking-wider text-[var(--ink-faint)] uppercase">Categoría</p>
            <div className="flex max-h-72 flex-col overflow-y-auto">
              {categories.map((c) => (
                <button key={c.id} type="button" onClick={() => pick(c.id)} className={row}>
                  <span className="w-5 text-center">{c.emoji}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  {c.id === value && <CheckIcon width={16} height={16} />}
                </button>
              ))}
              <button type="button" onClick={() => pick(null)} className={`${row} text-[var(--ink-soft)]`}>
                <span className="w-5 text-center">·</span>
                <span className="flex-1">Sin categoría</span>
                {value === null && <CheckIcon width={16} height={16} />}
              </button>
            </div>
            <div className="mt-2 border-t border-[var(--line)] pt-2">
              <button
                type="button"
                onClick={() => {
                  close();
                  onManage();
                }}
                className={`${row} text-[var(--ink-soft)]`}
              >
                Gestionar categorías…
              </button>
            </div>
          </>
        );
      }}
    </Popover>
  );
}
