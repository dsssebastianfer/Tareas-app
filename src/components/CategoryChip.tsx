import { motion } from 'motion/react';
import type { Category } from '../domain/category';
import { CloseIcon } from './icons';

type Props = {
  category: Category;
  onClick?: () => void;
  /** Muestra una ✕ para quitar la categoría. */
  onRemove?: () => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** En celular, mostrar solo el emoji (para dejar espacio al texto). */
  compactOnPhone?: boolean;
};

export function CategoryChip({ category, onClick, onRemove, size = 'sm', disabled, compactOnPhone }: Props) {
  const text = size === 'sm' ? 'text-xs py-0.5' : 'text-[13px] py-1.5';
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={`cat-chip inline-flex items-center rounded-full font-bold whitespace-nowrap ${text}`}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          title={`Categoría: ${category.name}`}
          aria-label={`Categoría: ${category.name}. Cambiar`}
          className={`inline-flex cursor-pointer items-center gap-1 pl-2.5 disabled:cursor-default ${onRemove ? 'pr-1' : 'pr-2.5'}`}
        >
          <span aria-hidden>{category.emoji}</span>
          <span className={compactOnPhone ? 'max-sm:hidden' : ''}>{category.name}</span>
        </button>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5">
          <span aria-hidden>{category.emoji}</span>
          {category.name}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar categoría ${category.name}`}
          className="mr-1 grid size-5 cursor-pointer place-items-center rounded-full opacity-60 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/15"
        >
          <CloseIcon width={12} height={12} strokeWidth={2.6} />
        </button>
      )}
    </motion.span>
  );
}
