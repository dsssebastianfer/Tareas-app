export type Background = {
  id: string;
  name: string;
  /** CSS de la capa de fondo (imagen o degradado). */
  css: string;
  /** CSS para la miniatura (más liviano). */
  thumb: string;
  suggestedTheme: 'light' | 'dark';
};

export const BACKGROUNDS: Background[] = [
  {
    id: 'bosque',
    name: 'Bosque',
    css: 'url(/bg/bosque-2560.webp) center / cover',
    thumb: 'url(/bg/bosque-thumb.webp) center / cover',
    suggestedTheme: 'light',
  },
  {
    id: 'crema',
    name: 'Crema',
    css: 'linear-gradient(160deg, #f8f1e6, #ecdfcc)',
    thumb: 'linear-gradient(160deg, #f8f1e6, #ecdfcc)',
    suggestedTheme: 'light',
  },
  {
    id: 'atardecer',
    name: 'Atardecer',
    css: 'radial-gradient(70rem 50rem at 15% 10%, #ffd9bf, transparent 60%), radial-gradient(60rem 50rem at 90% 90%, #d9cdfa, transparent 60%), linear-gradient(150deg, #fbe3d1, #e5dcf7)',
    thumb: 'linear-gradient(150deg, #ffd2b3, #d4c8f7)',
    suggestedTheme: 'light',
  },
  {
    id: 'noche',
    name: 'Noche',
    css: 'radial-gradient(60rem 45rem at 20% 0%, #3b2f55, transparent 60%), radial-gradient(55rem 45rem at 100% 100%, #1f3a44, transparent 60%), linear-gradient(160deg, #19161f, #11161c)',
    thumb: 'linear-gradient(160deg, #3b2f55, #1f3a44)',
    suggestedTheme: 'dark',
  },
];

export const findBackground = (id: string) => BACKGROUNDS.find((b) => b.id === id);
