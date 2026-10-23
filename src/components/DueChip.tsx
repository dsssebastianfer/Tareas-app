import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { dueInfo } from '../domain/due';
import { CalendarIcon, PinIcon } from './icons';

type Props = { dueKey: string; now: Date; activity?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>;

/** Fecha límite (o día de la actividad). El color indica la urgencia. Sin `onClick` es solo informativo. */
export const DueChip = forwardRef<HTMLButtonElement, Props>(function DueChip({ dueKey, now, activity, className = '', ...rest }, ref) {
  const info = dueInfo(dueKey, now, activity);
  const cls = `due-chip due-${info.tone} inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${className}`;
  const content = (
    <>
      {activity ? <PinIcon width={12} height={12} strokeWidth={2.4} /> : <CalendarIcon width={12} height={12} strokeWidth={2.4} />}
      {activity && <span className="sr-only">Actividad:</span>}
      {info.label}
    </>
  );
  if (!rest.onClick) return <span className={cls}>{content}</span>;
  return (
    <button ref={ref} type="button" title={activity ? 'Cambiar día de la actividad' : 'Cambiar fecha límite'} className={`${cls} cursor-pointer transition hover:brightness-95`} {...rest}>
      {content}
    </button>
  );
});
