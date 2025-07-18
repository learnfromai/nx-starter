import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { injectable } from 'tsyringe';
import { RouteRegistry } from '../decorators';
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Body,
  Param,
  Query,
  ApiOkResponse,
  ApiCreatedResponse,
  ValidateBody,
} from '../decorators';

// Mock service for testing
@injectable()
class MockTodoService {
  private todos = [
    { id: '1', title: 'Test Todo 1', completed: false },
    { id: '2', title: 'Test Todo 2', completed: true },
  ];

  findAll(query?: any) {
    return this.todos;
  }

  findById(id: string) {
    return this.todos.find(todo => todo.id === id);
  }

  create(data: any) {
    const newTodo = { id: Date.now().toString(), ...data };
    this.todos.push(newTodo);
    return newTodo;
  }

  update(id: string, data: any) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      Object.assign(todo, data);
    }
    return todo;
  }

  delete(id: string) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
    }
  }
}

// Mock validation schema
const createTodoSchema = {
  parse: (data: any) => {
    if (!data.title) {
      throw new Error('Title is required');
    }
    return data;
  },
};

// Test controller using decorators
@Controller('/api/todos')
@injectable()
class TestTodoController {
  constructor(private todoService: MockTodoService) {}

  @Get()
  @ApiOkResponse('Returns all todos')
  async getAllTodos(@Query('limit') limit?: string) {
    const todos = await this.todoService.findAll({ limit });
    return todos;
  }

  @Get('/:id')
  @ApiOkResponse('Returns todo by ID')
  async getTodoById(@Param('id') id: string) {
    const todo = await this.todoService.findById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }
    return todo;
  }

  @Post()
  @ApiCreatedResponse('Todo created successfully')
  @ValidateBody(createTodoSchema)
  async createTodo(@Body() todoData: any) {
    const todo = await this.todoService.create(todoData);
    return todo;
  }

  @Put('/:id')
  @ApiOkResponse('Todo updated successfully')
  async updateTodo(@Param('id') id: string, @Body() todoData: any) {
    const todo = await this.todoService.update(id, todoData);
    if (!todo) {
      throw new Error('Todo not found');
    }
    return { message: 'Todo updated successfully' };
  }

  @Delete('/:id')
  @ApiOkResponse('Todo deleted successfully')
  async deleteTodo(@Param('id') id: string) {
    await this.todoService.delete(id);
    return { message: 'Todo deleted successfully' };
  }
}

describe('Decorator Integration Test', () => {
  let app: express.Application;
  let routeRegistry: RouteRegistry;
  let todoController: TestTodoController;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    routeRegistry = new RouteRegistry();
    const todoService = new MockTodoService();
    todoController = new TestTodoController(todoService);
    
    // Create routes from decorator metadata
    const router = routeRegistry.createRoutes(todoController);
    app.use(router);
  });

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          { id: '1', title: 'Test Todo 1', completed: false },
          { id: '2', title: 'Test Todo 2', completed: true },
        ],
      });
    });

    it('should handle query parameters', async () => {
      const response = await request(app)
        .get('/api/todos?limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Mock service doesn't implement limit
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return todo by ID', async () => {
      const response = await request(app)
        .get('/api/todos/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { id: '1', title: 'Test Todo 1', completed: false },
      });
    });

    it('should return 500 for non-existent todo', async () => {
      const response = await request(app)
        .get('/api/todos/999')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = {
        title: 'New Test Todo',
        completed: false,
      };

      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Test Todo');
      expect(response.body.data.completed).toBe(false);
      expect(response.body.data.id).toBeDefined();
    });

    it('should validate request body', async () => {
      const invalidTodo = {
        completed: false,
        // Missing title
      };

      const response = await request(app)
        .post('/api/todos')
        .send(invalidTodo)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update an existing todo', async () => {
      const updateData = {
        title: 'Updated Todo',
        completed: true,
      };

      const response = await request(app)
        .put('/api/todos/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { message: 'Todo updated successfully' },
      });
    });

    it('should return 500 for non-existent todo', async () => {
      const updateData = {
        title: 'Updated Todo',
        completed: true,
      };

      const response = await request(app)
        .put('/api/todos/999')
        .send(updateData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const response = await request(app)
        .delete('/api/todos/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { message: 'Todo deleted successfully' },
      });
    });
  });

  describe('Route registration', () => {
    it('should register all decorated routes', () => {
      // This test verifies that the RouteRegistry correctly processes all decorators
      const router = routeRegistry.createRoutes(todoController);
      
      expect(router.stack).toHaveLength(5); // 5 routes: GET, GET/:id, POST, PUT/:id, DELETE/:id
      
      const methods = router.stack.map(layer => {
        return Object.keys(layer.route.methods)[0];
      });
      
      expect(methods).toContain('get');
      expect(methods).toContain('post');
      expect(methods).toContain('put');
      expect(methods).toContain('delete');
    });

    it('should handle path combinations correctly', () => {
      const router = routeRegistry.createRoutes(todoController);
      
      const paths = router.stack.map(layer => layer.route.path);
      
      expect(paths).toContain('/api/todos');
      expect(paths).toContain('/api/todos/:id');
    });
  });
});