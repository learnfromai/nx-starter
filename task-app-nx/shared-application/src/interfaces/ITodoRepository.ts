import { Todo, Specification } from '@task-app-nx/shared-domain';

export interface ITodoRepository {
  getAll(): Promise<Todo[]>;
  create(todo: Todo): Promise<string>;
  update(id: string, changes: Partial<Todo>): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Todo | undefined>;
  getActive(): Promise<Todo[]>;
  getCompleted(): Promise<Todo[]>;
  findBySpecification(specification: Specification<Todo>): Promise<Todo[]>;
}
