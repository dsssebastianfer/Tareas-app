import type { Category } from '../domain/category';
import { createLocalRepository } from './Repository';

/** Categorías iniciales: solo se crean la primera vez. */
const seed = (): Category[] => [
  { id: crypto.randomUUID(), name: 'Reuniones', emoji: '👥', keywords: ['reunión', 'junta', 'meet'], order: 0 },
  { id: crypto.randomUUID(), name: 'Informes', emoji: '📝', keywords: ['informe', 'reporte', 'report'], order: 1 },
];

export const localCategoryRepository = createLocalRepository<Category>('semanas.categories.v1', seed);
