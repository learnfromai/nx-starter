#!/bin/bash

# Railway Local Development Script
# Simulates Railway environment locally for testing

set -e

echo "🚂 Setting up Railway-like environment for local testing..."

# Set Railway-style environment variables
export NODE_ENV=production
export PORT=8080
export HOST=0.0.0.0
export CORS_ORIGIN=http://localhost:3000
export JWT_SECRET=local-development-secret
export DB_TYPE=sqlite
export DB_ORM=native
export DATABASE_URL=./data/todos.db

# Create data directory if it doesn't exist
mkdir -p ./data

echo "📦 Building application..."
pnpm run build:railway:api

echo "🚀 Starting API server with Railway configuration..."
echo "   Port: $PORT"
echo "   Host: $HOST"
echo "   Environment: $NODE_ENV"
echo "   Database: $DATABASE_URL"
echo ""

cd dist/apps/api
node main.js