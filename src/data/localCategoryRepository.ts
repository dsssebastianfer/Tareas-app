import type { Category } from '../domain/category';
import { createLocalRepository } from './Repository';

/** Categorías iniciales: solo se crean la primera vez. */
const seed = (): Category[] => [
  { id: crypto.randomUUID(), name: 'CPHS', emoji: '🛡️', keywords: ['comité paritario', 'paritario'], order: 0 },
  { id: crypto.randomUUID(), name: 'Reuniones', emoji: '👥', keywords: ['reunión', 'junta', 'meet'], order: 1 },
  { id: crypto.randomUUID(), name: 'Procedimientos', emoji: '📋', keywords: ['procedimiento', 'protocolo', 'instructivo'], order: 2 },
];

export const localCategoryRepository = createLocalRepository<Category>('semanas.categories.v1', seed);
