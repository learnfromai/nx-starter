#!/bin/bash

# =============================================================================
# Railway Web Deployment Script
# =============================================================================
# This script prepares the web application for Railway deployment
# Run from the project root directory

set -e

echo "🌐 Preparing web application for Railway deployment..."

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "apps/web" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build the web application and its dependencies
echo "🔨 Building web application..."
pnpm run build:web

# Verify build output
if [ ! -f "dist/apps/web/index.html" ]; then
    echo "❌ Error: Web build failed - index.html not found"
    exit 1
fi

if [ ! -d "dist/apps/web/assets" ]; then
    echo "❌ Error: Web build failed - assets directory not found"
    exit 1
fi

echo "✅ Web application ready for Railway deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repository to Railway"
echo "3. Create a new service for the web app"
echo "4. Set the source directory to: apps/web"
echo "5. Configure environment variables using .env.railway as reference"
echo "6. Deploy!"
echo ""
echo "📍 Key files for Railway:"
echo "- apps/web/railway.json (Railway configuration)"
echo "- apps/web/.env.railway (Environment variables template)"
echo "- dist/apps/web/ (Built static files)"
echo ""
echo "💡 Tips:"
echo "- The web app will be served as a static site"
echo "- Update REACT_APP_API_BASE_URL to point to your Railway API service"
echo "- Railway provides automatic HTTPS for both services"