import { createApp } from '../config/app';
import { configureDI } from '../infrastructure/di/container';
import 'reflect-metadata';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testApi() {
  try {
    // Configure DI
    await configureDI();
    
    // Create app
    const app = createApp();
    
    console.log('✅ API initialized successfully!');
    console.log('🔧 DI container configured');
    console.log('📝 Authentication routes available:');
    console.log('   POST /api/auth/register');
    console.log('   POST /api/auth/login'); 
    console.log('   POST /api/auth/refresh');
    console.log('   GET /api/auth/profile');
    console.log('📄 Todo routes available (protected):');
    console.log('   GET /api/todos');
    console.log('   POST /api/todos');
    console.log('   PUT /api/todos/:id');
    console.log('   DELETE /api/todos/:id');
    
    return app;
  } catch (error) {
    console.error('❌ API initialization failed:', error);
    throw error;
  }
}

// Run test
if (require.main === module) {
  testApi().catch(console.error);
}

export { testApi };