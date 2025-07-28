#!/bin/bash

# Railway Docker Build Validation Script
# This script validates that the Docker configurations are correct for Railway deployment

set -e

echo "🚀 Railway Deployment Validation"
echo "================================"

# Check if Docker files exist
echo "📁 Checking Docker configurations..."

if [ ! -f "apps/api/Dockerfile" ]; then
    echo "❌ Missing apps/api/Dockerfile"
    exit 1
fi

if [ ! -f "apps/web/Dockerfile" ]; then
    echo "❌ Missing apps/web/Dockerfile"
    exit 1
fi

if [ ! -f "apps/api/railway.toml" ]; then
    echo "❌ Missing apps/api/railway.toml"
    exit 1
fi

if [ ! -f "apps/web/railway.toml" ]; then
    echo "❌ Missing apps/web/railway.toml"
    exit 1
fi

echo "✅ All Docker and Railway configuration files present"

# Validate Docker file syntax
echo "🔍 Validating Docker file syntax..."

# Check for common issues in API Dockerfile
if ! grep -q "FROM node:20-alpine" apps/api/Dockerfile; then
    echo "❌ API Dockerfile should use node:20-alpine base image"
    exit 1
fi

if ! grep -q "corepack enable" apps/api/Dockerfile; then
    echo "❌ API Dockerfile should enable corepack for pnpm"
    exit 1
fi

if ! grep -q "CMD.*node.*main.js" apps/api/Dockerfile; then
    echo "❌ API Dockerfile should start with 'node main.js'"
    exit 1
fi

# Check for common issues in Web Dockerfile  
if ! grep -q "FROM node:20-alpine AS builder" apps/web/Dockerfile; then
    echo "❌ Web Dockerfile should use multi-stage build with node:20-alpine"
    exit 1
fi

if ! grep -q "FROM nginx:alpine AS production" apps/web/Dockerfile; then
    echo "❌ Web Dockerfile should use nginx:alpine for production"
    exit 1
fi

if ! grep -q "nginx.conf" apps/web/Dockerfile; then
    echo "❌ Web Dockerfile should copy nginx configuration"
    exit 1
fi

echo "✅ Docker file syntax validation passed"

# Check Railway configurations
echo "🚂 Validating Railway configurations..."

if ! grep -q 'builder = "dockerfile"' apps/api/railway.toml; then
    echo "❌ API railway.toml should specify dockerfile builder"
    exit 1
fi

if ! grep -q 'dockerfilePath = "apps/api/Dockerfile"' apps/api/railway.toml; then
    echo "❌ API railway.toml should specify correct dockerfile path"
    exit 1
fi

if ! grep -q 'builder = "dockerfile"' apps/web/railway.toml; then
    echo "❌ Web railway.toml should specify dockerfile builder"
    exit 1
fi

if ! grep -q 'dockerfilePath = "apps/web/Dockerfile"' apps/web/railway.toml; then
    echo "❌ Web railway.toml should specify correct dockerfile path"
    exit 1
fi

echo "✅ Railway configuration validation passed"

# Validate that builds work
echo "🔨 Validating application builds..."

if ! pnpm build:api; then
    echo "❌ API build failed"
    exit 1
fi

if ! pnpm build:web; then
    echo "❌ Web build failed"
    exit 1
fi

echo "✅ Application builds successful"

# Check build outputs
echo "📦 Checking build outputs..."

if [ ! -f "dist/apps/api/main.js" ]; then
    echo "❌ API build output missing (dist/apps/api/main.js)"
    exit 1
fi

if [ ! -f "dist/apps/api/package.json" ]; then
    echo "❌ API package.json not generated in build"
    exit 1
fi

if [ ! -f "dist/apps/web/index.html" ]; then
    echo "❌ Web build output missing (dist/apps/web/index.html)"
    exit 1
fi

echo "✅ Build outputs validated"

# Check environment files
echo "🔧 Checking environment templates..."

if [ ! -f "apps/api/.env.railway.example" ]; then
    echo "❌ Missing API Railway environment template"
    exit 1
fi

if [ ! -f "apps/web/.env.railway.example" ]; then
    echo "❌ Missing Web Railway environment template"  
    exit 1
fi

echo "✅ Environment templates present"

# Final validation
echo ""
echo "🎉 Railway Deployment Validation Complete!"
echo "✅ All configurations are valid and ready for deployment"
echo ""
echo "Next steps:"
echo "1. Push this code to your GitHub repository"
echo "2. Follow the deployment guide in docs/RAILWAY_DEPLOYMENT.md"
echo "3. Create Railway services and set environment variables"
echo "4. Deploy and test your applications"
echo ""