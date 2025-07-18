#!/usr/bin/env node

/**
 * Decorator System Demo Script
 * 
 * This script demonstrates the decorator-based controller patterns
 * by creating a minimal Express.js application with the decorator system.
 * 
 * Usage: node demo-decorator-system.js
 */

import express from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';

// Mock implementations for demonstration
class MockTodoService {
  private todos = [
    { id: '1', title: 'Learn TypeScript Decorators', completed: false },
    { id: '2', title: 'Implement Clean Architecture', completed: true },
    { id: '3', title: 'Build REST API', completed: false },
  ];

  async findAll() {
    return this.todos;
  }

  async findById(id) {
    return this.todos.find(todo => todo.id === id);
  }

  async create(data) {
    const newTodo = { 
      id: Date.now().toString(), 
      title: data.title, 
      completed: false 
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  async update(id, data) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      Object.assign(todo, data);
    }
    return todo;
  }

  async delete(id) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
    }
  }
}

// Register mock service
container.register('TodoService', { useClass: MockTodoService });

// Import decorator system
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
  RouteRegistry,
  UseMiddleware,
  Cache,
  RateLimit,
  Summary,
  ApiTags,
} from '../shared/decorators/index.js';

// Mock validation schema
const createTodoSchema = {
  parse: (data) => {
    if (!data.title) {
      throw new Error('Title is required');
    }
    return data;
  },
};

// Logger middleware
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

// Demo controller using all decorator features
@Controller('/api/demo/todos')
@ApiTags('Demo', 'Todos')
@injectable()
class DemoTodoController {
  constructor(
    @inject('TodoService')
    private todoService
  ) {}

  @Get()
  @Summary('Get all todos')
  @ApiOkResponse('Returns all todos')
  @UseMiddleware(logger)
  @Cache(60) // Cache for 1 minute
  @RateLimit(100, 60000) // 100 requests per minute
  async getAllTodos(@Query('limit') limit) {
    console.log('🔍 Fetching all todos...');
    const todos = await this.todoService.findAll();
    
    if (limit) {
      const limitNum = parseInt(limit, 10);
      return todos.slice(0, limitNum);
    }
    
    return todos;
  }

  @Get('/:id')
  @Summary('Get todo by ID')
  @ApiOkResponse('Returns todo by ID')
  @UseMiddleware(logger)
  @Cache(30) // Cache for 30 seconds
  async getTodoById(@Param('id') id) {
    console.log(`🔍 Fetching todo with ID: ${id}`);
    const todo = await this.todoService.findById(id);
    
    if (!todo) {
      throw new Error('Todo not found');
    }
    
    return todo;
  }

  @Post()
  @Summary('Create a new todo')
  @ApiCreatedResponse('Todo created successfully')
  @UseMiddleware(logger)
  @ValidateBody(createTodoSchema)
  @RateLimit(50, 60000) // 50 requests per minute
  async createTodo(@Body() todoData) {
    console.log('➕ Creating new todo:', todoData);
    const todo = await this.todoService.create(todoData);
    return todo;
  }

  @Put('/:id')
  @Summary('Update a todo')
  @ApiOkResponse('Todo updated successfully')
  @UseMiddleware(logger)
  @ValidateBody(createTodoSchema)
  async updateTodo(@Param('id') id, @Body() todoData) {
    console.log(`✏️  Updating todo ${id}:`, todoData);
    const todo = await this.todoService.update(id, todoData);
    
    if (!todo) {
      throw new Error('Todo not found');
    }
    
    return { message: 'Todo updated successfully', todo };
  }

  @Delete('/:id')
  @Summary('Delete a todo')
  @ApiOkResponse('Todo deleted successfully')
  @UseMiddleware(logger)
  async deleteTodo(@Param('id') id) {
    console.log(`🗑️  Deleting todo with ID: ${id}`);
    await this.todoService.delete(id);
    return { message: 'Todo deleted successfully' };
  }

