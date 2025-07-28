#!/bin/bash

# Railway.com Deployment Script for API Service
# This script prepares and deploys the API application to Railway

set -e

echo "🚀 Starting Railway API deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run 'railway login' first."
    exit 1
fi

# Build the application
echo "📦 Building application..."
pnpm install --frozen-lockfile
pnpm run build:libs
pnpm run build:api

# Validate build output
if [ ! -d "dist/apps/api" ]; then
    echo "❌ Build failed: dist/apps/api not found"
    exit 1
fi

if [ ! -f "dist/apps/api/main.js" ]; then
    echo "❌ Build failed: main.js not found in dist/apps/api"
    exit 1
fi

echo "✅ Build successful"

# Deploy to Railway
echo "🚢 Deploying to Railway..."

# Check if project exists
if ! railway status &> /dev/null; then
    echo "📝 Creating new Railway project..."
    railway login
    # Project will be created via Railway dashboard or CLI
fi

# Deploy using Dockerfile
cd apps/api
echo "🐳 Deploying API service with Docker..."
railway up --detach

echo "🎉 API deployment initiated!"
echo "📱 Check deployment status: railway status"
echo "📝 View logs: railway logs"
echo "🌐 Open in browser: railway open"

# Return to root directory
cd ../..

echo "✅ API deployment script completed"