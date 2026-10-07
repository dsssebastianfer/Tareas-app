import type { CSSProperties } from 'react';
import { weekIndex } from './week';

type Tone = { bg: string; border: string; ink: string; accent: string };
export type WeekColor = { name: string; light: Tone; dark: Tone };

export const PALETTE: WeekColor[] = [
  {
    name: 'durazno',
    light: { bg: '#ffe3cf', border: '#f7c6a3', ink: '#7a3b12', accent: '#f08a4b' },
    dark: { bg: '#3a2a22', border: '#5a3d2c', ink: '#ffd2b3', accent: '#f59a5e' },
  },
  {
    name: 'menta',
    light: { bg: '#d8f1e4', border: '#a9dcc2', ink: '#1f5b40', accent: '#3fae7a' },
    dark: { bg: '#22352c', border: '#2f5040', ink: '#b8ecd2', accent: '#52c48e' },
  },
  {
    name: 'lavanda',
    light: { bg: '#e6e0fb', border: '#c7bdf3', ink: '#43348a', accent: '#7d68e0' },
    dark: { bg: '#2c2840', border: '#433b63', ink: '#d4cbff', accent: '#9783f0' },
  },
  {
    name: 'limón',
    light: { bg: '#fbf1c2', border: '#efdc84', ink: '#6b5300', accent: '#d9b420' },
    dark: { bg: '#37321d', border: '#554b22', ink: '#f6e6a0', accent: '#e5c43a' },
  },
  {
    name: 'cielo',
    light: { bg: '#d9ecfb', border: '#a9d0f2', ink: '#1d4c75', accent: '#4a9be0' },
    dark: { bg: '#1f2f3e', border: '#2d4a63', ink: '#bfdcf7', accent: '#5eaaf0' },
  },
  {
    name: 'rosa',
    light: { bg: '#fbdde6', border: '#f2b4c6', ink: '#7d2643', accent: '#e0668e' },
    dark: { bg: '#3a2430', border: '#5a3447', ink: '#ffc6d7', accent: '#ee7ea2' },
  },
];

export function colorForWeek(weekKey: string): WeekColor {
  const n = PALETTE.length;
  return PALETTE[((weekIndex(weekKey) % n) + n) % n];
}

/** Variables CSS que consume la clase `.wk` (elige claro u oscuro por media query). */
export function weekVars(c: WeekColor): CSSProperties {
  return {
    '--wk-bg-l': c.light.bg,
    '--wk-border-l': c.light.border,
    '--wk-ink-l': c.light.ink,
    '--wk-accent-l': c.light.accent,
    '--wk-bg-d': c.dark.bg,
    '--wk-border-d': c.dark.border,
    '--wk-ink-d': c.dark.ink,
    '--wk-accent-d': c.dark.accent,
  } as CSSProperties;
}

export function confettiColors(c: WeekColor): string[] {
  return [c.light.accent, c.light.border, c.dark.accent, '#ffffff'];
}
