import { Todo, TodoDomainService } from '@nx-starter/shared-domain';
import { 
  ActiveTodoSpecification, 
  CompletedTodoSpecification, 
  OverdueTodoSpecification,
  HighPriorityTodoSpecification 
} from '@nx-starter/shared-domain';
import type { ITodoRepository } from '@nx-starter/shared-domain';
import type { 
  GetFilteredTodosQuery, 
  GetTodoByIdQuery,
  TodoStatsQueryResult
} from '../../dto/TodoQueries';

/**
 * Query handler for getting all todos
 */
export class GetAllTodosQueryHandler {
  constructor(private todoRepository: ITodoRepository) {}

  async handle(): Promise<Todo[]> {
    return await this.todoRepository.getAll();
  }
}

/**
 * Query handler for getting filtered todos
 */
export class GetFilteredTodosQueryHandler {
  constructor(private todoRepository: ITodoRepository) {}

  async handle(query: GetFilteredTodosQuery): Promise<Todo[]> {
    const allTodos = await this.todoRepository.getAll();
    
    // Apply filter using specifications
    let filteredTodos: Todo[];
    
    switch (query.filter) {
      case 'active': {
        const activeSpec = new ActiveTodoSpecification();
        filteredTodos = allTodos.filter(todo => activeSpec.isSatisfiedBy(todo));
        break;
      }
      case 'completed': {
        const completedSpec = new CompletedTodoSpecification();
        filteredTodos = allTodos.filter(todo => completedSpec.isSatisfiedBy(todo));
        break;
      }
      default:
        filteredTodos = allTodos;
    }

    // Apply sorting using domain service
    if (query.sortBy === 'priority' || query.sortBy === 'urgency') {
      filteredTodos = TodoDomainService.sortByPriority(filteredTodos);
      if (query.sortOrder === 'desc') {
        filteredTodos.reverse();
      }
    } else if (query.sortBy === 'createdAt') {
      filteredTodos.sort((a, b) => {
        const dateComparison = a.createdAt.getTime() - b.createdAt.getTime();
        return query.sortOrder === 'desc' ? -dateComparison : dateComparison;
      });
    }

    return filteredTodos;
  }
}

/**
 * Query handler for getting todo statistics
 */
export class GetTodoStatsQueryHandler {
  constructor(private todoRepository: ITodoRepository) {}

  async handle(): Promise<TodoStatsQueryResult> {
    const allTodos = await this.todoRepository.getAll();
    
    const activeSpec = new ActiveTodoSpecification();
    const completedSpec = new CompletedTodoSpecification();
    const overdueSpec = new OverdueTodoSpecification();
    const highPrioritySpec = new HighPriorityTodoSpecification();

    return {
      total: allTodos.length,
      active: allTodos.filter(todo => activeSpec.isSatisfiedBy(todo)).length,
      completed: allTodos.filter(todo => completedSpec.isSatisfiedBy(todo)).length,
      overdue: allTodos.filter(todo => overdueSpec.isSatisfiedBy(todo)).length,
      highPriority: allTodos.filter(todo => highPrioritySpec.isSatisfiedBy(todo)).length,
    };
  }
}

/**
 * Query handler for getting a single todo by ID
 */
export class GetTodoByIdQueryHandler {
  constructor(private todoRepository: ITodoRepository) {}

  async handle(query: GetTodoByIdQuery): Promise<Todo | null> {
    const todo = await this.todoRepository.getById(query.id);
    return todo || null;
  }
}

/**
 * Query handler for getting active todos
 * Provides compatibility with backend repository patterns
 */
export class GetActiveTodosQueryHandler {
  constructor(private todoRepository: ITodoRepository) {}

  async execute(): Promise<Todo[]> {
    // Use repository method if available, otherwise fall back to specification
    if ('getActive' in this.todoRepository && typeof this.todoRepository.getActive === 'function') {
      return await (this.todoRepository as any).getActive();
    }
    
    // Fallback to specification-based filtering
    const allTodos = await this.todoRepository.getAll();
    const activeSpec = new ActiveTodoSpecification();
    return allTodos.filter(todo => activeSpec.isSatisfiedBy(todo));
  }
}

/**
 * Query handler for getting completed todos
 * Provides compatibility with backend repository patterns
 */
export class GetCompletedTodosQueryHandler {
  constructor(private todoRepository: ITodoRepository) {}

  async execute(): Promise<Todo[]> {
    // Use repository method if available, otherwise fall back to specification
    if ('getCompleted' in this.todoRepository && typeof this.todoRepository.getCompleted === 'function') {
      return await (this.todoRepository as any).getCompleted();
    }
    
    // Fallback to specification-based filtering
    const allTodos = await this.todoRepository.getAll();
    const completedSpec = new CompletedTodoSpecification();
    return allTodos.filter(todo => completedSpec.isSatisfiedBy(todo));
  }
}