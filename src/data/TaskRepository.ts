import type { Task } from '../domain/task';
import type { Repository } from './Repository';

export type TaskRepository = Repository<Task>;
