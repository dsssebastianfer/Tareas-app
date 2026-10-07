import type { Task } from '../domain/task';
import { createLocalRepository } from './Repository';

export const localTaskRepository = createLocalRepository<Task>('semanas.tasks.v1');