  @Get('/search')
  @Summary('Search todos')
  @ApiOkResponse('Returns search results')
  @UseMiddleware(logger)
  @Cache(30)
  async searchTodos(@Query('q') searchTerm, @Query('completed') completed) {
    console.log(`🔍 Searching todos: "${searchTerm}", completed: ${completed}`);
    let todos = await this.todoService.findAll();
    
    if (searchTerm) {
      todos = todos.filter(todo => 
        todo.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      todos = todos.filter(todo => todo.completed === isCompleted);
    }
    
    return todos;
  }

  @Get('/stats')
  @Summary('Get todo statistics')
  @ApiOkResponse('Returns todo statistics')
  @UseMiddleware(logger)
  @Cache(120) // Cache for 2 minutes
  async getTodoStats() {
    console.log('📊 Generating todo statistics...');
    const todos = await this.todoService.findAll();
    
    const stats = {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length,
      completionRate: todos.length > 0 ? 
        Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0,
    };
    
    return stats;
  }
}

// Create Express application
const app = express();
app.use(express.json());

// Setup decorator-based routes
const routeRegistry = new RouteRegistry();
const todoController = container.resolve(DemoTodoController);
const router = routeRegistry.createRoutes(todoController);

app.use(router);

// Add a welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Decorator System Demo!',
    endpoints: {
      'GET /api/demo/todos': 'Get all todos',
      'GET /api/demo/todos/:id': 'Get todo by ID',
      'POST /api/demo/todos': 'Create a new todo',
      'PUT /api/demo/todos/:id': 'Update a todo',
      'DELETE /api/demo/todos/:id': 'Delete a todo',
      'GET /api/demo/todos/search': 'Search todos',
      'GET /api/demo/todos/stats': 'Get todo statistics',
    },
    examples: {
      'Create Todo': {
        method: 'POST',
        url: '/api/demo/todos',
        body: { title: 'Learn Decorators' }
      },
      'Search Todos': {
        method: 'GET',
        url: '/api/demo/todos/search?q=typescript&completed=false'
      },
      'Get Stats': {
        method: 'GET',
        url: '/api/demo/todos/stats'
      }
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Error:', error.message);
  res.status(500).json({
    success: false,
    error: error.message,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n🚀 Decorator System Demo Server Started!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:');
  console.log('  GET  /                        - Welcome and API documentation');
  console.log('  GET  /api/demo/todos          - Get all todos');
  console.log('  GET  /api/demo/todos/:id      - Get todo by ID');
  console.log('  POST /api/demo/todos          - Create a new todo');
  console.log('  PUT  /api/demo/todos/:id      - Update a todo');
  console.log('  DELETE /api/demo/todos/:id    - Delete a todo');
  console.log('  GET  /api/demo/todos/search   - Search todos');
  console.log('  GET  /api/demo/todos/stats    - Get todo statistics');
  console.log('\n💡 Try these commands:');
  console.log('  curl http://localhost:3000/');
  console.log('  curl http://localhost:3000/api/demo/todos');
  console.log('  curl -X POST http://localhost:3000/api/demo/todos -H "Content-Type: application/json" -d \'{"title":"Learn Decorators"}\'');
  console.log('  curl "http://localhost:3000/api/demo/todos/search?q=typescript"');
  console.log('  curl http://localhost:3000/api/demo/todos/stats');
  console.log('\n🎯 Features demonstrated:');
  console.log('  ✅ HTTP method decorators (@Get, @Post, @Put, @Delete)');
  console.log('  ✅ Parameter decorators (@Param, @Body, @Query)');
  console.log('  ✅ Validation decorators (@ValidateBody)');
  console.log('  ✅ Response decorators (@ApiOkResponse, @ApiCreatedResponse)');
  console.log('  ✅ Utility decorators (@UseMiddleware, @Cache, @RateLimit)');
  console.log('  ✅ Documentation decorators (@Summary, @ApiTags)');
  console.log('  ✅ Automatic route registration');
  console.log('  ✅ Dependency injection integration');
  console.log('  ✅ Error handling');
  console.log('  ✅ Clean Architecture principles');
  console.log('\n🔧 The decorator system is working! 🎉');
});

export default app;