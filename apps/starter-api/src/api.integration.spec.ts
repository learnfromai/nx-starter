import 'reflect-metadata';
import supertest from 'supertest';
import { createApp } from './config/app';
import { configureDI } from './infrastructure/di/container';
import type { Application } from 'express';

describe('Todo API Integration Tests', () => {
  let app: Application;
  let request: any;

  beforeAll(async () => {
    // Configure DI container (now async)
    await configureDI();

    // Create app
    app = createApp();
    request = supertest(app);
  });

  describe('GET /', () => {
    it('should return server information', async () => {
      const response = await request
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Task App API Server',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          todos: '/api/todos',
        },
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return health check', async () => {
      const response = await request
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Server is running',
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Todo CRUD Operations', () => {
    let todoId: string;

    describe('POST /api/todos', () => {
      it('should create a new todo', async () => {
        const todoData = {
          title: 'Integration Test Todo',
          priority: 'high',
        };

        const response = await request
          .post('/api/todos')
          .send(todoData)
          .expect('Content-Type', /json/)
          .expect(201);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            title: 'Integration Test Todo',
            completed: false,
            priority: 'high',
          },
        });

        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.createdAt).toBeDefined();

        todoId = response.body.data.id;
      });

      it('should validate required fields', async () => {
        const response = await request
          .post('/api/todos')
          .send({})
          .expect('Content-Type', /json/)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation failed',
        });
      });

      it('should validate title length', async () => {
        const response = await request
          .post('/api/todos')
          .send({ title: 'x' }) // Too short
          .expect('Content-Type', /json/)
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation failed',
        });
      });
    });

    describe('GET /api/todos', () => {
      it('should return all todos', async () => {
        const response = await request
          .get('/api/todos')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
        });

        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toMatchObject({
          id: expect.any(String),
          title: expect.any(String),
          completed: expect.any(Boolean),
          priority: expect.any(String),
          createdAt: expect.any(String),
        });
      });
    });

    describe('GET /api/todos/:id', () => {
      it('should return specific todo', async () => {
        const response = await request
          .get(`/api/todos/${todoId}`)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            id: todoId,
            title: 'Integration Test Todo',
            completed: false,
            priority: 'high',
          },
        });
      });

      it('should return 404 for non-existent todo', async () => {
        const response = await request
          .get('/api/todos/nonexistent-id')
          .expect('Content-Type', /json/)
          .expect(404);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Todo with ID nonexistent-id not found',
        });
      });
    });

    describe('PUT /api/todos/:id', () => {
      it('should update todo', async () => {
        const updateData = {
          title: 'Updated Integration Test Todo',
          priority: 'medium',
        };

        const response = await request
          .put(`/api/todos/${todoId}`)
          .send(updateData)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          message: 'Todo updated successfully',
        });

        // Verify the update
        const getResponse = await request
          .get(`/api/todos/${todoId}`)
          .expect(200);

        expect(getResponse.body.data).toMatchObject({
          id: todoId,
          title: 'Updated Integration Test Todo',
          priority: 'medium',
        });
      });
    });

    describe('PATCH /api/todos/:id/toggle', () => {
      it('should toggle todo completion', async () => {
        const response = await request
          .patch(`/api/todos/${todoId}/toggle`)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          message: 'Todo toggled successfully',
        });

        // Verify the toggle
        const getResponse = await request
          .get(`/api/todos/${todoId}`)
          .expect(200);

        expect(getResponse.body.data.completed).toBe(true);
      });
    });

    describe('GET /api/todos/stats', () => {
      it('should return statistics', async () => {
        const response = await request
          .get('/api/todos/stats')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            total: expect.any(Number),
            active: expect.any(Number),
            completed: expect.any(Number),
          },
        });

        expect(response.body.data.total).toBeGreaterThan(0);
      });
    });

    describe('GET /api/todos/active', () => {
      it('should return active todos', async () => {
        const response = await request
          .get('/api/todos/active')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
        });

        // All returned todos should be active
        response.body.data.forEach((todo: any) => {
          expect(todo.completed).toBe(false);
        });
      });
    });

    describe('GET /api/todos/completed', () => {
      it('should return completed todos', async () => {
        const response = await request
          .get('/api/todos/completed')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
        });

        // All returned todos should be completed
        response.body.data.forEach((todo: any) => {
          expect(todo.completed).toBe(true);
        });
      });
    });

    describe('DELETE /api/todos/:id', () => {
      it('should delete todo', async () => {
        const response = await request
          .delete(`/api/todos/${todoId}`)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          message: 'Todo deleted successfully',
        });

        // Verify deletion
        await request.get(`/api/todos/${todoId}`).expect(404);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request
        .get('/api/unknown')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Not found',
      });
    });

    it('should handle invalid JSON', async () => {
      const response = await request
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Express handles malformed JSON before our middleware
    });
  });

  describe('User Registration API', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const registerData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password123',
        };

        const response = await request
          .post('/api/auth/register')
          .send(registerData)
          .expect('Content-Type', /json/)
          .expect(201);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            id: expect.any(String),
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            username: 'john.doe',
            fullName: 'John Doe',
            createdAt: expect.any(String),
          },
        });

        // Verify the ID is a valid UUID
        expect(response.body.data.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      });

      it('should generate unique usernames when email prefix conflicts', async () => {
        const firstUser = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'Password123',
        };

        const secondUser = {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'test@different.com',
          password: 'Password456',
        };

        // Register first user
        const response1 = await request
          .post('/api/auth/register')
          .send(firstUser)
          .expect(201);

        expect(response1.body.data.username).toBe('test');

        // Register second user with same username prefix
        const response2 = await request
          .post('/api/auth/register')
          .send(secondUser)
          .expect(201);

        expect(response2.body.data.username).toBe('test1');
      });

      it('should return 409 when email already exists', async () => {
        const userData = {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: 'Password123',
        };

        // Register user first time
        await request
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        // Try to register with same email
        const response = await request
          .post('/api/auth/register')
          .send(userData)
          .expect(409);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Email address already registered',
        });
      });

      it('should validate required fields', async () => {
        const invalidData = {
          firstName: '',
          lastName: 'Doe',
          email: 'invalid-email',
          password: '123', // Too short
        };

        const response = await request
          .post('/api/auth/register')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should validate password strength', async () => {
        const weakPassword = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'weak@example.com',
          password: 'weak', // Missing uppercase, number
        };

        const response = await request
          .post('/api/auth/register')
          .send(weakPassword)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should validate email format', async () => {
        const invalidEmail = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'not-an-email',
          password: 'Password123',
        };

        const response = await request
          .post('/api/auth/register')
          .send(invalidEmail)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should validate name format', async () => {
        const invalidName = {
          firstName: 'John123', // Numbers not allowed
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
        };

        const response = await request
          .post('/api/auth/register')
          .send(invalidName)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });
});
