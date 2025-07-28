#!/bin/bash

# =============================================================================
# Railway API Deployment Script
# =============================================================================
# This script prepares the API service for Railway deployment
# Run from the project root directory

set -e

echo "🚀 Preparing API service for Railway deployment..."

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "apps/api" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build the API service and its dependencies
echo "🔨 Building API service..."
pnpm run build:api

# Verify build output
if [ ! -f "dist/apps/api/main.js" ]; then
    echo "❌ Error: API build failed - main.js not found"
    exit 1
fi

if [ ! -f "dist/apps/api/package.json" ]; then
    echo "❌ Error: API build failed - package.json not found"
    exit 1
fi

echo "✅ API service ready for Railway deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repository to Railway"
echo "3. Create a new service for the API"
echo "4. Set the source directory to: apps/api"
echo "5. Configure environment variables using .env.railway as reference"
echo "6. Deploy!"
echo ""
echo "📍 Key files for Railway:"
echo "- apps/api/railway.json (Railway configuration)"
echo "- apps/api/.env.railway (Environment variables template)"
echo "- dist/apps/api/main.js (Built application)"
echo "- dist/apps/api/package.json (Dependencies)"