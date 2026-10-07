import type { Reminder } from '../domain/reminder';
import { createLocalRepository } from './Repository';

export const localReminderRepository = createLocalRepository<Reminder>('semanas.reminders.v1');
