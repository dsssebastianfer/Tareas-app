export type Category = {
  id: string;
  name: string;
  emoji: string;
  /** Palabras que, al aparecer en una tarea, la asignan a esta categoría (además del nombre). */
  keywords: string[];
  order: number;
};

export const EMOJIS = [
  '🛡️', '👥', '📋', '📞', '📧', '📝', '📊', '💼', '🏗️', '⚠️', '🦺', '🧯',
  '🌱', '💰', '🧾', '📚', '🔧', '🎯', '🏠', '🛒', '❤️', '🚗', '✈️', '⭐',
];

/** Minúsculas y sin tildes: «Reunión» → «reunion». */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

/** Singular aproximado: «reuniones» → «reunion», «protocolos» → «protocolo». */
function stem(w: string): string {
  if (w.length > 5 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('s')) return w.slice(0, -1);
  return w;
}

const HASHTAG = /#([\p{L}\p{N}_-]+)/gu;

function categoryForTag(tag: string, categories: Category[]): Category | undefined {
  const t = normalize(tag);
  if (t.length < 2) return undefined;
  return categories.find((c) => normalize(c.name).replace(/\s+/g, '').startsWith(t));
}

/**
 * Detecta la categoría de un texto mientras se escribe.
 * Prioridad: `#etiqueta` explícita; luego el término (nombre o palabra clave) más largo que aparezca.
 * La última palabra, si aún se está escribiendo, también calza por prefijo («reun» → Reuniones).
 */
export function detectCategory(text: string, categories: Category[]): Category | null {
  for (const m of text.matchAll(HASHTAG)) {
    const c = categoryForTag(m[1], categories);
    if (c) return c;
  }

  const norm = normalize(text);
  const words = norm.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (words.length === 0) return null;
  const typing = /[\p{L}\p{N}]$/u.test(norm) ? words[words.length - 1] : null;

  let best: { cat: Category; score: number } | null = null;
  for (const cat of categories) {
    for (const raw of [cat.name, ...cat.keywords]) {
      const term = normalize(raw);
      if (!term) continue;
      let hit = false;
      if (/\s/.test(term)) {
        hit = norm.includes(term);
      } else {
        const s = stem(term);
        hit = words.some(
          (w) =>
            w === term ||
            w === s ||
            (s.length >= 4 && w.startsWith(s) && w.length - s.length <= 3) ||
            (w === typing && w.length >= 4 && s.startsWith(w)),
        );
      }
      if (hit && (!best || term.length > best.score || (term.length === best.score && cat.order < best.cat.order))) {
        best = { cat, score: term.length };
      }
    }
  }
  return best?.cat ?? null;
}

/** Quita del título las `#etiquetas` que corresponden a una categoría. */
export function stripTags(text: string, categories: Category[]): string {
  return text
    .replace(HASHTAG, (full, tag: string) => (categoryForTag(tag, categories) ? '' : full))
    .replace(/\s{2,}/g, ' ')
    .trim();
}
